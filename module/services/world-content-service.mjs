import { NAME_FIRST, NAME_LAST } from "../constants/names.mjs";
import { NPC_SPECIALIZATIONS } from "../constants/npc-profiles.mjs";
import { SKILLS_FLAT } from "../constants/skills.mjs";
import { choice, randInt, clamp } from "../utils/math-utils.mjs";
import { itemDataFromLootLine } from "../utils/loot-line-items.mjs";
import {
  consumeRecipeIngredients as consumeRecipeIngredientsImpl,
  getAvailableIngredientQuantity,
  getItemCatalogId as getItemCatalogIdFromCraftIngredients,
} from "./craft-ingredients.mjs";

export { getAvailableIngredientQuantity, getItemCatalogIdFromCraftIngredients as getItemCatalogId };

/** Бонусы качества крафта: ~10% / 20% / 30% к урону и физ./маг. броне (мин. +1 где применимо). */
export function applyCraftQualityBonuses(resultType, system, quality) {
  if (!system) return system;
  const pct = quality === "fine" ? 0.1 : quality === "masterwork" ? 0.2 : quality === "legendary" ? 0.3 : 0;
  if (pct <= 0) return system;

  if (resultType === "weapon") {
    const d = Number(system.damage ?? 0);
    system.damage = d + Math.max(1, Math.round(d * pct));
    return system;
  }

  if (resultType === "armor") {
    const raw = system.protection && typeof system.protection === "object"
      ? system.protection
      : null;
    const bp = Number(raw?.physical ?? system.resist?.physical ?? system.protection?.physical ?? 0);
    const bm = Number(raw?.magical ?? system.resist?.magical ?? system.protection?.magical ?? 0);
    const addP = Math.max(1, Math.round(bp * pct));
    const addM = bm > 0 ? Math.max(1, Math.round(bm * pct))
      : (quality === "legendary" ? Math.max(1, Math.round(bp * 0.1)) : 0);
    system.protection = {
      ...(raw && typeof raw === "object" ? { ...raw } : {}),
      physical: bp + addP,
      magical: bm + addM,
    };
    if (system.resist !== undefined) delete system.resist;
    return system;
  }

  return system;
}

export function makeName() {
  return `${choice(NAME_FIRST)} ${choice(NAME_LAST)}`;
}

export function getRecipeQualityByMargin(margin) {
  if (margin >= 9) return "legendary";
  if (margin >= 6) return "masterwork";
  if (margin >= 3) return "fine";
  return "common";
}

export function getQualityLabel(quality) {
  const labels = {
    common: "Обычное",
    fine: "Хорошее",
    masterwork: "Мастерское",
    legendary: "Легендарное"
  };
  return labels[quality] ?? quality;
}

export function relationTypeLabel(type) {
  const labels = {
    settlement: "Поселение",
    faction: "Фракция"
  };
  return labels[type] ?? type ?? "Связь";
}

export function getRelationsForCharacter(characterName, characterId = null) {
  return game.actors
    .filter(a => a.type === "relation")
    .filter(a => {
      // Приоритет: по ID, потом по имени
      if (characterId && a.system.info?.characterId)
        return a.system.info.characterId === characterId;
      return (a.system.info?.characterName || "") === characterName;
    })
    .sort((a, b) => {
      const at = a.system.info?.targetType || "";
      const bt = b.system.info?.targetType || "";
      if (at !== bt) return at.localeCompare(bt, "ru");
      return (a.system.info?.targetName || "").localeCompare(b.system.info?.targetName || "", "ru");
    });
}

export function splitRelationsSummary(relations) {
  return {
    settlements: relations.filter(r => r.targetTypeRaw === "settlement"),
    factions: relations.filter(r => r.targetTypeRaw === "faction")
  };
}

