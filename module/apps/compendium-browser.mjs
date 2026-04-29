/**
 * Iron Hills — Compendium Browser
 * Кастомный браузер компендиумов с фильтрами по тиру и типу.
 * Открывается через game.ironHills.openCompendiumBrowser()
 */

const PACK_CONFIGS = [
  { packName:"ih-weapons",   label:"Оружие",      icon:"⚔",  type:"Item",  color:"#f87171" },
  { packName:"ih-armor",     label:"Броня",        icon:"🛡",  type:"Item",  color:"#60a5fa" },
  { packName:"ih-materials", label:"Материалы",   icon:"⛏",  type:"Item",  color:"#a78bfa" },
  { packName:"ih-potions",   label:"Зелья",        icon:"⚗",  type:"Item",  color:"#4ade80" },
  { packName:"ih-food",      label:"Еда",          icon:"🍖",  type:"Item",  color:"#86efac" },
  { packName:"ih-tools",     label:"Инструменты", icon:"🔨",  type:"Item",  color:"#facc15" },
  { packName:"ih-belts",     label:"Пояса",        icon:"🔗",  type:"Item",  color:"#fb923c" },
  { packName:"ih-attachments", label:"Крепления",    icon:"🔩",  type:"Item",  color:"#94a3b8" },
  { packName:"ih-backpacks", label:"Рюкзаки",      icon:"🎒",  type:"Item",  color:"#34d399" },
  { packName:"ih-spells",    label:"Заклинания",   icon:"✨",  type:"Item",  color:"#c084fc" },
  { packName:"ih-npc",       label:"NPC",          icon:"👤",  type:"Actor", color:"#a8b8d0" },
  { packName:"ih-gods",      label:"Пантеон",      icon:"✦",  type:"Actor", color:"#c4b5fd" },
];

class IronHillsCompendiumBrowser extends Application {

