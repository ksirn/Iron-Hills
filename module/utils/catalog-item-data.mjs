import { getComputedItemUnitPrice, getDefaultWeaponRange } from "./item-utils.mjs";
import {
  normalizeItemActionSystem,
  normalizeThrowableSystem,
} from "./item-runtime-normalization.mjs";
import {
  SPELL_SCHOOL_IMAGES,
  buildSpellItemSystemData,
} from "../services/spell-runtime-service.mjs";
import { normalizeDamageType } from "../services/damage-type-service.mjs";

const DEFAULT_WEAPON_IMG = Object.freeze({
  sword: "icons/weapons/swords/sword-shortsword.webp",
  axe: "icons/weapons/axes/axe-battle.webp",
  spear: "icons/weapons/polearms/spear.webp",
  knife: "icons/weapons/daggers/dagger.webp",
  mace: "icons/weapons/maces/mace.webp",
  flail: "icons/weapons/flails/flail.webp",
  bow: "icons/weapons/bows/shortbow.webp",
  crossbow: "icons/weapons/crossbows/crossbow.webp",
  throwing: "icons/weapons/thrown/javelin.webp",
  unarmed: "icons/skills/melee/unarmed-punch.webp",
  exotic: "icons/weapons/staves/staff.webp",
});

const SLOT_GRID = Object.freeze({
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

const DEFAULT_COVERS = Object.freeze({
  head: ["head"],
  torso: ["torso"],
  abdomen: ["abdomen"],
  legs: ["leftLeg", "rightLeg"],
  leftArm: ["leftArm"],
  rightArm: ["rightArm"],
  neck: ["neck"],
  leftHand: ["leftArm", "torso"],
  rightHand: ["rightArm", "torso"],
});

const DEFAULT_GRIDS = Object.freeze({
  weapon: { w: 1, h: 3 },
  armor: { w: 2, h: 2 },
  food: { w: 1, h: 1 },
  tool: { w: 1, h: 2 },
  resource: { w: 1, h: 1 },
  material: { w: 1, h: 1 },
  potion: { w: 1, h: 1 },
  scroll: { w: 1, h: 2 },
  spell: { w: 1, h: 1 },
  throwable: { w: 1, h: 1 },
  consumable: { w: 1, h: 1 },
  jewelry: { w: 1, h: 1 },
  belt: { w: 2, h: 1 },
  backpack: { w: 2, h: 3 },
  attachment: { w: 1, h: 2 },
});

export const INVENTORY_SLOT_GRIDS = SLOT_GRID;
export const INVENTORY_DEFAULT_COVERS = DEFAULT_COVERS;
export const INVENTORY_GRID_DEFAULTS = DEFAULT_GRIDS;
export const INVENTORY_DURABLE_ITEM_TYPES = new Set([
  "weapon",
  "armor",
  "tool",
  "belt",
  "backpack",
  "attachment",
]);

function clonePlain(value) {
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value ?? null));
}

function cleanQuantity(quantity) {
  return Math.max(1, Math.floor(Number(quantity) || 1));
}

function cleanTier(tier) {
  return Math.max(1, Math.min(10, Math.round(Number(tier) || 1)));
}

function cleanPositiveNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function cleanNonNegativeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function cleanGrid(value, fallback) {
  const n = Math.floor(Number(value ?? fallback));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function weaponGrid(skill, twoHanded = false) {
  if (skill === "knife") return { w: 1, h: 2 };
  if (skill === "bow" || skill === "crossbow" || skill === "spear" || twoHanded) return { w: 1, h: 4 };
  if (skill === "throwing") return { w: 1, h: 2 };
  return DEFAULT_GRIDS.weapon;
}

function defaultGridForItem(type, system = {}) {
  if (type === "weapon") return weaponGrid(system.skill, system.twoHanded);
  if (type === "armor") return SLOT_GRID[system.slot] ?? DEFAULT_GRIDS.armor;
  if (type === "tool" && system.craftType === "blacksmithing") return { w: 2, h: 2 };
  return DEFAULT_GRIDS[type] ?? { w: 1, h: 1 };
}

export function getInventoryDefaultGrid(type, system = {}) {
  return { ...defaultGridForItem(type, system) };
}

function defaultWeightForItem(type) {
  const defaults = {
    weapon: 2,
    armor: 3,
    tool: 2,
    resource: 1,
    food: 0.5,
    material: 1,
    spell: 0,
    potion: 0.3,
    scroll: 0.1,
    throwable: 0.5,
    consumable: 0.2,
    jewelry: 0.1,
    belt: 0.5,
    backpack: 1,
    attachment: 0.3,
  };
  return defaults[type] ?? 1;
}

function ensureContainerSlotShape(value, fallback) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
  return {
    cols: cleanGrid(source.cols, fallback.cols),
    rows: cleanGrid(source.rows, fallback.rows),
  };
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function durabilityFor(type, tier, explicit = null) {
  if (explicit && typeof explicit === "object") {
    const max = cleanPositiveNumber(explicit.max, cleanPositiveNumber(explicit.value, 100));
    return { value: Math.min(max, cleanPositiveNumber(explicit.value, max)), max };
  }
  const t = cleanTier(tier);
  const max = type === "weapon" ? 40 + t * 10
    : type === "armor" ? 50 + t * 15
      : 30 + t * 8;
  return { value: max, max };
}

function rowFlags(row) {
  return row?.id ? { "iron-hills-system": { catalogId: row.id } } : {};
}

function conventionImg(type, id) {
  if (!id) return undefined;
  return `systems/iron-hills-system/icons/items/${type}/${id}.webp`;
}

function protectionFromArmorRow(row) {
  const raw = row?.resist ?? { physical: row?.tier ?? 1, magical: 0 };
  const protection = clonePlain(raw);
  if (protection && typeof protection === "object") delete protection.img;
  return protection && typeof protection === "object" ? protection : { physical: Number(protection ?? 0), magical: 0 };
}

function armorImage(row) {
  const raw = row?.resist ?? null;
  const imgFromResist = typeof raw === "object" && raw !== null ? raw.img : undefined;
  return row?.img ?? imgFromResist ?? conventionImg("armor", row?.id);
}

function withCatalogValue(itemData) {
  const system = itemData.system ?? {};
  const value = Number(system.value ?? 0);
  const price = Number(system.price ?? 0);
  const explicit = Number.isFinite(value) && value > 0 ? value : price;
  system.value = Number.isFinite(explicit) && explicit > 0
    ? Math.max(1, Math.round(explicit))
    : getComputedItemUnitPrice(itemData);
  system.price = system.value;
  itemData.system = system;
  return itemData;
}

export function normalizeItemDataForInventory(itemData, options = {}) {
  const data = clonePlain(itemData ?? {});
  const type = data.type ?? "material";
  const system = data.system && typeof data.system === "object" ? data.system : {};
  data.system = system;

  system.tier = cleanTier(system.tier);
  system.quantity = cleanQuantity(options.quantity ?? system.quantity);
  system.weight = cleanNonNegativeNumber(system.weight, defaultWeightForItem(type));
  if (!system.quality && !["material", "resource"].includes(type)) system.quality = "common";

  if (type === "weapon") {
    system.skill = String(system.skill ?? "sword").trim() || "sword";
    system.damage = cleanPositiveNumber(system.damage, 1);
    system.damageType = normalizeDamageType(system.damageType, { fallback: "physical" });
    system.energyCost = cleanNonNegativeNumber(system.energyCost, 0);
    system.timeCost = cleanPositiveNumber(system.timeCost, 2);
    system.range = cleanPositiveNumber(system.range, getDefaultWeaponRange(system.skill));
    system.twoHanded = Boolean(system.twoHanded);
  }

  if (type === "armor") {
    system.slot = String(system.slot ?? "torso").trim() || "torso";
    if (!system.protection || typeof system.protection !== "object" || Array.isArray(system.protection)) {
      system.protection = { physical: 0, magical: 0 };
    }
    if (!Array.isArray(system.covers)) system.covers = DEFAULT_COVERS[system.slot] ?? ["torso"];
  }

  if (type === "tool") {
    system.craftType = String(system.craftType ?? "crafting").trim() || "crafting";
  }

  if (type === "material") {
    system.category = String(system.category ?? "misc").trim() || "misc";
  }

  if (type === "resource") {
    system.category = String(system.category ?? "resource").trim() || "resource";
  }

  if (type === "belt" || type === "backpack") {
    const fallbackSlots = type === "belt" ? { cols: 3, rows: 1 } : { cols: 5, rows: 6 };
    system.containerSlots = ensureContainerSlotShape(system.containerSlots, fallbackSlots);
    system.attachmentSlots = ensureArray(system.attachmentSlots);
    system.weightFactor = cleanPositiveNumber(system.weightFactor, type === "belt" ? 1 : 0.9);
  }

  if (type === "attachment") {
    system.attachesTo = String(system.attachesTo ?? "belt").trim() || "belt";
    system.addsSlots = ensureContainerSlotShape(system.addsSlots, { cols: 2, rows: 1 });
    system.allowedTypes = Array.isArray(system.allowedTypes) ? system.allowedTypes : null;
    system.allowedSkills = ensureArray(system.allowedSkills);
    system.accessSeconds = cleanNonNegativeNumber(system.accessSeconds, 1);
    system.addsLabel = String(system.addsLabel ?? data.name ?? "").trim();
  }

  if (type === "spell" || type === "scroll") {
    system.damageType = normalizeDamageType(system.damageType, { fallback: "magical" });
  }

  const grid = defaultGridForItem(type, system);
  system.gridW = cleanGrid(system.gridW, grid.w);
  system.gridH = cleanGrid(system.gridH, grid.h);

  if (INVENTORY_DURABLE_ITEM_TYPES.has(type)) {
    system.durability = durabilityFor(type, system.tier, system.durability);
  }

  normalizeItemActionSystem(system, { type, targetPart: system.targetPart ?? "torso" });
  if (type === "throwable") normalizeThrowableSystem(system, { tier: system.tier, ensureAoeObject: true });

  return withCatalogValue(data);
}

export function materialToItemData(row, { quantity = 1 } = {}) {
  return normalizeItemDataForInventory({
    name: row.label,
    type: "material",
    img: row.img ?? conventionImg("materials", row.id),
    flags: rowFlags(row),
    system: {
      tier: row.tier ?? 1,
      category: row.category ?? "misc",
      weight: Number(row.weight ?? 1),
      quantity,
      value: Number(row.value ?? 0),
      quality: "common",
      gridW: row.gridW ?? 1,
      gridH: row.gridH ?? 1,
    },
  }, { quantity });
}

export function weaponToItemData(row, { quantity = 1 } = {}) {
  const skill = row.skill ?? "sword";
  const tier = cleanTier(row.tier);
  const system = {
    tier,
    quality: row.quality ?? "common",
    weight: Number(row.weight ?? 2),
    quantity,
    gridW: row.gridW ?? undefined,
    gridH: row.gridH ?? undefined,
    damage: row.damage ?? 3,
    damageType: row.damageType ?? "physical",
    skill,
    twoHanded: Boolean(row.twoHanded ?? false),
    energyCost: row.energyCost ?? 8,
    timeCost: row.timeCost ?? 2.0,
    value: row.value ?? 10,
    durability: durabilityFor("weapon", tier, row.durability),
    range: row.range ?? getDefaultWeaponRange(skill),
  };
  if (row.affixes && typeof row.affixes === "object") system.affixes = clonePlain(row.affixes);

  return normalizeItemDataForInventory({
    name: row.label,
    type: "weapon",
    img: row.img ?? DEFAULT_WEAPON_IMG[skill] ?? DEFAULT_WEAPON_IMG.sword,
    flags: rowFlags(row),
    system,
  }, { quantity });
}

export function armorToItemData(row, { quantity = 1 } = {}) {
  const tier = cleanTier(row.tier);
  const slotGrid = SLOT_GRID[row.slot] ?? DEFAULT_GRIDS.armor;
  const system = {
    tier,
    quality: row.quality ?? "common",
    weight: Number(row.weight ?? 3),
    quantity,
    gridW: row.gridW ?? slotGrid.w,
    gridH: row.gridH ?? slotGrid.h,
    slot: row.slot ?? "torso",
    protection: protectionFromArmorRow(row),
    value: row.value ?? 20,
    durability: durabilityFor("armor", tier, row.durability),
    covers: row.covers ?? DEFAULT_COVERS[row.slot] ?? ["torso"],
  };
  if (row.affixes && typeof row.affixes === "object") system.affixes = clonePlain(row.affixes);

  return normalizeItemDataForInventory({
    name: row.label,
    type: "armor",
    img: armorImage(row),
    flags: rowFlags(row),
    system,
  }, { quantity });
}

export function potionToItemData(row, { quantity = 1 } = {}) {
  const effect = row.effect ?? row.effectType ?? "healHP";
  const targetPart = row.targetPart ?? row.zone ?? "torso";
  return normalizeItemDataForInventory({
    name: row.label,
    type: "potion",
    img: row.img ?? "icons/consumables/potions/potion-round-empty-green.webp",
    flags: rowFlags(row),
    system: {
      tier: row.tier ?? 1,
      quality: row.quality ?? "common",
      weight: Number(row.weight ?? 0.3),
      quantity,
      effect,
      effectType: effect,
      actionType: row.actionType ?? "",
      applicationScope: row.applicationScope ?? "",
      targetActorMode: row.targetActorMode ?? "",
      targetPart,
      conditionKey: row.conditionKey ?? "",
      conditionMode: row.conditionMode ?? "",
      conditionValueKind: row.conditionValueKind ?? "",
      duration: row.duration ?? 0,
      power: row.power ?? 5,
      value: row.value ?? 20,
      gridW: row.gridW ?? 1,
      gridH: row.gridH ?? 1,
    },
  }, { quantity });
}

export function foodToItemData(row, { quantity = 1 } = {}) {
  const system = {
    tier: row.tier ?? 1,
    quality: row.quality ?? "common",
    weight: Number(row.weight ?? 0.5),
    quantity,
    satiety: Number(row.satiety ?? 10),
    hydration: Number(row.hydration ?? 5),
    value: Number(row.value ?? 2),
    gridW: row.gridW ?? 1,
    gridH: row.gridH ?? 1,
  };
  if (row.bonus && typeof row.bonus === "object") system.bonus = clonePlain(row.bonus);
  return normalizeItemDataForInventory({
    name: row.label,
    type: "food",
    img: row.img ?? "icons/consumables/food/bread-loaf-round-brown.webp",
    flags: rowFlags(row),
    system,
  }, { quantity });
}

export function toolToItemData(row, { quantity = 1 } = {}) {
  const tier = cleanTier(row.tier);
  return normalizeItemDataForInventory({
    name: row.label,
    type: "tool",
    img: row.img ?? conventionImg("tools", row.id),
    flags: rowFlags(row),
    system: {
      tier,
      quality: row.quality ?? "common",
      weight: Number(row.weight ?? 2),
      quantity,
      craftType: row.craftType ?? "crafting",
      value: row.value ?? 10,
      gridW: row.gridW ?? 1,
      gridH: row.gridH ?? 2,
      description: row.desc ?? row.description ?? "",
      durability: durabilityFor("tool", tier, row.durability),
    },
  }, { quantity });
}

export function beltToItemData(row, { quantity = 1 } = {}) {
  const tier = cleanTier(row.tier);
  return normalizeItemDataForInventory({
    name: row.label,
    type: "belt",
    img: row.img ?? conventionImg("belts", row.id),
    flags: rowFlags(row),
    system: {
      tier,
      quality: row.quality ?? "common",
      weight: Number(row.weight ?? 0.5),
      quantity,
      value: row.value ?? 10,
      gridW: row.gridW ?? 2,
      gridH: row.gridH ?? 1,
      containerSlots: clonePlain(row.containerSlots ?? { cols: 3, rows: 1 }),
      attachmentSlots: clonePlain(row.attachmentSlots ?? []),
      weightFactor: Number(row.weightFactor ?? 1),
      description: row.desc ?? row.description ?? "",
      durability: durabilityFor("tool", tier, row.durability ?? { value: 25, max: 25 }),
    },
  }, { quantity });
}

export function backpackToItemData(row, { quantity = 1 } = {}) {
  const tier = cleanTier(row.tier);
  return normalizeItemDataForInventory({
    name: row.label,
    type: "backpack",
    img: row.img ?? conventionImg("backpacks", row.id),
    flags: rowFlags(row),
    system: {
      tier,
      quality: row.quality ?? "common",
      weight: Number(row.weight ?? 1),
      quantity,
      value: row.value ?? 20,
      gridW: row.gridW ?? 2,
      gridH: row.gridH ?? 3,
      containerSlots: clonePlain(row.containerSlots ?? { cols: 5, rows: 6 }),
      attachmentSlots: clonePlain(row.attachmentSlots ?? []),
      weightFactor: Number(row.weightFactor ?? 0.9),
      description: row.desc ?? row.description ?? "",
      durability: durabilityFor("tool", tier, row.durability ?? { value: 30, max: 30 }),
    },
  }, { quantity });
}

export function attachmentToItemData(row, { quantity = 1 } = {}) {
  const tier = cleanTier(row.tier);
  return normalizeItemDataForInventory({
    name: row.label,
    type: "attachment",
    img: row.img ?? conventionImg("attachments", row.id),
    flags: rowFlags(row),
    system: {
      tier,
      quality: row.quality ?? "common",
      weight: Number(row.weight ?? 0.3),
      quantity,
      value: row.value ?? 10,
      gridW: row.gridW ?? 1,
      gridH: row.gridH ?? 2,
      attachesTo: row.attachesTo ?? "belt",
      addsLabel: row.addsLabel ?? row.label ?? "",
      addsSlots: clonePlain(row.addsSlots ?? { cols: 2, rows: 1 }),
      allowedTypes: clonePlain(row.allowedTypes ?? null),
      allowedSkills: clonePlain(row.allowedSkills ?? []),
      accessSeconds: Number(row.accessSeconds ?? 1),
      description: row.desc ?? row.description ?? "",
      durability: durabilityFor("tool", tier, row.durability ?? { value: 20, max: 20 }),
    },
  }, { quantity });
}

export function drinkVesselToItemData(row, { quantity = 1, initialCharges = null } = {}) {
  const max = Math.max(1, Number(row.vesselMax ?? 1));
  const filled = Math.min(max, Math.max(0, Number(initialCharges ?? max)));
  const baseWeight = Number(row.weight ?? 0.35);
  const flags = rowFlags(row);
  return normalizeItemDataForInventory({
    name: row.label,
    type: "consumable",
    img: row.img ?? conventionImg("consumables", row.id),
    flags: {
      ...flags,
      "iron-hills-system": {
        ...(flags["iron-hills-system"] ?? {}),
        kind: "drink_vessel",
      },
    },
    system: {
      tier: row.tier ?? 1,
      quality: row.quality ?? "common",
      weight: baseWeight + filled * 0.02,
      quantity,
      power: Number(row.vesselHydrationPerDrink ?? 10),
      effect: "drink-vessel",
      effectType: "drink-vessel",
      actionType: "drink-vessel",
      applicationScope: "global",
      targetActorMode: "self",
      targetPart: "",
      vesselMax: max,
      vesselCurrent: filled,
      vesselHydrationPerDrink: Number(row.vesselHydrationPerDrink ?? 0),
      vesselSatietyPerDrink: Number(row.vesselSatietyPerDrink ?? 0),
      vesselLiquidLabel: String(row.vesselLiquidLabel ?? "Вода"),
      value: row.value ?? 4,
      gridW: row.gridW ?? 1,
      gridH: row.gridH ?? 2,
    },
  }, { quantity });
}

export function medicalConsumableToItemData(row, { quantity = 1 } = {}) {
  const effect = row.effect ?? row.effectType ?? row.actionType ?? "bandage";
  const flags = rowFlags(row);

  return normalizeItemDataForInventory({
    name: row.label,
    type: "consumable",
    img: row.img ?? conventionImg("consumables", row.id),
    flags: {
      ...flags,
      "iron-hills-system": {
        ...(flags["iron-hills-system"] ?? {}),
        kind: row.kind ?? "medical",
      },
    },
    system: {
      tier: row.tier ?? 1,
      quality: row.quality ?? "common",
      weight: Number(row.weight ?? 0.2),
      quantity,
      power: Number(row.power ?? 1),
      effect,
      effectType: effect,
      actionType: row.actionType ?? "",
      applicationScope: row.applicationScope ?? "",
      targetActorMode: row.targetActorMode ?? "",
      targetPart: row.targetPart ?? "",
      conditionKey: row.conditionKey ?? "",
      conditionMode: row.conditionMode ?? "",
      conditionValueKind: row.conditionValueKind ?? "",
      duration: row.duration ?? 0,
      value: row.value ?? 5,
      gridW: row.gridW ?? 1,
      gridH: row.gridH ?? 1,
      description: row.desc ?? row.description ?? "",
    },
  }, { quantity });
}

export function consumableToItemData(row, options = {}) {
  if (row?.kind === "drink_vessel" || row?.vesselMax !== undefined) {
    return drinkVesselToItemData(row, options);
  }
  return medicalConsumableToItemData(row, options);
}

export function throwableToItemData(row, { quantity = 1 } = {}) {
  return normalizeItemDataForInventory({
    name: row.label ?? row.name ?? "Throwable",
    type: "throwable",
    img: row.img ?? conventionImg("throwables", row.id),
    flags: rowFlags(row),
    system: {
      ...clonePlain(row.system ?? {}),
      tier: row.tier ?? row.system?.tier ?? 1,
      quality: row.quality ?? row.system?.quality ?? "common",
      weight: Number(row.weight ?? row.system?.weight ?? 1),
      quantity,
      effectType: row.effectType ?? row.effect ?? row.system?.effectType ?? "damage",
      damageType: row.damageType ?? row.system?.damageType ?? "physical",
      power: row.power ?? row.damage ?? row.system?.power ?? 2,
      energyCost: row.energyCost ?? row.system?.energyCost,
      targetPart: row.targetPart ?? row.targetZone ?? row.system?.targetPart ?? "torso",
      targetZone: row.targetZone ?? row.system?.targetZone ?? "",
      friendlyFire: row.friendlyFire ?? row.system?.friendlyFire ?? false,
      friendlyFireMode: row.friendlyFireMode ?? row.system?.friendlyFireMode,
      aoe: clonePlain(row.aoe ?? row.system?.aoe ?? null),
      appliesPoison: row.appliesPoison ?? row.poison ?? row.system?.appliesPoison ?? 0,
      appliesBurning: row.appliesBurning ?? row.burning ?? row.system?.appliesBurning ?? 0,
      value: row.value ?? row.system?.value ?? 5,
      gridW: row.gridW ?? row.system?.gridW ?? 1,
      gridH: row.gridH ?? row.system?.gridH ?? 1,
      description: row.desc ?? row.description ?? row.system?.description ?? "",
    },
  }, { quantity });
}

export function spellToItemData(row, { quantity = 1 } = {}) {
  const system = buildSpellItemSystemData(row, { quantity });
  return normalizeItemDataForInventory({
    name: row.label,
    type: "spell",
    img: row.img ?? SPELL_SCHOOL_IMAGES[system.school] ?? SPELL_SCHOOL_IMAGES.default,
    flags: rowFlags(row),
    system: {
      ...system,
      value: row.value ?? system.value,
      weight: Number(row.weight ?? system.weight ?? 0),
      quantity,
      gridW: row.gridW ?? system.gridW ?? 1,
      gridH: row.gridH ?? system.gridH ?? 1,
    },
  }, { quantity });
}

export function catalogRowToItemData(row, itemType, options = {}) {
  if (!row) return null;
  if (itemType === "weapon") return weaponToItemData(row, options);
  if (itemType === "armor") return armorToItemData(row, options);
  if (itemType === "potion") return potionToItemData(row, options);
  if (itemType === "food") return foodToItemData(row, options);
  if (itemType === "tool") return toolToItemData(row, options);
  if (itemType === "material") return materialToItemData(row, options);
  if (itemType === "spell") return spellToItemData(row, options);
  if (itemType === "throwable") return throwableToItemData(row, options);
  if (itemType === "belt") return beltToItemData(row, options);
  if (itemType === "backpack") return backpackToItemData(row, options);
  if (itemType === "attachment") return attachmentToItemData(row, options);
  if (itemType === "drink_vessel") return drinkVesselToItemData(row, options);
  if (itemType === "medical_consumable" || itemType === "consumable") return consumableToItemData(row, options);
  return normalizeItemDataForInventory({
    name: row.label ?? row.name ?? "Item",
    type: itemType ?? row.type ?? "material",
    img: row.img,
    flags: rowFlags(row),
    system: {
      ...clonePlain(row.system ?? {}),
      tier: row.tier ?? row.rank ?? row.system?.tier ?? 1,
      quantity: options.quantity ?? row.quantity ?? row.qty ?? 1,
      weight: row.weight ?? row.system?.weight ?? 1,
      value: row.value ?? row.system?.value ?? 1,
    },
  }, options);
}

export function buildShopStockEntry(row, itemType, { quantity = 1, priceMultiplier = 1 } = {}) {
  const qty = cleanQuantity(quantity);
  const itemData = catalogRowToItemData(row, itemType, { quantity: qty });
  if (!itemData) return null;
  const unitPrice = getComputedItemUnitPrice(itemData);
  const shopPrice = Math.max(1, Math.ceil(unitPrice * qty * Number(priceMultiplier ?? 1)));
  return {
    id: row.id ?? itemData.system?.spellId ?? itemData.name,
    catalogId: row.id ?? itemData.flags?.["iron-hills-system"]?.catalogId ?? itemData.system?.spellId ?? itemData.system?.catalogId ?? "",
    catalogType: itemType ?? itemData.type,
    label: itemData.name,
    itemType: itemData.type,
    type: itemData.type,
    tier: Number(itemData.system?.tier ?? row.tier ?? row.rank ?? 1),
    rank: itemData.system?.rank,
    qty,
    value: unitPrice,
    shopPrice,
    itemData,
    img: itemData.img,
    weight: Number(itemData.system?.weight ?? 0),
    damage: itemData.system?.damage,
    skill: itemData.system?.skill,
    school: itemData.system?.school,
    protection: itemData.system?.protection,
    actionType: itemData.system?.actionType,
    effectType: itemData.system?.effectType,
    power: itemData.system?.power,
    duration: itemData.system?.duration,
    conditionKey: itemData.system?.conditionKey,
    appliesPoison: itemData.system?.appliesPoison,
    appliesBurning: itemData.system?.appliesBurning,
    gridW: itemData.system?.gridW,
    gridH: itemData.system?.gridH,
  };
}
