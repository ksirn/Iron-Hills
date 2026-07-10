import {
  ECONOMY_STATES,
  MERCHANT_TYPES,
  generateMerchantActorStockItems,
  setSettlementEconomy,
} from "./services/merchant-service.mjs";
import { EntityPickerDialog } from "./apps/entity-picker.mjs";
import { randInt, choice, clamp } from "./utils/math-utils.mjs";
import {
  makeName,
  randomMerchantStock,
  randomContainerLoot,
  buildNpcActorData,
  buildPoiLootItems,
  buildPoiNpcActorData,
  buildNpcStartingInventoryItems,
  getWorldContentOptionData,
  makeSettlementEvent,
  makeSettlementRumor,
  appendSettlementHistory,
  getContextualMerchantStock,
  WORLD_CONTENT_POI_THEMES,
  WORLD_CONTENT_POI_TYPES,
  generateQuestForSettlement,
} from "./services/world-content-service.mjs";
import {
  DEFAULT_REGIONS,
  WORLD_MAP_LEVELS,
} from "./constants/world-map.mjs";
import { buildWorldMapEncounterKit } from "./services/world-map-encounter-kit-service.mjs";
import { buildWorldMapSituation, getWorldMapSituationPoolStats } from "./services/world-map-situation-generator-service.mjs";
import {
  buildWorldMapScenePrepChatBody,
  buildWorldMapScenePrepPacket,
  buildWorldMapSceneStagingChatBody,
  materializeWorldMapSceneStaging,
  persistWorldMapScenePrepPacket,
} from "./services/world-map-scene-prep-service.mjs";

const REGION_CRISES = [
  {
    id: "bandit-surge",
    label: "Всплеск бандитизма",
    effects: { danger: 2, supply: -1, prosperity: -1, traffic: -1, trade: -1 }
  },
  {
    id: "blight",
    label: "Порча урожая",
    effects: { danger: 0, supply: -2, prosperity: -1, traffic: 0, trade: -1 }
  },
  {
    id: "merchant-boom",
    label: "Торговый бум",
    effects: { danger: -1, supply: 2, prosperity: 2, traffic: 2, trade: 2 }
  },
  {
    id: "militia-order",
    label: "Военный порядок",
    effects: { danger: -2, supply: 0, prosperity: 0, traffic: 1, trade: 0 }
  },
  {
    id: "migrant-wave",
    label: "Поток переселенцев",
    effects: { danger: 0, supply: -1, prosperity: 1, traffic: 1, trade: 1 }
  },
  {
    id: "road-damage",
    label: "Разрушенные дороги",
    effects: { danger: 1, supply: -1, prosperity: -1, traffic: -2, trade: -1 }
  }
];

const POI_TYPES = WORLD_CONTENT_POI_TYPES;

import {
  getSettlements,
  getMerchants,
  getFactions,
  getPois,
  getQuests,
  findFactionByName,
  findSettlementByName,
} from "./utils/world-helpers.mjs";
import {
  buildCombatChatCard,
  buildCombatParagraphs,
  buildSystemDialogContent,
  buildSystemDialogForm,
  buildSystemDialogInput,
  escapeCombatHtml,
} from "./services/combat-chat-service.mjs";
import {
  AOE_FRIENDLY_FIRE_MODE_KEYS,
  AOE_SHAPE_KEYS,
  AOE_TARGET_ZONE_MODE_KEYS,
  AOE_TARGETABLE_BODY_ZONE_KEYS,
  AOE_TYPE_KEYS,
  BODY_ZONE_KEYS,
  buildAoeTargetZonePolicy,
  normalizeAoeFriendlyFireMode,
  normalizeAoeShape,
  normalizeAoeTargetZoneMode,
  normalizeAoeType,
} from "./services/aoe-policy-service.mjs";
import {
  BODY_TRAUMA_PART_KEYS,
} from "./services/body-trauma-service.mjs";
import {
  getArmorSlotForLocation,
  getHitLabel,
  getHitLocation,
  getShieldInterceptChance,
  resolveDamageHpKey,
  syncDerivedConditionsFromTrauma,
} from "./services/actor-state-service.mjs";
import {
  buildReleaseQaSnapshot,
  formatReleaseQaReport,
} from "./services/release-qa-service.mjs";
import {
  buildContentArtCockpitReport,
  formatContentArtCockpitReport,
} from "./services/content-art-cockpit-service.mjs";
import {
  buildSessionReadinessReport,
  formatSessionReadinessReport,
} from "./services/session-readiness-service.mjs";
import {
  NPC_EXACT_TIER_PREVIEW_ACTORS,
  NPC_SPECIALIZATIONS,
} from "./constants/npc-profiles.mjs";
import {
  MONSTER_BESTIARY,
} from "./constants/monster-bestiary.mjs";
import {
  monsterRowToActorData,
} from "./services/wilderness-service.mjs";
import {
  addOrExtendActorCondition,
  applyActorConditionTick,
  applyActorFullRest,
  applyActorShortRest,
  refreshActorBodyTraumaStatus,
  markActorDead,
  reviveActor,
} from "./services/condition-service.mjs";
import {
  getActiveConditionEntries,
  getConditionDefaultMode,
  getConditionDefaultValueKind,
  getConditionLabel,
  getConditionStorageKey,
} from "./services/condition-policy-service.mjs";
import {
  getCombatParticipantByActor,
  getCombatState,
  isCombatActive,
  startCombat,
  syncCombatParticipantsWithActors,
  updateParticipant,
} from "./services/combat-flow-service.mjs";
import { resolveCombatTimeCostForActor } from "./services/actor-combat-sheet-service.mjs";
import { performActorAttack } from "./services/attack-flow-service.mjs";
import { castSpellLikeItem } from "./services/spell-casting-service.mjs";
import { applyDamageToBodyPart } from "./services/combat-attack-service.mjs";
import { healActorBodyPart } from "./services/hit-effect-service.mjs";

const SYSTEM_ID = "iron-hills-system";
const RELEASE_QA_SETTING = "releaseQaState";
const RELEASE_QA_HISTORY_LIMIT = 12;
const GM_SITUATION_SETTING = "gmSituationState";
const GM_SITUATION_HISTORY_LIMIT = 32;
const FIRST_SESSION_TARGET_REGION = "Iron Hills";
const COMBAT_DRY_RUN_SMOKE_OPTIONS = Object.freeze({
  includeAssets: false,
  includeGeneratedSources: false,
  includePacks: false,
  includeWorld: false,
  includeInventory: true,
  includeTrade: false,
  includeCombat: true,
  includePrepared: true,
  includeMedicine: true,
  includeLifecycle: true,
  maxFindings: 40,
});
const COMBAT_DRY_RUN_SECTION_IDS = Object.freeze([
  "environment",
  "inventory",
  "combat",
  "prepared",
  "medicine",
  "lifecycle",
]);
const SITUATION_COCKPIT_LEVEL_OPTIONS = Object.freeze([
  { id: "global", label: "Global atlas" },
  { id: "region", label: "Region travel" },
  { id: "local", label: "City / locality" },
  { id: "encounter", label: "Encounter field" },
  { id: "building", label: "Building / room" },
]);
const SITUATION_COCKPIT_TERRAIN_OPTIONS = Object.freeze([
  { id: "road", label: "Road" },
  { id: "town", label: "Town" },
  { id: "village", label: "Village" },
  { id: "forest", label: "Forest" },
  { id: "plains", label: "Plains / field" },
  { id: "hills", label: "Hills" },
  { id: "mine", label: "Mine" },
  { id: "dungeon", label: "Dungeon" },
  { id: "ruins", label: "Ruins" },
  { id: "swamp", label: "Swamp" },
  { id: "river", label: "River" },
  { id: "pass", label: "Mountain pass" },
  { id: "mountains", label: "Mountains" },
]);
const SITUATION_COCKPIT_KIND_OPTIONS = Object.freeze([
  { id: "encounter", label: "Combat encounter" },
  { id: "danger", label: "Danger / hazard" },
  { id: "social", label: "Social scene" },
  { id: "trade", label: "Trade / market" },
  { id: "craft", label: "Craft / repair" },
  { id: "loot", label: "Loot / cache" },
  { id: "npc", label: "NPC hook" },
  { id: "transition", label: "Travel transition" },
]);
const SITUATION_COCKPIT_TIER_OPTIONS = Object.freeze(Array.from({ length: 10 }, (_, index) => {
  const tier = index + 1;
  return { id: String(tier), label: `Tier ${tier}` };
}));
const SITUATION_COCKPIT_REROLL_MODE_OPTIONS = Object.freeze([
  { id: "fresh", label: "Fresh intro" },
  { id: "refresh", label: "Refresh resolved" },
]);
const SITUATION_SCENE_KIT_STAGE_OPTIONS = Object.freeze([
  {
    id: "story",
    label: "Story",
    summary: "Scene title, hook, quest seeds, rumors and consequences.",
  },
  {
    id: "scene",
    label: "Scene",
    summary: "Map candidate, entry/exit, blueprint anchors and hotspots.",
  },
  {
    id: "actors",
    label: "Actors",
    summary: "Monsters, NPC prompts and placement notes.",
  },
  {
    id: "loot",
    label: "Loot",
    summary: "Loot, clues, rewards, skill checks and twists.",
  },
]);
const SITUATION_SCENE_KIT_FOLDER_TYPES = Object.freeze([
  { id: "journal", documentType: "JournalEntry", label: "Journal" },
  { id: "scene", documentType: "Scene", label: "Scenes" },
  { id: "actor", documentType: "Actor", label: "Actors" },
]);
const SITUATION_SCENE_RUNBOOK_PAGE_NAME = "Scene Prep Runbook";
const SITUATION_SCENE_PREP_PAGE_FLAG = "worldMapScenePrepPage";
const SITUATION_SCENE_NOTE_MARKER_KINDS = Object.freeze([
  "entry",
  "exit",
  "transition",
  "loot",
  "cache",
  "clue",
  "quest",
  "skill",
  "npc",
  "monster",
  "danger",
  "hazard",
  "cover",
]);
const SITUATION_SCENE_NOTE_ICONS = Object.freeze({
  entry: "icons/svg/door.svg",
  exit: "icons/svg/door.svg",
  transition: "icons/svg/door.svg",
  loot: "icons/svg/chest.svg",
  cache: "icons/svg/chest.svg",
  clue: "icons/svg/book.svg",
  quest: "icons/svg/book.svg",
  skill: "icons/svg/d20-highlight.svg",
  npc: "icons/svg/mystery-man.svg",
  monster: "icons/svg/skull.svg",
  danger: "icons/svg/hazard.svg",
  hazard: "icons/svg/hazard.svg",
  cover: "icons/svg/shield.svg",
});
const SITUATION_STATUS_OPTIONS = Object.freeze([
  { id: "active", label: "Active", tone: "is-active" },
  { id: "resolved", label: "Resolved", tone: "is-safe" },
  { id: "failed", label: "Failed", tone: "is-danger" },
  { id: "ignored", label: "Ignored", tone: "is-warn" },
]);
const SITUATION_COCKPIT_DEFAULTS = Object.freeze({
  level: "encounter",
  terrain: "forest",
  kind: "encounter",
  tier: 2,
  label: "",
  rerollMode: "fresh",
  seedInput: "",
  seed: "",
});
const SITUATION_COCKPIT_ROLE_BY_KIND = Object.freeze({
  craft: "crafter",
  danger: "bandit",
  encounter: "bandit",
  loot: "villager",
  npc: "villager",
  social: "villager",
  trade: "merchant",
  transition: "guard",
});
const GM_CONTROL_SCOPES = Object.freeze([
  {
    id: "selected",
    label: "Выделенные токены",
    hint: "Безопасный режим: работает только с выбранными токенами сцены.",
  },
  {
    id: "targets",
    label: "Цели GM",
    hint: "Актёры токенов, выбранных как targets текущим GM.",
  },
  {
    id: "selected-targets",
    label: "Выделенные + цели",
    hint: "Удобно для восстановления группы и проверки удара по нескольким целям.",
  },
  {
    id: "combat",
    label: "Активный бой",
    hint: "Все участники текущего Iron Hills combat state.",
  },
  {
    id: "bench",
    label: "Combat test bench",
    hint: "Все актёры IH Combat Test Bench, если слой создан.",
  },
]);
const GM_CONTROL_TIME_PRESETS = Object.freeze([
  { id: "six-seconds", label: "6 секунд", seconds: 6 },
  { id: "one-minute", label: "1 минута", seconds: 60 },
  { id: "ten-minutes", label: "10 минут", seconds: 600 },
  { id: "one-hour", label: "1 час", seconds: 3600 },
  { id: "eight-hours", label: "8 часов", seconds: 28800 },
  { id: "one-day", label: "1 день", seconds: 86400 },
  { id: "one-week", label: "1 неделя", seconds: 604800 },
]);
const GM_CONTROL_CONDITION_PRESETS = Object.freeze([
  { key: "bleeding", label: "Кровотечение", value: 1 },
  { key: "poison", label: "Яд", value: 1 },
  { key: "burning", label: "Горение", value: 1 },
  { key: "shock", label: "Шок", value: 5 },
  { key: "stunned", label: "Оглушение", value: 6 },
  { key: "unconscious", label: "Без сознания", value: 6 },
  { key: "hasted", label: "Ускорение", value: 6 },
  { key: "slowed", label: "Замедление", value: 6 },
  { key: "feared", label: "Страх", value: 6 },
  { key: "exposed", label: "Уязвимость", value: 6 },
  { key: "prone", label: "Повален", value: 6 },
  { key: "grappled", label: "Захват", value: 6 },
  { key: "sleeping", label: "Сон", value: 6 },
  { key: "disarmed", label: "Разоружение", value: 6 },
  { key: "shield_lost", label: "Без щита", value: 6 },
  { key: "armor_cracked", label: "Броня треснула", value: 6 },
  { key: "broken_limb", label: "Перелом", value: 6 },
  { key: "aimed_shot_bonus", label: "Прицел", value: 1 },
  { key: "formation_stance", label: "Строй", value: 6 },
  { key: "shield_wall_formation", label: "Стена щитов", value: 6 },
  { key: "riposte_ready", label: "Рипост готов", value: 6 },
  { key: "counter_ready", label: "Контрудар", value: 6 },
  { key: "intercept_ready", label: "Перехват", value: 6 },
  { key: "rapid_reload", label: "Быстрая перезарядка", value: 1 },
]);
const GM_CONTROL_CLEAR_CONDITION_KEYS = Object.freeze([
  "bleeding",
  "poison",
  "burning",
  "shock",
  "stunned",
  "unconscious",
  "silencedUntil",
  "slowPenalty",
  "feared",
  "fleeing",
  "hasted",
  "slowed",
  "exposed",
  "pushed",
  "prone",
  "grappled",
  "sleeping",
  "disarmed",
  "shield_lost",
  "armor_cracked",
  "broken_limb",
  "aimed_shot_bonus",
  "formation_stance",
  "shield_wall_formation",
  "riposte_ready",
  "counter_ready",
  "intercept_ready",
  "rapid_reload",
]);
const GM_CONTROL_RESOURCE_PRESETS = Object.freeze([
  { key: "all-vitals", label: "All vitals", defaultMode: "full", defaultValue: 0 },
  { key: "hp", label: "HP / body HP", defaultMode: "full", defaultValue: 10 },
  { key: "energy", label: "Energy", defaultMode: "full", defaultValue: 10 },
  { key: "mana", label: "Mana", defaultMode: "full", defaultValue: 10 },
  { key: "satiety", label: "Satiety", defaultMode: "full", defaultValue: 10 },
  { key: "hydration", label: "Hydration", defaultMode: "full", defaultValue: 10 },
  { key: "soul-energy", label: "Soul energy reserve", defaultMode: "full", defaultValue: 1 },
  { key: "soul-mana", label: "Soul mana reserve", defaultMode: "full", defaultValue: 1 },
  { key: "durability", label: "Gear durability", defaultMode: "full", defaultValue: 10 },
  { key: "seconds", label: "Combat seconds", defaultMode: "full", defaultValue: 6 },
]);
const GM_CONTROL_RESOURCE_MODES = Object.freeze([
  { id: "full", label: "Full / max" },
  { id: "zero", label: "Zero" },
  { id: "set", label: "Set value" },
  { id: "add", label: "+ value" },
  { id: "sub", label: "- value" },
]);
const GM_CONTROL_BODY_PARTS = Object.freeze([
  { key: "head", label: "Head" },
  { key: "torso", label: "Torso" },
  { key: "abdomen", label: "Abdomen" },
  { key: "leftArm", label: "Left arm" },
  { key: "rightArm", label: "Right arm" },
  { key: "leftLeg", label: "Left leg" },
  { key: "rightLeg", label: "Right leg" },
]);
const GM_CONTROL_TARGET_ZONE_MODES = Object.freeze([
  { id: "", label: "Item default" },
  { id: "random", label: "Random zone" },
  { id: "fixed", label: "Fixed zone" },
  { id: "aimed", label: "Aimed zone" },
]);
const GM_CONTROL_FRIENDLY_FIRE_MODES = Object.freeze([
  { id: "", label: "Item default" },
  { id: "off", label: "Friendly fire off" },
  { id: "on", label: "Friendly fire on" },
  { id: "auto", label: "Friendly fire auto" },
]);
const COMBAT_TEST_BENCH_SCENE_ID = "combat-test-bench";
const COMBAT_TEST_BENCH_SCENE_NAME = "IH Combat Test Bench";
const COMBAT_TEST_BENCH_SKILL_KEYS = Object.freeze([
  "athletics",
  "acrobatics",
  "endurance",
  "sword",
  "axe",
  "spear",
  "blunt",
  "knife",
  "unarmed",
  "throwing",
  "bow",
  "crossbow",
  "shield",
  "medicine",
  "perception",
  "survival",
  "fire",
  "ice",
  "lightning",
  "shadow",
  "light",
  "earth",
  "mind",
  "summon",
]);
const COMBAT_TEST_BENCH_ITEMS = Object.freeze({
  sword50: Object.freeze({
    id: "sword50",
    name: "IH Test Sword 50",
    type: "weapon",
    img: "systems/iron-hills-system/icons/items/weapons/iron_sword.webp",
    system: Object.freeze({
      tier: 1,
      quality: "test",
      weight: 2,
      quantity: 1,
      damage: 50,
      damageType: "physical",
      skill: "sword",
      twoHanded: false,
      energyCost: 2,
      range: 1,
      durability: { value: 100, max: 100 },
      actionSeconds: 3,
      gridW: 1,
      gridH: 3,
      timeCost: 2,
      identified: true,
    }),
  }),
  crossbow35: Object.freeze({
    id: "crossbow35",
    name: "IH Test Crossbow 35",
    type: "weapon",
    img: "systems/iron-hills-system/icons/items/weapons/iron_crossbow.webp",
    system: Object.freeze({
      tier: 1,
      quality: "test",
      weight: 4,
      quantity: 1,
      damage: 35,
      damageType: "physical",
      skill: "crossbow",
      twoHanded: true,
      energyCost: 3,
      range: 12,
      durability: { value: 100, max: 100 },
      actionSeconds: 4,
      gridW: 2,
      gridH: 3,
      timeCost: 4,
      identified: true,
    }),
  }),
  armor25Full: Object.freeze({
    id: "armor25Full",
    name: "IH Test Armor 25/100",
    type: "armor",
    img: "systems/iron-hills-system/icons/items/armor/chainmail.webp",
    system: Object.freeze({
      tier: 1,
      quality: "test",
      weight: 8,
      quantity: 1,
      slot: "torso",
      armorClass: "medium",
      armorClassLabel: "Medium",
      protection: { physical: 25, magical: 0 },
      requirements: { endurance: 1, athletics: 1 },
      requirementsLabel: "Endurance 1 / Athletics 1",
      penalties: {
        attackPenaltyPerEndurance: 0,
        attackPenaltyPerAthletics: 0,
        actionSecondsPerEndurance: 0,
        actionSecondsPerAthletics: 0,
        movementPenaltyPerEndurance: 0,
        movementPenaltyPerAthletics: 0,
        energyMultPerEndurance: 0,
        energyMultPerAthletics: 0,
      },
      durability: { value: 100, max: 100 },
      gridW: 2,
      gridH: 3,
      resist: 25,
      covers: ["torso", "abdomen"],
      layer: "outer",
      identified: true,
    }),
  }),
  armor25Low: Object.freeze({
    id: "armor25Low",
    name: "IH Test Armor 25/10",
    type: "armor",
    img: "systems/iron-hills-system/icons/items/armor/chainmail.webp",
    system: Object.freeze({
      tier: 1,
      quality: "test",
      weight: 8,
      quantity: 1,
      slot: "torso",
      armorClass: "medium",
      armorClassLabel: "Medium",
      protection: { physical: 25, magical: 0 },
      requirements: { endurance: 1, athletics: 1 },
      requirementsLabel: "Endurance 1 / Athletics 1",
      penalties: {
        attackPenaltyPerEndurance: 0,
        attackPenaltyPerAthletics: 0,
        actionSecondsPerEndurance: 0,
        actionSecondsPerAthletics: 0,
        movementPenaltyPerEndurance: 0,
        movementPenaltyPerAthletics: 0,
        energyMultPerEndurance: 0,
        energyMultPerAthletics: 0,
      },
      durability: { value: 10, max: 100 },
      gridW: 2,
      gridH: 3,
      resist: 25,
      covers: ["torso", "abdomen"],
      layer: "outer",
      identified: true,
    }),
  }),
  shield15: Object.freeze({
    id: "shield15",
    name: "IH Test Shield 15/50",
    type: "armor",
    img: "systems/iron-hills-system/icons/items/armor/wooden_shield.webp",
    system: Object.freeze({
      tier: 1,
      quality: "test",
      weight: 5,
      quantity: 1,
      slot: "leftHand",
      armorClass: "medium",
      armorClassLabel: "Medium shield",
      isShield: true,
      protection: { physical: 15, magical: 0 },
      requirements: { endurance: 1, athletics: 1 },
      requirementsLabel: "Endurance 1 / Athletics 1",
      penalties: {
        attackPenaltyPerEndurance: 0,
        attackPenaltyPerAthletics: 0,
        actionSecondsPerEndurance: 0,
        actionSecondsPerAthletics: 0,
        movementPenaltyPerEndurance: 0,
        movementPenaltyPerAthletics: 0,
        energyMultPerEndurance: 0,
        energyMultPerAthletics: 0,
      },
      durability: { value: 50, max: 50 },
      gridW: 2,
      gridH: 3,
      resist: 15,
      covers: ["shield"],
      layer: "held",
      identified: true,
    }),
  }),
  armor15Light: Object.freeze({
    id: "armor15Light",
    name: "IH Test Light Armor 15/45",
    type: "armor",
    img: "systems/iron-hills-system/icons/items/armor/leather_jacket.webp",
    system: Object.freeze({
      tier: 1,
      quality: "test",
      weight: 3,
      quantity: 1,
      slot: "torso",
      armorClass: "light",
      armorClassLabel: "Light",
      protection: { physical: 15, magical: 0 },
      requirements: { endurance: 0, athletics: 0 },
      requirementsLabel: "No penalty baseline",
      penalties: {
        attackPenaltyPerEndurance: 0,
        attackPenaltyPerAthletics: 0,
        actionSecondsPerEndurance: 0,
        actionSecondsPerAthletics: 0,
        movementPenaltyPerEndurance: 0,
        movementPenaltyPerAthletics: 0,
        energyMultPerEndurance: 0,
        energyMultPerAthletics: 0,
      },
      durability: { value: 45, max: 45 },
      gridW: 2,
      gridH: 2,
      resist: 15,
      covers: ["torso", "abdomen"],
      layer: "outer",
      identified: true,
    }),
  }),
  fireBurst: Object.freeze({
    id: "fireBurst",
    name: "IH Test Fire Burst AoE",
    type: "spell",
    img: "systems/iron-hills-system/icons/items/spells/fireball.webp",
    system: Object.freeze({
      spellId: "ih-test-fire-burst",
      school: "fire",
      rank: 2,
      manaCost: 5,
      energyCost: 2,
      castTime: 3,
      damage: 30,
      damageType: "fire",
      power: 2,
      effectType: "damage",
      actionType: "attack",
      applicationScope: "aoe",
      targetActorMode: "selected",
      targetPart: "",
      targetZone: "",
      friendlyFire: true,
      friendlyFireMode: "auto",
      aoe: {
        type: "blast",
        shape: "circle",
        distance: 3,
        maxTargets: 4,
        chainDecay: 1,
        targetZoneMode: "random",
        friendlyFireMode: "auto",
      },
      gridW: 1,
      gridH: 1,
      identified: true,
    }),
  }),
  earthAbdomenSpike: Object.freeze({
    id: "earthAbdomenSpike",
    name: "IH Test Earth Spike Abdomen",
    type: "spell",
    img: "systems/iron-hills-system/icons/items/spells/tectonic_spear.webp",
    system: Object.freeze({
      spellId: "ih-test-earth-abdomen-spike",
      school: "earth",
      rank: 2,
      manaCost: 4,
      energyCost: 2,
      castTime: 3,
      damage: 24,
      damageType: "physical",
      power: 2,
      effectType: "damage",
      actionType: "attack",
      applicationScope: "targeted",
      targetActorMode: "selected",
      targetPart: "abdomen",
      targetZone: "abdomen",
      friendlyFire: false,
      friendlyFireMode: "off",
      aoe: {
        type: "blast",
        shape: "ray",
        distance: 5,
        maxTargets: 1,
        chainDecay: 1,
        targetZoneMode: "fixed",
        friendlyFireMode: "off",
      },
      gridW: 1,
      gridH: 1,
      identified: true,
    }),
  }),
  fieldBandage: Object.freeze({
    id: "fieldBandage",
    name: "IH Test Field Bandage",
    type: "consumable",
    img: "systems/iron-hills-system/icons/items/materials/herb_healing.webp",
    system: Object.freeze({
      tier: 1,
      quality: "test",
      weight: 0.1,
      quantity: 3,
      power: 10,
      effect: "stabilize",
      effectType: "heal",
      actionType: "medicine",
      applicationScope: "targeted",
      targetActorMode: "selected-or-self",
      targetPart: "abdomen",
      conditionKey: "bleeding",
      conditionMode: "reduce",
      conditionValueKind: "flat",
      duration: 0,
      gridW: 1,
      gridH: 1,
      identified: true,
    }),
  }),
});
const COMBAT_TEST_BENCH_ACTORS = Object.freeze([
  Object.freeze({
    id: "attacker",
    name: "IH Test Attacker",
    roleLabel: "attacker",
    type: "character",
    disposition: 1,
    x: 400,
    y: 600,
    img: "icons/svg/mystery-man.svg",
    items: ["sword50", "crossbow35", "fireBurst", "earthAbdomenSpike", "fieldBandage"],
    equipment: { rightHand: "sword50" },
    quickSlots: { slot1: "sword50", slot2: "crossbow35", slot3: "fireBurst", slot4: "earthAbdomenSpike", slot5: "fieldBandage" },
    skills: { sword: 10, crossbow: 8, fire: 8, earth: 8, shield: 3, athletics: 8, endurance: 8, medicine: 5, perception: 6 },
    defense: 6,
    energy: { value: 60, max: 60, baseMax: 60 },
    mana: { value: 40, max: 40, baseMax: 40 },
  }),
  Object.freeze({
    id: "armor-full",
    name: "IH Test Armor 25/100",
    roleLabel: "armor full durability target",
    type: "character",
    disposition: -1,
    x: 900,
    y: 420,
    img: "icons/svg/mystery-man.svg",
    items: ["armor25Full"],
    equipment: { torso: "armor25Full" },
    skills: { athletics: 4, endurance: 4, shield: 0 },
    defense: 4,
  }),
  Object.freeze({
    id: "armor-low",
    name: "IH Test Armor 25/10",
    roleLabel: "low durability armor target",
    type: "character",
    disposition: -1,
    x: 900,
    y: 760,
    img: "icons/svg/mystery-man.svg",
    items: ["armor25Low"],
    equipment: { torso: "armor25Low" },
    skills: { athletics: 4, endurance: 4, shield: 0 },
    defense: 4,
  }),
  Object.freeze({
    id: "shield-armor",
    name: "IH Test Shield + Armor",
    roleLabel: "shield then armor target",
    type: "character",
    disposition: -1,
    x: 1240,
    y: 600,
    img: "icons/svg/mystery-man.svg",
    items: ["shield15", "armor25Full"],
    equipment: { leftHand: "shield15", torso: "armor25Full" },
    skills: { athletics: 6, endurance: 6, shield: 9 },
    defense: 7,
  }),
  Object.freeze({
    id: "aoe-enemy-a",
    name: "IH Test AoE Enemy A",
    roleLabel: "aoe hostile no armor",
    type: "character",
    disposition: -1,
    x: 1540,
    y: 460,
    img: "icons/svg/mystery-man.svg",
    items: [],
    equipment: {},
    skills: { athletics: 3, endurance: 3, perception: 3 },
    defense: 3,
  }),
  Object.freeze({
    id: "aoe-enemy-b",
    name: "IH Test AoE Enemy B",
    roleLabel: "aoe hostile light armor",
    type: "character",
    disposition: -1,
    x: 1680,
    y: 700,
    img: "icons/svg/mystery-man.svg",
    items: ["armor15Light"],
    equipment: { torso: "armor15Light" },
    skills: { athletics: 4, endurance: 4, perception: 3 },
    defense: 4,
  }),
  Object.freeze({
    id: "aoe-ally",
    name: "IH Test AoE Ally",
    roleLabel: "friendly fire control",
    type: "character",
    disposition: 1,
    x: 1440,
    y: 820,
    img: "icons/svg/mystery-man.svg",
    items: [],
    equipment: {},
    skills: { athletics: 5, endurance: 5, perception: 5 },
    defense: 5,
  }),
  Object.freeze({
    id: "medicine-target",
    name: "IH Test Medicine Abdomen",
    roleLabel: "abdomen trauma target",
    type: "character",
    disposition: 1,
    x: 620,
    y: 980,
    img: "icons/svg/mystery-man.svg",
    items: ["fieldBandage"],
    equipment: {},
    quickSlots: { slot1: "fieldBandage" },
    skills: { athletics: 3, endurance: 3, medicine: 2 },
    defense: 4,
    hpOverrides: {
      abdomen: { value: 35, max: 70, status: { minorBleeding: 1 } },
    },
    conditions: { bleeding: 1 },
    energy: { value: 35, max: 50, baseMax: 50 },
  }),
]);
const COMBAT_TEST_BENCH_SCENARIOS = Object.freeze([
  Object.freeze({
    id: "armor-full",
    label: "Armor 50 -> 25/100",
    actorId: "armor-full",
    expected: "IH Test Sword 50 hits torso: armor absorbs 25, loses 50 durability, torso takes 25.",
  }),
  Object.freeze({
    id: "armor-low",
    label: "Armor 50 -> 25/10",
    actorId: "armor-low",
    expected: "IH Test Sword 50 hits torso: armor absorbs only current durability 10, breaks, torso takes 40.",
  }),
  Object.freeze({
    id: "shield-then-armor",
    label: "Shield 15 then armor 25",
    actorId: "shield-armor",
    expected: "Shield absorbs 15 from 50, armor absorbs 25 from remaining 35, body takes 10.",
  }),
  Object.freeze({
    id: "aoe-friendly-fire",
    label: "AoE per target + friendly fire",
    actorId: "attacker",
    expected: "Fire Burst should roll hit/defense/body zone separately for two hostiles and one ally.",
  }),
  Object.freeze({
    id: "aimed-abdomen",
    label: "Aimed abdomen / medicine",
    actorId: "medicine-target",
    expected: "Earth Spike targets abdomen; Field Bandage gives a live medicine/healing target.",
  }),
]);
const FIRST_SESSION_CONTENT_BLUEPRINT = Object.freeze({
  region: FIRST_SESSION_TARGET_REGION,
  settlements: Object.freeze([
    {
      id: "rivergate",
      name: "Ривергейт",
      tier: 2,
      population: 520,
      prosperity: 6,
      danger: 3,
      supply: 6,
      controllingFaction: "Iron Hills",
      tags: "trade,river,hub,market",
      mapCol: 5,
      mapRow: 2,
      terrain: "town",
      sceneId: "local-ashford-village",
      rumors: Object.freeze([
        "Караваны из Ривергейта снова жалуются на пропажи у западной дороги.",
        "Стража ищет проводников, которые знают путь к Чёрному Бору.",
      ]),
      events: Object.freeze([
        "Ривергейт принимает первые караваны сезона и просит отчётов о дороге.",
      ]),
    },
    {
      id: "ashford",
      name: "Эшфорд",
      tier: 1,
      population: 170,
      prosperity: 4,
      danger: 3,
      supply: 5,
      controllingFaction: "Iron Hills",
      tags: "village,forest,starter,healer",
      mapCol: 2,
      mapRow: 5,
      terrain: "village",
      sceneId: "local-ashford-village",
      rumors: Object.freeze([
        "В Эшфорде говорят, что ночью из Чёрного Бора доносится металлический скрежет.",
        "Знахарка Мира платит за травы, которые растут только у старой сторожевой башни.",
      ]),
      events: Object.freeze([
        "Эшфорд стал безопасным стартовым узлом для первой проверки региона.",
      ]),
    },
    {
      id: "koperny-peak",
      name: "Копёрный Пик",
      tier: 2,
      population: 310,
      prosperity: 5,
      danger: 4,
      supply: 5,
      controllingFaction: "Miners Guild",
      tags: "mine,smiths,ore,repair",
      mapCol: 7,
      mapRow: 4,
      terrain: "town",
      sceneId: "local-mining-settlement",
      rumors: Object.freeze([
        "Глубокий Пласт молчит третий день, но в шахтёрской лавке всё ещё слышны удары снизу.",
        "Кузнец Бран скупает бронзовые слитки и обещает скидку за сведения о пропавшей смене.",
      ]),
      events: Object.freeze([
        "Копёрный Пик держит шахтёрский крючок для ремонта, брони и подземной угрозы.",
      ]),
    },
  ]),
  pois: Object.freeze([
    {
      id: "watchtower",
      name: "Сторожевая башня",
      poiType: "tower",
      tier: 1,
      nearestSettlement: "Ривергейт",
      faction: "iron-hills",
      theme: "watchpost",
      danger: 2,
      status: "abandoned",
      discoveryDC: 6,
      distance: "полдня",
      mapCol: 3,
      mapRow: 2,
      sceneId: "encounter-watchtower",
    },
    {
      id: "black-bor",
      name: "Чёрный Бор",
      poiType: "lair",
      tier: 2,
      nearestSettlement: "Эшфорд",
      faction: "frontier",
      theme: "beast",
      danger: 3,
      status: "active",
      discoveryDC: 7,
      distance: "несколько часов",
      mapCol: 2,
      mapRow: 4,
      sceneId: "encounter-forest-clearing",
    },
    {
      id: "deep-seam",
      name: "Глубокий Пласт",
      poiType: "cave",
      tier: 3,
      nearestSettlement: "Копёрный Пик",
      faction: "miners-guild",
      theme: "forgotten",
      danger: 4,
      status: "dangerous",
      discoveryDC: 8,
      distance: "несколько часов",
      mapCol: 4,
      mapRow: 4,
      sceneId: "encounter-mine-gallery",
    },
    {
      id: "western-road",
      name: "Западная дорога",
      poiType: "road",
      tier: 2,
      nearestSettlement: "Эшфорд",
      faction: "outlaws",
      theme: "watchpost",
      danger: 4,
      status: "blocked",
      discoveryDC: 6,
      distance: "несколько часов",
      mapCol: 4,
      mapRow: 3,
      sceneId: "encounter-road-ambush",
    },
    {
      id: "serpent-caves",
      name: "Змеиные Пещеры",
      poiType: "cave",
      tier: 3,
      nearestSettlement: "Копёрный Пик",
      faction: "beasts",
      theme: "beast",
      danger: 5,
      status: "hidden",
      discoveryDC: 9,
      distance: "1 день",
      mapCol: 8,
      mapRow: 5,
      sceneId: "encounter-serpent-caves",
    },
  ]),
  merchants: Object.freeze([
    {
      id: "rivergate-general",
      name: "Общая лавка Елиса Холмского",
      specialty: "general",
      tier: 2,
      settlement: "Ривергейт",
      economy: "normal",
      faction: "rivergate",
    },
    {
      id: "koperny-smith",
      name: "Копёрный кузнец Бран Тяжёлый",
      specialty: "weaponsmith",
      tier: 2,
      settlement: "Копёрный Пик",
      economy: "normal",
      faction: "miners-guild",
    },
    {
      id: "ashford-healer",
      name: "Эшфордская знахарка Мира",
      specialty: "alchemist",
      tier: 1,
      settlement: "Эшфорд",
      economy: "normal",
      faction: "ashford",
    },
  ]),
  quests: Object.freeze([
    {
      id: "first-road-ambush",
      name: "Дорога в Железные Холмы",
      questType: "exploration",
      issuer: "Ривергейтская стража",
      targetSettlement: "Ривергейт",
      targetPOI: "Западная дорога",
      difficulty: 2,
      reward: "15 серебра, право торговли у караванщиков",
      silver: 15,
      settlementRep: 1,
      summary: "Проверить западную дорогу и выяснить, почему караваны стали приходить с потерями.",
      objective: "Добраться до западной дороги, найти источник угрозы и вернуться с отчётом.",
      notes: "Хороший первый тест карты, торговли, pending inventory и базового боя.",
      success: Object.freeze({ danger: -1, caravanTraffic: 1, tradeBalance: 1 }),
      failure: Object.freeze({ danger: 1, caravanTraffic: -1 }),
    },
    {
      id: "first-black-bor",
      name: "Следы в Чёрном Бору",
      questType: "combat",
      issuer: "Эшфордский проводник",
      targetSettlement: "Эшфорд",
      targetPOI: "Чёрный Бор",
      difficulty: 3,
      reward: "20 серебра, травы и лесной лут",
      silver: 20,
      settlementRep: 1,
      summary: "Жители Эшфорда слышат ночью странный скрежет в лесу.",
      objective: "Найти следы в Чёрном Бору, пережить контакт и собрать полезный лут.",
      notes: "Проверяет wilderness-сцену, монстров, лечение и перенос добычи в Tarkov-инвентарь.",
      success: Object.freeze({ danger: -1, supply: 1 }),
      failure: Object.freeze({ danger: 1, empowerTargetPOI: true }),
    },
    {
      id: "first-deep-seam",
      name: "Глубокий Пласт молчит",
      questType: "world",
      issuer: "Копёрный кузнец Бран",
      targetSettlement: "Копёрный Пик",
      targetPOI: "Глубокий Пласт",
      difficulty: 4,
      reward: "30 серебра, скидка на ремонт и броню",
      silver: 30,
      settlementRep: 2,
      summary: "Шахтёрская смена не вернулась, а из штрека тянет холодом и пылью.",
      objective: "Оценить угрозу в Глубоком Пласте и решить, можно ли отправлять спасателей.",
      notes: "Эскалационный крючок: можно отложить до готовности группы к подземелью.",
      success: Object.freeze({ supply: 1, stability: 1, tradeBalance: 1 }),
      failure: Object.freeze({ danger: 1, supply: -1, empowerTargetPOI: true }),
    },
  ]),
});

function todayStamp() {
  return new Date().toLocaleString("ru-RU");
}

function plainClone(value) {
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  if (globalThis.foundry?.utils?.duplicate) return foundry.utils.duplicate(value);
  return JSON.parse(JSON.stringify(value ?? null));
}

function numeric(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function compactTone(status = "todo") {
  if (status === "ok") return "is-good";
  if (status === "warn" || status === "planned") return "is-warn";
  if (status === "block" || status === "failed") return "is-danger";
  return "is-todo";
}

function normalizeReleaseQaState(raw = {}) {
  const state = raw && typeof raw === "object" ? raw : {};
  const manualDone = Array.isArray(state.manualDone) ? state.manualDone.map(String).filter(Boolean) : [];
  const rawManualStatuses = state.manualStatuses && typeof state.manualStatuses === "object" ? state.manualStatuses : {};
  const manualStatuses = { ...rawManualStatuses };
  for (const id of manualDone) {
    if (!manualStatuses[id]) manualStatuses[id] = "pass";
  }
  const history = Array.isArray(state.history) ? state.history.slice(0, RELEASE_QA_HISTORY_LIMIT) : [];
  return {
    contentReport: state.contentReport ?? null,
    runtimeReport: state.runtimeReport ?? null,
    artCockpitReport: state.artCockpitReport ?? null,
    sessionReadinessReport: state.sessionReadinessReport ?? null,
    packPlanReport: state.packPlanReport ?? state.packPlan ?? null,
    pipelineReport: state.pipelineReport ?? null,
    combatDryRunReport: state.combatDryRunReport ?? null,
    manualDone,
    manualStatuses,
    history,
  };
}

function getReleaseQaState() {
  try {
    return normalizeReleaseQaState(game.settings.get(SYSTEM_ID, RELEASE_QA_SETTING) ?? {});
  } catch {
    return normalizeReleaseQaState();
  }
}

async function setReleaseQaState(patch = {}, historyEntry = null) {
  const current = getReleaseQaState();
  const next = normalizeReleaseQaState({
    ...current,
    ...patch,
  });
  if (historyEntry) {
    next.history = [
      {
        id: `${historyEntry.type ?? "check"}:${Date.now()}`,
        at: nowIso(),
        ...historyEntry,
        tone: historyEntry.tone ?? compactTone(historyEntry.status),
      },
      ...current.history,
    ].slice(0, RELEASE_QA_HISTORY_LIMIT);
  }
  await game.settings.set(SYSTEM_ID, RELEASE_QA_SETTING, next);
  return next;
}

function historyRows(state = null) {
  return (state?.history ?? []).map(entry => ({
    ...entry,
    timeLabel: entry.at ? new Date(entry.at).toLocaleString("ru-RU") : "",
    tone: entry.tone ?? compactTone(entry.status),
  }));
}

function compactContentReport(report = null) {
  if (!report) return null;
  return {
    ok: Boolean(report.ok),
    summary: plainClone(report.summary ?? {}),
    release: plainClone(report.release ?? null),
    packDryRun: plainClone(report.packDryRun ?? null),
    nextActions: Array.isArray(report.nextActions) ? report.nextActions.slice(0, 8) : [],
    generatedAt: nowIso(),
  };
}

function compactRuntimeReport(report = null) {
  if (!report) return null;
  return {
    ok: Boolean(report.ok),
    counts: plainClone(report.counts ?? {}),
    summary: plainClone(report.summary ?? {}),
    generatedAt: nowIso(),
  };
}

function compactRuntimeFinding(finding = null) {
  if (!finding) return null;
  return {
    severity: finding.severity ?? "info",
    code: finding.code ?? "",
    message: finding.message ?? "",
    path: finding.path ?? "",
    context: plainClone(finding.context ?? {}),
    details: plainClone(finding.details ?? {}),
  };
}

function compactRuntimeSection(section = null) {
  if (!section) return null;
  return {
    id: section.id ?? "",
    label: section.label ?? "",
    status: section.status ?? "unknown",
    ms: numeric(section.ms),
    counts: plainClone(section.counts ?? {}),
    summary: plainClone(section.summary ?? {}),
    findings: (Array.isArray(section.findings) ? section.findings : [])
      .slice(0, 12)
      .map(compactRuntimeFinding)
      .filter(Boolean),
  };
}

function compactCombatDryRunReport(report = null) {
  if (!report) return null;
  return {
    ok: Boolean(report.ok),
    generatedAt: report.generatedAt ?? nowIso(),
    counts: plainClone(report.counts ?? {}),
    summary: plainClone(report.summary ?? {}),
    options: plainClone(report.options ?? COMBAT_DRY_RUN_SMOKE_OPTIONS),
    sections: (Array.isArray(report.sections) ? report.sections : [])
      .map(compactRuntimeSection)
      .filter(Boolean),
    findings: (Array.isArray(report.findings) ? report.findings : [])
      .slice(0, 40)
      .map(compactRuntimeFinding)
      .filter(Boolean),
  };
}

function compactArtCockpitReport(report = null) {
  if (!report) return null;
  return {
    ok: Boolean(report.ok),
    generatedAt: report.generatedAt ?? nowIso(),
    stage: report.stage ?? "",
    summary: plainClone(report.summary ?? {}),
    itemCatalogRows: (Array.isArray(report.itemCatalogRows) ? report.itemCatalogRows : []).map(row => plainClone(row)),
    itemPriorityRows: (Array.isArray(report.itemPriorityRows) ? report.itemPriorityRows : []).map(row => plainClone(row)),
    itemTierRows: (Array.isArray(report.itemTierRows) ? report.itemTierRows : []).map(row => plainClone(row)),
    actorTypeRows: (Array.isArray(report.actorTypeRows) ? report.actorTypeRows : []).map(row => plainClone(row)),
    actorTierRows: (Array.isArray(report.actorTierRows) ? report.actorTierRows : []).map(row => plainClone(row)),
    itemBacklogRows: (Array.isArray(report.itemBacklogRows) ? report.itemBacklogRows : []).slice(0, 40).map(row => plainClone(row)),
    actorBacklogRows: (Array.isArray(report.actorBacklogRows) ? report.actorBacklogRows : []).slice(0, 30).map(row => plainClone(row)),
  };
}

function compactSessionReadinessReport(report = null) {
  if (!report) return null;
  return {
    ok: Boolean(report.ok),
    generatedAt: report.generatedAt ?? nowIso(),
    stage: report.stage ?? "",
    summary: plainClone(report.summary ?? {}),
    maps: {
      summary: plainClone(report.maps?.summary ?? {}),
      levelRows: (Array.isArray(report.maps?.levelRows) ? report.maps.levelRows : []).map(row => plainClone(row)),
      archetypeRows: (Array.isArray(report.maps?.archetypeRows) ? report.maps.archetypeRows : []).map(row => plainClone(row)),
      poiRows: (Array.isArray(report.maps?.poiRows) ? report.maps.poiRows : []).map(row => plainClone(row)),
    },
    monsters: {
      summary: plainClone(report.monsters?.summary ?? {}),
      rows: (Array.isArray(report.monsters?.rows) ? report.monsters.rows : []).map(row => plainClone(row)),
      lootErrors: (Array.isArray(report.monsters?.lootErrors) ? report.monsters.lootErrors : []).slice(0, 30).map(row => plainClone(row)),
    },
    npcs: {
      summary: plainClone(report.npcs?.summary ?? {}),
      exactTierRows: (Array.isArray(report.npcs?.exactTierRows) ? report.npcs.exactTierRows : []).map(row => plainClone(row)),
      bandRows: (Array.isArray(report.npcs?.bandRows) ? report.npcs.bandRows : []).map(row => plainClone(row)),
    },
    generators: {
      summary: plainClone(report.generators?.summary ?? {}),
      byFamily: plainClone(report.generators?.byFamily ?? {}),
      rows: (Array.isArray(report.generators?.rows) ? report.generators.rows : []).map(row => plainClone(row)),
    },
    gm: {
      summary: plainClone(report.gm?.summary ?? {}),
      rows: (Array.isArray(report.gm?.rows) ? report.gm.rows : []).map(row => plainClone(row)),
    },
    nextActions: Array.isArray(report.nextActions) ? report.nextActions.slice(0, 8) : [],
  };
}

function compactPipelineReport(report = null) {
  if (!report) return null;
  return {
    ok: Boolean(report.ok),
    apply: Boolean(report.apply),
    summary: plainClone(report.summary ?? {}),
    nextActions: Array.isArray(report.nextActions) ? report.nextActions.slice(0, 8) : [],
    steps: (Array.isArray(report.steps) ? report.steps : []).map(step => ({
      id: step.id,
      label: step.label,
      status: step.status,
      mode: step.mode,
      mutates: Boolean(step.mutates),
      reason: step.reason ?? "",
      error: step.error ?? "",
      summary: plainClone(step.summary ?? {}),
    })),
    generatedAt: nowIso(),
  };
}

function summarizeContentStatus(report = null) {
  if (!report) return { status: "todo", label: "Content readiness", summary: "not run" };
  const blocking = numeric(report.summary?.blockingErrors);
  const warnings = numeric(report.summary?.warnings);
  const missing = numeric(report.summary?.missingSystemImages);
  if (!report.ok || blocking > 0) {
    return { status: "block", label: "Content readiness", summary: `${blocking} blockers, ${warnings} warnings` };
  }
  if (!report.release?.contentPatchReady || warnings > 0 || missing > 0) {
    return { status: "warn", label: "Content readiness", summary: `${report.release?.stageLabel ?? "review"}, ${warnings} warnings` };
  }
  return { status: "ok", label: "Content readiness", summary: "content sources are ready" };
}

function summarizeRuntimeStatus(report = null) {
  if (!report) return { status: "todo", label: "Runtime smoke", summary: "not run" };
  const errors = numeric(report.counts?.error);
  const warnings = numeric(report.counts?.warn);
  if (!report.ok || errors > 0) return { status: "block", label: "Runtime smoke", summary: `${errors} errors, ${warnings} warnings` };
  if (warnings > 0) return { status: "warn", label: "Runtime smoke", summary: `${warnings} warnings` };
  return { status: "ok", label: "Runtime smoke", summary: "runtime smoke is green" };
}

function summarizeCombatDryRunStatus(report = null) {
  if (!report) return { status: "todo", label: "Combat dry-run", summary: "not run" };
  const errors = numeric(report.counts?.error);
  const warnings = numeric(report.counts?.warn);
  const sections = Array.isArray(report.sections) ? report.sections.length : numeric(report.summary?.sections);
  if (!report.ok || errors > 0) return { status: "block", label: "Combat dry-run", summary: `${errors} errors, ${warnings} warnings, ${sections} sections` };
  if (warnings > 0) return { status: "warn", label: "Combat dry-run", summary: `${warnings} warnings, ${sections} sections` };
  return { status: "ok", label: "Combat dry-run", summary: `${sections} sections green` };
}

function summarizeArtCockpitStatus(report = null) {
  if (!report) return { status: "todo", label: "Art cockpit", summary: "not run" };
  const summary = report.summary ?? {};
  const blockers = numeric(summary.blockers);
  const needs = numeric(summary.needsFinalArt) + numeric(summary.actorNeedsFinalArt);
  const visual = numeric(summary.visualQaPending);
  const critical = numeric(summary.criticalNeeds);
  const criticalVisual = numeric(summary.criticalVisualQaPending);
  if (blockers > 0) return { status: "block", label: "Art cockpit", summary: `${blockers} art blockers, ${needs} replacements` };
  if (critical > 0 || criticalVisual > 0 || needs > 0 || visual > 0) {
    return { status: "warn", label: "Art cockpit", summary: `${needs} replacements, ${visual} visual QA, ${criticalVisual} critical QA` };
  }
  return { status: "ok", label: "Art cockpit", summary: `${numeric(summary.overallFinalCoveragePct)}% final coverage` };
}

function summarizeSessionReadinessStatus(report = null) {
  if (!report) return { status: "todo", label: "Session readiness", summary: "not run" };
  const summary = report.summary ?? {};
  const blockers = numeric(summary.blockers);
  const warnings = numeric(summary.warnings);
  if (!report.ok && blockers > 0) {
    return { status: "block", label: "Session readiness", summary: `${blockers} blockers, ${warnings} warnings` };
  }
  if (warnings > 0 || summary.status === "warn") {
    return { status: "warn", label: "Session readiness", summary: `${warnings} warnings, maps missing=${numeric(summary.mapsMissing)}` };
  }
  return { status: "ok", label: "Session readiness", summary: "session content skeleton is green" };
}

function summarizePackPlanStatus(report = null) {
  if (!report) return { status: "todo", label: "Pack plan", summary: "not run" };
  const summary = report.summary ?? {};
  const blockers = numeric(summary.missingPacks) + numeric(summary.documentTypeMismatches) + numeric(summary.indexErrors);
  if (!report.ok || blockers > 0) return { status: "block", label: "Pack plan", summary: `${blockers} pack blockers` };
  const delta = numeric(summary.deltaAbs);
  if (delta > 0) return { status: "warn", label: "Pack plan", summary: `${delta} indexed entries differ from generated plan` };
  return { status: "ok", label: "Pack plan", summary: `${numeric(summary.packs)} packs match generated plan` };
}

function summarizePipelineStatus(report = null) {
  if (!report) return { status: "todo", label: "Pipeline dry-run", summary: "not run" };
  const summary = report.summary ?? {};
  const blockers =
    numeric(summary.failedSteps)
    + numeric(summary.preflightErrors)
    + numeric(summary.catalogErrors)
    + numeric(summary.assetErrors)
    + numeric(summary.generatedPackSourceErrors)
    + numeric(summary.balanceErrors)
    + numeric(summary.validationErrors)
    + numeric(summary.repairErrors);
  if (!report.ok || blockers > 0) return { status: "block", label: "Pipeline dry-run", summary: `${blockers} blockers` };
  const planned = numeric(summary.mutatingStepsPlanned);
  if (planned > 0) return { status: "warn", label: "Pipeline dry-run", summary: `${planned} mutating steps are ready to apply` };
  return { status: "ok", label: "Pipeline dry-run", summary: "no blockers" };
}

function recordOptions(record) {
  return Object.values(record ?? {}).map((entry) => ({
    id: entry.id,
    label: entry.label,
    icon: entry.icon ?? "",
    text: entry.icon ? `${entry.icon} ${entry.label}` : entry.label,
  }));
}

function optionRows(options = [], selectedValue = "") {
  return (Array.isArray(options) ? options : []).map(option => ({
    ...option,
    selected: String(option.id) === String(selectedValue),
  }));
}

function firstOptionId(options = [], fallback = "") {
  return options.find(option => option?.id)?.id ?? fallback;
}

function normalizeSituationChoice(value, options = [], fallback = "") {
  const key = String(value ?? "").trim();
  return options.some(option => option.id === key)
    ? key
    : firstOptionId(options, fallback);
}

function normalizeSituationCockpitOptions(raw = {}) {
  const level = normalizeSituationChoice(
    raw.level ?? raw.activeLevelId,
    SITUATION_COCKPIT_LEVEL_OPTIONS,
    SITUATION_COCKPIT_DEFAULTS.level,
  );
  const terrain = normalizeSituationChoice(
    raw.terrain,
    SITUATION_COCKPIT_TERRAIN_OPTIONS,
    SITUATION_COCKPIT_DEFAULTS.terrain,
  );
  const kind = normalizeSituationChoice(
    raw.kind,
    SITUATION_COCKPIT_KIND_OPTIONS,
    SITUATION_COCKPIT_DEFAULTS.kind,
  );
  const rerollMode = normalizeSituationChoice(
    raw.rerollMode ?? raw.mode,
    SITUATION_COCKPIT_REROLL_MODE_OPTIONS,
    SITUATION_COCKPIT_DEFAULTS.rerollMode,
  );
  const tier = Math.max(1, Math.min(10, Math.round(numeric(raw.tier, SITUATION_COCKPIT_DEFAULTS.tier))));
  const label = String(raw.label ?? "").trim();
  const seedInput = String(raw.seedInput ?? raw.seed ?? "").trim();
  const seed = String(raw.seed ?? seedInput ?? "").trim();
  return {
    level,
    terrain,
    kind,
    tier,
    label,
    rerollMode,
    seedInput,
    seed,
  };
}

function situationOptionSignature(options = {}) {
  const normalized = normalizeSituationCockpitOptions(options);
  return [
    normalized.level,
    normalized.terrain,
    normalized.kind,
    normalized.tier,
    normalized.label,
    normalized.rerollMode,
    normalized.seedInput,
  ].join("|");
}

function situationLabel(options = {}) {
  const normalized = normalizeSituationCockpitOptions(options);
  if (normalized.label) return normalized.label;
  const terrainLabel = SITUATION_COCKPIT_TERRAIN_OPTIONS.find(option => option.id === normalized.terrain)?.label ?? normalized.terrain;
  const kindLabel = SITUATION_COCKPIT_KIND_OPTIONS.find(option => option.id === normalized.kind)?.label ?? normalized.kind;
  return `${terrainLabel} / ${kindLabel}`;
}

function situationRow(label, value, note = "", tone = "is-safe", extra = {}) {
  return {
    label: String(label ?? "").trim(),
    value: String(value ?? "").trim(),
    note: String(note ?? "").trim(),
    tone: String(tone ?? "").trim() || "is-safe",
    hasNote: Boolean(String(note ?? "").trim()),
    ...extra,
  };
}

function displaySituationRows(rows = [], limit = 6) {
  return (Array.isArray(rows) ? rows : [])
    .slice(0, limit)
    .map(row => ({
      ...row,
      label: String(row?.label ?? "").trim(),
      value: String(row?.value ?? "").trim(),
      note: String(row?.note ?? "").trim(),
      tone: String(row?.tone ?? "").trim() || "is-safe",
      hasNote: Boolean(String(row?.note ?? "").trim()),
    }))
    .filter(row => row.label || row.value || row.note);
}

function normalizeSituationStatus(status = "active") {
  const key = String(status ?? "").trim();
  return SITUATION_STATUS_OPTIONS.some(option => option.id === key) ? key : "active";
}

function situationStatusMeta(status = "active") {
  const key = normalizeSituationStatus(status);
  return SITUATION_STATUS_OPTIONS.find(option => option.id === key) ?? SITUATION_STATUS_OPTIONS[0];
}

function situationTimeLabel(value = "") {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("ru-RU");
}

function situationRecordId(situation = {}) {
  return [
    "gm",
    situation.id || situation.title || situation.map?.label || "situation",
    situation.seed || Date.now(),
  ].filter(Boolean).join("-")
    .replace(/[^a-zA-Z0-9а-яА-Я_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96) || `gm-situation-${Date.now()}`;
}

function buildGmSituationRecord(situation = {}, options = {}, previous = null, overrides = {}) {
  const now = nowIso();
  const status = normalizeSituationStatus(overrides.status ?? "active");
  const id = overrides.id || situationRecordId(situation);
  const meta = situationStatusMeta(status);
  return {
    id,
    status,
    statusLabel: meta.label,
    tone: meta.tone,
    createdAt: overrides.createdAt ?? now,
    updatedAt: now,
    closedAt: ["resolved", "failed", "ignored"].includes(status) ? now : "",
    title: String(situation.title || situation.map?.label || "Generated situation").trim(),
    hook: String(situation.hook || situation.summary || "").trim(),
    mapLabel: String(situation.map?.label || "").trim(),
    mapLevel: String(situation.map?.level || options.level || "").trim(),
    mapAsset: String(situation.map?.asset || "").trim(),
    kind: String(situation.kind || options.kind || "").trim(),
    terrain: String(situation.terrain || options.terrain || "").trim(),
    tier: Number(situation.tier ?? options.tier ?? 1) || 1,
    seed: String(situation.seed || options.seed || "").trim(),
    mode: String(situation.reroll?.mode || options.rerollMode || "fresh").trim(),
    previousRecordId: String(overrides.previousRecordId || previous?.recordId || previous?.id || "").trim(),
    previousTitle: String(situation.reroll?.previousTitle || previous?.title || "").trim(),
    counts: plainClone(situation.counts ?? {}),
    options: normalizeSituationCockpitOptions(options ?? {}),
    situation: plainClone(situation),
  };
}

function normalizeGmSituationRecord(raw = {}) {
  const situation = raw.situation?.hasSituation ? raw.situation : null;
  const status = normalizeSituationStatus(raw.status);
  const meta = situationStatusMeta(status);
  const id = String(raw.id || situationRecordId(situation ?? raw)).trim();
  const createdAt = String(raw.createdAt || raw.updatedAt || nowIso()).trim();
  return {
    id,
    status,
    statusLabel: meta.label,
    tone: meta.tone,
    createdAt,
    updatedAt: String(raw.updatedAt || createdAt).trim(),
    closedAt: String(raw.closedAt || "").trim(),
    title: String(raw.title || situation?.title || "Generated situation").trim(),
    hook: String(raw.hook || situation?.hook || situation?.summary || "").trim(),
    mapLabel: String(raw.mapLabel || situation?.map?.label || "").trim(),
    mapLevel: String(raw.mapLevel || situation?.map?.level || raw.options?.level || "").trim(),
    mapAsset: String(raw.mapAsset || situation?.map?.asset || "").trim(),
    kind: String(raw.kind || situation?.kind || raw.options?.kind || "").trim(),
    terrain: String(raw.terrain || situation?.terrain || raw.options?.terrain || "").trim(),
    tier: Number(raw.tier ?? situation?.tier ?? raw.options?.tier ?? 1) || 1,
    seed: String(raw.seed || situation?.seed || raw.options?.seed || "").trim(),
    mode: String(raw.mode || situation?.reroll?.mode || raw.options?.rerollMode || "fresh").trim(),
    previousRecordId: String(raw.previousRecordId || "").trim(),
    previousTitle: String(raw.previousTitle || situation?.reroll?.previousTitle || "").trim(),
    counts: plainClone(raw.counts ?? situation?.counts ?? {}),
    options: normalizeSituationCockpitOptions(raw.options ?? {}),
    situation: situation ? plainClone(situation) : null,
  };
}

function normalizeGmSituationState(raw = {}) {
  const sourceEntries = raw?.entries && typeof raw.entries === "object" ? raw.entries : {};
  const entries = {};
  for (const value of Object.values(sourceEntries)) {
    const record = normalizeGmSituationRecord(value);
    if (record.id) entries[record.id] = record;
  }
  const rawOrder = Array.isArray(raw?.order) ? raw.order.map(String).filter(Boolean) : [];
  const order = [
    ...rawOrder.filter(id => entries[id]),
    ...Object.keys(entries).filter(id => !rawOrder.includes(id)),
  ].slice(0, GM_SITUATION_HISTORY_LIMIT);
  const trimmedEntries = Object.fromEntries(order.map(id => [id, entries[id]]).filter(([, value]) => value));
  const fallbackActiveId = order.find(id => trimmedEntries[id]?.status === "active") ?? "";
  const activeId = order.includes(raw?.activeId) && trimmedEntries[raw.activeId]?.status === "active"
    ? raw.activeId
    : fallbackActiveId;
  const selectedId = order.includes(raw?.selectedId) ? raw.selectedId : activeId || order[0] || "";
  return {
    entries: trimmedEntries,
    order,
    activeId,
    selectedId,
  };
}

function getGmSituationState() {
  try {
    return normalizeGmSituationState(game.settings?.get?.(SYSTEM_ID, GM_SITUATION_SETTING) ?? {});
  } catch {
    return normalizeGmSituationState({});
  }
}

async function setGmSituationState(state = {}) {
  const normalized = normalizeGmSituationState(state);
  await game.settings?.set?.(SYSTEM_ID, GM_SITUATION_SETTING, normalized);
  return normalized;
}

function upsertGmSituationRecordInState(state = {}, record = {}) {
  const normalized = normalizeGmSituationState(state);
  const nextRecord = normalizeGmSituationRecord(record);
  const entries = {
    ...normalized.entries,
    [nextRecord.id]: nextRecord,
  };
  const order = [nextRecord.id, ...normalized.order.filter(id => id !== nextRecord.id)].slice(0, GM_SITUATION_HISTORY_LIMIT);
  const trimmedEntries = Object.fromEntries(order.map(id => [id, entries[id]]).filter(([, value]) => value));
  return normalizeGmSituationState({
    entries: trimmedEntries,
    order,
    activeId: nextRecord.status === "active" ? nextRecord.id : normalized.activeId,
    selectedId: nextRecord.id,
  });
}

async function persistGmSituationRecord(situation = {}, options = {}, { previousRecord = null, status = "active" } = {}) {
  const previousState = getGmSituationState();
  const existingId = situationRecordId(situation);
  const existing = previousState.entries?.[existingId] ?? null;
  const record = buildGmSituationRecord(situation, options, previousRecord, {
    id: existing?.id ?? existingId,
    createdAt: existing?.createdAt,
    previousRecordId: previousRecord?.id ?? situation.reroll?.previousRecordId ?? "",
    status,
  });
  const next = upsertGmSituationRecordInState(previousState, record);
  await setGmSituationState(next);
  return { state: next, record };
}

async function updateGmSituationRecordStatus(id = "", status = "active") {
  const state = getGmSituationState();
  const record = state.entries?.[String(id ?? "").trim()];
  if (!record) return { state, record: null };
  const meta = situationStatusMeta(status);
  const now = nowIso();
  const nextRecord = {
    ...record,
    status: meta.id,
    statusLabel: meta.label,
    tone: meta.tone,
    updatedAt: now,
    closedAt: meta.id === "active" ? "" : now,
  };
  const entries = {
    ...state.entries,
    [record.id]: nextRecord,
  };
  const next = normalizeGmSituationState({
    entries,
    order: state.order,
    activeId: meta.id === "active" ? record.id : (state.activeId === record.id ? state.order.find(entryId => entryId !== record.id && entries[entryId]?.status === "active") ?? "" : state.activeId),
    selectedId: record.id,
  });
  await setGmSituationState(next);
  return { state: next, record: nextRecord };
}

function buildGmSituationHistoryRows(state = {}, selectedId = "") {
  const normalized = normalizeGmSituationState(state);
  return normalized.order.slice(0, 10).map(id => {
    const record = normalized.entries[id];
    const meta = situationStatusMeta(record.status);
    const isSelected = id === selectedId || id === normalized.selectedId;
    const isActive = id === normalized.activeId || record.status === "active";
    return {
      id,
      title: record.title || "Generated situation",
      hook: compactSituationText(record.hook || record.previousTitle || record.seed || "", 120),
      mapLabel: record.mapLabel || "Map pool",
      mapLevel: record.mapLevel || "-",
      kind: record.kind || "-",
      terrain: record.terrain || "-",
      tier: record.tier || "-",
      status: record.status,
      statusLabel: meta.label,
      tone: meta.tone,
      mode: record.mode || "fresh",
      seed: compactSituationText(record.seed || "", 42),
      updatedLabel: situationTimeLabel(record.updatedAt),
      selected: isSelected,
      active: isActive,
      hasPrevious: Boolean(record.previousTitle),
      previousTitle: record.previousTitle,
    };
  });
}

function situationRowCount(rows = []) {
  return Array.isArray(rows) ? rows.filter(row => row && (row.label || row.value || row.note)).length : 0;
}

function compactSituationText(value = "", limit = 96) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(8, limit - 1)).trim()}...`;
}

function canonicalSituationWorldMapLevel(level = "region") {
  const key = String(level ?? "").trim();
  if (key === "building") return "encounter";
  return WORLD_MAP_LEVELS[key] ? key : "region";
}

function situationWorldMapLevelLabel(level = "region") {
  const canonical = canonicalSituationWorldMapLevel(level);
  return WORLD_MAP_LEVELS[canonical]?.shortLabel || WORLD_MAP_LEVELS[canonical]?.label || canonical;
}

function situationRouteFocus(situation = {}, options = {}) {
  const rawLevel = String(situation.map?.level || options.level || situation.options?.level || "region").trim();
  const level = canonicalSituationWorldMapLevel(rawLevel);
  const label = situation.map?.label || situation.title || situationLabel(options) || "Generated location";
  const hotspotId = situation.kind || options.kind || situation.options?.kind || "";
  return {
    rawLevel,
    level,
    label,
    terrain: situation.terrain || options.terrain || situation.options?.terrain || "",
    col: Number(situation.map?.col ?? options.col ?? 5) || 5,
    row: Number(situation.map?.row ?? options.row ?? 5) || 5,
    hotspotId,
    isBuilding: rawLevel === "building",
  };
}

function buildSituationNavigationRows(situation = {}, options = {}) {
  const focus = situationRouteFocus(situation, options);
  const entry = situation.map?.entryHint || findSituationRowByLabel(situation.placementRows, "Entry")?.note || "Choose a safe entry point.";
  const exit = situation.map?.exitHint || findSituationRowByLabel(situation.placementRows, "Exit")?.note || "Return to the previous layer.";
  const sceneKind = focus.isBuilding ? "building/interior" : focus.level === "encounter" ? "encounter scene" : "scene candidate";
  const localLabel = focus.level === "global"
    ? "Choose Iron Hills region"
    : focus.level === "region"
      ? "Select local focus"
      : focus.label;
  const rows = [
    situationRow(
      "1. Global",
      "Iron Hills atlas",
      focus.level === "global" ? "Current generation starts at campaign atlas scale." : "Campaign context; use it to choose the active region.",
      focus.level === "global" ? "is-active" : "is-safe",
      { navLevel: "global", navAction: "open-world-map", navOrder: 1 },
    ),
    situationRow(
      "2. Region",
      "Iron Hills route",
      focus.level === "region" ? `${focus.label}; route within the regional travel layer.` : "Route toward the local focus before dropping into scene scale.",
      focus.level === "region" ? "is-active" : "is-road",
      { navLevel: "region", navAction: "open-world-map", navOrder: 2, col: focus.col, row: focus.row },
    ),
    situationRow(
      "3. Local",
      localLabel,
      focus.level === "local" ? "Current generation is a city/locality map." : "Use local layer to choose district, building, field edge or encounter approach.",
      focus.level === "local" ? "is-active" : "is-road",
      { navLevel: "local", navAction: "open-world-map", navOrder: 3, col: focus.col, row: focus.row, hotspotId: focus.hotspotId },
    ),
    situationRow(
      "4. Scene",
      `${focus.label} / ${sceneKind}`,
      focus.level === "encounter" ? "Current generation is ready for Foundry Scene setup." : "Final drop into a house, field, market square, cave or combat encounter.",
      focus.level === "encounter" ? "is-active" : "is-warn",
      { navLevel: "encounter", navAction: "open-world-map", navOrder: 4, col: focus.col, row: focus.row, hotspotId: focus.hotspotId, rawLevel: focus.rawLevel },
    ),
    situationRow(
      "Entry route",
      "party entry",
      entry,
      "is-road",
      { navLevel: focus.level, navAction: "entry", hotspotId: "entry" },
    ),
    situationRow(
      "Exit route",
      "return / transition",
      exit,
      "is-road",
      { navLevel: focus.level === "encounter" ? "local" : "region", navAction: "exit", hotspotId: "exit" },
    ),
  ];
  return rows;
}

function recalculateSituationCounts(situation = {}) {
  const actorRows = Array.isArray(situation.actorRows) ? situation.actorRows : [];
  const actorKind = kind => actorRows.filter(row => String(row?.actorKind ?? "").trim() === kind).length;
  return {
    ...(situation.counts ?? {}),
    actors: situationRowCount(actorRows),
    monsters: actorKind("monster"),
    npcs: actorKind("npc"),
    placements: situationRowCount(situation.placementRows),
    markers: situationRowCount(situation.markerRows),
    blueprint: situationRowCount(situation.sceneBlueprintRows),
    hotspots: situationRowCount(situation.sceneHotspotRows),
    sceneInstructions: situationRowCount(situation.sceneInstructionRows),
    loot: situationRowCount(situation.lootRows),
    clues: situationRowCount(situation.clueRows),
    skills: situationRowCount(situation.skillRows),
    quests: situationRowCount(situation.questRows),
    rumors: situationRowCount(situation.rumorRows),
    rewards: situationRowCount(situation.rewardRows),
    consequences: situationRowCount(situation.consequenceRows),
    navigation: situationRowCount(situation.navigationRows),
  };
}

function decorateSituationCockpitReroll(situation = {}, { mode = "fresh", previous = null, previousRecordId = "" } = {}) {
  const next = plainClone(situation);
  const requestedMode = normalizeSituationChoice(mode, SITUATION_COCKPIT_REROLL_MODE_OPTIONS, "fresh");
  const resolvedMode = requestedMode === "refresh" && previous?.hasSituation ? "refresh" : "fresh";
  const previousTitle = resolvedMode === "refresh" ? (previous?.title || previous?.map?.label || "") : "";
  next.reroll = {
    mode: resolvedMode,
    previousId: resolvedMode === "refresh" ? previous?.id ?? "" : "",
    previousRecordId: resolvedMode === "refresh" ? String(previousRecordId || previous?.recordId || "").trim() : "",
    previousSeed: resolvedMode === "refresh" ? previous?.seed ?? "" : "",
    previousTitle,
    refreshedAt: nowIso(),
  };

  if (resolvedMode === "refresh" && previous?.hasSituation) {
    next.title = `${next.title || next.map?.label || "Situation"}: aftermath`;
    next.hook = `${next.hook || next.summary || "New situation."} Previous thread resolved: ${previousTitle}.`;
    next.summary = `${next.summary || next.hook || "Generated situation."} Treat this as the next state after the previous scene was completed.`;
    next.situationRows = [
      situationRow(
        "Reroll mode",
        "Refresh resolved",
        `Old situation is complete: ${compactSituationText(previousTitle || previous.seed || "previous scene")}. Use these rows as the new state.`,
        "is-active",
      ),
      ...(next.situationRows ?? []),
    ];
    next.questRows = [
      situationRow(
        "Follow-up seed",
        compactSituationText(next.title || "New aftermath hook", 72),
        `Aftermath of ${compactSituationText(previousTitle || "the previous situation", 72)}.`,
        "is-gold",
      ),
      ...(next.questRows ?? []),
    ];
    next.rumorRows = [
      situationRow(
        "Aftermath rumor",
        compactSituationText(previousTitle || "The last trouble is over", 72),
        compactSituationText(next.hook || next.summary || "The region reacts to the resolved event.", 140),
        "is-road",
      ),
      ...(next.rumorRows ?? []),
    ];
    next.consequenceRows = [
      situationRow(
        "Resolved state",
        "Previous hook completed",
        "Clear the old prompt from active play, then use this reroll as the next complication, reward trail or consequence.",
        "is-safe",
      ),
      ...(next.consequenceRows ?? []),
    ];
  } else {
    next.situationRows = [
      situationRow(
        "Reroll mode",
        "Fresh intro",
        "Use as a new scene opening. Seed lock still makes the roll reproducible.",
        "is-safe",
      ),
      ...(next.situationRows ?? []),
    ];
  }

  next.counts = recalculateSituationCounts(next);
  return next;
}

function buildSituationCockpitContext(options = {}) {
  const normalized = normalizeSituationCockpitOptions(options);
  const label = situationLabel(normalized);
  const role = SITUATION_COCKPIT_ROLE_BY_KIND[normalized.kind] ?? "villager";
  const hotspot = {
    id: `gm-${normalized.kind}`,
    label,
    kind: normalized.kind,
    hotspotType: normalized.kind,
    npcRole: role,
    detail: `GM generated ${normalized.kind} situation.`,
  };
  const focusTile = {
    label,
    terrain: normalized.terrain,
    terrainLabel: normalized.terrain,
    danger: normalized.tier,
    tier: normalized.tier,
    col: 5,
    row: 5,
    poi: normalized.level !== "global",
    poiMeta: { tier: normalized.tier },
  };
  const localView = {
    danger: normalized.tier,
    activeHotspot: hotspot,
    hasSessionLinks: false,
  };
  const encounterView = {
    danger: normalized.tier,
    activeHotspot: hotspot,
    hasZones: normalized.level === "encounter" || normalized.level === "building",
    hasSessionLinks: false,
  };
  const sceneBrief = {
    kind: normalized.kind,
    title: label,
  };
  const encounterKit = buildWorldMapEncounterKit({
    activeLevelId: normalized.level,
    focusTile,
    localView,
    encounterView,
    sceneBrief,
  });
  return {
    activeLevelId: normalized.level,
    focusTile,
    localView,
    encounterView,
    sceneBrief,
    encounterKit,
    seed: normalized.seed,
    options: normalized,
  };
}

function buildSituationCockpitBrief(situation = null, options = {}) {
  if (!situation?.hasSituation) return null;
  const context = buildSituationCockpitContext(options);
  const kit = context.encounterKit ?? {};
  const label = situationLabel(options);
  const navigationRows = buildSituationNavigationRows(situation, options);
  const navFocus = situationRouteFocus(situation, options);
  const combatLabel = kit.combat ? "combat-capable" : "social / utility";
  const setupRows = [
    situationRow("Generated map", situation.map?.label || "map pool", `${situation.map?.level || context.activeLevelId} / ${situation.map?.sceneScale || "scene"}`, "is-road", { asset: situation.map?.asset ?? "" }),
    situationRow("Navigation target", situationWorldMapLevelLabel(navFocus.level), navFocus.isBuilding ? "Building maps open through the encounter layer." : `Open World Map at ${navFocus.level}.`, "is-active", { navLevel: navFocus.level }),
    situationRow("Tier", `t${situation.tier || kit.tier || "-"}`, `${situation.terrain || options.terrain} / ${situation.kind || options.kind}`, "is-warn"),
    situationRow("Seed", situation.seed || "-", "Save this if you want to reproduce the same roll.", "is-active"),
    situationRow("Safety", "manual staging", "No automatic Actor, Token or Scene spawning from this cockpit.", "is-safe"),
  ];
  const zoneRows = [
    situationRow("Entry", "party", situation.map?.entryHint || "Choose a safe map edge.", "is-road"),
    situationRow("Exit", "transition", situation.map?.exitHint || "Return to the previous map layer.", "is-road"),
  ];
  const mechanicRows = [
    situationRow("GM placement", "manual", "Use marker and placement rows to place tokens, NPCs, loot and exits.", "is-warn"),
    situationRow("Loot flow", "Tarkov inventory", "Use loot rows as container, corpse, merchant stock or hidden cache prompts.", "is-gold"),
    situationRow("Combat scope", combatLabel, "If combat starts, verify cover, AoE, target zones and friendly fire before resolving attacks.", kit.combat ? "is-warn" : "is-safe"),
  ];
  const riskRows = [
    situationRow("Foundry Scene", "not auto-created", "Pick an existing map asset or create a Scene from the generated map candidate.", "is-warn"),
  ];
  return {
    hasBrief: true,
    title: `GM Situation: ${situation.title || label}`,
    subtitle: `${situation.map?.label || label} · ${context.activeLevelId} · t${situation.tier || kit.tier || "-"}`,
    kind: situation.kind || context.sceneBrief.kind,
    statusLabel: "GM generated situation",
    tone: situation.tone || "is-active",
    statusClass: situation.tone || "is-active",
    summaryRows: situation.situationRows ?? [],
    setupRows,
    castRows: [],
    zoneRows,
    lootRows: situation.lootRows ?? [],
    situationRows: situation.situationRows ?? [],
    placementRows: situation.placementRows ?? [],
    markerRows: situation.markerRows ?? [],
    sceneDescriptionRows: buildSituationSceneDescriptionRows(situation),
    navigationRows,
    sceneBlueprintRows: situation.sceneBlueprintRows ?? [],
    sceneHotspotRows: situation.sceneHotspotRows ?? [],
    sceneInstructionRows: situation.sceneInstructionRows ?? [],
    situationActorRows: situation.actorRows ?? [],
    situationLootRows: situation.lootRows ?? [],
    clueRows: situation.clueRows ?? [],
    skillRows: situation.skillRows ?? [],
    twistRows: situation.twistRows ?? [],
    questRows: situation.questRows ?? [],
    rumorRows: situation.rumorRows ?? [],
    rewardRows: situation.rewardRows ?? [],
    consequenceRows: situation.consequenceRows ?? [],
    poolRows: situation.poolRows ?? [],
    kitRows: kit.kitRows ?? [],
    monsterRows: [],
    npcRows: [],
    generatorRows: kit.generatorRows ?? [],
    harvestRows: [],
    mechanicRows,
    riskRows,
    hasSetupRows: setupRows.length > 0,
    hasCastRows: false,
    hasZoneRows: zoneRows.length > 0,
    hasLootRows: Boolean(situation.lootRows?.length),
    hasSituationRows: Boolean(situation.situationRows?.length),
    hasPlacementRows: Boolean(situation.placementRows?.length),
    hasMarkerRows: Boolean(situation.markerRows?.length),
    hasNavigationRows: navigationRows.length > 0,
    hasSceneBlueprintRows: Boolean(situation.sceneBlueprintRows?.length),
    hasSceneHotspotRows: Boolean(situation.sceneHotspotRows?.length),
    hasSceneInstructionRows: Boolean(situation.sceneInstructionRows?.length),
    hasSituationActorRows: Boolean(situation.actorRows?.length),
    hasSituationLootRows: Boolean(situation.lootRows?.length),
    hasClueRows: Boolean(situation.clueRows?.length),
    hasSkillRows: Boolean(situation.skillRows?.length),
    hasTwistRows: Boolean(situation.twistRows?.length),
    hasQuestRows: Boolean(situation.questRows?.length),
    hasRumorRows: Boolean(situation.rumorRows?.length),
    hasRewardRows: Boolean(situation.rewardRows?.length),
    hasConsequenceRows: Boolean(situation.consequenceRows?.length),
    hasPoolRows: Boolean(situation.poolRows?.length),
    hasKitRows: Boolean(kit.hasKitRows),
    hasMonsterRows: false,
    hasNpcRows: false,
    hasGeneratorRows: Boolean(kit.hasGeneratorRows),
    hasHarvestRows: false,
    hasMechanicRows: true,
    hasRiskRows: true,
    encounterKit: kit,
    situation,
    chatRows: [
      ["Map", situation.map?.label || "-"],
      ["Level", situation.map?.level || context.activeLevelId],
      ["Navigation", `${navFocus.rawLevel || navFocus.level} -> ${navFocus.level}`],
      ["Tier", `t${situation.tier || kit.tier || "-"}`],
      ["Actors", `${situation.counts?.monsters ?? 0} monsters · ${situation.counts?.npcs ?? 0} NPC`],
      ["Blueprint", `${situation.counts?.blueprint ?? 0} anchors · ${situation.counts?.hotspots ?? 0} hotspots`],
      ["Loot", `${situation.counts?.loot ?? 0} prompts`],
      ["Quest", `${situation.counts?.quests ?? 0} seeds · ${situation.counts?.rumors ?? 0} rumors`],
      ["Seed", situation.seed || "-"],
    ],
  };
}

function situationRowsNonEmpty(rows = []) {
  return Array.isArray(rows) && rows.some(row => row && (row.label || row.value || row.note));
}

function finalizeSituationMutation(situation = {}) {
  const next = plainClone(situation);
  next.navigationRows = buildSituationNavigationRows(next, next.options ?? {});
  next.counts = recalculateSituationCounts(next);
  next.hasNavigationRows = situationRowsNonEmpty(next.navigationRows);
  next.hasActorRows = situationRowsNonEmpty(next.actorRows);
  next.hasPlacementRows = situationRowsNonEmpty(next.placementRows);
  next.hasMarkerRows = situationRowsNonEmpty(next.markerRows);
  next.hasSceneBlueprintRows = situationRowsNonEmpty(next.sceneBlueprintRows);
  next.hasSceneHotspotRows = situationRowsNonEmpty(next.sceneHotspotRows);
  next.hasSceneInstructionRows = situationRowsNonEmpty(next.sceneInstructionRows);
  next.hasLootRows = situationRowsNonEmpty(next.lootRows);
  next.hasClueRows = situationRowsNonEmpty(next.clueRows);
  next.hasSkillRows = situationRowsNonEmpty(next.skillRows);
  next.hasTwistRows = situationRowsNonEmpty(next.twistRows);
  next.hasQuestRows = situationRowsNonEmpty(next.questRows);
  next.hasRumorRows = situationRowsNonEmpty(next.rumorRows);
  next.hasRewardRows = situationRowsNonEmpty(next.rewardRows);
  next.hasConsequenceRows = situationRowsNonEmpty(next.consequenceRows);
  next.hasPoolRows = situationRowsNonEmpty(next.poolRows);
  return next;
}

function findSituationRowByLabel(rows = [], label = "") {
  const wanted = String(label ?? "").trim().toLocaleLowerCase("ru");
  return (Array.isArray(rows) ? rows : []).find(row => String(row?.label ?? "").trim().toLocaleLowerCase("ru") === wanted) ?? null;
}

function dedupeSituationRows(rows = []) {
  const seen = new Set();
  const out = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || (!row.label && !row.value && !row.note)) continue;
    const key = [row.label, row.value, row.note, row.actorKind, row.markerKind].map(value => String(value ?? "").trim()).join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

function buildSituationPlacementRowsFromParts(base = {}, overrides = {}) {
  const placementRows = Array.isArray(base.placementRows) ? base.placementRows : [];
  const entry = overrides.entry
    ?? findSituationRowByLabel(overrides.placementRows, "Entry")
    ?? findSituationRowByLabel(placementRows, "Entry")
    ?? situationRow("Entry", "party", base.map?.entryHint || "Choose a safe edge.", "is-road");
  const exit = overrides.exit
    ?? findSituationRowByLabel(overrides.placementRows, "Exit")
    ?? findSituationRowByLabel(placementRows, "Exit")
    ?? situationRow("Exit", "transition", base.map?.exitHint || "Return to the previous map layer.", "is-road");
  const actorRows = overrides.actorRows ?? base.actorRows ?? [];
  const lootRows = overrides.lootRows ?? base.lootRows ?? [];
  const questRows = overrides.questRows ?? base.questRows ?? [];
  return dedupeSituationRows([
    entry,
    ...actorRows,
    ...lootRows,
    ...questRows.slice(0, 1),
    exit,
  ]);
}

function buildSituationStageRoll(options = {}, stage = "story") {
  const normalized = normalizeSituationCockpitOptions(options);
  const stageKey = SITUATION_SCENE_KIT_STAGE_OPTIONS.some(option => option.id === stage) ? stage : "story";
  const seedBase = normalized.seedInput || normalized.seed || nowIso();
  const stageSeed = `${seedBase}|kit-stage:${stageKey}|${Date.now()}`;
  const nextOptions = normalizeSituationCockpitOptions({
    ...normalized,
    seed: stageSeed,
    seedInput: stageSeed,
    rerollMode: "fresh",
  });
  return buildWorldMapSituation(buildSituationCockpitContext(nextOptions));
}

function mergeSituationStage(base = {}, generated = {}, stage = "story") {
  const stageKey = SITUATION_SCENE_KIT_STAGE_OPTIONS.some(option => option.id === stage) ? stage : "story";
  const next = plainClone(base);
  const source = plainClone(generated);
  if (!next.hasSituation || !source.hasSituation) return finalizeSituationMutation(next);

  if (stageKey === "story") {
    next.title = source.title;
    next.hook = source.hook;
    next.summary = source.summary;
    next.tone = source.tone;
    next.situationRows = source.situationRows;
    next.questRows = source.questRows;
    next.rumorRows = source.rumorRows;
    next.rewardRows = source.rewardRows;
    next.consequenceRows = source.consequenceRows;
    next.twistRows = source.twistRows;
  } else if (stageKey === "scene") {
    next.map = source.map;
    next.sceneBlueprintRows = source.sceneBlueprintRows;
    next.sceneHotspotRows = source.sceneHotspotRows;
    next.sceneInstructionRows = source.sceneInstructionRows;
    next.markerRows = source.markerRows;
    next.placementRows = buildSituationPlacementRowsFromParts(next, { placementRows: source.placementRows });
  } else if (stageKey === "actors") {
    next.actorRows = source.actorRows;
    next.sceneBlueprintRows = source.sceneBlueprintRows;
    next.sceneHotspotRows = source.sceneHotspotRows;
    next.sceneInstructionRows = source.sceneInstructionRows;
    next.placementRows = buildSituationPlacementRowsFromParts(next, { actorRows: source.actorRows });
  } else if (stageKey === "loot") {
    next.lootRows = source.lootRows;
    next.clueRows = source.clueRows;
    next.skillRows = source.skillRows;
    next.rewardRows = source.rewardRows;
    next.twistRows = source.twistRows;
    next.sceneBlueprintRows = source.sceneBlueprintRows;
    next.sceneHotspotRows = source.sceneHotspotRows;
    next.sceneInstructionRows = source.sceneInstructionRows;
    next.placementRows = buildSituationPlacementRowsFromParts(next, {
      lootRows: source.lootRows,
      questRows: source.questRows?.length ? source.questRows : next.questRows,
    });
  }

  const meta = SITUATION_SCENE_KIT_STAGE_OPTIONS.find(option => option.id === stageKey);
  next.stageRerolls = {
    ...(next.stageRerolls ?? {}),
    [stageKey]: {
      id: stageKey,
      label: meta?.label ?? stageKey,
      seed: source.seed ?? "",
      updatedAt: nowIso(),
      note: meta?.summary ?? "",
    },
  };
  next.sceneKit = {
    ...(next.sceneKit ?? {}),
    dirtyStages: Array.from(new Set([...(next.sceneKit?.dirtyStages ?? []), stageKey])),
    updatedAt: nowIso(),
    status: "draft",
  };
  return finalizeSituationMutation(next);
}

function situationSceneKitName(situation = {}) {
  return `IH Kit - ${compactSituationText(situation.title || situation.map?.label || "Generated Scene", 70)}`;
}

function buildSituationSceneDescriptionRows(situation = {}) {
  const entry = situation.map?.entryHint || findSituationRowByLabel(situation.placementRows, "Entry")?.note || "Choose a safe entry point.";
  const exit = situation.map?.exitHint || findSituationRowByLabel(situation.placementRows, "Exit")?.note || "Choose a safe exit or transition.";
  const quest = Array.isArray(situation.questRows) ? situation.questRows[0] : null;
  const rumor = Array.isArray(situation.rumorRows) ? situation.rumorRows[0] : null;
  const twist = Array.isArray(situation.twistRows) ? situation.twistRows[0] : null;
  return [
    situationRow("Read-aloud", situation.title || situation.map?.label || "Generated scene", situation.hook || situation.summary || "Open the scene from the generated prompt.", "is-active"),
    situationRow("GM truth", situation.summary || situation.hook || "Use generated rows as the hidden situation logic.", quest?.value || "", "is-gold"),
    situationRow("Entry", "party starts here", entry, "is-road"),
    situationRow("Exit", "transition point", exit, "is-road"),
    rumor ? situationRow("Rumor", rumor.value, rumor.note, "is-road") : null,
    quest ? situationRow("Quest pressure", quest.value, quest.note, "is-gold") : null,
    twist ? situationRow("Optional twist", twist.value || twist.label, twist.note, "is-warn") : null,
  ].filter(Boolean);
}

function buildSituationSceneDescriptionHtml(situation = {}) {
  const rows = buildSituationSceneDescriptionRows(situation);
  const list = rows.map(row => `
    <li>
      <strong>${escapeCombatHtml(row.label)}</strong>
      <span>${escapeCombatHtml(row.value)}</span>
      ${row.note ? `<em>${escapeCombatHtml(row.note)}</em>` : ""}
    </li>`).join("");
  return `
    <section class="ih-generated-scene-description">
      <h1>${escapeCombatHtml(situation.title || "Generated scene")}</h1>
      <p>${escapeCombatHtml(situation.hook || situation.summary || "")}</p>
      <ul>${list}</ul>
    </section>`;
}

function buildSituationSceneKitView(situation = {}) {
  const stageRerolls = situation.stageRerolls ?? {};
  const dirty = new Set(Array.isArray(situation.sceneKit?.dirtyStages) ? situation.sceneKit.dirtyStages : []);
  const stageRows = SITUATION_SCENE_KIT_STAGE_OPTIONS.map(option => {
    const meta = stageRerolls[option.id] ?? null;
    const count = option.id === "story"
      ? (situation.counts?.quests ?? 0) + (situation.counts?.rumors ?? 0) + (situation.counts?.consequences ?? 0)
      : option.id === "scene"
        ? (situation.counts?.blueprint ?? 0) + (situation.counts?.hotspots ?? 0)
        : option.id === "actors"
          ? (situation.counts?.actors ?? 0)
          : (situation.counts?.loot ?? 0) + (situation.counts?.clues ?? 0) + (situation.counts?.rewards ?? 0);
    return {
      stage: option.id,
      label: option.label,
      summary: option.summary,
      count,
      tone: dirty.has(option.id) ? "is-warn" : meta ? "is-active" : "is-safe",
      status: meta ? `rerolled ${situationTimeLabel(meta.updatedAt)}` : "current roll",
      seed: compactSituationText(meta?.seed ?? "", 44),
      hasSeed: Boolean(meta?.seed),
    };
  });
  const folders = situation.sceneKit?.folders ?? {};
  const folderRows = Object.entries(folders).map(([key, value]) => ({
    key,
    label: value?.label || key,
    name: value?.name || "",
    uuid: value?.uuid || "",
    count: value?.count ?? "",
    tone: value?.uuid ? "is-safe" : "is-warn",
  }));
  const entityRows = Array.isArray(situation.sceneKit?.entities) ? situation.sceneKit.entities.slice(0, 12) : [];
  const tokenSummary = situation.sceneKit?.tokenSummary ?? {};
  const markerSummary = situation.sceneKit?.markerSummary ?? {};
  const pinSummary = situation.sceneKit?.pinSummary ?? {};
  const qaSummary = situation.sceneKit?.qaSummary ?? {};
  const finalSummary = situation.sceneKit?.finalSummary ?? {};
  const playSummary = situation.sceneKit?.playSummary ?? {};
  const encounterSummary = situation.sceneKit?.encounterSummary ?? {};
  const sceneRows = [
    encounterSummary && Object.keys(encounterSummary).length ? {
      label: "Encounter",
      value: `${encounterSummary.statusLabel || encounterSummary.status || "not launched"} / ${Number(encounterSummary.participants ?? 0)} actors`,
      note: `${encounterSummary.sceneName || "no scene"} - ${Number(encounterSummary.allies ?? 0)} allies / ${Number(encounterSummary.enemies ?? 0)} enemies / ${Number(encounterSummary.neutral ?? 0)} neutral`,
      tone: encounterSummary.status === "launched" || encounterSummary.status === "ready" ? "is-safe" : encounterSummary.status === "blocked" ? "is-danger" : "is-warn",
    } : null,
    playSummary && Object.keys(playSummary).length ? {
      label: "Play mode",
      value: playSummary.statusLabel || playSummary.status || "posted",
      note: `${playSummary.sceneName || "no scene"} - ${situationTimeLabel(playSummary.openedAt || playSummary.updatedAt || "") || "just now"}`,
      tone: playSummary.status === "live" ? "is-safe" : playSummary.status === "blocked" ? "is-danger" : "is-road",
    } : null,
    finalSummary && Object.keys(finalSummary).length ? {
      label: "Final packet",
      value: `${finalSummary.statusLabel || finalSummary.status || "not finalized"} / ${Number(finalSummary.score ?? 0)}%`,
      note: `${finalSummary.sceneName || "no scene"} - ${Number(finalSummary.manualChecks ?? 0)} manual checks / ${Number(finalSummary.transitions ?? 0)} transitions`,
      tone: finalSummary.status === "ready" ? "is-safe" : finalSummary.status === "blocked" ? "is-danger" : "is-warn",
    } : null,
    qaSummary && Object.keys(qaSummary).length ? {
      label: "Scene QA",
      value: `${qaSummary.statusLabel || qaSummary.status || "not checked"} / ${Number(qaSummary.score ?? 0)}%`,
      note: `${qaSummary.sceneName || "no scene"} - ${Number(qaSummary.findings ?? 0)} findings / ${Number(qaSummary.foreign ?? 0)} foreign docs`,
      tone: qaSummary.status === "ready" ? "is-safe" : qaSummary.status === "blocked" ? "is-danger" : "is-warn",
    } : null,
    markerSummary && Object.keys(markerSummary).length ? {
      label: "Drawing markers",
      value: `${Number(markerSummary.created ?? 0)} created / ${Number(markerSummary.updated ?? 0)} updated`,
      note: `${Number(markerSummary.skipped ?? 0)} skipped`,
      tone: Number(markerSummary.skipped ?? 0) ? "is-warn" : "is-active",
    } : null,
    pinSummary && Object.keys(pinSummary).length ? {
      label: "GM pins",
      value: `${Number(pinSummary.created ?? 0)} created / ${Number(pinSummary.updated ?? 0)} updated`,
      note: `${Number(pinSummary.preserved ?? 0)} manually preserved / ${Number(pinSummary.missingJournal ?? 0)} missing journal / ${Number(pinSummary.skipped ?? 0)} skipped`,
      tone: Number(pinSummary.missingJournal ?? 0) || Number(pinSummary.skipped ?? 0) ? "is-warn" : "is-safe",
    } : null,
    tokenSummary && Object.keys(tokenSummary).length ? {
      label: "Tokens",
      value: `${Number(tokenSummary.created ?? 0)} created / ${Number(tokenSummary.updated ?? 0)} updated`,
      note: `${Number(tokenSummary.preserved ?? 0)} manually preserved / ${Number(tokenSummary.missing ?? 0)} missing actors / ${Number(tokenSummary.skipped ?? 0)} skipped`,
      tone: Number(tokenSummary.missing ?? 0) || Number(tokenSummary.skipped ?? 0) ? "is-warn" : "is-safe",
    } : null,
  ].filter(Boolean);
  return {
    name: situationSceneKitName(situation),
    status: situation.sceneKit?.status || "draft",
    updatedLabel: situationTimeLabel(situation.sceneKit?.updatedAt || ""),
    stageRows,
    folderRows,
    hasFolderRows: folderRows.length > 0,
    entityRows,
    hasEntityRows: entityRows.length > 0,
    sceneRows,
    hasSceneRows: sceneRows.length > 0,
    navigationRows: displaySituationRows(situation.navigationRows ?? buildSituationNavigationRows(situation), 8),
    hasNavigationRows: situationRowsNonEmpty(situation.navigationRows ?? buildSituationNavigationRows(situation)),
    descriptionRows: displaySituationRows(buildSituationSceneDescriptionRows(situation), 8),
  };
}

function buildSituationCockpitView({ situation = null, options = null, materializeResult = null, situationState = null } = {}) {
  const normalized = normalizeSituationCockpitOptions(options ?? SITUATION_COCKPIT_DEFAULTS);
  const stats = getWorldMapSituationPoolStats();
  const hasSituation = Boolean(situation?.hasSituation);
  const materializeRows = displaySituationRows(materializeResult?.rows, 8);
  const historyState = normalizeGmSituationState(situationState ?? {});
  const historyRows = buildGmSituationHistoryRows(historyState, historyState.selectedId);
  const selectedRecord = historyState.entries?.[historyState.selectedId] ?? null;
  const sceneKit = hasSituation ? buildSituationSceneKitView(situation) : null;
  return {
    options: normalized,
    levelOptions: optionRows(SITUATION_COCKPIT_LEVEL_OPTIONS, normalized.level),
    terrainOptions: optionRows(SITUATION_COCKPIT_TERRAIN_OPTIONS, normalized.terrain),
    kindOptions: optionRows(SITUATION_COCKPIT_KIND_OPTIONS, normalized.kind),
    tierOptions: optionRows(SITUATION_COCKPIT_TIER_OPTIONS, normalized.tier),
    rerollModeOptions: optionRows(SITUATION_COCKPIT_REROLL_MODE_OPTIONS, normalized.rerollMode),
    pool: {
      total: stats.total ?? 0,
      levelCount: stats.levels?.[normalized.level] ?? 0,
      terrainCount: stats.terrains?.[normalized.terrain] ?? 0,
      kindCount: stats.kinds?.[normalized.kind] ?? 0,
    },
    hasSituation,
    summary: hasSituation ? {
      title: situation.title || "Generated situation",
      hook: situation.hook || situation.summary || "",
      summary: situation.summary || situation.hook || "",
      tone: situation.tone || "is-active",
      mapLabel: situation.map?.label || "Map pool",
      mapLevel: situation.map?.level || normalized.level,
      mapScale: situation.map?.sceneScale || "scene",
      mapAsset: situation.map?.asset || "",
      seed: situation.seed || "",
      tier: situation.tier || normalized.tier,
      kind: situation.kind || normalized.kind,
      terrain: situation.terrain || normalized.terrain,
      actorCount: situation.counts?.actors ?? 0,
      monsterCount: situation.counts?.monsters ?? 0,
      npcCount: situation.counts?.npcs ?? 0,
      lootCount: situation.counts?.loot ?? 0,
      clueCount: situation.counts?.clues ?? 0,
      skillCount: situation.counts?.skills ?? 0,
      questCount: situation.counts?.quests ?? 0,
      rumorCount: situation.counts?.rumors ?? 0,
      rewardCount: situation.counts?.rewards ?? 0,
      navigationCount: situation.counts?.navigation ?? 0,
      blueprintCount: situation.counts?.blueprint ?? 0,
      hotspotCount: situation.counts?.hotspots ?? 0,
      sceneInstructionCount: situation.counts?.sceneInstructions ?? 0,
      rerollMode: situation.reroll?.mode || normalized.rerollMode,
      previousTitle: situation.reroll?.previousTitle || "",
      hasPrevious: Boolean(situation.reroll?.previousTitle),
    } : null,
    sceneKit,
    hasSceneKit: Boolean(sceneKit),
    situationRows: displaySituationRows(situation?.situationRows, 4),
    navigationRows: displaySituationRows(situation?.navigationRows, 6),
    actorRows: displaySituationRows(situation?.actorRows, 6),
    placementRows: displaySituationRows(situation?.placementRows, 6),
    markerRows: displaySituationRows(situation?.markerRows, 6),
    sceneBlueprintRows: displaySituationRows(situation?.sceneBlueprintRows, 8),
    sceneHotspotRows: displaySituationRows(situation?.sceneHotspotRows, 8),
    sceneInstructionRows: displaySituationRows(situation?.sceneInstructionRows, 6),
    lootRows: displaySituationRows(situation?.lootRows, 4),
    clueRows: displaySituationRows(situation?.clueRows, 4),
    skillRows: displaySituationRows(situation?.skillRows, 4),
    twistRows: displaySituationRows(situation?.twistRows, 3),
    questRows: displaySituationRows(situation?.questRows, 4),
    rumorRows: displaySituationRows(situation?.rumorRows, 3),
    rewardRows: displaySituationRows(situation?.rewardRows, 4),
    consequenceRows: displaySituationRows(situation?.consequenceRows, 4),
    poolRows: displaySituationRows(situation?.poolRows, 5),
    materializeTitle: materializeResult?.title ?? "",
    materializeRows,
    hasMaterializeRows: materializeRows.length > 0,
    historyRows,
    hasHistoryRows: historyRows.length > 0,
    activeHistoryId: historyState.activeId,
    selectedHistoryId: historyState.selectedId,
    selectedHistoryTitle: selectedRecord?.title ?? "",
  };
}

function situationMaterializeFlagObject(kind, situation = {}) {
  return {
    [SYSTEM_ID]: {
      gmSituation: {
        kind,
        situationId: situation.id ?? "",
        seed: situation.seed ?? "",
        title: situation.title ?? "",
        mode: situation.reroll?.mode ?? "fresh",
        previousSeed: situation.reroll?.previousSeed ?? "",
        updatedAt: nowIso(),
      },
    },
  };
}

function situationMaterializeFlagPatch(kind, situation = {}) {
  return {
    [`flags.${SYSTEM_ID}.gmSituation.kind`]: kind,
    [`flags.${SYSTEM_ID}.gmSituation.situationId`]: situation.id ?? "",
    [`flags.${SYSTEM_ID}.gmSituation.seed`]: situation.seed ?? "",
    [`flags.${SYSTEM_ID}.gmSituation.title`]: situation.title ?? "",
    [`flags.${SYSTEM_ID}.gmSituation.mode`]: situation.reroll?.mode ?? "fresh",
    [`flags.${SYSTEM_ID}.gmSituation.previousSeed`]: situation.reroll?.previousSeed ?? "",
    [`flags.${SYSTEM_ID}.gmSituation.updatedAt`]: nowIso(),
  };
}

function situationSceneKitFlagObject(kind, situation = {}) {
  return {
    [SYSTEM_ID]: {
      gmSituationKit: {
        kind,
        situationId: situation.id ?? "",
        seed: situation.seed ?? "",
        title: situation.title ?? "",
        kitName: situationSceneKitName(situation),
        updatedAt: nowIso(),
      },
    },
  };
}

function situationSceneKitFlagPatch(kind, situation = {}) {
  return {
    [`flags.${SYSTEM_ID}.gmSituationKit.kind`]: kind,
    [`flags.${SYSTEM_ID}.gmSituationKit.situationId`]: situation.id ?? "",
    [`flags.${SYSTEM_ID}.gmSituationKit.seed`]: situation.seed ?? "",
    [`flags.${SYSTEM_ID}.gmSituationKit.title`]: situation.title ?? "",
    [`flags.${SYSTEM_ID}.gmSituationKit.kitName`]: situationSceneKitName(situation),
    [`flags.${SYSTEM_ID}.gmSituationKit.updatedAt`]: nowIso(),
  };
}

function situationSceneKitFolderName(situation = {}, label = "") {
  return `${situationSceneKitName(situation)} - ${label || "Kit"}`.slice(0, 96);
}

function findSituationSceneKitFolder(documentType = "", kind = "", situation = {}) {
  const wantedSeed = String(situation.seed ?? "").trim();
  const wantedId = String(situation.id ?? "").trim();
  const name = situationSceneKitFolderName(situation, kind);
  return situationCollectionValues(game.folders)
    .find(folder => {
      if (folder?.type !== documentType) return false;
      const flag = situationFlagValue(folder, "gmSituationKit") ?? {};
      if (flag.kind !== kind) return false;
      return (wantedSeed && flag.seed === wantedSeed)
        || (wantedId && flag.situationId === wantedId)
        || folder.name === name;
    }) ?? null;
}

async function upsertSituationSceneKitFolder(spec = {}, situation = {}) {
  if (!globalThis.Folder?.create) throw new Error("Folder API is unavailable.");
  const kind = spec.id;
  const name = situationSceneKitFolderName(situation, spec.label);
  let folder = findSituationSceneKitFolder(spec.documentType, kind, situation);
  let status = "created";
  if (folder?.update) {
    await folder.update({
      name,
      ...situationSceneKitFlagPatch(kind, situation),
    });
    status = "updated";
  } else {
    folder = await Folder.create({
      name,
      type: spec.documentType,
      flags: situationSceneKitFlagObject(kind, situation),
    }, { renderSheet: false });
  }
  return { ...spec, folder, status };
}

async function upsertSituationSceneKitFolders(situation = {}) {
  const rows = [];
  for (const spec of SITUATION_SCENE_KIT_FOLDER_TYPES) {
    rows.push(await upsertSituationSceneKitFolder(spec, situation));
  }
  return Object.fromEntries(rows.map(row => [row.id, row]));
}

function findSituationSceneKitJournal(situation = {}) {
  const wantedSeed = String(situation.seed ?? "").trim();
  const wantedId = String(situation.id ?? "").trim();
  return situationCollectionValues(game.journal)
    .find(journal => {
      const flag = situationFlagValue(journal, "gmSituationKit") ?? {};
      if (flag.kind !== "journal") return false;
      return (wantedSeed && flag.seed === wantedSeed) || (wantedId && flag.situationId === wantedId);
    }) ?? null;
}

function findSituationMaterializedActor(type, kind, situation = {}, fallbackName = "") {
  const wantedSeed = String(situation.seed ?? "").trim();
  const wantedId = String(situation.id ?? "").trim();
  const actor = game.actors?.find(candidate => {
    if (candidate.type !== type) return false;
    const flag = candidate.getFlag?.(SYSTEM_ID, "gmSituation") ?? {};
    if (flag.kind !== kind) return false;
    return (wantedSeed && flag.seed === wantedSeed) || (wantedId && flag.situationId === wantedId);
  });
  return actor ?? findWorldActorByTypeAndName(type, fallbackName);
}

function situationMaterializeRows(result = {}) {
  return displaySituationRows(result.rows, 12);
}

function buildSituationMaterializeResult(title, rows = []) {
  return {
    title,
    rows: situationMaterializeRows({ rows }),
    createdAt: nowIso(),
  };
}

function situationPreferredSettlement(situation = {}) {
  const labelCandidates = [
    situation.options?.label,
    situation.map?.nearestSettlement,
    situation.map?.settlement,
    situation.map?.label,
    FIRST_SESSION_TARGET_REGION,
  ].filter(Boolean);
  for (const label of labelCandidates) {
    const settlement = findSettlementByName(label);
    if (settlement) return settlement;
  }
  return getSettlements()[0] ?? null;
}

function situationPreferredPoi(situation = {}) {
  const labels = [situation.map?.label, situation.options?.label].filter(Boolean);
  for (const label of labels) {
    const poi = findWorldActorByTypeAndName("poi", label);
    if (poi) return poi;
  }
  return null;
}

function situationRewardText(situation = {}) {
  const rewardRows = Array.isArray(situation.rewardRows) ? situation.rewardRows : [];
  const values = rewardRows.map(row => [row.value, row.note].filter(Boolean).join(" - ")).filter(Boolean);
  if (values.length) return values.slice(0, 3).join("; ");
  const tier = Math.max(1, Math.min(10, Number(situation.tier) || 1));
  return `${tier * 10} silver, loot rights, local reputation`;
}

function situationQuestName(situation = {}) {
  const questRow = Array.isArray(situation.questRows) ? situation.questRows[0] : null;
  return `GM Quest: ${compactSituationText(questRow?.value || situation.title || situation.map?.label || "Generated hook", 58)}`;
}

function buildSituationQuestDraftData(situation = {}) {
  const settlement = situationPreferredSettlement(situation);
  const poi = situationPreferredPoi(situation);
  const placement = firstSessionPlacementInfo(poi ?? settlement);
  const questRow = Array.isArray(situation.questRows) ? situation.questRows[0] : null;
  const consequenceRows = (situation.consequenceRows ?? []).map(row => [row.label, row.value, row.note].filter(Boolean).join(": "));
  const skillRows = (situation.skillRows ?? []).map(row => [row.label, row.value, row.note].filter(Boolean).join(": "));
  const notes = [
    situation.hook || situation.summary || "",
    ...consequenceRows.slice(0, 3),
    ...skillRows.slice(0, 3),
  ].filter(Boolean).join("\n");
  const tier = Math.max(1, Math.min(10, Number(situation.tier) || 1));
  return {
    name: situationQuestName(situation),
    type: "quest",
    flags: situationMaterializeFlagObject("quest", situation),
    system: {
      info: {
        questType: situation.kind || "world",
        status: "active",
        region: FIRST_SESSION_TARGET_REGION,
        issuer: "GM Situation Generator",
        targetSettlement: settlement?.name ?? "",
        targetPOI: poi?.name ?? situation.map?.label ?? "",
        settlementId: settlement?.id ?? "",
        targetPOIId: poi?.id ?? "",
        targetFaction: "",
        difficulty: tier,
        reward: situationRewardText(situation),
        dueText: "",
        ...placement,
      },
      description: {
        summary: situation.summary || situation.hook || situation.title || "",
        objective: questRow?.value || situation.hook || "Resolve the generated situation.",
        notes,
      },
      chain: {
        chainId: "gm-situation-generator",
        arcType: "generated",
        arcState: situation.reroll?.mode === "refresh" ? "aftermath" : "active",
        step: 1,
        maxStep: 1,
        nextQuestType: "",
        autoGenerateNext: false,
      },
      requirements: {
        minSettlementRep: 0,
        minFactionRep: 0,
        requiredCharacter: "",
        requiredQuestStatus: "",
      },
      rewards: {
        silver: tier * 10,
        settlementRep: situation.kind === "social" || situation.kind === "trade" ? 2 : 1,
        factionRep: 0,
        rewardCharacter: "",
        rewardItemName: "",
        rewardItemType: "",
        rewardItemQuantity: 0,
        granted: false,
      },
      effects: {
        success: {
          prosperity: situation.kind === "trade" ? 1 : 0,
          danger: situation.kind === "danger" || situation.kind === "encounter" ? -1 : 0,
          supply: situation.kind === "loot" || situation.kind === "craft" ? 1 : 0,
          stability: 1,
          militiaPower: 0,
          tradeBalance: situation.kind === "trade" ? 1 : 0,
          caravanTraffic: situation.kind === "transition" ? 1 : 0,
          removeTargetPOI: false,
          resolveCrisis: false,
        },
        failure: {
          prosperity: 0,
          danger: situation.kind === "danger" || situation.kind === "encounter" ? 1 : 0,
          supply: situation.kind === "loot" ? -1 : 0,
          stability: -1,
          militiaPower: 0,
          tradeBalance: 0,
          caravanTraffic: 0,
          empowerTargetPOI: false,
        },
      },
    },
  };
}

function buildSituationQuestDraftPatch(situation = {}) {
  const data = buildSituationQuestDraftData(situation);
  return {
    name: data.name,
    "system.info.questType": data.system.info.questType,
    "system.info.status": data.system.info.status,
    "system.info.region": data.system.info.region,
    "system.info.issuer": data.system.info.issuer,
    "system.info.targetSettlement": data.system.info.targetSettlement,
    "system.info.targetPOI": data.system.info.targetPOI,
    "system.info.settlementId": data.system.info.settlementId,
    "system.info.targetPOIId": data.system.info.targetPOIId,
    "system.info.targetFaction": data.system.info.targetFaction,
    "system.info.difficulty": data.system.info.difficulty,
    "system.info.reward": data.system.info.reward,
    "system.info.dueText": data.system.info.dueText,
    "system.description.summary": data.system.description.summary,
    "system.description.objective": data.system.description.objective,
    "system.description.notes": data.system.description.notes,
    "system.chain.chainId": data.system.chain.chainId,
    "system.chain.arcType": data.system.chain.arcType,
    "system.chain.arcState": data.system.chain.arcState,
    "system.rewards.silver": data.system.rewards.silver,
    "system.rewards.settlementRep": data.system.rewards.settlementRep,
    "system.rewards.factionRep": data.system.rewards.factionRep,
    "system.effects.success.prosperity": data.system.effects.success.prosperity,
    "system.effects.success.danger": data.system.effects.success.danger,
    "system.effects.success.supply": data.system.effects.success.supply,
    "system.effects.success.stability": data.system.effects.success.stability,
    "system.effects.success.militiaPower": data.system.effects.success.militiaPower,
    "system.effects.success.tradeBalance": data.system.effects.success.tradeBalance,
    "system.effects.success.caravanTraffic": data.system.effects.success.caravanTraffic,
    "system.effects.success.removeTargetPOI": data.system.effects.success.removeTargetPOI,
    "system.effects.success.resolveCrisis": data.system.effects.success.resolveCrisis,
    "system.effects.failure.prosperity": data.system.effects.failure.prosperity,
    "system.effects.failure.danger": data.system.effects.failure.danger,
    "system.effects.failure.supply": data.system.effects.failure.supply,
    "system.effects.failure.stability": data.system.effects.failure.stability,
    "system.effects.failure.militiaPower": data.system.effects.failure.militiaPower,
    "system.effects.failure.tradeBalance": data.system.effects.failure.tradeBalance,
    "system.effects.failure.caravanTraffic": data.system.effects.failure.caravanTraffic,
    "system.effects.failure.empowerTargetPOI": data.system.effects.failure.empowerTargetPOI,
    ...firstSessionPlacementPatch("system.info", data.system.info),
    ...situationMaterializeFlagPatch("quest", situation),
  };
}

function buildSituationRumorText(situation = {}) {
  const rumorRows = Array.isArray(situation.rumorRows) ? situation.rumorRows : [];
  const row = rumorRows[0];
  const title = row?.value || situation.title || situation.map?.label || "generated trouble";
  const detail = row?.note || situation.hook || situation.summary || "";
  const mode = situation.reroll?.mode === "refresh" ? "Aftermath" : "Rumor";
  return `[${mode}] ${title}${detail ? ` - ${compactSituationText(detail, 180)}` : ""}`;
}

function containerThemeForSituation(situation = {}) {
  const kind = String(situation.kind ?? "").trim();
  const terrain = String(situation.terrain ?? "").trim();
  const label = `${situation.map?.label ?? ""} ${situation.title ?? ""}`.toLowerCase();
  if (label.includes("healer") || label.includes("apothecary") || label.includes("herb")) return "alchemy";
  if (kind === "trade" || kind === "craft" || label.includes("market") || label.includes("forge") || label.includes("blacksmith")) return "military";
  if (terrain === "forest" || terrain === "swamp") return "hunter";
  if (terrain === "mine" || terrain === "dungeon" || terrain === "ruins") return "ruins";
  if (kind === "danger" || kind === "encounter") return "bandit";
  return "hunter";
}

function buildSituationContainerData(situation = {}) {
  const tier = Math.max(1, Math.min(10, Number(situation.tier) || 1));
  const theme = containerThemeForSituation(situation);
  return {
    name: `GM Loot: ${compactSituationText(situation.title || situation.map?.label || theme, 54)}`,
    type: "container",
    flags: situationMaterializeFlagObject("container", situation),
    system: {
      info: {
        theme,
        tier,
        lockDifficulty: Math.max(0, tier - 1),
        danger: Math.max(0, tier + (situation.kind === "danger" ? 1 : 0)),
        sourceSituation: situation.title ?? "",
      },
    },
  };
}

function buildSituationNpcDrafts(situation = {}) {
  const tier = Math.max(1, Math.min(10, Number(situation.tier) || 1));
  const rows = (Array.isArray(situation.actorRows) ? situation.actorRows : [])
    .filter(row => String(row?.actorKind ?? "") === "npc")
    .slice(0, 4);
  if (!rows.length) {
    rows.push(situationRow("NPC", situation.map?.label || situation.title || "Local witness", "Fallback NPC for a generated situation.", "is-road", {
      role: SITUATION_COCKPIT_ROLE_BY_KIND[situation.kind] ?? "villager",
    }));
  }
  return rows.map((row, index) => {
    const role = String(row.role || SITUATION_COCKPIT_ROLE_BY_KIND[situation.kind] || "villager").trim();
    const name = `${compactSituationText(row.value || row.label || "NPC", 42)} (${compactSituationText(situation.map?.label || situation.title || "GM", 24)})`;
    const doc = buildNpcActorData(role, tier, "", { name });
    doc.data.flags = situationMaterializeFlagObject(`npc-${index + 1}`, situation);
    doc.data.system.info = {
      ...(doc.data.system.info ?? {}),
      region: FIRST_SESSION_TARGET_REGION,
      location: situation.map?.label ?? "",
      homeLocation: situation.map?.label ?? "",
      sceneRole: row.label ?? "",
      desc: [situation.hook, row.note].filter(Boolean).join(" "),
    };
    return { row, doc };
  });
}

function buildSituationMaterializeChatBody(result = {}) {
  const rows = situationMaterializeRows(result).map(row => [
    row.label || "Result",
    [row.value, row.note].filter(Boolean).join(" - "),
  ]);
  return buildWorldReportRows(rows);
}

function situationCollectionValues(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (typeof collection.values === "function") return Array.from(collection.values());
  if (Array.isArray(collection.contents)) return collection.contents;
  return Object.values(collection).filter(Boolean);
}

function situationFlagValue(document, key) {
  return document?.getFlag?.(SYSTEM_ID, key) ?? document?.flags?.[SYSTEM_ID]?.[key] ?? null;
}

function situationSceneName(situation = {}) {
  return `IH Scene - ${compactSituationText(situation.title || situation.map?.label || "Generated", 70)}`;
}

function situationSceneFlagObject(situation = {}) {
  return {
    [SYSTEM_ID]: {
      gmSituationScene: {
        situationId: situation.id ?? "",
        seed: situation.seed ?? "",
        title: situation.title ?? "",
        mapLabel: situation.map?.label ?? "",
        mapLevel: canonicalSituationWorldMapLevel(situation.map?.level),
        rawMapLevel: situation.map?.level ?? "",
        descriptionHtml: buildSituationSceneDescriptionHtml(situation),
        navigationRows: buildSituationNavigationRows(situation),
        updatedAt: nowIso(),
      },
    },
  };
}

function situationSceneFlagPatch(situation = {}) {
  return {
    [`flags.${SYSTEM_ID}.gmSituationScene.situationId`]: situation.id ?? "",
    [`flags.${SYSTEM_ID}.gmSituationScene.seed`]: situation.seed ?? "",
    [`flags.${SYSTEM_ID}.gmSituationScene.title`]: situation.title ?? "",
    [`flags.${SYSTEM_ID}.gmSituationScene.mapLabel`]: situation.map?.label ?? "",
    [`flags.${SYSTEM_ID}.gmSituationScene.mapLevel`]: canonicalSituationWorldMapLevel(situation.map?.level),
    [`flags.${SYSTEM_ID}.gmSituationScene.rawMapLevel`]: situation.map?.level ?? "",
    [`flags.${SYSTEM_ID}.gmSituationScene.descriptionHtml`]: buildSituationSceneDescriptionHtml(situation),
    [`flags.${SYSTEM_ID}.gmSituationScene.navigationRows`]: buildSituationNavigationRows(situation),
    [`flags.${SYSTEM_ID}.gmSituationScene.updatedAt`]: nowIso(),
  };
}

function findSituationScene(situation = {}) {
  const wantedId = String(situation.id ?? "").trim();
  const wantedSeed = String(situation.seed ?? "").trim();
  const name = situationSceneName(situation);
  return game.scenes?.find(scene => {
    const flag = situationFlagValue(scene, "gmSituationScene") ?? {};
    return (wantedSeed && flag.seed === wantedSeed)
      || (wantedId && flag.situationId === wantedId)
      || scene.name === name;
  }) ?? null;
}

function buildSituationSceneData(situation = {}) {
  const asset = String(situation.map?.asset ?? "").trim();
  const level = String(situation.map?.level ?? "").trim();
  const isWide = level === "global" || level === "region" || level === "local";
  const width = isWide ? 3200 : 2400;
  const height = isWide ? 2000 : 1500;
  const data = {
    name: situationSceneName(situation),
    active: false,
    navigation: false,
    width,
    height,
    padding: 0.08,
    backgroundColor: "#111413",
    grid: {
      type: 1,
      size: 100,
      color: "#6f5a34",
      alpha: 0.22,
      distance: 5,
      units: "ft",
    },
    flags: situationSceneFlagObject(situation),
  };
  if (asset) data.background = { src: asset };
  return data;
}

function drawingColorsForTone(tone = "") {
  const key = String(tone ?? "").trim();
  if (key === "is-danger") return { stroke: "#d65757", fill: "#3a1111" };
  if (key === "is-gold") return { stroke: "#f2d59d", fill: "#3a2b12" };
  if (key === "is-active") return { stroke: "#9dc4d2", fill: "#102a33" };
  if (key === "is-safe") return { stroke: "#80dc94", fill: "#102a18" };
  return { stroke: "#789384", fill: "#111c18" };
}

function situationDrawingMarkerId(row = {}, index = 0) {
  return [
    row.sceneLayer,
    row.markerKind,
    row.action,
    row.id,
    row.label,
    index,
  ].filter(Boolean).join("-")
    .replace(/[^a-zA-Z0-9а-яА-Я_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || `marker-${index}`;
}

function situationDrawingData(scene, situation = {}, row = {}, index = 0) {
  const width = Number(scene?.width ?? 2400) || 2400;
  const height = Number(scene?.height ?? 1500) || 1500;
  const pct = (value, fallback) => Math.max(0, Math.min(100, Number(value ?? fallback) || fallback));
  const w = Math.max(90, Math.round(width * pct(row.w, 12) / 100));
  const h = Math.max(56, Math.round(height * pct(row.h, 8) / 100));
  const x = Math.round(width * pct(row.x, 50) / 100 - w / 2);
  const y = Math.round(height * pct(row.y, 50) / 100 - h / 2);
  const markerId = situationDrawingMarkerId(row, index);
  const colors = drawingColorsForTone(row.tone);
  return {
    x,
    y,
    shape: { type: "r", width: w, height: h },
    strokeColor: colors.stroke,
    strokeWidth: 3,
    fillColor: colors.fill,
    fillAlpha: 0.22,
    text: `${row.label || "Marker"}\n${row.value || row.action || ""}`.trim(),
    fontSize: 24,
    textColor: "#f5ead6",
    locked: false,
    hidden: false,
    flags: {
      [SYSTEM_ID]: {
        gmSituationDrawing: {
          markerId,
          situationId: situation.id ?? "",
          seed: situation.seed ?? "",
          action: row.action ?? "",
          layer: row.sceneLayer ?? "",
          note: row.note ?? "",
          updatedAt: nowIso(),
        },
      },
    },
  };
}

function findSituationSceneKitJournalPage(journal) {
  const pages = situationCollectionValues(journal?.pages);
  return pages.find(page => {
    const flag = situationFlagValue(page, SITUATION_SCENE_PREP_PAGE_FLAG) ?? {};
    return Boolean(flag.id) || page?.name === SITUATION_SCENE_RUNBOOK_PAGE_NAME;
  }) ?? pages.find(page => page?.type === "text") ?? null;
}

function situationNoteMarkerId(row = {}, index = 0) {
  return [
    "note",
    row.sceneLayer,
    row.markerKind,
    row.action,
    row.id,
    row.label,
    index,
  ].filter(Boolean).join("-")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || `note-${index}`;
}

function situationSceneNoteFlagObject(noteKey = "", situation = {}, data = {}) {
  return {
    [SYSTEM_ID]: {
      gmSituationNote: {
        noteKey,
        situationId: situation.id ?? "",
        seed: situation.seed ?? "",
        title: situation.title ?? "",
        markerKind: data.markerKind ?? "",
        sceneLayer: data.sceneLayer ?? "",
        action: data.action ?? "",
        navLevel: data.navLevel ?? "",
        navAction: data.navAction ?? "",
        anchor: data.anchor ?? "",
        note: data.note ?? "",
        plannedX: Number(data.plannedX ?? 0),
        plannedY: Number(data.plannedY ?? 0),
        plannedAt: nowIso(),
      },
    },
  };
}

function situationSceneNoteFlagPatch(noteKey = "", situation = {}, data = {}, { updatePlan = true } = {}) {
  const patch = {
    [`flags.${SYSTEM_ID}.gmSituationNote.noteKey`]: noteKey,
    [`flags.${SYSTEM_ID}.gmSituationNote.situationId`]: situation.id ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.seed`]: situation.seed ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.title`]: situation.title ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.markerKind`]: data.markerKind ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.sceneLayer`]: data.sceneLayer ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.action`]: data.action ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.navLevel`]: data.navLevel ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.navAction`]: data.navAction ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.anchor`]: data.anchor ?? "",
    [`flags.${SYSTEM_ID}.gmSituationNote.note`]: data.note ?? "",
  };
  if (updatePlan) {
    patch[`flags.${SYSTEM_ID}.gmSituationNote.plannedX`] = Number(data.plannedX ?? 0);
    patch[`flags.${SYSTEM_ID}.gmSituationNote.plannedY`] = Number(data.plannedY ?? 0);
    patch[`flags.${SYSTEM_ID}.gmSituationNote.plannedAt`] = nowIso();
  }
  return patch;
}

function findSituationSceneNote(scene, noteKey = "", situation = {}) {
  const wantedKey = String(noteKey ?? "").trim();
  const wantedSeed = String(situation.seed ?? "").trim();
  const wantedId = String(situation.id ?? "").trim();
  if (!wantedKey) return null;
  return situationCollectionValues(scene?.notes)
    .find(note => {
      const flag = situationFlagValue(note, "gmSituationNote") ?? {};
      if (flag.noteKey !== wantedKey) return false;
      return (wantedSeed && flag.seed === wantedSeed) || (wantedId && flag.situationId === wantedId);
    }) ?? null;
}

function situationSceneNoteWasMovedFromPlan(note, scene = null) {
  const flag = situationFlagValue(note, "gmSituationNote") ?? {};
  const plannedX = Number(flag.plannedX);
  const plannedY = Number(flag.plannedY);
  if (!Number.isFinite(plannedX) || !Number.isFinite(plannedY)) return false;
  const x = Number(note?.x ?? note?.document?.x ?? 0);
  const y = Number(note?.y ?? note?.document?.y ?? 0);
  const gridSize = Number(scene?.grid?.size ?? scene?.grid?.distance ?? 100) || 100;
  const tolerance = Math.max(8, gridSize * 0.15);
  return Math.abs(x - plannedX) > tolerance || Math.abs(y - plannedY) > tolerance;
}

function noteFallbackPercent(row = {}, axis = "x") {
  const markerKind = String(row.markerKind ?? "").trim();
  if (axis === "x") {
    if (markerKind === "entry") return 12;
    if (markerKind === "exit" || markerKind === "transition") return 88;
    if (markerKind === "monster") return 68;
    if (markerKind === "npc") return 46;
    if (markerKind === "loot" || markerKind === "cache") return 54;
    if (markerKind === "clue" || markerKind === "skill") return 48;
    return 50;
  }
  if (markerKind === "entry" || markerKind === "exit" || markerKind === "transition") return 52;
  if (markerKind === "monster") return 44;
  if (markerKind === "npc") return 48;
  if (markerKind === "loot" || markerKind === "cache") return 58;
  if (markerKind === "clue" || markerKind === "skill") return 52;
  return 50;
}

function situationSceneNoteIcon(markerKind = "") {
  return SITUATION_SCENE_NOTE_ICONS[String(markerKind ?? "").trim()] ?? "icons/svg/book.svg";
}

function situationSceneNoteText(row = {}) {
  const label = compactSituationText(row.label || row.markerKind || "Scene note", 34);
  const value = compactSituationText(row.value || row.action || row.anchor || "", 34);
  return value ? `${label}: ${value}` : label;
}

function supplementalSkillNoteRows(situation = {}) {
  const rows = Array.isArray(situation.skillRows) ? situation.skillRows : [];
  return rows.slice(0, 4).map((row, index) => situationRow(
    row.label || `Skill check ${index + 1}`,
    row.value || "skill check",
    row.note || "GM-facing reveal condition.",
    row.tone || "is-active",
    {
      markerKind: "skill",
      sceneLayer: "clue",
      action: "skill-check",
      x: 42 + index * 5,
      y: 64 + (index % 2) * 6,
      w: 8,
      h: 8,
      anchor: row.label || "skill reveal",
    },
  ));
}

function situationSceneNoteRows(situation = {}) {
  const markerKinds = new Set(SITUATION_SCENE_NOTE_MARKER_KINDS);
  const primaryRows = Array.isArray(situation.sceneHotspotRows) && situation.sceneHotspotRows.length
    ? situation.sceneHotspotRows
    : (Array.isArray(situation.sceneBlueprintRows) ? situation.sceneBlueprintRows : []);
  const rows = [
    ...primaryRows,
    ...supplementalSkillNoteRows(situation),
  ];
  const seen = new Set();
  return rows
    .filter(row => markerKinds.has(String(row?.markerKind ?? "").trim()))
    .filter(row => {
      const key = situationNoteMarkerId(row, seen.size);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 24);
}

function situationSceneNoteData(scene, situation = {}, journal, row = {}, index = 0) {
  const page = findSituationSceneKitJournalPage(journal);
  const x = pctSceneCoord(scene, row, "x", noteFallbackPercent(row, "x"));
  const y = pctSceneCoord(scene, row, "y", noteFallbackPercent(row, "y"));
  const noteKey = situationNoteMarkerId(row, index);
  const flagData = {
    markerKind: row.markerKind ?? "",
    sceneLayer: row.sceneLayer ?? "",
    action: row.action ?? "",
    navLevel: row.markerKind === "entry"
      ? "local"
      : row.markerKind === "exit" || row.markerKind === "transition"
        ? (canonicalSituationWorldMapLevel(situation.map?.level) === "encounter" ? "local" : "region")
        : "",
    navAction: row.markerKind === "entry"
      ? "entry"
      : row.markerKind === "exit" || row.markerKind === "transition"
        ? "exit"
        : "",
    anchor: row.anchor ?? row.label ?? "",
    note: row.note ?? "",
    plannedX: x,
    plannedY: y,
  };
  return {
    entryId: journal?.id ?? "",
    pageId: page?.id ?? "",
    x,
    y,
    text: situationSceneNoteText(row),
    icon: situationSceneNoteIcon(row.markerKind),
    iconSize: row.markerKind === "entry" || row.markerKind === "exit" || row.markerKind === "transition" ? 44 : 36,
    fontSize: 22,
    textAnchor: 1,
    textColor: drawingColorsForTone(row.tone).stroke,
    flags: situationSceneNoteFlagObject(noteKey, situation, flagData),
    _ihNoteKey: noteKey,
    _ihFlagData: flagData,
  };
}

async function upsertSituationSceneNotes(scene, situation = {}, journal = null) {
  if (!scene?.createEmbeddedDocuments || !journal?.id) {
    return { created: 0, updated: 0, preserved: 0, skipped: 0, missingJournal: journal?.id ? 0 : 1, rows: [] };
  }
  const rows = situationSceneNoteRows(situation);
  const reports = [];
  let created = 0;
  let updated = 0;
  let preserved = 0;
  let skipped = 0;

  for (const [index, row] of rows.entries()) {
    const data = situationSceneNoteData(scene, situation, journal, row, index);
    const noteKey = data._ihNoteKey;
    const flagData = data._ihFlagData;
    delete data._ihNoteKey;
    delete data._ihFlagData;

    const existing = findSituationSceneNote(scene, noteKey, situation);
    if (existing?.update) {
      const moved = situationSceneNoteWasMovedFromPlan(existing, scene);
      const patch = {
        entryId: data.entryId,
        pageId: data.pageId,
        text: data.text,
        icon: data.icon,
        iconSize: data.iconSize,
        fontSize: data.fontSize,
        textAnchor: data.textAnchor,
        textColor: data.textColor,
        ...situationSceneNoteFlagPatch(noteKey, situation, flagData, { updatePlan: !moved }),
      };
      if (!moved) {
        patch.x = data.x;
        patch.y = data.y;
      }
      await existing.update(patch);
      if (moved) {
        preserved += 1;
        reports.push({ row, note: existing, status: "manual-preserved" });
      } else {
        updated += 1;
        reports.push({ row, note: existing, status: "updated" });
      }
      continue;
    }

    const createdDocs = await scene.createEmbeddedDocuments("Note", [data]);
    const note = createdDocs?.[0] ?? null;
    if (note) {
      created += 1;
      reports.push({ row, note, status: "created" });
    } else {
      skipped += 1;
      reports.push({ row, status: "skipped" });
    }
  }

  return { created, updated, preserved, skipped, missingJournal: 0, rows: reports };
}

function situationSceneTransitionRows(scene = globalThis.canvas?.scene ?? null) {
  const sceneFlag = situationFlagValue(scene, "gmSituationScene") ?? {};
  const notes = situationCollectionValues(scene?.notes);
  return notes
    .map(note => {
      const flag = situationFlagValue(note, "gmSituationNote") ?? {};
      const markerKind = String(flag.markerKind ?? "").trim();
      const navAction = String(flag.navAction ?? "").trim();
      const isTransition = ["entry", "exit", "transition"].includes(markerKind) || ["entry", "exit", "transition"].includes(navAction);
      if (!isTransition) return null;
      const navLevel = canonicalSituationWorldMapLevel(flag.navLevel || sceneFlag.mapLevel || sceneFlag.rawMapLevel || "encounter");
      const label = String(note?.text ?? "").trim() || String(flag.anchor ?? "").trim() || markerKind || "Scene transition";
      const detail = String(flag.note ?? sceneFlag.title ?? sceneFlag.mapLabel ?? "").trim();
      return {
        id: note.id ?? "",
        uuid: note.uuid ?? "",
        sceneId: scene?.id ?? "",
        sceneUuid: scene?.uuid ?? "",
        sceneName: scene?.name ?? "",
        situationId: flag.situationId || sceneFlag.situationId || "",
        seed: flag.seed || sceneFlag.seed || "",
        title: flag.title || sceneFlag.title || scene?.name || "",
        mapLabel: sceneFlag.mapLabel || flag.title || scene?.name || "",
        markerKind,
        navAction: navAction || markerKind || "transition",
        navLevel,
        rawMapLevel: sceneFlag.rawMapLevel || sceneFlag.mapLevel || navLevel,
        label: compactSituationText(label, 64),
        value: `${navAction || markerKind || "transition"} -> ${situationWorldMapLevelLabel(navLevel)}`,
        note: detail,
        tone: markerKind === "entry" ? "is-road" : markerKind === "exit" || markerKind === "transition" ? "is-warn" : "is-active",
        x: Number(note?.x ?? 0) || 0,
        y: Number(note?.y ?? 0) || 0,
        plannedX: Number(flag.plannedX ?? note?.x ?? 0) || 0,
        plannedY: Number(flag.plannedY ?? note?.y ?? 0) || 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const order = { entry: 1, transition: 2, exit: 3 };
      return (order[a.markerKind] ?? 9) - (order[b.markerKind] ?? 9) || a.label.localeCompare(b.label);
    });
}

function sceneTransitionDataset(row = {}, action = "open-map") {
  return [
    `data-ih-scene-transition-action="${escapeCombatHtml(action)}"`,
    `data-scene-id="${escapeCombatHtml(row.sceneId)}"`,
    `data-note-id="${escapeCombatHtml(row.id)}"`,
    `data-nav-level="${escapeCombatHtml(row.navLevel)}"`,
    `data-nav-action="${escapeCombatHtml(row.navAction)}"`,
  ].join(" ");
}

function buildSceneTransitionPanelHtml(scene, transitions = []) {
  if (!transitions.length) {
    return `
      <div class="ih-scene-transition-panel">
        <p>No generated entry/exit/transition pins were found on the active scene.</p>
      </div>`;
  }
  const rows = transitions.map(row => `
    <div class="ih-scene-transition-row ${escapeCombatHtml(row.tone)}">
      <div>
        <strong>${escapeCombatHtml(row.label)}</strong>
        <span>${escapeCombatHtml(row.value)}</span>
        ${row.note ? `<em>${escapeCombatHtml(row.note)}</em>` : ""}
      </div>
      <div class="ih-scene-transition-actions">
        <button type="button" ${sceneTransitionDataset(row, "focus-note")}>Focus</button>
        <button type="button" ${sceneTransitionDataset(row, "open-map")}>Map</button>
        <button type="button" ${sceneTransitionDataset(row, "follow-up")}>Follow-up</button>
      </div>
    </div>`).join("");
  return `
    <div class="ih-scene-transition-panel">
      <header>
        <strong>${escapeCombatHtml(scene?.name ?? "Active scene")}</strong>
        <span>${transitions.length} transition pins</span>
      </header>
      ${rows}
    </div>`;
}

function sceneTransitionByIds(sceneId = "", noteId = "") {
  const wantedSceneId = String(sceneId ?? "").trim();
  const scene = wantedSceneId ? game.scenes?.get?.(wantedSceneId) ?? null : globalThis.canvas?.scene ?? null;
  const wantedNoteId = String(noteId ?? "").trim();
  const transitions = situationSceneTransitionRows(scene);
  const transition = wantedNoteId
    ? transitions.find(row => row.id === wantedNoteId) ?? null
    : transitions[0] ?? null;
  return { scene, transition, transitions };
}

function openSituationSceneTransitionMap(transition = {}) {
  if (!transition) {
    ui.notifications?.warn?.("Scene transition is unavailable.");
    return false;
  }
  const level = canonicalSituationWorldMapLevel(transition.navLevel || "region");
  const focus = {
    level,
    col: 5,
    row: 5,
    route: transition.navAction === "exit" || transition.markerKind === "exit",
    hotspotId: transition.navAction || transition.markerKind || "",
    label: transition.mapLabel || transition.title || transition.label || "Scene transition",
    rawLevel: transition.rawMapLevel || level,
  };
  const api = game.ironHills ?? {};
  if (typeof api.openWorldMapLevel === "function") {
    api.openWorldMapLevel(level, focus);
    return true;
  }
  if (typeof api.openWorldMap === "function") {
    api.openWorldMap(focus);
    return true;
  }
  ui.notifications?.warn?.("World Map is unavailable.");
  return false;
}

function focusSituationSceneTransitionNote(scene, transition = {}) {
  if (!scene || !transition) return false;
  if (globalThis.canvas?.scene?.id !== scene.id) {
    scene.activate?.();
    return true;
  }
  const x = Number(transition.x || transition.plannedX || 0);
  const y = Number(transition.y || transition.plannedY || 0);
  if (Number.isFinite(x) && Number.isFinite(y) && globalThis.canvas?.animatePan) {
    globalThis.canvas.animatePan({ x, y, scale: Math.max(0.7, Number(globalThis.canvas.stage?.scale?.x ?? 1) || 1) });
    return true;
  }
  return false;
}

function sceneTransitionFollowUpOptions(transition = {}, previous = null) {
  const navLevel = canonicalSituationWorldMapLevel(transition.navLevel || previous?.map?.level || "encounter");
  const navAction = String(transition.navAction || transition.markerKind || "transition").trim();
  const previousTerrain = previous?.terrain || "road";
  const kind = navAction === "entry"
    ? (navLevel === "encounter" ? "encounter" : "transition")
    : "transition";
  return normalizeSituationCockpitOptions({
    level: navLevel,
    terrain: previousTerrain,
    kind,
    tier: previous?.tier ?? 2,
    label: transition.mapLabel || transition.title || transition.label || "",
    rerollMode: "refresh",
    seedInput: "",
    seed: `gm:transition:${Date.now()}:${Math.floor(Math.random() * 1000000)}`,
  });
}

function findGmSituationRecordForTransition(transition = {}) {
  const state = getGmSituationState();
  const wantedSeed = String(transition.seed ?? "").trim();
  const wantedId = String(transition.situationId ?? "").trim();
  const record = Object.values(state.entries ?? {}).find(candidate => {
    const situation = candidate.situation ?? {};
    return (wantedSeed && situation.seed === wantedSeed) || (wantedId && situation.id === wantedId);
  });
  if (record) return record;
  if (!scene && !wantedSeed && !wantedId) return state.entries?.[state.activeId] ?? state.entries?.[state.selectedId] ?? null;
  return null;
}

async function createSituationFollowUpFromSceneTransition(transition = {}) {
  if (!game.user?.isGM) throw new Error("Only a GM can create scene transition follow-ups.");
  const previousRecord = findGmSituationRecordForTransition(transition);
  const previous = previousRecord?.situation?.hasSituation ? plainClone(previousRecord.situation) : null;
  const options = sceneTransitionFollowUpOptions(transition, previous);
  const context = buildSituationCockpitContext(options);
  const situation = decorateSituationCockpitReroll(buildWorldMapSituation(context), {
    mode: "refresh",
    previous,
    previousRecordId: previousRecord?.id ?? "",
  });
  if (previousRecord?.id) await updateGmSituationRecordStatus(previousRecord.id, "resolved");
  const { record } = await persistGmSituationRecord(situation, options, {
    previousRecord: previousRecord ? { id: previousRecord.id, title: previousRecord.title } : null,
    status: "active",
  });
  return { situation, options, record, previousRecord };
}

async function postSituationSceneTransitionPanel(scene = globalThis.canvas?.scene ?? null) {
  if (!scene) {
    ui.notifications?.warn?.("No active scene is available.");
    return { scene: null, transitions: [] };
  }
  const transitions = situationSceneTransitionRows(scene);
  await ChatMessage.create({
    content: buildCombatChatCard({
      title: "Scene transitions",
      subtitle: scene.name ?? "Active scene",
      icon: "MAP",
      status: transitions.length ? `${transitions.length} pins ready` : "No transition pins",
      statusClass: transitions.length ? "is-road" : "is-warn",
      rows: transitions.slice(0, 6).map(row => [row.label, row.value]),
      bodyHtml: buildSceneTransitionPanelHtml(scene, transitions),
      className: "ih-scene-transition-card",
    }),
    whisper: game.user?.isGM ? ChatMessage.getWhisperRecipients("GM") : undefined,
  });
  if (!transitions.length) ui.notifications?.warn?.("No generated scene transition pins found.");
  else ui.notifications?.info?.(`Scene transitions ready: ${transitions.length}`);
  return { scene, transitions };
}

function sceneKitFromUuidSync(uuid = "") {
  const value = String(uuid ?? "").trim();
  if (!value || typeof globalThis.fromUuidSync !== "function") return null;
  try {
    return globalThis.fromUuidSync(value) ?? null;
  } catch (_error) {
    return null;
  }
}

function resolveSceneKitQaScene(sceneOrId = null, situation = null) {
  if (sceneOrId && typeof sceneOrId !== "string") return sceneOrId;
  const sceneId = String(sceneOrId ?? "").trim();
  if (sceneId) {
    const byId = game.scenes?.get?.(sceneId) ?? null;
    if (byId) return byId;
    const byUuid = sceneKitFromUuidSync(sceneId);
    if (byUuid?.documentName === "Scene" || byUuid?.constructor?.documentName === "Scene") return byUuid;
  }
  const active = globalThis.canvas?.scene ?? null;
  if (!situation?.hasSituation) return active;
  const activeFlag = situationFlagValue(active, "gmSituationScene") ?? {};
  if (active && sceneKitFlagMatchesSituation(activeFlag, situation)) return active;
  const sceneUuid = String(situation.sceneKit?.sceneUuid ?? "").trim();
  const byUuid = sceneKitFromUuidSync(sceneUuid);
  if (byUuid?.documentName === "Scene" || byUuid?.constructor?.documentName === "Scene") return byUuid;
  return findSituationScene(situation) ?? active;
}

function sceneKitFlagMatchesSituation(flag = {}, situation = {}) {
  const wantedId = String(situation?.id ?? "").trim();
  const wantedSeed = String(situation?.seed ?? "").trim();
  const flagId = String(flag?.situationId ?? "").trim();
  const flagSeed = String(flag?.seed ?? "").trim();
  if (!wantedId && !wantedSeed) return true;
  return Boolean((wantedId && flagId === wantedId) || (wantedSeed && flagSeed === wantedSeed));
}

function sceneKitFlagMatchesIdentity(flag = {}, identity = {}) {
  const wantedId = String(identity?.situationId ?? "").trim();
  const wantedSeed = String(identity?.seed ?? "").trim();
  const flagId = String(flag?.situationId ?? "").trim();
  const flagSeed = String(flag?.seed ?? "").trim();
  if (!wantedId && !wantedSeed) return true;
  return Boolean((wantedId && flagId === wantedId) || (wantedSeed && flagSeed === wantedSeed));
}

function sceneKitDocumentFlag(document, flagKey = "") {
  const flag = situationFlagValue(document, flagKey);
  return flag && typeof flag === "object" ? flag : null;
}

function sceneKitGeneratedDocuments(scene, flagKey = "") {
  return situationCollectionValues(
    flagKey === "gmSituationDrawing"
      ? scene?.drawings
      : flagKey === "gmSituationNote"
        ? scene?.notes
        : scene?.tokens,
  ).map(document => ({
    document,
    flag: sceneKitDocumentFlag(document, flagKey),
  })).filter(row => row.flag);
}

function sceneKitDocumentBuckets(rows = [], identity = {}) {
  const mine = [];
  const foreign = [];
  for (const row of rows) {
    if (sceneKitFlagMatchesIdentity(row.flag, identity)) mine.push(row);
    else foreign.push(row);
  }
  return { mine, foreign };
}

function sceneKitNoteJournalMissing(note) {
  const entryId = String(note?.entryId ?? note?._source?.entryId ?? "").trim();
  if (!entryId) return true;
  return !game.journal?.get?.(entryId);
}

function sceneKitTokenActorInfo(token) {
  const actorId = String(token?.actorId ?? token?._source?.actorId ?? token?.actor?.id ?? "").trim();
  const actor = token?.actor ?? (actorId ? game.actors?.get?.(actorId) : null);
  return {
    actorId,
    hasActor: Boolean(actor),
    missing: Boolean(actorId && !actor),
    actorless: !actorId && !actor,
  };
}

function sceneKitTransitionNoteRows(noteRows = []) {
  return noteRows.filter(row => {
    const markerKind = String(row.flag?.markerKind ?? "").trim();
    const navAction = String(row.flag?.navAction ?? "").trim();
    return ["entry", "exit", "transition"].includes(markerKind)
      || ["entry", "exit", "transition"].includes(navAction);
  });
}

function sceneKitQaStatus(score = 0, blockerCount = 0, warningCount = 0) {
  if (blockerCount > 0) return { status: "blocked", label: "blocked", className: "is-danger" };
  if (warningCount > 0 || score < 85) return { status: "warn", label: "review", className: "is-warn" };
  return { status: "ready", label: "ready", className: "is-safe" };
}

function buildSceneKitQaSnapshot(sceneOrId = globalThis.canvas?.scene ?? null, situation = null) {
  const scene = resolveSceneKitQaScene(sceneOrId, situation);
  if (!scene) {
    return {
      scene: null,
      status: "blocked",
      statusLabel: "blocked",
      statusClass: "is-danger",
      score: 0,
      summary: {
        status: "blocked",
        statusLabel: "blocked",
        score: 0,
        sceneName: "No active scene",
        findings: 1,
        foreign: 0,
        validatedAt: nowIso(),
      },
      rows: [situationRow("Scene", "missing", "Open a scene or send the current kit to a scene first.", "is-danger")],
      findings: [situationRow("No scene", "blocked", "Scene kit QA needs an active or linked Scene.", "is-danger")],
    };
  }

  const sceneFlag = situationFlagValue(scene, "gmSituationScene") ?? {};
  const identity = {
    situationId: String(situation?.id ?? sceneFlag.situationId ?? "").trim(),
    seed: String(situation?.seed ?? sceneFlag.seed ?? "").trim(),
  };
  const sceneHasFlag = Boolean(sceneFlag.situationId || sceneFlag.seed || sceneFlag.title);
  const sceneMatches = !situation?.hasSituation || sceneKitFlagMatchesSituation(sceneFlag, situation);
  const drawingBuckets = sceneKitDocumentBuckets(sceneKitGeneratedDocuments(scene, "gmSituationDrawing"), identity);
  const noteBuckets = sceneKitDocumentBuckets(sceneKitGeneratedDocuments(scene, "gmSituationNote"), identity);
  const tokenBuckets = sceneKitDocumentBuckets(sceneKitGeneratedDocuments(scene, "gmSituationToken"), identity);
  const transitionRows = sceneKitTransitionNoteRows(noteBuckets.mine);
  const movedNotes = noteBuckets.mine.filter(row => situationSceneNoteWasMovedFromPlan(row.document, scene));
  const movedTokens = tokenBuckets.mine.filter(row => situationTokenWasMovedFromPlan(row.document, scene));
  const missingJournalLinks = noteBuckets.mine.filter(row => sceneKitNoteJournalMissing(row.document));
  const tokenActorRows = tokenBuckets.mine.map(row => ({ ...row, actorInfo: sceneKitTokenActorInfo(row.document) }));
  const missingActors = tokenActorRows.filter(row => row.actorInfo.missing);
  const actorlessTokens = tokenActorRows.filter(row => row.actorInfo.actorless);
  const journal = situation?.hasSituation ? findSituationSceneKitJournal(situation) : null;
  const foreign = drawingBuckets.foreign.length + noteBuckets.foreign.length + tokenBuckets.foreign.length;
  const matching = drawingBuckets.mine.length + noteBuckets.mine.length + tokenBuckets.mine.length;
  const generated = matching + foreign;
  const blockers = [];
  const warnings = [];

  if (situation?.hasSituation && !sceneMatches) {
    blockers.push(situationRow("Scene identity", "different situation", "Active scene flags do not match the selected GM situation.", "is-danger"));
  }
  if (!sceneHasFlag) {
    warnings.push(situationRow("Scene flag", "missing", "This scene was not marked as a generated Iron Hills situation scene.", "is-warn"));
  }
  if (!generated) {
    warnings.push(situationRow("Generated docs", "none", "No generated drawings, pins or tokens were found on this scene.", "is-warn"));
  }
  if (foreign) {
    warnings.push(situationRow("Foreign docs", String(foreign), "Generated objects from another situation are present; reported only, not removed.", "is-warn"));
  }
  if (situation?.hasSituation && !journal) {
    warnings.push(situationRow("Runbook journal", "missing", "Pins can exist, but their source runbook journal was not found by flags.", "is-warn"));
  }
  if (missingJournalLinks.length) {
    warnings.push(situationRow("Pin links", String(missingJournalLinks.length), "Some generated pins lost their journal entry link.", "is-warn"));
  }
  if (missingActors.length) {
    warnings.push(situationRow("Token actors", String(missingActors.length), "Some generated tokens point to actors that no longer exist.", "is-warn"));
  }
  if (actorlessTokens.length) {
    warnings.push(situationRow("Actorless tokens", String(actorlessTokens.length), "Some generated tokens have no actor id.", "is-warn"));
  }
  if (!transitionRows.length) {
    warnings.push(situationRow("Transitions", "none", "No entry/exit/transition pins were found.", "is-warn"));
  }

  const penalty = blockers.length * 35
    + warnings.length * 8
    + Math.min(18, foreign * 3)
    + Math.min(15, missingActors.length * 5)
    + Math.min(12, missingJournalLinks.length * 4);
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const status = sceneKitQaStatus(score, blockers.length, warnings.length);
  const rows = [
    situationRow("Scene", scene.name ?? "Scene", sceneHasFlag ? "generated scene flag present" : "no generated scene flag", sceneHasFlag ? "is-active" : "is-warn"),
    situationRow("Identity", identity.seed || identity.situationId || "unknown", sceneMatches ? "matches selected situation" : "does not match selected situation", sceneMatches ? "is-safe" : "is-danger"),
    situationRow("Markers", String(drawingBuckets.mine.length), `${drawingBuckets.foreign.length} foreign drawings`, drawingBuckets.foreign.length ? "is-warn" : "is-safe"),
    situationRow("Pins", String(noteBuckets.mine.length), `${transitionRows.length} transitions / ${movedNotes.length} manually moved / ${missingJournalLinks.length} broken links`, missingJournalLinks.length ? "is-warn" : "is-safe"),
    situationRow("Tokens", String(tokenBuckets.mine.length), `${movedTokens.length} manually moved / ${missingActors.length} missing actors / ${actorlessTokens.length} actorless`, missingActors.length || actorlessTokens.length ? "is-warn" : "is-safe"),
    situationRow("Manual edits", `${movedNotes.length + movedTokens.length} preserved`, "QA does not reposition or delete manually moved docs.", "is-safe"),
  ];
  const findings = [...blockers, ...warnings];
  const summary = {
    status: status.status,
    statusLabel: status.label,
    score,
    sceneId: scene.id ?? "",
    sceneUuid: scene.uuid ?? "",
    sceneName: scene.name ?? "",
    generated,
    matching,
    foreign,
    drawings: drawingBuckets.mine.length,
    pins: noteBuckets.mine.length,
    tokens: tokenBuckets.mine.length,
    transitions: transitionRows.length,
    moved: movedNotes.length + movedTokens.length,
    missingActors: missingActors.length,
    missingJournalLinks: missingJournalLinks.length,
    findings: findings.length,
    validatedAt: nowIso(),
  };

  return {
    scene,
    sceneFlag,
    identity,
    status: status.status,
    statusLabel: status.label,
    statusClass: status.className,
    score,
    summary,
    rows,
    findings,
    counts: {
      generated,
      matching,
      foreign,
      drawings: drawingBuckets.mine.length,
      pins: noteBuckets.mine.length,
      tokens: tokenBuckets.mine.length,
      transitions: transitionRows.length,
      movedNotes: movedNotes.length,
      movedTokens: movedTokens.length,
      missingActors: missingActors.length,
      actorlessTokens: actorlessTokens.length,
      missingJournalLinks: missingJournalLinks.length,
    },
  };
}

function buildSceneKitQaPanelHtml(snapshot = {}) {
  const rows = (snapshot.rows ?? []).map(row => `
    <div class="ih-scene-kit-qa-row ${escapeCombatHtml(row.tone)}">
      <strong>${escapeCombatHtml(row.label)}</strong>
      <span>${escapeCombatHtml(row.value)}</span>
      ${row.note ? `<em>${escapeCombatHtml(row.note)}</em>` : ""}
    </div>`).join("");
  const findings = (snapshot.findings ?? []).length
    ? (snapshot.findings ?? []).map(row => `
      <div class="ih-scene-kit-qa-finding ${escapeCombatHtml(row.tone)}">
        <strong>${escapeCombatHtml(row.label)}</strong>
        <span>${escapeCombatHtml(row.value)}</span>
        ${row.note ? `<em>${escapeCombatHtml(row.note)}</em>` : ""}
      </div>`).join("")
    : `<p class="ih-scene-kit-qa-empty">No blockers or warnings found.</p>`;
  return `
    <div class="ih-scene-kit-qa-panel">
      <header>
        <strong>${escapeCombatHtml(snapshot.summary?.sceneName || "Scene Kit QA")}</strong>
        <span>${escapeCombatHtml(snapshot.statusLabel || "review")} / ${Number(snapshot.score ?? 0)}%</span>
      </header>
      <section>${rows}</section>
      <section>
        <h4>Findings</h4>
        ${findings}
      </section>
    </div>`;
}

async function postSceneKitQaReport(sceneOrId = globalThis.canvas?.scene ?? null, situation = null) {
  const snapshot = buildSceneKitQaSnapshot(sceneOrId, situation);
  await ChatMessage.create({
    content: buildCombatChatCard({
      title: "Scene Kit QA",
      subtitle: snapshot.summary?.sceneName || "No active scene",
      icon: "QA",
      status: `${snapshot.statusLabel} / ${snapshot.score}%`,
      statusClass: snapshot.statusClass,
      rows: (snapshot.rows ?? []).slice(0, 6).map(row => [row.label, row.value]),
      bodyHtml: buildSceneKitQaPanelHtml(snapshot),
      className: "ih-scene-kit-qa-card",
    }),
    whisper: game.user?.isGM ? ChatMessage.getWhisperRecipients("GM") : undefined,
  });
  if (snapshot.status === "blocked") ui.notifications?.error?.("Scene Kit QA found blockers.");
  else if (snapshot.status === "warn") ui.notifications?.warn?.("Scene Kit QA found warnings.");
  else ui.notifications?.info?.("Scene Kit QA passed.");
  return snapshot;
}

function sceneKitFinalizeStatus(score = 0, blockerCount = 0, warningCount = 0) {
  if (blockerCount > 0) return { status: "blocked", label: "blocked", className: "is-danger" };
  if (warningCount > 0 || score < 90) return { status: "review", label: "needs review", className: "is-warn" };
  return { status: "ready", label: "ready for play", className: "is-safe" };
}

function sceneKitFinalizeEntityRows(situation = {}) {
  const entries = Array.isArray(situation.sceneKit?.entities) ? situation.sceneKit.entities : [];
  const counts = entries.reduce((acc, entity) => {
    const kind = String(entity?.kind ?? "document").trim() || "document";
    acc[kind] = (acc[kind] ?? 0) + 1;
    return acc;
  }, {});
  const rows = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([kind, count]) => situationRow(kind, `${count} docs`, "Prepared in the scene kit folder.", "is-safe"));
  if (!rows.length) rows.push(situationRow("Documents", "none", "Prepare Scene Kit Folder before finalizing content-heavy scenes.", "is-warn"));
  return rows;
}

function sceneKitFinalizeManualRows(snapshot = {}, situation = {}) {
  const counts = snapshot.counts ?? {};
  const rows = [
    situationRow("Walls / lights", "manual", "Review walls, doors, light sources, darkness and vision before play.", "is-warn"),
    situationRow("Token scale", "manual", "Check creature scale, facing, cover, stealth starts and encounter distance.", "is-warn"),
    situationRow("Combat assumptions", "manual", "Review AoE, zones, friendly fire, shield/armor logic and terrain cover.", "is-warn"),
    situationRow("Loot handoff", "manual", "Confirm cache/container ownership, pending inventory pressure and reward visibility.", "is-warn"),
    situationRow("Scene intro", "manual", situation.hook || situation.summary || "Read or adapt the generated hook at the table.", "is-active"),
  ];
  if (Number(counts.transitions ?? 0) > 0) {
    rows.push(situationRow("Transitions", `${counts.transitions} pins`, "Use Scene transitions to move into follow-up situations.", "is-road"));
  } else {
    rows.push(situationRow("Transitions", "none", "Add an exit/transition if this scene should lead elsewhere.", "is-warn"));
  }
  return rows;
}

function buildSceneKitFinalizeSnapshot(situation = {}, sceneOrId = null, qaSnapshot = null) {
  const qa = qaSnapshot ?? buildSceneKitQaSnapshot(sceneOrId ?? null, situation);
  const scene = qa.scene ?? resolveSceneKitQaScene(sceneOrId, situation);
  const dirtyStages = Array.isArray(situation.sceneKit?.dirtyStages) ? situation.sceneKit.dirtyStages : [];
  const transitions = scene ? situationSceneTransitionRows(scene) : [];
  const manualRows = sceneKitFinalizeManualRows(qa, situation);
  const entityRows = sceneKitFinalizeEntityRows(situation);
  const blockers = [];
  const warnings = [];

  if (!situation?.hasSituation) {
    blockers.push(situationRow("Situation", "missing", "A GM situation must be loaded before finalizing a scene kit.", "is-danger"));
  }
  if (!scene) {
    blockers.push(situationRow("Scene", "missing", "Send the scene kit to a Scene before finalizing.", "is-danger"));
  }
  if (qa.status === "blocked") {
    blockers.push(situationRow("Scene QA", "blocked", "Resolve Scene Kit QA blockers before treating this scene as ready.", "is-danger"));
  }
  if (dirtyStages.length) {
    warnings.push(situationRow("Dirty layers", dirtyStages.join(", "), "Rerolled layers have not been resent to the scene.", "is-warn"));
  }
  if (qa.status === "warn") {
    warnings.push(situationRow("Scene QA", "review", "QA reported warnings; the packet can be finalized but needs a GM pass.", "is-warn"));
  }
  if (!transitions.length) {
    warnings.push(situationRow("Transition pins", "none", "This may be fine for a dead-end scene; otherwise add an exit.", "is-warn"));
  }

  const scorePenalty = dirtyStages.length * 5 + warnings.length * 4 + blockers.length * 35;
  const score = Math.max(0, Math.min(100, Number(qa.score ?? 0) - scorePenalty));
  const status = sceneKitFinalizeStatus(score, blockers.length, warnings.length);
  const finalizedAt = nowIso();
  const preparedEntityCount = Array.isArray(situation.sceneKit?.entities) ? situation.sceneKit.entities.length : 0;
  const rows = [
    situationRow("Scene", scene?.name ?? "No scene", scene?.uuid ?? "not linked", scene ? "is-active" : "is-danger"),
    situationRow("QA", `${qa.statusLabel ?? "unchecked"} / ${qa.score ?? 0}%`, `${qa.summary?.findings ?? 0} findings`, qa.statusClass ?? "is-warn"),
    situationRow("Generated docs", `${qa.counts?.generated ?? 0} total`, `${qa.counts?.pins ?? 0} pins / ${qa.counts?.tokens ?? 0} tokens / ${qa.counts?.drawings ?? 0} markers`, "is-safe"),
    situationRow("Transitions", String(transitions.length), transitions.length ? "Entry/exit pins available." : "No generated scene transitions.", transitions.length ? "is-road" : "is-warn"),
    situationRow("Prepared docs", String(preparedEntityCount), entityRows.map(row => `${row.label}:${row.value}`).join(", "), preparedEntityCount ? "is-safe" : "is-warn"),
    situationRow("Manual checklist", String(manualRows.length), "These checks stay explicit so the scene is table-ready, not just generated.", "is-warn"),
  ];
  const summary = {
    status: status.status,
    statusLabel: status.label,
    score,
    sceneId: scene?.id ?? "",
    sceneUuid: scene?.uuid ?? "",
    sceneName: scene?.name ?? "",
    qaStatus: qa.status ?? "",
    qaScore: Number(qa.score ?? 0),
    findings: blockers.length + warnings.length + Number(qa.summary?.findings ?? 0),
    generated: Number(qa.counts?.generated ?? 0),
    pins: Number(qa.counts?.pins ?? 0),
    tokens: Number(qa.counts?.tokens ?? 0),
    drawings: Number(qa.counts?.drawings ?? 0),
    transitions: transitions.length,
    manualChecks: manualRows.length,
    dirtyStages: dirtyStages.length,
    finalizedAt,
  };

  return {
    scene,
    situation,
    qa,
    status: status.status,
    statusLabel: status.label,
    statusClass: status.className,
    score,
    summary,
    rows,
    blockers,
    warnings,
    manualRows,
    entityRows,
    transitions,
    dirtyStages,
  };
}

function buildSceneKitFinalizePanelHtml(snapshot = {}) {
  const renderRows = (rows = [], className = "ih-scene-kit-final-row") => (Array.isArray(rows) ? rows : [])
    .map(row => `
      <div class="${className} ${escapeCombatHtml(row.tone)}">
        <strong>${escapeCombatHtml(row.label)}</strong>
        <span>${escapeCombatHtml(row.value)}</span>
        ${row.note ? `<em>${escapeCombatHtml(row.note)}</em>` : ""}
      </div>`)
    .join("");
  const findings = [...(snapshot.blockers ?? []), ...(snapshot.warnings ?? [])];
  const transitionRows = (snapshot.transitions ?? []).slice(0, 6).map(row =>
    situationRow(row.label, row.value, row.note, row.tone || "is-road"),
  );
  return `
    <div class="ih-scene-kit-final-panel">
      <header>
        <strong>${escapeCombatHtml(snapshot.summary?.sceneName || "Scene Kit Final")}</strong>
        <span>${escapeCombatHtml(snapshot.statusLabel || "review")} / ${Number(snapshot.score ?? 0)}%</span>
      </header>
      <section>
        <h4>Final packet</h4>
        ${renderRows(snapshot.rows)}
      </section>
      <section>
        <h4>Manual table checks</h4>
        ${renderRows(snapshot.manualRows, "ih-scene-kit-final-check")}
      </section>
      <section>
        <h4>Prepared documents</h4>
        ${renderRows(snapshot.entityRows, "ih-scene-kit-final-doc")}
      </section>
      <section>
        <h4>Transitions</h4>
        ${transitionRows.length ? renderRows(transitionRows, "ih-scene-kit-final-transition") : `<p class="ih-scene-kit-final-empty">No generated transition pins.</p>`}
      </section>
      <section>
        <h4>Findings</h4>
        ${findings.length ? renderRows(findings, "ih-scene-kit-final-finding") : `<p class="ih-scene-kit-final-empty">No finalization blockers or warnings.</p>`}
      </section>
    </div>`;
}

async function finalizeSituationSceneKit(situation = {}, { scene = null, qaSnapshot = null, post = true, updateScene = true } = {}) {
  if (!game.user?.isGM) throw new Error("Only a GM can finalize scene kits.");
  const snapshot = buildSceneKitFinalizeSnapshot(situation, scene, qaSnapshot);
  if (updateScene && snapshot.scene?.update) {
    await snapshot.scene.update({
      [`flags.${SYSTEM_ID}.gmSituationScene.finalSummary`]: snapshot.summary,
      [`flags.${SYSTEM_ID}.gmSituationScene.finalManualChecks`]: snapshot.manualRows.map(row => ({
        label: row.label,
        value: row.value,
        note: row.note,
        tone: row.tone,
      })),
      [`flags.${SYSTEM_ID}.gmSituationScene.finalTransitions`]: snapshot.transitions.map(row => ({
        id: row.id,
        label: row.label,
        value: row.value,
        note: row.note,
        navLevel: row.navLevel,
        navAction: row.navAction,
      })),
    });
  }
  if (post) {
    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Scene Kit Final Packet",
        subtitle: snapshot.summary?.sceneName || situation.title || "Generated scene",
        icon: "GM",
        status: `${snapshot.statusLabel} / ${snapshot.score}%`,
        statusClass: snapshot.statusClass,
        rows: (snapshot.rows ?? []).slice(0, 6).map(row => [row.label, row.value]),
        bodyHtml: buildSceneKitFinalizePanelHtml(snapshot),
        className: "ih-scene-kit-final-card",
      }),
      whisper: game.user?.isGM ? ChatMessage.getWhisperRecipients("GM") : undefined,
    });
  }
  if (snapshot.status === "blocked") ui.notifications?.error?.("Scene kit final packet has blockers.");
  else if (snapshot.status === "review") ui.notifications?.warn?.("Scene kit final packet needs GM review.");
  else ui.notifications?.info?.("Scene kit final packet is ready for play.");
  return snapshot;
}

function findGmSituationRecordForScene(scene = null, fallbackSituation = null) {
  const state = getGmSituationState();
  const sceneFlag = situationFlagValue(scene, "gmSituationScene") ?? {};
  const wantedSeed = String(fallbackSituation?.seed ?? sceneFlag.seed ?? "").trim();
  const wantedId = String(fallbackSituation?.id ?? sceneFlag.situationId ?? "").trim();
  const record = Object.values(state.entries ?? {}).find(candidate => {
    const situation = candidate.situation ?? {};
    return (wantedSeed && situation.seed === wantedSeed) || (wantedId && situation.id === wantedId);
  });
  return record ?? state.entries?.[state.activeId] ?? state.entries?.[state.selectedId] ?? null;
}

function sceneKitSituationForScene(scene = null, fallbackSituation = null) {
  if (fallbackSituation?.hasSituation) return fallbackSituation;
  const record = findGmSituationRecordForScene(scene, fallbackSituation);
  if (record?.situation?.hasSituation) return plainClone(record.situation);
  const flag = situationFlagValue(scene, "gmSituationScene") ?? {};
  return {
    hasSituation: Boolean(flag.situationId || flag.seed || flag.title),
    id: flag.situationId ?? "",
    seed: flag.seed ?? "",
    title: flag.title ?? scene?.name ?? "",
    hook: flag.mapLabel ?? "",
    summary: flag.descriptionHtml ? "Generated scene description is stored on the Scene." : "",
    map: {
      label: flag.mapLabel ?? scene?.name ?? "",
      level: flag.rawMapLevel || flag.mapLevel || "encounter",
    },
    navigationRows: Array.isArray(flag.navigationRows) ? flag.navigationRows : [],
    sceneKit: {
      sceneUuid: scene?.uuid ?? "",
      finalSummary: flag.finalSummary ?? {},
      encounterSummary: flag.encounterSummary ?? {},
    },
  };
}

function sceneKitPlayStatus(snapshot = {}) {
  if (!snapshot.scene) return { status: "blocked", label: "no scene", className: "is-danger" };
  if (snapshot.final?.status === "ready") return { status: "live", label: "play mode ready", className: "is-safe" };
  if (snapshot.qa?.status === "blocked") return { status: "blocked", label: "blocked by QA", className: "is-danger" };
  if (snapshot.final?.status === "review" || snapshot.qa?.status === "warn") return { status: "review", label: "GM review", className: "is-warn" };
  return { status: "prep", label: "prep mode", className: "is-road" };
}

function buildSceneKitPlaySnapshot(sceneOrId = globalThis.canvas?.scene ?? null, situation = null) {
  const scene = resolveSceneKitQaScene(sceneOrId, situation);
  const workingSituation = sceneKitSituationForScene(scene, situation);
  const journal = workingSituation?.hasSituation ? findSituationSceneKitJournal(workingSituation) : null;
  const transitions = scene ? situationSceneTransitionRows(scene) : [];
  const qa = buildSceneKitQaSnapshot(scene, workingSituation);
  const final = buildSceneKitFinalizeSnapshot(workingSituation, scene, qa);
  const status = sceneKitPlayStatus({ scene, qa, final });
  const finalFlag = situationFlagValue(scene, "gmSituationScene")?.finalSummary ?? {};
  const finalSummary = workingSituation.sceneKit?.finalSummary && Object.keys(workingSituation.sceneKit.finalSummary).length
    ? workingSituation.sceneKit.finalSummary
    : finalFlag;
  const rows = [
    situationRow("Scene", scene?.name ?? "No scene", scene?.active ? "active scene" : scene?.uuid ?? "not active", scene ? "is-active" : "is-danger"),
    situationRow("Final packet", finalSummary?.statusLabel || final.statusLabel || "not finalized", `${Number(finalSummary?.score ?? final.score ?? 0)}%`, final.statusClass),
    situationRow("QA", `${qa.statusLabel ?? "unchecked"} / ${qa.score ?? 0}%`, `${qa.summary?.findings ?? 0} findings`, qa.statusClass ?? "is-warn"),
    situationRow("Runbook", journal?.name ?? "missing", journal ? "journal ready" : "Create/update Journal or Send Kit to Scene.", journal ? "is-safe" : "is-warn"),
    situationRow("Transitions", `${transitions.length}`, transitions.length ? "transition panel ready" : "no generated entry/exit pins", transitions.length ? "is-road" : "is-warn"),
    situationRow("Tokens", `${qa.counts?.tokens ?? 0}`, `${qa.counts?.missingActors ?? 0} missing actors / ${qa.counts?.movedTokens ?? 0} manually moved`, qa.counts?.missingActors ? "is-warn" : "is-safe"),
  ];
  const actionRows = [
    situationRow("Activate", "Scene", "Switch canvas to the prepared scene.", scene ? "is-safe" : "is-danger", { action: "activate-scene" }),
    situationRow("Launch", "Encounter", "Start Iron Hills combat from scene tokens.", scene ? "is-safe" : "is-danger", { action: "launch-encounter" }),
    situationRow("Open", "Combat Manager", "Review participants, turns and sides.", "is-active", { action: "open-combat-manager" }),
    situationRow("Open", "Director", "Use GM combat resources, recovery and VFX controls.", "is-active", { action: "open-combat-director" }),
    situationRow("Open", "Runbook", "Open the scene prep journal.", journal ? "is-safe" : "is-warn", { action: "open-runbook" }),
    situationRow("Open", "World Map", "Focus the matching map layer.", "is-road", { action: "open-map" }),
    situationRow("Post", "Transitions", "Open entry/exit/follow-up controls.", transitions.length ? "is-road" : "is-warn", { action: "post-transitions" }),
    situationRow("Post", "QA", "Refresh and post scene QA.", "is-active", { action: "post-qa" }),
    situationRow("Post", "Final Packet", "Refresh and post final packet.", workingSituation?.hasSituation ? "is-active" : "is-warn", { action: "post-final" }),
  ];
  const summary = {
    status: status.status,
    statusLabel: status.label,
    sceneId: scene?.id ?? "",
    sceneUuid: scene?.uuid ?? "",
    sceneName: scene?.name ?? "",
    situationId: workingSituation?.id ?? "",
    seed: workingSituation?.seed ?? "",
    qaStatus: qa.status ?? "",
    qaScore: Number(qa.score ?? 0),
    finalStatus: final.status ?? "",
    finalScore: Number(final.score ?? 0),
    transitions: transitions.length,
    tokens: Number(qa.counts?.tokens ?? 0),
    pins: Number(qa.counts?.pins ?? 0),
    openedAt: nowIso(),
  };
  return {
    scene,
    situation: workingSituation,
    journal,
    qa,
    final,
    transitions,
    status: status.status,
    statusLabel: status.label,
    statusClass: status.className,
    rows,
    actionRows,
    summary,
  };
}

function sceneKitPlayDataset(snapshot = {}, action = "") {
  return [
    `data-ih-scene-play-action="${escapeCombatHtml(action)}"`,
    `data-scene-id="${escapeCombatHtml(snapshot.summary?.sceneId ?? "")}"`,
    `data-situation-id="${escapeCombatHtml(snapshot.summary?.situationId ?? "")}"`,
    `data-situation-seed="${escapeCombatHtml(snapshot.summary?.seed ?? "")}"`,
  ].join(" ");
}

function buildSceneKitPlayPanelHtml(snapshot = {}) {
  const rows = (snapshot.rows ?? []).map(row => `
    <div class="ih-scene-kit-play-row ${escapeCombatHtml(row.tone)}">
      <strong>${escapeCombatHtml(row.label)}</strong>
      <span>${escapeCombatHtml(row.value)}</span>
      ${row.note ? `<em>${escapeCombatHtml(row.note)}</em>` : ""}
    </div>`).join("");
  const actions = (snapshot.actionRows ?? []).map(row => `
    <button type="button" class="${escapeCombatHtml(row.tone)}" ${sceneKitPlayDataset(snapshot, row.action)}>
      <strong>${escapeCombatHtml(row.label)}</strong>
      <span>${escapeCombatHtml(row.value)}</span>
    </button>`).join("");
  const transitions = (snapshot.transitions ?? []).slice(0, 5).map(row => `
    <div class="ih-scene-kit-play-transition ${escapeCombatHtml(row.tone)}">
      <strong>${escapeCombatHtml(row.label)}</strong>
      <span>${escapeCombatHtml(row.value)}</span>
      ${row.note ? `<em>${escapeCombatHtml(row.note)}</em>` : ""}
    </div>`).join("");
  return `
    <div class="ih-scene-kit-play-panel">
      <header>
        <strong>${escapeCombatHtml(snapshot.summary?.sceneName || "Scene Play Mode")}</strong>
        <span>${escapeCombatHtml(snapshot.statusLabel || "prep")}</span>
      </header>
      <section class="ih-scene-kit-play-actions">${actions}</section>
      <section class="ih-scene-kit-play-state">${rows}</section>
      <section>
        <h4>Route</h4>
        ${transitions || `<p class="ih-scene-kit-play-empty">No transition pins yet.</p>`}
      </section>
    </div>`;
}

function openSceneKitPlayRunbook(snapshot = {}) {
  const journal = snapshot.journal ?? findSituationSceneKitJournal(snapshot.situation);
  if (!journal?.sheet?.render) {
    ui.notifications?.warn?.("Scene kit runbook journal is unavailable.");
    return false;
  }
  journal.sheet.render(true);
  return true;
}

function openSceneKitPlayMap(snapshot = {}) {
  const situation = snapshot.situation ?? {};
  const sceneFlag = situationFlagValue(snapshot.scene, "gmSituationScene") ?? {};
  const rawLevel = situation.map?.level || sceneFlag.rawMapLevel || sceneFlag.mapLevel || "encounter";
  const level = canonicalSituationWorldMapLevel(rawLevel);
  const focus = {
    level,
    col: 5,
    row: 5,
    route: true,
    hotspotId: situation.kind || sceneFlag.mapLabel || "",
    label: situation.map?.label || sceneFlag.mapLabel || snapshot.scene?.name || "Scene Play Mode",
    rawLevel,
  };
  const api = game.ironHills ?? {};
  if (typeof api.openWorldMapLevel === "function") {
    api.openWorldMapLevel(level, focus);
    return true;
  }
  if (typeof api.openWorldMap === "function") {
    api.openWorldMap(focus);
    return true;
  }
  ui.notifications?.warn?.("World Map is unavailable.");
  return false;
}

function sceneKitPlayByIds(sceneId = "", situationId = "", seed = "") {
  const scene = String(sceneId ?? "").trim()
    ? game.scenes?.get?.(String(sceneId).trim()) ?? null
    : globalThis.canvas?.scene ?? null;
  const state = getGmSituationState();
  const wantedId = String(situationId ?? "").trim();
  const wantedSeed = String(seed ?? "").trim();
  const record = Object.values(state.entries ?? {}).find(candidate => {
    const situation = candidate.situation ?? {};
    return (wantedId && situation.id === wantedId) || (wantedSeed && situation.seed === wantedSeed);
  }) ?? findGmSituationRecordForScene(scene, null);
  const situation = record?.situation?.hasSituation ? plainClone(record.situation) : sceneKitSituationForScene(scene, null);
  return buildSceneKitPlaySnapshot(scene, situation);
}

async function postSceneKitPlayPanel(sceneOrId = globalThis.canvas?.scene ?? null, situation = null) {
  const snapshot = buildSceneKitPlaySnapshot(sceneOrId, situation);
  await ChatMessage.create({
    content: buildCombatChatCard({
      title: "Scene Kit Play Mode",
      subtitle: snapshot.summary?.sceneName || snapshot.situation?.title || "No active scene",
      icon: "GM",
      status: snapshot.statusLabel,
      statusClass: snapshot.statusClass,
      rows: (snapshot.rows ?? []).slice(0, 6).map(row => [row.label, row.value]),
      bodyHtml: buildSceneKitPlayPanelHtml(snapshot),
      className: "ih-scene-kit-play-card",
    }),
    whisper: game.user?.isGM ? ChatMessage.getWhisperRecipients("GM") : undefined,
  });
  if (snapshot.status === "blocked") ui.notifications?.error?.("Scene Play Mode has blockers.");
  else if (snapshot.status === "review") ui.notifications?.warn?.("Scene Play Mode needs GM review.");
  else ui.notifications?.info?.("Scene Play Mode posted.");
  return snapshot;
}

function sceneKitEncounterTokenSource(scene = null) {
  if (scene?.id && globalThis.canvas?.scene?.id === scene.id && Array.isArray(globalThis.canvas?.tokens?.placeables)) {
    return globalThis.canvas.tokens.placeables;
  }
  return situationCollectionValues(scene?.tokens);
}

function sceneKitEncounterTokenActor(token) {
  const doc = token?.document ?? token ?? null;
  return token?.actor
    ?? doc?.actor
    ?? (doc?.actorId ? game.actors?.get?.(doc.actorId) : null)
    ?? null;
}

function sceneKitEncounterTokenDisposition(token) {
  const doc = token?.document ?? token ?? null;
  const value = Number(token?.disposition ?? doc?.disposition ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function sceneKitEncounterSide({ token = null, actor = null, flag = null } = {}) {
  const markerKind = String(flag?.markerKind ?? "").trim();
  const materializeKind = String(flag?.materializeKind ?? "").trim();
  const actorType = String(actor?.type ?? "").trim();
  const disposition = sceneKitEncounterTokenDisposition(token);
  if (actorType === "character" || disposition > 0) return "ally";
  if (markerKind === "monster" || materializeKind.startsWith("monster") || actorType === "monster" || disposition < 0) return "enemy";
  if (actorType === "merchant") return "neutral";
  return markerKind === "npc" || actorType === "npc" ? "neutral" : "neutral";
}

function sceneKitEncounterTokenRows(scene = null, situation = null) {
  const identity = {
    situationId: String(situation?.id ?? "").trim(),
    seed: String(situation?.seed ?? "").trim(),
  };
  return sceneKitEncounterTokenSource(scene)
    .map(token => {
      const doc = token?.document ?? token ?? null;
      const actor = sceneKitEncounterTokenActor(token);
      const flag = sceneKitDocumentFlag(doc, "gmSituationToken") ?? sceneKitDocumentFlag(token, "gmSituationToken");
      const generated = Boolean(flag);
      const matches = !generated || sceneKitFlagMatchesIdentity(flag, identity);
      const side = sceneKitEncounterSide({ token, actor, flag });
      return {
        token,
        doc,
        actor,
        flag,
        generated,
        matches,
        side,
        tokenId: String(doc?.id ?? token?.id ?? ""),
        tokenUuid: String(doc?.uuid ?? token?.uuid ?? ""),
        actorId: String(actor?.id ?? doc?.actorId ?? ""),
        actorName: String(actor?.name ?? doc?.name ?? token?.name ?? "Token"),
        actorType: String(actor?.type ?? ""),
        tokenName: String(token?.name ?? doc?.name ?? actor?.name ?? "Token"),
      };
    })
    .filter(row => row.actor)
    .filter(row => ["character", "npc", "monster", "merchant"].includes(row.actorType) || row.generated)
    .filter(row => row.matches);
}

function buildSceneKitEncounterRefs(tokenRows = []) {
  return tokenRows.map(row => ({
    actor: row.actor,
    token: row.doc ?? row.token,
    combatData: {
      side: row.side,
      tokenId: row.tokenId,
      tokenUuid: row.tokenUuid,
      tokenName: row.tokenName,
      actorUuid: row.actor?.uuid ?? "",
      actorName: row.actorName,
    },
  }));
}

function buildSceneKitEncounterSnapshot(sceneOrId = globalThis.canvas?.scene ?? null, situation = null) {
  const play = buildSceneKitPlaySnapshot(sceneOrId, situation);
  const scene = play.scene;
  const tokenRows = sceneKitEncounterTokenRows(scene, play.situation);
  const refs = buildSceneKitEncounterRefs(tokenRows);
  const allyCount = tokenRows.filter(row => row.side === "ally").length;
  const enemyCount = tokenRows.filter(row => row.side === "enemy").length;
  const neutralCount = tokenRows.filter(row => row.side === "neutral").length;
  const generatedCount = tokenRows.filter(row => row.generated).length;
  const duplicateActorCount = Math.max(0, tokenRows.length - new Set(tokenRows.map(row => row.actorId || row.tokenUuid || row.tokenId)).size);
  const active = isCombatActive();
  const blockers = [];
  const warnings = [];

  if (!scene) blockers.push(situationRow("Scene", "missing", "Open or send the scene kit to a Scene first.", "is-danger"));
  if (active) blockers.push(situationRow("Combat", "already active", "End or resolve current Iron Hills combat before launching another encounter.", "is-danger"));
  if (tokenRows.length < 2) blockers.push(situationRow("Participants", `${tokenRows.length}`, "At least two token actors are required.", "is-danger"));
  if (!allyCount) warnings.push(situationRow("Allies", "none", "No character/friendly tokens were detected; this can be a GM-only test.", "is-warn"));
  if (!enemyCount) warnings.push(situationRow("Enemies", "none", "No hostile monster/enemy tokens were detected.", "is-warn"));
  if (duplicateActorCount) warnings.push(situationRow("Shared actors", String(duplicateActorCount), "Multiple tokens share actor ids; token-first combat participant keys are enabled.", "is-warn"));
  if (play.qa?.status === "blocked") warnings.push(situationRow("Scene QA", "blocked", "Encounter can be inspected, but QA blockers should be resolved before play.", "is-warn"));

  const status = blockers.length
    ? { status: "blocked", label: "blocked", className: "is-danger" }
    : warnings.length
      ? { status: "review", label: "ready with review", className: "is-warn" }
      : { status: "ready", label: "ready to launch", className: "is-safe" };
  const rows = [
    situationRow("Scene", scene?.name ?? "No scene", scene?.active ? "active" : scene?.uuid ?? "not active", scene ? "is-active" : "is-danger"),
    situationRow("Participants", `${tokenRows.length}`, `${allyCount} allies / ${enemyCount} enemies / ${neutralCount} neutral`, tokenRows.length >= 2 ? "is-safe" : "is-danger"),
    situationRow("Generated tokens", `${generatedCount}`, `${tokenRows.length - generatedCount} non-generated scene tokens included`, generatedCount ? "is-active" : "is-warn"),
    situationRow("Combat state", active ? "active" : "inactive", active ? "cannot launch another encounter" : "ready for Iron Hills combat state", active ? "is-danger" : "is-safe"),
    situationRow("VFX", "CSS overlay", "Attack/AoE VFX run through combat-vfx-service when enabled.", "is-road"),
    situationRow("Manual preflight", "cover / AoE / friendly fire", "Check positions before resolving attacks.", "is-warn"),
  ];
  const summary = {
    status: status.status,
    statusLabel: status.label,
    sceneId: scene?.id ?? "",
    sceneUuid: scene?.uuid ?? "",
    sceneName: scene?.name ?? "",
    participants: tokenRows.length,
    allies: allyCount,
    enemies: enemyCount,
    neutral: neutralCount,
    generated: generatedCount,
    blockers: blockers.length,
    warnings: warnings.length,
    activeCombat: active,
    checkedAt: nowIso(),
  };
  return {
    ...play,
    status: status.status,
    statusLabel: status.label,
    statusClass: status.className,
    rows,
    tokenRows,
    refs,
    blockers,
    warnings,
    summary,
  };
}

function buildSceneKitEncounterPanelHtml(snapshot = {}, state = null) {
  const renderRows = (rows = [], className = "ih-scene-kit-encounter-row") => (Array.isArray(rows) ? rows : [])
    .map(row => `
      <div class="${className} ${escapeCombatHtml(row.tone)}">
        <strong>${escapeCombatHtml(row.label)}</strong>
        <span>${escapeCombatHtml(row.value)}</span>
        ${row.note ? `<em>${escapeCombatHtml(row.note)}</em>` : ""}
      </div>`)
    .join("");
  const participants = (snapshot.tokenRows ?? []).slice(0, 12).map(row =>
    situationRow(row.actorName, row.side, row.tokenName, row.side === "enemy" ? "is-danger" : row.side === "ally" ? "is-safe" : "is-warn"),
  );
  const findings = [...(snapshot.blockers ?? []), ...(snapshot.warnings ?? [])];
  return `
    <div class="ih-scene-kit-encounter-panel">
      <header>
        <strong>${escapeCombatHtml(snapshot.summary?.sceneName || "Encounter Launch")}</strong>
        <span>${escapeCombatHtml(state?.active ? "combat started" : snapshot.statusLabel || "review")}</span>
      </header>
      <section>
        <h4>Launch state</h4>
        ${renderRows(snapshot.rows)}
      </section>
      <section>
        <h4>Participants</h4>
        ${participants.length ? renderRows(participants, "ih-scene-kit-encounter-participant") : `<p class="ih-scene-kit-encounter-empty">No combat-ready token actors found.</p>`}
      </section>
      <section>
        <h4>Findings</h4>
        ${findings.length ? renderRows(findings, "ih-scene-kit-encounter-finding") : `<p class="ih-scene-kit-encounter-empty">No launch blockers or warnings.</p>`}
      </section>
    </div>`;
}

async function postSceneKitEncounterLaunchReport(snapshot = {}, state = null) {
  await ChatMessage.create({
    content: buildCombatChatCard({
      title: "Encounter Launch",
      subtitle: snapshot.summary?.sceneName || "Scene encounter",
      icon: "INI",
      status: state?.active ? `${state.participants?.length ?? 0} participants` : snapshot.statusLabel,
      statusClass: state?.active ? "is-safe" : snapshot.statusClass,
      rows: (snapshot.rows ?? []).slice(0, 6).map(row => [row.label, row.value]),
      bodyHtml: buildSceneKitEncounterPanelHtml(snapshot, state),
      className: "ih-scene-kit-encounter-card",
    }),
    whisper: game.user?.isGM ? ChatMessage.getWhisperRecipients("GM") : undefined,
  });
}

async function launchSceneKitEncounter(sceneOrId = globalThis.canvas?.scene ?? null, situation = null, { openPanels = true, post = true } = {}) {
  if (!game.user?.isGM) throw new Error("Only a GM can launch scene encounters.");
  const snapshot = buildSceneKitEncounterSnapshot(sceneOrId, situation);
  if (snapshot.scene?.activate && globalThis.canvas?.scene?.id !== snapshot.scene.id) {
    await snapshot.scene.activate();
  }
  const activeSnapshot = buildSceneKitEncounterSnapshot(snapshot.scene, snapshot.situation);
  if (activeSnapshot.blockers?.length) {
    if (post) await postSceneKitEncounterLaunchReport(activeSnapshot, null);
    ui.notifications?.warn?.("Encounter launch has blockers.");
    return { ok: false, state: null, snapshot: activeSnapshot, reason: "blocked" };
  }
  const state = startCombat(activeSnapshot.refs, {
    statePatch: {
      source: "scene-kit",
      sceneId: activeSnapshot.summary.sceneId,
      sceneUuid: activeSnapshot.summary.sceneUuid,
      sceneName: activeSnapshot.summary.sceneName,
      situationId: activeSnapshot.situation?.id ?? "",
      situationSeed: activeSnapshot.situation?.seed ?? "",
    },
  });
  activeSnapshot.summary = {
    ...(activeSnapshot.summary ?? {}),
    status: state ? "launched" : activeSnapshot.summary?.status ?? "blocked",
    statusLabel: state ? "combat started" : activeSnapshot.summary?.statusLabel ?? "start failed",
    combatId: state?.combatId ?? "",
    participantCount: Number(state?.participants?.length ?? activeSnapshot.summary?.participants ?? 0),
    activeCombat: Boolean(state),
    launchedAt: state ? nowIso() : "",
  };
  if (state) {
    activeSnapshot.status = "launched";
    activeSnapshot.statusLabel = "combat started";
    activeSnapshot.statusClass = "is-safe";
    activeSnapshot.rows = (activeSnapshot.rows ?? []).map(row =>
      row.label === "Combat state"
        ? situationRow("Combat state", "active", `combat ${state.combatId ?? ""}`, "is-safe")
        : row,
    );
  }
  if (state && activeSnapshot.scene?.update) {
    await activeSnapshot.scene.update({
      [`flags.${SYSTEM_ID}.gmSituationScene.encounterSummary`]: activeSnapshot.summary,
    }).catch(error => console.warn("Iron Hills | Failed to store encounter summary on scene", error));
  }
  if (state) {
    syncCombatParticipantsWithActors();
    if (openPanels) {
      game.ironHills?.openCombatManager?.();
      game.ironHills?.openCombatDirector?.();
    }
  }
  if (post) await postSceneKitEncounterLaunchReport(activeSnapshot, state);
  return { ok: Boolean(state), state, snapshot: activeSnapshot, reason: state ? "" : "start-failed" };
}

function situationSceneTokenFlagObject(tokenKey = "", situation = {}, data = {}) {
  return {
    [SYSTEM_ID]: {
      gmSituationToken: {
        tokenKey,
        situationId: situation.id ?? "",
        seed: situation.seed ?? "",
        title: situation.title ?? "",
        markerKind: data.markerKind ?? "",
        sceneLayer: data.sceneLayer ?? "",
        materializeKind: data.materializeKind ?? "",
        actorUuid: data.actorUuid ?? "",
        anchor: data.anchor ?? "",
        plannedX: Number(data.plannedX ?? 0),
        plannedY: Number(data.plannedY ?? 0),
        plannedAt: nowIso(),
      },
    },
  };
}

function situationSceneTokenFlagPatch(tokenKey = "", situation = {}, data = {}) {
  return {
    [`flags.${SYSTEM_ID}.gmSituationToken.tokenKey`]: tokenKey,
    [`flags.${SYSTEM_ID}.gmSituationToken.situationId`]: situation.id ?? "",
    [`flags.${SYSTEM_ID}.gmSituationToken.seed`]: situation.seed ?? "",
    [`flags.${SYSTEM_ID}.gmSituationToken.title`]: situation.title ?? "",
    [`flags.${SYSTEM_ID}.gmSituationToken.markerKind`]: data.markerKind ?? "",
    [`flags.${SYSTEM_ID}.gmSituationToken.sceneLayer`]: data.sceneLayer ?? "",
    [`flags.${SYSTEM_ID}.gmSituationToken.materializeKind`]: data.materializeKind ?? "",
    [`flags.${SYSTEM_ID}.gmSituationToken.actorUuid`]: data.actorUuid ?? "",
    [`flags.${SYSTEM_ID}.gmSituationToken.anchor`]: data.anchor ?? "",
    [`flags.${SYSTEM_ID}.gmSituationToken.plannedX`]: Number(data.plannedX ?? 0),
    [`flags.${SYSTEM_ID}.gmSituationToken.plannedY`]: Number(data.plannedY ?? 0),
    [`flags.${SYSTEM_ID}.gmSituationToken.plannedAt`]: nowIso(),
  };
}

function findSituationSceneToken(scene, tokenKey = "", situation = {}) {
  const wantedKey = String(tokenKey ?? "").trim();
  const wantedSeed = String(situation.seed ?? "").trim();
  const wantedId = String(situation.id ?? "").trim();
  if (!wantedKey) return null;
  return situationCollectionValues(scene?.tokens)
    .find(token => {
      const flag = situationFlagValue(token, "gmSituationToken") ?? {};
      if (flag.tokenKey !== wantedKey) return false;
      return (wantedSeed && flag.seed === wantedSeed) || (wantedId && flag.situationId === wantedId);
    }) ?? null;
}

function situationTokenWasMovedFromPlan(token, scene = null) {
  const flag = situationFlagValue(token, "gmSituationToken") ?? {};
  const plannedX = Number(flag.plannedX);
  const plannedY = Number(flag.plannedY);
  if (!Number.isFinite(plannedX) || !Number.isFinite(plannedY)) return false;
  const x = Number(token?.x ?? token?.document?.x ?? 0);
  const y = Number(token?.y ?? token?.document?.y ?? 0);
  const gridSize = Number(scene?.grid?.size ?? scene?.grid?.distance ?? 100) || 100;
  const tolerance = Math.max(6, gridSize * 0.12);
  return Math.abs(x - plannedX) > tolerance || Math.abs(y - plannedY) > tolerance;
}

function pctSceneCoord(scene, row = {}, key = "x", fallback = 50) {
  const size = key === "x" ? Number(scene?.width ?? 2400) || 2400 : Number(scene?.height ?? 1500) || 1500;
  const pct = Math.max(0, Math.min(100, Number(row?.[key] ?? fallback) || fallback));
  return Math.round(size * pct / 100);
}

function clampScenePosition(scene, x = 0, y = 0, widthPx = 100, heightPx = 100) {
  const sceneWidth = Number(scene?.width ?? 2400) || 2400;
  const sceneHeight = Number(scene?.height ?? 1500) || 1500;
  return {
    x: Math.max(0, Math.min(Math.round(x), Math.max(0, sceneWidth - widthPx))),
    y: Math.max(0, Math.min(Math.round(y), Math.max(0, sceneHeight - heightPx))),
  };
}

function situationTokenGridOffset(index = 0, total = 1, gridSize = 100) {
  if (total <= 1) return { x: 0, y: 0 };
  const points = [
    { x: -0.55, y: -0.45 },
    { x: 0.55, y: -0.45 },
    { x: -0.55, y: 0.45 },
    { x: 0.55, y: 0.45 },
    { x: 0, y: -0.9 },
    { x: 0, y: 0.9 },
    { x: -0.9, y: 0 },
    { x: 0.9, y: 0 },
  ];
  const point = points[index % points.length];
  const ring = Math.floor(index / points.length);
  const multiplier = 1 + ring * 0.55;
  return {
    x: Math.round(point.x * gridSize * multiplier),
    y: Math.round(point.y * gridSize * multiplier),
  };
}

function situationTokenDimensions(actor) {
  const proto = actor?.prototypeToken ?? {};
  const width = Math.max(0.5, Number(proto.width ?? proto._source?.width ?? 1) || 1);
  const height = Math.max(0.5, Number(proto.height ?? proto._source?.height ?? 1) || 1);
  return { width, height };
}

function situationTokenImage(actor) {
  return String(
    actor?.prototypeToken?.texture?.src
      ?? actor?.prototypeToken?._source?.texture?.src
      ?? actor?.img
      ?? "icons/svg/mystery-man.svg"
  ).trim();
}

function situationTokenDisposition(actor) {
  const protoDisposition = actor?.prototypeToken?.disposition ?? actor?.prototypeToken?._source?.disposition;
  if (Number.isFinite(Number(protoDisposition))) return Number(protoDisposition);
  if (actor?.type === "monster") return -1;
  if (actor?.type === "npc") {
    const role = String(actor.system?.info?.specialization ?? actor.system?.info?.role ?? "").trim();
    return role === "bandit" ? -1 : 0;
  }
  return 0;
}

function situationTokenData(scene, situation = {}, actor, row = {}, tokenKey = "", slotIndex = 0, total = 1, materializeKind = "") {
  const gridSize = Number(scene?.grid?.size ?? 100) || 100;
  const dims = situationTokenDimensions(actor);
  const widthPx = Math.max(1, Math.round(dims.width * gridSize));
  const heightPx = Math.max(1, Math.round(dims.height * gridSize));
  const centerX = pctSceneCoord(scene, row, "x", row.markerKind === "monster" ? 68 : row.markerKind === "npc" ? 46 : 54);
  const centerY = pctSceneCoord(scene, row, "y", row.markerKind === "monster" ? 44 : row.markerKind === "npc" ? 48 : 58);
  const offset = situationTokenGridOffset(slotIndex, total, gridSize);
  const position = clampScenePosition(scene, centerX - widthPx / 2 + offset.x, centerY - heightPx / 2 + offset.y, widthPx, heightPx);
  const img = situationTokenImage(actor);
  const flagData = {
    markerKind: row.markerKind ?? "",
    sceneLayer: row.sceneLayer ?? "",
    materializeKind,
    actorUuid: actor?.uuid ?? "",
    anchor: row.anchor ?? row.label ?? "",
    plannedX: position.x,
    plannedY: position.y,
  };
  return {
    actorId: actor.id,
    actorLink: false,
    name: total > 1 ? `${actor.name} #${slotIndex + 1}` : actor.name,
    x: position.x,
    y: position.y,
    width: dims.width,
    height: dims.height,
    disposition: situationTokenDisposition(actor),
    displayName: actor?.prototypeToken?.displayName ?? actor?.prototypeToken?._source?.displayName ?? 20,
    displayBars: actor?.prototypeToken?.displayBars ?? actor?.prototypeToken?._source?.displayBars ?? 20,
    texture: { src: img },
    flags: situationSceneTokenFlagObject(tokenKey, situation, flagData),
    _ihFlagData: flagData,
  };
}

function findSituationDrawing(scene, markerId = "") {
  const wanted = String(markerId ?? "").trim();
  if (!wanted) return null;
  return situationCollectionValues(scene?.drawings)
    .find(drawing => situationFlagValue(drawing, "gmSituationDrawing")?.markerId === wanted) ?? null;
}

async function upsertSituationDraftScene(situation = {}, options = {}) {
  if (!globalThis.Scene?.create) throw new Error("Scene API is unavailable.");
  const data = buildSituationSceneData(situation);
  const folderId = String(options.folderId ?? "").trim();
  if (folderId) data.folder = folderId;
  let scene = findSituationScene(situation);
  let status = "created";
  if (scene) {
    status = "updated";
    const patch = {
      name: data.name,
      active: data.active,
      navigation: data.navigation,
      width: data.width,
      height: data.height,
      padding: data.padding,
      backgroundColor: data.backgroundColor,
      grid: data.grid,
      ...situationSceneFlagPatch(situation),
    };
    if (data.background?.src) patch["background.src"] = data.background.src;
    if (folderId) patch.folder = folderId;
    await scene.update(patch);
  } else {
    scene = await Scene.create(data);
  }
  return { scene, status };
}

async function upsertSituationSceneDrawings(scene, situation = {}) {
  if (!scene?.createEmbeddedDocuments) return { created: 0, updated: 0, skipped: 0, rows: [] };
  const sourceRows = [
    ...(Array.isArray(situation.sceneHotspotRows) ? situation.sceneHotspotRows : []),
    ...(Array.isArray(situation.sceneBlueprintRows) ? situation.sceneBlueprintRows : []).filter(row => row.sceneLayer === "scene"),
  ].slice(0, 18);
  const reports = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const [index, row] of sourceRows.entries()) {
    const markerId = situationDrawingMarkerId(row, index);
    const data = situationDrawingData(scene, situation, row, index);
    const existing = findSituationDrawing(scene, markerId);
    if (existing?.update) {
      await existing.update({
        x: data.x,
        y: data.y,
        shape: data.shape,
        strokeColor: data.strokeColor,
        strokeWidth: data.strokeWidth,
        fillColor: data.fillColor,
        fillAlpha: data.fillAlpha,
        text: data.text,
        fontSize: data.fontSize,
        textColor: data.textColor,
        locked: data.locked,
        hidden: data.hidden,
        [`flags.${SYSTEM_ID}.gmSituationDrawing`]: data.flags[SYSTEM_ID].gmSituationDrawing,
      });
      updated += 1;
      reports.push({ row, status: "updated" });
      continue;
    }
    const createdDocs = await scene.createEmbeddedDocuments("Drawing", [data]);
    if (createdDocs?.[0]) {
      created += 1;
      reports.push({ row, status: "created" });
    } else {
      skipped += 1;
      reports.push({ row, status: "skipped" });
    }
  }
  return { created, updated, skipped, rows: reports };
}

async function upsertSituationQuestDraftActor(situation = {}, options = {}) {
  const data = buildSituationQuestDraftData(situation);
  const folderId = String(options.folderId ?? "").trim();
  if (folderId) data.folder = folderId;
  const existing = findSituationMaterializedActor("quest", "quest", situation, data.name);
  let actor = existing;
  let status = "created";
  if (actor) {
    const patch = buildSituationQuestDraftPatch(situation);
    if (folderId) patch.folder = folderId;
    await actor.update(patch);
    status = "updated";
  } else {
    actor = await Actor.create(data);
  }
  return { actor, status, data };
}

async function upsertSituationLootContainerDraft(situation = {}, options = {}) {
  const data = buildSituationContainerData(situation);
  const folderId = String(options.folderId ?? "").trim();
  if (folderId) data.folder = folderId;
  const existing = findSituationMaterializedActor("container", "container", situation, data.name);
  let actor = existing;
  let status = "created";
  if (actor) {
    await actor.update({
      name: data.name,
      "system.info.theme": data.system.info.theme,
      "system.info.tier": data.system.info.tier,
      "system.info.lockDifficulty": data.system.info.lockDifficulty,
      "system.info.danger": data.system.info.danger,
      "system.info.sourceSituation": data.system.info.sourceSituation,
      ...(folderId ? { folder: folderId } : {}),
      ...situationMaterializeFlagPatch("container", situation),
    });
    status = "updated";
  } else {
    actor = await Actor.create(data);
  }
  const shouldStock = Number(actor?.items?.size ?? 0) <= 0;
  const loot = shouldStock ? randomContainerLoot(data.system.info.theme, data.system.info.tier) : [];
  if (loot.length) await actor.createEmbeddedDocuments("Item", loot);
  return { actor, status, theme: data.system.info.theme, tier: data.system.info.tier, lootCount: loot.length, stocked: shouldStock };
}

async function upsertSituationNpcDraftActors(situation = {}, options = {}) {
  const drafts = buildSituationNpcDrafts(situation);
  const folderId = String(options.folderId ?? "").trim();
  const rows = [];
  for (const [index, draft] of drafts.entries()) {
    const kind = `npc-${index + 1}`;
    if (folderId) draft.doc.data.folder = folderId;
    const existing = findSituationMaterializedActor("npc", kind, situation, draft.doc.data.name);
    let actor = existing;
    let status = "created";
    if (actor) {
      await actor.update({
        name: draft.doc.data.name,
        img: draft.doc.data.img,
        "prototypeToken.name": draft.doc.data.name,
        "prototypeToken.texture.src": draft.doc.data.img,
        "system.info.role": draft.doc.data.system.info?.role ?? "",
        "system.info.specialization": draft.doc.roleKey,
        "system.info.faction": draft.doc.data.system.info?.faction ?? "",
        "system.info.tier": draft.doc.data.system.info?.tier ?? situation.tier ?? 1,
        "system.info.location": draft.doc.data.system.info?.location ?? "",
        "system.info.homeLocation": draft.doc.data.system.info?.homeLocation ?? "",
        "system.info.sceneRole": draft.doc.data.system.info?.sceneRole ?? "",
        "system.info.desc": draft.doc.data.system.info?.desc ?? "",
        ...(folderId ? { folder: folderId } : {}),
        ...situationMaterializeFlagPatch(kind, situation),
      });
      status = "updated";
    } else {
      actor = await Actor.create(draft.doc.data);
    }

    let itemCount = 0;
    if (actor && Number(actor.items?.size ?? 0) <= 0) {
      const startingItems = buildNpcStartingInventoryItems(draft.doc.roleKey, situation.tier ?? 1);
      itemCount = startingItems.length;
      if (startingItems.length) await actor.createEmbeddedDocuments("Item", startingItems);
    }
    rows.push({ actor, status, roleKey: draft.doc.roleKey, itemCount });
  }
  return rows;
}

function buildSituationMonsterDrafts(situation = {}) {
  const rows = (Array.isArray(situation.actorRows) ? situation.actorRows : [])
    .filter(row => String(row?.actorKind ?? "").trim() === "monster");
  return rows.map((row, index) => {
    const id = String(row.id || row.value || "").trim();
    const bestiary = MONSTER_BESTIARY[id] ?? Object.values(MONSTER_BESTIARY).find(monster => monster.label === row.sourceLabel || monster.label === row.label) ?? null;
    const fallbackTier = Math.max(1, Math.min(10, Number(row.tier ?? situation.tier ?? 1) || 1));
    const source = {
      ...(bestiary ?? {}),
      id: bestiary?.id ?? (id || `generated_monster_${index + 1}`),
      label: row.sourceLabel || bestiary?.label || row.label || `Scene monster ${index + 1}`,
      tier: bestiary?.tier ?? fallbackTier,
      hpPool: bestiary?.hpPool ?? 30 + fallbackTier * 12,
      img: row.img || bestiary?.img || "icons/svg/mystery-man.svg",
      lootPool: row.lootPool || bestiary?.lootPool || "",
      initiative: bestiary?.initiative ?? 8 + Math.ceil(fallbackTier / 2),
      energy: bestiary?.energy ?? 10 + fallbackTier * 2,
      mana: bestiary?.mana ?? 0,
      armor: bestiary?.armor ?? { physical: Math.max(0, fallbackTier - 1), magical: 0 },
      combat: bestiary?.combat ?? {
        baseThreshold: Math.min(12, 3 + Math.floor(fallbackTier / 2)),
        unarmedDamage: Math.round(7 + fallbackTier * 5),
        unarmedSkill: Math.min(8, 2 + Math.floor(fallbackTier / 2)),
        attackSkill: Math.min(9, 2 + Math.floor((fallbackTier + 1) / 2)),
      },
      skills: bestiary?.skills ?? { endurance: Math.max(1, Math.ceil(fallbackTier / 2)) },
      desc: [bestiary?.desc, row.note, row.placement].filter(Boolean).join(" "),
    };
    const data = monsterRowToActorData(source);
    data.name = `${source.label}${Number(row.count ?? 1) > 1 ? ` x${Number(row.count)}` : ""}`;
    data.prototypeToken = {
      ...(data.prototypeToken ?? {}),
      name: data.name,
      texture: { src: data.img },
    };
    data.system = {
      ...(data.system ?? {}),
      info: {
        ...(data.system?.info ?? {}),
        sceneRole: row.sceneRole || "scene-monster",
        sourceSituation: situation.title || situation.map?.label || "",
        placement: row.placement || row.note || "",
        count: Number(row.count ?? 1) || 1,
      },
    };
    data.flags = {
      ...(data.flags ?? {}),
      ...situationMaterializeFlagObject(`monster-${index + 1}`, situation),
    };
    return { row, data, kind: `monster-${index + 1}` };
  });
}

async function upsertSituationMonsterDraftActors(situation = {}, options = {}) {
  const drafts = buildSituationMonsterDrafts(situation);
  const folderId = String(options.folderId ?? "").trim();
  const rows = [];
  for (const draft of drafts) {
    if (folderId) draft.data.folder = folderId;
    const existing = findSituationMaterializedActor("monster", draft.kind, situation, "");
    let actor = existing;
    let status = "created";
    if (actor) {
      await actor.update({
        name: draft.data.name,
        img: draft.data.img,
        "prototypeToken.name": draft.data.name,
        "prototypeToken.texture.src": draft.data.img,
        "system.info.role": draft.data.system.info?.role ?? "",
        "system.info.tier": draft.data.system.info?.tier ?? situation.tier ?? 1,
        "system.info.desc": draft.data.system.info?.desc ?? "",
        "system.info.lootPool": draft.data.system.info?.lootPool ?? "",
        "system.info.bestiaryId": draft.data.system.info?.bestiaryId ?? "",
        "system.info.sceneRole": draft.data.system.info?.sceneRole ?? "",
        "system.info.sourceSituation": draft.data.system.info?.sourceSituation ?? "",
        "system.info.placement": draft.data.system.info?.placement ?? "",
        "system.info.count": draft.data.system.info?.count ?? 1,
        ...(folderId ? { folder: folderId } : {}),
        ...situationMaterializeFlagPatch(draft.kind, situation),
      });
      status = "updated";
    } else {
      actor = await Actor.create(draft.data);
    }
    if (actor && Number(actor.items?.size ?? 0) <= 0 && Array.isArray(draft.data.items) && draft.data.items.length) {
      await actor.createEmbeddedDocuments("Item", draft.data.items);
    }
    rows.push({ actor, status, count: draft.row.count ?? 1, bestiaryId: draft.data.system.info?.bestiaryId ?? "", row: draft.row });
  }
  return rows;
}

function situationSceneKitFolderInfo(row, count = 0) {
  const folder = row?.folder ?? null;
  return {
    id: folder?.id ?? "",
    uuid: folder?.uuid ?? "",
    name: folder?.name ?? "",
    label: row?.label ?? row?.id ?? "",
    documentType: row?.documentType ?? "",
    status: row?.status ?? "",
    count,
  };
}

function situationSceneKitEntityInfo(document, kind = "", status = "ready", note = "") {
  if (!document) return null;
  const materializeFlag = situationFlagValue(document, "gmSituation") ?? {};
  return {
    kind,
    materializeKind: materializeFlag.kind ?? kind,
    id: document.id ?? "",
    uuid: document.uuid ?? "",
    name: document.name ?? "",
    type: document.type ?? kind,
    status,
    note,
    tone: status === "created" ? "is-safe" : status === "updated" ? "is-warn" : "is-active",
  };
}

async function resolveSituationSceneKitEntityDocument(entity = {}) {
  const uuid = String(entity.uuid ?? "").trim();
  if (uuid && typeof globalThis.fromUuid === "function") {
    const document = await globalThis.fromUuid(uuid);
    if (document) return document;
  }
  const id = String(entity.id ?? "").trim();
  if (!id) return null;
  if (["npc", "monster", "container", "quest", "actor"].includes(String(entity.kind ?? "").trim())) {
    return game.actors?.get?.(id) ?? null;
  }
  if (entity.kind === "scene") return game.scenes?.get?.(id) ?? null;
  if (entity.kind === "journal") return game.journal?.get?.(id) ?? null;
  return game.actors?.get?.(id) ?? null;
}

async function buildSituationSceneKitActorMap(situation = {}) {
  const entries = Array.isArray(situation.sceneKit?.entities) ? situation.sceneKit.entities : [];
  const map = new Map();
  for (const entity of entries) {
    if (!["npc", "monster", "container"].includes(String(entity.kind ?? "").trim())) continue;
    const document = await resolveSituationSceneKitEntityDocument(entity);
    if (!document) continue;
    const flag = situationFlagValue(document, "gmSituation") ?? {};
    const materializeKind = String(entity.materializeKind || flag.kind || entity.kind || "").trim();
    if (materializeKind) map.set(materializeKind, document);
    if (entity.kind && !map.has(entity.kind)) map.set(entity.kind, document);
  }
  return map;
}

function situationTokenCount(row = {}) {
  const explicit = Number(row.count);
  if (Number.isFinite(explicit) && explicit > 0) return Math.min(12, Math.round(explicit));
  const match = String(row.value ?? "").match(/x\s*(\d+)/i);
  if (match) return Math.min(12, Math.max(1, Number(match[1]) || 1));
  return 1;
}

function situationTokenBlueprintRows(situation = {}) {
  const rows = Array.isArray(situation.sceneBlueprintRows) ? situation.sceneBlueprintRows : [];
  return rows
    .filter(row => ["actor", "loot"].includes(String(row?.sceneLayer ?? "").trim()))
    .filter(row => ["npc", "monster", "loot", "cache"].includes(String(row?.markerKind ?? "").trim()));
}

function fallbackTokenBlueprintRow(situation = {}, markerKind = "loot") {
  const rows = Array.isArray(situation.sceneHotspotRows) ? situation.sceneHotspotRows : [];
  return rows.find(row => String(row.markerKind ?? "").trim() === markerKind)
    ?? situationRow(
      markerKind === "loot" ? "Loot container" : "Scene token",
      markerKind,
      "Fallback generated placement.",
      markerKind === "loot" ? "is-gold" : "is-active",
      {
        markerKind,
        sceneLayer: markerKind === "loot" ? "loot" : "actor",
        action: markerKind === "loot" ? "place-loot" : "place-actor",
        x: markerKind === "loot" ? 54 : 50,
        y: markerKind === "loot" ? 58 : 50,
        w: 12,
        h: 12,
        anchor: markerKind === "loot" ? "searchable cache" : "scene focus",
      },
    );
}

function buildSituationTokenPlacementPlans(situation = {}, actorMap = new Map()) {
  const plans = [];
  const counters = { npc: 0, monster: 0 };
  let containerAdded = false;
  for (const row of situationTokenBlueprintRows(situation)) {
    const markerKind = String(row.markerKind ?? "").trim();
    if (markerKind === "npc" || markerKind === "monster") {
      counters[markerKind] = (counters[markerKind] ?? 0) + 1;
      const materializeKind = `${markerKind}-${counters[markerKind]}`;
      const actor = actorMap.get(materializeKind);
      if (!actor) {
        plans.push({ row, materializeKind, actor: null, status: "missing-actor", count: 0 });
        continue;
      }
      const count = situationTokenCount(row);
      for (let index = 0; index < count; index += 1) {
        plans.push({
          row,
          actor,
          materializeKind,
          tokenKey: `${materializeKind}:${index + 1}`,
          slotIndex: index,
          total: count,
          status: "ready",
        });
      }
    } else if ((markerKind === "loot" || markerKind === "cache") && !containerAdded) {
      const actor = actorMap.get("container");
      if (!actor) {
        plans.push({ row, materializeKind: "container", actor: null, status: "missing-actor", count: 0 });
        containerAdded = true;
        continue;
      }
      plans.push({
        row,
        actor,
        materializeKind: "container",
        tokenKey: "container:1",
        slotIndex: 0,
        total: 1,
        status: "ready",
      });
      containerAdded = true;
    }
  }

  if (!plans.some(plan => plan.materializeKind === "container") && actorMap.get("container")) {
    const row = fallbackTokenBlueprintRow(situation, "loot");
    plans.push({
      row,
      actor: actorMap.get("container"),
      materializeKind: "container",
      tokenKey: "container:1",
      slotIndex: 0,
      total: 1,
      status: "ready",
    });
  }
  return plans;
}

async function upsertSituationSceneTokens(scene, situation = {}) {
  if (!scene?.createEmbeddedDocuments) return { created: 0, updated: 0, preserved: 0, skipped: 0, missing: 0, rows: [] };
  const actorMap = await buildSituationSceneKitActorMap(situation);
  const plans = buildSituationTokenPlacementPlans(situation, actorMap);
  const rows = [];
  let created = 0;
  let updated = 0;
  let preserved = 0;
  let skipped = 0;
  let missing = 0;

  for (const plan of plans) {
    if (!plan.actor) {
      missing += 1;
      rows.push({ plan, status: plan.status || "missing-actor" });
      continue;
    }
    const data = situationTokenData(
      scene,
      situation,
      plan.actor,
      plan.row,
      plan.tokenKey,
      plan.slotIndex,
      plan.total,
      plan.materializeKind,
    );
    const flagData = data._ihFlagData;
    delete data._ihFlagData;
    const existing = findSituationSceneToken(scene, plan.tokenKey, situation);
    if (existing?.update) {
      if (situationTokenWasMovedFromPlan(existing, scene)) {
        preserved += 1;
        rows.push({ plan, token: existing, status: "manual-preserved" });
        continue;
      }
      await existing.update({
        actorId: data.actorId,
        actorLink: data.actorLink,
        name: data.name,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        disposition: data.disposition,
        displayName: data.displayName,
        displayBars: data.displayBars,
        "texture.src": data.texture?.src ?? "",
        ...situationSceneTokenFlagPatch(plan.tokenKey, situation, flagData),
      });
      updated += 1;
      rows.push({ plan, token: existing, status: "updated" });
      continue;
    }

    const createdDocs = await scene.createEmbeddedDocuments("Token", [data]);
    const token = createdDocs?.[0] ?? null;
    if (token) {
      created += 1;
      rows.push({ plan, token, status: "created" });
    } else {
      skipped += 1;
      rows.push({ plan, status: "skipped" });
    }
  }

  return { created, updated, preserved, skipped, missing, rows };
}

function buildSituationSceneKitState(situation = {}, folders = {}, entities = [], status = "prepared") {
  const actorCount = entities.filter(row => row && row.kind !== "journal" && row.kind !== "scene").length;
  return {
    ...(situation.sceneKit ?? {}),
    status,
    updatedAt: nowIso(),
    folders: {
      journal: situationSceneKitFolderInfo(folders.journal, entities.filter(row => row?.kind === "journal").length),
      scene: situationSceneKitFolderInfo(folders.scene, entities.filter(row => row?.kind === "scene").length),
      actor: situationSceneKitFolderInfo(folders.actor, actorCount),
    },
    entities: entities.filter(Boolean),
  };
}

async function prepareSituationSceneKit(situation = {}, brief = null) {
  if (!game.user?.isGM) throw new Error("Scene kit can be prepared only by a GM user.");
  const folders = await upsertSituationSceneKitFolders(situation);
  const actorFolderId = folders.actor?.folder?.id ?? "";
  const sceneFolderId = folders.scene?.folder?.id ?? "";
  const journalFolderId = folders.journal?.folder?.id ?? "";

  const staging = brief?.hasBrief ? await materializeWorldMapSceneStaging(brief) : null;
  if (staging?.journal?.update && journalFolderId) {
    await staging.journal.update({
      folder: journalFolderId,
      ...situationSceneKitFlagPatch("journal", situation),
    });
  }

  const sceneResult = await upsertSituationDraftScene(situation, { folderId: sceneFolderId });
  const questResult = await upsertSituationQuestDraftActor(situation, { folderId: actorFolderId });
  const hasLootPrompt = Number(situation.counts?.loot ?? 0) > 0 || Number(situation.counts?.rewards ?? 0) > 0;
  const containerResult = hasLootPrompt ? await upsertSituationLootContainerDraft(situation, { folderId: actorFolderId }) : null;
  const npcResults = await upsertSituationNpcDraftActors(situation, { folderId: actorFolderId });
  const monsterResults = await upsertSituationMonsterDraftActors(situation, { folderId: actorFolderId });

  const entities = [
    situationSceneKitEntityInfo(staging?.journal, "journal", staging?.created ? "created" : staging ? "updated" : "skipped", "Scene description and runbook."),
    situationSceneKitEntityInfo(sceneResult.scene, "scene", sceneResult.status, "Draft Scene linked to generated description."),
    situationSceneKitEntityInfo(questResult.actor, "quest", questResult.status, "Optional quest draft for this scene."),
    containerResult ? situationSceneKitEntityInfo(containerResult.actor, "container", containerResult.status, `${containerResult.lootCount} new items.`) : null,
    ...npcResults.map(result => situationSceneKitEntityInfo(result.actor, "npc", result.status, `${result.roleKey}; ${result.itemCount} new items.`)),
    ...monsterResults.map(result => situationSceneKitEntityInfo(result.actor, "monster", result.status, `${result.bestiaryId || "custom"}; count ${result.count}.`)),
  ].filter(Boolean);
  const nextSituation = finalizeSituationMutation({
    ...situation,
    sceneKit: buildSituationSceneKitState(situation, folders, entities, "prepared"),
  });
  return {
    situation: nextSituation,
    folders,
    staging,
    sceneResult,
    questResult,
    containerResult,
    npcResults,
    monsterResults,
    entities,
  };
}

async function sendSituationSceneKitToScene(situation = {}, brief = null) {
  const dirtyStages = Array.isArray(situation.sceneKit?.dirtyStages) ? situation.sceneKit.dirtyStages : [];
  const canPreservePrepared = ["prepared", "sent"].includes(situation.sceneKit?.status) && dirtyStages.length === 0;
  const existingScene = canPreservePrepared ? findSituationScene(situation) : null;
  const prepared = existingScene
    ? {
      situation: finalizeSituationMutation(situation),
      folders: {},
      staging: {
        journal: findSituationSceneKitJournal(situation),
        created: false,
        updated: false,
        preserved: true,
      },
      sceneResult: {
        scene: existingScene,
        status: "preserved",
      },
      questResult: { actor: null, status: "preserved" },
      containerResult: null,
      npcResults: [],
      monsterResults: [],
      entities: Array.isArray(situation.sceneKit?.entities) ? situation.sceneKit.entities : [],
      preserved: true,
    }
    : await prepareSituationSceneKit(situation, brief);
  const drawingResult = await upsertSituationSceneDrawings(prepared.sceneResult.scene, prepared.situation);
  const pinResult = await upsertSituationSceneNotes(
    prepared.sceneResult.scene,
    prepared.situation,
    prepared.staging?.journal ?? findSituationSceneKitJournal(prepared.situation),
  );
  const tokenResult = await upsertSituationSceneTokens(prepared.sceneResult.scene, prepared.situation);
  const nextSituation = finalizeSituationMutation({
    ...prepared.situation,
    sceneKit: {
      ...(prepared.situation.sceneKit ?? {}),
      status: "sent",
      sentAt: nowIso(),
      dirtyStages: [],
      sceneUuid: prepared.sceneResult.scene?.uuid ?? "",
      journalUuid: prepared.staging?.journal?.uuid ?? "",
      markerSummary: {
        created: drawingResult.created,
        updated: drawingResult.updated,
        skipped: drawingResult.skipped,
      },
      pinSummary: {
        created: pinResult.created,
        updated: pinResult.updated,
        preserved: pinResult.preserved,
        skipped: pinResult.skipped,
        missingJournal: pinResult.missingJournal,
      },
      tokenSummary: {
        created: tokenResult.created,
        updated: tokenResult.updated,
        preserved: tokenResult.preserved,
        skipped: tokenResult.skipped,
        missing: tokenResult.missing,
      },
    },
  });
  return {
    ...prepared,
    situation: nextSituation,
    drawingResult,
    pinResult,
    tokenResult,
  };
}

function buildWorldReportRows(rows = []) {
  const normalized = (Array.isArray(rows) ? rows : [])
    .filter(row => row && row[0] !== undefined && row[1] !== undefined)
    .map(([label, value]) => `
      <div class="ih-world-report-row">
        <span>${escapeCombatHtml(label)}</span>
        <b>${escapeCombatHtml(value)}</b>
      </div>
    `)
    .join("");

  return normalized ? `<div class="ih-world-report-rows">${normalized}</div>` : "";
}

function buildWorldReportBlock(title, rows = [], { bodyHtml = "" } = {}) {
  return `
    <section class="ih-world-report-block">
      <h4>${escapeCombatHtml(title)}</h4>
      ${buildWorldReportRows(rows)}
      ${bodyHtml ? `<div class="ih-world-report-body">${bodyHtml}</div>` : ""}
    </section>
  `;
}

function buildWorldReportLines(lines = [], emptyText = "") {
  const safeLines = (Array.isArray(lines) ? lines : [])
    .filter(line => line !== undefined && line !== null && String(line).trim() !== "")
    .map(line => `<p>${escapeCombatHtml(line)}</p>`)
    .join("");

  if (safeLines) return safeLines;
  return emptyText ? `<p class="ih-world-report-empty">${escapeCombatHtml(emptyText)}</p>` : "";
}

function buildWorldReportSection(title, contentHtml = "", emptyText = "") {
  return `
    <section class="ih-world-report-section">
      <h3>${escapeCombatHtml(title)}</h3>
      ${contentHtml || buildWorldReportLines([], emptyText)}
    </section>
  `;
}

function getMerchantCountForSettlement(settlementName) {
  return getMerchants().filter(m => m.system.info?.settlement === settlementName).length;
}

function getRouteValueForSettlement(settlement) {
  const region = settlement.system.info?.region ?? "";
  if (!region) return 1;
  const sameRegion = getSettlements().filter(s => s.system.info?.region === region);
  const prosperityBonus = sameRegion.filter(s => Number(s.system.info?.prosperity ?? 5) >= 6).length;
  return clamp(sameRegion.length + Math.floor(prosperityBonus / 2), 1, 7);
}

function getFactionPressureForSettlement(settlement) {
  const factionName = settlement.system.info?.controllingFaction ?? "";
  const faction = findFactionByName(factionName);
  if (!faction) return 0;
  const power = Number(faction.system.power ?? 1);
  const wealth = Number(faction.system.wealth ?? 1);
  return clamp(Math.floor((power + wealth) / 2) - 5, -4, 5);
}

function getSettlementStability(settlement) {
  const prosperity = Number(settlement.system.info?.prosperity ?? 5);
  const supply = Number(settlement.system.info?.supply ?? 5);
  const militia = Number(settlement.system.regionSim?.militiaPower ?? 5);
  return clamp(Math.floor((prosperity + supply + militia) / 3), 0, 10);
}

function getSettlementMilitia(settlement) {
  const danger = Number(settlement.system.info?.danger ?? 5);
  const factionPressure = Number(settlement.system.economy?.factionPressure ?? 0);
  const base = 3 + Math.max(0, factionPressure) + (danger >= 7 ? 2 : 0);
  return clamp(base + randInt(-1, 2), 0, 10);
}

/**
 * Вычисляет ECONOMY_STATE id по параметрам поселения.
 * Результат записывается в system.economy.economyStatus
 * и читается ShopApp для расчёта цен/наличия товаров.
 */
function computeEconomyStatus(prosperity, danger, supply, activeCrisis) {
  if (activeCrisis === "plague") return "plague";
  if (activeCrisis === "war" || danger >= 9)   return "war";
  if (danger >= 7 && supply <= 3)              return "crisis";
  if (supply <= 3 || prosperity <= 2)          return "shortage";
  if (prosperity >= 8 && supply >= 7)          return "boom";
  if (prosperity >= 6 && danger <= 3)          return "festival";
  return "normal";
}

function computeSettlementEconomy(settlementLike) {
  const prosperity = Number(settlementLike.system.info?.prosperity ?? 5);
  const danger = Number(settlementLike.system.info?.danger ?? 5);
  const supply = Number(settlementLike.system.info?.supply ?? 5);
  const tradeBalance = Number(settlementLike.system.regionSim?.tradeBalance ?? 0);
  const caravanTraffic = Number(settlementLike.system.regionSim?.caravanTraffic ?? 0);

  const scarcity = clamp(
    (danger * 0.06) -
      (supply * 0.07) -
      (prosperity * 0.03) -
      (tradeBalance * 0.03) -
      (caravanTraffic * 0.02),
    -0.55,
    0.8
  );

  const foodPrice = clamp(1 + scarcity + (supply <= 3 ? 0.15 : 0), 0.6, 2.5);
  const materialsPrice = clamp(1 + scarcity * 0.75 - prosperity * 0.02, 0.65, 2.4);
  const alchemyPrice = clamp(1 + scarcity * 0.5 + danger * 0.03, 0.7, 2.5);
  const armsPrice = clamp(1 + danger * 0.05 - prosperity * 0.02, 0.7, 2.6);
  const lodgingPrice = clamp(1 + prosperity * 0.04 - supply * 0.02, 0.7, 2.0);

  return {
    foodPrice: Number(foodPrice.toFixed(2)),
    materialsPrice: Number(materialsPrice.toFixed(2)),
    alchemyPrice: Number(alchemyPrice.toFixed(2)),
    armsPrice: Number(armsPrice.toFixed(2)),
    lodgingPrice: Number(lodgingPrice.toFixed(2))
  };
}

function buildPoiName(poiType, theme, nearestSettlement) {
  const typeDef = POI_TYPES[poiType] ?? POI_TYPES.camp;
  const core = choice(typeDef?.namePrefixes ?? [typeDef?.label ?? "Точка"]);
  const themeLabel = WORLD_CONTENT_POI_THEMES[theme]?.label ?? theme;
  return nearestSettlement ? `${core} ${themeLabel} у ${nearestSettlement}` : `${core} ${themeLabel}`;
}

function normalizeMerchantSpecialtyForStock(specialty) {
  const key = String(specialty ?? "general").trim();
  const aliases = {
    blacksmith: "weaponsmith",
    hunter: "general",
    innkeeper: "general",
  };
  const normalized = aliases[key] ?? key;
  return MERCHANT_TYPES[normalized] ? normalized : "general";
}

function cloneData(value) {
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  return JSON.parse(JSON.stringify(value ?? null));
}

function numericOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampMapCoord(value, max) {
  const number = numericOrNull(value);
  if (number === null) return null;
  return clamp(Math.trunc(number), 0, Math.max(0, Number(max ?? 0) - 1));
}

function isValidMapCoord(col, row) {
  return Number.isFinite(Number(col)) && Number.isFinite(Number(row)) && Number(col) >= 0 && Number(row) >= 0;
}

function regionNameForTools(regionName = "") {
  const name = String(regionName ?? "").trim();
  return name || "Iron Hills";
}

function getWorldRegionSettings() {
  try { return game.settings.get("iron-hills-system", "worldRegions") ?? {}; }
  catch { return {}; }
}

function resolveWorldRegionId(regionName = "") {
  const normalized = regionNameForTools(regionName).toLocaleLowerCase();
  const userRegions = getWorldRegionSettings();

  for (const [id, region] of Object.entries(userRegions)) {
    const label = String(region?.label ?? id).toLocaleLowerCase();
    if (id.toLocaleLowerCase() === normalized || label === normalized) return id;
  }

  for (const [id, region] of Object.entries(DEFAULT_REGIONS ?? {})) {
    const label = String(region?.label ?? id).toLocaleLowerCase();
    if (id.toLocaleLowerCase() === normalized || label === normalized) return id;
  }

  if (normalized.includes("iron") || normalized.includes("желез")) return "iron_hills";
  return "iron_hills";
}

function getWorldRegionSnapshot(regionName = "") {
  const regionId = resolveWorldRegionId(regionName);
  const userRegions = getWorldRegionSettings();
  const base = cloneData(DEFAULT_REGIONS[regionId] ?? DEFAULT_REGIONS.iron_hills ?? {});
  const user = userRegions[regionId] ? cloneData(userRegions[regionId]) : null;

  if (user?.tiles?.length) {
    const tileMap = new Map();
    for (const tile of base.tiles ?? []) tileMap.set(`${tile.col},${tile.row}`, tile);
    for (const tile of user.tiles) {
      const key = `${tile.col},${tile.row}`;
      tileMap.set(key, { ...(tileMap.get(key) ?? {}), ...tile });
    }
    base.tiles = Array.from(tileMap.values());
  }

  return {
    regionId,
    region: {
      ...base,
      ...(user ?? {}),
      tiles: base.tiles ?? user?.tiles ?? [],
      cols: user?.cols ?? base.cols ?? 10,
      rows: user?.rows ?? base.rows ?? 10,
    },
  };
}

function getActorRegion(actor) {
  return regionNameForTools(actor?.system?.info?.region ?? "Iron Hills");
}

function getSettlementMapCoord(settlement) {
  const col = numericOrNull(settlement?.system?.info?.mapCol);
  const row = numericOrNull(settlement?.system?.info?.mapRow);
  return isValidMapCoord(col, row) ? { col, row } : null;
}

function getOccupiedMapKeys(regionName = "") {
  const region = regionNameForTools(regionName);
  const occupied = new Set();
  for (const settlement of getSettlements()) {
    if (regionNameForTools(settlement.system?.info?.region) !== region) continue;
    const coord = getSettlementMapCoord(settlement);
    if (coord) occupied.add(`${coord.col},${coord.row}`);
  }
  for (const poi of getPois()) {
    if (regionNameForTools(poi.system?.info?.region) !== region) continue;
    const col = numericOrNull(poi.system?.info?.mapCol);
    const row = numericOrNull(poi.system?.info?.mapRow);
    if (isValidMapCoord(col, row)) occupied.add(`${col},${row}`);
  }
  return occupied;
}

const POI_TERRAIN_WEIGHTS = {
  camp:    { road: 8, forest: 7, hills: 6, plains: 5, village: 4, pass: 3 },
  lair:    { dungeon: 10, ruins: 8, forest: 7, mountains: 6, hills: 5, swamp: 4 },
  ruins:   { ruins: 10, forest: 6, hills: 5, plains: 3 },
  shrine:  { ruins: 8, forest: 7, mountains: 6, hills: 5, plains: 4 },
  road:    { road: 10, pass: 7, plains: 5, village: 4 },
  campfire:{ forest: 7, road: 6, plains: 5 },
  cave:    { dungeon: 9, mountains: 8, hills: 7, mine: 5 },
  mine:    { mine: 10, mountains: 7, hills: 6 },
};

function terrainWeightForPoi(poiType, terrain) {
  const table = POI_TERRAIN_WEIGHTS[poiType] ?? POI_TERRAIN_WEIGHTS.camp;
  return Number(table[terrain] ?? 1);
}

function chooseMapTileForPoi({ regionName, poiType, nearestSettlement = "", mapCol = null, mapRow = null } = {}) {
  const { regionId, region } = getWorldRegionSnapshot(regionName);
  const cols = Number(region.cols ?? 10);
  const rows = Number(region.rows ?? 10);
  const explicitCol = clampMapCoord(mapCol, cols);
  const explicitRow = clampMapCoord(mapRow, rows);
  const tiles = region.tiles ?? [];

  if (explicitCol !== null && explicitRow !== null) {
    const tile = tiles.find(t => Number(t.col) === explicitCol && Number(t.row) === explicitRow);
    return { regionId, col: explicitCol, row: explicitRow, tile };
  }

  const settlement = nearestSettlement ? findSettlementByName(nearestSettlement) : null;
  const center = getSettlementMapCoord(settlement) ?? { col: Math.floor(cols / 2), row: Math.floor(rows / 2) };
  const occupied = getOccupiedMapKeys(regionName);

  const candidates = tiles
    .filter(t => Number.isFinite(Number(t.col)) && Number.isFinite(Number(t.row)))
    .map(tile => {
      const distance = Math.abs(Number(tile.col) - center.col) + Math.abs(Number(tile.row) - center.row);
      const key = `${tile.col},${tile.row}`;
      const terrainScore = terrainWeightForPoi(poiType, tile.terrain);
      const proximityScore = Math.max(0, 8 - distance);
      const occupiedPenalty = occupied.has(key) ? -10 : 0;
      const knownPoiPenalty = tile.poi ? -3 : 0;
      const hiddenBonus = tile.discovered === false ? 1 : 0;
      return { tile, score: terrainScore * 3 + proximityScore + occupiedPenalty + knownPoiPenalty + hiddenBonus };
    })
    .sort((a, b) => b.score - a.score);

  const picked = candidates[0]?.tile;
  if (!picked) return { regionId, col: null, row: null, tile: null };
  return { regionId, col: Number(picked.col), row: Number(picked.row), tile: picked };
}

async function ensurePoiMapCoordinates(poi, { force = false } = {}) {
  if (!poi || poi.type !== "poi") return null;

  const existingCol = numericOrNull(poi.system?.info?.mapCol);
  const existingRow = numericOrNull(poi.system?.info?.mapRow);
  if (!force && isValidMapCoord(existingCol, existingRow)) {
    return { changed: false, col: existingCol, row: existingRow, actor: poi };
  }

  const info = poi.system?.info ?? {};
  const choiceResult = chooseMapTileForPoi({
    regionName: info.region,
    poiType: info.poiType,
    nearestSettlement: info.nearestSettlement,
  });

  if (!isValidMapCoord(choiceResult.col, choiceResult.row)) {
    return { changed: false, col: null, row: null, actor: poi };
  }

  await poi.update({
    "system.info.mapCol": choiceResult.col,
    "system.info.mapRow": choiceResult.row,
    "system.info.mapRegionId": choiceResult.regionId,
    "system.info.mapTerrain": choiceResult.tile?.terrain ?? "",
    "system.info.localScale": "local",
    "system.info.encounterProfile": choiceResult.tile?.terrain ?? info.poiType ?? "camp",
  });

  return { changed: true, col: choiceResult.col, row: choiceResult.row, actor: poi };
}

function getRegionPrepRows() {
  const regionNames = new Set([
    ...getSettlements().map(s => regionNameForTools(s.system?.info?.region)),
    ...getPois().map(p => regionNameForTools(p.system?.info?.region)),
  ]);
  if (!regionNames.size) regionNames.add("Iron Hills");

  return Array.from(regionNames).sort((a, b) => a.localeCompare(b, "ru")).map(region => {
    const settlements = getSettlements().filter(s => regionNameForTools(s.system?.info?.region) === region);
    const pois = getPois().filter(p => regionNameForTools(p.system?.info?.region) === region);
    const merchants = getMerchants().filter(m => {
      const settlement = findSettlementByName(m.system?.info?.settlement ?? "");
      return settlement ? regionNameForTools(settlement.system?.info?.region) === region : false;
    });
    const quests = getQuests().filter(q => {
      const settlementName = q.system?.info?.targetSettlement ?? q.system?.info?.location ?? "";
      const settlement = findSettlementByName(settlementName);
      return settlement ? regionNameForTools(settlement.system?.info?.region) === region : false;
    });
    const mappedPois = pois.filter(p => isValidMapCoord(p.system?.info?.mapCol, p.system?.info?.mapRow));
    const highThreats = pois.filter(p => Number(p.system?.state?.threatLevel ?? p.system?.info?.danger ?? 0) >= 6);
    const activeCrisis = settlements.filter(s => String(s.system?.regionSim?.activeCrisis ?? "").trim()).length;
    const mapReadiness = pois.length
      ? (mappedPois.length >= Math.min(3, pois.length) ? 20 : Math.round((mappedPois.length / Math.max(1, pois.length)) * 20))
      : 0;
    const readiness = Math.round(
      (settlements.length ? 25 : 0) +
      (pois.length ? 20 : 0) +
      mapReadiness +
      (merchants.length ? 15 : 0) +
      (quests.length ? 10 : 0) +
      (highThreats.length ? 10 : 5)
    );
    const status = readiness >= 80 ? "готов" : readiness >= 55 ? "играбельно" : "сырой слой";
    const tone = readiness >= 80 ? "is-good" : readiness >= 55 ? "is-warn" : "is-danger";

    return {
      region,
      settlements: settlements.length,
      pois: pois.length,
      mappedPois: mappedPois.length,
      unmappedPois: Math.max(0, pois.length - mappedPois.length),
      merchants: merchants.length,
      quests: quests.length,
      highThreats: highThreats.length,
      activeCrisis,
      readiness,
      status,
      tone,
    };
  });
}

function localNameIncludes(actor, hints = []) {
  const name = String(actor?.name ?? "").toLocaleLowerCase("ru");
  const info = actor?.system?.info ?? {};
  const haystack = [
    name,
    String(info.poiType ?? "").toLocaleLowerCase("ru"),
    String(info.theme ?? "").toLocaleLowerCase("ru"),
    String(info.region ?? "").toLocaleLowerCase("ru"),
  ].join(" ");
  return hints.some(hint => haystack.includes(String(hint ?? "").toLocaleLowerCase("ru")));
}

function findFirstByNameHint(actors = [], hints = []) {
  return actors.find(actor => localNameIncludes(actor, hints)) ?? null;
}

function findFirstPoiByTypes(pois = [], types = []) {
  const wanted = new Set(types.map(type => String(type).toLocaleLowerCase("ru")));
  return pois.find(poi => wanted.has(String(poi?.system?.info?.poiType ?? "").toLocaleLowerCase("ru"))) ?? null;
}

function actorCoordLabel(actor) {
  const info = actor?.system?.info ?? {};
  return isValidMapCoord(info.mapCol, info.mapRow) ? `[${info.mapCol}, ${info.mapRow}]` : "не привязано";
}

function firstSessionStatus(hasPrimary, planned = false) {
  if (hasPrimary) return { status: "ok", statusLabel: "готово", tone: "is-good" };
  if (planned) return { status: "planned", statusLabel: "запланировано", tone: "is-warn" };
  return { status: "warn", statusLabel: "нужны данные", tone: "is-warn" };
}

function buildFirstSessionAnchors(prep = {}) {
  const settlements = prep.settlements ?? [];
  const pois = prep.pois ?? [];
  const mappedPois = prep.mappedPois ?? [];
  const hub =
    findFirstByNameHint(settlements, ["rivergate", "ривергейт"]) ??
    settlements[0] ??
    null;
  const village =
    findFirstByNameHint(settlements, ["ashford", "эшфорд"]) ??
    settlements.find(settlement => settlement?.id !== hub?.id) ??
    hub;
  const mineSettlement =
    findFirstByNameHint(settlements, ["koperny", "копёр", "копер", "mine", "руд", "шах"]) ??
    settlements.find(settlement => settlement?.id !== hub?.id && settlement?.id !== village?.id) ??
    village ??
    hub;
  const roadThreat =
    findFirstByNameHint(mappedPois, ["road", "дорог", "bandit", "разбой"]) ??
    findFirstPoiByTypes(mappedPois, ["camp", "road", "lair"]) ??
    prep.focusPoi ??
    mappedPois[0] ??
    pois[0] ??
    null;
  const wilderness =
    findFirstByNameHint(mappedPois, ["forest", "бор", "лес", "field", "поле"]) ??
    findFirstPoiByTypes(mappedPois, ["forest", "camp", "ruins", "cave"]) ??
    mappedPois.find(poi => poi?.id !== roadThreat?.id) ??
    roadThreat;
  const minePoi =
    findFirstByNameHint(mappedPois, ["mine", "cave", "руд", "шах", "пласт", "копёр", "копер"]) ??
    findFirstPoiByTypes(mappedPois, ["mine", "cave", "dungeon", "ruins"]) ??
    prep.focusPoi ??
    roadThreat;

  return { hub, village, mineSettlement, roadThreat, wilderness, minePoi };
}

function buildFirstSessionSceneRows(prep = {}) {
  const anchors = buildFirstSessionAnchors(prep);
  const rows = [
    {
      id: "arrival",
      label: "Вход в регион и безопасный узел",
      primary: anchors.hub,
      planned: true,
      route: "глобальная -> региональная -> локальная",
      npc: "t1 проводник, t2 страж",
      purpose: "Ввести Железные Холмы, локальное передвижение и безопасную точку покупки базового снаряжения.",
      check: "Открыть карту мира, войти в локальный узел и проверить кликабельный переход на уровень энкаунтера.",
    },
    {
      id: "market",
      label: "Рынок и цикл инвентаря",
      primary: prep.merchants?.[0] ?? anchors.hub,
      planned: true,
      route: "локальная -> рыночный энкаунтер",
      npc: "торговец, ремесленник",
      purpose: "Проверить покупку, pending, авторазмещение и ручное размещение до начала боя.",
      check: "Купить оружие, броню и расходник; убедиться, что pending-предметы нельзя оставить нераспределенными.",
    },
    {
      id: "road-threat",
      label: "Угроза на дороге",
      primary: anchors.roadThreat,
      planned: true,
      route: "региональная -> дорога -> энкаунтер",
      npc: "t3 разбойник, t2 свидетель-страж",
      purpose: "Первый враждебный контакт с лутом, риском friendly fire и подбором предметов после боя.",
      check: "Провести хотя бы одну single-target атаку и одну небольшую AoE/line атаку, если доступна.",
    },
    {
      id: "wilderness",
      label: "Контакт в дикой местности",
      primary: anchors.wilderness,
      planned: true,
      route: "региональная -> дикая местность -> энкаунтер",
      npc: "охотник, низкоуровневый зверь или монстр",
      purpose: "Проверить неторговое исследование, зацепки восприятия, лут монстров и темп лагеря.",
      check: "Разместить хотя бы одного монстра, сгенерировать лут и проверить понятный путь назад к узлу.",
    },
    {
      id: "mine-hook",
      label: "Шахтерский крючок и эскалация",
      primary: anchors.minePoi ?? anchors.mineSettlement,
      planned: true,
      route: "региональная -> шахтерская локация -> пещерный энкаунтер",
      npc: "ремесленник, геомант, пострадавший шахтер",
      purpose: "Связать ремонт/крафт, магическую зацепку и первую более глубокую подземную угрозу.",
      check: "Проверить, что используется шахтерская/пещерная карта, а угрозу можно отложить, если группа не готова.",
    },
  ];

  return rows.map(row => {
    const status = firstSessionStatus(Boolean(row.primary), row.planned);
    return {
      ...row,
      ...status,
      location: row.primary?.name ?? "нужно разместить вручную",
      map: actorCoordLabel(row.primary),
    };
  });
}

function buildFirstSessionNpcRows(prep = {}) {
  const anchors = buildFirstSessionAnchors(prep);
  const locationByRole = {
    "safe-guide": anchors.village ?? anchors.hub,
    "gate-guard": anchors.hub,
    "road-threat": anchors.roadThreat,
    "wilderness-contact": anchors.wilderness,
    "repair-and-trade": anchors.mineSettlement ?? anchors.hub,
    "arcane-support": anchors.minePoi ?? anchors.mineSettlement,
    healer: anchors.village ?? anchors.hub,
    "quest-patron": anchors.hub,
  };
  const purposeByRole = {
    "safe-guide": "безопасное введение в регион, слухи и ориентация игроков",
    "gate-guard": "закон, пограничное давление и свидетель первого конфликта",
    "road-threat": "низкоуровневый враждебный тест и источник лута",
    "wilderness-contact": "выживание, следы монстров и лесной маршрут",
    "repair-and-trade": "ремонт, крафт, прочность брони и торговая зацепка",
    "arcane-support": "зацепка школы магии, шахтерская аномалия и магические услуги",
    healer: "медицина и запасной путь восстановления",
    "quest-patron": "региональная цель и рамка награды",
  };

  return NPC_EXACT_TIER_PREVIEW_ACTORS.slice(0, 8).map(seed => {
    const destination = locationByRole[seed.sceneRole] ?? anchors.hub ?? prep.focusPoi ?? null;
    const specialization = NPC_SPECIALIZATIONS[seed.specialization]?.label ?? seed.specialization;
    return {
      label: seed.label,
      tier: seed.tier,
      specialization,
      sceneRole: seed.sceneRole,
      faction: seed.faction,
      location: destination?.name ?? "нужно разместить вручную",
      map: actorCoordLabel(destination),
      purpose: purposeByRole[seed.sceneRole] ?? "поддерживающий NPC для первой сессии",
    };
  });
}

function buildFirstSessionMerchantRows(prep = {}) {
  const anchors = buildFirstSessionAnchors(prep);
  const existingRows = (prep.merchants ?? []).slice(0, 4).map(merchant => {
    const settlementName = merchant.system?.info?.settlement ?? merchant.system?.merchant?.settlement ?? "";
    const settlement = settlementName ? findSettlementByName(settlementName) : null;
    return {
      label: merchant.name,
      status: "ok",
      statusLabel: "есть",
      tone: "is-good",
      specialty: merchant.system?.merchant?.merchantType ?? merchant.system?.info?.merchantType ?? "merchant",
      location: settlementName || settlement?.name || anchors.hub?.name || "Iron Hills",
      map: actorCoordLabel(settlement ?? anchors.hub),
      purpose: "Проверить сток, валюту, pending-инвентарь и размещение предметов.",
    };
  });

  const fallbackRows = [
    {
      label: "Ривергейтский торговец общего профиля",
      specialty: "общие товары, еда, инструменты",
      location: anchors.hub?.name ?? "Ривергейт",
      map: actorCoordLabel(anchors.hub),
    },
    {
      label: "Копёрный кузнец",
      specialty: "оружие, броня, ремонтные материалы",
      location: anchors.mineSettlement?.name ?? "Копёрный Пик",
      map: actorCoordLabel(anchors.mineSettlement),
    },
    {
      label: "Дорожный лекарь",
      specialty: "медицина, бинты, противоядия",
      location: anchors.village?.name ?? anchors.hub?.name ?? "Эшфорд",
      map: actorCoordLabel(anchors.village ?? anchors.hub),
    },
  ].slice(0, Math.max(0, 3 - existingRows.length)).map(row => ({
    ...row,
    status: "planned",
    statusLabel: "рекомендовано",
    tone: "is-warn",
    purpose: "Создать или назначить перед полным торговым тестом, если подходящего торговца еще нет.",
  }));

  return [...existingRows, ...fallbackRows];
}

function buildFirstSessionRumorRows(prep = {}) {
  const historyRows = (prep.hooks ?? []).slice(0, 4).map(text => ({
    source: "история мира",
    text,
  }));
  const generatedRows = (prep.settlements ?? [])
    .slice(0, Math.max(0, 5 - historyRows.length))
    .map(settlement => ({
      source: settlement.name,
      text: makeSettlementRumor(settlement),
    }));
  return [...historyRows, ...generatedRows].slice(0, 5);
}

function buildFirstSessionChecklist(prep = {}) {
  const checks = [
    "World Map: пройти глобальная -> региональная -> локальная -> энкаунтер и обратно без потери фокуса.",
    "Hotspots: кликнуть узел, рынок/дом, дикую местность и шахту/пещеру.",
    "Инвентарь: купить предметы, принудить pending-распределение, авторазместить, перетащить вручную и экипировать оружие.",
    "Торговля: проверить цены в меди/серебре/золоте, сток торговца и передачу предметов.",
    "Бой: провести melee/ranged попадание, удар по прочности брони/щита и AoE с защитой по каждой цели.",
    "Медицина: применить лечение раны/кровотечения и убедиться, что восстановление не ломает sheets.",
    "Лут: победить или обойти угрозу, сгенерировать лут и перенести его в Tarkov inventory grid.",
  ];
  if (!prep.merchants?.length) checks.push("Content gap: создать или назначить хотя бы одного торговца перед финальным прогоном сессии.");
  if (prep.unmappedPois?.length) checks.push(`Map gap: ${prep.unmappedPois.length} POI еще нуждаются в координатах карты.`);
  return checks;
}

function buildFirstSessionPrepSummary(regionPrepRows = []) {
  const row = regionPrepRows.find(r => regionNameForTools(r.region) === FIRST_SESSION_TARGET_REGION) ?? regionPrepRows[0] ?? null;
  return {
    region: row?.region ?? FIRST_SESSION_TARGET_REGION,
    readiness: row?.readiness ?? 0,
    status: row?.status ?? "ожидает данных",
    tone: row?.tone ?? "is-warn",
    sceneSlots: 5,
    npcRoles: Math.min(8, NPC_EXACT_TIER_PREVIEW_ACTORS.length),
    merchantSlots: Math.max(3, row?.merchants ?? 0),
    mappedPois: row ? `${row.mappedPois}/${row.pois}` : "0/0",
  };
}

function buildSessionPrepData(regionName = "", focusPoiId = "") {
  const region = regionNameForTools(regionName);
  const settlements = getSettlements()
    .filter(s => regionNameForTools(s.system?.info?.region) === region)
    .sort((a, b) => Number(b.system?.info?.danger ?? 0) - Number(a.system?.info?.danger ?? 0));
  const pois = getPois()
    .filter(p => regionNameForTools(p.system?.info?.region) === region)
    .sort((a, b) => Number(b.system?.state?.threatLevel ?? b.system?.info?.danger ?? 0) - Number(a.system?.state?.threatLevel ?? a.system?.info?.danger ?? 0));
  const focusPoi = focusPoiId ? game.actors?.get(focusPoiId) : pois[0] ?? null;
  const mappedPois = pois.filter(p => isValidMapCoord(p.system?.info?.mapCol, p.system?.info?.mapRow));
  const unmappedPois = pois.filter(p => !isValidMapCoord(p.system?.info?.mapCol, p.system?.info?.mapRow));
  const merchants = getMerchants().filter(m => {
    const settlement = findSettlementByName(m.system?.info?.settlement ?? "");
    return settlement ? regionNameForTools(settlement.system?.info?.region) === region : false;
  });

  const questSeeds = settlements.slice(0, 3).map(settlement => generateQuestForSettlement(settlement));
  const hooks = [
    ...settlements.map(s => s.system?.regionSim?.lastRegionEvent).filter(Boolean),
    ...settlements.flatMap(s => Array.isArray(s.system?.history?.rumors) ? s.system.history.rumors.slice(0, 1) : []),
    ...pois.map(p => p.system?.state?.lastGeneratedEvent).filter(Boolean),
  ].slice(0, 8);

  const base = { region, settlements, pois, focusPoi, mappedPois, unmappedPois, merchants, questSeeds, hooks };
  const firstSessionScenes = buildFirstSessionSceneRows(base);
  const firstSessionNpcRows = buildFirstSessionNpcRows(base);
  const firstSessionMerchantRows = buildFirstSessionMerchantRows(base);
  const firstSessionRumorRows = buildFirstSessionRumorRows(base);
  const firstSessionChecklist = buildFirstSessionChecklist(base);

  return {
    ...base,
    firstSessionScenes,
    firstSessionNpcRows,
    firstSessionMerchantRows,
    firstSessionRumorRows,
    firstSessionChecklist,
  };
}

function firstSessionCollectionSize(collection) {
  if (!collection) return 0;
  if (Number.isFinite(Number(collection.size))) return Number(collection.size);
  if (Array.isArray(collection)) return collection.length;
  if (typeof collection === "object") return Object.keys(collection).length;
  return 0;
}

function firstSessionRunbookTone(status = "todo") {
  if (status === "ok") return "is-good";
  if (status === "warn" || status === "manual") return "is-warn";
  if (status === "block") return "is-danger";
  return "is-todo";
}

function firstSessionRunbookStatusLabel(status = "todo") {
  if (status === "ok") return "готово";
  if (status === "warn") return "можно прогонять";
  if (status === "manual") return "ручная проверка";
  if (status === "block") return "блокер";
  return "ожидает данных";
}

function firstSessionRunbookGate({ id, label, status, summary, action = "", metric = "" }) {
  return {
    id,
    label,
    status,
    statusLabel: firstSessionRunbookStatusLabel(status),
    tone: firstSessionRunbookTone(status),
    summary,
    action,
    metric,
  };
}

function firstSessionRunbookScenario({ id, label, anchor = null, status, objective, checks = [], pass = "", systems = [], risk = "" }) {
  return {
    id,
    label,
    anchor: anchor?.name ?? "ручная сцена",
    map: actorCoordLabel(anchor),
    status,
    statusLabel: firstSessionRunbookStatusLabel(status),
    tone: firstSessionRunbookTone(status),
    objective,
    checks,
    pass,
    systems,
    systemsLabel: systems.join(" · "),
    risk,
    checkCount: checks.length,
  };
}

function getFirstSessionNpcActors() {
  const roles = new Set(firstSessionBlueprintNpcSeeds().map(seed => seed.sceneRole).filter(Boolean));
  return (game.actors?.filter(actor => actor.type === "npc") ?? []).filter(actor => {
    const role = actor.system?.info?.sceneRole ?? "";
    return roles.has(role);
  });
}

function getFirstSessionQuestActors() {
  const names = new Set(FIRST_SESSION_CONTENT_BLUEPRINT.quests.map(seed => seed.name));
  return getQuests().filter(quest =>
    names.has(quest.name)
    || quest.system?.chain?.chainId === "iron-hills-first-session"
    || quest.system?.chain?.arcType === "first-session"
  );
}

function firstSessionRoleActor(sceneRole) {
  return getFirstSessionNpcActors().find(actor => actor.system?.info?.sceneRole === sceneRole) ?? null;
}

function firstSessionPoiBySeedId(seedId) {
  const seed = FIRST_SESSION_CONTENT_BLUEPRINT.pois.find(row => row.id === seedId);
  if (!seed) return null;
  return getPois().find(poi => poi.name === seed.name) ?? null;
}

function countFirstSessionRumors(prep = {}) {
  return (prep.settlements ?? []).reduce((sum, settlement) => {
    const rumors = settlement.system?.history?.rumors;
    return sum + (Array.isArray(rumors) ? rumors.length : 0);
  }, 0);
}

function buildFirstSessionRunbookSnapshot(regionName = FIRST_SESSION_TARGET_REGION, focusPoiId = "") {
  const prep = buildSessionPrepData(regionName, focusPoiId);
  const row = getRegionPrepRows().find(regionRow => regionNameForTools(regionRow.region) === regionNameForTools(prep.region)) ?? null;
  const anchors = buildFirstSessionAnchors(prep);
  const npcActors = getFirstSessionNpcActors();
  const questActors = getFirstSessionQuestActors();
  const merchantStockItems = prep.merchants.reduce((sum, merchant) => sum + firstSessionCollectionSize(merchant.items), 0);
  const rumorCount = countFirstSessionRumors(prep);
  const mappedPoiCount = prep.mappedPois.length;
  const requiredPoiCount = FIRST_SESSION_CONTENT_BLUEPRINT.pois.length;
  const requiredSettlementCount = FIRST_SESSION_CONTENT_BLUEPRINT.settlements.length;
  const hasWorldMapApi = typeof game.ironHills?.openWorldMap === "function";
  const hasWorldMapLevelApi = typeof game.ironHills?.openWorldMapLevel === "function";
  const hasCombatHudApi = typeof game.ironHills?.openCombatHud === "function"
    || typeof game.ironHills?.openCombatHUD === "function"
    || typeof game.ironHills?.openCompactCombatHud === "function"
    || Boolean(game.ironHills?.apps?.combatHud);
  const hasMaterializeApi = typeof game.ironHills?.materializeFirstSession === "function";
  const hasTrade = prep.merchants.length >= FIRST_SESSION_CONTENT_BLUEPRINT.merchants.length && merchantStockItems > 0;
  const hasRoadThreat = Boolean(anchors.roadThreat ?? firstSessionPoiBySeedId("western-road"));
  const hasWilderness = Boolean(anchors.wilderness ?? firstSessionPoiBySeedId("black-bor"));
  const hasMine = Boolean(anchors.minePoi ?? firstSessionPoiBySeedId("deep-seam"));
  const hasHealer = Boolean(firstSessionRoleActor("healer") ?? prep.merchants.find(merchant => merchant.system?.info?.specialty === "alchemist"));
  const hasRepair = Boolean(firstSessionRoleActor("repair-and-trade") ?? prep.merchants.find(merchant => merchant.system?.info?.specialty === "weaponsmith"));

  const gates = [
    firstSessionRunbookGate({
      id: "world-layer",
      label: "Слой мира",
      status: prep.settlements.length >= requiredSettlementCount && prep.pois.length >= requiredPoiCount && questActors.length >= 3
        ? "ok"
        : prep.settlements.length || prep.pois.length ? "warn" : "block",
      summary: `${prep.settlements.length}/${requiredSettlementCount} поселений · ${prep.pois.length}/${requiredPoiCount} POI · ${questActors.length}/3 квестов`,
      action: hasMaterializeApi ? "Если слой неполный, нажми «Создать слой Iron Hills»." : "Проверь регистрацию game.ironHills.materializeFirstSession.",
      metric: `${prep.settlements.length + prep.pois.length + questActors.length}`,
    }),
    firstSessionRunbookGate({
      id: "map-route",
      label: "Маршрут карты",
      status: mappedPoiCount >= requiredPoiCount && hasWorldMapApi && hasWorldMapLevelApi ? "ok" : mappedPoiCount > 0 ? "warn" : "block",
      summary: `${mappedPoiCount}/${Math.max(requiredPoiCount, prep.pois.length)} POI на карте · World Map ${hasWorldMapApi ? "API есть" : "API нет"} · focus ${hasWorldMapLevelApi ? "есть" : "нет"}`,
      action: "Открой World Map и пройди якоря первой сессии: 1-5 через region/local/encounter.",
      metric: `${mappedPoiCount}/${Math.max(requiredPoiCount, prep.pois.length)}`,
    }),
    firstSessionRunbookGate({
      id: "trade-inventory",
      label: "Торговля и инвентарь",
      status: hasTrade ? "manual" : prep.merchants.length ? "warn" : "block",
      summary: `${prep.merchants.length}/3 торговцев · ${merchantStockItems} предметов в стоке`,
      action: "Купить оружие/броню/медицину, проверить pending и ручное размещение.",
      metric: String(merchantStockItems),
    }),
    firstSessionRunbookGate({
      id: "combat-layer",
      label: "Боевой слой",
      status: hasRoadThreat && hasCombatHudApi ? "manual" : hasRoadThreat ? "warn" : "block",
      summary: `Дорожная угроза ${hasRoadThreat ? "есть" : "нет"} · Combat HUD ${hasCombatHudApi ? "доступен" : "не подтверждён"}`,
      action: "Проверить single-target, ranged, броню/щит, AoE и friendly fire вручную.",
      metric: hasCombatHudApi ? "HUD" : "manual",
    }),
    firstSessionRunbookGate({
      id: "medicine-recovery",
      label: "Медицина",
      status: hasHealer ? "manual" : "warn",
      summary: hasHealer ? "есть знахарка/алхимик или healer NPC" : "нет явного healer-якоря",
      action: "После боя нанести рану/кровотечение и применить лечение.",
      metric: hasHealer ? "healer" : "gap",
    }),
    firstSessionRunbookGate({
      id: "quests-rumors",
      label: "Квесты и слухи",
      status: questActors.length >= 3 && rumorCount >= 3 ? "ok" : questActors.length ? "warn" : "block",
      summary: `${questActors.length}/3 квестов · ${rumorCount} слухов`,
      action: "Выдать дорожный квест, закрепить лесной след и оставить шахту как эскалацию.",
      metric: `${questActors.length}/${rumorCount}`,
    }),
  ];

  const scenarios = [
    firstSessionRunbookScenario({
      id: "opening",
      label: "Открытие: Ривергейт",
      anchor: anchors.hub,
      status: anchors.hub ? "ok" : "block",
      objective: "Дать группе безопасный вход, карту региона, первый слух и причину идти на западную дорогу.",
      systems: ["World Map", "NPC", "Quest"],
      checks: [
        "Открыть World Map и показать якорь 1.",
        "Открыть лист Ривергейта/стража или NPC-патрона.",
        "Выдать квест «Дорога в Железные Холмы».",
      ],
      pass: "Игроки понимают, куда идти, и видят маршрут на карте.",
      risk: "Если поселение не создано, сначала материализуй слой Iron Hills.",
    }),
    firstSessionRunbookScenario({
      id: "market",
      label: "Рынок: торговля и pending",
      anchor: prep.merchants[0] ?? anchors.hub,
      status: hasTrade ? "manual" : "block",
      objective: "Проверить покупку, валюту, pending-окно и обязательное распределение предметов.",
      systems: ["Trade", "Tarkov inventory", "Pending"],
      checks: [
        "Открыть торговца общей лавки и купить оружие/расходник.",
        "Нажать авторазмещение, затем вручную перетащить один предмет.",
        "Убедиться, что предмет нельзя носить нераспределённым.",
      ],
      pass: "После покупки все предметы лежат в слотах/контейнерах, pending пуст.",
      risk: "Если сток пустой, нажать restock или повторно материализовать слой.",
    }),
    firstSessionRunbookScenario({
      id: "road-combat",
      label: "Западная дорога: первый бой",
      anchor: anchors.roadThreat ?? firstSessionPoiBySeedId("western-road"),
      status: hasRoadThreat ? "manual" : "block",
      objective: "Проверить базовый боевой цикл, попадания по частям тела, броню/щит и friendly fire.",
      systems: ["Combat HUD", "Armor durability", "AoE"],
      checks: [
        "Провести одну melee/ranged атаку по одиночной цели.",
        "Провести удар в щит/броню и проверить потерю прочности.",
        "Провести AoE/line атаку по нескольким целям с отдельной защитой.",
      ],
      pass: "Урон проходит через щит/броню по описанной модели, AoE считает цели отдельно.",
      risk: "Боевой слой всё ещё требует живого Foundry-прогона.",
    }),
    firstSessionRunbookScenario({
      id: "wilderness-medicine",
      label: "Чёрный Бор: раны и лут",
      anchor: anchors.wilderness ?? firstSessionPoiBySeedId("black-bor"),
      status: hasWilderness && hasHealer ? "manual" : hasWilderness ? "warn" : "block",
      objective: "Проверить wilderness-сцену, монстра/контакт, раны, лечение и перенос добычи.",
      systems: ["Medicine", "Loot", "Travel"],
      checks: [
        "Сгенерировать или открыть wilderness/forest сцену.",
        "Нанести лёгкую/среднюю рану и применить лечение.",
        "Сгенерировать лут и перенести его в Tarkov grid.",
      ],
      pass: "Лечение меняет состояние частей тела без поломки sheet, лут переносится в инвентарь.",
      risk: "Если healer/алхимик не найден, медицина проверяется через расходники персонажа.",
    }),
    firstSessionRunbookScenario({
      id: "mine-escalation",
      label: "Глубокий Пласт: эскалация",
      anchor: anchors.minePoi ?? firstSessionPoiBySeedId("deep-seam") ?? anchors.mineSettlement,
      status: hasMine && hasRepair ? "manual" : hasMine ? "warn" : "block",
      objective: "Оставить сильный крючок на шахту, ремонт, броню и магическую угрозу.",
      systems: ["Armor repair", "Craft", "Magic hook"],
      checks: [
        "Открыть шахтёрский/пещерный encounter.",
        "Показать ремонт/кузнеца и проверить броню после боя.",
        "Дать магическую зацепку без обязательного полного боя, если группа не готова.",
      ],
      pass: "У GM есть понятный следующий шаг кампании после первой сессии.",
      risk: "Шахту можно не играть в первой сессии, если дорожный бой занял больше времени.",
    }),
  ];

  const statusWeight = { ok: 1, manual: 0.72, warn: 0.45, block: 0, todo: 0.2 };
  const gateScore = gates.reduce((sum, gate) => sum + (statusWeight[gate.status] ?? 0), 0) / Math.max(1, gates.length);
  const scenarioScore = scenarios.reduce((sum, scenario) => sum + (statusWeight[scenario.status] ?? 0), 0) / Math.max(1, scenarios.length);
  const scorePct = Math.round((gateScore * 0.62 + scenarioScore * 0.38) * 100);
  const blockers = gates.filter(gate => gate.status === "block").length + scenarios.filter(scenario => scenario.status === "block").length;
  const manualChecks = gates.filter(gate => gate.status === "manual").length + scenarios.filter(scenario => scenario.status === "manual").length;
  const warnings = gates.filter(gate => gate.status === "warn").length + scenarios.filter(scenario => scenario.status === "warn").length;
  const status = blockers ? "block" : scorePct >= 82 ? "ok" : "warn";
  const timeline = [
    "00:00 Ривергейт: вход, слухи, карта, цель.",
    "00:20 Рынок: покупка, pending, ручное размещение.",
    "00:45 Западная дорога: первый бой, броня/щит, AoE.",
    "01:30 Чёрный Бор: раны, лечение, лут.",
    "02:10 Копёрный Пик/Глубокий Пласт: ремонт, награда, следующий крючок.",
  ];
  const riskLines = [
    ...(blockers ? [`Блокеров: ${blockers}. Сначала закрыть красные пункты runbook.`] : []),
    ...(manualChecks ? [`Ручных проверок: ${manualChecks}. Их нужно прогнать в Foundry перед сессией.`] : []),
    ...(warnings ? [`Предупреждений: ${warnings}. Можно проводить тестово, но лучше закрыть.`] : []),
    ...(merchantStockItems ? [] : ["Сток торговцев не подтверждён: после materialize проверь restock."]),
  ];

  return {
    region: prep.region,
    scorePct,
    status,
    statusLabel: blockers ? "есть блокеры" : scorePct >= 82 ? "готов к пробной сессии" : "нужен ручной прогон",
    tone: firstSessionRunbookTone(status),
    blockers,
    warnings,
    manualChecks,
    gates,
    scenarios,
    timeline,
    riskLines,
    hasRisks: riskLines.length > 0,
    facts: {
      settlements: prep.settlements.length,
      pois: prep.pois.length,
      mappedPois: mappedPoiCount,
      merchants: prep.merchants.length,
      merchantStockItems,
      npcs: npcActors.length,
      quests: questActors.length,
      rumors: rumorCount,
      readiness: row?.readiness ?? 0,
    },
  };
}

function firstSessionQaStatusLabel(status = "todo") {
  if (status === "ok") return "готово";
  if (status === "manual") return "ручной прогон";
  if (status === "warn") return "есть риск";
  if (status === "block") return "блокер";
  return "нет данных";
}

function firstSessionQaCheck({ id, label, status, summary, action = "", metric = "", rows = [] }) {
  return {
    id,
    label,
    status,
    statusLabel: firstSessionQaStatusLabel(status),
    tone: firstSessionRunbookTone(status),
    summary,
    action,
    metric,
    rows,
    hasRows: rows.length > 0,
  };
}

function firstSessionBlueprintDocumentRows() {
  const settlementRows = FIRST_SESSION_CONTENT_BLUEPRINT.settlements.map(seed => {
    const actor = findWorldActorByTypeAndName("settlement", seed.name);
    const info = actor?.system?.info ?? {};
    const rumors = actor?.system?.history?.rumors;
    const hasMap = isValidMapCoord(info.mapCol, info.mapRow);
    return {
      kind: "settlement",
      label: "Поселение",
      name: seed.name,
      actorId: actor?.id ?? "",
      found: Boolean(actor),
      linked: Boolean(actor && hasMap && Array.isArray(rumors) && rumors.length),
      status: actor && hasMap ? "ok" : actor ? "warn" : "block",
      note: actor
        ? `${hasMap ? `[${info.mapCol}, ${info.mapRow}]` : "нет координат"} · слухи ${Array.isArray(rumors) ? rumors.length : 0}`
        : "документ не создан",
    };
  });

  const poiRows = FIRST_SESSION_CONTENT_BLUEPRINT.pois.map(seed => {
    const actor = findWorldActorByTypeAndName("poi", seed.name);
    const info = actor?.system?.info ?? {};
    const hasMap = isValidMapCoord(info.mapCol, info.mapRow);
    return {
      kind: "poi",
      label: "POI",
      name: seed.name,
      actorId: actor?.id ?? "",
      found: Boolean(actor),
      linked: Boolean(actor && hasMap && info.nearestSettlementId),
      status: actor && hasMap && info.nearestSettlementId ? "ok" : actor ? "warn" : "block",
      note: actor
        ? `${hasMap ? `[${info.mapCol}, ${info.mapRow}]` : "нет координат"} · ${info.nearestSettlementId ? "settlement link" : "нет settlement link"}`
        : "документ не создан",
    };
  });

  const merchantRows = FIRST_SESSION_CONTENT_BLUEPRINT.merchants.map(seed => {
    const actor = findWorldActorByTypeAndName("merchant", seed.name);
    const info = actor?.system?.info ?? {};
    const itemCount = firstSessionCollectionSize(actor?.items);
    const currency = actor?.system?.currency ?? {};
    const copperTotal = Number(currency.copper ?? 0) + Number(currency.silver ?? 0) * 100 + Number(currency.gold ?? 0) * 10000;
    return {
      kind: "merchant",
      label: "Торговец",
      name: seed.name,
      actorId: actor?.id ?? "",
      found: Boolean(actor),
      linked: Boolean(actor && info.settlementId && itemCount > 0),
      status: actor && info.settlementId && itemCount > 0 ? "ok" : actor ? "warn" : "block",
      note: actor
        ? `${info.settlementId ? "settlement link" : "нет settlement link"} · сток ${itemCount} · валюта ${copperTotal} мед.`
        : "документ не создан",
      itemCount,
    };
  });

  const npcRows = firstSessionBlueprintNpcSeeds().map(seed => {
    const actor = findWorldActorByTypeAndName("npc", seed.label);
    const info = actor?.system?.info ?? {};
    const itemCount = firstSessionCollectionSize(actor?.items);
    const hasPlacement = Boolean(info.locationId || isValidMapCoord(info.mapCol, info.mapRow));
    return {
      kind: "npc",
      label: "NPC",
      name: seed.label,
      actorId: actor?.id ?? "",
      found: Boolean(actor),
      linked: Boolean(actor && info.sceneRole && hasPlacement),
      status: actor && info.sceneRole && hasPlacement ? "ok" : actor ? "warn" : "block",
      note: actor
        ? `${info.sceneRole || "нет sceneRole"} · ${hasPlacement ? "якорь есть" : "нет якоря"} · предметы ${itemCount}`
        : "документ не создан",
      itemCount,
    };
  });

  const questRows = FIRST_SESSION_CONTENT_BLUEPRINT.quests.map(seed => {
    const actor = findWorldActorByTypeAndName("quest", seed.name);
    const info = actor?.system?.info ?? {};
    return {
      kind: "quest",
      label: "Квест",
      name: seed.name,
      actorId: actor?.id ?? "",
      found: Boolean(actor),
      linked: Boolean(actor && info.settlementId && info.targetPOIId),
      status: actor && info.settlementId && info.targetPOIId ? "ok" : actor ? "warn" : "block",
      note: actor
        ? `${info.status || "status?"} · ${info.settlementId ? "settlement link" : "нет settlement link"} · ${info.targetPOIId ? "POI link" : "нет POI link"}`
        : "документ не создан",
    };
  });

  return [...settlementRows, ...poiRows, ...merchantRows, ...npcRows, ...questRows];
}

function firstSessionApiRows() {
  const apiChecks = [
    { id: "openWorldTools", label: "World Tools", ok: typeof game.ironHills?.openWorldTools === "function" },
    { id: "openWorldMap", label: "World Map", ok: typeof game.ironHills?.openWorldMap === "function" },
    { id: "openCombatHud", label: "Combat HUD", ok: typeof game.ironHills?.openCombatHud === "function" || typeof game.ironHills?.openCombatHUD === "function" },
    { id: "openTrade", label: "Trade", ok: typeof game.ironHills?.openTrade === "function" },
    { id: "openGridInventory", label: "Tarkov inventory", ok: typeof game.ironHills?.openGridInventory === "function" },
    { id: "sessionReadiness", label: "Session readiness", ok: typeof game.ironHills?.sessionReadiness === "function" },
    { id: "runtimeSmoke", label: "Runtime smoke", ok: typeof game.ironHills?.runRuntimeSmoke === "function" },
  ];
  return apiChecks.map(row => ({
    ...row,
    status: row.ok ? "ok" : "block",
    statusLabel: row.ok ? "готово" : "нет API",
    tone: row.ok ? "is-good" : "is-danger",
    note: row.ok ? `game.ironHills.${row.id}` : `game.ironHills.${row.id} не зарегистрирован`,
  }));
}

function buildFirstSessionQaSnapshot(regionName = FIRST_SESSION_TARGET_REGION, focusPoiId = "") {
  const runbook = buildFirstSessionRunbookSnapshot(regionName, focusPoiId);
  const docRows = firstSessionBlueprintDocumentRows();
  const apiRows = firstSessionApiRows();
  const settlementRows = docRows.filter(row => row.kind === "settlement");
  const poiRows = docRows.filter(row => row.kind === "poi");
  const merchantRows = docRows.filter(row => row.kind === "merchant");
  const npcRows = docRows.filter(row => row.kind === "npc");
  const questRows = docRows.filter(row => row.kind === "quest");
  const missingDocs = docRows.filter(row => !row.found);
  const weakLinks = docRows.filter(row => row.found && !row.linked);
  const emptyStock = merchantRows.filter(row => row.found && Number(row.itemCount ?? 0) <= 0);
  const missingApis = apiRows.filter(row => !row.ok);
  const manualRows = runbook.scenarios.map(scenario => ({
    id: scenario.id,
    label: scenario.label,
    status: scenario.status === "block" ? "block" : "manual",
    statusLabel: scenario.status === "block" ? "блокер" : "ручной прогон",
    tone: scenario.status === "block" ? "is-danger" : "is-warn",
    note: `${scenario.map} · ${scenario.systemsLabel || "systems"}`,
  }));

  const checks = [
    firstSessionQaCheck({
      id: "documents",
      label: "Документы слоя",
      status: missingDocs.length ? "block" : "ok",
      summary: `${docRows.length - missingDocs.length}/${docRows.length} документов найдено`,
      action: missingDocs.length ? "Нажать «Создать слой Iron Hills» и повторить QA." : "Документный слой собран.",
      metric: `${docRows.length - missingDocs.length}/${docRows.length}`,
      rows: docRows,
    }),
    firstSessionQaCheck({
      id: "links",
      label: "Связи и карта",
      status: weakLinks.length ? "warn" : "ok",
      summary: `${docRows.length - weakLinks.length}/${docRows.length} документов имеют нужные связи`,
      action: weakLinks.length ? "Повторить materialize: linking pass безопасно обновит id/координаты." : "Связи выглядят собранными.",
      metric: `${docRows.length - weakLinks.length}/${docRows.length}`,
      rows: weakLinks,
    }),
    firstSessionQaCheck({
      id: "trade-stock",
      label: "Торговля и сток",
      status: merchantRows.some(row => row.status === "block") || emptyStock.length ? "block" : "manual",
      summary: `${merchantRows.length - emptyStock.length}/${merchantRows.length} торговцев со стоком`,
      action: emptyStock.length ? "Повторить materialize или restock merchants перед торговым тестом." : "Проверить покупку, валюту, pending и ручное размещение.",
      metric: `${merchantRows.reduce((sum, row) => sum + Number(row.itemCount ?? 0), 0)} items`,
      rows: merchantRows,
    }),
    firstSessionQaCheck({
      id: "npc-roles",
      label: "NPC роли",
      status: npcRows.some(row => row.status === "block") ? "block" : npcRows.some(row => row.status === "warn") ? "warn" : "ok",
      summary: `${npcRows.filter(row => row.found).length}/${npcRows.length} NPC первой сессии`,
      action: "Открыть карту и проверить, что NPC отображаются рядом со своими якорями.",
      metric: `${npcRows.filter(row => row.linked).length}/${npcRows.length}`,
      rows: npcRows,
    }),
    firstSessionQaCheck({
      id: "quest-hooks",
      label: "Квесты и слухи",
      status: questRows.some(row => row.status === "block") ? "block" : questRows.some(row => row.status === "warn") || runbook.facts.rumors < 3 ? "warn" : "ok",
      summary: `${questRows.filter(row => row.found).length}/${questRows.length} квестов · ${runbook.facts.rumors} слухов`,
      action: "Выдать первый дорожный квест и проверить, что quest board/журнал видят цель.",
      metric: `${questRows.filter(row => row.linked).length}/${questRows.length}`,
      rows: questRows,
    }),
    firstSessionQaCheck({
      id: "apis",
      label: "GM API и окна",
      status: missingApis.length ? "block" : "ok",
      summary: `${apiRows.length - missingApis.length}/${apiRows.length} API доступны`,
      action: missingApis.length ? "Проверить ready hook и регистрацию game.ironHills API." : "Можно открывать окна из HUD/Launcher.",
      metric: `${apiRows.length - missingApis.length}/${apiRows.length}`,
      rows: apiRows,
    }),
    firstSessionQaCheck({
      id: "manual-scenarios",
      label: "Ручной прогон",
      status: runbook.blockers ? "block" : "manual",
      summary: `${runbook.scenarios.length} сценариев · ${runbook.manualChecks} ручных проверок`,
      action: "После зеленого document/link слоя пройти торговлю, бой, медицину, AoE и карту в Foundry.",
      metric: `${runbook.scorePct}% runbook`,
      rows: manualRows,
    }),
  ];

  const statusWeight = { ok: 1, manual: 0.72, warn: 0.42, block: 0, todo: 0.15 };
  const scorePct = Math.round(checks.reduce((sum, check) => sum + (statusWeight[check.status] ?? 0), 0) / Math.max(1, checks.length) * 100);
  const blockers = checks.filter(check => check.status === "block").length;
  const warnings = checks.filter(check => check.status === "warn").length;
  const manualChecks = checks.filter(check => check.status === "manual").length + runbook.manualChecks;
  const status = blockers ? "block" : scorePct >= 85 ? "ok" : "warn";
  const nextActions = [
    ...(missingDocs.length ? [`Создать недостающие документы: ${missingDocs.slice(0, 5).map(row => row.name).join(", ")}${missingDocs.length > 5 ? "..." : ""}`] : []),
    ...(weakLinks.length ? [`Повторить materialize/linking pass: слабых связей ${weakLinks.length}.`] : []),
    ...(emptyStock.length ? [`Пополнить сток торговцев: ${emptyStock.map(row => row.name).join(", ")}.`] : []),
    ...(missingApis.length ? [`Починить регистрацию API: ${missingApis.map(row => row.id).join(", ")}.`] : []),
    ...(!missingDocs.length && !weakLinks.length && !emptyStock.length && !missingApis.length ? ["Перейти к ручному Foundry-прогону: карта -> торговля -> бой -> медицина -> лут."] : []),
  ].slice(0, 6);

  return {
    region: runbook.region,
    scorePct,
    status,
    statusLabel: blockers ? "есть блокеры слоя" : scorePct >= 85 ? "готов к ручному прогону" : "нужна стабилизация",
    tone: firstSessionRunbookTone(status),
    blockers,
    warnings,
    manualChecks,
    checks,
    hasChecks: checks.length > 0,
    docRows,
    settlementRows,
    poiRows,
    merchantRows,
    npcRows,
    questRows,
    apiRows,
    nextActions,
    hasNextActions: nextActions.length > 0,
    runbook,
    facts: {
      documents: docRows.length,
      foundDocuments: docRows.filter(row => row.found).length,
      linkedDocuments: docRows.filter(row => row.linked).length,
      missingDocuments: missingDocs.length,
      weakLinks: weakLinks.length,
      emptyStock: emptyStock.length,
      apiMissing: missingApis.length,
    },
  };
}

function combatQaStatusLabel(status = "todo") {
  if (status === "ok") return "готово";
  if (status === "manual") return "ручной прогон";
  if (status === "warn") return "есть риск";
  if (status === "block") return "блокер";
  return "нет данных";
}

function combatQaRow({
  id,
  label,
  status = "ok",
  summary = "",
  note = "",
  metric = "",
  expected = "",
  actual = "",
  category = "",
}) {
  return {
    id,
    label,
    status,
    statusLabel: combatQaStatusLabel(status),
    tone: firstSessionRunbookTone(status),
    summary,
    note,
    metric,
    expected,
    actual,
    category,
  };
}

function combatQaCheck({ id, label, status, summary, action = "", metric = "", rows = [] }) {
  return {
    id,
    label,
    status,
    statusLabel: combatQaStatusLabel(status),
    tone: firstSessionRunbookTone(status),
    summary,
    action,
    metric,
    rows,
    hasRows: rows.length > 0,
  };
}

function combatQaApiRows() {
  const ih = globalThis.game?.ironHills ?? {};
  const apiChecks = [
    { id: "openCombatHud", label: "Combat HUD", ok: typeof ih.openCombatHud === "function", note: "основное окно боя" },
    { id: "openCombatHUD", label: "Combat HUD alias", ok: typeof ih.openCombatHUD === "function", note: "совместимый алиас для макросов" },
    { id: "openCompactCombatHud", label: "Compact HUD", ok: typeof ih.openCompactCombatHud === "function", note: "компактный режим боя" },
    { id: "openCombatManager", label: "Combat manager", ok: typeof ih.openCombatManager === "function", note: "GM/боевой менеджер" },
    { id: "openCombatTechnique", label: "Technique picker", ok: typeof ih.openCombatTechnique === "function", note: "выбор техники атаки" },
    { id: "placeAoe", label: "AoE template", ok: typeof ih.placeAoe === "function", note: "размещение области" },
    { id: "applyAoe", label: "AoE apply", ok: typeof ih.applyAoe === "function", note: "применение области по целям" },
    { id: "AOE_TYPES", label: "AoE registry", ok: ih.AOE_TYPES && Object.keys(ih.AOE_TYPES).length > 0, note: "типы областей зарегистрированы" },
    { id: "runRuntimeSmoke", label: "Runtime smoke", ok: typeof ih.runRuntimeSmoke === "function", note: "быстрый runtime-прогон" },
    { id: "syncDerivedConditions", label: "Derived conditions", ok: typeof ih.syncDerivedConditions === "function", note: "синхронизация травм/состояний" },
    { id: "endTurnForActor", label: "End turn", ok: typeof ih.endTurnForActor === "function", note: "ход/энергия/6 секунд" },
    { id: "rest", label: "Rest command", ok: typeof ih.rest === "function" || typeof ih.restShort === "function" || typeof ih.restLong === "function", note: "лечение и восстановление" },
    { id: "openGridInventory", label: "Tarkov inventory", ok: typeof ih.openGridInventory === "function", note: "инвентарь рядом с pending/боем" },
  ];

  return apiChecks.map(row => combatQaRow({
    id: row.id,
    label: row.label,
    status: row.ok ? "ok" : "block",
    metric: row.ok ? "API" : "missing",
    summary: row.ok ? row.note : `game.ironHills.${row.id} не зарегистрирован`,
    note: row.ok ? `game.ironHills.${row.id}` : "ready hook/API registration",
    category: "api",
  }));
}

function combatQaHitLocationRows() {
  const expectations = [
    { roll: 1, location: "neck", hp: "torso" },
    { roll: 2, location: "head", hp: "head" },
    { roll: 4, location: "torso", hp: "torso" },
    { roll: 8, location: "abdomen", hp: "abdomen" },
    { roll: 11, location: "leftArm", hp: "leftArm" },
    { roll: 14, location: "rightArm", hp: "rightArm" },
    { roll: 17, location: "leftLeg", hp: "leftLeg" },
    { roll: 19, location: "rightLeg", hp: "rightLeg" },
  ];

  return expectations.map(expected => {
    const actualLocation = getHitLocation(expected.roll);
    const actualHp = resolveDamageHpKey(actualLocation);
    const ok = actualLocation === expected.location && actualHp === expected.hp;
    return combatQaRow({
      id: `hit-${expected.roll}`,
      label: `d20=${expected.roll}`,
      status: ok ? "ok" : "block",
      metric: getHitLabel(actualLocation),
      summary: `${actualLocation} -> hp:${actualHp}`,
      expected: `${expected.location} -> hp:${expected.hp}`,
      actual: `${actualLocation} -> hp:${actualHp}`,
      note: ok ? "таблица попаданий согласована" : "расхождение таблицы попаданий",
      category: "hit",
    });
  });
}

function combatQaArmorSlotRows() {
  const expectations = [
    { location: "head", slot: "head" },
    { location: "neck", slot: "neck" },
    { location: "torso", slot: "torso" },
    { location: "abdomen", slot: "torso" },
    { location: "leftArm", slot: "leftArm" },
    { location: "rightArm", slot: "rightArm" },
    { location: "leftLeg", slot: "legs" },
    { location: "rightLeg", slot: "legs" },
  ];

  return expectations.map(expected => {
    const actual = getArmorSlotForLocation(expected.location);
    return combatQaRow({
      id: `armor-slot-${expected.location}`,
      label: getHitLabel(expected.location),
      status: actual === expected.slot ? "ok" : "block",
      metric: actual ?? "none",
      summary: `${expected.location} -> ${actual ?? "нет слота"}`,
      expected: expected.slot,
      actual: actual ?? "",
      note: expected.location === "abdomen" ? "живот защищается торсовой броней, но остается отдельной зоной травм/энергии" : "маршрутизация зоны в слот брони",
      category: "armor",
    });
  });
}

function combatQaMechanicRows() {
  const hitRows = combatQaHitLocationRows();
  const armorRows = combatQaArmorSlotRows();
  const shieldChances = [0, 6, 20].map(skill => ({
    skill,
    chance: getShieldInterceptChance(skill),
  }));
  const shieldOk = shieldChances.every(row => row.chance >= 0 && row.chance <= 0.55)
    && shieldChances[0].chance < shieldChances[1].chance
    && shieldChances[1].chance <= shieldChances[2].chance;
  const fixedAbdomen = buildAoeTargetZonePolicy({
    aoe: { targetZone: "abdomen", targetZoneMode: "fixed" },
  });
  const aimedHead = buildAoeTargetZonePolicy({
    aoe: { targetZone: "head", targetZoneMode: "aimed" },
  });
  const aoeConstantOk = ["circle", "cone", "ray"].every(key => AOE_SHAPE_KEYS.includes(key))
    && ["blast", "sweep", "chain"].every(key => AOE_TYPE_KEYS.includes(key))
    && AOE_FRIENDLY_FIRE_MODE_KEYS.includes("auto")
    && AOE_TARGET_ZONE_MODE_KEYS.includes("aimed")
    && BODY_ZONE_KEYS.includes("abdomen")
    && AOE_TARGETABLE_BODY_ZONE_KEYS.includes("abdomen")
    && !AOE_TARGETABLE_BODY_ZONE_KEYS.includes("shield");
  const aoeNormalizeOk = normalizeAoeShape("cone") === "cone"
    && normalizeAoeType("nova") === "nova"
    && normalizeAoeFriendlyFireMode("auto") === "auto"
    && normalizeAoeTargetZoneMode("targeted") === "fixed";
  const aoePolicyOk = fixedAbdomen.zone === "abdomen"
    && fixedAbdomen.mode === "fixed"
    && fixedAbdomen.usesFixedZone
    && aimedHead.zone === "head"
    && aimedHead.mode === "aimed"
    && aimedHead.requiresChoice;
  const traumaOk = ["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"]
    .every(key => BODY_TRAUMA_PART_KEYS.includes(key));

  return [
    ...hitRows,
    ...armorRows,
    combatQaRow({
      id: "shield-chance-curve",
      label: "Шанс щита",
      status: shieldOk ? "ok" : "block",
      metric: shieldChances.map(row => `${row.skill}:${Math.round(row.chance * 100)}%`).join(" / "),
      summary: "шанс растет от навыка и ограничен 55%",
      expected: "0..55%, monotonic",
      actual: shieldChances.map(row => `${row.skill}=${row.chance.toFixed(2)}`).join(", "),
      note: "щит может перехватить удар до слоя брони",
      category: "shield",
    }),
    combatQaRow({
      id: "aoe-policy-constants",
      label: "AoE константы",
      status: aoeConstantOk ? "ok" : "block",
      metric: `${AOE_SHAPE_KEYS.length} shapes / ${AOE_TYPE_KEYS.length} types`,
      summary: `friendly fire: ${AOE_FRIENDLY_FIRE_MODE_KEYS.join(", ")}; zones: ${AOE_TARGETABLE_BODY_ZONE_KEYS.length}`,
      expected: "circle/cone/ray, auto FF, aimed zone, abdomen targetable, shield excluded",
      actual: `${AOE_SHAPE_KEYS.join(", ")} / ${AOE_TYPE_KEYS.join(", ")}`,
      note: "политика области покрывает разные типы ударов и не целит щит как часть тела",
      category: "aoe",
    }),
    combatQaRow({
      id: "aoe-normalizers",
      label: "AoE normalizers",
      status: aoeNormalizeOk ? "ok" : "block",
      metric: "shape/type/FF/zone",
      summary: "алиасы и режимы приводятся к каноничным значениям",
      expected: "cone, nova, auto, fixed",
      actual: `${normalizeAoeShape("cone")}, ${normalizeAoeType("nova")}, ${normalizeAoeFriendlyFireMode("auto")}, ${normalizeAoeTargetZoneMode("targeted")}`,
      note: "важно для spell/item данных из каталогов",
      category: "aoe",
    }),
    combatQaRow({
      id: "aoe-zone-policy",
      label: "AoE зоны попаданий",
      status: aoePolicyOk ? "ok" : "block",
      metric: `${fixedAbdomen.mode}:${fixedAbdomen.zone} / ${aimedHead.mode}:${aimedHead.zone}`,
      summary: "фиксированные и прицельные зоны области работают отдельно от single-target",
      expected: "fixed abdomen + aimed head requiresChoice",
      actual: JSON.stringify({ fixedAbdomen, aimedHead }),
      note: "AoE может бить по разным зонам у каждой цели",
      category: "aoe",
    }),
    combatQaRow({
      id: "body-trauma-parts",
      label: "Зоны травм",
      status: traumaOk ? "ok" : "block",
      metric: `${BODY_TRAUMA_PART_KEYS.length} parts`,
      summary: BODY_TRAUMA_PART_KEYS.join(", "),
      expected: "head, torso, abdomen, left/right arms, left/right legs",
      actual: BODY_TRAUMA_PART_KEYS.join(", "),
      note: "abdomen сохранен как отдельная зона для энергии/травм",
      category: "medicine",
    }),
  ];
}

function combatQaRuntimeRows() {
  const ih = globalThis.game?.ironHills ?? {};
  const generation = Number(globalThis.game?.release?.generation ?? globalThis.game?.version?.split?.(".")?.[0] ?? 0);
  const build = Number(globalThis.game?.release?.build ?? 0);
  let vfxValue = null;
  let vfxOk = false;
  let vfxNote = "";
  try {
    vfxValue = globalThis.game?.settings?.get?.(SYSTEM_ID, "combatVfxEnabled");
    vfxOk = typeof vfxValue === "boolean";
    vfxNote = vfxOk ? "setting зарегистрирован" : "setting прочитан, но значение не boolean";
  } catch (err) {
    vfxNote = err?.message || "не удалось прочитать setting";
  }

  return [
    combatQaRow({
      id: "foundry-runtime",
      label: "Foundry runtime",
      status: generation === 12 ? "ok" : generation ? "warn" : "warn",
      metric: generation ? `v${generation}${build ? ` build ${build}` : ""}` : "unknown",
      summary: generation === 12 ? "текущая целевая среда v12" : "проверить вручную при запуске",
      note: generation && generation !== 12 ? "для v14 понадобится отдельный миграционный проход" : "совместимость v12",
      category: "runtime",
    }),
    combatQaRow({
      id: "combat-vfx-setting",
      label: "Combat VFX setting",
      status: vfxOk ? "ok" : "warn",
      metric: String(vfxValue),
      summary: vfxNote,
      note: "настройка визуальных попаданий/щита/брони",
      category: "runtime",
    }),
    combatQaRow({
      id: "combat-app-registry",
      label: "Combat app registry",
      status: ih.apps ? "ok" : "warn",
      metric: ih.apps ? Object.keys(ih.apps).length : "none",
      summary: ih.apps ? "game.ironHills.apps доступен" : "реестр окон появится после ready hook",
      note: "нужен для focus-safe HUD/Combat Manager",
      category: "runtime",
    }),
    combatQaRow({
      id: "world-actors-pool",
      label: "Actors pool",
      status: globalThis.game?.actors ? "ok" : "warn",
      metric: String(globalThis.game?.actors?.size ?? globalThis.game?.actors?.length ?? 0),
      summary: "мир доступен для ручного выбора целей",
      note: "сам QA не создает и не меняет актеров",
      category: "runtime",
    }),
  ];
}

function combatQaScenario({ id, label, status = "manual", summary, owner = "GM", minutes = 8, requires = [], steps = [] }) {
  return {
    id,
    label,
    status,
    statusLabel: combatQaStatusLabel(status),
    tone: firstSessionRunbookTone(status),
    summary,
    owner,
    minutes,
    requires,
    requiresLabel: requires.join(", "),
    steps,
    stepCount: steps.length,
    hasSteps: steps.length > 0,
  };
}

function buildCombatQaScenarioRows(apiRows = [], mechanicRows = [], runtimeRows = []) {
  const apiStatus = new Map(apiRows.map(row => [row.id, row.status]));
  const categoryBlocked = category => mechanicRows.some(row => row.category === category && row.status === "block");
  const apiMissing = (...ids) => ids.some(id => apiStatus.get(id) === "block");
  const runtimeWarn = runtimeRows.some(row => row.status === "warn");

  return [
    combatQaScenario({
      id: "single-target",
      label: "Single-target атака",
      status: apiMissing("openCombatHud", "openCombatManager", "openCombatTechnique") || categoryBlocked("hit") ? "block" : "manual",
      summary: "обычная атака проверяет hit chance, защиту цели, зону попадания и чат-карту",
      requires: ["Combat HUD", "Technique picker", "hit zones"],
      steps: [
        "Выбрать атакующего и цель, открыть Combat HUD.",
        "Провести melee/ranged single-target атаку с техникой.",
        "Проверить бросок попадания, выбранную зону тела, урон и расход действий/энергии.",
      ],
    }),
    combatQaScenario({
      id: "armor-shield",
      label: "Броня и щит",
      status: categoryBlocked("armor") || categoryBlocked("shield") ? "block" : "manual",
      summary: "щит должен ослаблять удар до брони, броня тратить durability и пропускать остаток в часть тела",
      requires: ["shield intercept", "armor durability", "body HP"],
      minutes: 10,
      steps: [
        "Удар 50 по щиту/броне: щит снижает входящий урон, затем броня снижает остаток.",
        "Повторить с низкой прочностью брони: защита ограничена текущей durability.",
        "Проверить, что живот получает урон как отдельная часть, но защищается торсовой броней.",
      ],
    }),
    combatQaScenario({
      id: "aoe-friendly-fire",
      label: "AoE и friendly fire",
      status: apiMissing("placeAoe", "applyAoe", "AOE_TYPES") || categoryBlocked("aoe") ? "block" : "manual",
      summary: "область должна отдельно считать попадание/защиту/зону по каждой цели и учитывать режим friendly fire",
      requires: ["placeAoe", "applyAoe", "AoE policy"],
      minutes: 12,
      steps: [
        "Поставить область circle/cone по двум врагам и союзнику.",
        "Сравнить режимы friendly fire off/on/auto.",
        "Проверить fixed/aimed зону попадания для заклинания или техники области.",
      ],
    }),
    combatQaScenario({
      id: "medicine-trauma",
      label: "Медицина и травмы",
      status: apiMissing("syncDerivedConditions", "rest") || categoryBlocked("medicine") ? "block" : "manual",
      summary: "травмы, кровотечения, переломы, живот/энергия и отдых должны синхронизироваться без ручных правок данных",
      requires: ["body trauma", "derived conditions", "rest"],
      minutes: 10,
      steps: [
        "Нанести урон разным частям тела, включая abdomen.",
        "Проверить derived conditions и штраф энергии от живота.",
        "Применить лечение/отдых и убедиться, что статусы обновляются.",
      ],
    }),
    combatQaScenario({
      id: "combat-inventory",
      label: "Бой и инвентарь",
      status: apiMissing("openGridInventory", "endTurnForActor") ? "block" : "manual",
      summary: "инвентарь, экипировка, pending и ход должны не конфликтовать с 6-секундной экономикой",
      requires: ["Tarkov inventory", "pending", "end turn"],
      minutes: 8,
      steps: [
        "Во время боевого контекста открыть инвентарь персонажа.",
        "Переложить оружие/щит между руками и контейнерами.",
        "Закончить ход и проверить, что нераспределенные pending-предметы не дают скрытого переносимого состояния.",
      ],
    }),
    combatQaScenario({
      id: "vfx-chat",
      label: "VFX и чат",
      status: runtimeWarn ? "warn" : "manual",
      summary: "визуальная обратная связь должна помогать читать удар, щит, броню, AoE и лечение",
      requires: ["combatVfxEnabled", "chat cards"],
      minutes: 6,
      steps: [
        "Включить/выключить Combat VFX setting.",
        "Проверить hit/armor/shield/AoE feedback на сцене.",
        "Убедиться, что чат-карты содержат достаточно данных для GM без открытия консоли.",
      ],
    }),
  ];
}

function buildCombatQaSnapshot() {
  const apiRows = combatQaApiRows();
  const mechanicRows = combatQaMechanicRows();
  const runtimeRows = combatQaRuntimeRows();
  const scenarios = buildCombatQaScenarioRows(apiRows, mechanicRows, runtimeRows);
  const missingApis = apiRows.filter(row => row.status === "block");
  const blockedMechanics = mechanicRows.filter(row => row.status === "block");
  const runtimeWarnings = runtimeRows.filter(row => row.status === "warn");
  const blockedScenarios = scenarios.filter(row => row.status === "block");

  const hitRows = mechanicRows.filter(row => row.category === "hit");
  const armorRows = mechanicRows.filter(row => row.category === "armor" || row.category === "shield");
  const aoeRows = mechanicRows.filter(row => row.category === "aoe");
  const medicineRows = mechanicRows.filter(row => row.category === "medicine");

  const checks = [
    combatQaCheck({
      id: "combat-apis",
      label: "Боевые API",
      status: missingApis.length ? "block" : "ok",
      summary: `${apiRows.length - missingApis.length}/${apiRows.length} API доступны`,
      action: missingApis.length ? "Проверить регистрацию game.ironHills в ready hook." : "Окна и команды боя можно открывать из Foundry.",
      metric: `${apiRows.length - missingApis.length}/${apiRows.length}`,
      rows: apiRows,
    }),
    combatQaCheck({
      id: "hit-armor-shield",
      label: "Попадания, броня, щит",
      status: [...hitRows, ...armorRows].some(row => row.status === "block") ? "block" : "ok",
      summary: `${hitRows.length} контрольных бросков · ${armorRows.length} armor/shield правил`,
      action: "Ручной прогон: удар 50 по щиту/броне, затем низкая durability.",
      metric: `${[...hitRows, ...armorRows].filter(row => row.status === "ok").length}/${hitRows.length + armorRows.length}`,
      rows: [...hitRows, ...armorRows],
    }),
    combatQaCheck({
      id: "aoe-policy",
      label: "AoE политика",
      status: aoeRows.some(row => row.status === "block") ? "block" : "ok",
      summary: `${AOE_SHAPE_KEYS.length} форм · ${AOE_TYPE_KEYS.length} типов · ${AOE_TARGETABLE_BODY_ZONE_KEYS.length} целевых зон`,
      action: "Ручной прогон: friendly fire off/on/auto и fixed/aimed target zones.",
      metric: `${aoeRows.filter(row => row.status === "ok").length}/${aoeRows.length}`,
      rows: aoeRows,
    }),
    combatQaCheck({
      id: "medicine-trauma",
      label: "Медицина и травмы",
      status: medicineRows.some(row => row.status === "block") ? "block" : "ok",
      summary: `${BODY_TRAUMA_PART_KEYS.length} зон травм, abdomen сохранен`,
      action: "Ручной прогон: урон по abdomen, bleeding/fracture, лечение и отдых.",
      metric: `${medicineRows.filter(row => row.status === "ok").length}/${medicineRows.length}`,
      rows: medicineRows,
    }),
    combatQaCheck({
      id: "runtime-context",
      label: "Runtime контекст",
      status: runtimeWarnings.length ? "warn" : "ok",
      summary: `${runtimeRows.length - runtimeWarnings.length}/${runtimeRows.length} runtime checks без замечаний`,
      action: runtimeWarnings.length ? "Проверить в живом Foundry после перезагрузки мира." : "Runtime слой выглядит готовым к smoke/manual.",
      metric: `${runtimeRows.length - runtimeWarnings.length}/${runtimeRows.length}`,
      rows: runtimeRows,
    }),
    combatQaCheck({
      id: "manual-combat-pass",
      label: "Ручной боевой прогон",
      status: blockedScenarios.length ? "block" : "manual",
      summary: `${scenarios.length} сценариев · ${scenarios.reduce((sum, row) => sum + row.stepCount, 0)} шагов`,
      action: "После runtime smoke пройти сценарии на тестовой сцене.",
      metric: `${scenarios.filter(row => row.status !== "block").length}/${scenarios.length}`,
      rows: scenarios,
    }),
  ];

  const statusWeight = { ok: 1, manual: 0.72, warn: 0.44, block: 0, todo: 0.15 };
  const scorePct = Math.round(checks.reduce((sum, check) => sum + (statusWeight[check.status] ?? 0), 0) / Math.max(1, checks.length) * 100);
  const blockers = checks.filter(check => check.status === "block").length;
  const warnings = checks.filter(check => check.status === "warn").length;
  const manualChecks = scenarios.filter(row => row.status !== "block").length + checks.filter(check => check.status === "manual").length;
  const status = blockers ? "block" : scorePct >= 85 ? "ok" : "warn";
  const nextActions = [
    ...(missingApis.length ? [`Починить регистрацию боевых API: ${missingApis.map(row => row.id).join(", ")}.`] : []),
    ...(blockedMechanics.length ? [`Разобрать механические расхождения: ${blockedMechanics.slice(0, 5).map(row => row.id).join(", ")}${blockedMechanics.length > 5 ? "..." : ""}.`] : []),
    ...(!missingApis.length && !blockedMechanics.length ? ["Запустить Release QA -> Runtime smoke в Foundry и сохранить результат в панели."] : []),
    ...(!blockedScenarios.length ? ["Пройти manual combat pass: single-target -> armor/shield -> AoE -> medicine -> inventory -> VFX."] : []),
    ...(runtimeWarnings.length ? [`Runtime warnings: ${runtimeWarnings.map(row => row.id).join(", ")}.`] : []),
  ].slice(0, 6);

  return {
    scorePct,
    status,
    statusLabel: blockers ? "есть боевые блокеры" : scorePct >= 85 ? "готов к ручному боевому прогону" : "нужна runtime-проверка",
    tone: firstSessionRunbookTone(status),
    blockers,
    warnings,
    manualChecks,
    checks,
    hasChecks: checks.length > 0,
    apiRows,
    mechanicRows,
    runtimeRows,
    scenarios,
    hasScenarios: scenarios.length > 0,
    nextActions,
    hasNextActions: nextActions.length > 0,
    facts: {
      apiAvailable: apiRows.length - missingApis.length,
      apiTotal: apiRows.length,
      mechanicOk: mechanicRows.filter(row => row.status === "ok").length,
      mechanicTotal: mechanicRows.length,
      runtimeWarnings: runtimeWarnings.length,
      scenarioReady: scenarios.filter(row => row.status !== "block").length,
      scenarioTotal: scenarios.length,
      aoeShapes: AOE_SHAPE_KEYS.length,
      aoeTypes: AOE_TYPE_KEYS.length,
      bodyZones: BODY_ZONE_KEYS.length,
      targetableZones: AOE_TARGETABLE_BODY_ZONE_KEYS.length,
      traumaParts: BODY_TRAUMA_PART_KEYS.length,
    },
  };
}

function combatDryRunCase({ id, label, layer, status = "manual", autoSection = "", expected = "", manual = "", note = "" }) {
  return {
    id,
    label,
    layer,
    status,
    statusLabel: combatQaStatusLabel(status),
    tone: firstSessionRunbookTone(status),
    autoSection,
    expected,
    manual,
    note,
  };
}

function combatDryRunExpectedCases() {
  return [
    combatDryRunCase({
      id: "single-target-hit-miss",
      label: "Single-target hit/miss",
      layer: "attack",
      autoSection: "combat",
      expected: "hit меняет HP/armor, miss не мутирует цель, зона попадания нормализуется",
      manual: "melee hit, melee miss, ranged/throw hit, spell hit",
      note: "проверяет базовый путь атаки и чат-карту",
    }),
    combatDryRunCase({
      id: "armor-50-25-100",
      label: "Броня 50 -> 25/100",
      layer: "armor",
      autoSection: "combat",
      expected: "raw 50, protection 25, durability 100 -> final 25, durability 50/100",
      manual: "ударить торс в броне protection 25 / durability 100",
      note: "каноничный пример пользователя",
    }),
    combatDryRunCase({
      id: "armor-50-25-10",
      label: "Броня 50 -> 25/10",
      layer: "armor",
      autoSection: "combat",
      expected: "raw 50, current durability 10 -> armor breaks, final body damage 40",
      manual: "повторить удар по почти сломанной броне",
      note: "защита ограничена текущей прочностью",
    }),
    combatDryRunCase({
      id: "shield-then-armor",
      label: "Щит затем броня",
      layer: "shield",
      autoSection: "combat",
      expected: "raw 50 -> shield protection 15 -> armor protection 25 -> body damage 10",
      manual: "принять удар на щит и сравнить слои в чат-карте",
      note: "щит работает как дополнительный durable layer",
    }),
    combatDryRunCase({
      id: "aoe-per-target",
      label: "AoE по каждой цели",
      layer: "aoe",
      autoSection: "combat",
      expected: "каждая цель имеет собственный hit/defense/body zone результат",
      manual: "circle/cone/ray по двум врагам и союзнику",
      note: "friendly fire зависит от типа/режима атаки",
    }),
    combatDryRunCase({
      id: "aoe-target-zone",
      label: "AoE зоны тела",
      layer: "aoe",
      autoSection: "combat",
      expected: "random/fixed/aimed zone работают, abdomen targetable, shield не targetable body zone",
      manual: "заклинание с fixed abdomen и прицельная область по голове",
      note: "важно для магии и атак по зонам",
    }),
    combatDryRunCase({
      id: "medicine-abdomen",
      label: "Abdomen и лечение",
      layer: "medicine",
      autoSection: "medicine",
      expected: "abdomen имеет trauma state и energy penalty, лечится через medical actions/rest",
      manual: "нанести травму живота, перевязать, сделать short/long rest",
      note: "abdomen оставлен как отдельная зона",
    }),
    combatDryRunCase({
      id: "prepared-reactions",
      label: "Prepared reactions",
      layer: "reaction",
      autoSection: "prepared",
      expected: "riposte/intercept/aim consume подготовленные состояния один раз",
      manual: "проверить shield block -> riposte и pre-hit intercept",
      note: "закрывает реактивные боевые действия",
    }),
    combatDryRunCase({
      id: "turn-lifecycle",
      label: "Ход и 6 секунд",
      layer: "turn",
      autoSection: "lifecycle",
      expected: "turn-start tick обрабатывает trauma, ongoing damage, duration decay и skip-turn",
      manual: "закончить ход актера с bleeding/burning/hasted/stunned",
      note: "база для экономики времени и энергии",
    }),
    combatDryRunCase({
      id: "combat-inventory-pending",
      label: "Бой, инвентарь, pending",
      layer: "inventory",
      autoSection: "inventory",
      expected: "inventory view model строится, ручной pending не дает носить неразмещенное",
      manual: "купить/поднять предмет, разместить в руке/рюкзаке во время боевого контекста",
      note: "автоматически проверяется только view model, запрет pending нужно пройти вручную",
    }),
  ];
}

function combatDryRunSectionRows(report = null) {
  const sections = new Map((Array.isArray(report?.sections) ? report.sections : []).map(section => [section.id, section]));
  return COMBAT_DRY_RUN_SECTION_IDS.map(id => {
    const section = sections.get(id);
    const errors = numeric(section?.counts?.error);
    const warnings = numeric(section?.counts?.warn);
    const status = !section ? "todo" : section.status === "failed" || errors > 0 ? "block" : warnings > 0 ? "warn" : "ok";
    return {
      id,
      label: section?.label ?? {
        environment: "Foundry runtime and game API",
        inventory: "Inventory view model smoke",
        combat: "Combat mechanics smoke",
        prepared: "Prepared actions and reactions smoke",
        medicine: "Medicine and body trauma smoke",
        lifecycle: "Turn lifecycle and condition tick smoke",
      }[id] ?? id,
      status,
      statusLabel: combatQaStatusLabel(status),
      tone: firstSessionRunbookTone(status),
      ms: numeric(section?.ms),
      metric: section ? `${errors} errors / ${warnings} warnings` : "not run",
      summary: section ? Object.entries(section.summary ?? {})
        .filter(([, value]) => value !== undefined && value !== null && typeof value !== "object")
        .slice(0, 4)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ") || "section completed" : "секция еще не запускалась",
      findings: section?.findings ?? [],
      hasFindings: Boolean(section?.findings?.length),
    };
  });
}

function combatDryRunManualRows(combatQa = null) {
  return (combatQa?.scenarios ?? []).map(scenario => ({
    id: scenario.id,
    label: scenario.label,
    status: scenario.status === "block" ? "block" : "manual",
    statusLabel: scenario.status === "block" ? "блокер" : "ручной прогон",
    tone: scenario.status === "block" ? "is-danger" : "is-warn",
    minutes: numeric(scenario.minutes),
    stepCount: numeric(scenario.stepCount),
    metric: `${scenario.minutes} мин / ${scenario.stepCount} шага`,
    summary: scenario.summary,
    steps: scenario.steps ?? [],
    requiresLabel: scenario.requiresLabel ?? "",
  }));
}

function buildCombatDryRunSnapshot({ combatQa = null, report = null } = {}) {
  const qa = combatQa ?? buildCombatQaSnapshot();
  const compactReport = report ? compactCombatDryRunReport(report) : null;
  const sectionRows = combatDryRunSectionRows(compactReport);
  const expectedCases = combatDryRunExpectedCases().map(row => {
    const section = sectionRows.find(sectionRow => sectionRow.id === row.autoSection);
    const status = section?.status === "block" ? "block" : section?.status === "ok" ? "ok" : row.status;
    return {
      ...row,
      status,
      statusLabel: combatQaStatusLabel(status),
      tone: firstSessionRunbookTone(status),
      autoStatusLabel: section?.statusLabel ?? "нет данных",
    };
  });
  const manualRows = combatDryRunManualRows(qa);
  const reportStatus = summarizeCombatDryRunStatus(compactReport);
  const apiBlocked = Number(qa?.blockers ?? 0) > 0;
  const sectionBlockers = sectionRows.filter(row => row.status === "block").length;
  const sectionWarnings = sectionRows.filter(row => row.status === "warn").length;
  const sectionsDone = sectionRows.filter(row => row.status === "ok" || row.status === "warn" || row.status === "block").length;
  const casesBlocked = expectedCases.filter(row => row.status === "block").length;
  const manualBlocked = manualRows.filter(row => row.status === "block").length;

  const checks = [
    combatQaCheck({
      id: "qa-gate",
      label: "Combat QA gate",
      status: apiBlocked ? "block" : "ok",
      summary: `${qa?.scorePct ?? 0}% · blockers ${qa?.blockers ?? 0}`,
      action: apiBlocked ? "Сначала закрыть блокеры Combat QA." : "Можно запускать узкий dry-run.",
      metric: `${qa?.facts?.apiAvailable ?? 0}/${qa?.facts?.apiTotal ?? 0}`,
      rows: qa?.checks ?? [],
    }),
    combatQaCheck({
      id: "auto-smoke",
      label: "Focused runtime smoke",
      status: reportStatus.status,
      summary: reportStatus.summary,
      action: compactReport ? "Секции ниже показывают результат последнего запуска." : "Нажать Combat dry-run.",
      metric: compactReport ? `${sectionsDone}/${sectionRows.length}` : "not run",
      rows: sectionRows,
    }),
    combatQaCheck({
      id: "expected-cases",
      label: "Expected combat cases",
      status: casesBlocked ? "block" : compactReport ? "ok" : "manual",
      summary: `${expectedCases.length - casesBlocked}/${expectedCases.length} кейсов без авто-блокеров`,
      action: "Сверить ручной прогон с ожидаемой математикой.",
      metric: `${expectedCases.length - casesBlocked}/${expectedCases.length}`,
      rows: expectedCases,
    }),
    combatQaCheck({
      id: "manual-route",
      label: "Manual route",
      status: manualBlocked ? "block" : "manual",
      summary: `${manualRows.length - manualBlocked}/${manualRows.length} сценариев доступны для ручной проверки`,
      action: "Пройти сценарии после зеленого focused smoke.",
      metric: `${manualRows.reduce((sum, row) => sum + numeric(row.minutes), 0)} мин`,
      rows: manualRows,
    }),
  ];

  const statusWeight = { ok: 1, manual: 0.7, warn: 0.45, block: 0, todo: 0.2 };
  const scorePct = Math.round(checks.reduce((sum, check) => sum + (statusWeight[check.status] ?? 0), 0) / Math.max(1, checks.length) * 100);
  const blockers = checks.filter(check => check.status === "block").length;
  const warnings = checks.filter(check => check.status === "warn").length + sectionWarnings;
  const status = blockers ? "block" : compactReport?.ok ? "ok" : "manual";
  const nextActions = [
    ...(apiBlocked ? ["Закрыть блокеры Combat QA перед dry-run."] : []),
    ...(!compactReport && !apiBlocked ? ["Нажать Combat dry-run: будет запущен focused runtime smoke по бою/медицине/ходу."] : []),
    ...(sectionBlockers ? [`Разобрать auto-smoke блокеры: ${sectionRows.filter(row => row.status === "block").map(row => row.id).join(", ")}.`] : []),
    ...(sectionWarnings ? [`Проверить предупреждения секций: ${sectionRows.filter(row => row.status === "warn").map(row => row.id).join(", ")}.`] : []),
    ...(compactReport && !sectionBlockers ? ["Перейти к ручному маршруту: single-target -> armor/shield -> AoE -> medicine -> inventory."] : []),
  ].slice(0, 6);

  return {
    scorePct,
    status,
    statusLabel: blockers ? "есть dry-run блокеры" : compactReport?.ok ? "авто dry-run зеленый" : "готов к запуску dry-run",
    tone: firstSessionRunbookTone(status),
    blockers,
    warnings,
    checks,
    sectionRows,
    expectedCases,
    manualRows,
    nextActions,
    hasNextActions: nextActions.length > 0,
    report: compactReport,
    hasReport: Boolean(compactReport),
    lastRunLabel: compactReport?.generatedAt ? new Date(compactReport.generatedAt).toLocaleString("ru-RU") : "еще не запускался",
    facts: {
      sectionsDone,
      sectionsTotal: sectionRows.length,
      sectionBlockers,
      sectionWarnings,
      expectedCases: expectedCases.length,
      expectedCasesOk: expectedCases.filter(row => row.status === "ok").length,
      manualScenarios: manualRows.length,
      smokeErrors: numeric(compactReport?.counts?.error),
      smokeWarnings: numeric(compactReport?.counts?.warn),
    },
  };
}

function combatTestBenchClone(value) {
  if (value === undefined || value === null) return value;
  const deepClone = globalThis.foundry?.utils?.deepClone;
  if (typeof deepClone === "function") return deepClone(value);
  return JSON.parse(JSON.stringify(value));
}

function combatTestBenchCollectionValues(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (Array.isArray(collection.contents)) return collection.contents;
  if (typeof collection.values === "function") return Array.from(collection.values());
  if (typeof collection === "object") return Object.values(collection);
  return [];
}

function combatTestBenchFlagObject(kind, id, extra = {}) {
  return {
    [SYSTEM_ID]: {
      combatTestBench: true,
      combatTestBenchKind: kind,
      combatTestBenchId: id,
      ...extra,
    },
  };
}

function combatTestBenchFlagPatch(kind, id, extra = {}) {
  const patch = {
    [`flags.${SYSTEM_ID}.combatTestBench`]: true,
    [`flags.${SYSTEM_ID}.combatTestBenchKind`]: kind,
    [`flags.${SYSTEM_ID}.combatTestBenchId`]: id,
  };
  for (const [key, value] of Object.entries(extra)) {
    patch[`flags.${SYSTEM_ID}.${key}`] = value;
  }
  return patch;
}

function combatTestBenchFlagValue(doc, key) {
  try {
    if (typeof doc?.getFlag === "function") {
      const value = doc.getFlag(SYSTEM_ID, key);
      if (value !== undefined) return value;
    }
  } catch {
    // Some lightweight test doubles expose flags but no functional getFlag.
  }
  return doc?.flags?.[SYSTEM_ID]?.[key] ?? doc?._source?.flags?.[SYSTEM_ID]?.[key] ?? undefined;
}

function findCombatTestBenchActor(seed) {
  const actors = combatTestBenchCollectionValues(globalThis.game?.actors);
  return actors.find(actor => combatTestBenchFlagValue(actor, "combatTestBenchId") === seed.id)
    ?? actors.find(actor => actor.type === seed.type && actor.name === seed.name)
    ?? null;
}

function findCombatTestBenchScene() {
  const scenes = combatTestBenchCollectionValues(globalThis.game?.scenes);
  return scenes.find(scene => combatTestBenchFlagValue(scene, "combatTestBenchId") === COMBAT_TEST_BENCH_SCENE_ID)
    ?? scenes.find(scene => scene.name === COMBAT_TEST_BENCH_SCENE_NAME)
    ?? null;
}

function findCombatTestBenchItem(actor, seed) {
  const items = combatTestBenchCollectionValues(actor?.items);
  return items.find(item => combatTestBenchFlagValue(item, "combatTestBenchItemId") === seed.id)
    ?? items.find(item => item.type === seed.type && item.name === seed.name)
    ?? null;
}

function combatTestBenchBodyStatus(overrides = {}) {
  return {
    minorBleeding: 0,
    majorBleeding: 0,
    fracture: false,
    destroyed: false,
    splinted: false,
    tourniquet: false,
    ...combatTestBenchClone(overrides),
  };
}

function combatTestBenchHpPart(max, value = max, status = {}) {
  return {
    value,
    max,
    status: combatTestBenchBodyStatus(status),
  };
}

function combatTestBenchHp(seed = {}) {
  const overrides = seed.hpOverrides ?? {};
  const defaults = {
    head: { value: 35, max: 35 },
    torso: { value: 85, max: 85 },
    abdomen: { value: 70, max: 70 },
    leftArm: { value: 60, max: 60 },
    rightArm: { value: 60, max: 60 },
    leftLeg: { value: 65, max: 65 },
    rightLeg: { value: 65, max: 65 },
  };
  return Object.fromEntries(Object.entries(defaults).map(([key, base]) => {
    const override = overrides[key] ?? {};
    const max = Number(override.max ?? base.max);
    const value = Number(override.value ?? base.value);
    return [key, combatTestBenchHpPart(max, value, override.status ?? {})];
  }));
}

function combatTestBenchSkills(overrides = {}) {
  return Object.fromEntries(COMBAT_TEST_BENCH_SKILL_KEYS.map(key => [
    key,
    {
      value: Number(overrides[key] ?? 1),
      exp: 0,
      expNext: 25,
    },
  ]));
}

function combatTestBenchConditions(overrides = {}) {
  return {
    bleeding: 0,
    shock: 0,
    poison: 0,
    burning: 0,
    fractures: {
      leftArm: false,
      rightArm: false,
      leftLeg: false,
      rightLeg: false,
      abdomen: false,
    },
    stunned: 0,
    silencedUntil: 0,
    slowPenalty: 0,
    feared: 0,
    fleeing: 0,
    hasted: 0,
    slowed: 0,
    unconscious: 0,
    exposed: 0,
    pushed: 0,
    prone: 0,
    shield_lost: 0,
    armor_cracked: 0,
    broken_limb: 0,
    grappled: 0,
    sleeping: 0,
    disarmed: 0,
    aimed_shot_bonus: 0,
    formation_stance: 0,
    shield_wall_formation: 0,
    riposte_ready: 0,
    counter_ready: 0,
    intercept_ready: 0,
    rapid_reload: 0,
    initiative: 10,
    diseases: {},
    ...combatTestBenchClone(overrides),
  };
}

function combatTestBenchActorSystem(seed) {
  const energy = seed.energy ?? { value: 50, max: 50, baseMax: 50 };
  const mana = seed.mana ?? { value: 20, max: 20, baseMax: 20 };
  return {
    resources: {
      hp: combatTestBenchHp(seed),
      energy: combatTestBenchClone(energy),
      mana: combatTestBenchClone(mana),
      satiety: { value: 100, max: 100 },
      hydration: { value: 100, max: 100 },
      weight: { value: 0, max: 80 },
      soul: {
        energyReserve: { value: 10, max: 10, trainingAccum: 0 },
        manaReserve: { value: 10, max: 10, trainingAccum: 0 },
      },
      soulReserve: { daysSinceDeath: 0, isDead: false },
      awakened: {
        isAwakened: false,
        playerName: "",
        awakeningDate: "",
        awakeningType: "",
        originWorld: "",
        notes: "",
      },
    },
    conditions: combatTestBenchConditions(seed.conditions ?? {}),
    equipment: {
      head: "",
      neck: "",
      torso: "",
      leftArm: "",
      rightArm: "",
      legs: "",
      ringLeft: "",
      ringRight: "",
      leftHand: "",
      rightHand: "",
      belt: "",
      backpack: "",
    },
    quickSlots: {
      slot1: "",
      slot2: "",
      slot3: "",
      slot4: "",
      slot5: "",
      slot6: "",
    },
    currency: { copper: 0, silver: 0, gold: 0 },
    info: {
      race: "Combat test",
      age: 0,
      role: seed.roleLabel ?? seed.id,
      faction: "IH Test Bench",
      tier: 1,
      desc: "Generated combat test bench actor. Safe to update or delete.",
      notes: "",
    },
    combat: {
      defense: Number(seed.defense ?? 6),
      baseThreshold: Number(seed.defense ?? 6),
      unarmedDamage: 5,
      unarmedSkill: 1,
      shield: Boolean(seed.equipment?.leftHand || seed.equipment?.rightHand),
    },
    craft: { knownRecipeIds: [] },
    skills: combatTestBenchSkills(seed.skills ?? {}),
    partyKey: "",
    partyRole: "",
    group: "",
    diseases: {},
    factions: {},
  };
}

function combatTestBenchActorCreateData(seed) {
  return {
    name: seed.name,
    type: seed.type,
    img: seed.img ?? "icons/svg/mystery-man.svg",
    flags: combatTestBenchFlagObject("actor", seed.id, {
      combatTestBenchRole: seed.roleLabel ?? seed.id,
    }),
    prototypeToken: {
      name: seed.name,
      actorLink: true,
      disposition: Number(seed.disposition ?? 0),
      texture: { src: seed.img ?? "icons/svg/mystery-man.svg" },
    },
    system: combatTestBenchActorSystem(seed),
  };
}

function combatTestBenchItemCreateData(seed) {
  return {
    name: seed.name,
    type: seed.type,
    img: seed.img ?? "icons/svg/item-bag.svg",
    flags: combatTestBenchFlagObject("item", seed.id, {
      combatTestBenchItemId: seed.id,
    }),
    system: combatTestBenchClone(seed.system ?? {}),
  };
}

function combatTestBenchAssignmentPatch(seed, itemBySeedId) {
  const patch = {};
  for (const [slot, itemSeedId] of Object.entries(seed.equipment ?? {})) {
    const item = itemBySeedId.get(itemSeedId);
    if (item?.id) patch[`system.equipment.${slot}`] = item.id;
  }
  for (const [slot, itemSeedId] of Object.entries(seed.quickSlots ?? {})) {
    const item = itemBySeedId.get(itemSeedId);
    if (item?.id) patch[`system.quickSlots.${slot}`] = item.id;
  }
  return patch;
}

async function upsertCombatTestBenchItem(actor, seed) {
  const data = combatTestBenchItemCreateData(seed);
  const existing = findCombatTestBenchItem(actor, seed);
  if (existing) {
    await existing.update({
      name: data.name,
      img: data.img,
      system: data.system,
      ...combatTestBenchFlagPatch("item", seed.id, {
        combatTestBenchItemId: seed.id,
      }),
    });
    return { item: existing, status: "updated" };
  }
  const created = await actor.createEmbeddedDocuments("Item", [data]);
  return { item: created?.[0] ?? null, status: "created" };
}

async function upsertCombatTestBenchActor(seed) {
  const data = combatTestBenchActorCreateData(seed);
  let actor = findCombatTestBenchActor(seed);
  let actorStatus = "created";
  if (actor) {
    actorStatus = "updated";
    await actor.update({
      name: data.name,
      img: data.img,
      prototypeToken: data.prototypeToken,
      system: data.system,
      ...combatTestBenchFlagPatch("actor", seed.id, {
        combatTestBenchRole: seed.roleLabel ?? seed.id,
      }),
    });
  } else {
    actor = await Actor.create(data);
  }

  const itemBySeedId = new Map();
  const itemReports = [];
  for (const itemSeedId of seed.items ?? []) {
    const itemSeed = COMBAT_TEST_BENCH_ITEMS[itemSeedId];
    if (!itemSeed) {
      itemReports.push({ seedId: itemSeedId, status: "missing", item: null });
      continue;
    }
    const result = await upsertCombatTestBenchItem(actor, itemSeed);
    if (result.item) itemBySeedId.set(itemSeedId, result.item);
    itemReports.push({ seedId: itemSeedId, ...result });
  }

  const assignmentPatch = combatTestBenchAssignmentPatch(seed, itemBySeedId);
  if (Object.keys(assignmentPatch).length) {
    await actor.update(assignmentPatch);
  }

  return { actor, status: actorStatus, itemReports };
}

function combatTestBenchSceneData() {
  return {
    name: COMBAT_TEST_BENCH_SCENE_NAME,
    active: false,
    navigation: false,
    width: 2400,
    height: 1500,
    padding: 0.12,
    backgroundColor: "#13100c",
    grid: {
      type: 1,
      size: 100,
      color: "#6f5a34",
      alpha: 0.28,
      distance: 5,
      units: "ft",
    },
    flags: combatTestBenchFlagObject("scene", COMBAT_TEST_BENCH_SCENE_ID),
  };
}

function combatTestBenchTokenData(seed, actor) {
  return {
    name: seed.name,
    actorId: actor.id,
    actorLink: true,
    x: Number(seed.x ?? 0),
    y: Number(seed.y ?? 0),
    width: 1,
    height: 1,
    disposition: Number(seed.disposition ?? 0),
    texture: { src: actor.img ?? seed.img ?? "icons/svg/mystery-man.svg" },
    flags: combatTestBenchFlagObject("token", seed.id, {
      combatTestBenchActorId: actor.id,
    }),
  };
}

function findCombatTestBenchToken(scene, seed, actor) {
  const tokens = combatTestBenchCollectionValues(scene?.tokens);
  return tokens.find(token => combatTestBenchFlagValue(token, "combatTestBenchId") === seed.id)
    ?? tokens.find(token => token.actorId === actor.id && token.name === seed.name)
    ?? null;
}

async function upsertCombatTestBenchScene(actorResults) {
  const data = combatTestBenchSceneData();
  let scene = findCombatTestBenchScene();
  let sceneStatus = "created";
  if (scene) {
    sceneStatus = "updated";
    await scene.update({
      name: data.name,
      active: data.active,
      navigation: data.navigation,
      width: data.width,
      height: data.height,
      padding: data.padding,
      backgroundColor: data.backgroundColor,
      grid: data.grid,
      ...combatTestBenchFlagPatch("scene", COMBAT_TEST_BENCH_SCENE_ID),
    });
  } else {
    scene = await Scene.create(data);
  }

  const tokenReports = [];
  for (const { seed, actor } of actorResults) {
    if (!actor) continue;
    const tokenData = combatTestBenchTokenData(seed, actor);
    const existing = findCombatTestBenchToken(scene, seed, actor);
    if (existing) {
      await existing.update({
        name: tokenData.name,
        actorId: tokenData.actorId,
        actorLink: tokenData.actorLink,
        x: tokenData.x,
        y: tokenData.y,
        width: tokenData.width,
        height: tokenData.height,
        disposition: tokenData.disposition,
        texture: tokenData.texture,
        ...combatTestBenchFlagPatch("token", seed.id, {
          combatTestBenchActorId: actor.id,
        }),
      });
      tokenReports.push({ seedId: seed.id, token: existing, status: "updated" });
    } else {
      const created = await scene.createEmbeddedDocuments("Token", [tokenData]);
      tokenReports.push({ seedId: seed.id, token: created?.[0] ?? null, status: "created" });
    }
  }

  return { scene, status: sceneStatus, tokenReports };
}

function combatTestBenchActorRows() {
  return COMBAT_TEST_BENCH_ACTORS.map(seed => {
    const actor = findCombatTestBenchActor(seed);
    const itemRows = (seed.items ?? []).map(itemSeedId => {
      const itemSeed = COMBAT_TEST_BENCH_ITEMS[itemSeedId];
      const item = itemSeed && actor ? findCombatTestBenchItem(actor, itemSeed) : null;
      return {
        id: itemSeedId,
        label: itemSeed?.name ?? itemSeedId,
        ready: Boolean(item),
      };
    });
    const readyItems = itemRows.filter(row => row.ready).length;
    const equipmentEntries = Object.entries(seed.equipment ?? {});
    const equipped = equipmentEntries.filter(([slot, itemSeedId]) => {
      const itemSeed = COMBAT_TEST_BENCH_ITEMS[itemSeedId];
      const item = itemSeed && actor ? findCombatTestBenchItem(actor, itemSeed) : null;
      return Boolean(actor && item?.id && actor.system?.equipment?.[slot] === item.id);
    }).length;
    const quickEntries = Object.entries(seed.quickSlots ?? {});
    const quickReady = quickEntries.filter(([slot, itemSeedId]) => {
      const itemSeed = COMBAT_TEST_BENCH_ITEMS[itemSeedId];
      const item = itemSeed && actor ? findCombatTestBenchItem(actor, itemSeed) : null;
      return Boolean(actor && item?.id && actor.system?.quickSlots?.[slot] === item.id);
    }).length;
    const ready = Boolean(actor)
      && readyItems === itemRows.length
      && equipped === equipmentEntries.length
      && quickReady === quickEntries.length;
    return {
      id: seed.id,
      label: seed.name,
      role: seed.roleLabel ?? seed.id,
      status: ready ? "ok" : actor ? "warn" : "todo",
      statusLabel: ready ? "готов" : actor ? "частично" : "нет",
      tone: firstSessionRunbookTone(ready ? "ok" : actor ? "warn" : "todo"),
      summary: actor
        ? `${readyItems}/${itemRows.length} items, equip ${equipped}/${equipmentEntries.length}, quick ${quickReady}/${quickEntries.length}`
        : "actor not created",
      actorId: actor?.id ?? "",
      itemRows,
      ready,
    };
  });
}

function combatTestBenchSceneRow() {
  const scene = findCombatTestBenchScene();
  const tokens = combatTestBenchCollectionValues(scene?.tokens);
  const tokenReady = COMBAT_TEST_BENCH_ACTORS.filter(seed => {
    const actor = findCombatTestBenchActor(seed);
    return actor && tokens.some(token =>
      combatTestBenchFlagValue(token, "combatTestBenchId") === seed.id
      || (token.actorId === actor.id && token.name === seed.name)
    );
  }).length;
  return {
    id: COMBAT_TEST_BENCH_SCENE_ID,
    label: COMBAT_TEST_BENCH_SCENE_NAME,
    status: scene && tokenReady === COMBAT_TEST_BENCH_ACTORS.length ? "ok" : scene ? "warn" : "todo",
    statusLabel: scene && tokenReady === COMBAT_TEST_BENCH_ACTORS.length ? "готова" : scene ? "частично" : "нет",
    tone: firstSessionRunbookTone(scene && tokenReady === COMBAT_TEST_BENCH_ACTORS.length ? "ok" : scene ? "warn" : "todo"),
    sceneId: scene?.id ?? "",
    tokenReady,
    tokenTotal: COMBAT_TEST_BENCH_ACTORS.length,
    summary: scene ? `${tokenReady}/${COMBAT_TEST_BENCH_ACTORS.length} tokens` : "scene not created",
  };
}

function buildCombatTestBenchSnapshot() {
  const actorRows = combatTestBenchActorRows();
  const sceneRow = combatTestBenchSceneRow();
  const actorsReady = actorRows.filter(row => row.ready).length;
  const itemTotal = actorRows.reduce((sum, row) => sum + row.itemRows.length, 0);
  const itemsReady = actorRows.reduce((sum, row) => sum + row.itemRows.filter(item => item.ready).length, 0);
  const missingActors = actorRows.filter(row => row.status === "todo");
  const partialActors = actorRows.filter(row => row.status === "warn");
  const status = missingActors.length ? "todo" : partialActors.length || sceneRow.status !== "ok" ? "warn" : "ok";
  const scorePct = Math.round((
    (actorsReady / Math.max(1, actorRows.length)) * 0.45
    + (itemsReady / Math.max(1, itemTotal)) * 0.35
    + (sceneRow.tokenReady / Math.max(1, sceneRow.tokenTotal)) * 0.2
  ) * 100);
  const scenarioRows = COMBAT_TEST_BENCH_SCENARIOS.map(seed => {
    const actorRow = actorRows.find(row => row.id === seed.actorId);
    const scenarioStatus = actorRow?.ready ? "manual" : "todo";
    return {
      id: seed.id,
      label: seed.label,
      status: scenarioStatus,
      statusLabel: scenarioStatus === "manual" ? "ручной прогон" : "нет актёра",
      tone: firstSessionRunbookTone(scenarioStatus),
      expected: seed.expected,
      actor: actorRow?.label ?? seed.actorId,
    };
  });
  const nextActions = [
    ...(status !== "ok" ? ["Нажать «🧪 Combat test bench», чтобы создать/обновить тестовых актёров, предметы и сцену."] : []),
    ...(status === "ok" ? ["Открыть сцену IH Combat Test Bench и пройти сценарии: armor full -> armor low -> shield+armor -> AoE -> abdomen/medicine."] : []),
    ...(status === "ok" ? ["После ручного прогона сверить чат-карты, durability брони/щита, HP частей тела и quick slots на актёрах."] : []),
  ];
  return {
    scorePct,
    status,
    statusLabel: status === "ok" ? "bench готов к Foundry-проверке" : status === "warn" ? "bench создан частично" : "bench не создан",
    tone: firstSessionRunbookTone(status === "todo" ? "todo" : status),
    actorRows,
    sceneRow,
    scenarioRows,
    nextActions,
    hasNextActions: nextActions.length > 0,
    facts: {
      actorsReady,
      actorsTotal: actorRows.length,
      itemsReady,
      itemsTotal: itemTotal,
      tokensReady: sceneRow.tokenReady,
      tokensTotal: sceneRow.tokenTotal,
      scenarios: scenarioRows.length,
    },
  };
}

async function materializeCombatTestBench() {
  if (!globalThis.game?.user?.isGM) {
    throw new Error("Combat test bench can be materialized only by a GM user.");
  }

  const reports = [];
  const actorResults = [];
  for (const seed of COMBAT_TEST_BENCH_ACTORS) {
    const result = await upsertCombatTestBenchActor(seed);
    actorResults.push({ seed, ...result });
    pushMaterializeReport(reports, "combat bench actor", result.status, result.actor, seed.roleLabel ?? seed.id);
    for (const itemReport of result.itemReports) {
      pushMaterializeReport(
        reports,
        "combat bench item",
        itemReport.status === "missing" ? "skipped" : itemReport.status,
        itemReport.item?.name ?? itemReport.seedId,
        result.actor?.name ?? ""
      );
    }
  }

  const sceneResult = await upsertCombatTestBenchScene(actorResults);
  pushMaterializeReport(reports, "combat bench scene", sceneResult.status, sceneResult.scene, `${sceneResult.tokenReports.length} tokens`);
  for (const tokenReport of sceneResult.tokenReports) {
    pushMaterializeReport(reports, "combat bench token", tokenReport.status, tokenReport.token?.name ?? tokenReport.seedId, sceneResult.scene?.name ?? "");
  }

  const summary = reports.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  const snapshot = buildCombatTestBenchSnapshot();
  return {
    ok: true,
    scene: sceneResult.scene,
    reports,
    summary,
    snapshot,
  };
}

function gmControlCollectionValues(collection) {
  return combatTestBenchCollectionValues(collection);
}

function gmControlUniqueActors(actors = []) {
  const seen = new Set();
  return actors.filter(actor => {
    const id = String(actor?.uuid ?? actor?.id ?? actor?.name ?? "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function gmControlSelectedActors() {
  const tokens = globalThis.canvas?.tokens?.controlled ?? [];
  return gmControlUniqueActors(tokens.map(token => token?.actor).filter(Boolean));
}

function gmControlTargetActors() {
  const targets = Array.from(globalThis.game?.user?.targets ?? []);
  return gmControlUniqueActors(targets.map(token => token?.actor).filter(Boolean));
}

function gmControlActorFromParticipant(participant = {}) {
  const uuid = String(participant.actorUuid ?? "");
  let byUuid = null;
  try {
    byUuid = uuid && typeof globalThis.fromUuidSync === "function"
      ? globalThis.fromUuidSync(uuid)
      : null;
  } catch {
    byUuid = null;
  }
  if (byUuid?.documentName === "Actor") return byUuid;
  if (byUuid?.actor?.documentName === "Actor") return byUuid.actor;
  const actorId = String(participant.actorId ?? "");
  return actorId ? globalThis.game?.actors?.get?.(actorId) ?? null : null;
}

function gmControlCombatActors() {
  let participants = [];
  try {
    participants = getCombatState()?.participants ?? [];
  } catch {
    participants = [];
  }
  return gmControlUniqueActors(participants.map(gmControlActorFromParticipant).filter(Boolean));
}

function gmControlBenchActors() {
  return gmControlUniqueActors(COMBAT_TEST_BENCH_ACTORS
    .map(seed => findCombatTestBenchActor(seed))
    .filter(Boolean));
}

function gmControlResolveActors(scope = "selected", { notify = false } = {}) {
  const selectedActors = gmControlSelectedActors();
  const targetActors = gmControlTargetActors();
  let resolvedScope = String(scope ?? "selected");
  if (!GM_CONTROL_SCOPES.some(row => row.id === resolvedScope)) resolvedScope = "selected";

  let actors = selectedActors;
  if (resolvedScope === "targets") actors = targetActors;
  else if (resolvedScope === "selected-targets") actors = gmControlUniqueActors([...selectedActors, ...targetActors]);
  else if (resolvedScope === "combat") actors = gmControlCombatActors();
  else if (resolvedScope === "bench") actors = gmControlBenchActors();

  if (!actors.length && notify) {
    const message = {
      selected: "Select one or more scene tokens first.",
      targets: "Target one or more tokens first.",
      "selected-targets": "Select or target one or more tokens first.",
      combat: "Active combat has no resolvable actors.",
      bench: "Combat test bench actors are not ready. Create the bench first.",
    }[resolvedScope] ?? "GM scope has no actors.";
    globalThis.ui?.notifications?.warn?.(message);
  }
  return actors;
}

function gmControlItemValues(actor) {
  return gmControlCollectionValues(actor?.items);
}

function gmControlResourceLabel(resource) {
  if (!resource || typeof resource !== "object") return "—";
  const value = Number(resource.value ?? 0);
  const max = Number(resource.max ?? 0);
  if (!Number.isFinite(max) || max <= 0) return `${Math.max(0, Math.round(value))}`;
  return `${Math.max(0, Math.round(value))}/${Math.max(0, Math.round(max))}`;
}

function gmControlHpSummary(actor) {
  const hp = actor?.system?.resources?.hp;
  if (!hp || typeof hp !== "object") return { value: 0, max: 0, label: "HP —" };
  if (hp.value !== undefined || hp.max !== undefined) {
    const value = Number(hp.value ?? 0);
    const max = Number(hp.max ?? 0);
    return {
      value,
      max,
      label: `HP ${Math.max(0, Math.round(value))}/${Math.max(0, Math.round(max))}`,
    };
  }

  let value = 0;
  let max = 0;
  for (const part of Object.values(hp)) {
    if (!part || typeof part !== "object") continue;
    const partMax = Number(part.max ?? 0);
    if (!(partMax > 0)) continue;
    value += Math.max(0, Number(part.value ?? partMax));
    max += partMax;
  }
  return {
    value,
    max,
    label: max > 0 ? `HP ${Math.round(value)}/${Math.round(max)}` : "HP —",
  };
}

function gmControlActiveConditionSummary(actor) {
  const entries = getActiveConditionEntries(actor?.system?.conditions ?? {}, {
    currentTime: Number(globalThis.game?.time?.worldTime ?? 0),
  });
  return {
    count: entries.length,
    label: entries.length
      ? entries.slice(0, 4).map(entry => `${entry.label} ${entry.value}`).join(", ")
      : "no effects",
  };
}

function gmControlDurabilitySummary(actor) {
  const items = gmControlItemValues(actor).filter(item => Number(item?.system?.durability?.max ?? 0) > 0);
  const damaged = items.filter(item => Number(item?.system?.durability?.value ?? item?.system?.durability?.max ?? 0) < Number(item?.system?.durability?.max ?? 0));
  return {
    total: items.length,
    damaged: damaged.length,
    label: `${damaged.length}/${items.length}`,
  };
}

function gmControlCombatSummary(actor) {
  const participant = getCombatParticipantByActor(actor);
  if (!participant) {
    return {
      active: false,
      label: isCombatActive() ? "not in combat" : "combat inactive",
      participant: null,
    };
  }
  const remaining = Number(participant.remainingSeconds ?? 0);
  const max = Number(participant.maxSeconds ?? 6);
  return {
    active: true,
    label: `${Math.round(remaining)}/${Math.round(max)}s${participant.pendingAction ? " · pending" : ""}`,
    participant,
  };
}

function gmControlActorRow(actor) {
  const hp = gmControlHpSummary(actor);
  const energy = gmControlResourceLabel(actor?.system?.resources?.energy);
  const mana = gmControlResourceLabel(actor?.system?.resources?.mana);
  const conditions = gmControlActiveConditionSummary(actor);
  const durability = gmControlDurabilitySummary(actor);
  const combat = gmControlCombatSummary(actor);
  const hpPct = hp.max > 0 ? hp.value / hp.max : 1;
  const tone = hpPct <= 0.25 || conditions.count >= 3 || durability.damaged >= 3
    ? "is-danger"
    : hpPct < 0.8 || conditions.count || durability.damaged
      ? "is-warn"
      : "is-good";

  return {
    id: actor?.id ?? "",
    uuid: actor?.uuid ?? "",
    name: actor?.name ?? "Actor",
    type: actor?.type ?? "",
    img: actor?.img ?? "icons/svg/mystery-man.svg",
    hpLabel: hp.label,
    energyLabel: `Energy ${energy}`,
    manaLabel: `Mana ${mana}`,
    conditionsLabel: conditions.label,
    conditionCount: conditions.count,
    durabilityLabel: durability.label,
    damagedGear: durability.damaged,
    gearTotal: durability.total,
    combatLabel: combat.label,
    hasCombatParticipant: combat.active,
    pendingActionLabel: combat.participant?.pendingAction?.label ?? "",
    tone,
  };
}

function gmControlActionItemRows(actor) {
  if (!actor) return [];
  const equipment = actor.system?.equipment ?? {};
  const equippedIds = new Set(Object.values(equipment).filter(Boolean).map(String));
  return gmControlItemValues(actor)
    .filter(item => ["weapon", "spell", "scroll"].includes(item?.type))
    .map(item => {
      const equipped = equippedIds.has(String(item.id));
      const kind = item.type === "weapon"
        ? "weapon"
        : item.type === "scroll"
          ? "scroll"
          : "spell";
      const detail = item.type === "weapon"
        ? `${item.system?.skill ?? "skill"} · dmg ${Number(item.system?.damage ?? 0)}`
        : `${item.system?.school ?? "magic"} · mana ${Number(item.system?.manaCost ?? 0)}`;
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        kind,
        equipped,
        label: `${item.name}${equipped ? " · equipped" : ""}`,
        detail,
      };
    })
    .sort((a, b) => {
      if (a.equipped !== b.equipped) return a.equipped ? -1 : 1;
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.name.localeCompare(b.name, "ru");
    })
    .slice(0, 40);
}

function gmControlActorForScope(scope, {
  selectedActors = [],
  targetActors = [],
  combatActors = [],
  benchActors = [],
} = {}) {
  const resolvedScope = GM_CONTROL_SCOPES.some(row => row.id === scope) ? scope : "selected";
  if (resolvedScope === "targets") return targetActors[0] ?? null;
  if (resolvedScope === "selected-targets") return gmControlUniqueActors([...selectedActors, ...targetActors])[0] ?? null;
  if (resolvedScope === "combat") return combatActors[0] ?? null;
  if (resolvedScope === "bench") return benchActors[0] ?? null;
  return selectedActors[0] ?? null;
}

function buildGmControlSnapshot({ scope = "selected" } = {}) {
  if (!globalThis.game?.user?.isGM) return null;
  const selectedActors = gmControlSelectedActors();
  const targetActors = gmControlTargetActors();
  const combatActors = gmControlCombatActors();
  const benchActors = gmControlBenchActors();
  const actorRows = selectedActors.map(gmControlActorRow);
  const targetRows = targetActors.map(gmControlActorRow);
  const combatRows = combatActors.map(gmControlActorRow);
  const benchRows = benchActors.map(gmControlActorRow);
  const sourceActor = gmControlActorForScope(scope, {
    selectedActors,
    targetActors,
    combatActors,
    benchActors,
  }) ?? selectedActors[0] ?? targetActors[0] ?? combatActors[0] ?? benchActors[0] ?? null;
  const actionItems = gmControlActionItemRows(sourceActor);
  let combatState = null;
  try {
    combatState = getCombatState();
  } catch {
    combatState = null;
  }
  const worldTime = Number(globalThis.game?.time?.worldTime ?? 0);
  const activeCombat = Boolean(combatState?.active ?? isCombatActive());
  const participants = combatState?.participants ?? [];
  const pendingCount = participants.filter(participant => participant.pendingAction).length;
  const conditionPresets = GM_CONTROL_CONDITION_PRESETS.map(preset => ({
    ...preset,
    label: getConditionLabel(preset.key) || preset.label,
    valueKind: getConditionDefaultValueKind(preset.key),
    mode: getConditionDefaultMode(preset.key),
  }));

  return {
    scopes: GM_CONTROL_SCOPES.map(scope => ({
      ...scope,
      count: {
        selected: selectedActors.length,
        targets: targetActors.length,
        "selected-targets": gmControlUniqueActors([...selectedActors, ...targetActors]).length,
        combat: combatActors.length,
        bench: benchActors.length,
      }[scope.id] ?? 0,
    })),
    timePresets: GM_CONTROL_TIME_PRESETS,
    resourcePresets: GM_CONTROL_RESOURCE_PRESETS,
    resourceModes: GM_CONTROL_RESOURCE_MODES,
    targetZoneModes: GM_CONTROL_TARGET_ZONE_MODES,
    friendlyFireModes: GM_CONTROL_FRIENDLY_FIRE_MODES,
    bodyParts: GM_CONTROL_BODY_PARTS.map(part => ({
      ...part,
      label: getHitLabel(part.key) || part.label,
    })),
    conditionPresets,
    actorRows,
    targetRows,
    combatRows,
    benchRows,
    hasActorRows: actorRows.length > 0,
    hasTargetRows: targetRows.length > 0,
    hasCombatRows: combatRows.length > 0,
    hasBenchRows: benchRows.length > 0,
    selectedCount: selectedActors.length,
    targetActorCount: targetActors.length,
    combatActorCount: combatActors.length,
    benchCount: benchActors.length,
    actionActorId: sourceActor?.id ?? "",
    actionActorName: sourceActor?.name ?? "no selected actor",
    actionScope: scope,
    actionItems,
    hasActionItems: actionItems.length > 0,
    targetCount: Number(globalThis.game?.user?.targets?.size ?? 0),
    activeCombat,
    participantCount: participants.length,
    pendingCount,
    worldTime,
    worldTimeLabel: `${Math.floor(worldTime / 3600)}h ${Math.floor((worldTime % 3600) / 60)}m`,
    scopeRows: GM_CONTROL_SCOPES.map(scope => ({
      ...scope,
      count: {
        selected: selectedActors.length,
        targets: targetActors.length,
        "selected-targets": gmControlUniqueActors([...selectedActors, ...targetActors]).length,
        combat: combatActors.length,
        bench: benchActors.length,
      }[scope.id] ?? 0,
      tone: ({
        selected: selectedActors.length,
        targets: targetActors.length,
        "selected-targets": gmControlUniqueActors([...selectedActors, ...targetActors]).length,
        combat: combatActors.length,
        bench: benchActors.length,
      }[scope.id] ?? 0) ? "is-good" : "is-todo",
    })),
    statusLabel: actorRows.length
      ? `${actorRows.length} selected · ${activeCombat ? "combat active" : "free mode"}`
      : targetRows.length
        ? `${targetRows.length} targets · ${activeCombat ? "combat active" : "free mode"}`
        : combatRows.length
          ? `${combatRows.length} combat actors`
          : "select tokens or choose another scope",
    tone: actorRows.some(row => row.tone === "is-danger")
      || targetRows.some(row => row.tone === "is-danger")
      ? "is-danger"
      : actorRows.some(row => row.tone === "is-warn") || targetRows.some(row => row.tone === "is-warn")
        ? "is-warn"
        : actorRows.length || targetRows.length || combatRows.length || benchRows.length
          ? "is-good"
          : "is-todo",
  };
}

function gmControlBuildVitalsPatch(actor, { clearTrauma = true } = {}) {
  const updates = {};
  const resources = actor?.system?.resources ?? {};
  const hp = resources.hp ?? {};

  if (hp && typeof hp === "object" && (hp.value !== undefined || hp.max !== undefined)) {
    const max = Number(hp.max ?? hp.value ?? 0);
    if (max > 0) updates["system.resources.hp.value"] = max;
  } else if (hp && typeof hp === "object") {
    for (const [partKey, part] of Object.entries(hp)) {
      if (!part || typeof part !== "object") continue;
      const max = Number(part.max ?? 0);
      if (!(max > 0)) continue;
      updates[`system.resources.hp.${partKey}.value`] = max;
      if (clearTrauma) {
        updates[`system.resources.hp.${partKey}.status.minorBleeding`] = 0;
        updates[`system.resources.hp.${partKey}.status.majorBleeding`] = 0;
        updates[`system.resources.hp.${partKey}.status.fracture`] = false;
        updates[`system.resources.hp.${partKey}.status.destroyed`] = false;
        updates[`system.resources.hp.${partKey}.status.splinted`] = false;
        updates[`system.resources.hp.${partKey}.status.tourniquet`] = false;
      }
    }
  }

  for (const key of ["energy", "mana", "satiety", "hydration"]) {
    const resource = resources[key];
    const max = Number(resource?.max ?? 0);
    if (max > 0) updates[`system.resources.${key}.value`] = max;
  }

  const soulEnergyMax = Number(resources.soul?.energyReserve?.max ?? 0);
  if (soulEnergyMax > 0) updates["system.resources.soul.energyReserve.value"] = soulEnergyMax;
  const soulManaMax = Number(resources.soul?.manaReserve?.max ?? 0);
  if (soulManaMax > 0) updates["system.resources.soul.manaReserve.value"] = soulManaMax;

  if (resources.soulReserve) {
    updates["system.resources.soulReserve.isDead"] = false;
    updates["system.resources.soulReserve.daysSinceDeath"] = 0;
  }

  return updates;
}

function gmControlBuildClearConditionPatch(actor) {
  const updates = {};
  const conditions = actor?.system?.conditions ?? {};
  const keys = new Set([
    ...GM_CONTROL_CLEAR_CONDITION_KEYS,
    ...getActiveConditionEntries(conditions).map(entry => entry.key),
  ]);
  for (const key of keys) {
    updates[`system.conditions.${getConditionStorageKey(key)}`] = 0;
  }

  const fractures = conditions.fractures;
  if (fractures && typeof fractures === "object") {
    for (const key of Object.keys(fractures)) {
      updates[`system.conditions.fractures.${key}`] = false;
    }
  }

  return updates;
}

async function gmControlRestoreVitals(actor, { clearConditions = false } = {}) {
  const updates = {
    ...gmControlBuildVitalsPatch(actor),
    ...(clearConditions ? gmControlBuildClearConditionPatch(actor) : {}),
  };
  if (!Object.keys(updates).length) return { changed: false };
  await actor.update(updates);
  return { changed: true };
}

async function gmControlClearConditions(actor) {
  const updates = gmControlBuildClearConditionPatch(actor);
  if (!Object.keys(updates).length) return { changed: false };
  await actor.update(updates);
  return { changed: true };
}

async function gmControlSyncActorTrauma(actor) {
  await refreshActorBodyTraumaStatus(actor);
  await syncDerivedConditionsFromTrauma(actor, { render: false });
  return { changed: true, reason: "trauma-synced" };
}

async function gmControlRepairActorGear(actor) {
  let repaired = 0;
  for (const item of gmControlItemValues(actor)) {
    const max = Number(item?.system?.durability?.max ?? 0);
    const value = Number(item?.system?.durability?.value ?? max);
    if (!(max > 0) || value >= max) continue;
    await item.update({ "system.durability.value": max });
    repaired += 1;
  }
  return { repaired };
}

function gmControlGetProperty(root, path, fallback = undefined) {
  if (!root || !path) return fallback;
  const foundryGet = globalThis.foundry?.utils?.getProperty;
  if (typeof foundryGet === "function") {
    const value = foundryGet(root, path);
    return value === undefined ? fallback : value;
  }
  const value = String(path).split(".").filter(Boolean).reduce((cursor, part) => cursor?.[part], root);
  return value === undefined ? fallback : value;
}

function gmControlResolveNumericValue({ current = 0, max = 0, mode = "full", amount = 0 } = {}) {
  const safeCurrent = Number.isFinite(Number(current)) ? Number(current) : 0;
  const safeMax = Number.isFinite(Number(max)) ? Number(max) : 0;
  const safeAmount = Math.max(0, Number(amount ?? 0) || 0);
  const upper = safeMax > 0 ? safeMax : Number.MAX_SAFE_INTEGER;
  let next = safeCurrent;

  if (mode === "full") next = safeMax > 0 ? safeMax : safeCurrent;
  else if (mode === "zero") next = 0;
  else if (mode === "set") next = safeAmount;
  else if (mode === "add") next = safeCurrent + safeAmount;
  else if (mode === "sub") next = safeCurrent - safeAmount;

  return clamp(Math.round(next), 0, upper);
}

function gmControlResourcePath(resourceKey) {
  if (["energy", "mana", "satiety", "hydration"].includes(resourceKey)) {
    return {
      valuePath: `system.resources.${resourceKey}.value`,
      maxPath: `system.resources.${resourceKey}.max`,
    };
  }
  if (resourceKey === "soul-energy") {
    return {
      valuePath: "system.resources.soul.energyReserve.value",
      maxPath: "system.resources.soul.energyReserve.max",
    };
  }
  if (resourceKey === "soul-mana") {
    return {
      valuePath: "system.resources.soul.manaReserve.value",
      maxPath: "system.resources.soul.manaReserve.max",
    };
  }
  return null;
}

function gmControlBuildResourcePatch(actor, resourceKey, mode = "full", amount = 0) {
  const descriptor = gmControlResourcePath(resourceKey);
  if (!descriptor) return {};
  const current = Number(gmControlGetProperty(actor, descriptor.valuePath, 0));
  const max = Number(gmControlGetProperty(actor, descriptor.maxPath, current));
  const next = gmControlResolveNumericValue({ current, max, mode, amount });
  return next === current ? {} : { [descriptor.valuePath]: next };
}

function gmControlBuildHpPatch(actor, mode = "full", amount = 0) {
  const hp = actor?.system?.resources?.hp;
  const updates = {};
  if (!hp || typeof hp !== "object") return updates;

  if (hp.value !== undefined || hp.max !== undefined) {
    const current = Number(hp.value ?? 0);
    const max = Number(hp.max ?? current);
    const next = gmControlResolveNumericValue({ current, max, mode, amount });
    if (next !== current) updates["system.resources.hp.value"] = next;
    return updates;
  }

  for (const [partKey, part] of Object.entries(hp)) {
    if (!part || typeof part !== "object") continue;
    const current = Number(part.value ?? 0);
    const max = Number(part.max ?? current);
    if (!(max > 0)) continue;
    const next = gmControlResolveNumericValue({ current, max, mode, amount });
    if (next !== current) updates[`system.resources.hp.${partKey}.value`] = next;
  }
  return updates;
}

async function gmControlApplyHpPatch(actor, mode = "full", amount = 0) {
  const updates = gmControlBuildHpPatch(actor, mode, amount);
  if (!Object.keys(updates).length) return { changed: false, reason: "hp-unchanged" };
  await actor.update(updates);
  await refreshActorBodyTraumaStatus(actor);
  await syncDerivedConditionsFromTrauma(actor, { render: false });
  return { changed: true, fields: Object.keys(updates).length };
}

async function gmControlApplyDurability(actor, mode = "full", amount = 0) {
  let changed = 0;
  for (const item of gmControlItemValues(actor)) {
    const max = Number(item?.system?.durability?.max ?? 0);
    if (!(max > 0)) continue;
    const current = Number(item.system?.durability?.value ?? max);
    const next = gmControlResolveNumericValue({ current, max, mode, amount });
    if (next === current) continue;
    await item.update({ "system.durability.value": next });
    changed += 1;
  }
  return { changed: changed > 0, gearChanged: changed };
}

function gmControlApplyCombatSeconds(actor, mode = "full", amount = 0) {
  const participant = getCombatParticipantByActor(actor);
  if (!participant) return { changed: false, reason: "not-in-combat" };
  const max = Math.max(1, Number(participant.maxSeconds ?? 6) || 6);
  const current = Number(participant.remainingSeconds ?? max);
  const next = gmControlResolveNumericValue({ current, max, mode, amount });
  if (next === current) return { changed: false, reason: "seconds-unchanged" };
  updateParticipant(participant.id, { remainingSeconds: next });
  return { changed: true, remainingSeconds: next };
}

async function gmControlApplyResource(actor, resourceKey = "energy", mode = "full", amount = 0) {
  const key = String(resourceKey ?? "energy").trim();
  const resolvedMode = GM_CONTROL_RESOURCE_MODES.some(row => row.id === mode) ? mode : "full";
  const numericAmount = Math.max(0, Number(amount ?? 0) || 0);

  if (key === "all-vitals") {
    const hp = await gmControlApplyHpPatch(actor, resolvedMode, numericAmount);
    const updates = {
      ...gmControlBuildResourcePatch(actor, "energy", resolvedMode, numericAmount),
      ...gmControlBuildResourcePatch(actor, "mana", resolvedMode, numericAmount),
      ...gmControlBuildResourcePatch(actor, "satiety", resolvedMode, numericAmount),
      ...gmControlBuildResourcePatch(actor, "hydration", resolvedMode, numericAmount),
      ...gmControlBuildResourcePatch(actor, "soul-energy", resolvedMode, numericAmount),
      ...gmControlBuildResourcePatch(actor, "soul-mana", resolvedMode, numericAmount),
    };
    if (Object.keys(updates).length) await actor.update(updates);
    return { changed: hp.changed || Object.keys(updates).length > 0, fields: Object.keys(updates).length + Number(hp.fields ?? 0) };
  }

  if (key === "hp") return gmControlApplyHpPatch(actor, resolvedMode, numericAmount);
  if (key === "durability") return gmControlApplyDurability(actor, resolvedMode, numericAmount);
  if (key === "seconds") return gmControlApplyCombatSeconds(actor, resolvedMode, numericAmount);

  const updates = gmControlBuildResourcePatch(actor, key, resolvedMode, numericAmount);
  if (!Object.keys(updates).length) return { changed: false, reason: "resource-unchanged" };
  await actor.update(updates);
  return { changed: true, fields: Object.keys(updates).length };
}

async function gmControlDamageBodyPart(actor, bodyPart = "torso", amount = 0) {
  const locationKey = GM_CONTROL_BODY_PARTS.some(part => part.key === bodyPart) ? bodyPart : "torso";
  const damage = Math.max(0, Number(amount ?? 0) || 0);
  if (!(damage > 0)) return { changed: false, reason: "bad-damage" };
  const result = await applyDamageToBodyPart(actor, locationKey, damage, { onLethal: target => markActorDead(target) });
  await refreshActorBodyTraumaStatus(actor);
  await syncDerivedConditionsFromTrauma(actor, { render: false });
  return {
    changed: true,
    locationKey,
    damage,
    newHP: result.newHP,
    overflow: result.overflow,
    overflowTarget: result.overflowTarget,
  };
}

async function gmControlHealBodyPart(actor, bodyPart = "torso", amount = 0) {
  const locationKey = GM_CONTROL_BODY_PARTS.some(part => part.key === bodyPart) ? bodyPart : "torso";
  const heal = Math.max(0, Number(amount ?? 0) || 0);
  if (!(heal > 0)) return { changed: false, reason: "bad-heal" };
  const result = await healActorBodyPart(actor, locationKey, heal);
  return {
    changed: Number(result.healed ?? 0) > 0,
    locationKey: result.locationKey,
    healed: result.healed,
    newHP: result.newHP,
  };
}

function gmControlResetCombatSeconds(actor, { clearPending = true } = {}) {
  const participant = getCombatParticipantByActor(actor);
  if (!participant) return { changed: false, reason: "not-in-combat" };
  const maxSeconds = Math.max(1, Number(participant.maxSeconds ?? 6) || 6);
  updateParticipant(participant.id, {
    remainingSeconds: maxSeconds,
    hasActed: false,
    defeated: false,
    ...(clearPending ? { pendingAction: null } : {}),
  });
  return { changed: true, remainingSeconds: maxSeconds, clearedPending: Boolean(clearPending && participant.pendingAction) };
}

function gmControlCancelPendingAction(actor) {
  const participant = getCombatParticipantByActor(actor);
  if (!participant?.pendingAction) return { changed: false, reason: "no-pending" };
  updateParticipant(participant.id, { pendingAction: null });
  return { changed: true, label: participant.pendingAction.label ?? "pending action" };
}

async function gmControlPrepareCombatActor(actor) {
  const vitals = await gmControlRestoreVitals(actor, { clearConditions: true });
  const repair = await gmControlRepairActorGear(actor);
  const seconds = gmControlResetCombatSeconds(actor, { clearPending: true });
  await gmControlSyncActorTrauma(actor);
  return {
    changed: true,
    reason: "combat-ready",
    vitals,
    repaired: repair.repaired,
    seconds,
  };
}

async function gmControlRecoverAfterCombatActor(actor) {
  const rest = await applyActorFullRest(actor);
  const vitals = rest?.ok === false ? await gmControlRestoreVitals(actor, { clearConditions: true }) : null;
  const conditions = await gmControlClearConditions(actor);
  const repair = await gmControlRepairActorGear(actor);
  const seconds = gmControlResetCombatSeconds(actor, { clearPending: true });
  await gmControlSyncActorTrauma(actor);
  return {
    changed: true,
    reason: rest?.ok === false ? "forced-recovery-after-rest-block" : "recovered-after-combat",
    rest,
    vitals,
    conditions,
    repaired: repair.repaired,
    seconds,
  };
}

function gmControlRefreshActionEconomyActor(actor) {
  const seconds = gmControlResetCombatSeconds(actor, { clearPending: true });
  const pending = seconds.changed ? { changed: Boolean(seconds.clearedPending) } : gmControlCancelPendingAction(actor);
  return {
    changed: seconds.changed || pending.changed,
    reason: "action-economy-refreshed",
    seconds,
    pending,
  };
}

async function gmControlApplyCondition(actor, key, value) {
  const conditionKey = String(key ?? "").trim();
  const numericValue = Math.max(0, Number(value ?? 0) || 0);
  if (!conditionKey || numericValue <= 0) return { ok: false, changed: false, reason: "bad-condition" };
  return addOrExtendActorCondition(actor, conditionKey, numericValue, {
    mode: getConditionDefaultMode(conditionKey),
    valueKind: getConditionDefaultValueKind(conditionKey),
  });
}

async function gmControlApplyActorAction(action, actor, options = {}) {
  if (action === "prepare-combat") return gmControlPrepareCombatActor(actor);
  if (action === "recover-after-combat") return gmControlRecoverAfterCombatActor(actor);
  if (action === "refresh-action-economy") return gmControlRefreshActionEconomyActor(actor);
  if (action === "sync-trauma") return gmControlSyncActorTrauma(actor);
  if (action === "restore-vitals") return gmControlRestoreVitals(actor);
  if (action === "restore-all") {
    await gmControlRestoreVitals(actor, { clearConditions: true });
    const repair = await gmControlRepairActorGear(actor);
    const seconds = gmControlResetCombatSeconds(actor, { clearPending: true });
    return { changed: true, repaired: repair.repaired, seconds };
  }
  if (action === "repair-gear") return gmControlRepairActorGear(actor);
  if (action === "clear-conditions") return gmControlClearConditions(actor);
  if (action === "short-rest") return applyActorShortRest(actor);
  if (action === "full-rest") return applyActorFullRest(actor);
  if (action === "revive") return reviveActor(actor, 10);
  if (action === "tick-conditions") return applyActorConditionTick(actor, {
    seconds: Number(options.seconds ?? 6) || 6,
    onLethal: target => markActorDead(target),
  });
  if (action === "reset-seconds") return gmControlResetCombatSeconds(actor, { clearPending: false });
  if (action === "clear-pending") return gmControlCancelPendingAction(actor);
  if (action === "apply-condition") return gmControlApplyCondition(actor, options.conditionKey, options.conditionValue);
  if (action === "apply-resource") return gmControlApplyResource(actor, options.resourceKey, options.resourceMode, options.resourceValue);
  if (action === "damage-body") return gmControlDamageBodyPart(actor, options.bodyPart, options.bodyAmount);
  if (action === "heal-body") return gmControlHealBodyPart(actor, options.bodyPart, options.bodyAmount);
  if (action === "defeat") {
    await markActorDead(actor);
    return { changed: true };
  }
  return { ok: false, changed: false, reason: "unknown-action" };
}

function gmControlEquippedWeapon(actor, hand = "rightHand") {
  const itemId = actor?.system?.equipment?.[hand];
  if (!itemId) return null;
  return actor?.items?.get?.(itemId)
    ?? gmControlItemValues(actor).find(item => String(item.id) === String(itemId))
    ?? null;
}

function gmControlWeaponAttackParams(actor, { item = null, hand = "rightHand" } = {}) {
  const weapon = item?.type === "weapon" ? item : gmControlEquippedWeapon(actor, hand);
  if (weapon) {
    return {
      hand,
      skillKey: weapon.system?.skill ?? "unarmed",
      label: weapon.name,
      damageType: weapon.system?.damageType ?? "physical",
      baseDamage: Number(weapon.system?.damage ?? 1),
      energyCost: Number(weapon.system?.energyCost ?? 5),
      weapon,
      actionSeconds: Number(weapon.system?.actionSeconds ?? weapon.system?.timeCost ?? 0) || null,
      rangeOverride: Number(weapon.system?.range ?? 0) || null,
    };
  }

  return {
    hand,
    skillKey: actor?.system?.combat?.unarmedSkillKey ?? "unarmed",
    label: "Unarmed",
    damageType: "physical",
    baseDamage: Number(actor?.system?.combat?.unarmedDamage ?? 1),
    energyCost: 5,
    weapon: null,
  };
}

async function gmControlExecuteQuickAction({
  scope = "selected",
  itemId = "",
  hand = "rightHand",
  skipTimeCost = true,
  targetZone = "",
  targetZoneMode = "",
  aimed = false,
  friendlyFireMode = "",
} = {}) {
  const actor = gmControlResolveActors(scope, { notify: true })[0] ?? null;
  if (!actor) {
    globalThis.ui?.notifications?.warn?.("Choose a GM Control scope with at least one actor first.");
    return { ok: false, reason: "missing-actor" };
  }

  const item = itemId
    ? (actor.items?.get?.(itemId) ?? gmControlItemValues(actor).find(candidate => String(candidate.id) === String(itemId)) ?? null)
    : null;
  const targets = globalThis.game?.user?.targets ?? [];
  const resolveTime = skipTimeCost
    ? null
    : args => resolveCombatTimeCostForActor(actor, args);
  const cleanedTargetZone = GM_CONTROL_BODY_PARTS.some(part => part.key === targetZone) ? targetZone : "";
  const cleanedZoneMode = GM_CONTROL_TARGET_ZONE_MODES.some(row => row.id === targetZoneMode) ? targetZoneMode : "";
  const cleanedFriendlyMode = GM_CONTROL_FRIENDLY_FIRE_MODES.some(row => row.id === friendlyFireMode) ? friendlyFireMode : "";
  const spellOverrides = {
    ...(cleanedTargetZone ? { targetZone: cleanedTargetZone } : {}),
    ...(cleanedZoneMode ? { targetZoneMode: cleanedZoneMode } : {}),
    ...(cleanedFriendlyMode ? {
      friendlyFireMode: cleanedFriendlyMode,
      ...(cleanedFriendlyMode === "on" ? { friendlyFire: true } : {}),
      ...(cleanedFriendlyMode === "off" ? { friendlyFire: false } : {}),
    } : {}),
  };

  if (item?.type === "spell" || item?.type === "scroll") {
    const result = await castSpellLikeItem({
      actor,
      item,
      isScroll: item.type === "scroll",
      skipTimeCost,
      targets,
      resolveCombatTimeCost: resolveTime,
      onLethal: target => markActorDead(target),
      spellOverrides: Object.keys(spellOverrides).length ? spellOverrides : null,
    });
    return { ok: Boolean(result?.ok ?? true), actor, item, result, kind: item.type };
  }

  const params = gmControlWeaponAttackParams(actor, { item, hand });
  const result = await performActorAttack({
    actor,
    ...params,
    skipTimeCost,
    targets,
    resolveCombatTimeCost: resolveTime,
    onLethal: target => markActorDead(target),
    targetZone: cleanedTargetZone || null,
    targetZoneMode: cleanedZoneMode || null,
    aimed: Boolean(aimed || cleanedZoneMode === "aimed"),
  });
  return { ok: Boolean(result?.ok ?? true), actor, item: params.weapon, result, kind: "attack" };
}

async function gmControlAdvanceTime(presetId) {
  const preset = GM_CONTROL_TIME_PRESETS.find(row => row.id === presetId) ?? GM_CONTROL_TIME_PRESETS[0];
  const seconds = Math.max(1, Number(preset.seconds ?? 0) || 0);
  if (typeof globalThis.game?.time?.advance !== "function") {
    globalThis.ui?.notifications?.warn?.("game.time.advance is not available.");
    return { ok: false, reason: "missing-time-api" };
  }
  await globalThis.game.time.advance(seconds);
  return { ok: true, seconds, label: preset.label };
}

function gmControlSecondsFromPreset(presetId) {
  const preset = GM_CONTROL_TIME_PRESETS.find(row => row.id === presetId) ?? GM_CONTROL_TIME_PRESETS[0];
  return Math.max(1, Number(preset.seconds ?? 0) || 6);
}

function gmControlResultStatus(row = {}) {
  const result = row.result ?? {};
  if (result.ok === false) return { label: "failed", tone: "is-danger" };
  if (result.changed === false) return { label: "skipped", tone: "is-warn" };
  return { label: "done", tone: "is-good" };
}

function gmControlActorResultNote(row = {}) {
  const result = row.result ?? {};
  if (result.reason) return result.reason;
  if (result.label) return result.label;
  if (Number.isFinite(Number(result.repaired))) return `repaired ${result.repaired}`;
  if (Number.isFinite(Number(result.gearChanged))) return `gear ${result.gearChanged}`;
  if (Number.isFinite(Number(result.fields))) return `fields ${result.fields}`;
  if (result.remainingSeconds !== undefined) return `seconds ${result.remainingSeconds}`;
  if (result.locationKey) return `${getHitLabel(result.locationKey) || result.locationKey}`;
  return "ok";
}

function buildGmControlReportBody(results = []) {
  if (!Array.isArray(results) || !results.length) return "";
  const rows = results.map(row => {
    const actor = row.actor;
    const status = gmControlResultStatus(row);
    const snapshot = actor ? gmControlActorRow(actor) : null;
    return `
      <div class="ih-gm-control-result ${status.tone}">
        <strong>${escapeCombatHtml(actor?.name ?? "Actor")}</strong>
        <span>${escapeCombatHtml(status.label)} · ${escapeCombatHtml(gmControlActorResultNote(row))}</span>
        <em>${escapeCombatHtml(snapshot ? `${snapshot.hpLabel} · ${snapshot.energyLabel} · ${snapshot.manaLabel}` : "")}</em>
        <small>${escapeCombatHtml(snapshot ? `${snapshot.conditionsLabel} · gear ${snapshot.durabilityLabel} · ${snapshot.combatLabel}` : "")}</small>
      </div>`;
  }).join("");
  return `<div class="ih-gm-control-results">${rows}</div>`;
}

async function gmControlPostReport({ title, rows = [], notices = [], bodyHtml = "", status = "Done", statusClass = "is-good" } = {}) {
  if (typeof ChatMessage === "undefined") return;
  await ChatMessage.create({
    content: buildCombatChatCard({
      title: title || "GM Control",
      icon: "*",
      status,
      statusClass,
      rows,
      bodyHtml,
      notices,
      className: "ih-gm-control-card",
    }),
  });
}

async function runGmControlAction({
  action,
  scope = "selected",
  conditionKey = "",
  conditionValue = 1,
  resourceKey = "energy",
  resourceMode = "full",
  resourceValue = 0,
  bodyPart = "torso",
  bodyAmount = 5,
  timePreset = "six-seconds",
  itemId = "",
  hand = "rightHand",
  skipTimeCost = true,
  targetZone = "",
  targetZoneMode = "",
  aimed = false,
  friendlyFireMode = "",
} = {}) {
  if (!globalThis.game?.user?.isGM) {
    globalThis.ui?.notifications?.warn?.("GM Control is available only to GM users.");
    return { ok: false, reason: "not-gm" };
  }

  if (action === "open-combat-hud") {
    globalThis.game?.ironHills?.openCombatHud?.({ compactMode: true });
    return { ok: true, action };
  }
  if (action === "open-combat-director") {
    globalThis.game?.ironHills?.openCombatDirector?.();
    return { ok: true, action };
  }
  if (action === "open-combat-manager") {
    globalThis.game?.ironHills?.openCombatManager?.();
    return { ok: true, action };
  }
  if (action === "open-inventory") {
    const actor = gmControlSelectedActors()[0] ?? globalThis.game?.user?.character ?? null;
    if (actor) globalThis.game?.ironHills?.openGridInventory?.(actor);
    return { ok: Boolean(actor), action, actor };
  }
  if (action === "open-world-map") {
    globalThis.game?.ironHills?.openWorldMap?.();
    return { ok: true, action };
  }
  if (action === "quick-action") {
    const result = await gmControlExecuteQuickAction({
      scope,
      itemId,
      hand,
      skipTimeCost,
      targetZone,
      targetZoneMode,
      aimed,
      friendlyFireMode,
    });
    if (result.ok) {
      globalThis.ui?.notifications?.info?.(`GM action: ${result.actor?.name ?? "actor"} ${result.kind}`);
    }
    return result;
  }
  if (action === "advance-time") {
    const result = await gmControlAdvanceTime(timePreset);
    if (result.ok) {
      await gmControlPostReport({
        title: "GM Time Control",
        rows: [["Advanced", result.label], ["Seconds", result.seconds]],
      });
      globalThis.ui?.notifications?.info?.(`World time advanced: ${result.label}`);
    }
    return result;
  }

  const actors = gmControlResolveActors(scope, { notify: true });
  if (!actors.length) return { ok: false, reason: "no-actors" };

  const results = [];
  for (const actor of actors) {
    const result = await gmControlApplyActorAction(action, actor, {
      conditionKey,
      conditionValue,
      resourceKey,
      resourceMode,
      resourceValue,
      bodyPart,
      bodyAmount,
      seconds: action === "tick-conditions" ? gmControlSecondsFromPreset(timePreset) : null,
    });
    results.push({ actor, result });
  }

  const changed = results.filter(row => row.result?.changed !== false && row.result?.ok !== false).length;
  const failed = results.length - changed;
  const titleByAction = {
    "prepare-combat": "GM Prepare Combat",
    "recover-after-combat": "GM Recover After Combat",
    "refresh-action-economy": "GM Refresh Action Economy",
    "sync-trauma": "GM Sync Trauma",
    "restore-vitals": "GM Restore Vitals",
    "restore-all": "GM Restore All",
    "repair-gear": "GM Repair Gear",
    "clear-conditions": "GM Clear Effects",
    "short-rest": "GM Short Rest",
    "full-rest": "GM Full Rest",
    revive: "GM Revive",
    "tick-conditions": "GM Tick Conditions",
    "reset-seconds": "GM Reset Seconds",
    "clear-pending": "GM Clear Pending Action",
    "apply-condition": "GM Apply Effect",
    "apply-resource": "GM Resource Control",
    "damage-body": "GM Damage Body Part",
    "heal-body": "GM Heal Body Part",
    defeat: "GM Defeat Actor",
  };
  await gmControlPostReport({
    title: titleByAction[action] ?? "GM Control",
    status: failed ? "Partial" : "Done",
    statusClass: failed ? "is-warn" : "is-good",
    rows: [
      ["Scope", scope],
      ["Actors", actors.length],
      ["Changed", changed],
      ["Failed/Skipped", failed, failed > 0],
      ["Effect", `${getConditionLabel(conditionKey) || conditionKey} ${conditionValue}`, action === "apply-condition"],
      ["Resource", `${resourceKey} ${resourceMode} ${resourceValue}`, action === "apply-resource"],
      ["Body", `${getHitLabel(bodyPart) || bodyPart} ${bodyAmount}`, action === "damage-body" || action === "heal-body"],
    ],
    bodyHtml: buildGmControlReportBody(results),
    notices: results.slice(0, 6).map(row => [
      row.actor?.name ?? "Actor",
      row.result?.reason ?? row.result?.label ?? "ok",
      row.result?.ok === false || row.result?.changed === false,
    ]),
  });
  globalThis.ui?.notifications?.info?.(`GM Control: ${changed}/${actors.length} actors updated.`);
  return { ok: failed === 0, action, actors, results, changed, failed };
}

function firstSessionSeedFlagObject(kind, id) {
  return {
    [SYSTEM_ID]: {
      firstSessionSeed: true,
      firstSessionKind: kind,
      firstSessionId: id,
    },
  };
}

function firstSessionSeedFlagPatch(kind, id) {
  return {
    [`flags.${SYSTEM_ID}.firstSessionSeed`]: true,
    [`flags.${SYSTEM_ID}.firstSessionKind`]: kind,
    [`flags.${SYSTEM_ID}.firstSessionId`]: id,
  };
}

function findWorldActorByTypeAndName(type, name) {
  const wantedType = String(type ?? "").trim();
  const wantedName = String(name ?? "").trim();
  if (!wantedType || !wantedName) return null;
  return game.actors?.find(actor => actor.type === wantedType && actor.name === wantedName) ?? null;
}

function materializeStatusLabel(status) {
  if (status === "created") return "создано";
  if (status === "updated") return "обновлено";
  if (status === "stocked") return "пополнено";
  if (status === "linked") return "связано";
  if (status === "placed") return "размещено";
  if (status === "skipped") return "пропущено";
  return "без изменений";
}

function pushMaterializeReport(reports, category, status, actorOrName, detail = "") {
  const name = typeof actorOrName === "string" ? actorOrName : actorOrName?.name ?? "";
  reports.push({
    category,
    status,
    statusLabel: materializeStatusLabel(status),
    name,
    detail,
  });
}

function firstSessionSettlementCreateData(seed) {
  return {
    name: seed.name,
    type: "settlement",
    flags: firstSessionSeedFlagObject("settlement", seed.id),
    system: {
      info: {
        region: FIRST_SESSION_CONTENT_BLUEPRINT.region,
        tier: seed.tier,
        population: seed.population,
        prosperity: seed.prosperity,
        danger: seed.danger,
        supply: seed.supply,
        controllingFaction: seed.controllingFaction ?? "",
        tags: seed.tags ?? "",
        mapCol: seed.mapCol,
        mapRow: seed.mapRow,
        sceneId: seed.sceneId ?? "",
      },
      economy: {
        foodPrice: 1,
        materialsPrice: 1,
        alchemyPrice: 1,
        armsPrice: 1,
        lodgingPrice: 1,
        factionPressure: 0,
        merchantCount: 0,
        routeValue: 1,
        weeklySummary: "first-session seed",
        economyStatus: "normal",
      },
      regionSim: {
        activeCrisis: "",
        tradeBalance: 0,
        caravanTraffic: 1,
        lastCaravan: "",
        lastRegionEvent: seed.events?.[0] ?? "",
        stability: 5,
        militiaPower: 5,
      },
      history: {
        rumors: [...(seed.rumors ?? [])],
        events: [],
        regionalEvents: [...(seed.events ?? [])],
      },
    },
  };
}

function firstSessionSettlementUpdatePatch(seed) {
  return {
    "system.info.region": FIRST_SESSION_CONTENT_BLUEPRINT.region,
    "system.info.tier": seed.tier,
    "system.info.population": seed.population,
    "system.info.prosperity": seed.prosperity,
    "system.info.danger": seed.danger,
    "system.info.supply": seed.supply,
    "system.info.controllingFaction": seed.controllingFaction ?? "",
    "system.info.tags": seed.tags ?? "",
    "system.info.mapCol": seed.mapCol,
    "system.info.mapRow": seed.mapRow,
    "system.info.sceneId": seed.sceneId ?? "",
    "system.economy.economyStatus": "normal",
    "system.economy.weeklySummary": "first-session seed",
    "system.regionSim.lastRegionEvent": seed.events?.[0] ?? "",
    ...firstSessionSeedFlagPatch("settlement", seed.id),
  };
}

async function ensureSettlementHistoryLines(settlement, field, lines = [], limit = 12) {
  if (!settlement || !Array.isArray(lines) || !lines.length) return 0;
  const current = Array.isArray(settlement.system?.history?.[field])
    ? [...settlement.system.history[field]]
    : [];
  const missing = lines.filter(line => line && !current.includes(line));
  if (!missing.length) return 0;
  await settlement.update({ [`system.history.${field}`]: [...missing, ...current].slice(0, limit) });
  return missing.length;
}

async function upsertFirstSessionSettlement(seed, reports) {
  let actor = findWorldActorByTypeAndName("settlement", seed.name);
  if (actor) {
    await actor.update(firstSessionSettlementUpdatePatch(seed));
    pushMaterializeReport(reports, "Поселения", "updated", actor, `[${seed.mapCol}, ${seed.mapRow}]`);
  } else {
    actor = await Actor.create(firstSessionSettlementCreateData(seed));
    pushMaterializeReport(reports, "Поселения", "created", actor, `[${seed.mapCol}, ${seed.mapRow}]`);
  }

  const rumorCount = await ensureSettlementHistoryLines(actor, "rumors", [...(seed.rumors ?? [])], 12);
  const eventCount = await ensureSettlementHistoryLines(actor, "regionalEvents", [...(seed.events ?? [])], 12);
  if (rumorCount || eventCount) {
    pushMaterializeReport(reports, "Слухи", "linked", actor, `+${rumorCount} слухов, +${eventCount} событий`);
  }
  return actor;
}

function firstSessionPoiUpdatePatch(seed) {
  const mapChoice = chooseMapTileForPoi({
    regionName: FIRST_SESSION_CONTENT_BLUEPRINT.region,
    poiType: seed.poiType,
    nearestSettlement: seed.nearestSettlement,
    mapCol: seed.mapCol,
    mapRow: seed.mapRow,
  });
  return {
    "system.info.poiType": seed.poiType,
    "system.info.region": FIRST_SESSION_CONTENT_BLUEPRINT.region,
    "system.info.nearestSettlement": seed.nearestSettlement ?? "",
    "system.info.tier": seed.tier,
    "system.info.danger": seed.danger,
    "system.info.status": seed.status,
    "system.info.faction": seed.faction,
    "system.info.theme": seed.theme,
    "system.info.discoveryDC": seed.discoveryDC,
    "system.info.distance": seed.distance,
    "system.info.mapCol": mapChoice.col,
    "system.info.mapRow": mapChoice.row,
    "system.info.mapRegionId": mapChoice.regionId,
    "system.info.mapTerrain": mapChoice.tile?.terrain ?? seed.poiType,
    "system.info.sceneId": seed.sceneId ?? "",
    "system.info.localScale": "local",
    "system.info.encounterProfile": mapChoice.tile?.terrain ?? seed.poiType,
    "system.state.threatLevel": clamp(seed.danger + Math.floor(seed.tier / 2), 1, 10),
    "system.state.control": clamp(seed.danger, 1, 10),
    "system.state.baseType": seed.poiType === "road" ? "roadblock" : "outpost",
    "system.state.lastGeneratedEvent": `Стартовая точка первой сессии: ${todayStamp()}`,
    ...firstSessionSeedFlagPatch("poi", seed.id),
  };
}

async function upsertFirstSessionPoi(seed, reports) {
  let actor = findWorldActorByTypeAndName("poi", seed.name);
  if (actor) {
    await actor.update(firstSessionPoiUpdatePatch(seed));
    pushMaterializeReport(reports, "POI", "updated", actor, `[${seed.mapCol}, ${seed.mapRow}]`);
    return actor;
  }

  actor = await createPoi({
    region: FIRST_SESSION_CONTENT_BLUEPRINT.region,
    poiType: seed.poiType,
    tier: seed.tier,
    nearestSettlement: seed.nearestSettlement,
    faction: seed.faction,
    theme: seed.theme,
    danger: seed.danger,
    status: seed.status,
    discoveryDC: seed.discoveryDC,
    distance: seed.distance,
    mapCol: seed.mapCol,
    mapRow: seed.mapRow,
    sceneId: seed.sceneId ?? "",
    name: seed.name,
    spawnNpc: false,
  });
  await actor.update(firstSessionSeedFlagPatch("poi", seed.id));
  pushMaterializeReport(reports, "POI", "created", actor, `[${seed.mapCol}, ${seed.mapRow}]`);
  return actor;
}

const FIRST_SESSION_MERCHANT_COPPER = Object.freeze([0, 200, 500, 1500, 5000, 15000, 40000, 100000, 250000, 500000, 1000000]);

function firstSessionCurrencyForTier(tier) {
  const baseCopper = FIRST_SESSION_MERCHANT_COPPER[Math.min(10, Math.max(1, Number(tier) || 1))] ?? 200;
  return {
    gold: Math.floor(baseCopper / 10000),
    silver: Math.floor((baseCopper % 10000) / 100),
    copper: baseCopper % 100,
  };
}

function firstSessionMerchantCreateData(seed, settlement = null) {
  const placement = firstSessionPlacementInfo(settlement);
  return {
    name: seed.name,
    type: "merchant",
    flags: firstSessionSeedFlagObject("merchant", seed.id),
    system: {
      info: {
        specialty: seed.specialty,
        settlement: seed.settlement,
        settlementId: settlement?.id ?? "",
        tier: seed.tier,
        faction: seed.faction ?? "",
        region: FIRST_SESSION_CONTENT_BLUEPRINT.region,
        ...placement,
      },
      economy: {
        wealth: 40 + seed.tier * 20,
        markup: Number((1 + seed.tier * 0.05).toFixed(2)),
        economyStatus: seed.economy ?? "normal",
      },
      market: {
        lastRestock: "",
        currentPriceFactor: Number((1 + (seed.tier - 1) * 0.05).toFixed(2)),
        stockRating: 5,
      },
      currency: firstSessionCurrencyForTier(seed.tier),
    },
  };
}

function firstSessionMerchantUpdatePatch(seed, settlement = null) {
  const placement = firstSessionPlacementInfo(settlement);
  return {
    "system.info.specialty": seed.specialty,
    "system.info.settlement": seed.settlement,
    "system.info.settlementId": settlement?.id ?? "",
    "system.info.tier": seed.tier,
    "system.info.faction": seed.faction ?? "",
    "system.info.region": FIRST_SESSION_CONTENT_BLUEPRINT.region,
    "system.economy.economyStatus": seed.economy ?? "normal",
    ...firstSessionPlacementPatch("system.info", placement),
    ...firstSessionSeedFlagPatch("merchant", seed.id),
  };
}

async function upsertFirstSessionMerchant(seed, reports) {
  const settlement = findSettlementByName(seed.settlement);
  let actor = findWorldActorByTypeAndName("merchant", seed.name);
  if (actor) {
    await actor.update(firstSessionMerchantUpdatePatch(seed, settlement));
    pushMaterializeReport(reports, "Торговцы", "updated", actor, seed.settlement);
  } else {
    actor = await Actor.create(firstSessionMerchantCreateData(seed, settlement));
    pushMaterializeReport(reports, "Торговцы", "created", actor, seed.settlement);
  }

  if (settlement?.id && seed.economy && seed.economy !== "normal") {
    await setSettlementEconomy(settlement.id, seed.economy);
  }

  const restock = await restockMerchant(actor, settlement);
  pushMaterializeReport(reports, "Сток", "stocked", actor, `+${restock.added} предметов, x${restock.factor}`);
  return actor;
}

function firstSessionNpcLocationName(seed) {
  const byRole = {
    "safe-guide": "Эшфорд",
    "gate-guard": "Ривергейт",
    "road-threat": "Западная дорога",
    "wilderness-contact": "Чёрный Бор",
    "repair-and-trade": "Копёрный Пик",
    "arcane-support": "Глубокий Пласт",
    healer: "Эшфорд",
    "quest-patron": "Ривергейт",
  };
  return byRole[seed.sceneRole] ?? FIRST_SESSION_TARGET_REGION;
}

function firstSessionNpcPurpose(seed) {
  const byRole = {
    "safe-guide": "Вводит группу в регион, слухи и безопасные маршруты.",
    "gate-guard": "Даёт законный контекст, пропуск и первый дорожный конфликт.",
    "road-threat": "Низкоуровневый враждебный тест боя, лута и friendly fire.",
    "wilderness-contact": "Связывает группу с лесом, следами монстров и выживанием.",
    "repair-and-trade": "Поддерживает ремонт, броню, крафт и шахтёрский крючок.",
    "arcane-support": "Даёт магическую зацепку для шахты и аномалий.",
    healer: "Закрывает медицину, восстановление и последствия ранений.",
    "quest-patron": "Формулирует региональную цель и награды первой сессии.",
  };
  return byRole[seed.sceneRole] ?? "NPC первой сессии Iron Hills.";
}

function firstSessionDestinationActorByName(name = "") {
  const location = String(name ?? "").trim();
  if (!location) return null;
  return findWorldActorByTypeAndName("settlement", location)
    ?? findWorldActorByTypeAndName("poi", location)
    ?? null;
}

function firstSessionNpcDestinationActor(seed) {
  return firstSessionDestinationActorByName(firstSessionNpcLocationName(seed));
}

function firstSessionPlacementInfo(actor = null) {
  const info = actor?.system?.info ?? {};
  return {
    locationId: actor?.id ?? "",
    locationType: actor?.type ?? "",
    mapCol: isValidMapCoord(info.mapCol, info.mapRow) ? info.mapCol : null,
    mapRow: isValidMapCoord(info.mapCol, info.mapRow) ? info.mapRow : null,
    mapRegionId: info.mapRegionId ?? "",
    mapTerrain: info.mapTerrain ?? info.poiType ?? "",
    sceneId: info.sceneId ?? "",
  };
}

function firstSessionPlacementPatch(prefix, placement = {}) {
  const patch = {
    [`${prefix}.locationId`]: placement.locationId ?? "",
    [`${prefix}.locationType`]: placement.locationType ?? "",
    [`${prefix}.mapRegionId`]: placement.mapRegionId ?? "",
    [`${prefix}.mapTerrain`]: placement.mapTerrain ?? "",
    [`${prefix}.sceneId`]: placement.sceneId ?? "",
  };
  if (placement.mapCol !== null && placement.mapCol !== undefined) patch[`${prefix}.mapCol`] = placement.mapCol;
  if (placement.mapRow !== null && placement.mapRow !== undefined) patch[`${prefix}.mapRow`] = placement.mapRow;
  return patch;
}

function firstSessionNpcCreateData(seed) {
  const doc = buildNpcActorData(seed.specialization, seed.tier, seed.faction, { name: seed.label });
  const location = firstSessionNpcLocationName(seed);
  const placement = firstSessionPlacementInfo(firstSessionNpcDestinationActor(seed));
  doc.data.flags = firstSessionSeedFlagObject("npc", seed.sceneRole ?? `${seed.specialization}-${seed.tier}`);
  doc.data.system.info = {
    ...(doc.data.system.info ?? {}),
    region: FIRST_SESSION_CONTENT_BLUEPRINT.region,
    location,
    homeLocation: location,
    sceneRole: seed.sceneRole ?? "",
    desc: firstSessionNpcPurpose(seed),
    ...placement,
  };
  return doc;
}

function firstSessionNpcUpdatePatch(seed, doc) {
  const location = firstSessionNpcLocationName(seed);
  const placement = firstSessionPlacementInfo(firstSessionNpcDestinationActor(seed));
  return {
    img: doc.data.img,
    "prototypeToken.name": seed.label,
    "prototypeToken.texture.src": doc.data.img,
    "system.info.region": FIRST_SESSION_CONTENT_BLUEPRINT.region,
    "system.info.role": doc.data.system.info?.role ?? "",
    "system.info.specialization": doc.roleKey,
    "system.info.faction": seed.faction ?? "",
    "system.info.tier": Math.max(1, Math.min(10, Number(seed.tier) || 1)),
    "system.info.location": location,
    "system.info.homeLocation": location,
    "system.info.sceneRole": seed.sceneRole ?? "",
    "system.info.desc": firstSessionNpcPurpose(seed),
    ...firstSessionPlacementPatch("system.info", placement),
    ...firstSessionSeedFlagPatch("npc", seed.sceneRole ?? `${seed.specialization}-${seed.tier}`),
  };
}

async function upsertFirstSessionNpc(seed, reports) {
  const doc = firstSessionNpcCreateData(seed);
  let actor = findWorldActorByTypeAndName("npc", seed.label);
  if (actor) {
    await actor.update(firstSessionNpcUpdatePatch(seed, doc));
    pushMaterializeReport(reports, "NPC", "updated", actor, firstSessionNpcLocationName(seed));
  } else {
    actor = await Actor.create(doc.data);
    pushMaterializeReport(reports, "NPC", "created", actor, firstSessionNpcLocationName(seed));
  }

  if (!actor.items?.size) {
    const startingItems = buildNpcStartingInventoryItems(doc.roleKey, seed.tier);
    if (startingItems.length) await actor.createEmbeddedDocuments("Item", startingItems);
  }
  return actor;
}

function firstSessionQuestCreateData(seed) {
  const settlement = findSettlementByName(seed.targetSettlement);
  const poi = findWorldActorByTypeAndName("poi", seed.targetPOI);
  const placement = firstSessionPlacementInfo(poi ?? settlement);
  return {
    name: seed.name,
    type: "quest",
    flags: firstSessionSeedFlagObject("quest", seed.id),
    system: {
      info: {
        questType: seed.questType,
        status: "active",
        region: FIRST_SESSION_CONTENT_BLUEPRINT.region,
        issuer: seed.issuer,
        targetSettlement: seed.targetSettlement,
        targetPOI: seed.targetPOI,
        settlementId: settlement?.id ?? "",
        targetPOIId: poi?.id ?? "",
        targetFaction: seed.targetFaction ?? "",
        difficulty: seed.difficulty,
        reward: seed.reward,
        dueText: seed.dueText ?? "",
        ...placement,
      },
      description: {
        summary: seed.summary,
        objective: seed.objective,
        notes: seed.notes,
      },
      chain: {
        chainId: "iron-hills-first-session",
        arcType: "first-session",
        arcState: "active",
        step: 1,
        maxStep: 3,
        nextQuestType: "",
        autoGenerateNext: false,
      },
      requirements: {
        minSettlementRep: 0,
        minFactionRep: 0,
        requiredCharacter: "",
        requiredQuestStatus: "",
      },
      rewards: {
        silver: seed.silver ?? 0,
        settlementRep: seed.settlementRep ?? 0,
        factionRep: seed.factionRep ?? 0,
        rewardCharacter: "",
        rewardItemName: "",
        rewardItemType: "",
        rewardItemQuantity: 0,
        granted: false,
      },
      effects: {
        success: {
          prosperity: seed.success?.prosperity ?? 0,
          danger: seed.success?.danger ?? 0,
          supply: seed.success?.supply ?? 0,
          stability: seed.success?.stability ?? 0,
          militiaPower: seed.success?.militiaPower ?? 0,
          tradeBalance: seed.success?.tradeBalance ?? 0,
          caravanTraffic: seed.success?.caravanTraffic ?? 0,
          removeTargetPOI: seed.success?.removeTargetPOI ?? false,
          resolveCrisis: seed.success?.resolveCrisis ?? false,
        },
        failure: {
          prosperity: seed.failure?.prosperity ?? 0,
          danger: seed.failure?.danger ?? 0,
          supply: seed.failure?.supply ?? 0,
          stability: seed.failure?.stability ?? 0,
          militiaPower: seed.failure?.militiaPower ?? 0,
          tradeBalance: seed.failure?.tradeBalance ?? 0,
          caravanTraffic: seed.failure?.caravanTraffic ?? 0,
          empowerTargetPOI: seed.failure?.empowerTargetPOI ?? false,
        },
      },
    },
  };
}

function firstSessionQuestUpdatePatch(seed) {
  const settlement = findSettlementByName(seed.targetSettlement);
  const poi = findWorldActorByTypeAndName("poi", seed.targetPOI);
  const placement = firstSessionPlacementInfo(poi ?? settlement);
  return {
    "system.info.questType": seed.questType,
    "system.info.status": "active",
    "system.info.region": FIRST_SESSION_CONTENT_BLUEPRINT.region,
    "system.info.issuer": seed.issuer,
    "system.info.targetSettlement": seed.targetSettlement,
    "system.info.targetPOI": seed.targetPOI,
    "system.info.settlementId": settlement?.id ?? "",
    "system.info.targetPOIId": poi?.id ?? "",
    "system.info.targetFaction": seed.targetFaction ?? "",
    "system.info.difficulty": seed.difficulty,
    "system.info.reward": seed.reward,
    "system.description.summary": seed.summary,
    "system.description.objective": seed.objective,
    "system.description.notes": seed.notes,
    "system.chain.chainId": "iron-hills-first-session",
    "system.chain.arcType": "first-session",
    "system.chain.arcState": "active",
    "system.rewards.silver": seed.silver ?? 0,
    "system.rewards.settlementRep": seed.settlementRep ?? 0,
    "system.rewards.factionRep": seed.factionRep ?? 0,
    ...firstSessionPlacementPatch("system.info", placement),
    ...firstSessionSeedFlagPatch("quest", seed.id),
  };
}

async function upsertFirstSessionQuest(seed, reports) {
  let actor = findWorldActorByTypeAndName("quest", seed.name);
  if (actor) {
    await actor.update(firstSessionQuestUpdatePatch(seed));
    pushMaterializeReport(reports, "Квесты", "updated", actor, seed.targetPOI);
  } else {
    actor = await Actor.create(firstSessionQuestCreateData(seed));
    pushMaterializeReport(reports, "Квесты", "created", actor, seed.targetPOI);
  }
  return actor;
}

function firstSessionBlueprintNpcSeeds() {
  return NPC_EXACT_TIER_PREVIEW_ACTORS.slice(0, 8);
}

async function linkFirstSessionDocuments(reports) {
  let linked = 0;
  let restocked = 0;
  const region = FIRST_SESSION_CONTENT_BLUEPRINT.region;

  for (const settlementSeed of FIRST_SESSION_CONTENT_BLUEPRINT.settlements) {
    const settlement = findWorldActorByTypeAndName("settlement", settlementSeed.name);
    if (!settlement) continue;
    const settlementMerchants = FIRST_SESSION_CONTENT_BLUEPRINT.merchants
      .map(seed => findWorldActorByTypeAndName("merchant", seed.name))
      .filter(merchant => merchant?.system?.info?.settlement === settlement.name);
    const settlementPois = FIRST_SESSION_CONTENT_BLUEPRINT.pois
      .map(seed => findWorldActorByTypeAndName("poi", seed.name))
      .filter(poi => poi?.system?.info?.nearestSettlement === settlement.name);
    await settlement.update({
      "system.info.region": region,
      "system.economy.merchantCount": settlementMerchants.length,
      "system.economy.routeValue": Math.max(1, settlementPois.length + settlementMerchants.length),
      "system.regionSim.lastRegionEvent": settlement.system?.regionSim?.lastRegionEvent || settlementSeed.events?.[0] || "",
    });
    linked += 1;
  }

  for (const merchantSeed of FIRST_SESSION_CONTENT_BLUEPRINT.merchants) {
    const merchant = findWorldActorByTypeAndName("merchant", merchantSeed.name);
    const settlement = findSettlementByName(merchantSeed.settlement);
    if (!merchant) continue;
    await merchant.update({
      ...firstSessionMerchantUpdatePatch(merchantSeed, settlement),
      "system.market.stockRating": clamp(Number(merchant.items?.size ?? 0), 0, 10),
    });
    linked += 1;
    if (Number(merchant.items?.size ?? 0) <= 0) {
      const restock = await restockMerchant(merchant, settlement);
      restocked += restock.added;
    }
  }

  for (const npcSeed of firstSessionBlueprintNpcSeeds()) {
    const npc = findWorldActorByTypeAndName("npc", npcSeed.label);
    const destination = firstSessionNpcDestinationActor(npcSeed);
    const placement = firstSessionPlacementInfo(destination);
    if (!npc) continue;
    await npc.update({
      "system.info.region": region,
      "system.info.location": firstSessionNpcLocationName(npcSeed),
      "system.info.homeLocation": firstSessionNpcLocationName(npcSeed),
      "system.info.sceneRole": npcSeed.sceneRole ?? "",
      "system.info.desc": firstSessionNpcPurpose(npcSeed),
      ...firstSessionPlacementPatch("system.info", placement),
      ...firstSessionSeedFlagPatch("npc", npcSeed.sceneRole ?? `${npcSeed.specialization}-${npcSeed.tier}`),
    });
    linked += 1;
  }

  for (const poiSeed of FIRST_SESSION_CONTENT_BLUEPRINT.pois) {
    const poi = findWorldActorByTypeAndName("poi", poiSeed.name);
    const settlement = findSettlementByName(poiSeed.nearestSettlement);
    if (!poi) continue;
    await poi.update({
      "system.info.nearestSettlementId": settlement?.id ?? "",
      "system.info.region": region,
      "system.info.sceneId": poiSeed.sceneId ?? "",
      ...firstSessionSeedFlagPatch("poi", poiSeed.id),
    });
    linked += 1;
  }

  for (const questSeed of FIRST_SESSION_CONTENT_BLUEPRINT.quests) {
    const quest = findWorldActorByTypeAndName("quest", questSeed.name);
    if (!quest) continue;
    await quest.update(firstSessionQuestUpdatePatch(questSeed));
    linked += 1;
  }

  pushMaterializeReport(
    reports,
    "Связи",
    "linked",
    "First-session graph",
    `${linked} документов синхронизировано${restocked ? `, +${restocked} предметов в пустой сток` : ""}`
  );

  return { linked, restocked };
}

function materializeReportSummary(reports = []) {
  return reports.reduce((summary, row) => {
    summary[row.status] = (summary[row.status] ?? 0) + 1;
    return summary;
  }, {});
}

async function materializeFirstSessionContent(regionName = FIRST_SESSION_TARGET_REGION) {
  const blueprint = FIRST_SESSION_CONTENT_BLUEPRINT;
  const reports = [];

  for (const seed of blueprint.settlements) await upsertFirstSessionSettlement(seed, reports);
  for (const seed of blueprint.pois) await upsertFirstSessionPoi(seed, reports);
  for (const seed of firstSessionBlueprintNpcSeeds()) await upsertFirstSessionNpc(seed, reports);
  for (const seed of blueprint.merchants) await upsertFirstSessionMerchant(seed, reports);
  for (const seed of blueprint.quests) await upsertFirstSessionQuest(seed, reports);
  const links = await linkFirstSessionDocuments(reports);

  const prep = buildSessionPrepData(regionName || blueprint.region);
  const row = getRegionPrepRows().find(r => regionNameForTools(r.region) === regionNameForTools(regionName || blueprint.region));
  const runbook = buildFirstSessionRunbookSnapshot(regionName || blueprint.region);
  return {
    region: regionNameForTools(regionName || blueprint.region),
    reports,
    summary: materializeReportSummary(reports),
    links,
    readiness: row?.readiness ?? 0,
    prep,
    runbook,
  };
}

function buildReleaseQaChatBody(snapshot = null) {
  if (!snapshot) return "";

  const gateBlocks = (snapshot.gates ?? []).map(gate => buildWorldReportBlock(gate.label, [
    ["Статус", gate.statusLabel ?? gate.status],
    ["Итог", gate.summary ?? ""],
  ], {
    bodyHtml: gate.action ? buildWorldReportLines([gate.action]) : "",
  })).join("");

  const packBlocks = (snapshot.packPlanRows ?? []).map(row => buildWorldReportBlock(row.packName, [
    ["Type", row.documentType ?? ""],
    ["Indexed", `${row.existing} / ${row.expected}`],
    ["State", row.note ?? ""],
  ])).join("");

  const sessionProblemRows = [
    ...(snapshot.sessionMapRows ?? []).filter(row => row.status !== "ok").slice(0, 8),
    ...(snapshot.sessionGeneratorRows ?? []).filter(row => row.status !== "ok").slice(0, 8),
    ...(snapshot.sessionGmRows ?? []).filter(row => row.status !== "ok").slice(0, 8),
  ];
  const sessionBlocks = snapshot.hasSessionReadiness
    ? [
      buildWorldReportBlock("Session summary", [
        ["Stage", snapshot.sessionSummary?.stage ?? ""],
        ["Score", `${snapshot.sessionSummary?.scorePct ?? 0}%`],
        ["Blockers", snapshot.sessionSummary?.blockers ?? 0],
        ["Warnings", snapshot.sessionSummary?.warnings ?? 0],
        ["Maps missing", snapshot.sessionSummary?.mapsMissing ?? 0],
      ], {
        bodyHtml: buildWorldReportLines(snapshot.sessionNextActions ?? []),
      }),
      ...sessionProblemRows.map(row => buildWorldReportBlock(row.label, [
        ["Status", row.status],
        ["Note", row.note ?? ""],
      ])),
    ].join("")
    : "";

  const pipelineBlocks = (snapshot.pipelineSteps ?? []).map(step => buildWorldReportBlock(step.label, [
    ["Status", step.status ?? ""],
    ["Mode", step.mode ?? ""],
    ["Mutates", step.mutates ? "yes" : "no"],
  ], {
    bodyHtml: step.reason ? buildWorldReportLines([step.reason]) : "",
  })).join("");

  const manualBlocks = (snapshot.manualSections ?? []).map(section => buildWorldReportBlock(section.title, [
    ["Status", section.statusLabel ?? section.manualStatus ?? "Todo"],
    ["Ответственный", section.owner ?? "GM"],
    ["Время", `${section.minutes ?? 0} мин`],
    ["Проверок", section.stepCount ?? section.steps?.length ?? 0],
  ], {
    bodyHtml: buildWorldReportLines([
      ...(section.steps ?? []).map((step, index) => `${index + 1}. ${step}`),
      `Критерий: ${section.pass}`,
    ]),
  })).join("");

  return `<div class="ih-world-report ih-release-qa-report">
    ${buildWorldReportSection("Session readiness", sessionBlocks, "Session readiness has not been run yet.")}
    ${buildWorldReportSection("Generated pack plan", packBlocks, "Pack plan has not been run yet.")}
    ${buildWorldReportSection("Content pipeline dry-run", pipelineBlocks, "Pipeline dry-run has not been run yet.")}
    ${buildWorldReportSection("Release gates", gateBlocks, "Гейты пока не рассчитаны.")}
    ${buildWorldReportSection("Weekend manual scenarios", manualBlocks, "Чеклист не найден.")}
  </div>`;
}

function indexSize(index) {
  if (!index) return 0;
  if (Number.isFinite(Number(index.size))) return Number(index.size);
  if (Array.isArray(index)) return index.length;
  if (typeof index === "object") return Object.keys(index).length;
  return 0;
}

function documentTypeOfPack(pack) {
  return String(
    pack?.documentName
    ?? pack?.metadata?.type
    ?? pack?.metadata?.documentName
    ?? pack?.metadata?.entity
    ?? ""
  );
}

async function buildFoundryGeneratedPackPlan() {
  if (typeof game.ironHills?.getCompendiumBuildPlan !== "function") {
    return {
      ok: false,
      mode: "foundry-pack-plan",
      summary: {
        packs: 0,
        expected: 0,
        existing: 0,
        missingPacks: 1,
        documentTypeMismatches: 0,
        indexErrors: 0,
        deltaAbs: 0,
      },
      packs: [],
      errors: ["game.ironHills.getCompendiumBuildPlan is unavailable"],
      generatedAt: nowIso(),
    };
  }

  const base = game.ironHills.getCompendiumBuildPlan();
  const rows = [];
  for (const expected of base.packs ?? []) {
    const pack = game.packs?.get(expected.collection);
    let existing = null;
    let indexError = "";
    if (pack) {
      try {
        existing = indexSize(await pack.getIndex());
      } catch (err) {
        indexError = String(err?.message ?? err);
      }
    }

    const documentTypeActual = pack ? documentTypeOfPack(pack) : "";
    const documentTypeMismatch = Boolean(
      pack
      && documentTypeActual
      && expected.documentType
      && documentTypeActual !== expected.documentType
    );
    const delta = pack && existing !== null
      ? numeric(existing) - numeric(expected.expected)
      : 0;
    rows.push({
      packName: expected.packName,
      collection: expected.collection,
      label: expected.label,
      documentType: expected.documentType,
      expected: numeric(expected.expected),
      found: Boolean(pack),
      existing,
      delta,
      documentTypeActual,
      documentTypeMismatch,
      indexError,
    });
  }

  const summary = {
    packs: rows.length,
    expected: rows.reduce((sum, row) => sum + numeric(row.expected), 0),
    existing: rows.reduce((sum, row) => sum + numeric(row.existing), 0),
    missingPacks: rows.filter(row => !row.found).length,
    documentTypeMismatches: rows.filter(row => row.documentTypeMismatch).length,
    indexErrors: rows.filter(row => row.indexError).length,
    deltaAbs: rows.reduce((sum, row) => sum + Math.abs(numeric(row.delta)), 0),
  };

  return {
    ok: summary.missingPacks === 0
      && summary.documentTypeMismatches === 0
      && summary.indexErrors === 0,
    mode: "foundry-pack-plan",
    summary,
    packs: rows,
    generatedAt: nowIso(),
  };
}

function merchantRestockSeed(merchant, tier, economyStatus) {
  const worldTime = Number(globalThis.game?.time?.worldTime ?? Date.now() / 1000);
  const worldDay = Math.floor(worldTime / 86400);
  const salt = `${merchant?.id ?? merchant?.name ?? "merchant"}:${tier}:${economyStatus}:${worldDay}:${merchant?.items?.size ?? 0}`;
  let hash = 2166136261;
  for (let i = 0; i < salt.length; i += 1) {
    hash ^= salt.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function createPoi({
  region,
  poiType,
  tier = 1,
  nearestSettlement = "",
  faction = "",
  theme = "",
  danger = 3,
  status = "",
  discoveryDC = 6,
  distance = "1 день",
  mapCol = null,
  mapRow = null,
  sceneId = "",
  name = "",
  spawnNpc = true,
}) {
  const typeDef = POI_TYPES[poiType] ?? POI_TYPES.camp;
  const finalTheme = theme || choice(typeDef.themes);
  const finalStatus = status || choice(typeDef.status);
  const actorName = String(name ?? "").trim() || buildPoiName(poiType, finalTheme, nearestSettlement);
  const mapChoice = chooseMapTileForPoi({
    regionName: region,
    poiType,
    nearestSettlement,
    mapCol,
    mapRow,
  });

  const actor = await Actor.create({
    name: actorName,
    type: "poi",
    system: {
      info: {
        poiType,
        region: region ?? "",
        nearestSettlement: nearestSettlement ?? "",
        tier,
        danger,
        status: finalStatus,
        faction,
        theme: finalTheme,
        discoveryDC,
        distance,
        mapCol: mapChoice.col,
        mapRow: mapChoice.row,
        mapRegionId: mapChoice.regionId,
        mapTerrain: mapChoice.tile?.terrain ?? "",
        sceneId,
        localScale: "local",
        encounterProfile: mapChoice.tile?.terrain ?? poiType,
      },
      state: {
        lootRating: clamp(tier + randInt(0, 2), 1, 10),
        occupants: clamp(randInt(1, 3) + tier, 1, 12),
        threatLevel: clamp(danger + randInt(0, 2), 1, 10),
        lastGeneratedEvent: `Создано: ${todayStamp()}`,
        notes: "",
        evolutionStage: 1,
        control: clamp(danger, 1, 10),
        garrison: clamp(randInt(1, 3) + tier, 1, 12),
        baseType: "outpost"
      }
    }
  });

  const loot = buildPoiLootItems(finalTheme, tier);
  if (loot.length) {
    await actor.createEmbeddedDocuments("Item", loot);
  }

  const npcDoc = buildPoiNpcActorData(finalTheme, tier, faction);
  if (spawnNpc && npcDoc && randInt(1, 100) <= 70) {
    const npc = await Actor.create(npcDoc.data);
    const npcItems = buildNpcStartingInventoryItems(npcDoc.roleKey, tier);
    if (npcItems.length) await npc.createEmbeddedDocuments("Item", npcItems);
  }

  const settlement = findSettlementByName(nearestSettlement);
  if (settlement) {
    const text = `Появилась новая точка интереса: ${actor.name}.`;
    await appendSettlementHistory(settlement, "regionalEvents", text, 12);
    await settlement.update({
      "system.regionSim.lastRegionEvent": text
    });
  }

  return actor;
}

export async function restockMerchant(merchant, settlement = null) {
  const specialty        = merchant.system.info?.specialty ?? "general";
  const tier             = Number(merchant.system.info?.tier ?? 1);
  const linkedSettlement = settlement ?? findSettlementByName(merchant.system.info?.settlement ?? "");

  // Экономика поселения → priceFactor
  const econData = linkedSettlement ? computeSettlementEconomy(linkedSettlement) : null;
  const econStatus = linkedSettlement?.system?.economy?.economyStatus ?? "normal";
  const econState = ECONOMY_STATES[econStatus] ?? ECONOMY_STATES.normal;

  const SPECIALTY_PRICE = {
    general:     econData?.foodPrice      ?? 1,
    weaponsmith: econData?.armsPrice      ?? 1,
    armorsmith:  econData?.armsPrice      ?? 1,
    alchemist:   econData?.alchemyPrice   ?? 1,
    mage:        econData?.alchemyPrice   ?? 1,
    jeweler:     econData?.materialsPrice ?? 1,
    blackmarket: 0.8,
    // старые названия для совместимости
    blacksmith:  econData?.armsPrice      ?? 1,
    innkeeper:   econData?.foodPrice      ?? 1,
    hunter:      econData?.foodPrice      ?? 1,
  };
  const factor = Number(((SPECIALTY_PRICE[specialty] ?? 1) * econState.priceMult).toFixed(2));

  // Очищаем старый инвентарь только если торговец пуст или принудительное пополнение
  const currentCount = merchant.items.size;
  const targetCount  = Math.max(0, Math.round((5 + tier * 2) * econState.stockMult));
  let added = 0;

  if (currentCount < targetCount) {
    const restock = generateMerchantActorStockItems(
      normalizeMerchantSpecialtyForStock(specialty),
      tier,
      {
        seed: merchantRestockSeed(merchant, tier, econStatus),
        settlementId: linkedSettlement?.id ?? null,
        economyStatus: econStatus,
        limit: targetCount - currentCount,
      }
    );
    const batch = restock.items;
    if (batch.length) {
      const created = await merchant.createEmbeddedDocuments("Item", batch);
      added = Array.isArray(created) ? created.length : batch.length;
    }
  }

  await merchant.update({
    "system.market.lastRestock":        todayStamp(),
    "system.market.currentPriceFactor": factor,
    "system.market.stockRating":        clamp(currentCount + added, 0, 10),
    "system.economy.economyStatus":     econStatus,
  });

  return { added, factor };
}

function getRegionGroups() {
  const map = new Map();

  for (const settlement of getSettlements()) {
    const region = settlement.system.info?.region || "Без региона";
    if (!map.has(region)) map.set(region, []);
    map.get(region).push(settlement);
  }

  return map;
}

async function applyRegionalCrisis(regionName, crisisObj = null) {
  const groups = getRegionGroups();
  const settlements = groups.get(regionName) ?? [];
  if (!settlements.length) return null;

  const crisis = crisisObj ?? choice(REGION_CRISES);

  for (const settlement of settlements) {
    const info = settlement.system.info ?? {};
    const regionSim = settlement.system.regionSim ?? {};

    await settlement.update({
      "system.info.danger": clamp(Number(info.danger ?? 5) + Number(crisis.effects.danger ?? 0), 0, 10),
      "system.info.supply": clamp(Number(info.supply ?? 5) + Number(crisis.effects.supply ?? 0), 0, 10),
      "system.info.prosperity": clamp(Number(info.prosperity ?? 5) + Number(crisis.effects.prosperity ?? 0), 0, 10),
      "system.regionSim.activeCrisis": crisis.label,
      "system.regionSim.caravanTraffic": clamp(Number(regionSim.caravanTraffic ?? 0) + Number(crisis.effects.traffic ?? 0), -5, 10),
      "system.regionSim.tradeBalance": clamp(Number(regionSim.tradeBalance ?? 0) + Number(crisis.effects.trade ?? 0), -5, 10),
      "system.regionSim.lastRegionEvent": `Региональный кризис: ${crisis.label}`
    });

    await appendSettlementHistory(settlement, "regionalEvents", `Региональный кризис: ${crisis.label}`, 12);
  }

  return {
    regionName,
    crisis: crisis.label,
    settlementCount: settlements.length
  };
}

async function clearRegionalCrisisForSettlement(settlement) {
  const current = settlement.system.regionSim?.activeCrisis ?? "";
  if (!current) return null;

  const stability = getSettlementStability(settlement);
  const chance = 20 + stability * 4;

  if (randInt(1, 100) <= chance) {
    await settlement.update({
      "system.regionSim.activeCrisis": "",
      "system.info.danger": clamp(Number(settlement.system.info?.danger ?? 5) - 1, 0, 10),
      "system.info.supply": clamp(Number(settlement.system.info?.supply ?? 5) + 1, 0, 10)
    });

    const text = `Кризис "${current}" был локализован без участия игроков.`;
    await appendSettlementHistory(settlement, "regionalEvents", text, 12);
    return text;
  }

  return null;
}

async function simulateCaravans(regionName = null) {
  const groups = getRegionGroups();
  const reports = [];

  for (const [groupName, settlements] of groups.entries()) {
    if (regionName && groupName !== regionName) continue;
    if (settlements.length < 2) continue;

    const sorted = [...settlements].sort(
      (a, b) => Number(b.system.info?.prosperity ?? 5) - Number(a.system.info?.prosperity ?? 5)
    );

    const from = sorted[0];
    const to = sorted[sorted.length - 1];

    const fromDanger = Number(from.system.info?.danger ?? 5);
    const toDanger = Number(to.system.info?.danger ?? 5);
    const routeRisk = Math.floor((fromDanger + toDanger) / 2);
    const routeSupport = Math.floor((getSettlementStability(from) + getSettlementStability(to)) / 2);

    const successRoll = randInt(1, 10) + Math.floor(routeSupport / 3);
    const success = successRoll > Math.max(2, Math.floor(routeRisk / 2));

    if (success) {
      const trafficGain = randInt(1, 2);
      const tradeGain = randInt(1, 2);

      await from.update({
        "system.regionSim.caravanTraffic": clamp(Number(from.system.regionSim?.caravanTraffic ?? 0) + trafficGain, -5, 10),
        "system.regionSim.tradeBalance": clamp(Number(from.system.regionSim?.tradeBalance ?? 0) + tradeGain, -5, 10),
        "system.regionSim.lastCaravan": `Караван отправился в ${to.name}`
      });

      await to.update({
        "system.regionSim.caravanTraffic": clamp(Number(to.system.regionSim?.caravanTraffic ?? 0) + trafficGain, -5, 10),
        "system.regionSim.tradeBalance": clamp(Number(to.system.regionSim?.tradeBalance ?? 0) + tradeGain + 1, -5, 10),
        "system.info.supply": clamp(Number(to.system.info?.supply ?? 5) + 1, 0, 10),
        "system.regionSim.lastCaravan": `Караван прибыл из ${from.name}`
      });

      const text = `Караван успешно прошёл по маршруту ${from.name} → ${to.name}.`;
      await appendSettlementHistory(from, "regionalEvents", text, 12);
      await appendSettlementHistory(to, "regionalEvents", text, 12);

      reports.push({
        region: groupName,
        from: from.name,
        to: to.name,
        success: true,
        text
      });
    } else {
      await from.update({
        "system.regionSim.lastCaravan": `Караван в сторону ${to.name} сорван`
      });

      await to.update({
        "system.info.danger": clamp(Number(to.system.info?.danger ?? 5) + 1, 0, 10),
        "system.regionSim.lastCaravan": `Неудачная попытка каравана из ${from.name}`
      });

      const text = `Караван на маршруте ${from.name} → ${to.name} сорвался.`;
      await appendSettlementHistory(from, "regionalEvents", text, 12);
      await appendSettlementHistory(to, "regionalEvents", text, 12);

      reports.push({
        region: groupName,
        from: from.name,
        to: to.name,
        success: false,
        text
      });
    }
  }

  return reports;
}

async function maybeSpawnPoiForSettlement(settlement) {
  const region = settlement.system.info?.region ?? "";
  const tier = Number(settlement.system.info?.tier ?? 1);
  const danger = Number(settlement.system.info?.danger ?? 5);
  const prosperity = Number(settlement.system.info?.prosperity ?? 5);

  let chance = 12;
  if (danger >= 7) chance += 15;
  if (prosperity >= 7) chance += 5;

  if (randInt(1, 100) > chance) return null;

  let poiType = "camp";
  if (danger >= 8) poiType = choice(["camp", "lair"]);
  else if (prosperity >= 7) poiType = choice(["ruins", "shrine", "road"]);
  else poiType = choice(["camp", "ruins", "road"]);

  const actor = await createPoi({
    region,
    poiType,
    tier,
    nearestSettlement: settlement.name,
    danger: clamp(Math.floor((danger + tier) / 2), 1, 10),
    distance: choice(["полдня", "1 день", "2 дня", "несколько часов"])
  });

  const text = `В окрестностях ${settlement.name} возник новый POI: ${actor.name}.`;
  await appendSettlementHistory(settlement, "regionalEvents", text, 12);
  await settlement.update({
    "system.regionSim.lastRegionEvent": text
  });

  return actor;
}

async function evolvePoi(poi) {
  const stage = Number(poi.system.state?.evolutionStage ?? 1);
  const threat = Number(poi.system.state?.threatLevel ?? 3);
  const control = Number(poi.system.state?.control ?? 3);
  const garrison = Number(poi.system.state?.garrison ?? 3);

  if (threat >= 7 && control >= 6 && stage < 3) {
    const nextStage = stage + 1;
    const nextBaseType = nextStage === 2 ? "fortified-camp" : "base";
    await poi.update({
      "system.state.evolutionStage": nextStage,
      "system.state.baseType": nextBaseType,
      "system.state.garrison": clamp(garrison + 2, 1, 20),
      "system.state.control": clamp(control + 1, 1, 10),
      "system.state.lastGeneratedEvent": `Точка усилилась до стадии ${nextStage}`
    });
    return `${poi.name}: усиление до стадии ${nextStage} (${nextBaseType}).`;
  }

  if (threat <= 2 && control <= 2 && stage > 1) {
    const nextStage = stage - 1;
    const nextBaseType = nextStage === 1 ? "outpost" : "fortified-camp";
    await poi.update({
      "system.state.evolutionStage": nextStage,
      "system.state.baseType": nextBaseType,
      "system.state.garrison": clamp(garrison - 1, 1, 20),
      "system.state.lastGeneratedEvent": `Точка деградировала до стадии ${nextStage}`
    });
    return `${poi.name}: деградация до стадии ${nextStage}.`;
  }

  return null;
}

async function maybeEscalatePoi(poi) {
  const threat = Number(poi.system.state?.threatLevel ?? 3);
  const danger = Number(poi.system.info?.danger ?? 3);
  const control = Number(poi.system.state?.control ?? 3);
  const region = poi.system.info?.region ?? "";
  const factionName = poi.system.info?.faction ?? "";
  const faction = findFactionByName(factionName);

  let escalateChance = 25;
  let decayChance = 18;

  if (faction) {
    escalateChance += Math.floor(Number(faction.system.power ?? 1) / 2);
  }

  const relatedSettlements = getSettlements().filter(s => (s.system.info?.region || "") === region);
  const avgStability = relatedSettlements.length
    ? Math.floor(relatedSettlements.reduce((sum, s) => sum + getSettlementStability(s), 0) / relatedSettlements.length)
    : 5;

  decayChance += avgStability;
  escalateChance -= Math.floor(avgStability / 2);

  if (randInt(1, 100) <= clamp(escalateChance, 5, 60)) {
    const nextThreat = clamp(threat + 1, 1, 10);
    const nextDanger = clamp(danger + 1, 1, 10);
    const nextControl = clamp(control + 1, 1, 10);

    await poi.update({
      "system.state.threatLevel": nextThreat,
      "system.info.danger": nextDanger,
      "system.state.control": nextControl,
      "system.state.lastGeneratedEvent": `Угроза выросла до ${nextThreat}`
    });

    return `${poi.name}: угроза выросла до ${nextThreat}.`;
  }

  if (randInt(1, 100) <= clamp(decayChance, 10, 70)) {
    const nextThreat = clamp(threat - 1, 0, 10);
    const nextDanger = clamp(danger - 1, 0, 10);
    const nextControl = clamp(control - 1, 0, 10);

    await poi.update({
      "system.state.threatLevel": nextThreat,
      "system.info.danger": nextDanger,
      "system.state.control": nextControl,
      "system.state.lastGeneratedEvent": `Угроза ослабла до ${nextThreat}`
    });

    return `${poi.name}: угроза ослабла до ${nextThreat}.`;
  }

  return null;
}

async function trySettlementSuppressPoi(poi) {
  const nearest = poi.system.info?.nearestSettlement ?? "";
  const settlement = findSettlementByName(nearest);
  if (!settlement) return null;

  const militia = Number(settlement.system.regionSim?.militiaPower ?? 5);
  const stability = Number(settlement.system.regionSim?.stability ?? getSettlementStability(settlement));
  const threat = Number(poi.system.state?.threatLevel ?? 3);
  const control = Number(poi.system.state?.control ?? 3);
  const garrison = Number(poi.system.state?.garrison ?? 3);
  const force = militia + Math.floor(stability / 2);
  const defense = threat + control + Math.floor(garrison / 2);

  if (force < defense) return null;
  if (randInt(1, 100) > 35 + stability * 4) return null;

  if (threat <= 2 && control <= 2) {
    const text = `Поселение ${settlement.name} окончательно ликвидировало ${poi.name}.`;
    await appendSettlementHistory(settlement, "regionalEvents", text, 12);
    await settlement.update({
      "system.regionSim.lastRegionEvent": text,
      "system.info.danger": clamp(Number(settlement.system.info?.danger ?? 5) - 1, 0, 10)
    });
    await poi.delete();
    return text;
  }

  const nextThreat = clamp(threat - 2, 0, 10);
  const nextControl = clamp(control - 2, 0, 10);
  const nextGarrison = clamp(garrison - 2, 0, 20);

  await poi.update({
    "system.state.threatLevel": nextThreat,
    "system.state.control": nextControl,
    "system.state.garrison": nextGarrison,
    "system.state.lastGeneratedEvent": `Поселение ${settlement.name} подавило угрозу`
  });

  const text = `Поселение ${settlement.name} подавило активность POI ${poi.name}.`;
  await appendSettlementHistory(settlement, "regionalEvents", text, 12);
  await settlement.update({
    "system.regionSim.lastRegionEvent": text,
    "system.info.danger": clamp(Number(settlement.system.info?.danger ?? 5) - 1, 0, 10)
  });

  return text;
}

async function tryFactionActOnPoi(poi) {
  const factionName = poi.system.info?.faction ?? "";
  const faction = findFactionByName(factionName);
  if (!faction) return null;

  const power = Number(faction.system.power ?? 1);
  const wealth = Number(faction.system.wealth ?? 1);
  const factionForce = power + Math.floor(wealth / 2);
  const threat = Number(poi.system.state?.threatLevel ?? 3);
  const control = Number(poi.system.state?.control ?? 3);

  if (randInt(1, 100) > 30 + Math.floor(factionForce / 2)) return null;

  if (factionForce >= threat + control + 3) {
    const nextControl = clamp(control + 1, 0, 10);
    const nextGarrison = clamp(Number(poi.system.state?.garrison ?? 3) + 1, 0, 20);

    await poi.update({
      "system.state.control": nextControl,
      "system.state.garrison": nextGarrison,
      "system.state.lastGeneratedEvent": `Фракция ${faction.name} укрепила контроль`
    });

    return `${poi.name}: фракция ${faction.name} укрепила контроль.`;
  }

  if (factionForce < threat && randInt(1, 100) <= 25) {
    const nextThreat = clamp(threat - 1, 0, 10);
    await poi.update({
      "system.state.threatLevel": nextThreat,
      "system.state.lastGeneratedEvent": `Фракция ${faction.name} частично ослабила угрозу`
    });

    return `${poi.name}: фракция ${faction.name} частично ослабила угрозу.`;
  }

  return null;
}

async function cleanupCollapsedPois() {
  const results = [];
  for (const poi of getPois()) {
    const threat = Number(poi.system.state?.threatLevel ?? 3);
    const control = Number(poi.system.state?.control ?? 3);
    const garrison = Number(poi.system.state?.garrison ?? 3);

    if (threat <= 0 && control <= 1 && garrison <= 1) {
      const nearest = poi.system.info?.nearestSettlement ?? "";
      const settlement = findSettlementByName(nearest);
      const text = `${poi.name} окончательно распался и исчез из региона.`;

      if (settlement) {
        await appendSettlementHistory(settlement, "regionalEvents", text, 12);
        await settlement.update({
          "system.regionSim.lastRegionEvent": text
        });
      }

      await poi.delete();
      results.push(text);
    }
  }
  return results;
}

async function stabilizeRegion(regionName) {
  const settlements = getSettlements().filter(s => (s.system.info?.region || "") === regionName);
  if (!settlements.length) return [];

  const reports = [];

  for (const settlement of settlements) {
    const stability = clamp(getSettlementStability(settlement) + 1, 0, 10);
    const militia = clamp(getSettlementMilitia(settlement), 0, 10);

    await settlement.update({
      "system.regionSim.stability": stability,
      "system.regionSim.militiaPower": militia,
      "system.info.danger": clamp(Number(settlement.system.info?.danger ?? 5) - (stability >= 7 ? 1 : 0), 0, 10),
      "system.info.supply": clamp(Number(settlement.system.info?.supply ?? 5) + (stability >= 7 ? 1 : 0), 0, 10)
    });

    reports.push(`${settlement.name}: стабильность ${stability}, милиция ${militia}.`);
  }

  return reports;
}

async function tickSettlement(settlement) {
  const info = settlement.system.info ?? {};
  const regionSim = settlement.system.regionSim ?? {};

  const oldPopulation = Number(info.population ?? 100);
  const oldProsperity = Number(info.prosperity ?? 5);
  const oldDanger = Number(info.danger ?? 5);
  const oldSupply = Number(info.supply ?? 5);

  const merchantCount = getMerchantCountForSettlement(settlement.name);
  const routeValue = getRouteValueForSettlement(settlement);
  const factionPressure = getFactionPressureForSettlement(settlement);
  const tradeBalance = Number(regionSim.tradeBalance ?? 0);
  const caravanTraffic = Number(regionSim.caravanTraffic ?? 0);
  const activeCrisis = regionSim.activeCrisis ?? "";

  const stability = getSettlementStability(settlement);
  const militiaPower = getSettlementMilitia(settlement);

  await settlement.update({
    "system.regionSim.stability": stability,
    "system.regionSim.militiaPower": militiaPower
  });

  const dangerShift =
    randInt(-1, 2) -
    (factionPressure > 0 ? 1 : 0) -
    (merchantCount >= 2 ? 1 : 0) +
    (oldSupply <= 3 ? 1 : 0) -
    (caravanTraffic >= 2 ? 1 : 0) +
    (activeCrisis ? 1 : 0) -
    (stability >= 7 ? 1 : 0);

  const prosperityShift =
    randInt(-1, 1) +
    (merchantCount >= 1 ? 1 : 0) +
    (routeValue >= 3 ? 1 : 0) +
    (factionPressure > 1 ? 1 : 0) +
    (tradeBalance > 0 ? 1 : 0) -
    (oldDanger >= 8 ? 1 : 0) -
    (activeCrisis ? 1 : 0) +
    (stability >= 7 ? 1 : 0);

  const supplyShift =
    randInt(-1, 1) +
    (routeValue >= 2 ? 1 : 0) +
    (merchantCount >= 1 ? 1 : 0) +
    (tradeBalance > 0 ? 1 : 0) -
    (oldDanger >= 8 ? 1 : 0) -
    (activeCrisis ? 1 : 0) +
    (stability >= 7 ? 1 : 0);

  const nextDanger = clamp(oldDanger + dangerShift, 0, 10);
  const nextProsperity = clamp(oldProsperity + prosperityShift, 0, 10);
  const nextSupply = clamp(oldSupply + supplyShift, 0, 10);

  const populationShift =
    randInt(-6, 8) +
    (nextProsperity >= 7 ? 4 : 0) -
    (nextDanger >= 8 ? 5 : 0) +
    (nextSupply <= 2 ? -4 : 0) +
    (stability >= 7 ? 2 : 0);

  const nextPopulation = Math.max(0, oldPopulation + populationShift);

  // Вычисляем состояние экономики и обновляем его
  const economyStatus = computeEconomyStatus(
    nextProsperity, nextDanger, nextSupply, activeCrisis
  );

  await settlement.update({
    "system.info.population":        nextPopulation,
    "system.info.prosperity":        nextProsperity,
    "system.info.danger":            nextDanger,
    "system.info.supply":            nextSupply,
    "system.economy.factionPressure": factionPressure,
    "system.economy.merchantCount":  merchantCount,
    "system.economy.routeValue":     routeValue,
    "system.economy.economyStatus":  economyStatus, // → читается ShopApp
  });

  // Обновляем экономику в merchant-service (для ShopApp всех торговцев поселения)
  const { setSettlementEconomy } = await import("./services/merchant-service.mjs");
  await setSettlementEconomy(settlement.id, economyStatus).catch(() => {});

  const prices = computeSettlementEconomy(settlement);

  const ECON_LABELS = {
    boom:"📈 Расцвет", normal:"⚖ Норма", shortage:"📉 Дефицит",
    crisis:"🔥 Кризис", war:"⚔ Война", festival:"🎉 Праздник", plague:"☠ Чума"
  };
  const summary =
    `Нас. ${oldPopulation}→${nextPopulation} | ` +
    `Благ. ${oldProsperity}→${nextProsperity} | ` +
    `Опасн. ${oldDanger}→${nextDanger} | ` +
    `Снаб. ${oldSupply}→${nextSupply} | ` +
    `Эконом.: ${ECON_LABELS[economyStatus] ?? economyStatus}`;

  await settlement.update({
    "system.economy.foodPrice": prices.foodPrice,
    "system.economy.materialsPrice": prices.materialsPrice,
    "system.economy.alchemyPrice": prices.alchemyPrice,
    "system.economy.armsPrice": prices.armsPrice,
    "system.economy.lodgingPrice": prices.lodgingPrice,
    "system.economy.weeklySummary": summary
  });

  const eventText = makeSettlementEvent(settlement);
  const rumorText = makeSettlementRumor(settlement);

  await appendSettlementHistory(settlement, "events", eventText, 12);
  await appendSettlementHistory(settlement, "rumors", rumorText, 12);

  const crisisResolved = await clearRegionalCrisisForSettlement(settlement);

  return {
    name: settlement.name,
    nextPopulation,
    nextProsperity,
    nextDanger,
    nextSupply,
    factionPressure,
    merchantCount,
    routeValue,
    tradeBalance,
    caravanTraffic,
    stability,
    militiaPower,
    prices,
    eventText,
    rumorText,
    summary,
    economyStatus,
    activeCrisis: settlement.system.regionSim?.activeCrisis ?? activeCrisis,
    crisisResolved
  };
}

async function runWorldWeek() {
  const regionGroups = getRegionGroups();
  const crisisReports = [];
  const stabilizationReports = [];

  for (const [regionName, settlements] of regionGroups.entries()) {
    if (!settlements.length) continue;

    const stab = await stabilizeRegion(regionName);
    stabilizationReports.push(...stab);

    if (randInt(1, 100) <= 30) {
      const report = await applyRegionalCrisis(regionName);
      if (report) crisisReports.push(report);
    }
  }

  const caravanReports = await simulateCaravans();
  const poiSpawnReports = [];
  const settlementReports = [];

  const settlements = getSettlements();
  for (const settlement of settlements) {
    const poi = await maybeSpawnPoiForSettlement(settlement);
    if (poi) poiSpawnReports.push(`Новый POI: ${poi.name}`);

    const res = await tickSettlement(settlement);
    settlementReports.push(res);
  }

  const poiEvolutionReports = [];
  const poiSuppressionReports = [];
  const poiFactionReports = [];
  const poiDecayReports = [];

  for (const poi of getPois()) {
    const escalationText = await maybeEscalatePoi(poi);
    if (escalationText) poiDecayReports.push(escalationText);

    const evoText = await evolvePoi(poi);
    if (evoText) poiEvolutionReports.push(evoText);

    const suppressionText = await trySettlementSuppressPoi(poi);
    if (suppressionText) poiSuppressionReports.push(suppressionText);

    const factionText = await tryFactionActOnPoi(poi);
    if (factionText) poiFactionReports.push(factionText);
  }

  const removedPois = await cleanupCollapsedPois();

  const merchants = getMerchants();
  const merchantReports = [];

  for (const merchant of merchants) {
    const settlement = findSettlementByName(merchant.system.info?.settlement ?? "");
    const report = await restockMerchant(merchant, settlement);
    merchantReports.push({
      name: merchant.name,
      added: report.added,
      factor: report.factor
    });
  }

  const settlementBody = settlementReports.map(r => buildWorldReportBlock(r.name, [
    ["Население", r.nextPopulation],
    ["Благополучие", r.nextProsperity],
    ["Опасность", r.nextDanger],
    ["Снабжение", r.nextSupply],
    ["Давление фракции", r.factionPressure],
    ["Торговцев", r.merchantCount],
    ["Пути", r.routeValue],
    ["Торговый баланс", r.tradeBalance],
    ["Караваны", r.caravanTraffic],
    ["Стабильность", r.stability],
    ["Милиция", r.militiaPower],
    ["Кризис", r.activeCrisis || "нет"],
    ["Цены", `еда ${r.prices.foodPrice}, материалы ${r.prices.materialsPrice}, алхимия ${r.prices.alchemyPrice}, оружие ${r.prices.armsPrice}, ночлег ${r.prices.lodgingPrice}`],
    ["Событие", r.eventText],
    ["Слух", r.rumorText],
  ])).join("");

  const crisisBody = crisisReports.map(c => buildWorldReportBlock(c.regionName, [
    ["Кризис", c.crisis],
    ["Затронуто поселений", c.settlementCount],
  ])).join("");

  const caravanBody = caravanReports.map(c => buildWorldReportBlock(c.region, [
    ["Событие", c.text],
  ])).join("");

  const poiBody = buildWorldReportLines([
    ...poiSpawnReports,
    ...poiDecayReports,
    ...poiEvolutionReports,
    ...poiSuppressionReports,
    ...poiFactionReports,
    ...removedPois,
  ], "Новых изменений по POI нет.");

  const merchantBody = merchantReports.map(m => buildWorldReportBlock(m.name, [
    ["Добавлено товаров", m.added],
    ["Коэффициент цен", m.factor],
  ])).join("");

  const stabilizationBody = buildWorldReportLines(
    stabilizationReports,
    "Стабилизационных событий не было."
  );

  await ChatMessage.create({
    content: buildCombatChatCard({
      title: "Сводка недели мира",
      icon: "🌍",
      rows: [
        ["Поселения", settlementReports.length],
        ["Кризисы", crisisReports.length],
        ["Караваны", caravanReports.length],
        ["POI события", poiSpawnReports.length + poiDecayReports.length + poiEvolutionReports.length + poiSuppressionReports.length + poiFactionReports.length + removedPois.length],
        ["Торговцы", merchantReports.length],
      ],
      bodyHtml: `
        <div class="ih-world-report">
          ${buildWorldReportSection("Поселения", settlementBody, "Нет поселений для тика.")}
          ${buildWorldReportSection("Стабилизация мира", stabilizationBody)}
          ${buildWorldReportSection("Кризисы региона", crisisBody, "На этой неделе новых кризисов нет.")}
          ${buildWorldReportSection("Караваны", caravanBody, "Караванов не было.")}
          ${buildWorldReportSection("POI и конфликты", poiBody)}
          ${buildWorldReportSection("Ресток торговцев", merchantBody, "Нет торговцев.")}
        </div>
      `,
    })
  });

  return {
    settlementReports,
    crisisReports,
    caravanReports,
    poiSpawnReports,
    poiDecayReports,
    poiEvolutionReports,
    poiSuppressionReports,
    poiFactionReports,
    removedPois,
    stabilizationReports,
    merchantReports
  };
}

function buildFactionReport() {
  const settlements = getSettlements();

  return settlements.map(settlement => {
    const factionName = settlement.system.info?.controllingFaction ?? "—";
    const faction = findFactionByName(factionName);
    return {
      settlement: settlement.name,
      faction: factionName,
      power: faction ? Number(faction.system.power ?? 1) : 0,
      wealth: faction ? Number(faction.system.wealth ?? 1) : 0,
      pressure: clamp(
        Number(settlement.system.economy?.factionPressure ?? 0) || (
          faction
            ? Math.floor((Number(faction.system.power ?? 1) + Number(faction.system.wealth ?? 1)) / 2) - 5
            : 0
        ),
        -4,
        5
      )
    };
  });
}

class IronHillsWorldToolsV5 extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills", "world-tools"],
      width: 1100,
      height: 980,
      resizable: true,
      title: "Iron Hills Tools"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/world-tools.hbs";
  }

  async getData() {
    const settlements = getSettlements().map(a => ({ id: a.id, name: a.name }));
    const factions    = getFactions().map(a => ({ id: a.id, name: a.name }));
    const regions     = [...new Set([
      FIRST_SESSION_TARGET_REGION,
      ...getSettlements().map(s => s.system.info?.region || FIRST_SESSION_TARGET_REGION),
      ...getPois().map(p => p.system.info?.region || FIRST_SESSION_TARGET_REGION),
    ])].sort((a, b) => a.localeCompare(b, "ru"));
    const worldOptions = getWorldContentOptionData();

    // Статус мира для вкладки Симуляция
    const worldStatus = getSettlements().map(s => ({
      settlement:  s.name,
      prosperity:  Number(s.system.info?.prosperity ?? 5),
      danger:      Number(s.system.info?.danger     ?? 5),
      supply:      Number(s.system.info?.supply      ?? 5),
      economy:     s.system.economy?.economyStatus ?? "normal",
    }));

    // POI для выбора в квестах
    const pois = getPois().map(a => ({
      id:   a.id,
      name: a.name,
      type: a.system.info?.poiType ?? "camp",
      tier: a.system.info?.tier ?? 1,
      region: a.system.info?.region ?? "",
      mapCol: a.system.info?.mapCol ?? "",
      mapRow: a.system.info?.mapRow ?? "",
      threat: a.system.state?.threatLevel ?? a.system.info?.danger ?? 0,
      hasMap: isValidMapCoord(a.system.info?.mapCol, a.system.info?.mapRow),
    }));
    const regionPrepRows = getRegionPrepRows();
    const firstSessionSummary = buildFirstSessionPrepSummary(regionPrepRows);
    const firstSessionRunbook = buildFirstSessionRunbookSnapshot(FIRST_SESSION_TARGET_REGION);
    const firstSessionQa = buildFirstSessionQaSnapshot(FIRST_SESSION_TARGET_REGION);
    const combatQa = buildCombatQaSnapshot();
    const releaseQaState = getReleaseQaState();
    const combatDryRunReport = this._lastCombatDryRun ?? releaseQaState.combatDryRunReport ?? null;
    const combatDryRun = buildCombatDryRunSnapshot({ combatQa, report: combatDryRunReport });
    const combatTestBench = buildCombatTestBenchSnapshot();
    const gmControl = buildGmControlSnapshot();
    const contentReport = this._lastContentReadiness ?? releaseQaState.contentReport ?? null;
    const runtimeReport = this._lastRuntimeSmoke ?? releaseQaState.runtimeReport ?? null;
    const artCockpitReport = this._lastArtCockpit ?? releaseQaState.artCockpitReport ?? null;
    const sessionReadinessReport = this._lastSessionReadiness ?? releaseQaState.sessionReadinessReport ?? null;
    const packPlanReport = this._lastPackPlan ?? releaseQaState.packPlanReport ?? null;
    const pipelineReport = this._lastPatchPipeline ?? releaseQaState.pipelineReport ?? null;
    this._hydrateSituationCockpitFromState();
    const situationState = getGmSituationState();
    const situationCockpit = buildSituationCockpitView({
      situation: this._situationCockpit ?? null,
      options: this._situationCockpitOptions ?? null,
      materializeResult: this._lastSituationMaterialize ?? null,
      situationState,
    });
    const releaseQa = buildReleaseQaSnapshot({
      contentReport,
      runtimeReport,
      artCockpitReport,
      sessionReadinessReport,
      packPlanReport,
      pipelineReport,
      regionRows: regionPrepRows,
      manualDone: releaseQaState.manualDone,
      manualStatuses: releaseQaState.manualStatuses,
    });
    const releaseQaHistoryRows = historyRows(releaseQaState);

    return {
      settlements,
      factions,
      regions,
      pois,
      regionPrepRows,
      hasRegionPrepRows: regionPrepRows.length > 0,
      firstSessionSummary,
      firstSessionRunbook,
      hasFirstSessionRunbook: Boolean(firstSessionRunbook),
      firstSessionQa,
      hasFirstSessionQa: Boolean(firstSessionQa),
      combatQa,
      hasCombatQa: Boolean(combatQa),
      combatDryRun,
      hasCombatDryRun: Boolean(combatDryRun),
      combatTestBench,
      hasCombatTestBench: Boolean(combatTestBench),
      gmControl,
      hasGmControl: Boolean(gmControl),
      releaseQa,
      hasReleaseQa: Boolean(releaseQa),
      releaseQaHistoryRows,
      hasReleaseQaHistoryRows: releaseQaHistoryRows.length > 0,
      situationCockpit,
      merchantTypes: recordOptions(MERCHANT_TYPES),
      economyStates: recordOptions(ECONOMY_STATES),
      containerThemes: worldOptions.containerThemes,
      poiTypes: worldOptions.poiTypes,
      npcRoles: worldOptions.npcRoles,
      worldStatus:   this._showWorldStatus ? worldStatus : null,
      factionReport: this._showFactionReport ? buildFactionReport() : null,
    };
  }

  async _createSettlement(html) {
    const tier   = Number(html.find("[name='settlement-tier']").val() || 1);
    let region = html.find("[name='settlement-region']").val() || "Iron Hills";
    if (region === "__new") {
      region = html.find("[name='settlement-region-new']").val().trim() || "Новый регион";
    }
    const name   = html.find("[name='settlement-name']").val() || `Поселение ${randInt(100, 999)}`;

    // Выбор тайла на карте
    let mapCol = null, mapRow = null;
    const mapChoice = await Dialog.confirm({
      title:   "Разместить на карте?",
      content: buildSystemDialogContent({
        headline: name,
        status: "Привязать поселение к тайлу на глобальной карте?",
      })
    });

    if (mapChoice) {
      // Открываем пикер тайла
      const colStr = await Dialog.wait({
        title: "Координаты тайла",
        content: buildSystemDialogContent({
          status: "Укажите координаты тайла на глобальной карте.",
          formHtml: buildSystemDialogForm([
            buildSystemDialogInput({ id: "tile-col", type: "number", label: "Колонка (0-9)", value: 5, min: 0, max: 9 }),
            buildSystemDialogInput({ id: "tile-row", type: "number", label: "Ряд (0-9)", value: 5, min: 0, max: 9 }),
          ], { className: "ih-system-dialog-form-2col" }),
        }),
        buttons: {
          ok: {
            label: "Разместить",
            callback: () => ({
              col: parseInt(document.getElementById("tile-col")?.value ?? "5"),
              row: parseInt(document.getElementById("tile-row")?.value ?? "5")
            })
          },
          cancel: { label: "Пропустить", callback: () => null }
        },
        default: "ok"
      }).catch(() => null);

      if (colStr) { mapCol = colStr.col; mapRow = colStr.row; }
    }

    const actor = await Actor.create({
      name,
      type: "settlement",
      system: {
        info: {
          region,
          tier,
          population: 80 + tier * 30,
          prosperity: randInt(3, 7),
          danger: randInt(2, 6),
          supply: randInt(3, 7),
          controllingFaction: "",
          tags: "",
          mapCol,
          mapRow,
          sceneId: "",
        },
        economy: {
          foodPrice: 1,
          materialsPrice: 1,
          alchemyPrice: 1,
          armsPrice: 1,
          lodgingPrice: 1,
          factionPressure: 0,
          merchantCount: 0,
          routeValue: 1,
          weeklySummary: ""
        },
        regionSim: {
          activeCrisis: "",
          tradeBalance: 0,
          caravanTraffic: 0,
          lastCaravan: "",
          lastRegionEvent: "",
          stability: 5,
          militiaPower: 5
        },
        history: {
          rumors: [],
          events: [],
          regionalEvents: []
        }
      }
    });

    // Обновляем тайл на карте если задан
    if (mapCol !== null && mapRow !== null) {
      try {
        const regions = game.settings.get("iron-hills-system", "worldRegions") ?? {};
        const regionId = Object.keys(regions).find(k => regions[k].label === region)
          ?? "iron_hills";
        const { DEFAULT_REGIONS } = await import("./constants/world-map.mjs");
        const baseRegion = foundry.utils.deepClone(regions[regionId] ?? DEFAULT_REGIONS[regionId] ?? {});
        if (baseRegion.tiles) {
          const tile = baseRegion.tiles.find(t => t.col === mapCol && t.row === mapRow);
          if (tile) {
            tile.label  = name;
            tile.poi    = true;
            tile.terrain = tile.terrain === "plains" ? "town" : tile.terrain;
            regions[regionId] = baseRegion;
            await game.settings.set("iron-hills-system", "worldRegions", regions);
            ui.notifications.info(`${name} размещено на карте [${mapCol}, ${mapRow}]`);
          }
        }
      } catch(e) { console.warn("Map update failed:", e); }
    }

    ui.notifications.info(`Создано поселение: ${actor.name}`);
  }

  async _generateNpc(html) {
    const role = html.find("[name='npc-role']").val();
    const tier = Number(html.find("[name='npc-tier']").val() || 1);
    // Faction через пикер
    const factionActor = this._pickedFaction ?? null;
    const faction = factionActor?.name ?? html.find("[name='npc-faction']").val() ?? "";

    const npcDoc = buildNpcActorData(role, tier, faction);
    const actor = await Actor.create(npcDoc.data);

    const startingItems = buildNpcStartingInventoryItems(npcDoc.roleKey, tier);
    if (startingItems.length) await actor.createEmbeddedDocuments("Item", startingItems);

    ui.notifications.info(`Создан NPC: ${actor.name}`);
  }

  async _generateMerchant(html) {
    const nameInput   = html.find("[name='merchant-name']").val().trim();
    const specialty   = html.find("[name='merchant-specialty']").val() || "general";
    const tier        = Number(html.find("[name='merchant-tier']").val() || 1);
    const economy     = html.find("[name='merchant-economy']").val() || "normal";
    const faction     = html.find("[name='merchant-faction']").val() || "";

    const settlementActor = this._pickedMerchantSettlement ?? null;
    const settlement      = settlementActor?.name ?? html.find("[name='merchant-settlement']").val() ?? "";
    const settlementId    = settlementActor?.id ?? "";

    // Имя: явное или случайное с типом
    const typeName  = MERCHANT_TYPES[specialty]?.label ?? "Торговец";
    const actorName = nameInput || `${typeName} ${makeName()}`;

    // Монеты пропорционально тиру - 10-ступенчатая система
    const TIER_COPPER = [0, 200, 500, 1500, 5000, 15000, 40000, 100000, 250000, 500000, 1000000];
    const baseCopper  = TIER_COPPER[Math.min(tier, 10)];
    const goldCoins   = Math.floor(baseCopper / 10000);
    const silverCoins = Math.floor((baseCopper % 10000) / 100);
    const copperCoins = baseCopper % 100;

    const actor = await Actor.create({
      name: actorName,
      type: "merchant",
      system: {
        info: {
          specialty, settlement, settlementId, tier, faction,
        },
        economy: {
          wealth:          40 + tier * 20,
          markup:          1 + tier * 0.05,
          economyStatus:   economy,
        },
        market: {
          lastRestock:        "",
          currentPriceFactor: parseFloat((1 + (tier - 1) * 0.05).toFixed(2)),
          stockRating:        5,
        },
        currency: { gold: goldCoins, silver: silverCoins, copper: copperCoins }
      }
    });

    // Сохраняем экономику поселения
    if (settlementId && economy !== "normal") {
      await setSettlementEconomy(settlementId, economy);
    }

    // Наполняем инвентарь
    await restockMerchant(actor, settlementActor ?? findSettlementByName(settlement));
    this._pickedMerchantSettlement = null;

    const econLabel = ECONOMY_STATES[economy]?.label ?? economy;
    ui.notifications.info(
      `✅ Создан "${actorName}" | ${typeName} | Тир ${tier} | ${econLabel}`
    );
  }

  async _restockSelectedMerchant() {
    // Пополняем выбранного торговца (первый выделенный токен типа merchant)
    const token = canvas?.tokens?.controlled?.find(t => t.actor?.type === "merchant");
    const actor = token?.actor ?? game.actors?.find(a => a.type === "merchant" && a.sheet?.rendered);
    if (!actor) {
      ui.notifications.warn("Выдели токен торговца или открой его лист");
      return;
    }
    await restockMerchant(actor);
    ui.notifications.info(`🔄 ${actor.name}: ассортимент обновлён`);
  }

  async _generateContainer(html) {
    const theme = html.find("[name='container-theme']").val();
    const tier = Number(html.find("[name='container-tier']").val() || 1);

    const actor = await Actor.create({
      name: `Контейнер: ${theme} ${randInt(100, 999)}`,
      type: "container",
      system: {
        info: {
          theme,
          tier,
          lockDifficulty: Math.max(0, tier - 1),
          danger: randInt(0, tier + 1)
        }
      }
    });

    const loot = randomContainerLoot(theme, tier);
    await actor.createEmbeddedDocuments("Item", loot);

    ui.notifications.info(`Создан контейнер: ${actor.name}`);
  }

  async _generateRumor(html) {
    const settlementId = html.find("[name='rumor-settlement']").val();
    const settlement = game.actors.get(settlementId);

    if (!settlement || settlement.type !== "settlement") {
      ui.notifications.warn("Выберите поселение");
      return;
    }

    const rumor = makeSettlementRumor(settlement);
    await appendSettlementHistory(settlement, "rumors", rumor, 12);

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `Слух: ${settlement.name}`,
        icon: "💬",
        bodyHtml: buildCombatParagraphs([rumor]),
      })
    });

    ui.notifications.info(`Слух для ${settlement.name} добавлен`);
  }

  async _advanceSettlementTick(html) {
    const settlementId = html.find("[name='tick-settlement']").val();
    const settlement = game.actors.get(settlementId);

    if (!settlement || settlement.type !== "settlement") {
      ui.notifications.warn("Выберите поселение");
      return;
    }

    const result = await tickSettlement(settlement);

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `Недельный тик: ${result.name}`,
        icon: "🏘",
        rows: [
          ["Население", result.nextPopulation],
          ["Благополучие", result.nextProsperity],
          ["Опасность", result.nextDanger],
          ["Снабжение", result.nextSupply],
          ["Давление фракции", result.factionPressure],
          ["Торговцев", result.merchantCount],
          ["Пути", result.routeValue],
          ["Торговый баланс", result.tradeBalance],
          ["Караваны", result.caravanTraffic],
          ["Стабильность", result.stability],
          ["Милиция", result.militiaPower],
          ["Кризис", result.activeCrisis || "нет"],
        ],
        notices: [
          ["Событие", result.eventText],
          ["Слух", result.rumorText],
        ],
      })
    });

    ui.notifications.info(`Тик для ${settlement.name} завершён`);
  }

  async _advanceWorldTick() {
    const data = await runWorldWeek();
    ui.notifications.info(
      `Глобальный тик завершён: поселений ${data.settlementReports.length}, кризисов ${data.crisisReports.length}, караванов ${data.caravanReports.length}, подавлений ${data.poiSuppressionReports.length}`
    );
  }

  async _restockAllMerchants() {
    const merchants = getMerchants();
    let totalAdded = 0;

    for (const merchant of merchants) {
      const settlement = findSettlementByName(merchant.system.info?.settlement ?? "");
      const report = await restockMerchant(merchant, settlement);
      totalAdded += report.added;
    }

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Ресток торговцев",
        icon: "🪙",
        rows: [
          ["Торговцев обновлено", merchants.length],
          ["Добавлено позиций", totalAdded],
        ],
      })
    });

    ui.notifications.info(`Ресток завершён. Добавлено позиций: ${totalAdded}`);
  }

  async _showFactionReport() {
    const report = buildFactionReport();

    const body = report.map(r => buildWorldReportBlock(r.settlement, [
      ["Фракция", r.faction],
      ["Power", r.power],
      ["Wealth", r.wealth],
      ["Pressure", r.pressure],
    ])).join("");

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Отчёт по влиянию фракций",
        icon: "⚖",
        bodyHtml: `<div class="ih-world-report">${buildWorldReportSection("Поселения", body, "Нет поселений.")}</div>`,
      })
    });

    ui.notifications.info("Отчёт по фракциям отправлен в чат");
  }

  async _generateRegionCrisis(html) {
    const regionName = html.find("[name='region-select']").val();
    if (!regionName) {
      ui.notifications.warn("Выберите регион");
      return;
    }

    const report = await applyRegionalCrisis(regionName);
    if (!report) {
      ui.notifications.warn("Для этого региона нет поселений");
      return;
    }

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Кризис региона",
        icon: "🔥",
        rows: [
          ["Регион", report.regionName],
          ["Кризис", report.crisis],
          ["Затронуто поселений", report.settlementCount],
        ],
      })
    });

    ui.notifications.info(`Кризис "${report.crisis}" применён к региону ${report.regionName}`);
  }

  async _runCaravans(html) {
    const regionName = html.find("[name='region-select']").val() || null;
    const reports = await simulateCaravans(regionName);

    const body = reports.map(r => buildWorldReportBlock(r.region, [
      ["Событие", r.text],
    ])).join("");

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Караваны",
        icon: "🧭",
        bodyHtml: `<div class="ih-world-report">${buildWorldReportSection("Маршруты", body, "Маршрутов для караванов не найдено.")}</div>`,
      })
    });

    ui.notifications.info(`Караваны прогнаны: ${reports.length}`);
  }

  async _generatePoi(html) {
    const region = html.find("[name='poi-region']").val() || html.find("[name='region-select']").val() || "";
    const poiType = html.find("[name='poi-type']").val() || "camp";
    const tier = Number(html.find("[name='poi-tier']").val() || 1);
    const nearestSettlement = html.find("[name='poi-settlement']").val() || "";
    const faction = html.find("[name='poi-faction']").val() || "";
    const mapCol = numericOrNull(html.find("[name='poi-map-col']").val());
    const mapRow = numericOrNull(html.find("[name='poi-map-row']").val());

    const settlement = nearestSettlement ? findSettlementByName(nearestSettlement) : null;
    const danger = settlement ? Number(settlement.system.info?.danger ?? 5) : 3;

    const actor = await createPoi({
      region,
      poiType,
      tier,
      nearestSettlement,
      faction,
      danger: clamp(danger, 1, 10),
      distance: choice(["несколько часов", "полдня", "1 день", "2 дня"]),
      mapCol,
      mapRow,
    });

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Новый POI",
        icon: "📍",
        rows: [
          ["Название", actor.name],
          ["Тип", actor.system.info.poiType],
          ["Регион", actor.system.info.region],
          ["Карта", isValidMapCoord(actor.system.info.mapCol, actor.system.info.mapRow)
            ? `[${actor.system.info.mapCol}, ${actor.system.info.mapRow}]`
            : "не привязан"],
        ],
      })
    });

    ui.notifications.info(`Создан POI: ${actor.name}`);
  }

  async _generatePoiPack(html) {
    const region = html.find("[name='poi-region']").val() || html.find("[name='region-select']").val() || "";
    const tier = Number(html.find("[name='poi-tier']").val() || 1);
    const settlements = getSettlements().filter(s => (s.system.info?.region || "") === region);
    if (!settlements.length) {
      ui.notifications.warn("В регионе нет поселений");
      return;
    }

    const created = [];
    const count = 5;

    for (let i = 0; i < count; i++) {
      const settlement = choice(settlements);
      const poiType = choice(Object.keys(POI_TYPES));
      const actor = await createPoi({
        region,
        poiType,
        tier: clamp(tier + randInt(0, 1), 1, 10),
        nearestSettlement: settlement.name,
        danger: clamp(Number(settlement.system.info?.danger ?? 5) + randInt(0, 2), 1, 10),
        distance: choice(["несколько часов", "полдня", "1 день", "2 дня"])
      });
      const coord = isValidMapCoord(actor.system.info?.mapCol, actor.system.info?.mapRow)
        ? ` [${actor.system.info.mapCol},${actor.system.info.mapRow}]`
        : "";
      created.push(`${actor.name}${coord}`);
    }

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Пакет POI региона",
        icon: "📍",
        rows: [["Создано", created.length]],
        bodyHtml: buildWorldReportLines(created),
      })
    });

    ui.notifications.info(`Создано POI: ${created.length}`);
  }

  async _generateRegionalThreat(html) {
    const region = html.find("[name='poi-region']").val() || html.find("[name='region-select']").val() || "";
    const settlements = getSettlements().filter(s => (s.system.info?.region || "") === region);
    if (!settlements.length) {
      ui.notifications.warn("В регионе нет поселений");
      return;
    }

    const settlement = choice(settlements);
    const poiType = choice(["camp", "lair"]);
    const actor = await createPoi({
      region,
      poiType,
      tier: clamp(Number(settlement.system.info?.tier ?? 1) + randInt(0, 1), 1, 10),
      nearestSettlement: settlement.name,
      theme: choice(["bandit", "beast", "undead"]),
      danger: clamp(Number(settlement.system.info?.danger ?? 5) + 2, 1, 10),
      status: "active",
      distance: choice(["1 день", "2 дня"])
    });

    const text = `В регионе ${region} появилась новая угроза: ${actor.name}.`;
    await appendSettlementHistory(settlement, "regionalEvents", text, 12);
    await settlement.update({
      "system.regionSim.lastRegionEvent": text
    });

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Региональная угроза",
        icon: "⚠",
        bodyHtml: buildCombatParagraphs([text]),
      })
    });

    ui.notifications.info(`Создана региональная угроза: ${actor.name}`);
  }

  async _stabilizeRegion(html) {
    const region = html.find("[name='region-select']").val() || "";
    const reports = await stabilizeRegion(region);

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Стабилизация региона",
        icon: "🛠",
        bodyHtml: buildWorldReportLines(reports, "Регион не найден."),
      })
    });

    ui.notifications.info(`Стабилизация региона завершена: ${reports.length}`);
  }

  async _evolvePois(html) {
    const region = html.find("[name='poi-region']").val() || html.find("[name='region-select']").val() || "";
    const pois = getPois().filter(p => !region || (p.system.info?.region || "") === region);
    const reports = [];

    for (const poi of pois) {
      const a = await maybeEscalatePoi(poi);
      if (a) reports.push(a);
      const b = await evolvePoi(poi);
      if (b) reports.push(b);
      const c = await trySettlementSuppressPoi(poi);
      if (c) reports.push(c);
      const d = await tryFactionActOnPoi(poi);
      if (d) reports.push(d);
    }

    const removed = await cleanupCollapsedPois();
    reports.push(...removed);

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Эволюция POI",
        icon: "📍",
        bodyHtml: buildWorldReportLines(reports, "Изменений не произошло."),
      })
    });

    ui.notifications.info(`Эволюция POI завершена: ${reports.length}`);
  }

  async _assignRegionPoiCoordinates(html) {
    const region = html.find("[name='poi-region']").val() || html.find("[name='region-select']").val() || "";
    const pois = getPois().filter(p => !region || regionNameForTools(p.system.info?.region) === regionNameForTools(region));
    const reports = [];

    for (const poi of pois) {
      const result = await ensurePoiMapCoordinates(poi);
      if (!result) continue;
      if (result.changed) reports.push(`${poi.name}: [${result.col}, ${result.row}]`);
    }

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Привязка POI к карте",
        icon: "🗺",
        rows: [
          ["Регион", regionNameForTools(region)],
          ["Проверено POI", pois.length],
          ["Привязано", reports.length],
        ],
        bodyHtml: buildWorldReportLines(reports, "Все POI региона уже имели координаты."),
      })
    });

    this.render(false);
    ui.notifications.info(`POI привязаны к карте: ${reports.length}`);
  }

  async _generateFirstSessionBrief(html) {
    const selectedRegion = html.find("[name='session-region']").val() || FIRST_SESSION_TARGET_REGION;
    const region = regionNameForTools(selectedRegion || FIRST_SESSION_TARGET_REGION);
    const focusPoiId = html.find("[name='session-poi']").val() || "";
    const prep = buildSessionPrepData(region, focusPoiId);
    const row = getRegionPrepRows().find(r => regionNameForTools(r.region) === regionNameForTools(prep.region));

    const sceneBlocks = prep.firstSessionScenes.map(scene => buildWorldReportBlock(scene.label, [
      ["Статус", scene.statusLabel],
      ["Локация", scene.location],
      ["Карта", scene.map],
      ["Маршрут", scene.route],
      ["NPC", scene.npc],
      ["Задача", scene.purpose],
    ], {
      bodyHtml: buildWorldReportLines([scene.check]),
    })).join("");

    const npcLines = prep.firstSessionNpcRows.map(row =>
      `t${row.tier} ${row.label} (${row.specialization}) -> ${row.location} ${row.map}: ${row.purpose}`
    );

    const merchantBlocks = prep.firstSessionMerchantRows.map(merchant => buildWorldReportBlock(merchant.label, [
      ["Статус", merchant.statusLabel],
      ["Профиль", merchant.specialty],
      ["Локация", merchant.location],
      ["Карта", merchant.map],
    ], {
      bodyHtml: buildWorldReportLines([merchant.purpose]),
    })).join("");

    const questLines = prep.questSeeds.map(quest =>
      `${quest.title} (${quest.location}, сложность ${quest.difficulty}): ${quest.description}`
    );

    const rumorLines = prep.firstSessionRumorRows.map(row => `${row.source}: ${row.text}`);
    const gapLines = [
      ...prep.unmappedPois.map(poi => `${poi.name}: нет координат world map`),
      ...(prep.merchants.length ? [] : ["В регионе нет готового торговца; используй рекомендованные торговые слоты перед полным QA торговли."]),
      ...(prep.settlements.length ? [] : ["В регионе нет поселений; квесты, слухи и экономика будут слабо связаны."]),
      ...(prep.pois.length ? [] : ["В регионе нет POI; маршруту энкаунтеров нужна хотя бы одна привязанная угроза."]),
    ];

    const bodyHtml = `<div class="ih-world-report ih-world-session-report">
      ${buildWorldReportSection("Маршрут первой сессии", sceneBlocks, "Нет доступных сцен маршрута.")}
      ${buildWorldReportSection("Размещение NPC", buildWorldReportLines(npcLines, "Нет строк размещения NPC."))}
      ${buildWorldReportSection("Торговля и инвентарь", merchantBlocks, "Нет торговых якорей.")}
      ${buildWorldReportSection("Квестовые зерна", buildWorldReportLines(questLines, "Нет данных поселений для квестовых зерен."))}
      ${buildWorldReportSection("Слухи и события", buildWorldReportLines(rumorLines, "Нет слухов или событий."))}
      ${buildWorldReportSection("Ручной QA-прогон", buildWorldReportLines(prep.firstSessionChecklist, "Нет ручного чеклиста."))}
      ${buildWorldReportSection("Дыры перед сессией", buildWorldReportLines(gapLines, "Блокирующих дыр по текущим данным не видно."))}
    </div>`;

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `План первой сессии: ${prep.region}`,
        icon: "🧭",
        rows: [
          ["Готовность", row ? `${row.readiness}% (${row.status})` : "нет данных"],
          ["Сцены", prep.firstSessionScenes.length],
          ["NPC-роли", prep.firstSessionNpcRows.length],
          ["Торговцы", prep.firstSessionMerchantRows.length],
          ["POI на карте", `${prep.mappedPois.length}/${prep.pois.length}`],
        ],
        bodyHtml,
        className: "ih-world-session-card",
      })
    });

    ui.notifications.info(`План первой сессии создан: ${prep.region}`);
  }

  async _generateFirstSessionRunbook(html) {
    const selectedRegion = html.find("[name='session-region']").val() || FIRST_SESSION_TARGET_REGION;
    const focusPoiId = html.find("[name='session-poi']").val() || "";
    const runbook = buildFirstSessionRunbookSnapshot(selectedRegion, focusPoiId);

    const gateBlocks = runbook.gates.map(gate => buildWorldReportBlock(gate.label, [
      ["Статус", gate.statusLabel],
      ["Метрика", gate.metric || "—"],
      ["Итог", gate.summary],
      ["Действие", gate.action || "—"],
    ])).join("");

    const scenarioBlocks = runbook.scenarios.map(scenario => {
      const lines = [
        ...scenario.checks.map((line, index) => `${index + 1}. ${line}`),
        scenario.pass ? `Pass: ${scenario.pass}` : "",
        scenario.risk ? `Риск: ${scenario.risk}` : "",
      ];
      return buildWorldReportBlock(scenario.label, [
        ["Статус", scenario.statusLabel],
        ["Якорь", scenario.anchor],
        ["Карта", scenario.map],
        ["Системы", scenario.systemsLabel || "—"],
        ["Цель", scenario.objective],
      ], {
        bodyHtml: buildWorldReportLines(lines),
      });
    }).join("");

    const bodyHtml = `<div class="ih-world-report ih-world-session-report ih-world-runbook-report">
      ${buildWorldReportSection("Гейты перед первой сессией", gateBlocks, "Гейты не собраны.")}
      ${buildWorldReportSection("Сценарии ручного прогона", scenarioBlocks, "Сценарии не собраны.")}
      ${buildWorldReportSection("Таймлайн сессии", buildWorldReportLines(runbook.timeline, "Таймлайн не собран."))}
      ${buildWorldReportSection("Риски и порядок закрытия", buildWorldReportLines(runbook.riskLines, "Критичных рисков по текущим данным не видно."))}
    </div>`;

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `GM runbook первой сессии: ${runbook.region}`,
        icon: "🎲",
        rows: [
          ["Готовность", `${runbook.scorePct}%`],
          ["Статус", runbook.statusLabel],
          ["Блокеры", runbook.blockers],
          ["Ручные проверки", runbook.manualChecks],
          ["Предупреждения", runbook.warnings],
          ["Контент", `${runbook.facts.settlements} пос. · ${runbook.facts.pois} POI · ${runbook.facts.quests} квестов`],
          ["Торговля", `${runbook.facts.merchants} торговцев · ${runbook.facts.merchantStockItems} предметов`],
        ],
        bodyHtml,
        className: "ih-world-session-card",
      })
    });

    ui.notifications.info(`GM runbook первой сессии создан: ${runbook.scorePct}%`);
  }

  async _generateFirstSessionQa(html) {
    const selectedRegion = html.find("[name='session-region']").val() || FIRST_SESSION_TARGET_REGION;
    const focusPoiId = html.find("[name='session-poi']").val() || "";
    const qa = buildFirstSessionQaSnapshot(selectedRegion, focusPoiId);
    const checkBlocks = qa.checks.map(check => buildWorldReportBlock(check.label, [
      ["Статус", check.statusLabel],
      ["Метрика", check.metric || "—"],
      ["Итог", check.summary],
      ["Действие", check.action || "—"],
    ], {
      bodyHtml: buildWorldReportLines((check.rows ?? []).slice(0, 10).map(row =>
        `${row.statusLabel ?? firstSessionQaStatusLabel(row.status)}: ${row.label ? `${row.label} ` : ""}${row.name ?? row.id ?? ""} — ${row.note ?? row.summary ?? ""}`
      )),
    })).join("");

    const bodyHtml = `<div class="ih-world-report ih-world-session-report ih-world-qa-report">
      ${buildWorldReportSection("QA гейты слоя первой сессии", checkBlocks, "QA гейты не собраны.")}
      ${buildWorldReportSection("Следующие действия", buildWorldReportLines(qa.nextActions, "Можно переходить к ручному Foundry-прогону."))}
    </div>`;

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `QA слоя первой сессии: ${qa.region}`,
        icon: "✓",
        rows: [
          ["Готовность", `${qa.scorePct}%`],
          ["Статус", qa.statusLabel],
          ["Блокеры", qa.blockers],
          ["Предупреждения", qa.warnings],
          ["Ручные проверки", qa.manualChecks],
          ["Документы", `${qa.facts.foundDocuments}/${qa.facts.documents}`],
          ["Связи", `${qa.facts.linkedDocuments}/${qa.facts.documents}`],
        ],
        bodyHtml,
        className: "ih-world-session-card",
      })
    });

    ui.notifications.info(`QA слоя первой сессии создан: ${qa.scorePct}%`);
  }

  async _generateCombatQa() {
    const qa = buildCombatQaSnapshot();
    const checkBlocks = qa.checks.map(check => buildWorldReportBlock(check.label, [
      ["Статус", check.statusLabel],
      ["Метрика", check.metric || "—"],
      ["Итог", check.summary],
      ["Действие", check.action || "—"],
    ], {
      bodyHtml: buildWorldReportLines((check.rows ?? []).slice(0, 12).map(row => {
        const label = row.label ?? row.id ?? "";
        const detail = row.summary ?? row.note ?? row.requiresLabel ?? "";
        return `${row.statusLabel ?? combatQaStatusLabel(row.status)}: ${label}${row.metric ? ` (${row.metric})` : ""} — ${detail}`;
      })),
    })).join("");
    const scenarioBlocks = qa.scenarios.map(scenario => buildWorldReportBlock(scenario.label, [
      ["Статус", scenario.statusLabel],
      ["Время", `${scenario.minutes} мин`],
      ["Ответственный", scenario.owner],
      ["Зависимости", scenario.requiresLabel || "—"],
      ["Итог", scenario.summary],
    ], {
      bodyHtml: buildWorldReportLines(scenario.steps, "Шаги ручной проверки не заданы."),
    })).join("");

    const bodyHtml = `<div class="ih-world-report ih-world-combat-qa-report">
      ${buildWorldReportSection("Combat QA gates", checkBlocks, "Combat QA checks не собраны.")}
      ${buildWorldReportSection("Manual combat pass", scenarioBlocks, "Сценарии не собраны.")}
      ${buildWorldReportSection("Следующие действия", buildWorldReportLines(qa.nextActions, "Можно переходить к runtime smoke и ручному боевому прогону."))}
    </div>`;

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Combat QA: бой, броня, AoE, медицина",
        icon: "⚔",
        rows: [
          ["Готовность", `${qa.scorePct}%`],
          ["Статус", qa.statusLabel],
          ["Блокеры", qa.blockers],
          ["Предупреждения", qa.warnings],
          ["Ручные проверки", qa.manualChecks],
          ["API", `${qa.facts.apiAvailable}/${qa.facts.apiTotal}`],
          ["Механики", `${qa.facts.mechanicOk}/${qa.facts.mechanicTotal}`],
          ["Сценарии", `${qa.facts.scenarioReady}/${qa.facts.scenarioTotal}`],
        ],
        bodyHtml,
        className: "ih-world-session-card",
      })
    });

    ui.notifications.info(`Combat QA создан: ${qa.scorePct}%`);
  }

  async _postCombatDryRunReport(dryRun) {
    const sectionBlocks = dryRun.sectionRows.map(section => buildWorldReportBlock(section.label, [
      ["Статус", section.statusLabel],
      ["Метрика", section.metric],
      ["Время", section.ms ? `${section.ms} ms` : "—"],
      ["Итог", section.summary || "—"],
    ], {
      bodyHtml: buildWorldReportLines((section.findings ?? []).slice(0, 6).map(finding =>
        `[${finding.severity}] ${finding.code}: ${finding.path || "runtime"} — ${finding.message}`
      ), "Findings нет."),
    })).join("");
    const caseBlocks = dryRun.expectedCases.map(testCase => buildWorldReportBlock(testCase.label, [
      ["Статус", testCase.statusLabel],
      ["Слой", testCase.layer],
      ["Авто-секция", `${testCase.autoSection} (${testCase.autoStatusLabel})`],
      ["Ожидаемо", testCase.expected],
      ["Ручной шаг", testCase.manual],
    ], {
      bodyHtml: buildWorldReportLines([testCase.note]),
    })).join("");
    const manualBlocks = dryRun.manualRows.map(row => buildWorldReportBlock(row.label, [
      ["Статус", row.statusLabel],
      ["Время", row.metric],
      ["Зависимости", row.requiresLabel || "—"],
      ["Итог", row.summary],
    ], {
      bodyHtml: buildWorldReportLines(row.steps, "Шаги ручной проверки не заданы."),
    })).join("");

    const bodyHtml = `<div class="ih-world-report ih-world-combat-dry-run-report">
      ${buildWorldReportSection("Focused smoke sections", sectionBlocks, "Smoke sections не запускались.")}
      ${buildWorldReportSection("Expected combat cases", caseBlocks, "Кейсы не собраны.")}
      ${buildWorldReportSection("Manual route", manualBlocks, "Ручной маршрут не собран.")}
      ${buildWorldReportSection("Следующие действия", buildWorldReportLines(dryRun.nextActions, "Можно переходить к ручному боевому прогону."))}
    </div>`;

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Combat dry-run: focused smoke and manual route",
        icon: "▶",
        rows: [
          ["Готовность", `${dryRun.scorePct}%`],
          ["Статус", dryRun.statusLabel],
          ["Последний запуск", dryRun.lastRunLabel],
          ["Секции", `${dryRun.facts.sectionsDone}/${dryRun.facts.sectionsTotal}`],
          ["Ошибки", dryRun.facts.smokeErrors],
          ["Warnings", dryRun.facts.smokeWarnings],
          ["Кейсы", `${dryRun.facts.expectedCasesOk}/${dryRun.facts.expectedCases}`],
          ["Manual", dryRun.facts.manualScenarios],
        ],
        bodyHtml,
        className: "ih-world-session-card",
      })
    });
  }

  async _runCombatDryRun() {
    if (!game.ironHills?.runRuntimeSmoke) {
      ui.notifications.warn("Runtime smoke API недоступен");
      return;
    }

    ui.notifications.info("Combat dry-run запущен");
    const report = await game.ironHills.runRuntimeSmoke({
      ...COMBAT_DRY_RUN_SMOKE_OPTIONS,
    });
    const compact = compactCombatDryRunReport(report);
    this._lastCombatDryRun = compact;
    const dryRun = buildCombatDryRunSnapshot({
      combatQa: buildCombatQaSnapshot(),
      report: compact,
    });
    const status = summarizeCombatDryRunStatus(compact);
    await setReleaseQaState({
      combatDryRunReport: compact,
    }, {
      type: "combat-dry-run",
      label: status.label,
      status: status.status,
      summary: status.summary,
    });
    await this._postCombatDryRunReport(dryRun);
    this.render(false);
    ui.notifications.info(`Combat dry-run завершен: ${dryRun.scorePct}%`);
  }

  async _postCombatTestBenchReport(result) {
    const snapshot = result.snapshot ?? buildCombatTestBenchSnapshot();
    const categories = [...new Set((result.reports ?? []).map(row => row.category))];
    const materializeBlocks = categories.map(category => {
      const lines = result.reports
        .filter(row => row.category === category)
        .map(row => `${row.statusLabel}: ${row.name}${row.detail ? ` - ${row.detail}` : ""}`);
      return buildWorldReportSection(category, buildWorldReportLines(lines));
    }).join("");
    const actorBlocks = snapshot.actorRows.map(row => buildWorldReportBlock(row.label, [
      ["Статус", row.statusLabel],
      ["Роль", row.role],
      ["Готовность", row.summary],
      ["Actor ID", row.actorId || "—"],
    ], {
      bodyHtml: buildWorldReportLines(row.itemRows.map(item => `${item.ready ? "ok" : "missing"}: ${item.label}`)),
    })).join("");
    const scenarioBlocks = snapshot.scenarioRows.map(row => buildWorldReportBlock(row.label, [
      ["Статус", row.statusLabel],
      ["Актёр", row.actor],
      ["Ожидаемо", row.expected],
    ])).join("");

    const bodyHtml = `<div class="ih-world-report ih-world-combat-test-bench-report">
      ${buildWorldReportSection("Materialize", materializeBlocks, "Нет изменений.")}
      ${buildWorldReportSection("Actors and items", actorBlocks, "Test bench actors не собраны.")}
      ${buildWorldReportSection("Scene", buildWorldReportBlock(snapshot.sceneRow.label, [
        ["Статус", snapshot.sceneRow.statusLabel],
        ["Scene ID", snapshot.sceneRow.sceneId || "—"],
        ["Токены", `${snapshot.sceneRow.tokenReady}/${snapshot.sceneRow.tokenTotal}`],
        ["Итог", snapshot.sceneRow.summary],
      ]))}
      ${buildWorldReportSection("Manual scenarios", scenarioBlocks, "Сценарии не собраны.")}
      ${buildWorldReportSection("Следующие действия", buildWorldReportLines(snapshot.nextActions, "Открыть сцену и начать ручной прогон."))}
    </div>`;

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Combat test bench: live Foundry fixtures",
        icon: "🧪",
        rows: [
          ["Готовность", `${snapshot.scorePct}%`],
          ["Статус", snapshot.statusLabel],
          ["Актёры", `${snapshot.facts.actorsReady}/${snapshot.facts.actorsTotal}`],
          ["Предметы", `${snapshot.facts.itemsReady}/${snapshot.facts.itemsTotal}`],
          ["Токены", `${snapshot.facts.tokensReady}/${snapshot.facts.tokensTotal}`],
          ["Сценарии", snapshot.facts.scenarios],
        ],
        bodyHtml,
        className: "ih-world-session-card",
      })
    });
  }

  async _materializeCombatTestBench() {
    if (!game.ironHills?.materializeCombatTestBench) {
      ui.notifications.warn("Combat test bench API недоступен");
      return;
    }

    ui.notifications.info("Combat test bench создается/обновляется");
    try {
      const result = await game.ironHills.materializeCombatTestBench();
      this._lastCombatTestBench = result.snapshot ?? buildCombatTestBenchSnapshot();
      await this._postCombatTestBenchReport(result);
      this.render(false);
      ui.notifications.info(`Combat test bench готов: ${this._lastCombatTestBench.scorePct}%`);
    } catch (error) {
      console.error("Iron Hills | Combat test bench failed", error);
      ui.notifications.error(`Combat test bench не создан: ${error?.message ?? error}`);
    }
  }

  _readGmControlOptions(html) {
    return {
      scope: html.find("[name='gm-control-scope']").val() || "selected",
      conditionKey: html.find("[name='gm-condition-key']").val() || "bleeding",
      conditionValue: Number(html.find("[name='gm-condition-value']").val() || 1),
      resourceKey: html.find("[name='gm-resource-key']").val() || "energy",
      resourceMode: html.find("[name='gm-resource-mode']").val() || "full",
      resourceValue: Number(html.find("[name='gm-resource-value']").val() || 0),
      bodyPart: html.find("[name='gm-body-part']").val() || "torso",
      bodyAmount: Number(html.find("[name='gm-body-amount']").val() || 5),
      timePreset: html.find("[name='gm-time-preset']").val() || "six-seconds",
      itemId: html.find("[name='gm-action-item']").val() || "",
      hand: html.find("[name='gm-action-hand']").val() || "rightHand",
      skipTimeCost: html.find("[name='gm-action-skip-time']").is(":checked"),
      targetZone: html.find("[name='gm-action-target-zone']").val() || "",
      targetZoneMode: html.find("[name='gm-action-zone-mode']").val() || "",
      friendlyFireMode: html.find("[name='gm-action-friendly-fire']").val() || "",
      aimed: html.find("[name='gm-action-aimed']").is(":checked"),
    };
  }

  async _runGmControlAction(html, action) {
    try {
      const result = await runGmControlAction({
        action,
        ...this._readGmControlOptions(html),
      });
      this._lastGmControlResult = result;
      this.render(false);
      return result;
    } catch (error) {
      console.error("Iron Hills | GM Control failed", error);
      ui.notifications.error(`GM Control failed: ${error?.message ?? error}`);
      return { ok: false, error };
    }
  }

  async _materializeFirstSession(html) {
    const selectedRegion = html.find("[name='session-region']").val() || FIRST_SESSION_TARGET_REGION;
    const result = await materializeFirstSessionContent(selectedRegion);
    const summary = result.summary ?? {};
    const runbook = result.runbook ?? buildFirstSessionRunbookSnapshot(result.region);
    const categories = [...new Set(result.reports.map(row => row.category))];
    const gateLines = (runbook.gates ?? []).map(gate =>
      `${gate.statusLabel}: ${gate.label} — ${gate.summary}`
    );
    const scenarioLines = (runbook.scenarios ?? []).map(scenario =>
      `${scenario.statusLabel}: ${scenario.label} — ${scenario.map}`
    );
    const bodyHtml = `<div class="ih-world-report ih-world-session-report">
      ${categories.map(category => {
        const lines = result.reports
          .filter(row => row.category === category)
          .map(row => `${row.statusLabel}: ${row.name}${row.detail ? ` - ${row.detail}` : ""}`);
        return buildWorldReportSection(category, buildWorldReportLines(lines));
      }).join("")}
      ${buildWorldReportSection("После материализации", buildWorldReportLines([
        `Готовность региона: ${result.readiness}%`,
        `Сцены первой сессии: ${result.prep.firstSessionScenes.length}`,
        `NPC-роли: ${result.prep.firstSessionNpcRows.length}`,
        `Торговцы: ${result.prep.merchants.length}`,
        `POI на карте: ${result.prep.mappedPois.length}/${result.prep.pois.length}`,
      ]))}
      ${buildWorldReportSection("Runbook после materialize", buildWorldReportLines([
        `Готовность runbook: ${runbook.scorePct}% (${runbook.statusLabel})`,
        `Блокеры: ${runbook.blockers}, ручные проверки: ${runbook.manualChecks}, предупреждения: ${runbook.warnings}`,
      ]))}
      ${buildWorldReportSection("Гейты runbook", buildWorldReportLines(gateLines, "Гейты не собраны."))}
      ${buildWorldReportSection("Сценарии проверки", buildWorldReportLines(scenarioLines, "Сценарии не собраны."))}
    </div>`;

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `Материализация первой сессии: ${result.region}`,
        icon: "🧱",
        rows: [
          ["Создано", summary.created ?? 0],
          ["Обновлено", summary.updated ?? 0],
          ["Связано", summary.linked ?? 0],
          ["Пополнено", summary.stocked ?? 0],
          ["Runbook", `${runbook.scorePct}%`],
          ["Блокеры", runbook.blockers],
        ],
        bodyHtml,
        className: "ih-world-session-card",
      })
    });

    this.render(false);
    ui.notifications.info(`Стартовый слой ${result.region} готов: ${result.readiness}%`);
  }

  async _generateSessionBrief(html) {
    const region = html.find("[name='session-region']").val() || html.find("[name='poi-region']").val() || html.find("[name='region-select']").val() || "";
    const focusPoiId = html.find("[name='session-poi']").val() || "";
    const prep = buildSessionPrepData(region, focusPoiId);
    const row = getRegionPrepRows().find(r => regionNameForTools(r.region) === regionNameForTools(prep.region));

    const threatBlocks = prep.pois.slice(0, 5).map(poi => {
      const info = poi.system.info ?? {};
      const state = poi.system.state ?? {};
      const coord = isValidMapCoord(info.mapCol, info.mapRow) ? `[${info.mapCol}, ${info.mapRow}]` : "не привязан";
      return buildWorldReportBlock(poi.name, [
        ["Тип", info.poiType ?? "poi"],
        ["Тема", info.theme ?? "—"],
        ["Угроза", state.threatLevel ?? info.danger ?? 0],
        ["Контроль", state.control ?? 0],
        ["Карта", coord],
      ]);
    }).join("");

    const settlementBlocks = prep.settlements.slice(0, 5).map(settlement => buildWorldReportBlock(settlement.name, [
      ["Опасность", settlement.system.info?.danger ?? 0],
      ["Снабжение", settlement.system.info?.supply ?? 0],
      ["Экономика", settlement.system.economy?.economyStatus ?? "normal"],
      ["Кризис", settlement.system.regionSim?.activeCrisis || "нет"],
    ])).join("");

    const questLines = prep.questSeeds.map(quest =>
      `${quest.title} (${quest.location}, сложность ${quest.difficulty}): ${quest.description}`
    );

    const gapLines = [
      ...prep.unmappedPois.map(poi => `${poi.name}: нет координат World Map`),
      ...(prep.merchants.length ? [] : ["В регионе нет торговцев для сессионной экономики."]),
      ...(prep.settlements.length ? [] : ["В регионе нет поселений: квесты и экономика будут слабо связаны."]),
    ];

    const focusRows = prep.focusPoi ? [
      ["Фокус", prep.focusPoi.name],
      ["Тип", prep.focusPoi.system.info?.poiType ?? "poi"],
      ["Угроза", prep.focusPoi.system.state?.threatLevel ?? prep.focusPoi.system.info?.danger ?? 0],
      ["Координаты", isValidMapCoord(prep.focusPoi.system.info?.mapCol, prep.focusPoi.system.info?.mapRow)
        ? `[${prep.focusPoi.system.info.mapCol}, ${prep.focusPoi.system.info.mapRow}]`
        : "не привязан"],
    ] : [["Фокус", "нет POI"]];

    const bodyHtml = `<div class="ih-world-report ih-world-session-report">
      ${buildWorldReportSection("Фокус сессии", buildWorldReportBlock(prep.region, focusRows))}
      ${buildWorldReportSection("Главные угрозы", threatBlocks, "Угрозы не найдены.")}
      ${buildWorldReportSection("Поселения", settlementBlocks, "Поселения не найдены.")}
      ${buildWorldReportSection("Квестовые зерна", buildWorldReportLines(questLines, "Нет поселений для генерации квестовых зерен."))}
      ${buildWorldReportSection("Слухи и события", buildWorldReportLines(prep.hooks, "История региона пока пустая."))}
      ${buildWorldReportSection("Что закрыть перед сессией", buildWorldReportLines(gapLines, "Критичных дыр по региону не видно."))}
    </div>`;

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `Session Brief: ${prep.region}`,
        icon: "🧭",
        rows: [
          ["Готовность", row ? `${row.readiness}% (${row.status})` : "нет данных"],
          ["Поселения", prep.settlements.length],
          ["POI", `${prep.mappedPois.length}/${prep.pois.length} на карте`],
          ["Торговцы", prep.merchants.length],
        ],
        bodyHtml,
        className: "ih-world-session-card",
      })
    });

    ui.notifications.info(`Session brief создан: ${prep.region}`);
  }

  async _showWorldStatusReport() {
    const rows = getRegionPrepRows();
    const body = rows.map(row => buildWorldReportBlock(row.region, [
      ["Готовность", `${row.readiness}% (${row.status})`],
      ["Поселения", row.settlements],
      ["POI на карте", `${row.mappedPois}/${row.pois}`],
      ["Торговцы", row.merchants],
      ["Квесты", row.quests],
      ["Высокие угрозы", row.highThreats],
      ["Кризисы", row.activeCrisis],
    ])).join("");

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Статус мира",
        icon: "🌍",
        bodyHtml: `<div class="ih-world-report">${buildWorldReportSection("Регионы", body, "Нет данных регионов.")}</div>`,
      })
    });

    this._showWorldStatus = true;
    this.render(false);
    ui.notifications.info("Статус мира отправлен в чат");
  }

  _buildReleaseQaSnapshot() {
    const releaseQaState = getReleaseQaState();
    return buildReleaseQaSnapshot({
      contentReport: this._lastContentReadiness ?? releaseQaState.contentReport ?? null,
      runtimeReport: this._lastRuntimeSmoke ?? releaseQaState.runtimeReport ?? null,
      artCockpitReport: this._lastArtCockpit ?? releaseQaState.artCockpitReport ?? null,
      sessionReadinessReport: this._lastSessionReadiness ?? releaseQaState.sessionReadinessReport ?? null,
      packPlanReport: this._lastPackPlan ?? releaseQaState.packPlanReport ?? null,
      pipelineReport: this._lastPatchPipeline ?? releaseQaState.pipelineReport ?? null,
      regionRows: getRegionPrepRows(),
      manualDone: releaseQaState.manualDone,
      manualStatuses: releaseQaState.manualStatuses,
    });
  }

  async _runReleaseContentReadiness() {
    if (!game.ironHills?.checkContentReadiness) {
      ui.notifications.warn("Content readiness API недоступен");
      return;
    }
    const report = await game.ironHills.checkContentReadiness({
      strictArt: true,
      includePackDryRun: false,
      maxFindings: 30,
    });
    this._lastContentReadiness = report;
    const status = summarizeContentStatus(report);
    await setReleaseQaState({
      contentReport: compactContentReport(report),
    }, {
      type: "content-readiness",
      label: status.label,
      status: status.status,
      summary: status.summary,
    });
    this.render(false);
  }

  async _runReleasePackPlan() {
    const report = await buildFoundryGeneratedPackPlan();
    this._lastPackPlan = report;
    const status = summarizePackPlanStatus(report);
    await setReleaseQaState({
      packPlanReport: report,
    }, {
      type: "pack-plan",
      label: status.label,
      status: status.status,
      summary: status.summary,
    });

    console.groupCollapsed?.("Iron Hills | Generated pack plan");
    console.log(report);
    console.groupEnd?.();

    if (status.status === "block") ui.notifications.error(`Pack plan: ${status.summary}. Details in console.`);
    else if (status.status === "warn") ui.notifications.warn(`Pack plan: ${status.summary}.`);
    else ui.notifications.info(`Pack plan: ${status.summary}.`);

    this.render(false);
  }

  async _runReleaseArtCockpit() {
    const report = await buildContentArtCockpitReport({
      checkFilesystem: true,
    });
    const compact = compactArtCockpitReport(report);
    this._lastArtCockpit = compact;
    const status = summarizeArtCockpitStatus(compact);
    await setReleaseQaState({
      artCockpitReport: compact,
    }, {
      type: "art-cockpit",
      label: status.label,
      status: status.status,
      summary: status.summary,
    });

    const text = formatContentArtCockpitReport(report, { maxRows: 24 });
    console.groupCollapsed?.("Iron Hills | Content art cockpit");
    console.log(text);
    console.log(report);
    console.groupEnd?.();

    if (status.status === "block") ui.notifications.error(`Art cockpit: ${status.summary}. Details in console.`);
    else if (status.status === "warn") ui.notifications.warn(`Art cockpit: ${status.summary}. Details in console.`);
    else ui.notifications.info(`Art cockpit: ${status.summary}.`);

    this.render(false);
  }

  async _runReleaseSessionReadiness() {
    const report = buildSessionReadinessReport({
      checkRuntime: true,
    });
    const compact = compactSessionReadinessReport(report);
    this._lastSessionReadiness = compact;
    const status = summarizeSessionReadinessStatus(compact);
    await setReleaseQaState({
      sessionReadinessReport: compact,
    }, {
      type: "session-readiness",
      label: status.label,
      status: status.status,
      summary: status.summary,
    });

    const text = formatSessionReadinessReport(report, { maxRows: 24 });
    console.groupCollapsed?.("Iron Hills | Session readiness");
    console.log(text);
    console.log(report);
    console.groupEnd?.();

    if (status.status === "block") ui.notifications.error(`Session readiness: ${status.summary}. Details in console.`);
    else if (status.status === "warn") ui.notifications.warn(`Session readiness: ${status.summary}. Details in console.`);
    else ui.notifications.info(`Session readiness: ${status.summary}.`);

    this.render(false);
  }

  async _runReleasePipelineDryRun() {
    if (!game.ironHills?.prepareContentPatch) {
      ui.notifications.warn("Content patch pipeline API РЅРµРґРѕСЃС‚СѓРїРµРЅ");
      return;
    }
    const report = await game.ironHills.prepareContentPatch({
      apply: false,
      rebuildPacks: true,
      syncCatalogPacks: true,
      syncNpcLoot: true,
      syncMonsterBestiary: true,
      repair: true,
      validate: true,
      preflight: true,
      stopOnPreflightErrors: true,
      validateGeneratedPacks: true,
      profileBalance: true,
      includeGenerated: true,
      includeWorld: false,
      includePacks: true,
      auditCatalogs: true,
      auditAssets: true,
      checkAssetFiles: false,
      maxFindings: 30,
    });
    const compact = compactPipelineReport(report);
    this._lastPatchPipeline = compact;
    const status = summarizePipelineStatus(compact);
    await setReleaseQaState({
      pipelineReport: compact,
    }, {
      type: "pipeline-dry-run",
      label: status.label,
      status: status.status,
      summary: status.summary,
    });
    this.render(false);
  }

  async _runReleaseRuntimeSmoke() {
    if (!game.ironHills?.runRuntimeSmoke) {
      ui.notifications.warn("Runtime smoke API недоступен");
      return;
    }
    const report = await game.ironHills.runRuntimeSmoke({
      includeAssets: true,
      includeGeneratedSources: true,
      includePacks: true,
      includeInventory: true,
      includeTrade: true,
      includeCombat: true,
      includePrepared: true,
      includeMedicine: true,
      includeLifecycle: true,
      maxFindings: 30,
    });
    this._lastRuntimeSmoke = report;
    const status = summarizeRuntimeStatus(report);
    await setReleaseQaState({
      runtimeReport: compactRuntimeReport(report),
    }, {
      type: "runtime-smoke",
      label: status.label,
      status: status.status,
      summary: status.summary,
    });
    this.render(false);
  }

  _hydrateSituationCockpitFromState() {
    if (this._situationCockpit?.hasSituation) return;
    const state = getGmSituationState();
    const record = state.entries?.[state.activeId] ?? state.entries?.[state.selectedId] ?? state.entries?.[state.order?.[0]];
    if (!record?.situation?.hasSituation) return;
    this._situationCockpit = plainClone(record.situation);
    this._situationCockpitOptions = normalizeSituationCockpitOptions(record.options ?? SITUATION_COCKPIT_DEFAULTS);
    this._situationCockpitSignature = situationOptionSignature(this._situationCockpitOptions);
    this._situationCockpitRecordId = record.id;
  }

  _readSituationCockpitOptions(html) {
    const current = normalizeSituationCockpitOptions(this._situationCockpitOptions ?? SITUATION_COCKPIT_DEFAULTS);
    const read = (name, fallback = "") => String(html.find(`[name='${name}']`).val() ?? fallback ?? "").trim();
    const seedInput = read("situation-seed", current.seedInput);
    const seed = seedInput || `gm:${Date.now()}:${Math.floor(Math.random() * 1000000)}`;
    return normalizeSituationCockpitOptions({
      level: read("situation-level", current.level),
      terrain: read("situation-terrain", current.terrain),
      kind: read("situation-kind", current.kind),
      tier: read("situation-tier", current.tier),
      label: read("situation-label", current.label),
      rerollMode: read("situation-reroll-mode", current.rerollMode),
      seedInput,
      seed,
    });
  }

  _buildSituationCockpitBrief() {
    return buildSituationCockpitBrief(this._situationCockpit, this._situationCockpitOptions ?? SITUATION_COCKPIT_DEFAULTS);
  }

  async _saveSituationCockpitMutation(situation, { render = true, materializeResult = null } = {}) {
    const next = finalizeSituationMutation(situation);
    const options = normalizeSituationCockpitOptions(this._situationCockpitOptions ?? SITUATION_COCKPIT_DEFAULTS);
    this._situationCockpit = next;
    this._situationCockpitOptions = options;
    this._situationCockpitSignature = situationOptionSignature(options);
    if (materializeResult) this._lastSituationMaterialize = materializeResult;
    const { record } = await persistGmSituationRecord(next, options, { status: "active" });
    this._situationCockpitRecordId = record.id;
    if (render) this.render(false);
    return { situation: next, record };
  }

  async _rollSituationCockpit(html, { render = true, mode = null, forceFreshSeed = false, previousRecord = null, optionsOverride = null } = {}) {
    const readOptions = optionsOverride
      ? normalizeSituationCockpitOptions(optionsOverride)
      : this._readSituationCockpitOptions(html);
    const requestedMode = normalizeSituationChoice(mode ?? readOptions.rerollMode, SITUATION_COCKPIT_REROLL_MODE_OPTIONS, "fresh");
    const state = getGmSituationState();
    const selectedRecord = requestedMode === "refresh" ? previousRecord ?? state.entries?.[state.selectedId] ?? null : null;
    const previous = selectedRecord?.situation?.hasSituation
      ? plainClone(selectedRecord.situation)
      : this._situationCockpit?.hasSituation ? plainClone(this._situationCockpit) : null;
    const previousRecordId = selectedRecord?.id ?? this._situationCockpitRecordId ?? "";
    const resolvedMode = requestedMode === "refresh" && previous ? "refresh" : "fresh";
    const options = normalizeSituationCockpitOptions({
      ...readOptions,
      rerollMode: resolvedMode,
      seedInput: forceFreshSeed ? "" : readOptions.seedInput,
      seed: forceFreshSeed ? `gm:${resolvedMode}:${Date.now()}:${Math.floor(Math.random() * 1000000)}` : readOptions.seed,
    });
    const context = buildSituationCockpitContext(options);
    const situation = decorateSituationCockpitReroll(buildWorldMapSituation(context), {
      mode: resolvedMode,
      previous,
      previousRecordId,
    });
    if (previous) {
      this._situationCockpitHistory = [
        previous,
        ...(Array.isArray(this._situationCockpitHistory) ? this._situationCockpitHistory : []),
      ].slice(0, 8);
    }
    this._situationCockpit = situation;
    this._situationCockpitOptions = options;
    this._situationCockpitSignature = situationOptionSignature(options);
    this._lastSituationMaterialize = null;
    if (resolvedMode === "refresh" && previousRecordId) await updateGmSituationRecordStatus(previousRecordId, "resolved");
    const { record } = await persistGmSituationRecord(situation, options, {
      previousRecord: resolvedMode === "refresh" && previousRecordId ? { id: previousRecordId, title: previous?.title ?? "" } : null,
      status: "active",
    });
    this._situationCockpitRecordId = record.id;
    if (render) this.render(false);
    ui.notifications?.info?.(`GM situation rolled: ${situation.map?.label ?? "map pool"} / ${situation.title ?? "situation"}`);
    return { situation, options };
  }

  async _ensureSituationCockpit(html) {
    const options = this._readSituationCockpitOptions(html);
    const signature = situationOptionSignature(options);
    if (!this._situationCockpit?.hasSituation || this._situationCockpitSignature !== signature) {
      return this._rollSituationCockpit(html, { render: false });
    }
    return {
      situation: this._situationCockpit,
      options: this._situationCockpitOptions ?? options,
    };
  }

  async _loadSituationRecord(id = "") {
    const state = getGmSituationState();
    const record = state.entries?.[String(id ?? "").trim()];
    if (!record?.situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation record is unavailable.");
      return null;
    }
    const nextState = normalizeGmSituationState({
      ...state,
      selectedId: record.id,
      activeId: record.status === "active" ? record.id : state.activeId,
    });
    await setGmSituationState(nextState);
    this._situationCockpit = plainClone(record.situation);
    this._situationCockpitOptions = normalizeSituationCockpitOptions(record.options ?? SITUATION_COCKPIT_DEFAULTS);
    this._situationCockpitSignature = situationOptionSignature(this._situationCockpitOptions);
    this._situationCockpitRecordId = record.id;
    this._lastSituationMaterialize = null;
    this.render(false);
    ui.notifications?.info?.(`GM situation loaded: ${record.title}`);
    return record;
  }

  async _continueSituationRecord(html, id = "") {
    const state = getGmSituationState();
    const record = state.entries?.[String(id ?? "").trim()];
    if (!record?.situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation record is unavailable.");
      return;
    }
    this._situationCockpit = plainClone(record.situation);
    this._situationCockpitOptions = normalizeSituationCockpitOptions(record.options ?? SITUATION_COCKPIT_DEFAULTS);
    this._situationCockpitSignature = situationOptionSignature(this._situationCockpitOptions);
    this._situationCockpitRecordId = record.id;
    await this._rollSituationCockpit(html, {
      mode: "refresh",
      forceFreshSeed: true,
      previousRecord: record,
      optionsOverride: {
        ...(record.options ?? {}),
        rerollMode: "refresh",
        seedInput: "",
      },
    });
  }

  async _setSituationRecordStatus(id = "", status = "active") {
    const { record } = await updateGmSituationRecordStatus(id, status);
    if (!record) {
      ui.notifications?.warn?.("GM situation record is unavailable.");
      return;
    }
    if (this._situationCockpitRecordId === record.id && record.status === "active") {
      this._situationCockpit = plainClone(record.situation);
      this._situationCockpitOptions = normalizeSituationCockpitOptions(record.options ?? SITUATION_COCKPIT_DEFAULTS);
      this._situationCockpitSignature = situationOptionSignature(this._situationCockpitOptions);
    }
    this.render(false);
    ui.notifications?.info?.(`GM situation marked ${record.statusLabel}: ${record.title}`);
  }

  async _postSituationCockpitToChat(html) {
    const { situation } = await this._ensureSituationCockpit(html);
    const brief = this._buildSituationCockpitBrief();
    if (!brief?.hasBrief) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }
    const packet = buildWorldMapScenePrepPacket(brief, {
      id: `gm-${situation.id}-${situation.seed}`.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 90),
      createdBy: game.user?.name,
    });

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `GM situation: ${situation.title}`,
        subtitle: `${situation.map?.label || "map pool"} · ${situation.map?.level || brief.kind} · seed ${situation.seed || "-"}`,
        icon: "GM",
        status: `t${situation.tier || "-"} · ${situation.kind || brief.kind}`,
        statusClass: situation.tone || "is-active",
        rows: brief.chatRows ?? [],
        bodyHtml: buildWorldMapScenePrepChatBody(packet),
        className: "ih-world-scene-prep-card ih-situation-cockpit-chat-card",
      }),
      whisper: game.user?.isGM ? ChatMessage.getWhisperRecipients("GM") : undefined,
    });

    this.render(false);
    ui.notifications?.info?.(`GM situation sent to chat: ${situation.title}`);
  }

  async _rerollSituationStage(html, stage = "story") {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can reroll scene kit stages.");
      return;
    }
    const { situation, options } = await this._ensureSituationCockpit(html);
    if (!situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }
    const generated = buildSituationStageRoll(options, stage);
    const merged = mergeSituationStage(situation, generated, stage);
    const meta = SITUATION_SCENE_KIT_STAGE_OPTIONS.find(option => option.id === stage) ?? SITUATION_SCENE_KIT_STAGE_OPTIONS[0];
    const result = buildSituationMaterializeResult(`Scene kit stage rerolled: ${meta.label}`, [
      situationRow("Stage", meta.label, meta.summary, "is-active"),
      situationRow("Seed", compactSituationText(generated.seed || "", 72), "Stored as stage seed; main scene identity is preserved.", "is-road"),
      situationRow("Next", "Review or prepare kit folder", "Use Prepare Scene Kit Folder after the stage looks good.", "is-safe"),
    ]);
    await this._saveSituationCockpitMutation(merged, { materializeResult: result });
    ui.notifications?.info?.(`Scene kit stage rerolled: ${meta.label}`);
  }

  async _persistSituationCockpitPrep(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can save a scene prep packet.");
      return;
    }
    await this._ensureSituationCockpit(html);
    const brief = this._buildSituationCockpitBrief();
    if (!brief?.hasBrief) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }
    const { packet } = await persistWorldMapScenePrepPacket(brief);
    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `Scene prep packet: ${packet.title}`,
        subtitle: packet.subtitle,
        icon: "PREP",
        status: `t${packet.tier || "-"} · ${packet.poiTheme || packet.kind}`,
        statusClass: packet.statusClass,
        rows: [
          ["Map", `${packet.situation?.map?.label || "-"} / ${packet.situation?.title || "-"}`],
          ["Actors", `${packet.counts.monsters} monsters · ${packet.counts.npcs} NPC`],
          ["Blueprint", `${packet.counts.blueprint ?? 0} anchors · ${packet.counts.hotspots ?? 0} hotspots`],
          ["Loot", `${packet.counts.loot} sources`],
          ["Clues", `${packet.counts.clues}`],
          ["Seed", packet.situation?.seed || "-"],
        ],
        bodyHtml: buildWorldMapScenePrepChatBody(packet),
        className: "ih-world-scene-prep-card ih-situation-cockpit-chat-card",
      }),
      whisper: ChatMessage.getWhisperRecipients("GM"),
    });

    this.render(false);
    ui.notifications?.info?.(`Scene prep saved: ${packet.title}`);
  }

  async _materializeSituationCockpitJournal(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can create or update scene staging journals.");
      return;
    }
    await this._ensureSituationCockpit(html);
    const brief = this._buildSituationCockpitBrief();
    if (!brief?.hasBrief) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    try {
      const result = await materializeWorldMapSceneStaging(brief);
      await ChatMessage.create({
        content: buildCombatChatCard({
          title: `Scene staging: ${result.packet.title}`,
          subtitle: result.packet.subtitle,
          icon: "JRN",
          status: result.created ? "Journal created" : "Journal updated",
          statusClass: result.created ? "is-safe" : "is-warn",
          rows: [
            ["Journal", result.packet.staging?.journalName ?? "-"],
            ["Map", `${result.packet.situation?.map?.label || "-"} / ${result.packet.situation?.title || "-"}`],
            ["Actors", `${result.packet.counts.monsters} monsters · ${result.packet.counts.npcs} NPC`],
            ["Blueprint", `${result.packet.counts.blueprint ?? 0} anchors · ${result.packet.counts.hotspots ?? 0} hotspots`],
            ["Loot", `${result.packet.counts.loot} sources`],
            ["Seed", result.packet.situation?.seed || "-"],
          ],
          bodyHtml: buildWorldMapSceneStagingChatBody(result),
          className: "ih-world-scene-staging-card ih-situation-cockpit-chat-card",
        }),
        whisper: ChatMessage.getWhisperRecipients("GM"),
      });
      this.render(false);
      ui.notifications?.info?.(`Scene staging ${result.created ? "created" : "updated"}: ${result.packet.staging?.journalName ?? result.packet.title}`);
    } catch (error) {
      console.error("Iron Hills | GM situation staging failed", error);
      ui.notifications?.error?.(`Scene staging failed: ${error.message ?? error}`);
    }
  }

  async _postSituationMaterializeResult(result) {
    const normalized = buildSituationMaterializeResult(result.title ?? "GM situation materialized", result.rows ?? []);
    this._lastSituationMaterialize = normalized;
    await ChatMessage.create({
      content: buildCombatChatCard({
        title: normalized.title,
        icon: "GM",
        status: "World updated",
        statusClass: "is-safe",
        rows: normalized.rows.map(row => [row.label, row.value]),
        bodyHtml: buildSituationMaterializeChatBody(normalized),
        className: "ih-situation-materialize-card",
      }),
      whisper: game.user?.isGM ? ChatMessage.getWhisperRecipients("GM") : undefined,
    });
    this.render(false);
  }

  async _prepareSituationSceneKit(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can prepare scene kits.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    const brief = this._buildSituationCockpitBrief();
    if (!situation?.hasSituation || !brief?.hasBrief) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    try {
      const prepared = await prepareSituationSceneKit(situation, brief);
      const rows = [
        situationRow("Kit", situationSceneKitName(prepared.situation), "Prepared as editable Foundry documents.", "is-active"),
        situationRow("Journal folder", prepared.folders.journal?.folder?.name ?? "-", prepared.folders.journal?.status ?? "", "is-safe"),
        situationRow("Scene folder", prepared.folders.scene?.folder?.name ?? "-", prepared.folders.scene?.status ?? "", "is-safe"),
        situationRow("Actor folder", prepared.folders.actor?.folder?.name ?? "-", prepared.folders.actor?.status ?? "", "is-safe"),
        situationRow("Journal", prepared.staging?.journal?.name ?? "Scene runbook", prepared.staging?.created ? "created" : "updated", prepared.staging?.created ? "is-safe" : "is-warn"),
        situationRow("Draft Scene", prepared.sceneResult.scene?.name ?? situationSceneName(prepared.situation), prepared.sceneResult.status, prepared.sceneResult.status === "created" ? "is-safe" : "is-warn"),
        situationRow("Quest", prepared.questResult.actor?.name ?? "Quest draft", prepared.questResult.status, prepared.questResult.status === "created" ? "is-safe" : "is-warn"),
        prepared.containerResult
          ? situationRow("Loot container", prepared.containerResult.actor?.name ?? "GM Loot", `${prepared.containerResult.status}, ${prepared.containerResult.lootCount} new items`, prepared.containerResult.stocked ? "stocked" : "inventory preserved", prepared.containerResult.status === "created" ? "is-safe" : "is-warn")
          : situationRow("Loot container", "skipped", "No loot/reward prompts in this situation.", "is-safe"),
        situationRow("NPC drafts", `${prepared.npcResults.length} actors`, prepared.npcResults.map(row => `${row.status}:${row.roleKey}`).join(", ") || "none", prepared.npcResults.length ? "is-active" : "is-safe"),
        situationRow("Monster drafts", `${prepared.monsterResults.length} actors`, prepared.monsterResults.map(row => `${row.status}:${row.bestiaryId || "custom"}`).join(", ") || "none", prepared.monsterResults.length ? "is-danger" : "is-safe"),
        situationRow("Next", "Edit folder documents or Send Kit to Scene", "Reroll any stage before sending if the setup does not fit.", "is-road"),
      ];
      const result = buildSituationMaterializeResult("GM scene kit prepared", rows);
      await this._saveSituationCockpitMutation(prepared.situation, { render: false, materializeResult: result });
      await this._postSituationMaterializeResult(result);
      ui.notifications?.info?.(`Scene kit prepared: ${situationSceneKitName(prepared.situation)}`);
    } catch (error) {
      console.error("Iron Hills | GM scene kit preparation failed", error);
      ui.notifications?.error?.(`Scene kit preparation failed: ${error.message ?? error}`);
    }
  }

  async _sendSituationSceneKitToScene(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can send scene kits to scenes.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    const brief = this._buildSituationCockpitBrief();
    if (!situation?.hasSituation || !brief?.hasBrief) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    try {
      const sent = await sendSituationSceneKitToScene(situation, brief);
      const journalStatus = sent.staging?.preserved ? "preserved" : sent.staging?.created ? "created" : "updated";
      const rows = [
        situationRow("Kit", situationSceneKitName(sent.situation), "Sent to editable draft Scene.", "is-active"),
        situationRow("Journal", sent.staging?.journal?.name ?? "Scene runbook", journalStatus, journalStatus === "created" || journalStatus === "preserved" ? "is-safe" : "is-warn"),
        situationRow("Draft Scene", sent.sceneResult.scene?.name ?? situationSceneName(sent.situation), sent.sceneResult.status, sent.sceneResult.status === "created" || sent.sceneResult.status === "preserved" ? "is-safe" : "is-warn"),
        sent.preserved
          ? situationRow("Prepared docs", `${sent.entities.length} existing`, "Manual edits in folders were preserved; stage reroll makes the kit dirty again.", "is-safe")
          : situationRow("Prepared docs", `${sent.entities.length} touched`, "Freshly created/updated from generator rows.", "is-active"),
        situationRow("Scene markers", `${sent.drawingResult.created} created / ${sent.drawingResult.updated} updated`, `${sent.drawingResult.skipped} skipped`, sent.drawingResult.skipped ? "is-warn" : "is-active"),
        situationRow("Quest", sent.questResult.actor?.name ?? "Quest draft", sent.questResult.status, sent.questResult.status === "created" || sent.questResult.status === "preserved" ? "is-safe" : "is-warn"),
        sent.containerResult
          ? situationRow("Loot container", sent.containerResult.actor?.name ?? "GM Loot", `${sent.containerResult.status}, ${sent.containerResult.lootCount} new items`, sent.containerResult.stocked ? "stocked" : "inventory preserved", sent.containerResult.status === "created" ? "is-safe" : "is-warn")
          : situationRow("Loot container", "skipped", "No loot/reward prompts in this situation.", "is-safe"),
        situationRow("NPC drafts", `${sent.npcResults.length} actors`, sent.npcResults.map(row => `${row.status}:${row.roleKey}`).join(", ") || "none", sent.npcResults.length ? "is-active" : "is-safe"),
        situationRow("Monster drafts", `${sent.monsterResults.length} actors`, sent.monsterResults.map(row => `${row.status}:${row.bestiaryId || "custom"}`).join(", ") || "none", sent.monsterResults.length ? "is-danger" : "is-safe"),
        situationRow("GM pins", `${sent.pinResult.created} created / ${sent.pinResult.updated} updated`, `${sent.pinResult.preserved} manual preserved / ${sent.pinResult.missingJournal} missing journal / ${sent.pinResult.skipped} skipped`, sent.pinResult.missingJournal || sent.pinResult.skipped ? "is-warn" : "is-safe"),
        situationRow("Token placement", `${sent.tokenResult.created} created / ${sent.tokenResult.updated} updated`, `${sent.tokenResult.preserved} manual preserved / ${sent.tokenResult.missing} missing actors / ${sent.tokenResult.skipped} skipped`, sent.tokenResult.missing || sent.tokenResult.skipped ? "is-warn" : "is-safe"),
        situationRow("Manual finish", "walls / lights / final token nudges", "Review token scale, cover, AoE, friendly fire and rewards before play.", "is-warn"),
      ];
      const result = buildSituationMaterializeResult("GM scene kit sent to Scene", rows);
      await this._saveSituationCockpitMutation(sent.situation, { render: false, materializeResult: result });
      await this._postSituationMaterializeResult(result);
      ui.notifications?.info?.(`Scene kit sent: ${sent.sceneResult.scene?.name ?? sent.situation.title}`);
    } catch (error) {
      console.error("Iron Hills | GM scene kit send failed", error);
      ui.notifications?.error?.(`Scene kit send failed: ${error.message ?? error}`);
    }
  }

  async _placeSituationSceneKitPins(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can place scene kit pins.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    if (!situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }
    const scene = findSituationScene(situation);
    const journal = findSituationSceneKitJournal(situation);
    if (!scene || !journal) {
      await this._sendSituationSceneKitToScene(html);
      return;
    }

    try {
      const pinResult = await upsertSituationSceneNotes(scene, situation, journal);
      const nextSituation = finalizeSituationMutation({
        ...situation,
        sceneKit: {
          ...(situation.sceneKit ?? {}),
          status: "sent",
          updatedAt: nowIso(),
          sceneUuid: scene.uuid ?? situation.sceneKit?.sceneUuid ?? "",
          journalUuid: journal.uuid ?? situation.sceneKit?.journalUuid ?? "",
          pinSummary: {
            created: pinResult.created,
            updated: pinResult.updated,
            preserved: pinResult.preserved,
            skipped: pinResult.skipped,
            missingJournal: pinResult.missingJournal,
          },
        },
      });
      const rows = [
        situationRow("Scene", scene.name ?? situationSceneName(situation), "existing draft scene", "is-active"),
        situationRow("Runbook", journal.name ?? "Scene Prep Runbook", "pins linked to journal notes", "is-safe"),
        situationRow("GM pins", `${pinResult.created} created / ${pinResult.updated} updated`, `${pinResult.preserved} manual preserved / ${pinResult.missingJournal} missing journal / ${pinResult.skipped} skipped`, pinResult.missingJournal || pinResult.skipped ? "is-warn" : "is-safe"),
        situationRow("Manual safety", "preserved moved pins", "Existing generated pins are not repositioned after GM moves them by hand.", "is-safe"),
      ];
      const result = buildSituationMaterializeResult("GM scene kit pins placed/refreshed", rows);
      await this._saveSituationCockpitMutation(nextSituation, { render: false, materializeResult: result });
      await this._postSituationMaterializeResult(result);
      ui.notifications?.info?.(`Scene kit pins refreshed: ${pinResult.created} created, ${pinResult.updated} updated, ${pinResult.preserved} preserved`);
    } catch (error) {
      console.error("Iron Hills | GM scene kit pin placement failed", error);
      ui.notifications?.error?.(`Scene kit pin placement failed: ${error.message ?? error}`);
    }
  }

  async _placeSituationSceneKitTokens(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can place scene kit tokens.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    if (!situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }
    const scene = findSituationScene(situation);
    const hasPreparedEntities = Array.isArray(situation.sceneKit?.entities) && situation.sceneKit.entities.length > 0;
    if (!scene || !hasPreparedEntities) {
      await this._sendSituationSceneKitToScene(html);
      return;
    }

    try {
      const tokenResult = await upsertSituationSceneTokens(scene, situation);
      const nextSituation = finalizeSituationMutation({
        ...situation,
        sceneKit: {
          ...(situation.sceneKit ?? {}),
          status: "sent",
          updatedAt: nowIso(),
          sceneUuid: scene.uuid ?? situation.sceneKit?.sceneUuid ?? "",
          tokenSummary: {
            created: tokenResult.created,
            updated: tokenResult.updated,
            preserved: tokenResult.preserved,
            skipped: tokenResult.skipped,
            missing: tokenResult.missing,
          },
        },
      });
      const rows = [
        situationRow("Scene", scene.name ?? situationSceneName(situation), "existing draft scene", "is-active"),
        situationRow("Token placement", `${tokenResult.created} created / ${tokenResult.updated} updated`, `${tokenResult.preserved} manual preserved / ${tokenResult.missing} missing actors / ${tokenResult.skipped} skipped`, tokenResult.missing || tokenResult.skipped ? "is-warn" : "is-safe"),
        situationRow("Manual safety", "preserved moved tokens", "Existing generated tokens are not repositioned after GM moves them by hand.", "is-safe"),
      ];
      const result = buildSituationMaterializeResult("GM scene kit tokens placed/refreshed", rows);
      await this._saveSituationCockpitMutation(nextSituation, { render: false, materializeResult: result });
      await this._postSituationMaterializeResult(result);
      ui.notifications?.info?.(`Scene kit tokens refreshed: ${tokenResult.created} created, ${tokenResult.updated} updated, ${tokenResult.preserved} preserved`);
    } catch (error) {
      console.error("Iron Hills | GM scene kit token placement failed", error);
      ui.notifications?.error?.(`Scene kit token placement failed: ${error.message ?? error}`);
    }
  }

  async _materializeSituationQuestDraft(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can create or update quest drafts.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    if (!situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    const result = await upsertSituationQuestDraftActor(situation);
    const actor = result.actor;
    const status = result.status;
    const data = result.data;

    await this._postSituationMaterializeResult(buildSituationMaterializeResult("GM situation quest draft", [
      situationRow("Quest", actor?.name ?? data.name, status, status === "created" ? "is-safe" : "is-warn"),
      situationRow("Objective", data.system.description.objective, data.system.info.reward, "is-gold"),
      situationRow("Target", data.system.info.targetPOI || data.system.info.targetSettlement || "manual", `t${data.system.info.difficulty}`, "is-road"),
    ]));
    ui.notifications?.info?.(`GM quest ${status}: ${actor?.name ?? data.name}`);
  }

  async _materializeSituationRumor(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can add settlement rumors.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    if (!situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }
    const settlement = situationPreferredSettlement(situation);
    if (!settlement) {
      ui.notifications?.warn?.("No settlement found for the generated rumor.");
      return;
    }

    const rumor = buildSituationRumorText(situation);
    await appendSettlementHistory(settlement, "rumors", rumor, 12);
    await this._postSituationMaterializeResult(buildSituationMaterializeResult("GM situation rumor", [
      situationRow("Settlement", settlement.name, "rumor appended", "is-safe"),
      situationRow("Rumor", rumor, situation.reroll?.mode === "refresh" ? "aftermath" : "fresh", "is-road"),
    ]));
    ui.notifications?.info?.(`GM rumor added to ${settlement.name}`);
  }

  async _materializeSituationLootContainer(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can create loot containers.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    if (!situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    const result = await upsertSituationLootContainerDraft(situation);

    await this._postSituationMaterializeResult(buildSituationMaterializeResult("GM situation loot container", [
      situationRow("Container", result.actor?.name ?? "GM Loot", result.status, result.status === "created" ? "is-safe" : "is-warn"),
      situationRow("Theme", result.theme, `t${result.tier}`, "is-gold"),
      situationRow("Loot", `${result.lootCount} items`, result.stocked ? "Added to container inventory." : "Existing inventory preserved.", "is-road"),
    ]));
    ui.notifications?.info?.(`GM loot container ${result.status}: ${result.actor?.name ?? "GM Loot"}`);
  }

  async _materializeSituationNpcDrafts(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can create NPC drafts.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    if (!situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    const results = await upsertSituationNpcDraftActors(situation);
    const rows = results.map(result => situationRow(
      "NPC",
      result.actor?.name ?? "NPC draft",
      `${result.status}: ${result.roleKey}, ${result.itemCount} new items`,
      result.status === "created" ? "is-safe" : "is-warn",
    ));

    await this._postSituationMaterializeResult(buildSituationMaterializeResult("GM situation NPC drafts", rows));
    ui.notifications?.info?.(`GM NPC drafts created/updated: ${rows.length}`);
  }

  async _materializeSituationEncounterLite(html) {
    await this._sendSituationSceneKitToScene(html);
  }

  async _postActiveSceneTransitionPanel() {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can use scene transition actions.");
      return;
    }
    await postSituationSceneTransitionPanel(globalThis.canvas?.scene ?? null);
  }

  async _validateSituationSceneKit(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can validate scene kits.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    if (!situation?.hasSituation) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }
    const scene = resolveSceneKitQaScene(null, situation);
    const snapshot = await postSceneKitQaReport(scene, situation);
    const nextSituation = finalizeSituationMutation({
      ...situation,
      sceneKit: {
        ...(situation.sceneKit ?? {}),
        updatedAt: nowIso(),
        sceneUuid: snapshot.summary?.sceneUuid || situation.sceneKit?.sceneUuid || "",
        qaSummary: snapshot.summary ?? {},
      },
    });
    const result = buildSituationMaterializeResult("GM scene kit QA", [
      situationRow("Scene", snapshot.summary?.sceneName || "No active scene", `${snapshot.statusLabel} / ${snapshot.score}%`, snapshot.statusClass),
      situationRow("Generated docs", `${snapshot.counts?.generated ?? 0} total`, `${snapshot.counts?.foreign ?? 0} foreign / ${snapshot.counts?.matching ?? 0} matching`, snapshot.counts?.foreign ? "is-warn" : "is-safe"),
      situationRow("Pins", `${snapshot.counts?.pins ?? 0} pins`, `${snapshot.counts?.transitions ?? 0} transitions / ${snapshot.counts?.missingJournalLinks ?? 0} broken links`, snapshot.counts?.missingJournalLinks ? "is-warn" : "is-safe"),
      situationRow("Tokens", `${snapshot.counts?.tokens ?? 0} tokens`, `${snapshot.counts?.missingActors ?? 0} missing actors / ${snapshot.counts?.actorlessTokens ?? 0} actorless`, snapshot.counts?.missingActors || snapshot.counts?.actorlessTokens ? "is-warn" : "is-safe"),
      situationRow("Manual safety", `${(snapshot.counts?.movedNotes ?? 0) + (snapshot.counts?.movedTokens ?? 0)} moved docs`, "Manual note/token placement was preserved.", "is-safe"),
    ]);
    await this._saveSituationCockpitMutation(nextSituation, { render: false, materializeResult: result });
    this.render(false);
  }

  async _finalizeSituationSceneKit(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can finalize scene kits.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    const brief = this._buildSituationCockpitBrief();
    if (!situation?.hasSituation || !brief?.hasBrief) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    try {
      let workingSituation = situation;
      let scene = resolveSceneKitQaScene(null, workingSituation);
      const sceneFlag = situationFlagValue(scene, "gmSituationScene") ?? {};
      if (!scene || !sceneKitFlagMatchesSituation(sceneFlag, workingSituation)) {
        const sent = await sendSituationSceneKitToScene(workingSituation, brief);
        workingSituation = sent.situation;
        scene = sent.sceneResult?.scene ?? resolveSceneKitQaScene(null, workingSituation);
      }

      const qaSnapshot = buildSceneKitQaSnapshot(scene, workingSituation);
      const snapshot = await finalizeSituationSceneKit(workingSituation, {
        scene,
        qaSnapshot,
        post: true,
        updateScene: true,
      });
      const nextSituation = finalizeSituationMutation({
        ...workingSituation,
        sceneKit: {
          ...(workingSituation.sceneKit ?? {}),
          status: snapshot.status === "ready" ? "finalized" : "final-review",
          updatedAt: nowIso(),
          finalizedAt: snapshot.summary?.finalizedAt ?? nowIso(),
          sceneUuid: snapshot.summary?.sceneUuid || workingSituation.sceneKit?.sceneUuid || "",
          qaSummary: snapshot.qa?.summary ?? workingSituation.sceneKit?.qaSummary ?? {},
          finalSummary: snapshot.summary ?? {},
        },
      });
      const result = buildSituationMaterializeResult("GM scene kit finalized", [
        situationRow("Scene", snapshot.summary?.sceneName || "No scene", `${snapshot.statusLabel} / ${snapshot.score}%`, snapshot.statusClass),
        situationRow("QA", `${snapshot.summary?.qaStatus || "unchecked"} / ${snapshot.summary?.qaScore ?? 0}%`, `${snapshot.summary?.findings ?? 0} final findings`, snapshot.summary?.qaStatus === "blocked" ? "is-danger" : snapshot.summary?.qaStatus === "warn" ? "is-warn" : "is-safe"),
        situationRow("Generated docs", `${snapshot.summary?.generated ?? 0} total`, `${snapshot.summary?.pins ?? 0} pins / ${snapshot.summary?.tokens ?? 0} tokens / ${snapshot.summary?.drawings ?? 0} markers`, "is-safe"),
        situationRow("Transitions", `${snapshot.summary?.transitions ?? 0}`, "Use Scene transitions for follow-up situations.", snapshot.summary?.transitions ? "is-road" : "is-warn"),
        situationRow("Manual checks", `${snapshot.summary?.manualChecks ?? 0}`, "Walls, lights, token scale, loot handoff and combat assumptions remain explicit.", "is-warn"),
      ]);
      await this._saveSituationCockpitMutation(nextSituation, { render: false, materializeResult: result });
      this.render(false);
    } catch (error) {
      console.error("Iron Hills | GM scene kit finalize failed", error);
      ui.notifications?.error?.(`Scene kit finalize failed: ${error.message ?? error}`);
    }
  }

  async _postSituationScenePlayPanel(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can use scene play mode.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    const brief = this._buildSituationCockpitBrief();
    if (!situation?.hasSituation || !brief?.hasBrief) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    try {
      let workingSituation = situation;
      let scene = resolveSceneKitQaScene(null, workingSituation);
      const sceneFlag = situationFlagValue(scene, "gmSituationScene") ?? {};
      if (!scene || !sceneKitFlagMatchesSituation(sceneFlag, workingSituation)) {
        const sent = await sendSituationSceneKitToScene(workingSituation, brief);
        workingSituation = sent.situation;
        scene = sent.sceneResult?.scene ?? resolveSceneKitQaScene(null, workingSituation);
      }
      const snapshot = await postSceneKitPlayPanel(scene, workingSituation);
      const nextSituation = finalizeSituationMutation({
        ...workingSituation,
        sceneKit: {
          ...(workingSituation.sceneKit ?? {}),
          updatedAt: nowIso(),
          sceneUuid: snapshot.summary?.sceneUuid || workingSituation.sceneKit?.sceneUuid || "",
          playSummary: snapshot.summary ?? {},
        },
      });
      const result = buildSituationMaterializeResult("GM scene play mode", [
        situationRow("Scene", snapshot.summary?.sceneName || "No scene", snapshot.statusLabel, snapshot.statusClass),
        situationRow("Final packet", `${snapshot.summary?.finalStatus || "not finalized"} / ${snapshot.summary?.finalScore ?? 0}%`, "Use Final Packet if the scene still needs review.", snapshot.summary?.finalStatus === "ready" ? "is-safe" : "is-warn"),
        situationRow("QA", `${snapshot.summary?.qaStatus || "unchecked"} / ${snapshot.summary?.qaScore ?? 0}%`, "Use QA from the Play Mode card to refresh.", snapshot.summary?.qaStatus === "blocked" ? "is-danger" : snapshot.summary?.qaStatus === "warn" ? "is-warn" : "is-safe"),
        situationRow("Transitions", `${snapshot.summary?.transitions ?? 0}`, "Use transition panel for follow-up situations.", snapshot.summary?.transitions ? "is-road" : "is-warn"),
      ]);
      await this._saveSituationCockpitMutation(nextSituation, { render: false, materializeResult: result });
      this.render(false);
    } catch (error) {
      console.error("Iron Hills | GM scene play mode failed", error);
      ui.notifications?.error?.(`Scene play mode failed: ${error.message ?? error}`);
    }
  }

  async _launchSituationSceneEncounter(html) {
    if (!game.user?.isGM) {
      ui.notifications?.warn?.("Only a GM can launch scene encounters.");
      return;
    }
    const { situation } = await this._ensureSituationCockpit(html);
    const brief = this._buildSituationCockpitBrief();
    if (!situation?.hasSituation || !brief?.hasBrief) {
      ui.notifications?.warn?.("GM situation is not available.");
      return;
    }

    try {
      let workingSituation = situation;
      let scene = resolveSceneKitQaScene(null, workingSituation);
      const sceneFlag = situationFlagValue(scene, "gmSituationScene") ?? {};
      if (!scene || !sceneKitFlagMatchesSituation(sceneFlag, workingSituation)) {
        const sent = await sendSituationSceneKitToScene(workingSituation, brief);
        workingSituation = sent.situation;
        scene = sent.sceneResult?.scene ?? resolveSceneKitQaScene(null, workingSituation);
      }

      const launch = await launchSceneKitEncounter(scene, workingSituation, { openPanels: true, post: true });
      const summary = launch.snapshot?.summary ?? {};
      const nextSituation = finalizeSituationMutation({
        ...workingSituation,
        sceneKit: {
          ...(workingSituation.sceneKit ?? {}),
          status: launch.ok ? "encounter-launched" : "encounter-review",
          updatedAt: nowIso(),
          sceneUuid: summary.sceneUuid || workingSituation.sceneKit?.sceneUuid || "",
          encounterSummary: summary,
        },
      });
      const result = buildSituationMaterializeResult("GM encounter launch", [
        situationRow("Scene", summary.sceneName || "No scene", launch.ok ? "combat started" : launch.reason || "blocked", launch.ok ? "is-safe" : "is-danger"),
        situationRow("Participants", `${summary.participants ?? summary.participantCount ?? 0}`, `${summary.allies ?? 0} allies / ${summary.enemies ?? 0} enemies / ${summary.neutral ?? 0} neutral`, launch.ok ? "is-safe" : "is-warn"),
        situationRow("Combat panels", launch.ok ? "opened" : "not opened", "Combat Manager and Director open on successful launch.", launch.ok ? "is-active" : "is-warn"),
        situationRow("VFX", "enabled by setting", "Attack/AoE VFX use combat-vfx-service when combatVfxEnabled is true.", "is-road"),
      ]);
      await this._saveSituationCockpitMutation(nextSituation, { render: false, materializeResult: result });
      this.render(false);
    } catch (error) {
      console.error("Iron Hills | GM encounter launch failed", error);
      ui.notifications?.error?.(`Encounter launch failed: ${error.message ?? error}`);
    }
  }

  _openSituationCockpitMap() {
    const situation = this._situationCockpit;
    const options = normalizeSituationCockpitOptions(this._situationCockpitOptions ?? SITUATION_COCKPIT_DEFAULTS);
    const rawLevel = situation?.map?.level || options.level;
    const level = canonicalSituationWorldMapLevel(rawLevel);
    const api = game.ironHills ?? {};
    const focus = {
      level,
      col: 5,
      row: 5,
      terrain: situation?.terrain || options.terrain,
      hotspotId: situation?.kind || options.kind,
      label: situation?.map?.label || situationLabel(options),
      rawLevel,
    };
    if (api.openWorldMapLevel) {
      api.openWorldMapLevel(level, focus);
      return;
    }
    if (api.openWorldMap) {
      api.openWorldMap(focus);
      return;
    }
    ui.notifications?.warn?.("World Map is unavailable.");
  }

  async _setReleaseManualSectionStatus(id, status = "todo") {
    const key = String(id ?? "").trim();
    if (!key) return;
    const resolvedStatus = ["todo", "pass", "fail", "blocked"].includes(status) ? status : "todo";
    const state = getReleaseQaState();
    const manualStatuses = {
      ...(state.manualStatuses ?? {}),
      [key]: resolvedStatus,
    };
    const manualDone = Object.entries(manualStatuses)
      .filter(([, value]) => value === "pass")
      .map(([manualId]) => manualId);
    const snapshot = buildReleaseQaSnapshot({ manualDone, manualStatuses });
    await setReleaseQaState({ manualDone, manualStatuses }, {
      type: "manual-test",
      label: "Manual weekend test",
      status: snapshot.manualSummary?.status ?? "todo",
      summary: `${snapshot.manualSummary?.pass ?? 0}/${snapshot.manualSummary?.total ?? 0} pass, ${snapshot.manualSummary?.fail ?? 0} fail, ${snapshot.manualSummary?.blocked ?? 0} blocked`,
    });
    this.render(false);
  }

  async _toggleReleaseManualSection(id) {
    const key = String(id ?? "").trim();
    if (!key) return;
    const state = getReleaseQaState();
    const current = state.manualStatuses?.[key] ?? (state.manualDone.includes(key) ? "pass" : "todo");
    await this._setReleaseManualSectionStatus(key, current === "pass" ? "todo" : "pass");
  }

  async _resetReleaseManualSections() {
    await setReleaseQaState({ manualDone: [], manualStatuses: {} }, {
      type: "manual-test-reset",
      label: "Manual weekend test",
      status: "todo",
      summary: "manual scenario statuses reset",
    });
    this.render(false);
  }

  _openReleaseTool(tool = "") {
    const key = String(tool ?? "").trim();
    const selectedActor = canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
    const api = game.ironHills ?? {};
    const openMap = (level, focus = {}) => api.openWorldMapLevel
      ? api.openWorldMapLevel(level, focus)
      : api.openWorldMap?.({ ...focus, level });
    const actions = {
      "combat-director": () => api.openCombatDirector?.(),
      "combat-hud": () => api.openCombatHud?.({ compactMode: true }),
      "combat-manager": () => api.openCombatManager?.(),
      inventory: () => selectedActor ? api.openGridInventory?.(selectedActor) : null,
      map: () => api.openWorldMap?.(),
      "map-region": () => openMap("region", { col: 5, row: 2 }),
      "map-local": () => openMap("local", { col: 5, row: 2, hotspotId: "market" }),
      "map-encounter": () => openMap("encounter", { col: 4, row: 3, hotspotId: "choke" }),
      compendium: () => api.openCompendiumBrowser?.(),
      world: () => api.openWorldTools?.(),
    };
    const result = actions[key]?.();
    if (result === null) ui.notifications?.warn?.("Select a token or assign a character first.");
    else if (!actions[key]) ui.notifications?.warn?.(`Unknown release QA tool: ${key}`);
  }

  async _showReleaseQaReport() {
    const snapshot = this._buildReleaseQaSnapshot();
    const text = formatReleaseQaReport(snapshot);

    console.groupCollapsed?.("Iron Hills | Release QA");
    console.log(text);
    console.log(snapshot);
    console.groupEnd?.();

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: "Iron Hills Release QA",
        icon: "✓",
        status: `${snapshot.stageLabel} · ${snapshot.scorePct}%`,
        statusClass: snapshot.gates?.some(gate => gate.status === "block")
          ? "is-danger"
          : snapshot.scorePct >= 75
            ? "is-good"
            : "is-warn",
        rows: [
          ["Score", `${snapshot.scorePct}%`],
          ["Stage", snapshot.stageLabel],
          ["Next action", snapshot.nextAction],
        ],
        bodyHtml: buildReleaseQaChatBody(snapshot),
        className: "ih-release-qa-card",
      })
    });

    ui.notifications.info("Release QA report отправлен в чат и консоль");
  }

  _openWorldMap() {
    if (game.ironHills?.openWorldMap) {
      game.ironHills.openWorldMap();
      return;
    }
    ui.notifications.warn("World Map недоступна");
  }

  activateListeners(html) {
    super.activateListeners(html);

    // ── Вкладки ─────────────────────────────────────────────
    html.find("[data-tab]").on("click", e => {
      const tab = e.currentTarget.dataset.tab;
      html.find("[data-tab]").removeClass("is-active");
      html.find("[data-panel]").removeClass("is-active");
      e.currentTarget.classList.add("is-active");
      html.find(`[data-panel="${tab}"]`).addClass("is-active");
    });

    // ── Новый регион ─────────────────────────────────────────
    html.find("[name='settlement-region']").on("change", e => {
      const isNew = e.currentTarget.value === "__new";
      html.find(".ih-wt-new-region").toggle(isNew);
    });

    // Пикер фракции для генератора NPC
    html.find("[data-pick-faction]").on("click", async () => {
      const picked = await EntityPickerDialog.pick({
        title: "Выбрать фракцию",
        types: ["faction"],
        placeholder: "Поиск фракции...",
      });
      if (picked) {
        html.find("[name='npc-faction']").val(picked.name);
        this._pickedFaction = picked;
      }
    });

    // Пикер поселения для генератора торговца
    html.find("[data-pick-merchant-settlement]").on("click", async () => {
      const picked = await EntityPickerDialog.pick({
        title:       "Выбрать поселение торговца",
        types:       ["settlement"],
        placeholder: "Поиск поселения...",
      });
      if (picked) {
        html.find("[name='merchant-settlement']").val(picked.name);
        this._pickedMerchantSettlement = picked;
      }
    });

    html.find("[data-action='create-settlement']").on("click", async event => {
      event.preventDefault();
      await this._createSettlement(html);
    });

    html.find("[data-action='generate-npc']").on("click", async event => {
      event.preventDefault();
      await this._generateNpc(html);
    });

    html.find("[data-action='generate-merchant']").on("click", async event => {
      event.preventDefault();
      await this._generateMerchant(html);
    });

    html.find("[data-action='generate-container']").on("click", async event => {
      event.preventDefault();
      await this._generateContainer(html);
    });

    html.find("[data-action='generate-rumor']").on("click", async event => {
      event.preventDefault();
      await this._generateRumor(html);
    });

    html.find("[data-action='advance-settlement']").on("click", async event => {
      event.preventDefault();
      await this._advanceSettlementTick(html);
    });

    html.find("[data-action='advance-world']").on("click", async event => {
      event.preventDefault();
      await this._advanceWorldTick();
    });

    html.find("[data-action='restock-merchants']").on("click", async event => {
      event.preventDefault();
      await this._restockAllMerchants();
    });

    html.find("[data-action='restock-selected-merchant']").on("click", async event => {
      event.preventDefault();
      await this._restockSelectedMerchant();
    });

    html.find("[data-action='faction-report']").on("click", async event => {
      event.preventDefault();
      await this._showFactionReport();
    });

    html.find("[data-action='region-crisis']").on("click", async event => {
      event.preventDefault();
      await this._generateRegionCrisis(html);
    });

    html.find("[data-action='run-caravans']").on("click", async event => {
      event.preventDefault();
      await this._runCaravans(html);
    });

    html.find("[data-action='generate-poi']").on("click", async event => {
      event.preventDefault();
      await this._generatePoi(html);
    });

    html.find("[data-action='generate-poi-pack']").on("click", async event => {
      event.preventDefault();
      await this._generatePoiPack(html);
    });

    html.find("[data-action='generate-regional-threat']").on("click", async event => {
      event.preventDefault();
      await this._generateRegionalThreat(html);
    });

    html.find("[data-action='stabilize-region']").on("click", async event => {
      event.preventDefault();
      await this._stabilizeRegion(html);
    });

    html.find("[data-action='evolve-pois']").on("click", async event => {
      event.preventDefault();
      await this._evolvePois(html);
    });

    html.find("[data-action='cleanup-pois']").on("click", async event => {
      event.preventDefault();
      await this._cleanupPois();
    });

    html.find("[data-action='map-pois']").on("click", async event => {
      event.preventDefault();
      await this._assignRegionPoiCoordinates(html);
    });

    html.find("[data-action='generate-session-brief']").on("click", async event => {
      event.preventDefault();
      await this._generateSessionBrief(html);
    });

    html.find("[data-action='generate-first-session-brief']").on("click", async event => {
      event.preventDefault();
      await this._generateFirstSessionBrief(html);
    });

    html.find("[data-action='generate-first-session-runbook']").on("click", async event => {
      event.preventDefault();
      await this._generateFirstSessionRunbook(html);
    });

    html.find("[data-action='generate-first-session-qa']").on("click", async event => {
      event.preventDefault();
      await this._generateFirstSessionQa(html);
    });

    html.find("[data-action='generate-combat-qa']").on("click", async event => {
      event.preventDefault();
      await this._generateCombatQa();
    });

    html.find("[data-action='run-combat-dry-run']").on("click", async event => {
      event.preventDefault();
      await this._runCombatDryRun();
    });

    html.find("[data-action='materialize-combat-test-bench']").on("click", async event => {
      event.preventDefault();
      await this._materializeCombatTestBench();
    });

    html.find("[name='gm-condition-key']").on("change", event => {
      const selected = event.currentTarget.selectedOptions?.[0];
      const defaultValue = selected?.dataset?.defaultValue;
      if (defaultValue !== undefined) {
        html.find("[name='gm-condition-value']").val(defaultValue);
      }
    });

    html.find("[name='gm-resource-key']").on("change", event => {
      const selected = event.currentTarget.selectedOptions?.[0];
      const defaultMode = selected?.dataset?.defaultMode;
      const defaultValue = selected?.dataset?.defaultValue;
      if (defaultMode) html.find("[name='gm-resource-mode']").val(defaultMode);
      if (defaultValue !== undefined) html.find("[name='gm-resource-value']").val(defaultValue);
    });

    html.find("[data-gm-action]").on("click", async event => {
      event.preventDefault();
      await this._runGmControlAction(html, event.currentTarget.dataset.gmAction);
    });

    html.find("[data-action='materialize-first-session']").on("click", async event => {
      event.preventDefault();
      await this._materializeFirstSession(html);
    });

    html.find("[data-action='open-world-map']").on("click", event => {
      event.preventDefault();
      this._openWorldMap();
    });

    html.find("[data-action='set-region-economy']").on("click", async event => {
      event.preventDefault();
      await this._setRegionEconomy(html);
    });

    html.find("[data-action='create-faction']").on("click", async event => {
      event.preventDefault();
      await this._createFaction(html);
    });

    html.find("[data-action='generate-npc-pack']").on("click", async event => {
      event.preventDefault();
      await this._generateNpcPack(html);
    });

    html.find("[data-action='world-status']").on("click", async event => {
      event.preventDefault();
      await this._showWorldStatusReport();
    });

    html.find("[data-action='release-content-readiness']").on("click", async event => {
      event.preventDefault();
      await this._runReleaseContentReadiness();
    });

    html.find("[data-action='release-pack-plan']").on("click", async event => {
      event.preventDefault();
      await this._runReleasePackPlan();
    });

    html.find("[data-action='release-art-cockpit']").on("click", async event => {
      event.preventDefault();
      await this._runReleaseArtCockpit();
    });

    html.find("[data-action='release-session-readiness']").on("click", async event => {
      event.preventDefault();
      await this._runReleaseSessionReadiness();
    });

    html.find("[data-action='release-pipeline-dry-run']").on("click", async event => {
      event.preventDefault();
      await this._runReleasePipelineDryRun();
    });

    html.find("[data-action='release-runtime-smoke']").on("click", async event => {
      event.preventDefault();
      await this._runReleaseRuntimeSmoke();
    });

    html.find("[data-action='situation-roll']").on("click", async event => {
      event.preventDefault();
      await this._rollSituationCockpit(html);
    });

    html.find("[data-action='situation-roll-fresh']").on("click", async event => {
      event.preventDefault();
      await this._rollSituationCockpit(html, { mode: "fresh", forceFreshSeed: true });
    });

    html.find("[data-action='situation-roll-refresh']").on("click", async event => {
      event.preventDefault();
      await this._rollSituationCockpit(html, { mode: "refresh", forceFreshSeed: true });
    });

    html.find("[data-action='situation-load-record']").on("click", async event => {
      event.preventDefault();
      await this._loadSituationRecord(event.currentTarget.dataset.situationId);
    });

    html.find("[data-action='situation-continue-record']").on("click", async event => {
      event.preventDefault();
      await this._continueSituationRecord(html, event.currentTarget.dataset.situationId);
    });

    html.find("[data-action='situation-set-status']").on("click", async event => {
      event.preventDefault();
      await this._setSituationRecordStatus(
        event.currentTarget.dataset.situationId,
        event.currentTarget.dataset.status,
      );
    });

    html.find("[data-action='situation-chat']").on("click", async event => {
      event.preventDefault();
      await this._postSituationCockpitToChat(html);
    });

    html.find("[data-action='situation-prep']").on("click", async event => {
      event.preventDefault();
      await this._persistSituationCockpitPrep(html);
    });

    html.find("[data-action='situation-journal']").on("click", async event => {
      event.preventDefault();
      await this._materializeSituationCockpitJournal(html);
    });

    html.find("[data-action='situation-reroll-stage']").on("click", async event => {
      event.preventDefault();
      await this._rerollSituationStage(html, event.currentTarget.dataset.stage);
    });

    html.find("[data-action='situation-prepare-kit']").on("click", async event => {
      event.preventDefault();
      await this._prepareSituationSceneKit(html);
    });

    html.find("[data-action='situation-send-kit']").on("click", async event => {
      event.preventDefault();
      await this._sendSituationSceneKitToScene(html);
    });

    html.find("[data-action='situation-place-pins']").on("click", async event => {
      event.preventDefault();
      await this._placeSituationSceneKitPins(html);
    });

    html.find("[data-action='situation-place-tokens']").on("click", async event => {
      event.preventDefault();
      await this._placeSituationSceneKitTokens(html);
    });

    html.find("[data-action='situation-validate-kit']").on("click", async event => {
      event.preventDefault();
      await this._validateSituationSceneKit(html);
    });

    html.find("[data-action='situation-finalize-kit']").on("click", async event => {
      event.preventDefault();
      await this._finalizeSituationSceneKit(html);
    });

    html.find("[data-action='situation-play-mode']").on("click", async event => {
      event.preventDefault();
      await this._postSituationScenePlayPanel(html);
    });

    html.find("[data-action='situation-launch-encounter']").on("click", async event => {
      event.preventDefault();
      await this._launchSituationSceneEncounter(html);
    });

    html.find("[data-action='situation-materialize-quest']").on("click", async event => {
      event.preventDefault();
      await this._materializeSituationQuestDraft(html);
    });

    html.find("[data-action='situation-materialize-rumor']").on("click", async event => {
      event.preventDefault();
      await this._materializeSituationRumor(html);
    });

    html.find("[data-action='situation-materialize-container']").on("click", async event => {
      event.preventDefault();
      await this._materializeSituationLootContainer(html);
    });

    html.find("[data-action='situation-materialize-npcs']").on("click", async event => {
      event.preventDefault();
      await this._materializeSituationNpcDrafts(html);
    });

    html.find("[data-action='situation-materialize-encounter-lite']").on("click", async event => {
      event.preventDefault();
      await this._materializeSituationEncounterLite(html);
    });

    html.find("[data-action='situation-open-map']").on("click", event => {
      event.preventDefault();
      this._openSituationCockpitMap();
    });

    html.find("[data-action='situation-scene-transitions']").on("click", async event => {
      event.preventDefault();
      await this._postActiveSceneTransitionPanel();
    });

    html.find("[data-action='release-qa-report']").on("click", async event => {
      event.preventDefault();
      await this._showReleaseQaReport();
    });

    html.find("[data-action='release-reset-manual']").on("click", async event => {
      event.preventDefault();
      await this._resetReleaseManualSections();
    });

    html.find("[data-action='release-open-tool']").on("click", event => {
      event.preventDefault();
      this._openReleaseTool(event.currentTarget.dataset.tool);
    });

    html.find("[data-action='release-set-manual']").on("click", async event => {
      event.preventDefault();
      await this._setReleaseManualSectionStatus(
        event.currentTarget.dataset.manualId,
        event.currentTarget.dataset.status,
      );
    });

    html.find("[data-action='release-toggle-manual']").on("change", async event => {
      await this._toggleReleaseManualSection(event.currentTarget.dataset.manualId);
    });
  }
  async _createFaction(html) {
    const name       = html.find("[name='faction-name']").val().trim() || `Фракция ${randInt(1,99)}`;
    const type       = html.find("[name='faction-type']").val() || "guild";
    const power      = Number(html.find("[name='faction-power']").val() || 5);
    const wealth     = Number(html.find("[name='faction-wealth']").val() || 5);
    const settlement = html.find("[name='faction-settlement']").val() || "";
    const ICONS = { guild:"🔨", military:"⚔", religious:"✝", criminal:"🌑", noble:"👑", merchant:"🏪" };
    await Actor.create({
      name: `${ICONS[type] ?? "⚔"} ${name}`, type: "faction",
      system: { power, wealth, info: { type, baseSettlement: settlement } }
    });
    ui.notifications.info(`Фракция "${name}" создана`);
  }

  async _generateNpcPack(html) {
    for (let i = 0; i < 5; i++) {
      await this._generateNpc(html);
      await new Promise(r => setTimeout(r, 150));
    }
    ui.notifications.info("Создано 5 NPC");
  }

  async _cleanupPois() {
    const removed = await cleanupCollapsedPois();
    ui.notifications.info(`Убрано ${removed.length} рухнувших POI`);
  }

  async _setRegionEconomy(html) {
    const region  = html.find("[name='region-select']").val();
    const economy = html.find("[name='region-economy']").val() || "normal";
    const { setSettlementEconomy } = await import("./services/merchant-service.mjs");
    const list = getSettlements().filter(s =>
      (s.system.info?.region || "Iron Hills") === region
    );
    for (const s of list) {
      await setSettlementEconomy(s.id, economy);
      await s.update({ "system.economy.economyStatus": economy });
    }
    ui.notifications.info(`Экономика "${region}" → ${economy} (${list.length} поселений)`);
  }

}

function injectOrRetargetWorldToolsButton(html) {
  const footer = html.find(".directory-footer");
  if (!footer.length) return;

  let button = footer.find(".iron-hills-tools-button");
  if (!button.length) {
    button = $(`
      <button type="button" class="iron-hills-tools-button">
        <i class="fas fa-hammer"></i> Iron Hills Tools
      </button>
    `);
    footer.append(button);
  }

  button.off("click").on("click", () => {
    new IronHillsWorldToolsV5().render(true);
  });
}

function bindSceneTransitionChatActions(html) {
  html.find("[data-ih-scene-transition-action]")
    .off("click.ironHillsSceneTransition")
    .on("click.ironHillsSceneTransition", async event => {
      event.preventDefault();
      if (!game.user?.isGM) {
        ui.notifications?.warn?.("Only a GM can use scene transition actions.");
        return;
      }
      const button = event.currentTarget;
      const action = button.dataset.ihSceneTransitionAction ?? "";
      const { scene, transition } = sceneTransitionByIds(button.dataset.sceneId, button.dataset.noteId);
      if (!transition) {
        ui.notifications?.warn?.("Scene transition pin is unavailable.");
        return;
      }
      try {
        if (action === "focus-note") {
          const focused = focusSituationSceneTransitionNote(scene, transition);
          ui.notifications?.info?.(focused ? `Focused transition: ${transition.label}` : "Transition focus is unavailable.");
          return;
        }
        if (action === "open-map") {
          openSituationSceneTransitionMap(transition);
          return;
        }
        if (action === "follow-up") {
          const result = await createSituationFollowUpFromSceneTransition(transition);
          await ChatMessage.create({
            content: buildCombatChatCard({
              title: "Scene transition follow-up",
              subtitle: transition.label,
              icon: "GM",
              status: `Active: ${result.situation.title}`,
              statusClass: result.situation.tone || "is-active",
              rows: [
                ["From", result.previousRecord?.title ?? transition.title ?? "-"],
                ["To", `${result.situation.map?.label ?? "-"} / ${result.situation.title ?? "-"}`],
                ["Route", `${transition.navAction} -> ${situationWorldMapLevelLabel(transition.navLevel)}`],
                ["Seed", result.situation.seed ?? "-"],
              ],
              bodyHtml: buildSituationMaterializeChatBody(buildSituationMaterializeResult("Follow-up situation created", [
                situationRow("Previous", result.previousRecord?.title ?? "scene transition", result.previousRecord ? "marked resolved" : "no linked active record", result.previousRecord ? "is-safe" : "is-warn"),
                situationRow("Next", result.situation.title, `${result.situation.map?.label ?? "map pool"} / ${result.situation.map?.level ?? result.options.level}`, "is-active"),
                situationRow("Open", "World Map / GM Tools", "Use the map or GM Situation Cockpit to prepare the next scene kit.", "is-road"),
              ])),
              className: "ih-scene-transition-card",
            }),
            whisper: ChatMessage.getWhisperRecipients("GM"),
          });
          openSituationSceneTransitionMap({
            ...transition,
            navLevel: result.situation.map?.level || result.options.level,
            mapLabel: result.situation.map?.label || transition.mapLabel,
            title: result.situation.title || transition.title,
          });
          ui.notifications?.info?.(`Follow-up situation created: ${result.situation.title}`);
        }
      } catch (error) {
        console.error("Iron Hills | Scene transition action failed", error);
        ui.notifications?.error?.(`Scene transition failed: ${error.message ?? error}`);
      }
    });
}

function bindSceneKitPlayChatActions(html) {
  html.find("[data-ih-scene-play-action]")
    .off("click.ironHillsScenePlay")
    .on("click.ironHillsScenePlay", async event => {
      event.preventDefault();
      if (!game.user?.isGM) {
        ui.notifications?.warn?.("Only a GM can use scene play mode actions.");
        return;
      }
      const button = event.currentTarget;
      const action = button.dataset.ihScenePlayAction ?? "";
      const snapshot = sceneKitPlayByIds(
        button.dataset.sceneId,
        button.dataset.situationId,
        button.dataset.situationSeed,
      );
      try {
        if (action === "activate-scene") {
          if (!snapshot.scene?.activate) {
            ui.notifications?.warn?.("Scene is unavailable.");
            return;
          }
          await snapshot.scene.activate();
          ui.notifications?.info?.(`Activated scene: ${snapshot.scene.name}`);
          return;
        }
        if (action === "launch-encounter") {
          await launchSceneKitEncounter(snapshot.scene, snapshot.situation, { openPanels: true, post: true });
          return;
        }
        if (action === "open-combat-manager") {
          game.ironHills?.openCombatManager?.();
          return;
        }
        if (action === "open-combat-director") {
          game.ironHills?.openCombatDirector?.();
          return;
        }
        if (action === "open-runbook") {
          openSceneKitPlayRunbook(snapshot);
          return;
        }
        if (action === "open-map") {
          openSceneKitPlayMap(snapshot);
          return;
        }
        if (action === "post-transitions") {
          await postSituationSceneTransitionPanel(snapshot.scene);
          return;
        }
        if (action === "post-qa") {
          await postSceneKitQaReport(snapshot.scene, snapshot.situation);
          return;
        }
        if (action === "post-final") {
          if (!snapshot.situation?.hasSituation) {
            ui.notifications?.warn?.("Linked GM situation is unavailable for final packet refresh.");
            return;
          }
          await finalizeSituationSceneKit(snapshot.situation, {
            scene: snapshot.scene,
            post: true,
            updateScene: true,
          });
          return;
        }
        ui.notifications?.warn?.(`Unknown scene play action: ${action}`);
      } catch (error) {
        console.error("Iron Hills | Scene play action failed", error);
        ui.notifications?.error?.(`Scene play action failed: ${error.message ?? error}`);
      }
    });
}

Hooks.once("ready", () => {
  game.ironHills = game.ironHills || {};
  game.ironHills.openWorldTools = () => new IronHillsWorldToolsV5().render(true);
  game.ironHills.materializeFirstSession = materializeFirstSessionContent;
  game.ironHills.firstSessionQa = buildFirstSessionQaSnapshot;
  game.ironHills.combatQa = buildCombatQaSnapshot;
  game.ironHills.combatDryRun = (report = null) => buildCombatDryRunSnapshot({
    combatQa: buildCombatQaSnapshot(),
    report: report ?? getReleaseQaState().combatDryRunReport ?? null,
  });
  game.ironHills.combatTestBench = buildCombatTestBenchSnapshot;
  game.ironHills.materializeCombatTestBench = materializeCombatTestBench;
  game.ironHills.gmControl = buildGmControlSnapshot;
  game.ironHills.runGmControlAction = runGmControlAction;
  game.ironHills.getSceneTransitions = (scene = globalThis.canvas?.scene ?? null) => situationSceneTransitionRows(scene);
  game.ironHills.postSceneTransitions = (scene = globalThis.canvas?.scene ?? null) => postSituationSceneTransitionPanel(scene);
  game.ironHills.createSceneTransitionFollowUp = createSituationFollowUpFromSceneTransition;
  game.ironHills.validateSceneKit = (scene = globalThis.canvas?.scene ?? null, situation = null) => buildSceneKitQaSnapshot(scene, situation);
  game.ironHills.postSceneKitQa = (scene = globalThis.canvas?.scene ?? null, situation = null) => postSceneKitQaReport(scene, situation);
  game.ironHills.finalizeSceneKit = (situation = {}, scene = globalThis.canvas?.scene ?? null, options = {}) => finalizeSituationSceneKit(situation, {
    scene,
    post: options.post !== false,
    updateScene: options.updateScene !== false,
  });
  game.ironHills.postScenePlayMode = (scene = globalThis.canvas?.scene ?? null, situation = null) => postSceneKitPlayPanel(scene, situation);
  game.ironHills.previewSceneEncounter = (scene = globalThis.canvas?.scene ?? null, situation = null) => buildSceneKitEncounterSnapshot(scene, situation);
  game.ironHills.launchSceneEncounter = (scene = globalThis.canvas?.scene ?? null, situation = null, options = {}) => launchSceneKitEncounter(scene, situation, options);
});

Hooks.on("renderActorDirectory", (app, html) => {
  injectOrRetargetWorldToolsButton(html);
});

Hooks.on("renderChatMessage", (_message, html) => {
  bindSceneTransitionChatActions(html);
  bindSceneKitPlayChatActions(html);
});
/**
 * Обновить system.price у всех предметов всех торговцев
 * из system.value (для уже созданных торговцев).
 * Запускать один раз из консоли: game.ironHills.fixMerchantPrices()
 */
export async function fixMerchantPrices() {
  let fixed = 0;
  for (const actor of game.actors ?? []) {
    if (actor.type !== "merchant") continue;
    for (const item of actor.items ?? []) {
      const val   = Number(item.system?.value ?? 0);
      const price = Number(item.system?.price ?? 0);
      if (val > 0 && price <= 0) {
        await item.update({ "system.price": val });
        fixed++;
      }
    }
  }
  ui.notifications.info(`Обновлено цен: ${fixed}`);
  return fixed;
}

// ============================================================
// ВЛИЯНИЕ ИГРОКОВ НА МИР — вызывается после квестов/событий
// ============================================================

/**
 * Применить последствие действия игроков к поселению.
 * @param {string} settlementName  — название поселения
 * @param {object} impact — { prosperity, danger, supply, tradeBalance }
 * @param {string} reason — описание для лога
 */
export async function applyWorldImpact(settlementName, impact = {}, reason = "") {
  const settlement = findSettlementByName(settlementName);
  if (!settlement) {
    console.warn(`Iron Hills | applyWorldImpact: settlement "${settlementName}" not found`);
    return;
  }

  const updates = {};
  if (impact.prosperity !== undefined)
    updates["system.info.prosperity"] = clamp(
      Number(settlement.system.info?.prosperity ?? 5) + impact.prosperity, 0, 10
    );
  if (impact.danger !== undefined)
    updates["system.info.danger"] = clamp(
      Number(settlement.system.info?.danger ?? 5) + impact.danger, 0, 10
    );
  if (impact.supply !== undefined)
    updates["system.info.supply"] = clamp(
      Number(settlement.system.info?.supply ?? 5) + impact.supply, 0, 10
    );

  await settlement.update(updates);

  // Пересчитываем экономику сразу
  const p = Number(settlement.system.info?.prosperity ?? 5) + (impact.prosperity ?? 0);
  const d = Number(settlement.system.info?.danger     ?? 5) + (impact.danger ?? 0);
  const s = Number(settlement.system.info?.supply     ?? 5) + (impact.supply ?? 0);
  const newStatus = computeEconomyStatus(
    clamp(p,0,10), clamp(d,0,10), clamp(s,0,10),
    settlement.system.regionSim?.activeCrisis ?? ""
  );

  await settlement.update({ "system.economy.economyStatus": newStatus });
  const { setSettlementEconomy } = await import("./services/merchant-service.mjs");
  await setSettlementEconomy(settlement.id, newStatus).catch(() => {});

  // Пополняем торговцев поселения если supply вырос
  if ((impact.supply ?? 0) > 0) {
    const merchants = getMerchants().filter(m =>
      m.system.info?.settlement === settlementName
    );
    for (const m of merchants) await restockMerchant(m, settlement);
  }

  // Лог в чат
  const ECON = { boom:"📈 Расцвет", normal:"⚖ Норма", shortage:"📉 Дефицит",
                 crisis:"🔥 Кризис", war:"⚔ Война", festival:"🎉 Праздник", plague:"☠ Чума" };
  const parts = [];
  if (impact.prosperity) parts.push(`Благ. ${impact.prosperity > 0 ? "+" : ""}${impact.prosperity}`);
  if (impact.danger)     parts.push(`Опасн. ${impact.danger > 0 ? "+" : ""}${impact.danger}`);
  if (impact.supply)     parts.push(`Снаб. ${impact.supply > 0 ? "+" : ""}${impact.supply}`);

  await ChatMessage.create({
    content: buildCombatChatCard({
      title: "Последствия в мире",
      icon: "🌍",
      rows: [
        ["Поселение", settlementName],
        ["Последствия", parts.join(", ") || "без числовых изменений"],
        ["Экономика", ECON[newStatus] ?? newStatus],
      ],
      notices: reason ? [["Причина", reason]] : [],
    })
  });
}

// Быстрые хелперы для типовых событий
export const WorldEvents = {
  // Игроки зачистили бандитский лагерь поблизости
  clearedBanditCamp: (settlement, tier = 1) =>
    applyWorldImpact(settlement, { danger: -tier, supply: tier > 2 ? 1 : 0 },
      "Бандитский лагерь уничтожен"),

  // Игроки ограбили торговца/склад
  robbedMerchant: (settlement) =>
    applyWorldImpact(settlement, { supply: -1, prosperity: -1 },
      "Торговец ограблен — товары исчезли"),

  // Игроки сопроводили/защитили торговый караван
  escortedCaravan: (settlement) =>
    applyWorldImpact(settlement, { supply: 2, tradeBalance: 1 },
      "Успешная торговая экспедиция"),

  // Игроки помогли бандитам/злодеям
  aidedBandits: (settlement) =>
    applyWorldImpact(settlement, { danger: 2, supply: -1 },
      "Банда усилилась — деревня страдает"),

  // Игроки вылечили болезнь / помогли жителям
  helpedVillagers: (settlement) =>
    applyWorldImpact(settlement, { prosperity: 1, danger: -1 },
      "Жители получили помощь"),

  // Игроки уничтожили POI угрозу
  destroyedThreat: (settlement, tier = 1) =>
    applyWorldImpact(settlement, { danger: -Math.ceil(tier / 2), prosperity: 1 },
      "Угроза региона устранена"),
};
