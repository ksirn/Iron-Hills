/**
 * Iron Hills — World Map Constants
 * Регион: Железные Холмы — горная долина, стартовый регион.
 * 10×10 тайлов, основной доход — добыча железа.
 */

export const WORLD_MAP_LEVEL_ORDER = ["global", "region", "local", "encounter"];

export const WORLD_MAP_LEVELS = {
  global: {
    id: "global",
    label: "Глобальная",
    shortLabel: "Мир",
    scale: "страны, континенты, дальние торговые пути",
    role: "стратегическая навигация между регионами и большими угрозами",
    travelUnit: "дни и недели",
    status: "atlas",
  },
  region: {
    id: "region",
    label: "Региональная",
    shortLabel: "Регион",
    scale: "долины, перевалы, поселения, дороги и опасные зоны",
    role: "основной рабочий слой путешествий, A* маршрутов и travel events",
    travelUnit: "часы и дни",
    status: "active",
  },
  local: {
    id: "local",
    label: "Город / местность",
    shortLabel: "Локация",
    scale: "улицы, кварталы, лагерь, рудник, лесная чаща или руины",
    role: "переход от маршрута к сценам, торговцам, POI и локальным событиям",
    travelUnit: "минуты и часы",
    status: "atlas",
  },
  encounter: {
    id: "encounter",
    label: "Дом / энкаунтер",
    shortLabel: "Сцена",
    scale: "отдельный дом, двор, поле боя, комната, засадная зона",
    role: "точный слой Foundry Scene, токенов, укрытий, зон поражения и боя",
    travelUnit: "секунды и раунды",
    status: "atlas",
  },
};

export const WORLD_MAP_STAGE_NODES = {
  global: [
    { id: "iron_hills", label: "Железные Холмы", kind: "стартовый регион", tone: "is-active" },
    { id: "gray_marshes", label: "Серые Топи", kind: "южный рубеж", tone: "is-danger" },
    { id: "northern_passes", label: "Северные перевалы", kind: "горная граница", tone: "is-cold" },
    { id: "riverlands", label: "Речные земли", kind: "торговые пути", tone: "is-road" },
  ],
  encounter: [
    { id: "approach", label: "Подход", kind: "вход в сцену", tone: "is-road" },
    { id: "cover", label: "Укрытия", kind: "камни, стены, лес, мебель", tone: "is-active" },
    { id: "hazards", label: "Опасности", kind: "ловушки, огонь, ямы, болото", tone: "is-danger" },
    { id: "loot", label: "Добыча", kind: "контейнеры и интерактив", tone: "is-gold" },
  ],
};

export const WORLD_MAP_ASSETS = {
  ironHillsGlobalAtlas: "systems/iron-hills-system/icons/world/maps/iron-hills-global-atlas.png",
  ironHillsRegion: "systems/iron-hills-system/icons/world/maps/iron-hills-region-map.webp",
  rivergateCityLocal: "systems/iron-hills-system/icons/world/maps/rivergate-city-local.png",
  ashfordVillageLocal: "systems/iron-hills-system/icons/world/maps/ashford-village-local.png",
  kopernyPeakMiningLocal: "systems/iron-hills-system/icons/world/maps/koperny-peak-mining-local.png",
  encounterHouseInterior: "systems/iron-hills-system/icons/world/maps/encounter-house-interior.png",
  encounterMarketSquare: "systems/iron-hills-system/icons/world/maps/encounter-market-square.png",
  encounterField: "systems/iron-hills-system/icons/world/maps/encounter-field.png",
  encounterForest: "systems/iron-hills-system/icons/world/maps/encounter-forest.png",
  encounterMineCave: "systems/iron-hills-system/icons/world/maps/encounter-mine-cave.png",
};

const WORLD_MAP_LOCAL_BACKDROPS_BY_LABEL = Object.freeze({
  "Ривергейт": WORLD_MAP_ASSETS.rivergateCityLocal,
  "Эшфорд": WORLD_MAP_ASSETS.ashfordVillageLocal,
  "Копёрный Пик": WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
  "Глубокий Пласт": WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
});

