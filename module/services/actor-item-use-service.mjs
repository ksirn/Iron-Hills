import {
  recalculateActorWeight,
  removeQuantityFromItem,
} from "./inventory-service.mjs";
import {
  consumeFoodItem,
  getItemActionType,
  useLegacyPotionEffect,
} from "./item-effect-service.mjs";
import {
  buildCombatActionTargetPayload,
  resolveCombatActionTargetContext,
  resolveCombatActionTargets,
} from "./combat-action-target-service.mjs";
import { getPendingInventoryItemActionConfig } from "../utils/actor-inventory-action-config.mjs";

export function getPendingItemActionConfig(actionType) {
  return getPendingInventoryItemActionConfig(actionType);
}

function notifyWarn(message) {
  globalThis.ui?.notifications?.warn?.(message);
}

export function getOwnedItemForUse(actor, itemOrId, missingMessage = "Предмет не найден") {
  const item = typeof itemOrId === "string"
    ? actor?.items?.get(itemOrId)
    : itemOrId;

  if (!item) {
    notifyWarn(missingMessage);
    return null;
  }

  return item;
}

function shouldRefreshAfterItemEffect(result) {
  return Boolean(result?.changed || result?.consumedItem || result?.consumeItem);
}

function itemUseOutcome({
  ok = true,
  handled = true,
  queued = false,
  cancelled = false,
  result = null,
  reason = "",
  timeState = null,
  summary = null,
} = {}) {
  return {
    ok,
    handled,
    queued,
    cancelled,
    result,
    reason,
    timeState,
    summary,
  };
}

function buildItemUseSummary({ actor = null, item = null, result = null } = {}) {
  if (!item) return null;
  const hasResult = result !== undefined && result !== null;

  return {
    actorId: actor?.id ?? null,
    actorName: actor?.name ?? "",
    itemId: item.id ?? null,
    itemName: item.name ?? "",
    itemType: item.type ?? "",
    actionType: getItemActionType(item),
    ok: result?.ok !== false,
    handled: hasResult ? Boolean(result?.handled ?? true) : false,
    cancelled: Boolean(result?.cancelled || result?.canceled),
    consumedItem: Boolean(result?.consumedItem || result?.consumeItem),
    changed: Boolean(result?.changed || result?.consumedItem || result?.consumeItem),
  };
}

function normalizeItemUseTargets(targets = null) {
  return resolveCombatActionTargets({ targets });
}

async function resolveItemUseTime({
  item,
  actionType,
  label,
  itemId,
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  targets = null,
  payload = {},
} = {}) {
  if (skipTimeCost || !resolveCombatTimeCost) {
    return { ok: true, queued: false, immediate: true, timeState: null };
  }

  const selectedTargets = normalizeItemUseTargets(targets);
  const timeState = await resolveCombatTimeCost({
    actionType,
    label,
    item,
    payload: {
      itemId,
      ...payload,
      ...buildCombatActionTargetPayload({ targets: selectedTargets }),
    },
  });

  if (timeState?.queued) {
    return {
      ok: true,
      queued: true,
      immediate: false,
      reason: timeState.reason || "queued",
      timeState,
    };
  }

  if (!timeState?.ok) {
    return {
      ok: false,
      queued: false,
      immediate: false,
      reason: timeState?.reason || "time-cost",
      timeState,
    };
  }

  return { ok: true, queued: false, immediate: true, timeState };
}

