/**
 * Iron Hills — Items Catalog
 * Все предметы разграничены по 10 ступеням.
 * Ступень 1-2: стартовый регион Железные Холмы.
 * Ступень 3-5: средний уровень, требует прокачки.
 * Ступень 6-10: эндгейм, редкие и легендарные.
 */

// ──────────────────────────────────────────────────────────────
// МАТЕРИАЛЫ (по категориям и ступеням)
// ──────────────────────────────────────────────────────────────
export const MATERIALS = {
  // ── Металлы (1-10) ──────────────────────────────────────
  // Тир 1: Медь — мягкая, дешёвая, первые орудия
  copper_ore:        { id:"copper_ore",        label:"Медная руда",          tier:1,  category:"metal", weight:1.5, value:2     },
  copper_ingot:      { id:"copper_ingot",      label:"Медный слиток",        tier:1,  category:"metal", weight:1,   value:5     },
  // Тир 2: Бронза — медь+олово, первый сплав
  tin_ore:           { id:"tin_ore",           label:"Оловянная руда",       tier:2,  category:"metal", weight:1.5, value:4     },
  bronze_ingot:      { id:"bronze_ingot",      label:"Бронзовый слиток",     tier:2,  category:"metal", weight:1,   value:12    },
  // Тир 3: Железо — требует кузницу (Iron Hills добывает здесь)
  iron_ore:          { id:"iron_ore",          label:"Железная руда",        tier:3,  category:"metal", weight:1.5, value:8     },
  iron_ingot:        { id:"iron_ingot",        label:"Железный слиток",      tier:3,  category:"metal", weight:1,   value:20    },
  // Тир 4: Сталь — кованая, основа снаряжения
  coal:              { id:"coal",              label:"Уголь",                tier:2,  category:"metal", weight:1,   value:3     },
  steel_ingot:       { id:"steel_ingot",       label:"Стальной слиток",      tier:4,  category:"metal", weight:1,   value:60    },
  // Тир 5: Закалённая сталь — лучшая обычная
  hardened_steel:    { id:"hardened_steel",    label:"Закалённая сталь",     tier:5,  category:"metal", weight:1,   value:180   },
  // Тир 6: Митрил — редкий, лёгкий, магический
  mithril_ore:       { id:"mithril_ore",       label:"Митрильная руда",      tier:6,  category:"metal", weight:1,   value:500   },
  mithril_ingot:     { id:"mithril_ingot",     label:"Митрильный слиток",    tier:6,  category:"metal", weight:0.7, value:1200  },
  // Тир 7: Тёмное железо — из глубин, тяжёлое
  dark_iron_ore:     { id:"dark_iron_ore",     label:"Тёмная руда",          tier:7,  category:"metal", weight:2,   value:1500  },
  dark_iron:         { id:"dark_iron",         label:"Тёмное железо",        tier:7,  category:"metal", weight:1.8, value:3500  },
  // Тир 8: Звёздный металл — упавшие метеориты
  starmetal_ore:     { id:"starmetal_ore",     label:"Звёздная руда",        tier:8,  category:"metal", weight:1,   value:6000  },
  starmetal:         { id:"starmetal",         label:"Звёздный металл",      tier:8,  category:"metal", weight:0.8, value:15000 },
  // Тир 9: Орихалк — легендарный
  orichalcum:        { id:"orichalcum",        label:"Орихалк",              tier:9,  category:"metal", weight:0.6, value:40000 },
  // Тир 10: Адамантий — мифический
  adamantium:        { id:"adamantium",        label:"Адамантий",            tier:10, category:"metal", weight:1,   value:100000},

  // ── Дерево (1-10) ────────────────────────────────────────
  pine_wood:      { id:"pine_wood",      label:"Сосновая доска",       tier:1,  category:"wood",  weight:2,   value:1    },
  oak_wood:       { id:"oak_wood",       label:"Дубовая доска",        tier:2,  category:"wood",  weight:2,   value:5    },
  hardwood:       { id:"hardwood",       label:"Твёрдая древесина",    tier:3,  category:"wood",  weight:2,   value:15   },
  ironwood:       { id:"ironwood",       label:"Железное дерево",      tier:4,  category:"wood",  weight:2.5, value:40   },
  spirit_wood:    { id:"spirit_wood",    label:"Древесина духов",      tier:5,  category:"wood",  weight:2,   value:120  },
  ebony:          { id:"ebony",          label:"Чёрное дерево",        tier:6,  category:"wood",  weight:2.5, value:300  },
  eternal_wood:   { id:"eternal_wood",   label:"Вечное дерево",        tier:7,  category:"wood",  weight:2,   value:800  },
  world_tree:     { id:"world_tree",     label:"Мировое дерево",       tier:8,  category:"wood",  weight:1.5, value:3000 },

  // ── Кожа/шкуры (1-10) ───────────────────────────────────
  animal_hide:    { id:"animal_hide",    label:"Шкура зверя",          tier:1,  category:"hide",  weight:1,   value:3    },
  tanned_leather: { id:"tanned_leather", label:"Выделанная кожа",      tier:1,  category:"hide",  weight:0.8, value:7    },
  thick_hide:     { id:"thick_hide",     label:"Толстая шкура",        tier:2,  category:"hide",  weight:1.5, value:14   },
  scale_hide:     { id:"scale_hide",     label:"Чешуйчатая шкура",     tier:3,  category:"hide",  weight:1.5, value:40   },
  drake_scale:    { id:"drake_scale",    label:"Чешуя дрейка",         tier:4,  category:"hide",  weight:1,   value:100  },
  drake_hide:     { id:"drake_hide",     label:"Кожа дрейка",          tier:5,  category:"hide",  weight:1.2, value:250  },
  warg_pelt:      { id:"warg_pelt",      label:"Шкура варга",          tier:6,  category:"hide",  weight:1.5, value:600  },
  wyvern_hide:    { id:"wyvern_hide",    label:"Шкура виверны",        tier:7,  category:"hide",  weight:1.5, value:1500 },
  dragon_hide:    { id:"dragon_hide",    label:"Кожа дракона",         tier:8,  category:"hide",  weight:1,   value:4000 },
  leviathan_hide: { id:"leviathan_hide", label:"Шкура Левиафана",      tier:10, category:"hide",  weight:2,   value:50000},

  // ── Волокно/ткань (1-10) ─────────────────────────────────
  raw_fiber:      { id:"raw_fiber",      label:"Сырое волокно",        tier:1,  category:"fiber", weight:0.2, value:1    },
  cloth:          { id:"cloth",          label:"Ткань",                tier:1,  category:"fiber", weight:0.3, value:2    },
  fine_cloth:     { id:"fine_cloth",     label:"Тонкая ткань",         tier:2,  category:"fiber", weight:0.2, value:8    },
  silk:           { id:"silk",           label:"Шёлк",                 tier:3,  category:"fiber", weight:0.2, value:30   },
  spider_silk:    { id:"spider_silk",    label:"Паучий шёлк",          tier:4,  category:"fiber", weight:0.1, value:80   },
  moonweave:      { id:"moonweave",      label:"Лунное волокно",       tier:5,  category:"fiber", weight:0.1, value:200  },
  shadowweave:    { id:"shadowweave",    label:"Теневое волокно",      tier:6,  category:"fiber", weight:0.1, value:500  },
  starthread:     { id:"starthread",     label:"Звёздная нить",        tier:7,  category:"fiber", weight:0.1, value:1200 },
  void_weave:     { id:"void_weave",     label:"Ткань Пустоты",        tier:8,  category:"fiber", weight:0.1, value:3000 },

  // ── Камни/минералы (1-10) ───────────────────────────────
  stone:          { id:"stone",          label:"Камень",               tier:1,  category:"stone", weight:2,   value:0.5  },
  flint:          { id:"flint",          label:"Кремень",              tier:1,  category:"stone", weight:0.5, value:1    },
  coal:           { id:"coal",           label:"Уголь",                tier:1,  category:"stone", weight:1,   value:1    },
  quartz:         { id:"quartz",         label:"Кварц",                tier:2,  category:"stone", weight:0.5, value:10   },
  granite:        { id:"granite",        label:"Гранит",               tier:2,  category:"stone", weight:2,   value:5    },
  obsidian:       { id:"obsidian",       label:"Обсидиан",             tier:3,  category:"stone", weight:1,   value:30   },
  ruby:           { id:"ruby",           label:"Рубин",                tier:4,  category:"stone", weight:0.1, value:200  },
  sapphire:       { id:"sapphire",       label:"Сапфир",               tier:5,  category:"stone", weight:0.1, value:400  },
  diamond:        { id:"diamond",        label:"Алмаз",                tier:6,  category:"stone", weight:0.1, value:1000 },
  mana_crystal:   { id:"mana_crystal",   label:"Мана-кристалл",        tier:5,  category:"stone", weight:0.2, value:500  },
  void_crystal:   { id:"void_crystal",   label:"Кристалл Пустоты",     tier:7,  category:"stone", weight:0.2, value:2500 },
  star_shard:     { id:"star_shard",     label:"Осколок звезды",       tier:9,  category:"stone", weight:0.1, value:20000},
  star_heart:     { id:"star_heart",     label:"Сердце звезды",        tier:10, category:"stone", weight:0.3, value:80000},

  // ── Травы/алхимия (1-10) ────────────────────────────────
  herb_common:    { id:"herb_common",    label:"Обычная трава",        tier:1,  category:"herb",  weight:0.1, value:1    },
  herb_healing:   { id:"herb_healing",   label:"Целебный лист",        tier:1,  category:"herb",  weight:0.1, value:3    },
  mushroom_bog:   { id:"mushroom_bog",   label:"Болотный гриб",        tier:1,  category:"herb",  weight:0.2, value:2    },
  root_bitter:    { id:"root_bitter",    label:"Горький корень",       tier:2,  category:"herb",  weight:0.3, value:6    },
  poison_fang:    { id:"poison_fang",    label:"Ядовитый клык",        tier:2,  category:"herb",  weight:0.1, value:20   },
  flower_moon:    { id:"flower_moon",    label:"Лунный цветок",        tier:3,  category:"herb",  weight:0.1, value:30   },
  monster_gland:  { id:"monster_gland",  label:"Железа монстра",       tier:3,  category:"herb",  weight:0.3, value:50   },
  venom_sac:      { id:"venom_sac",      label:"Мешок с ядом",         tier:4,  category:"herb",  weight:0.2, value:100  },
  phoenix_feather:{ id:"phoenix_feather",label:"Перо феникса",         tier:6,  category:"herb",  weight:0.1, value:800  },
  giant_heart:    { id:"giant_heart",    label:"Сердце великана",      tier:7,  category:"herb",  weight:1,   value:2000 },
  dragon_blood:   { id:"dragon_blood",   label:"Кровь дракона",        tier:8,  category:"herb",  weight:0.5, value:5000 },
  god_tears:      { id:"god_tears",      label:"Слёзы богов",          tier:10, category:"herb",  weight:0.1, value:50000},

  // ── Разное (misc) ────────────────────────────────────────
  rope:           { id:"rope",           label:"Верёвка",              tier:1,  category:"misc",  weight:1,   value:2    },
  glass:          { id:"glass",          label:"Стекло",               tier:2,  category:"misc",  weight:0.5, value:5    },
  oil_flask:      { id:"oil_flask",      label:"Масло (фляга)",        tier:1,  category:"misc",  weight:0.5, value:3    },
  mana_stone:     { id:"mana_stone",     label:"Мана-камень",          tier:3,  category:"misc",  weight:0.3, value:60   },
  enchant_dust:   { id:"enchant_dust",   label:"Пыль зачарования",     tier:4,  category:"misc",  weight:0.1, value:150  },
  soul_essence:   { id:"soul_essence",   label:"Эссенция души",        tier:6,  category:"misc",  weight:0.1, value:1000 },
};

