#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  auditArtTargets,
  formatArtTargetAuditReport,
} from "../module/services/content-art-quality-service.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = resolve(ROOT, "docs/content/art-replacement-candidates.json");

function parseArgs(argv) {
  const out = {
    help: false,
    apply: false,
    json: false,
    manifest: DEFAULT_MANIFEST,
    catalogs: [],
    ids: [],
    strictWarnings: true,
    allowMissing: false,
    maxItems: 0,
    maxFindings: 20,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--apply") out.apply = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--manifest") out.manifest = resolve(argv[++i]);
    else if (arg.startsWith("--manifest=")) out.manifest = resolve(arg.slice("--manifest=".length));
    else if (arg === "--catalog" || arg === "--type") out.catalogs.push(argv[++i]);
    else if (arg.startsWith("--catalog=")) out.catalogs.push(arg.slice("--catalog=".length));
    else if (arg.startsWith("--type=")) out.catalogs.push(arg.slice("--type=".length));
    else if (arg === "--id") out.ids.push(argv[++i]);
    else if (arg.startsWith("--id=")) out.ids.push(arg.slice("--id=".length));
    else if (arg === "--allow-warnings") out.strictWarnings = false;
    else if (arg === "--allow-missing") out.allowMissing = true;
    else if (arg === "--max-items") out.maxItems = Math.max(0, Number(argv[++i]) || 0);
    else if (arg.startsWith("--max-items=")) out.maxItems = Math.max(0, Number(arg.slice("--max-items=".length)) || 0);
    else if (arg === "--max-findings") out.maxFindings = Math.max(0, Number(argv[++i]) || 0);
    else if (arg.startsWith("--max-findings=")) out.maxFindings = Math.max(0, Number(arg.slice("--max-findings=".length)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/promote-art-candidates.mjs [--apply] [--catalog materials] [--id mana_crystal]",
    "",
    "Promotes QA-approved candidate images from art-candidates/items/... over their final icons/items/... files.",
    "Default mode is dry-run. Use --apply to copy files.",
    "",
    "Options:",
    "  --apply                 Copy candidate files over final files.",
    "  --json                  Print JSON report.",
    "  --manifest <file>       Replacement candidates manifest. Defaults to docs/content/art-replacement-candidates.json.",
    "  --catalog <name>        Limit to one catalog/type. Can be repeated.",
    "  --id <catalogId>        Limit to one item id. Can be repeated.",
    "  --allow-warnings        Do not block promotion on art QA warnings.",
    "  --allow-missing         Keep missing candidate files as skipped instead of failing.",
    "  --max-items <n>         Limit promoted/copied items after filtering.",
    "  --max-findings <n>      Limit text report findings.",
  ].join("\n");
}

function normalizePath(value) {
  return String(value ?? "").trim().replace(/\\/g, "/");
}

function loadManifest(path) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  return Array.isArray(data?.items) ? data.items : [];
}

function shouldUseItem(item, options) {
  if (!item?.id || !item?.targetFile || !item?.finalFile) return false;
  if (options.catalogs.length) {
    const wanted = new Set(options.catalogs.map(value => String(value ?? "").trim()).filter(Boolean));
    if (!wanted.has(item.catalog) && !wanted.has(item.type)) return false;
  }
  if (options.ids.length) {
    const wanted = new Set(options.ids.map(value => String(value ?? "").trim()).filter(Boolean));
    if (!wanted.has(item.id)) return false;
  }
  return true;
}

function existingCandidateItems(items, options) {
  const present = [];
  const missing = [];
  for (const item of items) {
    const targetFile = normalizePath(item.targetFile);
    if (existsSync(resolve(ROOT, targetFile))) present.push(item);
    else missing.push(item);
  }
  return { present, missing };
}

function fileInfo(relativePath) {
  const absolutePath = resolve(ROOT, relativePath);
  try {
    const stat = statSync(absolutePath);
    return {
      path: normalizePath(relativePath),
      exists: true,
      bytes: stat.size,
    };
  } catch {
    return {
      path: normalizePath(relativePath),
      exists: false,
      bytes: 0,
    };
  }
}

function copyCandidate(item) {
  const candidate = resolve(ROOT, normalizePath(item.targetFile));
  const final = resolve(ROOT, normalizePath(item.finalFile));
  mkdirSync(dirname(final), { recursive: true });
  copyFileSync(candidate, final);
}

