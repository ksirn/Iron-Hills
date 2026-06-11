import { normalizeItemDataForInventory } from "../utils/catalog-item-data.mjs";
import {
  normalizeItemActionSystem,
  normalizeThrowableSystem,
} from "../utils/item-runtime-normalization.mjs";
import { normalizeSpellSchoolKey } from "../constants/spells-catalog.mjs";
import { getDefaultWeaponRange } from "../utils/item-utils.mjs";
import { recalculateActorWeight } from "./inventory-service.mjs";
import { normalizeAoeConfig } from "./aoe-policy-service.mjs";
import { validateItemData } from "./content-validation-service.mjs";
import { normalizeDamageType } from "./damage-type-service.mjs";

const GENERIC_ITEM_IMAGES = new Set(["", "icons/svg/item-bag.svg"]);

const REPAIRABLE_TYPES = new Set([
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

const DEFAULT_WEIGHT = Object.freeze({
  weapon: 2,
  armor: 3,
  tool: 2,
  resource: 0.5,
  food: 0.5,
  material: 0.2,
  spell: 0,
  potion: 0.3,
  scroll: 0.1,
  throwable: 1,
  consumable: 0.2,
  jewelry: 0.1,
  belt: 0.5,
  backpack: 1,
  attachment: 0.3,
});

const DEFAULT_IMAGES = Object.freeze({
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
  consumable: {
    bandage: "icons/commodities/cloth/cloth-roll-white.webp",
    tourniquet: "icons/commodities/leather/leather-belt-brown.webp",
    splint: "icons/commodities/wood/wood-stick-brown.webp",
    surgery: "icons/tools/hand/needle-grey.webp",
    default: "icons/consumables/potions/potion-round-empty-green.webp",
  },
  spell: {
    fire: "icons/magic/fire/flame-burning-campfire-orange.webp",
    ice: "icons/magic/water/ice-block-frozen-mountain.webp",
    lightning: "icons/magic/lightning/bolt-strike-blue.webp",
    shadow: "icons/magic/unholy/orb-glowing-green.webp",
    light: "icons/magic/holy/projectile-orb-yellow.webp",
    earth: "icons/magic/earth/projectile-boulder-brown.webp",
    mind: "icons/magic/symbols/rune-sigil-purple-pink.webp",
    summon: "icons/magic/life/cross-worn-green.webp",
    life: "icons/magic/life/cross-worn-green.webp",
    default: "icons/magic/symbols/rune-sigil-purple-pink.webp",
  },
  food: "icons/consumables/food/bread-loaf-round-brown.webp",
  potion: "icons/consumables/potions/potion-round-empty-green.webp",
  scroll: "icons/sundries/scrolls/scroll-bound-sealed-red.webp",
  throwable: "icons/weapons/thrown/bomb-fuse-black.webp",
  jewelry: "icons/equipment/neck/amulet-round-gold.webp",
  belt: "icons/equipment/waist/belt-leather-brown.webp",
  backpack: "icons/containers/bags/pack-leather-brown.webp",
  attachment: "icons/containers/bags/pouch-leather-brown.webp",
});

const ARMOR_COVERS = Object.freeze({
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

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cleanTier(value) {
  const n = Math.round(Number(value) || 1);
  return Math.max(1, Math.min(10, n));
}

function cleanQuantity(value) {
  return Math.max(1, Math.floor(Number(value) || 1));
}

function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function isNonNegativeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

function cleanNonNegative(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function cleanPositive(value, fallback = 1) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function deepEqual(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function fieldDiffs(original, repaired) {
  const fields = [];
  if (!deepEqual(original.img, repaired.img)) fields.push("img");
  if (!deepEqual(original.flags ?? {}, repaired.flags ?? {})) fields.push("flags");

  const beforeSystem = original.system ?? {};
  const afterSystem = repaired.system ?? {};
  for (const key of new Set([...Object.keys(beforeSystem), ...Object.keys(afterSystem)])) {
    if (!deepEqual(beforeSystem[key], afterSystem[key])) fields.push(`system.${key}`);
  }
  return fields;
}

function defaultDurability(type, tier) {
  const clean = cleanTier(tier);
  const max = type === "weapon"
    ? 40 + clean * 10
    : type === "armor"
      ? 50 + clean * 15
      : 30 + clean * 8;
  return { value: max, max };
}

function repairDurability(system, type) {
  const current = isPlainObject(system.durability) ? system.durability : null;
  const fallback = defaultDurability(type, system.tier);
  const max = cleanPositive(current?.max, cleanPositive(current?.value, fallback.max));
  const value = Math.min(max, cleanNonNegative(current?.value, max));
  system.durability = { ...(current ?? {}), value, max };
}

function repairCommonFields(data) {
  const type = data.type;
  const system = data.system;
  if (!REPAIRABLE_TYPES.has(type)) return;

  system.tier = cleanTier(system.tier);
  system.quantity = cleanQuantity(system.quantity);
  system.weight = cleanNonNegative(system.weight, DEFAULT_WEIGHT[type] ?? 1);
  if (!system.quality && !["material", "resource"].includes(type)) system.quality = "common";
}

function repairImage(data) {
  const img = String(data.img ?? "").trim();
  if (!GENERIC_ITEM_IMAGES.has(img)) return;

  const type = data.type;
  const system = data.system ?? {};

  if (type === "weapon") {
    data.img = DEFAULT_IMAGES.weapon[system.skill] ?? DEFAULT_IMAGES.weapon.sword;
    return;
  }
  if (type === "armor") {
    data.img = DEFAULT_IMAGES.armor[system.slot] ?? DEFAULT_IMAGES.armor.torso;
    return;
  }
  if (type === "material") {
    data.img = DEFAULT_IMAGES.material[system.category] ?? DEFAULT_IMAGES.material.default;
    return;
  }
  if (type === "resource") {
    data.img = DEFAULT_IMAGES.resource[system.category] ?? DEFAULT_IMAGES.resource.default;
    return;
  }
  if (type === "tool") {
    data.img = DEFAULT_IMAGES.tool[system.craftType] ?? DEFAULT_IMAGES.tool.default;
    return;
  }
  if (type === "consumable") {
    const key = system.actionType || system.effectType || system.effect || "default";
    data.img = DEFAULT_IMAGES.consumable[key] ?? DEFAULT_IMAGES.consumable.default;
    return;
  }
  if (type === "spell") {
    data.img = DEFAULT_IMAGES.spell[system.school] ?? DEFAULT_IMAGES.spell.default;
    return;
  }

  data.img = DEFAULT_IMAGES[type] ?? "icons/svg/item-bag.svg";
}

function repairActionItem(system, type) {
  normalizeItemActionSystem(system, {
    type,
    ensurePower: true,
    fallbackPower: type === "consumable" ? 1 : 5,
    targetPart: type === "consumable" ? "" : "torso",
  });
}

function repairAoe(system, {
  required = false,
  fallbackDistance = 0,
  fallbackFriendlyFireMode = "off",
  damageType = "physical",
} = {}) {
  if (!required && !isPlainObject(system.aoe)) return;

  const raw = isPlainObject(system.aoe) ? system.aoe : {};
  const config = normalizeAoeConfig({
    ...raw,
    friendlyFireMode: raw.friendlyFireMode ?? system.friendlyFireMode,
    friendlyFire: raw.friendlyFire ?? system.friendlyFire,
    targetZone: raw.targetZone ?? system.targetZone,
    targetPart: raw.targetPart ?? system.targetPart,
    damageType,
  }, {
    shape: "circle",
    type: "blast",
    distance: fallbackDistance,
    chainDecay: 1,
    friendlyFireMode: fallbackFriendlyFireMode,
    damageType,
  });

  system.aoe = {
    ...raw,
    type: config.type,
    shape: config.shape,
    distance: config.distance,
    maxTargets: config.maxTargets,
    chainDecay: config.chainDecay,
    targetZoneMode: config.targetZoneMode,
    friendlyFireMode: config.friendlyFireMode,
    ...(config.targetZone ? { targetZone: config.targetZone } : {}),
  };
  system.friendlyFireMode = String(system.friendlyFireMode ?? "").trim() || config.friendlyFireMode;
  system.friendlyFire = Boolean(config.friendlyFire);
}

function repairTypeSpecificFields(data) {
  const type = data.type;
  const system = data.system;

  if (type === "weapon") {
    system.skill = String(system.skill ?? "").trim() || "sword";
    system.damage = cleanPositive(system.damage, 2);
    system.damageType = normalizeDamageType(system.damageType, { fallback: "physical" });
    system.energyCost = cleanNonNegative(system.energyCost, 8);
    system.timeCost = cleanPositive(system.timeCost, 2);
    system.range = cleanPositive(system.range, getDefaultWeaponRange(system.skill));
    if (!isPlainObject(system.affixes)) {
      system.affixes = {
        ignoreArmor: 0,
        disarmChance: 0,
        stunChance: 0,
        bleedingBonus: 0,
        lifeSteal: 0,
        executeBelowHp: 0,
        criticalDamageMult: 1,
      };
    }
    repairDurability(system, type);
  }

  if (type === "armor") {
    system.slot = String(system.slot ?? "").trim() || "torso";
    if (!isPlainObject(system.protection)) {
      system.protection = { physical: cleanTier(system.tier), magical: 0 };
    } else {
      system.protection = {
        ...system.protection,
        physical: cleanNonNegative(system.protection.physical, cleanTier(system.tier)),
        magical: cleanNonNegative(system.protection.magical, 0),
      };
    }
    if (!Array.isArray(system.covers) || !system.covers.length) {
      system.covers = ARMOR_COVERS[system.slot] ?? ["torso"];
    }
    system.layer = String(system.layer ?? "").trim() || "outer";
    repairDurability(system, type);
  }

  if (type === "tool") {
    system.craftType = String(system.craftType ?? "").trim() || "crafting";
    repairDurability(system, type);
  }

  if (type === "food") {
    system.satiety = cleanNonNegative(system.satiety, 10);
    system.hydration = cleanNonNegative(system.hydration, 0);
  }

  if (type === "material") {
    system.category = String(system.category ?? "").trim() || "misc";
  }

  if (type === "resource") {
    system.category = String(system.category ?? "").trim() || "misc";
  }

  if (type === "spell") {
    system.school = normalizeSpellSchoolKey(system.school, { fallback: "light" });
    system.rank = cleanTier(system.rank ?? system.tier);
    system.manaCost = cleanNonNegative(system.manaCost, 0);
    system.energyCost = cleanNonNegative(system.energyCost, 0);
    system.castTime = cleanNonNegative(system.castTime, 0);
    system.damageType = normalizeDamageType(system.damageType, { fallback: "magical" });
    system.power = cleanPositive(system.power, Math.max(1, Number(system.damage ?? 0)));
    system.applicationScope = String(system.applicationScope ?? "").trim() || (system.aoe ? "area" : "targeted");
    system.targetActorMode = String(system.targetActorMode ?? "").trim() || (system.aoe ? "area" : "selected-only");
    system.targetPart = String(system.targetPart ?? "").trim() || "torso";
    repairAoe(system, {
      required: false,
      fallbackDistance: 0,
      fallbackFriendlyFireMode: system.friendlyFireMode ?? "off",
      damageType: system.damageType,
    });
  }

  if (type === "scroll") {
    system.school = normalizeSpellSchoolKey(system.school, { fallback: "light" });
    system.rank = cleanTier(system.rank ?? system.tier);
    system.damageType = normalizeDamageType(system.damageType, { fallback: "magical" });
    repairAoe(system, {
      required: false,
      fallbackDistance: 0,
      fallbackFriendlyFireMode: system.friendlyFireMode ?? "off",
      damageType: system.damageType,
    });
  }

  if (type === "throwable") {
    normalizeThrowableSystem(system, {
      tier: system.tier,
      fallbackPower: 2,
      ensurePower: true,
      ensureAoeObject: true,
    });
  }

  if (type === "potion" || type === "consumable" || type === "scroll") {
    repairActionItem(system, type);
  }

  if (type === "jewelry") {
    system.slot = String(system.slot ?? "").trim() || "neck";
    if (!isPlainObject(system.bonuses)) {
      system.bonuses = { energy: 0, mana: 0, initiative: 0, spellPower: 0 };
    }
  }

  if (type === "belt") {
    if (!isPlainObject(system.containerSlots)) system.containerSlots = { cols: 3, rows: 1 };
    if (!Array.isArray(system.attachmentSlots)) system.attachmentSlots = [];
    system.weightFactor = cleanPositive(system.weightFactor, 1);
    repairDurability(system, type);
  }

  if (type === "backpack") {
    if (!isPlainObject(system.containerSlots)) system.containerSlots = { cols: 5, rows: 6 };
    if (!Array.isArray(system.attachmentSlots)) system.attachmentSlots = [];
    system.weightFactor = cleanPositive(system.weightFactor, 0.9);
    repairDurability(system, type);
  }

  if (type === "attachment") {
    system.attachesTo = String(system.attachesTo ?? "").trim() || "belt";
    if (!isPlainObject(system.addsSlots)) system.addsSlots = { cols: 2, rows: 1 };
    if (!Array.isArray(system.allowedSkills)) system.allowedSkills = [];
    repairDurability(system, type);
  }
}

function buildPatch(original, repaired) {
  const patch = {};
  if (!deepEqual(original.img, repaired.img)) patch.img = repaired.img;
  if (!deepEqual(original.system ?? {}, repaired.system ?? {})) patch.system = repaired.system;
  if (!deepEqual(original.flags ?? {}, repaired.flags ?? {})) patch.flags = repaired.flags;
  return patch;
}

export function repairItemData(itemLike, context = {}) {
  const original = asItemData(itemLike);
  if (!original) {
    return {
      changed: false,
      patch: {},
      fields: [],
      itemData: null,
      beforeFindings: validateItemData(null, context),
      afterFindings: validateItemData(null, context),
    };
  }

  const itemContext = {
    ...context,
    item: context.item ?? original.name ?? original._id ?? original.id ?? "",
    type: original.type ?? "",
  };
  const beforeFindings = validateItemData(original, itemContext);

  if (!REPAIRABLE_TYPES.has(original.type)) {
    return {
      changed: false,
      patch: {},
      fields: [],
      itemData: original,
      beforeFindings,
      afterFindings: beforeFindings,
      context: itemContext,
    };
  }

  const prepared = clonePlain(original);
  prepared.system = isPlainObject(prepared.system) ? prepared.system : {};
  repairCommonFields(prepared);
  repairTypeSpecificFields(prepared);

  const normalized = normalizeItemDataForInventory(prepared, {
    quantity: prepared.system?.quantity,
  });
  normalized.flags = clonePlain(prepared.flags ?? original.flags ?? {});
  repairTypeSpecificFields(normalized);
  repairImage(normalized);

  const patch = buildPatch(original, normalized);
  const fields = fieldDiffs(original, normalized);
  const afterFindings = validateItemData(normalized, itemContext);

  return {
    changed: Object.keys(patch).length > 0,
    patch,
    fields,
    itemData: normalized,
    beforeFindings,
    afterFindings,
    context: itemContext,
  };
}

function summarizeFindings(findings) {
  const out = { error: 0, warn: 0, info: 0 };
  for (const f of findings ?? []) {
    out[f.severity] = (out[f.severity] ?? 0) + 1;
  }
  return out;
}

function summarizeSection(section) {
  return {
    scope: section.scope,
    itemsChecked: section.itemsChecked,
    itemsChanged: section.itemsChanged,
    documentsChanged: section.documentsChanged,
    counts: summarizeFindings(section.residualFindings),
    errors: section.errors.length,
  };
}

function mergeSections(sections, apply, scope = "") {
  const changes = sections.flatMap(section => section.changes);
  const residualFindings = sections.flatMap(section => section.residualFindings);
  const errors = sections.flatMap(section => section.errors);
  return {
    scope,
    apply,
    ok: errors.length === 0 && residualFindings.every(f => f.severity !== "error"),
    itemsChecked: sections.reduce((sum, section) => sum + section.itemsChecked, 0),
    itemsChanged: sections.reduce((sum, section) => sum + section.itemsChanged, 0),
    documentsChanged: sections.reduce((sum, section) => sum + section.documentsChanged, 0),
    counts: summarizeFindings(residualFindings),
    sections: sections.map(summarizeSection),
    changes,
    residualFindings,
    errors,
  };
}

function changeRecord(result, context) {
  return {
    scope: context.scope,
    pack: context.pack ?? "",
    actor: context.actor ?? "",
    item: context.item ?? result.context?.item ?? "",
    id: context.id ?? "",
    type: result.context?.type ?? "",
    fields: result.fields,
    before: summarizeFindings(result.beforeFindings),
    after: summarizeFindings(result.afterFindings),
  };
}

async function repairActorEmbeddedItems(actor, {
  scope,
  pack = "",
  apply = false,
  recalculateWeight = false,
} = {}) {
  const changes = [];
  const residualFindings = [];
  const errors = [];
  const updates = [];
  let itemsChecked = 0;

  for (const item of Array.from(actor?.items ?? [])) {
    itemsChecked += 1;
    const itemData = asItemData(item);
    const context = {
      scope,
      pack,
      actor: `${actor.name} (${actor.type})`,
      item: itemData?.name ?? item?.name ?? item?.id ?? "",
      id: itemData?._id ?? itemData?.id ?? item?.id ?? "",
    };
    const result = repairItemData(item, context);
    residualFindings.push(...result.afterFindings);

    if (!result.changed) continue;

    changes.push(changeRecord(result, context));
    if (apply) {
      updates.push({
        _id: item.id ?? itemData?._id ?? itemData?.id,
        ...result.patch,
      });
    }
  }

  if (apply && updates.length) {
    try {
      await actor.updateEmbeddedDocuments("Item", updates);
      if (recalculateWeight) await recalculateActorWeight(actor);
    } catch (err) {
      errors.push({
        scope,
        pack,
        actor: `${actor?.name ?? "Actor"} (${actor?.type ?? "unknown"})`,
        error: String(err?.message ?? err),
      });
    }
  }

  return {
    scope,
    itemsChecked,
    itemsChanged: changes.length,
    documentsChanged: updates.length ? 1 : 0,
    changes,
    residualFindings,
    errors,
  };
}

async function repairWorldActors({ apply = false } = {}) {
  const sections = [];
  if (!globalThis.game?.actors) {
    return {
      scope: "world",
      itemsChecked: 0,
      itemsChanged: 0,
      documentsChanged: 0,
      changes: [],
      residualFindings: [],
      errors: [],
    };
  }

  for (const actor of game.actors) {
    const section = await repairActorEmbeddedItems(actor, {
      scope: "world",
      apply,
      recalculateWeight: true,
    });
    sections.push(section);
  }

  return mergeSections(sections, apply, "world");
}

function getPackCollection() {
  if (!globalThis.game?.packs) return [];
  const values = typeof game.packs.values === "function"
    ? Array.from(game.packs.values())
    : Array.from(game.packs);
  return values.map(pack => Array.isArray(pack) ? pack[1] : pack).filter(Boolean);
}

function isIronHillsPack(pack) {
  const packageName = pack.metadata?.packageName ?? pack.metadata?.package ?? "";
  return !packageName || packageName === "iron-hills-system";
}

function packWanted(pack, wanted) {
  if (!wanted) return true;
  const names = [
    pack.collection,
    pack.metadata?.id,
    pack.metadata?.name,
    pack.metadata?.label,
    pack.metadata?.name ? `iron-hills-system.${pack.metadata.name}` : "",
  ].filter(Boolean);
  return names.some(name => wanted.has(name));
}

function isSupportedPack(pack) {
  return pack.documentName === "Item"
    || pack.documentName === "Actor"
    || pack.metadata?.type === "Item"
    || pack.metadata?.type === "Actor";
}

function isItemDocument(doc) {
  return doc?.documentName === "Item"
    || doc?.constructor?.documentName === "Item"
    || (doc?.type && doc?.system && !doc?.items);
}

async function repairItemDocument(doc, {
  scope,
  pack,
  apply = false,
} = {}) {
  const itemData = asItemData(doc);
  const context = {
    scope,
    pack,
    item: itemData?.name ?? doc?.name ?? doc?.id ?? "",
    id: itemData?._id ?? itemData?.id ?? doc?.id ?? "",
  };
  const result = repairItemData(doc, context);
  const section = {
    scope,
    itemsChecked: 1,
    itemsChanged: result.changed ? 1 : 0,
    documentsChanged: 0,
    changes: result.changed ? [changeRecord(result, context)] : [],
    residualFindings: result.afterFindings,
    errors: [],
  };

  if (apply && result.changed) {
    try {
      await doc.update(result.patch);
      section.documentsChanged = 1;
    } catch (err) {
      section.errors.push({
        scope,
        pack,
        item: context.item,
        error: String(err?.message ?? err),
      });
    }
  }

  return section;
}

async function repairPacks({ apply = false, packIds = null } = {}) {
  const wanted = Array.isArray(packIds) && packIds.length ? new Set(packIds) : null;
  const sections = [];
  const packs = getPackCollection()
    .filter(isIronHillsPack)
    .filter(pack => packWanted(pack, wanted))
    .filter(isSupportedPack);

  for (const pack of packs) {
    const packLabel = pack.collection ?? pack.metadata?.label ?? pack.metadata?.name ?? "pack";
    const wasLocked = Boolean(pack.locked ?? pack.metadata?.locked);
    if (apply && wasLocked) {
      try {
        await pack.configure({ locked: false });
      } catch (err) {
        sections.push({
          scope: "packs",
          itemsChecked: 0,
          itemsChanged: 0,
          documentsChanged: 0,
          changes: [],
          residualFindings: [],
          errors: [{
            scope: "packs",
            pack: packLabel,
            error: String(err?.message ?? err),
          }],
        });
        continue;
      }
    }

    try {
      const docs = await pack.getDocuments();
      for (const doc of docs) {
        if (isItemDocument(doc)) {
          sections.push(await repairItemDocument(doc, {
            scope: "packs",
            pack: packLabel,
            apply,
          }));
          continue;
        }

        sections.push(await repairActorEmbeddedItems(doc, {
          scope: "packs",
          pack: packLabel,
          apply,
        }));
      }
    } catch (err) {
      sections.push({
        scope: "packs",
        itemsChecked: 0,
        itemsChanged: 0,
        documentsChanged: 0,
        changes: [],
        residualFindings: [],
        errors: [{
          scope: "packs",
          pack: packLabel,
          error: String(err?.message ?? err),
        }],
      });
    } finally {
      if (apply && wasLocked) {
        await pack.configure({ locked: true }).catch(() => {});
      }
    }
  }

  return mergeSections(sections, apply, "packs");
}

export async function repairIronHillsContent(options = {}) {
  const {
    apply = false,
    includeWorld = true,
    includePacks = true,
    packIds = null,
  } = options;

  const sections = [];
  if (includeWorld) sections.push(await repairWorldActors({ apply }));
  if (includePacks) sections.push(await repairPacks({ apply, packIds }));

  return mergeSections(sections, apply, "all");
}

export function formatContentRepairReport(report, { maxChanges = 20, maxErrors = 10, maxFindings = 10 } = {}) {
  const mode = report?.apply ? "APPLIED" : "DRY RUN";
  const counts = report?.counts ?? {};
  const lines = [
    `Iron Hills content repair: ${mode}`,
    `Items checked: ${report?.itemsChecked ?? 0}`,
    `Items needing repair: ${report?.itemsChanged ?? 0}`,
    `Documents changed: ${report?.documentsChanged ?? 0}`,
    `Residual findings: ${counts.error ?? 0} errors, ${counts.warn ?? 0} warnings, ${counts.info ?? 0} info`,
  ];

  for (const section of report?.sections ?? []) {
    lines.push(
      `- ${section.scope}: ${section.itemsChecked} checked, ${section.itemsChanged} items, ` +
      `${section.documentsChanged} docs, residual ${section.counts.error ?? 0}/${section.counts.warn ?? 0}/${section.counts.info ?? 0}, errors ${section.errors}`
    );
  }

  const errors = report?.errors ?? [];
  if (errors.length) {
    lines.push("Errors:");
    for (const err of errors.slice(0, maxErrors)) {
      lines.push(`- ${err.scope}${err.pack ? ` / ${err.pack}` : ""}${err.actor ? ` / ${err.actor}` : ""}${err.item ? ` / ${err.item}` : ""}: ${err.error}`);
    }
    if (errors.length > maxErrors) lines.push(`...and ${errors.length - maxErrors} more errors.`);
  }

  const changes = report?.changes ?? [];
  if (changes.length) {
    lines.push("Top changes:");
    for (const change of changes.slice(0, maxChanges)) {
      const place = [change.scope, change.pack, change.actor, change.item].filter(Boolean).join(" / ");
      lines.push(`- ${place}: ${change.fields.join(", ")}`);
    }
    if (changes.length > maxChanges) lines.push(`...and ${changes.length - maxChanges} more changed items.`);
  }

  const findings = report?.residualFindings ?? [];
  if (findings.length) {
    lines.push("Top residual findings:");
    for (const f of findings.slice(0, maxFindings)) {
      lines.push(`- [${f.severity}] ${f.code}: ${f.path || "(unknown)"} - ${f.message}`);
    }
    if (findings.length > maxFindings) lines.push(`...and ${findings.length - maxFindings} more residual findings.`);
  }

  return lines.join("\n");
}