export function buildRelationsSummary(actor) {
  const relations = getRelationsForCharacter(actor.name);

  return relations.map(r => {
    const score = Number(r.system.info?.score ?? 0);
    const pct   = Math.round(Math.min(100, Math.max(0, (score + 100) / 2)));
    return {
      id: r.id,
      targetTypeRaw: r.system.info?.targetType || "",
      targetType: relationTypeLabel(r.system.info?.targetType || ""),
      targetName: r.system.info?.targetName || "—",
      score,
      tier:     r.system.info?.tier  || "neutral",
      notes:    r.system.info?.notes || "",
      relPct:   pct,
      relLeft:  pct < 50 ? pct : 50,
      relationPositive: score > 0,
    };
  });
}

export function buildWeapon(name, tier, opts = {}) {
  const skill = opts.skill ?? "sword";
  return {
    name,
    type: "weapon",
    system: {
      tier,
      quality: opts.quality ?? "common",
      weight: opts.weight ?? 2,
      quantity: opts.quantity ?? 1,
      damage: opts.damage ?? (2 + tier),
      damageType: opts.damageType ?? "physical",
      skill,
      twoHanded: opts.twoHanded ?? false,
      energyCost: opts.energyCost ?? (8 + tier),
      range: opts.range ?? defaultRangeBySkill(skill),
      affixes: {
        ignoreArmor:        Number(opts.affixes?.ignoreArmor        ?? 0),
        disarmChance:       Number(opts.affixes?.disarmChance       ?? 0),
        stunChance:         Number(opts.affixes?.stunChance         ?? 0),
        bleedingBonus:      Number(opts.affixes?.bleedingBonus      ?? 0),
        lifeSteal:          Number(opts.affixes?.lifeSteal          ?? 0),
        executeBelowHp:     Number(opts.affixes?.executeBelowHp     ?? 0),
        criticalDamageMult: Number(opts.affixes?.criticalDamageMult ?? 1),
      }
    }
  };
}

function defaultRangeBySkill(skill) {
  const m = { knife:1, sword:1, axe:1, mace:1, flail:1, spear:2, bow:8, crossbow:10, throwing:4, exotic:1 };
  return m[skill] ?? 1;
}

export function buildArmor(name, tier, slot, physical, magical = 0, weight = 2) {
  return {
    name,
    type: "armor",
    system: {
      tier,
      quality: "common",
      weight,
      quantity: 1,
      slot,
      protection: {
        physical,
        magical
      }
    }
  };
}

export function buildFood(name, tier, satiety, hydration, weight = 1, quantity = 1) {
  return {
    name,
    type: "food",
    system: {
      tier,
      quality: "common",
      weight,
      quantity,
      satiety,
      hydration
    }
  };
}

function actionConfigFromEffect(effectType, targetPart = "torso") {
  const map = {
    healHP: ["heal-part", "targeted", "selected-or-self", targetPart],
    heal: ["heal-part", "targeted", "selected-or-self", targetPart],
    healAll: ["heal-body", "global", "self", ""],
    restoreEnergy: ["restore-energy", "global", "self", ""],
    restoreEnergyMax: ["restore-energy-max", "global", "self", ""],
    restoreMana: ["restore-mana", "global", "self", ""],
    restoreHydration: ["restore-hydration", "global", "self", ""],
    restoreSatiety: ["restore-satiety", "global", "self", ""],
    curePoison: ["cure-poison", "global", "selected-or-self", ""],
    cureDisease: ["cure-disease", "global", "selected-or-self", ""],
  };
  const [actionType = "", applicationScope = "global", targetActorMode = "self", resolvedPart = ""] = map[effectType] ?? [];
  return { actionType, applicationScope, targetActorMode, targetPart: resolvedPart };
}

export function buildPotion(name, tier, effectType, power, targetPart = "torso", quantity = 1) {
  const action = actionConfigFromEffect(effectType, targetPart);
  return {
    name,
    type: "potion",
    system: {
      tier,
      quality: "common",
      weight: 1,
      quantity,
      effect: effectType,
      effectType,
      actionType: action.actionType,
      applicationScope: action.applicationScope,
      targetActorMode: action.targetActorMode,
      power,
      targetPart: action.targetPart || targetPart
    }
  };
}

