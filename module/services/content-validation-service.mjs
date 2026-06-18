import {
  FOOD,
  MATERIALS,
  WEAPONS,
  ARMORS,
  POTIONS,
  TOOLS,
  BELTS,
  BACKPACKS,
  ATTACHMENTS,
  CONSUMABLES,
  MEDICAL_CONSUMABLES,
  THROWABLES,
} from "../constants/items-catalog.mjs";
import { SPELLS } from "../constants/spells-catalog.mjs";
import { MIXING_RULES } from "../constants/alchemy.mjs";
import { uniqueCraftRecipes } from "../constants/recipes.mjs";
import { MONSTER_HARVEST_DROP_POOLS } from "../constants/monster-loot-pools.mjs";
import { ARMOR_CLASS_KEYS } from "../constants/armor-profiles.mjs";
import { GENERATED_PACKS } from "../compendium-builder.mjs";
import {
  attachmentToItemData,
  armorToItemData,
  backpackToItemData,
  beltToItemData,
  consumableToItemData,
  foodToItemData,
  materialToItemData,
  normalizeItemDataForInventory,
  potionToItemData,
  spellToItemData,
  throwableToItemData,
  toolToItemData,
  weaponToItemData,
  INVENTORY_DURABLE_ITEM_TYPES,
} from "../utils/catalog-item-data.mjs";
import { buildAlchemyResultItemData } from "../utils/alchemy-result-data.mjs";
import { itemDataFromLootLine } from "../utils/loot-line-items.mjs";
import { buildMonsterHarvestEmbeddedItemData } from "../utils/monster-harvest-items.mjs";
import { STACKABLE_TYPES } from "../utils/item-utils.mjs";
import {
  buildArmor,
  buildConsumable,
  buildFood,
  buildMaterial,
  buildNpcActorData,
  buildNpcCarryInventoryItems,
  buildNpcRoleEquipmentItems,
  buildNpcStartingInventoryItems,
  buildPoiLootItems,
  buildPoiNpcActorData,
  buildPotion,
  buildResource,
  buildScroll,
  buildSpell,
  buildThrowable,
  buildTool,
  buildWeapon,
  WORLD_CONTENT_CONTAINER_THEMES,
  WORLD_CONTENT_MERCHANT_LOOT_SPECIALTIES,
  WORLD_CONTENT_NPC_ROLES,
  WORLD_CONTENT_POI_THEMES,
  WORLD_CONTENT_POI_TYPES,
  randomContainerLoot,
  randomMerchantStock,
} from "./world-content-service.mjs";
import {
  buildShopPurchaseItemData,
  ECONOMY_STATES,
  generateMerchantActorStockItems,
  generateMerchantStock,
  MERCHANT_TYPES,
} from "./merchant-service.mjs";
import { validateSpellRuntimeData } from "./spell-runtime-service.mjs";
import {
  DAMAGE_RESISTANCE_TYPE_KEYS,
  isSupportedDamageType,
} from "./damage-type-service.mjs";
import {
  ACTION_RUNTIME_ITEM_TYPES,
  ITEM_ACTION_TYPE_SET,
  ITEM_APPLICATION_SCOPE_SET,
  ITEM_TARGET_ACTOR_MODE_SET,
  ITEM_BODY_ZONE_SET,
  ITEM_AOE_FRIENDLY_FIRE_MODE_SET,
  ITEM_AOE_SHAPE_SET,
  ITEM_AOE_TARGET_ZONE_MODE_SET,
  ITEM_AOE_TYPE_SET,
  hasThrowableAoeIntent,
} from "../utils/item-runtime-normalization.mjs";

const KNOWN_ITEM_TYPES = new Set([
  "weapon",
  "armor",
  "tool",
  "resource",
  "food",
  "material",
  "spell",
  "potion",
  "scroll",
  "throwable",
  "consumable",
  "quest",
  "relation",
  "jewelry",
  "belt",
  "backpack",
  "attachment",
]);

const DAMAGE_RESISTANCE_TYPE_SET = new Set(DAMAGE_RESISTANCE_TYPE_KEYS);

const TRADE_ITEM_TYPES = new Set([
  "weapon",
  "armor",
  "tool",
  "resource",
  "food",
  "material",
  "spell",
  "potion",
  "scroll",
  "throwable",
  "consumable",
  "jewelry",
  "belt",
  "backpack",
  "attachment",
]);

const STACKABLE_ITEM_TYPES = STACKABLE_TYPES;
const ACTION_ITEM_TYPES = ACTION_RUNTIME_ITEM_TYPES;
const DURABILITY_ITEM_TYPES = INVENTORY_DURABLE_ITEM_TYPES;

function clonePlain(value) {
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value ?? null));
}

function asItemData(itemLike) {
  if (!itemLike) return null;
  if (typeof itemLike.toObject === "function") return itemLike.toObject();
  return clonePlain(itemLike);
}

function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function isNonNegativeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function contextPath(context = {}) {
  return [
    context.scope,
    context.pack,
    context.actor,
    context.item,
    context.sample,
  ].filter(Boolean).join(" / ");
}

function finding(severity, code, message, context = {}, details = {}) {
  return {
    severity,
    code,
    message,
    path: contextPath(context),
    context: { ...context },
    details,
  };
}

function pushIf(findings, condition, severity, code, message, context, details = {}) {
  if (condition) findings.push(finding(severity, code, message, context, details));
}

function validateDamageResistanceObject(source, context, findings, {
  prefix = "damage-resistance",
  required = false,
} = {}) {
  pushIf(
    findings,
    required && !isPlainObject(source),
    "warn",
    `${prefix}-missing`,
    "Damage resistance object is missing.",
    context
  );
  if (!isPlainObject(source)) return;

  for (const [key, value] of Object.entries(source)) {
    pushIf(
      findings,
      !DAMAGE_RESISTANCE_TYPE_SET.has(key),
      "warn",
      `${prefix}-unsupported-key`,
      "Damage resistance key is not supported by the combat damage policy.",
      context,
      { key, value }
    );
    pushIf(
      findings,
      DAMAGE_RESISTANCE_TYPE_SET.has(key) && !isNonNegativeNumber(value),
      "warn",
      `${prefix}-bad-value`,
      "Damage resistance value should be non-negative.",
      context,
      { key, value }
    );
  }
}

function validateDurability(itemData, context, findings) {
  const durability = itemData.system?.durability;
  pushIf(
    findings,
    !isPlainObject(durability),
    "warn",
    "missing-durability",
    "Durable item is missing system.durability.",
    context
  );
  if (!isPlainObject(durability)) return;

  pushIf(
    findings,
    !isPositiveNumber(durability.max) || !isNonNegativeNumber(durability.value),
    "warn",
    "bad-durability",
    "Durability should have non-negative value and positive max.",
    context,
    { durability }
  );
}

