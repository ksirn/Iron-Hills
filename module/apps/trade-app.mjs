import {
  getLiveActor,
  getPersistentActor,
  getCharacterActorByUuid,
  getTradeCharacterByUuidOrActive,
  getTradeCharacterOptions
} from "../utils/actor-utils.mjs";
import {
  getTradePriceModifiers,
  getItemTradeCategory,
  transferItemQuantityBetweenActors,
  changeActorCoins,
  changeMerchantWealth,
  getMerchantBuyPriceForItem
} from "../services/trade-service.mjs";
import {
  buildTradeSummary
} from "../services/actor-state-service.mjs";
import { debugLog, debugError } from "../utils/debug-utils.mjs";

// ─── Утилиты ────────────────────────────────────────────────

function getCoins(actor) {
  return {
    copper:   Number(actor?.system?.currency?.copper   ?? actor?.system?.coins?.copper   ?? 0),
    silver:   Number(actor?.system?.currency?.silver   ?? actor?.system?.coins?.silver   ?? 0),
    gold:     Number(actor?.system?.currency?.gold     ?? actor?.system?.coins?.gold     ?? 0),
    platinum: Number(actor?.system?.currency?.platinum ?? actor?.system?.coins?.platinum ?? 0)
  };
}

function coinsToCopper(coins) {
  return coins.copper + coins.silver * 100 + coins.gold * 10000 + coins.platinum * 1000000;
}

function copperToCoins(copper) {
  const platinum = Math.floor(copper / 1000000); copper %= 1000000;
  const gold     = Math.floor(copper / 10000);   copper %= 10000;
  const silver   = Math.floor(copper / 100);     copper %= 100;
  return { platinum, gold, silver, copper };
}

function itemCategory(item) {
  if (typeof getItemTradeCategory === "function") return getItemTradeCategory(item);
  const t = item?.type ?? "";
  if (t === "weapon") return "weapon";
  if (t === "armor")  return "armor";
  if (t === "consumable" || item?.system?.actionType?.startsWith("heal")) return "consumable";
  if (t === "material") return "material";
  return "misc";
}

const CATEGORY_LABELS = {
  weapon:     "Оружие",
  armor:      "Броня",
  consumable: "Расходники",
  material:   "Материалы",
  misc:       "Прочее"
};

const CURRENCY_ORDER = ["copper", "silver", "gold", "platinum"];
const CURRENCY_LABELS = { copper: "Медь", silver: "Серебро", gold: "Золото", platinum: "Платина" };

// ─── State ──────────────────────────────────────────────────
// offer = { itemId, name, qty, icon, category }
// coins = { copper, silver, gold, platinum }

class TradeState {
  constructor() {
    this.leftOffer  = [];  // что предлагает левая сторона (игрок)
    this.rightOffer = [];  // что предлагает правая сторона (торговец/NPC)
    this.leftCoins  = { copper: 0, silver: 0, gold: 0, platinum: 0 };
    this.rightCoins = { copper: 0, silver: 0, gold: 0, platinum: 0 };
    this.leftReady  = false;
    this.rightReady = false;
    this.bargainUsed = false;
    this.bargainDiscount = 0; // % скидки от торговли
    this.filter     = { left: "all", right: "all", leftSearch: "", rightSearch: "" };
  }

  reset() {
    this.leftOffer  = [];
    this.rightOffer = [];
    this.leftCoins  = { copper: 0, silver: 0, gold: 0, platinum: 0 };
    this.rightCoins = { copper: 0, silver: 0, gold: 0, platinum: 0 };
    this.leftReady  = false;
    this.rightReady = false;
    this.bargainUsed = false;
    this.bargainDiscount = 0;
  }

