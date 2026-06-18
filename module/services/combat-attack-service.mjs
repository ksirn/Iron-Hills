/**
 * Iron Hills — Combat Attack Service
 *
 * Единый «pure» пайплайн single-target атаки. Используется:
 *   - actor sheet attack orchestration
 *   - aoe-service.applyAoeDamage (для каждой цели в зоне)
 *   - combat-hud-app быстрый удар
 *
 * Сервис делает ВСЮ боевую математику и применение состояния (HP, броня, травмы),
 * но НЕ занимается:
 *   - выбором цели (target picking)
 *   - блокировкой по deriviedConditions / hostile gating / time cost
 *   - выводом ChatMessage
 *   - начислением опыта навыка
 *   - ререндером листа
 *
 * Эти задачи остаются у вызывающего кода (UI / orchestration). Сервис возвращает
 * подробный AttackResult, который удобно отрендерить и залогировать.
 *
 * @module services/combat-attack-service
 */

import {
  getFailureDegree,
  getHitLocation,
  getHitLabel,
  getEquippedArmorForLocation,
  resolveDamageHpKey,
  getShieldInterceptChance,
  grantSkillExp,
  syncDerivedConditionsFromTrauma,
} from "./actor-state-service.mjs";

import { getWeaponAffixes } from "../utils/item-utils.mjs";
import { buildAttackRollContext } from "./combat-hit-context-service.mjs";
import {
  getAttackModeLabel,
  normalizeAttackMode,
} from "./combat-attack-mode-service.mjs";
import {
  getDamageArmorChannel,
  getDamageArmorChannelLabel,
  getDamageTypeLabel,
  getDamageResistanceValue,
  isShieldBlockableDamageType,
  normalizeDamageType,
} from "./damage-type-service.mjs";
import { normalizeAoeTargetZone } from "./aoe-policy-service.mjs";
import { getSkillLabel } from "./combat-presentation-service.mjs";
import { buildCombatChatCard } from "./combat-chat-service.mjs";
import { addOrExtendActorCondition } from "./condition-service.mjs";
import { unequipActorSlot } from "./inventory-service.mjs";

// ── Anatomy / overflow ────────────────────────────────────

/**
 * Карта переходящего урона: куда уходит overflow с уничтоженной части тела.
 */
const OVERFLOW_MAP = Object.freeze({
  head:     "torso",
  neck:     "torso",
  torso:    "head",
  abdomen:  "torso",
  leftArm:  "torso",
  rightArm: "torso",
  leftLeg:  "abdomen",
  rightLeg: "abdomen",
});

const BODY_PART_KEYS = Object.freeze(["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"]);
const BODY_PART_KEY_SET = new Set(BODY_PART_KEYS);
const LIMB_PART_KEY_SET = new Set(["leftArm", "rightArm", "leftLeg", "rightLeg"]);
const SHOCK_LOCATION_KEY_SET = new Set(["head", "neck", "torso", "abdomen"]);

export function getOverflowTarget(locationKey) {
  return OVERFLOW_MAP[locationKey] ?? null;
}

function getBodyStatusValue(actor, partKey, statusKey) {
  return Math.max(0, Number(actor?.system?.resources?.hp?.[partKey]?.status?.[statusKey] ?? 0));
}

// ── Damage application ─────────────────────────────────────

/**
 * Применяет урон к части тела, рекурсивно переливая overflow на смежную часть.
 * Если зона "head" или "torso" уходит в 0 — вызывает onLethal(actor).
 * Также инициирует износ брони слота (не блокирует основной поток).
 *
 * @param {Actor} actor
 * @param {string} locationKey
 * @param {number} damage
 * @param {object} [opts]
 * @param {Function} [opts.onLethal] — async (actor) => void
 * @param {number} [opts._depth] — internal recursion guard
 * @returns {Promise<{ newHP:number, overflow:number, overflowTarget:string|null }>}
 */
export async function applyDamageToBodyPart(actor, locationKey, damage, opts = {}) {
  const { onLethal = null, _depth = 0 } = opts;
  if (damage <= 0) {
    const currentHP = Number(actor?.system?.resources?.hp?.[locationKey]?.value ?? 0);
    return { newHP: currentHP, overflow: 0, overflowTarget: null };
  }
  if (_depth > 4) return { newHP: 0, overflow: 0, overflowTarget: null };

  const path = `system.resources.hp.${locationKey}.value`;
  const currentHP = Number(foundry.utils.getProperty(actor, path) ?? 0);

  if (currentHP <= 0) {
    const overflowTarget = getOverflowTarget(locationKey);
    if (overflowTarget) {
      return applyDamageToBodyPart(actor, overflowTarget, damage,
        { onLethal, _depth: _depth + 1 });
    }
    return { newHP: 0, overflow: damage, overflowTarget: null };
  }

  const absorbed = Math.min(currentHP, damage);
  const overflow = damage - absorbed;
  const newHP    = currentHP - absorbed;

  await actor.update({ [path]: newHP });

  if (newHP <= 0 && (locationKey === "head" || locationKey === "torso")) {
    try { await onLethal?.(actor); }
    catch (err) { console.warn("Iron Hills | onLethal callback failed", err); }
  }

  if (overflow > 0 && newHP <= 0) {
    const overflowTarget = getOverflowTarget(locationKey);
    if (overflowTarget) {
      await applyDamageToBodyPart(actor, overflowTarget, overflow,
        { onLethal, _depth: _depth + 1 });
      return { newHP, overflow, overflowTarget };
    }
  }

  return { newHP, overflow: 0, overflowTarget: null };
}

