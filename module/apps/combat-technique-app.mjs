/**
 * Iron Hills — Combat Technique App
 * Диалог выбора боевого приёма или прицельного удара.
 * Открывается из combat HUD при атаке.
 */
import {
  TECHNIQUES_BY_SKILL,
  getAvailableTechniques,
  CONDITION_LABELS,
} from "../constants/combat-techniques.mjs";

// Зоны тела для прицельного удара
const AIM_ZONES = [
  { key:"head",     label:"Голова",   icon:"🧠", hitMod:-4, damageMult:2.0,
    desc:"Сложно попасть, но смертельно. Шанс оглушения." },
  { key:"neck",     label:"Шея",      icon:"🩸", hitMod:-3, damageMult:1.8,
    desc:"Критическая зона. Кровотечение при попадании." },
  { key:"torso",    label:"Торс",     icon:"🫁", hitMod:0,  damageMult:1.0,
    desc:"Базовый удар. Наибольший шанс попасть." },
  { key:"abdomen",  label:"Живот",    icon:"🎯", hitMod:-1, damageMult:1.2,
    desc:"Болезненное ранение. Штраф к броскам цели." },
  { key:"leftArm",  label:"Л.рука",   icon:"💪", hitMod:-2, damageMult:0.7,
    desc:"Снизить урон оружием противника." },
  { key:"rightArm", label:"П.рука",   icon:"💪", hitMod:-2, damageMult:0.7,
    desc:"Снизить урон оружием противника." },
  { key:"leftLeg",  label:"Л.нога",   icon:"🦵", hitMod:-2, damageMult:0.7,
    desc:"Замедлить противника." },
  { key:"rightLeg", label:"П.нога",   icon:"🦵", hitMod:-2, damageMult:0.7,
    desc:"Замедлить противника." },
];

// Требования для прицельного удара по навыку
const AIM_REQ = 3; // навык >= 3 чтобы прицеливаться

class IronHillsCombatTechniqueApp extends Application {

  constructor(attacker, weapon, targets, options = {}) {
    super(options);
    this._attacker  = attacker;
    this._weapon    = weapon;
    this._targets   = targets; // массив акторов-целей
    this._tab       = "techniques"; // "techniques" | "aim"
    this._resolve   = null; // Promise resolver
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "combat-technique"],
      width:     540,
      height:    480,
      resizable: false,
      title:     "Атака",
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/combat-technique.hbs";
  }

  /**
   * Открыть диалог и вернуть выбор игрока.
   * @returns {Promise<{type, technique?, zone?, target?} | null>}
   */
  static async choose(attacker, weapon, targets) {
    return new Promise(resolve => {
      const app = new IronHillsCombatTechniqueApp(attacker, weapon, targets);
      app._resolve = resolve;
      app.render(true);
    });
  }

  async getData() {
    const actor  = this._attacker;
    const weapon = this._weapon;
    const skill  = weapon?.system?.skill ?? "";
    const skillVal = Number(actor?.system?.skills?.[skill]?.value ?? 0);
    const weapTier = Number(weapon?.system?.tier ?? 1);

    // Доступные приёмы
    const available = getAvailableTechniques(actor, weapon);
    // Все приёмы навыка (для отображения заблокированных)
    const allTechs  = TECHNIQUES_BY_SKILL[skill] ?? [];
    const locked    = allTechs.filter(t =>
      !available.find(a => a.id === t.id)
    ).map(t => ({
      ...t,
      lockReason: skillVal < t.reqSkill
        ? `Нужен навык ${t.reqSkill} (у тебя ${skillVal})`
        : `Нужно оружие ${t.reqWeaponTier}+ ступени`,
    }));

    // Прицельный удар — требует навык >= 3
    const canAim = skillVal >= AIM_REQ;

    // Базовый удар — всегда доступен
    const baseAttack = {
      damage: weapon?.system?.damage ?? 0,
      energyCost: weapon?.system?.energyCost ?? 8,
      skill, skillVal,
      dieSize: Math.min(20, skillVal * 2),
    };

    return {
      actorName:   actor?.name ?? "?",
      weaponName:  weapon?.name ?? "Кулак",
      weaponTier:  weapTier,
      weaponImg:   weapon?.img ?? "icons/weapons/swords/sword-shortsword.webp",
      skill,
      skillVal,
      tab:         this._tab,
      baseAttack,
      available,
      locked,
      canAim,
      aimZones:    AIM_ZONES,
      aimReq:      AIM_REQ,
      targets:     this._targets.map(t => ({ id: t.id, name: t.name, img: t.img })),
      conditionLabels: CONDITION_LABELS,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Переключение вкладок
    html.find("[data-tab]").on("click", e => {
      this._tab = e.currentTarget.dataset.tab;
      this.render(false);
    });

    // Обычный удар
    html.find("[data-basic-attack]").on("click", () => {
      this._resolve?.({ type: "basic" });
      this.close();
    });

    // Выбор приёма
    html.find("[data-technique]").on("click", e => {
      const id   = e.currentTarget.dataset.technique;
      const tech = Object.values(TECHNIQUES_BY_SKILL)
        .flat().find(t => t.id === id);
      if (!tech) return;
      this._resolve?.({ type: "technique", technique: tech });
      this.close();
    });

    // Выбор зоны для прицельного удара
    html.find("[data-aim-zone]").on("click", e => {
      const zone = AIM_ZONES.find(z => z.key === e.currentTarget.dataset.aimZone);
      if (!zone) return;
      this._resolve?.({ type: "aimed", zone });
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

export { IronHillsCombatTechniqueApp, AIM_ZONES, AIM_REQ };