function validateActionItem(itemData, context, findings) {
  const system = itemData.system ?? {};
  const effectValue = isPlainObject(system.effect) ? "" : system.effect;
  const effectType = String(system.effectType ?? effectValue ?? "").trim();
  const actionType = String(system.actionType ?? "").trim();
  const applicationScope = String(system.applicationScope ?? "").trim();
  const targetActorMode = String(system.targetActorMode ?? "").trim();
  const targetPart = String(system.targetPart ?? "").trim();
  const isDamageScroll = itemData.type === "scroll" && effectType === "damage";

  pushIf(
    findings,
    !effectType,
    "warn",
    "missing-effect-type",
    "Action item is missing effectType/effect.",
    context
  );

  if (!isDamageScroll) {
    pushIf(
      findings,
      !actionType,
      "warn",
      "missing-action-type",
      "Action item is missing actionType.",
      context,
      { effectType }
    );
  }

  pushIf(
    findings,
    Boolean(actionType) && !ITEM_ACTION_TYPE_SET.has(actionType),
    "warn",
    "unknown-action-type",
    "Action item has an unsupported actionType.",
    context,
    { actionType, effectType }
  );
  pushIf(
    findings,
    actionType === "apply-condition" && !String(system.conditionKey ?? "").trim(),
    "error",
    "missing-condition-key",
    "Condition action item is missing conditionKey.",
    context,
    { effectType }
  );

  pushIf(
    findings,
    !applicationScope,
    "warn",
    "missing-application-scope",
    "Action item is missing applicationScope.",
    context
  );
  pushIf(
    findings,
    Boolean(applicationScope) && !ITEM_APPLICATION_SCOPE_SET.has(applicationScope),
    "warn",
    "bad-application-scope",
    "Action item has an unsupported applicationScope.",
    context,
    { applicationScope }
  );
  pushIf(
    findings,
    !targetActorMode,
    "warn",
    "missing-target-mode",
    "Action item is missing targetActorMode.",
    context
  );
  pushIf(
    findings,
    Boolean(targetActorMode) && !ITEM_TARGET_ACTOR_MODE_SET.has(targetActorMode),
    "warn",
    "bad-target-mode",
    "Action item has an unsupported targetActorMode.",
    context,
    { targetActorMode }
  );
  pushIf(
    findings,
    Boolean(targetPart) && !ITEM_BODY_ZONE_SET.has(targetPart),
    "warn",
    "bad-action-target-part",
    "Action item targetPart is not a supported body zone.",
    context,
    { targetPart }
  );
}

function validateAoeObject(aoe, context, findings, {
  prefix = "aoe",
  requiresPositiveDistance = false,
  fixedZoneRequiresTarget = true,
} = {}) {
  if (!isPlainObject(aoe)) return;
  const shape = String(aoe.shape ?? "").trim();
  const type = String(aoe.type ?? "").trim();
  const targetZoneMode = String(aoe.targetZoneMode ?? "").trim();
  const friendlyFireMode = String(aoe.friendlyFireMode ?? "").trim();
  const targetZone = String(aoe.targetZone ?? "").trim();
  const distance = Number(aoe.distance ?? 0);
  const maxTargets = aoe.maxTargets === null || aoe.maxTargets === ""
    ? null
    : Number(aoe.maxTargets ?? 0);

  pushIf(findings, !shape || !ITEM_AOE_SHAPE_SET.has(shape), "warn", `${prefix}-bad-shape`, "AoE shape is unsupported.", context, { shape });
  pushIf(findings, !type || !ITEM_AOE_TYPE_SET.has(type), "warn", `${prefix}-bad-type`, "AoE type is unsupported.", context, { type });
  pushIf(findings, !isNonNegativeNumber(distance), "warn", `${prefix}-bad-distance`, "AoE distance should be non-negative.", context, { distance: aoe.distance });
  pushIf(findings, requiresPositiveDistance && !isPositiveNumber(distance), "error", `${prefix}-missing-distance`, "AoE item requires positive distance.", context, { distance: aoe.distance });
  pushIf(findings, maxTargets !== null && (!Number.isFinite(maxTargets) || maxTargets < 0), "warn", `${prefix}-bad-max-targets`, "AoE maxTargets should be null or non-negative.", context, { maxTargets: aoe.maxTargets });
  pushIf(findings, !targetZoneMode || !ITEM_AOE_TARGET_ZONE_MODE_SET.has(targetZoneMode), "warn", `${prefix}-bad-zone-mode`, "AoE targetZoneMode is unsupported.", context, { targetZoneMode });
  pushIf(findings, !friendlyFireMode || !ITEM_AOE_FRIENDLY_FIRE_MODE_SET.has(friendlyFireMode), "warn", `${prefix}-bad-friendly-fire-mode`, "AoE friendlyFireMode is unsupported.", context, { friendlyFireMode });
  pushIf(findings, Boolean(targetZone) && !ITEM_BODY_ZONE_SET.has(targetZone), "warn", `${prefix}-bad-target-zone`, "AoE targetZone is not a supported body zone.", context, { targetZone });
  pushIf(findings, fixedZoneRequiresTarget && targetZoneMode === "fixed" && !targetZone, "warn", `${prefix}-fixed-zone-without-zone`, "AoE uses fixed targetZoneMode without targetZone.", context);
}

function validateThrowableRuntimeData(itemData, context, findings) {
  const system = itemData.system ?? {};
  const hasArea = hasThrowableAoeIntent(system);
  const aoe = isPlainObject(system.aoe) ? system.aoe : null;
  const targetPart = String(system.targetPart ?? "").trim();

  pushIf(findings, !isPositiveNumber(system.power), "error", "bad-throwable-power", "Throwable power should be positive.", context);
  pushIf(findings, !isNonNegativeNumber(system.energyCost), "warn", "bad-throwable-energy-cost", "Throwable energyCost should be non-negative.", context);
  pushIf(findings, !String(system.damageType ?? "").trim(), "warn", "missing-throwable-damage-type", "Throwable is missing damageType.", context);
  pushIf(
    findings,
    Boolean(String(system.damageType ?? "").trim()) && !isSupportedDamageType(system.damageType),
    "warn",
    "unsupported-throwable-damage-type",
    "Throwable damageType is not supported by the combat damage policy.",
    context,
    { damageType: system.damageType }
  );
  pushIf(findings, Boolean(targetPart) && !ITEM_BODY_ZONE_SET.has(targetPart), "warn", "bad-throwable-target-part", "Throwable targetPart is not a supported body zone.", context, { targetPart });
  pushIf(findings, !isNonNegativeNumber(system.appliesPoison), "warn", "bad-throwable-poison", "Throwable appliesPoison should be non-negative.", context, { appliesPoison: system.appliesPoison });
  pushIf(findings, !isNonNegativeNumber(system.appliesBurning), "warn", "bad-throwable-burning", "Throwable appliesBurning should be non-negative.", context, { appliesBurning: system.appliesBurning });
  pushIf(findings, hasArea && !aoe, "warn", "missing-throwable-aoe", "Area throwable is missing aoe object.", context);
  if (aoe) {
    validateAoeObject(aoe, context, findings, {
      prefix: "throwable-aoe",
      requiresPositiveDistance: hasArea,
      fixedZoneRequiresTarget: true,
    });
  }
}

