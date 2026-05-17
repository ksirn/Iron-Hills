import {
  getHitLocation,
  getHitLabel,
  resolveDamageHpKey,
} from "./actor-state-service.mjs";
import { applyDamageToBodyPart } from "./combat-attack-service.mjs";
import { getPersistentActor } from "../utils/actor-utils.mjs";

export function getActorConditionValue(actor, key) {
  const raw = actor?.system?.conditions?.[key];

  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;

  if (raw && typeof raw === "object") {
    if (typeof raw.value === "number") return raw.value;
    if (typeof raw.active === "boolean") return raw.active ? 1 : 0;
  }

  return 0;
}

export function buildConditionUpdatePath(key) {
  return `system.conditions.${key}`;
}

const CONDITION_LABELS = Object.freeze({
  bleeding: "Кровотечение",
  poison: "Яд",
  burning: "Горение",
  shock: "Шок",
  stunned: "Оглушение",
  stun: "Оглушение",
  exposed: "Уязвимость",
  pushed: "Отброшен",
  prone: "Повален",
  slowed: "Замедление",
  hasted: "Ускорение",
  feared: "Страх",
  grappled: "Захват",
  sleeping: "Сон",
  disarmed: "Разоружение",
  shield_lost: "Без щита",
  armor_cracked: "Броня треснута",
  broken_limb: "Перелом",
  aimed_shot_bonus: "Прицел",
  formation_stance: "Строй",
  shield_wall_formation: "Стена щитов",
  riposte_ready: "Рипост готов",
  counter_ready: "Контрудар готов",
  intercept_ready: "Перехват готов",
  rapid_reload: "Быстрая перезарядка",
  silence: "Безмолвие",
  slow: "Замедление",
  fear: "Страх",
});

export function getConditionLabel(key) {
  const normalized = String(key ?? "").trim();
  if (!normalized) return "";
  return CONDITION_LABELS[normalized] ?? normalized;
}

const ONGOING_DAMAGE_CONDITIONS = new Set(["bleeding", "poison", "burning"]);
const BODY_PART_KEYS = Object.freeze(["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"]);
const LEGACY_FRACTURE_PART_KEYS = new Set(["leftArm", "rightArm", "leftLeg", "rightLeg"]);
const DEFAULT_BODY_PART_STATUS = Object.freeze({
  minorBleeding: 0,
  majorBleeding: 0,
  fracture: false,
  destroyed: false,
  splinted: false,
  tourniquet: false,
});

function normalizeConditionAmount(key, value, { valueKind = "stack" } = {}) {
  const amount = Math.max(1, Number(value ?? 1));
  if (valueKind === "duration" && ONGOING_DAMAGE_CONDITIONS.has(key)) {
    return Math.max(1, Math.ceil(amount / 6));
  }
  return amount;
}

export async function addOrExtendActorCondition(actor, conditionKey, value = 1, { mode = "max", valueKind = "stack" } = {}) {
  const key = String(conditionKey ?? "").trim();
  if (!actor || !key) {
    return { applied: false, key, previous: 0, value: 0 };
  }

  const previous = Math.max(0, Number(getActorConditionValue(actor, key) || 0));
  const amount = normalizeConditionAmount(key, value, { valueKind });
  const next = mode === "add"
    ? previous + amount
    : Math.max(previous, amount);

  if (next !== previous) {
    await actor.update({ [buildConditionUpdatePath(key)]: next });
  }

  return { applied: next !== previous, key, previous, value: next };
}

function hasBodyHp(actor) {
  return Boolean(actor?.system?.resources?.hp?.torso);
}

function getBodyPartHpNode(actor, partKey) {
  return actor?.system?.resources?.hp?.[partKey] ?? null;
}

function getDefaultBodyPartStatus() {
  return { ...DEFAULT_BODY_PART_STATUS };
}

function buildBodyPartStatusPath(partKey, key) {
  return `system.resources.hp.${partKey}.status.${key}`;
}

function getBodyPartStatusValue(actor, partKey, key) {
  const raw = actor?.system?.resources?.hp?.[partKey]?.status?.[key];

  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  if (raw && typeof raw === "object") {
    if (typeof raw.value === "number") return raw.value;
    if (typeof raw.active === "boolean") return raw.active ? 1 : 0;
  }

  return 0;
}

function getBodyPartStatusBool(actor, partKey, key) {
  return Boolean(getBodyPartStatusValue(actor, partKey, key));
}

function getBodyPartHpValue(actor, partKey) {
  return Number(actor?.system?.resources?.hp?.[partKey]?.value ?? 0);
}

