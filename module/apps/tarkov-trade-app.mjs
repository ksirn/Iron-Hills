/**
 * Iron Hills — Tarkov Trade App
 * Два grid рядом. Drag предметов между торговцем и игроком.
 * В grid торговца предметы показываются с суммарным qty (стак для просмотра).
 * При добавлении в offer — разбиваются на отдельные предметы.
 */
import { getActorCurrency } from "../utils/actor-utils.mjs";
import {
  buildTarkovTradeQuote,
  executeTarkovTrade,
  getMerchantBuyPriceForItem,
  getMerchantMarketPriceFactor,
  getMerchantSellPriceForItem,
} from "../services/trade-service.mjs";
import { coinsToCopper, formatCurrency } from "../utils/currency.mjs";
import { buildItemStackSignature, isStackable } from "../utils/item-utils.mjs";

const CELL = 52; // меньше чем в инвентаре — больше помещается

export class TarkovTradeApp extends Application {
  constructor(merchant, options = {}) {
    super(options);
    this.merchant      = merchant;
    this._buyer        = game.user?.character ?? null;
    this._offer        = [];
    this._playerOffer  = [];
    this._dragData     = null;
    this._mSearch      = "";
    this._pSearch      = "";
    this._mFilter      = "all";
    this._pFilter      = "all";
    this._mCoins = { copper:0, silver:0, gold:0 };
    this._pCoins = { copper:0, silver:0, gold:0 };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "tarkov-trade-app"],
      title:     "🏪 Торговля",
      width:     1380,
      height:    720,
      resizable: true,
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/tarkov-trade.hbs";
  }

  static open(merchant, buyer = null) {
    const app = new TarkovTradeApp(merchant);
    app._buyer = buyer ?? game.user?.character;
    // Подгоняем под размер экрана
    const w = Math.min(1380, window.innerWidth  - 40);
    const h = Math.min(720,  window.innerHeight - 40);
    app.position.width  = w;
    app.position.height = h;
    app.render(true);
    return app;
  }

  _priceFactor() {
    return getMerchantMarketPriceFactor(this._buyer, this.merchant);
  }

  _getRepInfo() {
    if (!this._buyer || !this.merchant) return null;
    try {
      const { getNpcReputation, getRepLevel } = game.ironHills?._factionService ?? {};
      if (!getNpcReputation) return null;
      const rep   = getNpcReputation(this._buyer, this.merchant);
      const level = getRepLevel(rep);
      return { rep, level };
    } catch { return null; }
  }

  _canTrade() {
    return this._priceFactor() > 0;
  }

  _itemPrice(item, side = "merchant") {
    if (!this._canTrade()) return 0;
    return side === "player"
      ? getMerchantSellPriceForItem(item, this.merchant, this._buyer)
      : getMerchantBuyPriceForItem(item, this.merchant, this._buyer);
  }

  _itemPriceStr(item, qty = 1, side = "merchant") {
    const price = this._itemPrice(item, side);
    return price > 0 ? formatCurrency(price * Math.max(1, Number(qty ?? 1))) : "—";
  }

  _buildGrid(items, cols = 5, search = "", filter = "all", side = "merchant") {
    // Группируем стакуемые предметы по фактической stack signature, а не только по имени.
    // Порядок типов для сортировки
    const TYPE_ORDER = {
      weapon:1, armor:2, ammo:3, tool:4,
      potion:5, food:6, material:7, spell:8
    };
    const CATS = { weapon:"⚔ Оружие", armor:"🛡 Броня", potion:"⚗ Зелья",
                   food:"🍖 Еда", material:"📦 Материалы", tool:"🔧 Инстр.",
                   spell:"✨ Заклин.", ammo:"🏹 Боеприпасы" };

    const filtered = items
      .filter(i => {
        if (filter !== "all" && i.type !== filter) return false;
        if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const ta = TYPE_ORDER[a.type] ?? 99;
        const tb = TYPE_ORDER[b.type] ?? 99;
        if (ta !== tb) return ta - tb;
        return a.name.localeCompare(b.name, "ru");
      });

    const grouped = [];
    const seen = new Map();
    for (const item of filtered) {
      if (isStackable(item.type)) {
        const key = buildItemStackSignature(item);
        if (seen.has(key)) {
          const existing = seen.get(key);
          existing.qty += Number(item.system?.quantity ?? 1);
          existing.ids.push(item.id);
        } else {
          const entry = { item, qty: Number(item.system?.quantity ?? 1), ids: [item.id] };
          seen.set(key, entry);
          grouped.push(entry);
        }
      } else {
        grouped.push({ item, qty: 1, ids: [item.id] });
      }
    }

    // Фиксированная ширина grid, высота растёт динамически + запас 3 строки
    // Окно скроллится вертикально если не помещается
    const usedArea = grouped.reduce((acc, g) => {
      const w = Number(g.item?.system?.gridW ?? 1);
      const h = Number(g.item?.system?.gridH ?? 1);
      return acc + w * h;
    }, 0);
    const minRows = 8;
    const estimatedRows = Math.ceil(usedArea / cols) + 3; // +3 запас снизу
    const rows = Math.max(minRows, estimatedRows);
    const grid  = Array.from({ length: rows }, () => Array(cols).fill(null));
    const placed = [];

    for (const entry of grouped) {
      const w = Number(entry.item.system?.gridW ?? 1);
      const h = Number(entry.item.system?.gridH ?? 1);
      let found = false;
      outer: for (let r = 0; r <= rows - h; r++) {
        for (let c = 0; c <= cols - w; c++) {
          let ok = true;
          for (let dr = 0; dr < h && ok; dr++)
            for (let dc = 0; dc < w && ok; dc++)
              if (grid[r+dr]?.[c+dc]) ok = false;
          if (ok) {
            for (let dr = 0; dr < h; dr++)
              for (let dc = 0; dc < w; dc++)
                grid[r+dr][c+dc] = entry.item.id;
            const sys = entry.item.system ?? {};
            const tips = [];
            if (sys.damage)     tips.push(`⚔ ${sys.damage}`);
            if (sys.skill)      tips.push(`🎯 ${sys.skill}`);
            if (sys.energyCost) tips.push(`⚡ ${sys.energyCost}`);
            if (sys.protection?.physical) tips.push(`🛡 ${sys.protection.physical}`);
            if (sys.satiety)    tips.push(`🍖 +${sys.satiety}`);
            if (sys.hydration)  tips.push(`💧 +${sys.hydration}`);
            if (sys.power && sys.actionType) tips.push(`✦ +${sys.power}`);
            if (sys.school)     tips.push(`✨ ${sys.school} р${sys.rank ?? 1}`);
            if (sys.weight)     tips.push(`⚖ ${sys.weight}кг`);
            const desc = sys.description ?? sys.desc ?? "";
            const descShort = desc ? String(desc).replace(/<[^>]+>/g,"").slice(0,100) : "";

            const unitPrice = this._itemPrice(entry.item, side);
            placed.push({ ...entry, itemIds: entry.ids, maxQty: entry.qty, col: c, row: r, w, h,
              cssLeft: c*CELL, cssTop: r*CELL,
              cssW: w*CELL-2, cssH: h*CELL-2,
              price: unitPrice,
              priceStr: unitPrice > 0 ? formatCurrency(unitPrice * entry.qty) : "—",
              tooltipStats: tips.join(" · "),
              tooltipDesc:  descShort,
              itemType:     entry.item.type,
              tier:         Number(sys.tier ?? 1),
            });
            found = true;
            break outer;
          }
        }
      }
    }

    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cells.push({ col:c, row:r, x:c*CELL, y:r*CELL, size:CELL });

    const offerGroups = Object.fromEntries(
      placed.map(entry => [
        entry.item.id,
        {
          item: entry.item,
          itemIds: entry.itemIds ?? entry.ids ?? [entry.item.id],
          maxQty: Math.max(1, Number(entry.maxQty ?? entry.qty ?? 1))
        }
      ])
    );

    return { placed, cells, rows, cols, gridW: cols*CELL, gridH: rows*CELL, offerGroups };
  }

  _coinsToCopper(coins) {
    return coinsToCopper(coins);
  }

  _actorCoins(actor) {
    return getActorCurrency(actor);
  }

  _buyerCoins() {
    return this._actorCoins(this._buyer);
  }

  _offerTotal() {
    return this._offer.reduce((s, o) => s + this._itemPrice(o.item, "merchant") * o.qty, 0);
  }
  _playerOfferTotal() {
    return this._playerOffer.reduce((s, o) => s + this._itemPrice(o.item, "player") * o.qty, 0);
  }

  async getData() {
    const merchant = this.merchant;
    const buyer    = this._buyer;
    // ID предметов уже в предложениях — исключаем из grid
    const mOfferedIds = new Set(this._offer.flatMap(o => o.itemIds ?? [o.item.id]));
    const pOfferedIds = new Set(this._playerOffer.flatMap(o => o.itemIds ?? [o.item.id]));

    const mGrid    = this._buildGrid(
      Array.from(merchant?.items ?? []).filter(i => !mOfferedIds.has(i.id)),
      7, this._mSearch, this._mFilter, "merchant"
    );
    const pGrid    = this._buildGrid(
      Array.from(buyer?.items ?? [])
        .filter(i => !["spell","attachment"].includes(i.type) && !pOfferedIds.has(i.id)),
      7, this._pSearch, this._pFilter, "player"
    );
    this._mOfferGroups = mGrid.offerGroups ?? {};
    this._pOfferGroups = pGrid.offerGroups ?? {};

    // Категории для фильтров
    const CATS = ["weapon","armor","potion","food","material","tool","spell","ammo"];
    const mCats = ["all", ...new Set(Array.from(merchant?.items??[]).map(i=>i.type).filter(t=>CATS.includes(t)))];
    const pCats = ["all", ...new Set(Array.from(buyer?.items??[]).map(i=>i.type).filter(t=>CATS.includes(t)))];
    const CAT_LABELS = { all:"Все", weapon:"⚔", armor:"🛡", potion:"⚗",
                         food:"🍖", material:"📦", tool:"🔧", spell:"✨", ammo:"🏹" };

    const quote = buildTarkovTradeQuote({
      buyer,
      merchant,
      merchantOffers: this._offer,
      playerOffers: this._playerOffer,
      merchantCoins: this._mCoins,
      playerCoins: this._pCoins,
    });
    const offerTotal       = quote.ok ? quote.merchantOfferValue : this._coinsToCopper(this._mCoins);
    const playerOfferTotal = quote.ok ? quote.playerOfferValue : this._coinsToCopper(this._pCoins);
    const balance          = quote.ok ? quote.net : 0;
    const buyerCoins       = this._buyerCoins();

    // Монеты торговца
    const merchantCoins = this._actorCoins(merchant);

    return {
      merchantName:  merchant?.name ?? "Торговец",
      merchantImg:   merchant?.img  ?? "",
      merchantCoins: formatCurrency(merchantCoins),
      buyerName:     buyer?.name    ?? "—",
      buyerImg:      buyer?.img     ?? "icons/svg/mystery-man.svg",
      buyerCoins:    formatCurrency(buyerCoins),
      buyerCoinsRaw: buyerCoins,
      canAfford:     Boolean(quote.ok && quote.canTrade && quote.hasExchange && quote.buyerCanPay && quote.merchantCanPay),
      tradeBlockedReason: quote.ok && quote.canTrade ? "" : (quote.reason ?? "Сделка недоступна"),
      isGM:          game.user?.isGM,
      // Монеты в предложениях
      mCopperOffer: this._mCoins.copper, mSilverOffer: this._mCoins.silver, mGoldOffer: this._mCoins.gold,
      pCopperOffer: this._pCoins.copper, pSilverOffer: this._pCoins.silver, pGoldOffer: this._pCoins.gold,
      mCoinsStr: formatCurrency(this._coinsToCopper(this._mCoins)),
      pCoinsStr: formatCurrency(this._coinsToCopper(this._pCoins)),

      // Грид торговца
      mGrid, mCols: 6,
      // Грид игрока
      pGrid, pCols: 5,

      // Предложения
      offer:       this._offer.map(o => ({
        itemId: o.item.id, name: o.item.name, img: o.item.img,
        qty: o.qty, priceStr: this._itemPriceStr(o.item, o.qty, "merchant")
      })),
      playerOffer: this._playerOffer.map(o => ({
        itemId: o.item.id, name: o.item.name, img: o.item.img,
        qty: o.qty, priceStr: this._itemPriceStr(o.item, o.qty, "player")
      })),

      offerTotalStr:       formatCurrency(offerTotal),
      playerOfferTotalStr: formatCurrency(playerOfferTotal),
      balanceStr:          formatCurrency(Math.abs(balance)),
      balanceSign:         balance > 0 ? "+" : balance < 0 ? "−" : "=",
      balanced:            balance === 0,
      priceFactor:         Number(this._priceFactor()).toFixed(2),
      repInfo:             this._getRepInfo(),
      mSearch: this._mSearch, pSearch: this._pSearch,
      mFilter: this._mFilter, pFilter: this._pFilter,
      mCats: mCats.map(c => ({ key:c, label:CAT_LABELS[c]??c, active: c===this._mFilter })),
      pCats: pCats.map(c => ({ key:c, label:CAT_LABELS[c]??c, active: c===this._pFilter })),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Drag из грида торговца → добавить в offer
    html.on("dragstart", ".tt-item[data-side='merchant']", e => {
      const itemId = e.currentTarget.dataset.itemId;
      this._dragData = { itemId, side: "merchant" };
      e.originalEvent?.dataTransfer?.setData("text/plain", JSON.stringify(this._dragData));
    });

    // Drag из грида игрока → добавить в playerOffer
    html.on("dragstart", ".tt-item[data-side='player']", e => {
      const itemId = e.currentTarget.dataset.itemId;
      this._dragData = { itemId, side: "player" };
      e.originalEvent?.dataTransfer?.setData("text/plain", JSON.stringify(this._dragData));
    });

    // Drop на зону offer торговца
    html.find(".tt-offer-zone[data-target='merchant']")
      .on("dragover", e => { e.preventDefault(); e.stopPropagation(); })
      .on("drop", e => {
        e.preventDefault();
        const data = this._dragData ?? this._parseTransfer(e);
        if (data?.side === "merchant") this._addToOffer(data.itemId, "merchant");
      });

    // Drop на зону offer игрока
    html.find(".tt-offer-zone[data-target='player']")
      .on("dragover", e => { e.preventDefault(); e.stopPropagation(); })
      .on("drop", e => {
        e.preventDefault();
        const data = this._dragData ?? this._parseTransfer(e);
        if (data?.side === "player") this._addToOffer(data.itemId, "player");
      });

    html.on("dragend", ".tt-item", () => { this._dragData = null; });

    // Двойной клик — добавить в offer
    html.on("dblclick", ".tt-item[data-side='merchant']", e => {
      if ($(e.target).closest(".tt-qty-ctrl").length) return;
      this._addToOffer(e.currentTarget.dataset.itemId, "merchant");
    });
    html.on("dblclick", ".tt-item[data-side='player']", e => {
      if ($(e.target).closest(".tt-qty-ctrl").length) return;
      this._addToOffer(e.currentTarget.dataset.itemId, "player");
    });

    // Убрать из offer
    html.on("click", "[data-remove-offer]", e => {
      const itemId = e.currentTarget.dataset.itemId;
      const side   = e.currentTarget.dataset.side;
      if (side === "merchant") this._offer = this._offer.filter(o => o.item.id !== itemId);
      else this._playerOffer = this._playerOffer.filter(o => o.item.id !== itemId);
      this.render(false);
    });

    // Сброс
    html.find("[data-reset]").on("click", () => {
      this._offer = []; this._playerOffer = [];
      this._mCoins = { copper:0, silver:0, gold:0 };
      this._pCoins = { copper:0, silver:0, gold:0 };
      this.render(false);
    });

    // Монеты в предложение (copper/silver/gold)
    html.on("change", "[data-m-coins]", e => {
      const cur = e.currentTarget.dataset.mCoins;
      this._mCoins[cur] = Math.max(0, Number(e.currentTarget.value) || 0);
      this.render(false);
    });
    html.on("change", "[data-p-coins]", e => {
      const cur = e.currentTarget.dataset.pCoins;
      this._pCoins[cur] = Math.max(0, Number(e.currentTarget.value) || 0);
      this.render(false);
    });

    // Поиск
    html.on("input", "[data-search-m]", e => { this._mSearch = e.currentTarget.value; this.render(false); });
    html.on("input", "[data-search-p]", e => { this._pSearch = e.currentTarget.value; this.render(false); });

    // Фильтры по категории
    html.on("click", "[data-filter-m]", e => { this._mFilter = e.currentTarget.dataset.filterM; this.render(false); });
    html.on("click", "[data-filter-p]", e => { this._pFilter = e.currentTarget.dataset.filterP; this.render(false); });

    // Tooltip позиционирование
    html.on("mouseenter", ".tt-item", e => {
      const tip = $(e.currentTarget).find(".tt-tooltip").first();
      if (!tip.length) return;
      const rect = e.currentTarget.getBoundingClientRect();
      let left = rect.right + 6;
      if (left + 200 > window.innerWidth) left = rect.left - 206;
      tip.css({ top: Math.max(4, rect.top), left: Math.max(4, left), display:"block" });
    });
    html.on("mouseleave", ".tt-item", e => {
      $(e.currentTarget).find(".tt-tooltip").css("display","none");
    });

    // Принять сделку
    html.find("[data-accept]").on("click", () => this._executeTrade());
    html.find("[data-accept-gm]").on("click", () => this._executeTrade(true));

    // Счётчик qty в offer
    html.on("click dblclick", ".tt-qty-dec", e => {
      e.stopPropagation(); e.preventDefault();
      if (e.type === "dblclick") return;
      const itemId = $(e.currentTarget).data("itemId");
      const side   = $(e.currentTarget).data("side");
      const list   = side === "merchant" ? this._offer : this._playerOffer;
      const entry  = list.find(o => o.item.id === itemId);
      if (entry) { entry.qty = Math.max(1, entry.qty - 1); this.render(false); }
    });
    html.on("click dblclick", ".tt-qty-inc", e => {
      e.stopPropagation(); e.preventDefault();
      if (e.type === "dblclick") return;
      const itemId = $(e.currentTarget).data("itemId");
      const side   = $(e.currentTarget).data("side");
      const list   = side === "merchant" ? this._offer : this._playerOffer;
      const entry  = list.find(o => o.item.id === itemId);
      if (entry) {
        const maxQty = Math.max(1, Number(entry.maxQty ?? entry.item.system?.quantity ?? 1));
        entry.qty = Math.min(maxQty, entry.qty + 1);
        this.render(false);
      }
    });
  }

  _parseTransfer(e) {
    try { return JSON.parse((e.originalEvent ?? e).dataTransfer?.getData("text/plain") ?? "{}"); }
    catch { return null; }
  }

  _addToOffer(itemId, side) {
    const actor = side === "merchant" ? this.merchant : this._buyer;
    const group = side === "merchant"
      ? this._mOfferGroups?.[itemId]
      : this._pOfferGroups?.[itemId];
    const item  = group?.item ?? actor?.items?.get(itemId);
    if (!item) return;
    const list  = side === "merchant" ? this._offer : this._playerOffer;
    const existing = list.find(o => o.item.id === itemId);
    const maxQty = Math.max(1, Number(group?.maxQty ?? item.system?.quantity ?? 1));
    if (existing) {
      existing.qty = Math.min(Number(existing.maxQty ?? maxQty), existing.qty + 1);
    } else {
      list.push({
        item,
        itemIds: group?.itemIds ?? [item.id],
        maxQty,
        qty: 1
      });
    }
    this.render(false);
  }

  async _executeTrade(gmForce = false) {
    if (this._busy) return;
    this._busy = true;
    try {
      await this.__doTrade(gmForce);
    } finally {
      this._busy = false;
    }
  }

  async __doTrade(gmForce = false) {
    const buyer    = this._buyer;
    const merchant = this.merchant;
    if (!buyer || !merchant) return;

    if (!gmForce) {
      const { requireNoPendingInventory } = await import("./pending-items-app.mjs").catch(() => ({}));
      const pendingCheck = requireNoPendingInventory
        ? await requireNoPendingInventory(buyer, { actionLabel: "торговля" })
        : { ok: true };
      if (!pendingCheck.ok) return;
    }

    const result = await executeTarkovTrade({
      buyer,
      merchant,
      merchantOffers: this._offer,
      playerOffers: this._playerOffer,
      merchantCoins: this._mCoins,
      playerCoins: this._pCoins,
      gmForce,
    });

    if (!result.ok) {
      const quote = result.quote ?? {};
      const suffix = quote.buyerPays && quote.buyerCoins !== undefined
        ? ` Нужно ${formatCurrency(quote.buyerPays)}, есть ${formatCurrency(quote.buyerCoins)}.`
        : "";
      ui.notifications.error(`${result.reason}${suffix}`);
      return;
    }

    const quote = result.quote;
    const merchantItems = result.merchantItems.length
      ? `Покупатель получает: ${result.merchantItems.map(o => `${o.name}×${o.qty}`).join(", ")}<br>`
      : "";
    const playerItems = result.playerItems.length
      ? `Торговец получает: ${result.playerItems.map(o => `${o.name}×${o.qty}`).join(", ")}<br>`
      : "";
    const moneyLine = gmForce
      ? "GM-сделка: монеты не двигались"
      : quote.buyerPays > 0 && quote.merchantPays > 0
        ? `Покупатель платит: ${formatCurrency(quote.buyerPays)} · Торговец платит: ${formatCurrency(quote.merchantPays)}`
        : quote.buyerPays > 0
          ? `Покупатель платит: ${formatCurrency(quote.buyerPays)}`
          : quote.merchantPays > 0
            ? `Торговец платит: ${formatCurrency(quote.merchantPays)}`
            : "Бартер";

    await ChatMessage.create({
      content: `<div style="padding:6px">🏪 <b>${buyer.name}</b> ↔ <b>${merchant.name}</b><br>${merchantItems}${playerItems}${moneyLine}</div>`
    });

    this._offer = []; this._playerOffer = [];
    this._mCoins = { copper:0, silver:0, gold:0 };
    this._pCoins = { copper:0, silver:0, gold:0 };

    // Открываем pending если нужно
    const { PendingItemsApp } = await import("./pending-items-app.mjs");
    await PendingItemsApp.openIfNeeded(result.buyer);

    // Обновляем все открытые окна инвентаря участников
    for (const app of Object.values(ui.windows ?? {})) {
      if (app.constructor?.name === "IronHillsGridInventoryApp") {
        const id = app.actor?.id;
        if (id === result.buyer?.id || id === result.merchant?.id) app.render(false);
      }
    }

    this.render(false);
  }
}
