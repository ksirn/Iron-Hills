import { IronHillsCombatTechniqueApp, AIM_ZONES } from "./combat-technique-app.mjs";
import { IronHillsSpellCastApp } from "./spell-cast-app.mjs";
import { TarkovTradeApp } from "./tarkov-trade-app.mjs";
import { performActorAttack } from "../services/attack-flow-service.mjs";
import {
  buildCombatChatCard,
  buildSystemDialogContent,
  createCombatChatMessage,
} from "../services/combat-chat-service.mjs";
import { buildHitEffect } from "../services/hit-effect-service.mjs";
import { getActiveConditionEntries } from "../services/condition-policy-service.mjs";
import {
  buildTechniqueAttackParams,
  getTechniqueAoeConfig,
  isTechniqueSupportAction,
  techniqueRequiresTargetZoneChoice
} from "../services/combat-technique-service.mjs";
import {
  executePendingCombatActionForActorSheet,
  performAttackForActorSheet,
  resolveCombatTimeCostForActorSheet,
  useQuickSlotForActorSheet,
} from "../services/actor-sheet-orchestration-service.mjs";
import {
  continuePendingCombatActionFromSheet,
  resolveCombatTimeCostForActor,
} from "../services/actor-combat-sheet-service.mjs";
import {
  castSpellChoiceAction,
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
  getActorCombatUiState,
  isCombatActive,
  nextTurn,
  endCombat,
  canActorCommitAction,
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
import {
  buildActorMedicalTriage,
} from "../services/body-trauma-service.mjs";
import {
  buildActorBodyHud,
  buildActorResourceHud,
} from "../services/body-hud-service.mjs";
import { buildActorRecoveryPlan } from "../services/recovery-service.mjs";
import {
  getActionBlockReason,
  getTargetPartLabel,
} from "../services/actor-state-service.mjs";
import {
  getAoeFriendlyFireLabel,
  getAoeTargetZoneModeLabel,
} from "../services/aoe-policy-service.mjs";
import {
  getCombatTargetActor,
  getCombatTargetToken,
  normalizeCombatTargets,
  resolveCombatTargetRefs,
} from "../services/combat-action-target-service.mjs";
import { markActorDead } from "../services/condition-service.mjs";
import { num } from "../utils/math-utils.mjs";
import { getItemQuickSlotIcon } from "../utils/item-utils.mjs";

const HUD_TARGET_PREVIEW_LIMIT = 3;

function notifyWarn(message) {
  globalThis.ui?.notifications?.warn?.(message);
}

function notifyInfo(message) {
  globalThis.ui?.notifications?.info?.(message);
}

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
      content: buildSystemDialogContent({
        className: "ih-technique-zone-dialog",
        headline: technique?.label ?? "Приём",
        headlineMeta: "зона попадания",
        status: "Точный бросок",
        rows: [
          ["Действие", "выбрать зону"],
        ],
      }),
      buttons,
      default: "torso",
      close: () => resolve(null),
    }).render(true);
  });
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

function formatSecondsLabel(value) {
  const seconds = Number(value ?? 0);
  if (!Number.isFinite(seconds)) return "0с";
  return `${Math.round(seconds * 10) / 10}с`;
}

function actorIdentity(actor) {
  return {
    id: String(actor?.id ?? ""),
    uuid: String(getPersistentActorUuid(actor) || actor?.uuid || ""),
  };
}

function isSameActor(a, b) {
  if (!a || !b) return false;
  const left = actorIdentity(a);
  const right = actorIdentity(b);
  return Boolean(
    (left.uuid && right.uuid && left.uuid === right.uuid) ||
    (left.id && right.id && left.id === right.id)
  );
}

function findParticipantForActor(state, actor) {
  if (!actor) return null;
  const actorId = String(actor?.id ?? "");
  const actorUuid = String(getPersistentActorUuid(actor) || actor?.uuid || "");

  return (state?.participants ?? []).find(participant => {
    const participantActorId = String(participant?.actorId ?? "");
    const participantActorUuid = String(participant?.actorUuid ?? "");
    return Boolean(
      (actorUuid && participantActorUuid && actorUuid === participantActorUuid) ||
      (actorId && participantActorId && actorId === participantActorId)
    );
  }) ?? null;
}

