import { getPersistentActor } from "../utils/actor-utils.mjs";
import {
  executeActorPendingCombatAction,
  useActorItemByType,
  useActorQuickSlot,
} from "./actor-action-dispatch-service.mjs";
import {
  applyActorSheetConditionTick,
  applyActorSheetFullRest,
  applyActorSheetShortRest,
  cureActorDiseaseFromSheet,
  dropItemOnActorFromSheet,
  grantActorSheetSkillExp,
  markActorSheetDead,
  openActorCraftRecipe,
  openActorPendingInventory,
  openActorTradeWindow,
  refreshActorItemUseUis,
  repairActorItemFromSheet,
  requestActorSheetHostileAction,
  requireActorSettledInventory,
  reviveActorFromSheet,
} from "./actor-sheet-actions-service.mjs";
import {
  advanceActorSheetCombatTurn,
  cancelActorSheetPendingCombatAction,
  commitActorSheetTimedAction,
  continueActorSheetPendingCombatAction,
  endActorSheetCombat,
  endActorSheetCombatTurn,
  handleActorSheetPostActionSecondsState,
  performActorSheetAttack,
  resolveActorSheetCombatTimeCost,
  startActorSheetCombat,
} from "./actor-sheet-combat-actions-service.mjs";
import {
  assignActorSheetQuickSlot,
  clearActorSheetQuickSlot,
  deleteActorSheetOwnedItem,
  equipActorSheetArmor,
  equipActorSheetWeapon,
  unequipActorSheetArmor,
  unequipActorSheetHand,
} from "./actor-sheet-equipment-actions-service.mjs";
import {
  applyActorSheetActionTypeItem,
  castActorSheetSpellLike,
  useActorSheetConsumable,
  useActorSheetFood,
  useActorSheetPotion,
  useActorSheetThrowable,
} from "./actor-sheet-item-actions-service.mjs";
import {
  performUniversalSkillRoll,
  rollExplodingDice,
} from "./skill-roll-service.mjs";
import { resolveCombatActionTargets } from "./combat-action-target-service.mjs";
import { buildActorBaseAttackParams } from "./combat-attack-profile-service.mjs";

function renderSheet(sheet, force = false) {
  sheet?.render?.(force);
}

function getSheetRender(sheet) {
  return (force) => renderSheet(sheet, force);
}

function getSheetActionClasses(sheet, {
  actorSheetClass = null,
  tradeAppClass = null,
} = {}) {
  return {
    actorSheetClass: actorSheetClass ?? sheet?.constructor ?? null,
    tradeAppClass,
  };
}

export function getActorForSheet(sheet) {
  return sheet?._getActorForState?.()
    ?? getPersistentActor(sheet?.actor)
    ?? sheet?.actor
    ?? null;
}

export async function dropItemForActorSheet(sheet, data) {
  const actor = getActorForSheet(sheet);

  return dropItemOnActorFromSheet(actor, data, {
    isEditable: sheet?.isEditable ?? true,
    afterDrop: (dropActor) => openPendingInventoryForActorSheet(sheet, dropActor),
    render: getSheetRender(sheet),
  });
}

export async function startCombatForActorSheet(sheet) {
  return startActorSheetCombat(getActorForSheet(sheet), {
    render: getSheetRender(sheet),
  });
}

export async function endCombatForActorSheet(sheet) {
  return endActorSheetCombat({
    render: getSheetRender(sheet),
  });
}

export async function advanceCombatTurnForActorSheet(sheet) {
  return advanceActorSheetCombatTurn(getActorForSheet(sheet), {
    render: getSheetRender(sheet),
  });
}

export async function continuePendingCombatActionForActorSheet(sheet, options = {}) {
  return continueActorSheetPendingCombatAction(getActorForSheet(sheet), {
    executePendingAction: (action) => executePendingCombatActionForActorSheet(sheet, action, options),
    render: getSheetRender(sheet),
  });
}