  addToOffer(side, item, qty = 1) {
    const offer = side === "left" ? this.leftOffer : this.rightOffer;
    const existing = offer.find(o => o.itemId === item.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, Number(item.system?.quantity ?? 1));
    } else {
      offer.push({
        itemId: item.id,
        name:   item.name,
        qty:    Math.min(qty, Number(item.system?.quantity ?? 1)),
        icon:   item.img ?? "icons/svg/item-bag.svg",
        category: itemCategory(item),
        basePrice: Number(item.system?.price ?? item.system?.basePrice ?? 0)
      });
    }
    // Сбрасываем готовность при изменении
    this.leftReady = false;
    this.rightReady = false;
  }

  removeFromOffer(side, itemId) {
    if (side === "left") {
      this.leftOffer = this.leftOffer.filter(o => o.itemId !== itemId);
    } else {
      this.rightOffer = this.rightOffer.filter(o => o.itemId !== itemId);
    }
    this.leftReady = false;
    this.rightReady = false;
  }

  totalOfferValue(side) {
    const offer = side === "left" ? this.leftOffer : this.rightOffer;
    const coins  = side === "left" ? this.leftCoins  : this.rightCoins;
    const itemVal = offer.reduce((sum, o) => sum + o.basePrice * o.qty, 0);
    return itemVal + coinsToCopper(coins);
  }

  balance() {
    return this.totalOfferValue("right") - this.totalOfferValue("left");
  }
}

// ─── App ────────────────────────────────────────────────────

class IronHillsTradeApp extends Application {

  constructor(merchantActor, options = {}) {
    super(options);
    this.merchant = merchantActor;
    this._characterUuid = "";
    this._busy = false;
    this._state = new TradeState();
    this._confirmTimeout = null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills", "trade-app"],
      width: 900,
      height: 700,
      resizable: true,
      title: "Торговля",
      dragDrop: [{ dragSelector: ".ih-trade-inv-item", dropSelector: ".ih-trade-offer-zone" }]
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/trade-app.hbs";
  }

  _getCharacter() {
    if (this._characterUuid) return getPersistentActor(getCharacterActorByUuid(this._characterUuid));
    return getPersistentActor(getTradeCharacterByUuidOrActive(""));
  }

  async getData() {
    const character = this._getCharacter();
    const merchant  = getLiveActor(this.merchant);
    const s = this._state;

    if (!this._characterUuid && character) {
      this._characterUuid = character.uuid;
    }

    const isGM = Boolean(game.user?.isGM);

    // Инвентари (за вычетом уже в предложении)
    const charItems    = this._buildInventoryView(character, "left");
    const merchantItems = this._buildInventoryView(merchant, "right");

    // Валюта
    const charCoins     = getCoins(character);
    const merchantCoins = getCoins(merchant);

    // Баланс
    const balance = s.balance();
    const balanceCoins = copperToCoins(Math.abs(balance));

    // Репутация
    const mods = character && merchant
      ? getTradePriceModifiers(character, merchant)
      : { relationScore: 0, buyModifier: 1, sellModifier: 1, relationPositive: true };

    return {
      isGM,
      merchantName: merchant?.name ?? "Торговец",
      merchantImg:  merchant?.img  ?? "",
      merchantTier: merchant?.system?.info?.tier ?? 1,
      characterName: character?.name ?? "—",
      characterImg:  character?.img  ?? "",
      tradeCharacterOptions: getTradeCharacterOptions(),
      characterUuid: this._characterUuid,

      tradeSummary: buildTradeSummary(merchant),
      reputation:   mods.relationScore ?? 0,
      reputationPositive: mods.relationPositive,

      // Инвентари
      charItems,
      merchantItems,
      charCategories:     this._categories(charItems),
      merchantCategories: this._categories(merchantItems),
      filterLeft:   s.filter.left,
      filterRight:  s.filter.right,
      searchLeft:   s.filter.leftSearch,
      searchRight:  s.filter.rightSearch,

      // Предложения
      leftOffer:  s.leftOffer,
      rightOffer: s.rightOffer,

      // Монеты в предложении
      leftCoins:  s.leftCoins,
      rightCoins: s.rightCoins,
      currencies: CURRENCY_ORDER.map(k => ({ key: k, label: CURRENCY_LABELS[k] })),

      // Монеты в наличии (для подсказок)
      charCoinCopper:     charCoins.copper,
      charCoinSilver:     charCoins.silver,
      charCoinGold:       charCoins.gold,
      charCoinPlatinum:   charCoins.platinum,

      // Статусы
      leftReady:   s.leftReady,
      rightReady:  s.rightReady,
      bothReady:   s.leftReady && s.rightReady,
      bargainUsed: s.bargainUsed,
      bargainDiscount: s.bargainDiscount,

      // Баланс
      balance,
      balanceAbs:   Math.abs(balance),
      balanceCoins,
      balanceSign:  balance > 0 ? "+" : balance < 0 ? "−" : "=",
      balanceClass: balance > 0 ? "is-good" : balance < 0 ? "is-bad" : "is-neutral",
    };
  }