function validateTypeSpecificItem(itemData, context, findings) {
  const system = itemData.system ?? {};

  if (itemData.type === "weapon") {
    pushIf(findings, !String(system.skill ?? "").trim(), "error", "missing-weapon-skill", "Weapon is missing skill.", context);
    pushIf(findings, !isPositiveNumber(system.damage), "error", "bad-weapon-damage", "Weapon damage should be positive.", context);
    pushIf(findings, !String(system.damageType ?? "").trim(), "warn", "missing-damage-type", "Weapon is missing damageType.", context);
    pushIf(
      findings,
      Boolean(String(system.damageType ?? "").trim()) && !isSupportedDamageType(system.damageType),
      "warn",
      "unsupported-weapon-damage-type",
      "Weapon damageType is not supported by the combat damage policy.",
      context,
      { damageType: system.damageType }
    );
    pushIf(findings, !isNonNegativeNumber(system.energyCost), "warn", "bad-energy-cost", "Weapon energyCost should be non-negative.", context);
  }

  if (itemData.type === "armor") {
    pushIf(findings, !String(system.slot ?? "").trim(), "error", "missing-armor-slot", "Armor is missing slot.", context);
    pushIf(
      findings,
      !ARMOR_CLASS_KEYS.includes(String(system.armorClass ?? "")),
      "warn",
      "missing-armor-class",
      "Armor is missing supported armorClass.",
      context,
      { armorClass: system.armorClass }
    );
    pushIf(findings, !isPlainObject(system.requirements), "warn", "missing-armor-requirements", "Armor is missing requirements object.", context);
    if (isPlainObject(system.requirements)) {
      pushIf(
        findings,
        !isNonNegativeNumber(system.requirements.endurance) || !isNonNegativeNumber(system.requirements.athletics),
        "warn",
        "bad-armor-requirements",
        "Armor requirements should have non-negative endurance and athletics.",
        context,
        { requirements: system.requirements }
      );
    }
    pushIf(findings, !isPlainObject(system.penalties), "warn", "missing-armor-penalties", "Armor is missing penalties object.", context);
    pushIf(findings, !isPlainObject(system.protection), "error", "missing-protection", "Armor is missing protection object.", context);
    validateDamageResistanceObject(system.protection, context, findings, {
      prefix: "armor-protection",
      required: true,
    });
    pushIf(findings, !Array.isArray(system.covers), "warn", "missing-covers", "Armor is missing covers array.", context);
  }

  if (itemData.type === "spell") {
    findings.push(...validateSpellRuntimeData(itemData, { context }));
    pushIf(findings, !String(system.school ?? "").trim(), "warn", "missing-spell-school", "Spell is missing school.", context);
    pushIf(findings, !isPositiveNumber(system.rank ?? system.tier), "warn", "bad-spell-rank", "Spell rank/tier should be positive.", context);
    pushIf(
      findings,
      !isNonNegativeNumber(system.manaCost),
      "warn",
      "bad-mana-cost",
      "Spell manaCost should be non-negative.",
      context
    );
    pushIf(
      findings,
      !String(system.applicationScope ?? "").trim() || !String(system.targetActorMode ?? "").trim(),
      "warn",
      "missing-spell-targeting",
      "Spell is missing targeting scope/mode.",
      context
    );
  }

  if (itemData.type === "throwable") {
    validateThrowableRuntimeData(itemData, context, findings);
  }

  if (itemData.type === "food") {
    pushIf(
      findings,
      !isNonNegativeNumber(system.satiety) || !isNonNegativeNumber(system.hydration),
      "warn",
      "bad-food-needs",
      "Food should have non-negative satiety and hydration.",
      context
    );
  }

  if (itemData.type === "tool") {
    pushIf(findings, !String(system.craftType ?? "").trim(), "warn", "missing-tool-craft-type", "Tool is missing craftType.", context);
  }

  if (itemData.type === "belt" || itemData.type === "backpack") {
    pushIf(findings, !isPlainObject(system.containerSlots), "error", "missing-container-slots", "Carry container is missing containerSlots.", context);
    pushIf(findings, isPlainObject(system.containerSlots) && (!isPositiveNumber(system.containerSlots.cols) || !isPositiveNumber(system.containerSlots.rows)), "error", "bad-container-slots", "Carry container slots should have positive cols/rows.", context, { containerSlots: system.containerSlots });
    pushIf(findings, !Array.isArray(system.attachmentSlots), "warn", "missing-attachment-slots", "Carry container should have attachmentSlots array.", context);
    pushIf(findings, !isPositiveNumber(system.weightFactor), "warn", "bad-weight-factor", "Carry container weightFactor should be positive.", context);
  }

  if (itemData.type === "attachment") {
    pushIf(findings, !String(system.attachesTo ?? "").trim(), "error", "missing-attachment-target", "Attachment is missing attachesTo.", context);
    pushIf(findings, !isPlainObject(system.addsSlots), "error", "missing-added-slots", "Attachment is missing addsSlots.", context);
    pushIf(findings, isPlainObject(system.addsSlots) && (!isPositiveNumber(system.addsSlots.cols) || !isPositiveNumber(system.addsSlots.rows)), "error", "bad-added-slots", "Attachment slots should have positive cols/rows.", context, { addsSlots: system.addsSlots });
    pushIf(findings, system.allowedTypes !== null && system.allowedTypes !== undefined && !Array.isArray(system.allowedTypes), "warn", "bad-allowed-types", "Attachment allowedTypes should be null or array.", context);
    pushIf(findings, !Array.isArray(system.allowedSkills), "warn", "bad-allowed-skills", "Attachment allowedSkills should be an array.", context);
    pushIf(findings, !isNonNegativeNumber(system.accessSeconds), "warn", "bad-attachment-access", "Attachment accessSeconds should be non-negative.", context, { accessSeconds: system.accessSeconds });
  }
}

function validateStackUnitEconomy(itemData, context, findings) {
  const system = itemData.system ?? {};
  const qty = Number(system.quantity ?? 1);
  if (!STACKABLE_ITEM_TYPES.has(itemData.type) || qty <= 1) return;

  const value = Number(system.value ?? 0);
  const weight = Number(system.weight ?? 0);
  const unitHints = context.unitHints ?? null;

  if (unitHints) {
    pushIf(
      findings,
      isPositiveNumber(unitHints.value) && value !== Number(unitHints.value),
      "warn",
      "stack-value-looks-totalized",
      "Stack value differs from the unit value hint; system.value should be per-item.",
      context,
      { quantity: qty, value, expectedUnitValue: unitHints.value }
    );
    pushIf(
      findings,
      isPositiveNumber(unitHints.weight) && weight !== Number(unitHints.weight),
      "warn",
      "stack-weight-looks-totalized",
      "Stack weight differs from the unit weight hint; system.weight should be per-item.",
      context,
      { quantity: qty, weight, expectedUnitWeight: unitHints.weight }
    );
    return;
  }

  pushIf(
    findings,
    value > 0 && qty > 1 && value / qty >= 100 && Number.isInteger(value / qty),
    "info",
    "stack-value-review",
    "Stack item has a high divisible value; verify it is a unit value, not total stack value.",
    context,
    { quantity: qty, value }
  );
}

