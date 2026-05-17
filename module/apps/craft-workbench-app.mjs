/**
 * Окно «Ремесло» — верстак со вкладками по навыку: свободный набор ингредиентов,
 * попытка и сопоставление с CRAFT_RECIPES навыка.
 */
import {
  CRAFT_WORKBENCH_SKILL_LABELS,
  CRAFT_WORKBENCH_SKILLS,
} from "../constants/craft-workbench.mjs";
import {
  mergeWorkbenchPieces,
  validateWorkbenchPieces,
  buildSelectionMultiset,
  findRecipesMatchingMultiset,
  findTool,
  consumeWorkbenchNoRecipeSalvage,
  finalizeWorkbenchSuccess,
  finalizeWorkbenchFailedRoll,
} from "../services/craft-workbench-service.mjs";
import { grantSkillExp } from "../services/actor-state-service.mjs";
import { performUniversalSkillRoll } from "../services/skill-roll-service.mjs";
import { getQualityLabel } from "../services/world-content-service.mjs";
import { getItemQuantity } from "../utils/item-utils.mjs";

function calcExplodingChance(threshold, skillValue) {
  if (skillValue <= 0) return 0;
  const startDie = Math.max(2, skillValue * 2);
  function p(need, d) {
    if (need <= 0) return 1;
    if (d >= 20) return need > 20 ? 0 : Math.max(0, 20 - need + 1) / 20;
    const normalSuccess = Math.max(0, d - Math.max(need, 1)) / d;
    if (need > d) {
      const explodeChance = (1 / d) * p(need, Math.min(d + 2, 20));
      return normalSuccess + explodeChance;
    }
    const maxTake = 1 / d;
    return normalSuccess + maxTake;
  }
  return Math.round(p(threshold, startDie) * 100);
}

