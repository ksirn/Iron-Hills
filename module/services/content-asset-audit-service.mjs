import {
  ARMORS,
  ATTACHMENTS,
  BACKPACKS,
  BELTS,
  CONSUMABLES,
  FOOD,
  MATERIALS,
  POTIONS,
  THROWABLES,
  TOOLS,
  WEAPONS,
} from "../constants/items-catalog.mjs";
import { SPELLS } from "../constants/spells-catalog.mjs";
import { getCompendiumBuildPlan } from "../compendium-builder.mjs";
import {
  armorToItemData,
  attachmentToItemData,
  backpackToItemData,
  beltToItemData,
  consumableToItemData,
  foodToItemData,
  materialToItemData,
  potionToItemData,
  spellToItemData,
  throwableToItemData,
  toolToItemData,
  weaponToItemData,
} from "../utils/catalog-item-data.mjs";

const SYSTEM_ID = "iron-hills-system";
const SYSTEM_ASSET_PREFIX = `systems/${SYSTEM_ID}/`;
const GENERIC_ITEM_IMAGE = "icons/svg/item-bag.svg";

const CATALOGS = Object.freeze([
  { id: "weapons", label: "Weapons", packName: "ih-weapons", rows: WEAPONS, converter: weaponToItemData },
  { id: "armor", label: "Armor", packName: "ih-armor", rows: ARMORS, converter: armorToItemData },
  { id: "materials", label: "Materials", packName: "ih-materials", rows: MATERIALS, converter: materialToItemData },
  { id: "potions", label: "Potions", packName: "ih-potions", rows: POTIONS, converter: potionToItemData },
  { id: "food", label: "Food", packName: "ih-food", rows: FOOD, converter: foodToItemData },
  { id: "tools", label: "Tools", packName: "ih-tools", rows: TOOLS, converter: toolToItemData },
  { id: "belts", label: "Belts", packName: "ih-belts", rows: BELTS, converter: beltToItemData },
  { id: "backpacks", label: "Backpacks", packName: "ih-backpacks", rows: BACKPACKS, converter: backpackToItemData },
  { id: "attachments", label: "Attachments", packName: "ih-attachments", rows: ATTACHMENTS, converter: attachmentToItemData },
  { id: "spells", label: "Spells", packName: "ih-spells", rows: SPELLS, converter: spellToItemData },
  { id: "consumables", label: "Consumables", packName: "ih-consumables", rows: CONSUMABLES, converter: consumableToItemData },
  { id: "throwables", label: "Throwables", packName: "ih-throwables", rows: THROWABLES, converter: throwableToItemData },
]);

const KNOWN_MANUAL_PACKS = Object.freeze(new Set([
  "ih-gods",
  "ih-npc",
]));

function finding(severity, code, message, context = {}, details = {}) {
  const path = [context.scope, context.catalog, context.pack, context.key].filter(Boolean).join(" / ");
  return {
    severity,
    code,
    message,
    path,
    context: { ...context },
    details,
  };
}

function summarizeFindings(findings) {
  const out = { error: 0, warn: 0, info: 0 };
  for (const f of findings ?? []) out[f.severity] = (out[f.severity] ?? 0) + 1;
  return out;
}

function normalizePath(value) {
  return String(value ?? "").trim().replace(/\\/g, "/");
}

function systemRelativePath(assetPath) {
  const normalized = normalizePath(assetPath);
  if (!normalized.startsWith(SYSTEM_ASSET_PREFIX)) return "";
  return normalized.slice(SYSTEM_ASSET_PREFIX.length);
}

function pathDirectory(assetPath) {
  const normalized = normalizePath(assetPath);
  const idx = normalized.lastIndexOf("/");
  return idx > 0 ? normalized.slice(0, idx) : "";
}

function classifyImagePath(img) {
  const path = normalizePath(img);
  if (!path) return "missing";
  if (path === GENERIC_ITEM_IMAGE) return "generic";
  if (path.startsWith(SYSTEM_ASSET_PREFIX)) return "system";
  if (path.startsWith("icons/")) return "core";
  if (path.startsWith("modules/")) return "module";
  if (/^https?:\/\//i.test(path)) return "remote";
  return "other";
}

async function tryLoadNodeFs() {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const cwd = globalThis.process?.cwd?.();
    if (!fs || !path || !cwd) return null;
    return { fs, path, cwd };
  } catch {
    return null;
  }
}

