import { SPELLS, SPELL_SCHOOLS, normalizeSpellSchoolKey } from "../constants/spells-catalog.mjs";
import { getTargetPartLabel } from "./actor-state-service.mjs";
import {
  AOE_FRIENDLY_FIRE_MODE_KEYS,
  AOE_SHAPE_KEYS,
  AOE_TARGETABLE_BODY_ZONE_KEYS,
  AOE_TARGET_ZONE_MODE_KEYS,
  AOE_TYPE_KEYS,
  BODY_ZONE_KEYS,
  normalizeAoeConfig,
  normalizeAoeTargetZone,
  normalizeAoeTargetZoneMode,
  resolveAoeFriendlyFireMode,
  resolveAoeTargetZone,
} from "./aoe-policy-service.mjs";
import {
  isSupportedDamageType,
  normalizeDamageType,
} from "./damage-type-service.mjs";

export const SPELL_SCHOOL_IMAGES = Object.freeze({
  fire: "icons/magic/fire/flame-burning-campfire-orange.webp",
  ice: "icons/magic/water/ice-block-frozen-mountain.webp",
  lightning: "icons/magic/lightning/bolt-strike-blue.webp",
  shadow: "icons/magic/unholy/orb-glowing-green.webp",
  light: "icons/magic/holy/projectile-orb-yellow.webp",
  earth: "icons/magic/earth/projectile-boulder-brown.webp",
  mind: "icons/magic/symbols/rune-sigil-purple-pink.webp",
  summon: "icons/magic/life/cross-worn-green.webp",
  default: "icons/magic/symbols/rune-sigil-purple-pink.webp",
});

const SUPPORT_SPECIALS = new Set([
  "heal",
  "buff",
  "summon",
  "restoreEnergy",
  "restoreMana",
  "curePoison",
  "cureDisease",
  "stimulant",
]);
const HOSTILE_SPECIALS = new Set([
  "banish",
  "debuff",
  "stun",
  "disarm",
  "silence",
  "slow",
  "fear",
  "reserveDrain",
]);
const SELF_TARGET_SPECIALS = new Set([
  "buff",
  "summon",
  "restoreEnergy",
  "restoreMana",
  "curePoison",
  "cureDisease",
  "stimulant",
]);

function clonePlain(value) {
  if (value === undefined) return undefined;
  if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value ?? null));
}

function firstDefined(...values) {
  return values.find(value => value !== undefined && value !== null && value !== "");
}

