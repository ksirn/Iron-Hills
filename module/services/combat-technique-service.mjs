import { normalizeAoeConfig } from "./aoe-policy-service.mjs";
import { normalizeAttackMode } from "./combat-attack-mode-service.mjs";
import { getCombatParticipantByActor } from "./combat-flow-service.mjs";
import {
  applyPreparedTechniqueEffect,
  consumePreparedAttackBonus as consumePreparedAttackBonusState,
  isSupportTechniqueSpecial,
  validatePreparedTechniqueEffect,
} from "./combat-prepared-state-service.mjs";
import { num } from "../utils/math-utils.mjs";

function getRatio(value, max) {
  const safeMax = Math.max(1, num(max, 1));
  return Math.max(0, Math.min(1, num(value, 0) / safeMax));
}

export function getTechniqueHitBonus(effect = {}) {
  const specialBonus = effect?.special === "choose_zone" ? 2 : 0;
  return Number(effect?.hitBonus ?? effect?.hitPenalty ?? 0) + specialBonus;
}

function getTargetZoneChoiceKey(targetZoneChoice = null) {
  if (!targetZoneChoice) return null;
  return targetZoneChoice?.key ?? targetZoneChoice ?? null;
}

function getTargetZoneChoiceLabel(targetZoneChoice = null) {
  return targetZoneChoice?.label ?? "";
}

function getTargetZoneChoiceHitMod(targetZoneChoice = null) {
  return Number(targetZoneChoice?.hitMod ?? 0);
}

function getTargetZoneChoiceDamageMultiplier(targetZoneChoice = null) {
  return Math.max(0, Number(targetZoneChoice?.damageMult ?? 1) || 1);
}

export function techniqueRequiresTargetZoneChoice(technique = null) {
  const effect = technique?.effect ?? {};
  if (effect?.aoe) return false;
  return effect?.special === "choose_zone" || effect?.targetZoneMode === "aimed";
}

export function isTechniqueSupportAction(technique = null) {
  const special = String(technique?.effect?.special ?? "").trim();
  return isSupportTechniqueSpecial(special);
}

export function getTechniqueSupportEnergyCost(technique = null) {
  return Math.max(0, Number(technique?.energyCost ?? 0));
}

export function validateTechniqueSupportEffect({ actor = null, technique = null, weapon = null } = {}) {
  return validatePreparedTechniqueEffect({ actor, technique, weapon });
}

export async function applyTechniqueSupportEffect({ actor = null, technique = null, weapon = null } = {}) {
  return applyPreparedTechniqueEffect({ actor, technique, weapon });
}

export async function consumePreparedAttackBonus(actor, { skillKey = "", weapon = null } = {}) {
  return consumePreparedAttackBonusState(actor, { skillKey, weapon });
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
    notes.push(allowed
      ? "Казнь: цель ниже 30% HP."
      : "Казнь: цель не ниже 30% HP, бонус урона не применен.");
    return { multiplier: allowed ? multiplier : 1, notes, rangeOverride: null };
  }

  if (effect?.special === "first_strike_only") {
    const allowed = isFirstCombatAction(attacker);
    notes.push(allowed
      ? "Первый удар: бонус урона применен."
      : "Первый удар: персонаж уже действовал, бонус урона не применен.");
    return { multiplier: allowed ? multiplier : 1, notes, rangeOverride: null };
  }

  if (effect?.special === "requires_hidden_or_flank") {
    const allowed = hasHiddenOrFlankAdvantage(attacker, target);
    notes.push(allowed
      ? "Скрытность/фланг: бонус урона применен."
      : "Скрытность/фланг не подтверждены, бонус урона не применен.");
    return { multiplier: allowed ? multiplier : 1, notes, rangeOverride: null };
  }

  if (effect?.special === "counter_after_block") {
    notes.push("Рипост требует успешного блока и теперь обрабатывается как подготовленная реакция.");
    return { multiplier: 1, notes, rangeOverride: null };
  }

  if (effect?.special === "throw_weapon_ranged_3") {
    notes.push("Метательное оружие: дальность 3 клетки; расход оружия пока не автоматизирован.");
    return { multiplier, notes, rangeOverride: 3 };
  }

  return { multiplier, notes, rangeOverride: null };
}

