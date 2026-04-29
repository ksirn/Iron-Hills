/**
 * Iron Hills — Merchant Service (PATCH 27)
 * Генерация ассортимента торговца по тиру поселения.
 *
 * Тиры поселений:
 *  1 — Деревня      (медь, базовые зелья, еда, простые инструменты)
 *  2 — Посёлок      (бронза, улучшенные зелья)
 *  3 — Город        (железо+сталь, магические компоненты, заклинания ранг 1-3)
 *  4 — Большой город (сталь+, редкие материалы, заклинания ранг 1-5)
 *  5 — Столица      (всё до митрила, любые заклинания)
 */

import { WEAPONS, ARMORS, POTIONS, FOOD, TOOLS, MATERIALS } from "../constants/items-catalog.mjs";
import { SPELLS } from "../constants/spells-catalog.mjs";

// ── Типы торговцев ──────────────────────────────────────────
export const MERCHANT_TYPES = {
  general:   { id:"general",   label:"Общая лавка",    icon:"🏪", minTier:1 },
  weaponsmith:{ id:"weaponsmith",label:"Оружейник",    icon:"⚔",  minTier:1 },
  armorsmith: { id:"armorsmith", label:"Бронник",      icon:"🛡",  minTier:2 },
  alchemist:  { id:"alchemist",  label:"Алхимик",      icon:"⚗",  minTier:2 },
  mage:       { id:"mage",       label:"Маг-торговец", icon:"✨", minTier:3 },
  jeweler:    { id:"jeweler",    label:"Ювелир",        icon:"💎", minTier:3 },
  blackmarket:{ id:"blackmarket",label:"Чёрный рынок", icon:"🌑", minTier:2 },
};

// ── Максимальный тир товара по тиру поселения ───────────────
function maxItemTier(settlementTier) {
  // Тир поселения напрямую определяет максимальный тир товара
  // Деревня (тир1) → товары до тир2, Город (тир4) → до тир5
  // Iron Hills (тир 1-3) → товары медь/бронза/железо
  return Math.min(10, settlementTier + 1);
}

// Монеты торговца по 10-ступенчатой системе
export const MERCHANT_COINS_BY_TIER = {
  1:  200,    // медь: ~2 серебра
  2:  500,    // медь+серебро
  3:  1500,   // 15 серебра
  4:  5000,   // 50 серебра / 5 золота
  5:  15000,  // 1.5 золота
  6:  40000,  // 4 золота
  7:  100000, // 10 золота
  8:  250000, // 25 золота
  9:  500000, // 50 золота
  10: 1000000,// 100 золота
};

// ── Количество позиций по типу торговца ─────────────────────
const STOCK_SIZE = {
  general:    { weapons:3, armor:3, potions:4, food:6, tools:4, materials:4 },
  weaponsmith:{ weapons:10,armor:0, potions:0, food:0, tools:2, materials:3 },
  armorsmith: { weapons:0, armor:10,potions:0, food:0, tools:2, materials:3 },
  alchemist:  { weapons:0, armor:0, potions:8, food:2, tools:3, materials:5 },
  mage:       { weapons:0, armor:0, potions:4, food:0, tools:0, materials:4, spells:8 },
  jeweler:    { weapons:0, armor:2, potions:0, food:0, tools:0, materials:8 },
  blackmarket:{ weapons:5, armor:3, potions:3, food:0, tools:2, materials:5 },
};

// ── Наценка по типу торговца ────────────────────────────────
const PRICE_MULT = {
  general:    1.2,
  weaponsmith:1.1,
  armorsmith: 1.1,
  alchemist:  1.3,
  mage:       1.5,
  jeweler:    1.4,
  blackmarket:0.8, // дешевле но сомнительного происхождения
};

/**
 * Сгенерировать ассортимент торговца
 * @param {string} merchantType  — ключ из MERCHANT_TYPES
 * @param {number} settlementTier — тир поселения 1-5
 * @param {number} seed — для воспроизводимости (день мира)
 * @returns {Array} массив товаров { item, qty, price }
 */
