const STATUS_META = Object.freeze({
  ok:    { tone: "is-good", label: "готово", score: 1 },
  warn:  { tone: "is-warn", label: "есть риски", score: 0.65 },
  todo:  { tone: "is-todo", label: "нужно прогнать", score: 0.25 },
  block: { tone: "is-danger", label: "блокер", score: 0 },
});

const MANUAL_STATUS_META = Object.freeze({
  todo:    { tone: "is-todo", label: "Todo", score: 0 },
  pass:    { tone: "is-good", label: "Pass", score: 1 },
  fail:    { tone: "is-danger", label: "Fail", score: 0 },
  blocked: { tone: "is-danger", label: "Blocked", score: 0 },
});

const MANUAL_TEST_SECTIONS = Object.freeze([
  {
    id: "startup",
    title: "Запуск и базовый мир",
    owner: "GM",
    minutes: 8,
    steps: [
      "Открыть тестовый мир на Foundry v12 build 343 без консольных ошибок.",
      "Открыть лист персонажа, NPC/monster, торговца, контейнера и World Tools.",
      "Проверить, что HUD боя и pending inventory не перехватывают фокус окон.",
    ],
    pass: "Мир открывается, основные окна рендерятся, критических console errors нет.",
  },
  {
    id: "inventory-trade",
    title: "Tarkov inventory, pending и торговля",
    owner: "GM + player",
    minutes: 15,
    steps: [
      "Купить 2-3 предмета разных размеров у торговца.",
      "Авторазместить pending, затем вручную перетащить предмет в руку/рюкзак/пояс.",
      "Проверить, что предмет нельзя носить нераспределённым и pending остаётся видимым рядом с инвентарём.",
      "Продать предмет обратно и проверить валюту copper/silver/gold.",
    ],
    pass: "Предметы занимают правильные клетки, pending не даёт обходить вес/слоты, торговля не дублирует и не теряет вещи.",
  },
  {
    id: "combat-single",
    title: "Single-target combat и VFX",
    owner: "GM",
    minutes: 14,
    steps: [
      "Провести melee hit, melee miss, ranged/throw hit и spell hit.",
      "Открыть Combat Director и выполнить Attack / cast через selected или bench scope.",
      "Проверить чат-карточку Raw -> Shield -> Armor -> Body.",
      "Проверить floating damage, miss, armor/shield chips и отсутствие кликовых блокировок overlay.",
      "Отключить настройку Combat VFX и повторить один удар.",
    ],
    pass: "Математика и чат совпадают, VFX помогает читать бой и отключается без побочных эффектов.",
  },
  {
    id: "armor-shields",
    title: "Броня, щиты и прочность",
    owner: "GM",
    minutes: 12,
    steps: [
      "Удар 50 по броне protection 25/durability 100 должен дать 25 в тело и 50/100 прочности.",
      "Удар 50 по броне protection 25/durability 10 должен сломать броню и пропустить 40.",
      "Удар через щит должен сначала снять защиту щита, затем броню, затем тело.",
      "Проверить light/medium/heavy armor penalties на персонаже с разной силой/атлетикой.",
    ],
    pass: "Щит и броня работают как последовательные durable layers, штрафы брони понятны в листе.",
  },
  {
    id: "aoe-spells",
    title: "AoE, заклинания и friendly fire",
    owner: "GM",
    minutes: 18,
    steps: [
      "Поставить cone/circle/ray template по нескольким токенам.",
      "Проверить отдельный бросок попадания по каждой цели.",
      "Проверить friendlyFire off/on/auto на союзнике в зоне.",
      "Проверить fixed/random/aimed target zone через Combat Director, включая abdomen.",
      "Проверить utility/heal AoE по союзникам.",
    ],
    pass: "AoE выбирает цели корректно, союзники обрабатываются по режиму атаки, зоны тела отражены в результате.",
  },
  {
    id: "medicine-trauma",
    title: "Медицина, травмы и отдых",
    owner: "GM + player",
    minutes: 12,
    steps: [
      "Нанести травму по руке/ноге/torso/abdomen.",
      "Проверить bleeding/fracture/shock/destroyed в HUD и листе.",
      "Применить лечение/перевязку, затем short rest и long rest.",
      "Проверить энергию, ману и soul reserve после восстановления.",
    ],
    pass: "Травмы видны, лечатся ожидаемо, восстановление не создаёт лишнюю прокачку ресурсов.",
  },
  {
    id: "gm-tools",
    title: "GM Tools, ресурсы и управление временем",
    owner: "GM",
    minutes: 10,
    steps: [
      "Открыть World Tools и выбрать scope: selected, targets, selected+targets, active combat и bench.",
      "Проверить Подготовить бой, После боя, Секунды + pending и Синхр. травмы на 1-2 актёрах.",
      "Вручную применить HP/Mana/Energy, прочность, combat seconds, эффект и damage/heal по зоне тела.",
      "Запустить quick Attack / cast из GM-панели и убедиться, что chat card и цели читаются корректно.",
      "Сдвинуть world time на 6 секунд и 1 час, затем проверить отображение времени в панели.",
    ],
    pass: "GM может стабилизировать сцену, управлять ресурсами/эффектами/секундами и быстро прогонять атаки без консоли.",
  },
  {
    id: "world-travel",
    title: "World map, scene brief и travel",
    owner: "GM",
    minutes: 12,
    steps: [
      "Открыть World Map на 4 уровнях масштаба через навигацию global -> region -> local -> encounter.",
      "Открыть Map: Local и Map: Encounter из Release QA toolbelt.",
      "Проверить GM scene brief: setup, cast, zones, loot, manual checks и risks.",
      "Проверить Encounter kit: suggested monsters из bestiary, suggested NPC archetypes, loot generators и harvest pools.",
      "Отправить scene brief в чат и убедиться, что карточка читается.",
      "Нажать Prep packet и проверить GM-card: actors, loot sources, checklist, risks; токены не должны автоспавниться.",
      "Нажать Journal/stage и проверить, что создан или обновлен GM Journal runbook без создания токенов, Actors или Scene.",
      "Создать POI и выполнить автопривязку к карте.",
      "Сгенерировать session brief региона.",
      "Запустить travel на карте и проверить визуал маршрута/событий.",
    ],
    pass: "Карта, переходы, GM brief, POI, travel и session prep дают связный слой для ведения первой сессии.",
  },
  {
    id: "content-art",
    title: "Контент, packs и изображения",
    owner: "GM",
    minutes: 15,
    steps: [
      "Запустить content readiness с strict art.",
      "Проверить, что ключевые items/spells/armor/NPC/monsters имеют финальные изображения.",
      "Синхронизировать packs только после чистого dry-run или осознанного списка изменений.",
      "Открыть compendium browser и быстро просмотреть оружие, броню, магию, consumables, monsters.",
    ],
    pass: "Контентный патч можно проверять в игре без очевидных заглушек и сломанных pack entries.",
  },
]);

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function statusMeta(status = "todo") {
  return STATUS_META[status] ?? STATUS_META.todo;
}

