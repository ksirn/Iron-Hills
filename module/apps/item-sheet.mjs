import {
  getDamageResistanceOptions,
  getDamageTypeOptions,
} from "../services/damage-type-service.mjs";
import { SPELL_SCHOOLS, normalizeSpellSchoolKey } from "../constants/spells-catalog.mjs";
import {
  ITEM_ACTION_TYPE_LABELS as RUNTIME_ACTION_TYPE_LABELS,
  ITEM_EFFECT_TYPE_LABELS as RUNTIME_EFFECT_TYPE_LABELS,
} from "../utils/item-action-config.mjs";
import {
  formatItemActionSummary,
  getItemActionLabel,
  getItemEffectLabel,
} from "../utils/item-utils.mjs";

/**
 * Iron Hills — Item Sheet v2
 * Единый лист для всех типов предметов.
 * Красивый UI, все параметры, описание эффектов.
 */

const QUALITY_CFG = {
  common:     { label:"Обычное",    color:"#a8b8d0", mult:1.0  },
  fine:       { label:"Хорошее",    color:"#4ade80", mult:1.15 },
  masterwork: { label:"Мастерское", color:"#60a5fa", mult:1.30 },
  legendary:  { label:"Легендарное",color:"#f59e0b", mult:1.50 },
};

const EFFECT_LABELS = {
  healHP:           "🩹 Лечение HP (части тела)",
  healAll:          "💚 Лечение всего тела",
  restoreEnergy:    "⚡ Восстановление энергии",
  restoreMana:      "✦ Восстановление маны",
  restoreHydration: "💧 Утоление жажды",
  restoreSatiety:   "🍖 Утоление голода",
  curePoison:       "🟢 Нейтрализация яда",
  cureDisease:      "🏥 Лечение болезни",
  speedBoost:       "⚡ Ускорение (инициатива)",
  strengthBoost:    "💪 Усиление (урон)",
  stun:             "⚡ Оглушение цели",
  silence:          "🔇 Безмолвие цели",
  slow:             "🐢 Замедление цели",
  fear:             "😱 Страх цели",
  reserveDrain:     "💀 Урон по резерву",
  bandage:          "🩹 Перевязка (малое кровотечение)",
  tourniquet:       "🔴 Жгут (большое кровотечение)",
};

const SCOPE_LABELS = {
  single:   "На одну цель",
  self:     "На себя",
  area:     "Область",
  global:   "На всё тело",
  targeted: "Выбор части тела",
};

const ACTION_TYPE_LABELS = {
  "heal-part": "Лечение части тела",
  "heal-body": "Лечение всего тела",
  "restore-energy": "Восстановление энергии",
  "restore-energy-max": "Восстановление максимума энергии",
  "restore-mana": "Восстановление маны",
  "restore-hydration": "Восстановление жажды",
  "restore-satiety": "Восстановление сытости",
  "cure-poison": "Нейтрализация яда",
  "cure-disease": "Лечение болезни",
  "bandage": "Перевязка малого кровотечения",
  "tourniquet": "Жгут для сильного кровотечения",
  "splint": "Шина для перелома",
  "surgery": "Тяжелая медицинская обработка",
};

const APPLICATION_SCOPE_LABELS = {
  targeted: "Часть тела",
  global: "Вся цель",
  auto: "Автоматически",
  area: "Область",
};

const AOE_SHAPE_OPTIONS = [
  { key:"circle", label:"Круг" },
  { key:"cone",   label:"Конус" },
  { key:"ray",    label:"Луч" },
  { key:"rect",   label:"Прямоугольник" },
];

const AOE_TYPE_OPTIONS = [
  { key:"blast",  label:"Все цели" },
  { key:"pierce", label:"Первая на пути" },
  { key:"sweep",  label:"Слева направо" },
  { key:"shards", label:"Случайные цели" },
  { key:"chain",  label:"Цепь" },
  { key:"nova",   label:"Вокруг точки" },
];

