/**
 * Iron Hills — Каталог болезней
 * Каждая болезнь имеет стадии 0-3 (инкубация/лёгкая/тяжёлая/критическая)
 * progress: 0-100 внутри стадии
 */

export const DISEASES = {

  // ── Инфекции ──────────────────────────────────────────

  fever: {
    key:   "fever",
    label: "Лихорадка",
    icon:  "🌡",
    source: ["wet", "cold", "wound"],   // причины заражения
    stages: [
      { label: "Инкубация",  hoursToNext: 12, symptoms: [] },
      { label: "Лёгкая",    hoursToNext: 24, symptoms: [
        { type: "energyMaxPenalty", value: 10 },
        { type: "hydrationDrain",   value: 2  },
      ]},
      { label: "Тяжёлая",   hoursToNext: 48, symptoms: [
        { type: "energyMaxPenalty", value: 25 },
        { type: "hydrationDrain",   value: 5  },
        { type: "attackPenalty",    value: 2  },
      ]},
      { label: "Критическая", hoursToNext: null, symptoms: [
        { type: "energyMaxPenalty", value: 50 },
        { type: "hydrationDrain",   value: 8  },
        { type: "attackPenalty",    value: 4  },
        { type: "hpDrainTorso",    value: 1  },
      ]},
    ],
    cures: ["herb_willow", "potion_antifever", "rest_48h"],
    naturalCureChance: 0.1,  // 10% в час при отдыхе
  },

  infection: {
    key:   "infection",
    label: "Заражение раны",
    icon:  "🦠",
    source: ["wound_untreated"],
    stages: [
      { label: "Начало",    hoursToNext: 6,  symptoms: [] },
      { label: "Воспаление", hoursToNext: 12, symptoms: [
        { type: "woundHealPenalty", value: 0.5 },
      ]},
      { label: "Нагноение", hoursToNext: 24, symptoms: [
        { type: "energyMaxPenalty", value: 15 },
        { type: "woundHealPenalty", value: 1.0 },
        { type: "bleedingRisk",     value: 0.3 },
      ]},
      { label: "Гангрена",  hoursToNext: null, symptoms: [
        { type: "energyMaxPenalty", value: 40 },
        { type: "hpDrainLimb",     value: 2  },
        { type: "amputation_risk",  value: 0.1 },
      ]},
    ],
    cures: ["potion_antibacterial", "surgery", "herb_comfrey"],
    naturalCureChance: 0.0,
  },

  poisoning: {
    key:   "poisoning",
    label: "Отравление",
    icon:  "☠",
    source: ["poison_item", "bad_food", "toxic_water"],
    stages: [
      { label: "Начало",    hoursToNext: 2,  symptoms: [
        { type: "nausea", value: 1 },
      ]},
      { label: "Острое",    hoursToNext: 6,  symptoms: [
        { type: "energyMaxPenalty", value: 20 },
        { type: "satietyDrain",     value: 3  },
        { type: "hydrationDrain",   value: 3  },
      ]},
      { label: "Тяжёлое",  hoursToNext: 12, symptoms: [
        { type: "energyMaxPenalty", value: 40 },
        { type: "attackPenalty",    value: 3  },
        { type: "hpDrainTorso",    value: 2  },
      ]},
      { label: "Летальное", hoursToNext: null, symptoms: [
        { type: "energyMaxPenalty", value: 80 },
        { type: "hpDrainTorso",    value: 5  },
      ]},
    ],
    cures: ["potion_antidote", "herb_activated_charcoal"],
    naturalCureChance: 0.05,
  },

  exhaustion: {
    key:   "exhaustion",
    label: "Истощение",
    icon:  "💤",
    source: ["no_sleep_48h", "energy_zero_repeated"],
    stages: [
      { label: "Усталость",     hoursToNext: 12, symptoms: [
        { type: "attackPenalty", value: 1 },
      ]},
      { label: "Изнурение",     hoursToNext: 24, symptoms: [
        { type: "energyMaxPenalty", value: 20 },
        { type: "attackPenalty",    value: 2  },
        { type: "manaMaxPenalty",   value: 10 },
      ]},
      { label: "Истощение",     hoursToNext: 48, symptoms: [
        { type: "energyMaxPenalty", value: 40 },
        { type: "attackPenalty",    value: 4  },
        { type: "manaMaxPenalty",   value: 20 },
        { type: "hallucinationRisk", value: 0.2 },
      ]},
      { label: "Критическое",   hoursToNext: null, symptoms: [
        { type: "energyMaxPenalty", value: 70 },
        { type: "attackPenalty",    value: 6  },
        { type: "unconscious_risk", value: 0.3 },
      ]},
    ],
    cures: ["sleep_8h", "potion_stimulant"],
    naturalCureChance: 0.0,
  },

  cold: {
    key:   "cold",
    label: "Простуда",
    icon:  "🤧",
    source: ["wet", "cold", "cold_sleep"],
    stages: [
      { label: "Начало",   hoursToNext: 8,  symptoms: [] },
      { label: "Лёгкая",   hoursToNext: 24, symptoms: [
        { type: "energyMaxPenalty", value: 5 },
      ]},
      { label: "Сильная",  hoursToNext: 48, symptoms: [
        { type: "energyMaxPenalty", value: 15 },
        { type: "attackPenalty",    value: 1  },
        { type: "castPenalty",      value: 1  },
      ]},
      { label: "Пневмония", hoursToNext: null, symptoms: [
        { type: "energyMaxPenalty", value: 30 },
        { type: "hydrationDrain",   value: 3  },
        { type: "attackPenalty",    value: 3  },
      ]},
    ],
    cures: ["rest_24h", "herb_ginger", "potion_antifever"],
    naturalCureChance: 0.15,
  },
};

// Получить все активные болезни актора с их стадиями
export function getActiveDiseases(actor) {
  const diseases = actor.system?.diseases ?? {};
  return Object.entries(diseases)
    .filter(([, d]) => d && d.stage >= 0)
    .map(([key, data]) => ({
      ...(DISEASES[key] ?? { key, label: key, stages: [] }),
      currentStage: data.stage ?? 0,
      progress:     data.progress ?? 0,
      duration:     data.duration ?? 0,
    }));
}

// Суммарные штрафы от всех болезней
export function getDiseasesPenalties(actor) {
  const active = getActiveDiseases(actor);
  const penalties = {
    energyMaxPenalty: 0,
    manaMaxPenalty:   0,
    attackPenalty:    0,
    castPenalty:      0,
    hydrationDrain:   0,
    satietyDrain:     0,
    hpDrainTorso:     0,
  };

  for (const disease of active) {
    const stage = disease.stages[disease.currentStage];
    if (!stage?.symptoms) continue;
    for (const sym of stage.symptoms) {
      if (sym.type in penalties) penalties[sym.type] += sym.value;
    }
  }

  return penalties;
}
