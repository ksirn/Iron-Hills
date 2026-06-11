import {
  applyMedicalActionGlobally,
  applyMedicalActionToBodyPart,
} from "./condition-service.mjs";
import {
  recalculateActorWeight,
  removeQuantityFromItem,
} from "./inventory-service.mjs";
import {
  normalizeAoeConfig,
  normalizeAoeTargetZone,
  resolveAoeFriendlyFireMode,
} from "./aoe-policy-service.mjs";
import {
  getCombatTargetActor,
  normalizeCombatTargets,
} from "./combat-action-target-service.mjs";
import { buildCombatChatCard } from "./combat-chat-service.mjs";
import { getPersistentActor } from "../utils/actor-utils.mjs";
import {
  ITEM_ACTION_TYPE_DEFAULTS as ACTION_TYPE_DEFAULTS,
  ITEM_APPLICATION_SCOPES as APPLICATION_SCOPES,
  ITEM_TARGET_ACTOR_MODES as TARGET_ACTOR_MODES,
  LEGACY_ITEM_EFFECT_ACTIONS as LEGACY_POTION_EFFECT_ACTIONS,
} from "../utils/item-action-config.mjs";

function itemEffectResult({
  ok = true,
  handled = true,
  consumedItem = false,
  consumeItem = false,
  cancelled = false,
  changed = false,
} = {}) {
  return { ok, handled, consumedItem, consumeItem, cancelled, changed };
}

function normalizeApplicationScopeValue(value) {
  const raw = String(value ?? "").trim();
  if (APPLICATION_SCOPES.has(raw)) return raw;

  const alias = {
    single: "targeted",
    target: "targeted",
    targeted: "targeted",
    body: "global",
    self: "global",
    aoe: "area",
  }[raw.toLowerCase()];

  return APPLICATION_SCOPES.has(alias) ? alias : "";
}

function normalizeTargetActorModeValue(value) {
  const raw = String(value ?? "").trim();
  if (TARGET_ACTOR_MODES.has(raw)) return raw;

  const alias = {
    selected: "selected-only",
    "selected-only": "selected-only",
    selectedonly: "selected-only",
    target: "selected-only",
    enemy: "selected-only",
    targeted: "selected-or-self",
    "selected-or-self": "selected-or-self",
    selectedorself: "selected-or-self",
    ally: "selected-or-self",
    self: "self",
    area: "area",
    aoe: "area",
  }[raw.toLowerCase()];

  return TARGET_ACTOR_MODES.has(alias) ? alias : "";
}

