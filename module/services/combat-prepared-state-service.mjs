import {
  addOrExtendActorCondition,
  buildConditionUpdatePath,
  getActorConditionValue,
} from "./condition-service.mjs";
import {
  NON_MELEE_ATTACK_SKILLS,
  normalizeAttackMode,
} from "./combat-attack-mode-service.mjs";
import { normalizeAttackDamageType } from "./combat-attack-profile-service.mjs";
import { getEquippedShield } from "./combat-defense-context-service.mjs";
import {
  isConditionActive,
} from "./condition-policy-service.mjs";
import { isShieldBlockableDamageType } from "./damage-type-service.mjs";
import { getWeaponRange } from "../utils/item-utils.mjs";

const FLAG_NAMESPACE = "iron-hills-system";
const PREPARED_TECHNIQUE_FLAG = "preparedCombatTechniques";

export const RANGED_ATTACK_SKILLS = NON_MELEE_ATTACK_SKILLS;
const RANGED_ATTACK_SKILL_SET = new Set(RANGED_ATTACK_SKILLS);

export const PREPARED_REACTION_DEFINITIONS = Object.freeze([
  {
    condition: "riposte_ready",
    label: "Рипост",
    phase: "post-hit",
    requiresShieldBlock: true,
    damageMultiplier: 2,
    hitBonus: 2,
  },
  {
    condition: "intercept_ready",
    label: "Перехват",
    phase: "pre-hit",
    requiresIncomingMelee: true,
    interruptsOnHit: true,
    damageMultiplier: 1,
    hitBonus: 1,
  },
  {
    condition: "counter_ready",
    label: "Контрудар",
    phase: "post-hit",
    requiresDamage: true,
    damageMultiplier: 0.8,
    hitBonus: 0,
  },
]);

export const PREPARED_TURN_START_CONDITIONS = Object.freeze([
  "aimed_shot_bonus",
  "formation_stance",
  "shield_wall_formation",
  "riposte_ready",
  "counter_ready",
  "intercept_ready",
]);

export const SUPPORT_TECHNIQUE_EFFECTS = Object.freeze({
  counter_after_block: {
    condition: "riposte_ready",
    value: 6,
    label: "Рипост готов",
    text: "Рипост подготовлен: сработает после успешного блока щитом.",
    requiresShield: true,
    requiresWeapon: true,
    kind: "reaction",
  },
  reaction_interrupt: {
    condition: "intercept_ready",
    value: 6,
    label: "Перехват готов",
    text: "Перехват подготовлен: сработает на ближайшую физическую melee-атаку.",
    requiresWeapon: true,
    kind: "reaction",
  },
  auto_counter_on_hit: {
    condition: "counter_ready",
    value: 6,
    label: "Контрудар готов",
    text: "Контрудар подготовлен: сработает после полученного урона.",
    requiresWeapon: true,
    kind: "reaction",
  },
  formation_stance: {
    condition: "formation_stance",
    value: 6,
    label: "Строй",
    text: "Стойка строя активна до начала следующего хода.",
    kind: "stance",
  },
  shield_wall_formation: {
    condition: "shield_wall_formation",
    value: 6,
    label: "Стена щитов",
    text: "Стена щитов активна до начала следующего хода.",
    requiresShield: true,
    kind: "stance",
  },
  aim_bonus_3_next_shot: {
    condition: "aimed_shot_bonus",
    value: 3,
    label: "Прицел",
    text: "Прицел подготовлен: следующий дальний бросок получает +3 к попаданию.",
    requiresWeapon: true,
    kind: "attack-bonus",
  },
  passive_no_reload_penalty: {
    condition: "rapid_reload",
    value: 999,
    label: "Быстрая перезарядка",
    text: "Пассив быстрой перезарядки отмечен на персонаже.",
    kind: "passive",
  },
});

function cloneData(value) {
  if (value == null) return value;
  if (globalThis.foundry?.utils?.deepClone) return globalThis.foundry.utils.deepClone(value);
  if (globalThis.foundry?.utils?.duplicate) return globalThis.foundry.utils.duplicate(value);
  return JSON.parse(JSON.stringify(value));
}

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getConditionValue(actor, key) {
  return Math.max(0, Number(getActorConditionValue(actor, key) || 0));
}

function getPreparedTechniqueStore(actor) {
  const fromGetter = actor?.getFlag?.(FLAG_NAMESPACE, PREPARED_TECHNIQUE_FLAG);
  const store = fromGetter ?? actor?.flags?.[FLAG_NAMESPACE]?.[PREPARED_TECHNIQUE_FLAG] ?? {};
  return store && typeof store === "object" ? store : {};
}

