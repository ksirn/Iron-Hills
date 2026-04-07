import {
  getCombatUiState,
  isCombatActive,
  nextTurn,
  endCombat,
  canActorCommitAction,
  getActorPendingAction,
  continuePendingAction,
  cancelPendingAction,
  endTurnForActor,
  isActorActiveTurn,
  advanceTurnIfReady
} from "../services/combat-flow-service.mjs";

import {
  getPersistentActor,
  getPersistentActorUuid,
  resolvePersistentActorFromTokenOrUser
} from "../utils/actor-utils.mjs";

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getRatio(value, max) {
  const safeMax = Math.max(1, num(max, 1));
  return Math.max(0, Math.min(1, num(value, 0) / safeMax));
}

function getZoneClass(value, max) {
  const ratio = getRatio(value, max);
  if (ratio <= 0) return "is-dead";
  if (ratio <= 0.25) return "is-critical";
  if (ratio <= 0.5) return "is-bad";
  if (ratio <= 0.75) return "is-warn";
  return "is-good";
}

function getHudActor() {
  return resolvePersistentActorFromTokenOrUser();
}

function getParticipantSideClass(side) {
  if (side === "ally") return "side-ally";
  if (side === "enemy") return "side-enemy";
  return "side-neutral";
}

function isFriendlySide(a, b) {
  if (a === "neutral" || b === "neutral") return false;
  return a === b;
}

function getPartTrauma(hpNode) {
  const status = hpNode?.status ?? {};
  return {
    minorBleeding: Number(status.minorBleeding ?? 0),
    majorBleeding: Number(status.majorBleeding ?? 0),
    fracture: Boolean(status.fracture),
    destroyed: Boolean(status.destroyed),
    splinted: Boolean(status.splinted),
    tourniquet: Boolean(status.tourniquet)
  };
}

export class IronHillsCombatHudApp extends Application {
  constructor(options = {}) {
    super(options);
    this._compactMode = Boolean(options.compactMode ?? true);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills", "combat-hud-app"],
      width: 620,
      height: 430,
      resizable: true,
      title: "Combat HUD"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/combat-hud.hbs";
  }

  _applySizing() {
    try {
      if (!this.rendered) return;
      this.setPosition({
        width: this._compactMode ? 320 : 620,
        height: "auto"
      });
    } catch (err) {
      console.warn("Iron Hills | HUD sizing failed", err);
    }
  }

  _refreshHud({ keepOnTop = false } = {}) {
    if (!this.rendered) return;
    this.render(false, { focus: false });

    window.setTimeout(() => {
      this._applySizing();
      if (keepOnTop) {
        try {
          if (this.element?.length) this.bringToTop();
        } catch (_err) {}
      }
    }, 10);
  }

  _canActorUseCombatAction(actor) {
    return canActorCommitAction(actor);
  }

  async _toggleCompactMode() {
    this._compactMode = !this._compactMode;
    this.render(true, { focus: false });

    window.setTimeout(() => {
      this._applySizing();
      try {
        if (this.element?.length) this.bringToTop();
      } catch (_err) {}
    }, 10);
  }

  async _attack(hand) {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) {
      ui.notifications.warn(combatCheck.reason || "Сейчас действие недоступно.");
      return;
    }

    const weaponId = actor.system?.equipment?.[hand];
    if (!weaponId) {
      await actor.sheet._performAttack({
        hand,
        skillKey: "unarmed",
        label: "Кулаки",
        damageType: "physical",
        baseDamage: Number(actor.system?.combat?.unarmedDamage ?? 1),
        energyCost: 5,
        weapon: null
      });
      this._refreshHud({ keepOnTop: true });
      return;
    }

    const weapon = actor.items.get(weaponId);
    if (!weapon) {
      ui.notifications.warn("Оружие не найдено.");
      return;
    }

    await actor.sheet._performAttack({
      hand,
      skillKey: weapon.system.skill,
      label: weapon.name,
      damageType: weapon.system.damageType,
      baseDamage: Number(weapon.system.damage ?? 1),
      energyCost: Number(weapon.system.energyCost ?? 10),
      weapon
    });

