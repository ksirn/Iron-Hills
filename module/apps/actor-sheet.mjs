import { CRAFT_RECIPES, uniqueCraftRecipes } from "../constants/recipes.mjs";
import { filterRecipesForActor } from "../constants/craft-knowledge.mjs";
import { EntityPickerDialog } from "./entity-picker.mjs";
import { getExpNext } from "../utils/text-utils.mjs";
import {
  getLiveActor,
  getPersistentActor,
  isSyntheticActorDocument,
} from "../utils/actor-utils.mjs";
import {
  getEncumbranceInfo,
  getActorInjuryInfo,
  getQuickSlotBonusFromItems,
  getQuickSlotsUnlocked,
  buildQuickSlotCarrierItems,
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
  grantSkillExp,
} from "../services/actor-state-service.mjs";
import {
  performUniversalSkillRoll,
  rollExplodingDice
} from "../services/skill-roll-service.mjs";
import { addItemToActorOrStack } from "../services/trade-service.mjs";
import {
  recalculateActorWeight,
  cleanupInvalidActorReferences,
  ensureActorSkills,
  isItemGridPlaced
} from "../services/inventory-service.mjs";
import {
  assignActorQuickSlot,
  clearActorQuickSlot,
  deleteActorOwnedItem,
  equipActorArmorFromSheet,
  equipActorWeaponFromSheet,
  unequipActorArmorFromSheet,
  unequipActorHandFromSheet
} from "../services/actor-equipment-service.mjs";
import {
  getPendingItemActionConfig,
  resumePendingItemAction,
  useConsumableItemFromSheet,
  useFoodItemFromSheet,
  useItemByType,
  usePotionItemFromSheet
} from "../services/actor-item-use-service.mjs";
import { repairActorItem } from "../services/repair-service.mjs";
import {
  openPendingInventoryIfNeeded,
  requireSettledInventoryForActor
} from "../services/pending-inventory-service.mjs";
import { requestGmHostileAction } from "../services/hostile-action-service.mjs";
import {
  advanceCombatTurnFromSheet,
  cancelPendingCombatActionFromSheet,
  commitTimedActionFromSheet,
  continuePendingCombatActionFromSheet,
  endCombatFromSheet,
  endCombatTurnFromSheet,
  handlePostActionSecondsState,
  resolveCombatTimeCostForActor,
  startCombatFromSheet
} from "../services/actor-combat-sheet-service.mjs";
import {
  buildRelationsSummary,
  splitRelationsSummary,
} from "../services/world-content-service.mjs";
import {
  queueActorSheetRender,
  refreshAllTradeUIs,
  rerenderOpenIronHillsActorSheets
} from "../services/ui-refresh-service.mjs";
import { performActorAttack } from "../services/attack-flow-service.mjs";
import {
  applyActorConditionTick,
  applyActorFullRest,
  applyActorShortRest,
  cureActorDisease,
  markActorDead,
  reviveActor
} from "../services/condition-service.mjs";
import { applyActionTypeItemFromDialog } from "../services/item-action-dialog-service.mjs";
import { useThrowableItem } from "../services/throwable-service.mjs";
import {
  castSpellLikeItem
} from "../services/spell-casting-service.mjs";
import {
  isCombatActive,
  getCombatSummary,
  getActorCombatUiState,
  getActiveParticipant,
  getActorPendingAction,
  ensureCombatActorBodyStatus
} from "../services/combat-flow-service.mjs";
import { TarkovTradeApp } from "./tarkov-trade-app.mjs";

class IronHillsActorSheet extends ActorSheet {
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
    await this._openPendingInventoryIfNeeded(actor);

