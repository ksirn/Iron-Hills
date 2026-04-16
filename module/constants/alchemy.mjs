/**
 * Iron Hills — Алхимия
 * Реагенты и их свойства. Зелья создаются смешиванием реагентов.
 */

// Типы эффектов реагентов
export const REAGENT_EFFECTS = {
  heal:           { label: "Лечение",       icon: "❤",  color: "#4ade80" },
  energy:         { label: "Энергия",       icon: "⚡",  color: "#facc15" },
  mana:           { label: "Мана",          icon: "✦",  color: "#a78bfa" },
  poison:         { label: "Яд",            icon: "☠",  color: "#86efac" },
  antidote:       { label: "Противоядие",   icon: "🛡",  color: "#67e8f9" },
  stimulant:      { label: "Стимулятор",    icon: "⚡",  color: "#fb923c" },
  sedative:       { label: "Седатив",       icon: "💤",  color: "#94a3b8" },
  burn:           { label: "Горение",       icon: "🔥",  color: "#f97316" },
  freeze:         { label: "Заморозка",     icon: "❄",  color: "#7dd3fc" },
  antifever:      { label: "Жаропонижающее",icon: "🌡",  color: "#bfdbfe" },
  hydration:      { label: "Жажда",        icon: "💧",  color: "#38bdf8" },
  satiety:        { label: "Сытость",       icon: "🍖",  color: "#a3e635" },
  volatility:     { label: "Летучесть",     icon: "💨",  color: "#e2e8f0" }, // риск взрыва
};

// Каталог реагентов
export const REAGENTS = {
  herb_comfrey: {
    key: "herb_comfrey", label: "Живокост", icon: "🌿",
    tier: 1, category: "herb",
    effects: [{ type: "heal", potency: 2 }],
    volatility: 0,
  },
  herb_willow: {
    key: "herb_willow", label: "Ива серебристая", icon: "🌿",
    tier: 1, category: "herb",
    effects: [{ type: "antifever", potency: 3 }, { type: "heal", potency: 1 }],
    volatility: 0,
  },
  herb_ginger: {
    key: "herb_ginger", label: "Имбирь", icon: "🫚",
    tier: 1, category: "herb",
    effects: [{ type: "energy", potency: 2 }, { type: "antifever", potency: 1 }],
    volatility: 0,
  },
  mineral_saltpeter: {
    key: "mineral_saltpeter", label: "Селитра", icon: "🪨",
    tier: 1, category: "mineral",
    effects: [{ type: "volatility", potency: 3 }, { type: "burn", potency: 2 }],
    volatility: 3,
  },
  mushroom_redcap: {
    key: "mushroom_redcap", label: "Красная шляпка", icon: "🍄",
    tier: 1, category: "mushroom",
    effects: [{ type: "poison", potency: 4 }],
    volatility: 1,
  },
  mushroom_brightcap: {
    key: "mushroom_brightcap", label: "Светлячок", icon: "🍄",
    tier: 2, category: "mushroom",
    effects: [{ type: "mana", potency: 3 }, { type: "stimulant", potency: 1 }],
    volatility: 1,
  },
  essence_fire: {
    key: "essence_fire", label: "Эссенция огня", icon: "🔥",
    tier: 3, category: "essence",
    effects: [{ type: "burn", potency: 5 }, { type: "energy", potency: 2 }],
    volatility: 4,
  },
  essence_water: {
    key: "essence_water", label: "Эссенция воды", icon: "💧",
    tier: 3, category: "essence",
    effects: [{ type: "heal", potency: 3 }, { type: "hydration", potency: 4 }],
    volatility: 0,
  },
  activated_charcoal: {
    key: "activated_charcoal", label: "Активированный уголь", icon: "⚫",
    tier: 1, category: "mineral",
    effects: [{ type: "antidote", potency: 4 }],
    volatility: 0,
  },
  herb_valerian: {
    key: "herb_valerian", label: "Валериана", icon: "🌿",
    tier: 1, category: "herb",
    effects: [{ type: "sedative", potency: 3 }, { type: "mana", potency: 1 }],
    volatility: 0,
  },
  cave_crystal: {
    key: "cave_crystal", label: "Пещерный кристалл", icon: "💎",
    tier: 3, category: "mineral",
    effects: [{ type: "mana", potency: 6 }, { type: "stimulant", potency: 2 }],
    volatility: 2,
  },
  nightmare_root: {
    key: "nightmare_root", label: "Корень кошмара", icon: "🌑",
    tier: 4, category: "herb",
    effects: [{ type: "poison", potency: 6 }, { type: "sedative", potency: 3 }],
    volatility: 2,
  },
};