/**
 * Тяжёлый удар (>= половины максимума) → кровотечение, перелом, шок.
 *
 * @param {Actor}  actor
 * @param {string} locationKey
 * @param {number} finalDamage
 * @param {number} [bleedingBonus] — доп. стаки кровотечения от affix'а оружия
 */
export async function applyInjuryEffects(actor, locationKey, finalDamage, bleedingBonus = 0) {
  const injuryPartKey = resolveDamageHpKey(locationKey) ?? locationKey;
  const hpData = actor.system?.resources?.hp?.[injuryPartKey];
  if (!hpData) return;

  const maxHP = Number(hpData.max ?? 0);
  const halfThreshold = Math.ceil(maxHP / 2);
  if (finalDamage < halfThreshold) return;

  const bleedingStacks = 1 + Math.max(0, Number(bleedingBonus) || 0);
  const currentHp = Number(hpData.value ?? 0);
  const isDestroyed = currentHp <= 0;
  const isMajorTrauma = isDestroyed || finalDamage >= maxHP;
  const updates = {};

  if (BODY_PART_KEY_SET.has(injuryPartKey)) {
    updates[`system.resources.hp.${injuryPartKey}.status.minorBleeding`] =
      getBodyStatusValue(actor, injuryPartKey, "minorBleeding") + bleedingStacks;

    if (isMajorTrauma) {
      updates[`system.resources.hp.${injuryPartKey}.status.majorBleeding`] =
        getBodyStatusValue(actor, injuryPartKey, "majorBleeding") + 1;
    }

    if (isDestroyed) {
      updates[`system.resources.hp.${injuryPartKey}.status.destroyed`] = true;
    }
  }

  if (LIMB_PART_KEY_SET.has(injuryPartKey)) {
    updates[`system.conditions.fractures.${injuryPartKey}`] = true;
    updates[`system.resources.hp.${injuryPartKey}.status.fracture`] = true;
  }

  if (SHOCK_LOCATION_KEY_SET.has(locationKey) || SHOCK_LOCATION_KEY_SET.has(injuryPartKey)) {
    updates["system.conditions.shock"] =
      Number(actor.system?.conditions?.shock ?? 0) + 1;
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
    await syncDerivedConditionsFromTrauma(actor, { render: false });
  }
}

// ── Item durability ───────────────────────────────────────

/**
 * Тонкий адаптер: внутренний combat-pipeline хочет wearItem(actor, item, amount),
 * а канонический сервис прочности — wearItem(item, amount, actor).
 */
async function wearItem(actor, item, amount = 1) {
  if (!item || !actor) return;
  const { wearItem: wearItemDurable } = await import("./durability-service.mjs");
  return wearItemDurable(item, amount, actor);
}

function cleanDamageNumber(value) {
  const parsed = Number(value);
  return Math.max(0, Math.round(Number.isFinite(parsed) ? parsed : 0));
}

function cleanRatio(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(0.95, parsed));
}

function getDurabilitySnapshot(item) {
  const durability = item?.system?.durability;
  if (!durability || typeof durability !== "object") {
    return {
      hasDurability: false,
      value: Number.POSITIVE_INFINITY,
      max: Number.POSITIVE_INFINITY,
    };
  }
  return {
    hasDurability: true,
    value: Math.max(0, cleanDamageNumber(durability.value ?? 0)),
    max: Math.max(0, cleanDamageNumber(durability.max ?? durability.value ?? 0)),
  };
}

export async function resolveDurableDefenseLayer({
  actor = null,
  item = null,
  incomingDamage = 0,
  damageType = "physical",
  armorPenetration = 0,
  ignoreArmor = 0,
  wear = true,
  kind = "armor",
} = {}) {
  const incoming = cleanDamageNumber(incomingDamage);
  const durability = getDurabilitySnapshot(item);
  const baseProtection = Math.max(0, cleanDamageNumber(getDamageResistanceValue(item?.system ?? {}, damageType)));
  const durabilityLimit = durability.hasDurability ? durability.value : Number.POSITIVE_INFINITY;
  const availableProtection = Math.min(baseProtection, durabilityLimit, incoming);
  const cleanPenetration = Math.min(availableProtection, cleanDamageNumber(armorPenetration));
  const techPenetration = Math.min(
    Math.max(0, availableProtection - cleanPenetration),
    Math.round(availableProtection * cleanRatio(ignoreArmor)),
  );
  const effectiveProtection = Math.max(0, availableProtection - cleanPenetration - techPenetration);
  const absorbed = Math.min(incoming, effectiveProtection);
  const remainingDamage = Math.max(0, incoming - absorbed);
  const durabilityLoss = durability.hasDurability
    ? Math.min(durability.value, incoming)
    : 0;
  const durabilityAfter = durability.hasDurability
    ? Math.max(0, durability.value - durabilityLoss)
    : null;

  if (wear && durabilityLoss > 0 && item) {
    await wearItem(actor, item, durabilityLoss);
  }

  return {
    kind,
    itemId: item?.id ?? "",
    itemName: item?.name ?? "",
    incomingDamage: incoming,
    baseProtection,
    availableProtection,
    effectiveProtection,
    absorbed,
    remainingDamage,
    armorPenetration: cleanPenetration,
    techPenetration,
    reductionNegated: Math.max(0, availableProtection - effectiveProtection),
    durabilityBefore: durability.hasDurability ? durability.value : null,
    durabilityAfter,
    durabilityMax: durability.hasDurability ? durability.max : null,
    durabilityLoss,
    broken: durability.hasDurability && durability.value > 0 && durabilityAfter <= 0,
  };
}

