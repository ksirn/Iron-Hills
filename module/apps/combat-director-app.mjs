import {
  clearCombatEventLog,
  getCombatEventLog,
  getCombatEventStats,
} from "../services/combat-event-service.mjs";
import { isCombatVfxEnabled } from "../services/combat-vfx-service.mjs";
import { getCombatState } from "../services/combat-flow-service.mjs";

const SYSTEM_ID = "iron-hills-system";
const TEMPLATE = `systems/${SYSTEM_ID}/templates/apps/combat-director.hbs`;

function mergeOptions(base, extension) {
  return globalThis.foundry?.utils?.mergeObject?.(base, extension, { inplace: false })
    ?? { ...(base ?? {}), ...extension };
}

function openIronHillsApp(key, args = []) {
  const fn = globalThis.game?.ironHills?.[key];
  if (typeof fn !== "function") {
    globalThis.ui?.notifications?.warn?.(`${key} is not available`);
    return null;
  }
  return fn(...args);
}

function optionRows(rows = []) {
  return (Array.isArray(rows) ? rows : []).map(row => ({
    ...row,
    selected: false,
  }));
}

function selectedOptionRows(rows = [], selectedValue = "") {
  const value = String(selectedValue ?? "");
  return optionRows(rows).map(row => ({
    ...row,
    selected: String(row.id ?? row.key ?? "") === value,
  }));
}

function getGmControlSnapshot(scope = "selected") {
  const fn = globalThis.game?.ironHills?.gmControl;
  if (typeof fn !== "function") return null;
  try {
    return fn({ scope });
  } catch (error) {
    console.warn("Iron Hills | Combat Director GM control snapshot failed", error);
    return null;
  }
}

export class IronHillsCombatDirectorApp extends Application {
  static get defaultOptions() {
    return mergeOptions(super.defaultOptions, {
      id: "iron-hills-combat-director",
      title: "Iron Hills Combat Director",
      template: TEMPLATE,
      classes: ["iron-hills", "iron-hills-combat-director-window"],
      width: 620,
      height: 720,
      resizable: true,
    });
  }

  constructor(options = {}) {
    super(options);
    this._controlState = {
      scope: "selected",
      itemId: "",
      hand: "rightHand",
      timePreset: "six-seconds",
      targetZone: "",
      targetZoneMode: "",
      friendlyFireMode: "",
      resourceKey: "all-vitals",
      resourceMode: "full",
      resourceValue: 0,
      bodyPart: "torso",
      bodyAmount: 5,
      conditionKey: "stunned",
      conditionValue: 6,
      skipTimeCost: true,
      aimed: false,
    };
    this._boundRefresh = this._refreshFromHook.bind(this);
    globalThis.Hooks?.on?.("ironHillsCombatDirectorUpdated", this._boundRefresh);
    globalThis.Hooks?.on?.("ironHillsCombatEvent", this._boundRefresh);
    globalThis.Hooks?.on?.("ironHillsCombatStateUpdated", this._boundRefresh);
    globalThis.Hooks?.on?.("ironHillsCombatUpdated", this._boundRefresh);
  }

  getData(options = {}) {
    const events = getCombatEventLog();
    const eventStats = getCombatEventStats(events);
    const vfxEnabled = isCombatVfxEnabled();
    const gmControl = getGmControlSnapshot(this._controlState.scope);
    const combatState = getCombatState();
    const actionItems = selectedOptionRows(gmControl?.actionItems ?? [], this._controlState.itemId);
    const sourceName = gmControl?.actionActorName ?? "нет актёра";
    const activeScope = (gmControl?.scopes ?? []).find(row => row.id === this._controlState.scope) ?? null;
    return {
      ...(super.getData?.(options) ?? {}),
      events,
      hasEvents: events.length > 0,
      eventCount: events.length,
      eventStats,
      eventStatRows: eventStats.rows,
      vfxEnabled,
      vfxLabel: vfxEnabled ? "VFX on" : "VFX off",
      vfxStateClass: vfxEnabled ? "is-on" : "is-off",
      gmControl,
      hasGmControl: Boolean(gmControl),
      sourceName,
      activeScopeLabel: activeScope?.label ?? "Scope",
      activeScopeCount: activeScope?.count ?? 0,
      scopes: selectedOptionRows(gmControl?.scopes ?? [], this._controlState.scope),
      timePresets: selectedOptionRows(gmControl?.timePresets ?? [], this._controlState.timePreset),
      targetBodyParts: selectedOptionRows(gmControl?.bodyParts ?? [], this._controlState.targetZone),
      bodyParts: selectedOptionRows(gmControl?.bodyParts ?? [], this._controlState.bodyPart),
      targetZoneModes: selectedOptionRows(gmControl?.targetZoneModes ?? [], this._controlState.targetZoneMode),
      friendlyFireModes: selectedOptionRows(gmControl?.friendlyFireModes ?? [], this._controlState.friendlyFireMode),
      resourcePresets: selectedOptionRows(gmControl?.resourcePresets ?? [], this._controlState.resourceKey),
      resourceModes: selectedOptionRows(gmControl?.resourceModes ?? [], this._controlState.resourceMode),
      conditionPresets: selectedOptionRows(gmControl?.conditionPresets ?? [], this._controlState.conditionKey),
      resourceValue: this._controlState.resourceValue,
      bodyAmount: this._controlState.bodyAmount,
      conditionValue: this._controlState.conditionValue,
      actionItems,
      hasActionItems: actionItems.length > 0,
      handRightSelected: this._controlState.hand !== "leftHand",
      handLeftSelected: this._controlState.hand === "leftHand",
      skipTimeCost: this._controlState.skipTimeCost,
      aimed: this._controlState.aimed,
      combatActive: Boolean(combatState?.active),
      combatRound: Number(combatState?.round ?? 0),
      combatTurn: Number(combatState?.turn ?? 0),
      combatParticipantCount: Number(combatState?.participants?.length ?? 0),
      combatPendingCount: Number((combatState?.participants ?? []).filter(row => row.pendingAction).length),
    };
  }