export function validateItemData(itemLike, context = {}) {
  const itemData = asItemData(itemLike);
  const findings = [];
  if (!itemData) {
    return [finding("error", "missing-item-data", "Item data is missing.", context)];
  }

  const itemContext = {
    ...context,
    item: context.item ?? itemData.name ?? itemData._id ?? itemData.id ?? "",
    type: itemData.type ?? "",
  };
  const system = itemData.system;
  const type = itemData.type ?? "";
  const quantity = Number(system?.quantity ?? 0);

  pushIf(findings, !String(itemData.name ?? "").trim(), "error", "missing-name", "Item is missing name.", itemContext);
  pushIf(findings, !String(type).trim(), "error", "missing-type", "Item is missing type.", itemContext);
  pushIf(findings, type && !KNOWN_ITEM_TYPES.has(type), "warn", "unknown-type", "Item has an unknown type.", itemContext, { type });
  pushIf(findings, !isPlainObject(system), "error", "missing-system", "Item is missing system data.", itemContext);
  if (!isPlainObject(system)) return findings;

  if (TRADE_ITEM_TYPES.has(type)) {
    pushIf(findings, !String(itemData.img ?? "").trim(), "warn", "missing-img", "Tradeable item is missing img.", itemContext);
    pushIf(findings, itemData.img === "icons/svg/item-bag.svg", "info", "generic-img", "Item still uses the generic bag icon.", itemContext);
    pushIf(findings, !isPositiveNumber(system.value), "error", "bad-value", "Tradeable item should have positive unit system.value.", itemContext);
    pushIf(findings, system.price !== undefined && !isPositiveNumber(system.price), "warn", "bad-price", "Tradeable item system.price should be positive when present.", itemContext);
    pushIf(findings, !isNonNegativeNumber(system.weight), "warn", "bad-weight", "Tradeable item should have non-negative unit system.weight.", itemContext);
    pushIf(findings, !isPositiveNumber(system.gridW) || !isPositiveNumber(system.gridH), "error", "bad-grid", "Tradeable item should have positive gridW/gridH.", itemContext, { gridW: system.gridW, gridH: system.gridH });
    pushIf(findings, !Number.isInteger(quantity) || quantity < 1, "error", "bad-quantity", "Tradeable item should have integer quantity >= 1.", itemContext, { quantity: system.quantity });
  }

  if (DURABILITY_ITEM_TYPES.has(type)) validateDurability(itemData, itemContext, findings);
  if (ACTION_ITEM_TYPES.has(type)) validateActionItem(itemData, itemContext, findings);
  validateTypeSpecificItem(itemData, itemContext, findings);
  validateStackUnitEconomy(itemData, itemContext, findings);

  return findings;
}

function validateItemList(items, context = {}) {
  const findings = [];
  for (const item of items ?? []) {
    findings.push(...validateItemData(item, context));
  }
  return findings;
}

function validateActorData(actorLike, context = {}) {
  const actorData = asItemData(actorLike);
  const findings = [];
  if (!actorData) {
    return [finding("error", "missing-actor-data", "Actor data is missing.", context)];
  }

  const actorContext = {
    ...context,
    actor: context.actor ?? actorData.name ?? actorData._id ?? actorData.id ?? "",
    actorType: actorData.type ?? "",
  };
  pushIf(findings, !String(actorData.name ?? "").trim(), "error", "missing-actor-name", "Actor is missing name.", actorContext);
  pushIf(findings, !String(actorData.type ?? "").trim(), "error", "missing-actor-type", "Actor is missing type.", actorContext);
  if (actorData.type === "monster") {
    validateDamageResistanceObject(actorData.system?.resources?.armor, actorContext, findings, {
      prefix: "monster-armor",
      required: false,
    });
  }
  return findings;
}

function firstValue(collection) {
  return Object.values(collection ?? {})[0] ?? null;
}

function generatedSampleItems() {
  const weaponRow = firstValue(WEAPONS);
  const armorRow = firstValue(ARMORS);
  const potionRow = firstValue(POTIONS);
  const foodRow = firstValue(FOOD);
  const materialRow = firstValue(MATERIALS);
  const toolRow = firstValue(TOOLS);
  const spellRow = firstValue(SPELLS);
  const beltRow = firstValue(BELTS);
  const backpackRow = firstValue(BACKPACKS);
  const attachmentRow = firstValue(ATTACHMENTS);
  const consumableRow = firstValue(CONSUMABLES);
  const medicalRow = firstValue(MEDICAL_CONSUMABLES);
  const throwableRow = firstValue(THROWABLES);

  const foodStack = foodRow ? foodToItemData(foodRow, { quantity: 3 }) : null;
  const materialStack = materialRow ? materialToItemData(materialRow, { quantity: 4 }) : null;

  return [
    { sample: "generated.weapon", item: buildWeapon("Validation Sword", 2, { skill: "sword", damage: 5, weight: 2 }) },
    { sample: "generated.twoHanded", item: buildWeapon("Validation Spear", 2, { skill: "spear", twoHanded: true, damage: 5, weight: 3 }) },
    { sample: "generated.armor", item: buildArmor("Validation Armor", 2, "torso", 3, 0, 4) },
    { sample: "generated.food", item: buildFood("Validation Food", 1, 10, 2, 0.5, 3), unitHints: { value: buildFood("Validation Food Unit", 1, 10, 2, 0.5, 1).system.value, weight: buildFood("Validation Food Unit", 1, 10, 2, 0.5, 1).system.weight } },
    { sample: "generated.potion", item: buildPotion("Validation Potion", 2, "restoreEnergy", 10, "torso", 2) },
    { sample: "generated.scroll", item: buildScroll("Validation Scroll", 2, "fire", "damage", 5, "torso") },
    { sample: "generated.spell", item: buildSpell("Validation Spell", 2, "fire", "damage", 5, "torso", { manaCost: 8, spellId: "validation_spell" }) },
    { sample: "generated.throwable", item: buildThrowable("Validation Bomb", 2, 5, "magical", 0, 2, "torso", 2) },
    { sample: "generated.consumable", item: buildConsumable("Validation Bandage", 1, "reduceBleeding", 1, 3) },
    { sample: "generated.material", item: buildMaterial("Validation Material", 1, "fiber", 4, 0.2), unitHints: { value: buildMaterial("Validation Material Unit", 1, "fiber", 1, 0.2).system.value, weight: buildMaterial("Validation Material Unit", 1, "fiber", 1, 0.2).system.weight } },
    { sample: "generated.resource", item: buildResource("Validation Water", 1, "water", 2, 0.5) },
    { sample: "generated.tool", item: buildTool("Validation Kit", 2, "blacksmithing", 1) },
    weaponRow ? { sample: "catalog.weapon", item: weaponToItemData(weaponRow) } : null,
    armorRow ? { sample: "catalog.armor", item: armorToItemData(armorRow) } : null,
    potionRow ? { sample: "catalog.potion", item: potionToItemData(potionRow, { quantity: 2 }) } : null,
    foodRow ? { sample: "catalog.food.stack", item: foodStack, unitHints: { value: foodToItemData(foodRow).system.value, weight: foodToItemData(foodRow).system.weight } } : null,
    materialRow ? { sample: "catalog.material.stack", item: materialStack, unitHints: { value: materialToItemData(materialRow).system.value, weight: materialToItemData(materialRow).system.weight } } : null,
    toolRow ? { sample: "catalog.tool", item: toolToItemData(toolRow) } : null,
    spellRow ? { sample: "catalog.spell", item: spellToItemData(spellRow) } : null,
    beltRow ? { sample: "catalog.belt", item: beltToItemData(beltRow) } : null,
    backpackRow ? { sample: "catalog.backpack", item: backpackToItemData(backpackRow) } : null,
    attachmentRow ? { sample: "catalog.attachment", item: attachmentToItemData(attachmentRow) } : null,
    consumableRow ? { sample: "catalog.consumable", item: consumableToItemData(consumableRow, { quantity: 2 }) } : null,
    medicalRow ? { sample: "catalog.medical-consumable", item: consumableToItemData(medicalRow, { quantity: 2 }) } : null,
    throwableRow ? { sample: "catalog.throwable", item: throwableToItemData(throwableRow, { quantity: 2 }) } : null,
    foodRow ? { sample: "loot-line.food", item: itemDataFromLootLine({ type: "food", catalogId: foodRow.id, qty: 3 }), unitHints: { value: foodToItemData(foodRow).system.value, weight: foodToItemData(foodRow).system.weight } } : null,
    materialRow ? { sample: "loot-line.material", item: itemDataFromLootLine({ type: "material", catalogId: materialRow.id, qty: 3 }), unitHints: { value: materialToItemData(materialRow).system.value, weight: materialToItemData(materialRow).system.weight } } : null,
    throwableRow ? { sample: "loot-line.throwable", item: itemDataFromLootLine({ type: "throwable", catalogId: throwableRow.id, qty: 2 }) } : null,
    ...randomMerchantStock("general", 2).map((item, index) => ({ sample: `merchant.general.${index + 1}`, item })),
    ...randomMerchantStock("alchemist", 3).map((item, index) => ({ sample: `merchant.alchemist.${index + 1}`, item })),
    ...randomContainerLoot("bandit", 2).map((item, index) => ({ sample: `container.bandit.${index + 1}`, item })),
    ...randomContainerLoot("alchemy", 3).map((item, index) => ({ sample: `container.alchemy.${index + 1}`, item })),
    ...randomContainerLoot("military", 4).map((item, index) => ({ sample: `container.military.${index + 1}`, item })),
    ...buildPoiLootItems("mystic", 4).map((item, index) => ({ sample: `poi.mystic.${index + 1}`, item })),
    ...buildPoiLootItems("cursed", 4).map((item, index) => ({ sample: `poi.cursed.${index + 1}`, item })),
    ...registryKeys(WORLD_CONTENT_NPC_ROLES).flatMap((role) =>
      buildNpcRoleEquipmentItems(role, 4).map((item, index) => ({ sample: `npc-role-equipment.${role}.${index + 1}`, item }))
    ),
    ...registryKeys(WORLD_CONTENT_NPC_ROLES).flatMap((role) =>
      buildNpcCarryInventoryItems(role, 4).map((item, index) => ({ sample: `npc-carry.${role}.${index + 1}`, item }))
    ),
    ...registryKeys(WORLD_CONTENT_NPC_ROLES).flatMap((role) =>
      buildNpcStartingInventoryItems(role, 4).map((item, index) => ({ sample: `npc-starting.${role}.${index + 1}`, item }))
    ),
  ].filter(Boolean);
}

