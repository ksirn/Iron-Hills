/**
 * Iron Hills — AoE Attack Service
 * Управление зонами атаки через Foundry MeasuredTemplate.
 */
import {
  getTargetPartLabel,
} from "./actor-state-service.mjs";
import {
  buildCombatChatCard,
  buildSystemDialogContent,
  buildSystemDialogSelect,
} from "./combat-chat-service.mjs";
import { resolveSingleAttack } from "./combat-attack-service.mjs";
import { calculateHitChance } from "./combat-hit-context-service.mjs";
import { applyHitEffects, healActorBodyPart } from "./hit-effect-service.mjs";
import { actorsAreAllies } from "./disposition-service.mjs";
import { isHealingDamageType } from "./damage-type-service.mjs";
import { playAoeVfx } from "./combat-vfx-service.mjs";
import {
  BODY_ZONE_KEYS,
  buildAoeTargetZonePolicy,
  filterAoeTargetsByPolicy,
  findAoeActorToken,
  getAoeTargetActor,
  getAoeTargetToken,
  normalizeAoeConfig,
  resolveAoeTargetZone,
  resolveAoeTargetZoneDetails,
  wantsAlliedAoeTargets,
} from "./aoe-policy-service.mjs";
import { buildAoeChatData } from "./combat-presentation-service.mjs";

const AOE_CHAT_TEMPLATE = "systems/iron-hills-system/templates/chat/aoe.hbs";

// Конфигурация AoE типов
export const AOE_TYPES = {
  circle: {
    id: "circle", label: "Круг",   icon: "⭕",
    foundryType: "circle",
    desc: "Взрыв вокруг точки. Радиус в клетках.",
  },
  cone: {
    id: "cone",   label: "Конус",  icon: "🔺",
    foundryType: "cone",
    desc: "Конус в направлении атаки. Длина в клетках.",
  },
  ray: {
    id: "ray",    label: "Линия",  icon: "➡",
    foundryType: "ray",
    desc: "Узкая линия. Длина в клетках.",
  },
  rect: {
    id: "rect",   label: "Прямоугольник", icon: "⬛",
    foundryType: "rect",
    desc: "Прямоугольная зона.",
  },
};

const AOE_AIMABLE_ZONE_KEYS = BODY_ZONE_KEYS.filter(key => key !== "shield");

function notifyAoeInfo(message) {
  globalThis.ui?.notifications?.info?.(message);
}

