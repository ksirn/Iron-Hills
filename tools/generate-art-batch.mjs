#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = resolve(ROOT, "docs/content/art-backlog.json");
const DEFAULT_OUT_DIR = resolve(ROOT, "docs/content");

const CATALOG_PRIORITY = Object.freeze([
  "weapons",
  "armor",
  "potions",
  "consumables",
  "throwables",
  "spells",
  "food",
  "tools",
  "belts",
  "backpacks",
  "attachments",
  "materials",
]);

function parseArgs(argv) {
  const out = {
    help: false,
    json: false,
    csv: false,
    md: false,
    write: true,
    manifest: DEFAULT_MANIFEST,
    outDir: DEFAULT_OUT_DIR,
    catalogs: [],
    batchSize: 20,
    includeExistingTargets: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--csv") out.csv = true;
    else if (arg === "--md") out.md = true;
    else if (arg === "--no-write") out.write = false;
    else if (arg === "--manifest") out.manifest = resolve(argv[++i]);
    else if (arg.startsWith("--manifest=")) out.manifest = resolve(arg.slice("--manifest=".length));
    else if (arg === "--out-dir") out.outDir = resolve(argv[++i]);
    else if (arg.startsWith("--out-dir=")) out.outDir = resolve(arg.slice("--out-dir=".length));
    else if (arg === "--catalog" || arg === "--type") out.catalogs.push(argv[++i]);
    else if (arg.startsWith("--catalog=")) out.catalogs.push(arg.slice("--catalog=".length));
    else if (arg.startsWith("--type=")) out.catalogs.push(arg.slice("--type=".length));
    else if (arg === "--batch-size") out.batchSize = Math.max(1, Number(argv[++i]) || 20);
    else if (arg.startsWith("--batch-size=")) out.batchSize = Math.max(1, Number(arg.slice("--batch-size=".length)) || 20);
    else if (arg === "--include-existing-targets") out.includeExistingTargets = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/generate-art-batch.mjs [--catalog weapons] [--batch-size 20]",
    "",
    "Builds prompt-driven batch files from docs/content/art-backlog.json.",
    "",
    "Default output:",
    "  docs/content/art-batch.json",
    "  docs/content/art-batch.csv",
    "  docs/content/art-batch.md",
    "",
    "Options:",
    "  --json                    Print JSON.",
    "  --csv                     Print CSV.",
    "  --md                      Print Markdown.",
    "  --no-write                Do not write docs/content files.",
    "  --manifest <file>         Backlog JSON path.",
    "  --out-dir <dir>           Output directory. Defaults to docs/content.",
    "  --catalog <name>          Limit to one catalog/type. Can be repeated.",
    "  --batch-size <n>          Items per batch. Defaults to 20.",
    "  --include-existing-targets Include rows whose targetFile already exists.",
  ].join("\n");
}

function priorityFor(catalog) {
  const index = CATALOG_PRIORITY.indexOf(catalog);
  return index === -1 ? CATALOG_PRIORITY.length : index;
}

function shouldUseItem(item, options) {
  if (!item?.id || !item?.targetFile || !item?.prompt) return false;
  if (!options.includeExistingTargets && item.targetExists) return false;
  if (!options.catalogs.length) return true;
  const wanted = new Set(options.catalogs);
  return wanted.has(item.catalog) || wanted.has(item.type);
}

function sortedItems(items) {
  return [...items].sort((a, b) =>
    priorityFor(a.catalog) - priorityFor(b.catalog)
    || a.tier - b.tier
    || a.gridH - b.gridH
    || a.id.localeCompare(b.id)
  );
}

function batchSlug(catalog, index) {
  return `${catalog}-${String(index).padStart(2, "0")}`;
}

function buildBatches(items, batchSize) {
  const batches = [];
  let currentCatalog = "";
  let currentBatch = null;
  let catalogBatchIndex = 0;

  for (const item of items) {
    if (item.catalog !== currentCatalog) {
      currentCatalog = item.catalog;
      catalogBatchIndex = 0;
      currentBatch = null;
    }
    if (!currentBatch || currentBatch.items.length >= batchSize) {
      catalogBatchIndex += 1;
      currentBatch = {
        id: batchSlug(item.catalog, catalogBatchIndex),
        catalog: item.catalog,
        type: item.type,
        count: 0,
        items: [],
      };
      batches.push(currentBatch);
    }
    currentBatch.items.push(item);
    currentBatch.count += 1;
  }

  return batches;
}

function toBatchItem(item, sequence) {
  return {
    sequence,
    batchId: item.batchId,
    catalog: item.catalog,
    type: item.type,
    id: item.id,
    name: item.name,
    tier: item.tier,
    gridW: item.gridW,
    gridH: item.gridH,
    aspect: item.aspect,
    resolution: item.resolution,
    targetFile: item.targetFile,
    targetImg: item.targetImg,
    promptSource: item.promptSource,
    prompt: item.prompt,
    negative: item.negative,
    instructions: [
      "Generate one isolated fantasy RPG item image from this exact prompt.",
      "Preserve the requested aspect/resolution profile for the Tarkov grid footprint.",
      "Save the final selected image exactly to targetFile as WebP.",
      "Do not use procedural placeholder/icon-symbol art.",
    ].join(" "),
  };
}

