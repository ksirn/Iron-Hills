/**
 * Iron Hills — World helpers
 * Простые getter'ы по типам actor'ов мира (settlement / merchant / faction / poi / quest / character).
 * Единый источник истины: до этого их повторяли quest-tools, world-sim-tools, ещё пара мест.
 */

export function getSettlements() {
  return game.actors?.filter(a => a.type === "settlement") ?? [];
}

export function getMerchants() {
  return game.actors?.filter(a => a.type === "merchant") ?? [];
}

export function getFactions() {
  return game.actors?.filter(a => a.type === "faction") ?? [];
}

export function getPois() {
  return game.actors?.filter(a => a.type === "poi") ?? [];
}

export function getQuests() {
  return game.actors?.filter(a => a.type === "quest") ?? [];
}

export function getCharacters() {
  return game.actors?.filter(a => a.type === "character") ?? [];
}

export function findSettlementByName(name) {
  if (!name) return null;
  return getSettlements().find(s => s.name === name) ?? null;
}

export function findFactionByName(name) {
  if (!name) return null;
  return getFactions().find(f => f.name === name) ?? null;
}

export function findPoiByName(name) {
  if (!name) return null;
  return getPois().find(p => p.name === name) ?? null;
}

export function findCharacterByName(name) {
  if (!name) return null;
  return getCharacters().find(c => c.name === name) ?? null;
}

export function getRegionSettlements(region) {
  return getSettlements().filter(s => (s.system.info?.region || "") === region);
}
