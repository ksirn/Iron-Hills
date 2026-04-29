/**
 * Iron Hills — Durability Service
 * Прочность предметов: снижение, штрафы, ремонт.
 *
 * Типы предметов с прочностью: weapon, armor, tool
 * Уровни прочности:
 *   100–76% = норма
 *   75–51%  = изношен (-5% к эффективности)
 *   50–26%  = повреждён (-15%)
 *   25–1%   = критический (-30%)
 *   0%      = сломан (не работает)
 */

const DURABILITY_TYPES = new Set(["weapon", "armor", "tool"]);

/** Порог → штраф к эффективности (множитель 0..1) */
export function getDurabilityMult(item) {
  if (!item) return 1;
  const cur = Number(item.system?.durability?.value ?? 100);
  const max = Number(item.system?.durability?.max   ?? 100);
  if (max <= 0) return 1;
  const pct = cur / max;
  if (pct <= 0)    return 0;    // сломан
  if (pct <= 0.25) return 0.70; // критический
  if (pct <= 0.50) return 0.85; // повреждён
  if (pct <= 0.75) return 0.95; // изношен
  return 1;                      // норма
}

/** Состояние прочности в виде строки */
export function getDurabilityLabel(item) {
  if (!item) return "";
  const cur = Number(item.system?.durability?.value ?? 100);
  const max = Number(item.system?.durability?.max   ?? 100);
  if (max <= 0) return "";
  const pct = cur / max;
  if (pct <= 0)    return "💀 Сломан";
  if (pct <= 0.25) return "🔴 Критический";
  if (pct <= 0.50) return "🟠 Повреждён";
  if (pct <= 0.75) return "🟡 Изношен";
  return "🟢 Норма";
}

/** CSS-класс для цвета полоски прочности */
export function getDurabilityClass(item) {
  const cur = Number(item?.system?.durability?.value ?? 100);
  const max = Number(item?.system?.durability?.max   ?? 100);
  if (max <= 0) return "";
  const pct = cur / max;
  if (pct <= 0)    return "dur-broken";
  if (pct <= 0.25) return "dur-critical";
  if (pct <= 0.50) return "dur-damaged";
  if (pct <= 0.75) return "dur-worn";
  return "dur-good";
}

/**
 * Снизить прочность предмета на delta единиц.
 * @param {Item}   item   — предмет
 * @param {number} delta  — сколько снимать (1-10)
 * @param {Actor}  actor  — владелец для уведомления
 */
export async function wearItem(item, delta = 1, actor = null) {
  if (!item || !DURABILITY_TYPES.has(item.type)) return;
  const cur = Number(item.system?.durability?.value ?? 100);
  const max = Number(item.system?.durability?.max   ?? 100);
  const next = Math.max(0, cur - delta);
  await item.update({ "system.durability.value": next });

  // Уведомление при смене уровня
  const prevPct = cur  / max;
  const nextPct = next / max;
  const actor_  = actor ?? item.parent;

  if (next === 0 && cur > 0) {
    ui.notifications.warn(`💀 ${item.name} сломан! Требуется ремонт.`);
    const content = await renderTemplate(
      "systems/iron-hills-system/templates/chat/item-broken.hbs",
      { item: { name: item.name } },
    );
    await ChatMessage.create({
      content,
      speaker: actor_ ? ChatMessage.getSpeaker({ actor: actor_ }) : undefined,
    });
  } else if (prevPct > 0.25 && nextPct <= 0.25) {
    ui.notifications.warn(`🔴 ${item.name}: критическая прочность! -30% к эффективности.`);
  } else if (prevPct > 0.50 && nextPct <= 0.50) {
    ui.notifications.warn(`🟠 ${item.name}: повреждён. -15% к эффективности.`);
  } else if (prevPct > 0.75 && nextPct <= 0.75) {
    ui.notifications.info(`🟡 ${item.name}: изношен. -5% к эффективности.`);
  }
}

/**
 * Снизить прочность брони надетой на зону locationKey.
 * Вызывается при получении урона.
 */
export async function wearArmorAtLocation(actor, locationKey, damageReceived) {
  if (!actor || damageReceived <= 0) return;
  const equip = actor.system?.equipment ?? {};

  // Ищем броню покрывающую эту зону
  for (const [slot, itemId] of Object.entries(equip)) {
    if (!itemId) continue;
    const item = actor.items.get(itemId);
    if (!item || item.type !== "armor") continue;
    const covers = item.system?.covers ?? [];
    if (!covers.includes(locationKey)) continue;

    // Снимаем 1-3 единицы прочности в зависимости от урона
    const delta = damageReceived >= 10 ? 3 : damageReceived >= 5 ? 2 : 1;
    await wearItem(item, delta, actor);
    break; // только верхний слой
  }
}

/**
 * Снизить прочность оружия при атаке.
 * Вызывается после успешного удара.
 */
export async function wearWeaponOnAttack(actor, weaponItem) {
  if (!weaponItem || weaponItem.type !== "weapon") return;
  // Оружие изнашивается медленнее брони: 1 единица за 5-10 атак
  const roll = Math.random();
  if (roll < 0.2) { // 20% шанс износа за атаку
    await wearItem(weaponItem, 1, actor);
  }
}

/**
 * Стоимость ремонта в меди.
 * Зависит от тира и степени повреждения.
 */
export function repairCost(item) {
  const cur  = Number(item.system?.durability?.value ?? 100);
  const max  = Number(item.system?.durability?.max   ?? 100);
  const tier = Number(item.system?.tier ?? 1);
  const missing = Math.max(0, max - cur);
  if (missing === 0) return 0;
  // Базовая стоимость: tier * 10 меди за единицу прочности
  return Math.ceil(missing * tier * 10);
}

/**
 * Починить предмет полностью (вызывается через кузнеца).
 * @param {Item}  item   — предмет
 * @param {Actor} payer  — кто платит
 * @param {boolean} free — бесплатный ремонт (GM)
 */
export async function repairItem(item, payer = null, free = false) {
  const cost = repairCost(item);
  const max  = Number(item.system?.durability?.max ?? 100);

  if (!free && cost > 0 && payer) {
    const cur = payer.system?.currency ?? {};
    const coins = (Number(cur.copper??0)) + (Number(cur.silver??0))*100
                + (Number(cur.gold??0))*10000 + (Number(cur.platinum??0))*1000000;
    if (coins < cost) {
      ui.notifications.error(`Не хватает монет: нужно ${cost} мед., есть ${coins} мед.`);
      return false;
    }
    const remaining = coins - cost;
    await payer.update({
      "system.currency.gold":   Math.floor(remaining / 10000),
      "system.currency.silver": Math.floor((remaining % 10000) / 100),
      "system.currency.copper": remaining % 100,
    });
  }

  await item.update({ "system.durability.value": max });
  ui.notifications.info(`🔨 ${item.name} отремонтирован!`);
  return true;
}
