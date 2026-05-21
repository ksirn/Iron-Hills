/**
 * Iron Hills — Spell Cast App
 * Диалог выбора и применения заклинания.
 */
import {
  SPELLS, SPELLS_BY_SCHOOL, SPELL_SCHOOLS, getAvailableSpells
} from "../constants/spells-catalog.mjs";
import { getTargetPartLabel } from "../services/actor-state-service.mjs";
import {
  normalizeAoeConfig,
  normalizeAoeTargetZone,
  resolveAoeFriendlyFire,
  resolveAoeFriendlyFireMode,
} from "../services/aoe-policy-service.mjs";

const BODY_ZONE_KEYS = Object.freeze(["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"]);
const RANDOM_ZONE_OPTION = Object.freeze({ key: "", label: "Случайная зона" });
const BODY_ZONE_OPTIONS = Object.freeze([
  RANDOM_ZONE_OPTION,
  ...BODY_ZONE_KEYS.map(key => ({ key, label: getTargetPartLabel(key) }))
]);

const AOE_LABELS = Object.freeze({
  blast: "💥 Все в зоне",
  pierce: "➡ Первый на пути",
  sweep: "↔ Слева направо",
  shards: "💎 Случайные N",
  chain: "⛓ Цепочка",
  nova: "🌟 Вокруг кастера"
});

function getSpellTargetZone(spell) {
  return normalizeAoeTargetZone(spell?.targetZone)
    || normalizeAoeTargetZone(spell?.targetPart)
    || normalizeAoeTargetZone(spell?.effect?.targetZone)
    || normalizeAoeTargetZone(spell?.effect?.targetPart)
    || "";
}

function getZoneOptions(selectedKey = "") {
  const selectedZone = normalizeAoeTargetZone(selectedKey) ?? "";
  return BODY_ZONE_OPTIONS.map(option => ({
    ...option,
    selected: option.key === selectedZone
  }));
}

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
        const aoeConfig = spell.aoe
          ? normalizeAoeConfig(spell.aoe, { distance: 1 })
          : null;
        const known    = knownIds.has(spell.id);
        const hasRank  = spell.rank <= magicSkill;
        const hasMana  = spell.manaCost <= manaCur;
        const locked   = !known ? "unknown"
                       : !hasRank ? `Нужен навык ${spell.rank}`
                       : !hasMana ? `Нужно ${spell.manaCost} маны`
                       : null;
        const targetZone = getSpellTargetZone(spell);
        const canChooseTargetZone = Number(spell.damage ?? 0) > 0;
        const canToggleFriendlyFire = Boolean(aoeConfig);
        const friendlyFireMode = resolveAoeFriendlyFireMode(
          spell.aoe?.friendlyFireMode,
          spell.friendlyFireMode,
          spell.aoe?.friendlyFire,
          spell.friendlyFire,
          "off",
        );
        const friendlyFire = Boolean(aoeConfig?.friendlyFire ?? resolveAoeFriendlyFire(spell.friendlyFire, false));
        return {
          ...spell,
          aoe: aoeConfig,
          locked,
          available: !locked,
          targetZone,
          friendlyFire,
          friendlyFireMode,
          canChooseTargetZone,
          canToggleFriendlyFire,
          bodyZones: canChooseTargetZone ? getZoneOptions(targetZone) : [],
          aoeLabel: aoeConfig ? (AOE_LABELS[aoeConfig.type] ?? aoeConfig.type) : "",
        };
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
      AOE_LABELS,
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
    html.find("[data-spell-option]").on("click change", e => e.stopPropagation());

    html.find("[data-cast-spell]").on("click", e => {
      const id = e.currentTarget.dataset.castSpell;
      const spell = SPELLS[id];
      if (!spell) return;
      if (e.currentTarget.classList.contains("is-locked")) return;

      const chosen = foundry.utils.deepClone(spell);
      const zoneInput = e.currentTarget.querySelector("[data-spell-target-zone]");
      const friendlyFireInput = e.currentTarget.querySelector("[data-spell-friendly-fire]");
      const targetZone = zoneInput
        ? (normalizeAoeTargetZone(zoneInput.value) ?? "")
        : getSpellTargetZone(chosen);

      if (targetZone) {
        chosen.targetZone = targetZone;
        chosen.targetPart = chosen.targetPart ?? targetZone;
        if (chosen.effect && typeof chosen.effect === "object") {
          chosen.effect = { ...chosen.effect, targetZone };
        }
      } else if (zoneInput) {
        delete chosen.targetZone;
        delete chosen.targetPart;
        if (chosen.effect && typeof chosen.effect === "object") {
          chosen.effect = { ...chosen.effect };
          delete chosen.effect.targetZone;
          delete chosen.effect.targetPart;
        }
      }
      if (friendlyFireInput) {
        const checked = Boolean(friendlyFireInput.checked);
        const defaultMode = friendlyFireInput.dataset.spellFriendlyFireMode ?? "off";
        const defaultChecked = friendlyFireInput.dataset.spellFriendlyFireDefault === "true";
        const friendlyFireMode = !checked
          ? (defaultMode === "auto" && !defaultChecked ? "auto" : "off")
          : (defaultMode === "auto" && defaultChecked ? "auto" : "on");
        chosen.friendlyFire = checked;
        chosen.friendlyFireMode = friendlyFireMode;
        if (chosen.aoe && typeof chosen.aoe === "object") {
          chosen.aoe = { ...chosen.aoe, friendlyFireMode };
        }
      } else if (chosen.friendlyFire === undefined) {
        chosen.friendlyFire = false;
      }

      this._resolve?.({ spell: chosen });
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
