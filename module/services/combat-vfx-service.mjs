import { getActorToken } from "../utils/item-utils.mjs";
import {
  buildAoeCombatEvent,
  buildAttackCombatEvent,
  recordCombatEvent,
} from "./combat-event-service.mjs";

const SYSTEM_ID = "iron-hills-system";
const VFX_SETTING = "combatVfxEnabled";
const LAYER_CLASS = "ih-combat-vfx-layer";
const MAX_AOE_FLOATS = 24;

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanTone(value = "hit") {
  const tone = String(value ?? "hit").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return tone || "hit";
}

function isBrowserReady() {
  return Boolean(globalThis.document?.body);
}

export function isCombatVfxEnabled() {
  if (!isBrowserReady()) return false;
  try {
    const configured = globalThis.game?.settings?.get?.(SYSTEM_ID, VFX_SETTING);
    if (typeof configured === "boolean") return configured;
  } catch {
    // The setting is absent during some smoke tests and early init paths.
  }
  return true;
}

function getLayer() {
  if (!isCombatVfxEnabled()) return null;
  const doc = globalThis.document;
  let layer = doc.querySelector(`.${LAYER_CLASS}`);
  if (!layer) {
    layer = doc.createElement("div");
    layer.className = LAYER_CLASS;
    doc.body.appendChild(layer);
  }
  return layer;
}

function removeLater(element, delayMs = 1400) {
  globalThis.setTimeout?.(() => element?.remove?.(), Math.max(100, num(delayMs, 1400)));
}

function getTokenDocument(token) {
  return token?.document ?? token ?? null;
}

function tokenId(token) {
  const doc = getTokenDocument(token);
  return String(doc?.id ?? token?.id ?? "");
}

function getTokenById(id = "") {
  const wanted = String(id ?? "").trim();
  if (!wanted || !globalThis.canvas?.tokens?.placeables) return null;
  return globalThis.canvas.tokens.placeables.find(token => {
    const doc = getTokenDocument(token);
    return String(token?.id ?? "") === wanted || String(doc?.id ?? "") === wanted;
  }) ?? null;
}

function getTokenByActorId(actorId = "") {
  const wanted = String(actorId ?? "").trim();
  if (!wanted || !globalThis.canvas?.tokens?.placeables) return null;
  return globalThis.canvas.tokens.placeables.find(token => String(token?.actor?.id ?? "") === wanted) ?? null;
}

function resolveToken({ actor = null, token = null, tokenId: tokenIdValue = "", actorId = "" } = {}) {
  return token
    ?? getTokenById(tokenIdValue)
    ?? getTokenByActorId(actorId)
    ?? (actor ? getActorToken(actor) : null);
}

function getTokenCenter(token) {
  if (!token) return null;
  const doc = getTokenDocument(token);
  const center = token.center;
  if (center && Number.isFinite(center.x) && Number.isFinite(center.y)) {
    return { x: center.x, y: center.y };
  }
  const grid = Math.max(1, num(globalThis.canvas?.grid?.size, 100));
  const width = num(token.w ?? doc?.width * grid, grid);
  const height = num(token.h ?? doc?.height * grid, grid);
  return {
    x: num(token.x ?? doc?.x, 0) + width / 2,
    y: num(token.y ?? doc?.y, 0) + height / 2,
  };
}

function getCanvasViewRect() {
  const view =
    globalThis.canvas?.app?.view
    ?? globalThis.canvas?.app?.renderer?.view
    ?? globalThis.document?.querySelector?.("#board canvas");
  return view?.getBoundingClientRect?.() ?? null;
}

function worldToScreen(point) {
  if (!point) return null;
  const rect = getCanvasViewRect();
  const transform = globalThis.canvas?.stage?.worldTransform;
  if (!rect || !transform) return null;

  const x = point.x * num(transform.a, 1) + point.y * num(transform.c, 0) + num(transform.tx, 0);
  const y = point.x * num(transform.b, 0) + point.y * num(transform.d, 1) + num(transform.ty, 0);
  return { x: rect.left + x, y: rect.top + y };
}

function placeElementAt(element, screen, {
  offsetX = 0,
  offsetY = 0,
} = {}) {
  element.style.left = `${Math.round(screen.x + offsetX)}px`;
  element.style.top = `${Math.round(screen.y + offsetY)}px`;
}

function appendAtToken({
  token = null,
  className = "",
  text = "",
  tone = "hit",
  offsetX = 0,
  offsetY = 0,
  delayMs = 0,
  durationMs = 1400,
} = {}) {
  const layer = getLayer();
  const screen = worldToScreen(getTokenCenter(token));
  if (!layer || !screen) return null;

  const element = globalThis.document.createElement("div");
  element.className = `${className} is-${cleanTone(tone)}`;
  if (text) element.textContent = text;
  placeElementAt(element, screen, { offsetX, offsetY });

  const mount = () => {
    layer.appendChild(element);
    removeLater(element, durationMs);
  };
  if (delayMs > 0) globalThis.setTimeout?.(mount, delayMs);
  else mount();

  return element;
}

