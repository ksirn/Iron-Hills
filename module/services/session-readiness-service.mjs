import {
  DEFAULT_REGIONS,
  IRON_HILLS_POI,
  WORLD_MAP_ASSETS,
  WORLD_MAP_LEVEL_ORDER,
  WORLD_MAP_LEVELS,
} from "../constants/world-map.mjs";
import {
  MONSTER_BESTIARY,
  assertMonsterLootBindings,
  monsterBestiaryKeysByTier,
} from "../constants/monster-bestiary.mjs";
import {
  MONSTER_HARVEST_DROP_POOLS,
  listMonsterLootPoolKeys,
} from "../constants/monster-loot-pools.mjs";
import {
  NPC_PACK_ACTORS,
  NPC_SPECIALIZATIONS,
  NPC_TIER_BANDS,
  citizenRemainsLootKey,
  pettyPickpocketLootKey,
  resolveNpcTierBandIdForTier,
} from "../constants/npc-profiles.mjs";
import {
  WORLD_CONTENT_CONTAINER_THEMES,
  WORLD_CONTENT_MERCHANT_LOOT_SPECIALTIES,
  WORLD_CONTENT_NPC_ROLES,
  WORLD_CONTENT_POI_THEMES,
  WORLD_CONTENT_POI_TYPES,
  buildNpcStartingInventoryItems,
  buildPoiLootItems,
  generateQuestForSettlement,
  getContextualMerchantStock,
  makeSettlementEvent,
  makeSettlementRumor,
  randomContainerLoot,
} from "./world-content-service.mjs";
import { generateTravelEvents } from "./travel-events-service.mjs";
import {
  buildWorldMapSituation,
  getWorldMapSituationPoolStats,
} from "./world-map-situation-generator-service.mjs";

const TIERS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const SAMPLE_TIERS = Object.freeze([1, 3, 6, 10]);

const REQUIRED_MAP_ARCHETYPES = Object.freeze([
  {
    id: "global-atlas",
    level: "global",
    label: "Global atlas",
    keywords: ["global", "atlas"],
    min: 1,
    severity: "warn",
  },
  {
    id: "region-iron-hills",
    level: "region",
    label: "Iron Hills region",
    keywords: ["iron-hills-region", "iron_hills_region", "region-map"],
    min: 1,
    severity: "block",
  },
  {
    id: "local-city",
    level: "local",
    label: "City / market hub",
    keywords: ["city", "rivergate", "market", "town"],
    min: 1,
    severity: "warn",
  },
  {
    id: "local-village",
    level: "local",
    label: "Village",
    keywords: ["village", "ashford", "hamlet"],
    min: 1,
    severity: "warn",
  },
  {
    id: "local-mining-settlement",
    level: "local",
    label: "Mining settlement",
    keywords: ["mine", "mining", "koperny", "settlement"],
    min: 1,
    severity: "warn",
  },
  {
    id: "encounter-house",
    level: "encounter",
    label: "House / interior",
    keywords: ["house", "home", "interior", "room"],
    min: 1,
    severity: "warn",
  },
  {
    id: "encounter-market-square",
    level: "encounter",
    label: "Market square",
    keywords: ["market", "square", "bazaar"],
    min: 1,
    severity: "warn",
  },
  {
    id: "encounter-field",
    level: "encounter",
    label: "Field encounter",
    keywords: ["field", "farm", "plains", "encounter"],
    min: 1,
    severity: "warn",
  },
  {
    id: "encounter-forest",
    level: "encounter",
    label: "Forest encounter",
    keywords: ["forest", "woods", "glade"],
    min: 1,
    severity: "warn",
  },
  {
    id: "encounter-mine",
    level: "encounter",
    label: "Mine / cave encounter",
    keywords: ["mine", "cave", "shaft"],
    min: 1,
    severity: "warn",
  },
]);

const REQUIRED_GM_APIS = Object.freeze([
  "openWorldTools",
  "openWorldMap",
  "openWorldMapLevel",
  "openCombatHud",
  "openCombatDirector",
  "openCombatManager",
  "gmControl",
  "runGmControlAction",
  "contentArtCockpit",
  "checkContentReadiness",
  "prepareContentPatch",
  "runRuntimeSmoke",
  "sessionReadiness",
  "getCompendiumBuildPlan",
]);