  _buildInventoryView(actor, side) {
    if (!actor) return [];
    const s = this._state;
    const offerIds = (side === "left" ? s.leftOffer : s.rightOffer).map(o => o.itemId);
    const filter   = side === "left" ? s.filter.left  : s.filter.right;
    const search   = (side === "left" ? s.filter.leftSearch : s.filter.rightSearch).toLowerCase();

    return actor.items
      .filter(item => {
        if (offerIds.includes(item.id)) return false;
        if (filter !== "all" && itemCategory(item) !== filter) return false;
        if (search && !item.name.toLowerCase().includes(search)) return false;
        return true;
      })
      .map(item => ({
        id:       item.id,
        name:     item.name,
        img:      item.img ?? "icons/svg/item-bag.svg",
        qty:      Number(item.system?.quantity ?? 1),
        category: itemCategory(item),
        categoryLabel: CATEGORY_LABELS[itemCategory(item)] ?? "Прочее",
        tier:     Number(item.system?.tier ?? 1),
        price:    Number(item.system?.price ?? item.system?.basePrice ?? 0),
        side
      }));
  }

  _categories(items) {
    const cats = new Set(items.map(i => i.category));
    return [
      { key: "all", label: "Все" },
      ...Object.keys(CATEGORY_LABELS)
        .filter(k => cats.has(k))
        .map(k => ({ key: k, label: CATEGORY_LABELS[k] }))
    ];
  }

  // ─── Drag & Drop ─────────────────────────────────────────

  _onDragStart(event) {
    const el = event.currentTarget;
    const itemId = el.dataset.itemId;
    const side   = el.dataset.side;
    event.dataTransfer.setData("text/plain", JSON.stringify({ itemId, side }));
  }

  _onDrop(event) {
    event.preventDefault();
    let data;
    try { data = JSON.parse(event.dataTransfer.getData("text/plain")); }
    catch { return; }

    const { itemId, side } = data;
    const dropZone = event.currentTarget;
    const targetSide = dropZone.dataset.offerSide;

    // Перетаскивать можно только в свою сторону
    // Левая (игрок) → leftOffer, правая (торговец/GM) → rightOffer
    if (side !== targetSide) return;

    const character = this._getCharacter();
    const merchant  = getLiveActor(this.merchant);
    const actor = side === "left" ? character : merchant;
    if (!actor) return;

    const item = actor.items.get(itemId);
    if (!item) return;

    this._state.addToOffer(side, item, 1);
    this.render(false);
  }

  // ─── Listeners ───────────────────────────────────────────

  activateListeners(html) {
    super.activateListeners(html);

    // Drag items from inventory
    html.find(".ih-trade-inv-item").on("dragstart", this._onDragStart.bind(this));

    // Drop zones
    html.find(".ih-trade-offer-zone").on("dragover", e => e.preventDefault());
    html.find(".ih-trade-offer-zone").on("drop", this._onDrop.bind(this));

    // Double-click to add to offer
    html.find(".ih-trade-inv-item").on("dblclick", event => {
      const { itemId, side } = event.currentTarget.dataset;
      const actor = side === "left" ? this._getCharacter() : getLiveActor(this.merchant);
      if (!actor) return;
      const item = actor.items.get(itemId);
      if (item) { this._state.addToOffer(side, item, 1); this.render(false); }
    });

    // Remove from offer
    html.find("[data-remove-offer]").on("click", event => {
      const { itemId, side } = event.currentTarget.dataset;
      this._state.removeFromOffer(side, itemId);
      this.render(false);
    });

    // Character select
    html.find("[data-char-select]").on("change", event => {
      this._characterUuid = event.currentTarget.value;
      this._state.reset();
      this.render(false);
    });

    // Coin inputs
    html.find("[data-coin-input]").on("change", event => {
      const { side, currency } = event.currentTarget.dataset;
      const val = Math.max(0, parseInt(event.currentTarget.value) || 0);
      if (side === "left")  this._state.leftCoins[currency]  = val;
      if (side === "right") this._state.rightCoins[currency] = val;
      this.render(false);
    });

    // Filter
    html.find("[data-filter]").on("click", event => {
      const { side, category } = event.currentTarget.dataset;
      if (side === "left")  this._state.filter.left  = category;
      if (side === "right") this._state.filter.right = category;
      this.render(false);
    });

    // Search
    html.find("[data-search]").on("input", event => {
      const side = event.currentTarget.dataset.side;
      const val  = event.currentTarget.value;
      if (side === "left")  this._state.filter.leftSearch  = val;
      if (side === "right") this._state.filter.rightSearch = val;
      this.render(false);
    });

    // Кнопка "Поторговаться"
    html.find("[data-bargain]").on("click", async () => {
      await this._doBargain();
    });

    // Кнопка "Уравнять"
    html.find("[data-equalize]").on("click", () => {
      this._equalize();
    });

    // Готов (игрок)
    html.find("[data-ready-left]").on("click", () => {
      this._state.leftReady = !this._state.leftReady;
      this._checkBothReady();
      this.render(false);
    });

    // Готов (GM за торговца)
    html.find("[data-ready-right]").on("click", () => {
      if (!game.user?.isGM) {
        ui.notifications.warn("Только GM может подтвердить за торговца.");
        return;
      }
      this._state.rightReady = !this._state.rightReady;
      this._checkBothReady();
      this.render(false);
    });

    // Отмена
    html.find("[data-cancel-trade]").on("click", () => {
      this._state.reset();
      this.render(false);
    });
  }