const WORLD_MAP_LOCAL_BACKDROPS_BY_TERRAIN = Object.freeze({
  town: WORLD_MAP_ASSETS.rivergateCityLocal,
  village: WORLD_MAP_ASSETS.ashfordVillageLocal,
  road: WORLD_MAP_ASSETS.rivergateCityLocal,
  mine: WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
  dungeon: WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
  ruins: WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
  forest: WORLD_MAP_ASSETS.ashfordVillageLocal,
  plains: WORLD_MAP_ASSETS.ashfordVillageLocal,
  hills: WORLD_MAP_ASSETS.ashfordVillageLocal,
  swamp: WORLD_MAP_ASSETS.ashfordVillageLocal,
  river: WORLD_MAP_ASSETS.ashfordVillageLocal,
  pass: WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
  mountains: WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
});

const WORLD_MAP_ENCOUNTER_BACKDROPS_BY_LABEL = Object.freeze({
  "Ривергейт": WORLD_MAP_ASSETS.encounterMarketSquare,
  "Эшфорд": WORLD_MAP_ASSETS.encounterHouseInterior,
  "Копёрный Пик": WORLD_MAP_ASSETS.encounterMineCave,
  "Глубокий Пласт": WORLD_MAP_ASSETS.encounterMineCave,
  "Чёрный Бор": WORLD_MAP_ASSETS.encounterForest,
});

const WORLD_MAP_ENCOUNTER_BACKDROPS_BY_TERRAIN = Object.freeze({
  town: WORLD_MAP_ASSETS.encounterMarketSquare,
  village: WORLD_MAP_ASSETS.encounterHouseInterior,
  road: WORLD_MAP_ASSETS.encounterMarketSquare,
  mine: WORLD_MAP_ASSETS.encounterMineCave,
  dungeon: WORLD_MAP_ASSETS.encounterMineCave,
  ruins: WORLD_MAP_ASSETS.encounterMineCave,
  forest: WORLD_MAP_ASSETS.encounterForest,
  plains: WORLD_MAP_ASSETS.encounterField,
  hills: WORLD_MAP_ASSETS.encounterField,
  river: WORLD_MAP_ASSETS.encounterForest,
  swamp: WORLD_MAP_ASSETS.encounterForest,
  pass: WORLD_MAP_ASSETS.encounterMineCave,
  mountains: WORLD_MAP_ASSETS.encounterMineCave,
});

export const WORLD_MAP_BACKDROPS = Object.freeze({
  global: Object.freeze({
    default: WORLD_MAP_ASSETS.ironHillsGlobalAtlas,
  }),
  region: Object.freeze({
    default: WORLD_MAP_ASSETS.ironHillsRegion,
  }),
  local: Object.freeze({
    default: WORLD_MAP_ASSETS.ashfordVillageLocal,
    byLabel: WORLD_MAP_LOCAL_BACKDROPS_BY_LABEL,
    byTerrain: WORLD_MAP_LOCAL_BACKDROPS_BY_TERRAIN,
  }),
  encounter: Object.freeze({
    default: WORLD_MAP_ASSETS.encounterField,
    byLabel: WORLD_MAP_ENCOUNTER_BACKDROPS_BY_LABEL,
    byTerrain: WORLD_MAP_ENCOUNTER_BACKDROPS_BY_TERRAIN,
  }),
});

function normalizeBackdropLookup(value) {
  return String(value ?? "").trim();
}

function resolveFromLookup(lookup = {}, value) {
  const key = normalizeBackdropLookup(value);
  if (!key) return null;
  return lookup[key] ?? null;
}

export function resolveWorldMapBackdrop(level = "region", focus = {}) {
  const levelKey = WORLD_MAP_BACKDROPS[level] ? level : "region";
  const rules = WORLD_MAP_BACKDROPS[levelKey];
  const label = focus?.label ?? focus?.name ?? "";
  const terrain = focus?.terrain ?? "";
  return (
    resolveFromLookup(rules.byLabel, label) ??
    resolveFromLookup(rules.byTerrain, terrain) ??
    rules.default ??
    WORLD_MAP_ASSETS.ironHillsRegion
  );
}

export function listWorldMapBackdropAssets() {
  return Object.values(WORLD_MAP_ASSETS);
}

