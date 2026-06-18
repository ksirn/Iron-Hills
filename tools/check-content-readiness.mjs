#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  checkIronHillsContentReadiness,
  formatContentReadinessReport,
} from "../module/services/content-readiness-service.mjs";
import {
  DEFAULT_LEVEL_MODULE,
  ROOT,
  syncGeneratedPacks,
} from "./sync-generated-packs.mjs";

function parseArgs(argv) {
  const out = {
    json: false,
    help: false,
    packs: [],
    systemRoot: ROOT,
    levelModule: DEFAULT_LEVEL_MODULE,
    checkFilesystem: true,
    includePackDryRun: true,
    planOnly: false,
    pruneItemPacks: false,
    strictArt: false,
    maxFindings: 20,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") out.json = true;
    else if (arg === "--no-files") out.checkFilesystem = false;
    else if (arg === "--no-pack-dry-run") out.includePackDryRun = false;
    else if (arg === "--plan-only") out.planOnly = true;
    else if (arg === "--prune-item-packs") out.pruneItemPacks = true;
    else if (arg === "--strict-art") out.strictArt = true;
    else if (arg === "--pack") out.packs.push(argv[++i]);
    else if (arg.startsWith("--pack=")) out.packs.push(arg.slice("--pack=".length));
    else if (arg === "--system-root") out.systemRoot = path.resolve(argv[++i]);
    else if (arg.startsWith("--system-root=")) out.systemRoot = path.resolve(arg.slice("--system-root=".length));
    else if (arg === "--level-module") out.levelModule = argv[++i];
    else if (arg.startsWith("--level-module=")) out.levelModule = arg.slice("--level-module=".length);
    else if (arg === "--max-findings") out.maxFindings = Math.max(0, Number(argv[++i]) || 0);
    else if (arg.startsWith("--max-findings=")) out.maxFindings = Math.max(0, Number(arg.slice("--max-findings=".length)) || 0);
    else if (arg === "--help" || arg === "-h") out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/check-content-readiness.mjs [--json] [--pack ih-materials] [--no-files]",
    "",
    "Runs a read-only pre-Foundry content readiness pass:",
    "  1. source catalog validation",
    "  2. system asset and manifest audit",
    "  3. generated content sample validation",
    "  4. generated pack source validation",
    "  5. optional offline generated pack dry-run against LevelDB",
    "",
    "Options:",
    "  --json               Print machine-readable JSON instead of a text report.",
    "  --pack <name>        Limit pack dry-run and manifest checks to a generated pack.",
    "  --no-files           Skip filesystem checks for system-local image and pack paths.",
    "  --no-pack-dry-run    Skip LevelDB pack diff checks.",
    "  --plan-only          Build generated pack data and manifest plan without opening LevelDB.",
    "  --prune-item-packs   Report deletion of extra docs from generated Item packs during dry-run.",
    "  --strict-art         Treat non-system item images as readiness failures for release gating.",
    "  --system-root <dir>  System root. Defaults to the current repository.",
    "  --level-module <dir> classic-level module path. Defaults to the local Foundry install.",
    "  --max-findings <n>   Limit findings in the text report.",
  ].join("\n");
}

export async function checkContentReadiness(options = {}) {
  const resolved = {
    json: Boolean(options.json),
    packs: Array.isArray(options.packs) ? options.packs : [],
    systemRoot: path.resolve(options.systemRoot ?? ROOT),
    levelModule: options.levelModule ?? DEFAULT_LEVEL_MODULE,
    checkFilesystem: options.checkFilesystem !== false,
    includePackDryRun: options.includePackDryRun !== false,
    planOnly: Boolean(options.planOnly),
    pruneItemPacks: Boolean(options.pruneItemPacks),
    strictArt: Boolean(options.strictArt),
    maxFindings: Math.max(0, Number(options.maxFindings ?? 20) || 0),
  };

  const originalCwd = process.cwd();
  process.chdir(resolved.systemRoot);
  try {
    return await checkIronHillsContentReadiness({
      packs: resolved.packs,
      checkFilesystem: resolved.checkFilesystem,
      includePackDryRun: resolved.includePackDryRun,
      requireCleanPackDryRun: true,
      strictArt: resolved.strictArt,
      maxFindings: resolved.maxFindings,
      packDryRunRunner: () => syncGeneratedPacks({
        apply: false,
        preflight: false,
        planOnly: resolved.planOnly,
        packs: resolved.packs,
        systemRoot: resolved.systemRoot,
        levelModule: resolved.levelModule,
        pruneItemPacks: resolved.pruneItemPacks,
      }),
    });
  } finally {
    process.chdir(originalCwd);
  }
}

function isDirectRun() {
  return path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const report = await checkContentReadiness(options);
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else console.log(formatContentReadinessReport(report, { maxFindings: options.maxFindings }));
  if (!report.ok) process.exitCode = 1;
}

if (isDirectRun()) {
  run().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
