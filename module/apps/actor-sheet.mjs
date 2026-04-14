import { CRAFT_RECIPES } from "../constants/recipes.mjs";
import { getExpNext, formatSignedNumber, buildChatSectionRow } from "../utils/text-utils.mjs";
import {
  getLiveActor,
  getPersistentActor,
  isSyntheticActorDocument,
  getActorCurrency,
  getMerchantWealth,
  getCharacterActorByUuid,
  getTradeCharacterByUuidOrActive,
  getTradeCharacterOptions
} from "../utils/actor-utils.mjs";
import {
  getDerivedConditionState,
  getHitLocation,
  getHitLabel,
  getTargetPartLabel,
  getArmorSlotKey,
  getEquippedArmorForLocation,
  getDamageReduction,
  getEncumbranceInfo,
  getActorInjuryInfo,
  getSpellSchoolLabel,
  getQuickSlotBonusFromItems,
  getQuickSlotsUnlocked,
  buildQuickSlotCarrierItems,
  isQuickSlotUnlocked,
  getSpellCastBlockReason,
  getActionBlockReason,
  buildActionState,
  buildQuickSlotActionStates,
  buildGroupedItems,
  buildEquipmentSummary,
  buildQuickSlotsSummary,
  buildDetailedMagicSummary,
  buildCombatSummary,
  buildDetailedCombatView,
  buildMagicSummary,
  buildTradeSummary,
  buildOverviewSummary,
  buildSkillGroups,
  getAttackThreshold,
  getFailureDegree,
  getExpNextForSkill
} from "../services/actor-state-service.mjs";
import {
  getTradePriceModifiers,
  getMerchantBuyPriceForItem,
  getMerchantSellPriceForItem,
  addItemToActorOrStack,
  transferItemQuantityBetweenActors,
  changeActorCoins,
  changeMerchantWealth,
  buildMerchantStockView,
  buildCharacterSellView
} from "../services/trade-service.mjs";
import {
  recalculateActorWeight,
  findTool,
  getAvailableCategoryQuantity,
  clearActorItemReferences,
  cleanupInvalidActorReferences,
  ensureActorSkills,
  removeQuantityFromItem
} from "../services/inventory-service.mjs";
import {
  getRecipeQualityByMargin,
  getQualityLabel,
  buildRelationsSummary,
  splitRelationsSummary,
  consumeRecipeIngredients
} from "../services/world-content-service.mjs";
import {
  queueActorSheetRender,
  refreshMerchantTradeViews,
  rerenderOpenTradeApps,
  refreshAllTradeUIs
} from "../services/ui-refresh-service.mjs";
import {
  isCombatActive,
  getCombatSummary,
  getActorCombatUiState,
  getActiveParticipant,
  canActorActNow,
  getActorRemainingSeconds,
  getActorPendingAction,
  spendActionSeconds,
  requestActionTimeCommit,
  canActorCommitAction,
  continuePendingAction,
  cancelPendingAction,
  advanceTurn,
  advanceTurnIfReady,
  startCombat,
  endCombat,
  endTurnForActor,
  ensureCombatActorBodyStatus
} from "../services/combat-flow-service.mjs";
import { IronHillsTradeApp } from "./trade-app.mjs";
import { debugLog, debugWarn, debugError } from "../utils/debug-utils.mjs";

const TRADE_LOCKS = new Set();

function makeTradeLockKey({ merchantId = "", characterId = "", itemId = "", action = "" } = {}) {
  return [merchantId, characterId, itemId, action].join("::");
}

function rerenderOpenIronHillsActorSheets() {
  for (const app of Object.values(ui.windows ?? {})) {
    if (!app?.rendered) continue;
    if (app.constructor?.name !== "IronHillsActorSheet") continue;

    try {
      app.render(false);
    } catch (err) {
      console.warn("Iron Hills | actor sheet rerender failed", err);
    }
  }
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

class IronHillsActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);
    this._tradeCharacterUuid = "";
    this._tradeBusy = false;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills", "sheet", "actor"],
      width: 820,
      height: 700,
      resizable: true
    });
  }

  get template() {
    return `systems/iron-hills-system/templates/actor/${this.actor.type}-sheet.hbs`;
  }

  _getSelectedTradeCharacter() {
    return getTradeCharacterByUuidOrActive(this._tradeCharacterUuid);
  }

  async _setTradeCharacter(actorUuid) {
    const actor = getCharacterActorByUuid(actorUuid);
    this._tradeCharacterUuid = actor?.uuid || "";
    this.render(true);
  }

  _getActorForState() {
    return getPersistentActor(this.actor) ?? this.actor;
  }
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);

    if (data?.type === "Item") {
      return this._onDropItem(event, data);
    }

    return super._onDrop(event);
  }

  async _onDropItem(event, data) {
    const actor = this._getActorForState();
    await ensureCombatActorBodyStatus(actor);
    if (!actor || !this.isEditable) return false;

    let itemDoc = null;

    try {
      if (Item.implementation?.fromDropData) {
        itemDoc = await Item.implementation.fromDropData(data);
      } else if (typeof Item.fromDropData === "function") {
        itemDoc = await Item.fromDropData(data);
      }
    } catch (err) {
      console.warn("Iron Hills | drop item resolve failed", err);
    }

    let itemData = itemDoc?.toObject?.() ?? foundry.utils.deepClone(data?.data ?? data);

    if (!itemData?.type) {
      ui.notifications.warn("Не удалось распознать предмет для переноса.");
      return false;
    }

    delete itemData._id;
    delete itemData.folder;
    delete itemData.sort;
    delete itemData.ownership;
    delete itemData._stats;

    itemData.system = itemData.system ?? {};
    itemData.system.quantity = Math.max(1, Number(itemData.system.quantity ?? 1));

    await addItemToActorOrStack(actor, itemData);
    await recalculateActorWeight(actor);
    await cleanupInvalidActorReferences(actor);

    this.render(false);
    return true;
  }
  _getCombatParticipantsFromTargets() {
    const actor = this._getActorForState();
    const result = [];
    const added = new Set();

    if (actor?.id) {
      result.push(actor);
      added.add(actor.id);
    }

    for (const token of [...(game.user.targets ?? [])]) {
      const targetActor = token?.actor ?? null;
      if (!targetActor?.id) continue;
      if (added.has(targetActor.id)) continue;

      result.push(getPersistentActor(targetActor) ?? targetActor);
      added.add(targetActor.id);
    }

    return result;
  }

  async _startCombatFromSheet() {
    const participants = this._getCombatParticipantsFromTargets();

    if (participants.length < 2) {
      ui.notifications.warn("Для старта боя нужен как минимум актёр листа и одна выбранная цель.");
      return;
    }

    const state = startCombat(participants);
    if (!state) return;

    const lines = state.participants.map((p, index) =>
      `<p>${index + 1}. <b>${p.actorName}</b> — инициатива ${p.initiativeTotal} (бросок ${p.initiativeRoll} + навык ${p.initiativeSkill})</p>`
    ).join("");

    await ChatMessage.create({
      content: `
        <h3>Бой начат</h3>
        <p><b>Раунд:</b> ${state.round}</p>
        <p><b>Первый ход:</b> ${state.participants[0]?.actorName ?? "—"}</p>
        ${lines}
      `
    });

    this.render(true);
  }

  async _endCombatFromSheet() {
    const summary = getCombatSummary();
    endCombat();

    await ChatMessage.create({
      content: `
        <h3>Бой завершён</h3>
        <p><b>Раундов прошло:</b> ${summary.round ?? 0}</p>
      `
    });

    this.render(true);
  }

  async _advanceCombatTurnFromSheet() {
    const actor = this._getActorForState();
    await this._handlePostActionSecondsState(actor);

    const state = advanceTurn();
    const current = state?.participants?.[state.turnIndex] ?? null;

    await ChatMessage.create({
      content: `
        <h3>Следующий ход</h3>
        <p><b>Раунд:</b> ${state.round}</p>
        <p><b>Ходит:</b> ${current?.actorName ?? "—"}</p>
        <p><b>Доступно секунд:</b> ${current?.remainingSeconds ?? 0}</p>
      `
    });

    this.render(true);
  }

  async _continuePendingCombatAction() {
    const actor = this._getActorForState();
    if (!actor) return;

    const pending = getActorPendingAction(actor);
    if (!pending) {
      ui.notifications.info("У участника нет длительного действия.");
      return;
    }

    const result = continuePendingAction(actor);
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось продолжить действие.");
      return;
    }

    if (!result.done) {
      ui.notifications.info(
        `${actor.name} продолжает действие. Осталось ${Number(result.action?.remainingSeconds ?? 0)} сек.`
      );
      this.render(false);
      return;
    }

    await this._executePendingCombatAction(result.action);
    this.render(false);
  }