export function validateGeneratedContentSamples() {
  const findings = [];
  const samples = generatedSampleItems();

  for (const sample of samples) {
    findings.push(...validateItemDataWithCatalogHints(sample.item, {
      scope: "generated",
      sample: sample.sample,
      unitHints: sample.unitHints,
    }));
  }

  const counts = summarizeFindings(findings);
  return {
    scope: "generated",
    ok: findings.every((f) => f.severity !== "error"),
    itemsChecked: samples.length,
    counts,
    sections: [{
      scope: "generated",
      itemsChecked: samples.length,
      counts,
    }],
    findings,
  };
}

function normalizePackId(value) {
  return String(value ?? "").trim().replace(/^iron-hills-system\./, "");
}

function generatedPackFilter(packIds = null) {
  if (!Array.isArray(packIds) || !packIds.length) return null;
  return new Set(packIds.map(normalizePackId).filter(Boolean));
}

const UNIT_HINT_CATALOGS = Object.freeze({
  food: { rows: FOOD, converter: foodToItemData },
  material: { rows: MATERIALS, converter: materialToItemData },
  potion: { rows: POTIONS, converter: potionToItemData },
  consumable: { rows: CONSUMABLES, converter: consumableToItemData },
  throwable: { rows: THROWABLES, converter: throwableToItemData },
});

function catalogIdFromItemData(itemData) {
  return String(
    itemData?.flags?.["iron-hills-system"]?.catalogId
      ?? itemData?.system?.catalogId
      ?? ""
  ).trim();
}

function unitHintsFromCatalog(itemData) {
  if (!itemData || !STACKABLE_ITEM_TYPES.has(itemData.type)) return null;
  const catalogId = catalogIdFromItemData(itemData);
  if (!catalogId) return null;
  const catalog = UNIT_HINT_CATALOGS[itemData.type];
  const row = catalog?.rows?.[catalogId];
  if (!row) return null;

  try {
    const unitData = catalog.converter(row, { quantity: 1 });
    return {
      value: unitData?.system?.value,
      weight: unitData?.system?.weight,
    };
  } catch {
    return null;
  }
}

function asRecipeResultItemData(recipe) {
  const result = recipe?.result ?? null;
  if (!result) return null;
  return normalizeItemDataForInventory(result, {
    quantity: result.system?.quantity ?? 1,
  });
}

function validateItemDataWithCatalogHints(itemData, context = {}) {
  return validateItemData(itemData, {
    ...context,
    unitHints: context.unitHints ?? unitHintsFromCatalog(itemData),
  });
}

export function validateCraftRecipeSources() {
  const findings = [];
  const recipes = uniqueCraftRecipes();
  let itemsChecked = 0;

  for (const recipe of recipes) {
    const context = {
      scope: "craft-recipe",
      sample: recipe?.id ?? recipe?.label ?? "",
      item: recipe?.result?.name ?? "",
    };

    let data = null;
    try {
      data = asRecipeResultItemData(recipe);
    } catch (err) {
      findings.push(finding("error", "recipe-result-normalize-failed", "Craft recipe result could not be normalized.", context, { error: String(err?.message ?? err) }));
      continue;
    }

    if (!data) {
      findings.push(finding("error", "missing-recipe-result", "Craft recipe is missing result item data.", context));
      continue;
    }

    itemsChecked += 1;
    findings.push(...validateItemDataWithCatalogHints(data, {
      ...context,
      item: data.name ?? context.item,
    }));
  }

  return {
    scope: "craft-recipes",
    ok: findings.every((f) => f.severity !== "error"),
    itemsChecked,
    counts: summarizeFindings(findings),
    sections: [{
      scope: "craft-recipes",
      itemsChecked,
      counts: summarizeFindings(findings),
    }],
    findings,
  };
}

function alchemyRuleSample(rule) {
  const totalPotency = Math.max(1, Number(rule?.minPotency ?? 1));
  return {
    rule,
    totalPotency,
    totalVolatility: 0,
    effectTotals: Object.fromEntries((rule?.requires ?? []).map(key => [key, totalPotency])),
    power: typeof rule?.result?.power === "function" ? rule.result.power(totalPotency) : totalPotency,
    hydration: typeof rule?.result?.hydration === "function" ? rule.result.hydration(totalPotency) : 0,
    satiety: typeof rule?.result?.satiety === "function" ? rule.result.satiety(totalPotency) : 0,
  };
}

