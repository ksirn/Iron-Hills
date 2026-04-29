/**
 * Iron Hills — Pending Items App
 * Схрон полученных предметов (как в Tarkov/PoE).
 * Предметы отображаются в grid, можно перетащить в инвентарь.
 * Нельзя закрыть пока все не распределены или не выброшены.
 */
import { IronHillsGridInventoryApp, buildContainers } from "./grid-inventory-app.mjs";

const CELL = 46;
const STASH_COLS = 10;

export class PendingItemsApp extends Application {
  constructor(actor, options = {}) {
    super(options);
    this._actor = actor;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "pending-items-app"],
      title:     "📥 Получены предметы",
      width:     STASH_COLS * CELL + 32,
      height:    "auto",
      resizable: false,
      minimizable: false,
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/pending-items.hbs";
  }

  async close(options = {}) {
    const remaining = this._getPendingItems();
    if (remaining.length > 0 && !options.force) {
      ui.notifications.warn(`Распредели или выброси все предметы (осталось: ${remaining.length})`);
      return;
    }
    return super.close(options);
  }

  _getPendingItems() {
    // Берём актуального актора (может обновиться после экипировки)
    const actor  = game.actors?.get(this._actor.id) ?? this._actor;
    this._actor  = actor; // обновляем ссылку
    const conts  = buildContainers(actor);
    const assigned = new Set();
    for (const c of conts)
      for (const s of c.sections ?? [])
        for (const p of s.placed ?? [])
          assigned.add(p.item?.id);
    const equip = actor.system?.equipment ?? {};
    return actor.items.filter(i =>
      !assigned.has(i.id) &&
      !Object.values(equip).includes(i.id) &&
      !["spell","attachment"].includes(i.type)
    );
  }

  /** Строим grid схрона из нераспределённых предметов */
  _buildStashGrid(items) {
    const rows = Math.max(4, Math.ceil(items.length / STASH_COLS) + 2);
    // Простая упаковка — кладём предметы слева направо сверху вниз
    const grid = Array.from({ length: rows }, () => Array(STASH_COLS).fill(null));
    const placed = [];

    for (const item of items) {
      const w = Number(item.system?.gridW ?? 1);
      const h = Number(item.system?.gridH ?? 1);
      let found = false;
      outer: for (let r = 0; r <= rows - h; r++) {
        for (let c = 0; c <= STASH_COLS - w; c++) {
          // Проверяем свободно ли место
          let ok = true;
          for (let dr = 0; dr < h && ok; dr++)
            for (let dc = 0; dc < w && ok; dc++)
              if (grid[r+dr]?.[c+dc]) ok = false;
          if (ok) {
            for (let dr = 0; dr < h; dr++)
              for (let dc = 0; dc < w; dc++)
                grid[r+dr][c+dc] = item.id;
            placed.push({ item, col: c, row: r, w, h });
            found = true;
            break outer;
          }
        }
      }
      if (!found) placed.push({ item, col: 0, row: rows, w, h }); // overflow
    }
    return { placed, rows, grid };
  }

  async getData() {
    const pending = this._getPendingItems();
    const { placed, rows } = this._buildStashGrid(pending);

    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < STASH_COLS; c++)
        cells.push({ col: c, row: r, x: c*CELL, y: r*CELL, size: CELL });

    const STACKABLE = new Set(["ammo","throwable"]);
    const placedData = placed.map(p => ({
      itemId:  p.item.id,
      name:    p.item.name,
      img:     p.item.img ?? "icons/svg/item-bag.svg",
      type:    p.item.type,
      // qty показываем только для стакуемых
      qty:     STACKABLE.has(p.item.type) ? (p.item.system?.quantity ?? 1) : null,
      w: p.w, h: p.h, col: p.col, row: p.row,
      cssLeft: p.col * CELL,
      cssTop:  p.row * CELL,
      cssW:    p.w * CELL - 3,
      cssH:    p.h * CELL - 3,
      tier:    p.item.system?.tier ?? 1,
    }));

    return {
      actorName:  this._actor.name,
      count:      pending.length,
      done:       pending.length === 0,
      cells,
      placed:     placedData,
      gridW:      STASH_COLS * CELL,
      gridH:      rows * CELL,
      cellSize:   CELL,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Drag start из схрона
    html.find(".ih-pi-item").on("dragstart", e => {
      const itemId = e.currentTarget.dataset.itemId;
      this._dragItemId = itemId;
      if (e.originalEvent?.dataTransfer)
        e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({ itemId, fromPending: true }));
      $(e.currentTarget).addClass("dragging");
    });

    html.find(".ih-pi-item").on("dragend", e => {
      $(e.currentTarget).removeClass("dragging");
    });

    // ПКМ на предмет — выбросить на землю
    html.find(".ih-pi-item").on("contextmenu", async e => {
      e.preventDefault();
      const itemId = e.currentTarget.dataset.itemId;
      const item   = this._actor.items.get(itemId);
      if (!item) return;
      const drop = await Dialog.confirm({
        title:   "Выбросить на землю?",
        content: `<p>Выбросить <b>${item.name}</b> на землю?</p>`,
        defaultYes: false,
      });
      if (drop) {
        await game.ironHills?.dropToGround?.([item], this._actor);
        if (this._getPendingItems().length === 0)
          await super.close({ force: true });
        else this.render(false);
      }
    });

    // Открыть инвентарь персонажа рядом
    html.find("[data-open-inventory]").on("click", () => {
      new IronHillsGridInventoryApp(this._actor).render(true);
    });

    // Авторазместить всё
    html.find("[data-auto-place-all]").on("click", async () => {
      const failed = await IronHillsGridInventoryApp.autoPlaceAllItems(this._actor);
      if (failed.length === 0) {
        ui.notifications.info("✅ Все предметы размещены!");
        await super.close({ force: true });
      } else {
        ui.notifications.warn(`Не влезло: ${failed.length} шт. — освободи место.`);
        this.render(false);
      }
    });

    // Если всё размещено — закрыть
    if (this._getPendingItems().length === 0)
      super.close({ force: true });
  }

  static async openIfNeeded(actor) {
    // Авторазмещение без экипировки (только в контейнеры)
    const conts = buildContainers(actor);
    const assigned = new Set();
    for (const c of conts)
      for (const s of c.sections ?? [])
        for (const p of s.placed ?? [])
          assigned.add(p.item?.id);

    const equip   = actor.system?.equipment ?? {};
    const unplaced = actor.items.filter(i =>
      !assigned.has(i.id) &&
      !Object.values(equip).includes(i.id) &&
      !["spell","attachment"].includes(i.type)
    );

    if (unplaced.length === 0) return;

    // Открываем схрон
    const app = new PendingItemsApp(actor);
    app.render(true);
  }
}
