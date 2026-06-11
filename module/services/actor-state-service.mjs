import { SKILL_GROUPS } from "../constants/skills.mjs";
import {
  SPELL_SCHOOL_ALIASES,
  SPELL_SCHOOL_KEYS,
  SPELL_SCHOOLS,
  normalizeSpellSchoolKey,
} from "../constants/spells-catalog.mjs";
import { num, clamp } from "../utils/math-utils.mjs";
import { getExpNext } from "../utils/text-utils.mjs";
import {
  itemTypeLabel,
  getItemQuickSlotIcon,
  getComputedItemUnitPrice,
  getComputedItemTotalPrice,
  getItemEffectLabel
} from "../utils/item-utils.mjs";
import {
  buildInventoryItemActionView,
  getInventoryItemActionConfig,
  getInventoryItemActionKeysForItem,
} from "../utils/actor-inventory-action-config.mjs";
import {
  getActorCurrency,
  getMerchantWealth,
  getMerchantMarkup
} from "../utils/actor-utils.mjs";
import { isItemGridPlaced } from "./inventory-service.mjs";
import {
  getActiveConditionEntries,
  getConditionActionModifiers,
  isConditionActive,
} from "./condition-policy-service.mjs";
import {
  getAttackBlockState,
  normalizeAttackMode,
} from "./combat-attack-mode-service.mjs";
import { getDamageResistanceValue } from "./damage-type-service.mjs";
import {
  getActorBodyTraumaSummary,
  getBodyPartTraumaStatus,
} from "./body-trauma-service.mjs";
import {
  getItemActionType,
  getItemTargetActorMode,
} from "./item-effect-service.mjs";
import { buildCombatChatCard } from "./combat-chat-service.mjs";

export function getHitLocation(rollTotal) {
  const r = Number(rollTotal);
  // d20: шея ниже или равна по частоте голове (5% шея, 10% голова при броске 2–3)
  if (r <= 1) return "neck";
  if (r <= 3) return "head";
  if (r <= 7) return "torso";
  if (r <= 10) return "abdomen";
  if (r <= 13) return "leftArm";
  if (r <= 16) return "rightArm";
  if (r <= 18) return "leftLeg";
  return "rightLeg";
}

/** Куда записывается урон при попадании в зону (шея без отдельного пула HP → торс). */
export function resolveDamageHpKey(locationKey) {
  if (locationKey === "neck") return "torso";
  return locationKey ?? null;
}

/**
 * Шанс «урон пришёлся в щит» после успешного попадания (0..1).
 * Зависит от навыка «Щит» цели; верхний предел ~55%.
 */
export function getShieldInterceptChance(shieldSkillValue) {
  const v = Math.max(0, Number(shieldSkillValue ?? 0));
  return Math.min(0.55, 0.06 + v * 0.045);
}

export function getHitLabel(key) {
  const labels = {
    head: "Голова",
    neck: "Шея",
    torso: "Торс",
    abdomen: "Живот",
    leftArm: "Левая рука",
    rightArm: "Правая рука",
    leftLeg: "Левая нога",
    rightLeg: "Правая нога",
    shield: "Щит"
  };
  return labels[key] ?? key;
}

export function getTargetPartLabel(part) {
  return getHitLabel(part);
}

export function getArmorSlotKey(slot) {
  const map = {
    head: "head",
    neck: "neck",
    torso: "torso",
    abdomen: "torso",
    leftArm: "leftArm",
    rightArm: "rightArm",
    arms: "leftArm",
    legs: "legs",
    leftLeg: "legs",
    rightLeg: "legs",
    shield: "leftHand"
  };
  return map[slot] ?? null;
}

export function getArmorSlotForLocation(locationKey) {
  if (locationKey === "head") return "head";
  if (locationKey === "neck") return "neck";
  if (locationKey === "torso" || locationKey === "abdomen") return "torso";
  if (locationKey === "leftArm" || locationKey === "rightArm") return locationKey;
  if (locationKey === "leftLeg" || locationKey === "rightLeg") return "legs";
  return null;
}

export function getEquippedArmorForLocation(actor, locationKey, damageType = "physical") {
  if (!actor) return null;

  const zone = locationKey === "shield" ? "torso" : locationKey;
  const equip = actor.system?.equipment ?? {};
  let bestArmor = null;
  let bestReduction = -1;

  for (const [slot, itemId] of Object.entries(equip)) {
    if (!itemId) continue;
    const item = actor.items.get(itemId);
    if (!item || item.type !== "armor") continue;

    const covers = getArmorCovers(item, slot);
    if (!covers.includes(zone)) continue;

    const reduction = getDamageReduction(item, damageType);
    if (reduction > bestReduction) {
      bestArmor = item;
      bestReduction = reduction;
    }
  }

  return bestArmor;
}

export function getDamageReduction(armorItem, damageType) {
  if (!armorItem || armorItem.type !== "armor") return 0;

  const durVal   = Number(armorItem.system?.durability?.value ?? 100);
  const durMax   = Number(armorItem.system?.durability?.max   ?? 100);
  const durRatio = durMax > 0 ? Math.max(0, durVal / durMax) : 1;
  const scale    = durRatio >= 0.5 ? 1 : durRatio * 2;

  const val = getDamageResistanceValue(armorItem.system ?? {}, damageType);
  return Math.floor(val * scale);
}

/**
 * Карта по умолчанию: ключ слота экипировки → какие зоны тела этот слот покрывает.
 * Используется когда у предмета не задано system.covers.
 */
export const DEFAULT_SLOT_COVERS = Object.freeze({
  head:       ["head"],
  neck:       ["neck"],
  torso:      ["torso", "abdomen"],
  torsoUnder: ["torso", "abdomen"],
  leftArm:    ["leftArm"],
  rightArm:   ["rightArm"],
  legs:       ["leftLeg", "rightLeg"],
  armorHead:  ["head"],
  armorTorso: ["torso", "abdomen"],
  armorArms:  ["leftArm", "rightArm"],
  armorLegs:  ["leftLeg", "rightLeg"],
});

function getArmorCovers(item, slot) {
  const explicit = item?.system?.covers;
  if (Array.isArray(explicit) && explicit.length > 0) return explicit;
  return DEFAULT_SLOT_COVERS[slot] ?? [];
}

/**
 * Возвращает лучший резист для зоны из всех слоёв брони.
 * Используется вместо getEquippedArmorForLocation когда нужен стек.
 */
export function getBestResistForZone(actor, zone, damageType = "physical") {
  const equip = actor.system?.equipment ?? {};

  let best = 0;
  for (const [slot, itemId] of Object.entries(equip)) {
    if (!itemId) continue;
    const item = actor.items.get(itemId);
    if (!item || item.type !== "armor") continue;
    const covers = getArmorCovers(item, slot);
    if (!covers.includes(zone)) continue;
    const r = getDamageReduction(item, damageType);
    if (r > best) best = r;
  }
  return best;
}

export function getEncumbranceInfo(actor) {
  const current = Number(actor.system.resources?.weight?.value ?? 0);
  const max = Math.max(1, Number(actor.system.resources?.weight?.max ?? 1));
  const ratio = current / max;

  if (ratio < 0.5) return { label: "Лёгкая", ratio, attackPenalty: 0, energyMultiplier: 1 };
  if (ratio < 0.75) return { label: "Средняя", ratio, attackPenalty: 0, energyMultiplier: 1.25 };
  if (ratio <= 1) return { label: "Тяжёлая", ratio, attackPenalty: 1, energyMultiplier: 1.5 };
  return { label: "Критическая", ratio, attackPenalty: 2, energyMultiplier: 2 };
}

function getLimbStatusInfo(actor, partKey) {
  return getBodyPartTraumaStatus(actor, partKey);
}

function getAllLimbStatusMap(actor) {
  return getActorBodyTraumaSummary(actor).parts;
}

