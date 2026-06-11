#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { GENERATED_PACKS } from "../module/compendium-builder.mjs";
import {
  checkIronHillsContentReadiness,
} from "../module/services/content-readiness-service.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SYSTEM_ID = "iron-hills-system";
const DEFAULT_FOUNDRY_APP = "D:/Foundry/Foundry Virtual Tabletop/resources/app";
export const DEFAULT_LEVEL_MODULE = `${DEFAULT_FOUNDRY_APP}/node_modules/classic-level`;
const CORE_VERSION = "12.343";

const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function parseArgs(argv) {
  const out = {
    apply: false,
    planOnly: false,
    packs: [],
    systemRoot: ROOT,
    levelModule: DEFAULT_LEVEL_MODULE,
    pruneItemPacks: false,
    preflight: true,
    checkFilesystem: true,
    maxFindings: 20,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") out.apply = true;
    else if (arg === "--dry-run") out.apply = false;
    else if (arg === "--plan-only") out.planOnly = true;
    else if (arg === "--prune-item-packs") out.pruneItemPacks = true;
    else if (arg === "--skip-preflight") out.preflight = false;
    else if (arg === "--no-files") out.checkFilesystem = false;
    else if (arg === "--pack") out.packs.push(argv[++i]);
    else if (arg.startsWith("--pack=")) out.packs.push(arg.slice("--pack=".length));
    else if (arg === "--system-root") out.systemRoot = path.resolve(argv[++i]);
    else if (arg.startsWith("--system-root=")) out.systemRoot = path.resolve(arg.slice("--system-root=".length));
    else if (arg === "--level-module") out.levelModule = argv[++i];
    else if (arg.startsWith("--level-module=")) out.levelModule = arg.slice("--level-module=".length);
    else if (arg === "--max-findings") out.maxFindings = Math.max(0, Number(argv[++i]) || 0);
    else if (arg.startsWith("--max-findings=")) out.maxFindings = Math.max(0, Number(arg.slice("--max-findings=".length)) || 0);
    else if (arg === "--help" || arg === "-h") {
      out.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return out;
}

function usage() {
  return [
    "Usage: node tools/sync-generated-packs.mjs [--dry-run|--apply] [--pack ih-materials] [--plan-only]",
    "",
    "Synchronizes generated Iron Hills compendium packs from source catalogs.",
    "Default mode is --dry-run. Existing document ids are preserved by catalogId/bestiaryId.",
    "",
    "Options:",
    "  --apply              Write LevelDB pack changes. Foundry must be closed.",
    "  --dry-run            Read packs and report changes without writing.",
    "  --plan-only          Build generated data and manifest plan without opening LevelDB.",
    "  --pack <name>        Limit to a generated pack name, e.g. ih-materials.",
    "  --prune-item-packs   Also delete extra docs from generated Item packs. Default: keep extras.",
    "  --skip-preflight     Skip catalog/assets/generated-source readiness before syncing.",
    "  --no-files           Skip filesystem checks during preflight.",
    "  --system-root <dir>  System root. Defaults to the current repository.",
    "  --level-module <dir> classic-level module path. Defaults to the local Foundry install.",
    "  --max-findings <n>   Limit preflight findings printed by the CLI.",
  ].join("\n");
}

function normalizeToolOptions(options = {}) {
  return {
    apply: Boolean(options.apply),
    planOnly: Boolean(options.planOnly),
    packs: Array.isArray(options.packs) ? options.packs : [],
    systemRoot: path.resolve(options.systemRoot ?? ROOT),
    levelModule: options.levelModule ?? DEFAULT_LEVEL_MODULE,
    pruneItemPacks: Boolean(options.pruneItemPacks),
    preflight: options.preflight !== false,
    checkFilesystem: options.checkFilesystem !== false,
    maxFindings: Math.max(0, Number(options.maxFindings ?? 20) || 0),
  };
}

function normalizePackId(value) {
  return String(value ?? "").trim().replace(/^iron-hills-system\./, "");
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function stableId(seed) {
  const digest = crypto.createHash("sha1").update(String(seed)).digest();
  let out = "";
  for (let i = 0; out.length < 16; i += 1) {
    out += BASE62[digest[i % digest.length] % BASE62.length];
  }
  return out;
}

function seededRandom(seed) {
  let state = crypto.createHash("sha1").update(String(seed)).digest().readUInt32BE(0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function withSeededMathRandom(seed, fn) {
  const original = Math.random;
  Math.random = seededRandom(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

function sortPlain(value) {
  if (Array.isArray(value)) return value.map(sortPlain);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((out, key) => {
    out[key] = sortPlain(value[key]);
    return out;
  }, {});
}

function stableStringify(value) {
  return JSON.stringify(sortPlain(value ?? null));
}

function samePlainValue(a, b) {
  return stableStringify(a) === stableStringify(b);
}

function generatedSpecs(packIds = []) {
  const wanted = packIds.length ? new Set(packIds.map(normalizePackId)) : null;
  return GENERATED_PACKS.filter(spec => !wanted || wanted.has(spec.packName));
}

async function readManifest(systemRoot) {
  const manifestPath = path.join(systemRoot, "system.json");
  return JSON.parse(await fs.readFile(manifestPath, "utf8"));
}

function packManifestMap(manifest) {
  return new Map((manifest.packs ?? []).map(pack => [pack.name, pack]));
}

function catalogIdFromData(data) {
  return String(data?.flags?.[SYSTEM_ID]?.catalogId ?? data?.system?.catalogId ?? "").trim();
}

function bestiaryIdFromActor(data) {
  return String(data?.system?.info?.bestiaryId ?? data?.system?.info?.role ?? "").trim();
}

function mergeFlags(existingFlags = {}, desiredFlags = {}) {
  const out = {
    ...clonePlain(existingFlags),
    ...clonePlain(desiredFlags),
  };
  if (existingFlags[SYSTEM_ID] || desiredFlags[SYSTEM_ID]) {
    out[SYSTEM_ID] = {
      ...(clonePlain(existingFlags[SYSTEM_ID] ?? {})),
      ...(clonePlain(desiredFlags[SYSTEM_ID] ?? {})),
    };
  }
  return out;
}

function inferOwner(existingDocs) {
  for (const doc of existingDocs) {
    const ownership = doc?.ownership;
    if (!ownership || typeof ownership !== "object") continue;
    for (const [userId, level] of Object.entries(ownership)) {
      if (userId !== "default" && Number(level) >= 3) return userId;
    }
  }
  return null;
}

function statsFor(existing, { systemVersion, userId, now, touch }) {
  const previous = existing?._stats ?? {};
  return {
    compendiumSource: previous.compendiumSource ?? null,
    duplicateSource: previous.duplicateSource ?? null,
    coreVersion: previous.coreVersion ?? CORE_VERSION,
    systemId: previous.systemId ?? SYSTEM_ID,
    systemVersion: previous.systemVersion ?? systemVersion,
    createdTime: previous.createdTime ?? now,
    modifiedTime: touch ? now : (previous.modifiedTime ?? previous.createdTime ?? now),
    lastModifiedBy: touch ? userId : (previous.lastModifiedBy ?? userId),
  };
}

function itemDocEnvelope(data, existing, context, { touch = false } = {}) {
  const now = context.now;
  const userId = context.userId;
  const id = existing?._id ?? data._id ?? stableId(`${context.packName}:${catalogIdFromData(data) || data.name}`);
  const systemVersion = context.systemVersion;
  return {
    ...clonePlain(data),
    _id: id,
    effects: clonePlain(existing?.effects ?? data.effects ?? []),
    folder: existing?.folder ?? null,
    sort: Number(existing?.sort ?? data.sort ?? 0),
    ownership: clonePlain(existing?.ownership ?? { default: 0, ...(userId ? { [userId]: 3 } : {}) }),
    flags: mergeFlags(existing?.flags ?? {}, data.flags ?? {}),
    _stats: statsFor(existing, { systemVersion, userId, now, touch }),
  };
}

function actorDocEnvelope(data, existing, context, itemIds, { touch = false } = {}) {
  const now = context.now;
  const userId = context.userId;
  const id = existing?._id ?? data._id ?? stableId(`${context.packName}:${bestiaryIdFromActor(data) || data.name}`);
  const systemVersion = context.systemVersion;
  return {
    ...clonePlain(data),
    _id: id,
    items: itemIds,
    prototypeToken: clonePlain(existing?.prototypeToken ?? {
      name: data.name,
      displayName: 20,
      actorLink: false,
      disposition: -1,
      texture: { src: data.img ?? "icons/svg/mystery-man.svg" },
      width: 1,
      height: 1,
    }),
    effects: clonePlain(existing?.effects ?? data.effects ?? []),
    folder: existing?.folder ?? null,
    sort: Number(existing?.sort ?? data.sort ?? 0),
    ownership: clonePlain(existing?.ownership ?? { default: 0, ...(userId ? { [userId]: 3 } : {}) }),
    flags: mergeFlags(existing?.flags ?? {}, data.flags ?? {}),
    _stats: statsFor(existing, { systemVersion, userId, now, touch }),
  };
}

function embeddedItemEnvelope(data, existing, context, id, { touch = false } = {}) {
  const now = context.now;
  const userId = context.userId;
  const systemVersion = context.systemVersion;
  return {
    ...clonePlain(data),
    _id: id,
    effects: clonePlain(existing?.effects ?? data.effects ?? []),
    folder: existing?.folder ?? null,
    sort: Number(existing?.sort ?? data.sort ?? 0),
    ownership: clonePlain(existing?.ownership ?? { default: 0 }),
    flags: mergeFlags(existing?.flags ?? {}, data.flags ?? {}),
    _stats: statsFor(existing, { systemVersion, userId, now, touch }),
  };
}

function keyPrefixFor(documentType) {
  if (documentType === "Actor") return "actors";
  if (documentType === "Item") return "items";
  throw new Error(`Unsupported document type: ${documentType}`);
}

function rootKey(documentType, id) {
  return `!${keyPrefixFor(documentType)}!${id}`;
}

function actorItemKey(actorId, itemId) {
  return `!actors.items!${actorId}.${itemId}`;
}

async function readLevelPack(db, documentType) {
  const rootPrefix = `!${keyPrefixFor(documentType)}!`;
  const embeddedPrefix = "!actors.items!";
  const docs = new Map();
  const embedded = new Map();
  const rawKeys = [];

  for await (const [key, value] of db.iterator()) {
    rawKeys.push(key);
    if (key.startsWith(rootPrefix)) {
      const doc = JSON.parse(value);
      docs.set(doc._id ?? key.slice(rootPrefix.length), { key, doc });
      continue;
    }
    if (documentType === "Actor" && key.startsWith(embeddedPrefix)) {
      const doc = JSON.parse(value);
      const rest = key.slice(embeddedPrefix.length);
      const [actorId] = rest.split(".");
      if (!embedded.has(actorId)) embedded.set(actorId, new Map());
      embedded.get(actorId).set(doc._id ?? rest, { key, doc });
    }
  }

  return { docs, embedded, rawKeys };
}

function indexItemDocs(docs) {
  const byCatalogId = new Map();
  const byName = new Map();
  const duplicates = [];
  for (const { doc } of docs.values()) {
    const catalogId = catalogIdFromData(doc);
    if (catalogId) {
      if (byCatalogId.has(catalogId)) duplicates.push(catalogId);
      else byCatalogId.set(catalogId, doc);
    }
    if (doc.name && !byName.has(doc.name)) byName.set(doc.name, doc);
  }
  return { byCatalogId, byName, duplicates };
}

function indexActorDocs(docs) {
  const byBestiaryId = new Map();
  const byName = new Map();
  const duplicates = [];
  for (const { doc } of docs.values()) {
    const bestiaryId = bestiaryIdFromActor(doc);
    if (bestiaryId) {
      if (byBestiaryId.has(bestiaryId)) duplicates.push(bestiaryId);
      else byBestiaryId.set(bestiaryId, doc);
    }
    if (doc.name && !byName.has(doc.name)) byName.set(doc.name, doc);
  }
  return { byBestiaryId, byName, duplicates };
}

function indexEmbeddedItems(embeddedMap = new Map()) {
  const byCatalogId = new Map();
  const byName = new Map();
  for (const { doc } of embeddedMap.values()) {
    const catalogId = catalogIdFromData(doc);
    if (catalogId && !byCatalogId.has(catalogId)) byCatalogId.set(catalogId, doc);
    if (doc.name && !byName.has(doc.name)) byName.set(doc.name, doc);
  }
  return { byCatalogId, byName };
}

function buildGeneratedData(spec) {
  const out = [];
  for (const [key, row] of Object.entries(spec.rows ?? {})) {
    const data = withSeededMathRandom(`${spec.packName}:${key}`, () => spec.converter(row, key));
    out.push({ key, row, data });
  }
  return out;
}

async function syncItemPack({ db, spec, context, apply, pruneItemPacks }) {
  const { docs } = await readLevelPack(db, "Item");
  const existingDocs = Array.from(docs.values()).map(entry => entry.doc);
  const localContext = {
    ...context,
    userId: context.userId ?? inferOwner(existingDocs),
  };
  const index = indexItemDocs(docs);
  const ops = [];
  const expectedCatalogIds = new Set();
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  const errors = [];

  for (const generated of buildGeneratedData(spec)) {
    try {
      const data = generated.data;
      const catalogId = catalogIdFromData(data) || generated.row?.id || generated.key;
      expectedCatalogIds.add(String(catalogId));
      const existing = index.byCatalogId.get(String(catalogId)) ?? index.byName.get(data.name) ?? null;
      const candidate = itemDocEnvelope(data, existing, localContext, { touch: false });
      const changed = !existing || !samePlainValue(existing, candidate);
      if (!existing) {
        created += 1;
        ops.push({ type: "put", key: rootKey("Item", candidate._id), value: JSON.stringify(candidate) });
      } else if (changed) {
        updated += 1;
        const touched = itemDocEnvelope(data, existing, localContext, { touch: true });
        ops.push({ type: "put", key: rootKey("Item", touched._id), value: JSON.stringify(touched) });
      } else {
        unchanged += 1;
      }
    } catch (err) {
      errors.push({ id: generated.key, error: String(err?.message ?? err) });
    }
  }

  let deleted = 0;
  if (pruneItemPacks) {
    for (const { key, doc } of docs.values()) {
      const catalogId = catalogIdFromData(doc);
      if (catalogId && expectedCatalogIds.has(catalogId)) continue;
      deleted += 1;
      ops.push({ type: "del", key });
    }
  }

  if (apply && ops.length) await db.batch(ops);
  return {
    ok: errors.length === 0,
    packName: spec.packName,
    documentType: "Item",
    expected: expectedCatalogIds.size,
    existing: docs.size,
    created,
    updated,
    unchanged,
    deleted,
    duplicates: index.duplicates.length,
    errors,
  };
}

async function syncActorPack({ db, spec, context, apply }) {
  const { docs, embedded } = await readLevelPack(db, "Actor");
  const existingDocs = Array.from(docs.values()).map(entry => entry.doc);
  const localContext = {
    ...context,
    userId: context.userId ?? inferOwner(existingDocs),
  };
  const index = indexActorDocs(docs);
  const generatedRows = buildGeneratedData(spec);
  const expectedBestiaryIds = new Set();
  const expectedActorIds = new Set();
  const ops = [];
  const errors = [];
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let deleted = 0;
  let embeddedPut = 0;
  let embeddedDeleted = 0;

  for (const generated of generatedRows) {
    try {
      const data = generated.data;
      const bestiaryId = bestiaryIdFromActor(data) || generated.row?.id || generated.key;
      expectedBestiaryIds.add(String(bestiaryId));
      const existing = index.byBestiaryId.get(String(bestiaryId)) ?? index.byName.get(data.name) ?? null;
      const actorId = existing?._id ?? stableId(`${spec.packName}:${bestiaryId}`);
      expectedActorIds.add(actorId);
      const existingEmbedded = embedded.get(actorId) ?? new Map();
      const embeddedIndex = indexEmbeddedItems(existingEmbedded);
      const itemIds = [];
      const desiredEmbeddedKeys = new Set();

      for (const [idx, itemData] of (data.items ?? []).entries()) {
        const catalogId = catalogIdFromData(itemData);
        const existingItem = (catalogId ? embeddedIndex.byCatalogId.get(catalogId) : null)
          ?? embeddedIndex.byName.get(itemData.name)
          ?? null;
        const itemId = existingItem?._id ?? stableId(`${actorId}:${catalogId || itemData.name}:${idx}`);
        itemIds.push(itemId);
        desiredEmbeddedKeys.add(actorItemKey(actorId, itemId));
        const candidate = embeddedItemEnvelope(itemData, existingItem, localContext, itemId, { touch: false });
        const changed = !existingItem || !samePlainValue(existingItem, candidate);
        if (changed) {
          const touched = embeddedItemEnvelope(itemData, existingItem, localContext, itemId, { touch: true });
          ops.push({ type: "put", key: actorItemKey(actorId, itemId), value: JSON.stringify(touched) });
          embeddedPut += 1;
        }
      }

      for (const entry of existingEmbedded.values()) {
        if (desiredEmbeddedKeys.has(entry.key)) continue;
        embeddedDeleted += 1;
        ops.push({ type: "del", key: entry.key });
      }

      const baseData = { ...clonePlain(data), items: undefined };
      delete baseData.items;
      const candidate = actorDocEnvelope(baseData, existing, localContext, itemIds, { touch: false });
      const changed = !existing || !samePlainValue(existing, candidate);
      if (!existing) {
        created += 1;
        ops.push({ type: "put", key: rootKey("Actor", candidate._id), value: JSON.stringify(candidate) });
      } else if (changed) {
        updated += 1;
        const touched = actorDocEnvelope(baseData, existing, localContext, itemIds, { touch: true });
        ops.push({ type: "put", key: rootKey("Actor", touched._id), value: JSON.stringify(touched) });
      } else {
        unchanged += 1;
      }
    } catch (err) {
      errors.push({ id: generated.key, error: String(err?.message ?? err) });
    }
  }

  for (const { key, doc } of docs.values()) {
    if (expectedActorIds.has(doc._id)) continue;
    const bestiaryId = bestiaryIdFromActor(doc);
    if (bestiaryId && expectedBestiaryIds.has(bestiaryId)) continue;
    deleted += 1;
    ops.push({ type: "del", key });
    for (const entry of (embedded.get(doc._id) ?? new Map()).values()) {
      embeddedDeleted += 1;
      ops.push({ type: "del", key: entry.key });
    }
  }

  if (apply && ops.length) await db.batch(ops);
  return {
    ok: errors.length === 0,
    packName: spec.packName,
    documentType: "Actor",
    expected: expectedActorIds.size,
    existing: docs.size,
    created,
    updated,
    unchanged,
    deleted,
    embeddedPut,
    embeddedDeleted,
    duplicates: index.duplicates.length,
    errors,
  };
}

async function openClassicLevel(modulePath) {
  const require = createRequire(import.meta.url);
  const { ClassicLevel } = require(modulePath);
  return ClassicLevel;
}

function lockHint(err, packPath) {
  const text = String(err?.message ?? err);
  const causeText = String(err?.cause?.message ?? err?.cause ?? "");
  if (
    err?.code === "LEVEL_LOCKED"
    || err?.cause?.code === "LEVEL_LOCKED"
    || text.includes("LockFile")
    || text.includes("LOCK")
    || causeText.includes("LockFile")
    || causeText.includes("LOCK")
  ) {
    return `Pack is locked: ${packPath}. Close Foundry VTT before running --apply or pack-reading dry-runs.`;
  }
  return causeText ? `${text}: ${causeText}` : text;
}

async function syncPack({ ClassicLevel, spec, manifestPack, options, manifest }) {
  const packPath = path.join(options.systemRoot, manifestPack.path);
  const db = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
  try {
    await db.open();
    const context = {
      packName: spec.packName,
      now: Date.now(),
      systemVersion: manifest.version ?? "0.0.1",
      userId: null,
    };
    const result = spec.documentType === "Item"
      ? await syncItemPack({
        db,
        spec,
        context,
        apply: options.apply,
        pruneItemPacks: options.pruneItemPacks,
      })
      : await syncActorPack({
        db,
        spec,
        context,
        apply: options.apply,
      });
    await db.close();
    return result;
  } catch (err) {
    await db.close().catch(() => {});
    return {
      ok: false,
      packName: spec.packName,
      documentType: spec.documentType,
      expected: Object.keys(spec.rows ?? {}).length,
      existing: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      deleted: 0,
      errors: [{ id: spec.packName, error: lockHint(err, packPath) }],
    };
  }
}

async function runSyncPreflight(options) {
  const originalCwd = process.cwd();
  process.chdir(options.systemRoot);
  try {
    return await checkIronHillsContentReadiness({
      packs: options.packs,
      checkFilesystem: options.checkFilesystem,
      includePackDryRun: false,
      requireCleanPackDryRun: false,
    });
  } finally {
    process.chdir(originalCwd);
  }
}

function compactFinding(finding) {
  return {
    severity: finding?.severity ?? "error",
    code: finding?.code ?? "unknown",
    path: finding?.path ?? "",
    message: finding?.message ?? "",
  };
}

function collectReadinessFindings(report = null, maxFindings = 20) {
  const sources = [
    report?.catalogs,
    report?.assets,
    report?.generated,
    report?.generatedPacks,
    report?.packDryRun,
  ];
  return sources
    .flatMap(source => Array.isArray(source?.findings) ? source.findings : [])
    .filter(row => row?.severity === "error" || row?.severity === "warn")
    .slice(0, maxFindings)
    .map(compactFinding);
}

function summarizeSyncPreflight(report = null, options = {}) {
  if (!report) return null;
  const findings = collectReadinessFindings(report, Math.max(0, Number(options.maxFindings ?? 20) || 0));
  return {
    ok: Boolean(report.ok),
    blockingErrors: Number(report.summary?.blockingErrors ?? 0),
    warnings: Number(report.summary?.warnings ?? 0),
    missingSystemImages: Number(report.summary?.missingSystemImages ?? 0),
    catalogRows: Number(report.summary?.catalogRows ?? 0),
    generatedPackItems: Number(report.summary?.generatedPackItems ?? 0),
    generatedPackActors: Number(report.summary?.generatedPackActors ?? 0),
    balanceItems: Number(report.summary?.balanceItems ?? 0),
    balanceActors: Number(report.summary?.balanceActors ?? 0),
    balanceWarnings: Number(report.summary?.balanceWarnings ?? 0),
    nextActions: Array.isArray(report.nextActions) ? report.nextActions : [],
    findings,
  };
}

function blockedByPreflightResult(preflight, mode = "dry-run", options = {}) {
  return {
    ok: false,
    mode,
    preflightBlocked: true,
    preflight: summarizeSyncPreflight(preflight, options),
    packs: 0,
    expected: 0,
    existing: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    deleted: 0,
    embeddedPut: 0,
    embeddedDeleted: 0,
    failed: Number(preflight?.summary?.blockingErrors ?? 1) || 1,
    duplicates: 0,
    results: [],
  };
}

export async function syncGeneratedPacks(options = {}) {
  const resolved = normalizeToolOptions(options);
  const preflight = resolved.preflight ? await runSyncPreflight(resolved) : null;
  if (preflight && !preflight.ok) {
    return blockedByPreflightResult(preflight, resolved.apply ? "apply" : "dry-run", resolved);
  }

  const specs = generatedSpecs(resolved.packs);
  const manifest = await readManifest(resolved.systemRoot);
  const manifestPacks = packManifestMap(manifest);

  const plan = specs.map(spec => ({
    packName: spec.packName,
    documentType: spec.documentType,
    expected: Object.keys(spec.rows ?? {}).length,
    path: manifestPacks.get(spec.packName)?.path ?? "",
    manifestFound: manifestPacks.has(spec.packName),
  }));

  if (resolved.planOnly) {
    return {
      ok: plan.every(row => row.manifestFound),
      mode: "plan-only",
      preflight: summarizeSyncPreflight(preflight, resolved),
      totalExpected: plan.reduce((sum, row) => sum + row.expected, 0),
      packs: plan,
    };
  }

  const ClassicLevel = await openClassicLevel(resolved.levelModule);
  const results = [];
  for (const spec of specs) {
    const manifestPack = manifestPacks.get(spec.packName);
    if (!manifestPack) {
      results.push({
        ok: false,
        packName: spec.packName,
        documentType: spec.documentType,
        expected: Object.keys(spec.rows ?? {}).length,
        existing: 0,
        created: 0,
        updated: 0,
        unchanged: 0,
        deleted: 0,
        errors: [{ id: spec.packName, error: "missing-pack-definition" }],
      });
      continue;
    }
    results.push(await syncPack({ ClassicLevel, spec, manifestPack, options: resolved, manifest }));
  }

  return {
    ok: results.every(result => result.ok),
    mode: resolved.apply ? "apply" : "dry-run",
    preflight: summarizeSyncPreflight(preflight, resolved),
    packs: results.length,
    expected: results.reduce((sum, result) => sum + Number(result.expected ?? 0), 0),
    existing: results.reduce((sum, result) => sum + Number(result.existing ?? 0), 0),
    created: results.reduce((sum, result) => sum + Number(result.created ?? 0), 0),
    updated: results.reduce((sum, result) => sum + Number(result.updated ?? 0), 0),
    unchanged: results.reduce((sum, result) => sum + Number(result.unchanged ?? 0), 0),
    deleted: results.reduce((sum, result) => sum + Number(result.deleted ?? 0), 0),
    embeddedPut: results.reduce((sum, result) => sum + Number(result.embeddedPut ?? 0), 0),
    embeddedDeleted: results.reduce((sum, result) => sum + Number(result.embeddedDeleted ?? 0), 0),
    failed: results.reduce((sum, result) => sum + Number(result.errors?.length ?? 0), 0),
    duplicates: results.reduce((sum, result) => sum + Number(result.duplicates ?? 0), 0),
    results,
  };
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

  const summary = await syncGeneratedPacks(options);
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) process.exitCode = 1;
}

if (isDirectRun()) {
  run().catch((err) => {
    console.error(err?.stack ?? err);
    process.exit(1);
  });
}
