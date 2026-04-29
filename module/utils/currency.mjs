
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

// Базовые цены для расчёта ступеней
export const TIER_PRICE_MULT = [1, 3, 8, 20, 60, 150, 400, 1000, 2500, 6000];
