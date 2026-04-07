const DEBUG_NAMESPACE = "iron-hills-system";
const DEBUG_SETTING = "debugMode";

function prefix(level = "LOG") {
  return `[${DEBUG_NAMESPACE}:${level}]`;
}

export function isDebugEnabled() {
  try {
    return !!game.settings.get(DEBUG_NAMESPACE, DEBUG_SETTING);
  } catch (err) {
    return false;
  }
}

export function debugLog(...args) {
  if (!isDebugEnabled()) return;
  console.log(prefix("LOG"), ...args);
}

export function debugWarn(...args) {
  if (!isDebugEnabled()) return;
  console.warn(prefix("WARN"), ...args);
}

export function debugError(...args) {
  if (!isDebugEnabled()) return;
  console.error(prefix("ERROR"), ...args);
}

export function registerDebugSetting() {
  game.settings.register(DEBUG_NAMESPACE, DEBUG_SETTING, {
    name: "Iron Hills Debug Mode",
    hint: "Включает расширенные логи системы Iron Hills в консоли браузера.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
}