async _endCombatTurn() {
  const actor = this._getActorForState();
  if (!actor) return;

  if (!isCombatActive()) {
    ui.notifications.warn("Активного боя нет.");
    return;
  }

  const result = endTurnForActor(actor);
  if (!result?.ok) {
    ui.notifications.warn(result?.reason || "Не удалось завершить ход.");
    return;
  }

  const advanceResult = await advanceTurnIfReady();
  if (!advanceResult?.ok) {
    ui.notifications.warn(advanceResult?.reason || "Ход завершён, но передача следующему участнику не выполнена.");
  }

  this.render(false);
}

  async _cancelPendingCombatAction() {
    const actor = this._getActorForState();
    const pending = getActorPendingAction(actor);

    if (!pending) {
      ui.notifications.warn("Нечего отменять.");
      return;
    }

    cancelPendingAction(actor);

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <h3>Действие отменено</h3>
        <p><b>${actor.name}</b> отменяет: <b>${pending.label}</b></p>
      `
    });

    this.render(true);
  }

  async _commitTimedAction({ actionType, label, timeCost, payload = {} }) {
    const actor = this._getActorForState();

    const turnCheck = canActorActNow(actor);
    if (!turnCheck.ok) {
      ui.notifications.warn(turnCheck.reason);
      return { ok: false, reason: turnCheck.reason };
    }

    const timing = await requestActionTimeCommit(actor, {
      actionType,
      label,
      totalSeconds: timeCost,
      payload
    });

    if (!timing.ok) {
      if (timing.reason) ui.notifications.warn(timing.reason);
      return timing;
    }

    if (timing.committed) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `
          <h3>Начато долгое действие</h3>
          <p><b>${actor.name}</b> начинает: <b>${label}</b></p>
          <p><b>Всего нужно:</b> ${timeCost} сек.</p>
          <p><b>Осталось до завершения:</b> ${timing.pendingAction?.remainingSeconds ?? 0} сек.</p>
        `
      });

      this.render(true);

      return {
        ok: true,
        committed: true,
        immediate: false
      };
    }

    spendActionSeconds(actor, timeCost);

    return {
      ok: true,
      committed: false,
      immediate: true
    };
  }

async getData() {
    const actor = this._getActorForState();
    await cleanupInvalidActorReferences(actor);
    await ensureActorSkills(actor);
    const context = await super.getData();

    context.actor = actor;
    context.system = actor.system;
    context.items = actor.items;
    context.allItems = actor.items;

    context.weapons = actor.items.filter(i => i.type === "weapon");
    context.armors = actor.items.filter(i => i.type === "armor");
    context.foods = actor.items.filter(i => i.type === "food");
    context.materials = actor.items.filter(i => i.type === "material");
    context.resourcesItems = actor.items.filter(i => i.type === "resource");
    context.tools = actor.items.filter(i => i.type === "tool");
    context.spells = actor.items.filter(i => i.type === "spell");
    context.potions = actor.items.filter(i => i.type === "potion");
    context.scrolls = actor.items.filter(i => i.type === "scroll");
    context.throwables = actor.items.filter(i => i.type === "throwable");
    context.consumables = actor.items.filter(i => i.type === "consumable");

    context.rightHandWeapon = context.weapons.find(w => w.id === actor.system.equipment?.rightHand);
    context.leftHandWeapon = context.weapons.find(w => w.id === actor.system.equipment?.leftHand);

    context.armorHead = context.armors.find(a => a.id === actor.system.equipment?.armorHead);
    context.armorTorso = context.armors.find(a => a.id === actor.system.equipment?.armorTorso);
    context.armorArms = context.armors.find(a => a.id === actor.system.equipment?.armorArms);
    context.armorLegs = context.armors.find(a => a.id === actor.system.equipment?.armorLegs);

    context.quickSlotItems = {};
    for (const slotKey of ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"]) {
      const itemId = actor.system.quickSlots?.[slotKey];
      context.quickSlotItems[slotKey] = itemId ? actor.items.get(itemId) : null;
    }

    context.encumbrance = getEncumbranceInfo(actor);
    context.injuries = getActorInjuryInfo(actor);
    context.recipes = Object.values(CRAFT_RECIPES);

    const groupedItems = buildGroupedItems(actor);
    const totalInventoryWeight = groupedItems.reduce(
      (sum, group) => sum + group.items.reduce((s, item) => s + item.totalWeight, 0),
      0
    );
    const totalInventoryPrice = groupedItems.reduce(
      (sum, group) => sum + group.items.reduce((s, item) => s + item.totalPrice, 0),
      0
    );

    context.groupedItems = groupedItems;
    context.totalInventoryWeight = totalInventoryWeight;
    context.totalInventoryPrice = totalInventoryPrice;
    context.equipmentSummary = buildEquipmentSummary(actor);
    context.quickSlotsSummary = buildQuickSlotsSummary(actor);

    context.relationsSummary = buildRelationsSummary(actor);
    const splitRelations = splitRelationsSummary(context.relationsSummary);
    context.settlementRelations = splitRelations.settlements;
    context.factionRelations = splitRelations.factions;

    context.combatSummary = buildCombatSummary(actor);
    context.combatDetailed = buildDetailedCombatView(actor);

    context.magicSummary = buildMagicSummary(actor);
    const detailedMagic = buildDetailedMagicSummary(actor);

    context.magicSpellsDetailed = detailedMagic.spells.map(spell => {
      const item = actor.items.get(spell.id);
      const spellBlockedReason = getSpellCastBlockReason(actor, item, { isScroll: false });

      return {
        ...spell,
        canCastSpell: !spellBlockedReason,
        spellBlockedReason
      };
    });

    context.magicScrollsDetailed = detailedMagic.scrolls.map(scroll => {
      const item = actor.items.get(scroll.id);
      const scrollBlockedReason = getSpellCastBlockReason(actor, item, { isScroll: true });

      return {
        ...scroll,
        canUseScroll: !scrollBlockedReason,
        scrollBlockedReason
      };
    });

    try {
      context.overviewSummary = buildOverviewSummary(actor);
      context.calculatedTier = context.overviewSummary.calculatedTier ?? 1;
    } catch(e) {
      context.overviewSummary = {
        calculatedTier: 1, energyPct: 0, manaPct: 0,
        satietyPct: 0, hydrationPct: 0, weightPct: 0,
        weightValue: 0, weightMax: 0, encumbranceLabel: "—",
        energyValue: 0, energyMax: 0, manaValue: 0, manaMax: 0,
        satietyValue: 0, satietyMax: 0, hydrationValue: 0, hydrationMax: 0
      };
      context.calculatedTier = 1;
    }
    context.tradeSummary = buildTradeSummary(actor);
    context.quickSlotsUnlocked = getQuickSlotsUnlocked(actor);
    context.quickSlotBonus = getQuickSlotBonusFromItems(actor);
    context.quickSlotCarrierItems = buildQuickSlotCarrierItems(actor);
    context.skillGroups = buildSkillGroups(actor);
    context.actionState = buildActionState(actor);
    context.quickSlotActionStates = buildQuickSlotActionStates(actor);
    context.combatFlow = getActorCombatUiState(actor);
    context.globalCombatSummary = getCombatSummary();
    context.pendingCombatAction = getActorPendingAction(actor);
    context.isCombatActive = isCombatActive();

    // Определяем, является ли текущий актёр активным участником хода
    const _activeParticipant = getActiveParticipant();
    context.isCombatTurn = Boolean(
      context.isCombatActive &&
      _activeParticipant &&
      (_activeParticipant.actorId === actor.id ||
       _activeParticipant.actorUuid === actor.uuid)
    );

    context.canContinuePendingCombatAction =
      Boolean(context.pendingCombatAction) && Boolean(context.isCombatTurn);

    context.canCancelPendingCombatAction =
      Boolean(context.pendingCombatAction);

    context.canEndCombatTurn =
      Boolean(context.combatFlow?.active) && Boolean(context.isCombatTurn);

        if (actor.type === "merchant") {
      const playerCharacter = this._getSelectedTradeCharacter();

      if (!this._tradeCharacterUuid && playerCharacter) {
        this._tradeCharacterUuid = playerCharacter.uuid;
      }

      context.activeTradeCharacter = playerCharacter;
      context.activeTradeCharacterUuid = playerCharacter?.uuid || "";
      context.activeTradeCharacterName = playerCharacter?.name || "Не выбран";
      context.hasActiveTradeCharacter = !!playerCharacter;

      context.tradeCharacterOptions = getTradeCharacterOptions();
      context.merchantStockView = buildMerchantStockView(actor, playerCharacter);
      context.tradeModifiers = getTradePriceModifiers(playerCharacter, actor);
      context.buyerCoins = playerCharacter ? getActorCurrency(playerCharacter) : 0;
      context.merchantWealth = getMerchantWealth(actor);
      context.playerSellToMerchantView = playerCharacter
        ? buildCharacterSellView(playerCharacter, actor).map(item => ({
            ...item,
            sellerUuid: playerCharacter.uuid
          }))
        : [];
    }

if (actor.type === "character") {
  const demoMerchant = {
    type: "merchant",
    system: {
      economy: { wealth: 999999, markup: 1 },
      info: { specialty: "general", settlement: "", faction: "" }
    }
  };

  context.personalSellPreview = buildCharacterSellView(actor, demoMerchant);
}

// Character и NPC — части тела с cssClass, pct, trauma
if (actor.type === "character" || actor.type === "npc") {
  const hp = actor.system?.resources?.hp ?? {};

  function zoneClass(val, max) {
    const pct = max > 0 ? val / max : 0;
    if (pct <= 0)    return "is-dead";
    if (pct <= 0.25) return "is-critical";
    if (pct <= 0.50) return "is-bad";
    if (pct <= 0.75) return "is-warn";
    return "is-good";
  }

  function zoneData(key, label, node) {
    const val = Number(node?.value ?? 0);
    const max = Number(node?.max ?? 0);
    const pct = max > 0 ? Math.round((val / max) * 100) : 0;
    const status = node?.status ?? {};
    return {
      key, label, value: val, max, pct,
      cssClass: zoneClass(val, max),
      trauma: {
        minorBleeding: Number(status.minorBleeding ?? 0),
        majorBleeding: Number(status.majorBleeding ?? 0),
        fracture:   Boolean(status.fracture),
        destroyed:  Boolean(status.destroyed),
        splinted:   Boolean(status.splinted),
        tourniquet: Boolean(status.tourniquet)
      }
    };
  }

  context.zones = [
    zoneData("head",     "Голова",  hp.head),
    zoneData("torso",    "Торс",    hp.torso),
    zoneData("abdomen",  "Живот",   hp.abdomen),
    zoneData("leftArm",  "Л. рука", hp.leftArm),
    zoneData("rightArm", "П. рука", hp.rightArm),
    zoneData("leftLeg",  "Л. нога", hp.leftLeg),
    zoneData("rightLeg", "П. нога", hp.rightLeg),
  ];
}

// Monster — одна полоска HP + броня/маг.броня (без частей тела)
if (actor.type === "monster") {
  const hpVal = Number(actor.system?.resources?.hp?.value ?? 0);
  const hpMax = Number(actor.system?.resources?.hp?.max ?? 1);
  const hpPct = Math.round(Math.max(0, Math.min(1, hpVal / Math.max(1, hpMax))) * 100);

  let hpClass = "is-good";
  if (hpPct <= 0)       hpClass = "is-dead";
  else if (hpPct <= 25) hpClass = "is-critical";
  else if (hpPct <= 50) hpClass = "is-bad";
  else if (hpPct <= 75) hpClass = "is-warn";

  context.hpPct   = hpPct;
  context.hpClass = hpClass;
}

    return context;
  }

  _getCombatActionSeconds(actionType, item = null) {
    if (actionType === "attack") {
      if (item?.system?.twoHanded) return Number(item.system?.actionSeconds ?? 4);
      return Number(item?.system?.actionSeconds ?? 3);
    }

    if (actionType === "spell") {
      return Number(item?.system?.actionSeconds ?? 4);
    }

    if (actionType === "scroll") {
      return Number(item?.system?.actionSeconds ?? 4);
    }

    if (actionType === "throwable") {
      return Number(item?.system?.actionSeconds ?? 3);
    }

    if (actionType === "food") {
      return Number(item?.system?.actionSeconds ?? 2);
    }

    if (actionType === "potion") {
      return Number(item?.system?.actionSeconds ?? 2);
    }

    if (actionType === "consumable") {
      return Number(item?.system?.actionSeconds ?? 2);
    }

    if (actionType === "equip") {
      return Number(item?.system?.actionSeconds ?? 2);
    }

    return 2;
  }

  async _handlePostActionSecondsState(actor) {
    if (!isCombatActive()) return;

    const remainingSeconds = Number(getActorRemainingSeconds(actor) ?? 0);

    if (remainingSeconds <= 0) {
      ui.notifications.info("Секунды закончились. Завершите ход или начните длительное действие.");
    }

    this.render(false);
  }

  async _resolveCombatTimeCost({ actionType, label, item = null, totalSeconds = 0, payload = {} } = {}) {
    const actor = this._getActorForState();
    if (!isCombatActive()) {
      return {
        ok: true,
        queued: false,
        immediate: true,
        secondsCost: 0
      };
    }

    const commitCheck = canActorCommitAction(actor);
    if (!commitCheck.ok) {
      ui.notifications.warn(commitCheck.reason || "Сейчас действие недоступно.");
      return {
        ok: false,
        queued: false,
        immediate: false,
        reason: commitCheck.reason || "Сейчас действие недоступно."
      };
    }

    const secondsCost = Math.max(1, Number(totalSeconds || this._getCombatActionSeconds(actionType, item)));
    const remaining = Number(commitCheck.remainingSeconds ?? 0);

    if (remaining >= secondsCost) {
      const spendResult = spendActionSeconds(actor, secondsCost, {
        label,
        actionType,
        data: {
          itemId: item?.id ?? "",
          ...payload
        }
      });

      if (!spendResult?.ok) {
        ui.notifications.warn(spendResult?.reason || "Не удалось списать секунды действия.");
        return {
          ok: false,
          queued: false,
          immediate: false,
          reason: spendResult?.reason || "Не удалось списать секунды действия."
        };
      }

      return {
        ok: true,
        queued: false,
        immediate: true,
        secondsCost,
        remainingSeconds: Number(spendResult.remainingSeconds ?? 0)
      };
    }

    const pending = getActorPendingAction(actor);
    if (pending) {
      ui.notifications.warn("У этого участника уже есть незавершённое длительное действие.");
      return {
        ok: false,
        queued: false,
        immediate: false,
        reason: "Уже есть незавершённое длительное действие."
      };
    }

    const confirmed = await Dialog.confirm({
      title: "Действие займёт несколько ходов",
      content: `
        <p><b>${label}</b> требует <b>${secondsCost}</b> сек.</p>
        <p>Сейчас осталось только <b>${remaining}</b> сек.</p>
        <p>Перенести действие на следующие ходы?</p>
      `
    });

    if (!confirmed) {
      return {
        ok: false,
        queued: false,
        immediate: false
      };
    }

    const commitResult = requestActionTimeCommit(actor, {
      actionType,
      label,
      totalSeconds: secondsCost,
      payload: {
        itemId: item?.id ?? "",
        ...payload
      }
    });

    if (!commitResult?.ok) {
      ui.notifications.warn(commitResult?.reason || "Не удалось поставить действие в очередь.");
      return {
        ok: false,
        queued: false,
        immediate: false,
        reason: commitResult?.reason || "Не удалось поставить действие в очередь."
      };
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<b>${actor.name}</b> начинает действие <b>${label}</b>, которое потребует несколько ходов.`
    });

    return {
      ok: false,
      queued: true,
      immediate: false,
      secondsCost,
      pendingAction: commitResult.pendingAction ?? null
    };
  }
  
  async _executePendingCombatAction(pendingAction) {
    const actor = this._getActorForState();
    if (!actor || !pendingAction) return;

    const data = pendingAction.data ?? {};
    const actionType = pendingAction.actionType || data.actionType || "generic";

    if (actionType === "attack") {
      const weapon = data.weaponId ? actor.items.get(data.weaponId) : null;

      await this._performAttack({
        hand: data.hand ?? null,
        skillKey: data.skillKey || "unarmed",
        label: data.label || weapon?.name || "Кулаки",
        damageType: data.damageType || "physical",
        baseDamage: Number(
          data.baseDamage ??
          weapon?.system?.damage ??
          actor.system?.combat?.unarmedDamage ??
          1
        ),
        energyCost: Number(
          data.energyCost ??
          weapon?.system?.energyCost ??
          5
        ),
        weapon,
        skipTimeCost: true
      });
      return;
    }

    if (actionType === "quickslot") {
      const slotKey = data.slotKey;
      if (!slotKey) {
        ui.notifications.warn("Не найден quick slot для продолжения действия.");
        return;
      }

      await this._useQuickSlot(slotKey, { skipTimeCost: true });
      return;
    }

    if (actionType === "use-consumable") {
      const item = data.itemId ? actor.items.get(data.itemId) : null;
      if (!item) {
        ui.notifications.warn("Предмет для продолжения действия не найден.");
        return;
      }

      await this._useConsumable(item.id, { skipTimeCost: true });
      return;
    }

    if (actionType === "food") {
      const item = data.itemId ? actor.items.get(data.itemId) : null;
      if (!item) {
        ui.notifications.warn("Еда для продолжения действия не найдена.");
        return;
      }

      await this._consumeFood(item.id, { skipTimeCost: true });
      return;
    }

    if (actionType === "potion") {
      const item = data.itemId ? actor.items.get(data.itemId) : null;
      if (!item) {
        ui.notifications.warn("Зелье для продолжения действия не найдено.");
        return;
      }

      await this._usePotion(item.id, { skipTimeCost: true });
      return;
    }

    if (actionType === "cast-spell" || actionType === "spell" || actionType === "scroll") {
      const item = data.itemId ? actor.items.get(data.itemId) : null;
      if (!item) {
        ui.notifications.warn("Заклинание для продолжения действия не найдено.");
        return;
      }

      await this._castSpellLike({
        item,
        isScroll: Boolean(data.isScroll || actionType === "scroll"),
        skipTimeCost: true
      });
      return;
    }

    if (actionType === "throwable") {
      const item = data.itemId ? actor.items.get(data.itemId) : null;
      if (!item) {
        ui.notifications.warn("Метательный предмет для продолжения действия не найден.");
        return;
      }

      await this._useThrowable(item.id, { skipTimeCost: true });
      return;
    }

    ui.notifications.info(`Действие "${pendingAction.label || "действие"}" завершено.`);
  }

  async _applySkillExp(skillKey, label, amount = 1) {
    const actor = this._getActorForState();
    const skill = actor.system.skills?.[skillKey];
    if (!skill) return;

    const currentValue = Math.max(1, Number(skill.value ?? 1));
    if (currentValue >= 10) return; // потолок

    let newExp = (skill.exp ?? 0) + amount;
    // Экспоненциальная таблица: getExpNextForSkill(ступень)
    const expNext = getExpNextForSkill(currentValue);

    if (newExp >= expNext) {
      const overflow = newExp - expNext;
      const newValue = Math.min(10, currentValue + 1);
      const nextExpNext = getExpNextForSkill(newValue);

      await actor.update({
        [`system.skills.${skillKey}.exp`]: overflow,
        [`system.skills.${skillKey}.value`]: newValue,
        [`system.skills.${skillKey}.expNext`]: nextExpNext
      });

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<b>${actor.name}</b> повышает навык <b>${label}</b> до ступени <b>${newValue}</b>! (куб: d${newValue * 2})`
      });
      return;
    }

    await actor.update({
      [`system.skills.${skillKey}.exp`]: newExp,
      [`system.skills.${skillKey}.expNext`]: expNext
    });
  }

  // Карта переходящего урона: если конечность на 0 HP,
  // избыток урона идёт в соседнюю часть тела (как в EFT).
  _getOverflowTarget(locationKey) {
    const map = {
      head:     "torso",
      leftArm:  "torso",
      rightArm: "torso",
      leftLeg:  "abdomen",
      rightLeg: "abdomen",
      abdomen:  "torso",
      torso:    "head"
    };
    return map[locationKey] ?? null;
  }

  async _applyDamage(targetActor, locationKey, damage, _depth = 0) {
    if (damage <= 0) return { newHP: 0, overflow: 0, overflowTarget: null };
    // Защита от бесконечной рекурсии (head→torso→head)
    if (_depth > 4) return { newHP: 0, overflow: 0, overflowTarget: null };

    const path = `system.resources.hp.${locationKey}.value`;
    const currentHP = Number(foundry.utils.getProperty(targetActor, path) ?? 0);

    // Конечность уже уничтожена — весь урон уходит в overflow сразу
    if (currentHP <= 0) {
      const overflowTarget = this._getOverflowTarget(locationKey);
      if (overflowTarget) {
        return this._applyDamage(targetActor, overflowTarget, damage, _depth + 1);
      }
      return { newHP: 0, overflow: damage, overflowTarget: null };
    }

    const absorbed = Math.min(currentHP, damage);
    const overflow = damage - absorbed;
    const newHP = currentHP - absorbed;

    await targetActor.update({ [path]: newHP });

    // Если летальная зона достигла 0 — персонаж мёртв
    if (newHP <= 0 && (locationKey === "head" || locationKey === "torso")) {
      await this._markActorDead(targetActor);
    }

    // Если есть переходящий урон и конечность уничтожена этим ударом
    if (overflow > 0 && newHP <= 0) {
      const overflowTarget = this._getOverflowTarget(locationKey);
      if (overflowTarget) {
        await this._applyDamage(targetActor, overflowTarget, overflow, _depth + 1);
        return { newHP, overflow, overflowTarget };
      }
    }

    return { newHP, overflow: 0, overflowTarget: null };
  }

  async _healTargetPart(targetActor, locationKey, amount) {
    const valuePath = `system.resources.hp.${locationKey}.value`;
    const maxPath = `system.resources.hp.${locationKey}.max`;

    const currentHP = Number(foundry.utils.getProperty(targetActor, valuePath) ?? 0);
    const maxHP = Number(foundry.utils.getProperty(targetActor, maxPath) ?? 0);
    const newHP = Math.min(maxHP, currentHP + amount);

    await targetActor.update({
      [valuePath]: newHP
    });

    return newHP;
  }

  async _applyInjuryEffects(targetActor, locationKey, finalDamage) {
    const hpData = targetActor.system.resources.hp?.[locationKey];
    if (!hpData) return;

    const maxHP = Number(hpData.max ?? 0);
    const halfThreshold = Math.ceil(maxHP / 2);

    const updates = {};

    if (finalDamage >= halfThreshold) {
      updates["system.conditions.bleeding"] = Number(targetActor.system.conditions?.bleeding ?? 0) + 1;

      if (locationKey === "leftArm") updates["system.conditions.fractures.leftArm"] = true;
      if (locationKey === "rightArm") updates["system.conditions.fractures.rightArm"] = true;
      if (locationKey === "leftLeg") updates["system.conditions.fractures.leftLeg"] = true;
      if (locationKey === "rightLeg") updates["system.conditions.fractures.rightLeg"] = true;

      if (locationKey === "head" || locationKey === "torso" || locationKey === "abdomen") {
        updates["system.conditions.shock"] = Number(targetActor.system.conditions?.shock ?? 0) + 1;
      }
    }

    if (Object.keys(updates).length > 0) {
      await targetActor.update(updates);
    }
  }

  async _applyPoison(targetActor, amount) {
    const current = Number(targetActor.system.conditions?.poison ?? 0);
    await targetActor.update({
      "system.conditions.poison": current + Number(amount)
    });
  }

  async _applyBurning(targetActor, amount) {
    const current = Number(targetActor.system.conditions?.burning ?? 0);
    await targetActor.update({
      "system.conditions.burning": current + Number(amount)
    });
  }

  async _equipWeapon(itemId, hand) {
    const actor = this._getActorForState();
    const weapon = actor.items.get(itemId);
    if (!weapon || weapon.type !== "weapon") {
      ui.notifications.warn("Предмет не найден или не является оружием");
      return;
    }

    const currentRight = actor.system.equipment?.rightHand ?? "";
    const currentLeft = actor.system.equipment?.leftHand ?? "";

    if ((hand === "rightHand" && currentLeft === itemId) || (hand === "leftHand" && currentRight === itemId)) {
      ui.notifications.warn("Нельзя экипировать один и тот же предмет в обе руки");
      return;
    }

    const rightWeapon = currentRight ? actor.items.get(currentRight) : null;
    const leftWeapon = currentLeft ? actor.items.get(currentLeft) : null;

    if (hand === "rightHand" && leftWeapon?.system?.twoHanded) {
      ui.notifications.warn("Другая рука уже занята двуручным оружием");
      return;
    }

    if (hand === "leftHand" && rightWeapon?.system?.twoHanded) {
      ui.notifications.warn("Другая рука уже занята двуручным оружием");
      return;
    }

    const updateData = {};

    if (weapon.system.twoHanded) {
      if ((hand === "rightHand" && currentLeft) || (hand === "leftHand" && currentRight)) {
        ui.notifications.warn("Для двуручного оружия обе руки должны быть свободны");
        return;
      }

      updateData["system.equipment.rightHand"] = itemId;
      updateData["system.equipment.leftHand"] = itemId;

      await actor.update(updateData);
      await recalculateActorWeight(actor);
      ui.notifications.info("Двуручное оружие экипировано в обе руки");
      return;
    }

    updateData[`system.equipment.${hand}`] = itemId;
    await actor.update(updateData);
    await recalculateActorWeight(actor);

    ui.notifications.info(
      hand === "rightHand" ? "Оружие экипировано в правую руку" : "Оружие экипировано в левую руку"
    );
  }

  async _unequipHand(hand) {
    const actor = this._getActorForState();
    const currentRight = actor.system.equipment?.rightHand ?? "";
    const currentLeft = actor.system.equipment?.leftHand ?? "";
    const currentItemId = actor.system.equipment?.[hand];

    if (!currentItemId) {
      ui.notifications.warn("В этой руке ничего нет");
      return;
    }

    const currentItem = actor.items.get(currentItemId);
    const updateData = {};

    if (currentItem?.system?.twoHanded && currentRight === currentLeft && currentRight === currentItemId) {
      updateData["system.equipment.rightHand"] = "";
      updateData["system.equipment.leftHand"] = "";
      await actor.update(updateData);
      await recalculateActorWeight(actor);
      ui.notifications.info("Двуручное оружие снято");
      return;
    }

    updateData[`system.equipment.${hand}`] = "";
    await actor.update(updateData);
    await recalculateActorWeight(actor);

    ui.notifications.info(
      hand === "rightHand" ? "Оружие снято из правой руки" : "Оружие снято из левой руки"
    );
  }

  async _equipArmor(itemId) {
    const actor = this._getActorForState();
    const armor = actor.items.get(itemId);
    if (!armor || armor.type !== "armor") {
      ui.notifications.warn("Предмет не найден или не является бронёй");
      return;
    }

    const slotKey = getArmorSlotKey(armor.system.slot);
    if (!slotKey) {
      ui.notifications.warn("У брони не задан корректный слот");
      return;
    }

    await actor.update({
      [`system.equipment.${slotKey}`]: itemId
    });

    await recalculateActorWeight(actor);
    ui.notifications.info(`Броня экипирована в слот: ${armor.system.slot}`);
  }

  async _unequipArmor(slotKey) {
    const actor = this._getActorForState();
    const currentItemId = actor.system.equipment?.[slotKey];
    if (!currentItemId) {
      ui.notifications.warn("В этом слоте ничего нет");
      return;
    }

    await actor.update({
      [`system.equipment.${slotKey}`]: ""
    });

    await recalculateActorWeight(actor);
    ui.notifications.info("Броня снята");
  }

  async _assignQuickSlot(itemId, slotKey) {
    const actor = this._getActorForState();
    if (!isQuickSlotUnlocked(actor, slotKey)) {
      ui.notifications.warn("Этот быстрый слот ещё заблокирован");
      return;
    }

    const item = actor.items.get(itemId);
    if (!item) {
      ui.notifications.warn("Предмет не найден");
      return;
    }

    await actor.update({
      [`system.quickSlots.${slotKey}`]: itemId
    });

    ui.notifications.info(`Предмет "${item.name}" назначен в ${slotKey}`);
  }

  async _clearQuickSlot(slotKey) {
    const actor = this._getActorForState();
    if (!isQuickSlotUnlocked(actor, slotKey)) {
      ui.notifications.warn("Этот быстрый слот ещё заблокирован");
      return;
    }

    await actor.update({
      [`system.quickSlots.${slotKey}`]: ""
    });

    ui.notifications.info(`Быстрый слот ${slotKey} очищен`);
  }

async _deleteOwnedItem(itemId) {
  const actor = this._getActorForState();
  const item = actor.items.get(itemId);
  if (!item) {
    ui.notifications.warn("Предмет не найден");
    return;
  }

  await clearActorItemReferences(actor, itemId);
  await item.delete();
  await recalculateActorWeight(actor);

  ui.notifications.info(`Предмет "${item.name}" удалён из инвентаря`);

queueActorSheetRender(actor);
refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
}

  async _consumeFood(itemId, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    const item = actor.items.get(itemId);
    if (!item || item.type !== "food") {
      ui.notifications.warn("Предмет не найден или не является едой");
      return;
    }

    if (!skipTimeCost) {
      const timeState = await this._resolveCombatTimeCost({
        actionType: "food",
        label: `Использование еды: ${item.name}`,
        item,
        payload: {
          itemId
        }
      });

      if (timeState?.queued) return;
      if (!timeState?.ok) return;
    }

    const satietyGain = Number(item.system.satiety ?? 0);
    const hydrationGain = Number(item.system.hydration ?? 0);

    const currentSatiety = Number(actor.system.resources.satiety.value ?? 0);
    const maxSatiety = Number(actor.system.resources.satiety.max ?? 100);

    const currentHydration = Number(actor.system.resources.hydration.value ?? 0);
    const maxHydration = Number(actor.system.resources.hydration.max ?? 100);

    const newSatiety = Math.min(maxSatiety, currentSatiety + satietyGain);
    const newHydration = Math.min(maxHydration, currentHydration + hydrationGain);

    await actor.update({
      "system.resources.satiety.value": newSatiety,
      "system.resources.hydration.value": newHydration
    });

    await removeQuantityFromItem(actor, item, 1);
    await recalculateActorWeight(actor);

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<b>${actor.name}</b> использует <b>${item.name}</b><br>Сытость: +${satietyGain}<br>Жажда: +${hydrationGain}`
    });

    queueActorSheetRender(actor);
    refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
  }

  async _usePotion(itemId, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    const item = actor.items.get(itemId);
    if (!item || item.type !== "potion") {
      ui.notifications.warn("Зелье не найдено");
      return;
    }

    if (!skipTimeCost) {
      const timeState = await this._resolveCombatTimeCost({
        actionType: "potion",
        label: `Использование зелья: ${item.name}`,
        item,
        payload: {
          itemId
        }
      });

      if (timeState?.queued) return;
      if (!timeState?.ok) return;
    }

    const power = Number(item.system.power ?? 0);
    const effectType = item.system.effectType;
    const targetPart = item.system.targetPart ?? "torso";

    if (effectType === "healHP") {
      const healedHp = await this._healTargetPart(actor, targetPart, power);

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<b>${actor.name}</b> выпивает <b>${item.name}</b><br>Лечение: ${power}<br>${getTargetPartLabel(targetPart)} теперь имеет HP: ${healedHp}`
      });
    }

    if (effectType === "restoreEnergy") {
      const current = Number(actor.system.resources.energy.value ?? 0);
      const max = Number(actor.system.resources.energy.max ?? 100);
      const next = Math.min(max, current + power);

      await actor.update({
        "system.resources.energy.value": next
      });

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<b>${actor.name}</b> выпивает <b>${item.name}</b><br>Энергия: +${power}`
      });
    }

    if (effectType === "restoreMana") {
      const current = Number(actor.system.resources.mana.value ?? 0);
      const max = Number(actor.system.resources.mana.max ?? 50);
      const next = Math.min(max, current + power);

      await actor.update({
        "system.resources.mana.value": next
      });

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<b>${actor.name}</b> выпивает <b>${item.name}</b><br>Мана: +${power}`
      });
    }

    await removeQuantityFromItem(actor, item, 1);
    await recalculateActorWeight(actor);

    queueActorSheetRender(actor);
    refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
  }

  _getMedicalPartOptions(actor) {
    const hp = actor?.system?.resources?.hp ?? {};
    const partKeys = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];

    return partKeys
      .filter(partKey => hp?.[partKey])
      .map(partKey => ({
        key: partKey,
        label: getTargetPartLabel(partKey)
      }));
  }

  _getItemApplicationScope(item, fallback = "targeted") {
    const raw = String(item?.system?.applicationScope ?? "").trim().toLowerCase();
    if (raw === "targeted" || raw === "global" || raw === "auto" || raw === "area") return raw;
    return fallback;
  }

  _getItemTargetActorMode(item, fallback = "self") {
    const raw = String(item?.system?.targetActorMode ?? "").trim().toLowerCase();
    if (raw === "self" || raw === "selected-or-self" || raw === "selected-only" || raw === "area") return raw;
    return fallback;
  }

  _getSelectedActorTargets(sourceActor) {
    const targets = Array.from(game.user?.targets ?? [])
      .map(token => token?.actor ?? null)
      .filter(Boolean)
      .filter(actor => actor.id !== sourceActor?.id);

    return targets;
  }

  async _resolveActionTargetActor(sourceActor, item, title = "Выбор цели") {
    const targetActorMode = this._getItemTargetActorMode(item, "self");

    if (targetActorMode === "self") {
      return { ok: true, cancelled: false, targetActor: sourceActor };
    }

    const selectedActors = this._getSelectedActorTargets(sourceActor);

    if (targetActorMode === "selected-only") {
      if (selectedActors.length === 1) {
        return { ok: true, cancelled: false, targetActor: selectedActors[0] };
      }

      if (selectedActors.length > 1) {
        const choice = await this._promptTargetActorChoice(selectedActors, title);
        if (!choice) return { ok: false, cancelled: true, targetActor: null };
        return { ok: true, cancelled: false, targetActor: choice };
      }

      ui.notifications.warn("Выделите цель токеном.");
      return { ok: false, cancelled: true, targetActor: null };
    }

    if (targetActorMode === "selected-or-self") {
      if (selectedActors.length === 1) {
        return { ok: true, cancelled: false, targetActor: selectedActors[0] };
      }

      if (selectedActors.length > 1) {
        const options = [sourceActor, ...selectedActors];
        const choice = await this._promptTargetActorChoice(options, title);
        if (!choice) return { ok: false, cancelled: true, targetActor: null };
        return { ok: true, cancelled: false, targetActor: choice };
      }

      return { ok: true, cancelled: false, targetActor: sourceActor };
    }

    return { ok: true, cancelled: false, targetActor: sourceActor };
  }

  async _promptTargetActorChoice(actorOptions, title = "Выбор цели") {
    if (!actorOptions?.length) return null;

    const optionsHtml = actorOptions
      .map(actor => `<option value="${actor.uuid}">${actor.name}</option>`)
      .join("");

    return await new Promise(resolve => {
      new Dialog({
        title,
        content: `
          <form>
            <div class="form-group">
              <label>Цель</label>
              <select name="targetActorUuid">
                ${optionsHtml}
              </select>
            </div>
          </form>
        `,
        buttons: {
          ok: {
            label: "Выбрать",
            callback: html => {
              const uuid = html.find("[name='targetActorUuid']").val();
              resolve(uuid ? fromUuidSync(uuid) : null);
            }
          },
          cancel: {
            label: "Отмена",
            callback: () => resolve(null)
          }
        },
        default: "ok",
        close: () => resolve(null)
      }).render(true);
    });
  }

  async _promptMedicalTargetPart(actor, title = "Выбор части тела") {
    const parts = this._getMedicalPartOptions(actor);
    if (!parts.length) return null;

    const options = parts
      .map(part => `<option value="${part.key}">${part.label}</option>`)
      .join("");

    return await new Promise(resolve => {
      new Dialog({
        title,
        content: `
          <form>
            <div class="form-group">
              <label>Часть тела</label>
              <select name="targetPart">
                ${options}
              </select>
            </div>
          </form>
        `,
        buttons: {
          ok: {
            label: "Применить",
            callback: html => resolve(html.find("[name='targetPart']").val())
          },
          cancel: {
            label: "Отмена",
            callback: () => resolve(null)
          }
        },
        default: "ok",
        close: () => resolve(null)
      }).render(true);
    });
  }

  async _resolveTargetPartByScope(targetActor, item, fallbackTitle = "Выбор части тела") {
    const presetPart = String(item?.system?.targetPart ?? "").trim();
    const scope = this._getItemApplicationScope(item, "targeted");

    if (scope === "global") {
      return { ok: true, cancelled: false, targetPart: null };
    }

    if (scope === "auto" || scope === "area") {
      return { ok: true, cancelled: false, targetPart: presetPart || null };
    }

    if (presetPart) {
      return { ok: true, cancelled: false, targetPart: presetPart };
    }

    const selectedPart = await this._promptMedicalTargetPart(targetActor, fallbackTitle);
    if (!selectedPart) {
      return { ok: false, cancelled: true, targetPart: null };
    }

    return { ok: true, cancelled: false, targetPart: selectedPart };
  }

  _getBodyPartStatusNode(actor, partKey) {
    return actor?.system?.resources?.hp?.[partKey]?.status ?? {};
  }

    async _applyActionTypeToTargetPart(sourceActor, targetActor, item, actionType, targetPart, power = 1) {
    const persistentTargetActor = getPersistentActor(targetActor);
    if (!persistentTargetActor) {
      ui.notifications.warn("Цель лечения не найдена.");
      return { ok: false, handled: true, consumeItem: false };
    }

    targetActor = persistentTargetActor;
    const status = this._getBodyPartStatusNode(targetActor, targetPart);

    if (actionType === "bandage") {
      const currentMinor = Number(status?.minorBleeding ?? 0);

      if (currentMinor <= 0) {
        ui.notifications.warn(`${getTargetPartLabel(targetPart)}: нет малого кровотечения.`);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
          content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>${getTargetPartLabel(targetPart)}<br>Малое кровотечение отсутствует`
        });

        return { ok: true, handled: true, consumeItem: false };
      }

      const nextMinor = Math.max(0, currentMinor - Math.max(1, Number(power || 1)));
      await targetActor.update({
        [`system.resources.hp.${targetPart}.status.minorBleeding`]: nextMinor
      });

      const reduced = currentMinor - nextMinor;

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>${getTargetPartLabel(targetPart)}<br>Малое кровотечение уменьшено на ${reduced}`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    if (actionType === "tourniquet") {
      const currentMajor = Number(status?.majorBleeding ?? 0);

      if (currentMajor <= 0) {
        ui.notifications.warn(`${getTargetPartLabel(targetPart)}: нет сильного кровотечения.`);
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
          content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>${getTargetPartLabel(targetPart)}<br>Сильное кровотечение отсутствует`
        });

        return { ok: true, handled: true, consumeItem: false };
      }

      const nextMajor = Math.max(0, currentMajor - Math.max(1, Number(power || 1)));

      await targetActor.update({
        [`system.resources.hp.${targetPart}.status.majorBleeding`]: nextMajor,
        [`system.resources.hp.${targetPart}.status.tourniquet`]: true
      });

      const reduced = currentMajor - nextMajor;

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> накладывает <b>${item.name}</b> на <b>${targetActor.name}</b><br>${getTargetPartLabel(targetPart)}<br>Сильное кровотечение уменьшено на ${reduced}<br>Наложен жгут`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    if (actionType === "splint") {
      const hadFracture = Boolean(status?.fracture);
      const alreadySplinted = Boolean(status?.splinted);

      if (!hadFracture && alreadySplinted) {
        ui.notifications.warn(`${getTargetPartLabel(targetPart)} уже стабилизирована.`);
        return { ok: true, handled: true, consumeItem: false };
      }

      if (!hadFracture && !alreadySplinted) {
        ui.notifications.warn(`${getTargetPartLabel(targetPart)}: перелом отсутствует.`);
        return { ok: true, handled: true, consumeItem: false };
      }

      await targetActor.update({
        [`system.resources.hp.${targetPart}.status.splinted`]: true,
        [`system.resources.hp.${targetPart}.status.fracture`]: false
      });

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>${getTargetPartLabel(targetPart)}<br>Перелом стабилизирован`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    if (actionType === "surgery") {
      const hpNode = targetActor?.system?.resources?.hp?.[targetPart] ?? {};
      const currentHp = Number(hpNode?.value ?? 0);
      const maxHp = Number(hpNode?.max ?? 0);
      const healAmount = Math.max(1, Number(power || 1));

      const hasDestroyed = Boolean(status?.destroyed);
      const hasFracture = Boolean(status?.fracture);
      const hasMinor = Number(status?.minorBleeding ?? 0) > 0;
      const hasMajor = Number(status?.majorBleeding ?? 0) > 0;

      if (!hasDestroyed && !hasFracture && !hasMinor && !hasMajor && currentHp >= maxHp) {
        ui.notifications.warn(`${getTargetPartLabel(targetPart)}: тяжёлое лечение не требуется.`);
        return { ok: true, handled: true, consumeItem: false };
      }

      const updates = {
        [`system.resources.hp.${targetPart}.status.destroyed`]: false,
        [`system.resources.hp.${targetPart}.status.fracture`]: false,
        [`system.resources.hp.${targetPart}.status.splinted`]: false,
        [`system.resources.hp.${targetPart}.status.tourniquet`]: false,
        [`system.resources.hp.${targetPart}.status.majorBleeding`]: 0,
        [`system.resources.hp.${targetPart}.status.minorBleeding`]: 0
      };

      if (currentHp <= 0) {
        updates[`system.resources.hp.${targetPart}.value`] = Math.min(maxHp, healAmount);
      } else {
        updates[`system.resources.hp.${targetPart}.value`] = Math.min(maxHp, currentHp + healAmount);
      }

      await targetActor.update(updates);

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> применяет <b>${item.name}</b> к <b>${targetActor.name}</b><br>${getTargetPartLabel(targetPart)}<br>Проведена тяжёлая медицинская обработка`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    if (actionType === "heal-part") {
      const hpNode = targetActor?.system?.resources?.hp?.[targetPart] ?? {};
      const currentHp = Number(hpNode?.value ?? 0);
      const maxHp = Number(hpNode?.max ?? 0);

      if (currentHp >= maxHp) {
        ui.notifications.warn(`${getTargetPartLabel(targetPart)} уже полностью восстановлена.`);
        return { ok: true, handled: true, consumeItem: false };
      }

      const nextHp = Math.min(maxHp, currentHp + Math.max(1, Number(power || 1)));

      await targetActor.update({
        [`system.resources.hp.${targetPart}.value`]: nextHp
      });

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>${getTargetPartLabel(targetPart)}<br>Восстановлено ${nextHp - currentHp} HP`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    return { ok: true, handled: false, consumeItem: false };
  }

  async _applyActionTypeGlobally(sourceActor, targetActor, item, actionType, power = 1) {
    const persistentTargetActor = getPersistentActor(targetActor);
    if (!persistentTargetActor) {
      ui.notifications.warn("Цель лечения не найдена.");
      return { ok: false, handled: true, consumeItem: false };
    }

    targetActor = persistentTargetActor;
    const resources = targetActor.system?.resources ?? {};

    if (actionType === "restore-energy") {
      const current = Number(resources.energy?.value ?? 0);
      const max = Number(resources.energy?.max ?? 0);
      const next = Math.min(max, current + Math.max(1, Number(power || 1)));

      await targetActor.update({
        "system.resources.energy.value": next
      });

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>Энергия восстановлена на ${next - current}`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    if (actionType === "restore-mana") {
      const current = Number(resources.mana?.value ?? 0);
      const max = Number(resources.mana?.max ?? 0);
      const next = Math.min(max, current + Math.max(1, Number(power || 1)));

      await targetActor.update({
        "system.resources.mana.value": next
      });

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>Мана восстановлена на ${next - current}`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    if (actionType === "heal-body") {
      const hp = targetActor.system?.resources?.hp ?? {};
      const parts = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];
      const updates = {};

      for (const partKey of parts) {
        const current = Number(hp?.[partKey]?.value ?? 0);
        const max = Number(hp?.[partKey]?.max ?? 0);
        updates[`system.resources.hp.${partKey}.value`] = Math.min(max, current + Math.max(1, Number(power || 1)));
      }

      await targetActor.update(updates);

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>Тело получает общее восстановление`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    if (actionType === "stop-minor-bleeding-global") {
      const hp = targetActor.system?.resources?.hp ?? {};
      const parts = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];
      const updates = {};

      for (const partKey of parts) {
        if (!hp?.[partKey]) continue;
        updates[`system.resources.hp.${partKey}.status.minorBleeding`] = 0;
      }

      await targetActor.update(updates);

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>Все малые кровотечения остановлены`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    if (actionType === "stabilize-body") {
      const hp = targetActor.system?.resources?.hp ?? {};
      const parts = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];
      const updates = {};

      for (const partKey of parts) {
        if (!hp?.[partKey]) continue;
        updates[`system.resources.hp.${partKey}.status.minorBleeding`] = 0;
        updates[`system.resources.hp.${partKey}.status.majorBleeding`] = 0;
      }

      await targetActor.update(updates);

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
        content: `<b>${sourceActor.name}</b> использует <b>${item.name}</b> на <b>${targetActor.name}</b><br>Общее состояние тела стабилизировано`
      });

      return { ok: true, handled: true, consumeItem: true };
    }

    return { ok: true, handled: false, consumeItem: false };
  }

  async _applyActionTypeItem(sourceActor, item) {
    const actionType = String(item.system?.actionType ?? "").trim();
    if (!actionType) {
      return { ok: true, handled: false, consumeItem: false, cancelled: false };
    }

    const targetActorInfo = await this._resolveActionTargetActor(
      sourceActor,
      item,
      `Цель для: ${item.name}`
    );

    if (!targetActorInfo.ok && targetActorInfo.cancelled) {
      return { ok: true, handled: true, consumeItem: false, cancelled: true };
    }

    const targetActor = targetActorInfo.targetActor || sourceActor;
    const power = Number(item.system?.power ?? 1);
    const scope = this._getItemApplicationScope(item, "targeted");

    if (scope === "global") {
      return await this._applyActionTypeGlobally(sourceActor, targetActor, item, actionType, power);
    }

    const targetInfo = await this._resolveTargetPartByScope(
      targetActor,
      item,
      `Выбор части тела: ${targetActor.name}`
    );

    if (!targetInfo.ok && targetInfo.cancelled) {
      return { ok: true, handled: true, consumeItem: false, cancelled: true };
    }

    const targetPart = targetInfo.targetPart;
    if (!targetPart) {
      return { ok: true, handled: true, consumeItem: false, cancelled: true };
    }

    return await this._applyActionTypeToTargetPart(sourceActor, targetActor, item, actionType, targetPart, power);
  }

  async _useConsumable(itemId, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    const item = actor.items.get(itemId);
    if (!item || item.type !== "consumable") {
      ui.notifications.warn("Расходник не найден");
      return;
    }

    if (!skipTimeCost) {
      const timeState = await this._resolveCombatTimeCost({
        actionType: "use-consumable",
        label: `Использование: ${item.name}`,
        item,
        payload: {
          itemId
        }
      });

      if (timeState?.queued) return;
      if (!timeState?.ok) return;
    }

    const actionResult = await this._applyActionTypeItem(actor, item);

    if (actionResult?.cancelled) {
      return;
    }

    if (actionResult?.handled) {
      if (actionResult.consumeItem) {
        await removeQuantityFromItem(actor, item, 1);
        await recalculateActorWeight(actor);
      }

      queueActorSheetRender(actor);
      refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
      return;
    }

    ui.notifications.warn("У предмета не настроен actionType.");
  }

  async _castSpellLike({ item, isScroll = false, skipTimeCost = false }) {
    const actor = this._getActorForState();
    if (!item) {
      ui.notifications.warn("Заклинание не найдено");
      return;
    }

    if (!skipTimeCost) {
      const timeState = await this._resolveCombatTimeCost({
        actionType: isScroll ? "scroll" : "cast-spell",
        label: `${isScroll ? "Свиток" : "Заклинание"}: ${item.name}`,
        item,
        payload: {
          itemId: item.id,
          isScroll
        }
      });

      if (timeState?.queued) return;
      if (!timeState?.ok) return;
    }

    const school = item.system.school;
    const schoolSkill = actor.system.skills?.[school];
    if (!schoolSkill) {
      ui.notifications.warn(`У персонажа нет школы магии ${school}`);
      return;
    }

    const manaCost = isScroll ? 0 : Number(item.system.manaCost ?? 0);
    const energyCost = Number(item.system.energyCost ?? 0);
    const currentMana = Number(actor.system.resources.mana.value ?? 0);
    const currentEnergy = Number(actor.system.resources.energy.value ?? 0);
    const blockReason = getActionBlockReason(actor, isScroll ? "scroll" : "spell", { item });
    if (blockReason) {
      ui.notifications.warn(blockReason);
      return;
    }

    // Атакующее заклинание вне боя — запрашиваем GM
    const isOffensiveSpell = item?.system?.effectType === "damage";
    if (isOffensiveSpell && !isCombatActive() && !game.user?.isGM) {
      const allowed = await this._requestGmHostileAction(`${isScroll ? "Свиток" : "Заклинание"}: ${item.name}`);
      if (!allowed) return;
    }

    const targets = game.user.targets;
    if (!targets.size) {
      ui.notifications.warn("Выберите цель");
      return;
    }

    const targetActor = [...targets][0].actor;
    if (!targetActor) {
      ui.notifications.warn("У цели нет актёра");
      return;
    }

    const dieSize = Math.max(2, schoolSkill.value * 2);
    const injuries = getActorInjuryInfo(actor);
    const castPenalty = Number(injuries.castPenalty ?? 0);
    const derivedConditions = getDerivedConditionState(actor);

if (!derivedConditions.canCast) {
  ui.notifications.warn("Персонаж не может колдовать из-за критических травм.");
  return;
}
    const rollFormula = castPenalty > 0 ? `1d${dieSize} - ${castPenalty}` : `1d${dieSize}`;
    const roll = await new Roll(rollFormula).evaluate();

    await actor.update({
      "system.resources.mana.value": Math.max(0, currentMana - manaCost),
      "system.resources.energy.value": Math.max(0, currentEnergy - energyCost)
    });

    let content = `
      <h3>${isScroll ? "Свиток" : "Заклинание"}: ${item.name}</h3>
      ${buildChatSectionRow("Источник", actor.name)}
      ${buildChatSectionRow("Цель", targetActor.name)}
      ${buildChatSectionRow("Школа", getSpellSchoolLabel(school))}
      ${buildChatSectionRow("Куб", `d${dieSize}`)}
      ${buildChatSectionRow("Штраф от ранений", castPenalty > 0 ? `-${castPenalty}` : "0")}
      ${buildChatSectionRow("Кровопотеря", Number(derivedConditions.bleeding ?? 0))}
      ${buildChatSectionRow("Шок", Number(derivedConditions.shock ?? 0))}
      ${buildChatSectionRow("Бросок", `${roll.total}`)}
      ${buildChatSectionRow("Мана", `-${manaCost}`)}
      ${buildChatSectionRow("Энергия", `-${energyCost}`)}
    `;

    const power = Number(item.system.power ?? 0);
    const effectType = item.system.effectType;
    const damageType = item.system.damageType ?? "magical";
    const targetPart = item.system.targetPart ?? "torso";

    if (effectType === "damage") {
      const armorItem = getEquippedArmorForLocation(targetActor, targetPart);
      const reduction = getDamageReduction(armorItem, damageType);
      const finalDamage = Math.max(0, power + roll.total - reduction);
      const { newHP: remainingHP, overflow: dmgOverflow, overflowTarget: dmgOverflowTarget } = await this._applyDamage(targetActor, targetPart, finalDamage);
      await this._applyInjuryEffects(targetActor, targetPart, finalDamage);

      content += `
        ${buildChatSectionRow("Эффект", "Урон")}
        ${buildChatSectionRow("Часть тела", getTargetPartLabel(targetPart))}
        ${buildChatSectionRow("Сила", power)}
        ${buildChatSectionRow("Броня", armorItem ? armorItem.name : "Нет")}
        ${buildChatSectionRow("Поглощение", reduction)}
        ${buildChatSectionRow("Итоговый урон", `<span style="font-size:1.1em;"><b>${finalDamage}</b></span>`)}
        ${buildChatSectionRow("Осталось HP", remainingHP)}
        ${dmgOverflow > 0 ? buildChatSectionRow("Переходящий урон", `${dmgOverflow} → ${getTargetPartLabel(dmgOverflowTarget)}`) : ""}
      `;
    }

    if (effectType === "heal") {
      const healed = power + Math.max(0, roll.total - 1);
      const newHP = await this._healTargetPart(targetActor, targetPart, healed);

      content += `
        ${buildChatSectionRow("Эффект", "Лечение")}
        ${buildChatSectionRow("Часть тела", getTargetPartLabel(targetPart))}
        ${buildChatSectionRow("Восстановлено HP", healed)}
        ${buildChatSectionRow("Текущее HP", newHP)}
      `;
    }

    if (effectType === "restoreEnergy") {
      const restored = power + Math.max(0, roll.total - 1);
      const currentTargetEnergy = Number(targetActor.system.resources.energy.value ?? 0);
      const maxTargetEnergy = Number(targetActor.system.resources.energy.max ?? 100);
      const newEnergy = Math.min(maxTargetEnergy, currentTargetEnergy + restored);
      await targetActor.update({ "system.resources.energy.value": newEnergy });
      content += `
        ${buildChatSectionRow("Эффект", "Восстановление энергии")}
        ${buildChatSectionRow("Восстановлено", restored)}
        ${buildChatSectionRow("Энергия цели", newEnergy)}
      `;
    }

    // ── PATCH 9: Новые эффекты магии ─────────────────────────────

    // Оглушение — цель пропускает ход(а)
    if (effectType === "stun") {
      const duration = power + Math.max(0, roll.total - 4);
      const current  = Number(targetActor.system?.conditions?.stunned ?? 0);
      await targetActor.update({
        "system.conditions.stunned": current + Math.max(1, duration)
      });
      content += `
        ${buildChatSectionRow("Эффект", "⚡ Оглушение")}
        ${buildChatSectionRow("Длительность", `${Math.max(1, duration)} ход(а)`)}
      `;
    }

    // Обезоруживание — оружие выбивается из рук
    if (effectType === "disarm") {
      const threshold = 6 + Number(targetActor.system?.info?.tier ?? 1);
      if (roll.total >= threshold) {
        const disarmHand = item.system.disarmHand ?? "rightHand";
        const weaponId = targetActor.system?.equipment?.[disarmHand];
        if (weaponId) {
          await targetActor.update({ [`system.equipment.${disarmHand}`]: "" });
          content += `
            ${buildChatSectionRow("Эффект", "✋ Обезоруживание")}
            ${buildChatSectionRow("Результат", "Оружие выбито!")}
            ${buildChatSectionRow("Бросок / Порог", `${roll.total} / ${threshold}`)}
          `;
        } else {
          content += `${buildChatSectionRow("Обезоруживание", "Цель безоружна")}`;
        }
      } else {
        content += `
          ${buildChatSectionRow("Эффект", "✋ Обезоруживание")}
          ${buildChatSectionRow("Результат", `Провал (${roll.total} < ${threshold})`)}
        `;
      }
    }

    // Безмолвие — цель не может колдовать N секунд
    if (effectType === "silence") {
      const duration = power + Math.max(1, roll.total - 3);
      const until = (game.time?.worldTime ?? 0) + duration;
      await targetActor.update({ "system.conditions.silencedUntil": until });
      content += `
        ${buildChatSectionRow("Эффект", "🔇 Безмолвие")}
        ${buildChatSectionRow("Длительность", `${duration} сек.`)}
      `;
    }

    // Замедление — снижает инициативу
    if (effectType === "slow") {
      const penalty = power + Math.max(0, roll.total - 4);
      const current = Number(targetActor.system?.conditions?.slowPenalty ?? 0);
      await targetActor.update({
        "system.conditions.slowPenalty": current + Math.max(1, penalty)
      });
      content += `
        ${buildChatSectionRow("Эффект", "🐢 Замедление")}
        ${buildChatSectionRow("Штраф инициативы", `-${Math.max(1, penalty)}`)}
      `;
    }

    // Страх — штраф к атаке и защите
    if (effectType === "fear") {
      const duration = power + Math.max(1, roll.total - 4);
      const current  = Number(targetActor.system?.conditions?.feared ?? 0);
      await targetActor.update({
        "system.conditions.feared": current + Math.max(1, duration)
      });
      content += `
        ${buildChatSectionRow("Эффект", "😱 Страх")}
        ${buildChatSectionRow("Длительность", `${Math.max(1, duration)} ход(а)`)}
        ${buildChatSectionRow("Штрафы", "−3 атака, −3 защита")}
      `;
    }

    // Урон по резерву — временный (средние ступени) или постоянный (высокие)
    if (effectType === "reserveDrain") {
      const isPermanent = (schoolSkill?.value ?? 1) >= 6;
      const amount = power + Math.max(0, roll.total - 4);
      const drainType = item.system.drainType ?? "mana"; // "mana" | "energy"

      if (isPermanent) {
        // Снижаем максимум
        const maxPath  = `system.resources.${drainType}.max`;
        const current  = Number(targetActor.system?.resources?.[drainType]?.max ?? 10);
        const newMax   = Math.max(0, current - Math.max(1, amount));
        const valPath  = `system.resources.${drainType}.value`;
        const curVal   = Number(targetActor.system?.resources?.[drainType]?.value ?? 0);
        await targetActor.update({
          [maxPath]: newMax,
          [valPath]: Math.min(curVal, newMax)
        });
        if (newMax <= 0) {
          await this._markActorDead(targetActor);
        }
        content += `
          ${buildChatSectionRow("Эффект", `☠ Истощение резерва (${drainType === "mana" ? "Мана" : "Энергия"})`)}
          ${buildChatSectionRow("Тип", "Постоянное")}
          ${buildChatSectionRow("Урон по максимуму", `-${Math.max(1, amount)}`)}
          ${newMax <= 0 ? `<p><b style="color:#ef4444">☠ Резерв иссяк — необратимая смерть!</b></p>` : ""}
        `;
      } else {
        // Снижаем текущее значение (временно)
        const valPath = `system.resources.${drainType}.value`;
        const current = Number(targetActor.system?.resources?.[drainType]?.value ?? 0);
        const newVal  = Math.max(0, current - Math.max(1, amount));
        await targetActor.update({ [valPath]: newVal });
        content += `
          ${buildChatSectionRow("Эффект", `⚡ Истощение (${drainType === "mana" ? "Мана" : "Энергия"})`)}
          ${buildChatSectionRow("Тип", "Временное")}
          ${buildChatSectionRow("Снято", `-${Math.max(1, amount)}`)}
          ${buildChatSectionRow("Осталось", newVal)}
        `;
      }
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content
    });

    await this._applySkillExp(school, item.name);

    if (isScroll) {
      await removeQuantityFromItem(actor, item, 1);
      await recalculateActorWeight(actor);
    }

    queueActorSheetRender(actor);
    refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
  }

  async _useThrowable(itemId, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    const item = actor.items.get(itemId);
    if (!item || item.type !== "throwable") {
      ui.notifications.warn("Метательный предмет не найден");
      return;
    }

    if (!skipTimeCost) {
      const timeState = await this._resolveCombatTimeCost({
        actionType: "throwable",
        label: `Метание: ${item.name}`,
        item,
        payload: {
          itemId
        }
      });

      if (timeState?.queued) return;
      if (!timeState?.ok) return;
    }

    const blockReason = getActionBlockReason(actor, "throwable", { item });
    if (blockReason) {
      ui.notifications.warn(blockReason);
      return;
    }

    // Метание вне боя — запрашиваем GM
    if (!isCombatActive() && !game.user?.isGM) {
      const allowed = await this._requestGmHostileAction(`Метание: ${item.name}`);
      if (!allowed) return;
    }
    const currentEnergy = Number(actor.system.resources.energy.value ?? 0);
    const energyCost = Number(item.system.energyCost ?? 8);

    const targets = game.user.targets;
    if (!targets.size) {
      ui.notifications.warn("Выберите цель");
      return;
    }

    const targetActor = [...targets][0].actor;
    if (!targetActor) {
      ui.notifications.warn("У цели нет актёра");
      return;
    }

    const skill = actor.system.skills?.throwing;
    const dieSize = Math.max(2, Number(skill?.value ?? 1) * 2);
    const difficulty = Number(targetActor.system.combat?.defense ?? 6);
    const injuries = getActorInjuryInfo(actor);
    const throwPenalty = Number(injuries.throwPenalty ?? injuries.attackPenalty ?? 0);
    const derivedConditions = getDerivedConditionState(actor);

if (!derivedConditions.canThrow) {
  ui.notifications.warn("Персонаж не может метать предметы из-за критических травм.");
  return;
}
    const rollFormula = throwPenalty > 0 ? `1d${dieSize} - ${throwPenalty}` : `1d${dieSize}`;
    const roll = await new Roll(rollFormula).evaluate();

    await actor.update({
      "system.resources.energy.value": Math.max(0, currentEnergy - energyCost)
    });

    let content = `
      <h3>Метание: ${item.name}</h3>
      ${buildChatSectionRow("Метатель", actor.name)}
      ${buildChatSectionRow("Цель", targetActor.name)}
      ${buildChatSectionRow("Куб", `d${dieSize}`)}
      ${buildChatSectionRow("Штраф от ранений", throwPenalty > 0 ? `-${throwPenalty}` : "0")}
      ${buildChatSectionRow("Кровопотеря", Number(derivedConditions.bleeding ?? 0))}
      ${buildChatSectionRow("Шок", Number(derivedConditions.shock ?? 0))}
      ${buildChatSectionRow("Бросок", `${roll.total}`)}
      ${buildChatSectionRow("Защита цели", difficulty)}
      ${buildChatSectionRow("Энергия", `-${energyCost}`)}
    `;

    if (roll.total < difficulty) {
      content += `<p><b>Результат:</b> Промах</p><p><i>Бросок оказался ниже защиты цели.</i></p>`;

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content
      });

      await this._applySkillExp("throwing", item.name);
      await removeQuantityFromItem(actor, item, 1);
      await recalculateActorWeight(actor);

