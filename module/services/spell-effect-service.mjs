import { getTargetPartLabel } from "./actor-state-service.mjs";
import { applyAoeDamageTemplate, applyAoeUtilityTemplate } from "./aoe-service.mjs";
import {
  normalizeAoeConfig,
  resolveAoeFriendlyFireMode,
} from "./aoe-policy-service.mjs";
import { buildCombatRows } from "./combat-chat-service.mjs";
import { formatAttackChatHtml, resolveSingleAttack } from "./combat-attack-service.mjs";
import { isShieldBlockableDamageType, normalizeDamageType } from "./damage-type-service.mjs";
import { addOrExtendActorCondition, isActorSummoned } from "./condition-service.mjs";
import { applyHitEffects, healActorBodyPart } from "./hit-effect-service.mjs";
import { unequipActorSlot } from "./inventory-service.mjs";
import { getActorToken } from "../utils/item-utils.mjs";

const SYSTEM_ID = "iron-hills-system";
const UNDEAD_MARKERS = Object.freeze([
  "undead",
  "skeleton",
  "skeletal",
  "zombie",
  "wraith",
  "ghoul",
  "necrom",
  "нежит",
  "скелет",
  "зомби",
  "призрак",
]);

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function rollTotal(roll) {
  return num(roll?.total, 0);
}

function rollBonus(roll, threshold) {
  return Math.max(0, rollTotal(roll) - threshold);
}

function rowsToHtml(rows) {
  return buildCombatRows(rows);
}

async function restoreResource(actor, resourceKey, amount) {
  const current = num(actor?.system?.resources?.[resourceKey]?.value, 0);
  const max = num(actor?.system?.resources?.[resourceKey]?.max, current);
  const next = Math.min(max, current + Math.max(0, amount));
  await actor.update({ [`system.resources.${resourceKey}.value`]: next });
  return next;
}

function getEffectType(effectType, effect) {
  const explicit = String(effectType ?? "").trim();
  if (explicit) return explicit;
  if (effect?.special === "heal") return "heal";
  if (effect?.special) return String(effect.special).trim();
  return "";
}

function normalizeSpellDamageType(damageType) {
  return normalizeDamageType(damageType, { fallback: "magical" });
}

function hasMarker(value, markers = UNDEAD_MARKERS) {
  const text = String(value ?? "").toLowerCase();
  return Boolean(text && markers.some(marker => text.includes(marker)));
}

function getActorTags(actor) {
  const raw = actor?.system?.info?.tags ?? actor?.system?.tags ?? "";
  if (Array.isArray(raw)) return raw.join(" ");
  return String(raw ?? "");
}

export function isUndeadActor(actor) {
  if (!actor) return false;
  const info = actor.system?.info ?? {};
  return [
    actor.name,
    actor.type,
    info.role,
    info.race,
    info.faction,
    info.bestiaryId,
    info.desc,
    getActorTags(actor),
  ].some(value => hasMarker(value));
}

function getActorTier(actor, fallback = 1) {
  const tier = num(actor?.system?.info?.tier ?? actor?.system?.tier, fallback);
  return Math.max(1, Math.round(tier || fallback));
}

function getSpellDamageMultiplier({ target = null, effect = null } = {}) {
  const special = String(effect?.special ?? "").trim();
  if (special === "double_vs_undead" && isUndeadActor(target)) return 2;
  return 1;
}

function getSummonLabel(effect = null) {
  const summonId = String(effect?.summonId ?? "summon").trim();
  const labels = {
    skeleton: "Призванный скелет",
  };
  return labels[summonId] ?? `Призванное существо (${summonId})`;
}