export const TERRAIN_VISUALS = {
  mountains: { className: "terrain-mountains", mark: "▲", color: "#5d6470" },
  hills:     { className: "terrain-hills",     mark: "∧", color: "#6f6747" },
  plains:    { className: "terrain-plains",    mark: "·", color: "#68734d" },
  forest:    { className: "terrain-forest",    mark: "♣", color: "#36553e" },
  swamp:     { className: "terrain-swamp",     mark: "≈", color: "#425742" },
  river:     { className: "terrain-river",     mark: "≋", color: "#355a66" },
  road:      { className: "terrain-road",      mark: "—", color: "#8a7652" },
  pass:      { className: "terrain-pass",      mark: "◇", color: "#777064" },
  ruins:     { className: "terrain-ruins",     mark: "▥", color: "#6c6258" },
  dungeon:   { className: "terrain-dungeon",   mark: "◆", color: "#46424a" },
  mine:      { className: "terrain-mine",      mark: "◈", color: "#5c5347" },
  town:      { className: "terrain-town",      mark: "■", color: "#8b724e" },
  village:   { className: "terrain-village",   mark: "□", color: "#79684b" },
};

export const TERRAIN_TYPES = {
  mountains: { label: "Горы",      icon: "⛰",  moveCost: 3, canDock: false },
  hills:     { label: "Холмы",     icon: "🏔",  moveCost: 2, canDock: false },
  plains:    { label: "Равнина",   icon: "🌿",  moveCost: 1, canDock: false },
  forest:    { label: "Лес",       icon: "🌲",  moveCost: 2, canDock: false },
  swamp:     { label: "Болото",    icon: "🌾",  moveCost: 3, canDock: true  },
  river:     { label: "Река",      icon: "🌊",  moveCost: 1, canDock: true  },
  road:      { label: "Дорога",    icon: "🛤",  moveCost: 1, canDock: false },
  pass:      { label: "Перевал",   icon: "🗻",  moveCost: 2, canDock: false },
  ruins:     { label: "Руины",     icon: "🏚",  moveCost: 2, canDock: false },
  dungeon:   { label: "Подземелье",icon: "🕳",  moveCost: 1, canDock: false },
  mine:      { label: "Шахта",     icon: "⛏",  moveCost: 1, canDock: false },
  town:      { label: "Город",     icon: "🏘",  moveCost: 1, canDock: false },
  village:   { label: "Село",      icon: "🏡",  moveCost: 1, canDock: false },
};

export const TRANSPORT_TYPES = {
  foot:   { label: "Пешком", icon: "🚶", speed: 1, restrictions: [] },
  horse:  { label: "Верхом", icon: "🐎", speed: 2, restrictions: ["mountains","swamp","dungeon"] },
  cart:   { label: "Телега", icon: "🛒", speed: 1.5, restrictions: ["mountains","swamp","dungeon","hills"] },
  boat:   { label: "Лодка",  icon: "⛵", speed: 2, restrictions: [], requiresDock: true },
};

/**
 * Карта Iron Hills 10×10
 *
 * Легенда (col, row):
 *   Север (row 0): Горный хребет — граница региона
 *   Запад (col 0): Ущелье и перевал Каменный Зуб
 *   Восток (col 9): Холмы, выход в другой регион
 *   Юг (row 9): Болота Серой Топи, река Железка
 *   Центр: Долина — поля, дороги, шахты
 *
 * Ключевые точки:
 *   (5,2) Ривергейт    — главный город, торговый узел
 *   (2,5) Эшфорд       — село, фермеры и лесорубы
 *   (7,4) Копёрный Пик — шахтёрский городок
 *   (3,2) Сторожевая башня — POI, бывший форпост
 *   (8,1) Перевал Буря  — опасный путь на север
 *   (1,7) Болотный Хутор — изолированное поселение
 *   (5,7) Руины Ирон-Касла — старая крепость
 *   (4,4) Шахта Глубокий Пласт — богатая залежь
 */

