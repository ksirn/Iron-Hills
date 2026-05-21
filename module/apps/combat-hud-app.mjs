import { IronHillsCombatTechniqueApp, AIM_ZONES } from "./combat-technique-app.mjs";
import { IronHillsSpellCastApp } from "./spell-cast-app.mjs";
import { TarkovTradeApp } from "./tarkov-trade-app.mjs";
import { performActorAttack } from "../services/attack-flow-service.mjs";
import { buildHitEffect } from "../services/hit-effect-service.mjs";
import { getActiveConditionEntries } from "../services/condition-policy-service.mjs";
import {
  buildTechniqueAttackParams,
  getTechniqueAoeConfig,
  isTechniqueSupportAction
} from "../services/combat-technique-service.mjs";
import {
  executePendingCombatActionForActorSheet,
  performAttackForActorSheet,
  resolveCombatTimeCostForActorSheet,
  useQuickSlotForActorSheet,
} from "../services/actor-sheet-orchestration-service.mjs";
import { resolveCombatTimeCostForActor } from "../services/actor-combat-sheet-service.mjs";
import {
  castCatalogSpellAction,
  performCombatAoeAttack,
  performTechniqueSupportCombatAction,
} from "../services/combat-special-action-service.mjs";
import { requestGmHostileAction } from "../services/hostile-action-service.mjs";
import {
  buildActorBaseAttackParams,
} from "../services/combat-attack-profile-service.mjs";
import { getAvailableTechniques } from "../constants/combat-techniques.mjs";
import {
  getCombatUiState,
  isCombatActive,
  nextTurn,
  endCombat,
  canActorCommitAction,
  getActorPendingAction,
  continuePendingAction,
  cancelPendingAction,
  endTurnForActor,
  isActorActiveTurn,
  advanceTurnIfReady,
  spendActionSeconds
} from "../services/combat-flow-service.mjs";

import {
  getPersistentActor,
  getPersistentActorUuid,
  resolvePersistentActorFromTokenOrUser
} from "../utils/actor-utils.mjs";
import { markActorDead } from "../services/condition-service.mjs";
import { num } from "../utils/math-utils.mjs";

function getRatio(value, max) {
  const safeMax = Math.max(1, num(max, 1));
  return Math.max(0, Math.min(1, num(value, 0) / safeMax));
}

async function chooseTechniqueTargetZone(technique) {
  return new Promise(resolve => {
    const buttons = {};
    for (const zone of AIM_ZONES) {
      buttons[zone.key] = {
        label: `${zone.icon ?? ""} ${zone.label}`,
        callback: () => resolve(zone),
      };
    }
    buttons.cancel = {
      label: "Отмена",
      callback: () => resolve(null),
    };

    new Dialog({
      title: `${technique?.label ?? "Приём"}: зона попадания`,
      content: `<p>Выберите зону для точного броска.</p>`,
      buttons,
      default: "torso",
      close: () => resolve(null),
    }).render(true);
  });
}

function getZoneClass(value, max) {
  const ratio = getRatio(value, max);
  if (ratio <= 0) return "is-dead";
  if (ratio <= 0.25) return "is-critical";
  if (ratio <= 0.5) return "is-bad";
  if (ratio <= 0.75) return "is-warn";
  return "is-good";
}

function getHudActor() {
  return resolvePersistentActorFromTokenOrUser();
}

function getParticipantSideClass(side) {
  if (side === "ally") return "side-ally";
  if (side === "enemy") return "side-enemy";
  return "side-neutral";
}

function isFriendlySide(a, b) {
  if (a === "neutral" || b === "neutral") return false;
  return a === b;
}

function getPartTrauma(hpNode) {
  const status = hpNode?.status ?? {};
  const majorBleeding = Number(status.majorBleeding ?? 0);
  const tourniquet = Boolean(status.tourniquet);
  return {
    minorBleeding: Number(status.minorBleeding ?? 0),
    majorBleeding,
    activeMajorBleeding: tourniquet ? 0 : majorBleeding,
    suppressedMajorBleeding: tourniquet ? majorBleeding : 0,
    fracture: Boolean(status.fracture),
    destroyed: Boolean(status.destroyed),
    splinted: Boolean(status.splinted),
    tourniquet
  };
}

