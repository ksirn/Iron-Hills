import {
  getComputedItemUnitPrice,
  cloneItemDataForTransfer,
  buildItemStackSignatureFromData,
  buildItemStackSignature,
  getItemQuickSlotIcon,
  itemTypeLabel
} from "../utils/item-utils.mjs";
import {
  getActorCurrency,
  getMerchantWealth,
  getMerchantMarkup,
  getPersistentActor,
  getLiveActor,
  getPersistentItemFromActor,
  getLiveItemFromActor
} from "../utils/actor-utils.mjs";
import { recalculateActorWeight, removeQuantityFromItem } from "./inventory-service.mjs";
import { getSettlementActorByName, getSettlementTradeState } from "./actor-state-service.mjs";
import { debugLog, debugWarn, debugError } from "../utils/debug-utils.mjs";

export function getRelationScoreForTarget(characterActor, targetType, targetName) {
  if (!characterActor?.name) return 0;

  const relation = game.actors.find(a =>
    a.type === "relation" &&
    (a.system.info?.characterName || "") === characterActor.name &&
    (a.system.info?.targetType || "") === targetType &&
    (a.system.info?.targetName || "") === targetName
  );

  return Number(relation?.system?.info?.score ?? 0);
}

export function getBestTradeRelationScore(characterActor, merchantActor) {
  if (!characterActor || !merchantActor) return 0;

  const settlementName = merchantActor.system?.info?.settlement || "";
  const factionName = merchantActor.system?.info?.faction || "";

  const settlementScore = settlementName
    ? getRelationScoreForTarget(characterActor, "settlement", settlementName)
    : 0;

  const factionScore = factionName
    ? getRelationScoreForTarget(characterActor, "faction", factionName)
    : 0;

  return Math.max(settlementScore, factionScore);
}

export function getTradePriceModifiers(characterActor, merchantActor) {
  const relationScore = getBestTradeRelationScore(characterActor, merchantActor);

  let buyModifier = 1;
  let sellModifier = 1;

  if (relationScore >= 80) {
    buyModifier = 0.8;
    sellModifier = 1.2;
  } else if (relationScore >= 50) {
    buyModifier = 0.88;
    sellModifier = 1.12;
  } else if (relationScore >= 20) {
    buyModifier = 0.94;
    sellModifier = 1.06;
  } else if (relationScore <= -50) {
    buyModifier = 1.3;
    sellModifier = 0.7;
  } else if (relationScore <= -20) {
    buyModifier = 1.15;
    sellModifier = 0.85;
  }

  return {
    relationScore,
    buyModifier,
    sellModifier
  };
}

export function getItemTradeCategory(item) {
  const type = item?.type ?? "";

  if (type === "weapon") return "arms";
  if (type === "armor") return "arms";
  if (type === "throwable") return "arms";

  if (type === "potion") return "alchemy";
  if (type === "scroll") return "alchemy";
  if (type === "consumable") return "alchemy";

  if (type === "food") return "provisions";
  if (type === "resource") return "provisions";

  if (type === "tool") return "tools";
  if (type === "material") return "materials";
  if (type === "spell") return "arcane";

  return "general";
}

export function getMerchantSpecialtyModifier(item, merchantActor) {
  const specialty = String(merchantActor?.system?.info?.specialty || "").toLowerCase();
  const category = getItemTradeCategory(item);

  if (!specialty) return 1;

  if (specialty === "blacksmith") {
    if (category === "arms") return 0.82;
    if (category === "tools") return 0.9;
    return 1.08;
  }

  if (specialty === "alchemist") {
    if (category === "alchemy") return 0.82;
    if (category === "arcane") return 0.9;
    return 1.1;
  }

  if (specialty === "hunter") {
    if (category === "provisions") return 0.86;
    if (category === "arms") return 0.95;
    return 1.08;
  }

  if (specialty === "innkeeper") {
    if (category === "provisions") return 0.84;
    return 1.12;
  }

  if (specialty === "general") {
    return 0.96;
  }

  return 1;
}

