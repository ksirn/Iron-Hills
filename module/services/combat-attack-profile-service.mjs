import { resolveCombatActionTargets } from "./combat-action-target-service.mjs";
import { actorsAreAllies } from "./disposition-service.mjs";

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeAttackDamageType(value) {
  return String(value ?? "physical").toLowerCase() === "magical"
    ? "magical"
    : "physical";
}

export function getActorAttackSkillValueFallback(actor) {
  return Math.max(1, numberOr(
    actor?.system?.combat?.attackSkill
      ?? actor?.system?.combat?.unarmedSkill
      ?? actor?.system?.combat?.attackBonus,
    1
  ));
}

export function getEquippedAttackWeapon(actor, hand = null) {
  const equipment = actor?.system?.equipment ?? {};

  if (hand) {
    const itemId = equipment?.[hand];
    const item = itemId ? actor?.items?.get?.(itemId) : null;
    return item?.type === "weapon" ? item : null;
  }

  for (const slot of ["rightHand", "leftHand"]) {
    const itemId = equipment?.[slot];
    const item = itemId ? actor?.items?.get?.(itemId) : null;
    if (item?.type === "weapon") return item;
  }

  return null;
}

export function getPrimaryNaturalAttack(actor) {
  const attacks = actor?.system?.combat?.attacks;
  if (Array.isArray(attacks) && attacks.length) return attacks[0];
  return null;
}

export function buildActorBaseAttackParams(actor, {
  hand = null,
  weapon = null,
  labelPrefix = "",
} = {}) {
  const equippedWeapon = weapon ?? getEquippedAttackWeapon(actor, hand);
  const skillValueFallback = getActorAttackSkillValueFallback(actor);

  if (equippedWeapon) {
    return {
      hand,
      skillKey: String(equippedWeapon.system?.skill ?? "unarmed"),
      label: `${labelPrefix}${equippedWeapon.name}`,
      damageType: normalizeAttackDamageType(equippedWeapon.system?.damageType),
      baseDamage: numberOr(equippedWeapon.system?.damage, 1),
      energyCost: numberOr(equippedWeapon.system?.energyCost, 10),
      weapon: equippedWeapon,
      skillValueFallback,
      actionSeconds: numberOr(
        equippedWeapon.system?.actionSeconds ?? equippedWeapon.system?.timeCost,
        0
      ) || null,
    };
  }

  const naturalAttack = getPrimaryNaturalAttack(actor);
  const isMonster = actor?.type === "monster";
  const naturalLabel = naturalAttack?.label ?? (isMonster ? `Attack: ${actor?.name ?? ""}` : "Unarmed");

  return {
    hand,
    skillKey: String(naturalAttack?.skillKey ?? "unarmed"),
    label: `${labelPrefix}${naturalLabel}`,
    damageType: normalizeAttackDamageType(naturalAttack?.damageType),
    baseDamage: numberOr(
      naturalAttack?.damage
        ?? actor?.system?.combat?.damage
        ?? actor?.system?.combat?.unarmedDamage,
      isMonster ? 2 : 1
    ),
    energyCost: numberOr(
      naturalAttack?.energyCost,
      isMonster ? 3 : 2
    ),
    weapon: null,
    skillValueFallback,
    actionSeconds: numberOr(naturalAttack?.actionSeconds ?? naturalAttack?.timeCost, 0) || null,
    rangeOverride: numberOr(naturalAttack?.range, 0) || null,
  };
}

export function resolveActorAttackTargets(actor, {
  targets = null,
  targetRefs = null,
  fallbackTargets = globalThis.game?.user?.targets ?? [],
  autoTargetHostile = false,
} = {}) {
  const resolved = resolveCombatActionTargets({ targets, targetRefs, fallbackTargets });
  if (resolved.length) return resolved;
  if (!autoTargetHostile) return [];

  const token = globalThis.canvas?.tokens?.placeables?.find(t =>
    t?.actor &&
    t.actor.id !== actor?.id &&
    !actorsAreAllies(actor, t.actor)
  );

  return token ? [token] : [];
}
