import {
  addOrExtendActorCondition,
  getConditionLabel,
  refreshActorBodyTraumaStatus,
} from "./condition-service.mjs";
import {
  getConditionDefaultMode,
  getConditionDefaultValueKind,
  isOngoingDamageCondition,
  normalizeConditionKey,
} from "./condition-policy-service.mjs";
import {
  resolveDamageHpKey,
  getTargetPartLabel,
  syncDerivedConditionsFromTrauma
} from "./actor-state-service.mjs";
import { unequipActorSlot } from "./inventory-service.mjs";
import { getActorToken } from "../utils/item-utils.mjs";

const BODY_PART_KEYS = new Set(["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"]);
const SUPPORT_SPECIAL_MESSAGES = Object.freeze({
  reaction_interrupt: "Перехват обрабатывается автоматически перед попаданием, если подготовленный статус активен.",
  auto_counter_on_hit: "Контрудар обрабатывается автоматически после полученного удара, если подготовленный статус активен.",
  formation_stance: "Строй действует как подготовленная защитная стойка и учитывается в защите цели.",
  shield_wall_formation: "Стена щитов действует как подготовленная защитная стойка и учитывается в защите цели.",
  aim_bonus_3_next_shot: "Прицел сохраняется как подготовленный бонус и расходуется следующим подходящим выстрелом.",
});

function normalizeChance(value) {
  const chance = Number(value ?? 1);
  if (!Number.isFinite(chance)) return 1;
  return Math.max(0, Math.min(1, chance));
}

function normalizeDuration(value) {
  return Math.max(1, Number(value ?? 1));
}

function hasStackList(stacks) {
  return normalizeConditionStacks(stacks).length > 0;
}

export function buildHitEffect(effect = null, {
  applyCondition = undefined,
  conditionDuration = undefined,
  conditionChance = undefined,
  conditionStacks = undefined,
  notes = undefined,
} = {}) {
  const source = effect && typeof effect === "object" ? effect : {};
  const built = { ...source };
  const hasConditionOverride = applyCondition !== undefined && applyCondition !== null;

  if (hasConditionOverride) built.applyCondition = applyCondition;
  if (hasConditionOverride && conditionDuration !== undefined) built.conditionDuration = conditionDuration;
  if (hasConditionOverride && conditionChance !== undefined) built.conditionChance = conditionChance;
  if (conditionStacks !== undefined) built.conditionStacks = conditionStacks;
  if (notes !== undefined) built.notes = Array.isArray(notes) ? notes.filter(Boolean) : [notes].filter(Boolean);

  const hasCondition = Boolean(String(built.applyCondition ?? "").trim());
  const hasStacks = hasStackList(built.conditionStacks ?? built.stacks ?? []);
  const hasSpecial = Boolean(String(built.special ?? "").trim());
  const hasNotes = Array.isArray(built.notes) && built.notes.length > 0;
  return hasCondition || hasStacks || hasSpecial || hasNotes ? built : null;
}

function normalizeConditionStacks(stacks = []) {
  const list = Array.isArray(stacks) ? stacks : [stacks];
  return list
    .map(stack => ({
      key: normalizeConditionKey(stack?.key),
      value: Math.max(0, Number(stack?.value ?? 0)),
      mode: stack?.mode,
      valueKind: stack?.valueKind,
      label: stack?.label,
    }))
    .filter(stack => stack.key && stack.value > 0);
}

function getStackLabel(stack) {
  return String(stack?.label ?? getConditionLabel(stack?.key) ?? stack?.key ?? "");
}

function hasBodyHp(actor) {
  return Boolean(actor?.system?.resources?.hp?.torso);
}

function getResultBodyPartKey(result) {
  const raw =
    result?.damagePartKey ??
    result?.injuryLocationKey ??
    result?.locationKey ??
    "torso";
  const key = resolveDamageHpKey(raw) ?? raw;
  return BODY_PART_KEYS.has(key) ? key : "torso";
}

function getBleedingStackAmount(duration, valueKind) {
  const value = Math.max(1, Number(duration ?? 1));
  return valueKind === "duration" ? Math.max(1, Math.ceil(value / 6)) : value;
}

async function applyLocalBleedingCondition(actor, partKey, amount) {
  if (!actor || !BODY_PART_KEYS.has(partKey)) {
    return { applied: false, key: "bleeding", previous: 0, value: 0, partKey, local: true };
  }

  const path = `system.resources.hp.${partKey}.status.minorBleeding`;
  const previous = Math.max(0, Number(foundry.utils.getProperty(actor, path) ?? 0));
  const next = previous + Math.max(1, Number(amount ?? 1));
  await actor.update({ [path]: next });
  await syncDerivedConditionsFromTrauma(actor, { render: false });
  return {
    applied: true,
    key: "bleeding",
    storageKey: `resources.hp.${partKey}.status.minorBleeding`,
    previous,
    value: next,
    amount: next - previous,
    partKey,
    local: true,
    valueKind: "stack",
    mode: "add",
  };
}

