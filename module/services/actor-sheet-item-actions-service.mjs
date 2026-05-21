import {
  useConsumableItemFromSheet,
  useFoodItemFromSheet,
  usePotionItemFromSheet,
} from "./actor-item-use-service.mjs";
import { applyActionTypeItemFromDialog } from "./item-action-dialog-service.mjs";
import { castSpellLikeItem } from "./spell-casting-service.mjs";
import { useThrowableItem } from "./throwable-service.mjs";

export async function applyActorSheetActionTypeItem(sourceActor, item) {
  return applyActionTypeItemFromDialog(sourceActor, item);
}

export async function useActorSheetFood(actor, itemId, {
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  afterRefresh = null,
} = {}) {
  return useFoodItemFromSheet(actor, itemId, {
    skipTimeCost,
    resolveCombatTimeCost,
    afterRefresh,
  });
}

export async function useActorSheetPotion(actor, itemId, {
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  applyActionTypeItem = applyActorSheetActionTypeItem,
  afterRefresh = null,
} = {}) {
  return usePotionItemFromSheet(actor, itemId, {
    skipTimeCost,
    resolveCombatTimeCost,
    applyActionTypeItem,
    afterRefresh,
  });
}

export async function useActorSheetConsumable(actor, itemId, {
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  applyActionTypeItem = applyActorSheetActionTypeItem,
  afterRefresh = null,
} = {}) {
  return useConsumableItemFromSheet(actor, itemId, {
    skipTimeCost,
    resolveCombatTimeCost,
    applyActionTypeItem,
    afterRefresh,
  });
}

export async function castActorSheetSpellLike({
  actor,
  item,
  isScroll = false,
  skipTimeCost = false,
  targets = null,
  resolveCombatTimeCost = null,
  requestHostileAction = null,
  applySkillExp = null,
  onLethal = null,
  afterCast = null,
} = {}) {
  return castSpellLikeItem({
    actor,
    item,
    isScroll,
    skipTimeCost,
    targets,
    resolveCombatTimeCost,
    requestHostileAction,
    applySkillExp,
    onLethal,
    afterCast,
  });
}

export async function useActorSheetThrowable({
  actor,
  itemId,
  skipTimeCost = false,
  targets = null,
  resolveCombatTimeCost = null,
  requestHostileAction = null,
  applySkillExp = null,
  onLethal = null,
  afterUse = null,
} = {}) {
  return useThrowableItem({
    actor,
    itemId,
    skipTimeCost,
    targets,
    resolveCombatTimeCost,
    requestHostileAction,
    applySkillExp,
    onLethal,
    afterUse,
  });
}
