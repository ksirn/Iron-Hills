/**
 * Iron Hills — Faction Service (PATCH 29)
 * Три уровня репутации: фракция / город / конкретный NPC
 *
 * Приоритет при взаимодействии:
 *   личная (NPC) → городская → фракционная → 0 (нейтрал)
 */

import { clamp } from "../utils/math-utils.mjs";

// ─── Уровни репутации ───────────────────────────────────────────

export const REP_LEVELS = [
  { min:  76, max:  100, id: "ally",        label: "💚 Союзник",       priceMult: 0.80, color: "#4ade80" },
  { min:  26, max:   75, id: "friendly",    label: "🟢 Дружелюбный",   priceMult: 0.90, color: "#86efac" },
  { min: -25, max:   25, id: "neutral",     label: "⚪ Нейтральный",   priceMult: 1.00, color: "#a8b8d0" },
  { min: -75, max:  -26, id: "unfriendly",  label: "🟠 Недружелюбный", priceMult: 1.15, color: "#fb923c" },
  { min:-100, max:  -76, id: "hostile",     label: "🔴 Враждебный",    priceMult: 0,    color: "#ef4444" },
];

export function getRepLevel(rep) {
  return REP_LEVELS.find(l => rep >= l.min && rep <= l.max) ?? REP_LEVELS[2];
}

// ─── Получить репутацию ─────────────────────────────────────────

/** Все фракции в мире */
export function getAllFactions() {
  return (game.actors ?? []).filter(a => a.type === "faction");
}

/**
 * Получить репутацию персонажа у фракции.
 * @param {Actor}  character  — персонаж
 * @param {Actor}  faction    — фракция
 * @param {string} [settlementId] — если передан, учитывается городской модификатор
 * @returns {number} -100..100
 */
export function getReputation(character, faction, settlementId = null) {
  if (!character || !faction) return 0;

  // Базовая: хранится у фракции
  const factionRep = faction.system?.reputation ?? {};
  const base = Number(factionRep[character.id] ?? 0);

  // Городская: модификатор фракции в конкретном поселении
  if (settlementId) {
    const settlRep = faction.system?.settlementRep ?? {};
    const cityMod  = Number(settlRep[settlementId] ?? 0);
    // Берём городскую если она задана (не 0), иначе глобальную
    return cityMod !== 0 ? clamp(cityMod, -100, 100) : clamp(base, -100, 100);
  }

  return clamp(base, -100, 100);
}

/**
 * Получить личную репутацию персонажа у конкретного NPC.
 * Приоритет: личная → городская → фракционная
 * @param {Actor}  character
 * @param {Actor}  npcActor
 * @returns {number}
 */
export function getNpcReputation(character, npcActor) {
  if (!character || !npcActor) return 0;

  // 1. Личная репутация (хранится у NPC)
  const personal = npcActor.system?.personalRep ?? {};
  if (personal[character.id] !== undefined) {
    return clamp(Number(personal[character.id]), -100, 100);
  }

  // 2. Фракционная + городская
  const factionId    = npcActor.system?.info?.faction;
  const settlementId = npcActor.system?.info?.settlement;
  if (!factionId) return 0;

  const faction = game.actors?.get(factionId)
    ?? getAllFactions().find(f => f.name === factionId);
  if (!faction) return 0;

  return getReputation(character, faction, settlementId || null);
}

/**
 * Получить модификатор цены на основе репутации.
 * @returns {number} множитель (0.8 = скидка 20%, 1.15 = наценка 15%, 0 = не торгует)
 */
export function getPriceMult(character, npcActor) {
  const rep   = getNpcReputation(character, npcActor);
  const level = getRepLevel(rep);
  return level.priceMult;
}

// ─── Изменить репутацию ─────────────────────────────────────────

/**
 * Изменить глобальную репутацию персонажа у фракции.
 * @param {Actor}  character
 * @param {Actor|string} faction — актор или имя
 * @param {number} delta  — изменение (-100..100)
 * @param {string} reason — причина для лога
 */