function uniqueActors(actors = [], { includeSource = true, sourceActor = null } = {}) {
  const seen = new Set();

  return (actors ?? [])
    .map(actor => getCombatTargetActor(actor) ?? actor?.actor ?? actor)
    .filter(Boolean)
    .filter(actor => includeSource || actor.id !== sourceActor?.id)
    .filter(actor => {
      const key = actor.uuid ?? actor.id ?? actor.name;
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function normalizeItemActionSelectedActors(sourceActor, {
  targets = null,
  selectedActors = null,
  includeSource = false,
} = {}) {
  const rawActors = Array.isArray(selectedActors)
    ? selectedActors
    : normalizeCombatTargets(targets ?? globalThis.game?.user?.targets ?? []);

  return uniqueActors(rawActors, { includeSource, sourceActor });
}

export function getItemActionType(item) {
  return String(item?.system?.actionType ?? "").trim();
}

export function getItemApplicationScope(item, fallback = "targeted") {
  const raw = normalizeApplicationScopeValue(item?.system?.applicationScope);
  if (raw) return raw;

  const actionScope = normalizeApplicationScopeValue(item?.system?.actionScope);
  if (actionScope) return actionScope;

  const inferred = ACTION_TYPE_DEFAULTS[getItemActionType(item)]?.applicationScope;
  return APPLICATION_SCOPES.has(inferred) ? inferred : fallback;
}

export function getItemTargetActorMode(item, fallback = "self") {
  const raw = normalizeTargetActorModeValue(item?.system?.targetActorMode);
  if (raw) return raw;

  const inferred = ACTION_TYPE_DEFAULTS[getItemActionType(item)]?.targetActorMode;
  return TARGET_ACTOR_MODES.has(inferred) ? inferred : fallback;
}

export function getItemActionPower(item, fallback = 1) {
  return Number(item?.system?.power ?? fallback);
}

export { normalizeAoeTargetZone as normalizeTargetZone };

export function getThrowableAoeConfig(item) {
  const system = item?.system ?? {};
  const aoe = system.aoe && typeof system.aoe === "object" ? system.aoe : {};
  const config = normalizeAoeConfig({
    ...aoe,
    friendlyFireMode: resolveAoeFriendlyFireMode(
      aoe.friendlyFireMode,
      system.friendlyFireMode,
      aoe.friendlyFire,
      system.friendlyFire,
      false,
    ),
    damageType: system.damageType,
    targetZone: aoe.targetZone ?? system.targetZone,
    targetPart: aoe.targetPart ?? system.targetPart,
    targetZoneMode: aoe.targetZoneMode ?? system.targetZoneMode,
  }, {
    shape: system.aoeShape,
    type: system.aoeType,
    distance: system.aoeDistance,
    maxTargets: system.maxTargets,
    chainDecay: 1,
    friendlyFireMode: aoe.friendlyFireMode ?? system.friendlyFireMode,
    friendlyFire: aoe.friendlyFire ?? system.friendlyFire,
    targetZone: system.targetZone,
    targetPart: system.targetPart,
    targetZoneMode: system.targetZoneMode,
  });

  return config.distance > 0 ? config : null;
}

export function buildThrowableConditionStacks(poison = 0, burning = 0) {
  return [
    { key: "poison", value: Number(poison ?? 0) },
    { key: "burning", value: Number(burning ?? 0) },
  ];
}

export function getSelectedActorTargets(sourceActor, targets = globalThis.game?.user?.targets ?? []) {
  return normalizeItemActionSelectedActors(sourceActor, { targets });
}

export async function resolveItemActionTargetActor({
  sourceActor,
  item,
  targetActor = null,
  targets = null,
  selectedActors = null,
  chooseActor = null,
} = {}) {
  const targetActorMode = getItemTargetActorMode(item, "self");
  const explicitTarget = uniqueActors([targetActor], { includeSource: true })[0] ?? null;

  if (targetActorMode === "self" || targetActorMode === "area") {
    return { ok: true, cancelled: false, targetActor: sourceActor, reason: "" };
  }

  if (explicitTarget) {
    return { ok: true, cancelled: false, targetActor: explicitTarget, reason: "" };
  }

  const resolvedSelectedActors = Array.isArray(selectedActors)
    ? normalizeItemActionSelectedActors(sourceActor, { selectedActors })
    : normalizeItemActionSelectedActors(sourceActor, { targets });

  if (targetActorMode === "selected-only") {
    if (resolvedSelectedActors.length === 1) {
      return { ok: true, cancelled: false, targetActor: resolvedSelectedActors[0], reason: "" };
    }

    if (resolvedSelectedActors.length > 1 && chooseActor) {
      const choice = await chooseActor(resolvedSelectedActors);
      if (!choice) return { ok: false, cancelled: true, targetActor: null, reason: "" };
      return { ok: true, cancelled: false, targetActor: choice, reason: "" };
    }

    return {
      ok: false,
      cancelled: true,
      targetActor: null,
      reason: resolvedSelectedActors.length > 1 ? "" : "Выделите цель токеном.",
    };
  }

  if (targetActorMode === "selected-or-self") {
    if (resolvedSelectedActors.length === 1) {
      return { ok: true, cancelled: false, targetActor: resolvedSelectedActors[0], reason: "" };
    }

    if (resolvedSelectedActors.length > 1 && chooseActor) {
      const choice = await chooseActor(uniqueActors([sourceActor, ...resolvedSelectedActors], { includeSource: true }));
      if (!choice) return { ok: false, cancelled: true, targetActor: null, reason: "" };
      return { ok: true, cancelled: false, targetActor: choice, reason: "" };
    }

    return { ok: true, cancelled: false, targetActor: sourceActor, reason: "" };
  }

  return { ok: true, cancelled: false, targetActor: sourceActor, reason: "" };
}

export async function resolveItemTargetPart({
  targetActor,
  item,
  targetPart = null,
  choosePart = null,
} = {}) {
  const explicitPart = normalizeAoeTargetZone(targetPart) ?? String(targetPart ?? "").trim();
  const presetPart = normalizeAoeTargetZone(item?.system?.targetPart) ?? String(item?.system?.targetPart ?? "").trim();
  const scope = getItemApplicationScope(item, "targeted");

  if (scope === "global") {
    return { ok: true, cancelled: false, targetPart: null };
  }

  if (explicitPart) {
    return { ok: true, cancelled: false, targetPart: explicitPart };
  }

  if (scope === "auto" || scope === "area") {
    return { ok: true, cancelled: false, targetPart: presetPart || null };
  }

  if (presetPart) {
    return { ok: true, cancelled: false, targetPart: presetPart };
  }

  if (!choosePart) {
    return { ok: false, cancelled: true, targetPart: null };
  }

  const selectedPart = await choosePart(targetActor);
  if (!selectedPart) {
    return { ok: false, cancelled: true, targetPart: null };
  }

  return { ok: true, cancelled: false, targetPart: selectedPart };
}

function getLiveActor(actor) {
  return getPersistentActor(actor) ?? actor ?? null;
}

function getLiveItem(actor, item) {
  const liveActor = getLiveActor(actor);
  if (!liveActor || !item) return { liveActor, liveItem: null };
  return {
    liveActor,
    liveItem: liveActor.items?.get(item.id) ?? item,
  };
}

function getBoundedResource(actor, key, { maxFallback = 0 } = {}) {
  const node = actor?.system?.resources?.[key] ?? {};
  return {
    current: Number(node.value ?? 0),
    max: Number(node.max ?? maxFallback),
  };
}

async function consumeOneItem(actor, item) {
  await removeQuantityFromItem(actor, item, 1);
  await recalculateActorWeight(actor);
}

export async function consumeFoodItem(actor, item) {
  const { liveActor, liveItem } = getLiveItem(actor, item);
  if (!liveActor || !liveItem || liveItem.type !== "food") {
    ui.notifications.warn("Предмет не найден или не является едой");
    return itemEffectResult({ ok: false, handled: true });
  }

  const satietyGain = Number(liveItem.system?.satiety ?? 0);
  const hydrationGain = Number(liveItem.system?.hydration ?? 0);
  const satiety = getBoundedResource(liveActor, "satiety", { maxFallback: 100 });
  const hydration = getBoundedResource(liveActor, "hydration", { maxFallback: 100 });

  await liveActor.update({
    "system.resources.satiety.value": Math.min(satiety.max, satiety.current + satietyGain),
    "system.resources.hydration.value": Math.min(hydration.max, hydration.current + hydrationGain),
  });

  await consumeOneItem(liveActor, liveItem);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: liveActor }),
    content: buildCombatChatCard({
      title: "Еда",
      subtitle: liveItem.name,
      icon: "+",
      status: "Использовано",
      statusClass: "is-good",
      rows: [
        ["Персонаж", liveActor.name],
        ["Предмет", liveItem.name],
        ["Сытость", `+${satietyGain}`],
        ["Жажда", `+${hydrationGain}`],
      ],
      className: "ih-system-chat-card ih-consume-chat-card",
    }),
  });

  return itemEffectResult({ consumedItem: true, changed: true });
}

