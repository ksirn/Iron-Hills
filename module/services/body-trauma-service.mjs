export const BODY_TRAUMA_PART_KEYS = Object.freeze([
  "head",
  "torso",
  "abdomen",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
]);

export const LEGACY_TRAUMA_FRACTURE_PART_KEYS = new Set([
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
]);

export const DEFAULT_BODY_TRAUMA_STATUS = Object.freeze({
  minorBleeding: 0,
  majorBleeding: 0,
  fracture: false,
  destroyed: false,
  splinted: false,
  tourniquet: false,
});

const ARM_PART_KEYS = new Set(["leftArm", "rightArm"]);
const LEG_PART_KEYS = new Set(["leftLeg", "rightLeg"]);
const VITAL_PART_KEYS = new Set(["head", "torso"]);

function clampNonNegativeInt(value) {
  return Math.max(0, Math.floor(Number(value ?? 0)));
}

function normalizeBoolStatus(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (value && typeof value === "object") {
    if (typeof value.active === "boolean") return value.active;
    if (typeof value.value === "number") return value.value > 0;
  }
  return false;
}

export function actorHasBodyHp(actor) {
  return Boolean(actor?.system?.resources?.hp?.torso);
}

export function getBodyPartHpNode(actor, partKey) {
  return actor?.system?.resources?.hp?.[partKey] ?? null;
}

export function getBodyPartStatusValue(actor, partKey, statusKey) {
  const raw = actor?.system?.resources?.hp?.[partKey]?.status?.[statusKey];

  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  if (raw && typeof raw === "object") {
    if (typeof raw.value === "number") return raw.value;
    if (typeof raw.active === "boolean") return raw.active ? 1 : 0;
  }

  return 0;
}

export function getBodyPartStatusBool(actor, partKey, statusKey) {
  return normalizeBoolStatus(actor?.system?.resources?.hp?.[partKey]?.status?.[statusKey]);
}

export function getBodyPartTraumaStatus(actor, partKey) {
  const rawHpNode = getBodyPartHpNode(actor, partKey);
  const hpNode = rawHpNode ?? {};
  const hasHpNode = Boolean(rawHpNode);
  const status = hpNode.status ?? {};
  const currentHp = Number(hpNode.value ?? 0);
  const maxHp = Number(hpNode.max ?? 0);
  const splinted = normalizeBoolStatus(status.splinted);
  const tourniquet = normalizeBoolStatus(status.tourniquet);
  const minorBleeding = clampNonNegativeInt(status.minorBleeding);
  const majorBleeding = clampNonNegativeInt(status.majorBleeding);
  const activeMajorBleeding = tourniquet ? 0 : majorBleeding;
  const suppressedMajorBleeding = Math.max(0, majorBleeding - activeMajorBleeding);
  const destroyed = hasHpNode && (currentHp <= 0 || normalizeBoolStatus(status.destroyed));
  const fracture = normalizeBoolStatus(status.fracture) && !splinted;

  return {
    partKey,
    currentHp,
    maxHp,
    hpRatio: maxHp > 0 ? Math.max(0, Math.min(1, currentHp / maxHp)) : 1,
    destroyed,
    fracture,
    splinted,
    tourniquet,
    minorBleeding,
    majorBleeding,
    activeMajorBleeding,
    suppressedMajorBleeding,
    bleedingPressure: minorBleeding + activeMajorBleeding * 2,
  };
}

export function getBodyPartTraumaSnapshot(actor, partKey) {
  const hpNode = getBodyPartHpNode(actor, partKey) ?? {};
  return {
    ...getBodyPartTraumaStatus(actor, partKey),
    value: Number(hpNode.value ?? 0),
    max: Number(hpNode.max ?? 0),
    status: hpNode.status ?? {},
  };
}

function getLowHpEnergyPenalty(part) {
  if (!part || !(part.maxHp > 0)) return 0;
  if (part.currentHp <= 0) return 4;
  if (part.hpRatio <= 0.25) return 3;
  if (part.hpRatio <= 0.5) return 1;
  return 0;
}

export function getAbdomenEnergyPenalty(summaryOrActor) {
  const summary = summaryOrActor?.parts
    ? summaryOrActor
    : getActorBodyTraumaSummary(summaryOrActor);
  const abdomen = summary?.parts?.abdomen;
  if (!abdomen) return 0;

  const bleedingPenalty = abdomen.bleedingPressure;
  const traumaPenalty =
    (abdomen.destroyed ? 6 : 0) +
    (abdomen.fracture ? 2 : 0) +
    getLowHpEnergyPenalty(abdomen);

  return Math.min(12, clampNonNegativeInt(bleedingPenalty + traumaPenalty));
}

