import { uniqueCraftRecipes } from "../constants/recipes.mjs";
import { filterRecipesForActor } from "../constants/craft-knowledge.mjs";
import {
  getEncumbranceInfo,
  getActorInjuryInfo,
  getQuickSlotBonusFromItems,
  getQuickSlotsUnlocked,
  buildQuickSlotCarrierItems,
  getSpellCastBlockReason,
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
} from "./actor-state-service.mjs";
import {
  cleanupInvalidActorReferences,
  ensureActorSkills,
  isItemGridPlaced
} from "./inventory-service.mjs";
import {
  buildRelationsSummary,
  splitRelationsSummary,
} from "./world-content-service.mjs";
import {
  buildActorMedicalTriage,
} from "./body-trauma-service.mjs";
import {
  buildActorBodyHud,
  buildActorResourceHud,
} from "./body-hud-service.mjs";
import {
  isCombatActive,
  getCombatSummary,
  getActorCombatUiState,
  getActiveParticipant,
  getActorPendingAction,
} from "./combat-flow-service.mjs";
import { buildActorRecoveryPlan } from "./recovery-service.mjs";

const SHEET_ITEM_TYPES = Object.freeze([
  "weapon",
  "armor",
  "food",
  "material",
  "resource",
  "tool",
  "spell",
  "potion",
  "scroll",
  "throwable",
  "consumable",
]);

const QUICK_SLOT_KEYS = Object.freeze(["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"]);

function getPlacedItems(actor) {
  const equip = actor.system?.equipment ?? {};
  const equippedIds = new Set(Object.values(equip).filter(Boolean));

  return actor.items.filter(item => {
    if (equippedIds.has(item.id)) return true;
    return isItemGridPlaced(item);
  });
}

function assignTypedItems(context, placedItems) {
  const byType = Object.fromEntries(SHEET_ITEM_TYPES.map(type => [
    type,
    placedItems.filter(item => item.type === type)
  ]));

  context.weapons = byType.weapon;
  context.armors = byType.armor;
  context.foods = byType.food;
  context.materials = byType.material;
  context.resourcesItems = byType.resource;
  context.tools = byType.tool;
  context.spells = byType.spell;
  context.potions = byType.potion;
  context.scrolls = byType.scroll;
  context.throwables = byType.throwable;
  context.consumables = byType.consumable;
}

function assignEquipmentContext(context, actor) {
  const equipment = actor.system?.equipment ?? {};

  context.rightHandWeapon = context.weapons.find(w => w.id === equipment.rightHand);
  context.leftHandWeapon = context.weapons.find(w => w.id === equipment.leftHand);

  context.armorHead = context.armors.find(a => a.id === equipment.armorHead);
  context.armorTorso = context.armors.find(a => a.id === equipment.armorTorso);
  context.armorArms = context.armors.find(a => a.id === equipment.armorArms);
  context.armorLegs = context.armors.find(a => a.id === equipment.armorLegs);
}

function assignQuickSlotItems(context, actor) {
  context.quickSlotItems = {};

  for (const slotKey of QUICK_SLOT_KEYS) {
    const itemId = actor.system.quickSlots?.[slotKey];
    context.quickSlotItems[slotKey] = itemId ? actor.items.get(itemId) : null;
  }
}

function sumGroupedItems(groupedItems, field) {
  return groupedItems.reduce(
    (sum, group) => sum + group.items.reduce((itemSum, item) => itemSum + Number(item[field] ?? 0), 0),
    0
  );
}

function assignSoulTrainingContext(context, actor) {
  const soul = actor.system?.resources?.soul ?? {};
  const energyReserve = soul.energyReserve ?? {};
  const manaReserve = soul.manaReserve ?? {};

  context.soulEnergyTrainPct = energyReserve.max
    ? Math.min(100, Math.round(((energyReserve.trainingAccum ?? 0) / energyReserve.max) * 100))
    : 0;
  context.soulManaTrainPct = manaReserve.max
    ? Math.min(100, Math.round(((manaReserve.trainingAccum ?? 0) / manaReserve.max) * 100))
    : 0;
}