export function buildArtBatchManifest(options = {}) {
  const manifest = resolve(options.manifest ?? DEFAULT_MANIFEST);
  const source = JSON.parse(readFileSync(manifest, "utf8"));
  const filtered = sortedItems((source.items ?? []).filter(item => shouldUseItem(item, {
    catalogs: options.catalogs ?? [],
    includeExistingTargets: Boolean(options.includeExistingTargets),
  })));
  const batches = buildBatches(filtered, Math.max(1, Number(options.batchSize ?? 20) || 20));

  let sequence = 0;
  const items = [];
  for (const batch of batches) {
    batch.items = batch.items.map(item => {
      sequence += 1;
      const next = toBatchItem({ ...item, batchId: batch.id }, sequence);
      items.push(next);
      return next;
    });
  }

  const byCatalog = {};
  for (const item of items) byCatalog[item.catalog] = (byCatalog[item.catalog] ?? 0) + 1;

  return {
    label: "Iron Hills prompt-driven item art batch",
    generatedAt: new Date().toISOString(),
    sourceManifest: manifest.replace(/\\/g, "/").replace(ROOT.replace(/\\/g, "/") + "/", ""),
    ok: items.length === 0,
    summary: {
      total: items.length,
      batches: batches.length,
      batchSize: Math.max(1, Number(options.batchSize ?? 20) || 20),
      byCatalog,
    },
    workflow: [
      "1. Generate images from this manifest, one row per asset.",
      "2. Save each selected final image exactly at targetFile.",
      "3. Run node tools/audit-art-targets.mjs before applying catalog paths.",
      "4. Run node tools/apply-art-backlog.mjs --dry-run, then apply without --dry-run after QA is clean.",
    ],
    batches,
    items,
  };
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(manifest) {
  const header = [
    "sequence",
    "batchId",
    "catalog",
    "id",
    "name",
    "tier",
    "gridW",
    "gridH",
    "aspect",
    "resolution",
    "targetFile",
    "promptSource",
    "prompt",
    "negative",
  ];
  return [
    header.join(","),
    ...manifest.items.map(item => header.map(key => escapeCsv(item[key])).join(",")),
  ].join("\n") + "\n";
}

function toMarkdown(manifest) {
  const lines = [
    "# Iron Hills Prompt-Driven Item Art Batch",
    "",
    `Generated: ${manifest.generatedAt}`,
    "",
    "This file is the safe art-production queue. It is not a placeholder generator.",
    "",
    "## Workflow",
    "",
    ...manifest.workflow.map(line => `- ${line}`),
    "",
    "## Summary",
    "",
    `- Total: ${manifest.summary.total}`,
    `- Batches: ${manifest.summary.batches}`,
    `- By catalog: ${Object.entries(manifest.summary.byCatalog).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    "",
  ];

  for (const batch of manifest.batches) {
    lines.push(`## ${batch.id}`, "");
    for (const item of batch.items) {
      lines.push(`### ${item.sequence}. ${item.name} (\`${item.catalog}/${item.id}\`)`);
      lines.push("");
      lines.push(`- Target: \`${item.targetFile}\``);
      lines.push(`- Grid: ${item.gridW}x${item.gridH}, ${item.aspect}, ${item.resolution}`);
      lines.push(`- Source: ${item.promptSource || "fallback"}`);
      lines.push("");
      lines.push("Prompt:");
      lines.push("```");
      lines.push(item.prompt);
      lines.push("```");
      lines.push("");
      lines.push("Negative:");
      lines.push("```");
      lines.push(item.negative);
      lines.push("```");
      lines.push("");
    }
  }

  return lines.join("\n");
}

function writeOutputs(manifest, outDir) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "art-batch.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  writeFileSync(resolve(outDir, "art-batch.csv"), toCsv(manifest), "utf8");
  writeFileSync(resolve(outDir, "art-batch.md"), toMarkdown(manifest), "utf8");
}

function printRequested(manifest, options) {
  if (options.json) return process.stdout.write(JSON.stringify(manifest, null, 2) + "\n");
  if (options.csv) return process.stdout.write(toCsv(manifest));
  if (options.md) return process.stdout.write(toMarkdown(manifest));
  process.stdout.write([
    `Iron Hills art batch: ${manifest.summary.total} items in ${manifest.summary.batches} batches`,
    `By catalog: ${Object.entries(manifest.summary.byCatalog).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
  ].join("\n") + "\n");
  if (options.write !== false) process.stdout.write("Wrote docs/content/art-batch.{json,csv,md}\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const manifest = buildArtBatchManifest(options);
  if (options.write !== false) writeOutputs(manifest, resolve(options.outDir ?? DEFAULT_OUT_DIR));
  printRequested(manifest, options);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
