/**
 * Iron Hills — Travel App v2
 * Поддержка групп персонажей, реген ресурсов, неактивные пачки.
 */
import {
  getPartyGroups, savePartyGroups,
  getMembersOfGroup, getActiveGroup
} from "../services/party-manager.mjs";
import { DISEASES, getActiveDiseases, getDiseasesPenalties } from "../constants/diseases.mjs";
import {
  buildCombatChatCard,
  escapeCombatHtml,
} from "../services/combat-chat-service.mjs";

const BASE_RATES = {
  satiety:    2,
  hydration:  4,
};


function calcEnergyRegen(enVal, enCurMax, enBaseMax, act, totalHours) {
  let newEnMax = enCurMax;
  let newEn    = enVal;
  let enDelta  = 0;  // итоговое изменение текущей (от начальной enVal)
  let maxDelta = 0;  // итоговое изменение максимума

  if (!act.energyRegen) {
    if (act.energyCost) {
      const needed = act.energyCost * totalHours;
      if (enVal >= needed) {
        // Энергии хватает — просто снимаем
        newEn    = enVal - needed;
        enDelta  = newEn - enVal;
      } else {
        // Пошаговое снятие энергии:
        // 4/10, нужно 6 →
        //   снимаем 4 из текущей → 0/10
        //   осталось снять 2, текущей нет → снимаем 1 макс, ток = макс = 9/9
        //   снимаем оставшиеся 2 → 7/9
        let remaining = needed;
        let curEn  = enVal;
        let curMax = enCurMax;

        // Шаг 1: снимаем что есть в текущей
        const fromCurrent = Math.min(curEn, remaining);
        curEn    -= fromCurrent;
        remaining -= fromCurrent;

        // Шаг 2: пока есть что снимать — снимаем по 1 с максимума, восстанавливаем текущую
        while (remaining > 0 && curMax > 1) {
          curMax -= 1;
          curEn   = curMax; // текущая = новый максимум
          const take = Math.min(curEn, remaining);
          curEn    -= take;
          remaining -= take;
        }

        newEnMax = curMax;
        newEn    = curEn;
        maxDelta = curMax - enCurMax;
        enDelta  = curEn  - enVal;
      }
    }
    return { newEn, newEnMax, enDelta, maxDelta, exhausted: newEnMax < enCurMax };
  }

  let timeLeft = totalHours;

  // Можем повторять цикл: фаза1 → фаза2 → фаза1 → фаза2 ...
  // пока есть время и есть что восстанавливать
  let cycles = 0;
  while (timeLeft > 0.001 && cycles < 20) {
    cycles++;
    const missingCurrent = newEnMax - newEn;
    const missingMax     = enBaseMax - newEnMax;

    if (missingCurrent > 0) {
      // Фаза 1: восстанавливаем текущую до max
      const rate        = newEnMax * act.energyRegen; // единиц в час
      const timeNeeded  = missingCurrent / rate;
      const timeSpent   = Math.min(timeLeft, timeNeeded);
      const restored    = Math.min(missingCurrent, rate * timeSpent);
      newEn     = Math.min(newEnMax, newEn + restored);
      timeLeft -= timeSpent;
    } else if (missingMax > 0 && act.energyMaxRegen) {
      // Фаза 2: текущая = max, восстанавливаем max (сбрасываем текущую в 0)
      const rate       = missingMax * act.energyMaxRegen; // единиц в час
      const timeNeeded = 1 / act.energyMaxRegen; // условно 1 цикл = 1/rate
      const timeSpent  = Math.min(timeLeft, timeNeeded);
      const restored   = Math.min(missingMax, missingMax * act.energyMaxRegen * timeSpent);
      newEnMax  = Math.min(enBaseMax, newEnMax + Math.ceil(restored));
      newEn     = 0;  // сброс — тело тратит силы на расширение резерва
      maxDelta += Math.ceil(restored);
      timeLeft -= timeSpent;
    } else {
      break; // всё восстановлено
    }
  }

  enDelta  = newEn  - enVal;
  return { newEn, newEnMax, enDelta, maxDelta };
}