function clampNonNegativeInt(value) {
  return Math.max(0, Math.floor(Number(value ?? 0)));
}

function getSynchronousDiseasePenalties(actor) {
  const penalties = {
    attackPenalty: 0,
    castPenalty: 0,
  };

  const diseaseData = actor?.system?.diseases ?? {};
  const diseaseCatalog = globalThis._IH_DISEASES ?? {};

  for (const [key, data] of Object.entries(diseaseData)) {
    if (!data || Number(data.stage ?? -1) < 0) continue;

    const def = diseaseCatalog[key];
    const stage = def?.stages?.[Number(data.stage ?? 0)];
    for (const symptom of (stage?.symptoms ?? [])) {
      if (symptom.type === "attackPenalty") penalties.attackPenalty += Number(symptom.value ?? 0);
      if (symptom.type === "castPenalty") penalties.castPenalty += Number(symptom.value ?? 0);
    }
  }

  return penalties;
}

export function getActorInjuryInfo(actor) {
  const conditions = actor.system.conditions ?? {};
  const traumaSummary = getActorBodyTraumaSummary(actor);
  const parts = traumaSummary.parts ?? {};

  const leftArm = parts.leftArm ?? getLimbStatusInfo(actor, "leftArm");
  const rightArm = parts.rightArm ?? getLimbStatusInfo(actor, "rightArm");
  const leftLeg = parts.leftLeg ?? getLimbStatusInfo(actor, "leftLeg");
  const rightLeg = parts.rightLeg ?? getLimbStatusInfo(actor, "rightLeg");

  const leftArmDisabled = Boolean(leftArm.destroyed);
  const rightArmDisabled = Boolean(rightArm.destroyed);
  const leftLegDisabled = Boolean(leftLeg.destroyed);
  const rightLegDisabled = Boolean(rightLeg.destroyed);

  const leftArmFractured = Boolean(leftArm.fracture);
  const rightArmFractured = Boolean(rightArm.fracture);
  const leftLegFractured = Boolean(leftLeg.fracture);
  const rightLegFractured = Boolean(rightLeg.fracture);

  const minorBleedingTotal = Number(traumaSummary.minorBleedingTotal ?? 0);
  const majorBleedingRawTotal = Number(traumaSummary.majorBleedingRawTotal ?? 0);
  const majorBleedingTotal = Number(traumaSummary.majorBleedingTotal ?? 0);
  const abdomenEnergyPenalty = Number(traumaSummary.abdomenEnergyPenalty ?? 0);

  const legacyBleeding = Math.max(0, Number(conditions.bleeding ?? 0));
  const derivedBleeding = minorBleedingTotal + (majorBleedingTotal * 2);
  const bleeding = Math.max(legacyBleeding, derivedBleeding);

  const shock = Math.max(0, Number(conditions.shock ?? 0));
  const poison = Math.max(0, Number(conditions.poison ?? 0));
  const burning = Math.max(0, Number(conditions.burning ?? 0));

  const armFracturePenalty =
    (leftArmFractured ? 1 : 0) +
    (rightArmFractured ? 1 : 0);

  const legFracturePenalty =
    (leftLegFractured ? 1 : 0) +
    (rightLegFractured ? 1 : 0);

  const disabledArmCount =
    (leftArmDisabled ? 1 : 0) +
    (rightArmDisabled ? 1 : 0);

  const disabledLegCount =
    (leftLegDisabled ? 1 : 0) +
    (rightLegDisabled ? 1 : 0);

  const bleedPressurePenalty = Math.floor(bleeding / 2);

  const meleePenalty =
    shock +
    bleedPressurePenalty +
    armFracturePenalty +
    Math.floor(legFracturePenalty / 2);

  const throwPenalty =
    shock +
    bleedPressurePenalty +
    armFracturePenalty +
    disabledArmCount;

  const castPenalty =
    shock +
    majorBleedingTotal +
    armFracturePenalty;

  const movementPenalty =
    bleedPressurePenalty +
    abdomenEnergyPenalty +
    legFracturePenalty +
    (disabledLegCount * 2);

  const manipulationPenalty =
    bleedPressurePenalty +
    armFracturePenalty +
    disabledArmCount;

  const diseasePenalties = getSynchronousDiseasePenalties(actor);
  const conditionModifiers = getConditionActionModifiers(conditions);
  const totalMeleePenalty =
    meleePenalty +
    diseasePenalties.attackPenalty +
    conditionModifiers.meleePenalty;
  const totalThrowPenalty = throwPenalty + conditionModifiers.throwPenalty;
  const totalCastPenalty =
    castPenalty +
    diseasePenalties.castPenalty +
    conditionModifiers.castPenalty;
  const totalMovementPenalty = movementPenalty + conditionModifiers.movementPenalty;
  const totalManipulationPenalty = manipulationPenalty + conditionModifiers.manipulationPenalty;

  return {
    leftArmDisabled,
    rightArmDisabled,
    leftLegDisabled,
    rightLegDisabled,

    leftArmFractured,
    rightArmFractured,
    leftLegFractured,
    rightLegFractured,

    bothArmsDisabled: leftArmDisabled && rightArmDisabled,
    bothLegsDisabled: leftLegDisabled && rightLegDisabled,

    minorBleedingTotal,
    majorBleedingTotal,
    majorBleedingRawTotal,
    suppressedMajorBleedingTotal: Math.max(0, majorBleedingRawTotal - majorBleedingTotal),
    bleeding,
    shock,
    poison,
    burning,
    abdomenEnergyPenalty,

    armFracturePenalty,
    legFracturePenalty,
    disabledArmCount,
    disabledLegCount,
    attackPenalty: totalMeleePenalty,
    meleePenalty: totalMeleePenalty,
    throwPenalty: totalThrowPenalty,
    castPenalty: totalCastPenalty,
    movementPenalty: totalMovementPenalty,
    manipulationPenalty: totalManipulationPenalty,
    conditionPenalty: conditionModifiers,
  };
}

