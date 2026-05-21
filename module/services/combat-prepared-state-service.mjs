import {
  addOrExtendActorCondition,
  buildConditionUpdatePath,
  getActorConditionValue,
} from "./condition-service.mjs";
import { normalizeAttackDamageType } from "./combat-attack-profile-service.mjs";
import {
  getTurnStartDecayConditionKeys,
  isConditionActive,
} from "./condition-policy-service.mjs";

export const RANGED_ATTACK_SKILLS = Object.freeze(["bow", "crossbow", "throwing"]);
const RANGED_ATTACK_SKILL_SET = new Set(RANGED_ATTACK_SKILLS);

export const PREPARED_REACTION_DEFINITIONS = Object.freeze([
  {
    condition: "riposte_ready",
    label: "Рипост",
    requiresShieldBlock: true,
    hitBonus: 2,
  },
  {
    condition: "intercept_ready",
    label: "Перехват",
    requiresIncomingMelee: true,
    hitBonus: 1,
  },
  {
    condition: "counter_ready",
    label: "Контрудар",
    requiresDamage: true,
    hitBonus: 0,
  },
]);

export const PREPARED_TURN_START_CONDITIONS = Object.freeze(getTurnStartDecayConditionKeys());

export const SUPPORT_TECHNIQUE_EFFECTS = Object.freeze({
  counter_after_block: {
    condition: "riposte_ready",
    value: 6,
    label: "Рипост готов",
    text: "Рипост подготовлен: сработает после успешного блока щитом.",
  },
  reaction_interrupt: {
    condition: "intercept_ready",
    value: 6,
    label: "Перехват готов",
    text: "Перехват подготовлен: сработает на ближайшую физическую melee-атаку.",
  },
  auto_counter_on_hit: {
    condition: "counter_ready",
    value: 6,
    label: "Контрудар готов",
    text: "Контрудар подготовлен: сработает после полученного урона.",
  },
  formation_stance: {
    condition: "formation_stance",
    value: 6,
    label: "Строй",
    text: "Стойка строя активна до начала следующего хода.",
  },
  shield_wall_formation: {
    condition: "shield_wall_formation",
    value: 6,
    label: "Стена щитов",
    text: "Стена щитов активна до начала следующего хода.",
  },
  aim_bonus_3_next_shot: {
    condition: "aimed_shot_bonus",
    value: 3,
    label: "Прицел",
    text: "Прицел подготовлен: следующий дальний бросок получает +3 к попаданию.",
  },
  passive_no_reload_penalty: {
    condition: "rapid_reload",
    value: 999,
    label: "Быстрая перезарядка",
    text: "Пассив быстрой перезарядки отмечен на персонаже.",
  },
});

function getConditionValue(actor, key) {
  return Math.max(0, Number(getActorConditionValue(actor, key) || 0));
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

function isIncomingMelee(sourceSkillKey) {
  const key = String(sourceSkillKey ?? "");
  return key && !RANGED_ATTACK_SKILL_SET.has(key);
}

export function getSupportTechniqueConfig(special) {
  return SUPPORT_TECHNIQUE_EFFECTS[String(special ?? "").trim()] ?? null;
}

export function isSupportTechniqueSpecial(special) {
  return Boolean(getSupportTechniqueConfig(special));
}

export async function applyPreparedTechniqueEffect({ actor = null, technique = null } = {}) {
  const config = getSupportTechniqueConfig(technique?.effect?.special);
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
  if (!actor || !RANGED_ATTACK_SKILL_SET.has(String(skillKey ?? ""))) {
    return { hitBonus: 0, lines: [] };
  }

  const aimedBonus = getConditionValue(actor, "aimed_shot_bonus");
  if (!(aimedBonus > 0)) return { hitBonus: 0, lines: [] };

  await actor.update({ [buildConditionUpdatePath("aimed_shot_bonus")]: 0 });
  return {
    hitBonus: aimedBonus,
    lines: [`Прицел: +${aimedBonus} к попаданию, бонус израсходован.`],
  };
}

export function getPreparedReaction(defender, result, {
  sourceSkillKey = "",
  sourceDamageType = "physical",
} = {}) {
  if (!actorCanReact(defender)) return null;
  if (result?.targetKilled) return null;

  const incomingMelee = isIncomingMelee(sourceSkillKey);
  const physical = normalizeAttackDamageType(sourceDamageType) === "physical";

  for (const reaction of PREPARED_REACTION_DEFINITIONS) {
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
  return { ok: true, condition: reaction.condition };
}
