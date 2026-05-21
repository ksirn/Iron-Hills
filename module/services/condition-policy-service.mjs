const DEFAULT_TURN_SECONDS = 6;

const CONDITION_DEFINITIONS = Object.freeze({
  bleeding: {
    label: "Кровотечение",
    icon: "fa-droplet",
    color: "var(--ih-hp-crit)",
    category: "damage",
    valueKind: "stack",
    mode: "add",
    ongoingDamage: true,
    display: true,
    sort: 10,
  },
  poison: {
    label: "Яд",
    icon: "fa-skull",
    color: "var(--ih-food)",
    category: "damage",
    valueKind: "stack",
    mode: "add",
    ongoingDamage: true,
    display: true,
    sort: 20,
  },
  burning: {
    label: "Горение",
    icon: "fa-fire",
    color: "var(--ih-hp-bad)",
    category: "damage",
    valueKind: "stack",
    mode: "add",
    ongoingDamage: true,
    display: true,
    sort: 30,
  },
  shock: {
    label: "Шок",
    icon: "fa-bolt",
    color: "var(--ih-mana)",
    category: "trauma",
    valueKind: "stack",
    mode: "max",
    display: true,
    sort: 40,
  },
  stunned: {
    label: "Оглушение",
    icon: "fa-dizzy",
    color: "var(--ih-hp-warn)",
    category: "control",
    valueKind: "duration",
    mode: "max",
    skipsTurn: true,
    display: true,
    sort: 50,
  },
  unconscious: {
    label: "Без сознания",
    icon: "fa-bed",
    color: "#f87171",
    category: "control",
    valueKind: "duration",
    mode: "max",
    display: true,
    sort: 55,
  },
  silencedUntil: {
    label: "Безмолвие",
    icon: "fa-volume-xmark",
    color: "#a78bfa",
    category: "control",
    valueKind: "duration",
    storageMode: "untilTime",
    mode: "max",
    display: true,
    sort: 60,
  },
  slowPenalty: {
    label: "Штраф инициативы",
    icon: "fa-person-walking",
    color: "#94a3b8",
    category: "control",
    valueKind: "stack",
    mode: "add",
    display: true,
    sort: 65,
  },
  feared: {
    label: "Страх",
    icon: "fa-ghost",
    color: "#c084fc",
    category: "control",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 70,
  },
  fleeing: {
    label: "Бегство",
    icon: "fa-person-running",
    color: "#f472b6",
    category: "control",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 75,
  },
  hasted: {
    label: "Ускорение",
    icon: "fa-forward-fast",
    color: "#22c55e",
    category: "buff",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 80,
  },
  slowed: {
    label: "Замедление",
    icon: "fa-person-walking",
    color: "#818cf8",
    category: "control",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 90,
  },
  exposed: {
    label: "Уязвимость",
    icon: "fa-eye",
    color: "#f87171",
    category: "defense",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 100,
  },
  pushed: {
    label: "Отброшен",
    icon: "fa-person-falling",
    color: "#a8b8d0",
    category: "posture",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 110,
  },
  prone: {
    label: "Повален",
    icon: "fa-person-falling-burst",
    color: "#94a3b8",
    category: "posture",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 120,
  },
  grappled: {
    label: "Захват",
    icon: "fa-hand-fist",
    color: "#f97316",
    category: "control",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 130,
  },
  sleeping: {
    label: "Сон",
    icon: "fa-moon",
    color: "#7dd3fc",
    category: "control",
    valueKind: "duration",
    mode: "max",
    skipsTurn: true,
    display: true,
    sort: 140,
  },
  disarmed: {
    label: "Разоружение",
    icon: "fa-hand",
    color: "#fbbf24",
    category: "control",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 150,
  },
  shield_lost: {
    label: "Без щита",
    icon: "fa-shield",
    color: "#fb923c",
    category: "defense",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 160,
  },
  armor_cracked: {
    label: "Броня треснула",
    icon: "fa-shield-halved",
    color: "#78716c",
    category: "defense",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 170,
  },
  broken_limb: {
    label: "Перелом",
    icon: "fa-kit-medical",
    color: "#a3a3a3",
    category: "trauma",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 180,
  },
  aimed_shot_bonus: {
    label: "Прицел",
    icon: "fa-crosshairs",
    color: "#facc15",
    category: "prepared",
    valueKind: "stack",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    displayValuePrefix: "+",
    sort: 190,
  },
  formation_stance: {
    label: "Строй",
    icon: "fa-people-arrows",
    color: "#60a5fa",
    category: "prepared",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 200,
  },
  shield_wall_formation: {
    label: "Стена щитов",
    icon: "fa-shield-halved",
    color: "#38bdf8",
    category: "prepared",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 210,
  },
  riposte_ready: {
    label: "Рипост готов",
    icon: "fa-reply",
    color: "#fb923c",
    category: "prepared",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 220,
  },
  counter_ready: {
    label: "Контрудар",
    icon: "fa-rotate",
    color: "#fb923c",
    category: "prepared",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 230,
  },
  intercept_ready: {
    label: "Перехват",
    icon: "fa-hand",
    color: "#f472b6",
    category: "prepared",
    valueKind: "duration",
    mode: "max",
    tickOnTurnStart: true,
    display: true,
    sort: 240,
  },
  rapid_reload: {
    label: "Быстрая перезарядка",
    icon: "fa-bolt",
    color: "#facc15",
    category: "prepared",
    valueKind: "stack",
    mode: "max",
    display: true,
    sort: 250,
  },
});

