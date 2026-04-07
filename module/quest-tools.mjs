function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeChainId() {
  return `arc-${Date.now()}-${randInt(1000, 9999)}`;
}

function getSettlements() {
  return game.actors.filter(a => a.type === "settlement");
}

function getPois() {
  return game.actors.filter(a => a.type === "poi");
}

function getFactions() {
  return game.actors.filter(a => a.type === "faction");
}

function getQuests() {
  return game.actors.filter(a => a.type === "quest");
}

function getCharacters() {
  return game.actors.filter(a => a.type === "character");
}

function getWorldItems() {
  return game.items ? Array.from(game.items) : [];
}

function findSettlementByName(name) {
  if (!name) return null;
  return getSettlements().find(s => s.name === name) ?? null;
}

function findPoiByName(name) {
  if (!name) return null;
  return getPois().find(p => p.name === name) ?? null;
}

function findFactionByName(name) {
  if (!name) return null;
  return getFactions().find(f => f.name === name) ?? null;
}

function findCharacterByName(name) {
  if (!name) return null;
  return getCharacters().find(c => c.name === name) ?? null;
}

function getRegionSettlements(region) {
  return getSettlements().filter(s => (s.system.info?.region || "") === region);
}

async function appendSettlementHistory(settlement, field, text, limit = 12) {
  const current = Array.isArray(settlement.system.history?.[field]) ? [...settlement.system.history[field]] : [];
  current.unshift(text);
  await settlement.update({
    [`system.history.${field}`]: current.slice(0, limit)
  });
}

function buildFallbackRewardItemData(itemType, itemName, quantity = 1, tier = 1) {
  if (!itemType || !itemName || quantity <= 0) return null;

  const base = {
    name: itemName,
    type: itemType,
    img: "icons/svg/item-bag.svg",
    system: {
      tier,
      quantity
    }
  };

  if (itemType === "food") {
    base.system.quality = "common";
    base.system.weight = 1;
    base.system.satiety = 20;
    base.system.hydration = 0;
  }

  if (itemType === "material") {
    base.system.weight = 1;
    base.system.category = "generic";
  }

  if (itemType === "resource") {
    base.system.weight = 1;
    base.system.category = "generic";
  }

  if (itemType === "potion") {
    base.system.quality = "common";
    base.system.weight = 1;
    base.system.effectType = "healHP";
    base.system.power = 8;
    base.system.targetPart = "torso";
  }

  if (itemType === "consumable") {
    base.system.quality = "common";
    base.system.weight = 1;
    base.system.effectType = "reduceBleeding";
    base.system.power = 1;
  }

  if (itemType === "tool") {
    base.system.weight = 2;
    base.system.craftType = "crafting";
  }

  return base;
}

function buildRewardItemFromWorldOrFallback(itemType, itemName, quantity = 1, tier = 1) {
  if (!itemName || quantity <= 0) return null;

  const worldItem = getWorldItems().find(i => {
    const sameName = i.name === itemName;
    const sameType = itemType ? i.type === itemType : true;
    return sameName && sameType;
  });

  if (worldItem) {
    const cleanSystem = foundry.utils.deepClone(worldItem.system ?? {});
    cleanSystem.quantity = quantity;
    if (cleanSystem.tier == null) cleanSystem.tier = tier;

    return {
      name: worldItem.name,
      type: worldItem.type,
      img: worldItem.img,
      system: cleanSystem
    };
  }

  return buildFallbackRewardItemData(itemType, itemName, quantity, tier);
}

function resolveRewardCharacterName(quest) {
  const rewardCharacter = quest.system.rewards?.rewardCharacter || "";
  if (rewardCharacter) return rewardCharacter;

  const requiredCharacter = quest.system.requirements?.requiredCharacter || "";
  if (requiredCharacter) return requiredCharacter;

  const controlled = canvas?.tokens?.controlled?.[0]?.actor;
  if (controlled && controlled.type === "character") return controlled.name;

  const characters = getCharacters();
  if (characters.length === 1) return characters[0].name;

  return "";
}

async function addRewardItemToCharacter(character, itemData) {
  if (!character || !itemData) return { ok: false, reason: "Нет персонажа или данных предмета" };

  const existing = character.items.find(i =>
    i.type === itemData.type &&
    i.name === itemData.name
  );

  const addQty = Number(itemData.system?.quantity ?? 1);

  if (existing) {
    const currentQty = Number(existing.system.quantity ?? 1);
    await existing.update({
      "system.quantity": currentQty + addQty
    });
    return { ok: true, reason: "Количество существующего предмета увеличено" };
  }

  const created = await character.createEmbeddedDocuments("Item", [itemData]);
  if (created && created.length > 0) {
    return { ok: true, reason: "Новый предмет создан в инвентаре" };
  }

  return { ok: false, reason: "createEmbeddedDocuments не вернул созданный предмет" };
}

