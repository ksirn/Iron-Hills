/**
 * Iron Hills — Weather App
 * GM панель управления погодой и временем суток.
 */
import {
  WEATHER_PRESETS, TIME_PERIODS,
  getCurrentHour, getTimePeriod, getCurrentWeather,
  getEffectiveVision, setWeather, rollWeather,
  applyLightingToScene,
} from "../services/weather-service.mjs";

class IronHillsWeatherApp extends Application {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "weather-app"],
      width:     360,
      height:    "auto",
      resizable: false,
      title:     "🌤 Погода и освещение",
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/weather-app.hbs";
  }

  async getData() {
    const hour    = getCurrentHour();
    const period  = getTimePeriod(hour);
    const weather = getCurrentWeather();
    const vision  = getEffectiveVision();

    const wt       = game.time?.worldTime ?? 0;
    const totalDay = Math.floor(wt / 86400) + 1;
    const minutes  = Math.floor((wt % 3600) / 60);
    const timeStr  = `${String(hour).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;

    return {
      timeStr,
      totalDay,
      currentHour: hour,
      currentMin:  minutes,
      period,
      weather,
      vision,
      weatherPresets: Object.values(WEATHER_PRESETS),
      timePeriods:    TIME_PERIODS,
      effects: Object.entries(weather.effects ?? {}).map(([k, v]) => ({
        key: k, value: v > 0 ? `+${v}` : `${v}`
      })),
      isGM: game.user?.isGM ?? false,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Выбор погоды
    html.find("[data-weather]").on("click", async e => {
      await setWeather(e.currentTarget.dataset.weather);
      this.render(false);
    });

    // Применить освещение
    html.find("[data-apply-lighting]").on("click", async () => {
      await applyLightingToScene(canvas?.scene);
      ui.notifications.info("Освещение применено");
      this.render(false);
    });

    // Случайная погода
    html.find("[data-roll-weather]").on("click", async () => {
      await setWeather(rollWeather());
      this.render(false);
    });

    // Быстрый сдвиг (секунды)
    html.find("[data-advance-time]").on("click", async e => {
      const secs = Number(e.currentTarget.dataset.advanceTime);
      await game.time.advance(secs);
      await applyLightingToScene(canvas?.scene);
      this.render(false);
    });

    // Шаги стрелками у полей ввода
    html.find("[data-step-time]").on("click", async e => {
      const secs = Number(e.currentTarget.dataset.stepTime);
      await game.time.advance(secs);
      await applyLightingToScene(canvas?.scene);
      this.render(false);
    });

    // Установить конкретное время
    html.find("[data-set-time]").on("click", async () => {
      const day  = Math.max(1, Number(html.find("#ih-set-day").val())  || 1);
      const hour = Math.max(0, Math.min(23, Number(html.find("#ih-set-hour").val()) || 0));
      const min  = Math.max(0, Math.min(59, Number(html.find("#ih-set-min").val())  || 0));

      // Вычисляем абсолютное время в секундах
      const targetTime = (day - 1) * 86400 + hour * 3600 + min * 60;
      const current    = game.time?.worldTime ?? 0;
      const delta      = targetTime - current;

      if (delta !== 0) {
        await game.time.advance(delta);
        await applyLightingToScene(canvas?.scene);
      }
      this.render(false);
    });
  }
}

export { IronHillsWeatherApp };
