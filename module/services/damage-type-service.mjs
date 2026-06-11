export const DAMAGE_TYPE_KEYS = Object.freeze([
  "physical",
  "magical",
  "fire",
  "ice",
  "lightning",
  "shadow",
  "holy",
  "poison",
  "healing",
  "none",
  "true",
]);

export const DAMAGE_ARMOR_CHANNEL_KEYS = Object.freeze(["physical", "magical", "none"]);

export const DAMAGE_RESISTANCE_TYPE_KEYS = Object.freeze([
  "physical",
  "magical",
  "fire",
  "ice",
  "lightning",
  "shadow",
  "holy",
  "poison",
]);

export const DAMAGE_TYPE_LABELS = Object.freeze({
  physical: "Физический",
  magical: "Магический",
  fire: "Огонь",
  ice: "Лёд",
  lightning: "Молния",
  shadow: "Тьма",
  holy: "Святость",
  poison: "Яд",
  healing: "Лечение",
  none: "Нет",
  true: "Чистый",
});

export const DAMAGE_TYPE_ICONS = Object.freeze({
  physical: "⚔",
  magical: "✦",
  fire: "🔥",
  ice: "❄",
  lightning: "⚡",
  shadow: "☾",
  holy: "☀",
  poison: "☠",
  healing: "✚",
  none: "—",
  true: "◆",
});

export const DAMAGE_ARMOR_CHANNEL_LABELS = Object.freeze({
  physical: "Физическая броня",
  magical: "Магическая броня",
  none: "Игнорирует броню",
});

const DAMAGE_TYPE_SET = new Set(DAMAGE_TYPE_KEYS);

const DAMAGE_TYPE_ALIASES = Object.freeze({
  magic: "magical",
  arcane: "magical",
  flame: "fire",
  burn: "fire",
  burning: "fire",
  cold: "ice",
  frost: "ice",
  electric: "lightning",
  electricity: "lightning",
  shock: "lightning",
  dark: "shadow",
  darkness: "shadow",
  necrotic: "shadow",
  negative: "shadow",
  radiant: "holy",
  light: "holy",
  divine: "holy",
  toxic: "poison",
  toxin: "poison",
  venom: "poison",
  heal: "healing",
  healing: "healing",
  restore: "healing",
  no: "none",
  null: "none",
  pure: "true",
  direct: "true",
});

const DAMAGE_ARMOR_CHANNEL_BY_TYPE = Object.freeze({
  physical: "physical",
  magical: "magical",
  fire: "magical",
  ice: "magical",
  lightning: "magical",
  shadow: "magical",
  holy: "magical",
  poison: "magical",
  healing: "none",
  none: "none",
  true: "none",
});

function cleanKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function finiteNumberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeFallback(fallback) {
  const raw = cleanKey(fallback);
  const aliased = DAMAGE_TYPE_ALIASES[raw] ?? raw;
  return DAMAGE_TYPE_SET.has(aliased) ? aliased : "physical";
}

export function normalizeDamageType(value = "physical", { fallback = "physical" } = {}) {
  const raw = cleanKey(value);
  if (!raw) return normalizeFallback(fallback);

  const aliased = DAMAGE_TYPE_ALIASES[raw] ?? raw;
  if (DAMAGE_TYPE_SET.has(aliased)) return aliased;
  return normalizeFallback(fallback);
}

export function isSupportedDamageType(value) {
  const raw = cleanKey(value);
  if (!raw) return false;
  return DAMAGE_TYPE_SET.has(DAMAGE_TYPE_ALIASES[raw] ?? raw);
}

export function getDamageTypeLabel(value = "physical", { fallback = "physical", withIcon = true } = {}) {
  const normalized = normalizeDamageType(value, { fallback });
  const label = DAMAGE_TYPE_LABELS[normalized] ?? normalized;
  if (!withIcon) return label;
  const icon = DAMAGE_TYPE_ICONS[normalized] ?? "";
  return icon ? `${icon} ${label}` : label;
}

export function getDamageTypeOptions({ includePassive = false, includeTrue = false } = {}) {
  const hidden = new Set([
    ...(!includePassive ? ["healing", "none"] : []),
    ...(!includeTrue ? ["true"] : []),
  ]);
  return DAMAGE_TYPE_KEYS
    .filter(key => !hidden.has(key))
    .map(key => ({
      key,
      label: getDamageTypeLabel(key),
      armorChannel: getDamageArmorChannel(key),
    }));
}

export function getDamageResistanceOptions(source = {}) {
  const values = source && typeof source === "object" && !Array.isArray(source) ? source : {};
  return DAMAGE_RESISTANCE_TYPE_KEYS.map(key => ({
    key,
    label: getDamageTypeLabel(key),
    armorChannel: getDamageArmorChannel(key),
    value: Math.max(0, Number(values[key] ?? 0) || 0),
  }));
}

export function getDamageArmorChannel(damageType = "physical") {
  const normalized = normalizeDamageType(damageType);
  return DAMAGE_ARMOR_CHANNEL_BY_TYPE[normalized] ?? "physical";
}

export function getDamageArmorChannelLabel(damageTypeOrChannel = "physical") {
  const raw = String(damageTypeOrChannel ?? "");
  const key = DAMAGE_ARMOR_CHANNEL_KEYS.includes(raw)
    ? raw
    : getDamageArmorChannel(damageTypeOrChannel);
  return DAMAGE_ARMOR_CHANNEL_LABELS[key] ?? key;
}

export function isShieldBlockableDamageType(damageType = "physical") {
  return getDamageArmorChannel(damageType) === "physical";
}

export function ignoresArmor(damageType = "physical") {
  return getDamageArmorChannel(damageType) === "none";
}

export function isHealingDamageType(damageType = "physical") {
  return normalizeDamageType(damageType, { fallback: "none" }) === "healing";
}

function pushObjectResistCandidates(candidates, object, damageType, armorChannel) {
  if (!object || typeof object !== "object") return;
  candidates.push(object[damageType]);
  candidates.push(object[armorChannel]);
}

export function getDamageResistanceValue(source = {}, damageType = "physical", { fallback = 0 } = {}) {
  const normalized = normalizeDamageType(damageType);
  const armorChannel = getDamageArmorChannel(normalized);
  if (armorChannel === "none") return 0;

  const candidates = [];
  pushObjectResistCandidates(candidates, source, normalized, armorChannel);
  pushObjectResistCandidates(candidates, source?.protection, normalized, armorChannel);
  pushObjectResistCandidates(candidates, source?.resist, normalized, armorChannel);
  pushObjectResistCandidates(candidates, source?.armor, normalized, armorChannel);

  if (armorChannel === "physical") {
    candidates.push(source?.resist);
    candidates.push(source?.protection);
  } else if (armorChannel === "magical") {
    candidates.push(source?.resistMag);
    candidates.push(source?.resistMagic);
    candidates.push(source?.protectionMagical);
  }

  for (const candidate of candidates) {
    const value = finiteNumberOrNull(candidate);
    if (value !== null) return Math.max(0, value);
  }

  return Math.max(0, Number(fallback) || 0);
}