export function getDerivedConditionState(actor) {
  const injury = getActorInjuryInfo(actor);
  const limbs = getAllLimbStatusMap(actor);

  const destroyedVital =
    Boolean(limbs.head.destroyed) ||
    Boolean(limbs.torso.destroyed);

  const armFractures =
    (injury.leftArmFractured ? 1 : 0) +
    (injury.rightArmFractured ? 1 : 0);

  const legFractures =
    (injury.leftLegFractured ? 1 : 0) +
    (injury.rightLegFractured ? 1 : 0);

  const destroyedArms = Number(injury.disabledArmCount ?? 0);
  const destroyedLegs = Number(injury.disabledLegCount ?? 0);
  const conditions = actor?.system?.conditions ?? {};
  const conditionModifiers = getConditionActionModifiers(conditions);

  const bleeding =
    clampNonNegativeInt(injury.minorBleedingTotal) +
    clampNonNegativeInt(injury.majorBleedingTotal) * 2;

  const traumaShock =
    clampNonNegativeInt(injury.majorBleedingTotal) +
    armFractures +
    legFractures +
    destroyedArms +
    destroyedLegs +
    (destroyedVital ? 100 : 0);
  const shock = Math.max(clampNonNegativeInt(injury.shock), traumaShock);

  const traumaMovementBlocked =
    destroyedVital ||
    destroyedLegs >= 2;

  const traumaManipulationBlocked =
    destroyedVital ||
    destroyedArms >= 2;

  const traumaCanMeleeAttack =
    !destroyedVital &&
    destroyedArms < 2;

  const traumaCanThrow =
    !destroyedVital &&
    destroyedArms < 2;

  const traumaCanCast =
    !destroyedVital &&
    destroyedArms < 2;

  const movementBlocked =
    traumaMovementBlocked ||
    conditionModifiers.movementBlocked;

  const manipulationBlocked =
    traumaManipulationBlocked ||
    conditionModifiers.manipulationBlocked;

  const canMeleeAttack =
    traumaCanMeleeAttack &&
    conditionModifiers.canMeleeAttack;

  const canThrow =
    traumaCanThrow &&
    conditionModifiers.canThrow;

  const canCast =
    traumaCanCast &&
    conditionModifiers.canCast;

  const notes = [];

  if (destroyedVital) {
    notes.push("Критическое разрушение жизненно важной зоны.");
  }
  if (destroyedArms >= 2) {
    notes.push("Обе руки выведены из строя.");
  }
  if (destroyedLegs >= 2) {
    notes.push("Обе ноги выведены из строя.");
  }
  if (armFractures > 0) {
    notes.push("Переломы рук мешают атакам и манипуляциям.");
  }
  if (legFractures > 0) {
    notes.push("Переломы ног мешают перемещению.");
  }
  if (bleeding > 0) {
    notes.push(`Кровопотеря: ${bleeding}.`);
  }
  if (shock > 0) {
    notes.push(`Шок: ${shock}.`);
  }

  if (Number(injury.abdomenEnergyPenalty ?? 0) > 0) {
    notes.push(`Травма живота мешает восстановлению энергии: -${injury.abdomenEnergyPenalty}.`);
  }

  notes.push(...conditionModifiers.notes);

  const traumaMeleeBlockReason = destroyedVital
    ? "Критическое разрушение жизненно важной зоны."
    : (destroyedArms >= 2 ? "Обе руки выведены из строя." : "");
  const traumaThrowBlockReason = traumaMeleeBlockReason;
  const traumaCastBlockReason = traumaMeleeBlockReason;

  return {
    bleeding,
    shock,
    movementBlocked,
    manipulationBlocked,
    canMeleeAttack,
    canThrow,
    canCast,
    meleeBlockReason: canMeleeAttack ? "" : (traumaMeleeBlockReason || conditionModifiers.meleeBlockReason),
    throwBlockReason: canThrow ? "" : (traumaThrowBlockReason || conditionModifiers.throwBlockReason),
    castBlockReason: canCast ? "" : (traumaCastBlockReason || conditionModifiers.castBlockReason),
    conditionModifiers,
    activeConditions: getActiveConditionEntries(conditions),
    abdomenEnergyPenalty: Number(injury.abdomenEnergyPenalty ?? 0),
    notes
  };
}

export async function syncDerivedConditionsFromTrauma(actor, options = {}) {
  if (!actor) {
    return {
      ok: false,
      changed: false,
      reason: "Актёр не найден."
    };
  }

  if (options?.ironHillsSkipDerivedConditionSync) {
    return {
      ok: true,
      changed: false,
      skipped: true
    };
  }

  const derived = getDerivedConditionState(actor);
  const currentConditions = actor.system?.conditions ?? {};

  const patch = {};
  let changed = false;

  const compareAndSet = (path, nextValue) => {
    const currentValue = foundry.utils.getProperty(actor, path);
    if (currentValue !== nextValue) {
      patch[path] = nextValue;
      changed = true;
    }
  };

  compareAndSet("system.conditions.bleeding", Number(derived.bleeding ?? 0));
  compareAndSet("system.conditions.shock", Number(derived.shock ?? 0));

  if (!changed) {
    return {
      ok: true,
      changed: false,
      derived,
      currentConditions
    };
  }

  await actor.update(patch, {
    render: Boolean(options?.render ?? false),
    diff: false,
    recursive: true,
    ironHillsSkipDerivedConditionSync: true
  });

  return {
    ok: true,
    changed: true,
    derived
  };
}

export function getSpellSchoolLabel(school) {
  const rawKey = String(school ?? "").trim();
  const normalizedKey = normalizeSpellSchoolKey(rawKey, { fallback: rawKey });
  const legacyLabels = {
    water: SPELL_SCHOOLS.ice?.label ?? "Лёд",
    air: SPELL_SCHOOLS.lightning?.label ?? "Молния",
    life: SPELL_SCHOOLS.light?.label ?? "Свет",
    holy: SPELL_SCHOOLS.light?.label ?? "Свет",
    magic: "Магия",
    sorcery: "Колдовство",
  };
  return SPELL_SCHOOLS[normalizedKey]?.label
    ?? legacyLabels[rawKey]
    ?? rawKey
    ?? "—";
}

const SPELL_SCHOOL_SKILL_ALIASES = Object.freeze({
  ...Object.fromEntries(
    Object.entries(SPELL_SCHOOL_ALIASES).map(([legacyKey, canonicalKey]) => [legacyKey, [canonicalKey]])
  ),
  ice: ["water"],
  lightning: ["air"],
  light: ["life", "holy"],
  holy: ["light", "life"],
  shadow: ["life", "mind"],
  summon: ["life", "mind"],
});

export function resolveSpellSchoolSkill(actor, school) {
  const rawKey = String(school ?? "").trim();
  const requestedKey = normalizeSpellSchoolKey(rawKey, { fallback: rawKey });
  const skills = actor?.system?.skills ?? {};
  const candidates = [
    requestedKey,
    ...(SPELL_SCHOOL_SKILL_ALIASES[requestedKey] ?? []),
    ...(rawKey && rawKey !== requestedKey ? [rawKey] : []),
    "magic",
    "sorcery",
  ].filter(Boolean);

  const seen = new Set();
  for (const key of candidates) {
    if (seen.has(key)) continue;
    seen.add(key);
    const skill = skills?.[key];
    if (skill) {
      return {
        requestedKey,
        key,
        skill,
        value: Number(skill.value ?? 0),
        label: getSpellSchoolLabel(requestedKey || key),
        skillLabel: getSpellSchoolLabel(key),
        aliased: key !== requestedKey,
      };
    }
  }

  return {
    requestedKey,
    key: requestedKey,
    skill: null,
    value: 0,
    label: getSpellSchoolLabel(requestedKey),
    skillLabel: getSpellSchoolLabel(requestedKey),
    aliased: false,
  };
}

export function getSpellSchoolSkill(actor, school) {
  return resolveSpellSchoolSkill(actor, school).skill;
}

export function getEffectTypeLabel(effectType) {
  const labels = {
    damage: "Урон",
    heal: "Лечение",
    healHP: "Лечение HP",
    restoreEnergy: "Восстановление энергии",
    restoreMana: "Восстановление маны",
    reduceBleeding: "Снижение кровотечения",
    reduceShock: "Снижение шока",
    curePoison: "Снятие яда"
  };

  return labels[effectType] ?? getItemEffectLabel(effectType, { fallback: effectType ?? "—" });
}

export function getQuickSlotBonusFromItems(actor) {
  if (!actor) return 0;

  let bonus = 0;

  for (const item of actor.items) {
    const explicitBonus = Number(item.system?.quickSlotBonus ?? 0);
    if (Number.isFinite(explicitBonus) && explicitBonus > 0) {
      bonus += explicitBonus;
      continue;
    }

    const itemName = String(item.name || "").toLowerCase();

    if (itemName.includes("пояс")) bonus += 1;
    if (itemName.includes("подсум")) bonus += 1;
    if (itemName.includes("бандольер")) bonus += 1;
    if (itemName.includes("патронташ")) bonus += 1;
    if (itemName.includes("разгруз")) bonus += 2;
  }

  return bonus;
}

export function getQuickSlotsUnlocked(actor) {
  const base = 2;
  const bonus = getQuickSlotBonusFromItems(actor);
  return clamp(base + bonus, 2, 6);
}

export function isQuickSlotCarrier(item) {
  if (!item) return false;

  const explicitBonus = Number(item.system?.quickSlotBonus ?? 0);
  if (explicitBonus > 0) return true;

  const itemName = String(item.name || "").toLowerCase();

  return (
    itemName.includes("пояс") ||
    itemName.includes("подсум") ||
    itemName.includes("бандольер") ||
    itemName.includes("патронташ") ||
    itemName.includes("разгруз")
  );
}

