import {
  buildCompendiums,
  getCompendiumBuildPlan,
  syncMonsterPackToBestiary,
  syncNpcPackLootFromProfiles,
  syncAllCatalogItemPacks,
} from "../compendium-builder.mjs";
import { auditIronHillsCatalogs } from "./catalog-readiness-service.mjs";
import { auditIronHillsAssets } from "./content-asset-audit-service.mjs";
import { buildIronHillsContentBalanceReport } from "./content-balance-service.mjs";
import { checkIronHillsContentReadiness } from "./content-readiness-service.mjs";
import { repairIronHillsContent } from "./content-repair-service.mjs";
import {
  validateGeneratedPackSources,
  validateIronHillsContent,
} from "./content-validation-service.mjs";

const DEFAULT_OPTIONS = Object.freeze({
  apply: false,
  rebuildPacks: false,
  syncCatalogPacks: true,
  syncNpcLoot: true,
  syncMonsterBestiary: true,
  forceNpcLoot: false,
  repair: true,
  validate: true,
  preflight: true,
  stopOnPreflightErrors: true,
  validateGeneratedPacks: true,
  profileBalance: true,
  includeGenerated: true,
  includeWorld: false,
  includePacks: true,
  auditCatalogs: true,
  auditAssets: true,
  checkAssetFiles: false,
  packIds: null,
});

function elapsedSince(start) {
  const now = typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();
  return Math.max(0, Math.round(now - start));
}

function nowMs() {
  return typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();
}

function normalizeOptions(options = {}) {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    apply: Boolean(options.apply),
    rebuildPacks: Boolean(options.rebuildPacks),
    syncCatalogPacks: options.syncCatalogPacks !== false,
    syncNpcLoot: options.syncNpcLoot !== false,
    syncMonsterBestiary: options.syncMonsterBestiary !== false,
    forceNpcLoot: Boolean(options.forceNpcLoot),
    repair: options.repair !== false,
    validate: options.validate !== false,
    preflight: options.preflight !== false,
    stopOnPreflightErrors: options.stopOnPreflightErrors !== false,
    validateGeneratedPacks: options.validateGeneratedPacks !== false,
    profileBalance: options.profileBalance !== false,
    auditCatalogs: options.auditCatalogs !== false,
    auditAssets: options.auditAssets !== false,
    checkAssetFiles: Boolean(options.checkAssetFiles ?? options.checkFilesystem ?? false),
    includeGenerated: options.includeGenerated !== false,
    includeWorld: Boolean(options.includeWorld),
    includePacks: options.includePacks !== false,
    packIds: Array.isArray(options.packIds) && options.packIds.length ? options.packIds : null,
  };
}

function plannedStep({ id, label, reason = "requires apply: true" }) {
  return {
    id,
    label,
    status: "planned",
    mode: "dry-run",
    mutates: true,
    ms: 0,
    reason,
    summary: {},
  };
}

function skippedStep({ id, label, reason = "disabled" }) {
  return {
    id,
    label,
    status: "skipped",
    mode: "skipped",
    mutates: false,
    ms: 0,
    reason,
    summary: {},
  };
}

async function runStep({
  id,
  label,
  enabled = true,
  disabledReason = "disabled",
  mutates = false,
  supportsDryRun = false,
  apply = false,
  fn,
  summarize = (result) => result ?? {},
}) {
  if (!enabled) return skippedStep({ id, label, reason: disabledReason });
  if (mutates && !apply && !supportsDryRun) return plannedStep({ id, label });

  const start = nowMs();
  try {
    const result = await fn({ apply: mutates ? apply : false });
    return {
      id,
      label,
      status: "ok",
      mode: mutates ? (apply ? "applied" : "dry-run") : "read-only",
      mutates,
      ms: elapsedSince(start),
      summary: summarize(result),
      result,
    };
  } catch (err) {
    return {
      id,
      label,
      status: "failed",
      mode: mutates ? (apply ? "applied" : "dry-run") : "read-only",
      mutates,
      ms: elapsedSince(start),
      error: String(err?.message ?? err),
      summary: {},
    };
  }
}

function summarizeBuild(result) {
  return {
    total: Number(result?.total ?? 0),
    expected: Number(result?.expected ?? 0),
    failed: Number(result?.failed ?? 0),
    packs: Array.isArray(result?.results) ? result.results.length : Object.keys(result?.packs ?? {}).length,
  };
}