function baseQuestData({
  name,
  questType,
  region = "",
  issuer = "",
  targetSettlement = "",
  targetPOI = "",
  targetFaction = "",
  difficulty = 1,
  reward = "",
  dueText = "",
  summary = "",
  objective = "",
  notes = "",
  chainId = "",
  arcType = "",
  arcState = "active",
  step = 1,
  maxStep = 1,
  nextQuestType = "",
  autoGenerateNext = false,
  minSettlementRep = 0,
  minFactionRep = 0,
  requiredCharacter = "",
  requiredQuestStatus = "",
  silver = 0,
  settlementRep = 0,
  factionRep = 0,
  rewardCharacter = "",
  rewardItemName = "",
  rewardItemType = "",
  rewardItemQuantity = 0,
  success = {},
  failure = {}
}) {
  return {
    name,
    type: "quest",
    system: {
      info: {
        questType,
        status: "active",
        region,
        issuer,
        targetSettlement,
        targetPOI,
        targetFaction,
        difficulty,
        reward,
        dueText
      },
      description: {
        summary,
        objective,
        notes
      },
      chain: {
        chainId,
        arcType,
        arcState,
        step,
        maxStep,
        nextQuestType,
        autoGenerateNext
      },
      requirements: {
        minSettlementRep,
        minFactionRep,
        requiredCharacter,
        requiredQuestStatus
      },
      rewards: {
        silver,
        settlementRep,
        factionRep,
        rewardCharacter,
        rewardItemName,
        rewardItemType,
        rewardItemQuantity,
        granted: false
      },
      effects: {
        success: {
          prosperity: success.prosperity ?? 0,
          danger: success.danger ?? 0,
          supply: success.supply ?? 0,
          stability: success.stability ?? 0,
          militiaPower: success.militiaPower ?? 0,
          tradeBalance: success.tradeBalance ?? 0,
          caravanTraffic: success.caravanTraffic ?? 0,
          removeTargetPOI: success.removeTargetPOI ?? false,
          resolveCrisis: success.resolveCrisis ?? false
        },
        failure: {
          prosperity: failure.prosperity ?? 0,
          danger: failure.danger ?? 0,
          supply: failure.supply ?? 0,
          stability: failure.stability ?? 0,
          militiaPower: failure.militiaPower ?? 0,
          tradeBalance: failure.tradeBalance ?? 0,
          caravanTraffic: failure.caravanTraffic ?? 0,
          empowerTargetPOI: failure.empowerTargetPOI ?? false
        }
      }
    }
  };
}

function makeGatheringQuest(settlement = null, region = "") {
  const variants = [
    {
      title: "Сбор лечебных трав",
      objective: `Собрать ${randInt(6, 12)} пучков лечебных трав.`,
      rewardText: `${randInt(8, 18)} серебра, реагенты или малое зелье`,
      silver: randInt(8, 18),
      itemType: "material",
      itemName: "Пучок лечебных трав",
      itemQty: randInt(1, 3),
      issuer: settlement ? `Травник ${settlement.name}` : "Местный травник",
      success: { supply: 0, prosperity: 0 }
    },
    {
      title: "Лесозаготовка",
      objective: `Заготовить ${randInt(10, 20)} единиц древесины.`,
      rewardText: `${randInt(10, 22)} серебра, материалы`,
      silver: randInt(10, 22),
      itemType: "material",
      itemName: "Связка древесины",
      itemQty: randInt(1, 2),
      issuer: settlement ? `Плотник ${settlement.name}` : "Плотник",
      success: { supply: 1, prosperity: 0 }
    },
    {
      title: "Добыча железной руды",
      objective: `Добыть ${randInt(8, 16)} кусков железной руды.`,
      rewardText: `${randInt(12, 24)} серебра, инструменты или скидка у кузнеца`,
      silver: randInt(12, 24),
      itemType: "material",
      itemName: "Железная руда",
      itemQty: randInt(2, 4),
      issuer: settlement ? `Кузнец ${settlement.name}` : "Кузнец",
      success: { supply: 1, prosperity: 0 }
    }
  ];

  const v = choice(variants);

  return baseQuestData({
    name: v.title,
    questType: "gathering",
    region,
    issuer: v.issuer,
    targetSettlement: settlement?.name || "",
    difficulty: randInt(1, 3),
    reward: v.rewardText,
    dueText: "Когда будет удобно",
    summary: v.title,
    objective: v.objective,
    notes: "Бытовой квест.",
    silver: v.silver,
    settlementRep: settlement ? 1 : 0,
    rewardItemName: v.itemName,
    rewardItemType: v.itemType,
    rewardItemQuantity: v.itemQty,
    success: v.success
  });
}

