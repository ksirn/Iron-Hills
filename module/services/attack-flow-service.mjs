import {
  getActionBlockReason,
  getActorInjuryInfo,
  getDerivedConditionState,
  getEncumbranceInfo,
} from "./actor-state-service.mjs";
import {
  formatAttackChatHtml,
  resolveSingleAttack,
} from "./combat-attack-service.mjs";
import { applyPreparedCombatReaction } from "./combat-reaction-service.mjs";
import { consumePreparedAttackBonus } from "./combat-technique-service.mjs";
import { isCombatActive } from "./combat-flow-service.mjs";
import { applyHitEffects, buildHitEffect } from "./hit-effect-service.mjs";
import { getWeatherSkillMod } from "./weather-service.mjs";
import {
  getActorToken,
  getTokenGridDistance,
  getWeaponRange,
} from "../utils/item-utils.mjs";

function attackResult({
  ok = true,
  queued = false,
  result = null,
  reason = "",
} = {}) {
  return { ok, queued, result, reason };
}

function getSelectedTargetEntries(targets = globalThis.game?.user?.targets ?? []) {
  return targets instanceof Set ? [...targets] : Array.from(targets ?? []);
}

export async function performActorAttack({
  actor,
  hand = null,
  skillKey,
  label,
  damageType = "physical",
  baseDamage = 1,
  energyCost = 5,
  weapon = null,
  skipTimeCost = false,
  hitBonus = 0,
  ignoreArmor = 0,
  targetZone = null,
  aimed = false,
  technique = null,
  applyCondition = null,
  conditionDuration = 0,
  conditionChance = 1.0,
  effectNotes = [],
  rangeOverride = null,
  targets = globalThis.game?.user?.targets ?? [],
  requireSettledInventory = null,
  getCombatActionSeconds = null,
  resolveCombatTimeCost = null,
  requestHostileAction = null,
  dieRoller = null,
  onLethal = null,
  applySkillExp = null,
  afterAttack = null,
} = {}) {
  if (!actor?.system?.resources?.energy) {
    return attackResult({ ok: false, reason: "missing-energy" });
  }

  if (!skipTimeCost && requireSettledInventory) {
    const settled = await requireSettledInventory(`атака: ${label}`);
    if (!settled) return attackResult({ ok: false, reason: "pending-inventory" });
  }

  const encumbrance = getEncumbranceInfo(actor);
  const injuries = getActorInjuryInfo(actor);
  const derivedConditions = getDerivedConditionState(actor);
  if (!derivedConditions.canMeleeAttack) {
    ui.notifications.warn("Персонаж не может выполнить ближнюю атаку из-за критических травм.");
    return attackResult({ ok: false, reason: "cannot-melee-attack" });
  }

  if (!isCombatActive() && !globalThis.game?.user?.isGM) {
    const allowed = await requestHostileAction?.(`Атака: ${label}`);
    if (!allowed) return attackResult({ ok: false, reason: "hostile-action-denied" });
  }

  const weatherMod = typeof getWeatherSkillMod === "function"
    ? getWeatherSkillMod(skillKey)
    : 0;
  hitBonus = Number(hitBonus ?? 0) + weatherMod;

  const blockReason = getActionBlockReason(actor, "attack", {
    hand,
    weapon,
    energyCost,
  });
  if (blockReason) {
    ui.notifications.warn(blockReason);
    return attackResult({ ok: false, reason: "blocked" });
  }

  const selectedTargets = getSelectedTargetEntries(targets);
  if (!selectedTargets.length) {
    ui.notifications.warn("Выберите цель");
    return attackResult({ ok: false, reason: "missing-target" });
  }

  const targetToken = selectedTargets[0];
  const targetActor = targetToken?.actor;
  if (!targetActor) {
    ui.notifications.warn("У цели нет актёра");
    return attackResult({ ok: false, reason: "missing-target-actor" });
  }

  const skill = actor.system.skills?.[skillKey];
  if (!skill) {
    ui.notifications.warn(`У персонажа нет навыка ${skillKey}`);
    return attackResult({ ok: false, reason: "missing-skill" });
  }

  const attackerToken = getActorToken(actor);
  if (attackerToken && targetToken && globalThis.canvas?.scene) {
    const dist = getTokenGridDistance(attackerToken, targetToken);
    const range = Number(rangeOverride ?? 0) > 0
      ? Number(rangeOverride)
      : (weapon ? getWeaponRange(weapon) : (skillKey === "exotic" ? 1 : 1));
    if (dist > range) {
      ui.notifications.warn(`Цель вне досягаемости: расстояние ${Math.ceil(dist)} клеток, дальность оружия ${range}`);
      return attackResult({ ok: false, reason: "out-of-range" });
    }
  }

  if (!skipTimeCost && resolveCombatTimeCost) {
    const timeState = await resolveCombatTimeCost({
      actionType: "attack",
      label: `Атака: ${label}`,
      item: weapon,
      totalSeconds: getCombatActionSeconds?.("attack", weapon),
      payload: {
        hand,
        skillKey,
        damageType,
        label,
        baseDamage,
        energyCost,
        weaponId: weapon?.id ?? "",
        hitBonus,
        ignoreArmor,
        targetZone,
        aimed,
        technique,
        applyCondition,
        conditionDuration,
        conditionChance,
        effectNotes,
        rangeOverride,
      },
    });

    if (timeState?.queued) return attackResult({ queued: true });
    if (!timeState?.ok) return attackResult({ ok: false, reason: "time-cost" });
  }

  const preparedBonus = await consumePreparedAttackBonus(actor, { skillKey });
  if (preparedBonus.hitBonus) {
    hitBonus = Number(hitBonus ?? 0) + preparedBonus.hitBonus;
    effectNotes = [
      ...(Array.isArray(effectNotes) ? effectNotes : [effectNotes].filter(Boolean)),
      ...preparedBonus.lines,
    ];
  }

  const surroundCount = selectedTargets.length > 1 ? selectedTargets.length - 1 : 0;
  const result = await resolveSingleAttack({
    attacker: actor,
    target: targetActor,
    skillKey,
    baseDamage,
    damageType,
    energyCost,
    weapon,
    hitBonus,
    ignoreArmor,
    targetZone,
    surroundCount,
    encumbrance,
    injuries,
    ignoreShield: technique?.effect?.special === "ignore_shield",
    dieRoller,
    onLethal,
  });
  if (!result) return attackResult({ ok: false, reason: "attack-cancelled" });

  const extraHtml = (await applyHitEffects({
    attacker: actor,
    target: targetActor,
    result,
    effect: buildHitEffect(technique?.effect, {
      applyCondition,
      conditionDuration,
      conditionChance,
      notes: effectNotes,
    }),
  })).html;

  const content = await formatAttackChatHtml({
    label,
    skillKey,
    attacker: actor,
    target: targetActor,
    result,
  });

  const reaction = await applyPreparedCombatReaction({
    attacker: actor,
    defender: targetActor,
    result,
    sourceSkillKey: skillKey,
    sourceDamageType: damageType,
    dieRoller,
    onLethal,
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: content + extraHtml + reaction.html,
  });

  await applySkillExp?.(skillKey, label);
  await afterAttack?.({ actor, targetActor, result });

  return attackResult({ result });
}
