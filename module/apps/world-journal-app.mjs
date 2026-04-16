/**
 * Iron Hills — World Journal App
 * Сводка событий мира для GM и игроков.
 * GM видит полный лог. Игроки — "слухи" (частичная информация).
 */

// Шаблоны перефразирования для слухов игроков
const RUMOR_TEMPLATES = {
  "bandit-surge": [
    "Говорят, на дороге к {location} стало небезопасно.",
    "Торговцы жалуются — кто-то разбойничает между {location} и округой.",
    "В таверне шептались, что у {location} видели подозрительных людей.",
  ],
  "militia-order": [
    "Стражники у {location} выглядят настороженно — что-то случилось.",
    "Говорят, местный гарнизон {location} усилили.",
    "Видел как стража строем шла к южным воротам {location}.",
  ],
  "merchant-boom": [
    "Купцы в {location} довольны — торговля пошла хорошо.",
    "Цены в {location} немного снизились, народ доволен.",
    "В {location} стало больше торговых телег чем обычно.",
  ],
  "blight": [
    "Говорят, урожай в окрестностях {location} в этом году плохой.",
    "Еда в {location} подорожала — что-то не так с поставками.",
    "Фермеры жалуются на неурожай рядом с {location}.",
  ],
  "road-damage": [
    "Дорога к {location} в плохом состоянии — телеги застревают.",
    "Говорят, мост у {location} требует починки.",
    "Путь к {location} занял больше времени чем обычно.",
  ],
  "migrant-wave": [
    "В {location} прибыло много незнакомых лиц.",
    "Говорят, народ бежит из соседних мест в {location}.",
    "Видел целую семью с пожитками — идут в {location}.",
  ],
  "caravanArrived": [
    "Торговый обоз добрался до {location} — рынок ожил.",
    "Слышал, в {location} пришёл большой торговый отряд.",
    "В {location} разгружают телеги у рыночной площади.",
  ],
  "poiSpawned": [
    "Охотник говорил о каком-то лагере неподалёку от {location}.",
    "Дровосеки заметили следы в лесу рядом с {location}.",
    "Пастух рассказывал — видел огни ночью у {location}.",
  ],
  "default": [
    "Что-то происходит в {location}, но подробностей не известно.",
    "Слухи о {location} ходят разные.",
    "В {location} было что-то необычное на этой неделе.",
  ],
};

function pickRumor(eventType, locationName) {
  const templates = RUMOR_TEMPLATES[eventType] ?? RUMOR_TEMPLATES.default;
  const tpl = templates[Math.floor(Math.random() * templates.length)];
  return tpl.replace(/{location}/g, locationName || "округе");
}

function formatHours(h) {
  const days  = Math.floor(h / 24);
  const hours = h % 24;
  return days > 0 ? `День ${days + 1}, ${hours}ч` : `${h}ч`;
}

class IronHillsWorldJournalApp extends Application {

