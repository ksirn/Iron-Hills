import {
  normalizeAoeFriendlyFireMode,
  normalizeAoeTargetZone,
  normalizeAoeTargetZoneMode,
} from "./aoe-policy-service.mjs";

function getTargetActor(target) {
  if (!target) return null;
  if (target.documentName === "Actor") return target;
  if (target.actor?.documentName === "Actor") return target.actor;
  if (target.document?.actor?.documentName === "Actor") return target.document.actor;
  if (target.token?.actor?.documentName === "Actor") return target.token.actor;
  return target.actor ?? null;
}

function getTargetToken(target) {
  if (!target) return null;
  if (target.documentName === "Token" || target.documentName === "TokenDocument") return target;
  if (target.document?.documentName === "Token") return target;
  if (target.token) return target.token;
  return null;
}

function getTokenSceneId(token) {
  return token?.scene?.id
    ?? token?.document?.parent?.id
    ?? token?.parent?.id
    ?? globalThis.canvas?.scene?.id
    ?? "";
}

function getTokenDocument(token) {
  return token?.document ?? token ?? null;
}

function getTokenUuid(token) {
  return token?.document?.uuid ?? token?.uuid ?? "";
}

function getActorUuid(actor) {
  return actor?.uuid ?? "";
}

function fromUuidSyncSafe(uuid) {
  if (!uuid || typeof globalThis.fromUuidSync !== "function") return null;
  try {
    return globalThis.fromUuidSync(uuid) ?? null;
  } catch (_err) {
    return null;
  }
}

function getSceneById(sceneId) {
  if (sceneId && globalThis.game?.scenes?.get) return globalThis.game.scenes.get(sceneId) ?? null;
  return globalThis.canvas?.scene ?? null;
}

function getCanvasTokenById(tokenId, sceneId = "") {
  if (!tokenId || !globalThis.canvas?.tokens?.placeables) return null;
  if (sceneId && globalThis.canvas?.scene?.id && sceneId !== globalThis.canvas.scene.id) return null;
  return globalThis.canvas.tokens.placeables.find(token => String(token.id) === String(tokenId)) ?? null;
}

function resolveTokenRef(ref = {}) {
  const byUuid = fromUuidSyncSafe(ref.tokenUuid);
  if (byUuid) return byUuid.object ?? byUuid;

  const canvasToken = getCanvasTokenById(ref.tokenId, ref.sceneId);
  if (canvasToken) return canvasToken;

  const scene = getSceneById(ref.sceneId);
  return scene?.tokens?.get?.(ref.tokenId) ?? null;
}

function resolveActorRef(ref = {}) {
  return fromUuidSyncSafe(ref.actorUuid)
    ?? globalThis.game?.actors?.get?.(ref.actorId)
    ?? null;
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function firstValue(...values) {
  return values.find(hasValue);
}

function clonePlain(value) {
  if (!value || typeof value !== "object") return null;
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function boolOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  const text = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(text)) return true;
  if (["false", "0", "no", "n", "off"].includes(text)) return false;
  return null;
}

function normalizeTargetZoneModeForPayload(value, fallback = null) {
  if (!hasValue(value) && !hasValue(fallback)) return null;
  return normalizeAoeTargetZoneMode(value, fallback ?? "random");
}

function normalizeFriendlyFireModeForPayload(value, friendlyFire = null) {
  if (!hasValue(value) && friendlyFire === null) return null;
  return normalizeAoeFriendlyFireMode(hasValue(value) ? value : friendlyFire, "off");
}

function normalizeSpellOverrides(overrides = null) {
  const copy = clonePlain(overrides);
  if (!copy) return null;

  if (copy.targetZone !== undefined || copy.targetPart !== undefined) {
    const zone = normalizeAoeTargetZone(firstValue(copy.targetZone, copy.targetPart));
    if (zone) {
      copy.targetZone = zone;
      copy.targetPart = zone;
    } else {
      delete copy.targetZone;
      delete copy.targetPart;
    }
  }

  if (copy.targetZoneMode !== undefined) {
    copy.targetZoneMode = normalizeTargetZoneModeForPayload(
      copy.targetZoneMode,
      copy.targetZone ? "fixed" : "random"
    );
  }

  if (copy.friendlyFire !== undefined || copy.friendlyFireMode !== undefined) {
    const bool = boolOrNull(copy.friendlyFire);
    const mode = normalizeFriendlyFireModeForPayload(copy.friendlyFireMode, bool);
    if (mode) copy.friendlyFireMode = mode;
    if (bool !== null) copy.friendlyFire = bool;
  }

  return Object.keys(copy).length ? copy : null;
}

export function normalizeCombatTargets(targets = globalThis.game?.user?.targets ?? []) {
  if (!targets) return [];
  if (targets instanceof Set) return [...targets];
  if (Array.isArray(targets)) return targets;
  if (typeof targets[Symbol.iterator] === "function") return Array.from(targets);
  return [targets];
}

export function getCombatTargetActor(target) {
  return getTargetActor(target);
}

export function getCombatTargetToken(target) {
  return getTargetToken(target);
}

export function getPrimaryCombatTarget(targets = globalThis.game?.user?.targets ?? []) {
  return normalizeCombatTargets(targets)[0] ?? null;
}

export function getPrimaryCombatTargetActor(targets = globalThis.game?.user?.targets ?? []) {
  return getCombatTargetActor(getPrimaryCombatTarget(targets));
}