export function hasActorBodyBleeding(actor) {
  if (!hasBodyHp(actor)) return false;
  return BODY_PART_KEYS.some(partKey =>
    Number(getBodyPartStatusValue(actor, partKey, "minorBleeding") || 0) > 0 ||
    (
      Number(getBodyPartStatusValue(actor, partKey, "majorBleeding") || 0) > 0 &&
      !getBodyPartStatusBool(actor, partKey, "tourniquet")
    )
  );
}

export async function ensureActorBodyTraumaStatusStructure(actor) {
  if (!hasBodyHp(actor)) return { changed: false, updates: {} };

  const updates = {};

  for (const partKey of BODY_PART_KEYS) {
    const hpNode = getBodyPartHpNode(actor, partKey);
    if (!hpNode) continue;

    const status = hpNode.status ?? {};
    const merged = {
      ...getDefaultBodyPartStatus(),
      ...status,
    };

    let changed = !hpNode.status;
    for (const key of Object.keys(DEFAULT_BODY_PART_STATUS)) {
      if (status?.[key] !== undefined) continue;
      changed = true;
      break;
    }

    if (
      LEGACY_FRACTURE_PART_KEYS.has(partKey) &&
      actor.system?.conditions?.fractures?.[partKey] &&
      !merged.fracture &&
      !merged.splinted
    ) {
      merged.fracture = true;
      changed = true;
    }

    if (changed) {
      updates[`system.resources.hp.${partKey}.status`] = merged;
    }
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
  }

  return { changed: Object.keys(updates).length > 0, updates };
}

export async function refreshActorBodyTraumaStatus(actor) {
  if (!hasBodyHp(actor)) return { changed: false, updates: {} };

  const updates = {};

  for (const partKey of BODY_PART_KEYS) {
    const hpNode = actor.system?.resources?.hp?.[partKey];
    if (!hpNode) continue;

    const isDestroyed = Number(hpNode.value ?? 0) <= 0;
    const currentFlag = Boolean(hpNode.status?.destroyed);
    const majorBleeding = Math.max(0, Number(getBodyPartStatusValue(actor, partKey, "majorBleeding") || 0));
    const hasTourniquet = getBodyPartStatusBool(actor, partKey, "tourniquet");

    if (isDestroyed !== currentFlag) {
      updates[buildBodyPartStatusPath(partKey, "destroyed")] = isDestroyed;
    }

    if (hasTourniquet && majorBleeding <= 0) {
      updates[buildBodyPartStatusPath(partKey, "tourniquet")] = false;
    }
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
  }

  return { changed: Object.keys(updates).length > 0, updates };
}

function getMedicalPower(power) {
  return Math.max(1, Number(power || 1));
}

function getMedicalTargetActor(targetActor) {
  return getPersistentActor(targetActor) ?? targetActor ?? null;
}

function getMedicalItemName(item) {
  return item?.name ?? "предмет";
}

function medicalResult({ ok = true, handled = true, consumeItem = false } = {}) {
  return { ok, handled, consumeItem };
}

function notifyMedicalWarn(message) {
  ui.notifications.warn(message);
}

function notifyMedicalInfo(message) {
  ui.notifications.info(message);
}

async function createMedicalChat(sourceActor, targetActor, item, lines, {
  verb = "использует",
  targetPreposition = "на",
} = {}) {
  const actorName = sourceActor?.name ?? "Кто-то";
  const targetName = targetActor?.name ?? "цель";
  const itemName = getMedicalItemName(item);
  const body = Array.isArray(lines) ? lines.filter(Boolean).join("<br>") : String(lines ?? "");

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
    content: `<b>${actorName}</b> ${verb} <b>${itemName}</b> ${targetPreposition} <b>${targetName}</b><br>${body}`,
  });
}

function missingMedicalTargetResult() {
  notifyMedicalWarn("Цель лечения не найдена.");
  return medicalResult({ ok: false });
}

function invalidMedicalPartResult(targetPart) {
  const label = targetPart ? getHitLabel(targetPart) : "Зона тела";
  notifyMedicalWarn(`${label}: зона лечения не найдена.`);
  return medicalResult();
}

function getBodyPartStatusNode(actor, partKey) {
  return actor?.system?.resources?.hp?.[partKey]?.status ?? {};
}

function getBodyPartHpSnapshot(actor, partKey) {
  const hpNode = actor?.system?.resources?.hp?.[partKey] ?? {};
  return {
    value: Number(hpNode.value ?? 0),
    max: Number(hpNode.max ?? 0),
    status: hpNode.status ?? {},
  };
}

