import {
  auditIronHillsAssets,
} from "./content-asset-audit-service.mjs";
import {
  buildContentArtBacklog,
  formatContentArtBacklogReport,
} from "./content-art-backlog-service.mjs";
import { MONSTER_BESTIARY } from "../constants/monster-bestiary.mjs";
import { NPC_PACK_ACTORS } from "../constants/npc-profiles.mjs";

const SYSTEM_ID = "iron-hills-system";
const SYSTEM_ASSET_PREFIX = `systems/${SYSTEM_ID}/`;
const GENERIC_ITEM_IMAGE = "icons/svg/item-bag.svg";
const GENERIC_ACTOR_IMAGE = "icons/svg/mystery-man.svg";

const PRIORITY_LABELS = Object.freeze({
  critical: "Critical visual QA",
  high: "High priority",
  normal: "Normal pass",
  polish: "Polish pass",
});

const CATALOG_PRIORITY = Object.freeze({
  attachments: "critical",
  belts: "critical",
  backpacks: "critical",
  consumables: "critical",
  materials: "critical",
  tools: "critical",
  armor: "high",
  spells: "high",
  weapons: "high",
  throwables: "high",
  potions: "normal",
  food: "normal",
});

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pct(part, total) {
  const p = numberOr(part, 0);
  const t = numberOr(total, 0);
  if (t <= 0) return 0;
  return Math.round((p / t) * 1000) / 10;
}

function normalizePath(value) {
  return String(value ?? "").trim().replace(/\\/g, "/");
}

function classifyImagePath(img, { genericActor = false } = {}) {
  const path = normalizePath(img);
  if (!path) return "missing";
  if (path === GENERIC_ITEM_IMAGE || path === GENERIC_ACTOR_IMAGE) return "generic";
  if (path.startsWith(SYSTEM_ASSET_PREFIX)) return "system";
  if (path.startsWith("icons/")) return "core";
  if (path.startsWith("modules/")) return "module";
  if (/^https?:\/\//i.test(path)) return "remote";
  if (genericActor && path.includes("mystery-man")) return "generic";
  return "other";
}

function toneForCoverage(coverage, blockers = 0) {
  if (blockers > 0) return "is-danger";
  if (coverage >= 95) return "is-good";
  if (coverage >= 70) return "is-warn";
  return "is-danger";
}

function addCount(map, key, amount = 1) {
  const normalized = String(key ?? "unknown") || "unknown";
  map.set(normalized, (map.get(normalized) ?? 0) + amount);
}

function mapToRows(map, { labelKey = "label", valueKey = "count" } = {}) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, value]) => ({ [labelKey]: key, [valueKey]: value }));
}

function assetSectionMap(assetReport = null) {
  return new Map((assetReport?.sections ?? []).map(section => [section.id, section]));
}

function itemPriorityFor(catalog) {
  return CATALOG_PRIORITY[catalog] ?? "normal";
}

function isFinalSystemImage(item) {
  return item.currentImageClass === "system";
}

function itemNeedsFinalArt(item) {
  return !isFinalSystemImage(item);
}

function itemNeedsVisualQa(item, catalog) {
  return itemNeedsFinalArt(item) || itemPriorityFor(catalog) === "critical";
}

