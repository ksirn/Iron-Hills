import {
  advanceCombatTurnFromSheet,
  cancelPendingCombatActionFromSheet,
  commitTimedActionFromSheet,
  continuePendingCombatActionFromSheet,
  endCombatFromSheet,
  endCombatTurnFromSheet,
  handlePostActionSecondsState,
  resolveCombatTimeCostForActor,
  startCombatFromSheet,
} from "./actor-combat-sheet-service.mjs";
import { performActorAttack } from "./attack-flow-service.mjs";

export async function startActorSheetCombat(actor, {
  render = null,
} = {}) {
  return startCombatFromSheet(actor, {
    render,
  });
}

export async function endActorSheetCombat({
  render = null,
} = {}) {
  return endCombatFromSheet({
    render,
  });
}

export async function advanceActorSheetCombatTurn(actor, {
  render = null,
} = {}) {
  return advanceCombatTurnFromSheet(actor, {
    render,
  });
}

export async function continueActorSheetPendingCombatAction(actor, {
  executePendingAction = null,
  render = null,
} = {}) {
  return continuePendingCombatActionFromSheet(actor, {
    executePendingAction,
    render,
  });
}

export async function endActorSheetCombatTurn(actor, {
  render = null,
} = {}) {
  return endCombatTurnFromSheet(actor, {
    render,
  });
}

export async function cancelActorSheetPendingCombatAction(actor, {
  render = null,
} = {}) {
  return cancelPendingCombatActionFromSheet(actor, {
    render,
  });
}

export async function commitActorSheetTimedAction(actor, action, {
  render = null,
} = {}) {
  return commitTimedActionFromSheet(actor, action, {
    render,
  });
}

export async function handleActorSheetPostActionSecondsState(actor, {
  render = null,
} = {}) {
  return handlePostActionSecondsState(actor, {
    render,
  });
}

export async function resolveActorSheetCombatTimeCost(actor, args, {
  requireSettledInventory = null,
} = {}) {
  return resolveCombatTimeCostForActor(actor, args, {
    requireSettledInventory,
  });
}

export async function performActorSheetAttack(args = {}) {
  return performActorAttack(args);
}