const REQUIRED_GM_ACTIONS = Object.freeze([
  "release-content-readiness",
  "release-session-readiness",
  "release-art-cockpit",
  "release-pack-plan",
  "release-pipeline-dry-run",
  "release-runtime-smoke",
  "release-qa-report",
  "gm-restore-all",
  "gm-apply-resource",
  "gm-damage-body",
  "gm-heal-body",
  "gm-open-combat-director",
]);

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pct(part, total) {
  const t = Math.max(0, Number(total) || 0);
  if (!t) return 0;
  return Math.round((Math.max(0, Number(part) || 0) / t) * 100);
}

function toneForStatus(status = "todo") {
  if (status === "ok") return "is-good";
  if (status === "warn") return "is-warn";
  if (status === "block" || status === "failed") return "is-danger";
  return "is-todo";
}

function severityRank(status = "ok") {
  return { ok: 0, todo: 1, warn: 2, block: 3, failed: 3 }[status] ?? 1;
}

function worstStatus(statuses = []) {
  let worst = "ok";
  for (const status of statuses) {
    if (severityRank(status) > severityRank(worst)) worst = status;
  }
  return worst;
}

function rowStatus(ok, warn = false, blocker = false) {
  if (blocker) return "block";
  if (!ok) return "warn";
  return warn ? "warn" : "ok";
}

function decorateRow(row) {
  const status = row.status ?? "todo";
  return {
    ...row,
    status,
    tone: row.tone ?? toneForStatus(status),
  };
}

