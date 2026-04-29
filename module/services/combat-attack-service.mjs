/**
 * Iron Hills — Combat Attack Service
 *
 * Единый «pure» пайплайн single-target атаки. Используется:
 *   - actor-sheet._performAttack
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
  getEncumbranceInfo,
  getActorInjuryInfo,
  getAttackThreshold,
  getFailureDegree,
  getHitLocation,
  getHitLabel,
  getEquippedArmorForLocation,
  getBestResistForZone,
} from "./actor-state-service.mjs";

import { getWeaponAffixes } from "../utils/item-utils.mjs";

// ── Anatomy / overflow ────────────────────────────────────

/**
 * Карта переходящего урона: куда уходит overflow с уничтоженной части тела.
 */
const OVERFLOW_MAP = Object.freeze({
  head:     "torso",
  torso:    "head",
  abdomen:  "torso",
  leftArm:  "torso",
  rightArm: "torso",
  leftLeg:  "abdomen",
  rightLeg: "abdomen",
});

export function getOverflowTarget(locationKey) {
  return OVERFLOW_MAP[locationKey] ?? null;
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
  if (damage <= 0) return { newHP: 0, overflow: 0, overflowTarget: null };
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

  if (absorbed > 0) {
    import("./durability-service.mjs").then(({ wearArmorAtLocation }) => {
      wearArmorAtLocation?.(actor, locationKey, absorbed)?.catch?.(() => {});
    }).catch(() => {});
  }

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
  const hpData = actor.system?.resources?.hp?.[locationKey];
  if (!hpData) return;

  const maxHP = Number(hpData.max ?? 0);
  const halfThreshold = Math.ceil(maxHP / 2);
  if (finalDamage < halfThreshold) return;

  const updates = {};
  updates["system.conditions.bleeding"] =
    Number(actor.system?.conditions?.bleeding ?? 0) + 1 + Math.max(0, Number(bleedingBonus) || 0);

  if (locationKey === "leftArm")  updates["system.conditions.fractures.leftArm"]  = true;
  if (locationKey === "rightArm") updates["system.conditions.fractures.rightArm"] = true;
  if (locationKey === "leftLeg")  updates["system.conditions.fractures.leftLeg"]  = true;
  if (locationKey === "rightLeg") updates["system.conditions.fractures.rightLeg"] = true;

  if (locationKey === "head" || locationKey === "torso" || locationKey === "abdomen") {
    updates["system.conditions.shock"] =
      Number(actor.system?.conditions?.shock ?? 0) + 1;
  }

  if (Object.keys(updates).length) await actor.update(updates);
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
});

function pickRandomLocationFromRoll(roll) {
  const key = getHitLocation(roll);
  return { key, label: getHitLabel(key) };
}

