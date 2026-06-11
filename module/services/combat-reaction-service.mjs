import {
  formatAttackChatHtml,
  resolveSingleAttack
} from "./combat-attack-service.mjs";
import {
  buildActorBaseAttackParams,
  normalizeAttackDamageType,
} from "./combat-attack-profile-service.mjs";
import { buildCombatChatCard, joinCombatHtml } from "./combat-chat-service.mjs";
import { isShieldBlockableDamageType } from "./damage-type-service.mjs";
import {
  consumePreparedReaction,
  getPreparedTechniquePayload,
  getPreparedReaction,
} from "./combat-prepared-state-service.mjs";
import {
  getActorToken,
  getTokenGridDistance,
  getWeaponRange
} from "../utils/item-utils.mjs";

function buildReactionResult({
  triggered = false,
  interrupted = false,
  html = "",
  reaction = null,
  result = null,
  reason = "",
  details = {},
} = {}) {
  return { triggered, interrupted, html, reaction, result, reason, details };
}

function reactionCanReach(attacker, target, weapon, rangeOverride = null) {
  const attackerToken = getActorToken(attacker);
  const targetToken = getActorToken(target);
  if (!attackerToken || !targetToken || !globalThis.canvas?.scene) {
    return { ok: true, distance: null, range: null, reason: "position-unknown" };
  }

  const distance = getTokenGridDistance(attackerToken, targetToken);
  if (!Number.isFinite(distance)) {
    return { ok: true, distance, range: null, reason: "distance-unknown" };
  }

  const range = Number(rangeOverride ?? 0) > 0
    ? Number(rangeOverride)
    : (weapon ? getWeaponRange(weapon) : 1);
  return {
    ok: distance <= range,
    distance,
    range,
    reason: distance <= range ? "" : "out-of-range",
  };
}

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolvePreparedWeapon(actor, prepared) {
  const item = prepared?.weaponId
    ? actor?.items?.get?.(prepared.weaponId)
    : null;
  return item?.type === "weapon" ? item : null;
}

function buildReactionFailureCard(reaction, message) {
  return buildCombatChatCard({
    title: reaction?.label ?? "Реакция",
    icon: "!",
    status: "Сорвана",
    statusClass: "is-danger",
    badges: [
      { label: "prepared", className: "is-warn" },
    ],
    rows: [
      ["Результат", message],
    ],
    className: "ih-combat-reaction",
  });
}

function getReactionAttackProfile(actor, reaction) {
  const prepared = getPreparedTechniquePayload(actor, reaction?.condition);
  const preparedWeapon = resolvePreparedWeapon(actor, prepared);
  if (prepared?.requiresWeapon && !preparedWeapon) {
    return {
      ok: false,
      reason: "prepared-weapon-missing",
      prepared,
      message: "подготовленная реакция сорвалась: оружие больше недоступно",
    };
  }

  const baseProfile = buildActorBaseAttackParams(actor, {
    hand: prepared?.weaponSlot ?? null,
    weapon: preparedWeapon,
    labelPrefix: `${reaction?.label ?? "Реакция"}: `,
  });

  const damageMultiplier = Math.max(0, numberOr(
    prepared?.damageMultiplier,
    reaction?.damageMultiplier ?? 1,
  ));
  const preparedBaseDamage = numberOr(prepared?.baseDamage, 0);
  const fallbackBaseDamage = preparedBaseDamage > 0
    ? preparedBaseDamage
    : baseProfile.baseDamage;

  return {
    ok: true,
    ...baseProfile,
    label: prepared?.techniqueLabel
      ? `${prepared.techniqueLabel}: ${preparedWeapon?.name ?? prepared.weaponName ?? baseProfile.label}`
      : baseProfile.label,
    weapon: preparedWeapon ?? baseProfile.weapon ?? null,
    skillKey: prepared?.skillKey || baseProfile.skillKey,
    damageType: normalizeAttackDamageType(prepared?.damageType ?? baseProfile.damageType),
    baseDamage: Math.max(0, Math.round(numberOr(fallbackBaseDamage, 1) * damageMultiplier)),
    hitBonus: Number(baseProfile.hitBonus ?? 0)
      + Number(reaction?.hitBonus ?? 0)
      + numberOr(prepared?.hitBonus, 0),
    ignoreArmor: Math.max(0, numberOr(prepared?.ignoreArmor, 0)),
    rangeOverride: prepared?.rangeOverride ?? prepared?.weaponRange ?? baseProfile.rangeOverride ?? null,
    attackMode: prepared?.attackMode ?? baseProfile.attackMode ?? null,
    targetZone: prepared?.targetZone ?? null,
    preparedTechnique: prepared ?? null,
  };
}

