const SYSTEM_ID = "iron-hills-system";
const SETTING_KEY = "worldMapScenePrepState";
const MAX_PACKETS = 24;
const JOURNAL_FLAG_KEY = "worldMapScenePrep";
const JOURNAL_PAGE_FLAG_KEY = "worldMapScenePrepPage";
const JOURNAL_PAGE_NAME = "Scene Prep Runbook";

function str(value = "") {
  return String(value ?? "").trim();
}

function slug(value = "") {
  return str(value)
    .toLocaleLowerCase("ru")
    .replace(/[^a-zа-яё0-9]+/giu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "scene-prep";
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeRows(rows = []) {
  return safeArray(rows)
    .map(row => ({
      label: str(row?.label),
      value: str(row?.value),
      note: str(row?.note),
      tone: str(row?.tone) || "is-safe",
      id: str(row?.id),
      tier: row?.tier ?? "",
      kind: str(row?.kind),
      actorKind: str(row?.actorKind),
      count: row?.count ?? "",
      placement: str(row?.placement),
      markerKind: str(row?.markerKind),
      sceneLayer: str(row?.sceneLayer),
      action: str(row?.action),
      navAction: str(row?.navAction),
      navLevel: str(row?.navLevel),
      navOrder: row?.navOrder ?? "",
      anchor: str(row?.anchor),
      asset: str(row?.asset),
      x: row?.x ?? "",
      y: row?.y ?? "",
      w: row?.w ?? "",
      h: row?.h ?? "",
      priority: row?.priority ?? "",
      sourceLabel: str(row?.sourceLabel),
      role: str(row?.role),
      sceneRole: str(row?.sceneRole),
      lootPool: str(row?.lootPool),
      scope: str(row?.scope),
      objective: str(row?.objective),
      rewardSilver: row?.rewardSilver ?? "",
      rawLevel: str(row?.rawLevel),
    }))
    .filter(row => row.label || row.value || row.note);
}

function safeSituation(situation = null) {
  if (!situation?.hasSituation) return null;
  const map = situation.map ?? {};
  return {
    hasSituation: true,
    id: str(situation.id),
    seed: str(situation.seed),
    title: str(situation.title),
    hook: str(situation.hook),
    summary: str(situation.summary),
    tone: str(situation.tone) || "is-active",
    tier: situation.tier ?? "",
    kind: str(situation.kind),
    terrain: str(situation.terrain),
    map: {
      id: str(map.id),
      label: str(map.label),
      level: str(map.level),
      sceneScale: str(map.sceneScale),
      asset: str(map.asset),
      entryHint: str(map.entryHint),
      exitHint: str(map.exitHint),
      tags: safeArray(map.tags).map(str).filter(Boolean),
    },
    situationRows: safeRows(situation.situationRows),
    actorRows: safeRows(situation.actorRows),
    placementRows: safeRows(situation.placementRows),
    markerRows: safeRows(situation.markerRows),
    sceneDescriptionRows: safeRows(situation.sceneDescriptionRows),
    navigationRows: safeRows(situation.navigationRows),
    sceneBlueprintRows: safeRows(situation.sceneBlueprintRows),
    sceneHotspotRows: safeRows(situation.sceneHotspotRows),
    sceneInstructionRows: safeRows(situation.sceneInstructionRows),
    lootRows: safeRows(situation.lootRows),
    clueRows: safeRows(situation.clueRows),
    skillRows: safeRows(situation.skillRows),
    twistRows: safeRows(situation.twistRows),
    questRows: safeRows(situation.questRows),
    rumorRows: safeRows(situation.rumorRows),
    rewardRows: safeRows(situation.rewardRows),
    consequenceRows: safeRows(situation.consequenceRows),
    poolRows: safeRows(situation.poolRows),
    gmTextLines: safeArray(situation.gmTextLines).map(str).filter(Boolean),
    counts: {
      actors: Number(situation.counts?.actors ?? 0),
      monsters: Number(situation.counts?.monsters ?? 0),
      npcs: Number(situation.counts?.npcs ?? 0),
      placements: Number(situation.counts?.placements ?? 0),
      markers: Number(situation.counts?.markers ?? 0),
      navigation: Number(situation.counts?.navigation ?? 0),
      blueprint: Number(situation.counts?.blueprint ?? 0),
      hotspots: Number(situation.counts?.hotspots ?? 0),
      sceneInstructions: Number(situation.counts?.sceneInstructions ?? 0),
      loot: Number(situation.counts?.loot ?? 0),
      clues: Number(situation.counts?.clues ?? 0),
      skills: Number(situation.counts?.skills ?? 0),
      twists: Number(situation.counts?.twists ?? 0),
      quests: Number(situation.counts?.quests ?? 0),
      rumors: Number(situation.counts?.rumors ?? 0),
      rewards: Number(situation.counts?.rewards ?? 0),
      consequences: Number(situation.counts?.consequences ?? 0),
      poolCandidates: Number(situation.counts?.poolCandidates ?? 0),
    },
  };
}

function collectionValues(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (typeof collection.values === "function") return Array.from(collection.values());
  if (collection.contents && Array.isArray(collection.contents)) return collection.contents;
  return Object.values(collection).filter(Boolean);
}

function escapeHtml(value = "") {
  return str(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function packetIdFromBrief(brief = {}) {
  const focus = brief.encounterKit ?? {};
  const seed = [
    brief.title,
    brief.subtitle,
    brief.kind,
    focus.tier ? `t${focus.tier}` : "",
    focus.poiTheme,
  ].filter(Boolean).join("-");
  return slug(seed);
}

function nowStamp() {
  return Date.now();
}

function timeLabel(ts) {
  try {
    return new Date(Number(ts) || Date.now()).toLocaleString();
  } catch {
    return "";
  }
}

function upsertPrepPacketInState(previous, packet) {
  const packets = { ...previous.packets, [packet.id]: packet };
  const nextOrder = [packet.id, ...previous.order.filter(id => id !== packet.id)].slice(0, MAX_PACKETS);
  const nextPackets = Object.fromEntries(nextOrder.map(id => [id, packets[id]]).filter(([, value]) => value));
  return {
    packets: nextPackets,
    order: nextOrder,
    lastId: packet.id,
  };
}

export function buildWorldMapScenePrepPacket(brief = {}, options = {}) {
  const kit = brief.encounterKit ?? {};
  const situation = safeSituation(brief.situation);
  const id = str(options.id) || packetIdFromBrief(brief);
  const createdAt = Number(options.createdAt ?? nowStamp());
  const updatedAt = Number(options.updatedAt ?? createdAt);
  const actors = [
    ...safeRows(situation?.actorRows).map(row => ({ ...row, kind: row.actorKind || row.kind || "situation" })),
    ...safeRows(brief.monsterRows).map(row => ({ ...row, kind: "monster" })),
    ...safeRows(brief.npcRows).map(row => ({ ...row, kind: "npc" })),
  ];
  const loot = [
    ...safeRows(situation?.lootRows).map(row => ({ ...row, kind: "situation-loot" })),
    ...safeRows(brief.generatorRows).map(row => ({ ...row, kind: "generator" })),
    ...safeRows(brief.harvestRows).map(row => ({ ...row, kind: "harvest" })),
  ];
  const checklist = safeRows(brief.mechanicRows);
  const zones = safeRows(brief.zoneRows);
  const risks = safeRows(brief.riskRows);
  const setup = safeRows(brief.setupRows);
  const cast = safeRows(brief.castRows);
  const situationRows = safeRows(situation?.situationRows);
  const placementRows = safeRows(situation?.placementRows);
  const markerRows = safeRows(situation?.markerRows);
  const sceneDescriptionRows = safeRows(brief.sceneDescriptionRows ?? situation?.sceneDescriptionRows);
  const navigationRows = safeRows(brief.navigationRows ?? situation?.navigationRows);
  const sceneBlueprintRows = safeRows(situation?.sceneBlueprintRows);
  const sceneHotspotRows = safeRows(situation?.sceneHotspotRows);
  const sceneInstructionRows = safeRows(situation?.sceneInstructionRows);
  const clueRows = safeRows(situation?.clueRows);
  const skillRows = safeRows(situation?.skillRows);
  const twistRows = safeRows(situation?.twistRows);
  const questRows = safeRows(situation?.questRows);
  const rumorRows = safeRows(situation?.rumorRows);
  const rewardRows = safeRows(situation?.rewardRows);
  const consequenceRows = safeRows(situation?.consequenceRows);
  const poolRows = safeRows(situation?.poolRows);

  return {
    id,
    title: str(brief.title) || "Scene prep",
    subtitle: str(brief.subtitle),
    kind: str(brief.kind) || "encounter",
    statusLabel: str(brief.statusLabel),
    statusClass: str(brief.statusClass) || "is-warn",
    tone: str(brief.tone) || "is-warn",
    tier: kit.tier ?? "",
    poiTheme: str(kit.poiTheme),
    containerTheme: str(kit.containerTheme),
    combat: Boolean(kit.combat),
    situation,
    situationRows,
    placementRows,
    markerRows,
    sceneDescriptionRows,
    navigationRows,
    sceneBlueprintRows,
    sceneHotspotRows,
    sceneInstructionRows,
    clueRows,
    skillRows,
    twistRows,
    questRows,
    rumorRows,
    rewardRows,
    consequenceRows,
    poolRows,
    createdAt,
    updatedAt,
    createdBy: str(options.createdBy) || str(globalThis.game?.user?.name),
    timeLabel: timeLabel(updatedAt),
    setup,
    cast,
    actors,
    loot,
    zones,
    checklist,
    risks,
    counts: {
      setup: setup.length,
      cast: cast.length,
      actors: actors.length,
      monsters: actors.filter(row => row.kind === "monster").length,
      npcs: actors.filter(row => row.kind === "npc").length,
      loot: loot.length,
      zones: zones.length,
      situationRows: situationRows.length,
      placements: placementRows.length,
      markers: markerRows.length,
      sceneDescription: sceneDescriptionRows.length,
      navigation: navigationRows.length,
      blueprint: sceneBlueprintRows.length,
      hotspots: sceneHotspotRows.length,
      sceneInstructions: sceneInstructionRows.length,
      clues: clueRows.length,
      skills: skillRows.length,
      twists: twistRows.length,
      quests: questRows.length,
      rumors: rumorRows.length,
      rewards: rewardRows.length,
      consequences: consequenceRows.length,
      poolCandidates: poolRows.length,
      checklist: checklist.length,
      risks: risks.length,
    },
  };
}

function normalizeState(state = {}) {
  const packets = state?.packets && typeof state.packets === "object" ? state.packets : {};
  const order = safeArray(state?.order).map(str).filter(Boolean);
  const packetIds = new Set(Object.keys(packets));
  const normalizedOrder = [
    ...order.filter(id => packetIds.has(id)),
    ...Object.keys(packets).filter(id => !order.includes(id)),
  ];
  return {
    packets,
    order: normalizedOrder,
    lastId: str(state?.lastId),
  };
}

export function getWorldMapScenePrepState() {
  try {
    return normalizeState(globalThis.game?.settings?.get?.(SYSTEM_ID, SETTING_KEY) ?? {});
  } catch {
    return normalizeState({});
  }
}

export async function persistWorldMapScenePrepPacket(brief = {}, options = {}) {
  if (!globalThis.game?.user?.isGM) {
    throw new Error("World Map scene prep can be materialized only by a GM user.");
  }
  const previous = getWorldMapScenePrepState();
  const packet = buildWorldMapScenePrepPacket(brief, {
    ...options,
    createdAt: previous.packets?.[options.id ?? packetIdFromBrief(brief)]?.createdAt ?? nowStamp(),
    updatedAt: nowStamp(),
  });
  const state = upsertPrepPacketInState(previous, packet);
  await globalThis.game.settings.set(SYSTEM_ID, SETTING_KEY, state);
  return { packet, state };
}

async function persistPreparedPacket(packet = {}) {
  if (!globalThis.game?.user?.isGM) {
    throw new Error("World Map scene prep can be updated only by a GM user.");
  }
  const previous = getWorldMapScenePrepState();
  const state = upsertPrepPacketInState(previous, packet);
  await globalThis.game.settings.set(SYSTEM_ID, SETTING_KEY, state);
  return { packet, state };
}

function renderRows(title, rows = [], empty = "Нет данных.") {
  const body = safeArray(rows).length
    ? safeArray(rows).map(row => `
      <li>
        <b>${escapeHtml(row.label)}</b>
        <span>${escapeHtml(row.value)}</span>
        ${row.note ? `<em>${escapeHtml(row.note)}</em>` : ""}
      </li>`).join("")
    : `<li><span>${escapeHtml(empty)}</span></li>`;
  return `
    <section class="ih-scene-prep-chat-section">
      <h4>${escapeHtml(title)}</h4>
      <ul>${body}</ul>
    </section>`;
}

export function buildWorldMapScenePrepChatBody(packet = {}) {
  const summary = [
    { label: "Tier", value: packet.tier ? `t${packet.tier}` : "-", note: packet.poiTheme || "" },
    { label: "Actors", value: String(packet.counts?.actors ?? 0), note: `${packet.counts?.monsters ?? 0} monsters / ${packet.counts?.npcs ?? 0} NPC` },
    { label: "Loot", value: String(packet.counts?.loot ?? 0), note: `${packet.containerTheme || "container"} / harvest` },
    { label: "Situation", value: packet.situation?.map?.label ?? "-", note: packet.situation?.title ?? "" },
    { label: "Quest", value: String(packet.counts?.quests ?? 0), note: `${packet.counts?.rumors ?? 0} rumors / ${packet.counts?.rewards ?? 0} rewards` },
    { label: "Navigation", value: String(packet.counts?.navigation ?? 0), note: "4-layer route rows" },
    { label: "Scene blueprint", value: String(packet.counts?.blueprint ?? 0), note: `${packet.counts?.hotspots ?? 0} hotspots / ${packet.counts?.sceneInstructions ?? 0} setup steps` },
    { label: "Checklist", value: String(packet.counts?.checklist ?? 0), note: `${packet.counts?.risks ?? 0} risks` },
  ];
  return `
    <div class="ih-scene-prep-chat">
      ${renderRows("Summary", summary)}
      ${renderRows("Quest seeds", packet.questRows, "No generated quest seeds.")}
      ${renderRows("Rumors", packet.rumorRows, "No generated rumors.")}
      ${renderRows("Rewards", packet.rewardRows, "No generated rewards.")}
      ${renderRows("Consequences", packet.consequenceRows, "No generated consequences.")}
      ${renderRows("Setup", packet.setup)}
      ${renderRows("Scene description", packet.sceneDescriptionRows, "No generated scene description.")}
      ${renderRows("Navigation route", packet.navigationRows, "No generated navigation route.")}
      ${renderRows("Generated situation", packet.situationRows)}
      ${renderRows("Scene setup steps", packet.sceneInstructionRows, "No generated scene setup steps.")}
      ${renderRows("Scene blueprint", packet.sceneBlueprintRows, "No generated scene blueprint.")}
      ${renderRows("Clickable / marker hotspots", packet.sceneHotspotRows, "No generated scene hotspots.")}
      ${renderRows("Map markers", packet.markerRows, "No generated map markers.")}
      ${renderRows("Placement", packet.placementRows, "No generated placement notes.")}
      ${renderRows("Clues", packet.clueRows, "No generated clues.")}
      ${renderRows("Skill checks", packet.skillRows, "No generated skill checks.")}
      ${renderRows("Twists", packet.twistRows, "No optional twists.")}
      ${renderRows("Cast / links", packet.cast, "Связанные сущности не найдены.")}
      ${renderRows("Actors to prepare", packet.actors, "Actors не требуются.")}
      ${renderRows("Loot sources", packet.loot, "Loot sources не найдены.")}
      ${renderRows("Zones", packet.zones, "Зоны не заданы.")}
      ${renderRows("Manual checklist", packet.checklist)}
      ${renderRows("Risks", packet.risks, "Критичных рисков нет.")}
    </div>`;
}

function renderJournalRows(title, rows = [], empty = "Нет данных.") {
  const body = safeArray(rows).length
    ? safeArray(rows).map(row => `
      <tr>
        <th>${escapeHtml(row.label)}</th>
        <td>${escapeHtml(row.value)}</td>
        <td>${escapeHtml(row.note)}</td>
      </tr>`).join("")
    : `
      <tr>
        <td colspan="3">${escapeHtml(empty)}</td>
      </tr>`;
  return `
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead>
        <tr><th>Пункт</th><th>Значение</th><th>Заметка</th></tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}

export function buildWorldMapSceneStagingPlan(packet = {}) {
  const actorText = `${packet.counts?.monsters ?? 0} monsters / ${packet.counts?.npcs ?? 0} NPC`;
  const lootText = `${packet.counts?.loot ?? 0} sources`;
  const zoneText = `${packet.counts?.zones ?? 0} zones`;
  const situationText = `${packet.counts?.placements ?? 0} placements / ${packet.counts?.clues ?? 0} clues`;
  const questText = `${packet.counts?.quests ?? 0} quest seeds / ${packet.counts?.rumors ?? 0} rumors`;
  const blueprintText = `${packet.counts?.blueprint ?? 0} anchors / ${packet.counts?.hotspots ?? 0} hotspots`;
  const navigationText = `${packet.counts?.navigation ?? 0} route rows`;
  const checklistText = `${packet.counts?.checklist ?? 0} checks / ${packet.counts?.risks ?? 0} risks`;
  const rows = [
    {
      label: "Journal runbook",
      value: "Создать или обновить",
      note: "GM-readable страница подготовки сцены; автоспавн отключен.",
      tone: "is-safe",
    },
    {
      label: "Generated situation",
      value: packet.situation?.map?.label || "map pool",
      note: `${packet.situation?.title || "situation"}; ${situationText}.`,
      tone: packet.situation ? "is-active" : "is-warn",
    },
    {
      label: "Actors",
      value: actorText,
      note: "Подготовить вручную только нужных существ/NPC из списка.",
      tone: packet.counts?.actors ? "is-warn" : "is-safe",
    },
    {
      label: "Navigation route",
      value: navigationText,
      note: "Keep global -> region -> local -> scene route visible before activating the generated Scene.",
      tone: packet.counts?.navigation ? "is-road" : "is-warn",
    },
    {
      label: "Scene blueprint",
      value: blueprintText,
      note: "Use these as clickable places, map notes, drawings or manual token placement anchors.",
      tone: packet.counts?.blueprint ? "is-active" : "is-safe",
    },
    {
      label: "Loot",
      value: lootText,
      note: "Пулы лута и harvest источники сохранены как подсказки.",
      tone: packet.counts?.loot ? "is-warn" : "is-safe",
    },
    {
      label: "Quest / rumor",
      value: questText,
      note: "GM can turn these rows into a quest board entry, rumor, reward or faction consequence.",
      tone: packet.counts?.quests || packet.counts?.rumors ? "is-active" : "is-safe",
    },
    {
      label: "Zones",
      value: zoneText,
      note: "Зоны сцены можно использовать для входов, выхода, укрытий и опасностей.",
      tone: packet.counts?.zones ? "is-warn" : "is-safe",
    },
    {
      label: "Manual QA",
      value: checklistText,
      note: "Проверить механику боя, риска, friendly fire и rewards до запуска сессии.",
      tone: packet.counts?.risks ? "is-danger" : "is-safe",
    },
  ];
  return rows;
}

export function buildWorldMapSceneStagingJournalContent(packet = {}) {
  const summary = [
    { label: "Scene", value: packet.title, note: packet.subtitle },
    { label: "Tier", value: packet.tier ? `t${packet.tier}` : "-", note: packet.poiTheme || packet.kind },
    { label: "Status", value: packet.statusLabel, note: packet.timeLabel || "" },
    { label: "Generated map", value: packet.situation?.map?.label ?? "-", note: packet.situation?.title ?? "" },
    { label: "Quest", value: String(packet.counts?.quests ?? 0), note: `${packet.counts?.rumors ?? 0} rumors / ${packet.counts?.rewards ?? 0} rewards` },
    { label: "Actors", value: String(packet.counts?.actors ?? 0), note: `${packet.counts?.monsters ?? 0} monsters / ${packet.counts?.npcs ?? 0} NPC` },
    { label: "Loot", value: String(packet.counts?.loot ?? 0), note: packet.containerTheme || "" },
    { label: "Navigation", value: String(packet.counts?.navigation ?? 0), note: "4-layer route rows" },
  ];
  return `
    <section class="ih-scene-staging-journal">
      <h1>${escapeHtml(packet.title || "Scene Prep")}</h1>
      <p><strong>${escapeHtml(packet.subtitle || "World Map scene prep")}</strong></p>
      <p>Этот Journal является GM staging runbook. Он не создает токены, сцены или Actors автоматически: это контролируемый список подготовки перед сессией.</p>
      ${renderJournalRows("Summary", summary)}
      ${renderJournalRows("Staging plan", buildWorldMapSceneStagingPlan(packet))}
      ${renderJournalRows("Quest seeds", packet.questRows, "No generated quest seeds.")}
      ${renderJournalRows("Rumors", packet.rumorRows, "No generated rumors.")}
      ${renderJournalRows("Rewards", packet.rewardRows, "No generated rewards.")}
      ${renderJournalRows("Consequences", packet.consequenceRows, "No generated consequences.")}
      ${renderJournalRows("Setup", packet.setup)}
      ${renderJournalRows("Scene description", packet.sceneDescriptionRows, "No generated scene description.")}
      ${renderJournalRows("Navigation route", packet.navigationRows, "No generated navigation route.")}
      ${renderJournalRows("Generated situation", packet.situationRows)}
      ${renderJournalRows("Scene setup steps", packet.sceneInstructionRows, "No generated scene setup steps.")}
      ${renderJournalRows("Scene blueprint", packet.sceneBlueprintRows, "No generated scene blueprint.")}
      ${renderJournalRows("Clickable / marker hotspots", packet.sceneHotspotRows, "No generated scene hotspots.")}
      ${renderJournalRows("Map markers", packet.markerRows, "No generated map markers.")}
      ${renderJournalRows("Placement", packet.placementRows, "No generated placement notes.")}
      ${renderJournalRows("Clues", packet.clueRows, "No generated clues.")}
      ${renderJournalRows("Skill checks", packet.skillRows, "No generated skill checks.")}
      ${renderJournalRows("Twists", packet.twistRows, "No optional twists.")}
      ${renderJournalRows("Cast / links", packet.cast, "Связанные сущности не найдены.")}
      ${renderJournalRows("Actors to prepare", packet.actors, "Actors не требуются.")}
      ${renderJournalRows("Loot sources", packet.loot, "Loot sources не найдены.")}
      ${renderJournalRows("Zones", packet.zones, "Зоны не заданы.")}
      ${renderJournalRows("Manual checklist", packet.checklist)}
      ${renderJournalRows("Risks", packet.risks, "Критичных рисков нет.")}
    </section>`;
}

function journalName(packet = {}) {
  return `IH Prep - ${str(packet.title) || "Scene"}`.slice(0, 96);
}

function journalFlagData(packet = {}) {
  return {
    id: packet.id,
    title: packet.title,
    subtitle: packet.subtitle,
    tier: packet.tier ?? "",
    updatedAt: packet.updatedAt ?? nowStamp(),
  };
}

function journalPageData(packet = {}) {
  return {
    name: JOURNAL_PAGE_NAME,
    type: "text",
    text: {
      format: 1,
      content: buildWorldMapSceneStagingJournalContent(packet),
    },
    flags: {
      [SYSTEM_ID]: {
        [JOURNAL_PAGE_FLAG_KEY]: journalFlagData(packet),
      },
    },
  };
}

function getFlag(document, key) {
  return document?.getFlag?.(SYSTEM_ID, key) ?? document?.flags?.[SYSTEM_ID]?.[key] ?? null;
}

function findExistingStagingJournal(packet = {}) {
  const collection = globalThis.game?.journal;
  if (!collection) return null;
  const storedId = str(packet.staging?.journalId);
  if (storedId && typeof collection.get === "function") {
    const byId = collection.get(storedId);
    if (byId) return byId;
  }
  return collectionValues(collection).find(entry => getFlag(entry, JOURNAL_FLAG_KEY)?.id === packet.id) ?? null;
}

async function upsertJournalPage(journal, packet) {
  if (!journal) return null;
  const pageData = journalPageData(packet);
  const pages = collectionValues(journal.pages);
  const page = pages.find(candidate => (
    getFlag(candidate, JOURNAL_PAGE_FLAG_KEY)?.id === packet.id
    || candidate?.name === JOURNAL_PAGE_NAME
  ));
  if (page?.update) {
    await page.update({
      name: pageData.name,
      type: pageData.type,
      text: pageData.text,
      flags: pageData.flags,
    });
    return page;
  }
  if (journal.createEmbeddedDocuments) {
    const created = await journal.createEmbeddedDocuments("JournalEntryPage", [pageData]);
    return safeArray(created)[0] ?? null;
  }
  return null;
}

function asPacket(input = {}, options = {}) {
  if (input?.id && input?.counts) {
    return {
      ...input,
      updatedAt: nowStamp(),
      timeLabel: timeLabel(nowStamp()),
    };
  }
  return buildWorldMapScenePrepPacket(input, {
    ...options,
    updatedAt: nowStamp(),
  });
}

export async function materializeWorldMapSceneStaging(input = {}, options = {}) {
  if (!globalThis.game?.user?.isGM) {
    throw new Error("World Map scene staging can be materialized only by a GM user.");
  }
  if (!globalThis.JournalEntry?.create) {
    throw new Error("JournalEntry API is unavailable; open this from a running Foundry world.");
  }

  const previous = getWorldMapScenePrepState();
  const existingId = input?.id ?? packetIdFromBrief(input);
  const previousPacket = previous.packets?.[existingId] ?? {};
  let packet = asPacket(input, {
    ...options,
    createdAt: previousPacket.createdAt ?? nowStamp(),
  });
  packet = {
    ...previousPacket,
    ...packet,
    createdAt: previousPacket.createdAt ?? packet.createdAt ?? nowStamp(),
    updatedAt: nowStamp(),
    timeLabel: timeLabel(nowStamp()),
  };

  const existing = findExistingStagingJournal(packet);
  let journal = existing;
  let created = false;
  if (!journal) {
    journal = await globalThis.JournalEntry.create({
      name: journalName(packet),
      pages: [journalPageData(packet)],
      flags: {
        [SYSTEM_ID]: {
          [JOURNAL_FLAG_KEY]: journalFlagData(packet),
        },
      },
    }, { renderSheet: false });
    created = true;
  } else {
    await journal.update?.({
      name: journalName(packet),
      [`flags.${SYSTEM_ID}.${JOURNAL_FLAG_KEY}`]: journalFlagData(packet),
    });
    await upsertJournalPage(journal, packet);
  }

  packet = {
    ...packet,
    staging: {
      journalId: journal?.id ?? "",
      journalUuid: journal?.uuid ?? "",
      journalName: journal?.name ?? journalName(packet),
      updatedAt: nowStamp(),
      updatedLabel: timeLabel(nowStamp()),
    },
  };
  const { state } = await persistPreparedPacket(packet);
  return {
    packet,
    state,
    journal,
    created,
    updated: !created,
    planRows: buildWorldMapSceneStagingPlan(packet),
  };
}

export function buildWorldMapSceneStagingChatBody(result = {}) {
  const packet = result.packet ?? result;
  const journalLabel = packet.staging?.journalName || journalName(packet);
  const summary = [
    { label: "Journal", value: journalLabel, note: result.created ? "created" : "updated" },
    { label: "Situation", value: packet.situation?.map?.label || "-", note: packet.situation?.title || "" },
    { label: "Safety", value: "manual staging", note: "Tokens, Actors и Scenes не создавались автоматически." },
    { label: "Tier", value: packet.tier ? `t${packet.tier}` : "-", note: packet.poiTheme || packet.kind },
    { label: "Updated", value: packet.staging?.updatedLabel || packet.timeLabel || "", note: packet.createdBy ? `GM: ${packet.createdBy}` : "" },
  ];
  return `
    <div class="ih-scene-prep-chat ih-scene-staging-chat">
      ${renderRows("Staging result", summary)}
      ${renderRows("Next actions", result.planRows ?? buildWorldMapSceneStagingPlan(packet))}
      ${renderRows("Quest seeds", packet.questRows, "No generated quest seeds.")}
      ${renderRows("Rumors", packet.rumorRows, "No generated rumors.")}
      ${renderRows("Rewards", packet.rewardRows, "No generated rewards.")}
      ${renderRows("Consequences", packet.consequenceRows, "No generated consequences.")}
      ${renderRows("Scene setup steps", packet.sceneInstructionRows, "No generated scene setup steps.")}
      ${renderRows("Scene description", packet.sceneDescriptionRows, "No generated scene description.")}
      ${renderRows("Navigation route", packet.navigationRows, "No generated navigation route.")}
      ${renderRows("Scene blueprint", packet.sceneBlueprintRows, "No generated scene blueprint.")}
      ${renderRows("Clickable / marker hotspots", packet.sceneHotspotRows, "No generated scene hotspots.")}
      ${renderRows("Placement", packet.placementRows, "No generated placement notes.")}
      ${renderRows("Clues", packet.clueRows, "No generated clues.")}
      ${renderRows("Actors to prepare", packet.actors, "Actors не требуются.")}
      ${renderRows("Loot sources", packet.loot, "Loot sources не найдены.")}
      ${renderRows("Zones", packet.zones, "Зоны не заданы.")}
    </div>`;
}
