/**
 * Iron Hills — Compendium Builder
 * Заполняет компендиумы системы предметами из каталога.
 * Запускается один раз при первом запуске мира (GM).
 * Повторный запуск: game.ironHills.buildCompendiums()
 */

import { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, TOOLS, BELTS, BACKPACKS, ATTACHMENTS, CONSUMABLES, THROWABLES } from "./constants/items-catalog.mjs";
import { SPELLS } from "./constants/spells-catalog.mjs";
import { NPC_PACK_ACTORS, NPC_ROLE_PROFILES, getNpcRoleImage, resolveNpcProfileKey } from "./constants/npc-profiles.mjs";
import { MONSTER_BESTIARY, resolveMonsterPackDocToBestiaryId } from "./constants/monster-bestiary.mjs";
import { monsterRowToActorData } from "./services/wilderness-service.mjs";
import { buildNpcActorData, buildNpcStartingInventoryItems } from "./services/world-content-service.mjs";
import {
  attachmentToItemData,
  armorToItemData,
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
} from "./utils/catalog-item-data.mjs";
import { replaceMonsterHarvestEmbeddedItems } from "./utils/monster-harvest-items.mjs";

// ── Конвертеры из каталога в данные Item ────────────────────

function materialToItem(m) {
  return materialToItemData(m);
}

function weaponToItem(w) {
  return weaponToItemData(w);
}

function armorToItem(a) {
  return armorToItemData(a);
}

function potionToItem(p) {
  return potionToItemData(p);
}

function potionActionConfig(p) {
  const effect = p.effect ?? p.effectType ?? "healHP";
  const targetPart = p.targetPart ?? p.zone ?? "torso";
  const data = potionToItemData({ ...p, effect, targetPart });
  return {
    actionType: data.system?.actionType ?? "",
    applicationScope: data.system?.applicationScope ?? "global",
    targetActorMode: data.system?.targetActorMode ?? "self",
    targetPart: data.system?.targetPart ?? "",
  };
}

function foodToItem(f) {
  return foodToItemData(f);
}

function toolToItem(t) {
  return toolToItemData(t);
}

function attachmentToItem(a) {
  return attachmentToItemData(a);
}

function beltToItem(b) {
  return beltToItemData(b);
}

function backpackToItem(b) {
  return backpackToItemData(b);
}

function consumableToItem(v) {
  return consumableToItemData(v);
}

function throwableToItem(t) {
  return throwableToItemData(t);
}

function npcRowToActorData(row, id) {
  const roleKey = row.specialization ?? "villager";
  const tier = Math.max(1, Math.min(10, Number(row.tier ?? 1) || 1));
  const built = buildNpcActorData(roleKey, tier, row.faction ?? "", {
    name: row.label ?? id,
  });
  const data = built?.data ?? {};
  const items = buildNpcStartingInventoryItems(roleKey, tier, {
    includeEquipment: true,
    includeCarry: true,
  });
  data.img = row.img ?? data.img ?? "icons/svg/mystery-man.svg";
  data.items = items;
  data.system = {
    ...(data.system ?? {}),
    info: {
      ...(data.system?.info ?? {}),
      role: NPC_ROLE_PROFILES[roleKey]?.label ?? roleKey,
      specialization: roleKey,
      tier,
      tierRange: row.tierRange ?? "",
      faction: row.faction ?? "",
      desc: row.desc ?? data.system?.info?.desc ?? "",
      bestiaryId: row.id ?? id,
      allowPickpocket: true,
      lootTable: "",
      pickpocketTable: "",
    },
  };
  data.prototypeToken = {
    name: data.name,
    displayName: 20,
    actorLink: false,
    disposition: roleKey === "bandit" ? -1 : 0,
    texture: { src: data.img },
    width: 1,
    height: 1,
  };
  data.flags = {
    ...(data.flags ?? {}),
    [SYSTEM_ID]: {
      ...(data.flags?.[SYSTEM_ID] ?? {}),
      npcProfileId: row.id ?? id,
      specialization: roleKey,
    },
  };
  return data;
}

const SYSTEM_ID = "iron-hills-system";

