import { SKILL_GROUPS } from "../constants/skills.mjs";
import { num, clamp } from "../utils/math-utils.mjs";
import { getExpNext } from "../utils/text-utils.mjs";
import {
  itemTypeLabel,
  getItemQuickSlotIcon,
  getComputedItemUnitPrice,
  getComputedItemTotalPrice
} from "../utils/item-utils.mjs";
import {
  getActorCurrency,
  getMerchantWealth,
  getMerchantMarkup
} from "../utils/actor-utils.mjs";

export function getHitLocation(rollTotal) {
  if (rollTotal <= 2) return "head";
  if (rollTotal <= 10) return "torso";
  if (rollTotal <= 13) return "leftArm";
  if (rollTotal <= 16) return "rightArm";
  if (rollTotal <= 18) return "leftLeg";
  return "rightLeg";
}

export function getHitLabel(key) {
  const labels = {
    head: "Голова",
    torso: "Торс",
    leftArm: "Левая рука",
    rightArm: "Правая рука",
    leftLeg: "Левая нога",
    rightLeg: "Правая нога"
  };
  return labels[key] ?? key;
}

export function getTargetPartLabel(part) {
  return getHitLabel(part);
}

export function getArmorSlotKey(slot) {
  const map = {
    head: "armorHead",
    torso: "armorTorso",
    arms: "armorArms",
    legs: "armorLegs"
  };
  return map[slot] ?? null;
}

export function getArmorSlotForLocation(locationKey) {
  if (locationKey === "head") return "armorHead";
  if (locationKey === "torso") return "armorTorso";
  if (locationKey === "leftArm" || locationKey === "rightArm") return "armorArms";
  if (locationKey === "leftLeg" || locationKey === "rightLeg") return "armorLegs";
  return null;
}

export function getEquippedArmorForLocation(actor, locationKey) {
  const slotKey = getArmorSlotForLocation(locationKey);
  if (!slotKey) return null;

  const armorId = actor.system.equipment?.[slotKey];
  if (!armorId) return null;

  return actor.items.get(armorId) ?? null;
}

export function getDamageReduction(armorItem, damageType) {
  if (!armorItem || armorItem.type !== "armor") return 0;
  if (damageType === "magical") return Number(armorItem.system.protection?.magical ?? 0);
  return Number(armorItem.system.protection?.physical ?? 0);
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
  const hpNode = actor?.system?.resources?.hp?.[partKey] ?? {};
  const status = hpNode.status ?? {};

  const currentHp = Number(hpNode.value ?? 0);
  const destroyed = currentHp <= 0 || Boolean(status.destroyed);
  const splinted = Boolean(status.splinted);
  const fracture = Boolean(status.fracture) && !splinted;
  const tourniquet = Boolean(status.tourniquet);
  const minorBleeding = Math.max(0, Number(status.minorBleeding ?? 0));
  const majorBleeding = Math.max(0, Number(status.majorBleeding ?? 0));

  return {
    currentHp,
    destroyed,
    fracture,
    splinted,
    tourniquet,
    minorBleeding,
    majorBleeding
  };
}

function getAllLimbStatusMap(actor) {
  return {
    head: getLimbStatusInfo(actor, "head"),
    torso: getLimbStatusInfo(actor, "torso"),
    leftArm: getLimbStatusInfo(actor, "leftArm"),
    rightArm: getLimbStatusInfo(actor, "rightArm"),
    leftLeg: getLimbStatusInfo(actor, "leftLeg"),
    rightLeg: getLimbStatusInfo(actor, "rightLeg")
  };
}

function clampNonNegativeInt(value) {
  return Math.max(0, Math.floor(Number(value ?? 0)));
}