function summarizeItemRows(backlogItems = [], assetReport = null) {
  const sections = assetSectionMap(assetReport);
  const byCatalog = new Map();
  const byTier = new Map();
  const byPriority = new Map();
  const byImageClass = new Map();
  const backlog = [];

  for (const item of backlogItems) {
    const catalog = item.catalog ?? "unknown";
    const tier = Math.max(1, Math.min(10, Math.round(numberOr(item.tier, 1))));
    const priority = itemPriorityFor(catalog);
    const currentClass = item.currentImageClass ?? classifyImagePath(item.currentImg);
    const row = byCatalog.get(catalog) ?? {
      id: catalog,
      label: catalog,
      priority,
      priorityLabel: PRIORITY_LABELS[priority] ?? priority,
      total: 0,
      system: 0,
      nonSystem: 0,
      generic: 0,
      core: 0,
      missing: 0,
      missingSystemFiles: numberOr(sections.get(catalog)?.missingSystemImages, 0),
      needsFinalArt: 0,
      visualQaPending: 0,
      finalCoveragePct: 0,
      tone: "is-todo",
    };

    row.total += 1;
    if (currentClass === "system") row.system += 1;
    else row.nonSystem += 1;
    if (currentClass === "generic") row.generic += 1;
    if (currentClass === "core") row.core += 1;
    if (currentClass === "missing") row.missing += 1;
    const needsFinalArt = itemNeedsFinalArt({ ...item, currentImageClass: currentClass });
    const needsVisualQa = itemNeedsVisualQa({ ...item, currentImageClass: currentClass }, catalog);
    if (needsFinalArt) row.needsFinalArt += 1;
    if (needsVisualQa) row.visualQaPending += 1;
    if (needsVisualQa) {
      backlog.push({
        catalog,
        id: item.id,
        name: item.name,
        tier,
        priority,
        priorityLabel: row.priorityLabel,
        currentImageClass: currentClass,
        currentImg: item.currentImg,
        targetFile: item.targetFile,
        grid: `${numberOr(item.gridW, 1)}x${numberOr(item.gridH, 1)}`,
        aspect: item.aspect,
        promptSource: item.promptSource,
        reviewReason: needsFinalArt ? "replace non-system art" : "critical visual QA",
      });
    }
    byCatalog.set(catalog, row);

    const tierKey = String(tier);
    const tierRow = byTier.get(tierKey) ?? {
      tier,
      total: 0,
      system: 0,
      needsFinalArt: 0,
      finalCoveragePct: 0,
      tone: "is-todo",
    };
    tierRow.total += 1;
    if (currentClass === "system") tierRow.system += 1;
    else tierRow.needsFinalArt += 1;
    byTier.set(tierKey, tierRow);

    const priorityRow = byPriority.get(priority) ?? {
      id: priority,
      label: PRIORITY_LABELS[priority] ?? priority,
      total: 0,
      needsFinalArt: 0,
      visualQaPending: 0,
      finalCoveragePct: 0,
      tone: "is-todo",
    };
    priorityRow.total += 1;
    if (currentClass !== "system") priorityRow.needsFinalArt += 1;
    if (needsVisualQa) priorityRow.visualQaPending += 1;
    byPriority.set(priority, priorityRow);

    addCount(byImageClass, currentClass);
  }

  const catalogRows = [...byCatalog.values()].map(row => {
    row.finalCoveragePct = pct(row.system, row.total);
    row.tone = row.visualQaPending > 0
      ? "is-warn"
      : toneForCoverage(row.finalCoveragePct, row.missing + row.missingSystemFiles);
    return row;
  }).sort((a, b) =>
    b.needsFinalArt - a.needsFinalArt
    || a.priority.localeCompare(b.priority)
    || a.id.localeCompare(b.id)
  );

  const tierRows = [...byTier.values()].map(row => {
    row.finalCoveragePct = pct(row.system, row.total);
    row.tone = toneForCoverage(row.finalCoveragePct);
    return row;
  }).sort((a, b) => a.tier - b.tier);

  const priorityRows = [...byPriority.values()].map(row => {
    row.finalCoveragePct = pct(row.total - row.needsFinalArt, row.total);
    row.tone = row.visualQaPending > 0 ? "is-warn" : toneForCoverage(row.finalCoveragePct);
    return row;
  }).sort((a, b) => {
    const order = { critical: 0, high: 1, normal: 2, polish: 3 };
    return (order[a.id] ?? 99) - (order[b.id] ?? 99);
  });

  return {
    catalogRows,
    tierRows,
    priorityRows,
    imageClassRows: mapToRows(byImageClass, { labelKey: "imageClass", valueKey: "count" }),
    backlogRows: backlog.sort((a, b) => {
      const order = { critical: 0, high: 1, normal: 2, polish: 3 };
      return (order[a.priority] ?? 99) - (order[b.priority] ?? 99)
        || a.tier - b.tier
        || a.catalog.localeCompare(b.catalog)
        || a.id.localeCompare(b.id);
    }),
  };
}

function actorRowsFor(record, type) {
  return Object.entries(record ?? {}).map(([key, row]) => {
    const img = normalizePath(row?.img);
    const imageClass = classifyImagePath(img, { genericActor: true });
    const tier = numberOr(row?.tier ?? row?.system?.info?.tier, 1);
    return {
      type,
      id: row?.id ?? key,
      name: row?.label ?? row?.name ?? key,
      tier,
      imageClass,
      img,
      needsFinalArt: imageClass !== "system",
      tone: imageClass === "system" ? "is-good" : imageClass === "missing" || imageClass === "generic" ? "is-danger" : "is-warn",
    };
  });
}

