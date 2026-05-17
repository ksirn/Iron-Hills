/**
 * Проверяет, что все catalogId в пулах добычи монстров (monster-loot-pools) есть в FOOD или MATERIALS.
 *
 *   node tools/validate-wild-loot-catalog.mjs
 */
import { MONSTER_HARVEST_DROP_POOLS } from "../module/constants/monster-loot-pools.mjs";
import { FOOD, MATERIALS } from "../module/constants/items-catalog.mjs";

let failed = false;
for (const [poolKey, lines] of Object.entries(MONSTER_HARVEST_DROP_POOLS)) {
  for (const row of lines ?? []) {
    const { type, catalogId } = row ?? {};
    if (!catalogId) {
      console.error(`Iron Hills | ${poolKey}: пустой catalogId`);
      failed = true;
      continue;
    }
    const okFood = FOOD[catalogId];
    const okMat = MATERIALS[catalogId];
    if (type === "food" && !okFood) {
      console.error(`Iron Hills | ${poolKey}: нет FOOD[${catalogId}]`);
      failed = true;
    }
    if (type === "material" && !okMat) {
      console.error(`Iron Hills | ${poolKey}: нет MATERIALS[${catalogId}]`);
      failed = true;
    }
    if (type !== "food" && type !== "material") {
      console.error(`Iron Hills | ${poolKey}: неизвестный type «${type}» для ${catalogId}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("Iron Hills | monster-loot-pools: все catalogId валидны.");
