/**
 * Iron Hills — NPC Profiles
 * Профили для генератора NPC по типу и ступени.
 * Навыки: значение = ступень (1-10).
 */

export const NPC_ROLE_PROFILES = {

  // ── Мирные жители ──────────────────────────────────────────

  villager: {
    label: "Житель", tier: 1,
    skills: { endurance:1, crafting:1, cooking:1, perception:1 },
    energy: 8, mana: 2,
    equipment: ["Простая одежда", "Нож (1ст.)"],
    desc: "Обычный житель деревни или города.",
  },
  farmer: {
    label: "Фермер", tier: 1,
    skills: { endurance:2, survival:1, cooking:2, perception:1 },
    energy: 10, mana: 1,
    equipment: ["Рабочая одежда", "Вилы (1ст.)"],
    desc: "Крестьянин из Эшфорда или окрестностей.",
  },
  miner: {
    label: "Шахтёр", tier: 1,
    skills: { endurance:2, blacksmithing:1, athletics:1, perception:1 },
    energy: 12, mana: 1,
    equipment: ["Кожаная куртка", "Кирка (1ст.)"],
    desc: "Рабочий шахты, крепкий и выносливый.",
  },
  merchant: {
    label: "Торговец", tier: 2,
    skills: { trade:3, perception:2, endurance:1 },
    energy: 8, mana: 3,
    equipment: ["Хорошая одежда", "Нож (1ст.)", "Кошелёк"],
    desc: "Купец из Ривергейта.",
  },
  innkeeper: {
    label: "Трактирщик", tier: 1,
    skills: { cooking:3, trade:2, endurance:2, perception:1 },
    energy: 10, mana: 2,
    equipment: ["Фартук", "Дубинка (1ст.)"],
    desc: "Хозяин таверны. Знает все слухи.",
  },
  herbalist: {
    label: "Знахарь", tier: 2,
    skills: { alchemy:3, survival:2, life:1, perception:2 },
    energy: 7, mana: 8,
    equipment: ["Травяная сумка", "Нож (1ст.)", "Зелья (1-2ст.)"],
    desc: "Местный лекарь и травник.",
  },

  // ── Ремесленники ───────────────────────────────────────────

  apprentice_smith: {
    label: "Подмастерье кузнеца", tier: 1,
    skills: { blacksmithing:2, endurance:2, crafting:1 },
    energy: 12, mana: 2,
    equipment: ["Кожаный фартук", "Молот (1ст.)"],
    desc: "Учится у мастера-кузнеца.",
  },
  blacksmith: {
    label: "Кузнец", tier: 2,
    skills: { blacksmithing:4, endurance:3, crafting:2, trade:1 },
    energy: 15, mana: 3,
    equipment: ["Кожаный фартук", "Молот (2ст.)", "Кольчужная куртка (2ст.)"],
    desc: "Опытный кузнец, гордость шахтёрского городка.",
  },
  master_smith: {
    label: "Мастер-кузнец", tier: 3,
    skills: { blacksmithing:6, endurance:3, crafting:4, trade:2 },
    energy: 15, mana: 5,
    equipment: ["Кожаный доспех (3ст.)", "Молот (3ст.)"],
    desc: "Лучший кузнец в долине, гном или человек.",
  },
  alchemist: {
    label: "Алхимик", tier: 2,
    skills: { alchemy:4, earth:1, life:2, perception:2 },
    energy: 7, mana: 12,
    equipment: ["Мантия", "Посох (2ст.)", "Зелья (1-3ст.)"],
    desc: "Практик смешанной науки и магии.",
  },

  // ── Боевые ──────────────────────────────────────────────────

  militia: {
    label: "Ополченец", tier: 1,
    skills: { sword:1, endurance:2, athletics:1, perception:1 },
    energy: 10, mana: 2,
    equipment: ["Кожаная куртка (1ст.)", "Меч (1ст.)", "Деревянный щит (1ст.)"],
    desc: "Местный ополченец, защищает деревню.",
  },
  guard: {
    label: "Стражник", tier: 2,
    skills: { sword:2, endurance:2, athletics:1, perception:2 },
    energy: 12, mana: 3,
    equipment: ["Кольчуга (2ст.)", "Меч (2ст.)", "Щит (2ст.)"],
    desc: "Городской стражник Ривергейта.",
  },
  veteran_guard: {
    label: "Ветеран стражи", tier: 3,
    skills: { sword:3, endurance:3, athletics:2, perception:2, spear:1 },
    energy: 15, mana: 3,
    equipment: ["Наборный доспех (3ст.)", "Меч (3ст.)", "Щит (3ст.)"],
    desc: "Опытный боец, командир стражи.",
  },
  bandit: {
    label: "Бандит", tier: 1,
    skills: { knife:2, throwing:1, endurance:1, perception:1 },
    energy: 10, mana: 2,
    equipment: ["Кожаная куртка (1ст.)", "Нож (1ст.)", "Дубина (1ст.)"],
    desc: "Разбойник на дороге. Бедный и отчаявшийся.",
  },
  bandit_leader: {
    label: "Атаман бандитов", tier: 2,
    skills: { sword:3, knife:2, endurance:2, perception:2, trade:1 },
    energy: 14, mana: 3,
    equipment: ["Кожаный доспех (2ст.)", "Меч (2ст.)", "Метательные ножи (1ст.)"],
    desc: "Предводитель банды. Опасен и хитёр.",
  },
  hunter: {
    label: "Охотник", tier: 1,
    skills: { throwing:2, knife:2, perception:2, survival:2, endurance:1 },
    energy: 11, mana: 3,
    equipment: ["Кожаная куртка (1ст.)", "Нож (1ст.)", "Лук (1ст.)"],
    desc: "Промышляет в Чёрном Боре.",
  },
  mercenary: {
    label: "Наёмник", tier: 2,
    skills: { sword:3, axe:2, endurance:3, athletics:2 },
    energy: 14, mana: 3,
    equipment: ["Кольчуга (2ст.)", "Меч или топор (2ст.)"],
    desc: "Профессиональный боец без хозяина.",
  },

  // ── Магические ─────────────────────────────────────────────

  hedge_mage: {
    label: "Самоучка-маг", tier: 1,
    skills: { fire:1, earth:1, life:1, perception:1 },
    energy: 6, mana: 10,
    equipment: ["Простая одежда", "Посох (1ст.)"],
    desc: "Слабый маг без серьёзного обучения.",
  },
  mage: {
    label: "Маг", tier: 2,
    skills: { fire:3, water:2, mind:2, life:1 },
    energy: 7, mana: 18,
    equipment: ["Мантия", "Посох (2ст.)"],
    desc: "Обученный маг, умеет несколько школ.",
  },
  shaman: {
    label: "Шаман", tier: 2,
    skills: { earth:3, life:3, survival:2, perception:2 },
    energy: 8, mana: 16,
    equipment: ["Шкуры", "Ритуальный посох (2ст.)"],
    desc: "Племенной целитель и духовник.",
  },

  // ── Существа ────────────────────────────────────────────────

  wolf: {
    label: "Волк", tier: 1, isCreature: true,
    skills: { unarmed:2, perception:3, athletics:2, endurance:2 },
    energy: 8, mana: 0,
    equipment: [],
    desc: "Серый волк из Чёрного Бора.",
  },
  cave_rat: {
    label: "Шахтная крыса", tier: 1, isCreature: true,
    skills: { unarmed:1, perception:2, athletics:1 },
    energy: 4, mana: 0,
    equipment: [],
    desc: "Крупная агрессивная крыса из шахт.",
  },
  goblin_miner: {
    label: "Гоблин-шахтёр", tier: 1, isCreature: true,
    skills: { unarmed:1, knife:1, perception:2, endurance:1 },
    energy: 7, mana: 2,
    equipment: ["Кирка (1ст.)", "Тряпьё"],
    desc: "Дикий гоблин из Змеиных Пещер.",
  },
  stone_serpent: {
    label: "Каменная змея", tier: 2, isCreature: true,
    skills: { unarmed:3, perception:2, endurance:3 },
    energy: 12, mana: 4,
    equipment: [],
    resist: { physical: 2 },
    desc: "Опасная змея с частично окаменевшей чешуёй. Обитает в пещерах.",
  },
  swamp_spider: {
    label: "Болотный паук", tier: 1, isCreature: true,
    skills: { unarmed:2, perception:2, athletics:2 },
    energy: 8, mana: 0,
    equipment: [],
    desc: "Крупный ядовитый паук из Серой Топи.",
  },
};
