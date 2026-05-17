/**
 * Строитель Item из строк каталоговой добычи (еда / материал).
 */
import { MATERIALS, FOOD } from "../constants/items-catalog.mjs";

function buildFoodItemData(catalogId, qty) {
  const f = FOOD[catalogId];
  if (!f) return null;
  const defaultImg = "icons/consumables/food/meat-haunch-red.webp";
  const q = Math.max(1, Number(qty) || 1);
  return {
    name: f.label,
    type: "food",
    img: f.img ?? defaultImg,
    flags: {
      "iron-hills-system": {
        catalogId: f.id,
      },
    },
    system: {
      tier: f.tier ?? 1,
      quality: "common",
      weight: Number(f.weight ?? 0.5) * q,
      quantity: q,
      satiety: Number(f.satiety ?? 0),
      hydration: Number(f.hydration ?? 0),
      value: Number(f.value ?? 1) * q,
      gridW: f.gridW ?? 1,
      gridH: f.gridH ?? 1,
    },
  };
}

function buildMaterialItemData(catalogId, qty) {
  const m = MATERIALS[catalogId];
  if (!m) return null;
  const conv = `systems/iron-hills-system/icons/items/materials/${m.id}.webp`;
  const q = Math.max(1, Number(qty) || 1);
  return {
    name: m.label,
    type: "material",
    img: m.img ?? conv,
    flags: {
      "iron-hills-system": { catalogId: m.id },
    },
    system: {
      tier: m.tier ?? 1,
      category: m.category ?? "misc",
      weight: Number(m.weight ?? 1) * q,
      quantity: q,
      value: Number(m.value ?? 0) * q,
      quality: "common",
      gridW: 1,
      gridH: 1,
    },
  };
}

/** @returns {object|null} */
export function itemDataFromLootLine(line) {
  if (!line?.catalogId) return null;
  if (line.type === "food") return buildFoodItemData(line.catalogId, line.qty);
  if (line.type === "material") return buildMaterialItemData(line.catalogId, line.qty);
  return null;
}