export function getActorInjuryInfo(actor) {
  const conditions = actor.system.conditions ?? {};

  const leftArm = getLimbStatusInfo(actor, "leftArm");
  const rightArm = getLimbStatusInfo(actor, "rightArm");
  const leftLeg = getLimbStatusInfo(actor, "leftLeg");
  const rightLeg = getLimbStatusInfo(actor, "rightLeg");

  const leftArmDisabled = Boolean(leftArm.destroyed);
  const rightArmDisabled = Boolean(rightArm.destroyed);
  const leftLegDisabled = Boolean(leftLeg.destroyed);
  const rightLegDisabled = Boolean(rightLeg.destroyed);

  const leftArmFractured = Boolean(leftArm.fracture);
  const rightArmFractured = Boolean(rightArm.fracture);
  const leftLegFractured = Boolean(leftLeg.fracture);
  const rightLegFractured = Boolean(rightLeg.fracture);

  const minorBleedingTotal =
    Number(leftArm.minorBleeding) +
    Number(rightArm.minorBleeding) +
    Number(leftLeg.minorBleeding) +
    Number(rightLeg.minorBleeding) +
    Math.max(0, Number(actor.system?.resources?.hp?.head?.status?.minorBleeding ?? 0)) +
    Math.max(0, Number(actor.system?.resources?.hp?.torso?.status?.minorBleeding ?? 0));

  const majorBleedingTotal =
    Number(leftArm.majorBleeding) +
    Number(rightArm.majorBleeding) +
    Number(leftLeg.majorBleeding) +
    Number(rightLeg.majorBleeding) +
    Math.max(0, Number(actor.system?.resources?.hp?.head?.status?.majorBleeding ?? 0)) +
    Math.max(0, Number(actor.system?.resources?.hp?.torso?.status?.majorBleeding ?? 0));

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
    legFracturePenalty +
    (disabledLegCount * 2);

  const manipulationPenalty =
    bleedPressurePenalty +
    armFracturePenalty +
    disabledArmCount;

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
    bleeding,
    shock,
    poison,
    burning,

    armFracturePenalty,
    legFracturePenalty,
    disabledArmCount,
    disabledLegCount,

    attackPenalty: meleePenalty,
    meleePenalty,
    throwPenalty,
    castPenalty,
    movementPenalty,
    manipulationPenalty
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

  const bleeding =
    clampNonNegativeInt(injury.minorBleedingTotal) +
    clampNonNegativeInt(injury.majorBleedingTotal) * 2;

  const shock =
    clampNonNegativeInt(injury.majorBleedingTotal) +
    armFractures +
    legFractures +
    destroyedArms +
    destroyedLegs +
    (destroyedVital ? 100 : 0);

  const movementBlocked =
    destroyedVital ||
    destroyedLegs >= 2;

  const manipulationBlocked =
    destroyedVital ||
    destroyedArms >= 2;

  const canMeleeAttack =
    !destroyedVital &&
    destroyedArms < 2;

  const canThrow =
    !destroyedVital &&
    destroyedArms < 2;

  const canCast =
    !destroyedVital &&
    destroyedArms < 2;

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

  return {
    bleeding,
    shock,
    movementBlocked,
    manipulationBlocked,
    canMeleeAttack,
    canThrow,
    canCast,
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
  const labels = {
    fire: "Огонь",
    water: "Вода",
    earth: "Земля",
    air: "Воздух",
    life: "Жизнь",
    mind: "Разум"
  };
  return labels[school] ?? school;
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

  return labels[effectType] ?? effectType ?? "—";
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

  if (injuries.leftArmDisabled && injuries.rightArmDisabled) {
    return "Обе руки выведены из строя";
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

  if (injuries.leftArmDisabled && injuries.rightArmDisabled) {
    return "Обе руки выведены из строя";
  }

  if (currentEnergy < energyCost) {
    return `Не хватает энергии (${currentEnergy}/${energyCost})`;
  }

  return "";
}

export function getActionBlockReason(actor, actionType, payload = {}) {
  if (!actor) return "Нет актёра";

  const injuries = getActorInjuryInfo(actor);
  const encumbrance = getEncumbranceInfo(actor);

  if (actionType === "attack") {
    const hand = payload.hand ?? null;
    const weapon = payload.weapon ?? null;
    const baseEnergyCost = Number(payload.energyCost ?? 0);
    const finalEnergyCost = Math.ceil(baseEnergyCost * encumbrance.energyMultiplier);
    const currentEnergy = Number(actor.system.resources?.energy?.value ?? 0);

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
    const skill = actor.system.skills?.[school];
    if (!skill) return `Нет школы магии: ${school}`;

    const manaCost = Number(item.system.manaCost ?? 0);
    const energyCost = Number(item.system.energyCost ?? 0);
    const currentMana = Number(actor.system.resources?.mana?.value ?? 0);
    const currentEnergy = Number(actor.system.resources?.energy?.value ?? 0);

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
    const skill = actor.system.skills?.[school];
    if (!skill) return `Нет школы магии: ${school}`;

    const energyCost = Number(item.system.energyCost ?? 0);
    const currentEnergy = Number(actor.system.resources?.energy?.value ?? 0);

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

    if (currentEnergy < energyCost) {
      return `Нужно энергии: ${energyCost}`;
    }

    if (injuries.rightArmDisabled && injuries.leftArmDisabled) {
      return "Обе руки выведены из строя";
    }

    return "";
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
    if (item.type === "potion") return "";
    if (item.type === "consumable") return "";
    if (item.type === "weapon") return "";
    if (item.type === "spell") return getActionBlockReason(actor, "spell", { item });
    if (item.type === "scroll") return getActionBlockReason(actor, "scroll", { item });
    if (item.type === "throwable") return getActionBlockReason(actor, "throwable", { item });

    return "Тип предмета нельзя использовать";
  }

  return "";
}

export function buildActionState(actor) {
  const injuries = getActorInjuryInfo(actor);
  const eq = actor.system?.equipment ?? {};
  const currentEnergy = Number(actor.system?.resources?.energy?.value ?? 0);

  const rightWeapon = eq.rightHand ? actor.items.get(eq.rightHand) : null;
  const leftWeapon = eq.leftHand ? actor.items.get(eq.leftHand) : null;

  let attackRightReason = "";
  let attackLeftReason = "";

  const rightEnergyCost = Number(rightWeapon?.system?.energyCost ?? 5);
  const leftEnergyCost = Number(leftWeapon?.system?.energyCost ?? 5);

  if (injuries.rightArmDisabled) {
    attackRightReason = "Правая рука выведена из строя";
  } else if (rightWeapon?.system?.twoHanded && (injuries.leftArmDisabled || injuries.rightArmDisabled)) {
    attackRightReason = "Для двуручного оружия нужны две рабочие руки";
  } else if (currentEnergy < rightEnergyCost) {
    attackRightReason = `Не хватает энергии (${currentEnergy}/${rightEnergyCost})`;
  }

  if (injuries.leftArmDisabled) {
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

    let reason = "";

    if (item.type === "spell") {
      reason = getSpellCastBlockReason(actor, item, { isScroll: false });
    } else if (item.type === "scroll") {
      reason = getSpellCastBlockReason(actor, item, { isScroll: true });
    } else if (item.type === "throwable") {
      reason = getThrowableBlockReason(actor, item);
    }

    result[slotKey] = {
      canUse: !reason,
      reason
    };
  }

  return result;
}

export function buildGroupedItems(actor) {
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

  for (const item of items) {
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

        const spellReason =
          item.type === "spell" ? getSpellCastBlockReason(actor, item, { isScroll: false }) : "";

        const scrollReason =
          item.type === "scroll" ? getSpellCastBlockReason(actor, item, { isScroll: true }) : "";

        const throwableReason =
          item.type === "throwable" ? getThrowableBlockReason(actor, item) : "";

        return {
          id: item.id,
          name: item.name,
          kind: itemTypeLabel(item.type),
          icon: getItemQuickSlotIcon(item),
          type: item.type,
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

          canUseFood: item.type === "food",
          canUsePotion: item.type === "potion",
          canUseConsumable: item.type === "consumable",

          canUseThrowable: item.type === "throwable" && !throwableReason,
          throwableBlockedReason: throwableReason,

          canCastSpell: item.type === "spell" && !spellReason,
          spellBlockedReason: spellReason,

          canUseScroll: item.type === "scroll" && !scrollReason,
          scrollBlockedReason: scrollReason,

          canAssignQuick,
          quickAssignSlots
        };
      })
    });
  }

  return result;
}

