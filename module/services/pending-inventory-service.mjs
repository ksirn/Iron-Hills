import {
  PendingItemsApp,
  requireNoPendingInventory,
} from "../apps/pending-items-app.mjs";

export async function openPendingInventoryIfNeeded(actor) {
  return PendingItemsApp.openIfNeeded(actor);
}

export async function requireSettledInventoryForActor(actor, actionLabel = "действие") {
  const result = await requireNoPendingInventory(actor, { actionLabel });
  return Boolean(result?.ok);
}
