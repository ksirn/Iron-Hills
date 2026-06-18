import { getActionBlockReason, grantSkillExp } from "./actor-state-service.mjs";
import {
  getPendingItemActionConfig,
  resumePendingItemAction,
  useItemByType,
} from "./actor-item-use-service.mjs";
import { resolveCombatActionTargetContext } from "./combat-action-target-service.mjs";
import {
  castCatalogSpellAction,
  performCombatAoeAttack,
  performTechniqueSupportCombatAction,
} from "./combat-special-action-service.mjs";
import { markActorDead } from "./condition-service.mjs";

function notifyWarn(message) {
  globalThis.ui?.notifications?.warn?.(message);
}

function notifyInfo(message) {
  globalThis.ui?.notifications?.info?.(message);
}

export function buildItemUseHandlers(handlers = {}) {
  return {
    useFood: handlers.useFood,
    usePotion: handlers.usePotion,
    useConsumable: handlers.useConsumable,
    useThrowable: handlers.useThrowable,
    castSpell: handlers.castSpell,
    equipWeapon: handlers.equipWeapon,
  };
}

export async function useActorItemByType(actor, itemOrId, {
  skipTimeCost = false,
  allowWeapon = false,
  allowedTypes = null,
  actionOptions = {},
  missingMessage = "Предмет не найден",
  unsupportedMessage = "Этот тип предмета пока нельзя использовать",
  handlers = {},
} = {}) {
  return useItemByType(actor, itemOrId, {
    skipTimeCost,
    allowWeapon,
    allowedTypes,
    missingMessage,
    unsupportedMessage,
    actionOptions,
    handlers: buildItemUseHandlers(handlers),
  });
}

export async function resumeActorPendingItemAction(actor, data, config, handlers = {}) {
  return resumePendingItemAction(
    actor,
    data,
    config,
    buildItemUseHandlers(handlers)
  );
}

export async function useActorQuickSlot(actor, slotKey, {
  skipTimeCost = false,
  targets = null,
  actionOptions = {},
  handlers = {},
} = {}) {
  const reason = getActionBlockReason(actor, "quickslot", { slotKey, targets });

  if (reason) {
    notifyWarn(reason);
    return false;
  }

  const itemId = actor?.system?.quickSlots?.[slotKey];
  const item = itemId ? actor.items.get(itemId) : null;

  if (!item) {
    notifyWarn("Предмет в слоте не найден");
    return false;
  }

  return useActorItemByType(actor, item, {
    skipTimeCost,
    allowWeapon: true,
    unsupportedMessage: "Этот тип предмета пока нельзя использовать из быстрого слота",
    actionOptions: {
      ...(targets ? { targets } : {}),
      ...actionOptions,
    },
    handlers,
  });
}

export function normalizePendingExecutionResult(result, {
  actionType = "generic",
  defaultOk = true,
} = {}) {
  if (result === false) {
    return { ok: false, handled: true, actionType, reason: "handler-returned-false", result };
  }

  if (result && typeof result === "object") {
    if (result.queued) {
      return {
        ok: false,
        queued: true,
        handled: Boolean(result.handled ?? true),
        actionType,
        reason: result.reason || "queued-during-pending-execution",
        result,
      };
    }
    if (result.cancelled || result.canceled) {
      return {
        ok: false,
        cancelled: true,
        handled: Boolean(result.handled ?? true),
        actionType,
        reason: result.reason || "cancelled",
        result,
      };
    }
    if (result.ok === false) {
      return {
        ok: false,
        handled: Boolean(result.handled ?? true),
        actionType,
        reason: result.reason || "failed",
        result,
      };
    }
  }

  if (result === undefined || result === null) {
    return { ok: Boolean(defaultOk), handled: false, actionType, result };
  }

  return { ok: true, handled: true, actionType, result };
}

async function executePendingBranch(actionType, fn) {
  try {
    const result = await fn();
    return normalizePendingExecutionResult(result, { actionType });
  } catch (err) {
    console.error("Iron Hills | pending combat action failed", err);
    return {
      ok: false,
      handled: true,
      actionType,
      reason: "handler-error",
      error: String(err?.message ?? err),
    };
  }
}

