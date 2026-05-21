import { getTargetPartLabel } from "./actor-state-service.mjs";
import {
  applyMedicalActionGlobally,
  applyMedicalActionToBodyPart,
} from "./condition-service.mjs";
import { healActorBodyPart } from "./hit-effect-service.mjs";
import {
  recalculateActorWeight,
  removeQuantityFromItem,
} from "./inventory-service.mjs";
import {
  normalizeAoeConfig,
  normalizeAoeTargetZone,
  resolveAoeFriendlyFireMode,
} from "./aoe-policy-service.mjs";
import { getPersistentActor } from "../utils/actor-utils.mjs";

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

const APPLICATION_SCOPES = new Set(["targeted", "global", "auto", "area"]);
const TARGET_ACTOR_MODES = new Set(["self", "selected-or-self", "selected-only", "area"]);

export function getItemActionType(item) {
  return String(item?.system?.actionType ?? "").trim();
}

export function getItemApplicationScope(item, fallback = "targeted") {
  const raw = String(item?.system?.applicationScope ?? "").trim().toLowerCase();
  return APPLICATION_SCOPES.has(raw) ? raw : fallback;
}

export function getItemTargetActorMode(item, fallback = "self") {
  const raw = String(item?.system?.targetActorMode ?? "").trim().toLowerCase();
  return TARGET_ACTOR_MODES.has(raw) ? raw : fallback;
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
    targetZone: system.targetZone,
    targetPart: system.targetPart,
  }, {
    shape: system.aoeShape,
    type: system.aoeType,
    distance: system.aoeDistance,
    maxTargets: system.maxTargets,
    chainDecay: 1,
    friendlyFireMode: aoe.friendlyFireMode ?? system.friendlyFireMode,
    friendlyFire: aoe.friendlyFire ?? system.friendlyFire,
  });

  return config.distance > 0 ? config : null;
}

export function buildThrowableConditionStacks(poison = 0, burning = 0) {
  return [
    { key: "poison", value: Number(poison ?? 0) },
    { key: "burning", value: Number(burning ?? 0) },
  ];
}

export function getSelectedActorTargets(sourceActor, targets = game.user?.targets ?? []) {
  return Array.from(targets)
    .map(token => token?.actor ?? null)
    .filter(Boolean)
    .filter(actor => actor.id !== sourceActor?.id);
}

export async function resolveItemActionTargetActor({
  sourceActor,
  item,
  selectedActors = getSelectedActorTargets(sourceActor),
  chooseActor = null,
} = {}) {
  const targetActorMode = getItemTargetActorMode(item, "self");

  if (targetActorMode === "self" || targetActorMode === "area") {
    return { ok: true, cancelled: false, targetActor: sourceActor, reason: "" };
  }

  if (targetActorMode === "selected-only") {
    if (selectedActors.length === 1) {
      return { ok: true, cancelled: false, targetActor: selectedActors[0], reason: "" };
    }

    if (selectedActors.length > 1 && chooseActor) {
      const choice = await chooseActor(selectedActors);
      if (!choice) return { ok: false, cancelled: true, targetActor: null, reason: "" };
      return { ok: true, cancelled: false, targetActor: choice, reason: "" };
    }

    return {
      ok: false,
      cancelled: true,
      targetActor: null,
      reason: selectedActors.length > 1 ? "" : "Выделите цель токеном.",
    };
  }

  if (targetActorMode === "selected-or-self") {
    if (selectedActors.length === 1) {
      return { ok: true, cancelled: false, targetActor: selectedActors[0], reason: "" };
    }

    if (selectedActors.length > 1 && chooseActor) {
      const choice = await chooseActor([sourceActor, ...selectedActors]);
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
  choosePart = null,
} = {}) {
  const presetPart = String(item?.system?.targetPart ?? "").trim();
  const scope = getItemApplicationScope(item, "targeted");

  if (scope === "global") {
    return { ok: true, cancelled: false, targetPart: null };
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
    content: `<b>${liveActor.name}</b> использует <b>${liveItem.name}</b><br>Сытость: +${satietyGain}<br>Жажда: +${hydrationGain}`,
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
    content: `<b>${liveActor.name}</b> делает глоток из <b>${liveItem.name}</b> (${nextCurrent}/${max}). Жажда: +${hydrationGain} · Сытость: +${satietyGain}`,
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

  if (effectType === "healHP") {
    const { newHP } = await healActorBodyPart(liveActor, targetPart, power);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: liveActor }),
      content: `<b>${liveActor.name}</b> выпивает <b>${liveItem.name}</b><br>Лечение: ${power}<br>${getTargetPartLabel(targetPart)} теперь имеет HP: ${newHP}`,
    });
    await consumeOneItem(liveActor, liveItem);
    return itemEffectResult({ consumedItem: true, changed: true });
  }

  if (effectType === "restoreEnergy") {
    const energy = getBoundedResource(liveActor, "energy", { maxFallback: 100 });
    const next = Math.min(energy.max, energy.current + power);
    await liveActor.update({ "system.resources.energy.value": next });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: liveActor }),
      content: `<b>${liveActor.name}</b> выпивает <b>${liveItem.name}</b><br>⚡ Энергия: ${energy.current} → ${next}/${energy.max}`,
    });
    await consumeOneItem(liveActor, liveItem);
    return itemEffectResult({ consumedItem: true, changed: true });
  }

  if (effectType === "restoreEnergyMax") {
    const baseMax = Number(liveActor.system?.resources?.energy?.baseMax ?? liveActor.system?.resources?.energy?.max ?? 10);
    const currentMax = Number(liveActor.system?.resources?.energy?.max ?? 10);
    const current = Number(liveActor.system?.resources?.energy?.value ?? 0);
    const nextMax = Math.min(baseMax, currentMax + power);
    const nextCurrent = Math.min(nextMax, current + power);
    await liveActor.update({
      "system.resources.energy.max": nextMax,
      "system.resources.energy.value": nextCurrent,
    });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: liveActor }),
      content: `<b>${liveActor.name}</b> выпивает <b>${liveItem.name}</b><br>⚡ Макс. энергия: ${currentMax} → ${nextMax} (+${power})`,
    });
    await consumeOneItem(liveActor, liveItem);
    return itemEffectResult({ consumedItem: true, changed: true });
  }

  if (effectType === "restoreMana") {
    const mana = getBoundedResource(liveActor, "mana", { maxFallback: 50 });
    const next = Math.min(mana.max, mana.current + power);
    await liveActor.update({ "system.resources.mana.value": next });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: liveActor }),
      content: `<b>${liveActor.name}</b> выпивает <b>${liveItem.name}</b><br>Мана: +${power}`,
    });
    await consumeOneItem(liveActor, liveItem);
    return itemEffectResult({ consumedItem: true, changed: true });
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