export async function applyMedicalActionToBodyPart(sourceActor, targetActor, item, actionType, targetPart, power = 1) {
  targetActor = getMedicalTargetActor(targetActor);
  if (!targetActor) return missingMedicalTargetResult();
  if (!targetPart || !getBodyPartHpNode(targetActor, targetPart)) return invalidMedicalPartResult(targetPart);

  await ensureActorBodyTraumaStatusStructure(targetActor);

  const partLabel = getHitLabel(targetPart);
  const amount = getMedicalPower(power);
  const status = getBodyPartStatusNode(targetActor, targetPart);

  if (actionType === "bandage") {
    const currentMinor = Math.max(0, Number(status?.minorBleeding ?? 0));

    if (currentMinor <= 0) {
      notifyMedicalWarn(`${partLabel}: нет малого кровотечения.`);
      await createMedicalChat(sourceActor, targetActor, item, [
        partLabel,
        "Малое кровотечение отсутствует",
      ]);
      return medicalResult({ consumeItem: false });
    }

    const nextMinor = Math.max(0, currentMinor - amount);
    await targetActor.update({
      [buildBodyPartStatusPath(targetPart, "minorBleeding")]: nextMinor,
    });

    await createMedicalChat(sourceActor, targetActor, item, [
      partLabel,
      `Малое кровотечение уменьшено на ${currentMinor - nextMinor}`,
    ]);

    return medicalResult({ consumeItem: true });
  }

  if (actionType === "tourniquet") {
    const currentMajor = Math.max(0, Number(status?.majorBleeding ?? 0));

    if (currentMajor <= 0) {
      notifyMedicalWarn(`${partLabel}: нет сильного кровотечения.`);
      await createMedicalChat(sourceActor, targetActor, item, [
        partLabel,
        "Сильное кровотечение отсутствует",
      ]);
      return medicalResult({ consumeItem: false });
    }

    const nextMajor = Math.max(0, currentMajor - amount);
    await targetActor.update({
      [buildBodyPartStatusPath(targetPart, "majorBleeding")]: nextMajor,
      [buildBodyPartStatusPath(targetPart, "tourniquet")]: nextMajor > 0,
    });

    const resultLine = nextMajor > 0
      ? "Наложен жгут"
      : "Сильное кровотечение остановлено";

    await createMedicalChat(sourceActor, targetActor, item, [
      partLabel,
      `Сильное кровотечение уменьшено на ${currentMajor - nextMajor}`,
      resultLine,
    ], { verb: "накладывает" });

    return medicalResult({ consumeItem: true });
  }

  if (actionType === "splint") {
    const hadFracture = Boolean(status?.fracture);
    const alreadySplinted = Boolean(status?.splinted);

    if (!hadFracture && alreadySplinted) {
      notifyMedicalWarn(`${partLabel} уже стабилизирована.`);
      return medicalResult({ consumeItem: false });
    }

    if (!hadFracture && !alreadySplinted) {
      notifyMedicalWarn(`${partLabel}: перелом отсутствует.`);
      return medicalResult({ consumeItem: false });
    }

    const updates = {
      [buildBodyPartStatusPath(targetPart, "splinted")]: true,
      [buildBodyPartStatusPath(targetPart, "fracture")]: false,
    };

    if (LEGACY_FRACTURE_PART_KEYS.has(targetPart)) {
      updates[`system.conditions.fractures.${targetPart}`] = false;
    }

    await targetActor.update(updates);
    await createMedicalChat(sourceActor, targetActor, item, [
      partLabel,
      "Перелом стабилизирован",
    ]);

    return medicalResult({ consumeItem: true });
  }

  if (actionType === "surgery") {
    const { value: currentHp, max: maxHp } = getBodyPartHpSnapshot(targetActor, targetPart);
    const hasDestroyed = Boolean(status?.destroyed);
    const hasFracture = Boolean(status?.fracture);
    const hasMinor = Number(status?.minorBleeding ?? 0) > 0;
    const hasMajor = Number(status?.majorBleeding ?? 0) > 0;

    if (!hasDestroyed && !hasFracture && !hasMinor && !hasMajor && currentHp >= maxHp) {
      notifyMedicalWarn(`${partLabel}: тяжёлое лечение не требуется.`);
      return medicalResult({ consumeItem: false });
    }

    const nextHp = currentHp <= 0
      ? Math.min(maxHp, amount)
      : Math.min(maxHp, currentHp + amount);

    const updates = {
      [buildBodyPartStatusPath(targetPart, "destroyed")]: false,
      [buildBodyPartStatusPath(targetPart, "fracture")]: false,
      [buildBodyPartStatusPath(targetPart, "splinted")]: false,
      [buildBodyPartStatusPath(targetPart, "tourniquet")]: false,
      [buildBodyPartStatusPath(targetPart, "majorBleeding")]: 0,
      [buildBodyPartStatusPath(targetPart, "minorBleeding")]: 0,
      [`system.resources.hp.${targetPart}.value`]: nextHp,
    };

    if (LEGACY_FRACTURE_PART_KEYS.has(targetPart)) {
      updates[`system.conditions.fractures.${targetPart}`] = false;
    }

    await targetActor.update(updates);
    await createMedicalChat(sourceActor, targetActor, item, [
      partLabel,
      "Проведена тяжёлая медицинская обработка",
    ], { verb: "применяет", targetPreposition: "к" });

    return medicalResult({ consumeItem: true });
  }

  if (actionType === "heal-part") {
    const { value: currentHp, max: maxHp } = getBodyPartHpSnapshot(targetActor, targetPart);

    if (currentHp >= maxHp) {
      if (currentHp > 0 && status?.destroyed) {
        await targetActor.update({
          [buildBodyPartStatusPath(targetPart, "destroyed")]: false,
        });
      }
      notifyMedicalWarn(`${partLabel} уже полностью восстановлена.`);
      return medicalResult({ consumeItem: false });
    }

    const nextHp = Math.min(maxHp, currentHp + amount);
    const updates = {
      [`system.resources.hp.${targetPart}.value`]: nextHp,
    };

    if (nextHp > 0) {
      updates[buildBodyPartStatusPath(targetPart, "destroyed")] = false;
    }

    await targetActor.update(updates);
    await createMedicalChat(sourceActor, targetActor, item, [
      partLabel,
      `Восстановлено ${nextHp - currentHp} HP`,
    ]);

    return medicalResult({ consumeItem: true });
  }

  return medicalResult({ handled: false });
}