async function assignDiseaseContext(context, actor) {
  if (actor.type !== "character") {
    context.diseases = [];
    context.isGM = false;
    context.activeDiseases = [];
    return;
  }

  try {
    const { DISEASES } = await import("../constants/diseases.mjs");
    globalThis._IH_DISEASES = DISEASES;
    const diseaseData = actor.system?.diseases ?? {};

    context.diseases = Object.entries(diseaseData)
      .filter(([, disease]) => disease && disease.stage >= 0)
      .map(([key, disease]) => {
        const definition = DISEASES[key] ?? { key, label: key, icon: "🦠", stages: [] };
        const stage = definition.stages?.[disease.stage] ?? { label: "?", hoursToNext: null };
        const progressPct = stage.hoursToNext
          ? Math.round(Math.min(100, (disease.progress ?? 0) / stage.hoursToNext * 100))
          : 100;

        return {
          key,
          icon: definition.icon,
          label: definition.label,
          currentStage: disease.stage,
          stageName: stage.label,
          progressPct,
          isCritical: stage.hoursToNext === null,
        };
      });

    context.isGM = game.user?.isGM ?? false;
    context.activeDiseases = Object.entries(diseaseData)
      .filter(([, disease]) => disease?.stage >= 0)
      .map(([key, data]) => {
        const definition = DISEASES[key] ?? { key, label: key, icon: "🦠", stages: [] };
        const stage = definition.stages?.[data.stage] ?? { label: "Неизвестно" };

        return {
          key,
          label: definition.label,
          icon: definition.icon,
          stageLabel: stage.label,
          stage: data.stage,
          progress: data.progress ?? 0,
          duration: data.duration ?? 0,
        };
      });
  } catch {
    context.diseases = [];
    context.isGM = game.user?.isGM ?? false;
    context.activeDiseases = [];
  }
}

function assignBodyContext(context, actor) {
  context.resourceBars = buildActorResourceHud(actor);

  if (actor.type !== "character" && actor.type !== "npc") {
    context.medicalTriage = null;
    context.bodyHud = { visible: false, hasBodyMap: false, parts: [], partMap: {}, figureRows: [], sheetFigureRows: [], chips: [], hasChips: false };
    context.zones = [];
    return;
  }

  context.medicalTriage = buildActorMedicalTriage(actor);
  context.bodyHud = buildActorBodyHud(actor, { medicalTriage: context.medicalTriage });
  context.zones = context.bodyHud.parts;
}

function assignMonsterContext(context, actor) {
  if (actor.type !== "monster") return;

  const hpVal = Number(actor.system?.resources?.hp?.value ?? 0);
  const hpMax = Number(actor.system?.resources?.hp?.max ?? 1);
  const hpPct = Math.round(Math.max(0, Math.min(1, hpVal / Math.max(1, hpMax))) * 100);

  let hpClass = "is-good";
  if (hpPct <= 0) hpClass = "is-dead";
  else if (hpPct <= 25) hpClass = "is-critical";
  else if (hpPct <= 50) hpClass = "is-bad";
  else if (hpPct <= 75) hpClass = "is-warn";

  context.hpPct = hpPct;
  context.hpClass = hpClass;
}

async function assignFactionContext(context, sourceActor) {
  try {
    const { getAllReputations } = await import("./faction-service.mjs");
    context.factions = getAllReputations(sourceActor);
  } catch {
    context.factions = [];
  }
}

