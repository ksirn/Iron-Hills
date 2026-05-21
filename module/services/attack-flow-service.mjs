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
  buildCombatTargetPayload,
  getCombatTargetActor,
  getCombatTargetToken,
} from "./combat-action-target-service.mjs";
import {
  normalizeAttackDamageType,
  resolveActorAttackTargets,
} from "./combat-attack-profile-service.mjs";
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
  skillValueFallback = null,
  actionSeconds = null,
  autoTargetHostile = false,
  useExplodingDice = true,
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

  damageType = normalizeAttackDamageType(damageType);

  if (!skipTimeCost && requireSettledInventory) {
    const settled = await requireSettledInventory(`атака: ${label}`);
    if (!settled) return attackResult({ ok: false, reason: "pending-inventory" });
  }

  const encumbrance = getEncumbranceInfo(actor);
  const injuries = getActorInjuryInfo(actor);
  const derivedConditions = getDerivedConditionState(actor);
  if (!derivedConditions.canMeleeAttack) {
    ui.notifications.warn(derivedConditions.meleeBlockReason || "Персонаж не может выполнить ближнюю атаку из-за состояния.");
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

  const selectedTargets = resolveActorAttackTargets(actor, {
    targets,
    autoTargetHostile,
  });
  if (!selectedTargets.length) {
    ui.notifications.warn("Выберите цель");
    return attackResult({ ok: false, reason: "missing-target" });
  }

  const targetToken = selectedTargets[0];
  const targetActor = getCombatTargetActor(targetToken);
  if (!targetActor) {
    ui.notifications.warn("У цели нет актёра");
    return attackResult({ ok: false, reason: "missing-target-actor" });
  }

  const skill = actor.system.skills?.[skillKey];
  const fallbackSkillValue = Number(skillValueFallback ?? 0);
  if (!skill && !(fallbackSkillValue > 0)) {
    ui.notifications.warn(`У персонажа нет навыка ${skillKey}`);
    return attackResult({ ok: false, reason: "missing-skill" });
  }

  const attackerToken = getActorToken(actor);
  const targetTokenForRange = getCombatTargetToken(targetToken);
  if (attackerToken && targetTokenForRange && globalThis.canvas?.scene) {
    const dist = getTokenGridDistance(attackerToken, targetTokenForRange);
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
      totalSeconds: Number(actionSeconds ?? 0) || getCombatActionSeconds?.("attack", weapon),
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
        skillValueFallback,
        actionSeconds,
        autoTargetHostile,
        useExplodingDice,
        ...buildCombatTargetPayload(selectedTargets),
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
    skillValueFallback,
    targetToken: targetTokenForRange,
    dieRoller: dieRoller ?? undefined,
    onLethal,
  });
  if (!result) return attackResult({ ok: false, reason: "attack-cancelled" });

  let extraHtml = "";
  if (technique) {
    extraHtml += `<p><b>РџСЂРёС‘Рј:</b> ${technique.icon ?? "вљ”"} ${technique.label ?? ""}</p>`;
  }
  if (aimed && targetZone) {
    extraHtml += `<p><b>РџСЂРёС†РµР»:</b> ${result.locationLabel ?? targetZone}</p>`;
  }

  extraHtml += (await applyHitEffects({
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
    dieRoller: dieRoller ?? undefined,
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