// ──────────────────────────────────────────────────────────────
// ОРУЖИЕ (по ступеням)
//
// Поля:
//   - range:    дальность атаки в клетках (1 для большинства мили,
//               2 для копья, 8 для лука, 10 для арбалета, 4 для метательного).
//   - affixes:  пассивные эффекты T9-T10 артефактов:
//                 ignoreArmor       — 0..1, доля игнорируемой брони
//                 disarmChance      — 0..1, шанс выбить оружие из руки цели
//                 stunChance        — 0..1, шанс оглушить
//                 bleedingBonus     — доп. стаки кровотечения при тяжёлом ударе
//                 lifeSteal         — 0..1, доля урона восстанавливается атакующему
//                 executeBelowHp    — 0..1, добивание если HP цели ≤ %
//                 criticalDamageMult— множитель урона при значимом перепопадании (margin>=8)
// ──────────────────────────────────────────────────────────────
export const WEAPONS = {
  // ══ НОЖИ ══════════════════════════════════════════════════
  copper_knife:     { id:"copper_knife",    label:"Медный нож",          tier:1, skill:"knife", damage:2,  weight:0.3, value:8,     twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  bronze_knife:     { id:"bronze_knife",    label:"Бронзовый нож",       tier:2, skill:"knife", damage:3,  weight:0.3, value:20,    twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  iron_knife:       { id:"iron_knife",      label:"Железный нож",        tier:3, skill:"knife", damage:4,  weight:0.4, value:50,    twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  steel_knife:      { id:"steel_knife",     label:"Стальной нож",        tier:4, skill:"knife", damage:5,  weight:0.4, value:130,   twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  hardened_knife:   { id:"hardened_knife",  label:"Закалённый кинжал",   tier:5, skill:"knife", damage:7,  weight:0.4, value:350,   twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  mithril_knife:    { id:"mithril_knife",   label:"Митрильный нож",      tier:6, skill:"knife", damage:8,  weight:0.2, value:1500,  twoHanded:false, energyCost:2, range:1, gridW:1, gridH:2 },
  darkiron_knife:   { id:"darkiron_knife",  label:"Кинжал тёмного железа",tier:7,skill:"knife", damage:11, weight:0.3, value:4200,  twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  void_dagger:      { id:"void_dagger",     label:"Кинжал Пустоты",      tier:8, skill:"knife", damage:14, weight:0.2, value:8000,  twoHanded:false, energyCost:2, range:1, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_knife: { id:"orichalcum_knife",label:"Орихалковый кинжал",  tier:9, skill:"knife", damage:20, weight:0.2, value:35000, twoHanded:false, energyCost:2, range:1, gridW:1, gridH:2, damageType:"magical",
                      affixes:{ ignoreArmor:0.4, bleedingBonus:1, criticalDamageMult:1.5 } },
  godsplitter_dagger:{id:"godsplitter_dagger",label:"Кинжал Богоруба",   tier:10,skill:"knife", damage:30, weight:0.2, value:90000, twoHanded:false, energyCost:2, range:1, gridW:1, gridH:2, damageType:"magical",
                      affixes:{ ignoreArmor:0.6, executeBelowHp:0.25, criticalDamageMult:2.0, bleedingBonus:2 } },

  // ══ МЕЧИ (1H) ══════════════════════════════════════════════
  copper_sword:     { id:"copper_sword",    label:"Медный меч",          tier:1, skill:"sword", damage:4,  weight:1.5, value:15,    twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  bronze_sword:     { id:"bronze_sword",    label:"Бронзовый меч",       tier:2, skill:"sword", damage:6,  weight:1.5, value:40,    twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  iron_sword:       { id:"iron_sword",      label:"Железный меч",        tier:3, skill:"sword", damage:8,  weight:1.8, value:100,   twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  steel_sword:      { id:"steel_sword",     label:"Стальной меч",        tier:4, skill:"sword", damage:11, weight:1.8, value:280,   twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  tempered_sword:   { id:"tempered_sword",  label:"Закалённый меч",      tier:5, skill:"sword", damage:14, weight:1.6, value:700,   twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  mithril_sword:    { id:"mithril_sword",   label:"Митрильный меч",      tier:6, skill:"sword", damage:18, weight:1.0, value:2000,  twoHanded:false, energyCost:3, range:1, gridW:1, gridH:3 },
  dark_blade:       { id:"dark_blade",      label:"Тёмный клинок",       tier:7, skill:"sword", damage:22, weight:2.0, value:5000,  twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  void_blade:       { id:"void_blade",      label:"Клинок Пустоты",      tier:8, skill:"sword", damage:28, weight:1.2, value:12000, twoHanded:false, energyCost:3, range:1, gridW:1, gridH:3, damageType:"magical" },
  orichalcum_blade: { id:"orichalcum_blade",label:"Клинок Орихалка",     tier:9, skill:"sword", damage:36, weight:1.0, value:50000, twoHanded:false, energyCost:3, range:1, gridW:1, gridH:3, damageType:"magical",
                      affixes:{ ignoreArmor:0.3, criticalDamageMult:1.5, lifeSteal:0.10 } },
  world_cutter:     { id:"world_cutter",    label:"Мирорассекатель",     tier:10,skill:"sword", damage:50, weight:0.8, value:120000,twoHanded:false, energyCost:3, range:1, gridW:1, gridH:3, damageType:"magical",
                      affixes:{ ignoreArmor:0.5, criticalDamageMult:2.0, lifeSteal:0.15, executeBelowHp:0.20 } },

  // ══ ДВУРУЧНЫЕ МЕЧИ ════════════════════════════════════════
  bronze_greatsword:    { id:"bronze_greatsword",   label:"Бронзовый двуруч",    tier:2,  skill:"sword", damage:9,  weight:3.5, value:110,    twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4 },
  iron_greatsword:      { id:"iron_greatsword",    label:"Железный двуруч",      tier:3,  skill:"sword", damage:12, weight:3.5, value:150,    twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4 },
  steel_greatsword:     { id:"steel_greatsword",   label:"Стальной двуруч",      tier:4,  skill:"sword", damage:16, weight:3.5, value:400,    twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4 },
  tempered_greatsword:  { id:"tempered_greatsword",label:"Закалённый двуруч",    tier:5,  skill:"sword", damage:20, weight:3.4, value:1100,   twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4 },
  mithril_greatsword:   { id:"mithril_greatsword", label:"Митрильный двуруч",    tier:6,  skill:"sword", damage:26, weight:2.5, value:3200,   twoHanded:true, energyCost:5, range:1, gridW:1, gridH:4 },
  darkiron_greatsword:  { id:"darkiron_greatsword",label:"Двуруч тёмного железа",tier:7,  skill:"sword", damage:32, weight:3.5, value:8000,   twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4 },
  starmetal_greatsword: { id:"starmetal_greatsword",label:"Звёздный двуруч",     tier:8,  skill:"sword", damage:42, weight:2.5, value:22000,  twoHanded:true, energyCost:5, range:1, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_greatsword:{ id:"orichalcum_greatsword",label:"Двуруч Орихалка",    tier:9,  skill:"sword", damage:52, weight:2.0, value:90000,  twoHanded:true, energyCost:5, range:1, gridW:1, gridH:4, damageType:"magical",
                          affixes:{ ignoreArmor:0.3, criticalDamageMult:1.6, stunChance:0.15 } },
  worldsplitter:        { id:"worldsplitter",      label:"Мирорассекатель Великий",tier:10,skill:"sword",damage:75, weight:1.8, value:240000, twoHanded:true, energyCost:5, range:1, gridW:1, gridH:4, damageType:"magical",
                          affixes:{ ignoreArmor:0.5, criticalDamageMult:2.5, executeBelowHp:0.25, stunChance:0.30 } },

  // ══ ТОПОРЫ (1H + 2H) ══════════════════════════════════════
  copper_axe:        { id:"copper_axe",       label:"Медный топор",          tier:1,  skill:"axe", damage:4,  weight:1.5, value:12,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  bronze_axe:        { id:"bronze_axe",       label:"Бронзовый топор",       tier:2,  skill:"axe", damage:6,  weight:1.8, value:35,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  iron_axe:          { id:"iron_axe",         label:"Железный топор",        tier:3,  skill:"axe", damage:9,  weight:2.0, value:90,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  steel_axe:         { id:"steel_axe",        label:"Стальной топор",        tier:4,  skill:"axe", damage:12, weight:2.0, value:250,   twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  hardened_axe:      { id:"hardened_axe",     label:"Закалённый топор",      tier:5,  skill:"axe", damage:14, weight:2.0, value:600,   twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  mithril_axe:       { id:"mithril_axe",      label:"Митрильный топор",      tier:6,  skill:"axe", damage:18, weight:1.5, value:1800,  twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2 },
  dark_axe:          { id:"dark_axe",         label:"Тёмный топор",          tier:7,  skill:"axe", damage:24, weight:3.5, value:6000,  twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  starmetal_axe:     { id:"starmetal_axe",    label:"Звёздный топор",        tier:8,  skill:"axe", damage:30, weight:1.8, value:12500, twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_axe:    { id:"orichalcum_axe",   label:"Орихалковый топор",     tier:9,  skill:"axe", damage:40, weight:1.5, value:55000, twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical",
                       affixes:{ ignoreArmor:0.25, bleedingBonus:1, criticalDamageMult:1.4 } },
  adamantium_axe:    { id:"adamantium_axe",   label:"Адамантиевый топор",    tier:10, skill:"axe", damage:55, weight:1.4, value:130000,twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical",
                       affixes:{ ignoreArmor:0.45, bleedingBonus:2, criticalDamageMult:2.0, executeBelowHp:0.20 } },
  // 2H секиры
  war_axe:           { id:"war_axe",          label:"Боевой топор (2р.)",    tier:4,  skill:"axe", damage:16, weight:4.0, value:350,   twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  bronze_greataxe:   { id:"bronze_greataxe",  label:"Бронзовая секира",      tier:2,  skill:"axe", damage:9,  weight:3.5, value:100,   twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  iron_greataxe:     { id:"iron_greataxe",    label:"Железная секира",       tier:3,  skill:"axe", damage:12, weight:4.0, value:240,   twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  tempered_greataxe: { id:"tempered_greataxe",label:"Закалённая секира",     tier:5,  skill:"axe", damage:20, weight:4.0, value:850,   twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  mithril_greataxe:  { id:"mithril_greataxe", label:"Митрильная секира",     tier:6,  skill:"axe", damage:26, weight:3.0, value:2800,  twoHanded:true,  energyCost:6, range:1, gridW:1, gridH:3 },
  darkiron_greataxe: { id:"darkiron_greataxe",label:"Секира тёмного железа", tier:7,  skill:"axe", damage:34, weight:4.0, value:8500,  twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  starmetal_greataxe:{ id:"starmetal_greataxe",label:"Звёздная секира",      tier:8,  skill:"axe", damage:42, weight:3.5, value:22000, twoHanded:true,  energyCost:6, range:1, gridW:1, gridH:3, damageType:"magical" },
  orichalcum_greataxe:{ id:"orichalcum_greataxe",label:"Секира Орихалка",     tier:9,  skill:"axe", damage:55, weight:3.0, value:95000, twoHanded:true,  energyCost:6, range:1, gridW:1, gridH:3, damageType:"magical",
                        affixes:{ ignoreArmor:0.3, bleedingBonus:2, criticalDamageMult:1.6 } },
  cataclysm_axe:     { id:"cataclysm_axe",    label:"Секира Катаклизма",     tier:10, skill:"axe", damage:75, weight:2.6, value:240000,twoHanded:true,  energyCost:6, range:1, gridW:1, gridH:3, damageType:"magical",
                       affixes:{ ignoreArmor:0.5, bleedingBonus:3, criticalDamageMult:2.5, executeBelowHp:0.25 } },

  // ══ КОПЬЯ ═════════════════════════════════════════════════
  // Range=2: копьё бьёт через клетку. Алебарда (T4) — range=3.
  copper_spear:        { id:"copper_spear",       label:"Медное копьё",          tier:1,  skill:"spear", damage:4,  weight:2.0, value:10,    twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4 },
  bronze_spear:        { id:"bronze_spear",       label:"Бронзовое копьё",       tier:2,  skill:"spear", damage:6,  weight:2.2, value:30,    twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4 },
  iron_spear:          { id:"iron_spear",         label:"Железное копьё",        tier:3,  skill:"spear", damage:8,  weight:2.5, value:80,    twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4 },
  steel_spear:         { id:"steel_spear",        label:"Стальное копьё",        tier:4,  skill:"spear", damage:11, weight:2.5, value:220,   twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4 },
  halberd:             { id:"halberd",            label:"Алебарда",              tier:4,  skill:"spear", damage:14, weight:4.0, value:300,   twoHanded:true, energyCost:5, range:3, gridW:1, gridH:4 },
  hardened_spear:      { id:"hardened_spear",     label:"Закалённое копьё",      tier:5,  skill:"spear", damage:14, weight:2.4, value:550,   twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4 },
  mithril_spear:       { id:"mithril_spear",      label:"Митрильное копьё",      tier:6,  skill:"spear", damage:20, weight:1.5, value:2500,  twoHanded:true, energyCost:2, range:2, gridW:1, gridH:4 },
  darkiron_pike:       { id:"darkiron_pike",      label:"Пика тёмного железа",   tier:7,  skill:"spear", damage:25, weight:3.0, value:6500,  twoHanded:true, energyCost:3, range:3, gridW:1, gridH:4 },
  starmetal_spear:     { id:"starmetal_spear",    label:"Звёздное копьё",        tier:8,  skill:"spear", damage:32, weight:1.5, value:15000, twoHanded:true, energyCost:2, range:2, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_spear:    { id:"orichalcum_spear",   label:"Копьё Орихалка",        tier:9,  skill:"spear", damage:42, weight:1.4, value:65000, twoHanded:true, energyCost:2, range:3, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.35, criticalDamageMult:1.6, disarmChance:0.20 } },
  godpiercer:          { id:"godpiercer",         label:"Богопронзитель",        tier:10, skill:"spear", damage:60, weight:1.2, value:160000,twoHanded:true, energyCost:2, range:3, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.6, criticalDamageMult:2.2, executeBelowHp:0.20, disarmChance:0.30 } },

  // ══ БУЛАВЫ И МОЛОТЫ ═══════════════════════════════════════
  copper_mace:         { id:"copper_mace",        label:"Медная булава",         tier:1,  skill:"mace",  damage:4,  weight:1.5, value:10,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  bronze_mace:         { id:"bronze_mace",        label:"Бронзовая булава",      tier:2,  skill:"mace",  damage:6,  weight:1.7, value:32,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  iron_mace:           { id:"iron_mace",          label:"Железная булава",       tier:3,  skill:"mace",  damage:9,  weight:2.0, value:85,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  steel_mace:          { id:"steel_mace",         label:"Стальная булава",       tier:4,  skill:"mace",  damage:13, weight:2.2, value:240,   twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  hardened_mace:       { id:"hardened_mace",      label:"Закалённая булава",     tier:5,  skill:"mace",  damage:16, weight:2.0, value:600,   twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  mithril_mace:        { id:"mithril_mace",       label:"Митрильная булава",     tier:6,  skill:"mace",  damage:21, weight:1.3, value:2000,  twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2 },
  darkiron_mace:       { id:"darkiron_mace",      label:"Молот тёмного железа",  tier:7,  skill:"mace",  damage:26, weight:2.5, value:5500,  twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  starmetal_mace:      { id:"starmetal_mace",     label:"Звёздная булава",       tier:8,  skill:"mace",  damage:34, weight:1.5, value:13000, twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_mace:     { id:"orichalcum_mace",    label:"Молот Орихалка",        tier:9,  skill:"mace",  damage:44, weight:1.4, value:55000, twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical",
                         affixes:{ ignoreArmor:0.3, stunChance:0.20, criticalDamageMult:1.5 } },
  godcrusher_mace:     { id:"godcrusher_mace",    label:"Богоразитель",          tier:10, skill:"mace",  damage:60, weight:1.2, value:130000,twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical",
                         affixes:{ ignoreArmor:0.5, stunChance:0.35, criticalDamageMult:2.0, executeBelowHp:0.15 } },
  // 2H молоты
  war_hammer:          { id:"war_hammer",         label:"Боевой молот",          tier:4,  skill:"mace",  damage:17, weight:4.5, value:320,   twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3 },
  bronze_warhammer:    { id:"bronze_warhammer",   label:"Бронзовый молот",       tier:2,  skill:"mace",  damage:9,  weight:4.0, value:90,    twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3 },
  iron_warhammer:      { id:"iron_warhammer",     label:"Железный молот",        tier:3,  skill:"mace",  damage:13, weight:4.5, value:200,   twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3 },
  tempered_warhammer:  { id:"tempered_warhammer", label:"Закалённый молот",      tier:5,  skill:"mace",  damage:22, weight:4.5, value:900,   twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3 },
  mithril_warhammer:   { id:"mithril_warhammer",  label:"Митрильный молот",      tier:6,  skill:"mace",  damage:28, weight:3.0, value:3000,  twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  darkiron_warhammer:  { id:"darkiron_warhammer", label:"Молот тёмного железа",  tier:7,  skill:"mace",  damage:36, weight:4.0, value:9000,  twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3 },
  starmetal_warhammer: { id:"starmetal_warhammer",label:"Звёздный молот",        tier:8,  skill:"mace",  damage:46, weight:3.0, value:24000, twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3, damageType:"magical" },
  orichalcum_warhammer:{ id:"orichalcum_warhammer",label:"Молот Орихалка",        tier:9,  skill:"mace",  damage:60, weight:2.5, value:100000,twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3, damageType:"magical",
                         affixes:{ ignoreArmor:0.35, stunChance:0.25, criticalDamageMult:1.7 } },
  cataclysm_hammer:    { id:"cataclysm_hammer",   label:"Молот Катаклизма",      tier:10, skill:"mace",  damage:85, weight:2.4, value:260000,twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3, damageType:"magical",
                         affixes:{ ignoreArmor:0.55, stunChance:0.40, criticalDamageMult:2.5, executeBelowHp:0.25 } },

  // ══ ЦЕПЫ / КИСТЕНИ ════════════════════════════════════════
  bronze_flail:        { id:"bronze_flail",       label:"Бронзовый кистень",     tier:2,  skill:"flail", damage:6,  weight:1.6, value:50,    twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2 },
  iron_flail:          { id:"iron_flail",         label:"Железный кистень",      tier:3,  skill:"flail", damage:9,  weight:1.8, value:120,   twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2 },
  steel_flail:         { id:"steel_flail",        label:"Стальной кистень",      tier:4,  skill:"flail", damage:12, weight:2.0, value:260,   twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2 },
  hardened_flail:      { id:"hardened_flail",     label:"Закалённый кистень",    tier:5,  skill:"flail", damage:15, weight:2.0, value:650,   twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2 },
  mithril_flail:       { id:"mithril_flail",      label:"Митрильный кистень",    tier:6,  skill:"flail", damage:20, weight:1.4, value:2200,  twoHanded:false, energyCost:4, range:2, gridW:1, gridH:2 },
  darkiron_flail:      { id:"darkiron_flail",     label:"Цеп тёмного железа",    tier:7,  skill:"flail", damage:25, weight:2.5, value:6000,  twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2 },
  starmetal_flail:     { id:"starmetal_flail",    label:"Звёздный кистень",      tier:8,  skill:"flail", damage:32, weight:1.6, value:14000, twoHanded:false, energyCost:4, range:2, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_flail:    { id:"orichalcum_flail",   label:"Цеп Орихалка",          tier:9,  skill:"flail", damage:42, weight:1.4, value:60000, twoHanded:false, energyCost:4, range:2, gridW:1, gridH:2, damageType:"magical",
                         affixes:{ ignoreArmor:0.25, stunChance:0.15, disarmChance:0.20, criticalDamageMult:1.5 } },
  bonebreaker_flail:   { id:"bonebreaker_flail",  label:"Костолом",              tier:10, skill:"flail", damage:60, weight:1.2, value:140000,twoHanded:false, energyCost:4, range:2, gridW:1, gridH:2, damageType:"magical",
                         affixes:{ ignoreArmor:0.45, stunChance:0.30, disarmChance:0.30, criticalDamageMult:2.0 } },

  // ══ ЛУКИ ══════════════════════════════════════════════════
  short_bow:           { id:"short_bow",          label:"Короткий лук",          tier:1,  skill:"bow",   damage:4,  weight:1.0, value:18,    twoHanded:true,  energyCost:3, range:6, gridW:1, gridH:3 },
  long_bow:            { id:"long_bow",           label:"Длинный лук",           tier:2,  skill:"bow",   damage:6,  weight:1.5, value:50,    twoHanded:true,  energyCost:3, range:8, gridW:1, gridH:4 },
  hunters_bow:         { id:"hunters_bow",        label:"Охотничий лук",         tier:3,  skill:"bow",   damage:8,  weight:1.4, value:130,   twoHanded:true,  energyCost:3, range:8, gridW:1, gridH:4 },
  composite_bow:       { id:"composite_bow",      label:"Составной лук",         tier:4,  skill:"bow",   damage:10, weight:1.2, value:280,   twoHanded:true,  energyCost:3, range:9, gridW:1, gridH:4 },
  recurve_bow:         { id:"recurve_bow",        label:"Рекурсивный лук",       tier:5,  skill:"bow",   damage:13, weight:1.2, value:700,   twoHanded:true,  energyCost:3, range:9, gridW:1, gridH:4 },
  mithril_bow:         { id:"mithril_bow",        label:"Митрильный лук",        tier:6,  skill:"bow",   damage:16, weight:0.8, value:2200,  twoHanded:true,  energyCost:2, range:10, gridW:1, gridH:4 },
  darkiron_bow:        { id:"darkiron_bow",       label:"Лук тёмного железа",    tier:7,  skill:"bow",   damage:21, weight:1.5, value:5500,  twoHanded:true,  energyCost:3, range:10, gridW:1, gridH:4 },
  starmetal_bow:       { id:"starmetal_bow",      label:"Звёздный лук",          tier:8,  skill:"bow",   damage:27, weight:1.0, value:13500, twoHanded:true,  energyCost:2, range:11, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_bow:      { id:"orichalcum_bow",     label:"Лук Орихалка",          tier:9,  skill:"bow",   damage:36, weight:0.8, value:55000, twoHanded:true,  energyCost:2, range:12, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.25, criticalDamageMult:1.6, bleedingBonus:1 } },
  windseeker_bow:      { id:"windseeker_bow",     label:"Лук Ветроискателя",     tier:10, skill:"bow",   damage:50, weight:0.7, value:130000,twoHanded:true,  energyCost:2, range:14, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.45, criticalDamageMult:2.2, executeBelowHp:0.20, bleedingBonus:1 } },

  // ══ АРБАЛЕТЫ ══════════════════════════════════════════════
  hand_crossbow:       { id:"hand_crossbow",      label:"Ручной арбалет",        tier:1,  skill:"crossbow", damage:5,  weight:2.0, value:25,    twoHanded:true,  energyCost:2, range:6, gridW:1, gridH:2 },
  lt_crossbow:         { id:"lt_crossbow",        label:"Лёгкий арбалет",        tier:2,  skill:"crossbow", damage:7,  weight:2.5, value:60,    twoHanded:true,  energyCost:2, range:8, gridW:1, gridH:2 },
  iron_crossbow:       { id:"iron_crossbow",      label:"Железный арбалет",      tier:3,  skill:"crossbow", damage:10, weight:3.0, value:150,   twoHanded:true,  energyCost:2, range:9, gridW:1, gridH:3 },
  hv_crossbow:         { id:"hv_crossbow",        label:"Тяжёлый арбалет",       tier:4,  skill:"crossbow", damage:14, weight:4.0, value:300,   twoHanded:true,  energyCost:2, range:10,gridW:1, gridH:3 },
  arbalest:            { id:"arbalest",           label:"Арбалест",              tier:5,  skill:"crossbow", damage:18, weight:4.0, value:850,   twoHanded:true,  energyCost:2, range:11,gridW:1, gridH:3 },
  mithril_crossbow:    { id:"mithril_crossbow",   label:"Митрильный арбалет",    tier:6,  skill:"crossbow", damage:23, weight:2.5, value:2700,  twoHanded:true,  energyCost:2, range:12,gridW:1, gridH:3 },
  darkiron_crossbow:   { id:"darkiron_crossbow",  label:"Арбалет тёмного железа",tier:7,  skill:"crossbow", damage:29, weight:3.5, value:7500,  twoHanded:true,  energyCost:2, range:13,gridW:1, gridH:3 },
  starmetal_crossbow:  { id:"starmetal_crossbow", label:"Звёздный арбалет",      tier:8,  skill:"crossbow", damage:38, weight:2.5, value:18000, twoHanded:true,  energyCost:2, range:14,gridW:1, gridH:3, damageType:"magical" },
  orichalcum_crossbow: { id:"orichalcum_crossbow",label:"Арбалет Орихалка",      tier:9,  skill:"crossbow", damage:50, weight:2.0, value:75000, twoHanded:true,  energyCost:2, range:15,gridW:1, gridH:3, damageType:"magical",
                         affixes:{ ignoreArmor:0.4, criticalDamageMult:1.8 } },
  voidseeker_crossbow: { id:"voidseeker_crossbow",label:"Арбалет Ищущего Пустоту",tier:10,skill:"crossbow", damage:70, weight:1.8, value:170000,twoHanded:true,  energyCost:2, range:18,gridW:1, gridH:3, damageType:"magical",
                         affixes:{ ignoreArmor:0.6, criticalDamageMult:2.5, executeBelowHp:0.25 } },

  // ══ МЕТАТЕЛЬНОЕ ═══════════════════════════════════════════
  throwing_stones:     { id:"throwing_stones",    label:"Метательные камни",     tier:1,  skill:"throwing", damage:2,  weight:0.5, value:1,     twoHanded:false, energyCost:2, range:3, gridW:1, gridH:1 },
  throwing_knives:     { id:"throwing_knives",    label:"Метательные ножи",      tier:2,  skill:"throwing", damage:4,  weight:0.3, value:25,    twoHanded:false, energyCost:2, range:4, gridW:1, gridH:1 },
  javelin:             { id:"javelin",            label:"Дротик",                tier:2,  skill:"throwing", damage:6,  weight:0.8, value:15,    twoHanded:false, energyCost:2, range:5, gridW:1, gridH:3 },
  iron_javelin:        { id:"iron_javelin",       label:"Железный дротик",       tier:3,  skill:"throwing", damage:8,  weight:0.8, value:50,    twoHanded:false, energyCost:2, range:5, gridW:1, gridH:3 },
  steel_javelin:       { id:"steel_javelin",      label:"Стальной дротик",       tier:4,  skill:"throwing", damage:11, weight:0.8, value:120,   twoHanded:false, energyCost:2, range:5, gridW:1, gridH:3 },
  steel_chakram:       { id:"steel_chakram",      label:"Стальной чакрам",       tier:5,  skill:"throwing", damage:13, weight:0.4, value:380,   twoHanded:false, energyCost:2, range:5, gridW:1, gridH:1 },
  mithril_chakram:     { id:"mithril_chakram",    label:"Митрильный чакрам",     tier:6,  skill:"throwing", damage:17, weight:0.3, value:1400,  twoHanded:false, energyCost:2, range:6, gridW:1, gridH:1 },
  darkiron_chakram:    { id:"darkiron_chakram",   label:"Чакрам тёмного железа", tier:7,  skill:"throwing", damage:22, weight:0.5, value:4200,  twoHanded:false, energyCost:2, range:6, gridW:1, gridH:1 },
  starmetal_chakram:   { id:"starmetal_chakram",  label:"Звёздный чакрам",       tier:8,  skill:"throwing", damage:28, weight:0.3, value:11000, twoHanded:false, energyCost:2, range:7, gridW:1, gridH:1, damageType:"magical" },
  orichalcum_chakram:  { id:"orichalcum_chakram", label:"Чакрам Орихалка",       tier:9,  skill:"throwing", damage:38, weight:0.3, value:48000, twoHanded:false, energyCost:2, range:8, gridW:1, gridH:1, damageType:"magical",
                         affixes:{ ignoreArmor:0.3, criticalDamageMult:1.5, bleedingBonus:1 } },
  godhand_chakram:     { id:"godhand_chakram",    label:"Чакрам Длани Богов",    tier:10, skill:"throwing", damage:55, weight:0.2, value:120000,twoHanded:false, energyCost:2, range:9, gridW:1, gridH:1, damageType:"magical",
                         affixes:{ ignoreArmor:0.5, criticalDamageMult:2.0, executeBelowHp:0.20, bleedingBonus:2 } },

  // ══ ПОСОХИ ════════════════════════════════════════════════
  wooden_staff:        { id:"wooden_staff",       label:"Деревянный посох",      tier:1,  skill:"exotic", damage:3,  weight:2.0, value:5,      twoHanded:true,  energyCost:4, range:1, gridW:1, gridH:4 },
  oak_staff:           { id:"oak_staff",          label:"Дубовый посох",         tier:2,  skill:"exotic", damage:5,  weight:2.0, value:25,     twoHanded:true,  energyCost:4, range:1, gridW:1, gridH:4 },
  iron_staff:          { id:"iron_staff",         label:"Железный посох",        tier:3,  skill:"exotic", damage:7,  weight:3.0, value:70,     twoHanded:true,  energyCost:4, range:1, gridW:1, gridH:4 },
  steel_staff:         { id:"steel_staff",        label:"Стальной посох",        tier:4,  skill:"exotic", damage:10, weight:2.8, value:220,    twoHanded:true,  energyCost:4, range:1, gridW:1, gridH:4 },
  mage_staff:          { id:"mage_staff",         label:"Магический посох",      tier:5,  skill:"exotic", damage:6,  weight:1.5, value:800,    twoHanded:true,  energyCost:3, range:2, gridW:1, gridH:4, damageType:"magical" },
  archmage_staff:      { id:"archmage_staff",     label:"Посох архимага",        tier:6,  skill:"exotic", damage:9,  weight:1.5, value:2400,   twoHanded:true,  energyCost:3, range:3, gridW:1, gridH:4, damageType:"magical" },
  darkiron_staff:      { id:"darkiron_staff",     label:"Посох тёмного железа",  tier:7,  skill:"exotic", damage:14, weight:2.0, value:6000,   twoHanded:true,  energyCost:3, range:3, gridW:1, gridH:4, damageType:"magical" },
  starmetal_staff:     { id:"starmetal_staff",    label:"Звёздный посох",        tier:8,  skill:"exotic", damage:18, weight:1.5, value:14500,  twoHanded:true,  energyCost:3, range:4, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_staff:    { id:"orichalcum_staff",   label:"Посох Орихалка",        tier:9,  skill:"exotic", damage:24, weight:1.2, value:60000,  twoHanded:true,  energyCost:2, range:4, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.4, criticalDamageMult:1.7, lifeSteal:0.10 } },
  worldroot_staff:     { id:"worldroot_staff",    label:"Посох Мирового Корня",  tier:10, skill:"exotic", damage:35, weight:1.0, value:140000, twoHanded:true,  energyCost:2, range:5, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.6, criticalDamageMult:2.2, lifeSteal:0.20, executeBelowHp:0.20 } },
};


export const ARMORS = {
  // Ступень 1 — Кожа
  leather_cap:    { id:"leather_cap",   label:"Кожаная шапка",    tier:1, slot:"head",    resist:{physical:1},weight:0.5,value:8  },
  leather_jacket: { id:"leather_jacket",label:"Кожаная куртка",   tier:1, slot:"torso",   resist:{physical:2},weight:3,  value:20 },
  leather_gloves: { id:"leather_gloves",label:"Кожаные перчатки", tier:1, slot:"rightArm",resist:{physical:1},weight:0.3,value:6  },
  leather_boots:  { id:"leather_boots", label:"Кожаные сапоги",   tier:1, slot:"legs",    resist:{physical:1},weight:1,  value:10 },
  wooden_shield:  { id:"wooden_shield", label:"Деревянный щит",   tier:1, slot:"leftHand",resist:{physical:2},weight:2,  value:8  },

  // Ступень 2 — Кольчуга
  chainmail_coif: { id:"chainmail_coif",label:"Кольчужный капюшон",tier:2,slot:"head",   resist:{physical:2},weight:1,  value:40 },
  chainmail:      { id:"chainmail",     label:"Кольчуга",          tier:2,slot:"torso",  resist:{physical:4},weight:8,  value:120},
  chain_sleeves:  { id:"chain_sleeves", label:"Кольчужные рукава", tier:2,slot:"rightArm",resist:{physical:2},weight:2, value:30 },
  chain_leggings: { id:"chain_leggings",label:"Кольчужные поножи", tier:2,slot:"legs",   resist:{physical:3},weight:4,  value:60 },
  iron_shield:    { id:"iron_shield",   label:"Железный щит",      tier:2,slot:"leftHand",resist:{physical:4},weight:4, value:50 },

  // Ступень 3 — Наборный
  plate_helm:     { id:"plate_helm",    label:"Шлем",              tier:3,slot:"head",   resist:{physical:4},weight:2,  value:150},
  plate_chest:    { id:"plate_chest",   label:"Нагрудник",         tier:3,slot:"torso",  resist:{physical:7},weight:12, value:350},
  plate_arms:     { id:"plate_arms",    label:"Наручи",            tier:3,slot:"rightArm",resist:{physical:3},weight:3, value:120},
  plate_legs:     { id:"plate_legs",    label:"Набедренники",      tier:3,slot:"legs",   resist:{physical:5},weight:5,  value:200},
  kite_shield:    { id:"kite_shield",   label:"Рыцарский щит",     tier:3,slot:"leftHand",resist:{physical:6},weight:6, value:180},

  // Ступень 4 — Легированная (бронза)
  alloy_helm:     { id:"alloy_helm",    label:"Легированный шлем",  tier:4, slot:"head",   resist:{physical:5, magical:1}, weight:1.5,value:250  },
  alloy_chest:    { id:"alloy_chest",   label:"Легированный панцирь",tier:4,slot:"torso", resist:{physical:9, magical:2}, weight:10, value:600  },

  // Ступень 5 — Митрильная
  mithril_helm:   { id:"mithril_helm",  label:"Митрильный шлем",     tier:5, slot:"head",    resist:{physical:6, magical:4}, weight:1,  value:700  },
  mithril_chest:  { id:"mithril_chest", label:"Митрильный нагрудник",tier:5, slot:"torso",   resist:{physical:11,magical:6}, weight:6,  value:1800 },
  mithril_legs:   { id:"mithril_legs",  label:"Митрильные поножи",   tier:5, slot:"legs",    resist:{physical:7, magical:3}, weight:4,  value:900  },
  mithril_shield: { id:"mithril_shield",label:"Митрильный щит",      tier:5, slot:"leftHand",resist:{physical:8, magical:4}, weight:3,  value:600  },

  // Ступень 6 — Тёмное железо
  darkiron_chest: { id:"darkiron_chest",label:"Доспех тёмного железа",tier:6,slot:"torso",resist:{physical:14,magical:5},weight:12, value:3000 },
  darkiron_helm:  { id:"darkiron_helm", label:"Шлем тёмного железа",tier:6,slot:"head",  resist:{physical:8, magical:3}, weight:2,  value:1200 },

  // Ступень 7 — Звёздный металл
  void_armor:     { id:"void_armor",    label:"Доспех Пустоты",    tier:7, slot:"torso",  resist:{physical:16,magical:12},weight:5, value:8000 },
  star_helm:      { id:"star_helm",     label:"Шлем звёздного металла",tier:7,slot:"head",resist:{physical:10,magical:6},weight:1.5,value:4000 },

  // Ступень 8 — Небесная сталь
  celestial_plate:{ id:"celestial_plate",label:"Небесный нагрудник",tier:8,slot:"torso", resist:{physical:20,magical:15},weight:5, value:20000},
  celestial_helm: { id:"celestial_helm",label:"Небесный шлем",     tier:8, slot:"head",   resist:{physical:12,magical:8}, weight:1.5,value:8000 },

  // Ступень 9-10 — Легендарные
  orichalcum_armor:{ id:"orichalcum_armor",label:"Доспех Орихалка",tier:9,slot:"torso",  resist:{physical:25,magical:20},weight:4, value:60000},
  adamantium_plate:{ id:"adamantium_plate",label:"Адамантиевые латы",tier:10,slot:"torso",resist:{physical:35,magical:25},weight:6, value:200000},
};

// ──────────────────────────────────────────────────────────────
// ЗЕЛЬЯ (по ступеням)
// ──────────────────────────────────────────────────────────────
export const POTIONS = {
  // Ступень 1
  minor_heal:    { id:"minor_heal",    label:"Малое зелье лечения",   tier:1, effect:"healHP",     power:3,  weight:0.3, value:10 },
  minor_energy:       { id:"minor_energy",       label:"Малое зелье бодрости",      tier:1, effect:"restoreEnergy",    power:4,  weight:0.3, value:8   },
  minor_energy_max:   { id:"minor_energy_max",   label:"Малый тоник бодрости",      tier:1, effect:"restoreEnergyMax", power:2,  weight:0.3, value:12  },
  antidote_weak: { id:"antidote_weak", label:"Слабое противоядие",    tier:1, effect:"curePoison",  power:1,  weight:0.3, value:12 },
  water_flask:   { id:"water_flask",   label:"Фляга чистой воды",     tier:1, effect:"restoreHydration",power:20,weight:0.5,value:2},

  // Ступень 2
  heal_potion:   { id:"heal_potion",   label:"Зелье лечения",         tier:2, effect:"healHP",     power:8,  weight:0.3, value:30 },
  energy_potion:      { id:"energy_potion",      label:"Зелье бодрости",            tier:2, effect:"restoreEnergy",    power:10, weight:0.3, value:25  },
  energy_potion_max:  { id:"energy_potion_max",  label:"Тоник выносливости",        tier:2, effect:"restoreEnergyMax", power:5,  weight:0.3, value:40  },
  mana_potion:   { id:"mana_potion",   label:"Зелье маны",            tier:2, effect:"restoreMana", power:8,  weight:0.3, value:30 },
  speed_potion:  { id:"speed_potion",  label:"Зелье скорости",        tier:2, effect:"speedBoost",  power:2,  weight:0.3, value:35 },

  // Ступень 3
  greater_heal:  { id:"greater_heal",  label:"Большое зелье лечения", tier:3, effect:"healHP",     power:20, weight:0.3, value:80 },
  elixir_vigor:       { id:"elixir_vigor",       label:"Эликсир бодрости",          tier:3, effect:"restoreEnergy",    power:25, weight:0.3, value:70  },
  elixir_endurance:   { id:"elixir_endurance",   label:"Эликсир выносливости",      tier:3, effect:"restoreEnergyMax", power:12, weight:0.3, value:120 },
  grand_elixir:       { id:"grand_elixir",        label:"Великий эликсир",           tier:5, effect:"restoreEnergyMax", power:30, weight:0.3, value:500 },
  antidote:      { id:"antidote",      label:"Противоядие",            tier:3, effect:"curePoison",  power:3,  weight:0.3, value:50 },

  // Ступень 5+
  elixir_life:   { id:"elixir_life",   label:"Эликсир жизни",         tier:5, effect:"healAll",    power:50, weight:0.3, value:500},
  philosophers:  { id:"philosophers",  label:"Философский эликсир",    tier:8, effect:"healAll",    power:100,weight:0.3, value:5000},
};

// ──────────────────────────────────────────────────────────────
// ЕДА (восполняет сытость/жажду)
// ──────────────────────────────────────────────────────────────
export const FOOD = {
  bread:         { id:"bread",         label:"Хлеб",              tier:1, satiety:15, hydration:5,  weight:0.5, value:1  },
  dried_meat:    { id:"dried_meat",    label:"Вяленое мясо",      tier:1, satiety:20, hydration:0,  weight:0.5, value:3  },
  fresh_meat:    { id:"fresh_meat",    label:"Свежее мясо",       tier:1, satiety:25, hydration:5,  weight:1,   value:2  },
  cheese:        { id:"cheese",        label:"Сыр",               tier:1, satiety:12, hydration:3,  weight:0.3, value:2  },
  cooked_stew:   { id:"cooked_stew",   label:"Тушёное мясо",      tier:1, satiety:30, hydration:10, weight:0.8, value:4  },
  mushroom_soup: { id:"mushroom_soup", label:"Грибной суп",       tier:1, satiety:25, hydration:15, weight:0.8, value:3  },
  trail_rations: { id:"trail_rations", label:"Походный паёк",     tier:1, satiety:20, hydration:5,  weight:0.5, value:5  },
  fine_meal:     { id:"fine_meal",     label:"Изысканное блюдо",  tier:2, satiety:40, hydration:15, weight:1,   value:15 },
  dwarf_brew:    { id:"dwarf_brew",    label:"Гномье пиво",       tier:1, satiety:8,  hydration:20, weight:0.5, value:4,
                   bonus: { energy:3, note:"Небольшой прилив сил" } },
};

// ──────────────────────────────────────────────────────────────
// ИНСТРУМЕНТЫ
// ──────────────────────────────────────────────────────────────
export const TOOLS = {
  // Ступень 1
  flint_tools:   { id:"flint_tools",   label:"Кремнёвые инструменты", tier:1, craftType:"crafting",   weight:1,  value:5  },
  iron_hammer:   { id:"iron_hammer",   label:"Железный молот",        tier:1, craftType:"blacksmithing",weight:2, value:10 },
  mortar_pestle: { id:"mortar_pestle", label:"Ступка и пестик",       tier:1, craftType:"alchemy",     weight:1,  value:8  },
  cooking_pot:   { id:"cooking_pot",   label:"Котелок",               tier:1, craftType:"cooking",     weight:2,  value:6  },
  pickaxe_iron:  { id:"pickaxe_iron",  label:"Железная кирка",        tier:1, craftType:"mining",      weight:3,  value:15 },

  // Ступень 2
  steel_hammer:  { id:"steel_hammer",  label:"Стальной молот",        tier:2, craftType:"blacksmithing",weight:2, value:40 },
  alch_kit:      { id:"alch_kit",      label:"Алхимический набор",    tier:2, craftType:"alchemy",     weight:3,  value:60 },
  master_tools:  { id:"master_tools",  label:"Инструменты мастера",   tier:2, craftType:"crafting",    weight:2,  value:50 },
  pickaxe_steel: { id:"pickaxe_steel", label:"Стальная кирка",        tier:2, craftType:"mining",      weight:3,  value:40 },

  // Ступень 3+
  dwarven_hammer:{ id:"dwarven_hammer",label:"Гномий молот",          tier:3, craftType:"blacksmithing",weight:2, value:150},
  grand_alch_kit:{ id:"grand_alch_kit",label:"Большая алхим. лаб.",   tier:3, craftType:"alchemy",     weight:5,  value:200},
};

// ──────────────────────────────────────────────────────────────
// ПОЯСА (belt) — дают слоты на поясе
// ──────────────────────────────────────────────────────────────
export const BELTS = {
  rope_belt:     { id:"rope_belt",     label:"Верёвочный пояс",     tier:1, weight:0.3, value:3,
    gridW:2, gridH:1, containerSlots:{cols:2,rows:1}, attachmentSlots:[], weightFactor:1.0,
    desc:"Простой верёвочный пояс. Минимум места." },
  leather_belt:  { id:"leather_belt",  label:"Кожаный пояс",        tier:1, weight:0.5, value:12,
    gridW:2, gridH:1, containerSlots:{cols:3,rows:1}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Крепление"}], weightFactor:1.0,
    desc:"Стандартный кожаный пояс с одним боковым креплением." },
  soldier_belt:  { id:"soldier_belt",  label:"Солдатский пояс",     tier:2, weight:0.8, value:40,
    gridW:2, gridH:1, containerSlots:{cols:4,rows:1}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Крепление 1"},
      {key:"a1",w:1,h:2,label:"Крепление 2"}], weightFactor:1.0,
    desc:"Широкий пояс с двумя боковыми креплениями для оружия или подсумков." },
  tactical_belt: { id:"tactical_belt", label:"Тактический пояс",    tier:3, weight:1.0, value:120,
    gridW:2, gridH:1, containerSlots:{cols:5,rows:2}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:3,label:"Кр. 3"}], weightFactor:1.0,
    desc:"Профессиональный тактический пояс. Много места, три крепления." },
  mithril_belt:  { id:"mithril_belt",  label:"Митрильный пояс",     tier:5, weight:0.5, value:800,
    gridW:2, gridH:1, containerSlots:{cols:6,rows:2}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:2,label:"Кр. 3"},{key:"a3",w:1,h:2,label:"Кр. 4"}], weightFactor:0.9,
    desc:"Лёгкий митрильный пояс. Вещи в нём весят немного меньше." },
};

// ──────────────────────────────────────────────────────────────
// РЮКЗАКИ (backpack) — разные размеры и вес-множители
// ──────────────────────────────────────────────────────────────
export const BACKPACKS = {
  // Ступень 1 — самые маленькие
  hip_pouch:     { id:"hip_pouch",     label:"Поясная сумка",       tier:1, weight:0.3, value:8,
    gridW:1, gridH:2, containerSlots:{cols:2,rows:2}, weightFactor:1.0,
    desc:"Маленькая сумочка на бедро. 2×2 слота. Быстрый доступ." },
  small_sack:    { id:"small_sack",    label:"Небольшой мешок",     tier:1, weight:0.5, value:5,
    gridW:2, gridH:2, containerSlots:{cols:3,rows:3}, weightFactor:1.0,
    desc:"Простой тканевый мешок. 3×3 слота. Ничего лишнего." },
  leather_satchel:{ id:"leather_satchel",label:"Кожаная сумка",    tier:1, weight:0.8, value:20,
    gridW:2, gridH:2, containerSlots:{cols:4,rows:3}, weightFactor:0.95,
    desc:"Небольшая кожаная сумка через плечо. 4×3 слота." },

  // Ступень 2 — средние
  travelers_pack: { id:"travelers_pack", label:"Дорожный ранец",    tier:2, weight:1.2, value:55,
    gridW:2, gridH:3, containerSlots:{cols:5,rows:4}, weightFactor:0.90,
    desc:"Стандартный путнический ранец. 5×4 слота. Вещи весят 90%." },
  soldier_pack:  { id:"soldier_pack",  label:"Солдатский ранец",    tier:2, weight:1.5, value:70,
    gridW:2, gridH:3, containerSlots:{cols:5,rows:5}, weightFactor:0.90,
    desc:"Армейский вещевой мешок. 5×5 слота. Прочный и вместительный." },
  hunters_bag:   { id:"hunters_bag",   label:"Охотничья сума",      tier:2, weight:1.0, value:60,
    gridW:2, gridH:3, containerSlots:{cols:4,rows:5}, weightFactor:0.92,
    desc:"Сума охотника. 4×5 слота. Узкие секции для инструментов." },

  // Ступень 3 — большие
  large_backpack: { id:"large_backpack",label:"Большой рюкзак",     tier:3, weight:2.0, value:150,
    gridW:2, gridH:4, containerSlots:{cols:6,rows:6}, weightFactor:0.85,
    desc:"Вместительный рюкзак. 6×6 слота. Вещи весят 85%." },
  frame_pack:    { id:"frame_pack",    label:"Рамный рюкзак",       tier:3, weight:2.5, value:200,
    gridW:2, gridH:4, containerSlots:{cols:6,rows:8}, weightFactor:0.80,
    desc:"Рюкзак с жёсткой рамой. 6×8 слота. Вещи весят 80%. Лучший для дальних походов." },

  // Ступень 4-5 — специальные
  alchemist_satchel:{ id:"alchemist_satchel",label:"Сумка алхимика",tier:4, weight:1.5, value:300,
    gridW:2, gridH:3, containerSlots:{cols:4,rows:4}, weightFactor:0.85,
    desc:"Специальная сумка с отдельными отсеками для зелий. 4×4. Зелья не разбиваются." },
  mithril_pack:  { id:"mithril_pack",  label:"Митрильный рюкзак",   tier:5, weight:1.0, value:1200,
    gridW:2, gridH:4, containerSlots:{cols:7,rows:8}, weightFactor:0.70,
    desc:"Лёгкий митрильный рюкзак. 7×8 слота. Вещи весят всего 70%." },
  void_satchel:  { id:"void_satchel",  label:"Сумка Пустоты",       tier:8, weight:0.5, value:8000,
    gridW:2, gridH:3, containerSlots:{cols:10,rows:10}, weightFactor:0.50,
    desc:"Артефактная сумка с карманом в Пустоте. 10×10. Вещи весят 50%." },
};

// ──────────────────────────────────────────────────────────────
// КРЕПЛЕНИЯ (attachment) — вешаются на пояс/броню, дают слоты
// ──────────────────────────────────────────────────────────────
export const ATTACHMENTS = {
  // ── Ножны (для мечей/ножей) ────────────────────────────────
  knife_sheath:  { id:"knife_sheath",  label:"Ножны (нож)",           tier:1,
    weight:0.2, value:5,   gridW:1, gridH:2,
    attachesTo:"belt", addsLabel:"Ножны (нож)",
    addsSlots:{cols:1,rows:2}, allowedTypes:["weapon"],
    allowedSkills:["knife"], accessSeconds:0,
    desc:"Ножны для ножа или кинжала. Быстрый доступ." },

  sword_scabbard: { id:"sword_scabbard", label:"Ножны (меч)",         tier:1,
    weight:0.4, value:15,  gridW:1, gridH:4,
    attachesTo:"belt", addsLabel:"Ножны (меч)",
    addsSlots:{cols:1,rows:4}, allowedTypes:["weapon"],
    allowedSkills:["sword"], accessSeconds:1,
    desc:"Ножны для одноручного меча. Вешаются на пояс." },

  greatsword_scabbard: { id:"greatsword_scabbard", label:"Ножны (двуруч.)", tier:2,
    weight:0.6, value:30,  gridW:1, gridH:5,
    attachesTo:"belt", addsLabel:"Ножны (двуручный)",
    addsSlots:{cols:1,rows:5}, allowedTypes:["weapon"],
    allowedSkills:["sword","axe","spear"], accessSeconds:2,
    desc:"Заспинные ножны для двуручного оружия." },

  axe_loop:      { id:"axe_loop",      label:"Петля (топор)",         tier:1,
    weight:0.2, value:8,   gridW:1, gridH:2,
    attachesTo:"belt", addsLabel:"Петля (топор)",
    addsSlots:{cols:1,rows:3}, allowedTypes:["weapon"],
    allowedSkills:["axe","mace"], accessSeconds:1,
    desc:"Кожаная петля для топора или булавы на поясе." },

  // ── Крюки и держатели для стрелкового ─────────────────────
  crossbow_hook: { id:"crossbow_hook", label:"Крюк (арбалет)",        tier:2,
    weight:0.3, value:25,  gridW:1, gridH:2,
    attachesTo:"belt", addsLabel:"Крюк арбалета",
    addsSlots:{cols:2,rows:3}, allowedTypes:["weapon"],
    allowedSkills:["crossbow"], accessSeconds:2,
    desc:"Поясной крюк для переноски арбалета. Можно зарядить на поясе." },

  bow_sling:     { id:"bow_sling",     label:"Перевязь (лук)",        tier:1,
    weight:0.3, value:12,  gridW:1, gridH:3,
    attachesTo:"belt", addsLabel:"Перевязь (лук)",
    addsSlots:{cols:1,rows:4}, allowedTypes:["weapon"],
    allowedSkills:["bow"], accessSeconds:2,
    desc:"Плечевая перевязь для переноски лука." },

  // ── Колчаны ───────────────────────────────────────────────
  arrow_quiver:  { id:"arrow_quiver",  label:"Колчан (стрелы)",       tier:1,
    weight:0.5, value:10,  gridW:1, gridH:3,
    attachesTo:"belt", addsLabel:"Колчан",
    addsSlots:{cols:2,rows:3}, allowedTypes:["material","throwable"],
    accessSeconds:0,
    desc:"Колчан для стрел и болтов. Быстрый доступ." },

  bolt_pouch:    { id:"bolt_pouch",    label:"Подсумок (болты)",      tier:1,
    weight:0.3, value:8,   gridW:1, gridH:2,
    attachesTo:"belt", addsLabel:"Подсумок болтов",
    addsSlots:{cols:2,rows:2}, allowedTypes:["material","throwable"],
    accessSeconds:0,
    desc:"Компактный подсумок для арбалетных болтов." },

  // ── Бандольеры (зелья/расходники) ────────────────────────
  potion_bandolier: { id:"potion_bandolier", label:"Бандольер (зелья)", tier:1,
    weight:0.4, value:18,  gridW:1, gridH:3,
    attachesTo:"belt", addsLabel:"Бандольер",
    addsSlots:{cols:3,rows:1}, allowedTypes:["potion","consumable","food"],
    accessSeconds:0,
    desc:"Кожаный бандольер на 3 зелья. Мгновенный доступ в бою." },

  large_bandolier: { id:"large_bandolier", label:"Бандольер большой", tier:2,
    weight:0.6, value:35,  gridW:1, gridH:3,
    attachesTo:"belt", addsLabel:"Бандольер (б.)",
    addsSlots:{cols:4,rows:2}, allowedTypes:["potion","consumable","food","throwable"],
    accessSeconds:0,
    desc:"Широкий бандольер на 8 ячеек для расходников." },

  // ── Крепления на броню торса ──────────────────────────────
  chest_pocket:  { id:"chest_pocket",  label:"Нагрудный карман",      tier:1,
    weight:0.1, value:8,   gridW:1, gridH:1,
    attachesTo:"torso", addsLabel:"Карман",
    addsSlots:{cols:2,rows:2}, allowedTypes:["material","food","potion"],
    accessSeconds:1,
    desc:"Нашитый карман на куртку или нагрудник. 4 ячейки." },

  utility_strap: { id:"utility_strap", label:"Разгрузочная стропа",   tier:2,
    weight:0.3, value:30,  gridW:2, gridH:1,
    attachesTo:"torso", addsLabel:"Стропа",
    addsSlots:{cols:3,rows:2}, allowedTypes:["potion","tool","throwable"],
    accessSeconds:1,
    desc:"Тактическая стропа на броню. 6 ячеек для снаряжения." },

  // ── Крепления на рюкзак ────────────────────────────────────
  side_pouch:    { id:"side_pouch",    label:"Боковой подсумок",      tier:1,
    weight:0.3, value:12,  gridW:1, gridH:2,
    attachesTo:"backpack", addsLabel:"Подсумок",
    addsSlots:{cols:3,rows:2}, allowedTypes:null,
    accessSeconds:2,
    desc:"Боковой подсумок на рюкзак. 6 ячеек, медленный доступ." },
};
