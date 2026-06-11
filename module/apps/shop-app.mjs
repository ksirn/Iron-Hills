/**
 * Iron Hills — Shop App (PATCH 27)
 * Окно магазина с генерацией ассортимента по тиру поселения.
 */
import {
  buildShopPurchaseItemData,
  generateMerchantStock, MERCHANT_TYPES, SETTLEMENT_TIERS, getMerchantsForTier,
  ECONOMY_STATES, getSettlementEconomy, setSettlementEconomy,
} from "../services/merchant-service.mjs";
import { addItemToActorOrStack } from "../services/trade-service.mjs";
import { buildCombatChatCard } from "../services/combat-chat-service.mjs";
import { coinsToCopper, currencyUpdateData, formatCurrency } from "../utils/currency.mjs";
import { formatItemActionSummary, getSpellSchoolDisplay } from "../utils/item-utils.mjs";

class IronHillsShopApp extends Application {
  constructor(options = {}) {
    super(options);
    this._settlementTier = options.settlementTier ?? 1;
    this._merchantType   = options.merchantType   ?? "general";
    this._settlementId   = options.settlementId   ?? "default";
    this._stock          = [];
    this._economy        = null;
    this._filterTier     = null;
    this._buyer          = game.user?.character ?? null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "shop-app"],
      width:     620,
      height:    580,
      resizable: true,
      title:     "🏪 Магазин",
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/shop-app.hbs";
  }

  /** Открыть магазин */
  static open(settlementTier = 1, merchantType = "general") {
    const app = new IronHillsShopApp({ settlementTier, merchantType });
    app.render(true);
    return app;
  }

  _generateStock() {
    const seed = Math.floor((game.time?.worldTime ?? 0) / 86400);
    // Берём актуальный экономический статус из актора торговца или поселения
    const merchantActor  = this._merchantActor;
    const liveEconStatus = merchantActor?.system?.economy?.economyStatus
                        ?? merchantActor?.system?.market?.economyStatus
                        ?? null;
    const result = generateMerchantStock(
      this._merchantType, this._settlementTier, seed, this._settlementId,
      liveEconStatus  // переопределяет сохранённый статус если есть актуальный
    );
    this._stock   = result.stock;
    this._economy = result.economy;
  }

  async getData() {
    if (!this._stock.length) this._generateStock();

    const settlement = SETTLEMENT_TIERS[this._settlementTier];
    const merchant   = MERCHANT_TYPES[this._merchantType];
    const merchants  = getMerchantsForTier(this._settlementTier);

    // Фильтр по тиру
    const stock = this._stock
      .map((item, stockIndex) => ({ ...item, stockIndex }))
      .filter((item) => !this._filterTier || item.tier === this._filterTier);

    // Монеты покупателя
    const buyer     = this._buyer;
    const buyerCoins = buyer ? coinsToCopper(buyer.system?.currency ?? {}) : 0;

    // Уникальные тиры в ассортименте
    const tiers = [...new Set(this._stock.map(i => i.tier))].sort((a,b) => a-b);

    const economy = this._economy ?? ECONOMY_STATES.normal;

    return {
      settlement,
      merchant,
      merchants,
      settlementTier: this._settlementTier,
      merchantType:   this._merchantType,
      settlementId:   this._settlementId,
      economy,
      economyStates:  Object.values(ECONOMY_STATES),
      isGM:           game.user?.isGM,
      stock: stock.map(item => ({
        ...item,
        schoolLabel: item.school ? getSpellSchoolDisplay(item.school).label : "",
        actionLabel: formatItemActionSummary(item.itemData ?? item),
        shopPriceFormatted: formatCurrency(item.shopPrice),
        canAfford: buyerCoins >= item.shopPrice,
      })),
      tiers,
      filterTier:     this._filterTier,
      buyerName:      buyer?.name ?? "—",
      buyerCoinsStr:  formatCurrency(buyerCoins),
      hasBuyer:       !!buyer,
      settlementTiers: Object.entries(SETTLEMENT_TIERS).map(([k,v]) => ({
        tier: Number(k), ...v, active: Number(k) === this._settlementTier
      })),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Смена тира поселения
    html.find("[data-set-tier]").on("click", e => {
      this._settlementTier = Number(e.currentTarget.dataset.setTier);
      this._merchantType   = getMerchantsForTier(this._settlementTier)[0]?.id ?? "general";
      this._stock = [];
      this.render(false);
    });

    // Смена типа торговца
    html.find("[data-set-merchant]").on("click", e => {
      this._merchantType = e.currentTarget.dataset.setMerchant;
      this._stock = [];
      this.render(false);
    });

    // Фильтр по тиру
    html.find("[data-filter-tier]").on("click", e => {
      const t = Number(e.currentTarget.dataset.filterTier);
      this._filterTier = this._filterTier === t ? null : t;
      this.render(false);
    });

    // Обновить ассортимент
    html.find("[data-restock]").on("click", () => {
      this._stock = [];
      this._generateStock();
      this.render(false);
    });

    // GM: сменить состояние экономики
    html.find("[data-set-economy]").on("click", async e => {
      const status = e.currentTarget.dataset.setEconomy;
      await setSettlementEconomy(this._settlementId, status);
      this._stock = [];
      this.render(false);
    });

    // Купить предмет
    html.find("[data-buy]").on("click", async e => {
      const idx   = Number(e.currentTarget.dataset.buy);
      const item  = this._stock[idx];
      if (!item) return;

      const buyer = this._buyer ?? game.user?.character;
      if (!buyer) { ui.notifications.warn("Нет персонажа для покупки"); return; }

      const { requireNoPendingInventory } = await import("./pending-items-app.mjs").catch(() => ({}));
      const pendingCheck = requireNoPendingInventory
        ? await requireNoPendingInventory(buyer, { actionLabel: "покупка" })
        : { ok: true };
      if (!pendingCheck.ok) return;

      const coins = coinsToCopper(buyer.system?.currency ?? {});

      if (coins < item.shopPrice) {
        ui.notifications.warn(`Недостаточно монет (${formatCurrency(coins)} / ${formatCurrency(item.shopPrice)})`);
        return;
      }

      // Списываем монеты
      const remaining = coins - item.shopPrice;
      await buyer.update(currencyUpdateData("system.currency", remaining));

      // Добавляем предмет в инвентарь
      const itemData = buildShopPurchaseItemData(item);
      await addItemToActorOrStack(buyer, itemData);
      this._stock.splice(idx, 1);

      ui.notifications.info(`${buyer.name} купил ${item.label} за ${formatCurrency(item.shopPrice)}`);

      await ChatMessage.create({
        content: buildCombatChatCard({
          title: "Покупка",
          icon: "🏪",
          status: formatCurrency(item.shopPrice),
          statusClass: "is-warn",
          rows: [
            ["Покупатель", buyer.name],
            ["Предмет", item.label],
          ],
          className: "ih-shop-chat-card",
        }),
      });

      const { PendingItemsApp } = await import("./pending-items-app.mjs").catch(() => ({}));
      await PendingItemsApp?.openIfNeeded?.(buyer);
      this.render(false);
    });
  }
}

export { IronHillsShopApp };
