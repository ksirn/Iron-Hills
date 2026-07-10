import {
  buildWorldMapEncounterKit,
} from "./world-map-encounter-kit-service.mjs";
import {
  buildWorldMapSituation,
} from "./world-map-situation-generator-service.mjs";

function str(value = "") {
  return String(value ?? "").trim();
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeHtml(value = "") {
  return str(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toneFor(value = "") {
  const key = str(value);
  if (["danger", "combat", "trap", "hazard"].includes(key)) return "is-danger";
  if (["warn", "travel", "transition"].includes(key)) return "is-warn";
  if (["trade", "craft", "loot", "reward"].includes(key)) return "is-gold";
  if (["npc", "social", "medicine", "support"].includes(key)) return "is-active";
  if (["road", "exit"].includes(key)) return "is-road";
  return "is-safe";
}

function row(label, value, note = "", tone = "") {
  return {
    label: str(label),
    value: str(value),
    note: str(note),
    tone: tone || toneFor(note) || "is-safe",
    hasNote: Boolean(str(note)),
  };
}

function coordLabel(tile = {}) {
  const col = Number(tile?.col);
  const row = Number(tile?.row);
  return Number.isFinite(col) && Number.isFinite(row) ? `[${col},${row}]` : "";
}

function focusLabel(tile = {}, fallback = "Сцена") {
  return str(tile?.label) || str(tile?.terrainLabel) || str(tile?.terrain) || fallback;
}

function activeHotspot(localView = {}, encounterView = {}) {
  return localView.activeHotspot ?? encounterView.activeHotspot ?? null;
}

function briefKind(hotspot = null, focusTile = {}) {
  const type = str(hotspot?.hotspotType);
  const terrain = str(focusTile?.terrain);
  if (["trade", "craft", "social", "npc", "loot", "transition", "danger", "encounter"].includes(type)) return type;
  if (["town", "village"].includes(terrain)) return "social";
  if (["mine", "dungeon", "ruins", "forest", "swamp", "pass"].includes(terrain)) return "danger";
  return "encounter";
}

function briefStatus(kind = "encounter", activeLevelId = "region") {
  if (activeLevelId === "global") return { label: "стратегический слой", tone: "is-road", statusClass: "is-warn" };
  if (activeLevelId === "region") return { label: "маршрут и выбор POI", tone: "is-road", statusClass: "is-warn" };
  if (kind === "trade") return { label: "торговая сцена", tone: "is-gold", statusClass: "is-good" };
  if (kind === "craft") return { label: "ремонт и ремесло", tone: "is-gold", statusClass: "is-good" };
  if (kind === "social" || kind === "npc") return { label: "социальная сцена", tone: "is-active", statusClass: "is-good" };
  if (kind === "loot") return { label: "обыск и добыча", tone: "is-gold", statusClass: "is-warn" };
  if (kind === "transition") return { label: "переход и travel", tone: "is-road", statusClass: "is-warn" };
  return { label: "боевой/опасный encounter", tone: "is-danger", statusClass: "is-warn" };
}

function uniqueRows(rows = []) {
  const seen = new Set();
  const out = [];
  for (const entry of rows) {
    const key = `${entry.label}|${entry.value}|${entry.note}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
}

function buildCastRows(localView = {}, encounterView = {}) {
  const links = [
    ...safeArray(localView.sessionLinks),
    ...safeArray(encounterView.sessionLinks),
  ];
  const hotspot = activeHotspot(localView, encounterView);
  const rows = links.map(link => row(
    link.typeLabel || link.type || "Связь",
    link.name,
    link.detail,
    link.tone || toneFor(link.type)
  ));
  if (hotspot?.npcRole) {
    rows.unshift(row("Роль на сцене", hotspot.npcRole, hotspot.detail || hotspot.kind, toneFor(hotspot.hotspotType)));
  }
  return uniqueRows(rows).slice(0, 8);
}

function buildSetupRows({ activeLevelId, focusTile, localView, encounterView, sessionMap }) {
  const hotspot = activeHotspot(localView, encounterView);
  const anchors = safeArray(sessionMap?.focusAnchors);
  const exits = safeArray(localView?.exits);
  const rows = [
    row("Фокус", focusLabel(focusTile), `${focusTile?.terrainLabel ?? focusTile?.terrain ?? "местность"} ${coordLabel(focusTile)}`, "is-road"),
    row("Уровень", activeLevelId, activeLevelId === "encounter" ? "точная сцена" : "подготовка сцены", "is-active"),
  ];
  if (hotspot) rows.push(row("Hotspot", hotspot.label, hotspot.detail || hotspot.hotspotTypeLabel || hotspot.kind, toneFor(hotspot.hotspotType)));
  for (const anchor of anchors) {
    rows.push(row("Якорь сессии", anchor.label, anchor.detail || anchor.statusLabel, anchor.tone || "is-gold"));
  }
  if (exits.length) rows.push(row("Выходы", `${exits.length}`, exits.map(exit => exit.label).slice(0, 4).join(", "), "is-road"));
  return uniqueRows(rows).slice(0, 8);
}

function buildZoneRows(encounterView = {}) {
  return safeArray(encounterView.zones).map(zone => row(
    zone.label,
    zone.hotspotTypeLabel || zone.kind,
    zone.detail || zone.kind,
    zone.tone || toneFor(zone.hotspotType)
  )).slice(0, 8);
}

function buildLootRows(kind, focusTile = {}, hotspot = null) {
  const terrain = str(focusTile?.terrain);
  const rows = [];
  if (kind === "trade") {
    rows.push(row("Сток", "товары торговца", "проверить copper/silver/gold и pending", "is-gold"));
    rows.push(row("Скупка", "добыча группы", "проверить продажу без дублирования", "is-gold"));
  } else if (kind === "craft") {
    rows.push(row("Ремонт", "броня/щит/оружие", "проверить стоимость и восстановление прочности", "is-gold"));
    rows.push(row("Материалы", "руда, кожа, ткань", "должны ложиться в Tarkov контейнеры", "is-gold"));
  } else if (kind === "loot") {
    rows.push(row("Контейнер", "тайник/ящик", "подготовить 2-4 предмета разного размера", "is-gold"));
  } else if (["mine", "dungeon", "ruins"].includes(terrain)) {
    rows.push(row("Добыча", "руда/артефакт/инструмент", "привязать к материалам и ремеслу", "is-gold"));
  } else if (["forest", "swamp"].includes(terrain)) {
    rows.push(row("Сбор", "травы/трофеи/шкуры", "проверить wilderness loot и перенос в inventory", "is-gold"));
  } else {
    rows.push(row("Награда", hotspot?.hotspotTypeLabel || "малый лут", "слух, монеты или расходник", "is-gold"));
  }
  return rows;
}

function buildMechanicRows(kind, focusTile = {}, encounterView = {}) {
  const terrain = str(focusTile?.terrain);
  const rows = [
    row("Карта", "4 уровня", "global -> region -> local -> encounter и обратно", "is-road"),
  ];
  if (kind === "trade" || kind === "craft") {
    rows.push(row("Инвентарь", "pending обязателен", "купить предмет и разложить в сетку", "is-gold"));
    rows.push(row("Валюта", "copper/silver/gold", "проверить покупку и продажу", "is-gold"));
  }
  if (["danger", "encounter"].includes(kind) || ["mine", "dungeon", "ruins", "forest", "swamp", "pass"].includes(terrain)) {
    rows.push(row("Бой", "single-target", "атака должна пройти через shield -> armor -> body", "is-danger"));
    rows.push(row("AoE", "каждая цель отдельно", "защита, зона тела и friendly fire по типу атаки", "is-danger"));
    rows.push(row("Время", "6 секунд", "стоимость действий и энергия тела должны быть видны", "is-warn"));
  }
  if (["forest", "swamp", "mine", "dungeon"].includes(terrain)) {
    rows.push(row("Медицина", "рана и лечение", "bleeding/fracture/shock + short/long rest", "is-active"));
  }
  if (safeArray(encounterView?.zones).some(zone => zone.hotspotType === "transition" || zone.tone === "is-road")) {
    rows.push(row("Переходы", "вход/выход", "после сцены вернуться на local/region", "is-road"));
  }
  return uniqueRows(rows).slice(0, 8);
}

function buildRiskRows({ activeLevelId, focusTile, localView, encounterView }) {
  const rows = [];
  if (activeLevelId === "encounter" && !encounterView?.hasZones) {
    rows.push(row("Нет зон", "encounter пуст", "добавь хотя бы вход, укрытие, опасность и добычу", "is-warn"));
  }
  if (!localView?.hasSessionLinks && !encounterView?.hasSessionLinks) {
    rows.push(row("Нет связей", "NPC/квесты не найдены", "можно играть, но GM должен поставить сущности вручную", "is-warn"));
  }
  if (!focusTile?.sceneId) {
    rows.push(row("Нет Foundry Scene", "используется картографический слой", "достаточно для первой сессии, но tokens не будут расставлены автоматически", "is-warn"));
  }
  return rows;
}

export function buildWorldMapSceneBrief({
  activeLevelId = "region",
  focusTile = {},
  localView = {},
  encounterView = {},
  sessionMap = {},
  mapJourney = {},
  situationSeed = "",
} = {}) {
  const hotspot = activeHotspot(localView, encounterView);
  const kind = briefKind(hotspot, focusTile);
  const status = briefStatus(kind, activeLevelId);
  const title = activeLevelId === "encounter" && hotspot?.label
    ? `${focusLabel(focusTile)}: ${hotspot.label}`
    : focusLabel(focusTile, mapJourney?.focus?.label || "Сцена");
  const terrain = str(focusTile?.terrainLabel) || str(focusTile?.terrain) || "местность";
  const setupRows = buildSetupRows({ activeLevelId, focusTile, localView, encounterView, sessionMap });
  const castRows = buildCastRows(localView, encounterView);
  const zoneRows = buildZoneRows(encounterView);
  const kit = buildWorldMapEncounterKit({
    activeLevelId,
    focusTile,
    localView,
    encounterView,
    sceneBrief: { kind },
  });
  const situation = buildWorldMapSituation({
    activeLevelId,
    focusTile,
    localView,
    encounterView,
    sceneBrief: { kind, title },
    encounterKit: kit,
    seed: situationSeed,
  });
  const lootRows = uniqueRows([...buildLootRows(kind, focusTile, hotspot), ...safeArray(kit.generatorRows)]);
  const mechanicRows = buildMechanicRows(kind, focusTile, encounterView);
  const riskRows = buildRiskRows({ activeLevelId, focusTile, localView, encounterView });

  return {
    hasBrief: true,
    title,
    subtitle: `${terrain}${coordLabel(focusTile) ? ` · ${coordLabel(focusTile)}` : ""}`,
    kind,
    statusLabel: status.label,
    tone: status.tone,
    statusClass: status.statusClass,
    summaryRows: [
      row("Слой", activeLevelId, status.label, status.tone),
      row("Риск", String(num(localView?.danger ?? encounterView?.danger ?? focusTile?.danger, 1)), "опасность локации", "is-warn"),
      row("Связи", String(castRows.length), "NPC/квесты/торговцы", castRows.length ? "is-active" : "is-warn"),
      row("Map roll", situation?.map?.label || "pool", situation?.title || "generated situation", "is-road"),
    ],
    setupRows,
    castRows,
    zoneRows,
    lootRows,
    situationRows: situation?.situationRows ?? [],
    placementRows: situation?.placementRows ?? [],
    markerRows: situation?.markerRows ?? [],
    navigationRows: situation?.navigationRows ?? [],
    situationActorRows: situation?.actorRows ?? [],
    situationLootRows: situation?.lootRows ?? [],
    clueRows: situation?.clueRows ?? [],
    skillRows: situation?.skillRows ?? [],
    twistRows: situation?.twistRows ?? [],
    poolRows: situation?.poolRows ?? [],
    kitRows: kit.kitRows ?? [],
    monsterRows: kit.monsterRows ?? [],
    npcRows: kit.npcRows ?? [],
    generatorRows: kit.generatorRows ?? [],
    harvestRows: kit.harvestRows ?? [],
    mechanicRows,
    riskRows,
    hasSetupRows: setupRows.length > 0,
    hasCastRows: castRows.length > 0,
    hasZoneRows: zoneRows.length > 0,
    hasLootRows: lootRows.length > 0,
    hasSituationRows: Boolean(situation?.situationRows?.length),
    hasPlacementRows: Boolean(situation?.placementRows?.length),
    hasMarkerRows: Boolean(situation?.markerRows?.length),
    hasNavigationRows: Boolean(situation?.navigationRows?.length),
    hasSituationActorRows: Boolean(situation?.actorRows?.length),
    hasSituationLootRows: Boolean(situation?.lootRows?.length),
    hasClueRows: Boolean(situation?.clueRows?.length),
    hasSkillRows: Boolean(situation?.skillRows?.length),
    hasTwistRows: Boolean(situation?.twistRows?.length),
    hasPoolRows: Boolean(situation?.poolRows?.length),
    hasKitRows: Boolean(kit.hasKitRows),
    hasMonsterRows: Boolean(kit.hasMonsterRows),
    hasNpcRows: Boolean(kit.hasNpcRows),
    hasGeneratorRows: Boolean(kit.hasGeneratorRows),
    hasHarvestRows: Boolean(kit.hasHarvestRows),
    hasMechanicRows: mechanicRows.length > 0,
    hasRiskRows: riskRows.length > 0,
    encounterKit: kit,
    situation,
    chatRows: [
      ["Локация", title],
      ["Слой", activeLevelId],
      ["Тип", status.label],
      ["Связи", String(castRows.length)],
      ["Generated map", situation?.map?.label || "-"],
      ["Navigation", `${situation?.counts?.navigation ?? 0} route rows`],
      ["Situation", situation?.title || "-"],
      ["Kit", `t${kit.tier} · ${kit.poiTheme}`],
    ],
  };
}

function renderRows(title, rows = [], empty = "Нет данных.") {
  const body = safeArray(rows).length
    ? safeArray(rows).map(entry => `
      <li>
        <b>${escapeHtml(entry.label)}</b>
        <span>${escapeHtml(entry.value)}</span>
        ${entry.note ? `<em>${escapeHtml(entry.note)}</em>` : ""}
      </li>`).join("")
    : `<li><span>${escapeHtml(empty)}</span></li>`;
  return `
    <section class="ih-scene-brief-chat-section">
      <h4>${escapeHtml(title)}</h4>
      <ul>${body}</ul>
    </section>`;
}

export function buildWorldMapSceneBriefChatBody(brief = {}) {
  return `
    <div class="ih-scene-brief-chat">
      ${renderRows("Setup", brief.setupRows)}
      ${renderRows("Generated situation", brief.situationRows)}
      ${renderRows("Navigation route", brief.navigationRows, "No generated navigation route.")}
      ${renderRows("Map markers", brief.markerRows, "No generated map markers.")}
      ${renderRows("Placement", brief.placementRows, "No generated placement notes.")}
      ${renderRows("Situation actors", brief.situationActorRows, "No generated actor placement.")}
      ${renderRows("Clues", brief.clueRows, "No generated clues.")}
      ${renderRows("Skill checks", brief.skillRows, "No generated skill checks.")}
      ${renderRows("Twists", brief.twistRows, "No optional twists.")}
      ${renderRows("Cast / links", brief.castRows, "Связанные actor/quest не найдены.")}
      ${renderRows("Encounter kit", brief.kitRows)}
      ${renderRows("Suggested monsters", brief.monsterRows, "Монстры не нужны для этой сцены.")}
      ${renderRows("Suggested NPC", brief.npcRows, "NPC archetypes не найдены.")}
      ${renderRows("Encounter zones", brief.zoneRows, "Зоны появятся на encounter-слое.")}
      ${renderRows("Loot / reward", brief.lootRows)}
      ${renderRows("Harvest pools", brief.harvestRows, "Harvest loot появится для выбранных монстров.")}
      ${renderRows("Manual checks", brief.mechanicRows)}
      ${renderRows("Risks", brief.riskRows, "Критичных рисков по brief нет.")}
    </div>`;
}
