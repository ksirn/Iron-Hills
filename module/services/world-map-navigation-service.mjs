import {
  WORLD_MAP_LEVEL_ORDER,
  WORLD_MAP_LEVELS,
} from "../constants/world-map.mjs";

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function str(value = "") {
  return String(value ?? "").trim();
}

function hasCoord(value = {}) {
  return Number.isFinite(Number(value?.col)) && Number.isFinite(Number(value?.row));
}

function coordLabel(col, row) {
  return `[${num(col)},${num(row)}]`;
}

function normalizeLevel(level = "region", fallback = "region") {
  const key = str(level);
  if (key === "building") return "encounter";
  return WORLD_MAP_LEVELS[key] ? key : fallback;
}

function levelIndex(level = "region") {
  const idx = WORLD_MAP_LEVEL_ORDER.indexOf(normalizeLevel(level));
  return idx >= 0 ? idx : WORLD_MAP_LEVEL_ORDER.indexOf("region");
}

function tileLabel(tile = {}, fallback = "Локация") {
  return str(tile.label) || str(tile.terrainLabel) || str(tile.terrain) || fallback;
}

function actionRow({
  id,
  label,
  hint,
  level,
  coord,
  hotspotId = "",
  tone = "",
  action = "focus",
  route = false,
  primary = false,
}) {
  const nextLevel = normalizeLevel(level);
  const hasTarget = hasCoord(coord);
  return {
    id,
    label,
    hint,
    level: nextLevel,
    action,
    tone,
    col: hasTarget ? num(coord.col) : "",
    row: hasTarget ? num(coord.row) : "",
    hotspotId: str(hotspotId),
    routeFlag: route ? "1" : "",
    hasCoord: hasTarget,
    primary,
  };
}

function crumbRow({
  level,
  label,
  caption,
  coord,
  hotspotId = "",
  activeLevel,
  focusIndex,
}) {
  const nextLevel = normalizeLevel(level);
  const idx = levelIndex(nextLevel);
  const hasTarget = hasCoord(coord);
  return {
    index: idx + 1,
    level: nextLevel,
    label,
    caption,
    col: hasTarget ? num(coord.col) : "",
    row: hasTarget ? num(coord.row) : "",
    hotspotId: str(hotspotId),
    isActive: nextLevel === activeLevel,
    isPast: idx < focusIndex,
    isFuture: idx > focusIndex,
    tone: idx < focusIndex ? "is-done" : idx === focusIndex ? "is-active" : "is-next",
  };
}

export function normalizeWorldMapFocus(focus = {}) {
  const level = normalizeLevel(focus?.level ?? focus?.mapLevel ?? "region");
  const col = Number(focus?.col ?? focus?.mapCol);
  const row = Number(focus?.row ?? focus?.mapRow);
  const hasTarget = Number.isFinite(col) && Number.isFinite(row);
  return {
    level,
    col: hasTarget ? col : null,
    row: hasTarget ? row : null,
    hasCoord: hasTarget,
    hotspotId: str(focus?.hotspotId ?? focus?.hotspot ?? ""),
    route: Boolean(focus?.route ?? focus?.buildRoute),
  };
}