function resolveTargetRelation({ actor, actorSide, targetActor, targetSide }) {
  if (isSameActor(actor, targetActor)) {
    return { key: "self", label: "себя", cssClass: "is-self" };
  }

  if (!targetSide || targetSide === "neutral" || actorSide === "neutral") {
    return { key: "neutral", label: "нейтр.", cssClass: "is-neutral" };
  }

  if (isFriendlySide(actorSide, targetSide)) {
    return { key: "friendly", label: "союзн.", cssClass: "is-friendly" };
  }

  return { key: "hostile", label: "враг", cssClass: "is-hostile" };
}

function buildTargetHudContext({
  actor,
  actorSide = "neutral",
  state,
  targets = globalThis.game?.user?.targets ?? [],
} = {}) {
  const normalizedTargets = normalizeCombatTargets(targets);
  const seen = new Set();
  const entries = [];

  for (const target of normalizedTargets) {
    const targetActor = getCombatTargetActor(target);
    if (!targetActor) continue;

    const identity = actorIdentity(targetActor);
    const key = identity.uuid || identity.id || targetActor.name;
    if (seen.has(key)) continue;
    seen.add(key);

    const token = getCombatTargetToken(target);
    const participant = findParticipantForActor(state, targetActor);
    const side = participant?.side ?? "neutral";
    const relation = resolveTargetRelation({ actor, actorSide, targetActor, targetSide: side });
    const secondsLeft = participant ? Number(participant.remainingSeconds ?? participant.secondsLeft ?? 0) : null;
    const pendingUi = participant?.pendingActionUi ?? null;
    const pendingAction = participant?.pendingAction ?? null;

    entries.push({
      name: targetActor.name || token?.name || "Цель",
      img: token?.document?.texture?.src || token?.texture?.src || targetActor.img || "icons/svg/mystery-man.svg",
      side,
      sideClass: getParticipantSideClass(side),
      relationKey: relation.key,
      relationLabel: relation.label,
      relationClass: relation.cssClass,
      inCombat: Boolean(participant),
      defeated: Boolean(participant?.defeated),
      secondsLabel: participant ? formatSecondsLabel(secondsLeft) : "вне боя",
      pendingLabel: pendingUi?.label || pendingAction?.label || "",
      pendingStatus: pendingUi?.statusLabel || "",
      hasPendingAction: Boolean(pendingUi || pendingAction),
      tooltip: participant
        ? `${targetActor.name} — ${relation.label}, ${formatSecondsLabel(secondsLeft)}`
        : `${targetActor.name} — не участвует в текущем бою`,
    });
  }

  const hasTargets = entries.length > 0;
  const hostileCount = entries.filter(entry => entry.relationKey === "hostile").length;
  const friendlyCount = entries.filter(entry => entry.relationKey === "friendly").length;
  const selfCount = entries.filter(entry => entry.relationKey === "self").length;
  const neutralCount = entries.filter(entry => entry.relationKey === "neutral").length;
  const preview = entries.slice(0, HUD_TARGET_PREVIEW_LIMIT);
  const overflowCount = Math.max(0, entries.length - preview.length);

  let cssClass = "is-empty";
  if (hostileCount > 0) cssClass = "has-hostile";
  else if (friendlyCount > 0 || selfCount > 0) cssClass = "has-friendly";
  else if (neutralCount > 0) cssClass = "has-neutral";

  const parts = [];
  if (hostileCount) parts.push(`${hostileCount} враг.`);
  if (friendlyCount) parts.push(`${friendlyCount} союзн.`);
  if (selfCount) parts.push("себя");
  if (neutralCount) parts.push(`${neutralCount} нейтр.`);

  return {
    hasTargets,
    targets: entries,
    preview,
    hasOverflow: overflowCount > 0,
    overflowCount,
    count: entries.length,
    countLabel: hasTargets ? `${entries.length}` : "0",
    cssClass,
    summaryLabel: hasTargets ? parts.join(" · ") : "цель не выбрана",
    primaryName: entries[0]?.name ?? "",
    hasHostile: hostileCount > 0,
    hasFriendly: friendlyCount > 0 || selfCount > 0,
  };
}

function resolvePendingTargetNames(pendingAction) {
  const refs = pendingAction?.data?.targetRefs ?? pendingAction?.targetRefs ?? [];
  if (!Array.isArray(refs) || !refs.length) return [];

  return resolveCombatTargetRefs(refs)
    .map(target => getCombatTargetActor(target)?.name ?? "")
    .filter(Boolean);
}

function firstActionValue(...values) {
  return values.find(value => value !== undefined && value !== null && value !== "");
}