async function applyTargetCondition(actor, key, value, {
  mode = null,
  valueKind = null,
  result = null,
} = {}) {
  const conditionKey = normalizeConditionKey(key);
  if (!actor || !conditionKey) {
    return { applied: false, key: conditionKey, previous: 0, value: 0 };
  }

  const resolvedValueKind = valueKind ?? getConditionDefaultValueKind(conditionKey);
  const resolvedMode = mode ?? getConditionDefaultMode(conditionKey);

  if (conditionKey === "bleeding" && hasBodyHp(actor)) {
    const partKey = getResultBodyPartKey(result);
    const stacks = getBleedingStackAmount(value, resolvedValueKind);
    return applyLocalBleedingCondition(actor, partKey, stacks);
  }

  return addOrExtendActorCondition(actor, conditionKey, value, {
    mode: resolvedMode,
    valueKind: resolvedValueKind,
  });
}

function getConditionDelta(applied) {
  return Math.max(0, Number(applied?.amount ?? 0) || (Number(applied?.value ?? 0) - Number(applied?.previous ?? 0)));
}

function formatAppliedConditionText(key, value, applied, {
  label = null,
  valueKind = null,
} = {}) {
  const conditionKey = normalizeConditionKey(key);
  const conditionLabel = String(label ?? getConditionLabel(conditionKey) ?? conditionKey);
  const resolvedValueKind = valueKind ?? getConditionDefaultValueKind(conditionKey);
  const amount = Math.max(1, getConditionDelta(applied) || Number(value ?? 1) || 1);
  const partSuffix = applied?.local && applied?.partKey
    ? ` (${getTargetPartLabel(applied.partKey)})`
    : "";

  if (isOngoingDamageCondition(conditionKey) || resolvedValueKind === "stack") {
    return `${conditionLabel} +${amount}${partSuffix}`;
  }

  const duration = Math.max(1, Number(value ?? amount));
  return `${conditionLabel}${duration > 1 ? ` (${duration}с)` : ""}${partSuffix}`;
}

function getEquippedItem(actor, slotKey) {
  const itemId = actor?.system?.equipment?.[slotKey];
  return itemId ? actor.items?.get(itemId) ?? null : null;
}

function isShieldItem(item) {
  return Boolean(item?.system?.isShield || item?.type === "shield" || item?.type === "armor" || item?.system?.slot === "shield");
}

function getGridSize() {
  return Math.max(1, Number(canvas?.grid?.size ?? 100));
}

function getTokenDocument(token) {
  return token?.document ?? token ?? null;
}

function getTokenRect(token) {
  const doc = getTokenDocument(token);
  const size = getGridSize();
  const width = Math.max(1, Number(doc?.width ?? 1)) * size;
  const height = Math.max(1, Number(doc?.height ?? 1)) * size;
  return {
    x: Number(doc?.x ?? 0),
    y: Number(doc?.y ?? 0),
    width,
    height,
    centerX: Number(doc?.x ?? 0) + width / 2,
    centerY: Number(doc?.y ?? 0) + height / 2,
  };
}

