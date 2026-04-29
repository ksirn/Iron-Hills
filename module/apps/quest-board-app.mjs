/**
 * Iron Hills — Quest Board App v2
 * GM: все квесты, фильтры, ручное создание.
 * Игроки: квесты группы + квесты локации где находится группа.
 */
import { getPartyGroups, getMembersOfGroup } from "../services/party-manager.mjs";
import { EntityPickerDialog } from "./entity-picker.mjs";

/**
 * Применить влияние завершённого квеста на мир.
 * Читает тип квеста и поселение → вызывает applyWorldImpact.
 */

/**
 * Применить влияние завершённого квеста на мир.
 */
async function _applyQuestWorldImpact(quest) {
  try {
    const { applyWorldImpact } = await import("../world-sim-tools.mjs");
    const info       = quest.system?.info ?? {};
    const type       = info.questType ?? info.type ?? "gathering";
    const settlement = info.settlement ?? "";
    const difficulty = Number(info.difficulty ?? 1);
    if (!settlement) return;
    const IMPACTS = {
      gathering:     { supply:  1 },
      delivery:      { supply:  1, prosperity: 1 },
      escort:        { supply:  2 },
      combat:        { danger: -Math.ceil(difficulty / 2), prosperity: 1 },
      exploration:   { prosperity: 1 },
      investigation: { danger: -1, prosperity: 1 },
    };
    const impact = IMPACTS[type] ?? { prosperity: 1 };
    await applyWorldImpact(settlement, impact, `Квест выполнен: ${quest.name}`);
  } catch (e) {
    console.warn("Iron Hills | Quest world impact failed:", e);
  }
}

const STATUS_CFG = {
  active:    { label:"Активен",   color:"#5b9cf6", icon:"📋" },
  completed: { label:"Выполнен",  color:"#4ade80", icon:"✅" },
  failed:    { label:"Провален",  color:"#f87171", icon:"✗"  },
  hidden:    { label:"Скрыт",     color:"#6a7d99", icon:"👁"  },
};

const TYPE_LABELS = {
  combat:        "⚔ Боевое",
  exploration:   "🗺 Исследование",
  social:        "💬 Социальное",
  delivery:      "📦 Доставка",
  investigation: "🔍 Расследование",
  escort:        "🛡 Сопровождение",
  work:          "⚒ Работа",
};

// ─── Получить квесты для игрока ──────────────────────────

function getPlayerQuests(userId) {
  const user      = game.users.get(userId);
  const charId    = user?.character?.id;
  const groups    = getPartyGroups();

  // Группа персонажа
  const myGroup   = charId
    ? groups.find(g => (g.memberIds ?? []).includes(charId))
    : groups.find(g => g.isActive);

  const groupId   = myGroup?.id ?? null;
  const location  = myGroup?.location ?? "";

  return (game.actors ?? [])
    .filter(a => a.type === "quest")
    .filter(a => {
      const info   = a.system?.info ?? {};
      const status = info.status ?? "active";
      if (status === "hidden" || status === "failed") return false;

      // Квест назначен этой группе
      const assignedGroups = info.assignedGroupIds ?? [];
      if (groupId && assignedGroups.includes(groupId)) return true;

      // Квест в локации где находится группа
      if (location && info.location === location) return true;

      // Квест не назначен никому — виден всем (незанятый)
      if (!assignedGroups.length && status === "active") return true;

      return false;
    });
}

// ─── App ─────────────────────────────────────────────────

class IronHillsQuestBoardApp extends Application {

