import { getMonsterHarvestDropLines } from "../constants/monster-loot-pools.mjs";
import { itemDataFromLootLine } from "./loot-line-items.mjs";

function qtyFromRange(minQ, maxQ) {
  const lo = Math.min(minQ, maxQ);
  const hi = Math.max(minQ, maxQ);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

/**
 * Готовые данные встроенных предметов «возможная добыча» для актёра monster.
 * @param {string} lootPoolKey — ключ MONSTER_HARVEST_DROP_POOLS
 * @returns {object[]} массив для createEmbeddedDocuments("Item", …)
 */
export function buildMonsterHarvestEmbeddedItemData(lootPoolKey) {
  const lines = getMonsterHarvestDropLines(lootPoolKey);
  if (!lines.length) return [];

  const out = [];
  for (const ln of lines) {
    const q = qtyFromRange(ln.qtyMin, ln.qtyMax);
    const data = itemDataFromLootLine({
      type: ln.type,
      catalogId: ln.catalogId,
      qty: q,
    });
    if (!data) continue;
    const ih = data.flags?.["iron-hills-system"] ?? {};
    data.flags = {
      ...data.flags,
      "iron-hills-system": {
        ...ih,
        harvestLoot: true,
        harvestChancePct: Math.max(1, Math.min(100, Number(ln.chancePct) || 50)),
      },
    };
    out.push(data);
  }
  return out;
}

export function monsterActorHasHarvestLootItems(actorDoc) {
  if (!actorDoc?.items?.size) return false;
  for (const it of actorDoc.items) {
    if (it?.getFlag?.("iron-hills-system", "harvestLoot")) return true;
  }
  return false;
}

/** Удаляет встроенные слоты разделки и создаёт их заново из пула (компендиум / GM-синк). */
export async function replaceMonsterHarvestEmbeddedItems(actorDoc, lootPoolKey) {
  if (!actorDoc?.deleteEmbeddedDocuments) return;
  const dels = [
    ...(actorDoc.items?.filter?.((it) => it.getFlag?.("iron-hills-system", "harvestLoot")) ?? []),
  ].map((i) => i.id);
  if (dels.length) await actorDoc.deleteEmbeddedDocuments("Item", dels);
  const chunk = buildMonsterHarvestEmbeddedItemData(lootPoolKey);
  if (chunk.length) await actorDoc.createEmbeddedDocuments("Item", chunk);
}
