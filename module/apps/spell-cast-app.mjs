/**
 * Iron Hills — Spell Cast App
 * Диалог выбора и применения заклинания.
 */
import {
  SPELLS_BY_SCHOOL, SPELL_SCHOOLS
} from "../constants/spells-catalog.mjs";
import {
  resolveSpellSchoolSkill,
} from "../services/actor-state-service.mjs";
import {
  buildSpellChoicePayload,
  buildSpellRuntimeData,
  getSpellTargetZoneOptions,
} from "../services/spell-runtime-service.mjs";
import {
  formatAoeConfigSummary,
  formatSpellRuntimeSummary,
} from "../services/combat-presentation-service.mjs";
import { getAoeTargetZoneModeLabel } from "../services/aoe-policy-service.mjs";

function itemCollection(actor) {
  return actor?.items?.filter ? actor.items.filter(() => true) : [];
}

function cleanKey(value) {
  return String(value ?? "").trim();
}

function getItemSpellId(item) {
  return cleanKey(item?.system?.spellId ?? item?.system?.id ?? item?.name);
}

function getManaValue(actor) {
  return Number(actor?.system?.resources?.mana?.value ?? 0);
}

function getMaxMagicSkillValue(actor) {
  const skills = actor?.system?.skills ?? {};
  return Math.max(
    0,
    ...Object.values(SPELL_SCHOOLS).map(school => Number(resolveSpellSchoolSkill(actor, school.id).value ?? 0)),
    Number(skills.magic?.value ?? 0),
    Number(skills.sorcery?.value ?? 0),
  );
}

function getSchoolGroup(groups, schoolId = "") {
  const key = cleanKey(schoolId);
  if (groups.has(key)) return groups.get(key);
  const fallbackKey = key || "custom";
  if (!groups.has(fallbackKey)) {
    groups.set(fallbackKey, {
      id: fallbackKey,
      label: fallbackKey === "custom" ? "Прочее" : fallbackKey,
      icon: "✦",
      color: "#a8b8d0",
      spells: [],
      hasAny: true,
    });
  }
  return groups.get(fallbackKey);
}

function resolveSpellLock(actor, runtime, {
  isScroll = false,
  manaCur = getManaValue(actor),
} = {}) {
  const schoolSkill = resolveSpellSchoolSkill(actor, runtime.school);
  if (!schoolSkill.skill) return `Нет школы: ${schoolSkill.label || runtime.school || "?"}`;

  const rank = Number(runtime.rank ?? 1);
  if (!isScroll && Number(schoolSkill.value ?? 0) < rank) {
    return `Нужен навык ${schoolSkill.skillLabel || schoolSkill.key}: ${rank}`;
  }

  const manaCost = isScroll ? 0 : Number(runtime.manaCost ?? 0);
  if (manaCost > manaCur) return `Нужно ${manaCost} маны`;
  return null;
}

function buildSpellDialogRow({
  actor,
  source,
  runtime,
  choiceId,
  isScroll = false,
  item = null,
  manaCur = getManaValue(actor),
} = {}) {
  const locked = resolveSpellLock(actor, runtime, { isScroll, manaCur });
  const targetZoneMode = runtime.targetZoneMode ?? (runtime.targetZone ? "fixed" : "random");
  const targetZoneRequired = targetZoneMode === "aimed";
  const targetZone = runtime.targetZone ?? (targetZoneRequired ? "torso" : "");
  const canChooseTargetZone = runtime.canChooseTargetZone;
  const canToggleFriendlyFire = Boolean(runtime.aoe);
  const quantity = Number(item?.system?.quantity ?? 0);
  const aoeSummary = runtime.aoe
    ? formatAoeConfigSummary({
      ...runtime.aoe,
      friendlyFire: runtime.friendlyFire,
      friendlyFireMode: runtime.friendlyFireMode,
      targetZone: runtime.targetZone ?? runtime.attackTargetZone ?? runtime.targetPart,
      targetZoneMode: runtime.targetZoneMode,
    }, { compact: true })
    : "";

  return {
    id: choiceId,
    choiceId,
    itemId: item?.id ?? "",
    source,
    sourceLabel: isScroll ? "Свиток" : (source === "item" ? "Книга" : ""),
    quantity: isScroll && quantity > 1 ? quantity : null,
    label: runtime.label,
    desc: runtime.desc,
    rank: runtime.rank,
    aoe: runtime.aoe,
    damage: runtime.damage,
    effectType: runtime.effectType,
    manaCost: isScroll ? 0 : runtime.manaCost,
    energyCost: runtime.energyCost,
    castTime: runtime.castTime,
    locked,
    available: !locked,
    targetZone,
    targetZoneMode,
    targetZoneModeLabel: canChooseTargetZone ? getAoeTargetZoneModeLabel(targetZoneMode) : "",
    targetZoneRequired,
    friendlyFire: runtime.friendlyFire,
    friendlyFireMode: runtime.friendlyFireMode,
    canChooseTargetZone,
    canToggleFriendlyFire,
    bodyZones: canChooseTargetZone
      ? getSpellTargetZoneOptions(targetZone, {
          includeRandom: !targetZoneRequired,
          randomLabel: "Случайная зона",
        })
      : [],
    runtimeSummary: formatSpellRuntimeSummary(runtime, { includeAoe: false }),
    aoeSummary,
    aoeLabel: aoeSummary,
  };
}

