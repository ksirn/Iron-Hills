/**
 * Iron Hills — Weather & Lighting Service
 * Динамическое освещение по времени суток + погодные эффекты.
 *
 * Хранение:
 *   game.settings: ih-weather (текущий погодный пресет)
 *   scene.flags["iron-hills-system"].weather
 */

// ── Время суток ──────────────────────────────────────────────

export const TIME_PERIODS = [
  // tint — очень тонкий, почти нейтральный. Основной эффект через darkness.
  { name: "Глубокая ночь",  from: 0,  to: 5,  darkness: 0.85, tint: "#000000", globalLight: false, vision: 2,  icon: "🌑" },
  { name: "Рассвет",        from: 5,  to: 7,  darkness: 0.45, tint: "#0a0805", globalLight: true,  vision: 6,  icon: "🌅" },
  { name: "Утро",           from: 7,  to: 10, darkness: 0.20, tint: "#000000", globalLight: true,  vision: 12, icon: "🌤" },
  { name: "День",           from: 10, to: 17, darkness: 0.05, tint: "#000000", globalLight: true,  vision: 16, icon: "☀️" },
  { name: "Закат",          from: 17, to: 20, darkness: 0.40, tint: "#080402", globalLight: true,  vision: 6,  icon: "🌇" },
  { name: "Вечер",          from: 20, to: 22, darkness: 0.68, tint: "#000000", globalLight: false, vision: 4,  icon: "🌆" },
  { name: "Ночь",           from: 22, to: 24, darkness: 0.82, tint: "#000000", globalLight: false, vision: 2,  icon: "🌙" },
];

// ── Погода ───────────────────────────────────────────────────

export const WEATHER_PRESETS = {
  clear: {
    id: "clear", label: "Ясно", icon: "☀️",
    foundryWeather: null,
    visionPenalty: 0,
    effects: {},
    desc: "Хорошая погода. Никаких штрафов.",
  },
  rain: {
    id: "rain", label: "Дождь", icon: "🌧",
    foundryWeather: "rain",
    visionPenalty: 2,
    darknessBonus: 0.08,
    effects: {
      bow:      -1,
      crossbow: -1,
      throwing: -1,
      stealth:  +1,
    },
    desc: "Дождь. −1 к стрелковым, −2 видимости, шаги тише.",
  },
  storm: {
    id: "storm", label: "Гроза", icon: "⛈",
    foundryWeather: "rain",
    visionPenalty: 5,
    darknessBonus: 0.20,
    effects: {
      bow:      -3,
      crossbow: -2,
      throwing: -2,
      stealth:  +2,
      sword:    -1,  // гром отвлекает
      mace:     -1,
    },
    desc: "Гроза. −2-3 к броскам, −5 видимости, темнее на 20%.",
  },
  fog: {
    id: "fog", label: "Туман", icon: "🌫",
    foundryWeather: null,
    visionPenalty: 7,
    darknessBonus: 0.15,
    effects: {
      bow:        -2,  // цель не видна
      crossbow:   -2,
      throwing:   -1,
      stealth:    +3,
      perception: -4,  // не видно вокруг
      unarmed:    +1,  // в тумане ближний бой выравнивается
    },
    desc: "Густой туман. −7 видимости, −2-4 к дальним, скрытность +3.",
  },
  blizzard: {
    id: "blizzard", label: "Метель", icon: "🌨",
    foundryWeather: "snow",
    visionPenalty: 6,
    darknessBonus: 0.18,
    movementMult: 0.5,
    effects: {
      bow:      -4,
      crossbow: -3,
      throwing: -4,
      sword:    -1,
      axe:      -1,
      spear:    -1,
      stealth:  +2,  // следы заметает
    },
    desc: "Метель. −6 видимости, −1-4 к броскам, движение ×0.5.",
  },
  wind: {
    id: "wind", label: "Ветер", icon: "🌬",
    foundryWeather: null,
    visionPenalty: 1,
    effects: {
      bow:      -3,
      throwing: -3,
      crossbow: -1,
      spear:    -1,  // древко сносит
      stealth:  +1,  // шум ветра маскирует
      unarmed:  -1,  // труднее удерживать баланс
    },
    desc: "Сильный ветер. −1-3 к метательным/стрелковым/копьям.",
  },
  snow: {
    id: "snow", label: "Снегопад", icon: "❄️",
    foundryWeather: "snow",
    visionPenalty: 2,
    darknessBonus: 0.05,
    movementMult: 0.75,
    effects: {
      bow:      -1,
      throwing: -1,
      stealth:  -1,  // следы на снегу
    },
    desc: "Снегопад. −2 видимости, движение ×0.75, следы видны.",
  },
};

// ── Вспомогательные функции ──────────────────────────────────

/** Получить текущий час (0-23) из worldTime */
export function getCurrentHour() {
  const wt = game.time?.worldTime ?? 0;
  return Math.floor((wt % 86400) / 3600);
}

/** Получить период суток по часу */
export function getTimePeriod(hour) {
  return TIME_PERIODS.find(p => hour >= p.from && hour < p.to) ?? TIME_PERIODS[6];
}

/** Интерполяция двух hex цветов (0..1) */
function lerpHex(a, b, t) {
  const ah = a.replace("#",""), bh = b.replace("#","");
  const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
  const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
  const rr = Math.round(ar + (br-ar)*t);
  const rg = Math.round(ag + (bg-ag)*t);
  const rb = Math.round(ab + (bb-ab)*t);
  return `#${rr.toString(16).padStart(2,"0")}${rg.toString(16).padStart(2,"0")}${rb.toString(16).padStart(2,"0")}`;
}

