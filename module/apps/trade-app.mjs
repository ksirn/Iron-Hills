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

/** Получить баланс актора в меди (из system.currency или system.economy.coins) */
function getActorCurrencyCopper(actor) {
  const cur = actor.system?.currency;
  if (cur) {
    return (Number(cur.copper   ?? 0))
         + (Number(cur.silver   ?? 0)) * 100
         + (Number(cur.gold     ?? 0)) * 10000
         + (Number(cur.platinum ?? 0)) * 1000000;
  }
  // Fallback: system.economy.coins (старый формат)
  return Number(actor.system?.economy?.coins ?? 0);
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

// Форматирует цену в меди в читаемый вид (наибольшая валюта)
function formatPrice(copper) {
  if (!copper || copper <= 0) return { val: "—", currency: "", cssClass: "" };
  if (copper >= 1000000) return { val: (copper / 1000000).toFixed(copper % 1000000 === 0 ? 0 : 1), currency: "пл.", cssClass: "ih-trade-price-platinum" };
  if (copper >= 10000)   return { val: (copper / 10000).toFixed(copper % 10000 === 0 ? 0 : 1),   currency: "зол.", cssClass: "ih-trade-price-gold" };
  if (copper >= 100)     return { val: (copper / 100).toFixed(copper % 100 === 0 ? 0 : 1),       currency: "сер.", cssClass: "ih-trade-price-silver" };
  return { val: copper, currency: "мед.", cssClass: "ih-trade-price-copper" };
}

// Взрыв кубов для любого навыка — используется в торговле, атаке и т.д.
async function explodingDiceRoll(skillValue) {
  const rolls = [];
  let total = 0;
  let currentDie = Math.max(2, skillValue * 2);
  let exploded = false;

  while (true) {
    const roll = await new Roll(`1d${currentDie}`).evaluate();
    const result = roll.total;
    rolls.push({ die: currentDie, result });
    total = result; // берём результат последнего куба, не сумму

    // d2 не взрывается — монетка есть монетка
    if (currentDie === 2) break;

    // Не максимум — стоп
    if (result < currentDie) break;

    // Максимум — предлагаем перейти на следующий куб
    const nextDie = Math.min(currentDie + 2, 20);
    if (nextDie === currentDie) break; // уже d20

    const confirmed = await Dialog.confirm({
      title: "💥 Взрыв куба!",
      content: `
        <div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;padding:4px;">
          <p>Выпало <b style="color:#facc15;font-size:18px">${result}</b> на d${currentDie} — максимум!</p>
          <p>Перейти на <b style="color:#5b9cf6">d${nextDie}</b>? Результат может быть и хуже.</p>
          <p style="font-size:11px;color:#6a7d99;">Отмена — зафиксировать ${result}</p>
        </div>
      `
    });

    if (!confirmed) break;
    exploded = true;
    currentDie = nextDie;
  }

  return { total, rolls, exploded };
}



// ─── State ──────────────────────────────────────────────────
// offer = { itemId, name, qty, icon, category }
// coins = { copper, silver, gold, platinum }

function makeTradeState() {
  return {
    leftOffer:       [],
    rightOffer:      [],
    leftCoins:       { copper: 0, silver: 0, gold: 0, platinum: 0 },
    rightCoins:      { copper: 0, silver: 0, gold: 0, platinum: 0 },
    leftReady:       false,
    rightReady:      false,
    bargainUsed:     false,
    bargainDiscount: 0,
    filter: { left: "all", right: "all", leftSearch: "", rightSearch: "" }
  };
}

function resetState(s) {
  s.leftOffer       = [];
  s.rightOffer      = [];
  s.leftCoins       = { copper: 0, silver: 0, gold: 0, platinum: 0 };
  s.rightCoins      = { copper: 0, silver: 0, gold: 0, platinum: 0 };
  s.leftReady       = false;
  s.rightReady      = false;
  s.bargainUsed     = false;
  s.bargainDiscount = 0;
}

function addToOffer(s, side, item, qty = 1) {
  const offer = side === "left" ? s.leftOffer : s.rightOffer;
  const existing = offer.find(o => o.itemId === item.id);
  const maxQty = Number(item.system?.quantity ?? 1);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, maxQty);
  } else {
    offer.push({
      itemId:    item.id,
      name:      item.name,
      qty:       Math.min(qty, maxQty),
      icon:      item.img ?? "icons/svg/item-bag.svg",
      category:  itemCategory(item),
      basePrice: Number(item.system?.price ?? item.system?.basePrice ?? 0)
    });
  }
  s.leftReady  = false;
  s.rightReady = false;
}

