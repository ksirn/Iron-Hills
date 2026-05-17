/**
 * Пул добычи разделки монстра: каждая строка — возможный loot на листе с шансом (0–100).
 * Связано с монстром через system.info.lootPool (ключ этого объекта).
 * Инвентарь при синхронизации получает встроенные Item с пометкой harvestLoot.
 */

/** @typedef {{ weight: number, loot: { type: "food"|"material", catalogId: string, qty: number | number[] } }} WeightedLootRow */

/**
 * Преобразование старых взвешенных таблиц: ориентировочная вероятность «выпало бы хотя бы раз за n независимых черпаний».
 * @param {{ numRolls?: number, rolls: WeightedLootRow[] }} def
 * @returns {{ type: string, catalogId: string, qtyMin: number, qtyMax: number, chancePct: number }[]}
 */
export function rollsToHarvestDrops(def) {
  if (!def?.rolls?.length) return [];
  const n = Math.max(1, Number(def.numRolls) || 1);
  const rolls = def.rolls.filter((r) => r && Number(r.weight) > 0);
  const sumW = rolls.reduce((a, r) => a + Number(r.weight), 0);
  const out = [];
  for (const row of rolls) {
    const w = Number(row.weight);
    const l = row.loot;
    if (!l?.catalogId || sumW <= 0) continue;
    const p = Math.min(1, Math.max(0, w / sumW));
    const chancePct = Math.max(5, Math.min(95, Math.round(100 * (1 - Math.pow(1 - p, n)))));
    const qty = l.qty;
    let qtyMin = 1;
    let qtyMax = 1;
    if (typeof qty === "number") {
      qtyMin = qtyMax = Math.max(1, qty);
    } else if (Array.isArray(qty) && qty.length) {
      qtyMin = Math.max(1, Number(qty[0]) || 1);
      qtyMax = Math.max(qtyMin, Number(qty[1] ?? qty[0]) || qtyMin);
    }
    out.push({
      type: l.type,
      catalogId: l.catalogId,
      qtyMin,
      qtyMax,
      chancePct,
    });
  }
  return out;
}