export function getSettlementEconomicModifier(item, merchantActor) {
  const settlementName = merchantActor?.system?.info?.settlement || "";
  const settlementActor = getSettlementActorByName(settlementName);
  const state = getSettlementTradeState(settlementActor);
  const category = getItemTradeCategory(item);

  let modifier = 1;

  modifier += (5 - state.supply) * 0.03;
  modifier += (state.danger - 5) * 0.02;
  modifier -= (state.prosperity - 5) * 0.015;

  if (category === "provisions") {
    modifier += (5 - state.supply) * 0.04;
  }

  if (category === "arms") {
    modifier += (state.danger - 5) * 0.035;
  }

  if (category === "alchemy" || category === "arcane") {
    modifier += (state.danger - 5) * 0.015;
    modifier += (5 - state.supply) * 0.01;
  }

  return Math.max(0.65, Math.min(1.6, modifier));
}

export function getMerchantBuyPriceForItem(item, merchantActor, characterActor = null) {
  const basePrice = getComputedItemUnitPrice(item);
  const markup = getMerchantMarkup(merchantActor);
  const specialtyModifier = getMerchantSpecialtyModifier(item, merchantActor);
  const settlementModifier = getSettlementEconomicModifier(item, merchantActor);

  let price = basePrice * markup * specialtyModifier * settlementModifier;

  if (characterActor) {
    const tradeMods = getTradePriceModifiers(characterActor, merchantActor);
    price *= tradeMods.buyModifier;
  }

  return Math.max(1, Math.round(price));
}

export function getMerchantSellPriceForItem(item, merchantActor, characterActor = null) {
  const basePrice = getComputedItemUnitPrice(item);

  let price = basePrice * 0.45;

  if (merchantActor) {
    const markup = getMerchantMarkup(merchantActor);
    const specialtyModifier = getMerchantSpecialtyModifier(item, merchantActor);
    const settlementModifier = getSettlementEconomicModifier(item, merchantActor);

    price *= Math.max(0.75, Math.min(1.25, 1 / markup));
    price *= Math.max(0.82, Math.min(1.18, 1 / specialtyModifier));
    price *= Math.max(0.85, Math.min(1.15, 1 / settlementModifier));
  }

  if (characterActor) {
    const tradeMods = getTradePriceModifiers(characterActor, merchantActor);
    price *= tradeMods.sellModifier;
  }

  return Math.max(1, Math.round(price));
}

export function getBuyPriceState(unitBasePrice, tradePrice) {
  if (unitBasePrice <= 0) {
    return {
      label: "без оценки",
      key: "neutral"
    };
  }

  const ratio = tradePrice / unitBasePrice;

  if (ratio <= 0.9) {
    return { label: "выгодно", key: "good" };
  }

  if (ratio <= 1.1) {
    return { label: "нормально", key: "neutral" };
  }

  if (ratio <= 1.35) {
    return { label: "дорого", key: "bad" };
  }

  return { label: "очень дорого", key: "very-bad" };
}

export function getSellPriceState(unitBasePrice, tradePrice) {
  if (unitBasePrice <= 0) {
    return {
      label: "без оценки",
      key: "neutral"
    };
  }

  const ratio = tradePrice / unitBasePrice;

  if (ratio >= 0.9) {
    return { label: "выгодно", key: "good" };
  }

  if (ratio >= 0.65) {
    return { label: "нормально", key: "neutral" };
  }

  return { label: "дёшево", key: "bad" };
}

export async function addItemToActorOrStack(actor, itemData) {
  const quantity = Math.max(1, Number(itemData.system?.quantity ?? 1));
  const targetSignature = buildItemStackSignatureFromData(itemData);

  const existing = actor.items.find(i => buildItemStackSignature(i) === targetSignature);

  if (existing) {
    const currentQty = Math.max(1, Number(existing.system?.quantity ?? 1));
    await existing.update({
      "system.quantity": currentQty + quantity
    });
    return existing;
  }

  const created = await actor.createEmbeddedDocuments("Item", [itemData]);
  return created?.[0] ?? null;
}

