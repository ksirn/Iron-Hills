/**
 * Известные рецепты крафта персонажа.
 * Совокупность каталогов в CRAFT_RECIPES — выборочная; дополняется по ходу кампании.
 *
 * Совпадает с начальными значениями template.json → character.system.craft.knownRecipeIds
 */
import { CRAFT_RECIPES } from "./recipes.mjs";

/** Рецепты, которые новый персонаж и наследники миграции получают автоматически (деревенский минимум). */
export const STARTER_RECIPE_IDS = [
  "copper_knife",
  "cooked_stew",
  "cook_field_stew",
  "minor_heal_potion",
  "smelt_copper",
];

export function canonicalRecipeId(recipeId) {
  const r = CRAFT_RECIPES[recipeId];
  return r?.id ? String(r.id) : String(recipeId ?? "");
}

export function getKnownRecipeIds(actor) {
  const raw = actor?.system?.craft?.knownRecipeIds;
  if (!Array.isArray(raw)) return [];
  return raw.map(x => String(x)).filter(Boolean);
}

/**
 * @param {{ gmSeesAll?: boolean }} opts — для GM в крафте показывать и разрешать всё.
 */
export function actorKnowsRecipe(actor, recipeId, opts = {}) {
  const { gmSeesAll = true } = opts;
  const canon = canonicalRecipeId(recipeId);
  if (!canon || !CRAFT_RECIPES[canon]) return false;
  if (gmSeesAll && typeof game !== "undefined" && game?.user?.isGM) return true;
  return new Set(getKnownRecipeIds(actor)).has(canon);
}

export function filterRecipesForActor(actor, recipes, opts = {}) {
  const { gmSeesAll = true } = opts;
  if (typeof game !== "undefined" && game?.user?.isGM && gmSeesAll) return recipes;
  const known = new Set(getKnownRecipeIds(actor));
  return recipes.filter(r => r?.id && known.has(String(r.id)));
}

export async function teachCraftRecipe(actor, recipeId) {
  if (!actor || actor.type !== "character") return { ok: false, reason: "not_character" };
  const canon = canonicalRecipeId(recipeId);
  if (!CRAFT_RECIPES[canon]) return { ok: false, reason: "unknown_recipe" };
  const cur = getKnownRecipeIds(actor);
  if (cur.includes(canon)) return { ok: true, already: true };
  await actor.update({ "system.craft.knownRecipeIds": [...cur, canon] });
  return { ok: true, already: false, id: canon };
}

export async function forgetCraftRecipe(actor, recipeId) {
  if (!actor || actor.type !== "character") return { ok: false, reason: "not_character" };
  const canon = canonicalRecipeId(recipeId);
  const next = getKnownRecipeIds(actor).filter(id => id !== canon);
  await actor.update({ "system.craft.knownRecipeIds": next });
  return { ok: true, id: canon };
}