export async function endCombatTurnForActorSheet(sheet) {
  return endActorSheetCombatTurn(getActorForSheet(sheet), {
    render: getSheetRender(sheet),
  });
}

export async function cancelPendingCombatActionForActorSheet(sheet) {
  return cancelActorSheetPendingCombatAction(getActorForSheet(sheet), {
    render: getSheetRender(sheet),
  });
}

export async function commitTimedActionForActorSheet(sheet, {
  actionType,
  label,
  timeCost,
  payload = {},
} = {}) {
  return commitActorSheetTimedAction(getActorForSheet(sheet), {
    actionType,
    label,
    timeCost,
    payload,
  }, {
    render: getSheetRender(sheet),
  });
}

export async function handlePostActionSecondsStateForActorSheet(sheet, actor) {
  return handleActorSheetPostActionSecondsState(actor, {
    render: getSheetRender(sheet),
  });
}

export async function resolveCombatTimeCostForActorSheet(sheet, {
  actionType,
  label,
  item = null,
  totalSeconds = 0,
  payload = {},
} = {}) {
  return resolveActorSheetCombatTimeCost(getActorForSheet(sheet), {
    actionType,
    label,
    item,
    totalSeconds,
    payload,
  }, {
    requireSettledInventory: (actionLabel) => requireSettledInventoryForActorSheet(sheet, actionLabel),
  });
}

export async function useItemByTypeForActorSheet(sheet, itemOrId, {
  skipTimeCost = false,
  allowWeapon = false,
  allowedTypes = null,
  missingMessage = "РџСЂРµРґРјРµС‚ РЅРµ РЅР°Р№РґРµРЅ",
  unsupportedMessage = "Р­С‚РѕС‚ С‚РёРї РїСЂРµРґРјРµС‚Р° РїРѕРєР° РЅРµР»СЊР·СЏ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ",
} = {}, options = {}) {
  return useActorItemByType(getActorForSheet(sheet), itemOrId, {
    skipTimeCost,
    allowWeapon,
    allowedTypes,
    missingMessage,
    unsupportedMessage,
    handlers: getItemUseHandlersForActorSheet(sheet, options),
  });
}

export async function executePendingCombatActionForActorSheet(sheet, pendingAction, options = {}) {
  return executeActorPendingCombatAction(getActorForSheet(sheet), pendingAction, {
    requireSettledInventory: (actionLabel) => requireSettledInventoryForActorSheet(sheet, actionLabel),
    performAttack: (attackPayload) => performAttackForActorSheet(sheet, attackPayload, options),
    handlers: getItemUseHandlersForActorSheet(sheet, options),
  });
}

export function getItemUseHandlersForActorSheet(sheet, options = {}) {
  return {
    useFood: (itemId, handlerOptions) => useFoodForActorSheet(sheet, itemId, handlerOptions, options),
    usePotion: (itemId, handlerOptions) => usePotionForActorSheet(sheet, itemId, handlerOptions, options),
    useConsumable: (itemId, handlerOptions) => useConsumableForActorSheet(sheet, itemId, handlerOptions, options),
    useThrowable: (itemId, handlerOptions) => useThrowableForActorSheet(sheet, itemId, handlerOptions, options),
    castSpell: (handlerOptions) => castSpellLikeForActorSheet(sheet, handlerOptions, options),
    equipWeapon: (itemId, hand) => equipWeaponForActorSheet(sheet, itemId, hand, options),
  };
}

export async function applySkillExpForActorSheet(sheet, skillKey, label, amount = 1) {
  return grantActorSheetSkillExp(getActorForSheet(sheet), skillKey, label, amount);
}

export async function openPendingInventoryForActorSheet(sheet, actor = getActorForSheet(sheet)) {
  return openActorPendingInventory(actor);
}

export async function requireSettledInventoryForActorSheet(sheet, actionLabel = "РґРµР№СЃС‚РІРёРµ") {
  return requireSettledInventoryForSpecificActorSheet(sheet, getActorForSheet(sheet), actionLabel);
}

