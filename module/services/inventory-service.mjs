import { getItemQuantity, getItemTotalWeight } from "../utils/item-utils.mjs";
import { getPersistentActor } from "../utils/actor-utils.mjs";
import { SKILL_GROUPS } from "../constants/skills.mjs";
import { getExpNext } from "../utils/text-utils.mjs";
import { debugLog, debugWarn } from "../utils/debug-utils.mjs";

export const EQUIPMENT_SLOT_DEFS = Object.freeze([
  { key: "leftHand",  label: "Л. рука",  icon: "🗡", accepts: ["weapon", "armor"], group: "hands" },
  { key: "rightHand", label: "П. рука",  icon: "⚔", accepts: ["weapon", "armor"], group: "hands" },
  { key: "head",      label: "Голова",   icon: "⛑", accepts: ["armor"], group: "body" },
  { key: "neck",      label: "Шея",      icon: "📿", accepts: ["jewelry", "armor"], group: "body" },
  { key: "torso",     label: "Торс",     icon: "🛡", accepts: ["armor"], group: "body" },
  { key: "leftArm",   label: "Л. наруч", icon: "🦾", accepts: ["armor"], group: "body" },
  { key: "rightArm",  label: "П. наруч", icon: "🦾", accepts: ["armor"], group: "body" },
  { key: "legs",      label: "Ноги",     icon: "👖", accepts: ["armor"], group: "body" },
  { key: "ringLeft",  label: "Кольцо Л", icon: "💍", accepts: ["jewelry"], group: "jewelry" },
  { key: "ringRight", label: "Кольцо П", icon: "💍", accepts: ["jewelry"], group: "jewelry" },
  { key: "belt",      label: "Пояс",     icon: "🔗", accepts: ["belt"], group: "carry" },
  { key: "backpack",  label: "Рюкзак",   icon: "🎒", accepts: ["backpack"], group: "carry" },
]);

const ACTIVE_EQUIPMENT_SLOT_KEYS = Object.freeze(EQUIPMENT_SLOT_DEFS.map(slot => slot.key));

const LEGACY_EQUIPMENT_SLOT_ACCEPTS = Object.freeze({
  armorHead: ["armor"],
  armorTorso: ["armor"],
  armorArms: ["armor"],
  armorLegs: ["armor"],
});

const EQUIPMENT_SLOT_ACCEPTS = Object.freeze({
  ...Object.fromEntries(EQUIPMENT_SLOT_DEFS.map(slot => [slot.key, slot.accepts])),
  ...LEGACY_EQUIPMENT_SLOT_ACCEPTS,
});

const QUICK_SLOT_TYPES = Object.freeze([
  "weapon",
  "food",
  "spell",
  "scroll",
  "potion",
  "throwable",
  "consumable",
]);

export const INVENTORY_STASH_SECTION_KEY = "__stash__";

export async function recalculateActorWeight(actor) {
  if (!actor || actor.documentName !== "Actor") return;
  if (!actor.system.resources?.weight) return;

  const totalWeight = actor.items.reduce((sum, item) => sum + getItemTotalWeight(item), 0);

  await actor.update({
    "system.resources.weight.value": totalWeight
  });
}

function getLiveActor(actor) {
  return getPersistentActor(actor) ?? actor;
}

function getActorItem(actor, itemOrId) {
  if (!actor || !itemOrId) return null;
  if (typeof itemOrId === "string") return actor.items.get(itemOrId) ?? null;
  return actor.items.get(itemOrId.id) ?? itemOrId;
}

function normalizeArmorSlotKey(slot) {
  const slotKey = String(slot ?? "");
  const map = {
    armorHead: "head",
    armorTorso: "torso",
    armorArms: "leftArm",
    armorLegs: "legs",
    shield: "leftHand",
    abdomen: "torso",
    arms: "leftArm",
    leftLeg: "legs",
    rightLeg: "legs",
  };
  return map[slotKey] ?? slotKey;
}

export function getAutoEquipSlotPriority(item, slotKey) {
  const itemSlot = String(item?.system?.slot ?? "");
  if (item?.type === "weapon") return ({ rightHand: 0, leftHand: 1 }[slotKey] ?? 10);
  if (item?.type === "armor") {
    const armorSlot = normalizeArmorSlotKey(itemSlot);
    if (armorSlot && slotKey === armorSlot) return 0;
    if (["leftHand", "rightHand"].includes(armorSlot)) return slotKey === armorSlot ? 0 : 1;
  }
  if (item?.type === "jewelry" && itemSlot && slotKey === itemSlot) return 0;
  return 5;
}