const AOE_ZONE_MODE_OPTIONS = [
  { key:"random", label:"Случайная зона у каждой цели" },
  { key:"fixed",  label:"Одна заданная зона" },
  { key:"aimed",  label:"Прицельная зона" },
];

const AOE_FRIENDLY_FIRE_OPTIONS = [
  { key:"off",  label:"Не задевать союзников" },
  { key:"on",   label:"Задевать всех" },
  { key:"auto", label:"По типу атаки" },
];

const SPELL_EFFECT_TYPE_OPTIONS = [
  { key:"",              label:"Авто" },
  { key:"damage",        label:"Урон" },
  { key:"heal",          label:"Лечение" },
  { key:"buff",          label:"Бафф" },
  { key:"debuff",        label:"Дебафф" },
  { key:"summon",        label:"Призыв" },
  { key:"banish",        label:"Изгнание" },
  { key:"restoreEnergy", label:"Энергия" },
  { key:"restoreMana",   label:"Мана" },
  { key:"curePoison",    label:"Снять яд" },
  { key:"cureDisease",   label:"Снять болезнь" },
  { key:"stun",          label:"Оглушение" },
  { key:"disarm",        label:"Обезоруживание" },
  { key:"silence",       label:"Безмолвие" },
  { key:"slow",          label:"Замедление" },
  { key:"fear",          label:"Страх" },
  { key:"reserveDrain",  label:"Резерв" },
];

const SPELL_SPECIAL_OPTIONS = [
  { key:"",                 label:"Нет" },
  { key:"heal",             label:"heal" },
  { key:"buff",             label:"buff" },
  { key:"debuff",           label:"debuff" },
  { key:"summon",           label:"summon" },
  { key:"banish",           label:"banish" },
  { key:"lifesteal",        label:"lifesteal" },
  { key:"double_vs_undead", label:"double_vs_undead" },
  { key:"restoreEnergy",    label:"restoreEnergy" },
  { key:"restoreMana",      label:"restoreMana" },
  { key:"curePoison",       label:"curePoison" },
  { key:"cureDisease",      label:"cureDisease" },
  { key:"stimulant",        label:"stimulant" },
  { key:"stun",             label:"stun" },
  { key:"disarm",           label:"disarm" },
  { key:"silence",          label:"silence" },
  { key:"slow",             label:"slow" },
  { key:"fear",             label:"fear" },
  { key:"reserveDrain",     label:"reserveDrain" },
];

const SPELL_CONDITION_OPTIONS = [
  { key:"",           label:"Нет" },
  { key:"burning",    label:"burning" },
  { key:"slowed",     label:"slowed" },
  { key:"stunned",    label:"stunned" },
  { key:"pushed",     label:"pushed" },
  { key:"exposed",    label:"exposed" },
  { key:"prone",      label:"prone" },
  { key:"hasted",     label:"hasted" },
  { key:"silenced",   label:"silenced" },
  { key:"feared",     label:"feared" },
  { key:"fleeing",    label:"fleeing" },
  { key:"grappled",   label:"grappled" },
  { key:"poison",     label:"poison" },
  { key:"bleeding",   label:"bleeding" },
];

const SPELL_SUMMON_OPTIONS = [
  { key:"summon",   label:"summon" },
  { key:"skeleton", label:"skeleton" },
  { key:"spirit",   label:"spirit" },
];

const TARGET_ACTOR_MODE_LABELS = {
  self: "На себя",
  "selected-or-self": "Выбранная цель или себя",
  "selected-only": "Только выбранная цель",
  area: "Цели в области",
};

const ZONE_LABELS = {
  head:     "Голова",
  torso:    "Торс",
  abdomen:  "Живот",
  leftArm:  "Левая рука",
  rightArm: "Правая рука",
  leftLeg:  "Левая нога",
  rightLeg: "Правая нога",
};