export function generateMerchantStock(merchantType, settlementTier = 1, seed = 0, settlementId = null, liveEconStatus = null) {
  const maxTier  = maxItemTier(settlementTier);
  const sizes    = STOCK_SIZE[merchantType]  ?? STOCK_SIZE.general;
  const priceMlt = PRICE_MULT[merchantType]  ?? 1.2;

  // Экономика — приоритет: liveEconStatus (из актора) > сохранённый > normal
  const savedEcon   = settlementId ? getSettlementEconomy(settlementId) : { status: "normal" };
  const econId      = liveEconStatus ?? savedEcon.status ?? "normal";
  const economy     = { ...savedEcon, status: econId };
  const econState   = ECONOMY_STATES[econId] ?? ECONOMY_STATES.normal;
  const finalPrice  = priceMlt * econState.priceMult;
  const stockScale  = econState.stockMult;

  // Псевдорандом с сидом (меняется раз в игровой день)
  let rng = seed ^ (settlementTier * 7919);
  const rand    = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return Math.abs(rng) / 0x80000000; };
  const pick    = (arr) => arr[Math.floor(rand() * arr.length)];

  // Размер стока с учётом экономики — и рандом ±30%
  const scaledSize = (base) => Math.max(0, Math.round(base * stockScale * (0.7 + rand() * 0.6)));

  // Шанс что позиция вообще есть в наличии (кризис = низкий шанс)
  const inStock = (chance = 1.0) => rand() < chance * stockScale;

  const stock = [];
  const effectivePrice = finalPrice;

  // Оружие — при войне дорого, при кризисе мало
  if (sizes.weapons) {
    const pool = Object.values(WEAPONS).filter(w => w.tier <= maxTier);
    const count = scaledSize(sizes.weapons);
    for (let i = 0; i < count && pool.length; i++) {
      if (!inStock(economy.status === "war" ? 1.2 : 0.9)) continue;
      const item = pick(pool);
      stock.push({ ...item, itemType:"weapon", qty: 1,
        shopPrice: Math.ceil(item.value * effectivePrice) });
    }
  }

  // Броня
  if (sizes.armor) {
    const pool = Object.values(ARMORS).filter(a => a.tier <= maxTier);
    const count = scaledSize(sizes.armor);
    for (let i = 0; i < count && pool.length; i++) {
      if (!inStock(0.85)) continue;
      const item = pick(pool);
      stock.push({ ...item, itemType:"armor", qty: 1,
        shopPrice: Math.ceil(item.value * effectivePrice) });
    }
  }

  // Зелья — при чуме исчезают
  if (sizes.potions) {
    const pool = Object.values(POTIONS).filter(p => (p.tier ?? 1) <= maxTier);
    const count = scaledSize(sizes.potions);
    for (let i = 0; i < count && pool.length; i++) {
      if (!inStock(economy.status === "plague" ? 0.3 : 0.8)) continue;
      const item = pick(pool);
      stock.push({ ...item, itemType:"potion",
        qty: Math.max(1, Math.ceil(rand() * 3 * stockScale)),
        shopPrice: Math.ceil(item.value * effectivePrice) });
    }
  }

  // Еда — при кризисе/войне/чуме резко падает
  if (sizes.food) {
    const pool = Object.values(FOOD);
    const foodScale = ["crisis","war","plague"].includes(economy.status) ? 0.3 : 1.0;
    const count = scaledSize(sizes.food);
    for (let i = 0; i < count && pool.length; i++) {
      if (!inStock(foodScale)) continue;
      const item = pick(pool);
      stock.push({ ...item, itemType:"food",
        qty: Math.max(1, Math.ceil(rand() * 5 * stockScale)),
        shopPrice: Math.ceil(item.value * effectivePrice) });
    }
  }

  // Инструменты
  if (sizes.tools) {
    const pool = Object.values(TOOLS).filter(t => (t.tier ?? 1) <= maxTier);
    const count = scaledSize(sizes.tools);
    for (let i = 0; i < count && pool.length; i++) {
      if (!inStock(0.75)) continue;
      const item = pick(pool);
      stock.push({ ...item, itemType:"tool",
        qty: Math.max(1, Math.ceil(rand() * 2 * stockScale)),
        shopPrice: Math.ceil(item.value * effectivePrice) });
    }
  }

  // Материалы
  if (sizes.materials) {
    const pool = Object.values(MATERIALS).filter(m => m.tier <= maxTier);
    const count = scaledSize(sizes.materials);
    for (let i = 0; i < count && pool.length; i++) {
      if (!inStock(0.8)) continue;
      const item = pick(pool);
      stock.push({ ...item, itemType:"material",
        qty: Math.max(1, Math.ceil(rand() * 5 * stockScale)),
        shopPrice: Math.ceil(item.value * effectivePrice) });
    }
  }

  // Заклинания
  if (sizes.spells) {
    const maxRank = Math.min(10, settlementTier * 2);
    const pool = Object.values(SPELLS).filter(s => s.rank <= maxRank);
    const count = scaledSize(sizes.spells);
    for (let i = 0; i < count && pool.length; i++) {
      if (!inStock(0.7)) continue;
      const item = pick(pool);
      stock.push({ ...item, itemType:"spell", qty: 1,
        shopPrice: Math.ceil(item.rank * 100 * effectivePrice) });
    }
  }

  return { stock, economy: econState };
}

