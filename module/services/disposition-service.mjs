/**
 * Iron Hills — Disposition Service
 *
 * Определяет «свой/чужой» по token disposition. Используется AoE и любыми
 * другими механиками, которым нужен friend/foe-фильтр.
 *
 * Источник истины — Foundry token disposition (FRIENDLY / NEUTRAL / HOSTILE / SECRET).
 * Если у actor нет токена на сцене, делаем разумный fallback по ownership.
 *
 * @module services/disposition-service
 */

const FOUNDRY_DISPOSITION = (typeof CONST !== "undefined" && CONST?.TOKEN_DISPOSITIONS) || {
  SECRET:   -2,
  HOSTILE:  -1,
  NEUTRAL:   0,
  FRIENDLY:  1,
};

export const DISPOSITION = Object.freeze({
  SECRET:   FOUNDRY_DISPOSITION.SECRET,
  HOSTILE:  FOUNDRY_DISPOSITION.HOSTILE,
  NEUTRAL:  FOUNDRY_DISPOSITION.NEUTRAL,
  FRIENDLY: FOUNDRY_DISPOSITION.FRIENDLY,
});

/**
 * Вернуть disposition действующего актёра.
 *  1. Если у actor есть активный token на сцене — берём его disposition.
 *  2. Иначе если actor.prototypeToken задан — берём оттуда.
 *  3. Иначе fallback: PC → FRIENDLY, остальные → NEUTRAL.
 *
 * @param {Actor|null|undefined} actor
 * @returns {number}
 */
export function getActorDisposition(actor) {
  if (!actor) return DISPOSITION.NEUTRAL;

  const token = canvas?.tokens?.placeables?.find(t => t.actor?.id === actor.id);
  if (token?.document?.disposition !== undefined && token.document.disposition !== null) {
    return Number(token.document.disposition);
  }

  const protoDisp = actor.prototypeToken?.disposition;
  if (protoDisp !== undefined && protoDisp !== null) return Number(protoDisp);

  return actor.hasPlayerOwner ? DISPOSITION.FRIENDLY : DISPOSITION.NEUTRAL;
}

/**
 * Считаем актёров союзниками, если у них совпадает disposition (и это не SECRET).
 * Сам себе — союзник.
 *
 * @param {Actor} a
 * @param {Actor} b
 * @returns {boolean}
 */
export function actorsAreAllies(a, b) {
  if (!a || !b) return false;
  if (a === b || a.id === b.id) return true;

  const da = getActorDisposition(a);
  const db = getActorDisposition(b);
  if (da === DISPOSITION.SECRET || db === DISPOSITION.SECRET) return false;
  return da === db;
}

/**
 * Фильтр-помощник: оставить только не-союзников по отношению к attacker.
 * Включает самого attacker в исключение (его не бьём AoE по умолчанию).
 */
export function filterOutAllies(attacker, targets) {
  return (targets ?? []).filter(t => t && !actorsAreAllies(attacker, t));
}