  activateListeners(html) {
    super.activateListeners?.(html);
    html.find("[data-action]").on("click", async (event) => {
      event.preventDefault();
      const action = event.currentTarget?.dataset?.action ?? "";
      await this._handleAction(action);
    });
    html.find("[data-control-field]").on("change", event => {
      this._updateControlStateFromHtml(html);
      const field = event.currentTarget?.dataset?.controlField ?? "";
      if (field === "scope") {
        this._controlState.itemId = "";
        this.render(false);
      }
    });
  }

  async close(options = {}) {
    if (this._boundRefresh) {
      globalThis.Hooks?.off?.("ironHillsCombatDirectorUpdated", this._boundRefresh);
      globalThis.Hooks?.off?.("ironHillsCombatEvent", this._boundRefresh);
      globalThis.Hooks?.off?.("ironHillsCombatStateUpdated", this._boundRefresh);
      globalThis.Hooks?.off?.("ironHillsCombatUpdated", this._boundRefresh);
      this._boundRefresh = null;
    }
    return super.close(options);
  }

  async _handleAction(action) {
    switch (action) {
      case "clear-combat-events":
        clearCombatEventLog();
        this.render(false);
        break;
      case "toggle-combat-vfx": {
        const nextValue = !isCombatVfxEnabled();
        try {
          await globalThis.game?.settings?.set?.(SYSTEM_ID, "combatVfxEnabled", nextValue);
          this.render(false);
        } catch (err) {
          console.warn("Iron Hills | failed to toggle combat VFX", err);
          globalThis.ui?.notifications?.warn?.("Combat VFX setting is not available");
        }
        break;
      }
      case "open-combat-hud":
        openIronHillsApp("openCombatHud", [{ compactMode: true }]);
        break;
      case "open-combat-manager":
        openIronHillsApp("openCombatManager");
        break;
      case "open-world-tools":
        openIronHillsApp("openWorldTools");
        break;
      case "prepare-combat":
      case "recover-after-combat":
      case "refresh-action-economy":
      case "sync-trauma":
      case "restore-all":
      case "restore-vitals":
      case "repair-gear":
      case "clear-conditions":
      case "short-rest":
      case "full-rest":
      case "revive":
      case "tick-conditions":
      case "reset-seconds":
      case "clear-pending":
      case "apply-resource":
      case "heal-body":
      case "damage-body":
      case "apply-condition":
      case "defeat":
      case "advance-time":
      case "quick-action":
        await this._runGmControlAction(action);
        break;
      default:
        break;
    }
  }

  _updateControlStateFromHtml(html) {
    this._controlState = {
      ...this._controlState,
      scope: html.find("[name='director-scope']").val() || "selected",
      itemId: html.find("[name='director-action-item']").val() || "",
      hand: html.find("[name='director-hand']").val() || "rightHand",
      timePreset: html.find("[name='director-time-preset']").val() || "six-seconds",
      targetZone: html.find("[name='director-target-zone']").val() || "",
      targetZoneMode: html.find("[name='director-zone-mode']").val() || "",
      friendlyFireMode: html.find("[name='director-friendly-fire']").val() || "",
      resourceKey: html.find("[name='director-resource-key']").val() || "all-vitals",
      resourceMode: html.find("[name='director-resource-mode']").val() || "full",
      resourceValue: Number(html.find("[name='director-resource-value']").val() || 0),
      bodyPart: html.find("[name='director-body-part']").val() || "torso",
      bodyAmount: Number(html.find("[name='director-body-amount']").val() || 5),
      conditionKey: html.find("[name='director-condition-key']").val() || "stunned",
      conditionValue: Number(html.find("[name='director-condition-value']").val() || 6),
      skipTimeCost: html.find("[name='director-skip-time']").is(":checked"),
      aimed: html.find("[name='director-aimed']").is(":checked"),
    };
  }

  async _runGmControlAction(action) {
    const fn = globalThis.game?.ironHills?.runGmControlAction;
    if (typeof fn !== "function") {
      globalThis.ui?.notifications?.warn?.("GM Control API is not available.");
      return { ok: false, reason: "missing-gm-control-api" };
    }

    try {
      if (this.element?.length) this._updateControlStateFromHtml(this.element);
      const result = await fn({
        action,
        scope: this._controlState.scope,
        itemId: this._controlState.itemId,
        hand: this._controlState.hand,
        timePreset: this._controlState.timePreset,
        skipTimeCost: this._controlState.skipTimeCost,
        targetZone: this._controlState.targetZone,
        targetZoneMode: this._controlState.targetZoneMode,
        aimed: this._controlState.aimed,
        friendlyFireMode: this._controlState.friendlyFireMode,
        resourceKey: this._controlState.resourceKey,
        resourceMode: this._controlState.resourceMode,
        resourceValue: this._controlState.resourceValue,
        bodyPart: this._controlState.bodyPart,
        bodyAmount: this._controlState.bodyAmount,
        conditionKey: this._controlState.conditionKey,
        conditionValue: this._controlState.conditionValue,
      });
      this.render(false);
      return result;
    } catch (error) {
      console.error("Iron Hills | Combat Director action failed", error);
      globalThis.ui?.notifications?.error?.(`Combat Director action failed: ${error?.message ?? error}`);
      return { ok: false, error };
    }
  }

  _refreshFromHook() {
    if (!this.rendered) return;
    this.render(false);
  }
}
