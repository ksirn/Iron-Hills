/**
 * Iron Hills — Craft Recipes
 * Рецепты крафта по ступеням.
 * difficulty = порог навыка (1-20 соответствует ступени 1-10).
 */

import { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, DRINK_VESSELS, CONSUMABLES, THROWABLES } from "./items-catalog.mjs";
import {
  armorToItemData,
  consumableToItemData,
  drinkVesselToItemData,
  foodToItemData,
  materialToItemData,
  potionToItemData,
  throwableToItemData,
  weaponToItemData,
} from "../utils/catalog-item-data.mjs";

function withRecipeCatalogId(itemData, catalogId) {
  return {
    ...itemData,
    catalogId,
    flags: {
      ...(itemData.flags ?? {}),
      "iron-hills-system": {
        ...(itemData.flags?.["iron-hills-system"] ?? {}),
        catalogId,
      },
    },
  };
}

/** Готовый результат-предмет типа material из каталога MATERIALS по id. */
function materialResult(id, qty = 1) {
  const m = MATERIALS[id];
  if (!m) throw new Error(`Unknown material id: ${id}`);
  const q = Math.max(1, Number(qty) || 1);
  return withRecipeCatalogId(materialToItemData(m, { quantity: q }), id);
}

/** Результат из каталога WEAPONS. */
function weaponResult(id) {
  const w = WEAPONS[id];
  if (!w) throw new Error(`Unknown weapon id: ${id}`);
  return withRecipeCatalogId(weaponToItemData(w), id);
}

/** Результат из каталога ARMORS (protection как в компендиуме). */
function armorResult(id) {
  const a = ARMORS[id];
  if (!a) throw new Error(`Unknown armor id: ${id}`);
  return withRecipeCatalogId(armorToItemData(a), id);
}

function potionResult(id) {
  const p = POTIONS[id];
  if (!p) throw new Error(`Unknown potion id: ${id}`);
  const convention = `systems/iron-hills-system/icons/items/potions/${id}.webp`;
  return withRecipeCatalogId(potionToItemData({ ...p, img: p.img ?? convention }), id);
}

function foodResult(id) {
  const f = FOOD[id];
  if (!f) throw new Error(`Unknown food id: ${id}`);
  return withRecipeCatalogId(foodToItemData(f), id);
}

function drinkVesselResult(catalogId) {
  const v = DRINK_VESSELS[catalogId];
  if (!v) throw new Error(`Unknown drink vessel id: ${catalogId}`);
  return withRecipeCatalogId(drinkVesselToItemData(v), v.id);
}

function consumableResult(catalogId) {
  const c = CONSUMABLES[catalogId];
  if (!c) throw new Error(`Unknown consumable id: ${catalogId}`);
  return withRecipeCatalogId(consumableToItemData(c), c.id);
}

