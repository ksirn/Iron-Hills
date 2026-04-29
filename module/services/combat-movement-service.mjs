/**
 * Iron Hills — Combat Movement Service
 *
 * Стоимость движения токена в бою (секунды + энергия), отслеживание
 * предыдущих позиций и блокировка движения, если ресурсов не хватает.
 *
 * Регистрируется однократно в Hooks.once("init") через
 * registerCombatMovementHooks().
 */

import {
  isCombatActive,
  getCombatState,
  spendActorSeconds,
} from "./combat-flow-service.mjs";

/**
 * Реестр режимов движения. Можно расширять (например, "stealth", "crouch").
 * Каждый режим: время в секундах на клетку и стоимость энергии за клетку.
 */
export const MOVE_MODES = Object.freeze({
  walk: {
    id: "walk",
    label: "🚶 Шаг",
    hint: "медленно, экономно",
    secondsPerCell: 2.0,
    energyPerCell:  1,
  },
  sprint: {
    id: "sprint",
    label: "🏃 Рывок",
    hint: "быстро, затратно",
    secondsPerCell: 1.0,
    energyPerCell:  3,
  },
});

const DEFAULT_MODE = "walk";

let _currentMode = DEFAULT_MODE;
const _tokenPrevPos = new Map();

export function getMoveMode() {
  return _currentMode;
}

export function getMoveModeConfig() {
  return MOVE_MODES[_currentMode] ?? MOVE_MODES[DEFAULT_MODE];
}

/**
 * Переключить активный режим. Возвращает true при успехе.
 * Параметр notify=false подавляет всплывающее уведомление (для консольных вызовов).
 */
export function setMoveMode(mode, { notify = true } = {}) {
  const config = MOVE_MODES[mode];
  if (!config) return false;

  _currentMode = mode;

  if (notify) {
    ui.notifications?.info?.(`${config.label} — ${config.hint}`);
  }
  return true;
}

/**
 * Расчёт стоимости движения для текущего режима.
 * @param {number} cells — пройденное расстояние в клетках (десятые доли допустимы).
 * @returns {{ timeCost:number, energyCost:number, mode:object, cells:number }}
 */
export function getMovementCost(cells) {
  const mode = getMoveModeConfig();
  const safeCells = Math.max(0, Math.round(Number(cells || 0) * 10) / 10);
  return {
    cells:     safeCells,
    mode,
    timeCost:   Math.ceil(safeCells * mode.secondsPerCell),
    energyCost: Math.ceil(safeCells * mode.energyPerCell),
  };
}

function getCombatParticipantForActor(actor) {
  const state = getCombatState?.();
  if (!state) return null;
  return state.participants?.find(p => p.actorId === actor.id) ?? null;
}

/**
 * Регистрация хуков движения. Вызывать ровно один раз в Hooks.once("init").
 * Идемпотентно: повторный вызов не плодит дубликатов (флаг на globalThis).
 */
export function registerCombatMovementHooks() {
  if (globalThis.__ironHillsCombatMovementRegistered) return;
  globalThis.__ironHillsCombatMovementRegistered = true;

  Hooks.on("preUpdateToken", (tokenDoc, changes) => {
    if (!("x" in changes) && !("y" in changes)) return;
    if (!tokenDoc.actor) return;
    _tokenPrevPos.set(tokenDoc.id, { x: tokenDoc.x, y: tokenDoc.y });
  });

  Hooks.on("updateToken", async (tokenDoc, changes) => {
    if (!("x" in changes) && !("y" in changes)) return;

    const prev = _tokenPrevPos.get(tokenDoc.id);
    _tokenPrevPos.delete(tokenDoc.id);
    if (!prev) return;

    const actor = tokenDoc.actor;
    if (!actor) return;

    if (!isCombatActive()) return;

    const participant = getCombatParticipantForActor(actor);
    if (!participant) return;

    // Расстояние в клетках
    const gridSize = canvas?.grid?.size ?? 100;
    const dx = ((changes.x ?? prev.x) - prev.x) / gridSize;
    const dy = ((changes.y ?? prev.y) - prev.y) / gridSize;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1) return;

    const { cells, mode, timeCost, energyCost } = getMovementCost(dist);

    // Проверяем ресурсы
    const remainingSec = Number(participant.remainingSeconds ?? 0);
    const curEnergy   = Number(actor.system?.resources?.energy?.value ?? 0);

    if (remainingSec < timeCost) {
      ui.notifications.warn(
        `${actor.name}: не хватает времени (нужно ${timeCost} сек., осталось ${remainingSec})`
      );
      await tokenDoc.update({ x: prev.x, y: prev.y }, { animate: false });
      return;
    }

    if (curEnergy < energyCost) {
      ui.notifications.warn(
        `${actor.name}: не хватает энергии (нужно ${energyCost} ⚡, есть ${curEnergy})`
      );
      await tokenDoc.update({ x: prev.x, y: prev.y }, { animate: false });
      return;
    }

    spendActorSeconds(actor.id, timeCost, {
      actionType: "movement",
      label: `${mode.label} ${cells} кл.`,
    });

    const newEnergy = Math.max(0, curEnergy - energyCost);
    await actor.update({ "system.resources.energy.value": newEnergy });

    ui.notifications.info(
      `${actor.name}: ${mode.label} ${cells} кл. — −${timeCost} сек., −${energyCost} ⚡ ` +
      `(осталось ${remainingSec - timeCost} сек., ${newEnergy} ⚡)`,
      { permanent: false }
    );

    // Обновляем HUD
    game.ironHills?.apps?.combatHud?._refreshHud?.({ keepOnTop: true });
  });
}