  constructor(options = {}) {
    super(options);
    this._activePack = "ih-weapons";
    this._filterTier = 0;     // 0 = все
    this._search     = "";
    this._items      = [];
    this._loading    = false;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "compendium-browser"],
      width:     760,
      height:    580,
      resizable: true,
      title:     "📚 Справочник Iron Hills"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/compendium-browser.hbs";
  }

  async _loadPack(packName) {
    this._loading = true;
    this._items   = [];
    const pack    = game.packs.get(`iron-hills-system.${packName}`);
    if (!pack) { this._loading = false; return; }
    const docs    = await pack.getDocuments();
    this._items   = docs;
    this._loading = false;
  }

  async getData() {
    if (this._items.length === 0 && !this._loading) {
      await this._loadPack(this._activePack);
    }

    const cfg = PACK_CONFIGS.find(p => p.packName === this._activePack);

    // Фильтрация
    let items = this._items;
    if (this._filterTier > 0) {
      items = items.filter(i => {
        const t = i.system?.tier ?? i.system?.info?.tier ?? 1;
        return Number(t) === this._filterTier;
      });
    }
    if (this._search.trim()) {
      const q = this._search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }

    // Группируем по тирам
    const byTier = {};
    for (const item of items) {
      const tier = item.system?.tier ?? item.system?.info?.tier ?? 1;
      const t    = Number(tier);
      if (!byTier[t]) byTier[t] = [];
      byTier[t].push(this._mapItem(item, cfg));
    }
    const tiers = Object.keys(byTier).sort((a,b) => a-b).map(t => ({
      tier:  Number(t),
      label: `Ступень ${t}`,
      items: byTier[t]
    }));

    // Все тиры для фильтра
    const allTiers = [...new Set(this._items.map(i =>
      Number(i.system?.tier ?? i.system?.info?.tier ?? 1)
    ))].sort((a,b)=>a-b);

    return {
      isGM:       game.user?.isGM ?? false,
      packs:      PACK_CONFIGS,
      activePack: this._activePack,
      activeCfg:  cfg,
      tiers,
      allTiers,
      filterTier: this._filterTier,
      search:     this._search,
      loading:    this._loading,
      isEmpty:    tiers.length === 0 && !this._loading,
    };
  }

  _mapItem(doc, cfg) {
    const s    = doc.system ?? {};
    const tier = s.tier ?? s.info?.tier ?? 1;
    const details = [];

    if (doc.type === "weapon") {
      details.push(`⚔ Урон: ${s.damage ?? "—"}`);
      details.push(`🎯 Навык: ${s.skill ?? "—"}`);
      details.push(`⚡ Энергия: ${s.energyCost ?? "—"}`);
      if (s.twoHanded) details.push("✋ Двуручное");
    } else if (doc.type === "armor") {
      details.push(`🛡 Физ: ${s.protection?.physical ?? 0}`);
      if (s.protection?.magical) details.push(`✦ Маг: ${s.protection.magical}`);
      details.push(`📍 Слот: ${s.slot ?? "—"}`);
    } else if (doc.type === "potion") {
      details.push(`💊 Эффект: ${s.effect ?? "—"}`);
      details.push(`💪 Сила: ${s.power ?? "—"}`);
    } else if (doc.type === "food") {
      details.push(`🍖 Сытость: +${s.satiety ?? 0}`);
      details.push(`💧 Жажда: +${s.hydration ?? 0}`);
    } else if (doc.type === "material") {
      details.push(`📦 Кат: ${s.category ?? "—"}`);
      details.push(`⚖ Вес: ${s.weight ?? "—"}`);
    } else if (doc.type === "tool") {
      details.push(`🔧 Тип: ${s.craftType ?? "—"}`);
    } else if (doc.type === "npc" || doc.type === "monster") {
      details.push(`⚡ Энергия: ${s.resources?.energy?.max ?? "—"}`);
      details.push(`✦ Мана: ${s.resources?.mana?.max ?? "—"}`);
      const role = s.info?.role ?? "";
      if (role) details.push(`👤 ${role}`);
    }

    const value = s.value ?? s.info?.value ?? 0;
    if (value) {
      const fmt = game.ironHills?.formatCurrency?.(value) ?? `${value} мед.`;
      details.push(`🪙 ${fmt}`);
    }

    return {
      id:      doc.id,
      uuid:    doc.uuid,
      name:    doc.name,
      img:     doc.img ?? "icons/svg/mystery-man.svg",
      tier,
      tierStars: "★".repeat(Math.min(10, tier)),
      details,
      type:    doc.type,
      packName: this._activePack,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Переключение пака
    html.find("[data-pack]").on("click", async e => {
      const pack = e.currentTarget.dataset.pack;
      if (pack === this._activePack) return;
      this._activePack = pack;
      this._filterTier = 0;
      this._search     = "";
      this._items      = [];
      await this._loadPack(pack);
      this.render(false);
    });

    // Фильтр по тиру
    html.find("[data-tier-filter]").on("click", e => {
      const t = Number(e.currentTarget.dataset.tierFilter);
      this._filterTier = (this._filterTier === t) ? 0 : t; // тогл
      this.render(false);
    });

    // Поиск
    html.find("[data-cb-search]").on("input", e => {
      this._search = e.currentTarget.value;
      this.render(false);
    });

    // Клик по предмету — открыть лист или импортировать
    html.find("[data-item-uuid]").on("click", async e => {
      const uuid = e.currentTarget.dataset.itemUuid;
      const doc  = await fromUuid(uuid);
      doc?.sheet?.render(true);
    });

    // Drag-and-drop на сцену/инвентарь
    html.find("[data-item-uuid]").each((_, el) => {
      el.setAttribute("draggable", "true");
      el.addEventListener("dragstart", e => {
        const uuid = el.dataset.itemUuid;
        e.dataTransfer.setData("text/plain", JSON.stringify({
          type: "Item", uuid
        }));
      });
    });

    // Создать новый предмет в компендиуме
    html.find("[data-new-item]").on("click", async () => {
      if (!game.user?.isGM) return;
      const cfg  = PACK_CONFIGS.find(p => p.packName === this._activePack);
      const pack = game.packs.get(`iron-hills-system.${this._activePack}`);
      if (!pack) return;

      const isActor = cfg?.type === "Actor";
      const cls     = pack.documentClass;
      const newDoc  = await cls.create({
        name:   isActor ? "Новый NPC"        : "Новый предмет",
        type:   isActor ? (this._activePack === "ih-gods" ? "god" : "npc") : "material",
        system: { tier: 1 },
      }, { pack: `iron-hills-system.${this._activePack}` });

      // Открыть лист нового предмета
      const doc = await fromUuid(newDoc.uuid);
      doc?.sheet?.render(true);

      // Обновить список
      this._items = [];
      await this._loadPack(this._activePack);
      this.render(false);
    });

    // ── CRUD ──────────────────────────────────────────────

    // Редактировать
    html.find("[data-edit-item]").on("click", async e => {
      e.stopPropagation();
      const doc = await fromUuid(e.currentTarget.dataset.editItem);
      doc?.sheet?.render(true);
    });

    // Дублировать
    html.find("[data-dupe-item]").on("click", async e => {
      e.stopPropagation();
      if (!game.user?.isGM) return;
      const doc = await fromUuid(e.currentTarget.dataset.dupeItem);
      if (!doc) return;
      const packId = `iron-hills-system.${this._activePack}`;
      const data   = doc.toObject();
      data.name    = data.name + " (копия)";
      delete data._id;
      await doc.constructor.create(data, { pack: packId });
      this._items = [];
      await this._loadPack(this._activePack);
      this.render(false);
      ui.notifications.info(`Копия создана: ${doc.name}`);
    });

    // Удалить
    html.find("[data-del-item]").on("click", async e => {
      e.stopPropagation();
      if (!game.user?.isGM) return;
      const doc = await fromUuid(e.currentTarget.dataset.delItem);
      if (!doc) return;
      const ok = await Dialog.confirm({
        title:   "Удалить из компендиума",
        content: `<p>Удалить <b>${doc.name}</b>? Отменить нельзя.</p>`,
        defaultYes: false,
      });
      if (!ok) return;
      await doc.delete();
      this._items = [];
      await this._loadPack(this._activePack);
      this.render(false);
      ui.notifications.info(`Удалено: ${doc.name}`);
    });

    // Спавн NPC/монстра на сцену (для Actor компендиумов)
    html.find("[data-spawn-actor]").on("click", async e => {
      e.stopPropagation();
      if (!game.user?.isGM) return;
      const uuid = e.currentTarget.dataset.spawnActor;
      const doc  = await fromUuid(uuid);
      if (!doc) return;

      const scene = canvas?.scene;
      if (!scene) { ui.notifications.warn("Нет активной сцены"); return; }

      // Создаём world-актора из компендиума
      const actorData = doc.toObject();
      delete actorData._id;
      const created = await Actor.create(actorData);

      // Размещаем токен в центре view или там где курсор
      const center = canvas.stage?.pivot ?? { x: 1000, y: 1000 };
      const gs     = scene.grid?.size ?? 100;
      await scene.createEmbeddedDocuments("Token", [{
        actorId: created.id,
        x: center.x - gs/2,
        y: center.y - gs/2,
        name: created.name,
        img:  created.img,
        width: 1, height: 1,
        disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
        displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      }]);

      ui.notifications.info(`${created.name} размещён на сцене`);
    });

    // Кнопка обновить компендиумы
    html.find("[data-rebuild-packs]").on("click", async () => {
      if (!game.user?.isGM) return;
      await game.ironHills.buildCompendiums();
      this._items = [];
      await this._loadPack(this._activePack);
      this.render(false);
    });

    // Создать новый предмет в компендиуме
    html.find("[data-create-entry]").on("click", async () => {
      if (!game.user?.isGM) return;
      const cfg  = PACK_CONFIGS.find(p => p.packName === this._activePack);
      const pack = game.packs.get(`iron-hills-system.${this._activePack}`);
      if (!pack) return;

      await pack.configure({ locked: false });

      if (cfg.type === "Item") {
        // Определяем тип предмета по паку
        const typeMap = {
          "ih-weapons":"weapon", "ih-armor":"armor", "ih-materials":"material", "ih-spells":"spell",
          "ih-potions":"potion", "ih-food":"food",   "ih-tools":"tool"
        };
        const itemType = typeMap[this._activePack] ?? "material";
        const doc = await Item.create(
          { name:"Новый предмет", type:itemType, system:{ tier:1, quantity:1, weight:1, value:0 } },
          { pack:`iron-hills-system.${this._activePack}` }
        );
        doc?.sheet?.render(true);
      } else if (cfg.type === "Actor") {
        const actorType = this._activePack === "ih-gods" ? "god" : "npc";
        const doc = await Actor.create(
          { name:"Новый NPC", type:actorType },
          { pack:`iron-hills-system.${this._activePack}` }
        );
        doc?.sheet?.render(true);
      }

      this._items = [];
      await this._loadPack(this._activePack);
      this.render(false);
    });

    // Удалить предмет из компендиума
    html.find("[data-delete-entry]").on("click", async e => {
      if (!game.user?.isGM) return;
      e.stopPropagation();
      const uuid = e.currentTarget.closest("[data-item-uuid]")?.dataset.itemUuid;
      if (!uuid) return;
      const doc  = await fromUuid(uuid);
      if (!doc) return;
      const confirmed = await Dialog.confirm({
        title: "Удалить запись?",
        content:`<p>Удалить <b>${doc.name}</b> из компендиума?</p>`,
      });
      if (!confirmed) return;
      await doc.delete();
      this._items = this._items.filter(i => i.uuid !== uuid);
      this.render(false);
    });
  }
}

export { IronHillsCompendiumBrowser };
