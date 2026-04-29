/**
 * Iron Hills — EntityPickerDialog
 * Переиспользуемый диалог выбора сущности с поиском и фильтрами.
 *
 * Использование:
 *   const actor = await EntityPickerDialog.pick({
 *     title: "Выбрать поселение",
 *     types: ["settlement"],
 *     filter: a => a.system.info?.region === "Iron Hills"
 *   });
 */

class EntityPickerDialog extends Application {

  constructor(options = {}) {
    super();
    this._opts      = options;
    this._search    = "";
    this._resolve   = null;
    this._selected  = null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "entity-picker"],
      width:     420,
      height:    480,
      resizable: true,
      title:     "Выбрать"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/entity-picker.hbs";
  }

  /**
   * Главный метод — открывает диалог и возвращает Promise<Actor|null>
   */
  static pick(options = {}) {
    return new Promise(resolve => {
      const dlg = new EntityPickerDialog(options);
      dlg._resolve = resolve;
      dlg.options.title = options.title ?? "Выбрать";
      dlg.render(true);
    });
  }

  _getItems() {
    const { types = [], filter = null } = this._opts;
    let actors = Array.from(game.actors ?? []);

    if (types.length) {
      actors = actors.filter(a => types.includes(a.type));
    }

    if (filter) {
      actors = actors.filter(filter);
    }

    if (this._search.trim()) {
      const q = this._search.trim().toLowerCase();
      actors = actors.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.system.info?.region ?? "").toLowerCase().includes(q) ||
        (a.system.info?.specialty ?? "").toLowerCase().includes(q)
      );
    }

    return actors.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }

  async getData() {
    const items = this._getItems();
    const { types = [], groupBy = null } = this._opts;

    // Тип → метка
    const TYPE_LABELS = {
      settlement: "Поселение",
      faction:    "Фракция",
      character:  "Персонаж",
      npc:        "NPC",
      merchant:   "Торговец",
      monster:    "Монстр",
    };

    // Группировка
    let groups = null;
    if (groupBy) {
      const map = new Map();
      for (const item of items) {
        const key = groupBy(item) ?? "Прочее";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
      }
      groups = Array.from(map.entries()).map(([label, actors]) => ({
        label,
        actors: actors.map(a => this._mapItem(a))
      }));
    }

    return {
      search:    this._search,
      items:     items.map(a => this._mapItem(a)),
      groups,
      hasGroups: !!groups,
      isEmpty:   items.length === 0,
      typeLabels: types.map(t => TYPE_LABELS[t] ?? t).join(", "),
      placeholder: this._opts.placeholder ?? "Поиск...",
    };
  }

  _mapItem(actor) {
    const info = actor.system?.info ?? {};
    return {
      id:       actor.id,
      name:     actor.name,
      img:      actor.img ?? "icons/svg/mystery-man.svg",
      type:     actor.type,
      subtitle: info.region || info.specialty || info.faction || info.tier
        ? [info.region, info.specialty, info.tier ? `ст.${info.tier}` : ""]
            .filter(Boolean).join(" · ")
        : "",
      isSelected: actor.id === this._selected,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Поиск
    html.find("[data-ep-search]").on("input", e => {
      this._search = e.currentTarget.value;
      this.render(false);
    });

    // Клик по элементу — выбор
    html.find("[data-ep-item]").on("click", e => {
      const id = e.currentTarget.dataset.epItem;
      this._selected = id;
      html.find("[data-ep-item]").removeClass("is-selected");
      e.currentTarget.classList.add("is-selected");
      html.find("[data-ep-confirm]").prop("disabled", false);
    });

    // Двойной клик — мгновенный выбор
    html.find("[data-ep-item]").on("dblclick", e => {
      const id = e.currentTarget.dataset.epItem;
      this._confirm(id);
    });

    // Кнопка подтвердить
    html.find("[data-ep-confirm]").on("click", () => {
      if (this._selected) this._confirm(this._selected);
    });

    // Кнопка отмена
    html.find("[data-ep-cancel]").on("click", () => {
      this._cancel();
    });

    // Фокус на поиск
    setTimeout(() => html.find("[data-ep-search]").focus(), 50);
  }

  _confirm(id) {
    const actor = game.actors.get(id);
    if (this._resolve) {
      this._resolve(actor ?? null);
      this._resolve = null;
    }
    this.close();
  }

  _cancel() {
    if (this._resolve) {
      this._resolve(null);
      this._resolve = null;
    }
    this.close();
  }

  async close(options = {}) {
    if (this._resolve) {
      this._resolve(null);
      this._resolve = null;
    }
    return super.close(options);
  }
}

export { EntityPickerDialog };
