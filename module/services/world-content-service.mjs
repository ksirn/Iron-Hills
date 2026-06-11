import { NAME_FIRST, NAME_LAST } from "../constants/names.mjs";
import { NPC_SPECIALIZATIONS } from "../constants/npc-profiles.mjs";
import { SKILLS_FLAT } from "../constants/skills.mjs";
import { normalizeSpellSchoolKey } from "../constants/spells-catalog.mjs";
import { ARMORS, FOOD, MATERIALS, POTIONS, THROWABLES, TOOLS, WEAPONS } from "../constants/items-catalog.mjs";
import { choice, randInt, clamp } from "../utils/math-utils.mjs";
import { getComputedItemUnitPrice, getDefaultWeaponRange } from "../utils/item-utils.mjs";
import { normalizeItemDataForInventory } from "../utils/catalog-item-data.mjs";
import {
  normalizeItemActionSystem,
  normalizeThrowableSystem,
} from "../utils/item-runtime-normalization.mjs";
import { itemDataFromLootLine } from "../utils/loot-line-items.mjs";
import { buildSpellItemSystemData } from "./spell-runtime-service.mjs";
import {
  consumeRecipeIngredients as consumeRecipeIngredientsImpl,
  getAvailableIngredientQuantity,
  getItemCatalogId as getItemCatalogIdFromCraftIngredients,
} from "./craft-ingredients.mjs";

export { getAvailableIngredientQuantity, getItemCatalogIdFromCraftIngredients as getItemCatalogId };

function freezeRegistry(registry) {
  return Object.freeze(Object.fromEntries(
    Object.entries(registry).map(([id, value]) => [
      id,
      Object.freeze({
        id,
        ...value,
        themes: value.themes ? Object.freeze([...value.themes]) : undefined,
        status: value.status ? Object.freeze([...value.status]) : undefined,
        namePrefixes: value.namePrefixes ? Object.freeze([...value.namePrefixes]) : undefined,
      }),
    ])
  ));
}

function registryOptions(registry) {
  return Object.values(registry ?? {}).map((entry) => ({
    id: entry.id,
    label: entry.label,
    icon: entry.icon ?? "",
    text: entry.icon ? `${entry.icon} ${entry.label}` : entry.label,
  }));
}

export const WORLD_CONTENT_MERCHANT_LOOT_SPECIALTIES = freezeRegistry({
  general: { label: "Общая лавка", icon: "🏪" },
  blacksmith: { label: "Кузнец", icon: "⚒" },
  alchemist: { label: "Алхимик", icon: "⚗" },
  hunter: { label: "Охотник", icon: "🏹" },
  innkeeper: { label: "Трактирщик", icon: "🍲" },
});

export const WORLD_CONTENT_CONTAINER_THEMES = freezeRegistry({
  bandit: { label: "Бандит", icon: "🗡" },
  ruins: { label: "Руины", icon: "🏚" },
  hunter: { label: "Охотник", icon: "🏹" },
  alchemy: { label: "Алхимия", icon: "⚗" },
  military: { label: "Военный", icon: "⚔" },
});

export const WORLD_CONTENT_POI_THEMES = freezeRegistry({
  bandit: { label: "Бандиты", npcRole: "bandit", lootTheme: "bandit" },
  hunter: { label: "Охотники", npcRole: "hunter", lootTheme: "hunter" },
  mercenary: { label: "Наёмники", npcRole: "guard", lootTheme: "military" },
  beast: { label: "Звери" },
  undead: { label: "Нежить" },
  ancient: { label: "Древнее", lootTheme: "ruins" },
  forgotten: { label: "Забытое", lootTheme: "ruins" },
  cursed: { label: "Проклятое", lootTheme: "ruins" },
  sacred: { label: "Священное", npcRole: "mage", lootKind: "mystic" },
  forsaken: { label: "Осквернённое" },
  mystic: { label: "Мистическое", npcRole: "mage", lootKind: "mystic" },
  bridge: { label: "Мост" },
  ford: { label: "Брод" },
  watchpost: { label: "Дозорный пост", lootTheme: "military" },
});

export const WORLD_CONTENT_POI_TYPES = freezeRegistry({
  camp: {
    label: "Лагерь",
    icon: "⛺",
    themes: ["bandit", "hunter", "mercenary"],
    status: ["active", "hidden", "abandoned"],
    namePrefixes: ["Лагерь", "Стоянка", "Схрон"],
  },
  lair: {
    label: "Логово",
    icon: "🐉",
    themes: ["beast", "undead", "bandit"],
    status: ["active", "dangerous", "sealed"],
    namePrefixes: ["Логово", "Нора", "Гнездо"],
  },
  ruins: {
    label: "Руины",
    icon: "🏚",
    themes: ["ancient", "forgotten", "cursed"],
    status: ["silent", "active", "collapsed"],
    namePrefixes: ["Руины", "Развалины", "Заброшка"],
  },
  shrine: {
    label: "Святилище",
    icon: "⛩",
    themes: ["sacred", "forsaken", "mystic"],
    status: ["active", "hidden", "defiled"],
    namePrefixes: ["Святилище", "Капище", "Алтарь"],
  },
  road: {
    label: "Дорожная точка",
    icon: "🛣",
    themes: ["bridge", "ford", "watchpost"],
    status: ["used", "damaged", "blocked"],
    namePrefixes: ["Переправа", "Пост", "Переход"],
  },
  dungeon: {
    label: "Подземелье",
    icon: "⚔",
    themes: ["ancient", "undead", "bandit"],
    status: ["sealed", "dangerous", "active"],
    namePrefixes: ["Подземелье", "Катакомбы", "Глубины"],
  },
  tower: {
    label: "Башня",
    icon: "🗼",
    themes: ["mystic", "forsaken", "watchpost"],
    status: ["active", "abandoned", "sealed"],
    namePrefixes: ["Башня", "Шпиль", "Обсерватория"],
  },
  cave: {
    label: "Пещера",
    icon: "🕳",
    themes: ["beast", "bandit", "forgotten"],
    status: ["active", "hidden", "collapsed"],
    namePrefixes: ["Пещера", "Грот", "Разлом"],
  },
});

const NPC_ROLE_ICONS = Object.freeze({
  villager: "🏘",
  guard: "🛡",
  bandit: "🗡",
  mage: "✨",
  crafter: "🔨",
  hunter: "🏹",
  noble: "👑",
  priest: "✝",
});

export const WORLD_CONTENT_NPC_ROLES = freezeRegistry(Object.fromEntries(
  Object.entries(NPC_SPECIALIZATIONS).map(([id, profile]) => [
    id,
    {
      label: profile.label ?? id,
      icon: NPC_ROLE_ICONS[id] ?? "",
    },
  ])
));

export function getWorldContentOptionData() {
  return {
    merchantLootSpecialties: registryOptions(WORLD_CONTENT_MERCHANT_LOOT_SPECIALTIES),
    containerThemes: registryOptions(WORLD_CONTENT_CONTAINER_THEMES),
    poiTypes: registryOptions(WORLD_CONTENT_POI_TYPES),
    npcRoles: registryOptions(WORLD_CONTENT_NPC_ROLES),
  };
}

const ARMOR_SLOT_GRIDS = Object.freeze({
  head: { w: 2, h: 2 },
  torso: { w: 2, h: 3 },
  abdomen: { w: 2, h: 2 },
  leftArm: { w: 1, h: 2 },
  rightArm: { w: 1, h: 2 },
  legs: { w: 2, h: 3 },
  leftHand: { w: 2, h: 2 },
  rightHand: { w: 2, h: 2 },
  neck: { w: 1, h: 1 },
  ringLeft: { w: 1, h: 1 },
  ringRight: { w: 1, h: 1 },
  belt: { w: 2, h: 1 },
  backpack: { w: 2, h: 3 },
});

