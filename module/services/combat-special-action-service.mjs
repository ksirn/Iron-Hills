import {
  getActionBlockReason,
  getDerivedConditionState,
  getEncumbranceInfo,
  grantSkillExp,
} from "./actor-state-service.mjs";
import { applyAoeDamageTemplate } from "./aoe-service.mjs";
import {
  buildCombatTargetPayload,
  getPrimaryCombatTargetActor,
  resolveCombatActionTargets,
} from "./combat-action-target-service.mjs";
import { getCombatActionSeconds } from "./combat-time-service.mjs";
import { markActorDead } from "./condition-service.mjs";
import {
  applyTechniqueSupportEffect,
  getTechniqueSupportEnergyCost,
} from "./combat-technique-service.mjs";
import { castSpellLikeItem } from "./spell-casting-service.mjs";

function actionResult({
  ok = true,
  queued = false,
  result = null,
  reason = "",
} = {}) {
  return { ok, queued, result, reason };
}

function cloneData(value) {
  return foundry.utils.deepClone(value ?? {});
}

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getVirtualAttackItem({ skillKey = "", actionSeconds = null } = {}) {
  return {
    type: "weapon",
    system: {
      skill: skillKey,
      actionSeconds,
    },
  };
}

export function buildCatalogSpellItem(spell = {}) {
  const system = {
    ...cloneData(spell),
    spellId: spell.id ?? spell.spellId ?? "",
    actionSeconds: numberOr(spell.actionSeconds ?? spell.castTime, 0),
  };

  return {
    id: `catalog:${system.spellId || system.label || "spell"}`,
    name: spell.label ?? spell.name ?? "Заклинание",
    type: "spell",
    system,
  };
}

export function serializeCatalogSpell(spell = {}) {
  const copy = cloneData(spell);
  delete copy._id;
  delete copy.folder;
  delete copy.sort;
  delete copy.ownership;
  delete copy._stats;
  return copy;
}

export async function castCatalogSpellAction({
  actor = null,
  spell = null,
  targets = globalThis.game?.user?.targets ?? [],
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  requestHostileAction = null,
  applySkillExp = null,
  onLethal = null,
  afterCast = null,
} = {}) {
  if (!actor || !spell) return actionResult({ ok: false, reason: "missing-spell" });

  const item = buildCatalogSpellItem(spell);
  const spellDamage = numberOr(item.system?.damage, 0);
  const isUtilitySpell = spellDamage <= 0;
  const selectedTargets = resolveCombatActionTargets({ targets });
  if (isUtilitySpell && !item.system?.aoe && !selectedTargets.length) {
    selectedTargets.push({ actor });
  }

  const blockReason = getActionBlockReason(actor, "spell", { item });
  if (blockReason) {
    ui.notifications.warn(blockReason);
    return actionResult({ ok: false, reason: "blocked" });
  }

  if (!item.system?.aoe && !getPrimaryCombatTargetActor(selectedTargets)) {
    ui.notifications.warn("Выберите цель");
    return actionResult({ ok: false, reason: "missing-target" });
  }

  const derivedConditions = getDerivedConditionState(actor);
  if (!derivedConditions.canCast) {
    ui.notifications.warn(derivedConditions.castBlockReason || "Персонаж не может колдовать из-за состояния.");
    return actionResult({ ok: false, reason: "cannot-cast" });
  }

  if (!skipTimeCost && resolveCombatTimeCost) {
    const timeState = await resolveCombatTimeCost({
      actionType: "catalog-spell",
      label: `Заклинание: ${item.name}`,
      item,
      totalSeconds: numberOr(item.system.actionSeconds, getCombatActionSeconds("spell", item)),
      payload: {
        spell: serializeCatalogSpell(spell),
        ...buildCombatTargetPayload(selectedTargets),
      },
    });

    if (timeState?.queued) return actionResult({ queued: true, result: timeState });
    if (!timeState?.ok) return actionResult({ ok: false, reason: "time-cost", result: timeState });
  }

  return castSpellLikeItem({
    actor,
    item,
    skipTimeCost: true,
    targets: selectedTargets,
    requestHostileAction,
    applySkillExp: applySkillExp ?? ((skillKey, label) => grantSkillExp(actor, skillKey, label, 1)),
    onLethal: onLethal ?? (target => markActorDead(target)),
    afterCast,
  });
}