export function buildScroll(name, tier, school, effectType, power, targetPart = "torso") {
  return {
    name,
    type: "scroll",
    system: {
      tier,
      quality: "common",
      weight: 0,
      quantity: 1,
      school,
      effectType,
      damageType: "magical",
      power,
      energyCost: 0,
      targetPart
    }
  };
}

export function buildThrowable(name, tier, power, damageType = "physical", poison = 0, burning = 0, targetPart = "torso", quantity = 1) {
  return {
    name,
    type: "throwable",
    system: {
      tier,
      quality: "common",
      weight: 1,
      quantity,
      effectType: "damage",
      damageType,
      power,
      energyCost: 8 + tier,
      targetPart,
      targetZone: "",
      friendlyFire: false,
      aoe: {
        type: "blast",
        shape: "circle",
        distance: 0,
        maxTargets: 0,
        chainDecay: 1
      },
      appliesPoison: poison,
      appliesBurning: burning
    }
  };
}

export function buildConsumable(name, tier, effectType, power, quantity = 1) {
  const action = actionConfigFromEffect(effectType);
  return {
    name,
    type: "consumable",
    system: {
      tier,
      quality: "common",
      weight: 1,
      quantity,
      effectType,
      actionType: action.actionType,
      applicationScope: action.applicationScope,
      targetActorMode: action.targetActorMode,
      targetPart: action.targetPart,
      power
    }
  };
}

export function buildMaterial(name, tier, category, quantity = 1, weight = 1) {
  return {
    name,
    type: "material",
    system: {
      tier,
      weight,
      quantity,
      category
    }
  };
}

export function buildResource(name, tier, category, quantity = 1, weight = 1) {
  return {
    name,
    type: "resource",
    system: {
      tier,
      weight,
      quantity,
      category
    }
  };
}

export function buildTool(name, tier, craftType, quantity = 1) {
  return {
    name,
    type: "tool",
    system: {
      tier,
      weight: 2,
      quantity,
      craftType
    }
  };
}

export function randomMerchantStock(specialty, tier) {
  const stock = [];

  if (specialty === "general") {
    stock.push(
      buildFood("Сухари", tier, 10, 0, 1, randInt(2, 6)),
      buildFood("Вода во фляге", tier, 0, 20, 1, randInt(1, 4)),
      buildConsumable("Бинт", tier, "reduceBleeding", 1, randInt(2, 5)),
      buildPotion("Малое зелье энергии", tier, "restoreEnergy", 12 + tier * 2, "torso", randInt(1, 3)),
      buildMaterial("Пакля", tier, "fiber", randInt(2, 5), 1)
    );
  }

  if (specialty === "blacksmith") {
    stock.push(
      buildWeapon("Железный меч", tier, { skill: "sword", damage: 2 + tier, weight: 3 }),
      buildWeapon("Колющее копьё", tier, { skill: "spear", damage: 2 + tier, weight: 3, twoHanded: true }),
      buildArmor("Кожаный нагрудник", tier, "torso", 1 + tier, 0, 4),
      buildMaterial("Железная заготовка", tier, "metal", randInt(3, 8), 1),
      buildTool("Кузнечный набор", tier, "blacksmithing", 1)
    );
  }

  if (specialty === "alchemist") {
    stock.push(
      buildPotion("Малое зелье лечения", tier, "healHP", 8 + tier * 2, "torso", randInt(1, 3)),
      buildPotion("Малое зелье маны", tier, "restoreMana", 8 + tier * 2, "torso", randInt(1, 3)),
      buildThrowable("Огненная колба", tier, 2 + tier, "magical", 0, 2, "torso", randInt(1, 3)),
      buildConsumable("Противоядие", tier, "curePoison", 1 + Math.floor(tier / 2), randInt(1, 3)),
      buildMaterial("Сушёные травы", tier, "herbs", randInt(3, 8), 1)
    );
  }

  if (specialty === "hunter") {
    stock.push(
      buildThrowable("Метательный нож", tier, 2 + tier, "physical", 0, 0, "torso", randInt(2, 6)),
      buildFood("Вяленое мясо", tier, 18, 0, 1, randInt(2, 5)),
      buildMaterial("Сырая шкура", tier, "hide", randInt(2, 5), 1),
      buildMaterial("Мясо дичи", tier, "meat", randInt(2, 5), 1)
    );
  }

  if (specialty === "innkeeper") {
    stock.push(
      buildFood("Похлёбка", tier, 25, 5, 1, randInt(2, 5)),
      buildFood("Эль", tier, 5, 10, 1, randInt(2, 5)),
      buildFood("Жаркое", tier, 35, 0, 1, randInt(1, 3)),
      buildConsumable("Чистая повязка", tier, "reduceBleeding", 1, randInt(1, 3))
    );
  }

  return stock.flat();
}