const CONDITION_ALIASES = Object.freeze({
  bleed: "bleeding",
  poison_stack: "poison",
  fire: "burning",
  burn: "burning",
  stun: "stunned",
  silence: "silencedUntil",
  silenced: "silencedUntil",
  slow: "slowed",
  haste: "hasted",
  fear: "feared",
  flee: "fleeing",
  aim: "aimed_shot_bonus",
  formation: "formation_stance",
  shield_wall: "shield_wall_formation",
  riposte: "riposte_ready",
  counter: "counter_ready",
  intercept: "intercept_ready",
});

function readRawValue(raw) {
  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  if (raw && typeof raw === "object") {
    if (typeof raw.value === "number") return raw.value;
    if (typeof raw.active === "boolean") return raw.active ? 1 : 0;
  }
  return 0;
}

function getWorldTime(options = {}) {
  const explicit = Number(options.worldTime ?? options.currentTime);
  if (Number.isFinite(explicit)) return explicit;
  return Number(globalThis.game?.time?.worldTime ?? 0);
}

function pushNote(notes, text) {
  if (text && !notes.includes(text)) notes.push(text);
}

export function normalizeConditionKey(key) {
  const raw = String(key ?? "").trim();
  if (!raw) return "";
  return CONDITION_ALIASES[raw] ?? raw;
}

export function getConditionDefinition(key) {
  const normalized = normalizeConditionKey(key);
  return CONDITION_DEFINITIONS[normalized] ?? null;
}

export function getConditionStorageKey(key) {
  const normalized = normalizeConditionKey(key);
  return getConditionDefinition(normalized)?.storageKey ?? normalized;
}

export function getConditionLabel(key) {
  const normalized = normalizeConditionKey(key);
  return getConditionDefinition(normalized)?.label ?? normalized;
}

export function getConditionDefaultMode(key) {
  return getConditionDefinition(key)?.mode ?? "max";
}

export function getConditionDefaultValueKind(key) {
  return getConditionDefinition(key)?.valueKind ?? "stack";
}

export function isOngoingDamageCondition(key) {
  return Boolean(getConditionDefinition(key)?.ongoingDamage);
}

export function normalizeConditionAmount(key, value, { valueKind = null, currentTime = null } = {}) {
  const definition = getConditionDefinition(key);
  const resolvedKind = valueKind ?? definition?.valueKind ?? "stack";
  const amount = Math.max(1, Number(value ?? 1));

  if (definition?.storageMode === "untilTime" && resolvedKind === "duration") {
    const baseTime = Math.max(0, Number(currentTime ?? getWorldTime()));
    return baseTime + amount;
  }

  if (resolvedKind === "duration" && definition?.ongoingDamage) {
    return Math.max(1, Math.ceil(amount / DEFAULT_TURN_SECONDS));
  }

  return amount;
}

export function getConditionValueFromMap(conditions = {}, key, options = {}) {
  const canonicalKey = normalizeConditionKey(key);
  const definition = getConditionDefinition(canonicalKey);
  const storageKey = getConditionStorageKey(canonicalKey);
  const rawValue = readRawValue(conditions?.[storageKey]);

  if (definition?.storageMode === "untilTime") {
    const remaining = rawValue - getWorldTime(options);
    return remaining > 0 ? remaining : 0;
  }

  return rawValue;
}

export function isConditionActive(conditions = {}, key, options = {}) {
  return getConditionValueFromMap(conditions, key, options) > 0;
}

export function getActiveConditionEntries(conditions = {}, options = {}) {
  return Object.entries(CONDITION_DEFINITIONS)
    .filter(([, definition]) => definition.display)
    .map(([key, definition]) => {
      const value = getConditionValueFromMap(conditions, key, options);
      const numericValue = Math.ceil(value);
      const displayValue = definition.displayValuePrefix
        ? `${definition.displayValuePrefix}${numericValue}`
        : numericValue;

      return {
        key,
        storageKey: getConditionStorageKey(key),
        label: definition.label,
        icon: definition.icon,
        color: definition.color,
        category: definition.category,
        value: displayValue,
        numericValue,
        active: value > 0,
        sort: definition.sort ?? 999,
      };
    })
    .filter(entry => entry.active)
    .sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label, "ru"));
}

