/**
 * Iron Hills System — точка входа.
 * Этот файл только регистрирует классы и Hooks.
 * Вся логика — в отдельных модулях.
 */
import { IronHillsActorSheet }   from "./apps/actor-sheet.mjs";
import { IronHillsItemSheet }    from "./apps/item-sheet.mjs";
import { IronHillsGridInventoryApp, buildContainers as _buildContainers } from "./apps/grid-inventory-app.mjs";
import { IronHillsTravelApp } from "./apps/travel-app.mjs";
import { IronHillsPartyManagerApp, registerPartySettings } from "./services/party-manager.mjs";
import { IronHillsCraftApp } from "./apps/craft-app.mjs";
import { IronHillsCraftWorkbenchApp } from "./apps/craft-workbench-app.mjs";
import { IronHillsWorldMapApp } from "./apps/world-map-app.mjs";
import { EntityPickerDialog } from "./apps/entity-picker.mjs";
import { IronHillsQuestBoardApp } from "./apps/quest-board-app.mjs";
import { IronHillsGodSheet } from "./apps/god-sheet.mjs";
import { IronHillsNpcSheet } from "./apps/npc-sheet.mjs";
import { IronHillsWeatherApp } from "./apps/weather-app.mjs";
import { IronHillsCombatBarApp } from "./apps/combat-bar-app.mjs";
import { PendingItemsApp } from "./apps/pending-items-app.mjs";
import { TarkovTradeApp } from "./apps/tarkov-trade-app.mjs";
import { placeAoeTemplate, applyAoeDamage, AOE_TYPES } from "./services/aoe-service.mjs";
import { actorsAreAllies, getActorDisposition, DISPOSITION } from "./services/disposition-service.mjs";
import { SPELLS, SPELL_SCHOOLS, SPELLS_BY_SCHOOL } from "./constants/spells-catalog.mjs";
import {
  getWeatherSkillMod, getWeatherMovementMult, getEffectiveVision,
  getCurrentWeather, getTimePeriod, getCurrentHour,
  applyLightingToScene, setWeather, rollWeather,
} from "./services/weather-service.mjs";
import { formatCurrency } from "./utils/currency.mjs";
import { IronHillsCombatTechniqueApp } from "./apps/combat-technique-app.mjs";
import { TECHNIQUES, getAvailableTechniques } from "./constants/combat-techniques.mjs";
import { IronHillsContainerSheet } from "./apps/container-sheet.mjs";
import { IronHillsLootTransfer } from "./apps/loot-transfer-app.mjs";
import { RACES } from "./constants/races.mjs";
import {
  buildCompendiums,
  getCompendiumBuildPlan,
  initCompendiums,
  syncAllCatalogItemPacks,
  syncWeaponPackFromCatalog,
  syncArmorPackFromCatalog,
  syncPotionPackFromCatalog,
  syncFoodPackFromCatalog,
  syncNpcPackLootFromProfiles,
  syncMonsterPackToBestiary,
} from "./compendium-builder.mjs";
import { IronHillsCompendiumBrowser } from "./apps/compendium-browser.mjs";
import { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, TOOLS, BELTS, BACKPACKS, DRINK_VESSELS, MEDICAL_CONSUMABLES, CONSUMABLES, THROWABLES } from "./constants/items-catalog.mjs";
import { IRON_HILLS_POI } from "./constants/world-map.mjs";
import { IronHillsLauncherApp } from "./apps/launcher-app.mjs";
import { initToolbar } from "./apps/toolbar-app.mjs";
import { IronHillsWorldJournalApp } from "./apps/world-journal-app.mjs";
import { DISEASES } from "./constants/diseases.mjs";
import { IronHillsCombatHudApp } from "./apps/combat-hud-app.mjs";
import { IronHillsCombatManagerApp } from "./apps/combat-manager-app.mjs";

import {
  getPersistentActor,
  isSyntheticActorDocument,
  resolveActorFromUuid
} from "./utils/actor-utils.mjs";
import {
  executePendingCombatActionForActorSheet,
  executePendingPayloadForActorSheet,
} from "./services/actor-sheet-orchestration-service.mjs";
import { syncDerivedConditionsFromTrauma } from "./services/actor-state-service.mjs";
import {
  applyActorFullRest,
  applyActorShortRest,
} from "./services/condition-service.mjs";
import {
  cleanupInvalidActorReferences,
  ensureActorSkills,
  recalculateActorWeight
} from "./services/inventory-service.mjs";
import {
  queueActorSheetRender,
  refreshAllTradeUIs,
  rerenderOpenIronHillsActorSheets
} from "./services/ui-refresh-service.mjs";
import { registerDebugSetting, debugLog } from "./utils/debug-utils.mjs";
import {
  endTurnForActor,
  isActorActiveTurn,
  ensureCombatActorBodyStatus,
  continuePendingAction,
  cancelPendingAction,
} from "./services/combat-flow-service.mjs";
import {
  registerCombatMovementHooks,
  getMoveMode,
  setMoveMode,
} from "./services/combat-movement-service.mjs";
import {
  registerMigrationSettings,
  runWorldMigrations,
  runOneMigration,
  listMigrations
} from "./migrations.mjs";
import { teachCraftRecipe, forgetCraftRecipe as forgetCraftRecipeImpl } from "./constants/craft-knowledge.mjs";
import { CRAFT_WORKBENCH_SKILLS } from "./constants/craft-workbench.mjs";
import {
  grantMonsterLootTo,
  refillActorVessels,
  lootTableKeys,
  buildDrinkVesselItemData,
  harvestMonsterCarcass,
  pickpocketNpc,
  butcherDifficultyForTier,
  findHarvestToolOnActor,
} from "./services/wilderness-service.mjs";
import {
  formatContentValidationReport,
  validateGeneratedContentSamples,
  validateIronHillsContent,
} from "./services/content-validation-service.mjs";
import {
  formatContentRepairReport,
  repairIronHillsContent,
} from "./services/content-repair-service.mjs";
import {
  formatContentPatchPreparationReport,
  prepareIronHillsContentPatch,
} from "./services/content-patch-service.mjs";
import {
  auditIronHillsCatalogs,
  formatCatalogReadinessReport,
} from "./services/catalog-readiness-service.mjs";
import {
  auditIronHillsAssets,
  formatAssetAuditReport,
} from "./services/content-asset-audit-service.mjs";
import {
  checkIronHillsContentReadiness,
  formatContentReadinessReport,
} from "./services/content-readiness-service.mjs";
import {
  buildIronHillsContentBalanceReport,
  formatContentBalanceReport,
} from "./services/content-balance-service.mjs";
import {
  formatRuntimeSmokeReport,
  runIronHillsRuntimeSmoke,
} from "./services/runtime-smoke-service.mjs";
import {
  buildCombatChatCard,
  buildSystemDialogContent,
} from "./services/combat-chat-service.mjs";
import { applyDynamicStyleBindings } from "./utils/dynamic-style-bindings.mjs";

async function syncDerivedConditionsCommand(actorRef) {
  const actor =
    typeof actorRef === "string"
      ? (resolveActorFromUuid(actorRef) ?? game.actors.get(actorRef))
      : getPersistentActor(actorRef);

  if (!actor) {
    ui.notifications.warn("Не удалось найти актёра для синхронизации derived conditions.");
    return { ok: false };
  }

  return syncDerivedConditionsFromTrauma(actor, { render: true });
}

function getActorSheetActionOptions() {
  return {
    actorSheetClass: IronHillsActorSheet,
    tradeAppClass: TarkovTradeApp,
  };
}

function logContentValidationReport(report, options = {}) {
  const text = formatContentValidationReport(report, {
    maxFindings: options.maxFindings ?? 30,
  });

  console.groupCollapsed?.("Iron Hills | Content validation");
  console.log(text);
  console.log(report);
  console.groupEnd?.();

  return text;
}

