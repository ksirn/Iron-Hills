import { SPELLS } from "../constants/spells-catalog.mjs";
import { buildChatSectionRow } from "../utils/text-utils.mjs";
import {
  getActionBlockReason,
  getActorInjuryInfo,
  getDerivedConditionState,
  getSpellSchoolLabel,
} from "./actor-state-service.mjs";
import { isCombatActive } from "./combat-flow-service.mjs";
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
  buildCombatTargetPayload,
  getPrimaryCombatTargetActor,
  resolveCombatActionTargets,
} from "./combat-action-target-service.mjs";
import {
  resolveAoeFriendlyFireMode,
  resolveAoeTargetZone,
} from "./aoe-policy-service.mjs";

function spellCastResult({
  ok = true,
  queued = false,
  consumedScroll = false,
  reason = "",
  result = null,
} = {}) {
  return { ok, queued, consumedScroll, reason, result };
}

function getSpellData(item) {
  const catalogSpell = SPELLS[String(item?.system?.spellId ?? "")] ?? null;
  const itemAoe = item?.system?.aoe && Number(item.system.aoe.distance ?? 0) > 0
    ? item.system.aoe
    : null;
  const catalogAoe = catalogSpell?.aoe && Number(catalogSpell.aoe.distance ?? 0) > 0
    ? catalogSpell.aoe
    : null;
  const itemEffect = item?.system?.effect && typeof item.system.effect === "object"
    ? item.system.effect
    : null;
  const itemDamage = Number(item?.system?.damage ?? 0);
  const catalogDamage = Number(catalogSpell?.damage ?? 0);
  const spellDamage = itemDamage > 0 ? itemDamage : catalogDamage;
  const spellEffect = itemEffect ?? catalogSpell?.effect ?? null;
  const effectType = item?.system?.effectType
    || (spellDamage > 0 ? "damage" : (spellEffect?.special === "heal" ? "heal" : ""));
  const rawDamageType = item?.system?.damageType ?? catalogSpell?.damageType ?? "magical";
  const explicitTargetPart = resolveAoeTargetZone(
    item?.system?.targetZone,
    item?.system?.targetPart,
    catalogSpell?.targetZone,
    catalogSpell?.targetPart,
    spellEffect?.targetZone,
    spellEffect?.targetPart,
  );

  return {
    catalogSpell,
    spellAoe: itemAoe ?? catalogAoe,
    spellEffect,
    spellDamage,
    spellFriendlyFire: resolveAoeFriendlyFireMode(
      itemAoe?.friendlyFireMode,
      itemAoe?.friendlyFire,
      catalogAoe?.friendlyFireMode,
      catalogSpell?.friendlyFireMode,
      catalogAoe?.friendlyFire,
      catalogSpell?.friendlyFire,
      item?.system?.friendlyFireMode,
      item?.system?.friendlyFire,
      false,
    ),
    effectType,
    damageType: String(rawDamageType).toLowerCase() === "physical" ? "physical" : "magical",
    targetPart: explicitTargetPart ?? "torso",
    attackTargetZone: explicitTargetPart,
    power: Number(item?.system?.power ?? 0) > 0 ? Number(item.system.power) : spellDamage,
  };
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
} = {}) {
  if (!item) {
    ui.notifications.warn("Заклинание не найдено");
    return spellCastResult({ ok: false, reason: "missing-item" });
  }

  const spellLabel = `${isScroll ? "Свиток" : "Заклинание"}: ${item.name}`;
  const selectedTargets = resolveCombatActionTargets({ targets });
  const school = item.system?.school;
  const schoolSkill = actor?.system?.skills?.[school];
  if (!schoolSkill) {
    ui.notifications.warn(`У персонажа нет школы магии ${school}`);
    return spellCastResult({ ok: false, reason: "missing-school" });
  }

  const manaCost = isScroll ? 0 : Number(item.system?.manaCost ?? 0);
  const energyCost = Number(item.system?.energyCost ?? 0);
  const currentMana = Number(actor.system?.resources?.mana?.value ?? 0);
  const currentEnergy = Number(actor.system?.resources?.energy?.value ?? 0);
  const blockReason = getActionBlockReason(actor, isScroll ? "scroll" : "spell", { item });
  if (blockReason) {
    ui.notifications.warn(blockReason);
    return spellCastResult({ ok: false, reason: "blocked" });
  }

  const {
    spellAoe,
    spellEffect,
    spellDamage,
    spellFriendlyFire,
    effectType,
    damageType,
    targetPart,
    attackTargetZone,
    power,
  } = getSpellData(item);

  const isOffensiveSpell = effectType === "damage";
  if (isOffensiveSpell && !isCombatActive() && !globalThis.game?.user?.isGM) {
    const allowed = await requestHostileAction?.(spellLabel);
    if (!allowed) return spellCastResult({ ok: false, reason: "hostile-action-denied" });
  }

  const targetActor = getPrimaryCombatTargetActor(selectedTargets);
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
    const timeState = await resolveCombatTimeCost({
      actionType: isScroll ? "scroll" : "cast-spell",
      label: spellLabel,
      item,
      payload: {
        itemId: item.id,
        isScroll,
        ...buildCombatTargetPayload(selectedTargets),
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
      label: item.name,
      color: "#8888ff",
      skillKey: school,
      hitBonus: 0,
      injuries: {
        ...injuries,
        attackPenalty: castPenalty,
        meleePenalty: castPenalty,
      },
      friendlyFire: spellFriendlyFire,
      baseDamage: effectType === "damage" ? power : 0,
      damageType,
      effect: spellEffect,
      power: spellEffect?.healAmount ?? power,
      targetZone: effectType === "damage" ? attackTargetZone : targetPart,
      onTemplatePlaced: async () => spendSpellLikeResources(actor, resourceState),
    });
    if (!aoeSpell.ok) return spellCastResult({ ok: false, reason: "aoe-cancelled", result: aoeSpell });

    await completeSpellLikeCast({ actor, item, school, isScroll, applySkillExp, afterCast });
    return spellCastResult({ consumedScroll: Boolean(isScroll), result: aoeSpell });
  }

  if (effectType === "damage") {
    await spendSpellLikeResources(actor, resourceState);

    const spellAttack = await applySingleTargetSpellDamage({
      caster: actor,
      target: targetActor,
      skillKey: school,
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

    const costHtml = `
      ${buildChatSectionRow("Мана", `-${manaCost}`)}
      ${buildChatSectionRow("Энергия", `-${energyCost}`)}
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: spellAttack.html + costHtml,
    });

    await completeSpellLikeCast({ actor, item, school, isScroll, applySkillExp, afterCast });
    return spellCastResult({ consumedScroll: Boolean(isScroll), result: spellAttack });
  }

  const rollFormula = castPenalty > 0 ? `1d${dieSize} - ${castPenalty}` : `1d${dieSize}`;
  const roll = await new Roll(rollFormula).evaluate();

  await spendSpellLikeResources(actor, resourceState);

  let content = `
    <h3>${spellLabel}</h3>
    ${buildChatSectionRow("Источник", actor.name)}
    ${buildChatSectionRow("Цель", targetActor.name)}
    ${buildChatSectionRow("Школа", getSpellSchoolLabel(school))}
    ${buildChatSectionRow("Куб", `d${dieSize}`)}
    ${buildChatSectionRow("Штраф от ранений", castPenalty > 0 ? `-${castPenalty}` : "0")}
    ${buildChatSectionRow("Кровопотеря", Number(derivedConditions.bleeding ?? 0))}
    ${buildChatSectionRow("Шок", Number(derivedConditions.shock ?? 0))}
    ${buildChatSectionRow("Бросок", `${roll.total}`)}
    ${buildChatSectionRow("Мана", `-${manaCost}`)}
    ${buildChatSectionRow("Энергия", `-${energyCost}`)}
  `;

  const utilityEffect = await applySingleTargetSpellUtilityEffect({
    caster: actor,
    target: targetActor,
    item,
    effectType,
    effect: spellEffect,
    power,
    roll,
    targetPart,
    schoolSkill,
    markActorDead: target => onLethal?.(target),
  });
  content += utilityEffect.html;

  if (!utilityEffect.handled) {
    content += buildChatSectionRow("Эффект", "Не настроен: " + (effectType || spellEffect?.special || "unknown"));
  }

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
  });

  await completeSpellLikeCast({ actor, item, school, isScroll, applySkillExp, afterCast });
  return spellCastResult({ consumedScroll: Boolean(isScroll), result: utilityEffect });
}