const SKILL_OPTIONS = [
  { key:"sword",    label:"Мечи"           },
  { key:"axe",      label:"Топоры"          },
  { key:"spear",    label:"Копья"           },
  { key:"knife",    label:"Ножи"            },
  { key:"mace",     label:"Булавы"          },
  { key:"flail",    label:"Кистени"         },
  { key:"bow",      label:"Луки"            },
  { key:"crossbow", label:"Арбалеты"        },
  { key:"throwing", label:"Метательное"     },
  { key:"unarmed",  label:"Без оружия"      },
  { key:"shield",   label:"Щит"             },
  { key:"exotic",   label:"Экзотическое"    },
];

const CRAFT_TYPES = [
  { key:"blacksmithing", label:"Кузнечное дело" },
  { key:"crafting",      label:"Ремесло"         },
  { key:"alchemy",       label:"Алхимия"         },
  { key:"cooking",       label:"Готовка"         },
  { key:"mining",        label:"Горное дело"     },
  { key:"herbalism",     label:"Травничество"    },
];

const MATERIAL_CATEGORIES = [
  { key:"metal",  label:"Металл"    },
  { key:"wood",   label:"Дерево"    },
  { key:"hide",   label:"Кожа"      },
  { key:"fiber",  label:"Волокно"   },
  { key:"stone",  label:"Камень"    },
  { key:"herb",   label:"Трава"     },
  { key:"misc",   label:"Прочее"    },
];

const ARMOR_SLOTS = [
  { key:"head",     label:"Голова"       },
  { key:"torso",    label:"Торс"         },
  { key:"leftArm",  label:"Левая рука"   },
  { key:"rightArm", label:"Правая рука"  },
  { key:"legs",     label:"Ноги"         },
  { key:"leftHand", label:"Левая кисть"  },
  { key:"rightHand",label:"Правая кисть" },
  { key:"neck",     label:"Шея"          },
  { key:"ringLeft", label:"Кольцо лев."  },
  { key:"ringRight",label:"Кольцо прав." },
  { key:"belt",     label:"Пояс"         },
  { key:"backpack", label:"Рюкзак"       },
];

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanKey(value) {
  return String(value ?? "").trim();
}

function normalizeAoeFormObject(aoe = null) {
  if (!isObject(aoe)) return;
  aoe.shape = cleanKey(aoe.shape) || "circle";
  aoe.type = cleanKey(aoe.type) || "blast";
  aoe.distance = Math.max(0, numberOrZero(aoe.distance));
  aoe.maxTargets = numberOrNull(aoe.maxTargets);
  if (aoe.maxTargets !== null) aoe.maxTargets = Math.max(0, aoe.maxTargets);
  const chainDecay = aoe.chainDecay === null || aoe.chainDecay === undefined || aoe.chainDecay === ""
    ? 1
    : aoe.chainDecay;
  aoe.chainDecay = Math.min(1, Math.max(0, numberOrZero(chainDecay)));
  aoe.targetZone = cleanKey(aoe.targetZone);
  aoe.targetZoneMode = cleanKey(aoe.targetZoneMode) || (aoe.targetZone ? "fixed" : "random");
  aoe.friendlyFireMode = cleanKey(aoe.friendlyFireMode) || "auto";
}

