import {
  recalculateActorWeight,
  removeQuantityFromItem,
} from "./inventory-service.mjs";
import {
  consumeFoodItem,
  getItemActionType,
  useLegacyPotionEffect,
} from "./item-effect-service.mjs";
import { resolveCombatActionTargets } from "./combat-action-target-service.mjs";

export function getPendingItemActionConfig(actionType) {
  const configs = {
    "use-consumable": {
      allowedTypes: ["consumable"],
      missingMessage: "Предмет для продолжения действия не найден.",
    },
    food: {
      allowedTypes: ["food"],
      missingMessage: "Еда для продолжения действия не найдена.",
    },
    potion: {
      allowedTypes: ["potion"],
      missingMessage: "Зелье для продолжения действия не найдено.",
    },
    "cast-spell": {
      allowedTypes: ["spell", "scroll"],
      missingMessage: "Заклинание для продолжения действия не найдено.",
    },
    spell: {
      allowedTypes: ["spell", "scroll"],
      missingMessage: "Заклинание для продолжения действия не найдено.",
    },
    scroll: {
      allowedTypes: ["scroll"],
      missingMessage: "Заклинание для продолжения действия не найдено.",
    },
    throwable: {
      allowedTypes: ["throwable"],
      missingMessage: "Метательный предмет для продолжения действия не найден.",
    },
  };

  return configs[actionType] ?? null;
}

export function getOwnedItemForUse(actor, itemOrId, missingMessage = "Предмет не найден") {
  const item = typeof itemOrId === "string"
    ? actor?.items?.get(itemOrId)
    : itemOrId;

  if (!item) {
    ui.notifications.warn(missingMessage);
    return null;
  }

  return item;
}

function shouldRefreshAfterItemEffect(result) {
  return Boolean(result?.changed || result?.consumedItem || result?.consumeItem);
}

async function resolveItemUseTime({
  item,
  actionType,
  label,
  itemId,
  skipTimeCost = false,
  resolveCombatTimeCost = null,
} = {}) {
  if (skipTimeCost) return true;

  const timeState = await resolveCombatTimeCost?.({
    actionType,
    label,
    item,
    payload: { itemId },
  });

  return Boolean(timeState?.ok) && !timeState?.queued;
}

async function finalizeItemEffect({
  actor,
  item,
  result,
  afterRefresh = null,
} = {}) {
  if (result?.cancelled) return { handled: true, cancelled: true };
  if (!result?.handled) return { handled: false, cancelled: false };

  if (result.consumeItem) {
    await removeQuantityFromItem(actor, item, 1);
    await recalculateActorWeight(actor);
  }

  if (shouldRefreshAfterItemEffect(result)) {
    await afterRefresh?.({ actor, item, result });
  }

  return { handled: true, cancelled: false };
}

export async function useInventoryEffectItem({
  actor,
  itemId,
  expectedType,
  missingMessage,
  timeActionType,
  labelPrefix,
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  apply = null,
  afterRefresh = null,
} = {}) {
  const item = actor?.items?.get(itemId);

  if (!item || item.type !== expectedType) {
    ui.notifications.warn(missingMessage);
    return { result: null, handled: true };
  }

  const canUseNow = await resolveItemUseTime({
    item,
    actionType: timeActionType,
    label: `${labelPrefix}: ${item.name}`,
    itemId,
    skipTimeCost,
    resolveCombatTimeCost,
  });

  if (!canUseNow) return { result: null, handled: true };

  const result = await apply?.({ actor, item });
  const finalization = await finalizeItemEffect({ actor, item, result, afterRefresh });
  return { result, ...finalization };
}

export async function useFoodItemFromSheet(actor, itemId, {
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  afterRefresh = null,
} = {}) {
  return useInventoryEffectItem({
    actor,
    itemId,
    expectedType: "food",
    missingMessage: "Предмет не найден или не является едой",
    timeActionType: "food",
    labelPrefix: "Использование еды",
    skipTimeCost,
    resolveCombatTimeCost,
    afterRefresh,
    apply: ({ actor, item }) => consumeFoodItem(actor, item),
  });
}