async function restoreBoundedActorResource(sourceActor, targetActor, item, resourceKey, label, power, { maxFallback = 0 } = {}) {
  const current = Number(targetActor.system?.resources?.[resourceKey]?.value ?? 0);
  const max = Number(targetActor.system?.resources?.[resourceKey]?.max ?? maxFallback);
  const next = Math.min(max, current + getMedicalPower(power));

  await targetActor.update({
    [`system.resources.${resourceKey}.value`]: next,
  });

  await createMedicalChat(sourceActor, targetActor, item, `${label} восстановлена на ${next - current}`);
  return medicalResult({ consumeItem: true });
}

export async function applyMedicalActionGlobally(sourceActor, targetActor, item, actionType, power = 1) {
  targetActor = getMedicalTargetActor(targetActor);
  if (!targetActor) return missingMedicalTargetResult();

  const resources = targetActor.system?.resources ?? {};
  const amount = getMedicalPower(power);

  if (actionType === "restore-energy") {
    return restoreBoundedActorResource(sourceActor, targetActor, item, "energy", "Энергия", power);
  }

  if (actionType === "restore-energy-max") {
    const baseMax = Number(resources.energy?.baseMax ?? resources.energy?.max ?? 10);
    const currentMax = Number(resources.energy?.max ?? baseMax);
    const current = Number(resources.energy?.value ?? 0);
    const nextMax = Math.min(baseMax, currentMax + amount);
    const nextCurrent = Math.min(nextMax, current + amount);

    await targetActor.update({
      "system.resources.energy.max": nextMax,
      "system.resources.energy.value": nextCurrent,
    });

    await createMedicalChat(sourceActor, targetActor, item, `Максимум энергии: ${currentMax} → ${nextMax}`);
    return medicalResult({ consumeItem: true });
  }

  if (actionType === "restore-mana") {
    return restoreBoundedActorResource(sourceActor, targetActor, item, "mana", "Мана", power);
  }

  if (actionType === "restore-hydration") {
    return restoreBoundedActorResource(sourceActor, targetActor, item, "hydration", "Жажда", power, { maxFallback: 100 });
  }

  if (actionType === "restore-satiety") {
    return restoreBoundedActorResource(sourceActor, targetActor, item, "satiety", "Сытость", power, { maxFallback: 100 });
  }

  if (actionType === "cure-poison") {
    await targetActor.update({ "system.conditions.poison": 0 });
    await createMedicalChat(sourceActor, targetActor, item, "Яд нейтрализован");
    return medicalResult({ consumeItem: true });
  }

  if (actionType === "cure-disease") {
    const diseases = foundry.utils.deepClone(targetActor.system?.diseases ?? {});
    const active = Object.entries(diseases).filter(([, disease]) => disease?.stage >= 0);
    if (active.length) {
      const [key] = active[Math.floor(Math.random() * active.length)];
      diseases[key] = { ...diseases[key], stage: -1 };
      await targetActor.update({ "system.diseases": diseases });
    }

    await createMedicalChat(
      sourceActor,
      targetActor,
      item,
      active.length ? "Болезнь снята" : "Активная болезнь не найдена"
    );

    return medicalResult({ consumeItem: active.length > 0 });
  }

  if (actionType === "heal-body") {
    const hp = targetActor.system?.resources?.hp ?? {};
    const updates = {};
    let totalRestored = 0;

    for (const partKey of BODY_PART_KEYS) {
      if (!hp?.[partKey]) continue;
      const current = Number(hp?.[partKey]?.value ?? 0);
      const max = Number(hp?.[partKey]?.max ?? 0);
      const next = Math.min(max, current + amount);
      if (next !== current) {
        updates[`system.resources.hp.${partKey}.value`] = next;
        totalRestored += Math.max(0, next - current);
      }
      if (next > 0 && hp?.[partKey]?.status?.destroyed) {
        updates[buildBodyPartStatusPath(partKey, "destroyed")] = false;
      }
    }

    if (!totalRestored) {
      if (Object.keys(updates).length) await targetActor.update(updates);
      notifyMedicalWarn("Тело уже полностью восстановлено.");
      return medicalResult({ consumeItem: false });
    }

    await targetActor.update(updates);
    await createMedicalChat(sourceActor, targetActor, item, `Тело получает общее восстановление: ${totalRestored} HP`);
    return medicalResult({ consumeItem: true });
  }

  if (actionType === "stop-minor-bleeding-global") {
    const hp = targetActor.system?.resources?.hp ?? {};
    const updates = {};
    let stopped = 0;

    for (const partKey of BODY_PART_KEYS) {
      if (!hp?.[partKey]) continue;
      const currentMinor = Math.max(0, Number(hp?.[partKey]?.status?.minorBleeding ?? 0));
      if (currentMinor <= 0) continue;
      stopped += currentMinor;
      updates[buildBodyPartStatusPath(partKey, "minorBleeding")] = 0;
    }

    if (!stopped) {
      notifyMedicalWarn("Малых кровотечений не найдено.");
      return medicalResult({ consumeItem: false });
    }

    await targetActor.update(updates);
    await createMedicalChat(sourceActor, targetActor, item, `Малые кровотечения остановлены: ${stopped}`);
    return medicalResult({ consumeItem: true });
  }

  if (actionType === "stabilize-body") {
    const hp = targetActor.system?.resources?.hp ?? {};
    const updates = {};
    let stopped = 0;
    let cleanedTourniquets = 0;

    for (const partKey of BODY_PART_KEYS) {
      if (!hp?.[partKey]) continue;
      const status = hp?.[partKey]?.status ?? {};
      const currentMinor = Math.max(0, Number(status.minorBleeding ?? 0));
      const currentMajor = Math.max(0, Number(status.majorBleeding ?? 0));
      const hasTourniquet = Boolean(status.tourniquet);

      if (currentMinor > 0) {
        stopped += currentMinor;
        updates[buildBodyPartStatusPath(partKey, "minorBleeding")] = 0;
      }
      if (currentMajor > 0) {
        stopped += currentMajor;
        updates[buildBodyPartStatusPath(partKey, "majorBleeding")] = 0;
      }
      if (hasTourniquet) {
        cleanedTourniquets += 1;
        updates[buildBodyPartStatusPath(partKey, "tourniquet")] = false;
      }
    }

    if (!stopped) {
      if (Object.keys(updates).length) {
        await targetActor.update(updates);
        notifyMedicalInfo("Лишние жгуты сняты, активных кровотечений нет.");
      } else {
        notifyMedicalWarn("Активных кровотечений не найдено.");
      }
      return medicalResult({ consumeItem: false });
    }

    await targetActor.update(updates);
    await createMedicalChat(
      sourceActor,
      targetActor,
      item,
      `Общее состояние тела стабилизировано: ${stopped} кровотеч., жгутов снято: ${cleanedTourniquets}`
    );
    return medicalResult({ consumeItem: true });
  }

  return medicalResult({ handled: false });
}