function normalizeItemSheetFormData(updateData = {}, type = "") {
  const system = updateData.system;
  if (!isObject(system)) return updateData;

  if (isObject(system.aoe)) normalizeAoeFormObject(system.aoe);

  if (type === "spell" || type === "scroll") {
    system.spellId = cleanKey(system.spellId);
    system.school = normalizeSpellSchoolKey(system.school, { fallback: cleanKey(system.school) });
    system.damageType = cleanKey(system.damageType) || "none";
    system.effectType = cleanKey(system.effectType);
    system.applicationScope = cleanKey(system.applicationScope) || "targeted";
    system.targetActorMode = cleanKey(system.targetActorMode) || "selected-only";
    system.targetPart = cleanKey(system.targetPart);
    system.targetZone = cleanKey(system.targetZone);
    system.targetZoneMode = cleanKey(system.targetZoneMode) || (system.targetZone ? "fixed" : "random");
    system.friendlyFireMode = cleanKey(system.friendlyFireMode) || "off";

    if (isObject(system.effect)) {
      system.effect.special = cleanKey(system.effect.special);
      system.effect.applyCondition = cleanKey(system.effect.applyCondition);
      system.effect.summonId = cleanKey(system.effect.summonId) || "summon";
      system.effect.conditionDuration = Math.max(0, numberOrZero(system.effect.conditionDuration));
      const conditionChance = numberOrNull(system.effect.conditionChance);
      if (conditionChance === null) {
        system.effect.conditionChance = null;
      } else {
        system.effect.conditionChance = Math.min(1, Math.max(0, conditionChance));
      }
      system.effect.healAmount = Math.max(0, numberOrZero(system.effect.healAmount));
      system.effect.duration = Math.max(0, numberOrZero(system.effect.duration));
    }
  }

  return updateData;
}

class IronHillsItemSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:    ["iron-hills", "item-sheet"],
      width:      480,
      height:     520,
      resizable:  true,
    });
  }

  // Foundry v12: this.form ищет :first внутри .app, находит .window-header, не form.
  // Переопределяем _onChangeInput чтобы брать form напрямую из .window-content.
  _getFormData() {
    const form = this.element[0]?.querySelector(".window-content form")
               ?? this.element[0]?.querySelector("form");
    return form ? new FormDataExtended(form, { editors: this.editors ?? {} }) : null;
  }

  async _onChangeInput(event) {
    const fd = this._getFormData();
    if (!fd) return;
    const updateData = normalizeItemSheetFormData(fd.object, this.item.type);
    await this.item.update(updateData);
  }

  async _onSubmit(event, options = {}) {
    if (event) event.preventDefault();
    const fd = this._getFormData();
    if (!fd) return {};
    const updateData = normalizeItemSheetFormData(fd.object, this.item.type);
    await this.item.update(updateData);
    if (options.closeOnSubmit) this.close();
    return updateData;
  }

  activateListeners(html) {
    // НЕ вызываем super — он падает на this.form в Foundry v12
    // Вручную привязываем всё нужное

    // Drag-and-drop для предметов (стандарт Foundry)
    if (this.isEditable) {
      html.find(".item-list").on("dragover", ev => ev.preventDefault());
    }

    // Кнопка сохранить
    html.find("[data-save-item]").on("click", async () => {
      await this._saveAll(html);
      ui.notifications.info("Сохранено");
    });

    // Автосохранение select — они меняются мгновенно
    html.find("select").on("change", async () => {
      await this._saveAll(html);
    });

    // Автосохранение checkbox
    html.find("input[type='checkbox']").on("change", async () => {
      await this._saveAll(html);
    });

    // Сохранение text/number полей при потере фокуса (blur)
    html.find("input[type='text'], input[type='number'], textarea").on("blur", async () => {
      await this._saveAll(html);
    });
  }

  async _saveAll(html) {
    const form = html[0]?.querySelector("form")
              ?? html[0]?.closest(".window-content")?.querySelector("form");
    if (!form) { console.warn("IronHills | form not found"); return; }
    try {
      const fd = new FormDataExtended(form, { editors: this.editors ?? {} });
      await this.item.update(normalizeItemSheetFormData(fd.object, this.item.type));
    } catch(e) {
      console.error("IronHills | save error:", e);
    }
  }

  /** Находим form внутри window-content если Foundry не нашёл автоматически */


  get template() {
    return "systems/iron-hills-system/templates/item/item-sheet.hbs";
  }

  get title() {
    const typeLabels = {
      weapon:"Оружие", armor:"Броня", potion:"Зелье", food:"Еда",
      material:"Материал", tool:"Инструмент", spell:"Заклинание",
      scroll:"Свиток", throwable:"Метательное", consumable:"Расходник",
      resource:"Ресурс", jewelry:"Украшение",
    };
    const label = typeLabels[this.item.type] ?? this.item.type;
    return `${label} — ${this.item.name}`;
  }

  async getData() {
    const ctx     = await super.getData();
    const item    = this.item;
    const s       = item.system;
    const type    = item.type;
    const quality = QUALITY_CFG[s.quality ?? "common"] ?? QUALITY_CFG.common;

    ctx.type          = type;
    ctx.system        = s;
    ctx.qualityCfg    = quality;
    ctx.qualityOpts   = Object.entries(QUALITY_CFG).map(([k,v]) => ({ key:k, label:v.label, color:v.color }));
    ctx.effectLabels  = { ...RUNTIME_EFFECT_TYPE_LABELS, ...EFFECT_LABELS };
    ctx.scopeLabels   = SCOPE_LABELS;
    ctx.actionTypeLabels = { ...RUNTIME_ACTION_TYPE_LABELS, ...ACTION_TYPE_LABELS };
    ctx.applicationScopeLabels = APPLICATION_SCOPE_LABELS;
    ctx.targetActorModeLabels = TARGET_ACTOR_MODE_LABELS;
    ctx.zoneLabels    = ZONE_LABELS;
    ctx.aoeShapeOptions = AOE_SHAPE_OPTIONS;
    ctx.aoeTypeOptions  = AOE_TYPE_OPTIONS;
    ctx.aoeZoneModeOptions = AOE_ZONE_MODE_OPTIONS;
    ctx.aoeFriendlyFireOptions = AOE_FRIENDLY_FIRE_OPTIONS;
    ctx.damageTypeOptions = getDamageTypeOptions({ includePassive: false, includeTrue: false });
    ctx.spellDamageTypeOptions = getDamageTypeOptions({ includePassive: true, includeTrue: true });
    ctx.spellSchoolOptions = Object.entries(SPELL_SCHOOLS ?? {}).map(([key, school]) => ({
      key,
      label: `${school.icon ?? ""} ${school.label ?? key}`.trim(),
    }));
    ctx.spellEffectTypeOptions = SPELL_EFFECT_TYPE_OPTIONS;
    ctx.spellSpecialOptions = SPELL_SPECIAL_OPTIONS;
    ctx.spellConditionOptions = SPELL_CONDITION_OPTIONS;
    ctx.spellSummonOptions = SPELL_SUMMON_OPTIONS;
    ctx.armorResistanceOptions = getDamageResistanceOptions(s.protection);
    ctx.skillOptions  = SKILL_OPTIONS;
    ctx.craftTypes    = CRAFT_TYPES;
    ctx.matCategories = MATERIAL_CATEGORIES;
    ctx.armorSlots    = ARMOR_SLOTS;

    // Тип-специфичные данные
    ctx.isWeapon    = type === "weapon";
    ctx.isArmor     = type === "armor" || type === "jewelry";
    ctx.isPotion    = type === "potion" || type === "consumable";
    ctx.isFood      = type === "food";
    ctx.isMaterial  = type === "material" || type === "resource";
    ctx.isTool      = type === "tool";
    ctx.isSpell     = type === "spell" || type === "scroll";
    ctx.isThrowable = type === "throwable";

    // Описание эффекта зелья
    if (ctx.isPotion && (s.actionType || s.effectType || s.effect || s.power)) {
      ctx.effectLabel = formatItemActionSummary(s, { includeIcon: false })
        || getItemActionLabel(s.actionType, {
          fallback: getItemEffectLabel(s.effectType ?? s.effect, { fallback: s.actionType ?? s.effect }),
        });
    }

    // Качество — бонус к параметрам
    if (ctx.isWeapon && s.damage) {
      const bonus = quality.mult - 1;
      ctx.qualityDamageBonus = bonus > 0 ? `+${Math.round(s.damage * bonus * 10) / 10}` : "";
    }

    // Стоимость с учётом качества
    ctx.effectiveValue = Math.round((s.value ?? 0) * quality.mult);

    return ctx;
  }
}

export { IronHillsItemSheet };
