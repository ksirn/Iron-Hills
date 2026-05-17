
/**
 * Форматирование цены в валюту Iron Hills
 * 1 золотой = 100 серебра = 10000 меди
 */
export function formatCurrency(copper) {
  if (!copper || copper <= 0) return "—";
  const gold   = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const cop    = copper % 100;
  const parts  = [];
  if (gold)   parts.push(`${gold} зол.`);
  if (silver) parts.push(`${silver} сер.`);
  if (cop)    parts.push(`${cop} мед.`);
  return parts.join(" ") || "0 мед.";
}

export function copperFromValue(value) {
  return Math.round(value);
}

export const COPPER_PER_SILVER = 100;
export const COPPER_PER_GOLD = 10000;

export function coinsToCopper(coins = {}) {
  return Math.max(0,
    Number(coins?.copper ?? 0) +
    Number(coins?.silver ?? 0) * COPPER_PER_SILVER +
    Number(coins?.gold ?? 0) * COPPER_PER_GOLD
  );
}

export function copperToCoins(copper = 0) {
  const total = Math.max(0, Math.floor(Number(copper ?? 0)));
  return {
    gold: Math.floor(total / COPPER_PER_GOLD),
    silver: Math.floor((total % COPPER_PER_GOLD) / COPPER_PER_SILVER),
    copper: total % COPPER_PER_SILVER,
  };
}

export function currencyUpdateData(path, copper = 0) {
  const coins = copperToCoins(copper);
  return {
    [`${path}.gold`]: coins.gold,
    [`${path}.silver`]: coins.silver,
    [`${path}.copper`]: coins.copper,
  };
}

// Базовые цены для расчёта ступеней
export const TIER_PRICE_MULT = [1, 3, 8, 20, 60, 150, 400, 1000, 2500, 6000];