    this.render(false);
    return true;
  }
  async _startCombatFromSheet() {
    return startCombatFromSheet(this._getActorForState(), {
      render: (force) => this.render(force),
    });
  }

  async _endCombatFromSheet() {
    return endCombatFromSheet({
      render: (force) => this.render(force),
    });
  }

  async _advanceCombatTurnFromSheet() {
    return advanceCombatTurnFromSheet(this._getActorForState(), {
      render: (force) => this.render(force),
    });
  }

  async _continuePendingCombatAction() {
    return continuePendingCombatActionFromSheet(this._getActorForState(), {
      executePendingAction: (action) => this._executePendingCombatAction(action),
      render: (force) => this.render(force),
    });
  }

  async _endCombatTurn() {
    return endCombatTurnFromSheet(this._getActorForState(), {
      render: (force) => this.render(force),
    });
  }

  async _cancelPendingCombatAction() {
    return cancelPendingCombatActionFromSheet(this._getActorForState(), {
      render: (force) => this.render(force),
    });
  }

  async _commitTimedAction({ actionType, label, timeCost, payload = {} }) {
    return commitTimedActionFromSheet(this._getActorForState(), {
      actionType,
      label,
      timeCost,
      payload
    }, {
      render: (force) => this.render(force),
    });
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

    // Только размещённые предметы (имеют sectionKey или в экипировке)
    // Нераспределённые (pending) не показываем в листе — только в PendingItemsApp
    const equip = actor.system?.equipment ?? {};
    const equippedIds = new Set(Object.values(equip).filter(Boolean));
    const placedItems = actor.items.filter(i => {
      if (equippedIds.has(i.id)) return true;
      return isItemGridPlaced(i);
    });

    const filterPlaced = (type) => placedItems.filter(i => i.type === type);

    context.weapons      = filterPlaced("weapon");
    context.armors       = filterPlaced("armor");
    context.foods        = filterPlaced("food");
    context.materials    = filterPlaced("material");
    context.resourcesItems = filterPlaced("resource");
    context.tools        = filterPlaced("tool");
    context.spells       = filterPlaced("spell");
    context.potions      = filterPlaced("potion");
    context.scrolls      = filterPlaced("scroll");
    context.throwables   = filterPlaced("throwable");
    context.consumables  = filterPlaced("consumable");

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
    context.recipes = filterRecipesForActor(actor, uniqueCraftRecipes());

    // Прогресс раскачки резерва души (0–100%)
    const _soul = actor.system?.resources?.soul ?? {};
    const _enRes = _soul.energyReserve ?? {};
    const _mnRes = _soul.manaReserve   ?? {};
    context.soulEnergyTrainPct = _enRes.max
      ? Math.min(100, Math.round(((_enRes.trainingAccum ?? 0) / _enRes.max) * 100))
      : 0;
    context.soulManaTrainPct = _mnRes.max
      ? Math.min(100, Math.round(((_mnRes.trainingAccum ?? 0) / _mnRes.max) * 100))
      : 0;

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

    // Болезни
    if (actor.type === "character") {
      try {
        const { DISEASES } = await import("../constants/diseases.mjs");
        globalThis._IH_DISEASES = DISEASES;
        const diseaseData = actor.system?.diseases ?? {};
        context.diseases = Object.entries(diseaseData)
          .filter(([, d]) => d && d.stage >= 0)
          .map(([key, d]) => {
            const def   = DISEASES[key] ?? { key, label: key, icon: "🦠", stages: [] };
            const stage = def.stages?.[d.stage] ?? { label: "?", hoursToNext: null };
            const pct   = stage.hoursToNext
              ? Math.round(Math.min(100, (d.progress ?? 0) / stage.hoursToNext * 100))
              : 100;
            return {
              key, icon: def.icon, label: def.label,
              currentStage: d.stage,
              stageName:    stage.label,
              progressPct:  pct,
              isCritical:   stage.hoursToNext === null,
            };
          });
      } catch { context.diseases = []; }
      context.isGM = game.user?.isGM ?? false;
    } else {
      context.diseases = [];
      context.isGM = false;
    }

      // Активные болезни для character sheet
      const diseaseData = actor.system?.diseases ?? {};
      const DCATALOG    = globalThis._IH_DISEASES ?? {};
      context.activeDiseases = Object.entries(diseaseData)
        .filter(([, d]) => d?.stage >= 0)
        .map(([key, data]) => {
          const def   = DCATALOG[key] ?? { key, label: key, icon: "🦠", stages: [] };
          const stage = def.stages?.[data.stage] ?? { label: "Неизвестно" };
          return {
            key,
            label:      def.label,
            icon:       def.icon,
            stageLabel: stage.label,
            stage:      data.stage,
            progress:   data.progress ?? 0,
            duration:   data.duration ?? 0,
          };
        });
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

  function zoneTooltip(label, value, max, trauma) {
    const parts = [`${label}: ${value}/${max}`];
    if (trauma.destroyed) parts.push("Разрушено");
    if (trauma.majorBleeding) parts.push(trauma.majorBleedingSuppressed
      ? `Сильное кровотечение пережато: ${trauma.majorBleeding}`
      : `Сильное кровотечение: ${trauma.majorBleeding}`);
    if (trauma.minorBleeding) parts.push(`Малое кровотечение: ${trauma.minorBleeding}`);
    if (trauma.fracture) parts.push("Перелом");
    if (trauma.tourniquet) parts.push("Жгут наложен");
    if (trauma.splinted) parts.push("Шина наложена");
    return parts.join(" | ");
  }

  function zoneData(key, label, node) {
    const val = Number(node?.value ?? 0);
    const max = Number(node?.max ?? 0);
    const pct = max > 0 ? Math.round((val / max) * 100) : 0;
    const status = node?.status ?? {};
    const majorBleeding = Number(status.majorBleeding ?? 0);
    const tourniquet = Boolean(status.tourniquet);
    const trauma = {
      minorBleeding: Number(status.minorBleeding ?? 0),
      majorBleeding,
      majorBleedingSuppressed: tourniquet && majorBleeding > 0,
      majorBleedingTitle: tourniquet && majorBleeding > 0
        ? `Сильн. кровь пережата ${majorBleeding}`
        : `Сильн. кровь ${majorBleeding}`,
      fracture:   Boolean(status.fracture),
      destroyed:  Boolean(status.destroyed),
      splinted:   Boolean(status.splinted),
      tourniquet
    };
    return {
      key, label, value: val, max, pct,
      cssClass: zoneClass(val, max),
      tooltip: zoneTooltip(label, val, max, trauma),
      trauma
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

    // Репутация у фракций
    try {
      const { getAllReputations } = await import("../services/faction-service.mjs");
      context.factions = getAllReputations(this.actor);
    } catch(e) {
      context.factions = [];
    }

    return context;
  }

  async _handlePostActionSecondsState(actor) {
    return handlePostActionSecondsState(actor, {
      render: (force) => this.render(force),
    });
  }

  async _resolveCombatTimeCost({ actionType, label, item = null, totalSeconds = 0, payload = {} } = {}) {
    return resolveCombatTimeCostForActor(this._getActorForState(), {
      actionType,
      label,
      item,
      totalSeconds,
      payload,
    }, {
      requireSettledInventory: (actionLabel) => this._requireSettledInventory(actionLabel),
    });
  }

  async _useItemByType(itemOrId, {
    skipTimeCost = false,
    allowWeapon = false,
    allowedTypes = null,
    missingMessage = "Предмет не найден",
    unsupportedMessage = "Этот тип предмета пока нельзя использовать",
  } = {}) {
    return useItemByType(this._getActorForState(), itemOrId, {
      skipTimeCost,
      allowWeapon,
      allowedTypes,
      missingMessage,
      unsupportedMessage,
      handlers: this._getItemUseHandlers(),
    });
  }

  async _resumePendingItemAction(data, config) {
    return resumePendingItemAction(
      this._getActorForState(),
      data,
      config,
      this._getItemUseHandlers()
    );
  }

  async _executePendingCombatAction(pendingAction) {
    const actor = this._getActorForState();
    if (!actor || !pendingAction) return;

    const data = pendingAction.data ?? {};
    const actionType = pendingAction.actionType || data.actionType || "generic";
    if (!(await this._requireSettledInventory(pendingAction.label || "продолжение действия"))) return;

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
        hitBonus: Number(data.hitBonus ?? 0),
        ignoreArmor: Number(data.ignoreArmor ?? 0),
        targetZone: data.targetZone ?? null,
        aimed: Boolean(data.aimed ?? false),
        technique: data.technique ?? null,
        applyCondition: data.applyCondition ?? null,
        conditionDuration: Number(data.conditionDuration ?? 0),
        conditionChance: Number(data.conditionChance ?? 1),
        effectNotes: Array.isArray(data.effectNotes) ? data.effectNotes : [],
        rangeOverride: Number(data.rangeOverride ?? 0) || null,
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

    const pendingItemConfig = getPendingItemActionConfig(actionType);
    if (pendingItemConfig) {
      await this._resumePendingItemAction(data, pendingItemConfig);
      return;
    }

    ui.notifications.info(`Действие "${pendingAction.label || "действие"}" завершено.`);
  }

  _getItemUseHandlers() {
    return {
      useFood: (itemId, options) => this._consumeFood(itemId, options),
      usePotion: (itemId, options) => this._usePotion(itemId, options),
      useConsumable: (itemId, options) => this._useConsumable(itemId, options),
      useThrowable: (itemId, options) => this._useThrowable(itemId, options),
      castSpell: (options) => this._castSpellLike(options),
      equipWeapon: (itemId, hand) => this._equipWeapon(itemId, hand),
    };
  }

  async _applySkillExp(skillKey, label, amount = 1) {
    await grantSkillExp(this._getActorForState(), skillKey, label, amount);
  }

  async _openPendingInventoryIfNeeded(actor = this._getActorForState()) {
    return openPendingInventoryIfNeeded(actor);
  }

  async _requireSettledInventory(actionLabel = "действие") {
    return this._requireSettledInventoryForActor(this._getActorForState(), actionLabel);
  }

  async _requireSettledInventoryForActor(actor, actionLabel = "действие") {
    return requireSettledInventoryForActor(actor, actionLabel);
  }

  async _equipWeapon(itemId, hand) {
    const actor = this._getActorForState();
    return equipActorWeaponFromSheet(actor, itemId, hand, {
      requireSettledInventory: (actionLabel) => this._requireSettledInventory(actionLabel),
      afterChange: () => this._openPendingInventoryIfNeeded(actor),
    });
  }

  async _unequipHand(hand) {
    const actor = this._getActorForState();
    return unequipActorHandFromSheet(actor, hand, {
      afterChange: () => this._openPendingInventoryIfNeeded(actor),
    });
  }

  async _equipArmor(itemId) {
    const actor = this._getActorForState();
    return equipActorArmorFromSheet(actor, itemId, {
      requireSettledInventory: (actionLabel) => this._requireSettledInventory(actionLabel),
      afterChange: () => this._openPendingInventoryIfNeeded(actor),
    });
  }

  async _unequipArmor(slotKey) {
    const actor = this._getActorForState();
    return unequipActorArmorFromSheet(actor, slotKey, {
      afterChange: () => this._openPendingInventoryIfNeeded(actor),
    });
  }

  async _assignQuickSlot(itemId, slotKey) {
    const actor = this._getActorForState();
    return assignActorQuickSlot(actor, itemId, slotKey);
  }

  async _clearQuickSlot(slotKey) {
    const actor = this._getActorForState();
    return clearActorQuickSlot(actor, slotKey);
  }

  async _deleteOwnedItem(itemId) {
    const actor = this._getActorForState();
    return deleteActorOwnedItem(actor, itemId, {
      afterDelete: () => {
        this._refreshActorItemUseUis(actor);
      },
    });
  }

  _refreshActorItemUseUis(actor = this._getActorForState()) {
    queueActorSheetRender(actor);
    refreshAllTradeUIs(IronHillsActorSheet, TarkovTradeApp);
  }

  async _consumeFood(itemId, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    await useFoodItemFromSheet(actor, itemId, {
      skipTimeCost,
      resolveCombatTimeCost: (args) => this._resolveCombatTimeCost(args),
      afterRefresh: () => this._refreshActorItemUseUis(actor),
    });
  }

  async _usePotion(itemId, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    return usePotionItemFromSheet(actor, itemId, {
      skipTimeCost,
      resolveCombatTimeCost: (args) => this._resolveCombatTimeCost(args),
      applyActionTypeItem: (actor, item) => this._applyActionTypeItem(actor, item),
      afterRefresh: () => this._refreshActorItemUseUis(actor),
    });
  }

  async _applyActionTypeItem(sourceActor, item) {
    return applyActionTypeItemFromDialog(sourceActor, item);
  }

  async _useConsumable(itemId, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    return useConsumableItemFromSheet(actor, itemId, {
      skipTimeCost,
      resolveCombatTimeCost: (args) => this._resolveCombatTimeCost(args),
      applyActionTypeItem: (actor, item) => this._applyActionTypeItem(actor, item),
      afterRefresh: () => this._refreshActorItemUseUis(actor),
    });
  }

  async _castSpellLike({ item, isScroll = false, skipTimeCost = false }) {
    const actor = this._getActorForState();
    await castSpellLikeItem({
      actor,
      item,
      isScroll,
      skipTimeCost,
      resolveCombatTimeCost: (args) => this._resolveCombatTimeCost(args),
      requestHostileAction: (label) => this._requestGmHostileAction(label),
      applySkillExp: (skillKey, label) => this._applySkillExp(skillKey, label),
      onLethal: (target) => this._markActorDead(target),
      afterCast: () => this._refreshActorItemUseUis(actor),
    });
  }

  async _useThrowable(itemId, { skipTimeCost = false } = {}) {
    const actor = this._getActorForState();
    await useThrowableItem({
      actor,
      itemId,
      skipTimeCost,
      resolveCombatTimeCost: (args) => this._resolveCombatTimeCost(args),
      requestHostileAction: (label) => this._requestGmHostileAction(label),
      applySkillExp: (skillKey, label) => this._applySkillExp(skillKey, label),
      onLethal: (target) => this._markActorDead(target),
      afterUse: () => this._refreshActorItemUseUis(actor),
    });
  }

  async _updateActiveEffectsTick() {
    await applyActorConditionTick(this._getActorForState(), {
      onLethal: (actor) => this._markActorDead(actor)
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

    await this._useItemByType(item, {
      skipTimeCost,
      allowWeapon: true,
      unsupportedMessage: "Этот тип предмета пока нельзя использовать из быстрого слота",
    });
  }

  async _shortRest() {
    const actor = this._getActorForState();
    if (!(await this._requireSettledInventory("короткий отдых"))) return;
    await applyActorShortRest(actor);
  }

  async _fullRest() {
    const actor = this._getActorForState();
    if (!(await this._requireSettledInventory("полный отдых"))) return;
    await applyActorFullRest(actor);
  }

  async _craftRecipe(recipeId) {
    const actor = this._getActorForState();
    if (!(await this._requireSettledInventory("ремесло"))) return;
    const recipe = CRAFT_RECIPES[recipeId];
    if (!recipe) {
      ui.notifications.warn("Рецепт не найден");
      return;
    }
    ui.notifications.info("Собери ингредиенты на верстаке: окно «Ремесло», вкладка нужного навыка.");
    game.ironHills?.openCraftWorkbenchWindow?.(actor, { initialSkillKey: recipe.skillKey });
  }

  async _openTradeWindow() {
    const merchant = getLiveActor(this.actor);
    if (!merchant || merchant.type !== "merchant") return;

    const buyer = game.user?.character ?? canvas?.tokens?.controlled?.find(t => t.actor?.type === "character")?.actor ?? null;
    if (!(await this._requireSettledInventoryForActor(buyer, "торговля"))) return;
    TarkovTradeApp.open(merchant, buyer);
  }

  // Запрашивает разрешение GM на враждебное действие вне боя.
  // Возвращает true если можно действовать, false — если нет.
  async _requestGmHostileAction(actionLabel) {
    return requestGmHostileAction(this._getActorForState(), actionLabel);
  }


  /**
   * Отмечает персонажа как мёртвого — начинает отсчёт убывания резерва.
   * Вызывается когда голова или торс достигают 0 HP.
   */
  async _markActorDead(actor) {
    return markActorDead(actor);
  }

  /**
   * Воскрешение — сбрасывает флаг смерти, восстанавливает HP.
   * @param {number} quality — качество воскрешения 1-10 (ступень церкви/свитка)
   */
  async _reviveActor(actor, quality = 1) {
    return reviveActor(actor, quality);
  }

  /**
   * Вылечить болезнь
   */
  async _cureDisease(actor, diseaseKey) {
    return cureActorDisease(actor, diseaseKey);
  }

  /**
   * Ремонт предмета.
   * Навык зависит от типа предмета.
   * Качество ремонта ограничено соотношением навык/ступень.
   */
  async _repairItem(actor, item) {
    return repairActorItem(actor, item, {
      applySkillExp: (skillKey, label) => this._applySkillExp(skillKey, label),
    });
  }

  /**
   * Взрыв кубов (Exploding Dice).
   * Если выпал максимум — предлагаем перейти на следующий куб.
   * Лист оставляет старый публичный метод для внешних окон, реализация живёт в сервисе.
   *
   * @param {number} skillValue — ступень навыка (1-10)
   * @returns {{ total: number, rolls: number[], exploded: boolean }}
   */
  async _explodingDiceRoll(skillValue) {
    return rollExplodingDice(skillValue);
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
    return performUniversalSkillRoll(this._getActorForState(), skillKey, label, options, {
      applySkillExp: (skillKey, expLabel) => this._applySkillExp(skillKey, expLabel),
      dieRoller: (skillValue) => this._explodingDiceRoll(skillValue),
    });
  }

  async _performAttack({
  hand = null,
  skillKey,
  label,
  damageType = "physical",
  baseDamage = 1,
  energyCost = 5,
  weapon = null,
  skipTimeCost = false,
  // Боевые приёмы и прицельный удар
  hitBonus       = 0,
  ignoreArmor    = 0,
  targetZone     = null,
  aimed          = false,
  technique      = null,
  applyCondition = null,
  conditionDuration = 0,
  conditionChance   = 1.0,
  effectNotes = [],
  rangeOverride = null,
}) {
    const actor = this._getActorForState();
    return performActorAttack({
      actor,
      hand,
      skillKey,
      label,
      damageType,
      baseDamage,
      energyCost,
      weapon,
      hitBonus,
      ignoreArmor,
      targetZone,
      aimed,
      technique,
      applyCondition,
      conditionDuration,
      conditionChance,
      effectNotes,
      rangeOverride,
      requireSettledInventory: (actionLabel) => this._requireSettledInventory(actionLabel),
      resolveCombatTimeCost: (args) => this._resolveCombatTimeCost(args),
      requestHostileAction: (actionLabel) => this._requestGmHostileAction(actionLabel),
      dieRoller: (skillValue) => this._explodingDiceRoll(skillValue),
      onLethal: (target) => this._markActorDead(target),
      applySkillExp: (skillKey, expLabel) => this._applySkillExp(skillKey, expLabel),
      afterAttack: () => this.render(false),
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    const actor = this._getActorForState();

    // Кнопка "Открыть инвентарь" в листе персонажа
    html.find("[data-open-inventory]").on("click", () => {
      const a = this._getActorForState?.() ?? this.actor;
      game.ironHills?.openGridInventory?.(a);
    });

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

    html.find("[data-open-trade-app]").on("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      await this._openTradeWindow();
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
      await this._useItemByType(event.currentTarget.dataset.itemId, {
        allowedTypes: ["food"],
        missingMessage: "Предмет не найден или не является едой",
        unsupportedMessage: "Предмет не найден или не является едой",
      });
    });

    html.find("[data-use-potion]").on("click", async event => {
      event.preventDefault();
      await this._useItemByType(event.currentTarget.dataset.itemId, {
        allowedTypes: ["potion"],
        missingMessage: "Зелье не найдено",
        unsupportedMessage: "Зелье не найдено",
      });
    });

    html.find("[data-use-consumable]").on("click", async event => {
      event.preventDefault();
      await this._useItemByType(event.currentTarget.dataset.itemId, {
        allowedTypes: ["consumable"],
        missingMessage: "Расходник не найден",
        unsupportedMessage: "Расходник не найден",
      });
    });

    html.find("[data-use-throwable]").on("click", async event => {
      event.preventDefault();
      await this._useItemByType(event.currentTarget.dataset.itemId, {
        allowedTypes: ["throwable"],
        missingMessage: "Метательный предмет не найден",
        unsupportedMessage: "Метательный предмет не найден",
      });
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

    html.find("[data-cure-disease]").on("click", async event => {
      if (!game.user?.isGM) return;
      const key = event.currentTarget.dataset.cureDisease;
      await this._cureDisease(actor, key);
      this.render(false);
    });

    // ── Болезни ──────────────────────────────────────────────
    // ── Репутация ─────────────────────────────────────────────
    // ── Пробуждённый ─────────────────────────────────────────
    html.find("[data-toggle-awakened]").on("click", async () => {
      if (!game.user?.isGM) return;
      const current = actor.system?.resources?.awakened?.isAwakened ?? false;
      await actor.update({ "system.resources.awakened.isAwakened": !current });
      this.render(false);
    });

    html.find("[data-rel-change]").on("click", async event => {
      if (!game.user?.isGM) return;
      const relId  = event.currentTarget.dataset.relId;
      const change = Number(event.currentTarget.dataset.relChange ?? 0);
      const relActor = game.actors.get(relId);
      if (!relActor) return;
      const current  = Number(relActor.system.info?.score ?? 0);
      const newScore = Math.max(-100, Math.min(100, current + change));

      // Tier по score
      const tier = newScore >= 80 ? "ally"
        : newScore >= 40 ? "friendly"
        : newScore >= 10 ? "cordial"
        : newScore >= -9 ? "neutral"
        : newScore >= -39 ? "unfriendly"
        : newScore >= -79 ? "hostile"
        : "enemy";

      await relActor.update({
        "system.info.score": newScore,
        "system.info.tier":  tier,
      });

      await ChatMessage.create({
        content: `📊 Репутация <b>${actor.name}</b> у <b>${relActor.system.info?.targetName}</b>: ${current > 0 ? "+" : ""}${current} → ${newScore > 0 ? "+" : ""}${newScore}`
      });

      this.render(false);
    });

    html.find("[data-add-relation]").on("click", async () => {
      if (!game.user?.isGM) return;

      // Пикер — выбор существующей сущности
      const picked = await EntityPickerDialog.pick({
        title:       "Выбрать цель репутации",
        types:       ["settlement", "faction"],
        placeholder: "Поиск поселения или фракции...",
        groupBy:     a => a.type === "settlement" ? "Поселения" : "Фракции",
      });

      if (!picked) return;

      // Проверяем нет ли уже такой записи
      const existing = game.actors.find(a =>
        a.type === "relation" &&
        a.system.info?.characterName === actor.name &&
        a.system.info?.targetName    === picked.name
      );
      if (existing) {
        ui.notifications.warn(`Репутация с "${picked.name}" уже существует.`);
        return;
      }

      await Actor.create({
        name:   `${actor.name} → ${picked.name}`,
        type:   "relation",
        img:    picked.img,
        system: {
          info: {
            characterId:   actor.id,
            characterName: actor.name,
            targetId:      picked.id,
            targetName:    picked.name,
            targetType:    picked.type,
            score:         0,
            tier:          "neutral",
            notes:         ""
          }
        }
      });

      this.render(false);
    });

    html.find("[data-add-disease]").on("click", async () => {
      if (!game.user?.isGM) return;
      const { DISEASES } = await import("../constants/diseases.mjs");

      const buttons = {};
      for (const [key, def] of Object.entries(DISEASES)) {
        const existing = actor.system?.diseases?.[key];
        if (existing && existing.stage >= 0) continue; // уже болеет
        buttons[key] = { label: `${def.icon} ${def.label}`, callback: () => key };
      }

      if (!Object.keys(buttons).length) {
        ui.notifications.info("Персонаж уже болеет всеми болезнями из каталога.");
        return;
      }

      const chosen = await Dialog.wait({
        title: "Заразить болезнью",
        content: `<p style="color:#a8b8d0">Выбери болезнь для <b>${actor.name}</b>:</p>`,
        buttons,
        default: Object.keys(buttons)[0]
      });

      if (!chosen) return;

      const diseases = foundry.utils.deepClone(actor.system?.diseases ?? {});
      diseases[chosen] = { stage: 0, progress: 0, duration: 0 };
      await actor.update({ "system.diseases": diseases });

      const def = DISEASES[chosen];
      await ChatMessage.create({
        content: `${def.icon} <b>${actor.name}</b> заражён: <b>${def.label}</b> (инкубация)`
      });

      this.render(false);
    });

    html.find("[data-cure-disease]").on("click", async event => {
      if (!game.user?.isGM) return;
      const dKey = event.currentTarget.dataset.cureDisease;
      const diseases = foundry.utils.deepClone(actor.system?.diseases ?? {});
      if (diseases[dKey]) {
        diseases[dKey] = { stage: -1, progress: 0, duration: diseases[dKey].duration ?? 0 };
        await actor.update({ "system.diseases": diseases });
        ui.notifications.info(`${actor.name}: болезнь вылечена.`);
        this.render(false);
      }
    });

    html.find("[data-item-repair]").on("click", async event => {
      event.preventDefault();
      const itemId = event.currentTarget.dataset.itemId;
      const item = actor.items.get(itemId);
      if (!item) return;
      await this._repairItem(actor, item);
      this.render(false);
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
  async _editRepDialog(faction) {
    const { changeReputation, getReputation, getRepLevel } = await import("../services/faction-service.mjs").catch(()=>({}));
    if (!changeReputation) return;

    const cur   = getReputation(this.actor, faction);
    const level = getRepLevel(cur);

    const result = await Dialog.wait({
      title:   `Репутация: ${this.actor.name} ↔ ${faction.name}`,
      content: `
        <div style="padding:8px;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="color:${level.color};font-size:20px">●</span>
            <div>
              <div style="font-weight:700">${level.label}</div>
              <div style="font-size:11px;color:#a8b8d0">Текущая: ${cur}</div>
            </div>
          </div>
          <label style="font-size:12px">Установить значение (−100..+100):
            <input type="number" id="rep-val" value="${cur}" min="-100" max="100"
                   style="width:100%;margin-top:4px;padding:4px;background:#1a1f2e;
                          border:1px solid #3a4a6a;border-radius:4px;color:#e0e8f0">
          </label>
          <label style="font-size:12px">Причина:
            <input type="text" id="rep-reason" value="" placeholder="Необязательно"
                   style="width:100%;margin-top:4px;padding:4px;background:#1a1f2e;
                          border:1px solid #3a4a6a;border-radius:4px;color:#e0e8f0">
          </label>
        </div>`,
      buttons: {
        ok:     { label: "✓ Применить", callback: html => ({
          val:    Number(html.find("#rep-val").val()),
          reason: html.find("#rep-reason").val() || "GM",
        })},
        cancel: { label: "Отмена", callback: () => null },
      },
      default: "ok",
    });

    if (!result) return;
    const delta = result.val - cur;
    if (delta === 0) return;
    await changeReputation(this.actor, faction, delta, result.reason);
    this.render(false);
  }


}

export { IronHillsActorSheet };
