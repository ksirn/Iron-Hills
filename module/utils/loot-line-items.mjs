/**
 * Shared Item builder for catalog loot lines.
 *
 * World generation, NPC carry loot, harvest results, containers, and merchant
 * stock should pass through this helper instead of hand-building the same item
 * shapes in multiple places.
 */
import {
  ARMORS,
  ATTACHMENTS,
  BACKPACKS,
  BELTS,
  CONSUMABLES,
  DRINK_VESSELS,
  FOOD,
  MATERIALS,
  MEDICAL_CONSUMABLES,
  POTIONS,
  THROWABLES,
  TOOLS,
  WEAPONS,
} from "../constants/items-catalog.mjs";
import { SPELLS } from "../constants/spells-catalog.mjs";
import {
  armorToItemData,
  attachmentToItemData,
  backpackToItemData,
  beltToItemData,
  consumableToItemData,
  drinkVesselToItemData,
  foodToItemData,
  materialToItemData,
  medicalConsumableToItemData,
  potionToItemData,
  spellToItemData,
  throwableToItemData,
  toolToItemData,
  weaponToItemData,
} from "./catalog-item-data.mjs";

const CATALOG_BUILDERS = Object.freeze({
  armor: { rows: ARMORS, converter: armorToItemData },
  attachment: { rows: ATTACHMENTS, converter: attachmentToItemData },
  backpack: { rows: BACKPACKS, converter: backpackToItemData },
  belt: { rows: BELTS, converter: beltToItemData },
  consumable: { rows: CONSUMABLES, converter: consumableToItemData },
  drink_vessel: { rows: DRINK_VESSELS, converter: drinkVesselToItemData },
  food: { rows: FOOD, converter: foodToItemData },
  material: { rows: MATERIALS, converter: materialToItemData },
  medical: { rows: MEDICAL_CONSUMABLES, converter: medicalConsumableToItemData },
  medical_consumable: { rows: MEDICAL_CONSUMABLES, converter: medicalConsumableToItemData },
  potion: { rows: POTIONS, converter: potionToItemData },
  spell: { rows: SPELLS, converter: spellToItemData },
  throwable: { rows: THROWABLES, converter: throwableToItemData },
  tool: { rows: TOOLS, converter: toolToItemData },
  weapon: { rows: WEAPONS, converter: weaponToItemData },
});

function cleanQuantity(value) {
  return Math.max(1, Math.floor(Number(value) || 1));
}

export function getCatalogLootLineBuilder(type) {
  return CATALOG_BUILDERS[String(type ?? "").trim()] ?? null;
}

export function getCatalogLootLineTypes() {
  return Object.keys(CATALOG_BUILDERS).sort();
}

export function catalogItemDataFromId(type, catalogId, { quantity = 1, initialCharges = null } = {}) {
  const builder = getCatalogLootLineBuilder(type);
  if (!builder || !catalogId) return null;

  const row = builder.rows?.[catalogId];
  if (!row) return null;

  return builder.converter(row, {
    quantity: cleanQuantity(quantity),
    initialCharges,
  });
}

/** @returns {object|null} */
export function itemDataFromLootLine(line) {
  if (!line?.catalogId) return null;
  return catalogItemDataFromId(line.type, line.catalogId, {
    quantity: line.qty ?? line.quantity ?? 1,
    initialCharges: line.initialCharges ?? null,
  });
}
