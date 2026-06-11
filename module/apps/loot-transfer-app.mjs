/**
 * Iron Hills — Loot Transfer App v2
 * Окно обмена: два grid inventory рядом.
 * Предметы можно только drag&drop-ом перетаскивать между секциями.
 * Никакого "взять всё", никакого списка — только сетки инвентаря.
 */
import {
  IronHillsGridInventoryApp,
  buildContainers,
  getPendingItemsForActor,
} from "./grid-inventory-app.mjs";
import { getPersistentActor } from "../utils/actor-utils.mjs";
import {
  canEquipItemInSlot,
  clearActorItemReferences,
  EQUIPMENT_SLOT_DEFS,
  equipActorItem,
  moveItemToInventorySection,
  unequipActorSlot
} from "../services/inventory-service.mjs";
import {
  harvestMonsterCarcass,
  buildLootTransferHarvestPresentation,
  buildLootTransferPickpocketPresentation,
  pickpocketNpc,
} from "../services/wilderness-service.mjs";

const CELL = 40; // чуть меньше чем в основном инвентаре

function resolveLiveActor(actor) {
  return getPersistentActor(actor) ?? actor ?? null;
}

async function deleteTransferredItem(actor, item) {
  if (!item || item.pack || typeof item.delete !== "function") return;
  const liveActor = resolveLiveActor(actor ?? item.actor);
  if (liveActor?.id) {
    await clearActorItemReferences(liveActor, item.id).catch(() => {});
  }
  await item.delete();
}

class IronHillsLootTransfer extends Application {

  constructor(left, right, options = {}) {
    super(options);
    this._left  = left;
    this._right = right;
    this._drag  = null; // { itemId, actorId, fromSec }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "loot-transfer"],
      width:     860,
      height:    600,
      resizable: true,
      title:     "Обыск / Обмен",
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/loot-transfer.hbs";
  }

  static open(left, right) {
    const existing = Object.values(ui.windows).find(w => w instanceof IronHillsLootTransfer);
    existing?.close();
    return new IronHillsLootTransfer(left, right).render(true);
  }

  // ── Статик: сброс на землю ────────────────────────────────
  static async dropToGround(items, actorSrc) {
    if (!items?.length) return;
    const token = canvas?.tokens?.placeables?.find(t => t.actor?.id === actorSrc?.id);
    const x = (token?.x ?? 400) + 80;
    const y = token?.y ?? 400;

    const pile = await Actor.create({
      name:  items.length === 1 ? items[0].name : `Куча (${items.length} пред.)`,
      type:  "container",
      img:   items[0]?.img ?? "icons/svg/item-bag.svg",
      system:{ info:{ theme:"pile", tier:1, lockDifficulty:0, isLocked:false }},
    });
    for (const item of items) {
      const data = typeof item.toObject === "function" ? item.toObject() : { ...item };
      delete data._id;
      if (data.flags?.["iron-hills-system"]) data.flags["iron-hills-system"] = {};
      await Item.create(data, { parent: pile });
      await deleteTransferredItem(actorSrc, item);
    }
    if (canvas?.scene) {
      await canvas.scene.createEmbeddedDocuments("Token", [{
        actorId: pile.id, x, y, name: pile.name, img: pile.img,
        width:1, height:1, disposition:0,
        displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
      }]);
    }
    ui.notifications.info(`${items.length} предм. выброшено`);
    return pile;
  }

  // ── Данные ────────────────────────────────────────────────
  async getData() {
    const rightIsContainer = this._right?.type === "container";
    const rightIsActor     = this._right && !rightIsContainer;

    const leftEquip  = this._buildEquipSlots(this._left);
    const rightEquip = rightIsActor ? this._buildEquipSlots(this._right) : [];
    const rightContainers = rightIsActor ? buildContainers(this._right) : [];
    const rightSections = rightIsActor ? this._buildSections(this._right, rightContainers) : [];
    const rightLooseItems = rightIsActor ? this._buildLooseItems(this._right, rightContainers) : [];

    const harvestUi = buildLootTransferHarvestPresentation(this._left, this._right);
    const pickpocketUi = buildLootTransferPickpocketPresentation(this._left, this._right);

    return {
      leftName:  this._left?.name  ?? "—",
      rightName: this._right?.name ?? "Земля",
      leftImg:   this._left?.img   ?? "icons/svg/mystery-man.svg",
      rightImg:  this._right?.img  ?? "icons/svg/item-bag.svg",
      hasRight:         !!this._right,
      rightIsContainer,
      rightIsActor,
      leftEquip,
      rightEquip,
      leftSections:  this._buildSections(this._left),
      rightSections,
      rightLooseItems,
      stashGrid: rightIsContainer ? this._buildContainerList(this._right) : null,
      cellSize: CELL,
      harvestUi,
      pickpocketUi,
    };
  }

