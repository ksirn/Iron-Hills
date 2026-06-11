import { num } from "./math-utils.mjs";
import { getDamageArmorChannel } from "../services/damage-type-service.mjs";
import { SPELL_SCHOOLS, normalizeSpellSchoolKey } from "../constants/spells-catalog.mjs";
import {
  ITEM_ACTION_TYPE_LABELS,
  ITEM_EFFECT_TYPE_LABELS,
} from "./item-action-config.mjs";
import {
  getConditionLabel,
  normalizeConditionKey,
} from "../services/condition-policy-service.mjs";

/**
 * Базовая дальность атаки оружия в клетках (по навыку).
 * Используется как fallback, если у предмета не задано system.range.
 */
const DEFAULT_WEAPON_RANGE = Object.freeze({
  knife:    1,
  sword:    1,
  axe:      1,
  mace:     1,
  flail:    1,
  spear:    2,
  bow:      8,
  crossbow: 10,
  throwing: 4,
  exotic:   1,
});

export function getDefaultWeaponRange(skill) {
  return DEFAULT_WEAPON_RANGE[skill] ?? 1;
}

/**
 * Эффективная дальность атаки для weapon-item в клетках.
 * Источник истины — system.range; fallback — DEFAULT_WEAPON_RANGE по skill.
 */
export function getWeaponRange(weapon) {
  if (!weapon) return 1;
  const explicit = Number(weapon.system?.range ?? 0);
  if (explicit > 0) return explicit;
  return getDefaultWeaponRange(weapon.system?.skill);
}

/**
 * Affixes — пассивные эффекты оружия (см. template.json/weapon.affixes).
 * Возвращает «раскрытый» объект со всеми ключами и числовыми значениями.
 */
export function getWeaponAffixes(weapon) {
  const a = weapon?.system?.affixes ?? {};
  return {
    ignoreArmor:        Number(a.ignoreArmor        ?? 0),
    disarmChance:       Number(a.disarmChance       ?? 0),
    stunChance:         Number(a.stunChance         ?? 0),
    bleedingBonus:      Number(a.bleedingBonus      ?? 0),
    lifeSteal:          Number(a.lifeSteal          ?? 0),
    executeBelowHp:     Number(a.executeBelowHp     ?? 0),
    criticalDamageMult: Number(a.criticalDamageMult ?? 1),
  };
}

/**
 * Расстояние между двумя token-документами в клетках сетки.
 * Принимает Token, TokenDocument или { x, y }-координаты центра.
 * Возвращает Infinity если что-то не определилось — атака блокируется.
 */
export function getTokenGridDistance(a, b) {
  const canvas = globalThis.canvas;
  if (!a || !b || !canvas?.grid) return Infinity;
  const grid = canvas.grid;
  const size = grid.size || 100;

  const aDoc = a.document ?? a;
  const bDoc = b.document ?? b;

  const ax = Number(aDoc.x ?? 0) + (Number(aDoc.width ?? 1) * size) / 2;
  const ay = Number(aDoc.y ?? 0) + (Number(aDoc.height ?? 1) * size) / 2;
  const bx = Number(bDoc.x ?? 0) + (Number(bDoc.width ?? 1) * size) / 2;
  const by = Number(bDoc.y ?? 0) + (Number(bDoc.height ?? 1) * size) / 2;

  if ([ax, ay, bx, by].some(v => !Number.isFinite(v))) return Infinity;

  // Chebyshev (8-направленная сетка): max(|dx|, |dy|)
  const dx = Math.abs(ax - bx) / size;
  const dy = Math.abs(ay - by) / size;
  return Math.max(dx, dy);
}

/**
 * Найти token актора на текущей сцене.
 * Если несколько — берём controlled, иначе первый.
 */
export function getActorToken(actor) {
  const canvas = globalThis.canvas;
  if (!actor || !canvas?.tokens) return null;
  const placeables = canvas.tokens.placeables ?? [];
  const controlled = placeables.find(t => t.controlled && t.actor?.id === actor.id);
  if (controlled) return controlled;
  return placeables.find(t => t.actor?.id === actor.id) ?? null;
}

