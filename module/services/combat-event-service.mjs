const COMBAT_EVENT_LIMIT = 60;
const fallbackCombatEvents = [];

const STATUS_LABELS = {
  armor: "Armor",
  banish: "Banish",
  blocked: "Blocked",
  buff: "Buff",
  cure: "Cure",
  damage: "Damage",
  debuff: "Debuff",
  disarm: "Disarm",
  down: "Down",
  effect: "Effect",
  fear: "Fear",
  friendly: "Friendly fire",
  heal: "Heal",
  hit: "Hit",
  miss: "Miss",
  restore: "Restore",
  silence: "Silence",
  slow: "Slow",
  stun: "Stun",
  summon: "Summon",
  utility: "Utility",
};

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanKey(value = "hit") {
  const key = String(value ?? "hit").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return key || "hit";
}

function randomId() {
  return globalThis.foundry?.utils?.randomID?.()
    ?? `ihce-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function actorName(actor, fallback = "") {
  return String(actor?.name ?? actor?.document?.name ?? fallback ?? "").trim();
}

function formatTime(time) {
  try {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

function getCombatRoundLabel(round, turn) {
  const hasRound = Number.isFinite(Number(round));
  const hasTurn = Number.isFinite(Number(turn));
  if (!hasRound && !hasTurn) return "";
  if (!hasRound) return `T${Number(turn) + 1}`;
  if (!hasTurn) return `R${round}`;
  return `R${round} / T${Number(turn) + 1}`;
}

function damageTone(damageType = "") {
  const key = cleanKey(damageType);
  if (["fire", "flame", "burning"].includes(key)) return "fire";
  if (["cold", "ice", "frost"].includes(key)) return "cold";
  if (["lightning", "shock", "storm"].includes(key)) return "lightning";
  if (["poison", "acid"].includes(key)) return "poison";
  if (["healing", "heal"].includes(key)) return "heal";
  if (["magical", "arcane", "void", "holy"].includes(key)) return "magic";
  return "hit";
}

function makeChip(label, value, tone = "neutral", visible = true) {
  if (!visible) return null;
  const text = String(value ?? "").trim();
  if (!text) return null;
  const cleanTone = cleanKey(tone);
  return {
    label,
    value: text,
    tone: cleanTone,
    className: `is-${cleanTone}`,
  };
}

function hasNumericValue(value) {
  return Number.isFinite(Number(value));
}

function compactChips(chips = []) {
  return chips.filter(Boolean).slice(0, 10);
}

function getMutableLog() {
  const game = globalThis.game;
  if (!game) return fallbackCombatEvents;
  game.ironHills = game.ironHills || {};
  if (!Array.isArray(game.ironHills._combatEvents)) game.ironHills._combatEvents = [];
  return game.ironHills._combatEvents;
}

function emitCombatEventHook(name, ...args) {
  try {
    globalThis.Hooks?.callAll?.(name, ...args);
  } catch (err) {
    console.warn(`Iron Hills | ${name} hook failed`, err);
  }
}

function statusLabel(status, fallback = "Hit") {
  const key = cleanKey(status);
  return STATUS_LABELS[key] ?? fallback;
}

function getAttackTone(result = {}) {
  if (!result?.hit) return "miss";
  if (result.targetKilled) return "kill";
  if (result.ally && result.friendlyFire) return "friendly";
  if (result.shieldBlock?.success && num(result.finalDamage, 0) <= 0) return "shield";
  if (num(result.finalDamage, 0) <= 0 && num(result.reduction, 0) > 0) return "armor";
  return damageTone(result.damageType);
}

function getAttackStatus(result = {}) {
  if (!result?.hit) return "miss";
  if (result.targetKilled) return "down";
  if (num(result.finalDamage ?? result.damage, 0) > 0) return "damage";
  if (result.shieldBlock?.success) return "blocked";
  if (num(result.armorLayer?.absorbed ?? result.reduction ?? result.armor, 0) > 0) return "armor";
  return "hit";
}

function getSourceType(source = "attack") {
  const key = cleanKey(source);
  if (key.includes("spell")) return "spell";
  if (key.includes("throw")) return "throwable";
  if (key.includes("reaction")) return "reaction";
  if (key.includes("aoe")) return "aoe";
  return "attack";
}

function getUtilityStatus(effectType = "", outcome = {}) {
  const type = cleanKey(effectType || outcome.effectType || "utility");
  if (type === "heal" || outcome.heal) return "heal";
  if (["restoreenergy", "restoremana", "stimulant"].includes(type) || outcome.resource) return "restore";
  if (type === "summon" || outcome.summon) return "summon";
  if (type === "banish" || outcome.banish) return outcome.banish?.destroyed ? "down" : "banish";
  if (["stun", "silence", "slow", "fear", "disarm"].includes(type)) return type;
  if (type.includes("cure")) return "cure";
  if (type === "buff") return "buff";
  if (type === "debuff") return "debuff";
  if (outcome.hitEffect || outcome.condition) return "effect";
  return "utility";
}

function getUtilityTone(status = "utility") {
  const key = cleanKey(status);
  if (["heal", "restore", "cure", "buff"].includes(key)) return "heal";
  if (["down", "banish"].includes(key)) return "kill";
  if (["stun", "silence", "slow", "fear", "disarm", "debuff"].includes(key)) return "magic";
  if (key === "summon") return "utility";
  return "effect";
}

function getUtilitySummary(effectType = "", outcome = {}) {
  const type = cleanKey(effectType || outcome.effectType || "utility");
  if (outcome.heal) {
    const healed = num(outcome.heal.healed ?? outcome.heal.amount ?? outcome.heal.restored, 0);
    const zone = String(outcome.heal.locationLabel ?? outcome.heal.locationKey ?? "").trim();
    return [`+${healed} HP`, zone ? `zone: ${zone}` : ""].filter(Boolean).join(" · ");
  }
  if (outcome.resource) {
    const key = String(outcome.resource.key ?? "resource");
    const restored = num(outcome.resource.restored ?? outcome.resource.amount, 0);
    const sign = restored >= 0 ? "+" : "";
    return `${key} ${sign}${restored}`;
  }
  if (outcome.summon) {
    return `${outcome.summon.label ?? "summon"} · ${num(outcome.summon.duration, 0)} sec`;
  }
  if (outcome.banish) {
    if (outcome.banish.destroyed) return "target banished";
    if (outcome.banish.stunned) return "target resisted, stunned";
    if (outcome.banish.eligible === false) return "not a valid banish target";
    return "banish resolved";
  }
  if (outcome.condition) return String(outcome.condition);
  if (outcome.hitEffect?.lines?.length) return outcome.hitEffect.lines.join(" · ");
  if (["stun", "silence", "slow", "fear", "disarm"].includes(type)) return statusLabel(type);
  if (type.includes("cure")) return statusLabel("cure");
  return statusLabel(type, "Utility");
}

export function buildUtilityCombatEvent({
  caster = null,
  target = null,
  label = "",
  effectType = "",
  effect = null,
  outcome = {},
  power = 0,
  targetPart = "",
} = {}) {
  const status = getUtilityStatus(effectType, outcome);
  const tone = getUtilityTone(status);
  const heal = outcome.heal ?? null;
  const resource = outcome.resource ?? null;
  const summon = outcome.summon ?? null;
  const banish = outcome.banish ?? null;
  const healed = num(heal?.healed ?? heal?.amount ?? heal?.restored, 0);
  const restored = num(resource?.restored ?? resource?.amount, 0);
  const duration = num(
    summon?.duration
      ?? outcome.duration
      ?? effect?.duration
      ?? effect?.durationSeconds,
    0,
  );
  const zone = String(
    heal?.locationLabel
      ?? heal?.locationKey
      ?? outcome.zone
      ?? targetPart
      ?? "",
  ).trim();
  const condition = String(
    outcome.condition
      ?? outcome.hitEffect?.condition
      ?? effect?.applyCondition
      ?? effect?.special
      ?? effectType
      ?? "",
  ).trim();

  return normalizeCombatEvent({
    type: "utility",
    source: "spell-utility",
    title: label || effect?.label || effect?.name || statusLabel(status, "Utility"),
    actorName: actorName(caster, "Unknown"),
    targetName: actorName(target, "Target"),
    status,
    statusLabel: statusLabel(status),
    tone,
    healed,
    restored,
    duration,
    zone,
    condition,
    targetKilled: Boolean(banish?.destroyed),
    summary: getUtilitySummary(effectType, outcome),
    chips: compactChips([
      makeChip("TYPE", effectType || outcome.effectType || effect?.special || "utility", "utility", true),
      makeChip("HP", `+${healed}`, "heal", healed > 0),
      makeChip(String(resource?.key ?? "RES").toUpperCase(), restored >= 0 ? `+${restored}` : String(restored), "heal", Boolean(resource)),
      makeChip("ZONE", zone, "zone", Boolean(zone)),
      makeChip("POWER", power, "neutral", hasNumericValue(power) && num(power, 0) > 0),
      makeChip("DUR", `${duration}s`, "utility", duration > 0),
      makeChip("COND", condition, tone, Boolean(condition)),
      makeChip("DOWN", "yes", "kill", Boolean(banish?.destroyed)),
    ]),
  });
}

export function buildAttackCombatEvent({
  attacker = null,
  target = null,
  result = null,
  label = "",
  source = "attack",
} = {}) {
  if (!result) return null;

  const hit = Boolean(result.hit);
  const damage = num(result.finalDamage ?? result.damage, 0);
  const rawDamage = num(result.rawDamage, damage);
  const shieldAbsorbed = num(result.shieldBlock?.shieldReduction ?? result.shieldBlock?.absorbed, 0);
  const armorAbsorbed = num(result.armorLayer?.absorbed ?? result.reduction ?? result.armor, 0);
  const zone = String(result.locationLabel ?? result.zone ?? result.zoneLabel ?? "").trim();
  const status = getAttackStatus(result);
  const tone = getAttackTone(result);
  const actorLabel = actorName(attacker, "Unknown");
  const targetLabel = actorName(target, result.targetName ?? result.name ?? "Target");
  const missText = hit ? "" : "missed";
  const damageText = hit && damage > 0 ? `${damage} damage` : "";
  const defenseText = shieldAbsorbed > 0 || armorAbsorbed > 0
    ? `${shieldAbsorbed + armorAbsorbed} absorbed`
    : "";
  const summary = [missText, damageText, defenseText, zone ? `zone: ${zone}` : ""]
    .filter(Boolean)
    .join(" · ");

  return normalizeCombatEvent({
    type: getSourceType(source),
    source,
    title: label || result.attackLabel || "Attack",
    actorName: actorLabel,
    targetName: targetLabel,
    status,
    statusLabel: statusLabel(status),
    tone,
    hit,
    miss: !hit,
    damage,
    rawDamage,
    shieldAbsorbed,
    armorAbsorbed,
    absorbed: shieldAbsorbed + armorAbsorbed,
    bodyDamage: damage,
    targetKilled: Boolean(result.targetKilled),
    friendlyFire: Boolean(result.ally && result.friendlyFire),
    zone,
    summary: summary || statusLabel(status),
    chips: compactChips([
      makeChip("DMG", damage, damage > 0 ? "damage" : "neutral", hit),
      makeChip("RAW", rawDamage, "neutral", hit && rawDamage !== damage),
      makeChip("SHIELD", shieldAbsorbed, result.shieldBlock?.broken ? "break" : "shield", shieldAbsorbed > 0),
      makeChip("ARMOR", armorAbsorbed, result.armorLayer?.broken ? "break" : "armor", armorAbsorbed > 0),
      makeChip("ZONE", zone, "zone", Boolean(zone)),
      makeChip("MARGIN", result.margin, "neutral", hasNumericValue(result.margin)),
      makeChip("DOWN", "yes", "kill", Boolean(result.targetKilled)),
      makeChip("FF", "yes", "friendly", Boolean(result.ally && result.friendlyFire)),
    ]),
  });
}

function getAoeResultDamage(result = {}) {
  return num(result.damage ?? result.finalDamage ?? result.amount, 0);
}

function getAoeResultName(result = {}) {
  return String(result.name ?? result.targetName ?? result.actorName ?? "Target").trim();
}

export function buildAoeCombatEvent({
  attacker = null,
  results = [],
  label = "",
  damageType = "",
  aoeType = "blast",
  isUtility = false,
  source = "aoe",
} = {}) {
  if (!Array.isArray(results) || !results.length) return null;

  const hitResults = results.filter(result => result?.hit !== false);
  const missCount = results.length - hitResults.length;
  const damage = results.reduce((sum, result) => sum + getAoeResultDamage(result), 0);
  const healed = results.reduce((sum, result) => sum + num(result?.healed, 0), 0);
  const armorAbsorbed = results.reduce((sum, result) => sum + num(result?.armor ?? result?.reduction, 0), 0);
  const killCount = results.filter(result => result?.targetKilled).length;
  const friendlyHits = results.filter(result => result?.ally && result?.friendlyFire && result?.hit !== false).length;
  const affected = isUtility ? hitResults.length : hitResults.filter(result => getAoeResultDamage(result) > 0 || result.targetKilled).length;
  const tone = friendlyHits > 0
    ? "friendly"
    : killCount > 0
      ? "kill"
      : isUtility && healed > 0
        ? "heal"
        : damageTone(damageType);
  const status = friendlyHits > 0
    ? "friendly"
    : isUtility
      ? "utility"
      : damage > 0
        ? "damage"
        : missCount >= results.length
          ? "miss"
          : "hit";
  const preview = results.slice(0, 5)
    .map(result => `${getAoeResultName(result)} ${result.hit === false ? "miss" : getAoeResultDamage(result)}`)
    .join(" · ");

  return normalizeCombatEvent({
    type: isUtility ? "utility" : "aoe",
    source,
    title: label || (isUtility ? "Area effect" : "AoE attack"),
    actorName: actorName(attacker, "Unknown"),
    targetName: `${hitResults.length}/${results.length} targets`,
    status,
    statusLabel: statusLabel(status),
    tone,
    damage,
    healed,
    armorAbsorbed,
    absorbed: armorAbsorbed,
    hitCount: hitResults.length,
    missCount,
    targetCount: results.length,
    affectedCount: affected,
    targetKilled: killCount > 0,
    killCount,
    friendlyFire: friendlyHits > 0,
    friendlyHits,
    aoeType,
    damageType,
    summary: preview || `${hitResults.length}/${results.length} targets`,
    chips: compactChips([
      makeChip("TYPE", aoeType, "neutral", Boolean(aoeType)),
      makeChip("HIT", `${hitResults.length}/${results.length}`, "hit", true),
      makeChip("MISS", missCount, "miss", missCount > 0),
      makeChip("DMG", damage, damage > 0 ? "damage" : "neutral", damage > 0),
      makeChip("HEAL", healed, "heal", healed > 0),
      makeChip("ARMOR", armorAbsorbed, "armor", armorAbsorbed > 0),
      makeChip("DOWN", killCount, "kill", killCount > 0),
      makeChip("FF", friendlyHits, "friendly", friendlyHits > 0),
    ]),
  });
}

export function normalizeCombatEvent(event = null) {
  if (!event || typeof event !== "object") return null;
  const combat = globalThis.game?.combat;
  const time = num(event.time, Date.now());
  const status = cleanKey(event.status ?? event.tone ?? "hit");
  const tone = cleanKey(event.tone ?? status);
  const round = event.round ?? combat?.round ?? null;
  const turn = event.turn ?? combat?.turn ?? null;
  const type = cleanKey(event.type ?? "combat");

  return {
    ...event,
    id: event.id || randomId(),
    type,
    typeClass: `is-${type}`,
    time,
    timeLabel: event.timeLabel || formatTime(time),
    round,
    turn,
    roundLabel: event.roundLabel || getCombatRoundLabel(round, turn),
    title: String(event.title ?? "Combat event"),
    actorName: String(event.actorName ?? ""),
    targetName: String(event.targetName ?? ""),
    status,
    statusLabel: event.statusLabel || statusLabel(status),
    tone,
    toneClass: `is-${tone}`,
    summary: String(event.summary ?? ""),
    chips: Array.isArray(event.chips) ? event.chips : [],
  };
}

export function recordCombatEvent(event = null) {
  const normalized = normalizeCombatEvent(event);
  if (!normalized) return null;
  const log = getMutableLog();
  log.unshift(normalized);
  if (log.length > COMBAT_EVENT_LIMIT) log.splice(COMBAT_EVENT_LIMIT);
  emitCombatEventHook("ironHillsCombatEvent", normalized, getCombatEventLog());
  emitCombatEventHook("ironHillsCombatDirectorUpdated", getCombatEventLog());
  return normalized;
}

export function getCombatEventLog() {
  return [...getMutableLog()];
}

export function getCombatEventStats(events = getCombatEventLog()) {
  const rows = Array.isArray(events) ? events : [];
  const damage = rows.reduce((sum, event) => sum + num(event.damage ?? event.bodyDamage, 0), 0);
  const healed = rows.reduce((sum, event) => sum + num(event.healed, 0), 0);
  const restored = rows.reduce((sum, event) => sum + num(event.restored, 0), 0);
  const absorbed = rows.reduce((sum, event) => sum + num(event.absorbed ?? event.armorAbsorbed, 0), 0);
  const kills = rows.reduce((sum, event) => {
    const count = num(event.killCount, 0);
    if (count > 0) return sum + count;
    return sum + (event.targetKilled || event.status === "down" ? 1 : 0);
  }, 0);
  const friendlyFire = rows.reduce((sum, event) => {
    const count = num(event.friendlyHits, 0);
    if (count > 0) return sum + count;
    return sum + (event.friendlyFire ? 1 : 0);
  }, 0);
  const misses = rows.filter(event => event.miss || event.status === "miss").length;
  const utility = rows.filter(event => event.type === "utility" || ["heal", "restore", "summon", "banish"].includes(event.status)).length;

  const statRows = [
    { label: "Events", value: rows.length, className: "is-neutral", visible: true },
    { label: "Damage", value: damage, className: "is-damage", visible: damage > 0 },
    { label: "Healing", value: healed, className: "is-heal", visible: healed > 0 },
    { label: "Restore", value: restored, className: "is-heal", visible: restored > 0 },
    { label: "Absorb", value: absorbed, className: "is-armor", visible: absorbed > 0 },
    { label: "Down", value: kills, className: "is-kill", visible: kills > 0 },
    { label: "Friendly", value: friendlyFire, className: "is-friendly", visible: friendlyFire > 0 },
    { label: "Miss", value: misses, className: "is-miss", visible: misses > 0 },
    { label: "Utility", value: utility, className: "is-utility", visible: utility > 0 },
  ].filter(row => row.visible !== false);

  return {
    total: rows.length,
    damage,
    healed,
    restored,
    absorbed,
    kills,
    friendlyFire,
    misses,
    utility,
    rows: statRows,
  };
}

export function clearCombatEventLog() {
  const log = getMutableLog();
  log.splice(0, log.length);
  emitCombatEventHook("ironHillsCombatDirectorUpdated", []);
  return [];
}

export { COMBAT_EVENT_LIMIT };
