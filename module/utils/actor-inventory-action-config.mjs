export const INVENTORY_ITEM_ACTIONS = Object.freeze({
  food: {
    itemTypes: ["food"],
    title: "Съесть",
    iconClass: "fas fa-utensils",
    missingMessage: "Предмет не найден или не является едой",
    timeActionType: "food",
  },
  potion: {
    itemTypes: ["potion"],
    title: "Использовать",
    iconClass: "fas fa-flask",
    missingMessage: "Зелье не найдено",
    timeActionType: "potion",
    allowTargetPrompt: true,
  },
  consumable: {
    itemTypes: ["consumable"],
    title: "Применить",
    iconClass: "fas fa-bandage",
    missingMessage: "Расходник не найден",
    timeActionType: "use-consumable",
    allowTargetPrompt: true,
  },
  throwable: {
    itemTypes: ["throwable"],
    title: "Метнуть",
    iconClass: "fas fa-bullseye",
    missingMessage: "Метательный предмет не найден",
    timeActionType: "throwable",
  },
  spell: {
    itemTypes: ["spell"],
    title: "Сотворить",
    iconClass: "fas fa-wand-magic-sparkles",
    missingMessage: "Заклинание не найдено",
    timeActionType: "cast-spell",
    spellLike: true,
    isScroll: false,
  },
  scroll: {
    itemTypes: ["scroll"],
    title: "Прочитать",
    iconClass: "fas fa-scroll",
    missingMessage: "Свиток не найден",
    timeActionType: "scroll",
    spellLike: true,
    isScroll: true,
  },
});

const ACTION_BY_ITEM_TYPE = Object.freeze(Object.fromEntries(
  Object.entries(INVENTORY_ITEM_ACTIONS).flatMap(([actionKey, config]) =>
    config.itemTypes.map(type => [type, actionKey])
  )
));

const PENDING_ACTION_ALIASES = Object.freeze({
  consumable: "consumable",
  "use-consumable": "consumable",
  food: "food",
  "use-food": "food",
  potion: "potion",
  "use-potion": "potion",
  throwable: "throwable",
  "use-throwable": "throwable",
  spell: "spell",
  "cast-spell": "spell-like",
  scroll: "scroll",
});

export function getInventoryItemActionConfig(actionKey) {
  return INVENTORY_ITEM_ACTIONS[String(actionKey ?? "").trim()] ?? null;
}

export function getInventoryItemActionKeyForItem(item) {
  return ACTION_BY_ITEM_TYPE[item?.type] ?? null;
}

export function getInventoryItemActionKeysForItem(item) {
  const key = getInventoryItemActionKeyForItem(item);
  return key ? [key] : [];
}

export function buildInventoryItemActionView(actionKey, {
  reason = "",
  needsTarget = false,
} = {}) {
  const config = getInventoryItemActionConfig(actionKey);
  if (!config) return null;

  const blockedReason = String(reason ?? "").trim();
  const enabled = !blockedReason || (needsTarget && config.allowTargetPrompt);
  const className = [
    "ih-icon-btn",
    "tiny",
    needsTarget && enabled ? "needs-target" : "",
  ].filter(Boolean).join(" ");

  return {
    key: actionKey,
    title: blockedReason || config.title,
    iconClass: config.iconClass,
    className,
    enabled,
    canUse: !blockedReason,
    reason: blockedReason,
    needsTarget: Boolean(needsTarget),
  };
}

export function getPendingInventoryItemActionConfig(actionType) {
  const alias = PENDING_ACTION_ALIASES[String(actionType ?? "").trim()] ?? "";
  if (alias === "spell-like") {
    return {
      allowedTypes: ["spell", "scroll"],
      missingMessage: INVENTORY_ITEM_ACTIONS.spell.missingMessage,
    };
  }

  const config = getInventoryItemActionConfig(alias);
  if (!config) return null;
  return {
    allowedTypes: [...config.itemTypes],
    missingMessage: config.missingMessage,
  };
}
