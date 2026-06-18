import {
  auditIronHillsCatalogs,
  formatCatalogReadinessReport,
} from "./catalog-readiness-service.mjs";
import {
  auditIronHillsAssets,
  formatAssetAuditReport,
} from "./content-asset-audit-service.mjs";
import {
  formatContentValidationReport,
  validateGeneratedPackSources,
  validateIronHillsContent,
} from "./content-validation-service.mjs";
import {
  buildIronHillsContentBalanceReport,
  formatContentBalanceReport,
} from "./content-balance-service.mjs";

function emptyCounts() {
  return { error: 0, warn: 0, info: 0 };
}

function skippedReport(scope, reason = "disabled") {
  return {
    ok: true,
    skipped: true,
    mode: "skipped",
    scope,
    reason,
    counts: emptyCounts(),
    findings: [],
    sections: [],
  };
}

function normalizePackIds(values = null) {
  if (!Array.isArray(values) || !values.length) return null;
  return values.map(value => String(value ?? "").trim().replace(/^iron-hills-system\./, "")).filter(Boolean);
}

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function countErrors(report) {
  return numberOr(report?.counts?.error, 0);
}

function countWarnings(report) {
  return numberOr(report?.counts?.warn, 0);
}

function countInfo(report) {
  return numberOr(report?.counts?.info, 0);
}

function hasBlockingErrors(report) {
  return Boolean(report && report.ok === false) || countErrors(report) > 0;
}