queueActorSheetRender(actor);
refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
      return;
    }

    const targetPart = item.system.targetPart ?? "torso";
    const damageType = item.system.damageType ?? "physical";
    const power = Number(item.system.power ?? 0);

    const armorItem = getEquippedArmorForLocation(targetActor, targetPart);
    const reduction = getDamageReduction(armorItem, damageType);
    const finalDamage = Math.max(0, power + roll.total - difficulty - reduction);
    const { newHP: remainingHP, overflow: dmgOverflow, overflowTarget: dmgOverflowTarget } = await this._applyDamage(targetActor, targetPart, finalDamage);
    await this._applyInjuryEffects(targetActor, targetPart, finalDamage);

    const poison = Number(item.system.appliesPoison ?? 0);
    const burning = Number(item.system.appliesBurning ?? 0);

    if (poison > 0) await this._applyPoison(targetActor, poison);
    if (burning > 0) await this._applyBurning(targetActor, burning);

    content += `
      <p><b>Результат:</b> Попадание</p>
      ${buildChatSectionRow("Часть тела", getTargetPartLabel(targetPart))}
      ${buildChatSectionRow("Броня", armorItem ? armorItem.name : "Нет")}
      ${buildChatSectionRow("Поглощение", reduction)}
      ${buildChatSectionRow("Итоговый урон", `<span style="font-size:1.1em;"><b>${finalDamage}</b></span>`)}
      ${buildChatSectionRow("Осталось HP", remainingHP)}
      ${dmgOverflow > 0 ? buildChatSectionRow("Переходящий урон", `${dmgOverflow} → ${getTargetPartLabel(dmgOverflowTarget)}`) : ""}
      ${buildChatSectionRow("Яд", poison)}
      ${buildChatSectionRow("Горение", burning)}
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content
    });

    await this._applySkillExp("throwing", item.name);
    await removeQuantityFromItem(actor, item, 1);
    await recalculateActorWeight(actor);

    queueActorSheetRender(actor);
    refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
  }

  async _updateActiveEffectsTick() {
    const actor = this._getActorForState();
    const poison = Number(actor.system.conditions?.poison ?? 0);
    const burning = Number(actor.system.conditions?.burning ?? 0);

    let content = `<h3>Эффекты: ${actor.name}</h3>`;
    let changed = false;

    if (poison > 0 && actor.system.resources?.hp?.torso) {
      const { newHP: remaining } = await this._applyDamage(actor, "torso", poison);
      await actor.update({
        "system.conditions.poison": Math.max(0, poison - 1)
      });
      content += `<p><b>Яд:</b> ${poison} урона по торсу. Осталось HP торса: ${remaining}</p>`;
      changed = true;
    }

    if (burning > 0 && actor.system.resources?.hp) {
      const locationRoll = await new Roll("1d20").evaluate();
      const locationKey = getHitLocation(locationRoll.total);
      const { newHP: remaining } = await this._applyDamage(actor, locationKey, burning);
      await actor.update({
        "system.conditions.burning": Math.max(0, burning - 1)
      });
      content += `<p><b>Горение:</b> ${burning} урона в ${getHitLabel(locationKey)}. Осталось HP: ${remaining}</p>`;
      changed = true;
    }

    if (!changed) {
      ui.notifications.info("Активных эффектов нет");
      return;
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content
    });
  }

  async _useQuickSlot(slotKey, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    const reason = getActionBlockReason(actor, "quickslot", { slotKey });

    if (reason) {
      ui.notifications.warn(reason);
      return;
    }

    const itemId = actor.system.quickSlots?.[slotKey];
    const item = itemId ? actor.items.get(itemId) : null;

    if (!item) {
      ui.notifications.warn("Предмет в слоте не найден");
      return;
    }

    if (item.type === "food") return this._consumeFood(item.id, { skipTimeCost });
    if (item.type === "spell") return this._castSpellLike({ item, isScroll: false, skipTimeCost });
    if (item.type === "scroll") return this._castSpellLike({ item, isScroll: true, skipTimeCost });
    if (item.type === "potion") return this._usePotion(item.id, { skipTimeCost });
    if (item.type === "throwable") return this._useThrowable(item.id, { skipTimeCost });
    if (item.type === "consumable") return this._useConsumable(item.id, { skipTimeCost });
    if (item.type === "weapon") return this._equipWeapon(item.id, "rightHand");

    ui.notifications.warn("Этот тип предмета пока нельзя использовать из быстрого слота");
  }

  async _shortRest() {
    const actor = this._getActorForState();
    if (!actor.system.resources?.energy) return;

    const endurance = Number(actor.system.skills?.endurance?.value ?? 1);
    const bleeding = Number(actor.system.conditions?.bleeding ?? 0);
    const currentEnergy = Number(actor.system.resources.energy.value ?? 0);
    const maxEnergy = Number(actor.system.resources.energy.max ?? 100);
    const currentMana = Number(actor.system.resources.mana?.value ?? 0);
    const maxMana = Number(actor.system.resources.mana?.max ?? 50);

    const restoredEnergy = Math.max(0, 20 + endurance * 2 - bleeding * 2);
    const restoredMana = Math.max(0, 10 + Math.floor(endurance / 2));

    const newEnergy = Math.min(maxEnergy, currentEnergy + restoredEnergy);
    const newMana = Math.min(maxMana, currentMana + restoredMana);

    await actor.update({
      "system.resources.energy.value": newEnergy,
      "system.resources.mana.value": newMana
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: `<b>${actor.name}</b> делает короткий отдых.<br>Энергия: +${restoredEnergy}<br>Мана: +${restoredMana}`
    });
  }

  async _fullRest() {
    const actor = this._getActorForState();
    if (!actor.system.resources?.energy) return;

    const maxEnergy = Number(actor.system.resources.energy.max ?? 100);
    const maxMana = Number(actor.system.resources.mana?.max ?? 50);
    const currentBleeding = Number(actor.system.conditions?.bleeding ?? 0);
    const currentPoison = Number(actor.system.conditions?.poison ?? 0);
    const currentBurning = Number(actor.system.conditions?.burning ?? 0);

    await actor.update({
      "system.resources.energy.value": maxEnergy,
      "system.resources.mana.value": maxMana,
      "system.conditions.shock": 0,
      "system.conditions.bleeding": Math.max(0, currentBleeding - 1),
      "system.conditions.poison": Math.max(0, currentPoison - 1),
      "system.conditions.burning": Math.max(0, currentBurning - 1)
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content: `<b>${actor.name}</b> делает полный отдых.<br>Энергия и мана восстановлены, шок снят, негативные эффекты ослаблены.`
    });
  }

  async _craftRecipe(recipeId) {
    const actor = this._getActorForState();
    const recipe = CRAFT_RECIPES[recipeId];
    if (!recipe) {
      ui.notifications.warn("Рецепт не найден");
      return;
    }

    const skill = actor.system.skills?.[recipe.skillKey];
    if (!skill) {
      ui.notifications.warn(`У персонажа нет навыка ${recipe.skillKey}`);
      return;
    }

    const tool = findTool(actor, recipe.tool.craftType, recipe.tool.tier);
    if (!tool) {
      ui.notifications.warn(`Нужен инструмент типа "${recipe.tool.craftType}" тира ${recipe.tool.tier}+`);
      return;
    }

    for (const ingredient of recipe.ingredients) {
      const available = getAvailableCategoryQuantity(actor, ingredient.type, ingredient.category);
      if (available < ingredient.quantity) {
        ui.notifications.warn(`Недостаточно ресурса: ${ingredient.category} (${available}/${ingredient.quantity})`);
        return;
      }
    }

    const dieSize = Math.max(2, skill.value * 2);
    const roll = await new Roll(`1d${dieSize}`).evaluate();
    const success = roll.total >= recipe.difficulty;

    let content = `
      <h3>Крафт: ${recipe.label}</h3>
      <p><b>Навык:</b> ${recipe.skillKey}</p>
      <p><b>Бросок:</b> ${roll.total} (d${dieSize})</p>
      <p><b>Сложность:</b> ${recipe.difficulty}</p>
    `;

    await this._applySkillExp(recipe.skillKey, recipe.label);

    if (!success) {
      content += `<p><b>Результат:</b> Неудача. Материалы не потрачены.</p>`;
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content
      });
      return;
    }

    const usedTiers = await consumeRecipeIngredients(actor, recipe.ingredients);
    const resultTier = usedTiers.length ? Math.min(...usedTiers) : 1;
    const margin = roll.total - recipe.difficulty;
    const quality = getRecipeQualityByMargin(margin);

    const createdSystem = foundry.utils.deepClone(recipe.result.system ?? {});
    createdSystem.tier = resultTier;
    createdSystem.quality = quality;
    createdSystem.quantity = 1;

    if (recipe.result.type === "weapon") {
      if (quality === "fine") createdSystem.damage += 1;
      if (quality === "masterwork") createdSystem.damage += 2;
      if (quality === "legendary") createdSystem.damage += 3;
    }

    if (recipe.result.type === "armor") {
      if (quality === "fine") createdSystem.protection.physical += 1;
      if (quality === "masterwork") createdSystem.protection.physical += 2;
      if (quality === "legendary") {
        createdSystem.protection.physical += 2;
        createdSystem.protection.magical += 1;
      }
    }

    if (recipe.result.type === "food") {
      if (quality === "fine") createdSystem.satiety += 5;
      if (quality === "masterwork") createdSystem.satiety += 10;
      if (quality === "legendary") {
        createdSystem.satiety += 10;
        createdSystem.hydration += 5;
      }
    }

    await actor.createEmbeddedDocuments("Item", [{
      name: recipe.result.name,
      type: recipe.result.type,
      system: createdSystem
    }]);

    await recalculateActorWeight(actor);

    content += `
      <p><b>Результат:</b> Успех</p>
      <p><b>Перевес:</b> ${margin}</p>
      <p><b>Тир результата:</b> ${resultTier}</p>
      <p><b>Качество:</b> ${getQualityLabel(quality)}</p>
      <p><b>Создан предмет:</b> ${recipe.result.name}</p>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      content
    });
  }