export const CATALOG_ITEM_PACKS = Object.freeze([
  { packName: "ih-weapons", label: "Weapons", documentType: "Item", rows: WEAPONS, converter: weaponToItem },
  { packName: "ih-armor", label: "Armor", documentType: "Item", rows: ARMORS, converter: armorToItem },
  { packName: "ih-materials", label: "Materials", documentType: "Item", rows: MATERIALS, converter: materialToItem },
  { packName: "ih-potions", label: "Potions", documentType: "Item", rows: POTIONS, converter: potionToItem },
  { packName: "ih-food", label: "Food", documentType: "Item", rows: FOOD, converter: foodToItem },
  { packName: "ih-tools", label: "Tools", documentType: "Item", rows: TOOLS, converter: toolToItem },
  { packName: "ih-belts", label: "Belts", documentType: "Item", rows: BELTS, converter: beltToItem },
  { packName: "ih-backpacks", label: "Backpacks", documentType: "Item", rows: BACKPACKS, converter: backpackToItem },
  { packName: "ih-attachments", label: "Attachments", documentType: "Item", rows: ATTACHMENTS, converter: attachmentToItem },
  { packName: "ih-spells", label: "Spells", documentType: "Item", rows: SPELLS, converter: spellToItem },
  { packName: "ih-consumables", label: "Consumables", documentType: "Item", rows: CONSUMABLES, converter: consumableToItem },
  { packName: "ih-throwables", label: "Throwables", documentType: "Item", rows: THROWABLES, converter: throwableToItem },
]);

export const GENERATED_PACKS = Object.freeze([
  ...CATALOG_ITEM_PACKS,
  { packName: "ih-npc", label: "NPC", documentType: "Actor", rows: NPC_PACK_ACTORS, converter: npcRowToActorData },
  { packName: "ih-monsters", label: "Monsters", documentType: "Actor", rows: MONSTER_BESTIARY, converter: monsterRowToActorData },
]);

function clonePlain(value) {
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  if (globalThis.foundry?.utils?.duplicate) return foundry.utils.duplicate(value);
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value ?? null));
}

function normalizePackId(packId) {
  return String(packId ?? "").trim().replace(/^iron-hills-system\./, "");
}

function packFilterSet(packIds = null) {
  if (!Array.isArray(packIds) || !packIds.length) return null;
  return new Set(packIds.map(normalizePackId).filter(Boolean));
}

function filterPackSpecs(specs, packIds = null) {
  const filter = packFilterSet(packIds);
  if (!filter) return [...specs];
  return specs.filter(spec => filter.has(spec.packName));
}

function packCollectionId(packName) {
  return `${SYSTEM_ID}.${packName}`;
}

function getCatalogIdFromData(data) {
  return String(data?.flags?.[SYSTEM_ID]?.catalogId ?? data?.system?.catalogId ?? "").trim();
}

function getCatalogIdFromDoc(doc) {
  return String(
    doc?.getFlag?.(SYSTEM_ID, "catalogId")
      ?? doc?.flags?.[SYSTEM_ID]?.catalogId
      ?? doc?.system?.catalogId
      ?? ""
  ).trim();
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
  return stableStringify(clonePlain(a)) === stableStringify(clonePlain(b));
}

function buildCatalogDocumentPatch(doc, data) {
  const patch = {};

  if (data.name && doc.name !== data.name) patch.name = data.name;
  if (data.img && doc.img !== data.img) patch.img = data.img;
  const desiredTokenImg = String(data.prototypeToken?.texture?.src ?? data.img ?? "").trim();
  const currentTokenImg = String(doc.prototypeToken?.texture?.src ?? "").trim();
  if (desiredTokenImg && currentTokenImg !== desiredTokenImg) {
    patch["prototypeToken.texture.src"] = desiredTokenImg;
  }

  if (data.system && !samePlainValue(doc.system ?? {}, data.system)) {
    patch.system = clonePlain(data.system);
  }

  const desiredSystemFlags = data.flags?.[SYSTEM_ID] ?? null;
  if (desiredSystemFlags && typeof desiredSystemFlags === "object") {
    const currentFlags = clonePlain(doc.flags ?? {});
    const currentSystemFlags = currentFlags[SYSTEM_ID] ?? {};
    const nextSystemFlags = {
      ...currentSystemFlags,
      ...clonePlain(desiredSystemFlags),
    };
    if (!samePlainValue(currentSystemFlags, nextSystemFlags)) {
      patch.flags = {
        ...currentFlags,
        [SYSTEM_ID]: nextSystemFlags,
      };
    }
  }

  return patch;
}