function summarizeActorRows(rows = []) {
  const byType = new Map();
  const byTier = new Map();
  const byImageClass = new Map();
  for (const row of rows) {
    const typeRow = byType.get(row.type) ?? {
      id: row.type,
      label: row.type,
      total: 0,
      system: 0,
      needsFinalArt: 0,
      finalCoveragePct: 0,
      tone: "is-todo",
    };
    typeRow.total += 1;
    if (row.imageClass === "system") typeRow.system += 1;
    else typeRow.needsFinalArt += 1;
    byType.set(row.type, typeRow);

    const tierKey = String(Math.max(1, Math.min(10, Math.round(numberOr(row.tier, 1)))));
    const tierRow = byTier.get(tierKey) ?? {
      tier: Number(tierKey),
      total: 0,
      system: 0,
      needsFinalArt: 0,
      finalCoveragePct: 0,
      tone: "is-todo",
    };
    tierRow.total += 1;
    if (row.imageClass === "system") tierRow.system += 1;
    else tierRow.needsFinalArt += 1;
    byTier.set(tierKey, tierRow);
    addCount(byImageClass, row.imageClass);
  }

  const typeRows = [...byType.values()].map(row => {
    row.finalCoveragePct = pct(row.system, row.total);
    row.tone = toneForCoverage(row.finalCoveragePct);
    return row;
  });
  const tierRows = [...byTier.values()].map(row => {
    row.finalCoveragePct = pct(row.system, row.total);
    row.tone = toneForCoverage(row.finalCoveragePct);
    return row;
  }).sort((a, b) => a.tier - b.tier);

  return {
    typeRows,
    tierRows,
    imageClassRows: mapToRows(byImageClass, { labelKey: "imageClass", valueKey: "count" }),
    backlogRows: rows.filter(row => row.needsFinalArt).sort((a, b) =>
      a.type.localeCompare(b.type)
      || numberOr(a.tier) - numberOr(b.tier)
      || a.id.localeCompare(b.id)
    ),
  };
}

function releaseStage(summary) {
  if (summary.blockers > 0) return "art blockers";
  if (summary.criticalVisualQaPending > 0) return "critical visual QA";
  if (summary.criticalNeeds > 0) return "critical art replacement";
  if (summary.visualQaPending > 0) return "visual QA pass";
  if (summary.needsFinalArt > 0) return "art production pass";
  if (summary.actorNeedsFinalArt > 0) return "token art pass";
  return "art ready";
}

export async function buildContentArtCockpitReport(options = {}) {
  const assetReport = options.assetReport ?? await auditIronHillsAssets({
    checkFilesystem: Boolean(options.checkFilesystem ?? options.checkAssetFiles ?? true),
  });
  const backlogReport = options.backlogReport ?? buildContentArtBacklog({
    includeAll: true,
  });

  const itemRows = summarizeItemRows(backlogReport.items ?? [], assetReport);
  const actors = [
    ...actorRowsFor(NPC_PACK_ACTORS, "npc"),
    ...actorRowsFor(MONSTER_BESTIARY, "monster"),
  ];
  const actorSummary = summarizeActorRows(actors);
  const needsFinalArt = itemRows.catalogRows.reduce((sum, row) => sum + numberOr(row.needsFinalArt), 0);
  const visualQaPending = itemRows.catalogRows.reduce((sum, row) => sum + numberOr(row.visualQaPending), 0);
  const criticalNeeds = itemRows.catalogRows
    .filter(row => row.priority === "critical")
    .reduce((sum, row) => sum + numberOr(row.needsFinalArt), 0);
  const criticalVisualQaPending = itemRows.catalogRows
    .filter(row => row.priority === "critical")
    .reduce((sum, row) => sum + numberOr(row.visualQaPending), 0);
  const actorNeedsFinalArt = actorSummary.typeRows.reduce((sum, row) => sum + numberOr(row.needsFinalArt), 0);
  const totalItems = itemRows.catalogRows.reduce((sum, row) => sum + numberOr(row.total), 0);
  const totalActors = actorSummary.typeRows.reduce((sum, row) => sum + numberOr(row.total), 0);
  const finalItems = itemRows.catalogRows.reduce((sum, row) => sum + numberOr(row.system), 0);
  const finalActors = actorSummary.typeRows.reduce((sum, row) => sum + numberOr(row.system), 0);
  const blockers =
    numberOr(assetReport?.summary?.missingImages)
    + numberOr(assetReport?.summary?.missingSystemImages)
    + numberOr(assetReport?.counts?.error);
  const summary = {
    totalItems,
    totalActors,
    finalItems,
    finalActors,
    needsFinalArt,
    visualQaPending,
    criticalNeeds,
    criticalVisualQaPending,
    actorNeedsFinalArt,
    missingImages: numberOr(assetReport?.summary?.missingImages),
    missingSystemImages: numberOr(assetReport?.summary?.missingSystemImages),
    assetErrors: numberOr(assetReport?.counts?.error),
    assetWarnings: numberOr(assetReport?.counts?.warn),
    blockers,
    itemFinalCoveragePct: pct(finalItems, totalItems),
    actorFinalCoveragePct: pct(finalActors, totalActors),
    overallFinalCoveragePct: pct(finalItems + finalActors, totalItems + totalActors),
  };

  return {
    ok: blockers === 0 && needsFinalArt === 0 && visualQaPending === 0 && actorNeedsFinalArt === 0,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    stage: releaseStage(summary),
    summary,
    assetSummary: assetReport?.summary ?? {},
    itemCatalogRows: itemRows.catalogRows,
    itemPriorityRows: itemRows.priorityRows,
    itemTierRows: itemRows.tierRows,
    itemImageClassRows: itemRows.imageClassRows,
    itemBacklogRows: itemRows.backlogRows,
    actorTypeRows: actorSummary.typeRows,
    actorTierRows: actorSummary.tierRows,
    actorImageClassRows: actorSummary.imageClassRows,
    actorBacklogRows: actorSummary.backlogRows,
    backlogText: formatContentArtBacklogReport({
      ...backlogReport,
      items: itemRows.backlogRows,
      summary: {
        total: itemRows.backlogRows.length,
        byCatalog: Object.fromEntries(itemRows.catalogRows.map(row => [row.id, row.needsFinalArt]).filter(([, count]) => count > 0)),
        byClassification: Object.fromEntries(itemRows.imageClassRows.map(row => [row.imageClass, row.count])),
        byTargetState: backlogReport.summary?.byTargetState ?? {},
      },
    }, { maxItems: 18 }),
  };
}