export async function requireSettledInventoryForSpecificActorSheet(sheet, actor, actionLabel = "РґРµР№СЃС‚РІРёРµ") {
  return requireActorSettledInventory(actor, actionLabel);
}

export async function equipWeaponForActorSheet(sheet, itemId, hand) {
  const actor = getActorForSheet(sheet);

  return equipActorSheetWeapon(actor, itemId, hand, {
    requireSettledInventory: (actionLabel) => requireSettledInventoryForActorSheet(sheet, actionLabel),
    afterChange: () => openPendingInventoryForActorSheet(sheet, actor),
  });
}

export async function unequipHandForActorSheet(sheet, hand) {
  const actor = getActorForSheet(sheet);

  return unequipActorSheetHand(actor, hand, {
    afterChange: () => openPendingInventoryForActorSheet(sheet, actor),
  });
}

export async function equipArmorForActorSheet(sheet, itemId) {
  const actor = getActorForSheet(sheet);

  return equipActorSheetArmor(actor, itemId, {
    requireSettledInventory: (actionLabel) => requireSettledInventoryForActorSheet(sheet, actionLabel),
    afterChange: () => openPendingInventoryForActorSheet(sheet, actor),
  });
}

export async function unequipArmorForActorSheet(sheet, slotKey) {
  const actor = getActorForSheet(sheet);

  return unequipActorSheetArmor(actor, slotKey, {
    afterChange: () => openPendingInventoryForActorSheet(sheet, actor),
  });
}

export async function assignQuickSlotForActorSheet(sheet, itemId, slotKey) {
  return assignActorSheetQuickSlot(getActorForSheet(sheet), itemId, slotKey);
}

export async function clearQuickSlotForActorSheet(sheet, slotKey) {
  return clearActorSheetQuickSlot(getActorForSheet(sheet), slotKey);
}

export async function deleteOwnedItemForActorSheet(sheet, itemId, options = {}) {
  const actor = getActorForSheet(sheet);

  return deleteActorSheetOwnedItem(actor, itemId, {
    afterDelete: () => refreshItemUseUisForActorSheet(sheet, actor, options),
  });
}

export function refreshItemUseUisForActorSheet(sheet, actor = getActorForSheet(sheet), options = {}) {
  refreshActorItemUseUis(actor, getSheetActionClasses(sheet, options));
}

export async function useFoodForActorSheet(sheet, itemId, {
  skipTimeCost = false,
} = {}, options = {}) {
  const actor = getActorForSheet(sheet);

  return useActorSheetFood(actor, itemId, {
    skipTimeCost,
    resolveCombatTimeCost: (args) => resolveCombatTimeCostForActorSheet(sheet, args),
    afterRefresh: () => refreshItemUseUisForActorSheet(sheet, actor, options),
  });
}

export async function usePotionForActorSheet(sheet, itemId, {
  skipTimeCost = false,
} = {}, options = {}) {
  const actor = getActorForSheet(sheet);

  return useActorSheetPotion(actor, itemId, {
    skipTimeCost,
    resolveCombatTimeCost: (args) => resolveCombatTimeCostForActorSheet(sheet, args),
    applyActionTypeItem: (sourceActor, item) => applyActionTypeItemForActorSheet(sourceActor, item),
    afterRefresh: () => refreshItemUseUisForActorSheet(sheet, actor, options),
  });
}

export async function applyActionTypeItemForActorSheet(sourceActor, item) {
  return applyActorSheetActionTypeItem(sourceActor, item);
}

export async function useConsumableForActorSheet(sheet, itemId, {
  skipTimeCost = false,
} = {}, options = {}) {
  const actor = getActorForSheet(sheet);

  return useActorSheetConsumable(actor, itemId, {
    skipTimeCost,
    resolveCombatTimeCost: (args) => resolveCombatTimeCostForActorSheet(sheet, args),
    applyActionTypeItem: (sourceActor, item) => applyActionTypeItemForActorSheet(sourceActor, item),
    afterRefresh: () => refreshItemUseUisForActorSheet(sheet, actor, options),
  });
}