export function buildQuickSlotCarrierItems(actor) {
  return actor.items
    .filter(item => isQuickSlotCarrier(item))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"))
    .map(item => ({
      id: item.id,
      name: item.name,
      icon: getItemQuickSlotIcon(item),
      kind: itemTypeLabel(item.type),
      quantity: Number(item.system?.quantity ?? 1),
      weight: Number(item.system?.weight ?? 0),
      totalWeight: Number(item.system?.weight ?? 0) * Number(item.system?.quantity ?? 1),
      unitPrice: getComputedItemUnitPrice(item),
      totalPrice: getComputedItemTotalPrice(item),
      quickSlotBonus: Number(item.system?.quickSlotBonus ?? 0) || getQuickSlotBonusFromItems({
        items: [item]
      })
    }));
}

export function getQuickSlotLabel(slotKey) {
  const slotNumber = String(slotKey).replace("slot", "");
  return `Слот ${slotNumber}`;
}

export function isQuickSlotUnlocked(actor, slotKey) {
  const unlocked = getQuickSlotsUnlocked(actor);
  const slotNumber = Number(String(slotKey).replace("slot", ""));
  return slotNumber <= unlocked;
}

export function getOpenQuickSlotChoices(actor) {
  const unlocked = getQuickSlotsUnlocked(actor);
  const result = [];

  for (let i = 1; i <= 6; i++) {
    result.push({
      slotKey: `slot${i}`,
      slotLabel: `Слот ${i}`,
      shortLabel: `${i}`,
      unlocked: i <= unlocked
    });
  }

  return result;
}

export function getSpellCastBlockReason(actor, item, { isScroll = false } = {}) {
  if (!actor || !item) return "Предмет не найден";

  const currentEnergy = Number(actor.system?.resources?.energy?.value ?? 0);
  const currentMana = Number(actor.system?.resources?.mana?.value ?? 0);
  const injuries = getActorInjuryInfo(actor);
  const derivedConditions = getDerivedConditionState(actor);

  if (injuries.leftArmDisabled && injuries.rightArmDisabled) {
    return "Обе руки выведены из строя";
  }

  // Безмолвие
  if (!isScroll) {
    const silencedUntil = Number(actor.system?.conditions?.silencedUntil ?? 0);
    if (silencedUntil > 0 && (game.time?.worldTime ?? 0) < silencedUntil) {
      return "Персонаж под эффектом безмолвия — нельзя колдовать";
    }
  }

  if (!derivedConditions.canCast) {
    return derivedConditions.castBlockReason || "Персонаж не может колдовать из-за состояния.";
  }

  const energyCost = Number(item.system?.energyCost ?? 0);
  const manaCost = isScroll ? 0 : Number(item.system?.manaCost ?? 0);

  if (currentEnergy < energyCost) {
    return `Не хватает энергии (${currentEnergy}/${energyCost})`;
  }

  if (currentMana < manaCost) {
    return `Не хватает маны (${currentMana}/${manaCost})`;
  }

  return "";
}

export function getThrowableBlockReason(actor, item) {
  if (!actor || !item) return "Предмет не найден";

  const currentEnergy = Number(actor.system?.resources?.energy?.value ?? 0);
  const energyCost = Number(item.system?.energyCost ?? 0);
  const injuries = getActorInjuryInfo(actor);
  const derivedConditions = getDerivedConditionState(actor);

  if (injuries.leftArmDisabled && injuries.rightArmDisabled) {
    return "Обе руки выведены из строя";
  }

  if (!derivedConditions.canThrow) {
    return derivedConditions.throwBlockReason || "Персонаж не может метать из-за состояния.";
  }

  if (currentEnergy < energyCost) {
    return `Не хватает энергии (${currentEnergy}/${energyCost})`;
  }

  return "";
}

function getSelectedTargetCount(targets = null) {
  const source = targets ?? globalThis.game?.user?.targets ?? [];
  if (!source) return 0;
  const list = source instanceof Set
    ? [...source]
    : Array.isArray(source)
      ? source
      : (typeof source[Symbol.iterator] === "function" ? Array.from(source) : [source]);
  return list.filter(target => target?.actor ?? target).length;
}

function isMissingSelectedTargetReason(reason) {
  return String(reason ?? "").trim() === "Выберите цель";
}

export function getInventoryItemActionReason(actor, item, {
  actionKey = null,
  targets = null,
} = {}) {
  const resolvedActionKey = actionKey ?? getInventoryItemActionKeysForItem(item)[0] ?? "";
  if (!resolvedActionKey) return "";

  if (resolvedActionKey === "spell") {
    return getSpellCastBlockReason(actor, item, { isScroll: false });
  }

  if (resolvedActionKey === "scroll") {
    return getSpellCastBlockReason(actor, item, { isScroll: true });
  }

  if (resolvedActionKey === "throwable") {
    return getThrowableBlockReason(actor, item);
  }

  if (resolvedActionKey === "potion") {
    return getActionBlockReason(actor, "potion", { item, targets });
  }

  if (resolvedActionKey === "consumable") {
    return getActionBlockReason(actor, "consumable", { item, targets });
  }

  return "";
}

export function buildInventoryItemActions(actor, item, { targets = null } = {}) {
  return getInventoryItemActionKeysForItem(item)
    .map(actionKey => {
      const reason = getInventoryItemActionReason(actor, item, { actionKey, targets });
      return buildInventoryItemActionView(actionKey, {
        reason,
        needsTarget: isMissingSelectedTargetReason(reason),
      });
    })
    .filter(Boolean);
}

export function getActionItemBlockReason(actor, item, { targets = null } = {}) {
  if (!actor || !item) return "Предмет не найден";
  const actionType = getItemActionType(item);
  if (!actionType) return "У предмета не настроено действие";

  const targetActorMode = getItemTargetActorMode(item, "self");
  if (targetActorMode === "selected-only" && getSelectedTargetCount(targets) <= 0) {
    return "Выберите цель";
  }

  return "";
}