// ── Resolve attack ─────────────────────────────────────────

/**
 * Стандартный non-interactive ролл: один d(skill*2), без взрыва.
 * Используется в AoE и HUD, где нет диалога подтверждения.
 */
async function defaultDieRoller(skillValue) {
  const die = Math.max(2, Number(skillValue) * 2);
  const r = await new Roll(`1d${die}`).evaluate();
  return { total: r.total, rolls: [{ die, result: r.total }], exploded: false };
}

const ZONE_LABELS = Object.freeze({
  head: "Голова", neck: "Шея", torso: "Торс", abdomen: "Живот",
  leftArm: "Л.рука", rightArm: "П.рука",
  leftLeg: "Л.нога", rightLeg: "П.нога",
  shield: "Щит",
});

function pickRandomLocationFromRoll(roll) {
  const key = getHitLocation(roll);
  return { key, label: getHitLabel(key) };
}

function pickFixedLocation(targetZone) {
  return { key: targetZone, label: ZONE_LABELS[targetZone] ?? targetZone };
}

function normalizeAttackTargetZone(targetZone) {
  return normalizeAoeTargetZone(targetZone);
}

/**
 * Главная функция боевого пайплайна.
 *
 * @param {object} args
 * @param {Actor}  args.attacker
 * @param {Actor}  args.target
 * @param {string} args.skillKey       — ключ навыка атакующего ("sword", "bow", ...)
 * @param {number} [args.baseDamage]   — базовый урон оружия/способности
 * @param {string} [args.damageType]   — "physical" | "magical"
 * @param {number} [args.energyCost]   — сырое значение, реально вычитается с учётом encumbrance
 * @param {Item|null}   [args.weapon]
 * @param {number}      [args.hitBonus]
 * @param {number}      [args.ignoreArmor]   — 0..1, доля брони, которую игнорирует приём
 * @param {string|null} [args.targetZone]    — фиксированная зона ("head", ...) или null для случайной
 * @param {number}      [args.surroundCount] — окружение цели, влияет на порог
 * @param {boolean}     [args.spendEnergy]   — списать energyCost у атакующего
 * @param {boolean}     [args.wearWeapon]    — −1 прочности оружию
 * @param {boolean}     [args.wearArmor]     — −1 прочности слотовой броне цели
 * @param {boolean}     [args.applyInjuries] — применять кровотечение/переломы/шок
 * @param {Function|null} [args.dieRoller]   — async (skillValue) => { total, rolls, exploded }
 * @param {Function|null} [args.onLethal]    — async (actor) => void, вызывается при летальном HP
 * @param {object|null}   [args.encumbrance] — переопределить рассчитанный encumbrance
 * @param {object|null}   [args.injuries]    — переопределить рассчитанные injuries
 * @param {number|null}   [args.skillValueFallback] — значение навыка для NPC/монстров без system.skills[skillKey]
 *
 * @returns {Promise<AttackResult|null>} null если атаку нельзя провести (нет навыка/ресурсов).
 *
 * @typedef {object} AttackResult
 * @property {boolean} hit
 * @property {boolean} isAnticrit
 * @property {number}  failDegree
 * @property {number}  threshold
 * @property {number}  dieSize
 * @property {number}  rollTotal
 * @property {number}  effectiveRoll
 * @property {Array<{die:number, result:number}>} rollHistory
 * @property {boolean} exploded
 * @property {number}  attackPenalty
 * @property {number}  finalEnergyCost
 * @property {number}  margin
 * @property {number}  rawDamage
 * @property {number}  finalDamage
 * @property {number}  reduction       — поглощено бронёй
 * @property {number}  armorPenetration
 * @property {number}  techPenetration
 * @property {Item|null} armorItem
 * @property {string}    locationKey
 * @property {string}    locationLabel
 * @property {number}    locationRoll  — d20 при случайной зоне, 0 при targetZone
 * @property {number}    remainingHP
 * @property {number}    overflowDamage
 * @property {string|null} overflowTarget
 * @property {boolean} targetIsMonster
 * @property {boolean} targetKilled
 */
