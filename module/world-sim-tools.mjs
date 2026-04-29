import { NPC_ROLE_PROFILES } from "./constants/npc-profiles.mjs";
import { MERCHANT_TYPES, ECONOMY_STATES, setSettlementEconomy } from "./services/merchant-service.mjs";
import { EntityPickerDialog } from "./apps/entity-picker.mjs";
import { randInt, choice, clamp } from "./utils/math-utils.mjs";
import {
  makeName,
  buildWeapon,
  buildArmor,
  buildFood,
  buildPotion,
  buildScroll,
  buildThrowable,
  buildConsumable,
  buildMaterial,
  buildResource,
  buildTool,
  randomMerchantStock,
  randomContainerLoot,
  buildNpcSystem,
  makeSettlementEvent,
  makeSettlementRumor,
  appendSettlementHistory,
  getContextualMerchantStock,
} from "./services/world-content-service.mjs";

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

const POI_TYPES = {
  camp: {
    label: "Лагерь",
    themes: ["bandit", "hunter", "mercenary"],
    status: ["active", "hidden", "abandoned"]
  },
  lair: {
    label: "Логово",
    themes: ["beast", "undead", "bandit"],
    status: ["active", "dangerous", "sealed"]
  },
  ruins: {
    label: "Руины",
    themes: ["ancient", "forgotten", "cursed"],
    status: ["silent", "active", "collapsed"]
  },
  shrine: {
    label: "Святилище",
    themes: ["sacred", "forsaken", "mystic"],
    status: ["active", "hidden", "defiled"]
  },
  road: {
    label: "Переход",
    themes: ["bridge", "ford", "watchpost"],
    status: ["used", "damaged", "blocked"]
  }
};

import {
  getSettlements,
  getMerchants,
  getFactions,
  getPois,
  findFactionByName,
  findSettlementByName,
} from "./utils/world-helpers.mjs";

function todayStamp() {
  return new Date().toLocaleString("ru-RU");
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
  const prefix = {
    camp: ["Лагерь", "Стоянка", "Схрон"],
    lair: ["Логово", "Нора", "Гнездо"],
    ruins: ["Руины", "Развалины", "Заброшка"],
    shrine: ["Святилище", "Капище", "Алтарь"],
    road: ["Переправа", "Пост", "Переход"]
  };

  const core = choice(prefix[poiType] ?? ["Точка"]);
  return nearestSettlement ? `${core} ${theme} у ${nearestSettlement}` : `${core} ${theme}`;
}

function buildPoiLoot(theme, tier) {
  if (theme === "bandit") return randomContainerLoot("bandit", tier);
  if (theme === "hunter") return randomContainerLoot("hunter", tier);
  if (theme === "mystic" || theme === "sacred") {
    return [
      buildScroll("Свиток искры", tier, "fire", "damage", 2 + tier, "torso"),
      buildPotion("Малое зелье маны", tier, "restoreMana", 8 + tier * 2, "torso", randInt(1, 2)),
      buildMaterial("Лунная пыль", tier, "herbs", randInt(1, 3), 1)
    ];
  }
  if (theme === "ancient" || theme === "forgotten" || theme === "cursed") {
    return randomContainerLoot("ruins", tier);
  }
  return [
    buildFood("Сухари", tier, 10, 0, 1, randInt(1, 2)),
    buildMaterial("Старая верёвка", tier, "fiber", randInt(1, 2), 1)
  ];
}