export function getItemQuantity(item) {
  const quantity = Math.floor(Number(item?.system?.quantity ?? 1));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

export function getItemTotalWeight(item) {
  return Number(item?.system?.weight ?? 0) * getItemQuantity(item);
}

export function itemTypeLabel(type) {
  const labels = {
    weapon: "Оружие",
    armor: "Броня",
    tool: "Инструменты",
    resource: "Ресурсы",
    food: "Еда",
    material: "Материалы",
    spell: "Заклинания",
    potion: "Зелья",
    scroll: "Свитки",
    throwable: "Метательное",
    consumable: "Расходники"
  };
  return labels[type] ?? type ?? "Прочее";
}

export function getSpellSchoolDisplay(school) {
  const rawKey = String(school ?? "").trim();
  const key = normalizeSpellSchoolKey(rawKey, { fallback: rawKey });
  const schoolDef = SPELL_SCHOOLS[key] ?? null;
  return {
    key,
    rawKey,
    label: schoolDef?.label ?? rawKey,
    icon: schoolDef?.icon ?? "✨",
    color: schoolDef?.color ?? "",
    known: Boolean(schoolDef),
    aliased: Boolean(rawKey && key && rawKey !== key),
  };
}

export function formatSpellSchoolRank(schoolOrSystem, {
  rank = null,
  compact = false,
  includeIcon = true,
} = {}) {
  const systemLike = schoolOrSystem && typeof schoolOrSystem === "object" ? schoolOrSystem : null;
  const school = systemLike ? systemLike.school : schoolOrSystem;
  if (!String(school ?? "").trim()) return "";

  const resolvedRank = rank ?? systemLike?.rank ?? systemLike?.tier ?? 1;
  const schoolDisplay = getSpellSchoolDisplay(school);
  const prefix = includeIcon ? `${schoolDisplay.icon} ` : "";
  const rankLabel = compact ? `р${resolvedRank}` : `ранг ${resolvedRank}`;
  return `${prefix}${schoolDisplay.label} ${rankLabel}`;
}

function itemSystem(itemOrSystem = {}) {
  return itemOrSystem?.system && typeof itemOrSystem.system === "object"
    ? itemOrSystem.system
    : itemOrSystem;
}

function stringValue(value) {
  return String(value ?? "").trim();
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getItemActionLabel(key, { fallback = "" } = {}) {
  const actionKey = stringValue(key);
  if (!actionKey) return fallback;
  return ITEM_ACTION_TYPE_LABELS[actionKey] ?? fallback ?? actionKey;
}

export function getItemEffectLabel(key, { fallback = "" } = {}) {
  const effectKey = stringValue(key);
  if (!effectKey) return fallback;
  return ITEM_EFFECT_TYPE_LABELS[effectKey] ?? fallback ?? effectKey;
}

export function getItemActionDisplay(itemOrSystem = {}) {
  const system = itemSystem(itemOrSystem) ?? {};
  const actionType = stringValue(system.actionType);
  const effectValue = system.effect && typeof system.effect !== "object" ? system.effect : "";
  const effectType = stringValue(system.effectType ?? effectValue);
  const conditionKey = normalizeConditionKey(system.conditionKey);
  const conditionLabel = conditionKey ? getConditionLabel(conditionKey) : "";
  const power = numberValue(system.power, 0);
  const duration = numberValue(system.duration, 0);
  const poison = numberValue(system.appliesPoison, 0);
  const burning = numberValue(system.appliesBurning, 0);

  let label = "";
  if (actionType === "apply-condition" && conditionLabel) {
    label = conditionLabel;
  } else {
    label = getItemActionLabel(actionType, {
      fallback: getItemEffectLabel(effectType, { fallback: "" }),
    });
  }
  if (!label && poison > 0) label = getConditionLabel("poison") ?? "Яд";
  if (!label && burning > 0) label = getConditionLabel("burning") ?? "Горение";

  return {
    actionType,
    effectType,
    conditionKey,
    conditionLabel,
    label,
    power,
    duration,
    poison,
    burning,
    hasPower: power > 0,
    hasDuration: duration > 0,
    hasPoison: poison > 0,
    hasBurning: burning > 0,
  };
}

export function formatItemActionSummary(itemOrSystem = {}, {
  compact = false,
  includeIcon = true,
  includeDuration = true,
} = {}) {
  const display = getItemActionDisplay(itemOrSystem);
  const system = itemSystem(itemOrSystem) ?? {};
  const pieces = [];

  if (display.label) {
    const icon = includeIcon ? "✦ " : "";
    const value = display.hasPower
      ? (compact ? ` +${display.power}` : `: +${display.power}`)
      : "";
    pieces.push(`${icon}${display.label}${value}`);
  } else if (numberValue(system.power, 0) > 0) {
    pieces.push(`${includeIcon ? "✦ " : ""}${compact ? "" : "Сила: "}${numberValue(system.power, 0)}`);
  }

  if (display.hasPoison) {
    pieces.push(`${includeIcon ? "☠ " : ""}${getConditionLabel("poison") ?? "Яд"} +${display.poison}`);
  }
  if (display.hasBurning) {
    pieces.push(`${includeIcon ? "🔥 " : ""}${getConditionLabel("burning") ?? "Горение"} +${display.burning}`);
  }
  if (includeDuration && display.hasDuration) {
    pieces.push(`${compact ? "" : "длительность "}${display.duration}с`);
  }

  return pieces.join(compact ? " · " : " · ");
}

export function getItemQuickSlotIcon(item) {
  const type = item?.type;

  if (type === "weapon") return "⚔";
  if (type === "armor") return "🛡";
  if (type === "food") return "🍖";
  if (type === "potion") return "🧪";
  if (type === "consumable") return "🩹";
  if (type === "throwable") return "🪓";
  if (type === "spell") return "✦";
  if (type === "scroll") return "📜";
  if (type === "tool") return "🛠";
  if (type === "material") return "◼";
  if (type === "resource") return "⬢";

  return "•";
}

export function getQualityPriceMultiplier(quality) {
  const map = {
    common: 1,
    fine: 1.5,
    masterwork: 2.25,
    legendary: 4
  };

  return map[quality] ?? 1;
}

export function getBaseItemTypePrice(type) {
  const map = {
    weapon: 20,
    armor: 24,
    tool: 14,
    resource: 4,
    food: 3,
    material: 5,
    spell: 30,
    potion: 18,
    scroll: 22,
    throwable: 10,
    consumable: 8
  };
  Object.assign(map, {
    jewelry: 20,
    belt: 18,
    backpack: 25,
    attachment: 12,
    ammo: 2,
  });

  return map[type] ?? 5;
}

export function getComputedItemUnitPrice(item) {
  if (!item) return 0;

  const explicitPrice = Number(item.system?.price ?? item.system?.value ?? 0);
  if (Number.isFinite(explicitPrice) && explicitPrice > 0) {
    return Math.max(0, Math.round(explicitPrice));
  }

  const type = item.type;
  const tier = Math.max(1, Number(item.system?.tier ?? 1));
  const quality = item.system?.quality ?? "common";
  const qualityMult = getQualityPriceMultiplier(quality);

  let price = getBaseItemTypePrice(type) * tier * qualityMult;

  if (type === "weapon") {
    price += Number(item.system?.damage ?? 0) * 6;
    price += Number(item.system?.energyCost ?? 0) * 0.4;
    if (item.system?.twoHanded) price += 10;
    if (getDamageArmorChannel(item.system?.damageType) === "magical") price += 14;
  }

  if (type === "armor") {
    price += Number(item.system?.protection?.physical ?? 0) * 7;
    price += Number(item.system?.protection?.magical ?? 0) * 10;
  }

  if (type === "food") {
    price += Number(item.system?.satiety ?? 0) * 0.35;
    price += Number(item.system?.hydration ?? 0) * 0.2;
  }

  if (type === "potion") {
    price += Number(item.system?.power ?? 0) * 4.5;
  }

  if (type === "scroll") {
    price += Number(item.system?.power ?? 0) * 5;
    if (item.system?.school) price += 8;
  }

  if (type === "spell") {
    price += Number(item.system?.power ?? 0) * 7;
    price += Number(item.system?.manaCost ?? 0) * 1.2;
    if (item.system?.school) price += 10;
  }

  if (type === "throwable") {
    price += Number(item.system?.power ?? 0) * 3.5;
    price += Number(item.system?.appliesPoison ?? 0) * 6;
    price += Number(item.system?.appliesBurning ?? 0) * 6;
    if (getDamageArmorChannel(item.system?.damageType) === "magical") price += 8;
  }

  if (type === "consumable") {
    price += Number(item.system?.power ?? 0) * 3;
  }

  if (type === "tool") {
    price += Number(item.system?.quickSlotBonus ?? 0) * 12;
    if (item.system?.craftType) price += 8;
  }

  if (type === "belt" || type === "backpack") {
    const cols = Number(item.system?.containerSlots?.cols ?? 0);
    const rows = Number(item.system?.containerSlots?.rows ?? 0);
    const slots = Math.max(0, cols * rows);
    price += slots * 1.5;
    price += Number(item.system?.attachmentSlots?.length ?? 0) * 8;
    price += Math.max(0, 1 - Number(item.system?.weightFactor ?? 1)) * 20;
  }

  if (type === "attachment") {
    const cols = Number(item.system?.addsSlots?.cols ?? 0);
    const rows = Number(item.system?.addsSlots?.rows ?? 0);
    price += Math.max(0, cols * rows) * 4;
    price += Number(item.system?.allowedSkills?.length ?? 0) * 2;
  }

  if (type === "material" || type === "resource") {
    price += Number(item.system?.weight ?? 0) * 0.5;
  }

  price = Math.max(1, Math.round(price));
  return price;
}

export function getComputedItemTotalPrice(item) {
  return getComputedItemUnitPrice(item) * getItemQuantity(item);
}

export function cloneItemDataForTransfer(item, quantity = 1) {
  const cloned = item.toObject();
  const transferQuantity = Math.max(1, Math.floor(Number(quantity ?? 1) || 1));
  cloned.system = foundry.utils.deepClone(cloned.system ?? {});
  cloned.system.quantity = transferQuantity;
  cloned.flags = foundry.utils.deepClone(cloned.flags ?? {});
  if (cloned.flags["iron-hills-system"]) {
    cloned.flags["iron-hills-system"].gridPos = null;
    cloned.flags["iron-hills-system"].sectionKey = null;
    cloned.flags["iron-hills-system"].container = null;
  }
  delete cloned._id;
  return cloned;
}

/** Только боеприпасы стакаются — всё остальное отдельными предметами (как в Таркове) */
export const STACKABLE_TYPES = new Set([
  "ammo",      // стрелы, болты, ядра
  "throwable", // метательные (если тип ammo не используется)
]);

export function isStackable(typeOrItem) {
  const type = typeof typeOrItem === "string" ? typeOrItem : (typeOrItem?.type ?? "");
  return STACKABLE_TYPES.has(type);
}

export function buildItemStackSignatureFromData(itemData) {
  // Нестакаемые предметы всегда уникальны — возвращаем уникальный ключ
  if (!isStackable(itemData.type ?? "")) {
    return `__unique__${Math.random()}`;
  }

  const system = foundry.utils.deepClone(itemData.system ?? {});
  delete system.quantity;

  return JSON.stringify({
    name: itemData.name ?? "",
    type: itemData.type ?? "",
    system
  });
}

export function buildItemStackSignature(item) {
  return buildItemStackSignatureFromData(item.toObject());
}