function pickFixedLocation(targetZone) {
  return { key: targetZone, label: ZONE_LABELS[targetZone] ?? targetZone };
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
  } = args;

  if (!attacker || !target) return null;

  const skill = attacker.system?.skills?.[skillKey];
  if (!skill) return null;

  const encumbrance = encInput ?? getEncumbranceInfo(attacker);
  const injuries    = injInput ?? getActorInjuryInfo(attacker);

  const finalEnergyCost = Math.ceil(Number(energyCost || 0) * (encumbrance.energyMultiplier ?? 1));

  // Affixes оружия — пассивные эффекты (T9-T10 артефакты)
  const affixes = getWeaponAffixes(weapon);
  const totalIgnoreArmor = Math.min(0.95, Number(ignoreArmor ?? 0) + affixes.ignoreArmor);

  // Бросок навыка (может быть интерактивным)
  const { total: rollTotal, rolls: rollHistory, exploded } =
    await dieRoller(skill.value);
  const dieSize = Math.max(2, Number(skill.value) * 2);

  // Порог цели
  const targetEquip = target.system?.equipment ?? {};
  const targetLeftHand = targetEquip.leftHand ? target.items?.get(targetEquip.leftHand) : null;
  const targetHasShield = Boolean(
    targetLeftHand?.system?.isShield || targetLeftHand?.type === "armor"
  );

  const targetIsMonster = target.type === "monster";
  const targetArmorTier = targetIsMonster
    ? Number(target.system?.resources?.armor?.physical ?? 0)
    : Number(target.system?.info?.armorTier ?? 0);

  const cond = target.system?.conditions ?? {};
  const threshold = getAttackThreshold(target, {
    hasShield:   targetHasShield,
    isLying:     Boolean(cond.prone),
    isStunned:   Number(cond.stunned ?? 0) > 0,
    targetFeared: Number(cond.feared ?? 0) > 0,
    surroundCount,
    inDarkness:  false,
    armorTierOverride: targetIsMonster ? targetArmorTier : undefined,
  });

  // Штраф атакующего
  const attackPenalty =
    Number(encumbrance.attackPenalty ?? 0) +
    Number(injuries.meleePenalty ?? injuries.attackPenalty ?? 0);
  const hitBonus = Number(hitBonusInput ?? 0);
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
    damageType,
    baseDamage:       Number(baseDamage),
    margin:           0,
    rawDamage:        0,
    finalDamage:      0,
    reduction:        0,
    armorPenetration: 0,
    techPenetration:  0,
    armorItem:        null,
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
  };

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
  if (targetZone) {
    location = pickFixedLocation(targetZone);
  } else {
    const r = await new Roll("1d20").evaluate();
    locationRollValue = r.total;
    location = pickRandomLocationFromRoll(r.total);
  }

  const armorItem = targetIsMonster ? null : getEquippedArmorForLocation(target, location.key);
  let reduction;
  if (targetIsMonster) {
    const monsterPhys = Number(target.system?.resources?.armor?.physical ?? 0);
    const monsterMag  = Number(target.system?.resources?.armor?.magical  ?? 0);
    reduction = damageType === "magical" ? monsterMag : monsterPhys;
  } else {
    reduction = getBestResistForZone(target, location.key, damageType);
  }

  const armorPenetration = margin >= 8 ? Math.floor(margin / 4) : 0;
  const techPenetration  = Math.round(reduction * totalIgnoreArmor);
  const effectiveReduction = Math.max(0, reduction - armorPenetration - techPenetration);
  const finalDamage = Math.max(0, rawDamage - effectiveReduction);

  result.affixesApplied.criticalMult = criticalMultApplied;

  Object.assign(result, {
    margin, rawDamage,
    locationKey: location.key,
    locationLabel: location.label,
    locationRoll: locationRollValue,
    armorItem,
    reduction: effectiveReduction,
    armorPenetration,
    techPenetration,
    finalDamage,
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
    const dmg = await applyDamageToBodyPart(target, location.key, finalDamage, { onLethal });
    result.remainingHP    = dmg.newHP;
    result.overflowDamage = dmg.overflow;
    result.overflowTarget = dmg.overflowTarget;
    if (applyInjuries) {
      await applyInjuryEffects(target, location.key, finalDamage, affixes.bleedingBonus);
      result.affixesApplied.bleedingBonus = affixes.bleedingBonus;
    }
    if ((location.key === "head" || location.key === "torso") && dmg.newHP <= 0) {
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

  // Износ брони цели
  if (wearArmor && !targetIsMonster && armorItem && finalDamage > 0) {
    await wearItem(target, armorItem, 1);
  }

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
        await target.update({ "system.equipment.rightHand": "" });
        result.affixesApplied.disarmed = true;
      }
    }
  }

  // Affix: stunChance — после урона. Добавляет +1 stunned если ещё не есть.
  if (finalDamage > 0 && affixes.stunChance > 0) {
    const r = await new Roll("1d100").evaluate();
    if (r.total <= Math.round(affixes.stunChance * 100)) {
      const cur = Number(target.system?.conditions?.stunned ?? 0);
      await target.update({ "system.conditions.stunned": cur + 1 });
      result.affixesApplied.stunnedExtra = true;
    }
  }

  return result;
}

// ── Chat rendering ─────────────────────────────────────────

const ATTACK_TEMPLATE = "systems/iron-hills-system/templates/chat/attack.hbs";

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
  const rollDesc = (result?.rollHistory ?? [])
    .map(r => `d${r.die}=${r.result}`)
    .join(" → ");

  const overflowLabel = result?.overflowTarget
    ? getHitLabel(result.overflowTarget)
    : "";

  // Прочность брони показываем только для не-монстров с реально сработавшим уроном
  let armorDur = null;
  if (result?.hit && !result?.targetIsMonster && result?.armorItem && result?.finalDamage > 0) {
    const value = Number(result.armorItem.system?.durability?.value ?? 0);
    if (value > 0) {
      armorDur = {
        value,
        max: Number(result.armorItem.system?.durability?.max ?? 100),
      };
    }
  }

  return renderTemplate(ATTACK_TEMPLATE, {
    label,
    skillKey,
    attacker: { name: attacker?.name ?? "—" },
    target:   { name: target?.name   ?? "—" },
    result,
    rollDesc,
    overflowLabel,
    armorDur,
  });
}