class IronHillsCraftWorkbenchApp extends Application {

  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    const ini = options.initialSkillKey;
    this._skillKey = CRAFT_WORKBENCH_SKILLS.includes(ini) ? ini : "blacksmithing";
    /** @type {{ itemId: string, qty: number }[]} */
    this._bowl = [];
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "craft-workbench-app"],
      width:     720,
      height:    580,
      resizable: true,
      title:     "⚒ Ремесло",
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/craft-workbench.hbs";
  }

  _mergeBowlFromState() {
    return mergeWorkbenchPieces(this._bowl);
  }

  _setQty(itemId, qty) {
    const item = this.actor.items.get(itemId);
    const idx = this._bowl.findIndex(b => b.itemId === itemId);
    if (idx < 0) return;
    if (!item) {
      this._bowl.splice(idx, 1);
      return;
    }
    const max = getItemQuantity(item);
    this._bowl[idx].qty = Math.max(1, Math.min(max, Number(qty) || 1));
  }

  _removeLine(itemId) {
    this._bowl = this._bowl.filter(b => b.itemId !== itemId);
  }

  _add(itemId, all = false) {
    const item = this.actor.items.get(itemId);
    if (!item || (item.type !== "material" && item.type !== "food")) return;
    const max = getItemQuantity(item);
    const add = all ? max : 1;
    const idx = this._bowl.findIndex(b => b.itemId === itemId);
    if (idx >= 0) {
      this._bowl[idx].qty = Math.min(max, this._bowl[idx].qty + add);
    } else {
      this._bowl.push({ itemId, qty: Math.min(max, add) });
    }
  }

  async getData() {
    const actor = this.actor;
    const skillKey = this._skillKey;
    const merged = this._mergeBowlFromState();
    const validation = validateWorkbenchPieces(actor, merged);

    let multiset = null;
    let matches = [];
    if (validation.ok && merged.length) {
      multiset = buildSelectionMultiset(actor, merged);
      if (multiset) matches = findRecipesMatchingMultiset(skillKey, multiset);
    }

    const skills = actor.system?.skills ?? {};
    const skill_blk = skills[skillKey];
    const skillValue = Number(skill_blk?.value ?? 0);
    const dieSize = Math.max(2, skillValue * 2);

    const resolvedRecipe = matches.length === 1 ? matches[0] : null;
    let hasToolResolved = true;
    let recipeChance = null;
    if (resolvedRecipe) {
      const tool = findTool(actor, resolvedRecipe.tool?.craftType, resolvedRecipe.tool?.tier ?? 1);
      hasToolResolved = !!tool;
      recipeChance = calcExplodingChance(resolvedRecipe.difficulty, skillValue);
    }

    const ambiguous = matches.length > 1;
    const skillOk = skillValue > 0;

    let hintLine = "";
    let hintClass = "";
    if (ambiguous) {
      hintLine = "Этим набором подходят несколько заготовленных описаний — уточни состав или спроси ведущего.";
      hintClass = "is-warn";
    } else if (resolvedRecipe && hasToolResolved) {
      hintLine = `Подходит запись: «${resolvedRecipe.label}».`;
      hintClass = "is-ok";
    } else if (resolvedRecipe && !hasToolResolved) {
      hintLine = `Рецепт «${resolvedRecipe.label}», но нужен инструмент (${resolvedRecipe.tool?.craftType}).`;
      hintClass = "is-warn";
    } else if (merged.length && multiset && matches.length === 0) {
      hintLine = "Такого сочетания под этим ремеслом нет — при попытке часть потеряется, у дешёвого слота останется хотя бы 1.";
      hintClass = "muted";
    }

    let blockedReason = "—";
    if (!merged.length) blockedReason = "Добавь ингредиенты.";
    else if (!validation.ok) blockedReason = "Неверное количество или предмет удалён.";
    else if (!skillOk) blockedReason = "У персонажа нет этого навыка (0).";
    else if (ambiguous) blockedReason = "Неоднозначное совпадение — добавь или убери материал.";
    else if (resolvedRecipe && !hasToolResolved) blockedReason = "Не хватает подходящего инструмента.";
    else blockedReason = "";

    const canAttempt = skillOk
      && validation.ok
      && merged.length > 0
      && !ambiguous
      && (!(resolvedRecipe) || hasToolResolved);

    const invRows = Array.from(actor.items ?? [])
      .filter(i => i.type === "material" || i.type === "food")
      .map(i => ({
        id: i.id,
        name: i.name,
        img: i.img ?? "icons/svg/item-bag.svg",
        tier: Number(i.system?.tier ?? 1),
        qtyAvail: getItemQuantity(i),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));

    const bowl = this._bowl.map(({ itemId, qty }) => {
      const item = actor.items.get(itemId);
      const maxQty = item ? getItemQuantity(item) : qty;
      return {
        itemId,
        qty: Math.min(qty, maxQty),
        maxQty,
        name: item?.name ?? "?",
        img: item?.img ?? "icons/svg/item-bag.svg",
      };
    }).filter(row => actor.items.get(row.itemId));

    const tabs = CRAFT_WORKBENCH_SKILLS.map(key => ({
      key,
      label: CRAFT_WORKBENCH_SKILL_LABELS[key] ?? key,
      active: key === skillKey,
    }));

    return {
      actor,
      tabs,
      skillKey,
      skillLabel: CRAFT_WORKBENCH_SKILL_LABELS[skillKey] ?? skillKey,
      skillValue,
      dieSize,
      invRows,
      bowl,
      hintLine,
      hintClass,
      resolvedRecipe,
      recipeChance,
      hasToolResolved: !(resolvedRecipe) || hasToolResolved,
      canAttempt,
      blockedReason,
      skillOk,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-wh-tab]").on("click", e => {
      e.preventDefault();
      const tab = e.currentTarget.dataset.whTab;
      if (CRAFT_WORKBENCH_SKILLS.includes(tab)) {
        this._skillKey = tab;
        this._bowl = [];
        this.render(false);
      }
    });

    html.find("[data-wh-clear]").on("click", e => {
      e.preventDefault();
      this._bowl = [];
      this.render(false);
    });

    html.find("[data-wh-add]").on("click", e => {
      e.preventDefault();
      this._add(e.currentTarget.dataset.itemId, false);
      this.render(false);
    });

    html.find("[data-wh-add-all]").on("click", e => {
      e.preventDefault();
      this._add(e.currentTarget.dataset.itemId, true);
      this.render(false);
    });

    html.find("[data-wh-remove-line]").on("click", e => {
      e.preventDefault();
      this._removeLine(e.currentTarget.dataset.itemId);
      this.render(false);
    });

    html.find("[data-wh-qty]").on("change", e => {
      const itemId = e.currentTarget.dataset.itemId;
      this._setQty(itemId, e.currentTarget.value);
      this.render(false);
    });

    html.find("[data-wh-attempt]").on("click", async e => {
      e.preventDefault();
      await this._attempt();
    });
  }

  async _attempt() {
    const actor = this.actor;
    const { requireNoPendingInventory } = await import("./pending-items-app.mjs").catch(() => ({}));
    const pendingCheck = requireNoPendingInventory
      ? await requireNoPendingInventory(actor, { actionLabel: "ремесло" })
      : { ok: true };
    if (!pendingCheck.ok) return;

    const skillKey = this._skillKey;
    const merged = mergeWorkbenchPieces(this._bowl);
    const v = validateWorkbenchPieces(actor, merged);
    if (!v.ok) {
      ui.notifications.warn("Проверь количества — возможно предмет уже не в сумке.");
      return;
    }
    if (!merged.length) return;

    const skillValue = Number(actor.system?.skills?.[skillKey]?.value ?? 0);
    if (!skillValue) {
      ui.notifications.warn("Нужен хотя бы уровень 1 этого навыка.");
      return;
    }

    const multiset = buildSelectionMultiset(actor, merged);
    if (!multiset) {
      ui.notifications.warn("Не удалось разобрать ингредиенты.");
      return;
    }

    const matches = findRecipesMatchingMultiset(skillKey, multiset);
    if (matches.length > 1) {
      ui.notifications.warn("Неоднозначный набор; убери или замени один из материалов.");
      return;
    }

    if (matches.length === 0) {
      await consumeWorkbenchNoRecipeSalvage(actor, merged);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `
          <div style="border:1px solid rgba(248,113,113,0.25);border-radius:8px;padding:10px;background:rgba(248,113,113,0.05);">
            <b>⚒ Эксперимент (${CRAFT_WORKBENCH_SKILL_LABELS[skillKey] ?? skillKey})</b><br>
            Комбинация не подходит ни под одну известную выкройку под этим ремеслом — материалы в основном сгублены; у самой мелкой стопки осталась единица.</div>`,
      });
      this._bowl = [];
      this.render(false);
      return;
    }

    const recipe = matches[0];
    const tool = findTool(actor, recipe.tool?.craftType, recipe.tool?.tier ?? 1);
    if (!tool) {
      ui.notifications.warn(`Нужен инструмент: ${recipe.tool?.craftType} (тир ${recipe.tool?.tier ?? 1}+).`);
      return;
    }

    const dieSize = Math.max(2, skillValue * 2);
    const rollResult = await performUniversalSkillRoll(
      actor,
      skillKey,
      `Ремесло: ${recipe.label}`,
      { threshold: recipe.difficulty }
    );
    if (!rollResult) return;
    const rollTotal = rollResult.total;

    const success = rollTotal >= recipe.difficulty;

    let chatContent = `
      <div style="border:1px solid rgba(91,156,246,0.3);border-radius:8px;padding:10px;background:rgba(91,156,246,0.04);">
        <b>⚒ Ремесло: ${recipe.label}</b><br>
        Навык: ${CRAFT_WORKBENCH_SKILL_LABELS[skillKey] ?? skillKey} · д${dieSize} · бросок <b>${rollTotal}</b> · порог ${recipe.difficulty}
    `;

    if (!success) {
      await finalizeWorkbenchFailedRoll(actor, merged);
      chatContent += `<br><span style="color:#f87171">✗ Не удалось собрать качественно — материалы потеряны, остаются лишь мелкие обрезки (сырое волокно ×1).</span></div>`;
      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: chatContent });
      await grantSkillExp(actor, skillKey, recipe.label);
      const { PendingItemsApp } = await import("./pending-items-app.mjs").catch(() => ({}));
      await PendingItemsApp?.openIfNeeded?.(actor);
      this._bowl = [];
      this.render(false);
      return;
    }

    const { margin, quality } = await finalizeWorkbenchSuccess(actor, recipe, merged, rollTotal, tool);
    const ql = getQualityLabel(quality);
    chatContent += `<br><span style="color:#4ade80">✓ Готово! Перевес: +${margin}</span>`;
    chatContent += `<br>Качество: <b>${ql}</b> — если рецепт был новым, он добавлен в «Изученные рецепты».`;
    chatContent += `</div>`;
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: chatContent });

    await grantSkillExp(actor, skillKey, recipe.label);

    const { PendingItemsApp } = await import("./pending-items-app.mjs").catch(() => ({}));
    await PendingItemsApp?.openIfNeeded?.(actor);
    this._bowl = [];
    this.render(false);
  }
}

export { IronHillsCraftWorkbenchApp };
