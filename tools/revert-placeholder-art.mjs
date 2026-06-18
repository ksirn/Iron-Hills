#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SYSTEM_PREFIX = "systems/iron-hills-system/";
const CATALOGS = [
  { path: "module/constants/items-catalog.mjs" },
  { path: "module/constants/spells-catalog.mjs" },
];

function parseArgs(argv) {
  return {
    apply: argv.includes("--apply"),
    help: argv.includes("--help") || argv.includes("-h"),
  };
}

function usage() {
  return [
    "Usage: node tools/revert-placeholder-art.mjs [--apply]",
    "",
    "Restores catalog img references that point at untracked placeholder WebP files under icons/items.",
    "Tracked hand-made images are not touched. Without --apply this prints a dry-run report.",
  ].join("\n");
}

function execGit(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
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
  const start = match.index + (match[1] === "\n" ? 1 : 0);
  const open = src.indexOf("{", match.index);
  const close = findMatchingBrace(src, open);
  if (open < 0 || close < 0) return null;
  let end = close + 1;
  while (/\s/.test(src[end] ?? "")) end += 1;
  if (src[end] === ",") end += 1;
  return { start, end, block: src.slice(start, end) };
}

function findTopLevelProperty(block, propertyName) {
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
    const valueStart = cursor;
    const valueEnd = block[cursor] === "\"" || block[cursor] === "'" || block[cursor] === "`"
      ? skipString(block, cursor)
      : scanBareValue(block, cursor, close);

    if (name === propertyName) return { nameStart, valueStart, valueEnd };
    i = valueEnd;
  }

  return null;
}

function scanBareValue(block, cursor, close) {
  let depth = 0;
  for (; cursor < close; cursor += 1) {
    const commentEnd = skipComment(block, cursor);
    if (commentEnd !== cursor) {
      cursor = commentEnd - 1;
      continue;
    }

    const ch = block[cursor];
    if (ch === "\"" || ch === "'" || ch === "`") {
      cursor = skipString(block, cursor) - 1;
      continue;
    }
    if (ch === "{" || ch === "[" || ch === "(") depth += 1;
    else if (ch === "}" || ch === "]" || ch === ")") depth -= 1;
    else if (depth === 0 && ch === ",") return cursor;
  }
  return cursor;
}

function unquoteStringLiteral(value) {
  const text = String(value ?? "").trim();
  if (text.length >= 2 && ((text[0] === "\"" && text.at(-1) === "\"") || (text[0] === "'" && text.at(-1) === "'"))) {
    return text.slice(1, -1);
  }
  return text;
}

function topLevelImgValue(block) {
  const prop = findTopLevelProperty(block, "img");
  return prop ? unquoteStringLiteral(block.slice(prop.valueStart, prop.valueEnd)) : "";
}

function setTopLevelImg(block, imgPath) {
  const prop = findTopLevelProperty(block, "img");
  const replacement = `"${imgPath}"`;
  if (prop) return block.slice(0, prop.valueStart) + replacement + block.slice(prop.valueEnd);

  const open = block.indexOf("{");
  const close = findMatchingBrace(block, open);
  if (open < 0 || close < 0) return block;
  const before = block.slice(0, close).trimEnd();
  const separator = /[,{]\s*$/.test(before) ? "" : ",";
  return before + `${separator} img:${replacement} ` + block.slice(close);
}

function removeTopLevelImg(block) {
  const prop = findTopLevelProperty(block, "img");
  if (!prop) return block;

  let start = prop.nameStart;
  let end = prop.valueEnd;
  let after = end;
  while (/\s/.test(block[after] ?? "")) after += 1;
  if (block[after] === ",") {
    end = after + 1;
    while (block[end] === " ") end += 1;
  } else {
    let before = start - 1;
    while (/\s/.test(block[before] ?? "")) before -= 1;
    if (block[before] === ",") start = before;
  }
  return block.slice(0, start) + block.slice(end);
}

function replaceEntry(src, entry, nextBlock) {
  return src.slice(0, entry.start) + nextBlock + src.slice(entry.end);
}

function placeholderTargets() {
  const files = execGit(["ls-files", "--others", "--exclude-standard", "icons/items"])
    .split(/\r?\n/)
    .filter(file => file.endsWith(".webp"));
  return files.map(file => ({
    id: basename(file, ".webp"),
    file,
    targetImg: `${SYSTEM_PREFIX}${file.replace(/\\/g, "/")}`,
  }));
}

export function revertPlaceholderArt({ apply = false } = {}) {
  const catalogs = CATALOGS.map(catalog => ({
    ...catalog,
    abs: resolve(ROOT, catalog.path),
    src: readFileSync(resolve(ROOT, catalog.path), "utf8"),
    head: execGit(["show", `HEAD:${catalog.path}`]),
    changed: false,
  }));

  const stats = {
    mode: apply ? "apply" : "dry-run",
    considered: 0,
    restored: 0,
    removed: 0,
    skippedNotReferenced: 0,
    skippedNotPlaceholder: 0,
    skippedNoHeadEntry: 0,
    examples: [],
  };

  for (const target of placeholderTargets()) {
    if (!existsSync(resolve(ROOT, target.file))) continue;
    stats.considered += 1;
    let matched = false;

    for (const catalog of catalogs) {
      const currentEntry = findEntryRange(catalog.src, target.id);
      if (!currentEntry) continue;
      matched = true;

      if (topLevelImgValue(currentEntry.block) !== target.targetImg) {
        stats.skippedNotPlaceholder += 1;
        break;
      }

      const headEntry = findEntryRange(catalog.head, target.id);
      if (!headEntry) {
        stats.skippedNoHeadEntry += 1;
        break;
      }

      const previousImg = topLevelImgValue(headEntry.block);
      const nextBlock = previousImg
        ? setTopLevelImg(currentEntry.block, previousImg)
        : removeTopLevelImg(currentEntry.block);

      if (nextBlock !== currentEntry.block) {
        catalog.src = replaceEntry(catalog.src, currentEntry, nextBlock);
        catalog.changed = true;
        if (previousImg) stats.restored += 1;
        else stats.removed += 1;
        if (stats.examples.length < 12) stats.examples.push(`${catalog.path}:${target.id} -> ${previousImg || "(removed img)"}`);
      }
      break;
    }

    if (!matched) stats.skippedNotReferenced += 1;
  }

  if (apply) {
    for (const catalog of catalogs) {
      if (catalog.changed) writeFileSync(catalog.abs, catalog.src, "utf8");
    }
  }

  return stats;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  console.log(JSON.stringify(revertPlaceholderArt(options), null, 2));
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main();
}
