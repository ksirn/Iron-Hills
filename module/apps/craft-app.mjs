/**
 * Iron Hills — Craft App
 * Отдельное окно крафта: рецепты, фильтры, проверка ингредиентов, бросок.
 */
import { CRAFT_RECIPES } from "../constants/recipes.mjs";

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

// Найти конкретный предмет по категории и тиру
function findCatalogItem(category, tier) {
  return ALL_CATALOG_ITEMS.find(i => i.category === category && i.tier === tier)
    ?? ALL_CATALOG_ITEMS.find(i => i.category === category && i.tier <= tier);
}

const SKILL_LABELS = {
  smithing:  "Кузнечное дело",
  crafting:  "Ремесло",
  alchemy:   "Алхимия",
  cooking:   "Готовка",
  blacksmithing: "Кузнечное дело",
};

const CATEGORY_LABELS = {
  metal:  "Металл",   wood:   "Дерево",
  hide:   "Шкура",    fiber:  "Волокно",
  herbs:  "Травы",    water:  "Вода",
  meat:   "Мясо",     stone:  "Камень",
  bone:   "Кость",    ore:    "Руда",
};

function getAvailableQty(actor, type, category) {
  return Array.from(actor.items ?? [])
    .filter(i => i.type === type && i.system?.category === category)
    .reduce((sum, i) => sum + Number(i.system?.quantity ?? 1), 0);
}

function findTool(actor, craftType, minTier) {
  return Array.from(actor.items ?? []).find(i =>
    i.type === "tool" &&
    i.system?.craftType === craftType &&
    Number(i.system?.tier ?? 0) >= minTier
  );
}

