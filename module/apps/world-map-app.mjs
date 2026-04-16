/**
 * Iron Hills — World Map App
 * Глобальная карта регионов.
 * JSON-конфиг тайлов, A* маршрут, Travel Manager интеграция.
 */
import { TERRAIN_TYPES, TRANSPORT_TYPES, DEFAULT_REGIONS } from "../constants/world-map.mjs";
import { getPartyGroups, savePartyGroups, getMembersOfGroup } from "../services/party-manager.mjs";

const TILE_PX = 56; // px на тайл

// ─── A* поиск пути ───────────────────────────────────────

function astar(tiles, cols, rows, startCol, startRow, endCol, endRow, transport) {
  const tKey   = (c, r) => `${c},${r}`;
  const tIndex = (c, r) => r * cols + c;
  const blocked = TRANSPORT_TYPES[transport]?.blocked ?? [];
  const onlyOn  = TRANSPORT_TYPES[transport]?.onlyOn  ?? null;
  const speedMult = TRANSPORT_TYPES[transport]?.speedMult ?? 1;

  const tileMap = {};
  for (const t of tiles) tileMap[tKey(t.col, t.row)] = t;

  const getCost = (col, row) => {
    const t = tileMap[tKey(col, row)];
    if (!t) return Infinity;
    const terrain = TERRAIN_TYPES[t.terrain];
    if (!terrain) return 1;
    if (blocked.includes(t.terrain)) return Infinity;
    if (onlyOn && !onlyOn.includes(t.terrain)) return Infinity;
    return terrain.costHours * speedMult;
  };

  const h = (c, r) => Math.abs(c - endCol) + Math.abs(r - endRow);

  const open   = new Map();
  const closed  = new Set();
  const gScore  = {};
  const prev    = {};

  const startKey = tKey(startCol, startRow);
  gScore[startKey] = 0;
  open.set(startKey, h(startCol, startRow));

  const DIRS = [[0,-1],[0,1],[-1,0],[1,0]];

  while (open.size) {
    // Выбираем с минимальным f
    let curKey = null, minF = Infinity;
    for (const [k, f] of open) {
      if (f < minF) { minF = f; curKey = k; }
    }
    if (!curKey) break;
    open.delete(curKey);

    if (curKey === tKey(endCol, endRow)) {
      // Восстанавливаем путь
      const path = [];
      let k = curKey;
      while (k) { path.unshift(k); k = prev[k]; }
      return {
        path: path.map(k => {
          const [c, r] = k.split(",").map(Number);
          return { col: c, row: r, tile: tileMap[k] };
        }),
        totalHours: gScore[curKey],
        found: true,
      };
    }

    closed.add(curKey);
    const [cc, cr] = curKey.split(",").map(Number);

    for (const [dc, dr] of DIRS) {
      const nc = cc+dc, nr = cr+dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const nKey = tKey(nc, nr);
      if (closed.has(nKey)) continue;

      const cost = getCost(nc, nr);
      if (!isFinite(cost)) continue;

      const ng = (gScore[curKey] ?? Infinity) + cost;
      if (ng < (gScore[nKey] ?? Infinity)) {
        gScore[nKey] = ng;
        prev[nKey] = curKey;
        open.set(nKey, ng + h(nc, nr));
      }
    }
  }

  return { path: [], totalHours: Infinity, found: false };
}

// ─── App ─────────────────────────────────────────────────

class IronHillsWorldMapApp extends Application {