export function canEquipItemInSlot(item, slotKey) {
  if (!item || !slotKey) return false;
  const acceptedTypes = EQUIPMENT_SLOT_ACCEPTS[slotKey];
  if (!acceptedTypes || !acceptedTypes.includes(item.type)) return false;

  if (item.type === "weapon") return ["rightHand", "leftHand"].includes(slotKey);
  if (item.type === "belt") return slotKey === "belt";
  if (item.type === "backpack") return slotKey === "backpack";

  const itemSlot = String(item.system?.slot ?? "");

  if (item.type === "jewelry") {
    if (itemSlot) return slotKey === itemSlot;
    return ["neck", "ringLeft", "ringRight"].includes(slotKey);
  }

  if (item.type === "armor") {
    const armorSlot = normalizeArmorSlotKey(itemSlot);
    if (!armorSlot) return false;
    if (["leftHand", "rightHand"].includes(armorSlot)) {
      return ["leftHand", "rightHand"].includes(slotKey);
    }
    return slotKey === armorSlot;
  }

  return true;
}

function getCompatibleEquipmentSlotKeys(item) {
  return ACTIVE_EQUIPMENT_SLOT_KEYS
    .filter(slotKey => canEquipItemInSlot(item, slotKey))
    .sort((a, b) => getAutoEquipSlotPriority(item, a) - getAutoEquipSlotPriority(item, b));
}

function getEquipmentSlotDef(slotKey) {
  return EQUIPMENT_SLOT_DEFS.find(slot => slot.key === slotKey) ?? null;
}

export function getCompatibleEquipmentSlots(item) {
  return getCompatibleEquipmentSlotKeys(item)
    .map(getEquipmentSlotDef)
    .filter(Boolean);
}

export function getEquippedSlotKeys(actor, itemId) {
  if (!actor || !itemId) return [];
  return Object.entries(actor.system?.equipment ?? {})
    .filter(([, equippedItemId]) => equippedItemId === itemId)
    .map(([slotKey]) => slotKey);
}

export async function clearItemGridPlacement(item) {
  if (!item) return false;
  await item.update({
    "flags.iron-hills-system.container": null,
    "flags.iron-hills-system.sectionKey": null,
    "flags.iron-hills-system.gridPos": null,
  });
  return true;
}

export function isPendingInventorySection(sectionKey) {
  return !sectionKey || sectionKey === INVENTORY_STASH_SECTION_KEY;
}

export function isItemGridPlaced(item) {
  const flags = item?.flags?.["iron-hills-system"] ?? {};
  if (flags.container) return true;
  const sectionKey = flags.sectionKey ?? null;
  return !isPendingInventorySection(sectionKey);
}

export async function moveItemToInventorySection(item, sectionKey, gridPos = null) {
  if (!item) return false;
  if (isPendingInventorySection(sectionKey)) return clearItemGridPlacement(item);

  await item.update({
    "flags.iron-hills-system.container": null,
    "flags.iron-hills-system.sectionKey": sectionKey,
    "flags.iron-hills-system.gridPos": gridPos ?? null,
  });
  return true;
}

export async function clearContainedItemsForEquipmentSlot(actor, slotKey) {
  const liveActor = getLiveActor(actor);
  if (!liveActor || !slotKey) return false;

  const updates = [];
  for (const item of liveActor.items) {
    const flags = item.flags?.["iron-hills-system"] ?? {};
    const sectionKey = flags.sectionKey;
    const containerKey = flags.container;
    if (
      sectionKey === `${slotKey}_main` ||
      sectionKey?.startsWith(`${slotKey}_`) ||
      containerKey?.startsWith(`${slotKey}_attach_`)
    ) {
      updates.push(clearItemGridPlacement(item));
    }
  }

  if (updates.length === 0) return false;
  await Promise.all(updates);
  return true;
}

export async function equipActorItem(actor, itemOrId, slotKey, options = {}) {
  return equipActorItemToSlots(actor, itemOrId, [slotKey], options);
}

