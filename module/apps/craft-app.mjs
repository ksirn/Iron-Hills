/**
 * Iron Hills — Craft knowledge (readonly)
 * Список изученных рецептов. Сборка выполняется в окне «Ремесло» (верстак).
 */
import { uniqueCraftRecipes } from "../constants/recipes.mjs";
import {
  getAvailableIngredientQuantity,
} from "../services/world-content-service.mjs";
import { filterRecipesForActor } from "../constants/craft-knowledge.mjs";

/**
 * Расчёт шанса успеха с учётом взрыва куба (exploding dice).
 * Шаг взрыва: d2→d4→d6→...→d20 (шаг +2).
 * При взрыве результат обнуляется, бросается следующий куб.
 * Игрок взрывает оптимально: только если max текущего куба < threshold.
 * Пример: d2, порог 4 → max(d2)=2 < 4 → взрыв на d4 → max(d4)=4 >= 4 → берём.
 *   P = 1/2 * 1/4 = 12.5%
 */
function calcExplodingChance(threshold, skillValue) {
  if (skillValue <= 0) return 0;
  const startDie = Math.max(2, skillValue * 2);

  function p(need, d) {
    if (need <= 0) return 1;

    if (d >= 20) {
      // d20 финальный — взрыва нет
      return need > 20 ? 0 : Math.max(0, 20 - need + 1) / 20;
    }

    // Шанс выбросить need..d-1 (не max — не взрываем, нужное уже достигнуто)
    const normalSuccess = Math.max(0, d - Math.max(need, 1)) / d;

    if (need > d) {
      // Max куба недостаточен → если выпал max, всегда взрываем
      const explodeChance = (1 / d) * p(need, Math.min(d + 2, 20));
      return normalSuccess + explodeChance;
    } else {
      // Max куба достаточен (d >= need) → берём max, не взрываем
      const maxTake = 1 / d;
      return normalSuccess + maxTake;
    }
  }

  return Math.round(p(threshold, startDie) * 100);
}
import { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, TOOLS } from "../constants/items-catalog.mjs";

// Все предметы из каталога в плоский список
const ALL_CATALOG_ITEMS = [
  ...Object.values(MATERIALS),
  ...Object.values(WEAPONS),
  ...Object.values(ARMORS),
  ...Object.values(POTIONS),
  ...Object.values(FOOD),
  ...Object.values(TOOLS),
];

// Найти запись каталога для подписи ингредиента (металл: слиток в приоритете; для плавки — preferOre)
function findCatalogItem(category, tier, opts = {}) {
  let matches = ALL_CATALOG_ITEMS.filter(i => i.category === category && i.tier === tier);
  if (!matches.length) {
    matches = ALL_CATALOG_ITEMS.filter(i => i.category === category && i.tier <= tier);
    matches.sort((a, b) => b.tier - a.tier);
  }
  if (!matches.length) return null;
  if (opts.preferOre && category === "metal") {
    const ore = matches.find(i => String(i.id ?? "").includes("_ore"));
    if (ore) return ore;
  }
  if (category === "metal") {
    const ingot = matches.find(i => String(i.id ?? "").includes("_ingot"));
    if (ingot) return ingot;
  }
  return matches[0];
}

const SKILL_LABELS = {
  smithing:  "Кузнечное дело",
  crafting:  "Ремесло",
  alchemy:   "Алхимия",
  cooking:   "Готовка",
  blacksmithing: "Кузнечное дело",
  enchanting: "Зачарование",
  jewelry: "Ювелирное дело",
};

const CATEGORY_LABELS = {
  metal:  "Металл",   wood:   "Дерево",
  hide:   "Шкура",    fiber:  "Волокно",
  herb:   "Травы",    herbs:  "Травы",
  stone:  "Камень",   misc:   "Разное",
  water:  "Вода",     meat:   "Мясо",
  bone:   "Кость",    ore:    "Руда",
};

function findTool(actor, craftType, minTier) {
  return Array.from(actor.items ?? []).find(i =>
    i.type === "tool" &&
    i.system?.craftType === craftType &&
    Number(i.system?.tier ?? 0) >= minTier
  );
}

class IronHillsCraftKnowledgeApp extends Application {