export function validateAlchemyMixingSources() {
  const findings = [];
  let itemsChecked = 0;

  for (const [index, rule] of (MIXING_RULES ?? []).entries()) {
    const context = {
      scope: "alchemy-rule",
      sample: `rule.${index + 1}`,
      item: rule?.result?.name ?? "",
    };

    let data = null;
    try {
      data = buildAlchemyResultItemData(alchemyRuleSample(rule), {
        tier: Math.max(1, Number(rule?.tier ?? 1)),
        quality: "common",
      });
    } catch (err) {
      findings.push(finding("error", "alchemy-result-build-failed", "Alchemy rule result could not be built.", context, { error: String(err?.message ?? err) }));
      continue;
    }

    if (!data) {
      findings.push(finding("warn", "alchemy-rule-without-item", "Alchemy rule does not produce item data.", context));
      continue;
    }

    itemsChecked += 1;
    findings.push(...validateItemDataWithCatalogHints(data, {
      ...context,
      item: data.name ?? context.item,
    }));
  }

  return {
    scope: "alchemy-rules",
    ok: findings.every((f) => f.severity !== "error"),
    itemsChecked,
    counts: summarizeFindings(findings),
    sections: [{
      scope: "alchemy-rules",
      itemsChecked,
      counts: summarizeFindings(findings),
    }],
    findings,
  };
}

function registryKeys(registry) {
  return Object.keys(registry ?? {});
}

function poiNpcThemeKeys() {
  return registryKeys(WORLD_CONTENT_POI_THEMES).filter((theme) => WORLD_CONTENT_POI_THEMES[theme]?.npcRole);
}

function validateWorldGeneratorItemBatch(findings, items, context = {}) {
  let itemsChecked = 0;
  for (const [index, itemData] of (items ?? []).entries()) {
    itemsChecked += 1;
    findings.push(...validateItemDataWithCatalogHints(itemData, {
      ...context,
      sample: context.sample ?? `${context.scope ?? "generator"}.${index + 1}`,
      item: itemData?.name ?? "",
    }));
  }
  return itemsChecked;
}

function validateShopStockEntry(entry, context, findings) {
  let itemsChecked = 0;

  if (!entry) {
    findings.push(finding("error", "missing-shop-stock-entry", "Generated shop stock entry is missing.", context));
    return itemsChecked;
  }

  pushIf(
    findings,
    !isPositiveNumber(entry.shopPrice),
    "error",
    "bad-shop-price",
    "Generated shop stock entry has invalid shopPrice.",
    context,
    { shopPrice: entry.shopPrice }
  );

  if (!entry.itemData) {
    findings.push(finding("error", "missing-shop-item-data", "Generated shop stock entry is missing itemData.", context));
  } else {
    itemsChecked += 1;
    findings.push(...validateItemDataWithCatalogHints(entry.itemData, {
      ...context,
      item: entry.itemData?.name ?? entry.label ?? "",
    }));
  }

  try {
    const purchaseData = buildShopPurchaseItemData(entry);
    if (!purchaseData) {
      findings.push(finding("error", "missing-shop-purchase-data", "Shop stock entry cannot build purchasable item data.", context));
    } else {
      itemsChecked += 1;
      findings.push(...validateItemDataWithCatalogHints(purchaseData, {
        ...context,
        item: purchaseData?.name ?? entry.label ?? "",
      }));
    }
  } catch (err) {
    findings.push(finding("error", "shop-purchase-build-failed", "Shop stock entry failed while building purchasable item data.", context, { error: String(err?.message ?? err) }));
  }

  return itemsChecked;
}

