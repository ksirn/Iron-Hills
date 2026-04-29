/**
 * Iron Hills — Identification Service (PATCH 30)
 * Частичная идентификация через навыки + полная через Оценку.
 *
 * Аспекты раскрытия:
 *   craft    → Кузнечное дело  → материал, тир, качество
 *   alchemy  → Алхимия         → яды, пропитки, эффекты зелий
 *   enchant  → Зачарование     → магические свойства, школа, ранг
 *   appraisal→ Оценка          → всё + рыночная цена
 */

// ─── Конфиг аспектов ─────────────────────────────────────────────

export const IDENTIFY_ASPECTS = {
  craft: {
    label:    "🔨 Материал и ковка",
    skill:    "blacksmithing",
    itemTypes: ["weapon","armor","tool","material"],
    dc:       (tier) => tier * 2 + 3,
    reveal: (item) => {
      const sys = item.system;
      const parts = [];
      if (sys.tier)    parts.push(`Тир ${sys.tier}`);
      if (sys.damage)  parts.push(`Урон ${sys.damage}`);
      if (sys.protection?.physical) parts.push(`Защита ${sys.protection.physical}`);
      if (sys.weight)  parts.push(`Вес ${sys.weight} кг`);
      return parts.join(" · ") || "Обычный предмет";
    },
  },
  alchemy: {
    label:    "⚗ Алхимические свойства",
    skill:    "alchemy",
    itemTypes: ["potion","weapon","food","material"],
    dc:       (tier) => tier * 2 + 4,
    reveal: (item) => {
      const sys = item.system;
      const parts = [];
      if (sys.actionType) parts.push(`Эффект: ${sys.actionType}`);
      if (sys.power)      parts.push(`Сила: ${sys.power}`);
      if (sys.effect)     parts.push(String(sys.effect).replace(/<[^>]+>/g,"").slice(0,60));
      return parts.join(" · ") || "Нет алхимических свойств";
    },
  },
  enchant: {
    label:    "✨ Зачарование",
    skill:    "enchanting",
    itemTypes: ["weapon","armor","spell","tool"],
    dc:       (tier) => tier * 2 + 5,
    reveal: (item) => {
      const sys = item.system;
      const parts = [];
      if (sys.school)   parts.push(`Школа: ${sys.school}`);
      if (sys.rank)     parts.push(`Ранг: ${sys.rank}`);
      if (sys.manaCost) parts.push(`Мана: ${sys.manaCost}`);
      if (sys.damage && sys.school) parts.push(`Урон: ${sys.damage}`);
      return parts.join(" · ") || "Не зачарован";
    },
  },
  appraisal: {
    label:    "🔍 Полная оценка",
    skill:    "appraisal",
    itemTypes: ["weapon","armor","tool","potion","material","spell","food"],
    dc:       (tier) => tier * 2 + 2,
    reveal: (item) => {
      const { repairCost } = item.system;
      const value = Number(item.system?.price ?? item.system?.value ?? 0);
      const parts = [item.name];
      if (value > 0) {
        const gold   = Math.floor(value / 10000);
        const silver = Math.floor((value % 10000) / 100);
        const copper = value % 100;
        const priceStr = [
          gold   ? `${gold} зол.`   : "",
          silver ? `${silver} сер.` : "",
          copper ? `${copper} мед.` : "",
        ].filter(Boolean).join(" ");
        parts.push(`Цена: ~${priceStr}`);
      }
      return parts.join(" · ");
    },
  },
};

// ─── Получить статус идентификации ───────────────────────────────

export function getIdentStatus(item) {
  if (!item) return { identified: true, aspects: {} };
  const identified = item.system?.identified !== false;
  const aspects    = item.system?.identifiedAspects ?? {};
  const tier       = Number(item.system?.tier ?? 1);
  const type       = item.type;

  // Собираем применимые аспекты для этого типа предмета
  const applicable = Object.entries(IDENTIFY_ASPECTS)
    .filter(([, cfg]) => cfg.itemTypes.includes(type))
    .map(([key, cfg]) => ({
      key,
      label:     cfg.label,
      skill:     cfg.skill,
      dc:        cfg.dc(tier),
      revealed:  aspects[key] ?? false,
      revealText: aspects[key] ? cfg.reveal(item) : "???",
    }));

  return { identified, aspects, applicable, tier };
}

/** Что видит игрок — реальное имя или заглушку */
export function getVisibleName(item, viewer = null) {
  if (!item) return "???";
  const isGM = viewer ? game.users?.get(viewer.id)?.isGM : game.user?.isGM;
  if (isGM) return item.name; // GM видит всё
  if (item.system?.identified !== false) return item.name;
  return item.system?.unidentifiedName || `❓ Неизвестный ${_typeName(item.type)}`;
}

