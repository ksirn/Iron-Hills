import {
  formatAttackChatHtml,
  resolveSingleAttack
} from "./combat-attack-service.mjs";
import {
  buildActorBaseAttackParams,
  normalizeAttackDamageType,
} from "./combat-attack-profile-service.mjs";
import {
  consumePreparedReaction,
  getPreparedReaction,
} from "./combat-prepared-state-service.mjs";
import {
  getActorToken,
  getTokenGridDistance,
  getWeaponRange
} from "../utils/item-utils.mjs";

function reactionCanReach(attacker, target, weapon) {
  const attackerToken = getActorToken(attacker);
  const targetToken = getActorToken(target);
  if (!attackerToken || !targetToken || !canvas?.scene) return true;

  const distance = getTokenGridDistance(attackerToken, targetToken);
  if (!Number.isFinite(distance)) return true;

  const range = weapon ? getWeaponRange(weapon) : 1;
  return distance <= range;
}

function getReactionAttackProfile(actor, reaction) {
  const baseProfile = buildActorBaseAttackParams(actor, {
    labelPrefix: `${reaction?.label ?? "Реакция"}: `,
  });

  return {
    ...baseProfile,
    damageType: normalizeAttackDamageType(baseProfile.damageType),
    hitBonus: Number(baseProfile.hitBonus ?? 0) + Number(reaction?.hitBonus ?? 0),
  };
}

export async function applyPreparedCombatReaction({
  attacker = null,
  defender = null,
  result = null,
  sourceSkillKey = "",
  sourceDamageType = "physical",
  dieRoller = null,
  onLethal = null,
} = {}) {
  const reaction = getPreparedReaction(defender, result, { sourceSkillKey, sourceDamageType });
  if (!reaction || !attacker || !defender) {
    return { triggered: false, html: "", reaction: null, result: null };
  }

  const profile = getReactionAttackProfile(defender, reaction);
  const attackerToken = getActorToken(attacker);
  if (!reactionCanReach(defender, attacker, profile.weapon)) {
    return { triggered: false, html: "", reaction: null, result: null };
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
    hitBonus: profile.hitBonus,
    ignoreArmor: 0,
    targetZone: null,
    surroundCount: 0,
    spendEnergy: false,
    wearWeapon: Boolean(profile.weapon),
    wearArmor: true,
    applyInjuries: true,
    shieldIntercept: normalizeAttackDamageType(profile.damageType) === "physical",
    targetToken: attackerToken,
    dieRoller: dieRoller ?? undefined,
    onLethal,
  });

  if (!reactionResult) {
    return {
      triggered: true,
      html: `<p><b>${reaction.label}:</b> реакция потрачена, но ответная атака не удалась.</p>`,
      reaction,
      result: null,
    };
  }

  const attackHtml = await formatAttackChatHtml({
    label: profile.label,
    skillKey: profile.skillKey,
    attacker: defender,
    target: attacker,
    result: reactionResult,
  });

  return {
    triggered: true,
    html: `<hr>${attackHtml}`,
    reaction,
    result: reactionResult,
  };
}
