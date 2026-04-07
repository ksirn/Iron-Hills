import { getItemQuantity, getItemTotalWeight } from "../utils/item-utils.mjs";
import { getPersistentActor } from "../utils/actor-utils.mjs";
import { SKILL_GROUPS } from "../constants/skills.mjs";
import { getExpNext } from "../utils/text-utils.mjs";
import { debugLog, debugWarn } from "../utils/debug-utils.mjs";

export async function recalculateActorWeight(actor) {
  if (!actor || actor.documentName !== "Actor") return;
  if (!actor.system.resources?.weight) return;

  const totalWeight = actor.items.reduce((sum, item) => sum + getItemTotalWeight(item), 0);

  await actor.update({
    "system.resources.weight.value": totalWeight
  });
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

  const rightHandId = equipment.rightHand ?? "";
  const leftHandId = equipment.leftHand ?? "";

  if (rightHandId === itemId) {
    updateData["system.equipment.rightHand"] = "";
  }

  if (leftHandId === itemId) {
    updateData["system.equipment.leftHand"] = "";
  }

  if (equipment.armorHead === itemId) {
    updateData["system.equipment.armorHead"] = "";
  }

  if (equipment.armorTorso === itemId) {
    updateData["system.equipment.armorTorso"] = "";
  }

  if (equipment.armorArms === itemId) {
    updateData["system.equipment.armorArms"] = "";
  }

  if (equipment.armorLegs === itemId) {
    updateData["system.equipment.armorLegs"] = "";
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
  if (Object.keys(updateData).length > 0) {
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
}

export async function cleanupInvalidActorReferences(actor) {
  if (!actor) return false;

  const equipment = actor.system?.equipment ?? {};
  const quickSlots = actor.system?.quickSlots ?? {};
  const updateData = {};

  const rightHandId = equipment.rightHand ?? "";
  const leftHandId = equipment.leftHand ?? "";

  const rightHandItem = rightHandId ? actor.items.get(rightHandId) : null;
  const leftHandItem = leftHandId ? actor.items.get(leftHandId) : null;

  if (rightHandId && !rightHandItem) {
    updateData["system.equipment.rightHand"] = "";
  }

  if (leftHandId && !leftHandItem) {
    updateData["system.equipment.leftHand"] = "";
  }

  if (rightHandItem && rightHandItem.type !== "weapon") {
    updateData["system.equipment.rightHand"] = "";
  }

  if (leftHandItem && leftHandItem.type !== "weapon") {
    updateData["system.equipment.leftHand"] = "";
  }

  if (rightHandItem?.system?.twoHanded) {
    if (leftHandId !== rightHandId) {
      updateData["system.equipment.leftHand"] = rightHandId;
    }
  }

  if (leftHandItem?.system?.twoHanded) {
    if (rightHandId !== leftHandId) {
      updateData["system.equipment.rightHand"] = leftHandId;
    }
  }

  const armorSlots = ["armorHead", "armorTorso", "armorArms", "armorLegs"];

  for (const slotKey of armorSlots) {
    const itemId = equipment[slotKey];
    if (!itemId) continue;

    const item = actor.items.get(itemId);
    if (!item || item.type !== "armor") {
      updateData[`system.equipment.${slotKey}`] = "";
      continue;
    }
  }

  for (const [key, itemId] of Object.entries(quickSlots)) {
    if (key === "unlocked") continue;
    if (!itemId) continue;

    const item = actor.items.get(itemId);
    if (!item) {
      updateData[`system.quickSlots.${key}`] = "";
      continue;
    }

    const allowed =
      ["weapon", "food", "spell", "scroll", "potion", "throwable", "consumable"].includes(item.type);

    if (!allowed) {
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

  const currentQuantity = Math.max(1, Number(liveItem.system?.quantity ?? 1));
  const removeQty = Math.max(1, Number(quantityToRemove ?? 1));
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