async function validateContentCommand(options = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может запускать проверку контента.");
    return null;
  }

  const report = await validateIronHillsContent(options);
  logContentValidationReport(report, options);

  const errors = Number(report.counts?.error ?? 0);
  const warnings = Number(report.counts?.warn ?? 0);
  if (errors > 0) {
    ui.notifications.error(`Iron Hills content: ${errors} errors, ${warnings} warnings. Details in console.`);
  } else if (warnings > 0) {
    ui.notifications.warn(`Iron Hills content: ${warnings} warnings. Details in console.`);
  } else {
    ui.notifications.info(`Iron Hills content OK: ${report.itemsChecked} items checked.`);
  }

  return report;
}

function validateGeneratedContentCommand(options = {}) {
  const report = validateGeneratedContentSamples();
  logContentValidationReport(report, options);
  return report;
}

function logContentRepairReport(report, options = {}) {
  const text = formatContentRepairReport(report, {
    maxChanges: options.maxChanges ?? 30,
    maxErrors: options.maxErrors ?? 10,
    maxFindings: options.maxFindings ?? 20,
  });

  console.groupCollapsed?.("Iron Hills | Content repair");
  console.log(text);
  console.log(report);
  console.groupEnd?.();

  return text;
}

async function repairContentCommand(options = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может нормализовать контент.");
    return null;
  }

  const report = await repairIronHillsContent(options);
  logContentRepairReport(report, options);

  const mode = report.apply ? "applied" : "dry-run";
  if (report.errors?.length) {
    ui.notifications.error(`Iron Hills content repair ${mode}: ${report.errors.length} errors. Details in console.`);
  } else if (report.itemsChanged > 0) {
    const summary = report.apply
      ? `${report.documentsChanged} documents changed`
      : `${report.itemsChanged} items need changes`;
    ui.notifications.warn(`Iron Hills content repair ${mode}: ${summary}. Details in console.`);
  } else {
    ui.notifications.info(`Iron Hills content repair ${mode}: no changes needed.`);
  }

  return report;
}

function logContentPatchReport(report, options = {}) {
  const text = formatContentPatchPreparationReport(report, {
    maxSteps: options.maxSteps ?? 20,
    maxActions: options.maxActions ?? 5,
    maxFindings: options.maxFindings ?? 20,
  });

  console.groupCollapsed?.("Iron Hills | Content patch pipeline");
  console.log(text);
  console.log(report);
  console.groupEnd?.();

  return text;
}

async function prepareContentPatchCommand(options = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может запускать подготовку контентного патча.");
    return null;
  }

  const report = await prepareIronHillsContentPatch(options);
  logContentPatchReport(report, options);

  const mode = report.apply ? "applied" : "dry-run";
  const failed = report.steps?.filter(step => step.status === "failed").length ?? 0;
  const planned = report.steps?.filter(step => step.status === "planned").length ?? 0;
  const errors =
    Number(report.summary?.preflightErrors ?? 0) +
    Number(report.catalog?.counts?.error ?? 0) +
    Number(report.generatedPackSources?.counts?.error ?? 0) +
    Number(report.validation?.counts?.error ?? 0) +
    Number(report.repair?.errors?.length ?? 0) +
    Number(report.assets?.counts?.error ?? 0);
  if (failed || errors) {
    ui.notifications.error(`Iron Hills content patch ${mode}: ${failed} failed steps, ${errors} errors. Details in console.`);
  } else if (planned) {
    ui.notifications.warn(`Iron Hills content patch ${mode}: ${planned} mutating steps are planned. Details in console.`);
  } else {
    ui.notifications.info(`Iron Hills content patch ${mode}: pipeline completed.`);
  }

  return report;
}

function auditCatalogsCommand(options = {}) {
  const report = auditIronHillsCatalogs();
  const text = formatCatalogReadinessReport(report, {
    maxFindings: options.maxFindings ?? 30,
  });

  console.groupCollapsed?.("Iron Hills | Catalog readiness");
  console.log(text);
  console.log(report);
  console.groupEnd?.();

  const errors = Number(report.counts?.error ?? 0);
  const warnings = Number(report.counts?.warn ?? 0);
  if (errors > 0) {
    ui.notifications.error(`Iron Hills catalogs: ${errors} errors, ${warnings} warnings. Details in console.`);
  } else if (warnings > 0) {
    ui.notifications.warn(`Iron Hills catalogs: ${warnings} warnings. Details in console.`);
  } else {
    ui.notifications.info(`Iron Hills catalogs OK: ${report.rowsChecked} rows checked.`);
  }

  return report;
}

async function auditAssetsCommand(options = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only GM can run Iron Hills asset audit.");
    return null;
  }

  const report = await auditIronHillsAssets(options);
  const text = formatAssetAuditReport(report, {
    maxFindings: options.maxFindings ?? 30,
    maxDirectories: options.maxDirectories ?? 12,
  });

  console.groupCollapsed?.("Iron Hills | Asset audit");
  console.log(text);
  console.log(report);
  console.groupEnd?.();

  const errors = Number(report.counts?.error ?? 0);
  const warnings = Number(report.counts?.warn ?? 0);
  const missingSystemImages = Number(report.summary?.missingSystemImages ?? 0);
  if (errors > 0) {
    ui.notifications.error(`Iron Hills assets: ${errors} errors, ${warnings} warnings. Details in console.`);
  } else if (warnings > 0 || missingSystemImages > 0) {
    ui.notifications.warn(`Iron Hills assets: ${warnings} warnings, ${missingSystemImages} missing system images. Details in console.`);
  } else {
    ui.notifications.info(`Iron Hills assets OK: ${report.summary?.imagesChecked ?? 0} image paths checked.`);
  }

  return report;
}

async function checkContentReadinessCommand(options = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only GM can run Iron Hills content readiness checks.");
    return null;
  }

  const report = await checkIronHillsContentReadiness({
    ...options,
    includePackDryRun: Boolean(options.includePackDryRun ?? false),
    checkFilesystem: Boolean(options.checkFilesystem ?? options.checkAssetFiles ?? false),
  });
  const text = formatContentReadinessReport(report, {
    maxFindings: options.maxFindings ?? 30,
  });

  console.groupCollapsed?.("Iron Hills | Content readiness");
  console.log(text);
  console.log(report);
  console.groupEnd?.();

  const errors = Number(report.summary?.blockingErrors ?? 0);
  const warnings = Number(report.summary?.warnings ?? 0);
  const missingSystemImages = Number(report.summary?.missingSystemImages ?? 0);
  if (errors > 0) {
    ui.notifications.error(`Iron Hills content readiness: ${errors} blocking errors, ${warnings} warnings. Details in console.`);
  } else if (warnings > 0 || missingSystemImages > 0 || !report.summary?.packDryRunClean) {
    ui.notifications.warn(`Iron Hills content readiness: ${warnings} warnings, ${missingSystemImages} missing system images. Details in console.`);
  } else {
    ui.notifications.info("Iron Hills content readiness OK.");
  }

  return report;
}

function auditContentBalanceCommand(options = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only GM can run Iron Hills content balance checks.");
    return null;
  }

  const report = buildIronHillsContentBalanceReport(options);
  const text = formatContentBalanceReport(report, {
    maxFindings: options.maxFindings ?? 30,
    maxTypes: options.maxTypes ?? 16,
  });

  console.groupCollapsed?.("Iron Hills | Content balance");
  console.log(text);
  console.log(report);
  console.groupEnd?.();

  const errors = Number(report.counts?.error ?? 0);
  const warnings = Number(report.counts?.warn ?? 0);
  if (errors > 0) {
    ui.notifications.error(`Iron Hills content balance: ${errors} errors, ${warnings} warnings. Details in console.`);
  } else if (warnings > 0) {
    ui.notifications.warn(`Iron Hills content balance: ${warnings} warnings. Details in console.`);
  } else {
    ui.notifications.info("Iron Hills content balance OK.");
  }

  return report;
}