export function randomContainerLoot(theme, tier) {
  const loot = [];

  if (theme === "bandit") {
    loot.push(
      buildWeapon("Ржавый нож", tier, { skill: "knife", damage: 1 + tier, weight: 1, quantity: 1 }),
      buildFood("Сухари", tier, 10, 0, 1, randInt(1, 3)),
      buildConsumable("Бинт", tier, "reduceBleeding", 1, randInt(1, 2)),
      buildThrowable("Метательный нож", tier, 2 + tier, "physical", 0, 0, "torso", randInt(1, 3))
    );
  }

  if (theme === "ruins") {
    loot.push(
      buildScroll("Свиток искры", tier, "fire", "damage", 2 + tier, "torso"),
      buildResource("Флакон воды", tier, "water", randInt(1, 2), 1),
      buildMaterial("Старая древесина", tier, "wood", randInt(1, 4), 1),
      buildMaterial("Каменный обломок", tier, "stone", randInt(1, 4), 1)
    );
  }

  if (theme === "hunter") {
    loot.push(
      buildMaterial("Мясо дичи", tier, "meat", randInt(1, 3), 1),
      buildMaterial("Сырая шкура", tier, "hide", randInt(1, 3), 1),
      buildFood("Вода во фляге", tier, 0, 20, 1, randInt(1, 2))
    );
  }

  if (theme === "alchemy") {
    loot.push(
      buildPotion("Малое зелье лечения", tier, "healHP", 8 + tier * 2, "torso", randInt(1, 2)),
      buildConsumable("Противоядие", tier, "curePoison", 1, randInt(1, 2)),
      buildThrowable("Огненная колба", tier, 2 + tier, "magical", 0, 2, "torso", randInt(1, 2)),
      buildMaterial("Сушёные травы", tier, "herbs", randInt(2, 4), 1)
    );
  }

  return loot.flat();
}

/**
 * Просные вещи в карманах / сумке случайного NPC (еда/материалы из каталога).
 * Вызывается генератором мира после ролевых предметов.
 */
export function buildNpcCarryInventoryItems(roleKey, tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  const out = [];
  const push = (type, catalogId, qty) => {
    const q = Math.max(1, Number(qty) || 1);
    const d = itemDataFromLootLine({ type, catalogId, qty: q });
    if (d) out.push(d);
  };

  push("food", "bread", randInt(1, 2));
  if (t >= 3) push("food", "trail_rations", 1);

  switch (roleKey) {
    case "villager":
      push("material", "cloth", randInt(1, 2));
      push("material", "herb_common", randInt(1, 2));
      break;
    case "guard":
      push("material", "tin_ore", randInt(1, 2));
      push("material", "tanned_leather", 1);
      if (t >= 4) push("material", "iron_ore", 1);
      break;
    case "bandit":
      push("food", "dried_meat", 1);
      push("material", "rope", 1);
      push("material", "copper_ore", randInt(1, 2));
      break;
    case "mage":
      push("material", "herb_healing", randInt(1, 2));
      if (t >= 5) push("material", "mana_stone", 1);
      if (t >= 7) push("material", "quartz", randInt(1, 3));
      break;
    case "crafter":
      push("material", "tanned_leather", randInt(1, 2));
      push("material", "copper_ingot", 1);
      break;
    case "hunter":
      push("food", "trail_rations", randInt(1, 2));
      push("material", "rope", randInt(1, 2));
      break;
    case "noble":
      push("material", "cloth", randInt(2, 4));
      if (t >= 8) push("material", "mana_crystal", 1);
      break;
    case "priest":
      push("material", "herb_healing", randInt(1, 3));
      break;
    default:
      break;
  }

  return out;
}

