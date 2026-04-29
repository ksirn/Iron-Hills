/**
 * Iron Hills — AoE Attack Service
 * Управление зонами атаки через Foundry MeasuredTemplate.
 */
import {
  getAttackThreshold,
} from "./actor-state-service.mjs";
import { resolveSingleAttack } from "./combat-attack-service.mjs";
import { actorsAreAllies } from "./disposition-service.mjs";

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
export function calcHitChance(attacker, target, skillKey = "unarmed", hitBonus = 0) {
  const skillVal = Number(attacker?.system?.skills?.[skillKey]?.value ?? 3);
  const dieSize  = Math.min(20, Math.max(2, skillVal * 2));

  const cond = target?.system?.conditions ?? {};
  const equip = target?.system?.equipment ?? {};
  const targetLeftHand = equip.leftHand ? target.items?.get(equip.leftHand) : null;
  const hasShield = Boolean(targetLeftHand?.system?.isShield || targetLeftHand?.type === "armor");

  const armorTier = target?.type === "monster"
    ? Number(target?.system?.resources?.armor?.physical ?? 0)
    : Number(target?.system?.info?.armorTier ?? 0);

  const threshold = getAttackThreshold(target, {
    hasShield,
    isLying:      Boolean(cond.prone),
    isStunned:    Number(cond.stunned ?? 0) > 0,
    targetFeared: Number(cond.feared  ?? 0) > 0,
    surroundCount: 0,
    inDarkness:    false,
    armorTierOverride: target?.type === "monster" ? armorTier : undefined
  });

  // Эффективный порог с учётом hitBonus атакующего: чем выше бонус, тем легче попасть
  const effectiveThreshold = Math.max(1, threshold - Number(hitBonus ?? 0));

  // Шанс попадания на d{dieSize}: P(roll >= effectiveThreshold)
  const pct = Math.round(Math.max(0, Math.min(100,
    ((dieSize - effectiveThreshold + 1) / dieSize) * 100
  )));

  const color = pct >= 70 ? "#4ade80"
              : pct >= 40 ? "#facc15"
              : "#f87171";

  return { pct, color, threshold: effectiveThreshold, dieSize };
}

/**
 * Показать плашки шанса попадания над токенами в зоне
 */
export function showHitChanceOverlays(tokens, attacker, skillKey, hitBonus = 0, { friendlyFire = false } = {}) {
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
      const chance = calcHitChance(attacker, actor, skillKey, hitBonus);
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
export async function placeAoeTemplate({ aoeType, distance, label, color = "#ff4444", attacker = null, skillKey = "unarmed", hitBonus = 0, friendlyFire = false }) {
  if (!canvas?.scene) return null;

  const gridSize = canvas.grid?.size ?? 100;
  const dist     = distance * gridSize;

  // Создаём шаблон
  const templateData = {
    t:         aoeType,        // "circle" | "cone" | "ray" | "rect"
    distance:  distance,       // в единицах сетки
    width:     aoeType === "ray" ? 1 : undefined,
    angle:     aoeType === "cone" ? 90 : undefined,
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
    template.drawPreview();

    // Обновляем оверлеи каждые 100мс пока шаблон двигается
    overlayInterval = setInterval(() => {
      const pos = template.document ?? template;
      if (pos.x !== lastX || pos.y !== lastY) {
        lastX = pos.x; lastY = pos.y;
        const inZone = getTokensInPreviewTemplate(template);
        if (attacker && inZone.length) {
          showHitChanceOverlays(inZone, attacker, skillKey, hitBonus, { friendlyFire });
        } else {
          removeHitChanceOverlays();
        }
      }
    }, 100);

    const hookId = Hooks.once("createMeasuredTemplate", async (doc) => {
      clearInterval(overlayInterval);
      removeHitChanceOverlays();
      await new Promise(r => setTimeout(r, 100));
      const targets = getTokensInTemplate(doc);
      resolve({ template: doc, targets });
    });

    const escListener = (e) => {
      if (e.key === "Escape") {
        clearInterval(overlayInterval);
        removeHitChanceOverlays();
        Hooks.off("createMeasuredTemplate", hookId);
        resolve(null);
      }
    };
    document.addEventListener("keydown", escListener, { once: true });
  });
}

/**
 * Получить токены в preview шаблоне (до его размещения)
 */
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
export function getTokensInTemplate(templateDoc) {
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
  }).map(t => t.actor).filter(Boolean);
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

/**
 * Отфильтровать цели по типу AoE
 */