export const DEFAULT_REGIONS = {
  "iron_hills": {
    "id":       "iron_hills",
    "label":    "Железные Холмы",
    "cols":     10,
    "rows":     10,
    "tileSize": 60,
    "tiles": [
      // ── Ряд 0 — Горный хребет (северная граница) ──────────────
      { col:0, row:0, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:1, row:0, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:2, row:0, terrain:"pass",      label:"Нагорный пер.",poi:true, discovered:true  },
      { col:3, row:0, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:4, row:0, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:5, row:0, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:6, row:0, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:7, row:0, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:8, row:0, terrain:"pass",      label:"Перевал Буря",poi:true, discovered:false },
      { col:9, row:0, terrain:"mountains", label:"",            poi:false, discovered:true  },

      // ── Ряд 1 ────────────────────────────────────────────────
      { col:0, row:1, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:1, row:1, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:2, row:1, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:3, row:1, terrain:"forest",    label:"",            poi:false, discovered:true  },
      { col:4, row:1, terrain:"forest",    label:"",            poi:false, discovered:true  },
      { col:5, row:1, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:6, row:1, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:7, row:1, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:8, row:1, terrain:"mountains", label:"",            poi:false, discovered:false },
      { col:9, row:1, terrain:"mountains", label:"",            poi:false, discovered:true  },

      // ── Ряд 2 ────────────────────────────────────────────────
      { col:0, row:2, terrain:"pass",      label:"Каменный Зуб",poi:true, discovered:true  },
      { col:1, row:2, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:2, row:2, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:3, row:2, terrain:"ruins",     label:"Сторожевая башня", poi:true, discovered:true },
      { col:4, row:2, terrain:"road",      label:"",            poi:false, discovered:true  },
      { col:5, row:2, terrain:"town",      label:"Ривергейт",   poi:true, discovered:true  },
      { col:6, row:2, terrain:"road",      label:"",            poi:false, discovered:true  },
      { col:7, row:2, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:8, row:2, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:9, row:2, terrain:"hills",     label:"",            poi:false, discovered:true  },

      // ── Ряд 3 ────────────────────────────────────────────────
      { col:0, row:3, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:1, row:3, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:2, row:3, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:3, row:3, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:4, row:3, terrain:"road",      label:"",            poi:false, discovered:true  },
      { col:5, row:3, terrain:"road",      label:"",            poi:false, discovered:true  },
      { col:6, row:3, terrain:"road",      label:"",            poi:false, discovered:true  },
      { col:7, row:3, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:8, row:3, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:9, row:3, terrain:"hills",     label:"",            poi:false, discovered:true  },

      // ── Ряд 4 ────────────────────────────────────────────────
      { col:0, row:4, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:1, row:4, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:2, row:4, terrain:"forest",    label:"Чёрный Бор",  poi:true, discovered:true  },
      { col:3, row:4, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:4, row:4, terrain:"mine",      label:"Глубокий Пласт",poi:true,discovered:true },
      { col:5, row:4, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:6, row:4, terrain:"road",      label:"",            poi:false, discovered:true  },
      { col:7, row:4, terrain:"town",      label:"Копёрный Пик",poi:true, discovered:true  },
      { col:8, row:4, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:9, row:4, terrain:"hills",     label:"",            poi:false, discovered:true  },

      // ── Ряд 5 ────────────────────────────────────────────────
      { col:0, row:5, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:1, row:5, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:2, row:5, terrain:"village",   label:"Эшфорд",      poi:true, discovered:true  },
      { col:3, row:5, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:4, row:5, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:5, row:5, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:6, row:5, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:7, row:5, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:8, row:5, terrain:"dungeon",   label:"Змеиные Пещеры",poi:true,discovered:false},
      { col:9, row:5, terrain:"hills",     label:"",            poi:false, discovered:true  },

      // ── Ряд 6 ────────────────────────────────────────────────
      { col:0, row:6, terrain:"mountains", label:"",            poi:false, discovered:true  },
      { col:1, row:6, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:2, row:6, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:3, row:6, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:4, row:6, terrain:"river",     label:"Река Железка",poi:false,discovered:true  },
      { col:5, row:6, terrain:"river",     label:"",            poi:false, discovered:true  },
      { col:6, row:6, terrain:"river",     label:"",            poi:false, discovered:true  },
      { col:7, row:6, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:8, row:6, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:9, row:6, terrain:"hills",     label:"",            poi:false, discovered:true  },

      // ── Ряд 7 ────────────────────────────────────────────────
      { col:0, row:7, terrain:"swamp",     label:"",            poi:false, discovered:true  },
      { col:1, row:7, terrain:"swamp",     label:"Болотный Хутор",poi:true,discovered:true },
      { col:2, row:7, terrain:"swamp",     label:"",            poi:false, discovered:true  },
      { col:3, row:7, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:4, row:7, terrain:"river",     label:"",            poi:false, discovered:true  },
      { col:5, row:7, terrain:"ruins",     label:"Ирон-Касл",   poi:true, discovered:true  },
      { col:6, row:7, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:7, row:7, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:8, row:7, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:9, row:7, terrain:"hills",     label:"",            poi:false, discovered:true  },

      // ── Ряд 8 ────────────────────────────────────────────────
      { col:0, row:8, terrain:"swamp",     label:"Серая Топь",  poi:true, discovered:true  },
      { col:1, row:8, terrain:"swamp",     label:"",            poi:false, discovered:true  },
      { col:2, row:8, terrain:"swamp",     label:"",            poi:false, discovered:true  },
      { col:3, row:8, terrain:"swamp",     label:"",            poi:false, discovered:true  },
      { col:4, row:8, terrain:"river",     label:"",            poi:false, discovered:true  },
      { col:5, row:8, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:6, row:8, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:7, row:8, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:8, row:8, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:9, row:8, terrain:"hills",     label:"",            poi:false, discovered:true  },

      // ── Ряд 9 — Южная граница ────────────────────────────────
      { col:0, row:9, terrain:"swamp",     label:"",            poi:false, discovered:true  },
      { col:1, row:9, terrain:"swamp",     label:"",            poi:false, discovered:true  },
      { col:2, row:9, terrain:"swamp",     label:"",            poi:false, discovered:true  },
      { col:3, row:9, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:4, row:9, terrain:"river",     label:"Устье Железки",poi:true, discovered:true },
      { col:5, row:9, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:6, row:9, terrain:"plains",    label:"",            poi:false, discovered:true  },
      { col:7, row:9, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:8, row:9, terrain:"hills",     label:"",            poi:false, discovered:true  },
      { col:9, row:9, terrain:"hills",     label:"",            poi:false, discovered:true  },
    ]
  }
};

