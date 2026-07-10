#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PLAN = resolve(ROOT, "docs/content/imagegen-preview-intake-plan.json");

function parseArgs(argv) {
  const out = {
    help: false,
    plan: DEFAULT_PLAN,
    dryRun: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--json") out.json = true;
    else if (arg === "--plan") out.plan = resolve(argv[++i]);
    else if (arg.startsWith("--plan=")) out.plan = resolve(arg.slice("--plan=".length));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/intake-imagegen-preview-sheets.mjs [--plan docs/content/imagegen-preview-intake-plan.json]",
    "",
    "Copies selected built-in imagegen preview sheets into docs/content and writes",
    "a stable JSON/Markdown manifest for later visual QA, slicing, and promotion.",
    "",
    "Options:",
    "  --plan <file>   Intake plan JSON. Defaults to docs/content/imagegen-preview-intake-plan.json.",
    "  --dry-run       Validate and report without copying/writing outputs.",
    "  --json          Print the report as JSON.",
  ].join("\n");
}

function normalizePath(value) {
  return String(value ?? "").trim().replace(/\\/g, "/");
}

function relativeToRoot(path) {
  const normalized = normalizePath(path);
  const root = normalizePath(ROOT);
  return normalized.startsWith(`${root}/`) ? normalized.slice(root.length + 1) : normalized;
}

function readPngSize(path) {
  const data = readFileSync(path);
  if (
    data.length < 24 ||
    data[0] !== 0x89 ||
    data[1] !== 0x50 ||
    data[2] !== 0x4e ||
    data[3] !== 0x47
  ) {
    return { width: 0, height: 0 };
  }
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  };
}

function safeFileName(slug, ext = ".png") {
  const safe = String(slug ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!safe) throw new Error("Sheet slug is required.");
  return safe.endsWith(ext) ? safe : `${safe}${ext}`;
}

function resolveSource(plan, sheet) {
  const sourceFile = String(sheet.sourceFile ?? "").trim();
  if (!sourceFile) throw new Error(`Sheet ${sheet.slug ?? "<unknown>"} is missing sourceFile.`);
  if (/^[a-zA-Z]:[\\/]/.test(sourceFile) || sourceFile.startsWith("/") || sourceFile.startsWith("\\\\")) {
    return resolve(sourceFile);
  }
  return resolve(String(plan.sourceRoot ?? ""), sourceFile);
}

function buildManifest(plan, copied) {
  const generatedAt = new Date().toISOString();
  return {
    label: plan.label ?? "Iron Hills imagegen preview sheets",
    generatedAt,
    source: {
      mode: plan.sourceMode ?? "built-in-imagegen",
      sourceRoot: normalizePath(plan.sourceRoot ?? ""),
      note: plan.sourceNote ?? "",
    },
    workflow: [
      "1. Review these preview sheets for visual direction.",
      "2. Slice or regenerate chosen cells as individual candidate images under art-candidates/items/...",
      "3. Run node tools/promote-art-candidates.mjs in dry-run mode before replacing final icons.",
      "4. Rerun content readiness and Foundry runtime smoke checks after promotion.",
    ],
    summary: {
      total: copied.length,
      byCategory: copied.reduce((acc, sheet) => {
        const key = sheet.category || "uncategorized";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    },
    sheets: copied,
  };
}

function markdownFor(manifest) {
  const lines = [
    "# Imagegen Preview Sheets",
    "",
    "Preview-only sheets captured from built-in image generation. These are not final in-game assets yet.",
    "",
    "## Workflow",
    "",
    ...manifest.workflow.map(step => step),
    "",
    "## Sheets",
    "",
    "| Category | Slug | Title | Grid | File | Notes |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const sheet of manifest.sheets) {
    const notes = (sheet.notes ?? []).join("; ");
    lines.push([
      sheet.category ?? "",
      sheet.slug,
      sheet.title ?? "",
      sheet.grid ?? "",
      sheet.file,
      notes,
    ].map(value => String(value ?? "").replace(/\|/g, "\\|")).join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function intakeImagegenPreviewSheets(options = {}) {
  const planPath = resolve(options.plan ?? DEFAULT_PLAN);
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const outDir = resolve(ROOT, plan.outDir ?? "docs/content/generated-image-sheets");
  const manifestFile = resolve(ROOT, plan.manifestFile ?? "docs/content/generated-image-sheets.json");
  const markdownFile = resolve(ROOT, plan.markdownFile ?? "docs/content/generated-image-sheets.md");
  const dryRun = Boolean(options.dryRun);
  const copied = [];
  const blockers = [];

  const sheets = Array.isArray(plan.sheets) ? plan.sheets : [];
  for (const sheet of sheets) {
    const source = resolveSource(plan, sheet);
    const fileName = safeFileName(sheet.slug);
    const target = resolve(outDir, fileName);
    const sourceExists = existsSync(source);

    if (!sourceExists) {
      blockers.push({
        severity: "error",
        code: "missing-source",
        sheet: sheet.slug ?? "",
        source: normalizePath(source),
      });
      continue;
    }

    const stat = statSync(source);
    const size = readPngSize(source);
    if (!dryRun) {
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(source, target);
    }

    copied.push({
      slug: sheet.slug,
      title: sheet.title ?? sheet.slug,
      category: sheet.category ?? "uncategorized",
      status: sheet.status ?? "preview",
      grid: sheet.grid ?? "",
      intendedUse: sheet.intendedUse ?? "",
      prompts: sheet.prompts ?? [],
      targetCatalogs: sheet.targetCatalogs ?? [],
      notes: sheet.notes ?? [],
      sourceFile: normalizePath(source),
      file: relativeToRoot(target),
      img: `systems/iron-hills-system/${relativeToRoot(target)}`,
      bytes: stat.size,
      width: size.width,
      height: size.height,
    });
  }

  const manifest = buildManifest(plan, copied);
  if (!dryRun && !blockers.length) {
    mkdirSync(dirname(manifestFile), { recursive: true });
    writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
    writeFileSync(markdownFile, markdownFor(manifest));
  }

  return {
    ok: blockers.length === 0,
    plan: relativeToRoot(planPath),
    dryRun,
    manifestFile: relativeToRoot(manifestFile),
    markdownFile: relativeToRoot(markdownFile),
    summary: manifest.summary,
    blockers,
    sheets: copied,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const report = intakeImagegenPreviewSheets(options);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const summary = report.summary ?? {};
    console.log(`Iron Hills imagegen preview intake: ${report.ok ? "OK" : "BLOCKED"}`);
    console.log(`Plan=${report.plan}, sheets=${summary.total ?? 0}, dryRun=${report.dryRun}`);
    if (report.blockers.length) {
      for (const blocker of report.blockers) {
        console.log(`- [${blocker.severity.toUpperCase()}] ${blocker.sheet}: ${blocker.source} (${blocker.code})`);
      }
    }
    for (const sheet of report.sheets) {
      console.log(`- ${sheet.category}/${sheet.slug}: ${sheet.file} (${sheet.width}x${sheet.height})`);
    }
  }
  if (!report.ok) process.exit(1);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
