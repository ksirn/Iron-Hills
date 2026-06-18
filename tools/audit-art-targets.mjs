#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  auditArtTargets,
  formatArtTargetAuditReport,
} from "../module/services/content-art-quality-service.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = resolve(ROOT, "docs/content/art-backlog.json");

function parseArgs(argv) {
  const out = {
    help: false,
    json: false,
    manifest: DEFAULT_MANIFEST,
    catalogs: [],
    requireExists: true,
    strictWarnings: false,
    maxFindings: 20,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--manifest") out.manifest = resolve(argv[++i]);
    else if (arg.startsWith("--manifest=")) out.manifest = resolve(arg.slice("--manifest=".length));
    else if (arg === "--catalog" || arg === "--type") out.catalogs.push(argv[++i]);
    else if (arg.startsWith("--catalog=")) out.catalogs.push(arg.slice("--catalog=".length));
    else if (arg.startsWith("--type=")) out.catalogs.push(arg.slice("--type=".length));
    else if (arg === "--allow-missing") out.requireExists = false;
    else if (arg === "--strict-warnings") out.strictWarnings = true;
    else if (arg === "--max-findings") out.maxFindings = Math.max(0, Number(argv[++i]) || 0);
    else if (arg.startsWith("--max-findings=")) out.maxFindings = Math.max(0, Number(arg.slice("--max-findings=".length)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/audit-art-targets.mjs [--manifest docs/content/art-backlog.json] [--catalog weapons]",
    "",
    "Checks generated target WebP files before they are applied to catalogs.",
    "",
    "Options:",
    "  --json              Print JSON report.",
    "  --manifest <file>  Backlog JSON path.",
    "  --catalog <name>   Limit to one catalog/type. Can be repeated.",
    "  --allow-missing    Do not fail for missing target files.",
    "  --strict-warnings  Treat warnings as process failure.",
    "  --max-findings <n> Limit text report findings.",
  ].join("\n");
}

export function runArtTargetAudit(options = {}) {
  const manifest = resolve(options.manifest ?? DEFAULT_MANIFEST);
  const report = JSON.parse(readFileSync(manifest, "utf8"));
  return auditArtTargets(report, {
    root: ROOT,
    catalogs: options.catalogs ?? [],
    requireExists: options.requireExists !== false,
    strictWarnings: Boolean(options.strictWarnings),
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const report = runArtTargetAudit(options);
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else console.log(formatArtTargetAuditReport(report, { maxFindings: options.maxFindings }));

  if (!report.ok) process.exit(1);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
