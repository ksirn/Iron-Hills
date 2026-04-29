/**
 * Iron Hills — World Map Constants
 * Регион: Железные Холмы — горная долина, стартовый регион.
 * 10×10 тайлов, основной доход — добыча железа.
 */

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