export function promoteArtCandidates(options = {}) {
  const resolved = {
    apply: Boolean(options.apply),
    manifest: resolve(options.manifest ?? DEFAULT_MANIFEST),
    catalogs: Array.isArray(options.catalogs) ? options.catalogs : [],
    ids: Array.isArray(options.ids) ? options.ids : [],
    strictWarnings: options.strictWarnings !== false,
    allowMissing: Boolean(options.allowMissing),
    maxItems: Math.max(0, Number(options.maxItems ?? 0) || 0),
  };

  const filtered = loadManifest(resolved.manifest).filter(item => shouldUseItem(item, resolved));
  const limited = resolved.maxItems > 0 ? filtered.slice(0, resolved.maxItems) : filtered;
  const { present, missing } = existingCandidateItems(limited, resolved);
  const audit = auditArtTargets({ items: present }, {
    root: ROOT,
    requireExists: true,
    strictWarnings: resolved.strictWarnings,
  });
  const blockers = [];

  if (missing.length && !resolved.allowMissing) {
    blockers.push({
      severity: "error",
      code: "missing-candidate-files",
      message: `${missing.length} candidate files are missing. Generate them first or pass --allow-missing to skip.`,
    });
  }
  if (!audit.ok) {
    blockers.push({
      severity: "error",
      code: "candidate-art-audit-failed",
      message: "Candidate art audit failed. Fix image dimensions/quality before promotion.",
    });
  }

  const promoted = [];
  const skipped = [];
  if (!blockers.length) {
    for (const item of present) {
      const before = fileInfo(item.finalFile);
      if (resolved.apply) copyCandidate(item);
      const after = resolved.apply ? fileInfo(item.finalFile) : before;
      promoted.push({
        catalog: item.catalog,
        id: item.id,
        name: item.name,
        mode: resolved.apply ? "copied" : "dry-run",
        candidate: fileInfo(item.targetFile),
        finalBefore: before,
        finalAfter: after,
      });
    }
  }

  for (const item of missing) {
    skipped.push({
      catalog: item.catalog,
      id: item.id,
      name: item.name,
      reason: "candidate-missing",
      candidate: normalizePath(item.targetFile),
      finalFile: normalizePath(item.finalFile),
    });
  }

  return {
    label: "Iron Hills art candidate promotion",
    ok: blockers.length === 0,
    mode: resolved.apply ? "apply" : "dry-run",
    manifest: normalizePath(resolved.manifest).replace(normalizePath(ROOT) + "/", ""),
    summary: {
      selected: limited.length,
      candidateFilesPresent: present.length,
      candidateFilesMissing: missing.length,
      promoted: promoted.length,
      skipped: skipped.length,
      blockers: blockers.length,
      auditErrors: audit.summary?.errors ?? 0,
      auditWarnings: audit.summary?.warnings ?? 0,
    },
    blockers,
    audit,
    promoted,
    skipped,
  };
}

function formatReport(report, { maxFindings = 20 } = {}) {
  const summary = report.summary ?? {};
  const lines = [
    `Iron Hills art candidate promotion: ${report.ok ? "OK" : "BLOCKED"}`,
    `Mode: ${report.mode}`,
    `Selected=${summary.selected}, present=${summary.candidateFilesPresent}, missing=${summary.candidateFilesMissing}, promoted=${summary.promoted}, skipped=${summary.skipped}`,
  ];
  for (const blocker of report.blockers ?? []) lines.push(`- [${blocker.severity.toUpperCase()}] ${blocker.message} (${blocker.code})`);
  if (report.audit) lines.push(formatArtTargetAuditReport(report.audit, { maxFindings }));
  const promoted = report.promoted ?? [];
  if (promoted.length) {
    lines.push("Promotion plan:");
    for (const item of promoted.slice(0, maxFindings)) {
      lines.push(`- ${item.mode}: ${item.catalog}/${item.id} ${item.candidate.path} -> ${item.finalBefore.path}`);
    }
    if (promoted.length > maxFindings) lines.push(`...and ${promoted.length - maxFindings} more items.`);
  }
  const skipped = report.skipped ?? [];
  if (skipped.length) {
    lines.push("Skipped missing candidates:");
    for (const item of skipped.slice(0, maxFindings)) lines.push(`- ${item.catalog}/${item.id}: ${item.candidate}`);
    if (skipped.length > maxFindings) lines.push(`...and ${skipped.length - maxFindings} more skipped items.`);
  }
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const report = promoteArtCandidates(options);
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else console.log(formatReport(report, { maxFindings: options.maxFindings }));
  if (!report.ok) process.exit(1);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