  _buildContainerList(actor) {
    if (!actor) return { cols:8, rows:0, cells:[], items:[] };

    const COLS = 8;
    // Авто-размещение предметов в сетку
    const allItems = Array.from(actor.items ?? []);
    const grid = [];
    const placed = [];

    const fits = (col, row, w, h) => {
      for (let r = row; r < row+h; r++)
        for (let c = col; c < col+w; c++)
          if (grid[r]?.[c]) return false;
      return col+w <= COLS;
    };
    const occupy = (col, row, w, h, id) => {
      for (let r = row; r < row+h; r++) {
        if (!grid[r]) grid[r] = Array(COLS).fill(null);
        for (let c = col; c < col+w; c++) grid[r][c] = id;
      }
    };
    const findFree = (w, h) => {
      let row = 0;
      while (row < 200) {
        if (!grid[row]) grid[row] = Array(COLS).fill(null);
        for (let col = 0; col <= COLS-w; col++) {
          if (fits(col, row, w, h)) return { col, row };
        }
        row++;
      }
      return null;
    };

    for (const item of allItems) {
      const w = Number(item.system?.gridW ?? 1);
      const h = Number(item.system?.gridH ?? 1);
      const pos = findFree(w, h);
      if (pos) {
        occupy(pos.col, pos.row, w, h, item.id);
        placed.push({ item, col:pos.col, row:pos.row, w, h,
          cssLeft: pos.col*CELL, cssTop: pos.row*CELL,
          cssW: w*CELL-2, cssH: h*CELL-2 });
      }
    }

    const rows = Math.max(6, grid.length + 4); // всегда есть свободные строки снизу
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < COLS; c++)
        cells.push({ col:c, row:r, x:c*CELL, y:r*CELL, size:CELL });

