#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = resolve(ROOT, "docs/content/art-batch.json");
const DEFAULT_OUT_DIR = resolve(ROOT, "tmp/imagegen");

function parseArgs(argv) {
  const out = {
    help: false,
    json: false,
    manifest: DEFAULT_MANIFEST,
    outDir: DEFAULT_OUT_DIR,
    catalogs: [],
    ids: [],
    batchId: "",
    maxItems: 0,
    skipExisting: true,
    quality: "high",
    outputFormat: "webp",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--manifest") out.manifest = resolve(argv[++i]);
    else if (arg.startsWith("--manifest=")) out.manifest = resolve(arg.slice("--manifest=".length));
    else if (arg === "--out-dir") out.outDir = resolve(argv[++i]);
    else if (arg.startsWith("--out-dir=")) out.outDir = resolve(arg.slice("--out-dir=".length));
    else if (arg === "--catalog" || arg === "--type") out.catalogs.push(argv[++i]);
    else if (arg.startsWith("--catalog=")) out.catalogs.push(arg.slice("--catalog=".length));
    else if (arg.startsWith("--type=")) out.catalogs.push(arg.slice("--type=".length));
    else if (arg === "--id") out.ids.push(argv[++i]);
    else if (arg.startsWith("--id=")) out.ids.push(arg.slice("--id=".length));
    else if (arg === "--batch-id") out.batchId = String(argv[++i] ?? "").trim();
    else if (arg.startsWith("--batch-id=")) out.batchId = String(arg.slice("--batch-id=".length)).trim();
    else if (arg === "--max-items") out.maxItems = Math.max(0, Number(argv[++i]) || 0);
    else if (arg.startsWith("--max-items=")) out.maxItems = Math.max(0, Number(arg.slice("--max-items=".length)) || 0);
    else if (arg === "--include-existing") out.skipExisting = false;
    else if (arg === "--quality") out.quality = String(argv[++i] ?? "high").trim();
    else if (arg.startsWith("--quality=")) out.quality = String(arg.slice("--quality=".length)).trim();
    else if (arg === "--output-format") out.outputFormat = String(argv[++i] ?? "webp").trim();
    else if (arg.startsWith("--output-format=")) out.outputFormat = String(arg.slice("--output-format=".length)).trim();
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/export-art-batch-jsonl.mjs [--catalog consumables] [--batch-id tools-01]",
    "",
    "Exports docs/content/art-batch.json rows into per-catalog JSONL files for the imagegen CLI.",
    "Each JSONL file is intended to be run with scripts/image_gen.py generate-batch and an out-dir matching the reported catalog output directory.",
    "",
    "Options:",
    "  --json                  Print JSON report.",
    "  --manifest <file>       Art batch manifest. Defaults to docs/content/art-batch.json.",
    "  --out-dir <dir>         JSONL output directory. Defaults to tmp/imagegen.",
    "  --catalog <name>        Limit to one catalog/type. Can be repeated.",
    "  --id <catalogId>        Limit to one item id. Can be repeated.",
    "  --batch-id <id>         Limit to one batch id from art-batch.json.",
    "  --max-items <n>         Limit exported rows after filtering.",
    "  --include-existing      Include rows whose targetFile already exists.",
    "  --quality <value>       Per-job image quality. Defaults to high.",
    "  --output-format <fmt>   Per-job output format. Defaults to webp.",
  ].join("\n");
}

function normalizePath(value) {
  return String(value ?? "").trim().replace(/\\/g, "/");
}

function loadItems(manifestPath) {
  const data = JSON.parse(readFileSync(manifestPath, "utf8"));
  return Array.isArray(data?.items) ? data.items : [];
}

function shouldUse(item, options) {
  if (!item?.id || !item?.targetFile || !item?.prompt) return false;
  if (options.batchId && item.batchId !== options.batchId) return false;
  if (options.catalogs.length) {
    const wanted = new Set(options.catalogs.map(value => String(value ?? "").trim()).filter(Boolean));
    if (!wanted.has(item.catalog) && !wanted.has(item.type)) return false;
  }
  if (options.ids.length) {
    const wanted = new Set(options.ids.map(value => String(value ?? "").trim()).filter(Boolean));
    if (!wanted.has(item.id)) return false;
  }
  if (options.skipExisting && existsSync(resolve(ROOT, normalizePath(item.targetFile)))) return false;
  return true;
}

function sizeFor(item) {
  const text = String(item.resolution ?? "").trim();
  if (/^[1-9][0-9]*x[1-9][0-9]*$/.test(text)) return text;
  const gridW = Math.max(1, Number(item.gridW ?? 1) || 1);
  const gridH = Math.max(1, Number(item.gridH ?? 1) || 1);
  return gridH / gridW >= 2 ? "768x1536" : "1024x1024";
}

function jobFor(item, options) {
  return {
    prompt: item.prompt,
    out: basename(normalizePath(item.targetFile)),
    size: sizeFor(item),
    quality: options.quality,
    output_format: options.outputFormat,
    n: 1,
  };
}

function groupByCatalog(items) {
  const groups = new Map();
  for (const item of items) {
    const key = String(item.catalog ?? item.type ?? "items");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function writeJsonl(file, rows) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, rows.map(row => JSON.stringify(row)).join("\n") + "\n", "utf8");
}

export function exportArtBatchJsonl(options = {}) {
  const resolved = {
    manifest: resolve(options.manifest ?? DEFAULT_MANIFEST),
    outDir: resolve(options.outDir ?? DEFAULT_OUT_DIR),
    catalogs: Array.isArray(options.catalogs) ? options.catalogs : [],
    ids: Array.isArray(options.ids) ? options.ids : [],
    batchId: String(options.batchId ?? "").trim(),
    maxItems: Math.max(0, Number(options.maxItems ?? 0) || 0),
    skipExisting: options.skipExisting !== false,
    quality: String(options.quality ?? "high").trim() || "high",
    outputFormat: String(options.outputFormat ?? "webp").trim() || "webp",
  };
  const filtered = loadItems(resolved.manifest).filter(item => shouldUse(item, resolved));
  const selected = resolved.maxItems > 0 ? filtered.slice(0, resolved.maxItems) : filtered;
  const groups = groupByCatalog(selected);
  const files = [];

  for (const [catalog, items] of groups.entries()) {
    const suffix = resolved.batchId || catalog;
    const jsonl = resolve(resolved.outDir, `art-candidates-${suffix}.jsonl`);
    writeJsonl(jsonl, items.map(item => jobFor(item, resolved)));
    files.push({
      catalog,
      count: items.length,
      input: normalizePath(jsonl),
      outDir: normalizePath(resolve(ROOT, `art-candidates/items/${catalog}`)),
      firstTarget: normalizePath(items[0]?.targetFile ?? ""),
    });
  }

  return {
    label: "Iron Hills imagegen JSONL export",
    ok: selected.length > 0,
    summary: {
      selected: selected.length,
      files: files.length,
      skippedExisting: loadItems(resolved.manifest).filter(item => !shouldUse(item, { ...resolved, skipExisting: false })).length,
    },
    files,
  };
}

function formatReport(report) {
  const lines = [
    `Iron Hills imagegen JSONL export: ${report.ok ? "OK" : "EMPTY"}`,
    `Selected=${report.summary.selected}, files=${report.summary.files}`,
  ];
  for (const file of report.files) {
    lines.push(`- ${file.catalog}: ${file.count} jobs`);
    lines.push(`  input: ${file.input}`);
    lines.push(`  out-dir: ${file.outDir}`);
  }
  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const report = exportArtBatchJsonl(options);
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else console.log(formatReport(report));
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