export async function resolveSingleAttack(args = {}) {
  const {
    attacker,
    target,
    skillKey,
    baseDamage      = 1,
    damageType      = "physical",
    energyCost      = 0,
    weapon          = null,
    attackMode: attackModeInput = null,
    hitBonus: hitBonusInput = 0,
    ignoreArmor     = 0,
    targetZone      = null,
    surroundCount   = 0,
    spendEnergy     = true,
    wearWeapon      = true,
    wearArmor       = true,
    applyInjuries   = true,
    dieRoller       = defaultDieRoller,
    onLethal        = null,
    encumbrance: encInput = null,
    injuries:    injInput = null,
    shieldIntercept = true,
    ignoreShield    = false,
    skillValueFallback = null,
    targetToken     = null,
  } = args;

  if (!attacker || !target) return null;

  const attackMode = normalizeAttackMode(attackModeInput, { skillKey, weapon });
  const resolvedDamageType = normalizeDamageType(damageType, { fallback: "physical" });
  const damageArmorChannel = getDamageArmorChannel(resolvedDamageType);
  const normalizedTargetZone = normalizeAttackTargetZone(targetZone);

  const attackContext = buildAttackRollContext(attacker, target, {
    skillKey,
    skillValueFallback,
    attackMode,
    weapon,
    hitBonus: hitBonusInput,
    surroundCount,
    targetToken,
    encumbrance: encInput,
    injuries: injInput,
  });
  const {
    skill,
    skillValue,
    dieSize,
    encumbrance,
    injuries,
    attackPenalty,
    hitBonus,
    threshold,
    defenseContext,
    targetDefense,
  } = attackContext;
  if (!(skillValue > 0)) return null;

  const finalEnergyCost = Math.ceil(Number(energyCost || 0) * (encumbrance.energyMultiplier ?? 1));

  // Affixes оружия — пассивные эффекты (T9-T10 артефакты)
  const affixes = getWeaponAffixes(weapon);
  const totalIgnoreArmor = Math.min(0.95, Number(ignoreArmor ?? 0) + affixes.ignoreArmor);

  // Бросок навыка (может быть интерактивным)
  const { total: rollTotal, rolls: rollHistory, exploded } =
    await dieRoller(skillValue);

  // Порог цели
  const targetShield = targetDefense.shield;
  const targetHasShield = targetDefense.hasShield;

  const targetIsMonster = targetDefense.targetIsMonster;
  // Штраф атакующего
  const effectiveRoll = rollTotal - attackPenalty + hitBonus;

  const failDegree = getFailureDegree(effectiveRoll, threshold, dieSize);
  const hit = !failDegree.isFail;

  // Списываем энергию
  if (spendEnergy && finalEnergyCost > 0) {
    const curEnergy = Number(attacker.system?.resources?.energy?.value ?? 0);
    await attacker.update({
      "system.resources.energy.value": Math.max(0, curEnergy - finalEnergyCost),
    });
  }

  // Износ оружия — даже при промахе теряем 1 прочности (старое поведение)
  if (wearWeapon && weapon) {
    await wearItem(attacker, weapon, 1);
  }

  // Базовая болванка результата (общая для hit/miss)
  const result = {
    hit,
    isAnticrit:   Boolean(failDegree.isAnticrit),
    failDegree:   Number(failDegree.degree ?? 0),
    threshold,
    dieSize,
    rollTotal,
    effectiveRoll,
    rollHistory,
    exploded,
    attackPenalty,
    finalEnergyCost,
    hitBonus,
    damageType: resolvedDamageType,
    damageArmorChannel,
    attackMode,
    baseDamage:       Number(baseDamage),
    margin:           0,
    rawDamage:        0,
    finalDamage:      0,
    reduction:        0,
    reductionBeforePenetration: 0,
    reductionNegated: 0,
    armorPenetration: 0,
    techPenetration:  0,
    armorItem:        null,
    shieldItem:       null,
    armorLayer:       null,
    shieldLayer:      null,
    defenseLayers:    [],
    locationKey:      null,
    locationLabel:    "",
    locationRoll:     0,
    remainingHP:      0,
    overflowDamage:   0,
    overflowTarget:   null,
    targetIsMonster,
    targetKilled:     false,
    affixesApplied: {
      criticalMult:    1,
      lifestolenHp:    0,
      bleedingBonus:   0,
      disarmed:        false,
      stunnedExtra:    false,
      executed:        false,
    },
    shieldBlock:      null,
    injuryLocationKey: null,
    damagePartKey:     null,
    defenseContext,
    hitContext: {
      threshold,
      effectiveThreshold: attackContext.effectiveThreshold,
      attackMode,
      attackPenalty,
      hitBonus,
      targetDefense,
    },
  };

  if (!hit && normalizedTargetZone) {
    const missLocation = pickFixedLocation(normalizedTargetZone);
    result.locationKey = missLocation.key;
    result.locationLabel = missLocation.label;
  }

  if (!hit) return result;

  // Урон
  const margin    = effectiveRoll - threshold;
  let   rawDamage = Number(baseDamage) + margin;

  // Affix: criticalDamageMult — при значимом перепопадании (margin >= 8)
  // умножает урон. Дефолт=1, артефактные значения 1.25..2.0.
  let criticalMultApplied = 1;
  if (margin >= 8 && affixes.criticalDamageMult > 1) {
    criticalMultApplied = affixes.criticalDamageMult;
    rawDamage = Math.round(rawDamage * criticalMultApplied);
  }

  let location;
  let locationRollValue = 0;
  if (normalizedTargetZone) {
    location = pickFixedLocation(normalizedTargetZone);
  } else {
    const r = await new Roll("1d20").evaluate();
    locationRollValue = r.total;
    location = pickRandomLocationFromRoll(r.total);
  }

  const anatomicalKey = location.key;

  let shieldBlock = null;
  let shieldLayer = null;
  let rawForReduction = rawDamage;

  if (
    !targetIsMonster &&
    shieldIntercept &&
    isShieldBlockableDamageType(resolvedDamageType) &&
    !ignoreShield &&
    !normalizedTargetZone &&
    targetHasShield &&
    targetShield &&
    anatomicalKey !== "shield"
  ) {
    const shieldSkillVal = Math.max(0, Number(target.system?.skills?.shield?.value ?? 0));
    const chance = getShieldInterceptChance(shieldSkillVal);
    const pctR = await new Roll("1d100").evaluate();
    const chancePct = Math.round(chance * 100);
    if (pctR.total <= chancePct) {
      const blk = await new Roll("1d10 + @shield", { shield: shieldSkillVal }).evaluate();
      const br = blk.total;
      if (br < 6) {
        shieldBlock = {
          triggered: true,
          success: false,
          chancePct,
          shieldSkill: shieldSkillVal,
          pctRoll: pctR.total,
          blockRoll: br,
          originalZone: anatomicalKey,
          note: "Удар пробивает стойку — урон по изначальной зоне.",
        };
        await grantSkillExp(target, "shield", "Щит", 1).catch(() => {});
      } else {
        let tierLabel;
        if (br >= 15) {
          tierLabel = "Идеальный блок";
        } else if (br >= 12) {
          tierLabel = "Крепкий блок";
        } else if (br >= 9) {
          tierLabel = "Частичное парирование";
        } else {
          tierLabel = "Слабое укрытие";
        }

        shieldLayer = await resolveDurableDefenseLayer({
          actor: target,
          item: targetShield,
          incomingDamage: rawDamage,
          damageType: resolvedDamageType,
          wear: wearArmor,
          kind: "shield",
        });
        rawForReduction = shieldLayer.remainingDamage;

        shieldBlock = {
          triggered: true,
          success: true,
          chancePct,
          shieldSkill: shieldSkillVal,
          pctRoll: pctR.total,
          blockRoll: br,
          tierLabel,
          passFactor: rawDamage > 0 ? rawForReduction / rawDamage : 0,
          shieldReduction: shieldLayer.absorbed,
          shieldProtection: shieldLayer.availableProtection,
          softenedRaw: rawForReduction,
          shieldWear: shieldLayer.durabilityLoss,
          durabilityBefore: shieldLayer.durabilityBefore,
          durabilityAfter: shieldLayer.durabilityAfter,
          durabilityMax: shieldLayer.durabilityMax,
          broken: shieldLayer.broken,
          rawLeakToBody: rawForReduction,
          absorbed: shieldLayer.absorbed,
          note: "",
        };

        location = pickFixedLocation("shield");

        await grantSkillExp(target, "shield", "Щит", 2).catch(() => {});
      }
    }
  }

  if (
    !targetIsMonster &&
    !shieldBlock &&
    anatomicalKey === "shield" &&
    targetHasShield &&
    targetShield &&
    isShieldBlockableDamageType(resolvedDamageType)
  ) {
    shieldLayer = await resolveDurableDefenseLayer({
      actor: target,
      item: targetShield,
      incomingDamage: rawDamage,
      damageType: resolvedDamageType,
      wear: wearArmor,
      kind: "shield",
    });
    rawForReduction = shieldLayer.remainingDamage;
    shieldBlock = {
      triggered: true,
      success: true,
      direct: true,
      chancePct: 100,
      shieldSkill: Math.max(0, Number(target.system?.skills?.shield?.value ?? 0)),
      pctRoll: 0,
      blockRoll: "-",
      tierLabel: "Удар по щиту",
      passFactor: rawDamage > 0 ? rawForReduction / rawDamage : 0,
      shieldReduction: shieldLayer.absorbed,
      shieldProtection: shieldLayer.availableProtection,
      softenedRaw: rawForReduction,
      shieldWear: shieldLayer.durabilityLoss,
      durabilityBefore: shieldLayer.durabilityBefore,
      durabilityAfter: shieldLayer.durabilityAfter,
      durabilityMax: shieldLayer.durabilityMax,
      broken: shieldLayer.broken,
      rawLeakToBody: rawForReduction,
      absorbed: shieldLayer.absorbed,
      note: "",
    };
    location = pickFixedLocation("shield");
  }

  const reductionZone =
    location.key === "shield" ? "torso" : location.key;

  const armorItem = targetIsMonster
    ? null
    : getEquippedArmorForLocation(target, reductionZone, resolvedDamageType);

  let reduction = 0;
  let reductionBeforePenetration = 0;
  let armorPenetration = 0;
  let techPenetration = 0;
  let reductionNegated = 0;
  let finalDamage = rawForReduction;
  let armorLayer = null;

  if (targetIsMonster) {
    reductionBeforePenetration = Math.max(0, Number(getDamageResistanceValue(target.system?.resources?.armor ?? {}, resolvedDamageType)) || 0);
    armorPenetration = margin >= 8 ? Math.floor(margin / 4) : 0;
    techPenetration = Math.round(reductionBeforePenetration * totalIgnoreArmor);
    const effectiveReduction = Math.max(0, reductionBeforePenetration - armorPenetration - techPenetration);
    reduction = Math.min(rawForReduction, effectiveReduction);
    reductionNegated = Math.max(0, reductionBeforePenetration - effectiveReduction);
    finalDamage = Math.max(0, rawForReduction - reduction);
  } else if (armorItem && rawForReduction > 0) {
    armorLayer = await resolveDurableDefenseLayer({
      actor: target,
      item: armorItem,
      incomingDamage: rawForReduction,
      damageType: resolvedDamageType,
      armorPenetration: margin >= 8 ? Math.floor(margin / 4) : 0,
      ignoreArmor: totalIgnoreArmor,
      wear: wearArmor,
      kind: "armor",
    });
    reductionBeforePenetration = armorLayer.availableProtection;
    armorPenetration = armorLayer.armorPenetration;
    techPenetration = armorLayer.techPenetration;
    reduction = armorLayer.absorbed;
    reductionNegated = armorLayer.reductionNegated;
    finalDamage = armorLayer.remainingDamage;
  }

  const injuryFxKey =
    shieldBlock?.success ? "torso" : anatomicalKey;
  const damagePart =
    shieldBlock?.success
      ? "torso"
      : (resolveDamageHpKey(anatomicalKey) ?? anatomicalKey);

  result.affixesApplied.criticalMult = criticalMultApplied;

  Object.assign(result, {
    margin, rawDamage,
    locationKey: location.key,
    locationLabel: location.label,
    locationRoll: locationRollValue,
    armorItem,
    shieldItem: shieldBlock?.success ? targetShield : null,
    armorLayer,
    shieldLayer,
    defenseLayers: [shieldLayer, armorLayer].filter(Boolean),
    reduction,
    reductionBeforePenetration,
    reductionNegated,
    armorPenetration,
    techPenetration,
    finalDamage,
    shieldBlock,
    injuryLocationKey: injuryFxKey,
    damagePartKey: damagePart,
  });

  // Affix: executeBelowHp — добивание ослабленной цели.
  // Если HP уже ниже порога (для монстров — % от max, для PC — % от max торса/головы) и удар попал, цель умирает.
  let executeTriggered = false;
  if (finalDamage > 0 && affixes.executeBelowHp > 0) {
    if (targetIsMonster) {
      const curHp = Number(target.system?.resources?.hp?.value ?? 0);
      const maxHp = Number(target.system?.resources?.hp?.max   ?? 0);
      if (maxHp > 0 && curHp / maxHp <= affixes.executeBelowHp) executeTriggered = true;
    } else {
      const torso = target.system?.resources?.hp?.torso;
      const head  = target.system?.resources?.hp?.head;
      const torsoMax = Number(torso?.max ?? 0);
      const headMax  = Number(head?.max  ?? 0);
      const torsoLow = torsoMax > 0 && Number(torso?.value ?? 0) / torsoMax <= affixes.executeBelowHp;
      const headLow  = headMax  > 0 && Number(head?.value  ?? 0) / headMax  <= affixes.executeBelowHp;
      if (torsoLow || headLow) executeTriggered = true;
    }
  }

  // Применяем урон
  if (targetIsMonster) {
    const currentHp = Number(target.system?.resources?.hp?.value ?? 0);
    let remainingHP = Math.max(0, currentHp - finalDamage);
    if (executeTriggered) remainingHP = 0;
    await target.update({ "system.resources.hp.value": remainingHP });
    result.remainingHP = remainingHP;
    if (remainingHP <= 0) {
      result.targetKilled = true;
      try { await onLethal?.(target); }
      catch (err) { console.warn("Iron Hills | onLethal callback failed", err); }
    }
  } else {
    const dmg = await applyDamageToBodyPart(target, damagePart, finalDamage, { onLethal });
    result.remainingHP    = dmg.newHP;
    result.overflowDamage = dmg.overflow;
    result.overflowTarget = dmg.overflowTarget;
    if (applyInjuries) {
      await applyInjuryEffects(target, injuryFxKey, finalDamage, affixes.bleedingBonus);
      result.affixesApplied.bleedingBonus = affixes.bleedingBonus;
    }
    if ((damagePart === "head" || damagePart === "torso") && dmg.newHP <= 0) {
      result.targetKilled = true;
    }
    if (executeTriggered && !result.targetKilled) {
      // PC: добиваем через onLethal-маркировку торса в 0
      try { await onLethal?.(target); }
      catch (err) { console.warn("Iron Hills | onLethal callback failed", err); }
      result.targetKilled = true;
    }
  }
  result.affixesApplied.executed = executeTriggered;

  // Affix: lifeSteal — атакующий получает % от нанесённого урона как HP в торс
  if (finalDamage > 0 && affixes.lifeSteal > 0) {
    const heal = Math.max(1, Math.floor(finalDamage * affixes.lifeSteal));
    const path = "system.resources.hp.torso.value";
    const cur  = Number(foundry.utils.getProperty(attacker, path) ?? 0);
    const max  = Number(attacker.system?.resources?.hp?.torso?.max ?? cur);
    const next = Math.min(max, cur + heal);
    if (next !== cur) await attacker.update({ [path]: next });
    result.affixesApplied.lifestolenHp = next - cur;
  }

  // Affix: disarmChance — после успешного урона. Цель теряет правую руку.
  if (finalDamage > 0 && affixes.disarmChance > 0) {
    const r = await new Roll("1d100").evaluate();
    if (r.total <= Math.round(affixes.disarmChance * 100)) {
      const rightId = target.system?.equipment?.rightHand;
      if (rightId) {
        await unequipActorSlot(target, "rightHand");
        result.affixesApplied.disarmed = true;
      }
    }
  }

  // Affix: stunChance — после урона. Добавляет один боевой тик оглушения.
  if (finalDamage > 0 && affixes.stunChance > 0) {
    const r = await new Roll("1d100").evaluate();
    if (r.total <= Math.round(affixes.stunChance * 100)) {
      await addOrExtendActorCondition(target, "stunned", 6, {
        mode: "add",
        valueKind: "duration",
      });
      result.affixesApplied.stunnedExtra = true;
    }
  }

  return result;
}

