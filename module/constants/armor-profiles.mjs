export const ARMOR_CLASS_KEYS = Object.freeze(["light", "medium", "heavy"]);
export const ARMOR_BODY_SLOT_KEYS = Object.freeze(["head", "neck", "torso", "leftArm", "rightArm", "legs"]);
export const ARMOR_SHIELD_SLOT_KEYS = Object.freeze(["leftHand", "rightHand", "shield"]);

export const ARMOR_CLASS_PROFILES = Object.freeze({
  light: Object.freeze({
    key: "light",
    label: "Лёгкая",
    shortLabel: "Лёгк.",
    protectionMult: 0.72,
    magicalMult: 0.78,
    durabilityMult: 0.75,
    weightMult: 0.55,
    valueMult: 0.75,
    enduranceReqMult: 0,
    athleticsReqMult: 0,
    attackPenaltyPerEndurance: 0,
    attackPenaltyPerAthletics: 0,
    actionSecondsPerEndurance: 0,
    actionSecondsPerAthletics: 0,
    movementPenaltyPerEndurance: 0,
    movementPenaltyPerAthletics: 0,
    energyMultPerEndurance: 0,
    energyMultPerAthletics: 0,
    severity: 1,
  }),
  medium: Object.freeze({
    key: "medium",
    label: "Средняя",
    shortLabel: "Средн.",
    protectionMult: 1,
    magicalMult: 1,
    durabilityMult: 1,
    weightMult: 1,
    valueMult: 1,
    enduranceReqMult: 0.48,
    athleticsReqMult: 0.42,
    attackPenaltyPerEndurance: 0.3,
    attackPenaltyPerAthletics: 0.15,
    actionSecondsPerEndurance: 0.15,
    actionSecondsPerAthletics: 0.1,
    movementPenaltyPerEndurance: 0.25,
    movementPenaltyPerAthletics: 0.35,
    energyMultPerEndurance: 0.035,
    energyMultPerAthletics: 0.045,
    severity: 2,
  }),
  heavy: Object.freeze({
    key: "heavy",
    label: "Тяжёлая",
    shortLabel: "Тяж.",
    protectionMult: 1.12,
    magicalMult: 1.1,
    durabilityMult: 1.35,
    weightMult: 1.55,
    valueMult: 1.35,
    enduranceReqMult: 0.72,
    athleticsReqMult: 0.66,
    attackPenaltyPerEndurance: 0.55,
    attackPenaltyPerAthletics: 0.25,
    actionSecondsPerEndurance: 0.28,
    actionSecondsPerAthletics: 0.18,
    movementPenaltyPerEndurance: 0.45,
    movementPenaltyPerAthletics: 0.65,
    energyMultPerEndurance: 0.06,
    energyMultPerAthletics: 0.08,
    severity: 3,
  }),
});

const EXCLUDED_VARIANT_SOURCE_IDS = Object.freeze(new Set(["leather_gloves"]));
const LIGHT_PREFIXES = Object.freeze(["leather_", "mithril_"]);
const MEDIUM_PREFIXES = Object.freeze(["chain", "alloy_", "star_", "void_", "celestial_", "orichalcum_"]);
const HEAVY_PREFIXES = Object.freeze(["plate_", "darkiron_", "adamantium_"]);
const HEAVY_SHIELD_IDS = Object.freeze(new Set(["kite_shield", "tower_shield", "darkiron_shield", "eternity_aegis"]));
const LIGHT_SHIELD_IDS = Object.freeze(new Set(["wooden_shield", "mithril_shield"]));

function cleanTier(value) {
  const n = Math.round(Number(value ?? 1));
  return Math.max(1, Math.min(10, Number.isFinite(n) ? n : 1));
}

function roundTenth(value) {
  const n = Number(value);
  return Math.round((Number.isFinite(n) ? n : 0) * 10) / 10;
}

function roundStat(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(1, Math.round(n));
}

function roundWeight(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 10) / 10;
}

function startsWithAny(value, prefixes) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

export function isShieldArmorSlot(slot) {
  return ARMOR_SHIELD_SLOT_KEYS.includes(String(slot ?? ""));
}

function armorImageForRow(row = {}) {
  if (typeof row.img === "string" && row.img.trim()) return row.img;
  if (row.resist && typeof row.resist === "object" && typeof row.resist.img === "string") return row.resist.img;
  if (row.id) return `systems/iron-hills-system/icons/items/armor/${row.id}.webp`;
  return undefined;
}

export function normalizeArmorClass(value, fallback = "medium") {
  const key = String(value ?? "").trim().toLowerCase();
  if (ARMOR_CLASS_PROFILES[key]) return key;
  return ARMOR_CLASS_PROFILES[fallback] ? fallback : "medium";
}

export function getArmorClassProfile(value) {
  return ARMOR_CLASS_PROFILES[normalizeArmorClass(value)];
}

export function inferArmorClassFromArmorRow(row = {}) {
  if (row.armorClass) return normalizeArmorClass(row.armorClass);

  const id = String(row.id ?? "").trim();
  if (isShieldArmorSlot(row.slot)) {
    if (HEAVY_SHIELD_IDS.has(id)) return "heavy";
    if (LIGHT_SHIELD_IDS.has(id)) return "light";
    return "medium";
  }

  if (startsWithAny(id, LIGHT_PREFIXES)) return "light";
  if (startsWithAny(id, HEAVY_PREFIXES)) return "heavy";
  if (startsWithAny(id, MEDIUM_PREFIXES)) return "medium";
  return "medium";
}

