/**
 * Iron Hills System — точка входа.
 * Этот файл только регистрирует классы и Hooks.
 * Вся логика — в отдельных модулях.
 */
import { IronHillsActorSheet }   from "./apps/actor-sheet.mjs";
import { IronHillsItemSheet }    from "./apps/item-sheet.mjs";
import { IronHillsTradeApp }     from "./apps/trade-app.mjs";
import { IronHillsGridInventoryApp, buildContainers as _buildContainers } from "./apps/grid-inventory-app.mjs";
import { IronHillsTravelApp } from "./apps/travel-app.mjs";
import { IronHillsPartyManagerApp, registerPartySettings } from "./services/party-manager.mjs";
import { IronHillsCraftApp } from "./apps/craft-app.mjs";
import { IronHillsAlchemyApp } from "./apps/alchemy-app.mjs";
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
import { buildCompendiums, initCompendiums } from "./compendium-builder.mjs";
import { IronHillsCompendiumBrowser } from "./apps/compendium-browser.mjs";
import { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, TOOLS, BELTS, BACKPACKS } from "./constants/items-catalog.mjs";
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
import { syncDerivedConditionsFromTrauma } from "./services/actor-state-service.mjs";
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
  registerMigrationSettings,
  runWorldMigrations,
  runOneMigration,
  listMigrations
} from "./migrations.mjs";
import {
  registerCombatMovementHooks,
  setMoveMode as setCombatMoveMode,
  getMoveMode as getCombatMoveMode
} from "./services/combat-movement-service.mjs";


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
    label: "Iron Hills — NPC"
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

    game.ironHills = game.ironHills || {syncDerivedConditions: async actorRef => {
  const actor =
    typeof actorRef === "string"
      ? (resolveActorFromUuid(actorRef) ?? game.actors.get(actorRef))
      : getPersistentActor(actorRef);

  if (!actor) {
    ui.notifications.warn("Не удалось найти актёра для синхронизации derived conditions.");
    return { ok: false };
  }

  return syncDerivedConditionsFromTrauma(actor, { render: true });
},};
    game.ironHills._pendingActionPromptLocks = game.ironHills._pendingActionPromptLocks || {};

    const lockKey = `${participant.id}:${action.id}`;
    if (game.ironHills._pendingActionPromptLocks[lockKey]) return;

    game.ironHills._pendingActionPromptLocks[lockKey] = true;

    try {
      const confirmed = await Dialog.confirm({
        title: "Продолжить действие?",
        content: `
          <p><b>${actor.name}</b> продолжает действие <b>${action.label || "действие"}</b>.</p>
          <p>Осталось: <b>${Number(action.remainingSeconds ?? 0)}</b> сек.</p>
          <p>Продолжить?</p>
        `
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

      if (typeof actor.sheet?._executePendingCombatAction === "function") {
        await actor.sheet._executePendingCombatAction(result.action);
      } else {
        ui.notifications.info(`Действие "${result.action?.label || "действие"}" завершено.`);
      }
    } finally {
      delete game.ironHills._pendingActionPromptLocks[lockKey];
    }
  });