async function runRuntimeSmokeCommand(options = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only GM can run Iron Hills runtime smoke checks.");
    return null;
  }

  const report = await runIronHillsRuntimeSmoke(options);
  const text = formatRuntimeSmokeReport(report, {
    maxFindings: options.maxFindings ?? 30,
  });

  console.groupCollapsed?.("Iron Hills | Runtime smoke");
  console.log(text);
  console.log(report);
  console.groupEnd?.();

  const errors = Number(report.counts?.error ?? 0);
  const warnings = Number(report.counts?.warn ?? 0);
  if (errors > 0) {
    ui.notifications.error(`Iron Hills runtime smoke: ${errors} errors, ${warnings} warnings. Details in console.`);
  } else if (warnings > 0) {
    ui.notifications.warn(`Iron Hills runtime smoke: ${warnings} warnings. Details in console.`);
  } else {
    ui.notifications.info("Iron Hills runtime smoke OK.");
  }

  return report;
}

// Единый init: регистрация настроек, шитов, Handlebars-хелперов.
Hooks.once("init", () => {
  console.log("Iron Hills System | init");
  registerDebugSetting();
  registerPartySettings();
  registerMigrationSettings();
  registerCombatMovementHooks();
  debugLog("System init started");

  // ── Settings ────────────────────────────────────────────
  game.settings.register("iron-hills-system", "settlementEconomy", {
    name: "Экономика поселений",
    scope: "world", config: false, type: Object, default: {},
  });
  game.settings.register("iron-hills-system", "ironHillsCombatState", {
    name: "Состояние боя Iron Hills",
    scope: "world", config: false, type: Object, default: {},
  });
  game.settings.register("iron-hills-system", "currentWeather", {
    name: "Текущая погода",
    hint: "Активный погодный пресет",
    scope: "world", config: false, type: String, default: "clear",
  });
  game.settings.register("iron-hills-system", "worldRegions", {
    name: "Регионы карты мира",
    scope: "world", config: false, type: Object, default: {},
  });

  // Глобальный кэш — нужно для синхронного доступа из шаблонов.
  globalThis._IH_DISEASES = DISEASES;

  // ── Handlebars helpers ──────────────────────────────────
  Handlebars.registerHelper("neg", v => -Number(v));
  Handlebars.registerHelper("lt",  (a, b) => Number(a) < Number(b));
  Handlebars.registerHelper("gt",  (a, b) => Number(a) > Number(b));
  Handlebars.registerHelper("gte", (a, b) => Number(a) >= Number(b));
  Handlebars.registerHelper("lte", (a, b) => Number(a) <= Number(b));
  Handlebars.registerHelper("eq",  (a, b) => String(a) === String(b));
  Handlebars.registerHelper("add", (a, b) => Number(a) + Number(b));

  // ── Preload chat templates (хорошая практика для горячих путей) ─
  loadTemplates([
    "systems/iron-hills-system/templates/chat/attack.hbs",
    "systems/iron-hills-system/templates/chat/aoe.hbs",
    "systems/iron-hills-system/templates/chat/item-broken.hbs",
  ]);

  // ── Sheets ──────────────────────────────────────────────
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("iron-hills-system", IronHillsActorSheet, { makeDefault: true });

  Actors.registerSheet("iron-hills-system", IronHillsGodSheet, {
    types: ["god"],
    makeDefault: true,
    label: "Iron Hills — Бог"
  });

  Actors.registerSheet("iron-hills-system", IronHillsNpcSheet, {
    types: ["npc", "monster"],
    makeDefault: true,
    label: "Iron Hills — Лист NPC / монстра"
  });

  Actors.registerSheet("iron-hills-system", IronHillsContainerSheet, {
    types: ["container"],
    makeDefault: true,
    label: "Iron Hills — Контейнер"
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("iron-hills-system", IronHillsItemSheet, { makeDefault: true });
});

  Hooks.on("ironHillsPendingActionReady", async ({ participant, action }) => {
    if (!participant || !action) return;

    const actor =
      (participant.actorUuid ? fromUuidSync(participant.actorUuid) : null) ||
      game.actors?.get(participant.actorId) ||
      null;

    if (!actor) return;

    // В одиночной локальной разработке этого достаточно.
    // Потом можно будет отдельно доработать multi-user ownership.
    if (!game.user?.isGM && !actor.isOwner) return;

    game.ironHills = game.ironHills || {};
    game.ironHills._pendingActionPromptLocks = game.ironHills._pendingActionPromptLocks || {};

    const lockKey = `${participant.id}:${action.id}`;
    if (game.ironHills._pendingActionPromptLocks[lockKey]) return;

    game.ironHills._pendingActionPromptLocks[lockKey] = true;

    try {
      const confirmed = await Dialog.confirm({
        title: "Продолжить действие?",
        content: buildSystemDialogContent({
          headline: actor.name,
          status: "Продолжить длительное действие?",
          rows: [
            ["Действие", action.label || "действие"],
            ["Осталось", `${Number(action.remainingSeconds ?? 0)} сек.`],
          ],
        })
      });

      if (!confirmed) {
        cancelPendingAction(actor);
        ui.notifications.info(`${actor.name} отменяет длительное действие.`);
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
        return;
      }

      if (actor.sheet) {
        await executePendingCombatActionForActorSheet(actor.sheet, result.action, getActorSheetActionOptions());
      } else {
        ui.notifications.info(`Действие "${result.action?.label || "действие"}" завершено.`);
      }
    } finally {
      delete game.ironHills._pendingActionPromptLocks[lockKey];
    }
  });

Hooks.once("ready", async () => {
  game.ironHills = game.ironHills || {};

  game.ironHills.syncDerivedConditions = syncDerivedConditionsCommand;
  game.ironHills.endTurnForActor = endTurnForActor;
  game.ironHills.isActorActiveTurn = isActorActiveTurn;

  // Все одноразовые миграции данных живут в module/migrations.mjs.
  // Идёмпотентны и трекаются через game.settings("schemaState").
  game.ironHills.migrations = {
    run:     runWorldMigrations,
    runOne:  runOneMigration,
    list:    listMigrations,
  };
  game.ironHills.validateContent = validateContentCommand;
  game.ironHills.validateGeneratedContent = validateGeneratedContentCommand;
  game.ironHills.repairContent = repairContentCommand;
  game.ironHills.prepareContentPatch = prepareContentPatchCommand;
  game.ironHills.checkContentReadiness = checkContentReadinessCommand;
  game.ironHills.contentReadiness = checkContentReadinessCommand;
  game.ironHills.auditCatalogs = auditCatalogsCommand;
  game.ironHills.auditAssets = auditAssetsCommand;
  game.ironHills.auditContentBalance = auditContentBalanceCommand;
  game.ironHills.contentBalance = auditContentBalanceCommand;
  game.ironHills.runRuntimeSmoke = runRuntimeSmokeCommand;
  game.ironHills.runtimeSmoke = runRuntimeSmokeCommand;
  void runWorldMigrations();

  // GM-команда: прошёл день после смерти — тикаем резерв
  game.ironHills.tickSoulDecay = async () => {
    if (!game.user?.isGM) return;
    let ticked = 0;
    for (const actor of game.actors ?? []) {
      try {
        if (actor.type !== "character") continue;
        const sr = actor.system?.resources?.soulReserve;
        if (!sr) continue;
        if (!sr.isDead) continue; // живой

        const res = actor.system?.resources ?? {};

        // Резерв = текущие значения soul.energyReserve/manaReserve
        const curEnRes = Number(res.soul?.energyReserve?.value ?? res.energy?.max ?? 10);
        const curMnRes = Number(res.soul?.manaReserve?.value  ?? res.mana?.max   ?? 10);

        const newEnRes = Math.max(0, curEnRes - 1);
        const newMnRes = Math.max(0, curMnRes - 1);

        const updates = {
          "system.resources.soulReserve.daysSinceDeath": (sr.daysSinceDeath ?? 0) + 1,
          "system.resources.soul.energyReserve.value":   newEnRes,
          "system.resources.soul.manaReserve.value":     newMnRes,
        };

        await actor.update(updates);
        ticked++;

        if (newEnRes <= 0 || newMnRes <= 0) {
          await ChatMessage.create({
            content: buildCombatChatCard({
              title: actor.name,
              icon: "☠",
              status: "Резерв души иссяк",
              statusClass: "is-danger",
              notices: [["Итог", "Пробуждённый потерян навсегда"]],
            })
          });
        } else {
          const daysLeft = Math.min(newEnRes, newMnRes);
          await ChatMessage.create({
            content: buildCombatChatCard({
              title: actor.name,
              icon: "⏳",
              status: "Душа угасает",
              statusClass: "is-warn",
              rows: [
                ["Энергия души", newEnRes],
                ["Мана души", newMnRes],
                ["Осталось дней", `~${daysLeft}`],
              ],
            })
          });
        }
      } catch (err) {
        console.error("Iron Hills | soul decay tick error", actor?.name, err);
      }
    }
    if (ticked === 0) ui.notifications.info("Нет персонажей в состоянии смерти.");
    else ui.notifications.info(`Тик угасания души: ${ticked} персонажей.`);
  };

  for (const actor of game.actors ?? []) {
    try {
      await ensureCombatActorBodyStatus(actor);
    } catch (err) {
      console.error("Iron Hills | body status init error", actor?.name, err);
    }
  }

  game.ironHills.apps = game.ironHills.apps || {};

  game.ironHills.openCombatHud = ({ compactMode = true } = {}) => {
    const existing = game.ironHills.apps.combatHud;

    if (existing?.rendered) {
      existing._compactMode = Boolean(compactMode);
      existing.render(true, { focus: true });

      window.setTimeout(() => {
        try {
          existing._applySizing?.();
          if (existing.element?.length) existing.bringToTop();
        } catch (_err) {}
      }, 10);

      return existing;
    }

    const app = new IronHillsCombatHudApp({ compactMode });
    game.ironHills.apps.combatHud = app;

    const originalClose = app.close.bind(app);
    app.close = async function(options = {}) {
      if (game.ironHills?.apps?.combatHud === app) {
        game.ironHills.apps.combatHud = null;
      }
      return originalClose(options);
    };

    app.render(true, { focus: true });

    window.setTimeout(() => {
      try {
        app._applySizing?.();
        if (app.element?.length) app.bringToTop();
      } catch (_err) {}
    }, 10);

    return app;
  };

  game.ironHills.openCompactCombatHud = () => game.ironHills.openCombatHud({ compactMode: true });

  game.ironHills.toggleCombatHud = () => {
    const existing = game.ironHills?.apps?.combatHud;
    if (existing?.rendered) {
      existing.close();
      return null;
    }
    return game.ironHills.openCombatHud({ compactMode: true });
  };

  function ensureDefaultPlayerHud() {
    // HUD всегда открыт для всех
    window.setTimeout(() => {
      try {
        const existing = game.ironHills?.apps?.combatHud;
        if (existing?.rendered) return;
        game.ironHills.openCombatHud({ compactMode: true });
      } catch (err) {
        console.warn("Iron Hills | failed to auto-open HUD", err);
      }
    }, 300);

    // Восстанавливаем PendingItemsApp если у игрока есть нераспределённые предметы
    window.setTimeout(async () => {
      try {
        const character = game.user?.character;
        if (!character) return;
        const { PendingItemsApp } = await import("./apps/pending-items-app.mjs");
        await PendingItemsApp.openIfNeeded(character);
      } catch (err) {
        console.warn("Iron Hills | failed to restore PendingItemsApp", err);
      }
    }, 800);
  }

  // Логика движения в бою (стоимость секунд/энергии, откат при нехватке)
  // живёт в module/services/combat-movement-service.mjs.
  // Хуки preUpdateToken/updateToken регистрируются в Hooks.once("init").

  // ── Динамическое освещение при смене времени ───────────────
  Hooks.on("updateWorldTime", async (worldTime, delta) => {
    // Обновляем освещение при каждом изменении времени —
    // getSmoothLighting() сам плавно интерполирует между периодами.
    // Throttle: не чаще раза в 500мс чтобы не спамить scene.update
    if (game.ironHills._lightingThrottle) return;
    game.ironHills._lightingThrottle = true;
    setTimeout(() => { game.ironHills._lightingThrottle = false; }, 500);

    await applyLightingToScene(canvas?.scene);
    game.ironHills.apps?.weather?.render?.(false);
  });

  Hooks.on("controlToken", (_token, controlled) => {
    try {
      const hud = game.ironHills?.apps?.combatHud;

      if (game.user?.isGM) {
        if (controlled) {
          if (hud?.rendered) {
            hud.render(true, { focus: false });
          } else {
            game.ironHills.openCombatHud({ compactMode: true });
          }
        }
        return;
      }

      if (!game.user?.character) return;

      if (!hud?.rendered) {
        game.ironHills.openCombatHud({ compactMode: true });
      } else {
        hud.render(true, { focus: false });
      }
    } catch (err) {
      console.warn("Iron Hills | HUD controlToken refresh failed", err);
    }
  });

  Hooks.on("targetToken", () => {
    try {
      game.ironHills?.apps?.combatHud?.render?.(true, { focus: false });
    } catch (err) {
      console.warn("Iron Hills | HUD targetToken refresh failed", err);
    }
  });

  Hooks.on("canvasReady", () => {
    ensureDefaultPlayerHud();
  });

Hooks.on("updateActor", async (actorDoc, change, options = {}) => {
  await mirrorSyntheticActorUpdateToWorld(actorDoc, change, options);

  const actor = getPersistentActor(actorDoc) ?? actorDoc;

  if (!options?.ironHillsSkipDerivedConditionSync) {
    await syncDerivedConditionsFromTrauma(actor, {
      render: false,
      ironHillsSkipDerivedConditionSync: true
    });
  }

  if (actor.sheet?.rendered) {
    queueActorSheetRender(actor);
  }

  if (actor.type === "character" || actor.type === "merchant") {
    queueActorSheetRender(actor);
    refreshAllTradeUIs(IronHillsActorSheet, TarkovTradeApp);
  }

  // Обновляем HUD если актор является текущим участником боя
  const hud = game.ironHills?.apps?.combatHud;
  if (hud?.rendered) {
    const hudActor = hud._getHudActor?.() ?? null;
    if (!hudActor || hudActor.id === actor.id || actor.type !== "character") {
      hud._refreshHud?.({ keepOnTop: true });
    }
  }
});

  ensureDefaultPlayerHud();
  game.ironHills.pickEntity       = (options) => EntityPickerDialog.pick(options);
  game.ironHills.RACES            = RACES;
  game.ironHills.ITEMS            = { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, TOOLS, DRINK_VESSELS, MEDICAL_CONSUMABLES, CONSUMABLES, THROWABLES };
  game.ironHills.grantMonsterLootTo = grantMonsterLootTo;
  game.ironHills.refillDrinkVesselsFromWater = refillActorVessels;
  /** @deprecated макросы: используйте listMonsterLootPoolKeys */
  game.ironHills.listWildLootTableKeys = lootTableKeys;
  game.ironHills.listMonsterLootPoolKeys = lootTableKeys;
  game.ironHills.buildDrinkVesselItemData = buildDrinkVesselItemData;
  game.ironHills.harvestMonsterCarcass = harvestMonsterCarcass;
  game.ironHills.pickpocketNpc = pickpocketNpc;
  game.ironHills.butcherDifficultyForTier = butcherDifficultyForTier;
  game.ironHills.findHarvestToolOnActor = findHarvestToolOnActor;
  game.ironHills.MAP_POI          = IRON_HILLS_POI;
  game.ironHills.buildCompendiums = buildCompendiums;
  game.ironHills.getCompendiumBuildPlan = getCompendiumBuildPlan;
  game.ironHills.syncAllCatalogItemPacks = syncAllCatalogItemPacks;
  game.ironHills.syncNpcPackLootFromProfiles = syncNpcPackLootFromProfiles;
  game.ironHills.syncMonsterPackToBestiary = syncMonsterPackToBestiary;
  game.ironHills.syncWeaponPackFromCatalog = syncWeaponPackFromCatalog;
  game.ironHills.syncArmorPackFromCatalog = syncArmorPackFromCatalog;
  game.ironHills.syncPotionPackFromCatalog = syncPotionPackFromCatalog;
  game.ironHills.syncFoodPackFromCatalog = syncFoodPackFromCatalog;
  game.ironHills.openLootTransfer = (left, right) => IronHillsLootTransfer.open(left, right);
  game.ironHills.dropToGround = (items, actor) => IronHillsLootTransfer.dropToGround(items, actor);
  game.ironHills.TECHNIQUES           = TECHNIQUES;
  game.ironHills.getAvailableTech     = getAvailableTechniques;
  game.ironHills.openCombatTechnique  = IronHillsCombatTechniqueApp.choose.bind(IronHillsCombatTechniqueApp);
  game.ironHills.openTrade = async () => {
    // Ищем торговца: сначала в таргетах, потом в выделенных токенах
    const merchantToken = [...(game.user.targets ?? [])]
      .find(t => t.actor?.type === "merchant")
      ?? canvas?.tokens?.controlled?.find(t => t.actor?.type === "merchant");
    const merchant = merchantToken?.actor ?? null;

    if (!merchant) {
      ui.notifications.info("Возьми торговца в таргет (T) или выдели его токен");
      return;
    }

    // Проверка расстояния для игроков
    if (!game.user?.isGM) {
      const char = game.user?.character;
      const charToken = canvas?.tokens?.placeables?.find(t => t.actor?.id === char?.id);
      if (charToken && merchantToken) {
        const gs = canvas.grid?.size ?? 100;
        const dx = charToken.x - merchantToken.x;
        const dy = charToken.y - merchantToken.y;
        if (Math.sqrt(dx*dx + dy*dy) > gs * 1.5) {
          ui.notifications.warn("Слишком далеко от торговца"); return;
        }
      }
    }

    // Открываем Tarkov-стиль торговли
    const char = game.user?.character
              ?? canvas?.tokens?.controlled?.find(t => t.actor?.type === "character")?.actor;
    TarkovTradeApp.open(merchant, char);
  };

  game.ironHills.openSearch = async () => {
    // Персонаж — назначенный игроку, без необходимости выделять токен
    const char = game.user?.character
              ?? canvas?.tokens?.controlled?.find(t => t.actor?.type === "character")?.actor;
    if (!char) { ui.notifications.warn("Нет персонажа — назначь его в настройках игрока"); return; }

    // Контейнер — из таргетов (T) или выбранных токенов
    const targetToken = [...(game.user.targets ?? [])]
      .find(t => t.actor && t.actor.id !== char.id &&
            ["container","npc","monster","character"].includes(t.actor.type));

    const controlledToken = canvas?.tokens?.controlled
      ?.find(t => t.actor?.id !== char.id &&
            ["container","npc","monster"].includes(t.actor?.type));

    const contToken = targetToken ?? controlledToken ?? null;
    const container = contToken?.actor ?? null;

    if (!container) {
      ui.notifications.info("Возьми цель в таргет (T) чтобы обыскать");
      return;
    }

    // Проверяем расстояние — не дальше 1 квадрата (grid size)
    const charToken = canvas?.tokens?.placeables?.find(t => t.actor?.id === char.id);
    if (charToken && contToken) {
      const gridSize  = canvas.grid?.size ?? 100;
      const maxDist   = gridSize * 1.5; // допуск 1.5 клетки с диагональю
      const dx = charToken.x - contToken.x;
      const dy = charToken.y - contToken.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > maxDist) {
        ui.notifications.warn(`Слишком далеко для обыска (${Math.round(dist/gridSize*10)/10} кл.)`);
        return;
      }
    }



    IronHillsLootTransfer.open(char, container);
  };
  game.ironHills.dropItemOnGround = async (item, x, y) => {
    if (!game.user?.isGM && !game.settings?.get?.("core","leftClickRelease")) {
      const pos = canvas?.tokens?.controlled?.[0]?.center ?? { x: 500, y: 500 };
      x = x ?? pos.x; y = y ?? pos.y;
    }
    // Создаём актора-контейнер типа "куча"
    const pile = await Actor.create({
      name:  `${item.name} (куча)`,
      type:  "container",
      img:   item.img,
      system:{ info:{ theme:"pile", tier: item.system?.tier ?? 1, lockDifficulty:0 }},
    });
    // Переносим предмет
    const itemData = item.toObject();
    delete itemData._id;
    await Item.create(itemData, { parent: pile });
    // Размещаем токен на сцене
    if (canvas?.scene) {
      await canvas.scene.createEmbeddedDocuments("Token", [{
        actorId: pile.id, x: x ?? 500, y: y ?? 500,
        name: pile.name, img: pile.img,
        width: 1, height: 1, disposition: 0,
      }]);
    }
    await item.delete();
    ui.notifications.info(`${item.name} выброшен`);
  };
game.ironHills.openCompendiumBrowser = () => {
  const existing = Object.values(ui.windows).find(w => w instanceof IronHillsCompendiumBrowser);
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsCompendiumBrowser().render(true);
};

game.ironHills.openLauncher = () => {
  const existing = Object.values(ui.windows).find(w => w instanceof IronHillsLauncherApp);
  if (existing?.rendered) { existing.close(); return; }
  return new IronHillsLauncherApp().render(true);
};

// Toolbar — инициализируем после ready

game.ironHills.openQuestBoard = () => {
  const existing = Object.values(ui.windows).find(w => w instanceof IronHillsQuestBoardApp);
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsQuestBoardApp().render(true);
};

game.ironHills.openWorldJournal = () => {
  const existing = Object.values(ui.windows).find(w => w instanceof IronHillsWorldJournalApp);
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsWorldJournalApp().render(true);
};

game.ironHills.openWorldMap = () => {
  const existing = Object.values(ui.windows).find(w => w instanceof IronHillsWorldMapApp);
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsWorldMapApp().render(true);
};

game.ironHills.openCraftWorkbenchWindow = (actor, opts = {}) => {
  const target = actor ?? game.user?.character ?? canvas.tokens?.controlled?.[0]?.actor;
  if (!target) { ui.notifications.warn("Выбери персонажа"); return; }
  const existing = Object.values(ui.windows).find(w =>
    w instanceof IronHillsCraftWorkbenchApp && w.actor?.id === target.id
  );
  if (existing?.rendered) {
    const sk = opts?.initialSkillKey;
    if (sk && CRAFT_WORKBENCH_SKILLS.includes(sk)) {
      existing._skillKey = sk;
      existing._bowl = [];
      existing.render(false);
    }
    existing.bringToTop?.();
    return existing;
  }
  return new IronHillsCraftWorkbenchApp(target, { initialSkillKey: opts?.initialSkillKey }).render(true);
};

game.ironHills.openAlchemyWindow = (actor) =>
  game.ironHills.openCraftWorkbenchWindow(actor, { initialSkillKey: "alchemy" });

game.ironHills.openCraftWindow = (actor) => {
  const target = actor ?? game.user?.character ?? canvas.tokens?.controlled?.[0]?.actor;
  if (!target) { ui.notifications.warn("Выбери персонажа"); return; }
  const existing = Object.values(ui.windows).find(w =>
    w instanceof IronHillsCraftApp && w.actor?.id === target.id
  );
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsCraftApp(target).render(true);
};

/** Только GM: добавить рецепт в system.craft.knownRecipeIds (id как в CRAFT_RECIPES, см. модуль constants/recipes.mjs). */
game.ironHills.teachCraftRecipe = async (actorRef, recipeId) => {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может обучить рецепту.");
    return null;
  }
  const actor = typeof actorRef === "string" ? game.actors.get(actorRef) : actorRef;
  if (!actor) {
    ui.notifications.warn("Актёр не найден.");
    return null;
  }
  const result = await teachCraftRecipe(actor, recipeId);
  if (result?.ok && !result?.already && result?.id) {
    ui.notifications.info(`${actor.name} изучает рецепт: ${result.id}`);
  } else if (result?.already) {
    ui.notifications.info("Этот рецепт уже был известен.");
  } else if (result?.reason === "unknown_recipe") {
    ui.notifications.warn(`Неизвестный id рецепта: ${recipeId}`);
  }
  return result;
};

game.ironHills.forgetCraftRecipe = async (actorRef, recipeId) => {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM.");
    return null;
  }
  const actor = typeof actorRef === "string" ? game.actors.get(actorRef) : actorRef;
  if (!actor) {
    ui.notifications.warn("Актёр не найден.");
    return null;
  }
  const result = await forgetCraftRecipeImpl(actor, recipeId);
  if (result?.ok) ui.notifications.info(`${actor.name} теряет знание рецепта: ${result.id}`);
  return result;
};

game.ironHills.openPartyManager = () => {
  const existing = Object.values(ui.windows).find(w => w instanceof IronHillsPartyManagerApp);
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsPartyManagerApp().render(true);
};

game.ironHills.openTravelManager = () => {
  const existing = Object.values(ui.windows).find(w => w instanceof IronHillsTravelApp);
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsTravelApp().render(true);
};

game.ironHills.openGridInventory = (actor) => {
  const target = actor ?? game.user?.character ?? canvas.tokens?.controlled?.[0]?.actor;
  if (!target) { ui.notifications.warn("Выбери персонажа или токен"); return; }
  return IronHillsGridInventoryApp.openForActor(target);
};

game.ironHills.openCombatManager = () => {
  const existing = game.ironHills.apps.combatManager;
  if (existing?.rendered) {
    existing.render(true);
    existing.bringToTop?.();
    return existing;
  }

  const app = new IronHillsCombatManagerApp();
  game.ironHills.apps.combatManager = app;

  const originalClose = app.close.bind(app);
  app.close = async function(options = {}) {
    if (game.ironHills?.apps?.combatManager === app) {
      game.ironHills.apps.combatManager = null;
    }
    return originalClose(options);
  };

  app.render(true);
  return app;
};


  Hooks.on("ironHillsCombatUpdated", () => {
    rerenderOpenIronHillsActorSheets();
    // Обновляем HUD при изменении секунд хода
    game.ironHills?.apps?.combatHud?._refreshHud?.({ keepOnTop: true });
  });

  Hooks.on("ironHillsCombatStateUpdated", () => {
    for (const app of Object.values(ui.windows ?? {})) {
      if (!app?.rendered) continue;

      const className = app.constructor?.name ?? "";
      const appClasses = Array.isArray(app.options?.classes) ? app.options.classes : [];

      const isIronHillsActorSheet =
        className === "IronHillsActorSheet" || appClasses.includes("iron-hills-sheet");

      if (!isIronHillsActorSheet) continue;

      try {
        app.render(false);
      } catch (err) {
        console.error("Iron Hills | actor sheet combat rerender error", err);
      }
    }
  });

// renderActorDirectory для кнопки World Tools регистрируется в world-sim-tools.mjs.
// Дублирующий хук здесь удалён.

Hooks.on("ironHillsPendingActionFinished", async ({ actor, action }) => {

  if (!actor || !action) return;

  const payload = action.payload || {};

  const actorSheet = actor.sheet;

  try {
    if (actorSheet) {
      await executePendingPayloadForActorSheet(actorSheet, payload, getActorSheetActionOptions());
    }
  } catch (err) {
    console.error("Pending action execution error", err);
  }

});

async function mirrorSyntheticActorUpdateToWorld(actorDoc, change, options = {}) {
  if (options?.ironHillsSkipWorldMirror) return;
  if (!isSyntheticActorDocument(actorDoc)) return;

  const persistent = getPersistentActor(actorDoc);
  if (!persistent) return;
  if (persistent.uuid === actorDoc.uuid) return;
  if (!change || !Object.keys(change).length) return;

  await persistent.update(foundry.utils.deepClone(change), {
    diff: false,
    recursive: true,
    render: false,
    ironHillsSkipWorldMirror: true
  });
}

async function mirrorSyntheticItemCreateToWorld(itemDoc, options = {}) {
  if (options?.ironHillsSkipWorldMirror) return;

  const parentActor = itemDoc?.parent;
  if (!isSyntheticActorDocument(parentActor)) return;

  const persistentActor = getPersistentActor(parentActor);
  if (!persistentActor) return;

  const existing = persistentActor.items.get(itemDoc.id);
  if (existing) return;

  const itemData = itemDoc.toObject();
  delete itemData._id;
  delete itemData.folder;
  delete itemData.sort;
  delete itemData.ownership;
  delete itemData._stats;

  await persistentActor.createEmbeddedDocuments("Item", [itemData], {
    render: false,
    ironHillsSkipWorldMirror: true
  });
}

async function mirrorSyntheticItemUpdateToWorld(itemDoc, change, options = {}) {
  if (options?.ironHillsSkipWorldMirror) return;

  const parentActor = itemDoc?.parent;
  if (!isSyntheticActorDocument(parentActor)) return;

  const persistentActor = getPersistentActor(parentActor);
  if (!persistentActor) return;

  const persistentItem = persistentActor.items.get(itemDoc.id);
  if (!persistentItem) return;
  if (!change || !Object.keys(change).length) return;

  await persistentItem.update(foundry.utils.deepClone(change), {
    diff: false,
    recursive: true,
    render: false,
    ironHillsSkipWorldMirror: true
  });
}

async function mirrorSyntheticItemDeleteToWorld(itemDoc, options = {}) {
  if (options?.ironHillsSkipWorldMirror) return;

  const parentActor = itemDoc?.parent;
  if (!isSyntheticActorDocument(parentActor)) return;

  const persistentActor = getPersistentActor(parentActor);
  if (!persistentActor) return;

  const persistentItem = persistentActor.items.get(itemDoc.id);
  if (!persistentItem) return;

  await persistentActor.deleteEmbeddedDocuments("Item", [persistentItem.id], {
    render: false,
    ironHillsSkipWorldMirror: true
  });
}

Hooks.on("createItem", async (item, options = {}) => {
  await mirrorSyntheticItemCreateToWorld(item, options);

  if (item.parent?.documentName === "Actor") {
    const actor = getPersistentActor(item.parent) ?? item.parent;
    await cleanupInvalidActorReferences(actor);
    await ensureActorSkills(actor);
    await recalculateActorWeight(actor);

    if (actor.type === "character" || actor.type === "merchant") {
      queueActorSheetRender(actor);
      refreshAllTradeUIs(IronHillsActorSheet, TarkovTradeApp);
    }
  }
});

Hooks.on("updateItem", async (item, change, options = {}) => {
  await mirrorSyntheticItemUpdateToWorld(item, change, options);

  if (item.parent?.documentName === "Actor") {
    const actor = getPersistentActor(item.parent) ?? item.parent;
    await cleanupInvalidActorReferences(actor);
    await ensureActorSkills(actor);
    await recalculateActorWeight(actor);

    if (actor.type === "character" || actor.type === "merchant") {
      queueActorSheetRender(actor);
      refreshAllTradeUIs(IronHillsActorSheet, TarkovTradeApp);
    }
  }
});

Hooks.on("deleteItem", async (item, options = {}) => {
  await mirrorSyntheticItemDeleteToWorld(item, options);

  if (item.parent?.documentName === "Actor") {
    const actor = getPersistentActor(item.parent) ?? item.parent;
    await cleanupInvalidActorReferences(actor);
    await ensureActorSkills(actor);
    await recalculateActorWeight(actor);

    if (actor.type === "character" || actor.type === "merchant") {
      queueActorSheetRender(actor);
      refreshAllTradeUIs(IronHillsActorSheet, TarkovTradeApp);
    }
  }
});

// NOTE: updateActor hook выше (внутри Hooks.once("ready")) — единственный.
// Второй дублированный хук удалён (содержал subset той же логики без syncDerivedConditions).

// ============================================================


// ── Сохранение фокуса и позиции курсора при re-render ───────
// Foundry перерисовывает весь HTML при render(false), теряя фокус.
// Патчим _render чтобы восстанавливать позицию курсора.
// Идемпотентно: каждый app оборачивается ровно один раз.
function preserveInputFocus(app) {
  if (!app || app._ironHillsFocusPatched) return;
  const origRender = app._render.bind(app);
  app._render = async function(force, options) {
    const active   = document.activeElement;
    const isInput  = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
    const savedName  = isInput ? (active.name || active.dataset.currency || active.className) : null;
    const savedStart = isInput ? active.selectionStart : null;
    const savedEnd   = isInput ? active.selectionEnd   : null;

    await origRender(force, options);

    if (savedName && savedStart !== null) {
      const el = app.element?.[0];
      if (!el) return;
      const restored = el.querySelector(`[name="${savedName}"]`)
        ?? el.querySelector(`[data-currency="${savedName}"]`)
        ?? (savedName ? el.querySelector(`.${savedName.split(" ")[0]}`) : null);
      if (restored && (restored.tagName === "INPUT" || restored.tagName === "TEXTAREA")) {
        restored.focus();
        try { restored.setSelectionRange(savedStart, savedEnd); } catch {}
      }
    }
  };
  app._ironHillsFocusPatched = true;
}

Hooks.on("renderApplication", (app, html) => {
  applyDynamicStyleBindings(html);

  // Применяем только к нашим окнам
  const ourClasses = ["trade-app","travel-app","craft-app","craft-workbench-app",
                      "grid-inventory","party-manager","world-map","world-journal",
                      "entity-picker","quest-board","world-tools"];
  if (ourClasses.some(c => app.options?.classes?.includes(c))) {
    preserveInputFocus(app);
  }
});

Hooks.on("renderActorSheet", (_app, html) => {
  applyDynamicStyleBindings(html);
});

}); // close Hooks.once("ready") L216

