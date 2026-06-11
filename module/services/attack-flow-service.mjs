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
import {
  buildCombatRows,
  createCombatChatMessage,
  joinCombatHtml,
} from "./combat-chat-service.mjs";
import { applyPreparedCombatReaction } from "./combat-reaction-service.mjs";
import {
  getAttackBlockState,
  normalizeAttackMode,
} from "./combat-attack-mode-service.mjs";
import { consumePreparedAttackBonus } from "./combat-technique-service.mjs";
import { isCombatActive } from "./combat-flow-service.mjs";
import { applyHitEffects, buildHitEffect } from "./hit-effect-service.mjs";
import { getWeatherSkillMod } from "./weather-service.mjs";
import {
  buildCombatActionTargetPayload,
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

async function spendInterruptedAttackEnergy(actor, energyCost, encumbrance) {
  const finalEnergyCost = Math.ceil(Number(energyCost || 0) * Number(encumbrance?.energyMultiplier ?? 1));
  if (finalEnergyCost <= 0) return 0;

  const curEnergy = Number(actor.system?.resources?.energy?.value ?? 0);
  await actor.update({
    "system.resources.energy.value": Math.max(0, curEnergy - finalEnergyCost),
  });
  return finalEnergyCost;
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
  attackMode: attackModeInput = null,
  ignoreArmor = 0,
  targetZone = null,
  targetZoneMode = null,
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
  const attackMode = normalizeAttackMode(attackModeInput, {
    skillKey,
    weapon,
    technique,
    rangeOverride,
  });

  if (!skipTimeCost && requireSettledInventory) {
    const settled = await requireSettledInventory(`атака: ${label}`);
    if (!settled) return attackResult({ ok: false, reason: "pending-inventory" });
  }

  const encumbrance = getEncumbranceInfo(actor);
  const injuries = getActorInjuryInfo(actor);
  const derivedConditions = getDerivedConditionState(actor);
  const attackBlockState = getAttackBlockState(derivedConditions, attackMode);
  if (!attackBlockState.canAttack) {
    ui.notifications.warn(attackBlockState.reason || "Персонаж не может атаковать из-за состояния.");
    return attackResult({ ok: false, reason: `cannot-${attackBlockState.mode}-attack` });
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
    skillKey,
    attackMode,
    rangeOverride,
    technique,
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
        attackMode,
        hitBonus,
        ignoreArmor,
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
        ...buildCombatActionTargetPayload({
          targets: selectedTargets,
          targetZone,
          targetZoneMode,
          aimed,
        }),
      },
    });

    if (timeState?.queued) return attackResult({ queued: true });
    if (!timeState?.ok) return attackResult({ ok: false, reason: "time-cost" });
  }

  const preReaction = await applyPreparedCombatReaction({
    attacker: actor,
    defender: targetActor,
    result: null,
    sourceSkillKey: skillKey,
    sourceAttackMode: attackMode,
    sourceDamageType: damageType,
    phase: "pre-hit",
    dieRoller: dieRoller ?? undefined,
    onLethal,
  });
  const preReactionHtml = preReaction.html ?? "";
  if (preReaction.interrupted) {
    const spentEnergy = await spendInterruptedAttackEnergy(actor, energyCost, encumbrance);
    await createCombatChatMessage({
      actor,
      title: label,
      rows: [
        ["Атакующий", actor.name],
        ["Цель", targetActor.name],
        ["Результат", `атака прервана подготовленной реакцией ${targetActor.name}`],
        ["Энергия", `-${spentEnergy}`, spentEnergy > 0],
      ],
      bodyHtml: preReactionHtml,
      className: "ih-combat-interrupted-attack",
    });
    await afterAttack?.({ actor, targetActor, result: null, interrupted: true, reaction: preReaction });
    return attackResult({
      result: {
        interrupted: true,
        reaction: preReaction,
      },
      reason: "interrupted",
    });
  }

  const preparedBonus = await consumePreparedAttackBonus(actor, { skillKey, weapon });
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
    attackMode,
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

  const extraRows = [];
  if (technique) {
    extraRows.push(["Приём", `${technique.icon ?? "⚔"} ${technique.label ?? ""}`]);
  }
  if (aimed && targetZone) {
    extraRows.push(["Прицел", result.locationLabel ?? targetZone]);
  }
  if (technique?.effect?.targetZoneMode && !aimed) {
    extraRows.push(["Зона приёма", result.locationLabel ?? targetZone ?? "случайная"]);
  }

  const extraHtml = joinCombatHtml(
    buildCombatRows(extraRows, { className: "ih-attack-extra-rows" }),
    (await applyHitEffects({
    attacker: actor,
    target: targetActor,
    result,
    effect: buildHitEffect(technique?.effect, {
      applyCondition,
      conditionDuration,
      conditionChance,
      notes: effectNotes,
    }),
    })).html,
  );

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
    sourceAttackMode: attackMode,
    sourceDamageType: damageType,
    dieRoller: dieRoller ?? undefined,
    onLethal,
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: joinCombatHtml(preReactionHtml, content, extraHtml, reaction.html),
  });

  await applySkillExp?.(skillKey, label);
  await afterAttack?.({ actor, targetActor, result, preReaction, reaction, preparedBonus });

  return attackResult({ result });
}
