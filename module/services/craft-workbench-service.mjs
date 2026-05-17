/**
 * Логика верстака: мультимножество предметов → рецепт, расход материалов, обломки при провале.
 */
import { uniqueCraftRecipes } from "../constants/recipes.mjs";
import { MATERIALS, FOOD } from "../constants/items-catalog.mjs";
import {
  buildRecipeIngredientMultiset,
  ingredientDescriptorKeyFromItem,
  getItemCatalogId,
} from "./craft-ingredients.mjs";
import { getItemQuantity } from "../utils/item-utils.mjs";
import {
  removeQuantityFromItem,
  recalculateActorWeight,
} from "./inventory-service.mjs";
import {
  applyCraftQualityBonuses,
  getRecipeQualityByMargin,
} from "./world-content-service.mjs";
import { teachCraftRecipe } from "../constants/craft-knowledge.mjs";
import { addItemToActorOrStack } from "./trade-service.mjs";

function multisetEqual(a, b) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) if ((a[k] || 0) !== (b[k] || 0)) return false;
  return true;
}

export function mergeWorkbenchPieces(pieces) {
  const map = new Map();
  for (const p of pieces ?? []) {
    const id = String(p.itemId ?? "");
    const q = Number(p.qty ?? 0);
    if (!id || q <= 0) continue;
    map.set(id, (map.get(id) || 0) + q);
  }
  return [...map.entries()].map(([itemId, qty]) => ({ itemId, qty }));
}

export function validateWorkbenchPieces(actor, merged) {
  for (const { itemId, qty } of merged) {
    const item = actor.items.get(itemId);
    if (!item) return { ok: false, reason: "missing_item" };
    const have = getItemQuantity(item);
    if (qty > have || qty < 1) return { ok: false, reason: "bad_qty", itemId };
  }
  return { ok: true };
}

export function buildSelectionMultiset(actor, merged) {
  const bag = {};
  for (const { itemId, qty } of merged) {
    const item = actor.items.get(itemId);
    if (!item) return null;
    const k = ingredientDescriptorKeyFromItem(item);
    bag[k] = (bag[k] || 0) + qty;
  }
  return bag;
}

export function findRecipesMatchingMultiset(skillKey, multiset) {
  return uniqueCraftRecipes().filter(r => r.skillKey === skillKey &&
    multisetEqual(buildRecipeIngredientMultiset(r), multiset));
}

export function findTool(actor, craftType, minTier) {
  return Array.from(actor.items ?? []).find(i =>
    i.type === "tool" &&
    i.system?.craftType === craftType &&
    Number(i.system?.tier ?? 0) >= minTier
  );
}

function pieceStackUnitValue(actor, itemId) {
  const item = actor.items.get(itemId);
  if (!item) return Infinity;
  const cid = getItemCatalogId(item);
  const catalogV = MATERIALS[cid]?.value ?? FOOD[cid]?.value;
  if (catalogV != null) return Number(catalogV);
  const total = Number(item.system?.value ?? 0);
  const qty = Math.max(1, getItemQuantity(item));
  return total / qty;
}

/**
 * Эксперимент не совпал с рецептом: большая часть сгорает, у самой «душёвой» стопки остаётся 1 шт.
 */
export async function consumeWorkbenchNoRecipeSalvage(actor, merged) {
  if (!merged.length) return;
  const sorted = [...merged].sort(
    (a, b) => pieceStackUnitValue(actor, a.itemId) - pieceStackUnitValue(actor, b.itemId)
  );
  for (let i = 0; i < sorted.length; i++) {
    const { itemId, qty } = sorted[i];
    const take = i === 0 ? Math.max(0, qty - 1) : qty;
    if (take <= 0) continue;
    const item = actor.items.get(itemId);
    if (!item) continue;
    await removeQuantityFromItem(actor, item, take);
  }
  await recalculateActorWeight(actor);
}

export async function consumeWorkbenchPieces(actor, merged) {
  for (const { itemId, qty } of merged) {
    const item = actor.items.get(itemId);
    if (!item) continue;
    await removeQuantityFromItem(actor, item, qty);
  }
  await recalculateActorWeight(actor);
}

export async function grantRawFiber(actor, qty = 1) {
  const m = MATERIALS.raw_fiber;
  if (!m) return;
  const q = Math.max(1, Number(qty) || 1);
  const docData = {
    name: m.label,
    type: "material",
    img: "icons/svg/item-bag.svg",
    flags: { "iron-hills-system": { catalogId: "raw_fiber" } },
    system: {
      tier: m.tier,
      category: m.category,
      weight: Number(m.weight ?? 1) * q,
      quantity: q,
      gridW: 1,
      gridH: 1,
      value: Number(m.value ?? 1) * q,
      quality: "common",
    },
  };
  await addItemToActorOrStack(actor, docData);
  await recalculateActorWeight(actor);
}

/**
 * После успешного броска: списание, создание предмета, износ инструмента, запись рецепта.
 */
export async function finalizeWorkbenchSuccess(actor, recipe, merged, rollTotal, tool) {
  const rtier = Number(recipe.result?.system?.tier ?? 1);
  await consumeWorkbenchPieces(actor, merged);

  if (tool?.system?.durability) {
    const newDur = Math.max(0, Number(tool.system.durability.value ?? 10) - 1);
    await tool.update({ "system.durability.value": newDur });
  }

  const margin = rollTotal - recipe.difficulty;
  const quality = getRecipeQualityByMargin(margin);

  const sys = foundry.utils.duplicate(recipe.result.system ?? {});
  const tierFromRecipe = recipe.result.system?.tier;
  sys.tier = tierFromRecipe !== undefined && tierFromRecipe !== null
    ? Number(tierFromRecipe)
    : Number(tool?.system?.tier ?? 1);
  sys.quality = quality;
  if (recipe.result.type !== "material") {
    sys.quantity = 1;
  }

  applyCraftQualityBonuses(recipe.result.type, sys, quality);

  const durTable = { 1: 15, 2: 25, 3: 40, 4: 65, 5: 100, 6: 140, 7: 185, 8: 230, 9: 265, 10: 300 };
  const maxDur = durTable[sys.tier] ?? 100;
  if (["weapon", "armor", "tool", "belt", "backpack", "attachment"].includes(recipe.result.type)) {
    sys.durability = { value: maxDur, max: maxDur };
  }

  const docData = {
    name: recipe.result.name,
    type: recipe.result.type,
    img: recipe.result.img ?? "icons/svg/item-bag.svg",
    system: sys,
  };
  if (recipe.result.catalogId) {
    docData.flags = {
      "iron-hills-system": { catalogId: recipe.result.catalogId },
    };
  }
  if (recipe.result.flags && typeof recipe.result.flags === "object") {
    docData.flags = foundry.utils.mergeObject(
      docData.flags ?? {},
      recipe.result.flags,
      { inplace: false, insertKeys: true, insertValues: true },
    );
  }

  await addItemToActorOrStack(actor, docData);

  await teachCraftRecipe(actor, recipe.id);

  await recalculateActorWeight(actor);

  return { margin, quality };
}

/**
 * Совпало с рецептом, бросок провален — материалы потеряны, мелкий остаток.
 */
export async function finalizeWorkbenchFailedRoll(actor, merged) {
  await consumeWorkbenchPieces(actor, merged);
  await grantRawFiber(actor, 1);
}