function buildPackPlanEntry(spec) {
  return {
    packName: spec.packName,
    collection: packCollectionId(spec.packName),
    label: spec.label,
    documentType: spec.documentType,
    expected: Object.keys(spec.rows ?? {}).length,
    catalogIds: Object.keys(spec.rows ?? {}),
  };
}

export function getCompendiumBuildPlan(options = {}) {
  const packIds = options.packIds ?? null;
  const specs = filterPackSpecs(GENERATED_PACKS, packIds);
  const packs = specs.map(buildPackPlanEntry);
  return {
    ok: true,
    totalExpected: packs.reduce((sum, pack) => sum + pack.expected, 0),
    packs,
  };
}

async function syncCatalogPackSpec(spec) {
  const collection = packCollectionId(spec.packName);
  const pack = game.packs.get(collection);
  const expected = Object.keys(spec.rows ?? {}).length;

  if (!pack) {
    console.warn(`Iron Hills | Pack not found: ${spec.packName}`);
    return {
      ok: false,
      packName: spec.packName,
      collection,
      expected,
      scanned: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      failed: 1,
      errors: [{ id: spec.packName, error: "pack-not-found" }],
    };
  }

  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  const byCatalogId = new Map();
  const byName = new Map();
  let duplicates = 0;

  for (const doc of docs) {
    const catalogId = getCatalogIdFromDoc(doc);
    if (catalogId) {
      if (byCatalogId.has(catalogId)) duplicates++;
      else byCatalogId.set(catalogId, doc);
    }
    if (doc.name && !byName.has(doc.name)) byName.set(doc.name, doc);
  }

  const cls = pack.documentClass;
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  const errors = [];

  for (const [id, row] of Object.entries(spec.rows ?? {})) {
    try {
      const data = spec.converter(row, id);
      if (!data) throw new Error("converter returned empty data");

      const catalogId = getCatalogIdFromData(data) || row?.id || id;
      const doc = byCatalogId.get(String(catalogId)) ?? byName.get(data.name);
      if (!doc) {
        await cls.create(data, { pack: collection });
        created++;
        continue;
      }

      const patch = buildCatalogDocumentPatch(doc, data);
      if (Object.keys(patch).length) {
        await doc.update(patch);
        updated++;
      } else {
        unchanged++;
      }
    } catch (err) {
      errors.push({ id, error: String(err?.message ?? err) });
      console.error(`Iron Hills | Error syncing ${spec.packName}/${id}:`, err);
    }
  }

  const failed = errors.length;
  return {
    ok: failed === 0,
    packName: spec.packName,
    collection,
    expected,
    scanned: docs.length,
    created,
    updated,
    unchanged,
    duplicates,
    failed,
    errors,
  };
}

export async function syncAllCatalogItemPacks(options = {}) {
  if (!game?.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиумы.");
    return { ok: false, total: 0, updated: 0, created: 0, failed: 1, results: [], errors: ["gm-required"] };
  }

  const specs = filterPackSpecs(CATALOG_ITEM_PACKS, options.packIds ?? null);
  const results = [];
  for (const spec of specs) {
    results.push(await syncCatalogPackSpec(spec));
  }

  const summary = {
    ok: results.every(result => result.ok),
    total: results.reduce((sum, result) => sum + Number(result.scanned ?? 0), 0),
    expected: results.reduce((sum, result) => sum + Number(result.expected ?? 0), 0),
    created: results.reduce((sum, result) => sum + Number(result.created ?? 0), 0),
    updated: results.reduce((sum, result) => sum + Number(result.updated ?? 0), 0),
    unchanged: results.reduce((sum, result) => sum + Number(result.unchanged ?? 0), 0),
    failed: results.reduce((sum, result) => sum + Number(result.failed ?? 0), 0),
    duplicates: results.reduce((sum, result) => sum + Number(result.duplicates ?? 0), 0),
    results,
  };

  const message = `Iron Hills | Catalog packs sync: created ${summary.created}, updated ${summary.updated}, failed ${summary.failed}.`;
  if (summary.failed) ui.notifications.warn(message);
  else ui.notifications.info(message);

  return summary;
}



