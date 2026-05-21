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
  const zone = String(value ?? "").trim();
  if (!zone || zone === "random" || zone === "auto" || zone === "none") return null;
  return zone;
}