export function getActionBlockReason(actor, actionType, payload = {}) {
  if (!actor) return "Нет актёра";

  const injuries = getActorInjuryInfo(actor);
  const derivedConditions = getDerivedConditionState(actor);
  const encumbrance = getEncumbranceInfo(actor);

  if (actionType === "attack") {
    const hand = payload.hand ?? null;
    const weapon = payload.weapon ?? null;
    const attackMode = normalizeAttackMode(payload.attackMode, {
      skillKey: payload.skillKey ?? weapon?.system?.skill,
      weapon,
      technique: payload.technique,
      rangeOverride: payload.rangeOverride,
    });
    const baseEnergyCost = Number(payload.energyCost ?? 0);
    const finalEnergyCost = Math.ceil(baseEnergyCost * encumbrance.energyMultiplier);
    const currentEnergy = Number(actor.system.resources?.energy?.value ?? 0);
    const blockState = getAttackBlockState(derivedConditions, attackMode);

    if (!blockState.canAttack) {
      return blockState.reason || "Персонаж не может атаковать из-за состояния.";
    }

    if (weapon?.system?.twoHanded) {
      if (injuries.leftArmDisabled || injuries.rightArmDisabled) {
        return "Для двуручного оружия нужны две рабочие руки";
      }
    }

    if (hand === "rightHand" && injuries.rightArmDisabled) {
      return "Правая рука выведена из строя";
    }

    if (hand === "leftHand" && injuries.leftArmDisabled) {
      return "Левая рука выведена из строя";
    }

    if (currentEnergy < finalEnergyCost) {
      return `Нужно энергии: ${finalEnergyCost}`;
    }

    return "";
  }

  if (actionType === "spell") {
    const item = payload.item ?? null;
    if (!item) return "Заклинание не найдено";

    const school = item.system.school;
    const schoolSkill = resolveSpellSchoolSkill(actor, school);
    if (!schoolSkill.skill) return `Нет школы магии: ${schoolSkill.label || school}`;

    const manaCost = Number(item.system.manaCost ?? 0);
    const energyCost = Number(item.system.energyCost ?? 0);
    const currentMana = Number(actor.system.resources?.mana?.value ?? 0);
    const currentEnergy = Number(actor.system.resources?.energy?.value ?? 0);

    if (!derivedConditions.canCast) {
      return derivedConditions.castBlockReason || "Персонаж не может колдовать из-за состояния.";
    }

    if (isConditionActive(actor.system?.conditions ?? {}, "silence")) {
      return "Персонаж под эффектом безмолвия.";
    }

    if (currentMana < manaCost) {
      return `Нужно маны: ${manaCost}`;
    }

    if (currentEnergy < energyCost) {
      return `Нужно энергии: ${energyCost}`;
    }

    return "";
  }

  if (actionType === "scroll") {
    const item = payload.item ?? null;
    if (!item) return "Свиток не найден";

    const school = item.system.school;
    const schoolSkill = resolveSpellSchoolSkill(actor, school);
    if (!schoolSkill.skill) return `Нет школы магии: ${schoolSkill.label || school}`;

    const energyCost = Number(item.system.energyCost ?? 0);
    const currentEnergy = Number(actor.system.resources?.energy?.value ?? 0);

    if (!derivedConditions.canCast) {
      return derivedConditions.castBlockReason || "Персонаж не может использовать свиток из-за состояния.";
    }

    if (currentEnergy < energyCost) {
      return `Нужно энергии: ${energyCost}`;
    }

    return "";
  }

  if (actionType === "throwable") {
    const item = payload.item ?? null;
    if (!item) return "Предмет не найден";

    const currentEnergy = Number(actor.system.resources?.energy?.value ?? 0);
    const energyCost = Number(item.system.energyCost ?? 0);

    if (!derivedConditions.canThrow) {
      return derivedConditions.throwBlockReason || "Персонаж не может метать из-за состояния.";
    }

    if (currentEnergy < energyCost) {
      return `Нужно энергии: ${energyCost}`;
    }

    if (injuries.rightArmDisabled && injuries.leftArmDisabled) {
      return "Обе руки выведены из строя";
    }

    return "";
  }

  if (actionType === "consumable" || actionType === "use-consumable") {
    return getActionItemBlockReason(actor, payload.item ?? null, { targets: payload.targets ?? null });
  }

  if (actionType === "potion") {
    const item = payload.item ?? null;
    if (!item || !getItemActionType(item)) return "";
    return getActionItemBlockReason(actor, item, { targets: payload.targets ?? null });
  }

  if (actionType === "quickslot") {
    const slotKey = payload.slotKey ?? "";
    if (!isQuickSlotUnlocked(actor, slotKey)) {
      return "Слот заблокирован";
    }

    const itemId = actor.system.quickSlots?.[slotKey];
    if (!itemId) {
      return "Слот пуст";
    }

    const item = actor.items.get(itemId);
    if (!item) {
      return "Предмет отсутствует";
    }

    if (item.type === "food") return "";
    if (getInventoryItemActionConfig(item.type)) {
      return getInventoryItemActionReason(actor, item, { targets: payload.targets ?? null });
    }
    if (item.type === "weapon") return "";

    return "Тип предмета нельзя использовать";
  }

  return "";
}

export function buildActionState(actor) {
  const injuries = getActorInjuryInfo(actor);
  const derivedConditions = getDerivedConditionState(actor);
  const eq = actor.system?.equipment ?? {};
  const currentEnergy = Number(actor.system?.resources?.energy?.value ?? 0);

  const rightWeapon = eq.rightHand ? actor.items.get(eq.rightHand) : null;
  const leftWeapon = eq.leftHand ? actor.items.get(eq.leftHand) : null;

  let attackRightReason = "";
  let attackLeftReason = "";

  const rightEnergyCost = Number(rightWeapon?.system?.energyCost ?? 5);
  const leftEnergyCost = Number(leftWeapon?.system?.energyCost ?? 5);

  if (!derivedConditions.canMeleeAttack) {
    attackRightReason = derivedConditions.meleeBlockReason || "Персонаж не может атаковать из-за состояния.";
  } else if (injuries.rightArmDisabled) {
    attackRightReason = "Правая рука выведена из строя";
  } else if (rightWeapon?.system?.twoHanded && (injuries.leftArmDisabled || injuries.rightArmDisabled)) {
    attackRightReason = "Для двуручного оружия нужны две рабочие руки";
  } else if (currentEnergy < rightEnergyCost) {
    attackRightReason = `Не хватает энергии (${currentEnergy}/${rightEnergyCost})`;
  }

  if (!derivedConditions.canMeleeAttack) {
    attackLeftReason = derivedConditions.meleeBlockReason || "Персонаж не может атаковать из-за состояния.";
  } else if (injuries.leftArmDisabled) {
    attackLeftReason = "Левая рука выведена из строя";
  } else if (leftWeapon?.system?.twoHanded && (injuries.leftArmDisabled || injuries.rightArmDisabled)) {
    attackLeftReason = "Для двуручного оружия нужны две рабочие руки";
  } else if (currentEnergy < leftEnergyCost) {
    attackLeftReason = `Не хватает энергии (${currentEnergy}/${leftEnergyCost})`;
  }

  return {
    canAttackRight: !attackRightReason,
    canAttackLeft: !attackLeftReason,
    attackRightReason,
    attackLeftReason
  };
}

export function buildQuickSlotActionStates(actor) {
  const result = {};
  const quickSlots = actor.system?.quickSlots ?? {};

  for (let i = 1; i <= 6; i++) {
    const slotKey = `slot${i}`;

    if (!isQuickSlotUnlocked(actor, slotKey)) {
      result[slotKey] = {
        canUse: false,
        reason: "Слот закрыт"
      };
      continue;
    }

    const itemId = quickSlots[slotKey];
    if (!itemId) {
      result[slotKey] = {
        canUse: false,
        reason: "Слот пуст"
      };
      continue;
    }

    const item = actor.items.get(itemId);
    if (!item) {
      result[slotKey] = {
        canUse: false,
        reason: "Предмет не найден"
      };
      continue;
    }

    const reason = getInventoryItemActionReason(actor, item);

    result[slotKey] = {
      canUse: !reason,
      reason
    };
  }

  return result;
}