// ── Chat rendering ─────────────────────────────────────────

const ATTACK_TEMPLATE = "systems/iron-hills-system/templates/chat/attack.hbs";

function cleanAttackText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function joinAttackParts(parts = [], separator = " · ") {
  return parts
    .map(part => cleanAttackText(part))
    .filter(Boolean)
    .join(separator);
}

function signedAttackNumber(value) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed === 0) return "0";
  return parsed > 0 ? `+${parsed}` : String(parsed);
}

function getAttackRollDesc(result = {}) {
  return (result?.rollHistory ?? [])
    .map(r => `d${r.die}=${r.result}`)
    .join(" -> ");
}

function getAttackOverflowLabel(result = {}) {
  return result?.overflowTarget ? getHitLabel(result.overflowTarget) : "";
}

function getAttackArmorDurability(result = {}) {
  if (!result?.hit || result?.targetIsMonster || !result?.armorItem) return null;
  const showDur =
    result.finalDamage > 0 ||
    result?.shieldBlock?.success ||
    Number(result?.armorLayer?.durabilityLoss ?? 0) > 0;
  if (!showDur) return null;

  const value = Number(result.armorLayer?.durabilityAfter ?? result.armorItem.system?.durability?.value ?? 0);
  if (value < 0) return null;
  return {
    value,
    max: Number(result.armorLayer?.durabilityMax ?? result.armorItem.system?.durability?.max ?? 100),
  };
}

