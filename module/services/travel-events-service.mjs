/**
 * Iron Hills — Travel Events Service (PATCH 28)
 * Случайные события при путешествиях.
 *
 * На каждый тайл маршрута — шанс события зависит от:
 * - Типа местности (лес, горы, дорога)
 * - Тира опасности региона/POI рядом
 * - Погоды (заглушка)
 * - Фракционного контроля территории
 */

// ─── Таблицы событий ────────────────────────────────────────────

const ROAD_EVENTS = [
  // Мирные (60%)
  { id:"merchant_caravan",  chance:15, label:"🐂 Торговый Обоз",      type:"encounter_friendly" },
  { id:"traveler",          chance:12, label:"🚶 Путник",              type:"encounter_friendly" },
  { id:"abandoned_camp",    chance:10, label:"🏕 Брошенный лагерь",   type:"loot"               },
  { id:"milestone",         chance:8,  label:"🪨 Верстовой столб",    type:"info"               },
  { id:"good_weather",      chance:8,  label:"☀ Хорошая погода",      type:"buff"               },
  { id:"fresh_water",       chance:7,  label:"💧 Родник",              type:"resource"           },
  // Опасные (40%)
  { id:"bandit_patrol",     chance:12, label:"⚔ Разбойники",          type:"combat"             },
  { id:"toll_demand",       chance:8,  label:"💰 Мытари",              type:"choice"             },
  { id:"bad_road",          chance:10, label:"🌧 Размытая дорога",    type:"delay"              },
  { id:"lost",              chance:5,  label:"🌫 Туман / заблудились", type:"delay"              },
  { id:"ambush",            chance:5,  label:"🗡 Засада!",             type:"combat_hard"        },
];

const WILDERNESS_EVENTS = [
  { id:"wildlife",          chance:15, label:"🐗 Дикий зверь",        type:"combat"             },
  { id:"berry_patch",       chance:12, label:"🍇 Ягодник",            type:"resource"           },
  { id:"ruins",             chance:10, label:"🏚 Древние руины",       type:"explore"            },
  { id:"hunter_camp",       chance:8,  label:"🏹 Лагерь охотника",    type:"encounter_friendly" },
  { id:"dangerous_animal",  chance:8,  label:"🐺 Волчья стая",        type:"combat"             },
  { id:"herb_patch",        chance:10, label:"🌿 Лекарственные травы", type:"resource"           },
  { id:"lost_traveler",     chance:7,  label:"😰 Потерявшийся",       type:"encounter_friendly" },
  { id:"storm",             chance:8,  label:"⛈ Гроза",              type:"delay"              },
  { id:"bandit_camp",       chance:7,  label:"🔥 Лагерь бандитов",    type:"combat"             },
  { id:"shrine",            chance:5,  label:"⛩ Придорожное святилище", type:"buff"             },
  { id:"cave",              chance:5,  label:"🕳 Пещера",             type:"explore"            },
  { id:"ambush",            chance:5,  label:"🗡 Засада!",             type:"combat_hard"        },
];

const MOUNTAIN_EVENTS = [
  { id:"rockslide",         chance:15, label:"🪨 Камнепад",           type:"combat_hard"        },
  { id:"mountain_pass",     chance:12, label:"🏔 Горный перевал",     type:"info"               },
  { id:"cave_shelter",      chance:10, label:"🕳 Укрытие в пещере",   type:"resource"           },
  { id:"ore_vein",          chance:10, label:"⛏ Рудная жила",        type:"resource"           },
  { id:"monster_lair",      chance:8,  label:"🐉 Логово монстра",     type:"combat_hard"        },
  { id:"blizzard",          chance:8,  label:"❄ Метель",             type:"delay"              },
  { id:"old_mine",          chance:7,  label:"🏚 Старая шахта",       type:"explore"            },
  { id:"mountain_folk",     chance:8,  label:"⛰ Горный народ",       type:"encounter_friendly" },
  { id:"nothing",           chance:22, label:"Тихо, ничего особого",  type:"nothing"            },
];

// ─── Описания событий ────────────────────────────────────────────

