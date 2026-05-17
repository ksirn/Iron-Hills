import { getPersistentActor } from "../utils/actor-utils.mjs";
import {
  applyActorSpeedModifier,
  getCombatActionSeconds,
} from "./combat-time-service.mjs";
import {
  advanceTurn,
  advanceTurnIfReady,
  canActorActNow,
  canActorCommitAction,
  cancelPendingAction,
  continuePendingAction,
  endCombat,
  endTurnForActor,
  getActorPendingAction,
  getActorRemainingSeconds,
  getCombatSummary,
  isCombatActive,
  requestActionTimeCommit,
  spendActionSeconds,
  startCombat,
} from "./combat-flow-service.mjs";

export function getCombatParticipantsFromActorAndTargets(actor, targets = globalThis.game?.user?.targets ?? []) {
  const result = [];
  const added = new Set();

  if (actor?.id) {
    result.push(actor);
    added.add(actor.id);
  }

  for (const token of Array.from(targets ?? [])) {
    const targetActor = token?.actor ?? null;
    if (!targetActor?.id) continue;
    if (added.has(targetActor.id)) continue;

    result.push(getPersistentActor(targetActor) ?? targetActor);
    added.add(targetActor.id);
  }

  return result;
}

export async function startCombatFromSheet(actor, {
  targets = globalThis.game?.user?.targets ?? [],
  render = null,
} = {}) {
  const participants = getCombatParticipantsFromActorAndTargets(actor, targets);

  if (participants.length < 2) {
    ui.notifications.warn("Для старта боя нужен как минимум актёр листа и одна выбранная цель.");
    return { ok: false, reason: "not-enough-participants" };
  }

  const state = startCombat(participants);
  if (!state) return { ok: false, reason: "start-failed" };

  const lines = state.participants.map((participant, index) =>
    `<p>${index + 1}. <b>${participant.actorName}</b> — инициатива ${participant.initiativeTotal} (бросок ${participant.initiativeRoll} + навык ${participant.initiativeSkill})</p>`
  ).join("");

  await ChatMessage.create({
    content: `
      <h3>Бой начат</h3>
      <p><b>Раунд:</b> ${state.round}</p>
      <p><b>Первый ход:</b> ${state.participants[0]?.actorName ?? "—"}</p>
      ${lines}
    `,
  });

  render?.(true);
  return { ok: true, state };
}

export async function endCombatFromSheet({
  render = null,
} = {}) {
  const summary = getCombatSummary();
  endCombat();

  await ChatMessage.create({
    content: `
      <h3>Бой завершён</h3>
      <p><b>Раундов прошло:</b> ${summary.round ?? 0}</p>
    `,
  });

  render?.(true);
  return { ok: true, summary };
}

export async function handlePostActionSecondsState(actor, {
  render = null,
} = {}) {
  if (!isCombatActive()) return { ok: true, active: false };

  const remainingSeconds = Number(getActorRemainingSeconds(actor) ?? 0);

  if (remainingSeconds <= 0) {
    ui.notifications.info("Секунды закончились. Завершите ход или начните длительное действие.");
  }

  render?.(false);
  return { ok: true, active: true, remainingSeconds };
}

export async function advanceCombatTurnFromSheet(actor, {
  render = null,
} = {}) {
  await handlePostActionSecondsState(actor, { render });

  const state = advanceTurn();
  const current = state?.participants?.[state.turnIndex] ?? null;

  await ChatMessage.create({
    content: `
      <h3>Следующий ход</h3>
      <p><b>Раунд:</b> ${state.round}</p>
      <p><b>Ходит:</b> ${current?.actorName ?? "—"}</p>
      <p><b>Доступно секунд:</b> ${current?.remainingSeconds ?? 0}</p>
    `,
  });

  render?.(true);
  return { ok: true, state };
}

export async function continuePendingCombatActionFromSheet(actor, {
  executePendingAction = null,
  render = null,
} = {}) {
  if (!actor) return { ok: false, reason: "missing-actor" };

  const pending = getActorPendingAction(actor);
  if (!pending) {
    ui.notifications.info("У участника нет длительного действия.");
    return { ok: false, reason: "no-pending-action" };
  }

  const result = continuePendingAction(actor);
  if (!result?.ok) {
    ui.notifications.warn(result?.reason || "Не удалось продолжить действие.");
    return result;
  }

  if (!result.done) {
    ui.notifications.info(
      `${actor.name} продолжает действие. Осталось ${Number(result.action?.remainingSeconds ?? 0)} сек.`
    );
    render?.(false);
    return result;
  }

  await executePendingAction?.(result.action);
  render?.(false);
  return result;
}

export async function endCombatTurnFromSheet(actor, {
  render = null,
} = {}) {
  if (!actor) return { ok: false, reason: "missing-actor" };

  if (!isCombatActive()) {
    ui.notifications.warn("Активного боя нет.");
    return { ok: false, reason: "no-active-combat" };
  }

  const result = endTurnForActor(actor);
  if (!result?.ok) {
    ui.notifications.warn(result?.reason || "Не удалось завершить ход.");
    return result;
  }

  const advanceResult = await advanceTurnIfReady();
  if (!advanceResult?.ok) {
    ui.notifications.warn(advanceResult?.reason || "Ход завершён, но передача следующему участнику не выполнена.");
  }

  render?.(false);
  return { ok: true, result, advanceResult };
}

