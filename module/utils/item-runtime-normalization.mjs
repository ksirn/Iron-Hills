import {
  ITEM_ACTION_TYPE_DEFAULTS,
  ITEM_APPLICATION_SCOPES,
  ITEM_TARGET_ACTOR_MODES,
  actionConfigFromEffect,
  conditionConfigFromEffect,
} from "./item-action-config.mjs";
import {
  AOE_FRIENDLY_FIRE_MODE_KEYS,
  AOE_SHAPE_KEYS,
  AOE_TARGET_ZONE_MODE_KEYS,
  AOE_TYPE_KEYS,
  BODY_ZONE_KEYS,
  normalizeAoeConfig,
  normalizeAoeTargetZone,
} from "../services/aoe-policy-service.mjs";
import { normalizeDamageType } from "../services/damage-type-service.mjs";

export const ACTION_RUNTIME_ITEM_TYPES = new Set(["potion", "consumable", "scroll"]);

export const ACTION_ITEM_FALLBACK_EFFECTS = Object.freeze({
  potion: "healHP",
  consumable: "reduceBleeding",
  scroll: "damage",
});

export const ACTION_ITEM_FALLBACK_POWER = Object.freeze({
  potion: 5,
  consumable: 1,
  scroll: 5,
});

export const THROWABLE_AOE_DEFAULTS = Object.freeze({
  type: "blast",
  shape: "circle",
  distance: 0,
  maxTargets: null,
  chainDecay: 1,
  targetZoneMode: "random",
  friendlyFireMode: "off",
});

