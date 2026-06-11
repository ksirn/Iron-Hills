import { normalizeItemDataForInventory } from "./catalog-item-data.mjs";

function cleanNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanPositive(value, fallback = 1) {
  const parsed = cleanNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
}

function resultValue(type, power) {
  if (type === "throwable") return Math.max(8, Math.round(power * 8));
  if (type === "consumable") return Math.max(5, Math.round(power * 5));
  if (type === "food") return Math.max(2, Math.round(power * 2));
  return Math.max(10, Math.round(power * 6));
}

function resultImage(type) {
  if (type === "throwable") return "icons/commodities/materials/bowl-powder-red.webp";
  if (type === "food") return "icons/consumables/food/bowl-stew-brown.webp";
  if (type === "consumable") return "icons/consumables/potions/bottle-bulb-empty-green.webp";
  return "icons/svg/potion.svg";
}

export function buildAlchemyResultItemData(mixResult, {
  tier = 1,
  quality = "common",
  quantity = 1,
} = {}) {
  const ruleResult = mixResult?.rule?.result ?? null;
  if (!ruleResult || mixResult?.failed) return null;

  const type = ruleResult.type ?? "potion";
  const power = cleanPositive(mixResult.power, 1);
  const itemTier = Math.max(1, Math.round(cleanNumber(tier, 1)));
  const system = {
    tier: itemTier,
    quality,
    quantity: Math.max(1, Math.floor(cleanNumber(quantity, 1))),
    weight: type === "throwable" ? 0.6 : type === "food" ? 0.5 : type === "consumable" ? 0.2 : 0.3,
    power,
    value: cleanPositive(ruleResult.value, resultValue(type, power)),
  };

  if (type === "food") {
    system.hydration = Math.max(0, Math.floor(cleanNumber(mixResult.hydration, 0)));
    system.satiety = Math.max(0, Math.floor(cleanNumber(mixResult.satiety, 0)));
  } else if (type === "throwable") {
    const aoeDistance = Math.max(1, Math.min(3, Math.ceil(power / 4)));
    system.effectType = "damage";
    system.damageType = ruleResult.damageType ?? "magical";
    system.energyCost = cleanPositive(ruleResult.energyCost, 8 + itemTier);
    system.targetPart = ruleResult.targetPart ?? "torso";
    system.targetZone = ruleResult.targetZone ?? "";
    system.friendlyFire = Boolean(ruleResult.friendlyFire ?? false);
    system.friendlyFireMode = ruleResult.friendlyFireMode ?? "auto";
    system.aoe = {
      type: ruleResult.aoe?.type ?? "blast",
      shape: ruleResult.aoe?.shape ?? "circle",
      distance: cleanPositive(ruleResult.aoe?.distance, aoeDistance),
      maxTargets: ruleResult.aoe?.maxTargets ?? null,
      chainDecay: cleanPositive(ruleResult.aoe?.chainDecay, 1),
      targetZoneMode: ruleResult.aoe?.targetZoneMode ?? "random",
      friendlyFireMode: ruleResult.aoe?.friendlyFireMode ?? "auto",
    };
    system.appliesPoison = Math.max(0, cleanNumber(ruleResult.appliesPoison, 0));
    system.appliesBurning = Math.max(
      0,
      cleanNumber(
        ruleResult.appliesBurning,
        ruleResult.effectType === "burn" ? Math.max(1, Math.ceil(power / 3)) : 0,
      ),
    );
  } else {
    system.effect = ruleResult.effectType ?? "";
    system.effectType = ruleResult.effectType ?? "";
    system.targetPart = ruleResult.targetPart ?? (["heal", "healHP"].includes(ruleResult.effectType) ? "torso" : "");
  }

  return normalizeItemDataForInventory({
    name: ruleResult.name ?? "Alchemy Result",
    type,
    img: ruleResult.img ?? resultImage(type),
    flags: {
      "iron-hills-system": {
        generated: true,
        generatedType: "alchemy",
      },
    },
    system,
  }, { quantity: system.quantity });
}
