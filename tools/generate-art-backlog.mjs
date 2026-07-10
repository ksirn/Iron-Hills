#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildContentArtBacklog,
  contentArtBacklogToCsv,
  contentArtBacklogToMarkdown,
  formatContentArtBacklogReport,
} from "../module/services/content-art-backlog-service.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT_DIR = resolve(ROOT, "docs/content");

function parseArgs(argv) {
  const out = {
    help: false,
    json: false,
    csv: false,
    md: false,
    write: true,
    includeSystem: false,
    includeAll: false,
    catalogs: [],
    outDir: DEFAULT_OUT_DIR,
    maxItems: 24,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--csv") out.csv = true;
    else if (arg === "--md") out.md = true;
    else if (arg === "--no-write") out.write = false;
    else if (arg === "--include-system") out.includeSystem = true;
    else if (arg === "--include-all") out.includeAll = true;
    else if (arg === "--catalog" || arg === "--type") out.catalogs.push(argv[++i]);
    else if (arg.startsWith("--catalog=")) out.catalogs.push(arg.slice("--catalog=".length));
    else if (arg.startsWith("--type=")) out.catalogs.push(arg.slice("--type=".length));
    else if (arg === "--out-dir") out.outDir = resolve(argv[++i]);
    else if (arg.startsWith("--out-dir=")) out.outDir = resolve(arg.slice("--out-dir=".length));
    else if (arg === "--max-items") out.maxItems = Math.max(0, Number(argv[++i]) || 0);
    else if (arg.startsWith("--max-items=")) out.maxItems = Math.max(0, Number(arg.slice("--max-items=".length)) || 0);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/generate-art-backlog.mjs [--no-write] [--catalog weapons] [--json|--csv|--md]",
    "",
    "Builds the item art backlog from catalog rows whose resolved images are not system-local.",
    "",
    "Default output:",
    "  docs/content/art-backlog.json",
    "  docs/content/art-backlog.csv",
    "  docs/content/art-backlog.md",
    "",
    "Options:",
    "  --json              Print JSON to stdout.",
    "  --csv               Print CSV to stdout.",
    "  --md                Print Markdown to stdout.",
    "  --no-write          Do not write docs/content files.",
    "  --catalog <name>    Limit to one catalog/type. Can be repeated.",
    "  --include-system    Include system-local images too.",
    "  --include-all       Include every catalog item.",
    "  --out-dir <dir>     Output directory. Defaults to docs/content.",
    "  --max-items <n>     Limit preview rows in console report.",
  ].join("\n");
}

function inferCatalogFromFile(fileName) {
  if (fileName.startsWith("weapon")) return "weapons";
  if (fileName.startsWith("armor")) return "armor";
  if (fileName.startsWith("consumable")) return "consumables";
  if (fileName.startsWith("food")) return "food";
  if (fileName.startsWith("potion")) return "potions";
  if (fileName.startsWith("spell")) return "spells";
  if (fileName.startsWith("throwable")) return "throwables";
  if (fileName.startsWith("gear")) return "";
  if (fileName.startsWith("monster-loot")) return "materials";
  return "";
}

function promptKey(catalog, id) {
  return `${catalog}:${id}`;
}

function catalogFromPromptRow(row, inferredCatalog) {
  const explicit = String(row?.category ?? "").trim();
  if (explicit) return explicit;
  const type = String(row?.type ?? "").trim();
  if (type === "material") return "materials";
  if (type === "consumable") return "consumables";
  if (type === "throwable") return "throwables";
  if (type === "potion") return "potions";
  if (type === "spell") return "spells";
  if (type === "weapon") return "weapons";
  if (type === "armor") return "armor";
  if (type === "tool") return "tools";
  if (type === "belt") return "belts";
  if (type === "backpack") return "backpacks";
  if (type === "attachment") return "attachments";
  if (type === "food") return "food";
  return String(inferredCatalog ?? "").trim();
}

function loadPromptOverrides(contentDir = DEFAULT_OUT_DIR) {
  const map = new Map();
  let files = [];
  try {
    files = readdirSync(contentDir).filter(file => file.endsWith("-prompts.json"));
  } catch {
    return map;
  }

  for (const file of files) {
    const source = `docs/content/${file}`;
    let data = null;
    try {
      data = JSON.parse(readFileSync(resolve(contentDir, file), "utf8"));
    } catch {
      continue;
    }

    const inferredCatalog = inferCatalogFromFile(file);
    const negative = data?.negative ?? data?.negativePrompt ?? "";
    const rows = [
      ...(Array.isArray(data?.items) ? data.items : []),
      ...(Array.isArray(data?.uniqueLoot) ? data.uniqueLoot : []),
    ];
    for (const row of rows) {
      const id = String(row?.id ?? row?.catalogId ?? "").trim();
      if (!id || !row?.prompt) continue;
      const catalog = catalogFromPromptRow(row, inferredCatalog);
      const value = {
        prompt: row.prompt,
        negative: row.negative ?? negative,
        source,
      };
      if (catalog) map.set(promptKey(catalog, id), value);
      if (!map.has(id)) map.set(id, value);
    }
  }

  return map;
}

function targetExists(relativePath) {
  return existsSync(resolve(ROOT, relativePath));
}

function writeOutputs(report, outDir) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "art-backlog.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  writeFileSync(resolve(outDir, "art-backlog.csv"), contentArtBacklogToCsv(report), "utf8");
  writeFileSync(resolve(outDir, "art-backlog.md"), contentArtBacklogToMarkdown(report), "utf8");
}

export function generateArtBacklog(options = {}) {
  const outDir = resolve(options.outDir ?? DEFAULT_OUT_DIR);
  const promptOverrides = loadPromptOverrides(outDir);
  const report = buildContentArtBacklog({
    catalogs: options.catalogs ?? [],
    includeSystem: Boolean(options.includeSystem),
    includeAll: Boolean(options.includeAll),
    promptOverrides,
    targetExists,
  });

  if (options.write !== false) writeOutputs(report, outDir);
  return report;
}

function isDirectRun() {
  return resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
}

function printRequested(report, options) {
  if (options.json) return process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  if (options.csv) return process.stdout.write(contentArtBacklogToCsv(report));
  if (options.md) return process.stdout.write(contentArtBacklogToMarkdown(report));
  process.stdout.write(formatContentArtBacklogReport(report, { maxItems: options.maxItems }) + "\n");
  if (options.write !== false) {
    process.stdout.write("Wrote docs/content/art-backlog.{json,csv,md}\n");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const report = generateArtBacklog(options);
  printRequested(report, options);
}

if (isDirectRun()) {
  main().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