    this._refreshHud({ keepOnTop: true });
  }

  async _useQuickSlot(slotKey) {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    await actor.sheet._useQuickSlot(slotKey);
    this._refreshHud({ keepOnTop: true });
  }

  async _continuePendingAction() {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    const pending = getActorPendingAction(actor);
    if (!pending) {
      ui.notifications.warn("Нет длительного действия для продолжения.");
      return;
    }

    const result = continuePendingAction(actor);
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось продолжить действие.");
      return;
    }

    if (!result.done) {
      ui.notifications.info(
        `${actor.name} продолжает действие. Осталось ${Number(result.action?.remainingSeconds ?? 0)} сек.`
      );
      this._refreshHud({ keepOnTop: true });
      return;
    }

    if (typeof actor.sheet?._executePendingCombatAction === "function") {
      await actor.sheet._executePendingCombatAction(result.action);
    }

    this._refreshHud({ keepOnTop: true });
  }

  async _cancelPendingAction() {
    const actor = getHudActor();
    if (!actor) return;

    const result = cancelPendingAction(actor);
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось отменить действие.");
      return;
    }

    ui.notifications.info(`${actor.name} отменяет длительное действие.`);
    this._refreshHud({ keepOnTop: true });
  }

async _endTurnForActor() {
  const actor = getHudActor();
  if (!actor) return;

  const result = endTurnForActor(actor);
  if (!result?.ok) {
    ui.notifications.warn(result?.reason || "Не удалось завершить ход.");
    return;
  }

  const advanceResult = await advanceTurnIfReady();
  if (!advanceResult?.ok) {
    ui.notifications.warn(advanceResult?.reason || "Ход завершён, но передача следующему участнику не выполнена.");
    this._refreshHud({ keepOnTop: true });
    return;
  }

  this._refreshHud({ keepOnTop: true });
}

  async _endMyTurn() {
    const actor = getHudActor();
    if (!actor) {
      ui.notifications.warn("Нет активного актёра для завершения хода.");
      return;
    }

    const result = endTurnForActor(actor);
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось завершить ход.");
      return;
    }

    this._refreshHud({ keepOnTop: true });
  }