export async function transferItemQuantityBetweenActors(sourceActorRef, targetActorRef, itemRef, quantity) {
  const sourceActor = getPersistentActor(sourceActorRef) ?? getLiveActor(sourceActorRef);
  const targetActor = getPersistentActor(targetActorRef) ?? getLiveActor(targetActorRef);
debugLog("transferItemQuantityBetweenActors:start", {
  sourceActorId: sourceActor?.id,
  sourceActorName: sourceActor?.name,
  targetActorId: targetActor?.id,
  targetActorName: targetActor?.name,
  itemRef: typeof itemRef === "string" ? itemRef : itemRef?.id,
  quantity
});
  if (!sourceActor) {
    throw new Error("Не найден исходный actor");
  }

  if (!targetActor) {
    throw new Error("Не найден целевой actor");
  }

  const qty = Math.max(1, Number(quantity ?? 1));
  const liveItem = getPersistentItemFromActor(sourceActor, itemRef) ?? getLiveItemFromActor(sourceActor, itemRef);

  if (!liveItem) {
    debugWarn("transferItemQuantityBetweenActors:item-not-found", {
  sourceActorId: sourceActor?.id,
  sourceActorName: sourceActor?.name,
  itemRef: typeof itemRef === "string" ? itemRef : itemRef?.id
});
    throw new Error("Исходный предмет не найден у источника");
  }

  const currentQty = Math.max(1, Number(liveItem.system?.quantity ?? 1));
  if (currentQty < qty) {
    throw new Error("Недостаточно количества предмета для передачи");
  }

  const { isStackable } = await import("../utils/item-utils.mjs");

  if (isStackable(liveItem.type)) {
    // Стакуемые (боеприпасы) — передаём одним предметом с qty
    const itemData = cloneItemDataForTransfer(liveItem, qty);
    await addItemToActorOrStack(targetActor, itemData);
  } else {
    // Нестакуемые — каждая единица отдельным предметом
    for (let i = 0; i < qty; i++) {
      const itemData = cloneItemDataForTransfer(liveItem, 1);
      // Сбрасываем grid позицию → попадёт в pending
      if (itemData.flags?.["iron-hills-system"]) {
        itemData.flags["iron-hills-system"].gridPos   = null;
        itemData.flags["iron-hills-system"].sectionKey = null;
      }
      await targetActor.createEmbeddedDocuments("Item", [itemData]);
    }
  }
  await removeQuantityFromItem(sourceActor, liveItem, qty);

  await recalculateActorWeight(sourceActor);
  await recalculateActorWeight(targetActor);
debugLog("transferItemQuantityBetweenActors:completed", {
  sourceActorId: sourceActor.id,
  targetActorId: targetActor.id,
  itemId: liveItem.id,
  itemName: liveItem.name,
  qty
});
  return {
    sourceActor,
    targetActor
  };
}

export async function changeActorCoins(actor, delta) {
  const liveActor = getPersistentActor(actor) ?? getLiveActor(actor) ?? actor;
  const current = Math.max(0, Number(liveActor.system?.economy?.coins ?? 0));
  const next = Math.max(0, current + Number(delta ?? 0));

  await liveActor.update({
    "system.economy.coins": next
  });

  return next;
}

export async function changeMerchantWealth(actor, delta) {
  const liveActor = getLiveActor(actor) ?? actor;
  const current = Math.max(0, Number(liveActor.system?.economy?.wealth ?? 0));
  const next = Math.max(0, current + Number(delta ?? 0));

  await liveActor.update({
    "system.economy.wealth": next
  });

  return next;
}