export function getActorBodyTraumaSummary(actor) {
  const parts = {};
  let minorBleedingTotal = 0;
  let majorBleedingTotal = 0;
  let majorBleedingRawTotal = 0;
  let suppressedMajorBleedingTotal = 0;
  let fracturesTotal = 0;
  let splintedTotal = 0;
  let destroyedTotal = 0;
  let destroyedArms = 0;
  let destroyedLegs = 0;
  let destroyedVital = false;

  for (const partKey of BODY_TRAUMA_PART_KEYS) {
    const part = getBodyPartTraumaStatus(actor, partKey);
    parts[partKey] = part;

    minorBleedingTotal += part.minorBleeding;
    majorBleedingTotal += part.activeMajorBleeding;
    majorBleedingRawTotal += part.majorBleeding;
    suppressedMajorBleedingTotal += part.suppressedMajorBleeding;

    if (part.fracture) fracturesTotal += 1;
    if (part.splinted) splintedTotal += 1;
    if (part.destroyed) {
      destroyedTotal += 1;
      if (ARM_PART_KEYS.has(partKey)) destroyedArms += 1;
      if (LEG_PART_KEYS.has(partKey)) destroyedLegs += 1;
      if (VITAL_PART_KEYS.has(partKey)) destroyedVital = true;
    }
  }

  const armFractures =
    (parts.leftArm?.fracture ? 1 : 0) +
    (parts.rightArm?.fracture ? 1 : 0);
  const legFractures =
    (parts.leftLeg?.fracture ? 1 : 0) +
    (parts.rightLeg?.fracture ? 1 : 0);
  const activeBleedingTotal = minorBleedingTotal + majorBleedingTotal * 2;
  const traumaShock =
    majorBleedingTotal +
    armFractures +
    legFractures +
    destroyedArms +
    destroyedLegs +
    (destroyedVital ? 100 : 0);

  const summary = {
    hasBodyHp: actorHasBodyHp(actor),
    parts,
    minorBleedingTotal,
    majorBleedingTotal,
    majorBleedingRawTotal,
    suppressedMajorBleedingTotal,
    activeBleedingTotal,
    fracturesTotal,
    splintedTotal,
    destroyedTotal,
    destroyedArms,
    destroyedLegs,
    destroyedVital,
    armFractures,
    legFractures,
    traumaShock,
    hasActiveBleeding: activeBleedingTotal > 0,
    hasSuppressedBleeding: suppressedMajorBleedingTotal > 0,
  };

  summary.abdomenEnergyPenalty = getAbdomenEnergyPenalty(summary);
  return summary;
}

export function buildActorRestProfile(actor, type = "short") {
  const summary = getActorBodyTraumaSummary(actor);
  const resources = actor?.system?.resources ?? {};
  const energy = resources.energy ?? {};
  const mana = resources.mana ?? {};
  const endurance = Math.max(0, Number(actor?.system?.skills?.endurance?.value ?? 1));
  const conditions = actor?.system?.conditions ?? {};

  const currentEnergy = Number(energy.value ?? 0);
  const baseEnergyMax = Number(energy.baseMax ?? energy.max ?? 10);
  const currentEnergyMax = Number(energy.max ?? baseEnergyMax);
  const currentMana = Number(mana.value ?? 0);
  const maxMana = Number(mana.max ?? 50);
  const bleeding = Math.max(
    clampNonNegativeInt(conditions.bleeding),
    clampNonNegativeInt(summary.activeBleedingTotal),
  );
  const shock = Math.max(clampNonNegativeInt(conditions.shock), clampNonNegativeInt(summary.traumaShock));
  const poison = clampNonNegativeInt(conditions.poison);
  const burning = clampNonNegativeInt(conditions.burning);
  const missingEnergyMax = Math.max(0, baseEnergyMax - currentEnergyMax);
  const recoveredEnergyMax = type === "full"
    ? missingEnergyMax
    : Math.min(
        missingEnergyMax,
        Math.max(missingEnergyMax > 0 ? 1 : 0, Math.floor(missingEnergyMax * 0.5)),
      );
  const nextEnergyMax = Math.min(baseEnergyMax, currentEnergyMax + recoveredEnergyMax);
  const energyBaseGain = 20 + endurance * 2;
  const energyRecoveryPenalty =
    bleeding * 2 +
    summary.abdomenEnergyPenalty +
    Math.floor(shock / 2) +
    poison +
    burning * 2;
  const manaRecoveryPenalty = Math.floor(shock / 2) + Math.floor(poison / 2);
  const restoredEnergy = type === "full"
    ? Math.max(0, nextEnergyMax - currentEnergy)
    : Math.max(0, energyBaseGain - energyRecoveryPenalty);
  const restoredMana = type === "full"
    ? Math.max(0, maxMana - currentMana)
    : Math.max(0, 10 + Math.floor(endurance / 2) - manaRecoveryPenalty);
  const blockers = [];

  if (type === "full") {
    if (bleeding > 0) blockers.push("bleeding");
    if (burning > 0) blockers.push("burning");
  }

  return {
    type,
    actor,
    summary,
    endurance,
    bleeding,
    shock,
    poison,
    burning,
    abdomenEnergyPenalty: summary.abdomenEnergyPenalty,
    currentEnergy,
    currentEnergyMax,
    baseEnergyMax,
    nextEnergyMax,
    missingEnergyMax,
    recoveredEnergyMax,
    currentMana,
    maxMana,
    restoredEnergy,
    restoredMana,
    nextEnergy: type === "full"
      ? nextEnergyMax
      : Math.min(nextEnergyMax, currentEnergy + restoredEnergy),
    nextMana: type === "full"
      ? maxMana
      : Math.min(maxMana, currentMana + restoredMana),
    energyRecoveryPenalty,
    manaRecoveryPenalty,
    blockers,
    blocked: blockers.length > 0,
  };
}
