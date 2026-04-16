/**
 * Iron Hills — Grid Inventory App v4
 * Один экран: слоты экипировки слева, все секции инвентаря вертикально справа.
 * Стек брони: резист берётся лучший из слоёв покрывающих зону.
 */

const CELL = 46;

// Слоты экипировки — расположение на силуэте
const EQUIP_SLOTS = [
  // Руки (оружие/щит)
  { key:"leftHand",  label:"Л. рука",   icon:"🗡",  x:6,   y:6,   w:60, h:60, accepts:["weapon","armor"], group:"hands" },
  { key:"rightHand", label:"П. рука",   icon:"⚔",  x:154, y:6,   w:60, h:60, accepts:["weapon","armor"], group:"hands" },
  // Голова + шея
  { key:"head",      label:"Голова",    icon:"⛑",  x:80,  y:6,   w:60, h:60, accepts:["armor"],          group:"body" },
  { key:"neck",      label:"Шея",       icon:"📿",  x:154, y:76,  w:60, h:34, accepts:["jewelry"],        group:"body" },
  // Тело
  { key:"torso",     label:"Торс",      icon:"🛡",  x:80,  y:76,  w:60, h:60, accepts:["armor"],          group:"body" },
  // Руки (броня)
  { key:"leftArm",   label:"Л. наруч",  icon:"🦾",  x:6,   y:146, w:60, h:50, accepts:["armor"],          group:"body" },
  { key:"rightArm",  label:"П. наруч",  icon:"🦾",  x:154, y:146, w:60, h:50, accepts:["armor"],          group:"body" },
  // Живот и ноги
  { key:"legs",      label:"Ноги",      icon:"👖",  x:80,  y:146, w:60, h:60, accepts:["armor"],          group:"body" },
  // Бижутерия
  { key:"ringLeft",  label:"Кольцо Л",  icon:"💍",  x:6,   y:214, w:60, h:34, accepts:["jewelry"],        group:"jewelry" },
  { key:"ringRight", label:"Кольцо П",  icon:"💍",  x:154, y:214, w:60, h:34, accepts:["jewelry"],        group:"jewelry" },
  // Пояс и рюкзак
  { key:"belt",      label:"Пояс",      icon:"🔗",  x:6,   y:264, w:100, h:40, accepts:["belt"],          group:"carry" },
  { key:"backpack",  label:"Рюкзак",    icon:"🎒",  x:114, y:264, w:100, h:40, accepts:["backpack"],       group:"carry" },
];

// Карта: слот брони → зоны тела которые защищает (по умолчанию)
const SLOT_COVERS = {
  head:       ["head"],
  torso:      ["torso"],
  leftArm:    ["leftArm"],
  rightArm:   ["rightArm"],
  legs:       ["leftLeg", "rightLeg"],
};

// ─── Лучший резист для зоны (стек брони) ─────────────────
export function getBestResistForZone(actor, zone, damageType = "physical") {
  const equip = actor.system?.equipment ?? {};
  let best = 0;

  for (const [slot, itemId] of Object.entries(equip)) {
    if (!itemId) continue;
    const item = actor.items.get(itemId);
    if (!item || item.type !== "armor") continue;

    const covers = item.system?.covers ?? SLOT_COVERS[slot] ?? [];
    if (!covers.includes(zone)) continue;

    const durVal = Number(item.system?.durability?.value ?? 100);
    const durMax = Number(item.system?.durability?.max   ?? 100);
    const scale  = durMax > 0 ? Math.max(0, durVal / durMax) : 1;
    const scalef = scale >= 0.5 ? 1 : scale * 2;
    const resist = Math.floor(Number(item.system?.resist ?? 0) * scalef);
    if (resist > best) best = resist;
  }
  return best;
}

// ─── Алгоритм сетки ──────────────────────────────────────

function makeGrid(cols, rows) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function canPlace(grid, col, row, w, h) {
  if (col < 0 || row < 0) return false;
  if (!grid[0] || col + w > grid[0].length || row + h > grid.length) return false;
  for (let r = row; r < row + h; r++)
    for (let c = col; c < col + w; c++)
      if (grid[r][c] !== null) return false;
  return true;
}

function placeOnGrid(grid, col, row, w, h, id) {
  for (let r = row; r < row + h; r++)
    for (let c = col; c < col + w; c++)
      grid[r][c] = id;
}