function makeDeliveryQuest(settlement = null, region = "") {
  return baseQuestData({
    name: "Доставка провизии",
    questType: "delivery",
    region,
    issuer: settlement ? `Кладовщик ${settlement.name}` : "Кладовщик",
    targetSettlement: settlement?.name || "",
    difficulty: randInt(1, 3),
    reward: `${randInt(10, 20)} серебра и благодарность`,
    dueText: "В ближайшие дни",
    summary: "Доставка провизии",
    objective: "Доставить ящики с едой и водой получателю.",
    notes: "Логистический квест.",
    silver: randInt(10, 20),
    settlementRep: settlement ? 1 : 0,
    rewardItemName: "Сухари",
    rewardItemType: "food",
    rewardItemQuantity: randInt(1, 2),
    success: { supply: 1, tradeBalance: 1, caravanTraffic: 1 },
    failure: { supply: -1, tradeBalance: -1 }
  });
}

function makeExplorationQuest(settlement = null, region = "", poi = null) {
  const targetPoi = poi ?? choice(getPois().filter(p => (p.system.info?.region || "") === region));

  return baseQuestData({
    name: targetPoi ? `Разведка: ${targetPoi.name}` : "Разведка окраин",
    questType: "exploration",
    region,
    issuer: settlement ? `Староста ${settlement.name}` : "Разведчик",
    targetSettlement: settlement?.name || "",
    targetPOI: targetPoi?.name || "",
    difficulty: randInt(2, 4),
    reward: `${randInt(10, 22)} серебра, карты, сведения`,
    dueText: "Пока цель не исчезла",
    summary: targetPoi ? `Разведать ${targetPoi.name}` : "Разведать окрестности",
    objective: targetPoi
      ? `Разведать точку интереса "${targetPoi.name}" и вернуться с отчётом.`
      : "Разведать старую дорогу, заросший маршрут или неизвестный ориентир.",
    notes: "Исследовательский квест.",
    silver: randInt(10, 22),
    settlementRep: settlement ? 1 : 0,
    rewardItemName: "Схема местности",
    rewardItemType: "resource",
    rewardItemQuantity: 1,
    success: {
      danger: targetPoi ? -1 : 0,
      stability: targetPoi ? 1 : 0,
      caravanTraffic: targetPoi && targetPoi.system.info?.poiType === "road" ? 1 : 0
    },
    failure: {
      danger: 1,
      empowerTargetPOI: !!targetPoi
    }
  });
}

function makeCombatQuest(settlement = null, region = "", poi = null) {
  const candidates = poi
    ? [poi]
    : getPois().filter(p => {
        const pRegion = p.system.info?.region || "";
        const threat = Number(p.system.state?.threatLevel ?? 0);
        return pRegion === region && threat >= 2;
      });

  const targetPoi = candidates.length ? choice(candidates) : null;

  return baseQuestData({
    name: targetPoi ? `Устранить угрозу: ${targetPoi.name}` : "Зачистить враждебную группу",
    questType: "combat",
    region,
    issuer: settlement ? `Стража ${settlement.name}` : "Стража",
    targetSettlement: settlement?.name || "",
    targetPOI: targetPoi?.name || "",
    difficulty: randInt(2, 5),
    reward: `${randInt(16, 35)} серебра, трофеи, репутация`,
    dueText: "Чем раньше, тем лучше",
    summary: targetPoi ? `Подавить ${targetPoi.name}` : "Подавить угрозу",
    objective: targetPoi
      ? `Найти и подавить активность точки "${targetPoi.name}".`
      : "Уничтожить или рассеять опасную группу в окрестностях.",
    notes: "Боевой квест.",
    silver: randInt(16, 35),
    settlementRep: settlement ? 2 : 0,
    rewardItemName: "Бинт",
    rewardItemType: "consumable",
    rewardItemQuantity: randInt(1, 3),
    success: {
      prosperity: 1,
      danger: -2,
      stability: 1,
      caravanTraffic: 1,
      removeTargetPOI: !!targetPoi
    },
    failure: {
      prosperity: -1,
      danger: 2,
      supply: -1,
      stability: -1,
      caravanTraffic: -1,
      empowerTargetPOI: !!targetPoi
    }
  });
}

function makeWorldQuest(settlement = null, region = "") {
  const crisisText = settlement?.system.regionSim?.activeCrisis || "";

  return baseQuestData({
    name: crisisText ? `Смягчить кризис: ${crisisText}` : "Стабилизировать ситуацию в регионе",
    questType: "world",
    region,
    issuer: settlement ? `Совет ${settlement.name}` : "Региональная власть",
    targetSettlement: settlement?.name || "",
    difficulty: randInt(3, 6),
    reward: `${randInt(20, 50)} серебра, влияние, политическая поддержка`,
    dueText: "Срочно",
    summary: crisisText ? `Смягчить кризис "${crisisText}"` : "Стабилизировать регион",
    objective: crisisText
      ? `Предпринять действия для снижения последствий кризиса "${crisisText}".`
      : "Решить проблему, которая дестабилизирует регион.",
    notes: "Крупный мировой квест.",
    silver: randInt(20, 50),
    settlementRep: settlement ? 3 : 0,
    rewardItemName: "Малое зелье лечения",
    rewardItemType: "potion",
    rewardItemQuantity: randInt(1, 2),
    success: {
      prosperity: 1,
      danger: -1,
      supply: 1,
      stability: 2,
      militiaPower: 1,
      tradeBalance: 1,
      caravanTraffic: 1,
      resolveCrisis: true
    },
    failure: {
      prosperity: -1,
      danger: 1,
      supply: -1,
      stability: -2,
      tradeBalance: -1,
      caravanTraffic: -1
    }
  });
}