export async function usePotionItemFromSheet(actor, itemId, {
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  applyActionTypeItem = null,
  afterRefresh = null,
} = {}) {
  const outcome = await useInventoryEffectItem({
    actor,
    itemId,
    expectedType: "potion",
    missingMessage: "Зелье не найдено",
    timeActionType: "potion",
    labelPrefix: "Использование зелья",
    skipTimeCost,
    resolveCombatTimeCost,
    afterRefresh,
    apply: async ({ actor, item }) => {
      if (getItemActionType(item)) {
        const actionResult = await applyActionTypeItem?.(actor, item);
        if (actionResult?.handled) return actionResult;
      }

      return useLegacyPotionEffect(actor, item);
    },
  });

  if (outcome.result && !outcome.result?.handled) {
    ui.notifications.warn("У зелья не настроен эффект.");
  }

  return outcome;
}

export async function useConsumableItemFromSheet(actor, itemId, {
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  applyActionTypeItem = null,
  afterRefresh = null,
} = {}) {
  const outcome = await useInventoryEffectItem({
    actor,
    itemId,
    expectedType: "consumable",
    missingMessage: "Расходник не найден",
    timeActionType: "use-consumable",
    labelPrefix: "Использование",
    skipTimeCost,
    resolveCombatTimeCost,
    afterRefresh,
    apply: ({ actor, item }) => applyActionTypeItem?.(actor, item),
  });

  if (outcome.result && !outcome.result?.handled) {
    ui.notifications.warn("У предмета не настроен actionType.");
  }

  return outcome;
}

export async function useItemByType(actor, itemOrId, {
  skipTimeCost = false,
  allowWeapon = false,
  allowedTypes = null,
  missingMessage = "Предмет не найден",
  unsupportedMessage = "Этот тип предмета пока нельзя использовать",
  actionOptions = {},
  handlers = {},
} = {}) {
  const item = getOwnedItemForUse(actor, itemOrId, missingMessage);
  if (!item) return false;

  if (Array.isArray(allowedTypes) && allowedTypes.length && !allowedTypes.includes(item.type)) {
    ui.notifications.warn(unsupportedMessage);
    return false;
  }

  const handlerOptions = {
    skipTimeCost,
    ...actionOptions,
  };

  if (item.type === "food") {
    await handlers.useFood?.(item.id, handlerOptions);
    return true;
  }

  if (item.type === "spell") {
    await handlers.castSpell?.({ item, isScroll: false, ...handlerOptions });
    return true;
  }

  if (item.type === "scroll") {
    await handlers.castSpell?.({ item, isScroll: true, ...handlerOptions });
    return true;
  }

  if (item.type === "potion") {
    await handlers.usePotion?.(item.id, handlerOptions);
    return true;
  }

  if (item.type === "throwable") {
    await handlers.useThrowable?.(item.id, handlerOptions);
    return true;
  }

  if (item.type === "consumable") {
    await handlers.useConsumable?.(item.id, handlerOptions);
    return true;
  }

  if (allowWeapon && item.type === "weapon") {
    await handlers.equipWeapon?.(item.id, "rightHand");
    return true;
  }

  ui.notifications.warn(unsupportedMessage);
  return false;
}

export async function resumePendingItemAction(actor, data, config, handlers = {}) {
  const targets = resolveCombatActionTargets({ targetRefs: data?.targetRefs });

  return useItemByType(actor, data?.itemId, {
    skipTimeCost: true,
    allowedTypes: config.allowedTypes,
    missingMessage: config.missingMessage,
    unsupportedMessage: config.missingMessage,
    actionOptions: targets.length ? { targets } : {},
    handlers,
  });
}
