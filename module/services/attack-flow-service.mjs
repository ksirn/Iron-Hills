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
import { actorsAreAllies } from "./disposition-service.mjs";
import { playAttackVfx } from "./combat-vfx-service.mjs";
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
  summary = null,
  reason = "",
} = {}) {
  return { ok, queued, result, summary, reason };
}

function notifyWarn(message) {
  globalThis.ui?.notifications?.warn?.(message);
}

function getTargetDocument(token) {
  return token?.document ?? token ?? null;
}

function getTokenCenterForSurround(token) {
  const doc = getTargetDocument(token);
  const gridSize = Number(globalThis.canvas?.grid?.size ?? 100) || 100;
  const width = Number(token?.w ?? (Number(doc?.width ?? 1) * gridSize));
  const height = Number(token?.h ?? (Number(doc?.height ?? 1) * gridSize));
  return {
    x: Number(token?.x ?? doc?.x ?? 0) + width / 2,
    y: Number(token?.y ?? doc?.y ?? 0) + height / 2,
  };
}

function getTokenDistanceInCells(a, b) {
  if (!a || !b) return Infinity;
  const gridSize = Number(globalThis.canvas?.grid?.size ?? 100) || 100;
  const ca = getTokenCenterForSurround(a);
  const cb = getTokenCenterForSurround(b);
  return Math.hypot(ca.x - cb.x, ca.y - cb.y) / gridSize;
}

function resolveAttackSurroundCount({ attacker = null, targetActor = null, targetToken = null } = {}) {
  const targetTokenForScene = targetToken ?? getActorToken(targetActor);
  const tokens = globalThis.canvas?.tokens?.placeables;
  if (!attacker || !targetActor || !targetTokenForScene || !Array.isArray(tokens)) return 0;

  return tokens.filter(token => {
    const actor = token?.actor;
    if (!actor) return false;
    if (actor.id === attacker.id || actor.id === targetActor.id) return false;
    if (!actorsAreAllies(attacker, actor)) return false;
    if (actorsAreAllies(actor, targetActor)) return false;
    return getTokenDistanceInCells(token, targetTokenForScene) <= 1.5;
  }).length;
}

function buildAttackFlowSummary({
  actor = null,
  targetActor = null,
  result = null,
  selectedTargets = [],
  surroundCount = 0,
  preparedBonus = null,
  preReaction = null,
  reaction = null,
  hitEffects = null,
} = {}) {
  return {
    actorId: actor?.id ?? null,
    targetId: targetActor?.id ?? null,
    targetName: targetActor?.name ?? "",
    selectedTargetCount: selectedTargets.length,
    surroundCount,
    hit: Boolean(result?.hit),
    damage: Number(result?.finalDamage ?? 0),
    targetKilled: Boolean(result?.targetKilled),
    interrupted: Boolean(result?.interrupted),
    preparedBonus: Number(preparedBonus?.hitBonus ?? 0),
    preReactionInterrupted: Boolean(preReaction?.interrupted),
    reactionTriggered: Boolean(reaction?.triggered || reaction?.html),
    effectApplied: Boolean(hitEffects?.condition || hitEffects?.lines?.length),
  };
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
    notifyWarn(attackBlockState.reason || "Персонаж не может атаковать из-за состояния.");
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
    notifyWarn(blockReason);
    return attackResult({ ok: false, reason: "blocked" });
  }

  const selectedTargets = resolveActorAttackTargets(actor, {
    targets,
    autoTargetHostile,
  });
  if (!selectedTargets.length) {
    notifyWarn("Выберите цель");
    return attackResult({ ok: false, reason: "missing-target" });
  }

  const targetToken = selectedTargets[0];
  const targetActor = getCombatTargetActor(targetToken);
  if (!targetActor) {
    notifyWarn("У цели нет актёра");
    return attackResult({ ok: false, reason: "missing-target-actor" });
  }

  const skill = actor.system.skills?.[skillKey];
  const fallbackSkillValue = Number(skillValueFallback ?? 0);
  if (!skill && !(fallbackSkillValue > 0)) {
    notifyWarn(`У персонажа нет навыка ${skillKey}`);
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
      notifyWarn(`Цель вне досягаемости: расстояние ${Math.ceil(dist)} клеток, дальность оружия ${range}`);
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

    if (timeState?.queued) return attackResult({ queued: true, result: timeState, reason: "queued" });
    if (!timeState?.ok) return attackResult({ ok: false, reason: timeState?.reason || "time-cost", result: timeState });
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
    const interrupted = {
      interrupted: true,
      reaction: preReaction,
    };
    const summary = buildAttackFlowSummary({
      actor,
      targetActor,
      result: interrupted,
      selectedTargets,
      preReaction,
    });
    await afterAttack?.({ actor, targetActor, result: null, interrupted: true, reaction: preReaction, summary });
    return attackResult({
      result: interrupted,
      summary,
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

  const surroundCount = resolveAttackSurroundCount({
    attacker: actor,
    targetActor,
    targetToken: targetTokenForRange,
  });
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
  if (selectedTargets.length > 1) {
    extraRows.push(["Цели", `выбрано ${selectedTargets.length}, атакована ${targetActor.name}`]);
  }
  if (surroundCount > 0) {
    extraRows.push(["Окружение", `+${surroundCount} союзн. у цели`]);
  }

  const hitEffects = await applyHitEffects({
    attacker: actor,
    target: targetActor,
    result,
    effect: buildHitEffect(technique?.effect, {
      applyCondition,
      conditionDuration,
      conditionChance,
      notes: effectNotes,
    }),
  });
  await playAttackVfx({
    attacker: actor,
    target: targetActor,
    targetToken: targetTokenForRange,
    result,
    label,
    source: "attack-flow",
  });
  const extraHtml = joinCombatHtml(
    buildCombatRows(extraRows, { className: "ih-attack-extra-rows" }),
    hitEffects.html,
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

  await createCombatChatMessage({
    actor,
    content: joinCombatHtml(preReactionHtml, content, extraHtml, reaction.html),
  });

  await applySkillExp?.(skillKey, label);
  const summary = buildAttackFlowSummary({
    actor,
    targetActor,
    result,
    selectedTargets,
    surroundCount,
    preparedBonus,
    preReaction,
    reaction,
    hitEffects,
  });
  await afterAttack?.({ actor, targetActor, result, preReaction, reaction, preparedBonus, hitEffects, summary });

  return attackResult({ result, summary });
}
