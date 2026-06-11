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
  sun_oak_board:  { id:"sun_oak_board",  label:"Доска солнечного дуба", tier:9,  category:"wood",  weight:2,   value:9500 },
  genesis_timber: { id:"genesis_timber", label:"Брус генезиса",        tier:10, category:"wood",  weight:1.8, value:48000},

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
  hydra_hide:     { id:"hydra_hide",     label:"Шкура гидры",          tier:9,  category:"hide",  weight:1.4, value:24000},
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
  aurora_thread:  { id:"aurora_thread",  label:"Нить Авроры",          tier:9,  category:"fiber", weight:0.08,value:9500 },
  genesis_weave:  { id:"genesis_weave",  label:"Полотно генезиса",     tier:10, category:"fiber", weight:0.06,value:52000},

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
  aeon_geode:     { id:"aeon_geode",     label:"Жеода эона",           tier:8,  category:"stone", weight:0.5, value:12000},
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
  spirit_bloom:   { id:"spirit_bloom",   label:"Цветок духов",         tier:5,  category:"herb",  weight:0.15,value:240  },
  phoenix_feather:{ id:"phoenix_feather",label:"Перо феникса",         tier:6,  category:"herb",  weight:0.1, value:800  },
  giant_heart:    { id:"giant_heart",    label:"Сердце великана",      tier:7,  category:"herb",  weight:1,   value:2000 },
  dragon_blood:   { id:"dragon_blood",   label:"Кровь дракона",        tier:8,  category:"herb",  weight:0.5, value:5000 },
  abyss_lichen:   { id:"abyss_lichen",   label:"Лишайник Бездны",      tier:9,  category:"herb",  weight:0.12,value:22000},
  god_tears:      { id:"god_tears",      label:"Слёзы богов",          tier:10, category:"herb",  weight:0.1, value:50000},

  // ── Разное (misc) ────────────────────────────────────────
  rope:           { id:"rope",           label:"Верёвка",              tier:1,  category:"misc",  weight:1,   value:2    },
  forge_coal:     { id:"forge_coal",     label:"Кузнечный кокс",       tier:2,  category:"misc",  weight:1,   value:8    },
  glass:          { id:"glass",          label:"Стекло",               tier:2,  category:"misc",  weight:0.5, value:5    },
  oil_flask:      { id:"oil_flask",      label:"Масло (фляга)",        tier:1,  category:"misc",  weight:0.5, value:3    },
  mana_stone:     { id:"mana_stone",     label:"Мана-камень",          tier:3,  category:"misc",  weight:0.3, value:60   },
  enchant_dust:   { id:"enchant_dust",   label:"Пыль зачарования",     tier:4,  category:"misc",  weight:0.1, value:150  },
  artisans_resin: { id:"artisans_resin", label:"Мастерская смола",     tier:5,  category:"misc",  weight:0.4, value:420  },
  soul_essence:   { id:"soul_essence",   label:"Эссенция души",        tier:6,  category:"misc",  weight:0.1, value:1000 },
  planar_clip:    { id:"planar_clip",    label:"Планарная скоба",      tier:7,  category:"misc",  weight:0.15,value:2800 },
  arcane_mesh:    { id:"arcane_mesh",    label:"Моток арканной проволоки",tier:8,category:"misc",  weight:0.3, value:7500 },
  relic_shard:    { id:"relic_shard",    label:"Осколок реликта",      tier:9,  category:"misc",  weight:0.2, value:32000},
  epoch_seed:     { id:"epoch_seed",     label:"Семя эпохи",           tier:10, category:"misc",  weight:0.1, value:88000},

  // ── Охота: части тел (ремесло / алхимия / еда-сырьё) ─────────────────
  beast_sinew_spool:{ id:"beast_sinew_spool", label:"Жильё зверя",      tier:1,  category:"misc", weight:0.3, value:3    },
  small_pelt_uncured:{ id:"small_pelt_uncured",label:"Небольшая шкура (сырая)",tier:1,category:"hide",weight:0.8,value:5 },
  fang_shard:     { id:"fang_shard",     label:"Осколок клыка",        tier:1,  category:"misc", weight:0.15,value:4    },
  wisp_moth_powder:{ id:"wisp_moth_powder",label:"Пыльца ночных мотыльков",tier:1,category:"herb",weight:0.08,value:5 },
  serpent_sac_mild:{ id:"serpent_sac_mild",label:"Слабая змеиная желчь",tier:2,category:"herb",weight:0.25,value:18   },
  bristle_keg_rings:{ id:"bristle_keg_rings",label:"Кольца из щетины кабана",tier:2,category:"misc",weight:0.2,value:12 },
  avian_keel_bone:{ id:"avian_keel_bone",  label:"Киль птицеящера",      tier:2, category:"misc", weight:0.4,value:14   },
  alpha_musk_gland:{ id:"alpha_musk_gland", label:"Железа вожака",          tier:3, category:"herb",weight:0.35,value:55   },
  wyvern_sinew_filament:{ id:"wyvern_sinew_filament",label:"Жилье виверны",tier:4,category:"misc",weight:0.25,value:120 },
  predator_resin_mass:{ id:"predator_resin_mass",label:"Смоляная пробка хищника",tier:4,category:"herb",weight:0.3,value:140 },
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
  copper_knife:     { id:"copper_knife",    label:"Медный нож",          tier:1, skill:"knife", damage:10,  weight:0.3, value:8,     twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/copper_knife.webp" },
  bronze_knife:     { id:"bronze_knife",    label:"Бронзовый нож",       tier:2, skill:"knife", damage:15,  weight:0.3, value:20,    twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/bronze_knife.webp" },
  iron_knife:       { id:"iron_knife",      label:"Железный нож",        tier:3, skill:"knife", damage:20,  weight:0.4, value:50,    twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/iron_knife.webp" },
  steel_knife:      { id:"steel_knife",     label:"Стальной нож",        tier:4, skill:"knife", damage:25,  weight:0.4, value:130,   twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  hardened_knife:   { id:"hardened_knife",  label:"Закалённый кинжал",   tier:5, skill:"knife", damage:35,  weight:0.4, value:350,   twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  mithril_knife:    { id:"mithril_knife",   label:"Митрильный нож",      tier:6, skill:"knife", damage:40,  weight:0.2, value:1500,  twoHanded:false, energyCost:2, range:1, gridW:1, gridH:2 },
  darkiron_knife:   { id:"darkiron_knife",  label:"Кинжал тёмного железа",tier:7,skill:"knife", damage:55, weight:0.3, value:4200,  twoHanded:false, energyCost:3, range:1, gridW:1, gridH:2 },
  void_dagger:      { id:"void_dagger",     label:"Кинжал Пустоты",      tier:8, skill:"knife", damage:70, weight:0.2, value:8000,  twoHanded:false, energyCost:2, range:1, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_knife: { id:"orichalcum_knife",label:"Орихалковый кинжал",  tier:9, skill:"knife", damage:100, weight:0.2, value:35000, twoHanded:false, energyCost:2, range:1, gridW:1, gridH:2, damageType:"magical",
                      affixes:{ ignoreArmor:0.4, bleedingBonus:1, criticalDamageMult:1.5 } },
  godsplitter_dagger:{id:"godsplitter_dagger",label:"Кинжал Богоруба",   tier:10,skill:"knife", damage:150, weight:0.2, value:90000, twoHanded:false, energyCost:2, range:1, gridW:1, gridH:2, damageType:"magical",
                      affixes:{ ignoreArmor:0.6, executeBelowHp:0.25, criticalDamageMult:2.0, bleedingBonus:2 } },

  // ══ МЕЧИ (1H) ══════════════════════════════════════════════
  copper_sword:     { id:"copper_sword",    label:"Медный меч",          tier:1, skill:"sword", damage:10,  weight:1.5, value:15,    twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/copper_sword.webp" },
  bronze_sword:     { id:"bronze_sword",    label:"Бронзовый меч",       tier:2, skill:"sword", damage:30,  weight:1.5, value:40,    twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/bronze_sword.webp" },
  iron_sword:       { id:"iron_sword",      label:"Железный меч",        tier:3, skill:"sword", damage:40,  weight:1.8, value:100,   twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/iron_sword.webp" },
  steel_sword:      { id:"steel_sword",     label:"Стальной меч",        tier:4, skill:"sword", damage:55, weight:1.8, value:280,   twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  tempered_sword:   { id:"tempered_sword",  label:"Закалённый меч",      tier:5, skill:"sword", damage:70, weight:1.6, value:700,   twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  mithril_sword:    { id:"mithril_sword",   label:"Митрильный меч",      tier:6, skill:"sword", damage:90, weight:1.0, value:2000,  twoHanded:false, energyCost:3, range:1, gridW:1, gridH:3 },
  dark_blade:       { id:"dark_blade",      label:"Тёмный клинок",       tier:7, skill:"sword", damage:110, weight:2.0, value:5000,  twoHanded:false, energyCost:4, range:1, gridW:1, gridH:3 },
  void_blade:       { id:"void_blade",      label:"Клинок Пустоты",      tier:8, skill:"sword", damage:140, weight:1.2, value:12000, twoHanded:false, energyCost:3, range:1, gridW:1, gridH:3, damageType:"magical" },
  orichalcum_blade: { id:"orichalcum_blade",label:"Клинок Орихалка",     tier:9, skill:"sword", damage:180, weight:1.0, value:50000, twoHanded:false, energyCost:3, range:1, gridW:1, gridH:3, damageType:"magical",
                      affixes:{ ignoreArmor:0.3, criticalDamageMult:1.5, lifeSteal:0.10 } },
  world_cutter:     { id:"world_cutter",    label:"Мирорассекатель",     tier:10,skill:"sword", damage:250, weight:0.8, value:120000,twoHanded:false, energyCost:3, range:1, gridW:1, gridH:3, damageType:"magical",
                      affixes:{ ignoreArmor:0.5, criticalDamageMult:2.0, lifeSteal:0.15, executeBelowHp:0.20 } },

  // ══ ДВУРУЧНЫЕ МЕЧИ ════════════════════════════════════════
  bronze_greatsword:    { id:"bronze_greatsword",   label:"Бронзовый двуруч",    tier:2,  skill:"sword", damage:45,  weight:3.5, value:110,    twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/bronze_greatsword.webp" },
  iron_greatsword:      { id:"iron_greatsword",    label:"Железный двуруч",      tier:3,  skill:"sword", damage:60, weight:3.5, value:150,    twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/iron_greatsword.webp" },
  steel_greatsword:     { id:"steel_greatsword",   label:"Стальной двуруч",      tier:4,  skill:"sword", damage:80, weight:3.5, value:400,    twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4 },
  tempered_greatsword:  { id:"tempered_greatsword",label:"Закалённый двуруч",    tier:5,  skill:"sword", damage:100, weight:3.4, value:1100,   twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4 },
  mithril_greatsword:   { id:"mithril_greatsword", label:"Митрильный двуруч",    tier:6,  skill:"sword", damage:130, weight:2.5, value:3200,   twoHanded:true, energyCost:5, range:1, gridW:1, gridH:4 },
  darkiron_greatsword:  { id:"darkiron_greatsword",label:"Двуруч тёмного железа",tier:7,  skill:"sword", damage:160, weight:3.5, value:8000,   twoHanded:true, energyCost:6, range:1, gridW:1, gridH:4 },
  starmetal_greatsword: { id:"starmetal_greatsword",label:"Звёздный двуруч",     tier:8,  skill:"sword", damage:210, weight:2.5, value:22000,  twoHanded:true, energyCost:5, range:1, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_greatsword:{ id:"orichalcum_greatsword",label:"Двуруч Орихалка",    tier:9,  skill:"sword", damage:260, weight:2.0, value:90000,  twoHanded:true, energyCost:5, range:1, gridW:1, gridH:4, damageType:"magical",
                          affixes:{ ignoreArmor:0.3, criticalDamageMult:1.6, stunChance:0.15 } },
  worldsplitter:        { id:"worldsplitter",      label:"Мирорассекатель Великий",tier:10,skill:"sword",damage:375, weight:1.8, value:240000, twoHanded:true, energyCost:5, range:1, gridW:1, gridH:4, damageType:"magical",
                          affixes:{ ignoreArmor:0.5, criticalDamageMult:2.5, executeBelowHp:0.25, stunChance:0.30 } },

  // ══ ТОПОРЫ (1H + 2H) ══════════════════════════════════════
  copper_axe:        { id:"copper_axe",       label:"Медный топор",          tier:1,  skill:"axe", damage:20,  weight:1.5, value:12,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/copper_axe.webp" },
  bronze_axe:        { id:"bronze_axe",       label:"Бронзовый топор",       tier:2,  skill:"axe", damage:30,  weight:1.8, value:35,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/bronze_axe.webp" },
  iron_axe:          { id:"iron_axe",         label:"Железный топор",        tier:3,  skill:"axe", damage:45,  weight:2.0, value:90,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/iron_axe.webp" },
  steel_axe:         { id:"steel_axe",        label:"Стальной топор",        tier:4,  skill:"axe", damage:60, weight:2.0, value:250,   twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  hardened_axe:      { id:"hardened_axe",     label:"Закалённый топор",      tier:5,  skill:"axe", damage:70, weight:2.0, value:600,   twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  mithril_axe:       { id:"mithril_axe",      label:"Митрильный топор",      tier:6,  skill:"axe", damage:90, weight:1.5, value:1800,  twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2 },
  dark_axe:          { id:"dark_axe",         label:"Тёмный топор",          tier:7,  skill:"axe", damage:120, weight:3.5, value:6000,  twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  starmetal_axe:     { id:"starmetal_axe",    label:"Звёздный топор",        tier:8,  skill:"axe", damage:150, weight:1.8, value:12500, twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_axe:    { id:"orichalcum_axe",   label:"Орихалковый топор",     tier:9,  skill:"axe", damage:200, weight:1.5, value:55000, twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical",
                       affixes:{ ignoreArmor:0.25, bleedingBonus:1, criticalDamageMult:1.4 } },
  adamantium_axe:    { id:"adamantium_axe",   label:"Адамантиевый топор",    tier:10, skill:"axe", damage:275, weight:1.4, value:130000,twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical",
                       affixes:{ ignoreArmor:0.45, bleedingBonus:2, criticalDamageMult:2.0, executeBelowHp:0.20 } },
  // 2H секиры
  war_axe:           { id:"war_axe",          label:"Боевой топор (2р.)",    tier:4,  skill:"axe", damage:80, weight:4.0, value:350,   twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  bronze_greataxe:   { id:"bronze_greataxe",  label:"Бронзовая секира",      tier:2,  skill:"axe", damage:45,  weight:3.5, value:100,   twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/bronze_greataxe.webp" },
  iron_greataxe:     { id:"iron_greataxe",    label:"Железная секира",       tier:3,  skill:"axe", damage:60, weight:4.0, value:240,   twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/iron_greataxe.webp" },
  tempered_greataxe: { id:"tempered_greataxe",label:"Закалённая секира",     tier:5,  skill:"axe", damage:100, weight:4.0, value:850,   twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  mithril_greataxe:  { id:"mithril_greataxe", label:"Митрильная секира",     tier:6,  skill:"axe", damage:130, weight:3.0, value:2800,  twoHanded:true,  energyCost:6, range:1, gridW:1, gridH:3 },
  darkiron_greataxe: { id:"darkiron_greataxe",label:"Секира тёмного железа", tier:7,  skill:"axe", damage:170, weight:4.0, value:8500,  twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  starmetal_greataxe:{ id:"starmetal_greataxe",label:"Звёздная секира",      tier:8,  skill:"axe", damage:210, weight:3.5, value:22000, twoHanded:true,  energyCost:6, range:1, gridW:1, gridH:3, damageType:"magical" },
  orichalcum_greataxe:{ id:"orichalcum_greataxe",label:"Секира Орихалка",     tier:9,  skill:"axe", damage:275, weight:3.0, value:95000, twoHanded:true,  energyCost:6, range:1, gridW:1, gridH:3, damageType:"magical",
                        affixes:{ ignoreArmor:0.3, bleedingBonus:2, criticalDamageMult:1.6 } },
  cataclysm_axe:     { id:"cataclysm_axe",    label:"Секира Катаклизма",     tier:10, skill:"axe", damage:375, weight:2.6, value:240000,twoHanded:true,  energyCost:6, range:1, gridW:1, gridH:3, damageType:"magical",
                       affixes:{ ignoreArmor:0.5, bleedingBonus:3, criticalDamageMult:2.5, executeBelowHp:0.25 } },

  // ══ КОПЬЯ ═════════════════════════════════════════════════
  // Range=2: копьё бьёт через клетку. Алебарда (T4) — range=3.
  copper_spear:        { id:"copper_spear",       label:"Медное копьё",          tier:1,  skill:"spear", damage:20,  weight:2.0, value:10,    twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/copper_spear.webp" },
  bronze_spear:        { id:"bronze_spear",       label:"Бронзовое копьё",       tier:2,  skill:"spear", damage:30,  weight:2.2, value:30,    twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/bronze_spear.webp" },
  iron_spear:          { id:"iron_spear",         label:"Железное копьё",        tier:3,  skill:"spear", damage:40,  weight:2.5, value:80,    twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/iron_spear.webp" },
  steel_spear:         { id:"steel_spear",        label:"Стальное копьё",        tier:4,  skill:"spear", damage:55, weight:2.5, value:220,   twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4 },
  halberd:             { id:"halberd",            label:"Алебарда",              tier:4,  skill:"spear", damage:70, weight:4.0, value:300,   twoHanded:true, energyCost:5, range:3, gridW:1, gridH:4 },
  hardened_spear:      { id:"hardened_spear",     label:"Закалённое копьё",      tier:5,  skill:"spear", damage:70, weight:2.4, value:550,   twoHanded:true, energyCost:3, range:2, gridW:1, gridH:4 },
  mithril_spear:       { id:"mithril_spear",      label:"Митрильное копьё",      tier:6,  skill:"spear", damage:100, weight:1.5, value:2500,  twoHanded:true, energyCost:2, range:2, gridW:1, gridH:4 },
  darkiron_pike:       { id:"darkiron_pike",      label:"Пика тёмного железа",   tier:7,  skill:"spear", damage:125, weight:3.0, value:6500,  twoHanded:true, energyCost:3, range:3, gridW:1, gridH:4 },
  starmetal_spear:     { id:"starmetal_spear",    label:"Звёздное копьё",        tier:8,  skill:"spear", damage:160, weight:1.5, value:15000, twoHanded:true, energyCost:2, range:2, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_spear:    { id:"orichalcum_spear",   label:"Копьё Орихалка",        tier:9,  skill:"spear", damage:210, weight:1.4, value:65000, twoHanded:true, energyCost:2, range:3, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.35, criticalDamageMult:1.6, disarmChance:0.20 } },
  godpiercer:          { id:"godpiercer",         label:"Богопронзитель",        tier:10, skill:"spear", damage:300, weight:1.2, value:160000,twoHanded:true, energyCost:2, range:3, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.6, criticalDamageMult:2.2, executeBelowHp:0.20, disarmChance:0.30 } },

  // ══ БУЛАВЫ И МОЛОТЫ ═══════════════════════════════════════
  copper_mace:         { id:"copper_mace",        label:"Медная булава",         tier:1,  skill:"mace",  damage:20,  weight:1.5, value:10,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/copper_mace.webp" },
  bronze_mace:         { id:"bronze_mace",        label:"Бронзовая булава",      tier:2,  skill:"mace",  damage:30,  weight:1.7, value:32,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/bronze_mace.webp" },
  iron_mace:           { id:"iron_mace",          label:"Железная булава",       tier:3,  skill:"mace",  damage:45,  weight:2.0, value:85,    twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/iron_mace.webp" },
  steel_mace:          { id:"steel_mace",         label:"Стальная булава",       tier:4,  skill:"mace",  damage:65, weight:2.2, value:240,   twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  hardened_mace:       { id:"hardened_mace",      label:"Закалённая булава",     tier:5,  skill:"mace",  damage:80, weight:2.0, value:600,   twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  mithril_mace:        { id:"mithril_mace",       label:"Митрильная булава",     tier:6,  skill:"mace",  damage:105, weight:1.3, value:2000,  twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2 },
  darkiron_mace:       { id:"darkiron_mace",      label:"Молот тёмного железа",  tier:7,  skill:"mace",  damage:130, weight:2.5, value:5500,  twoHanded:false, energyCost:5, range:1, gridW:1, gridH:2 },
  starmetal_mace:      { id:"starmetal_mace",     label:"Звёздная булава",       tier:8,  skill:"mace",  damage:170, weight:1.5, value:13000, twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_mace:     { id:"orichalcum_mace",    label:"Молот Орихалка",        tier:9,  skill:"mace",  damage:220, weight:1.4, value:55000, twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical",
                         affixes:{ ignoreArmor:0.3, stunChance:0.20, criticalDamageMult:1.5 } },
  godcrusher_mace:     { id:"godcrusher_mace",    label:"Богоразитель",          tier:10, skill:"mace",  damage:300, weight:1.2, value:130000,twoHanded:false, energyCost:4, range:1, gridW:1, gridH:2, damageType:"magical",
                         affixes:{ ignoreArmor:0.5, stunChance:0.35, criticalDamageMult:2.0, executeBelowHp:0.15 } },
  // 2H молоты
  war_hammer:          { id:"war_hammer",         label:"Боевой молот",          tier:4,  skill:"mace",  damage:85, weight:4.5, value:320,   twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3 },
  bronze_warhammer:    { id:"bronze_warhammer",   label:"Бронзовый молот",       tier:2,  skill:"mace",  damage:45,  weight:4.0, value:90,    twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/bronze_warhammer.webp" },
  iron_warhammer:      { id:"iron_warhammer",     label:"Железный молот",        tier:3,  skill:"mace",  damage:65, weight:4.5, value:200,   twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/iron_warhammer.webp" },
  tempered_warhammer:  { id:"tempered_warhammer", label:"Закалённый молот",      tier:5,  skill:"mace",  damage:110, weight:4.5, value:900,   twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3 },
  mithril_warhammer:   { id:"mithril_warhammer",  label:"Митрильный молот",      tier:6,  skill:"mace",  damage:140, weight:3.0, value:3000,  twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3 },
  darkiron_warhammer:  { id:"darkiron_warhammer", label:"Молот тёмного железа",  tier:7,  skill:"mace",  damage:180, weight:4.0, value:9000,  twoHanded:true,  energyCost:8, range:1, gridW:1, gridH:3 },
  starmetal_warhammer: { id:"starmetal_warhammer",label:"Звёздный молот",        tier:8,  skill:"mace",  damage:230, weight:3.0, value:24000, twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3, damageType:"magical" },
  orichalcum_warhammer:{ id:"orichalcum_warhammer",label:"Молот Орихалка",        tier:9,  skill:"mace",  damage:300, weight:2.5, value:100000,twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3, damageType:"magical",
                         affixes:{ ignoreArmor:0.35, stunChance:0.25, criticalDamageMult:1.7 } },
  cataclysm_hammer:    { id:"cataclysm_hammer",   label:"Молот Катаклизма",      tier:10, skill:"mace",  damage:425, weight:2.4, value:260000,twoHanded:true,  energyCost:7, range:1, gridW:1, gridH:3, damageType:"magical",
                         affixes:{ ignoreArmor:0.55, stunChance:0.40, criticalDamageMult:2.5, executeBelowHp:0.25 } },

  // ══ ЦЕПЫ / КИСТЕНИ ════════════════════════════════════════
  bronze_flail:        { id:"bronze_flail",       label:"Бронзовый кистень",     tier:2,  skill:"flail", damage:30,  weight:1.6, value:50,    twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/bronze_flail.webp" },
  iron_flail:          { id:"iron_flail",         label:"Железный кистень",      tier:3,  skill:"flail", damage:45,  weight:1.8, value:120,   twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/iron_flail.webp" },
  steel_flail:         { id:"steel_flail",        label:"Стальной кистень",      tier:4,  skill:"flail", damage:60, weight:2.0, value:260,   twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2 },
  hardened_flail:      { id:"hardened_flail",     label:"Закалённый кистень",    tier:5,  skill:"flail", damage:75, weight:2.0, value:650,   twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2 },
  mithril_flail:       { id:"mithril_flail",      label:"Митрильный кистень",    tier:6,  skill:"flail", damage:100, weight:1.4, value:2200,  twoHanded:false, energyCost:4, range:2, gridW:1, gridH:2 },
  darkiron_flail:      { id:"darkiron_flail",     label:"Цеп тёмного железа",    tier:7,  skill:"flail", damage:125, weight:2.5, value:6000,  twoHanded:false, energyCost:5, range:2, gridW:1, gridH:2 },
  starmetal_flail:     { id:"starmetal_flail",    label:"Звёздный кистень",      tier:8,  skill:"flail", damage:160, weight:1.6, value:14000, twoHanded:false, energyCost:4, range:2, gridW:1, gridH:2, damageType:"magical" },
  orichalcum_flail:    { id:"orichalcum_flail",   label:"Цеп Орихалка",          tier:9,  skill:"flail", damage:210, weight:1.4, value:60000, twoHanded:false, energyCost:4, range:2, gridW:1, gridH:2, damageType:"magical",
                         affixes:{ ignoreArmor:0.25, stunChance:0.15, disarmChance:0.20, criticalDamageMult:1.5 } },
  bonebreaker_flail:   { id:"bonebreaker_flail",  label:"Костолом",              tier:10, skill:"flail", damage:300, weight:1.2, value:140000,twoHanded:false, energyCost:4, range:2, gridW:1, gridH:2, damageType:"magical",
                         affixes:{ ignoreArmor:0.45, stunChance:0.30, disarmChance:0.30, criticalDamageMult:2.0 } },

  // ══ ЛУКИ ══════════════════════════════════════════════════
  short_bow:           { id:"short_bow",          label:"Короткий лук",          tier:1,  skill:"bow",   damage:20,  weight:1.0, value:18,    twoHanded:true,  energyCost:3, range:6, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/short_bow.webp" },
  long_bow:            { id:"long_bow",           label:"Длинный лук",           tier:2,  skill:"bow",   damage:30,  weight:1.5, value:50,    twoHanded:true,  energyCost:3, range:8, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/long_bow.webp" },
  hunters_bow:         { id:"hunters_bow",        label:"Охотничий лук",         tier:3,  skill:"bow",   damage:40,  weight:1.4, value:130,   twoHanded:true,  energyCost:3, range:8, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/hunters_bow.webp" },
  composite_bow:       { id:"composite_bow",      label:"Составной лук",         tier:4,  skill:"bow",   damage:50, weight:1.2, value:280,   twoHanded:true,  energyCost:3, range:9, gridW:1, gridH:4 },
  recurve_bow:         { id:"recurve_bow",        label:"Рекурсивный лук",       tier:5,  skill:"bow",   damage:65, weight:1.2, value:700,   twoHanded:true,  energyCost:3, range:9, gridW:1, gridH:4 },
  mithril_bow:         { id:"mithril_bow",        label:"Митрильный лук",        tier:6,  skill:"bow",   damage:80, weight:0.8, value:2200,  twoHanded:true,  energyCost:2, range:10, gridW:1, gridH:4 },
  darkiron_bow:        { id:"darkiron_bow",       label:"Лук тёмного железа",    tier:7,  skill:"bow",   damage:105, weight:1.5, value:5500,  twoHanded:true,  energyCost:3, range:10, gridW:1, gridH:4 },
  starmetal_bow:       { id:"starmetal_bow",      label:"Звёздный лук",          tier:8,  skill:"bow",   damage:135, weight:1.0, value:13500, twoHanded:true,  energyCost:2, range:11, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_bow:      { id:"orichalcum_bow",     label:"Лук Орихалка",          tier:9,  skill:"bow",   damage:180, weight:0.8, value:55000, twoHanded:true,  energyCost:2, range:12, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.25, criticalDamageMult:1.6, bleedingBonus:1 } },
  windseeker_bow:      { id:"windseeker_bow",     label:"Лук Ветроискателя",     tier:10, skill:"bow",   damage:250, weight:0.7, value:130000,twoHanded:true,  energyCost:2, range:14, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.45, criticalDamageMult:2.2, executeBelowHp:0.20, bleedingBonus:1 } },

  // ══ АРБАЛЕТЫ ══════════════════════════════════════════════
  hand_crossbow:       { id:"hand_crossbow",      label:"Ручной арбалет",        tier:1,  skill:"crossbow", damage:25,  weight:2.0, value:25,    twoHanded:true,  energyCost:2, range:6, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/hand_crossbow.webp" },
  lt_crossbow:         { id:"lt_crossbow",        label:"Лёгкий арбалет",        tier:2,  skill:"crossbow", damage:35,  weight:2.5, value:60,    twoHanded:true,  energyCost:2, range:8, gridW:1, gridH:2, img:"systems/iron-hills-system/icons/items/weapons/lt_crossbow.webp" },
  iron_crossbow:       { id:"iron_crossbow",      label:"Железный арбалет",      tier:3,  skill:"crossbow", damage:50, weight:3.0, value:150,   twoHanded:true,  energyCost:2, range:9, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/iron_crossbow.webp" },
  hv_crossbow:         { id:"hv_crossbow",        label:"Тяжёлый арбалет",       tier:4,  skill:"crossbow", damage:70, weight:4.0, value:300,   twoHanded:true,  energyCost:2, range:10,gridW:1, gridH:3 },
  arbalest:            { id:"arbalest",           label:"Арбалест",              tier:5,  skill:"crossbow", damage:90, weight:4.0, value:850,   twoHanded:true,  energyCost:2, range:11,gridW:1, gridH:3 },
  mithril_crossbow:    { id:"mithril_crossbow",   label:"Митрильный арбалет",    tier:6,  skill:"crossbow", damage:115, weight:2.5, value:2700,  twoHanded:true,  energyCost:2, range:12,gridW:1, gridH:3 },
  darkiron_crossbow:   { id:"darkiron_crossbow",  label:"Арбалет тёмного железа",tier:7,  skill:"crossbow", damage:145, weight:3.5, value:7500,  twoHanded:true,  energyCost:2, range:13,gridW:1, gridH:3 },
  starmetal_crossbow:  { id:"starmetal_crossbow", label:"Звёздный арбалет",      tier:8,  skill:"crossbow", damage:190, weight:2.5, value:18000, twoHanded:true,  energyCost:2, range:14,gridW:1, gridH:3, damageType:"magical" },
  orichalcum_crossbow: { id:"orichalcum_crossbow",label:"Арбалет Орихалка",      tier:9,  skill:"crossbow", damage:250, weight:2.0, value:75000, twoHanded:true,  energyCost:2, range:15,gridW:1, gridH:3, damageType:"magical",
                         affixes:{ ignoreArmor:0.4, criticalDamageMult:1.8 } },
  voidseeker_crossbow: { id:"voidseeker_crossbow",label:"Арбалет Ищущего Пустоту",tier:10,skill:"crossbow", damage:350, weight:1.8, value:170000,twoHanded:true,  energyCost:2, range:18,gridW:1, gridH:3, damageType:"magical",
                         affixes:{ ignoreArmor:0.6, criticalDamageMult:2.5, executeBelowHp:0.25 } },

  // ══ МЕТАТЕЛЬНОЕ ═══════════════════════════════════════════
  throwing_stones:     { id:"throwing_stones",    label:"Метательные камни",     tier:1,  skill:"throwing", damage:10,  weight:0.5, value:1,     twoHanded:false, energyCost:2, range:3, gridW:1, gridH:1, img:"systems/iron-hills-system/icons/items/weapons/throwing_stones.webp" },
  throwing_knives:     { id:"throwing_knives",    label:"Метательные ножи",      tier:2,  skill:"throwing", damage:20,  weight:0.3, value:25,    twoHanded:false, energyCost:2, range:4, gridW:1, gridH:1, img:"systems/iron-hills-system/icons/items/weapons/throwing_knives.webp" },
  javelin:             { id:"javelin",            label:"Дротик",                tier:2,  skill:"throwing", damage:30,  weight:0.8, value:15,    twoHanded:false, energyCost:2, range:5, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/javelin.webp" },
  iron_javelin:        { id:"iron_javelin",       label:"Железный дротик",       tier:3,  skill:"throwing", damage:40,  weight:0.8, value:50,    twoHanded:false, energyCost:2, range:5, gridW:1, gridH:3, img:"systems/iron-hills-system/icons/items/weapons/iron_javelin.webp" },
  steel_javelin:       { id:"steel_javelin",      label:"Стальной дротик",       tier:4,  skill:"throwing", damage:55, weight:0.8, value:120,   twoHanded:false, energyCost:2, range:5, gridW:1, gridH:3 },
  steel_chakram:       { id:"steel_chakram",      label:"Стальной чакрам",       tier:5,  skill:"throwing", damage:65, weight:0.4, value:380,   twoHanded:false, energyCost:2, range:5, gridW:1, gridH:1 },
  mithril_chakram:     { id:"mithril_chakram",    label:"Митрильный чакрам",     tier:6,  skill:"throwing", damage:85, weight:0.3, value:1400,  twoHanded:false, energyCost:2, range:6, gridW:1, gridH:1 },
  darkiron_chakram:    { id:"darkiron_chakram",   label:"Чакрам тёмного железа", tier:7,  skill:"throwing", damage:110, weight:0.5, value:4200,  twoHanded:false, energyCost:2, range:6, gridW:1, gridH:1 },
  starmetal_chakram:   { id:"starmetal_chakram",  label:"Звёздный чакрам",       tier:8,  skill:"throwing", damage:140, weight:0.3, value:11000, twoHanded:false, energyCost:2, range:7, gridW:1, gridH:1, damageType:"magical" },
  orichalcum_chakram:  { id:"orichalcum_chakram", label:"Чакрам Орихалка",       tier:9,  skill:"throwing", damage:190, weight:0.3, value:48000, twoHanded:false, energyCost:2, range:8, gridW:1, gridH:1, damageType:"magical",
                         affixes:{ ignoreArmor:0.3, criticalDamageMult:1.5, bleedingBonus:1 } },
  godhand_chakram:     { id:"godhand_chakram",    label:"Чакрам Длани Богов",    tier:10, skill:"throwing", damage:275, weight:0.2, value:120000,twoHanded:false, energyCost:2, range:9, gridW:1, gridH:1, damageType:"magical",
                         affixes:{ ignoreArmor:0.5, criticalDamageMult:2.0, executeBelowHp:0.20, bleedingBonus:2 } },

  // ══ ПОСОХИ ════════════════════════════════════════════════
  wooden_staff:        { id:"wooden_staff",       label:"Деревянный посох",      tier:1,  skill:"exotic", damage:15,  weight:2.0, value:5,      twoHanded:true,  energyCost:4, range:1, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/wooden_staff.webp" },
  oak_staff:           { id:"oak_staff",          label:"Дубовый посох",         tier:2,  skill:"exotic", damage:25,  weight:2.0, value:25,     twoHanded:true,  energyCost:4, range:1, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/oak_staff.webp" },
  iron_staff:          { id:"iron_staff",         label:"Железный посох",        tier:3,  skill:"exotic", damage:35,  weight:3.0, value:70,     twoHanded:true,  energyCost:4, range:1, gridW:1, gridH:4, img:"systems/iron-hills-system/icons/items/weapons/iron_staff.webp" },
  steel_staff:         { id:"steel_staff",        label:"Стальной посох",        tier:4,  skill:"exotic", damage:50, weight:2.8, value:220,    twoHanded:true,  energyCost:4, range:1, gridW:1, gridH:4 },
  mage_staff:          { id:"mage_staff",         label:"Магический посох",      tier:5,  skill:"exotic", damage:30,  weight:1.5, value:800,    twoHanded:true,  energyCost:3, range:2, gridW:1, gridH:4, damageType:"magical" },
  archmage_staff:      { id:"archmage_staff",     label:"Посох архимага",        tier:6,  skill:"exotic", damage:45,  weight:1.5, value:2400,   twoHanded:true,  energyCost:3, range:3, gridW:1, gridH:4, damageType:"magical" },
  darkiron_staff:      { id:"darkiron_staff",     label:"Посох тёмного железа",  tier:7,  skill:"exotic", damage:70, weight:2.0, value:6000,   twoHanded:true,  energyCost:3, range:3, gridW:1, gridH:4, damageType:"magical" },
  starmetal_staff:     { id:"starmetal_staff",    label:"Звёздный посох",        tier:8,  skill:"exotic", damage:90, weight:1.5, value:14500,  twoHanded:true,  energyCost:3, range:4, gridW:1, gridH:4, damageType:"magical" },
  orichalcum_staff:    { id:"orichalcum_staff",   label:"Посох Орихалка",        tier:9,  skill:"exotic", damage:120, weight:1.2, value:60000,  twoHanded:true,  energyCost:2, range:4, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.4, criticalDamageMult:1.7, lifeSteal:0.10 } },
  worldroot_staff:     { id:"worldroot_staff",    label:"Посох Мирового Корня",  tier:10, skill:"exotic", damage:175, weight:1.0, value:140000, twoHanded:true,  energyCost:2, range:5, gridW:1, gridH:4, damageType:"magical",
                         affixes:{ ignoreArmor:0.6, criticalDamageMult:2.2, lifeSteal:0.20, executeBelowHp:0.20 } },
};


export const ARMORS = {
  // ─────────────────────────────────────────────────────────────
  // БРОНЯ И ЩИТЫ (типы 1–10)
  // resist → в компендиуме попадает в system.protection
  // img (опц.): systems/iron-hills-system/icons/items/armor/{id}.webp
  // affixes (T9–T10): резерв под расширение боя (как у оружия)
  // ─────────────────────────────────────────────────────────────

  // ── Тир 1 — Кожаная ──
  leather_cap: { id:"leather_cap", label:"Кожаная шапка", tier:1, slot:"head", resist:{physical:5, img:"systems/iron-hills-system/icons/items/armor/leather_cap.webp" }, img:"systems/iron-hills-system/icons/items/armor/leather_cap.webp", weight:0.5, value:8 },
  leather_jacket: { id:"leather_jacket", label:"Кожаная куртка", tier:1, slot:"torso", resist:{physical:10, img:"systems/iron-hills-system/icons/items/armor/leather_jacket.webp" }, img:"systems/iron-hills-system/icons/items/armor/leather_jacket.webp", weight:3, value:20 },
  leather_boots: { id:"leather_boots", label:"Кожаные сапоги", tier:1, slot:"legs", resist:{physical:10, img:"systems/iron-hills-system/icons/items/armor/leather_boots.webp" }, img:"systems/iron-hills-system/icons/items/armor/leather_boots.webp", weight:1, value:10 },
  leather_bracer_left: { id:"leather_bracer_left", label:"Кожаный наруч (л)", tier:1, slot:"leftArm", resist:{physical:5, img:"systems/iron-hills-system/icons/items/armor/leather_bracer_left.webp" }, img:"systems/iron-hills-system/icons/items/armor/leather_bracer_left.webp", weight:0.3, value:6 },
  leather_bracer_right: { id:"leather_bracer_right", label:"Кожаный наруч (п)", tier:1, slot:"rightArm", resist:{physical:5, img:"systems/iron-hills-system/icons/items/armor/leather_bracer_right.webp" }, img:"systems/iron-hills-system/icons/items/armor/leather_bracer_right.webp", weight:0.3, value:6 },
  leather_gorget: { id:"leather_gorget", label:"Кожаный горжет", tier:1, slot:"neck", resist:{physical:5, img:"systems/iron-hills-system/icons/items/armor/leather_gorget.webp" }, img:"systems/iron-hills-system/icons/items/armor/leather_gorget.webp", weight:0.2, value:5 },
  wooden_shield: { id:"wooden_shield", label:"Деревянный щит", tier:1, slot:"leftHand", resist:{physical:10, img:"systems/iron-hills-system/icons/items/armor/wooden_shield.webp" }, img:"systems/iron-hills-system/icons/items/armor/wooden_shield.webp", weight:2, value:8 },

  // ── Тир 2 — Кольчуга ──
  chainmail_coif: { id:"chainmail_coif", label:"Кольчужный капюшон", tier:2, slot:"head", resist:{physical:10, img:"systems/iron-hills-system/icons/items/armor/chainmail_coif.webp" }, weight:1, value:40 },
  chainmail: { id:"chainmail", label:"Кольчуга", tier:2, slot:"torso", resist:{physical:20, img:"systems/iron-hills-system/icons/items/armor/chainmail.webp" }, weight:8, value:120 },
  chain_leggings: { id:"chain_leggings", label:"Кольчужные поножи", tier:2, slot:"legs", resist:{physical:15, img:"systems/iron-hills-system/icons/items/armor/chain_leggings.webp" }, weight:4, value:60 },
  chain_sleeves_left: { id:"chain_sleeves_left", label:"Кольчужный рукав (л)", tier:2, slot:"leftArm", resist:{physical:10, img:"systems/iron-hills-system/icons/items/armor/chain_sleeves_left.webp" }, weight:2, value:28 },
  chain_sleeves_right: { id:"chain_sleeves_right", label:"Кольчужный рукав (п)", tier:2, slot:"rightArm", resist:{physical:10, img:"systems/iron-hills-system/icons/items/armor/chain_sleeves_right.webp" }, weight:2, value:28 },
  chain_gorget: { id:"chain_gorget", label:"Кольчужный горжет", tier:2, slot:"neck", resist:{physical:5, img:"systems/iron-hills-system/icons/items/armor/chain_gorget.webp" }, weight:0.8, value:25 },
  iron_shield: { id:"iron_shield", label:"Железный щит", tier:2, slot:"leftHand", resist:{physical:20, img:"systems/iron-hills-system/icons/items/armor/iron_shield.webp" }, weight:4, value:50 },

  // ── Тир 3 — Нагрудник ──
  plate_helm: { id:"plate_helm", label:"Стальной шлем", tier:3, slot:"head", resist:{physical:20, img:"systems/iron-hills-system/icons/items/armor/plate_helm.webp" }, weight:2, value:150 },
  plate_chest: { id:"plate_chest", label:"Нагрудник", tier:3, slot:"torso", resist:{physical:35, img:"systems/iron-hills-system/icons/items/armor/plate_chest.webp" }, weight:12, value:350 },
  plate_legs: { id:"plate_legs", label:"Набедренники", tier:3, slot:"legs", resist:{physical:30, img:"systems/iron-hills-system/icons/items/armor/plate_legs.webp" }, weight:5, value:200 },
  plate_arms_left: { id:"plate_arms_left", label:"Стальной наруч (л)", tier:3, slot:"leftArm", resist:{physical:15, img:"systems/iron-hills-system/icons/items/armor/plate_arms_left.webp" }, weight:3, value:110 },
  plate_arms_right: { id:"plate_arms_right", label:"Стальной наруч (п)", tier:3, slot:"rightArm", resist:{physical:15, img:"systems/iron-hills-system/icons/items/armor/plate_arms_right.webp" }, weight:3, value:110 },
  plate_gorget: { id:"plate_gorget", label:"Стальной горжет", tier:3, slot:"neck", resist:{physical:10, img:"systems/iron-hills-system/icons/items/armor/plate_gorget.webp" }, weight:1.2, value:80 },
  kite_shield: { id:"kite_shield", label:"Рыцарский щит", tier:3, slot:"leftHand", resist:{physical:35, img:"systems/iron-hills-system/icons/items/armor/kite_shield.webp" }, weight:6, value:180 },

  // ── Тир 4 — Легированный ──
  alloy_helm: { id:"alloy_helm", label:"Легированный шлем", tier:4, slot:"head", resist:{physical:25, magical:5}, weight:1.5, value:250 },
  alloy_chest: { id:"alloy_chest", label:"Легированный панцирь", tier:4, slot:"torso", resist:{physical:45, magical:10}, weight:10, value:600 },
  alloy_legs: { id:"alloy_legs", label:"Легированные поножи", tier:4, slot:"legs", resist:{physical:35, magical:10}, weight:6, value:480 },
  alloy_bracer_left: { id:"alloy_bracer_left", label:"Легир. наруч (л)", tier:4, slot:"leftArm", resist:{physical:15, magical:5}, weight:2.5, value:184 },
  alloy_bracer_right: { id:"alloy_bracer_right", label:"Легир. наруч (п)", tier:4, slot:"rightArm", resist:{physical:15, magical:5}, weight:2.5, value:184 },
  alloy_gorget: { id:"alloy_gorget", label:"Легир. горжет", tier:4, slot:"neck", resist:{physical:10, magical:5}, weight:1, value:180 },
  tower_shield: { id:"tower_shield", label:"Башенный щит", tier:4, slot:"leftHand", resist:{physical:45, magical:10}, weight:8, value:420 },

  // ── Тир 5 — Митрильный ──
  mithril_helm: { id:"mithril_helm", label:"Митрильный шлем", tier:5, slot:"head", resist:{physical:30, magical:15}, weight:1, value:700 },
  mithril_chest: { id:"mithril_chest", label:"Митрильный нагрудник", tier:5, slot:"torso", resist:{physical:55, magical:30}, weight:6, value:1800 },
  mithril_legs: { id:"mithril_legs", label:"Митрильные поножи", tier:5, slot:"legs", resist:{physical:45, magical:25}, weight:4, value:900 },
  mithril_bracer_left: { id:"mithril_bracer_left", label:"Митрильный наруч (л)", tier:5, slot:"leftArm", resist:{physical:20, magical:10}, weight:2, value:414 },
  mithril_bracer_right: { id:"mithril_bracer_right", label:"Митрильный наруч (п)", tier:5, slot:"rightArm", resist:{physical:20, magical:10}, weight:2, value:414 },
  mithril_gorget: { id:"mithril_gorget", label:"Митрильный горжет", tier:5, slot:"neck", resist:{physical:15, magical:15}, weight:0.8, value:400 },
  mithril_shield: { id:"mithril_shield", label:"Митрильный щит", tier:5, slot:"leftHand", resist:{physical:55, magical:30}, weight:3, value:600 },

  // ── Тир 6 — Латы ──
  darkiron_helm: { id:"darkiron_helm", label:"Шлем тёмного железа", tier:6, slot:"head", resist:{physical:35, magical:20}, weight:2, value:1200 },
  darkiron_chest: { id:"darkiron_chest", label:"Латы тёмного железа", tier:6, slot:"torso", resist:{physical:70, magical:40}, weight:12, value:3000 },
  darkiron_legs: { id:"darkiron_legs", label:"Поножи тёмного железа", tier:6, slot:"legs", resist:{physical:55, magical:35}, weight:6, value:2200 },
  darkiron_bracer_left: { id:"darkiron_bracer_left", label:"Наруч тёмн. железа (л)", tier:6, slot:"leftArm", resist:{physical:25, magical:15}, weight:3, value:828 },
  darkiron_bracer_right: { id:"darkiron_bracer_right", label:"Наруч тёмн. железа (п)", tier:6, slot:"rightArm", resist:{physical:25, magical:15}, weight:3, value:828 },
  darkiron_gorget: { id:"darkiron_gorget", label:"Горжет тёмн. железа", tier:6, slot:"neck", resist:{physical:20, magical:20}, weight:1.5, value:900 },
  darkiron_shield: { id:"darkiron_shield", label:"Щит тёмного железа", tier:6, slot:"leftHand", resist:{physical:70, magical:40}, weight:10, value:3200 },

  // ── Тир 7 — звезды / Пустота ──
  star_helm: { id:"star_helm", label:"Шлем звёздного металла", tier:7, slot:"head", resist:{physical:45, magical:30}, weight:1.5, value:4000 },
  void_armor: { id:"void_armor", label:"Доспех Пустоты", tier:7, slot:"torso", resist:{physical:85, magical:55}, weight:5, value:8000 },
  void_legs: { id:"void_legs", label:"Поножи звёздного металла", tier:7, slot:"legs", resist:{physical:70, magical:45}, weight:4.5, value:6000 },
  void_bracer_left: { id:"void_bracer_left", label:"Наруч Пустоты (л)", tier:7, slot:"leftArm", resist:{physical:30, magical:20}, weight:2.5, value:2208 },
  void_bracer_right: { id:"void_bracer_right", label:"Наруч Пустоты (п)", tier:7, slot:"rightArm", resist:{physical:30, magical:20}, weight:2.5, value:2208 },
  void_gorget: { id:"void_gorget", label:"Звёздный горжет", tier:7, slot:"neck", resist:{physical:20, magical:25}, weight:1.2, value:2500 },
  starmetal_shield: { id:"starmetal_shield", label:"Щит звёздного металла", tier:7, slot:"leftHand", resist:{physical:85, magical:55}, weight:6, value:9000 },

  // ── Тир 8 — Небесный ──
  celestial_helm: { id:"celestial_helm", label:"Небесный шлем", tier:8, slot:"head", resist:{physical:55, magical:40}, weight:1.5, value:8000 },
  celestial_plate: { id:"celestial_plate", label:"Небесный нагрудник", tier:8, slot:"torso", resist:{physical:105, magical:70}, weight:5, value:20000 },
  celestial_legs: { id:"celestial_legs", label:"Небесные поножи", tier:8, slot:"legs", resist:{physical:85, magical:60}, weight:4.5, value:16000 },
  celestial_bracer_left: { id:"celestial_bracer_left", label:"Небесный наруч (л)", tier:8, slot:"leftArm", resist:{physical:40, magical:30}, weight:2.5, value:5520 },
  celestial_bracer_right: { id:"celestial_bracer_right", label:"Небесный наруч (п)", tier:8, slot:"rightArm", resist:{physical:40, magical:30}, weight:2.5, value:5520 },
  celestial_gorget: { id:"celestial_gorget", label:"Небесный горжет", tier:8, slot:"neck", resist:{physical:25, magical:30}, weight:1.2, value:6000 },
  celestial_shield: { id:"celestial_shield", label:"Небесный щит", tier:8, slot:"leftHand", resist:{physical:105, magical:70}, weight:6, value:22000 },

  // ── Тир 9 — Латы ──
  orichalcum_helm: { id:"orichalcum_helm", label:"Корона Орихалка", tier:9, slot:"head", resist:{physical:75, magical:50}, weight:1, value:45000 },
  orichalcum_armor: { id:"orichalcum_armor", label:"Латы Орихалка", tier:9, slot:"torso", resist:{physical:140, magical:90}, weight:4, value:60000 },
  orichalcum_legs: { id:"orichalcum_legs", label:"Поножи Орихалка", tier:9, slot:"legs", resist:{physical:115, magical:75}, weight:4, value:48000 },
  orichalcum_bracer_left: { id:"orichalcum_bracer_left", label:"Наруч Орихалка (л)", tier:9, slot:"leftArm", resist:{physical:55, magical:35}, weight:2, value:33120 },
  orichalcum_bracer_right: { id:"orichalcum_bracer_right", label:"Наруч Орихалка (п)", tier:9, slot:"rightArm", resist:{physical:55, magical:35}, weight:2, value:33120 },
  orichalcum_gorget: { id:"orichalcum_gorget", label:"Горжет Орихалка", tier:9, slot:"neck", resist:{physical:35, magical:40}, weight:1, value:40000 },
  orichalcum_shield: { id:"orichalcum_shield", label:"Щит Орихалка", tier:9, slot:"leftHand", resist:{physical:140, magical:90}, weight:5, value:70000, affixes:{ ignoreArmor:0.05, criticalDamageMult:1.05 } },

  // ── Тир 10 — Латы ──
  adamantium_helm: { id:"adamantium_helm", label:"Шлем Бездны", tier:10, slot:"head", resist:{physical:95, magical:65}, weight:2, value:120000 },
  adamantium_plate: { id:"adamantium_plate", label:"Латы Бездны", tier:10, slot:"torso", resist:{physical:180, magical:120}, weight:6, value:200000 },
  adamantium_legs: { id:"adamantium_legs", label:"Поножи Бездны", tier:10, slot:"legs", resist:{physical:150, magical:100}, weight:5, value:160000 },
  adamantium_bracer_left: { id:"adamantium_bracer_left", label:"Наруч Бездны (л)", tier:10, slot:"leftArm", resist:{physical:70, magical:50}, weight:2.5, value:92000 },
  adamantium_bracer_right: { id:"adamantium_bracer_right", label:"Наруч Бездны (п)", tier:10, slot:"rightArm", resist:{physical:70, magical:50}, weight:2.5, value:92000 },
  adamantium_gorget: { id:"adamantium_gorget", label:"Горжет Бездны", tier:10, slot:"neck", resist:{physical:45, magical:55}, weight:1.5, value:100000 },
  eternity_aegis: { id:"eternity_aegis", label:"Бастион Вечности", tier:10, slot:"leftHand", resist:{physical:180, magical:120}, weight:8, value:220000, affixes:{ ignoreArmor:0.08, criticalDamageMult:1.1, executeBelowHp:0.05 } },

  // Совместимость: старый id перчаток только правая рука
  leather_gloves: { id:"leather_gloves", label:"Кожаные перчатки", tier:1, slot:"rightArm", resist:{physical:5, img:"systems/iron-hills-system/icons/items/armor/leather_gloves.webp" }, img:"systems/iron-hills-system/icons/items/armor/leather_gloves.webp", weight:0.3, value:6 },
};

// ──────────────────────────────────────────────────────────────
// ЗЕЛЬЯ (по ступеням)
// ──────────────────────────────────────────────────────────────
export const POTIONS = {
  // ── Тир 1 ──
  minor_heal:       { id:"minor_heal",       label:"Малое зелье лечения",    tier:1, effect:"healHP",           power:15,  weight:0.3, value:10 },
  minor_energy:     { id:"minor_energy",     label:"Малое зелье бодрости",   tier:1, effect:"restoreEnergy",    power:20,  weight:0.3, value:8   },
  minor_energy_max: { id:"minor_energy_max", label:"Малый тоник бодрости",   tier:1, effect:"restoreEnergyMax", power:10,  weight:0.3, value:12  },
  antidote_weak:    { id:"antidote_weak",    label:"Слабое противоядие",    tier:1, effect:"curePoison",       power:5,  weight:0.3, value:12 },
  water_flask:      { id:"water_flask",      label:"Фляга чистой воды",     tier:1, effect:"restoreHydration", power:100, weight:0.5, value:2   },

  // ── Тир 2 ──
  heal_potion:      { id:"heal_potion",      label:"Зелье лечения",       tier:2, effect:"healHP",           power:40,  weight:0.3, value:30 },
  energy_potion:    { id:"energy_potion",    label:"Зелье бодрости",       tier:2, effect:"restoreEnergy",    power:50, weight:0.3, value:25 },
  energy_potion_max:{ id:"energy_potion_max",label:"Тоник выносливости",    tier:2, effect:"restoreEnergyMax", power:25,  weight:0.3, value:40 },
  mana_potion:      { id:"mana_potion",      label:"Зелье маны",           tier:2, effect:"restoreMana",      power:40,  weight:0.3, value:30 },
  speed_potion:     { id:"speed_potion",     label:"Зелье скорости",       tier:2, effect:"speedBoost",       power:10,  weight:0.3, value:35 },

  // ── Тир 3 ──
  greater_heal:     { id:"greater_heal",     label:"Большое зелье лечения", tier:3, effect:"healHP",           power:100, weight:0.3, value:80 },
  elixir_vigor:     { id:"elixir_vigor",     label:"Эликсир бодрости",      tier:3, effect:"restoreEnergy",    power:125, weight:0.3, value:70 },
  elixir_endurance: { id:"elixir_endurance", label:"Эликсир выносливости", tier:3, effect:"restoreEnergyMax", power:60, weight:0.3, value:120 },
  antidote:         { id:"antidote",         label:"Противоядие",          tier:3, effect:"curePoison",       power:15,  weight:0.3, value:50 },

  // ── Тир 4 ──
  adept_heal:          { id:"adept_heal",          label:"Зелье адепта (лечение)",     tier:4, effect:"healHP",           power:140, weight:0.3, value:160 },
  adept_energy:        { id:"adept_energy",        label:"Зелье адепта (бодрость)",    tier:4, effect:"restoreEnergy",    power:160, weight:0.3, value:130 },
  adept_endurance:     { id:"adept_endurance",     label:"Тоник адепта (выносливость)",tier:4, effect:"restoreEnergyMax", power:90, weight:0.3, value:220 },
  adept_mana:          { id:"adept_mana",          label:"Зелье адепта (мана)",        tier:4, effect:"restoreMana",      power:55, weight:0.3, value:140 },
  superior_antidote:   { id:"superior_antidote",   label:"Сильное противоядие",       tier:4, effect:"curePoison",       power:20,  weight:0.3, value:110 },

  // ── Тир 5 ──
  saint_draught: { id:"saint_draught", label:"Напиток святого", tier:5, effect:"healHP", power:170, weight:0.3, value:260 },
  grand_elixir:  { id:"grand_elixir",  label:"Великий эликсир", tier:5, effect:"restoreEnergyMax", power:150, weight:0.3, value:500 },
  elixir_life:   { id:"elixir_life",   label:"Эликсир жизни",   tier:5, effect:"healAll", power:250, weight:0.3, value:500 },

  // ── Тир 6 ──
  wyrmsblood_elixir: { id:"wyrmsblood_elixir", label:"Эликсир змеиной крови", tier:6, effect:"healHP",        power:210, weight:0.3, value:520 },
  stormbrew_energy:  { id:"stormbrew_energy",  label:"Штормовое зелье бодрости", tier:6, effect:"restoreEnergy", power:240, weight:0.3, value:420 },
  sixth_circle_mana: { id:"sixth_circle_mana", label:"Зелье шестого круга",   tier:6, effect:"restoreMana",   power:85, weight:0.3, value:480 },

  // ── Тир 7 ──
  astral_philter_heal: { id:"astral_philter_heal", label:"Фильтр звёзд (лечение)", tier:7, effect:"healHP",     power:260, weight:0.25, value:900 },
  lunar_infusion_mana: { id:"lunar_infusion_mana", label:"Лунный настой маны",    tier:7, effect:"restoreMana", power:110, weight:0.25, value:950 },

  // ── Тир 8 ──
  eclipse_draught_energy: { id:"eclipse_draught_energy", label:"Зелье затмения (бодрость)", tier:8, effect:"restoreEnergy", power:310, weight:0.25, value:6200 },
  philosophers:           { id:"philosophers",           label:"Философский эликсир",       tier:8, effect:"healAll",       power:500,weight:0.25, value:5000 },

  // ── Тир 9 ──
  solar_balm_heal: { id:"solar_balm_heal", label:"Солнечный бальзам",       tier:9, effect:"healHP",      power:390, weight:0.2, value:42000 },
  solar_balm_mana: { id:"solar_balm_mana", label:"Солнечный эликсир маны", tier:9, effect:"restoreMana", power:170, weight:0.2, value:38000 },

  // ── Тир 10 ──
  genesis_vitalis: { id:"genesis_vitalis", label:"Флакон генезиса", tier:10, effect:"healAll", power:800, weight:0.2, value:95000 },
};

// ──────────────────────────────────────────────────────────────
// ЕДА (восполняет сытость/жажду)
// bonus (опц.): краткий модификатор после употребления (энергия и т.п.)
// ──────────────────────────────────────────────────────────────
export const FOOD = {
  // ── Тир 1 — пайки и деревня ──
  bread:           { id:"bread",           label:"Хлеб",                 tier:1, satiety:15, hydration:5,  weight:0.5, value:1, img:"systems/iron-hills-system/icons/items/food/bread.webp" },
  dried_meat:      { id:"dried_meat",      label:"Вяленое мясо",         tier:1, satiety:20, hydration:0,  weight:0.5, value:3, img:"systems/iron-hills-system/icons/items/food/dried_meat.webp" },
  fresh_meat:      { id:"fresh_meat",      label:"Свежее мясо",          tier:1, satiety:25, hydration:5,  weight:1,   value:2, img:"systems/iron-hills-system/icons/items/food/fresh_meat.webp" },
  /** Сырая дичь с туши (охота); готовить рецептом «Полевое жаркое». */
  game_meat_raw:   { id:"game_meat_raw",   label:"Сырая дичь",           tier:1, satiety:18, hydration:3,  weight:0.9, value:2   },
  game_meat_rich:  { id:"game_meat_rich",  label:"Плотная дичь",         tier:2, satiety:28, hydration:4,  weight:1.1, value:6   },
  serpent_fillet_raw:{ id:"serpent_fillet_raw",label:"Сырое филе змея",  tier:2, satiety:22, hydration:6,  weight:0.7, value:8   },
  highland_grub_haunch:{ id:"highland_grub_haunch",label:"Окорок горного трутня",tier:3,satiety:36,hydration:5,weight:1.3,value:14 },
  wyvern_stringy_cut:{ id:"wyvern_stringy_cut",label:"Нарезка с виверны",tier:4,satiety:44,hydration:6,weight:1.2,value:35 },
  cheese:          { id:"cheese",          label:"Сыр",                  tier:1, satiety:12, hydration:3,  weight:0.3, value:2, img:"systems/iron-hills-system/icons/items/food/cheese.webp" },
  cooked_stew:     { id:"cooked_stew",       label:"Тушёное мясо",       tier:1, satiety:30, hydration:10, weight:0.8, value:4, img:"systems/iron-hills-system/icons/items/food/cooked_stew.webp" },
  /** Из сырой дичи + травы; рецепт `cook_field_stew`. */
  field_stew:      { id:"field_stew",        label:"Полевое жаркое",     tier:1, satiety:34, hydration:12, weight:0.85, value:5   },
  mushroom_soup:   { id:"mushroom_soup",     label:"Грибной суп",        tier:1, satiety:25, hydration:15, weight:0.8, value:3, img:"systems/iron-hills-system/icons/items/food/mushroom_soup.webp" },
  trail_rations:   { id:"trail_rations",     label:"Походный паёк",      tier:1, satiety:20, hydration:5,  weight:0.5, value:5, img:"systems/iron-hills-system/icons/items/food/trail_rations.webp" },
  boiled_roots:    { id:"boiled_roots",      label:"Отвар корней",       tier:1, satiety:14, hydration:8,  weight:0.4, value:1, img:"systems/iron-hills-system/icons/items/food/boiled_roots.webp" },
  dwarf_brew:      { id:"dwarf_brew",        label:"Гномье пиво",        tier:1, satiety:8,  hydration:20, weight:0.5, value:4,
                     bonus:{ energy:3, note:"Небольшой прилив сил", img:"systems/iron-hills-system/icons/items/food/dwarf_brew.webp" } },
  well_water_skin: { id:"well_water_skin",   label:"Родниковая вода (меха)",tier:1, satiety:5, hydration:38, weight:1.0, value:2, img:"systems/iron-hills-system/icons/items/food/well_water_skin.webp" },
  pickled_veggies_jar:{ id:"pickled_veggies_jar",label:"Банка маринованных овощей",tier:1, satiety:18, hydration:10, weight:0.6, value:3, img:"systems/iron-hills-system/icons/items/food/pickled_veggies_jar.webp" },
  oat_kiss_kissel: { id:"oat_kiss_kissel",   label:"Овсяный поцелуй",    tier:1, satiety:16, hydration:14, weight:0.5, value:2, img:"systems/iron-hills-system/icons/items/food/oat_kiss_kissel.webp" },

  // ── Тир 2 — трактир ──
  fine_meal:         { id:"fine_meal",         label:"Изысканное блюдо",           tier:2, satiety:40, hydration:15, weight:1,   value:15, img:"systems/iron-hills-system/icons/items/food/fine_meal.webp" },
  travelers_hardtack:{ id:"travelers_hardtack",label:"Сухари странника",      tier:2, satiety:28, hydration:4,  weight:0.4, value:10, img:"systems/iron-hills-system/icons/items/food/travelers_hardtack.webp" },
  salted_fish_board: { id:"salted_fish_board", label:"Дощечка солёной рыбы",  tier:2, satiety:32, hydration:6,  weight:0.5, value:12, img:"systems/iron-hills-system/icons/items/food/salted_fish_board.webp" },
  berry_kvass_jug: { id:"berry_kvass_jug",   label:"Кувшин ягодного кваса", tier:2, satiety:22, hydration:28, weight:0.9, value:14, img:"systems/iron-hills-system/icons/items/food/berry_kvass_jug.webp" },
  meadow_honeycomb:{ id:"meadow_honeycomb",  label:"Луговые медовые соты", tier:2, satiety:26, hydration:12, weight:0.4, value:18,
                     bonus:{ energy:2, note:"Лёгкая сладость и бодрость", img:"systems/iron-hills-system/icons/items/food/meadow_honeycomb.webp" } },

  // ── Тир 3 — город ──
  orchard_cider_jug: { id:"orchard_cider_jug", label:"Кувшин яблочного сидра", tier:3, satiety:18, hydration:28, weight:0.9, value:35, img:"systems/iron-hills-system/icons/items/food/orchard_cider_jug.webp" },
  miners_breakfast:  { id:"miners_breakfast",  label:"Завтрак шахтёра",       tier:3, satiety:46, hydration:12, weight:0.9, value:38, img:"systems/iron-hills-system/icons/items/food/miners_breakfast.webp" },
  mint_leaf_tea_pot:{ id:"mint_leaf_tea_pot",label:"Чайник мятного чая",    tier:3, satiety:32, hydration:36, weight:0.8, value:42, img:"systems/iron-hills-system/icons/items/food/mint_leaf_tea_pot.webp" },
  cherry_brandy_snifter:{ id:"cherry_brandy_snifter",label:"Бренди из вишни",tier:3, satiety:28, hydration:18, weight:0.5, value:44,
                     bonus:{ energy:3, note:"Согревает после долгого дня", img:"systems/iron-hills-system/icons/items/food/cherry_brandy_snifter.webp" } },

  // ── Тир 4 — торговые дороги ──
  caravan_roast:     { id:"caravan_roast",     label:"Ужин караванщика",      tier:4, satiety:58, hydration:14, weight:1.1, value:110 },
  smoked_trout_board:{ id:"smoked_trout_board",label:"Копчёная форель",       tier:4, satiety:52, hydration:18, weight:0.8, value:105 },
  spiced_route_wine:{ id:"spiced_route_wine",label:"Приправленное дорожное вино",tier:4, satiety:38, hydration:30, weight:1.0, value:118 },

  // ── Тир 5 — стол помещика ──
  lordly_vegetable_pie:{ id:"lordly_vegetable_pie",label:"Пирог с овощами и ягодами",tier:5, satiety:72, hydration:22, weight:1.0, value:260 },
  amber_mead_horn: { id:"amber_mead_horn",    label:"Янтарный мёд в роге",    tier:5, satiety:52, hydration:30, weight:1.1, value:275,
                     bonus:{ energy:4, note:"Густой медовый напиток помещика" } },

  // ── Тир 6 — дворянское ──
  volcanic_skillet:  { id:"volcanic_skillet",  label:"Жаровня «Вулкан»",       tier:6, satiety:82, hydration:26, weight:1.2, value:620 },
  firebrand_brandy_snifter:{ id:"firebrand_brandy_snifter",label:"Бренди «Огненная метка»",tier:6, satiety:46, hydration:38, weight:0.6, value:645,
                     bonus:{ energy:5, note:"Обжигает горло и разгоняет кровь" } },

  // ── Тир 7 — редкие ингредиенты ──
  moonfruit_tart:    { id:"moonfruit_tart",    label:"Тарт из лунного фрукта", tier:7, satiety:94, hydration:30, weight:0.7, value:1400 },
  glacier_melt_skin:{ id:"glacier_melt_skin", label:"Талая ледниковая вода", tier:7, satiety:38, hydration:55, weight:1.2, value:1480 },

  // ── Тир 8 — шедевры ──
  aurora_glazed_roast:{ id:"aurora_glazed_roast",label:"Жаркое с глазурью Авроры",tier:8, satiety:108, hydration:38, weight:1.5, value:4400 },
  aurora_sparkling_juice:{ id:"aurora_sparkling_juice",label:"Игристый сок Авроры",tier:8, satiety:54, hydration:50, weight:1.0, value:4580 },

  // ── Тир 9 — легендарная кухня ──
  solar_buffet_course:{ id:"solar_buffet_course",label:"Блюдо солнечного буфета", tier:9, satiety:132, hydration:42, weight:1.3, value:28000 },
  solar_champagne_flute:{ id:"solar_champagne_flute",label:"Солнечное шампанское", tier:9, satiety:72, hydration:62, weight:0.9, value:29200,
                     bonus:{ energy:8, note:"Пузырьки как мини‑закаты в бокале" } },

  // ── Тир 10 — миф ──
  genesis_supper:    { id:"genesis_supper",    label:"Ужин генезиса",          tier:10, satiety:190, hydration:55, weight:1.8, value:92000,
                       bonus:{ energy:8, note:"Чувство полной готовности ко всему дню" } },
  celestial_dew_flask:{ id:"celestial_dew_flask",label:"Фляга небесной росы", tier:10, satiety:88, hydration:78, weight:1.0, value:90500,
                       bonus:{ energy:12, note:"Вода с высочайших вершин — утоляет всё" } },
};

// ──────────────────────────────────────────────────────────────
// ИНСТРУМЕНТЫ
// ──────────────────────────────────────────────────────────────
export const TOOLS = {
  // img по умолчанию при сборке компендиума: systems/iron-hills-system/icons/items/tools/{id}.webp

  // Ступень 1
  flint_tools:   { id:"flint_tools",   label:"Кремнёвые инструменты", tier:1, craftType:"crafting",   weight:1,  value:5  },
  iron_hammer:   { id:"iron_hammer",   label:"Железный молот",        tier:1, craftType:"blacksmithing",weight:2, value:10 },
  mortar_pestle: { id:"mortar_pestle", label:"Ступка и пестик",       tier:1, craftType:"alchemy",     weight:1,  value:8  },
  cooking_pot:   { id:"cooking_pot",   label:"Котелок",               tier:1, craftType:"cooking",     weight:2,  value:6  },
  pickaxe_iron:  { id:"pickaxe_iron",  label:"Железная кирка",        tier:1, craftType:"mining",      weight:3,  value:15 },
  hunter_butcher_kit: {
    id:"hunter_butcher_kit",
    label:"Набор разделки туши",
    tier:1,
    craftType:"survival",
    weight:0.95,
    value:22,
    desc:"Крюки, обрезной нож, точильный камень в футляре — нужен для аккуратной разделки добычи.",
  },
  // Ступень 2
  steel_hammer:  { id:"steel_hammer",  label:"Стальной молот",        tier:2, craftType:"blacksmithing",weight:2, value:40 },
  alch_kit:      { id:"alch_kit",      label:"Алхимический набор",    tier:2, craftType:"alchemy",     weight:3,  value:60 },
  master_tools:  { id:"master_tools",  label:"Инструменты мастера",   tier:2, craftType:"crafting",    weight:2,  value:50 },
  pickaxe_steel: { id:"pickaxe_steel", label:"Стальная кирка",        tier:2, craftType:"mining",      weight:3,  value:40 },
  field_butcher_roll: {
    id:"field_butcher_roll",
    label:"Скрутка полевого мясника",
    tier:2,
    craftType:"survival",
    weight:0.65,
    value:52,
    desc:"Сложные ножи и строп в масляной ткани; проще брать в стойло и дорогу.",
  },

  // Ступень 3
  dwarven_hammer:{ id:"dwarven_hammer",label:"Гномий молот",          tier:3, craftType:"blacksmithing",weight:2, value:150},
  grand_alch_kit:{ id:"grand_alch_kit",label:"Большая алхим. лаб.",   tier:3, craftType:"alchemy",     weight:5,  value:200},
  travel_anvil_kit:{ id:"travel_anvil_kit",label:"Дорожная наковальня в ящике",tier:3,craftType:"blacksmithing",weight:22,value:280,
    desc:"Складная наковальня и малый горн в деревянном коробе. Тянет упряжка или два крепких грузчика." },
  fold_sawhorse_pair:{ id:"fold_sawhorse_pair",label:"Пара складных козёл",tier:3,craftType:"crafting",weight:12,value:90,
    desc:"Для распила и сборки заготовок в полевых условиях." },
  bronze_brazier_set:{ id:"bronze_brazier_set",label:"Бронзовый жаровенный набор",tier:3,craftType:"cooking",weight:8,value:280,
    desc:"Жаровня на треноге и котлы для полевых отрядов — база перед сборкой большой кухни на салазках." },

  // Ступень 4 — переносные мастерские (тяжёлые — телега / мул / питомец-носильщик)
  portable_smith_kit:{ id:"portable_smith_kit",label:"Переносная кузница",tier:4,craftType:"blacksmithing",weight:48,value:920,
    desc:"Горн, малая наковальня и салазки. Выставляется за час; перевозится на телеге или двух быках." },
  folding_alchemy_bench:{ id:"folding_alchemy_bench",label:"Складной алхимический стол",tier:4,craftType:"alchemy",weight:18,value:740,
    desc:"Стойки, зажимы и подставки под колбы складываются в один ящик." },
  field_kitchen_cart:{ id:"field_kitchen_cart",label:"Полевая кухня на салазках",tier:4,craftType:"cooking",weight:38,value:660,
    desc:"Плита, жаровня и ящик для продуктов. Нужна лошадь или несколько грузоносцев." },
  deep_drill_brace:{ id:"deep_drill_brace",label:"Шахтёрский бурильный станок",tier:4,craftType:"mining",weight:28,value:520,
    desc:"Ручная дрель на станине для узких штолен." },

  // Ступень 5
  master_artisans_cart:{ id:"master_artisans_cart",label:"Стол ремесленника на колёсах",tier:5,craftType:"crafting",weight:42,value:1550,
    desc:"Ящики с оснасткой для столярки, кожи и мелкой ковки в одном фургончике." },

  // Ступень 6
  wagon_forge:{ id:"wagon_forge",label:"Кузница на колёсах",tier:6,craftType:"blacksmithing",weight:118,value:4800,
    desc:"Полноценный горн и средняя наковальня на двухосяном тележном ходу. Обычно тянет пара мулов или один упряжный зверь." },
  steam_evaporator_kit:{ id:"steam_evaporator_kit",label:"Паровая перегонная установка",tier:6,craftType:"alchemy",weight:58,value:3950,
    desc:"Медные змеевики и котёл; тяжёл, зато чистые фракции." },
  tunnel_jack_system:{ id:"tunnel_jack_system",label:"Комплект туннельных лесов",tier:6,craftType:"mining",weight:52,value:3400,
    desc:"Распорки и лебёдка для укрепления забоя." },

  // Ступень 7
  siege_anvil_cart:{ id:"siege_anvil_cart",label:"Осадная переносная кузница",tier:7,craftType:"blacksmithing",weight:195,value:14500,
    desc:"Массивная наковальня и усиленный горн на четырёх колёсах. Тянет упряж четырёх волов или один крупный гуманоид." },
  alchemical_caravan_lab:{ id:"alchemical_caravan_lab",label:"Караванная алхимлаборатория",tier:7,craftType:"alchemy",weight:98,value:11200,
    desc:"Два стола, витражи с реагентами и фиксация колб — груз на фургон." },

  // Ступень 8–9 — мифические мастерские
  runic_fold_forge:{ id:"runic_fold_forge",label:"Руническая складная горн-тень",tier:8,craftType:"blacksmithing",weight:72,value:32000,
    desc:"Магически облегчённая рама: вес меньше обычного, но всё ещё не для рюкзака одного человека." },
  starforge_manifest:{ id:"starforge_manifest",label:"Проявитель звёздной кузницы",tier:9,craftType:"blacksmithing",weight:88,value:88000,
    desc:"Кристаллы-якоря разворачивают временный горн из сгустка тепла и света." },
  worldroot_workshop_seed:{ id:"worldroot_workshop_seed",label:"Семя мастерской Мирового Корня",tier:10,craftType:"crafting",weight:12,value:180000,
    desc:"Живой набор инструментов, который разворачивает карманную мастерскую вокруг владельца. Дорогая вершина ремесленного каталога." },
};

/** Инструменты каталога (type tool), считающиеся «разделочными» для добычи с трупа. См. `wilderness-service.mjs`. */
export const HARVEST_TOOL_CATALOG_IDS = Object.freeze(new Set(["hunter_butcher_kit", "field_butcher_roll"]));

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

  explorer_girdle: { id:"explorer_girdle", label:"Пояс следопыта",    tier:4, weight:1.1, value:210,
    gridW:2, gridH:1, containerSlots:{cols:5,rows:2}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:2,label:"Кр. 3"},{key:"a3",w:1,h:2,label:"Кр. 4"}], weightFactor:0.95,
    desc:"Укреплённый пояс для долгих экспедиций. Четыре боковых крепления." },
  mithril_belt:  { id:"mithril_belt",  label:"Митрильный пояс",     tier:5, weight:0.5, value:800,
    gridW:2, gridH:1, containerSlots:{cols:6,rows:2}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:2,label:"Кр. 3"},{key:"a3",w:1,h:2,label:"Кр. 4"}], weightFactor:0.9,
    desc:"Лёгкий митрильный пояс. Вещи в нём весят немного меньше." },

  siege_belt:    { id:"siege_belt",    label:"Осадный пояс",        tier:6, weight:1.8, value:2200,
    gridW:2, gridH:1, containerSlots:{cols:6,rows:2}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:3,label:"Кр. 3"},{key:"a3",w:1,h:3,label:"Кр. 4"},
      {key:"a4",w:1,h:2,label:"Кр. 5"}], weightFactor:0.92,
    desc:"Широкий пояс под арсенал осадника и запас расходников." },
  runners_light_harness:{ id:"runners_light_harness",label:"Облегчённая портупея бегуна",tier:7,weight:0.85,value:2450,
    gridW:2, gridH:1, containerSlots:{cols:5,rows:3}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:2,label:"Кр. 3"},{key:"a3",w:1,h:2,label:"Кр. 4"}], weightFactor:0.88,
    desc:"Много секций при минимальной массе пояса." },
  darkiron_chain_belt:{ id:"darkiron_chain_belt",label:"Цепной пояс из тёмного железа",tier:8,weight:2.4,value:6800,
    gridW:2, gridH:1, containerSlots:{cols:7,rows:2}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:2,label:"Кр. 3"},{key:"a3",w:1,h:3,label:"Кр. 4"},
      {key:"a4",w:1,h:3,label:"Кр. 5"},{key:"a5",w:1,h:2,label:"Кр. 6"}], weightFactor:0.85,
    desc:"Тяжёлый и непробиваемый — как склад боеприпасов на торсе." },
  orichalcum_girdle:{ id:"orichalcum_girdle",label:"Пояс Орихалка", tier:9, weight:1.15, value:28500,
    gridW:2, gridH:1, containerSlots:{cols:8,rows:2}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:2,label:"Кр. 3"},{key:"a3",w:1,h:2,label:"Кр. 4"},
      {key:"a4",w:1,h:3,label:"Кр. 5"},{key:"a5",w:1,h:3,label:"Кр. 6"},
      {key:"a6",w:1,h:2,label:"Кр. 7"}], weightFactor:0.82,
    desc:"Легендарная портупея маршала — места почти как у рюкзака." },
  astral_command_girdle:{ id:"astral_command_girdle",label:"Астральная портупея командора", tier:10, weight:0.9, value:120000,
    gridW:2, gridH:1, containerSlots:{cols:9,rows:3}, attachmentSlots:[
      {key:"a0",w:1,h:2,label:"Кр. 1"},{key:"a1",w:1,h:2,label:"Кр. 2"},
      {key:"a2",w:1,h:2,label:"Кр. 3"},{key:"a3",w:1,h:2,label:"Кр. 4"},
      {key:"a4",w:1,h:3,label:"Кр. 5"},{key:"a5",w:1,h:3,label:"Кр. 6"},
      {key:"a6",w:1,h:2,label:"Кр. 7"},{key:"a7",w:1,h:2,label:"Кр. 8"}], weightFactor:0.75,
    desc:"Пояс для поздней игры: быстрый доступ к расходникам, оружию и навесным подсумкам без превращения персонажа в склад." },
};

// ──────────────────────────────────────────────────────────────
// РЮКЗАКИ (backpack) — разные размеры и вес-множители
// ──────────────────────────────────────────────────────────────
export const BACKPACKS = {
  hip_pouch:     { id:"hip_pouch",     label:"Поясная сумка",       tier:1, weight:0.3, value:8,
    gridW:1, gridH:2, containerSlots:{cols:2,rows:2}, weightFactor:1.0,
    desc:"Маленькая сумочка на бедро. 2×2 слота. Быстрый доступ." },
  small_sack:    { id:"small_sack",    label:"Небольшой мешок",     tier:1, weight:0.5, value:5,
    gridW:2, gridH:2, containerSlots:{cols:3,rows:3}, weightFactor:1.0,
    desc:"Простой тканевый мешок. 3×3 слота. Ничего лишнего." },
  leather_satchel:{ id:"leather_satchel",label:"Кожаная сумка",    tier:1, weight:0.8, value:20,
    gridW:2, gridH:2, containerSlots:{cols:4,rows:3}, weightFactor:0.95,
    desc:"Небольшая кожаная сумка через плечо. 4×3 слота." },

  travelers_pack: { id:"travelers_pack", label:"Дорожный ранец",    tier:2, weight:1.2, value:55,
    gridW:2, gridH:3, containerSlots:{cols:5,rows:4}, weightFactor:0.90,
    desc:"Стандартный путнический ранец. 5×4 слота. Вещи весят 90%." },
  soldier_pack:  { id:"soldier_pack",  label:"Солдатский ранец",    tier:2, weight:1.5, value:70,
    gridW:2, gridH:3, containerSlots:{cols:5,rows:5}, weightFactor:0.90,
    desc:"Армейский вещевой мешок. 5×5 слота. Прочный и вместительный." },
  hunters_bag:   { id:"hunters_bag",   label:"Охотничья сума",      tier:2, weight:1.0, value:60,
    gridW:2, gridH:3, containerSlots:{cols:4,rows:5}, weightFactor:0.92,
    desc:"Сума охотника. 4×5 слота. Узкие секции для инструментов." },

  large_backpack: { id:"large_backpack",label:"Большой рюкзак",     tier:3, weight:2.0, value:150,
    gridW:2, gridH:4, containerSlots:{cols:6,rows:6}, weightFactor:0.85,
    desc:"Вместительный рюкзак. 6×6 слота. Вещи весят 85%." },
  frame_pack:    { id:"frame_pack",    label:"Рамный рюкзак",       tier:3, weight:2.5, value:200,
    gridW:2, gridH:4, containerSlots:{cols:6,rows:8}, weightFactor:0.80,
    desc:"Рюкзак с жёсткой рамой. 6×8 слота. Вещи весят 80%. Лучший для дальних походов." },

  alchemist_satchel:{ id:"alchemist_satchel",label:"Сумка алхимика",tier:4, weight:1.5, value:300,
    gridW:2, gridH:3, containerSlots:{cols:4,rows:4}, weightFactor:0.85,
    desc:"Специальная сумка с отдельными отсеками для зелий. 4×4. Зелья не разбиваются." },

  mithril_pack:  { id:"mithril_pack",  label:"Митрильный рюкзак",   tier:5, weight:1.0, value:1200,
    gridW:2, gridH:4, containerSlots:{cols:7,rows:8}, weightFactor:0.70,
    desc:"Лёгкий митрильный рюкзак. 7×8 слота. Вещи весят всего 70%." },

  caravan_master_pack:{ id:"caravan_master_pack",label:"Рюкзак караванного бариши",tier:6,weight:2.2,value:2150,
    gridW:2, gridH:4, containerSlots:{cols:7,rows:7}, weightFactor:0.68,
    desc:"Объёмный рюкзак для торговых партий и провианта на недели." },
  beast_load_frame:{ id:"beast_load_frame",label:"Вьючная рама для зверя",tier:7,weight:8.0,value:4200,
    gridW:2, gridH:4, containerSlots:{cols:8,rows:8}, weightFactor:0.62,
    desc:"Не для человека на спине — навешивается на мула, катальную собаку или боевого ездового зверя." },

  void_satchel:  { id:"void_satchel",  label:"Сумка Пустоты",       tier:8, weight:0.5, value:8000,
    gridW:2, gridH:3, containerSlots:{cols:10,rows:10}, weightFactor:0.50,
    desc:"Артефактная сумка с карманом в Пустоте. 10×10. Вещи весят 50%." },

  planar_satchel:{ id:"planar_satchel",label:"Планарная сумка",    tier:9, weight:3.8, value:54000,
    gridW:2, gridH:4, containerSlots:{cols:9,rows:9}, weightFactor:0.52,
    desc:"Узлы карманов слегка меняются под груз — почти сумка Пустоты, но без разрыва реальности." },
  demiplane_pack:{ id:"demiplane_pack",label:"Рюкзак малой демиплоскости", tier:10, weight:2.8, value:165000,
    gridW:2, gridH:4, containerSlots:{cols:12,rows:10}, weightFactor:0.45,
    desc:"Внутреннее пространство закреплено малой демиплоскостью. Огромная вместимость, но предмет всё ещё занимает слот рюкзака и требует контроля веса." },
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

  spear_frog:    { id:"spear_frog",    label:"Чехол для копья",       tier:2,
    weight:0.35,value:22, gridW:1, gridH:4,
    attachesTo:"belt", addsLabel:"Копьё",
    addsSlots:{cols:1,rows:5}, allowedTypes:["weapon"],
    allowedSkills:["spear"], accessSeconds:2,
    desc:"Кожаный футляр на пояс или спину для посоха-копья." },

  shield_hook:   { id:"shield_hook",   label:"Крюк для щита",         tier:2,
    weight:0.35,value:28, gridW:1, gridH:3,
    attachesTo:"belt", addsLabel:"Щит",
    addsSlots:{cols:2,rows:3}, allowedTypes:["armor"],
    allowedSkills:[], accessSeconds:2,
    desc:"Металлический крюк для переноски щита боком у бедра." },

  wand_loop:     { id:"wand_loop",     label:"Петля для жезла",       tier:3,
    weight:0.15,value:55, gridW:1, gridH:2,
    attachesTo:"belt", addsLabel:"Жезл",
    addsSlots:{cols:1,rows:3}, allowedTypes:["weapon"],
    allowedSkills:["exotic"], accessSeconds:1,
    desc:"Узкая кожаная петля для тонкого жезла или скипетра." },

  grenade_loop:  { id:"grenade_loop",  label:"Кольца под метательное",tier:4,
    weight:0.25,value:95, gridW:1, gridH:2,
    attachesTo:"belt", addsLabel:"Метательное",
    addsSlots:{cols:2,rows:2}, allowedTypes:["weapon","throwable"],
    allowedSkills:["throwing"], accessSeconds:0,
    desc:"Кольца под боеприпасы пращи или масляные флаконы." },

  telescoping_quiver:{ id:"telescoping_quiver",label:"Телескопический колчан",tier:4,
    weight:0.65,value:140, gridW:1, gridH:3,
    attachesTo:"belt", addsLabel:"Колчан Т.",
    addsSlots:{cols:2,rows:4}, allowedTypes:["material","throwable"],
    allowedSkills:["bow"], accessSeconds:0,
    desc:"Раздвижной колчан для стрел разной длины." },

  // ── Крепления на рюкзак ────────────────────────────────────
  side_pouch:    { id:"side_pouch",    label:"Боковой подсумок",      tier:1,
    weight:0.3, value:12,  gridW:1, gridH:2,
    attachesTo:"backpack", addsLabel:"Подсумок",
    addsSlots:{cols:3,rows:2}, allowedTypes:null,
    accessSeconds:2,
    desc:"Боковой подсумок на рюкзак. 6 ячеек, медленный доступ." },
};

// ──────────────────────────────────────────────────────────────
// ЁМКОСТИ ДЛЯ ПИТЬЯ (consumable.type + заряды глотков)
// Пополнение: game.ironHills.refillDrinkVesselsFromWater / у водного POI.
// ──────────────────────────────────────────────────────────────
export const DRINK_VESSELS = {
  leather_waterskin: {
    id: "leather_waterskin",
    label: "Кожаная фляга",
    tier: 1,
    weight: 0.4,
    value: 5,
    vesselMax: 5,
    vesselHydrationPerDrink: 9,
    vesselSatietyPerDrink: 0,
    vesselLiquidLabel: "Вода",
  },
  iron_canteen: {
    id: "iron_canteen",
    label: "Железная фляга",
    tier: 2,
    weight: 0.7,
    value: 18,
    vesselMax: 7,
    vesselHydrationPerDrink: 9,
    vesselSatietyPerDrink: 0,
    vesselLiquidLabel: "Вода",
  },
  ranger_gourd: {
    id: "ranger_gourd",
    label: "Бурдюк следопыта",
    tier: 3,
    weight: 0.5,
    value: 45,
    vesselMax: 8,
    vesselHydrationPerDrink: 11,
    vesselSatietyPerDrink: 1,
    vesselLiquidLabel: "Чистая вода",
  },
};

// ──────────────────────────────────────────────────────────────
// МЕДИЦИНСКИЕ РАСХОДНИКИ (consumable.type)
// Используются общей логикой предметных действий и медициной по зонам тела.
// ──────────────────────────────────────────────────────────────
export const MEDICAL_CONSUMABLES = {
  field_bandage: {
    id: "field_bandage",
    label: "Полевой бинт",
    kind: "medical",
    tier: 1,
    effect: "reduceBleeding",
    power: 1,
    weight: 0.1,
    value: 5,
    gridW: 1,
    gridH: 1,
    img: "icons/commodities/cloth/cloth-roll-white.webp",
    desc: "Простой бинт для остановки малого кровотечения на выбранной части тела.",
  },
  clean_dressing: {
    id: "clean_dressing",
    label: "Чистая повязка",
    kind: "medical",
    tier: 1,
    effect: "reduceBleeding",
    power: 2,
    weight: 0.12,
    value: 9,
    gridW: 1,
    gridH: 1,
    img: "icons/commodities/cloth/cloth-roll-white.webp",
    desc: "Более плотная чистая повязка, быстрее снимает малое кровотечение.",
  },
  tourniquet: {
    id: "tourniquet",
    label: "Жгут",
    kind: "medical",
    tier: 1,
    effect: "tourniquet",
    power: 1,
    weight: 0.2,
    value: 10,
    gridW: 1,
    gridH: 1,
    img: "icons/commodities/leather/leather-belt-brown.webp",
    desc: "Пережимает сильное кровотечение на конечности или части тела. Требует последующей обработки.",
  },
  splint: {
    id: "splint",
    label: "Шина",
    kind: "medical",
    tier: 1,
    effect: "splint",
    power: 1,
    weight: 0.8,
    value: 12,
    gridW: 1,
    gridH: 2,
    img: "icons/commodities/wood/wood-stick-brown.webp",
    desc: "Фиксирует перелом выбранной части тела.",
  },
  hemostatic_pack: {
    id: "hemostatic_pack",
    label: "Кровоостанавливающий пакет",
    kind: "medical",
    tier: 2,
    effect: "stopMinorBleeding",
    power: 99,
    weight: 0.2,
    value: 28,
    gridW: 1,
    gridH: 1,
    img: "icons/commodities/cloth/cloth-roll-white.webp",
    desc: "Одноразовый пакет для быстрой остановки всех малых кровотечений.",
  },
  trauma_kit: {
    id: "trauma_kit",
    label: "Травматологический набор",
    kind: "medical",
    tier: 3,
    effect: "stabilizeBody",
    power: 1,
    weight: 0.8,
    value: 75,
    gridW: 2,
    gridH: 2,
    img: "icons/tools/hand/needle-grey.webp",
    desc: "Компактный набор для стабилизации кровотечений и снятия лишних жгутов.",
  },
  surgical_kit: {
    id: "surgical_kit",
    label: "Хирургический набор",
    kind: "medical",
    tier: 4,
    effect: "surgery",
    power: 18,
    weight: 1.5,
    value: 160,
    gridW: 2,
    gridH: 2,
    img: "icons/tools/hand/needle-grey.webp",
    desc: "Тяжёлая медицинская обработка выбранной части тела: переломы, разрушение, кровотечения и восстановление HP.",
  },
  antiseptic_wash: {
    id: "antiseptic_wash",
    label: "Антисептический раствор",
    kind: "medical",
    tier: 1,
    effect: "cureDisease",
    power: 1,
    weight: 0.25,
    value: 12,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/bottle-corked-blue.webp",
    desc: "Простая промывка для грязных ран и ранней инфекции. Не заменяет хирургию.",
  },
  field_suture_roll: {
    id: "field_suture_roll",
    label: "Полевая шовная скрутка",
    kind: "medical",
    tier: 2,
    effect: "bandage",
    power: 4,
    weight: 0.18,
    value: 32,
    gridW: 1,
    gridH: 1,
    img: "icons/tools/hand/needle-grey.webp",
    desc: "Иглы, нить и чистая ткань для уверенной остановки кровотечения на выбранной зоне.",
  },
  clotting_powder: {
    id: "clotting_powder",
    label: "Свёртывающий порошок",
    kind: "medical",
    tier: 2,
    effect: "stopMinorBleeding",
    power: 99,
    weight: 0.12,
    value: 38,
    gridW: 1,
    gridH: 1,
    img: "icons/commodities/materials/powder-white.webp",
    desc: "Порошок для быстрой глобальной остановки малых кровотечений.",
  },
  bone_pin_splint: {
    id: "bone_pin_splint",
    label: "Шина с костяными фиксаторами",
    kind: "medical",
    tier: 3,
    effect: "splint",
    power: 2,
    weight: 0.65,
    value: 70,
    gridW: 1,
    gridH: 2,
    img: "icons/commodities/bones/bone-simple-white.webp",
    desc: "Усиленная шина для переломов конечностей и живота после тяжёлых ударов.",
  },
  painkiller_draught: {
    id: "painkiller_draught",
    label: "Обезболивающий глоток",
    kind: "medical",
    tier: 3,
    effect: "stimulant",
    power: 2,
    duration: 2,
    weight: 0.2,
    value: 90,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/bottle-round-corked-orange.webp",
    desc: "Короткий стимулятор для продолжения боя после ранений. Даёт состояние ускорения на несколько раундов.",
  },
  battle_stimulant: {
    id: "battle_stimulant",
    label: "Боевой стимулятор",
    kind: "medical",
    tier: 4,
    effect: "stimulant",
    power: 4,
    duration: 3,
    weight: 0.15,
    value: 180,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/vial-corked-red.webp",
    desc: "Дорогой инъектор для рывка в критический момент боя.",
  },
  field_trauma_pack: {
    id: "field_trauma_pack",
    label: "Полевой травмпакет",
    kind: "medical",
    tier: 4,
    effect: "stabilizeBody",
    power: 2,
    weight: 1.1,
    value: 220,
    gridW: 2,
    gridH: 2,
    img: "icons/containers/bags/pack-leather-white-tan.webp",
    desc: "Расширенный набор для стабилизации тела после нескольких ранений.",
  },
  restoration_ampoule: {
    id: "restoration_ampoule",
    label: "Восстановительная ампула",
    kind: "medical",
    tier: 5,
    effect: "healHP",
    power: 90,
    weight: 0.12,
    value: 360,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/vial-corked-green.webp",
    desc: "Лечит выбранную часть тела без полной хирургической обработки.",
  },
  master_surgery_pack: {
    id: "master_surgery_pack",
    label: "Мастерский хирургический комплект",
    kind: "medical",
    tier: 6,
    effect: "surgery",
    power: 34,
    weight: 1.35,
    value: 780,
    gridW: 2,
    gridH: 2,
    img: "icons/tools/scribal/knife-toothed-steel-grey.webp",
    desc: "Компактный комплект мастера-полевика для тяжёлых операций и восстановления зон тела.",
  },
};

export const THROWABLES = {
  throwing_knife_bundle: {
    id: "throwing_knife_bundle",
    label: "Связка метательных ножей",
    tier: 1,
    effectType: "damage",
    damageType: "physical",
    power: 12,
    energyCost: 4,
    targetPart: "torso",
    weight: 0.45,
    value: 18,
    gridW: 1,
    gridH: 1,
    img: "icons/weapons/thrown/dagger-simple.webp",
    desc: "Набор лёгких ножей для быстрого броска по одной цели.",
  },
  clay_shrapnel_pot: {
    id: "clay_shrapnel_pot",
    label: "Глиняный осколочный горшок",
    tier: 1,
    effectType: "damage",
    damageType: "physical",
    power: 10,
    energyCost: 6,
    targetPart: "torso",
    weight: 0.75,
    value: 28,
    gridW: 1,
    gridH: 1,
    img: "icons/commodities/stone/pottery-jug-brown.webp",
    aoe: { type: "shards", shape: "circle", distance: 2, maxTargets: 3, friendlyFireMode: "auto", targetZoneMode: "random" },
    desc: "Глиняная оболочка с кремнем и металлоломом. Бьёт всех в тесной зоне.",
  },
  fire_oil_flask: {
    id: "fire_oil_flask",
    label: "Фляга горючего масла",
    tier: 2,
    effectType: "damage",
    damageType: "fire",
    power: 18,
    energyCost: 7,
    appliesBurning: 2,
    targetPart: "torso",
    weight: 0.55,
    value: 55,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/bottle-bulb-corked-orange.webp",
    aoe: { type: "blast", shape: "circle", distance: 2, maxTargets: null, friendlyFireMode: "auto", targetZoneMode: "random" },
    desc: "Алхимическое масло с фитилём. Огонь не разбирает своих, если цель стоит рядом.",
  },
  venom_glass_vial: {
    id: "venom_glass_vial",
    label: "Стеклянная ядовитая склянка",
    tier: 2,
    effectType: "damage",
    damageType: "poison",
    power: 14,
    energyCost: 5,
    appliesPoison: 3,
    targetPart: "torso",
    weight: 0.25,
    value: 70,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/vial-corked-green.webp",
    desc: "Хрупкая склянка для точечного отравления цели.",
  },
  thunderstone: {
    id: "thunderstone",
    label: "Громовой камень",
    tier: 3,
    effectType: "damage",
    damageType: "lightning",
    power: 24,
    energyCost: 8,
    targetPart: "torso",
    weight: 0.6,
    value: 135,
    gridW: 1,
    gridH: 1,
    img: "icons/commodities/gems/gem-rough-blue.webp",
    aoe: { type: "nova", shape: "circle", distance: 2, maxTargets: 4, friendlyFireMode: "auto", targetZoneMode: "random" },
    desc: "Заряженный камень, выбрасывающий короткую электрическую волну вокруг точки удара.",
  },
  frostburst_flask: {
    id: "frostburst_flask",
    label: "Склянка морозного разрыва",
    tier: 4,
    effectType: "damage",
    damageType: "ice",
    power: 34,
    energyCost: 9,
    targetPart: "torso",
    weight: 0.45,
    value: 260,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/bottle-round-corked-blue.webp",
    aoe: { type: "sweep", shape: "cone", distance: 3, maxTargets: 4, friendlyFireMode: "auto", targetZoneMode: "random" },
    desc: "Холодный разрыв конусом перед точкой попадания.",
  },
  blessed_water_globe: {
    id: "blessed_water_globe",
    label: "Сфера освящённой воды",
    tier: 4,
    effectType: "damage",
    damageType: "holy",
    power: 32,
    energyCost: 7,
    targetPart: "torso",
    weight: 0.35,
    value: 240,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/bottle-round-corked-white.webp",
    desc: "Точечный святой удар по нежити, теням и осквернённым существам.",
  },
  dragonfire_bomb: {
    id: "dragonfire_bomb",
    label: "Драконья огненная бомба",
    tier: 6,
    effectType: "damage",
    damageType: "fire",
    power: 72,
    energyCost: 12,
    appliesBurning: 4,
    targetPart: "torso",
    weight: 0.9,
    value: 1300,
    gridW: 1,
    gridH: 1,
    img: "icons/consumables/potions/bottle-bulb-corked-red.webp",
    aoe: { type: "blast", shape: "circle", distance: 4, maxTargets: null, friendlyFireMode: "auto", targetZoneMode: "random" },
    desc: "Редкая бомба на драконьей крови. Сильный огонь по большой зоне.",
  },
  void_splinter_grenade: {
    id: "void_splinter_grenade",
    label: "Граната осколков Пустоты",
    tier: 8,
    effectType: "damage",
    damageType: "shadow",
    power: 120,
    energyCost: 14,
    targetPart: "torso",
    weight: 0.75,
    value: 7800,
    gridW: 1,
    gridH: 1,
    img: "icons/magic/unholy/projectile-bolts-salvo-purple.webp",
    aoe: { type: "shards", shape: "circle", distance: 5, maxTargets: 6, friendlyFireMode: "auto", targetZoneMode: "random" },
    desc: "Магический контейнер, рассыпающий теневые осколки по нескольким целям.",
  },
  sunburst_phial: {
    id: "sunburst_phial",
    label: "Фиал солнечной вспышки",
    tier: 9,
    effectType: "damage",
    damageType: "holy",
    power: 160,
    energyCost: 15,
    targetPart: "torso",
    weight: 0.4,
    value: 26000,
    gridW: 1,
    gridH: 1,
    img: "icons/magic/light/explosion-star-glow-yellow.webp",
    aoe: { type: "nova", shape: "circle", distance: 5, maxTargets: null, friendlyFireMode: "off", targetZoneMode: "random" },
    desc: "Святая вспышка, рассчитанная на бой рядом с союзниками.",
  },
  genesis_star_bomb: {
    id: "genesis_star_bomb",
    label: "Звёздная бомба Генезиса",
    tier: 10,
    effectType: "damage",
    damageType: "true",
    power: 220,
    energyCost: 18,
    targetPart: "torso",
    weight: 0.6,
    value: 92000,
    gridW: 1,
    gridH: 1,
    img: "icons/magic/light/projectile-star-glow-yellow.webp",
    aoe: { type: "blast", shape: "circle", distance: 6, maxTargets: null, friendlyFireMode: "auto", targetZoneMode: "aimed" },
    desc: "Редкий артефактный заряд. Позволяет выбрать зону поражения перед применением.",
  },
};

export const CONSUMABLES = {
  ...DRINK_VESSELS,
  ...MEDICAL_CONSUMABLES,
};