function getSafeMathRandom() {
  return Math.random();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isHarmfulAoeEffect({ damageType = "physical", effect = null, baseDamage = 0 } = {}) {
  if (isHealingDamageType(damageType) || wantsAlliedAoeTargets(effect)) return false;
  if (effect?.special === "heal") return false;
  if (effect?.applyCondition) return true;
  return toNumber(baseDamage, 0) > 0;
}

function resolveAoeApplicationPolicy({
  damageType = "physical",
  effect = null,
  baseDamage = 0,
  applyInjuries = null,
  wearArmor = false,
  shieldIntercept = null,
} = {}) {
  const harmful = isHarmfulAoeEffect({ damageType, effect, baseDamage });
  return {
    harmful,
    applyInjuries: Boolean(applyInjuries ?? harmful),
    wearArmor: Boolean(wearArmor),
    shieldIntercept: Boolean(shieldIntercept ?? false),
  };
}

export function createAoeSummary({
  results = [],
  totalTargets = 0,
  candidates = 0,
  selectedTargets = 0,
  alliesSpared = 0,
  friendlyFire = false,
  friendlyFireMode = "off",
  targetPolicy = "enemies",
  targetZoneMode = "random",
  targetZone = null,
  aoeType = "blast",
} = {}) {
  const hits = results.filter(result => result.hit !== false);
  const misses = results.filter(result => result.hit === false);
  const allyResults = results.filter(result => result.ally);
  const enemyResults = results.filter(result => !result.ally);
  const allyHits = hits.filter(result => result.ally);
  const enemyHits = hits.filter(result => !result.ally);
  const killCount = results.filter(result => result.targetKilled).length;
  const damageTotal = results.reduce((sum, result) => sum + toNumber(result.damage ?? result.finalDamage, 0), 0);
  const healingTotal = results.reduce((sum, result) => sum + toNumber(result.healed, 0), 0);
  const amountTotal = results.reduce((sum, result) => sum + toNumber(result.amount, 0), 0);
  const conditionCount = results.filter(result => result.condition).length;
  const zoneKeys = [...new Set(results.map(result => result.zoneKey).filter(Boolean))];
  const hitZoneKeys = [...new Set(hits.map(result => result.zoneKey).filter(Boolean))];
  return {
    totalTargets,
    candidates,
    selectedTargets,
    resultCount: results.length,
    hitCount: hits.length,
    missCount: misses.length,
    enemyCount: enemyResults.length,
    allyCount: allyResults.length,
    enemiesHit: enemyHits.length,
    alliesHit: allyHits.length,
    alliesSpared,
    skippedByPolicy: alliesSpared,
    damageTotal,
    healingTotal,
    amountTotal,
    conditionCount,
    killCount,
    zoneKeys,
    hitZoneKeys,
    friendlyFire,
    friendlyFireMode,
    friendlyFireRisk: Boolean(friendlyFire && allyResults.length > 0),
    friendlyFireHit: allyHits.length > 0,
    targetPolicy,
    targetZoneMode,
    targetZone,
    targetZoneLabel: targetZone ? getTargetPartLabel(targetZone) : "",
    aoeType,
    resultClass: allyHits.length > 0
      ? "is-friendly-fire"
      : killCount > 0
        ? "is-lethal"
        : damageTotal > 0
          ? "is-damage"
          : healingTotal > 0
            ? "is-healing"
            : hits.length > 0
              ? "is-effect"
              : "is-empty",
  };
}

export function attachAoeSummary(results, summary = {}) {
  if (!Array.isArray(results)) return results;
  Object.defineProperty(results, "summary", {
    value: summary,
    configurable: true,
    enumerable: false,
    writable: true,
  });
  return results;
}

export function getAoeResultSummary(results) {
  return Array.isArray(results) ? (results.summary ?? createAoeSummary({ results })) : {};
}

export function createAoeOutcome({
  ok = true,
  cancelled = false,
  template = null,
  targets = [],
  results = [],
  reason = "",
  summary = null,
} = {}) {
  const resolvedSummary = summary ?? getAoeResultSummary(results);
  return {
    ok,
    cancelled,
    template,
    targets,
    results,
    summary: resolvedSummary,
    reason,
  };
}

function buildAoeZoneOptions() {
  return AOE_AIMABLE_ZONE_KEYS.map(key => ({
    value: key,
    label: getTargetPartLabel(key),
  }));
}

async function promptAoeTargetZone({
  label = "AoE",
  defaultZone = "torso",
} = {}) {
  if (!globalThis.Dialog) return defaultZone;

  return new Promise(resolve => {
    const dialog = new Dialog({
      title: `${label}: зона поражения`,
      content: buildSystemDialogContent({
        className: "ih-aoe-zone-dialog",
        headline: label,
        headlineMeta: "зона поражения",
        status: "Выберите зону",
        rows: [
          ["Режим", "прицельная зона"],
        ],
        formHtml: buildSystemDialogSelect({
          name: "targetZone",
          label: "Зона поражения",
          options: buildAoeZoneOptions(),
          selectedValue: defaultZone,
        }),
      }),
      buttons: {
        ok: {
          label: "Выбрать",
          callback: html => resolve(html.find?.('[name="targetZone"]')?.val?.() ?? defaultZone),
        },
        cancel: {
          label: "Отмена",
          callback: () => resolve(null),
        },
      },
      default: "ok",
      close: () => resolve(null),
    });

    dialog.render(true);
  });
}

async function resolveRuntimeAoeConfig({
  config,
  effect = null,
  label = "AoE",
} = {}) {
  const zonePolicy = buildAoeTargetZonePolicy({
    targetZone: config.targetZone,
    effect,
    aoe: config,
    mode: config.targetZoneMode,
  });

  if (!zonePolicy.requiresChoice) {
    return { ok: true, config, zonePolicy };
  }

  const chosenZone = await promptAoeTargetZone({
    label,
    defaultZone: zonePolicy.zone ?? "torso",
  });

  if (!chosenZone) {
    return { ok: false, cancelled: true, config, zonePolicy };
  }

  const resolvedConfig = {
    ...config,
    targetZone: chosenZone,
    targetZoneMode: "fixed",
  };

  return {
    ok: true,
    config: resolvedConfig,
    zonePolicy: buildAoeTargetZonePolicy({
      targetZone: chosenZone,
      effect,
      aoe: resolvedConfig,
      mode: resolvedConfig.targetZoneMode,
    }),
  };
}


export async function applyAoeUtilityTemplate({
  caster = null,
  attacker = caster,
  shape = "circle",
  distance = 1,
  label = "AoE effect",
  color = "#8888ff",
  skillKey = "magic",
  attackMode = null,
  weapon = null,
  hitBonus = 0,
  skillValueFallback = null,
  injuries = null,
  effect = null,
  power = 0,
  aoeType = "blast",
  maxTargets = null,
  chainDecay = 1,
  targetZone = null,
  targetZoneMode = null,
  friendlyFire = false,
  friendlyFireMode = null,
  createChat = true,
  onTemplatePlaced = null,
  rng = getSafeMathRandom,
  cleanupDelay = 3000,
} = {}) {
  const config = normalizeAoeConfig({
    shape,
    distance,
    type: aoeType,
    maxTargets,
    chainDecay,
    friendlyFireMode: friendlyFireMode ?? friendlyFire,
    friendlyFire,
    effect,
    damageType: wantsAlliedAoeTargets(effect) ? "healing" : "magical",
    targetZone,
    targetZoneMode,
  }, {
    shape: "circle",
    distance: 1,
    type: "blast",
    chainDecay: 1,
    friendlyFire: false,
  });
  const runtime = await resolveRuntimeAoeConfig({ config, effect, label });
  if (!runtime.ok) {
    return createAoeOutcome({
      ok: false,
      cancelled: true,
      reason: "target-zone-cancelled",
      results: attachAoeSummary([], createAoeSummary({ aoeType: config.type })),
    });
  }
  const resolvedConfig = runtime.config;

  const templateResult = await placeAoeTemplate({
    aoeType: resolvedConfig.shape,
    distance: resolvedConfig.distance,
    label,
    color,
    attacker,
    skillKey,
    attackMode,
    weapon,
    hitBonus,
    skillValueFallback,
    injuries,
    friendlyFire: resolvedConfig.friendlyFire,
  });

  if (!templateResult) {
    return createAoeOutcome({
      ok: false,
      cancelled: true,
      reason: "template-cancelled",
      results: attachAoeSummary([], createAoeSummary({ aoeType: resolvedConfig.type })),
    });
  }

  const { template, targets } = templateResult;

  try {
    await onTemplatePlaced?.(templateResult);
    const results = await applyAoeUtilityEffect({
      attacker,
      targets,
      effect,
      power,
      label,
      aoeType: resolvedConfig.type,
      maxTargets: resolvedConfig.maxTargets,
      chainDecay: resolvedConfig.chainDecay,
      targetZone: resolvedConfig.targetZone,
      targetZoneMode: resolvedConfig.targetZoneMode,
      friendlyFire: resolvedConfig.friendlyFire,
      friendlyFireMode: resolvedConfig.friendlyFireMode,
      createChat,
      rng,
    });

    return createAoeOutcome({ template, targets, results });
  } finally {
    await removeAoeTemplate(template, cleanupDelay);
  }
}

/**
 * Рассчитать шанс попадания атакующего по цели.
 * Использует канонический getAttackThreshold (тот же путь, что и _performAttack).
 * @returns {{ pct:number, color:string, threshold:number, dieSize:number }}
 */
export function calcHitChance(attacker, target, skillKey = "unarmed", hitBonus = 0, skillValueFallback = null, {
  attackMode = null,
  weapon = null,
  targetToken = null,
  surroundCount = 0,
  encumbrance = null,
  injuries = null,
} = {}) {
  const chance = calculateHitChance(attacker, target, {
    skillKey,
    hitBonus,
    skillValueFallback,
    attackMode,
    weapon,
    surroundCount,
    targetToken,
    encumbrance,
    injuries,
  });

  // Эффективный порог с учётом hitBonus атакующего: чем выше бонус, тем легче попасть
  const effectiveThreshold = chance.threshold;

  // Шанс попадания на d{dieSize}: P(roll >= effectiveThreshold)
  const pct = chance.pct;

  const color = chance.color;

  return { ...chance, pct, color, threshold: effectiveThreshold, dieSize: chance.dieSize };
}

/**
 * Показать плашки шанса попадания над токенами в зоне
 */
export function showHitChanceOverlays(tokens, attacker, skillKey, hitBonus = 0, {
  attackMode = null,
  weapon = null,
  friendlyFire = false,
  skillValueFallback = null,
  encumbrance = null,
  injuries = null,
} = {}) {
  removeHitChanceOverlays();

  for (const token of tokens) {
    const actor = token.actor ?? token;
    if (!actor || actor.id === attacker?.id) continue;

    const isAlly = actorsAreAllies(attacker, actor);
    const willBeHit = friendlyFire || !isAlly;

    const container = new PIXI.Container();
    container.name  = "ih-hit-chance-overlay";

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.75);
    bg.drawRoundedRect(0, 0, 56, 22, 5);
    bg.endFill();
    container.addChild(bg);

    let label, fillColor;
    if (!willBeHit) {
      label     = `🛡 союзник`;
      fillColor = "#7d9aff";
    } else {
      const chance = calcHitChance(attacker, actor, skillKey, hitBonus, skillValueFallback, {
        attackMode,
        weapon,
        targetToken: token,
        encumbrance,
        injuries,
      });
      label     = `🎯 ${chance.pct}%`;
      fillColor = chance.color;
    }

    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize:   willBeHit ? 13 : 11,
      fontWeight: "bold",
      fill:       fillColor,
    });
    const text = new PIXI.Text(label, style);
    text.x = 4; text.y = 3;
    container.addChild(text);

    const tokenObj = canvas.tokens?.placeables?.find(t => t.actor?.id === actor.id) ?? token;
    if (tokenObj.x !== undefined) {
      container.x = tokenObj.x + (tokenObj.w ?? 100) / 2 - 28;
      container.y = tokenObj.y - 28;
    }

    canvas.interface?.addChild?.(container)
      ?? canvas.tokens?.addChild?.(container);
  }
}