export async function castSpellLikeForActorSheet(sheet, {
  item,
  isScroll = false,
  skipTimeCost = false,
  targets = null,
} = {}, options = {}) {
  const actor = getActorForSheet(sheet);

  return castActorSheetSpellLike({
    actor,
    item,
    isScroll,
    skipTimeCost,
    targets,
    resolveCombatTimeCost: (args) => resolveCombatTimeCostForActorSheet(sheet, args),
    requestHostileAction: (label) => requestGmHostileActionForActorSheet(sheet, label),
    applySkillExp: (skillKey, label) => applySkillExpForActorSheet(sheet, skillKey, label),
    onLethal: (target) => markActorDeadForActorSheet(target),
    afterCast: () => refreshItemUseUisForActorSheet(sheet, actor, options),
  });
}

export async function useThrowableForActorSheet(sheet, itemId, {
  skipTimeCost = false,
  targets = null,
} = {}, options = {}) {
  const actor = getActorForSheet(sheet);

  return useActorSheetThrowable({
    actor,
    itemId,
    skipTimeCost,
    targets,
    resolveCombatTimeCost: (args) => resolveCombatTimeCostForActorSheet(sheet, args),
    requestHostileAction: (label) => requestGmHostileActionForActorSheet(sheet, label),
    applySkillExp: (skillKey, label) => applySkillExpForActorSheet(sheet, skillKey, label),
    onLethal: (target) => markActorDeadForActorSheet(target),
    afterUse: () => refreshItemUseUisForActorSheet(sheet, actor, options),
  });
}

export async function updateActiveEffectsTickForActorSheet(sheet) {
  return applyActorSheetConditionTick(getActorForSheet(sheet), {
    onLethal: (actor) => markActorDeadForActorSheet(actor),
  });
}

export async function useQuickSlotForActorSheet(sheet, slotKey, {
  skipTimeCost = false,
} = {}, options = {}) {
  return useActorQuickSlot(getActorForSheet(sheet), slotKey, {
    skipTimeCost,
    handlers: getItemUseHandlersForActorSheet(sheet, options),
  });
}

export async function shortRestForActorSheet(sheet) {
  return applyActorSheetShortRest(getActorForSheet(sheet), {
    requireSettledInventory: (actionLabel) => requireSettledInventoryForActorSheet(sheet, actionLabel),
  });
}

export async function fullRestForActorSheet(sheet) {
  return applyActorSheetFullRest(getActorForSheet(sheet), {
    requireSettledInventory: (actionLabel) => requireSettledInventoryForActorSheet(sheet, actionLabel),
  });
}

export async function craftRecipeForActorSheet(sheet, recipeId) {
  return openActorCraftRecipe(getActorForSheet(sheet), recipeId, {
    requireSettledInventory: (actionLabel) => requireSettledInventoryForActorSheet(sheet, actionLabel),
  });
}

export async function openTradeWindowForActorSheet(sheet, options = {}) {
  return openActorTradeWindow(sheet?.actor, {
    requireSettledInventoryForBuyer: (actor, actionLabel) =>
      requireSettledInventoryForSpecificActorSheet(sheet, actor, actionLabel),
    openTradeApp: (merchant, buyer) => options.tradeAppClass?.open?.(merchant, buyer),
  });
}

export async function requestGmHostileActionForActorSheet(sheet, actionLabel) {
  return requestActorSheetHostileAction(getActorForSheet(sheet), actionLabel);
}

export async function markActorDeadForActorSheet(actor) {
  return markActorSheetDead(actor);
}

export async function reviveActorForActorSheet(sheet, actor, quality = 1) {
  return reviveActorFromSheet(actor, quality);
}

export async function cureDiseaseForActorSheet(sheet, actor, diseaseKey) {
  const result = await cureActorDiseaseFromSheet(actor, diseaseKey);
  renderSheet(sheet, false);
  return result;
}