function safeCall(label, fn, fallback = null) {
  try {
    return { ok: true, label, value: fn() };
  } catch (error) {
    return {
      ok: false,
      label,
      error: error?.message ?? String(error),
      value: fallback,
    };
  }
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function createSampleSettlement(options = {}) {
  const tier = Math.max(1, Math.min(10, num(options.tier, 2)));
  return {
    id: `sample_settlement_t${tier}`,
    name: options.name ?? "Session Readiness Settlement",
    type: "settlement",
    system: {
      info: {
        tier,
        region: "Iron Hills",
        prosperity: options.prosperity ?? 6,
        danger: options.danger ?? Math.min(10, 3 + tier),
        supply: options.supply ?? 6,
        controllingFaction: options.faction ?? "frontier",
      },
      economy: {
        economyStatus: options.economyStatus ?? "normal",
        tradeBalance: 0,
        caravanTraffic: 1,
      },
      regionSim: {
        activeCrisis: options.crisis ?? "",
        stability: 5,
        militiaPower: 4,
        tradeBalance: 0,
        caravanTraffic: 1,
      },
      history: {
        rumors: [],
        regionalEvents: [],
      },
    },
  };
}

function assetEntries() {
  return Object.entries(WORLD_MAP_ASSETS ?? {}).map(([key, value]) => ({
    key,
    path: String(value ?? ""),
    searchable: `${key} ${String(value ?? "")}`.toLowerCase(),
  }));
}

function countMatchingAssets(assets, keywords = []) {
  return assets.filter(asset => keywords.some(keyword => asset.searchable.includes(String(keyword).toLowerCase()))).length;
}

function terrainSummary() {
  const tiles = Object.values(DEFAULT_REGIONS ?? {}).flatMap(region => safeArray(region.tiles));
  const counts = {};
  for (const tile of tiles) {
    const terrain = tile?.terrain ?? "unknown";
    counts[terrain] = (counts[terrain] ?? 0) + 1;
  }
  return counts;
}

function buildMapReadiness() {
  const assets = assetEntries();
  const terrainCounts = terrainSummary();
  const poiEntries = Object.entries(IRON_HILLS_POI ?? {});
  const poiTypeCounts = {};
  for (const [, poi] of poiEntries) {
    const type = poi?.type ?? "unknown";
    poiTypeCounts[type] = (poiTypeCounts[type] ?? 0) + 1;
  }

  const levelRows = WORLD_MAP_LEVEL_ORDER.map(levelId => {
    const level = WORLD_MAP_LEVELS[levelId] ?? {};
    const archetypes = REQUIRED_MAP_ARCHETYPES.filter(def => def.level === levelId);
    const registered = assets.filter(asset => asset.searchable.includes(levelId)).length;
    const missing = archetypes.filter(def => countMatchingAssets(assets, def.keywords) < def.min);
    const requiredCount = archetypes.length;
    const met = requiredCount - missing.length;
    const hasModel = Boolean(level.id);
    const status = !hasModel ? "block" : missing.some(def => def.severity === "block") ? "block" : missing.length ? "warn" : "ok";
    return decorateRow({
      id: levelId,
      label: level.shortLabel ?? level.label ?? levelId,
      status,
      model: hasModel ? "yes" : "missing",
      registeredAssets: registered,
      required: requiredCount,
      covered: met,
      coveragePct: pct(met, Math.max(1, requiredCount)),
      note: missing.length
        ? `missing: ${missing.map(def => def.label).join(", ")}`
        : (requiredCount ? "required map archetypes are registered" : "navigation level exists"),
    });
  });

  const archetypeRows = REQUIRED_MAP_ARCHETYPES.map(def => {
    const found = countMatchingAssets(assets, def.keywords);
    const status = found >= def.min ? "ok" : def.severity;
    return decorateRow({
      id: def.id,
      level: def.level,
      label: def.label,
      status,
      found,
      required: def.min,
      note: found >= def.min
        ? "registered in WORLD_MAP_ASSETS"
        : `needs ${def.level} map asset usable by World Map / scenes`,
    });
  });

  const poiRows = Object.entries(poiTypeCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, count]) => decorateRow({
      id: type,
      label: type,
      status: count > 0 ? "ok" : "warn",
      count,
      note: `${count} seeded POI`,
    }));

  const missingArchetypes = archetypeRows.filter(row => row.status !== "ok");
  const blocking = missingArchetypes.filter(row => row.status === "block").length;
  const warnings = missingArchetypes.filter(row => row.status === "warn").length;
  const status = blocking > 0 ? "block" : warnings > 0 ? "warn" : "ok";

  return {
    ok: status === "ok",
    status,
    summary: {
      mapLevels: levelRows.length,
      registeredAssets: assets.length,
      requiredArchetypes: REQUIRED_MAP_ARCHETYPES.length,
      missingArchetypes: missingArchetypes.length,
      blockingMissingArchetypes: blocking,
      warningMissingArchetypes: warnings,
      poi: poiEntries.length,
      terrainKinds: Object.keys(terrainCounts).length,
    },
    assets,
    terrainCounts,
    poiTypeCounts,
    levelRows,
    archetypeRows,
    poiRows,
  };
}

function buildMonsterReadiness() {
  safeCall("assertMonsterLootBindings", () => assertMonsterLootBindings(), null);
  const lootPoolKeys = new Set(listMonsterLootPoolKeys());
  const lootErrors = [];
  const rows = TIERS.map(tier => {
    const ids = monsterBestiaryKeysByTier(tier);
    const monsters = ids.map(id => MONSTER_BESTIARY[id]).filter(Boolean);
    const missingLoot = monsters.filter(monster => !monster.lootPool || !lootPoolKeys.has(monster.lootPool));
    const emptyLoot = monsters.filter(monster => !safeArray(MONSTER_HARVEST_DROP_POOLS[monster.lootPool]).length);
    for (const monster of missingLoot) {
      lootErrors.push({
        id: monster.id,
        tier,
        lootPool: monster.lootPool ?? "",
        issue: "missing loot pool",
      });
    }
    for (const monster of emptyLoot) {
      lootErrors.push({
        id: monster.id,
        tier,
        lootPool: monster.lootPool ?? "",
        issue: "empty loot pool",
      });
    }
    const status = ids.length < 3 || missingLoot.length || emptyLoot.length ? "block" : "ok";
    return decorateRow({
      id: `monster-tier-${tier}`,
      label: `Monster tier ${tier}`,
      status,
      tier,
      count: ids.length,
      lootPools: unique(monsters.map(monster => monster.lootPool)).length,
      note: status === "ok"
        ? `${ids.length} monsters with harvest loot`
        : `monsters=${ids.length}, missing loot=${missingLoot.length}, empty loot=${emptyLoot.length}`,
    });
  });

  const status = worstStatus(rows.map(row => row.status));
  return {
    ok: status === "ok",
    status,
    summary: {
      tiers: TIERS.length,
      monsters: Object.keys(MONSTER_BESTIARY ?? {}).length,
      lootPools: lootPoolKeys.size,
      lootErrors: lootErrors.length,
      blockerRows: rows.filter(row => row.status === "block").length,
    },
    rows,
    lootErrors,
  };
}