async function applyFlatHpDamage(actor, damage, { onLethal = null } = {}) {
  const current = Number(actor?.system?.resources?.hp?.value ?? 0);
  const next = Math.max(0, current - Math.max(0, Number(damage) || 0));
  await actor.update({ "system.resources.hp.value": next });
  if (current > 0 && next <= 0) {
    try { await onLethal?.(actor); }
    catch (err) { console.warn("Iron Hills | condition onLethal callback failed", err); }
  }
  return { newHP: next, overflow: 0, overflowTarget: null };
}

async function applyConditionDamage(actor, locationKey, damage, { onLethal = null } = {}) {
  if (damage <= 0) return { newHP: 0, overflow: 0, overflowTarget: null };
  if (!actor?.system?.resources?.hp) return { newHP: 0, overflow: 0, overflowTarget: null };
  if (!hasBodyHp(actor)) return applyFlatHpDamage(actor, damage, { onLethal });
  return applyDamageToBodyPart(actor, locationKey, damage, { onLethal });
}

async function rollBurningLocation() {
  const roll = await new Roll("1d20").evaluate();
  const rolledZone = getHitLocation(roll.total);
  return {
    rolledZone,
    damageKey: resolveDamageHpKey(rolledZone) ?? rolledZone,
    label: getHitLabel(rolledZone),
  };
}