async _nextTurn() {
  if (!isCombatActive()) {
    ui.notifications.warn("Активного боя нет.");
    return;
  }

  const actor = getHudActor();

  if (actor && isActorActiveTurn(actor)) {
    await this._endTurnForActor();
    return;
  }

  if (game.user?.isGM) {
    const nextResult = await nextTurn();
    if (nextResult?.ok === false) {
      ui.notifications.warn(nextResult?.reason || "Не удалось передать ход.");
      return;
    }

    this._refreshHud({ keepOnTop: true });
    return;
  }

  ui.notifications.warn("Сейчас не ваш активный ход.");
}

  async _endCombat() {
    if (!isCombatActive()) {
      ui.notifications.warn("Активного боя нет.");
      return;
    }

    await endCombat();
    this._refreshHud({ keepOnTop: true });
  }

  async getData() {
    const actor = getHudActor();
    const state = getCombatUiState();
const current =
  (state.participants ?? [])[Math.max(0, Number(state.turn ?? 1) - 1)] ?? null;

    if (!actor) {
      return {
        hasActor: false,
        combatActive: isCombatActive(),
        compactMode: this._compactMode
      };
    }

    const hp = actor.system?.resources?.hp ?? {};
    const resources = actor.system?.resources ?? {};
    const quickSlots = actor.system?.quickSlots ?? {};
    const slotKeys = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"];
    const actorUuid = getPersistentActorUuid(actor);
    const actorParticipant =
      (state.participants ?? []).find(participant => participant.actorUuid === actorUuid) ?? null;
    const actorSide = actorParticipant?.side ?? "neutral";
    const pendingAction = actorParticipant?.pendingAction ?? null;

    return {
      hasActor: true,
      compactMode: this._compactMode,
      combatActive: isCombatActive(),
      actorName: actor.name,
      actorImg: actor.img,
      actorSide,
      actorSideClass: getParticipantSideClass(actorSide),
isCurrentTurn: Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
canEndTurn: Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
canContinuePendingAction:
  Boolean(actorParticipant?.pendingAction) &&
  Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
      currentTurnName: current?.actorName || "—",
      secondsLeft: actorParticipant ? num(actorParticipant.remainingSeconds, 0) : null,
      isSkippingTurn: Boolean(
        actorParticipant &&
        Number(actorParticipant.remainingSeconds ?? 0) <= 0 &&
        !actorParticipant.pendingAction &&
        actorParticipant.hasActed
      ),

      energyValue: num(resources.energy?.value, 0),
      energyMax: num(resources.energy?.max, 0),
      manaValue: num(resources.mana?.value, 0),
      manaMax: num(resources.mana?.max, 0),
      satietyValue: num(resources.satiety?.value, 0),
      satietyMax: num(resources.satiety?.max, 0),
      hydrationValue: num(resources.hydration?.value, 0),
      hydrationMax: num(resources.hydration?.max, 0),
      energyPct: Math.round(getRatio(resources.energy?.value, resources.energy?.max) * 100),
      manaPct: Math.round(getRatio(resources.mana?.value, resources.mana?.max) * 100),
      satietyPct: Math.round(getRatio(resources.satiety?.value, resources.satiety?.max) * 100),
      hydrationPct: Math.round(getRatio(resources.hydration?.value, resources.hydration?.max) * 100),

      pendingAction,
      hasPendingAction: Boolean(pendingAction),
      pendingActionLabel: pendingAction?.label || "",
      pendingActionRemainingSeconds: Number(pendingAction?.remainingSeconds ?? 0),
      canCancelPendingAction: Boolean(pendingAction),

      zones: [
        {
          key: "head",
          label: "Голова",
          value: num(hp.head?.value, 0),
          max: num(hp.head?.max, 0),
          cssClass: getZoneClass(hp.head?.value, hp.head?.max),
          trauma: getPartTrauma(hp.head)
        },
        {
          key: "torso",
          label: "Торс",
          value: num(hp.torso?.value, 0),
          max: num(hp.torso?.max, 0),
          cssClass: getZoneClass(hp.torso?.value, hp.torso?.max),
          trauma: getPartTrauma(hp.torso)
        },
        {
          key: "leftArm",
          label: "Л. рука",
          value: num(hp.leftArm?.value, 0),
          max: num(hp.leftArm?.max, 0),
          cssClass: getZoneClass(hp.leftArm?.value, hp.leftArm?.max),
          trauma: getPartTrauma(hp.leftArm)
        },
        {
          key: "rightArm",
          label: "П. рука",
          value: num(hp.rightArm?.value, 0),
          max: num(hp.rightArm?.max, 0),
          cssClass: getZoneClass(hp.rightArm?.value, hp.rightArm?.max),
          trauma: getPartTrauma(hp.rightArm)
        },
        {
          key: "leftLeg",
          label: "Л. нога",
          value: num(hp.leftLeg?.value, 0),
          max: num(hp.leftLeg?.max, 0),
          cssClass: getZoneClass(hp.leftLeg?.value, hp.leftLeg?.max),
          trauma: getPartTrauma(hp.leftLeg)
        },
        {
          key: "rightLeg",
          label: "П. нога",
          value: num(hp.rightLeg?.value, 0),
          max: num(hp.rightLeg?.max, 0),
          cssClass: getZoneClass(hp.rightLeg?.value, hp.rightLeg?.max),
          trauma: getPartTrauma(hp.rightLeg)
        }
      ],

      quickSlots: slotKeys.map(slotKey => {
        const itemId = quickSlots?.[slotKey];
        const item = itemId ? actor.items.get(itemId) : null;
        return {
          slotKey,
          short: slotKey.replace("slot", ""),
          itemName: item?.name || "—"
        };
      }),

      rightHandName: actor.system?.equipment?.rightHand
        ? (actor.items.get(actor.system.equipment.rightHand)?.name || "Кулаки")
        : "Кулаки",

      leftHandName: actor.system?.equipment?.leftHand
        ? (actor.items.get(actor.system.equipment.leftHand)?.name || "Кулаки")
        : "Кулаки",

      queue: (state.participants ?? []).map(participant => {
        const side = participant.side ?? "neutral";
        const isFriendly = actorSide !== "neutral" && isFriendlySide(actorSide, side);

        return {
          name: participant.actorName,
          secondsLeft: participant.remainingSeconds,
          initiative: participant.initiative,
          isCurrent: participant.id === state.activeParticipantId,
          sideClass: getParticipantSideClass(side),
          relationLabel: side === "neutral" ? "N" : (isFriendly ? "F" : "E")
        };
      })
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-attack-hand]").on("click", async event => {
      event.preventDefault();
      await this._attack(event.currentTarget.dataset.attackHand);
    });

    html.find("[data-continue-pending]").on("click", async event => {
      event.preventDefault();
      await this._continuePendingAction();
    });

    html.find("[data-cancel-pending]").on("click", async event => {
      event.preventDefault();
      await this._cancelPendingAction();
    });

    html.find("[data-end-turn]").on("click", async event => {
      event.preventDefault();
      await this._endTurnForActor();
    });

    html.find("[data-quickslot]").on("click", async event => {
      event.preventDefault();
      await this._useQuickSlot(event.currentTarget.dataset.quickslot);
    });

    html.find("[data-next-turn]").on("click", async event => {
      event.preventDefault();
      await this._nextTurn();
    });

    html.find("[data-end-combat]").on("click", async event => {
      event.preventDefault();
      await this._endCombat();
    });

    html.find("[data-toggle-compact]").on("click", async event => {
      event.preventDefault();
      await this._toggleCompactMode();
    });

    window.setTimeout(() => this._applySizing(), 10);
  }
}