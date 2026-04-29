import {
  getCombatUiState,
  getCombatRevision,
  isCombatActive,
  startCombat,
  endCombat,
  clearCombatLog,
  setParticipantSide,
  forceSetActiveParticipant,
  syncCombatParticipantsWithActors,
  advanceTurnIfReady,
  forceAdvanceTurn,
  getActiveTurnTransitionState,
  getSideLabel
} from "../services/combat-flow-service.mjs";

import {
  getPersistentActor,
  getPersistentActorUuid
} from "../utils/actor-utils.mjs";
import { num } from "../utils/math-utils.mjs";

function getSceneCombatTokens() {
  const placeables = canvas?.tokens?.placeables ?? [];

  return placeables
    .filter(token => token?.actor)
    .filter(token => ["character", "npc", "merchant"].includes(token.actor?.type))
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ru"));
}

function getDefaultSideForActor(actor) {
  if (!actor) return "neutral";
  if (actor.type === "character") return "ally";
  return "enemy";
}

function buildCombatRefFromToken(token, side = "neutral") {
  const actor = getPersistentActor(token.actor) ?? token.actor;

  return {
    actor,
    token: token.document ?? token,
    combatData: {
      side,
      actorUuid: getPersistentActorUuid(actor)
    }
  };
}

function resolveParticipantActor(participant) {
  let actor = null;

  try {
    if (participant?.actorUuid) {
      actor = fromUuidSync(participant.actorUuid);
    }
  } catch (_err) {
    actor = null;
  }

  actor = actor || game.actors?.get(participant?.actorId) || null;
  return getPersistentActor(actor) ?? actor ?? null;
}

export class IronHillsCombatManagerApp extends Application {
  constructor(options = {}) {
    super(options);

    this._selectedTokenIds = new Set();
    this._participantSides = new Map();
    this._startingCombat = false;
    this._lastCombatRevision = getCombatRevision();

    this._combatStateHook = state => {
      this._lastCombatRevision = Number(state?.revision ?? getCombatRevision());
      if (!this.rendered) return;
      this.render(true, { focus: false });
    };

    Hooks.on("ironHillsCombatStateUpdated", this._combatStateHook);

    this._combatPoller = window.setInterval(() => {
      const revision = getCombatRevision();
      if (revision === this._lastCombatRevision) return;

      this._lastCombatRevision = revision;
      if (!this.rendered) return;
      this.render(true, { focus: false });
    }, 180);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills", "combat-manager-app"],
      width: 720,
      height: 720,
      resizable: true,
      title: "Combat Manager"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/combat-manager.hbs";
  }

  async close(options = {}) {
    if (this._combatStateHook) {
      Hooks.off("ironHillsCombatStateUpdated", this._combatStateHook);
      this._combatStateHook = null;
    }

    if (this._combatPoller) {
      window.clearInterval(this._combatPoller);
      this._combatPoller = null;
    }

    return super.close(options);
  }

  _getTokenById(tokenId) {
    return canvas?.tokens?.placeables?.find(token => token.id === tokenId) ?? null;
  }

  _ensureTokenSide(token) {
    if (!token?.id || this._participantSides.has(token.id)) return;
    this._participantSides.set(token.id, getDefaultSideForActor(token.actor));
  }

  _setTokenSide(tokenId, side) {
    if (!tokenId) return;
    this._participantSides.set(tokenId, side || "neutral");
    this.render(true, { focus: false });
  }

  _toggleToken(tokenId) {
    if (!tokenId) return;

    const token = this._getTokenById(tokenId);
    if (token) this._ensureTokenSide(token);

    if (this._selectedTokenIds.has(tokenId)) {
      this._selectedTokenIds.delete(tokenId);
    } else {
      this._selectedTokenIds.add(tokenId);
    }

    this.render(true, { focus: false });
  }

  _selectControlled() {
    const controlled = canvas?.tokens?.controlled ?? [];
    for (const token of controlled) {
      if (!token?.actor) continue;
      this._selectedTokenIds.add(token.id);
      this._participantSides.set(token.id, "ally");
    }
    this.render(true, { focus: false });
  }

  _selectTargetsAsEnemies() {
    const targets = Array.from(game.user?.targets ?? []);
    for (const token of targets) {
      if (!token?.actor) continue;
      this._selectedTokenIds.add(token.id);
      this._participantSides.set(token.id, "enemy");
    }
    this.render(true, { focus: false });
  }

