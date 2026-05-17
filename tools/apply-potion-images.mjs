/**
 * Iron Hills — автоприменение картинок зелий.
 *
 * Сканирует `icons/items/potions/{id}.{ext}`, проставляет в POTIONS поле
 * `img: "systems/iron-hills-system/icons/items/potions/{file}"`.
 *
 *   node tools/apply-potion-images.mjs
 *   node tools/apply-potion-images.mjs --dry-run
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, extname } from "node:path";
import { POTIONS } from "../module/constants/items-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");

const ICONS_DIR = resolve(ROOT, "icons/items/potions");
const CATALOG   = resolve(ROOT, "module/constants/items-catalog.mjs");
const SUPPORTED = new Set([".webp", ".png", ".jpg", ".jpeg", ".svg"]);
const PREFER    = [".webp", ".png", ".jpg", ".jpeg", ".svg"];

function findImagesById() {
  let entries;
  try {
    entries = readdirSync(ICONS_DIR);
  } catch (e) {
    if (e?.code === "ENOENT") {
      console.error(`Папка не найдена: ${ICONS_DIR}`);
      process.exit(2);
    }
    throw e;
  }

  const byId = new Map();
  for (const file of entries) {
    const ext = extname(file).toLowerCase();
    if (!SUPPORTED.has(ext)) continue;
    const id = file.slice(0, file.length - ext.length);
    if (!POTIONS[id]) continue;
    const fullPath = resolve(ICONS_DIR, file);
    if (!statSync(fullPath).isFile()) continue;
    const existing = byId.get(id);
    if (!existing || PREFER.indexOf(ext) < PREFER.indexOf(existing.ext)) {
      byId.set(id, { ext, fileName: file });
    }
  }
  return byId;
}

function applyImagesToCatalog(images) {
  let src = readFileSync(CATALOG, "utf8");
  let changed = 0;
  let alreadyOk = 0;
  const notFoundIds = [];

  for (const [id, { fileName }] of images) {
    const imgPath = `systems/iron-hills-system/icons/items/potions/${fileName}`;

    const itemRegex = new RegExp(
      `(\\b${id}\\s*:\\s*\\{[^}]*?id\\s*:\\s*"${id}"[^}]*?)\\}`,
      "s",
    );
    const m = src.match(itemRegex);
    if (!m) {
      notFoundIds.push(id);
      continue;
    }

    const block = m[1];
    if (block.includes(`img:"${imgPath}"`) || block.includes(`img: "${imgPath}"`)) {
      alreadyOk++;
      continue;
    }

    let newBlock;
    if (/\bimg\s*:\s*"[^"]*"/.test(block)) {
      newBlock = block.replace(/\bimg\s*:\s*"[^"]*"/, `img:"${imgPath}"`);
    } else {
      newBlock = block.trimEnd() + `, img:"${imgPath}" `;
    }
    src = src.replace(m[0], newBlock + "}");
    changed++;
  }

  return { src, changed, alreadyOk, notFoundIds };
}

function main() {
  const total = Object.keys(POTIONS).length;
  const images = findImagesById();

  console.log(`📦 Каталог:  ${total} позиций зелий`);
  console.log(`🖼  Найдено:  ${images.size} картинок в icons/items/potions/`);

  if (images.size === 0) {
    console.log("Нечего применять. Сложи картинки в icons/items/potions/{id}.webp и запусти снова.");
    return;
  }

  const { src, changed, alreadyOk, notFoundIds } = applyImagesToCatalog(images);

  if (notFoundIds.length) {
    console.warn(`⚠  Не нашёл записей в каталоге для id: ${notFoundIds.join(", ")}`);
  }

  console.log(`✅ Уже было ок:    ${alreadyOk}`);
  console.log(`✏  Будет изменено: ${changed}`);
  console.log(`❓ Без картинки:   ${total - images.size}`);

  if (changed === 0) {
    console.log("Каталог уже синхронизирован — ничего записывать не нужно.");
    return;
  }

  if (DRY_RUN) {
    console.log("[--dry-run] Файл не записан.");
    return;
  }

  writeFileSync(CATALOG, src, "utf8");
  console.log(`💾 Записано: ${CATALOG}`);
  console.log("");
  console.log("В Foundry (GM), после F5:");
  console.log('  await game.ironHills.syncPotionPackFromCatalog()');
}

main();