export function validateWorldGeneratorSources() {
  const findings = [];
  const sections = [];
  let itemsChecked = 0;

  const validateSection = (scope, fn) => {
    const start = findings.length;
    const beforeItems = itemsChecked;
    try {
      itemsChecked += Number(fn() ?? 0);
    } catch (err) {
      findings.push(finding("error", "world-generator-section-failed", "World generator validation section failed.", { scope }, { error: String(err?.message ?? err) }));
    }
    const sectionFindings = findings.slice(start);
    sections.push({
      scope,
      itemsChecked: itemsChecked - beforeItems,
      counts: summarizeFindings(sectionFindings),
    });
  };

  validateSection("world-tool-registries", () => {
    let checked = 0;

    for (const [poiType, definition] of Object.entries(WORLD_CONTENT_POI_TYPES ?? {})) {
      checked += 1;
      const context = { scope: "world-tool-registries", sample: `poi-type.${poiType}` };
      pushIf(findings, !String(definition?.label ?? "").trim(), "error", "missing-poi-type-label", "POI type registry entry is missing label.", context);
      pushIf(findings, !Array.isArray(definition?.themes) || definition.themes.length === 0, "error", "missing-poi-type-themes", "POI type registry entry must define at least one theme.", context);
      pushIf(findings, !Array.isArray(definition?.status) || definition.status.length === 0, "error", "missing-poi-type-status", "POI type registry entry must define at least one status.", context);
      for (const theme of definition?.themes ?? []) {
        pushIf(
          findings,
          !WORLD_CONTENT_POI_THEMES[theme],
          "error",
          "unknown-poi-type-theme",
          "POI type references a theme that is not registered.",
          context,
          { theme }
        );
      }
    }

    for (const [theme, definition] of Object.entries(WORLD_CONTENT_POI_THEMES ?? {})) {
      checked += 1;
      const context = { scope: "world-tool-registries", sample: `poi-theme.${theme}` };
      pushIf(findings, !String(definition?.label ?? "").trim(), "error", "missing-poi-theme-label", "POI theme registry entry is missing label.", context);
      pushIf(
        findings,
        definition?.lootTheme && !WORLD_CONTENT_CONTAINER_THEMES[definition.lootTheme],
        "error",
        "unknown-poi-loot-theme",
        "POI theme references a container loot theme that is not registered.",
        context,
        { lootTheme: definition?.lootTheme }
      );
      pushIf(
        findings,
        definition?.npcRole && !WORLD_CONTENT_NPC_ROLES[definition.npcRole],
        "error",
        "unknown-poi-npc-role",
        "POI theme references an NPC role that is not registered.",
        context,
        { npcRole: definition?.npcRole }
      );
    }

    return checked;
  });

  validateSection("shop-stock-generators", () => {
    let checked = 0;
    const economies = Object.keys(ECONOMY_STATES ?? { normal: {} });
    for (const merchantType of Object.keys(MERCHANT_TYPES ?? {})) {
      for (let settlementTier = 1; settlementTier <= 5; settlementTier += 1) {
        for (const economy of economies) {
          const seed = 1000 + settlementTier * 97 + economy.length;
          const result = generateMerchantStock(merchantType, settlementTier, seed, null, economy);
          const stock = result?.stock ?? [];
          pushIf(
            findings,
            economy === "normal" && stock.length === 0,
            "warn",
            "empty-normal-shop-stock",
            "Merchant stock generator returned no stock in normal economy.",
            { scope: "shop-stock-generators", sample: `${merchantType}.tier${settlementTier}.${economy}` }
          );
          for (const [index, entry] of stock.entries()) {
            checked += validateShopStockEntry(entry, {
              scope: "shop-stock-generators",
              sample: `${merchantType}.tier${settlementTier}.${economy}.${index + 1}`,
              item: entry?.label ?? "",
            }, findings);
          }
        }
      }
    }
    return checked;
  });

  validateSection("merchant-actor-stock-generators", () => {
    let checked = 0;
    const economies = Object.keys(ECONOMY_STATES ?? { normal: {} });
    for (const merchantType of Object.keys(MERCHANT_TYPES ?? {})) {
      for (let settlementTier = 1; settlementTier <= 5; settlementTier += 1) {
        for (const economy of economies) {
          const seed = 2000 + settlementTier * 101 + economy.length;
          const result = generateMerchantActorStockItems(merchantType, settlementTier, {
            seed,
            economyStatus: economy,
            limit: 12,
          });
          pushIf(
            findings,
            economy === "normal" && (result?.items?.length ?? 0) === 0,
            "warn",
            "empty-normal-merchant-actor-stock",
            "Merchant actor stock generator returned no actor items in normal economy.",
            { scope: "merchant-actor-stock-generators", sample: `${merchantType}.tier${settlementTier}.${economy}` }
          );
          checked += validateWorldGeneratorItemBatch(
            findings,
            result?.items ?? [],
            { scope: "merchant-actor-stock-generators", sample: `${merchantType}.tier${settlementTier}.${economy}` }
          );
        }
      }
    }
    return checked;
  });

  validateSection("world-merchant-loot-generators", () => {
    let checked = 0;
    for (const specialty of registryKeys(WORLD_CONTENT_MERCHANT_LOOT_SPECIALTIES)) {
      for (let tier = 1; tier <= 10; tier += 1) {
        checked += validateWorldGeneratorItemBatch(
          findings,
          randomMerchantStock(specialty, tier),
          { scope: "world-merchant-loot-generators", sample: `${specialty}.tier${tier}` }
        );
      }
    }
    return checked;
  });

  validateSection("container-loot-generators", () => {
    let checked = 0;
    for (const theme of registryKeys(WORLD_CONTENT_CONTAINER_THEMES)) {
      for (let tier = 1; tier <= 10; tier += 1) {
        checked += validateWorldGeneratorItemBatch(
          findings,
          randomContainerLoot(theme, tier),
          { scope: "container-loot-generators", sample: `${theme}.tier${tier}` }
        );
      }
    }
    return checked;
  });

  validateSection("poi-loot-generators", () => {
    let checked = 0;
    for (const theme of registryKeys(WORLD_CONTENT_POI_THEMES)) {
      for (let tier = 1; tier <= 10; tier += 1) {
        checked += validateWorldGeneratorItemBatch(
          findings,
          buildPoiLootItems(theme, tier),
          { scope: "poi-loot-generators", sample: `${theme}.tier${tier}` }
        );
      }
    }
    return checked;
  });

  validateSection("poi-npc-generators", () => {
    let checked = 0;
    for (const theme of poiNpcThemeKeys()) {
      for (let tier = 1; tier <= 10; tier += 1) {
        const npc = buildPoiNpcActorData(theme, tier, "");
        const context = { scope: "poi-npc-generators", sample: `${theme}.tier${tier}` };
        if (!npc?.roleKey || !npc?.data) {
          findings.push(finding("error", "missing-poi-npc-data", "POI theme should produce NPC actor data.", context));
          continue;
        }
        pushIf(findings, npc.data.type !== "npc", "error", "bad-poi-npc-type", "POI actor data should be an NPC.", context, { type: npc.data.type });
        pushIf(findings, !String(npc.data.name ?? "").trim(), "error", "missing-poi-npc-name", "POI actor data is missing name.", context);
        pushIf(findings, !isPlainObject(npc.data.system), "error", "missing-poi-npc-system", "POI actor data is missing system.", context);
        checked += validateWorldGeneratorItemBatch(
          findings,
          buildNpcStartingInventoryItems(npc.roleKey, tier),
          { ...context, sample: `${theme}.tier${tier}.${npc.roleKey}` }
        );
      }
    }
    return checked;
  });

  validateSection("npc-actor-generators", () => {
    let checked = 0;
    for (const role of registryKeys(WORLD_CONTENT_NPC_ROLES)) {
      for (let tier = 1; tier <= 10; tier += 1) {
        const npc = buildNpcActorData(role, tier, "");
        const context = { scope: "npc-actor-generators", sample: `${role}.tier${tier}` };
        if (!npc?.roleKey || !npc?.data) {
          findings.push(finding("error", "missing-npc-actor-data", "NPC role should produce actor data.", context));
          continue;
        }
        pushIf(findings, npc.data.type !== "npc", "error", "bad-npc-actor-type", "NPC actor data should be an NPC.", context, { type: npc.data.type });
        pushIf(findings, !String(npc.data.name ?? "").trim(), "error", "missing-npc-actor-name", "NPC actor data is missing name.", context);
        pushIf(findings, !isPlainObject(npc.data.system), "error", "missing-npc-actor-system", "NPC actor data is missing system.", context);
      }
    }
    return checked;
  });

  validateSection("npc-carry-generators", () => {
    let checked = 0;
    for (const role of registryKeys(WORLD_CONTENT_NPC_ROLES)) {
      for (let tier = 1; tier <= 10; tier += 1) {
        checked += validateWorldGeneratorItemBatch(
          findings,
          buildNpcCarryInventoryItems(role, tier),
          { scope: "npc-carry-generators", sample: `${role}.tier${tier}` }
        );
      }
    }
    return checked;
  });

  validateSection("npc-role-equipment-generators", () => {
    let checked = 0;
    for (const role of registryKeys(WORLD_CONTENT_NPC_ROLES)) {
      for (let tier = 1; tier <= 10; tier += 1) {
        checked += validateWorldGeneratorItemBatch(
          findings,
          buildNpcRoleEquipmentItems(role, tier),
          { scope: "npc-role-equipment-generators", sample: `${role}.tier${tier}` }
        );
      }
    }
    return checked;
  });

  validateSection("npc-starting-inventory-generators", () => {
    let checked = 0;
    for (const role of registryKeys(WORLD_CONTENT_NPC_ROLES)) {
      for (let tier = 1; tier <= 10; tier += 1) {
        checked += validateWorldGeneratorItemBatch(
          findings,
          buildNpcStartingInventoryItems(role, tier),
          { scope: "npc-starting-inventory-generators", sample: `${role}.tier${tier}` }
        );
      }
    }
    return checked;
  });

  validateSection("monster-harvest-generators", () => {
    let checked = 0;
    for (const poolKey of Object.keys(MONSTER_HARVEST_DROP_POOLS ?? {})) {
      checked += validateWorldGeneratorItemBatch(
        findings,
        buildMonsterHarvestEmbeddedItemData(poolKey),
        { scope: "monster-harvest-generators", sample: poolKey }
      );
    }
    return checked;
  });

  return {
    scope: "world-generators",
    ok: findings.every((f) => f.severity !== "error"),
    itemsChecked,
    counts: summarizeFindings(findings),
    sections,
    findings,
  };
}