function buildNpcReadiness() {
  const roles = Object.keys(NPC_SPECIALIZATIONS ?? {});
  const packActors = Object.values(NPC_PACK_ACTORS ?? {});
  const exactTierRows = TIERS.map(tier => {
    const bandId = resolveNpcTierBandIdForTier(tier);
    const roleFailures = [];
    for (const role of roles) {
      const result = safeCall(`${role}:${tier}`, () => buildNpcStartingInventoryItems(role, tier), []);
      if (!result.ok || !safeArray(result.value).length) roleFailures.push(role);
    }
    const citizenLoot = citizenRemainsLootKey(tier);
    const pickpocketLoot = pettyPickpocketLootKey(tier);
    const status = roleFailures.length ? "block" : "ok";
    return decorateRow({
      id: `npc-tier-${tier}`,
      label: `NPC tier ${tier}`,
      status,
      tier,
      bandId,
      roles: roles.length,
      inventoryCoverage: roles.length - roleFailures.length,
      citizenLoot,
      pickpocketLoot,
      note: status === "ok"
        ? `${roles.length} roles generate starting inventory`
        : `inventory missing for: ${roleFailures.join(", ")}`,
    });
  });

  const bandRows = NPC_TIER_BANDS.map(band => {
    const count = packActors.filter(actor => actor.tierRange === band.tierRange).length;
    return decorateRow({
      id: band.id,
      label: band.label,
      status: count >= roles.length ? "ok" : "warn",
      count,
      roles: roles.length,
      note: count >= roles.length
        ? "all role archetypes exist for this band"
        : `pack actors missing: ${roles.length - count}`,
    });
  });

  const materializedExactTiers = unique(packActors.map(actor => Number(actor.tier))).length;
  const status = worstStatus([...exactTierRows, ...bandRows].map(row => row.status));
  const exactTierMaterializationStatus = materializedExactTiers >= TIERS.length ? "ok" : "warn";
  return {
    ok: status === "ok" && exactTierMaterializationStatus === "ok",
    status: worstStatus([status, exactTierMaterializationStatus]),
    summary: {
      roles: roles.length,
      tierBands: NPC_TIER_BANDS.length,
      packActors: packActors.length,
      materializedExactTiers,
      generatorTierRowsOk: exactTierRows.filter(row => row.status === "ok").length,
      note: materializedExactTiers >= TIERS.length
        ? "pack actors cover every exact tier"
        : "pack actors are banded; generator covers exact tiers at runtime",
    },
    exactTierRows,
    bandRows,
  };
}

function countItems(result) {
  return safeArray(result?.value ?? result).filter(Boolean).length;
}

