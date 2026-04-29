import { num } from "./math-utils.mjs";

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
  if (!actor || !canvas?.tokens) return null;
  const placeables = canvas.tokens.placeables ?? [];
  const controlled = placeables.find(t => t.controlled && t.actor?.id === actor.id);
  if (controlled) return controlled;
  return placeables.find(t => t.actor?.id === actor.id) ?? null;
}

export function getItemQuantity(item) {
  return Number(item.system?.quantity ?? 1);
}

export function getItemTotalWeight(item) {
  return Number(item.system?.weight ?? 0) * getItemQuantity(item);
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

  return map[type] ?? 5;
}

export function getComputedItemUnitPrice(item) {
  if (!item) return 0;

  const explicitPrice = Number(item.system?.price ?? 0);
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
    if (item.system?.damageType === "magical") price += 14;
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
  }

  if (type === "consumable") {
    price += Number(item.system?.power ?? 0) * 3;
  }

  if (type === "tool") {
    price += Number(item.system?.quickSlotBonus ?? 0) * 12;
    if (item.system?.craftType) price += 8;
  }

  if (type === "material" || type === "resource") {
    price += Number(item.system?.weight ?? 0) * 0.5;
  }

  price = Math.max(1, Math.round(price));
  return price;
}

export function getComputedItemTotalPrice(item) {
  const quantity = Math.max(1, Number(item.system?.quantity ?? 1));
  return getComputedItemUnitPrice(item) * quantity;
}

export function cloneItemDataForTransfer(item, quantity = 1) {
  const cloned = item.toObject();
  cloned.system = foundry.utils.deepClone(cloned.system ?? {});
  cloned.system.quantity = quantity;
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