/**
 * Плавные параметры освещения — интерполяция между текущим и следующим периодом.
 * Переход начинается за 45 минут до конца периода.
 */
export function getSmoothLighting() {
  const wt      = game.time?.worldTime ?? 0;
  const totalMin = Math.floor((wt % 86400) / 60); // минуты с начала дня
  const hour     = Math.floor(totalMin / 60);
  const minute   = totalMin % 60;

  const curIdx  = TIME_PERIODS.findIndex(p => hour >= p.from && hour < p.to);
  const cur     = TIME_PERIODS[curIdx < 0 ? TIME_PERIODS.length-1 : curIdx];
  const nextIdx = (curIdx + 1) % TIME_PERIODS.length;
  const next    = TIME_PERIODS[nextIdx];

  // Сколько минут осталось в текущем периоде
  const periodEndHour = next.from === 0 ? 24 : next.from;
  const periodLenMin  = (periodEndHour - cur.from) * 60;
  const elapsedMin    = (hour - cur.from) * 60 + minute;
  const remainMin     = periodLenMin - elapsedMin;

  // Начинаем переход за 45 минут до конца периода
  const BLEND_MIN = 45;
  let t = 0;
  if (remainMin <= BLEND_MIN) {
    t = 1 - (remainMin / BLEND_MIN); // 0..1
    t = t * t * (3 - 2*t); // smoothstep — убирает рывки на концах
  }

  return {
    darkness:    cur.darkness    + (next.darkness    - cur.darkness)    * t,
    tint:        lerpHex(cur.tint, next.tint, t),
    globalLight: t < 0.5 ? cur.globalLight : next.globalLight,
    vision:      Math.round(cur.vision + (next.vision - cur.vision) * t),
    period:      cur,
    blendT:      t,
  };
}

/** Получить текущую погоду (из настроек) */
export function getCurrentWeather() {
  const id = game.settings?.get?.("iron-hills-system", "currentWeather") ?? "clear";
  return WEATHER_PRESETS[id] ?? WEATHER_PRESETS.clear;
}

/** Получить модификатор к навыку от погоды */
export function getWeatherSkillMod(skillKey) {
  const w = getCurrentWeather();
  return Number(w.effects?.[skillKey] ?? 0);
}

/** Получить множитель движения от погоды */
export function getWeatherMovementMult() {
  return Number(getCurrentWeather().movementMult ?? 1.0);
}

/** Получить итоговую видимость с учётом времени и погоды */
export function getEffectiveVision() {
  const hour    = getCurrentHour();
  const period  = getTimePeriod(hour);
  const weather = getCurrentWeather();
  return Math.max(1, period.vision - (weather.visionPenalty ?? 0));
}

// ── Применение освещения к сцене ─────────────────────────────

export async function applyLightingToScene(scene) {
  if (!scene || !game.user?.isGM) return;

  const smooth  = getSmoothLighting();
  const weather = getCurrentWeather();

  // Темнота с учётом погоды + плавного перехода
  const weatherDarkness = weather.darknessBonus ?? 0;
  const darkness = Math.min(1, smooth.darkness + weatherDarkness);

  await scene.update({
    darkness,
    globalLight: true,            // всегда включён — темноту регулируем через darkness
    globalLightThreshold: 1.0,   // globalLight работает при любом уровне темноты
  });

  console.log(
    `Iron Hills | ${smooth.period.icon} ${smooth.period.name} `+
    `darkness=${Math.round(darkness*100)}% погода:${weather.icon}`
  );
}

/** Применить погодный эффект Foundry к сцене */
export async function applyWeatherEffect(scene, weatherId) {
  if (!scene || !game.user?.isGM) return;
  const preset = WEATHER_PRESETS[weatherId] ?? WEATHER_PRESETS.clear;

  // Foundry weather
  if (preset.foundryWeather) {
    await scene.update({ weather: preset.foundryWeather });
  } else {
    await scene.update({ weather: "" });
  }
}

// ── Смена погоды ─────────────────────────────────────────────

export async function setWeather(weatherId) {
  if (!game.user?.isGM) return;
  const preset = WEATHER_PRESETS[weatherId];
  if (!preset) return;

  await game.settings?.set?.("iron-hills-system", "currentWeather", weatherId);

  const scene = canvas?.scene;
  if (scene) await applyWeatherEffect(scene, weatherId);

  // Chat сообщение
  await ChatMessage.create({
    content: `<div style="padding:6px;font-family:var(--font-primary)">
      ${preset.icon} <b>Погода меняется: ${preset.label}</b><br>
      <span style="color:#6a7d99;font-size:11px">${preset.desc}</span>
    </div>`
  });

  Hooks.callAll("ironHillsWeatherChanged", preset);
}

/** Случайная смена погоды (с учётом текущей) */
export function rollWeather() {
  const cur = getCurrentWeather().id;
  // Матрица вероятностей смены погоды
  const transitions = {
    clear:    ["clear","clear","clear","rain","wind","fog"],
    rain:     ["rain","rain","storm","clear","fog"],
    storm:    ["storm","rain","rain","clear"],
    fog:      ["fog","fog","clear","rain"],
    blizzard: ["blizzard","blizzard","snow","clear"],
    wind:     ["wind","clear","rain","storm"],
    snow:     ["snow","blizzard","clear","clear"],
  };
  const options = transitions[cur] ?? ["clear"];
  return options[Math.floor(Math.random() * options.length)];
}
