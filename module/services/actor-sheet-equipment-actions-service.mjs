import {
  assignActorQuickSlot,
  clearActorQuickSlot,
  deleteActorOwnedItem,
  equipActorArmorFromSheet,
  equipActorWeaponFromSheet,
  unequipActorArmorFromSheet,
  unequipActorHandFromSheet,
} from "./actor-equipment-service.mjs";

export async function equipActorSheetWeapon(actor, itemId, hand, {
  requireSettledInventory = null,
  afterChange = null,
} = {}) {
  return equipActorWeaponFromSheet(actor, itemId, hand, {
    requireSettledInventory,
    afterChange,
  });
}

export async function unequipActorSheetHand(actor, hand, {
  afterChange = null,
} = {}) {
  return unequipActorHandFromSheet(actor, hand, {
    afterChange,
  });
}

export async function equipActorSheetArmor(actor, itemId, {
  requireSettledInventory = null,
  afterChange = null,
} = {}) {
  return equipActorArmorFromSheet(actor, itemId, {
    requireSettledInventory,
    afterChange,
  });
}

export async function unequipActorSheetArmor(actor, slotKey, {
  afterChange = null,
} = {}) {
  return unequipActorArmorFromSheet(actor, slotKey, {
    afterChange,
  });
}

export async function assignActorSheetQuickSlot(actor, itemId, slotKey) {
  return assignActorQuickSlot(actor, itemId, slotKey);
}

export async function clearActorSheetQuickSlot(actor, slotKey) {
  return clearActorQuickSlot(actor, slotKey);
}

export async function deleteActorSheetOwnedItem(actor, itemId, {
  afterDelete = null,
} = {}) {
  return deleteActorOwnedItem(actor, itemId, {
    afterDelete,
  });
}