export async function cancelPendingCombatActionFromSheet(actor, {
  render = null,
} = {}) {
  const pending = getActorPendingAction(actor);

  if (!pending) {
    ui.notifications.warn("Нечего отменять.");
    return { ok: false, reason: "no-pending-action" };
  }

  cancelPendingAction(actor);

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <h3>Действие отменено</h3>
      <p><b>${actor.name}</b> отменяет: <b>${pending.label}</b></p>
    `,
  });

  render?.(true);
  return { ok: true, pending };
}

export async function commitTimedActionFromSheet(actor, {
  actionType,
  label,
  timeCost,
  payload = {},
} = {}, {
  render = null,
} = {}) {
  const turnCheck = canActorActNow(actor);
  if (!turnCheck.ok) {
    ui.notifications.warn(turnCheck.reason);
    return { ok: false, reason: turnCheck.reason };
  }

  const timing = await requestActionTimeCommit(actor, {
    actionType,
    label,
    totalSeconds: timeCost,
    payload,
  });

  if (!timing.ok) {
    if (timing.reason) ui.notifications.warn(timing.reason);
    return timing;
  }

  if (timing.committed) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <h3>Начато долгое действие</h3>
        <p><b>${actor.name}</b> начинает: <b>${label}</b></p>
        <p><b>Всего нужно:</b> ${timeCost} сек.</p>
        <p><b>Осталось до завершения:</b> ${timing.pendingAction?.remainingSeconds ?? 0} сек.</p>
      `,
    });

    render?.(true);

    return {
      ok: true,
      committed: true,
      immediate: false,
    };
  }

  spendActionSeconds(actor, timeCost);

  return {
    ok: true,
    committed: false,
    immediate: true,
  };
}

export async function resolveCombatTimeCostForActor(actor, {
  actionType,
  label,
  item = null,
  totalSeconds = 0,
  payload = {},
} = {}, {
  requireSettledInventory = null,
} = {}) {
  if (requireSettledInventory && !(await requireSettledInventory(label || "действие"))) {
    return {
      ok: false,
      queued: false,
      immediate: false,
      reason: "Есть предметы к распределению.",
    };
  }

  if (!isCombatActive()) {
    return {
      ok: true,
      queued: false,
      immediate: true,
      secondsCost: 0,
    };
  }

  const commitCheck = canActorCommitAction(actor);
  if (!commitCheck.ok) {
    ui.notifications.warn(commitCheck.reason || "Сейчас действие недоступно.");
    return {
      ok: false,
      queued: false,
      immediate: false,
      reason: commitCheck.reason || "Сейчас действие недоступно.",
    };
  }

  const rawSeconds = Number(totalSeconds || getCombatActionSeconds(actionType, item));
  const secondsCost = Math.max(0.5, applyActorSpeedModifier(actor, rawSeconds));
  const remaining = Number(commitCheck.remainingSeconds ?? 0);

  if (remaining >= secondsCost) {
    const spendResult = spendActionSeconds(actor, secondsCost, {
      label,
      actionType,
      data: {
        itemId: item?.id ?? "",
        ...payload,
      },
    });

    if (!spendResult?.ok) {
      ui.notifications.warn(spendResult?.reason || "Не удалось списать секунды действия.");
      return {
        ok: false,
        queued: false,
        immediate: false,
        reason: spendResult?.reason || "Не удалось списать секунды действия.",
      };
    }

    return {
      ok: true,
      queued: false,
      immediate: true,
      secondsCost,
      remainingSeconds: Number(spendResult.remainingSeconds ?? 0),
    };
  }

  const pending = getActorPendingAction(actor);
  if (pending) {
    ui.notifications.warn("У этого участника уже есть незавершённое длительное действие.");
    return {
      ok: false,
      queued: false,
      immediate: false,
      reason: "Уже есть незавершённое длительное действие.",
    };
  }

  const confirmed = await Dialog.confirm({
    title: "Действие займёт несколько ходов",
    content: `
      <p><b>${label}</b> требует <b>${secondsCost}</b> сек.</p>
      <p>Сейчас осталось только <b>${remaining}</b> сек.</p>
      <p>Перенести действие на следующие ходы?</p>
    `,
  });

  if (!confirmed) {
    return {
      ok: false,
      queued: false,
      immediate: false,
    };
  }

  const commitResult = requestActionTimeCommit(actor, {
    actionType,
    label,
    totalSeconds: secondsCost,
    payload: {
      itemId: item?.id ?? "",
      ...payload,
    },
  });

  if (!commitResult?.ok) {
    ui.notifications.warn(commitResult?.reason || "Не удалось поставить действие в очередь.");
    return {
      ok: false,
      queued: false,
      immediate: false,
      reason: commitResult?.reason || "Не удалось поставить действие в очередь.",
    };
  }

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<b>${actor.name}</b> начинает действие <b>${label}</b>, которое потребует несколько ходов.`,
  });

  return {
    ok: false,
    queued: true,
    immediate: false,
    secondsCost,
    pendingAction: commitResult.pendingAction ?? null,
  };
}
