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
}) {
  const actions = [];
  if (countErrors(catalogs) > 0) actions.push("Fix catalog errors before generating or syncing content packs.");
  if (countErrors(assets) > 0 || numberOr(assets?.summary?.missingSystemImages) > 0) {
    actions.push("Fix missing manifest entries or system-local item image files before the content patch.");
  }
  if (countErrors(generated) > 0) actions.push("Fix generated content sample validation errors.");
  if (countErrors(generatedPacks) > 0) actions.push("Fix generated pack source validation errors.");
  if (countErrors(balance) > 0) actions.push("Fix content balance profile errors before syncing generated packs.");
  if (countWarnings(balance) > 0) actions.push("Review content balance warnings before publishing the content patch.");
  if (requireCleanPackDryRun && !packDryRunIsClean(packDryRun)) {
    actions.push("Review generated pack dry-run changes, then sync packs once the diff is intentional.");
  }
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
  const ok = blockingSections === 0
    && (!resolved.requireCleanPackDryRun || packDryRunClean);

  return {
    ok,
    options: resolved,
    summary: {
      ...summary,
      blockingSections,
      packDryRunClean,
    },
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
    }),
  };
}

export function formatContentReadinessReport(report, { maxFindings = 20 } = {}) {
  const summary = report?.summary ?? {};
  const lines = [
    `Iron Hills content readiness: ${report?.ok ? "OK" : "ISSUES"}`,
    `Blocking errors: ${numberOr(summary.blockingErrors)}, warnings=${numberOr(summary.warnings)}, info=${numberOr(summary.info)}`,
    `Catalogs: rows=${numberOr(summary.catalogRows)}, converted=${numberOr(summary.catalogConverted)}`,
    `Assets: items=${numberOr(summary.assetItems)}, images=${numberOr(summary.assetImages)}, missingSystemImages=${numberOr(summary.missingSystemImages)}`,
    `Generated: samples=${numberOr(summary.generatedItems)}, packItems=${numberOr(summary.generatedPackItems)}, packActors=${numberOr(summary.generatedPackActors)}`,
    `Balance: items=${numberOr(summary.balanceItems)}, actors=${numberOr(summary.balanceActors)}, warnings=${numberOr(summary.balanceWarnings)}, info=${numberOr(summary.balanceInfo)}`,
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
