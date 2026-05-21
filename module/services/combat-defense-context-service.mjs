import { actorsAreAllies } from "./disposition-service.mjs";
import {
  getActorToken,
  getTokenGridDistance,
} from "../utils/item-utils.mjs";
import { isConditionActive } from "./condition-policy-service.mjs";

const ADJACENT_DISTANCE = 1.5;
const FORMATION_BONUS = 2;
const FORMATION_FALLBACK_BONUS = 2;
const SHIELD_WALL_LINKED_BONUS = 3;
const SHIELD_WALL_FALLBACK_BONUS = 2;
const SHIELD_WALL_SOLO_BONUS = 1;

function conditionActive(actor, key) {
  return isConditionActive(actor?.system?.conditions ?? {}, key);
}

function isShieldItem(item, equippedSlot = "") {
  if (!item) return false;
  return Boolean(
    item.system?.isShield ||
    item.type === "shield" ||
    (item.type === "armor" && ["leftHand", "rightHand", "shield"].includes(equippedSlot)) ||
    (item.type === "armor" && ["shield", "leftHand", "rightHand"].includes(String(item.system?.slot ?? "")))
  );
}

export function getEquippedShield(actor) {
  const equipment = actor?.system?.equipment ?? {};
  for (const slot of ["leftHand", "rightHand", "shield"]) {
    const itemId = equipment?.[slot];
    const item = itemId ? actor.items?.get(itemId) : null;
    if (isShieldItem(item, slot)) return item;
  }
  return null;
}

function resolveToken(actor, preferredToken = null) {
  if (preferredToken?.actor?.id === actor?.id) return preferredToken;
  if (preferredToken?.document?.actor?.id === actor?.id) return preferredToken;
  return getActorToken(actor);
}

function getSceneTokens() {
  if (!globalThis.canvas?.scene || !globalThis.canvas?.tokens?.placeables) return [];
  return globalThis.canvas.tokens.placeables;
}

function getAdjacentAllies(actor, actorToken) {
  if (!actor || !actorToken) return [];

  return getSceneTokens()
    .filter(token => token?.actor && token.actor.id !== actor.id)
    .filter(token => actorsAreAllies(actor, token.actor))
    .map(token => ({
      token,
      actor: token.actor,
      distance: getTokenGridDistance(actorToken, token),
    }))
    .filter(entry => Number.isFinite(entry.distance) && entry.distance <= ADJACENT_DISTANCE);
}

function listNames(entries, limit = 3) {
  const names = entries
    .map(entry => entry.actor?.name)
    .filter(Boolean)
    .slice(0, limit);
  return names.join(", ");
}

export function resolveDefenseContext(targetActor, {
  targetToken = null,
  surroundCount = 0,
  hasShield = null,
} = {}) {
  const formationActive = conditionActive(targetActor, "formation_stance");
  const shieldWallActive = conditionActive(targetActor, "shield_wall_formation");
  const shield = getEquippedShield(targetActor);
  const targetHasShield = hasShield ?? Boolean(shield);

  if (!formationActive && !shieldWallActive) {
    return {
      active: false,
      formationActive,
      shieldWallActive,
      positionKnown: false,
      adjacentAllyCount: 0,
      adjacentShieldAllyCount: 0,
      hasShield: targetHasShield,
      formationBonus: 0,
      shieldWallBonus: 0,
      surroundMitigation: 0,
      thresholdBonus: 0,
      notes: [],
    };
  }

  const resolvedTargetToken = resolveToken(targetActor, targetToken);
  const positionKnown = Boolean(resolvedTargetToken && globalThis.canvas?.scene);
  const adjacentAllies = positionKnown ? getAdjacentAllies(targetActor, resolvedTargetToken) : [];
  const adjacentShieldAllies = adjacentAllies.filter(entry => Boolean(getEquippedShield(entry.actor)));

  const formationWorks = formationActive && (!positionKnown || adjacentAllies.length > 0);
  const shieldWallLinked = shieldWallActive && targetHasShield && (!positionKnown || adjacentShieldAllies.length > 0);
  const shieldWallSolo = shieldWallActive && targetHasShield && positionKnown && adjacentShieldAllies.length <= 0;

  const formationBonus = formationWorks
    ? (positionKnown ? FORMATION_BONUS : FORMATION_FALLBACK_BONUS)
    : 0;
  const shieldWallBonus = shieldWallLinked
    ? (positionKnown ? SHIELD_WALL_LINKED_BONUS : SHIELD_WALL_FALLBACK_BONUS)
    : (shieldWallSolo ? SHIELD_WALL_SOLO_BONUS : 0);

  const rawSurround = Math.max(0, Number(surroundCount ?? 0));
  const mitigationPool = positionKnown
    ? (formationWorks ? adjacentAllies.length : 0) + (shieldWallLinked ? 1 : 0)
    : (formationWorks || shieldWallLinked ? 1 : 0);
  const surroundMitigation = Math.min(rawSurround, Math.max(0, mitigationPool));

  const notes = [];
  if (formationActive) {
    if (formationWorks) {
      const allies = positionKnown ? listNames(adjacentAllies) : "";
      notes.push(positionKnown && allies
        ? `Строй: +${formationBonus} к защите рядом с ${allies}.`
        : `Строй: +${formationBonus} к защите.`);
    } else {
      notes.push("Строй: нет союзника рядом, бонус не применен.");
    }
  }

  if (shieldWallActive) {
    if (!targetHasShield) {
      notes.push("Стена щитов: нужен экипированный щит.");
    } else if (shieldWallLinked) {
      const allies = positionKnown ? listNames(adjacentShieldAllies) : "";
      notes.push(positionKnown && allies
        ? `Стена щитов: +${shieldWallBonus} к защите вместе с ${allies}.`
        : `Стена щитов: +${shieldWallBonus} к защите.`);
    } else if (shieldWallSolo) {
      notes.push(`Стена щитов: +${shieldWallBonus} к защите, но без соседнего щитоносца.`);
    }
  }

  if (surroundMitigation > 0) {
    notes.push(`Строй удерживает окружение: штраф снижен на ${surroundMitigation}.`);
  }

  return {
    active: true,
    formationActive,
    shieldWallActive,
    positionKnown,
    adjacentAllyCount: adjacentAllies.length,
    adjacentShieldAllyCount: adjacentShieldAllies.length,
    hasShield: targetHasShield,
    formationBonus,
    shieldWallBonus,
    surroundMitigation,
    thresholdBonus: formationBonus + shieldWallBonus + surroundMitigation,
    notes,
  };
}