Hooks.once("ready", async () => {
  game.ironHills = game.ironHills || {};

  game.ironHills.endTurnForActor = endTurnForActor;
  game.ironHills.isActorActiveTurn = isActorActiveTurn;

  // Все одноразовые миграции данных живут в module/migrations.mjs.
  // Идёмпотентны и трекаются через game.settings("schemaState").
  game.ironHills.migrations = {
    run:     runWorldMigrations,
    runOne:  runOneMigration,
    list:    listMigrations,
  };
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
            content: `<b style="color:#ef4444">☠ ${actor.name}</b> — резерв души иссяк. Пробуждённый потерян навсегда.`
          });
        } else {
          const daysLeft = Math.min(newEnRes, newMnRes);
          await ChatMessage.create({
            content: `⏳ <b>${actor.name}</b> — душа угасает. Резерв: ⚡${newEnRes} ✦${newMnRes}. Осталось дней: ~${daysLeft}`
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
    refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
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
  game.ironHills.ITEMS            = { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, TOOLS };
  game.ironHills.MAP_POI          = IRON_HILLS_POI;
  game.ironHills.buildCompendiums = buildCompendiums;
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

game.ironHills.openAlchemyWindow = (actor) => {
  const target = actor ?? game.user?.character ?? canvas.tokens?.controlled?.[0]?.actor;
  if (!target) { ui.notifications.warn("Выбери персонажа"); return; }
  const existing = Object.values(ui.windows).find(w =>
    w instanceof IronHillsAlchemyApp && w.actor?.id === target.id
  );
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsAlchemyApp(target).render(true);
};

game.ironHills.openCraftWindow = (actor) => {
  const target = actor ?? game.user?.character ?? canvas.tokens?.controlled?.[0]?.actor;
  if (!target) { ui.notifications.warn("Выбери персонажа"); return; }
  const existing = Object.values(ui.windows).find(w =>
    w instanceof IronHillsCraftApp && w.actor?.id === target.id
  );
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsCraftApp(target).render(true);
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
  const existing = Object.values(ui.windows).find(w =>
    w instanceof IronHillsGridInventoryApp && w.actor?.id === target.id
  );
  if (existing?.rendered) { existing.bringToTop?.(); return existing; }
  return new IronHillsGridInventoryApp(target).render(true);
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

    if (payload.actionType === "attack") {
      await actorSheet._performAttack(payload);
      return;
    }

    if (payload.actionType === "spell") {
      const item = actor.items.get(payload.itemId);
      if (item) {
        await actorSheet._castSpellLike({ item, isScroll: false });
      }
      return;
    }

    if (payload.actionType === "scroll") {
      const item = actor.items.get(payload.itemId);
      if (item) {
        await actorSheet._castSpellLike({ item, isScroll: true });
      }
      return;
    }

    if (payload.actionType === "throwable") {
      await actorSheet._useThrowable(payload.itemId);
      return;
    }

    if (payload.actionType === "potion") {
      await actorSheet._usePotion(payload.itemId);
      return;
    }

    if (payload.actionType === "food") {
      await actorSheet._consumeFood(payload.itemId);
      return;
    }

    if (payload.actionType === "consumable") {
      await actorSheet._useConsumable(payload.itemId);
      return;
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
      refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
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
      refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
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
      refreshAllTradeUIs(IronHillsActorSheet, IronHillsTradeApp);
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

Hooks.on("renderApplication", (app) => {
  // Применяем только к нашим окнам
  const ourClasses = ["trade-app","travel-app","craft-app","alchemy-app",
                      "grid-inventory","party-manager","world-map","world-journal",
                      "entity-picker","quest-board","world-tools"];
  if (ourClasses.some(c => app.options?.classes?.includes(c))) {
    preserveInputFocus(app);
  }
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
          content: `✨ <b>${actor.name}</b> — резерв энергии вырос! (${resVal} → ${Math.min(resMax, resVal + 1)} / ${resMax})`
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
          content: `✨ <b>${actor.name}</b> — резерв маны вырос! (${resVal} → ${Math.min(resMax, resVal + 1)} / ${resMax})`
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

    for (const actor of targets) {
      const baseMax = Number(actor.system?.resources?.energy?.baseMax ?? 10);
      const curMax  = Number(actor.system?.resources?.energy?.max     ?? baseMax);
      const missing = baseMax - curMax; // сколько max потеряно от усталости

      let newMax;
      if (type === "long") {
        newMax = baseMax; // полное восстановление max
      } else {
        // Короткий: +50% от потерянного max (минимум 1 если есть потери)
        newMax = Math.min(baseMax, curMax + Math.max(missing > 0 ? 1 : 0, Math.floor(missing * 0.5)));
      }

      const updates = {
        "system.resources.energy.max":   newMax,
        "system.resources.energy.value": newMax, // текущая тоже до max
      };

      // ── Прокачка baseMax ────────────────────────────────────
      // baseMax растёт только если реально восстановили потерянный max.
      // Логика: каждое полное восстановление = 1 очко опыта выносливости.
      // При накоплении N очков → baseMax+1.
      // N зависит от текущего baseMax (чем выше — тем сложнее растить).
      const restoredMax = newMax - curMax; // сколько max восстановили
      if (restoredMax > 0) {
        const GROWTH_KEY = "flags.iron-hills-system.energyGrowthXp";
        const curXp      = Number(actor.getFlag("iron-hills-system", "energyGrowthXp") ?? 0);
        const threshold  = baseMax; // нужно baseMax очков чтобы вырасти (тяжёлые бойцы растут медленнее)
        const xpGained   = restoredMax; // очков = сколько max восстановлено
        const newXp      = curXp + xpGained;

        if (newXp >= threshold) {
          // Рост baseMax!
          updates["system.resources.energy.baseMax"] = baseMax + 1;
          updates[GROWTH_KEY] = newXp - threshold;
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `<div style="padding:6px">
              💪 <b>${actor.name}</b> закалился — резерв энергии вырос до <b>${baseMax + 1}</b>!
            </div>`
          });
        } else {
          await actor.setFlag("iron-hills-system", "energyGrowthXp", newXp);
        }
      }

      await actor.update(updates);

      const label   = type === "long" ? "Длинный отдых" : "Короткий отдых";
      const restHours = type === "long" ? 8 : 1;
      const xpInfo  = restoredMax > 0
        ? `<br>Опыт выносливости: +${restoredMax}`
        : "";
      ui.notifications.info(`${actor.name}: ${label} — энергия ${newMax}/${newMax}`);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div style="font-family:var(--font-primary);padding:6px">
          <b>${label}</b> — ${actor.name}<br>
          ⚡ Энергия: <b>${curMax} → ${newMax} / ${newMax}</b>
          ${restoredMax > 0 ? ` (+${restoredMax} макс.)` : " (макс. не изменился)"}
          ${xpInfo}<br>
          ⏰ Прошло ${restHours}ч.
        </div>`
      });
    }

    // Перематываем время на длительность отдыха (один раз, не за каждого актора)
    const restHoursTotal = type === "long" ? 8 : 1;
    await game.time.advance(restHoursTotal * 3600);
    await applyLightingToScene(canvas?.scene);
    game.ironHills.apps?.weather?.render?.(false);
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
    get: () => getCombatMoveMode(),
  });
  game.ironHills.setMoveMode = (mode) => setCombatMoveMode(mode);

  game.ironHills.restShort = () => game.ironHills.rest("short");
  game.ironHills.restLong  = () => game.ironHills.rest("long");

  game.ironHills.openTimeDialog = async () => {
    // Перенаправляем в WeatherApp — единое место управления временем
    if (game.user?.isGM) { game.ironHills.openWeather?.(); return; }
    if (!game.user?.isGM) { ui.notifications.warn("Только GM"); return; }

    const current = game.time?.worldTime ?? 0;
    const curDays  = Math.floor(current / 86400);
    const curHours = Math.floor((current % 86400) / 3600);

    return new Promise(resolve => {
      new Dialog({
        title: "⏰ Перемотка времени",
        content: `
          <form style="font-family:var(--ih-font-ui,system-ui);color:#e8edf5;padding:6px">
            <p style="color:#6a7d99;font-size:11px;margin-bottom:10px">
              Текущее время: День ${curDays + 1}, ${curHours}ч
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
              <label style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#6a7d99">
                Дней
                <input id="adv-days"  type="number" value="0" min="0"
                  style="background:#232e42;border:1px solid rgba(120,150,200,0.2);
                         border-radius:6px;color:#e8edf5;padding:4px 8px;font-size:14px">
              </label>
              <label style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#6a7d99">
                Часов
                <input id="adv-hours" type="number" value="8" min="0" max="23"
                  style="background:#232e42;border:1px solid rgba(120,150,200,0.2);
                         border-radius:6px;color:#e8edf5;padding:4px 8px;font-size:14px">
              </label>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button type="button" data-preset="1h"  style="padding:3px 10px;border-radius:6px;background:#1b2333;border:1px solid rgba(120,150,200,0.2);color:#a8b8d0;cursor:pointer;font-size:10px">1ч</button>
              <button type="button" data-preset="4h"  style="padding:3px 10px;border-radius:6px;background:#1b2333;border:1px solid rgba(120,150,200,0.2);color:#a8b8d0;cursor:pointer;font-size:10px">4ч</button>
              <button type="button" data-preset="8h"  style="padding:3px 10px;border-radius:6px;background:#1b2333;border:1px solid rgba(120,150,200,0.2);color:#a8b8d0;cursor:pointer;font-size:10px">8ч (ночь)</button>
              <button type="button" data-preset="24h" style="padding:3px 10px;border-radius:6px;background:#1b2333;border:1px solid rgba(120,150,200,0.2);color:#a8b8d0;cursor:pointer;font-size:10px">1 день</button>
              <button type="button" data-preset="168h" style="padding:3px 10px;border-radius:6px;background:#1b2333;border:1px solid rgba(120,150,200,0.2);color:#a8b8d0;cursor:pointer;font-size:10px">1 неделя</button>
            </div>
          </form>
        `,
        buttons: {
          advance: {
            label: "⏩ Перемотать",
            callback: async (html) => {
              const days  = Number(html.find("#adv-days").val())  || 0;
              const hours = Number(html.find("#adv-hours").val()) || 0;
              const total = days * 24 + hours;
              if (total <= 0) { ui.notifications.warn("Укажи время"); return; }
              await game.time.advance(total * 3600);
              // Тик угасания душ за каждый прошедший день
              if (days > 0) {
                for (let d = 0; d < days; d++) await game.ironHills.tickSoulDecay?.();
              }
              ui.notifications.info(`⏰ Перемотано на ${days > 0 ? days + "д " : ""}${hours > 0 ? hours + "ч" : ""}`);
              resolve(total);
            }
          },
          cancel: { label: "Отмена", callback: () => resolve(null) }
        },
        render: (html) => {
          html.find("[data-preset]").on("click", e => {
            const h = parseInt(e.currentTarget.dataset.preset);
            const d = Math.floor(h / 24);
            const rem = h % 24;
            html.find("#adv-days").val(d);
            html.find("#adv-hours").val(rem);
          });
        },
        default: "advance",
      }).render(true);
    });
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