// Правила смешивания — какие комбинации эффектов дают что
export const MIXING_RULES = [
  // heal + heal = сильное лечение
  {
    requires: ["heal"],
    minPotency: 4,
    result: { type: "potion", name: "Зелье лечения", effectType: "heal",
      power: (p) => Math.floor(p * 1.5) },
  },
  // energy = зелье энергии
  {
    requires: ["energy"],
    minPotency: 3,
    result: { type: "potion", name: "Зелье энергии", effectType: "restoreEnergy",
      power: (p) => p * 2 },
  },
  // mana = зелье маны
  {
    requires: ["mana"],
    minPotency: 3,
    result: { type: "potion", name: "Зелье маны", effectType: "restoreMana",
      power: (p) => p * 2 },
  },
  // poison = яд (можно намазать на оружие)
  {
    requires: ["poison"],
    minPotency: 2,
    result: { type: "consumable", name: "Яд", effectType: "poison",
      power: (p) => p },
  },
  // antidote = противоядие
  {
    requires: ["antidote"],
    minPotency: 2,
    result: { type: "potion", name: "Противоядие", effectType: "curePoison",
      power: (p) => p },
  },
  // antifever
  {
    requires: ["antifever"],
    minPotency: 2,
    result: { type: "potion", name: "Жаропонижающее", effectType: "cureDisease",
      power: (p) => p },
  },
  // stimulant + energy = мощный стимулятор
  {
    requires: ["stimulant", "energy"],
    minPotency: 4,
    result: { type: "consumable", name: "Стимулятор", effectType: "stimulant",
      power: (p) => p },
  },
  // hydration + satiety = паёк
  {
    requires: ["hydration", "satiety"],
    minPotency: 3,
    result: { type: "food", name: "Концентрат", effectType: null,
      hydration: (p) => p * 3, satiety: (p) => p * 2 },
  },
  // burn = зажигательная смесь
  {
    requires: ["burn"],
    minPotency: 4,
    result: { type: "throwable", name: "Зажигательная смесь", effectType: "burn",
      power: (p) => p },
  },
  // Неизвестная комбинация → испорченное зелье
];

// Расчёт результата смешивания
export function calculateMixResult(reagentKeys, alchemySkillValue) {
  const reagents = reagentKeys.map(k => REAGENTS[k]).filter(Boolean);
  if (!reagents.length) return null;

  // Суммируем эффекты
  const effectTotals = {};
  let totalVolatility = 0;

  for (const r of reagents) {
    totalVolatility += r.volatility ?? 0;
    for (const e of r.effects ?? []) {
      effectTotals[e.type] = (effectTotals[e.type] ?? 0) + e.potency;
    }
  }

  // Ищем подходящее правило
  for (const rule of MIXING_RULES) {
    const hasAll = rule.requires.every(req => (effectTotals[req] ?? 0) >= 1);
    const totalPotency = rule.requires.reduce((s, r) => s + (effectTotals[r] ?? 0), 0);
    if (hasAll && totalPotency >= rule.minPotency) {
      return {
        rule,
        totalPotency,
        totalVolatility,
        effectTotals,
        power: rule.result.power ? rule.result.power(totalPotency) : totalPotency,
        hydration: rule.result.hydration ? rule.result.hydration(totalPotency) : 0,
        satiety: rule.result.satiety ? rule.result.satiety(totalPotency) : 0,
      };
    }
  }

  // Нет подходящего правила → испорченное зелье
  return {
    rule: null,
    totalPotency: 0,
    totalVolatility,
    effectTotals,
    power: 0,
    failed: true,
  };
}
