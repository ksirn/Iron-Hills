import { isConditionActive } from "./condition-policy-service.mjs";

export function getCombatActionSeconds(actionType, item = null) {
  if (actionType === "attack") {
    if (item?.system?.timeCost) return Number(item.system.timeCost);
    if (item?.system?.actionSeconds) return Number(item.system.actionSeconds);

    const skillDefaults = {
      knife: 1.0,
      throwing: 1.0,
      unarmed: 1.0,
      crossbow: 1.5,
      mace: 2.0,
      sword: 2.0,
      bow: 3.0,
      axe: 2.5,
      spear: 2.5,
      flail: 2.5,
    };
    const skill = item?.system?.skill;
    if (skill && skillDefaults[skill]) {
      return item?.system?.twoHanded
        ? skillDefaults[skill] + 0.5
        : skillDefaults[skill];
    }
    if (item?.system?.twoHanded) return 3.0;
    return 2.0;
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

export function applyActorSpeedModifier(actor, seconds) {
  const conditions = actor?.system?.conditions ?? {};
  if (isConditionActive(conditions, "slowed")) return seconds * 2.0;
  if (isConditionActive(conditions, "hasted")) return seconds * 0.5;
  return seconds;
}
