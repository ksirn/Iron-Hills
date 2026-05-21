/**
 * Iron Hills — AoE Attack Service
 * Управление зонами атаки через Foundry MeasuredTemplate.
 */
import {
  getTargetPartLabel,
} from "./actor-state-service.mjs";
import { resolveSingleAttack } from "./combat-attack-service.mjs";
import { calculateHitChance } from "./combat-hit-context-service.mjs";
import { applyHitEffects, healActorBodyPart } from "./hit-effect-service.mjs";
import { actorsAreAllies } from "./disposition-service.mjs";
import {
  buildAoeTargetZonePolicy,
  filterAoeTargetsByPolicy,
  findAoeActorToken,
  getAoeTargetActor,
  getAoeTargetToken,
  normalizeAoeConfig,
  resolveAoeTargetZone,
  resolveAoeTargetZoneForTarget,
  wantsAlliedAoeTargets,
} from "./aoe-policy-service.mjs";

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


/**
 * Рассчитать шанс попадания атакующего по цели.
 * Использует канонический getAttackThreshold (тот же путь, что и _performAttack).
 * @returns {{ pct:number, color:string, threshold:number, dieSize:number }}
 */
export function calcHitChance(attacker, target, skillKey = "unarmed", hitBonus = 0, skillValueFallback = null, {
  targetToken = null,
  surroundCount = 0,
  encumbrance = null,
  injuries = null,
} = {}) {
  const chance = calculateHitChance(attacker, target, {
    skillKey,
    hitBonus,
    skillValueFallback,
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
export async function placeAoeTemplate({ aoeType, distance, label, color = "#ff4444", attacker = null, skillKey = "unarmed", hitBonus = 0, skillValueFallback = null, injuries = null, friendlyFire = null }) {
  if (!canvas?.scene) return null;

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
          showHitChanceOverlays(inZone, attacker, skillKey, hitBonus, { friendlyFire: config.friendlyFire, skillValueFallback, injuries });
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
  onTemplatePlaced = null,
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

  const templateResult = await placeAoeTemplate({
    aoeType: config.shape,
    distance: config.distance,
    label,
    color,
    attacker,
    skillKey,
    hitBonus,
    skillValueFallback,
    injuries,
    friendlyFire: config.friendlyFire,
  });

  if (!templateResult) {
    return { ok: false, cancelled: true, template: null, targets: [], results: [] };
  }

  const { template, targets } = templateResult;

  try {
    await onTemplatePlaced?.(templateResult);
    const results = await applyAoeDamage({
      attacker,
      targets,
      baseDamage,
      skillKey,
      damageType,
      ignoreArmor,
      label,
      aoeType: config.type,
      maxTargets: config.maxTargets,
      chainDecay: config.chainDecay,
      hitBonus,
      skillValueFallback,
      injuries,
      targetZone,
      effect,
      friendlyFire: config.friendlyFire,
      aoeConfig: config,
    });
    return { ok: true, cancelled: false, template, targets, results };
  } finally {
    await removeAoeTemplate(template, cleanupDelay);
  }
}

/**
 * Отфильтровать цели по типу AoE
 */
export function filterTargetsByAoeType(targets, aoeType, maxTargets, attacker, { excludeAttacker = true } = {}) {
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
      filtered = filtered.sort(() => Math.random() - 0.5);
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
    hitBonus = 0, skillValueFallback = null, targetZone = null,
    injuries = null, effect = null, friendlyFire = false, aoeConfig: aoeConfigInput = null }) {

  if (!targets?.length) {
    ui.notifications.info("Никто не попал в зону атаки");
    return [];
  }

  const aoeConfig = aoeConfigInput ?? normalizeAoeConfig({
    type: aoeType,
    maxTargets,
    chainDecay,
    friendlyFire,
    damageType,
    effect,
    targetZone,
  }, {
    type: "blast",
    chainDecay: 1,
  });

  // Фильтр «свои/чужие»
  const policyResult = filterAoeTargetsByPolicy(targets, {
    attacker,
    friendlyFire: aoeConfig.friendlyFire,
    effect,
    purpose: "damage",
  });
  const candidates = policyResult.targets;
  const alliesSpared = policyResult.skipped;

  // Фильтруем по типу AoE (slice/sort/exclude самого атакующего для nova и др.)
  const filtered = filterTargetsByAoeType(candidates, aoeConfig.type, aoeConfig.maxTargets, attacker);
  if (!filtered.length) {
    if (alliesSpared > 0) {
      ui.notifications.info(`Под зону попали только союзники (${alliesSpared}) — атака не применена.`);
    } else {
      ui.notifications.info("Цели не попали под атаку");
    }
    return [];
  }

  const results = [];
  let curDmg    = baseDamage;

  const zonePolicy = buildAoeTargetZonePolicy({
    targetZone: resolveAoeTargetZone(targetZone, aoeConfig.targetZone),
    effect,
    aoe: aoeConfig,
    mode: aoeConfig.targetZoneMode,
  });

  for (let index = 0; index < filtered.length; index++) {
    const targetRef = filtered[index];
    const target = getAoeTargetActor(targetRef);
    if (!target) continue;
    const targetToken = getAoeTargetToken(targetRef);
    const resolvedTargetZone = resolveAoeTargetZoneForTarget(zonePolicy, targetRef, index);

    // Каждая цель — отдельный single-attack без интерактивного взрыва кубов.
    // Для AoE отключаем побочные эффекты, которые усложнили бы баланс:
    //   - applyInjuries: false  → без переломов/кровотечения/шока
    //   - wearWeapon:    false  → AoE-источник (заклинание/осколок) не имеет прочности
    //   - wearArmor:     false  → защита цели не изнашивается каждой каплей AoE
    //   - spendEnergy:   false  → энергия списывается caster'ом до этого
    //   - targetZone: null → каждая цель получает отдельную случайную зону
    const result = await resolveSingleAttack({
      attacker,
      target,
      skillKey,
      baseDamage:    Math.round(curDmg),
      damageType,
      energyCost:    0,
      weapon:        null,
      hitBonus,
      ignoreArmor,
      injuries,
      skillValueFallback,
      targetZone:    resolvedTargetZone,
      surroundCount: 0,
      targetToken,
      spendEnergy:   false,
      wearWeapon:    false,
      wearArmor:     false,
      applyInjuries: false,
      shieldIntercept: false,
    });
    if (!result) continue;

    const hitEffects = await applyHitEffects({
      attacker,
      target,
      result,
      effect,
    });

    results.push({
      actorId:   target.id,
      actorUuid: target.uuid,
      name:      target.name,
      ally:      attacker ? actorsAreAllies(attacker, target) : false,
      hit:       result.hit,
      roll:      result.effectiveRoll,
      threshold: result.threshold,
      margin:    result.margin,
      zone:      result.locationLabel,
      zoneKey:   result.locationKey,
      zoneMode:  zonePolicy.mode,
      damage:    result.finalDamage,
      armor:     result.reduction,
      condition:  hitEffects.condition,
    });

    if (aoeConfig.type === "chain") curDmg *= (aoeConfig.chainDecay ?? 0.8);
  }

  const typeLabels = {
    blast: "💥", pierce: "➡", sweep: "↔", shards: "💎", chain: "⛓", nova: "🌟",
  };

  const content = await renderTemplate(
    "systems/iron-hills-system/templates/chat/aoe.hbs",
    {
      label,
      icon:         typeLabels[aoeConfig.type] ?? "💥",
      aoeType:      aoeConfig.type,
      friendlyFire: aoeConfig.friendlyFire,
      friendlyFireMode: aoeConfig.friendlyFireMode,
      targetZoneMode: zonePolicy.mode,
      targetZoneLabel: zonePolicy.zone ? getTargetPartLabel(zonePolicy.zone) : "случайная для каждой цели",
      totalCount:   filtered.length,
      hitCount:     results.filter(r => r.hit).length,
      alliesHit:    results.filter(r => r.ally && r.hit).length,
      alliesSpared: aoeConfig.friendlyFire ? 0 : alliesSpared,
      results,
    },
  );

  await ChatMessage.create({
    speaker: attacker ? ChatMessage.getSpeaker({ actor: attacker }) : undefined,
    content,
  });

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
  friendlyFire = false,
} = {}) {
  if (!targets?.length) {
    ui.notifications.info("Никто не попал в зону эффекта");
    return [];
  }

  const aoeConfig = normalizeAoeConfig({
    type: aoeType,
    maxTargets,
    chainDecay,
    friendlyFire,
    effect,
    damageType: wantsAlliedAoeTargets(effect) ? "healing" : "magical",
  }, {
    type: "blast",
    chainDecay: 1,
  });
  const wantsAllies = wantsAlliedAoeTargets(effect);
  const policyResult = filterAoeTargetsByPolicy(targets, {
    attacker,
    friendlyFire: aoeConfig.friendlyFire,
    effect,
    purpose: "utility",
  });
  const candidates = policyResult.targets;
  const spared = policyResult.skipped;

  const filtered = filterTargetsByAoeType(candidates, aoeConfig.type, aoeConfig.maxTargets, attacker, {
    excludeAttacker: !wantsAllies,
  });

  if (!filtered.length) {
    ui.notifications.info("Цели не попали под эффект");
    return [];
  }

  const resolvedTargetZone = resolveAoeTargetZone(targetZone, effect?.targetZone, effect?.targetPart) ?? "torso";
  const baseAmount = getAoeUtilityAmount(effect, power);
  const results = [];
  let currentAmount = baseAmount;

  for (const targetRef of filtered) {
    const target = getAoeTargetActor(targetRef);
    if (!target) continue;

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
      actorId: target.id,
      actorUuid: target.uuid,
      name: target.name,
      amount,
      healed,
      condition,
      line,
    });

    if (aoeConfig.type === "chain") currentAmount *= (aoeConfig.chainDecay ?? 1);
  }

  const content = `
    <div style="padding:6px;font-family:var(--font-primary)">
      ✨ <b>${label}</b><br>
      Целей: <b>${filtered.length}</b>${spared > 0 ? ` · пропущено: ${spared}` : ""}
      <br>
      ${results.map(r => `✓ ${r.name}: ${r.line}`).join("<br>")}
    </div>
  `;

  await ChatMessage.create({
    speaker: attacker ? ChatMessage.getSpeaker({ actor: attacker }) : undefined,
    content,
  });

  return results;
}
