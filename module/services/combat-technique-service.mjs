import { getCombatParticipantByActor } from "./combat-flow-service.mjs";
import {
  addOrExtendActorCondition,
  buildConditionUpdatePath,
  getActorConditionValue
} from "./condition-service.mjs";
import { num } from "../utils/math-utils.mjs";

const SUPPORT_TECHNIQUE_EFFECTS = {
  counter_after_block: {
    condition: "riposte_ready",
    value: 6,
    label: "Рипост готов",
    text: "Рипост подготовлен: используйте его после успешного блока.",
  },
  reaction_interrupt: {
    condition: "intercept_ready",
    value: 6,
    label: "Перехват готов",
    text: "Перехват подготовлен: можно использовать как реакцию на ближнюю атаку.",
  },
  auto_counter_on_hit: {
    condition: "counter_ready",
    value: 6,
    label: "Контрудар готов",
    text: "Контрудар подготовлен: реакция доступна до начала следующего хода.",
  },
  formation_stance: {
    condition: "formation_stance",
    value: 6,
    label: "Строй",
    text: "Стойка строя активна: защита повышена до начала следующего хода.",
  },
  shield_wall_formation: {
    condition: "shield_wall_formation",
    value: 6,
    label: "Стена щитов",
    text: "Стена щитов активна: защита повышена до начала следующего хода.",
  },
  aim_bonus_3_next_shot: {
    condition: "aimed_shot_bonus",
    value: 3,
    label: "Прицел",
    text: "Прицеливание подготовлено: следующий дальний выстрел получает +3 к попаданию.",
  },
  passive_no_reload_penalty: {
    condition: "rapid_reload",
    value: 999,
    label: "Быстрая перезарядка",
    text: "Пассив быстрой перезарядки отмечен на персонаже.",
  },
};

const RANGED_ATTACK_SKILLS = new Set(["bow", "crossbow", "throwing"]);

function getRatio(value, max) {
  const safeMax = Math.max(1, num(max, 1));
  return Math.max(0, Math.min(1, num(value, 0) / safeMax));
}

export function getTechniqueHitBonus(effect = {}) {
  const specialBonus = effect?.special === "choose_zone" ? 2 : 0;
  return Number(effect?.hitBonus ?? effect?.hitPenalty ?? 0) + specialBonus;
}

export function isTechniqueSupportAction(technique = null) {
  const special = String(technique?.effect?.special ?? "").trim();
  return Boolean(SUPPORT_TECHNIQUE_EFFECTS[special]);
}

export function getTechniqueSupportEnergyCost(technique = null) {
  return Math.max(0, Number(technique?.energyCost ?? 0));
}

export async function applyTechniqueSupportEffect({ actor = null, technique = null } = {}) {
  const special = String(technique?.effect?.special ?? "").trim();
  const config = SUPPORT_TECHNIQUE_EFFECTS[special];
  if (!actor || !config) {
    return { ok: false, lines: [], conditions: [] };
  }

  const applied = await addOrExtendActorCondition(actor, config.condition, config.value, {
    mode: "max",
    valueKind: "duration",
  });

  return {
    ok: true,
    lines: [config.text],
    conditions: [{ ...applied, label: config.label }],
  };
}

export async function consumePreparedAttackBonus(actor, { skillKey = "" } = {}) {
  if (!actor || !RANGED_ATTACK_SKILLS.has(String(skillKey ?? ""))) {
    return { hitBonus: 0, lines: [] };
  }

  const aimedBonus = Math.max(0, Number(getActorConditionValue(actor, "aimed_shot_bonus") || 0));
  if (!(aimedBonus > 0)) return { hitBonus: 0, lines: [] };

  await actor.update({ [buildConditionUpdatePath("aimed_shot_bonus")]: 0 });
  return {
    hitBonus: aimedBonus,
    lines: [`Прицел: +${aimedBonus} к попаданию, бонус израсходован.`],
  };
}

function getActorTorsoHpRatio(actor) {
  const hp = actor?.system?.resources?.hp ?? {};
  if (hp.torso) return getRatio(hp.torso.value, hp.torso.max);
  if (hp.value !== undefined) return getRatio(hp.value, hp.max);
  return 1;
}