export function getTechniqueAoeConfig(effect = {}) {
  if (effect?.aoe && typeof effect.aoe === "object") {
    return normalizeAoeConfig(effect.aoe, {
      distance: 1,
      friendlyFire: effect.friendlyFire,
      friendlyFireMode: effect.friendlyFireMode,
      targetZone: effect.targetZone,
      targetZoneMode: effect.targetZoneMode,
    });
  }

  const raw = String(effect?.aoe ?? "");
  const isRanged = raw.startsWith("ranged");
  const maxTargetsMatch = raw.match(/(\d+)\s*targets?/);
  const maxTargets = maxTargetsMatch ? Number(maxTargetsMatch[1]) : null;

  if (raw === "melee_adjacent") {
    return normalizeAoeConfig({
      shape: "circle",
      type: "nova",
      distance: 1,
      maxTargets: null,
      chainDecay: 1,
      friendlyFire: effect.friendlyFire,
      friendlyFireMode: effect.friendlyFireMode,
      targetZone: effect.targetZone,
      targetZoneMode: effect.targetZoneMode,
    });
  }

  return normalizeAoeConfig({
    shape: effect?.aoeShape ?? (isRanged ? "circle" : "circle"),
    type: effect?.aoeType ?? (maxTargets ? "shards" : "blast"),
    distance: Number(effect?.aoeDistance ?? (isRanged ? 4 : 1)),
    maxTargets,
    chainDecay: Number(effect?.chainDecay ?? 1),
    friendlyFire: effect.friendlyFire,
    friendlyFireMode: effect.friendlyFireMode,
    targetZone: effect.targetZone,
    targetZoneMode: effect.targetZoneMode,
  }, {
    distance: isRanged ? 4 : 1,
    chainDecay: 1,
  });
}

export function buildTechniqueAttackParams({
  baseParams = {},
  technique = null,
  attacker = null,
  target = null,
  targetZoneChoice = null
} = {}) {
  const effect = technique?.effect ?? {};
  const damageContext = getTechniqueDamageContext(effect, { attacker, target });
  const damageMultiplier = damageContext.multiplier * getTargetZoneChoiceDamageMultiplier(targetZoneChoice);
  const chosenZone = getTargetZoneChoiceKey(targetZoneChoice);
  const labelSuffix = getTargetZoneChoiceLabel(targetZoneChoice) ? ` -> ${getTargetZoneChoiceLabel(targetZoneChoice)}` : "";
  const defaultConditionDuration = effect.special === "knockback_1" ? 6 : 0;
  const skillKey = baseParams.skillKey ?? technique?.skill ?? "";
  const rangeOverride = damageContext.rangeOverride;
  const attackModeInput = effect.attackMode ?? (
    effect.special || rangeOverride ? null : baseParams.attackMode
  );

  return {
    ...baseParams,
    label: `${baseParams.label}: ${technique?.label ?? ""}${labelSuffix}`,
    baseDamage: Math.round(Number(baseParams.baseDamage ?? 1) * damageMultiplier),
    energyCost: Number(baseParams.energyCost ?? 0) + Number(technique?.energyCost ?? 0),
    ignoreArmor: effect.ignoreArmor ?? 0,
    hitBonus: getTechniqueHitBonus(effect) + getTargetZoneChoiceHitMod(targetZoneChoice),
    targetZone: chosenZone ?? effect.targetZone ?? null,
    targetZoneMode: chosenZone ? "fixed" : (effect.targetZoneMode ?? null),
    technique,
    applyCondition: effect.applyCondition ?? null,
    conditionDuration: effect.conditionDuration ?? defaultConditionDuration,
    conditionChance: effect.conditionChance ?? 1.0,
    effectNotes: damageContext.notes,
    rangeOverride,
    attackMode: normalizeAttackMode(attackModeInput, {
      skillKey,
      weapon: baseParams.weapon,
      technique,
      rangeOverride,
    }),
  };
}
