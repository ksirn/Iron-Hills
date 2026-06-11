/**
 * Iron Hills — Alchemy App
 * Свободное смешивание реагентов из constants/alchemy.mjs (Живокост, селитра и т.д.),
 * результат по правилам MIXING_RULES — экспериментальная алхимия без фиксированных рецептов.
 *
 * Фиксированные рецепты каталога и вкладка «Алхимия» — в общем окне игры «Ремесло»
 * (game.ironHills.openCraftWorkbenchWindow / было openAlchemyWindow на вкладку алхимии).
 */
import { REAGENTS, REAGENT_EFFECTS, calculateMixResult } from "../constants/alchemy.mjs";
import { grantSkillExp } from "../services/actor-state-service.mjs";
import {
  formatExplodingDiceRoll,
  rollExplodingDice
} from "../services/skill-roll-service.mjs";
import { buildCombatChatCard } from "../services/combat-chat-service.mjs";
import { addItemToActorOrStack } from "../services/trade-service.mjs";
import { buildAlchemyResultItemData } from "../utils/alchemy-result-data.mjs";

const MAX_REAGENTS = 4;

class IronHillsAlchemyApp extends Application {

  constructor(actor, options = {}) {
    super(options);
    this.actor    = actor;
    this._selected = []; // ключи выбранных реагентов
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "alchemy-app"],
      width:     680,
      height:    560,
      resizable: true,
      title:     "⚗ Алхимия"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/alchemy-app.hbs";
  }

  async getData() {
    const actor      = this.actor;
    const alchSkill  = actor.system?.skills?.alchemy;
    const skillValue = Number(alchSkill?.value ?? 0);
    const dieSize    = Math.max(2, skillValue * 2);

    // Инвентарь реагентов (материалы с category herb/mineral/mushroom/essence)
    const REAGENT_CATS = ["herb", "mineral", "mushroom", "essence"];
    const inventoryReagents = Array.from(actor.items ?? [])
      .filter(i => i.type === "material" && REAGENT_CATS.includes(i.system?.category))
      .map(i => {
        const def = Object.values(REAGENTS).find(r =>
          r.label === i.name || r.key === i.system?.reagentKey
        );
        return {
          itemId:   i.id,
          key:      def?.key ?? i.id,
          name:     i.name,
          icon:     def?.icon ?? "🧪",
          tier:     i.system?.tier ?? 1,
          qty:      Number(i.system?.quantity ?? 1),
          effects:  (def?.effects ?? []).map(e => ({
            ...e,
            label: REAGENT_EFFECTS[e.type]?.label ?? e.type,
            color: REAGENT_EFFECTS[e.type]?.color ?? "#fff",
            icon:  REAGENT_EFFECTS[e.type]?.icon ?? "?",
          })),
          volatility: def?.volatility ?? 0,
          isSelected: this._selected.includes(def?.key ?? i.id),
          canAdd:     this._selected.length < MAX_REAGENTS && !this._selected.includes(def?.key ?? i.id),
        };
      });

    // Выбранные реагенты
    const selectedReagents = this._selected.map(key => {
      const invItem = inventoryReagents.find(r => r.key === key);
      const def = REAGENTS[key];
      return invItem ?? {
        key, name: def?.label ?? key,
        icon: def?.icon ?? "🧪", tier: 1, qty: 1,
        effects: (def?.effects ?? []).map(e => ({
          ...e,
          label: REAGENT_EFFECTS[e.type]?.label ?? e.type,
          color: REAGENT_EFFECTS[e.type]?.color ?? "#fff",
        })),
        volatility: def?.volatility ?? 0,
        isSelected: true, canAdd: false,
      };
    });

    // Расчёт результата
    const mixResult = this._selected.length >= 2
      ? calculateMixResult(this._selected, skillValue)
      : null;

    const totalVolatility = mixResult?.totalVolatility ?? 0;
    const explosionRisk   = Math.min(90, totalVolatility * 10);
    const successThreshold = mixResult?.rule
      ? Math.max(2, (mixResult.rule.minPotency ?? 4))
      : 0;

    // Подготовка финального результата для показа
    let resultPreview = null;
    if (mixResult && !mixResult.failed) {
      const r = mixResult.rule.result;
      resultPreview = {
        name:        r.name,
        type:        r.type,
        effectType:  r.effectType,
        power:       mixResult.power,
        hydration:   mixResult.hydration,
        satiety:     mixResult.satiety,
        potency:     mixResult.totalPotency,
        volatility:  totalVolatility,
        explosionRisk,
        successThreshold,
        successChance: dieSize > 0
          ? Math.round(Math.max(0, Math.min(100, (dieSize - successThreshold + 1) / dieSize * 100)))
          : 0,
      };
    }

    return {
      actor,
      skillValue,
      dieSize,
      inventoryReagents,
      selectedReagents,
      selectedCount: this._selected.length,
      maxReagents:   MAX_REAGENTS,
      canBrew:       this._selected.length >= 2 && skillValue > 0 && mixResult && !mixResult.failed,
      mixResult,
      resultPreview,
      hasFailed:     mixResult?.failed ?? false,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Добавить реагент
    html.find("[data-add-reagent]").on("click", e => {
      const key = e.currentTarget.dataset.reagentKey;
      if (this._selected.length < MAX_REAGENTS && !this._selected.includes(key)) {
        this._selected.push(key);
        this.render(false);
      }
    });

    // Убрать реагент
    html.find("[data-remove-reagent]").on("click", e => {
      const key = e.currentTarget.dataset.reagentKey;
      this._selected = this._selected.filter(k => k !== key);
      this.render(false);
    });

    // Очистить
    html.find("[data-clear-reagents]").on("click", () => {
      this._selected = [];
      this.render(false);
    });

    // Сварить
    html.find("[data-do-brew]").on("click", () => this._brew());
  }

  async _brew() {
    const actor      = this.actor;
    const { requireNoPendingInventory } = await import("./pending-items-app.mjs").catch(() => ({}));
    const pendingCheck = requireNoPendingInventory
      ? await requireNoPendingInventory(actor, { actionLabel: "алхимия" })
      : { ok: true };
    if (!pendingCheck.ok) return;

    const alchSkill  = actor.system?.skills?.alchemy;
    const skillValue = Number(alchSkill?.value ?? 0);
    const dieSize    = Math.max(2, skillValue * 2);

    if (!skillValue) { ui.notifications.warn("Нет навыка алхимии."); return; }
    if (this._selected.length < 2) { ui.notifications.warn("Нужно минимум 2 реагента."); return; }

    const mixResult = calculateMixResult(this._selected, skillValue);
    if (!mixResult || mixResult.failed) {
      ui.notifications.warn("Неизвестная комбинация — ничего не получится.");
      return;
    }

    // Проверка инструмента
    const tool = Array.from(actor.items ?? []).find(i =>
      i.type === "tool" && i.system?.craftType === "alchemy"
    );
    if (!tool) { ui.notifications.warn("Нужно алхимическое оборудование."); return; }

    // Взрыв?
    const explosionRisk = Math.min(90, mixResult.totalVolatility * 10);
    if (explosionRisk > 0 && Math.random() * 100 < explosionRisk) {
      // ВЗРЫВ
      const explosionDmg = Math.ceil(mixResult.totalVolatility * 1.5);
      const torsoHp = Number(actor.system?.resources?.hp?.torso?.value ?? 0);
      await actor.update({
        "system.resources.hp.torso.value": Math.max(0, torsoHp - explosionDmg)
      });

      await ChatMessage.create({
        content: buildCombatChatCard({
          title: "Зельеварение",
          subtitle: actor.name,
          icon: "!",
          status: "Взрыв",
          statusClass: "is-danger",
          rows: [
            ["Летучесть", mixResult.totalVolatility],
            ["Урон торсу", explosionDmg],
          ],
          notices: [
            ["Результат", "реакция сорвалась, выбранный набор сброшен", true],
          ],
          className: "ih-system-chat-card ih-alchemy-chat-card ih-alchemy-explosion-card",
        }),
        speaker: ChatMessage.getSpeaker({ actor })
      });

      this._selected = [];
      this.render(false);
      return;
    }

    // Бросок
    const rollResult = await rollExplodingDice(skillValue);
    const rollTotal = rollResult.total;
    const threshold = mixResult.rule.minPotency ?? 4;
    const success   = rollTotal >= threshold;
    const margin    = rollTotal - threshold;

    // Потребляем реагенты
    for (const key of this._selected) {
      const item = Array.from(actor.items ?? []).find(i => {
        const def = Object.values(REAGENTS).find(r => r.label === i.name || r.key === i.system?.reagentKey);
        return def?.key === key;
      });
      if (!item) continue;
      const qty = Number(item.system?.quantity ?? 1);
      if (qty <= 1) await item.delete();
      else await item.update({ "system.quantity": qty - 1 });
    }

    // Износ оборудования
    if (tool.system?.durability) {
      await tool.update({
        "system.durability.value": Math.max(0, Number(tool.system.durability.value ?? 10) - 1)
      });
    }

    const alchemyRows = [
      ["Алхимик", actor.name],
      ["Куб", `d${dieSize}`],
      ["Бросок", formatExplodingDiceRoll(rollResult, dieSize)],
      ["Порог", threshold],
      ["Перевес", margin >= 0 ? `+${margin}` : margin],
      ["Летучесть", mixResult.totalVolatility],
    ];

    if (!success) {
      await ChatMessage.create({
        content: buildCombatChatCard({
          title: "Зельеварение",
          subtitle: actor.name,
          icon: "!",
          status: "Провал",
          statusClass: "is-danger",
          rows: alchemyRows,
          notices: [
            ["Реагенты", "потрачены впустую", true],
          ],
          className: "ih-system-chat-card ih-alchemy-chat-card ih-alchemy-failed-card",
        }),
        speaker: ChatMessage.getSpeaker({ actor }),
      });
      this._selected = [];
      this.render(false);
      return;
    }

    // Качество по перевесу
    const quality = margin >= 8 ? "legendary" : margin >= 5 ? "masterwork"
      : margin >= 2 ? "fine" : "common";
    const qLabel  = { common:"Обычное", fine:"Хорошее", masterwork:"Мастерское", legendary:"Легендарное" }[quality];
    const qBonus  = { common:0, fine:1, masterwork:2, legendary:3 }[quality];

    const r   = mixResult.rule.result;
    const tier = Number(tool.system?.tier ?? 1);
    const resultPower = Math.max(1, Math.floor(mixResult.power + qBonus));
    const resultItemData = buildAlchemyResultItemData({
      ...mixResult,
      power: resultPower,
      hydration: mixResult.hydration ? Math.floor(mixResult.hydration + qBonus) : 0,
      satiety: mixResult.satiety ? Math.floor(mixResult.satiety + qBonus) : 0,
    }, { tier, quality });
    if (!resultItemData) {
      ui.notifications.warn("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР±СЂР°С‚СЊ СЂРµР·СѓР»СЊС‚Р°С‚ Р°Р»С…РёРјРёРё.");
      return;
    }

    await addItemToActorOrStack(actor, resultItemData);

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Зельеварение",
        subtitle: actor.name,
        icon: "+",
        status: qLabel,
        statusClass: "is-good",
        rows: [
          ...alchemyRows,
          ["Получено", resultItemData.name ?? r.name],
          ["Качество", qLabel],
          ["Сила", resultItemData.system?.power ?? resultPower],
        ],
        className: "ih-system-chat-card ih-alchemy-chat-card ih-alchemy-success-card",
      }),
      speaker: ChatMessage.getSpeaker({ actor }),
    });

    // Опыт
    await grantSkillExp(actor, "alchemy", r.name);

    const { PendingItemsApp } = await import("./pending-items-app.mjs").catch(() => ({}));
    await PendingItemsApp?.openIfNeeded?.(actor);
    this._selected = [];
    this.render(false);
  }
}

export { IronHillsAlchemyApp };