async _buyFromMerchant(itemId) {
  if (this._tradeBusy) {
    ui.notifications.warn("Дождись завершения текущей торговой операции.");
    return;
  }

  const merchant = getLiveActor(this.actor);
  if (!merchant || merchant.type !== "merchant") return;

  const buyer = getPersistentActor(getTradeCharacterByUuidOrActive(this._tradeCharacterUuid));
  if (!buyer) {
    ui.notifications.warn("Не найден активный персонаж для торговли. Назначь User Character или выдели токен персонажа.");
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

      if (buyerCoins < price) {
        ui.notifications.warn("Недостаточно монет.");
        return;
      }

      await changeActorCoins(liveBuyer, -price);
      await changeMerchantWealth(liveMerchant, price);
      await transferItemQuantityBetweenActors(liveMerchant, liveBuyer, item, 1);

      await ChatMessage.create({
        content: `<b>${liveBuyer.name}</b> покупает у <b>${liveMerchant.name}</b> предмет <b>${item.name}</b> за <b>${price}</b> монет.`
      });

      if (liveBuyer.sheet?.rendered) liveBuyer.sheet.render(false);
      await refreshMerchantTradeViews(IronHillsActorSheet);
      rerenderOpenTradeApps(IronHillsTradeApp);
    });
  } catch (err) {
    console.error(err);
    ui.notifications.error(`Ошибка покупки: ${err.message}`);
  } finally {
    this._tradeBusy = false;
    if (this.rendered) this.render(true);
  }
}

