import { actorsAreAllies } from "./disposition-service.mjs";
import { isHealingDamageType, normalizeDamageType } from "./damage-type-service.mjs";

export const AOE_SHAPE_KEYS = Object.freeze(["circle", "cone", "ray", "rect"]);
export const AOE_TYPE_KEYS = Object.freeze(["blast", "pierce", "sweep", "shards", "chain", "nova"]);
export const AOE_TARGET_ZONE_MODE_KEYS = Object.freeze(["random", "fixed", "aimed"]);
export const AOE_FRIENDLY_FIRE_MODE_KEYS = Object.freeze(["off", "on", "auto"]);
export const BODY_ZONE_KEYS = Object.freeze([
  "head",
  "neck",
  "torso",
  "abdomen",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
  "shield",
]);
export const AOE_TARGETABLE_BODY_ZONE_KEYS = Object.freeze(
  BODY_ZONE_KEYS.filter(key => key !== "shield")
);

export const AOE_FRIENDLY_FIRE_LABELS = Object.freeze({
  off: "союзников не задевать",
  on: "задевать всех",
  auto: "по типу атаки",
});

export const AOE_TARGET_ZONE_MODE_LABELS = Object.freeze({
  random: "случайная зона у каждой цели",
  fixed: "одна заданная зона",
  aimed: "выбор зоны перед применением",
});

const AOE_SHAPE_SET = new Set(AOE_SHAPE_KEYS);
const AOE_TYPE_SET = new Set(AOE_TYPE_KEYS);
const AOE_TARGET_ZONE_MODE_SET = new Set(AOE_TARGET_ZONE_MODE_KEYS);
const AOE_FRIENDLY_FIRE_MODE_SET = new Set(AOE_FRIENDLY_FIRE_MODE_KEYS);
const BODY_ZONE_SET = new Set(BODY_ZONE_KEYS);
const BODY_ZONE_ALIASES = Object.freeze({
  body: "torso",
  chest: "torso",
  belly: "abdomen",
  stomach: "abdomen",
  arms: "leftArm",
  legs: "leftLeg",
});

function firstDefined(...values) {
  return values.find(value => value !== undefined && value !== null && value !== "");
}

function finiteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeTargetList(targets = []) {
  if (!targets) return [];
  if (targets instanceof Set) return [...targets];
  if (Array.isArray(targets)) return targets;
  if (typeof targets[Symbol.iterator] === "function") return Array.from(targets);
  return [targets];
}

function normalizeString(value) {
  return String(value ?? "").trim().toLowerCase();
}

function boolLike(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;

  const text = normalizeString(value);
  if (!text) return null;
  if (["true", "1", "yes", "y", "on", "all", "always"].includes(text)) return true;
  if (["false", "0", "no", "n", "off", "none", "never", "enemy", "enemies"].includes(text)) return false;
  return null;
}

export function normalizeAoeShape(value, fallback = "circle") {
  const shape = String(value ?? fallback ?? "circle").trim();
  return AOE_SHAPE_SET.has(shape) ? shape : "circle";
}

export function normalizeAoeType(value, fallback = "blast") {
  const type = String(value ?? fallback ?? "blast").trim();
  return AOE_TYPE_SET.has(type) ? type : "blast";
}

export function normalizeAoeDistance(value, fallback = 0) {
  return Math.max(0, finiteNumber(value, fallback));
}

export function normalizeAoeMaxTargets(value, fallback = null) {
  const parsed = finiteNumber(value, fallback ?? 0);
  return parsed > 0 ? Math.floor(parsed) : null;
}

export function normalizeAoeChainDecay(value, fallback = 1) {
  const parsed = finiteNumber(value, fallback);
  return parsed > 0 ? parsed : 1;
}

export function normalizeAoeFriendlyFireMode(value, fallback = "off") {
  const bool = boolLike(value);
  if (bool === true) return "on";
  if (bool === false) return "off";

  const mode = normalizeString(value || fallback || "off");
  return AOE_FRIENDLY_FIRE_MODE_SET.has(mode) ? mode : "off";
}

export function resolveAoeFriendlyFireMode(...values) {
  const value = firstDefined(...values);
  return normalizeAoeFriendlyFireMode(value, "off");
}

