import {
  getArmorSlotKey,
  isQuickSlotUnlocked,
} from "./actor-state-service.mjs";
import {
  clearActorItemReferences,
  equipActorItem,
  equipActorItemToSlots,
  recalculateActorWeight,
  unequipActorSlot,
} from "./inventory-service.mjs";

function equipmentResult({
  ok = true,
  changed = false,
  reason = "",
  item = null,
} = {}) {
  return { ok, changed, reason, item };
}

async function runAfterChange(afterChange, payload) {
  await afterChange?.(payload);
}

export async function equipActorWeaponFromSheet(actor, itemId, hand, {
  requireSettledInventory = null,
  afterChange = null,
} = {}) {
  if (requireSettledInventory && !(await requireSettledInventory("экипировка оружия"))) {
    return equipmentResult({ ok: false, reason: "pending-inventory" });
  }

  const weapon = actor?.items?.get(itemId);
  if (!weapon || weapon.type !== "weapon") {
    ui.notifications.warn("Предмет не найден или не является оружием");
    return equipmentResult({ ok: false, reason: "invalid-weapon" });
  }

  const currentRight = actor.system?.equipment?.rightHand ?? "";
  const currentLeft = actor.system?.equipment?.leftHand ?? "";

  if ((hand === "rightHand" && currentLeft === itemId) || (hand === "leftHand" && currentRight === itemId)) {
    ui.notifications.warn("Нельзя экипировать один и тот же предмет в обе руки");
    return equipmentResult({ ok: false, reason: "same-item-in-both-hands", item: weapon });
  }

  const rightWeapon = currentRight ? actor.items.get(currentRight) : null;
  const leftWeapon = currentLeft ? actor.items.get(currentLeft) : null;

  if (hand === "rightHand" && leftWeapon?.system?.twoHanded) {
    ui.notifications.warn("Другая рука уже занята двуручным оружием");
    return equipmentResult({ ok: false, reason: "other-hand-two-handed", item: weapon });
  }

  if (hand === "leftHand" && rightWeapon?.system?.twoHanded) {
    ui.notifications.warn("Другая рука уже занята двуручным оружием");
    return equipmentResult({ ok: false, reason: "other-hand-two-handed", item: weapon });
  }

  if (weapon.system?.twoHanded) {
    if ((hand === "rightHand" && currentLeft) || (hand === "leftHand" && currentRight)) {
      ui.notifications.warn("Для двуручного оружия обе руки должны быть свободны");
      return equipmentResult({ ok: false, reason: "hands-not-free", item: weapon });
    }

    await equipActorItemToSlots(actor, weapon, ["rightHand", "leftHand"]);
    await runAfterChange(afterChange, { actor, item: weapon, slotKey: hand });
    ui.notifications.info("Двуручное оружие экипировано в обе руки");
    return equipmentResult({ changed: true, item: weapon });
  }

  await equipActorItem(actor, weapon, hand);
  await runAfterChange(afterChange, { actor, item: weapon, slotKey: hand });

  ui.notifications.info(
    hand === "rightHand" ? "Оружие экипировано в правую руку" : "Оружие экипировано в левую руку"
  );
  return equipmentResult({ changed: true, item: weapon });
}

export async function unequipActorHandFromSheet(actor, hand, {
  afterChange = null,
} = {}) {
  const currentRight = actor?.system?.equipment?.rightHand ?? "";
  const currentLeft = actor?.system?.equipment?.leftHand ?? "";
  const currentItemId = actor?.system?.equipment?.[hand];

  if (!currentItemId) {
    ui.notifications.warn("В этой руке ничего нет");
    return equipmentResult({ ok: false, reason: "empty-hand" });
  }

  const currentItem = actor.items.get(currentItemId);
  await unequipActorSlot(actor, hand);
  await runAfterChange(afterChange, { actor, item: currentItem, slotKey: hand });

  if (currentItem?.system?.twoHanded && currentRight === currentLeft && currentRight === currentItemId) {
    ui.notifications.info("Двуручное оружие снято");
    return equipmentResult({ changed: true, item: currentItem });
  }

  ui.notifications.info(
    hand === "rightHand" ? "Оружие снято из правой руки" : "Оружие снято из левой руки"
  );
  return equipmentResult({ changed: true, item: currentItem });
}