function buildAttackStatus(result = {}) {
  if (result.hit) {
    return {
      icon: result.targetKilled ? "!" : "✓",
      label: result.targetKilled ? "Цель погибает" : "Попадание",
      className: result.targetKilled ? "is-kill" : "is-hit",
    };
  }

  if (result.isAnticrit) {
    return {
      icon: "!",
      label: `Антикрит (${result.failDegree ?? 0})`,
      className: "is-anticrit",
    };
  }

  if (Number(result.failDegree ?? 0) >= 8) {
    return {
      icon: "×",
      label: `Жёсткий промах (${result.failDegree})`,
      className: "is-hard-miss",
    };
  }

  return {
    icon: "×",
    label: "Промах",
    className: "is-miss",
  };
}

function buildDefenseContextRows(defenseContext) {
  const notes = Array.isArray(defenseContext?.notes)
    ? defenseContext.notes.filter(Boolean)
    : [];
  if (!notes.length) return [];

  const summary = [
    defenseContext.formationBonus ? `строй +${defenseContext.formationBonus}` : "",
    defenseContext.shieldWallBonus ? `стена +${defenseContext.shieldWallBonus}` : "",
    defenseContext.surroundMitigation ? `окружение +${defenseContext.surroundMitigation}` : "",
  ].filter(Boolean).join(", ") || "без бонуса";

  return [{
    label: "Позиционная защита",
    value: joinAttackParts([summary, ...notes], "; "),
    className: "is-defense",
  }];
}