const ARMOR_SLOT_COVERS = Object.freeze({
  head: ["head"],
  torso: ["torso"],
  abdomen: ["abdomen"],
  legs: ["leftLeg", "rightLeg"],
  leftArm: ["leftArm"],
  rightArm: ["rightArm"],
  leftHand: ["leftArm", "torso"],
  rightHand: ["rightArm", "torso"],
  neck: ["neck"],
});

const DEFAULT_ITEM_GRIDS = Object.freeze({
  weapon: { w: 1, h: 3 },
  armor: { w: 2, h: 2 },
  food: { w: 1, h: 1 },
  potion: { w: 1, h: 1 },
  scroll: { w: 1, h: 2 },
  throwable: { w: 1, h: 1 },
  consumable: { w: 1, h: 1 },
  material: { w: 1, h: 1 },
  resource: { w: 1, h: 1 },
  tool: { w: 1, h: 2 },
});

const DEFAULT_CONSUMABLE_WEIGHTS = Object.freeze({
  bandage: 0.1,
  tourniquet: 0.2,
  splint: 0.8,
  surgery: 1.5,
  "cure-poison": 0.3,
  "cure-disease": 0.3,
  "stabilize-body": 0.5,
  "stop-minor-bleeding-global": 0.2,
});

const GENERATED_ITEM_IMAGES = Object.freeze({
  weapon: {
    sword: "icons/weapons/swords/sword-shortsword.webp",
    axe: "icons/weapons/axes/axe-battle.webp",
    spear: "icons/weapons/polearms/spear.webp",
    knife: "icons/weapons/daggers/dagger.webp",
    mace: "icons/weapons/maces/mace.webp",
    flail: "icons/weapons/flails/flail.webp",
    bow: "icons/weapons/bows/shortbow.webp",
    crossbow: "icons/weapons/crossbows/crossbow.webp",
    throwing: "icons/weapons/thrown/knife-simple.webp",
    exotic: "icons/weapons/staves/staff.webp",
  },
  armor: {
    head: "icons/equipment/head/helm-barbute-steel.webp",
    torso: "icons/equipment/chest/breastplate-cuirass-steel-grey.webp",
    abdomen: "icons/equipment/waist/belt-leather-brown.webp",
    leftArm: "icons/equipment/wrist/bracer-leather.webp",
    rightArm: "icons/equipment/wrist/bracer-leather.webp",
    legs: "icons/equipment/feet/boots-armored-steel.webp",
    leftHand: "icons/equipment/shield/heater-steel-boss-red.webp",
    rightHand: "icons/equipment/shield/heater-steel-boss-red.webp",
  },
  food: "icons/consumables/food/bread-loaf-round-brown.webp",
  potion: "icons/consumables/potions/potion-round-empty-green.webp",
  scroll: "icons/sundries/scrolls/scroll-bound-sealed-red.webp",
  spell: {
    fire: "icons/magic/fire/flame-burning-campfire-orange.webp",
    ice: "icons/magic/water/ice-block-frozen-mountain.webp",
    lightning: "icons/magic/lightning/bolt-strike-blue.webp",
    shadow: "icons/magic/unholy/orb-glowing-green.webp",
    light: "icons/magic/holy/projectile-orb-yellow.webp",
    earth: "icons/magic/earth/projectile-boulder-brown.webp",
    mind: "icons/magic/symbols/rune-sigil-purple-pink.webp",
    summon: "icons/magic/life/cross-worn-green.webp",
    default: "icons/magic/symbols/rune-sigil-purple-pink.webp",
  },
  throwable: "icons/weapons/thrown/bomb-fuse-black.webp",
  consumable: {
    bandage: "icons/commodities/cloth/cloth-roll-white.webp",
    tourniquet: "icons/commodities/leather/leather-belt-brown.webp",
    splint: "icons/commodities/wood/wood-stick-brown.webp",
    surgery: "icons/tools/hand/needle-grey.webp",
    "cure-poison": "icons/consumables/potions/potion-bottle-corked-green.webp",
    "cure-disease": "icons/consumables/potions/potion-bottle-corked-blue.webp",
    default: "icons/consumables/potions/potion-round-empty-green.webp",
  },
  material: {
    metal: "icons/commodities/metal/ingot-steel.webp",
    ore: "icons/commodities/stone/ore-chunk-grey.webp",
    wood: "icons/commodities/wood/log-stack-brown.webp",
    stone: "icons/commodities/stone/stone-block-grey.webp",
    herbs: "icons/commodities/flowers/clover.webp",
    fiber: "icons/commodities/cloth/thread-spindle-white.webp",
    hide: "icons/commodities/leather/fur-brown.webp",
    meat: "icons/consumables/meat/hock-leg-pink-brown.webp",
    default: "icons/commodities/materials/bundle-white.webp",
  },
  resource: {
    water: "icons/consumables/drinks/waterskin-leather-blue.webp",
    default: "icons/containers/bags/sack-simple-tan.webp",
  },
  tool: {
    blacksmithing: "icons/tools/smithing/hammer-sledge-steel-grey.webp",
    crafting: "icons/tools/hand/hammer-and-nail.webp",
    default: "icons/tools/hand/hammer-and-nail.webp",
  },
});

function cleanTier(tier) {
  return clamp(Math.round(Number(tier) || 1), 1, 10);
}

function cleanQuantity(quantity) {
  return Math.max(1, Math.floor(Number(quantity) || 1));
}