  constructor(options = {}) {
    super(options);
    this._tab    = "summary";  // summary | gm | rumors
    this._filter = "all";      // all | location
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "world-journal"],
      width:     700,
      height:    580,
      resizable: true,
      title:     "📜 Дневник мира"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/world-journal.hbs";
  }

  async getData() {
    const isGM = game.user?.isGM ?? false;

    // Собираем события из всех поселений
    const settlements = (game.actors ?? []).filter(a => a.type === "settlement");
    const allEvents   = [];
    const allRumors   = [];

    for (const s of settlements) {
      const name = s.name;
      const hist = s.system?.history ?? {};

      // Региональные события (кризисы)
      for (const ev of (hist.regionalEvents ?? [])) {
        if (!ev) continue;
        const text = typeof ev === "string" ? ev : ev.text ?? "";
        const hour = typeof ev === "object" ? (ev.hour ?? 0) : 0;
        const type = typeof ev === "object" ? (ev.type ?? "default") : "default";

        allEvents.push({
          hour,
          timeLabel: formatHours(hour),
          location:  name,
          text,
          type,
          severity:  ev.severity ?? "normal",
          isGmOnly:  false,
        });

        // Генерируем слух для игроков
        allRumors.push({
          hour,
          timeLabel:  formatHours(hour),
          location:   name,
          text:       pickRumor(type, name),
          type,
          discovered: Math.random() > 0.4, // 60% шанс что игроки слышали
        });
      }

      // Обычные события поселения
      for (const ev of (hist.events ?? [])) {
        if (!ev) continue;
        const text = typeof ev === "string" ? ev : ev.text ?? "";
        const hour = typeof ev === "object" ? (ev.hour ?? 0) : 0;
        allEvents.push({
          hour, timeLabel: formatHours(hour),
          location: name, text,
          type: "settlement", severity: "normal", isGmOnly: true,
        });
      }
    }

    // Сортируем по времени
    allEvents.sort((a, b) => a.hour - b.hour);
    allRumors.sort((a, b) => a.hour - b.hour);

    // Сводка по локациям
    const locationSummary = settlements.map(s => {
      const econ   = s.system?.economy ?? {};
      const info   = s.system?.info   ?? {};
      const sim    = s.system?.regionSim ?? {};
      const crisis = sim.activeCrisis;

      return {
        name:       s.name,
        tier:       info.tier ?? 1,
        prosperity: info.prosperity ?? 5,
        danger:     info.danger ?? 5,
        supply:     info.supply ?? 5,
        crisis:     crisis || null,
        priceFactor: econ.currentPriceFactor ? Number(econ.currentPriceFactor).toFixed(2) : "1.00",
        priceLabel: (econ.currentPriceFactor ?? 1) > 1.1 ? "📈" : (econ.currentPriceFactor ?? 1) < 0.9 ? "📉" : "⚖",
        rumors:     (s.system?.history?.rumors ?? []).slice(-3),
        stability:  sim.stability ?? 5,
      };
    });

    // Фильтр для игроков — только обнаруженные слухи
    const playerRumors = allRumors.filter(r => r.discovered);

    return {
      isGM,
      tab:      this._tab,
      // GM данные
      allEvents,
      locationSummary,
      hasEvents:     allEvents.length > 0,
      hasLocations:  locationSummary.length > 0,
      // Игроцкие данные
      playerRumors,
      hasRumors:     playerRumors.length > 0,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-journal-tab]").on("click", e => {
      this._tab = e.currentTarget.dataset.journalTab;
      this.render(false);
    });

    // GM — запустить недельный тик
    html.find("[data-run-week]").on("click", async () => {
      if (!game.user?.isGM) return;
      ui.notifications.info("Запускаем симуляцию недели...");
      try {
        const { runWorldWeek } = await import("../world-sim-tools.mjs");
        await runWorldWeek();
        this.render(false);
        ui.notifications.info("Симуляция недели завершена.");
      } catch(e) {
        console.error("World sim error:", e);
        ui.notifications.error("Ошибка симуляции: " + e.message);
      }
    });

    // GM — запустить тик одного поселения
    html.find("[data-tick-settlement]").on("click", async e => {
      if (!game.user?.isGM) return;
      const name = e.currentTarget.dataset.name;
      const s = (game.actors ?? []).find(a => a.type === "settlement" && a.name === name);
      if (!s) return;
      try {
        const { tickSettlement } = await import("../world-sim-tools.mjs");
        await tickSettlement(s);
        this.render(false);
      } catch(err) {
        console.error(err);
      }
    });

    // GM — пополнить торговцев
    html.find("[data-restock-all]").on("click", async () => {
      if (!game.user?.isGM) return;
      try {
        const { restockMerchant } = await import("../world-sim-tools.mjs");
        const merchants = (game.actors ?? []).filter(a => a.type === "merchant");
        for (const m of merchants) await restockMerchant(m);
        ui.notifications.info(`Пополнено ${merchants.length} торговцев.`);
        this.render(false);
      } catch(e) {
        ui.notifications.error("Ошибка: " + e.message);
      }
    });

    // GM — генерировать квест для поселения
    html.find("[data-gen-quest]").on("click", async e => {
      if (!game.user?.isGM) return;
      const name = e.currentTarget.dataset.name;
      const settlement = (game.actors ?? []).find(a => a.type === "settlement" && a.name === name);
      if (!settlement) return;

      try {
        const { generateQuestForSettlement } = await import("../services/world-content-service.mjs");
        const q = generateQuestForSettlement(settlement);

        // Создаём актора-квест
        await Actor.create({
          name:   q.title,
          type:   "quest",
          system: {
            description: q.description,
            reward:      q.reward,
            difficulty:  q.difficulty,
            type:        q.type,
            location:    q.location,
            status:      "active",
            generated:   q.generated,
          }
        });

        ui.notifications.info(`Квест "${q.title}" создан для ${name}.`);
      } catch(err) {
        console.error(err);
        ui.notifications.error("Ошибка генерации квеста: " + err.message);
      }
    });
  }
}

export { IronHillsWorldJournalApp };