/**
 * Состояния экономики поселения
 * Хранятся в флагах мира: game.settings.get("iron-hills-system", "settlementEconomy")
 * { settlementId: { status, modifier, note } }
 */
export const ECONOMY_STATES = {
  boom:       { id:"boom",       label:"Расцвет",   icon:"📈", priceMult:0.8,  stockMult:1.5, desc:"Товаров много, цены низкие" },
  normal:     { id:"normal",     label:"Норма",     icon:"⚖",  priceMult:1.0,  stockMult:1.0, desc:"Обычные условия" },
  shortage:   { id:"shortage",   label:"Дефицит",   icon:"📉", priceMult:1.4,  stockMult:0.5, desc:"Мало товаров, цены высокие" },
  crisis:     { id:"crisis",     label:"Кризис",    icon:"🔥", priceMult:2.0,  stockMult:0.3, desc:"Почти нет товаров, огромные цены" },
  war:        { id:"war",        label:"Война",     icon:"⚔",  priceMult:1.8,  stockMult:0.4, desc:"Оружие дорого, еда почти исчезла" },
  festival:   { id:"festival",   label:"Праздник",  icon:"🎉", priceMult:0.9,  stockMult:1.3, desc:"Скидки, много еды и украшений" },
  plague:     { id:"plague",     label:"Чума",      icon:"☠",  priceMult:1.5,  stockMult:0.4, desc:"Мало всего, зелья исчезли" },
};

/**
 * Получить/установить состояние экономики поселения
 */
export function getSettlementEconomy(settlementId) {
  const all = game.settings?.get?.("iron-hills-system", "settlementEconomy") ?? {};
  return all[settlementId] ?? { status: "normal", note: "" };
}

export async function setSettlementEconomy(settlementId, status, note = "") {
  const all = game.settings?.get?.("iron-hills-system", "settlementEconomy") ?? {};
  all[settlementId] = { status, note, updatedAt: game.time?.worldTime ?? 0 };
  await game.settings?.set?.("iron-hills-system", "settlementEconomy", all);
}

/**
 * Описание поселения по тиру
 */
export const SETTLEMENT_TIERS = {
  1: { label:"Деревня",       icon:"🏘", maxType:"general",    desc:"Базовые товары, медь, еда" },
  2: { label:"Посёлок",       icon:"🏠", maxType:"alchemist",  desc:"Бронза, зелья, инструменты" },
  3: { label:"Город",         icon:"🏙", maxType:"mage",       desc:"Железо, маги, заклинания" },
  4: { label:"Большой город", icon:"🏯", maxType:"jeweler",    desc:"Сталь, редкие материалы" },
  5: { label:"Столица",       icon:"👑", maxType:"blackmarket",desc:"Всё включая митрил" },
};

/**
 * Получить доступные типы торговцев для тира поселения
 */
export function getMerchantsForTier(settlementTier) {
  return Object.values(MERCHANT_TYPES).filter(m => m.minTier <= settlementTier);
}
