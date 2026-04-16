/**
 * Iron Hills — Travel App v2
 * Поддержка групп персонажей, реген ресурсов, неактивные пачки.
 */
import {
  getPartyGroups, savePartyGroups,
  getMembersOfGroup, getActiveGroup
} from "../services/party-manager.mjs";
import { DISEASES, getActiveDiseases, getDiseasesPenalties } from "../constants/diseases.mjs";

const BASE_RATES = {
  satiety:    2,
  hydration:  4,
};

const ACTIVITIES = [
  { key:"rest",   label:"🛏 Отдых",    satiety:1, hydration:2, energyRegen:0.15, manaRegen:0.05, hpRegen:0.02, heal:true  },
  { key:"sleep",  label:"😴 Сон",      satiety:1, hydration:2, energyRegen:0.25, manaRegen:0.10, hpRegen:0.05, heal:true, sleepBonus:true },
  { key:"walk",   label:"🚶 Переход",  satiety:3, hydration:5, energyRegen:0,    manaRegen:0,    hpRegen:0,    energyCost:2 },
  { key:"ride",   label:"🐴 Верхом",   satiety:2, hydration:3, energyRegen:0,    manaRegen:0,    hpRegen:0,    energyCost:1 },
  { key:"work",   label:"⚒ Работа",   satiety:3, hydration:4, energyRegen:0,    manaRegen:0,    hpRegen:0,    energyCost:3 },
  { key:"combat", label:"⚔ Бой",      satiety:4, hydration:6, energyRegen:0,    manaRegen:0,    hpRegen:0,    energyCost:5 },
];