const ACTIVITIES = [
  // energyRegen    — % от max восстанавливается в текущую за час  (Фаза 1)
  // energyMaxRegen — % потерянного max восстанавливается за час    (Фаза 2, сброс тек. в 0)
  { key:"rest",      label:"🛏 Отдых",      satiety:1, hydration:2,
    energyRegen:1.0,  energyMaxRegen:0.12, manaRegen:0.05, hpRegen:0.02, heal:true },
  { key:"sleep",     label:"😴 Сон",        satiety:1, hydration:2,
    energyRegen:2.0,  energyMaxRegen:0.25, manaRegen:0.08, hpRegen:0.05, heal:true, sleepBonus:true },
  { key:"meditate",  label:"🧘 Медитация",  satiety:0.5, hydration:1,
    energyRegen:0.5,  energyMaxRegen:0.05, manaRegen:0.40, hpRegen:0,    heal:false },
  { key:"walk",      label:"🚶 Переход",    satiety:3, hydration:5,
    energyRegen:0,    energyMaxRegen:0,    manaRegen:0,    hpRegen:0,    energyCost:2 },
  { key:"ride",      label:"🐴 Верхом",     satiety:2, hydration:3,
    energyRegen:0,    energyMaxRegen:0,    manaRegen:0,    hpRegen:0,    energyCost:1 },
  { key:"work",      label:"⚒ Работа",     satiety:3, hydration:4,
    energyRegen:0,    energyMaxRegen:0,    manaRegen:0,    hpRegen:0,    energyCost:3 },
  { key:"combat",    label:"⚔ Бой",        satiety:4, hydration:6,
    energyRegen:0,    energyMaxRegen:0,    manaRegen:0,    hpRegen:0,    energyCost:5 },
];

// Неактивная группа — минимальный расход (сидят в городе)
const IDLE_RATES = { satiety: 0.5, hydration: 1 };

function clampPct(value, max) {
  const safeMax = Math.max(1, Number(max) || 1);
  return Math.max(0, Math.min(100, Math.round((Number(value) || 0) / safeMax * 100)));
}

function fmtNumber(value, digits = 1) {
  const num = Number(value) || 0;
  return Number(num.toFixed(digits)).toString();
}

function fmtDelta(value, digits = 1) {
  const num = Number(value) || 0;
  if (Math.abs(num) < 0.01) return "0";
  return `${num > 0 ? "+" : ""}${fmtNumber(num, digits)}`;
}

function formatDurationLabel(hours, mins) {
  const h = Math.max(0, Number(hours) || 0);
  const m = Math.max(0, Number(mins) || 0);
  if (h <= 0 && m <= 0) return "0м";
  if (h <= 0) return `${m}м`;
  if (m <= 0) return `${h}ч`;
  return `${h}ч ${m}м`;
}

function getActivityTone(key) {
  return ({
    rest: "recover",
    sleep: "recover",
    meditate: "arcane",
    walk: "travel",
    ride: "travel",
    work: "labor",
    combat: "danger",
  })[key] ?? "neutral";
}

function buildActivityView(activity, activeKey) {
  const hints = [];
  if (activity.energyCost) hints.push(`энергия -${fmtNumber(activity.energyCost)}/ч`);
  if (activity.energyRegen) hints.push(`энергия +${Math.round(activity.energyRegen * 100)}%/ч`);
  if (activity.energyMaxRegen) hints.push(`резерв +${Math.round(activity.energyMaxRegen * 100)}%/ч`);
  if (activity.manaRegen) hints.push(`мана +${Math.round(activity.manaRegen * 100)}%/ч`);
  hints.push(`еда -${fmtNumber(activity.satiety)}/ч`);
  hints.push(`вода -${fmtNumber(activity.hydration)}/ч`);

  return {
    ...activity,
    isActive: activity.key === activeKey,
    tone: getActivityTone(activity.key),
    costHint: hints.join(" · "),
  };
}

function getResourceTone(pct) {
  if (pct <= 15) return "is-danger";
  if (pct <= 35) return "is-warn";
  if (pct >= 85) return "is-good";
  return "is-stable";
}

function buildResourceRow({ key, icon, label, value, max, delta, pct, fillClass }) {
  const numericDelta = Number(delta) || 0;
  return {
    key,
    icon,
    label,
    valueText: `${fmtNumber(value)}/${fmtNumber(max)}`,
    deltaText: fmtDelta(numericDelta),
    deltaClass: numericDelta > 0 ? "pos" : numericDelta < 0 ? "neg" : "muted",
    pct,
    tone: getResourceTone(pct),
    fillClass,
  };
}