export async function applyPreparedCombatReaction({
  attacker = null,
  defender = null,
  result = null,
  sourceSkillKey = "",
  sourceAttackMode = null,
  sourceDamageType = "physical",
  phase = "post-hit",
  dieRoller = null,
  onLethal = null,
} = {}) {
  const reaction = getPreparedReaction(defender, result, { sourceSkillKey, sourceAttackMode, sourceDamageType, phase });
  if (!reaction || !attacker || !defender) {
    return buildReactionResult({ reason: reaction ? "missing-actors" : "no-reaction" });
  }

  const profile = getReactionAttackProfile(defender, reaction);
  if (!profile.ok) {
    await consumePreparedReaction(defender, reaction);
    return buildReactionResult({
      triggered: true,
      reaction,
      reason: profile.reason,
      details: { prepared: profile.prepared ?? null },
      html: buildReactionFailureCard(reaction, profile.message ?? "реакция потрачена, но не может быть выполнена"),
    });
  }

  const attackerToken = getActorToken(attacker);
  const reach = reactionCanReach(defender, attacker, profile.weapon, profile.rangeOverride);
  if (!reach.ok) {
    return buildReactionResult({
      reaction,
      reason: "out-of-range",
      details: reach,
    });
  }

  await consumePreparedReaction(defender, reaction);

  const reactionResult = await resolveSingleAttack({
    attacker: defender,
    target: attacker,
    skillKey: profile.skillKey,
    skillValueFallback: profile.skillValueFallback,
    baseDamage: profile.baseDamage,
    damageType: profile.damageType,
    energyCost: 0,
    weapon: profile.weapon,
    attackMode: profile.attackMode,
    hitBonus: profile.hitBonus,
    ignoreArmor: profile.ignoreArmor,
    targetZone: profile.targetZone,
    surroundCount: 0,
    spendEnergy: false,
    wearWeapon: Boolean(profile.weapon),
    wearArmor: true,
    applyInjuries: true,
    shieldIntercept: isShieldBlockableDamageType(profile.damageType),
    targetToken: attackerToken,
    dieRoller: dieRoller ?? undefined,
    onLethal,
  });

  if (!reactionResult) {
    return buildReactionResult({
      triggered: true,
      html: buildReactionFailureCard(reaction, "реакция потрачена, но ответная атака не удалась"),
      reaction,
      reason: "attack-cancelled",
    });
  }

  const attackHtml = await formatAttackChatHtml({
    label: profile.label,
    skillKey: profile.skillKey,
    attacker: defender,
    target: attacker,
    result: reactionResult,
  });

  const interrupted = Boolean(reaction.interruptsOnHit && reactionResult.hit);
  const interruptHtml = interrupted ? buildCombatChatCard({
    title: reaction.label,
    icon: "!",
    status: "Прерывание",
    statusClass: "is-danger",
    badges: [
      { label: "prepared", className: "is-warn" },
      { label: "interrupt", className: "is-danger" },
    ],
    rows: [
      ["Результат", "входящая атака прервана"],
      ["Защитник", defender.name],
      ["Атакующий", attacker.name],
    ],
    className: "ih-combat-reaction ih-combat-interrupt",
  }) : "";

  return buildReactionResult({
    triggered: true,
    interrupted,
    html: joinCombatHtml("<hr>", attackHtml, interruptHtml),
    reaction,
    result: reactionResult,
  });
}