async function emptyActorPack(packName) {
  const pack = game.packs.get(`iron-hills-system.${packName}`);
  if (!pack) return 0;
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  for (const doc of docs) await doc.delete();
  return docs.length;
}

// ── Основная функция заполнения ────────────────────────────

async function fillPack(packName, items, converter, options = {}) {
  const collection = packCollectionId(packName);
  const expected = Object.keys(items ?? {}).length;
  const pack = game.packs.get(collection);
  if (!pack) {
    console.warn(`Iron Hills | Pack not found: ${packName}`);
    return {
      ok: false,
      packName,
      collection,
      expected,
      deleted: 0,
      created: 0,
      failed: 1,
      errors: [{ id: packName, error: "pack-not-found" }],
    };
  }

  // Разблокируем компендиум
  await pack.configure({ locked: false });

  // Удаляем старое содержимое
  const existing = await pack.getDocuments();
  for (const doc of existing) await doc.delete();

  // Добавляем новые записи
  let count = 0;
  const errors = [];
  const cls = pack.documentClass;
  for (const [id, raw] of Object.entries(items)) {
    try {
      const data = converter(raw, id);
      if (!data) throw new Error("converter returned empty data");
      await cls.create(data, { pack: collection });
      count++;
    } catch(e) {
      errors.push({ id, error: String(e?.message ?? e) });
      console.error(`Iron Hills | Error creating ${id}:`, e);
    }
  }

  // Не блокируем — оставляем доступными для просмотра
  // (locked=true мешает открывать листы предметов)
  return {
    ok: errors.length === 0,
    packName,
    collection,
    label: options.label ?? packName,
    expected,
    deleted: existing.length,
    created: count,
    failed: errors.length,
    errors,
  };
}

/**
 * Подтягивает в компендиум поля из каталога WEAPONS (img, range, affixes, catalogId),
 * не удаляя записи — безопасно, если предметы уже на персонажах.
 */