function findFreeSlot(grid, w, h) {
  if (!grid.length || !grid[0].length) return null;
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (canPlace(grid, c, r, w, h)) return { col: c, row: r };
  return null;
}

// ─── Построение контейнеров ──────────────────────────────

function buildContainers(actor) {
  const equip    = actor.system?.equipment ?? {};
  const allItems = Array.from(actor.items ?? []);
  const getF     = (item) => item?.flags?.["iron-hills-system"] ?? {};

  const containers = [];

  // 1. КАРМАНЫ — 4 изолированных слота 1×1
  containers.push({
    key: "pockets", label: "Карманы", icon: "🤲",
    sourceItemId: null,
    sections: [{
      key: "pockets_main", label: "Карманы",
      cols: 4, rows: 1,
      allowedTypes: null, maxItemW: 1, maxItemH: 1,
      accessSeconds: 0, pocketMode: true,
    }],
  });

  // 2. ПОЯС — от экипированного ремня
  const beltItem = equip.belt ? actor.items.get(equip.belt) : null;
  if (beltItem) {
    const cfg = beltItem.system;
    const cols = cfg?.containerSlots?.cols ?? 0;
    const rows = cfg?.containerSlots?.rows ?? 1;
    const attachSlots = Array.isArray(cfg?.attachmentSlots) ? cfg.attachmentSlots : [];
    const secs = [];

    if (cols > 0) secs.push({
      key: "belt_main", label: beltItem.name,
      cols, rows, allowedTypes: null,
      maxItemW: null, maxItemH: null,
      accessSeconds: cfg?.accessSeconds ?? 1,
    });

    for (const as of attachSlots) {
      const ai = allItems.find(i => getF(i).container === `belt_attach_${as.key}`);
      if (ai?.type === "attachment") {
        secs.push({
          key: `belt_attach_${as.key}_items`,
          label: ai.system?.addsLabel ?? ai.name,
          cols: ai.system?.addsSlots?.cols ?? 3,
          rows: ai.system?.addsSlots?.rows ?? 1,
          allowedTypes: Array.isArray(ai.system?.allowedTypes) ? ai.system.allowedTypes : null,
          maxItemW: null, maxItemH: null,
          accessSeconds: ai.system?.accessSeconds ?? 1,
          sourceItemId: ai.id,
        });
      }
    }

    if (secs.length) containers.push({
      key: "belt", label: "Пояс", icon: "🔗",
      sourceItemId: beltItem.id, sections: secs,
    });
  }

  // 3. ТОРС — от брони торса (если есть containerSlots)
  const torsoItem = equip.torso ? actor.items.get(equip.torso) : null;
  if (torsoItem) {
    const cfg  = torsoItem.system;
    const cols = cfg?.containerSlots?.cols ?? 0;
    const rows = cfg?.containerSlots?.rows ?? 0;
    const secs = [];
    if (cols > 0 && rows > 0) secs.push({
      key: "torso_main", label: torsoItem.name,
      cols, rows, allowedTypes: null, maxItemW: null, maxItemH: null,
      accessSeconds: cfg?.accessSeconds ?? 1,
    });
    const attachSlots = Array.isArray(cfg?.attachmentSlots) ? cfg.attachmentSlots : [];
    for (const as of attachSlots) {
      const ai = allItems.find(i => getF(i).container === `torso_attach_${as.key}`);
      if (ai?.type === "attachment") {
        secs.push({
          key: `torso_attach_${as.key}_items`,
          label: ai.system?.addsLabel ?? ai.name,
          cols: ai.system?.addsSlots?.cols ?? 2,
          rows: ai.system?.addsSlots?.rows ?? 2,
          allowedTypes: Array.isArray(ai.system?.allowedTypes) ? ai.system.allowedTypes : null,
          maxItemW: null, maxItemH: null,
          accessSeconds: ai.system?.accessSeconds ?? 1,
          sourceItemId: ai.id,
        });
      }
    }
    if (secs.length) containers.push({
      key: "torso", label: "Торс", icon: "🛡",
      sourceItemId: torsoItem.id, sections: secs,
    });
  }

  // 4. РЮКЗАК
  const bagItem = equip.backpack ? actor.items.get(equip.backpack) : null;
  if (bagItem) {
    const cfg  = bagItem.system;
    containers.push({
      key: "backpack", label: "Рюкзак", icon: "🎒",
      sourceItemId: bagItem.id,
      sections: [{
        key: "backpack_main", label: bagItem.name,
        cols: cfg?.containerSlots?.cols ?? 5,
        rows: cfg?.containerSlots?.rows ?? 6,
        allowedTypes: null, maxItemW: null, maxItemH: null,
        accessSeconds: cfg?.accessSeconds ?? 3,
      }],
    });
  }

  // Размещаем предметы в секциях
  for (const cont of containers) {
    for (const sec of cont.sections) {
      const grid = makeGrid(sec.cols, sec.rows);
      const placed = [], overflow = [];

      const mine = allItems
        .filter(i => {
          const f = getF(i);
          return f.sectionKey === sec.key && !Object.values(equip).includes(i.id);
        })
        .sort((a, b) => {
          const pa = getF(a).gridPos, pb = getF(b).gridPos;
          return ((pa?.row ?? 99) - (pb?.row ?? 99)) || ((pa?.col ?? 99) - (pb?.col ?? 99));
        });

      for (const item of mine) {
        const f = getF(item);
        const rotated = !!f.rotated;
        const bw = Number(item.system?.gridW ?? 1);
        const bh = Number(item.system?.gridH ?? 1);
        const w  = rotated ? bh : bw;
        const h  = rotated ? bw : bh;

        if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) { overflow.push(item); continue; }
        if (sec.maxItemW && w > sec.maxItemW) { overflow.push(item); continue; }
        if (sec.maxItemH && h > sec.maxItemH) { overflow.push(item); continue; }

        const pos = f.gridPos;
        if (pos && canPlace(grid, pos.col, pos.row, w, h)) {
          placeOnGrid(grid, pos.col, pos.row, w, h, item.id);
          placed.push({ item, col: pos.col, row: pos.row, w, h, rotated });
        } else {
          const free = findFreeSlot(grid, w, h);
          if (free) {
            placeOnGrid(grid, free.col, free.row, w, h, item.id);
            placed.push({ item, col: free.col, row: free.row, w, h, rotated });
          } else overflow.push(item);
        }
      }
      sec.grid = grid;
      sec.placed = placed;
      sec.overflow = overflow;
    }
  }

  // Предметы без секции → overflow рюкзака / карманов
  const assigned = new Set();
  for (const cont of containers)
    for (const sec of cont.sections)
      for (const p of (sec.placed ?? []))
        assigned.add(p.item.id);

  const unassigned = allItems.filter(i => {
    const f = getF(i);
    return !assigned.has(i.id) && !Object.values(equip).includes(i.id)
      && !["spell","attachment"].includes(i.type);
  });

  const target = containers.find(c => c.key === "backpack")
    ?? containers.find(c => c.key === "pockets");
  if (target?.sections?.[0]) target.sections[0].overflow.push(...unassigned);

  return containers;
}

