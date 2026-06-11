import {
  getComputedItemUnitPrice,
  cloneItemDataForTransfer,
  buildItemStackSignatureFromData,
  buildItemStackSignature,
  getItemQuickSlotIcon,
  getItemQuantity,
  itemTypeLabel,
  isStackable
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
import {
  clearItemGridPlacement,
  isItemGridPlaced,
  recalculateActorWeight,
  removeQuantityFromItem
} from "./inventory-service.mjs";
import { getSettlementActorByName, getSettlementTradeState } from "./actor-state-service.mjs";
import { debugLog, debugWarn } from "../utils/debug-utils.mjs";
import { coinsToCopper, currencyUpdateData } from "../utils/currency.mjs";

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

export function getMerchantMarketPriceFactor(characterActor, merchantActor) {
  const marketFactor = Math.max(0, Number(merchantActor?.system?.market?.currentPriceFactor ?? 1));

  if (!characterActor || !merchantActor) return marketFactor;

  try {
    const { getPriceMult } = game.ironHills?._factionService ?? {};
    if (getPriceMult) {
      const reputationFactor = Number(getPriceMult(characterActor, merchantActor));
      if (reputationFactor === 0) return 0;
      if (Number.isFinite(reputationFactor) && reputationFactor > 0) {
        return Math.max(0, marketFactor * reputationFactor);
      }
    }
  } catch {}

  return marketFactor;
}

export function getMerchantBuyPriceForItem(item, merchantActor, characterActor = null) {
  const basePrice = getComputedItemUnitPrice(item);
  const markup = getMerchantMarkup(merchantActor);
  const specialtyModifier = getMerchantSpecialtyModifier(item, merchantActor);
  const settlementModifier = getSettlementEconomicModifier(item, merchantActor);
  const marketFactor = getMerchantMarketPriceFactor(characterActor, merchantActor);

  if (marketFactor <= 0) return Number.MAX_SAFE_INTEGER;

  let price = basePrice * markup * specialtyModifier * settlementModifier;

  if (characterActor) {
    const tradeMods = getTradePriceModifiers(characterActor, merchantActor);
    price *= tradeMods.buyModifier;
  }

  price *= marketFactor;

  return Math.max(1, Math.round(price));
}

export function getMerchantSellPriceForItem(item, merchantActor, characterActor = null) {
  const basePrice = getComputedItemUnitPrice(item);
  const marketFactor = getMerchantMarketPriceFactor(characterActor, merchantActor);

  if (marketFactor <= 0) return 0;

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

  price *= marketFactor;

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

function clearItemDataGridPlacement(itemData) {
  itemData.flags = foundry.utils.deepClone(itemData.flags ?? {});
  itemData.flags["iron-hills-system"] = {
    ...(itemData.flags["iron-hills-system"] ?? {}),
    sectionKey: null,
    gridPos: null,
  };
  return itemData;
}

function isAvailablePendingStack(actor, item) {
  if (!item) return false;
  if (isItemGridPlaced(item)) return false;
  return !Object.values(actor?.system?.equipment ?? {}).includes(item.id);
}

export async function addItemToActorOrStack(actor, itemData, options = {}) {
  const quantity = getItemQuantity(itemData);
  const {
    stackIntoPlaced = false,
    forcePending = true,
  } = options;

  if (forcePending) clearItemDataGridPlacement(itemData);

  const targetSignature = buildItemStackSignatureFromData(itemData);

  const existing = actor.items.find(i =>
    buildItemStackSignature(i) === targetSignature &&
    (stackIntoPlaced || isAvailablePendingStack(actor, i))
  );

  if (existing) {
    const currentQty = getItemQuantity(existing);
    await existing.update({
      "system.quantity": currentQty + quantity
    });
    if (forcePending) await clearItemGridPlacement(existing);
    return existing;
  }

  if (forcePending) clearItemDataGridPlacement(itemData);
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

  const qty = cleanTradeQuantity(quantity);
  const liveItem = getPersistentItemFromActor(sourceActor, itemRef) ?? getLiveItemFromActor(sourceActor, itemRef);

  if (!liveItem) {
    debugWarn("transferItemQuantityBetweenActors:item-not-found", {
  sourceActorId: sourceActor?.id,
  sourceActorName: sourceActor?.name,
  itemRef: typeof itemRef === "string" ? itemRef : itemRef?.id
});
    throw new Error("Исходный предмет не найден у источника");
  }

  const currentQty = getItemQuantity(liveItem);
  if (currentQty < qty) {
    throw new Error("Недостаточно количества предмета для передачи");
  }

  if (isStackable(liveItem.type)) {
    // Стакуемые (боеприпасы) — передаём одним предметом с qty
    const itemData = cloneItemDataForTransfer(liveItem, qty);
    await addItemToActorOrStack(targetActor, itemData);
  } else {
    // Нестакуемые — каждая единица отдельным предметом
    for (let i = 0; i < qty; i++) {
      const itemData = cloneItemDataForTransfer(liveItem, 1);
      // Сбрасываем grid позицию → попадёт в pending
      await addItemToActorOrStack(targetActor, itemData);
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
  const current = getActorCurrency(liveActor);
  const next = Math.max(0, current + Number(delta ?? 0));

  await liveActor.update(currencyUpdateData("system.currency", next));

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

function normalizeTradeCoins(coins) {
  if (typeof coins === "number") return Math.max(0, Math.floor(coins));
  return Math.max(0, coinsToCopper(coins ?? 0));
}

function cleanTradeQuantity(value) {
  const quantity = Math.floor(Number(value ?? 1));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function resolveTradeActor(actorRef) {
  return getPersistentActor(actorRef) ?? getLiveActor(actorRef) ?? actorRef ?? null;
}

function normalizeTradeOffer(actor, entries) {
  const result = [];

  for (const entry of entries ?? []) {
    const itemId = typeof entry === "string"
      ? entry
      : (entry.itemId ?? entry.id ?? entry.item?.id ?? "");
    const qty = cleanTradeQuantity(entry?.qty ?? entry?.quantity ?? 1);
    const itemIds = Array.isArray(entry?.itemIds)
      ? entry.itemIds.filter(Boolean)
      : Array.isArray(entry?.ids)
        ? entry.ids.filter(Boolean)
        : itemId
          ? [itemId]
          : [];

    const candidateItems = itemIds
      .map(id => actor?.items?.get(id))
      .filter(Boolean);

    if (!candidateItems.length && entry?.item) {
      const liveEntryItem = actor?.items?.get(entry.item.id) ?? entry.item;
      if (liveEntryItem) candidateItems.push(liveEntryItem);
    }

    if (!candidateItems.length) {
      throw new Error("Предмет из предложения не найден");
    }

    let remaining = qty;
    for (const item of candidateItems) {
      if (remaining <= 0) break;

      const available = getItemQuantity(item);
      const take = Math.min(available, remaining);
      if (take <= 0) continue;

      result.push({ item, itemId: item.id, qty: take, available, name: item.name });
      remaining -= take;
    }

    if (remaining > 0) {
      const label = candidateItems[0]?.name ?? "предмет";
      const available = qty - remaining;
      throw new Error(`Недостаточно предметов "${label}" (${available}/${qty})`);
    }
  }

  return result;
}

function summarizeTradeItems(items) {
  const grouped = new Map();
  for (const { item, qty } of items) {
    const key = `${item.type}:${item.name}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.qty += qty;
      existing.itemIds.push(item.id);
    } else {
      grouped.set(key, {
        itemId: item.id,
        itemIds: [item.id],
        name: item.name,
        qty,
        type: item.type
      });
    }
  }
  return Array.from(grouped.values());
}

export function buildTarkovTradeQuote({
  buyer,
  merchant,
  merchantOffers = [],
  playerOffers = [],
  merchantCoins = 0,
  playerCoins = 0
} = {}) {
  const liveBuyer = resolveTradeActor(buyer);
  const liveMerchant = resolveTradeActor(merchant);

  if (!liveBuyer || !liveMerchant) {
    return { ok: false, canTrade: false, reason: "Не найден покупатель или торговец" };
  }

  const marketFactor = getMerchantMarketPriceFactor(liveBuyer, liveMerchant);
  if (marketFactor <= 0) {
    return {
      ok: false,
      canTrade: false,
      reason: "Торговец отказывается торговать из-за репутации",
      marketFactor
    };
  }

  let merchantItems = [];
  let playerItems = [];
  try {
    merchantItems = normalizeTradeOffer(liveMerchant, merchantOffers);
    playerItems = normalizeTradeOffer(liveBuyer, playerOffers);
  } catch (err) {
    return {
      ok: false,
      canTrade: true,
      reason: err?.message || "Предложение устарело",
      marketFactor,
      buyer: liveBuyer,
      merchant: liveMerchant
    };
  }
  const merchantCoinOffer = normalizeTradeCoins(merchantCoins);
  const playerCoinOffer = normalizeTradeCoins(playerCoins);

  const merchantItemsValue = merchantItems.reduce(
    (sum, entry) => sum + getMerchantBuyPriceForItem(entry.item, liveMerchant, liveBuyer) * entry.qty,
    0
  );
  const playerItemsValue = playerItems.reduce(
    (sum, entry) => sum + getMerchantSellPriceForItem(entry.item, liveMerchant, liveBuyer) * entry.qty,
    0
  );

  const merchantOfferValue = merchantItemsValue + merchantCoinOffer;
  const playerOfferValue = playerItemsValue + playerCoinOffer;
  const net = merchantOfferValue - playerOfferValue;
  const buyerPays = playerCoinOffer + Math.max(0, net);
  const merchantPays = merchantCoinOffer + Math.max(0, -net);
  const buyerCoins = getActorCurrency(liveBuyer);
  const merchantCoinsAvailable = getActorCurrency(liveMerchant);
  const hasExchange =
    merchantItems.length > 0 ||
    playerItems.length > 0 ||
    merchantCoinOffer > 0 ||
    playerCoinOffer > 0;

  return {
    ok: true,
    canTrade: true,
    hasExchange,
    reason: "",
    marketFactor,
    buyer: liveBuyer,
    merchant: liveMerchant,
    merchantItems,
    playerItems,
    merchantItemSummary: summarizeTradeItems(merchantItems),
    playerItemSummary: summarizeTradeItems(playerItems),
    merchantCoinOffer,
    playerCoinOffer,
    merchantItemsValue,
    playerItemsValue,
    merchantOfferValue,
    playerOfferValue,
    net,
    buyerPays,
    merchantPays,
    buyerCoins,
    merchantCoins: merchantCoinsAvailable,
    buyerCanPay: buyerCoins >= buyerPays,
    merchantCanPay: merchantCoinsAvailable >= merchantPays
  };
}

export async function executeTarkovTrade({
  buyer,
  merchant,
  merchantOffers = [],
  playerOffers = [],
  merchantCoins = 0,
  playerCoins = 0,
  gmForce = false
} = {}) {
  const quote = buildTarkovTradeQuote({
    buyer,
    merchant,
    merchantOffers,
    playerOffers,
    merchantCoins,
    playerCoins
  });

  if (!quote.ok || !quote.canTrade) {
    return { ok: false, reason: quote.reason || "Сделка недоступна", quote };
  }

  if (!quote.hasExchange) {
    return { ok: false, reason: "Пустая сделка", quote };
  }

  if (!gmForce) {
    if (!quote.buyerCanPay) {
      return { ok: false, reason: "У покупателя не хватает монет", quote };
    }
    if (!quote.merchantCanPay) {
      return { ok: false, reason: "У торговца не хватает монет", quote };
    }
  }

  for (const entry of quote.merchantItems) {
    await transferItemQuantityBetweenActors(quote.merchant, quote.buyer, entry.item, entry.qty);
  }

  for (const entry of quote.playerItems) {
    await transferItemQuantityBetweenActors(quote.buyer, quote.merchant, entry.item, entry.qty);
  }

  if (!gmForce) {
    const buyerCoinDelta = -quote.buyerPays + quote.merchantPays;
    const merchantCoinDelta = -quote.merchantPays + quote.buyerPays;
    if (buyerCoinDelta !== 0) await changeActorCoins(quote.buyer, buyerCoinDelta);
    if (merchantCoinDelta !== 0) await changeActorCoins(quote.merchant, merchantCoinDelta);
  }

  return {
    ok: true,
    reason: "",
    quote,
    buyer: quote.buyer,
    merchant: quote.merchant,
    merchantItems: quote.merchantItemSummary,
    playerItems: quote.playerItemSummary,
    gmForce
  };
}

export function buildMerchantStockView(merchantActor, characterActor = null) {
  if (!merchantActor) return [];

  const buyerCoins = characterActor ? getActorCurrency(characterActor) : 0;

  return merchantActor.items
    .map(item => {
      const unitBasePrice = getComputedItemUnitPrice(item);
      const tradeBuyPrice = getMerchantBuyPriceForItem(item, merchantActor, characterActor);
      const quantity = getItemQuantity(item);
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
      const quantity = getItemQuantity(item);
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