export async function drinkFromVessel(actor, item) {
  const { liveActor, liveItem } = getLiveItem(actor, item);
  if (!liveActor || !liveItem) {
    return itemEffectResult({ ok: false, handled: false });
  }

  const max = Number(liveItem.system?.vesselMax ?? 0);
  const current = Number(liveItem.system?.vesselCurrent ?? 0);
  if (!(max > 0)) {
    return itemEffectResult({ ok: false, handled: false });
  }

  if (current <= 0) {
    ui.notifications.warn("Пустая фляга — нужен источник воды.");
    return itemEffectResult({ consumeItem: false });
  }

  const hydrationGain = Number(liveItem.system?.vesselHydrationPerDrink ?? 0);
  const satietyGain = Number(liveItem.system?.vesselSatietyPerDrink ?? 0);
  const satiety = getBoundedResource(liveActor, "satiety", { maxFallback: 100 });
  const hydration = getBoundedResource(liveActor, "hydration", { maxFallback: 100 });
  const nextCurrent = Math.max(0, current - 1);
  const nextWeight = Math.max(0.12, Number(liveItem.system?.weight ?? 0.4) - 0.02);

  await liveActor.update({
    "system.resources.satiety.value": Math.min(satiety.max, satiety.current + satietyGain),
    "system.resources.hydration.value": Math.min(hydration.max, hydration.current + hydrationGain),
  });

  await liveItem.update({
    "system.vesselCurrent": nextCurrent,
    "system.weight": nextWeight,
  });
  await recalculateActorWeight(liveActor);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: liveActor }),
    content: buildCombatChatCard({
      title: "Глоток",
      subtitle: liveItem.name,
      icon: "+",
      status: `${nextCurrent}/${max}`,
      statusClass: nextCurrent > 0 ? "is-good" : "is-warn",
      rows: [
        ["Персонаж", liveActor.name],
        ["Ёмкость", liveItem.name],
        ["Осталось", `${nextCurrent}/${max}`],
        ["Жажда", `+${hydrationGain}`],
        ["Сытость", `+${satietyGain}`],
      ],
      className: "ih-system-chat-card ih-consume-chat-card ih-drink-chat-card",
    }),
  });

  return itemEffectResult({ changed: true });
}