export async function syncWeaponPackFromCatalog() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум.");
    return { updated: 0, total: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-weapons");
  if (!pack) {
    ui.notifications.error("Пак ih-weapons не найден.");
    return { updated: 0, total: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;

  for (const doc of docs) {
    let w = null;
    const cid = doc.getFlag?.("iron-hills-system", "catalogId");
    if (cid && WEAPONS[cid]) w = WEAPONS[cid];
    if (!w) w = Object.values(WEAPONS).find(x => x.label === doc.name);
    if (!w) continue;

    const patch = {};
    if (w.img && doc.img !== w.img) patch.img = w.img;
    if (w.range != null && Number(doc.system?.range ?? 0) !== Number(w.range)) {
      patch["system.range"] = w.range;
    }
    if (w.affixes && typeof w.affixes === "object") {
      patch["system.affixes"] = foundry.utils.deepClone(w.affixes);
    }

    const needsCatalogFlag = Boolean(w.id && (!cid || cid !== w.id));
    if (needsCatalogFlag) {
      const flags = foundry.utils.deepClone(doc.flags ?? {});
      flags["iron-hills-system"] = {
        ...(flags["iron-hills-system"] ?? {}),
        catalogId: w.id,
      };
      patch.flags = flags;
    }

    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | Компендиум оружия: обновлено записей ${updated} из ${docs.length}.`);
  return { updated, total: docs.length };
}

/**
 * Подтягивает в компендиум ih-armor поля из каталога ARMORS (img, protection, affixes, catalogId).
 */
export async function syncArmorPackFromCatalog() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум.");
    return { updated: 0, total: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-armor");
  if (!pack) {
    ui.notifications.error("Пак ih-armor не найден.");
    return { updated: 0, total: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;

  for (const doc of docs) {
    let a = null;
    const cid = doc.getFlag?.("iron-hills-system", "catalogId");
    if (cid && ARMORS[cid]) a = ARMORS[cid];
    if (!a) a = Object.values(ARMORS).find((x) => x.label === doc.name);
    if (!a) continue;

    const desiredArmorData = armorToItemData(a);
    const desiredSystem = desiredArmorData.system ?? {};
    const rawResist = a.resist ?? { physical: a.tier ?? 0 };
    const imgFromCatalogResist =
      typeof rawResist === "object" && rawResist !== null && typeof rawResist.img === "string"
        ? rawResist.img
        : undefined;
    const resist = (() => {
      const out = foundry.utils.deepClone(rawResist);
      if (typeof out === "object" && out !== null) delete out.img;
      return out;
    })();
    const patch = {};
    const conventionArmorImg = `systems/iron-hills-system/icons/items/armor/${a.id}.webp`;
    const desiredArmorImg = desiredArmorData.img ?? a.img ?? imgFromCatalogResist ?? conventionArmorImg;
    if (doc.img !== desiredArmorImg) patch.img = desiredArmorImg;

    const prot = doc.system?.protection ?? {};
    const desiredProtection = desiredSystem.protection ?? resist;
    const np = desiredProtection.physical ?? 0;
    const nm = desiredProtection.magical ?? 0;
    const cp = prot.physical ?? 0;
    const cm = prot.magical ?? 0;
    if (np !== cp || nm !== cm) {
      patch["system.protection"] = foundry.utils.deepClone(desiredProtection);
    }

    const syncSystemFields = [
      "slot",
      "tier",
      "weight",
      "value",
      "gridW",
      "gridH",
      "bulk",
      "durability",
      "covers",
      "armorClass",
      "armorClassLabel",
      "requirements",
      "requirementsLabel",
      "penalties",
    ];
    for (const field of syncSystemFields) {
      const desiredValue = desiredSystem[field];
      if (desiredValue === undefined) continue;
      const currentValue = doc.system?.[field];
      if (JSON.stringify(currentValue ?? null) !== JSON.stringify(desiredValue ?? null)) {
        patch[`system.${field}`] = foundry.utils.deepClone(desiredValue);
      }
    }

    if (a.affixes && typeof a.affixes === "object") {
      patch["system.affixes"] = foundry.utils.deepClone(a.affixes);
    }

    const needsCatalogFlag = Boolean(a.id && (!cid || cid !== a.id));
    if (needsCatalogFlag) {
      const flags = foundry.utils.deepClone(doc.flags ?? {});
      flags["iron-hills-system"] = {
        ...(flags["iron-hills-system"] ?? {}),
        catalogId: a.id,
      };
      patch.flags = flags;
    }

    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | Компендиум брони: обновлено записей ${updated} из ${docs.length}.`);
  return { updated, total: docs.length };
}

/**
 * Подтягивает в компендиум ih-potions поля из каталога POTIONS (img, effect, power, tier, value, catalogId).
 */
export async function syncPotionPackFromCatalog() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум.");
    return { updated: 0, total: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-potions");
  if (!pack) {
    ui.notifications.error("Пак ih-potions не найден.");
    return { updated: 0, total: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;

  for (const doc of docs) {
    let p = null;
    const cid = doc.getFlag?.("iron-hills-system", "catalogId");
    if (cid && POTIONS[cid]) p = POTIONS[cid];
    if (!p) p = Object.values(POTIONS).find((x) => x.label === doc.name);
    if (!p) continue;

    const patch = {};
    const imgPath = p.img ?? "icons/consumables/potions/potion-round-empty-green.webp";
    if (doc.img !== imgPath) patch.img = imgPath;

    const desired = potionToItemData(p);
    const action = potionActionConfig(p);
    if ((doc.system?.effect ?? "") !== (p.effect ?? "healHP")) patch["system.effect"] = p.effect ?? "healHP";
    if ((doc.system?.effectType ?? "") !== (p.effect ?? "healHP")) patch["system.effectType"] = p.effect ?? "healHP";
    if ((doc.system?.actionType ?? "") !== action.actionType) patch["system.actionType"] = action.actionType;
    if ((doc.system?.applicationScope ?? "") !== action.applicationScope) patch["system.applicationScope"] = action.applicationScope;
    if ((doc.system?.targetActorMode ?? "") !== action.targetActorMode) patch["system.targetActorMode"] = action.targetActorMode;
    if ((doc.system?.targetPart ?? "") !== action.targetPart) patch["system.targetPart"] = action.targetPart;
    for (const key of ["conditionKey", "conditionMode", "conditionValueKind", "duration"]) {
      if (!Object.prototype.hasOwnProperty.call(desired.system ?? {}, key)) continue;
      const desiredValue = desired.system?.[key];
      if ((doc.system?.[key] ?? "") !== desiredValue) patch[`system.${key}`] = desiredValue;
    }
    if (Number(doc.system?.power ?? 0) !== Number(p.power ?? 5)) patch["system.power"] = p.power ?? 5;
    if (Number(doc.system?.tier ?? 0) !== Number(p.tier ?? 1)) patch["system.tier"] = p.tier ?? 1;
    if (Number(doc.system?.value ?? 0) !== Number(p.value ?? 20)) patch["system.value"] = p.value ?? 20;
    const w = p.weight ?? 0.3;
    if (Number(doc.system?.weight ?? 0) !== Number(w)) patch["system.weight"] = w;

    const needsCatalogFlag = Boolean(p.id && (!cid || cid !== p.id));
    if (needsCatalogFlag) {
      const flags = foundry.utils.deepClone(doc.flags ?? {});
      flags["iron-hills-system"] = {
        ...(flags["iron-hills-system"] ?? {}),
        catalogId: p.id,
      };
      patch.flags = flags;
    }

    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | Компендиум зелий: обновлено записей ${updated} из ${docs.length}.`);
  return { updated, total: docs.length };
}

const DEFAULT_FOOD_IMG = "icons/consumables/food/bread-loaf-round-brown.webp";

/**
 * Подтягивает в компендиум ih-food поля из каталога FOOD (img, satiety, hydration, value, tier, bonus, catalogId).
 */
export async function syncFoodPackFromCatalog() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум.");
    return { updated: 0, total: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-food");
  if (!pack) {
    ui.notifications.error("Пак ih-food не найден.");
    return { updated: 0, total: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;

  for (const doc of docs) {
    let f = null;
    const cid = doc.getFlag?.("iron-hills-system", "catalogId");
    if (cid && FOOD[cid]) f = FOOD[cid];
    if (!f) f = Object.values(FOOD).find((x) => x.label === doc.name);
    if (!f) continue;

    const patch = {};
    const imgPath = f.img ?? DEFAULT_FOOD_IMG;
    if (doc.img !== imgPath) patch.img = imgPath;

    if (Number(doc.system?.satiety ?? 0) !== Number(f.satiety ?? 10)) patch["system.satiety"] = f.satiety ?? 10;
    if (Number(doc.system?.hydration ?? 0) !== Number(f.hydration ?? 5)) patch["system.hydration"] = f.hydration ?? 5;
    if (Number(doc.system?.value ?? 0) !== Number(f.value ?? 2)) patch["system.value"] = f.value ?? 2;
    if (Number(doc.system?.tier ?? 0) !== Number(f.tier ?? 1)) patch["system.tier"] = f.tier ?? 1;
    const w = f.weight ?? 0.5;
    if (Number(doc.system?.weight ?? 0) !== Number(w)) patch["system.weight"] = w;

    const gw = f.gridW ?? 1;
    const gh = f.gridH ?? 1;
    if (Number(doc.system?.gridW ?? 1) !== gw) patch["system.gridW"] = gw;
    if (Number(doc.system?.gridH ?? 1) !== gh) patch["system.gridH"] = gh;

    if (f.bonus && typeof f.bonus === "object") {
      const next = foundry.utils.deepClone(f.bonus);
      if (JSON.stringify(doc.system?.bonus ?? null) !== JSON.stringify(next)) {
        patch["system.bonus"] = next;
      }
    }

    const needsCatalogFlag = Boolean(f.id && (!cid || cid !== f.id));
    if (needsCatalogFlag) {
      const flags = foundry.utils.deepClone(doc.flags ?? {});
      flags["iron-hills-system"] = {
        ...(flags["iron-hills-system"] ?? {}),
        catalogId: f.id,
      };
      patch.flags = flags;
    }

    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | Компендиум еды: обновлено записей ${updated} из ${docs.length}.`);
  return { updated, total: docs.length };
}


function spellToItem(s) {
  return spellToItemData(s);
}

/**
 * Приводит записи ih-npc (если остались вручную) к specialization; выравнивает лут:
 * таблицы сброшены (добыча/карман с листа), явные ключи перезапишутся при forceLoot или рассогласовании.
 * Консоль: await game.ironHills.syncNpcPackLootFromProfiles({ forceLoot: true })
 *
 * @param {{ forceLoot?: boolean }} options — forceLoot: переписать лут даже при совпадении с каноном
 */
export async function syncNpcPackLootFromProfiles(options = {}) {
  const forceLoot = !!options.forceLoot;
  if (!game?.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать NPC-компендиум.");
    return { updated: 0, scanned: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-npc");
  if (!pack) {
    ui.notifications.error("Пак ih-npc не найден.");
    return { updated: 0, scanned: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;
  let scanned = 0;

  for (const doc of docs) {
    if (doc.type !== "npc") continue;
    scanned++;
    const key = resolveNpcProfileKey(doc);
    if (!key) continue;
    const prof = NPC_ROLE_PROFILES[key];
    if (!prof) continue;

    const tier = Math.max(1, Math.min(10, Number(doc.system?.info?.tier ?? 1)));
    const wantLoot = "";
    const wantPick = "";
    const curLoot = String(doc.system?.info?.lootTable ?? "").trim();
    const curPick = String(doc.system?.info?.pickpocketTable ?? "").trim();
    const spec = String(doc.system?.info?.specialization ?? "").trim();
    const label = String(doc.system?.info?.role ?? "").trim();
    const labelBad = label !== prof.label;
    const specBad = spec !== key;
    const wantImg = getNpcRoleImage(key, tier);
    const curTokenImg = String(doc.prototypeToken?.texture?.src ?? "").trim();
    const needLootRebuild =
      forceLoot || curLoot !== wantLoot || curPick !== wantPick || labelBad || specBad;

    const patch = {};
    if (needLootRebuild) {
      patch["system.info.lootTable"] = wantLoot;
      patch["system.info.allowPickpocket"] = true;
      patch["system.info.pickpocketTable"] = wantPick;
    }
    if (specBad) patch["system.info.specialization"] = key;
    if (labelBad) patch["system.info.role"] = prof.label;
    if (doc.img !== wantImg) patch.img = wantImg;
    if (curTokenImg !== wantImg) patch["prototypeToken.texture.src"] = wantImg;
    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | ih-npc: обновлено ${updated} из ${scanned} NPC.`);
  return { updated, scanned };
}

const IH_MONSTERS_PACK = "iron-hills-system.ih-monsters";

/**
 * Совмещает компендиум монстров с `MONSTER_BESTIARY` (= одному промпту на строку в monsters-prompts.md):
 * удаляет записи без известного id, дубликаты ключей и лишнее; добавляет недостающих.
 *
 * Консоль (GM): `await game.ironHills.syncMonsterPackToBestiary()`
 *
 * @param {{ patchFields?: boolean }} [options] patchFields: lootPool / bestiaryId / role + слоты разделки по бестиарию (по умолчанию true)
 */
export async function syncMonsterPackToBestiary(options = {}) {
  const patchFields = options.patchFields !== false;

  if (!game?.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум монстров.");
    return { deleted: 0, created: 0, patched: 0, canon: 0 };
  }
  const pack = game.packs.get(IH_MONSTERS_PACK);
  if (!pack) {
    ui.notifications.error("Пак ih-monsters не найден.");
    return { deleted: 0, created: 0, patched: 0, canon: 0 };
  }
  await pack.configure({ locked: false });

  const cls = pack.documentClass;
  const docs = await pack.getDocuments();

  const byKey = new Map();
  const surplus = [];

  for (const doc of docs) {
    if (doc.type !== "monster") {
      surplus.push(doc);
      continue;
    }
    const key = resolveMonsterPackDocToBestiaryId(doc);
    if (!key) {
      surplus.push(doc);
      continue;
    }
    if (byKey.has(key)) {
      surplus.push(doc);
      continue;
    }
    byKey.set(key, doc);
  }

  let deleted = 0;
  for (const doc of surplus) {
    await doc.delete();
    deleted++;
  }

  let created = 0;
  let patched = 0;
  const canonKeys = Object.keys(MONSTER_BESTIARY);

  for (const key of canonKeys) {
    const row = MONSTER_BESTIARY[key];
    let doc = byKey.get(key);
    if (!doc) {
      await cls.create(monsterRowToActorData(row), { pack: IH_MONSTERS_PACK });
      created++;
      continue;
    }
    if (patchFields && row) {
      const patch = {};
      const bid = String(doc.system?.info?.bestiaryId ?? "").trim();
      const role = String(doc.system?.info?.role ?? "").trim();
      const curPool = String(doc.system?.info?.lootPool ?? "").trim();
      const wantPool = String(row.lootPool ?? "").trim();
      const legacyLt = String(doc.system?.info?.lootTable ?? "").trim();
      if (bid !== key) patch["system.info.bestiaryId"] = key;
      if (role !== key) patch["system.info.role"] = key;
      if (wantPool !== curPool) patch["system.info.lootPool"] = wantPool;
      if (legacyLt !== "") patch["system.info.lootTable"] = "";
      const wantTier = Number(row.tier ?? 1);
      if (Number(doc.system?.info?.tier ?? 0) !== wantTier) patch["system.info.tier"] = wantTier;
      const wantImg = row.img ?? doc.img;
      if (wantImg && doc.img !== wantImg) patch.img = wantImg;
      const curTokenImg = String(doc.prototypeToken?.texture?.src ?? "").trim();
      if (wantImg && curTokenImg !== wantImg) patch["prototypeToken.texture.src"] = wantImg;

      if (Object.keys(patch).length) {
        await doc.update(patch);
        patched++;
      }
      const live = await pack.getDocument(doc.id);
      await replaceMonsterHarvestEmbeddedItems(live, wantPool);
    }
  }

  ui.notifications.info(
    `Iron Hills | ih-monsters: удалено лишних ${deleted}, добавлено ${created}, патч полей ${patched}; в бестиарии всего ${canonKeys.length} (строго под промпты).`
  );
  return { deleted, created, patched, canon: canonKeys.length };
}

export async function buildCompendiums(options = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может заполнять компендиумы.");
    return { ok: false, total: 0, results: [], errors: ["gm-required"] };
  }

  ui.notifications.info("Iron Hills | Заполняем компендиумы...");

  const results = [];
  const specs = filterPackSpecs(GENERATED_PACKS, options.packIds ?? null);

  if (options.clearNpcPack) {
    const deleted = await emptyActorPack("ih-npc");
    results.push({
      ok: true,
      packName: "ih-npc",
      collection: packCollectionId("ih-npc"),
      label: "NPC",
      expected: 0,
      deleted,
      created: 0,
      failed: 0,
      errors: [],
      note: "cleared-empty-npc-pack",
    });
  }

  for (const spec of specs) {
    results.push(await fillPack(spec.packName, spec.rows, spec.converter, { label: spec.label }));
  }

  const total = results.reduce((sum, result) => sum + Number(result.created ?? 0), 0);
  const expected = results.reduce((sum, result) => sum + Number(result.expected ?? 0), 0);
  const failed = results.reduce((sum, result) => sum + Number(result.failed ?? 0), 0);
  const message = `Iron Hills | Compendiums built: ${total}/${expected} created, ${failed} failed.`;
  if (failed) ui.notifications.warn(message);
  else ui.notifications.info(message);
  console.log("Iron Hills | Compendiums built:", results);
  return {
    ok: failed === 0,
    total,
    expected,
    failed,
    results,
    packs: Object.fromEntries(results.map(result => [result.packName, result])),
  };
}

export async function initCompendiums() {
  if (!game.user?.isGM) return;

  // Разблокируем все компендиумы системы чтобы можно было открывать листы
  const packIds = [
    "ih-weapons","ih-armor","ih-materials","ih-potions","ih-spells",
    "ih-food","ih-tools","ih-npc","ih-gods",
    "ih-belts","ih-backpacks","ih-attachments",
    "ih-monsters","ih-consumables","ih-throwables",
  ];
  for (const id of packIds) {
    const pack = game.packs.get(`iron-hills-system.${id}`);
    if (pack?.locked) {
      await pack.configure({ locked: false });
    }
  }

  // Проверяем не заполнены ли уже
  const weaponPack = game.packs.get("iron-hills-system.ih-weapons");
  if (!weaponPack) return;

  const docs = await weaponPack.getDocuments();
  if (docs.length > 0) return; // уже заполнено

  console.log("Iron Hills | Первый запуск — заполняем компендиумы...");
  await buildCompendiums();
}