function releaseGate(id, label, status, summary, action = "", details = {}) {
  const meta = statusMeta(status);
  return {
    id,
    label,
    status,
    statusLabel: meta.label,
    tone: meta.tone,
    summary,
    action,
    details,
  };
}

function contentStatus(contentReport = null) {
  if (!contentReport) return "todo";
  const blocking = num(contentReport.summary?.blockingErrors, 0);
  const warnings = num(contentReport.summary?.warnings, 0);
  const release = contentReport.release ?? {};
  if (blocking > 0 || contentReport.ok === false) return "block";
  if (!release.contentPatchReady || warnings > 0 || num(contentReport.summary?.missingSystemImages, 0) > 0) return "warn";
  return "ok";
}

function runtimeStatus(runtimeReport = null) {
  if (!runtimeReport) return "todo";
  const errors = num(runtimeReport.counts?.error, 0);
  const warnings = num(runtimeReport.counts?.warn, 0);
  if (errors > 0 || runtimeReport.ok === false) return "block";
  if (warnings > 0) return "warn";
  return "ok";
}

function packPlanStatus(packPlanReport = null) {
  if (!packPlanReport) return "todo";
  const summary = packPlanReport.summary ?? {};
  if (
    packPlanReport.ok === false
    || num(summary.missingPacks, 0) > 0
    || num(summary.documentTypeMismatches, 0) > 0
    || num(summary.indexErrors, 0) > 0
  ) return "block";
  if (num(summary.deltaAbs, 0) > 0) return "warn";
  return "ok";
}

