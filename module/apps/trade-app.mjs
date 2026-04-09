import {
  getLiveActor,
  getPersistentActor,
  getActorCurrency,
  getMerchantWealth,
  getCharacterActorByUuid,
  getTradeCharacterByUuidOrActive,
  getTradeCharacterOptions
} from "../utils/actor-utils.mjs";
import {
  getTradePriceModifiers,
  getMerchantBuyPriceForItem,
  getMerchantSellPriceForItem,
  transferItemQuantityBetweenActors,
  changeActorCoins,
  changeMerchantWealth,
  buildMerchantStockView,
  buildCharacterSellView
} from "../services/trade-service.mjs";
import {
  buildTradeSummary
} from "../services/actor-state-service.mjs";
import {
  refreshMerchantTradeViews,
  rerenderOpenTradeApps
} from "../services/ui-refresh-service.mjs";
import { debugLog, debugWarn, debugError } from "../utils/debug-utils.mjs";

const TRADE_LOCKS = new Set();

function makeTradeLockKey({ merchantId = "", characterId = "", itemId = "", action = "" } = {}) {
  return [merchantId, characterId, itemId, action].join("::");
}

async function runWithTradeLock(lockData, callback) {
  const key = makeTradeLockKey(lockData);

  debugLog("runWithTradeLock:start", { key, lockData });

  if (TRADE_LOCKS.has(key)) {
    debugWarn("runWithTradeLock:already-locked", { key, lockData });
    ui.notifications.warn("Торговая операция уже выполняется.");
    return false;
  }

  TRADE_LOCKS.add(key);
  debugLog("runWithTradeLock:locked", { key });

  try {
    await callback();
    debugLog("runWithTradeLock:success", { key });
    return true;
  } catch (err) {
    debugError("runWithTradeLock:error", { key, message: err?.message, err });
    throw err;
  } finally {
    TRADE_LOCKS.delete(key);
    debugLog("runWithTradeLock:released", { key });
  }
}

class IronHillsTradeApp extends Application {
  constructor(merchantActor, options = {}) {
  super(options);
  this.merchant = merchantActor;
  this._tradeCharacterUuid = "";
  this._tradeBusy = false;
}

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills", "trade-app"],
      width: 980,
      height: 760,
      resizable: true,
      title: "Торговля"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/trade-app.hbs";
  }

  _getSelectedCharacter() {
    if (this._tradeCharacterUuid) {
      return getPersistentActor(getCharacterActorByUuid(this._tradeCharacterUuid));
    }

    return getPersistentActor(getTradeCharacterByUuidOrActive(""));
  }

  async getData() {
    const character = this._getSelectedCharacter();

    if (!this._tradeCharacterUuid && character) {
      this._tradeCharacterUuid = character.uuid;
    }

  return {
    merchant: this.merchant,
    merchantName: this.merchant.name,
    tradeCharacterOptions: getTradeCharacterOptions(),

    activeTradeCharacter: character,
    activeTradeCharacterUuid: character?.uuid || "",
    activeTradeCharacterName: character?.name || "Не выбран",
    hasActiveTradeCharacter: !!character,

    tradeSummary: buildTradeSummary(this.merchant),
    tradeModifiers: getTradePriceModifiers(character, this.merchant),

    buyerCoins: character ? getActorCurrency(character) : 0,
    merchantWealth: getMerchantWealth(this.merchant),

    merchantStockView: buildMerchantStockView(this.merchant, character),
    playerSellToMerchantView: character
      ? buildCharacterSellView(character, this.merchant).map(item => ({
          ...item,
          sellerUuid: character.uuid
        }))
      : []
  };
  }

  async _setTradeCharacter(actorUuid) {
    const actor = getCharacterActorByUuid(actorUuid);
    this._tradeCharacterUuid = actor?.uuid || "";
    this.render(true);
  }

async _buyItem(itemId) {
  if (this._tradeBusy) {
    ui.notifications.warn("Дождись завершения текущей торговой операции.");
    return;
  }

  const buyer = getPersistentActor(this._getSelectedCharacter());
  debugLog("TradeApp._buyItem:selected-buyer", {
    buyerId: buyer?.id,
    buyerName: buyer?.name,
    itemId
  });

  if (!buyer) {
    ui.notifications.warn("Не выбран персонаж для торговли.");
    return;
  }

  const merchant = getLiveActor(this.merchant);
  debugLog("TradeApp._buyItem:selected-merchant", {
    merchantId: merchant?.id,
    merchantName: merchant?.name,
    itemId
  });

  if (!merchant) {
    ui.notifications.warn("Не удалось получить актуальный actor context для торговли.");
    return;
  }

  const lockData = {
    merchantId: merchant.id,
    characterId: buyer.id,
    itemId,
    action: "buy"
  };

  this._tradeBusy = true;

  try {
    await runWithTradeLock(lockData, async () => {
      const liveMerchant = getLiveActor(merchant) ?? merchant;
      const liveBuyer = getPersistentActor(buyer) ?? buyer;

      const item = liveMerchant.items.get(itemId);
      if (!item) {
        ui.notifications.warn("Товар уже отсутствует у торговца.");
        return;
      }

      const availableQty = Math.max(1, Number(item.system?.quantity ?? 1));
      if (availableQty < 1) {
        ui.notifications.warn("Товар закончился.");
        return;
      }

      const price = getMerchantBuyPriceForItem(item, liveMerchant, liveBuyer);
      const buyerCoins = getActorCurrency(liveBuyer);

      debugLog("TradeApp._buyItem:pricing", {
        itemId: item.id,
        itemName: item.name,
        availableQty,
        price,
        buyerCoins,
        buyerId: liveBuyer.id,
        merchantId: liveMerchant.id
      });

      if (buyerCoins < price) {
        ui.notifications.warn("Недостаточно монет.");
        return;
      }

      await changeActorCoins(liveBuyer, -price);
      await changeMerchantWealth(liveMerchant, price);
      await transferItemQuantityBetweenActors(liveMerchant, liveBuyer, item, 1);

      debugLog("TradeApp._buyItem:completed", {
        itemId: item.id,
        itemName: item.name,
        buyerId: liveBuyer.id,
        merchantId: liveMerchant.id,
        price
      });

      await ChatMessage.create({
        content: `<b>${liveBuyer.name}</b> покупает у <b>${liveMerchant.name}</b> предмет <b>${item.name}</b> за <b>${price}</b> монет.`
      });

      if (liveBuyer.sheet?.rendered) liveBuyer.sheet.render(false);
      await refreshMerchantTradeViews();
      rerenderOpenTradeApps();
    });
  } catch (err) {
    console.error(err);
    ui.notifications.error(`Ошибка покупки: ${err.message}`);
  } finally {
    this._tradeBusy = false;
    if (this.rendered) this.render(true);
  }
}