function buildPendingActionTacticalMeta(pendingAction) {
  if (!pendingAction) {
    return {
      visible: false,
      chips: [],
      targetSummary: "",
    };
  }

  const data = pendingAction.data ?? {};
  const spellOverrides = data.spellOverrides ?? {};
  const targetNames = resolvePendingTargetNames(pendingAction);
  const zone = firstActionValue(
    data.targetZone,
    data.targetPart,
    spellOverrides.targetZone,
    spellOverrides.targetPart
  );
  const zoneMode = firstActionValue(data.targetZoneMode, spellOverrides.targetZoneMode);
  const friendlyFireMode = firstActionValue(data.friendlyFireMode, spellOverrides.friendlyFireMode, data.friendlyFire);
  const chips = [];

  if (targetNames.length) {
    chips.push({
      key: "targets",
      label: "Цели",
      value: targetNames.length > 2
        ? `${targetNames.slice(0, 2).join(", ")} +${targetNames.length - 2}`
        : targetNames.join(", "),
    });
  }

  if (zone) {
    chips.push({
      key: "zone",
      label: "Зона",
      value: getTargetPartLabel(zone),
    });
  } else if (zoneMode) {
    chips.push({
      key: "zone-mode",
      label: "Зоны",
      value: getAoeTargetZoneModeLabel(zoneMode),
    });
  }

  if (friendlyFireMode !== undefined && friendlyFireMode !== null && friendlyFireMode !== "") {
    chips.push({
      key: "friendly-fire",
      label: "Союзники",
      value: getAoeFriendlyFireLabel(friendlyFireMode),
    });
  }

  return {
    visible: chips.length > 0,
    chips,
    targetSummary: targetNames.join(", "),
  };
}

function buildHudReadiness({
  combatActive = false,
  actorCombat = {},
  isCurrentTurn = false,
  targetHud = null,
} = {}) {
  if (!combatActive) {
    return {
      cssClass: "is-peace",
      icon: "✦",
      title: "Свободный режим",
      detail: "Бой не активен",
    };
  }

  if (!actorCombat?.isInCombat) {
    return {
      cssClass: "is-out",
      icon: "!",
      title: "Вне боя",
      detail: "Актёр не участвует в текущей очереди",
    };
  }

  if (!isCurrentTurn) {
    return {
      cssClass: "is-waiting",
      icon: "↻",
      title: "Ожидание хода",
      detail: actorCombat?.activeParticipant?.name
        ? `Сейчас ходит: ${actorCombat.activeParticipant.name}`
        : "Сейчас ход другого участника",
    };
  }

  if (actorCombat?.pendingActionReady) {
    return {
      cssClass: "is-ready",
      icon: "▶",
      title: "Действие готово",
      detail: "Можно продолжить и применить результат",
    };
  }

  if (actorCombat?.hasPendingAction) {
    return {
      cssClass: "is-pending",
      icon: "⏳",
      title: "Длительное действие",
      detail: "Продолжите или отмените действие перед новым ходом",
    };
  }

  if (!actorCombat?.canStartNewAction) {
    return {
      cssClass: "is-blocked",
      icon: "!",
      title: "Действие недоступно",
      detail: actorCombat?.actionBlockedReason || "Нет доступных секунд или состояние мешает действию",
    };
  }

  if (targetHud?.hasTargets) {
    return {
      cssClass: "is-actionable",
      icon: "⚔",
      title: "Можно действовать",
      detail: targetHud.summaryLabel,
    };
  }

  return {
    cssClass: "is-need-target",
    icon: "◎",
    title: "Нет выбранной цели",
    detail: "Обычная атака потребует цель; стойки и подготовка могут быть доступны",
  };
}

function buildHudPills({ state = {}, actorCombat = {}, targetHud = null } = {}) {
  return [
    { label: "Раунд", value: state.round ?? 0 },
    { label: "Ход", value: state.turn ?? 0 },
    { label: "Сек.", value: actorCombat?.isInCombat ? formatSecondsLabel(actorCombat.remainingSeconds) : "—" },
    { label: "Цели", value: targetHud?.countLabel ?? "0" },
  ];
}