function pipelineStatus(pipelineReport = null) {
  if (!pipelineReport) return "todo";
  const summary = pipelineReport.summary ?? {};
  const blockers =
    num(summary.failedSteps, 0)
    + num(summary.preflightErrors, 0)
    + num(summary.catalogErrors, 0)
    + num(summary.assetErrors, 0)
    + num(summary.generatedPackSourceErrors, 0)
    + num(summary.balanceErrors, 0)
    + num(summary.validationErrors, 0)
    + num(summary.repairErrors, 0);
  if (pipelineReport.ok === false || blockers > 0) return "block";
  if (
    num(summary.mutatingStepsPlanned, 0) > 0
    || num(summary.balanceWarnings, 0) > 0
    || num(summary.mutatingStepsBlocked, 0) > 0
  ) return "warn";
  return "ok";
}

function artCockpitStatus(artCockpitReport = null) {
  if (!artCockpitReport) return "todo";
  const summary = artCockpitReport.summary ?? {};
  if (
    artCockpitReport.ok === false
    && (
      num(summary.blockers, 0) > 0
      || num(summary.missingImages, 0) > 0
      || num(summary.missingSystemImages, 0) > 0
      || num(summary.assetErrors, 0) > 0
    )
  ) return "block";
  if (
    num(summary.criticalNeeds, 0) > 0
    || num(summary.criticalVisualQaPending, 0) > 0
    || num(summary.needsFinalArt, 0) > 0
    || num(summary.visualQaPending, 0) > 0
    || num(summary.actorNeedsFinalArt, 0) > 0
  ) return "warn";
  return "ok";
}

function sessionReadinessStatus(sessionReadinessReport = null) {
  if (!sessionReadinessReport) return "todo";
  const summary = sessionReadinessReport.summary ?? {};
  if (sessionReadinessReport.ok === false && num(summary.blockers, 0) > 0) return "block";
  if (num(summary.warnings, 0) > 0 || sessionReadinessReport.summary?.status === "warn") return "warn";
  return "ok";
}

function worldStatus(regionRows = []) {
  const rows = Array.isArray(regionRows) ? regionRows : [];
  if (!rows.length) return { status: "todo", avg: 0, ready: 0, total: 0 };
  const avg = Math.round(rows.reduce((sum, row) => sum + num(row.readiness, 0), 0) / rows.length);
  const ready = rows.filter(row => num(row.readiness, 0) >= 80).length;
  const status = avg >= 80 ? "ok" : avg >= 55 ? "warn" : "block";
  return { status, avg, ready, total: rows.length };
}

function normalizeManualStatus(value = "todo") {
  const key = String(value ?? "todo").trim();
  return MANUAL_STATUS_META[key] ? key : "todo";
}

function normalizeManualStatuses(doneIds = [], statuses = {}) {
  const done = new Set(Array.isArray(doneIds) ? doneIds.map(String).filter(Boolean) : []);
  const rawStatuses = statuses && typeof statuses === "object" ? statuses : {};
  const out = {};
  for (const section of MANUAL_TEST_SECTIONS) {
    const legacyStatus = done.has(section.id) ? "pass" : "todo";
    out[section.id] = normalizeManualStatus(rawStatuses[section.id] ?? legacyStatus);
  }
  return out;
}