function buildPoiNpcPackage(theme, tier, faction = "") {
  if (theme === "bandit") {
    return {
      name: `Бандит ${makeName()}`,
      type: "npc",
      system: buildNpcSystem("bandit", tier, faction)
    };
  }
  if (theme === "hunter") {
    return {
      name: `Охотник ${makeName()}`,
      type: "npc",
      system: buildNpcSystem("hunter", tier, faction)
    };
  }
  if (theme === "mercenary") {
    return {
      name: `Страж ${makeName()}`,
      type: "npc",
      system: buildNpcSystem("guard", tier, faction)
    };
  }
  if (theme === "mystic" || theme === "sacred") {
    return {
      name: `Мистик ${makeName()}`,
      type: "npc",
      system: buildNpcSystem("mage", tier, faction)
    };
  }
  return null;
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
  distance = "1 день"
}) {
  const typeDef = POI_TYPES[poiType] ?? POI_TYPES.camp;
  const finalTheme = theme || choice(typeDef.themes);
  const finalStatus = status || choice(typeDef.status);
  const name = buildPoiName(poiType, finalTheme, nearestSettlement);

  const actor = await Actor.create({
    name,
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
        distance
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

  const loot = buildPoiLoot(finalTheme, tier);
  if (loot.length) {
    await actor.createEmbeddedDocuments("Item", loot);
  }

  const npcDoc = buildPoiNpcPackage(finalTheme, tier, faction);
  if (npcDoc && randInt(1, 100) <= 70) {
    const npc = await Actor.create(npcDoc);

    if (npc.system.info?.role === "Бандит") {
      await npc.createEmbeddedDocuments("Item", [
        buildWeapon("Ржавый нож", tier, { skill: "knife", damage: 1 + tier, weight: 1 }),
        buildThrowable("Метательный нож", tier, 2 + tier, "physical", 0, 0, "torso", randInt(1, 3))
      ]);
    }

    if (npc.system.info?.role === "Охотник") {
      await npc.createEmbeddedDocuments("Item", [
        buildThrowable("Метательный нож", tier, 2 + tier, "physical", 0, 0, "torso", randInt(2, 4)),
        buildFood("Вяленое мясо", tier, 18, 0, 1, randInt(1, 2))
      ]);
    }

    if (npc.system.info?.role === "Маг") {
      await npc.createEmbeddedDocuments("Item", [
        {
          name: "Искра",
          type: "spell",
          system: {
            tier,
            quality: "common",
            weight: 0,
            quantity: 1,
            school: "fire",
            effectType: "damage",
            damageType: "magical",
            power: 2 + tier,
            manaCost: 8,
            energyCost: 0,
            targetPart: "torso"
          }
        }
      ]);
    }
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
  const { ECONOMY_STATES } = await import("./services/merchant-service.mjs");
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
  const targetCount  = Math.round((5 + tier * 2) * econState.stockMult);

  if (currentCount < targetCount) {
    // Берём предметы из компендиума ih-weapons / ih-armor / ih-potions / ih-food / ih-materials
    const batch = await _buildStockFromCompendium(specialty, tier, targetCount - currentCount, econState);
    if (batch.length) {
      await merchant.createEmbeddedDocuments("Item", batch);
    }
  }

  await merchant.update({
    "system.market.lastRestock":        todayStamp(),
    "system.market.currentPriceFactor": factor,
    "system.market.stockRating":        clamp(merchant.items.size, 0, 10),
    "system.economy.economyStatus":     econStatus,
  });

  return { added: Math.max(0, merchant.items.size - currentCount), factor };
}

/**
 * Получить предметы из компендиумов для пополнения торговца.
 * Фильтрует по тиру и типу магазина.
 */
async function _buildStockFromCompendium(specialty, tier, count, econState) {
  // Маппинг специализации → нужные паки
  const SPECIALTY_PACKS = {
    weaponsmith: ["ih-weapons", "ih-materials"],
    armorsmith:  ["ih-armor",   "ih-materials"],
    alchemist:   ["ih-potions", "ih-materials", "ih-food"],
    mage:        ["ih-potions", "ih-materials"],
    jeweler:     ["ih-materials"],
    blackmarket: ["ih-weapons", "ih-armor", "ih-potions", "ih-materials"],
    general:     ["ih-weapons", "ih-armor", "ih-potions", "ih-food", "ih-materials", "ih-tools"],
    blacksmith:  ["ih-weapons", "ih-materials"],
    hunter:      ["ih-food",    "ih-materials", "ih-tools"],
    innkeeper:   ["ih-food"],
  };

  const maxTier = Math.min(10, tier + 1);
  const packNames = SPECIALTY_PACKS[specialty] ?? SPECIALTY_PACKS.general;
  const pool = [];

  for (const packName of packNames) {
    const pack = game.packs.get(`iron-hills-system.${packName}`);
    if (!pack) continue;
    const docs = await pack.getDocuments();
    for (const doc of docs) {
      const itemTier = Number(doc.system?.tier ?? 1);
      if (itemTier >= 1 && itemTier <= maxTier) {
        pool.push(doc);
      }
    }
  }

  if (!pool.length) return [];

  // Случайная выборка с учётом stockMult (при кризисе меньше)
  const actualCount = Math.max(1, Math.round(count * (econState?.stockMult ?? 1)));
  const result = [];
  for (let i = 0; i < actualCount && pool.length; i++) {
    const doc = pool[Math.floor(Math.random() * pool.length)];
    const data = doc.toObject();
    delete data._id;
    data.system.quantity = Math.max(1, Math.floor(Math.random() * 3) + 1);
    // Проставляем system.price из system.value (чтобы trade-app показывал цену)
    if (!data.system.price || data.system.price <= 0) {
      data.system.price = Number(data.system.value ?? 0);
    }
    result.push(data);
  }
  return result;
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

  const settlementBody = settlementReports.map(r => `
    <div style="margin-bottom:10px;">
      <b>${r.name}</b><br>
      Население: ${r.nextPopulation}<br>
      Благополучие: ${r.nextProsperity}<br>
      Опасность: ${r.nextDanger}<br>
      Снабжение: ${r.nextSupply}<br>
      Давление фракции: ${r.factionPressure}<br>
      Торговцев: ${r.merchantCount}<br>
      Пути: ${r.routeValue}<br>
      Торговый баланс: ${r.tradeBalance}<br>
      Караваны: ${r.caravanTraffic}<br>
      Стабильность: ${r.stability}<br>
      Милиция: ${r.militiaPower}<br>
      Кризис: ${r.activeCrisis || "нет"}<br>
      Цены — еда: ${r.prices.foodPrice}, материалы: ${r.prices.materialsPrice}, алхимия: ${r.prices.alchemyPrice}, оружие: ${r.prices.armsPrice}, ночлег: ${r.prices.lodgingPrice}<br>
      Событие: ${r.eventText}<br>
      Слух: ${r.rumorText}
    </div>
  `).join("");

  const crisisBody = crisisReports.map(c => `
    <div style="margin-bottom:6px;">
      <b>${c.regionName}</b>: кризис "${c.crisis}", затронуто поселений ${c.settlementCount}
    </div>
  `).join("");

  const caravanBody = caravanReports.map(c => `
    <div style="margin-bottom:6px;">
      <b>${c.region}</b>: ${c.text}
    </div>
  `).join("");

  const poiBody = [
    ...poiSpawnReports,
    ...poiDecayReports,
    ...poiEvolutionReports,
    ...poiSuppressionReports,
    ...poiFactionReports,
    ...removedPois
  ].map(t => `<div style="margin-bottom:6px;">${t}</div>`).join("");

  const merchantBody = merchantReports.map(m => `
    <div style="margin-bottom:6px;">
      <b>${m.name}</b>: добавлено товаров ${m.added}, коэффициент цен ${m.factor}
    </div>
  `).join("");

  const stabilizationBody = stabilizationReports.map(t => `<div style="margin-bottom:6px;">${t}</div>`).join("");

  await ChatMessage.create({
    content: `
      <h2>Сводка недели мира</h2>
      <h3>Поселения</h3>
      ${settlementBody || "<p>Нет поселений для тика.</p>"}
      <h3>Стабилизация мира</h3>
      ${stabilizationBody || "<p>Стабилизационных событий не было.</p>"}
      <h3>Кризисы региона</h3>
      ${crisisBody || "<p>На этой неделе новых кризисов нет.</p>"}
      <h3>Караваны</h3>
      ${caravanBody || "<p>Караванов не было.</p>"}
      <h3>POI и конфликты</h3>
      ${poiBody || "<p>Новых изменений по POI нет.</p>"}
      <h3>Ресток торговцев</h3>
      ${merchantBody || "<p>Нет торговцев.</p>"}
    `
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
    const regions     = [...new Set(getSettlements().map(s => s.system.info?.region || "Iron Hills"))];

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
    }));

    return {
      settlements,
      factions,
      regions,
      pois,
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
      content: `<p style="color:#a8b8d0">Привязать <b>${name}</b> к тайлу на глобальной карте?</p>`
    });

    if (mapChoice) {
      // Открываем пикер тайла
      const colStr = await Dialog.wait({
        title: "Координаты тайла",
        content: `<div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;padding:4px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <label>Колонка (0-9)<br><input id="tile-col" type="number" min="0" max="9" value="5"
            style="width:100%;background:#1b2333;border:1px solid rgba(120,150,200,0.3);color:#e8edf5;padding:5px;border-radius:6px;"></label>
          <label>Ряд (0-9)<br><input id="tile-row" type="number" min="0" max="9" value="5"
            style="width:100%;background:#1b2333;border:1px solid rgba(120,150,200,0.3);color:#e8edf5;padding:5px;border-radius:6px;"></label>
        </div>`,
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

    const profile = NPC_ROLE_PROFILES[role] ?? NPC_ROLE_PROFILES.villager;
    const actor = await Actor.create({
      name: `${profile.label} ${makeName()}`,
      type: "npc",
      system: buildNpcSystem(role, tier, faction)
    });

    if (role === "guard") {
      await actor.createEmbeddedDocuments("Item", [
        buildWeapon("Служебный меч", tier, { skill: "sword", damage: 2 + tier, weight: 3 }),
        buildArmor("Стёганка стражи", tier, "torso", 1 + tier, 0, 4)
      ]);
    }

    if (role === "bandit") {
      await actor.createEmbeddedDocuments("Item", [
        buildWeapon("Ржавый нож", tier, { skill: "knife", damage: 1 + tier, weight: 1 }),
        buildThrowable("Метательный нож", tier, 2 + tier, "physical", 0, 0, "torso", randInt(1, 3))
      ]);
    }

    if (role === "mage") {
      await actor.createEmbeddedDocuments("Item", [
        {
          name: "Искра",
          type: "spell",
          system: {
            tier,
            quality: "common",
            weight: 0,
            quantity: 1,
            school: "fire",
            effectType: "damage",
            damageType: "magical",
            power: 2 + tier,
            manaCost: 8,
            energyCost: 0,
            targetPart: "torso"
          }
        }
      ]);
    }

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
        currency: { gold: goldCoins, silver: silverCoins, copper: copperCoins, platinum: 0 }
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
      content: `<h3>Слух: ${settlement.name}</h3><p>${rumor}</p>`
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
      content: `
        <h3>Недельный тик: ${result.name}</h3>
        <p><b>Население:</b> ${result.nextPopulation}</p>
        <p><b>Благополучие:</b> ${result.nextProsperity}</p>
        <p><b>Опасность:</b> ${result.nextDanger}</p>
        <p><b>Снабжение:</b> ${result.nextSupply}</p>
        <p><b>Давление фракции:</b> ${result.factionPressure}</p>
        <p><b>Торговцев:</b> ${result.merchantCount}</p>
        <p><b>Пути:</b> ${result.routeValue}</p>
        <p><b>Торговый баланс:</b> ${result.tradeBalance}</p>
        <p><b>Караваны:</b> ${result.caravanTraffic}</p>
        <p><b>Стабильность:</b> ${result.stability}</p>
        <p><b>Милиция:</b> ${result.militiaPower}</p>
        <p><b>Кризис:</b> ${result.activeCrisis || "нет"}</p>
        <p><b>Событие:</b> ${result.eventText}</p>
        <p><b>Слух:</b> ${result.rumorText}</p>
      `
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
      content: `<h3>Ресток торговцев</h3><p>Торговцев обновлено: ${merchants.length}</p><p>Добавлено позиций: ${totalAdded}</p>`
    });

    ui.notifications.info(`Ресток завершён. Добавлено позиций: ${totalAdded}`);
  }

  async _showFactionReport() {
    const report = buildFactionReport();

    const body = report.map(r => `
      <div style="margin-bottom:8px;">
        <b>${r.settlement}</b><br>
        Фракция: ${r.faction}<br>
        Power: ${r.power}<br>
        Wealth: ${r.wealth}<br>
        Pressure: ${r.pressure}
      </div>
    `).join("");

    await ChatMessage.create({
      content: `<h3>Отчёт по влиянию фракций</h3>${body || "<p>Нет поселений.</p>"}`
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
      content: `<h3>Кризис региона</h3><p><b>${report.regionName}</b>: ${report.crisis}</p><p>Затронуто поселений: ${report.settlementCount}</p>`
    });

    ui.notifications.info(`Кризис "${report.crisis}" применён к региону ${report.regionName}`);
  }

  async _runCaravans(html) {
    const regionName = html.find("[name='region-select']").val() || null;
    const reports = await simulateCaravans(regionName);

    const body = reports.map(r => `<p><b>${r.region}</b>: ${r.text}</p>`).join("");

    await ChatMessage.create({
      content: `<h3>Караваны</h3>${body || "<p>Маршрутов для караванов не найдено.</p>"}`
    });

    ui.notifications.info(`Караваны прогнаны: ${reports.length}`);
  }

  async _generatePoi(html) {
    const region = html.find("[name='region-select']").val() || "";
    const poiType = html.find("[name='poi-type']").val() || "camp";
    const tier = Number(html.find("[name='poi-tier']").val() || 1);
    const nearestSettlement = html.find("[name='poi-settlement']").val() || "";
    const faction = html.find("[name='poi-faction']").val() || "";

    const settlement = nearestSettlement ? findSettlementByName(nearestSettlement) : null;
    const danger = settlement ? Number(settlement.system.info?.danger ?? 5) : 3;

    const actor = await createPoi({
      region,
      poiType,
      tier,
      nearestSettlement,
      faction,
      danger: clamp(danger, 1, 10),
      distance: choice(["несколько часов", "полдня", "1 день", "2 дня"])
    });

    await ChatMessage.create({
      content: `<h3>Новый POI</h3><p><b>${actor.name}</b></p><p>Тип: ${actor.system.info.poiType}</p><p>Регион: ${actor.system.info.region}</p>`
    });

    ui.notifications.info(`Создан POI: ${actor.name}`);
  }

  async _generatePoiPack(html) {
    const region = html.find("[name='region-select']").val() || "";
    const tier = Number(html.find("[name='poi-tier']").val() || 1);
    const settlements = getSettlements().filter(s => (s.system.info?.region || "") === region);
    if (!settlements.length) {
      ui.notifications.warn("В регионе нет поселений");
      return;
    }

    const created = [];
    const count = randInt(2, 4);

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
      created.push(actor.name);
    }

    await ChatMessage.create({
      content: `<h3>Пакет POI региона</h3>${created.map(n => `<p>${n}</p>`).join("")}`
    });

    ui.notifications.info(`Создано POI: ${created.length}`);
  }

  async _generateRegionalThreat(html) {
    const region = html.find("[name='region-select']").val() || "";
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
      content: `<h3>Региональная угроза</h3><p>${text}</p>`
    });

    ui.notifications.info(`Создана региональная угроза: ${actor.name}`);
  }

  async _stabilizeRegion(html) {
    const region = html.find("[name='region-select']").val() || "";
    const reports = await stabilizeRegion(region);

    await ChatMessage.create({
      content: `<h3>Стабилизация региона</h3>${reports.length ? reports.map(r => `<p>${r}</p>`).join("") : "<p>Регион не найден.</p>"}`
    });

    ui.notifications.info(`Стабилизация региона завершена: ${reports.length}`);
  }

  async _evolvePois(html) {
    const region = html.find("[name='region-select']").val() || "";
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
      content: `<h3>Эволюция POI</h3>${reports.length ? reports.map(r => `<p>${r}</p>`).join("") : "<p>Изменений не произошло.</p>"}`
    });

    ui.notifications.info(`Эволюция POI завершена: ${reports.length}`);
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
    ui.notifications.info(`Убрано ${removed ?? 0} рухнувших POI`);
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

Hooks.once("ready", () => {
  game.ironHills = game.ironHills || {};
  game.ironHills.openWorldTools = () => new IronHillsWorldToolsV5().render(true);
});

Hooks.on("renderActorDirectory", (app, html) => {
  injectOrRetargetWorldToolsButton(html);
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
    content: `<div style="padding:6px;font-family:var(--font-primary)">
      🌍 <b>${settlementName}</b> — последствия: ${parts.join(", ")}<br>
      Экономика: <b>${ECON[newStatus] ?? newStatus}</b>
      ${reason ? `<br><i style="color:#a8b8d0">${reason}</i>` : ""}
    </div>`
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