function buildSummonedActorData({
  caster = null,
  effect = null,
  power = 0,
  roll = null,
} = {}) {
  const summonId = String(effect?.summonId ?? "summon").trim() || "summon";
  const duration = Math.max(6, num(effect?.duration, 18));
  const tier = Math.max(1, Math.min(5, num(effect?.tier, 0) || Math.ceil((num(power, 0) + rollBonus(roll, 4)) / 3) || 1));
  const hp = 18 + tier * 8;
  const energy = 10 + tier * 2;
  const label = getSummonLabel(effect);

  return {
    name: label,
    type: "monster",
    img: effect?.img || "icons/svg/skull.svg",
    system: {
      resources: {
        hp: { value: hp, max: hp },
        armor: { physical: tier, magical: 0 },
        energy: { value: energy, max: energy, baseMax: energy },
        mana: { value: 0, max: 0, baseMax: 0 },
      },
      combat: {
        baseThreshold: 3 + tier,
        unarmedDamage: 8 + tier * 4,
        unarmedSkill: 2 + tier,
        attackSkill: 2 + tier,
      },
      info: {
        role: "summon",
        tier,
        faction: caster?.name ?? "",
        desc: `Призвано заклинанием ${caster?.name ?? "кастера"}.`,
        lootPool: "",
        lootTable: "",
        bestiaryId: summonId,
        tags: summonId === "skeleton" ? "summoned undead skeleton" : "summoned",
      },
      conditions: {
        stunned: 0,
        poison: 0,
        burning: 0,
        silencedUntil: 0,
        slowPenalty: 0,
        feared: 0,
        fleeing: 0,
        hasted: 0,
        slowed: 0,
        unconscious: 0,
        exposed: 0,
        pushed: 0,
        prone: 0,
        shield_lost: 0,
        armor_cracked: 0,
      },
    },
    flags: {
      [SYSTEM_ID]: {
        summoned: {
          summonId,
          casterId: caster?.id ?? "",
          casterName: caster?.name ?? "",
          duration,
          remaining: duration,
          totalDuration: duration,
          createdRound: Number(globalThis.game?.combat?.round ?? 0) || null,
          createdTurn: Number(globalThis.game?.combat?.turn ?? 0) || null,
        },
      },
    },
  };
}

async function placeSummonedToken(actor, caster = null) {
  const scene = globalThis.canvas?.scene;
  if (!scene?.createEmbeddedDocuments || !actor?.id) return { placed: false, reason: "no-active-scene" };

  const casterToken = getActorToken(caster);
  const casterDoc = casterToken?.document ?? casterToken ?? null;
  const gridSize = Math.max(1, num(globalThis.canvas?.grid?.size, 100));
  const x = num(casterDoc?.x, 0) + gridSize;
  const y = num(casterDoc?.y, 0);
  const disposition = num(casterDoc?.disposition ?? caster?.prototypeToken?.disposition, 1);

  const created = await scene.createEmbeddedDocuments("Token", [{
    name: actor.name,
    actorId: actor.id,
    actorLink: true,
    img: actor.img,
    x,
    y,
    width: 1,
    height: 1,
    disposition,
  }]);

  return { placed: created?.length > 0, tokens: created ?? [] };
}

async function applySummonEffect({
  caster = null,
  effect = null,
  power = 0,
  roll = null,
} = {}) {
  const data = buildSummonedActorData({ caster, effect, power, roll });
  const duration = data.flags?.[SYSTEM_ID]?.summoned?.duration ?? num(effect?.duration, 18);

  if (!globalThis.Actor?.create) {
    return {
      created: false,
      placed: false,
      label: data.name,
      duration,
      reason: "actor-api-unavailable",
    };
  }

  const actor = await Actor.create(data, { renderSheet: false });
  const placement = await placeSummonedToken(actor, caster);
  return {
    created: Boolean(actor),
    placed: Boolean(placement.placed),
    actor,
    label: actor?.name ?? data.name,
    duration,
    reason: placement.reason ?? "",
  };
}

async function markActorBanishDefeated(target, markActorDead = null) {
  if (markActorDead) {
    await markActorDead(target);
    return "marked-dead";
  }

  if (target?.type === "monster" && target.system?.resources?.hp?.value !== undefined) {
    await target.update({ "system.resources.hp.value": 0 });
    return "monster-hp-zero";
  }

  if (target?.system?.resources?.hp?.torso?.value !== undefined) {
    await target.update({ "system.resources.hp.torso.value": 0 });
    return "torso-zero";
  }

  await addOrExtendActorCondition(target, "unconscious", 60, {
    mode: "max",
    valueKind: "duration",
  });
  return "unconscious";
}

async function applyBanishEffect({
  target = null,
  power = 0,
  roll = null,
  markActorDead = null,
} = {}) {
  const summoned = isActorSummoned(target);
  const undead = isUndeadActor(target);
  const tier = getActorTier(target, 1);
  const force = Math.max(1, num(power, 0) + Math.max(0, rollTotal(roll) - 4));
  const tierLimit = summoned ? 99 : Math.max(1, Math.ceil(force / 2));

  if (!summoned && !undead) {
    return { eligible: false, destroyed: false, summoned, undead, tier, force, tierLimit };
  }

  if (tier <= tierLimit) {
    const defeatMode = await markActorBanishDefeated(target, markActorDead);
    return { eligible: true, destroyed: true, summoned, undead, tier, force, tierLimit, defeatMode };
  }

  await addOrExtendActorCondition(target, "stunned", 6, {
    mode: "add",
    valueKind: "duration",
  });
  return { eligible: true, destroyed: false, stunned: true, summoned, undead, tier, force, tierLimit };
}

