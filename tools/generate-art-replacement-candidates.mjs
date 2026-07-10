#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { generateArtBacklog } from "./generate-art-backlog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT_DIR = resolve(ROOT, "docs/content");
const SYSTEM_PREFIX = "systems/iron-hills-system/";
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_SMALL_FILE_BYTES = 45_000;
const BASELINE_CATALOGS = new Set(["materials", "tools", "belts", "backpacks", "attachments"]);
const CATALOG_PRIORITY = [
  "consumables",
  "tools",
  "belts",
  "backpacks",
  "attachments",
  "materials",
  "armor",
  "weapons",
  "potions",
  "food",
  "throwables",
  "spells",
];

function parseArgs(argv) {
  const out = {
    help: false,
    json: false,
    csv: false,
    md: false,
    write: true,
    outDir: DEFAULT_OUT_DIR,
    catalogs: [],
    batchSize: DEFAULT_BATCH_SIZE,
    includeSmallExisting: false,
    smallFileBytes: DEFAULT_SMALL_FILE_BYTES,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--csv") out.csv = true;
    else if (arg === "--md") out.md = true;
    else if (arg === "--no-write") out.write = false;
    else if (arg === "--out-dir") out.outDir = resolve(argv[++i]);
    else if (arg.startsWith("--out-dir=")) out.outDir = resolve(arg.slice("--out-dir=".length));
    else if (arg === "--catalog" || arg === "--type") out.catalogs.push(argv[++i]);
    else if (arg.startsWith("--catalog=")) out.catalogs.push(arg.slice("--catalog=".length));
    else if (arg.startsWith("--type=")) out.catalogs.push(arg.slice("--type=".length));
    else if (arg === "--batch-size") out.batchSize = Math.max(1, Number(argv[++i]) || DEFAULT_BATCH_SIZE);
    else if (arg.startsWith("--batch-size=")) out.batchSize = Math.max(1, Number(arg.slice("--batch-size=".length)) || DEFAULT_BATCH_SIZE);
    else if (arg === "--include-small-existing") out.includeSmallExisting = true;
    else if (arg === "--small-file-bytes") out.smallFileBytes = Math.max(0, Number(argv[++i]) || DEFAULT_SMALL_FILE_BYTES);
    else if (arg.startsWith("--small-file-bytes=")) out.smallFileBytes = Math.max(0, Number(arg.slice("--small-file-bytes=".length)) || DEFAULT_SMALL_FILE_BYTES);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/generate-art-replacement-candidates.mjs [--catalog materials] [--include-small-existing]",
    "",
    "Builds a safe prompt-driven replacement queue for development placeholder item art.",
    "",
    "Default output:",
    "  docs/content/art-replacement-candidates.json",
    "  docs/content/art-replacement-candidates.csv",
    "  docs/content/art-replacement-candidates.md",
    "",
    "The queue writes candidate target paths under art-candidates/items/... so current working icons are not overwritten.",
    "",
    "Options:",
    "  --json                    Print JSON.",
    "  --csv                     Print CSV.",
    "  --md                      Print Markdown.",
    "  --no-write                Do not write docs/content files.",
    "  --catalog <name>          Limit to one catalog/type. Can be repeated.",
    "  --batch-size <n>          Suggested production batch size. Defaults to 20.",
    "  --include-small-existing  Also include tracked system art below --small-file-bytes.",
    "  --small-file-bytes <n>    Small-file threshold. Defaults to 45000.",
  ].join("\n");
}

function normalizePath(value) {
  return String(value ?? "").trim().replace(/\\/g, "/");
}

