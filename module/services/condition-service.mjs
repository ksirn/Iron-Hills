import {
  getHitLocation,
  getHitLabel,
  resolveDamageHpKey,
  syncDerivedConditionsFromTrauma,
} from "./actor-state-service.mjs";
import { applyDamageToBodyPart } from "./combat-attack-service.mjs";
import { getPersistentActor } from "../utils/actor-utils.mjs";
import {
  actorHasBodyHp,
  BODY_TRAUMA_PART_KEYS,
  buildActorRestProfile,
  DEFAULT_BODY_TRAUMA_STATUS,
  getActorBodyTraumaSummary,
  getBodyPartHpNode as readBodyPartHpNode,
  getBodyPartStatusBool as readBodyPartStatusBool,
  getBodyPartStatusValue as readBodyPartStatusValue,
  LEGACY_TRAUMA_FRACTURE_PART_KEYS,
} from "./body-trauma-service.mjs";
import {
  getConditionDefaultMode,
  getConditionDefaultValueKind,
  getConditionLabel as getPolicyConditionLabel,
  getConditionStorageKey,
  getTurnStartDecayConditionKeys,
  getTurnStartSkipConditionDefinitions,
  normalizeConditionAmount as normalizePolicyConditionAmount,
  normalizeConditionKey,
} from "./condition-policy-service.mjs";
import { buildCombatChatCard } from "./combat-chat-service.mjs";

const SYSTEM_ID = "iron-hills-system";
const DEFAULT_TURN_SECONDS = 6;
const FULL_REST_EXTRA_CLEAR_CONDITIONS = Object.freeze([
  "silencedUntil",
  "slowPenalty",
]);
const FULL_REST_PERSISTENT_CONDITIONS = new Set([
  "bleeding",
  "poison",
  "burning",
  "shock",
]);

export function getActorConditionValue(actor, key) {
  const raw = actor?.system?.conditions?.[getConditionStorageKey(key)];

  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;

  if (raw && typeof raw === "object") {
    if (typeof raw.value === "number") return raw.value;
    if (typeof raw.active === "boolean") return raw.active ? 1 : 0;
  }

  return 0;
}

export function buildConditionUpdatePath(key) {
  return `system.conditions.${getConditionStorageKey(key)}`;
}

export function getConditionLabel(key) {
  const normalized = normalizeConditionKey(key);
  if (!normalized) return "";
  return getPolicyConditionLabel(normalized) ?? normalized;
}

const BODY_PART_KEYS = BODY_TRAUMA_PART_KEYS;
const LEGACY_FRACTURE_PART_KEYS = LEGACY_TRAUMA_FRACTURE_PART_KEYS;
const DEFAULT_BODY_PART_STATUS = DEFAULT_BODY_TRAUMA_STATUS;

function normalizeConditionAmount(key, value, { valueKind = "stack" } = {}) {
  return normalizePolicyConditionAmount(key, value, { valueKind });
}

export async function addOrExtendActorCondition(actor, conditionKey, value = 1, { mode = null, valueKind = null } = {}) {
  const key = normalizeConditionKey(conditionKey);
  if (!actor || !key) {
    return { applied: false, key, previous: 0, value: 0 };
  }

  const resolvedMode = mode ?? getConditionDefaultMode(key);
  const resolvedValueKind = valueKind ?? getConditionDefaultValueKind(key);
  const storageKey = getConditionStorageKey(key);
  const previous = Math.max(0, Number(getActorConditionValue(actor, key) || 0));
  const amount = normalizeConditionAmount(key, value, { valueKind: resolvedValueKind });
  const next = resolvedMode === "add"
    ? previous + amount
    : Math.max(previous, amount);

  if (next !== previous) {
    await actor.update({ [buildConditionUpdatePath(storageKey)]: next });
  }

  return { applied: next !== previous, key, storageKey, previous, value: next };
}

function hasBodyHp(actor) {
  return actorHasBodyHp(actor);
}

function getBodyPartHpNode(actor, partKey) {
  return readBodyPartHpNode(actor, partKey);
}

function getDefaultBodyPartStatus() {
  return { ...DEFAULT_BODY_PART_STATUS };
}

function buildBodyPartStatusPath(partKey, key) {
  return `system.resources.hp.${partKey}.status.${key}`;
}

function getBodyPartStatusValue(actor, partKey, key) {
  return readBodyPartStatusValue(actor, partKey, key);
}

function getBodyPartStatusBool(actor, partKey, key) {
  return readBodyPartStatusBool(actor, partKey, key);
}

function getBodyPartHpValue(actor, partKey) {
  return Number(actor?.system?.resources?.hp?.[partKey]?.value ?? 0);
}

export function hasActorBodyBleeding(actor) {
  return Boolean(hasBodyHp(actor) && getActorBodyTraumaSummary(actor).hasActiveBleeding);
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
      !merged.fracture
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
  try {
    return getPersistentActor(targetActor) ?? targetActor ?? null;
  } catch {
    return targetActor ?? null;
  }
}

function getMedicalItemName(item) {
  return item?.name ?? "предмет";
}

function medicalResult({ ok = true, handled = true, consumeItem = false } = {}) {
  return { ok, handled, consumeItem };
}

