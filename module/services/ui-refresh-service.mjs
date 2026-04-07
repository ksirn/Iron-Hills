import { debugLog, debugWarn, debugError } from "../utils/debug-utils.mjs";

export const RENDER_QUEUE = new Map();

function isValidCtor(value) {
  return typeof value === "function";
}

function isInstanceOf(app, ctor) {
  if (!app || !isValidCtor(ctor)) return false;

  try {
    return app instanceof ctor;
  } catch (err) {
    console.warn("isInstanceOf warning:", err);
    return false;
  }
}

export function queueAppRender(app, force = false, delay = 30) {
  if (!app?.rendered) return;
debugLog("queueAppRender:schedule", {
  appId: app.appId,
  appName: app.constructor?.name,
  force,
  delay
});
  const key = app.appId ?? app.id ?? Math.random().toString(36);

  if (RENDER_QUEUE.has(key)) {
    clearTimeout(RENDER_QUEUE.get(key));
  }

  const timer = setTimeout(() => {
    RENDER_QUEUE.delete(key);

    try {
      if (app.rendered) {
        debugLog("queueAppRender:render", {
  appId: app.appId,
  appName: app.constructor?.name,
  force
});
        app.render(force);
      }
    } catch (err) {
      debugError("queueAppRender:error", {
  appId: app?.appId,
  appName: app?.constructor?.name,
  message: err?.message,
  err
});
    }
  }, delay);

  RENDER_QUEUE.set(key, timer);
}

export function queueActorSheetRender(actor, force = false, delay = 30) {
  if (!actor?.sheet?.rendered) return;
  queueAppRender(actor.sheet, force, delay);
}

export function refreshMerchantTradeViews(actorSheetClass) {
  if (!isValidCtor(actorSheetClass)) {
debugWarn("refreshMerchantTradeViews skipped: invalid actorSheetClass", actorSheetClass);
    return;
  }

  for (const app of Object.values(ui.windows)) {
    if (!app) continue;
    if (!isInstanceOf(app, actorSheetClass)) continue;
    if (app.actor?.type !== "merchant") continue;
debugLog("refreshMerchantTradeViews:queue", {
  appId: app.appId,
  actorId: app.actor?.id,
  actorName: app.actor?.name
});
    queueAppRender(app, false, 30);
  }
}

export function rerenderOpenTradeApps(tradeAppClass) {
  if (!isValidCtor(tradeAppClass)) {
    debugWarn("rerenderOpenTradeApps skipped: invalid tradeAppClass", tradeAppClass);
    return;
  }

  for (const app of Object.values(ui.windows)) {
    if (!app) continue;
    if (!isInstanceOf(app, tradeAppClass)) continue;
debugLog("rerenderOpenTradeApps:queue", {
  appId: app.appId,
  appName: app.constructor?.name
});
    queueAppRender(app, false, 30);
  }
}

export function refreshCharacterAndMerchantSheets(actorSheetClass) {
  if (!isValidCtor(actorSheetClass)) {
    console.warn("refreshCharacterAndMerchantSheets skipped: invalid actorSheetClass", actorSheetClass);
    return;
  }

  for (const app of Object.values(ui.windows)) {
    if (!app) continue;
    if (!isInstanceOf(app, actorSheetClass)) continue;
    if (!app.actor) continue;
    if (app.actor.type !== "character" && app.actor.type !== "merchant") continue;

    queueAppRender(app, false, 30);
  }
}

export function refreshAllTradeUIs(actorSheetClass, tradeAppClass) {
  refreshCharacterAndMerchantSheets(actorSheetClass);
  rerenderOpenTradeApps(tradeAppClass);
}

export function injectWorldToolsButton(html, onClick) {
  if (html.find(".iron-hills-tools-button").length) return;

  const footer = html.find(".directory-footer");
  if (!footer.length) return;

  const button = $(`
    <button type="button" class="iron-hills-tools-button">
      <i class="fas fa-hammer"></i> Iron Hills Tools
    </button>
  `);

  button.on("click", onClick);
  footer.append(button);
}