export function buildMerchantStockView(merchantActor, characterActor = null) {
  if (!merchantActor) return [];

  const buyerCoins = characterActor ? getActorCurrency(characterActor) : 0;

  return merchantActor.items
    .map(item => {
      const unitBasePrice = getComputedItemUnitPrice(item);
      const tradeBuyPrice = getMerchantBuyPriceForItem(item, merchantActor, characterActor);
      const quantity = Math.max(1, Number(item.system?.quantity ?? 1));
      const specialtyModifier = getMerchantSpecialtyModifier(item, merchantActor);
      const settlementModifier = getSettlementEconomicModifier(item, merchantActor);

      const canAfford = buyerCoins >= tradeBuyPrice;
      const delta = tradeBuyPrice - unitBasePrice;
      const deltaPercent = unitBasePrice > 0
        ? Math.round(((tradeBuyPrice / unitBasePrice) - 1) * 100)
        : 0;
      const priceState = getBuyPriceState(unitBasePrice, tradeBuyPrice);

      return {
        id: item.id,
        name: item.name,
        icon: getItemQuickSlotIcon(item),
        kind: itemTypeLabel(item.type),
        tradeCategory: getItemTradeCategory(item),
        quantity,

        unitBasePrice,
        totalBasePrice: unitBasePrice * quantity,

        tradeBuyPrice,
        tradeBuyTotal: tradeBuyPrice * quantity,

        canAfford,
        priceDelta: delta,
        priceDeltaPercent: deltaPercent,
        priceStateLabel: priceState.label,
        priceStateKey: priceState.key,

        specialtyModifier: Number(specialtyModifier.toFixed(2)),
        settlementModifier: Number(settlementModifier.toFixed(2))
      };
    })
    .sort((a, b) => {
      if (a.canAfford !== b.canAfford) return a.canAfford ? -1 : 1;
      if (a.tradeCategory !== b.tradeCategory) return a.tradeCategory.localeCompare(b.tradeCategory, "ru");
      return a.name.localeCompare(b.name, "ru");
    });
}

export function buildCharacterSellView(characterActor, merchantActor = null) {
  if (!characterActor) return [];

  const merchantWealth = merchantActor ? getMerchantWealth(merchantActor) : Infinity;

  return characterActor.items
    .map(item => {
      const unitBasePrice = getComputedItemUnitPrice(item);
      const tradeSellPrice = getMerchantSellPriceForItem(item, merchantActor, characterActor);
      const quantity = Math.max(1, Number(item.system?.quantity ?? 1));
      const specialtyModifier = merchantActor ? getMerchantSpecialtyModifier(item, merchantActor) : 1;
      const settlementModifier = merchantActor ? getSettlementEconomicModifier(item, merchantActor) : 1;
      const priceState = getSellPriceState(unitBasePrice, tradeSellPrice);

      const canMerchantBuy = merchantWealth >= tradeSellPrice;
      const priceDelta = tradeSellPrice - unitBasePrice;
      const priceDeltaPercent = unitBasePrice > 0
        ? Math.round(((tradeSellPrice / unitBasePrice) - 1) * 100)
        : 0;

      return {
        id: item.id,
        name: item.name,
        icon: getItemQuickSlotIcon(item),
        kind: itemTypeLabel(item.type),
        type: item.type,
        tradeCategory: getItemTradeCategory(item),
        quantity,

        unitBasePrice,
        unitPrice: unitBasePrice,
        totalBasePrice: unitBasePrice * quantity,

        tradeSellPrice,
        tradeSellTotal: tradeSellPrice * quantity,

        canMerchantBuy,
        priceDelta,
        priceDeltaPercent,
        priceStateLabel: priceState.label,
        priceStateKey: priceState.key,

        specialtyModifier: Number(specialtyModifier.toFixed(2)),
        settlementModifier: Number(settlementModifier.toFixed(2))
      };
    })
    .sort((a, b) => {
      if (a.canMerchantBuy !== b.canMerchantBuy) return a.canMerchantBuy ? -1 : 1;
      if (a.tradeCategory !== b.tradeCategory) return a.tradeCategory.localeCompare(b.tradeCategory, "ru");
      return a.name.localeCompare(b.name, "ru");
    });
}