/**
 * Iron Hills — Combat Bar App
 * Узкая панель действий в бою. Появляется только когда бой активен.
 * Размещается снизу над тулбаром.
 */
import {
  getCombatUiState, isCombatActive, nextTurn, endCombat,
  canActorCommitAction, getActorRemainingSeconds,
} from "../services/combat-flow-service.mjs";

function getBarActor() {
  return game.user?.character
      ?? canvas?.tokens?.controlled?.[0]?.actor
      ?? null;
}

export class IronHillsCombatBarApp extends Application {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id:        "iron-hills-combat-bar",
      classes:   ["iron-hills", "combat-bar"],
      popOut:    false,
      template:  "systems/iron-hills-system/templates/apps/combat-bar.hbs",
      width:     "auto",
      height:    "auto",
    });
  }

  setPosition(pos = {}) {
    const tbH = document.getElementById("ih-tb")?.offsetHeight ?? 60;
    pos.left   = 0;
    pos.bottom = undefined;
    pos.top    = window.innerHeight - tbH - 60;
    pos.width  = window.innerWidth;
    return super.setPosition(pos);
  }

  async getData() {
    const actor = getBarActor();
    const state = getCombatUiState();
    const active = isCombatActive();
    if (!active) return { combatActive: false };

    const current = (state.participants ?? [])[Math.max(0, Number(state.turn ?? 1) - 1)] ?? null;
    const actorUuid    = actor ? `Actor.${actor.id}` : null;
    const isCurrentTurn = Boolean(current && actorUuid &&
      String(current.actorUuid ?? "") === String(actorUuid));
    const secondsLeft  = actor ? getActorRemainingSeconds(actor.id) : 0;

    const equip        = actor?.system?.equipment ?? {};
    const leftWeapon   = equip.leftHand  ? actor.items.get(equip.leftHand)  : null;
    const rightWeapon  = equip.rightHand ? actor.items.get(equip.rightHand) : null;

    const shorten = (name) => name ? (name.length > 10 ? name.slice(0,9)+"…" : name) : "—";

    return {
      combatActive:   true,
      actorName:      actor?.name ?? "?",
      isCurrentTurn,
      secondsLeft,
      currentTurnName: current ? (game.actors.get(current.actorId)?.name ?? "?") : "?",
      isGM:           game.user?.isGM,
      canEndTurn:     isCurrentTurn,
      isSprinting:    game.ironHills?._moveMode === "sprint",
      leftHandName:   leftWeapon?.name ?? "Кулак",
      leftHandShort:  shorten(leftWeapon?.name ?? "Кулак"),
      rightHandName:  rightWeapon?.name ?? null,
      rightHandShort: shorten(rightWeapon?.name ?? ""),
      manaCur:        Number(actor?.system?.resources?.mana?.value ?? 0),
      manaMax:        Number(actor?.system?.resources?.mana?.max   ?? 0),
      hasMana:        Number(actor?.system?.resources?.mana?.max   ?? 0) > 0,
      energyCur:      Number(actor?.system?.resources?.energy?.value ?? 0),
      energyMax:      Number(actor?.system?.resources?.energy?.max   ?? 0),
      canBreathe:     isCurrentTurn &&
                      Number(actor?.system?.resources?.energy?.value ?? 0) <
                      Number(actor?.system?.resources?.energy?.max   ?? 0),
      hasPendingAction:         false, // TODO
      pendingActionLabel:       "",
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Атака
    html.find("[data-attack-hand]").on("click", async e => {
      const hud = game.ironHills?.apps?.combatHud;
      if (hud) await hud._attack(e.currentTarget.dataset.attackHand);
    });

    // Заклинания
    html.find("[data-cast-spell]").on("click", async () => {
      const hud = game.ironHills?.apps?.combatHud;
      if (hud) await hud._castSpell();
    });

    // Перевести дух
    html.find("[data-breathe]").on("click", async () => {
      const hud = game.ironHills?.apps?.combatHud;
      if (hud) await hud._breathe();
    });

    // Toggle sprint
    html.find("[data-toggle-sprint]").on("click", () => {
      const cur = game.ironHills?._moveMode ?? "walk";
      game.ironHills?.setMoveMode?.(cur === "sprint" ? "walk" : "sprint");
      this.render(false);
    });

    // Конец хода
    html.find("[data-end-turn]").on("click", async () => {
      const hud = game.ironHills?.apps?.combatHud;
      if (hud) await hud._endTurnForActor();
    });

    // Следующий ход (GM)
    html.find("[data-next-turn]").on("click", async () => {
      await nextTurn();
    });

    // Завершить бой (GM)
    html.find("[data-end-combat]").on("click", async () => {
      if (game.user?.isGM) await endCombat();
    });

    // Continue pending
    html.find("[data-continue-pending]").on("click", async () => {
      const hud = game.ironHills?.apps?.combatHud;
      if (hud) await hud._continuePending?.();
    });
  }

  refresh() {
    if (this.rendered) this.render(false, { focus: false });
  }
}