async function createPathChecker({ enabled }) {
  if (!enabled) return { available: false, mode: "disabled", exists: async () => null };

  const node = await tryLoadNodeFs();
  if (node) {
    return {
      available: true,
      mode: "node-fs",
      exists: async (relativePath, expected = "file") => {
        try {
          const absolutePath = node.path.resolve(node.cwd, normalizePath(relativePath));
          const stat = await node.fs.stat(absolutePath);
          return expected === "directory" ? stat.isDirectory() : stat.isFile();
        } catch {
          return false;
        }
      },
    };
  }

  const canFetch = typeof globalThis.fetch === "function" && typeof globalThis.location?.origin === "string";
  if (canFetch) {
    return {
      available: true,
      mode: "fetch",
      exists: async (relativePath) => {
        const url = new URL(normalizePath(relativePath), `${globalThis.location.origin}/`).toString();
        try {
          const head = await globalThis.fetch(url, { method: "HEAD", cache: "no-store" });
          if (head.ok) return true;
          if (head.status !== 405) return false;
        } catch {
          // Fall through to GET; some Foundry static handlers do not support HEAD.
        }
        try {
          const get = await globalThis.fetch(url, { method: "GET", cache: "no-store" });
          return get.ok;
        } catch {
          return false;
        }
      },
    };
  }

  return { available: false, mode: "unavailable", exists: async () => null };
}

function arrayFromPackLike(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value[Symbol.iterator] === "function") return Array.from(value);
  if (typeof value === "object") return Object.values(value);
  return [];
}

function manifestFromGame() {
  const system = globalThis.game?.system;
  if (!system) return null;

  const candidates = [
    system,
    typeof system.toObject === "function" ? system.toObject() : null,
    system.data,
    typeof system.data?.toObject === "function" ? system.data.toObject() : null,
    system._source,
  ].filter(Boolean);

  const raw = candidates.find(candidate => arrayFromPackLike(candidate?.packs).length) ?? null;
  const packs = arrayFromPackLike(raw?.packs);
  if (!packs.length) return null;

  return {
    id: raw?.id ?? system.id ?? SYSTEM_ID,
    packs: packs.map(pack => ({
      name: pack.name,
      label: pack.label,
      path: pack.path,
      type: pack.type ?? pack.documentType,
      system: pack.system ?? SYSTEM_ID,
    })).filter(pack => pack.name),
  };
}