export function buildEquipmentSummary(actor) {
  const eq = actor.system?.equipment || {};

  const rightHandWeapon = eq.rightHand ? actor.items.get(eq.rightHand) : null;
  const leftHandWeapon = eq.leftHand ? actor.items.get(eq.leftHand) : null;
  const armorHead = eq.armorHead ? actor.items.get(eq.armorHead) : null;
  const armorTorso = eq.armorTorso ? actor.items.get(eq.armorTorso) : null;
  const armorArms = eq.armorArms ? actor.items.get(eq.armorArms) : null;
  const armorLegs = eq.armorLegs ? actor.items.get(eq.armorLegs) : null;

  return [
    {
      slot: "Правая рука",
      slotKey: "rightHand",
      itemName: rightHandWeapon?.type === "weapon" ? rightHandWeapon.name : "—"
    },
    {
      slot: "Левая рука",
      slotKey: "leftHand",
      itemName: leftHandWeapon?.type === "weapon" ? leftHandWeapon.name : "—"
    },
    {
      slot: "Голова",
      slotKey: "armorHead",
      itemName: armorHead?.type === "armor" ? armorHead.name : "—"
    },
    {
      slot: "Торс",
      slotKey: "armorTorso",
      itemName: armorTorso?.type === "armor" ? armorTorso.name : "—"
    },
    {
      slot: "Руки",
      slotKey: "armorArms",
      itemName: armorArms?.type === "armor" ? armorArms.name : "—"
    },
    {
      slot: "Ноги",
      slotKey: "armorLegs",
      itemName: armorLegs?.type === "armor" ? armorLegs.name : "—"
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

  const armorHeadRaw = eq.armorHead ? actor.items.get(eq.armorHead) : null;
  const armorTorsoRaw = eq.armorTorso ? actor.items.get(eq.armorTorso) : null;
  const armorArmsRaw = eq.armorArms ? actor.items.get(eq.armorArms) : null;
  const armorLegsRaw = eq.armorLegs ? actor.items.get(eq.armorLegs) : null;

  const rightWeapon = rightWeaponRaw?.type === "weapon" ? rightWeaponRaw : null;
  const leftWeapon = leftWeaponRaw?.type === "weapon" ? leftWeaponRaw : null;

  const armorHead = armorHeadRaw?.type === "armor" ? armorHeadRaw : null;
  const armorTorso = armorTorsoRaw?.type === "armor" ? armorTorsoRaw : null;
  const armorArms = armorArmsRaw?.type === "armor" ? armorArmsRaw : null;
  const armorLegs = armorLegsRaw?.type === "armor" ? armorLegsRaw : null;

  const mapWeapon = item => ({
    name: item?.name || "Кулаки",
    damage: item ? num(item.system.damage, 1) : num(actor.system.combat?.unarmedDamage, 1),
    energyCost: item ? num(item.system.energyCost, 0) : 5,
    skill: item?.system?.skill || "unarmed",
    twoHanded: !!item?.system?.twoHanded,
    damageType: item?.system?.damageType || "physical"
  });

  const mapArmor = item => ({
    name: item?.name || "—",
    physical: num(item?.system?.protection?.physical, 0),
    magical: num(item?.system?.protection?.magical, 0)
  });

  return {
    rightWeapon: mapWeapon(rightWeapon),
    leftWeapon: mapWeapon(leftWeapon),
    armorHead: mapArmor(armorHead),
    armorTorso: mapArmor(armorTorso),
    armorArms: mapArmor(armorArms),
    armorLegs: mapArmor(armorLegs)
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

  const schoolOrder = ["fire", "water", "earth", "air", "life", "mind"];
  const schools = schoolOrder.map(key => ({
    key,
    label: getSpellSchoolLabel(key),
    value: num(actor.system.skills?.[key]?.value, 1)
  }));

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

  return {
    race: actor.system.info?.race || "",
    age: actor.system.info?.age ?? "",
    defense: num(actor.system.combat?.defense, 0),
    unarmedDamage: num(actor.system.combat?.unarmedDamage, 1),
    energyValue: num(resources.energy?.value, 0),
    energyMax: num(resources.energy?.max, 0),
    manaValue: num(resources.mana?.value, 0),
    manaMax: num(resources.mana?.max, 0),
    satietyValue: num(resources.satiety?.value, 0),
    satietyMax: num(resources.satiety?.max, 0),
    hydrationValue: num(resources.hydration?.value, 0),
    hydrationMax: num(resources.hydration?.max, 0),
    weightValue: num(resources.weight?.value, 0),
    weightMax: num(resources.weight?.max, 0),
    coins: getActorCurrency(actor),
    encumbranceLabel: encumbrance.label,
    bleeding: num(conditions.bleeding, 0),
    shock: num(conditions.shock, 0),
    poison: num(conditions.poison, 0),
    burning: num(conditions.burning, 0)
  };
}

export function buildSkillGroups(actor) {
  const actorSkills = actor.system?.skills ?? {};

  return SKILL_GROUPS.map(group => ({
    key: group.key,
    label: group.label,
    skills: group.skills.map(skillDef => {
      const skillData = actorSkills[skillDef.key] ?? {};

      return {
        key: skillDef.key,
        label: skillDef.label,
        value: num(skillData.value, 1),
        exp: num(skillData.exp, 0),
        expNext: num(skillData.expNext, getExpNext(num(skillData.value, 1)) ?? 0)
      };
    })
  }));
}