export function getTurnStartDecayConditionKeys() {
  return Object.entries(CONDITION_DEFINITIONS)
    .filter(([, definition]) => definition.tickOnTurnStart)
    .map(([key]) => key);
}

export function getTurnStartSkipConditionDefinitions() {
  return Object.entries(CONDITION_DEFINITIONS)
    .filter(([, definition]) => definition.skipsTurn)
    .map(([key, definition]) => ({ key, label: definition.label }));
}

export function getConditionActionModifiers(conditions = {}, options = {}) {
  const active = key => isConditionActive(conditions, key, options);
  const value = key => Math.ceil(getConditionValueFromMap(conditions, key, options));
  const notes = [];
  const blockers = [];

  const modifiers = {
    meleePenalty: 0,
    throwPenalty: 0,
    castPenalty: 0,
    movementPenalty: 0,
    manipulationPenalty: 0,
    movementBlocked: false,
    manipulationBlocked: false,
    canMeleeAttack: true,
    canThrow: true,
    canCast: true,
    meleeBlockReason: "",
    throwBlockReason: "",
    castBlockReason: "",
    notes,
    activeConditions: getActiveConditionEntries(conditions, options),
  };

  const blockAllActions = (reason) => {
    modifiers.movementBlocked = true;
    modifiers.manipulationBlocked = true;
    modifiers.canMeleeAttack = false;
    modifiers.canThrow = false;
    modifiers.canCast = false;
    blockers.push(reason);
    pushNote(notes, reason);
  };

  if (active("unconscious")) blockAllActions("Персонаж без сознания.");
  if (active("sleeping")) blockAllActions("Персонаж спит.");
  if (active("stunned")) blockAllActions("Персонаж оглушен.");

  if (active("fleeing")) {
    modifiers.canMeleeAttack = false;
    modifiers.canThrow = false;
    modifiers.canCast = false;
    blockers.push("Персонаж в бегстве.");
    pushNote(notes, "Бегство блокирует осознанные боевые действия.");
  }

  if (active("grappled")) {
    modifiers.movementBlocked = true;
    modifiers.canThrow = false;
    modifiers.meleePenalty += 1;
    modifiers.castPenalty += 1;
    modifiers.manipulationPenalty += 2;
    modifiers.throwBlockReason ||= "Персонаж в захвате.";
    pushNote(notes, "Захват блокирует перемещение и метание.");
  }

  if (active("prone")) {
    modifiers.movementPenalty += 2;
    modifiers.meleePenalty += 1;
    modifiers.throwPenalty += 2;
    pushNote(notes, "Поваленное положение мешает движению и атаке.");
  }

  if (active("slowed")) {
    modifiers.movementPenalty += 2;
    modifiers.meleePenalty += 1;
    modifiers.throwPenalty += 1;
    pushNote(notes, "Замедление увеличивает время действий и штрафует атаки.");
  }

  if (active("feared")) {
    modifiers.meleePenalty += 3;
    modifiers.throwPenalty += 3;
    modifiers.castPenalty += 2;
    pushNote(notes, "Страх снижает точность атак и концентрацию.");
  }

  if (active("disarmed")) {
    modifiers.meleePenalty += 2;
    modifiers.throwPenalty += 1;
    modifiers.manipulationPenalty += 2;
    pushNote(notes, "Разоружение мешает атакам оружием и манипуляциям.");
  }

  if (active("broken_limb")) {
    modifiers.meleePenalty += 1;
    modifiers.throwPenalty += 1;
    modifiers.castPenalty += 1;
    modifiers.movementPenalty += 1;
    modifiers.manipulationPenalty += 1;
    pushNote(notes, "Общий перелом дает штрафы до уточнения зоны травмы.");
  }

  if (active("burning")) {
    modifiers.meleePenalty += 1;
    modifiers.throwPenalty += 1;
    modifiers.castPenalty += 1;
    modifiers.manipulationPenalty += 1;
    pushNote(notes, `Горение: ${value("burning")}.`);
  }

  if (active("poison")) {
    const poisonPenalty = Math.max(1, Math.floor(value("poison") / 2));
    modifiers.meleePenalty += poisonPenalty;
    modifiers.throwPenalty += poisonPenalty;
    modifiers.castPenalty += poisonPenalty;
    pushNote(notes, `Яд: ${value("poison")}.`);
  }

  const defaultBlockReason = blockers[0] ?? "";
  modifiers.meleeBlockReason ||= defaultBlockReason;
  modifiers.throwBlockReason ||= defaultBlockReason;
  modifiers.castBlockReason ||= defaultBlockReason;

  return modifiers;
}
