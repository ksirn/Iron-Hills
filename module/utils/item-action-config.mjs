export const ITEM_APPLICATION_SCOPES = new Set(["targeted", "global", "auto", "area"]);

export const ITEM_TARGET_ACTOR_MODES = new Set(["self", "selected-or-self", "selected-only", "area"]);

export const ITEM_ACTION_TYPE_DEFAULTS = Object.freeze({
  "heal-part": { applicationScope: "targeted", targetActorMode: "selected-or-self" },
  bandage: { applicationScope: "targeted", targetActorMode: "selected-or-self" },
  tourniquet: { applicationScope: "targeted", targetActorMode: "selected-or-self" },
  splint: { applicationScope: "targeted", targetActorMode: "selected-or-self" },
  surgery: { applicationScope: "targeted", targetActorMode: "selected-or-self" },
  "heal-body": { applicationScope: "global", targetActorMode: "self" },
  "restore-energy": { applicationScope: "global", targetActorMode: "self" },
  "restore-energy-max": { applicationScope: "global", targetActorMode: "self" },
  "restore-mana": { applicationScope: "global", targetActorMode: "self" },
  "restore-hydration": { applicationScope: "global", targetActorMode: "self" },
  "restore-satiety": { applicationScope: "global", targetActorMode: "self" },
  "cure-poison": { applicationScope: "global", targetActorMode: "selected-or-self" },
  "cure-disease": { applicationScope: "global", targetActorMode: "selected-or-self" },
  "stop-minor-bleeding-global": { applicationScope: "global", targetActorMode: "selected-or-self" },
  "stabilize-body": { applicationScope: "global", targetActorMode: "selected-or-self" },
  "drink-vessel": { applicationScope: "global", targetActorMode: "self" },
  "apply-condition": { applicationScope: "targeted", targetActorMode: "selected-or-self" },
});

export const ITEM_ACTION_TYPE_LABELS = Object.freeze({
  "heal-part": "Лечение части тела",
  "heal-body": "Лечение всего тела",
  bandage: "Перевязка",
  tourniquet: "Жгут",
  splint: "Шина",
  surgery: "Хирургия",
  "restore-energy": "Восстановление энергии",
  "restore-energy-max": "Восстановление максимума энергии",
  "restore-mana": "Восстановление маны",
  "restore-hydration": "Восстановление воды",
  "restore-satiety": "Восстановление сытости",
  "cure-poison": "Снятие яда",
  "cure-disease": "Лечение болезни",
  "stop-minor-bleeding-global": "Остановка малого кровотечения",
  "stabilize-body": "Стабилизация",
  "drink-vessel": "Питьё",
  "apply-condition": "Эффект состояния",
});

export const ITEM_EFFECT_TYPE_LABELS = Object.freeze({
  damage: "Урон",
  healHP: "Лечение HP",
  heal: "Лечение",
  healAll: "Лечение всего тела",
  restoreEnergy: "Восстановление энергии",
  restoreEnergyMax: "Восстановление максимума энергии",
  restoreMana: "Восстановление маны",
  restoreHydration: "Восстановление воды",
  restoreSatiety: "Восстановление сытости",
  curePoison: "Снятие яда",
  cureDisease: "Лечение болезни",
  reduceBleeding: "Перевязка",
  bandage: "Перевязка",
  tourniquet: "Жгут",
  splint: "Шина",
  surgery: "Хирургия",
  stabilize: "Стабилизация",
  stabilizeBody: "Стабилизация",
  stopBleeding: "Остановка кровотечения",
  stopMinorBleeding: "Остановка малого кровотечения",
  speedBoost: "Ускорение",
  stimulant: "Стимулятор",
  poison: "Яд",
  burn: "Горение",
  stun: "Оглушение",
  silence: "Безмолвие",
  slow: "Замедление",
  fear: "Страх",
  reserveDrain: "Урон по резерву",
  buff: "Усиление",
  debuff: "Ослабление",
  summon: "Призыв",
  banish: "Изгнание",
  lifesteal: "Вампиризм",
  double_vs_undead: "Сильнее против нежити",
  "drink-vessel": "Питьё",
});