function effectChatLine(effect) {
  const location = effect.locationLabel ? ` (${effect.locationLabel})` : "";
  return `<p><b>${effect.label}:</b> ${effect.damage} урона${location}. Осталось HP: ${effect.remainingHP}</p>`;
}

function effectLogText(actor, effect) {
  const location = effect.locationLabel ? ` (${effect.locationLabel})` : "";
  return `${actor.name} теряет ${effect.damage} HP: ${effect.label}${location}.`;
}

export async function tickActorOngoingDamage(actor, {
  bleeding = true,
  poison = true,
  burning = true,
  decrement = true,
  onLethal = null,
} = {}) {
  if (!actor) return { changed: false, effects: [], updates: {} };

  const updates = {};
  const effects = [];

  const addEffect = (effect) => {
    const normalized = {
      ...effect,
      chatHtml: effect.chatHtml ?? effectChatLine(effect),
      logText: effect.logText ?? effectLogText(actor, effect),
    };
    effects.push(normalized);
  };

  const bleedValue = Math.max(0, Number(getActorConditionValue(actor, "bleeding") || 0));
  if (bleeding && bleedValue > 0) {
    const result = await applyConditionDamage(actor, "torso", bleedValue, { onLethal });
    addEffect({
      key: "bleeding",
      label: "Кровотечение",
      damage: bleedValue,
      locationKey: "torso",
      locationLabel: "Торс",
      remainingHP: result.newHP,
    });
    if (decrement) updates[buildConditionUpdatePath("bleeding")] = Math.max(0, bleedValue - 1);
  }

  const poisonValue = Math.max(0, Number(getActorConditionValue(actor, "poison") || 0));
  if (poison && poisonValue > 0) {
    const result = await applyConditionDamage(actor, "torso", poisonValue, { onLethal });
    addEffect({
      key: "poison",
      label: "Яд",
      damage: poisonValue,
      locationKey: "torso",
      locationLabel: "Торс",
      remainingHP: result.newHP,
    });
    if (decrement) updates[buildConditionUpdatePath("poison")] = Math.max(0, poisonValue - 1);
  }

  const burningValue = Math.max(0, Number(getActorConditionValue(actor, "burning") || 0));
  if (burning && burningValue > 0) {
    const location = hasBodyHp(actor)
      ? await rollBurningLocation()
      : { rolledZone: "", damageKey: "", label: "" };
    const result = await applyConditionDamage(actor, location.damageKey || "torso", burningValue, { onLethal });
    addEffect({
      key: "burning",
      label: "Горение",
      damage: burningValue,
      locationKey: location.rolledZone || "body",
      locationLabel: location.label || "",
      remainingHP: result.newHP,
    });
    if (decrement) updates[buildConditionUpdatePath("burning")] = Math.max(0, burningValue - 1);
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
  }

  return {
    changed: effects.length > 0 || Object.keys(updates).length > 0,
    effects,
    updates,
  };
}

