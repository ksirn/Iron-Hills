import {
  getActorInjuryInfo,
  getAttackThreshold,
  getEncumbranceInfo,
} from "./actor-state-service.mjs";
import {
  getEquippedShield,
  resolveDefenseContext,
} from "./combat-defense-context-service.mjs";
import { isConditionActive } from "./condition-policy-service.mjs";

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getTargetArmorTier(targetActor, armorTierOverride = undefined) {
  if (armorTierOverride !== undefined) return numberOr(armorTierOverride, 0);
  if (targetActor?.type === "monster") {
    return numberOr(targetActor?.system?.resources?.armor?.physical, 0);
  }
  return numberOr(targetActor?.system?.info?.armorTier, 0);
}

function getDefenseConditionFlags(conditions = {}) {
  return {
    prone: isConditionActive(conditions, "prone"),
    stunned: isConditionActive(conditions, "stunned"),
    sleeping: isConditionActive(conditions, "sleeping"),
    unconscious: isConditionActive(conditions, "unconscious"),
    feared: isConditionActive(conditions, "feared"),
    fleeing: isConditionActive(conditions, "fleeing"),
    exposed: isConditionActive(conditions, "exposed"),
    slowed: isConditionActive(conditions, "slowed"),
    shieldLost: isConditionActive(conditions, "shield_lost"),
  };
}

export function buildTargetDefenseContext(targetActor, {
  targetToken = null,
  surroundCount = 0,
  hasShield = null,
  armorTierOverride = undefined,
  formationContext = null,
  inDarkness = false,
} = {}) {
  const conditions = targetActor?.system?.conditions ?? {};
  const conditionFlags = getDefenseConditionFlags(conditions);
  const shield = getEquippedShield(targetActor);
  const rawHasShield = hasShield ?? Boolean(shield);
  const usableShield = Boolean(rawHasShield && shield && !conditionFlags.shieldLost);
  const targetIsMonster = targetActor?.type === "monster";
  const armorTier = getTargetArmorTier(targetActor, armorTierOverride);
  const resolvedFormationContext = formationContext ?? resolveDefenseContext(targetActor, {
    targetToken,
    surroundCount,
    hasShield: usableShield,
  });

  const thresholdModifiers = {
    hasShield: usableShield,
    isLying: conditionFlags.prone,
    isStunned: conditionFlags.stunned || conditionFlags.sleeping || conditionFlags.unconscious,
    targetFeared: conditionFlags.feared || conditionFlags.fleeing,
    surroundCount,
    inDarkness,
    armorTierOverride: targetIsMonster ? armorTier : undefined,
    formationContext: resolvedFormationContext,
  };
  const threshold = getAttackThreshold(targetActor, thresholdModifiers);

  return {
    targetIsMonster,
    armorTier,
    shield,
    rawHasShield: Boolean(rawHasShield),
    hasShield: usableShield,
    shieldDisabled: conditionFlags.shieldLost,
    conditionFlags,
    formationContext: resolvedFormationContext,
    thresholdModifiers,
    threshold,
  };
}

export function buildAttackRollContext(attacker, target, {
  skillKey = "unarmed",
  skillValueFallback = null,
  hitBonus = 0,
  surroundCount = 0,
  targetToken = null,
  encumbrance = null,
  injuries = null,
  inDarkness = false,
  armorTierOverride = undefined,
  formationContext = null,
} = {}) {
  const skill = attacker?.system?.skills?.[skillKey] ?? null;
  const skillValue = numberOr(skill?.value ?? skillValueFallback, 0);
  const dieSize = Math.max(2, skillValue * 2);
  const resolvedEncumbrance = encumbrance ?? getEncumbranceInfo(attacker);
  const resolvedInjuries = injuries ?? getActorInjuryInfo(attacker);
  const attackPenalty =
    numberOr(resolvedEncumbrance?.attackPenalty, 0) +
    numberOr(resolvedInjuries?.meleePenalty ?? resolvedInjuries?.attackPenalty, 0);
  const resolvedHitBonus = numberOr(hitBonus, 0);
  const targetDefense = buildTargetDefenseContext(target, {
    targetToken,
    surroundCount,
    inDarkness,
    armorTierOverride,
    formationContext,
  });
  const effectiveThreshold = Math.max(1, targetDefense.threshold + attackPenalty - resolvedHitBonus);

  return {
    skill,
    skillValue,
    dieSize,
    encumbrance: resolvedEncumbrance,
    injuries: resolvedInjuries,
    attackPenalty,
    hitBonus: resolvedHitBonus,
    threshold: targetDefense.threshold,
    effectiveThreshold,
    targetDefense,
    defenseContext: targetDefense.formationContext,
  };
}

export function calculateHitChance(attacker, target, {
  skillKey = "unarmed",
  hitBonus = 0,
  skillValueFallback = null,
  surroundCount = 0,
  targetToken = null,
  encumbrance = null,
  injuries = null,
  inDarkness = false,
} = {}) {
  const context = buildAttackRollContext(attacker, target, {
    skillKey,
    hitBonus,
    skillValueFallback,
    surroundCount,
    targetToken,
    encumbrance,
    injuries,
    inDarkness,
  });

  if (!(context.skillValue > 0)) {
    return {
      pct: 0,
      color: "#f87171",
      threshold: context.effectiveThreshold,
      rawThreshold: context.threshold,
      dieSize: context.dieSize,
      attackPenalty: context.attackPenalty,
      hitBonus: context.hitBonus,
      context,
    };
  }

  const successFaces = context.dieSize - context.effectiveThreshold + 1;
  const pct = Math.round(Math.max(0, Math.min(100, (successFaces / context.dieSize) * 100)));
  const color = pct >= 70 ? "#4ade80"
    : pct >= 40 ? "#facc15"
      : "#f87171";

  return {
    pct,
    color,
    threshold: context.effectiveThreshold,
    rawThreshold: context.threshold,
    dieSize: context.dieSize,
    attackPenalty: context.attackPenalty,
    hitBonus: context.hitBonus,
    context,
  };
}