class IronHillsCraftApp extends Application {

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
      title:     "Крафт"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/craft-app.hbs";
  }

  async getData() {
    const actor   = this.actor;
    const skills  = actor.system?.skills ?? {};

    // Все рецепты с расчётом доступности
    const allRecipes = Object.values(CRAFT_RECIPES).map(recipe => {
      const skill       = skills[recipe.skillKey];
      const skillValue  = Number(skill?.value ?? 0);
      const dieSize     = Math.max(2, skillValue * 2);
      const tool        = findTool(actor, recipe.tool?.craftType, recipe.tool?.tier ?? 1);
      const hasTool     = !!tool;

      const ingredients = recipe.ingredients.map(ing => {
        const have = getAvailableQty(actor, ing.type, ing.category);
        const enough = have >= ing.quantity;
        // Ищем конкретный предмет из каталога по тиру рецепта
        const tier = ing.tier ?? recipe.result?.system?.tier ?? 1;
        const catalogItem = findCatalogItem(ing.category, tier);
        const label = catalogItem?.label
          ?? (CATEGORY_LABELS[ing.category] ?? ing.category) + ` (ст.${tier})`;
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
        isSelected:    recipe.id === this._selected,
        // Характеристики результата для предпросмотра
        resultPreview: (() => {
          const rs  = recipe.result?.system ?? {};
          const rt  = recipe.result?.type   ?? "";
          const tier = rs.tier ?? 1;
          // Бонусы качества зависят от тира: каждый уровень качества = +tier*0.25
          const fineBonus  = Math.round(tier * 0.25 * 10) / 10;
          const mwBonus    = Math.round(tier * 0.5  * 10) / 10;
          const legBonus   = Math.round(tier * 1.0  * 10) / 10;
          const out = [];
          if (rt === "weapon") {
            const dmg = rs.damage ?? 0;
            out.push({ label:"Урон",     val:`${dmg}`, quality:`Хор: +${fineBonus} / Мас: +${mwBonus} / Лег: +${legBonus}` });
            out.push({ label:"Навык",    val:rs.skill ?? "—" });
            out.push({ label:"Энергия",  val:rs.energyCost ?? "—" });
            out.push({ label:"Тип",      val:rs.damageType === "magical" ? "✦ Магический" : "⚔ Физический" });
            if (rs.twoHanded) out.push({ label:"", val:"✋ Двуручное" });
          } else if (rt === "armor") {
            const phys = rs.protection?.physical ?? rs.resist?.physical ?? 0;
            out.push({ label:"Физ. защита", val:`${phys}`, quality:`Хор: +${fineBonus} / Мас: +${mwBonus} / Лег: +${legBonus}` });
            if (rs.protection?.magical || rs.resist?.magical) {
              const mag = rs.protection?.magical ?? rs.resist?.magical ?? 0;
              out.push({ label:"Маг. защита", val:`${mag}` });
            }
            out.push({ label:"Слот", val:rs.slot ?? "—" });
          } else if (rt === "potion" || rt === "consumable") {
            const EFFECTS = {
              healHP:"🩹 Лечение HP", healAll:"💚 Лечение тела",
              restoreEnergy:"⚡ Восстановление энергии", restoreMana:"✦ Восстановление маны",
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
          } else if (rt === "food") {
            out.push({ label:"🍖 Сытость", val:`+${rs.satiety  ?? 0}` });
            out.push({ label:"💧 Жажда",   val:`+${rs.hydration ?? 0}` });
          }
          // Прочность по ступени
          const dur = {1:15,2:25,3:40,4:65,5:100}[recipe.result?.system?.tier ?? 1] ?? 15;
          if (["weapon","armor","tool"].includes(rt)) out.push({ label:"Прочность", val:dur });
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

    // Крафт
    html.find("[data-do-craft]").on("click", async e => {
      const recipeId = e.currentTarget.dataset.recipeId;
      await this._doCraft(recipeId);
    });
  }

  async _doCraft(recipeId) {
    const recipe = CRAFT_RECIPES[recipeId];
    if (!recipe) return;

    const actor      = this.actor;
    const skill      = actor.system?.skills?.[recipe.skillKey];
    const skillValue = Number(skill?.value ?? 0);
    const dieSize    = Math.max(2, skillValue * 2);

    if (!skillValue) { ui.notifications.warn("Нет нужного навыка."); return; }

    const tool = findTool(actor, recipe.tool?.craftType, recipe.tool?.tier ?? 1);
    if (!tool) { ui.notifications.warn(`Нужен инструмент: ${recipe.tool?.craftType}`); return; }

    for (const ing of recipe.ingredients) {
      const have = getAvailableQty(actor, ing.type, ing.category);
      if (have < ing.quantity) {
        ui.notifications.warn(`Не хватает: ${CATEGORY_LABELS[ing.category] ?? ing.category} (${have}/${ing.quantity})`);
        return;
      }
    }

    // Бросок с тремя стратегиями
    const actorSheet = Object.values(ui.windows).find(w =>
      w.actor?.id === actor.id && w._universalDiceRoll
    );

    let rollTotal, rollDisplay;
    if (actorSheet?._universalDiceRoll) {
      const result = await actorSheet._universalDiceRoll(
        recipe.skillKey, `Крафт: ${recipe.label}`,
        { threshold: recipe.difficulty }
      );
      if (!result) return;
      rollTotal   = result.total;
      rollDisplay = `d${dieSize} = ${rollTotal}`;
    } else {
      const roll  = await new Roll(`1d${dieSize}`).evaluate();
      rollTotal   = roll.total;
      rollDisplay = `d${dieSize} = ${rollTotal}`;
    }

    const success = rollTotal >= recipe.difficulty;
    const margin  = rollTotal - recipe.difficulty;

    // Качество по перевесу
    const quality = margin >= 8 ? "legendary"
      : margin >= 5 ? "masterwork"
      : margin >= 2 ? "fine"
      : "common";

    const qualityLabel = {
      common: "Обычное", fine: "Хорошее",
      masterwork: "Мастерское", legendary: "Легендарное"
    }[quality];

    let chatContent = `
      <div style="border:1px solid rgba(91,156,246,0.3);border-radius:8px;padding:10px;background:rgba(91,156,246,0.04);">
        <b>🔨 Крафт: ${recipe.label}</b><br>
        Навык: ${SKILL_LABELS[recipe.skillKey] ?? recipe.skillKey} д${dieSize} · Бросок: <b>${rollTotal}</b> · Порог: ${recipe.difficulty}
    `;

    if (!success) {
      chatContent += `<br><span style="color:#f87171">✗ Провал — материалы не потрачены.</span></div>`;
      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: chatContent });
      return;
    }

    // Тратим ингредиенты
    for (const ing of recipe.ingredients) {
      let remaining = ing.quantity;
      for (const item of Array.from(actor.items ?? [])) {
        if (!remaining) break;
        if (item.type !== ing.type || item.system?.category !== ing.category) continue;
        const qty = Number(item.system?.quantity ?? 1);
        if (qty <= remaining) {
          remaining -= qty;
          await item.delete();
        } else {
          await item.update({ "system.quantity": qty - remaining });
          remaining = 0;
        }
      }
    }

    // Износ инструмента
    if (tool.system?.durability) {
      const newDur = Math.max(0, Number(tool.system.durability.value ?? 10) - 1);
      await tool.update({ "system.durability.value": newDur });
    }

    // Создаём предмет
    const sys = foundry.utils.deepClone(recipe.result.system ?? {});
    sys.tier    = Number(tool.system?.tier ?? 1);
    sys.quality = quality;
    sys.quantity = 1;

    // Бонусы качества
    if (recipe.result.type === "weapon") {
      sys.damage = (sys.damage ?? 2) + (quality === "fine" ? 1 : quality === "masterwork" ? 2 : quality === "legendary" ? 3 : 0);
    }
    if (recipe.result.type === "armor") {
      const bonus = quality === "fine" ? 1 : quality === "masterwork" ? 2 : quality === "legendary" ? 3 : 0;
      sys.resist = (sys.resist ?? sys.protection?.physical ?? 0) + bonus;
    }

    // Прочность по ступени
    const durTable = {1:15,2:25,3:40,4:65,5:100,6:140,7:185,8:230,9:265,10:300};
    const maxDur = durTable[sys.tier] ?? 100;
    if (["weapon","armor","tool"].includes(recipe.result.type)) {
      sys.durability = { value: maxDur, max: maxDur };
    }

    await Item.create({
      name:   recipe.result.name,
      type:   recipe.result.type,
      img:    recipe.result.img ?? "icons/svg/item-bag.svg",
      system: sys,
    }, { parent: actor });

    chatContent += `<br><span style="color:#4ade80">✓ Успех! Перевес: +${margin}</span>`;
    chatContent += `<br>Качество: <b>${qualityLabel}</b>`;
    chatContent += `</div>`;

    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: chatContent });

    // Опыт навыка
    const actorSheetForExp = Object.values(ui.windows).find(w => w.actor?.id === actor.id && w._applySkillExp);
    if (actorSheetForExp) await actorSheetForExp._applySkillExp(recipe.skillKey, recipe.label);

    this.render(false);
  }
}

export { IronHillsCraftApp };