export async function repairItemForActorSheet(sheet, actor, item) {
  const result = await repairActorItemFromSheet(actor, item, {
    applySkillExp: (skillKey, label) => applySkillExpForActorSheet(sheet, skillKey, label),
  });

  renderSheet(sheet, false);
  return result;
}

export async function rollExplodingDiceForActorSheet(skillValue) {
  return rollExplodingDice(skillValue);
}

export async function rollUniversalSkillForActorSheet(sheet, skillKey, label, options = {}) {
  return performUniversalSkillRoll(getActorForSheet(sheet), skillKey, label, options, {
    applySkillExp: (skillKey, expLabel) => applySkillExpForActorSheet(sheet, skillKey, expLabel),
    dieRoller: (skillValue) => rollExplodingDiceForActorSheet(skillValue),
  });
}

export async function performAttackForActorSheet(sheet, {
  hand = null,
  skillKey,
  label,
  damageType = "physical",
  baseDamage = 1,
  energyCost = 5,
  weapon = null,
  skipTimeCost = false,
  hitBonus = 0,
  ignoreArmor = 0,
  targetZone = null,
  aimed = false,
  technique = null,
  applyCondition = null,
  conditionDuration = 0,
  conditionChance = 1.0,
  effectNotes = [],
  rangeOverride = null,
  skillValueFallback = null,
  actionSeconds = null,
  autoTargetHostile = false,
  useExplodingDice = true,
  targets = null,
} = {}) {
  return performActorSheetAttack({
    actor: getActorForSheet(sheet),
    hand,
    skillKey,
    label,
    damageType,
    baseDamage,
    energyCost,
    weapon,
    skipTimeCost,
    targets,
    hitBonus,
    ignoreArmor,
    targetZone,
    aimed,
    technique,
    applyCondition,
    conditionDuration,
    conditionChance,
    effectNotes,
    rangeOverride,
    skillValueFallback,
    actionSeconds,
    autoTargetHostile,
    requireSettledInventory: (actionLabel) => requireSettledInventoryForActorSheet(sheet, actionLabel),
    resolveCombatTimeCost: (args) => resolveCombatTimeCostForActorSheet(sheet, args),
    requestHostileAction: (actionLabel) => requestGmHostileActionForActorSheet(sheet, actionLabel),
    dieRoller: useExplodingDice ? (skillValue) => rollExplodingDiceForActorSheet(skillValue) : null,
    onLethal: (target) => markActorDeadForActorSheet(target),
    applySkillExp: (skillKey, expLabel) => applySkillExpForActorSheet(sheet, skillKey, expLabel),
    afterAttack: () => renderSheet(sheet, false),
  });
}

export async function performHandAttackForActorSheet(sheet, hand, actor = getActorForSheet(sheet), options = {}) {
  if (actor?.type !== "character") {
    return performAttackForActorSheet(sheet, {
      ...buildActorBaseAttackParams(actor, { hand }),
      autoTargetHostile: true,
      useExplodingDice: false,
    }, options);
  }

  const weaponId = actor?.system?.equipment?.[hand];

  if (!weaponId) {
    return performAttackForActorSheet(sheet, {
      hand,
      skillKey: "unarmed",
      label: "РљСѓР»Р°РєРё",
      damageType: "physical",
      baseDamage: Number(actor?.system?.combat?.unarmedDamage ?? 1),
      energyCost: 5,
      weapon: null,
    }, options);
  }

  const weapon = actor?.items?.get(weaponId);
  if (!weapon) {
    ui.notifications.warn("Р­РєРёРїРёСЂРѕРІР°РЅРЅРѕРµ РѕСЂСѓР¶РёРµ РЅРµ РЅР°Р№РґРµРЅРѕ");
    return { ok: false, reason: "missing-equipped-weapon" };
  }

  return performAttackForActorSheet(sheet, {
    hand,
    skillKey: weapon.system.skill,
    label: weapon.name,
    damageType: weapon.system.damageType,
    baseDamage: Number(weapon.system.damage ?? 1),
    energyCost: Number(weapon.system.energyCost ?? 10),
    weapon,
  }, options);
}