export async function useLegacyPotionEffect(actor, item) {
  const { liveActor, liveItem } = getLiveItem(actor, item);
  if (!liveActor || !liveItem || liveItem.type !== "potion") {
    ui.notifications.warn("Зелье не найдено");
    return itemEffectResult({ ok: false, handled: true });
  }

  const power = Number(liveItem.system?.power ?? 0);
  const effectType = liveItem.system?.effectType ?? liveItem.system?.effect;
  const targetPart = liveItem.system?.targetPart ?? liveItem.system?.zone ?? "torso";
  const legacyAction = LEGACY_POTION_EFFECT_ACTIONS[effectType];

  if (legacyAction?.applicationScope === "targeted") {
    return applyMedicalActionToBodyPart(
      liveActor,
      liveActor,
      liveItem,
      legacyAction.actionType,
      targetPart,
      power
    );
  }

  if (legacyAction?.applicationScope === "global") {
    return applyMedicalActionGlobally(
      liveActor,
      liveActor,
      liveItem,
      legacyAction.actionType,
      power
    );
  }

  return itemEffectResult({ handled: false });
}

export async function applyConfiguredItemAction({
  sourceActor,
  targetActor = null,
  item,
  targetPart = null,
} = {}) {
  const actionType = getItemActionType(item);
  if (!actionType) return itemEffectResult({ handled: false });

  if (actionType === "drink-vessel") {
    return drinkFromVessel(sourceActor, item);
  }

  const scope = getItemApplicationScope(item, "targeted");
  const power = getItemActionPower(item, 1);
  const resolvedTarget = targetActor || sourceActor;

  if (scope === "global") {
    return applyMedicalActionGlobally(sourceActor, resolvedTarget, item, actionType, power);
  }

  if (!targetPart) {
    return itemEffectResult({ handled: true, cancelled: true });
  }

  return applyMedicalActionToBodyPart(sourceActor, resolvedTarget, item, actionType, targetPart, power);
}