export function buildGroupedItems(actor, { includeUnplaced = false } = {}) {
  const items = Array.from(actor.items ?? []);
  const order = [
    "weapon",
    "armor",
    "tool",
    "resource",
    "food",
    "material",
    "spell",
    "potion",
    "scroll",
    "throwable",
    "consumable"
  ];

  const groupsMap = new Map();
  for (const type of order) {
    groupsMap.set(type, []);
  }

  const equip  = actor.system?.equipment ?? {};
  const equippedIds = new Set(Object.values(equip).filter(Boolean));
  const virtualInventoryTypes = new Set(["spell", "attachment"]);

  for (const item of items) {
    const secKey = item.flags?.["iron-hills-system"]?.sectionKey ?? null;
    const isEquipped = equippedIds.has(item.id);

    if (!includeUnplaced && !isEquipped && !virtualInventoryTypes.has(item.type) && !isItemGridPlaced(item)) {
      continue;
    }

    // Скрываем предметы внутри НЕнадетых контейнеров
    // (они там хранятся физически но не должны быть видны в листе)
    if (secKey) {
      const contType = secKey.startsWith("backpack_") ? "backpack"
                     : secKey.startsWith("belt_")     ? "belt"
                     : null;
      if (contType) {
        // Проверяем надет ли соответствующий контейнер
        const isEquipped = equip[contType] && equippedIds.has(equip[contType]);
        if (!isEquipped) continue; // не показываем
      }
    }

    const type = item.type || "other";
    if (!groupsMap.has(type)) groupsMap.set(type, []);
    groupsMap.get(type).push(item);
  }

  const quickAssignSlots = getOpenQuickSlotChoices(actor);

  const result = [];
  for (const [type, docs] of groupsMap.entries()) {
    if (!docs.length) continue;

    docs.sort((a, b) => a.name.localeCompare(b.name, "ru"));

    result.push({
      type,
      label: itemTypeLabel(type),
      items: docs.map(item => {
        const quantity = num(item.system?.quantity, 1);
        const weight = num(item.system?.weight, 0);
        const unitPrice = getComputedItemUnitPrice(item);
        const totalPrice = getComputedItemTotalPrice(item);

        const canAssignQuick =
          ["weapon", "food", "spell", "scroll", "potion", "throwable", "consumable"].includes(item.type) ||
          Boolean(String(item.system?.actionType ?? "").trim());

        const inventoryActions = buildInventoryItemActions(actor, item);
        const actionsByKey = Object.fromEntries(inventoryActions.map(action => [action.key, action]));
        const potionAction = actionsByKey.potion ?? {};
        const consumableAction = actionsByKey.consumable ?? {};
        const throwableAction = actionsByKey.throwable ?? {};
        const spellAction = actionsByKey.spell ?? {};
        const scrollAction = actionsByKey.scroll ?? {};
        const hasInventoryActions = inventoryActions.length > 0;

        return {
          id: item.id,
          name: item.name,
          img: item.img ?? "icons/svg/item-bag.svg",
          kind: itemTypeLabel(item.type),
          icon: getItemQuickSlotIcon(item),
          type: item.type,
          system: item.system ?? {},
          tier: item.system?.tier ?? "—",
          quantity,
          weight,
          totalWeight: quantity * weight,
          unitPrice,
          totalPrice,
          quickSlotBonus: Number(item.system?.quickSlotBonus ?? 0),

          canEquipRight: item.type === "weapon",
          canEquipLeft: item.type === "weapon",
          canEquipArmor: item.type === "armor",
          canDelete: true,
          hasInventoryActions,
          inventoryActions,

          canUseFood: item.type === "food",
          canUsePotion: Boolean(potionAction.canUse),
          canClickPotion: Boolean(potionAction.enabled),
          potionBlockedReason: potionAction.reason ?? "",
          potionNeedsTarget: Boolean(potionAction.needsTarget),
          canUseConsumable: Boolean(consumableAction.canUse),
          canClickConsumable: Boolean(consumableAction.enabled),
          consumableBlockedReason: consumableAction.reason ?? "",
          consumableNeedsTarget: Boolean(consumableAction.needsTarget),

          canUseThrowable: Boolean(throwableAction.canUse),
          throwableBlockedReason: throwableAction.reason ?? "",

          canCastSpell: Boolean(spellAction.canUse),
          spellBlockedReason: spellAction.reason ?? "",

          canUseScroll: Boolean(scrollAction.canUse),
          scrollBlockedReason: scrollAction.reason ?? "",

          canAssignQuick,
          quickAssignSlots,
          hasDurability: item.system?.durability !== undefined,
          durabilityValue: Number(item.system?.durability?.value ?? 100),
          durabilityMax:   Number(item.system?.durability?.max   ?? 100),
          durabilityPct: item.system?.durability
            ? Math.round(Math.max(0, Number(item.system.durability.value)) / Math.max(1, Number(item.system.durability.max)) * 100)
            : 100,
          isBroken: item.system?.durability ? Number(item.system.durability.value) <= 0 : false
        };
      })
    });
  }

  return result;
}

export function buildEquipmentSummary(actor) {
  const eq = actor.system?.equipment || {};

  const itemInSlot = (slotKey, legacyKey = null) => {
    const itemId = eq[slotKey] || (legacyKey ? eq[legacyKey] : "");
    return itemId ? actor.items.get(itemId) : null;
  };

  const formatItemName = item => item?.name || "—";

  return [
    {
      slot: "Правая рука",
      slotKey: "rightHand",
      itemName: formatItemName(itemInSlot("rightHand"))
    },
    {
      slot: "Левая рука",
      slotKey: "leftHand",
      itemName: formatItemName(itemInSlot("leftHand"))
    },
    {
      slot: "Голова",
      slotKey: "head",
      itemName: formatItemName(itemInSlot("head", "armorHead"))
    },
    {
      slot: "Шея",
      slotKey: "neck",
      itemName: formatItemName(itemInSlot("neck"))
    },
    {
      slot: "Торс",
      slotKey: "torso",
      itemName: formatItemName(itemInSlot("torso", "armorTorso"))
    },
    {
      slot: "Л. наруч",
      slotKey: "leftArm",
      itemName: formatItemName(itemInSlot("leftArm", "armorArms"))
    },
    {
      slot: "П. наруч",
      slotKey: "rightArm",
      itemName: formatItemName(itemInSlot("rightArm", "armorArms"))
    },
    {
      slot: "Ноги",
      slotKey: "legs",
      itemName: formatItemName(itemInSlot("legs", "armorLegs"))
    },
    {
      slot: "Пояс",
      slotKey: "belt",
      itemName: formatItemName(itemInSlot("belt"))
    },
    {
      slot: "Рюкзак",
      slotKey: "backpack",
      itemName: formatItemName(itemInSlot("backpack"))
    }
  ];
}

export function buildQuickSlotsSummary(actor) {
  const quickSlots = actor.system?.quickSlots || {};
  const unlocked = getQuickSlotsUnlocked(actor);
  const result = [];
  const allowedTypes = new Set(["weapon", "food", "spell", "scroll", "potion", "throwable", "consumable"]);

  for (let i = 1; i <= 6; i++) {
    const slotKey = `slot${i}`;
    const itemId = quickSlots[slotKey];
    const item = itemId ? actor.items.get(itemId) : null;
    const validItem =
      item &&
      (
        allowedTypes.has(item.type) ||
        Boolean(String(item.system?.actionType ?? "").trim())
      )
        ? item
        : null;

    result.push({
      slotKey,
      slot: `Слот ${i}`,
      unlocked: i <= unlocked,
      itemName: validItem?.name || "—",
      itemKind: validItem ? itemTypeLabel(validItem.type) : "",
      itemIcon: validItem ? getItemQuickSlotIcon(validItem) : "",
      hasItem: !!validItem
    });
  }

  return result;
}

export function buildMagicItemView(item) {
  return {
    id: item.id,
    name: item.name,
    school: getSpellSchoolLabel(item.system.school),
    schoolKey: item.system.school || "",
    effectType: getEffectTypeLabel(item.system.effectType),
    power: num(item.system.power, 0),
    manaCost: num(item.system.manaCost, 0),
    energyCost: num(item.system.energyCost, 0),
    targetPart: getTargetPartLabel(item.system.targetPart ?? "torso"),
    quantity: num(item.system.quantity, 1)
  };
}

export function buildDetailedMagicSummary(actor) {
  const spells = actor.items
    .filter(i => i.type === "spell")
    .sort((a, b) => a.name.localeCompare(b.name, "ru"))
    .map(buildMagicItemView);

  const scrolls = actor.items
    .filter(i => i.type === "scroll")
    .sort((a, b) => a.name.localeCompare(b.name, "ru"))
    .map(buildMagicItemView);

  return { spells, scrolls };
}

export function buildCombatSummary(actor) {
  const eq = actor.system?.equipment || {};
  const rightWeapon = eq.rightHand ? actor.items.get(eq.rightHand) : null;
  const leftWeapon = eq.leftHand ? actor.items.get(eq.leftHand) : null;
  const encumbrance = getEncumbranceInfo(actor);
  const injuries = getActorInjuryInfo(actor);

  return {
    defense: num(actor.system.combat?.defense, 0),
    unarmedDamage: num(actor.system.combat?.unarmedDamage, 1),
    encumbranceLabel: encumbrance.label,
    encumbranceAttackPenalty: num(encumbrance.attackPenalty, 0),
    encumbranceEnergyMultiplier: num(encumbrance.energyMultiplier, 1),
    injuriesAttackPenalty: num(injuries.attackPenalty, 0),
    rightWeaponName: rightWeapon?.name || "Кулаки",
    leftWeaponName: leftWeapon?.name || "Кулаки",
    rightHandDisabled: injuries.rightArmDisabled,
    leftHandDisabled: injuries.leftArmDisabled,
    leftLegDisabled: injuries.leftLegDisabled,
    rightLegDisabled: injuries.rightLegDisabled,
    bleeding: num(injuries.bleeding, 0),
    shock: num(injuries.shock, 0),
    poison: num(injuries.poison, 0),
    burning: num(injuries.burning, 0)
  };
}