async function setPreparedTechniqueStore(actor, store = {}) {
  if (!actor) return;
  const next = cloneData(store) ?? {};
  if (actor.setFlag) {
    await actor.setFlag(FLAG_NAMESPACE, PREPARED_TECHNIQUE_FLAG, next);
    return;
  }
  await actor.update?.({ [`flags.${FLAG_NAMESPACE}.${PREPARED_TECHNIQUE_FLAG}`]: next });
}

function getTechniqueEffectHitBonus(effect = {}) {
  return numberOr(effect.hitBonus ?? effect.hitPenalty, 0);
}

function getWeaponBaseDamage(weapon) {
  return numberOr(weapon?.system?.damage, 0);
}

function getEquippedWeaponSlot(actor, weapon) {
  if (!actor || !weapon?.id) return "";
  const equipment = actor.system?.equipment ?? {};
  for (const slot of ["rightHand", "leftHand"]) {
    if (equipment?.[slot] === weapon.id) return slot;
  }
  return "";
}

function getTechniqueRangeOverride(effect = {}) {
  const range = numberOr(effect.rangeOverride ?? effect.range, 0);
  return range > 0 ? range : null;
}

function getTechniqueTargetZone(effect = {}) {
  const zone = String(effect.targetZone ?? "").trim();
  return zone || null;
}

function buildPreparedTechniquePayload({ actor = null, technique = null, weapon = null, config = null } = {}) {
  const effect = technique?.effect ?? {};
  const damageMultiplier = Math.max(0, numberOr(effect.damage, config?.damageMultiplier ?? 1));
  const weaponRange = weapon ? getWeaponRange(weapon) : null;
  const skillKey = technique?.skill ?? weapon?.system?.skill ?? "";
  const rangeOverride = getTechniqueRangeOverride(effect);

  return {
    special: String(effect.special ?? ""),
    condition: config?.condition ?? "",
    kind: config?.kind ?? "prepared",
    techniqueId: technique?.id ?? "",
    techniqueLabel: technique?.label ?? config?.label ?? "",
    icon: technique?.icon ?? "",
    skillKey,
    weaponId: weapon?.id ?? "",
    weaponName: weapon?.name ?? "",
    weaponSlot: getEquippedWeaponSlot(actor, weapon),
    requiresWeapon: Boolean(config?.requiresWeapon),
    baseDamage: getWeaponBaseDamage(weapon),
    damageMultiplier,
    damageType: normalizeAttackDamageType(weapon?.system?.damageType),
    hitBonus: getTechniqueEffectHitBonus(effect),
    ignoreArmor: Math.max(0, numberOr(effect.ignoreArmor, 0)),
    rangeOverride,
    weaponRange,
    attackMode: normalizeAttackMode(effect.attackMode, {
      skillKey,
      weapon,
      technique,
      rangeOverride,
    }),
    targetZone: getTechniqueTargetZone(effect),
    targetZoneMode: effect.targetZoneMode ?? null,
  };
}

export function getPreparedTechniquePayload(actor, condition) {
  const key = String(condition ?? "");
  if (!key) return null;
  return getPreparedTechniqueStore(actor)?.[key] ?? null;
}

export async function clearPreparedTechniquePayload(actor, condition) {
  const key = String(condition ?? "");
  if (!actor || !key) return;
  const store = { ...getPreparedTechniqueStore(actor) };
  if (store[key] === undefined) return;
  delete store[key];
  await setPreparedTechniqueStore(actor, store);
}

async function setPreparedTechniquePayload(actor, condition, payload) {
  const key = String(condition ?? "");
  if (!actor || !key) return;
  const store = { ...getPreparedTechniqueStore(actor) };
  store[key] = cloneData(payload);
  await setPreparedTechniqueStore(actor, store);
}

function actorCanReact(actor) {
  if (!actor) return false;
  const conditions = actor.system?.conditions ?? {};
  return !(
    isConditionActive(conditions, "unconscious") ||
    isConditionActive(conditions, "stunned") ||
    isConditionActive(conditions, "sleeping")
  );
}

function isIncomingMelee(sourceSkillKey, sourceAttackMode = null) {
  const attackMode = normalizeAttackMode(sourceAttackMode, { skillKey: sourceSkillKey });
  return attackMode === "melee";
}

export function getSupportTechniqueConfig(special) {
  return SUPPORT_TECHNIQUE_EFFECTS[String(special ?? "").trim()] ?? null;
}

export function isSupportTechniqueSpecial(special) {
  return Boolean(getSupportTechniqueConfig(special));
}

