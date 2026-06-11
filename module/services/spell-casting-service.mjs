import {
  getActionBlockReason,
  getActorInjuryInfo,
  getDerivedConditionState,
  getSpellSchoolLabel,
  resolveSpellSchoolSkill,
} from "./actor-state-service.mjs";
import { isCombatActive } from "./combat-flow-service.mjs";
import {
  buildCombatRows,
  createCombatChatMessage,
  joinCombatHtml,
} from "./combat-chat-service.mjs";
import {
  recalculateActorWeight,
  removeQuantityFromItem,
} from "./inventory-service.mjs";
import {
  applyAoeSpellEffect,
  applySingleTargetSpellDamage,
  applySingleTargetSpellUtilityEffect,
} from "./spell-effect-service.mjs";
import {
  buildCombatActionTargetPayload,
  getPrimaryCombatTargetActor,
  resolveCombatActionTargets,
} from "./combat-action-target-service.mjs";
import {
  buildSpellChoicePayload,
  buildSpellRuntimeData,
} from "./spell-runtime-service.mjs";

function spellCastResult({
  ok = true,
  queued = false,
  consumedScroll = false,
  reason = "",
  result = null,
  summary = null,
} = {}) {
  return { ok, queued, consumedScroll, reason, result, summary };
}

function clonePlain(value) {
  if (value === undefined) return undefined;
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getItemSystemData(item) {
  if (typeof item?.toObject === "function") return item.toObject()?.system ?? {};
  return item?.system ?? {};
}

function buildSpellCastItem(item, spellOverrides = null) {
  if (!isPlainObject(spellOverrides)) return item;
  const system = buildSpellChoicePayload(clonePlain(getItemSystemData(item)), spellOverrides);
  return {
    id: item.id,
    uuid: item.uuid,
    name: item.name,
    type: item.type,
    img: item.img,
    system,
  };
}

function serializeSpellOverrides(overrides = null) {
  if (!isPlainObject(overrides)) return null;
  const output = {};
  if (overrides.targetZone !== undefined) output.targetZone = overrides.targetZone;
  if (overrides.targetZoneMode !== undefined) output.targetZoneMode = overrides.targetZoneMode;
  if (overrides.friendlyFire !== undefined) output.friendlyFire = Boolean(overrides.friendlyFire);
  if (overrides.friendlyFireMode !== undefined) output.friendlyFireMode = overrides.friendlyFireMode;
  return Object.keys(output).length ? output : null;
}

export async function spendSpellLikeResources(actor, {
  currentMana = 0,
  currentEnergy = 0,
  manaCost = 0,
  energyCost = 0,
} = {}) {
  await actor.update({
    "system.resources.mana.value": Math.max(0, Number(currentMana ?? 0) - Number(manaCost ?? 0)),
    "system.resources.energy.value": Math.max(0, Number(currentEnergy ?? 0) - Number(energyCost ?? 0)),
  });
}

async function completeSpellLikeCast({
  actor,
  item,
  school,
  isScroll = false,
  applySkillExp = null,
  afterCast = null,
} = {}) {
  await applySkillExp?.(school, item?.name ?? "");

  if (isScroll && item) {
    await removeQuantityFromItem(actor, item, 1);
    await recalculateActorWeight(actor);
  }

  await afterCast?.({ actor, item, school, isScroll });
}

export async function castSpellLikeItem({
  actor,
  item,
  isScroll = false,
  skipTimeCost = false,
  targets = globalThis.game?.user?.targets ?? [],
  resolveCombatTimeCost = null,
  requestHostileAction = null,
  applySkillExp = null,
  onLethal = null,
  afterCast = null,
  spellOverrides = null,
} = {}) {
  if (!item) {
    ui.notifications.warn("Заклинание не найдено");
    return spellCastResult({ ok: false, reason: "missing-item" });
  }

  const castItem = buildSpellCastItem(item, spellOverrides);
  const spellLabel = `${isScroll ? "Свиток" : "Заклинание"}: ${castItem.name}`;
  const selectedTargets = resolveCombatActionTargets({ targets });
  const school = castItem.system?.school;
  const schoolSkillRef = resolveSpellSchoolSkill(actor, school);
  const schoolSkill = schoolSkillRef.skill;
  const skillKey = schoolSkillRef.key || school;
  if (!schoolSkill) {
    ui.notifications.warn(`У персонажа нет школы магии ${schoolSkillRef.label || school}`);
    return spellCastResult({ ok: false, reason: "missing-school" });
  }

  const manaCost = isScroll ? 0 : Number(castItem.system?.manaCost ?? 0);
  const energyCost = Number(castItem.system?.energyCost ?? 0);
  const currentMana = Number(actor.system?.resources?.mana?.value ?? 0);
  const currentEnergy = Number(actor.system?.resources?.energy?.value ?? 0);
  const blockReason = getActionBlockReason(actor, isScroll ? "scroll" : "spell", { item: castItem });
  if (blockReason) {
    ui.notifications.warn(blockReason);
    return spellCastResult({ ok: false, reason: "blocked" });
  }

  const spellData = buildSpellRuntimeData(castItem);
  const {
    aoe: spellAoe,
    effect: spellEffect,
    effectType,
    combatDamageType: damageType,
    targetPart,
    attackTargetZone,
    power,
  } = spellData;

  const isOffensiveSpell = spellData.isHostile;
  if (isOffensiveSpell && !isCombatActive() && !globalThis.game?.user?.isGM) {
    const allowed = await requestHostileAction?.(spellLabel);
    if (!allowed) return spellCastResult({ ok: false, reason: "hostile-action-denied" });
  }

  const targetActor = getPrimaryCombatTargetActor(selectedTargets)
    ?? (spellData.defaultTargetSelf ? actor : null);
  if (!spellAoe && !targetActor) {
    ui.notifications.warn("Выберите цель");
    return spellCastResult({ ok: false, reason: "missing-target" });
  }

  const dieSize = Math.max(2, schoolSkill.value * 2);
  const injuries = getActorInjuryInfo(actor);
  const castPenalty = Number(injuries.castPenalty ?? 0);
  const derivedConditions = getDerivedConditionState(actor);
  if (!derivedConditions.canCast) {
    ui.notifications.warn(derivedConditions.castBlockReason || "Персонаж не может колдовать из-за состояния.");
    return spellCastResult({ ok: false, reason: "cannot-cast" });
  }

  if (!skipTimeCost && resolveCombatTimeCost) {
    const serializedOverrides = serializeSpellOverrides(spellOverrides);
    const timeState = await resolveCombatTimeCost({
      actionType: isScroll ? "scroll" : "cast-spell",
      label: spellLabel,
      item: castItem,
      payload: {
        itemId: item.id,
        isScroll,
        ...buildCombatActionTargetPayload({
          targets: selectedTargets,
          spellOverrides: serializedOverrides,
        }),
      },
    });

    if (timeState?.queued) return spellCastResult({ ok: true, queued: true });
    if (!timeState?.ok) return spellCastResult({ ok: false, reason: "time-cost" });
  }

  const resourceState = { currentMana, currentEnergy, manaCost, energyCost };

  if (spellAoe) {
    const aoeSpell = await applyAoeSpellEffect({
      caster: actor,
      aoe: spellAoe,
      label: castItem.name,
      color: "#8888ff",
      skillKey,
      hitBonus: 0,
      injuries: {
        ...injuries,
        attackPenalty: castPenalty,
        meleePenalty: castPenalty,
      },
      friendlyFire: spellData.friendlyFire,
      friendlyFireMode: spellData.friendlyFireMode,
      baseDamage: spellData.isDamage ? power : 0,
      damageType,
      effect: spellEffect,
      power: spellData.utilityPower,
      targetZone: spellData.isDamage ? attackTargetZone : targetPart,
      targetZoneMode: spellData.targetZoneMode,
      onLethal,
      onTemplatePlaced: async () => spendSpellLikeResources(actor, resourceState),
    });
    if (!aoeSpell.ok) return spellCastResult({ ok: false, reason: "aoe-cancelled", result: aoeSpell });

    await completeSpellLikeCast({ actor, item: castItem, school: skillKey, isScroll, applySkillExp, afterCast });
    return spellCastResult({
      consumedScroll: Boolean(isScroll),
      result: aoeSpell,
      summary: aoeSpell.summary ?? null,
    });
  }

  if (spellData.isDamage) {
    await spendSpellLikeResources(actor, resourceState);

    const spellAttack = await applySingleTargetSpellDamage({
      caster: actor,
      target: targetActor,
      skillKey,
      baseDamage: power,
      damageType,
      label: spellLabel,
      effect: spellEffect,
      targetZone: attackTargetZone,
      injuries: {
        ...injuries,
        attackPenalty: castPenalty,
        meleePenalty: castPenalty,
      },
      onLethal,
    });
    if (!spellAttack.ok) return spellCastResult({ ok: false, reason: "attack-cancelled", result: spellAttack });

    const costHtml = buildCombatRows([
      ["Мана", `-${manaCost}`],
      ["Энергия", `-${energyCost}`],
    ]);

    await createCombatChatMessage({
      actor,
      content: joinCombatHtml(spellAttack.html, costHtml),
    });

    await completeSpellLikeCast({ actor, item: castItem, school: skillKey, isScroll, applySkillExp, afterCast });
    return spellCastResult({ consumedScroll: Boolean(isScroll), result: spellAttack });
  }

  const rollFormula = castPenalty > 0 ? `1d${dieSize} - ${castPenalty}` : `1d${dieSize}`;
  const roll = await new Roll(rollFormula).evaluate();

  await spendSpellLikeResources(actor, resourceState);

  const utilityEffect = await applySingleTargetSpellUtilityEffect({
    caster: actor,
    target: targetActor,
    item: castItem,
    effectType,
    effect: spellEffect,
    power,
    roll,
    targetPart,
    schoolSkill,
    markActorDead: onLethal ? (target => onLethal(target)) : null,
  });
  const fallbackHtml = utilityEffect.handled
    ? ""
    : buildCombatRows([["Эффект", "Не настроен: " + (effectType || spellEffect?.special || "unknown")]]);

  await createCombatChatMessage({
    actor,
    title: spellLabel,
    rows: [
      ["Источник", actor.name],
      ["Цель", targetActor.name],
      ["Школа", getSpellSchoolLabel(school)],
      ["Куб", `d${dieSize}`],
      ["Штраф от ранений", castPenalty > 0 ? `-${castPenalty}` : "0"],
      ["Кровопотеря", Number(derivedConditions.bleeding ?? 0)],
      ["Шок", Number(derivedConditions.shock ?? 0)],
      ["Бросок", `${roll.total}`],
      ["Мана", `-${manaCost}`],
      ["Энергия", `-${energyCost}`],
    ],
    bodyHtml: joinCombatHtml(utilityEffect.html, fallbackHtml),
    className: "ih-spell-utility-card",
  });

  await completeSpellLikeCast({ actor, item: castItem, school: skillKey, isScroll, applySkillExp, afterCast });
  return spellCastResult({ consumedScroll: Boolean(isScroll), result: utilityEffect });
}