export function getArmorClassRequirements(tier, armorClass) {
  const t = cleanTier(tier);
  const profile = getArmorClassProfile(armorClass);
  if (profile.key === "light") return { endurance: 0, athletics: 0 };
  return {
    endurance: Math.max(1, Math.ceil(t * profile.enduranceReqMult)),
    athletics: Math.max(1, Math.ceil(t * profile.athleticsReqMult)),
  };
}

export function getArmorClassDurabilityMax(tier, armorClass, explicit = null) {
  if (explicit && typeof explicit === "object") {
    const max = Math.max(1, Number(explicit.max ?? explicit.value ?? 100));
    return Math.round(max);
  }
  const t = cleanTier(tier);
  const base = 50 + t * 15;
  return Math.max(1, Math.round(base * getArmorClassProfile(armorClass).durabilityMult));
}

export function getArmorClassPenalties(armorClass) {
  const profile = getArmorClassProfile(armorClass);
  return {
    attackPenaltyPerEndurance: profile.attackPenaltyPerEndurance,
    attackPenaltyPerAthletics: profile.attackPenaltyPerAthletics,
    actionSecondsPerEndurance: profile.actionSecondsPerEndurance,
    actionSecondsPerAthletics: profile.actionSecondsPerAthletics,
    movementPenaltyPerEndurance: profile.movementPenaltyPerEndurance,
    movementPenaltyPerAthletics: profile.movementPenaltyPerAthletics,
    energyMultPerEndurance: profile.energyMultPerEndurance,
    energyMultPerAthletics: profile.energyMultPerAthletics,
  };
}

export function withArmorClassDetails(row = {}, armorClass = null) {
  const classKey = normalizeArmorClass(armorClass ?? inferArmorClassFromArmorRow(row));
  const profile = getArmorClassProfile(classKey);
  const requirements = getArmorClassRequirements(row.tier, classKey);
  return {
    ...row,
    armorClass: classKey,
    armorClassLabel: profile.label,
    requirements: {
      ...(row.requirements && typeof row.requirements === "object" ? row.requirements : {}),
      endurance: Number(row.requirements?.endurance ?? requirements.endurance),
      athletics: Number(row.requirements?.athletics ?? requirements.athletics),
    },
    penalties: {
      ...(row.penalties && typeof row.penalties === "object" ? row.penalties : {}),
      ...getArmorClassPenalties(classKey),
    },
  };
}

function scaleProtection(raw, sourceClass, targetClass) {
  const source = getArmorClassProfile(sourceClass);
  const target = getArmorClassProfile(targetClass);
  const protection = raw && typeof raw === "object" && !Array.isArray(raw)
    ? { ...raw }
    : { physical: Number(raw ?? 0), magical: 0 };

  for (const [key, value] of Object.entries(protection)) {
    if (key === "img") continue;
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) continue;
    const sourceMult = key === "magical" ? source.magicalMult : source.protectionMult;
    const targetMult = key === "magical" ? target.magicalMult : target.protectionMult;
    protection[key] = roundStat(n * (targetMult / sourceMult));
  }

  return protection;
}

export function buildArmorClassVariantRow(row = {}, targetClass) {
  const sourceClass = inferArmorClassFromArmorRow(row);
  const classKey = normalizeArmorClass(targetClass);
  const sourceProfile = getArmorClassProfile(sourceClass);
  const targetProfile = getArmorClassProfile(classKey);
  const ratio = (target, source) => target / Math.max(0.001, source);
  const next = {
    ...row,
    id: `${classKey}_${row.id}`,
    label: `${targetProfile.shortLabel} ${row.label}`,
    armorClass: classKey,
    variantOf: row.id,
    resist: scaleProtection(row.resist, sourceClass, classKey),
    weight: roundWeight(Number(row.weight ?? 1) * ratio(targetProfile.weightMult, sourceProfile.weightMult)),
    value: Math.max(1, Math.round(Number(row.value ?? 1) * ratio(targetProfile.valueMult, sourceProfile.valueMult))),
    img: armorImageForRow(row),
  };
  if (row.durability && typeof row.durability === "object") {
    const max = getArmorClassDurabilityMax(row.tier, classKey, row.durability);
    next.durability = { value: max, max };
  }
  return withArmorClassDetails(next, classKey);
}

export function buildArmorClassVariantRows(baseRows = {}) {
  const out = {};
  for (const row of Object.values(baseRows)) {
    if (!row?.id || row.variantOf) continue;
    if (EXCLUDED_VARIANT_SOURCE_IDS.has(row.id)) continue;

    const sourceClass = inferArmorClassFromArmorRow(row);
    out[row.id] = withArmorClassDetails(row, sourceClass);
    for (const classKey of ARMOR_CLASS_KEYS) {
      if (classKey === sourceClass) continue;
      const variant = buildArmorClassVariantRow(row, classKey);
      if (!baseRows[variant.id]) out[variant.id] = variant;
    }
  }

  for (const row of Object.values(baseRows)) {
    if (!row?.id || out[row.id]) continue;
    out[row.id] = withArmorClassDetails(row);
  }
  return out;
}

export function formatArmorClassRequirementLabel(system = {}) {
  const requirements = system.requirements ?? {};
  const endurance = Number(requirements.endurance ?? 0);
  const athletics = Number(requirements.athletics ?? 0);
  if (endurance <= 0 && athletics <= 0) return "без требований";
  const parts = [];
  if (endurance > 0) parts.push(`Выносливость ${endurance}`);
  if (athletics > 0) parts.push(`Атлетика ${athletics}`);
  return parts.join(" / ");
}