function assignInventoryContext(context, actor) {
  const placedItems = getPlacedItems(actor);
  assignTypedItems(context, placedItems);
  assignEquipmentContext(context, actor);
  assignQuickSlotItems(context, actor);

  const groupedItems = buildGroupedItems(actor);
  context.groupedItems = groupedItems;
  context.totalInventoryWeight = sumGroupedItems(groupedItems, "totalWeight");
  context.totalInventoryPrice = sumGroupedItems(groupedItems, "totalPrice");
  context.equipmentSummary = buildEquipmentSummary(actor);
  context.quickSlotsSummary = buildQuickSlotsSummary(actor);
}

function assignMagicContext(context, actor) {
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
}

function assignOverviewContext(context, actor) {
  try {
    context.overviewSummary = buildOverviewSummary(actor);
    context.calculatedTier = context.overviewSummary.calculatedTier ?? 1;
  } catch {
    context.overviewSummary = {
      calculatedTier: 1,
      energyPct: 0,
      manaPct: 0,
      satietyPct: 0,
      hydrationPct: 0,
      weightPct: 0,
      weightValue: 0,
      weightMax: 0,
      encumbranceLabel: "—",
      energyValue: 0,
      energyMax: 0,
      manaValue: 0,
      manaMax: 0,
      satietyValue: 0,
      satietyMax: 0,
      hydrationValue: 0,
      hydrationMax: 0
    };
    context.calculatedTier = 1;
  }
}

function assignCombatContext(context, actor) {
  context.combatSummary = buildCombatSummary(actor);
  context.combatDetailed = buildDetailedCombatView(actor);
  context.combatFlow = getActorCombatUiState(actor);
  context.globalCombatSummary = getCombatSummary();
  context.pendingCombatAction = getActorPendingAction(actor);
  context.isCombatActive = isCombatActive();

  const activeParticipant = getActiveParticipant();
  context.isCombatTurn = Boolean(
    context.isCombatActive &&
    activeParticipant &&
    (activeParticipant.actorId === actor.id || activeParticipant.actorUuid === actor.uuid)
  );

  context.canContinuePendingCombatAction =
    Boolean(context.pendingCombatAction) && Boolean(context.isCombatTurn);
  context.canCancelPendingCombatAction = Boolean(context.pendingCombatAction);
  context.canEndCombatTurn = Boolean(context.combatFlow?.active) && Boolean(context.isCombatTurn);
}

export async function prepareActorSheetDataActor(actor) {
  await cleanupInvalidActorReferences(actor);
  await ensureActorSkills(actor);
}

export async function buildActorSheetDataContext({
  actor,
  sourceActor = actor,
  context = {},
} = {}) {
  if (!actor) return context;

  context.actor = actor;
  context.system = actor.system;
  context.items = actor.items;
  context.allItems = actor.items;

  assignInventoryContext(context, actor);

  context.encumbrance = getEncumbranceInfo(actor);
  context.injuries = getActorInjuryInfo(actor);
  context.recipes = filterRecipesForActor(actor, uniqueCraftRecipes());
  assignSoulTrainingContext(context, actor);

  context.relationsSummary = buildRelationsSummary(actor);
  const splitRelations = splitRelationsSummary(context.relationsSummary);
  context.settlementRelations = splitRelations.settlements;
  context.factionRelations = splitRelations.factions;

  assignCombatContext(context, actor);
  assignMagicContext(context, actor);
  assignOverviewContext(context, actor);
  await assignDiseaseContext(context, actor);

  context.tradeSummary = buildTradeSummary(actor);
  context.recoveryPlan = buildActorRecoveryPlan(actor);
  context.quickSlotsUnlocked = getQuickSlotsUnlocked(actor);
  context.quickSlotBonus = getQuickSlotBonusFromItems(actor);
  context.quickSlotCarrierItems = buildQuickSlotCarrierItems(actor);
  context.skillGroups = buildSkillGroups(actor);
  context.actionState = buildActionState(actor);
  context.quickSlotActionStates = buildQuickSlotActionStates(actor);

  assignBodyContext(context, actor);
  assignMonsterContext(context, actor);
  await assignFactionContext(context, sourceActor);

  return context;
}