  constructor(options = {}) {
    super(options);
    this._filterStatus   = "all";
    this._filterLocation = "";
    this._filterType     = "";
    this._search         = "";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "quest-board"],
      width:     680,
      height:    580,
      resizable: true,
      title:     "📋 Доска заданий"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/quest-board.hbs";
  }

  async getData() {
    const isGM  = game.user?.isGM ?? false;
    const allQ  = (game.actors ?? []).filter(a => a.type === "quest");

    let quests;

    if (isGM) {
      // GM — все квесты с фильтрами
      quests = allQ.filter(a => {
        const info   = a.system?.info ?? {};
        const status = info.status ?? "active";

        if (this._filterStatus && this._filterStatus !== "all" && status !== this._filterStatus)
          return false;
        if (this._filterLocation && info.location !== this._filterLocation)
          return false;
        if (this._filterType && info.type !== this._filterType)
          return false;
        if (this._search) {
          const q = this._search.toLowerCase();
          if (!a.name.toLowerCase().includes(q) &&
              !(info.description ?? "").toLowerCase().includes(q) &&
              !(info.location ?? "").toLowerCase().includes(q))
            return false;
        }
        return true;
      });
    } else {
      quests = getPlayerQuests(game.user.id);
    }

    // Сортировка: активные → по сложности
    quests = [...quests].sort((a, b) => {
      const sa = a.system?.info?.status ?? "active";
      const sb = b.system?.info?.status ?? "active";
      if (sa === "active" && sb !== "active") return -1;
      if (sb === "active" && sa !== "active") return 1;
      return (b.system?.info?.difficulty ?? 0) - (a.system?.info?.difficulty ?? 0);
    });

    // Уникальные локации для фильтра
    const locations = [...new Set(allQ.map(a => a.system?.info?.location).filter(Boolean))].sort();
    const types     = Object.entries(TYPE_LABELS).map(([k, v]) => ({ key: k, label: v }));

    // Группы для назначения
    const groups = getPartyGroups();

    const mapped = quests.map(a => {
      const info = a.system?.info ?? {};
      const status = info.status ?? "active";
      const cfg  = STATUS_CFG[status] ?? STATUS_CFG.active;

      // Назначенные группы
      const assignedGroups = (info.assignedGroupIds ?? [])
        .map(gid => groups.find(g => g.id === gid))
        .filter(Boolean)
        .map(g => ({ id: g.id, label: g.label, color: g.color }));

      return {
        id:             a.id,
        name:           a.name,
        description:    info.description ?? "",
        reward:         info.reward ?? "",
        difficulty:     info.difficulty ?? 3,
        stars:          "★".repeat(Math.min(10, info.difficulty ?? 3)),
        type:           info.type ?? "",
        typeLabel:      TYPE_LABELS[info.type] ?? info.type ?? "",
        status,
        statusLabel:    cfg.label,
        statusColor:    cfg.color,
        statusIcon:     cfg.icon,
        location:       info.location ?? "",
        assignedGroups,
        hasGroups:      assignedGroups.length > 0,
        isGM,
      };
    });

    return {
      isGM,
      quests:  mapped,
      hasQuests: mapped.length > 0,
      // GM фильтры
      filterStatus:   this._filterStatus,
      filterLocation: this._filterLocation,
      filterType:     this._filterType,
      search:         this._search,
      locations,
      types,
      statuses: Object.entries(STATUS_CFG).map(([k, v]) => ({ key: k, label: v.label })),
      totalAll:    allQ.length,
      totalActive: allQ.filter(a => (a.system?.info?.status ?? "active") === "active").length,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Поиск
    html.find("[data-qb-search]").on("input", e => {
      this._search = e.currentTarget.value;
      this.render(false);
    });

    // Фильтры GM
    html.find("[data-filter-status]").on("change", e => {
      this._filterStatus = e.currentTarget.value;
      this.render(false);
    });

    html.find("[data-filter-location]").on("change", e => {
      this._filterLocation = e.currentTarget.value;
      this.render(false);
    });

    html.find("[data-filter-type]").on("change", e => {
      this._filterType = e.currentTarget.value;
      this.render(false);
    });

    // Изменить статус
    html.find("[data-quest-status]").on("change", async e => {
      if (!game.user?.isGM) return;
      const questId  = e.currentTarget.dataset.questId;
      const newStatus = e.currentTarget.value;
      const quest    = game.actors.get(questId);
      if (!quest) return;

      const oldStatus = quest.system?.info?.status ?? "active";
      await quest.update({ "system.info.status": newStatus });

      // При завершении квеста — применяем влияние на мир
      if (newStatus === "completed" && oldStatus !== "completed") {
        await _applyQuestWorldImpact(quest);
      }

      this.render(false);
    });

    // Назначить группу
    html.find("[data-assign-group]").on("click", async e => {
      if (!game.user?.isGM) return;
      const questId = e.currentTarget.dataset.questId;
      const quest   = game.actors.get(questId);
      if (!quest) return;

      const groups  = getPartyGroups();
      if (!groups.length) { ui.notifications.warn("Нет групп."); return; }

      const buttons = {};
      for (const g of groups) {
        buttons[g.id] = { label: `${g.label}`, callback: () => g.id };
      }

      const chosen = await Dialog.wait({
        title:   "Назначить группу",
        content: `<p style="color:#a8b8d0">Выбери группу для квеста <b>${quest.name}</b></p>`,
        buttons,
        default: groups[0]?.id
      });
      if (!chosen) return;

      const ids = [...new Set([...(quest.system?.info?.assignedGroupIds ?? []), chosen])];
      await quest.update({ "system.info.assignedGroupIds": ids });
      this.render(false);
    });

    // Снять группу
    html.find("[data-unassign-group]").on("click", async e => {
      if (!game.user?.isGM) return;
      const { questId, groupId } = e.currentTarget.dataset;
      const quest = game.actors.get(questId);
      if (!quest) return;
      const ids = (quest.system?.info?.assignedGroupIds ?? []).filter(id => id !== groupId);
      await quest.update({ "system.info.assignedGroupIds": ids });
      this.render(false);
    });

    // Установить локацию квеста
    html.find("[data-set-location]").on("click", async e => {
      if (!game.user?.isGM) return;
      const questId = e.currentTarget.dataset.questId;
      const quest   = game.actors.get(questId);
      if (!quest) return;

      const picked = await EntityPickerDialog.pick({
        title:       "Локация квеста",
        types:       ["settlement"],
        placeholder: "Поиск поселения...",
      });
      if (!picked) return;

      await quest.update({
        "system.info.location":     picked.name,
        "system.info.settlementId": picked.id,
      });
      this.render(false);
    });

    // Открыть лист
    html.find("[data-open-quest]").on("click", e => {
      game.actors.get(e.currentTarget.dataset.questId)?.sheet?.render(true);
    });

    // Создать вручную
    html.find("[data-create-quest]").on("click", async () => {
      if (!game.user?.isGM) return;

      // Запрашиваем базовые данные
      const result = await Dialog.wait({
        title:   "Новое задание",
        content: `<div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;display:flex;flex-direction:column;gap:8px;padding:4px;">
          <label>Название<br>
            <input id="qb-name" type="text" placeholder="Название задания"
              style="width:100%;background:#1b2333;border:1px solid rgba(120,150,200,0.3);color:#e8edf5;padding:6px;border-radius:6px;margin-top:3px;">
          </label>
          <label>Тип
            <select id="qb-type" style="width:100%;background:#1b2333;border:1px solid rgba(120,150,200,0.3);color:#e8edf5;padding:6px;border-radius:6px;margin-top:3px;">
              <option value="combat">⚔ Боевое</option>
              <option value="exploration">🗺 Исследование</option>
              <option value="social">💬 Социальное</option>
              <option value="delivery">📦 Доставка</option>
              <option value="investigation">🔍 Расследование</option>
              <option value="escort">🛡 Сопровождение</option>
              <option value="work">⚒ Работа</option>
            </select>
          </label>
          <label>Сложность (1-10)
            <input id="qb-diff" type="number" min="1" max="10" value="3"
              style="width:80px;background:#1b2333;border:1px solid rgba(120,150,200,0.3);color:#e8edf5;padding:6px;border-radius:6px;margin-top:3px;">
          </label>
        </div>`,
        buttons: {
          create: {
            label: "Создать",
            callback: () => ({
              name:       document.getElementById("qb-name")?.value || "Новое задание",
              type:       document.getElementById("qb-type")?.value || "combat",
              difficulty: parseInt(document.getElementById("qb-diff")?.value || "3"),
            })
          },
          cancel: { label: "Отмена", callback: () => null }
        },
        default: "create"
      }).catch(() => null);

      if (!result) return;

      const actor = await Actor.create({
        name: result.name,
        type: "quest",
        system: {
          info: {
            description:      "",
            reward:           "",
            difficulty:       result.difficulty,
            type:             result.type,
            status:           "hidden",
            location:         "",
            settlementId:     "",
            assignedGroupIds: [],
          }
        }
      });

      // Сразу открываем лист для заполнения
      actor?.sheet?.render(true);
      this.render(false);
    });
  }
}

export { IronHillsQuestBoardApp };