/**
 * Убрать плашки шанса попадания
 */
export function removeHitChanceOverlays() {
  const layer = canvas.interface ?? canvas.tokens;
  if (!layer) return;
  const toRemove = [];
  layer.children?.forEach(child => {
    if (child.name === "ih-hit-chance-overlay") toRemove.push(child);
  });
  toRemove.forEach(c => c.destroy());
}

/**
 * Разместить MeasuredTemplate на сцене и вернуть список попавших токенов.
 * GM кликает куда поставить, игрок видит зону.
 */
export async function placeAoeTemplate({ aoeType, distance, label, color = "#ff4444", attacker = null, skillKey = "unarmed", attackMode = null, weapon = null, hitBonus = 0, skillValueFallback = null, injuries = null, friendlyFire = null }) {
  if (!globalThis.canvas?.scene) return null;

  const config = normalizeAoeConfig({
    shape: aoeType,
    distance,
    friendlyFire,
  }, {
    shape: "circle",
    distance: 1,
    friendlyFire: false,
  });

  // Создаём шаблон
  const templateData = {
    t:         config.shape,
    distance:  config.distance,
    width:     config.shape === "ray" ? 1 : undefined,
    angle:     config.shape === "cone" ? 90 : undefined,
    x:         canvas.stage?.pivot?.x ?? 0,
    y:         canvas.stage?.pivot?.y ?? 0,
    fillColor: color,
    flags:     { "iron-hills-system": { aoeLabel: label } },
  };

  // Запускаем стандартный Foundry preview (drag to place)
  const template = new CONFIG.MeasuredTemplate.objectClass(
    new CONFIG.MeasuredTemplate.documentClass(templateData, { parent: canvas.scene })
  );

  // Интервал обновления оверлеев при движении шаблона
  let overlayInterval = null;
  let lastX = -1, lastY = -1;

  return new Promise(resolve => {
    let settled = false;
    let hookId = null;
    let escListener = null;

    const finish = (value) => {
      if (settled) return;
      settled = true;
      if (overlayInterval) clearInterval(overlayInterval);
      removeHitChanceOverlays();
      if (hookId) Hooks.off("createMeasuredTemplate", hookId);
      if (escListener) document.removeEventListener("keydown", escListener);
      resolve(value);
    };

    template.drawPreview();

    // Обновляем оверлеи каждые 100мс пока шаблон двигается
    overlayInterval = setInterval(() => {
      const pos = template.document ?? template;
      if (pos.x !== lastX || pos.y !== lastY) {
        lastX = pos.x; lastY = pos.y;
        const inZone = getTokensInPreviewTemplate(template);
        if (attacker && inZone.length) {
          showHitChanceOverlays(inZone, attacker, skillKey, hitBonus, { attackMode, weapon, friendlyFire: config.friendlyFire, skillValueFallback, injuries });
        } else {
          removeHitChanceOverlays();
        }
      }
    }, 100);

    hookId = Hooks.once("createMeasuredTemplate", async (doc) => {
      await new Promise(r => setTimeout(r, 100));
      const targets = getTargetEntriesInTemplate(doc);
      finish({ template: doc, targets });
    });

    escListener = (e) => {
      if (e.key === "Escape") {
        finish(null);
      }
    };
    document.addEventListener("keydown", escListener);
  });
}

