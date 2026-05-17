/**
 * Iron Hills — NPC Sheet
 * Лист для NPC и монстров.
 */
import { SKILL_GROUPS } from "../constants/skills.mjs";
import { MONSTER_BESTIARY } from "../constants/monster-bestiary.mjs";
import { lootTableKeys } from "../services/wilderness-service.mjs";

class IronHillsNpcSheet extends ActorSheet {

  constructor(...args) {
    super(...args);
    this._activeTab = "stats";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:        ["iron-hills", "npc-sheet"],
      width:          560,
      height:         600,
      resizable:      true,
    });
  }




  _getFormData() {
    const form = this.element[0]?.querySelector(".window-content form")
               ?? this.element[0]?.querySelector("form");
    return form ? new FormDataExtended(form, { editors: this.editors ?? {} }) : null;
  }

  async _onChangeInput(event) {
    const fd = this._getFormData();
    if (!fd) return;
    await this.actor.update(fd.object);
  }

  async _onSubmit(event, options = {}) {
    if (event) event.preventDefault();
    const fd = this._getFormData();
    if (!fd) return {};
    await this.actor.update(fd.object);
    if (options.closeOnSubmit) this.close();
    return fd.object;
  }

  get template() {
    return "systems/iron-hills-system/templates/actor/npc-sheet.hbs";
  }

  async getData() {
    const ctx  = await super.getData();
    const a    = this.actor;
    const s    = a.system;

    ctx.isCreature = a.type === "monster";
    ctx.showMonsterLootUi = a.type === "monster";
    ctx.showNpcObyskUi = a.type === "npc";
    ctx.activeTab  = this._activeTab ?? "stats";

    // Навыки с нулём не показываем — только заполненные
    const skillGroups = SKILL_GROUPS.map(g => ({
      ...g,
      skills: g.skills.map(sk => ({
        ...sk,
        value: Number(s.skills?.[sk.key]?.value ?? 0),
        exp:   Number(s.skills?.[sk.key]?.exp   ?? 0),
      })).filter(sk => sk.value > 0)
    })).filter(g => g.skills.length > 0);

    ctx.skillGroups = skillGroups;

    ctx.isGM = !!game.user?.isGM;
    ctx.monsterLootPoolKeys = ctx.showMonsterLootUi ? lootTableKeys().sort() : [];

    // HP части тела
    const hp = s.resources?.hp ?? {};
    const PART_LABELS = {
      head:"Голова", torso:"Торс", abdomen:"Живот",
      leftArm:"Л. рука", rightArm:"П. рука",
      leftLeg:"Л. нога", rightLeg:"П. нога"
    };
    ctx.bodyParts = Object.entries(PART_LABELS).map(([key, label]) => ({
      key, label,
      value: Number(hp[key]?.value ?? 0),
      max:   Number(hp[key]?.max   ?? 0),
      pct:   hp[key]?.max ? Math.round((hp[key].value / hp[key].max) * 100) : 0,
    }));

    // Ресурсы
    ctx.energy = s.resources?.energy ?? { value:10, max:10, baseMax:10 };
    ctx.mana   = s.resources?.mana   ?? { value:5,  max:5  };

    // Снаряжение
    ctx.items  = a.items.map(i => ({
      id:    i.id,
      name:  i.name,
      img:   i.img,
      type:  i.type,
    }));

    ctx.allowPickpocketEnabled = s.info?.allowPickpocket !== false;

    ctx.monsterBestiaryCanon = "";
    ctx.monsterLootGmWarning = "";
    if (a.type === "monster") {
      const bid = String(s.info?.bestiaryId ?? "").trim();
      const canon = bid && MONSTER_BESTIARY[bid] ? MONSTER_BESTIARY[bid] : null;
      if (canon?.lootPool) ctx.monsterBestiaryCanon = String(canon.lootPool);
      const lp = String(s.info?.lootPool ?? "").trim();
      if (
        game.user?.isGM &&
        canon?.lootPool &&
        lp &&
        lp !== canon.lootPool
      ) {
        ctx.monsterLootGmWarning =
          `На листе пул «${lp}», в бестиарии для «${bid}» — «${canon.lootPool}». ` +
          "При разделке используются встроенные предметы с шансом; они пересоздаются синхром компендиума.";
      }
    }

    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Сохранение — select и checkbox мгновенно, text/number при blur
    const saveAll = async () => {
      const form = html[0]?.querySelector("form");
      if (!form) return;
      try {
        const fd = new FormDataExtended(form, { editors: this.editors ?? {} });
        await this.actor.update(fd.object);
      } catch(e) { console.error("IronHills NPC | save:", e); }
    };
    html.find("select, input[type='checkbox']").on("change", saveAll);
    html.find("input[type='text'], input[type='number'], textarea").on("blur", saveAll);
    html.find("[data-save-npc]").on("click", async () => { await saveAll(); ui.notifications.info("Сохранено"); });

    // Вкладки — переключаем через CSS без ре-рендера
    const showTab = (tab) => {
      this._activeTab = tab;
      // Таб-кнопки
      html.find(".ih-npc-tab").removeClass("is-active");
      html.find(`.ih-npc-tab[data-tab="${tab}"]`).addClass("is-active");
      // Панели
      html.find(".ih-npc-tab-panel").addClass("ih-hidden");
      html.find(`.ih-npc-tab-panel[data-panel="${tab}"]`).removeClass("ih-hidden");
    };
    // Начальное состояние
    showTab(this._activeTab ?? "stats");
    // Клик
    html.find(".ih-npc-tab[data-tab]").on("click", e => {
      e.preventDefault();
      showTab(e.currentTarget.dataset.tab);
    });

    // Открыть предмет
    html.find("[data-item-id]").on("click", e => {
      const item = this.actor.items.get(e.currentTarget.dataset.itemId);
      item?.sheet?.render(true);
    });

    // Удалить предмет
    html.find("[data-delete-item]").on("click", async e => {
      if (!game.user?.isGM) return;
      const item = this.actor.items.get(e.currentTarget.dataset.itemId);
      await item?.delete();
    });

    // Добавить навык
    html.find("[data-add-skill]").on("click", async () => {
      if (!game.user?.isGM) return;
      // Простой диалог добавления навыка
      const allSkills = SKILL_GROUPS.flatMap(g => g.skills);
      const buttons   = {};
      for (const sk of allSkills) {
        buttons[sk.key] = { label: sk.label, callback: () => sk.key };
      }
      const key = await Dialog.wait({ title:"Добавить навык", buttons, default: allSkills[0].key });
      if (!key) return;
      await this.actor.update({ [`system.skills.${key}.value`]: 1 });
    });
  }
}

export { IronHillsNpcSheet };
