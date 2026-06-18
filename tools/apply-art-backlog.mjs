#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  auditArtTargets,
  formatArtTargetAuditReport,
} from "../module/services/content-art-quality-service.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_MANIFEST = resolve(ROOT, "docs/content/art-backlog.json");
const ITEMS_CATALOG_FILE = resolve(ROOT, "module/constants/items-catalog.mjs");
const SPELLS_CATALOG_FILE = resolve(ROOT, "module/constants/spells-catalog.mjs");

function parseArgs(argv) {
  const out = {
    help: false,
    dryRun: false,
    allowMissing: false,
    skipArtAudit: false,
    strictArtWarnings: false,
    manifest: DEFAULT_MANIFEST,
    catalogs: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--allow-missing") out.allowMissing = true;
    else if (arg === "--skip-art-audit") out.skipArtAudit = true;
    else if (arg === "--strict-art-warnings") out.strictArtWarnings = true;
    else if (arg === "--manifest") out.manifest = resolve(argv[++i]);
    else if (arg.startsWith("--manifest=")) out.manifest = resolve(arg.slice("--manifest=".length));
    else if (arg === "--catalog" || arg === "--type") out.catalogs.push(argv[++i]);
    else if (arg.startsWith("--catalog=")) out.catalogs.push(arg.slice("--catalog=".length));
    else if (arg.startsWith("--type=")) out.catalogs.push(arg.slice("--type=".length));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/apply-art-backlog.mjs [--dry-run] [--catalog weapons]",
    "",
    "Reads docs/content/art-backlog.json and applies existing target image files to item/spell catalogs.",
    "",
    "Options:",
    "  --dry-run          Show planned catalog edits without writing.",
    "  --allow-missing    Apply target paths even when files do not exist yet.",
    "  --skip-art-audit   Skip generated WebP dimension/shape QA before applying.",
    "  --strict-art-warnings Treat art QA warnings as apply blockers.",
    "  --manifest <file>  Backlog JSON path. Defaults to docs/content/art-backlog.json.",
    "  --catalog <name>   Limit to one catalog/type. Can be repeated.",
  ].join("\n");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isIdentStart(ch) {
  return /[A-Za-z_$]/.test(ch ?? "");
}

function isIdentPart(ch) {
  return /[A-Za-z0-9_$]/.test(ch ?? "");
}

function skipString(src, i) {
  const quote = src[i];
  i += 1;
  while (i < src.length) {
    if (src[i] === "\\") {
      i += 2;
      continue;
    }
    if (src[i] === quote) return i + 1;
    i += 1;
  }
  return i;
}

function skipComment(src, i) {
  if (src[i] === "/" && src[i + 1] === "/") {
    const next = src.indexOf("\n", i + 2);
    return next === -1 ? src.length : next;
  }
  if (src[i] === "/" && src[i + 1] === "*") {
    const next = src.indexOf("*/", i + 2);
    return next === -1 ? src.length : next + 2;
  }
  return i;
}

function findMatchingBrace(src, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < src.length; i += 1) {
    const commentEnd = skipComment(src, i);
    if (commentEnd !== i) {
      i = commentEnd - 1;
      continue;
    }
    const ch = src[i];
    if (ch === "\"" || ch === "'" || ch === "`") {
      i = skipString(src, i) - 1;
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findEntryRange(src, id) {
  const regex = new RegExp(`(^|\\n)(\\s*)${escapeRegExp(id)}\\s*:\\s*\\{`, "m");
  const match = regex.exec(src);
  if (!match) return null;
  const entryStart = match.index + (match[1] === "\n" ? 1 : 0);
  const open = src.indexOf("{", match.index);
  const close = findMatchingBrace(src, open);
  if (open < 0 || close < 0) return null;
  let end = close + 1;
  while (/\s/.test(src[end] ?? "")) end += 1;
  if (src[end] === ",") end += 1;
  return {
    start: entryStart,
    end,
    block: src.slice(entryStart, end),
  };
}

function findTopLevelPropertyValueRange(block, propertyName) {
  const open = block.indexOf("{");
  const close = findMatchingBrace(block, open);
  if (open < 0 || close < 0) return null;

  let depth = 0;
  for (let i = open; i < close; i += 1) {
    const commentEnd = skipComment(block, i);
    if (commentEnd !== i) {
      i = commentEnd - 1;
      continue;
    }

    const ch = block[i];
    if (ch === "\"" || ch === "'" || ch === "`") {
      i = skipString(block, i) - 1;
      continue;
    }
    if (ch === "{") {
      depth += 1;
      continue;
    }
    if (ch === "}") {
      depth -= 1;
      continue;
    }

    if (depth !== 1 || !isIdentStart(ch)) continue;
    const nameStart = i;
    let nameEnd = i + 1;
    while (isIdentPart(block[nameEnd])) nameEnd += 1;
    const name = block.slice(nameStart, nameEnd);
    let cursor = nameEnd;
    while (/\s/.test(block[cursor] ?? "")) cursor += 1;
    if (block[cursor] !== ":") {
      i = nameEnd;
      continue;
    }
    cursor += 1;
    while (/\s/.test(block[cursor] ?? "")) cursor += 1;
    if (name !== propertyName) {
      i = cursor;
      continue;
    }

    const valueStart = cursor;
    if (block[cursor] === "\"" || block[cursor] === "'" || block[cursor] === "`") {
      return { start: valueStart, end: skipString(block, cursor) };
    }
    while (cursor < close && block[cursor] !== ",") cursor += 1;
    return { start: valueStart, end: cursor };
  }

  return null;
}

function setTopLevelImg(block, imgPath) {
  const valueRange = findTopLevelPropertyValueRange(block, "img");
  const replacement = `"${imgPath}"`;
  if (valueRange) {
    return block.slice(0, valueRange.start) + replacement + block.slice(valueRange.end);
  }

  const open = block.indexOf("{");
  const close = findMatchingBrace(block, open);
  if (open < 0 || close < 0) return block;
  const before = block.slice(0, close).trimEnd();
  const separator = /[,{]\s*$/.test(before) ? "" : ",";
  return before + `${separator} img:${replacement} ` + block.slice(close);
}

function unquoteStringLiteral(value) {
  const text = String(value ?? "").trim();
  if (text.length >= 2 && ((text[0] === "\"" && text.at(-1) === "\"") || (text[0] === "'" && text.at(-1) === "'"))) {
    return text.slice(1, -1);
  }
  return text;
}

function topLevelImgValue(block) {
  const valueRange = findTopLevelPropertyValueRange(block, "img");
  if (!valueRange) return "";
  return unquoteStringLiteral(block.slice(valueRange.start, valueRange.end));
}

function loadManifest(path) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  return Array.isArray(data?.items) ? data.items : [];
}

function shouldUseItem(item, options) {
  if (!item?.id || !item?.targetImg || !item?.targetFile) return false;
  if (!options.catalogs.length) return true;
  const wanted = new Set(options.catalogs);
  return wanted.has(item.catalog) || wanted.has(item.type);
}

function catalogFileForItem(item) {
  if (item?.catalog === "spells" || item?.type === "spell") return SPELLS_CATALOG_FILE;
  return ITEMS_CATALOG_FILE;
}

function relativeCatalogPath(path) {
  return relative(ROOT, path).replace(/\\/g, "/");
}

function sourceFor(sources, catalogFile) {
  if (!sources.has(catalogFile)) sources.set(catalogFile, readFileSync(catalogFile, "utf8"));
  return sources.get(catalogFile);
}

export function applyArtBacklog(options = {}) {
  const resolved = {
    dryRun: Boolean(options.dryRun),
    allowMissing: Boolean(options.allowMissing),
    skipArtAudit: Boolean(options.skipArtAudit),
    strictArtWarnings: Boolean(options.strictArtWarnings),
    manifest: resolve(options.manifest ?? DEFAULT_MANIFEST),
    catalogs: Array.isArray(options.catalogs) ? options.catalogs : [],
  };
  const items = loadManifest(resolved.manifest).filter(item => shouldUseItem(item, resolved));
  const sources = new Map();
  const changedFiles = new Set();
  const stats = {
    considered: items.length,
    changed: 0,
    alreadyOk: 0,
    missingFiles: 0,
    missingEntries: 0,
    skipped: 0,
    changedIds: [],
    missingFileIds: [],
    missingEntryIds: [],
    changedByFile: {},
    artAudit: null,
    artAuditFindings: [],
  };

  if (!resolved.skipArtAudit) {
    const existingItems = items.filter(item => existsSync(resolve(ROOT, item.targetFile)));
    const audit = auditArtTargets({ items: existingItems }, {
      root: ROOT,
      requireExists: false,
      strictWarnings: resolved.strictArtWarnings,
    });
    stats.artAudit = audit.summary;
    stats.artAuditFindings = audit.findings;
    if (!audit.ok) return stats;
  }

  for (const item of items) {
    const targetFile = resolve(ROOT, item.targetFile);
    if (!resolved.allowMissing && !existsSync(targetFile)) {
      stats.missingFiles += 1;
      stats.missingFileIds.push(item.id);
      continue;
    }

    const catalogFile = catalogFileForItem(item);
    const catalogPath = relativeCatalogPath(catalogFile);
    let src = sourceFor(sources, catalogFile);
    const entry = findEntryRange(src, item.id);
    if (!entry) {
      stats.missingEntries += 1;
      stats.missingEntryIds.push(`${item.catalog}/${item.id}`);
      continue;
    }

    if (topLevelImgValue(entry.block) === item.targetImg) {
      stats.alreadyOk += 1;
      continue;
    }

    const nextBlock = setTopLevelImg(entry.block, item.targetImg);
    if (nextBlock === entry.block) {
      stats.skipped += 1;
      continue;
    }

    src = src.slice(0, entry.start) + nextBlock + src.slice(entry.end);
    sources.set(catalogFile, src);
    changedFiles.add(catalogFile);
    stats.changed += 1;
    stats.changedIds.push(item.id);
    stats.changedByFile[catalogPath] = (stats.changedByFile[catalogPath] ?? 0) + 1;
  }

  if (!resolved.dryRun) {
    for (const catalogFile of changedFiles) {
      writeFileSync(catalogFile, sourceFor(sources, catalogFile), "utf8");
    }
  }
  return stats;
}

function isDirectRun() {
  return resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
}

function printReport(stats, options) {
  console.log(`Iron Hills art backlog apply: ${options.dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Considered=${stats.considered}, changed=${stats.changed}, alreadyOk=${stats.alreadyOk}, missingFiles=${stats.missingFiles}, missingEntries=${stats.missingEntries}, skipped=${stats.skipped}`);
  const changedByFile = Object.entries(stats.changedByFile ?? {});
  if (changedByFile.length) console.log(`Changed by file: ${changedByFile.map(([file, count]) => `${file}=${count}`).join(", ")}`);
  if (stats.artAudit) console.log(`Art QA: inspected=${stats.artAudit.inspected}, errors=${stats.artAudit.errors}, warnings=${stats.artAudit.warnings}`);
  if (stats.artAuditFindings?.length) console.log(formatArtTargetAuditReport({
    ok: false,
    summary: stats.artAudit,
    findings: stats.artAuditFindings,
  }, { maxFindings: 12 }));
  if (stats.changedIds.length) console.log(`Changed: ${stats.changedIds.slice(0, 30).join(", ")}${stats.changedIds.length > 30 ? "..." : ""}`);
  if (stats.missingFileIds.length) console.log(`Missing files: ${stats.missingFileIds.slice(0, 30).join(", ")}${stats.missingFileIds.length > 30 ? "..." : ""}`);
  if (stats.missingEntryIds.length) console.log(`Missing catalog entries: ${stats.missingEntryIds.join(", ")}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const stats = applyArtBacklog(options);
  printReport(stats, options);
  const artAuditBlocked = (stats.artAudit?.errors ?? 0) > 0 || (options.strictArtWarnings && (stats.artAudit?.warnings ?? 0) > 0);
  if (artAuditBlocked) process.exit(1);
}

if (isDirectRun()) {
  main().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