export const ITEM_ACTION_TYPE_KEYS = Object.freeze(Object.keys(ITEM_ACTION_TYPE_DEFAULTS));
export const ITEM_ACTION_TYPE_SET = new Set(ITEM_ACTION_TYPE_KEYS);
export const ITEM_APPLICATION_SCOPE_SET = ITEM_APPLICATION_SCOPES;
export const ITEM_TARGET_ACTOR_MODE_SET = ITEM_TARGET_ACTOR_MODES;
export const ITEM_BODY_ZONE_SET = new Set(BODY_ZONE_KEYS);
export const ITEM_AOE_SHAPE_SET = new Set(AOE_SHAPE_KEYS);
export const ITEM_AOE_TYPE_SET = new Set(AOE_TYPE_KEYS);
export const ITEM_AOE_TARGET_ZONE_MODE_SET = new Set(AOE_TARGET_ZONE_MODE_KEYS);
export const ITEM_AOE_FRIENDLY_FIRE_MODE_SET = new Set(AOE_FRIENDLY_FIRE_MODE_KEYS);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cleanString(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanPositive(value, fallback = 1) {
  const parsed = cleanNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

function cleanNonNegative(value, fallback = 0) {
  return Math.max(0, cleanNumber(value, fallback));
}

function enumValue(value, allowed, fallback) {
  const text = cleanString(value);
  return text && allowed.has(text) ? text : fallback;
}

function firstDefined(...values) {
  return values.find(value => value !== undefined && value !== null && value !== "");
}

export function getFallbackActionEffect(type = "consumable", system = {}) {
  if (cleanString(system.actionType) === "drink-vessel") return "drink-vessel";
  return ACTION_ITEM_FALLBACK_EFFECTS[type] ?? ACTION_ITEM_FALLBACK_EFFECTS.consumable;
}

export function normalizeItemActionSystem(system = {}, {
  type = "consumable",
  fallbackEffect = null,
  fallbackPower = null,
  ensurePower = false,
  targetPart = "torso",
} = {}) {
  if (!isPlainObject(system)) return system;
  if (!ACTION_RUNTIME_ITEM_TYPES.has(type)) return system;

  const effectFallback = cleanString(fallbackEffect, getFallbackActionEffect(type, system));
  const effectValue = isPlainObject(system.effect) ? null : system.effect;
  const effectType = cleanString(firstDefined(system.effectType, effectValue, effectFallback), effectFallback);
  const rawTargetPart = firstDefined(system.targetPart, targetPart, type === "consumable" ? "" : "torso");
  const action = actionConfigFromEffect(effectType, rawTargetPart);
  const existingActionType = cleanString(system.actionType);
  const actionType = existingActionType || action.actionType;
  const isDamageScroll = type === "scroll" && effectType === "damage";

  system.effectType = effectType;
  if (!cleanString(system.effect) && !isPlainObject(system.effect)) system.effect = effectType;
  if (!isDamageScroll || existingActionType) system.actionType = actionType;
  else system.actionType = "";

  system.applicationScope = enumValue(
    system.applicationScope,
    ITEM_APPLICATION_SCOPE_SET,
    action.applicationScope || "global"
  );
  system.targetActorMode = enumValue(
    system.targetActorMode,
    ITEM_TARGET_ACTOR_MODE_SET,
    action.targetActorMode || "self"
  );
  system.targetPart = cleanString(system.targetPart, action.targetPart ?? cleanString(rawTargetPart));

  if (ensurePower) {
    const powerFallback = fallbackPower ?? ACTION_ITEM_FALLBACK_POWER[type] ?? 1;
    system.power = cleanPositive(system.power, powerFallback);
  }

  const condition = conditionConfigFromEffect(effectType, system.duration ?? system.power ?? 1);
  if (condition) {
    system.conditionKey = cleanString(system.conditionKey, condition.conditionKey);
    system.conditionMode = cleanString(system.conditionMode, condition.mode);
    system.conditionValueKind = cleanString(system.conditionValueKind, condition.valueKind);
    system.duration = cleanPositive(system.duration, condition.amount);
  }

  return system;
}

export function hasThrowableAoeIntent(system = {}) {
  const aoe = isPlainObject(system.aoe) ? system.aoe : {};
  return cleanNumber(aoe.distance ?? system.aoeDistance, 0) > 0
    || cleanNumber(aoe.maxTargets ?? system.maxTargets, 0) > 0
    || cleanNumber(system.appliesBurning, 0) > 0;
}

export function normalizeThrowableSystem(system = {}, {
  tier = system?.tier ?? 1,
  fallbackPower = 2,
  ensurePower = false,
  ensureAoeObject = true,
} = {}) {
  if (!isPlainObject(system)) return system;

  const cleanTier = Math.max(1, Math.round(cleanNumber(tier ?? system.tier, 1)));
  const damageType = normalizeDamageType(system.damageType, { fallback: "physical" });
  const burning = cleanNonNegative(system.appliesBurning, 0);
  const hasArea = hasThrowableAoeIntent({ ...system, appliesBurning: burning });
  const rawAoe = isPlainObject(system.aoe) ? system.aoe : {};
  const fallbackDistance = hasArea ? 2 : 0;
  const distance = cleanNumber(rawAoe.distance ?? system.aoeDistance, fallbackDistance);
  const friendlyFireMode = rawAoe.friendlyFireMode
    ?? system.friendlyFireMode
    ?? (hasArea ? "auto" : "off");

  system.effectType = cleanString(system.effectType ?? system.effect, "damage");
  system.damageType = damageType;
  if (ensurePower) system.power = cleanPositive(system.power, fallbackPower);
  system.energyCost = cleanNonNegative(system.energyCost, 8 + cleanTier);
  system.targetPart = cleanString(system.targetPart, "torso");
  system.targetZone = normalizeAoeTargetZone(system.targetZone) ?? "";
  system.appliesPoison = cleanNonNegative(system.appliesPoison, 0);
  system.appliesBurning = burning;

  if (!ensureAoeObject && !hasArea && !isPlainObject(system.aoe)) {
    system.friendlyFireMode = "off";
    system.friendlyFire = false;
    return system;
  }

  const config = normalizeAoeConfig({
    ...rawAoe,
    distance: hasArea && distance <= 0 ? fallbackDistance : distance,
    friendlyFireMode,
    friendlyFire: rawAoe.friendlyFire ?? system.friendlyFire,
    targetZone: rawAoe.targetZone ?? system.targetZone,
    targetPart: rawAoe.targetPart ?? system.targetPart,
    damageType,
  }, {
    ...THROWABLE_AOE_DEFAULTS,
    distance: fallbackDistance,
    friendlyFireMode: hasArea ? "auto" : "off",
    damageType,
  });

  system.aoe = {
    ...rawAoe,
    type: config.type,
    shape: config.shape,
    distance: config.distance,
    maxTargets: config.maxTargets,
    chainDecay: config.chainDecay,
    targetZoneMode: config.targetZoneMode,
    friendlyFireMode: config.friendlyFireMode,
    ...(config.targetZone ? { targetZone: config.targetZone } : {}),
  };
  system.friendlyFireMode = config.friendlyFireMode;
  system.friendlyFire = Boolean(config.friendlyFire);

  return system;
}