const EVENT_DETAILS = {
  merchant_caravan: {
    desc: "Вы встречаете торговый обоз. Торговец готов продать товары по дорожным ценам.",
    gm:   "Можно открыть окно торговли с одним из торговцев или просто разыграть встречу.",
    options: ["🏪 Поторговать", "💬 Поговорить", "🚶 Пройти мимо"],
  },
  bandit_patrol: {
    desc: "На дороге — вооружённые люди с недобрыми намерениями.",
    gm:   "Инициатива боя или проверка Запугивания/Убеждения чтобы разойтись миром.",
    options: ["⚔ В бой", "💬 Переговоры (Убеждение)", "🏃 Бежать"],
    danger: 2,
  },
  ambush: {
    desc: "ИЗ ЗАСАДЫ! Бандиты атакуют без предупреждения — группа застигнута врасплох.",
    gm:   "Первый раунд — бандиты действуют, группа в защите. Сложность выше обычного.",
    options: ["⚔ Сражаться"],
    danger: 3,
    surprise: true,
  },
  abandoned_camp: {
    desc: "Старый покинутый лагерь. Здесь явно кто-то ночевал, и не так давно.",
    gm:   "Бросок Внимательности (d6): 1-2=ничего, 3-4=еда+вода, 5=монеты 1d10 мед., 6=предмет.",
    options: ["🔍 Обыскать", "🚶 Пройти мимо"],
  },
  herb_patch: {
    desc: "Богатые залежи лекарственных трав. Можно собрать.",
    gm:   "Травничество: успех=1d4 лекарственных трав, крит=редкая трава.",
    options: ["🌿 Собрать (Травничество)", "🚶 Пройти мимо"],
    reward: { type:"herb", qty:"1d4" },
  },
  ore_vein: {
    desc: "Жила руды в скале. Нужны инструменты и время.",
    gm:   "Горное дело: 1ч работы = 1d6 единиц руды тира региона.",
    options: ["⛏ Добыть (Горное дело, 1ч)", "🚶 Дальше"],
    reward: { type:"ore", qty:"1d6" },
  },
  ruins: {
    desc: "Полуразрушенные строения уходят в землю. Внутри — тьма и запах сырости.",
    gm:   "Мини-данж: 1d3 комнаты, шанс сокровища, шанс монстра. Разыграй или пропусти.",
    options: ["🔦 Исследовать", "🚶 Пройти мимо"],
  },
  fresh_water: {
    desc: "Чистый родник. Можно пополнить запасы воды.",
    gm:   "Все фляги пополнены, +5 к Жажде каждого участника.",
    options: ["💧 Набрать воды", "🚶 Дальше"],
    reward: { type:"water_buff" },
  },
  bad_road: {
    desc: "Дорога размыта дождями. Продвижение вдвое медленнее.",
    gm:   "+1 час к пути. Лошади и повозки застревают: бросок Силы.",
    delay: 1,
  },
  storm: {
    desc: "Надвигается гроза. Молнии, дождь, видимость почти нулевая.",
    gm:   "+2 часа к пути или найдите укрытие. Бросок Выносливости: провал = Усталость.",
    delay: 2,
  },
  good_weather: {
    desc: "Отличная погода для путешествия. Солнечно, тепло, дорога сухая.",
    gm:   "-0.5ч к маршруту. Группа прибывает раньше и отдохнувшей.",
    timeBonus: 0.5,
  },
  toll_demand: {
    desc: "Дорогу перекрывают вооружённые люди с бревном. «Пропускной сбор — 5 серебра».",
    gm:   "Выбор: заплатить 500 мед. / прорваться силой / обойти (+1ч).",
    options: ["💰 Заплатить (500 мед.)", "⚔ Прорваться", "🔄 Обойти (+1ч)"],
  },
  shrine: {
    desc: "Придорожное святилище. Кто-то оставил свежие цветы.",
    gm:   "Молитва (любой навык): успех = Благословение (+1d6 к одному броску до конца дня).",
    options: ["🙏 Помолиться", "🚶 Дальше"],
  },
  nothing: {
    desc: "Путь спокойный. Только ветер и птицы.",
    gm:   "Ничего особого. Группа прибывает без приключений.",
    options: [],
  },
};

// ─── Генерация событий ───────────────────────────────────────────

/**
 * Получить таблицу событий по типу местности.
 */
function getEventTable(terrainType) {
  if (terrainType === "mountain" || terrainType === "cliff") return MOUNTAIN_EVENTS;
  if (terrainType === "forest"   || terrainType === "swamp")  return WILDERNESS_EVENTS;
  return ROAD_EVENTS; // road, plain, default
}

/**
 * Случайный выбор из взвешенной таблицы.
 */
function rollWeighted(table) {
  const total = table.reduce((s, e) => s + e.chance, 0);
  let r = Math.random() * total;
  for (const entry of table) {
    r -= entry.chance;
    if (r <= 0) return entry;
  }
  return table[table.length - 1];
}

/**
 * Базовый шанс события на тайл (0..1).
 * Зависит от danger тайла и типа местности.
 */
