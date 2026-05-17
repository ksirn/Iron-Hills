/**
 * Iron Hills — Craft Recipes
 * Рецепты крафта по ступеням.
 * difficulty = порог навыка (1-20 соответствует ступени 1-10).
 */

import { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, DRINK_VESSELS } from "./items-catalog.mjs";

/** Готовый результат-предмет типа material из каталога MATERIALS по id. */
function materialResult(id, qty = 1) {
  const m = MATERIALS[id];
  if (!m) throw new Error(`Unknown material id: ${id}`);
  const q = Math.max(1, Number(qty) || 1);
  const uw = Number(m.weight ?? 1);
  const uv = Number(m.value ?? 0);
  return {
    type: "material",
    name: m.label,
    img: `systems/iron-hills-system/icons/items/materials/${id}.webp`,
    catalogId: id,
    system: {
      tier: m.tier,
      category: m.category,
      weight: uw * q,
      quantity: q,
      gridW: 1,
      gridH: 1,
      value: uv * q,
      quality: "common",
    },
  };
}

const ARMOR_SLOT_GRID = {
  head: { w: 2, h: 2 }, torso: { w: 2, h: 3 }, leftArm: { w: 1, h: 2 }, rightArm: { w: 1, h: 2 },
  legs: { w: 2, h: 3 }, leftHand: { w: 2, h: 2 }, rightHand: { w: 2, h: 2 },
  neck: { w: 1, h: 1 }, ringLeft: { w: 1, h: 1 }, ringRight: { w: 1, h: 1 },
  belt: { w: 2, h: 1 }, backpack: { w: 2, h: 3 },
};

const DEFAULT_ARMOR_COVERS = {
  head: ["head"],
  torso: ["torso"],
  legs: ["leftLeg", "rightLeg"],
  leftArm: ["leftArm"],
  rightArm: ["rightArm"],
  neck: ["neck"],
  leftHand: ["leftArm", "torso"],
  rightHand: ["rightArm", "torso"],
};

/** Результат из каталога WEAPONS. */
function weaponResult(id) {
  const w = WEAPONS[id];
  if (!w) throw new Error(`Unknown weapon id: ${id}`);
  const IMG = {
    sword: "icons/weapons/swords/sword-shortsword.webp",
    axe: "icons/weapons/axes/axe-battle.webp",
    spear: "icons/weapons/polearms/spear.webp",
    knife: "icons/weapons/daggers/dagger.webp",
    mace: "icons/weapons/maces/mace.webp",
    flail: "icons/weapons/flails/flail.webp",
    bow: "icons/weapons/bows/shortbow.webp",
    crossbow: "icons/weapons/crossbows/crossbow.webp",
    throwing: "icons/weapons/thrown/javelin.webp",
    exotic: "icons/weapons/staves/staff.webp",
  };
  const defaultImg = IMG[w.skill] ?? "icons/weapons/swords/sword-shortsword.webp";
  const sys = {
    tier: w.tier,
    damage: w.damage,
    damageType: w.damageType ?? "physical",
    skill: w.skill,
    weight: w.weight ?? 2,
    twoHanded: w.twoHanded ?? false,
    energyCost: w.energyCost ?? 8,
    value: w.value ?? 10,
    gridW: w.gridW ?? 1,
    gridH: w.gridH ?? 2,
    range: w.range ?? 1,
  };
  if (w.affixes && typeof w.affixes === "object") {
    sys.affixes = structuredClone(w.affixes);
  }
  return {
    type: "weapon",
    name: w.label,
    img: w.img ?? defaultImg,
    catalogId: id,
    system: sys,
  };
}

/** Результат из каталога ARMORS (protection как в компендиуме). */
function armorResult(id) {
  const a = ARMORS[id];
  if (!a) throw new Error(`Unknown armor id: ${id}`);
  const resistRaw = a.resist ?? { physical: a.tier ?? 0, magical: 0 };
  const resist = structuredClone(resistRaw);
  if (typeof resist === "object" && resist !== null) delete resist.img;
  const conventionArmorImg = `systems/iron-hills-system/icons/items/armor/${id}.webp`;
  const sg = ARMOR_SLOT_GRID[a.slot] ?? { w: 2, h: 2 };
  const phys = Number(resist?.physical ?? 0);
  const mag = Number(resist?.magical ?? 0);
  const sys = {
    tier: a.tier,
    slot: a.slot,
    weight: a.weight ?? 3,
    value: a.value ?? 20,
    gridW: sg.w,
    gridH: sg.h,
    protection: { physical: phys, magical: mag },
    covers: DEFAULT_ARMOR_COVERS[a.slot] ?? ["torso"],
  };
  if (a.affixes && typeof a.affixes === "object") {
    sys.affixes = structuredClone(a.affixes);
  }
  return {
    type: "armor",
    name: a.label,
    img: a.img ?? conventionArmorImg,
    catalogId: id,
    system: sys,
  };
}

