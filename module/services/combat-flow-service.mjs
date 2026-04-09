import {
  resolveActorFromUuid,
  getPersistentActor,
  getPersistentActorUuid
} from "../utils/actor-utils.mjs";

const DEFAULT_TURN_SECONDS = 6;
const ALLOWED_SIDES = new Set(["ally", "enemy", "neutral"]);

function deepClone(value) {
  return foundry.utils.deepClone(value);
}

function nowStamp() {
  return new Date().toLocaleString("ru-RU");
}

function randomId(prefix = "combat") {
  return `${prefix}-${foundry.utils.randomID()}`;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCombatStore() {
  game.ironHills = game.ironHills || {};

  if (!game.ironHills._combatState) {
    game.ironHills._combatState = {
      active: false,
      combatId: "",
      round: 0,
      turn: 0,
      activeParticipantId: "",
      participants: [],
      log: [],
      createdAt: "",
      updatedAt: "",
      revision: 0
    };
  }

  return game.ironHills._combatState;
}

function getCombatStateInternal() {
  return getCombatStore();
}

let _combatUiRefreshScheduled = false;

function forceRefreshOpenCombatWindows() {
  const apps = game.ironHills?.apps ?? {};

  const refreshTargets = [
    apps.combatHud,
    apps.combatManager
  ].filter(Boolean);

  for (const app of refreshTargets) {
    if (!app?.rendered) continue;
    try {
      app.render(true, { focus: false });
    } catch (err) {
      console.error("Iron Hills | direct combat window refresh error", err);
    }
  }

  for (const app of Object.values(ui.windows ?? {})) {
    if (!app?.rendered) continue;

    const className = app.constructor?.name ?? "";
    const appClasses = Array.isArray(app.options?.classes) ? app.options.classes : [];

    const isIronHillsActorSheet =
      className === "IronHillsActorSheet" || appClasses.includes("iron-hills-sheet");

    if (!isIronHillsActorSheet) continue;

    try {
      app.render(true, { focus: false });
    } catch (err) {
      console.error("Iron Hills | actor sheet combat refresh error", err);
    }
  }
}

function scheduleCombatUiRefresh() {
  if (_combatUiRefreshScheduled) return;
  _combatUiRefreshScheduled = true;

  // Один debounced вызов через rAF — достаточно для синхронизации с браузерным циклом.
  // Тройной вызов (microtask + rAF + setTimeout) создавал лишние перерисовки и
  // промежуточные состояния UI после каждого изменения боевого состояния.
  requestAnimationFrame(() => {
    _combatUiRefreshScheduled = false;
    forceRefreshOpenCombatWindows();
  });
}

function notifyCombatUi() {
  const state = getCombatState();

  Hooks.callAll("ironHillsCombatStateUpdated", state);
  Hooks.callAll("ironHillsCombatUpdated", state);

  scheduleCombatUiRefresh();
}

function notifyPendingActionReady(participant) {
  if (!participant?.pendingAction) return;

  const payload = {
    participant: deepClone(participant),
    action: deepClone(participant.pendingAction)
  };

  Hooks.callAll("ironHillsPendingActionReady", payload);
}

function saveCombatState(nextState) {
  const store = getCombatStore();
  const cloned = deepClone(nextState);
  cloned.updatedAt = nowStamp();
  cloned.revision = Number(store.revision ?? 0) + 1;

  for (const key of Object.keys(store)) delete store[key];
  Object.assign(store, cloned);

  notifyCombatUi();
  return store;
}

function normalizeSide(side) {
  return ALLOWED_SIDES.has(side) ? side : "neutral";
}

function resolveActor(actorOrId) {
  if (!actorOrId) return null;

  let actor = null;

  if (typeof actorOrId === "string") {
    actor = resolveActorFromUuid(actorOrId) ?? game.actors?.get(actorOrId) ?? null;
    return getPersistentActor(actor) ?? actor ?? null;
  }

  if (actorOrId.documentName === "Actor") actor = actorOrId;
  else if (actorOrId.documentName === "Token" || actorOrId.documentName === "TokenDocument") {
    actor = actorOrId.actor ?? null;
  } else if (actorOrId.actor?.documentName === "Actor") {
    actor = actorOrId.actor;
  } else if (actorOrId.token?.actor?.documentName === "Actor") {
    actor = actorOrId.token.actor;
  }

  return getPersistentActor(actor) ?? actor ?? null;
}

function resolveToken(actorOrTokenOrData) {
  if (!actorOrTokenOrData) return null;

  if (actorOrTokenOrData.documentName === "Token" || actorOrTokenOrData.documentName === "TokenDocument") {
    return actorOrTokenOrData;
  }

  if (actorOrTokenOrData.object?.documentName === "Token") return actorOrTokenOrData.object;
  if (actorOrTokenOrData.token?.documentName === "Token") return actorOrTokenOrData.token;
  if (actorOrTokenOrData.token?.documentName === "TokenDocument") return actorOrTokenOrData.token;

  return null;
}

function getActorUuid(actor) {
  return getPersistentActorUuid(actor);
}

function sanitizeParticipants(participants = []) {
  const result = [];

  for (const participant of participants) {
    if (!participant) continue;

    const actor = resolveParticipantActor(participant);
    if (!actor) continue;

    const maxSeconds = Math.max(1, Number(participant.maxSeconds ?? DEFAULT_TURN_SECONDS));
    const remainingSeconds = Math.max(0, Number(participant.remainingSeconds ?? maxSeconds));

    result.push({
      ...participant,
      actorId: actor.id,
      actorUuid: getActorUuid(actor),
      actorName: participant.actorName || actor.name || "Unknown",
      actorType: participant.actorType || actor.type || "",
      maxSeconds,
      remainingSeconds,
      side: normalizeSide(participant.side || "neutral"),
      initiative: Number(participant.initiative ?? 0),
      initiativeBonus: Number(participant.initiativeBonus ?? 0),
      initiativeSkill: Number(participant.initiativeSkill ?? 0),
      initiativeRoll: Number(participant.initiativeRoll ?? 0),
      initiativeTotal: Number(participant.initiativeTotal ?? participant.initiative ?? 0),
      hasActed: Boolean(participant.hasActed),
      defeated: Boolean(participant.defeated ?? !isActorAlive(actor)),
      active: Boolean(participant.active),
      pendingAction: participant.pendingAction ? deepClone(participant.pendingAction) : null
    });
  }

  return result;
}

function getCurrentParticipantFromState(state) {
  if (!state?.participants?.length) return null;

  const activeParticipantId = String(state.activeParticipantId ?? "");
  if (activeParticipantId) {
    const byId = state.participants.find(participant => String(participant.id ?? "") === activeParticipantId) ?? null;
    if (byId) return byId;
  }

  const turnIndex = Math.max(0, Number(state.turn ?? 1) - 1);
  return state.participants[turnIndex] ?? null;
}

function normalizeCombatState(state) {
  state.active = Boolean(state.active);
  state.combatId = String(state.combatId ?? "");
  state.round = Math.max(0, Number(state.round ?? 0));
  state.turn = Math.max(0, Number(state.turn ?? 0));
  state.activeParticipantId = String(state.activeParticipantId ?? "");
  state.participants = sanitizeParticipants(state.participants ?? []);
  state.log = Array.isArray(state.log) ? state.log : [];
  state.createdAt = String(state.createdAt ?? "");
  state.updatedAt = String(state.updatedAt ?? "");
  state.revision = Number(state.revision ?? 0);

  if (!state.participants.length) {
    state.turn = 0;
    state.activeParticipantId = "";
    return state;
  }

  let activeParticipant =
    state.participants.find(participant => String(participant.id ?? "") === String(state.activeParticipantId ?? "")) ?? null;

  if (!activeParticipant) {
    const safeIndex = Math.max(0, Math.min(Math.max(0, Number(state.turn ?? 1) - 1), state.participants.length - 1));
    activeParticipant = state.participants[safeIndex] ?? null;
  }

  if (!activeParticipant) {
    activeParticipant = state.participants[0] ?? null;
  }

  state.activeParticipantId = activeParticipant?.id || "";
  state.turn = Math.max(1, state.participants.findIndex(p => p.id === state.activeParticipantId) + 1);

  for (const participant of state.participants) {
    participant.active = participant.id === state.activeParticipantId;
  }

  return state;
}

function getParticipantIndexById(state, participantId) {
  return (state.participants ?? []).findIndex(participant => String(participant.id ?? "") === String(participantId ?? ""));
}

function getParticipantIndexByActorUuid(state, actorUuid) {
  return (state.participants ?? []).findIndex(
    participant => String(participant.actorUuid ?? "") === String(actorUuid ?? "")
  );
}

function getTokenUuid(token) {
  return token?.document?.uuid || token?.uuid || "";
}

function getActorInitiativeBonus(actor) {
  if (!actor) return 0;

  const skills = actor.system?.skills ?? {};
  const perception = Number(skills.perception?.value ?? 0);
  const athletics = Number(skills.athletics?.value ?? 0);
  const swords = Number(skills.swords?.value ?? skills.sword?.value ?? 0);
  const daggers = Number(skills.daggers?.value ?? skills.knife?.value ?? 0);

  return Math.max(perception, athletics, swords, daggers, 0);
}

function rollInitiativeData(actor) {
  const initiativeSkill = getActorInitiativeBonus(actor);
  const initiativeRoll = randInt(1, 20);
  const initiativeTotal = initiativeRoll + initiativeSkill;

  return {
    initiativeSkill,
    initiativeRoll,
    initiativeTotal
  };
}

function getParticipantCurrentHp(actor) {
  const hp = actor?.system?.resources?.hp ?? {};

  return (
    Number(hp.head?.value ?? 0) +
    Number(hp.torso?.value ?? 0) +
    Number(hp.abdomen?.value ?? 0) +
    Number(hp.leftArm?.value ?? 0) +
    Number(hp.rightArm?.value ?? 0) +
    Number(hp.leftLeg?.value ?? 0) +
    Number(hp.rightLeg?.value ?? 0)
  );
}

function isActorAlive(actor) {
  if (!actor) return false;

  const torso = Number(actor.system?.resources?.hp?.torso?.value ?? 0);
  const head = Number(actor.system?.resources?.hp?.head?.value ?? 0);

  if (torso <= 0 || head <= 0) return false;
  return getParticipantCurrentHp(actor) > 0;
}

function createPendingAction(data = {}) {
  return {
    id: data.id || randomId("pending"),
    label: data.label || "Длительное действие",
    actionType: data.actionType || data.data?.actionType || "generic",
    totalSeconds: Number(data.totalSeconds ?? 0),
    spentSeconds: Number(data.spentSeconds ?? 0),
    remainingSeconds: Number(data.remainingSeconds ?? 0),
    requiresConfirmation: Boolean(data.requiresConfirmation ?? true),
    startedRound: Number(data.startedRound ?? 1),
    startedTurn: Number(data.startedTurn ?? 1),
    actorId: data.actorId || "",
    actorUuid: data.actorUuid || "",
    data: deepClone(data.data ?? {})
  };
}

function buildCombatParticipant(actorOrTokenOrData, extra = {}) {
  const actor = resolveActor(actorOrTokenOrData);
  if (!actor) return null;

  const token = resolveToken(actorOrTokenOrData);
  const initiativeData = Number.isFinite(Number(extra.initiative))
    ? {
        initiativeSkill: Number(extra.initiativeSkill ?? getActorInitiativeBonus(actor)),
        initiativeRoll: Number(
          extra.initiativeRoll ?? Math.max(1, Number(extra.initiative) - Number(extra.initiativeSkill ?? 0))
        ),
        initiativeTotal: Number(extra.initiativeTotal ?? extra.initiative)
      }
    : rollInitiativeData(actor);

  const maxSeconds = Math.max(1, Number(extra.maxSeconds ?? DEFAULT_TURN_SECONDS));

  const pendingAction = extra.pendingAction
    ? createPendingAction({
        ...extra.pendingAction,
        actorId: actor.id,
        actorUuid: getActorUuid(actor)
      })
    : null;

  return {
    id: extra.id || randomId("participant"),
    actorId: actor.id,
    actorUuid: getActorUuid(actor),
    actorName: extra.actorName || actor.name,
    actorType: extra.actorType || actor.type,
    tokenId: extra.tokenId || token?.id || "",
    tokenUuid: extra.tokenUuid || getTokenUuid(token),
    tokenName: extra.tokenName || token?.name || actor.name,
    img: extra.img || token?.texture?.src || token?.document?.texture?.src || actor.img || "icons/svg/mystery-man.svg",
    side: normalizeSide(extra.side || "neutral"),
    initiative: Number(extra.initiative ?? initiativeData.initiativeTotal),
    initiativeBonus: Number(extra.initiativeBonus ?? initiativeData.initiativeSkill),
    initiativeSkill: Number(extra.initiativeSkill ?? initiativeData.initiativeSkill),
    initiativeRoll: Number(extra.initiativeRoll ?? initiativeData.initiativeRoll),
    initiativeTotal: Number(extra.initiativeTotal ?? initiativeData.initiativeTotal),
    maxSeconds,
    remainingSeconds: Math.max(0, Number(extra.remainingSeconds ?? maxSeconds)),
    hasActed: Boolean(extra.hasActed ?? false),
    defeated: Boolean(extra.defeated ?? !isActorAlive(actor)),
    active: Boolean(extra.active ?? false),
    pendingAction
  };
}

function sortParticipants(participants) {
  return [...participants].sort((a, b) => {
    if (a.defeated !== b.defeated) return a.defeated ? 1 : -1;
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    return (a.actorName || "").localeCompare(b.actorName || "", "ru");
  });
}

function setActiveParticipantByIndex(state, index) {
  const participants = state.participants ?? [];

  if (!participants.length) {
    state.turn = 0;
    state.activeParticipantId = "";
    return state;
  }

  const safeIndex = Math.max(0, Math.min(index, participants.length - 1));
  const participant = participants[safeIndex] ?? null;

  state.turn = safeIndex + 1;
  state.activeParticipantId = participant?.id || "";

  for (const entry of participants) {
    entry.active = entry.id === state.activeParticipantId;
  }

  return state;
}

function getNextAliveParticipantIndex(participants, startIndex = 0) {
  if (!participants.length) return -1;

  for (let offset = 0; offset < participants.length; offset += 1) {
    const index = (startIndex + offset) % participants.length;
    const participant = participants[index];
    if (!participant?.defeated) return index;
  }

  return -1;
}

function refreshDefeatedFlags(state) {
  for (const participant of state.participants ?? []) {
    const actor = resolveActor(participant.actorUuid || participant.actorId);
    participant.defeated = !isActorAlive(actor);
  }

  return state;
}

const BODY_PART_KEYS = ["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"];

function getBodyPartHpNode(actor, partKey) {
  return actor?.system?.resources?.hp?.[partKey] ?? null;
}

function getBodyPartStatus(actor, partKey) {
  return getBodyPartHpNode(actor, partKey)?.status ?? null;
}

function getDefaultBodyPartStatus() {
  return {
    minorBleeding: 0,
    majorBleeding: 0,
    fracture: false,
    destroyed: false,
    splinted: false,
    tourniquet: false
  };
}

async function ensureActorBodyStatusStructure(actor) {
  if (!actor) return;

  const updates = {};

  for (const partKey of BODY_PART_KEYS) {
    const hpNode = getBodyPartHpNode(actor, partKey);
    if (!hpNode) continue;

    const status = hpNode.status ?? {};
    const merged = {
      ...getDefaultBodyPartStatus(),
      ...status
    };

    const keys = Object.keys(getDefaultBodyPartStatus());
    let changed = false;

    for (const key of keys) {
      if (status?.[key] === undefined) {
        changed = true;
        break;
      }
    }

    if (changed || !hpNode.status) {
      updates[`system.resources.hp.${partKey}.status`] = merged;
    }
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
  }
}

function getBodyPartStatusValue(actor, partKey, key) {
  const status = getBodyPartStatus(actor, partKey) ?? {};
  const raw = status?.[key];

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

function buildBodyPartStatusPath(partKey, key) {
  return `system.resources.hp.${partKey}.status.${key}`;
}

async function refreshDestroyedBodyParts(actor) {
  if (!actor) return;

  const updates = {};

  for (const partKey of BODY_PART_KEYS) {
    const hpNode = getBodyPartHpNode(actor, partKey);
    if (!hpNode) continue;

    const currentHp = Number(hpNode.value ?? 0);
    const isDestroyed = currentHp <= 0;
    const currentFlag = Boolean(hpNode.status?.destroyed);

    if (isDestroyed !== currentFlag) {
      updates[buildBodyPartStatusPath(partKey, "destroyed")] = isDestroyed;
    }
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
  }
}

function getBodyPartLabel(partKey) {
  if (partKey === "head") return "Голова";
  if (partKey === "torso") return "Торс";
  if (partKey === "abdomen") return "Живот";
  if (partKey === "leftArm") return "Левая рука";
  if (partKey === "rightArm") return "Правая рука";
  if (partKey === "leftLeg") return "Левая нога";
  if (partKey === "rightLeg") return "Правая нога";
  return partKey;
}

// Карта overflow для тика кровотечения — совпадает с логикой actor-sheet._applyDamage
const LIMB_OVERFLOW_MAP = {
  head:     "torso",
  leftArm:  "torso",
  rightArm: "torso",
  leftLeg:  "abdomen",
  rightLeg: "abdomen",
  abdomen:  "torso",
  torso:    "head"
};

// Применяет урон к конечности с overflow в соседнюю при уничтожении.
// hpCache — изменяемый объект { partKey: currentHp } чтобы не читать устаревшие данные.
async function applyLimbDamageWithOverflow(actor, partKey, damage, hpCache, logEntries, source, depth = 0) {
  if (damage <= 0 || depth > 4) return;

  let currentHp = hpCache[partKey] ?? Number(getBodyPartHpNode(actor, partKey)?.value ?? 0);

  // Конечность уже уничтожена — overflow сразу
  if (currentHp <= 0) {
    const overflowTarget = LIMB_OVERFLOW_MAP[partKey];
    if (overflowTarget) {
      await applyLimbDamageWithOverflow(actor, overflowTarget, damage, hpCache, logEntries, source, depth + 1);
    }
    return;
  }

  const absorbed = Math.min(currentHp, damage);
  const overflow = damage - absorbed;
  const newHp = currentHp - absorbed;

  hpCache[partKey] = newHp;
  await actor.update({ [`system.resources.hp.${partKey}.value`]: newHp });

  if (newHp <= 0) {
    await actor.update({ [buildBodyPartStatusPath(partKey, "destroyed")]: true });
    logEntries.push({
      id: randomId("log"),
      type: "condition-state",
      text: `${actor.name}: ${getBodyPartLabel(partKey)} выведена из строя (${source}).`,
      timestamp: nowStamp()
    });

    // Overflow в соседнюю конечность
    if (overflow > 0) {
      const overflowTarget = LIMB_OVERFLOW_MAP[partKey];
      if (overflowTarget) {
        logEntries.push({
          id: randomId("log"),
          type: "condition-tick",
          text: `${actor.name}: ${overflow} HP переходит в ${getBodyPartLabel(overflowTarget)}.`,
          timestamp: nowStamp()
        });
        await applyLimbDamageWithOverflow(actor, overflowTarget, overflow, hpCache, logEntries, source, depth + 1);
      }
    }
  }
}

async function applyLocalLimbTurnStart(state, participant) {
  const actor = resolveActor(participant?.actorUuid || participant?.actorId);
  if (!actor) return;

  await ensureActorBodyStatusStructure(actor);

  const logEntries = [];
  // Кэш текущих HP чтобы корректно считать overflow цепочки в одном тике
  const hpCache = {};
  for (const partKey of BODY_PART_KEYS) {
    hpCache[partKey] = Number(getBodyPartHpNode(actor, partKey)?.value ?? 0);
  }

  for (const partKey of BODY_PART_KEYS) {
    if (hpCache[partKey] <= 0) {
      await actor.update({ [buildBodyPartStatusPath(partKey, "destroyed")]: true });
      continue;
    }

    const minorBleeding = Number(getBodyPartStatusValue(actor, partKey, "minorBleeding") || 0);
    const majorBleeding = Number(getBodyPartStatusValue(actor, partKey, "majorBleeding") || 0);
    const hasTourniquet = getBodyPartStatusBool(actor, partKey, "tourniquet");

    if (minorBleeding > 0) {
      logEntries.push({
        id: randomId("log"),
        type: "condition-tick",
        text: `${actor.name}: ${getBodyPartLabel(partKey)} теряет ${minorBleeding} HP от малого кровотечения.`,
        timestamp: nowStamp()
      });
      await applyLimbDamageWithOverflow(actor, partKey, minorBleeding, hpCache, logEntries, "малое кровотечение");
    }

    if (majorBleeding > 0 && !hasTourniquet) {
      const damage = majorBleeding * 2;
      logEntries.push({
        id: randomId("log"),
        type: "condition-tick",
        text: `${actor.name}: ${getBodyPartLabel(partKey)} теряет ${damage} HP от сильного кровотечения.`,
        timestamp: nowStamp()
      });
      await applyLimbDamageWithOverflow(actor, partKey, damage, hpCache, logEntries, "сильное кровотечение");
    }
  }

  await refreshDestroyedBodyParts(actor);

  state.log = state.log ?? [];
  for (const entry of logEntries.reverse()) {
    state.log.unshift(entry);
  }
  state.log = state.log.slice(0, 100);
}

export async function ensureCombatActorBodyStatus(actorOrId) {
  const actor = resolveActor(actorOrId);
  if (!actor) return false;
  await ensureActorBodyStatusStructure(actor);
  await refreshDestroyedBodyParts(actor);
  return true;
}

function getActorConditionValue(actor, key) {
  const raw = actor?.system?.conditions?.[key];

  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;

  if (raw && typeof raw === "object") {
    if (typeof raw.value === "number") return raw.value;
    if (typeof raw.active === "boolean") return raw.active ? 1 : 0;
  }

  return 0;
}

function buildConditionUpdatePath(key) {
  return `system.conditions.${key}`;
}

async function applyConditionTurnStart(state, participant) {
  const actor = resolveActor(participant?.actorUuid || participant?.actorId);
  if (!actor) return;

  const bleeding = Number(getActorConditionValue(actor, "bleeding") || 0);
  const poison = Number(getActorConditionValue(actor, "poison") || 0);
  const stunned = Number(getActorConditionValue(actor, "stunned") || 0);
  const shock = Number(getActorConditionValue(actor, "shock") || 0);

  const updates = {};
  const logEntries = [];

  let torsoValue = Number(actor.system?.resources?.hp?.torso?.value ?? 0);

  if (bleeding > 0) {
    const nextTorso = Math.max(0, torsoValue - bleeding);
    updates["system.resources.hp.torso.value"] = nextTorso;
    torsoValue = nextTorso;

    logEntries.push({
      id: randomId("log"),
      type: "condition-tick",
      text: `${actor.name} теряет ${bleeding} HP от кровотечения.`,
      timestamp: nowStamp()
    });

    const nextBleeding = Math.max(0, bleeding - 1);
    updates[buildConditionUpdatePath("bleeding")] = nextBleeding;
  }

  if (poison > 0) {
    const nextTorso = Math.max(0, torsoValue - poison);
    updates["system.resources.hp.torso.value"] = nextTorso;
    torsoValue = nextTorso;

    logEntries.push({
      id: randomId("log"),
      type: "condition-tick",
      text: `${actor.name} теряет ${poison} HP от яда.`,
      timestamp: nowStamp()
    });
  }

  if (stunned > 0) {
    participant.remainingSeconds = 0;
    participant.hasActed = true;

    logEntries.push({
      id: randomId("log"),
      type: "condition-control",
      text: `${actor.name} оглушён и пропускает ход.`,
      timestamp: nowStamp()
    });

    updates[buildConditionUpdatePath("stunned")] = 0;
  }

  if (shock > 0) {
    logEntries.push({
      id: randomId("log"),
      type: "condition-state",
      text: `${actor.name} находится в шоке (${shock}).`,
      timestamp: nowStamp()
    });
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
  }

  state.log = state.log ?? [];
  for (const entry of logEntries.reverse()) {
    state.log.unshift(entry);
  }
  state.log = state.log.slice(0, 100);
}

function resolveParticipantActor(participant) {
  if (!participant) return null;
  return resolveActor(participant.actorUuid || participant.actorId);
}

function isSameActorReference(actor, otherActor) {
  if (!actor || !otherActor) return false;

  if (actor === otherActor) return true;

  const actorId = String(actor.id ?? "");
  const otherId = String(otherActor.id ?? "");
  if (actorId && otherId && actorId === otherId) return true;

  const actorUuid = String(actor.uuid ?? "");
  const otherUuid = String(otherActor.uuid ?? "");
  if (actorUuid && otherUuid && actorUuid === otherUuid) return true;

  const actorSourceId = String(actor._source?._id ?? "");
  const otherSourceId = String(otherActor._source?._id ?? "");
  if (actorSourceId && otherSourceId && actorSourceId === otherSourceId) return true;

  return false;
}

function findParticipantForActorInState(state, actorOrId) {
  const actor = resolveActor(actorOrId);
  if (!actor) return null;

  const actorUuid = getActorUuid(actor);
  const actorId = String(actor.id ?? "");

  for (const participant of state.participants ?? []) {
    if (!participant) continue;

    if (participant.actorUuid && actorUuid && String(participant.actorUuid) === actorUuid) {
      return participant;
    }

    if (participant.actorId && actorId && String(participant.actorId) === actorId) {
      return participant;
    }

    const participantActor = resolveParticipantActor(participant);
    if (isSameActorReference(actor, participantActor)) {
      return participant;
    }
  }

  return null;
}

function isParticipantCurrentlyActive(state, participant) {
  if (!state?.active || !participant) return false;

  if (participant.id === state.activeParticipantId) return true;

  const activeParticipant =
    (state.participants ?? []).find(entry => entry.id === state.activeParticipantId) ?? null;

  if (!activeParticipant) return false;

  if (participant.actorId && activeParticipant.actorId && String(participant.actorId) === String(activeParticipant.actorId)) {
    return true;
  }

  if (
    participant.actorUuid &&
    activeParticipant.actorUuid &&
    String(participant.actorUuid) === String(activeParticipant.actorUuid)
  ) {
    return true;
  }

  const participantActor = resolveParticipantActor(participant);
  const activeActor = resolveParticipantActor(activeParticipant);

  return isSameActorReference(participantActor, activeActor);
}

export function getCombatState() {
  return normalizeCombatState(deepClone(getCombatStateInternal()));
}

export function getCombatRevision() {
  return Number(getCombatStateInternal().revision ?? 0);
}

export function isCombatActive() {
  return Boolean(getCombatStateInternal().active);
}

export function getCombatParticipants() {
  return getCombatState().participants ?? [];
}

export function getCombatParticipant(participantId) {
  return getCombatState().participants.find(participant => participant.id === participantId) ?? null;
}

export function getCombatParticipantByActor(actorOrId) {
  const state = getCombatStateInternal();
  const participant = findParticipantForActorInState(state, actorOrId);
  return participant ? deepClone(participant) : null;
}

export function getActiveParticipant() {
  const state = getCombatState();
  return getCurrentParticipantFromState(state);
}

export function getActivePendingAction() {
  const participant = getActiveParticipant();
  return participant?.pendingAction ? deepClone(participant.pendingAction) : null;
}

export function getActiveActor() {
  const participant = getActiveParticipant();
  if (!participant) return null;
  return resolveActor(participant.actorUuid || participant.actorId);
}

export function getActorPendingAction(actorOrId) {
  const state = getCombatStateInternal();
  const participant = findParticipantForActorInState(state, actorOrId);
  return participant?.pendingAction ? deepClone(participant.pendingAction) : null;
}

export function getActorRemainingSeconds(actorOrId) {
  const state = getCombatStateInternal();
  const participant = findParticipantForActorInState(state, actorOrId);
  return Number(participant?.remainingSeconds ?? 0);
}

export function canActorActNow(actorOrId) {
  const state = getCombatStateInternal();
  if (!state.active) {
    return { ok: false, reason: "Бой не активен.", remainingSeconds: 0, participant: null };
  }

  const actor = resolveActor(actorOrId);
  if (!actor) {
    return { ok: false, reason: "Актёр не найден.", remainingSeconds: 0, participant: null };
  }

  const participant = findParticipantForActorInState(state, actor);
  if (!participant) {
    return { ok: false, reason: "Актёр не участвует в бою.", remainingSeconds: 0, participant: null };
  }

  if (participant.defeated) {
    return {
      ok: false,
      reason: "Участник выведен из боя.",
      remainingSeconds: 0,
      participant: deepClone(participant)
    };
  }

  if (!isParticipantCurrentlyActive(state, participant)) {
    return {
      ok: false,
      reason: "Сейчас не ход этого участника.",
      remainingSeconds: Number(participant.remainingSeconds ?? 0),
      participant: deepClone(participant)
    };
  }

  if (Number(participant.remainingSeconds ?? 0) <= 0) {
    return {
      ok: false,
      reason: "У участника не осталось секунд в этом ходу.",
      remainingSeconds: 0,
      participant: deepClone(participant)
    };
  }

  return {
    ok: true,
    reason: "",
    remainingSeconds: Number(participant.remainingSeconds ?? 0),
    participant: deepClone(participant)
  };
}

export function canActorCommitAction(actorOrId) {
  const state = getCombatStateInternal();
  if (!state.active) {
    return { ok: false, reason: "Бой не активен.", remainingSeconds: 0, participant: null };
  }

  const actor = resolveActor(actorOrId);
  if (!actor) {
    return { ok: false, reason: "Актёр не найден.", remainingSeconds: 0, participant: null };
  }

  const participant = findParticipantForActorInState(state, actor);
  if (!participant) {
    return { ok: false, reason: "Актёр не участвует в бою.", remainingSeconds: 0, participant: null };
  }

  if (participant.defeated) {
    return {
      ok: false,
      reason: "Участник выведен из боя.",
      remainingSeconds: 0,
      participant: deepClone(participant)
    };
  }

  if (!isParticipantCurrentlyActive(state, participant)) {
    return {
      ok: false,
      reason: "Сейчас не ход этого участника.",
      remainingSeconds: Number(participant.remainingSeconds ?? 0),
      participant: deepClone(participant)
    };
  }

  return {
    ok: true,
    reason: "",
    remainingSeconds: Number(participant.remainingSeconds ?? 0),
    participant: deepClone(participant)
  };
}

export function isActorActiveTurn(actorOrId) {
  const state = normalizeCombatState(getCombatStateInternal());
  if (!state.active) return false;

  const actor = resolveActor(actorOrId);
  if (!actor) return false;

  const current = getCurrentParticipantFromState(state);
  if (!current) return false;

  return String(current.actorUuid ?? "") === String(getActorUuid(actor));
}

export function getCombatRound() {
  return Number(getCombatStateInternal().round ?? 0);
}

export function getCombatTurn() {
  return Number(getCombatStateInternal().turn ?? 0);
}

export function getCombatSummary() {
  const state = getCombatState();
  const activeParticipant = getCurrentParticipantFromState(state);

  return {
    active: state.active,
    combatId: state.combatId,
    round: state.round,
    turn: state.turn,
    turnIndex: Math.max(0, Number(state.turn ?? 1) - 1),
    activeParticipantId: state.activeParticipantId,
    activeParticipant,
    participants: state.participants,
    queue: state.participants,
    log: state.log ?? []
  };
}

export function getActorCombatUiState(actorOrId) {
  const actor = resolveActor(actorOrId);
  const summary = getCombatSummary();
  const participant = actor ? findParticipantForActorInState(getCombatStateInternal(), actor) : null;
  const transitionState = getActiveTurnTransitionState();

  return {
    active: summary.active,
    combatId: summary.combatId,
    round: summary.round,
    turn: summary.turn,
    turnIndex: summary.turnIndex,
    activeParticipantId: summary.activeParticipantId,
    isInCombat: Boolean(participant),
    isActiveTurn: Boolean(participant && isParticipantCurrentlyActive(getCombatStateInternal(), participant)),
    remainingSeconds: Number(participant?.remainingSeconds ?? 0),
    maxSeconds: Number(participant?.maxSeconds ?? DEFAULT_TURN_SECONDS),
    side: participant?.side ?? "neutral",
    participantId: participant?.id ?? "",
    pendingAction: participant?.pendingAction ? deepClone(participant.pendingAction) : null,
    participant: participant ? getParticipantUiState(participant) : null,
    activeParticipant: summary.activeParticipant ? getParticipantUiState(summary.activeParticipant) : null,
    participants: summary.participants.map(getParticipantUiState),
    log: summary.log,
    canAdvanceTurn: Boolean(transitionState.canAdvance),
    advanceTurnReason: transitionState.reason || ""
  };
}

export function clearCombatState() {
  return saveCombatState({
    active: false,
    combatId: "",
    round: 0,
    turn: 0,
    activeParticipantId: "",
    participants: [],
    log: [],
    createdAt: "",
    updatedAt: nowStamp()
  });
}

export function endCombat({ silent = false } = {}) {
  const previous = getCombatState();
  const cleared = clearCombatState();

  if (!silent) {
    ui.notifications?.info("Бой завершён.");
  }

  Hooks.callAll("ironHillsCombatEnded", previous);
  return cleared;
}

export function buildCombatParticipantsFromRefs(refs = []) {
  const result = [];
  const addedActorIds = new Set();

  for (const ref of refs) {
    const extra = ref?.combatData ?? ref?.data ?? ref ?? {};
    const participant = buildCombatParticipant(ref, extra);
    if (!participant) continue;
    if (addedActorIds.has(participant.actorId)) continue;

    addedActorIds.add(participant.actorId);
    result.push(participant);
  }

  return result;
}

export function startCombat(refs = [], options = {}) {
  const participants = sortParticipants(buildCombatParticipantsFromRefs(refs));

  if (participants.length < 2) {
    ui.notifications?.warn("Для боя нужно минимум 2 участника.");
    return null;
  }

  const state = {
    active: true,
    combatId: randomId("combat"),
    round: 1,
    turn: 1,
    activeParticipantId: "",
    participants,
    log: [
      {
        id: randomId("log"),
        type: "combat-start",
        text: `Бой начат. Участников: ${participants.length}`,
        timestamp: nowStamp()
      }
    ],
    createdAt: nowStamp(),
    updatedAt: nowStamp(),
    ...deepClone(options.statePatch ?? {})
  };

  const firstIndex = getNextAliveParticipantIndex(state.participants, 0);
  setActiveParticipantByIndex(state, firstIndex >= 0 ? firstIndex : 0);

  const saved = saveCombatState(state);
  ui.notifications?.info(`Бой начат. Участников: ${participants.length}`);
  Hooks.callAll("ironHillsCombatStarted", deepClone(saved));

  return deepClone(saved);
}

export function addCombatLog(text, type = "info", extra = {}) {
  const state = getCombatStateInternal();
  if (!state.active) return null;

  state.log = state.log ?? [];
  state.log.unshift({
    id: randomId("log"),
    type,
    text,
    timestamp: nowStamp(),
    ...deepClone(extra)
  });

  state.log = state.log.slice(0, 100);
  saveCombatState(state);

  return deepClone(state.log[0]);
}

export function clearCombatLog() {
  const state = getCombatStateInternal();
  if (!state.active) {
    return {
      ok: false,
      cleared: false,
      reason: "Активного боя нет."
    };
  }

  state.log = [];
  saveCombatState(state);

  return {
    ok: true,
    cleared: true
  };
}

export function setParticipantSide(participantId, side) {
  const state = getCombatStateInternal();
  const participant = state.participants.find(entry => entry.id === participantId);
  if (!participant) return null;

  participant.side = normalizeSide(side);
  saveCombatState(state);
  return deepClone(participant);
}

export function setParticipantSideByActor(actorOrId, side) {
  const actor = resolveActor(actorOrId);
  if (!actor) return null;

  const state = getCombatStateInternal();
  const participant = findParticipantForActorInState(state, actor);
  if (!participant) return null;

  participant.side = normalizeSide(side);
  saveCombatState(state);
  return deepClone(participant);
}

export function rerollCombatInitiative() {
  const state = getCombatStateInternal();
  if (!state.active) return null;

  for (const participant of state.participants) {
    const actor = resolveActor(participant.actorUuid || participant.actorId);
    const initiativeData = rollInitiativeData(actor);

    participant.initiativeBonus = initiativeData.initiativeSkill;
    participant.initiativeSkill = initiativeData.initiativeSkill;
    participant.initiativeRoll = initiativeData.initiativeRoll;
    participant.initiativeTotal = initiativeData.initiativeTotal;
    participant.initiative = initiativeData.initiativeTotal;
  }

  state.participants = sortParticipants(state.participants);
  const nextIndex = getNextAliveParticipantIndex(state.participants, 0);
  setActiveParticipantByIndex(state, nextIndex >= 0 ? nextIndex : 0);

  addCombatLog("Инициатива переброшена.", "initiative");
  saveCombatState(state);

  return getCombatState();
}

export function spendActorSeconds(actorOrId, seconds, actionData = {}) {
  const actorCheck = canActorActNow(actorOrId);
  if (!actorCheck.ok) {
    return { ok: false, reason: actorCheck.reason, completed: false, pending: false };
  }

  const state = getCombatStateInternal();
  const participant = state.participants.find(entry => entry.id === actorCheck.participant.id);
  const cost = Math.max(0, Number(seconds ?? 0));

  if (cost <= 0) {
    return {
      ok: true,
      completed: true,
      pending: false,
      remainingSeconds: Number(participant.remainingSeconds ?? 0)
    };
  }

  const remaining = Number(participant.remainingSeconds ?? 0);

  if (remaining >= cost) {
    participant.remainingSeconds = remaining - cost;
    participant.hasActed = true;

    if (actionData?.label) {
      addCombatLog(
        `${participant.actorName}: ${actionData.label} (${cost}с)`,
        "action",
        { actorId: participant.actorId, participantId: participant.id }
      );
    } else {
      saveCombatState(state);
    }

    return {
      ok: true,
      completed: true,
      pending: false,
      remainingSeconds: Number(participant.remainingSeconds ?? 0)
    };
  }

  const leftToFinish = Math.max(0, cost - remaining);
  participant.pendingAction = createPendingAction({
    label: actionData?.label || "Длительное действие",
    actionType: actionData?.actionType || actionData?.data?.actionType || "generic",
    totalSeconds: cost,
    spentSeconds: remaining,
    remainingSeconds: leftToFinish,
    requiresConfirmation: true,
    startedRound: Number(state.round ?? 1),
    startedTurn: Number(state.turn ?? 1),
    actorId: participant.actorId,
    actorUuid: participant.actorUuid,
    data: {
      ...deepClone(actionData?.data ?? {}),
      actionType: actionData?.actionType || actionData?.data?.actionType || "generic"
    }
  });

  participant.remainingSeconds = 0;
  participant.hasActed = true;

  addCombatLog(
    `${participant.actorName} начинает действие "${participant.pendingAction.label}", потребуется продолжение в следующий ход.`,
    "pending-action",
    { actorId: participant.actorId, participantId: participant.id }
  );

  return {
    ok: true,
    completed: false,
    pending: true,
    requiresConfirmation: true,
    remainingSeconds: Number(participant.remainingSeconds ?? 0),
    pendingAction: deepClone(participant.pendingAction)
  };
}

export function spendActionSeconds(actorOrId, seconds, actionData = {}) {
  return spendActorSeconds(actorOrId, seconds, actionData);
}

export function requestActionTimeCommit(
  actorOrId,
  { actionType = "generic", label = "Действие", totalSeconds = 1, payload = {} } = {}
) {
  const actorCheck = canActorCommitAction(actorOrId);
  if (!actorCheck.ok) {
    return { ok: false, reason: actorCheck.reason, committed: false, immediate: false };
  }

  const state = getCombatStateInternal();
  const participant = state.participants.find(entry => entry.id === actorCheck.participant.id);
  if (!participant) {
    return {
      ok: false,
      reason: "Участник не найден.",
      committed: false,
      immediate: false
    };
  }

  if (participant.pendingAction) {
    return {
      ok: false,
      reason: "У участника уже есть незавершённое длительное действие.",
      committed: false,
      immediate: false
    };
  }

  const cost = Math.max(1, Number(totalSeconds ?? 1));
  const remainingSeconds = Number(actorCheck.remainingSeconds ?? 0);

  if (remainingSeconds >= cost) {
    return {
      ok: true,
      committed: false,
      immediate: true,
      remainingSeconds,
      totalSeconds: cost
    };
  }

  participant.pendingAction = createPendingAction({
    label,
    actionType,
    totalSeconds: cost,
    spentSeconds: remainingSeconds,
    remainingSeconds: Math.max(0, cost - remainingSeconds),
    requiresConfirmation: true,
    startedRound: Number(state.round ?? 1),
    startedTurn: Number(state.turn ?? 1),
    actorId: participant.actorId,
    actorUuid: participant.actorUuid,
    data: {
      ...deepClone(payload ?? {}),
      actionType
    }
  });

  participant.remainingSeconds = 0;
  participant.hasActed = true;

  addCombatLog(
    `${participant.actorName} начинает действие "${participant.pendingAction.label}", потребуется продолжение в следующий ход.`,
    "pending-action",
    { actorId: participant.actorId, participantId: participant.id }
  );

  return {
    ok: true,
    committed: true,
    immediate: false,
    pendingAction: deepClone(participant.pendingAction),
    remainingSeconds: Number(participant.remainingSeconds ?? 0),
    totalSeconds: cost
  };
}

export function startPendingAction(actorOrId, label, totalSeconds, data = {}) {
  return spendActorSeconds(actorOrId, totalSeconds, {
    label,
    actionType: data?.actionType || "generic",
    data
  });
}

export function confirmPendingAction(actorOrId) {
  return continuePendingAction(actorOrId);
}

export function continuePendingAction(actorOrId) {
  const state = normalizeCombatState(getCombatStateInternal());
  if (!state.active) {
    return { ok: false, progressed: false, done: false, reason: "Нет активного боя." };
  }

  const actor = resolveActor(actorOrId);
  if (!actor) {
    return { ok: false, progressed: false, done: false, reason: "Актёр не найден." };
  }

  const current = getCurrentParticipantFromState(state);
  if (!current) {
    return { ok: false, progressed: false, done: false, reason: "Нет активного участника." };
  }

  if (String(current.actorUuid ?? "") !== String(getActorUuid(actor))) {
    return { ok: false, progressed: false, done: false, reason: "Продолжить действие можно только в свой активный ход." };
  }

  const participant = findParticipantForActorInState(state, actor);
  if (!participant) {
    return { ok: false, progressed: false, done: false, reason: "Участник не найден." };
  }

  if (!participant.pendingAction) {
    return { ok: false, progressed: false, done: false, reason: "Нет отложенного действия." };
  }

  const pending = deepClone(participant.pendingAction);
  const needed = Number(pending.remainingSeconds ?? 0);
  const remaining = Number(participant.remainingSeconds ?? 0);

  if (needed <= 0) {
    participant.pendingAction = null;
    saveCombatState(normalizeCombatState(state));

    return {
      ok: true,
      progressed: true,
      done: true,
      action: pending,
      remainingSeconds: Number(participant.remainingSeconds ?? 0)
    };
  }

  if (remaining >= needed) {
    participant.remainingSeconds = remaining - needed;
    participant.pendingAction = null;
    participant.hasActed = true;

    addCombatLog(
      `${participant.actorName} завершает действие "${pending.label}".`,
      "pending-action-complete",
      { actorId: participant.actorId, participantId: participant.id }
    );

    return {
      ok: true,
      progressed: true,
      done: true,
      action: {
        ...pending,
        remainingSeconds: 0,
        spentSeconds: Number(pending.totalSeconds ?? pending.spentSeconds ?? 0)
      },
      remainingSeconds: Number(participant.remainingSeconds ?? 0)
    };
  }

  participant.pendingAction.spentSeconds = Number(participant.pendingAction.spentSeconds ?? 0) + remaining;
  participant.pendingAction.remainingSeconds = Math.max(0, needed - remaining);
  participant.remainingSeconds = 0;
  participant.hasActed = true;

  addCombatLog(
    `${participant.actorName} продолжает действие "${pending.label}", но ему всё ещё нужно ${participant.pendingAction.remainingSeconds}с.`,
    "pending-action-continue",
    { actorId: participant.actorId, participantId: participant.id }
  );

  return {
    ok: true,
    progressed: true,
    done: false,
    action: deepClone(participant.pendingAction),
    remainingSeconds: Number(participant.remainingSeconds ?? 0)
  };
}

export function cancelPendingAction(actorOrId) {
  const state = getCombatStateInternal();
  if (!state.active) {
    return { ok: false, cancelled: false, reason: "Активного боя нет." };
  }

  const actor = resolveActor(actorOrId);
  if (!actor) {
    return { ok: false, cancelled: false, reason: "Актёр не найден." };
  }

  const participant = findParticipantForActorInState(state, actor);
  if (!participant) {
    return { ok: false, cancelled: false, reason: "Участник не найден." };
  }

  if (!participant.pendingAction) {
    return { ok: false, cancelled: false, reason: "Нет отложенного действия." };
  }

  const label = participant.pendingAction.label || "действие";
  participant.pendingAction = null;

  addCombatLog(
    `${participant.actorName} отменяет действие "${label}".`,
    "pending-action-cancel",
    { actorId: participant.actorId, participantId: participant.id }
  );

  return { ok: true, cancelled: true };
}

function resetParticipantTurnState(participant) {
  participant.remainingSeconds = Number(participant.maxSeconds ?? DEFAULT_TURN_SECONDS);
  participant.hasActed = false;

  if (participant.pendingAction?.requiresConfirmation) {
    participant.pendingAction.awaitingConfirmation = true;
  }
}

export async function advanceRound() {
  const state = getCombatStateInternal();
  if (!state.active) {
    ui.notifications?.warn("Активного боя нет.");
    return null;
  }

  state.round += 1;

  for (const participant of state.participants) {
    resetParticipantTurnState(participant);
  }

  refreshDefeatedFlags(state);

  const nextIndex = getNextAliveParticipantIndex(state.participants, 0);
  if (nextIndex < 0) {
    endCombat();
    return null;
  }

  setActiveParticipantByIndex(state, nextIndex);

  const activeParticipant =
    state.participants.find(participant => participant.id === state.activeParticipantId) ?? null;

  if (activeParticipant) {
    await applyLocalLimbTurnStart(state, activeParticipant);
    await applyConditionTurnStart(state, activeParticipant);
    refreshDefeatedFlags(state);
  }

  addCombatLog(`Раунд ${state.round}.`, "round");
  saveCombatState(state);

  if (activeParticipant?.pendingAction) {
    notifyPendingActionReady(activeParticipant);
  }

  return getCombatState();
}

export async function advanceTurn() {
  const state = getCombatStateInternal();
  if (!state.active) {
    ui.notifications?.warn("Активного боя нет.");
    return null;
  }

  refreshDefeatedFlags(state);

  const aliveParticipants = state.participants.filter(participant => !participant.defeated);
  if (aliveParticipants.length <= 1) {
    endCombat();
    return null;
  }

  const currentIndex = state.participants.findIndex(participant => participant.id === state.activeParticipantId);
  const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  const nextIndex = getNextAliveParticipantIndex(state.participants, startIndex);

  if (nextIndex < 0 || (currentIndex >= 0 && nextIndex <= currentIndex)) {
    return advanceRound();
  }

  if (currentIndex >= 0 && state.participants[currentIndex]) {
    state.participants[currentIndex].active = false;
  }

  const next = state.participants[nextIndex];
  resetParticipantTurnState(next);
  setActiveParticipantByIndex(state, nextIndex);

  await applyLocalLimbTurnStart(state, next);
  await applyConditionTurnStart(state, next);
  refreshDefeatedFlags(state);

  addCombatLog(`Ход: ${next.actorName}.`, "turn", {
    actorId: next.actorId,
    participantId: next.id
  });

  saveCombatState(state);

  const activeParticipant =
    state.participants.find(participant => participant.id === state.activeParticipantId) ?? null;

  if (activeParticipant?.pendingAction) {
    notifyPendingActionReady(activeParticipant);
  }

  return getCombatState();
}

export function endTurnForActor(actorOrId) {
  const check = canActorCommitAction(actorOrId);
  if (!check.ok) {
    return {
      ok: false,
      reason: check.reason || "Нельзя завершить ход."
    };
  }

  const state = getCombatStateInternal();
  const participant = findParticipantForActorInState(state, actorOrId);
  if (!participant) {
    return {
      ok: false,
      reason: "Участник не найден."
    };
  }

  if (!isParticipantCurrentlyActive(state, participant)) {
    return {
      ok: false,
      reason: "Сейчас не ход этого участника."
    };
  }

  participant.remainingSeconds = 0;
  participant.hasActed = true;

  state.log = state.log ?? [];
  state.log.unshift({
    id: randomId("log"),
    type: "turn-end",
    text: `${participant.actorName} завершает свой ход.`,
    timestamp: nowStamp()
  });
  state.log = state.log.slice(0, 100);

  saveCombatState(state);

  return {
    ok: true,
    ended: true
  };
}

export function getActiveTurnTransitionState() {
  const state = normalizeCombatState(getCombatStateInternal());

  if (!state.active) {
    return {
      ok: false,
      canAdvance: false,
      reason: "Бой не активен.",
      activeParticipant: null
    };
  }

  const activeParticipant = getCurrentParticipantFromState(state);

  if (!activeParticipant) {
    return {
      ok: false,
      canAdvance: false,
      reason: "Нет активного участника.",
      activeParticipant: null
    };
  }

  if (activeParticipant.defeated) {
    return {
      ok: true,
      canAdvance: true,
      reason: "",
      activeParticipant: deepClone(activeParticipant)
    };
  }

  const remainingSeconds = Number(activeParticipant.remainingSeconds ?? 0);
  const pendingAction = activeParticipant.pendingAction ?? null;

  if (pendingAction && remainingSeconds > 0) {
    return {
      ok: true,
      canAdvance: false,
      reason: "Есть длительное действие, которое ещё можно продолжить в этом ходу.",
      activeParticipant: deepClone(activeParticipant)
    };
  }

  if (remainingSeconds > 0 && !pendingAction) {
    return {
      ok: true,
      canAdvance: false,
      reason: "У активного участника ещё остались секунды.",
      activeParticipant: deepClone(activeParticipant)
    };
  }

  return {
    ok: true,
    canAdvance: true,
    reason: "",
    activeParticipant: deepClone(activeParticipant)
  };
}

export async function advanceTurnIfReady() {
  const state = normalizeCombatState(getCombatStateInternal());

  if (!state.active) {
    return {
      ok: false,
      advanced: false,
      reason: "Бой не активен."
    };
  }

  const activeParticipant = getCurrentParticipantFromState(state);
  if (!activeParticipant) {
    return {
      ok: false,
      advanced: false,
      reason: "Нет активного участника."
    };
  }

  if (activeParticipant.defeated) {
    const nextState = await advanceTurn();
    return {
      ok: true,
      advanced: true,
      state: nextState
    };
  }

  const remainingSeconds = Number(activeParticipant.remainingSeconds ?? 0);
  const pendingAction = activeParticipant.pendingAction ?? null;

  if (pendingAction && remainingSeconds > 0) {
    return {
      ok: false,
      advanced: false,
      reason: "Есть длительное действие, которое ещё можно продолжить в этом ходу."
    };
  }

  if (remainingSeconds > 0 && !pendingAction) {
    return {
      ok: false,
      advanced: false,
      reason: "У активного участника ещё остались секунды."
    };
  }

  const nextState = await advanceTurn();
  return {
    ok: true,
    advanced: true,
    state: nextState
  };
}

export async function forceAdvanceTurn() {
  const state = getCombatStateInternal();

  if (!state.active) {
    return {
      ok: false,
      advanced: false,
      reason: "Бой не активен."
    };
  }

  const activeParticipant =
    (state.participants ?? []).find(entry => entry.id === state.activeParticipantId) ?? null;

  state.log = state.log ?? [];
  state.log.unshift({
    id: randomId("log"),
    type: "force-turn",
    text: activeParticipant
      ? `GM принудительно передаёт ход от ${activeParticipant.actorName}.`
      : "GM принудительно передаёт ход.",
    timestamp: nowStamp()
  });
  state.log = state.log.slice(0, 100);

  saveCombatState(state);

  const nextState = await advanceTurn();

  return {
    ok: true,
    advanced: true,
    state: nextState
  };
}

export async function nextTurn() {
  return advanceTurnIfReady();
}

export function forceSetActiveParticipant(participantId) {
  const state = getCombatStateInternal();
  if (!state.active) return null;

  const index = state.participants.findIndex(participant => participant.id === participantId);
  if (index < 0) return null;

  setActiveParticipantByIndex(state, index);
  resetParticipantTurnState(state.participants[index]);
  saveCombatState(state);

  const activeParticipant =
    state.participants.find(participant => participant.id === state.activeParticipantId) ?? null;

  if (activeParticipant?.pendingAction) {
    notifyPendingActionReady(activeParticipant);
  }

  return getCombatState();
}

export function updateParticipant(participantId, patch = {}) {
  const state = getCombatStateInternal();
  const participant = state.participants.find(entry => entry.id === participantId);
  if (!participant) return null;

  Object.assign(participant, deepClone(patch));
  if (patch.side) participant.side = normalizeSide(patch.side);

  saveCombatState(state);
  return deepClone(participant);
}

export function removeParticipant(participantId) {
  const state = getCombatStateInternal();
  if (!state.active) return null;

  const index = state.participants.findIndex(participant => participant.id === participantId);
  if (index < 0) return null;

  const removed = state.participants[index];
  state.participants.splice(index, 1);

  if (state.participants.length < 2) {
    endCombat();
    return deepClone(removed);
  }

  const nextIndex = getNextAliveParticipantIndex(
    state.participants,
    Math.min(index, state.participants.length - 1)
  );
  setActiveParticipantByIndex(state, nextIndex >= 0 ? nextIndex : 0);
  saveCombatState(state);

  return deepClone(removed);
}

export function markParticipantDefeated(participantId, defeated = true) {
  const state = getCombatStateInternal();
  const participant = state.participants.find(entry => entry.id === participantId);
  if (!participant) return null;

  participant.defeated = Boolean(defeated);

  const aliveParticipants = state.participants.filter(entry => !entry.defeated);
  if (aliveParticipants.length <= 1) {
    endCombat();
    return deepClone(participant);
  }

  if (participant.id === state.activeParticipantId && participant.defeated) {
    advanceTurn();
    return deepClone(participant);
  }

  saveCombatState(state);
  return deepClone(participant);
}

export function syncCombatParticipantsWithActors() {
  const state = getCombatStateInternal();
  if (!state.active) return null;

  for (const participant of state.participants) {
    const actor = resolveActor(participant.actorUuid || participant.actorId);
    if (!actor) {
      participant.defeated = true;
      continue;
    }

    participant.actorName = actor.name;
    participant.actorType = actor.type;
    participant.img = actor.img || participant.img || "icons/svg/mystery-man.svg";
    participant.defeated = !isActorAlive(actor);
  }

  const aliveParticipants = state.participants.filter(participant => !participant.defeated);
  if (aliveParticipants.length <= 1) {
    endCombat();
    return null;
  }

  if (!aliveParticipants.some(participant => participant.id === state.activeParticipantId)) {
    const nextIndex = getNextAliveParticipantIndex(state.participants, 0);
    setActiveParticipantByIndex(state, nextIndex >= 0 ? nextIndex : 0);
  }

  saveCombatState(state);
  return getCombatState();
}

export function getSideLabel(side) {
  if (side === "ally") return "Союзник";
  if (side === "enemy") return "Враг";
  return "Нейтрал";
}

export function getParticipantUiState(participant) {
  if (!participant) return null;

  return {
    ...deepClone(participant),
    name: participant.actorName,
    secondsLeft: Number(participant.remainingSeconds ?? 0),
    turnSeconds: Number(participant.maxSeconds ?? DEFAULT_TURN_SECONDS),
    sideLabel: getSideLabel(participant.side),
    isActive: Boolean(participant.active),
    isDefeated: Boolean(participant.defeated),
    hasPendingAction: Boolean(participant.pendingAction),
    pendingActionLabel: participant.pendingAction?.label || "",
    pendingActionRemainingSeconds: Number(participant.pendingAction?.remainingSeconds ?? 0)
  };
}

export function getCombatUiState() {
  const state = getCombatState();
  const participants = state.participants.map(getParticipantUiState);
  const activeParticipant = participants.find(participant => participant.id === state.activeParticipantId) ?? null;

  return {
    ...state,
    turnIndex: Math.max(0, Number(state.turn ?? 1) - 1),
    participants,
    queue: participants,
    activeParticipant
  };
}

export { DEFAULT_TURN_SECONDS };