/** Исходные веса (те же ключи, что исторически были в старых таблицах охоты). */
const RAW_MONSTER_LOOT_TABLES = {
  vermin_bundle_t1: {
    numRolls: 2,
    rolls: [
      { weight: 45, loot: { type: "food", catalogId: "game_meat_raw", qty: [1, 2] } },
      { weight: 25, loot: { type: "material", catalogId: "wisp_moth_powder", qty: 1 } },
      { weight: 20, loot: { type: "material", catalogId: "fang_shard", qty: [1, 2] } },
      { weight: 10, loot: { type: "material", catalogId: "beast_sinew_spool", qty: 1 } },
    ],
  },
  predator_scrap_t1: {
    numRolls: 2,
    rolls: [
      { weight: 40, loot: { type: "food", catalogId: "game_meat_raw", qty: [1, 3] } },
      { weight: 30, loot: { type: "material", catalogId: "small_pelt_uncured", qty: 1 } },
      { weight: 20, loot: { type: "material", catalogId: "animal_hide", qty: 1 } },
      { weight: 10, loot: { type: "material", catalogId: "beast_sinew_spool", qty: [1, 2] } },
    ],
  },
  wetland_glean_t2: {
    numRolls: 2,
    rolls: [
      { weight: 35, loot: { type: "food", catalogId: "serpent_fillet_raw", qty: [1, 2] } },
      { weight: 35, loot: { type: "food", catalogId: "game_meat_rich", qty: [1, 2] } },
      { weight: 18, loot: { type: "material", catalogId: "serpent_sac_mild", qty: 1 } },
      { weight: 12, loot: { type: "material", catalogId: "mushroom_bog", qty: [1, 2] } },
    ],
  },
  brute_carve_t2: {
    numRolls: 2,
    rolls: [
      { weight: 40, loot: { type: "food", catalogId: "game_meat_rich", qty: [2, 3] } },
      { weight: 28, loot: { type: "material", catalogId: "thick_hide", qty: [1, 2] } },
      { weight: 22, loot: { type: "material", catalogId: "bristle_keg_rings", qty: 1 } },
      { weight: 10, loot: { type: "material", catalogId: "fang_shard", qty: [2, 3] } },
    ],
  },
  alpine_harvest_t3: {
    numRolls: 3,
    rolls: [
      { weight: 35, loot: { type: "food", catalogId: "highland_grub_haunch", qty: [1, 2] } },
      { weight: 25, loot: { type: "food", catalogId: "game_meat_rich", qty: [1, 2] } },
      { weight: 22, loot: { type: "material", catalogId: "avian_keel_bone", qty: 1 } },
      { weight: 18, loot: { type: "material", catalogId: "herb_healing", qty: [1, 2] } },
    ],
  },
  pack_leader_t3: {
    numRolls: 3,
    rolls: [
      { weight: 45, loot: { type: "food", catalogId: "game_meat_rich", qty: [2, 4] } },
      { weight: 30, loot: { type: "material", catalogId: "alpha_musk_gland", qty: 1 } },
      { weight: 15, loot: { type: "material", catalogId: "scale_hide", qty: [1, 2] } },
      { weight: 10, loot: { type: "material", catalogId: "monster_gland", qty: [1, 1] } },
    ],
  },
  apex_slice_t4: {
    numRolls: 3,
    rolls: [
      { weight: 42, loot: { type: "food", catalogId: "wyvern_stringy_cut", qty: [1, 3] } },
      { weight: 25, loot: { type: "material", catalogId: "wyvern_sinew_filament", qty: 1 } },
      { weight: 18, loot: { type: "material", catalogId: "predator_resin_mass", qty: 1 } },
      { weight: 15, loot: { type: "material", catalogId: "drake_scale", qty: [1, 2] } },
    ],
  },
  brute_prize_t5: {
    numRolls: 3,
    rolls: [
      { weight: 40, loot: { type: "food", catalogId: "caravan_roast", qty: 1 } },
      { weight: 35, loot: { type: "food", catalogId: "wyvern_stringy_cut", qty: [2, 4] } },
      { weight: 25, loot: { type: "material", catalogId: "drake_scale", qty: [2, 4] } },
    ],
  },
  kaiju_shard_t6: {
    numRolls: 4,
    rolls: [
      { weight: 35, loot: { type: "food", catalogId: "wyvern_stringy_cut", qty: [3, 5] } },
      { weight: 30, loot: { type: "material", catalogId: "warg_pelt", qty: [1, 2] } },
      { weight: 20, loot: { type: "material", catalogId: "wyvern_hide", qty: 1 } },
      { weight: 15, loot: { type: "material", catalogId: "venom_sac", qty: [1, 2] } },
    ],
  },
  beast_lord_t7: {
    numRolls: 5,
    rolls: [
      { weight: 32, loot: { type: "food", catalogId: "wyvern_stringy_cut", qty: [4, 6] } },
      { weight: 28, loot: { type: "material", catalogId: "wyvern_hide", qty: [1, 2] } },
      { weight: 22, loot: { type: "material", catalogId: "drake_scale", qty: [2, 4] } },
      { weight: 12, loot: { type: "material", catalogId: "venom_sac", qty: [1, 2] } },
      { weight: 6, loot: { type: "material", catalogId: "monster_gland", qty: [1, 2] } },
    ],
  },
  beast_lord_t8: {
    numRolls: 5,
    rolls: [
      { weight: 28, loot: { type: "food", catalogId: "wyvern_stringy_cut", qty: [5, 8] } },
      { weight: 28, loot: { type: "material", catalogId: "wyvern_hide", qty: [1, 2] } },
      { weight: 24, loot: { type: "material", catalogId: "drake_scale", qty: [3, 5] } },
      { weight: 14, loot: { type: "material", catalogId: "predator_resin_mass", qty: [1, 2] } },
      { weight: 6, loot: { type: "material", catalogId: "venom_sac", qty: [2, 4] } },
    ],
  },
  beast_lord_t9: {
    numRolls: 6,
    rolls: [
      { weight: 26, loot: { type: "food", catalogId: "wyvern_stringy_cut", qty: [6, 10] } },
      { weight: 26, loot: { type: "material", catalogId: "warg_pelt", qty: [2, 3] } },
      { weight: 22, loot: { type: "material", catalogId: "wyvern_hide", qty: [2, 3] } },
      { weight: 14, loot: { type: "material", catalogId: "monster_gland", qty: [1, 2] } },
      { weight: 8, loot: { type: "material", catalogId: "fang_shard", qty: [6, 10] } },
      { weight: 4, loot: { type: "material", catalogId: "alpha_musk_gland", qty: [1, 2] } },
    ],
  },
  primordial_harvest_t10: {
    numRolls: 6,
    rolls: [
      { weight: 24, loot: { type: "food", catalogId: "wyvern_stringy_cut", qty: [8, 12] } },
      { weight: 22, loot: { type: "material", catalogId: "wyvern_hide", qty: [3, 4] } },
      { weight: 20, loot: { type: "material", catalogId: "drake_scale", qty: [4, 7] } },
      { weight: 16, loot: { type: "material", catalogId: "predator_resin_mass", qty: [2, 3] } },
      { weight: 14, loot: { type: "material", catalogId: "monster_gland", qty: [2, 4] } },
      { weight: 4, loot: { type: "material", catalogId: "alpha_musk_gland", qty: [2, 3] } },
    ],
  },
};

/** @type {Record<string, ReturnType<typeof rollsToHarvestDrops>>} */
export const MONSTER_HARVEST_DROP_POOLS = Object.fromEntries(
  Object.entries(RAW_MONSTER_LOOT_TABLES).map(([k, v]) => [k, rollsToHarvestDrops(v)])
);

export function listMonsterLootPoolKeys() {
  return Object.keys(MONSTER_HARVEST_DROP_POOLS).sort();
}

export function getMonsterHarvestDropLines(poolKey) {
  const k = String(poolKey || "").trim();
  return MONSTER_HARVEST_DROP_POOLS[k] ?? [];
}