function pickQuestTypeWeighted(settlement = null) {
  const roll = randInt(1, 100);

  if (roll <= 55) return "gathering";
  if (roll <= 72) return "delivery";
  if (roll <= 88) return "exploration";
  if (roll <= 97) return "combat";

  if (settlement) {
    const danger = Number(settlement.system.info?.danger ?? 5);
    const crisis = settlement.system.regionSim?.activeCrisis ?? "";
    if (danger >= 7 || crisis) return "world";
  }

  return "gathering";
}

function buildQuestByType(type, settlement = null, region = "") {
  if (type === "gathering") return makeGatheringQuest(settlement, region);
  if (type === "delivery") return makeDeliveryQuest(settlement, region);
  if (type === "exploration") return makeExplorationQuest(settlement, region);
  if (type === "combat") return makeCombatQuest(settlement, region);
  return makeWorldQuest(settlement, region);
}

function buildArcFromCrisis(settlement, region) {
  const chainId = makeChainId();
  const crisis = settlement.system.regionSim?.activeCrisis || "кризис";
  const poi = choice(getPois().filter(p => (p.system.info?.region || "") === region));

  return [
    baseQuestData({
      name: `Разобраться в причинах: ${crisis}`,
      questType: "exploration",
      region,
      issuer: `Совет ${settlement.name}`,
      targetSettlement: settlement.name,
      targetPOI: poi?.name || "",
      difficulty: 3,
      reward: "Оплата, доверие, сведения",
      dueText: "Скоро",
      summary: `Разобраться в причинах кризиса "${crisis}"`,
      objective: `Собрать сведения, найти источник кризиса и установить, что именно дестабилизирует ${settlement.name}.`,
      notes: "Первое звено кризисной арки.",
      chainId,
      arcType: "crisis",
      step: 1,
      maxStep: 3,
      nextQuestType: "combat",
      autoGenerateNext: true,
      silver: 20,
      settlementRep: 1,
      success: { stability: 1, danger: -1 },
      failure: { danger: 1, stability: -1, empowerTargetPOI: !!poi }
    }),
    baseQuestData({
      name: poi ? `Подавить источник: ${poi.name}` : "Подавить источник кризиса",
      questType: "combat",
      region,
      issuer: `Стража ${settlement.name}`,
      targetSettlement: settlement.name,
      targetPOI: poi?.name || "",
      difficulty: 4,
      reward: "Трофеи, жалование, признание",
      dueText: "Чем быстрее, тем лучше",
      summary: "Нейтрализовать источник кризиса",
      objective: poi
        ? `Подавить активность точки "${poi.name}" и сорвать дальнейшую эскалацию.`
        : "Уничтожить или рассеять главную угрозу, питающую кризис.",
      notes: "Второе звено кризисной арки.",
      chainId,
      arcType: "crisis",
      step: 2,
      maxStep: 3,
      nextQuestType: "world",
      autoGenerateNext: true,
      silver: 28,
      settlementRep: 2,
      rewardItemName: "Малое зелье лечения",
      rewardItemType: "potion",
      rewardItemQuantity: 1,
      success: { danger: -2, stability: 1, removeTargetPOI: !!poi },
      failure: { danger: 2, prosperity: -1, empowerTargetPOI: !!poi }
    }),
    baseQuestData({
      name: `Восстановить порядок в ${settlement.name}`,
      questType: "world",
      region,
      issuer: `Совет ${settlement.name}`,
      targetSettlement: settlement.name,
      difficulty: 3,
      reward: "Существенная награда и влияние",
      dueText: "После подавления угрозы",
      summary: `Восстановить порядок в ${settlement.name}`,
      objective: "Закрепить успех, наладить снабжение, восстановить спокойствие и вернуть людям уверенность.",
      notes: "Финал кризисной арки.",
      chainId,
      arcType: "crisis",
      step: 3,
      maxStep: 3,
      nextQuestType: "",
      autoGenerateNext: false,
      silver: 40,
      settlementRep: 3,
      rewardItemName: "Кузнечный набор",
      rewardItemType: "tool",
      rewardItemQuantity: 1,
      success: { prosperity: 2, supply: 1, stability: 2, resolveCrisis: true, tradeBalance: 1 },
      failure: { prosperity: -1, stability: -2, danger: 1 }
    })
  ];
}

