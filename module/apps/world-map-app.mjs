/**
 * Iron Hills — World Map App
 * Глобальная карта регионов.
 * JSON-конфиг тайлов, A* маршрут, Travel Manager интеграция.
 */
import {
  TERRAIN_TYPES,
  TERRAIN_VISUALS,
  TRANSPORT_TYPES,
  DEFAULT_REGIONS,
  WORLD_MAP_LEVEL_ORDER,
  WORLD_MAP_LEVELS,
  WORLD_MAP_STAGE_NODES,
  IRON_HILLS_POI,
  resolveWorldMapBackdrop,
} from "../constants/world-map.mjs";
import { getPartyGroups, savePartyGroups, getMembersOfGroup } from "../services/party-manager.mjs";
import {
  buildCombatChatCard,
  buildSystemDialogContent,
  escapeCombatHtml,
} from "../services/combat-chat-service.mjs";
import {
  getMerchants,
  getPois,
  getQuests,
  getSettlements,
} from "../utils/world-helpers.mjs";
import {
  buildWorldMapNavigationModel,
  normalizeWorldMapFocus,
} from "../services/world-map-navigation-service.mjs";
import {
  buildWorldMapSceneBrief,
  buildWorldMapSceneBriefChatBody,
} from "../services/world-map-scene-brief-service.mjs";
import {
  buildWorldMapScenePrepChatBody,
  buildWorldMapSceneStagingChatBody,
  materializeWorldMapSceneStaging,
  persistWorldMapScenePrepPacket,
} from "../services/world-map-scene-prep-service.mjs";

const TILE_PX = 56; // px на тайл

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function round1(value) {
  return Math.round(asNumber(value, 0) * 10) / 10;
}

function coordLabel(col, row) {
  return `[${asNumber(col, 0)},${asNumber(row, 0)}]`;
}

function canonicalWorldMapLevel(level = "region") {
  const key = String(level ?? "").trim();
  if (key === "building") return "encounter";
  return WORLD_MAP_LEVELS[key] ? key : "region";
}

function getTransportSpeedMult(transportKey) {
  const cfg = TRANSPORT_TYPES[transportKey] ?? {};
  return cfg.speedMult ?? (cfg.speed ? 1 / Number(cfg.speed) : 1);
}

function getTerrainCostHours(terrainKey, transportKey) {
  const terrain = TERRAIN_TYPES[terrainKey] ?? {};
  return round1((terrain.costHours ?? terrain.moveCost ?? 1) * getTransportSpeedMult(transportKey));
}

function getTransportAvailability(terrainKey, transportKey) {
  const terrain = TERRAIN_TYPES[terrainKey] ?? {};
  const cfg = TRANSPORT_TYPES[transportKey] ?? {};
  const blocked = cfg.blocked ?? cfg.restrictions ?? [];
  if (blocked.includes(terrainKey)) return { ok: false, label: "нельзя", cssClass: "is-blocked" };
  if (cfg.onlyOn && !cfg.onlyOn.includes(terrainKey)) return { ok: false, label: "только вода", cssClass: "is-blocked" };
  if (cfg.requiresDock && !terrain.canDock) return { ok: false, label: "нет воды", cssClass: "is-blocked" };
  return { ok: true, label: `${getTerrainCostHours(terrainKey, transportKey)}ч`, cssClass: "is-ok" };
}

function getPoiMeta(tile = {}) {
  if (!tile?.label) return null;
  const meta = IRON_HILLS_POI[tile.label] ?? {};
  return {
    tier: meta.tier ?? tile.tier ?? 1,
    type: meta.type ?? tile.terrain ?? "poi",
    desc: meta.desc ?? "",
  };
}

function getTileDanger(tile = {}) {
  const meta = getPoiMeta(tile);
  const terrainDanger = {
    mountains: 3,
    pass: 3,
    swamp: 3,
    ruins: 3,
    dungeon: 4,
    mine: 2,
    forest: 2,
    hills: 2,
    river: 1,
    road: 1,
    town: 1,
    village: 1,
    plains: 1,
  }[tile.terrain] ?? 1;
  return Math.max(1, asNumber(tile.danger ?? meta?.tier ?? terrainDanger, terrainDanger));
}

function dangerTone(danger) {
  if (danger >= 4) return "is-danger";
  if (danger >= 3) return "is-warn";
  return "is-safe";
}

function buildRouteLine(path = []) {
  if (!Array.isArray(path) || path.length < 2) return "";
  return path
    .map(step => `${asNumber(step.col, 0) * TILE_PX + TILE_PX / 2},${asNumber(step.row, 0) * TILE_PX + TILE_PX / 2}`)
    .join(" ");
}

function buildRoutePreview(route, region, transportKey, limit = 9) {
  const path = route?.path ?? [];
  if (!path.length) return [];
  const tiles = region?.tiles ?? [];
  return path.slice(0, limit).map((step, index) => {
    const tile = step.tile ?? tiles.find(t => t.col === step.col && t.row === step.row) ?? step;
    const terrain = TERRAIN_TYPES[tile.terrain] ?? {};
    const visual = TERRAIN_VISUALS[tile.terrain] ?? {};
    const cost = index === 0 ? 0 : getTerrainCostHours(tile.terrain, transportKey);
    return {
      index,
      label: index === 0 ? "Старт" : (tile.label || terrain.label || tile.terrain || "тайл"),
      coord: coordLabel(step.col, step.row),
      terrainLabel: terrain.label ?? tile.terrain ?? "",
      icon: visual.mark ?? terrain.icon ?? "",
      cost,
      costLabel: index === 0 ? "0ч" : `${cost}ч`,
      cssClass: index === 0 ? "is-start" : index === path.length - 1 ? "is-end" : "",
    };
  });
}

function buildRouteTerrainBreakdown(route, region, transportKey) {
  const path = route?.path ?? [];
  if (path.length < 2) return [];
  const tiles = region?.tiles ?? [];
  const stats = new Map();
  for (let i = 1; i < path.length; i++) {
    const step = path[i];
    const tile = step.tile ?? tiles.find(t => t.col === step.col && t.row === step.row) ?? step;
    const key = tile.terrain ?? "plains";
    const terrain = TERRAIN_TYPES[key] ?? {};
    const visual = TERRAIN_VISUALS[key] ?? {};
    const prev = stats.get(key) ?? {
      key,
      label: terrain.label ?? key,
      icon: visual.mark ?? terrain.icon ?? "",
      steps: 0,
      hours: 0,
      color: visual.color ?? "#888",
    };
    prev.steps += 1;
    prev.hours = round1(prev.hours + getTerrainCostHours(key, transportKey));
    stats.set(key, prev);
  }
  return Array.from(stats.values()).sort((a, b) => b.hours - a.hours);
}

