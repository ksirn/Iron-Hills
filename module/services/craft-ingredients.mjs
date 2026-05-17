/**
 * Ингредиенты крафта: поддержка catalogMaterialId / catalogFoodId и легаси type+category+tier.
 */
import { MATERIALS, FOOD } from "../constants/items-catalog.mjs";
import { getItemQuantity } from "../utils/item-utils.mjs";
import { recalculateActorWeight, removeQuantityFromItem } from "./inventory-service.mjs";

export function getItemCatalogId(item) {
  const fromFlag = item?.getFlag?.("iron-hills-system", "catalogId");
  if (fromFlag !== undefined && fromFlag !== null && String(fromFlag).trim() !== "") {
    return String(fromFlag).trim();
  }
  return String(item?.system?.catalogId ?? "").trim();
}

/**
 * Ключ мультимножества ингредиента для верстака (сопоставление с рецептом).
 */
export function ingredientDescriptorKeyFromItem(item) {
  const cid = getItemCatalogId(item);
  if (item?.type === "material" && cid && MATERIALS[cid]) return `m:${cid}`;
  if (item?.type === "food" && cid && FOOD[cid]) return `f:${cid}`;
  if (item?.type === "material") {
    const cat = item.system?.category;
    const tier = Number(item.system?.tier ?? 0);
    const name = item.name;
    const found = Object.values(MATERIALS).find(
      d => d.category === cat && Number(d.tier) === tier && d.label === name
    );
    if (found) return `m:${found.id}`;
  }
  if (item?.type === "food") {
    const tier = Number(item.system?.tier ?? 0);
    const name = item.name;
    const found = Object.values(FOOD).find(
      d => Number(d.tier ?? 1) === tier && d.label === name
    );
    if (found) return `f:${found.id}`;
  }
  const t = Number(item?.system?.tier ?? 1);
  return `l:${item?.type}:${item?.system?.category}:${t}`;
}

export function ingredientDescriptorKeyFromRecipeLine(ing, recipeResultTier = 1) {
  if (ing?.catalogMaterialId) return `m:${ing.catalogMaterialId}`;
  if (ing?.catalogFoodId) return `f:${ing.catalogFoodId}`;
  const t = ing.tier != null ? Number(ing.tier) : Number(recipeResultTier) || 1;
  return `l:${ing.type}:${ing.category}:${t}`;
}

export function buildRecipeIngredientMultiset(recipe) {
  const rt = recipe?.result?.system?.tier ?? 1;
  const bag = {};
  for (const ing of recipe.ingredients ?? []) {
    const k = ingredientDescriptorKeyFromRecipeLine(ing, rt);
    const q = Number(ing.quantity ?? 1);
    bag[k] = (bag[k] || 0) + q;
  }
  return bag;
}

/**
 * Совпадение предмета с описанием ингредиента из рецепта.
 */
export function itemMatchesIngredient(item, ing, recipeResultTier = 1) {
  const tierFb = Number(recipeResultTier) || 1;

  if (ing.catalogMaterialId) {
    const def = MATERIALS[ing.catalogMaterialId];
    if (!def || item.type !== "material") return false;
    const cid = getItemCatalogId(item);
    if (cid === ing.catalogMaterialId) return true;
    if (!cid && item.system?.category === def.category && Number(item.system?.tier ?? 0) === def.tier
      && item.name === def.label) {
      return true;
    }
    return false;
  }

  if (ing.catalogFoodId) {
    const def = FOOD[ing.catalogFoodId];
    if (!def || item.type !== "food") return false;
    const cid = getItemCatalogId(item);
    if (cid === ing.catalogFoodId) return true;
    if (!cid && Number(item.system?.tier ?? 0) === def.tier && item.name === def.label) {
      return true;
    }
    return false;
  }

  const tierNeed = ing.tier != null ? Number(ing.tier) : tierFb;
  if (item.type !== ing.type || item.system?.category !== ing.category) return false;
  return Number(item.system?.tier ?? 0) === tierNeed;
}

function sortIngredientCandidates(items, ing) {
  if (!ing?.preferOre) return [...items];
  return [...items].sort((a, b) => {
    const ao = String(getItemCatalogId(a)).endsWith("_ore") ? 0 : 1;
    const bo = String(getItemCatalogId(b)).endsWith("_ore") ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return Number(a.system?.tier ?? 0) - Number(b.system?.tier ?? 0);
  });
}

export function getAvailableIngredientQuantity(actor, ing, recipeResultTier = 1) {
  const items = Array.from(actor?.items ?? []).filter(i => itemMatchesIngredient(i, ing, recipeResultTier));
  return sortIngredientCandidates(items, ing).reduce((sum, i) => sum + getItemQuantity(i), 0);
}

/**
 * Списывает ингредиенты. Возвращает массив «тира» на каждую единицу (для легаси-логики).
 */
export async function consumeRecipeIngredients(actor, ingredients, recipeResultTier = 1) {
  const usedTiers = [];
  const rt = Number(recipeResultTier) || 1;

  for (const ingredient of ingredients) {
    let remaining = Number(ingredient.quantity ?? 0);
    if (remaining <= 0) continue;

    let rowTier = rt;
    if (ingredient.catalogMaterialId && MATERIALS[ingredient.catalogMaterialId]) {
      rowTier = MATERIALS[ingredient.catalogMaterialId].tier;
    } else if (ingredient.catalogFoodId && FOOD[ingredient.catalogFoodId]) {
      rowTier = FOOD[ingredient.catalogFoodId].tier;
    } else if (ingredient.tier != null) {
      rowTier = Number(ingredient.tier);
    }

    const candidates = sortIngredientCandidates(
      Array.from(actor.items ?? []).filter(i => itemMatchesIngredient(i, ingredient, rt)),
      ingredient
    );

    for (const item of candidates) {
      if (remaining <= 0) break;
      const currentQuantity = Math.max(1, Number(item.system?.quantity ?? 1));
      const take = Math.min(currentQuantity, remaining);
      for (let i = 0; i < take; i++) {
        usedTiers.push(Number(rowTier ?? item.system?.tier ?? 1));
      }
      await removeQuantityFromItem(actor, item, take);
      remaining -= take;
    }
  }

  await recalculateActorWeight(actor);
  return usedTiers;
}