export function validatePreparedTechniqueEffect({ actor = null, technique = null, weapon = null } = {}) {
  const config = getSupportTechniqueConfig(technique?.effect?.special);
  if (!actor || !config) {
    return {
      ok: false,
      reason: "missing-support-technique",
      message: "Приём не поддерживает подготовленное действие.",
    };
  }

  if (!actorCanReact(actor)) {
    return {
      ok: false,
      reason: "actor-incapacitated",
      message: `${config.label}: персонаж не может подготовить действие в текущем состоянии.`,
    };
  }

  if (config.requiresShield && !getEquippedShield(actor)) {
    return {
      ok: false,
      reason: "missing-shield",
      message: `${config.label}: нужен экипированный щит.`,
    };
  }

  if (config.requiresWeapon && !weapon) {
    return {
      ok: false,
      reason: "missing-weapon",
      message: `${config.label}: нужно оружие, которым будет выполнено подготовленное действие.`,
    };
  }

  if (weapon && technique?.skill && String(weapon.system?.skill ?? "") !== String(technique.skill)) {
    return {
      ok: false,
      reason: "weapon-skill-mismatch",
      message: `${technique.label ?? config.label}: оружие не соответствует навыку приёма.`,
    };
  }

  return { ok: true, config };
}

export async function applyPreparedTechniqueEffect({ actor = null, technique = null, weapon = null } = {}) {
  const validation = validatePreparedTechniqueEffect({ actor, technique, weapon });
  const config = validation.config;
  if (!validation.ok) {
    return {
      ok: false,
      reason: validation.reason,
      lines: [validation.message],
      conditions: [],
    };
  }

  const applied = await addOrExtendActorCondition(actor, config.condition, config.value, {
    mode: config.mode ?? "max",
    valueKind: config.valueKind ?? null,
  });
  await setPreparedTechniquePayload(actor, config.condition, buildPreparedTechniquePayload({
    actor,
    technique,
    weapon,
    config,
  }));

  return {
    ok: true,
    lines: [config.text],
    conditions: [{ ...applied, label: config.label }],
  };
}

export async function consumePreparedAttackBonus(actor, { skillKey = "", weapon = null } = {}) {
  if (!actor || !RANGED_ATTACK_SKILL_SET.has(String(skillKey ?? ""))) {
    return { consumed: false, hitBonus: 0, lines: [] };
  }

  const aimedBonus = getConditionValue(actor, "aimed_shot_bonus");
  if (!(aimedBonus > 0)) return { consumed: false, hitBonus: 0, lines: [] };

  const payload = getPreparedTechniquePayload(actor, "aimed_shot_bonus");
  const preparedSkill = String(payload?.skillKey ?? "");
  if (preparedSkill && preparedSkill !== String(skillKey ?? "")) {
    return { consumed: false, hitBonus: 0, lines: [], reason: "skill-mismatch", payload };
  }

  const preparedWeaponId = String(payload?.weaponId ?? "");
  const currentWeaponId = String(weapon?.id ?? "");
  if (preparedWeaponId && preparedWeaponId !== currentWeaponId) {
    return { consumed: false, hitBonus: 0, lines: [], reason: "weapon-mismatch", payload };
  }

  await actor.update({ [buildConditionUpdatePath("aimed_shot_bonus")]: 0 });
  await clearPreparedTechniquePayload(actor, "aimed_shot_bonus");
  return {
    consumed: true,
    hitBonus: aimedBonus,
    lines: [`Прицел: +${aimedBonus} к попаданию, бонус израсходован.`],
    payload,
  };
}

export function getPreparedReaction(defender, result, {
  sourceSkillKey = "",
  sourceAttackMode = null,
  sourceDamageType = "physical",
  phase = "post-hit",
} = {}) {
  if (!actorCanReact(defender)) return null;
  if (result?.targetKilled) return null;

  const incomingMelee = isIncomingMelee(sourceSkillKey, sourceAttackMode ?? result?.attackMode);
  const physical = isShieldBlockableDamageType(sourceDamageType);

  for (const reaction of PREPARED_REACTION_DEFINITIONS) {
    if (phase && reaction.phase !== phase) continue;
    if (getConditionValue(defender, reaction.condition) <= 0) continue;
    if (reaction.requiresShieldBlock && !result?.shieldBlock?.success) continue;
    if (reaction.requiresDamage && !(result?.hit && Number(result?.finalDamage ?? 0) > 0)) continue;
    if (reaction.requiresIncomingMelee && !(incomingMelee && physical)) continue;
    return reaction;
  }

  return null;
}

export async function consumePreparedReaction(actor, reaction) {
  if (!actor || !reaction?.condition) return { ok: false };
  await actor.update({ [buildConditionUpdatePath(reaction.condition)]: 0 });
  await clearPreparedTechniquePayload(actor, reaction.condition);
  return { ok: true, condition: reaction.condition };
}