export function resolveAoeFriendlyFire(...values) {
  return resolveAoeFriendlyFireMode(...values) === "on";
}

export function isAoeFriendlyFireEnabled({
  mode = "off",
  type = "blast",
  shape = "circle",
  damageType = "physical",
  effect = null,
} = {}) {
  const normalizedMode = normalizeAoeFriendlyFireMode(mode, "off");
  if (normalizedMode === "on") return true;
  if (normalizedMode === "off") return false;

  const effectMode = normalizeAoeFriendlyFireMode(effect?.friendlyFireMode, "");
  if (effectMode === "on") return true;
  if (effectMode === "off" && effect?.friendlyFireMode !== undefined) return false;

  const normalizedType = normalizeAoeType(type, "blast");
  const normalizedShape = normalizeAoeShape(shape, "circle");
  const healingLike = isHealingDamageType(damageType);

  if (healingLike || ["heal", "buff"].includes(String(effect?.special ?? "").trim())) {
    return false;
  }

  if (["blast", "nova", "shards", "sweep"].includes(normalizedType)) return true;
  if (normalizedShape === "cone" && !healingLike) return true;
  return false;
}

export function normalizeAoeTargetZone(value) {
  const zone = String(value ?? "").trim();
  if (!zone || zone === "random" || zone === "auto" || zone === "none") return null;
  const alias = BODY_ZONE_ALIASES[zone.toLowerCase()];
  const normalized = alias ?? zone;
  return BODY_ZONE_SET.has(normalized) ? normalized : null;
}

export function resolveAoeTargetZone(...values) {
  for (const value of values) {
    const zone = normalizeAoeTargetZone(value);
    if (zone) return zone;
  }
  return null;
}

export function normalizeAoeTargetZoneMode(value, fallback = "random") {
  const mode = normalizeString(value || fallback || "random");
  if (mode === "targeted" || mode === "single") return "fixed";
  return AOE_TARGET_ZONE_MODE_SET.has(mode) ? mode : "random";
}

export function getAoeFriendlyFireLabel(mode) {
  const normalized = normalizeAoeFriendlyFireMode(mode, "off");
  return AOE_FRIENDLY_FIRE_LABELS[normalized] ?? normalized;
}

export function getAoeTargetZoneModeLabel(mode) {
  const normalized = normalizeAoeTargetZoneMode(mode, "random");
  return AOE_TARGET_ZONE_MODE_LABELS[normalized] ?? normalized;
}

export function buildAoeTargetZonePolicy({
  targetZone = null,
  effect = null,
  aoe = null,
  mode = null,
} = {}) {
  const zone = resolveAoeTargetZone(
    targetZone,
    effect?.targetZone,
    effect?.targetPart,
    aoe?.targetZone,
    aoe?.targetPart,
  );
  const rawMode = firstDefined(
    mode,
    effect?.targetZoneMode,
    effect?.zoneMode,
    aoe?.targetZoneMode,
    aoe?.zoneMode,
    zone ? "fixed" : "random",
  );
  let zoneMode = normalizeAoeTargetZoneMode(rawMode, zone ? "fixed" : "random");
  if (zoneMode === "fixed" && !zone) zoneMode = "random";

  return {
    mode: zoneMode,
    zone,
    usesFixedZone: Boolean(zone && zoneMode !== "random"),
    requiresChoice: zoneMode === "aimed",
  };
}

function resolveTargetRefZone(targetRef = null) {
  return resolveAoeTargetZone(
    targetRef?._ihAoe?.targetZone,
    targetRef?._ihAoe?.targetPart,
    targetRef?.targetZone,
    targetRef?.targetPart,
  );
}

export function resolveAoeTargetZoneDetails(policy = null, targetRef = null) {
  const mode = normalizeAoeTargetZoneMode(policy?.mode, "random");
  if (policy?.zone && mode !== "random") {
    return {
      zone: policy.zone,
      mode,
      source: mode === "aimed" ? "aimed" : "fixed",
    };
  }

  const targetZone = resolveTargetRefZone(targetRef);
  if (targetZone) {
    return {
      zone: targetZone,
      mode,
      source: "target",
    };
  }

  return {
    zone: null,
    mode,
    source: "random",
  };
}