function cleanString(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asSpellSystemSource(spellLike = null) {
  if (!spellLike || typeof spellLike !== "object") return {};
  return spellLike.system && typeof spellLike.system === "object"
    ? spellLike.system
    : spellLike;
}

function getInputName(spellLike = null) {
  if (!spellLike || typeof spellLike !== "object") return "";
  return cleanString(spellLike.name ?? spellLike.label);
}

function resolveSpellId(spellLike = null) {
  const source = asSpellSystemSource(spellLike);
  return cleanString(source.spellId ?? source.id ?? spellLike?.spellId ?? spellLike?.id);
}

function resolveCatalogSpell(spellLike = null, catalog = SPELLS) {
  const spellId = resolveSpellId(spellLike);
  return spellId ? (catalog?.[spellId] ?? null) : null;
}

function cloneObjectOrNull(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? clonePlain(value)
    : null;
}

function getMergedSpellSource(spellLike = null, catalog = SPELLS) {
  const system = asSpellSystemSource(spellLike);
  const catalogSpell = resolveCatalogSpell(spellLike, catalog);
  return {
    catalogSpell,
    source: {
      ...(catalogSpell ?? {}),
      ...(system ?? {}),
    },
  };
}

export function normalizeSpellDamageAffinity(value) {
  return normalizeDamageType(value, { fallback: "magical" });
}

export function getSpellCombatDamageType(value) {
  return normalizeDamageType(value, { fallback: "magical" });
}

export function getSpellSpecial(effect = null) {
  return cleanString(effect?.special);
}

export function inferSpellEffectType({ damage = 0, effect = null, effectType = "" } = {}) {
  const explicit = cleanString(effectType);
  if (explicit) return explicit;
  if (cleanNumber(damage, 0) > 0) return "damage";
  return getSpellSpecial(effect);
}

export function buildSpellRuntimeData(spellLike = null, {
  catalog = SPELLS,
} = {}) {
  const { catalogSpell, source } = getMergedSpellSource(spellLike, catalog);
  const inputName = getInputName(spellLike);
  const spellId = cleanString(source.spellId ?? source.id ?? resolveSpellId(spellLike));
  const label = inputName || cleanString(source.label ?? source.name, spellId || "Spell");
  const effect = cloneObjectOrNull(firstDefined(source.effect, catalogSpell?.effect));
  const rawAoe = cloneObjectOrNull(firstDefined(source.aoe, catalogSpell?.aoe));

  const itemDamage = cleanNumber(source.damage, 0);
  const catalogDamage = cleanNumber(catalogSpell?.damage, 0);
  const damage = itemDamage > 0 ? itemDamage : catalogDamage;
  const special = getSpellSpecial(effect);
  const effectType = inferSpellEffectType({
    damage,
    effect,
    effectType: source.effectType,
  });
  const damageAffinity = normalizeSpellDamageAffinity(firstDefined(
    source.damageType,
    catalogSpell?.damageType,
    damage > 0 ? "magical" : "none",
  ));
  const combatDamageType = getSpellCombatDamageType(damageAffinity);
  const hasAoe = Boolean(rawAoe && cleanNumber(rawAoe.distance, 0) > 0);
  const rawTargetZone = resolveAoeTargetZone(
    source.targetZone,
    source.targetPart,
    catalogSpell?.targetZone,
    catalogSpell?.targetPart,
    effect?.targetZone,
    effect?.targetPart,
    rawAoe?.targetZone,
    rawAoe?.targetPart,
  );
  const friendlyFireMode = resolveAoeFriendlyFireMode(
    rawAoe?.friendlyFireMode,
    source.friendlyFireMode,
    rawAoe?.friendlyFire,
    source.friendlyFire,
    hasAoe ? "auto" : "off",
  );
  const aoe = hasAoe
    ? normalizeAoeConfig(rawAoe, {
        damageType: damage > 0 ? damageAffinity : (special === "heal" ? "healing" : damageAffinity),
        effect,
        friendlyFireMode,
        targetZone: rawTargetZone,
        targetZoneMode: rawAoe?.targetZoneMode ?? source.targetZoneMode,
      })
    : null;

  const targetZone = aoe?.targetZone ?? rawTargetZone ?? null;
  const targetZoneMode = aoe?.targetZoneMode ?? (targetZone ? "fixed" : "random");
  const isDamage = damage > 0 || effectType === "damage";
  const isSupport = SUPPORT_SPECIALS.has(effectType) || SUPPORT_SPECIALS.has(special);
  const isHostile = Boolean(
    isDamage
    || HOSTILE_SPECIALS.has(effectType)
    || HOSTILE_SPECIALS.has(special)
    || (!isSupport && effect?.applyCondition)
  );
  const defaultTargetSelf = Boolean(
    SELF_TARGET_SPECIALS.has(effectType)
    || SELF_TARGET_SPECIALS.has(special)
    || source.targetActorMode === "self"
    || source.targetActorMode === "selected-or-self"
  );
  const canChooseTargetZone = Boolean(
    isDamage
    || special === "heal"
    || targetZoneMode === "aimed"
    || source.canChooseTargetZone
  );
  const powerFromItem = cleanNumber(source.power, 0);
  const healPower = cleanNumber(effect?.healAmount, 0);
  const power = powerFromItem > 0
    ? powerFromItem
    : isDamage
      ? damage
      : healPower;

  return {
    id: spellId,
    spellId,
    label,
    catalogSpell,
    school: normalizeSpellSchoolKey(source.school ?? catalogSpell?.school, {
      fallback: cleanString(source.school ?? catalogSpell?.school),
    }),
    rank: Math.max(1, cleanNumber(source.rank ?? source.tier ?? catalogSpell?.rank ?? catalogSpell?.tier, 1)),
    tier: Math.max(1, cleanNumber(source.tier ?? source.rank ?? catalogSpell?.tier ?? catalogSpell?.rank, 1)),
    manaCost: Math.max(0, cleanNumber(source.manaCost ?? catalogSpell?.manaCost, 0)),
    energyCost: Math.max(0, cleanNumber(source.energyCost ?? catalogSpell?.energyCost, 0)),
    castTime: Math.max(0, cleanNumber(source.castTime ?? source.actionSeconds ?? catalogSpell?.castTime, 0)),
    actionSeconds: Math.max(0, cleanNumber(source.actionSeconds ?? source.castTime ?? catalogSpell?.castTime, 0)),
    damage,
    damageType: combatDamageType,
    combatDamageType,
    damageAffinity,
    rawDamageType: cleanString(source.damageType ?? catalogSpell?.damageType, damageAffinity),
    effectType,
    special,
    effect,
    power,
    utilityPower: power,
    aoe,
    hasAoe,
    isAoe: hasAoe,
    isDamage,
    isUtility: !isDamage,
    isSupport,
    isHostile,
    defaultTargetSelf,
    requiresTarget: !hasAoe && !defaultTargetSelf,
    targetZone,
    targetPart: targetZone ?? normalizeAoeTargetZone(source.targetPart) ?? "torso",
    attackTargetZone: isDamage ? targetZone : null,
    targetZoneMode,
    canChooseTargetZone,
    friendlyFireMode: aoe?.friendlyFireMode ?? friendlyFireMode,
    friendlyFire: Boolean(aoe?.friendlyFire ?? false),
    applicationScope: hasAoe ? "area" : "targeted",
    targetActorMode: hasAoe ? "area" : (defaultTargetSelf ? "selected-or-self" : "selected-only"),
    desc: cleanString(source.desc ?? catalogSpell?.desc),
    value: cleanNumber(source.value, Math.max(1, Math.round(Math.max(1, cleanNumber(source.rank ?? source.tier, 1)) * 50))),
    weight: Math.max(0, cleanNumber(source.weight, 0)),
    quantity: Math.max(1, cleanNumber(source.quantity, 1)),
    gridW: Math.max(1, cleanNumber(source.gridW, 1)),
    gridH: Math.max(1, cleanNumber(source.gridH, 1)),
  };
}

export function buildSpellItemSystemData(spellLike = null, {
  quantity = 1,
  catalog = SPELLS,
} = {}) {
  const runtime = buildSpellRuntimeData(spellLike, { catalog });
  return {
    tier: runtime.tier,
    spellId: runtime.spellId,
    school: runtime.school,
    rank: runtime.rank,
    manaCost: runtime.manaCost,
    energyCost: runtime.energyCost,
    castTime: runtime.castTime,
    actionSeconds: runtime.actionSeconds,
    damage: runtime.damage,
    damageType: runtime.rawDamageType || runtime.damageAffinity,
    damageAffinity: runtime.damageAffinity,
    combatDamageType: runtime.combatDamageType,
    power: runtime.power,
    effectType: runtime.effectType,
    effect: runtime.effect,
    actionType: "",
    applicationScope: runtime.applicationScope,
    targetActorMode: runtime.targetActorMode,
    targetPart: runtime.targetPart,
    targetZone: runtime.targetZone ?? "",
    targetZoneMode: runtime.targetZoneMode,
    friendlyFire: runtime.friendlyFire,
    friendlyFireMode: runtime.friendlyFireMode,
    aoe: runtime.aoe,
    desc: runtime.desc,
    value: runtime.value,
    weight: runtime.weight,
    quantity: Math.max(1, cleanNumber(quantity, runtime.quantity)),
    gridW: runtime.gridW,
    gridH: runtime.gridH,
  };
}

export function getSpellTargetZoneOptions(selectedKey = "", {
  includeRandom = true,
  randomLabel = "Случайная зона",
} = {}) {
  const selectedZone = normalizeAoeTargetZone(selectedKey) ?? "";
  const zones = [
    ...(includeRandom ? [""] : []),
    ...AOE_TARGETABLE_BODY_ZONE_KEYS,
  ];
  return zones.map(key => ({
    key,
    label: key ? getTargetPartLabel(key) : randomLabel,
    selected: key === selectedZone,
  }));
}

export function buildSpellChoicePayload(spell = {}, {
  targetZone = undefined,
  targetZoneMode = undefined,
  friendlyFire = undefined,
  friendlyFireMode = undefined,
} = {}) {
  const chosen = clonePlain(spell ?? {});

  if (targetZone !== undefined || targetZoneMode !== undefined) {
    const currentZone = resolveAoeTargetZone(
      chosen.targetZone,
      chosen.targetPart,
      chosen.effect?.targetZone,
      chosen.effect?.targetPart,
      chosen.aoe?.targetZone,
      chosen.aoe?.targetPart,
    );
    const zone = targetZone !== undefined
      ? normalizeAoeTargetZone(targetZone)
      : currentZone;
    const currentMode = chosen.aoe?.targetZoneMode ?? chosen.effect?.targetZoneMode ?? chosen.targetZoneMode;
    let zoneMode = normalizeAoeTargetZoneMode(
      targetZoneMode ?? currentMode,
      zone ? "fixed" : "random",
    );
    if (zone && zoneMode === "random") zoneMode = "fixed";
    if (!zone && zoneMode === "fixed") zoneMode = "random";

    if (zone) {
      chosen.targetZone = zone;
      chosen.targetPart = zone;
      chosen.targetZoneMode = zoneMode;
      if (chosen.effect && typeof chosen.effect === "object") {
        chosen.effect = {
          ...chosen.effect,
          targetZone: zone,
          targetPart: zone,
          targetZoneMode: zoneMode,
        };
      }
      if (chosen.aoe && typeof chosen.aoe === "object") {
        chosen.aoe = {
          ...chosen.aoe,
          targetZone: zone,
          targetPart: zone,
          targetZoneMode: zoneMode,
        };
      }
    } else {
      delete chosen.targetZone;
      delete chosen.targetPart;
      chosen.targetZoneMode = zoneMode;
      if (chosen.effect && typeof chosen.effect === "object") {
        chosen.effect = { ...chosen.effect, targetZoneMode: zoneMode };
        delete chosen.effect.targetZone;
        delete chosen.effect.targetPart;
      }
      if (chosen.aoe && typeof chosen.aoe === "object") {
        chosen.aoe = { ...chosen.aoe, targetZoneMode: zoneMode };
        delete chosen.aoe.targetZone;
        delete chosen.aoe.targetPart;
      }
    }
  }

  if (friendlyFireMode !== undefined || friendlyFire !== undefined) {
    const mode = resolveAoeFriendlyFireMode(friendlyFireMode, friendlyFire, "off");
    const enabled = friendlyFire !== undefined ? Boolean(friendlyFire) : mode === "on";
    chosen.friendlyFire = enabled;
    chosen.friendlyFireMode = mode;
    if (chosen.aoe && typeof chosen.aoe === "object") {
      chosen.aoe = {
        ...chosen.aoe,
        friendlyFire: enabled,
        friendlyFireMode: mode,
      };
    }
  }

  return chosen;
}

function runtimeFinding(severity, code, message, context = {}, details = {}) {
  return {
    severity,
    code,
    message,
    path: [context.scope, context.item, context.spellId].filter(Boolean).join(" / "),
    context: { ...context },
    details,
  };
}

export function validateSpellRuntimeData(spellLike = null, {
  catalog = SPELLS,
  context = {},
} = {}) {
  const runtime = buildSpellRuntimeData(spellLike, { catalog });
  const findings = [];
  const ctx = {
    scope: "spell-runtime",
    spellId: runtime.spellId,
    item: runtime.label,
    ...context,
  };
  const validSchools = new Set(Object.keys(SPELL_SCHOOLS ?? {}));
  const validShapes = new Set(AOE_SHAPE_KEYS);
  const validTypes = new Set(AOE_TYPE_KEYS);
  const validZoneModes = new Set(AOE_TARGET_ZONE_MODE_KEYS);
  const validFriendlyFireModes = new Set(AOE_FRIENDLY_FIRE_MODE_KEYS);
  const validZones = new Set(BODY_ZONE_KEYS);

  if (!runtime.spellId) findings.push(runtimeFinding("warn", "missing-spell-id", "Spell runtime data has no spellId.", ctx));
  if (!runtime.school) findings.push(runtimeFinding("error", "missing-school", "Spell runtime data has no school.", ctx));
  if (runtime.school && !validSchools.has(runtime.school)) {
    findings.push(runtimeFinding("warn", "unknown-school", "Spell school is not registered.", ctx, { school: runtime.school }));
  }
  if (runtime.isDamage && runtime.damage <= 0) {
    findings.push(runtimeFinding("error", "damage-effect-without-damage", "Damage spell resolved without positive damage.", ctx, { effectType: runtime.effectType }));
  }
  if (!runtime.isDamage && runtime.effectType === "damage") {
    findings.push(runtimeFinding("error", "non-damage-runtime-marked-damage", "Spell effectType is damage but runtime has no damage.", ctx));
  }
  if (runtime.hasAoe) {
    if (!validShapes.has(runtime.aoe.shape)) findings.push(runtimeFinding("error", "bad-aoe-shape", "Spell AoE shape is unsupported.", ctx, { shape: runtime.aoe.shape }));
    if (!validTypes.has(runtime.aoe.type)) findings.push(runtimeFinding("error", "bad-aoe-type", "Spell AoE type is unsupported.", ctx, { type: runtime.aoe.type }));
    if (!validZoneModes.has(runtime.aoe.targetZoneMode)) findings.push(runtimeFinding("error", "bad-zone-mode", "Spell target zone mode is unsupported.", ctx, { targetZoneMode: runtime.aoe.targetZoneMode }));
    if (!validFriendlyFireModes.has(runtime.aoe.friendlyFireMode)) findings.push(runtimeFinding("error", "bad-friendly-fire-mode", "Spell friendly-fire mode is unsupported.", ctx, { friendlyFireMode: runtime.aoe.friendlyFireMode }));
    if (runtime.aoe.targetZone && !validZones.has(runtime.aoe.targetZone)) findings.push(runtimeFinding("error", "bad-target-zone", "Spell target zone is unsupported.", ctx, { targetZone: runtime.aoe.targetZone }));
  }
  if (runtime.targetZoneMode === "fixed" && !runtime.targetZone) {
    findings.push(runtimeFinding("warn", "fixed-zone-without-zone", "Spell uses fixed targetZoneMode without a targetZone.", ctx));
  }
  if (runtime.special === "summon" && cleanNumber(runtime.effect?.duration, 0) <= 0) {
    findings.push(runtimeFinding("error", "summon-without-duration", "Summon spell must declare positive duration.", ctx));
  }
  if (runtime.special === "heal" && runtime.power <= 0) {
    findings.push(runtimeFinding("warn", "heal-without-power", "Healing spell resolved without positive power.", ctx));
  }
  if (runtime.damageAffinity === "none" && runtime.isDamage) {
    findings.push(runtimeFinding("warn", "damage-with-none-affinity", "Damage spell uses none damage type.", ctx));
  }
  if (runtime.rawDamageType && !isSupportedDamageType(runtime.rawDamageType)) {
    findings.push(runtimeFinding("warn", "unsupported-damage-type", "Spell damageType is not supported by the combat damage policy.", ctx, {
      damageType: runtime.rawDamageType,
      normalized: runtime.damageAffinity,
    }));
  }

  return findings;
}

export function validateSpellCatalogRuntime(spells = SPELLS) {
  const entries = Object.entries(spells ?? {});
  const findings = [];
  const runtimes = [];

  for (const [key, spell] of entries) {
    const runtime = buildSpellRuntimeData(spell);
    runtimes.push(runtime);
    findings.push(...validateSpellRuntimeData(spell, {
      context: { scope: "spell-catalog", spellId: key, item: spell?.label ?? key },
    }));
  }

  return {
    ok: findings.every(f => f.severity !== "error"),
    summary: {
      total: entries.length,
      damage: runtimes.filter(runtime => runtime.isDamage).length,
      utility: runtimes.filter(runtime => !runtime.isDamage).length,
      aoe: runtimes.filter(runtime => runtime.hasAoe).length,
      hostile: runtimes.filter(runtime => runtime.isHostile).length,
      support: runtimes.filter(runtime => runtime.isSupport).length,
      defaultSelf: runtimes.filter(runtime => runtime.defaultTargetSelf).length,
      aimed: runtimes.filter(runtime => runtime.targetZoneMode === "aimed").length,
      fixed: runtimes.filter(runtime => runtime.targetZoneMode === "fixed").length,
    },
    runtimes,
    findings,
  };
}