function potionResult(id) {
  const p = POTIONS[id];
  if (!p) throw new Error(`Unknown potion id: ${id}`);
  const convention = `systems/iron-hills-system/icons/items/potions/${id}.webp`;
  return {
    type: "potion",
    name: p.label,
    img: p.img ?? convention,
    catalogId: id,
    system: {
      tier: p.tier,
      effect: p.effect,
      power: p.power,
      weight: p.weight ?? 0.3,
      scope: "single",
      target: "self",
      zone: "torso",
      value: p.value ?? 20,
    },
  };
}

function foodResult(id) {
  const f = FOOD[id];
  if (!f) throw new Error(`Unknown food id: ${id}`);
  const sys = {
    tier: f.tier ?? 1,
    satiety: f.satiety ?? 0,
    hydration: f.hydration ?? 0,
    weight: f.weight ?? 0.5,
    value: f.value ?? 2,
    gridW: f.gridW ?? 1,
    gridH: f.gridH ?? 1,
  };
  if (f.bonus && typeof f.bonus === "object") {
    sys.bonus = structuredClone(f.bonus);
  }
  return {
    type: "food",
    name: f.label,
    catalogId: id,
    system: sys,
  };
}

function drinkVesselResult(catalogId) {
  const v = DRINK_VESSELS[catalogId];
  if (!v) throw new Error(`Unknown drink vessel id: ${catalogId}`);
  const max = Math.max(1, Number(v.vesselMax ?? 1));
  const baseWt = Number(v.weight ?? 0.35);
  const filled = max;
  const hyd = Number(v.vesselHydrationPerDrink ?? 0);
  return {
    type: "consumable",
    name: v.label,
    img: `systems/iron-hills-system/icons/items/consumables/${v.id}.webp`,
    catalogId: v.id,
    flags: {
      "iron-hills-system": {
        catalogId: v.id,
        kind: "drink_vessel",
      },
    },
    system: {
      tier: Number(v.tier ?? 1),
      quality: "common",
      weight: baseWt + filled * 0.02,
      quantity: 1,
      power: hyd,
      actionType: "drink-vessel",
      applicationScope: "global",
      targetActorMode: "self",
      vesselMax: max,
      vesselCurrent: filled,
      vesselHydrationPerDrink: hyd,
      vesselSatietyPerDrink: Number(v.vesselSatietyPerDrink ?? 0),
      vesselLiquidLabel: String(v.vesselLiquidLabel ?? "Вода"),
      gridW: 1,
      gridH: 2,
      value: Number(v.value ?? 4),
    },
  };
}