function buildShieldBlockRows(result = {}) {
  const sb = result?.shieldBlock;
  if (!sb?.triggered) return [];

  if (sb.success) {
    return [{
      label: "Блок щитом",
      value: joinAttackParts([
        sb.tierLabel,
        `перехват ${sb.chancePct}% (d100 ${sb.pctRoll})`,
        `блок ${sb.blockRoll}`,
        `снято ${sb.shieldReduction}`,
        `в тело raw ${sb.rawLeakToBody}`,
        `износ -${sb.shieldWear}`,
        sb.durabilityAfter != null ? `dur ${sb.durabilityAfter}/${sb.durabilityMax ?? "?"}` : "",
      ], "; "),
      className: "is-shield",
    }];
  }

  return [{
    label: "Щит",
    value: joinAttackParts([
      `попытка блока ${sb.chancePct}% (d100 ${sb.pctRoll})`,
      `блок ${sb.blockRoll}`,
      sb.note,
    ], "; "),
    className: "is-shield",
  }];
}

function buildAttackAffixRows(result = {}) {
  const affixes = result?.affixesApplied;
  if (!affixes) return [];

  return [
    {
      label: "Критический множитель",
      value: `x${affixes.criticalMult}`,
      visible: Number(affixes.criticalMult ?? 1) > 1,
    },
    {
      label: "Кража жизни",
      value: `+${affixes.lifestolenHp} HP`,
      visible: Number(affixes.lifestolenHp ?? 0) > 0,
    },
    {
      label: "Кровотечение",
      value: `+${affixes.bleedingBonus}`,
      visible: Number(affixes.bleedingBonus ?? 0) > 0,
    },
    {
      label: "Обезоруживание",
      value: "цель обезоружена",
      visible: Boolean(affixes.disarmed),
    },
    {
      label: "Оглушение",
      value: "дополнительное оглушение",
      visible: Boolean(affixes.stunnedExtra),
    },
    {
      label: "Казнь",
      value: "цель добита",
      visible: Boolean(affixes.executed),
    },
  ].filter(row => row.visible !== false).map(row => ({
    ...row,
    className: "is-affix",
  }));
}

function buildAttackStatPills(result = {}, status = {}) {
  return [
    { label: "Результат", value: status.label, className: status.className },
    { label: "Бросок", value: `${result.effectiveRoll ?? 0}/${result.threshold ?? 0}` },
    { label: "Урон", value: result.hit ? Number(result.finalDamage ?? 0) : "-", visible: Boolean(result.hit) },
    { label: "Энергия", value: `-${result.finalEnergyCost}`, visible: Number(result.finalEnergyCost ?? 0) > 0 },
  ].filter(row => row.visible !== false);
}

function buildAttackMetaRows({
  skillKey = "",
  skillLabel = "",
  attacker = null,
  target = null,
  result = {},
  damageTypeLabel = "",
  damageArmorChannelLabel = "",
} = {}) {
  return [
    { label: "Атакующий", value: attacker?.name ?? "—" },
    { label: "Цель", value: target?.name ?? "—" },
    { label: "Навык", value: joinAttackParts([skillLabel || skillKey, skillKey ? `(${skillKey})` : ""], " ") },
    { label: "Режим", value: getAttackModeLabel(result.attackMode), visible: Boolean(result.attackMode) },
    { label: "Тип урона", value: damageTypeLabel, visible: Boolean(damageTypeLabel) },
    { label: "Канал брони", value: damageArmorChannelLabel, visible: Boolean(damageArmorChannelLabel) },
  ].filter(row => row.visible !== false);
}