function buildArcFromRecovery(settlement, region) {
  const chainId = makeChainId();

  return [
    baseQuestData({
      name: `Собрать ресурсы для ${settlement.name}`,
      questType: "gathering",
      region,
      issuer: `Кладовщик ${settlement.name}`,
      targetSettlement: settlement.name,
      difficulty: 2,
      reward: "Оплата и материалы",
      dueText: "На этой неделе",
      summary: `Собрать ресурсы для ${settlement.name}`,
      objective: "Обеспечить поселение древесиной, травами, рудой или провизией для быстрого восстановления.",
      notes: "Первое звено мирной арки.",
      chainId,
      arcType: "recovery",
      step: 1,
      maxStep: 3,
      nextQuestType: "delivery",
      autoGenerateNext: true,
      silver: 16,
      settlementRep: 1,
      rewardItemName: "Связка древесины",
      rewardItemType: "material",
      rewardItemQuantity: 2,
      success: { supply: 1, prosperity: 1 },
      failure: { supply: -1 }
    }),
    baseQuestData({
      name: `Доставить помощь в ${settlement.name}`,
      questType: "delivery",
      region,
      issuer: `Староста ${settlement.name}`,
      targetSettlement: settlement.name,
      difficulty: 2,
      reward: "Оплата и благодарность жителей",
      dueText: "Как можно скорее",
      summary: `Доставить помощь в ${settlement.name}`,
      objective: "Организовать и безопасно довезти всё необходимое до поселения.",
      notes: "Второе звено мирной арки.",
      chainId,
      arcType: "recovery",
      step: 2,
      maxStep: 3,
      nextQuestType: "world",
      autoGenerateNext: true,
      silver: 18,
      settlementRep: 1,
      rewardItemName: "Сухари",
      rewardItemType: "food",
      rewardItemQuantity: 2,
      success: { supply: 1, tradeBalance: 1, caravanTraffic: 1 },
      failure: { supply: -1, tradeBalance: -1 }
    }),
    baseQuestData({
      name: `Закрепить восстановление ${settlement.name}`,
      questType: "world",
      region,
      issuer: `Совет ${settlement.name}`,
      targetSettlement: settlement.name,
      difficulty: 3,
      reward: "Существенная награда и влияние",
      dueText: "После доставки помощи",
      summary: `Закрепить восстановление ${settlement.name}`,
      objective: "Помочь поселению перейти от выживания к устойчивому восстановлению и росту.",
      notes: "Финал мирной арки.",
      chainId,
      arcType: "recovery",
      step: 3,
      maxStep: 3,
      nextQuestType: "",
      autoGenerateNext: false,
      silver: 32,
      settlementRep: 3,
      rewardItemName: "Малое зелье лечения",
      rewardItemType: "potion",
      rewardItemQuantity: 1,
      success: { prosperity: 2, stability: 2, supply: 1 },
      failure: { prosperity: -1, stability: -1 }
    })
  ];
}

async function createStoryArc(settlement, region, mode = "auto") {
  if (!settlement) {
    const candidates = getRegionSettlements(region);
    settlement = candidates.length ? choice(candidates) : null;
  }
  if (!settlement) return [];

  const crisis = settlement.system.regionSim?.activeCrisis || "";
  let arcData = [];

  if (mode === "auto") {
    if (crisis) mode = "crisis";
    else mode = "recovery";
  }

  if (mode === "crisis") arcData = buildArcFromCrisis(settlement, region);
  else arcData = buildArcFromRecovery(settlement, region);

  const created = [];
  for (const q of arcData) {
    const actor = await Actor.create(q);
    created.push(actor);
  }

  const text = `Для ${settlement.name} создана сюжетная арка (${created[0]?.system.chain?.arcType || mode}).`;
  await appendSettlementHistory(settlement, "regionalEvents", text, 12);
  await settlement.update({
    "system.regionSim.lastRegionEvent": text
  });

  return created;
}

function findNextQuestInChain(actor) {
  const chainId = actor.system.chain?.chainId || "";
  const nextStep = Number(actor.system.chain?.step ?? 1) + 1;
  if (!chainId) return null;

  return getQuests().find(q =>
    q.id !== actor.id &&
    (q.system.chain?.chainId || "") === chainId &&
    Number(q.system.chain?.step ?? 1) === nextStep
  ) ?? null;
}

async function activateNextQuestInChain(actor) {
  const nextQuest = findNextQuestInChain(actor);
  if (!nextQuest) return null;

  if ((nextQuest.system.info?.status || "") === "active") return nextQuest;

  await nextQuest.update({
    "system.info.status": "active"
  });

  return nextQuest;
}