export function buildAttackPayloadFromPendingAction(actor, data = {}) {
  const weapon = data.weaponId ? actor?.items?.get(data.weaponId) : null;
  const targetContext = resolveCombatActionTargetContext({ payload: data });

  return {
    hand: data.hand ?? null,
    skillKey: data.skillKey || "unarmed",
    label: data.label || weapon?.name || "Кулаки",
    damageType: data.damageType || "physical",
    baseDamage: Number(
      data.baseDamage ??
      weapon?.system?.damage ??
      actor?.system?.combat?.unarmedDamage ??
      1
    ),
    energyCost: Number(
      data.energyCost ??
      weapon?.system?.energyCost ??
      5
    ),
    weapon,
    attackMode: data.attackMode ?? null,
    hitBonus: Number(data.hitBonus ?? 0),
    ignoreArmor: Number(data.ignoreArmor ?? 0),
    targetZone: targetContext.targetZone ?? null,
    targetZoneMode: targetContext.targetZoneMode ?? null,
    aimed: Boolean(targetContext.aimed ?? false),
    technique: data.technique ?? null,
    applyCondition: data.applyCondition ?? null,
    conditionDuration: Number(data.conditionDuration ?? 0),
    conditionChance: Number(data.conditionChance ?? 1),
    effectNotes: Array.isArray(data.effectNotes) ? data.effectNotes : [],
    rangeOverride: Number(data.rangeOverride ?? 0) || null,
    skillValueFallback: Number(data.skillValueFallback ?? 0) || null,
    actionSeconds: Number(data.actionSeconds ?? 0) || null,
    autoTargetHostile: Boolean(data.autoTargetHostile ?? false),
    useExplodingDice: Boolean(data.useExplodingDice ?? true),
    targets: targetContext.targets,
    skipTimeCost: true,
  };
}

export async function executeActorPendingCombatAction(actor, pendingAction, {
  requireSettledInventory = null,
  performAttack = null,
  handlers = {},
} = {}) {
  if (!actor || !pendingAction) return { ok: false, reason: "missing-action" };

  const data = pendingAction.data ?? {};
  const actionType = pendingAction.actionType || data.actionType || "generic";
  const actionLabel = pendingAction.label || "продолжение действия";

  if (requireSettledInventory && !(await requireSettledInventory(actionLabel))) {
    return { ok: false, reason: "pending-inventory" };
  }

  if (actionType === "attack") {
    if (!performAttack) {
      notifyWarn("Невозможно продолжить атаку: обработчик атаки не подключён.");
      return { ok: false, reason: "missing-attack-handler" };
    }

    return executePendingBranch(actionType, () =>
      performAttack(buildAttackPayloadFromPendingAction(actor, data))
    );
  }

  if (actionType === "quickslot") {
    const slotKey = data.slotKey;
    if (!slotKey) {
      notifyWarn("Не найден quick slot для продолжения действия.");
      return { ok: false, reason: "missing-quickslot" };
    }

    const targetContext = resolveCombatActionTargetContext({ payload: data });
    return executePendingBranch(actionType, () => useActorQuickSlot(actor, slotKey, {
      skipTimeCost: true,
      targets: targetContext.targets,
      handlers,
    }));
  }

  if (actionType === "catalog-spell") {
    const targetContext = resolveCombatActionTargetContext({ payload: data });
    return executePendingBranch(actionType, () => castCatalogSpellAction({
      actor,
      spell: data.spell,
      targets: targetContext.targets,
      skipTimeCost: true,
      applySkillExp: (skillKey, label) => grantSkillExp(actor, skillKey, label, 1),
      onLethal: target => markActorDead(target),
    }));
  }

  if (actionType === "aoe-attack") {
    return executePendingBranch(actionType, () => performCombatAoeAttack({
      actor,
      ...data,
      skipTimeCost: true,
      onLethal: target => markActorDead(target),
    }));
  }

  if (actionType === "technique-support") {
    const weapon = data.weaponId ? actor?.items?.get(data.weaponId) : null;
    return executePendingBranch(actionType, () => performTechniqueSupportCombatAction({
      actor,
      technique: data.technique,
      weapon,
      skipTimeCost: true,
    }));
  }

  const pendingItemConfig = getPendingItemActionConfig(actionType);
  if (pendingItemConfig) {
    return executePendingBranch(actionType, () =>
      resumeActorPendingItemAction(actor, data, pendingItemConfig, handlers)
    );
  }

  notifyInfo(`Действие "${pendingAction.label || "действие"}" завершено.`);
  return { ok: true, handled: false, actionType };
}
