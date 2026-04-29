/**
 * Iron Hills — God Sheet
 * Лист актора типа "god" — пробудившийся ставший богом.
 */

class IronHillsGodSheet extends ActorSheet {

  constructor(...args) {
    super(...args);
    this._activeTab = "history";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "god-sheet"],
      width:     600,
      height:    640,
      resizable: true,
      // tabs управляются вручную
    });
  }




  _getFormData() {
    const form = this.element[0]?.querySelector(".window-content form")
               ?? this.element[0]?.querySelector("form");
    return form ? new FormDataExtended(form, { editors: this.editors ?? {} }) : null;
  }

  async _onChangeInput(event) {
    const fd = this._getFormData();
    if (!fd) return;
    await this.actor.update(fd.object);
  }

  async _onSubmit(event, options = {}) {
    if (event) event.preventDefault();
    const fd = this._getFormData();
    if (!fd) return {};
    await this.actor.update(fd.object);
    if (options.closeOnSubmit) this.close();
    return fd.object;
  }

  get template() {
    return "systems/iron-hills-system/templates/actor/god-sheet.hbs";
  }

  async getData() {
    const ctx = await super.getData();
    ctx.activeTab = this._activeTab ?? "history";
    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Сохранение
    const saveAll = async () => {
      const form = html[0]?.querySelector("form");
      if (!form) return;
      try {
        const fd = new FormDataExtended(form, { editors: this.editors ?? {} });
        await this.actor.update(fd.object);
      } catch(e) { console.error("IronHills God | save:", e); }
    };
    html.find("select, input[type='checkbox']").on("change", saveAll);
    html.find("input[type='text'], input[type='number'], textarea").on("blur", saveAll);

    // Вкладки
    html.find(".ih-god-tab[data-tab]").on("click", e => {
      e.preventDefault();
      this._activeTab = e.currentTarget.dataset.tab;
      this.render(false);
    });
  }
}

export { IronHillsGodSheet };