async _sellToMerchant(itemId, sellerUuid = "") {
  if (this._tradeBusy) {
    ui.notifications.warn("Дождись завершения текущей торговой операции.");
    return;
  }

  const merchant = getLiveActor(this.actor);
  if (!merchant || merchant.type !== "merchant") return;

  const seller = getPersistentActor(getTradeCharacterByUuidOrActive(sellerUuid || this._tradeCharacterUuid));
  if (!seller) {
    ui.notifications.warn("Не найден активный персонаж для торговли. Назначь User Character или выдели токен персонажа.");
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

      if (merchantWealth < price) {
        ui.notifications.warn("У торговца недостаточно богатства для выкупа.");
        return;
      }

      await changeMerchantWealth(liveMerchant, -price);
      await changeActorCoins(liveSeller, price);
      await transferItemQuantityBetweenActors(liveSeller, liveMerchant, item, 1);

      await ChatMessage.create({
        content: `<b>${liveSeller.name}</b> продаёт торговцу <b>${liveMerchant.name}</b> предмет <b>${item.name}</b> за <b>${price}</b> монет.`
      });

      if (liveSeller.sheet?.rendered) liveSeller.sheet.render(false);
      await refreshMerchantTradeViews(IronHillsActorSheet);
      rerenderOpenTradeApps(IronHillsTradeApp);
    });
  } catch (err) {
    console.error(err);
    ui.notifications.error(`Ошибка продажи: ${err.message}`);
  } finally {
    this._tradeBusy = false;
    if (this.rendered) this.render(true);
  }
}

  _openTradeWindow() {
    const merchant = getLiveActor(this.actor);
    if (!merchant || merchant.type !== "merchant") return;

    const app = new IronHillsTradeApp(merchant);
    app.render(true);
  }

  // Запрашивает разрешение GM на враждебное действие вне боя.
  // Возвращает true если можно действовать, false — если нет.
  async _requestGmHostileAction(actionLabel) {
    // В бою — всегда можно
    if (isCombatActive()) return true;
    // GM сам себе разрешает
    if (game.user?.isGM) return true;

    // Отправляем запрос GM через чат
    const actor = this._getActorForState();

    await ChatMessage.create({
      content: `
        <div style="border:1px solid rgba(248,113,113,0.4);border-radius:8px;padding:10px;background:rgba(248,113,113,0.06);">
          <b>⚔ Запрос на враждебное действие</b><br>
          <b>${actor.name}</b> хочет выполнить <b>${actionLabel}</b> вне боя.<br>
          <small style="opacity:0.7">GM, используй команду <code>/ir approve</code> или начни бой.</small>
        </div>
      `,
      whisper: ChatMessage.getWhisperRecipients("GM")
    });

    ui.notifications.info("Запрос отправлен GM. Ожидайте разрешения.");
    return false;
  }


  /**
   * Отмечает персонажа как мёртвого — начинает отсчёт убывания резерва.
   * Вызывается когда голова или торс достигают 0 HP.
   */
  async _markActorDead(actor) {
    if (!actor || actor.type !== "character") return;
    const sr = actor.system?.resources?.soulReserve;
    if (sr?.isDead) return; // уже мёртв

    await actor.update({
      "system.resources.soulReserve.isDead": true,
      "system.resources.soulReserve.daysSinceDeath": 1
    });

    await ChatMessage.create({
      content: `
        <div style="border:1px solid rgba(239,68,68,0.4);border-radius:8px;padding:10px;background:rgba(239,68,68,0.06);">
          <b>☠ ${actor.name} погиб.</b><br>
          Резерв души начинает угасать по 1 единице в день.<br>
          <small>Воскресите персонажа пока резерв маны и энергии не иссяк.</small>
        </div>
      `
    });
  }

  /**
   * Воскрешение — сбрасывает флаг смерти, восстанавливает HP.
   * @param {number} quality — качество воскрешения 1-10 (ступень церкви/свитка)
   */
  async _reviveActor(actor, quality = 1) {
    if (!actor || actor.type !== "character") return;

    // Восстановление HP в зависимости от качества
    const hpRestorePct = Math.min(1, quality / 10);
    const updates = {
      "system.resources.soulReserve.isDead": false,
      "system.resources.soulReserve.daysSinceDeath": 0
    };

    // HP частей тела
    const parts = ["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"];
    for (const part of parts) {
      const max = Number(actor.system?.resources?.hp?.[part]?.max ?? 0);
      if (!max) continue;
      const restored = Math.max(1, Math.floor(max * hpRestorePct));
      updates[`system.resources.hp.${part}.value`] = restored;
    }

    // Сброс destroyed статусов
    for (const part of parts) {
      updates[`system.resources.hp.${part}.status.destroyed`] = false;
    }

    await actor.update(updates);

    const qualityLabel = quality >= 8 ? "Отличное" : quality >= 5 ? "Хорошее" : "Слабое";
    await ChatMessage.create({
      content: `
        <b>✦ ${actor.name} воскрешён.</b> Качество: ${qualityLabel} (ступень ${quality})<br>
        HP восстановлено на ${Math.round(hpRestorePct * 100)}%.
        ${quality <= 3 ? "<br><small>⚠ Персонаж ослаблен — могут быть дебафы.</small>" : ""}
      `
    });
  }

  /**
   * Взрыв кубов (Exploding Dice).
   * Если выпал максимум — предлагаем перейти на следующий куб.
   * d2 не взрывается (это монетка).
   *
   * @param {number} skillValue — ступень навыка (1-10)
   * @returns {{ total: number, rolls: number[], exploded: boolean }}
   */
  async _explodingDiceRoll(skillValue) {
    const rolls = [];
    let total = 0;
    let currentDie = Math.max(2, skillValue * 2);
    let exploded = false;

    while (true) {
      const roll = await new Roll(`1d${currentDie}`).evaluate();
      const result = roll.total;
      rolls.push({ die: currentDie, result });
      total = result; // берём последний результат (не сумму)

      // Не максимум — стоп (d2 тоже взрывается при выпавшей 2)
      if (result < currentDie) break;

      // Максимум — предлагаем продолжить
      const nextDie = Math.min(currentDie + 2, 20);
      if (nextDie === currentDie) break; // уже d20, некуда расти

      const confirmed = await Dialog.confirm({
        title: "💥 Взрыв куба!",
        content: `<div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;padding:4px;text-align:center;">
          <div style="margin-bottom:8px;">
            <span style="font-size:32px;font-weight:700;color:#facc15;">${result}</span>
            <span style="color:#6a7d99;font-size:13px;"> на d${currentDie}</span>
          </div>
          <p style="color:#4ade80;font-weight:600;margin:4px 0;">Максимум! Можно рискнуть.</p>
          <p style="font-size:12px;margin:4px 0;">Перейти на <b style="color:#5b9cf6">d${nextDie}</b>?</p>
          <p style="font-size:11px;color:#6a7d99;margin:4px 0;">Отмена — зафиксировать <b>${result}</b></p>
        </div>`
      });

      if (!confirmed) break;

      exploded = true;
      currentDie = nextDie;
    }

    return { total, rolls, exploded };
  }

  /**
   * Универсальный бросок с тремя стратегиями.
   * Стратегии:
   *   "simple"   — один бросок d(навык×2), с взрывом куба
   *   "reroll"   — перебрасываем пока не устроит (тратит энергию)
   *   "target"   — до порога: система кидает и сообщает результат
   *
   * @param {string} skillKey  — ключ навыка
   * @param {string} label     — название для чата
   * @param {object} options   — { threshold, energyCostPerReroll }
   */
  async _universalDiceRoll(skillKey, label, options = {}) {
    const actor = this._getActorForState();
    const skill = actor.system.skills?.[skillKey];
    if (!skill) { ui.notifications.warn(`Навык ${skillKey} не найден`); return; }

    const skillValue = Number(skill.value ?? 1);
    const dieSize    = Math.max(2, skillValue * 2);
    const threshold  = options.threshold ?? null;

    // Диалог выбора стратегии
    const strategy = await new Promise(resolve => {
      const hasThreshold = threshold !== null;
      const dlg = new Dialog({
        title: `🎲 ${label}`,
        content: `<div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;padding:4px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
            <span style="color:#6a7d99;font-size:12px;">Навык:</span>
            <b style="color:#5b9cf6;font-size:18px;">d${dieSize}</b>
          </div>
          ${hasThreshold ? `<div style="margin-bottom:10px;padding:6px 10px;background:rgba(91,156,246,0.08);border:1px solid rgba(91,156,246,0.2);border-radius:6px;font-size:12px;">
            Порог: <b style="color:#e8edf5">${threshold}</b>
          </div>` : ''}
          <p style="font-size:11px;color:#6a7d99;margin:0;">Выбери стратегию броска:</p>
        </div>`,
        buttons: {
          simple: {
            label: "🎲 Один бросок",
            callback: () => resolve("simple")
          },
          reroll: {
            label: "🔄 До победного",
            callback: () => resolve("reroll")
          },
          ...(hasThreshold ? { target: {
            label: "🎯 До порога",
            callback: () => resolve("target")
          }} : {})
        },
        default: "simple",
        close: () => resolve(null)
      });
      dlg.render(true);
    });

    if (!strategy) return null;

    // ── Стратегия 1: Простой бросок с взрывом куба ──
    if (strategy === "simple") {
      const { total, rolls, exploded } = await this._explodingDiceRoll(skillValue);
      const rollDesc = rolls.map(r => `d${r.die}=${r.result}`).join(" → ");
      const display  = exploded ? `💥 ${rollDesc}` : `d${dieSize} = ${total}`;
      const isAnticrit = total === 1 && dieSize > 2;

      let flavor = `<b>${label}</b> — ${display}`;
      if (isAnticrit) flavor += `<br><span style="color:#f87171">💀 АНТИКРИТ!</span>`;
      if (threshold !== null) {
        const hit = total >= threshold;
        flavor += `<br>${hit
          ? `<span style="color:#4ade80">✓ Успех (перевес: +${total - threshold})</span>`
          : `<span style="color:#f87171">✗ Провал</span>`}`;
      }

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: flavor
      });
      await this._applySkillExp(skillKey, label);
      return { total, strategy, success: threshold !== null ? total >= threshold : null };
    }

    // ── Стратегия 2: До победного (тратит энергию) ──
    if (strategy === "reroll") {
      const energyCostPerRoll = options.energyCostPerReroll ?? 10;
      let attempts = 0;
      let finalTotal = 0;
      let satisfied = false;
      const maxAttempts = 10;

      while (!satisfied && attempts < maxAttempts) {
        attempts++;
        const { total, rolls, exploded } = await this._explodingDiceRoll(skillValue);
        finalTotal = total;

        const rollDesc = rolls.map(r => `d${r.die}=${r.result}`).join(" → ");
        const display  = exploded ? `💥 ${rollDesc}` : `d${dieSize} = ${total}`;
        const energy   = Number(actor.system.resources?.energy?.value ?? 0);
        const canAfford = energy >= energyCostPerRoll;

        const choice = await new Promise(resolve => {
          const dlg = new Dialog({
            title: `🔄 ${label} — попытка ${attempts}`,
            content: `<div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;padding:4px 0;">
              <div style="font-size:20px;font-weight:700;color:#e8edf5;text-align:center;margin-bottom:8px;">${display}</div>
              ${threshold !== null ? `<div style="text-align:center;margin-bottom:8px;color:${total >= threshold ? '#4ade80' : '#f87171'};">
                ${total >= threshold ? '✓ Успех!' : '✗ Провал'}
              </div>` : ''}
              <div style="font-size:11px;color:#6a7d99;text-align:center;">
                Перебросить: −${energyCostPerRoll} энергии (осталось: ${energy})
              </div>
            </div>`,
            buttons: {
              keep: { label: "✓ Оставить", callback: () => resolve("keep") },
              reroll: {
                label: canAfford ? `🔄 Перебросить (−${energyCostPerRoll}⚡)` : "⚡ Нет энергии",
                callback: () => resolve(canAfford ? "reroll" : "keep")
              }
            },
            default: "keep",
            close: () => resolve("keep")
          });
          dlg.render(true);
        });

        if (choice === "keep" || choice === "broke") { satisfied = true; break; }

        // Тратим ресурс
        if (choice === "reroll_energy") {
          const newEnergy = Math.max(0, Number(actor.system.resources?.energy?.value ?? 0) - energyCostPerRoll);
          await actor.update({ "system.resources.energy.value": newEnergy });
        } else if (choice === "reroll_mana") {
          const newMana = Math.max(0, Number(actor.system.resources?.mana?.value ?? 0) - energyCostPerRoll);
          await actor.update({ "system.resources.mana.value": newMana });
        }
      }

      let flavor = `<b>${label}</b> — попыток: ${attempts}, итог: <b>${finalTotal}</b>`;
      if (threshold !== null) {
        flavor += `<br>${finalTotal >= threshold
          ? `<span style="color:#4ade80">✓ Успех (перевес: +${finalTotal - threshold})</span>`
          : `<span style="color:#f87171">✗ Провал</span>`}`;
      }

      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: flavor });
      await this._applySkillExp(skillKey, label);
      return { total: finalTotal, strategy, success: threshold !== null ? finalTotal >= threshold : null };
    }

    // ── Стратегия 3: До порога (авто-бросок) ──
    if (strategy === "target" && threshold !== null) {
      let total = 0;
      let attempts = 0;
      let exploded = false;
      const maxAttempts = 20;

      // Бросаем автоматически до достижения порога или исчерпания попыток
      while (total < threshold && attempts < maxAttempts) {
        attempts++;
        const result = await this._explodingDiceRoll(skillValue);
        total = result.total;
        if (result.exploded) exploded = true;
        if (total >= threshold) break;

        // Пауза между бросками для визуала
        await new Promise(r => setTimeout(r, 100));
      }

      const success = total >= threshold;
      const margin  = total - threshold;
      const isAnticrit = total === 1 && dieSize > 2 && attempts === 1;

      let flavor = `<b>${label}</b> — до порога ${threshold}`;
      flavor += `<br>Попыток: ${attempts}${exploded ? " 💥" : ""}, итог: <b>${total}</b>`;
      flavor += `<br>${success
        ? `<span style="color:#4ade80">✓ Успех! Перевес: +${margin}</span>`
        : `<span style="color:#f87171">✗ Провал после ${attempts} попыток</span>`}`;
      if (isAnticrit) flavor += `<br><span style="color:#f87171">💀 Антикрит на первом броске!</span>`;

      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: flavor });
      await this._applySkillExp(skillKey, label);
      return { total, strategy, success, margin };
    }

    return null;
  }