  constructor(actor, options = {}) {
    super(options);
    this.actor    = actor;
    this._filter  = "all";
    this._search  = "";
    this._selected = null; // выбранный рецепт
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "craft-app"],
      width:     700,
      height:    560,
      resizable: true,
      title:     "📖 Изученные рецепты"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/craft-app.hbs";
  }

  /** Не сбрасывать прокрутку списка рецептов при выборе/поиске/фильтре. */
  async _render(force = false, options = {}) {
    const prev = this.element?.find?.(".ih-craft-recipes")?.[0]?.scrollTop ?? 0;
    await super._render(force, options);
    const next = this.element?.find?.(".ih-craft-recipes")?.[0];
    if (next) {
      queueMicrotask(() => { next.scrollTop = prev; });
    }
  }

  async getData() {
    const actor   = this.actor;
    const skills  = actor.system?.skills ?? {};

    // Все рецепты с расчётом доступности
    const allRecipes = filterRecipesForActor(actor, uniqueCraftRecipes()).map(recipe => {
      const skill       = skills[recipe.skillKey];
      const skillValue  = Number(skill?.value ?? 0);
      const dieSize     = Math.max(2, skillValue * 2);
      const tool        = findTool(actor, recipe.tool?.craftType, recipe.tool?.tier ?? 1);
      const hasTool     = !!tool;

      const rtier = recipe.result?.system?.tier ?? 1;
      const ingredients = recipe.ingredients.map(ing => {
        const tier = ing.catalogMaterialId
          ? MATERIALS[ing.catalogMaterialId]?.tier
          : ing.catalogFoodId
            ? FOOD[ing.catalogFoodId]?.tier
            : ing.tier ?? rtier;
        const have = getAvailableIngredientQuantity(actor, ing, rtier);
        const enough = have >= ing.quantity;
        const catalogItem = ing.catalogMaterialId
          ? MATERIALS[ing.catalogMaterialId]
          : ing.catalogFoodId
            ? FOOD[ing.catalogFoodId]
            : findCatalogItem(ing.category, tier, { preferOre: ing.preferOre === true });
        const label = catalogItem?.label
          ?? (ing.type && ing.category
            ? `${CATEGORY_LABELS[ing.category] ?? ing.category} (ст.${tier})`
            : "Ингредиент");
        return {
          type:     ing.type,
          category: ing.category,
          tier,
          label,
          need:     ing.quantity,
          have,
          enough,
        };
      });

      const allIngr  = ingredients.every(i => i.enough);
      const canCraft = hasTool && allIngr && skillValue > 0;

      // Шанс успеха с учётом взрыва куба
      const successChance = calcExplodingChance(recipe.difficulty, skillValue);

      return {
        id:            recipe.id,
        label:         recipe.label,
        skillKey:      recipe.skillKey,
        skillLabel:    SKILL_LABELS[recipe.skillKey] ?? recipe.skillKey,
        skillValue,
        dieSize,
        difficulty:    recipe.difficulty,
        successChance,
        hasTool,
        toolName:      tool?.name ?? `Инструмент (${recipe.tool?.craftType})`,
        ingredients,
        allIngr,
        canCraft,
        resultType:    recipe.result?.type ?? "",
        resultTypeLabel: ({
          weapon:"Оружие", armor:"Доспех", potion:"Зелье",
          consumable:"Расходник", food:"Еда", material:"Материал",
        })[recipe.result?.type ?? ""] ?? "",
        resultItemName: recipe.result?.name ?? "",
        resultTier:    Number(recipe.result?.system?.tier ?? 0) || null,
        isSelected:    recipe.id === this._selected,
        // Характеристики результата для предпросмотра
        resultPreview: (() => {
          const rs  = recipe.result?.system ?? {};
          const rt  = recipe.result?.type   ?? "";
          const out = [];
          if (rt === "weapon") {
            const dmg = rs.damage ?? 0;
            const fBonus = dmg ? Math.max(1, Math.round(dmg * 0.1)) : 0;
            const mwBonus = dmg ? Math.max(1, Math.round(dmg * 0.2)) : 0;
            const legBonus = dmg ? Math.max(1, Math.round(dmg * 0.3)) : 0;
            out.push({ label:"Урон", val:`${dmg}`, quality:`Хор:+${fBonus} / Мас:+${mwBonus} / Лег:+${legBonus}` });
            out.push({ label:"Навык",    val:rs.skill ?? "—" });
            out.push({ label:"Энергия",  val:rs.energyCost ?? "—" });
            out.push({ label:"Тип",      val:rs.damageType === "magical" ? "✦ Магический" : "⚔ Физический" });
            if (rs.twoHanded) out.push({ label:"", val:"✋ Двуручное" });
          } else if (rt === "armor") {
            const phys = rs.protection?.physical ?? rs.resist?.physical ?? 0;
            const mag = rs.protection?.magical ?? rs.resist?.magical ?? 0;
            const pf = phys ? Math.max(1, Math.round(phys * 0.1)) : 0;
            const pmw = phys ? Math.max(1, Math.round(phys * 0.2)) : 0;
            const ple = phys ? Math.max(1, Math.round(phys * 0.3)) : 0;
            const mf = mag ? Math.max(1, Math.round(mag * 0.1)) : 0;
            out.push({
              label: "Физ. защита",
              val: `${phys}`,
              quality: `Хор:+${pf} физ ${mag ? `/+${mf} маг` : ""} · Мас:+${pmw} · Лег:+${ple}`,
            });
            if (mag) {
              const magDisp = `${mag}`;
              out.push({ label:"Маг. защита", val: magDisp });
            }
            out.push({ label:"Слот", val:rs.slot ?? "—" });
          } else if (rt === "potion" || rt === "consumable") {
            if (rs.actionType === "drink-vessel") {
              out.push({ label:"Тип", val:"🍶 Сосуд" });
              const cur = Number(rs.vesselCurrent ?? 0);
              const mx = Number(rs.vesselMax ?? 0);
              if (mx) out.push({ label:"Объём", val:`${cur} / ${mx}` });
              out.push({
                label: "Заправка",
                val: `${String(rs.vesselLiquidLabel ?? "—")} · жажда +${rs.vesselHydrationPerDrink ?? 0}/глоток`,
              });
              if (Number(rs.vesselSatietyPerDrink)) {
                out.push({ label:"Сытность", val: `+${rs.vesselSatietyPerDrink}/глоток` });
              }
            } else {
              const EFFECTS = {
                healHP:"🩹 Лечение HP", healAll:"💚 Лечение тела",
                restoreEnergy:"⚡ Восстановление энергии", restoreMana:"✦ Восстановление маны",
                restoreEnergyMax:"🏃 Лимит выносливости",
                restoreHydration:"💧 Жажда", restoreSatiety:"🍖 Голод",
                curePoison:"🟢 Противоядие", cureDisease:"🏥 Болезнь",
                speedBoost:"⚡ Скорость", strengthBoost:"💪 Сила",
                stun:"⚡ Оглушение", silence:"🔇 Безмолвие",
                slow:"🐢 Замедление", fear:"😱 Страх", reserveDrain:"💀 Резерв",
              };
              out.push({ label:"Эффект", val:EFFECTS[rs.effect] ?? rs.effect ?? "—" });
              out.push({ label:"Сила",   val:rs.power ?? "—" });
              if (rs.scope)    out.push({ label:"Цель",    val:rs.scope });
              if (rs.duration) out.push({ label:"Длит.",   val:`${rs.duration}с` });
            }
          } else if (rt === "food") {
            out.push({ label:"🍖 Сытость", val:`+${rs.satiety  ?? 0}` });
            out.push({ label:"💧 Жажда",   val:`+${rs.hydration ?? 0}` });
          } else if (rt === "material") {
            out.push({ label:"Категория", val: CATEGORY_LABELS[rs.category] ?? rs.category ?? "—" });
            if (Number(rs.quantity) > 1) out.push({ label:"Кол-во", val: String(rs.quantity) });
            out.push({ label:"Цена стопки", val: `${rs.value ?? "—"}` });
          }
          // Прочность по ступени
          const dur = {1:15,2:25,3:40,4:65,5:100}[recipe.result?.system?.tier ?? 1] ?? 15;
          if (["weapon","armor","tool","belt","backpack","attachment"].includes(rt)) out.push({ label:"Прочность", val:dur });
          return out;
        })(),
        // Фильтрация
        matchesFilter: this._filter === "all" || recipe.skillKey === this._filter,
        matchesSearch: !this._search || recipe.label.toLowerCase().includes(this._search.toLowerCase()),
      };
    });

    const visible = allRecipes.filter(r => r.matchesFilter && r.matchesSearch);
    const selectedRecipe = visible.find(r => r.isSelected) ?? null;

    // Уникальные навыки для фильтров
    // Только навыки которые есть в рецептах
    const usedSkills = [...new Set(allRecipes.map(r => r.skillKey))];
    const filters = [
      { key: "all", label: "Все" },
      ...usedSkills.map(k => ({ key: k, label: SKILL_LABELS[k] ?? k }))
    ].filter((f, i, arr) => arr.findIndex(x => x.key === f.key) === i);

    return {
      actor,
      recipes:  visible,
      selected: selectedRecipe,
      filters,
      activeFilter: this._filter,
      search:   this._search,
      hasRecipes: visible.length > 0,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Поиск
    html.find("[data-search]").on("input", e => {
      this._search = e.currentTarget.value;
      this.render(false);
    });

    // Фильтр по навыку
    html.find("[data-filter]").on("click", e => {
      this._filter = e.currentTarget.dataset.filter;
      this.render(false);
    });

    // Выбор рецепта
    html.find("[data-recipe-id]").on("click", e => {
      const id = e.currentTarget.dataset.recipeId;
      this._selected = this._selected === id ? null : id;
      this.render(false);
    });
  }
}

export { IronHillsCraftKnowledgeApp, IronHillsCraftKnowledgeApp as IronHillsCraftApp };