export async function equipActorArmorFromSheet(actor, itemId, {
  requireSettledInventory = null,
  afterChange = null,
} = {}) {
  if (requireSettledInventory && !(await requireSettledInventory("экипировка брони"))) {
    return equipmentResult({ ok: false, reason: "pending-inventory" });
  }

  const armor = actor?.items?.get(itemId);
  if (!armor || armor.type !== "armor") {
    ui.notifications.warn("Предмет не найден или не является бронёй");
    return equipmentResult({ ok: false, reason: "invalid-armor" });
  }

  const slotKey = getArmorSlotKey(armor.system?.slot);
  if (!slotKey) {
    ui.notifications.warn("У брони не задан корректный слот");
    return equipmentResult({ ok: false, reason: "missing-armor-slot", item: armor });
  }

  await equipActorItem(actor, armor, slotKey);
  await runAfterChange(afterChange, { actor, item: armor, slotKey });
  ui.notifications.info(`Броня экипирована в слот: ${armor.system.slot}`);
  return equipmentResult({ changed: true, item: armor });
}

export async function unequipActorArmorFromSheet(actor, slotKey, {
  afterChange = null,
} = {}) {
  const currentItemId = actor?.system?.equipment?.[slotKey];
  if (!currentItemId) {
    ui.notifications.warn("В этом слоте ничего нет");
    return equipmentResult({ ok: false, reason: "empty-slot" });
  }

  const item = await unequipActorSlot(actor, slotKey);
  await runAfterChange(afterChange, { actor, item, slotKey });
  ui.notifications.info("Броня снята");
  return equipmentResult({ changed: true, item });
}

export async function assignActorQuickSlot(actor, itemId, slotKey) {
  if (!isQuickSlotUnlocked(actor, slotKey)) {
    ui.notifications.warn("Этот быстрый слот ещё заблокирован");
    return equipmentResult({ ok: false, reason: "locked-quick-slot" });
  }

  const item = actor?.items?.get(itemId);
  if (!item) {
    ui.notifications.warn("Предмет не найден");
    return equipmentResult({ ok: false, reason: "missing-item" });
  }

  await actor.update({
    [`system.quickSlots.${slotKey}`]: itemId,
  });

  ui.notifications.info(`Предмет "${item.name}" назначен в ${slotKey}`);
  return equipmentResult({ changed: true, item });
}

export async function clearActorQuickSlot(actor, slotKey) {
  if (!isQuickSlotUnlocked(actor, slotKey)) {
    ui.notifications.warn("Этот быстрый слот ещё заблокирован");
    return equipmentResult({ ok: false, reason: "locked-quick-slot" });
  }

  await actor.update({
    [`system.quickSlots.${slotKey}`]: "",
  });

  ui.notifications.info(`Быстрый слот ${slotKey} очищен`);
  return equipmentResult({ changed: true });
}

export async function deleteActorOwnedItem(actor, itemId, {
  afterDelete = null,
} = {}) {
  const item = actor?.items?.get(itemId);
  if (!item) {
    ui.notifications.warn("Предмет не найден");
    return equipmentResult({ ok: false, reason: "missing-item" });
  }

  const itemName = item.name;
  await clearActorItemReferences(actor, itemId);
  await item.delete();
  await recalculateActorWeight(actor);
  await afterDelete?.({ actor, itemId, itemName });

  ui.notifications.info(`Предмет "${itemName}" удалён из инвентаря`);
  return equipmentResult({ changed: true });
}