async _sellItem(itemId, sellerUuid) {
  if (this._tradeBusy) {
    ui.notifications.warn("Дождись завершения текущей торговой операции.");
    return;
  }

  const seller = getPersistentActor(
    getTradeCharacterByUuidOrActive(sellerUuid || this._tradeCharacterUuid)
  );

  debugLog("TradeApp._sellItem:selected-seller", {
    sellerId: seller?.id,
    sellerName: seller?.name,
    itemId,
    sellerUuid
  });

  if (!seller) {
    ui.notifications.warn("Не выбран персонаж для торговли.");
    return;
  }

  const merchant = getLiveActor(this.merchant);

  debugLog("TradeApp._sellItem:selected-merchant", {
    merchantId: merchant?.id,
    merchantName: merchant?.name,
    itemId
  });

  if (!merchant) {
    ui.notifications.warn("Не удалось получить актуальный actor context для торговли.");
    return;
  }

  const lockData = {
    merchantId: merchant.id,
    characterId: seller.id,
    itemId,
    action: "sell"
  };

  this._tradeBusy = true;

  try {
    await runWithTradeLock(lockData, async () => {
      const liveMerchant = getLiveActor(merchant) ?? merchant;
      const liveSeller = getPersistentActor(seller) ?? seller;

      const item = liveSeller.items.get(itemId);
      if (!item) {
        ui.notifications.warn(`У персонажа "${liveSeller.name}" больше нет такого предмета.`);
        return;
      }

      const availableQty = Math.max(1, Number(item.system?.quantity ?? 1));
      if (availableQty < 1) {
        ui.notifications.warn("Нечего продавать.");
        return;
      }

      const price = getMerchantSellPriceForItem(item, liveMerchant, liveSeller);
      const merchantWealth = getMerchantWealth(liveMerchant);

      debugLog("TradeApp._sellItem:pricing", {
        itemId: item.id,
        itemName: item.name,
        availableQty,
        price,
        merchantWealth,
        sellerId: liveSeller.id,
        merchantId: liveMerchant.id
      });

      if (merchantWealth < price) {
        ui.notifications.warn("У торговца недостаточно богатства для выкупа.");
        return;
      }

      await changeMerchantWealth(liveMerchant, -price);
      await changeActorCoins(liveSeller, price);
      await transferItemQuantityBetweenActors(liveSeller, liveMerchant, item, 1);

      debugLog("TradeApp._sellItem:completed", {
        itemId: item.id,
        itemName: item.name,
        sellerId: liveSeller.id,
        merchantId: liveMerchant.id,
        price
      });

      await ChatMessage.create({
        content: `<b>${liveSeller.name}</b> продаёт торговцу <b>${liveMerchant.name}</b> предмет <b>${item.name}</b> за <b>${price}</b> монет.`
      });

      if (liveSeller.sheet?.rendered) liveSeller.sheet.render(false);
      await refreshMerchantTradeViews();
      rerenderOpenTradeApps();
    });
  } catch (err) {
    console.error(err);
    ui.notifications.error(`Ошибка продажи: ${err.message}`);
  } finally {
    this._tradeBusy = false;
    if (this.rendered) this.render(true);
  }
}
  activateListeners(html) {
    super.activateListeners(html);

      html.find("a.is-disabled").on("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const reason = event.currentTarget.getAttribute("title") || "Действие недоступно";
      ui.notifications.warn(reason);
    });

    html.find("[data-trade-character-select]").on("change", async event => {
      event.preventDefault();
      await this._setTradeCharacter(event.currentTarget.value);
    });

    html.find("[data-buy-item]").on("click", async event => {
      event.preventDefault();

      if (event.currentTarget.classList.contains("is-disabled")) {
        return;
      }

      await this._buyItem(event.currentTarget.dataset.itemId);
    });

  html.find("[data-sell-item]").on("click", async event => {
    event.preventDefault();

    if (event.currentTarget.classList.contains("is-disabled")) {
      return;
    }

    await this._sellItem(
      event.currentTarget.dataset.itemId,
      event.currentTarget.dataset.sellerUuid ?? ""
    );
  });
  }
}

export { IronHillsTradeApp };