/**
 * Получить токены в preview шаблоне (до его размещения)
 */
function degreesToRadians(degrees) {
  return Number(degrees ?? 0) * (Math.PI / 180);
}

function getTokenCenter(token) {
  if (!token) return { x: 0, y: 0 };
  const gridSize = canvas?.grid?.size ?? 100;
  const width = Number(token.w ?? gridSize);
  const height = Number(token.h ?? gridSize);
  return {
    x: Number(token.x ?? 0) + width / 2,
    y: Number(token.y ?? 0) + height / 2,
  };
}

function getTemplateOrigin(templateDoc, template) {
  return {
    x: Number(templateDoc?.x ?? template?.document?.x ?? template?.x ?? 0),
    y: Number(templateDoc?.y ?? template?.document?.y ?? template?.y ?? 0),
  };
}

function getTemplateDirectionVector(templateDoc, template) {
  const direction = Number(templateDoc?.direction ?? template?.document?.direction ?? template?.direction ?? 0);
  const radians = degreesToRadians(direction);
  return {
    x: Math.cos(radians),
    y: Math.sin(radians),
  };
}

function buildAoeTargetEntry(token, templateDoc, template) {
  const actor = token?.actor ?? null;
  const center = getTokenCenter(token);
  const origin = getTemplateOrigin(templateDoc, template);
  const direction = getTemplateDirectionVector(templateDoc, template);
  const dx = center.x - origin.x;
  const dy = center.y - origin.y;

  return {
    actor,
    token,
    _ihAoe: {
      centerX: center.x,
      centerY: center.y,
      distanceFromOrigin: Math.hypot(dx, dy),
      projectionFromOrigin: dx * direction.x + dy * direction.y,
      sideFromOrigin: dx * -direction.y + dy * direction.x,
    },
  };
}

function getAoeMetric(target, key, fallback = 0) {
  const value = Number(target?._ihAoe?.[key]);
  return Number.isFinite(value) ? value : fallback;
}