// Тулбар — вызываем на верхнем уровне чтобы его Hooks.once("ready") сработал
initToolbar();

// ====
// HOTKEYS — автоматическое создание макросов на макробаре
// Вызывается один раз после загрузки мира (только для GM)
// ============================================================

async function ensureIronHillsMacros() {
  if (!game.user?.isGM) return;

  // Удаляем старые автосозданные макросы с номерами
  const oldMacros = (game.macros ?? []).filter(m =>
    m.flags?.["iron-hills-system"]?.autoCreated &&
    !m.flags?.["iron-hills-system"]?.isLauncher
  );
  for (const m of oldMacros) {
    try { await m.delete(); } catch {}
  }

  // Лаунчер в слот 1
  const existing = (game.macros ?? []).find(m =>
    m.flags?.["iron-hills-system"]?.isLauncher
  );
  let macro = existing;

  if (!macro) {
    macro = await Macro.create({
      name:    "⚙ Iron Hills",
      type:    "script",
      command: "game.ironHills?.openLauncher?.()",
      img:     "icons/svg/aura.svg",
      flags:   { "iron-hills-system": { autoCreated: true, isLauncher: true } }
    });
  }

  if (macro) {
    try { await game.user.assignHotbarMacro(macro, 1); } catch(e) {
      console.warn("Iron Hills | слот занят:", e.message);
    }
  }
}