/** Описания ключевых POI для карты */
export const IRON_HILLS_POI = {
  "Ривергейт":      { tier:2, type:"settlement", desc:"Главный город долины. Торговый узел на реке Железка. Рынок, кузни, таверна «Ржавый Гвоздь», магистрат." },
  "Эшфорд":         { tier:1, type:"settlement", desc:"Тихое село к западу. Фермеры, лесорубы, небольшой рынок. Кузнец-самоучка и местный знахарь." },
  "Копёрный Пик":   { tier:2, type:"settlement", desc:"Шахтёрский городок. Грубые нравы, много гномов. Лучшие кузнецы региона, богатый рынок руды." },
  "Болотный Хутор": { tier:1, type:"settlement", desc:"Изолированное поселение в болотах. Рыболовы и травники. Говорят о странных огнях ночью." },
  "Глубокий Пласт": { tier:2, type:"mine",       desc:"Крупнейшая шахта железа в долине. Принадлежит гильдии горняков. Периодически закрывается из-за обвалов." },
  "Сторожевая башня":{ tier:1, type:"ruins",     desc:"Старый форпост на холме. Разрушен лет 80 назад. Хорошая обзорная точка. Бандиты иногда используют как логово." },
  "Ирон-Касл":      { tier:2, type:"ruins",      desc:"Руины древней крепости. Говорят, здесь жил первый граф. В подвалах — нетронутые сокровищницы и нечисть." },
  "Змеиные Пещеры": { tier:2, type:"dungeon",    desc:"Система пещер в восточных холмах. Обитают каменные змеи и гоблины-шахтёры. Есть жилы редких минералов." },
  "Серая Топь":     { tier:1, type:"poi",        desc:"Опасные болота. Блуждающие огни, топи, ядовитые растения. Местные травники знают тропы." },
  "Чёрный Бор":     { tier:1, type:"poi",        desc:"Густой лес к западу. Старые деревья, волки. Охотники берут здесь лучший мех." },
  "Каменный Зуб":   { tier:2, type:"pass",       desc:"Узкий перевал через западный хребет. Легко контролировать, легко перекрыть." },
  "Перевал Буря":   { tier:3, type:"pass",       desc:"Северный перевал. Частые метели даже летом. Ведёт в высокогорный регион." },
};