export async function tickActorBodyTrauma(actor, {
  minorBleeding = true,
  majorBleeding = true,
  onLethal = null,
} = {}) {
  if (!actor || !hasBodyHp(actor)) return { changed: false, effects: [], updates: {} };

  const effects = [];

  const addEffect = (effect) => {
    effects.push({
      ...effect,
      chatHtml: effect.chatHtml ?? effectChatLine(effect),
      logText: effect.logText ?? effectLogText(actor, effect),
    });
  };

  for (const partKey of BODY_PART_KEYS) {
    const currentHp = getBodyPartHpValue(actor, partKey);
    const label = getHitLabel(partKey);
    const minor = Math.max(0, Number(getBodyPartStatusValue(actor, partKey, "minorBleeding") || 0));
    const major = Math.max(0, Number(getBodyPartStatusValue(actor, partKey, "majorBleeding") || 0));
    const hasTourniquet = getBodyPartStatusBool(actor, partKey, "tourniquet");

    if (currentHp <= 0 && minor <= 0 && (major <= 0 || hasTourniquet)) continue;

    if (minorBleeding && minor > 0) {
      const result = await applyConditionDamage(actor, partKey, minor, { onLethal });
      addEffect({
        key: "minorBleeding",
        label: "Малое кровотечение",
        damage: minor,
        locationKey: partKey,
        locationLabel: label,
        remainingHP: result.newHP,
      });

      if (currentHp > 0 && result.newHP <= 0) {
        addEffect({
          key: "destroyed",
          label: "Травма",
          damage: 0,
          locationKey: partKey,
          locationLabel: label,
          remainingHP: 0,
          chatHtml: `<p><b>Травма:</b> ${label} выведена из строя.</p>`,
          logText: `${actor.name}: ${label} выведена из строя (малое кровотечение).`,
        });
      }
    }

    const afterMinorHp = getBodyPartHpValue(actor, partKey);
    if (majorBleeding && major > 0 && !hasTourniquet) {
      const damage = major * 2;
      const result = await applyConditionDamage(actor, partKey, damage, { onLethal });
      addEffect({
        key: "majorBleeding",
        label: "Сильное кровотечение",
        damage,
        locationKey: partKey,
        locationLabel: label,
        remainingHP: result.newHP,
      });

      if (afterMinorHp > 0 && result.newHP <= 0) {
        addEffect({
          key: "destroyed",
          label: "Травма",
          damage: 0,
          locationKey: partKey,
          locationLabel: label,
          remainingHP: 0,
          chatHtml: `<p><b>Травма:</b> ${label} выведена из строя.</p>`,
          logText: `${actor.name}: ${label} выведена из строя (сильное кровотечение).`,
        });
      }
    }
  }

  const status = await refreshActorBodyTraumaStatus(actor);

  return {
    changed: effects.length > 0 || Boolean(status.changed),
    effects,
    updates: status.updates ?? {},
  };
}

export function buildConditionTickChatHtml(actor, effects) {
  return `<h3>Эффекты: ${actor?.name ?? ""}</h3>${effects.map(e => e.chatHtml).join("")}`;
}

export async function applyActorConditionTick(actor, {
  onLethal = null,
  notifyEmpty = true,
  createChat = true,
} = {}) {
  if (!actor) {
    return {
      changed: false,
      effects: [],
      traumaTick: null,
      conditionTick: null,
    };
  }

  const traumaTick = await tickActorBodyTrauma(actor, { onLethal });
  const conditionTick = await tickActorOngoingDamage(actor, {
    bleeding: !hasActorBodyBleeding(actor),
    onLethal,
  });
  const effects = [
    ...(traumaTick.effects ?? []),
    ...(conditionTick.effects ?? []),
  ];

  if (!effects.length) {
    if (notifyEmpty) ui.notifications.info("Активных эффектов нет");
    return {
      changed: false,
      effects,
      traumaTick,
      conditionTick,
    };
  }

  if (createChat) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildConditionTickChatHtml(actor, effects),
    });
  }

  return {
    changed: true,
    effects,
    traumaTick,
    conditionTick,
  };
}

export async function markActorDead(actor) {
  if (!actor || actor.type !== "character") {
    return { ok: false, changed: false };
  }

  const soulReserve = actor.system?.resources?.soulReserve;
  if (soulReserve?.isDead) {
    return { ok: true, changed: false };
  }

  await actor.update({
    "system.resources.soulReserve.isDead": true,
    "system.resources.soulReserve.daysSinceDeath": 1,
  });

  await ChatMessage.create({
    content: `
      <div style="border:1px solid rgba(239,68,68,0.4);border-radius:8px;padding:10px;background:rgba(239,68,68,0.06);">
        <b>☠ ${actor.name} погиб.</b><br>
        Резерв души начинает угасать по 1 единице в день.<br>
        <small>Воскресите персонажа пока резерв маны и энергии не иссяк.</small>
      </div>
    `,
  });

  return { ok: true, changed: true };
}