function summarizeSync(result) {
  return {
    expected: Number(result?.expected ?? 0),
    created: Number(result?.created ?? 0),
    updated: Number(result?.updated ?? 0),
    total: Number(result?.total ?? 0),
    failed: Number(result?.failed ?? 0),
    packs: Array.isArray(result?.results) ? result.results.length : 0,
  };
}

function summarizePackPlan(result) {
  return {
    expected: Number(result?.totalExpected ?? 0),
    packs: Array.isArray(result?.packs) ? result.packs.length : 0,
  };
}

function summarizeNpc(result) {
  return {
    updated: Number(result?.updated ?? 0),
    scanned: Number(result?.scanned ?? 0),
  };
}

function summarizeMonster(result) {
  return {
    deleted: Number(result?.deleted ?? 0),
    created: Number(result?.created ?? 0),
    patched: Number(result?.patched ?? 0),
    canon: Number(result?.canon ?? 0),
  };
}

function summarizeRepair(result) {
  return {
    checked: Number(result?.itemsChecked ?? 0),
    changed: Number(result?.itemsChanged ?? 0),
    documentsChanged: Number(result?.documentsChanged ?? 0),
    errors: Number(result?.errors?.length ?? 0),
    residualErrors: Number(result?.counts?.error ?? 0),
    residualWarnings: Number(result?.counts?.warn ?? 0),
  };
}

function summarizeValidation(result) {
  return {
    ok: Boolean(result?.ok),
    checked: Number(result?.itemsChecked ?? 0),
    actors: Number(result?.actorsChecked ?? 0),
    errors: Number(result?.counts?.error ?? 0),
    warnings: Number(result?.counts?.warn ?? 0),
    info: Number(result?.counts?.info ?? 0),
  };
}

function summarizeCatalogAudit(result) {
  return {
    ok: Boolean(result?.ok),
    rows: Number(result?.rowsChecked ?? 0),
    converted: Number(result?.converted ?? 0),
    missingImg: Number(result?.missingImg ?? 0),
    errors: Number(result?.counts?.error ?? 0),
    warnings: Number(result?.counts?.warn ?? 0),
    info: Number(result?.counts?.info ?? 0),
  };
}

function summarizeAssetAudit(result) {
  return {
    ok: Boolean(result?.ok),
    items: Number(result?.summary?.itemsChecked ?? 0),
    images: Number(result?.summary?.imagesChecked ?? 0),
    systemImages: Number(result?.summary?.systemImages ?? 0),
    missingSystemImages: Number(result?.summary?.missingSystemImages ?? 0),
    packs: Number(result?.summary?.expectedGeneratedPacks ?? 0),
    missingPackDirs: Number(result?.summary?.missingPackDirectories ?? 0),
    errors: Number(result?.counts?.error ?? 0),
    warnings: Number(result?.counts?.warn ?? 0),
    info: Number(result?.counts?.info ?? 0),
  };
}

function summarizeReadiness(result) {
  return {
    ok: Boolean(result?.ok),
    blockingErrors: Number(result?.summary?.blockingErrors ?? 0),
    warnings: Number(result?.summary?.warnings ?? 0),
    catalogRows: Number(result?.summary?.catalogRows ?? 0),
    catalogConverted: Number(result?.summary?.catalogConverted ?? 0),
    assetItems: Number(result?.summary?.assetItems ?? 0),
    assetImages: Number(result?.summary?.assetImages ?? 0),
    missingSystemImages: Number(result?.summary?.missingSystemImages ?? 0),
    generatedItems: Number(result?.summary?.generatedItems ?? 0),
    generatedPackItems: Number(result?.summary?.generatedPackItems ?? 0),
    generatedPackActors: Number(result?.summary?.generatedPackActors ?? 0),
    balanceItems: Number(result?.summary?.balanceItems ?? 0),
    balanceActors: Number(result?.summary?.balanceActors ?? 0),
    balanceWarnings: Number(result?.summary?.balanceWarnings ?? 0),
    balanceInfo: Number(result?.summary?.balanceInfo ?? 0),
  };
}

function firstFailedStep(steps) {
  return steps.find(step => step.status === "failed") ?? null;
}