// Строит строку tooltip для части тела
function buildZoneTooltip(label, value, max, trauma) {
  const parts = [`${label}: ${value}/${max}`];
  if (trauma.destroyed)       parts.push("⚫ Разрушено");
  if (trauma.majorBleeding) {
    parts.push(trauma.suppressedMajorBleeding
      ? `🔴 Сильн. кровотечение пережато: ${trauma.majorBleeding}`
      : `🔴 Сильн. кровотечение: ${trauma.majorBleeding}`);
  }
  if (trauma.minorBleeding)   parts.push(`🟡 Мал. кровотечение: ${trauma.minorBleeding}`);
  if (trauma.fracture)        parts.push("🟣 Перелом");
  if (trauma.tourniquet)      parts.push("🔵 Жгут наложен");
  if (trauma.splinted)        parts.push("🟢 Шина наложена");
  return parts.join(" | ");
}

export class IronHillsCombatHudApp extends Application {
  constructor(options = {}) {
    super(options);
    // Компактный режим убран — панель всегда развёрнута
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "combat-hud-app"],
      width:     220,
      height:    "auto",
      resizable: false,
      title:     "HUD",
      popOut:    true,
    });
  }

  setPosition(pos = {}) {
    // Фиксируем в нижнем левом углу над тулбаром
    const tbH = document.getElementById("ih-tb")?.offsetHeight ?? 60;
    const h   = this.element?.[0]?.offsetHeight ?? 400;
    pos.left   = 4;
    pos.top    = window.innerHeight - tbH - h - 8;
    pos.width  = 320;
    return super.setPosition(pos);
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/combat-hud.hbs";
  }

  _applySizing() {
    try {
      if (!this.rendered) return;
      this.setPosition({
        width: this._compactMode ? 320 : 620,
        height: "auto"
      });
    } catch (err) {
      console.warn("Iron Hills | HUD sizing failed", err);
    }
  }

  _refreshHud({ keepOnTop = false } = {}) {
    if (!this.rendered) return;
    this.render(false, { focus: false });

    window.setTimeout(() => {
      this._applySizing();
      if (keepOnTop) {
        try {
          if (this.element?.length) this.bringToTop();
        } catch (_err) {}
      }
    }, 10);
  }

  _canActorUseCombatAction(actor) {
    return canActorCommitAction(actor);
  }

  _completeHudSpellCast() {
    this._refreshHud({ keepOnTop: true });
  }

  async _resolveHudCombatTimeCost(actor, args = {}) {
    if (actor?.sheet) {
      return resolveCombatTimeCostForActorSheet(actor.sheet, args);
    }

    return resolveCombatTimeCostForActor(actor, args, {
      requireSettledInventory: (label) => this._requireSettledInventory(actor, label),
    });
  }

  async _requireSettledInventory(actor, actionLabel = "действие") {
    const { requireNoPendingInventory } = await import("./pending-items-app.mjs").catch(() => ({}));
    if (!requireNoPendingInventory) return true;
    const result = await requireNoPendingInventory(actor, { actionLabel });
    return Boolean(result?.ok);
  }

  async _performTechniqueSupportAction(actor, technique, { weapon = null } = {}) {
    return performTechniqueSupportCombatAction({
      actor,
      technique,
      weapon,
      resolveCombatTimeCost: (args) => this._resolveHudCombatTimeCost(actor, args),
      afterAction: () => this._refreshHud({ keepOnTop: true }),
    });
  }

  async _toggleCompactMode() {
    this._compactMode = !this._compactMode;
    this.render(true, { focus: false });

    window.setTimeout(() => {
      this._applySizing();
      try {
        if (this.element?.length) this.bringToTop();
      } catch (_err) {}
    }, 10);
  }

  // Универсальный вызов атаки — работает для персонажей, NPC и монстров
  _getActorSheetActionOptions(actor) {
    return {
      actorSheetClass: actor?.sheet?.constructor ?? null,
      tradeAppClass: TarkovTradeApp,
    };
  }

  async _callPerformAttack(actor, params) {
    const attackParams = {
      ...params,
      targets: params.targets ?? game.user?.targets ?? [],
      autoTargetHostile: params.autoTargetHostile ?? actor?.type !== "character",
      useExplodingDice: params.useExplodingDice ?? actor?.type === "character",
    };
    // Персонаж — есть _performAttack на sheet
    if (actor?.type === "character" && actor.sheet) {
      return performAttackForActorSheet(actor.sheet, attackParams, this._getActorSheetActionOptions(actor));
    }
    // NPC/монстр — используем упрощённую атаку через combat-flow-service
    return performActorAttack({
      actor,
      ...attackParams,
      requireSettledInventory: (label) => this._requireSettledInventory(actor, label),
      resolveCombatTimeCost: (args) => this._resolveHudCombatTimeCost(actor, args),
      requestHostileAction: (label) => requestGmHostileAction(actor, label),
      onLethal: (target) => markActorDead(target),
    });
  }

  // ── Кастование заклинания ───────────────────────────────────
  async _castSpell() {
    const actor = getHudActor();
    if (!actor) return;
    if (!(await this._requireSettledInventory(actor, "заклинание"))) return;
    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) { ui.notifications.warn(combatCheck.reason); return; }
    const targets = [...(game.user.targets ?? [])].map(t => t.actor).filter(Boolean);
    const choice  = await IronHillsSpellCastApp.choose(actor, targets);
    if (!choice) return;
    const { spell } = choice;

    const result = await castCatalogSpellAction({
      actor,
      spell,
      targets: game.user?.targets ?? [],
      resolveCombatTimeCost: (args) => this._resolveHudCombatTimeCost(actor, args),
      requestHostileAction: (label) => requestGmHostileAction(actor, label),
    });

    if (result?.queued) {
      this._refreshHud({ keepOnTop: true });
      return;
    }

    this._completeHudSpellCast();
  }

    // ── AoE Атака ──────────────────────────────────────────────
  async _performAoeAttack(actor, { aoeType, distance, baseDamage, energyCost,
      skillKey, label, damageType = "physical", ignoreArmor = 0,
      targetMode = "blast", maxTargets = null, chainDecay = 1,
      hitBonus = 0, skillValueFallback = null, targetZone = null, targetZoneMode = null, applyCondition = null,
      conditionDuration = 0, conditionChance = 1, effectNotes = [],
      friendlyFire = false, friendlyFireMode = null }) {
    const result = await performCombatAoeAttack({
      actor,
      shape: aoeType,
      distance,
      targetMode,
      maxTargets,
      chainDecay,
      baseDamage,
      energyCost,
      skillKey,
      label,
      damageType,
      ignoreArmor,
      hitBonus,
      skillValueFallback,
      targetZone,
      targetZoneMode,
      effect: buildHitEffect(null, {
        applyCondition,
        conditionDuration,
        conditionChance,
        notes: effectNotes,
      }),
      friendlyFire,
      friendlyFireMode,
      color: skillKey === "bow" || skillKey === "crossbow" ? "#4488ff" : "#ff4444",
      resolveCombatTimeCost: (args) => this._resolveHudCombatTimeCost(actor, args),
      afterAction: () => this._refreshHud({ keepOnTop: true }),
    });

    if (result?.queued || !result?.ok) this._refreshHud({ keepOnTop: true });

    return result;
  }

  // ── «Перевести дух» — тратит весь ход, восстанавливает энергию ─
  async _breathe() {
    const actor = getHudActor();
    if (!actor) return;
    if (!(await this._requireSettledInventory(actor, "перевести дух"))) return;

    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) {
      ui.notifications.warn(combatCheck.reason || "Сейчас действие недоступно.");
      return;
    }

    const energyMax = Number(actor.system?.resources?.energy?.max   ?? 10);
    const baseMax   = Number(actor.system?.resources?.energy?.baseMax ?? energyMax);
    const minMax    = Math.max(1, Math.floor(baseMax * 0.20));

    // Восстанавливаем энергию до max, но max -1 (небольшая усталость от передышки в бою)
    const newMax = Math.max(minMax, energyMax - 1);
    await actor.update({
      "system.resources.energy.value": newMax,
      "system.resources.energy.max":   newMax,
    });

    // Тратим весь ход
    spendActionSeconds(actor, 6, { actionType: "breathe", label: "Перевести дух" });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div style="padding:6px">
        💨 <b>${actor.name}</b> переводит дух.<br>
        ⚡ Энергия: <b>${newMax}/${newMax}</b>
        ${newMax < energyMax ? `<br><span style="color:#f87171">Макс. энергии −1 от усталости</span>` : ""}
      </div>`
    });

    this._refreshHud({ keepOnTop: true });
  }

  async _attack(hand) {
    const actor = getHudActor();
    if (!actor?.sheet) return;
    if (!(await this._requireSettledInventory(actor, "атака"))) return;

    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) {
      ui.notifications.warn(combatCheck.reason || "Сейчас действие недоступно.");
      return;
    }

    const weaponId = actor.system?.equipment?.[hand];
    const weapon   = weaponId ? actor.items.get(weaponId) : null;

    // Базовые параметры атаки
    // Для монстров — берём из combat профиля если нет экипированного оружия
    const isMonster  = actor.type === "monster";
    const npcAttack  = actor.system?.combat?.attacks?.[0]; // первая атака из профиля

    const baseParams = weapon ? {
      hand,
      skillKey:   weapon.system.skill,
      label:      weapon.name,
      damageType: weapon.system.damageType,
      baseDamage: Number(weapon.system.damage ?? 1),
      energyCost: Number(weapon.system.energyCost ?? 10),
      weapon,
    } : isMonster && npcAttack ? {
      hand,
      skillKey:   npcAttack.skillKey ?? "unarmed",
      label:      npcAttack.label    ?? actor.name,
      damageType: npcAttack.damageType ?? "physical",
      baseDamage: Number(npcAttack.damage ?? actor.system?.combat?.damage ?? 2),
      energyCost: Number(npcAttack.energyCost ?? 3),
      weapon:     null,
    } : {
      hand,
      skillKey:   "unarmed",
      label:      isMonster ? `Атака: ${actor.name}` : "Кулаки",
      damageType: "physical",
      baseDamage: Number(actor.system?.combat?.damage ?? actor.system?.combat?.unarmedDamage ?? 1),
      energyCost: isMonster ? 3 : 2,
      weapon:     null,
    };

    // Получаем цели из таргетов
    const targets = [...(game.user.targets ?? [])].map(t => t.actor).filter(Boolean);

    // Есть ли доступные приёмы или прицельный удар?
    const techniques = weapon ? getAvailableTechniques(actor, weapon) : [];
    const skillVal   = Number(
      actor.system?.skills?.[baseParams.skillKey]?.value
      ?? actor.system?.combat?.attackSkill
      ?? actor.system?.combat?.unarmedSkill
      ?? 0
    );
    const canAim     = skillVal >= 3;
    const profileParams = buildActorBaseAttackParams(actor, { hand });
    Object.assign(baseParams, {
      skillValueFallback: profileParams.skillValueFallback,
      actionSeconds: profileParams.actionSeconds ?? baseParams.actionSeconds ?? null,
      rangeOverride: profileParams.rangeOverride ?? baseParams.rangeOverride ?? null,
    });

    if (techniques.length > 0 || canAim) {
      // Показываем диалог выбора
      const choice = await IronHillsCombatTechniqueApp.choose(actor, weapon, targets, baseParams);
      if (!choice) return; // отмена

      if (choice.type === "basic") {
        // Обычный удар
        await this._callPerformAttack(actor, baseParams);

      } else if (choice.type === "technique") {
        const tech = choice.technique;
        if (isTechniqueSupportAction(tech)) {
          await this._performTechniqueSupportAction(actor, tech, { weapon });
          this._refreshHud({ keepOnTop: true });
          return;
        }

        const targetZoneChoice = tech.effect?.special === "choose_zone"
          ? await chooseTechniqueTargetZone(tech)
          : null;
        if (tech.effect?.special === "choose_zone" && !targetZoneChoice) return;

        const primaryTarget = targets[0] ?? null;
        const techniqueParams = buildTechniqueAttackParams({
          baseParams,
          technique: tech,
          attacker: actor,
          target: primaryTarget,
          targetZoneChoice,
        });

        // AoE приём — используем MeasuredTemplate
        if (tech.effect.special === "aoe" && tech.effect.aoe) {
          const aoe = getTechniqueAoeConfig(tech.effect);
          await this._performAoeAttack(actor, {
            aoeType:     aoe.shape,
            targetMode:  aoe.type,
            distance:    aoe.distance,
            maxTargets:  aoe.maxTargets,
            chainDecay:  aoe.chainDecay,
            baseDamage:  techniqueParams.baseDamage,
            energyCost:  techniqueParams.energyCost,
            skillKey:    techniqueParams.skillKey,
            label:       techniqueParams.label,
            damageType:  techniqueParams.damageType,
            ignoreArmor: techniqueParams.ignoreArmor,
            hitBonus:    techniqueParams.hitBonus,
            skillValueFallback: techniqueParams.skillValueFallback,
            targetZone:  techniqueParams.targetZone,
            applyCondition: techniqueParams.applyCondition,
            conditionDuration: techniqueParams.conditionDuration,
            conditionChance: techniqueParams.conditionChance,
            effectNotes: techniqueParams.effectNotes,
            friendlyFire: aoe.friendlyFire,
            friendlyFireMode: aoe.friendlyFireMode,
            targetZoneMode: aoe.targetZoneMode,
          });
        } else {
          // Обычный одиночный приём
          await this._callPerformAttack(actor, techniqueParams);
        }

      } else if (choice.type === "aimed") {
        // Прицельный удар
        const zone = choice.zone;
        const extraEnergy = 4; // прицеливание стоит доп. энергии
        await this._callPerformAttack(actor, {
          ...baseParams,
          label:       `${baseParams.label} → ${zone.label}`,
          baseDamage:  Math.round(baseParams.baseDamage * zone.damageMult),
          energyCost:  baseParams.energyCost + extraEnergy,
          hitBonus:    zone.hitMod,
          targetZone:  zone.key,
          aimed:       true,
        });
      }
    } else {
      // Нет приёмов — сразу обычный удар
      await this._callPerformAttack(actor, baseParams);
    }

    this._refreshHud({ keepOnTop: true });
  }

  async _useQuickSlot(slotKey) {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    await useQuickSlotForActorSheet(actor.sheet, slotKey, {}, this._getActorSheetActionOptions(actor));
    this._refreshHud({ keepOnTop: true });
  }

  async _continuePendingAction() {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    const pending = getActorPendingAction(actor);
    if (!pending) {
      ui.notifications.warn("Нет длительного действия для продолжения.");
      return;
    }

    const result = continuePendingAction(actor);
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось продолжить действие.");
      return;
    }

    if (!result.done) {
      ui.notifications.info(
        `${actor.name} продолжает действие. Осталось ${Number(result.action?.remainingSeconds ?? 0)} сек.`
      );
      this._refreshHud({ keepOnTop: true });
      return;
    }

    if (actor.sheet) {
      await executePendingCombatActionForActorSheet(actor.sheet, result.action, this._getActorSheetActionOptions(actor));
    }

    this._refreshHud({ keepOnTop: true });
  }

  async _cancelPendingAction() {
    const actor = getHudActor();
    if (!actor) return;

    const result = cancelPendingAction(actor);
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось отменить действие.");
      return;
    }

    ui.notifications.info(`${actor.name} отменяет длительное действие.`);
    this._refreshHud({ keepOnTop: true });
  }

async _endTurnForActor() {
  const actor = getHudActor();
  if (!actor) return;

  const result = endTurnForActor(actor);
  if (!result?.ok) {
    ui.notifications.warn(result?.reason || "Не удалось завершить ход.");
    return;
  }

  const advanceResult = await advanceTurnIfReady();
  if (!advanceResult?.ok) {
    ui.notifications.warn(advanceResult?.reason || "Ход завершён, но передача следующему участнику не выполнена.");
    this._refreshHud({ keepOnTop: true });
    return;
  }

  this._refreshHud({ keepOnTop: true });
}

// _endMyTurn удалён: дублировал _endTurnForActor, но без advanceTurnIfReady.
  // Все вызовы завершения хода идут через _endTurnForActor.

async _nextTurn() {
  if (!isCombatActive()) {
    ui.notifications.warn("Активного боя нет.");
    return;
  }

  const actor = getHudActor();

  if (actor && isActorActiveTurn(actor)) {
    await this._endTurnForActor();
    return;
  }

  if (game.user?.isGM) {
    const nextResult = await nextTurn();
    if (nextResult?.ok === false) {
      ui.notifications.warn(nextResult?.reason || "Не удалось передать ход.");
      return;
    }

    this._refreshHud({ keepOnTop: true });
    return;
  }

  ui.notifications.warn("Сейчас не ваш активный ход.");
}

  async _endCombat() {
    if (!isCombatActive()) {
      ui.notifications.warn("Активного боя нет.");
      return;
    }

    await endCombat();
    this._refreshHud({ keepOnTop: true });
  }

  async getData() {
    const actor = getHudActor();
    const state = getCombatUiState();
const current =
  (state.participants ?? [])[Math.max(0, Number(state.turn ?? 1) - 1)] ?? null;

    if (!actor) {
      return {
        hasActor: false,
        combatActive: isCombatActive(),
        compactMode: this._compactMode
      };
    }

    const hp = actor.system?.resources?.hp ?? {};
    const resources = actor.system?.resources ?? {};
    const quickSlots = actor.system?.quickSlots ?? {};
    const slotKeys = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"];
    const actorUuid = getPersistentActorUuid(actor);
    const actorParticipant =
      (state.participants ?? []).find(participant => participant.actorUuid === actorUuid) ?? null;
    const actorSide = actorParticipant?.side ?? "neutral";
    const pendingAction = actorParticipant?.pendingAction ?? null;
    const globalEffects = getActiveConditionEntries(actor.system?.conditions ?? {});

    return {
      hasActor: true,
      compactMode: true,
      combatActive: isCombatActive(),
      actorName: actor.name,
      actorImg: actor.img,
      actorSide,
      actorSideClass: getParticipantSideClass(actorSide),
isCurrentTurn: Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
canEndTurn: Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
canContinuePendingAction:
  Boolean(actorParticipant?.pendingAction) &&
  Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
      currentTurnName: current?.actorName || "—",
      secondsLeft: actorParticipant ? num(actorParticipant.remainingSeconds, 0) : null,
      isSkippingTurn: Boolean(
        actorParticipant &&
        Number(actorParticipant.remainingSeconds ?? 0) <= 0 &&
        !actorParticipant.pendingAction &&
        actorParticipant.hasActed
      ),

      energyValue: num(resources.energy?.value, 0),
      energyMax: num(resources.energy?.max, 0),
      manaValue: num(resources.mana?.value, 0),
      manaMax: num(resources.mana?.max, 0),
      satietyValue: num(resources.satiety?.value, 0),
      satietyMax: num(resources.satiety?.max, 0),
      hydrationValue: num(resources.hydration?.value, 0),
      hydrationMax: num(resources.hydration?.max, 0),
      energyPct: Math.round(getRatio(resources.energy?.value, resources.energy?.max) * 100),
      manaPct: Math.round(getRatio(resources.mana?.value, resources.mana?.max) * 100),
      satietyPct: Math.round(getRatio(resources.satiety?.value, resources.satiety?.max) * 100),
      hydrationPct: Math.round(getRatio(resources.hydration?.value, resources.hydration?.max) * 100),

      pendingAction,
      hasPendingAction: Boolean(pendingAction),
      pendingActionLabel: pendingAction?.label || "",
      pendingActionRemainingSeconds: Number(pendingAction?.remainingSeconds ?? 0),
      canCancelPendingAction: Boolean(pendingAction),

      zones: [
        { key: "head", label: "Голова", value: num(hp.head?.value, 0), max: num(hp.head?.max, 0), pct: Math.round(getRatio(hp.head?.value, hp.head?.max) * 100), cssClass: getZoneClass(hp.head?.value, hp.head?.max), trauma: getPartTrauma(hp.head), tooltip: buildZoneTooltip("Голова", num(hp.head?.value,0), num(hp.head?.max,0), getPartTrauma(hp.head)) },
        { key: "torso", label: "Торс", value: num(hp.torso?.value, 0), max: num(hp.torso?.max, 0), pct: Math.round(getRatio(hp.torso?.value, hp.torso?.max) * 100), cssClass: getZoneClass(hp.torso?.value, hp.torso?.max), trauma: getPartTrauma(hp.torso), tooltip: buildZoneTooltip("Торс", num(hp.torso?.value,0), num(hp.torso?.max,0), getPartTrauma(hp.torso)) },
        { key: "abdomen", label: "Живот", value: num(hp.abdomen?.value, 0), max: num(hp.abdomen?.max, 0), pct: Math.round(getRatio(hp.abdomen?.value, hp.abdomen?.max) * 100), cssClass: getZoneClass(hp.abdomen?.value, hp.abdomen?.max), trauma: getPartTrauma(hp.abdomen), tooltip: buildZoneTooltip("Живот", num(hp.abdomen?.value,0), num(hp.abdomen?.max,0), getPartTrauma(hp.abdomen)) },
        { key: "leftArm", label: "Л. рука", value: num(hp.leftArm?.value, 0), max: num(hp.leftArm?.max, 0), pct: Math.round(getRatio(hp.leftArm?.value, hp.leftArm?.max) * 100), cssClass: getZoneClass(hp.leftArm?.value, hp.leftArm?.max), trauma: getPartTrauma(hp.leftArm), tooltip: buildZoneTooltip("Л. рука", num(hp.leftArm?.value,0), num(hp.leftArm?.max,0), getPartTrauma(hp.leftArm)) },
        { key: "rightArm", label: "П. рука", value: num(hp.rightArm?.value, 0), max: num(hp.rightArm?.max, 0), pct: Math.round(getRatio(hp.rightArm?.value, hp.rightArm?.max) * 100), cssClass: getZoneClass(hp.rightArm?.value, hp.rightArm?.max), trauma: getPartTrauma(hp.rightArm), tooltip: buildZoneTooltip("П. рука", num(hp.rightArm?.value,0), num(hp.rightArm?.max,0), getPartTrauma(hp.rightArm)) },
        { key: "leftLeg", label: "Л. нога", value: num(hp.leftLeg?.value, 0), max: num(hp.leftLeg?.max, 0), pct: Math.round(getRatio(hp.leftLeg?.value, hp.leftLeg?.max) * 100), cssClass: getZoneClass(hp.leftLeg?.value, hp.leftLeg?.max), trauma: getPartTrauma(hp.leftLeg), tooltip: buildZoneTooltip("Л. нога", num(hp.leftLeg?.value,0), num(hp.leftLeg?.max,0), getPartTrauma(hp.leftLeg)) },
        { key: "rightLeg", label: "П. нога", value: num(hp.rightLeg?.value, 0), max: num(hp.rightLeg?.max, 0), pct: Math.round(getRatio(hp.rightLeg?.value, hp.rightLeg?.max) * 100), cssClass: getZoneClass(hp.rightLeg?.value, hp.rightLeg?.max), trauma: getPartTrauma(hp.rightLeg), tooltip: buildZoneTooltip("П. нога", num(hp.rightLeg?.value,0), num(hp.rightLeg?.max,0), getPartTrauma(hp.rightLeg)) }
      ],

      quickSlots: slotKeys.map(slotKey => {
        const itemId = quickSlots?.[slotKey];
        const item = itemId ? actor.items.get(itemId) : null;
        return {
          slotKey,
          short: slotKey.replace("slot", ""),
          itemName: item?.name || "—"
        };
      }),

      rightHandName: actor.system?.equipment?.rightHand
        ? (actor.items.get(actor.system.equipment.rightHand)?.name || "Кулаки")
        : "Кулаки",

      leftHandName: actor.system?.equipment?.leftHand
        ? (actor.items.get(actor.system.equipment.leftHand)?.name || "Кулаки")
        : "Кулаки",

      // Глобальные эффекты — показываются на портрете как иконки
      globalEffects: globalEffects.length ? globalEffects : [
        { key: "stunned",  label: "Оглушение",   icon: "fa-dizzy",     color: "var(--ih-hp-warn)", active: num(actor.system?.conditions?.stunned, 0) > 0,                                                                            value: num(actor.system?.conditions?.stunned, 0) },
        { key: "poison",   label: "Яд",           icon: "fa-skull",     color: "var(--ih-food)",    active: num(actor.system?.conditions?.poison, 0) > 0,                                                                             value: num(actor.system?.conditions?.poison, 0) },
        { key: "burning",  label: "Горение",      icon: "fa-fire",      color: "var(--ih-hp-bad)",  active: num(actor.system?.conditions?.burning, 0) > 0,                                                                            value: num(actor.system?.conditions?.burning, 0) },
        { key: "shock",    label: "Шок",          icon: "fa-bolt",      color: "var(--ih-mana)",    active: num(actor.system?.conditions?.shock, 0) > 0,                                                                              value: num(actor.system?.conditions?.shock, 0) },
        { key: "bleeding", label: "Кровотечение", icon: "fa-droplet",   color: "var(--ih-hp-crit)", active: num(actor.system?.conditions?.bleeding, 0) > 0,                                                                           value: num(actor.system?.conditions?.bleeding, 0) },
        { key: "silence",  label: "Безмолвие",   icon: "fa-volume-xmark", color: "#a78bfa",         active: num(actor.system?.conditions?.silencedUntil, 0) > (game.time?.worldTime ?? 0),                                            value: "🔇" },
        { key: "slow",     label: "Замедление",  icon: "fa-person-walking", color: "#94a3b8",        active: num(actor.system?.conditions?.slowPenalty, 0) > 0,                                                                        value: num(actor.system?.conditions?.slowPenalty, 0) },
        { key: "feared",   label: "Страх",       icon: "fa-ghost",     color: "#c084fc",           active: num(actor.system?.conditions?.feared, 0) > 0,                                                                              value: num(actor.system?.conditions?.feared, 0) },
        { key: "aim",      label: "Прицел",      icon: "fa-crosshairs", color: "#facc15",           active: num(actor.system?.conditions?.aimed_shot_bonus, 0) > 0,                                                                   value: `+${num(actor.system?.conditions?.aimed_shot_bonus, 0)}` },
        { key: "formation",label: "Строй",       icon: "fa-people-arrows", color: "#60a5fa",        active: num(actor.system?.conditions?.formation_stance, 0) > 0,                                                                  value: num(actor.system?.conditions?.formation_stance, 0) },
        { key: "wall",     label: "Стена",       icon: "fa-shield-halved", color: "#38bdf8",        active: num(actor.system?.conditions?.shield_wall_formation, 0) > 0,                                                            value: num(actor.system?.conditions?.shield_wall_formation, 0) },
        { key: "counter",  label: "Контра",      icon: "fa-rotate",     color: "#fb923c",           active: num(actor.system?.conditions?.counter_ready, 0) > 0 || num(actor.system?.conditions?.riposte_ready, 0) > 0,               value: num(actor.system?.conditions?.counter_ready, 0) || num(actor.system?.conditions?.riposte_ready, 0) },
        { key: "intercept",label: "Перехват",    icon: "fa-hand",       color: "#f472b6",           active: num(actor.system?.conditions?.intercept_ready, 0) > 0,                                                                   value: num(actor.system?.conditions?.intercept_ready, 0) }
      ],
      hasGlobalEffects: globalEffects.length > 0 || [
        num(actor.system?.conditions?.stunned, 0) > 0,
        num(actor.system?.conditions?.poison, 0) > 0,
        num(actor.system?.conditions?.burning, 0) > 0,
        num(actor.system?.conditions?.shock, 0) > 0,
        num(actor.system?.conditions?.bleeding, 0) > 0,
        num(actor.system?.conditions?.silencedUntil, 0) > (game.time?.worldTime ?? 0),
        num(actor.system?.conditions?.slowPenalty, 0) > 0,
        num(actor.system?.conditions?.feared, 0) > 0,
        num(actor.system?.conditions?.aimed_shot_bonus, 0) > 0,
        num(actor.system?.conditions?.formation_stance, 0) > 0,
        num(actor.system?.conditions?.shield_wall_formation, 0) > 0,
        num(actor.system?.conditions?.counter_ready, 0) > 0,
        num(actor.system?.conditions?.riposte_ready, 0) > 0,
        num(actor.system?.conditions?.intercept_ready, 0) > 0
      ].some(Boolean),

      // Флаги для управления доступностью действий
      isGM: Boolean(game.user?.isGM),
      canActFreely: !isCombatActive(),
      canAttack: isCombatActive(),

      // Энергия — для кнопки «Перевести дух»
      energyCur:  Number(actor.system?.resources?.energy?.value ?? 0),
      energyMax:  Number(actor.system?.resources?.energy?.max   ?? 0),
      canBreathe: isCombatActive() &&
                  Number(actor.system?.resources?.energy?.value ?? 0) <
                  Number(actor.system?.resources?.energy?.max   ?? 0),
      manaCur:    Number(actor.system?.resources?.mana?.value ?? 0),
      manaMax:    Number(actor.system?.resources?.mana?.max   ?? 0),
      hasMana:    Number(actor.system?.resources?.mana?.max   ?? 0) > 0,
      rightHandEquipped: !!actor.system?.equipment?.rightHand,
      isSprinting: game.ironHills?._moveMode === "sprint",

      queue: (state.participants ?? []).map(participant => {
        const side = participant.side ?? "neutral";
        const isFriendly = actorSide !== "neutral" && isFriendlySide(actorSide, side);

        return {
          name: participant.actorName,
          secondsLeft: participant.remainingSeconds,
          initiative: participant.initiative,
          isCurrent: participant.id === state.activeParticipantId,
          sideClass: getParticipantSideClass(side),
          relationLabel: side === "neutral" ? "N" : (isFriendly ? "F" : "E")
        };
      })
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-attack-hand]").on("click", async event => {
      event.preventDefault();
      await this._attack(event.currentTarget.dataset.attackHand);
    });

    html.find("[data-continue-pending]").on("click", async event => {
      event.preventDefault();
      await this._continuePendingAction();
    });

    html.find("[data-cancel-pending]").on("click", async event => {
      event.preventDefault();
      await this._cancelPendingAction();
    });

    html.find("[data-breathe]").on("click", async event => {
      event.preventDefault();
      await this._breathe();
    });

    html.find("[data-toggle-sprint]").on("click", () => {
      const cur = game.ironHills?._moveMode ?? "walk";
      game.ironHills?.setMoveMode?.(cur === "sprint" ? "walk" : "sprint");
      this.render(false);
    });

    html.find("[data-cast-spell]").on("click", async event => {
      event.preventDefault();
      await this._castSpell();
    });

    html.find("[data-end-turn]").on("click", async event => {
      event.preventDefault();
      await this._endTurnForActor();
    });

    html.find("[data-quickslot]").on("click", async event => {
      event.preventDefault();
      await this._useQuickSlot(event.currentTarget.dataset.quickslot);
    });

    html.find("[data-next-turn]").on("click", async event => {
      event.preventDefault();
      await this._nextTurn();
    });

    html.find("[data-end-combat]").on("click", async event => {
      event.preventDefault();
      await this._endCombat();
    });

    html.find("[data-toggle-compact]").on("click", async event => {
      event.preventDefault();
      await this._toggleCompactMode();
    });

    window.setTimeout(() => this._applySizing(), 10);
  }
}
