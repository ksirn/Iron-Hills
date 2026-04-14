/**
 * Iron Hills System — точка входа.
 * Этот файл только регистрирует классы и Hooks.
 * Вся логика — в отдельных модулях.
 */
import { IronHillsActorSheet }   from "./apps/actor-sheet.mjs";
import { IronHillsItemSheet }    from "./apps/item-sheet.mjs";
import { IronHillsTradeApp }     from "./apps/trade-app.mjs";
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
  refreshAllTradeUIs
} from "./services/ui-refresh-service.mjs";
import { registerDebugSetting, debugLog } from "./utils/debug-utils.mjs";
import {
  endTurnForActor,
  isActorActiveTurn,
  ensureCombatActorBodyStatus,
  continuePendingAction,
  cancelPendingAction,
  nextTurn,
  endCombat,
  isCombatActive
} from "./services/combat-flow-service.mjs";

Hooks.once("init", () => {
  console.log("Iron Hills System | init");
  registerDebugSetting();
  debugLog("System init started");
  Handlebars.registerHelper("eq", (a, b) => a === b);

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("iron-hills-system", IronHillsActorSheet, { makeDefault: true });

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
  async function migrateUnifiedTargetingForItem(item) {
    if (!item) return;

    const supportedTypes = new Set(["consumable", "potion", "spell", "scroll"]);
    if (!supportedTypes.has(item.type)) return;

    const system = item.system ?? {};
    const updates = {};

    if (system.actionType === undefined) {
      updates["system.actionType"] = "";
    }

    if (system.applicationScope === undefined || system.applicationScope === null || system.applicationScope === "") {
      updates["system.applicationScope"] = item.type === "potion" ? "global" : "targeted";
    }

    if (system.targetPart === undefined || system.targetPart === null) {
      updates["system.targetPart"] = "";
    }

    const currentActionType = String(system.actionType ?? "").trim();
    const legacyMedicalAction = String(system.medicalAction ?? "").trim();
    const legacyEffectType = String(system.effectType ?? "").trim();

    if (!currentActionType) {
      if (legacyMedicalAction) {
        updates["system.actionType"] = legacyMedicalAction;
      } else if (legacyEffectType) {
        if (legacyEffectType === "reduceBleeding") updates["system.actionType"] = "bandage";
        else if (legacyEffectType === "restoreEnergy") updates["system.actionType"] = "restore-energy";
        else if (legacyEffectType === "restoreMana") updates["system.actionType"] = "restore-mana";
        else if (legacyEffectType === "healHP") updates["system.actionType"] = "heal-body";
        else if (legacyEffectType === "heal") {
          updates["system.actionType"] = system.targetPart ? "heal-part" : "heal-body";
        }
      }
    }

    if (system.medicalAction !== undefined) {
      updates["system.-=medicalAction"] = null;
    }

    if (system.effectType !== undefined) {
      updates["system.-=effectType"] = null;
    }

    if (system.effectType2 !== undefined) {
      updates["system.-=effectType2"] = null;
    }

    if (Object.keys(updates).length) {
      await item.update(updates);
    }
  }

  async function migrateUnifiedTargetingForAllItems() {
    for (const item of game.items ?? []) {
      try {
        await migrateUnifiedTargetingForItem(item);
      } catch (err) {
        console.error("Iron Hills | item migration error", item?.name, err);
      }
    }

    for (const actor of game.actors ?? []) {
      for (const item of actor.items ?? []) {
        try {
          await migrateUnifiedTargetingForItem(item);
        } catch (err) {
          console.error("Iron Hills | embedded item migration error", actor?.name, item?.name, err);
        }
      }
    }
  }
  game.ironHills.endTurnForActor = endTurnForActor;
  game.ironHills.isActorActiveTurn = isActorActiveTurn;
  game.ironHills.migrateUnifiedTargetingForAllItems = migrateUnifiedTargetingForAllItems;
  // openWorldTools регистрируется в world-sim-tools.mjs через его собственный ready hook.
  // Дублирующая регистрация здесь удалена.

  // Миграция: добавить abdomen тем акторам у которых его нет
  async function migrateAbdomenForAllActors() {
    for (const actor of game.actors ?? []) {
      try {
        const hp = actor.system?.resources?.hp;
        if (!hp || hp.abdomen !== undefined) continue;

        await actor.update({
          "system.resources.hp.abdomen": { value: 25, max: 25 }
        });
        console.log(`Iron Hills | Added abdomen HP to: ${actor.name}`);
      } catch (err) {
        console.error("Iron Hills | abdomen migration error", actor?.name, err);
      }
    }
  }
  void migrateAbdomenForAllActors();

  // Миграция: добавить soulReserve акторам у которых его нет
  async function migrateSoulReserveForAllActors() {
    for (const actor of game.actors ?? []) {
      try {
        if (actor.type !== "character") continue;
        const sr = actor.system?.resources?.soulReserve;
        if (sr !== undefined) continue;

        await actor.update({
          "system.resources.soulReserve": { mana: 0, energy: 0, daysSinceDeath: 0 }
        });
        console.log(`Iron Hills | Added soulReserve to: ${actor.name}`);
      } catch (err) {
        console.error("Iron Hills | soulReserve migration error", actor?.name, err);
      }
    }
  }
  void migrateSoulReserveForAllActors();

  // Миграция: обновить NPC на новую структуру (части тела + новый combat)
  async function migrateNpcStructure() {
    for (const actor of game.actors ?? []) {
      try {
        if (actor.type !== "npc") continue;
        const updates = {};

        // Если hp — одна полоска (старая monster-система) → конвертируем в части тела
        const hp = actor.system?.resources?.hp;
        if (hp && hp.value !== undefined && hp.torso === undefined) {
          const baseHp = Number(hp.value ?? 30);
          updates["system.resources.hp"] = {
            head:     { value: Math.ceil(baseHp * 0.25), max: Math.ceil(baseHp * 0.25) },
            torso:    { value: Math.ceil(baseHp * 0.50), max: Math.ceil(baseHp * 0.50) },
            abdomen:  { value: Math.ceil(baseHp * 0.40), max: Math.ceil(baseHp * 0.40) },
            leftArm:  { value: Math.ceil(baseHp * 0.30), max: Math.ceil(baseHp * 0.30) },
            rightArm: { value: Math.ceil(baseHp * 0.30), max: Math.ceil(baseHp * 0.30) },
            leftLeg:  { value: Math.ceil(baseHp * 0.35), max: Math.ceil(baseHp * 0.35) },
            rightLeg: { value: Math.ceil(baseHp * 0.35), max: Math.ceil(baseHp * 0.35) }
          };
        }

        // Добавить базовый порог если нет
        if (actor.system?.combat?.baseThreshold === undefined) {
          updates["system.combat.baseThreshold"] = 4;
        }

        // Добавить abdomen если нет
        if (actor.system?.resources?.hp?.torso !== undefined &&
            actor.system?.resources?.hp?.abdomen === undefined) {
          updates["system.resources.hp.abdomen"] = { value: 25, max: 25 };
        }

        if (Object.keys(updates).length) {
          await actor.update(updates);
          console.log(`Iron Hills | NPC migrated: ${actor.name}`);
        }
      } catch (err) {
        console.error("Iron Hills | NPC migration error", actor?.name, err);
      }
    }
  }
  void migrateNpcStructure();

  // GM-команда: прошёл день после смерти — тикаем резерв
  game.ironHills.tickSoulDecay = async () => {
    if (!game.user?.isGM) return;
    let ticked = 0;
    for (const actor of game.actors ?? []) {
      try {
        if (actor.type !== "character") continue;
        const sr = actor.system?.resources?.soulReserve;
        if (!sr) continue;
        if (sr.daysSinceDeath <= 0) continue; // живой или воскрешён

        const updates = {
          "system.resources.soulReserve.daysSinceDeath": sr.daysSinceDeath + 1,
          "system.resources.mana.max": Math.max(0, Number(actor.system?.resources?.mana?.max ?? 10) - 1),
          "system.resources.energy.max": Math.max(0, Number(actor.system?.resources?.energy?.max ?? 10) - 1)
        };

        const newManaMax = updates["system.resources.mana.max"];
        const newEnergyMax = updates["system.resources.energy.max"];

        await actor.update(updates);
        ticked++;

        if (newManaMax <= 0 || newEnergyMax <= 0) {
          await ChatMessage.create({
            content: `<b style="color:#ef4444">☠ ${actor.name}</b> — резерв иссяк. Пробуждённый потерян навсегда. Требуется создать нового персонажа.`
          });
        } else {
          await ChatMessage.create({
            content: `⏳ <b>${actor.name}</b> — душа угасает. Мана: ${newManaMax}, Энергия: ${newEnergyMax}. Осталось дней: ~${Math.min(newManaMax, newEnergyMax)}`
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
    if (game.user?.isGM) return;
    if (!game.user?.character) return;

    window.setTimeout(() => {
      try {
        const existing = game.ironHills?.apps?.combatHud;
        if (existing?.rendered) return;
        game.ironHills.openCombatHud({ compactMode: true });
      } catch (err) {
        console.warn("Iron Hills | failed to auto-open player HUD", err);
      }
    }, 300);
  }

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
});

  ensureDefaultPlayerHud();
  
void migrateUnifiedTargetingForAllItems();
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
});



  function rerenderOpenIronHillsActorSheets() {
    for (const app of Object.values(ui.windows ?? {})) {
      if (!app?.rendered) continue;
      if (app.constructor?.name !== "IronHillsActorSheet") continue;
      try { app.render(false); } catch (err) {
        console.warn("Iron Hills | actor sheet rerender failed", err);
      }
    }
  }

  Hooks.on("ironHillsCombatUpdated", () => {
    rerenderOpenIronHillsActorSheets();
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
// HOTKEYS — автоматическое создание макросов на макробаре
// Вызывается один раз после загрузки мира (только для GM)
// ============================================================

async function ensureIronHillsMacros() {
  if (!game.user?.isGM) return;

  const MACROS = [
    {
      slot: 1,
      name: "⚔ Combat HUD",
      command: "game.ironHills?.toggleCombatHud?.()",
      img: "icons/svg/sword.svg",
      tooltip: "Открыть/закрыть Combat HUD"
    },
    {
      slot: 2,
      name: "⚔ Combat Manager",
      command: "game.ironHills?.openCombatManager?.()",
      img: "icons/svg/combat.svg",
      tooltip: "Открыть менеджер боя"
    },
    {
      slot: 3,
      name: "🛒 Торговля",
      command: `
const token = canvas.tokens?.controlled?.[0];
const actor = token?.actor ?? game.user?.character;
if (!actor) { ui.notifications.warn("Выбери токен торговца"); return; }
if (actor.type !== "merchant") { ui.notifications.warn("Выбери токен торговца"); return; }
const { IronHillsTradeApp } = await import("/systems/iron-hills-system/module/apps/trade-app.mjs");
new IronHillsTradeApp(actor).render(true);
      `.trim(),
      img: "icons/svg/coins.svg",
      tooltip: "Открыть окно торговли с выбранным торговцем"
    },
    {
      slot: 4,
      name: "🗓 Soul Decay",
      command: "game.ironHills?.tickSoulDecay?.()",
      img: "icons/svg/skull.svg",
      tooltip: "Тик угасания души (GM: используй раз в игровой день)"
    },
  ];

  const hotbar = game.macros;

  for (const def of MACROS) {
    // Проверяем есть ли уже макрос с таким именем
    const existing = hotbar.find(m => m.name === def.name);
    let macro = existing;

    if (!macro) {
      macro = await Macro.create({
        name:    def.name,
        type:    "script",
        command: def.command,
        img:     def.img,
        flags:   { "iron-hills-system": { autoCreated: true } }
      });
    }

    if (macro) {
      // Назначаем в слот макробара
      await game.user.assignHotbarMacro(macro, def.slot);
    }
  }

  console.log("Iron Hills | Макросы созданы на слотах 1-4");
}

// Запускаем после полной загрузки мира
Hooks.once("ready", () => {
  setTimeout(() => ensureIronHillsMacros(), 2000);
});