function reportErrors(report) {
  return Number(report?.counts?.error ?? 0);
}

function reportWarnings(report) {
  return Number(report?.counts?.warn ?? 0);
}

function preflightHasBlockers(report) {
  return Boolean(report && report.ok === false)
    || Number(report?.summary?.blockingErrors ?? 0) > 0;
}

function mutatingStepStats(steps) {
  const mutating = steps.filter(step => step.mutates);
  return {
    planned: mutating.filter(step => step.status === "planned").length,
    applied: mutating.filter(step => step.status === "ok" && step.mode === "applied").length,
    blocked: mutating.filter(step => step.status === "skipped" && step.reason === "preflight failed").length,
  };
}

function buildNextActions({
  options,
  steps,
  readinessReport,
  catalogReport,
  assetReport,
  generatedPackSourceReport,
  balanceReport,
  repairReport,
  validationReport,
}) {
  const actions = [];
  const planned = steps.filter(step => step.status === "planned");
  if (preflightHasBlockers(readinessReport)) {
    actions.push(...(readinessReport?.nextActions ?? []));
  }
  if (Number(catalogReport?.counts?.error ?? 0) > 0) {
    actions.push("Fix catalog audit errors before rebuilding packs.");
  }
  if (Number(assetReport?.counts?.error ?? 0) > 0) {
    actions.push("Fix asset/manifest audit errors before rebuilding packs.");
  }
  if (Number(assetReport?.summary?.missingSystemImages ?? 0) > 0) {
    actions.push("Generate or assign missing system-local item icons before the content art pass is considered complete.");
  }
  if (Number(generatedPackSourceReport?.counts?.error ?? 0) > 0) {
    actions.push("Fix generated pack source validation errors before syncing compendiums.");
  }
  if (Number(balanceReport?.counts?.error ?? 0) > 0) {
    actions.push("Fix content balance profile errors before syncing compendiums.");
  }
  if (Number(balanceReport?.counts?.warn ?? 0) > 0) {
    actions.push("Review content balance warnings before applying the content patch.");
  }
  if (!options.apply && planned.length) {
    actions.push("Run again with apply: true to execute planned pack rebuild/sync steps.");
  }
  if (!options.apply && Number(repairReport?.itemsChanged ?? 0) > 0) {
    actions.push("Run repairContent({ apply: true, includePacks: true }) or prepareContentPatch({ apply: true }) after reviewing the dry-run changes.");
  }
  if (Number(validationReport?.counts?.error ?? 0) > 0) {
    actions.push("Review validation errors before starting the content patch.");
  }
  if (!actions.length) actions.push("Content pipeline is ready for the next content patch pass.");
  return actions;
}