class IronHillsSpellCastApp extends Application {

  constructor(actor, targets, options = {}) {
    super(options);
    this._actor    = actor;
    this._targets  = targets;
    this._resolve  = null;
    this._choices  = new Map();
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
    const magicSkill = getMaxMagicSkillValue(actor);
    const ownedItems = itemCollection(actor);
    const spellItems = ownedItems.filter(item => item.type === "spell");
    const scrollItems = ownedItems.filter(item => item.type === "scroll");
    const itemBySpellId = new Map();
    const usedSpellItemIds = new Set();
    const groups = new Map(Object.values(SPELL_SCHOOLS).map(school => [
      school.id,
      { ...school, spells: [], hasAny: false },
    ]));
    let choiceIndex = 0;
    this._choices = new Map();

    const registerChoice = (choice) => {
      const choiceId = `spell-choice-${++choiceIndex}`;
      this._choices.set(choiceId, choice);
      return choiceId;
    };

    for (const item of spellItems) {
      const spellId = getItemSpellId(item);
      if (spellId && !itemBySpellId.has(spellId)) itemBySpellId.set(spellId, item);
    }

    const addRow = ({ source, runtime, item = null, isScroll = false, spell = null }) => {
      const group = getSchoolGroup(groups, runtime.school);
      const choiceId = registerChoice(source === "catalog"
        ? { source, spell }
        : { source, itemId: item.id, isScroll, spellOverrides: null });
      group.spells.push(buildSpellDialogRow({
        actor,
        source,
        runtime,
        choiceId,
        isScroll,
        item,
        manaCur,
      }));
      group.hasAny = true;
    };

    for (const school of Object.values(SPELL_SCHOOLS)) {
      for (const spell of SPELLS_BY_SCHOOL[school.id] ?? []) {
        const item = itemBySpellId.get(spell.id);
        if (!item) continue;
        usedSpellItemIds.add(item.id);
        addRow({
          source: "item",
          item,
          runtime: buildSpellRuntimeData(item),
        });
      }
    }

    for (const item of spellItems) {
      if (usedSpellItemIds.has(item.id)) continue;
      addRow({
        source: "item",
        item,
        runtime: buildSpellRuntimeData(item),
      });
    }

    for (const item of scrollItems) {
      addRow({
        source: "item",
        item,
        isScroll: true,
        runtime: buildSpellRuntimeData(item),
      });
    }

    const schools = [...groups.values()]
      .filter(school => school.hasAny)
      .map(school => ({
        ...school,
        spells: school.spells.sort((a, b) =>
          Number(a.rank ?? 0) - Number(b.rank ?? 0)
          || String(a.label ?? "").localeCompare(String(b.label ?? ""))
        ),
      }));

    const filtered = this._school
      ? schools.filter(s => s.id === this._school)
      : schools;

    const allSchools = [
      ...Object.values(SPELL_SCHOOLS),
      ...schools
        .filter(school => !SPELL_SCHOOLS[school.id])
        .map(({ id, label, icon, color }) => ({ id, label, icon, color })),
    ];

    return {
      actorName: actor.name,
      manaCur, manaMax, magicSkill,
      schools: filtered,
      allSchools,
      activeSchool: this._school,
      targets: this._targets.map(t => ({ id:t.id, name:t.name })),
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
      const choice = this._choices.get(id);
      if (!choice) return;
      if (e.currentTarget.classList.contains("is-locked")) return;

      const zoneInput = e.currentTarget.querySelector("[data-spell-target-zone]");
      const friendlyFireInput = e.currentTarget.querySelector("[data-spell-friendly-fire]");
      const choiceOptions = {};
      if (zoneInput) {
        choiceOptions.targetZone = zoneInput.value;
        choiceOptions.targetZoneMode = zoneInput.dataset.spellTargetZoneMode ?? null;
      }
      if (friendlyFireInput) {
        const checked = Boolean(friendlyFireInput.checked);
        const defaultMode = friendlyFireInput.dataset.spellFriendlyFireMode ?? "off";
        const defaultChecked = friendlyFireInput.dataset.spellFriendlyFireDefault === "true";
        choiceOptions.friendlyFire = checked;
        choiceOptions.friendlyFireMode = !checked
          ? (defaultMode === "auto" && !defaultChecked ? "auto" : "off")
          : (defaultMode === "auto" && defaultChecked ? "auto" : "on");
      }

      const resolve = this._resolve;
      this._resolve = null;

      if (choice.source === "catalog") {
        const chosen = buildSpellChoicePayload(choice.spell, choiceOptions);
        resolve?.({ source: "catalog", spell: chosen });
      } else {
        resolve?.({
          source: "item",
          itemId: choice.itemId,
          isScroll: Boolean(choice.isScroll),
          spellOverrides: choiceOptions,
        });
      }
      this.close();
    });

    // Отмена
    html.find("[data-cancel]").on("click", () => {
      const resolve = this._resolve;
      this._resolve = null;
      resolve?.(null);
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