function notifyMedicalWarn(message) {
  globalThis.ui?.notifications?.warn?.(message);
}

function notifyMedicalInfo(message) {
  globalThis.ui?.notifications?.info?.(message);
}

async function finalizeActorTraumaState(actor) {
  if (!actor || !hasBodyHp(actor)) return { changed: false };

  const refreshed = await refreshActorBodyTraumaStatus(actor);
  const synced = await syncDerivedConditionsFromTrauma(actor, { render: false });

  return {
    changed: Boolean(refreshed?.changed || synced?.changed),
    refreshed,
    synced,
  };
}

async function updateActorTraumaState(actor, updates) {
  if (updates && Object.keys(updates).length) {
    await actor.update(updates);
  }
  return finalizeActorTraumaState(actor);
}

async function createMedicalChat(sourceActor, targetActor, item, lines, {
  verb = "использует",
  targetPreposition = "на",
} = {}) {
  const actorName = sourceActor?.name ?? "Кто-то";
  const targetName = targetActor?.name ?? "цель";
  const itemName = getMedicalItemName(item);
  const body = Array.isArray(lines) ? lines.filter(Boolean).join("<br>") : String(lines ?? "");

  if (typeof ChatMessage === "undefined") return false;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
    content: buildCombatChatCard({
      title: "Медицина",
      subtitle: `${actorName} ${verb} ${itemName}`,
      icon: "+",
      status: "Лечение",
      statusClass: "is-good",
      rows: [
        ["Исполнитель", actorName],
        ["Цель", targetName],
        ["Предмет", itemName],
        ["Действие", targetPreposition],
      ],
      bodyHtml: body
        ? body.split(/<br\s*\/?>/i).filter(Boolean).map(line => `<p>${line}</p>`).join("")
        : "",
      className: "ih-combat-medical-card",
    }),
  });
  return true;
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
    await updateActorTraumaState(targetActor, {
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
    const alreadyTourniquet = getBodyPartStatusBool(targetActor, targetPart, "tourniquet");

    if (currentMajor <= 0) {
      notifyMedicalWarn(`${partLabel}: нет сильного кровотечения.`);
      await createMedicalChat(sourceActor, targetActor, item, [
        partLabel,
        "Сильное кровотечение отсутствует",
      ]);
      return medicalResult({ consumeItem: false });
    }

    if (alreadyTourniquet) {
      notifyMedicalWarn(`${partLabel}: жгут уже наложен.`);
      await finalizeActorTraumaState(targetActor);
      return medicalResult({ consumeItem: false });
    }

    await updateActorTraumaState(targetActor, {
      [buildBodyPartStatusPath(targetPart, "majorBleeding")]: currentMajor,
      [buildBodyPartStatusPath(targetPart, "tourniquet")]: true,
    });

    await createMedicalChat(sourceActor, targetActor, item, [
      partLabel,
      `Сильное кровотечение пережато: ${currentMajor}`,
      "Рана требует последующей обработки",
    ], { verb: "накладывает" });

    return medicalResult({ consumeItem: true });
  }

  if (actionType === "splint") {
    const hadFracture = getBodyPartStatusBool(targetActor, targetPart, "fracture");
    const alreadySplinted = getBodyPartStatusBool(targetActor, targetPart, "splinted");

    if (alreadySplinted) {
      notifyMedicalWarn(`${partLabel} уже стабилизирована.`);
      return medicalResult({ consumeItem: false });
    }

    if (!hadFracture && !alreadySplinted) {
      notifyMedicalWarn(`${partLabel}: перелом отсутствует.`);
      return medicalResult({ consumeItem: false });
    }

    const updates = {
      [buildBodyPartStatusPath(targetPart, "splinted")]: true,
      [buildBodyPartStatusPath(targetPart, "fracture")]: true,
    };

    if (LEGACY_FRACTURE_PART_KEYS.has(targetPart)) {
      updates[`system.conditions.fractures.${targetPart}`] = false;
    }

    await updateActorTraumaState(targetActor, updates);
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

    await updateActorTraumaState(targetActor, updates);
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
        await updateActorTraumaState(targetActor, {
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

    await updateActorTraumaState(targetActor, updates);
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
  const restored = Math.max(0, next - current);

  if (restored <= 0) {
    notifyMedicalWarn(`${label} уже на максимуме.`);
    return medicalResult({ consumeItem: false });
  }

  await targetActor.update({
    [`system.resources.${resourceKey}.value`]: next,
  });

  await createMedicalChat(sourceActor, targetActor, item, `${label} восстановлена на ${restored}`);
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
    const restoredMax = Math.max(0, nextMax - currentMax);
    const restoredCurrent = Math.max(0, nextCurrent - current);

    if (restoredMax <= 0 && restoredCurrent <= 0) {
      notifyMedicalWarn("Максимум энергии уже восстановлен.");
      return medicalResult({ consumeItem: false });
    }

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

  if (actionType === "apply-condition") {
    const conditionKey = String(
      item?.system?.conditionKey
        ?? item?.system?.condition
        ?? item?.system?.applyCondition
        ?? ""
    ).trim();
    if (!conditionKey) {
      notifyMedicalWarn("Condition is not configured for this item.");
      return medicalResult({ consumeItem: false });
    }

    const rawConditionAmount = Number(
      item?.system?.duration
        ?? item?.system?.conditionValue
        ?? item?.system?.conditionDuration
        ?? power
        ?? 1
    );
    const conditionAmount = Number.isFinite(rawConditionAmount) && rawConditionAmount > 0
      ? rawConditionAmount
      : 1;
    const result = await addOrExtendActorCondition(targetActor, conditionKey, conditionAmount, {
      mode: String(item?.system?.conditionMode ?? "").trim() || null,
      valueKind: String(item?.system?.conditionValueKind ?? "").trim() || null,
    });

    await createMedicalChat(
      sourceActor,
      targetActor,
      item,
      `Condition ${getConditionLabel(conditionKey)}: ${result.previous} -> ${result.value}`
    );
    return medicalResult({ consumeItem: true });
  }

  if (actionType === "cure-poison") {
    const currentPoison = Math.max(0, Number(getActorConditionValue(targetActor, "poison") || 0));

    if (currentPoison <= 0) {
      notifyMedicalWarn("Яд не найден.");
      return medicalResult({ consumeItem: false });
    }

    await targetActor.update({ "system.conditions.poison": 0 });
    await createMedicalChat(sourceActor, targetActor, item, `Яд нейтрализован: ${currentPoison} -> 0`);
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
      if (Object.keys(updates).length) await updateActorTraumaState(targetActor, updates);
      notifyMedicalWarn("Тело уже полностью восстановлено.");
      return medicalResult({ consumeItem: false });
    }

    await updateActorTraumaState(targetActor, updates);
    await createMedicalChat(sourceActor, targetActor, item, `Тело получает общее восстановление: ${totalRestored} HP`);
    return medicalResult({ consumeItem: true });
  }

  if (actionType === "stop-minor-bleeding-global") {
    const hp = targetActor.system?.resources?.hp ?? {};
    const updates = {};
    let stopped = 0;

    if (hasBodyHp(targetActor)) {
      for (const partKey of BODY_PART_KEYS) {
        if (!hp?.[partKey]) continue;
        const currentMinor = Math.max(0, Number(hp?.[partKey]?.status?.minorBleeding ?? 0));
        if (currentMinor <= 0) continue;
        stopped += currentMinor;
        updates[buildBodyPartStatusPath(partKey, "minorBleeding")] = 0;
      }
    } else {
      stopped = Math.max(0, Number(getActorConditionValue(targetActor, "bleeding") || 0));
      if (stopped > 0) updates[buildConditionUpdatePath("bleeding")] = 0;
    }

    if (!stopped) {
      if (hasBodyHp(targetActor)) await finalizeActorTraumaState(targetActor);
      notifyMedicalWarn("Малых кровотечений не найдено.");
      return medicalResult({ consumeItem: false });
    }

    if (hasBodyHp(targetActor)) await updateActorTraumaState(targetActor, updates);
    else await targetActor.update(updates);
    await createMedicalChat(sourceActor, targetActor, item, `Малые кровотечения остановлены: ${stopped}`);
    return medicalResult({ consumeItem: true });
  }

  if (actionType === "stabilize-body") {
    const hp = targetActor.system?.resources?.hp ?? {};
    const updates = {};
    let stopped = 0;
    let cleanedTourniquets = 0;

    if (hasBodyHp(targetActor)) {
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
    } else {
      stopped = Math.max(0, Number(getActorConditionValue(targetActor, "bleeding") || 0));
      if (stopped > 0) updates[buildConditionUpdatePath("bleeding")] = 0;
    }

    if (!stopped) {
      if (Object.keys(updates).length) {
        if (hasBodyHp(targetActor)) await updateActorTraumaState(targetActor, updates);
        else await targetActor.update(updates);
        notifyMedicalInfo("Лишние жгуты сняты, активных кровотечений нет.");
      } else {
        if (hasBodyHp(targetActor)) await finalizeActorTraumaState(targetActor);
        notifyMedicalWarn("Активных кровотечений не найдено.");
      }
      return medicalResult({ consumeItem: false });
    }

    if (hasBodyHp(targetActor)) await updateActorTraumaState(targetActor, updates);
    else await targetActor.update(updates);
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

async function rollBurningLocation({ rollLocation = null } = {}) {
  const rollTotal = typeof rollLocation === "function"
    ? Number(await rollLocation())
    : typeof Roll !== "undefined"
      ? Number((await new Roll("1d20").evaluate()).total)
      : Math.floor(Math.random() * 20) + 1;
  const rolledZone = getHitLocation(rollTotal);
  return {
    rolledZone,
    damageKey: resolveDamageHpKey(rolledZone) ?? rolledZone,
    label: getHitLabel(rolledZone),
    rollTotal,
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
  rollLocation = null,
} = {}) {
  if (!actor) return { changed: false, effects: [], updates: {} };

  const updates = {};
  const effects = [];

  const addEffect = (effect) => {
    const normalized = {
      phase: "ongoing",
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
      ? await rollBurningLocation({ rollLocation })
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

  const traumaStatus = hasBodyHp(actor) && effects.length
    ? await finalizeActorTraumaState(actor)
    : null;

  return {
    changed: effects.length > 0 || Object.keys(updates).length > 0 || Boolean(traumaStatus?.changed),
    effects,
    updates,
    traumaStatus,
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
      phase: "trauma",
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

  const status = await finalizeActorTraumaState(actor);

  return {
    changed: effects.length > 0 || Boolean(status.changed),
    effects,
    updates: status.refreshed?.updates ?? {},
  };
}

function stripConditionHtml(value = "") {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getConditionEffectTone(effect = {}) {
  const key = normalizeConditionKey(effect.key);
  if (effect.phase === "summon" && effect.expired) return "is-danger";
  if (effect.key === "destroyed" || key === "burning" || key === "bleeding" || key === "poison") return "is-danger";
  if (Number(effect.damage ?? 0) > 0) return "is-danger";
  if (effect.expired) return "is-good";
  if (effect.skipsTurn) return "is-warn";
  return "";
}

function getConditionEffectLabel(effect = {}) {
  const base = effect.label || getConditionLabel(effect.key) || "Эффект";
  return effect.locationLabel ? `${base}: ${effect.locationLabel}` : base;
}

function getConditionEffectValue(effect = {}) {
  if (effect.phase === "duration") {
    const parts = [`${effect.previous ?? 0} -> ${effect.value ?? 0}`];
    if (effect.expired) parts.push("истёк");
    if (effect.skipsTurn) parts.push("пропуск хода");
    return parts.join(" · ");
  }

  if (effect.phase === "summon") {
    const parts = [`${effect.previous ?? 0} -> ${effect.value ?? 0} сек.`];
    if (effect.expired) parts.push("исчезает");
    return parts.join(" · ");
  }

  const damage = Number(effect.damage ?? 0);
  if (damage > 0) {
    return [
      `-${damage} HP`,
      effect.remainingHP !== undefined ? `осталось ${effect.remainingHP}` : "",
    ].filter(Boolean).join(" · ");
  }

  if (effect.remainingHP !== undefined) return `HP: ${effect.remainingHP}`;
  if (effect.logText) return effect.logText;
  if (effect.chatHtml) return stripConditionHtml(effect.chatHtml);
  return "изменён";
}

export function buildConditionTickChatData(actor, effects = [], {
  skipConditions = [],
  seconds = DEFAULT_TURN_SECONDS,
} = {}) {
  const list = Array.isArray(effects) ? effects.filter(Boolean) : [];
  const totalDamage = list.reduce((sum, effect) => sum + Math.max(0, Number(effect.damage ?? 0)), 0);
  const expiredCount = list.filter(effect => effect.expired).length;
  const skipList = Array.isArray(skipConditions) && skipConditions.length
    ? skipConditions
    : list
        .filter(effect => effect.skipsTurn && Number(effect.previous ?? 0) > 0)
        .map(effect => ({
          key: effect.key,
          label: effect.skipLabel || effect.label,
          value: effect.previous,
          nextValue: effect.value,
        }));

  return {
    title: "Эффекты хода",
    subtitle: actor?.name ?? "",
    icon: "!",
    status: list.length ? "Обработано" : "Нет эффектов",
    statusClass: list.length ? "is-warn" : "is-muted",
    badges: [
      { label: `${list.length} эффект(ов)`, className: list.length ? "is-warn" : "is-muted" },
      { label: `-${totalDamage} HP`, className: "is-danger", visible: totalDamage > 0 },
      { label: `${expiredCount} истекло`, className: "is-good", visible: expiredCount > 0 },
      { label: `${skipList.length} пропуск`, className: "is-danger", visible: skipList.length > 0 },
      { label: `${Math.max(1, Number(seconds ?? DEFAULT_TURN_SECONDS))} сек.`, className: "is-muted" },
    ],
    rows: list.map(effect => ({
      label: getConditionEffectLabel(effect),
      value: getConditionEffectValue(effect),
      className: getConditionEffectTone(effect),
    })),
    notices: skipList.map(condition => ({
      label: "Пропуск хода",
      value: `${condition.label || getConditionLabel(condition.key)}: ${condition.value ?? 0} -> ${condition.nextValue ?? 0}`,
      className: "is-danger",
    })),
  };
}

export function buildConditionTickChatHtml(actor, effects, options = {}) {
  const data = buildConditionTickChatData(actor, effects, options);
  return buildCombatChatCard({
    ...data,
    className: "ih-combat-lifecycle-card",
  });
}

function conditionDecayChatLine(effect) {
  const suffix = effect.expired ? " (истёк)" : "";
  return `<p><b>${effect.label}:</b> ${effect.previous} -> ${effect.value}${suffix}</p>`;
}

function conditionDecayLogText(actor, effect) {
  if (effect.expired) return `${actor.name}: ${effect.label} истекает.`;
  return `${actor.name}: ${effect.label} ${effect.previous} -> ${effect.value}.`;
}

export function buildActorTurnStartConditionTick(actor, {
  seconds = DEFAULT_TURN_SECONDS,
} = {}) {
  const step = Math.max(1, Number(seconds ?? DEFAULT_TURN_SECONDS));
  const skipDefinitions = getTurnStartSkipConditionDefinitions();
  const skipKeySet = new Set(skipDefinitions.map(definition => normalizeConditionKey(definition.key)));
  const skipLabelByKey = Object.fromEntries(
    skipDefinitions.map(definition => [normalizeConditionKey(definition.key), definition.label])
  );
  const updates = {};
  const effects = [];

  for (const rawKey of getTurnStartDecayConditionKeys()) {
    const key = normalizeConditionKey(rawKey);
    const previous = Math.max(0, Number(getActorConditionValue(actor, key) || 0));
    if (previous <= 0) continue;

    const next = Math.max(0, previous - step);
    const effect = {
      phase: "duration",
      key,
      label: getConditionLabel(key),
      previous,
      value: next,
      delta: previous - next,
      expired: next <= 0,
      skipsTurn: skipKeySet.has(key),
      skipLabel: skipLabelByKey[key] ?? "",
    };
    effect.chatHtml = conditionDecayChatLine(effect);
    effect.logText = conditionDecayLogText(actor, effect);
    effects.push(effect);
    updates[buildConditionUpdatePath(key)] = next;
  }

  const skipConditions = effects
    .filter(effect => effect.skipsTurn && effect.previous > 0)
    .map(effect => ({
      key: effect.key,
      label: effect.skipLabel || effect.label,
      value: effect.previous,
      nextValue: effect.value,
    }));

  return {
    changed: effects.length > 0,
    effects,
    skipConditions,
    updates,
    seconds: step,
  };
}

export async function tickActorTurnStartConditions(actor, {
  seconds = DEFAULT_TURN_SECONDS,
} = {}) {
  if (!actor) {
    return {
      changed: false,
      effects: [],
      skipConditions: [],
      updates: {},
      seconds: Math.max(1, Number(seconds ?? DEFAULT_TURN_SECONDS)),
    };
  }

  const tick = buildActorTurnStartConditionTick(actor, { seconds });
  if (Object.keys(tick.updates).length) {
    await actor.update(tick.updates);
  }
  return tick;
}

function getActorSummonFlag(actor) {
  const direct = actor?.flags?.[SYSTEM_ID]?.summoned;
  if (direct && typeof direct === "object") return direct;

  const fromGetter = actor?.getFlag?.(SYSTEM_ID, "summoned");
  if (fromGetter && typeof fromGetter === "object") return fromGetter;

  return null;
}

export function getActorSummonState(actor) {
  const state = getActorSummonFlag(actor);
  return state ? { ...state } : null;
}

export function isActorSummoned(actor) {
  return Boolean(getActorSummonFlag(actor));
}

function getSummonRemainingSeconds(state) {
  const parsed = Number(state?.remaining ?? state?.duration ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function buildSummonStateUpdate(state, previousRemaining, nextRemaining) {
  const previousTotal = Number(state?.totalDuration ?? state?.initialDuration ?? 0);
  const safeTotal = Number.isFinite(previousTotal)
    ? Math.max(previousTotal, previousRemaining, nextRemaining)
    : Math.max(previousRemaining, nextRemaining);

  return {
    ...state,
    totalDuration: safeTotal,
    remaining: nextRemaining,
    duration: nextRemaining,
    expired: nextRemaining <= 0,
  };
}

function summonLifecycleChatLine(actor, effect) {
  if (effect.expired) {
    return `<p><b>Призыв:</b> ${actor?.name ?? "существо"} исчезает.</p>`;
  }
  return `<p><b>Призыв:</b> ${actor?.name ?? "существо"} ${effect.previous} -> ${effect.value} сек.</p>`;
}

function summonLifecycleLogText(actor, effect) {
  if (effect.expired) return `${actor?.name ?? "Призванное существо"} исчезает: время призыва истекло.`;
  return `${actor?.name ?? "Призванное существо"}: призыв ${effect.previous} -> ${effect.value} сек.`;
}

export function buildActorSummonLifecycleTick(actor, {
  seconds = DEFAULT_TURN_SECONDS,
} = {}) {
  const step = Math.max(1, Number(seconds ?? DEFAULT_TURN_SECONDS));
  const state = getActorSummonFlag(actor);
  if (!actor || !state) {
    return {
      changed: false,
      effects: [],
      updates: {},
      expired: false,
      previous: 0,
      value: 0,
      seconds: step,
    };
  }

  const previous = getSummonRemainingSeconds(state);
  const wasExpired = Boolean(state.expired);
  if (wasExpired && previous <= 0) {
    return {
      changed: false,
      effects: [],
      updates: {},
      expired: true,
      previous,
      value: 0,
      seconds: step,
      state: { ...state },
    };
  }

  const next = Math.max(0, previous - step);
  const nextState = buildSummonStateUpdate(state, previous, next);
  const effect = {
    phase: "summon",
    key: "summoned",
    label: "Призыв",
    summonId: String(state.summonId ?? ""),
    casterId: String(state.casterId ?? ""),
    casterName: String(state.casterName ?? ""),
    previous,
    value: next,
    delta: previous - next,
    expired: next <= 0,
  };
  effect.chatHtml = summonLifecycleChatLine(actor, effect);
  effect.logText = summonLifecycleLogText(actor, effect);

  return {
    changed: true,
    effects: [effect],
    updates: {
      [`flags.${SYSTEM_ID}.summoned`]: nextState,
    },
    expired: effect.expired,
    previous,
    value: next,
    seconds: step,
    state: nextState,
  };
}

async function deleteSummonedActorTokens(actor) {
  const actorId = String(actor?.id ?? "");
  if (!actorId) return 0;

  const placeables = globalThis.canvas?.tokens?.placeables ?? [];
  let deleted = 0;
  for (const token of placeables) {
    const tokenActorId = String(token?.actor?.id ?? token?.document?.actorId ?? "");
    if (tokenActorId !== actorId) continue;

    const document = token?.document ?? token;
    if (typeof document?.delete !== "function") continue;

    await document.delete();
    deleted += 1;
  }

  return deleted;
}

export async function expireSummonedActor(actor, {
  deleteTokens = true,
  deleteActor = false,
} = {}) {
  if (!actor || !isActorSummoned(actor)) {
    return { ok: false, changed: false, reason: "not-summoned" };
  }

  const updates = {
    [`flags.${SYSTEM_ID}.summoned.expired`]: true,
    [`flags.${SYSTEM_ID}.summoned.remaining`]: 0,
    [`flags.${SYSTEM_ID}.summoned.duration`]: 0,
  };
  const hp = actor.system?.resources?.hp ?? {};
  if (hp.value !== undefined) {
    updates["system.resources.hp.value"] = 0;
  } else if (hp.torso?.value !== undefined) {
    updates["system.resources.hp.torso.value"] = 0;
  }
  if (actor.system?.conditions) {
    updates["system.conditions.unconscious"] = Math.max(
      Number(actor.system.conditions.unconscious ?? 0),
      DEFAULT_TURN_SECONDS,
    );
  }

  await actor.update(updates);

  const deletedTokens = deleteTokens ? await deleteSummonedActorTokens(actor) : 0;
  let actorDeleted = false;
  if (deleteActor && typeof actor.delete === "function") {
    await actor.delete();
    actorDeleted = true;
  }

  return {
    ok: true,
    changed: true,
    deletedTokens,
    actorDeleted,
    updates,
  };
}

export async function tickActorSummonLifecycle(actor, {
  seconds = DEFAULT_TURN_SECONDS,
  expireSummons = true,
  deleteExpiredSummonTokens = true,
  deleteExpiredSummonActors = false,
} = {}) {
  const tick = buildActorSummonLifecycleTick(actor, { seconds });
  if (!actor || !tick.changed) return tick;

  if (Object.keys(tick.updates).length) {
    await actor.update(tick.updates);
  }

  if (tick.expired && expireSummons) {
    tick.expiration = await expireSummonedActor(actor, {
      deleteTokens: deleteExpiredSummonTokens,
      deleteActor: deleteExpiredSummonActors,
    });
  }

  return tick;
}

function emptyLifecycleTick(seconds = DEFAULT_TURN_SECONDS) {
  return {
    changed: false,
    effects: [],
    skipConditions: [],
    traumaTick: null,
    conditionTick: null,
    durationTick: null,
    summonTick: null,
    preRefresh: null,
    finalStatus: null,
    seconds: Math.max(1, Number(seconds ?? DEFAULT_TURN_SECONDS)),
  };
}

export function isActorSoulDead(actor) {
  return Boolean(actor?.system?.resources?.soulReserve?.isDead);
}

export async function applyActorTurnStartLifecycleTick(actor, {
  seconds = DEFAULT_TURN_SECONDS,
  onLethal = null,
  notifyEmpty = true,
  createChat = true,
  rollLocation = null,
  expireSummons = true,
  deleteExpiredSummonTokens = true,
  deleteExpiredSummonActors = false,
} = {}) {
  if (!actor) return emptyLifecycleTick(seconds);

  const step = Math.max(1, Number(seconds ?? DEFAULT_TURN_SECONDS));
  const lethalHandler = onLethal ?? (target => markActorDead(target));

  await ensureActorBodyTraumaStatusStructure(actor);
  const preRefresh = await finalizeActorTraumaState(actor);
  const actorAlreadyDead = isActorSoulDead(actor);

  const traumaTick = actorAlreadyDead
    ? { changed: false, effects: [], updates: {} }
    : await tickActorBodyTrauma(actor, { onLethal: lethalHandler });
  const conditionTick = actorAlreadyDead
    ? { changed: false, effects: [], updates: {} }
    : await tickActorOngoingDamage(actor, {
        bleeding: !hasActorBodyBleeding(actor),
        onLethal: lethalHandler,
        rollLocation,
      });
  const durationTick = actorAlreadyDead
    ? { changed: false, effects: [], skipConditions: [], updates: {}, seconds: step }
    : await tickActorTurnStartConditions(actor, { seconds: step });
  const summonTick = actorAlreadyDead
    ? { changed: false, effects: [], updates: {}, expired: false, seconds: step }
    : await tickActorSummonLifecycle(actor, {
        seconds: step,
        expireSummons,
        deleteExpiredSummonTokens,
        deleteExpiredSummonActors,
      });
  const finalStatus = hasBodyHp(actor)
    ? await finalizeActorTraumaState(actor)
    : null;
  const effects = [
    ...(traumaTick.effects ?? []),
    ...(conditionTick.effects ?? []),
    ...(durationTick.effects ?? []),
    ...(summonTick.effects ?? []),
  ];
  const skipConditions = durationTick.skipConditions ?? [];

  if (!effects.length) {
    if (notifyEmpty) globalThis.ui?.notifications?.info?.("Активных эффектов нет");
    return {
      changed: Boolean(preRefresh?.changed || finalStatus?.changed),
      effects,
      skipConditions,
      traumaTick,
      conditionTick,
      durationTick,
      summonTick,
      preRefresh,
      finalStatus,
      seconds: step,
    };
  }

  if (createChat && typeof ChatMessage !== "undefined") {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildConditionTickChatHtml(actor, effects, {
        skipConditions,
        seconds: step,
      }),
    });
  }

  return {
    changed: true,
    effects,
    skipConditions,
    traumaTick,
    conditionTick,
    durationTick,
    summonTick,
    preRefresh,
    finalStatus,
    seconds: step,
  };
}

export async function applyActorConditionTick(actor, options = {}) {
  return applyActorTurnStartLifecycleTick(actor, options);
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

  if (typeof ChatMessage !== "undefined") {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildCombatChatCard({
        title: `${actor.name} погиб`,
        icon: "!",
        status: "Смерть",
        statusClass: "is-danger",
        badges: [
          { label: "soul reserve", className: "is-danger" },
        ],
        rows: [
          ["Резерв души", "-1 в день"],
          ["Окно спасения", "пока резерв маны и энергии не иссяк"],
        ],
        className: "ih-combat-death-card",
      }),
    });
  }

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
    "system.conditions.unconscious": 0,
    "system.conditions.stunned": 0,
    "system.conditions.sleeping": 0,
  };

  for (const partKey of BODY_PART_KEYS) {
    const max = Number(actor.system?.resources?.hp?.[partKey]?.max ?? 0);
    if (!max) continue;
    updates[`system.resources.hp.${partKey}.value`] = Math.max(1, Math.floor(max * hpRestorePct));
    updates[`system.resources.hp.${partKey}.status.destroyed`] = false;
  }

  await actor.update(updates);
  await finalizeActorTraumaState(actor);

  const qualityLabel = normalizedQuality >= 8
    ? "Отличное"
    : normalizedQuality >= 5
      ? "Хорошее"
      : "Слабое";

  if (typeof ChatMessage !== "undefined") {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildCombatChatCard({
        title: `${actor.name} воскрешён`,
        icon: "*",
        status: qualityLabel,
        statusClass: normalizedQuality <= 3 ? "is-warn" : "is-good",
        rows: [
          ["Качество", `${qualityLabel} (${normalizedQuality})`],
          ["HP восстановлено", `${Math.round(hpRestorePct * 100)}%`],
        ],
        notices: [
          ["Осложнения", "персонаж ослаблен, возможны дебафы", normalizedQuality <= 3],
        ],
        className: "ih-combat-revive-card",
      }),
    });
  }

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
    content: buildCombatChatCard({
      title: "Болезнь вылечена",
      subtitle: actor.name,
      icon: "+",
      status: "Готово",
      statusClass: "is-good",
      rows: [
        ["Персонаж", actor.name],
        ["Болезнь", def?.label ?? diseaseKey],
      ],
      className: "ih-combat-cure-card",
    }),
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
  profile = null,
  growth = null,
  clearedConditions = [],
} = {}) {
  return { ok, changed, reason, shortRest, fullRest, profile, growth, clearedConditions };
}

function fullRestBlockReason(profile) {
  if (profile?.blockers?.includes("bleeding")) {
    return "Нельзя полноценно отдохнуть: сначала останови кровотечение.";
  }
  if (profile?.blockers?.includes("burning")) {
    return "Нельзя полноценно отдохнуть: персонаж горит.";
  }
  return "";
}

function getFullRestClearConditionKeys() {
  const keys = new Set([
    ...getTurnStartDecayConditionKeys(),
    ...FULL_REST_EXTRA_CLEAR_CONDITIONS,
  ]);

  for (const key of FULL_REST_PERSISTENT_CONDITIONS) {
    keys.delete(key);
  }

  return [...keys];
}

function applyFullRestConditionRecovery(actor, updates) {
  const cleared = [];

  for (const key of getFullRestClearConditionKeys()) {
    const previous = Math.max(0, Number(getActorConditionValue(actor, key) || 0));
    if (previous <= 0) continue;

    updates[buildConditionUpdatePath(key)] = 0;
    cleared.push({
      key,
      label: getConditionLabel(key),
      previous,
    });
  }

  return cleared;
}

async function applyEnergyGrowthFromRest(actor, updates, profile) {
  const recoveredMax = Math.max(0, Number(profile?.recoveredEnergyMax ?? 0));
  const baseMax = Number(profile?.baseEnergyMax ?? 0);
  const threshold = Math.max(1, baseMax);

  if (!actor || recoveredMax <= 0) {
    return {
      xpGained: 0,
      xpAfter: Number(actor?.getFlag?.("iron-hills-system", "energyGrowthXp") ?? 0),
      threshold,
      grew: false,
      newBaseMax: baseMax,
    };
  }

  const currentXp = Number(actor.getFlag?.("iron-hills-system", "energyGrowthXp") ?? 0);
  const nextXp = currentXp + recoveredMax;
  const flagPath = "flags.iron-hills-system.energyGrowthXp";

  if (nextXp >= threshold) {
    updates["system.resources.energy.baseMax"] = baseMax + 1;
    updates[flagPath] = nextXp - threshold;
    return {
      xpGained: recoveredMax,
      xpAfter: nextXp - threshold,
      threshold,
      grew: true,
      newBaseMax: baseMax + 1,
    };
  }

  updates[flagPath] = nextXp;
  return {
    xpGained: recoveredMax,
    xpAfter: nextXp,
    threshold,
    grew: false,
    newBaseMax: baseMax,
  };
}

function buildRestChatRows(profile, growth = null, { fullRest = false, clearedConditions = [] } = {}) {
  return [
    ["Энергия", `${profile.currentEnergy} -> ${profile.nextEnergy} / ${profile.nextEnergyMax}`],
    ["Мана", `${profile.currentMana} -> ${profile.nextMana} / ${profile.maxMana}`],
    ["Макс. энергия", `+${profile.recoveredEnergyMax}`, profile.recoveredEnergyMax > 0],
    [
      "Давление травм",
      `кровь ${profile.bleeding}, живот ${profile.abdomenEnergyPenalty}, общий ${profile.energyRecoveryPenalty}`,
      profile.bleeding > 0 || profile.abdomenEnergyPenalty > 0 || profile.energyRecoveryPenalty > 0,
    ],
    ["Опыт выносливости", `+${growth?.xpGained ?? 0} (${growth?.xpAfter ?? 0}/${growth?.threshold ?? 0})`, Number(growth?.xpGained ?? 0) > 0],
    ["Рост энергии", `база ${growth?.newBaseMax}`, Boolean(growth?.grew)],
    ["Очищено состояний", clearedConditions.map(condition => condition.label).join(", "), fullRest && clearedConditions.length > 0],
    ["Яд", `${profile.poison} -> ${Math.max(0, Number(profile.poison ?? 0) - 1)}`, fullRest],
    ["Шок после травм", Number(profile.summary?.traumaShock ?? 0), fullRest],
  ];
}

export async function applyActorShortRest(actor) {
  if (!actor?.system?.resources?.energy) {
    return restResult({ ok: false, reason: "У актёра нет ресурса энергии." });
  }

  await ensureActorBodyTraumaStatusStructure(actor);
  await finalizeActorTraumaState(actor);

  const profile = buildActorRestProfile(actor, "short");
  const updates = {
    "system.resources.energy.max": profile.nextEnergyMax,
    "system.resources.energy.value": profile.nextEnergy,
    "system.resources.mana.value": profile.nextMana,
  };
  const growth = await applyEnergyGrowthFromRest(actor, updates, profile);

  await actor.update(updates);
  await finalizeActorTraumaState(actor);

  if (typeof ChatMessage !== "undefined") {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildCombatChatCard({
        title: "Короткий отдых",
        subtitle: actor.name,
        icon: "+",
        status: "Восстановление",
        statusClass: "is-good",
        rows: buildRestChatRows(profile, growth),
        className: "ih-combat-rest-card ih-combat-short-rest",
      }),
    });
  }

  return restResult({ changed: true, shortRest: true, profile, growth });
}