function manualSummary(doneIds = [], statuses = {}) {
  const normalized = normalizeManualStatuses(doneIds, statuses);
  const counts = { todo: 0, pass: 0, fail: 0, blocked: 0 };
  let completedMinutes = 0;
  let totalMinutes = 0;
  for (const section of MANUAL_TEST_SECTIONS) {
    const status = normalizeManualStatus(normalized[section.id]);
    counts[status] = (counts[status] ?? 0) + 1;
    const minutes = num(section.minutes, 0);
    totalMinutes += minutes;
    if (status === "pass") completedMinutes += minutes;
  }
  const total = MANUAL_TEST_SECTIONS.length;
  const hasFailures = counts.fail > 0 || counts.blocked > 0;
  const status = hasFailures ? "block" : counts.pass >= total ? "ok" : counts.pass > 0 ? "warn" : "todo";
  const nextSection = MANUAL_TEST_SECTIONS.find(section => normalized[section.id] !== "pass") ?? null;
  return {
    ...counts,
    total,
    done: counts.pass,
    status,
    tone: statusMeta(status).tone,
    statusLabel: statusMeta(status).label,
    progressPct: total ? Math.round((counts.pass / total) * 100) : 0,
    completedMinutes,
    totalMinutes,
    nextScenarioId: nextSection?.id ?? "",
    nextScenarioTitle: nextSection?.title ?? "All manual scenarios passed",
    hasFailures,
  };
}

function manualStatus(doneIds = [], statuses = {}) {
  return manualSummary(doneIds, statuses).status;
}

function gateScore(gates = []) {
  const rows = gates.filter(Boolean);
  if (!rows.length) return 0;
  const score = rows.reduce((sum, gate) => sum + statusMeta(gate.status).score, 0);
  return Math.round((score / rows.length) * 100);
}

function firstAction(gates = []) {
  for (const status of ["block", "warn", "todo"]) {
    const gate = gates.find(row => row.status === status && row.action);
    if (gate) return gate.action;
  }
  return "Провести полный ручной тестовый прогон и зафиксировать найденные баги.";
}

function stageLabel(score, gates = []) {
  if (gates.some(gate => gate.status === "block")) return "есть блокеры";
  if (score >= 90) return "release candidate";
  if (score >= 75) return "test candidate";
  if (score >= 55) return "feature-complete draft";
  return "stabilization";
}

function packPlanRows(packPlanReport = null) {
  return (Array.isArray(packPlanReport?.packs) ? packPlanReport.packs : []).map(row => {
    const delta = num(row.delta, 0);
    return {
      packName: row.packName,
      label: row.label ?? row.packName,
      documentType: row.documentType,
      expected: num(row.expected, 0),
      existing: row.existing === null || row.existing === undefined ? "?" : num(row.existing, 0),
      delta,
      found: row.found !== false,
      tone: row.found === false || row.documentTypeMismatch || row.indexError
        ? "is-danger"
        : delta !== 0
          ? "is-warn"
          : "is-good",
      note: row.indexError
        ? row.indexError
        : row.documentTypeMismatch
          ? `type ${row.documentTypeActual || "unknown"} != ${row.documentType}`
          : delta === 0
            ? "in sync"
            : delta > 0
              ? `${delta} extra`
              : `${Math.abs(delta)} missing`,
    };
  });
}

function pipelineStepRows(pipelineReport = null) {
  return (Array.isArray(pipelineReport?.steps) ? pipelineReport.steps : []).map(step => ({
    id: step.id,
    label: step.label ?? step.id,
    status: step.status ?? "unknown",
    mode: step.mode ?? "",
    mutates: Boolean(step.mutates),
    reason: step.reason ?? step.error ?? "",
    tone: step.status === "failed"
      ? "is-danger"
      : step.status === "planned"
        ? "is-warn"
        : step.status === "skipped"
          ? "is-todo"
          : "is-good",
  }));
}

export function getReleaseManualTestSections(doneIds = [], statuses = {}) {
  const normalized = normalizeManualStatuses(doneIds, statuses);
  return MANUAL_TEST_SECTIONS.map(section => ({
    ...section,
    manualStatus: normalizeManualStatus(normalized[section.id]),
    statusLabel: MANUAL_STATUS_META[normalizeManualStatus(normalized[section.id])].label,
    tone: MANUAL_STATUS_META[normalizeManualStatus(normalized[section.id])].tone,
    done: normalizeManualStatus(normalized[section.id]) === "pass",
    failed: normalizeManualStatus(normalized[section.id]) === "fail",
    blocked: normalizeManualStatus(normalized[section.id]) === "blocked",
    stepCount: section.steps.length,
  }));
}