function getHungerState(pct) {
  if (pct <= 0)    return { label:"☠ Голодная смерть",    color:"#ef4444", enPenalty:20 };
  if (pct <= 0.1)  return { label:"😵 Крайнее истощение", color:"#f87171", enPenalty:10 };
  if (pct <= 0.25) return { label:"😰 Сильный голод",     color:"#fb923c", enPenalty:5  };
  if (pct <= 0.5)  return { label:"🍽 Голод",              color:"#fbbf24", enPenalty:2  };
  return null;
}

function getThirstState(pct) {
  if (pct <= 0)    return { label:"☠ Смерть от жажды",    color:"#3b82f6", enPenalty:30 };
  if (pct <= 0.1)  return { label:"🏜 Критическая жажда", color:"#60a5fa", enPenalty:15 };
  if (pct <= 0.25) return { label:"😓 Сильная жажда",     color:"#7dd3fc", enPenalty:8  };
  if (pct <= 0.5)  return { label:"💧 Жажда",              color:"#bae6fd", enPenalty:3  };
  return null;
}

class IronHillsTravelApp extends Application {

  constructor(options = {}) {
    super(options);
    this._hours    = 1;
    this._mins     = 0;
    this._activity = "walk";
    this._groupId  = null; // null = активная группа
    this._campMode = false; // режим привала — индивидуальные активности
    this._campActivities = {}; // actorId → activityKey
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "travel-app"],
      width:     760,
      height:    720,
      resizable: true,
      title:     "⏳ Менеджер времени"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/travel-app.hbs";
  }

  _getTargetGroup() {
    const groups = getPartyGroups();
    if (this._groupId) return groups.find(g => g.id === this._groupId) ?? null;
    return groups.find(g => g.isActive) ?? groups[0] ?? null;
  }

  _getTargetMembers() {
    const group = this._getTargetGroup();
    if (!group) {
      // Fallback — все персонажи игроков
      return (game.actors ?? []).filter(a => a.type === "character" && a.hasPlayerOwner);
    }
    return getMembersOfGroup(group.id);
  }

  async getData() {
    const groups   = getPartyGroups();
    const group    = this._getTargetGroup();
    if (!this._groupId && group) this._groupId = group.id;

    const members  = this._getTargetMembers();
    const act      = ACTIVITIES.find(a => a.key === this._activity) ?? ACTIVITIES[2];
    const totalHours = this._hours + (this._mins / 60);
    const activities = ACTIVITIES.map(activity => buildActivityView(activity, this._activity));
    const activeActivity = activities.find(activity => activity.key === act.key) ?? activities[0];
    // В режиме привала каждый актор может иметь свою активность

    const preview  = members.map(actor => {
      const res    = actor.system?.resources ?? {};
      const satVal = Number(res.satiety?.value  ?? 100);
      const satMax = Number(res.satiety?.max    ?? 100);
      const hydVal = Number(res.hydration?.value ?? 100);
      const hydMax = Number(res.hydration?.max  ?? 100);
      const enVal  = Number(res.energy?.value   ?? 100);
      const enMax  = Number(res.energy?.max     ?? 100);
      const mnVal  = Number(res.mana?.value     ?? 50);
      const mnMax  = Number(res.mana?.max       ?? 50);

      // В режиме привала — индивидуальная активность для каждого актора
      const actorActKey = this._campMode
        ? (this._campActivities[actor.id] ?? "rest")
        : this._activity;
      const actorAct = ACTIVITIES.find(a => a.key === actorActKey) ?? act;
      const actEff = actorAct;

      const satCost = actEff.satiety   * totalHours;
      const hydCost = actEff.hydration * totalHours;

      // ── Энергия: многофазное восстановление ───────────────
      // baseMax = исходный максимум (не снижается), max = текущий максимум (снижается от усталости)
      // Если baseMax не записан — считаем что max и есть baseMax
      const enBaseMax = Number(res.energy?.baseMax > 0 ? res.energy.baseMax : enMax);
      const enCurMax  = Number(res.energy?.max     ?? enMax);
      const enResult  = calcEnergyRegen(enVal, enCurMax, enBaseMax, actEff, totalHours);
      const newEn     = enResult.newEn;
      const newEnMax  = enResult.newEnMax;
      const enDelta   = enResult.enDelta;   // изменение текущей (может быть <0 при сбросе)
      const maxDelta  = enResult.maxDelta;  // изменение максимума

      const mnRegen = actEff.manaRegen
        ? Math.floor(mnMax * actEff.manaRegen * totalHours)
        : 0;

      const newSat = Math.max(0, satVal - satCost);
      const newHyd = Math.max(0, hydVal - hydCost);
      const newMn  = Math.min(mnMax, mnVal + mnRegen);

      const hunger = getHungerState(newSat / satMax);
      const thirst = getThirstState(newHyd / hydMax);
      const satPct = clampPct(newSat, satMax);
      const hydPct = clampPct(newHyd, hydMax);
      const enPct  = clampPct(newEn, newEnMax);
      const mnPct  = clampPct(newMn, mnMax);
      const statusChips = [];
      if (hunger) statusChips.push({ label: hunger.label, tone: "is-warn" });
      if (thirst) statusChips.push({ label: thirst.label, tone: "is-warn" });
      if (newEnMax < enCurMax) statusChips.push({ label: `усталость ${fmtDelta(newEnMax - enCurMax)}`, tone: "is-danger" });

      return {
        actorId: actor.id,
        name: actor.name, img: actor.img,
        activityKey: actorActKey,
        activityLabel: actorAct?.label ?? act.label,
        satVal, satMax, hydVal, hydMax, enVal, enMax, mnVal, mnMax,
        enBaseMax, enCurMax,
        mnRegen,
        newSat, newHyd, newEn, newEnMax, newMn,
        // Итоговые изменения — округлены до сотых
        satCost:     +satCost.toFixed(2),
        hydCost:     +hydCost.toFixed(2),
        enNetDelta:  +(newEn - enVal).toFixed(2),
        enNetFinal:  +newEn.toFixed(2),
        maxDelta:    +maxDelta.toFixed(2),
        mnDelta:     +(newMn - mnVal).toFixed(2),
        satDelta:    +(-satCost).toFixed(2),
        hydDelta:    +(-hydCost).toFixed(2),
        mnFull:      (mnVal >= mnMax),
        enFull:      (enVal >= enCurMax && enCurMax >= enBaseMax),
        satPct,
        hydPct,
        enPct,
        mnPct,
        enCost: (enDelta < 0 && !actEff.energyRegen) ? 1 : 0,
        enCostFmt: enDelta < 0 ? Math.abs(enDelta).toFixed(1) : "0",
        hungerLabel: hunger?.label ?? "",
        thirstLabel: thirst?.label ?? "",
        hasWarning:  statusChips.length > 0,
        statusChips,
        resourceRows: [
          buildResourceRow({ key: "satiety", icon: "🍖", label: "Сытость", value: newSat, max: satMax, delta: -satCost, pct: satPct, fillClass: "satiety" }),
          buildResourceRow({ key: "hydration", icon: "💧", label: "Вода", value: newHyd, max: hydMax, delta: -hydCost, pct: hydPct, fillClass: "water" }),
          buildResourceRow({ key: "energy", icon: "⚡", label: "Энергия", value: newEn, max: newEnMax, delta: newEn - enVal, pct: enPct, fillClass: "energy" }),
          buildResourceRow({ key: "mana", icon: "✦", label: "Мана", value: newMn, max: mnMax, delta: newMn - mnVal, pct: mnPct, fillClass: "mana" }),
        ],
      };
    });

    // Другие группы — покажем их статус
    const otherGroups = groups
      .filter(g => g.id !== group?.id)
      .map(g => ({
        id: g.id, label: g.label, color: g.color,
        location: g.location, localHours: g.localHours ?? 0,
        memberCount: (g.memberIds ?? []).length
      }));
    const warningCount = preview.filter(row => row.hasWarning).length;

    return {
      groups,
      groupId:     group?.id ?? "",
      groupLabel:  group?.label ?? "Все персонажи",
      groupColor:  group?.color ?? "#5b9cf6",
      groupLocation: group?.location ?? "без позиции",
      hours:       this._hours,
      mins:        this._mins,
      durationLabel: formatDurationLabel(this._hours, this._mins),
      totalHours:  fmtNumber(totalHours, 2),
      activity:    this._activity,
      activeActivity,
      activities,
      campMode:    this._campMode,
      preview,
      hasMembers:  preview.length > 0,
      warningCount,
      hasWarnings: warningCount > 0,
      otherGroups,
      hasOtherGroups: otherGroups.length > 0,
      partySummary: {
        memberCount: preview.length,
        warningCount,
        otherGroupCount: otherGroups.length,
      },
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Выбор группы
    html.find("[data-group-select]").on("change", e => {
      this._groupId = e.currentTarget.value || null;
      this.render(false);
    });

    // Быстрые часы
    html.find("[data-preset-hours]").on("click", e => {
      this._hours = parseInt(e.currentTarget.dataset.presetHours ?? "0") || 0;
      if (e.currentTarget.dataset.presetMins !== undefined)
        this._mins = parseInt(e.currentTarget.dataset.presetMins) || 0;
      this.render(false);
    });

    // Активность
    html.find("[data-activity]").on("click", e => {
      this._activity = e.currentTarget.dataset.activity;
      this.render(false);
    });

    // Применить
    // Шаги часов/минут
    html.find("[data-step-hours]").on("click", e => {
      this._hours = Math.max(0, Math.min(72, this._hours + parseInt(e.currentTarget.dataset.stepHours)));
      html.find("[data-hours-direct]").val(this._hours);
      html.find("[data-hours-label]").text(this._hours);
      this.render(false);
    });
    html.find("[data-step-mins]").on("click", e => {
      this._mins = Math.max(0, Math.min(59, this._mins + parseInt(e.currentTarget.dataset.stepMins)));
      html.find("[data-mins-direct]").val(this._mins);
      html.find("[data-mins-label]").text(this._mins);
      this.render(false);
    });
    html.find("[data-hours-direct]").on("input change", e => {
      this._hours = Math.max(0, Math.min(72, parseInt(e.target.value) || 0));
      html.find("[data-hours-label]").text(this._hours);
      this.render(false);
    });
    html.find("[data-mins-direct]").on("input change", e => {
      this._mins = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
      html.find("[data-mins-label]").text(this._mins);
      this.render(false);
    });

    // Переключение режима привала
    html.find("[data-toggle-camp]").on("click", () => {
      this._campMode = !this._campMode;
      if (this._campMode) {
        // При входе в режим привала — все получают "отдых" по умолчанию
        const members = this._getTargetMembers();
        for (const actor of members) {
          if (!this._campActivities[actor.id]) {
            this._campActivities[actor.id] = "rest";
          }
        }
      }
      this.render(false);
    });

    // Назначение активности отдельному актору (в режиме привала)
    html.find("[data-camp-activity]").on("click", e => {
      const actorId = e.currentTarget.dataset.actorId;
      const actKey  = e.currentTarget.dataset.campActivity;
      this._campActivities[actorId] = actKey;
      this.render(false);
    });

    html.find("[data-apply-time]").on("click", () => this._applyTime(false));
    html.find("[data-apply-rest]").on("click", () => {
      if (!this._campMode) {
        this._activity = "rest";
      }
      this._applyTime(false);
    });
  }

  async _applyTime(skipConfirm) {
    if (!game.user?.isGM) {
      ui.notifications.warn("Только GM может управлять временем.");
      return;
    }

    const members = this._getTargetMembers();
    if (!members.length) {
      ui.notifications.warn("Нет персонажей в выбранной группе.");
      return;
    }

    const act = ACTIVITIES.find(a => a.key === this._activity) ?? ACTIVITIES[2];
    const messages = [];

    for (const actor of members) {
      // В режиме привала — индивидуальная активность
      const actKey = this._campMode
        ? (this._campActivities[actor.id] ?? "rest")
        : this._activity;
      const actEff = ACTIVITIES.find(a => a.key === actKey) ?? act;
      const res   = actor.system?.resources ?? {};
      const satV  = Number(res.satiety?.value  ?? 100);
      const satM  = Number(res.satiety?.max    ?? 100);
      const hydV  = Number(res.hydration?.value ?? 100);
      const enV   = Number(res.energy?.value   ?? 100);
      const enM   = Number(res.energy?.max     ?? 100);
      const mnV   = Number(res.mana?.value     ?? 50);
      const mnM   = Number(res.mana?.max       ?? 50);

      const totalHours = this._hours + (this._mins / 60);
      const satCost = actEff.satiety   * totalHours;
      const hydCost = actEff.hydration * totalHours;
      const mnRegen = actEff.manaRegen ? Math.floor(mnM * actEff.manaRegen * totalHours) : 0;

      // Многофазное восстановление энергии
      const enBaseMax = Number(res.energy?.baseMax ?? enM);
      const enCurMax  = Number(res.energy?.max     ?? enM);
      const enResult  = calcEnergyRegen(enV, enCurMax, enBaseMax, actEff, totalHours);
      const newEnMax  = enResult.newEnMax;
      const newEn     = enResult.newEn;
      const maxDelta  = enResult.maxDelta;

      const newSat = Math.max(0, satV - satCost);
      const newHyd = Math.max(0, hydV - hydCost);
      const newMn  = Math.min(mnM, mnV + mnRegen);

      // Блокировка: если максимум уже 1/1 и энергии не хватит — останавливаем
      const enCostHour = actEff.energyCost ?? 0;
      if (newEnMax <= 1 && enCostHour > 0 && newEn < enCostHour) {
        ui.notifications.error(
          `${actor.name} полностью истощён — не может двигаться дальше! Требуется отдых.`
        );
        await ChatMessage.create({
          content: buildCombatChatCard({
            title: "Истощение",
            icon: "💀",
            status: "остановка",
            statusClass: "is-danger",
            rows: [
              ["Персонаж", actor.name],
              ["Итог", "не может продолжать путь"],
            ],
            notices: [
              ["Нужно", "отдых"],
            ],
            className: "ih-travel-chat-card",
          }),
        });
        // Не применяем это перемещение
        continue;
      }

      // Проверка: потеря сознания при исчерпании max энергии или маны
            // Блокировка: если максимум уже 1 и энергии не хватит — стоп
      const willPassOut    = newEnMax <= 0;
      const willManaFaint  = newMn <= 0 && mnM > 0 && actEff.manaRegen === undefined;

      const upd = {
        "system.resources.satiety.value":   newSat,
        "system.resources.hydration.value": newHyd,
        "system.resources.energy.value":    willPassOut ? 0 : newEn,
        "system.resources.energy.max":      Math.max(1, newEnMax),
        "system.resources.mana.value":      newMn,
      };
      // Записываем baseMax при первом снижении максимума
      if (!res.energy?.baseMax || res.energy.baseMax <= 0) {
        upd["system.resources.energy.baseMax"] = enM;
      }

      // Накладываем состояние "без сознания"
      if (willPassOut || willManaFaint) {
        upd["system.conditions.unconscious"] = 1;
      }

      // Лечение при отдыхе/сне
      if (actEff.heal) {
        const parts = ["head","torso","abdomen","leftArm","rightArm","leftLeg","rightLeg"];
        for (const part of parts) {
          const hp = res.hp?.[part];
          if (!hp) continue;
          const cur = Number(hp.value ?? 0);
          const max = Number(hp.max   ?? 0);
          if (cur < max) {
            const rate    = actEff.sleepBonus ? 0.05 : 0.02;
            const healed  = Math.min(max, cur + Math.ceil(max * rate * this._hours));
            upd[`system.resources.hp.${part}.value`] = healed;
          }
        }
      }

      // Штрафы голода/жажды на энергию-макс
      const hunger = getHungerState(newSat / satM);
      const thirst = getThirstState(newHyd / Number(res.hydration?.max ?? 100));
      const enPenalty = (hunger?.enPenalty ?? 0) + (thirst?.enPenalty ?? 0);
      if (enPenalty > 0) {
        upd["system.resources.energy.max"] = Math.max(10, enM - enPenalty);
      }

      // ── Прогрессия болезней ──────────────────────────────
      const { DISEASES } = await import("../constants/diseases.mjs");

      // Кэшируем в globalThis для синхронного доступа из actor-state-service
      globalThis._IH_DISEASES = DISEASES;

      const diseaseData = foundry.utils.deepClone(actor.system?.diseases ?? {});
      const diseaseMessages = [];

      for (const [dKey, dState] of Object.entries(diseaseData)) {
        if (!dState || dState.stage < 0) continue;
        const def = DISEASES[dKey];
        if (!def) continue;

        const stage = def.stages?.[dState.stage];
        if (!stage) continue;

        // Применяем симптомы drain
        for (const sym of (stage.symptoms ?? [])) {
          if (sym.type === "hydrationDrain") {
            upd["system.resources.hydration.value"] =
              Math.max(0, (upd["system.resources.hydration.value"] ?? Number(res.hydration?.value ?? 0)) - sym.value * this._hours);
          }
          if (sym.type === "satietyDrain") {
            upd["system.resources.satiety.value"] =
              Math.max(0, (upd["system.resources.satiety.value"] ?? Number(res.satiety?.value ?? 0)) - sym.value * this._hours);
          }
          if (sym.type === "hpDrainTorso") {
            const torsoHp = Number(res.hp?.torso?.value ?? 0);
            upd["system.resources.hp.torso.value"] = Math.max(0, torsoHp - sym.value * this._hours);
          }
          if (sym.type === "hpDrainLimb") {
            // Урон конечности (инфекция/гангрена) — случайная рука или нога
            const limbs = ["leftArm","rightArm","leftLeg","rightLeg"];
            const limb  = limbs[Math.floor(Math.random() * limbs.length)];
            const cur   = Number(res.hp?.[limb]?.value ?? 0);
            upd[`system.resources.hp.${limb}.value`] = Math.max(0, cur - sym.value * this._hours);
          }
          if (sym.type === "energyMaxPenalty") {
            upd["system.resources.energy.max"] =
              Math.max(10, (upd["system.resources.energy.max"] ?? Number(res.energy?.max ?? 100)) - sym.value);
          }
          if (sym.type === "manaMaxPenalty") {
            upd["system.resources.mana.max"] =
              Math.max(0, (upd["system.resources.mana.max"] ?? Number(res.mana?.max ?? 50)) - sym.value);
          }
        }

        // Прогрессия стадии
        if (stage.hoursToNext !== null) {
          const newProgress = (dState.progress ?? 0) + this._hours;
          if (newProgress >= stage.hoursToNext) {
            // Переход на следующую стадию
            const nextStage = dState.stage + 1;
            if (nextStage < def.stages.length) {
              diseaseData[dKey] = { stage: nextStage, progress: 0, duration: (dState.duration ?? 0) + this._hours };
              diseaseMessages.push(`⚠ <b>${escapeCombatHtml(actor.name)}</b>: ${escapeCombatHtml(def.icon)} ${escapeCombatHtml(def.label)} → <b>${escapeCombatHtml(def.stages[nextStage].label)}</b>`);
            }
          } else {
            diseaseData[dKey] = { ...dState, progress: newProgress, duration: (dState.duration ?? 0) + this._hours };
          }
        } else {
          // Критическая стадия — только накапливаем время
          diseaseData[dKey] = { ...dState, duration: (dState.duration ?? 0) + this._hours };
        }

        // Естественное выздоровление при отдыхе/сне
        if (actEff.heal && def.naturalCureChance > 0) {
          const roll = Math.random();
          const chancePerHour = def.naturalCureChance * this._hours;
          if (roll < chancePerHour) {
            diseaseData[dKey] = { stage: -1, progress: 0, duration: dState.duration ?? 0 };
            diseaseMessages.push(`✅ <b>${escapeCombatHtml(actor.name)}</b>: ${escapeCombatHtml(def.icon)} ${escapeCombatHtml(def.label)} — <b>выздоровел!</b>`);
          }
        }
      }

      if (Object.keys(diseaseData).length) {
        upd["system.diseases"] = diseaseData;
      }

      await actor.update(upd);

      // Болезни в чат
      if (diseaseMessages.length) {
        await ChatMessage.create({ content: diseaseMessages.join("<br>") });
      }

      const fmt = (v) => Number(v).toFixed(2).replace(/\.?0+$/, "");

      let msg = `<b>${escapeCombatHtml(actor.name)}</b>`;
      if (satCost > 0.01) msg += ` · 🍖 ${fmt(satV)}→${fmt(newSat)}`;
      if (hydCost > 0.01) msg += ` · 💧 ${fmt(hydV)}→${fmt(newHyd)}`;

      // Энергия — итог
      if (actEff.energyRegen) {
        const enChange = newEn - enV;
        if (enChange !== 0)
          msg += ` · ⚡ тек: ${enV}→${newEn} (${enChange > 0 ? "+" : ""}${enChange})`;
        if (maxDelta > 0)
          msg += ` · ⬆⚡ макс: ${enCurMax}→${newEnMax} (+${maxDelta})`;
        if (enChange === 0 && maxDelta === 0)
          msg += ` · ⚡ полностью восстановлена (${newEn}/${newEnMax})`;
      } else if (actEff.energyCost) {
        const enSpent = enV - newEn;
        if (enSpent > 0.01)
          msg += ` · ⚡ ${fmt(enV)}→${fmt(newEn)} (−${fmt(enSpent)})`;
        // Сообщение об усталости при снижении максимума
        if (maxDelta < 0) {
          msg += ` <span class="ih-travel-alert is-warn">⚠ Усталость: макс. ⚡ ${enCurMax}→${newEnMax}</span>`;
        }
        if (newEnMax <= 3 && newEnMax > 1) {
          msg += ` <span class="ih-travel-alert is-danger">⚠ Критическая усталость!</span>`;
        }
      }

      if (newMn >= mnM) msg += ` · ✨ мана полная`;
      else if (mnRegen > 0) msg += ` · ✨ ${mnV}→${newMn} (+${mnRegen})`;

      if (hunger) msg += ` <span class="ih-travel-alert is-warn">⚠ ${escapeCombatHtml(hunger.label)} (−${hunger.enPenalty} макс.⚡)</span>`;
      if (thirst) msg += ` <span class="ih-travel-alert is-warn">⚠ ${escapeCombatHtml(thirst.label)} (−${thirst.enPenalty} макс.⚡)</span>`;
      if (willPassOut)   msg += ` <span class="ih-travel-alert is-danger">💀 Потерял сознание — макс. энергия исчерпана!</span>`;
      if (willManaFaint) msg += ` <span class="ih-travel-alert is-magic">💀 Потерял сознание — мана иссякла!</span>`;
      messages.push(msg);
    }

    // Обновляем localHours группы
    const group = this._getTargetGroup();
    if (group) {
      const groups = getPartyGroups().map(g =>
        g.id === group.id
          ? { ...g, localHours: (g.localHours ?? 0) + this._hours }
          : g
      );
      await savePartyGroups(groups);
    }

    // Прогрессия болезней
    for (const actor of members) {
      const diseases = actor.system?.diseases ?? {};
      const updates  = {};
      let diseaseMessages = [];

      for (const [key, data] of Object.entries(diseases)) {
        if (!data || data.stage < 0) continue;
        const def   = DISEASES[key];
        if (!def) continue;
        const stage = def.stages[data.stage];
        if (!stage) continue;

        // Накапливаем прогресс (1 прогресс = 1 час)
        const hoursToNext  = stage.hoursToNext ?? null;
        const newProgress  = (data.progress ?? 0) + this._hours;
        const newDuration  = (data.duration  ?? 0) + this._hours;

        // Шанс естественного выздоровления (только при отдыхе/сне)
        if (actEff.heal && def.naturalCureChance > 0) {
          const cureRoll = Math.random();
          if (cureRoll < def.naturalCureChance * this._hours) {
            updates[`system.diseases.${key}`] = { stage: -1, progress: 0, duration: 0 };
            diseaseMessages.push(`✅ ${def.label} — прошла сама`);
            continue;
          }
        }

        // Прогресс до следующей стадии
        if (hoursToNext && newProgress >= hoursToNext && data.stage < def.stages.length - 1) {
          const newStage = data.stage + 1;
          updates[`system.diseases.${key}`] = { stage: newStage, progress: 0, duration: newDuration };
          const nextLabel = def.stages[newStage]?.label ?? "Критическая";
          diseaseMessages.push(`⚠ ${def.label} прогрессирует → ${nextLabel}`);
        } else {
          updates[`system.diseases.${key}`] = { ...data, progress: newProgress, duration: newDuration };
        }
      }

      if (Object.keys(updates).length) await actor.update(updates);
      if (diseaseMessages.length) {
        await ChatMessage.create({
          content: buildCombatChatCard({
            title: "Болезнь",
            subtitle: actor.name,
            icon: "⚠",
            status: "прогресс",
            statusClass: "is-warn",
            bodyHtml: diseaseMessages.join(", "),
            className: "ih-travel-chat-card",
          }),
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
    }

    // Двигаем время мира (часы + минуты)
    const totalSecs = this._hours * 3600 + this._mins * 60;
    if (totalSecs > 0) await game.time?.advance?.(totalSecs);

    // Обновляем освещение
    try {
      const { applyLightingToScene } = await import("../services/weather-service.mjs");
      await applyLightingToScene(canvas?.scene);
      game.ironHills?.apps?.weather?.render?.(false);
    } catch(e) {}

    // Обновляем освещение и WeatherApp
    try {
      const { applyLightingToScene } = await import("../services/weather-service.mjs");
      await applyLightingToScene(canvas?.scene);
      game.ironHills?.apps?.weather?.render?.(false);
    } catch(e) { /* weather service недоступен */ }

    await ChatMessage.create({
      content: buildCombatChatCard({
        title: `${group?.label ?? "Все"} — ${act.label}`,
        icon: "⏳",
        status: `${this._hours}ч ${this._mins > 0 ? `${this._mins}м` : ""}`.trim(),
        bodyHtml: messages.join("<br>"),
        className: "ih-travel-chat-card",
      }),
    });

    ui.notifications.info(`Прошло ${this._hours}ч — готово.`);
    this.render(false);
  }
}

export { IronHillsTravelApp };