export function buildNpcSystem(roleKey, tier, faction) {
  const profile = NPC_SPECIALIZATIONS[roleKey] ?? NPC_SPECIALIZATIONS.villager;
  const t = Math.max(1, Math.min(10, Number(tier) || 1));

  const skills = Object.fromEntries(
    SKILLS_FLAT.map((s) => [s.key, { value: 1, exp: 0, expNext: 25 }])
  );

  for (const [sk, val] of Object.entries(profile.skills ?? {})) {
    if (skills[sk]) skills[sk].value = val + Math.max(0, t - 1);
  }

  const hpScale = 1 + 0.09 * Math.max(0, t - 1);
  const partStatus = () => ({
    minorBleeding: 0,
    majorBleeding: 0,
    fracture: false,
    destroyed: false,
    splinted: false,
    tourniquet: false
  });
  const part = (n) => ({
    value: Math.round(n * hpScale),
    max: Math.round(n * hpScale),
    status: partStatus()
  });

  const eMax = Math.min(100, (profile.energy ?? 10) + t * 5);
  const priestOrMage = roleKey === "mage" || roleKey === "priest";
  const mMax = Math.min(
    100,
    (profile.mana ?? 2) + (priestOrMage ? t * 4 : Math.floor(t / 2))
  );

  return {
    resources: {
      hp: {
        head: part(35),
        torso: part(85),
        abdomen: part(70),
        leftArm: part(60),
        rightArm: part(60),
        leftLeg: part(65),
        rightLeg: part(65),
      },
      energy: { value: eMax, max: eMax },
      mana: { value: mMax, max: mMax },
      satiety: { value: 100, max: 100 },
      hydration: { value: 100, max: 100 },
      weight: { value: 0, max: 20 + t * 2 }
    },
    conditions: {
      bleeding: 0,
      shock: 0,
      poison: 0,
      burning: 0,
      fractures: {
        leftArm: false,
        rightArm: false,
        leftLeg: false,
        rightLeg: false
      }
    },
    combat: {
      defense: (profile.defense ?? 0) + Math.max(0, t - 1),
      unarmedDamage: 5 + 5 * Math.floor(t / 3),
    },
    equipment: {
      rightHand: "",
      leftHand: "",
      armorHead: "",
      armorTorso: "",
      armorArms: "",
      armorLegs: ""
    },
    quickSlots: {
      unlocked: 2,
      slot1: "",
      slot2: "",
      slot3: "",
      slot4: "",
      slot5: "",
      slot6: ""
    },
    info: {
      role: profile.label,
      specialization: roleKey,
      faction: faction ?? "",
      tier: t,
      desc: "",
      lootTable: "",
      allowPickpocket: true,
      pickpocketTable: "",
      bestiaryId: "",
    },
    economy: {
      coins: 10 + t * 25
    },
    skills
  };
}

export function makeSettlementEvent(actor) {
  const p = Number(actor.system.info.prosperity ?? 5);
  const d = Number(actor.system.info.danger ?? 5);
  const s = Number(actor.system.info.supply ?? 5);

  if (d >= 8) {
    return choice([
      "На тракте замечены вооружённые налётчики.",
      "В окрестностях пропадают люди и вьючные животные.",
      "Ночная стража просит о подкреплении."
    ]);
  }

  if (p >= 8) {
    return choice([
      "В поселение прибыло больше торговцев, чем обычно.",
      "Местные мастера начали расширять мастерские.",
      "На рынке появились редкие и качественные товары."
    ]);
  }

  if (s <= 3) {
    return choice([
      "На складе заканчиваются запасы зерна и соли.",
      "Жители жалуются на нехватку воды и дров.",
      "Цены на еду заметно выросли."
    ]);
  }

  return choice([
    "Неделя прошла спокойно, но слухи множатся.",
    "Несколько путников принесли противоречивые новости.",
    "На окраинах видели незнакомый лагерь.",
    "Ремесленники спорят о ценах и поставках.",
    "Охотники сообщают о следах крупного зверя."
  ]);
}

