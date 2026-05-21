import { CRAFT_RECIPES } from "../constants/recipes.mjs";
import { getLiveActor } from "../utils/actor-utils.mjs";
import { grantSkillExp } from "./actor-state-service.mjs";
import {
  addItemToActorOrStack,
} from "./trade-service.mjs";
import {
  cleanupInvalidActorReferences,
  recalculateActorWeight,
} from "./inventory-service.mjs";
import {
  applyActorConditionTick,
  applyActorFullRest,
  applyActorShortRest,
  cureActorDisease,
  markActorDead,
  reviveActor,
} from "./condition-service.mjs";
import {
  openPendingInventoryIfNeeded,
  requireSettledInventoryForActor,
} from "./pending-inventory-service.mjs";
import { repairActorItem } from "./repair-service.mjs";
import { requestGmHostileAction } from "./hostile-action-service.mjs";
import {
  queueActorSheetRender,
  refreshAllTradeUIs,
} from "./ui-refresh-service.mjs";
import { ensureCombatActorBodyStatus } from "./combat-flow-service.mjs";

function sanitizeDroppedItemData(data) {
  const itemData = foundry.utils.deepClone(data ?? {});

  delete itemData._id;
  delete itemData.folder;
  delete itemData.sort;
  delete itemData.ownership;
  delete itemData._stats;

  itemData.system = itemData.system ?? {};
  itemData.system.quantity = Math.max(1, Number(itemData.system.quantity ?? 1));

  return itemData;
}

export async function resolveDroppedItemData(data) {
  let itemDoc = null;

  try {
    if (Item.implementation?.fromDropData) {
      itemDoc = await Item.implementation.fromDropData(data);
    } else if (typeof Item.fromDropData === "function") {
      itemDoc = await Item.fromDropData(data);
    }
  } catch (err) {
    console.warn("Iron Hills | drop item resolve failed", err);
  }

  return itemDoc?.toObject?.() ?? foundry.utils.deepClone(data?.data ?? data);
}

export async function dropItemOnActorFromSheet(actor, data, {
  isEditable = true,
  afterDrop = null,
  render = null,
} = {}) {
  await ensureCombatActorBodyStatus(actor);
  if (!actor || !isEditable) return false;

  const rawItemData = await resolveDroppedItemData(data);
  if (!rawItemData?.type) {
    ui.notifications.warn("Не удалось распознать предмет для переноса.");
    return false;
  }

  await addItemToActorOrStack(actor, sanitizeDroppedItemData(rawItemData));
  await recalculateActorWeight(actor);
  await cleanupInvalidActorReferences(actor);
  await afterDrop?.(actor);

  render?.(false);
  return true;
}

export async function grantActorSheetSkillExp(actor, skillKey, label, amount = 1) {
  return grantSkillExp(actor, skillKey, label, amount);
}

export async function openActorPendingInventory(actor) {
  return openPendingInventoryIfNeeded(actor);
}

export async function requireActorSettledInventory(actor, actionLabel = "действие") {
  return requireSettledInventoryForActor(actor, actionLabel);
}

export function refreshActorItemUseUis(actor, {
  actorSheetClass = null,
  tradeAppClass = null,
} = {}) {
  queueActorSheetRender(actor);
  refreshAllTradeUIs(actorSheetClass, tradeAppClass);
}

export async function applyActorSheetConditionTick(actor, {
  onLethal = null,
} = {}) {
  return applyActorConditionTick(actor, { onLethal });
}

export async function applyActorSheetShortRest(actor, {
  requireSettledInventory = null,
} = {}) {
  if (requireSettledInventory && !(await requireSettledInventory("короткий отдых"))) return false;
  const result = await applyActorShortRest(actor);
  return result?.ok !== false;
}

export async function applyActorSheetFullRest(actor, {
  requireSettledInventory = null,
} = {}) {
  if (requireSettledInventory && !(await requireSettledInventory("полный отдых"))) return false;
  const result = await applyActorFullRest(actor);
  return result?.ok !== false;
}

export async function openActorCraftRecipe(actor, recipeId, {
  requireSettledInventory = null,
} = {}) {
  if (requireSettledInventory && !(await requireSettledInventory("ремесло"))) return false;

  const recipe = CRAFT_RECIPES[recipeId];
  if (!recipe) {
    ui.notifications.warn("Рецепт не найден");
    return false;
  }

  ui.notifications.info("Собери ингредиенты на верстаке: окно «Ремесло», вкладка нужного навыка.");
  game.ironHills?.openCraftWorkbenchWindow?.(actor, { initialSkillKey: recipe.skillKey });
  return true;
}

export async function openActorTradeWindow(sourceActor, {
  requireSettledInventoryForBuyer = null,
  openTradeApp = null,
} = {}) {
  const merchant = getLiveActor(sourceActor);
  if (!merchant || merchant.type !== "merchant") return false;

  const buyer = game.user?.character
    ?? canvas?.tokens?.controlled?.find(token => token.actor?.type === "character")?.actor
    ?? null;
  if (requireSettledInventoryForBuyer && !(await requireSettledInventoryForBuyer(buyer, "торговля"))) {
    return false;
  }

  openTradeApp?.(merchant, buyer);
  return true;
}

export async function requestActorSheetHostileAction(actor, actionLabel) {
  return requestGmHostileAction(actor, actionLabel);
}

export async function markActorSheetDead(actor) {
  return markActorDead(actor);
}

export async function reviveActorFromSheet(actor, quality = 1) {
  return reviveActor(actor, quality);
}

export async function cureActorDiseaseFromSheet(actor, diseaseKey) {
  return cureActorDisease(actor, diseaseKey);
}

export async function repairActorItemFromSheet(actor, item, {
  applySkillExp = null,
} = {}) {
  return repairActorItem(actor, item, { applySkillExp });
}
