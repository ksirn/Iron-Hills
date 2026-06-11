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
  restoreActorPendingAction,
  spendActionSeconds,
  startCombat,
} from "./combat-flow-service.mjs";
import {
  buildCombatRows,
  buildSystemDialogContent,
  createCombatChatMessage,
} from "./combat-chat-service.mjs";

function pendingExecutionOk(result) {
  if (result === false) return false;
  if (!result || typeof result !== "object") return true;
  if (result.ok === false || result.cancelled || result.canceled || result.queued) return false;
  return true;
}

function getPendingExecutionReason(result) {
  if (!result || typeof result !== "object") return "";
  return result.reason || result.error || "";
}

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

  await createCombatChatMessage({
    title: "Бой начат",
    icon: "!",
    status: `Раунд ${state.round}`,
    statusClass: "is-warn",
    rows: [
      ["Участников", state.participants.length],
      ["Первый ход", state.participants[0]?.actorName ?? "—"],
    ],
    bodyHtml: buildCombatRows(state.participants.map((participant, index) => ({
      label: `${index + 1}. ${participant.actorName}`,
      value: `${participant.initiativeTotal} (d20 ${participant.initiativeRoll} + навык ${participant.initiativeSkill})`,
    }))),
    className: "ih-combat-flow-card ih-combat-start-card",
  });

  render?.(true);
  return { ok: true, state };
}

export async function endCombatFromSheet({
  render = null,
} = {}) {
  const summary = getCombatSummary();
  endCombat();

  await createCombatChatMessage({
    title: "Бой завершён",
    icon: "!",
    status: "Финал",
    statusClass: "is-muted",
    rows: [
      ["Раундов прошло", summary.round ?? 0],
    ],
    className: "ih-combat-flow-card ih-combat-end-card",
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

  await createCombatChatMessage({
    title: "Следующий ход",
    icon: ">",
    status: `Раунд ${state.round}`,
    statusClass: "is-warn",
    rows: [
      ["Ходит", current?.actorName ?? "—"],
      ["Доступно секунд", current?.remainingSeconds ?? 0],
    ],
    className: "ih-combat-flow-card ih-combat-next-turn-card",
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

  const execution = await executePendingAction?.(result.action);
  if (!pendingExecutionOk(execution)) {
    const reason = getPendingExecutionReason(execution);
    const restore = restoreActorPendingAction(actor, result.action, {
      remainingSeconds: 0,
      awaitingConfirmation: true,
      reason,
    });
    ui.notifications.warn(
      reason
        ? `Действие не выполнено (${reason}) и возвращено в ожидание.`
        : "Действие не выполнено и возвращено в ожидание."
    );
    render?.(false);
    return {
      ...result,
      ok: false,
      done: false,
      execution,
      restoredPendingAction: restore.pendingAction ?? null,
      reason: reason || "pending-execution-failed",
    };
  }

  render?.(false);
  return {
    ...result,
    execution,
  };
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

  await createCombatChatMessage({
    actor,
    title: "Действие отменено",
    subtitle: actor.name,
    icon: "x",
    status: "Отмена",
    statusClass: "is-muted",
    rows: [
      ["Действие", pending.label],
    ],
    className: "ih-combat-flow-card ih-combat-cancel-action-card",
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
    await createCombatChatMessage({
      actor,
      title: "Начато долгое действие",
      subtitle: actor.name,
      icon: "...",
      status: "В процессе",
      statusClass: "is-warn",
      rows: [
        ["Действие", label],
        ["Всего нужно", `${timeCost} сек.`],
        ["Осталось", `${timing.pendingAction?.remainingSeconds ?? 0} сек.`],
      ],
      className: "ih-combat-flow-card ih-combat-long-action-card",
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
  const pending = getActorPendingAction(actor);

  if (pending) {
    const reason = "Сначала продолжите или отмените незавершённое длительное действие.";
    ui.notifications.warn(reason);
    return {
      ok: false,
      queued: false,
      immediate: false,
      reason,
      pendingAction: pending,
      secondsCost,
      remainingSeconds: remaining,
    };
  }

  if (remaining <= 0) {
    const reason = "У участника не осталось секунд в этом ходу.";
    ui.notifications.warn(reason);
    return {
      ok: false,
      queued: false,
      immediate: false,
      reason,
      secondsCost,
      remainingSeconds: remaining,
    };
  }

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

  const confirmed = await Dialog.confirm({
    title: "Действие займёт несколько ходов",
    content: buildSystemDialogContent({
      className: "ih-combat-action-confirm-dialog",
      headline: label,
      headlineMeta: "длинное действие",
      status: "Перенести на следующие ходы?",
      statusClass: "is-warn",
      rows: [
        ["Требуется", `${secondsCost} сек.`],
        ["Осталось сейчас", `${remaining} сек.`],
      ],
    }),
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

  await createCombatChatMessage({
    actor,
    title: "Действие перенесено",
    subtitle: actor.name,
    icon: "...",
    status: "Несколько ходов",
    statusClass: "is-warn",
    rows: [
      ["Действие", label],
      ["Стоимость", `${secondsCost} сек.`],
      ["Осталось сейчас", `${remaining} сек.`],
    ],
    className: "ih-combat-flow-card ih-combat-queued-action-card",
  });

  return {
    ok: false,
    queued: true,
    immediate: false,
    secondsCost,
    pendingAction: commitResult.pendingAction ?? null,
  };
}