async _performAttack({
  hand = null,
  skillKey,
  label,
  damageType = "physical",
  baseDamage = 1,
  energyCost = 5,
  weapon = null,
  skipTimeCost = false
}) {
    const actor = this._getActorForState();
    if (!actor.system.resources?.energy) return;

    const currentEnergy = Number(actor.system.resources.energy.value ?? 0);
    const encumbrance = getEncumbranceInfo(actor);
    const injuries = getActorInjuryInfo(actor);
    const derivedConditions = getDerivedConditionState(actor);

if (!derivedConditions.canMeleeAttack) {
  ui.notifications.warn("Персонаж не может выполнить ближнюю атаку из-за критических травм.");
  return;
}
    // Враждебное действие вне боя — запрашиваем GM
    if (!isCombatActive() && !game.user?.isGM) {
      const allowed = await this._requestGmHostileAction(`Атака: ${label}`);
      if (!allowed) return;
    }
    const finalEnergyCost = Math.ceil(Number(energyCost) * encumbrance.energyMultiplier);

    const blockReason = getActionBlockReason(actor, "attack", {
      hand,
      weapon,
      energyCost
    });

    if (blockReason) {
      ui.notifications.warn(blockReason);
      return;
    }

    const targets = game.user.targets;
    if (!targets.size) {
      ui.notifications.warn("Выберите цель");
      return;
    }

    const targetActor = [...targets][0].actor;
    if (!targetActor) {
      ui.notifications.warn("У цели нет актёра");
      return;
    }

    const skill = actor.system.skills?.[skillKey];
    if (!skill) {
      ui.notifications.warn(`У персонажа нет навыка ${skillKey}`);
      return;
    }

    if (!skipTimeCost) {
      const timeState = await this._resolveCombatTimeCost({
        actionType: "attack",
        label: `Атака: ${label}`,
        item: weapon,
        totalSeconds: this._getCombatActionSeconds("attack", weapon),
        payload: {
          hand,
          skillKey,
          damageType,
          label,
          baseDamage,
          energyCost,
          weaponId: weapon?.id ?? ""
        }
      });

      if (timeState?.queued) {
        return;
      }

      if (!timeState?.ok) {
        return;
      }
    }

    // ── PATCH 5: Новая боевая формула ──────────────────────────────
    // ШАГ 1: Взрыв кубов — бросок навыка
    const { total: rollTotal, rolls: rollHistory, exploded } =
      await this._explodingDiceRoll(skill.value);

    const dieSize = Math.max(2, skill.value * 2);

    // ШАГ 2: Порог попадания цели
    // Определяем щит цели
    const targetLeftHand = targetActor.system?.equipment?.leftHand
      ? targetActor.items.get(targetActor.system.equipment.leftHand)
      : null;
    const targetHasShield = Boolean(
      targetLeftHand?.system?.isShield ||
      targetLeftHand?.type === "armor"
    );

    // Определяем окружение (сколько союзников атакуют эту же цель)
    const surroundCount = [...(game.user?.targets ?? [])].length > 1
      ? [...(game.user?.targets ?? [])].length - 1
      : 0;

    // Броня цели — для монстров берём из resources.armor
    const targetArmorTier = targetActor.type === "monster"
      ? Number(targetActor.system?.resources?.armor?.physical ?? 0)
      : Number(targetActor.system?.info?.armorTier ?? 0);

    const threshold = getAttackThreshold(targetActor, {
      hasShield:    targetHasShield,
      isLying:      Boolean(targetActor.system?.conditions?.prone),
      isStunned:    Number(targetActor.system?.conditions?.stunned ?? 0) > 0,
      targetFeared: Number(targetActor.system?.conditions?.feared ?? 0) > 0,
      surroundCount,
      inDarkness:   false,
      armorTierOverride: targetActor.type === "monster" ? targetArmorTier : undefined
    });

    // Штраф атакующего снижает результат броска
    const attackPenalty =
      Number(encumbrance.attackPenalty) +
      Number(injuries.meleePenalty ?? injuries.attackPenalty ?? 0);
    const effectiveRoll = rollTotal - attackPenalty;

    // ШАГ 3: Попал или нет
    const failDegree = getFailureDegree(effectiveRoll, threshold, dieSize);
    const success = !failDegree.isFail;

    await actor.update({
      "system.resources.energy.value": Math.max(0, currentEnergy - finalEnergyCost)
    });

    const rollDesc = rollHistory.map(r => `d${r.die}=${r.result}`).join(" → ");
    const rollDisplay = exploded ? `💥 ${rollDesc} = ${rollTotal}` : `${rollTotal}`;

    let content = `
      <h3>Атака: ${label}</h3>
      ${buildChatSectionRow("Атакующий", actor.name)}
      ${buildChatSectionRow("Цель", targetActor.name)}
      ${buildChatSectionRow("Навык", skillKey)}
      ${buildChatSectionRow("Куб", `d${dieSize}`)}
      ${buildChatSectionRow("Бросок", rollDisplay)}
      ${attackPenalty > 0 ? buildChatSectionRow("Штраф", formatSignedNumber(-attackPenalty)) : ""}
      ${buildChatSectionRow("Эффективный бросок", effectiveRoll)}
      ${buildChatSectionRow("Порог попадания", threshold)}
      ${buildChatSectionRow("Энергия", `-${finalEnergyCost}`)}
    `;

    if (!success) {
      // Антикрит
      if (failDegree.isAnticrit) {
        content += `<p><b>💀 АНТИКРИТ!</b> Тяжёлые последствия (степень: ${failDegree.degree})</p>`;
      } else if (failDegree.degree >= 8) {
        content += `<p><b>Результат:</b> Жёсткий промах (степень: ${failDegree.degree})</p>`;
      } else {
        content += `<p><b>Результат:</b> Промах</p>`;
      }
      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
      await this._applySkillExp(skillKey, label);
      return;
    }

    // ШАГ 4: Попал — считаем урон
    const margin = effectiveRoll - threshold;
    const rawDamage = Number(baseDamage) + margin;

    const locationRoll = await new Roll("1d20").evaluate();
    const locationKey = getHitLocation(locationRoll.total);
    const locationLabel = getHitLabel(locationKey);

    const armorItem = getEquippedArmorForLocation(targetActor, locationKey);
    const reduction = getDamageReduction(armorItem, damageType);

    // Большой перевес = пробитие брони
    const armorPenetration = margin >= 8 ? Math.floor(margin / 4) : 0;
    const effectiveReduction = Math.max(0, reduction - armorPenetration);
    const finalDamage = Math.max(0, rawDamage - effectiveReduction);

    let remainingHP, dmgOverflow = 0, dmgOverflowTarget = null;

    if (targetActor.type === "monster") {
      // Монстр — одна полоска HP, учитываем броню
      const monsterArmorPhys = Number(targetActor.system?.resources?.armor?.physical ?? 0);
      const monsterArmorMag  = Number(targetActor.system?.resources?.armor?.magical  ?? 0);
      const monsterReduction = damageType === "magical" ? monsterArmorMag : monsterArmorPhys;
      const monsterPenetration = margin >= 8 ? Math.floor(margin / 4) : 0;
      const monsterEffReduction = Math.max(0, monsterReduction - monsterPenetration);
      const monsterFinalDamage = Math.max(0, rawDamage - monsterEffReduction);
      const currentHp = Number(targetActor.system?.resources?.hp?.value ?? 0);
      remainingHP = Math.max(0, currentHp - monsterFinalDamage);
      await targetActor.update({ "system.resources.hp.value": remainingHP });
    } else {
      const result = await this._applyDamage(targetActor, locationKey, finalDamage);
      remainingHP = result.newHP;
      dmgOverflow = result.overflow;
      dmgOverflowTarget = result.overflowTarget;
      await this._applyInjuryEffects(targetActor, locationKey, finalDamage);
    }

    content += `
      <p><b>Результат:</b> Попадание${margin >= 8 ? " (пробитие!)" : ""}</p>
      ${targetActor.type !== "monster" ? buildChatSectionRow("Часть тела", `${locationLabel} (d20: ${locationRoll.total})`) : ""}
      ${buildChatSectionRow("Перевес", margin)}
      ${buildChatSectionRow("Базовый урон", baseDamage)}
      ${buildChatSectionRow("Сырой урон", rawDamage)}
      ${buildChatSectionRow("Тип урона", damageType === "magical" ? "Магический" : "Физический")}
      ${buildChatSectionRow("Броня", armorItem ? armorItem.name : "Нет")}
      ${buildChatSectionRow("Поглощение", `${effectiveReduction}${armorPenetration > 0 ? ` (пробито: ${armorPenetration})` : ""}`)}
      ${buildChatSectionRow("Итоговый урон", `<span style="font-size:1.1em;"><b>${finalDamage}</b></span>`)}
      ${buildChatSectionRow("Осталось HP", remainingHP)}
      ${dmgOverflow > 0 ? buildChatSectionRow("Переходящий урон", `${dmgOverflow} → ${getTargetPartLabel(dmgOverflowTarget)}`) : ""}
    `;

    if ((locationKey === "head" || locationKey === "torso") && remainingHP <= 0) {
      content += `<p><b>Цель погибает!</b></p>`;
    }

    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
    await this._applySkillExp(skillKey, label);
    this.render(false);
  }

  activateListeners(html) {
    super.activateListeners(html);
    const actor = this._getActorForState();

    html.find("a.is-disabled").on("click", event => {
      event.preventDefault();
      event.stopPropagation();

      const reason = event.currentTarget.getAttribute("title") || "Действие недоступно";
      ui.notifications.warn(reason);
    });

    html.find("[data-action='continue-pending-combat']").on("click", async event => {
      event.preventDefault();
      await this._continuePendingCombatAction();
    });

    html.find("[data-action='cancel-pending-combat']").on("click", async event => {
      event.preventDefault();
      await this._cancelPendingCombatAction();
    });

    html.find("[data-action='end-combat-turn']").on("click", async event => {
      event.preventDefault();
      await this._endCombatTurn();
    });

    html.find("[data-trade-character-select]").on("change", async event => {
      event.preventDefault();
      await this._setTradeCharacter(event.currentTarget.value);
    });

        html.find("[data-start-combat]").on("click", async event => {
      event.preventDefault();
      await this._startCombatFromSheet();
    });

    html.find("[data-end-combat]").on("click", async event => {
      event.preventDefault();
      await this._endCombatFromSheet();
    });

    html.find("[data-next-turn]").on("click", async event => {
      event.preventDefault();
      await this._advanceCombatTurnFromSheet();
    });

    html.find("[data-continue-pending-action]").on("click", async event => {
      event.preventDefault();
      await this._continuePendingCombatAction();
    });

    html.find("[data-cancel-pending-action]").on("click", async event => {
      event.preventDefault();
      await this._cancelPendingCombatAction();
    });

    html.find("[data-open-trade-app]").on("click", event => {
      event.preventDefault();
      event.stopPropagation();
      this._openTradeWindow();
    });

    html.find("[data-skill-roll]").on("click", async event => {
      event.preventDefault();
      const skillKey  = event.currentTarget.dataset.skillRoll;
      const label     = event.currentTarget.dataset.label ?? skillKey;
      const threshold = event.currentTarget.dataset.threshold
        ? Number(event.currentTarget.dataset.threshold)
        : null;
      await this._universalDiceRoll(skillKey, label, { threshold });
    });

    html.find("[data-equip-right]").on("click", async event => {
      event.preventDefault();
      await this._equipWeapon(event.currentTarget.dataset.itemId, "rightHand");
    });

    html.find("[data-equip-left]").on("click", async event => {
      event.preventDefault();
      await this._equipWeapon(event.currentTarget.dataset.itemId, "leftHand");
    });

    html.find("[data-unequip-right]").on("click", async event => {
      event.preventDefault();
      await this._unequipHand("rightHand");
    });

    html.find("[data-unequip-left]").on("click", async event => {
      event.preventDefault();
      await this._unequipHand("leftHand");
    });

    html.find("[data-equip-armor]").on("click", async event => {
      event.preventDefault();
      await this._equipArmor(event.currentTarget.dataset.itemId);
    });

    html.find("[data-unequip-armor]").on("click", async event => {
      event.preventDefault();
      await this._unequipArmor(event.currentTarget.dataset.slotKey);
    });

    html.find("[data-assign-quickslot]").on("click", async event => {
      event.preventDefault();
      await this._assignQuickSlot(event.currentTarget.dataset.itemId, event.currentTarget.dataset.slotKey);
    });

    html.find("[data-clear-quickslot]").on("click", async event => {
      event.preventDefault();
      await this._clearQuickSlot(event.currentTarget.dataset.slotKey);
    });

    html.find("[data-use-quickslot]").on("click", async event => {
      event.preventDefault();
      await this._useQuickSlot(event.currentTarget.dataset.slotKey);
    });

    html.find("[data-delete-item]").on("click", async event => {
      event.preventDefault();
      await this._deleteOwnedItem(event.currentTarget.dataset.itemId);
    });

    html.find("[data-consume-food]").on("click", async event => {
      event.preventDefault();
      await this._consumeFood(event.currentTarget.dataset.itemId);
    });

    html.find("[data-use-potion]").on("click", async event => {
      event.preventDefault();
      await this._usePotion(event.currentTarget.dataset.itemId);
    });

    html.find("[data-use-consumable]").on("click", async event => {
      event.preventDefault();
      await this._useConsumable(event.currentTarget.dataset.itemId);
    });

    html.find("[data-use-throwable]").on("click", async event => {
      event.preventDefault();
      await this._useThrowable(event.currentTarget.dataset.itemId);
    });

    html.find("[data-short-rest]").on("click", async event => {
      event.preventDefault();
      await this._shortRest();
    });

    html.find("[data-full-rest]").on("click", async event => {
      event.preventDefault();
      await this._fullRest();
    });

    html.find("[data-update-effects]").on("click", async event => {
      event.preventDefault();
      await this._updateActiveEffectsTick();
    });

    html.find("[data-revive-actor]").on("click", async event => {
      event.preventDefault();
      if (!game.user?.isGM) {
        ui.notifications.warn("Только GM может воскрешать персонажей.");
        return;
      }
      const quality = Number(event.currentTarget.dataset.quality ?? 1);
      await this._reviveActor(actor, quality);
    });

    html.find("[data-craft-recipe]").on("click", async event => {
      event.preventDefault();
      await this._craftRecipe(event.currentTarget.dataset.recipeId);
    });

    html.find("[data-cast-spell]").on("click", async event => {
      event.preventDefault();
      const item = actor.items.get(event.currentTarget.dataset.itemId);
      await this._castSpellLike({ item, isScroll: false });
    });

    html.find("[data-use-scroll]").on("click", async event => {
      event.preventDefault();
      const item = actor.items.get(event.currentTarget.dataset.itemId);
      await this._castSpellLike({ item, isScroll: true });
    });

    html.find("[data-attack]").on("click", async event => {
      event.preventDefault();

      const hand = event.currentTarget.dataset.attack;
      const weaponId = actor.system.equipment?.[hand];

      if (!weaponId) {
        await this._performAttack({
          hand,
          skillKey: "unarmed",
          label: "Кулаки",
          damageType: "physical",
          baseDamage: Number(actor.system.combat?.unarmedDamage ?? 1),
          energyCost: 5,
          weapon: null
        });
        return;
      }

      const weapon = actor.items.get(weaponId);
      if (!weapon) {
        ui.notifications.warn("Экипированное оружие не найдено");
        return;
      }

      await this._performAttack({
        hand,
        skillKey: weapon.system.skill,
        label: weapon.name,
        damageType: weapon.system.damageType,
        baseDamage: Number(weapon.system.damage ?? 1),
        energyCost: Number(weapon.system.energyCost ?? 10),
        weapon
      });
    });

  }
}

export { IronHillsActorSheet };