export const LEGACY_ITEM_EFFECT_ACTIONS = Object.freeze({
  healHP: { actionType: "heal-part", applicationScope: "targeted" },
  heal: { actionType: "heal-part", applicationScope: "targeted" },
  damage: { actionType: "", applicationScope: "targeted", targetActorMode: "selected-or-self" },
  healAll: { actionType: "heal-body", applicationScope: "global", targetActorMode: "self", targetPart: "" },
  restoreEnergy: { actionType: "restore-energy", applicationScope: "global", targetActorMode: "self", targetPart: "" },
  restoreEnergyMax: { actionType: "restore-energy-max", applicationScope: "global", targetActorMode: "self", targetPart: "" },
  restoreMana: { actionType: "restore-mana", applicationScope: "global", targetActorMode: "self", targetPart: "" },
  restoreHydration: { actionType: "restore-hydration", applicationScope: "global", targetActorMode: "self", targetPart: "" },
  restoreSatiety: { actionType: "restore-satiety", applicationScope: "global", targetActorMode: "self", targetPart: "" },
  curePoison: { actionType: "cure-poison", applicationScope: "global", targetActorMode: "selected-or-self", targetPart: "" },
  cureDisease: { actionType: "cure-disease", applicationScope: "global", targetActorMode: "selected-or-self", targetPart: "" },
  reduceBleeding: { actionType: "bandage", applicationScope: "targeted", targetActorMode: "selected-or-self", targetPart: "" },
  bandage: { actionType: "bandage", applicationScope: "targeted", targetActorMode: "selected-or-self", targetPart: "" },
  tourniquet: { actionType: "tourniquet", applicationScope: "targeted", targetActorMode: "selected-or-self", targetPart: "" },
  splint: { actionType: "splint", applicationScope: "targeted", targetActorMode: "selected-or-self", targetPart: "" },
  surgery: { actionType: "surgery", applicationScope: "targeted", targetActorMode: "selected-or-self", targetPart: "" },
  stabilize: { actionType: "stabilize-body", applicationScope: "global", targetActorMode: "selected-or-self", targetPart: "" },
  stabilizeBody: { actionType: "stabilize-body", applicationScope: "global", targetActorMode: "selected-or-self", targetPart: "" },
  stopBleeding: { actionType: "stabilize-body", applicationScope: "global", targetActorMode: "selected-or-self", targetPart: "" },
  stopMinorBleeding: { actionType: "stop-minor-bleeding-global", applicationScope: "global", targetActorMode: "selected-or-self", targetPart: "" },
  speedBoost: { actionType: "apply-condition", applicationScope: "global", targetActorMode: "self", targetPart: "" },
  stimulant: { actionType: "apply-condition", applicationScope: "global", targetActorMode: "self", targetPart: "" },
  poison: { actionType: "apply-condition", applicationScope: "global", targetActorMode: "selected-or-self", targetPart: "" },
  burn: { actionType: "apply-condition", applicationScope: "global", targetActorMode: "selected-or-self", targetPart: "" },
  stun: { actionType: "apply-condition", applicationScope: "targeted", targetActorMode: "selected-or-self" },
  silence: { actionType: "apply-condition", applicationScope: "targeted", targetActorMode: "selected-or-self" },
  slow: { actionType: "apply-condition", applicationScope: "targeted", targetActorMode: "selected-or-self" },
  fear: { actionType: "apply-condition", applicationScope: "targeted", targetActorMode: "selected-or-self" },
});

export const LEGACY_ITEM_EFFECT_CONDITIONS = Object.freeze({
  speedBoost: { conditionKey: "hasted", valueKind: "duration", mode: "max" },
  stimulant: { conditionKey: "hasted", valueKind: "duration", mode: "max" },
  poison: { conditionKey: "poison", valueKind: "stack", mode: "add" },
  burn: { conditionKey: "burning", valueKind: "stack", mode: "add" },
  stun: { conditionKey: "stunned", valueKind: "duration", mode: "max" },
  silence: { conditionKey: "silencedUntil", valueKind: "duration", mode: "max" },
  slow: { conditionKey: "slowed", valueKind: "duration", mode: "max" },
  fear: { conditionKey: "feared", valueKind: "duration", mode: "max" },
});

export function actionConfigFromEffect(effectType, targetPart = "torso") {
  const key = String(effectType ?? "").trim();
  const legacy = LEGACY_ITEM_EFFECT_ACTIONS[key] ?? null;
  const actionType = legacy?.actionType ?? (ITEM_ACTION_TYPE_DEFAULTS[key] ? key : "");
  const defaults = ITEM_ACTION_TYPE_DEFAULTS[actionType] ?? {};
  const applicationScope = legacy?.applicationScope ?? defaults.applicationScope ?? "global";
  const targetActorMode = legacy?.targetActorMode ?? defaults.targetActorMode ?? "self";

  let resolvedPart = legacy?.targetPart;
  if (resolvedPart === undefined) {
    resolvedPart = applicationScope === "targeted" ? targetPart : "";
  }

  return {
    actionType,
    applicationScope,
    targetActorMode,
    targetPart: resolvedPart ?? "",
  };
}

export function conditionConfigFromEffect(effectType, amount = 1) {
  const key = String(effectType ?? "").trim();
  const config = LEGACY_ITEM_EFFECT_CONDITIONS[key] ?? null;
  if (!config) return null;

  return {
    conditionKey: config.conditionKey,
    valueKind: config.valueKind ?? "duration",
    mode: config.mode ?? "max",
    amount: Math.max(1, Number(amount ?? 1) || 1),
  };
}