    return {
      cols: COLS, rows,
      gridW: COLS*CELL,
      gridH: rows*CELL,
      actorId: actor.id,
      cells,
      items: placed.map(p => ({
        itemId:  p.item.id,
        actorId: actor.id,
        name:    p.item.name,
        img:     p.item.img ?? "icons/svg/item-bag.svg",
        type:    p.item.type,
        tier:    p.item.system?.tier ?? 1,
        qty:     p.item.system?.quantity ?? 1,
        cssLeft: p.cssLeft, cssTop: p.cssTop,
        cssW:    p.cssW,    cssH:   p.cssH,
      })),
    };
  }

  _buildEquipSlots(actor) {
    if (!actor) return [];
    const equip = actor.system?.equipment ?? {};
    const ICONS = {
      head:"⛑", neck:"📿", torso:"🛡", leftArm:"🦾", rightArm:"🦾",
      legs:"👖", leftHand:"🗡", rightHand:"⚔", ringLeft:"💍", ringRight:"💍",
      belt:"🔗", backpack:"🎒",
    };
    return EQUIPMENT_SLOT_DEFS.map(s => {
      const itemId = equip[s.key];
      const item   = itemId ? actor.items.get(itemId) : null;
      return {
        key: s.key, label: s.label, icon: ICONS[s.key] ?? "?",
        actorId: actor.id,
        hasItem: !!item,
        itemId:  item?.id   ?? null,
        itemName:item?.name ?? "",
        itemImg: item?.img  ?? "",
      };
    });
  }


  _buildSections(actor, containers = null) {
    if (!actor) return [];
    const conts = containers ?? buildContainers(actor);
    const equip = actor.system?.equipment ?? {};

    return conts.flatMap(cont =>
      cont.sections.map(sec => {
        const gap = sec.pocketMode ? 6 : 0;
        // Вычисляем cells
        const cells = [];
        for (let r = 0; r < sec.rows; r++)
          for (let c = 0; c < sec.cols; c++)
            cells.push({ col:c, row:r,
              x: c*(CELL+gap), y: r*CELL, size:CELL, isPocket:sec.pocketMode });

        // Предметы в секции
        const placed = sec.placed ?? [];

        return {
          key:       sec.key,
          label:     sec.label,
          actorId:   actor.id,
          cols:      sec.cols,
          rows:      sec.rows,
          pocketMode:sec.pocketMode ?? false,
          gridW:     sec.pocketMode ? sec.cols*(CELL+gap) : sec.cols*CELL,
          gridH:     sec.rows * CELL,
          cells,
          items: placed.map(p => ({
            itemId:  p.item.id,
            actorId: actor.id,
            secKey:  sec.key,
            name:    p.item.name,
            img:     p.item.img ?? "icons/svg/item-bag.svg",
            type:    p.item.type,
            tier:    p.item.system?.tier ?? 1,
            qty:     p.item.system?.quantity ?? 1,
            cssLeft: p.col*(CELL+gap), cssTop: p.row*CELL,
            cssW:    p.w*CELL - 2,     cssH:   p.h*CELL - 2,
            col: p.col, row: p.row, w: p.w, h: p.h,
          })),
          overflow: sec.overflow ?? [],
        };
      })
    );
  }

  // ── Listeners ─────────────────────────────────────────────
  _buildLooseItems(actor, containers = null) {
    if (!actor) return [];
    const conts = containers ?? buildContainers(actor);
    return getPendingItemsForActor(actor, conts).map(item => ({
      itemId: item.id,
      actorId: actor.id,
      secKey: "__loose__",
      name: item.name,
      img: item.img ?? "icons/svg/item-bag.svg",
      type: item.type,
      tier: item.system?.tier ?? 1,
      qty: item.system?.quantity ?? 1,
      w: Number(item.system?.gridW ?? 1),
      h: Number(item.system?.gridH ?? 1),
    }));
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Корневой элемент приложения (не .window-app!)
    const root = html[0].querySelector(".ih-lt2-app") ?? html[0];

    // ── Drag: прямые listeners на каждый перетаскиваемый элемент ──
    // (надёжнее delegation для position:absolute элементов)
    const attachDrag = (el) => {
      el.draggable = true;
      el.addEventListener("dragstart", e => {
        e.stopPropagation();
        const target = e.currentTarget;
        this._drag = {
          itemId:    target.dataset.itemId,
          actorId:   target.dataset.actorId,
          secKey:    target.dataset.secKey ?? null,
          fromEquip: target.dataset.fromEquip ?? null,
        };
        target.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", target.dataset.itemId ?? "");
      });
      el.addEventListener("dragend", e => {
        e.currentTarget.classList.remove("is-dragging");
        setTimeout(() => { this._drag = null; }, 100);
      });
      // Двойной клик по контейнерному предмету в сташе — открыть как вложенный контейнер
      el.addEventListener("dblclick", async e => {
        const itemId  = el.dataset.itemId;
        const actorId = el.dataset.actorId;
        const actor   = game.actors.get(actorId);
        const item    = actor?.items.get(itemId);
        if (!item) return;
        const OPENABLE = ["backpack", "belt", "container"];
        if (OPENABLE.includes(item.type)) {
          // Создаём временный контейнер-актор показывающий содержимое
          await this._openNestedContainer(item, actor);
        }
      });
    };

    // Навешиваем на все items и equipped imgs
    root.querySelectorAll(".ih-lt2-item, .ih-lt2-pd-slot img[data-item-id]")
      .forEach(attachDrag);

    // ── Drop targets ────────────────────────────────────────
    const addDropTarget = (el, onDrop) => {
      el.addEventListener("dragover",  e => { e.preventDefault(); el.classList.add("drag-over"); });
      el.addEventListener("dragleave", e => {
        if (!el.contains(e.relatedTarget)) el.classList.remove("drag-over");
      });
      el.addEventListener("drop", async e => {
        e.preventDefault();
        el.classList.remove("drag-over");
        if (!this._drag) return;
        await onDrop(e, el);
      });
    };

    // Grid секции (инвентарь и сташ)
    root.querySelectorAll(".ih-lt2-grid").forEach(grid => {
      addDropTarget(grid, async (e) => {
        const cell   = Number(grid.dataset.cell) || CELL;
        const pocket = grid.dataset.pocket === "true";
        const gap    = pocket ? 6 : 0;
        const rect   = grid.getBoundingClientRect();
        const col    = Math.max(0, Math.floor((e.clientX - rect.left) / (cell + gap)));
        const row    = Math.max(0, Math.floor((e.clientY - rect.top)  / cell));
        await this._doTransfer(grid.dataset.actorId, grid.dataset.secKey, col, row);
      });
    });

    // Слоты экипировки
    root.querySelectorAll(".ih-lt2-pd-slot").forEach(slot => {
      addDropTarget(slot, async () => {
        await this._doEquip(slot.dataset.slotKey, slot.dataset.actorId);
      });
    });

    // Земля
    const ground = root.querySelector("[data-drop-target='ground']");
    if (ground) {
      addDropTarget(ground, async () => {
        const srcActor = game.actors.get(this._drag.actorId);
        const item     = srcActor?.items.get(this._drag.itemId);
        if (item) {
          await IronHillsLootTransfer.dropToGround([item], srcActor);
          this._drag = null;
          await this._refreshAfterInventoryChange(srcActor);
          this.render(false);
        }
      });
    }

    const reloadActorsAndRender = async () => {
      const lid = this._left?.id;
      const rid = this._right?.id;
      if (lid) {
        const next = game.actors.get(lid);
        if (next) this._left = getPersistentActor(next) ?? next;
      }
      if (rid) {
        const nextR = game.actors.get(rid);
        if (nextR) this._right = nextR;
      }
      this.render(false);
    };

    const openPendingIfNeeded = async (actor) => {
      const { PendingItemsApp } = await import("./pending-items-app.mjs").catch(() => ({}));
      if (PendingItemsApp) await PendingItemsApp.openIfNeeded(actor);
    };

    html.find("[data-ih-lt-harvest]").on("click", async (e) => {
      e.preventDefault();
      const leftRaw = game.actors.get(this._left?.id);
      const rightRaw = game.actors.get(this._right?.id);
      const left = getPersistentActor(leftRaw) ?? leftRaw;
      if (!left?.id || !rightRaw?.id) return;
      await harvestMonsterCarcass(left, rightRaw, {});
      await reloadActorsAndRender();
      await openPendingIfNeeded(left);
    });

    html.find("[data-ih-lt-harvest-gm]").on("click", async (e) => {
      e.preventDefault();
      if (!game.user?.isGM) return;
      const leftRaw = game.actors.get(this._left?.id);
      const rightRaw = game.actors.get(this._right?.id);
      const left = getPersistentActor(leftRaw) ?? leftRaw;
      if (!left?.id || !rightRaw?.id) return;
      await harvestMonsterCarcass(left, rightRaw, { bypassHarvestCheck: true });
      await reloadActorsAndRender();
      await openPendingIfNeeded(left);
    });

    html.find("[data-ih-lt-pickpocket]").on("click", async (e) => {
      e.preventDefault();
      const leftRaw = game.actors.get(this._left?.id);
      const rightRaw = game.actors.get(this._right?.id);
      const left = getPersistentActor(leftRaw) ?? leftRaw;
      if (!left?.id || !rightRaw?.id) return;
      await pickpocketNpc(left, rightRaw, {});
      await reloadActorsAndRender();
      await openPendingIfNeeded(left);
    });

    html.find("[data-ih-lt-pickpocket-gm]").on("click", async (e) => {
      e.preventDefault();
      if (!game.user?.isGM) return;
      const leftRaw = game.actors.get(this._left?.id);
      const rightRaw = game.actors.get(this._right?.id);
      const left = getPersistentActor(leftRaw) ?? leftRaw;
      if (!left?.id || !rightRaw?.id) return;
      await pickpocketNpc(left, rightRaw, { bypassPickpocketCheck: true });
      await reloadActorsAndRender();
      await openPendingIfNeeded(left);
    });

    // Закрыть
    html.find("[data-close-done]").on("click", () => this._closeAndClean());
  }

  // ── Экипировка предмета в слот ───────────────────────────
  async _refreshAfterInventoryChange(...actors) {
    const liveActors = [];
    const seen = new Set();
    for (const actor of actors) {
      const live = resolveLiveActor(actor);
      if (!live?.id || seen.has(live.id)) continue;
      seen.add(live.id);
      liveActors.push(live);
    }

    for (const actor of liveActors) {
      IronHillsGridInventoryApp.findOpenForActor(actor)?.render(false);
    }

    const { PendingItemsApp } = await import("./pending-items-app.mjs").catch(() => ({}));
    if (PendingItemsApp) {
      for (const actor of liveActors) {
        if (actor.type === "character") await PendingItemsApp.openIfNeeded(actor);
      }
    }
  }

  async _doEquip(slotKey, targetActorId) {
    if (!this._drag) return;
    const { itemId, actorId: srcActorId, fromEquip } = this._drag;
    this._drag = null;

    const dstActorRaw = game.actors.get(targetActorId);
    const dstActor    = getPersistentActor(dstActorRaw) ?? dstActorRaw;
    const slotCfg  = EQUIPMENT_SLOT_DEFS.find(s => s.key === slotKey);
    if (!dstActor || !slotCfg) {
      console.warn("Iron Hills | _doEquip failed:", { slotKey, targetActorId, dstActor: !!dstActor, slotCfg: !!slotCfg });
      return;
    }

    let srcActorRaw = srcActorId ? game.actors.get(srcActorId) : null;
    let srcActor    = srcActorRaw ? (getPersistentActor(srcActorRaw) ?? srcActorRaw) : null;
    let item        = srcActor?.items?.get(itemId);

    if (!item) {
      try {
        const found = await fromUuid(`Actor.${srcActorId}.Item.${itemId}`)
                   ?? await fromUuid(itemId);
        item = found;
      } catch (e) { /* не найдено */ }
    }

    if (!item) {
      ui.notifications.warn("Предмет не найден");
      return;
    }

    // Родитель предмета — канонический актор (если game.actors.get(src) промахнулся)
    const owner = item.actor ? (getPersistentActor(item.actor) ?? item.actor) : srcActor;
    if (!srcActor && owner) srcActor = owner;

    if (!canEquipItemInSlot(item, slotKey)) {
      ui.notifications.warn(`В слот "${slotCfg.label}" нельзя надеть предмет типа "${item.type}"`);
      return;
    }

    const needsClone = Boolean(item.pack || (owner?.id != null && owner.id !== dstActor.id));

    if (needsClone) {
      const data = item.toObject();
      delete data._id;
      foundry.utils.setProperty(data, "flags.iron-hills-system", {});
      const createdItems = await dstActor.createEmbeddedDocuments("Item", [data]);
      const created = createdItems?.[0] ?? null;
      if (!created) {
        ui.notifications.warn("Не удалось перенести предмет в слот экипировки.");
        return;
      }

      const CONTAINER_TYPES = ["backpack", "belt"];
      if (owner && CONTAINER_TYPES.includes(item.type)) {
        const prefix = item.type + "_";
        const contents = Array.from(owner.items ?? []).filter(ci => {
          const f = ci.flags?.["iron-hills-system"] ?? {};
          return f.sectionKey && f.sectionKey.startsWith(prefix);
        });
        for (const ci of contents) {
          const cd = ci.toObject();
          delete cd._id;
          await dstActor.createEmbeddedDocuments("Item", [cd]);
          await deleteTransferredItem(owner, ci);
        }
      }

      const removeFrom = owner ?? srcActor;
      await deleteTransferredItem(removeFrom, item);
      item = created;
    }

    // Снимок экипировки до правок — для swap рук на одном актёре и для displaced
    const equipped = await equipActorItem(dstActor, item, slotKey);
    if (!equipped) {
      ui.notifications.warn(`Cannot equip item type "${item.type}" to slot "${slotCfg.label}"`);
      return;
    }

    // Перекладка между слотами на том же актёре без клонирования — очистить старый слот

    await this._refreshAfterInventoryChange(dstActor, srcActor);
    this.render(false);
  }

    // ── Перенос предмета между секциями/акторами ──────────────
  async _doTransfer(targetActorId, targetSecKey, col, row) {
    if (!this._drag) return;
    const { itemId, actorId: srcActorId, fromEquip } = this._drag;
    this._drag = null;

    const srcActorRaw = game.actors.get(srcActorId);
    const dstActorRaw = game.actors.get(targetActorId);
    const srcActor = getPersistentActor(srcActorRaw) ?? srcActorRaw;
    const dstActor = getPersistentActor(dstActorRaw) ?? dstActorRaw;
    if (!dstActor) return;

    let item = srcActor?.items.get(itemId);
    if (!item) {
      try { item = await fromUuid(`Actor.${srcActorId}.Item.${itemId}`); } catch(e) {}
    }
    if (!item) return;

    const isSameActor = srcActor?.id === dstActor?.id;
    if (isSameActor && fromEquip) {
      await unequipActorSlot(srcActor, fromEquip);
      item = srcActor.items.get(itemId) ?? item;
    }

    // Проверяем ограничения секции назначения
    if (targetSecKey && targetSecKey !== "__stash__") {
      const conts = buildContainers(dstActor);
      let sec = null;
      for (const c of conts) { sec = c.sections.find(s => s.key === targetSecKey); if (sec) break; }
      if (sec) {
        const f  = item.flags?.["iron-hills-system"] ?? {};
        const rt = !!f.rotated;
        const bw = Number(item.system?.gridW ?? 1), bh = Number(item.system?.gridH ?? 1);
        const w  = rt ? bh : bw, h = rt ? bw : bh;
        if (sec.allowedTypes?.length && !sec.allowedTypes.includes(item.type)) {
          ui.notifications.warn(`В "${sec.label}" нельзя класть ${item.type}`); return;
        }
        if (sec.maxItemW && w > sec.maxItemW) {
          ui.notifications.warn(`Предмет слишком широк для "${sec.label}"`); return;
        }
        if (sec.maxItemH && h > sec.maxItemH) {
          ui.notifications.warn(`Предмет слишком длинный для "${sec.label}"`); return;
        }
      }
    }

    if (isSameActor && targetSecKey) {
      await moveItemToInventorySection(
        item,
        targetSecKey,
        targetSecKey === "__stash__" ? null : { col, row }
      );
    } else if (!isSameActor) {
      const data = item.toObject();
      delete data._id;
      foundry.utils.setProperty(data, "flags.iron-hills-system",
        targetSecKey && targetSecKey !== "__stash__"
          ? { sectionKey: targetSecKey, gridPos: { col, row } }
          : {}
      );
      await dstActor.createEmbeddedDocuments("Item", [data]);

      // Переносим содержимое рюкзака/пояса вместе с ним
      const CONTAINER_TYPES = ["backpack", "belt"];
      if (srcActor && CONTAINER_TYPES.includes(item.type)) {
        const prefix = item.type + "_";
        const contents = Array.from(srcActor.items ?? []).filter(ci => {
          const f = ci.flags?.["iron-hills-system"] ?? {};
          return f.sectionKey && f.sectionKey.startsWith(prefix);
        });
        for (const ci of contents) {
          const cd = ci.toObject();
          delete cd._id;
          // Сохраняем относительную позицию внутри контейнера
          await dstActor.createEmbeddedDocuments("Item", [cd]);
          await deleteTransferredItem(srcActor, ci);
        }
      }

      await deleteTransferredItem(srcActor, item);
    }

    await this._refreshAfterInventoryChange(dstActor, srcActor);
    this.render(false);
  }
  // ── Открыть вложенный контейнер (рюкзак внутри лута) ─────
  async _openNestedContainer(item, ownerActor) {
    // Собираем все предметы внутри рюкзака
    // (предметы с sectionKey начинающимся на backpack_/belt_)
    const prefix = item.type === "backpack" ? "backpack_" : `${item.type}_`;
    const contents = Array.from(ownerActor.items ?? []).filter(i => {
      const f = i.flags?.["iron-hills-system"] ?? {};
      return f.sectionKey && f.sectionKey.startsWith(prefix);
    });

    if (!contents.length) {
      ui.notifications.info(`${item.name} пуст`);
      return;
    }

    // Создаём временный контейнер для просмотра
    const tempContainer = await Actor.create({
      name:   `${item.name} (содержимое)`,
      type:   "container",
      img:    item.img,
      system: { info: { theme:"bag", tier: item.system?.tier ?? 1, lockDifficulty:0, isLocked:false }},
    });

    // Копируем предметы
    for (const ci of contents) {
      const d = ci.toObject(); delete d._id;
      foundry.utils.setProperty(d, "flags.iron-hills-system", {});
      await Item.create(d, { parent: tempContainer });
    }

    // Открываем как вложенный обмен
    const char = game.actors.get(this._left?.id) ?? this._left;
    IronHillsLootTransfer.open(char, tempContainer);
  }

  // ── Закрытие с очисткой ──────────────────────────────────
  async _closeAndClean() {
    await this._cleanEmptyContainers();
    this.close();
  }

  async close(options) {
    await this._cleanEmptyContainers();
    return super.close(options);
  }

  async _cleanEmptyContainers() {
    // Удаляем пустые контейнеры-кучи (тип "pile") на сцене
    const toDelete = [];
    for (const actor of game.actors ?? []) {
      if (actor.type !== "container") continue;
      if (actor.items.size > 0) continue;
      // Ищем токен этого актора на сцене
      const tokens = canvas?.scene?.tokens?.filter(t => t.actorId === actor.id) ?? [];
      for (const t of tokens) await t.delete();
      toDelete.push(actor);
    }
    for (const a of toDelete) await a.delete();
    if (toDelete.length) console.log(`Iron Hills | Удалено ${toDelete.length} пустых контейнеров`);
  }
}

export { IronHillsLootTransfer };
