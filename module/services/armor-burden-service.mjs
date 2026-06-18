import {
  getArmorClassPenalties,
  getArmorClassProfile,
  getArmorClassRequirements,
  normalizeArmorClass,
} from "../constants/armor-profiles.mjs";

const EQUIPMENT_ARMOR_SLOT_KEYS = Object.freeze([
  "head",
  "neck",
  "torso",
  "leftArm",
  "rightArm",
  "legs",
  "leftHand",
  "rightHand",
  "armorHead",
  "armorTorso",
  "armorArms",
  "armorLegs",
]);

const EMPTY_ARMOR_BURDEN = Object.freeze({
  equippedCount: 0,
  armorWeight: 0,
  label: "Без брони",
  classKey: "none",
  classLabel: "Без брони",
  endurance: 0,
  athletics: 0,
  enduranceRequired: 0,
  athleticsRequired: 0,
  enduranceDeficit: 0,
  athleticsDeficit: 0,
  attackPenalty: 0,
  actionSecondsFlat: 0,
  movementPenalty: 0,
  movementMultiplier: 1,
  energyMultiplier: 1,
  hasPenalty: false,
  items: [],
});

function numberOr(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function roundTenth(value) {
  return Math.round(numberOr(value, 0) * 10) / 10;
}

function getActorSkillValue(actor, skillKey) {
  return Math.max(0, numberOr(actor?.system?.skills?.[skillKey]?.value, 0));
}

function getActorItem(actor, itemId) {
  if (!actor || !itemId) return null;
  if (typeof itemId !== "string") return itemId?.type === "armor" ? itemId : null;
  return actor.items?.get?.(itemId) ?? null;
}

export function getEquippedArmorItems(actor) {
  const equipment = actor?.system?.equipment ?? {};
  const seen = new Set();
  const items = [];

  for (const slotKey of EQUIPMENT_ARMOR_SLOT_KEYS) {
    const item = getActorItem(actor, equipment[slotKey]);
    if (!item || item.type !== "armor" || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
  }

  return items;
}

function getItemArmorProfile(item) {
  const system = item?.system ?? {};
  const tier = Math.max(1, Math.min(10, Math.round(numberOr(system.tier, 1))));
  const classKey = normalizeArmorClass(system.armorClass, "medium");
  const profile = getArmorClassProfile(classKey);
  const fallbackRequirements = getArmorClassRequirements(tier, classKey);
  const requirements = system.requirements && typeof system.requirements === "object"
    ? system.requirements
    : fallbackRequirements;
  const penalties = system.penalties && typeof system.penalties === "object"
    ? { ...getArmorClassPenalties(classKey), ...system.penalties }
    : getArmorClassPenalties(classKey);

  return {
    item,
    tier,
    classKey,
    classLabel: system.armorClassLabel ?? profile.label,
    severity: profile.severity,
    weight: Math.max(0, numberOr(system.weight, 0)),
    enduranceRequired: Math.max(0, numberOr(requirements.endurance, fallbackRequirements.endurance)),
    athleticsRequired: Math.max(0, numberOr(requirements.athletics, fallbackRequirements.athletics)),
    penalties,
  };
}

export function getArmorBurdenInfo(actor) {
  const equipped = getEquippedArmorItems(actor).map(getItemArmorProfile);
  if (!equipped.length) return { ...EMPTY_ARMOR_BURDEN, items: [] };

  const endurance = getActorSkillValue(actor, "endurance");
  const athletics = getActorSkillValue(actor, "athletics");
  const armorWeight = roundTenth(equipped.reduce((sum, entry) => sum + entry.weight, 0));
  const top = equipped.reduce((best, entry) => entry.severity > best.severity ? entry : best, equipped[0]);
  const enduranceRequired = equipped.reduce((max, entry) => Math.max(max, entry.enduranceRequired), 0);
  const athleticsRequired = equipped.reduce((max, entry) => Math.max(max, entry.athleticsRequired), 0);
  const enduranceDeficit = Math.max(0, enduranceRequired - endurance);
  const athleticsDeficit = Math.max(0, athleticsRequired - athletics);
  const p = top.penalties ?? {};

  const attackPenalty = Math.floor(
    enduranceDeficit * numberOr(p.attackPenaltyPerEndurance, 0) +
    athleticsDeficit * numberOr(p.attackPenaltyPerAthletics, 0),
  );
  const actionSecondsFlat = roundTenth(
    enduranceDeficit * numberOr(p.actionSecondsPerEndurance, 0) +
    athleticsDeficit * numberOr(p.actionSecondsPerAthletics, 0),
  );
  const movementPenalty = Math.floor(
    enduranceDeficit * numberOr(p.movementPenaltyPerEndurance, 0) +
    athleticsDeficit * numberOr(p.movementPenaltyPerAthletics, 0),
  );
  const extraEnergy = roundTenth(
    enduranceDeficit * numberOr(p.energyMultPerEndurance, 0) +
    athleticsDeficit * numberOr(p.energyMultPerAthletics, 0),
  );
  const movementMultiplier = 1 + Math.max(0, movementPenalty) * 0.1;
  const energyMultiplier = roundTenth(1 + Math.max(0, extraEnergy));
  const hasPenalty =
    attackPenalty > 0 ||
    actionSecondsFlat > 0 ||
    movementPenalty > 0 ||
    energyMultiplier > 1;

  return {
    equippedCount: equipped.length,
    armorWeight,
    label: hasPenalty
      ? `${top.classLabel}: штраф`
      : top.classLabel,
    classKey: top.classKey,
    classLabel: top.classLabel,
    endurance,
    athletics,
    enduranceRequired,
    athleticsRequired,
    enduranceDeficit,
    athleticsDeficit,
    attackPenalty,
    actionSecondsFlat,
    movementPenalty,
    movementMultiplier,
    energyMultiplier,
    hasPenalty,
    items: equipped.map((entry) => ({
      id: entry.item.id,
      name: entry.item.name,
      classKey: entry.classKey,
      classLabel: entry.classLabel,
      tier: entry.tier,
      weight: entry.weight,
      enduranceRequired: entry.enduranceRequired,
      athleticsRequired: entry.athleticsRequired,
    })),
  };
}

export function getArmorActionSecondsPenalty(actor) {
  return numberOr(getArmorBurdenInfo(actor).actionSecondsFlat, 0);
}

export function getArmorEnergyMultiplier(actor) {
  return Math.max(1, numberOr(getArmorBurdenInfo(actor).energyMultiplier, 1));
}