export async function applyActorFullRest(actor) {
  if (!actor?.system?.resources?.energy) {
    return restResult({ ok: false, reason: "У актёра нет ресурса энергии." });
  }

  await ensureActorBodyTraumaStatusStructure(actor);
  await finalizeActorTraumaState(actor);

  const profile = buildActorRestProfile(actor, "full");
  const currentPoison = Number(profile.poison ?? 0);

  if (profile.blocked) {
    const reason = fullRestBlockReason(profile);
    globalThis.ui?.notifications?.warn?.(reason);
    return restResult({ ok: false, reason, profile });
  }

  const updates = {
    "system.resources.energy.max": profile.nextEnergyMax,
    "system.resources.energy.value": profile.nextEnergy,
    "system.resources.mana.value": profile.nextMana,
    "system.conditions.bleeding": Number(profile.summary?.activeBleedingTotal ?? 0),
    "system.conditions.shock": Number(profile.summary?.traumaShock ?? 0),
    "system.conditions.poison": Math.max(0, currentPoison - 1),
  };
  const clearedConditions = applyFullRestConditionRecovery(actor, updates);
  const growth = await applyEnergyGrowthFromRest(actor, updates, profile);
  await actor.update(updates);
  await finalizeActorTraumaState(actor);

  if (typeof ChatMessage !== "undefined") {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildCombatChatCard({
        title: "Полный отдых",
        subtitle: actor.name,
        icon: "+",
        status: "Восстановление",
        statusClass: "is-good",
        rows: buildRestChatRows(profile, growth, { fullRest: true, clearedConditions }),
        className: "ih-combat-rest-card ih-combat-full-rest",
      }),
    });
  }

  return restResult({ changed: true, fullRest: true, profile, growth, clearedConditions });
}