function checkQuestAvailability(quest, characterName) {
  const req = quest.system.requirements || {};
  const settlementName = quest.system.info?.targetSettlement || "";
  const factionName = quest.system.info?.targetFaction || "";
  const requiredCharacter = req.requiredCharacter || "";

  if (requiredCharacter && characterName && requiredCharacter !== characterName) {
    return { ok: false, reason: `Квест предназначен для ${requiredCharacter}` };
  }

  const minSettlementRep = Number(req.minSettlementRep ?? 0);
  if (settlementName && minSettlementRep > 0) {
    const score = game.ironHills?.reputation?.getRelationScore?.(characterName, "settlement", settlementName) ?? 0;
    if (score < minSettlementRep) {
      return { ok: false, reason: `Недостаточная репутация с ${settlementName}: нужно ${minSettlementRep}, есть ${score}` };
    }
  }

  const minFactionRep = Number(req.minFactionRep ?? 0);
  if (factionName && minFactionRep > 0) {
    const score = game.ironHills?.reputation?.getRelationScore?.(characterName, "faction", factionName) ?? 0;
    if (score < minFactionRep) {
      return { ok: false, reason: `Недостаточная репутация с ${factionName}: нужно ${minFactionRep}, есть ${score}` };
    }
  }

  return { ok: true, reason: "Квест доступен" };
}

async function grantQuestRewards(quest) {
  if (!quest || quest.type !== "quest") return { ok: false, reason: "Не тот actor" };
  if (quest.system.rewards?.granted) {
    return { ok: false, reason: "Награда уже выдана" };
  }

  const rewards = quest.system.rewards || {};
  const characterName = resolveRewardCharacterName(quest);
  const character = findCharacterByName(characterName);
  const settlementName = quest.system.info?.targetSettlement || "";
  const factionName = quest.system.info?.targetFaction || "";

  let itemReason = "Получатель награды не определён";

  if (character) {
    const itemData = buildRewardItemFromWorldOrFallback(
      rewards.rewardItemType || "",
      rewards.rewardItemName || "",
      Number(rewards.rewardItemQuantity ?? 0),
      Math.max(1, Number(quest.system.info?.difficulty ?? 1))
    );

    if (itemData) {
      const itemResult = await addRewardItemToCharacter(character, itemData);
      itemReason = itemResult.reason;
    } else {
      itemReason = "Не удалось собрать данные предмета награды";
    }
  }

  if (characterName && settlementName && Number(rewards.settlementRep ?? 0) !== 0) {
    await game.ironHills.reputation.adjustRelation(
      characterName,
      "settlement",
      settlementName,
      Number(rewards.settlementRep ?? 0),
      `Награда за квест "${quest.name}"`
    );
  }

  if (characterName && factionName && Number(rewards.factionRep ?? 0) !== 0) {
    await game.ironHills.reputation.adjustRelation(
      characterName,
      "faction",
      factionName,
      Number(rewards.factionRep ?? 0),
      `Награда за квест "${quest.name}"`
    );
  }

  await quest.update({
    "system.rewards.granted": true,
    "system.rewards.rewardCharacter": characterName
  });

  await ChatMessage.create({
    content: `
      <h3>Награда за квест</h3>
      <p><b>Квест:</b> ${quest.name}</p>
      <p><b>Персонаж:</b> ${characterName || "не выбран"}</p>
      <p><b>Серебро:</b> ${rewards.silver ?? 0}</p>
      <p><b>Предмет:</b> ${rewards.rewardItemName || "—"}</p>
      <p><b>Результат выдачи:</b> ${itemReason}</p>
      <p><b>Репутация с поселением:</b> ${rewards.settlementRep ?? 0}</p>
      <p><b>Репутация с фракцией:</b> ${rewards.factionRep ?? 0}</p>
    `
  });

  return {
    ok: true,
    reason: itemReason
  };
}

