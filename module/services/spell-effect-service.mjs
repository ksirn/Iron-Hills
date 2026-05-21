import { getTargetPartLabel } from "./actor-state-service.mjs";
import { applyAoeDamageTemplate, applyAoeUtilityEffect, placeAoeTemplate, removeAoeTemplate } from "./aoe-service.mjs";
import {
  normalizeAoeConfig,
  resolveAoeFriendlyFireMode,
} from "./aoe-policy-service.mjs";
import { formatAttackChatHtml, resolveSingleAttack } from "./combat-attack-service.mjs";
import { addOrExtendActorCondition } from "./condition-service.mjs";
import { applyHitEffects, healActorBodyPart } from "./hit-effect-service.mjs";
import { unequipActorSlot } from "./inventory-service.mjs";
import { buildChatSectionRow } from "../utils/text-utils.mjs";

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
  return rows.map(([label, value]) => buildChatSectionRow(label, value)).join("");
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
  return "";
}

function normalizeSpellDamageType(damageType) {
  return String(damageType ?? "magical").toLowerCase() === "physical" ? "physical" : "magical";
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
} = {}) {
  const normalizedDamageType = normalizeSpellDamageType(damageType);

  const result = await resolveSingleAttack({
    attacker: caster,
    target,
    skillKey,
    baseDamage,
    damageType: normalizedDamageType,
    energyCost: 0,
    weapon: null,
    hitBonus,
    ignoreArmor,
    targetZone,
    spendEnergy: false,
    wearWeapon: false,
    wearArmor: true,
    shieldIntercept: shieldIntercept ?? (normalizedDamageType === "physical"),
    injuries,
    onLethal,
  });

  if (!result) {
    return { ok: false, result: null, attackHtml: "", effectHtml: "", html: "" };
  }

  const attackHtml = await formatAttackChatHtml({
    label,
    skillKey,
    attacker: caster,
    target,
    result,
  });
  const effectHtml = (await applyHitEffects({
    attacker: caster,
    target,
    result,
    effect,
  })).html;

  return {
    ok: true,
    result,
    attackHtml,
    effectHtml,
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
  baseDamage = 0,
  damageType = "magical",
  effect = null,
  power = 0,
  targetZone = null,
  onTemplatePlaced = null,
  cleanupDelay = 3000,
} = {}) {
  const aoeConfig = normalizeAoeConfig({
    ...(aoe && typeof aoe === "object" ? aoe : {}),
    friendlyFireMode: resolveAoeFriendlyFireMode(friendlyFire, aoe?.friendlyFireMode, aoe?.friendlyFire, false),
    damageType,
    effect,
    targetZone,
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
      targetZone,
      targetZoneMode: aoeConfig.targetZoneMode,
      effect,
      onTemplatePlaced,
      cleanupDelay,
    });
  }

  const templateResult = await placeAoeTemplate({
    aoeType: aoeConfig.shape,
    distance: aoeConfig.distance,
    label,
    color,
    attacker: caster,
    skillKey,
    hitBonus,
    skillValueFallback,
    injuries,
    friendlyFire: aoeConfig.friendlyFire,
  });

  if (!templateResult) {
    return { ok: false, cancelled: true, results: [], template: null, targets: [] };
  }

  const { template, targets } = templateResult;

  try {
    await onTemplatePlaced?.(templateResult);

    const results = await applyAoeUtilityEffect({
      attacker: caster,
      targets,
      effect,
      power: effect?.healAmount ?? power,
      aoeType: aoeConfig.type,
      maxTargets: aoeConfig.maxTargets,
      chainDecay: aoeConfig.chainDecay,
      targetZone,
      label,
      friendlyFire: aoeConfig.friendlyFire,
    });
    return { ok: true, cancelled: false, results, template, targets };
  } finally {
    await removeAoeTemplate(template, cleanupDelay);
  }
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

  if (!target) return { handled: false, html: "", effectType: type };

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
    if (handled) return { handled: true, html: extraHtml + rowsToHtml(rows), effectType: type };
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
    return { handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "restoreEnergy") {
    const restored = num(power, 0) + rollBonus(roll, 1);
    const next = await restoreResource(target, "energy", restored);
    rows.push(
      ["Эффект", "Восстановление энергии"],
      ["Восстановлено", restored],
      ["Энергия цели", next],
    );
    return { handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "restoreMana") {
    const restored = num(power, 0) + rollBonus(roll, 1);
    const next = await restoreResource(target, "mana", restored);
    rows.push(
      ["Эффект", "Восстановление маны"],
      ["Восстановлено", restored],
      ["Мана цели", next],
    );
    return { handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "curePoison") {
    await target.update({ "system.conditions.poison": 0 });
    rows.push(["Эффект", "Нейтрализация яда"]);
    return { handled: true, html: rowsToHtml(rows), effectType: type };
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
    return { handled: true, html: rowsToHtml(rows), effectType: type };
  }

  if (type === "stimulant") {
    const boost = num(power, 0) + rollBonus(roll, 4);
    const next = await restoreResource(target, "energy", boost);
    rows.push(
      ["Эффект", "Стимулятор"],
      ["Энергия", `+${boost}`],
      ["Энергия цели", next],
    );
    return { handled: true, html: rowsToHtml(rows), effectType: type };
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
    return { handled: true, html: rowsToHtml(rows), effectType: type };
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
    return { handled: true, html: rowsToHtml(rows), effectType: type };
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
    return { handled: true, html: rowsToHtml(rows), effectType: type };
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
    return { handled: true, html: rowsToHtml(rows), effectType: type };
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
    return { handled: true, html: rowsToHtml(rows), effectType: type };
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
    return { handled: true, html: rowsToHtml(rows), effectType: type };
  }

  return { handled: false, html: "", effectType: type };
}
