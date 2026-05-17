import {
  getActionBlockReason,
  getActorInjuryInfo,
  getDerivedConditionState,
  getEncumbranceInfo,
} from "./actor-state-service.mjs";
import { applyAoeDamageTemplate } from "./aoe-service.mjs";
import {
  formatAttackChatHtml,
  resolveSingleAttack,
} from "./combat-attack-service.mjs";
import { isCombatActive } from "./combat-flow-service.mjs";
import {
  applyHitEffects,
  buildStackHitEffect,
} from "./hit-effect-service.mjs";
import {
  recalculateActorWeight,
  removeQuantityFromItem,
} from "./inventory-service.mjs";
import {
  buildThrowableConditionStacks,
  getThrowableAoeConfig,
  normalizeTargetZone,
} from "./item-effect-service.mjs";

function throwableResult({
  ok = true,
  queued = false,
  consumedItem = false,
  aoe = false,
  result = null,
  reason = "",
} = {}) {
  return { ok, queued, consumedItem, aoe, result, reason };
}

function getThrowableItem(actor, itemOrId) {
  if (!actor) return null;
  if (typeof itemOrId === "string") return actor.items?.get(itemOrId) ?? null;
  return itemOrId ?? null;
}

function getSelectedTargets(targets = globalThis.game?.user?.targets ?? []) {
  return targets instanceof Set ? targets : new Set(targets ?? []);
}

async function consumeThrowable(actor, item, applySkillExp = null, afterUse = null) {
  await applySkillExp?.("throwing", item.name);
  await removeQuantityFromItem(actor, item, 1);
  await recalculateActorWeight(actor);
  await afterUse?.({ actor, item });
}

export async function useThrowableItem({
  actor,
  item,
  itemId = item?.id ?? null,
  skipTimeCost = false,
  targets = globalThis.game?.user?.targets ?? [],
  resolveCombatTimeCost = null,
  requestHostileAction = null,
  applySkillExp = null,
  onLethal = null,
  afterUse = null,
} = {}) {
  const throwable = getThrowableItem(actor, item ?? itemId);
  if (!throwable || throwable.type !== "throwable") {
    ui.notifications.warn("Метательный предмет не найден");
    return throwableResult({ ok: false, reason: "missing-item" });
  }

  const label = `Метание: ${throwable.name}`;
  if (!skipTimeCost && resolveCombatTimeCost) {
    const timeState = await resolveCombatTimeCost({
      actionType: "throwable",
      label,
      item: throwable,
      payload: { itemId: throwable.id },
    });

    if (timeState?.queued) return throwableResult({ ok: true, queued: true });
    if (!timeState?.ok) return throwableResult({ ok: false, reason: "time-cost" });
  }

  const blockReason = getActionBlockReason(actor, "throwable", { item: throwable });
  if (blockReason) {
    ui.notifications.warn(blockReason);
    return throwableResult({ ok: false, reason: "blocked" });
  }

  if (!isCombatActive() && !game.user?.isGM) {
    const allowed = await requestHostileAction?.(label);
    if (!allowed) return throwableResult({ ok: false, reason: "hostile-action-denied" });
  }

  const energyCost = Number(throwable.system?.energyCost ?? 8);
  const throwableAoe = getThrowableAoeConfig(throwable);
  const selectedTargets = getSelectedTargets(targets);

  if (!throwableAoe && !selectedTargets.size) {
    ui.notifications.warn("Выберите цель");
    return throwableResult({ ok: false, reason: "missing-target" });
  }

  const targetActor = throwableAoe ? null : [...selectedTargets][0]?.actor;
  if (!throwableAoe && !targetActor) {
    ui.notifications.warn("У цели нет актёра");
    return throwableResult({ ok: false, reason: "missing-target-actor" });
  }

  const skill = actor?.system?.skills?.throwing;
  if (!skill) {
    ui.notifications.warn("У персонажа нет навыка метания");
    return throwableResult({ ok: false, reason: "missing-skill" });
  }

  const injuries = getActorInjuryInfo(actor);
  const throwPenalty = Number(injuries.throwPenalty ?? injuries.attackPenalty ?? 0);
  const derivedConditions = getDerivedConditionState(actor);
  if (!derivedConditions.canThrow) {
    ui.notifications.warn("Персонаж не может метать предметы из-за критических травм.");
    return throwableResult({ ok: false, reason: "cannot-throw" });
  }

  const targetPart = normalizeTargetZone(throwable.system?.targetZone)
    ?? normalizeTargetZone(throwable.system?.targetPart);
  const damageType = String(throwable.system?.damageType ?? "physical").toLowerCase() === "physical"
    ? "physical"
    : "magical";
  const power = Number(throwable.system?.power ?? 0);
  const poison = Number(throwable.system?.appliesPoison ?? 0);
  const burning = Number(throwable.system?.appliesBurning ?? 0);
  const throwableEffect = buildStackHitEffect(buildThrowableConditionStacks(poison, burning));

  if (throwableAoe) {
    ui.notifications.info(`${actor.name}: ${throwable.name} — укажите область броска`);
    const encumbrance = getEncumbranceInfo(actor);
    const finalEnergyCost = Math.ceil(Math.max(0, energyCost) * Number(encumbrance.energyMultiplier ?? 1));
    const currentEnergy = Number(actor.system?.resources?.energy?.value ?? 0);
    const aoeResult = await applyAoeDamageTemplate({
      shape: throwableAoe.shape,
      distance: throwableAoe.distance,
      label,
      color: "#d6a84f",
      attacker: actor,
      skillKey: "throwing",
      hitBonus: -throwPenalty,
      friendlyFire: throwableAoe.friendlyFire,
      baseDamage: power,
      damageType,
      aoeType: throwableAoe.type,
      maxTargets: throwableAoe.maxTargets,
      chainDecay: throwableAoe.chainDecay,
      targetZone: targetPart,
      effect: throwableEffect,
      onTemplatePlaced: async () => actor.update({
        "system.resources.energy.value": Math.max(0, currentEnergy - finalEnergyCost),
      }),
    });
    if (!aoeResult.ok) return throwableResult({ ok: false, aoe: true, result: aoeResult, reason: "aoe-cancelled" });

    await consumeThrowable(actor, throwable, applySkillExp, afterUse);
    return throwableResult({ consumedItem: true, aoe: true, result: aoeResult });
  }

  const attackResult = await resolveSingleAttack({
    attacker: actor,
    target: targetActor,
    skillKey: "throwing",
    baseDamage: power,
    damageType,
    energyCost,
    weapon: throwable,
    targetZone: targetPart,
    spendEnergy: true,
    wearWeapon: false,
    wearArmor: true,
    shieldIntercept: damageType === "physical",
    injuries: {
      ...injuries,
      attackPenalty: throwPenalty,
      meleePenalty: throwPenalty,
    },
    onLethal,
  });
  if (!attackResult) return throwableResult({ ok: false, reason: "attack-cancelled" });

  const hitEffects = await applyHitEffects({
    attacker: actor,
    target: targetActor,
    result: attackResult,
    effect: throwableEffect,
  });

  const attackHtml = await formatAttackChatHtml({
    label,
    skillKey: "throwing",
    attacker: actor,
    target: targetActor,
    result: attackResult,
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: attackHtml + hitEffects.html,
  });

  await consumeThrowable(actor, throwable, applySkillExp, afterUse);
  return throwableResult({ consumedItem: true, result: attackResult });
}
