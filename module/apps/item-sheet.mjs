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
    const updateData = fd.object;
    await this.item.update(updateData);
  }

  async _onSubmit(event, options = {}) {
    if (event) event.preventDefault();
    const fd = this._getFormData();
    if (!fd) return {};
    const updateData = fd.object;
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
      await this.item.update(fd.object);
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
    ctx.effectLabels  = EFFECT_LABELS;
    ctx.scopeLabels   = SCOPE_LABELS;
    ctx.zoneLabels    = ZONE_LABELS;
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
    if (ctx.isPotion && s.effect) {
      ctx.effectLabel = EFFECT_LABELS[s.effect] ?? s.effect;
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