export function buildReleaseQaSnapshot({
  contentReport = null,
  runtimeReport = null,
  packPlanReport = null,
  pipelineReport = null,
  artCockpitReport = null,
  sessionReadinessReport = null,
  regionRows = [],
  manualDone = [],
  manualStatuses = {},
} = {}) {
  const world = worldStatus(regionRows);
  const content = contentStatus(contentReport);
  const runtime = runtimeStatus(runtimeReport);
  const packPlan = packPlanStatus(packPlanReport);
  const pipeline = pipelineStatus(pipelineReport);
  const art = artCockpitStatus(artCockpitReport);
  const session = sessionReadinessStatus(sessionReadinessReport);
  const manualStats = manualSummary(manualDone, manualStatuses);
  const manual = manualStats.status;
  const release = contentReport?.release ?? null;
  const packSummary = packPlanReport?.summary ?? {};
  const pipelineSummary = pipelineReport?.summary ?? {};
  const artSummary = artCockpitReport?.summary ?? {};
  const sessionSummary = sessionReadinessReport?.summary ?? {};
  const gates = [
    releaseGate(
      "content-readiness",
      "Content readiness",
      content,
      contentReport
        ? `${release?.stageLabel ?? "content"} (${release?.scorePct ?? "?"}%), warnings=${num(contentReport.summary?.warnings, 0)}`
        : "не запускалось в этом окне",
      "Запустить Content readiness (strict art) в World Tools.",
      contentReport?.summary ?? {},
    ),
    releaseGate(
      "content-art-cockpit",
      "Content art cockpit",
      art,
      artCockpitReport
        ? `${artCockpitReport.stage ?? "art"}, final=${num(artSummary.overallFinalCoveragePct, 0)}%, visualQA=${num(artSummary.visualQaPending, 0)}, actorNeeds=${num(artSummary.actorNeedsFinalArt, 0)}`
        : "not run in this world",
      "Run Art cockpit before the content art patch.",
      artSummary,
    ),
    releaseGate(
      "session-readiness",
      "Session readiness",
      session,
      sessionReadinessReport
        ? `${sessionReadinessReport.stage ?? "session"}, mapsMissing=${num(sessionSummary.mapsMissing, 0)}, monsterTiers=${num(sessionSummary.monsterTierRowsOk, 0)}/10, npcTiers=${num(sessionSummary.npcTierRowsOk, 0)}/10, generators=${num(sessionSummary.generatorRowsOk, 0)}`
        : "not run in this world",
      "Run Session readiness before content/map generation and the weekend test.",
      sessionSummary,
    ),
    releaseGate(
      "generated-pack-plan",
      "Generated pack plan",
      packPlan,
      packPlanReport
        ? `${num(packSummary.packs, 0)} packs, expected=${num(packSummary.expected, 0)}, existing=${num(packSummary.existing, 0)}, delta=${num(packSummary.deltaAbs, 0)}`
        : "not calculated in this world",
      "Run Pack plan before syncing generated compendiums.",
      packSummary,
    ),
    releaseGate(
      "content-pipeline-dry-run",
      "Content pipeline dry-run",
      pipeline,
      pipelineReport
        ? `planned=${num(pipelineSummary.mutatingStepsPlanned, 0)}, failed=${num(pipelineSummary.failedSteps, 0)}, validation=${num(pipelineSummary.validationErrors, 0)}`
        : "not run in this world",
      "Run Pipeline dry-run before applying the content patch.",
      pipelineSummary,
    ),
    releaseGate(
      "runtime-smoke",
      "Runtime smoke",
      runtime,
      runtimeReport
        ? `${runtimeReport.ok ? "OK" : "ISSUES"}, errors=${num(runtimeReport.counts?.error, 0)}, warnings=${num(runtimeReport.counts?.warn, 0)}`
        : "не запускалось в этом окне",
      "Запустить Runtime smoke внутри Foundry.",
      runtimeReport?.summary ?? {},
    ),
    releaseGate(
      "world-session-layer",
      "World/session layer",
      world.status,
      world.total ? `${world.avg}% avg, ${world.ready}/${world.total} регионов готовы` : "нет региональных данных",
      "Сгенерировать/привязать POI и создать session brief для основного региона.",
      world,
    ),
    releaseGate(
      "manual-weekend-test",
      "Manual weekend test",
      manual,
      `${manualStats.pass}/${manualStats.total} pass, ${manualStats.fail} fail, ${manualStats.blocked} blocked`,
      manualStats.hasFailures
        ? "Fix failed/blocked manual scenarios before calling this a release candidate."
        : "Run the weekend checklist by layer and mark each scenario result.",
    ),
  ];

  const scorePct = gateScore(gates);
  const packRows = packPlanRows(packPlanReport);
  const pipelineRows = pipelineStepRows(pipelineReport);
  const artCatalogRows = Array.isArray(artCockpitReport?.itemCatalogRows) ? artCockpitReport.itemCatalogRows : [];
  const artPriorityRows = Array.isArray(artCockpitReport?.itemPriorityRows) ? artCockpitReport.itemPriorityRows : [];
  const artActorRows = Array.isArray(artCockpitReport?.actorTypeRows) ? artCockpitReport.actorTypeRows : [];
  const artBacklogRows = Array.isArray(artCockpitReport?.itemBacklogRows) ? artCockpitReport.itemBacklogRows : [];
  const artActorBacklogRows = Array.isArray(artCockpitReport?.actorBacklogRows) ? artCockpitReport.actorBacklogRows : [];
  const sessionMapRows = Array.isArray(sessionReadinessReport?.maps?.archetypeRows) ? sessionReadinessReport.maps.archetypeRows : [];
  const sessionMapLevelRows = Array.isArray(sessionReadinessReport?.maps?.levelRows) ? sessionReadinessReport.maps.levelRows : [];
  const sessionMonsterRows = Array.isArray(sessionReadinessReport?.monsters?.rows) ? sessionReadinessReport.monsters.rows : [];
  const sessionNpcTierRows = Array.isArray(sessionReadinessReport?.npcs?.exactTierRows) ? sessionReadinessReport.npcs.exactTierRows : [];
  const sessionNpcBandRows = Array.isArray(sessionReadinessReport?.npcs?.bandRows) ? sessionReadinessReport.npcs.bandRows : [];
  const sessionGeneratorRows = Array.isArray(sessionReadinessReport?.generators?.rows) ? sessionReadinessReport.generators.rows : [];
  const sessionGmRows = Array.isArray(sessionReadinessReport?.gm?.rows) ? sessionReadinessReport.gm.rows : [];
  return {
    scorePct,
    stageLabel: stageLabel(scorePct, gates),
    gates,
    manualSections: getReleaseManualTestSections(manualDone, manualStatuses),
    manualSummary: manualStats,
    artSummary,
    artCatalogRows,
    artPriorityRows,
    artActorRows,
    artBacklogRows: artBacklogRows.slice(0, 24),
    artActorBacklogRows: artActorBacklogRows.slice(0, 18),
    hasArtCockpit: Boolean(artCockpitReport),
    hasArtCatalogRows: artCatalogRows.length > 0,
    hasArtBacklogRows: artBacklogRows.length > 0 || artActorBacklogRows.length > 0,
    sessionSummary,
    sessionMapRows,
    sessionMapLevelRows,
    sessionMonsterRows,
    sessionNpcTierRows,
    sessionNpcBandRows,
    sessionGeneratorRows,
    sessionGmRows,
    sessionNextActions: Array.isArray(sessionReadinessReport?.nextActions) ? sessionReadinessReport.nextActions : [],
    hasSessionReadiness: Boolean(sessionReadinessReport),
    hasSessionWarnings: sessionMapRows.some(row => row.status !== "ok")
      || sessionMonsterRows.some(row => row.status !== "ok")
      || sessionNpcTierRows.some(row => row.status !== "ok")
      || sessionNpcBandRows.some(row => row.status !== "ok")
      || sessionGeneratorRows.some(row => row.status !== "ok")
      || sessionGmRows.some(row => row.status !== "ok"),
    packPlanRows: packRows,
    hasPackPlanRows: packRows.length > 0,
    pipelineSteps: pipelineRows,
    hasPipelineSteps: pipelineRows.length > 0,
    nextAction: firstAction(gates),
    contentPatchReady: Boolean(release?.contentPatchReady),
    sessionReady: session === "ok",
    packPlanReady: packPlan === "ok" || packPlan === "warn",
    pipelineReady: pipeline === "ok" || pipeline === "warn",
    runtimeReady: runtime === "ok",
    manualReady: manual === "ok",
  };
}