export function buildCombatTargetRefs(targets = globalThis.game?.user?.targets ?? []) {
  return normalizeCombatTargets(targets)
    .map(target => {
      const actor = getCombatTargetActor(target);
      const token = getCombatTargetToken(target);
      const tokenDoc = getTokenDocument(token);

      return {
        actorUuid: getActorUuid(actor),
        actorId: actor?.id ?? "",
        tokenUuid: getTokenUuid(token),
        tokenId: tokenDoc?.id ?? token?.id ?? "",
        sceneId: getTokenSceneId(token),
      };
    })
    .filter(ref => ref.actorUuid || ref.actorId || ref.tokenUuid || ref.tokenId);
}

export function resolveCombatTargetRefs(targetRefs = []) {
  if (!Array.isArray(targetRefs) || !targetRefs.length) return [];

  return targetRefs
    .map(ref => {
      const token = resolveTokenRef(ref);
      if (token?.actor) return token;

      const actor = token?.actor ?? resolveActorRef(ref);
      if (!actor) return null;
      return { actor };
    })
    .filter(Boolean);
}

export function resolveCombatActionTargets({
  targets = null,
  targetRefs = null,
  fallbackTargets = globalThis.game?.user?.targets ?? [],
} = {}) {
  const explicitTargets = normalizeCombatTargets(targets);
  if (explicitTargets.length) return explicitTargets;

  const refTargets = resolveCombatTargetRefs(targetRefs);
  if (refTargets.length) return refTargets;

  return normalizeCombatTargets(fallbackTargets);
}

export function buildCombatTargetPayload(targets = globalThis.game?.user?.targets ?? []) {
  const targetRefs = buildCombatTargetRefs(targets);
  return targetRefs.length ? { targetRefs } : {};
}

export function normalizeCombatTargetZone(value) {
  return normalizeAoeTargetZone(value);
}

export function buildCombatActionTargetContext({
  targets = null,
  targetRefs = null,
  fallbackTargets = globalThis.game?.user?.targets ?? [],
  targetZone = null,
  targetPart = null,
  targetZoneMode = null,
  aimed = false,
  friendlyFire = null,
  friendlyFireMode = null,
  spellOverrides = null,
} = {}) {
  const resolvedTargets = resolveCombatActionTargets({ targets, targetRefs, fallbackTargets });
  const normalizedSpellOverrides = normalizeSpellOverrides(spellOverrides);
  const zone = normalizeCombatTargetZone(firstValue(
    targetZone,
    targetPart,
    normalizedSpellOverrides?.targetZone,
    normalizedSpellOverrides?.targetPart,
  ));
  const part = normalizeCombatTargetZone(firstValue(
    targetPart,
    targetZone,
    normalizedSpellOverrides?.targetPart,
    normalizedSpellOverrides?.targetZone,
  ));
  const zoneMode = normalizeTargetZoneModeForPayload(
    firstValue(targetZoneMode, normalizedSpellOverrides?.targetZoneMode),
    zone ? "fixed" : null
  );
  const friendlyBool = boolOrNull(firstValue(friendlyFire, normalizedSpellOverrides?.friendlyFire));
  const fireMode = normalizeFriendlyFireModeForPayload(
    firstValue(friendlyFireMode, normalizedSpellOverrides?.friendlyFireMode),
    friendlyBool
  );

  return {
    targets: resolvedTargets,
    targetRefs: buildCombatTargetRefs(resolvedTargets),
    targetZone: zone,
    targetPart: part,
    targetZoneMode: zoneMode,
    aimed: Boolean(aimed),
    friendlyFire: friendlyBool,
    friendlyFireMode: fireMode,
    spellOverrides: normalizedSpellOverrides,
  };
}

export function resolveCombatActionTargetContext({
  payload = {},
  targets = undefined,
  targetRefs = undefined,
  fallbackTargets = globalThis.game?.user?.targets ?? [],
  targetZone = undefined,
  targetPart = undefined,
  targetZoneMode = undefined,
  aimed = undefined,
  friendlyFire = undefined,
  friendlyFireMode = undefined,
  spellOverrides = undefined,
} = {}) {
  return buildCombatActionTargetContext({
    targets: targets !== undefined ? targets : payload.targets,
    targetRefs: targetRefs !== undefined ? targetRefs : payload.targetRefs,
    fallbackTargets,
    targetZone: targetZone !== undefined ? targetZone : payload.targetZone,
    targetPart: targetPart !== undefined ? targetPart : payload.targetPart,
    targetZoneMode: targetZoneMode !== undefined ? targetZoneMode : payload.targetZoneMode,
    aimed: aimed !== undefined ? aimed : payload.aimed,
    friendlyFire: friendlyFire !== undefined ? friendlyFire : payload.friendlyFire,
    friendlyFireMode: friendlyFireMode !== undefined ? friendlyFireMode : payload.friendlyFireMode,
    spellOverrides: spellOverrides !== undefined ? spellOverrides : payload.spellOverrides,
  });
}

export function buildCombatActionTargetPayload(options = {}) {
  const context = options?.targets || options?.targetRefs || options?.payload
    ? resolveCombatActionTargetContext(options)
    : buildCombatActionTargetContext(options);
  const payload = {};

  if (context.targetRefs.length) payload.targetRefs = context.targetRefs;
  if (context.targetZone) payload.targetZone = context.targetZone;
  if (context.targetPart && context.targetPart !== context.targetZone) payload.targetPart = context.targetPart;
  if (context.targetZoneMode) payload.targetZoneMode = context.targetZoneMode;
  if (context.aimed) payload.aimed = true;
  if (context.friendlyFire !== null) payload.friendlyFire = context.friendlyFire;
  if (context.friendlyFireMode) payload.friendlyFireMode = context.friendlyFireMode;
  if (context.spellOverrides) payload.spellOverrides = context.spellOverrides;

  return payload;
}