export function makeSettlementRumor(actor) {
  const name = actor.name;
  const d = Number(actor.system.info.danger ?? 5);
  const p = Number(actor.system.info.prosperity ?? 5);

  if (d >= 8) {
    return choice([
      `Говорят, что рядом с ${name} собирается новая банда.`,
      `Ходит слух, что дороги возле ${name} скоро станут совсем опасными.`,
      `Люди шепчутся о ночных кострах в лесу возле ${name}.`
    ]);
  }

  if (p >= 8) {
    return choice([
      `Говорят, что в ${name} можно выгодно сбыть товар.`,
      `Шепчутся, будто в ${name} появился богатый покровитель ремесленников.`,
      `Путники рассказывают, что у рынка ${name} хороший сезон.`
    ]);
  }

  return choice([
    `Слух идёт, что в ${name} ищут работников и наёмников.`,
    `Говорят, что в ${name} появился новый торговец с редким товаром.`,
    `Ходит слух, что рядом с ${name} нашли старые руины.`,
    `Поговаривают, что в ${name} скоро будет неспокойно.`
  ]);
}

export async function appendSettlementHistory(actor, field, text, limit = 10) {
  const arr = Array.isArray(actor.system.history?.[field]) ? [...actor.system.history[field]] : [];
  arr.unshift(text);
  const trimmed = arr.slice(0, limit);
  await actor.update({
    [`system.history.${field}`]: trimmed
  });
}

export async function consumeRecipeIngredients(actor, ingredients, recipeResultTier = 1) {
  return consumeRecipeIngredientsImpl(actor, ingredients, recipeResultTier);
}
// ─── Контекстные квесты из кризисов ─────────────────────

const CRISIS_QUESTS = {
  "Всплеск бандитизма": [
    {
      title: "Зачистить дорогу",
      description: "На тракте орудует банда. Торговля остановилась — найдите и устраните угрозу.",
      reward: "Плата стражи + доля добычи",
      difficulty: 6, type: "combat"
    },
    {
      title: "Найти логово",
      description: "Бандиты где-то прячутся. Выследите их лагерь и сообщите стражнику.",
      reward: "Награда за информацию",
      difficulty: 5, type: "exploration"
    },
  ],
  "Порча урожая": [
    {
      title: "Найти альтернативные запасы",
      description: "Деревне нужна еда. Найдите торговца или охотничьи угодья в округе.",
      reward: "Бартер + благодарность общины",
      difficulty: 4, type: "social"
    },
    {
      title: "Выяснить причину",
      description: "Урожай гибнет — это болезнь растений, вредители, или чья-то злая воля?",
      reward: "Плата старосты",
      difficulty: 5, type: "investigation"
    },
  ],
  "Военный порядок": [
    {
      title: "Сопроводить отряд",
      description: "Местная стража выходит на патруль. Нужны опытные бойцы для поддержки.",
      reward: "Плата от гарнизона",
      difficulty: 5, type: "combat"
    },
  ],
  "Торговый бум": [
    {
      title: "Охрана каравана",
      description: "Торговцы нанимают охрану для ценного груза. Путь неблизкий.",
      reward: "Хорошая плата монетами",
      difficulty: 4, type: "escort"
    },
  ],
  "Разрушенные дороги": [
    {
      title: "Расчистить завал",
      description: "Дорога непроходима из-за оползня. Нужны руки и инструменты.",
      reward: "Плата от купеческой гильдии",
      difficulty: 3, type: "work"
    },
  ],
  "Поток переселенцев": [
    {
      title: "Найти пропавшую семью",
      description: "Среди беженцев потерялась семья с детьми. Последний раз их видели у развилки.",
      reward: "Благодарность + скромная плата",
      difficulty: 4, type: "investigation"
    },
  ],
};