function appendAtWorld({
  point = null,
  className = "",
  text = "",
  tone = "hit",
  delayMs = 0,
  durationMs = 1400,
  size = 1,
} = {}) {
  const layer = getLayer();
  const screen = worldToScreen(point);
  if (!layer || !screen) return null;

  const element = globalThis.document.createElement("div");
  element.className = `${className} is-${cleanTone(tone)}`;
  if (text) element.textContent = text;
  element.style.setProperty("--ih-vfx-size", String(size));
  placeElementAt(element, screen);

  const mount = () => {
    layer.appendChild(element);
    removeLater(element, durationMs);
  };
  if (delayMs > 0) globalThis.setTimeout?.(mount, delayMs);
  else mount();

  return element;
}

function appendLine({ fromToken = null, toToken = null, tone = "hit", delayMs = 0 } = {}) {
  const layer = getLayer();
  const from = worldToScreen(getTokenCenter(fromToken));
  const to = worldToScreen(getTokenCenter(toToken));
  if (!layer || !from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(12, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  const element = globalThis.document.createElement("div");
  element.className = `ih-combat-vfx-line is-${cleanTone(tone)}`;
  element.style.left = `${Math.round(from.x)}px`;
  element.style.top = `${Math.round(from.y)}px`;
  element.style.width = `${Math.round(length)}px`;
  element.style.transform = `rotate(${angle}deg)`;

  const mount = () => {
    layer.appendChild(element);
    removeLater(element, 560);
  };
  if (delayMs > 0) globalThis.setTimeout?.(mount, delayMs);
  else mount();

  return element;
}

function toneFromDamageType(damageType = "") {
  const key = String(damageType ?? "").toLowerCase();
  if (["fire", "flame", "burning"].includes(key)) return "fire";
  if (["cold", "ice", "frost"].includes(key)) return "cold";
  if (["lightning", "shock", "storm"].includes(key)) return "lightning";
  if (["poison", "acid"].includes(key)) return "poison";
  if (["healing", "heal"].includes(key)) return "heal";
  if (["magical", "arcane", "void", "holy"].includes(key)) return "magic";
  return "hit";
}

function getAttackTone(result = {}) {
  if (!result?.hit) return "miss";
  if (result.targetKilled) return "kill";
  if (result.shieldBlock?.success && num(result.finalDamage, 0) <= 0) return "shield";
  if (num(result.finalDamage, 0) <= 0 && num(result.reduction, 0) > 0) return "armor";
  return toneFromDamageType(result.damageType);
}

function getAttackMainText(result = {}) {
  if (!result?.hit) return "MISS";
  const damage = num(result.finalDamage, 0);
  if (result.targetKilled && damage > 0) return `-${damage} LETHAL`;
  if (damage > 0) return `-${damage}`;
  if (result.shieldBlock?.success) return "BLOCK";
  if (num(result.reduction, 0) > 0) return "ARMOR";
  return "HIT";
}

function getAttackSecondaryCues(result = {}) {
  const cues = [];
  const shield = result.shieldBlock;
  if (shield?.success) {
    cues.push({
      text: `SHIELD -${num(shield.shieldReduction ?? shield.absorbed, 0)}`,
      tone: shield.broken ? "break" : "shield",
    });
  } else if (shield?.triggered) {
    cues.push({ text: "SHIELD FAIL", tone: "miss" });
  }

  if (num(result.armorLayer?.absorbed ?? result.reduction, 0) > 0) {
    cues.push({
      text: `ARMOR -${num(result.armorLayer?.absorbed ?? result.reduction, 0)}`,
      tone: result.armorLayer?.broken ? "break" : "armor",
    });
  }

  if (num(result.overflowDamage, 0) > 0) {
    cues.push({ text: `OVERFLOW ${num(result.overflowDamage, 0)}`, tone: "break" });
  }

  if (result.targetKilled) cues.push({ text: "DOWN", tone: "kill" });
  return cues;
}

export async function playAttackVfx({
  attacker = null,
  target = null,
  result = null,
  targetToken = null,
  label = "",
  source = "attack",
} = {}) {
  const event = result
    ? recordCombatEvent(buildAttackCombatEvent({ attacker, target, result, label, source }))
    : null;

  if (!result || !isCombatVfxEnabled()) {
    return { played: false, reason: "disabled", event };
  }

  const toToken = resolveToken({ actor: target, token: targetToken });
  if (!toToken) return { played: false, reason: "target-token-missing", event };

  const fromToken = resolveToken({ actor: attacker });
  const tone = getAttackTone(result);
  const sameToken = fromToken && tokenId(fromToken) && tokenId(fromToken) === tokenId(toToken);

  if (fromToken && !sameToken) appendLine({ fromToken, toToken, tone });

  appendAtToken({
    token: toToken,
    className: "ih-combat-vfx-impact",
    tone,
    durationMs: result.targetKilled ? 1100 : 820,
  });
  appendAtToken({
    token: toToken,
    className: "ih-combat-vfx-float",
    text: getAttackMainText(result),
    tone,
    offsetY: -22,
    durationMs: 1400,
  });

  getAttackSecondaryCues(result).forEach((cue, index) => {
    appendAtToken({
      token: toToken,
      className: "ih-combat-vfx-chip",
      text: cue.text,
      tone: cue.tone,
      offsetY: 16 + index * 17,
      delayMs: 110 + index * 80,
      durationMs: 1250,
    });
  });

  return { played: true, label, source, tone, event };
}

function averageTokenCenter(tokens = []) {
  const centers = tokens.map(getTokenCenter).filter(Boolean);
  if (!centers.length) return null;
  return {
    x: centers.reduce((sum, point) => sum + point.x, 0) / centers.length,
    y: centers.reduce((sum, point) => sum + point.y, 0) / centers.length,
  };
}

function getAoeResultTone(result = {}, {
  damageType = "",
  isUtility = false,
} = {}) {
  if (result.hit === false) return "miss";
  if (result.targetKilled) return "kill";
  if (isUtility && num(result.healed, 0) > 0) return "heal";
  if (result.ally && result.friendlyFire) return "friendly";
  if (num(result.armor, 0) > 0 && num(result.damage ?? result.finalDamage, 0) <= 0) return "armor";
  return toneFromDamageType(damageType);
}

function getAoeResultText(result = {}, { isUtility = false } = {}) {
  if (result.hit === false) return "MISS";
  if (isUtility && num(result.healed, 0) > 0) return `+${num(result.healed, 0)}`;
  if (isUtility && result.condition) return "EFFECT";
  const damage = num(result.damage ?? result.finalDamage, 0);
  if (result.targetKilled && damage > 0) return `-${damage} DOWN`;
  if (damage > 0) return `-${damage}`;
  if (num(result.armor, 0) > 0) return "ARMOR";
  return isUtility ? "EFFECT" : "HIT";
}

export async function playAoeVfx({
  attacker = null,
  results = [],
  label = "",
  damageType = "",
  aoeType = "blast",
  isUtility = false,
} = {}) {
  const event = Array.isArray(results) && results.length
    ? recordCombatEvent(buildAoeCombatEvent({
        attacker,
        results,
        label,
        damageType,
        aoeType,
        isUtility,
        source: "aoe-vfx",
      }))
    : null;

  if (!Array.isArray(results) || !results.length || !isCombatVfxEnabled()) {
    return { played: false, reason: "disabled-or-empty", event };
  }

  const targetEntries = results
    .map(result => ({
      result,
      token: resolveToken({ tokenId: result?.tokenId, actorId: result?.actorId }),
    }))
    .filter(entry => entry.token);

  const center = averageTokenCenter(targetEntries.map(entry => entry.token))
    ?? getTokenCenter(resolveToken({ actor: attacker }));
  if (center) {
    appendAtWorld({
      point: center,
      className: "ih-combat-vfx-aoe",
      tone: isUtility ? "heal" : toneFromDamageType(damageType),
      text: "",
      durationMs: 980,
      size: Math.max(1, Math.min(2.4, targetEntries.length / 3)),
    });
  }

  targetEntries.slice(0, MAX_AOE_FLOATS).forEach((entry, index) => {
    const { result, token } = entry;
    const delayMs = 90 + index * 70;
    const tone = getAoeResultTone(result, { damageType, isUtility });
    appendAtToken({
      token,
      className: "ih-combat-vfx-impact",
      tone,
      delayMs,
      durationMs: 780,
    });
    appendAtToken({
      token,
      className: "ih-combat-vfx-float",
      text: getAoeResultText(result, { isUtility }),
      tone,
      offsetY: -20,
      delayMs: delayMs + 40,
      durationMs: 1320,
    });
    if (result.ally && result.friendlyFire) {
      appendAtToken({
        token,
        className: "ih-combat-vfx-chip",
        text: "FRIENDLY FIRE",
        tone: "friendly",
        offsetY: 15,
        delayMs: delayMs + 90,
        durationMs: 1220,
      });
    }
  });

  return {
    played: true,
    label,
    aoeType,
    count: targetEntries.length,
    event,
  };
}
