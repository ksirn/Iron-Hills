export function resolveActorFromUuid(actorUuid) {
  if (!actorUuid) return null;

  try {
    const doc = fromUuidSync(actorUuid);
    if (!doc) return null;

    if (doc.documentName === "Actor") return doc;
    if (doc.actor?.documentName === "Actor") return doc.actor;

    return null;
  } catch (err) {
    console.error("resolveActorFromUuid error:", err);
    return null;
  }
}

export function getLiveActor(actorOrUuid) {
  if (!actorOrUuid) return null;

  if (typeof actorOrUuid === "string") {
    return resolveActorFromUuid(actorOrUuid);
  }

  if (actorOrUuid.documentName === "Actor" && actorOrUuid.uuid) {
    return actorOrUuid;
  }

  if (actorOrUuid.documentName === "Token" || actorOrUuid.documentName === "TokenDocument") {
    return actorOrUuid.actor ?? null;
  }

  if (actorOrUuid.actor?.documentName === "Actor") {
    return actorOrUuid.actor;
  }

  return null;
}

export function isSyntheticActorDocument(actorLike) {
  const actor = actorLike?.actor ? actorLike.actor : actorLike;
  if (!actor || actor.documentName !== "Actor") return false;

  const uuid = String(actor.uuid ?? "");
  if (uuid.startsWith("Scene.")) return true;
  if (actor.isToken) return true;
  if (actor.parent?.documentName === "Token") return true;
  if (actor.parent?.documentName === "TokenDocument") return true;

  return false;
}

export function getPersistentActor(actorLike) {
  if (!actorLike) return null;

  const actor = actorLike.actor ? actorLike.actor : actorLike;

  if (!actor) return null;

  if (actor.documentName === "Token" || actor.documentName === "TokenDocument") {
    return getPersistentActor(actor.actor);
  }

  if (actor.baseActor) {
    return game.actors?.get(actor.baseActor.id) || actor.baseActor;
  }

  if (actor.uuid && String(actor.uuid).startsWith("Actor.")) {
    return game.actors?.get(actor.id) || actor;
  }

  if (actor.id) {
    const worldActor = game.actors?.get(actor.id);
    if (worldActor) return worldActor;
  }

  if (actor.uuid) {
    const resolved = resolveActorFromUuid(actor.uuid);
    if (resolved?.uuid && String(resolved.uuid).startsWith("Actor.")) {
      return game.actors?.get(resolved.id) || resolved;
    }
    if (resolved?.baseActor) {
      return game.actors?.get(resolved.baseActor.id) || resolved.baseActor;
    }
  }

  return actor;
}

export function getPersistentActorUuid(actorLike) {
  return getPersistentActor(actorLike)?.uuid || "";
}

export function getPersistentActorId(actorLike) {
  return getPersistentActor(actorLike)?.id || "";
}

export function resolvePersistentActorFromTokenOrUser() {
  const controlled = canvas?.tokens?.controlled ?? [];
  if (controlled.length && controlled[0]?.actor) {
    return getPersistentActor(controlled[0].actor);
  }

  if (game.user?.character) {
    return getPersistentActor(game.user.character);
  }

  return null;
}

export function getLiveItemFromActor(actorOrUuid, itemOrId) {
  const actor = getLiveActor(actorOrUuid);
  if (!actor) return null;

  const itemId = typeof itemOrId === "string" ? itemOrId : itemOrId?.id;
  if (!itemId) return null;

  return actor.items.get(itemId) ?? null;
}

export function getPersistentItemFromActor(actorOrUuid, itemOrId) {
  const actor = getPersistentActor(actorOrUuid);
  if (!actor) return null;

  const itemId = typeof itemOrId === "string" ? itemOrId : itemOrId?.id;
  if (!itemId) return null;

  return actor.items.get(itemId) ?? null;
}

export function getActorCurrency(actor) {
  return Math.max(0, Number(actor.system?.economy?.coins ?? 0));
}

export function getMerchantWealth(actor) {
  return Math.max(0, Number(actor.system?.economy?.wealth ?? 0));
}

export function getMerchantMarkup(actor) {
  return Math.max(0.5, Number(actor.system?.economy?.markup ?? 1));
}

export function getControlledCharacterActor() {
  const controlled = canvas?.tokens?.controlled ?? [];
  if (!controlled.length) return null;

  const actor = controlled[0]?.actor ?? null;
  if (!actor) return null;
  if (actor.type !== "character") return null;

  return getPersistentActor(actor);
}

export function getActiveTradeCharacterUuid() {
  const controlled = canvas?.tokens?.controlled ?? [];
  if (controlled.length) {
    const actor = controlled[0]?.actor ?? null;
    if (actor?.type === "character") {
      const persistent = getPersistentActor(actor);
      return persistent?.uuid || "";
    }
  }

  if (game.user?.character?.type === "character") {
    const persistent = getPersistentActor(game.user.character);
    return persistent?.uuid || "";
  }

  return "";
}

export function getCharacterActorById(actorId) {
  if (!actorId) return null;

  const actor = game.actors.get(actorId) ?? null;
  if (!actor) return null;
  if (actor.type !== "character") return null;

  return actor;
}

export function getCharacterActorByUuid(actorUuid) {
  if (!actorUuid) return null;

  try {
    const actor = fromUuidSync(actorUuid);
    if (!actor) return null;
    if (actor.type !== "character") return null;
    return getPersistentActor(actor);
  } catch (err) {
    console.error("getCharacterActorByUuid error:", err);
    return null;
  }
}

export function getActiveTradeCharacter() {
  return getCharacterActorByUuid(getActiveTradeCharacterUuid());
}

export function getTradeCharacterByUuidOrActive(actorUuid = "") {
  return getCharacterActorByUuid(actorUuid) ?? getCharacterActorByUuid(getActiveTradeCharacterUuid());
}

export function getTradeCharacterOptions() {
  const options = [];

  for (const actor of game.actors
    .filter(a => a.type === "character")
    .sort((a, b) => a.name.localeCompare(b.name, "ru"))) {
    options.push({
      uuid: actor.uuid,
      name: actor.name
    });
  }

  return options;
}