// Базовые квесты когда нет кризиса
const BASE_QUESTS = [
  {
    title: "Доставить посылку",
    description: "Местный торговец просит передать груз в соседнее поселение.",
    reward: "Плата монетами",
    difficulty: 3, type: "delivery"
  },
  {
    title: "Зачистить подвал",
    description: "В складе завелась нечисть. Хозяин не может добраться до запасов.",
    reward: "Бесплатное жильё + еда",
    difficulty: 4, type: "combat"
  },
  {
    title: "Собрать травы",
    description: "Местный знахарь нуждается в редких растениях из леса.",
    reward: "Зелья и лекарства",
    difficulty: 3, type: "exploration"
  },
  {
    title: "Разобраться в споре",
    description: "Два торговца поспорили о сделке. Нужен честный арбитр.",
    reward: "Уважение обоих + плата",
    difficulty: 3, type: "social"
  },
  {
    title: "Найти пропавшего",
    description: "Шахтёр не вернулся с работы. Семья в отчаянии.",
    reward: "Всё что было при пропавшем",
    difficulty: 5, type: "investigation"
  },
];

export function generateQuestForSettlement(settlement) {
  const crisis = settlement.system?.regionSim?.activeCrisis ?? "";
  const danger = Number(settlement.system?.info?.danger ?? 5);
  const name   = settlement.name;

  const pool = CRISIS_QUESTS[crisis] ?? BASE_QUESTS;
  const base = pool[Math.floor(Math.random() * pool.length)];

  return {
    ...base,
    location:    name,
    settlementId: settlement.id,
    generated:   new Date().toISOString(),
    // Сложность растёт с опасностью
    difficulty: Math.min(10, (base.difficulty ?? 4) + Math.floor(Math.max(0, danger - 5) / 2)),
  };
}

// Контекстные имена по культуре региона
const REGIONAL_NAMES = {
  nordic: {
    first: ["Бьорн", "Хельга", "Торвен", "Эйрик", "Сигрун", "Ульф", "Рагна", "Кнут", "Фрея", "Лейф"],
    last:  ["Железный", "Северный", "Каменный", "Снежный", "Грозный", "Скальный", "Волчий"],
  },
  slavic: {
    first: ["Богдан", "Светлана", "Ждан", "Мирослав", "Добрыня", "Людмила", "Радомир", "Велена"],
    last:  ["Кузнецов", "Речной", "Холмский", "Медный", "Воронов", "Болотный", "Старков"],
  },
  common: {
    first: ["Арен", "Кир", "Леон", "Нор", "Тален", "Эрвин", "Юран", "Велан", "Дарен", "Зор"],
    last:  ["Серый", "Долинный", "Лесной", "Горный", "Дымов", "Охотников", "Пепельный"],
  },
};

export function makeContextualName(culture = "common", gender = null) {
  const names = REGIONAL_NAMES[culture] ?? REGIONAL_NAMES.common;
  const first = names.first[Math.floor(Math.random() * names.first.length)];
  const last  = names.last[Math.floor(Math.random() * names.last.length)];
  return `${first} ${last}`;
}

// Товары торговца из реального supply поселения
export function getContextualMerchantStock(settlement, specialty, tier = 1) {
  const supply     = Number(settlement?.system?.info?.supply ?? 5);
  const danger     = Number(settlement?.system?.info?.danger ?? 5);
  const prosperity = Number(settlement?.system?.info?.prosperity ?? 5);

  // Базовый список + контекстные бонусы
  const items = randomMerchantStock(specialty, tier);

  // При хорошем снабжении — больше еды и материалов
  if (supply >= 7 && (specialty === "general" || specialty === "innkeeper")) {
    items.push(buildFood("Свежий хлеб", tier, 8, 5, 0.3));
    items.push(buildFood("Копчёное мясо", tier, 15, 3, 0.8));
  }

  // При высокой опасности — больше оружия
  if (danger >= 7 && (specialty === "blacksmith" || specialty === "general")) {
    items.push(buildWeapon("Простой нож", 1, { skill: "knife", damage: 2, weight: 0.5 }));
  }

  // При процветании — редкие товары
  if (prosperity >= 8) {
    items.push(buildPotion("Зелье бодрости", tier, "restoreEnergy", tier * 3, "torso", 1));
  }

  return items;
}