// ─── App ─────────────────────────────────────────────────

class IronHillsGridInventoryApp extends Application {

  constructor(actor, options = {}) {
    super(options);
    this.actor      = actor;
    this._dragData  = null;
    this._activeSec = "pockets_main";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "grid-inventory"],
      width:     980,
      height:    680,
      resizable: true,
      title:     "Инвентарь"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/grid-inventory.hbs";
  }

  async getData() {
    const actor  = this.actor;
    this.options.title = `Инвентарь — ${actor.name}`;
    const equip  = actor.system?.equipment ?? {};
    const conts  = buildContainers(actor);

    // Слоты экипировки
    const equipSlots = EQUIP_SLOTS.map(slot => {
      const itemId = equip[slot.key];
      const item   = itemId ? actor.items.get(itemId) : null;
      const covers = item?.system?.covers ?? SLOT_COVERS[slot.key] ?? [];
      return {
        ...slot,
        hasItem:   !!item,
        itemId:    item?.id ?? "",
        itemName:  item?.name ?? "",
        itemImg:   item?.img ?? "",
        itemTier:  item?.system?.tier ?? "",
        resist:    item?.system?.resist ?? null,
        covers:    covers.join(", "),
        durPct:    item?.system?.durability
          ? Math.round(item.system.durability.value / Math.max(1, item.system.durability.max) * 100)
          : null,
      };
    });

    // Все секции всех контейнеров — для отображения на одном экране
    const allSections = [];
    for (const cont of conts) {
      for (const sec of cont.sections) {
        const gap = sec.pocketMode ? 8 : 0;
        allSections.push({
          contKey:   cont.key,
          contLabel: cont.label,
          contIcon:  cont.icon,
          key:       sec.key,
          label:     sec.label,
          cols:      sec.cols,
          rows:      sec.rows,
          accessSeconds: sec.accessSeconds,
          allowedLabel:  sec.allowedTypes?.join(", ") ?? null,
          pocketMode:    !!sec.pocketMode,
          isActive:      sec.key === this._activeSec,
          gridW: sec.pocketMode ? sec.cols*(CELL+8) : sec.cols*CELL,
          gridH: sec.rows * CELL,
          cells: this._buildCells(sec.cols, sec.rows, !!sec.pocketMode),
          placed: (sec.placed ?? []).map(p => this._mapPlaced(p, !!sec.pocketMode)),
          overflow: (sec.overflow ?? []).map(i => ({
            itemId: i.id, name: i.name,
            img: i.img ?? "icons/svg/item-bag.svg", type: i.type,
          })),
        });
      }
    }

    const totalOverflow = allSections.reduce((n,s) => n + s.overflow.length, 0);

    return { actor, equipSlots, allSections, totalOverflow, cellSize: CELL };
  }

  _buildCells(cols, rows, pocketMode = false) {
    const gap = pocketMode ? 8 : 0;
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cells.push({ col:c, row:r, x:c*(CELL+gap), y:r*CELL, size:CELL, isPocket:pocketMode });
    return cells;
  }

  _mapPlaced(p, pocketMode = false) {
    const gap = pocketMode ? 8 : 0;
    return {
      itemId:  p.item.id, name: p.item.name,
      img:     p.item.img ?? "icons/svg/item-bag.svg",
      type:    p.item.type, tier: p.item.system?.tier ?? 1,
      qty:     p.item.system?.quantity ?? 1,
      w:p.w, h:p.h, col:p.col, row:p.row, rotated:p.rotated,
      durPct:  p.item.system?.durability
        ? Math.round(p.item.system.durability.value / Math.max(1,p.item.system.durability.max)*100)
        : null,
      isBroken: (p.item.system?.durability?.value ?? 1) <= 0,
      cssLeft: p.col*(CELL+gap), cssTop: p.row*CELL,
      cssW: p.w*CELL-3, cssH: p.h*CELL-3,
    };
  }

  // ─── Listeners ───────────────────────────────────────

  activateListeners(html) {
    super.activateListeners(html);

    // Клик по секции — делает активной (для drag target)
    html.find("[data-sec-key]").on("click", e => {
      this._activeSec = e.currentTarget.dataset.secKey;
      html.find(".ih-gi-sec-block").removeClass("is-active");
      html.find(`[data-sec-key="${this._activeSec}"]`).addClass("is-active");
    });

    // Drag start с предмета
    html.find(".ih-gi-item").on("dragstart", e => {
      const el = e.currentTarget;
      this._dragData = { itemId: el.dataset.itemId, fromSec: el.dataset.secKey };
      if (e.originalEvent?.dataTransfer) {
        e.originalEvent.dataTransfer.effectAllowed = "move";
        e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(this._dragData));
      }
    });

    // Drop на каждый canvas
    html.find(".ih-gi-canvas").each((_, canvasEl) => {
      canvasEl.addEventListener("dragover", e => {
        e.preventDefault();
        this._highlightCell($(canvasEl), e);
      });
      canvasEl.addEventListener("dragleave", () => {
        $(canvasEl).find(".ih-gi-cell").removeClass("drag-over");
      });
      canvasEl.addEventListener("drop", e => {
        e.preventDefault();
        $(canvasEl).find(".ih-gi-cell").removeClass("drag-over");
        const secKey = canvasEl.dataset.secKey;
        this._onCanvasDrop(e, canvasEl, secKey);
      });
    });

    // Drop на слот экипировки
    html.find(".ih-gi-equip-slot").on("dragover", e => e.preventDefault());
    html.find(".ih-gi-equip-slot").on("drop", e => {
      e.preventDefault(); e.stopPropagation();
      this._onEquipDrop(e.currentTarget.dataset.slot, e.originalEvent ?? e);
    });

    // Drag с экипировки
    html.find(".ih-gi-equip-slot.has-item").on("dragstart", e => {
      const slot   = e.currentTarget.dataset.slot;
      const itemId = this.actor.system?.equipment?.[slot];
      if (itemId) {
        this._dragData = { itemId, fromEquip: slot };
        if (e.originalEvent?.dataTransfer)
          e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(this._dragData));
      }
    });

    // ПКМ на предмет
    html.find(".ih-gi-item").on("contextmenu", e => {
      e.preventDefault();
      this._ctxMenu(e.currentTarget.dataset.itemId, e.currentTarget.dataset.secKey);
    });

    // ПКМ на слот экипировки — снять
    html.find(".ih-gi-equip-slot.has-item").on("contextmenu", async e => {
      e.preventDefault();
      const slot   = e.currentTarget.dataset.slot;
      const itemId = this.actor.system?.equipment?.[slot];
      if (itemId) await this._unequip(slot, itemId);
    });

    // Дабл-клик — быстрая экипировка
    html.find(".ih-gi-item").on("dblclick", async e => {
      await this._quickEquip(e.currentTarget.dataset.itemId);
    });

    // Авто-размещение
    html.find("[data-auto-place]").on("click", e => {
      this._autoPlace(e.currentTarget.dataset.itemId);
    });
  }

  _onCanvasDrop(e, canvasEl, secKey) {
    let data = this._dragData;
    if (!data) { try { data = JSON.parse(e.dataTransfer?.getData("text/plain")??"{}"); } catch { return; } }
    this._dragData = null;
    if (!data?.itemId) return;

    const rect = canvasEl.getBoundingClientRect();
    const sec  = buildContainers(this.actor)
      .flatMap(c => c.sections).find(s => s.key === secKey);
    const gap  = sec?.pocketMode ? 8 : 0;
    const col  = Math.floor((e.clientX - rect.left)  / (CELL + gap));
    const row  = Math.floor((e.clientY - rect.top)   / CELL);

    this._placeInSection(data.itemId, secKey, col, row);
  }

  async _placeInSection(itemId, secKey, col, row) {
    const item  = this.actor.items.get(itemId);
    if (!item) return;

    const conts = buildContainers(this.actor);
    let sec = null;
    for (const cont of conts) {
      sec = cont.sections.find(s => s.key === secKey);
      if (sec) break;
    }
    if (!sec) return;

    if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) {
      ui.notifications.warn(`В "${sec.label}" нельзя класть ${item.type}`); return;
    }

    const f  = item.flags?.["iron-hills-system"] ?? {};
    const rt = !!f.rotated;
    const bw = Number(item.system?.gridW ?? 1), bh = Number(item.system?.gridH ?? 1);
    const w  = rt ? bh : bw, h = rt ? bw : bh;

    if (sec.maxItemW && w > sec.maxItemW) { ui.notifications.warn(`Предмет слишком широк`); return; }

    // Убираем из старой позиции
    if (sec.grid) {
      for (let r = 0; r < sec.grid.length; r++)
        for (let c = 0; c < sec.grid[r].length; c++)
          if (sec.grid[r][c] === itemId) sec.grid[r][c] = null;
    }

    if (!canPlace(sec.grid ?? makeGrid(sec.cols, sec.rows), col, row, w, h)) {
      ui.notifications.warn("Нет места"); return;
    }

    await item.update({
      "flags.iron-hills-system.sectionKey": secKey,
      "flags.iron-hills-system.gridPos":    { col, row },
    });
    this.render(false);
  }

  async _onEquipDrop(slot, e) {
    let data = this._dragData;
    if (!data) { try { data = JSON.parse(e.dataTransfer?.getData("text/plain")??"{}"); } catch { return; } }
    this._dragData = null;
    if (!data?.itemId) return;

    const item    = this.actor.items.get(data.itemId);
    if (!item) return;
    const slotCfg = EQUIP_SLOTS.find(s => s.key === slot);
    if (!slotCfg?.accepts.includes(item.type)) {
      ui.notifications.warn(`В "${slotCfg?.label}" нельзя надеть ${item.type}`); return;
    }

    const curId = this.actor.system?.equipment?.[slot];
    if (curId && curId !== data.itemId) {
      const old = this.actor.items.get(curId);
      if (old) await old.update({ "flags.iron-hills-system.sectionKey": null, "flags.iron-hills-system.gridPos": null });
    }

    await this.actor.update({ [`system.equipment.${slot}`]: data.itemId });
    await item.update({ "flags.iron-hills-system.sectionKey": null, "flags.iron-hills-system.gridPos": null });
    this.render(false);
  }

  async _unequip(slot, itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;
    await this.actor.update({ [`system.equipment.${slot}`]: "" });
    await item.update({ "flags.iron-hills-system.sectionKey": null, "flags.iron-hills-system.gridPos": null });
    this.render(false);
  }

  async _rotate(itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;
    const f = item.flags?.["iron-hills-system"] ?? {};
    await item.update({ "flags.iron-hills-system.rotated": !f.rotated });
    this.render(false);
  }

  async _quickEquip(itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;
    const compat = EQUIP_SLOTS.filter(s => s.accepts.includes(item.type));
    if (!compat.length) return;
    const equip  = this.actor.system?.equipment ?? {};
    const free   = compat.find(s => !equip[s.key]) ?? compat[0];
    await this._onEquipDrop(free.key, { dataTransfer: { getData: () => JSON.stringify({ itemId }) } });
  }

  async _autoPlace(itemId) {
    const item  = this.actor.items.get(itemId);
    if (!item) return;
    const conts = buildContainers(this.actor);
    for (const cont of conts) {
      for (const sec of cont.sections) {
        if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) continue;
        const f  = item.flags?.["iron-hills-system"] ?? {};
        const rt = !!f.rotated;
        const w  = rt ? (item.system?.gridH??1) : (item.system?.gridW??1);
        const h  = rt ? (item.system?.gridW??1) : (item.system?.gridH??1);
        if (sec.maxItemW && w > sec.maxItemW) continue;
        const slot = findFreeSlot(sec.grid, w, h);
        if (slot) { await this._placeInSection(itemId, sec.key, slot.col, slot.row); return; }
      }
    }
    ui.notifications.warn("Нигде нет места.");
  }

  async _ctxMenu(itemId, currentSec) {
    const item  = this.actor.items.get(itemId);
    if (!item) return;

    const equipBtns = {};
    for (const s of EQUIP_SLOTS.filter(s => s.accepts.includes(item.type)))
      equipBtns[s.key] = { label:`${s.icon} → ${s.label}`, callback:()=>s.key };

    const moveBtns = {};
    const conts = buildContainers(this.actor);
    for (const cont of conts)
      for (const sec of cont.sections) {
        if (sec.key === currentSec) continue;
        if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) continue;
        moveBtns[sec.key] = { label:`${cont.icon} → ${sec.label}`, callback:()=>`move:${sec.key}` };
      }

    const choice = await Dialog.wait({
      title: item.name,
      content:`<p style="color:#a8b8d0;font-family:'Segoe UI',sans-serif">${item.name} · ст.${item.system?.tier??1}</p>`,
      buttons:{
        ...equipBtns, ...moveBtns,
        rotate:{ label:"↺ Повернуть", callback:()=>"rotate" },
        del:   { label:"🗑 Выбросить",  callback:()=>"delete" },
      },
      default:"rotate"
    });

    if (!choice) return;
    if (choice==="rotate")        { await this._rotate(itemId); return; }
    if (choice==="delete")        { await item.delete(); this.render(false); return; }
    if (choice.startsWith("move:")){ const t=choice.replace("move:",""); await item.update({"flags.iron-hills-system.sectionKey":t,"flags.iron-hills-system.gridPos":null}); this.render(false); return; }
    await this._onEquipDrop(choice, { dataTransfer:{getData:()=>JSON.stringify({itemId})} });
  }

  _highlightCell(jqCanvas, e) {
    const canvasEl = jqCanvas[0];
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const secKey = canvasEl.dataset.secKey;
    const sec = buildContainers(this.actor).flatMap(c=>c.sections).find(s=>s.key===secKey);
    const gap = sec?.pocketMode ? 8 : 0;
    const col = Math.floor((e.clientX-rect.left)/(CELL+gap));
    const row = Math.floor((e.clientY-rect.top)/CELL);
    jqCanvas.find(".ih-gi-cell").removeClass("drag-over");
    jqCanvas.find(`.ih-gi-cell[data-col="${col}"][data-row="${row}"]`).addClass("drag-over");
  }
}

export { IronHillsGridInventoryApp, EQUIP_SLOTS, buildContainers };
