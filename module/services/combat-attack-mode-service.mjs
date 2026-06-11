export const ATTACK_MODE_KEYS = Object.freeze(["melee", "ranged", "throw", "cast"]);
export const RANGED_ATTACK_SKILLS = Object.freeze(["bow", "crossbow"]);
export const THROW_ATTACK_SKILLS = Object.freeze(["throwing"]);
export const NON_MELEE_ATTACK_SKILLS = Object.freeze([
  ...RANGED_ATTACK_SKILLS,
  ...THROW_ATTACK_SKILLS,
]);

const ATTACK_MODE_SET = new Set(ATTACK_MODE_KEYS);
const RANGED_SKILL_SET = new Set(RANGED_ATTACK_SKILLS);
const THROW_SKILL_SET = new Set(THROW_ATTACK_SKILLS);
const ATTACK_MODE_ALIASES = Object.freeze({
  range: "ranged",
  missile: "ranged",
  bow: "ranged",
  crossbow: "ranged",
  thrown: "throw",
  throwing: "throw",
  throwable: "throw",
  spell: "cast",
  magic: "cast",
});

function cleanKey(value) {
  return String(value ?? "").trim();
}

function boolLike(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  const text = cleanKey(value).toLowerCase();
  if (!text) return false;
  return ["true", "1", "yes", "on", "ranged"].includes(text);
}

export function normalizeAttackMode(mode = null, {
  skillKey = "",
  weapon = null,
  technique = null,
  rangeOverride = null,
} = {}) {
  const explicit = cleanKey(mode).toLowerCase();
  if (ATTACK_MODE_SET.has(explicit)) return explicit;
  if (ATTACK_MODE_ALIASES[explicit]) return ATTACK_MODE_ALIASES[explicit];

  const weaponMode = cleanKey(weapon?.system?.attackMode).toLowerCase();
  if (ATTACK_MODE_SET.has(weaponMode)) return weaponMode;
  if (ATTACK_MODE_ALIASES[weaponMode]) return ATTACK_MODE_ALIASES[weaponMode];

  const effectMode = cleanKey(technique?.effect?.attackMode).toLowerCase();
  if (ATTACK_MODE_SET.has(effectMode)) return effectMode;
  if (ATTACK_MODE_ALIASES[effectMode]) return ATTACK_MODE_ALIASES[effectMode];

  const skill = cleanKey(skillKey || weapon?.system?.skill).toLowerCase();
  if (THROW_SKILL_SET.has(skill)) return "throw";
  if (RANGED_SKILL_SET.has(skill)) return "ranged";

  if (boolLike(weapon?.system?.ranged) || boolLike(technique?.effect?.ranged)) return "ranged";

  const special = cleanKey(technique?.effect?.special);
  const forcedRange = Number(rangeOverride ?? technique?.effect?.rangeOverride ?? technique?.effect?.range ?? 0);
  if (special === "throw_weapon_ranged_3" || (forcedRange > 1 && boolLike(technique?.effect?.treatAsRanged))) {
    return "throw";
  }

  return "melee";
}

export function isRangedAttackMode(mode) {
  const normalized = normalizeAttackMode(mode);
  return normalized === "ranged" || normalized === "throw";
}

export function getAttackInjuryPenalty(injuries = {}, mode = "melee") {
  const normalized = normalizeAttackMode(mode);
  if (normalized === "cast") {
    return Number(injuries.castPenalty ?? injuries.attackPenalty ?? 0);
  }
  if (normalized === "throw" || normalized === "ranged") {
    return Number(injuries.throwPenalty ?? injuries.attackPenalty ?? 0);
  }
  return Number(injuries.meleePenalty ?? injuries.attackPenalty ?? 0);
}

export function getAttackBlockState(derivedConditions = {}, mode = "melee") {
  const normalized = normalizeAttackMode(mode);

  if (normalized === "cast") {
    return {
      mode: normalized,
      canAttack: derivedConditions.canCast !== false,
      reason: derivedConditions.castBlockReason || "",
    };
  }

  if (normalized === "throw" || normalized === "ranged") {
    return {
      mode: normalized,
      canAttack: derivedConditions.canThrow !== false,
      reason: derivedConditions.throwBlockReason || "",
    };
  }

  return {
    mode: normalized,
    canAttack: derivedConditions.canMeleeAttack !== false,
    reason: derivedConditions.meleeBlockReason || "",
  };
}

export function getAttackModeLabel(mode = "melee") {
  const normalized = normalizeAttackMode(mode);
  return ({
    melee: "Melee",
    ranged: "Ranged",
    throw: "Throw",
    cast: "Cast",
  })[normalized] ?? normalized;
}