  constructor(options = {}) {
    super(options);
    this._regionId    = "iron_hills";
    this._transport   = "foot";
    this._groupId     = null;
    this._route       = null;       // { path, totalHours }
    this._target      = null;       // { col, row }
    this._manualMode  = false;      // ручная прокладка
    this._manualPath  = [];         // вручную выбранные тайлы
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "world-map"],
      width:     900,
      height:    700,
      resizable: true,
      title:     "🗺 Карта мира"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/world-map.hbs";
  }

  _getRegion() {
    // Сначала проверяем пользовательские регионы в настройках
    let regions = {};
    try { regions = game.settings.get("iron-hills-system", "worldRegions") ?? {}; } catch {}
    return regions[this._regionId] ?? DEFAULT_REGIONS[this._regionId];
  }

  _getGroupPosition() {
    const groups = getPartyGroups();
    const group  = this._groupId
      ? groups.find(g => g.id === this._groupId)
      : groups.find(g => g.isActive) ?? groups[0];

    this._groupId = group?.id ?? null;
    return {
      group,
      col: group?.mapCol ?? 5,
      row: group?.mapRow ?? 4,
    };
  }

  async getData() {
    const region  = this._getRegion();
    const groups  = getPartyGroups();
    const { group, col: groupCol, row: groupRow } = this._getGroupPosition();
    const transport = TRANSPORT_TYPES[this._transport];

    // Подготавливаем тайлы для шаблона
    const routeSet = new Set(
      (this._route?.path ?? []).map(p => `${p.col},${p.row}`)
    );

    const tiles = (region?.tiles ?? []).map(t => {
      const terrain  = TERRAIN_TYPES[t.terrain] ?? {};
      const isGroup  = t.col === groupCol && t.row === groupRow;
      const isTarget = this._target && t.col === this._target.col && t.row === this._target.row;
      const inRoute  = routeSet.has(`${t.col},${t.row}`);
      const isStart  = inRoute && t.col === groupCol && t.row === groupRow;
      const isEnd    = inRoute && isTarget;

      return {
        ...t,
        terrainLabel: terrain.label ?? t.terrain,
        terrainIcon:  terrain.icon  ?? "?",
        terrainColor: terrain.color ?? "#444",
        costHours:    terrain.costHours ?? 1,
        hasGroup:     isGroup,
        isTarget,
        inRoute,
        isStart,
        isEnd,
        isManual: this._manualMode && this._manualPath.some(p => p.col === t.col && p.row === t.row),
        isPoi:        !!t.poi,
        x:            t.col * TILE_PX,
        y:            t.row * TILE_PX,
        size:         TILE_PX,
      };
    });

    // Маршрут для показа
    let routeInfo = null;
    if (this._route?.found && this._target) {
      const hours   = this._route.totalHours;
      routeInfo = {
        found:         true,
        totalHours:    Math.round(hours * 10) / 10,
        stepsCount:    this._route.path.length - 1,
        targetLabel:   tiles.find(t => t.isTarget)?.label || "Цель",
        transportLabel: transport?.label ?? this._transport,
      };
    } else if (this._target) {
      routeInfo = { found: false, blocked: true };
    }

    return {
      region: { ...region, tiles },
      transport:  this._transport,
      transports: Object.entries(TRANSPORT_TYPES).map(([k, v]) => ({
        key: k, ...v, isActive: k === this._transport
      })),
      groups: groups.map(g => ({ ...g, isActive: g.id === this._groupId })),
      activeGroup:   group,
      routeInfo,
      hasTarget:     !!this._target,
      canTravel:     !!this._route?.found && game.user?.isGM,
      isGM:          game.user?.isGM ?? false,
      manualMode:    this._manualMode,
      isManualRoute: !!this._route?.manual,
      mapW:          (region?.cols ?? 10) * TILE_PX,
      mapH:          (region?.rows ?? 10) * TILE_PX,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Клик по тайлу
    html.find(".ih-wm-tile").on("click", e => {
      const col = parseInt(e.currentTarget.dataset.col);
      const row = parseInt(e.currentTarget.dataset.row);
      const { col: gc, row: gr } = this._getGroupPosition();

      if (col === gc && row === gr) {
        this._target     = null;
        this._route      = null;
        this._manualPath = [];
        this.render(false);
        return;
      }

      if (this._manualMode) {
        // Ручной режим — добавляем/убираем тайл из пути
        const key = `${col},${row}`;
        const idx = this._manualPath.findIndex(p => p.col === col && p.row === row);
        if (idx >= 0) {
          // Убираем тайл и все после него
          this._manualPath = this._manualPath.slice(0, idx);
        } else {
          this._manualPath.push({ col, row });
        }

        // Пересчитываем стоимость ручного пути
        if (this._manualPath.length) {
          const region = this._getRegion();
          const last   = this._manualPath[this._manualPath.length - 1];
          this._target = { col: last.col, row: last.row };

          const { col: sc, row: sr } = this._getGroupPosition();
          const fullPath = [{ col: sc, row: sr }, ...this._manualPath];
          let totalHours = 0;
          for (let i = 1; i < fullPath.length; i++) {
            const t = region.tiles.find(t => t.col === fullPath[i].col && t.row === fullPath[i].row);
            const terrain = TERRAIN_TYPES[t?.terrain ?? "plains"];
            const mult    = TRANSPORT_TYPES[this._transport]?.speedMult ?? 1;
            totalHours   += (terrain?.costHours ?? 1) * mult;
          }

          this._route = {
            found: true,
            path:  fullPath.map(p => ({ col: p.col, row: p.row,
              tile: region.tiles.find(t => t.col === p.col && t.row === p.row) })),
            totalHours,
            manual: true,
          };
        } else {
          this._target = null;
          this._route  = null;
        }
      } else {
        // Авто режим — A*
        this._target = { col, row };
        const region = this._getRegion();
        this._route  = astar(
          region.tiles, region.cols, region.rows,
          gc, gr, col, row, this._transport
        );
        this._manualPath = [];
      }

      this.render(false);
    });

    // Переключение режима маршрута
    html.find("[data-toggle-manual]").on("click", () => {
      this._manualMode = !this._manualMode;
      this._manualPath = [];
      this._target     = null;
      this._route      = null;
      this.render(false);
    });

    // Hover для подсказки
    html.find(".ih-wm-tile").on("mouseenter", e => {
      const col = parseInt(e.currentTarget.dataset.col);
      const row = parseInt(e.currentTarget.dataset.row);
      const region = this._getRegion();
      const tile   = region.tiles.find(t => t.col === col && t.row === row);
      if (!tile) return;

      const terrain = TERRAIN_TYPES[tile.terrain] ?? {};
      const cost    = (terrain.costHours ?? 1) * (TRANSPORT_TYPES[this._transport]?.speedMult ?? 1);
      const label   = tile.label ? `<b>${tile.label}</b><br>` : "";
      const tip     = `${label}${terrain.icon} ${terrain.label} · ${cost.toFixed(1)}ч/тайл`;
      html.find(".ih-wm-tooltip").html(tip).show();
    });

    html.find(".ih-wm-tile").on("mouseleave", () => {
      html.find(".ih-wm-tooltip").hide();
    });

    // Выбор транспорта
    html.find("[data-transport]").on("click", e => {
      this._transport = e.currentTarget.dataset.transport;
      // Пересчитываем маршрут
      if (this._target) {
        const region = this._getRegion();
        const { col: gc, row: gr } = this._getGroupPosition();
        this._route = astar(
          region.tiles, region.cols, region.rows,
          gc, gr, this._target.col, this._target.row, this._transport
        );
      }
      this.render(false);
    });

    // Выбор группы
    html.find("[data-select-group]").on("change", e => {
      this._groupId = e.currentTarget.value || null;
      this._target  = null;
      this._route   = null;
      this.render(false);
    });

    // Подтвердить путешествие (GM)
    html.find("[data-confirm-travel]").on("click", async () => {
      await this._confirmTravel();
    });

    // Войти в локацию
    html.find("[data-enter-location]").on("click", async () => {
      await this._enterLocation();
    });
  }

  async _confirmTravel() {
    if (!this._route?.found || !this._target) return;
    if (!game.user?.isGM) { ui.notifications.warn("Только GM может подтвердить путешествие."); return; }

    const hours  = Math.round(this._route.totalHours * 10) / 10;
    const region = this._getRegion();
    const target = region.tiles.find(t => t.col === this._target.col && t.row === this._target.row);

    // Подтверждение
    const ok = await Dialog.confirm({
      title:   "Подтвердить путешествие",
      content: `<p>Маршрут: <b>${hours}ч</b> (${this._transport})<br>
        Цель: <b>${target?.label || `[${this._target.col},${this._target.row}]`}</b></p>
        <p>Применить к активной группе?</p>`
    });
    if (!ok) return;

    // Обновляем позицию группы
    const groups = getPartyGroups().map(g => {
      if (g.id !== this._groupId && !(this._groupId === null && g.isActive)) return g;
      return {
        ...g,
        mapCol:     this._target.col,
        mapRow:     this._target.row,
        localHours: (g.localHours ?? 0) + hours,
        location:   target?.label || g.location,
      };
    });
    await savePartyGroups(groups);

    // Открываем Travel Manager и применяем время
    const { IronHillsTravelApp } = await import("./travel-app.mjs");
    const travelApp = Object.values(ui.windows).find(w => w instanceof IronHillsTravelApp)
      ?? new IronHillsTravelApp();

    travelApp._hours    = Math.max(1, Math.round(hours));
    travelApp._activity = this._transport === "horse" ? "ride"
      : this._transport === "cart"  ? "ride"
      : "walk";

    await travelApp._applyTime(true);

    // Сообщение
    await ChatMessage.create({
      content: `🗺 <b>Группа прибыла:</b> ${target?.label ?? "цель"} (${hours.toFixed(1)}ч)`
    });

    this._target = null;
    this._route  = null;
    this.render(false);

    // Если локация имеет сцену — предлагаем войти
    if (target?.sceneId) {
      const scene = game.scenes.get(target.sceneId);
      if (scene) {
        const enter = await Dialog.confirm({
          title: "Войти в локацию?",
          content: `<p>Загрузить сцену <b>${scene.name}</b>?</p>`
        });
        if (enter) await scene.activate();
      }
    }
  }

  async _enterLocation() {
    const { col, row } = this._getGroupPosition();
    const region = this._getRegion();
    const tile   = region.tiles.find(t => t.col === col && t.row === row);
    if (!tile?.sceneId) { ui.notifications.warn("У этой локации нет привязанной сцены."); return; }

    const scene = game.scenes.get(tile.sceneId);
    if (!scene) { ui.notifications.warn("Сцена не найдена."); return; }
    await scene.activate();
  }
}

export { IronHillsWorldMapApp };
