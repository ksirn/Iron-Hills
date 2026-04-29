/**
 * Iron Hills — Container Sheet v2
 * Контейнер: сундук, труп, мешок, тайник, куча на земле.
 * Поддерживает: замок, взятие предметов, drag&drop, взять всё.
 */

class IronHillsContainerSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "container-sheet"],
      width:     440,
      height:    520,
      resizable: true,
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/actor/container-sheet.hbs";
  }

  // ── Форма ─────────────────────────────────────────────────
  _getFormData() {
    const form = this.element[0]?.querySelector(".window-content form")
               ?? this.element[0]?.querySelector("form");
    return form ? new FormDataExtended(form, { editors: this.editors ?? {} }) : null;
  }

  async _onChangeInput() {
    const fd = this._getFormData();
    if (fd) await this.actor.update(fd.object);
  }

  async _onSubmit(event, options = {}) {
    if (event) event.preventDefault();
    const fd = this._getFormData();
    if (!fd) return {};
    await this.actor.update(fd.object);
    if (options.closeOnSubmit) this.close();
    return fd.object;
  }

  // ── Данные ────────────────────────────────────────────────
  async getData() {
    const ctx  = await super.getData();
    const a    = this.actor;
    const s    = a.system;

    ctx.isGM     = game.user?.isGM ?? false;
    ctx.isLocked = (s.info?.lockDifficulty ?? 0) > 0 && (s.info?.isLocked ?? true);

    ctx.items = a.items.map(i => ({
      id:     i.id,
      name:   i.name,
      img:    i.img,
      type:   i.type,
      system: i.system,
    }));

    ctx.totalWeight = ctx.items
      .reduce((sum, i) => sum + (Number(i.system?.weight ?? 0) * Number(i.system?.quantity ?? 1)), 0)
      .toFixed(1);

    return ctx;
  }

  // ── Слушатели ─────────────────────────────────────────────
  activateListeners(html) {
    super.activateListeners(html);

    // Автосохранение полей
    html.find("select, input").on("change", async () => {
      const fd = this._getFormData();
      if (fd) await this.actor.update(fd.object);
    });
    html.find("input[type='text'], input[type='number']").on("blur", async () => {
      const fd = this._getFormData();
      if (fd) await this.actor.update(fd.object);
    });

    // GM открыть замок
    html.find("[data-unlock-container]").on("click", async () => {
      await this.actor.update({ "system.info.isLocked": false });
      this.render(false);
    });

    // Удалить предмет (GM)
    html.find("[data-delete-item]").on("click", async e => {
      if (!game.user?.isGM) return;
      const item = this.actor.items.get(e.currentTarget.dataset.deleteItem);
      await item?.delete();
      this.render(false);
    });

    // Обыскать — открывает loot transfer между персонажем и контейнером
    html.find("[data-open-loot-transfer]").on("click", async () => {
      const { IronHillsLootTransfer } = await import("./loot-transfer-app.mjs");
      const char = canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
      IronHillsLootTransfer.open(char, this.actor);
    });

    // Из справочника (GM)
    html.find("[data-add-item-from-compendium]").on("click", () => {
      game.ironHills?.openCompendiumBrowser?.();
    });
  }

  // ── Передача предмета: контейнер → персонаж ───────────────
  async _transferItem(itemId, doRender = true) {
    // Получаем персонажа — выбранный токен или персонаж пользователя
    const target = canvas?.tokens?.controlled?.[0]?.actor
                ?? game.user?.character;

    if (!target) {
      ui.notifications.warn("Выбери токен персонажа чтобы взять предмет");
      return;
    }

    const item = this.actor.items.get(itemId);
    if (!item) return;

    // Создаём копию у персонажа
    const itemData = item.toObject();
    delete itemData._id;
    await Item.create(itemData, { parent: target });

    // Удаляем из контейнера
    await item.delete();

    ui.notifications.info(`${target.name} взял: ${item.name}`);
    if (doRender) this.render(false);
  }

  // ── Drop: предмет из инвентаря В контейнер ────────────────
  async _onDropItem(event) {
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch { return; }

    // Foundry drag data
    const uuid = data.uuid;
    if (!uuid) return;

    const item = await fromUuid(uuid);
    if (!item || !(item instanceof Item)) return;

    // Перемещаем предмет в контейнер
    const itemData = item.toObject();
    delete itemData._id;
    await Item.create(itemData, { parent: this.actor });

    // Удаляем из источника
    await item.delete();

    this.render(false);
    ui.notifications.info(`${item.name} помещён в ${this.actor.name}`);
  }
}

export { IronHillsContainerSheet };