export function filterTargetsByAoeType(targets, aoeType, maxTargets, attacker) {
  // Убираем самого атакующего (для nova)
  let filtered = targets.filter(t => t && t.id !== attacker?.id);

  switch (aoeType) {
    case "blast":
    case "nova":
      // Все в зоне (до maxTargets)
      break;
    case "pierce":
      // Только первая цель — ближайшая к атакующему
      filtered = filtered.slice(0, maxTargets ?? 1);
      break;
    case "sweep":
      // Слева направо — сортируем по X, берём maxTargets
      if (attacker) {
        const token = canvas?.tokens?.placeables?.find(t => t.actor?.id === attacker.id);
        if (token) {
          filtered.sort((a, b) => {
            const ta = canvas?.tokens?.placeables?.find(t => t.actor?.id === a.id);
            const tb = canvas?.tokens?.placeables?.find(t => t.actor?.id === b.id);
            return (ta?.x ?? 0) - (tb?.x ?? 0);
          });
        }
      }
      break;
    case "shards":
      // Случайные N из зоны — тасуем
      filtered = filtered.sort(() => Math.random() - 0.5);
      break;
    case "chain":
      // Ближайшие N к атакующему по цепочке
      if (attacker) {
        const attackerToken = canvas?.tokens?.placeables?.find(t => t.actor?.id === attacker.id);
        if (attackerToken) {
          filtered.sort((a, b) => {
            const ta = canvas?.tokens?.placeables?.find(t => t.actor?.id === a.id);
            const tb = canvas?.tokens?.placeables?.find(t => t.actor?.id === b.id);
            const da = Math.hypot((ta?.x??0) - attackerToken.x, (ta?.y??0) - attackerToken.y);
            const db = Math.hypot((tb?.x??0) - attackerToken.x, (tb?.y??0) - attackerToken.y);
            return da - db;
          });
        }
      }
      break;
  }

  if (maxTargets) filtered = filtered.slice(0, maxTargets);
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
 * @param {object|null} [args.effect]
 * @param {boolean} [args.friendlyFire=false] — если false, союзники атакующего
 *   (по token disposition) исключаются из списка целей. Если true — задеваются все.
 */
export async function applyAoeDamage({ attacker, targets, baseDamage, skillKey,
    damageType = "physical", ignoreArmor = 0, label = "AoE атака",
    aoeType = "blast", maxTargets = null, chainDecay = 1.0,
    hitBonus = 0, effect = null, friendlyFire = false }) {

  if (!targets?.length) {
    ui.notifications.info("Никто не попал в зону атаки");
    return [];
  }

  // Фильтр «свои/чужие»
  let candidates = targets;
  let alliesSpared = 0;
  if (!friendlyFire && attacker) {
    candidates = targets.filter(t => {
      if (!t) return false;
      const isAlly = actorsAreAllies(attacker, t);
      if (isAlly) alliesSpared++;
      return !isAlly;
    });
  }

  // Фильтруем по типу AoE (slice/sort/exclude самого атакующего для nova и др.)
  const filtered = filterTargetsByAoeType(candidates, aoeType, maxTargets, attacker);
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

  for (const target of filtered) {
    if (!target) continue;

    // Каждая цель — отдельный single-attack без интерактивного взрыва кубов.
    // Для AoE отключаем побочные эффекты, которые усложнили бы баланс:
    //   - applyInjuries: false  → без переломов/кровотечения/шока
    //   - wearWeapon:    false  → AoE-источник (заклинание/осколок) не имеет прочности
    //   - wearArmor:     false  → защита цели не изнашивается каждой каплей AoE
    //   - spendEnergy:   false  → энергия списывается caster'ом до этого
    //   - targetZone:    "torso"→ AoE бьёт по торсу, как и раньше
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
      targetZone:    "torso",
      surroundCount: 0,
      spendEnergy:   false,
      wearWeapon:    false,
      wearArmor:     false,
      applyInjuries: false,
    });
    if (!result) continue;

    let condition = null;
    if (result.hit && effect?.applyCondition && Math.random() < (effect.conditionChance ?? 1)) {
      await target.update({ [`system.conditions.${effect.applyCondition}`]: 1 });
      condition = effect.applyCondition;
    }

    if (result.hit && effect?.special === "lifesteal" && attacker) {
      const atkHp = attacker.system?.resources?.hp?.torso?.value
                 ?? attacker.system?.resources?.hp?.value ?? 0;
      const hpPath = attacker.system?.resources?.hp?.torso !== undefined
        ? "system.resources.hp.torso.value"
        : "system.resources.hp.value";
      await attacker.update({ [hpPath]: atkHp + result.finalDamage });
    }

    results.push({
      name:      target.name,
      hit:       result.hit,
      roll:      result.effectiveRoll,
      threshold: result.threshold,
      damage:    result.finalDamage,
      armor:     result.reduction,
      condition,
    });

    if (aoeType === "chain") curDmg *= (chainDecay ?? 0.8);
  }

  const typeLabels = {
    blast: "💥", pierce: "➡", sweep: "↔", shards: "💎", chain: "⛓", nova: "🌟",
  };

  const content = await renderTemplate(
    "systems/iron-hills-system/templates/chat/aoe.hbs",
    {
      label,
      icon:         typeLabels[aoeType] ?? "💥",
      totalCount:   filtered.length,
      hitCount:     results.filter(r => r.hit).length,
      alliesSpared: friendlyFire ? 0 : alliesSpared,
      results,
    },
  );

  await ChatMessage.create({
    speaker: attacker ? ChatMessage.getSpeaker({ actor: attacker }) : undefined,
    content,
  });

  return results;
}