function buildGeneratorReadiness() {
  const rows = [];

  for (const [theme] of Object.entries(WORLD_CONTENT_CONTAINER_THEMES ?? {})) {
    const failures = [];
    let totalItems = 0;
    for (const tier of SAMPLE_TIERS) {
      const result = safeCall(`container:${theme}:${tier}`, () => randomContainerLoot(theme, tier), []);
      const count = countItems(result);
      totalItems += count;
      if (!result.ok || count <= 0) failures.push(`t${tier}`);
    }
    rows.push(decorateRow({
      id: `container-${theme}`,
      family: "container",
      label: `Container: ${theme}`,
      status: failures.length ? "block" : "ok",
      samples: SAMPLE_TIERS.length,
      totalItems,
      note: failures.length ? `empty/error samples: ${failures.join(", ")}` : "loot generated for sample tiers",
    }));
  }

  for (const [theme] of Object.entries(WORLD_CONTENT_POI_THEMES ?? {})) {
    const failures = [];
    let totalItems = 0;
    for (const tier of SAMPLE_TIERS) {
      const result = safeCall(`poi-loot:${theme}:${tier}`, () => buildPoiLootItems(theme, tier), []);
      const count = countItems(result);
      totalItems += count;
      if (!result.ok || count <= 0) failures.push(`t${tier}`);
    }
    rows.push(decorateRow({
      id: `poi-loot-${theme}`,
      family: "poi-loot",
      label: `POI loot: ${theme}`,
      status: failures.length ? "warn" : "ok",
      samples: SAMPLE_TIERS.length,
      totalItems,
      note: failures.length
        ? `theme has no loot sample at: ${failures.join(", ")}`
        : "POI loot generated for sample tiers",
    }));
  }

  for (const [role] of Object.entries(WORLD_CONTENT_NPC_ROLES ?? {})) {
    const failures = [];
    let totalItems = 0;
    for (const tier of SAMPLE_TIERS) {
      const result = safeCall(`npc-inventory:${role}:${tier}`, () => buildNpcStartingInventoryItems(role, tier), []);
      const count = countItems(result);
      totalItems += count;
      if (!result.ok || count <= 0) failures.push(`t${tier}`);
    }
    rows.push(decorateRow({
      id: `npc-inventory-${role}`,
      family: "npc-inventory",
      label: `NPC inventory: ${role}`,
      status: failures.length ? "block" : "ok",
      samples: SAMPLE_TIERS.length,
      totalItems,
      note: failures.length
        ? `starting inventory missing at: ${failures.join(", ")}`
        : "starting equipment/carry inventory generated",
    }));
  }

  for (const [specialty] of Object.entries(WORLD_CONTENT_MERCHANT_LOOT_SPECIALTIES ?? {})) {
    const failures = [];
    let totalItems = 0;
    for (const tier of SAMPLE_TIERS) {
      const settlement = createSampleSettlement({ tier, supply: 7, prosperity: 7, danger: 4 });
      const result = safeCall(`merchant:${specialty}:${tier}`, () => getContextualMerchantStock(settlement, specialty, tier), []);
      const count = countItems(result);
      totalItems += count;
      if (!result.ok || count <= 0) failures.push(`t${tier}`);
    }
    rows.push(decorateRow({
      id: `merchant-${specialty}`,
      family: "merchant-stock",
      label: `Merchant stock: ${specialty}`,
      status: failures.length ? "block" : "ok",
      samples: SAMPLE_TIERS.length,
      totalItems,
      note: failures.length
        ? `stock missing at: ${failures.join(", ")}`
        : "contextual stock generated",
    }));
  }

  const questSamples = [
    createSampleSettlement({ tier: 1, crisis: "" }),
    createSampleSettlement({ tier: 3, crisis: "Р’СЃРїР»РµСЃРє Р±Р°РЅРґРёС‚РёР·РјР°", danger: 8 }),
    createSampleSettlement({ tier: 5, crisis: "РўРѕСЂРіРѕРІС‹Р№ Р±СѓРј", prosperity: 8 }),
    createSampleSettlement({ tier: 8, crisis: "Р Р°Р·СЂСѓС€РµРЅРЅС‹Рµ РґРѕСЂРѕРіРё", danger: 7 }),
  ];
  const questFailures = [];
  for (const settlement of questSamples) {
    const result = safeCall(`quest:${settlement.id}`, () => generateQuestForSettlement(settlement), null);
    if (!result.ok || !result.value?.title || !result.value?.description) questFailures.push(settlement.id);
  }
  rows.push(decorateRow({
    id: "settlement-quests",
    family: "quest",
    label: "Settlement quests",
    status: questFailures.length ? "block" : "ok",
    samples: questSamples.length,
    totalItems: questSamples.length - questFailures.length,
    note: questFailures.length
      ? `quest generation failed for: ${questFailures.join(", ")}`
      : "base and crisis quests generate",
  }));

  const rumorFailures = [];
  for (const settlement of questSamples) {
    const rumor = safeCall(`rumor:${settlement.id}`, () => makeSettlementRumor(settlement), "");
    const event = safeCall(`event:${settlement.id}`, () => makeSettlementEvent(settlement), "");
    if (!rumor.ok || !String(rumor.value ?? "").trim()) rumorFailures.push(`rumor:${settlement.id}`);
    if (!event.ok || !String(event.value ?? "").trim()) rumorFailures.push(`event:${settlement.id}`);
  }
  rows.push(decorateRow({
    id: "settlement-rumors-events",
    family: "rumor-event",
    label: "Settlement rumors/events",
    status: rumorFailures.length ? "block" : "ok",
    samples: questSamples.length * 2,
    totalItems: questSamples.length * 2 - rumorFailures.length,
    note: rumorFailures.length
      ? `failed samples: ${rumorFailures.join(", ")}`
      : "rumors and weekly events generate",
  }));

  const travelPath = [
    { col: 0, row: 0, terrain: "road" },
    { col: 1, row: 0, terrain: "forest" },
    { col: 2, row: 0, terrain: "swamp" },
    { col: 3, row: 0, terrain: "mountain" },
    { col: 4, row: 0, terrain: "road" },
  ];
  const travel = safeCall("travel-events", () => generateTravelEvents(travelPath, { tiles: travelPath }, 10), []);
  rows.push(decorateRow({
    id: "travel-events",
    family: "travel",
    label: "Travel events",
    status: travel.ok ? "ok" : "block",
    samples: travelPath.length,
    totalItems: countItems(travel),
    note: travel.ok ? "travel event generator callable" : travel.error,
  }));

  const situationStats = safeCall("world-map-situation-stats", () => getWorldMapSituationPoolStats(), { total: 0, levels: {} });
  const missingSituationLevels = ["global", "region", "local", "encounter", "building"]
    .filter(level => !Number(situationStats.value?.levels?.[level] ?? 0));
  rows.push(decorateRow({
    id: "world-map-situation-pool",
    family: "world-map",
    label: "World Map situation map pool",
    status: !situationStats.ok || missingSituationLevels.length ? "block" : "ok",
    samples: 5,
    totalItems: Number(situationStats.value?.total ?? 0),
    note: missingSituationLevels.length
      ? `missing levels: ${missingSituationLevels.join(", ")}`
      : "map pools cover global/region/local/encounter/building",
  }));

  const situationSamples = [
    safeCall("situation:forest", () => buildWorldMapSituation({
      activeLevelId: "encounter",
      focusTile: { label: "Dark Forest", terrain: "forest", danger: 2, col: 2, row: 4 },
      sceneBrief: { kind: "encounter" },
      seed: "session-readiness-forest",
    }), null),
    safeCall("situation:blacksmith", () => buildWorldMapSituation({
      activeLevelId: "encounter",
      focusTile: { label: "Blacksmith House", terrain: "town", danger: 1, col: 5, row: 2 },
      localView: {
        activeHotspot: { id: "workshops", label: "Workshop Row", hotspotType: "craft", npcRole: "crafter" },
      },
      sceneBrief: { kind: "craft" },
      seed: "session-readiness-blacksmith",
    }), null),
  ];
  const failedSituationSamples = situationSamples.filter(sample => !sample.ok || !sample.value?.hasSituation || !sample.value?.hasPlacementRows || !sample.value?.hasSkillRows);
  rows.push(decorateRow({
    id: "world-map-situation-samples",
    family: "world-map",
    label: "World Map situation samples",
    status: failedSituationSamples.length ? "block" : "ok",
    samples: situationSamples.length,
    totalItems: situationSamples.length - failedSituationSamples.length,
    note: failedSituationSamples.length
      ? `failed samples: ${failedSituationSamples.map(sample => sample.label).join(", ")}`
      : "forest and blacksmith situations generate actionable rows",
  }));

  const statuses = rows.map(row => row.status);
  const status = worstStatus(statuses);
  const byFamily = rows.reduce((acc, row) => {
    const key = row.family ?? "unknown";
    acc[key] = acc[key] ?? { total: 0, ok: 0, warn: 0, block: 0 };
    acc[key].total += 1;
    acc[key][row.status] = (acc[key][row.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    ok: status === "ok",
    status,
    summary: {
      rows: rows.length,
      okRows: rows.filter(row => row.status === "ok").length,
      warnings: rows.filter(row => row.status === "warn").length,
      blockers: rows.filter(row => row.status === "block").length,
      containerThemes: Object.keys(WORLD_CONTENT_CONTAINER_THEMES ?? {}).length,
      poiThemes: Object.keys(WORLD_CONTENT_POI_THEMES ?? {}).length,
      poiTypes: Object.keys(WORLD_CONTENT_POI_TYPES ?? {}).length,
      npcRoles: Object.keys(WORLD_CONTENT_NPC_ROLES ?? {}).length,
      merchantSpecialties: Object.keys(WORLD_CONTENT_MERCHANT_LOOT_SPECIALTIES ?? {}).length,
    },
    byFamily,
    rows,
  };
}

function buildGmPanelReadiness({ checkRuntime = false } = {}) {
  const runtimeApiRows = REQUIRED_GM_APIS.map(api => {
    const exists = !checkRuntime ? null : typeof globalThis.game?.ironHills?.[api] === "function";
    const status = !checkRuntime ? "todo" : exists ? "ok" : "block";
    return decorateRow({
      id: `api-${api}`,
      label: `game.ironHills.${api}`,
      status,
      kind: "api",
      note: checkRuntime
        ? (exists ? "runtime API available" : "runtime API missing")
        : "runtime check not requested",
    });
  });

  const actionRows = REQUIRED_GM_ACTIONS.map(action => decorateRow({
    id: `action-${action}`,
    label: action,
    status: "ok",
    kind: "ui-action",
    note: "wired in World Tools release panel",
  }));

  const status = checkRuntime
    ? worstStatus([...runtimeApiRows, ...actionRows].map(row => row.status))
    : "ok";
  return {
    ok: status === "ok",
    status,
    summary: {
      runtimeChecked: Boolean(checkRuntime),
      apis: REQUIRED_GM_APIS.length,
      actions: REQUIRED_GM_ACTIONS.length,
      missingApis: runtimeApiRows.filter(row => row.status === "block").length,
    },
    rows: [...runtimeApiRows, ...actionRows],
  };
}

function buildOverallSummary(parts) {
  const status = worstStatus([
    parts.maps.status,
    parts.monsters.status,
    parts.npcs.status,
    parts.generators.status,
    parts.gm.status,
  ]);
  const blockers =
    num(parts.maps.summary.blockingMissingArchetypes)
    + num(parts.monsters.summary.blockerRows)
    + (parts.npcs.status === "block" ? 1 : 0)
    + num(parts.generators.summary.blockers)
    + num(parts.gm.summary.missingApis);
  const warnings =
    num(parts.maps.summary.warningMissingArchetypes)
    + (parts.npcs.status === "warn" ? 1 : 0)
    + num(parts.generators.summary.warnings);
  const scoreParts = [
    parts.maps.status,
    parts.monsters.status,
    parts.npcs.status,
    parts.generators.status,
    parts.gm.status,
  ].map(partStatus => {
    if (partStatus === "ok") return 1;
    if (partStatus === "warn") return 0.65;
    if (partStatus === "todo") return 0.25;
    return 0;
  });
  const scorePct = Math.round((scoreParts.reduce((sum, value) => sum + value, 0) / Math.max(1, scoreParts.length)) * 100);
  return {
    ok: status === "ok",
    status,
    tone: toneForStatus(status),
    scorePct,
    blockers,
    warnings,
    mapsMissing: num(parts.maps.summary.missingArchetypes),
    monsterTierRowsOk: parts.monsters.rows.filter(row => row.status === "ok").length,
    npcTierRowsOk: parts.npcs.exactTierRows.filter(row => row.status === "ok").length,
    generatorRowsOk: num(parts.generators.summary.okRows),
    gmMissingApis: num(parts.gm.summary.missingApis),
    stage: status === "block"
      ? "session blockers"
      : status === "warn"
        ? "session content gap list"
        : "session-ready content skeleton",
  };
}

export function buildSessionReadinessReport(options = {}) {
  const maps = buildMapReadiness();
  const monsters = buildMonsterReadiness();
  const npcs = buildNpcReadiness();
  const generators = buildGeneratorReadiness();
  const gm = buildGmPanelReadiness({
    checkRuntime: Boolean(options.checkRuntime ?? options.runtime ?? false),
  });
  const summary = buildOverallSummary({ maps, monsters, npcs, generators, gm });

  return {
    ok: summary.ok,
    generatedAt: new Date().toISOString(),
    stage: summary.stage,
    summary,
    maps,
    monsters,
    npcs,
    generators,
    gm,
    nextActions: buildSessionNextActions({ maps, monsters, npcs, generators, gm }),
  };
}

function buildSessionNextActions({ maps, monsters, npcs, generators, gm }) {
  const actions = [];
  const missingMaps = maps.archetypeRows.filter(row => row.status !== "ok");
  if (missingMaps.length) {
    actions.push(`Generate/register map assets: ${missingMaps.slice(0, 5).map(row => row.label).join(", ")}${missingMaps.length > 5 ? "..." : ""}.`);
  }
  const monsterBlocks = monsters.rows.filter(row => row.status === "block");
  if (monsterBlocks.length) {
    actions.push(`Fix monster tier/loot coverage: ${monsterBlocks.map(row => row.label).join(", ")}.`);
  }
  if (npcs.status !== "ok") {
    actions.push("Decide whether NPC packs should stay tier-banded or materialize exact tier 1-10 archetypes.");
  }
  const generatorBlocks = generators.rows.filter(row => row.status === "block");
  if (generatorBlocks.length) {
    actions.push(`Fix generator blockers: ${generatorBlocks.slice(0, 5).map(row => row.label).join(", ")}.`);
  }
  const missingApis = gm.rows.filter(row => row.status === "block");
  if (missingApis.length) {
    actions.push(`Wire GM APIs: ${missingApis.map(row => row.label).join(", ")}.`);
  }
  if (!actions.length) {
    actions.push("Run Foundry manual session prep: map navigation, NPC/monster spawn, loot, quest and GM panel workflows.");
  }
  return actions.slice(0, 6);
}

export function formatSessionReadinessReport(report = null, options = {}) {
  if (!report) return "Iron Hills Session Readiness: unavailable";
  const maxRows = Math.max(4, Number(options.maxRows) || 14);
  const lines = [
    `Iron Hills Session Readiness: ${report.stage} (${report.summary?.scorePct ?? 0}%)`,
    `Status: ${String(report.summary?.status ?? "todo").toUpperCase()}, blockers=${report.summary?.blockers ?? 0}, warnings=${report.summary?.warnings ?? 0}`,
    "",
    "Maps:",
  ];
  for (const row of report.maps?.archetypeRows?.slice(0, maxRows) ?? []) {
    lines.push(`- [${String(row.status).toUpperCase()}] ${row.label}: ${row.note}`);
  }

  lines.push("", "Monsters:");
  for (const row of report.monsters?.rows ?? []) {
    lines.push(`- [${String(row.status).toUpperCase()}] tier ${row.tier}: ${row.note}`);
  }

  lines.push("", "NPC:");
  lines.push(`- roles=${report.npcs?.summary?.roles ?? 0}, packActors=${report.npcs?.summary?.packActors ?? 0}, materializedExactTiers=${report.npcs?.summary?.materializedExactTiers ?? 0}`);
  for (const row of report.npcs?.bandRows ?? []) {
    lines.push(`- [${String(row.status).toUpperCase()}] ${row.label}: ${row.note}`);
  }

  lines.push("", "Generators:");
  for (const row of report.generators?.rows?.filter(row => row.status !== "ok").slice(0, maxRows) ?? []) {
    lines.push(`- [${String(row.status).toUpperCase()}] ${row.label}: ${row.note}`);
  }
  if (!report.generators?.rows?.some(row => row.status !== "ok")) {
    lines.push("- generator smoke rows are green");
  }

  lines.push("", "GM panel/API:");
  for (const row of report.gm?.rows?.filter(row => row.status !== "ok").slice(0, maxRows) ?? []) {
    lines.push(`- [${String(row.status).toUpperCase()}] ${row.label}: ${row.note}`);
  }
  if (!report.gm?.rows?.some(row => row.status !== "ok")) {
    lines.push("- GM action/API smoke is green or runtime check was not requested");
  }

  lines.push("", "Next actions:");
  for (const action of report.nextActions ?? []) lines.push(`- ${action}`);
  return lines.join("\n");
}