export async function equipActorItemToSlots(actor, itemOrId, slotKeys, options = {}) {
  const liveActor = getLiveActor(actor);
  const item = getActorItem(liveActor, itemOrId);
  const targetSlots = [...new Set((slotKeys ?? []).filter(Boolean))];

  if (!liveActor || !item || targetSlots.length === 0) return false;
  if (!targetSlots.every(slotKey => canEquipItemInSlot(item, slotKey))) return false;

  const {
    clearPreviousSlots = true,
    clearItemPlacement = true,
    clearDisplacedPlacement = true,
    clearDisplacedContainers = true,
    recalculateWeight = true,
  } = options;

  const equipment = liveActor.system?.equipment ?? {};
  const updateData = {};
  const targetSet = new Set(targetSlots);

  if (clearPreviousSlots) {
    for (const [slotKey, equippedItemId] of Object.entries(equipment)) {
      if (equippedItemId === item.id && !targetSet.has(slotKey)) {
        updateData[`system.equipment.${slotKey}`] = "";
      }
    }
  }

  const displacedItems = new Map();
  const slotsToClearContainers = new Set();

  for (const slotKey of targetSlots) {
    const displacedId = equipment[slotKey];
    if (displacedId && displacedId !== item.id) {
      const displaced = liveActor.items.get(displacedId);
      if (displaced) displacedItems.set(displaced.id, displaced);
      slotsToClearContainers.add(slotKey);
    }
    updateData[`system.equipment.${slotKey}`] = item.id;
  }

  if (clearDisplacedContainers) {
    for (const slotKey of slotsToClearContainers) {
      await clearContainedItemsForEquipmentSlot(liveActor, slotKey);
    }
  }

  if (Object.keys(updateData).length > 0) {
    await liveActor.update(updateData);
  }

  if (clearDisplacedPlacement) {
    await Promise.all([...displacedItems.values()].map(clearItemGridPlacement));
  }

  if (clearItemPlacement) {
    await clearItemGridPlacement(item);
  }

  if (recalculateWeight) {
    await recalculateActorWeight(liveActor);
  }

  return true;
}

export async function unequipActorSlot(actor, slotKey, options = {}) {
  const liveActor = getLiveActor(actor);
  if (!liveActor || !slotKey) return null;

  const equipment = liveActor.system?.equipment ?? {};
  const itemId = equipment[slotKey];
  if (!itemId) return null;

  const {
    clearItemPlacement = true,
    clearContainers = true,
    clearLinkedTwoHanded = true,
    recalculateWeight = true,
  } = options;

  const item = liveActor.items.get(itemId) ?? null;
  const updateData = {
    [`system.equipment.${slotKey}`]: "",
  };
  const clearedSlots = new Set([slotKey]);

  for (const [otherSlot, equippedItemId] of Object.entries(equipment)) {
    if (otherSlot !== slotKey && equippedItemId === itemId) {
      updateData[`system.equipment.${otherSlot}`] = "";
      clearedSlots.add(otherSlot);
    }
  }

  if (clearLinkedTwoHanded && item?.system?.twoHanded && ["leftHand", "rightHand"].includes(slotKey)) {
    const otherHand = slotKey === "leftHand" ? "rightHand" : "leftHand";
    if (equipment[otherHand] === itemId) {
      updateData[`system.equipment.${otherHand}`] = "";
      clearedSlots.add(otherHand);
    }
  }

  if (clearContainers) {
    for (const clearedSlot of clearedSlots) {
      await clearContainedItemsForEquipmentSlot(liveActor, clearedSlot);
    }
  }

  await liveActor.update(updateData);

  if (clearItemPlacement && item) {
    await clearItemGridPlacement(item);
  }

  if (recalculateWeight) {
    await recalculateActorWeight(liveActor);
  }

  return item;
}

export function findTool(actor, craftType, minTier) {
  return actor.items.find(item =>
    item.type === "tool" &&
    item.system.craftType === craftType &&
    Number(item.system.tier ?? 0) >= Number(minTier ?? 1) &&
    getItemQuantity(item) > 0
  );
}

export function getAvailableCategoryQuantity(actor, type, category) {
  return actor.items
    .filter(item => item.type === type && item.system.category === category)
    .reduce((sum, item) => sum + getItemQuantity(item), 0);
}

export async function clearActorItemReferences(actor, itemId) {
  if (!actor || !itemId) return false;

  const equipment = actor.system?.equipment ?? {};
  const quickSlots = actor.system?.quickSlots ?? {};
  const updateData = {};

  for (const [slotKey, equippedItemId] of Object.entries(equipment)) {
    if (equippedItemId === itemId) {
      updateData[`system.equipment.${slotKey}`] = "";
    }
  }

  for (const [key, value] of Object.entries(quickSlots)) {
    if (key === "unlocked") continue;
    if (value === itemId) {
      updateData[`system.quickSlots.${key}`] = "";
    }
  }

  if (Object.keys(updateData).length > 0) {
    debugLog("clearActorItemReferences:updating", {
      actorId: actor.id,
      actorName: actor.name,
      itemId,
      updateData
    });

    await actor.update(updateData);
    return true;
  }

  debugLog("clearActorItemReferences:no-changes", {
    actorId: actor.id,
    actorName: actor.name,
    itemId
  });

  return false;
}

