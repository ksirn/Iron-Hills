import {
  getActionBlockReason,
  getActorInjuryInfo,
  getDerivedConditionState,
  getEncumbranceInfo,
  grantSkillExp,
} from "./actor-state-service.mjs";
import { applyAoeDamageTemplate } from "./aoe-service.mjs";
import { normalizeAttackMode } from "./combat-attack-mode-service.mjs";
import {
  buildCombatActionTargetPayload,
  getPrimaryCombatTargetActor,
  resolveCombatActionTargets,
} from "./combat-action-target-service.mjs";
import { createCombatChatMessage } from "./combat-chat-service.mjs";
import { getCombatActionSeconds } from "./combat-time-service.mjs";
import { markActorDead } from "./condition-service.mjs";
import {
  applyTechniqueSupportEffect,
  getTechniqueSupportEnergyCost,
  validateTechniqueSupportEffect,
} from "./combat-technique-service.mjs";
import { castSpellLikeItem } from "./spell-casting-service.mjs";
import {
  buildSpellItemSystemData,
  buildSpellRuntimeData,
} from "./spell-runtime-service.mjs";

function actionResult({
  ok = true,
  queued = false,
  result = null,
  summary = null,
  reason = "",
} = {}) {
  return { ok, queued, result, summary, reason };
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
  const runtimeSystem = buildSpellItemSystemData(spell);
  const system = {
    ...runtimeSystem,
    spellId: spell.id ?? spell.spellId ?? "",
    actionSeconds: numberOr(spell.actionSeconds ?? spell.castTime ?? spell.system?.actionSeconds ?? spell.system?.castTime, runtimeSystem.actionSeconds),
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
  const runtime = buildSpellRuntimeData(item);
  const selectedTargets = resolveCombatActionTargets({ targets });
  if (runtime.defaultTargetSelf && !runtime.hasAoe && !selectedTargets.length) {
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
        ...buildCombatActionTargetPayload({ targets: selectedTargets }),
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

export async function castSpellChoiceAction({
  actor = null,
  choice = null,
  targets = globalThis.game?.user?.targets ?? [],
  skipTimeCost = false,
  resolveCombatTimeCost = null,
  requestHostileAction = null,
  applySkillExp = null,
  onLethal = null,
  afterCast = null,
} = {}) {
  if (!actor || !choice) return actionResult({ ok: false, reason: "missing-spell-choice" });

  const selectedTargets = resolveCombatActionTargets({ targets });
  if (choice.itemId) {
    const item = actor.items?.get(choice.itemId) ?? null;
    if (!item) {
      ui.notifications.warn("Заклинание или свиток не найден в инвентаре.");
      return actionResult({ ok: false, reason: "missing-item" });
    }

    return castSpellLikeItem({
      actor,
      item,
      isScroll: Boolean(choice.isScroll ?? item.type === "scroll"),
      targets: selectedTargets,
      skipTimeCost,
      resolveCombatTimeCost,
      requestHostileAction,
      applySkillExp: applySkillExp ?? ((skillKey, label) => grantSkillExp(actor, skillKey, label, 1)),
      onLethal: onLethal ?? (target => markActorDead(target)),
      afterCast,
      spellOverrides: choice.spellOverrides ?? null,
    });
  }

  const spell = choice.spell ?? choice;
  return castCatalogSpellAction({
    actor,
    spell,
    targets: selectedTargets,
    skipTimeCost,
    resolveCombatTimeCost,
    requestHostileAction,
    applySkillExp,
    onLethal,
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
  attackMode: attackModeInput = null,
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
  onLethal = null,
  afterAction = null,
} = {}) {
  if (!actor) return actionResult({ ok: false, reason: "missing-actor" });
  const attackMode = normalizeAttackMode(attackModeInput, { skillKey, technique: { effect } });

  const blockReason = getActionBlockReason(actor, "attack", {
    skillKey,
    attackMode,
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
        attackMode,
        label,
        damageType,
        ignoreArmor,
        hitBonus,
        skillValueFallback,
        effect: cloneData(effect),
        color,
        actionSeconds: secondsCost,
        ...buildCombatActionTargetPayload({
          fallbackTargets: [],
          targetZone,
          targetZoneMode,
          friendlyFire,
          friendlyFireMode,
        }),
      },
    });

    if (timeState?.queued) return actionResult({ queued: true, result: timeState });
    if (!timeState?.ok) return actionResult({ ok: false, reason: "time-cost", result: timeState });
  }

  const encumbrance = getEncumbranceInfo(actor);
  const injuries = getActorInjuryInfo(actor);
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
    attackMode,
    hitBonus,
    skillValueFallback,
    injuries,
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
    onLethal: onLethal ?? (target => markActorDead(target)),
    onTemplatePlaced: async () => actor.update({
      "system.resources.energy.value": Math.max(0, currentEnergy - finalEnergyCost),
    }),
  });

  if (!result?.ok) return actionResult({ ok: false, reason: "aoe-cancelled", result });
  await afterAction?.({ actor, result });
  return actionResult({ result, summary: result.summary ?? null });
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

  const validation = validateTechniqueSupportEffect({ actor, technique, weapon });
  if (!validation.ok) {
    ui.notifications.warn(validation.message ?? "РџСЂРёС‘Рј РЅРµР»СЊР·СЏ РїРѕРґРіРѕС‚РѕРІРёС‚СЊ.");
    return actionResult({ ok: false, reason: validation.reason ?? "invalid-technique-support" });
  }

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

  const result = await applyTechniqueSupportEffect({ actor, technique, weapon });
  if (!result.ok) {
    ui.notifications.warn(result.lines?.[0] ?? "РџСЂРёС‘Рј РЅРµР»СЊР·СЏ РїРѕРґРіРѕС‚РѕРІРёС‚СЊ.");
    return actionResult({ ok: false, reason: result.reason ?? "support-effect-failed", result });
  }

  if (energyCost > 0) {
    await actor.update({
      "system.resources.energy.value": Math.max(0, currentEnergy - energyCost),
    });
  }
  await createCombatChatMessage({
    actor,
    title: label,
    icon: technique?.icon ?? "⚔",
    rows: [
      ["Актёр", actor.name],
      ["Энергия", `-${energyCost}`, energyCost > 0],
    ],
    bodyHtml: result.lines?.length
      ? result.lines.map(line => `<p>${line}</p>`).join("")
      : "<p>Эффект подготовлен.</p>",
    className: "ih-combat-support-action",
  });

  await afterAction?.({ actor, result });
  return actionResult({ result });
}