export async function toggleAwakenedForActorSheet(sheet, actor = getActorForSheet(sheet)) {
  if (!game.user?.isGM) return { ok: false, reason: "not-gm" };

  const current = actor?.system?.resources?.awakened?.isAwakened ?? false;
  await actor.update({ "system.resources.awakened.isAwakened": !current });
  renderSheet(sheet, false);
  return { ok: true, value: !current };
}

export async function addDiseaseForActorSheet(sheet, actor = getActorForSheet(sheet)) {
  if (!game.user?.isGM) return { ok: false, reason: "not-gm" };

  const { DISEASES } = await import("../constants/diseases.mjs");
  const buttons = {};

  for (const [key, definition] of Object.entries(DISEASES)) {
    const existing = actor?.system?.diseases?.[key];
    if (existing && existing.stage >= 0) continue;
    buttons[key] = { label: `${definition.icon} ${definition.label}`, callback: () => key };
  }

  if (!Object.keys(buttons).length) {
    ui.notifications.info("РџРµСЂСЃРѕРЅР°Р¶ СѓР¶Рµ Р±РѕР»РµРµС‚ РІСЃРµРјРё Р±РѕР»РµР·РЅСЏРјРё РёР· РєР°С‚Р°Р»РѕРіР°.");
    return { ok: false, reason: "already-has-all-diseases" };
  }

  const chosen = await Dialog.wait({
    title: "Р—Р°СЂР°Р·РёС‚СЊ Р±РѕР»РµР·РЅСЊСЋ",
    content: `<p style="color:#a8b8d0">Р’С‹Р±РµСЂРё Р±РѕР»РµР·РЅСЊ РґР»СЏ <b>${actor.name}</b>:</p>`,
    buttons,
    default: Object.keys(buttons)[0],
  });

  if (!chosen) return { ok: false, reason: "cancelled" };

  const diseases = foundry.utils.deepClone(actor.system?.diseases ?? {});
  diseases[chosen] = { stage: 0, progress: 0, duration: 0 };
  await actor.update({ "system.diseases": diseases });

  const definition = DISEASES[chosen];
  await ChatMessage.create({
    content: `${definition.icon} <b>${actor.name}</b> Р·Р°СЂР°Р¶С‘РЅ: <b>${definition.label}</b> (РёРЅРєСѓР±Р°С†РёСЏ)`,
  });

  renderSheet(sheet, false);
  return { ok: true, diseaseKey: chosen };
}

export async function executePendingPayloadForActorSheet(sheet, payload = {}, options = {}) {
  const actor = getActorForSheet(sheet);
  const actionType = payload.actionType;
  const targets = resolveCombatActionTargets({
    targets: payload.targets,
    targetRefs: payload.targetRefs,
  });

  if (actionType === "attack") {
    await performAttackForActorSheet(sheet, { ...payload, targets }, options);
    return { ok: true, handled: true, actionType };
  }

  if (actionType === "spell" || actionType === "scroll") {
    const item = actor?.items?.get(payload.itemId);
    if (item) {
      await castSpellLikeForActorSheet(sheet, {
        item,
        isScroll: actionType === "scroll",
        targets,
      }, options);
    }
    return { ok: true, handled: Boolean(item), actionType };
  }

  if (actionType === "throwable") {
    await useThrowableForActorSheet(sheet, payload.itemId, { targets }, options);
    return { ok: true, handled: true, actionType };
  }

  if (actionType === "potion") {
    await usePotionForActorSheet(sheet, payload.itemId, {}, options);
    return { ok: true, handled: true, actionType };
  }

  if (actionType === "food") {
    await useFoodForActorSheet(sheet, payload.itemId, {}, options);
    return { ok: true, handled: true, actionType };
  }

  if (actionType === "consumable") {
    await useConsumableForActorSheet(sheet, payload.itemId, {}, options);
    return { ok: true, handled: true, actionType };
  }

  return { ok: false, handled: false, reason: "unsupported-action-type", actionType };
}