function signStep(value) {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

function clampTokenPosition(x, y, token) {
  const rect = getTokenRect(token);
  const sceneWidth = Number(canvas?.scene?.width ?? canvas?.dimensions?.width ?? x + rect.width);
  const sceneHeight = Number(canvas?.scene?.height ?? canvas?.dimensions?.height ?? y + rect.height);
  return {
    x: Math.max(0, Math.min(x, Math.max(0, sceneWidth - rect.width))),
    y: Math.max(0, Math.min(y, Math.max(0, sceneHeight - rect.height))),
  };
}

function snapTokenPosition(x, y) {
  const grid = canvas?.grid;
  const snapped = grid?.getSnappedPosition?.(x, y, 1);
  if (snapped && Number.isFinite(snapped.x) && Number.isFinite(snapped.y)) return snapped;

  const size = getGridSize();
  return {
    x: Math.round(x / size) * size,
    y: Math.round(y / size) * size,
  };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y;
}

function positionOverlapsToken(targetToken, x, y) {
  const targetDoc = getTokenDocument(targetToken);
  const nextRect = { ...getTokenRect(targetToken), x, y };
  return (canvas?.tokens?.placeables ?? []).some(token => {
    const doc = getTokenDocument(token);
    if (!doc || doc.id === targetDoc?.id) return false;
    if (token.visible === false) return false;
    return rectsOverlap(nextRect, getTokenRect(token));
  });
}

async function applyKnockback({ attacker = null, target = null, distance = 1 } = {}) {
  if (!canvas?.scene) {
    return { moved: false, reason: "нет активной сцены" };
  }

  const attackerToken = getActorToken(attacker);
  const targetToken = getActorToken(target);
  const targetDoc = getTokenDocument(targetToken);
  if (!attackerToken || !targetToken || !targetDoc?.update) {
    return { moved: false, reason: "не удалось найти токены на сцене" };
  }

  const size = getGridSize();
  const attackerRect = getTokenRect(attackerToken);
  const targetRect = getTokenRect(targetToken);
  let stepX = signStep(targetRect.centerX - attackerRect.centerX);
  let stepY = signStep(targetRect.centerY - attackerRect.centerY);

  if (!stepX && !stepY) stepY = 1;

  const raw = {
    x: targetRect.x + stepX * size * Math.max(1, Number(distance ?? 1)),
    y: targetRect.y + stepY * size * Math.max(1, Number(distance ?? 1)),
  };
  const snapped = snapTokenPosition(raw.x, raw.y);
  const clamped = clampTokenPosition(snapped.x, snapped.y, targetToken);

  if (clamped.x === targetRect.x && clamped.y === targetRect.y) {
    return { moved: false, reason: "край сцены блокирует отбрасывание" };
  }

  if (positionOverlapsToken(targetToken, clamped.x, clamped.y)) {
    return { moved: false, reason: "клетка занята другим токеном" };
  }

  try {
    await targetDoc.update({ x: clamped.x, y: clamped.y });
    return { moved: true, cells: Math.max(1, Number(distance ?? 1)) };
  } catch (err) {
    console.warn("Iron Hills | knockback failed", err);
    return { moved: false, reason: "нет прав или Foundry отклонила перемещение" };
  }
}

export function buildStackHitEffect(stacks = []) {
  const conditionStacks = normalizeConditionStacks(stacks);
  return conditionStacks.length ? { conditionStacks } : null;
}

export async function applyConditionStacks(actor, stacks = [], {
  mode = "add",
  result = null,
} = {}) {
  const applied = [];
  for (const stack of normalizeConditionStacks(stacks)) {
    const key = normalizeConditionKey(stack?.key);
    const value = Math.max(0, Number(stack?.value ?? 0));
    if (!actor || !key || !(value > 0)) continue;

    const conditionResult = await applyTargetCondition(actor, key, value, {
      mode: stack.mode ?? mode ?? getConditionDefaultMode(key),
      valueKind: stack.valueKind ?? getConditionDefaultValueKind(key),
      result,
    });
    applied.push(conditionResult);
  }
  return applied;
}

export async function healActorBodyPart(actor, locationKey = "torso", amount = 0) {
  if (!actor) return { healed: 0, newHP: 0, locationKey };

  const healAmount = Math.max(0, Number(amount ?? 0));
  const hp = actor.system?.resources?.hp;

  if (hp?.[locationKey]) {
    const valuePath = `system.resources.hp.${locationKey}.value`;
    const maxPath = `system.resources.hp.${locationKey}.max`;
    const currentHP = Number(foundry.utils.getProperty(actor, valuePath) ?? 0);
    const maxHP = Number(foundry.utils.getProperty(actor, maxPath) ?? currentHP);
    const newHP = Math.min(maxHP, currentHP + healAmount);

    if (newHP !== currentHP) await actor.update({ [valuePath]: newHP });
    await refreshActorBodyTraumaStatus(actor);
    await syncDerivedConditionsFromTrauma(actor, { render: false });
    return { healed: newHP - currentHP, newHP, locationKey };
  }

  if (hp?.value !== undefined) {
    const currentHP = Number(hp.value ?? 0);
    const maxHP = Number(hp.max ?? currentHP);
    const newHP = Math.min(maxHP, currentHP + healAmount);

    if (newHP !== currentHP) await actor.update({ "system.resources.hp.value": newHP });
    return { healed: newHP - currentHP, newHP, locationKey: "body" };
  }

  return { healed: 0, newHP: 0, locationKey };
}

async function applySpecialHitEffect({ attacker, target, effect } = {}) {
  const special = String(effect?.special ?? "").trim();
  if ((!special && !effect?.notes?.length) || !target) return [];

  const lines = Array.isArray(effect?.notes) ? [...effect.notes] : [];
  const supportMessage = SUPPORT_SPECIAL_MESSAGES[special];
  if (supportMessage) lines.push(supportMessage);

  if (special === "disarm_shield") {
    const shield = getEquippedItem(target, "leftHand");
    if (isShieldItem(shield)) {
      await unequipActorSlot(target, "leftHand");
      lines.push(`Щит выбит: ${shield.name}`);
    } else {
      lines.push("Щит не найден");
    }
  }

  if (special === "ignore_shield") {
    lines.push("Щит цели проигнорирован");
  }

  if (special === "knockback_1") {
    const knockback = await applyKnockback({ attacker, target, distance: 1 });
    if (knockback.moved) {
      lines.push(`Цель отброшена на ${knockback.cells} клетку.`);
    } else {
      lines.push(`Отбрасывание не выполнено: ${knockback.reason}.`);
    }
  }

  if (special === "passive_no_reload_penalty") {
    lines.push("Пассивный эффект перезарядки; отдельная атака не требуется.");
  }

  if (special === "choose_zone") {
    lines.push("Зона поражения выбирается при применении приёма.");
  }

  if (special === "maintain_grapple") {
    lines.push("Захват поддерживается статусом grappled; удержание проверяется вручную.");
  }

  return lines;
}

export async function applyHitEffects({
  attacker = null,
  target = null,
  result = null,
  effect = null,
  conditionMode = null,
  conditionValueKind = "duration",
} = {}) {
  const outcome = {
    lines: [],
    html: "",
    condition: null,
    conditions: [],
    conditionDetails: [],
    lifestealHp: 0,
  };

  if (!result?.hit || !target || !effect) return outcome;

  const conditionTexts = [];
  const conditionKey = normalizeConditionKey(effect.applyCondition);
  if (conditionKey && Math.random() < normalizeChance(effect.conditionChance)) {
    const duration = normalizeDuration(effect.conditionDuration);
    const resolvedConditionMode = conditionMode ?? getConditionDefaultMode(conditionKey);
    const resolvedConditionValueKind = conditionValueKind ?? getConditionDefaultValueKind(conditionKey);
    const applied = await applyTargetCondition(target, conditionKey, duration, {
      mode: resolvedConditionMode,
      valueKind: resolvedConditionValueKind,
      result,
    });

    outcome.conditions.push(applied);
    outcome.conditionDetails.push(applied);
    conditionTexts.push(formatAppliedConditionText(conditionKey, duration, applied, {
      valueKind: resolvedConditionValueKind,
    }));
  }

  const conditionStacks = normalizeConditionStacks(effect.conditionStacks ?? effect.stacks ?? []);
  if (conditionStacks.length) {
    const appliedStacks = await applyConditionStacks(target, conditionStacks, { mode: "add", result });
    outcome.conditions.push(...appliedStacks);
    outcome.conditionDetails.push(...appliedStacks);
    for (let index = 0; index < conditionStacks.length; index += 1) {
      const stack = conditionStacks[index];
      conditionTexts.push(formatAppliedConditionText(stack.key, stack.value, appliedStacks[index], {
        label: getStackLabel(stack),
        valueKind: stack.valueKind ?? getConditionDefaultValueKind(stack.key),
      }));
    }
  }

  if (conditionTexts.length) {
    outcome.condition = conditionTexts.join(", ");
    outcome.lines.push(`Эффект: ${outcome.condition}`);
  }

  const specialLines = await applySpecialHitEffect({ attacker, target, effect });
  outcome.lines.push(...specialLines);

  if (effect.special === "lifesteal" && attacker && Number(result.finalDamage ?? 0) > 0) {
    const torso = attacker.system?.resources?.hp?.torso;
    const hpPath = torso !== undefined ? "system.resources.hp.torso.value" : "system.resources.hp.value";
    const currentHp = Number(torso?.value ?? attacker.system?.resources?.hp?.value ?? 0);
    const maxHp = Number(torso?.max ?? attacker.system?.resources?.hp?.max ?? currentHp + result.finalDamage);
    const nextHp = Math.min(maxHp, currentHp + Number(result.finalDamage ?? 0));

    if (nextHp > currentHp) {
      await attacker.update({ [hpPath]: nextHp });
      outcome.lifestealHp = nextHp - currentHp;
      outcome.lines.push(`Похищение жизни: +${outcome.lifestealHp} HP`);
    }
  }

  outcome.html = outcome.lines.length
    ? `<p>${outcome.lines.join("<br>")}</p>`
    : "";

  return outcome;
}