function execGit(args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function untrackedItemArtFiles() {
  return new Set(
    execGit(["ls-files", "--others", "--exclude-standard", "icons/items"])
      .split(/\r?\n/)
      .map(normalizePath)
      .filter(file => file.endsWith(".webp")),
  );
}

function targetExists(relativePath) {
  return existsSync(resolve(ROOT, relativePath));
}

function fileSize(relativePath) {
  try {
    return statSync(resolve(ROOT, relativePath)).size;
  } catch {
    return 0;
  }
}

function priorityFor(catalog) {
  const index = CATALOG_PRIORITY.indexOf(catalog);
  return index === -1 ? CATALOG_PRIORITY.length : index;
}

function sortedItems(items) {
  return [...items].sort((a, b) =>
    priorityFor(a.catalog) - priorityFor(b.catalog)
    || Number(a.tier ?? 0) - Number(b.tier ?? 0)
    || String(a.id).localeCompare(String(b.id))
  );
}

function batchSlug(catalog, index) {
  return `${catalog}-replacement-${String(index).padStart(2, "0")}`;
}

function batchItems(items, batchSize) {
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

function candidateFileFor(item) {
  return `art-candidates/items/${item.catalog}/${item.id}.webp`;
}

function sanitizeBasePrompt(prompt) {
  return String(prompt ?? "")
    .replace(/\s+--ar\s+\d+(?:\.\d+)?:\d+(?:\.\d+)?/gi, "")
    .replace(/\b\d{3,4}\s*x\s*\d{3,4}\b/gi, "")
    .replace(/\bsquare\s+1024\s+composition\b/gi, "inventory composition")
    .replace(/\bbalanced\s+square\s+inventory\s+composition\b/gi, "balanced inventory composition")
    .replace(/\bcentered\s+square\s+inventory\s+composition\b/gi, "centered inventory composition")
    .replace(/\bsquare\s+composition\b/gi, "inventory composition")
    .replace(/,\s*,+/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function enrichPrompt(item) {
  const base = sanitizeBasePrompt(item.prompt);
  const style = [
    "Use case: stylized-concept.",
    "Asset type: final-quality fantasy RPG Tarkov-grid inventory replacement candidate.",
    "Setting: Iron Hills dark fantasy frontier, grounded medieval craft, worn practical materials, restrained magic.",
    "Style/medium: premium painterly concept-art item render, detailed material texture, realistic edge wear, soft rim light, deep neutral background.",
    `Composition/framing: single isolated object, full silhouette visible, centered, no crop, readable at small inventory cell size, preserve ${item.gridW}x${item.gridH} grid footprint, ${item.aspect}, ${item.resolution}.`,
    "Quality bar: closer to hand-picked ChatGPT item art such as the good bronze sword reference, not procedural placeholder art, not flat symbol art.",
    "Constraints: no text, no watermark, no logo, no hands, no character wearing or holding the item, no extra unrelated props.",
  ].join(" ");

  if (!base) return style;
  return `${base} ${style}`;
}

function replacementReasons(item, options, untracked) {
  const reasons = [];
  const targetFile = normalizePath(item.targetFile);
  const currentBytes = fileSize(targetFile);

  if (untracked.has(targetFile)) reasons.push("untracked-development-placeholder");
  if (BASELINE_CATALOGS.has(item.catalog) && item.targetExists) reasons.push("deterministic-baseline-category");
  if (options.includeSmallExisting && item.currentImageClass === "system" && currentBytes > 0 && currentBytes < options.smallFileBytes) {
    reasons.push(`small-system-art-under-${options.smallFileBytes}-bytes`);
  }

  return [...new Set(reasons)];
}

function shouldUse(item, options, untracked) {
  if (!item?.id || !item?.targetFile) return false;
  if (options.catalogs.length) {
    const wanted = new Set(options.catalogs);
    if (!wanted.has(item.catalog) && !wanted.has(item.type)) return false;
  }
  return replacementReasons(item, options, untracked).length > 0;
}

function toCandidateItem(item, sequence, batchId, reasons) {
  const candidateFile = candidateFileFor(item);
  const currentFile = normalizePath(item.targetFile);
  const currentBytes = fileSize(currentFile);
  return {
    sequence,
    batchId,
    catalog: item.catalog,
    type: item.type,
    id: item.id,
    name: item.name,
    tier: item.tier,
    gridW: item.gridW,
    gridH: item.gridH,
    aspect: item.aspect,
    resolution: item.resolution,
    targetFile: candidateFile,
    targetImg: `${SYSTEM_PREFIX}${candidateFile}`,
    targetExists: targetExists(candidateFile),
    finalFile: currentFile,
    finalImg: item.targetImg,
    currentImg: item.currentImg,
    currentImageClass: item.currentImageClass,
    currentBytes,
    replacementReasons: reasons,
    promptSource: item.promptSource,
    prompt: enrichPrompt(item),
    negative: item.negative,
    instructions: [
      "Generate one final-quality fantasy RPG item image from this exact prompt.",
      "Save the selected candidate to targetFile as WebP without overwriting finalFile.",
      "Keep the object isolated and preserve the Tarkov grid footprint.",
      "After visual QA, promote the chosen candidate over finalFile and rerun content readiness.",
    ].join(" "),
  };
}

function buildSummary(items, batches) {
  const byCatalog = {};
  const byReason = {};
  const byTargetState = {};
  for (const item of items) {
    byCatalog[item.catalog] = (byCatalog[item.catalog] ?? 0) + 1;
    byTargetState[item.targetExists ? "candidateExists" : "candidateMissing"] = (byTargetState[item.targetExists ? "candidateExists" : "candidateMissing"] ?? 0) + 1;
    for (const reason of item.replacementReasons ?? []) byReason[reason] = (byReason[reason] ?? 0) + 1;
  }
  return {
    total: items.length,
    batches: batches.length,
    batchSize: batches[0]?.items?.length ? Math.max(...batches.map(batch => batch.items.length)) : 0,
    byCatalog,
    byReason,
    byTargetState,
  };
}

export function buildArtReplacementCandidates(options = {}) {
  const resolved = {
    outDir: resolve(options.outDir ?? DEFAULT_OUT_DIR),
    catalogs: Array.isArray(options.catalogs) ? options.catalogs.map(value => String(value ?? "").trim()).filter(Boolean) : [],
    batchSize: Math.max(1, Number(options.batchSize ?? DEFAULT_BATCH_SIZE) || DEFAULT_BATCH_SIZE),
    includeSmallExisting: Boolean(options.includeSmallExisting),
    smallFileBytes: Math.max(0, Number(options.smallFileBytes ?? DEFAULT_SMALL_FILE_BYTES) || DEFAULT_SMALL_FILE_BYTES),
  };
  const untracked = untrackedItemArtFiles();
  const backlog = generateArtBacklog({
    outDir: resolved.outDir,
    write: false,
    includeAll: true,
    targetExists,
  });

  const rawItems = sortedItems((backlog.items ?? []).filter(item => shouldUse(item, resolved, untracked)));
  const batches = batchItems(rawItems, resolved.batchSize);
  let sequence = 0;
  const items = [];
  for (const batch of batches) {
    batch.items = batch.items.map(item => {
      sequence += 1;
      const next = toCandidateItem(item, sequence, batch.id, replacementReasons(item, resolved, untracked));
      items.push(next);
      return next;
    });
  }

  return {
    label: "Iron Hills final-quality art replacement candidates",
    generatedAt: new Date().toISOString(),
    source: "catalog rows with deterministic baseline or untracked development placeholder art",
    ok: items.length === 0,
    summary: buildSummary(items, batches),
    workflow: [
      "1. Generate each candidate image from targetFile/prompt without overwriting finalFile.",
      "2. Inspect candidates visually against the existing finalFile and keep only clear upgrades.",
      "3. Run node tools/audit-art-targets.mjs --manifest docs/content/art-replacement-candidates.json before promotion.",
      "4. Promote selected candidates over finalFile, then run node tools/check-content-readiness.mjs --strict-art.",
    ],
    batches,
    items,
  };
}

function escapeCsv(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(report) {
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
    "finalFile",
    "currentBytes",
    "replacementReasons",
    "promptSource",
    "prompt",
    "negative",
  ];
  return [
    header.join(","),
    ...(report.items ?? []).map(item => header.map(key => escapeCsv(item[key])).join(",")),
  ].join("\n") + "\n";
}

function toMarkdown(report) {
  const summary = report.summary ?? {};
  const lines = [
    "# Iron Hills Final-Quality Art Replacement Candidates",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "This file is a safe replacement queue for item art that is working but not final-quality. Candidate images must be generated into `art-candidates/items/...`; current working icons under `icons/items/...` are not overwritten by this manifest.",
    "",
    "## Workflow",
    "",
    ...report.workflow.map(line => `- ${line}`),
    "",
    "## Summary",
    "",
    `- Total candidates: ${summary.total ?? 0}`,
    `- Batches: ${summary.batches ?? 0}`,
    `- By catalog: ${Object.entries(summary.byCatalog ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    `- Reasons: ${Object.entries(summary.byReason ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    `- Candidate files: ${Object.entries(summary.byTargetState ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    "",
  ];

  for (const batch of report.batches ?? []) {
    lines.push(`## ${batch.id}`, "");
    for (const item of batch.items ?? []) {
      lines.push(`### ${item.sequence}. ${item.name} (\`${item.catalog}/${item.id}\`)`);
      lines.push("");
      lines.push(`- Candidate target: \`${item.targetFile}\``);
      lines.push(`- Existing final file: \`${item.finalFile}\``);
      lines.push(`- Grid: ${item.gridW}x${item.gridH}, ${item.aspect}, ${item.resolution}`);
      lines.push(`- Reasons: ${(item.replacementReasons ?? []).join(", ")}`);
      lines.push(`- Prompt source: ${item.promptSource || "fallback"}`);
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

function writeOutputs(report, outDir) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "art-replacement-candidates.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  writeFileSync(resolve(outDir, "art-replacement-candidates.csv"), toCsv(report), "utf8");
  writeFileSync(resolve(outDir, "art-replacement-candidates.md"), toMarkdown(report), "utf8");
}

function printRequested(report, options) {
  if (options.json) return process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  if (options.csv) return process.stdout.write(toCsv(report));
  if (options.md) return process.stdout.write(toMarkdown(report));
  process.stdout.write([
    `Iron Hills art replacement candidates: ${report.summary.total} items in ${report.summary.batches} batches`,
    `By catalog: ${Object.entries(report.summary.byCatalog ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    `Reasons: ${Object.entries(report.summary.byReason ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
  ].join("\n") + "\n");
  if (options.write !== false) process.stdout.write("Wrote docs/content/art-replacement-candidates.{json,csv,md}\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const report = buildArtReplacementCandidates(options);
  if (options.write !== false) writeOutputs(report, resolve(options.outDir ?? DEFAULT_OUT_DIR));
  printRequested(report, options);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