function getPartTrauma(hpNode) {
  const status = hpNode?.status ?? {};
  return {
    minorBleeding: status.minorBleeding,
    majorBleeding: status.majorBleeding,
    activeMajorBleeding: status.activeMajorBleeding,
    suppressedMajorBleeding: status.suppressedMajorBleeding,
    rawFracture: status.rawFracture,
    fracture: status.fracture,
    fractureSuppressed: status.fractureSuppressed,
    destroyed: status.destroyed,
    splinted: status.splinted,
    tourniquet: status.tourniquet
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
  if (trauma.rawFracture)     parts.push(trauma.fractureSuppressed ? "🟣 Перелом стабилизирован" : "🟣 Перелом");
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
    if (!isCombatActive()) return { ok: true, reason: "" };

    const commitCheck = canActorCommitAction(actor);
    if (!commitCheck.ok) return commitCheck;

    const combatState = getActorCombatUiState(actor);
    if (!combatState.canStartNewAction) {
      return {
        ok: false,
        reason: combatState.hasPendingAction
          ? "Сначала продолжите или отмените незавершённое длительное действие."
          : (combatState.actionBlockedReason || "Сейчас действие недоступно."),
      };
    }

    return commitCheck;
  }

  _completeHudSpellCast() {
    this._refreshHud({ keepOnTop: true });
  }

  _clearTargets() {
    const targets = [...(globalThis.game?.user?.targets ?? [])];
    for (const token of targets) {
      try {
        token?.setTarget?.(false, {
          user: globalThis.game?.user,
          releaseOthers: false,
          groupSelection: true,
        });
      } catch (err) {
        console.warn("Iron Hills | HUD target clear failed", err);
      }
    }
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
      targets: params.targets ?? globalThis.game?.user?.targets ?? [],
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
    if (!combatCheck.ok) { notifyWarn(combatCheck.reason); return; }
    const targets = [...(globalThis.game?.user?.targets ?? [])].map(t => t.actor).filter(Boolean);
    const choice  = await IronHillsSpellCastApp.choose(actor, targets);
    if (!choice) return;
    const result = await castSpellChoiceAction({
      actor,
      choice,
      targets: globalThis.game?.user?.targets ?? [],
      resolveCombatTimeCost: (args) => this._resolveHudCombatTimeCost(actor, args),
      requestHostileAction: (label) => requestGmHostileAction(actor, label),
      onLethal: (target) => markActorDead(target),
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
      hitBonus = 0, attackMode = null, skillValueFallback = null, targetZone = null, targetZoneMode = null, applyCondition = null,
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
      attackMode,
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
      onLethal: (target) => markActorDead(target),
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
      notifyWarn(combatCheck.reason || "Сейчас действие недоступно.");
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

    await createCombatChatMessage({
      actor,
      content: buildCombatChatCard({
        title: "Перевести дух",
        subtitle: actor.name,
        icon: "💨",
        status: `${newMax}/${newMax}`,
        rows: [
          ["Энергия", `${newMax}/${newMax}`],
        ],
        notices: newMax < energyMax
          ? [["Усталость", "макс. энергии −1"]]
          : [],
        className: "ih-combat-rest-chat-card",
      }),
    });

    this._refreshHud({ keepOnTop: true });
  }

  async _attack(hand) {
    const actor = getHudActor();
    if (!actor?.sheet) return;
    if (!(await this._requireSettledInventory(actor, "атака"))) return;

    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) {
      notifyWarn(combatCheck.reason || "Сейчас действие недоступно.");
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
    const targets = [...(globalThis.game?.user?.targets ?? [])].map(t => t.actor).filter(Boolean);

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
      attackMode: profileParams.attackMode ?? baseParams.attackMode ?? null,
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

        const needsTargetZoneChoice = techniqueRequiresTargetZoneChoice(tech);
        const targetZoneChoice = needsTargetZoneChoice
          ? await chooseTechniqueTargetZone(tech)
          : null;
        if (needsTargetZoneChoice && !targetZoneChoice) return;

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
            attackMode:  techniqueParams.attackMode,
            skillValueFallback: techniqueParams.skillValueFallback,
            targetZone:  techniqueParams.targetZone,
            targetZoneMode: techniqueParams.targetZoneMode ?? aoe.targetZoneMode,
            applyCondition: techniqueParams.applyCondition,
            conditionDuration: techniqueParams.conditionDuration,
            conditionChance: techniqueParams.conditionChance,
            effectNotes: techniqueParams.effectNotes,
            friendlyFire: aoe.friendlyFire,
            friendlyFireMode: aoe.friendlyFireMode,
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

    await useQuickSlotForActorSheet(actor.sheet, slotKey, {
      targets: globalThis.game?.user?.targets ?? [],
    }, this._getActorSheetActionOptions(actor));
    this._refreshHud({ keepOnTop: true });
  }

  async _continuePendingAction() {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    await continuePendingCombatActionFromSheet(actor, {
      executePendingAction: action =>
        executePendingCombatActionForActorSheet(actor.sheet, action, this._getActorSheetActionOptions(actor)),
      render: () => this._refreshHud({ keepOnTop: true }),
    });
    this._refreshHud({ keepOnTop: true });
  }

  async _cancelPendingAction() {
    const actor = getHudActor();
    if (!actor) return;

    const result = cancelPendingAction(actor);
    if (!result?.ok) {
      notifyWarn(result?.reason || "Не удалось отменить действие.");
      return;
    }

    notifyInfo(`${actor.name} отменяет длительное действие.`);
    this._refreshHud({ keepOnTop: true });
  }

  async _endTurnForActor() {
    const actor = getHudActor();
    if (!actor) return;

    const result = endTurnForActor(actor);
    if (!result?.ok) {
      notifyWarn(result?.reason || "Не удалось завершить ход.");
      return;
    }

    const advanceResult = await advanceTurnIfReady();
    if (!advanceResult?.ok) {
      notifyWarn(advanceResult?.reason || "Ход завершён, но передача следующему участнику не выполнена.");
      this._refreshHud({ keepOnTop: true });
      return;
    }

    this._refreshHud({ keepOnTop: true });
  }

// _endMyTurn удалён: дублировал _endTurnForActor, но без advanceTurnIfReady.
  // Все вызовы завершения хода идут через _endTurnForActor.

  async _nextTurn() {
    if (!isCombatActive()) {
      notifyWarn("Активного боя нет.");
      return;
    }

    const actor = getHudActor();

    if (actor && isActorActiveTurn(actor)) {
      await this._endTurnForActor();
      return;
    }

    if (globalThis.game?.user?.isGM) {
      const nextResult = await nextTurn();
      if (nextResult?.ok === false) {
        notifyWarn(nextResult?.reason || "Не удалось передать ход.");
        return;
      }

      this._refreshHud({ keepOnTop: true });
      return;
    }

    notifyWarn("Сейчас не ваш активный ход.");
  }

  async _endCombat() {
    if (!isCombatActive()) {
      notifyWarn("Активного боя нет.");
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

    const resources = actor.system?.resources ?? {};
    const quickSlots = actor.system?.quickSlots ?? {};
    const slotKeys = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"];
    const actorUuid = getPersistentActorUuid(actor);
    const actorCombat = getActorCombatUiState(actor);
    const actorParticipant = actorCombat.participant
      ?? (state.participants ?? []).find(participant => participant.actorUuid === actorUuid)
      ?? null;
    const actorSide = actorParticipant?.side ?? "neutral";
    const pendingAction = actorCombat.pendingAction ?? actorParticipant?.pendingAction ?? null;
    const pendingActionUi = actorCombat.pendingActionUi ?? actorParticipant?.pendingActionUi ?? null;
    const globalEffects = getActiveConditionEntries(actor.system?.conditions ?? {});
    const medicalTriage = buildActorMedicalTriage(actor);
    const bodyHud = buildActorBodyHud(actor, { medicalTriage });
    const resourceBars = buildActorResourceHud(actor);
    const recoveryPlan = buildActorRecoveryPlan(actor);
    const selectedTargets = globalThis.game?.user?.targets ?? [];
    const currentActorTurn = Boolean(
      actorCombat.isActiveTurn ??
      (current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid))
    );
    const targetHud = buildTargetHudContext({
      actor,
      actorSide,
      state,
      targets: selectedTargets,
    });
    const pendingActionTacticalMeta = buildPendingActionTacticalMeta(pendingAction);
    const readiness = buildHudReadiness({
      combatActive: isCombatActive(),
      actorCombat,
      isCurrentTurn: currentActorTurn,
      targetHud,
    });
    const hudPills = buildHudPills({
      state,
      actorCombat,
      targetHud,
    });

    return {
      hasActor: true,
      compactMode: true,
      combatActive: isCombatActive(),
      actorName: actor.name,
      actorImg: actor.img,
      actorSide,
      actorSideClass: getParticipantSideClass(actorSide),
      isCurrentTurn: currentActorTurn,
      canStartNewAction: Boolean(actorCombat.canStartNewAction),
      canEndTurn: Boolean(actorCombat.canEndTurn),
      canContinuePendingAction: Boolean(actorCombat.canContinuePendingAction),
      currentTurnName: current?.actorName || "—",
      readiness,
      hudPills,
      targetHud,
      medicalTriage,
      bodyHud,
      resourceBars,
      recoveryPlan,
      secondsLeft: actorCombat.isInCombat ? num(actorCombat.remainingSeconds, 0) : null,
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
      pendingActionUi,
      hasPendingAction: Boolean(pendingAction),
      pendingActionLabel: pendingAction?.label || "",
      pendingActionRemainingSeconds: Number(pendingActionUi?.remainingSeconds ?? pendingAction?.remainingSeconds ?? 0),
      pendingActionTotalSeconds: Number(pendingActionUi?.totalSeconds ?? pendingAction?.totalSeconds ?? 0),
      pendingActionProgressPct: Number(pendingActionUi?.progressPct ?? actorCombat.pendingActionProgressPct ?? 0),
      pendingActionStatusClass: pendingActionUi?.statusClass ?? actorCombat.pendingActionStatusClass ?? "",
      pendingActionStatusLabel: pendingActionUi?.statusLabel ?? actorCombat.pendingActionStatusLabel ?? "",
      pendingActionReady: Boolean(pendingActionUi?.ready ?? actorCombat.pendingActionReady),
      pendingActionTacticalMeta,
      canCancelPendingAction: Boolean(actorCombat.canCancelPendingAction),

      zones: bodyHud.parts,
      quickSlots: slotKeys.map(slotKey => {
        const itemId = quickSlots?.[slotKey];
        const item = itemId ? actor.items.get(itemId) : null;
        const reason = getActionBlockReason(actor, "quickslot", { slotKey, targets: selectedTargets });
        const canUse = !reason;
        const itemName = item?.name || "—";
        const slotNumber = slotKey.replace("slot", "");
        const display = item ? getItemQuickSlotIcon(item) : slotNumber;
        return {
          slotKey,
          short: slotNumber,
          display,
          itemName,
          hasItem: Boolean(item),
          canUse,
          blockedReason: reason,
          tooltip: canUse
            ? `[${slotNumber}] ${itemName}`
            : `[${slotNumber}] ${itemName}: ${reason || "Недоступно"}`,
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
        { key: "silence",  label: "Безмолвие",   icon: "fa-volume-xmark", color: "#a78bfa",         active: num(actor.system?.conditions?.silencedUntil, 0) > (globalThis.game?.time?.worldTime ?? 0),                                            value: "🔇" },
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
        num(actor.system?.conditions?.silencedUntil, 0) > (globalThis.game?.time?.worldTime ?? 0),
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
      isGM: Boolean(globalThis.game?.user?.isGM),
      canActFreely: !isCombatActive(),
      canAttack: !isCombatActive() || Boolean(actorCombat.canStartNewAction),

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
      isSprinting: globalThis.game?.ironHills?._moveMode === "sprint",

      queue: (state.participants ?? []).map(participant => {
        const side = participant.side ?? "neutral";
        const isFriendly = actorSide !== "neutral" && isFriendlySide(actorSide, side);
        const participantPending = participant.pendingActionUi ?? null;

        return {
          name: participant.actorName,
          secondsLeft: participant.remainingSeconds,
          initiative: participant.initiative,
          isCurrent: participant.id === state.activeParticipantId,
          sideClass: getParticipantSideClass(side),
          relationLabel: side === "neutral" ? "N" : (isFriendly ? "F" : "E"),
          hasPendingAction: Boolean(participantPending),
          pendingActionReady: Boolean(participantPending?.ready),
          pendingActionRemainingSeconds: Number(participantPending?.remainingSeconds ?? 0),
          pendingActionStatusLabel: participantPending?.statusLabel ?? "",
          tooltip: participantPending
            ? `${participant.actorName} — ${participant.remainingSeconds}с, ${participantPending.label}: ${participantPending.statusLabel}`
            : `${participant.actorName} — ${participant.remainingSeconds}с`,
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
      const cur = globalThis.game?.ironHills?._moveMode ?? "walk";
      globalThis.game?.ironHills?.setMoveMode?.(cur === "sprint" ? "walk" : "sprint");
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

    html.find("[data-clear-targets]").on("click", event => {
      event.preventDefault();
      this._clearTargets();
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
