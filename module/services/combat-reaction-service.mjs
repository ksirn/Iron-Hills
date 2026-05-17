import {
  formatAttackChatHtml,
  resolveSingleAttack
} from "./combat-attack-service.mjs";
import {
  buildConditionUpdatePath,
  getActorConditionValue
} from "./condition-service.mjs";
import {
  getActorToken,
  getTokenGridDistance,
  getWeaponRange
} from "../utils/item-utils.mjs";

const RANGED_SKILLS = new Set(["bow", "crossbow", "throwing"]);

const REACTIONS = [
  {
    condition: "riposte_ready",
    label: "Рипост",
    requiresShieldBlock: true,
    hitBonus: 2,
  },
  {
    condition: "intercept_ready",
    label: "Перехват",
    requiresIncomingMelee: true,
    hitBonus: 1,
  },
  {
    condition: "counter_ready",
    label: "Контрудар",
    requiresDamage: true,
    hitBonus: 0,
  },
];

function getConditionValue(actor, key) {
  return Math.max(0, Number(getActorConditionValue(actor, key) || 0));
}

function actorCanReact(actor) {
  if (!actor) return false;
  const conditions = actor.system?.conditions ?? {};
  return !(
    Number(conditions.unconscious ?? 0) > 0 ||
    Number(conditions.stunned ?? 0) > 0 ||
    Number(conditions.sleeping ?? 0) > 0
  );
}

function getEquippedWeapon(actor) {
  const equipment = actor?.system?.equipment ?? {};
  for (const slot of ["rightHand", "leftHand"]) {
    const itemId = equipment?.[slot];
    const item = itemId ? actor.items?.get(itemId) : null;
    if (item?.type === "weapon") return item;
  }
  return null;
}

function getReactionAttackProfile(actor, reaction) {
  const weapon = getEquippedWeapon(actor);
  const fallbackSkill = actor?.type === "monster"
    ? String(actor.system?.combat?.attacks?.[0]?.skillKey ?? "unarmed")
    : "unarmed";
  const npcAttack = actor?.system?.combat?.attacks?.[0] ?? {};

  return {
    weapon,
    skillKey: weapon?.system?.skill ?? fallbackSkill,
    label: `${reaction.label}: ${weapon?.name ?? npcAttack.label ?? actor?.name ?? "Без оружия"}`,
    damageType: weapon?.system?.damageType ?? npcAttack.damageType ?? "physical",
    baseDamage: Number(weapon?.system?.damage ?? npcAttack.damage ?? actor?.system?.combat?.damage ?? 1),
    hitBonus: Number(reaction.hitBonus ?? 0),
    skillValueFallback: Number(
      actor?.system?.combat?.attackSkill
      ?? actor?.system?.combat?.unarmedSkill
      ?? actor?.system?.combat?.attackBonus
      ?? 1
    ),
  };
}

function isIncomingMelee(sourceSkillKey) {
  const key = String(sourceSkillKey ?? "");
  return key && !RANGED_SKILLS.has(key);
}

function reactionCanReach(attacker, target, weapon) {
  const attackerToken = getActorToken(attacker);
  const targetToken = getActorToken(target);
  if (!attackerToken || !targetToken || !canvas?.scene) return true;

  const distance = getTokenGridDistance(attackerToken, targetToken);
  if (!Number.isFinite(distance)) return true;

  const range = weapon ? getWeaponRange(weapon) : 1;
  return distance <= range;
}

function getPreparedReaction(defender, result, { sourceSkillKey = "", sourceDamageType = "physical" } = {}) {
  if (!actorCanReact(defender)) return null;
  if (result?.targetKilled) return null;

  const incomingMelee = isIncomingMelee(sourceSkillKey);
  const physical = String(sourceDamageType ?? "physical").toLowerCase() === "physical";

  for (const reaction of REACTIONS) {
    if (getConditionValue(defender, reaction.condition) <= 0) continue;
    if (reaction.requiresShieldBlock && !result?.shieldBlock?.success) continue;
    if (reaction.requiresDamage && !(result?.hit && Number(result?.finalDamage ?? 0) > 0)) continue;
    if (reaction.requiresIncomingMelee && !(incomingMelee && physical)) continue;
    return reaction;
  }

  return null;
}

async function consumeReaction(actor, reaction) {
  await actor.update({ [buildConditionUpdatePath(reaction.condition)]: 0 });
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
  if (!reactionCanReach(defender, attacker, profile.weapon)) {
    return { triggered: false, html: "", reaction: null, result: null };
  }

  await consumeReaction(defender, reaction);

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
    shieldIntercept: String(profile.damageType ?? "physical").toLowerCase() === "physical",
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