function getTargetDistanceToActor(target, actor) {
  const token = getAoeTargetToken(target);
  const actorToken = findAoeActorToken(actor);
  if (!token || !actorToken) return 0;
  const a = getTokenCenter(token);
  const b = getTokenCenter(actorToken);
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getTokensInPreviewTemplate(templateObj) {
  if (!canvas?.tokens?.placeables) return [];
  try {
    return canvas.tokens.placeables.filter(token => {
      const cx = token.x + (token.w ?? 100) / 2;
      const cy = token.y + (token.h ?? 100) / 2;
      return templateObj.shape?.contains?.(cx - templateObj.x, cy - templateObj.y) ?? false;
    }).map(t => t);
  } catch { return []; }
}

/**
 * Найти все токены внутри MeasuredTemplate
 */
function getTargetEntriesInTemplate(templateDoc) {
  if (!canvas?.tokens?.placeables) return [];

  const template = canvas.templates?.placeables?.find(t => t.id === templateDoc.id);
  if (!template) return [];

  return canvas.tokens.placeables.filter(token => {
    // Проверяем центр токена
    const cx = token.x + (token.w ?? token.width ?? 100) / 2;
    const cy = token.y + (token.h ?? token.height ?? 100) / 2;
    return template.shape?.contains?.(
      cx - template.x,
      cy - template.y
    ) ?? false;
  }).map(token => buildAoeTargetEntry(token, templateDoc, template)).filter(entry => entry.actor);
}

export function getTokensInTemplate(templateDoc) {
  return getTargetEntriesInTemplate(templateDoc).map(entry => entry.actor).filter(Boolean);
}

/**
 * Удалить шаблон AoE через N секунд (или сразу)
 */
export async function removeAoeTemplate(templateDoc, delayMs = 3000) {
  if (!templateDoc) return;
  setTimeout(async () => {
    await templateDoc.delete().catch(() => {});
  }, delayMs);
}

export async function applyAoeDamageTemplate({
  attacker = null,
  shape = "circle",
  distance = 1,
  label = "AoE атака",
  color = "#ff4444",
  skillKey = "unarmed",
  attackMode = null,
  weapon = null,
  hitBonus = 0,
  skillValueFallback = null,
  injuries = null,
  friendlyFire = null,
  friendlyFireMode = null,
  baseDamage = 0,
  damageType = "physical",
  ignoreArmor = 0,
  aoeType = "blast",
  maxTargets = null,
  chainDecay = 1,
  targetZone = null,
  targetZoneMode = null,
  effect = null,
  onLethal = null,
  onTemplatePlaced = null,
  dieRoller = null,
  applyInjuries = null,
  wearArmor = false,
  shieldIntercept = null,
  createChat = true,
  rng = getSafeMathRandom,
  cleanupDelay = 3000,
} = {}) {
  const config = normalizeAoeConfig({
    shape,
    distance,
    type: aoeType,
    maxTargets,
    chainDecay,
    friendlyFireMode: friendlyFireMode ?? friendlyFire,
    friendlyFire,
    damageType,
    effect,
    targetZone,
    targetZoneMode,
  }, {
    shape: "circle",
    distance: 1,
    type: "blast",
    chainDecay: 1,
    friendlyFire: false,
  });
  const runtime = await resolveRuntimeAoeConfig({ config, effect, label });
  if (!runtime.ok) {
    return createAoeOutcome({
      ok: false,
      cancelled: true,
      reason: "target-zone-cancelled",
      results: attachAoeSummary([], createAoeSummary({ aoeType: config.type })),
    });
  }
  const resolvedConfig = runtime.config;

  const templateResult = await placeAoeTemplate({
    aoeType: resolvedConfig.shape,
    distance: resolvedConfig.distance,
    label,
    color,
    attacker,
    skillKey,
    attackMode,
    weapon,
    hitBonus,
    skillValueFallback,
    injuries,
    friendlyFire: resolvedConfig.friendlyFire,
  });

  if (!templateResult) {
    return createAoeOutcome({
      ok: false,
      cancelled: true,
      reason: "template-cancelled",
      results: attachAoeSummary([], createAoeSummary({ aoeType: resolvedConfig.type })),
    });
  }

  const { template, targets } = templateResult;
  const applicationPolicy = resolveAoeApplicationPolicy({
    damageType,
    effect,
    baseDamage,
    applyInjuries,
    wearArmor,
    shieldIntercept,
  });

  try {
    await onTemplatePlaced?.(templateResult);
    const results = await applyAoeDamage({
      attacker,
      targets,
      baseDamage,
      skillKey,
      attackMode,
      weapon,
      damageType,
      ignoreArmor,
      label,
      aoeType: resolvedConfig.type,
      maxTargets: resolvedConfig.maxTargets,
      chainDecay: resolvedConfig.chainDecay,
      hitBonus,
      skillValueFallback,
      injuries,
      targetZone: resolvedConfig.targetZone,
      targetZoneMode: resolvedConfig.targetZoneMode,
      effect,
      onLethal,
      dieRoller,
      applyInjuries: applicationPolicy.applyInjuries,
      wearArmor: applicationPolicy.wearArmor,
      shieldIntercept: applicationPolicy.shieldIntercept,
      createChat,
      rng,
      friendlyFire: resolvedConfig.friendlyFire,
      aoeConfig: resolvedConfig,
    });
    return createAoeOutcome({ template, targets, results });
  } finally {
    await removeAoeTemplate(template, cleanupDelay);
  }
}

/**
 * Отфильтровать цели по типу AoE
 */
export function filterTargetsByAoeType(targets, aoeType, maxTargets, attacker, {
  excludeAttacker = true,
  rng = getSafeMathRandom,
} = {}) {
  const config = normalizeAoeConfig({ type: aoeType, maxTargets }, { type: "blast" });
  // Убираем самого атакующего (для nova)
  let filtered = targets.filter(t => {
    const actor = getAoeTargetActor(t);
    return actor && (!excludeAttacker || actor.id !== attacker?.id);
  });

  switch (config.type) {
    case "blast":
    case "nova":
      // Все в зоне (до maxTargets)
      break;
    case "pierce":
      // Только первая цель — ближайшая к атакующему
      filtered.sort((a, b) => {
        const ap = getAoeMetric(a, "projectionFromOrigin", getTargetDistanceToActor(a, attacker));
        const bp = getAoeMetric(b, "projectionFromOrigin", getTargetDistanceToActor(b, attacker));
        if (ap !== bp) return ap - bp;
        return getAoeMetric(a, "distanceFromOrigin", 0) - getAoeMetric(b, "distanceFromOrigin", 0);
      });
      filtered = filtered.slice(0, config.maxTargets ?? 1);
      break;
    case "sweep":
      // Слева направо — сортируем по X, берём maxTargets
      filtered.sort((a, b) => {
        const as = getAoeMetric(a, "sideFromOrigin", getTokenCenter(getAoeTargetToken(a)).x);
        const bs = getAoeMetric(b, "sideFromOrigin", getTokenCenter(getAoeTargetToken(b)).x);
        if (as !== bs) return as - bs;
        return getAoeMetric(a, "distanceFromOrigin", getTargetDistanceToActor(a, attacker))
          - getAoeMetric(b, "distanceFromOrigin", getTargetDistanceToActor(b, attacker));
      });
      break;
    case "shards":
      // Случайные N из зоны — тасуем
      filtered = filtered
        .map((target, index) => ({ target, index, roll: Number(rng?.() ?? Math.random()) }))
        .sort((a, b) => (a.roll - b.roll) || (a.index - b.index))
        .map(entry => entry.target);
      break;
    case "chain":
      // Ближайшие N к атакующему по цепочке
      filtered.sort((a, b) => getTargetDistanceToActor(a, attacker) - getTargetDistanceToActor(b, attacker));
      break;
  }

  if (Number(config.maxTargets) > 0) filtered = filtered.slice(0, Number(config.maxTargets));
  return filtered;
}

/**
 * Применить AoE урон — бросок на каждую цель отдельно.
 *
 * @param {object} args
 * @param {Actor}   args.attacker
 * @param {Actor[]} args.targets
 * @param {number}  args.baseDamage
 * @param {string}  args.skillKey
 * @param {string}  [args.damageType]
 * @param {number}  [args.ignoreArmor]
 * @param {string}  [args.label]
 * @param {string}  [args.aoeType]
 * @param {number|null} [args.maxTargets]
 * @param {number}  [args.chainDecay]
 * @param {number}  [args.hitBonus]
 * @param {number|null} [args.skillValueFallback]
 * @param {object|null} [args.effect]
 * @param {boolean} [args.friendlyFire=false] — если false, союзники атакующего
 *   (по token disposition) исключаются из списка целей. Если true — задеваются все.
 */
export async function applyAoeDamage({ attacker, targets, baseDamage, skillKey,
    damageType = "physical", ignoreArmor = 0, label = "AoE атака",
    aoeType = "blast", maxTargets = null, chainDecay = 1.0,
    attackMode = null, weapon = null,
    hitBonus = 0, skillValueFallback = null, targetZone = null, targetZoneMode = null,
    injuries = null, effect = null, onLethal = null, dieRoller = null,
    applyInjuries = null, wearArmor = false, shieldIntercept = null,
    createChat = true, rng = getSafeMathRandom,
    friendlyFire = false, friendlyFireMode = null,
    aoeConfig: aoeConfigInput = null }) {

  if (!targets?.length) {
    notifyAoeInfo("Никто не попал в зону атаки");
    return attachAoeSummary([], createAoeSummary({ aoeType }));
  }

  const aoeConfig = aoeConfigInput ?? normalizeAoeConfig({
    type: aoeType,
    maxTargets,
    chainDecay,
    friendlyFireMode: friendlyFireMode ?? friendlyFire,
    friendlyFire,
    damageType,
    effect,
    targetZone,
    targetZoneMode,
  }, {
    type: "blast",
    chainDecay: 1,
  });
  const runtime = await resolveRuntimeAoeConfig({ config: aoeConfig, effect, label });
  if (!runtime.ok) return attachAoeSummary([], createAoeSummary({ aoeType }));
  const resolvedAoeConfig = runtime.config;
  const applicationPolicy = resolveAoeApplicationPolicy({
    damageType,
    effect,
    baseDamage,
    applyInjuries,
    wearArmor,
    shieldIntercept,
  });

  // Фильтр «свои/чужие»
  const policyResult = filterAoeTargetsByPolicy(targets, {
    attacker,
    friendlyFire: resolvedAoeConfig.friendlyFire,
    effect,
    purpose: "damage",
  });
  const candidates = policyResult.targets;
  const alliesSpared = policyResult.skipped;

  // Фильтруем по типу AoE (slice/sort/exclude самого атакующего для nova и др.)
  const filtered = filterTargetsByAoeType(candidates, resolvedAoeConfig.type, resolvedAoeConfig.maxTargets, attacker, {
    rng,
  });
  if (!filtered.length) {
    if (alliesSpared > 0) {
      notifyAoeInfo(`Под зону попали только союзники (${alliesSpared}) — атака не применена.`);
    } else {
      notifyAoeInfo("Цели не попали под атаку");
    }
    return attachAoeSummary([], createAoeSummary({
      totalTargets: targets.length,
      candidates: candidates.length,
      selectedTargets: 0,
      alliesSpared: resolvedAoeConfig.friendlyFire ? 0 : alliesSpared,
      friendlyFire: resolvedAoeConfig.friendlyFire,
      friendlyFireMode: resolvedAoeConfig.friendlyFireMode,
      targetPolicy: policyResult.policy,
      targetZoneMode: runtime.zonePolicy?.mode,
      targetZone: runtime.zonePolicy?.zone,
      aoeType: resolvedAoeConfig.type,
    }));
  }

  const results = [];
  let curDmg    = baseDamage;

  const zonePolicy = runtime.zonePolicy;

  for (let index = 0; index < filtered.length; index++) {
    const targetRef = filtered[index];
    const target = getAoeTargetActor(targetRef);
    if (!target) continue;
    const targetToken = getAoeTargetToken(targetRef);
    const zoneDetails = resolveAoeTargetZoneDetails(zonePolicy, targetRef);
    const resolvedTargetZone = zoneDetails.zone;

    // Resolve each AoE target as a separate single-target attack. Energy and weapon
    // wear stay outside this step; injuries, armor wear, shields and dice are caller policy.
    const result = await resolveSingleAttack({
      attacker,
      target,
      skillKey,
      baseDamage:    Math.round(curDmg),
      damageType,
      energyCost:    0,
      weapon,
      attackMode,
      hitBonus,
      ignoreArmor,
      injuries,
      skillValueFallback,
      targetZone:    resolvedTargetZone,
      surroundCount: 0,
      targetToken,
      spendEnergy:   false,
      wearWeapon:    false,
      wearArmor: applicationPolicy.wearArmor,
      applyInjuries: applicationPolicy.applyInjuries,
      shieldIntercept: applicationPolicy.shieldIntercept,
      dieRoller: dieRoller ?? undefined,
      onLethal,
    });
    if (!result) continue;

    const hitEffects = await applyHitEffects({
      attacker,
      target,
      result,
      effect,
    });

    results.push({
      index,
      actorId:   target.id,
      actorUuid: target.uuid,
      tokenId:   targetToken?.id ?? targetToken?.document?.id ?? null,
      name:      target.name,
      ally:      attacker ? actorsAreAllies(attacker, target) : false,
      targetPolicy: policyResult.policy,
      friendlyFire: resolvedAoeConfig.friendlyFire,
      friendlyFireMode: resolvedAoeConfig.friendlyFireMode,
      aoeType:   resolvedAoeConfig.type,
      hit:       result.hit,
      roll:      result.effectiveRoll,
      rollTotal: result.rollTotal,
      dieSize:   result.dieSize,
      threshold: result.threshold,
      margin:    result.margin,
      rawDamage: result.rawDamage,
      finalDamage: result.finalDamage,
      zone:      result.locationLabel,
      zoneKey:   result.locationKey,
      zoneMode:  zonePolicy.mode,
      zoneSource: zoneDetails.source,
      damage:    result.finalDamage,
      armor:     result.reduction,
      hitContext: result.hitContext ?? null,
      defenseContext: result.defenseContext ?? null,
      metrics: {
        distanceFromOrigin: getAoeMetric(targetRef, "distanceFromOrigin", null),
        projectionFromOrigin: getAoeMetric(targetRef, "projectionFromOrigin", null),
        sideFromOrigin: getAoeMetric(targetRef, "sideFromOrigin", null),
      },
      targetKilled: Boolean(result.targetKilled),
      condition:  hitEffects.condition,
      conditionDetails: hitEffects.conditionDetails ?? [],
      effectLines: hitEffects.lines ?? [],
    });

    if (resolvedAoeConfig.type === "chain") curDmg *= (resolvedAoeConfig.chainDecay ?? 0.8);
  }

  const summary = createAoeSummary({
    results,
    totalTargets: targets.length,
    candidates: candidates.length,
    selectedTargets: filtered.length,
    alliesSpared: resolvedAoeConfig.friendlyFire ? 0 : alliesSpared,
    friendlyFire: resolvedAoeConfig.friendlyFire,
    friendlyFireMode: resolvedAoeConfig.friendlyFireMode,
    targetPolicy: policyResult.policy,
    targetZoneMode: zonePolicy.mode,
    targetZone: zonePolicy.zone,
    aoeType: resolvedAoeConfig.type,
  });
  attachAoeSummary(results, summary);
  await playAoeVfx({
    attacker,
    results,
    label,
    damageType,
    aoeType: resolvedAoeConfig.type,
    isUtility: false,
  });

  if (createChat && globalThis.ChatMessage?.create && typeof globalThis.renderTemplate === "function") {
    const content = await renderTemplate(AOE_CHAT_TEMPLATE, buildAoeChatData({
      label,
      results,
      summary,
      aoeConfig: resolvedAoeConfig,
      zonePolicy,
      damageType,
      baseDamage,
      isUtility: false,
    }));

    await ChatMessage.create({
      speaker: attacker ? ChatMessage.getSpeaker({ actor: attacker }) : undefined,
      content,
    });
  }

  return results;
}

function getAoeUtilityAmount(effect, power) {
  return Number(effect?.healAmount ?? effect?.power ?? power ?? 0);
}

export async function applyAoeUtilityEffect({
  attacker,
  targets,
  effect = null,
  power = 0,
  label = "AoE эффект",
  aoeType = "blast",
  maxTargets = null,
  chainDecay = 1.0,
  targetZone = null,
  targetZoneMode = null,
  friendlyFire = false,
  friendlyFireMode = null,
  createChat = true,
  rng = getSafeMathRandom,
} = {}) {
  if (!targets?.length) {
    notifyAoeInfo("Никто не попал в зону эффекта");
    return attachAoeSummary([], createAoeSummary({ aoeType }));
  }

  const aoeConfig = normalizeAoeConfig({
    type: aoeType,
    maxTargets,
    chainDecay,
    friendlyFireMode: friendlyFireMode ?? friendlyFire,
    friendlyFire,
    effect,
    damageType: wantsAlliedAoeTargets(effect) ? "healing" : "magical",
    targetZone,
    targetZoneMode,
  }, {
    type: "blast",
    chainDecay: 1,
  });
  const runtime = await resolveRuntimeAoeConfig({ config: aoeConfig, effect, label });
  if (!runtime.ok) return attachAoeSummary([], createAoeSummary({ aoeType }));
  const resolvedAoeConfig = runtime.config;
  const zonePolicy = runtime.zonePolicy;
  const wantsAllies = wantsAlliedAoeTargets(effect);
  const policyResult = filterAoeTargetsByPolicy(targets, {
    attacker,
    friendlyFire: resolvedAoeConfig.friendlyFire,
    effect,
    purpose: "utility",
  });
  const candidates = policyResult.targets;
  const spared = policyResult.skipped;

  const filtered = filterTargetsByAoeType(candidates, resolvedAoeConfig.type, resolvedAoeConfig.maxTargets, attacker, {
    excludeAttacker: !wantsAllies,
    rng,
  });

  if (!filtered.length) {
    notifyAoeInfo("Цели не попали под эффект");
    return attachAoeSummary([], createAoeSummary({
      totalTargets: targets.length,
      candidates: candidates.length,
      selectedTargets: 0,
      alliesSpared: resolvedAoeConfig.friendlyFire ? 0 : spared,
      friendlyFire: resolvedAoeConfig.friendlyFire,
      friendlyFireMode: resolvedAoeConfig.friendlyFireMode,
      targetPolicy: policyResult.policy,
      targetZoneMode: zonePolicy?.mode,
      targetZone: zonePolicy?.zone,
      aoeType: resolvedAoeConfig.type,
    }));
  }

  const baseAmount = getAoeUtilityAmount(effect, power);
  const results = [];
  let currentAmount = baseAmount;

  for (let index = 0; index < filtered.length; index++) {
    const targetRef = filtered[index];
    const target = getAoeTargetActor(targetRef);
    if (!target) continue;
    const targetToken = getAoeTargetToken(targetRef);
    const zoneDetails = resolveAoeTargetZoneDetails(zonePolicy, targetRef);
    const resolvedTargetZone =
      zoneDetails.zone
      ?? resolveAoeTargetZone(targetZone, effect?.targetZone, effect?.targetPart)
      ?? "torso";

    let line = "";
    let amount = Math.max(0, Math.round(currentAmount));
    let condition = null;
    let healed = 0;

    if (effect?.special === "heal") {
      const healResult = await healActorBodyPart(target, resolvedTargetZone, amount);
      healed = healResult.healed;
      line = `лечение +${healed} HP (${getTargetPartLabel(healResult.locationKey)})`;
    } else if (effect?.applyCondition) {
      const hitEffects = await applyHitEffects({
        attacker,
        target,
        result: { hit: true, finalDamage: 0 },
        effect,
      });
      condition = hitEffects.condition;
      line = condition ? condition : "эффект не сработал";
    } else {
      line = "нет настроенного эффекта";
    }

    results.push({
      index,
      actorId: target.id,
      actorUuid: target.uuid,
      tokenId: targetToken?.id ?? targetToken?.document?.id ?? null,
      name: target.name,
      ally: attacker ? actorsAreAllies(attacker, target) : false,
      targetPolicy: policyResult.policy,
      friendlyFire: resolvedAoeConfig.friendlyFire,
      friendlyFireMode: resolvedAoeConfig.friendlyFireMode,
      aoeType: resolvedAoeConfig.type,
      hit: true,
      zone: getTargetPartLabel(resolvedTargetZone),
      zoneKey: resolvedTargetZone,
      zoneMode: zonePolicy?.mode ?? "random",
      zoneSource: zoneDetails.source,
      amount,
      healed,
      condition,
      line,
      metrics: {
        distanceFromOrigin: getAoeMetric(targetRef, "distanceFromOrigin", null),
        projectionFromOrigin: getAoeMetric(targetRef, "projectionFromOrigin", null),
        sideFromOrigin: getAoeMetric(targetRef, "sideFromOrigin", null),
      },
    });

    if (resolvedAoeConfig.type === "chain") currentAmount *= (resolvedAoeConfig.chainDecay ?? 1);
  }

  const summary = createAoeSummary({
    results,
    totalTargets: targets.length,
    candidates: candidates.length,
    selectedTargets: filtered.length,
    alliesSpared: resolvedAoeConfig.friendlyFire ? 0 : spared,
    friendlyFire: resolvedAoeConfig.friendlyFire,
    friendlyFireMode: resolvedAoeConfig.friendlyFireMode,
    targetPolicy: policyResult.policy,
    targetZoneMode: zonePolicy?.mode,
    targetZone: zonePolicy?.zone,
    aoeType: resolvedAoeConfig.type,
  });
  attachAoeSummary(results, summary);
  await playAoeVfx({
    attacker,
    results,
    label,
    damageType: wantsAlliedAoeTargets(effect) ? "healing" : "magical",
    aoeType: resolvedAoeConfig.type,
    isUtility: true,
  });

  if (createChat && globalThis.ChatMessage?.create) {
    const chatData = buildAoeChatData({
      label,
      icon: "✨",
      results,
      summary,
      aoeConfig: resolvedAoeConfig,
      zonePolicy,
      damageType: wantsAlliedAoeTargets(effect) ? "healing" : "magical",
      baseDamage: baseAmount,
      isUtility: true,
    });
    const content = typeof globalThis.renderTemplate === "function"
      ? await renderTemplate(AOE_CHAT_TEMPLATE, chatData)
      : buildCombatChatCard({
        title: label,
        icon: "✨",
        rows: chatData.results.map(r => [`${r.statusIcon} ${r.name}`, r.outcome]),
        className: "ih-aoe-chat-card",
      });

    await ChatMessage.create({
      speaker: attacker ? ChatMessage.getSpeaker({ actor: attacker }) : undefined,
      content,
    });
  }

  return results;
}
