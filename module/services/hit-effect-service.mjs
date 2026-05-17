import {
  addOrExtendActorCondition,
  getConditionLabel
} from "./condition-service.mjs";
import {
  resolveDamageHpKey,
  getTargetPartLabel
} from "./actor-state-service.mjs";
import { unequipActorSlot } from "./inventory-service.mjs";
import { getActorToken } from "../utils/item-utils.mjs";

const BODY_PART_KEYS = new Set(["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"]);

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
      key: String(stack?.key ?? "").trim(),
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
    return { applied: false, key: "bleeding", previous: 0, value: 0, partKey };
  }

  const path = `system.resources.hp.${partKey}.status.minorBleeding`;
  const previous = Math.max(0, Number(foundry.utils.getProperty(actor, path) ?? 0));
  const next = previous + Math.max(1, Number(amount ?? 1));
  await actor.update({ [path]: next });
  return { applied: true, key: "bleeding", previous, value: next, partKey };
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

export async function applyConditionStacks(actor, stacks = [], { mode = "add" } = {}) {
  const applied = [];
  for (const stack of normalizeConditionStacks(stacks)) {
    const key = String(stack?.key ?? "").trim();
    const value = Math.max(0, Number(stack?.value ?? 0));
    if (!actor || !key || !(value > 0)) continue;

    const result = await addOrExtendActorCondition(actor, key, value, {
      mode: stack.mode ?? mode,
      valueKind: stack.valueKind ?? "stack",
    });
    applied.push(result);
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

  if (special === "reaction_interrupt") {
    lines.push("Перехват требует ручного триггера в момент вражеской атаки.");
  }

  if (special === "auto_counter_on_hit") {
    lines.push("Контрудар требует ручного триггера после получения удара.");
  }

  if (special === "formation_stance") {
    lines.push("Строй требует союзника рядом; автоматическая стойка пока не ведётся.");
  }

  if (special === "shield_wall_formation") {
    lines.push("Стена щитов требует союзника рядом; автоматическая формация пока не ведётся.");
  }

  if (special === "passive_no_reload_penalty") {
    lines.push("Пассивный эффект перезарядки; отдельная атака не требуется.");
  }

  if (special === "aim_bonus_3_next_shot") {
    lines.push("Прицеливание на следующий выстрел пока ведётся вручную.");
  }

  if (special === "choose_zone") {
    lines.push("Выбор зоны для этого приёма пока выполняется через обычный прицельный удар.");
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
  conditionMode = "max",
  conditionValueKind = "duration",
} = {}) {
  const outcome = {
    lines: [],
    html: "",
    condition: null,
    conditions: [],
    lifestealHp: 0,
  };

  if (!result?.hit || !target || !effect) return outcome;

  const conditionTexts = [];
  const conditionKey = String(effect.applyCondition ?? "").trim();
  if (conditionKey && Math.random() < normalizeChance(effect.conditionChance)) {
    const duration = normalizeDuration(effect.conditionDuration);
    let conditionTextOverride = null;
    let applied;

    if (conditionKey === "bleeding" && hasBodyHp(target)) {
      const partKey = getResultBodyPartKey(result);
      const stacks = getBleedingStackAmount(duration, conditionValueKind);
      applied = await applyLocalBleedingCondition(target, partKey, stacks);
      conditionTextOverride = `${getConditionLabel(conditionKey)} +${stacks} (${getTargetPartLabel(partKey)})`;
    } else {
      applied = await addOrExtendActorCondition(target, conditionKey, duration, {
        mode: conditionMode,
        valueKind: conditionValueKind,
      });
    }

    outcome.conditions.push(applied);
    conditionTexts.push(conditionTextOverride ?? `${getConditionLabel(conditionKey)}${duration > 1 ? ` (${duration}с)` : ""}`);
  }

  const conditionStacks = normalizeConditionStacks(effect.conditionStacks ?? effect.stacks ?? []);
  if (conditionStacks.length) {
    const appliedStacks = await applyConditionStacks(target, conditionStacks, { mode: "add" });
    outcome.conditions.push(...appliedStacks);
    for (const stack of conditionStacks) {
      conditionTexts.push(`${getStackLabel(stack)} +${stack.value}`);
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