function percent(value, total) {
  const n = Number(value);
  const d = Number(total);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function statusScore(status) {
  if (status === "ok") return 1;
  if (status === "warn") return 0.65;
  if (status === "todo" || status === "skipped") return 0.25;
  return 0;
}

function gate(id, label, status, summary, actions = [], details = {}) {
  return {
    id,
    label,
    status,
    summary,
    actions: actions.filter(Boolean),
    details,
  };
}

function sectionStatus(report, { skippedStatus = "skipped" } = {}) {
  if (!report || report.skipped) return skippedStatus;
  if (countErrors(report) > 0 || report.ok === false) return "block";
  if (countWarnings(report) > 0) return "warn";
  return "ok";
}

function imageSummary(assets = null) {
  const summary = assets?.summary ?? {};
  const images = numberOr(summary.imagesChecked);
  const systemImages = numberOr(summary.systemImages);
  const coreImages = numberOr(summary.coreImages);
  const genericImages = numberOr(summary.genericImages);
  const moduleImages = numberOr(summary.moduleImages);
  const remoteImages = numberOr(summary.remoteImages);
  const otherImages = numberOr(summary.otherImages);
  const missingImages = numberOr(summary.missingImages);
  const missingSystemImages = numberOr(summary.missingSystemImages);
  const nonSystemImages = Math.max(0, images - systemImages);

  return {
    images,
    systemImages,
    coreImages,
    genericImages,
    moduleImages,
    remoteImages,
    otherImages,
    missingImages,
    missingSystemImages,
    nonSystemImages,
    systemCoveragePct: percent(systemImages, images),
  };
}

function packDryRunHasPendingChanges(packDryRun = null) {
  const summary = summarizePackDryRun(packDryRun);
  return !summary.skipped && (
    summary.created > 0
    || summary.updated > 0
    || summary.deleted > 0
    || summary.embeddedPut > 0
    || summary.embeddedDeleted > 0
    || summary.duplicates > 0
    || summary.failed > 0
  );
}

function firstActionFromGates(gates) {
  for (const row of gates) {
    if (row.status === "block" && row.actions.length) return row.actions[0];
  }
  for (const row of gates) {
    if (row.status === "warn" && row.actions.length) return row.actions[0];
  }
  for (const row of gates) {
    if ((row.status === "todo" || row.status === "skipped") && row.actions.length) return row.actions[0];
  }
  return "Run the Foundry runtime smoke and a manual session test before calling the system release-ready.";
}

function buildReleaseReadiness({
  catalogs,
  assets,
  generated,
  generatedPacks,
  balance,
  packDryRun,
  requireCleanPackDryRun,
}) {
  const art = imageSummary(assets);
  const packSummary = summarizePackDryRun(packDryRun);
  const generatedErrors = countErrors(generated) + countErrors(generatedPacks);
  const generatedWarnings = countWarnings(generated) + countWarnings(generatedPacks);
  const generatedChecked = numberOr(generated?.itemsChecked) + numberOr(generatedPacks?.itemsChecked) + numberOr(generatedPacks?.actorsChecked);
  const packDryRunPending = packDryRunHasPendingChanges(packDryRun);

  const artBlocked = countErrors(assets) > 0 || art.missingImages > 0 || art.missingSystemImages > 0;
  const artWarn = !artBlocked && art.nonSystemImages > 0;
  const artReady = !assets?.skipped && !artBlocked && art.nonSystemImages === 0;
  const packDryRunClean = packDryRunIsClean(packDryRun);
  const packSyncReady = !packDryRun?.skipped && packDryRunClean;

  const gates = [
    gate(
      "catalogs",
      "Source catalogs",
      sectionStatus(catalogs),
      `${numberOr(catalogs?.rowsChecked)} rows, ${numberOr(catalogs?.converted)} converted`,
      countErrors(catalogs) > 0
        ? ["Fix catalog conversion or schema errors before generating content."]
        : countWarnings(catalogs) > 0
          ? ["Review catalog warnings before the content patch."]
          : [],
      { rowsChecked: numberOr(catalogs?.rowsChecked), converted: numberOr(catalogs?.converted) }
    ),
    gate(
      "art-assets",
      "Item art and asset paths",
      assets?.skipped ? "skipped" : artBlocked ? "block" : artWarn ? "warn" : "ok",
      `${art.systemImages}/${art.images} system-local images (${art.systemCoveragePct}%), ${art.nonSystemImages} non-system`,
      artBlocked
        ? ["Fix missing image paths or missing system-local files."]
        : artWarn
          ? [`Export the art backlog and batch manifest with node tools/generate-art-backlog.mjs && node tools/generate-art-batch.mjs, generate ${art.nonSystemImages} prompt-driven item images, run node tools/audit-art-targets.mjs, then apply with node tools/apply-art-backlog.mjs.`]
          : [],
      art
    ),
    gate(
      "generated-sources",
      "Generated sources and pack data",
      generatedErrors > 0 ? "block" : generatedWarnings > 0 ? "warn" : "ok",
      `${generatedChecked} generated items/actors checked`,
      generatedErrors > 0
        ? ["Fix generated source validation errors before syncing packs."]
        : generatedWarnings > 0
          ? ["Review generated source warnings before syncing packs."]
          : [],
      {
        generatedItems: numberOr(generated?.itemsChecked),
        packItems: numberOr(generatedPacks?.itemsChecked),
        packActors: numberOr(generatedPacks?.actorsChecked),
      }
    ),
    gate(
      "balance",
      "Economy and combat balance profile",
      sectionStatus(balance),
      `${numberOr(balance?.itemsChecked)} items, ${numberOr(balance?.actorsChecked)} actors`,
      countErrors(balance) > 0
        ? ["Fix balance profile errors before syncing generated packs."]
        : countWarnings(balance) > 0
          ? ["Review balance warnings before the content patch."]
          : [],
      balance?.summary ?? {}
    ),
    gate(
      "pack-dry-run",
      "Generated pack dry-run",
      packDryRun?.skipped
        ? "todo"
        : numberOr(packSummary.failed) > 0
          ? "block"
          : requireCleanPackDryRun && !packDryRunClean
            ? "warn"
            : "ok",
      packDryRun?.skipped
        ? "not run"
        : `mode=${packSummary.mode}, pending changes=${packDryRunPending ? "yes" : "no"}`,
      packDryRun?.skipped
        ? ["Run the generated pack dry-run before syncing compendiums."]
        : numberOr(packSummary.failed) > 0
          ? ["Fix generated pack dry-run failures."]
          : requireCleanPackDryRun && !packDryRunClean
            ? ["Review generated pack dry-run changes, then sync packs when intentional."]
            : [],
      packSummary
    ),
    gate(
      "foundry-runtime-smoke",
      "Foundry runtime smoke",
      "todo",
      "must be run inside Foundry after the content patch",
      ["Run game.ironHills.runRuntimeSmoke({ includeTrade: true }) in Foundry as GM."]
    ),
    gate(
      "manual-session-test",
      "Manual session test",
      "todo",
      "combat, medicine, inventory, trade, spells, AoE and friendly fire still need a session pass",
      ["Run a short test session checklist after runtime smoke is green."]
    ),
  ];

  const blockers = gates.filter(row => row.status === "block");
  const warnings = gates.filter(row => row.status === "warn");
  const todos = gates.filter(row => row.status === "todo" || row.status === "skipped");
  const weightedScore = gates.reduce((sum, row) => sum + statusScore(row.status), 0) / Math.max(1, gates.length);
  const scorePct = Math.round(weightedScore * 100);

  let stage = "content-release-ready";
  let stageLabel = "Content release ready";
  if (blockers.length) {
    stage = "repair-blockers";
    stageLabel = "Repair blockers";
  } else if (!artReady) {
    stage = "art-pass";
    stageLabel = "Content art pass";
  } else if (!packSyncReady) {
    stage = "pack-sync-preflight";
    stageLabel = "Pack sync preflight";
  } else if (todos.some(row => row.id === "foundry-runtime-smoke")) {
    stage = "foundry-runtime-smoke";
    stageLabel = "Foundry runtime smoke";
  } else if (todos.some(row => row.id === "manual-session-test")) {
    stage = "manual-session-test";
    stageLabel = "Manual session test";
  }

  return {
    stage,
    stageLabel,
    scorePct,
    runtimeReady: blockers.length === 0,
    contentPatchReady: blockers.length === 0 && artReady && packSyncReady,
    artReady,
    packSyncReady,
    gates,
    blockers: blockers.map(row => row.id),
    warnings: warnings.map(row => row.id),
    todos: todos.map(row => row.id),
    nextMilestone: firstActionFromGates(gates),
  };
}

export function summarizePackDryRun(report = null) {
  const rows = Array.isArray(report?.results) ? report.results : [];
  const planRows = Array.isArray(report?.packs) ? report.packs : [];
  return {
    ok: report ? Boolean(report.ok) : true,
    skipped: !report || Boolean(report.skipped),
    mode: report?.mode ?? (report ? "unknown" : "skipped"),
    packs: numberOr(report?.packs, rows.length || planRows.length),
    expected: numberOr(report?.expected ?? report?.totalExpected, planRows.reduce((sum, row) => sum + numberOr(row.expected, 0), 0)),
    existing: numberOr(report?.existing, 0),
    created: numberOr(report?.created, 0),
    updated: numberOr(report?.updated, 0),
    unchanged: numberOr(report?.unchanged, 0),
    deleted: numberOr(report?.deleted, 0),
    embeddedPut: numberOr(report?.embeddedPut, 0),
    embeddedDeleted: numberOr(report?.embeddedDeleted, 0),
    duplicates: numberOr(report?.duplicates, 0),
    failed: numberOr(report?.failed, 0),
  };
}

export function packDryRunIsClean(report = null) {
  const summary = summarizePackDryRun(report);
  if (summary.skipped) return true;
  if (summary.mode === "plan-only") return summary.ok;
  return summary.ok
    && summary.created === 0
    && summary.updated === 0
    && summary.deleted === 0
    && summary.embeddedPut === 0
    && summary.embeddedDeleted === 0
    && summary.duplicates === 0
    && summary.failed === 0;
}

export function formatPackDryRunReport(report = null, { maxFindings = 20 } = {}) {
  if (!report || report.skipped) {
    const reason = report?.reason ? `: ${report.reason}` : "";
    return `Iron Hills generated pack dry-run: SKIPPED${reason}`;
  }

  const summary = summarizePackDryRun(report);
  const label = summary.mode === "plan-only"
    ? (summary.ok ? "PLAN OK" : "PLAN ISSUES")
    : (packDryRunIsClean(report) ? "OK" : "CHANGES");
  const lines = [
    `Iron Hills generated pack dry-run: ${label}`,
    `Mode: ${summary.mode}`,
    `Packs: ${summary.packs}, expected=${summary.expected}, existing=${summary.existing}, unchanged=${summary.unchanged}`,
    `Pending changes: created=${summary.created}, updated=${summary.updated}, deleted=${summary.deleted}, embeddedPut=${summary.embeddedPut}, embeddedDeleted=${summary.embeddedDeleted}`,
    `Issues: duplicates=${summary.duplicates}, failed=${summary.failed}`,
  ];

  const noisy = (report?.results ?? []).filter(row =>
    numberOr(row.created)
    || numberOr(row.updated)
    || numberOr(row.deleted)
    || numberOr(row.embeddedPut)
    || numberOr(row.embeddedDeleted)
    || numberOr(row.duplicates)
    || numberOr(row.errors?.length)
  );

  if (noisy.length) {
    lines.push("Pack details:");
    for (const row of noisy.slice(0, maxFindings)) {
      const errors = (row.errors ?? []).map(err => `${err.id}: ${err.error}`).join("; ");
      lines.push(
        `- ${row.packName}: created=${numberOr(row.created)}, updated=${numberOr(row.updated)}, ` +
        `deleted=${numberOr(row.deleted)}, embeddedPut=${numberOr(row.embeddedPut)}, ` +
        `embeddedDeleted=${numberOr(row.embeddedDeleted)}, duplicates=${numberOr(row.duplicates)}` +
        (errors ? `, errors=${errors}` : "")
      );
    }
    if (noisy.length > maxFindings) lines.push(`...and ${noisy.length - maxFindings} more packs.`);
  }

  return lines.join("\n");
}

function buildNextActions({
  catalogs,
  assets,
  generated,
  generatedPacks,
  balance,
  packDryRun,
  requireCleanPackDryRun,
  release,
}) {
  const actions = [];
  if (countErrors(catalogs) > 0) actions.push("Fix catalog errors before generating or syncing content packs.");
  if (countErrors(assets) > 0 || numberOr(assets?.summary?.missingSystemImages) > 0) {
    actions.push("Fix missing manifest entries or system-local item image files before the content patch.");
  }
  const art = imageSummary(assets);
  if (art.nonSystemImages > 0 && art.missingImages === 0 && art.missingSystemImages === 0) {
    actions.push(`Export the art backlog and batch manifest with node tools/generate-art-backlog.mjs && node tools/generate-art-batch.mjs, generate ${art.nonSystemImages} prompt-driven item images, run node tools/audit-art-targets.mjs, then apply with node tools/apply-art-backlog.mjs.`);
  }
  if (countErrors(generated) > 0) actions.push("Fix generated content sample validation errors.");
  if (countErrors(generatedPacks) > 0) actions.push("Fix generated pack source validation errors.");
  if (countErrors(balance) > 0) actions.push("Fix content balance profile errors before syncing generated packs.");
  if (countWarnings(balance) > 0) actions.push("Review content balance warnings before publishing the content patch.");
  if (requireCleanPackDryRun && !packDryRunIsClean(packDryRun)) {
    actions.push("Review generated pack dry-run changes, then sync packs once the diff is intentional.");
  }
  if (release?.nextMilestone && !actions.includes(release.nextMilestone)) actions.push(release.nextMilestone);
  if (!actions.length) actions.push("Content sources are ready for the next content generation or Foundry runtime smoke pass.");
  return actions;
}

function summarizeReadiness({ catalogs, assets, generated, generatedPacks, balance, packDryRun }) {
  const packSummary = summarizePackDryRun(packDryRun);
  const blockingErrors =
    countErrors(catalogs)
    + countErrors(assets)
    + countErrors(generated)
    + countErrors(generatedPacks)
    + countErrors(balance)
    + numberOr(packSummary.failed);
  const warnings =
    countWarnings(catalogs)
    + countWarnings(assets)
    + countWarnings(generated)
    + countWarnings(generatedPacks)
    + countWarnings(balance);
  const info =
    countInfo(catalogs)
    + countInfo(assets)
    + countInfo(generated)
    + countInfo(generatedPacks)
    + countInfo(balance);

  return {
    blockingErrors,
    warnings,
    info,
    catalogRows: numberOr(catalogs?.rowsChecked),
    catalogConverted: numberOr(catalogs?.converted),
    assetItems: numberOr(assets?.summary?.itemsChecked),
    assetImages: numberOr(assets?.summary?.imagesChecked),
    systemImages: numberOr(assets?.summary?.systemImages),
    coreImages: numberOr(assets?.summary?.coreImages),
    genericImages: numberOr(assets?.summary?.genericImages),
    nonSystemImages: imageSummary(assets).nonSystemImages,
    systemImageCoveragePct: imageSummary(assets).systemCoveragePct,
    missingSystemImages: numberOr(assets?.summary?.missingSystemImages),
    generatedItems: numberOr(generated?.itemsChecked),
    generatedPackItems: numberOr(generatedPacks?.itemsChecked),
    generatedPackActors: numberOr(generatedPacks?.actorsChecked),
    balanceItems: numberOr(balance?.itemsChecked),
    balanceActors: numberOr(balance?.actorsChecked),
    balanceWarnings: countWarnings(balance),
    balanceInfo: countInfo(balance),
    packDryRun: packSummary,
  };
}

export async function checkIronHillsContentReadiness(options = {}) {
  const resolved = {
    includeCatalogs: options.includeCatalogs !== false,
    includeAssets: options.includeAssets !== false,
    includeGenerated: options.includeGenerated !== false,
    includeGeneratedPacks: options.includeGeneratedPacks !== false,
    includeBalance: options.includeBalance !== false,
    includePackDryRun: Boolean(options.includePackDryRun),
    requireCleanPackDryRun: options.requireCleanPackDryRun !== false,
    strictArt: Boolean(options.strictArt ?? false),
    checkFilesystem: Boolean(options.checkFilesystem ?? options.checkAssetFiles ?? false),
    packIds: normalizePackIds(options.packIds ?? options.packs ?? null),
    maxFindings: Math.max(0, numberOr(options.maxFindings, 20)),
  };

  const catalogs = resolved.includeCatalogs
    ? auditIronHillsCatalogs()
    : skippedReport("catalogs");
  const assets = resolved.includeAssets
    ? await auditIronHillsAssets({
        checkFilesystem: resolved.checkFilesystem,
        packIds: resolved.packIds,
      })
    : skippedReport("assets");
  const generated = resolved.includeGenerated
    ? await validateIronHillsContent({
        includeGenerated: true,
        includeWorld: false,
        includePacks: false,
      })
    : skippedReport("generated");
  const generatedPacks = resolved.includeGeneratedPacks
    ? validateGeneratedPackSources({
        packIds: resolved.packIds,
      })
    : skippedReport("generated-pack-source");
  const balance = resolved.includeBalance
    ? buildIronHillsContentBalanceReport({
        packIds: resolved.packIds,
      })
    : skippedReport("balance");

  let packDryRun = skippedReport("pack-dry-run", "not requested");
  if (resolved.includePackDryRun) {
    if (typeof options.packDryRunRunner === "function") {
      try {
        packDryRun = await options.packDryRunRunner(resolved);
      } catch (err) {
        packDryRun = {
          ok: false,
          mode: "failed",
          errors: [{ id: "pack-dry-run", error: String(err?.message ?? err) }],
          failed: 1,
          results: [],
        };
      }
    } else {
      packDryRun = skippedReport("pack-dry-run", "runner unavailable in this runtime");
    }
  }

  const packDryRunClean = packDryRunIsClean(packDryRun);
  const blockingSections = [catalogs, assets, generated, generatedPacks, balance].filter(hasBlockingErrors).length;
  const summary = summarizeReadiness({ catalogs, assets, generated, generatedPacks, balance, packDryRun });
  const release = buildReleaseReadiness({
    catalogs,
    assets,
    generated,
    generatedPacks,
    balance,
    packDryRun,
    requireCleanPackDryRun: resolved.requireCleanPackDryRun,
  });
  const ok = blockingSections === 0
    && (!resolved.requireCleanPackDryRun || packDryRunClean)
    && (!resolved.strictArt || release.artReady);

  return {
    ok,
    options: resolved,
    summary: {
      ...summary,
      blockingSections,
      packDryRunClean,
    },
    release,
    catalogs,
    assets,
    generated,
    generatedPacks,
    balance,
    packDryRun,
    nextActions: buildNextActions({
      catalogs,
      assets,
      generated,
      generatedPacks,
      balance,
      packDryRun,
      requireCleanPackDryRun: resolved.requireCleanPackDryRun,
      release,
    }),
  };
}

export function formatContentReleaseReadiness(report = null) {
  const release = report?.release ?? null;
  if (!release) return "Iron Hills release readiness: unavailable";

  const lines = [
    `Iron Hills release readiness: ${release.stageLabel} (${release.scorePct}%)`,
    `Runtime-ready=${release.runtimeReady ? "yes" : "no"}, contentPatchReady=${release.contentPatchReady ? "yes" : "no"}, artReady=${release.artReady ? "yes" : "no"}, packSyncReady=${release.packSyncReady ? "yes" : "no"}`,
    `Next milestone: ${release.nextMilestone}`,
    "Release gates:",
  ];

  for (const row of release.gates ?? []) {
    lines.push(`- [${String(row.status).toUpperCase()}] ${row.label}: ${row.summary}`);
    for (const action of row.actions ?? []) lines.push(`  action: ${action}`);
  }

  return lines.join("\n");
}

export function formatContentReadinessReport(report, { maxFindings = 20 } = {}) {
  const summary = report?.summary ?? {};
  const lines = [
    `Iron Hills content readiness: ${report?.ok ? "OK" : "ISSUES"}`,
    `Blocking errors: ${numberOr(summary.blockingErrors)}, warnings=${numberOr(summary.warnings)}, info=${numberOr(summary.info)}`,
    `Catalogs: rows=${numberOr(summary.catalogRows)}, converted=${numberOr(summary.catalogConverted)}`,
    `Assets: items=${numberOr(summary.assetItems)}, images=${numberOr(summary.assetImages)}, system=${numberOr(summary.systemImages)}, core=${numberOr(summary.coreImages)}, nonSystem=${numberOr(summary.nonSystemImages)}, systemCoverage=${numberOr(summary.systemImageCoveragePct)}%, missingSystemImages=${numberOr(summary.missingSystemImages)}`,
    `Generated: samples=${numberOr(summary.generatedItems)}, packItems=${numberOr(summary.generatedPackItems)}, packActors=${numberOr(summary.generatedPackActors)}`,
    `Balance: items=${numberOr(summary.balanceItems)}, actors=${numberOr(summary.balanceActors)}, warnings=${numberOr(summary.balanceWarnings)}, info=${numberOr(summary.balanceInfo)}`,
    "",
    formatContentReleaseReadiness(report),
    "",
    formatCatalogReadinessReport(report?.catalogs, { maxFindings }),
    "",
    formatAssetAuditReport(report?.assets, { maxFindings, maxDirectories: 12 }),
    "",
    formatContentValidationReport(report?.generated, { maxFindings }),
    "",
    formatContentValidationReport(report?.generatedPacks, { maxFindings }),
    "",
    formatContentBalanceReport(report?.balance, { maxFindings }),
    "",
    formatPackDryRunReport(report?.packDryRun, { maxFindings }),
  ];

  if (report?.nextActions?.length) {
    lines.push("", "Next actions:");
    for (const action of report.nextActions) lines.push(`- ${action}`);
  }

  return lines.join("\n");
}