export function formatContentArtCockpitReport(report = null, { maxRows = 18 } = {}) {
  if (!report) return "Iron Hills content art cockpit: unavailable";
  const s = report.summary ?? {};
  const lines = [
    `Iron Hills content art cockpit: ${report.stage ?? "unknown"}`,
    `Overall final coverage: ${numberOr(s.overallFinalCoveragePct)}%`,
    `Items: ${numberOr(s.finalItems)}/${numberOr(s.totalItems)} system-local, replacements=${numberOr(s.needsFinalArt)}, visualQA=${numberOr(s.visualQaPending)}, criticalVisualQA=${numberOr(s.criticalVisualQaPending)}`,
    `Actors/tokens: ${numberOr(s.finalActors)}/${numberOr(s.totalActors)} final, needs=${numberOr(s.actorNeedsFinalArt)}`,
    `Blockers: missingImages=${numberOr(s.missingImages)}, missingSystemFiles=${numberOr(s.missingSystemImages)}, assetErrors=${numberOr(s.assetErrors)}`,
    "",
    "Catalog priorities:",
  ];

  for (const row of report.itemCatalogRows?.slice(0, maxRows) ?? []) {
    lines.push(`- ${row.id}: system=${row.system}/${row.total} (${row.finalCoveragePct}%), replacements=${row.needsFinalArt}, visualQA=${row.visualQaPending}, priority=${row.priority}`);
  }
  if ((report.itemCatalogRows?.length ?? 0) > maxRows) {
    lines.push(`...and ${report.itemCatalogRows.length - maxRows} more catalogs.`);
  }

  if (report.actorTypeRows?.length) {
    lines.push("", "Actor token priorities:");
    for (const row of report.actorTypeRows) {
      lines.push(`- ${row.id}: final=${row.system}/${row.total} (${row.finalCoveragePct}%), needs=${row.needsFinalArt}`);
    }
  }

  if (report.itemBacklogRows?.length) {
    lines.push("", "Top item art backlog:");
    for (const row of report.itemBacklogRows.slice(0, maxRows)) {
      lines.push(`- ${row.catalog}/${row.id}: ${row.name} (${row.currentImageClass}, ${row.reviewReason}) -> ${row.targetFile}`);
    }
  }

  if (report.actorBacklogRows?.length) {
    lines.push("", "Top actor token backlog:");
    for (const row of report.actorBacklogRows.slice(0, Math.min(maxRows, 12))) {
      lines.push(`- ${row.type}/${row.id}: ${row.name} (${row.imageClass})`);
    }
  }

  return lines.join("\n");
}