// Неактивная группа — минимальный расход (сидят в городе)
const IDLE_RATES = { satiety: 0.5, hydration: 1 };

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
    this._activity = "walk";
    this._groupId  = null; // null = активная группа
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "travel-app"],
      width:     580,
      height:    580,
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

      const satCost = act.satiety   * this._hours;
      const hydCost = act.hydration * this._hours;
      const enRegen = act.energyRegen ? Math.floor(enMax * act.energyRegen * this._hours) : 0;
      const mnRegen = act.manaRegen   ? Math.floor(mnMax * act.manaRegen   * this._hours) : 0;
      const enCost  = act.energyCost  ? act.energyCost * this._hours : 0;

      const newSat = Math.max(0, satVal - satCost);
      const newHyd = Math.max(0, hydVal - hydCost);
      const newEn  = enRegen > 0
        ? Math.min(enMax, enVal + enRegen)
        : Math.max(0, enVal - enCost);
      const newMn  = Math.min(mnMax, mnVal + mnRegen);

      const hunger = getHungerState(newSat / satMax);
      const thirst = getThirstState(newHyd / hydMax);

      return {
        name: actor.name, img: actor.img,
        satVal, satMax, hydVal, hydMax, enVal, enMax, mnVal, mnMax,
        satCost, hydCost, enRegen, mnRegen, enCost,
        newSat, newHyd, newEn, newMn,
        satPct: Math.round(newSat / satMax * 100),
        hydPct: Math.round(newHyd / hydMax * 100),
        enPct:  Math.round(newEn  / enMax  * 100),
        hungerLabel: hunger?.label ?? "",
        thirstLabel: thirst?.label ?? "",
        hasWarning:  !!(hunger || thirst),
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

    return {
      groups,
      groupId:     group?.id ?? "",
      groupLabel:  group?.label ?? "Все персонажи",
      groupColor:  group?.color ?? "#5b9cf6",
      hours:       this._hours,
      activity:    this._activity,
      activities:  ACTIVITIES,
      preview,
      hasMembers:  preview.length > 0,
      otherGroups,
      hasOtherGroups: otherGroups.length > 0,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Выбор группы
    html.find("[data-group-select]").on("change", e => {
      this._groupId = e.currentTarget.value || null;
      this.render(false);
    });

    // Ползунок часов
    html.find("[data-hours-input]").on("input", e => {
      this._hours = Math.max(1, Math.min(72, parseInt(e.currentTarget.value) || 1));
      html.find("[data-hours-label]").text(this._hours);
      this.render(false);
    });

    // Быстрые часы
    html.find("[data-preset-hours]").on("click", e => {
      this._hours = parseInt(e.currentTarget.dataset.presetHours);
      this.render(false);
    });

    // Активность
    html.find("[data-activity]").on("click", e => {
      this._activity = e.currentTarget.dataset.activity;
      this.render(false);
    });

    // Применить
    html.find("[data-apply-time]").on("click", () => this._applyTime(false));
    html.find("[data-apply-rest]").on("click", () => {
      this._activity = "rest";
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
      const res   = actor.system?.resources ?? {};
      const satV  = Number(res.satiety?.value  ?? 100);
      const satM  = Number(res.satiety?.max    ?? 100);
      const hydV  = Number(res.hydration?.value ?? 100);
      const enV   = Number(res.energy?.value   ?? 100);
      const enM   = Number(res.energy?.max     ?? 100);
      const mnV   = Number(res.mana?.value     ?? 50);
      const mnM   = Number(res.mana?.max       ?? 50);

      const satCost = act.satiety   * this._hours;
      const hydCost = act.hydration * this._hours;
      const enRegen = act.energyRegen ? Math.floor(enM * act.energyRegen * this._hours) : 0;
      const mnRegen = act.manaRegen   ? Math.floor(mnM * act.manaRegen   * this._hours) : 0;
      const enCost  = act.energyCost  ? act.energyCost * this._hours : 0;

      const newSat = Math.max(0, satV - satCost);
      const newHyd = Math.max(0, hydV - hydCost);
      const newEn  = enRegen > 0
        ? Math.min(enM, enV + enRegen)
        : Math.max(0, enV - enCost);
      const newMn  = Math.min(mnM, mnV + mnRegen);

      const upd = {
        "system.resources.satiety.value":   newSat,
        "system.resources.hydration.value": newHyd,
        "system.resources.energy.value":    newEn,
        "system.resources.mana.value":      newMn,
      };

      // Лечение при отдыхе/сне
      if (act.heal) {
        const parts = ["head","torso","abdomen","leftArm","rightArm","leftLeg","rightLeg"];
        for (const part of parts) {
          const hp = res.hp?.[part];
          if (!hp) continue;
          const cur = Number(hp.value ?? 0);
          const max = Number(hp.max   ?? 0);
          if (cur < max) {
            const rate    = act.sleepBonus ? 0.05 : 0.02;
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
              diseaseMessages.push(`⚠ <b>${actor.name}</b>: ${def.icon} ${def.label} → <b>${def.stages[nextStage].label}</b>`);
            }
          } else {
            diseaseData[dKey] = { ...dState, progress: newProgress, duration: (dState.duration ?? 0) + this._hours };
          }
        } else {
          // Критическая стадия — только накапливаем время
          diseaseData[dKey] = { ...dState, duration: (dState.duration ?? 0) + this._hours };
        }

        // Естественное выздоровление при отдыхе/сне
        if (act.heal && def.naturalCureChance > 0) {
          const roll = Math.random();
          const chancePerHour = def.naturalCureChance * this._hours;
          if (roll < chancePerHour) {
            diseaseData[dKey] = { stage: -1, progress: 0, duration: dState.duration ?? 0 };
            diseaseMessages.push(`✅ <b>${actor.name}</b>: ${def.icon} ${def.label} — <b>выздоровел!</b>`);
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

      let msg = `<b>${actor.name}</b>`;
      if (satCost > 0) msg += ` · сыт: ${satV}→${newSat}`;
      if (hydCost > 0) msg += ` · вода: ${hydV}→${newHyd}`;
      if (enRegen > 0) msg += ` · энергия: +${enRegen}`;
      if (mnRegen > 0) msg += ` · мана: +${mnRegen}`;
      if (hunger)      msg += ` <span style="color:${hunger.color}">⚠ ${hunger.label}</span>`;
      if (thirst)      msg += ` <span style="color:${thirst.color}">⚠ ${thirst.label}</span>`;
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
        if (act.heal && def.naturalCureChance > 0) {
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
          content: `<b>${actor.name}:</b> ${diseaseMessages.join(", ")}`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
    }

    // Двигаем время мира
    await game.time?.advance?.(this._hours * 3600);

    await ChatMessage.create({
      content: `<div style="border:1px solid rgba(91,156,246,0.3);border-radius:8px;
                padding:10px;background:rgba(91,156,246,0.05);">
        <b>⏳ ${group?.label ?? "Все"} — ${this._hours}ч · ${act.label}</b>
        <hr style="border-color:rgba(255,255,255,0.08);margin:5px 0;">
        ${messages.join("<br>")}
      </div>`
    });

    ui.notifications.info(`Прошло ${this._hours}ч — готово.`);
    this.render(false);
  }
}

export { IronHillsTravelApp };