function actorHasCondition(actor, keys = []) {
  const conditions = actor?.system?.conditions ?? {};
  return keys.some(key => {
    const value = conditions?.[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    if (value && typeof value === "object") {
      if (typeof value.value === "number") return value.value > 0;
      if (typeof value.active === "boolean") return value.active;
    }
    return false;
  });
}

function isFirstCombatAction(actor) {
  const participant = getCombatParticipantByActor(actor);
  if (!participant) return true;
  return !participant.hasActed;
}

function hasHiddenOrFlankAdvantage(attacker, target) {
  return actorHasCondition(attacker, ["hidden", "stealthed", "invisible"])
    || actorHasCondition(target, ["exposed", "flanked", "surrounded"]);
}

export function getTechniqueDamageContext(effect = {}, { attacker = null, target = null } = {}) {
  const multiplier = Number(effect?.damage ?? 1);
  const notes = [];

  if (effect?.special === "execute_low_hp") {
    const allowed = target && getActorTorsoHpRatio(target) < 0.3;
    notes.push(allowed ? "Казнь: цель ниже 30% HP." : "Казнь: цель не ниже 30% HP, бонус урона не применён.");
    return { multiplier: allowed ? multiplier : 1, notes, rangeOverride: null };
  }

  if (effect?.special === "first_strike_only") {
    const allowed = isFirstCombatAction(attacker);
    notes.push(allowed ? "Первый удар: бонус урона применён." : "Первый удар: персонаж уже действовал, бонус урона не применён.");
    return { multiplier: allowed ? multiplier : 1, notes, rangeOverride: null };
  }

  if (effect?.special === "requires_hidden_or_flank") {
    const allowed = hasHiddenOrFlankAdvantage(attacker, target);
    notes.push(allowed ? "Скрытность/фланг: бонус урона применён." : "Скрытность/фланг не подтверждены, бонус урона не применён.");
    return { multiplier: allowed ? multiplier : 1, notes, rangeOverride: null };
  }

  if (effect?.special === "counter_after_block") {
    notes.push("Рипост требует успешного блока; автоматического триггера пока нет.");
    return { multiplier: 1, notes, rangeOverride: null };
  }

  if (effect?.special === "throw_weapon_ranged_3") {
    notes.push("Метательное оружие: дальность 3 клетки; расход оружия пока не автоматизирован.");
    return { multiplier, notes, rangeOverride: 3 };
  }

  return { multiplier, notes, rangeOverride: null };
}

export function getTechniqueAoeConfig(effect = {}) {
  const raw = String(effect?.aoe ?? "");
  const isRanged = raw.startsWith("ranged");
  const maxTargetsMatch = raw.match(/(\d+)\s*targets?/);
  const maxTargets = maxTargetsMatch ? Number(maxTargetsMatch[1]) : null;

  if (raw === "melee_adjacent") {
    return {
      shape: "circle",
      type: "nova",
      distance: 1,
      maxTargets: null,
      chainDecay: 1,
    };
  }

  return {
    shape: effect?.aoeShape ?? (isRanged ? "circle" : "circle"),
    type: effect?.aoeType ?? (maxTargets ? "shards" : "blast"),
    distance: Number(effect?.aoeDistance ?? (isRanged ? 4 : 1)),
    maxTargets,
    chainDecay: Number(effect?.chainDecay ?? 1),
  };
}

export function buildTechniqueAttackParams({ baseParams = {}, technique = null, attacker = null, target = null, targetZoneChoice = null } = {}) {
  const effect = technique?.effect ?? {};
  const damageContext = getTechniqueDamageContext(effect, { attacker, target });
  const damageMultiplier = damageContext.multiplier;
  const chosenZone = targetZoneChoice?.key ?? targetZoneChoice ?? null;
  const labelSuffix = targetZoneChoice?.label ? ` → ${targetZoneChoice.label}` : "";
  const defaultConditionDuration = effect.special === "knockback_1" ? 6 : 0;

  return {
    ...baseParams,
    label: `${baseParams.label}: ${technique?.label ?? ""}${labelSuffix}`,
    baseDamage: Math.round(Number(baseParams.baseDamage ?? 1) * damageMultiplier),
    energyCost: Number(baseParams.energyCost ?? 0) + Number(technique?.energyCost ?? 0),
    ignoreArmor: effect.ignoreArmor ?? 0,
    hitBonus: getTechniqueHitBonus(effect),
    targetZone: chosenZone ?? effect.targetZone ?? null,
    technique,
    applyCondition: effect.applyCondition ?? null,
    conditionDuration: effect.conditionDuration ?? defaultConditionDuration,
    conditionChance: effect.conditionChance ?? 1.0,
    effectNotes: damageContext.notes,
    rangeOverride: damageContext.rangeOverride,
  };
}