function removeFromOffer(s, side, itemId) {
  if (side === "left")  s.leftOffer  = s.leftOffer.filter(o => o.itemId !== itemId);
  else                  s.rightOffer = s.rightOffer.filter(o => o.itemId !== itemId);
  s.leftReady  = false;
  s.rightReady = false;
}

function totalOfferValue(s, side) {
  const offer = Array.isArray(side === "left" ? s.leftOffer : s.rightOffer)
    ? (side === "left" ? s.leftOffer : s.rightOffer)
    : [];
  const coins = side === "left" ? (s.leftCoins ?? {}) : (s.rightCoins ?? {});
  const itemVal = offer.reduce((sum, o) => sum + (o?.basePrice ?? 0) * (o?.qty ?? 1), 0);
  return itemVal + coinsToCopper(coins);
}

function tradeBalance(s) {
  return totalOfferValue(s, "right") - totalOfferValue(s, "left");
}

// ─── App ────────────────────────────────────────────────────

class IronHillsTradeApp extends Application {

  constructor(merchantActor, options = {}) {
    super(options);
    this.merchant = merchantActor;
    this._characterUuid = "";
    this._busy = false;
    this._tradeState = makeTradeState();
    this._confirmTimeout = null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills", "trade-app"],
      width: 900,
      height: 700,
      resizable: true,
      title: "Торговля",
      dragDrop: []
    });
  }

  setPosition(options = {}) {
    // Защита от падения когда element ещё не в DOM
    if (!this.element || !this.element[0] || !document.body.contains(this.element[0])) return;
    return super.setPosition(options);
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/trade-app.hbs";
  }

  async _requestPlayerConfirmation(userId, message) {
    return new Promise(resolve => {
      // GM — автоматически подтверждает
      if (game.user?.isGM) { resolve(true); return; }

      // Если это наш запрос — показываем диалог
      if (userId === game.user?.id) {
        Dialog.confirm({
          title: "Запрос торговли",
          content: `<p style="color:#a8b8d0">${message}</p>`
        }).then(resolve);
        return;
      }

      // Отправляем через socket и ждём ответа
      const reqId = foundry.utils.randomID();

      // Listener на ответ
      const handler = (data) => {
        if (data.reqId !== reqId) return;
        game.socket?.off("system.iron-hills-system", handler);
        resolve(data.confirmed);
      };
      game.socket?.on("system.iron-hills-system", handler);

      // Отправляем запрос
      game.socket?.emit("system.iron-hills-system", {
        type: "tradeConfirmRequest",
        reqId,
        targetUserId: userId,
        message,
        fromName: game.user?.name
      });

      // Таймаут 30 секунд
      setTimeout(() => {
        game.socket?.off("system.iron-hills-system", handler);
        resolve(false);
      }, 30000);
    });
  }

  _getCharacter() {
    // Явно выбран UUID (торговля за другого) — используем его
    if (this._characterUuid) return getPersistentActor(getCharacterActorByUuid(this._characterUuid));
    // Привязка к открывшему окно игроку
    const controlled = canvas.tokens?.controlled ?? [];
    for (const t of controlled) {
      if (t.actor?.type === "character" && t.actor.hasPlayerOwner) return getPersistentActor(t.actor);
    }
    const userChar = game.user?.character;
    if (userChar) return getPersistentActor(userChar);
    return getPersistentActor(getTradeCharacterByUuidOrActive(""));
  }

  async getData() {
    // Гарантируем что state инициализирован
    if (!this._tradeState || typeof this._tradeState !== "object") this._tradeState = makeTradeState();
    const s = this._tradeState;
    if (!Array.isArray(s.leftOffer))  s.leftOffer  = [];
    if (!Array.isArray(s.rightOffer)) s.rightOffer = [];
    if (!s.leftCoins  || typeof s.leftCoins  !== "object") s.leftCoins  = { copper:0, silver:0, gold:0, platinum:0 };
    if (!s.rightCoins || typeof s.rightCoins !== "object") s.rightCoins = { copper:0, silver:0, gold:0, platinum:0 };
    if (!s.filter     || typeof s.filter     !== "object") s.filter     = { left:"all", right:"all", leftSearch:"", rightSearch:"" };

    const character = this._getCharacter();
    const merchant  = getLiveActor(this.merchant);

    if (!this._characterUuid && character) {
      this._characterUuid = character.uuid;
    }

    const isGM = Boolean(game.user?.isGM);

    // Инвентари (за вычетом уже в предложении)
    const charItems     = character ? (this._buildInventoryView(character, "left")  ?? []) : [];
    const merchantItems = merchant  ? (this._buildInventoryView(merchant,  "right") ?? []) : [];

    // Валюта
    const charCoins     = getCoins(character);
    const merchantCoins = getCoins(merchant);

    // Баланс
    const balance = tradeBalance(s);
    const balanceCoins = copperToCoins(Math.abs(balance));

    // Репутация
    const mods = character && merchant
      ? getTradePriceModifiers(character, merchant)
      : { relationScore: 0, buyModifier: 1, sellModifier: 1, relationPositive: true };

    // Экономический модификатор от симуляции поселения
    const marketFactor = Number(merchant?.system?.market?.currentPriceFactor ?? 1);
    // Применяем к обоим модификаторам
    if (marketFactor !== 1) {
      mods.buyModifier  = +(mods.buyModifier  * marketFactor).toFixed(3);
      mods.sellModifier = +(mods.sellModifier / marketFactor).toFixed(3);
    }
    const marketLabel = marketFactor > 1.1 ? "📈 Дефицит"
      : marketFactor < 0.9 ? "📉 Избыток"
      : "⚖ Норма";

    // Раскладываем монеты предложений в плоские поля для шаблона
    const leftCoinsFlat  = { ...s.leftCoins };
    const rightCoinsFlat = { ...s.rightCoins };

    // Форматируем валюту как массив с value для шаблона
    const currenciesWithValues = CURRENCY_ORDER.map(k => ({
      key:        k,
      label:      CURRENCY_LABELS[k],
      leftValue:  leftCoinsFlat[k]  ?? 0,
      rightValue: rightCoinsFlat[k] ?? 0
    }));

    // Считаем кошельки с учётом монет в предложении
    const charTotalCopper     = coinsToCopper(charCoins);
    const merchantTotalCopper = coinsToCopper(merchantCoins);
    const offerLeftCopper     = coinsToCopper(s.leftCoins);
    const offerRightCopper    = coinsToCopper(s.rightCoins);

    // Монеты после сделки (предварительно)
    const charAfter     = copperToCoins(Math.max(0, charTotalCopper     - offerLeftCopper  + offerRightCopper));
    const merchantAfter = copperToCoins(Math.max(0, merchantTotalCopper - offerRightCopper + offerLeftCopper));

    return {
      isGM,
      merchantName: merchant?.name ?? "Торговец",
      merchantImg:  merchant?.img  ?? "",
      merchantTier: merchant?.system?.info?.tier ?? 1,
      characterName: character?.name ?? "—",
      characterImg:  character?.img  ?? "",
      // Кошельки
      charCoins, merchantCoins,
      charAfter, merchantAfter,
      charTotalCopper, merchantTotalCopper,
      marketFactor, marketLabel,
      tradeCharacterOptions: [], // дропдаун убран — торговля только от своего персонажа
      characterUuid: this._characterUuid,

      tradeSummary: merchant ? buildTradeSummary(merchant) : {},
      reputation:   mods.relationScore ?? 0,
      reputationPositive: mods.relationPositive,
      marketFactor: marketFactor,
      marketLabel:  marketLabel,

      // Инвентари
      charItems:     charItems     ?? [],
      merchantItems: merchantItems ?? [],
      charCategories:     this._categories(charItems     ?? []),
      merchantCategories: this._categories(merchantItems ?? []),
      filterLeft:   s.filter.left,
      filterRight:  s.filter.right,
      searchLeft:   s.filter.leftSearch,
      searchRight:  s.filter.rightSearch,

      // Предложения
      leftOffer:  s.leftOffer  ?? [],
      rightOffer: s.rightOffer ?? [],

      // Монеты — плоские поля + массив для итерации
      currencies: currenciesWithValues,

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
    const items = actor.items;
    if (!items) return [];

    const s = this._tradeState;
    const leftOff  = Array.isArray(s.leftOffer)  ? s.leftOffer  : [];
    const rightOff = Array.isArray(s.rightOffer) ? s.rightOffer : [];
    const offerIds = (side === "left" ? leftOff : rightOff).map(o => o.itemId);
    const filter   = side === "left" ? (s.filter?.left  ?? "all") : (s.filter?.right ?? "all");
    const search   = ((side === "left" ? s.filter?.leftSearch : s.filter?.rightSearch) ?? "").toLowerCase();

    const result = [];
    for (const item of items) {
      if (!item?.id || !item?.name) continue;
      if (filter !== "all" && itemCategory(item) !== filter) continue;
      if (search && !item.name.toLowerCase().includes(search)) continue;

      // Показываем оставшееся количество (total - в предложении)
      const totalQty  = Number(item.system?.quantity ?? 1);
      const inOffer   = (side === "left" ? leftOff : rightOff)
                          .find(o => o.itemId === item.id);
      const offeredQty = inOffer?.qty ?? 0;
      const remainQty  = totalQty - offeredQty;
      if (remainQty <= 0) continue; // всё уже в предложении

      // Данные для тултипа
      const sys = item.system ?? {};
      const tooltipParts = [];
      // Оружие
      if (sys.damage)     tooltipParts.push(`⚔ Урон: ${sys.damage}`);
      if (sys.skill)      tooltipParts.push(`🎯 Навык: ${sys.skill}`);
      if (sys.energyCost) tooltipParts.push(`⚡ Энергия: ${sys.energyCost}`);
      if (sys.timeCost)   tooltipParts.push(`⏱ Время: ${sys.timeCost}с`);
      if (sys.twoHanded)  tooltipParts.push(`🤲 Двуручное`);
      // Броня
      if (sys.protection?.physical) tooltipParts.push(`🛡 Физ: ${sys.protection.physical}`);
      if (sys.protection?.magical)  tooltipParts.push(`✨ Маг: ${sys.protection.magical}`);
      // Еда
      if (sys.satiety)    tooltipParts.push(`🍖 Сытость: +${sys.satiety}`);
      if (sys.hydration)  tooltipParts.push(`💧 Жажда: +${sys.hydration}`);
      // Зелья
      if (sys.power && sys.actionType) {
        const ACTION_LABELS = {
          healHp:      `❤ Лечение: +${sys.power} HP`,
          restoreEnergy: `⚡ Энергия: +${sys.power}`,
          restoreMana:   `💧 Мана: +${sys.power}`,
          buffStrength:  `💪 Сила: +${sys.power}`,
          curePoison:    `☠ Лечит яд`,
          healBleeding:  `🩸 Останавливает кровотечение`,
        };
        tooltipParts.push(ACTION_LABELS[sys.actionType] ?? `✦ Сила: ${sys.power}`);
      }
      // Заклинания
      if (sys.school)     tooltipParts.push(`✨ ${sys.school} ранг ${sys.rank ?? 1}`);
      if (sys.manaCost)   tooltipParts.push(`💧 Мана: ${sys.manaCost}`);
      if (sys.damage && sys.school) tooltipParts.push(`⚔ Урон: ${sys.damage}`);
      // Материалы
      if (sys.category)   tooltipParts.push(`📦 ${sys.category}`);
      // Общее
      if (sys.weight)     tooltipParts.push(`⚖ ${sys.weight} кг`);
      const desc = sys.description ?? sys.desc ?? sys.flavor ?? sys.effect ?? "";

      result.push({
        id:            item.id,
        name:          item.name,
        img:           item.img ?? "icons/svg/item-bag.svg",
        qty:           remainQty,
        multiQty:      remainQty > 1,
        category:      itemCategory(item),
        categoryLabel: CATEGORY_LABELS[itemCategory(item)] ?? "Прочее",
        tier:          Number(item.system?.tier ?? 1),
        price:         Number(item.system?.price ?? item.system?.basePrice ?? 0),
        priceFormatted: formatPrice(Number(
          item.system?.price > 0     ? item.system.price     :
          item.system?.basePrice > 0 ? item.system.basePrice :
          item.system?.value  > 0    ? item.system.value     : 0
        )),
        side,
        tooltipStats: tooltipParts.join(" · "),
        tooltipDesc:  desc ? String(desc).replace(/<[^>]+>/g, "").slice(0, 120) : "",
      });
    }
    return result;
  }

  _categories(items) {
    if (!Array.isArray(items)) return [{ key: "all", label: "Все" }];
    const cats = new Set(items.map(i => i.category));
    return [
      { key: "all", label: "Все" },
      ...Object.keys(CATEGORY_LABELS)
        .filter(k => cats.has(k))
        .map(k => ({ key: k, label: CATEGORY_LABELS[k] }))
    ];
  }

  // ─── Drag & Drop (нативный HTML5) ───────────────────────

  _onDragStart(event) {
    const el = event?.currentTarget;
    if (!el) return;
    const itemId = el.dataset?.itemId;
    const side   = el.dataset?.side;
    if (!itemId || !side) return;
    this._dragData = { itemId, side };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      try { event.dataTransfer.setData("text/plain", JSON.stringify({ itemId, side })); } catch(e) {}
    }
  }

  _onDrop(event) {
    if (event?.preventDefault) event.preventDefault();
    if (event?.stopPropagation) event.stopPropagation();

    let data = this._dragData ?? null;
    if (!data && event?.dataTransfer) {
      try { const raw = event.dataTransfer.getData("text/plain"); if (raw) data = JSON.parse(raw); } catch(e) {}
    }
    this._dragData = null;
    if (!data?.itemId || !data?.side) return;

    const { itemId, side } = data;
    const targetSide = event?.currentTarget?.dataset?.offerSide;
    const isGM = Boolean(game.user?.isGM);
    if (side === "left"  && targetSide !== "left")               return;
    if (side === "right" && targetSide !== "right" && !isGM)     return;

    const character = this._getCharacter();
    const merchant  = getLiveActor(this.merchant);
    const actor = side === "left" ? character : merchant;
    if (!actor) return;
    const item = actor.items.get(itemId);
    if (!item) return;

    if (!this._tradeState) this._tradeState = makeTradeState();
    if (!Array.isArray(this._tradeState.leftOffer))  this._tradeState.leftOffer  = [];
    if (!Array.isArray(this._tradeState.rightOffer)) this._tradeState.rightOffer = [];

    addToOffer(this._tradeState, side, item, 1);
    this.render(false);
  }

  // ─── Listeners ───────────────────────────────────────────

  activateListeners(html) {
    super.activateListeners(html);

    // Drag items from inventory (нативные HTML5 события)
    html.find(".ih-trade-inv-item").on("dragstart", (e) => this._onDragStart(e.originalEvent ?? e));

    // Drop zones
    html.find(".ih-trade-offer-zone").on("dragover",  e => { e.preventDefault(); e.stopPropagation(); });
    html.find(".ih-trade-offer-zone").on("dragleave", e => { e.currentTarget.classList.remove("drag-over"); });
    html.find(".ih-trade-offer-zone").on("dragenter", e => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); });
    html.find(".ih-trade-offer-zone").on("drop", (e) => {
      e.currentTarget.classList.remove("drag-over");
      this._onDrop(e.originalEvent ?? e);
    });

    // Double-click to add to offer
    html.find(".ih-trade-inv-item").on("dblclick", event => {
      // Игнорируем если клик внутри счётчика или кнопки добавления
      if ($(event.target).closest(".ih-trade-qty-ctrl, .ih-trade-add-btn").length) return;
      const { itemId, side } = event.currentTarget.dataset;
      this._addFromCounter(itemId, side, html);
    });

    // Remove from offer
    html.find("[data-remove-offer]").on("click", event => {
      const { itemId, side } = event.currentTarget.dataset;
      removeFromOffer(this._tradeState, side, itemId);
      this.render(false);
    });

    // Character select
    // Торговать за другого игрока — запрос подтверждения
    html.find("[data-trade-for-other]").on("click", async () => {
      if (!game.user?.isGM && !game.user?.character) return;

      // Список персонажей других игроков онлайн
      const others = game.users
        .filter(u => u.active && u.id !== game.user.id && u.character)
        .map(u => ({ id: u.id, name: u.character.name, charUuid: u.character.uuid, userId: u.id }));

      if (!others.length) { ui.notifications.warn("Нет других активных игроков с персонажами."); return; }

      const buttons = {};
      for (const o of others) {
        buttons[o.id] = { label: o.name, callback: () => o };
      }

      const chosen = await Dialog.wait({
        title: "Торговать за другого",
        content: `<p style="color:#a8b8d0">Выбери персонажа от чьего имени торговать.<br>
          <small>Этому игроку придёт запрос подтверждения.</small></p>`,
        buttons,
        default: Object.keys(buttons)[0]
      });
      if (!chosen) return;

      // Отправляем запрос через socket
      const confirmed = await this._requestPlayerConfirmation(chosen.userId,
        `${game.user.character?.name ?? game.user.name} хочет торговать от твоего имени. Разрешить?`
      );

      if (confirmed) {
        this._characterUuid = chosen.charUuid;
        this.render(false);
        ui.notifications.info(`Торговля от имени ${chosen.name}`);
      } else {
        ui.notifications.warn("Игрок отказал.");
      }
    });

    html.find("[data-char-select]").on("change", event => {
      this._characterUuid = event.currentTarget.value;
      resetState(this._tradeState);
      this.render(false);
    });

    // Coin inputs
    html.find("[data-coin-input]").on("change", event => {
      const { side, currency } = event.currentTarget.dataset;
      const val = Math.max(0, parseInt(event.currentTarget.value) || 0);
      if (side === "left")  this._tradeState.leftCoins[currency]  = val;
      if (side === "right") this._tradeState.rightCoins[currency] = val;
      this.render(false);
    });

    // Filter
    html.find("[data-filter]").on("click", event => {
      const { side, category } = event.currentTarget.dataset;
      if (side === "left")  this._tradeState.filter.left  = category;
      if (side === "right") this._tradeState.filter.right = category;
      this.render(true);
    });

    // Search
    html.find("[data-search]").on("input", event => {
      const side = event.currentTarget.dataset.side;
      const val  = event.currentTarget.value;
      if (side === "left")  this._tradeState.filter.leftSearch  = val;
      if (side === "right") this._tradeState.filter.rightSearch = val;
      this.render(true);
    });

    // Кнопка "Поторговаться"
    // ── Счётчик количества ──────────────────────────────────
    // Кнопка "−"
    html.on("click", "[data-qty-dec]", e => {
      e.stopPropagation();
      const ctrl  = $(e.currentTarget).closest(".ih-trade-qty-ctrl");
      const input = ctrl.find("[data-qty-input]");
      const max   = Number(ctrl.data("max")) || 1;
      input.val(Math.max(1, Number(input.val()) - 1));
    });

    // Кнопка "+"
    html.on("click", "[data-qty-inc]", e => {
      e.stopPropagation();
      const ctrl  = $(e.currentTarget).closest(".ih-trade-qty-ctrl");
      const input = ctrl.find("[data-qty-input]");
      const max   = Number(ctrl.data("max")) || 1;
      input.val(Math.min(max, Number(input.val()) + 1));
    });

    // Ввод вручную — клamp в пределах доступного
    html.on("change", "[data-qty-input]", e => {
      e.stopPropagation();
      const ctrl = $(e.currentTarget).closest(".ih-trade-qty-ctrl");
      const max  = Number(ctrl.data("max")) || 1;
      $(e.currentTarget).val(Math.max(1, Math.min(max, Number($(e.currentTarget).val()) || 1)));
    });

    // Клик внутри поля — не провоцировать dblclick
    html.on("click mousedown", "[data-qty-input]", e => e.stopPropagation());

    // Кнопка → "Добавить в предложение"
    html.on("click", "[data-add-to-offer]", e => {
      e.stopPropagation();
      const btn    = $(e.currentTarget);
      const itemId = btn.data("itemId") ?? btn.attr("data-item-id");
      const side   = btn.data("side")   ?? btn.attr("data-side");
      this._addFromCounter(itemId, side, html);
    });
    // ──────────────────────────────────────────────────────

        html.find("[data-bargain]").on("click", async () => {
      await this._doBargain();
    });

    // Кнопка "Уравнять"
    html.find("[data-equalize]").on("click", () => {
      this._equalize();
    });

    // Готов (игрок)
    html.find("[data-ready-left]").on("click", () => {
      this._tradeState.leftReady = !this._tradeState.leftReady;
      this._checkBothReady();
      this.render(false);
    });

    // Готов (GM за торговца)
    html.find("[data-ready-right]").on("click", () => {
      if (!game.user?.isGM) {
        ui.notifications.warn("Только GM может подтвердить за торговца.");
        return;
      }
      this._tradeState.rightReady = !this._tradeState.rightReady;
      this._checkBothReady();
      this.render(false);
    });

    // Отмена
    html.find("[data-cancel-trade]").on("click", () => {
      resetState(this._tradeState);
      this.render(false);
    });
  }

  // ─── Bargain ─────────────────────────────────────────────

  async _doBargain() {
    if (this._tradeState.bargainUsed) {
      ui.notifications.warn("Попытка торговаться уже использована.");
      return;
    }

    const character = this._getCharacter();
    if (!character) return;

    const tradeSkill = Number(character.system?.skills?.trade?.value ?? character.system?.skills?.persuasion?.value ?? 1);
    const dieSize = tradeSkill * 2;

    // Диалог — выбор желаемой скидки (сложность растёт)
    // Хардкод маппинг: каждый шаг 2.5% — уникальный порог 2..20
    const BARGAIN_MAP = {
              2.5:2, 5:3, 7.5:4, 10:5, 12.5:6, 15:7, 17.5:8, 20:9, 22.5:10,
              25:11, 27.5:12, 30:13, 32.5:14, 35:15, 37.5:16, 40:17, 42.5:18, 45:19, 47.5:20
            };
    function getThreshold(pct) {
      // Округляем до ближайшего шага 2.5
      const step = Math.round(pct / 2.5) * 2.5;
      return BARGAIN_MAP[step] ?? 20;
    }

    const discountChoice = await new Promise(resolve => {
      const initialPct = 2.5;
      const initialThresh = getThreshold(initialPct);
      const initialChance = Math.round(Math.max(0, (dieSize - initialThresh + 1) / dieSize * 100));
      // Для d2 показываем предупреждение
      const lowSkillWarn = dieSize <= 2 ? "(навык торговли слишком низкий — только d2)" : "";

      const dlg = new Dialog({
        title: "Поторговаться",
        content: `<div id="ih-bargain-root" style="
            background:#141922;
            border-radius:10px;
            padding:14px;
            font-family:'Segoe UI',sans-serif;
            color:#a8b8d0;
            display:flex;
            flex-direction:column;
            gap:14px;
          ">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#6a7d99;">Навык торговли</span>
            <span style="font-size:20px;font-weight:700;color:#5b9cf6;">d${dieSize}</span>
          </div>
          ${lowSkillWarn ? `<div style="font-size:11px;color:#f87171;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);border-radius:6px;padding:6px 10px;">${lowSkillWarn}</div>` : ''}

          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-size:12px;color:#6a7d99;">Желаемая скидка</span>
              <span id="bpct" style="font-size:22px;font-weight:700;color:#e8edf5;">${initialPct}%</span>
            </div>
            <input type="range" id="bslider"
              min="2.5" max="47.5" step="2.5" value="${initialPct}"
              style="width:100%;height:6px;accent-color:#5b9cf6;cursor:pointer;background:#232e42;border-radius:3px;outline:none;border:none;">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:#3d4f68;">
              <span>2.5%</span><span>25%</span><span>47.5%</span>
            </div>
          </div>

          <div style="background:#1b2333;border:1px solid rgba(120,150,200,.16);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:#6a7d99;">Порог проверки</span>
              <span id="bthresh" style="font-size:18px;font-weight:700;color:#e8edf5;">${initialThresh}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:#6a7d99;">Шанс успеха</span>
              <span id="bchance" style="font-size:13px;font-weight:600;color:#4ade80;">${initialChance}%</span>
            </div>
            <div style="font-size:11px;color:#6a7d99;">
              Бросок <b style="color:#5b9cf6;">1d${dieSize}</b> ≥ <b id="bthresh2" style="color:#e8edf5;">${initialThresh}</b>
            </div>
          </div>
        </div>
        <script>
          (function() {
            var die = ${dieSize};
            var BMAP = {
              2.5:2, 5:3, 7.5:4, 10:5, 12.5:6, 15:7, 17.5:8, 20:9, 22.5:10,
              25:11, 27.5:12, 30:13, 32.5:14, 35:15, 37.5:16, 40:17, 42.5:18, 45:19, 47.5:20
            };
            function thresh(pct) {
              var step = Math.round(pct / 2.5) * 2.5;
              return BMAP[step] || 20;
            }
            var slider = document.getElementById('bslider');
            if (!slider) return;
            slider.addEventListener('input', function() {
              var pct = parseInt(this.value);
              var t   = thresh(pct);
              var ch  = Math.round(Math.max(0, (die - t + 1) / die * 100));
              document.getElementById('bpct').textContent    = pct + '%';
              document.getElementById('bthresh').textContent = t;
              document.getElementById('bthresh2').textContent = t;
              var chEl = document.getElementById('bchance');
              chEl.textContent = ch + '%';
              chEl.style.color = ch >= 70 ? '#4ade80' : ch >= 40 ? '#facc15' : '#f87171';
            });
          })();
        </script>`,
        buttons: {
          roll: {
            label: "<i class='fas fa-dice'></i> Бросить!",
            callback: () => {
              const s = document.getElementById('bslider');
              resolve(s ? parseInt(s.value) : 10);
            }
          },
          cancel: { label: "Отмена", callback: () => resolve(null) }
        },
        default: "roll",
        close: () => resolve(null)
      });
      dlg.render(true);
    });

    if (!discountChoice) return;
    const desiredDiscount = discountChoice;
    const threshold = getThreshold(desiredDiscount);

    // Простой бросок навыка (взрыв кубов — отдельная система, добавим позже)
    const roll = await new Roll(`1d${dieSize}`).evaluate();
    const result = roll.total;
    const isAnticrit = result === 1 && dieSize > 2;
    const isCrit     = result === dieSize && dieSize > 2;
    const success    = result >= threshold;

    this._tradeState.bargainUsed = true;

    let msg = `<b>${character.name}</b> пытается поторговаться `
            + `(d${dieSize} = <b>${result}</b>, порог: <b>${threshold}</b>).<br>`;

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
      this._tradeState.bargainDiscount = Math.min(50, bonus);
      // Применяем скидку к базовым ценам предметов в инвентаре торговца
      msg += isCrit
        ? `<b style="color:#4ade80">✦ Крит! Скидка ${bonus}% получена + небольшой бонус к репутации!</b>`
        : `<b style="color:#4ade80">✓ Успех! Скидка ${desiredDiscount}%.</b>`;
    } else {
      this._tradeState.bargainDiscount = 0;
      msg += `<span style="color:#a8b8d0">✗ Провал. Торговец не уступает.</span>`;
    }

    await ChatMessage.create({ content: msg });
    this.render(false);
  }

  // ─── Equalize ────────────────────────────────────────────

  _equalize() {
    const balance = tradeBalance(this._tradeState);
    if (balance === 0) return;

    // balance > 0: торговец предлагает больше → игрок должен добавить монет
    // balance < 0: игрок предлагает больше → торговец должен добавить монет
    const side   = balance > 0 ? "left" : "right";
    const amount = Math.abs(balance);
    const coins  = copperToCoins(amount);

    if (side === "left") {
      this._tradeState.leftCoins  = coins;
    } else {
      this._tradeState.rightCoins = coins;
    }

    this.render(false);
  }

  // ─── Both ready → execute ────────────────────────────────

  _addFromCounter(itemId, side, html) {
    const actor = side === "left"
      ? (this._getCharacter?.() ?? getLiveActor(this.character))
      : getLiveActor(this.merchant);
    const item  = actor?.items?.get(itemId);
    if (!item) return;

    // Читаем значение из input напрямую из DOM
    const input    = html?.[0]?.querySelector(`[data-qty-input][data-item-id="${itemId}"]`);
    const inputQty = input ? (Number(input.value) || 1) : 1;

    const totalQty = Number(item.system?.quantity ?? 1);
    const inOffer  = (side === "left" ? this._tradeState.leftOffer : this._tradeState.rightOffer)
                       .find(o => o.itemId === itemId);
    const maxAdd   = totalQty - (inOffer?.qty ?? 0);
    if (maxAdd <= 0) { ui.notifications.warn("Весь товар уже в предложении"); return; }

    const qty = Math.max(1, Math.min(maxAdd, inputQty));
    addToOffer(this._tradeState, side, item, qty);
    this.render(false);
  }

  _checkBothReady() {
    if (!this._tradeState.leftReady || !this._tradeState.rightReady) return;

    // Запускаем таймер 3 сек
    if (this._confirmTimeout) clearTimeout(this._confirmTimeout);
    ui.notifications.info("Оба готовы! Обмен через 3 секунды...");

    this._confirmTimeout = setTimeout(async () => {
      if (this._tradeState.leftReady && this._tradeState.rightReady) {
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
      const s = this._tradeState;

      // ── Валидация: проверяем хватает ли у игрока монет ──────
      const leftCopper  = coinsToCopper(s.leftCoins);
      const rightCopper = coinsToCopper(s.rightCoins);

      if (leftCopper > 0) {
        const charCoins = getActorCurrencyCopper(character);
        if (charCoins < leftCopper) {
          ui.notifications.error(
            `У ${character.name} не хватает монет: нужно ${leftCopper} меди, есть ${charCoins}`
          );
          resetState(this._tradeState);
          this._busy = false;
          this.render(false);
          return;
        }
      }
      // ────────────────────────────────────────────────────────

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
      if (leftCopper > 0) {
        await changeActorCoins(character, -leftCopper);
        await changeMerchantWealth(merchant, leftCopper);
      }

      // Передать монеты торговца → игроку
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

      resetState(this._tradeState);
      this.render(false);
      if (character.sheet?.rendered) character.sheet.render(false);

      // Принудительное авторазмещение + модалка если не влезло
      setTimeout(async () => {
        try {
          const { PendingItemsApp } = await import("./pending-items-app.mjs");
          await PendingItemsApp.openIfNeeded(character);
        } catch(e) {
          console.warn("Iron Hills | PendingItemsApp error:", e);
          character.sheet?.render(true);
        }
      }, 400);

      // Бонус к репутации за успешную сделку (+3)
      try {
        const { getRelationsForCharacter } = await import("../services/world-content-service.mjs");
        const merchant = getLiveActor(this.merchant);
        const rels     = getRelationsForCharacter(character.name);
        const relName  = merchant?.system?.info?.settlement || merchant?.name;
        const rel      = rels.find(r => r.system.info?.targetName === relName);
        if (rel) {
          const cur = Number(rel.system.info?.score ?? 0);
          await rel.update({ "system.info.score": Math.min(100, cur + 3) });
        }
      } catch {}

    } catch (err) {
      debugError("TradeApp._executeTrade", err);
      ui.notifications.error(`Ошибка обмена: ${err.message}`);
    } finally {
      this._busy = false;
    }
  }
}

export { IronHillsTradeApp };