  // ─── Bargain ─────────────────────────────────────────────

  async _doBargain() {
    if (this._state.bargainUsed) {
      ui.notifications.warn("Попытка торговаться уже использована.");
      return;
    }

    const character = this._getCharacter();
    if (!character) return;

    const tradeSkill = Number(character.system?.skills?.trade?.value ?? character.system?.skills?.persuasion?.value ?? 1);
    const dieSize = tradeSkill * 2;

    // Диалог — выбор желаемой скидки (сложность растёт)
    const discountChoice = await Dialog.wait({
      title: "Поторговаться",
      content: `
        <p>Навык торговли: <b>d${dieSize}</b></p>
        <p>Выберите желаемую скидку:</p>
        <select id="bargain-discount" style="width:100%;padding:6px;background:#1b2333;color:#e8edf5;border:1px solid rgba(120,150,200,0.3);border-radius:6px;">
          <option value="10">10% — Порог 3 (лёгко)</option>
          <option value="20">20% — Порог 5 (нормально)</option>
          <option value="30">30% — Порог 7 (сложно)</option>
          <option value="40">40% — Порог 9 (очень сложно)</option>
          <option value="50">50% — Порог ${dieSize} (почти невозможно)</option>
        </select>
      `,
      buttons: {
        roll: { label: "Бросить!", icon: "<i class='fas fa-dice'></i>" },
        cancel: { label: "Отмена" }
      },
      default: "roll"
    });

    if (!discountChoice) return;

    const desiredDiscount = parseInt(document.getElementById("bargain-discount")?.value ?? "10");
    const thresholds = { 10: 3, 20: 5, 30: 7, 40: 9, 50: dieSize };
    const threshold = thresholds[desiredDiscount] ?? 5;

    const roll = await new Roll(`1d${dieSize}`).evaluate();
    const result = roll.total;
    const isAnticrit = result === 1 && dieSize > 2;
    const isCrit = result === dieSize && dieSize > 2;
    const success = result >= threshold;

    this._state.bargainUsed = true;

    let msg = `<b>${character.name}</b> пытается поторговаться (d${dieSize} = <b>${result}</b>, порог: ${threshold}).<br>`;

    if (isAnticrit) {
      msg += `<b style="color:#f87171">💀 Антикрит! Торговец обиделся — сессия торговли закрыта.</b>`;
      // Небольшой штраф к репутации
      const repPath = `system.relations.${getLiveActor(this.merchant)?.name}`;
      await character.update({ [repPath]: Math.max(-100, (character.system?.relations?.[getLiveActor(this.merchant)?.name] ?? 0) - 5) }).catch(() => {});
      await ChatMessage.create({ content: msg });
      this.close();
      return;
    }

    if (success) {
      const bonus = isCrit ? desiredDiscount + 10 : desiredDiscount;
      this._state.bargainDiscount = Math.min(50, bonus);
      // Применяем скидку к базовым ценам предметов в инвентаре торговца
      msg += isCrit
        ? `<b style="color:#4ade80">✦ Крит! Скидка ${bonus}% получена + небольшой бонус к репутации!</b>`
        : `<b style="color:#4ade80">✓ Успех! Скидка ${desiredDiscount}%.</b>`;
    } else {
      this._state.bargainDiscount = 0;
      msg += `<span style="color:#a8b8d0">✗ Провал. Торговец не уступает.</span>`;
    }

    await ChatMessage.create({ content: msg });
    this.render(false);
  }