// ── Резерв души — синхронизация и раскачка ──────────────────
Hooks.on("updateActor", async (actor, changes) => {
  if (actor.type !== "character") return;

  // Защита от рекурсии — пропускаем если сами обновляем soul
  if (foundry.utils.getProperty(changes, "system.resources.soul")) return;

  const res     = actor.system?.resources ?? {};
  const updates = {};

  // ── 1. Синхронизируем max резерва с max ресурса ─────────────
  const energyMax = Number(res.energy?.max ?? 100);
  const manaMax   = Number(res.mana?.max   ?? 50);

  const curEnResMax = Number(res.soul?.energyReserve?.max ?? -1);
  const curMnResMax = Number(res.soul?.manaReserve?.max   ?? -1);

  if (curEnResMax !== energyMax) updates["system.resources.soul.energyReserve.max"] = energyMax;
  if (curMnResMax !== manaMax)   updates["system.resources.soul.manaReserve.max"]   = manaMax;

  // ── 2. Раскачка через накопленное восстановление ─────────────
  // Считаем только РЕАЛЬНОЕ восстановление потраченного (не полный → полный вхолостую)
  const changedEnergy = foundry.utils.getProperty(changes, "system.resources.energy.value");
  const changedMana   = foundry.utils.getProperty(changes, "system.resources.mana.value");

  // Энергия
  if (changedEnergy !== undefined) {
    const newVal  = Number(changedEnergy);
    const oldVal  = Number(res.energy?.value ?? newVal);
    const gained  = newVal - oldVal;  // сколько восстановили в этот раз

    // Считаем только если было реальное восстановление (gained > 0) и не был полный бак
    if (gained > 0 && oldVal < energyMax) {
      const actualGain  = Math.min(gained, energyMax - oldVal); // не больше дефицита
      const soul        = res.soul?.energyReserve ?? {};
      const accum       = Number(soul.trainingAccum ?? 0) + actualGain;
      const resVal      = Number(soul.value ?? energyMax);
      const resMax      = energyMax; // max резерва = max ресурса

      // Порог раскачки = max резерва * 5 (нужно 5x полных восстановлений)
      // Это замедляет рост: на 1ст (max=10) нужно восстановить 50 единиц энергии
      // На 5ст (max=50) нужно восстановить 250 — т.е. примерно 25 полных циклов
      const threshold   = resMax * 5;
      if (accum >= threshold && resVal < resMax) {
        // Резерв +1, счётчик сбрасывается (остаток переходит)
        updates["system.resources.soul.energyReserve.value"]        = Math.min(resMax, resVal + 1);
        updates["system.resources.soul.energyReserve.trainingAccum"] = accum - threshold;
        await ChatMessage.create({
          content: buildCombatChatCard({
            title: actor.name,
            icon: "✨",
            status: "Резерв энергии вырос",
            statusClass: "is-good",
            rows: [
              ["Было", resVal],
              ["Стало", Math.min(resMax, resVal + 1)],
              ["Максимум", resMax],
            ],
          })
        });
      } else {
        updates["system.resources.soul.energyReserve.trainingAccum"] = accum;
      }
    }
  }

  // Мана
  if (changedMana !== undefined) {
    const newVal  = Number(changedMana);
    const oldVal  = Number(res.mana?.value ?? newVal);
    const gained  = newVal - oldVal;

    if (gained > 0 && oldVal < manaMax) {
      const actualGain  = Math.min(gained, manaMax - oldVal);
      const soul        = res.soul?.manaReserve ?? {};
      const accum       = Number(soul.trainingAccum ?? 0) + actualGain;
      const resVal      = Number(soul.value ?? manaMax);
      const resMax      = manaMax;
      const threshold   = resMax * 5;

      if (accum >= threshold && resVal < resMax) {
        updates["system.resources.soul.manaReserve.value"]        = Math.min(resMax, resVal + 1);
        updates["system.resources.soul.manaReserve.trainingAccum"] = accum - threshold;
        await ChatMessage.create({
          content: buildCombatChatCard({
            title: actor.name,
            icon: "✨",
            status: "Резерв маны вырос",
            statusClass: "is-good",
            rows: [
              ["Было", resVal],
              ["Стало", Math.min(resMax, resVal + 1)],
              ["Максимум", resMax],
            ],
          })
        });
      } else {
        updates["system.resources.soul.manaReserve.trainingAccum"] = accum;
      }
    }
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
  }
});