export const CRAFT_RECIPES = {

  // ══════════════════════════════════════════════
  // СТУПЕНЬ 1 — начальные рецепты
  // ══════════════════════════════════════════════

  // Кузнечное дело
  copper_knife: {
    id:"copper_knife", label:"Медный нож",
    skillKey:"blacksmithing", difficulty:2,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[ { catalogMaterialId:"copper_ingot", quantity:1 } ],
    result: weaponResult("copper_knife"),
  },
  copper_sword: {
    id:"copper_sword", label:"Медный меч",
    skillKey:"blacksmithing", difficulty:4,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[
      { catalogMaterialId:"copper_ingot", quantity:2 },
      { catalogMaterialId:"pine_wood", quantity:1 },
    ],
    result: weaponResult("copper_sword"),
  },
  copper_axe: {
    id:"copper_axe", label:"Медный топор",
    skillKey:"blacksmithing", difficulty:3,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[
      { catalogMaterialId:"copper_ingot", quantity:2 },
      { catalogMaterialId:"pine_wood", quantity:1 },
    ],
    result: weaponResult("copper_axe"),
  },
  copper_spear: {
    id:"copper_spear", label:"Медное копьё",
    skillKey:"blacksmithing", difficulty:3,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[
      { catalogMaterialId:"copper_ingot", quantity:1 },
      { catalogMaterialId:"pine_wood", quantity:2 },
    ],
    result: weaponResult("copper_spear"),
  },
  leather_jacket: {
    id:"leather_jacket", label:"Кожаная куртка",
    skillKey:"crafting", difficulty:3,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"tanned_leather", quantity:3 },
      { catalogMaterialId:"cloth", quantity:1 },
    ],
    result: armorResult("leather_jacket"),
  },
  leather_cap: {
    id:"leather_cap", label:"Кожаная шапка",
    skillKey:"crafting", difficulty:2,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"tanned_leather", quantity:1 },
      { catalogMaterialId:"cloth", quantity:1 },
    ],
    result: armorResult("leather_cap"),
  },
  wooden_shield: {
    id:"wooden_shield", label:"Деревянный щит",
    skillKey:"crafting", difficulty:2,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"pine_wood", quantity:3 },
      { catalogMaterialId:"copper_ingot", quantity:1 },
    ],
    result: armorResult("wooden_shield"),
  },

  // Алхимия 1ст.
  minor_heal_potion: {
    id:"minor_heal_potion", label:"Малое зелье лечения",
    skillKey:"alchemy", difficulty:2,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { catalogMaterialId:"herb_healing", quantity:2 },
    ],
    result: potionResult("minor_heal"),
  },
  minor_energy_potion: {
    id:"minor_energy_potion", label:"Малое зелье бодрости",
    skillKey:"alchemy", difficulty:2,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { catalogMaterialId:"herb_common", quantity:1 },
      { catalogMaterialId:"mushroom_bog", quantity:1 },
    ],
    result: potionResult("minor_energy"),
  },
  antidote_weak: {
    id:"antidote_weak", label:"Слабое противоядие",
    skillKey:"alchemy", difficulty:3,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { catalogMaterialId:"mushroom_bog", quantity:1 },
      { catalogMaterialId:"herb_healing", quantity:2 },
    ],
    result: potionResult("antidote_weak"),
  },

  // Готовка 1ст.
  cooked_stew: {
    id:"cooked_stew", label:"Тушёное мясо",
    skillKey:"cooking", difficulty:2,
    tool:{ craftType:"cooking", tier:1 },
    ingredients:[
      { catalogFoodId:"fresh_meat", quantity:1 },
      { catalogMaterialId:"herb_common", quantity:1 },
    ],
    result: foodResult("cooked_stew"),
  },
  cook_field_stew: {
    id:"cook_field_stew", label:"Полевое жаркое",
    skillKey:"cooking", difficulty:2,
    tool:{ craftType:"cooking", tier:1 },
    ingredients:[
      { catalogFoodId:"game_meat_raw", quantity:1 },
      { catalogMaterialId:"herb_common", quantity:1 },
    ],
    result: foodResult("field_stew"),
  },
  leather_waterskin_craft: {
    id:"leather_waterskin_craft", label:"Кожаная фляга",
    skillKey:"crafting", difficulty:4,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"small_pelt_uncured", quantity:1 },
      { catalogMaterialId:"beast_sinew_spool", quantity:1 },
    ],
    result: drinkVesselResult("leather_waterskin"),
  },
  hunter_butcher_kit_craft: {
    id:"hunter_butcher_kit_craft", label:"Набор разделки туши",
    skillKey:"crafting", difficulty:5,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"tanned_leather", quantity:1 },
      { catalogMaterialId:"beast_sinew_spool", quantity:1 },
      { catalogMaterialId:"copper_ingot", quantity:1 },
      { catalogMaterialId:"cloth", quantity:1 },
    ],
    result:{
      type:"tool",
      name:"Набор разделки туши",
      catalogId:"hunter_butcher_kit",
      img:"systems/iron-hills-system/icons/items/tools/hunter_butcher_kit.webp",
      system:{
        tier:1,
        craftType:"survival",
        weight:0.95,
        value:22,
      },
    },
  },

  // ══════════════════════════════════════════════
  // СТУПЕНЬ 2 — продвинутые рецепты
  // ══════════════════════════════════════════════

  bronze_sword: {
    id:"bronze_sword", label:"Бронзовый меч",
    skillKey:"blacksmithing", difficulty:8,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { catalogMaterialId:"bronze_ingot", quantity:2 },
      { catalogMaterialId:"oak_wood", quantity:1 },
      { catalogMaterialId:"tanned_leather", quantity:1 },
    ],
    result: weaponResult("bronze_sword"),
  },
  bronze_axe: {
    id:"bronze_axe", label:"Бронзовый топор",
    skillKey:"blacksmithing", difficulty:7,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { catalogMaterialId:"bronze_ingot", quantity:2 },
      { catalogMaterialId:"oak_wood", quantity:1 },
    ],
    result: weaponResult("bronze_axe"),
  },
  field_butcher_roll_craft: {
    id:"field_butcher_roll_craft", label:"Скрутка полевого мясника",
    skillKey:"crafting", difficulty:9,
    tool:{ craftType:"crafting", tier:2 },
    ingredients:[
      { catalogMaterialId:"bronze_ingot", quantity:1 },
      { catalogMaterialId:"tanned_leather", quantity:2 },
      { catalogMaterialId:"beast_sinew_spool", quantity:2 },
      { catalogMaterialId:"cloth", quantity:2 },
    ],
    result:{
      type:"tool",
      name:"Скрутка полевого мясника",
      catalogId:"field_butcher_roll",
      img:"systems/iron-hills-system/icons/items/tools/field_butcher_roll.webp",
      system:{
        tier:2,
        craftType:"survival",
        weight:0.65,
        value:52,
      },
    },
  },
  chainmail: {
    id:"chainmail", label:"Кольчуга",
    skillKey:"blacksmithing", difficulty:10,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { catalogMaterialId:"bronze_ingot", quantity:4 },
      { catalogMaterialId:"copper_ingot", quantity:2 },
    ],
    result: armorResult("chainmail"),
  },
  iron_shield: {
    id:"iron_shield", label:"Железный щит",
    skillKey:"blacksmithing", difficulty:6,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { catalogMaterialId:"bronze_ingot", quantity:3 },
      { catalogMaterialId:"pine_wood", quantity:1 },
    ],
    result: armorResult("iron_shield"),
  },

  // Алхимия 2ст.
  heal_potion: {
    id:"heal_potion", label:"Зелье лечения",
    skillKey:"alchemy", difficulty:6,
    tool:{ craftType:"alchemy", tier:2 },
    ingredients:[
      { catalogMaterialId:"root_bitter", quantity:2 },
      { catalogMaterialId:"herb_healing", quantity:1 },
    ],
    result: potionResult("heal_potion"),
  },
  mana_potion: {
    id:"mana_potion", label:"Зелье маны",
    skillKey:"alchemy", difficulty:8,
    tool:{ craftType:"alchemy", tier:2 },
    ingredients:[
      { catalogMaterialId:"flower_moon", quantity:1 },
      { catalogMaterialId:"quartz", quantity:1 },
    ],
    result: potionResult("mana_potion"),
  },

  // ══════════════════════════════════════════════
  // СТУПЕНЬ 3 — мастерские рецепты
  // ══════════════════════════════════════════════

  tempered_sword: {
    id:"tempered_sword", label:"Закалённый меч",
    skillKey:"blacksmithing", difficulty:12,
    tool:{ craftType:"blacksmithing", tier:3 },
    ingredients:[
      { catalogMaterialId:"iron_ingot", quantity:3 },
      { catalogMaterialId:"quartz", quantity:1 },
      { catalogMaterialId:"oak_wood", quantity:1 },
    ],
    result: weaponResult("tempered_sword"),
  },
  plate_chest: {
    id:"plate_chest", label:"Нагрудник",
    skillKey:"blacksmithing", difficulty:14,
    tool:{ craftType:"blacksmithing", tier:3 },
    ingredients:[
      { catalogMaterialId:"iron_ingot", quantity:3 },
      { catalogMaterialId:"bronze_ingot", quantity:2 },
      { catalogMaterialId:"fine_cloth", quantity:1 },
    ],
    result: armorResult("plate_chest"),
  },
  greater_heal: {
    id:"greater_heal", label:"Большое зелье лечения",
    skillKey:"alchemy", difficulty:12,
    tool:{ craftType:"alchemy", tier:3 },
    ingredients:[
      { catalogMaterialId:"flower_moon", quantity:1 },
      { catalogMaterialId:"root_bitter", quantity:2 },
      { catalogMaterialId:"quartz", quantity:1 },
    ],
    result: potionResult("greater_heal"),
  },

  // ══════════════════════════════════════════════
  // Переработка материалов (плавка, сплавы, выделка)
  // ══════════════════════════════════════════════

  smelt_copper: {
    id:"smelt_copper", label:"Выплавка медного слитка",
    skillKey:"blacksmithing", difficulty:5,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[
      { catalogMaterialId:"copper_ore", quantity:3 },
      { catalogMaterialId:"stone", quantity:2 },
    ],
    result: materialResult("copper_ingot"),
  },

  smelt_iron: {
    id:"smelt_iron", label:"Выплавка железного слитка",
    skillKey:"blacksmithing", difficulty:8,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { catalogMaterialId:"iron_ore", quantity:4 },
      { catalogMaterialId:"stone", quantity:8 },
    ],
    result: materialResult("iron_ingot"),
  },

  alloy_bronze: {
    id:"alloy_bronze", label:"Сплавление бронзы",
    skillKey:"blacksmithing", difficulty:7,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { catalogMaterialId:"copper_ore", quantity:3 },
      { catalogMaterialId:"tin_ore", quantity:3 },
    ],
    result: materialResult("bronze_ingot"),
  },

  forge_steel_ingot: {
    id:"forge_steel_ingot", label:"Выплавка стали",
    skillKey:"blacksmithing", difficulty:11,
    tool:{ craftType:"blacksmithing", tier:3 },
    ingredients:[
      { catalogMaterialId:"iron_ingot", quantity:3 },
      { catalogMaterialId:"forge_coal", quantity:4 },
    ],
    result: materialResult("steel_ingot"),
  },

  temper_hardened_steel: {
    id:"temper_hardened_steel", label:"Закалка закалённой стали",
    skillKey:"blacksmithing", difficulty:14,
    tool:{ craftType:"blacksmithing", tier:3 },
    ingredients:[
      { catalogMaterialId:"steel_ingot", quantity:3 },
      { catalogMaterialId:"mana_crystal", quantity:1 },
      { catalogMaterialId:"forge_coal", quantity:2 },
    ],
    result: materialResult("hardened_steel"),
  },

  coke_from_wood: {
    id:"coke_from_wood", label:"Кокс для горна",
    skillKey:"crafting", difficulty:5,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"pine_wood", quantity:6 },
      { catalogMaterialId:"stone", quantity:4 },
    ],
    result: materialResult("forge_coal", 3),
  },

  tan_leather: {
    id:"tan_leather", label:"Выделка кожи",
    skillKey:"crafting", difficulty:4,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"animal_hide", quantity:2 },
      { catalogMaterialId:"herb_common", quantity:2 },
      { catalogMaterialId:"oil_flask", quantity:1 },
    ],
    result: materialResult("tanned_leather", 2),
  },

  spin_rope: {
    id:"spin_rope", label:"Кручёная верёвка",
    skillKey:"crafting", difficulty:3,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"raw_fiber", quantity:6 },
    ],
    result: materialResult("rope", 2),
  },

  weave_cloth: {
    id:"weave_cloth", label:"Ткань из волокна",
    skillKey:"crafting", difficulty:4,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"raw_fiber", quantity:5 },
    ],
    result: materialResult("cloth", 2),
  },

  weave_fine_cloth: {
    id:"weave_fine_cloth", label:"Тонкая ткань",
    skillKey:"crafting", difficulty:8,
    tool:{ craftType:"crafting", tier:2 },
    ingredients:[
      { catalogMaterialId:"raw_fiber", quantity:10 },
      { catalogMaterialId:"silk", quantity:2 },
    ],
    result: materialResult("fine_cloth"),
  },

  distill_mana_stone: {
    id:"distill_mana_stone", label:"Мана-камень из кварца",
    skillKey:"alchemy", difficulty:9,
    tool:{ craftType:"alchemy", tier:2 },
    ingredients:[
      { catalogMaterialId:"quartz", quantity:4 },
      { catalogMaterialId:"flower_moon", quantity:2 },
    ],
    result: materialResult("mana_stone"),
  },

  crystallize_void_sample: {
    id:"crystallize_void_sample", label:"Кристаллизация маны в порошок",
    skillKey:"alchemy", difficulty:16,
    tool:{ craftType:"alchemy", tier:5 },
    ingredients:[
      { catalogMaterialId:"void_crystal", quantity:2 },
      { catalogMaterialId:"abyss_lichen", quantity:2 },
      { catalogMaterialId:"soul_essence", quantity:1 },
    ],
    result: materialResult("enchant_dust", 3),
  },

  crush_aeon_gem: {
    id:"crush_aeon_gem", label:"Арканная проволока из жеоды эона",
    skillKey:"alchemy", difficulty:18,
    tool:{ craftType:"alchemy", tier:6 },
    ingredients:[
      { catalogMaterialId:"aeon_geode", quantity:2 },
      { catalogMaterialId:"enchant_dust", quantity:2 },
    ],
    result: materialResult("arcane_mesh"),
  },

  laminate_genesis_weave: {
    id:"laminate_genesis_weave", label:"Полотно генезиса из звёздных нитей",
    skillKey:"crafting", difficulty:22,
    tool:{ craftType:"crafting", tier:6 },
    ingredients:[
      { catalogMaterialId:"starthread", quantity:6 },
      { catalogMaterialId:"aurora_thread", quantity:3 },
      { catalogMaterialId:"epoch_seed", quantity:2 },
      { catalogMaterialId:"dragon_hide", quantity:2 },
    ],
    result: materialResult("genesis_weave"),
  },

  // ══════════════════════════════════════════════
  // Снаряжение (пояса, рюкзаки, крепления, переносные мастерские)
  // ══════════════════════════════════════════════

  leather_belt_craft: {
    id:"leather_belt_craft", label:"Кожаный пояс",
    skillKey:"crafting", difficulty:5,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"tanned_leather", quantity:2 },
      { catalogMaterialId:"cloth", quantity:1 },
      { catalogMaterialId:"rope", quantity:1 },
    ],
    result:{
      type:"belt",
      name:"Кожаный пояс",
      img:"systems/iron-hills-system/icons/items/belts/leather_belt.webp",
      system:{
        tier:1,
        weight:0.5,
        gridW:2,
        gridH:1,
        containerSlots:{ cols:3, rows:1 },
        attachmentSlots:[ { key:"a0", w:1, h:2, label:"Крепление" } ],
        weightFactor:1.0,
        description:"Стандартный кожаный пояс с одним боковым креплением.",
      },
    },
  },

  explorer_girdle_craft: {
    id:"explorer_girdle_craft", label:"Пояс следопыта",
    skillKey:"crafting", difficulty:12,
    tool:{ craftType:"crafting", tier:3 },
    ingredients:[
      { catalogMaterialId:"scale_hide", quantity:4 },
      { catalogMaterialId:"silk", quantity:3 },
      { catalogMaterialId:"iron_ingot", quantity:2 },
    ],
    result:{
      type:"belt",
      name:"Пояс следопыта",
      img:"systems/iron-hills-system/icons/items/belts/explorer_girdle.webp",
      system:{
        tier:4,
        weight:1.1,
        gridW:2,
        gridH:1,
        containerSlots:{ cols:5, rows:2 },
        attachmentSlots:[
          { key:"a0", w:1, h:2, label:"Кр. 1" }, { key:"a1", w:1, h:2, label:"Кр. 2" },
          { key:"a2", w:1, h:2, label:"Кр. 3" }, { key:"a3", w:1, h:2, label:"Кр. 4" },
        ],
        weightFactor:0.95,
        description:"Укреплённый пояс для долгих экспедиций. Четыре боковых крепления.",
      },
    },
  },

  caravan_master_pack_craft: {
    id:"caravan_master_pack_craft", label:"Рюкзак караванного бариши",
    skillKey:"crafting", difficulty:14,
    tool:{ craftType:"crafting", tier:3 },
    ingredients:[
      { catalogMaterialId:"drake_scale", quantity:5 },
      { catalogMaterialId:"spider_silk", quantity:4 },
      { catalogMaterialId:"steel_ingot", quantity:3 },
      { catalogMaterialId:"ironwood", quantity:4 },
    ],
    result:{
      type:"backpack",
      name:"Рюкзак караванного бариши",
      img:"systems/iron-hills-system/icons/items/backpacks/caravan_master_pack.webp",
      system:{
        tier:6,
        weight:2.2,
        gridW:2,
        gridH:4,
        containerSlots:{ cols:7, rows:7 },
        attachmentSlots:[],
        weightFactor:0.68,
        description:"Объёмный рюкзак для торговых партий и провианта на недели.",
      },
    },
  },

  beast_load_frame_craft: {
    id:"beast_load_frame_craft", label:"Вьючная рама для зверя",
    skillKey:"crafting", difficulty:17,
    tool:{ craftType:"crafting", tier:5 },
    ingredients:[
      { type:"material", category:"hide", tier:6, quantity:8 },
      { type:"material", category:"fiber", tier:6, quantity:6 },
      { type:"material", category:"metal", tier:6, quantity:6 },
      { type:"material", category:"wood", tier:6, quantity:6 },
    ],
    result:{
      type:"backpack",
      name:"Вьючная рама для зверя",
      img:"systems/iron-hills-system/icons/items/backpacks/beast_load_frame.webp",
      system:{
        tier:7,
        weight:8.0,
        gridW:2,
        gridH:4,
        containerSlots:{ cols:8, rows:8 },
        attachmentSlots:[],
        weightFactor:0.62,
        description:"Не для человека на спине — навешивается на мула, катальную собаку или боевого ездового зверя.",
      },
    },
  },

  spear_frog_craft: {
    id:"spear_frog_craft", label:"Чехол для копья",
    skillKey:"crafting", difficulty:8,
    tool:{ craftType:"crafting", tier:2 },
    ingredients:[
      { catalogMaterialId:"thick_hide", quantity:3 },
      { catalogMaterialId:"rope", quantity:2 },
    ],
    result:{
      type:"attachment",
      name:"Чехол для копья",
      img:"systems/iron-hills-system/icons/items/attachments/spear_frog.webp",
      system:{
        tier:2,
        weight:0.35,
        gridW:1,
        gridH:4,
        attachesTo:"belt",
        addsLabel:"Копьё",
        addsSlots:{ cols:1, rows:5 },
        allowedTypes:["weapon"],
        allowedSkills:["spear"],
        accessSeconds:2,
        description:"Кожаный футляр на пояс или спину для посоха-копья.",
      },
    },
  },

  shield_hook_craft: {
    id:"shield_hook_craft", label:"Крюк для щита",
    skillKey:"blacksmithing", difficulty:7,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { catalogMaterialId:"iron_ingot", quantity:2 },
      { catalogMaterialId:"tanned_leather", quantity:1 },
    ],
    result:{
      type:"attachment",
      name:"Крюк для щита",
      img:"systems/iron-hills-system/icons/items/attachments/shield_hook.webp",
      system:{
        tier:2,
        weight:0.35,
        gridW:1,
        gridH:3,
        attachesTo:"belt",
        addsLabel:"Щит",
        addsSlots:{ cols:2, rows:3 },
        allowedTypes:["armor"],
        allowedSkills:[],
        accessSeconds:2,
        description:"Металлический крюк для переноски щита боком у бедра.",
      },
    },
  },

  telescoping_quiver_craft: {
    id:"telescoping_quiver_craft", label:"Телескопический колчан",
    skillKey:"crafting", difficulty:13,
    tool:{ craftType:"crafting", tier:3 },
    ingredients:[
      { catalogMaterialId:"drake_hide", quantity:4 },
      { catalogMaterialId:"steel_ingot", quantity:2 },
      { catalogMaterialId:"fine_cloth", quantity:2 },
    ],
    result:{
      type:"attachment",
      name:"Телескопический колчан",
      img:"systems/iron-hills-system/icons/items/attachments/telescoping_quiver.webp",
      system:{
        tier:4,
        weight:0.65,
        gridW:1,
        gridH:3,
        attachesTo:"belt",
        addsLabel:"Колчан Т.",
        addsSlots:{ cols:2, rows:4 },
        allowedTypes:["material","throwable"],
        allowedSkills:["bow"],
        accessSeconds:0,
        description:"Раздвижной колчан для стрел разной длины.",
      },
    },
  },

  portable_smith_kit_craft: {
    id:"portable_smith_kit_craft", label:"Переносная кузница",
    skillKey:"blacksmithing", difficulty:14,
    tool:{ craftType:"blacksmithing", tier:3 },
    ingredients:[
      { type:"material", category:"metal", tier:4, quantity:8 },
      { type:"material", category:"wood", tier:4, quantity:5 },
      { type:"material", category:"stone", tier:3, quantity:4 },
      { type:"material", category:"misc", tier:1, quantity:4 },
    ],
    result:{
      type:"tool",
      name:"Переносная кузница",
      img:"systems/iron-hills-system/icons/items/tools/portable_smith_kit.webp",
      system:{
        tier:4,
        craftType:"blacksmithing",
        weight:48,
        value:920,
      },
    },
  },

  folding_alchemy_bench_craft: {
    id:"folding_alchemy_bench_craft", label:"Складной алхимический стол",
    skillKey:"alchemy", difficulty:13,
    tool:{ craftType:"alchemy", tier:3 },
    ingredients:[
      { type:"material", category:"wood", tier:4, quantity:4 },
      { type:"material", category:"misc", tier:2, quantity:4 },
      { type:"material", category:"herb", tier:3, quantity:3 },
      { type:"material", category:"metal", tier:3, quantity:3 },
    ],
    result:{
      type:"tool",
      name:"Складной алхимический стол",
      img:"systems/iron-hills-system/icons/items/tools/folding_alchemy_bench.webp",
      system:{
        tier:4,
        craftType:"alchemy",
        weight:18,
        value:740,
      },
    },
  },

  field_kitchen_cart_craft: {
    id:"field_kitchen_cart_craft", label:"Полевая кухня на салазках",
    skillKey:"cooking", difficulty:12,
    tool:{ craftType:"cooking", tier:3 },
    ingredients:[
      { type:"material", category:"metal", tier:3, quantity:5 },
      { type:"material", category:"wood", tier:3, quantity:6 },
      { type:"material", category:"stone", tier:2, quantity:2 },
    ],
    result:{
      type:"tool",
      name:"Полевая кухня на салазках",
      img:"systems/iron-hills-system/icons/items/tools/field_kitchen_cart.webp",
      system:{
        tier:4,
        craftType:"cooking",
        weight:38,
        value:660,
      },
    },
  },

  master_artisans_cart_craft: {
    id:"master_artisans_cart_craft", label:"Стол ремесленника на колёсах",
    skillKey:"crafting", difficulty:15,
    tool:{ craftType:"crafting", tier:3 },
    ingredients:[
      { type:"material", category:"wood", tier:5, quantity:8 },
      { type:"material", category:"metal", tier:4, quantity:6 },
      { type:"material", category:"hide", tier:4, quantity:4 },
      { type:"material", category:"misc", tier:2, quantity:6 },
    ],
    result:{
      type:"tool",
      name:"Стол ремесленника на колёсах",
      img:"systems/iron-hills-system/icons/items/tools/master_artisans_cart.webp",
      system:{
        tier:5,
        craftType:"crafting",
        weight:42,
        value:1550,
      },
    },
  },

  wagon_forge_craft: {
    id:"wagon_forge_craft", label:"Кузница на колёсах",
    skillKey:"blacksmithing", difficulty:18,
    tool:{ craftType:"blacksmithing", tier:4 },
    ingredients:[
      { type:"material", category:"metal", tier:6, quantity:14 },
      { type:"material", category:"wood", tier:5, quantity:10 },
      { type:"material", category:"hide", tier:5, quantity:6 },
      { type:"material", category:"misc", tier:1, quantity:8 },
    ],
    result:{
      type:"tool",
      name:"Кузница на колёсах",
      img:"systems/iron-hills-system/icons/items/tools/wagon_forge.webp",
      system:{
        tier:6,
        craftType:"blacksmithing",
        weight:118,
        value:4800,
      },
    },
  },

  siege_anvil_cart_craft: {
    id:"siege_anvil_cart_craft", label:"Осадная переносная кузница",
    skillKey:"blacksmithing", difficulty:22,
    tool:{ craftType:"blacksmithing", tier:6 },
    ingredients:[
      { type:"material", category:"metal", tier:7, quantity:18 },
      { type:"material", category:"wood", tier:6, quantity:12 },
      { type:"material", category:"stone", tier:6, quantity:10 },
      { type:"material", category:"misc", tier:3, quantity:6 },
    ],
    result:{
      type:"tool",
      name:"Осадная переносная кузница",
      img:"systems/iron-hills-system/icons/items/tools/siege_anvil_cart.webp",
      system:{
        tier:7,
        craftType:"blacksmithing",
        weight:195,
        value:14500,
      },
    },
  },

  alchemical_caravan_lab_craft: {
    id:"alchemical_caravan_lab_craft", label:"Караванная алхимлаборатория",
    skillKey:"alchemy", difficulty:20,
    tool:{ craftType:"alchemy", tier:6 },
    ingredients:[
      { type:"material", category:"wood", tier:6, quantity:14 },
      { type:"material", category:"metal", tier:6, quantity:10 },
      { type:"material", category:"misc", tier:2, quantity:8 },
      { type:"material", category:"herb", tier:6, quantity:8 },
    ],
    result:{
      type:"tool",
      name:"Караванная алхимлаборатория",
      img:"systems/iron-hills-system/icons/items/tools/alchemical_caravan_lab.webp",
      system:{
        tier:7,
        craftType:"alchemy",
        weight:98,
        value:11200,
      },
    },
  },
};

for (const [alias, target] of [
  ["iron_knife", "copper_knife"],
  ["iron_sword", "copper_sword"],
  ["iron_axe", "copper_axe"],
  ["iron_spear", "copper_spear"],
  ["steel_sword", "bronze_sword"],
  ["steel_axe", "bronze_axe"],
]) {
  if (CRAFT_RECIPES[target]) CRAFT_RECIPES[alias] = CRAFT_RECIPES[target];
}

/** Один объект на каждый `recipe.id` (без дублей из-за легаси‑алиасов). */
export function uniqueCraftRecipes() {
  const m = new Map();
  for (const r of Object.values(CRAFT_RECIPES)) {
    if (!m.has(r.id)) m.set(r.id, r);
  }
  return [...m.values()];
}