function cleanGridValue(value, fallback) {
  const n = Math.floor(Number(value ?? fallback));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function cleanPositiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function durabilityFor(type, tier, explicit = null) {
  if (explicit && typeof explicit === "object") {
    const max = cleanPositiveNumber(explicit.max, cleanPositiveNumber(explicit.value, 100));
    return {
      value: Math.min(max, cleanPositiveNumber(explicit.value, max)),
      max,
    };
  }

  const t = cleanTier(tier);
  const max = type === "weapon"
    ? 40 + t * 10
    : type === "armor"
      ? 50 + t * 15
      : 30 + t * 8;

  return { value: max, max };
}

function weaponGrid(skill, twoHanded = false) {
  if (skill === "knife") return { w: 1, h: 2 };
  if (skill === "bow" || skill === "crossbow" || skill === "spear" || twoHanded) return { w: 1, h: 4 };
  if (skill === "throwing") return { w: 1, h: 2 };
  return { w: 1, h: 3 };
}

function defaultGridForItem(type, system = {}) {
  if (type === "weapon") return weaponGrid(system.skill, system.twoHanded);
  if (type === "armor") return ARMOR_SLOT_GRIDS[system.slot] ?? DEFAULT_ITEM_GRIDS.armor;
  if (type === "tool" && system.craftType === "blacksmithing") return { w: 2, h: 2 };
  return DEFAULT_ITEM_GRIDS[type] ?? { w: 1, h: 1 };
}

function withGeneratedItemDefaults(type, system, options = {}) {
  const next = { ...(system ?? {}) };
  next.tier = cleanTier(next.tier);
  next.quantity = cleanQuantity(next.quantity);

  if (!next.quality && !["material", "resource"].includes(type)) {
    next.quality = "common";
  }

  const grid = options.grid ?? defaultGridForItem(type, next);
  next.gridW = cleanGridValue(next.gridW, grid.w);
  next.gridH = cleanGridValue(next.gridH, grid.h);

  const explicitValue = Number(options.value ?? next.value ?? next.price ?? 0);
  next.value = Number.isFinite(explicitValue) && explicitValue > 0
    ? Math.max(1, Math.round(explicitValue))
    : getComputedItemUnitPrice({ type, system: next });

  return next;
}

function generatedItemImage(type, system = {}, options = {}) {
  if (options.img) return options.img;

  if (type === "weapon") {
    return GENERATED_ITEM_IMAGES.weapon[system.skill] ?? GENERATED_ITEM_IMAGES.weapon.sword;
  }

  if (type === "armor") {
    return GENERATED_ITEM_IMAGES.armor[system.slot] ?? GENERATED_ITEM_IMAGES.armor.torso;
  }

  if (type === "consumable") {
    const key = system.actionType || system.effectType || "default";
    return GENERATED_ITEM_IMAGES.consumable[key] ?? GENERATED_ITEM_IMAGES.consumable.default;
  }

  if (type === "material") {
    const key = system.category || "default";
    return GENERATED_ITEM_IMAGES.material[key] ?? GENERATED_ITEM_IMAGES.material.default;
  }

  if (type === "resource") {
    const key = system.category || "default";
    return GENERATED_ITEM_IMAGES.resource[key] ?? GENERATED_ITEM_IMAGES.resource.default;
  }

  if (type === "tool") {
    const key = system.craftType || "default";
    return GENERATED_ITEM_IMAGES.tool[key] ?? GENERATED_ITEM_IMAGES.tool.default;
  }

  if (type === "spell") {
    const key = normalizeSpellSchoolKey(system.school, { fallback: system.school || "default" });
    return GENERATED_ITEM_IMAGES.spell[key] ?? GENERATED_ITEM_IMAGES.spell.default;
  }

  return GENERATED_ITEM_IMAGES[type] ?? "icons/svg/item-bag.svg";
}

function generatedFlags(type, options = {}) {
  const flags = { ...(options.flags ?? {}) };
  const ns = { ...(flags["iron-hills-system"] ?? {}) };
  flags["iron-hills-system"] = {
    ...ns,
    generated: true,
    generatedType: type,
    ...(options.source ? { generatedSource: options.source } : {}),
  };
  return flags;
}

function finalizeGeneratedItem(itemData, options = {}) {
  const type = itemData.type ?? "material";
  const system = itemData.system ?? {};
  return normalizeItemDataForInventory({
    ...itemData,
    img: itemData.img ?? generatedItemImage(type, system, options),
    flags: generatedFlags(type, options),
    system,
  }, { quantity: system.quantity });
}

/** Бонусы качества крафта: ~10% / 20% / 30% к урону и физ./маг. броне (мин. +1 где применимо). */
export function applyCraftQualityBonuses(resultType, system, quality) {
  if (!system) return system;
  const pct = quality === "fine" ? 0.1 : quality === "masterwork" ? 0.2 : quality === "legendary" ? 0.3 : 0;
  if (pct <= 0) return system;

  if (resultType === "weapon") {
    const d = Number(system.damage ?? 0);
    system.damage = d + Math.max(1, Math.round(d * pct));
    return system;
  }

  if (resultType === "armor") {
    const raw = system.protection && typeof system.protection === "object"
      ? system.protection
      : null;
    const bp = Number(raw?.physical ?? system.resist?.physical ?? system.protection?.physical ?? 0);
    const bm = Number(raw?.magical ?? system.resist?.magical ?? system.protection?.magical ?? 0);
    const addP = Math.max(1, Math.round(bp * pct));
    const addM = bm > 0 ? Math.max(1, Math.round(bm * pct))
      : (quality === "legendary" ? Math.max(1, Math.round(bp * 0.1)) : 0);
    system.protection = {
      ...(raw && typeof raw === "object" ? { ...raw } : {}),
      physical: bp + addP,
      magical: bm + addM,
    };
    if (system.resist !== undefined) delete system.resist;
    return system;
  }

  return system;
}

export function makeName() {
  return `${choice(NAME_FIRST)} ${choice(NAME_LAST)}`;
}

export function getRecipeQualityByMargin(margin) {
  if (margin >= 9) return "legendary";
  if (margin >= 6) return "masterwork";
  if (margin >= 3) return "fine";
  return "common";
}

export function getQualityLabel(quality) {
  const labels = {
    common: "Обычное",
    fine: "Хорошее",
    masterwork: "Мастерское",
    legendary: "Легендарное"
  };
  return labels[quality] ?? quality;
}

export function relationTypeLabel(type) {
  const labels = {
    settlement: "Поселение",
    faction: "Фракция"
  };
  return labels[type] ?? type ?? "Связь";
}

export function getRelationsForCharacter(characterName, characterId = null) {
  return game.actors
    .filter(a => a.type === "relation")
    .filter(a => {
      // Приоритет: по ID, потом по имени
      if (characterId && a.system.info?.characterId)
        return a.system.info.characterId === characterId;
      return (a.system.info?.characterName || "") === characterName;
    })
    .sort((a, b) => {
      const at = a.system.info?.targetType || "";
      const bt = b.system.info?.targetType || "";
      if (at !== bt) return at.localeCompare(bt, "ru");
      return (a.system.info?.targetName || "").localeCompare(b.system.info?.targetName || "", "ru");
    });
}

export function splitRelationsSummary(relations) {
  return {
    settlements: relations.filter(r => r.targetTypeRaw === "settlement"),
    factions: relations.filter(r => r.targetTypeRaw === "faction")
  };
}

export function buildRelationsSummary(actor) {
  const relations = getRelationsForCharacter(actor.name);

  return relations.map(r => {
    const score = Number(r.system.info?.score ?? 0);
    const pct   = Math.round(Math.min(100, Math.max(0, (score + 100) / 2)));
    return {
      id: r.id,
      targetTypeRaw: r.system.info?.targetType || "",
      targetType: relationTypeLabel(r.system.info?.targetType || ""),
      targetName: r.system.info?.targetName || "—",
      score,
      tier:     r.system.info?.tier  || "neutral",
      notes:    r.system.info?.notes || "",
      relPct:   pct,
      relLeft:  pct < 50 ? pct : 50,
      relationPositive: score > 0,
    };
  });
}

export function buildWeapon(name, tier, opts = {}) {
  const skill = opts.skill ?? "sword";
  const clean = cleanTier(tier);
  const twoHanded = Boolean(opts.twoHanded ?? false);
  const system = withGeneratedItemDefaults("weapon", {
    tier: clean,
    quality: opts.quality ?? "common",
    weight: cleanPositiveNumber(opts.weight, twoHanded ? 3 : 2),
    quantity: opts.quantity ?? 1,
    damage: opts.damage ?? (2 + clean),
    damageType: opts.damageType ?? "physical",
    skill,
    twoHanded,
    energyCost: opts.energyCost ?? (8 + clean),
    timeCost: opts.timeCost ?? 2.0,
    actionSeconds: opts.actionSeconds ?? 3,
    range: opts.range ?? getDefaultWeaponRange(skill),
    durability: durabilityFor("weapon", clean, opts.durability),
    affixes: {
      ignoreArmor:        Number(opts.affixes?.ignoreArmor        ?? 0),
      disarmChance:       Number(opts.affixes?.disarmChance       ?? 0),
      stunChance:         Number(opts.affixes?.stunChance         ?? 0),
      bleedingBonus:      Number(opts.affixes?.bleedingBonus      ?? 0),
      lifeSteal:          Number(opts.affixes?.lifeSteal          ?? 0),
      executeBelowHp:     Number(opts.affixes?.executeBelowHp     ?? 0),
      criticalDamageMult: Number(opts.affixes?.criticalDamageMult ?? 1),
    },
    value: opts.value,
  });

  return finalizeGeneratedItem({
    name,
    type: "weapon",
    system
  }, opts);
}

export function buildArmor(name, tier, slot, physical, magical = 0, weight = 2, opts = {}) {
  const clean = cleanTier(tier);
  const system = withGeneratedItemDefaults("armor", {
    tier: clean,
    quality: opts.quality ?? "common",
    weight: cleanPositiveNumber(opts.weight ?? weight, weight),
    quantity: opts.quantity ?? 1,
    slot,
    protection: {
      physical,
      magical
    },
    durability: durabilityFor("armor", clean, opts.durability),
    covers: opts.covers ?? ARMOR_SLOT_COVERS[slot] ?? ["torso"],
    layer: opts.layer ?? "outer",
    value: opts.value,
  });

  return finalizeGeneratedItem({
    name,
    type: "armor",
    system
  }, opts);
}

export function buildFood(name, tier, satiety, hydration, weight = 1, quantity = 1, opts = {}) {
  const system = withGeneratedItemDefaults("food", {
    tier,
    quality: opts.quality ?? "common",
    weight: cleanPositiveNumber(opts.weight ?? weight, weight),
    quantity,
    satiety,
    hydration,
    value: opts.value,
  });

  return finalizeGeneratedItem({
    name,
    type: "food",
    system
  }, opts);
}

export function buildPotion(name, tier, effectType, power, targetPart = "torso", quantity = 1, opts = {}) {
  const system = normalizeItemActionSystem(withGeneratedItemDefaults("potion", {
    tier,
    quality: opts.quality ?? "common",
    weight: cleanPositiveNumber(opts.weight, 0.3),
    quantity,
    effect: effectType,
    effectType,
    power,
    targetPart,
    value: opts.value,
  }), { type: "potion", targetPart, ensurePower: true, fallbackPower: 5 });

  return finalizeGeneratedItem({
    name,
    type: "potion",
    system
  }, opts);
}

export function buildScroll(name, tier, school, effectType, power, targetPart = "torso", opts = {}) {
  const schoolKey = normalizeSpellSchoolKey(school, { fallback: "light" });
  const system = normalizeItemActionSystem(withGeneratedItemDefaults("scroll", {
    tier,
    quality: opts.quality ?? "common",
    weight: cleanPositiveNumber(opts.weight, 0.1),
    quantity: opts.quantity ?? 1,
    school: schoolKey,
    rank: opts.rank ?? tier,
    effectType,
    damageType: opts.damageType ?? "magical",
    power,
    manaCost: opts.manaCost ?? 0,
    energyCost: opts.energyCost ?? 0,
    targetPart,
    actionType: opts.actionType ?? "",
    applicationScope: opts.applicationScope ?? "",
    targetActorMode: opts.targetActorMode ?? "",
    value: opts.value,
  }), { type: "scroll", targetPart, ensurePower: true, fallbackPower: 5 });

  return finalizeGeneratedItem({
    name,
    type: "scroll",
    system
  }, opts);
}

export function buildSpell(name, tier, school, effectType, power, targetPart = "torso", opts = {}) {
  const schoolKey = normalizeSpellSchoolKey(school, { fallback: "light" });
  const hasDamage = effectType === "damage" || Number(opts.damage ?? 0) > 0;
  const damage = hasDamage ? Number(opts.damage ?? power ?? 0) : Number(opts.damage ?? 0);
  const runtimeSystem = buildSpellItemSystemData({
    id: opts.spellId ?? "",
    label: name,
    tier,
    school: schoolKey,
    rank: opts.rank ?? tier,
    effectType,
    damage,
    damageType: opts.damageType ?? "magical",
    power,
    manaCost: opts.manaCost ?? 0,
    energyCost: opts.energyCost ?? 0,
    castTime: opts.castTime ?? 0,
    targetPart,
    targetZone: opts.targetZone ?? "",
    friendlyFire: Boolean(opts.friendlyFire ?? opts.aoe?.friendlyFire ?? false),
    friendlyFireMode: opts.aoe?.friendlyFireMode ?? opts.friendlyFireMode ?? "off",
    effect: opts.effect ?? null,
    aoe: opts.aoe ?? null,
    desc: opts.desc ?? "",
    value: opts.value,
    weight: opts.weight,
    quantity: opts.quantity ?? 1,
  }, { quantity: opts.quantity ?? 1 });
  const system = withGeneratedItemDefaults("spell", {
    ...runtimeSystem,
    tier,
    quality: opts.quality ?? "common",
    weight: cleanPositiveNumber(opts.weight, 0),
    quantity: opts.quantity ?? 1,
    value: opts.value ?? runtimeSystem.value,
  });

  return finalizeGeneratedItem({
    name,
    type: "spell",
    system
  }, opts);
}

export function buildThrowable(name, tier, power, damageType = "physical", poison = 0, burning = 0, targetPart = "torso", quantity = 1, options = {}) {
  const system = normalizeThrowableSystem(withGeneratedItemDefaults("throwable", {
      tier,
      quality: options.quality ?? "common",
      weight: cleanPositiveNumber(options.weight, 1),
      quantity,
      effectType: "damage",
      damageType,
      power,
      energyCost: options.energyCost ?? (8 + cleanTier(tier)),
      targetPart,
      targetZone: "",
      friendlyFire: false,
      friendlyFireMode: options.friendlyFireMode,
      aoe: options.aoe ?? null,
      appliesPoison: poison,
      appliesBurning: burning,
      value: options.value,
    }), {
      tier,
      fallbackPower: 2,
      ensurePower: true,
      ensureAoeObject: true,
    });

  return finalizeGeneratedItem({
    name,
    type: "throwable",
    system
  }, options);
}

export function buildConsumable(name, tier, effectType, power, quantity = 1, opts = {}) {
  const system = normalizeItemActionSystem(withGeneratedItemDefaults("consumable", {
    tier,
    quality: opts.quality ?? "common",
    weight: cleanPositiveNumber(opts.weight, 0.5),
    quantity,
    effectType,
    effect: opts.effect ?? effectType,
    actionType: opts.actionType ?? "",
    applicationScope: opts.applicationScope ?? "",
    targetActorMode: opts.targetActorMode ?? "",
    targetPart: opts.targetPart ?? "",
    power,
    value: opts.value,
  }), { type: "consumable", targetPart: opts.targetPart ?? "", ensurePower: true, fallbackPower: 1 });
  system.weight = cleanPositiveNumber(opts.weight, DEFAULT_CONSUMABLE_WEIGHTS[system.actionType] ?? 0.5);

  return finalizeGeneratedItem({
    name,
    type: "consumable",
    system
  }, opts);
}

export function buildMaterial(name, tier, category, quantity = 1, weight = 1, opts = {}) {
  const system = withGeneratedItemDefaults("material", {
    tier,
    weight: cleanPositiveNumber(opts.weight ?? weight, weight),
    quantity,
    category,
    quality: opts.quality ?? "common",
    value: opts.value,
  });

  return finalizeGeneratedItem({
    name,
    type: "material",
    system
  }, opts);
}

export function buildResource(name, tier, category, quantity = 1, weight = 1, opts = {}) {
  const system = withGeneratedItemDefaults("resource", {
    tier,
    weight: cleanPositiveNumber(opts.weight ?? weight, weight),
    quantity,
    category,
    quality: opts.quality ?? "common",
    value: opts.value,
  });

  return finalizeGeneratedItem({
    name,
    type: "resource",
    system
  }, opts);
}

export function buildTool(name, tier, craftType, quantity = 1, opts = {}) {
  const clean = cleanTier(tier);
  const system = withGeneratedItemDefaults("tool", {
    tier: clean,
    quality: opts.quality ?? "common",
    weight: cleanPositiveNumber(opts.weight, 2),
    quantity,
    craftType,
    durability: durabilityFor("tool", clean, opts.durability),
    value: opts.value,
  });

  return finalizeGeneratedItem({
    name,
    type: "tool",
    system
  }, opts);
}

function catalogRows(rows) {
  return Object.values(rows ?? {}).filter((row) => row?.id);
}

function catalogTier(row) {
  return cleanTier(row?.tier ?? row?.rank ?? 1);
}

function closestCatalogRow(rows, tier, predicate = () => true) {
  const target = cleanTier(tier);
  return catalogRows(rows)
    .filter((row) => {
      try {
        return predicate(row);
      } catch (_err) {
        return false;
      }
    })
    .sort((a, b) => {
      const at = catalogTier(a);
      const bt = catalogTier(b);
      return Math.abs(at - target) - Math.abs(bt - target)
        || at - bt
        || Number(a.value ?? 0) - Number(b.value ?? 0)
        || String(a.id).localeCompare(String(b.id));
    })[0] ?? null;
}

function pushCatalogItem(out, type, rowOrId, quantity = 1, options = {}) {
  const catalogId = typeof rowOrId === "string" ? rowOrId : rowOrId?.id;
  if (!catalogId) return null;

  const itemData = itemDataFromLootLine({
    type,
    catalogId,
    qty: cleanQuantity(quantity),
    initialCharges: options.initialCharges ?? null,
  });
  if (itemData) out.push(itemData);
  return itemData;
}

function pushCatalogByTier(out, type, rows, tier, predicate = () => true, quantity = 1, options = {}) {
  const row = closestCatalogRow(rows, tier, predicate);
  return pushCatalogItem(out, type, row, quantity, options);
}

const hasCategory = (category) => (row) => String(row?.category ?? "") === category;
const hasEffect = (effect) => (row) => String(row?.effect ?? row?.effectType ?? "") === effect;
const hasDamageType = (damageType) => (row) => String(row?.damageType ?? row?.system?.damageType ?? "") === damageType;
const hasSkill = (skill) => (row) => String(row?.skill ?? "") === skill;
const hasSlot = (slot) => (row) => String(row?.slot ?? "") === slot;

function idIncludes(...needles) {
  return (row) => {
    const id = String(row?.id ?? "").toLowerCase();
    return needles.some((needle) => id.includes(String(needle).toLowerCase()));
  };
}

export function randomMerchantStock(specialty, tier) {
  const t = cleanTier(tier);
  const stock = [];

  if (specialty === "general") {
    pushCatalogItem(stock, "food", t >= 3 ? "trail_rations" : "bread", randInt(2, 6));
    pushCatalogItem(stock, "food", "well_water_skin", randInt(1, 3));
    pushCatalogByTier(stock, "potion", POTIONS, t, hasEffect("restoreEnergy"), randInt(1, 3));
    pushCatalogByTier(stock, "material", MATERIALS, t, hasCategory("fiber"), randInt(2, 5));
    pushCatalogItem(stock, "material", "rope", 1);
    pushCatalogItem(stock, "consumable", "field_bandage", randInt(2, 5));
    pushCatalogItem(stock, "consumable", "tourniquet", randInt(1, 2));
    pushCatalogItem(stock, "consumable", t >= 2 ? "clean_dressing" : "antiseptic_wash", randInt(1, 3));
  }

  if (specialty === "blacksmith") {
    pushCatalogByTier(stock, "weapon", WEAPONS, t, hasSkill("sword"));
    pushCatalogByTier(stock, "weapon", WEAPONS, t, hasSkill("spear"));
    pushCatalogByTier(stock, "armor", ARMORS, t, hasSlot("torso"));
    pushCatalogByTier(stock, "material", MATERIALS, t, hasCategory("metal"), randInt(3, 8));
    pushCatalogByTier(stock, "tool", TOOLS, t, (row) => row?.craftType === "blacksmithing");
  }

  if (specialty === "alchemist") {
    pushCatalogByTier(stock, "potion", POTIONS, t, hasEffect("healHP"), randInt(1, 3));
    pushCatalogByTier(stock, "potion", POTIONS, t, hasEffect("restoreMana"), randInt(1, 3));
    pushCatalogByTier(stock, "potion", POTIONS, t, hasEffect("curePoison"), randInt(1, 3));
    pushCatalogByTier(stock, "material", MATERIALS, t, hasCategory("herb"), randInt(3, 8));
    pushCatalogItem(stock, "material", "oil_flask", randInt(1, 2));
    pushCatalogByTier(stock, "throwable", THROWABLES, t, (row) => ["fire", "poison", "ice", "lightning", "holy", "shadow", "true"].includes(String(row?.damageType ?? "")), randInt(1, 2));
    pushCatalogByTier(stock, "tool", TOOLS, t, (row) => row?.craftType === "alchemy");
    pushCatalogItem(stock, "consumable", t >= 4 ? "surgical_kit" : "hemostatic_pack", 1);
    pushCatalogItem(stock, "consumable", t >= 4 ? "battle_stimulant" : "clotting_powder", 1);
  }

  if (specialty === "hunter") {
    pushCatalogByTier(stock, "weapon", WEAPONS, t, hasSkill("throwing"));
    pushCatalogByTier(stock, "throwable", THROWABLES, t, hasDamageType("physical"), randInt(1, 3));
    pushCatalogItem(stock, "food", "dried_meat", randInt(2, 5));
    pushCatalogByTier(stock, "material", MATERIALS, t, hasCategory("hide"), randInt(2, 5));
    pushCatalogItem(stock, "material", "beast_sinew_spool", randInt(1, 3));
    pushCatalogItem(stock, "material", "rope", 1);
    pushCatalogItem(stock, "consumable", t >= 3 ? "bone_pin_splint" : "splint", randInt(1, 2));
  }

  if (specialty === "innkeeper") {
    pushCatalogItem(stock, "food", "cooked_stew", randInt(2, 5));
    pushCatalogItem(stock, "food", "field_stew", randInt(1, 3));
    pushCatalogByTier(stock, "food", FOOD, t, (row) => Number(row?.hydration ?? 0) >= 20, randInt(2, 5));
    pushCatalogByTier(stock, "food", FOOD, t, (row) => Number(row?.satiety ?? 0) >= 35, randInt(1, 3));
    pushCatalogItem(stock, "consumable", "clean_dressing", randInt(1, 3));
  }

  return stock.filter(Boolean);
}

export function randomContainerLoot(theme, tier) {
  const t = cleanTier(tier);
  const loot = [];

  if (theme === "bandit") {
    pushCatalogByTier(loot, "weapon", WEAPONS, t, hasSkill("knife"));
    pushCatalogItem(loot, "food", "bread", randInt(1, 3));
    pushCatalogItem(loot, "material", "rope", 1);
    pushCatalogByTier(loot, "weapon", WEAPONS, t, hasSkill("throwing"));
    pushCatalogByTier(loot, "throwable", THROWABLES, t, hasDamageType("physical"), randInt(1, 2));
    pushCatalogItem(loot, "consumable", "field_bandage", randInt(1, 2));
  }

  if (theme === "ruins") {
    pushCatalogByTier(loot, "potion", POTIONS, t, hasEffect("restoreMana"));
    pushCatalogItem(loot, "food", "well_water_skin", randInt(1, 2));
    pushCatalogByTier(loot, "material", MATERIALS, t, hasCategory("wood"), randInt(1, 4));
    pushCatalogByTier(loot, "material", MATERIALS, t, hasCategory("stone"), randInt(1, 4));
    pushCatalogByTier(loot, "material", MATERIALS, t, idIncludes("mana", "crystal", "quartz"));
    if (t >= 3) pushCatalogByTier(loot, "throwable", THROWABLES, t, (row) => ["lightning", "shadow", "holy", "true"].includes(String(row?.damageType ?? "")));
  }

  if (theme === "hunter") {
    pushCatalogItem(loot, "food", "dried_meat", randInt(1, 3));
    pushCatalogByTier(loot, "material", MATERIALS, t, hasCategory("hide"), randInt(1, 3));
    pushCatalogItem(loot, "food", "well_water_skin", randInt(1, 2));
    pushCatalogItem(loot, "material", "beast_sinew_spool", randInt(1, 2));
    pushCatalogByTier(loot, "throwable", THROWABLES, t, hasDamageType("physical"), randInt(1, 2));
  }

  if (theme === "alchemy") {
    pushCatalogByTier(loot, "potion", POTIONS, t, hasEffect("healHP"), randInt(1, 2));
    pushCatalogByTier(loot, "potion", POTIONS, t, hasEffect("curePoison"), randInt(1, 2));
    pushCatalogByTier(loot, "material", MATERIALS, t, hasCategory("herb"), randInt(2, 4));
    pushCatalogItem(loot, "material", "oil_flask", randInt(1, 2));
    pushCatalogByTier(loot, "throwable", THROWABLES, t, (row) => ["fire", "poison", "ice", "lightning"].includes(String(row?.damageType ?? "")));
    pushCatalogByTier(loot, "tool", TOOLS, t, (row) => row?.craftType === "alchemy");
    pushCatalogItem(loot, "consumable", t >= 4 ? "trauma_kit" : "hemostatic_pack", 1);
    if (t >= 3) pushCatalogItem(loot, "consumable", "painkiller_draught", 1);
  }

  if (theme === "military") {
    pushCatalogByTier(loot, "weapon", WEAPONS, t, hasSkill("spear"));
    pushCatalogByTier(loot, "weapon", WEAPONS, t, hasSkill("crossbow"));
    pushCatalogByTier(loot, "armor", ARMORS, t, hasSlot("torso"));
    pushCatalogByTier(loot, "armor", ARMORS, t, hasSlot("head"));
    pushCatalogByTier(loot, "material", MATERIALS, t, hasCategory("metal"), randInt(2, 5));
    pushCatalogByTier(loot, "tool", TOOLS, t, (row) => row?.craftType === "blacksmithing");
    pushCatalogItem(loot, "consumable", "field_bandage", randInt(1, 3));
    pushCatalogItem(loot, "consumable", "splint", 1);
    pushCatalogByTier(loot, "throwable", THROWABLES, t, (row) => ["physical", "fire"].includes(String(row?.damageType ?? "")), randInt(1, 2));
  }

  if (!loot.length) {
    pushCatalogItem(loot, "food", "trail_rations", randInt(1, 2));
    pushCatalogItem(loot, "food", "well_water_skin", 1);
    pushCatalogItem(loot, "consumable", "field_bandage", randInt(1, 2));
    pushCatalogByTier(loot, "material", MATERIALS, t, hasCategory("fiber"), randInt(1, 3));
  }

  return loot.filter(Boolean);
}

/**
 * Просные вещи в карманах / сумке случайного NPC (еда/материалы из каталога).
 * Вызывается генератором мира после ролевых предметов.
 */
export function buildPoiLootItems(theme, tier) {
  const t = cleanTier(tier);
  const source = { source: "poi-loot" };
  const themeDef = WORLD_CONTENT_POI_THEMES[theme] ?? null;

  if (themeDef?.lootTheme) return randomContainerLoot(themeDef.lootTheme, t);
  if (themeDef?.lootKind === "mystic") {
    return [
      buildScroll("Свиток искры", t, "fire", "damage", 2 + t, "torso", {
        ...source,
        spellId: "poi_spark_scroll",
      }),
      buildPotion("Малое зелье маны", t, "restoreMana", 8 + t * 2, "torso", 1, source),
      buildMaterial("Лунная пыль", t, "herb", randInt(1, 3), 1, source),
    ];
  }

  return [
    buildFood("Сухари", t, 10, 0, 1, randInt(1, 2), source),
    buildMaterial("Старая верёвка", t, "fiber", randInt(1, 2), 1, source),
  ];
}

export function buildNpcCarryInventoryItems(roleKey, tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  const out = [];
  const push = (type, catalogId, qty) => {
    const q = Math.max(1, Number(qty) || 1);
    const d = itemDataFromLootLine({ type, catalogId, qty: q });
    if (d) out.push(d);
  };

  push("food", "bread", randInt(1, 2));
  if (t >= 3) push("food", "trail_rations", 1);

  switch (roleKey) {
    case "villager":
      push("material", "cloth", randInt(1, 2));
      push("material", "herb_common", randInt(1, 2));
      break;
    case "guard":
      push("material", "tin_ore", randInt(1, 2));
      push("material", "tanned_leather", 1);
      if (t >= 4) push("material", "iron_ore", 1);
      push("consumable", "field_bandage", 1);
      break;
    case "bandit":
      push("food", "dried_meat", 1);
      push("material", "rope", 1);
      push("material", "copper_ore", randInt(1, 2));
      push("throwable", t >= 2 ? "clay_shrapnel_pot" : "throwing_knife_bundle", randInt(1, 2));
      break;
    case "mage":
      push("material", "herb_healing", randInt(1, 2));
      if (t >= 5) push("material", "mana_stone", 1);
      if (t >= 7) push("material", "quartz", randInt(1, 3));
      if (t >= 3) push("throwable", "thunderstone", 1);
      break;
    case "crafter":
      push("material", "tanned_leather", randInt(1, 2));
      push("material", "copper_ingot", 1);
      break;
    case "hunter":
      push("food", "trail_rations", randInt(1, 2));
      push("material", "rope", randInt(1, 2));
      push("throwable", "throwing_knife_bundle", randInt(1, 2));
      break;
    case "noble":
      push("material", "cloth", randInt(2, 4));
      if (t >= 8) push("material", "mana_crystal", 1);
      break;
    case "priest":
      push("material", "herb_healing", randInt(1, 3));
      break;
    default:
      break;
  }

  return out;
}

export function buildNpcRoleEquipmentItems(roleKey, tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  const source = { source: "npc-role-equipment" };

  switch (roleKey) {
    case "guard":
      return [
        buildWeapon("Служебный меч", t, {
          ...source,
          skill: "sword",
          damage: 2 + t,
          weight: 3,
        }),
        buildArmor("Стёганка стражи", t, "torso", 1 + t, 0, 4, source),
      ];
    case "bandit":
      return [
        buildWeapon("Ржавый нож", t, {
          ...source,
          skill: "knife",
          damage: 1 + t,
          weight: 1,
        }),
        buildThrowable("Метательный нож", t, 2 + t, "physical", 0, 0, "torso", randInt(1, 3), {
          ...source,
          weight: 0.2,
        }),
      ];
    case "mage":
      return [
        buildSpell("Искра", t, "fire", "damage", 2 + t, "torso", {
          ...source,
          spellId: "npc_spark",
          manaCost: 8,
        }),
      ];
    case "crafter":
      return [
        buildWeapon("Рабочий молот", t, {
          ...source,
          skill: "mace",
          damage: 2 + t,
          weight: 4,
        }),
      ];
    case "hunter":
      return [
        buildWeapon("Охотничий лук", t, {
          ...source,
          skill: "bow",
          damage: 2 + t,
          weight: 2,
          energyCost: 8 + t,
          range: 8,
        }),
        buildWeapon("Разделочный нож", t, {
          ...source,
          skill: "knife",
          damage: 1 + t,
          weight: 1,
        }),
        buildThrowable("Метательный нож", t, 2 + t, "physical", 0, 0, "torso", randInt(2, 4), {
          ...source,
          weight: 0.2,
        }),
      ];
    case "noble":
      return [
        buildWeapon("Кортик чести", t, {
          ...source,
          skill: "knife",
          damage: 1 + t,
          weight: 1,
        }),
      ];
    case "priest":
      return [
        buildPotion("Флакон благодати", t, "healHP", 6 + t * 2, "torso", 1, source),
      ];
    default:
      return [];
  }
}

export function buildNpcStartingInventoryItems(roleKey, tier, options = {}) {
  const includeEquipment = options.includeEquipment !== false;
  const includeCarry = options.includeCarry !== false;
  return [
    ...(includeEquipment ? buildNpcRoleEquipmentItems(roleKey, tier) : []),
    ...(includeCarry ? buildNpcCarryInventoryItems(roleKey, tier) : []),
  ].filter(Boolean);
}

export function buildNpcSystem(roleKey, tier, faction) {
  const profile = NPC_SPECIALIZATIONS[roleKey] ?? NPC_SPECIALIZATIONS.villager;
  const t = Math.max(1, Math.min(10, Number(tier) || 1));

  const skills = Object.fromEntries(
    SKILLS_FLAT.map((s) => [s.key, { value: 1, exp: 0, expNext: 25 }])
  );

  for (const [sk, val] of Object.entries(profile.skills ?? {})) {
    const skillKey = normalizeSpellSchoolKey(sk, { fallback: sk });
    if (skills[skillKey]) skills[skillKey].value = val + Math.max(0, t - 1);
  }

  const hpScale = 1 + 0.09 * Math.max(0, t - 1);
  const partStatus = () => ({
    minorBleeding: 0,
    majorBleeding: 0,
    fracture: false,
    destroyed: false,
    splinted: false,
    tourniquet: false
  });
  const part = (n) => ({
    value: Math.round(n * hpScale),
    max: Math.round(n * hpScale),
    status: partStatus()
  });

  const eMax = Math.min(100, (profile.energy ?? 10) + t * 5);
  const priestOrMage = roleKey === "mage" || roleKey === "priest";
  const mMax = Math.min(
    100,
    (profile.mana ?? 2) + (priestOrMage ? t * 4 : Math.floor(t / 2))
  );

  return {
    resources: {
      hp: {
        head: part(35),
        torso: part(85),
        abdomen: part(70),
        leftArm: part(60),
        rightArm: part(60),
        leftLeg: part(65),
        rightLeg: part(65),
      },
      energy: { value: eMax, max: eMax },
      mana: { value: mMax, max: mMax },
      satiety: { value: 100, max: 100 },
      hydration: { value: 100, max: 100 },
      weight: { value: 0, max: 20 + t * 2 }
    },
    conditions: {
      bleeding: 0,
      shock: 0,
      poison: 0,
      burning: 0,
      fractures: {
        leftArm: false,
        rightArm: false,
        leftLeg: false,
        rightLeg: false
      }
    },
    combat: {
      defense: (profile.defense ?? 0) + Math.max(0, t - 1),
      unarmedDamage: 5 + 5 * Math.floor(t / 3),
    },
    equipment: {
      rightHand: "",
      leftHand: "",
      armorHead: "",
      armorTorso: "",
      armorArms: "",
      armorLegs: ""
    },
    quickSlots: {
      unlocked: 2,
      slot1: "",
      slot2: "",
      slot3: "",
      slot4: "",
      slot5: "",
      slot6: ""
    },
    info: {
      role: profile.label,
      specialization: roleKey,
      faction: faction ?? "",
      tier: t,
      desc: "",
      lootTable: "",
      allowPickpocket: true,
      pickpocketTable: "",
      bestiaryId: "",
    },
    economy: {
      coins: 10 + t * 25
    },
    skills
  };
}

export function buildNpcActorData(roleKey, tier, faction = "", options = {}) {
  const resolvedRole = NPC_SPECIALIZATIONS[roleKey] ? roleKey : "villager";
  const profile = NPC_SPECIALIZATIONS[resolvedRole] ?? NPC_SPECIALIZATIONS.villager;
  return {
    roleKey: resolvedRole,
    data: {
      name: options.name ?? `${profile.label} ${makeName()}`,
      type: "npc",
      system: buildNpcSystem(resolvedRole, tier, faction),
    },
  };
}

export function resolvePoiNpcRoleKey(theme) {
  return WORLD_CONTENT_POI_THEMES[theme]?.npcRole ?? null;
}

export function buildPoiNpcActorData(theme, tier, faction = "", options = {}) {
  const roleKey = resolvePoiNpcRoleKey(theme);
  if (!roleKey) return null;
  const labels = {
    bandit: "Бандит",
    hunter: "Охотник",
    guard: "Страж",
    mage: "Мистик",
  };
  return {
    roleKey,
    data: {
      name: options.name ?? `${labels[roleKey] ?? "NPC"} ${makeName()}`,
      type: "npc",
      system: buildNpcSystem(roleKey, tier, faction),
    },
  };
}

export function makeSettlementEvent(actor) {
  const p = Number(actor.system.info.prosperity ?? 5);
  const d = Number(actor.system.info.danger ?? 5);
  const s = Number(actor.system.info.supply ?? 5);

  if (d >= 8) {
    return choice([
      "На тракте замечены вооружённые налётчики.",
      "В окрестностях пропадают люди и вьючные животные.",
      "Ночная стража просит о подкреплении."
    ]);
  }

  if (p >= 8) {
    return choice([
      "В поселение прибыло больше торговцев, чем обычно.",
      "Местные мастера начали расширять мастерские.",
      "На рынке появились редкие и качественные товары."
    ]);
  }

  if (s <= 3) {
    return choice([
      "На складе заканчиваются запасы зерна и соли.",
      "Жители жалуются на нехватку воды и дров.",
      "Цены на еду заметно выросли."
    ]);
  }

  return choice([
    "Неделя прошла спокойно, но слухи множатся.",
    "Несколько путников принесли противоречивые новости.",
    "На окраинах видели незнакомый лагерь.",
    "Ремесленники спорят о ценах и поставках.",
    "Охотники сообщают о следах крупного зверя."
  ]);
}

export function makeSettlementRumor(actor) {
  const name = actor.name;
  const d = Number(actor.system.info.danger ?? 5);
  const p = Number(actor.system.info.prosperity ?? 5);

  if (d >= 8) {
    return choice([
      `Говорят, что рядом с ${name} собирается новая банда.`,
      `Ходит слух, что дороги возле ${name} скоро станут совсем опасными.`,
      `Люди шепчутся о ночных кострах в лесу возле ${name}.`
    ]);
  }

  if (p >= 8) {
    return choice([
      `Говорят, что в ${name} можно выгодно сбыть товар.`,
      `Шепчутся, будто в ${name} появился богатый покровитель ремесленников.`,
      `Путники рассказывают, что у рынка ${name} хороший сезон.`
    ]);
  }

  return choice([
    `Слух идёт, что в ${name} ищут работников и наёмников.`,
    `Говорят, что в ${name} появился новый торговец с редким товаром.`,
    `Ходит слух, что рядом с ${name} нашли старые руины.`,
    `Поговаривают, что в ${name} скоро будет неспокойно.`
  ]);
}

export async function appendSettlementHistory(actor, field, text, limit = 10) {
  const arr = Array.isArray(actor.system.history?.[field]) ? [...actor.system.history[field]] : [];
  arr.unshift(text);
  const trimmed = arr.slice(0, limit);
  await actor.update({
    [`system.history.${field}`]: trimmed
  });
}

export async function consumeRecipeIngredients(actor, ingredients, recipeResultTier = 1) {
  return consumeRecipeIngredientsImpl(actor, ingredients, recipeResultTier);
}
// ─── Контекстные квесты из кризисов ─────────────────────

const CRISIS_QUESTS = {
  "Всплеск бандитизма": [
    {
      title: "Зачистить дорогу",
      description: "На тракте орудует банда. Торговля остановилась — найдите и устраните угрозу.",
      reward: "Плата стражи + доля добычи",
      difficulty: 6, type: "combat"
    },
    {
      title: "Найти логово",
      description: "Бандиты где-то прячутся. Выследите их лагерь и сообщите стражнику.",
      reward: "Награда за информацию",
      difficulty: 5, type: "exploration"
    },
  ],
  "Порча урожая": [
    {
      title: "Найти альтернативные запасы",
      description: "Деревне нужна еда. Найдите торговца или охотничьи угодья в округе.",
      reward: "Бартер + благодарность общины",
      difficulty: 4, type: "social"
    },
    {
      title: "Выяснить причину",
      description: "Урожай гибнет — это болезнь растений, вредители, или чья-то злая воля?",
      reward: "Плата старосты",
      difficulty: 5, type: "investigation"
    },
  ],
  "Военный порядок": [
    {
      title: "Сопроводить отряд",
      description: "Местная стража выходит на патруль. Нужны опытные бойцы для поддержки.",
      reward: "Плата от гарнизона",
      difficulty: 5, type: "combat"
    },
  ],
  "Торговый бум": [
    {
      title: "Охрана каравана",
      description: "Торговцы нанимают охрану для ценного груза. Путь неблизкий.",
      reward: "Хорошая плата монетами",
      difficulty: 4, type: "escort"
    },
  ],
  "Разрушенные дороги": [
    {
      title: "Расчистить завал",
      description: "Дорога непроходима из-за оползня. Нужны руки и инструменты.",
      reward: "Плата от купеческой гильдии",
      difficulty: 3, type: "work"
    },
  ],
  "Поток переселенцев": [
    {
      title: "Найти пропавшую семью",
      description: "Среди беженцев потерялась семья с детьми. Последний раз их видели у развилки.",
      reward: "Благодарность + скромная плата",
      difficulty: 4, type: "investigation"
    },
  ],
};

// Базовые квесты когда нет кризиса
const BASE_QUESTS = [
  {
    title: "Доставить посылку",
    description: "Местный торговец просит передать груз в соседнее поселение.",
    reward: "Плата монетами",
    difficulty: 3, type: "delivery"
  },
  {
    title: "Зачистить подвал",
    description: "В складе завелась нечисть. Хозяин не может добраться до запасов.",
    reward: "Бесплатное жильё + еда",
    difficulty: 4, type: "combat"
  },
  {
    title: "Собрать травы",
    description: "Местный знахарь нуждается в редких растениях из леса.",
    reward: "Зелья и лекарства",
    difficulty: 3, type: "exploration"
  },
  {
    title: "Разобраться в споре",
    description: "Два торговца поспорили о сделке. Нужен честный арбитр.",
    reward: "Уважение обоих + плата",
    difficulty: 3, type: "social"
  },
  {
    title: "Найти пропавшего",
    description: "Шахтёр не вернулся с работы. Семья в отчаянии.",
    reward: "Всё что было при пропавшем",
    difficulty: 5, type: "investigation"
  },
];

export function generateQuestForSettlement(settlement) {
  const crisis = settlement.system?.regionSim?.activeCrisis ?? "";
  const danger = Number(settlement.system?.info?.danger ?? 5);
  const name   = settlement.name;

  const pool = CRISIS_QUESTS[crisis] ?? BASE_QUESTS;
  const base = pool[Math.floor(Math.random() * pool.length)];

  return {
    ...base,
    location:    name,
    settlementId: settlement.id,
    generated:   new Date().toISOString(),
    // Сложность растёт с опасностью
    difficulty: Math.min(10, (base.difficulty ?? 4) + Math.floor(Math.max(0, danger - 5) / 2)),
  };
}

// Контекстные имена по культуре региона
const REGIONAL_NAMES = {
  nordic: {
    first: ["Бьорн", "Хельга", "Торвен", "Эйрик", "Сигрун", "Ульф", "Рагна", "Кнут", "Фрея", "Лейф"],
    last:  ["Железный", "Северный", "Каменный", "Снежный", "Грозный", "Скальный", "Волчий"],
  },
  slavic: {
    first: ["Богдан", "Светлана", "Ждан", "Мирослав", "Добрыня", "Людмила", "Радомир", "Велена"],
    last:  ["Кузнецов", "Речной", "Холмский", "Медный", "Воронов", "Болотный", "Старков"],
  },
  common: {
    first: ["Арен", "Кир", "Леон", "Нор", "Тален", "Эрвин", "Юран", "Велан", "Дарен", "Зор"],
    last:  ["Серый", "Долинный", "Лесной", "Горный", "Дымов", "Охотников", "Пепельный"],
  },
};

export function makeContextualName(culture = "common", gender = null) {
  const names = REGIONAL_NAMES[culture] ?? REGIONAL_NAMES.common;
  const first = names.first[Math.floor(Math.random() * names.first.length)];
  const last  = names.last[Math.floor(Math.random() * names.last.length)];
  return `${first} ${last}`;
}

// Товары торговца из реального supply поселения
export function getContextualMerchantStock(settlement, specialty, tier = 1) {
  const supply     = Number(settlement?.system?.info?.supply ?? 5);
  const danger     = Number(settlement?.system?.info?.danger ?? 5);
  const prosperity = Number(settlement?.system?.info?.prosperity ?? 5);

  // Базовый список + контекстные бонусы
  const items = randomMerchantStock(specialty, tier);

  // При хорошем снабжении — больше еды и материалов
  if (supply >= 7 && (specialty === "general" || specialty === "innkeeper")) {
    items.push(buildFood("Свежий хлеб", tier, 8, 5, 0.3));
    items.push(buildFood("Копчёное мясо", tier, 15, 3, 0.8));
  }

  // При высокой опасности — больше оружия
  if (danger >= 7 && (specialty === "blacksmith" || specialty === "general")) {
    items.push(buildWeapon("Простой нож", 1, { skill: "knife", damage: 2, weight: 0.5 }));
  }

  // При процветании — редкие товары
  if (prosperity >= 8) {
    items.push(buildPotion("Зелье бодрости", tier, "restoreEnergy", tier * 3, "torso", 1));
  }

  return items;
}