async function applyQuestOutcome(actor, mode) {
  if (!actor || actor.type !== "quest") return;

  const settlementName = actor.system.info?.targetSettlement || "";
  const poiName = actor.system.info?.targetPOI || "";
  const settlement = findSettlementByName(settlementName);
  const poi = findPoiByName(poiName);

  if (actor.system.info?.status && actor.system.info.status !== "active") {
    ui.notifications.warn("Этот квест уже завершён");
    return;
  }

  const eff = actor.system.effects?.[mode];
  if (!eff) return;

  if (settlement) {
    const prosperity = clamp(Number(settlement.system.info?.prosperity ?? 5) + Number(eff.prosperity ?? 0), 0, 10);
    const danger = clamp(Number(settlement.system.info?.danger ?? 5) + Number(eff.danger ?? 0), 0, 10);
    const supply = clamp(Number(settlement.system.info?.supply ?? 5) + Number(eff.supply ?? 0), 0, 10);
    const stability = clamp(Number(settlement.system.regionSim?.stability ?? 5) + Number(eff.stability ?? 0), 0, 10);
    const militiaPower = clamp(Number(settlement.system.regionSim?.militiaPower ?? 5) + Number(eff.militiaPower ?? 0), 0, 10);
    const tradeBalance = clamp(Number(settlement.system.regionSim?.tradeBalance ?? 0) + Number(eff.tradeBalance ?? 0), -5, 10);
    const caravanTraffic = clamp(Number(settlement.system.regionSim?.caravanTraffic ?? 0) + Number(eff.caravanTraffic ?? 0), -5, 10);

    const update = {
      "system.info.prosperity": prosperity,
      "system.info.danger": danger,
      "system.info.supply": supply,
      "system.regionSim.stability": stability,
      "system.regionSim.militiaPower": militiaPower,
      "system.regionSim.tradeBalance": tradeBalance,
      "system.regionSim.caravanTraffic": caravanTraffic
    };

    if (mode === "success" && eff.resolveCrisis) {
      update["system.regionSim.activeCrisis"] = "";
    }

    await settlement.update(update);

    const text =
      mode === "success"
        ? `Квест "${actor.name}" завершён успешно. Это сказалось на ${settlement.name}.`
        : `Квест "${actor.name}" провален. Это сказалось на ${settlement.name}.`;

    await appendSettlementHistory(settlement, "regionalEvents", text, 12);
    await settlement.update({
      "system.regionSim.lastRegionEvent": text
    });
  }

  if (poi) {
    if (mode === "success" && eff.removeTargetPOI) {
      await poi.delete();
    }

    if (mode === "failure" && eff.empowerTargetPOI) {
      await poi.update({
        "system.state.threatLevel": clamp(Number(poi.system.state?.threatLevel ?? 3) + 1, 0, 10),
        "system.info.danger": clamp(Number(poi.system.info?.danger ?? 3) + 1, 0, 10),
        "system.state.control": clamp(Number(poi.system.state?.control ?? 3) + 1, 0, 10),
        "system.state.lastGeneratedEvent": `Квест "${actor.name}" провален, угроза усилилась`
      });
    }
  }

  const isFinalStep = Number(actor.system.chain?.step ?? 1) >= Number(actor.system.chain?.maxStep ?? 1);
  const chainId = actor.system.chain?.chainId || "";

  await actor.update({
    "system.info.status": mode === "success" ? "success" : "failed",
    "system.chain.arcState": isFinalStep
      ? (mode === "success" ? "completed" : "broken")
      : "active"
  });

  let nextQuest = null;
  if (mode === "success" && actor.system.chain?.autoGenerateNext) {
    nextQuest = await activateNextQuestInChain(actor);
  }

  if (settlement && chainId && isFinalStep) {
    const arcType = actor.system.chain?.arcType || "arc";
    const finalText =
      mode === "success"
        ? `Сюжетная арка (${arcType}) для ${settlement.name} успешно завершена.`
        : `Сюжетная арка (${arcType}) для ${settlement.name} завершилась провалом.`;

    await appendSettlementHistory(settlement, "regionalEvents", finalText, 12);
    await settlement.update({
      "system.regionSim.lastRegionEvent": finalText
    });
  }

  if (mode === "success") {
    await grantQuestRewards(actor);
  }

  await ChatMessage.create({
    content: `
      <h3>Квест: ${actor.name}</h3>
      <p><b>Результат:</b> ${mode === "success" ? "Завершён" : "Провал"}</p>
      <p><b>Тип:</b> ${actor.system.info?.questType || "—"}</p>
      <p><b>Арка:</b> ${actor.system.chain?.arcType || "—"}</p>
      <p><b>Этап:</b> ${actor.system.chain?.step || 1}/${actor.system.chain?.maxStep || 1}</p>
      ${nextQuest ? `<p><b>Открыт следующий этап:</b> ${nextQuest.name}</p>` : ""}
    `
  });
}

async function continueQuestChain(actor) {
  if (!actor || actor.type !== "quest") return;
  const nextQuest = await activateNextQuestInChain(actor);

  if (!nextQuest) {
    ui.notifications.warn("Следующий этап не найден");
    return;
  }

  await ChatMessage.create({
    content: `<h3>Продолжение арки</h3><p>Открыт следующий этап: <b>${nextQuest.name}</b></p>`
  });

  ui.notifications.info(`Открыт следующий этап: ${nextQuest.name}`);
}