export function buildDetailedCombatView(actor) {
  const eq = actor.system?.equipment || {};
  const rightWeaponRaw = eq.rightHand ? actor.items.get(eq.rightHand) : null;
  const leftWeaponRaw = eq.leftHand ? actor.items.get(eq.leftHand) : null;

  const rightWeapon = rightWeaponRaw?.type === "weapon" ? rightWeaponRaw : null;
  const leftWeapon = leftWeaponRaw?.type === "weapon" ? leftWeaponRaw : null;

  const mapWeapon = item => ({
    name: item?.name || "Кулаки",
    damage: item ? num(item.system.damage, 1) : num(actor.system.combat?.unarmedDamage, 1),
    energyCost: item ? num(item.system.energyCost, 0) : 5,
    skill: item?.system?.skill || "unarmed",
    twoHanded: !!item?.system?.twoHanded,
    damageType: item?.system?.damageType || "physical"
  });

  const uniqueItems = items => Array.from(new Map(
    items.filter(Boolean).map(item => [item.id, item])
  ).values());

  const armorForZones = zones => uniqueItems(
    zones.map(zone => getEquippedArmorForLocation(actor, zone))
  );

  const mapArmor = items => {
    const layers = Array.isArray(items) ? uniqueItems(items) : uniqueItems([items]);
    return {
      name: layers.length ? layers.map(item => item.name).join(" / ") : "—",
      physical: layers.reduce((best, item) => Math.max(best, getDamageReduction(item, "physical")), 0),
      magical: layers.reduce((best, item) => Math.max(best, getDamageReduction(item, "magical")), 0)
    };
  };

  return {
    rightWeapon: mapWeapon(rightWeapon),
    leftWeapon: mapWeapon(leftWeapon),
    armorHead: mapArmor(getEquippedArmorForLocation(actor, "head")),
    armorTorso: mapArmor(armorForZones(["torso", "abdomen"])),
    armorArms: mapArmor(armorForZones(["leftArm", "rightArm"])),
    armorLegs: mapArmor(armorForZones(["leftLeg", "rightLeg"]))
  };
}

export function getSettlementActorByName(name) {
  if (!name) return null;
  return game.actors.find(a => a.type === "settlement" && a.name === name) ?? null;
}

export function getSettlementTradeState(settlementActor) {
  if (!settlementActor) {
    return {
      prosperity: 5,
      supply: 5,
      danger: 5
    };
  }

  return {
    prosperity: Math.max(0, Number(settlementActor.system?.info?.prosperity ?? 5)),
    supply: Math.max(0, Number(settlementActor.system?.info?.supply ?? 5)),
    danger: Math.max(0, Number(settlementActor.system?.info?.danger ?? 5))
  };
}

export function buildMagicSummary(actor) {
  const spells = actor.items.filter(i => i.type === "spell");
  const scrolls = actor.items.filter(i => i.type === "scroll");

  const schools = SPELL_SCHOOL_KEYS.map(key => {
    const schoolSkill = resolveSpellSchoolSkill(actor, key);
    return {
      key,
      skillKey: schoolSkill.key || key,
      label: getSpellSchoolLabel(key),
      value: schoolSkill.skill ? num(schoolSkill.value, 1) : 0,
      aliased: Boolean(schoolSkill.aliased),
    };
  });

  return {
    manaValue: num(actor.system.resources?.mana?.value, 0),
    manaMax: num(actor.system.resources?.mana?.max, 0),
    spellsCount: spells.length,
    scrollsCount: scrolls.length,
    schools
  };
}

export function buildTradeSummary(actor) {
  const settlementName = actor.system?.info?.settlement || "";
  const settlementActor = getSettlementActorByName(settlementName);
  const settlementState = getSettlementTradeState(settlementActor);

  return {
    coins: getActorCurrency(actor),
    isMerchant: actor.type === "merchant",
    wealth: getMerchantWealth(actor),
    markup: getMerchantMarkup(actor),
    specialty: actor.system?.info?.specialty || "",
    settlement: settlementName,
    faction: actor.system?.info?.faction || "",
    settlementProsperity: settlementState.prosperity,
    settlementSupply: settlementState.supply,
    settlementDanger: settlementState.danger
  };
}

export function buildOverviewSummary(actor) {
  const conditions = actor.system.conditions ?? {};
  const resources = actor.system.resources ?? {};
  const encumbrance = getEncumbranceInfo(actor);

  const pct = (v, m) => Math.round(Math.max(0, Math.min(1, num(v,0) / Math.max(1, num(m,1)))) * 100);

  // Ступень = максимальный навык персонажа
  const skills = actor.system?.skills ?? {};
  const maxSkillValue = Object.values(skills).reduce((max, s) => Math.max(max, num(s?.value, 1)), 1);
  const calculatedTier = maxSkillValue;

  return {
    race: actor.system.info?.race || "",
    age: actor.system.info?.age ?? "",
    defense: num(actor.system.combat?.defense, 0),
    unarmedDamage: num(actor.system.combat?.unarmedDamage, 1),
    energyValue: num(resources.energy?.value, 0),
    energyMax:   num(resources.energy?.max, 0),
    energyPct:   pct(resources.energy?.value, resources.energy?.max),
    manaValue:   num(resources.mana?.value, 0),
    manaMax:     num(resources.mana?.max, 0),
    manaPct:     pct(resources.mana?.value, resources.mana?.max),
    satietyValue: num(resources.satiety?.value, 0),
    satietyMax:   num(resources.satiety?.max, 0),
    satietyPct:   pct(resources.satiety?.value, resources.satiety?.max),
    hydrationValue: num(resources.hydration?.value, 0),
    hydrationMax:   num(resources.hydration?.max, 0),
    hydrationPct:   pct(resources.hydration?.value, resources.hydration?.max),
    weightValue: num(resources.weight?.value, 0),
    weightMax:   num(resources.weight?.max, 0),
    weightPct:   pct(resources.weight?.value, resources.weight?.max),
    coins: getActorCurrency(actor),
    encumbranceLabel: encumbrance.label,
    calculatedTier: calculatedTier,
    bleeding:     num(conditions.bleeding, 0),
    shock:        num(conditions.shock, 0),
    poison:       num(conditions.poison, 0),
    burning:      num(conditions.burning, 0),
    unconscious:  num(conditions.unconscious, 0),
    // Статус голода и жажды
    hungerState:  (() => {
      const p = num(resources.satiety?.value, 100) / Math.max(1, num(resources.satiety?.max, 100));
      if (p <= 0)    return { label:"☠ Голодная смерть",    color:"#ef4444", icon:"💀", penalty:20 };
      if (p <= 0.1)  return { label:"😵 Крайнее истощение", color:"#f87171", icon:"😵", penalty:10 };
      if (p <= 0.25) return { label:"😰 Сильный голод",     color:"#fb923c", icon:"😰", penalty:5  };
      if (p <= 0.5)  return { label:"🍽 Голод",              color:"#fbbf24", icon:"🍽", penalty:2  };
      return null;
    })(),
    thirstState:  (() => {
      const p = num(resources.hydration?.value, 100) / Math.max(1, num(resources.hydration?.max, 100));
      if (p <= 0)    return { label:"☠ Смерть от жажды",    color:"#3b82f6", icon:"💀", penalty:30 };
      if (p <= 0.1)  return { label:"🏜 Критическая жажда", color:"#60a5fa", icon:"🏜", penalty:15 };
      if (p <= 0.25) return { label:"😓 Сильная жажда",     color:"#7dd3fc", icon:"😓", penalty:8  };
      if (p <= 0.5)  return { label:"💧 Жажда",              color:"#bae6fd", icon:"💧", penalty:3  };
      return null;
    })(),
  };
}