async function finalizeItemEffect({
  actor,
  item,
  result,
  afterRefresh = null,
} = {}) {
  if (result?.cancelled) {
    return itemUseOutcome({
      ok: result.ok !== false,
      handled: true,
      cancelled: true,
      result,
      reason: result.reason || "cancelled",
      summary: buildItemUseSummary({ actor, item, result }),
    });
  }
  if (!result?.handled) {
    return itemUseOutcome({
      ok: result?.ok !== false,
      handled: false,
      result,
      reason: result?.reason || "unhandled",
      summary: buildItemUseSummary({ actor, item, result }),
    });
  }

  if (result.consumeItem) {
    await removeQuantityFromItem(actor, item, 1);
    await recalculateActorWeight(actor);
  }

  if (shouldRefreshAfterItemEffect(result)) {
    await afterRefresh?.({ actor, item, result });
  }

  return itemUseOutcome({
    ok: result?.ok !== false,
    handled: true,
    cancelled: false,
    result,
    reason: result?.reason || "",
    summary: buildItemUseSummary({ actor, item, result }),
  });
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
  targets = null,
  timePayload = {},
  apply = null,
  afterRefresh = null,
} = {}) {
  const item = actor?.items?.get(itemId);

  if (!item || item.type !== expectedType) {
    notifyWarn(missingMessage);
    return itemUseOutcome({ ok: false, handled: true, reason: "missing-item" });
  }

  const selectedTargets = normalizeItemUseTargets(targets);
  const timeState = await resolveItemUseTime({
    item,
    actionType: timeActionType,
    label: `${labelPrefix}: ${item.name}`,
    itemId,
    skipTimeCost,
    resolveCombatTimeCost,
    targets: selectedTargets,
    payload: timePayload,
  });

  if (timeState.queued) {
    return itemUseOutcome({
      queued: true,
      handled: true,
      result: timeState.timeState,
      reason: timeState.reason,
      timeState: timeState.timeState,
    });
  }

  if (!timeState.ok) {
    return itemUseOutcome({
      ok: false,
      handled: true,
      result: timeState.timeState,
      reason: timeState.reason,
      timeState: timeState.timeState,
    });
  }

  const result = await apply?.({ actor, item, targets: selectedTargets });
  const finalization = await finalizeItemEffect({ actor, item, result, afterRefresh });
  return { ...finalization, result };
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
  targets = null,
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
    targets,
    apply: async ({ actor, item, targets }) => {
      if (getItemActionType(item)) {
        const actionResult = await applyActionTypeItem?.(actor, item, { targets });
        if (actionResult?.handled) return actionResult;
      }

      return useLegacyPotionEffect(actor, item);
    },
  });

  if (outcome.result && !outcome.result?.handled) {
    notifyWarn("У зелья не настроен эффект.");
  }

  return outcome;
}

export async function useConsumableItemFromSheet(actor, itemId, {
  skipTimeCost = false,
  targets = null,
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
    targets,
    apply: ({ actor, item, targets }) => applyActionTypeItem?.(actor, item, { targets }),
  });

  if (outcome.result && !outcome.result?.handled) {
    notifyWarn("У предмета не настроен actionType.");
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
    notifyWarn(unsupportedMessage);
    return false;
  }

  const handlerOptions = {
    skipTimeCost,
    ...actionOptions,
  };

  if (item.type === "food") {
    return (await handlers.useFood?.(item.id, handlerOptions)) ?? true;
  }

  if (item.type === "spell") {
    return (await handlers.castSpell?.({ item, isScroll: false, ...handlerOptions })) ?? true;
  }

  if (item.type === "scroll") {
    return (await handlers.castSpell?.({ item, isScroll: true, ...handlerOptions })) ?? true;
  }

  if (item.type === "potion") {
    return (await handlers.usePotion?.(item.id, handlerOptions)) ?? true;
  }

  if (item.type === "throwable") {
    return (await handlers.useThrowable?.(item.id, handlerOptions)) ?? true;
  }

  if (item.type === "consumable") {
    return (await handlers.useConsumable?.(item.id, handlerOptions)) ?? true;
  }

  if (allowWeapon && item.type === "weapon") {
    return (await handlers.equipWeapon?.(item.id, "rightHand")) ?? true;
  }

  notifyWarn(unsupportedMessage);
  return false;
}

export async function resumePendingItemAction(actor, data, config, handlers = {}) {
  const targetContext = resolveCombatActionTargetContext({ payload: data });
  const actionOptions = {
    ...(targetContext.targets.length ? { targets: targetContext.targets } : {}),
    ...(targetContext.spellOverrides ? { spellOverrides: targetContext.spellOverrides } : {}),
    ...(targetContext.targetZone ? { targetZone: targetContext.targetZone } : {}),
    ...(targetContext.targetPart ? { targetPart: targetContext.targetPart } : {}),
    ...(targetContext.targetZoneMode ? { targetZoneMode: targetContext.targetZoneMode } : {}),
  };

  return useItemByType(actor, data?.itemId, {
    skipTimeCost: true,
    allowedTypes: config.allowedTypes,
    missingMessage: config.missingMessage,
    unsupportedMessage: config.missingMessage,
    actionOptions,
    handlers,
  });
}