export async function reviveActor(actor, quality = 1) {
  if (!actor || actor.type !== "character") {
    return { ok: false, changed: false };
  }

  const normalizedQuality = Number(quality) || 1;
  const hpRestorePct = Math.min(1, normalizedQuality / 10);
  const updates = {
    "system.resources.soulReserve.isDead": false,
    "system.resources.soulReserve.daysSinceDeath": 0,
  };

  for (const partKey of BODY_PART_KEYS) {
    const max = Number(actor.system?.resources?.hp?.[partKey]?.max ?? 0);
    if (!max) continue;
    updates[`system.resources.hp.${partKey}.value`] = Math.max(1, Math.floor(max * hpRestorePct));
    updates[`system.resources.hp.${partKey}.status.destroyed`] = false;
  }

  await actor.update(updates);

  const qualityLabel = normalizedQuality >= 8
    ? "Отличное"
    : normalizedQuality >= 5
      ? "Хорошее"
      : "Слабое";

  await ChatMessage.create({
    content: `
      <b>✦ ${actor.name} воскрешён.</b> Качество: ${qualityLabel} (ступень ${normalizedQuality})<br>
      HP восстановлено на ${Math.round(hpRestorePct * 100)}%.
      ${normalizedQuality <= 3 ? "<br><small>⚠ Персонаж ослаблен — могут быть дебафы.</small>" : ""}
    `,
  });

  return { ok: true, changed: true };
}

export async function cureActorDisease(actor, diseaseKey) {
  if (!actor || !diseaseKey) {
    return { ok: false, changed: false };
  }

  const diseases = foundry.utils.deepClone(actor.system?.diseases ?? {});
  if (!diseases[diseaseKey]) {
    return { ok: true, changed: false };
  }

  diseases[diseaseKey] = { stage: -1, progress: 0, duration: 0 };
  await actor.update({ "system.diseases": diseases });

  const { DISEASES } = await import("../constants/diseases.mjs");
  const def = DISEASES[diseaseKey];
  await ChatMessage.create({
    content: `✅ <b>${actor.name}</b> вылечен от: <b>${def?.label ?? diseaseKey}</b>`,
    speaker: ChatMessage.getSpeaker({ actor }),
  });

  return { ok: true, changed: true };
}

function restResult({
  ok = true,
  changed = false,
  reason = "",
  shortRest = false,
  fullRest = false,
} = {}) {
  return { ok, changed, reason, shortRest, fullRest };
}

export async function applyActorShortRest(actor) {
  if (!actor?.system?.resources?.energy) {
    return restResult({ ok: false, reason: "У актёра нет ресурса энергии." });
  }

  const endurance = Number(actor.system.skills?.endurance?.value ?? 1);
  const bleeding = Number(actor.system.conditions?.bleeding ?? 0);
  const currentEnergy = Number(actor.system.resources.energy.value ?? 0);
  const maxEnergy = Number(actor.system.resources.energy.max ?? 100);
  const currentMana = Number(actor.system.resources.mana?.value ?? 0);
  const maxMana = Number(actor.system.resources.mana?.max ?? 50);

  const restoredEnergy = Math.max(0, 20 + endurance * 2 - bleeding * 2);
  const restoredMana = Math.max(0, 10 + Math.floor(endurance / 2));
  const newEnergy = Math.min(maxEnergy, currentEnergy + restoredEnergy);
  const newMana = Math.min(maxMana, currentMana + restoredMana);

  await actor.update({
    "system.resources.energy.value": newEnergy,
    "system.resources.mana.value": newMana,
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<b>${actor.name}</b> делает короткий отдых.<br>Энергия: +${restoredEnergy}<br>Мана: +${restoredMana}`,
  });

  return restResult({ changed: true, shortRest: true });
}

export async function applyActorFullRest(actor) {
  if (!actor?.system?.resources?.energy) {
    return restResult({ ok: false, reason: "У актёра нет ресурса энергии." });
  }

  const maxEnergy = Number(actor.system.resources.energy.max ?? 100);
  const maxMana = Number(actor.system.resources.mana?.max ?? 50);
  const currentBleeding = Number(actor.system.conditions?.bleeding ?? 0);
  const currentPoison = Number(actor.system.conditions?.poison ?? 0);
  const currentBurning = Number(actor.system.conditions?.burning ?? 0);

  if (hasActorBodyBleeding(actor) || currentBleeding > 0) {
    const reason = "Нельзя полноценно отдохнуть: сначала останови кровотечение.";
    ui.notifications.warn(reason);
    return restResult({ ok: false, reason });
  }

  if (currentBurning > 0) {
    const reason = "Нельзя полноценно отдохнуть: персонаж горит.";
    ui.notifications.warn(reason);
    return restResult({ ok: false, reason });
  }

  await actor.update({
    "system.resources.energy.value": maxEnergy,
    "system.resources.mana.value": maxMana,
    "system.conditions.shock": 0,
    "system.conditions.poison": Math.max(0, currentPoison - 1),
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<b>${actor.name}</b> делает полный отдых.<br>Энергия и мана восстановлены, шок снижен насколько позволяют травмы, яд ослаблен.`,
  });

  return restResult({ changed: true, fullRest: true });
}