export async function cleanupInvalidActorReferences(actor) {
  if (!actor) return false;

  const equipment = actor.system?.equipment ?? {};
  const quickSlots = actor.system?.quickSlots ?? {};
  const updateData = {};

  for (const [slotKey, itemId] of Object.entries(equipment)) {
    if (!itemId) continue;

    const item = actor.items.get(itemId);
    if (!item) {
      updateData[`system.equipment.${slotKey}`] = "";
      continue;
    }

    const acceptedTypes = EQUIPMENT_SLOT_ACCEPTS[slotKey];
    const validEquipment =
      ACTIVE_EQUIPMENT_SLOT_KEYS.includes(slotKey)
        ? canEquipItemInSlot(item, slotKey)
        : (!acceptedTypes || acceptedTypes.includes(item.type));

    if (!validEquipment) {
      updateData[`system.equipment.${slotKey}`] = "";
    }
  }

  const rightHandId = updateData["system.equipment.rightHand"] === ""
    ? ""
    : (equipment.rightHand ?? "");
  const leftHandId = updateData["system.equipment.leftHand"] === ""
    ? ""
    : (equipment.leftHand ?? "");

  const rightHandItem = rightHandId ? actor.items.get(rightHandId) : null;
  const leftHandItem = leftHandId ? actor.items.get(leftHandId) : null;

  if (rightHandItem?.system?.twoHanded && leftHandId !== rightHandId) {
    updateData["system.equipment.leftHand"] = rightHandId;
  } else if (leftHandItem?.system?.twoHanded && rightHandId !== leftHandId) {
    updateData["system.equipment.rightHand"] = leftHandId;
  }

  for (const [key, itemId] of Object.entries(quickSlots)) {
    if (key === "unlocked") continue;
    if (!itemId) continue;

    const item = actor.items.get(itemId);
    if (!item) {
      updateData[`system.quickSlots.${key}`] = "";
      continue;
    }

    const hasAction = Boolean(String(item.system?.actionType ?? "").trim());
    if (!QUICK_SLOT_TYPES.includes(item.type) && !hasAction) {
      updateData[`system.quickSlots.${key}`] = "";
    }
  }

  if (Object.keys(updateData).length > 0) {
    await actor.update(updateData);
    return true;
  }

  return false;
}

export async function ensureActorSkills(actor) {
  if (!actor) return false;

  const updateData = {};
  const actorSkills = actor.system?.skills ?? {};
  let changed = false;

  for (const group of SKILL_GROUPS) {
    for (const skillDef of group.skills) {
      const skill = actorSkills[skillDef.key];

      if (!skill || typeof skill !== "object") {
        updateData[`system.skills.${skillDef.key}`] = {
          value: 1,
          exp: 0,
          expNext: 25
        };
        changed = true;
        continue;
      }

      if (!Number.isFinite(Number(skill.value))) {
        updateData[`system.skills.${skillDef.key}.value`] = 1;
        changed = true;
      }

      if (!Number.isFinite(Number(skill.exp))) {
        updateData[`system.skills.${skillDef.key}.exp`] = 0;
        changed = true;
      }

      if (!Number.isFinite(Number(skill.expNext))) {
        updateData[`system.skills.${skillDef.key}.expNext`] = getExpNext(Number(skill.value) || 1) ?? 25;
        changed = true;
      }
    }
  }

  if (changed) {
    await actor.update(updateData);
    return true;
  }

  return false;
}

export async function removeQuantityFromItem(actor, item, quantityToRemove) {
  if (!actor || !item) return false;

  const liveActor = getPersistentActor(actor) ?? actor;
  const liveItem = liveActor.items.get(item.id);
  if (!liveItem) {
  debugWarn("removeQuantityFromItem:item-not-found", {
    actorId: liveActor?.id,
    actorName: liveActor?.name,
    itemId: item?.id
  });
  return false;
}

  const currentQuantity = getItemQuantity(liveItem);
  const removeQty = Math.max(1, Math.floor(Number(quantityToRemove ?? 1) || 1));
  const nextQuantity = currentQuantity - removeQty;
debugLog("removeQuantityFromItem:start", {
  actorId: liveActor.id,
  actorName: liveActor.name,
  itemId: liveItem.id,
  itemName: liveItem.name,
  currentQuantity,
  removeQty,
  nextQuantity
});
  if (nextQuantity <= 0) {
    debugLog("removeQuantityFromItem:delete-item", {
  actorId: liveActor.id,
  actorName: liveActor.name,
  itemId: liveItem.id,
  itemName: liveItem.name
});
    await clearActorItemReferences(liveActor, liveItem.id);
    await liveItem.delete();
    return true;
  }
debugLog("removeQuantityFromItem:update-quantity", {
  actorId: liveActor.id,
  actorName: liveActor.name,
  itemId: liveItem.id,
  itemName: liveItem.name,
  nextQuantity
});
  await liveItem.update({
    "system.quantity": nextQuantity
  });

  return true;
}