  _clearSelection() {
    this._selectedTokenIds.clear();
    this.render(true, { focus: false });
  }

  async _startEncounter() {
    if (this._startingCombat) return;

    if (isCombatActive()) {
      ui.notifications.warn("Бой уже активен.");
      return;
    }

    this._startingCombat = true;

    try {
      const refs = Array.from(this._selectedTokenIds)
        .map(tokenId => this._getTokenById(tokenId))
        .filter(Boolean)
        .map(token =>
          buildCombatRefFromToken(
            token,
            this._participantSides.get(token.id) ?? getDefaultSideForActor(token.actor)
          )
        );

      if (refs.length < 2) {
        ui.notifications.warn("Для боя нужно минимум 2 участника.");
        return;
      }

      const state = startCombat(refs);
      if (!state) return;

      ui.notifications.info(`Бой начат. Участников: ${state.participants.length}`);
      this.render(true, { focus: false });
    } finally {
      this._startingCombat = false;
    }
  }

  async _nextTurn() {
    if (!isCombatActive()) {
      ui.notifications.warn("Активного боя нет.");
      return;
    }

    const result = await advanceTurnIfReady();
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Нельзя передать ход.");
      return;
    }

    this.render(true, { focus: false });
  }

  async _forceNextTurn() {
    if (!isCombatActive()) {
      ui.notifications.warn("Активного боя нет.");
      return;
    }

    if (!game.user?.isGM) {
      ui.notifications.warn("Только GM может принудительно передать ход.");
      return;
    }

    const result = await forceAdvanceTurn();
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось принудительно передать ход.");
      return;
    }

    ui.notifications.info("GM принудительно передал ход следующему участнику.");
    this.render(true, { focus: false });
  }

  async _endEncounter() {
    if (!isCombatActive()) {
      ui.notifications.warn("Активного боя нет.");
      return;
    }

    await endCombat();
    this.render(true, { focus: false });
  }

  async _clearCombatLog() {
    if (!game.user?.isGM) {
      ui.notifications.warn("Только GM может очищать боевой лог.");
      return;
    }

    const result = clearCombatLog();
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось очистить лог.");
      return;
    }

    ui.notifications.info("Боевой лог очищен.");
    this.render(true, { focus: false });
  }

  async _syncState() {
    if (!isCombatActive()) return;
    await syncCombatParticipantsWithActors();
    this.render(true, { focus: false });
  }

  async _setParticipantSide(participantId, side) {
    setParticipantSide(participantId, side);
    this.render(true, { focus: false });
  }

  async _setActiveParticipant(participantId) {
    forceSetActiveParticipant(participantId);
    this.render(true, { focus: false });
  }

  async getData() {
    const tokens = getSceneCombatTokens();
    const state = getCombatUiState();
    const recentLog = (state.log ?? []).slice(0, 12);
    const activeParticipant =
      (state.participants ?? [])[Math.max(0, Number(state.turn ?? 1) - 1)] ?? null;
    const selected = this._selectedTokenIds;
    const turnTransitionState = getActiveTurnTransitionState();

    for (const token of tokens) {
      this._ensureTokenSide(token);
    }

    return {
      isGM: Boolean(game.user?.isGM),
      canAdvanceTurn: Boolean(turnTransitionState.canAdvance),
      advanceTurnReason: turnTransitionState.reason || "",
      recentLog,
      activeParticipantSummary: activeParticipant
        ? {
            name: activeParticipant.actorName,
            initiative: activeParticipant.initiative,
            secondsLeft: activeParticipant.remainingSeconds,
            sideLabel: getSideLabel(activeParticipant.side ?? "neutral"),
            hasPendingAction: Boolean(activeParticipant.pendingAction),
            pendingActionLabel: activeParticipant.pendingAction?.label || "",
            pendingActionRemainingSeconds: Number(activeParticipant.pendingAction?.remainingSeconds ?? 0),
            isSkippingTurn:
              Number(activeParticipant.remainingSeconds ?? 0) <= 0 &&
              !activeParticipant.pendingAction &&
              Boolean(activeParticipant.hasActed)
          }
        : null,
      combatActive: isCombatActive(),
      tokens: tokens.map(token => {
        const actor = token.actor;
        const hp = actor.system?.resources?.hp ?? {};
        const torsoHp = num(hp.torso?.value, 0);
        const torsoMax = Math.max(1, num(hp.torso?.max, 1));
        const side = this._participantSides.get(token.id) ?? getDefaultSideForActor(actor);

        return {
          id: token.id,
          name: token.name,
          img: token.document?.texture?.src || actor.img || "icons/svg/mystery-man.svg",
          actorType: actor.type,
          selected: selected.has(token.id),
          controlled: Boolean(token.controlled),
          targeted: game.user?.targets?.has(token),
          initiativeHint: Math.max(
            num(actor.system?.skills?.perception?.value, 1),
            num(actor.system?.skills?.athletics?.value, 1)
          ),
          torsoHp,
          torsoMax,
          energy: num(actor.system?.resources?.energy?.value, 0),
          energyMax: num(actor.system?.resources?.energy?.max, 0),
          side,
          sideLabel: getSideLabel(side),
          isAlly: side === "ally",
          isEnemy: side === "enemy",
          isNeutral: side === "neutral"
        };
      }),
      selectedCount: selected.size,
      currentTurnName: state.activeParticipant?.actorName || "—",
      participantsCount: state.participants?.length ?? 0,
      queue: (state.participants ?? []).map(participant => {
        const actor = resolveParticipantActor(participant);
        const conditions = actor?.system?.conditions ?? {};

        return {
          id: participant.id,
          name: participant.actorName,
          initiative: participant.initiative,
          secondsLeft: participant.remainingSeconds,
          side: participant.side ?? "neutral",
          sideLabel: getSideLabel(participant.side ?? "neutral"),
          isCurrent: participant.id === state.activeParticipantId,
          isAlly: (participant.side ?? "neutral") === "ally",
          isEnemy: (participant.side ?? "neutral") === "enemy",
          isNeutral: (participant.side ?? "neutral") === "neutral",
          hasPendingAction: Boolean(participant.pendingAction),
          pendingActionLabel: participant.pendingAction?.label || "",
          pendingActionRemainingSeconds: Number(participant.pendingAction?.remainingSeconds ?? 0),
          conditions: [
            { key: "bleeding", active: Boolean(conditions.bleeding) },
            { key: "shock", active: Boolean(conditions.shock) },
            { key: "poison", active: Boolean(conditions.poison) },
            { key: "stunned", active: Boolean(conditions.stunned) }
          ]
        };
      })
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-token-toggle]").on("click", event => {
      event.preventDefault();
      this._toggleToken(event.currentTarget.dataset.tokenToggle);
    });

    html.find("[data-set-side]").on("click", event => {
      event.preventDefault();
      event.stopPropagation();
      this._setTokenSide(event.currentTarget.dataset.tokenId, event.currentTarget.dataset.setSide);
    });

    html.find("[data-select-controlled]").on("click", event => {
      event.preventDefault();
      this._selectControlled();
    });

    html.find("[data-select-targets]").on("click", event => {
      event.preventDefault();
      this._selectTargetsAsEnemies();
    });

    html.find("[data-clear-selection]").on("click", event => {
      event.preventDefault();
      this._clearSelection();
    });

    html.find("[data-start-encounter]").off("click").on("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      if (this._startingCombat) return;
      await this._startEncounter();
    });

    html.find("[data-next-turn]").on("click", async event => {
      event.preventDefault();
      await this._nextTurn();
    });

    html.find("[data-force-next-turn]").on("click", async event => {
      event.preventDefault();
      await this._forceNextTurn();
    });

    html.find("[data-end-encounter]").on("click", async event => {
      event.preventDefault();
      await this._endEncounter();
    });

    html.find("[data-sync-combat]").on("click", async event => {
      event.preventDefault();
      await this._syncState();
    });

    html.find("[data-queue-side]").on("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      await this._setParticipantSide(event.currentTarget.dataset.participantId, event.currentTarget.dataset.queueSide);
    });

    html.find("[data-set-active-participant]").on("click", async event => {
      event.preventDefault();
      event.stopPropagation();
      await this._setActiveParticipant(event.currentTarget.dataset.setActiveParticipant);
    });

    html.find("[data-clear-combat-log]").on("click", async event => {
      event.preventDefault();
      await this._clearCombatLog();
    });
  }
}