function bindQuestSheetButtons(app, html) {
  if (!app?.actor || app.actor.type !== "quest") return;
  if (html.data("iron-hills-quest-bound")) return;
  html.data("iron-hills-quest-bound", true);

  html.find("[data-action='quest-success']").on("click", async event => {
    event.preventDefault();
    await applyQuestOutcome(app.actor, "success");
    app.render(true);
  });

  html.find("[data-action='quest-failure']").on("click", async event => {
    event.preventDefault();
    await applyQuestOutcome(app.actor, "failure");
    app.render(true);
  });

  html.find("[data-action='quest-continue']").on("click", async event => {
    event.preventDefault();
    await continueQuestChain(app.actor);
    app.render(true);
  });

  html.find("[data-action='quest-check']").on("click", async event => {
    event.preventDefault();
    const characterName =
      html.find("[name='system.rewards.rewardCharacter']").val() ||
      html.find("[name='system.requirements.requiredCharacter']").val() ||
      "";

    const result = checkQuestAvailability(app.actor, characterName);

    ui.notifications.info(result.reason);

    await ChatMessage.create({
      content: `<h3>Проверка квеста</h3><p><b>${app.actor.name}</b></p><p>${result.reason}</p>`
    });
  });
}

async function generateSingleQuestFromUi(html) {
  const settlementName = html.find("[name='quest-settlement']").val() || "";
  const region = html.find("[name='region-select']").val() || "";
  const type = html.find("[name='quest-type']").val() || "auto";
  const settlement = settlementName ? findSettlementByName(settlementName) : null;

  const finalType = type === "auto" ? pickQuestTypeWeighted(settlement) : type;
  const quest = await Actor.create(buildQuestByType(finalType, settlement, region));

  await ChatMessage.create({
    content: `<h3>Новый квест</h3><p><b>${quest.name}</b></p><p>Тип: ${quest.system.info.questType}</p>`
  });

  ui.notifications.info(`Создан квест: ${quest.name}`);
}

async function generateQuestPackFromUi(html) {
  const settlementName = html.find("[name='quest-settlement']").val() || "";
  const region = html.find("[name='region-select']").val() || "";
  const settlement = settlementName ? findSettlementByName(settlementName) : null;

  const count = randInt(3, 6);
  const created = [];

  for (let i = 0; i < count; i++) {
    const type = pickQuestTypeWeighted(settlement);
    const quest = await Actor.create(buildQuestByType(type, settlement, region));
    created.push(quest.name);
  }

  await ChatMessage.create({
    content: `<h3>Набор квестов</h3>${created.map(q => `<p>${q}</p>`).join("")}`
  });

  ui.notifications.info(`Создано квестов: ${created.length}`);
}

async function generateRegionalQuestsFromUi(html) {
  const region = html.find("[name='region-select']").val() || "";
  const settlements = getRegionSettlements(region);

  if (!settlements.length) {
    ui.notifications.warn("В выбранном регионе нет поселений");
    return;
  }

  const created = [];
  const count = randInt(2, 4);

  for (let i = 0; i < count; i++) {
    const settlement = choice(settlements);
    const type = pickQuestTypeWeighted(settlement);
    const quest = await Actor.create(buildQuestByType(type, settlement, region));
    created.push(`${quest.name} (${settlement.name})`);
  }

  await ChatMessage.create({
    content: `<h3>Региональные квесты</h3>${created.map(q => `<p>${q}</p>`).join("")}`
  });

  ui.notifications.info(`Создано региональных квестов: ${created.length}`);
}

async function generateStoryArcFromUi(html) {
  const region = html.find("[name='region-select']").val() || "";
  const settlementName = html.find("[name='quest-settlement']").val() || "";
  const arcType = html.find("[name='arc-type']").val() || "auto";

  const settlement = settlementName ? findSettlementByName(settlementName) : null;
  const created = await createStoryArc(settlement, region, arcType);

  if (!created.length) {
    ui.notifications.warn("Не удалось создать арку");
    return;
  }

  await ChatMessage.create({
    content: `<h3>Сюжетная арка</h3>${created.map(q => `<p>${q.system.chain.step}. ${q.name}</p>`).join("")}`
  });

  ui.notifications.info(`Создана арка: ${created.length} этап(а)`);
}

function bindWorldToolsQuestButtons(app, html) {
  if (!app?.title || app.title !== "Iron Hills Tools") return;
  if (html.data("iron-hills-quests-bound")) return;
  html.data("iron-hills-quests-bound", true);

  html.find("[data-action='generate-quest']").on("click", async event => {
    event.preventDefault();
    await generateSingleQuestFromUi(html);
  });

  html.find("[data-action='generate-quest-pack']").on("click", async event => {
    event.preventDefault();
    await generateQuestPackFromUi(html);
  });

  html.find("[data-action='generate-regional-quests']").on("click", async event => {
    event.preventDefault();
    await generateRegionalQuestsFromUi(html);
  });

  html.find("[data-action='generate-story-arc']").on("click", async event => {
    event.preventDefault();
    await generateStoryArcFromUi(html);
  });
}

Hooks.on("renderActorSheet", (app, html) => {
  bindQuestSheetButtons(app, html);
});

Hooks.on("renderApplication", (app, html) => {
  bindWorldToolsQuestButtons(app, html);
});