export async function prepareIronHillsContentPatch(options = {}) {
  const resolved = normalizeOptions(options);
  const steps = [];
  let readinessReport = null;
  let repairReport = null;
  let validationReport = null;
  let generatedPackSourceReport = null;
  let balanceReport = null;
  let catalogReport = null;
  let assetReport = null;

  const preflightStep = await runStep({
    id: "preflight-readiness",
    label: "Preflight content readiness",
    enabled: resolved.preflight,
    apply: resolved.apply,
    fn: () => checkIronHillsContentReadiness({
      includeCatalogs: resolved.auditCatalogs,
      includeAssets: resolved.auditAssets,
      includeGenerated: resolved.validate && resolved.includeGenerated,
      includeGeneratedPacks: resolved.validate && resolved.validateGeneratedPacks,
      includeBalance: resolved.profileBalance,
      includePackDryRun: false,
      requireCleanPackDryRun: false,
      checkFilesystem: resolved.checkAssetFiles,
      packIds: resolved.packIds,
    }),
    summarize: summarizeReadiness,
  });
  readinessReport = preflightStep.result ?? null;
  if (readinessReport) {
    catalogReport = readinessReport.catalogs ?? null;
    assetReport = readinessReport.assets ?? null;
    generatedPackSourceReport = readinessReport.generatedPacks ?? null;
    balanceReport = readinessReport.balance ?? null;
  }
  steps.push(preflightStep);

  const preflightBlocked = resolved.stopOnPreflightErrors && preflightHasBlockers(readinessReport);
  const mutationDisabledReason = preflightBlocked ? "preflight failed" : "disabled";

  const catalogStep = await runStep({
    id: "audit-catalogs",
    label: "Audit source catalogs",
    enabled: resolved.auditCatalogs,
    apply: resolved.apply,
    fn: () => catalogReport ?? auditIronHillsCatalogs(),
    summarize: summarizeCatalogAudit,
  });
  catalogReport = catalogStep.result ?? null;
  steps.push(catalogStep);

  steps.push(await runStep({
    id: "plan-pack-content",
    label: "Plan generated compendium content",
    enabled: resolved.includePacks,
    apply: resolved.apply,
    fn: () => getCompendiumBuildPlan({ packIds: resolved.packIds }),
    summarize: summarizePackPlan,
  }));

  const assetStep = await runStep({
    id: "audit-assets",
    label: "Audit assets and pack manifest",
    enabled: resolved.auditAssets,
    apply: resolved.apply,
    fn: () => assetReport ?? auditIronHillsAssets({
      checkFilesystem: resolved.checkAssetFiles,
      packIds: resolved.packIds,
    }),
    summarize: summarizeAssetAudit,
  });
  assetReport = assetStep.result ?? null;
  steps.push(assetStep);

  steps.push(await runStep({
    id: "validate-generated",
    label: "Validate generated content samples",
    enabled: resolved.validate && resolved.includeGenerated,
    apply: resolved.apply,
    fn: () => readinessReport?.generated ?? validateIronHillsContent({
      includeGenerated: true,
      includeWorld: false,
      includePacks: false,
    }),
    summarize: summarizeValidation,
  }));

  const generatedPackSourceStep = await runStep({
    id: "validate-generated-pack-sources",
    label: "Validate generated pack sources",
    enabled: resolved.validate && resolved.validateGeneratedPacks,
    apply: resolved.apply,
    fn: () => generatedPackSourceReport ?? validateGeneratedPackSources({
      packIds: resolved.packIds,
    }),
    summarize: summarizeValidation,
  });
  generatedPackSourceReport = generatedPackSourceStep.result ?? null;
  steps.push(generatedPackSourceStep);

  const balanceStep = await runStep({
    id: "profile-content-balance",
    label: "Profile generated content balance",
    enabled: resolved.profileBalance,
    apply: resolved.apply,
    fn: () => balanceReport ?? buildIronHillsContentBalanceReport({
      packIds: resolved.packIds,
    }),
    summarize: summarizeValidation,
  });
  balanceReport = balanceStep.result ?? null;
  steps.push(balanceStep);

  steps.push(await runStep({
    id: "rebuild-packs",
    label: "Rebuild generated compendium packs",
    enabled: resolved.includePacks && resolved.rebuildPacks && !preflightBlocked,
    disabledReason: mutationDisabledReason,
    mutates: true,
    apply: resolved.apply,
    fn: () => buildCompendiums({ packIds: resolved.packIds }),
    summarize: summarizeBuild,
  }));

  steps.push(await runStep({
    id: "sync-catalog-packs",
    label: "Sync catalog-backed packs",
    enabled: resolved.includePacks && resolved.syncCatalogPacks && !preflightBlocked,
    disabledReason: mutationDisabledReason,
    mutates: true,
    apply: resolved.apply,
    fn: () => syncAllCatalogItemPacks({ packIds: resolved.packIds }),
    summarize: summarizeSync,
  }));

  steps.push(await runStep({
    id: "sync-npc-loot",
    label: "Sync NPC loot metadata",
    enabled: resolved.includePacks && resolved.syncNpcLoot && !preflightBlocked,
    disabledReason: mutationDisabledReason,
    mutates: true,
    apply: resolved.apply,
    fn: () => syncNpcPackLootFromProfiles({ forceLoot: resolved.forceNpcLoot }),
    summarize: summarizeNpc,
  }));

  steps.push(await runStep({
    id: "sync-monsters",
    label: "Sync monster bestiary pack",
    enabled: resolved.includePacks && resolved.syncMonsterBestiary && !preflightBlocked,
    disabledReason: mutationDisabledReason,
    mutates: true,
    apply: resolved.apply,
    fn: () => syncMonsterPackToBestiary(),
    summarize: summarizeMonster,
  }));

  const repairStep = await runStep({
    id: "repair-content",
    label: "Repair item data",
    enabled: resolved.repair && !preflightBlocked,
    disabledReason: mutationDisabledReason,
    mutates: true,
    supportsDryRun: true,
    apply: resolved.apply,
    fn: ({ apply }) => repairIronHillsContent({
      apply,
      includeWorld: resolved.includeWorld,
      includePacks: resolved.includePacks,
      packIds: resolved.packIds,
    }),
    summarize: summarizeRepair,
  });
  repairReport = repairStep.result ?? null;
  steps.push(repairStep);

  const validateStep = await runStep({
    id: "validate-content",
    label: "Validate content after pipeline",
    enabled: resolved.validate,
    apply: resolved.apply,
    fn: () => validateIronHillsContent({
      includeGenerated: resolved.includeGenerated,
      includeWorld: resolved.includeWorld,
      includePacks: resolved.includePacks,
      packIds: resolved.packIds,
    }),
    summarize: summarizeValidation,
  });
  validationReport = validateStep.result ?? null;
  steps.push(validateStep);

  const failed = firstFailedStep(steps);
  const validationErrors = Number(validationReport?.counts?.error ?? 0);
  const repairErrors = Number(repairReport?.errors?.length ?? 0);
  const catalogErrors = reportErrors(catalogReport);
  const assetErrors = reportErrors(assetReport);
  const generatedPackSourceErrors = reportErrors(generatedPackSourceReport);
  const balanceErrors = reportErrors(balanceReport);
  const balanceWarnings = reportWarnings(balanceReport);
  const preflightErrors = Number(readinessReport?.summary?.blockingErrors ?? 0);
  const mutatingStats = mutatingStepStats(steps);

  return {
    ok: !failed
      && validationErrors === 0
      && repairErrors === 0
      && catalogErrors === 0
      && assetErrors === 0
      && generatedPackSourceErrors === 0
      && balanceErrors === 0
      && preflightErrors === 0,
    apply: resolved.apply,
    options: resolved,
    summary: {
      failedSteps: failed ? 1 : 0,
      preflightErrors,
      catalogErrors,
      assetErrors,
      generatedPackSourceErrors,
      balanceErrors,
      balanceWarnings,
      validationErrors,
      repairErrors,
      mutatingStepsPlanned: mutatingStats.planned,
      mutatingStepsApplied: mutatingStats.applied,
      mutatingStepsBlocked: mutatingStats.blocked,
    },
    steps,
    readiness: readinessReport,
    catalog: catalogReport,
    assets: assetReport,
    generatedPackSources: generatedPackSourceReport,
    balance: balanceReport,
    repair: repairReport,
    validation: validationReport,
    nextActions: buildNextActions({
      options: resolved,
      steps,
      readinessReport,
      catalogReport,
      assetReport,
      generatedPackSourceReport,
      balanceReport,
      repairReport,
      validationReport,
    }),
  };
}