  // ─── Equalize ────────────────────────────────────────────

  _equalize() {
    const balance = this._state.balance();
    if (balance === 0) return;

    // balance > 0: торговец предлагает больше → игрок должен добавить монет
    // balance < 0: игрок предлагает больше → торговец должен добавить монет
    const side   = balance > 0 ? "left" : "right";
    const amount = Math.abs(balance);
    const coins  = copperToCoins(amount);

    if (side === "left") {
      this._state.leftCoins  = coins;
    } else {
      this._state.rightCoins = coins;
    }

    this.render(false);
  }

  // ─── Both ready → execute ────────────────────────────────

  _checkBothReady() {
    if (!this._state.leftReady || !this._state.rightReady) return;

    // Запускаем таймер 3 сек
    if (this._confirmTimeout) clearTimeout(this._confirmTimeout);
    ui.notifications.info("Оба готовы! Обмен через 3 секунды...");

    this._confirmTimeout = setTimeout(async () => {
      if (this._state.leftReady && this._state.rightReady) {
        await this._executeTrade();
      }
    }, 3000);
  }

  // ─── Execute trade ───────────────────────────────────────

  async _executeTrade() {
    if (this._busy) return;
    this._busy = true;

    const character = this._getCharacter();
    const merchant  = getLiveActor(this.merchant);

    if (!character || !merchant) {
      ui.notifications.error("Ошибка: не найден персонаж или торговец.");
      this._busy = false;
      return;
    }

    try {
      const s = this._state;
      const updates = [];

      // Передать предметы из предложения игрока → торговцу
      for (const offer of s.leftOffer) {
        const item = character.items.get(offer.itemId);
        if (item) {
          await transferItemQuantityBetweenActors(character, merchant, item, offer.qty);
        }
      }

      // Передать предметы из предложения торговца → игроку
      for (const offer of s.rightOffer) {
        const item = merchant.items.get(offer.itemId);
        if (item) {
          await transferItemQuantityBetweenActors(merchant, character, item, offer.qty);
        }
      }

      // Передать монеты игрока → торговцу
      const leftCopper = coinsToCopper(s.leftCoins);
      if (leftCopper > 0) {
        await changeActorCoins(character, -leftCopper);
        await changeMerchantWealth(merchant, leftCopper);
      }

      // Передать монеты торговца → игроку
      const rightCopper = coinsToCopper(s.rightCoins);
      if (rightCopper > 0) {
        await changeMerchantWealth(merchant, -rightCopper);
        await changeActorCoins(character, rightCopper);
      }

      // Лог в чат
      const leftDesc  = [
        ...s.leftOffer.map(o => `${o.name} ×${o.qty}`),
        ...CURRENCY_ORDER.filter(k => s.leftCoins[k] > 0).map(k => `${s.leftCoins[k]} ${CURRENCY_LABELS[k]}`)
      ].join(", ") || "—";

      const rightDesc = [
        ...s.rightOffer.map(o => `${o.name} ×${o.qty}`),
        ...CURRENCY_ORDER.filter(k => s.rightCoins[k] > 0).map(k => `${s.rightCoins[k]} ${CURRENCY_LABELS[k]}`)
      ].join(", ") || "—";

      await ChatMessage.create({
        content: `
          <div style="border:1px solid rgba(91,156,246,0.3);border-radius:8px;padding:10px;background:rgba(91,156,246,0.05);">
            <b>✦ Торговая сделка заключена</b><br>
            <b>${character.name}</b> отдаёт: ${leftDesc}<br>
            <b>${merchant.name}</b> отдаёт: ${rightDesc}
          </div>
        `
      });

      this._state.reset();
      this.render(false);
      if (character.sheet?.rendered) character.sheet.render(false);

    } catch (err) {
      debugError("TradeApp._executeTrade", err);
      ui.notifications.error(`Ошибка обмена: ${err.message}`);
    } finally {
      this._busy = false;
    }
  }
}

export { IronHillsTradeApp };