export async function applySingleTargetSpellDamage({
  caster = null,
  target = null,
  skillKey = "magic",
  baseDamage = 0,
  damageType = "magical",
  label = "Заклинание",
  effect = null,
  targetZone = null,
  hitBonus = 0,
  ignoreArmor = 0,
  injuries = null,
  shieldIntercept = null,
  onLethal = null,
  dieRoller = null,
  renderHtml = true,
} = {}) {
  const normalizedDamageType = normalizeSpellDamageType(damageType);
  const damageMultiplier = getSpellDamageMultiplier({ target, effect });
  const scaledBaseDamage = Math.round(num(baseDamage, 0) * damageMultiplier);

  const result = await resolveSingleAttack({
    attacker: caster,
    target,
    skillKey,
    baseDamage: scaledBaseDamage,
    damageType: normalizedDamageType,
    energyCost: 0,
    weapon: null,
    attackMode: "cast",
    hitBonus,
    ignoreArmor,
    targetZone,
    spendEnergy: false,
    wearWeapon: false,
    wearArmor: true,
    shieldIntercept: shieldIntercept ?? isShieldBlockableDamageType(normalizedDamageType),
    injuries,
    onLethal,
    dieRoller: dieRoller ?? undefined,
  });

  if (!result) {
    return { ok: false, result: null, attackHtml: "", effectHtml: "", html: "" };
  }

  const attackHtml = renderHtml && typeof globalThis.renderTemplate === "function"
    ? await formatAttackChatHtml({
      label,
      skillKey,
      attacker: caster,
      target,
      result,
    })
    : "";
  const effectOutcome = await applyHitEffects({
    attacker: caster,
    target,
    result,
    effect,
  });
  const multiplierHtml = damageMultiplier > 1
    ? rowsToHtml([["Модификатор", `x${damageMultiplier} по нежити`]])
    : "";
  const effectHtml = multiplierHtml + effectOutcome.html;

  return {
    ok: true,
    result,
    attackHtml,
    effectHtml,
    effectOutcome,
    damageMultiplier,
    html: attackHtml + effectHtml,
  };
}

export async function applyAoeSpellEffect({
  caster = null,
  aoe = null,
  label = "AoE заклинание",
  color = "#8888ff",
  skillKey = "magic",
  hitBonus = 0,
  skillValueFallback = null,
  injuries = null,
  friendlyFire = null,
  friendlyFireMode = null,
  baseDamage = 0,
  damageType = "magical",
  effect = null,
  power = 0,
  targetZone = null,
  targetZoneMode = null,
  onLethal = null,
  dieRoller = null,
  createChat = true,
  onTemplatePlaced = null,
  cleanupDelay = 3000,
} = {}) {
  const rawAoe = aoe && typeof aoe === "object" ? aoe : {};
  const resolvedFriendlyFireMode = resolveAoeFriendlyFireMode(
    friendlyFireMode,
    friendlyFire,
    rawAoe.friendlyFireMode,
    rawAoe.friendlyFire,
    Number(baseDamage ?? 0) > 0 ? "auto" : "off",
  );
  const aoeConfig = normalizeAoeConfig({
    ...rawAoe,
    friendlyFireMode: resolvedFriendlyFireMode,
    friendlyFire,
    damageType,
    effect,
    targetZone,
    targetZoneMode,
  }, {
    shape: "circle",
    type: "blast",
    distance: 1,
    chainDecay: Number(baseDamage ?? 0) > 0 ? 0.8 : 1,
  });

  if (Number(baseDamage ?? 0) > 0) {
    return applyAoeDamageTemplate({
      attacker: caster,
      shape: aoeConfig.shape,
      distance: aoeConfig.distance,
      label,
      color,
      skillKey,
      attackMode: "cast",
      hitBonus,
      skillValueFallback,
      injuries,
      friendlyFire: aoeConfig.friendlyFire,
      friendlyFireMode: aoeConfig.friendlyFireMode,
      baseDamage,
      damageType: normalizeSpellDamageType(damageType),
      aoeType: aoeConfig.type,
      maxTargets: aoeConfig.maxTargets,
      chainDecay: aoeConfig.chainDecay,
      targetZone: aoeConfig.targetZone ?? targetZone,
      targetZoneMode: aoeConfig.targetZoneMode,
      effect,
      onLethal,
      dieRoller,
      createChat,
      onTemplatePlaced,
      cleanupDelay,
    });
  }

  return applyAoeUtilityTemplate({
    caster,
    attacker: caster,
    shape: aoeConfig.shape,
    distance: aoeConfig.distance,
    label,
    color,
    skillKey,
    attackMode: "cast",
    hitBonus,
    skillValueFallback,
    injuries,
    effect,
    power: effect?.healAmount ?? power,
    aoeType: aoeConfig.type,
    maxTargets: aoeConfig.maxTargets,
    chainDecay: aoeConfig.chainDecay,
    targetZone: aoeConfig.targetZone ?? targetZone,
    targetZoneMode: aoeConfig.targetZoneMode,
    friendlyFire: aoeConfig.friendlyFire,
    friendlyFireMode: aoeConfig.friendlyFireMode,
    createChat,
    onTemplatePlaced,
    cleanupDelay,
  });
}