export async function changeReputation(character, faction, delta, reason = "") {
  if (!character || !faction || delta === 0) return;

  // Резолвим фракцию по имени если строка
  const factionActor = typeof faction === "string"
    ? getAllFactions().find(f => f.name === faction)
    : faction;
  if (!factionActor) {
    console.warn(`Iron Hills | Faction not found: ${faction}`);
    return;
  }

  const cur    = getReputation(character, factionActor);
  const next   = clamp(cur + delta, -100, 100);
  const prevLvl = getRepLevel(cur);
  const nextLvl = getRepLevel(next);

  // Обновляем у фракции
  await factionActor.update({
    [`system.reputation.${character.id}`]: next,
  });

  // Лог
  const logEntry = {
    date:   game.time?.worldTime ?? 0,
    actor:  character.name,
    from:   cur,
    to:     next,
    delta,
    reason,
  };
  const log = [...(factionActor.system?.log ?? []), logEntry].slice(-50);
  await factionActor.update({ "system.log": log });

  // Сообщение если изменился уровень репутации
  if (prevLvl.id !== nextLvl.id) {
    await ChatMessage.create({
      content: `<div style="padding:6px">
        ${nextLvl.color
          ? `<span style="color:${nextLvl.color}">●</span>`
          : "●"}
        <b>${character.name}</b> ↔ <b>${factionActor.name}</b>:
        ${prevLvl.label} → ${nextLvl.label}
        ${reason ? `<br><span style="color:#a8b8d0;font-size:10px">${reason}</span>` : ""}
      </div>`
    });
  }

  return { prev: cur, next, prevLevel: prevLvl, nextLevel: nextLvl };
}

/**
 * Изменить городскую репутацию фракции в поселении.
 */
export async function changeSettlementRep(faction, settlementId, delta, reason = "") {
  const factionActor = typeof faction === "string"
    ? getAllFactions().find(f => f.name === faction)
    : faction;
  if (!factionActor) return;

  const cur  = Number(factionActor.system?.settlementRep?.[settlementId] ?? 0);
  const next = clamp(cur + delta, -100, 100);
  await factionActor.update({
    [`system.settlementRep.${settlementId}`]: next,
  });
}

/**
 * Изменить личную репутацию у конкретного NPC.
 */
export async function changeNpcRep(character, npcActor, delta, reason = "") {
  if (!character || !npcActor || delta === 0) return;

  const cur  = Number(npcActor.system?.personalRep?.[character.id] ?? 0);
  const next = clamp(cur + delta, -100, 100);
  await npcActor.update({
    [`system.personalRep.${character.id}`]: next,
  });

  if (Math.abs(delta) >= 10) {
    const lvl = getRepLevel(next);
    ui.notifications.info(`${npcActor.name} → ${character.name}: ${lvl.label} (${next > 0 ? "+" : ""}${next})`);
  }
}

// ─── Интеграция с торговлей ─────────────────────────────────────

/**
 * Применить модификатор репутации к цене товара.
 */
export function applyRepToPrice(basePrice, character, merchantActor) {
  if (!character || !merchantActor) return basePrice;
  const mult = getPriceMult(character, merchantActor);
  if (mult === 0) return null; // не торгует
  return Math.ceil(basePrice * mult);
}

/**
 * Проверить может ли персонаж торговать с этим NPC.
 */
export function canTrade(character, merchantActor) {
  const rep = getNpcReputation(character, merchantActor);
  return getRepLevel(rep).id !== "hostile";
}

// ─── Быстрые хелперы ───────────────────────────────────────────

/**
 * Авто-изменение репутации при квестовых событиях.
 * Вызывается из applyWorldImpact и quest completion.
 */
export async function applyQuestReputation(character, questActor, completed = true) {
  if (!questActor || !character) return;

  const factionName = questActor.system?.info?.faction ?? "";
  const difficulty  = Number(questActor.system?.info?.difficulty ?? 1);
  const delta       = completed
    ? Math.ceil(difficulty * 3)   // выполнил: +3 за тир сложности
    : -Math.ceil(difficulty * 2); // провалил: -2 за тир

  if (factionName) {
    await changeReputation(character, factionName, delta,
      completed
        ? `Выполнен квест: ${questActor.name}`
        : `Провален квест: ${questActor.name}`
    );
  }
}

/**
 * Получить все репутации персонажа (для отображения).
 */
export function getAllReputations(character) {
  const charRep = character.system?.factions ?? {};

  return getAllFactions()
    .map(faction => {
      const rep   = getReputation(character, faction);
      const level = getRepLevel(rep);
      // Показываем фракцию только если было взаимодействие (rep !== 0)
      const hasInteraction = faction.system?.reputation?.[character.id] !== undefined;
      return {
        factionId:      faction.id,
        factionName:    faction.name,
        factionType:    faction.system?.info?.type ?? "guild",
        rep,
        level,
        pct:            (rep + 100) / 2,
        hasInteraction,
      };
    })
    .filter(f => f.hasInteraction) // только с которыми было взаимодействие
    .sort((a, b) => b.rep - a.rep);
}