function _typeName(type) {
  const map = {
    weapon:"предмет", armor:"снаряжение", tool:"инструмент",
    potion:"зелье", spell:"свиток", material:"материал", food:"еда"
  };
  return map[type] ?? "предмет";
}

// ─── Попытка идентификации ───────────────────────────────────────

/**
 * Попытка идентифицировать аспект предмета через навык.
 * @param {Actor}  actor   — персонаж
 * @param {Item}   item    — предмет
 * @param {string} aspect  — ключ аспекта (craft/alchemy/enchant/appraisal)
 * @returns {object} { success, roll, dc, revealed }
 */
export async function attemptIdentify(actor, item, aspect) {
  const cfg  = IDENTIFY_ASPECTS[aspect];
  if (!cfg) return { success: false, error: "Неизвестный аспект" };

  const tier  = Number(item.system?.tier ?? 1);
  const dc    = cfg.dc(tier);

  // Уровень навыка актора
  const skillVal = Number(actor.system?.skills?.[cfg.skill]?.value ?? 1);

  // Бросок: d6 * skillVal (или d20 — зависит от системы)
  // Используем d6 × значение навыка vs DC
  const diceResult = Math.ceil(Math.random() * 6);
  const total      = diceResult + skillVal;
  const success    = total >= dc;

  // Сообщение в чат
  await ChatMessage.create({
    content: `<div style="padding:6px">
      ${success ? "✅" : "❌"}
      <b>${actor.name}</b> — ${cfg.label} предмета
      <i style="color:#a8b8d0">${getVisibleName(item)}</i><br>
      Бросок: <b>${diceResult}</b> + навык <b>${skillVal}</b> = <b>${total}</b>
      vs DC <b>${dc}</b> — ${success ? "Успех!" : "Провал"}
      ${success ? `<br><span style="color:#4ade80">${cfg.reveal(item)}</span>` : ""}
    </div>`,
    whisper: success ? [] : ChatMessage.getWhisperRecipients("GM"),
  });

  if (success) {
    await revealAspect(item, aspect);
    // Если все аспекты раскрыты — помечаем как опознанный
    await _checkFullyIdentified(item);
  }

  return { success, roll: diceResult, skillVal, total, dc };
}

/**
 * Раскрыть аспект предмета.
 */
export async function revealAspect(item, aspect) {
  await item.update({
    [`system.identifiedAspects.${aspect}`]: true,
  });
}

/**
 * Полная идентификация (торговец-маг или GM).
 */
export async function fullyIdentify(item, payer = null, cost = 0) {
  if (payer && cost > 0) {
    const cur = payer.system?.currency ?? {};
    const coins = (Number(cur.copper??0)) + (Number(cur.silver??0))*100
                + (Number(cur.gold??0))*10000;
    if (coins < cost) {
      ui.notifications.error(`Не хватает монет: нужно ${cost} мед.`);
      return false;
    }
    const remaining = coins - cost;
    await payer.update({
      "system.currency.gold":   Math.floor(remaining / 10000),
      "system.currency.silver": Math.floor((remaining % 10000) / 100),
      "system.currency.copper": remaining % 100,
    });
  }

  const allAspects = {};
  for (const key of Object.keys(IDENTIFY_ASPECTS)) allAspects[key] = true;

  await item.update({
    "system.identified":        true,
    "system.identifiedAspects": allAspects,
  });

  ui.notifications.info(`✅ ${item.name} полностью опознан!`);
  return true;
}

/**
 * Сделать предмет неопознанным (для GM — выдать найденный предмет).
 */
export async function makeUnidentified(item, unidentifiedName = "") {
  const type      = item.type;
  const defName   = unidentifiedName || `❓ Неизвестный ${_typeName(type)}`;

  await item.update({
    "system.identified":        false,
    "system.unidentifiedName":  defName,
    "system.identifiedAspects": {
      craft: false, alchemy: false, enchant: false, appraisal: false
    },
  });
  ui.notifications.info(`${item.name} помечен как неопознанный`);
}

async function _checkFullyIdentified(item) {
  const aspects = item.system?.identifiedAspects ?? {};
  const type    = item.type;
  // Проверяем все применимые аспекты
  const allRevealed = Object.entries(IDENTIFY_ASPECTS)
    .filter(([, cfg]) => cfg.itemTypes.includes(type))
    .every(([key]) => aspects[key]);

  if (allRevealed) {
    await item.update({ "system.identified": true });
    ui.notifications.info(`✅ ${item.name} полностью опознан!`);
  }
}
