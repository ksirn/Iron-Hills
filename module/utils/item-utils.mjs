import { num } from "./math-utils.mjs";

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

export function buildItemStackSignatureFromData(itemData) {
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