function throwableResult(catalogId) {
  const t = THROWABLES[catalogId];
  if (!t) throw new Error(`Unknown throwable id: ${catalogId}`);
  return withRecipeCatalogId(throwableToItemData(t), t.id);
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
  antiseptic_wash_craft: {
    id:"antiseptic_wash_craft", label:"Антисептический раствор",
    skillKey:"alchemy", difficulty:3,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { catalogMaterialId:"herb_common", quantity:2 },
      { catalogMaterialId:"oil_flask", quantity:1 },
    ],
    result: consumableResult("antiseptic_wash"),
  },
  clean_dressing_craft: {
    id:"clean_dressing_craft", label:"Чистая повязка",
    skillKey:"crafting", difficulty:3,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { catalogMaterialId:"cloth", quantity:1 },
      { catalogMaterialId:"herb_healing", quantity:1 },
    ],
    result: consumableResult("clean_dressing"),
  },
  clay_shrapnel_pot_craft: {
    id:"clay_shrapnel_pot_craft", label:"Глиняный осколочный горшок",
    skillKey:"alchemy", difficulty:4,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { catalogMaterialId:"stone", quantity:1 },
      { catalogMaterialId:"flint", quantity:2 },
      { catalogMaterialId:"cloth", quantity:1 },
    ],
    result: throwableResult("clay_shrapnel_pot"),
  },
  fire_oil_flask_craft: {
    id:"fire_oil_flask_craft", label:"Фляга горючего масла",
    skillKey:"alchemy", difficulty:5,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { catalogMaterialId:"oil_flask", quantity:2 },
      { catalogMaterialId:"cloth", quantity:1 },
      { catalogMaterialId:"coal", quantity:1 },
    ],
    result: throwableResult("fire_oil_flask"),
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
  field_suture_roll_craft: {
    id:"field_suture_roll_craft", label:"Полевая шовная скрутка",
    skillKey:"crafting", difficulty:7,
    tool:{ craftType:"crafting", tier:2 },
    ingredients:[
      { catalogMaterialId:"fine_cloth", quantity:1 },
      { catalogMaterialId:"beast_sinew_spool", quantity:1 },
      { catalogMaterialId:"herb_healing", quantity:1 },
    ],
    result: consumableResult("field_suture_roll"),
  },
  clotting_powder_craft: {
    id:"clotting_powder_craft", label:"Свёртывающий порошок",
    skillKey:"alchemy", difficulty:7,
    tool:{ craftType:"alchemy", tier:2 },
    ingredients:[
      { catalogMaterialId:"root_bitter", quantity:1 },
      { catalogMaterialId:"wisp_moth_powder", quantity:1 },
      { catalogMaterialId:"cloth", quantity:1 },
    ],
    result: consumableResult("clotting_powder"),
  },
  venom_glass_vial_craft: {
    id:"venom_glass_vial_craft", label:"Стеклянная ядовитая склянка",
    skillKey:"alchemy", difficulty:8,
    tool:{ craftType:"alchemy", tier:2 },
    ingredients:[
      { catalogMaterialId:"poison_fang", quantity:1 },
      { catalogMaterialId:"glass", quantity:1 },
      { catalogMaterialId:"mushroom_bog", quantity:1 },
    ],
    result: throwableResult("venom_glass_vial"),
  },
  thunderstone_craft: {
    id:"thunderstone_craft", label:"Громовой камень",
    skillKey:"alchemy", difficulty:10,
    tool:{ craftType:"alchemy", tier:2 },
    ingredients:[
      { catalogMaterialId:"mana_stone", quantity:1 },
      { catalogMaterialId:"quartz", quantity:2 },
      { catalogMaterialId:"flint", quantity:1 },
    ],
    result: throwableResult("thunderstone"),
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
  bone_pin_splint_craft: {
    id:"bone_pin_splint_craft", label:"Шина с костяными фиксаторами",
    skillKey:"crafting", difficulty:10,
    tool:{ craftType:"crafting", tier:2 },
    ingredients:[
      { catalogMaterialId:"hardwood", quantity:1 },
      { catalogMaterialId:"fang_shard", quantity:2 },
      { catalogMaterialId:"fine_cloth", quantity:1 },
    ],
    result: consumableResult("bone_pin_splint"),
  },
  painkiller_draught_craft: {
    id:"painkiller_draught_craft", label:"Обезболивающий глоток",
    skillKey:"alchemy", difficulty:12,
    tool:{ craftType:"alchemy", tier:3 },
    ingredients:[
      { catalogMaterialId:"root_bitter", quantity:2 },
      { catalogMaterialId:"monster_gland", quantity:1 },
      { catalogMaterialId:"flower_moon", quantity:1 },
    ],
    result: consumableResult("painkiller_draught"),
  },
  frostburst_flask_craft: {
    id:"frostburst_flask_craft", label:"Склянка морозного разрыва",
    skillKey:"alchemy", difficulty:13,
    tool:{ craftType:"alchemy", tier:3 },
    ingredients:[
      { catalogMaterialId:"flower_moon", quantity:2 },
      { catalogMaterialId:"glass", quantity:1 },
      { catalogMaterialId:"quartz", quantity:2 },
    ],
    result: throwableResult("frostburst_flask"),
  },
  blessed_water_globe_craft: {
    id:"blessed_water_globe_craft", label:"Сфера освящённой воды",
    skillKey:"alchemy", difficulty:13,
    tool:{ craftType:"alchemy", tier:3 },
    ingredients:[
      { catalogMaterialId:"spirit_bloom", quantity:1 },
      { catalogMaterialId:"glass", quantity:1 },
      { catalogMaterialId:"mana_stone", quantity:1 },
    ],
    result: throwableResult("blessed_water_globe"),
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

  battle_stimulant_craft: {
    id:"battle_stimulant_craft", label:"Боевой стимулятор",
    skillKey:"alchemy", difficulty:15,
    tool:{ craftType:"alchemy", tier:4 },
    ingredients:[
      { catalogMaterialId:"monster_gland", quantity:2 },
      { catalogMaterialId:"predator_resin_mass", quantity:1 },
      { catalogMaterialId:"mana_stone", quantity:1 },
    ],
    result: consumableResult("battle_stimulant"),
  },

  field_trauma_pack_craft: {
    id:"field_trauma_pack_craft", label:"Полевой травмпакет",
    skillKey:"crafting", difficulty:15,
    tool:{ craftType:"crafting", tier:4 },
    ingredients:[
      { catalogMaterialId:"fine_cloth", quantity:3 },
      { catalogMaterialId:"spider_silk", quantity:1 },
      { catalogMaterialId:"herb_healing", quantity:3 },
      { catalogMaterialId:"predator_resin_mass", quantity:1 },
    ],
    result: consumableResult("field_trauma_pack"),
  },

  restoration_ampoule_craft: {
    id:"restoration_ampoule_craft", label:"Восстановительная ампула",
    skillKey:"alchemy", difficulty:16,
    tool:{ craftType:"alchemy", tier:5 },
    ingredients:[
      { catalogMaterialId:"spirit_bloom", quantity:2 },
      { catalogMaterialId:"phoenix_feather", quantity:1 },
      { catalogMaterialId:"glass", quantity:1 },
    ],
    result: consumableResult("restoration_ampoule"),
  },

  master_surgery_pack_craft: {
    id:"master_surgery_pack_craft", label:"Мастерский хирургический комплект",
    skillKey:"crafting", difficulty:18,
    tool:{ craftType:"crafting", tier:5 },
    ingredients:[
      { catalogMaterialId:"spider_silk", quantity:2 },
      { catalogMaterialId:"hardened_steel", quantity:1 },
      { catalogMaterialId:"phoenix_feather", quantity:1 },
      { catalogMaterialId:"artisans_resin", quantity:1 },
    ],
    result: consumableResult("master_surgery_pack"),
  },

  dragonfire_bomb_craft: {
    id:"dragonfire_bomb_craft", label:"Драконья огненная бомба",
    skillKey:"alchemy", difficulty:18,
    tool:{ craftType:"alchemy", tier:6 },
    ingredients:[
      { catalogMaterialId:"dragon_blood", quantity:1 },
      { catalogMaterialId:"oil_flask", quantity:3 },
      { catalogMaterialId:"glass", quantity:2 },
      { catalogMaterialId:"enchant_dust", quantity:1 },
    ],
    result: throwableResult("dragonfire_bomb"),
  },

  void_splinter_grenade_craft: {
    id:"void_splinter_grenade_craft", label:"Граната осколков Пустоты",
    skillKey:"alchemy", difficulty:20,
    tool:{ craftType:"alchemy", tier:7 },
    ingredients:[
      { catalogMaterialId:"void_crystal", quantity:2 },
      { catalogMaterialId:"abyss_lichen", quantity:1 },
      { catalogMaterialId:"arcane_mesh", quantity:1 },
    ],
    result: throwableResult("void_splinter_grenade"),
  },

  sunburst_phial_craft: {
    id:"sunburst_phial_craft", label:"Фиал солнечной вспышки",
    skillKey:"alchemy", difficulty:22,
    tool:{ craftType:"alchemy", tier:8 },
    ingredients:[
      { catalogMaterialId:"star_shard", quantity:1 },
      { catalogMaterialId:"god_tears", quantity:1 },
      { catalogMaterialId:"glass", quantity:2 },
    ],
    result: throwableResult("sunburst_phial"),
  },

  genesis_star_bomb_craft: {
    id:"genesis_star_bomb_craft", label:"Звёздная бомба Генезиса",
    skillKey:"alchemy", difficulty:24,
    tool:{ craftType:"alchemy", tier:9 },
    ingredients:[
      { catalogMaterialId:"star_heart", quantity:1 },
      { catalogMaterialId:"epoch_seed", quantity:1 },
      { catalogMaterialId:"arcane_mesh", quantity:2 },
      { catalogMaterialId:"god_tears", quantity:1 },
    ],
    result: throwableResult("genesis_star_bomb"),
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