function formatSummaryMap(summary = {}) {
  const entries = Object.entries(summary).filter(([, value]) => value !== undefined && value !== null);
  if (!entries.length) return "";
  return entries.map(([key, value]) => `${key}=${value}`).join(", ");
}

export function formatContentPatchPreparationReport(report, {
  maxSteps = 20,
  maxActions = 5,
  maxFindings = 10,
} = {}) {
  const mode = report?.apply ? "APPLIED" : "DRY RUN";
  const validation = report?.validation ?? {};
  const repair = report?.repair ?? {};
  const catalog = report?.catalog ?? {};
  const assets = report?.assets ?? {};
  const readiness = report?.readiness ?? {};
  const generatedPackSources = report?.generatedPackSources ?? {};
  const balance = report?.balance ?? {};
  const summary = report?.summary ?? {};
  const lines = [
    `Iron Hills content patch pipeline: ${mode}`,
    `OK: ${report?.ok ? "yes" : "no"}`,
    `Scope: generated=${Boolean(report?.options?.includeGenerated)}, packs=${Boolean(report?.options?.includePacks)}, world=${Boolean(report?.options?.includeWorld)}`,
    `Preflight: errors=${Number(summary.preflightErrors ?? 0)}, mutating planned=${Number(summary.mutatingStepsPlanned ?? 0)}, applied=${Number(summary.mutatingStepsApplied ?? 0)}, blocked=${Number(summary.mutatingStepsBlocked ?? 0)}`,
  ];

  lines.push("Steps:");
  for (const step of (report?.steps ?? []).slice(0, maxSteps)) {
    const summary = formatSummaryMap(step.summary);
    const tail = summary ? ` (${summary})` : "";
    const reason = step.reason ? ` - ${step.reason}` : "";
    const error = step.error ? ` - ${step.error}` : "";
    lines.push(`- ${step.status}/${step.mode}: ${step.label}${tail}${reason}${error}`);
  }

  lines.push(
    `Catalogs: rows=${Number(catalog.rowsChecked ?? 0)}, converted=${Number(catalog.converted ?? 0)}, errors=${Number(catalog.counts?.error ?? 0)}, warnings=${Number(catalog.counts?.warn ?? 0)}, info=${Number(catalog.counts?.info ?? 0)}`
  );
  lines.push(
    `Assets: items=${Number(assets.summary?.itemsChecked ?? 0)}, images=${Number(assets.summary?.imagesChecked ?? 0)}, systemImages=${Number(assets.summary?.systemImages ?? 0)}, missingSystemImages=${Number(assets.summary?.missingSystemImages ?? 0)}, errors=${Number(assets.counts?.error ?? 0)}, warnings=${Number(assets.counts?.warn ?? 0)}, info=${Number(assets.counts?.info ?? 0)}`
  );
  lines.push(
    `Generated pack sources: items=${Number(generatedPackSources.itemsChecked ?? 0)}, actors=${Number(generatedPackSources.actorsChecked ?? 0)}, errors=${Number(generatedPackSources.counts?.error ?? 0)}, warnings=${Number(generatedPackSources.counts?.warn ?? 0)}, info=${Number(generatedPackSources.counts?.info ?? 0)}`
  );
  lines.push(
    `Balance: items=${Number(balance.itemsChecked ?? 0)}, actors=${Number(balance.actorsChecked ?? 0)}, errors=${Number(balance.counts?.error ?? 0)}, warnings=${Number(balance.counts?.warn ?? 0)}, info=${Number(balance.counts?.info ?? 0)}`
  );
  lines.push(
    `Repair: checked=${Number(repair.itemsChecked ?? 0)}, changed=${Number(repair.itemsChanged ?? 0)}, documents=${Number(repair.documentsChanged ?? 0)}, errors=${Number(repair.errors?.length ?? 0)}`
  );
  lines.push(
    `Validation: checked=${Number(validation.itemsChecked ?? 0)}, errors=${Number(validation.counts?.error ?? 0)}, warnings=${Number(validation.counts?.warn ?? 0)}, info=${Number(validation.counts?.info ?? 0)}`
  );

  const readinessActions = readiness.nextActions ?? [];
  if (readinessActions.length && !report?.ok) {
    lines.push("Readiness actions:");
    for (const action of readinessActions.slice(0, maxActions)) lines.push(`- ${action}`);
  }

  const findings = validation.findings ?? [];
  if (findings.length) {
    lines.push("Top validation findings:");
    for (const finding of findings.slice(0, maxFindings)) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.path || "(unknown)"} - ${finding.message}`);
    }
    if (findings.length > maxFindings) lines.push(`...and ${findings.length - maxFindings} more findings.`);
  }

  const assetFindings = assets.findings ?? [];
  if (assetFindings.length) {
    lines.push("Top asset findings:");
    for (const finding of assetFindings.slice(0, maxFindings)) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.path || "(unknown)"} - ${finding.message}`);
    }
    if (assetFindings.length > maxFindings) lines.push(`...and ${assetFindings.length - maxFindings} more asset findings.`);
  }

  const balanceFindings = balance.findings ?? [];
  if (balanceFindings.length) {
    lines.push("Top balance findings:");
    for (const finding of balanceFindings.slice(0, maxFindings)) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.path || "(unknown)"} - ${finding.message}`);
    }
    if (balanceFindings.length > maxFindings) lines.push(`...and ${balanceFindings.length - maxFindings} more balance findings.`);
  }

  const actions = report?.nextActions ?? [];
  if (actions.length) {
    lines.push("Next actions:");
    for (const action of actions.slice(0, maxActions)) lines.push(`- ${action}`);
  }

  return lines.join("\n");
}