async function manifestFromSystemJson() {
  const node = await tryLoadNodeFs();
  if (!node) return null;

  try {
    const manifestPath = node.path.resolve(node.cwd, "system.json");
    const text = await node.fs.readFile(manifestPath, "utf8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readSystemManifest() {
  return manifestFromGame() ?? await manifestFromSystemJson();
}

function emptyImageSummary(catalog) {
  return {
    id: catalog.id,
    label: catalog.label,
    packName: catalog.packName,
    items: 0,
    images: 0,
    systemImages: 0,
    coreImages: 0,
    genericImages: 0,
    moduleImages: 0,
    remoteImages: 0,
    otherImages: 0,
    missingImages: 0,
    missingSystemImages: 0,
  };
}

function incrementImageSummary(summary, classification) {
  summary.images += classification === "missing" ? 0 : 1;
  if (classification === "system") summary.systemImages += 1;
  else if (classification === "core") summary.coreImages += 1;
  else if (classification === "generic") summary.genericImages += 1;
  else if (classification === "module") summary.moduleImages += 1;
  else if (classification === "remote") summary.remoteImages += 1;
  else if (classification === "missing") summary.missingImages += 1;
  else summary.otherImages += 1;
}

async function auditCatalogImages(catalog, checker) {
  const summary = emptyImageSummary(catalog);
  const findings = [];
  const missingByDirectory = {};

  for (const [key, row] of Object.entries(catalog.rows ?? {})) {
    summary.items += 1;
    let itemData = null;

    try {
      itemData = catalog.converter(row);
    } catch (err) {
      findings.push(finding(
        "error",
        "asset-conversion-failed",
        "Catalog row could not be converted while checking images.",
        { scope: "asset", catalog: catalog.id, pack: catalog.packName, key },
        { error: String(err?.message ?? err) }
      ));
      continue;
    }

    const img = normalizePath(itemData?.img);
    const classification = classifyImagePath(img);
    incrementImageSummary(summary, classification);

    if (classification === "missing") {
      findings.push(finding(
        "warn",
        "missing-image-path",
        "Generated item data has no image path.",
        { scope: "asset", catalog: catalog.id, pack: catalog.packName, key }
      ));
      continue;
    }

    if (classification !== "system" || !checker.available) continue;

    const relativePath = systemRelativePath(img);
    const exists = await checker.exists(relativePath, "file");
    if (exists === false) {
      summary.missingSystemImages += 1;
      const dir = pathDirectory(img);
      missingByDirectory[dir] = (missingByDirectory[dir] ?? 0) + 1;
      findings.push(finding(
        "warn",
        "missing-system-image",
        "System-local image path does not exist.",
        { scope: "asset", catalog: catalog.id, pack: catalog.packName, key },
        { img }
      ));
    }
  }

  return {
    ...summary,
    missingByDirectory,
    findings,
  };
}

function manifestPackMap(manifest, findings) {
  const map = new Map();
  for (const pack of manifest?.packs ?? []) {
    const name = String(pack?.name ?? "").trim();
    if (!name) continue;
    if (map.has(name)) {
      findings.push(finding(
        "error",
        "duplicate-pack-definition",
        "System manifest declares the same pack more than once.",
        { scope: "manifest", pack: name }
      ));
      continue;
    }
    map.set(name, pack);
  }
  return map;
}

async function auditPackManifest({ checker, packIds = null }) {
  const findings = [];
  const manifest = await readSystemManifest();
  const plan = getCompendiumBuildPlan({ packIds });
  const manifestPacks = manifestPackMap(manifest, findings);
  const expectedPacks = plan.packs ?? [];
  let missingPackDirectories = 0;
  let packDirectoriesChecked = 0;

  if (!manifest) {
    findings.push(finding(
      "warn",
      "manifest-unavailable",
      "System manifest was not available for pack audit.",
      { scope: "manifest" }
    ));
  }

  for (const expected of expectedPacks) {
    const pack = manifestPacks.get(expected.packName);
    if (!pack) {
      findings.push(finding(
        "error",
        "missing-pack-definition",
        "Generated compendium pack is missing from system.json.",
        { scope: "manifest", pack: expected.packName },
        { documentType: expected.documentType }
      ));
      continue;
    }

    if (String(pack.type ?? "") !== expected.documentType) {
      findings.push(finding(
        "error",
        "pack-document-type-mismatch",
        "Manifest pack type does not match the generated content plan.",
        { scope: "manifest", pack: expected.packName },
        { expected: expected.documentType, actual: pack.type }
      ));
    }

    if (String(pack.system ?? SYSTEM_ID) !== SYSTEM_ID) {
      findings.push(finding(
        "error",
        "pack-system-mismatch",
        "Manifest pack is not assigned to this system.",
        { scope: "manifest", pack: expected.packName },
        { expected: SYSTEM_ID, actual: pack.system }
      ));
    }

    const packPath = normalizePath(pack.path);
    if (!packPath) {
      findings.push(finding(
        "error",
        "missing-pack-path",
        "Manifest pack has no path.",
        { scope: "manifest", pack: expected.packName }
      ));
      continue;
    }

    if (checker.available && checker.mode === "node-fs") {
      packDirectoriesChecked += 1;
      const exists = await checker.exists(packPath, "directory");
      if (exists === false) {
        missingPackDirectories += 1;
        findings.push(finding(
          "warn",
          "missing-pack-directory",
          "Manifest pack path does not exist on disk.",
          { scope: "manifest", pack: expected.packName },
          { path: packPath }
        ));
      }
    }
  }

  for (const name of manifestPacks.keys()) {
    const generated = expectedPacks.some(pack => pack.packName === name);
    if (!generated && !KNOWN_MANUAL_PACKS.has(name)) {
      findings.push(finding(
        "info",
        "unmanaged-pack-definition",
        "Manifest pack is not managed by the generated content plan.",
        { scope: "manifest", pack: name }
      ));
    }
  }

  return {
    ok: findings.every(f => f.severity !== "error"),
    manifestId: manifest?.id ?? "",
    expectedGeneratedPacks: expectedPacks.length,
    manifestPacks: manifestPacks.size,
    packDirectoriesChecked,
    missingPackDirectories,
    findings,
    packs: expectedPacks.map(expected => {
      const pack = manifestPacks.get(expected.packName) ?? null;
      return {
        name: expected.packName,
        collection: expected.collection,
        documentType: expected.documentType,
        expected: expected.expected,
        manifestType: pack?.type ?? "",
        manifestPath: pack?.path ?? "",
        manifestFound: Boolean(pack),
      };
    }),
  };
}

function mergeMissingByDirectory(sections) {
  const out = {};
  for (const section of sections) {
    for (const [dir, count] of Object.entries(section.missingByDirectory ?? {})) {
      out[dir] = (out[dir] ?? 0) + Number(count ?? 0);
    }
  }
  return Object.entries(out)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([dir, count]) => ({ dir, count }));
}

export async function auditIronHillsAssets(options = {}) {
  const checkFilesystem = Boolean(options.checkFilesystem ?? options.checkFiles ?? false);
  const checker = await createPathChecker({ enabled: checkFilesystem });
  const findings = [];

  if (checkFilesystem && !checker.available) {
    findings.push(finding(
      "info",
      "filesystem-check-skipped",
      "Image and pack path existence checks were requested, but no filesystem/fetch checker is available.",
      { scope: "asset" }
    ));
  }

  const sections = [];
  for (const catalog of CATALOGS) {
    sections.push(await auditCatalogImages(catalog, checker));
  }

  const packReport = await auditPackManifest({
    checker,
    packIds: options.packIds ?? null,
  });

  findings.push(...sections.flatMap(section => section.findings));
  findings.push(...packReport.findings);

  const counts = summarizeFindings(findings);
  const summary = {
    itemsChecked: sections.reduce((sum, section) => sum + section.items, 0),
    imagesChecked: sections.reduce((sum, section) => sum + section.images, 0),
    systemImages: sections.reduce((sum, section) => sum + section.systemImages, 0),
    coreImages: sections.reduce((sum, section) => sum + section.coreImages, 0),
    genericImages: sections.reduce((sum, section) => sum + section.genericImages, 0),
    moduleImages: sections.reduce((sum, section) => sum + section.moduleImages, 0),
    remoteImages: sections.reduce((sum, section) => sum + section.remoteImages, 0),
    otherImages: sections.reduce((sum, section) => sum + section.otherImages, 0),
    missingImages: sections.reduce((sum, section) => sum + section.missingImages, 0),
    missingSystemImages: sections.reduce((sum, section) => sum + section.missingSystemImages, 0),
    expectedGeneratedPacks: packReport.expectedGeneratedPacks,
    manifestPacks: packReport.manifestPacks,
    packDirectoriesChecked: packReport.packDirectoriesChecked,
    missingPackDirectories: packReport.missingPackDirectories,
  };

  return {
    ok: counts.error === 0,
    checkFilesystem,
    checkerMode: checker.mode,
    counts,
    summary,
    sections: sections.map(section => ({
      id: section.id,
      label: section.label,
      packName: section.packName,
      items: section.items,
      images: section.images,
      systemImages: section.systemImages,
      coreImages: section.coreImages,
      genericImages: section.genericImages,
      moduleImages: section.moduleImages,
      remoteImages: section.remoteImages,
      otherImages: section.otherImages,
      missingImages: section.missingImages,
      missingSystemImages: section.missingSystemImages,
      missingByDirectory: section.missingByDirectory,
    })),
    missingByDirectory: mergeMissingByDirectory(sections),
    packs: packReport,
    findings,
  };
}

export function formatAssetAuditReport(report, { maxFindings = 20, maxDirectories = 12 } = {}) {
  const counts = report?.counts ?? {};
  const summary = report?.summary ?? {};
  const lines = [
    `Iron Hills asset audit: ${report?.ok ? "OK" : "ISSUES"}`,
    `Checker: ${report?.checkFilesystem ? report?.checkerMode ?? "unknown" : "disabled"}`,
    `Items/images: ${summary.itemsChecked ?? 0} items, ${summary.imagesChecked ?? 0} image paths`,
    `Image roots: system=${summary.systemImages ?? 0}, core=${summary.coreImages ?? 0}, generic=${summary.genericImages ?? 0}, module=${summary.moduleImages ?? 0}, remote=${summary.remoteImages ?? 0}, other=${summary.otherImages ?? 0}`,
    `Missing: images=${summary.missingImages ?? 0}, systemFiles=${summary.missingSystemImages ?? 0}`,
    `Packs: generated=${summary.expectedGeneratedPacks ?? 0}, manifest=${summary.manifestPacks ?? 0}, dirsChecked=${summary.packDirectoriesChecked ?? 0}, missingDirs=${summary.missingPackDirectories ?? 0}`,
    `Findings: ${counts.error ?? 0} errors, ${counts.warn ?? 0} warnings, ${counts.info ?? 0} info`,
  ];

  for (const section of report?.sections ?? []) {
    lines.push(
      `- ${section.id}: items=${section.items}, system=${section.systemImages}, core=${section.coreImages}, missingSystem=${section.missingSystemImages}`
    );
  }

  const missingDirs = report?.missingByDirectory ?? [];
  if (missingDirs.length) {
    lines.push("Missing system images by directory:");
    for (const row of missingDirs.slice(0, maxDirectories)) {
      lines.push(`- ${row.dir}: ${row.count}`);
    }
    if (missingDirs.length > maxDirectories) lines.push(`...and ${missingDirs.length - maxDirectories} more directories.`);
  }

  const findings = report?.findings ?? [];
  if (findings.length) {
    lines.push("Top findings:");
    for (const f of findings.slice(0, maxFindings)) {
      const detail = f.details?.img ? ` (${f.details.img})` : "";
      lines.push(`- [${f.severity}] ${f.code}: ${f.path || "(unknown)"} - ${f.message}${detail}`);
    }
    if (findings.length > maxFindings) lines.push(`...and ${findings.length - maxFindings} more findings.`);
  }

  return lines.join("\n");
}