export function validateGeneratedPackSources(options = {}) {
  const filter = generatedPackFilter(options.packIds ?? null);
  const sections = [];
  const findings = [];
  let itemsChecked = 0;
  let actorsChecked = 0;

  for (const spec of GENERATED_PACKS ?? []) {
    if (filter && !filter.has(spec.packName)) continue;

    const sectionFindings = [];
    let sectionItems = 0;
    let sectionActors = 0;

    for (const [key, row] of Object.entries(spec.rows ?? {})) {
      const context = {
        scope: "generated-pack-source",
        pack: spec.packName,
        sample: key,
      };

      let data = null;
      try {
        data = spec.converter(row, key);
      } catch (err) {
        sectionFindings.push(finding(
          "error",
          "conversion-failed",
          "Generated pack row could not be converted.",
          context,
          { error: String(err?.message ?? err) }
        ));
        continue;
      }

      if (spec.documentType === "Item") {
        sectionItems += 1;
        sectionFindings.push(...validateItemDataWithCatalogHints(data, {
          ...context,
          item: data?.name ?? key,
        }));
        continue;
      }

      if (spec.documentType === "Actor") {
        sectionActors += 1;
        const actorName = data?.name ?? key;
        sectionFindings.push(...validateActorData(data, {
          ...context,
          actor: actorName,
        }));
        const embeddedItems = Array.isArray(data?.items) ? data.items : [];
        for (const itemData of embeddedItems) {
          sectionItems += 1;
          sectionFindings.push(...validateItemDataWithCatalogHints(itemData, {
            ...context,
            actor: actorName,
            item: itemData?.name ?? "",
          }));
        }
      }
    }

    itemsChecked += sectionItems;
    actorsChecked += sectionActors;
    findings.push(...sectionFindings);
    sections.push({
      scope: spec.packName,
      itemsChecked: sectionItems,
      actorsChecked: sectionActors,
      counts: summarizeFindings(sectionFindings),
    });
  }

  return {
    label: "Iron Hills generated pack source validation",
    scope: "generated-pack-source",
    ok: findings.every((f) => f.severity !== "error"),
    itemsChecked,
    actorsChecked,
    counts: summarizeFindings(findings),
    sections,
    findings,
  };
}

function summarizeFindings(findings) {
  const out = { error: 0, warn: 0, info: 0 };
  for (const f of findings ?? []) {
    out[f.severity] = (out[f.severity] ?? 0) + 1;
  }
  return out;
}

async function validateWorldActors() {
  const findings = [];
  let itemsChecked = 0;
  if (!globalThis.game?.actors) return { scope: "world", itemsChecked, findings };

  for (const actor of game.actors) {
    findings.push(...validateActorData(actor, {
      scope: "world",
      actor: `${actor.name} (${actor.type})`,
    }));
    const items = Array.from(actor.items ?? []);
    itemsChecked += items.length;
    for (const item of items) {
      findings.push(...validateItemDataWithCatalogHints(asItemData(item), {
        scope: "world",
        actor: `${actor.name} (${actor.type})`,
      }));
    }
  }

  return { scope: "world", itemsChecked, findings };
}

async function validatePacks({ packIds = null } = {}) {
  const findings = [];
  let itemsChecked = 0;
  if (!globalThis.game?.packs) return { scope: "packs", itemsChecked, findings };

  const wanted = Array.isArray(packIds) && packIds.length ? new Set(packIds) : null;
  const packCollection = typeof game.packs.values === "function"
    ? Array.from(game.packs.values())
    : Array.from(game.packs);
  const packs = packCollection
    .map((pack) => Array.isArray(pack) ? pack[1] : pack)
    .filter(Boolean)
    .filter((pack) => {
      const packageName = pack.metadata?.packageName ?? pack.metadata?.package ?? "";
      if (packageName && packageName !== "iron-hills-system") return false;
      const id = pack.collection ?? pack.metadata?.id ?? "";
      if (wanted && !wanted.has(id) && !wanted.has(pack.metadata?.name)) return false;
      return pack.documentName === "Item" || pack.documentName === "Actor" || pack.metadata?.type === "Item" || pack.metadata?.type === "Actor";
    });

  for (const pack of packs) {
    const packLabel = pack.collection ?? pack.metadata?.label ?? pack.metadata?.name ?? "pack";
    let docs = [];
    try {
      docs = await pack.getDocuments();
    } catch (err) {
      findings.push(finding("warn", "pack-read-failed", "Could not read compendium pack.", { scope: "packs", pack: packLabel }, { error: String(err?.message ?? err) }));
      continue;
    }

    for (const doc of docs) {
      if (doc.documentName === "Item" || doc.constructor?.documentName === "Item" || (doc.type && doc.system && !doc.items)) {
        itemsChecked += 1;
        findings.push(...validateItemDataWithCatalogHints(asItemData(doc), { scope: "packs", pack: packLabel }));
        continue;
      }

      const embedded = Array.from(doc.items ?? []);
      itemsChecked += embedded.length;
      for (const item of embedded) {
        findings.push(...validateItemDataWithCatalogHints(asItemData(item), {
          scope: "packs",
          pack: packLabel,
          actor: `${doc.name} (${doc.type})`,
        }));
      }
    }
  }

  return { scope: "packs", itemsChecked, findings };
}

export async function validateIronHillsContent(options = {}) {
  const {
    includeGenerated = true,
    includeRecipes = true,
    includeAlchemy = true,
    includeWorldGenerators = true,
    includeWorld = true,
    includePacks = true,
    packIds = null,
  } = options;

  const sections = [];
  if (includeGenerated) sections.push(validateGeneratedContentSamples());
  if (includeRecipes) sections.push(validateCraftRecipeSources());
  if (includeAlchemy) sections.push(validateAlchemyMixingSources());
  if (includeWorldGenerators) sections.push(validateWorldGeneratorSources());
  if (includeWorld) sections.push(await validateWorldActors());
  if (includePacks) sections.push(await validatePacks({ packIds }));

  const findings = sections.flatMap((section) => section.findings ?? []);
  const itemsChecked = sections.reduce((sum, section) => sum + Number(section.itemsChecked ?? 0), 0);

  return {
    ok: findings.every((f) => f.severity !== "error"),
    itemsChecked,
    counts: summarizeFindings(findings),
    sections: sections.map((section) => ({
      scope: section.scope,
      itemsChecked: section.itemsChecked,
      counts: summarizeFindings(section.findings),
      sections: section.sections ?? undefined,
    })),
    findings,
  };
}

export function formatContentValidationReport(report, { maxFindings = 20 } = {}) {
  const counts = report?.counts ?? {};
  const title = report?.label ?? "Iron Hills content validation";
  const lines = [
    `${title}: ${report?.ok ? "OK" : "ISSUES"}`,
    `Items checked: ${report?.itemsChecked ?? 0}`,
    `Errors: ${counts.error ?? 0}, warnings: ${counts.warn ?? 0}, info: ${counts.info ?? 0}`,
  ];

  for (const section of report?.sections ?? []) {
    lines.push(
      `- ${section.scope}: ${section.itemsChecked} items, ` +
      `${section.counts.error ?? 0} errors, ${section.counts.warn ?? 0} warnings, ${section.counts.info ?? 0} info`
    );
    for (const sub of section.sections ?? []) {
      if (sub.scope === section.scope) continue;
      lines.push(
        `  - ${sub.scope}: ${sub.itemsChecked} items, ` +
        `${sub.counts.error ?? 0} errors, ${sub.counts.warn ?? 0} warnings, ${sub.counts.info ?? 0} info`
      );
    }
  }

  const findings = report?.findings ?? [];
  if (findings.length) {
    lines.push("Top findings:");
    for (const f of findings.slice(0, maxFindings)) {
      lines.push(`- [${f.severity}] ${f.code}: ${f.path || "(unknown)"} - ${f.message}`);
    }
    if (findings.length > maxFindings) {
      lines.push(`...and ${findings.length - maxFindings} more findings.`);
    }
  }

  return lines.join("\n");
}