export async function applySingleTargetSpellUtilityEffect({
  caster = null,
  target = null,
  item = null,
  effectType = "",
  effect = null,
  power = 0,
  roll = null,
  targetPart = "torso",
  schoolSkill = null,
  markActorDead = null,
} = {}) {
  const type = getEffectType(effectType, effect);
  const rows = [];
  let extraHtml = "";

  if (!target) return { ok: false, handled: false, html: "", effectType: type };

  const appendHitEffect = async () => {
    if (!effect?.applyCondition) return false;
    const outcome = await applyHitEffects({
      attacker: caster,
      target,
      result: { hit: true, finalDamage: 0 },
      effect,
    });
    extraHtml += outcome.html;
    return true;
  };

  if (!type || effect?.special === "buff" || effect?.special === "debuff") {
    const handled = await appendHitEffect();
    if (handled) return { ok: true, handled: true, html: extraHtml + rowsToHtml(rows), effectType: type };
  }

  if (type === "summon") {
    const summon = await applySummonEffect({ caster, effect, power, roll });
    rows.push(
      ["Эффект", "Призыв"],
      ["Существо", summon.label],
      ["Длительность", `${summon.duration} сек.`],
      ["Размещение", summon.placed ? "токен создан" : (summon.created ? "актёр создан" : "недоступно вне Foundry")],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type, summon };
  }

  if (type === "banish") {
    const banish = await applyBanishEffect({ target, power, roll, markActorDead });
    rows.push(
      ["Эффект", "Изгнание"],
      ["Цель", target.name],
      ["Сила", banish.force],
      ["Порог тира", banish.tierLimit],
    );
    if (!banish.eligible) {
      rows.push(["Результат", "цель не является призванной или нежитью"]);
    } else if (banish.destroyed) {
      rows.push(["Результат", "цель изгнана"]);
    } else {
      rows.push(["Результат", "цель слишком сильна, наложено оглушение"]);
    }
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type, banish };
  }

  if (type === "heal") {
    const healed = num(power, 0) + rollBonus(roll, 1);
    const result = await healActorBodyPart(target, targetPart, healed);
    rows.push(
      ["Эффект", "Лечение"],
      ["Часть тела", getTargetPartLabel(result.locationKey)],
      ["Восстановлено HP", healed],
      ["Текущее HP", result.newHP],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type, heal: result };
  }

  if (type === "restoreEnergy") {
    const restored = num(power, 0) + rollBonus(roll, 1);
    const next = await restoreResource(target, "energy", restored);
    rows.push(
      ["Эффект", "Восстановление энергии"],
      ["Восстановлено", restored],
      ["Энергия цели", next],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type, resource: { key: "energy", restored, next } };
  }

  if (type === "restoreMana") {
    const restored = num(power, 0) + rollBonus(roll, 1);
    const next = await restoreResource(target, "mana", restored);
    rows.push(
      ["Эффект", "Восстановление маны"],
      ["Восстановлено", restored],
      ["Мана цели", next],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type, resource: { key: "mana", restored, next } };
  }

  if (type === "curePoison") {
    await target.update({ "system.conditions.poison": 0 });
    rows.push(["Эффект", "Нейтрализация яда"]);
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "cureDisease") {
    const diseases = foundry.utils.deepClone(target.system?.diseases ?? {});
    const active = Object.entries(diseases).filter(([, disease]) => disease?.stage >= 0);
    if (active.length) {
      const [key] = active[Math.floor(Math.random() * active.length)];
      diseases[key] = { ...diseases[key], stage: -1 };
      await target.update({ "system.diseases": diseases });
      rows.push(["Эффект", "Болезнь снята"]);
    } else {
      rows.push(["Эффект", "Активных болезней нет"]);
    }
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "stimulant") {
    const boost = num(power, 0) + rollBonus(roll, 4);
    const next = await restoreResource(target, "energy", boost);
    rows.push(
      ["Эффект", "Стимулятор"],
      ["Энергия", `+${boost}`],
      ["Энергия цели", next],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type, resource: { key: "energy", restored: boost, next } };
  }

  if (type === "stun") {
    const durationTurns = Math.max(1, num(power, 0) + rollBonus(roll, 4));
    await addOrExtendActorCondition(target, "stunned", durationTurns * 6, {
      mode: "add",
      valueKind: "duration",
    });
    rows.push(
      ["Эффект", "Оглушение"],
      ["Длительность", `${durationTurns} ход(а)`],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "disarm") {
    const threshold = 6 + num(target.system?.info?.tier, 1);
    if (rollTotal(roll) >= threshold) {
      const disarmHand = item?.system?.disarmHand ?? "rightHand";
      const weaponId = target.system?.equipment?.[disarmHand];
      if (weaponId) {
        await unequipActorSlot(target, disarmHand);
        rows.push(
          ["Эффект", "Обезоруживание"],
          ["Результат", "Оружие выбито"],
          ["Бросок / Порог", `${rollTotal(roll)} / ${threshold}`],
        );
      } else {
        rows.push(["Обезоруживание", "Цель безоружна"]);
      }
    } else {
      rows.push(
        ["Эффект", "Обезоруживание"],
        ["Результат", `Провал (${rollTotal(roll)} < ${threshold})`],
      );
    }
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "silence") {
    const duration = num(power, 0) + Math.max(1, rollTotal(roll) - 3);
    await addOrExtendActorCondition(target, "silence", duration, {
      mode: "max",
      valueKind: "duration",
    });
    rows.push(
      ["Эффект", "Безмолвие"],
      ["Длительность", `${duration} сек.`],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "slow") {
    const penalty = Math.max(1, num(power, 0) + rollBonus(roll, 4));
    await addOrExtendActorCondition(target, "slowPenalty", penalty, {
      mode: "add",
      valueKind: "stack",
    });
    rows.push(
      ["Эффект", "Замедление"],
      ["Штраф инициативы", `-${penalty}`],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "fear") {
    const durationTurns = Math.max(1, num(power, 0) + Math.max(1, rollTotal(roll) - 4));
    const duration = durationTurns * 6;
    await addOrExtendActorCondition(target, "feared", duration, {
      mode: "add",
      valueKind: "duration",
    });
    rows.push(
      ["Эффект", "Страх"],
      ["Длительность", `${durationTurns} ход(а)`],
      ["Штрафы", "-3 атака, -3 защита"],
    );
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "reserveDrain") {
    const isPermanent = num(schoolSkill?.value, 1) >= 6;
    const amount = Math.max(1, num(power, 0) + rollBonus(roll, 4));
    const drainType = item?.system?.drainType ?? "mana";

    if (isPermanent) {
      const maxPath = `system.resources.${drainType}.max`;
      const currentMax = num(target.system?.resources?.[drainType]?.max, 10);
      const nextMax = Math.max(0, currentMax - amount);
      const valuePath = `system.resources.${drainType}.value`;
      const currentValue = num(target.system?.resources?.[drainType]?.value, 0);
      await target.update({
        [maxPath]: nextMax,
        [valuePath]: Math.min(currentValue, nextMax),
      });
      if (nextMax <= 0) await markActorDead?.(target);
      rows.push(
        ["Эффект", `Истощение резерва (${drainType === "mana" ? "Мана" : "Энергия"})`],
        ["Тип", "Постоянное"],
        ["Урон по максимуму", `-${amount}`],
      );
      if (nextMax <= 0) rows.push(["Итог", "Резерв иссяк"]);
    } else {
      const valuePath = `system.resources.${drainType}.value`;
      const current = num(target.system?.resources?.[drainType]?.value, 0);
      const next = Math.max(0, current - amount);
      await target.update({ [valuePath]: next });
      rows.push(
        ["Эффект", `Истощение (${drainType === "mana" ? "Мана" : "Энергия"})`],
        ["Тип", "Временное"],
        ["Снято", `-${amount}`],
        ["Осталось", next],
      );
    }
    return { ok: true, handled: true, html: rowsToHtml(rows), effectType: type };
  }

  return { ok: false, handled: false, html: "", effectType: type };
}