function baseTileEventChance(tile, dangerLevel = 3) {
  // Дорога — меньше событий, дикая местность — больше
  const terrainMult = {
    road: 0.2, plain: 0.25, forest: 0.40,
    mountain: 0.45, swamp: 0.50, cliff: 0.35,
  }[tile?.terrain ?? "plain"] ?? 0.3;

  // Danger 1-10 добавляет от 0 до +20%
  const dangerBonus = Math.min(0.20, (dangerLevel - 1) * 0.025);

  return Math.min(0.8, terrainMult + dangerBonus);
}

/**
 * Основная функция — рассчитать события для маршрута.
 * @param {Array}  path       — [{col, row, terrain}]
 * @param {Object} region     — данные региона (tiles с terrain)
 * @param {number} dangerLevel — уровень опасности (1-10)
 * @returns {Array} события: [{tileIdx, tile, event, details}]
 */
export function generateTravelEvents(path, region, dangerLevel = 3) {
  const events = [];
  const tiles  = region?.tiles ?? [];

  for (let i = 1; i < path.length; i++) { // пропускаем стартовый тайл
    const step  = path[i];
    const tile  = tiles.find(t => t.col === step.col && t.row === step.row) ?? step;
    const chance = baseTileEventChance(tile, dangerLevel);

    if (Math.random() < chance) {
      const table  = getEventTable(tile.terrain ?? "plain");
      const picked = rollWeighted(table);
      const detail = EVENT_DETAILS[picked.id] ?? {
        desc: picked.label,
        gm:   "Разыграй встречу.",
        options: ["🚶 Продолжить"],
      };
      events.push({
        tileIdx: i,
        tile,
        event:   picked,
        details: detail,
      });
    }
  }
  return events;
}

/**
 * Показать событие в чат и создать диалог для GM.
 * @param {Object} ev — элемент из generateTravelEvents
 * @param {number} stepNum — номер шага (для отображения)
 * @param {number} totalSteps — всего шагов
 */
export async function presentTravelEvent(ev, stepNum, totalSteps) {
  const { event, details, tile } = ev;

  const TYPE_ICONS = {
    combat:        "⚔",
    combat_hard:   "💀",
    encounter_friendly: "👋",
    loot:          "💰",
    resource:      "🌿",
    explore:       "🔍",
    buff:          "✨",
    delay:         "⏱",
    choice:        "❓",
    info:          "📍",
    nothing:       "🌤",
  };

  const icon = TYPE_ICONS[event.type] ?? "❓";
  const danger = event.danger ?? 0;
  const dangerStars = danger > 0 ? " " + "⭐".repeat(danger) : "";

  // Сообщение в чат для всех
  const playerMsg = `
    <div style="padding:8px;border-left:3px solid #5b9cf6;background:rgba(91,156,246,0.08)">
      <div style="font-size:13px;font-weight:700;margin-bottom:4px">
        ${icon} ${event.label}${dangerStars}
        <span style="font-size:10px;color:#a8b8d0;font-weight:400">
          — Тайл ${stepNum}/${totalSteps}
        </span>
      </div>
      <div style="font-size:12px;color:#c8d8f0">${details.desc}</div>
      ${details.options?.length > 0
        ? `<div style="margin-top:6px;font-size:10px;color:#a8b8d0">
            Варианты: ${details.options.join(" · ")}
           </div>`
        : ""}
    </div>`;

  await ChatMessage.create({ content: playerMsg });

  // Подсказка для GM (whisper)
  if (game.user?.isGM && details.gm) {
    await ChatMessage.create({
      content: `<div style="padding:6px;background:rgba(250,204,21,0.1);border-left:3px solid #facc15">
        🎲 <b>GM:</b> ${details.gm}
        ${details.delay     ? `<br>⏱ +${details.delay}ч к пути`    : ""}
        ${details.reward    ? `<br>🎁 Награда: ${JSON.stringify(details.reward)}` : ""}
        ${details.timeBonus ? `<br>✅ -${details.timeBonus}ч к пути` : ""}
      </div>`,
      whisper: ChatMessage.getWhisperRecipients("GM"),
    });
  }

  return { delay: details.delay ?? 0, timeBonus: details.timeBonus ?? 0 };
}

/**
 * Применить задержку/бонус ко времени путешествия.
 */
export function adjustTravelTime(baseHours, events) {
  let total = baseHours;
  for (const ev of events) {
    total += ev.details?.delay    ?? 0;
    total -= ev.details?.timeBonus ?? 0;
  }
  return Math.max(0.5, total);
}