Hooks.once("ready", async () => {
  setTimeout(() => ensureIronHillsMacros(), 2000);
  setTimeout(() => initCompendiums(), 5000); // заполняем компендиумы при первом запуске

  // soul-reserve max sync вынесена в module/migrations.mjs.

  // Макро для ручного сброса резерва души до текущих max ресурсов
    // ── Перемотка времени ─────────────────────────────────────
  game.ironHills.advanceTime = async (hours) => {
    if (!game.user?.isGM) return;
    if (!hours || hours <= 0) return;
    await game.time.advance(hours * 3600);
    ui.notifications.info(`⏰ Время перемотано на ${hours}ч.`);
  };

  // ── Отдых — восстановление максимума энергии ──────────────
  game.ironHills.rest = async (type = "short") => {
    // type: "short" = ~1 час, "long" = ~8 часов
    const actors = canvas?.tokens?.controlled?.map(t => t.actor).filter(Boolean);
    const char   = game.user?.character;
    const targets = actors?.length ? actors : (char ? [char] : []);

    if (!targets.length) { ui.notifications.warn("Выбери токен персонажа"); return; }

    const restKind = type === "long" || type === "full" ? "full" : "short";
    let appliedRestCount = 0;

    for (const actor of targets) {
      const result = restKind === "full"
        ? await applyActorFullRest(actor)
        : await applyActorShortRest(actor);
      if (result?.ok !== false) appliedRestCount += 1;
    }

    if (!appliedRestCount) return;

    const delegatedRestHoursTotal = restKind === "full" ? 8 : 1;
    await game.time.advance(delegatedRestHoursTotal * 3600);
    await applyLightingToScene(canvas?.scene);
    game.ironHills.apps?.weather?.render?.(false);
    return;
  };

  game.ironHills.formatCurrency = formatCurrency;
  game.ironHills.openWeather   = () => {
    const app = new IronHillsWeatherApp();
    app.render(true);
    game.ironHills.apps = game.ironHills.apps ?? {};
    game.ironHills.apps.weather = app;
  };
  game.ironHills.setWeather    = setWeather;

  // Влияние действий игроков на мир
  game.ironHills.applyWorldImpact = async (settlement, impact, reason) => {
    const { applyWorldImpact } = await import("./world-sim-tools.mjs").catch(() => ({}));
    if (!applyWorldImpact) {
      ui.notifications.warn("World Tools недоступны");
      return null;
    }
    return applyWorldImpact(settlement, impact, reason);
  };
  // Алиас для обратной совместимости (старое имя)
  game.ironHills.worldImpact = game.ironHills.applyWorldImpact;

  game.ironHills.WorldEvents = {
    clearedBandit:   (s, t=1) => game.ironHills.applyWorldImpact(s, { danger: -(t||1), supply: t > 2 ? 1 : 0 }, "Бандиты уничтожены"),
    robbedMerchant:  (s)      => game.ironHills.applyWorldImpact(s, { supply: -1, prosperity: -1 }, "Торговец ограблен"),
    escortedCaravan: (s)      => game.ironHills.applyWorldImpact(s, { supply: 2 }, "Защитили Каравана"),
    aidedBandits:    (s)      => game.ironHills.applyWorldImpact(s, { danger: 2, supply: -1 }, "Помогли бандитам"),
    helpedVillagers: (s)      => game.ironHills.applyWorldImpact(s, { prosperity: 1 }, "Помогли жителям"),
    destroyedThreat: (s, t=1) => game.ironHills.applyWorldImpact(s, { danger: -Math.ceil((t||1)/2), prosperity: 1 }, "Угроза устранена"),
  };

  // Фракции — API через консоль
  game.ironHills.reputation = {
    get: async (charName, factionName) => {
      const { getReputation, getAllFactions } = await import("./services/faction-service.mjs");
      const char    = game.actors?.find(a => a.name === charName && a.type === "character");
      const faction = getAllFactions().find(f => f.name === factionName);
      return char && faction ? getReputation(char, faction) : null;
    },
    change: async (charName, factionName, delta, reason = "GM") => {
      const { changeReputation, getAllFactions } = await import("./services/faction-service.mjs");
      const char    = game.actors?.find(a => a.name === charName && a.type === "character");
      const faction = getAllFactions().find(f => f.name === factionName);
      if (char && faction) return changeReputation(char, faction, delta, reason);
    },
    changeNpc: async (charName, npcName, delta, reason = "GM") => {
      const { changeNpcRep } = await import("./services/faction-service.mjs");
      const char = game.actors?.find(a => a.name === charName && a.type === "character");
      const npc  = game.actors?.find(a => a.name === npcName);
      if (char && npc) return changeNpcRep(char, npc, delta, reason);
    },
  };

  // buildContainers для PendingItemsApp
  game.ironHills._gridInventoryHelpers = { buildContainers: _buildContainers };

  // Faction service — кэшированная ссылка для tarkov-trade-app и других синхронных потребителей
  import("./services/faction-service.mjs").then(m => {
    game.ironHills._factionService = m;
  }).catch(() => {});

  game.ironHills.fixMerchantPrices = async () => {
    const { fixMerchantPrices } = await import("./world-sim-tools.mjs").catch(() => ({}));
    if (!fixMerchantPrices) {
      ui.notifications.warn("World Tools недоступны");
      return null;
    }
    return fixMerchantPrices();
  };
  game.ironHills.restockMerchant = async (merchant) => {
    const { restockMerchant } = await import("./world-sim-tools.mjs").catch(() => ({}));
    if (!restockMerchant) {
      ui.notifications.warn("World Tools недоступны");
      return null;
    }
    return restockMerchant(merchant);
  };
  // openShop убран — используй openTrade с токеном торговца
  game.ironHills.placeAoe    = placeAoeTemplate;
  game.ironHills.applyAoe    = applyAoeDamage;
  game.ironHills.AOE_TYPES   = AOE_TYPES;
  game.ironHills.disposition = {
    DISPOSITION,
    getActorDisposition,
    actorsAreAllies,
  };
  game.ironHills.SPELLS        = SPELLS;
  game.ironHills.SPELL_SCHOOLS = SPELL_SCHOOLS;
  game.ironHills.rollWeather   = rollWeather;
  game.ironHills.getWeatherMod = getWeatherSkillMod;
  // Режим движения в бою: реализация в services/combat-movement-service.mjs.
  // Внешнее API сохранено: game.ironHills._moveMode (read) и setMoveMode(mode) (write).
  Object.defineProperty(game.ironHills, "_moveMode", {
    configurable: true,
    get: () => getMoveMode(),
  });
  game.ironHills.setMoveMode = (mode) => setMoveMode(mode);

  game.ironHills.restShort = () => game.ironHills.rest("short");
  game.ironHills.restLong  = () => game.ironHills.rest("long");

  game.ironHills.openTimeDialog = async () => {
    if (!game.user?.isGM) {
      ui.notifications.warn("Только GM");
      return null;
    }
    return game.ironHills.openWeather?.() ?? null;
  };

  game.ironHills.syncSoulReserve = async (actor) => {
    if (!actor) actor = canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
    if (!actor || actor.type !== "character") { ui.notifications.warn("Выбери персонажа"); return; }
    const res       = actor.system?.resources ?? {};
    const energyMax = Number(res.energy?.max ?? 10);
    const manaMax   = Number(res.mana?.max   ?? 10);
    await actor.update({
      "system.resources.soul.energyReserve.max":   energyMax,
      "system.resources.soul.energyReserve.value": energyMax,
      "system.resources.soul.manaReserve.max":     manaMax,
      "system.resources.soul.manaReserve.value":   manaMax,
    });
    ui.notifications.info(`${actor.name}: резерв синхронизирован (⚡${energyMax} ✦${manaMax})`);
  };

  // Сброс энергии/маны к дефолтным 10/10 для всех персонажей со старыми значениями
  game.ironHills.resetEnergyManaDefaults = async () => {
    if (!game.user?.isGM) return;
    let count = 0;
    for (const actor of game.actors ?? []) {
      if (actor.type !== "character") continue;
      const res = actor.system?.resources ?? {};
      // Только если max = 100 или 50 (старые дефолты из template) и value = max (нетронутые)
      const eMax = Number(res.energy?.max ?? 0);
      const mMax = Number(res.mana?.max   ?? 0);
      const eVal = Number(res.energy?.value ?? 0);
      const mVal = Number(res.mana?.value   ?? 0);
      const updates = {};
      if (eMax === 100 && eVal === 100) { updates["system.resources.energy.max"] = 10; updates["system.resources.energy.value"] = 10; }
      if (mMax === 50  && mVal === 50)  { updates["system.resources.mana.max"]   = 10; updates["system.resources.mana.value"]   = 10; }
      if (Object.keys(updates).length) {
        await actor.update(updates);
        count++;
      }
    }
    ui.notifications.info(`Сброшено ${count} персонажей к 10/10`);
  };
});

// Прочность и unified targeting / soul-reserve / abdomen и пр. — все одноразовые
// миграции вынесены в module/migrations.mjs и запускаются из единой точки в Hooks.once("ready").