export function buildWorldMapNavigationModel({
  activeLevelId = "region",
  region = {},
  currentTile = {},
  targetTile = null,
  focusTile = {},
  activeHotspot = null,
  sessionMap = null,
} = {}) {
  const activeLevel = normalizeLevel(activeLevelId);
  const focusIndex = levelIndex(activeLevel);
  const focus = hasCoord(focusTile) ? focusTile : hasCoord(targetTile) ? targetTile : currentTile;
  const coord = hasCoord(focus) ? { col: num(focus.col), row: num(focus.row) } : null;
  const regionLabel = str(region.label) || "Iron Hills";
  const focusName = tileLabel(focus, regionLabel);
  const focusTerrain = str(focus.terrainLabel) || str(focus.terrain) || "местность";
  const hotspotId = str(activeHotspot?.id) || str(sessionMap?.focusAnchors?.[0]?.hotspotId);
  const hotspotLabel = str(activeHotspot?.label) || "Сцена";
  const hotspotKind = str(activeHotspot?.hotspotTypeLabel) || str(activeHotspot?.kind) || "энкаунтер";
  const hasHotspot = Boolean(hotspotId || activeHotspot);
  const coordText = coord ? coordLabel(coord.col, coord.row) : "";

  const crumbs = [
    crumbRow({
      level: "global",
      label: "Мир",
      caption: "континенты и соседние регионы",
      activeLevel,
      focusIndex,
    }),
    crumbRow({
      level: "region",
      label: regionLabel,
      caption: coordText ? `маршрут к ${coordText}` : "региональный маршрут",
      coord,
      activeLevel,
      focusIndex,
    }),
    crumbRow({
      level: "local",
      label: focusName,
      caption: `${focusTerrain}${coordText ? ` · ${coordText}` : ""}`,
      coord,
      hotspotId,
      activeLevel,
      focusIndex,
    }),
    crumbRow({
      level: "encounter",
      label: hotspotLabel,
      caption: hotspotKind,
      coord,
      hotspotId,
      activeLevel,
      focusIndex,
    }),
  ];

  const actions = [];
  const push = row => actions.push(actionRow({ coord, hotspotId, ...row }));

  if (activeLevel !== "global") {
    push({
      id: "to-global",
      label: "Мир",
      hint: "показать стратегический слой",
      level: "global",
      tone: "is-muted",
    });
  }

  if (activeLevel === "global") {
    push({
      id: "to-region",
      label: "В Iron Hills",
      hint: "перейти к региональному маршруту",
      level: "region",
      tone: "is-road",
      primary: true,
    });
  } else if (activeLevel === "region") {
    push({
      id: "to-local",
      label: "В локацию",
      hint: focusName,
      level: "local",
      tone: "is-road",
      primary: true,
    });
    push({
      id: "to-encounter",
      label: "К сцене",
      hint: hasHotspot ? hotspotLabel : "выбрать активную точку",
      level: "encounter",
      tone: hasHotspot ? "is-danger" : "is-muted",
    });
  } else if (activeLevel === "local") {
    push({
      id: "to-region",
      label: "Регион",
      hint: "вернуться к маршруту",
      level: "region",
      tone: "is-road",
    });
    push({
      id: "to-encounter",
      label: "Открыть сцену",
      hint: hotspotLabel,
      level: "encounter",
      tone: "is-danger",
      primary: true,
    });
  } else if (activeLevel === "encounter") {
    push({
      id: "to-local",
      label: "Локация",
      hint: focusName,
      level: "local",
      tone: "is-road",
      primary: true,
    });
    push({
      id: "to-region",
      label: "Регион",
      hint: "построить путь или сменить POI",
      level: "region",
      tone: "is-muted",
    });
    actions.push(actionRow({
      id: "combat-director",
      label: "Combat Director",
      hint: "атаки, AoE, friendly fire",
      level: activeLevel,
      coord,
      hotspotId,
      tone: "is-danger",
      action: "combat-director",
    }));
  }

  if (coord && activeLevel !== "region") {
    actions.push(actionRow({
      id: "route-focus",
      label: "Маршрут",
      hint: `${focusName} ${coordText}`,
      level: "region",
      coord,
      hotspotId,
      tone: "is-active",
      route: true,
    }));
  }

  const compactCrumbs = crumbs.map(row => ({
    ...row,
    label: row.level === "encounter" && !hasHotspot ? "Сцена" : row.label,
  }));

  return {
    activeLevel,
    activeIndex: focusIndex + 1,
    focus: {
      level: activeLevel,
      label: focusName,
      terrain: focusTerrain,
      coordLabel: coordText,
      col: coord ? coord.col : "",
      row: coord ? coord.row : "",
      hotspotId,
      hotspotLabel,
      hotspotKind,
      hasCoord: Boolean(coord),
      hasHotspot,
    },
    crumbs,
    compactCrumbs,
    hasCrumbs: crumbs.length > 0,
    actions,
    hasActions: actions.length > 0,
    hasHotspot,
  };
}
