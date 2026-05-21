import { getActionBlockReason, grantSkillExp } from "./actor-state-service.mjs";
import {
  getPendingItemActionConfig,
  resumePendingItemAction,
  useItemByType,
} from "./actor-item-use-service.mjs";
import { resolveCombatActionTargets } from "./combat-action-target-service.mjs";
import {
  castCatalogSpellAction,
  performCombatAoeAttack,
  performTechniqueSupportCombatAction,
} from "./combat-special-action-service.mjs";
import { markActorDead } from "./condition-service.mjs";

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
  handlers = {},
} = {}) {
  const reason = getActionBlockReason(actor, "quickslot", { slotKey });

  if (reason) {
    ui.notifications.warn(reason);
    return false;
  }

  const itemId = actor?.system?.quickSlots?.[slotKey];
  const item = itemId ? actor.items.get(itemId) : null;

  if (!item) {
    ui.notifications.warn("Предмет в слоте не найден");
    return false;
  }

  return useActorItemByType(actor, item, {
    skipTimeCost,
    allowWeapon: true,
    unsupportedMessage: "Этот тип предмета пока нельзя использовать из быстрого слота",
    handlers,
  });
}

export function buildAttackPayloadFromPendingAction(actor, data = {}) {
  const weapon = data.weaponId ? actor?.items?.get(data.weaponId) : null;
  const targets = resolveCombatActionTargets({ targetRefs: data.targetRefs });

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
    hitBonus: Number(data.hitBonus ?? 0),
    ignoreArmor: Number(data.ignoreArmor ?? 0),
    targetZone: data.targetZone ?? null,
    aimed: Boolean(data.aimed ?? false),
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
    targets,
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
      ui.notifications.warn("Невозможно продолжить атаку: обработчик атаки не подключён.");
      return { ok: false, reason: "missing-attack-handler" };
    }

    await performAttack(buildAttackPayloadFromPendingAction(actor, data));
    return { ok: true, handled: true, actionType };
  }

  if (actionType === "quickslot") {
    const slotKey = data.slotKey;
    if (!slotKey) {
      ui.notifications.warn("Не найден quick slot для продолжения действия.");
      return { ok: false, reason: "missing-quickslot" };
    }

    await useActorQuickSlot(actor, slotKey, {
      skipTimeCost: true,
      handlers,
    });
    return { ok: true, handled: true, actionType };
  }

  if (actionType === "catalog-spell") {
    const targets = resolveCombatActionTargets({ targetRefs: data.targetRefs });
    const result = await castCatalogSpellAction({
      actor,
      spell: data.spell,
      targets,
      skipTimeCost: true,
      applySkillExp: (skillKey, label) => grantSkillExp(actor, skillKey, label, 1),
      onLethal: target => markActorDead(target),
    });
    return { ok: Boolean(result?.ok ?? true), handled: true, actionType, result };
  }

  if (actionType === "aoe-attack") {
    const result = await performCombatAoeAttack({
      actor,
      ...data,
      skipTimeCost: true,
    });
    return { ok: Boolean(result?.ok ?? true), handled: true, actionType, result };
  }

  if (actionType === "technique-support") {
    const weapon = data.weaponId ? actor?.items?.get(data.weaponId) : null;
    const result = await performTechniqueSupportCombatAction({
      actor,
      technique: data.technique,
      weapon,
      skipTimeCost: true,
    });
    return { ok: Boolean(result?.ok ?? true), handled: true, actionType, result };
  }

  const pendingItemConfig = getPendingItemActionConfig(actionType);
  if (pendingItemConfig) {
    await resumeActorPendingItemAction(actor, data, pendingItemConfig, handlers);
    return { ok: true, handled: true, actionType };
  }

  ui.notifications.info(`Действие "${pendingAction.label || "действие"}" завершено.`);
  return { ok: true, handled: false, actionType };
}