export function resolveAoeTargetZoneForTarget(policy = null, targetRef = null) {
  return resolveAoeTargetZoneDetails(policy, targetRef).zone;
}

export function normalizeAoeConfig(raw = null, defaults = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const shape = normalizeAoeShape(firstDefined(source.shape, defaults.shape), defaults.shape ?? "circle");
  const type = normalizeAoeType(firstDefined(source.type, defaults.type), defaults.type ?? "blast");
  const damageType = normalizeDamageType(firstDefined(source.damageType, defaults.damageType, "physical"), { fallback: "physical" });
  const friendlyFireMode = resolveAoeFriendlyFireMode(
    source.friendlyFireMode,
    source.friendlyFire,
    defaults.friendlyFireMode,
    defaults.friendlyFire,
    "off",
  );
  const targetZone = resolveAoeTargetZone(source.targetZone, source.targetPart, defaults.targetZone, defaults.targetPart);
  let targetZoneMode = normalizeAoeTargetZoneMode(
    firstDefined(source.targetZoneMode, source.zoneMode, defaults.targetZoneMode, defaults.zoneMode),
    targetZone ? "fixed" : "random",
  );
  if (targetZoneMode === "fixed" && !targetZone) targetZoneMode = "random";

  return {
    shape,
    type,
    distance: normalizeAoeDistance(firstDefined(source.distance, defaults.distance), defaults.distance ?? 0),
    maxTargets: normalizeAoeMaxTargets(firstDefined(source.maxTargets, defaults.maxTargets), defaults.maxTargets ?? null),
    chainDecay: normalizeAoeChainDecay(firstDefined(source.chainDecay, defaults.chainDecay), defaults.chainDecay ?? 1),
    friendlyFireMode,
    friendlyFire: isAoeFriendlyFireEnabled({
      mode: friendlyFireMode,
      type,
      shape,
      damageType,
      effect: firstDefined(source.effect, defaults.effect),
    }),
    targetZone,
    targetZoneMode,
    damageType,
  };
}

export function findAoeActorToken(actor) {
  if (!actor?.id || !globalThis.canvas?.tokens?.placeables) return null;
  return globalThis.canvas.tokens.placeables.find(token => token.actor?.id === actor.id) ?? null;
}

export function getAoeTargetActor(target) {
  if (!target) return null;
  if (target.documentName === "Actor") return target;
  if (target.actor?.documentName === "Actor") return target.actor;
  if (target.document?.actor?.documentName === "Actor") return target.document.actor;
  if (target.token?.actor?.documentName === "Actor") return target.token.actor;
  return target.actor ?? null;
}

export function getAoeTargetToken(target) {
  if (!target) return null;
  if (target.documentName === "Token") return target;
  if (target.documentName === "TokenDocument") return target.object ?? target;
  if (target.document?.documentName === "Token") return target;
  if (target.token) return target.token;
  return findAoeActorToken(getAoeTargetActor(target));
}

export function wantsAlliedAoeTargets(effect = null) {
  const special = String(effect?.special ?? "").trim();
  return special === "heal" || special === "buff";
}

export function getAoeTargetPolicy({ friendlyFire = false, effect = null, purpose = "damage" } = {}) {
  if (friendlyFire) return "all";
  if (purpose === "utility" && wantsAlliedAoeTargets(effect)) return "allies";
  return "enemies";
}

export function filterAoeTargetsByPolicy(targets = [], {
  attacker = null,
  friendlyFire = false,
  effect = null,
  purpose = "damage",
} = {}) {
  const candidates = normalizeTargetList(targets).filter(target => getAoeTargetActor(target));
  const policy = getAoeTargetPolicy({ friendlyFire, effect, purpose });

  if (!attacker || policy === "all") {
    return { targets: candidates, skipped: 0, policy };
  }

  let skipped = 0;
  const filtered = candidates.filter(targetRef => {
    const actor = getAoeTargetActor(targetRef);
    const isAlly = actorsAreAllies(attacker, actor);
    const keep = policy === "allies" ? isAlly : !isAlly;
    if (!keep) skipped++;
    return keep;
  });

  return { targets: filtered, skipped, policy };
}