export async function performCombatAoeAttack({
  actor = null,
  shape = "circle",
  distance = 1,
  targetMode = "blast",
  maxTargets = null,
  chainDecay = 1,
  baseDamage = 0,
  energyCost = 0,
  skillKey = "unarmed",
  label = "AoE атака",
  damageType = "physical",
  ignoreArmor = 0,
  hitBonus = 0,
  skillValueFallback = null,
  targetZone = null,
  targetZoneMode = null,
  effect = null,
  friendlyFire = false,
  friendlyFireMode = null,
  color = "#ff4444",
  actionSeconds = null,
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  afterAction = null,
} = {}) {
  if (!actor) return actionResult({ ok: false, reason: "missing-actor" });

  const blockReason = getActionBlockReason(actor, "attack", {
    energyCost,
  });
  if (blockReason) {
    ui.notifications.warn(blockReason);
    return actionResult({ ok: false, reason: "blocked" });
  }

  const actionItem = getVirtualAttackItem({ skillKey, actionSeconds });
  const secondsCost = numberOr(actionSeconds, getCombatActionSeconds("attack", actionItem));

  if (!skipTimeCost && resolveCombatTimeCost) {
    const timeState = await resolveCombatTimeCost({
      actionType: "aoe-attack",
      label,
      item: actionItem,
      totalSeconds: secondsCost,
      payload: {
        shape,
        distance,
        targetMode,
        maxTargets,
        chainDecay,
        baseDamage,
        energyCost,
        skillKey,
        label,
        damageType,
        ignoreArmor,
        hitBonus,
        skillValueFallback,
        targetZone,
        targetZoneMode,
        effect: cloneData(effect),
        friendlyFire,
        friendlyFireMode,
        color,
        actionSeconds: secondsCost,
      },
    });

    if (timeState?.queued) return actionResult({ queued: true, result: timeState });
    if (!timeState?.ok) return actionResult({ ok: false, reason: "time-cost", result: timeState });
  }

  const encumbrance = getEncumbranceInfo(actor);
  const finalEnergyCost = Math.ceil(Math.max(0, numberOr(energyCost, 0)) * numberOr(encumbrance.energyMultiplier, 1));
  const currentEnergy = numberOr(actor.system?.resources?.energy?.value, 0);
  if (currentEnergy < finalEnergyCost) {
    ui.notifications.warn(`Недостаточно энергии (${currentEnergy}/${finalEnergyCost})`);
    return actionResult({ ok: false, reason: "energy" });
  }

  ui.notifications.info(`${actor.name}: ${label} — укажи зону на сцене`);
  const result = await applyAoeDamageTemplate({
    shape,
    distance,
    label,
    color,
    attacker: actor,
    skillKey,
    hitBonus,
    skillValueFallback,
    friendlyFire,
    friendlyFireMode,
    baseDamage,
    damageType,
    ignoreArmor,
    aoeType: targetMode,
    maxTargets,
    chainDecay,
    targetZone,
    targetZoneMode,
    effect,
    onTemplatePlaced: async () => actor.update({
      "system.resources.energy.value": Math.max(0, currentEnergy - finalEnergyCost),
    }),
  });

  if (!result?.ok) return actionResult({ ok: false, reason: "aoe-cancelled", result });
  await afterAction?.({ actor, result });
  return actionResult({ result });
}

export async function performTechniqueSupportCombatAction({
  actor = null,
  technique = null,
  weapon = null,
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  afterAction = null,
} = {}) {
  if (!actor || !technique) return actionResult({ ok: false, reason: "missing-technique" });

  const energyCost = getTechniqueSupportEnergyCost(technique);
  const currentEnergy = numberOr(actor.system?.resources?.energy?.value, 0);
  if (currentEnergy < energyCost) {
    ui.notifications.warn(`${actor.name}: недостаточно энергии (${currentEnergy}/${energyCost})`);
    return actionResult({ ok: false, reason: "energy" });
  }

  const label = technique.label ?? "Боевой приём";
  const secondsCost = getCombatActionSeconds("attack", weapon ?? getVirtualAttackItem({ skillKey: technique.skill }));

  if (!skipTimeCost && resolveCombatTimeCost) {
    const timeState = await resolveCombatTimeCost({
      actionType: "technique-support",
      label,
      item: weapon,
      totalSeconds: secondsCost,
      payload: {
        technique: cloneData(technique),
        weaponId: weapon?.id ?? "",
      },
    });

    if (timeState?.queued) return actionResult({ queued: true, result: timeState });
    if (!timeState?.ok) return actionResult({ ok: false, reason: "time-cost", result: timeState });
  }

  if (energyCost > 0) {
    await actor.update({
      "system.resources.energy.value": Math.max(0, currentEnergy - energyCost),
    });
  }

  const result = await applyTechniqueSupportEffect({ actor, technique });
  const lines = result.lines?.length ? result.lines.join("<br>") : "Эффект подготовлен.";
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div style="padding:6px"><b>${actor.name}</b>: ${technique?.icon ?? "⚔"} <b>${label}</b><br>${lines}</div>`,
  });

  await afterAction?.({ actor, result });
  return actionResult({ result });
}
