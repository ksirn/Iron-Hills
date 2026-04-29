/**
 * Iron Hills — Spell Cast App
 * Диалог выбора и применения заклинания.
 */
import {
  SPELLS, SPELLS_BY_SCHOOL, SPELL_SCHOOLS, getAvailableSpells
} from "../constants/spells-catalog.mjs";

class IronHillsSpellCastApp extends Application {

  constructor(actor, targets, options = {}) {
    super(options);
    this._actor    = actor;
    this._targets  = targets;
    this._resolve  = null;
    this._school   = null; // фильтр по школе
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "spell-cast"],
      width:     520,
      height:    540,
      resizable: false,
      title:     "✨ Заклинания",
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/spell-cast.hbs";
  }

  static async choose(actor, targets) {
    return new Promise(resolve => {
      const app = new IronHillsSpellCastApp(actor, targets);
      app._resolve = resolve;
      app.render(true);
    });
  }

  async getData() {
    const actor      = this._actor;
    const mana       = actor.system?.resources?.mana;
    const manaCur    = Number(mana?.value ?? 0);
    const manaMax    = Number(mana?.max   ?? 0);
    const magicSkill = Number(actor.system?.skills?.magic?.value
                           ?? actor.system?.skills?.sorcery?.value ?? 0);

    // Все заклинания из предметов персонажа
    const knownSpells = actor.items?.filter(i => i.type === "spell") ?? [];
    const knownIds    = new Set(knownSpells.map(i => i.system?.spellId ?? i.name));

    // Группируем по школам
    const schools = Object.values(SPELL_SCHOOLS).map(school => {
      const spells = (SPELLS_BY_SCHOOL[school.id] ?? []).map(spell => {
        const known    = knownIds.has(spell.id);
        const hasRank  = spell.rank <= magicSkill;
        const hasMana  = spell.manaCost <= manaCur;
        const locked   = !known ? "unknown"
                       : !hasRank ? `Нужен навык ${spell.rank}`
                       : !hasMana ? `Нужно ${spell.manaCost} маны`
                       : null;
        return { ...spell, locked, available: !locked };
      });
      const hasAny = spells.some(s => s.available || s.locked !== "unknown");
      return { ...school, spells, hasAny };
    }).filter(s => s.hasAny);

    // Фильтр по школе
    const filtered = this._school
      ? schools.filter(s => s.id === this._school)
      : schools;

    return {
      actorName: actor.name,
      manaCur, manaMax, magicSkill,
      schools: filtered,
      allSchools: Object.values(SPELL_SCHOOLS),
      activeSchool: this._school,
      targets: this._targets.map(t => ({ id:t.id, name:t.name })),
      AOE_LABELS: {
        blast:"💥 Все в зоне", pierce:"➡ Первый на пути",
        sweep:"↔ Слева направо", shards:"💎 Случайные N",
        chain:"⛓ Цепочка", nova:"🌟 Вокруг кастера"
      },
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Фильтр по школе
    html.find("[data-school-filter]").on("click", e => {
      const s = e.currentTarget.dataset.schoolFilter;
      this._school = this._school === s ? null : s;
      this.render(false);
    });

    // Выбор заклинания
    html.find("[data-cast-spell]").on("click", e => {
      const id = e.currentTarget.dataset.castSpell;
      const spell = SPELLS[id];
      if (!spell) return;
      this._resolve?.({ spell });
      this.close();
    });

    // Отмена
    html.find("[data-cancel]").on("click", () => {
      this._resolve?.(null);
      this.close();
    });
  }

  async close(options) {
    this._resolve?.(null);
    this._resolve = null;
    return super.close(options);
  }
}

export { IronHillsSpellCastApp };