export function formatReleaseQaReport(snapshot = null) {
  if (!snapshot) return "Iron Hills Release QA: unavailable";
  const lines = [
    `Iron Hills Release QA: ${snapshot.stageLabel} (${snapshot.scorePct}%)`,
    `Next action: ${snapshot.nextAction}`,
    "",
    "Gates:",
  ];
  for (const gate of snapshot.gates ?? []) {
    lines.push(`- [${String(gate.status).toUpperCase()}] ${gate.label}: ${gate.summary}`);
    if (gate.action) lines.push(`  action: ${gate.action}`);
  }
  if (snapshot.hasArtCockpit) {
    lines.push("", "Content art cockpit:");
    lines.push(`- Coverage: ${snapshot.artSummary?.overallFinalCoveragePct ?? 0}%, replacements=${snapshot.artSummary?.needsFinalArt ?? 0}, visualQA=${snapshot.artSummary?.visualQaPending ?? 0}, actor needs=${snapshot.artSummary?.actorNeedsFinalArt ?? 0}`);
    for (const row of snapshot.artCatalogRows?.slice(0, 12) ?? []) {
      lines.push(`- ${row.id}: final=${row.system}/${row.total}, replacements=${row.needsFinalArt}, visualQA=${row.visualQaPending}, priority=${row.priority}`);
    }
  }
  if (snapshot.hasSessionReadiness) {
    lines.push("", "Session readiness:");
    lines.push(`- ${snapshot.sessionSummary?.stage ?? "session"} (${snapshot.sessionSummary?.scorePct ?? 0}%): blockers=${snapshot.sessionSummary?.blockers ?? 0}, warnings=${snapshot.sessionSummary?.warnings ?? 0}, mapsMissing=${snapshot.sessionSummary?.mapsMissing ?? 0}`);
    for (const row of snapshot.sessionMapRows?.filter(row => row.status !== "ok").slice(0, 12) ?? []) {
      lines.push(`- [${String(row.status).toUpperCase()}] map ${row.label}: ${row.note}`);
    }
    for (const row of snapshot.sessionGeneratorRows?.filter(row => row.status !== "ok").slice(0, 12) ?? []) {
      lines.push(`- [${String(row.status).toUpperCase()}] generator ${row.label}: ${row.note}`);
    }
    for (const action of snapshot.sessionNextActions?.slice(0, 6) ?? []) {
      lines.push(`  action: ${action}`);
    }
  }
  if (snapshot.hasPackPlanRows) {
    lines.push("", "Generated pack plan:");
    for (const row of snapshot.packPlanRows ?? []) {
      lines.push(`- ${row.packName}: expected=${row.expected}, existing=${row.existing}, ${row.note}`);
    }
  }
  if (snapshot.hasPipelineSteps) {
    lines.push("", "Content pipeline dry-run:");
    for (const step of snapshot.pipelineSteps ?? []) {
      lines.push(`- [${String(step.status).toUpperCase()}] ${step.label}${step.reason ? `: ${step.reason}` : ""}`);
    }
  }
  lines.push("", "Manual weekend scenarios:");
  if (snapshot.manualSummary) {
    lines.push(`Manual status: ${snapshot.manualSummary.pass}/${snapshot.manualSummary.total} pass, ${snapshot.manualSummary.fail} fail, ${snapshot.manualSummary.blocked} blocked, ${snapshot.manualSummary.todo} todo`);
  }
  for (const section of snapshot.manualSections ?? []) {
    lines.push(`- [${String(section.manualStatus ?? "todo").toUpperCase()}] ${section.title} (${section.minutes} min): ${section.pass}`);
  }
  return lines.join("\n");
}