function buildTerrainLegend(tiles = [], transportKey) {
  const seen = new Set();
  return tiles
    .map(tile => tile.terrain)
    .filter(Boolean)
    .filter(terrain => {
      if (seen.has(terrain)) return false;
      seen.add(terrain);
      return true;
    })
    .map(terrain => {
      const cfg = TERRAIN_TYPES[terrain] ?? {};
      const visual = TERRAIN_VISUALS[terrain] ?? {};
      const availability = getTransportAvailability(terrain, transportKey);
      return {
        key: terrain,
        label: cfg.label ?? terrain,
        icon: visual.mark ?? cfg.icon ?? "",
        color: visual.color ?? "#777",
        costLabel: availability.label,
        cssClass: availability.cssClass,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "ru"));
}

const LOCAL_MAP_W = 620;
const LOCAL_MAP_H = 390;

const FIRST_SESSION_MAP_ANCHORS = Object.freeze([
  {
    id: "arrival-rivergate",
    label: "Ривергейт: вход",
    stage: "1",
    actorTypes: ["settlement"],
    names: ["Ривергейт"],
    fallback: { col: 5, row: 2 },
    targetLevel: "local",
    hotspotId: "gate",
    roles: ["gate-guard", "quest-patron"],
    detail: "Вход в регион, стража, безопасный старт и первая рамка задания.",
  },
  {
    id: "market-rivergate",
    label: "Рынок и закупка",
    stage: "2",
    actorTypes: ["settlement"],
    names: ["Ривергейт"],
    fallback: { col: 5, row: 2 },
    targetLevel: "local",
    hotspotId: "market",
    roles: ["repair-and-trade", "quest-patron"],
    detail: "Торговля, pending inventory, покупка расходников и первая проверка Tarkov-слота.",
  },
  {
    id: "western-road",
    label: "Западная дорога",
    stage: "3",
    actorTypes: ["poi"],
    names: ["Западная дорога"],
    fallback: { col: 4, row: 3 },
    targetLevel: "encounter",
    hotspotId: "choke",
    roles: ["road-threat", "gate-guard"],
    detail: "Первый боевой контакт, узкий проход, проверка friendly fire и лута.",
  },
  {
    id: "black-bor",
    label: "Чёрный Бор",
    stage: "4",
    actorTypes: ["poi"],
    names: ["Чёрный Бор"],
    fallback: { col: 2, row: 4 },
    targetLevel: "encounter",
    hotspotId: "clearing",
    roles: ["wilderness-contact", "safe-guide"],
    detail: "Дикая местность, следы монстров, лечение после стычки и перенос добычи.",
  },
  {
    id: "deep-seam",
    label: "Глубокий Пласт",
    stage: "5",
    actorTypes: ["poi"],
    names: ["Глубокий Пласт"],
    fallback: { col: 4, row: 4 },
    targetLevel: "encounter",
    hotspotId: "shaft",
    roles: ["arcane-support", "repair-and-trade"],
    detail: "Шахтёрский крючок, броня/ремонт, более опасная эскалация для конца сессии.",
  },
]);

const ACTOR_TYPE_LABELS = Object.freeze({
  settlement: "Поселение",
  poi: "POI",
  merchant: "Торговец",
  npc: "NPC",
  quest: "Квест",
});

function normalizeWorldName(value = "") {
  return String(value ?? "").trim().toLocaleLowerCase("ru");
}

function hasNameMatch(value = "", names = []) {
  const text = normalizeWorldName(value);
  if (!text) return false;
  return names.some(name => {
    const wanted = normalizeWorldName(name);
    return wanted && (text === wanted || text.includes(wanted) || wanted.includes(text));
  });
}

function actorInfo(actor) {
  return actor?.system?.info ?? {};
}

function actorCoord(actor) {
  const info = actorInfo(actor);
  const col = Number(info.mapCol);
  const row = Number(info.mapRow);
  return Number.isFinite(col) && Number.isFinite(row) && col >= 0 && row >= 0 ? { col, row } : null;
}

function coordKey(col, row) {
  return `${Number(col)},${Number(row)}`;
}

function sameCoord(a = {}, b = {}) {
  return Number(a?.col) === Number(b?.col) && Number(a?.row) === Number(b?.row);
}

function allActorsOfType(type) {
  return game.actors?.filter(actor => actor.type === type) ?? [];
}

function findAnchorActor(anchor = {}) {
  const names = anchor.names ?? [];
  for (const type of anchor.actorTypes ?? []) {
    const actor = allActorsOfType(type).find(candidate => hasNameMatch(candidate.name, names));
    if (actor) return actor;
  }
  return null;
}

function findTileByAnchor(tiles = [], anchor = {}, actor = null) {
  const explicit = actorCoord(actor) ?? anchor.fallback ?? null;
  if (explicit) {
    const tile = tiles.find(t => sameCoord(t, explicit));
    if (tile) return tile;
  }
  return tiles.find(t => hasNameMatch(t.label, anchor.names ?? [])) ?? null;
}

function actorPlacementNames(actor = {}) {
  const info = actorInfo(actor);
  return [
    actor.name,
    info.location,
    info.homeLocation,
    info.settlement,
    info.nearestSettlement,
    info.targetSettlement,
    info.targetPOI,
  ].map(value => String(value ?? "").trim()).filter(Boolean);
}

function actorMatchesAnchor(actor, anchor, coord = null) {
  const names = anchor.names ?? [];
  if (hasNameMatch(actor.name, names)) return true;
  if (actorPlacementNames(actor).some(name => hasNameMatch(name, names))) return true;
  const role = String(actorInfo(actor).sceneRole ?? "");
  if (role && (anchor.roles ?? []).includes(role)) return true;
  const aCoord = actorCoord(actor);
  return Boolean(coord && aCoord && sameCoord(aCoord, coord));
}

function buildActorLinkRow(actor, anchor, coord = null) {
  const info = actorInfo(actor);
  const typeLabel = ACTOR_TYPE_LABELS[actor.type] ?? actor.type;
  const role = info.sceneRole || info.specialty || info.questType || info.poiType || info.role || "";
  const placement = actorPlacementNames(actor).find(name => !hasNameMatch(name, [actor.name])) ?? anchor.label;
  return {
    id: actor.id,
    type: actor.type,
    typeLabel,
    name: actor.name,
    role,
    detail: role ? `${role} · ${placement}` : placement,
    tone: actor.type === "quest"
      ? "is-gold"
      : actor.type === "merchant"
        ? "is-active"
        : actor.type === "poi"
          ? dangerTone(Number(info.danger ?? actor.system?.state?.threatLevel ?? 2))
          : "is-safe",
    coordLabel: coord ? coordLabel(coord.col, coord.row) : "",
  };
}

function buildAnchorLinks(anchor, coord = null, anchorActor = null) {
  const actors = [
    ...(anchorActor ? [anchorActor] : []),
    ...getSettlements(),
    ...getPois(),
    ...getMerchants(),
    ...(game.actors?.filter(actor => actor.type === "npc") ?? []),
    ...getQuests(),
  ];
  const seen = new Set();
  return actors
    .filter(Boolean)
    .filter(actor => {
      if (seen.has(actor.id)) return false;
      seen.add(actor.id);
      return actorMatchesAnchor(actor, anchor, coord);
    })
    .map(actor => buildActorLinkRow(actor, anchor, coord))
    .slice(0, 10);
}

function buildFirstSessionMapOverlay(tiles = [], focusTile = null) {
  const anchors = FIRST_SESSION_MAP_ANCHORS.map((anchor, index) => {
    const actor = findAnchorActor(anchor);
    const tile = findTileByAnchor(tiles, anchor, actor);
    const coord = actorCoord(actor) ?? (tile ? { col: tile.col, row: tile.row } : anchor.fallback);
    const links = buildAnchorLinks(anchor, coord, actor);
    const isFocus = Boolean(focusTile && coord && sameCoord(focusTile, coord));
    return {
      ...anchor,
      index: index + 1,
      col: coord?.col ?? "",
      row: coord?.row ?? "",
      coordLabel: coord ? coordLabel(coord.col, coord.row) : "нет координат",
      actorId: actor?.id ?? "",
      actorName: actor?.name ?? "",
      actorFound: Boolean(actor),
      statusLabel: actor ? "actor найден" : "плановый якорь",
      tileLabel: tile?.label ?? "",
      tileTerrain: tile?.terrainLabel ?? tile?.terrain ?? "",
      tone: actor ? "is-active" : "is-warn",
      markerTone: anchor.id.includes("road") || anchor.id.includes("bor") || anchor.id.includes("seam") ? "is-danger" : "is-gold",
      links,
      hasLinks: links.length > 0,
      linkCount: links.length,
      isFocus,
    };
  });

  const focusAnchors = anchors.filter(anchor => anchor.isFocus);
  const focusLinks = focusAnchors.flatMap(anchor => anchor.links);
  const uniqueFocusLinks = Array.from(new Map(focusLinks.map(row => [row.id, row])).values()).slice(0, 12);
  const actorAnchors = anchors.filter(anchor => anchor.actorFound).length;
  return {
    anchors,
    hasAnchors: anchors.length > 0,
    focusAnchors,
    hasFocusAnchors: focusAnchors.length > 0,
    focusLinks: uniqueFocusLinks,
    hasFocusLinks: uniqueFocusLinks.length > 0,
    completion: `${actorAnchors}/${anchors.length}`,
    completionPct: Math.round((actorAnchors / Math.max(1, anchors.length)) * 100),
  };
}

function enrichLocalScaleViewWithSession(localView, sessionOverlay, activeHotspotIdOverride = "") {
  const focusAnchor = sessionOverlay.focusAnchors?.[0] ?? null;
  const activeHotspotId = activeHotspotIdOverride || focusAnchor?.hotspotId || localView.activeHotspot?.id || "";
  const nextHotspots = (localView.hotspots ?? []).map(node => ({
    ...node,
    isActiveHotspot: node.id === activeHotspotId,
    linkedCount: sessionOverlay.focusLinks?.filter(link => {
      if (node.hotspotType === "trade") return link.type === "merchant";
      if (node.hotspotType === "craft") return link.type === "merchant" || link.role === "repair-and-trade";
      if (node.hotspotType === "npc" || node.hotspotType === "social") return link.type === "npc" || link.type === "quest";
      if (node.hotspotType === "danger" || node.hotspotType === "encounter") return link.type === "poi" || link.type === "quest";
      return false;
    }).length ?? 0,
  }));
  const nextNodes = (localView.nodes ?? []).map(node => {
    const enriched = nextHotspots.find(h => h.id === node.id);
    return enriched ? { ...node, ...enriched } : node;
  });
  const activeHotspot = nextHotspots.find(node => node.isActiveHotspot) ?? localView.activeHotspot;
  return {
    ...localView,
    nodes: nextNodes,
    hotspots: nextHotspots,
    activeHotspot,
    hasActiveHotspot: Boolean(activeHotspot),
    sessionAnchors: sessionOverlay.focusAnchors ?? [],
    hasSessionAnchors: Boolean(sessionOverlay.focusAnchors?.length),
    sessionLinks: sessionOverlay.focusLinks ?? [],
    hasSessionLinks: Boolean(sessionOverlay.focusLinks?.length),
  };
}

const TERRAIN_SCENE_PROFILES = {
  town: {
    mood: "market",
    headline: "Городской узел",
    summary: "Улицы, ворота, рынок, ремесленники и безопасные маршруты между районами.",
    pattern: "settlement",
    nodes: [
      { id: "gate", label: "Ворота", kind: "вход", tone: "is-road", x: 88, y: 214 },
      { id: "market", label: "Рынок", kind: "торговля", tone: "is-gold", x: 314, y: 190 },
      { id: "workshops", label: "Мастерские", kind: "ремонт и крафт", tone: "is-active", x: 448, y: 118 },
      { id: "watch", label: "Стража", kind: "закон и слухи", tone: "is-safe", x: 486, y: 280 },
    ],
    zones: [
      { id: "street", label: "Улица", kind: "линия движения", tone: "is-road", x: 70, y: 190, w: 480, h: 48 },
      { id: "market", label: "Площадь", kind: "толпа и укрытия", tone: "is-gold", x: 245, y: 115, w: 155, h: 138 },
      { id: "roofs", label: "Крыши", kind: "высота", tone: "is-warn", x: 390, y: 45, w: 150, h: 80 },
      { id: "alley", label: "Переулок", kind: "засада", tone: "is-danger", x: 112, y: 248, w: 165, h: 72 },
    ],
    tactics: ["Городские сцены должны давать укрытия и короткие линии видимости.", "Friendly fire важен для толпы, конусов и взрывов.", "Торговцы и NPC должны быть рядом с безопасными зонами."],
  },
  village: {
    mood: "hearth",
    headline: "Сельская местность",
    summary: "Дома, огороды, колодец, амбары и открытые подходы с хорошими линиями стрельбы.",
    pattern: "settlement",
    nodes: [
      { id: "well", label: "Колодец", kind: "вода", tone: "is-safe", x: 292, y: 172 },
      { id: "barn", label: "Амбар", kind: "контейнеры", tone: "is-gold", x: 430, y: 230 },
      { id: "green", label: "Площадка", kind: "сбор", tone: "is-active", x: 190, y: 226 },
      { id: "fields", label: "Поля", kind: "выход", tone: "is-road", x: 486, y: 96 },
    ],
    zones: [
      { id: "farmyard", label: "Двор", kind: "открытая зона", tone: "is-road", x: 160, y: 140, w: 285, h: 130 },
      { id: "fences", label: "Заборы", kind: "укрытия", tone: "is-active", x: 96, y: 80, w: 430, h: 44 },
      { id: "barn", label: "Амбар", kind: "добыча", tone: "is-gold", x: 395, y: 215, w: 115, h: 88 },
      { id: "field", label: "Поле", kind: "дальний обзор", tone: "is-warn", x: 58, y: 245, w: 170, h: 82 },
    ],
    tactics: ["Открытые участки хороши для арбалетов и лучников.", "Заборы и амбары дают мягкие укрытия.", "Пожар, паника и животные могут стать вторичными опасностями."],
  },
  mine: {
    mood: "ore",
    headline: "Горная разработка",
    summary: "Шахтные входы, склады руды, балки, вагонетки и узкие опасные проходы.",
    pattern: "mine",
    nodes: [
      { id: "shaft", label: "Штольня", kind: "вход вниз", tone: "is-danger", x: 318, y: 132 },
      { id: "ore", label: "Рудный двор", kind: "материалы", tone: "is-gold", x: 204, y: 246 },
      { id: "lift", label: "Подъемник", kind: "вертикаль", tone: "is-warn", x: 458, y: 226 },
      { id: "barracks", label: "Бытовки", kind: "NPC", tone: "is-active", x: 126, y: 134 },
    ],
    zones: [
      { id: "tunnel", label: "Туннель", kind: "узкая линия", tone: "is-danger", x: 250, y: 88, w: 245, h: 72 },
      { id: "oreyard", label: "Руда", kind: "твердое укрытие", tone: "is-gold", x: 130, y: 215, w: 180, h: 95 },
      { id: "tracks", label: "Рельсы", kind: "опасный проход", tone: "is-warn", x: 82, y: 170, w: 460, h: 34 },
      { id: "supports", label: "Опоры", kind: "ломаемая среда", tone: "is-active", x: 445, y: 190, w: 88, h: 126 },
    ],
    tactics: ["Шахты должны наказывать AoE в узких коридорах.", "Обвалы и дым хорошо работают как hazard.", "Тяжелая броня сильна, но движение и отступление сложнее."],
  },
  ruins: {
    mood: "ruin",
    headline: "Руины",
    summary: "Сломанные стены, внутренний двор, подвалы, старые башни и скрытые проходы.",
    pattern: "ruins",
    nodes: [
      { id: "courtyard", label: "Двор", kind: "центр", tone: "is-road", x: 294, y: 196 },
      { id: "tower", label: "Башня", kind: "высота", tone: "is-warn", x: 432, y: 94 },
      { id: "cellar", label: "Подвал", kind: "секрет", tone: "is-danger", x: 164, y: 268 },
      { id: "breach", label: "Пролом", kind: "вход", tone: "is-active", x: 112, y: 142 },
    ],
    zones: [
      { id: "wall", label: "Стены", kind: "укрытия", tone: "is-active", x: 92, y: 88, w: 438, h: 56 },
      { id: "courtyard", label: "Двор", kind: "открыто", tone: "is-road", x: 215, y: 150, w: 205, h: 135 },
      { id: "cellar", label: "Подвал", kind: "опасность", tone: "is-danger", x: 112, y: 242, w: 160, h: 88 },
      { id: "relic", label: "Реликт", kind: "добыча", tone: "is-gold", x: 410, y: 220, w: 120, h: 78 },
    ],
    tactics: ["Разрушенные стены дают частичные укрытия и окна для прицельных атак.", "Скрытые подвалы подходят для засад и ловушек.", "AoE должен учитывать препятствия и углы."],
  },
  dungeon: {
    mood: "dark",
    headline: "Подземелье",
    summary: "Входная камера, узкие коридоры, логово, ловушки и ограниченная видимость.",
    pattern: "dungeon",
    nodes: [
      { id: "entrance", label: "Вход", kind: "точка входа", tone: "is-road", x: 100, y: 205 },
      { id: "choke", label: "Перешеек", kind: "узкое место", tone: "is-warn", x: 266, y: 198 },
      { id: "lair", label: "Логово", kind: "угроза", tone: "is-danger", x: 444, y: 146 },
      { id: "cache", label: "Тайник", kind: "добыча", tone: "is-gold", x: 472, y: 272 },
    ],
    zones: [
      { id: "entry", label: "Вход", kind: "построение", tone: "is-road", x: 70, y: 172, w: 135, h: 82 },
      { id: "corridor", label: "Коридор", kind: "choke", tone: "is-warn", x: 210, y: 185, w: 190, h: 38 },
      { id: "lair", label: "Логово", kind: "главная угроза", tone: "is-danger", x: 398, y: 92, w: 146, h: 136 },
      { id: "cache", label: "Тайник", kind: "контейнер", tone: "is-gold", x: 412, y: 246, w: 112, h: 76 },
    ],
    tactics: ["В подземельях особенно важны choke points и friendly fire.", "Конусы, линии и взрывы должны проверяться по каждой цели.", "Свет, шум и узкие проходы должны влиять на засаду."],
  },
  forest: {
    mood: "green",
    headline: "Лесная чаща",
    summary: "Тропы, поляны, бурелом, охотничьи стоянки и скрытые линии подхода.",
    pattern: "forest",
    nodes: [
      { id: "trail", label: "Тропа", kind: "маршрут", tone: "is-road", x: 160, y: 232 },
      { id: "clearing", label: "Поляна", kind: "центр", tone: "is-active", x: 326, y: 178 },
      { id: "thicket", label: "Чаща", kind: "скрытность", tone: "is-warn", x: 456, y: 104 },
      { id: "camp", label: "Стоянка", kind: "привал", tone: "is-gold", x: 430, y: 278 },
    ],
    zones: [
      { id: "trail", label: "Тропа", kind: "движение", tone: "is-road", x: 95, y: 214, w: 420, h: 42 },
      { id: "trees", label: "Деревья", kind: "укрытия", tone: "is-active", x: 96, y: 62, w: 165, h: 116 },
      { id: "thicket", label: "Чаща", kind: "замедление", tone: "is-warn", x: 382, y: 70, w: 154, h: 118 },
      { id: "clearing", label: "Поляна", kind: "открыто", tone: "is-danger", x: 255, y: 152, w: 150, h: 120 },
    ],
    tactics: ["Лес должен давать много мягких укрытий и скрытных подходов.", "Дальние атаки сильны на полянах, но хуже через чащу.", "Огонь и дым могут быстро менять сцену."],
  },
  swamp: {
    mood: "swamp",
    headline: "Болотная зона",
    summary: "Топи, кочки, настилы, туман, ядовитые растения и плохая видимость.",
    pattern: "swamp",
    nodes: [
      { id: "causeway", label: "Настил", kind: "безопасный путь", tone: "is-road", x: 180, y: 210 },
      { id: "bog", label: "Топь", kind: "hazard", tone: "is-danger", x: 378, y: 194 },
      { id: "reeds", label: "Камыш", kind: "скрытность", tone: "is-warn", x: 464, y: 94 },
      { id: "hut", label: "Хижина", kind: "NPC", tone: "is-gold", x: 112, y: 116 },
    ],
    zones: [
      { id: "causeway", label: "Настил", kind: "узкий путь", tone: "is-road", x: 95, y: 198, w: 360, h: 42 },
      { id: "bog", label: "Топь", kind: "замедление", tone: "is-danger", x: 315, y: 145, w: 170, h: 120 },
      { id: "mist", label: "Туман", kind: "видимость", tone: "is-warn", x: 120, y: 72, w: 280, h: 88 },
      { id: "hut", label: "Хижина", kind: "цель", tone: "is-gold", x: 80, y: 238, w: 116, h: 78 },
    ],
    tactics: ["Болото должно давать штрафы движения и опасные клетки.", "Яд, болезнь и усталость здесь уместны.", "AoE в тумане должен требовать осторожности с союзниками."],
  },
  pass: {
    mood: "stone",
    headline: "Горный перевал",
    summary: "Серпантин, обрывы, камнепады, узкие мосты и сильные позиции сверху.",
    pattern: "pass",
    nodes: [
      { id: "lower", label: "Нижняя тропа", kind: "вход", tone: "is-road", x: 112, y: 270 },
      { id: "bridge", label: "Мост", kind: "choke", tone: "is-warn", x: 300, y: 194 },
      { id: "ridge", label: "Гребень", kind: "высота", tone: "is-danger", x: 444, y: 92 },
      { id: "camp", label: "Карман", kind: "привал", tone: "is-gold", x: 430, y: 272 },
    ],
    zones: [
      { id: "trail", label: "Серпантин", kind: "узкий путь", tone: "is-road", x: 95, y: 225, w: 430, h: 45 },
      { id: "bridge", label: "Мост", kind: "choke", tone: "is-warn", x: 245, y: 172, w: 140, h: 44 },
      { id: "cliff", label: "Обрыв", kind: "смертельно", tone: "is-danger", x: 390, y: 55, w: 150, h: 120 },
      { id: "rocks", label: "Камни", kind: "укрытия", tone: "is-active", x: 92, y: 92, w: 150, h: 94 },
    ],
    tactics: ["Перевалы должны давать вертикальность и риск падения.", "Узкие проходы усиливают щиты и тяжелую броню.", "Камнепад хорош как telegraphed hazard."],
  },
};

const DEFAULT_SCENE_PROFILE = {
  mood: "wild",
  headline: "Дикая местность",
  summary: "Открытый участок, тропы, естественные укрытия и несколько направлений подхода.",
  pattern: "wild",
  nodes: [
    { id: "trail", label: "Тропа", kind: "маршрут", tone: "is-road", x: 150, y: 226 },
    { id: "camp", label: "Привал", kind: "безопасная точка", tone: "is-gold", x: 430, y: 248 },
    { id: "cover", label: "Укрытия", kind: "камни и кусты", tone: "is-active", x: 308, y: 150 },
    { id: "overlook", label: "Обзор", kind: "позиция", tone: "is-warn", x: 470, y: 100 },
  ],
  zones: [
    { id: "approach", label: "Подход", kind: "вход", tone: "is-road", x: 80, y: 210, w: 185, h: 58 },
    { id: "cover", label: "Укрытия", kind: "камни/кусты", tone: "is-active", x: 260, y: 135, w: 160, h: 112 },
    { id: "open", label: "Открыто", kind: "опасная зона", tone: "is-danger", x: 420, y: 160, w: 120, h: 132 },
    { id: "cache", label: "Тайник", kind: "добыча", tone: "is-gold", x: 120, y: 86, w: 120, h: 74 },
  ],
  tactics: ["Сцена должна иметь минимум два входа и один путь отхода.", "Укрытия нужны до первого теста дальнего боя.", "Опасные зоны лучше делать читаемыми до броска."],
};

const TERRAIN_SCENE_ALIASES = {
  mountains: "pass",
  hills: "pass",
  river: "swamp",
  road: "village",
  plains: "forest",
};

function getSceneProfile(tile = {}) {
  const terrain = tile?.terrain;
  return TERRAIN_SCENE_PROFILES[terrain]
    ?? TERRAIN_SCENE_PROFILES[TERRAIN_SCENE_ALIASES[terrain]]
    ?? DEFAULT_SCENE_PROFILE;
}

function offsetPosition(dx, dy) {
  if (dx === 0 && dy < 0) return { x: 310, y: 26, edge: "north" };
  if (dx === 0 && dy > 0) return { x: 310, y: 354, edge: "south" };
  if (dx < 0 && dy === 0) return { x: 42, y: 195, edge: "west" };
  if (dx > 0 && dy === 0) return { x: 578, y: 195, edge: "east" };
  if (dx < 0 && dy < 0) return { x: 92, y: 64, edge: "northwest" };
  if (dx > 0 && dy < 0) return { x: 528, y: 64, edge: "northeast" };
  if (dx < 0 && dy > 0) return { x: 92, y: 326, edge: "southwest" };
  return { x: 528, y: 326, edge: "southeast" };
}

function buildNearbyExitNodes(focusTile, tiles = []) {
  const focusCol = asNumber(focusTile?.col, 0);
  const focusRow = asNumber(focusTile?.row, 0);
  const neighbors = tiles
    .filter(t => Math.abs(asNumber(t.col, 999) - focusCol) <= 1 && Math.abs(asNumber(t.row, 999) - focusRow) <= 1)
    .filter(t => !(asNumber(t.col) === focusCol && asNumber(t.row) === focusRow))
    .map(t => {
      const dx = asNumber(t.col) - focusCol;
      const dy = asNumber(t.row) - focusRow;
      const pos = offsetPosition(dx, dy);
      const terrain = TERRAIN_TYPES[t.terrain] ?? {};
      const visual = TERRAIN_VISUALS[t.terrain] ?? {};
      const label = t.label || terrain.label || "Выход";
      return {
        id: `exit-${t.col}-${t.row}`,
        label,
        kind: `выход ${coordLabel(t.col, t.row)}`,
        tone: t.poi ? "is-gold" : dangerTone(getTileDanger(t)),
        x: pos.x,
        y: pos.y,
        icon: visual.mark ?? terrain.icon ?? "•",
        routeCol: t.col,
        routeRow: t.row,
        hasRoute: true,
      };
    });
  return neighbors.slice(0, 8);
}

const LOCAL_HOTSPOT_BLUEPRINTS = Object.freeze({
  gate: { type: "transition", npcRole: "guard", detail: "Главный вход в поселение: проверка, новости дороги, первый контакт со стражей." },
  market: { type: "trade", npcRole: "merchant", detail: "Торговая точка: базовый торговец, слухи, мелкие заказы и обмен добычи." },
  workshops: { type: "craft", npcRole: "crafter", detail: "Мастерские: ремонт, заказ предметов, оценка материалов и броня/оружие региона." },
  watch: { type: "npc", npcRole: "guard", detail: "Стража или дозор: закон, награды за угрозы, безопасное начало расследований." },
  well: { type: "social", npcRole: "villager", detail: "Сельский центр: жители, свежие слухи, бытовые проблемы и мягкие квесты." },
  barn: { type: "loot", npcRole: "villager", detail: "Амбар или склад: контейнеры, припасы, следы кражи, место для мирного обыска." },
  green: { type: "npc", npcRole: "villager", detail: "Площадка сбора: староста, свидетели, крестьяне и первые социальные проверки." },
  fields: { type: "transition", npcRole: "hunter", detail: "Выход к полям: переход к охоте, засаде, следам монстров или открытому бою." },
  shaft: { type: "danger", npcRole: "guard", detail: "Вход в шахту: контроль доступа, обвалы, проверка снаряжения и опасный спуск." },
  ore: { type: "loot", npcRole: "crafter", detail: "Рудный двор: материалы, вагонетки, спор за груз, контейнеры и добыча." },
  lift: { type: "transition", npcRole: "guard", detail: "Подъёмник: вертикальный переход, аварийная сцена, ограниченное отступление." },
  barracks: { type: "npc", npcRole: "guard", detail: "Бытовки: шахтёры, охрана, усталые NPC и локальные конфликты." },
  courtyard: { type: "encounter", npcRole: "bandit", detail: "Центральная зона: обзор, переговоры или начало боя." },
  tower: { type: "danger", npcRole: "mage", detail: "Высота: засадная позиция, сигнальный огонь, магический след или наблюдатель." },
  cellar: { type: "loot", npcRole: "bandit", detail: "Подвал: тайник, ловушка, закрытая дверь и повод перейти в тесную сцену." },
  breach: { type: "transition", npcRole: "hunter", detail: "Пролом: альтернативный вход/выход, скрытый подход или путь отхода." },
  entrance: { type: "transition", npcRole: "guard", detail: "Вход в опасную область: стартовая позиция, порядок группы, источник шума." },
  choke: { type: "danger", npcRole: "bandit", detail: "Узкое место: choke point для щитов, AoE и friendly fire." },
  lair: { type: "danger", npcRole: "bandit", detail: "Логово угрозы: основная враждебная группа или мини-босс сцены." },
  cache: { type: "loot", npcRole: "villager", detail: "Тайник: контейнер, награда, следы прежних владельцев." },
  trail: { type: "transition", npcRole: "hunter", detail: "Тропа: вход/выход, следы, быстрый переход к соседним тайлам." },
  clearing: { type: "encounter", npcRole: "hunter", detail: "Поляна: открытая сцена, переговоры, стрельба и видимые подходы." },
  thicket: { type: "danger", npcRole: "bandit", detail: "Чаща: скрытность, засада, ловушки или следы монстра." },
  camp: { type: "npc", npcRole: "hunter", detail: "Стоянка: дружественный контакт, привал, торговля мелочами или ночная угроза." },
  causeway: { type: "transition", npcRole: "villager", detail: "Настил: безопасная линия движения через опасную местность." },
  bog: { type: "danger", npcRole: "hunter", detail: "Топь: hazard, замедление, проверка атлетики и спасение снаряжения." },
  reeds: { type: "danger", npcRole: "bandit", detail: "Камыш: плохая видимость, скрытые цели и риск friendly fire." },
  hut: { type: "npc", npcRole: "priest", detail: "Хижина: знахарь, отшельник, лечение, слухи и странные просьбы." },
  lower: { type: "transition", npcRole: "guard", detail: "Нижняя тропа: точка входа, караван, проверка погоды." },
  bridge: { type: "danger", npcRole: "guard", detail: "Мост: узкое место, контроль прохода, риск падения." },
  ridge: { type: "danger", npcRole: "bandit", detail: "Гребень: высота, засада, стрелки или наблюдатель." },
});

const HOTSPOT_TYPE_LABELS = Object.freeze({
  transition: "Переход",
  trade: "Торговля",
  craft: "Мастерская",
  social: "Социалка",
  npc: "NPC",
  loot: "Лут",
  danger: "Опасность",
  encounter: "Сцена",
  exit: "Выход",
});

function inferHotspotType(node = {}) {
  if (node.tone === "is-danger" || node.tone === "is-warn") return "danger";
  if (node.tone === "is-gold") return "loot";
  if (node.tone === "is-road") return "transition";
  return "encounter";
}

function decorateLocalHotspotNode(node, focusTile, index, activeHotspotId = "") {
  const blueprint = LOCAL_HOTSPOT_BLUEPRINTS[node.id] ?? {};
  const hotspotType = blueprint.type ?? inferHotspotType(node);
  const npcRole = blueprint.npcRole ?? "";
  const terrainLabel = TERRAIN_TYPES[focusTile?.terrain]?.label ?? focusTile?.terrain ?? "местность";
  const detail = blueprint.detail ?? `${node.label}: ${node.kind}. Используй как сцену уровня ${terrainLabel}.`;
  return {
    ...node,
    icon: node.icon ?? "•",
    hasRoute: false,
    hasHotspot: true,
    hotspotAction: "encounter",
    hotspotType,
    hotspotTypeLabel: HOTSPOT_TYPE_LABELS[hotspotType] ?? "Сцена",
    npcRole,
    detail,
    isActiveHotspot: activeHotspotId ? node.id === activeHotspotId : index === 0,
  };
}

function decorateLocalExitNode(node) {
  return {
    ...node,
    hasHotspot: true,
    hotspotAction: "route",
    hotspotType: "exit",
    hotspotTypeLabel: HOTSPOT_TYPE_LABELS.exit,
    npcRole: "",
    detail: `Переход на региональный тайл ${node.label}.`,
  };
}

function decorateEncounterZone(zone, focusTile, activeHotspot, index) {
  const type = zone.tone === "is-danger"
    ? "danger"
    : zone.tone === "is-gold"
      ? "loot"
      : zone.tone === "is-road"
        ? "transition"
        : "encounter";
  const inheritedRole = activeHotspot?.npcRole ?? "";
  const inheritedDetail = activeHotspot?.detail ? `${activeHotspot.detail} ` : "";
  return {
    ...zone,
    index: index + 1,
    hasHotspot: true,
    hotspotType: type,
    hotspotTypeLabel: HOTSPOT_TYPE_LABELS[type] ?? "Сцена",
    npcRole: zone.npcRole ?? inheritedRole,
    detail: zone.detail ?? `${inheritedDetail}${zone.label}: ${zone.kind}.`,
    isActiveHotspot: activeHotspot?.id && (zone.id === activeHotspot.id || index === 0),
    focusLabel: focusTile?.label ?? "",
  };
}

function buildLocalScaleView(focusTile, tiles = [], activeHotspotId = "") {
  const profile = getSceneProfile(focusTile);
  const terrain = TERRAIN_TYPES[focusTile?.terrain] ?? {};
  const visual = TERRAIN_VISUALS[focusTile?.terrain] ?? {};
  const coreNodes = (profile.nodes ?? []).map((node, index) =>
    decorateLocalHotspotNode(
      { ...node, icon: node.icon ?? visual.mark ?? terrain.icon ?? "•" },
      focusTile,
      index,
      activeHotspotId
    )
  );
  const exits = buildNearbyExitNodes(focusTile, tiles).map(decorateLocalExitNode);
  const activeHotspot = coreNodes.find(node => node.isActiveHotspot) ?? coreNodes[0] ?? null;
  const danger = getTileDanger(focusTile);
  return {
    width: LOCAL_MAP_W,
    height: LOCAL_MAP_H,
    profile: profile.pattern,
    mood: profile.mood,
    terrainClass: visual.className ?? `terrain-${focusTile?.terrain ?? "plains"}`,
    dangerTone: dangerTone(danger),
    focusName: focusTile?.label || terrain.label || "Местность",
    focusCoord: coordLabel(focusTile?.col, focusTile?.row),
    terrainLabel: terrain.label ?? focusTile?.terrain ?? "",
    headline: profile.headline,
    summary: profile.summary,
    danger,
    hasScene: Boolean(focusTile?.sceneId),
    nodes: [...coreNodes, ...exits],
    hasNodes: coreNodes.length + exits.length > 0,
    hotspots: coreNodes,
    hasHotspots: coreNodes.length > 0,
    activeHotspot,
    hasActiveHotspot: Boolean(activeHotspot),
    exits,
    hasExits: exits.length > 0,
  };
}

function buildEncounterScaleView(focusTile, activeHotspot = null) {
  const profile = getSceneProfile(focusTile);
  const terrain = TERRAIN_TYPES[focusTile?.terrain] ?? {};
  const visual = TERRAIN_VISUALS[focusTile?.terrain] ?? {};
  const danger = getTileDanger(focusTile);
  const zones = (profile.zones ?? DEFAULT_SCENE_PROFILE.zones).map((zone, index) =>
    decorateEncounterZone(zone, focusTile, activeHotspot, index)
  );
  return {
    width: LOCAL_MAP_W,
    height: LOCAL_MAP_H,
    profile: profile.pattern,
    mood: profile.mood,
    terrainClass: visual.className ?? `terrain-${focusTile?.terrain ?? "plains"}`,
    dangerTone: dangerTone(danger),
    focusName: focusTile?.label || terrain.label || "Сцена",
    focusCoord: coordLabel(focusTile?.col, focusTile?.row),
    terrainLabel: terrain.label ?? focusTile?.terrain ?? "",
    headline: profile.headline,
    summary: profile.summary,
    danger,
    activeHotspot,
    hasActiveHotspot: Boolean(activeHotspot),
    zones,
    hasZones: zones.length > 0,
    tactics: profile.tactics ?? DEFAULT_SCENE_PROFILE.tactics,
    hasTactics: Boolean((profile.tactics ?? DEFAULT_SCENE_PROFILE.tactics)?.length),
    checkRows: [
      { label: "Входы", value: "2+", tone: "is-road" },
      { label: "Укрытия", value: "обяз.", tone: "is-active" },
      { label: "Hazards", value: danger >= 3 ? "да" : "опц.", tone: danger >= 3 ? "is-danger" : "is-warn" },
      { label: "Friendly fire", value: "по типу атаки", tone: "is-gold" },
    ],
  };
}

// ─── A* поиск пути ───────────────────────────────────────

function astar(tiles, cols, rows, startCol, startRow, endCol, endRow, transport) {
  const tKey   = (c, r) => `${c},${r}`;
  const tIndex = (c, r) => r * cols + c;
  const transportCfg = TRANSPORT_TYPES[transport] ?? {};
  const blocked = transportCfg.blocked ?? transportCfg.restrictions ?? [];
  const onlyOn  = transportCfg.onlyOn  ?? null;
  const speedMult = transportCfg.speedMult ?? (transportCfg.speed ? 1 / Number(transportCfg.speed) : 1);

  const tileMap = {};
  for (const t of tiles) tileMap[tKey(t.col, t.row)] = t;

  const getCost = (col, row) => {
    const t = tileMap[tKey(col, row)];
    // Если тайл не определён — считаем проходимым (plains)
    if (!t) {
      if (onlyOn || transportCfg.requiresDock) return Infinity; // лодка требует воду
      return 1 * speedMult;
    }
    const terrain = TERRAIN_TYPES[t.terrain];
    if (!terrain) return 1 * speedMult;
    if (blocked.includes(t.terrain)) return Infinity;
    if (onlyOn && !onlyOn.includes(t.terrain)) return Infinity;
    if (transportCfg.requiresDock && !terrain.canDock) return Infinity;
    return (terrain.costHours ?? terrain.moveCost ?? 1) * speedMult;
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
    this._mapLevel    = "region";   // global -> region -> local -> encounter
    this._activeHotspotId = null;   // local hotspot currently projected into encounter view
    this._situationSeed = 1;
    if (options?.initialFocus || options?.focus) {
      this.setMapFocus(options.initialFocus ?? options.focus, { render: false });
    }
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

  _getMapLevel() {
    return canonicalWorldMapLevel(this._mapLevel);
  }

  _getMapLevels() {
    const active = this._getMapLevel();
    return WORLD_MAP_LEVEL_ORDER.map((id, index) => {
      const cfg = WORLD_MAP_LEVELS[id];
      return {
        ...cfg,
        index: index + 1,
        isActive: id === active,
        isRegion: id === "region",
      };
    });
  }

  _buildScaleNodes(region, tiles, groupCol, groupRow) {
    const level = this._getMapLevel();
    if (level === "global") return WORLD_MAP_STAGE_NODES.global ?? [];
    if (level === "encounter") {
      const current = (region.tiles ?? []).find(t => t.col === groupCol && t.row === groupRow);
      const terrain = TERRAIN_TYPES[current?.terrain] ?? {};
      return [
        {
          id: "current_tile",
          label: current?.label || "Текущая клетка",
          kind: terrain.label || current?.terrain || "местность",
          tone: "is-active",
        },
        ...(WORLD_MAP_STAGE_NODES.encounter ?? []),
      ];
    }

    if (level === "local") {
      return tiles
        .filter(t => t.isPoi || t.label)
        .slice(0, 12)
        .map(t => ({
          id: `${t.col}_${t.row}`,
          label: t.label || t.terrainLabel,
          kind: `${t.terrainLabel} · [${t.col},${t.row}]`,
          tone: t.hasGroup ? "is-active" : t.terrain === "dungeon" ? "is-danger" : t.terrain === "road" ? "is-road" : "",
        }));
    }

    return [];
  }

  async getData() {
    const region  = this._getRegion();
    const groups  = getPartyGroups();
    const { group, col: groupCol, row: groupRow } = this._getGroupPosition();
    const transport = TRANSPORT_TYPES[this._transport];

    // Подготавливаем тайлы для шаблона
    const routePath = this._route?.path ?? [];
    const routeSet = new Set(routePath.map(p => `${p.col},${p.row}`));
    const routeIndexByKey = new Map(routePath.map((p, idx) => [`${p.col},${p.row}`, idx]));

    let tiles = (region?.tiles ?? []).map(t => {
      const terrain  = TERRAIN_TYPES[t.terrain] ?? {};
      const visual   = TERRAIN_VISUALS[t.terrain] ?? {};
      const isGroup  = t.col === groupCol && t.row === groupRow;
      const isTarget = this._target && t.col === this._target.col && t.row === this._target.row;
      const inRoute  = routeSet.has(`${t.col},${t.row}`);
      const isStart  = inRoute && t.col === groupCol && t.row === groupRow;
      const isEnd    = inRoute && isTarget;
      const routeIndex = routeIndexByKey.get(`${t.col},${t.row}`);

      return {
        ...t,
        terrainLabel: terrain.label ?? t.terrain,
        terrainIcon:  visual.mark ?? terrain.icon ?? "?",
        terrainColor: visual.color ?? terrain.color ?? "#444",
        terrainClass: visual.className ?? `terrain-${t.terrain}`,
        costHours:    terrain.costHours ?? terrain.moveCost ?? 1,
        travelCost:   getTerrainCostHours(t.terrain, this._transport),
        danger:       getTileDanger(t),
        dangerTone:   dangerTone(getTileDanger(t)),
        coordLabel:   coordLabel(t.col, t.row),
        poiMeta:      getPoiMeta(t),
        hasGroup:     isGroup,
        isTarget,
        inRoute,
        isStart,
        isEnd,
        routeIndex,
        routeStepLabel: routeIndex === undefined
          ? ""
          : isStart ? "S" : isEnd ? "X" : String(routeIndex),
        hasRouteStep: routeIndex !== undefined,
        isManual: this._manualMode && this._manualPath.some(p => p.col === t.col && p.row === t.row),
        isPoi:        !!t.poi,
        x:            t.col * TILE_PX,
        y:            t.row * TILE_PX,
        size:         TILE_PX,
      };
    });

    const currentTile = tiles.find(t => t.col === groupCol && t.row === groupRow)
      ?? { label: group?.location || "Текущая позиция", terrainLabel: "местность", coordLabel: coordLabel(groupCol, groupRow), danger: 1, dangerTone: "is-safe" };
    const targetTile = this._target
      ? tiles.find(t => t.col === this._target.col && t.row === this._target.row)
      : null;
    const focusTile = targetTile ?? currentTile;
    const sessionMap = buildFirstSessionMapOverlay(tiles, focusTile);
    const sessionAnchorsByCoord = new Map();
    for (const anchor of sessionMap.anchors) {
      if (Number.isFinite(Number(anchor.col)) && Number.isFinite(Number(anchor.row))) {
        const key = coordKey(anchor.col, anchor.row);
        const list = sessionAnchorsByCoord.get(key) ?? [];
        list.push(anchor);
        sessionAnchorsByCoord.set(key, list);
      }
    }
    tiles = tiles.map(tile => {
      const anchors = sessionAnchorsByCoord.get(coordKey(tile.col, tile.row)) ?? [];
      return {
        ...tile,
        sessionAnchors: anchors,
        hasSessionAnchor: anchors.length > 0,
        sessionAnchorIndex: anchors.map(anchor => anchor.stage).join("/"),
        sessionAnchorLabel: anchors.map(anchor => anchor.label).join(" · "),
      };
    });

    // Маршрут для показа
    let routeInfo = null;
    let routeTone = "is-idle";
    if (this._route?.found && this._target) {
      const hours   = this._route.totalHours;
      const dangerAverage = round1(
        (this._route.path ?? []).reduce((sum, step) => {
          const tile = tiles.find(t => t.col === step.col && t.row === step.row) ?? step.tile ?? step;
          return sum + getTileDanger(tile);
        }, 0) / Math.max(1, this._route.path.length)
      );
      routeTone = dangerAverage >= 3 ? "is-warn" : "is-good";
      routeInfo = {
        found:         true,
        totalHours:    round1(hours),
        totalDays:     round1(hours / 24),
        stepsCount:    this._route.path.length - 1,
        targetLabel:   tiles.find(t => t.isTarget)?.label || "Цель",
        targetCoord:   this._target ? coordLabel(this._target.col, this._target.row) : "",
        targetTerrain: targetTile?.terrainLabel ?? "",
        dangerAverage,
        dangerLabel:   dangerAverage >= 3 ? "опасный путь" : "обычный риск",
        routeTone,
        transportLabel: transport?.label ?? this._transport,
      };
    } else if (this._target) {
      routeInfo = { found: false, blocked: true };
      routeTone = "is-blocked";
    }

    // POI из акторов - накладываем на карту
    const tilePoiMarkers = tiles
      .filter(t => t.isPoi)
      .map(t => ({
        id: `tile-${t.col}-${t.row}`,
        name: t.label || t.terrainLabel,
        type: t.poiMeta?.type ?? t.terrain,
        tier: t.poiMeta?.tier ?? 1,
        col: t.col,
        row: t.row,
        icon: { settlement:"■", mine:"◈", ruins:"▥", dungeon:"◆", pass:"◇", poi:"✦", town:"■", village:"□" }[t.poiMeta?.type ?? t.terrain] ?? t.terrainIcon ?? "✦",
        danger: t.danger,
        status: t.discovered === false ? "undiscovered" : "",
        cssClass: `${t.dangerTone} ${t.discovered === false ? "is-hidden" : ""}`,
        hasActor: false,
        x: t.col * TILE_PX + TILE_PX / 2,
        y: t.row * TILE_PX + TILE_PX * 0.72,
      }));
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
      cssClass: dangerTone(Number(a.system.state?.threatLevel ?? a.system.info?.danger ?? 3)),
      hasActor: true,
      x:     Number(a.system.info?.mapCol ?? -1) * TILE_PX + TILE_PX / 2,
      y:     Number(a.system.info?.mapRow ?? -1) * TILE_PX + TILE_PX * 0.72,
    })).filter(p => p.col >= 0 && p.row >= 0);

    const allPoiMarkers = [...tilePoiMarkers, ...poiMarkers];
    const routePreview = buildRoutePreview(this._route, region, this._transport);
    const routeTerrainBreakdown = buildRouteTerrainBreakdown(this._route, region, this._transport);
    const terrainLegend = buildTerrainLegend(tiles, this._transport);
    const routeLine = buildRouteLine(this._route?.path ?? []);

    const mapLevels = this._getMapLevels();
    const activeMapLevel = WORLD_MAP_LEVELS[this._getMapLevel()] ?? WORLD_MAP_LEVELS.region;
    const activeMapLevelId = activeMapLevel.id;
    const scaleNodes = this._buildScaleNodes(region, tiles, groupCol, groupRow);
    const localView = enrichLocalScaleViewWithSession(
      buildLocalScaleView(focusTile, tiles, this._activeHotspotId),
      sessionMap,
      this._activeHotspotId
    );
    const encounterView = {
      ...buildEncounterScaleView(focusTile, localView.activeHotspot),
      sessionLinks: sessionMap.focusLinks ?? [],
      hasSessionLinks: Boolean(sessionMap.focusLinks?.length),
    };
    const mapJourney = buildWorldMapNavigationModel({
      activeLevelId: activeMapLevelId,
      region,
      currentTile,
      targetTile,
      focusTile,
      activeHotspot: localView.activeHotspot,
      sessionMap,
    });
    const sceneBrief = buildWorldMapSceneBrief({
      activeLevelId: activeMapLevelId,
      focusTile,
      localView,
      encounterView,
      sessionMap,
      mapJourney,
      situationSeed: this._situationSeed,
    });
    const mapBackdrop = resolveWorldMapBackdrop(activeMapLevelId, focusTile);
    const localBackdrop = resolveWorldMapBackdrop("local", focusTile);
    const encounterBackdrop = resolveWorldMapBackdrop("encounter", focusTile);
    const discoveredPoiCount = tiles.filter(t => t.isPoi && t.discovered !== false).length;
    const hiddenPoiCount = tiles.filter(t => t.isPoi && t.discovered === false).length;
    const mapSummary = {
      currentLabel: currentTile.label || currentTile.terrainLabel || group?.location || "Текущая позиция",
      currentCoord: currentTile.coordLabel ?? coordLabel(groupCol, groupRow),
      currentTerrain: currentTile.terrainLabel ?? "",
      currentDanger: currentTile.danger ?? 1,
      currentDangerTone: currentTile.dangerTone ?? "is-safe",
      targetLabel: targetTile?.label || targetTile?.terrainLabel || "",
      targetCoord: targetTile?.coordLabel ?? "",
      targetDanger: targetTile?.danger ?? 0,
      targetDangerTone: targetTile?.dangerTone ?? "",
      discoveredPoiCount,
      hiddenPoiCount,
      routeTone,
      hasRoutePreview: routePreview.length > 0,
      routePreviewMore: Math.max(0, (this._route?.path?.length ?? 0) - routePreview.length),
    };

    return {
      region: { ...region, tiles },
      poiMarkers: allPoiMarkers,
      hasPoiMarkers: allPoiMarkers.length > 0,
      currentTile,
      targetTile,
      focusTile,
      mapSummary,
      sessionMap,
      hasSessionMap: sessionMap.hasAnchors,
      terrainLegend,
      routePreview,
      routeTerrainBreakdown,
      hasRoutePreview: routePreview.length > 0,
      hasRouteTerrainBreakdown: routeTerrainBreakdown.length > 0,
      routeLine,
      hasRouteLine: Boolean(routeLine),
      mapLevels,
      activeMapLevel,
      activeMapLevelId,
      isRegionLevel: activeMapLevelId === "region",
      isGlobalLevel: activeMapLevelId === "global",
      isLocalLevel: activeMapLevelId === "local",
      isEncounterLevel: activeMapLevelId === "encounter",
      mapJourney,
      hasMapJourney: Boolean(mapJourney?.hasCrumbs),
      sceneBrief,
      hasSceneBrief: Boolean(sceneBrief?.hasBrief),
      scaleNodes,
      hasScaleNodes: scaleNodes.length > 0,
      localView,
      encounterView,
      mapBackdrop,
      localBackdrop,
      encounterBackdrop,
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
      const actor = game.actors?.get(poiId);
      if (actor) {
        actor.sheet?.render(true);
        return;
      }
      const col = parseInt(e.currentTarget.dataset.col);
      const row = parseInt(e.currentTarget.dataset.row);
      if (Number.isFinite(col) && Number.isFinite(row)) this._buildRouteTo(col, row);
    });

    html.on("click", "[data-session-anchor]", e => {
      e.preventDefault();
      e.stopPropagation();
      const col = parseInt(e.currentTarget.dataset.sessionCol);
      const row = parseInt(e.currentTarget.dataset.sessionRow);
      const level = canonicalWorldMapLevel(e.currentTarget.dataset.sessionLevel || "local");
      this._activeHotspotId = e.currentTarget.dataset.sessionHotspot || null;
      this._mapLevel = level;
      if (Number.isFinite(col) && Number.isFinite(row)) this._buildRouteTo(col, row);
      else this.render(false);
    });

    html.on("click", "[data-session-actor-id]", e => {
      e.preventDefault();
      e.stopPropagation();
      const actor = game.actors?.get(e.currentTarget.dataset.sessionActorId);
      if (actor) actor.sheet?.render(true);
    });

    html.find("[data-map-level]").on("click", e => {
      const level = e.currentTarget.dataset.mapLevel;
      if (!WORLD_MAP_LEVELS[level]) return;
      this.setMapFocus({ level }, { render: true, keepTarget: true });
    });

    html.on("click", "[data-map-focus-level]", e => {
      e.preventDefault();
      e.stopPropagation();
      this.setMapFocus({
        level: e.currentTarget.dataset.mapFocusLevel,
        col: e.currentTarget.dataset.mapFocusCol,
        row: e.currentTarget.dataset.mapFocusRow,
        hotspotId: e.currentTarget.dataset.mapFocusHotspot,
      });
    });

    html.on("click", "[data-map-nav-action]", e => {
      e.preventDefault();
      e.stopPropagation();
      const action = e.currentTarget.dataset.mapNavAction ?? "focus";
      if (action === "combat-director") {
        if (game.ironHills?.openCombatDirector) game.ironHills.openCombatDirector();
        else ui.notifications?.warn?.("Combat Director недоступен.");
        return;
      }
      this.setMapFocus({
        level: e.currentTarget.dataset.navLevel,
        col: e.currentTarget.dataset.navCol,
        row: e.currentTarget.dataset.navRow,
        hotspotId: e.currentTarget.dataset.navHotspot,
        route: e.currentTarget.dataset.navRoute === "1",
      });
    });

    html.on("click", "[data-scene-brief-chat]", async e => {
      e.preventDefault();
      e.stopPropagation();
      await this._postSceneBriefToChat();
    });

    html.on("click", "[data-scene-prep-materialize]", async e => {
      e.preventDefault();
      e.stopPropagation();
      await this._materializeScenePrepPacket();
    });

    html.on("click", "[data-scene-staging-materialize]", async e => {
      e.preventDefault();
      e.stopPropagation();
      await this._materializeSceneStaging();
    });

    html.on("click", "[data-scene-situation-reroll]", e => {
      e.preventDefault();
      e.stopPropagation();
      this._situationSeed = Date.now();
      ui.notifications?.info?.("World Map situation rerolled.");
      this.render(false);
    });

    html.on("click", "[data-local-hotspot]", e => {
      const action = e.currentTarget.dataset.localAction ?? "";
      if (action === "route") return;
      e.preventDefault();
      e.stopPropagation();
      this._activeHotspotId = e.currentTarget.dataset.localHotspot ?? null;
      this._mapLevel = "encounter";
      const label = e.currentTarget.dataset.hotspotLabel ?? e.currentTarget.textContent?.trim() ?? "Сцена";
      const type = e.currentTarget.dataset.hotspotTypeLabel ?? "Сцена";
      ui.notifications?.info?.(`${label}: ${type}`);
      this.render(false);
    });

    html.on("click", "[data-encounter-zone]", e => {
      e.preventDefault();
      e.stopPropagation();
      const label = e.currentTarget.dataset.zoneLabel ?? "Зона";
      const detail = e.currentTarget.dataset.zoneDetail ?? "";
      if (detail) ui.notifications?.info?.(`${label}: ${detail}`);
    });

    html.on("click", "[data-local-route-col]", e => {
      e.preventDefault();
      e.stopPropagation();
      const col = parseInt(e.currentTarget.dataset.localRouteCol);
      const row = parseInt(e.currentTarget.dataset.localRouteRow);
      if (Number.isFinite(col) && Number.isFinite(row)) {
        this._mapLevel = "region";
        this._buildRouteTo(col, row);
      }
    });

    // ПКМ по POI — быстрые действия
    html.on("contextmenu", ".ih-wm-poi-marker", async e => {
      e.preventDefault(); e.stopPropagation();
      const actor = game.actors?.get(e.currentTarget.dataset.poiId);
      if (!actor) return;
      const choice = await Dialog.wait({
        title: actor.name,
        content: buildSystemDialogContent({
          className: "ih-world-poi-dialog",
          headline: actor.name,
          headlineMeta: "точка интереса",
        }),
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
      this._buildRouteTo(col, row);
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
      const transportCfg = TRANSPORT_TYPES[this._transport] ?? {};
      const mult = transportCfg.speedMult ?? (transportCfg.speed ? 1 / Number(transportCfg.speed) : 1);
      const cost = (terrain.costHours ?? terrain.moveCost ?? 1) * mult;
      const label   = tile.label ? `<b>${tile.label}</b><br>` : "";
      const poiMeta = getPoiMeta(tile);
      const danger = getTileDanger(tile);
      const details = [
        `${terrain.icon ?? ""} ${terrain.label ?? tile.terrain} · ${cost.toFixed(1)}ч/тайл`,
        poiMeta?.desc ? `<span>${escapeCombatHtml(poiMeta.desc)}</span>` : "",
        `Опасность: ${danger}`,
      ].filter(Boolean).join("<br>");
      const tip     = `${label}${details}`;
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

  setMapFocus(focus = {}, options = {}) {
    const normalized = normalizeWorldMapFocus(focus);
    if (WORLD_MAP_LEVELS[normalized.level]) this._mapLevel = normalized.level;
    if (Object.prototype.hasOwnProperty.call(focus ?? {}, "hotspotId")
      || Object.prototype.hasOwnProperty.call(focus ?? {}, "hotspot")) {
      this._activeHotspotId = normalized.hotspotId || null;
    }

    if (normalized.hasCoord) {
      const { col: groupCol, row: groupRow } = this._getGroupPosition();
      const sameAsGroup = Number(groupCol) === Number(normalized.col) && Number(groupRow) === Number(normalized.row);
      this._manualPath = [];
      this._manualMode = false;
      if (sameAsGroup && !normalized.route) {
        this._target = null;
        this._route = null;
      } else {
        const region = this._getRegion();
        this._target = { col: normalized.col, row: normalized.row };
        this._route = astar(
          region.tiles,
          region.cols,
          region.rows,
          groupCol,
          groupRow,
          normalized.col,
          normalized.row,
          this._transport
        );
      }
    } else if (!options.keepTarget && normalized.level === "global") {
      this._target = null;
      this._route = null;
    }

    if (options.render !== false) this.render(false);
    return this;
  }

  async _postSceneBriefToChat() {
    const data = await this.getData();
    const brief = data.sceneBrief;
    if (!brief?.hasBrief) {
      ui.notifications?.warn?.("Scene brief недоступен для текущей карты.");
      return;
    }

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `GM scene brief: ${brief.title}`,
        subtitle: brief.subtitle,
        icon: "🧭",
        status: brief.statusLabel,
        statusClass: brief.statusClass,
        rows: brief.chatRows ?? [],
        bodyHtml: buildWorldMapSceneBriefChatBody(brief),
        className: "ih-world-scene-brief-card",
      }),
      whisper: game.user?.isGM ? ChatMessage.getWhisperRecipients("GM") : undefined,
    });

    ui.notifications?.info?.(`Scene brief отправлен в чат: ${brief.title}`);
  }

  async _materializeScenePrepPacket() {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Только GM может фиксировать scene prep.");
      return;
    }
    const data = await this.getData();
    const brief = data.sceneBrief;
    if (!brief?.hasBrief) {
      ui.notifications?.warn?.("Scene prep недоступен для текущей карты.");
      return;
    }

    const { packet } = await persistWorldMapScenePrepPacket(brief);
    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `Scene prep packet: ${packet.title}`,
        subtitle: packet.subtitle,
        icon: "▣",
        status: `t${packet.tier || "-"} · ${packet.poiTheme || packet.kind}`,
        statusClass: packet.statusClass,
        rows: [
          ["Situation", `${packet.situation?.map?.label || "-"} / ${packet.situation?.title || "-"}`],
          ["Actors", `${packet.counts.monsters} monsters · ${packet.counts.npcs} NPC`],
          ["Loot", `${packet.counts.loot} sources`],
          ["Checklist", `${packet.counts.checklist} checks`],
          ["Risks", `${packet.counts.risks}`],
        ],
        bodyHtml: buildWorldMapScenePrepChatBody(packet),
        className: "ih-world-scene-prep-card",
      }),
      whisper: ChatMessage.getWhisperRecipients("GM"),
    });

    ui.notifications?.info?.(`Scene prep зафиксирован: ${packet.title}`);
  }

  async _materializeSceneStaging() {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Только GM может создавать scene staging.");
      return;
    }
    const data = await this.getData();
    const brief = data.sceneBrief;
    if (!brief?.hasBrief) {
      ui.notifications?.warn?.("Scene staging недоступен для текущей карты.");
      return;
    }

    try {
      const result = await materializeWorldMapSceneStaging(brief);
      await ChatMessage.create({
        content: buildCombatChatCard({
          title: `Scene staging: ${result.packet.title}`,
          subtitle: result.packet.subtitle,
          icon: "▤",
          status: result.created ? "Journal created" : "Journal updated",
          statusClass: result.created ? "is-safe" : "is-warn",
          rows: [
            ["Journal", result.packet.staging?.journalName ?? "-"],
            ["Situation", `${result.packet.situation?.map?.label || "-"} / ${result.packet.situation?.title || "-"}`],
            ["Actors", `${result.packet.counts.monsters} monsters · ${result.packet.counts.npcs} NPC`],
            ["Loot", `${result.packet.counts.loot} sources`],
            ["Zones", `${result.packet.counts.zones}`],
          ],
          bodyHtml: buildWorldMapSceneStagingChatBody(result),
          className: "ih-world-scene-staging-card",
        }),
        whisper: ChatMessage.getWhisperRecipients("GM"),
      });

      const action = result.created ? "создан" : "обновлен";
      ui.notifications?.info?.(`Scene staging ${action}: ${result.packet.staging?.journalName ?? result.packet.title}`);
    } catch (error) {
      console.error("Iron Hills | Scene staging materialization failed", error);
      ui.notifications?.error?.(`Scene staging не создан: ${error.message ?? error}`);
    }
  }

  _buildRouteTo(col, row) {
    const { col: gc, row: gr } = this._getGroupPosition();

    if (col === gc && row === gr) {
      this._target     = null;
      this._route      = null;
      this._manualPath = [];
      this.render(false);
      return;
    }

    if (this._manualMode) {
      const idx = this._manualPath.findIndex(p => p.col === col && p.row === row);
      if (idx >= 0) {
        this._manualPath = this._manualPath.slice(0, idx);
      } else {
        this._manualPath.push({ col, row });
      }

      if (this._manualPath.length) {
        const region = this._getRegion();
        const last   = this._manualPath[this._manualPath.length - 1];
        this._target = { col: last.col, row: last.row };

        const { col: sc, row: sr } = this._getGroupPosition();
        const fullPath = [{ col: sc, row: sr }, ...this._manualPath];
        let totalHours = 0;
        for (let i = 1; i < fullPath.length; i++) {
          const t = region.tiles.find(tile => tile.col === fullPath[i].col && tile.row === fullPath[i].row);
          totalHours += getTerrainCostHours(t?.terrain ?? "plains", this._transport);
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
      const region = this._getRegion();
      this._target = { col, row };
      this._route  = astar(
        region.tiles, region.cols, region.rows,
        gc, gr, col, row, this._transport
      );
      this._manualPath = [];
    }

    this.render(false);
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
        data-travel-app-id="${escapeCombatHtml(this.appId)}">
        ▶ Продолжить путь
      </button>`;

      const msg = await ChatMessage.create({
        content: buildCombatChatCard({
          title: "Путешествие",
          subtitle: "ожидание решения GM",
          icon: "▶",
          bodyHtml: btn,
          className: "ih-travel-action-card",
        }),
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
        content: buildCombatChatCard({
          title: "Группа прибыла",
          icon: "✓",
          status: `${adjustedHours.toFixed(1)}ч`,
          statusClass: "is-good",
          rows: [
            ["Цель", tr.targetLabel || "цель"],
            ["Итог", note ? note.replace(/[()]/g, "") : "без задержек"],
          ],
          className: "ih-travel-chat-card",
        }),
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
      content: buildSystemDialogContent({
        className: "ih-travel-confirm-dialog",
        headline: "Подтвердить путешествие",
        headlineMeta: "активная группа",
        status: "Применить маршрут?",
        statusClass: "is-warn",
        rows: [
          ["Маршрут", `${hours}ч`],
          ["Транспорт", this._transport],
          ["Цель", target?.label || `[${this._target.col},${this._target.row}]`],
        ],
      }),
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
      content: buildCombatChatCard({
        title: "Группа выдвигается",
        icon: "🗺",
        status: `${hours.toFixed(1)}ч`,
        rows: [
          ["Цель", target?.label ?? "цель"],
          ["Транспорт", this._transport],
        ],
        className: "ih-travel-chat-card",
      }),
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
          content: buildSystemDialogContent({
            className: "ih-travel-confirm-dialog",
            headline: scene.name,
            headlineMeta: "сцена",
            status: "Загрузить сцену?",
            statusClass: "is-warn",
          }),
        });
        if (enter) await scene.activate();
      }
    }
  }

  async _enterLocation() {
    const { col, row } = this._getGroupPosition();
    const region = this._getRegion();
    const tile   = region.tiles.find(t => t.col === col && t.row === row);
    if (!tile?.sceneId) {
      this.setMapFocus({ level: "local", col, row }, { render: true });
      ui.notifications?.info?.("Открыт локальный слой карты. Реальная Foundry Scene пока не привязана к этому тайлу.");
      return;
    }

    const scene = game.scenes.get(tile.sceneId);
    if (!scene) { ui.notifications.warn("Сцена не найдена."); return; }
    await scene.activate();
  }
}

export { IronHillsWorldMapApp };
