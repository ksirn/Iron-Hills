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
    // Если тайл не определён — считаем проходимым (plains)
    if (!t) {
      if (onlyOn) return Infinity; // лодка требует воду
      return 1 * speedMult;
    }
    const terrain = TERRAIN_TYPES[t.terrain];
    if (!terrain) return 1 * speedMult;
    if (blocked.includes(t.terrain)) return Infinity;
    if (onlyOn && !onlyOn.includes(t.terrain)) return Infinity;
    return (terrain.costHours ?? 1) * speedMult;
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
    let userRegions = {};
    try { userRegions = game.settings.get("iron-hills-system", "worldRegions") ?? {}; } catch {}

    const base = foundry.utils.deepClone(DEFAULT_REGIONS[this._regionId] ?? DEFAULT_REGIONS["iron_hills"]);
    const user = userRegions[this._regionId];

    if (!user) return base;

    // Мёрджим: дефолтный грид + изменения от пользователя
    // Пользовательские тайлы override дефолтные
    if (user.tiles?.length) {
      const tileMap = {};
      for (const t of base.tiles ?? []) tileMap[`${t.col},${t.row}`] = t;
      for (const t of user.tiles) tileMap[`${t.col},${t.row}`] = { ...tileMap[`${t.col},${t.row}`], ...t };
      base.tiles = Object.values(tileMap);
    }

    return {
      ...base,
      ...user,
      tiles: base.tiles, // уже смержены выше
      cols: user.cols ?? base.cols ?? 10,
      rows: user.rows ?? base.rows ?? 10,
    };
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

    // POI из акторов - накладываем на карту
    const poiActors = (game.actors ?? []).filter(a => a.type === "poi");
    const poiMarkers = poiActors.map(a => ({
      id:    a.id,
      name:  a.name,
      type:  a.system.info?.poiType ?? "camp",
      tier:  a.system.info?.tier    ?? 1,
      col:   Number(a.system.info?.mapCol ?? -1),
      row:   Number(a.system.info?.mapRow ?? -1),
      icon:  { camp:"⛺", lair:"🐉", ruins:"🏚", shrine:"⛩",
               road:"🛣", dungeon:"⚔", tower:"🗼", cave:"🕳" }[a.system.info?.poiType] ?? "📍",
      danger: Number(a.system.state?.threatLevel ?? a.system.info?.danger ?? 3),
      status: a.system.info?.status ?? "",
      x:     Number(a.system.info?.mapCol ?? -1) * TILE_PX,
      y:     Number(a.system.info?.mapRow ?? -1) * TILE_PX,
    })).filter(p => p.col >= 0 && p.row >= 0);

    return {
      region: { ...region, tiles },
      poiMarkers,
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

    // Клик по POI маркеру — открывает лист актора
    html.on("click", ".ih-wm-poi-marker", e => {
      e.stopPropagation();
      const poiId = e.currentTarget.dataset.poiId;
      if (!poiId) return;
      const actor = game.actors.get(poiId);
      if (actor) actor.sheet.render(true);
    });

    // ПКМ по POI маркеру — контекстное меню
    html.on("contextmenu", ".ih-wm-poi-marker", async e => {
      e.preventDefault();
      e.stopPropagation();
      const poiId = e.currentTarget.dataset.poiId;
      const actor = game.actors.get(poiId);
      if (!actor) return;
      const choice = await Dialog.wait({
        title: actor.name,
        content: `<p style="color:#a8b8d0">${actor.name}</p>`,
        buttons: {
          open:  { label: "📋 Открыть лист",    callback: () => "open"  },
          close: { label: "✅ Закрыть (зачищен)", callback: () => "clear" },
        },
        default: "open",
      });
      if (choice === "open") {
        actor.sheet.render(true);
      } else if (choice === "clear") {
        await actor.update({ "system.info.status": "cleared" });
        ui.notifications.info(`${actor.name} помечен как зачищенный`);
        this.render(false);
      }
    });

    // Клик по POI маркеру — открывает лист актора
    html.on("click", ".ih-wm-poi-marker", e => {
      e.stopPropagation();
      const poiId = e.currentTarget.dataset.poiId;
      const actor = game.actors?.get(poiId);
      if (actor) actor.sheet?.render(true);
    });

    // ПКМ по POI — быстрые действия
    html.on("contextmenu", ".ih-wm-poi-marker", async e => {
      e.preventDefault(); e.stopPropagation();
      const actor = game.actors?.get(e.currentTarget.dataset.poiId);
      if (!actor) return;
      const choice = await Dialog.wait({
        title: actor.name,
        content: `<p style="color:#a8b8d0;margin:0">${actor.name}</p>`,
        buttons: {
          open:  { label: "📋 Открыть лист",     callback: () => "open"  },
          clear: { label: "✅ Зачищен",            callback: () => "clear" },
        },
        default: "open",
      });
      if (choice === "open")  actor.sheet?.render(true);
      if (choice === "clear") {
        await actor.update({ "system.info.status": "cleared" });
        ui.notifications.info(`${actor.name} помечен как зачищенный`);
        this.render(false);
      }
    });


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

  /**
   * Пошаговое путешествие. Вызывается при старте и после каждого «Продолжить».
   * Если следующий шаг маршрута содержит событие — останавливаемся и показываем его.
   * Если событий больше нет — завершаем путешествие.
   */
  async _stepTravel() {
    if (!this._travel) return;
    const tr = this._travel;
    const { presentTravelEvent } = await import("../services/travel-events-service.mjs");

    // Есть ли следующее событие?
    const nextEvent = tr.events[tr.eventIdx];

    if (nextEvent) {
      tr.eventIdx++;

      // Часть пути до события
      const stepFraction = nextEvent.tileIdx / (tr.path.length - 1);
      const hoursToEvent = tr.baseHours * stepFraction - tr.hoursAccum;
      tr.hoursAccum += hoursToEvent;

      // Показываем событие в чат
      const { delay, timeBonus } = await presentTravelEvent(
        nextEvent, tr.eventIdx, tr.events.length
      );
      tr.totalDelay += delay - timeBonus;

      // Кнопка «Продолжить путь» через ChatMessage с кастомным action
      const btn = `<button class="ih-travel-continue-btn"
        data-travel-app-id="${this.appId}"
        style="margin-top:8px;padding:5px 16px;background:#1e3a5f;border:1px solid #5b9cf6;
               border-radius:4px;color:#90c4f8;cursor:pointer;font-family:var(--font-primary)">
        ▶ Продолжить путь
      </button>`;

      await ChatMessage.create({
        content: `<div style="padding:4px 0">${btn}</div>`
      });

      // Слушаем клик по кнопке через Hooks
      const hookId = Hooks.on("renderChatMessage", (_msg, html) => {
        html.find(".ih-travel-continue-btn").on("click", () => {
          if (!game.user?.isGM) return;
          Hooks.off("renderChatMessage", hookId);
          this._stepTravel();
        });
      });

    } else {
      // Событий больше нет — завершаем путешествие
      const adjustedHours = Math.max(0.5, tr.baseHours + tr.totalDelay);

      // Обновляем позицию группы
      const groups = getPartyGroups().map(g => {
        if (g.id !== this._groupId && !(this._groupId === null && g.isActive)) return g;
        return {
          ...g,
          mapCol:     tr.target.col,
          mapRow:     tr.target.row,
          localHours: (g.localHours ?? 0) + adjustedHours,
          location:   tr.targetLabel || g.location,
        };
      });
      await savePartyGroups(groups);

      // Travel Manager
      const { IronHillsTravelApp } = await import("./travel-app.mjs");
      const travelApp = Object.values(ui.windows).find(w => w instanceof IronHillsTravelApp)
        ?? new IronHillsTravelApp();
      travelApp._hours    = Math.max(1, Math.round(adjustedHours));
      travelApp._activity = tr.activity;
      await travelApp._applyTime(true);

      const note = tr.totalDelay !== 0
        ? ` (задержка: ${tr.totalDelay > 0 ? "+" : ""}${tr.totalDelay.toFixed(1)}ч)`
        : "";

      await ChatMessage.create({
        content: `✅ <b>Группа прибыла:</b> ${tr.targetLabel} (${adjustedHours.toFixed(1)}ч${note})`
      });

      this._travel = null;
      this.render(false);
    }
  }

  async _stepTravel() {
    if (!this._travel) return;
    const tr = this._travel;
    const { presentTravelEvent } = await import("../services/travel-events-service.mjs");

    const nextEvent = tr.events[tr.eventIdx];

    if (nextEvent) {
      tr.eventIdx++;

      const stepFraction = nextEvent.tileIdx / Math.max(1, tr.path.length - 1);
      const hoursToEvent = tr.baseHours * stepFraction - tr.hoursAccum;
      tr.hoursAccum += hoursToEvent;

      const { delay, timeBonus } = await presentTravelEvent(
        nextEvent, tr.eventIdx, tr.events.length
      );
      tr.totalDelay += (delay ?? 0) - (timeBonus ?? 0);

      // Кнопка «Продолжить» в чате — только GM видит
      const btn = `<button class="ih-travel-continue-btn"
        style="margin-top:6px;padding:5px 16px;background:#1e3a5f;
               border:1px solid #5b9cf6;border-radius:4px;color:#90c4f8;
               cursor:pointer;font-size:12px">
        ▶ Продолжить путь
      </button>`;

      const msg = await ChatMessage.create({
        content: `<div style="padding:4px 0">${btn}</div>`,
        whisper: ChatMessage.getWhisperRecipients("GM"),
      });

      // Ждём клика через hook на рендер сообщения
      const hookId = Hooks.on("renderChatMessage", (_m, html) => {
        html.find(".ih-travel-continue-btn").on("click", () => {
          if (!game.user?.isGM) return;
          Hooks.off("renderChatMessage", hookId);
          this._stepTravel();
        });
      });

    } else {
      // Путешествие завершено
      const adjustedHours = Math.max(0.5, tr.baseHours + tr.totalDelay);

      const groups = getPartyGroups().map(g => {
        if (g.id !== this._groupId && !(this._groupId === null && g.isActive)) return g;
        return {
          ...g,
          mapCol:     tr.target.col,
          mapRow:     tr.target.row,
          localHours: (g.localHours ?? 0) + adjustedHours,
          location:   tr.targetLabel || g.location,
        };
      });
      await savePartyGroups(groups);

      const { IronHillsTravelApp } = await import("./travel-app.mjs");
      const travelApp = Object.values(ui.windows).find(w => w instanceof IronHillsTravelApp)
        ?? new IronHillsTravelApp();
      travelApp._hours    = Math.max(1, Math.round(adjustedHours));
      travelApp._activity = tr.activity;
      await travelApp._applyTime(true);

      const note = tr.totalDelay !== 0
        ? ` (задержка: ${tr.totalDelay > 0 ? "+" : ""}${tr.totalDelay.toFixed(1)}ч)` : "";
      await ChatMessage.create({
        content: `✅ <b>Группа прибыла:</b> ${tr.targetLabel} (${adjustedHours.toFixed(1)}ч${note})`
      });

      this._travel = null;
      this.render(false);
    }
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

    // Сохраняем состояние путешествия и запускаем пошаговый режим
    const { generateTravelEvents, adjustTravelTime }
      = await import("../services/travel-events-service.mjs");

    const region_      = this._getRegion();
    const dangerLevel  = Number(region_?.danger ?? 3);
    const travelEvents = generateTravelEvents(this._route.path, region_, dangerLevel);
    const activity     = this._transport === "horse" || this._transport === "cart"
      ? "ride" : "walk";

    // Сохраняем состояние путешествия
    this._travel = {
      path:        this._route.path,
      target:      this._target,
      targetLabel: target?.label ?? "",
      baseHours:   hours,
      activity,
      events:      travelEvents,        // все события с индексами тайлов
      eventIdx:    0,                   // текущее событие
      hoursAccum:  0,                   // накопленные часы (до текущего события)
      totalDelay:  0,
    };

    await ChatMessage.create({
      content: `🗺 <b>Группа выдвигается</b> → ${target?.label ?? "цель"} (${hours.toFixed(1)}ч)`
    });

    this._target = null;
    this._route  = null;
    await this._stepTravel();          // запускаем первый шаг
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