function buildAttackRollRows(result = {}, rollDesc = "") {
  return [
    { label: "Куб", value: `d${result.dieSize ?? 0}` },
    {
      label: "Бросок",
      value: result.exploded && rollDesc ? `${rollDesc} = ${result.rollTotal}` : result.rollTotal,
    },
    { label: "Штраф", value: `-${result.attackPenalty}`, visible: Number(result.attackPenalty ?? 0) > 0 },
    { label: "Бонус", value: signedAttackNumber(result.hitBonus), visible: Number(result.hitBonus ?? 0) !== 0 },
    { label: "Эффективно", value: result.effectiveRoll },
    { label: "Порог", value: result.threshold },
    { label: "Перевес", value: signedAttackNumber(result.margin), visible: Boolean(result.hit) },
  ].filter(row => row.visible !== false);
}

function buildAttackDamageRows({
  result = {},
  overflowLabel = "",
  armorDur = null,
} = {}) {
  if (!result.hit) {
    return result.locationLabel ? [{
      label: "Зона",
      value: result.locationLabel,
    }] : [];
  }

  const reductionDetails = Number(result.reductionBeforePenetration ?? 0) > Number(result.reduction ?? 0)
    ? joinAttackParts([
        `база ${result.reductionBeforePenetration}`,
        `снято ${result.reductionNegated}`,
        Number(result.armorPenetration ?? 0) > 0 ? `пробито ${result.armorPenetration}` : "",
        Number(result.techPenetration ?? 0) > 0 ? `техника ${result.techPenetration}` : "",
        Number(result.armorLayer?.durabilityLoss ?? 0) > 0 ? `dur -${result.armorLayer.durabilityLoss}` : "",
      ], ", ")
    : "";
  const zoneSource = result.locationRoll ? `d20 ${result.locationRoll}` : "прицельно";

  return [
    { label: "Зона", value: joinAttackParts([result.locationLabel, zoneSource], " · "), visible: Boolean(result.locationLabel) },
    { label: "База", value: result.baseDamage },
    { label: "Сырой урон", value: result.rawDamage },
    {
      label: "Броня",
      value: result.armorItem?.name ?? "нет",
      visible: !result.targetIsMonster,
    },
    {
      label: "Поглощение",
      value: reductionDetails ? `${result.reduction} (${reductionDetails})` : result.reduction,
    },
    { label: "Итоговый урон", value: result.finalDamage, className: "is-damage" },
    { label: "Осталось HP", value: result.remainingHP },
    {
      label: "Переходящий урон",
      value: `${result.overflowDamage} -> ${overflowLabel}`,
      visible: Number(result.overflowDamage ?? 0) > 0,
    },
    {
      label: "Прочность брони",
      value: `${armorDur?.value}/${armorDur?.max}`,
      visible: Boolean(armorDur),
    },
  ].filter(row => row.visible !== false);
}

function buildAttackNoticeRows(result = {}) {
  return [
    ...buildDefenseContextRows(result.defenseContext),
    ...buildShieldBlockRows(result),
    ...buildAttackAffixRows(result),
    {
      label: "Финал",
      value: "цель погибает",
      visible: Boolean(result.targetKilled),
      className: "is-kill",
    },
  ].filter(row => row.visible !== false);
}

export function buildAttackChatData({
  label = "Атака",
  skillKey = "",
  attacker = null,
  target = null,
  result = {},
} = {}) {
  const skillLabel = getSkillLabel(skillKey) || skillKey;
  const damageTypeLabel = getDamageTypeLabel(result?.damageType);
  const damageArmorChannelLabel = getDamageArmorChannelLabel(result?.damageArmorChannel ?? result?.damageType);
  const rollDesc = getAttackRollDesc(result);
  const overflowLabel = getAttackOverflowLabel(result);
  const armorDur = getAttackArmorDurability(result);
  const status = buildAttackStatus(result);
  const cardClass = joinAttackParts([
    status.className,
    result.hit ? "is-hit" : "is-miss",
    result.targetKilled ? "is-kill" : "",
  ], " ");

  return {
    title: label,
    icon: status.icon,
    statusLabel: status.label,
    statusClass: status.className,
    cardClass,
    statPills: buildAttackStatPills(result, status),
    metaRows: buildAttackMetaRows({
      skillKey,
      skillLabel,
      attacker,
      target,
      result,
      damageTypeLabel,
      damageArmorChannelLabel,
    }),
    rollRows: buildAttackRollRows(result, rollDesc),
    damageRows: buildAttackDamageRows({ result, overflowLabel, armorDur }),
    noticeRows: buildAttackNoticeRows(result),
    result,
    rollDesc,
    overflowLabel,
    armorDur,
    damageTypeLabel,
    damageArmorChannelLabel,
  };
}

/**
 * Рендер AttackResult в HTML для ChatMessage через `templates/chat/attack.hbs`.
 *
 * @param {object} args
 * @param {string} args.label
 * @param {string} args.skillKey
 * @param {Actor}  args.attacker
 * @param {Actor}  args.target
 * @param {AttackResult} args.result
 * @returns {Promise<string>}
 */
export async function formatAttackChatHtml({ label, skillKey, attacker, target, result }) {
  const attack = buildAttackChatData({ label, skillKey, attacker, target, result });
  if (typeof globalThis.renderTemplate === "function") {
    return globalThis.renderTemplate(ATTACK_TEMPLATE, { attack });
  }

  return buildCombatChatCard({
    title: attack.title,
    icon: attack.icon,
    status: attack.statusLabel,
    statusClass: attack.statusClass,
    rows: [
      ...attack.metaRows,
      ...attack.rollRows,
      ...attack.damageRows,
    ],
    notices: attack.noticeRows,
    className: `ih-attack-chat-card ${attack.cardClass}`,
  });
}