export function buildSkillGroups(actor) {
  const actorSkills = actor.system?.skills ?? {};

  return SKILL_GROUPS.map(group => ({
    key: group.key,
    label: group.label,
    skills: group.skills.map(skillDef => {
      const schoolSkill = group.key === "magic"
        ? resolveSpellSchoolSkill(actor, skillDef.key)
        : null;
      const skillData = actorSkills[skillDef.key] ?? schoolSkill?.skill ?? {};

      const val     = num(skillData.value, 1);
      const exp     = num(skillData.exp, 0);
      const expNext = num(skillData.expNext, getExpNext(val) ?? 30);
      return {
        key:     skillDef.key,
        sourceKey: schoolSkill?.key ?? skillDef.key,
        aliased: Boolean(schoolSkill?.aliased),
        label:   skillDef.label,
        value:   val,
        dieSize: val * 2,
        exp,
        expNext,
        expPct:  Math.round(Math.min(100, exp / Math.max(1, expNext) * 100))
      };
    })
  }));
}

// ============================================================
// БОЕВАЯ ФОРМУЛА — новая система (PATCH 5)
// ============================================================

/**
 * Начислить опыт навыку (бой, ремесло и т.д.). Без привязки к листу актёра.
 */
export async function grantSkillExp(actor, skillKey, label = skillKey, amount = 1) {
  if (!actor || !skillKey) return;
  const skill = actor.system?.skills?.[skillKey];
  if (!skill) return;

  const currentValue = Math.max(1, Number(skill.value ?? 1));
  if (currentValue >= 10) return;

  let newExp = (skill.exp ?? 0) + Math.max(1, Number(amount) || 1);
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
      content: buildCombatChatCard({
        title: "Навык повышен",
        subtitle: actor.name,
        icon: "↑",
        status: `d${newValue * 2}`,
        statusClass: "is-good",
        rows: [
          ["Навык", label],
          ["Ступень", newValue],
        ],
        className: "ih-skill-progress-chat-card",
      }),
    });
    return;
  }

  await actor.update({
    [`system.skills.${skillKey}.exp`]: newExp,
    [`system.skills.${skillKey}.expNext`]: expNext
  });
}

/**
 * Экспоненциальная таблица опыта для навыков.
 * Ступень 1→2: ~25–50 использований
 * Ступень 9→10: тысячи использований
 */
export function getExpNextForSkill(currentValue) {
  const base = 25;
  const exponent = 2.2;
  return Math.floor(base * Math.pow(currentValue, exponent));
}

/**
 * Порог попадания — пассивная защита цели.
 * Бросок атаки должен быть >= порога чтобы попасть.
 *
 * @param {object} targetActor — актёр цели
 * @param {object} modifiers — ситуативные модификаторы
 * @returns {number} порог попадания
 */
export function getAttackThreshold(targetActor, modifiers = {}) {
  const BASE_THRESHOLD = 4;
  const conditions = targetActor?.system?.conditions ?? {};
  const formationContext = modifiers.formationContext ?? null;

  // Броня цели — можно переопределить для монстров
  const armorTier = modifiers.armorTierOverride !== undefined
    ? Number(modifiers.armorTierOverride)
    : Number(targetActor?.system?.info?.armorTier ?? 0);
  const armorCrackedPenalty = isConditionActive(conditions, "armor_cracked") ? -2 : 0;
  const armorBonus = Math.max(0, Math.ceil(armorTier / 2) + armorCrackedPenalty);

  // Щит
  const shieldDisabled = isConditionActive(conditions, "shield_lost");
  const shieldBonus = modifiers.hasShield && !shieldDisabled ? 1 : 0;

  // Штрафы ситуации
  const lyingPenalty    = modifiers.isLying    ? -2 : 0;
  const rawSurroundCount = Math.max(0, Number(modifiers.surroundCount ?? 0));
  const surroundMitigation = Math.min(
    rawSurroundCount,
    Math.max(0, Number(formationContext?.surroundMitigation ?? 0))
  );
  const effectiveSurroundCount = Math.max(0, rawSurroundCount - surroundMitigation);
  const surroundPenalty = effectiveSurroundCount > 0
    ? -effectiveSurroundCount : 0;
  const stunnedPenalty  = modifiers.isStunned  ? -3 : 0;
  const darknessMalus   = modifiers.inDarkness ?  2 : 0;
  const exposedPenalty  = isConditionActive(conditions, "exposed") ? -2 : 0;
  const slowedPenalty   = isConditionActive(conditions, "slowed") ? -1 : 0;
  const formationBonus  = formationContext
    ? Number(formationContext.formationBonus ?? 0)
    : (isConditionActive(conditions, "formation_stance") ? 3 : 0);
  const shieldWallBonus = formationContext
    ? Number(formationContext.shieldWallBonus ?? 0)
    : (isConditionActive(conditions, "shield_wall_formation") ? 4 : 0);

  // Страх на цели снижает её защиту
  const targetFearPenalty = modifiers.targetFeared ? -3 : 0;

  const threshold = BASE_THRESHOLD
    + armorBonus
    + shieldBonus
    + lyingPenalty
    + surroundPenalty
    + stunnedPenalty
    + darknessMalus
    + targetFearPenalty
    + exposedPenalty
    + slowedPenalty
    + formationBonus
    + shieldWallBonus;

  return Math.max(1, threshold);
}

/**
 * Инициатива без броска — статичное значение.
 * База 10, модифицируется снаряжением.
 *
 * @param {object} actor
 * @returns {number}
 */
export function getInitiativeValue(actor) {
  if (!actor) return 10;

  const BASE = 10;
  let modifier = 0;

  // Броня снижает инициативу
  const armorTorso = getEquippedArmorForLocation(actor, "torso");

  const getArmorWeight = (armorItem) => {
    if (!armorItem) return 0;
    const slot = armorItem.system?.slot ?? "";
    const tier = Number(armorItem.system?.tier ?? 1);
    if (slot === "torso") return Math.ceil(tier / 2) * -1;
    return 0;
  };

  modifier += getArmorWeight(armorTorso);

  // Щит снижает инициативу
  const hands = ["leftHand", "rightHand"]
    .map(slot => actor.system?.equipment?.[slot] ? actor.items.get(actor.system.equipment[slot]) : null)
    .filter(Boolean);
  if (hands.some(item => item.type === "armor" || item.system?.isShield)) {
    modifier -= 1;
  }

  // Лёгкая одежда/без брони — небольшой бонус
  if (!armorTorso) {
    modifier += 1;
  }

  // Замедление — штраф к инициативе
  const slowPenalty = Number(actor.system?.conditions?.slowPenalty ?? 0);
  modifier -= slowPenalty;

  return Math.max(1, BASE + modifier);
}

/**
 * Вычисляет степень последствий провала.
 * 0 = просто промах, выше = хуже последствия.
 *
 * @param {number} roll — результат броска
 * @param {number} threshold — порог попадания
 * @param {number} dieMax — максимум куба (для антикрита)
 * @returns {{ degree: number, isAnticrit: boolean, isFail: boolean }}
 */
export function getFailureDegree(roll, threshold, dieMax) {
  if (roll >= threshold) {
    return { degree: 0, isAnticrit: false, isFail: false };
  }

  const isAnticrit = roll === 1 && dieMax > 2; // d2 не антикрит
  const degree = threshold - roll + (isAnticrit ? 5 : 0);

  return { degree, isAnticrit, isFail: true };
}
