import { SKILLS_FLAT } from "../constants/skills.mjs";
import { getItemEffectLabel } from "../utils/item-utils.mjs";
import { getTargetPartLabel } from "./actor-state-service.mjs";
import {
  buildAoeTargetZonePolicy,
  getAoeFriendlyFireLabel,
  getAoeTargetZoneModeLabel,
  normalizeAoeChainDecay,
  normalizeAoeDistance,
  normalizeAoeFriendlyFireMode,
  normalizeAoeMaxTargets,
  normalizeAoeShape,
  normalizeAoeType,
} from "./aoe-policy-service.mjs";
import { getDamageTypeLabel } from "./damage-type-service.mjs";

const SKILL_LABELS = Object.freeze(Object.fromEntries(
  SKILLS_FLAT.map(skill => [skill.key, skill.label])
));

export const AOE_SHAPE_LABELS = Object.freeze({
  circle: "Круг",
  cone: "Конус",
  ray: "Линия",
  rect: "Прямоугольник",
});

export const AOE_SHAPE_ICONS = Object.freeze({
  circle: "⭕",
  cone: "🔺",
  ray: "➡",
  rect: "▰",
});

export const AOE_TYPE_LABELS = Object.freeze({
  blast: "Все в зоне",
  pierce: "Первый на линии",
  sweep: "Сектор",
  shards: "Случайные цели",
  chain: "Цепь",
  nova: "Вокруг кастера",
});

export const AOE_TYPE_ICONS = Object.freeze({
  blast: "💥",
  pierce: "➡",
  sweep: "↔",
  shards: "💎",
  chain: "⛓",
  nova: "🌟",
});

export const AOE_TARGET_POLICY_LABELS = Object.freeze({
  all: "все цели",
  enemies: "только враги",
  allies: "только союзники",
});

export const AOE_RESULT_LABELS = Object.freeze({
  hit: "попадание",
  miss: "промах",
  ally: "союзник",
  enemy: "цель",
});
export const AOE_ZONE_SOURCE_LABELS = Object.freeze({
  aimed: "выбрана",
  fixed: "задана",
  target: "от цели",
  random: "случайно",
});

function cleanKey(value) {
  return String(value ?? "").trim();
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolText(value, yes = "да", no = "нет") {
  return value ? yes : no;
}

function joinParts(parts = [], separator = " · ") {
  return parts
    .map(part => String(part ?? "").trim())
    .filter(Boolean)
    .join(separator);
}

function maybePlus(value) {
  const parsed = num(value, 0);
  return parsed > 0 ? `+${parsed}` : String(parsed);
}

function formatMetric(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";
  return Number.isInteger(parsed) ? String(parsed) : String(Math.round(parsed * 10) / 10);
}

export function getSkillLabel(skillKey = "") {
  const key = cleanKey(skillKey);
  return SKILL_LABELS[key] ?? key ?? "";
}

export function getAoeShapeLabel(shape = "circle", { includeIcon = true } = {}) {
  const key = normalizeAoeShape(shape, "circle");
  const label = AOE_SHAPE_LABELS[key] ?? key;
  if (!includeIcon) return label;
  const icon = AOE_SHAPE_ICONS[key] ?? "";
  return icon ? `${icon} ${label}` : label;
}

export function getAoeTypeLabel(type = "blast", { includeIcon = true } = {}) {
  const key = normalizeAoeType(type, "blast");
  const label = AOE_TYPE_LABELS[key] ?? key;
  if (!includeIcon) return label;
  const icon = AOE_TYPE_ICONS[key] ?? "";
  return icon ? `${icon} ${label}` : label;
}

export function getAoeTargetPolicyLabel(policy = "enemies") {
  const key = cleanKey(policy) || "enemies";
  return AOE_TARGET_POLICY_LABELS[key] ?? key;
}

export function getAoeFriendlyFireModeLabel(mode = "off") {
  return getAoeFriendlyFireLabel(normalizeAoeFriendlyFireMode(mode, "off"));
}

export function getAoeFriendlyFireResolvedLabel(enabled = false) {
  return enabled ? "активен" : "отключён";
}

export function getAoeTargetZoneLabel(zone = null, fallback = "случайная для каждой цели") {
  const key = cleanKey(zone);
  return key ? getTargetPartLabel(key) : fallback;
}

export function getAoeTargetZoneSourceLabel(source = "random", mode = "random") {
  const key = cleanKey(source) || "random";
  if (key === "fixed" && mode === "aimed") return AOE_ZONE_SOURCE_LABELS.aimed;
  return AOE_ZONE_SOURCE_LABELS[key] ?? key;
}

export function getAoeConfigIcon(aoe = {}) {
  const type = normalizeAoeType(aoe?.type ?? aoe?.aoeType, "blast");
  return AOE_TYPE_ICONS[type] ?? "💥";
}

export function formatAoeConfigSummary(aoe = {}, {
  compact = false,
  includeShape = true,
  includeDistance = true,
  includeFriendlyFire = true,
  includeZone = true,
  includeLimits = true,
} = {}) {
  if (!aoe || typeof aoe !== "object") return "";

  const shape = normalizeAoeShape(aoe.shape, "circle");
  const type = normalizeAoeType(aoe.type ?? aoe.aoeType, "blast");
  const distance = normalizeAoeDistance(aoe.distance, 0);
  const maxTargets = normalizeAoeMaxTargets(aoe.maxTargets, null);
  const chainDecay = normalizeAoeChainDecay(aoe.chainDecay, 1);
  const friendlyFireMode = normalizeAoeFriendlyFireMode(aoe.friendlyFireMode ?? aoe.friendlyFire, "off");
  const zonePolicy = buildAoeTargetZonePolicy({
    targetZone: aoe.targetZone ?? aoe.targetPart,
    effect: aoe.effect,
    aoe,
    mode: aoe.targetZoneMode ?? aoe.zoneMode,
  });

  const pieces = [getAoeTypeLabel(type, { includeIcon: true })];
  if (includeShape) pieces.push(getAoeShapeLabel(shape, { includeIcon: false }));
  if (includeDistance && distance > 0) pieces.push(`${distance} кл.`);
  if (includeLimits && maxTargets) pieces.push(`до ${maxTargets} ц.`);
  if (includeLimits && type === "chain" && chainDecay !== 1) pieces.push(`затухание x${chainDecay}`);

  if (includeZone) {
    const zoneLabel = getAoeTargetZoneLabel(zonePolicy.zone);
    pieces.push(compact
      ? (zonePolicy.zone ? `${zoneLabel} (${getAoeTargetZoneModeLabel(zonePolicy.mode)})` : getAoeTargetZoneModeLabel(zonePolicy.mode))
      : `зона: ${zoneLabel} (${getAoeTargetZoneModeLabel(zonePolicy.mode)})`);
  }

  if (includeFriendlyFire) {
    pieces.push(compact
      ? getAoeFriendlyFireModeLabel(friendlyFireMode)
      : `союзники: ${getAoeFriendlyFireModeLabel(friendlyFireMode)}`);
  }

  return joinParts(pieces);
}

export function formatSpellRuntimeSummary(runtime = {}, { includeAoe = true } = {}) {
  if (!runtime || typeof runtime !== "object") return "";

  const pieces = [];
  const damage = num(runtime.damage ?? runtime.power, 0);
  if (runtime.isDamage) {
    pieces.push(`${getDamageTypeLabel(runtime.combatDamageType ?? runtime.damageType, { fallback: "magical" })}: ${damage}`);
  } else if (runtime.effectType) {
    const effectPower = num(runtime.utilityPower ?? runtime.power, 0);
    const effectLabel = getItemEffectLabel(runtime.effectType, { fallback: runtime.effectType });
    pieces.push(effectPower > 0 ? `${effectLabel}: ${maybePlus(effectPower)}` : effectLabel);
  }

  if (includeAoe && runtime.aoe) {
    pieces.push(formatAoeConfigSummary({
      ...runtime.aoe,
      friendlyFire: runtime.friendlyFire,
      friendlyFireMode: runtime.friendlyFireMode,
      targetZone: runtime.targetZone ?? runtime.attackTargetZone ?? runtime.targetPart,
      targetZoneMode: runtime.targetZoneMode,
    }, { compact: true }));
  }

  return joinParts(pieces);
}

function buildAoeStatPills(summary = {}) {
  return [
    { label: "Целей", value: summary.selectedTargets ?? summary.resultCount ?? 0, className: "is-targets" },
    { label: "Попаданий", value: summary.hitCount ?? 0, className: "is-hit" },
    { label: "Промахов", value: summary.missCount ?? 0, className: "is-miss" },
    { label: "Урон", value: summary.damageTotal ?? 0, className: "is-damage", visible: num(summary.damageTotal, 0) > 0 },
    { label: "Лечение", value: `+${summary.healingTotal ?? 0}`, className: "is-healing", visible: num(summary.healingTotal, 0) > 0 },
    { label: "Убито", value: summary.killCount ?? 0, className: "is-kill", visible: num(summary.killCount, 0) > 0 },
    { label: "Сост.", value: summary.conditionCount ?? 0, className: "is-effect", visible: num(summary.conditionCount, 0) > 0 },
    {
      label: "Союзники",
      value: `${summary.alliesHit ?? 0}/${summary.alliesSpared ?? 0}`,
      className: num(summary.alliesHit, 0) > 0 ? "is-danger" : "is-spared",
      visible: num(summary.alliesHit, 0) > 0 || num(summary.alliesSpared, 0) > 0,
    },
  ].filter(row => row.visible !== false);
}

function buildAoeMetaRows({
  summary = {},
  aoeConfig = {},
  zonePolicy = null,
  damageType = "",
  baseDamage = 0,
  isUtility = false,
} = {}) {
  const resolvedZonePolicy = zonePolicy ?? buildAoeTargetZonePolicy({
    targetZone: aoeConfig?.targetZone ?? aoeConfig?.targetPart,
    aoe: aoeConfig,
    mode: aoeConfig?.targetZoneMode,
  });
  const friendlyFireMode = normalizeAoeFriendlyFireMode(summary.friendlyFireMode ?? aoeConfig?.friendlyFireMode, "off");
  const policy = summary.targetPolicy ?? "enemies";

  return [
    { label: "Тип", value: getAoeTypeLabel(summary.aoeType ?? aoeConfig?.type, { includeIcon: true }) },
    { label: "Форма", value: getAoeShapeLabel(aoeConfig?.shape, { includeIcon: true }), visible: Boolean(aoeConfig?.shape) },
    { label: "База", value: baseDamage, visible: !isUtility && num(baseDamage, 0) > 0 },
    { label: "Урон", value: getDamageTypeLabel(damageType, { fallback: "magical" }), visible: !isUtility && Boolean(damageType) },
    { label: "Политика целей", value: getAoeTargetPolicyLabel(policy) },
    {
      label: "Союзники",
      value: `${getAoeFriendlyFireModeLabel(friendlyFireMode)} (${getAoeFriendlyFireResolvedLabel(summary.friendlyFire)})`,
    },
    {
      label: "Зоны",
      value: `${summary.targetZoneLabel || getAoeTargetZoneLabel(resolvedZonePolicy.zone)} (${getAoeTargetZoneModeLabel(resolvedZonePolicy.mode)})`,
    },
    { label: "Кандидатов", value: summary.candidates ?? 0 },
    {
      label: "Отбор",
      value: `${summary.selectedTargets ?? summary.resultCount ?? 0}/${summary.totalTargets ?? summary.candidates ?? 0}`,
      visible: num(summary.totalTargets, 0) > 0,
    },
  ].filter(row => row.visible !== false);
}

function buildAoeNoticeRows(summary = {}) {
  return [
    {
      className: "is-spared",
      text: `Союзников не задето: ${summary.alliesSpared}`,
      visible: num(summary.alliesSpared, 0) > 0,
    },
    {
      className: "is-danger",
      text: `Союзников задело: ${summary.alliesHit}`,
      visible: num(summary.alliesHit, 0) > 0,
    },
    {
      className: "is-danger",
      text: `Friendly fire risk: ${summary.allyCount}`,
      visible: Boolean(summary.friendlyFireRisk) && num(summary.alliesHit, 0) <= 0,
    },
    {
      className: "is-lethal",
      text: `Целей выведено из боя: ${summary.killCount}`,
      visible: num(summary.killCount, 0) > 0,
    },
    {
      className: "is-muted",
      text: "Целей не найдено",
      visible: num(summary.selectedTargets ?? summary.resultCount, 0) <= 0,
    },
  ].filter(row => row.visible !== false);
}

function buildAoeResultBadges(result = {}, {
  hit = true,
  ally = false,
  sideLabel = "",
  statusLabel = "",
} = {}) {
  const badges = [
    { text: sideLabel, className: ally ? "is-ally" : "is-enemy" },
    { text: statusLabel, className: hit ? "is-hit" : "is-miss" },
  ];

  if (ally && result.friendlyFire) {
    badges.push({ text: "friendly fire", className: "is-danger" });
  }

  if (result.targetKilled) {
    badges.push({ text: "lethal", className: "is-kill" });
  }

  if (result.condition) {
    badges.push({ text: "effect", className: "is-effect" });
  }

  if (result.targetPolicy) {
    badges.push({
      text: getAoeTargetPolicyLabel(result.targetPolicy),
      className: "is-policy",
    });
  }

  return badges;
}

function buildAoeResultMetricText(result = {}) {
  const metrics = result.metrics ?? {};
  return joinParts([
    formatMetric(metrics.distanceFromOrigin) ? `дист. ${formatMetric(metrics.distanceFromOrigin)}` : "",
    formatMetric(metrics.projectionFromOrigin) ? `линия ${formatMetric(metrics.projectionFromOrigin)}` : "",
    formatMetric(metrics.sideFromOrigin) ? `смещ. ${formatMetric(metrics.sideFromOrigin)}` : "",
  ], ", ");
}

function buildAoeResultDetailRows(result = {}, {
  hasRoll = false,
  zone = "",
  armor = 0,
} = {}) {
  const zoneMode = result.zoneMode ?? result.targetZoneMode ?? "";
  const zoneSource = result.zoneSource ?? "random";
  const zoneText = zone
    ? joinParts([
        zone,
        zoneMode ? getAoeTargetZoneModeLabel(zoneMode) : "",
        getAoeTargetZoneSourceLabel(zoneSource, zoneMode),
      ], " · ")
    : "";
  const metricText = buildAoeResultMetricText(result);
  const effectLines = Array.isArray(result.effectLines)
    ? result.effectLines.map(line => cleanKey(line)).filter(Boolean)
    : [];

  return [
    {
      label: "Бросок",
      value: `${result.roll}/${result.threshold}`,
      visible: hasRoll,
    },
    {
      label: "Зона",
      value: zoneText,
      visible: Boolean(zoneText),
    },
    {
      label: "Броня",
      value: `-${armor}`,
      visible: armor > 0,
    },
    {
      label: "Friendly fire",
      value: getAoeFriendlyFireModeLabel(result.friendlyFireMode),
      visible: Boolean(result.friendlyFireMode),
    },
    {
      label: "Позиция",
      value: metricText,
      visible: Boolean(metricText),
    },
    {
      label: "Эффекты",
      value: joinParts(effectLines),
      visible: effectLines.length > 0,
    },
    {
      label: "Финал",
      value: "цель погибает",
      visible: Boolean(result.targetKilled),
    },
  ].filter(row => row.visible !== false);
}

export function buildAoeResultView(result = {}, { isUtility = false } = {}) {
  const hit = result.hit !== false;
  const ally = Boolean(result.ally);
  const damage = num(result.damage ?? result.finalDamage, 0);
  const healed = num(result.healed, 0);
  const amount = num(result.amount, 0);
  const hasRoll = result.roll !== undefined && result.threshold !== undefined;
  const zone = result.zone ?? getAoeTargetZoneLabel(result.zoneKey, "");
  const armor = num(result.armor, 0);
  const statusLabel = hit ? AOE_RESULT_LABELS.hit : AOE_RESULT_LABELS.miss;
  const sideLabel = ally ? AOE_RESULT_LABELS.ally : AOE_RESULT_LABELS.enemy;

  let outcome = statusLabel;
  if (hit && isUtility && result.line) outcome = result.line;
  else if (hit && result.targetKilled && damage > 0) outcome = `${damage} урона · цель падает`;
  else if (hit && healed > 0) outcome = `+${healed} HP`;
  else if (hit && damage > 0) outcome = `${damage} урона`;
  else if (hit && amount > 0) outcome = `эффект ${amount}`;
  else if (hit && result.condition) outcome = result.condition;

  const detailRows = buildAoeResultDetailRows(result, { hasRoll, zone, armor });

  return {
    ...result,
    hit,
    ally,
    statusIcon: hit ? "✓" : "×",
    statusLabel,
    sideLabel,
    name: result.name ?? "—",
    outcome,
    badges: buildAoeResultBadges(result, { hit, ally, sideLabel, statusLabel }),
    detailRows,
    metaText: joinParts(detailRows.map(row => `${row.label}: ${row.value}`)),
    className: joinParts([
      hit ? "is-hit" : "is-miss",
      ally ? "is-ally" : "is-enemy",
      ally && result.friendlyFire ? "is-friendly-fire" : "",
      result.targetKilled ? "is-kill" : "",
      result.condition ? "is-effect" : "",
    ], " "),
  };
}

export function buildAoeChatData({
  label = "AoE",
  icon = "",
  results = [],
  summary = {},
  aoeConfig = {},
  zonePolicy = null,
  damageType = "",
  baseDamage = 0,
  isUtility = false,
} = {}) {
  const resolvedSummary = {
    selectedTargets: results.length,
    resultCount: results.length,
    hitCount: results.filter(result => result.hit !== false).length,
    missCount: results.filter(result => result.hit === false).length,
    candidates: results.length,
    damageTotal: results.reduce((sum, result) => sum + num(result.damage ?? result.finalDamage, 0), 0),
    healingTotal: results.reduce((sum, result) => sum + num(result.healed, 0), 0),
    alliesHit: results.filter(result => result.ally && result.hit !== false).length,
    alliesSpared: 0,
    enemyCount: results.filter(result => !result.ally).length,
    allyCount: results.filter(result => result.ally).length,
    enemiesHit: results.filter(result => !result.ally && result.hit !== false).length,
    killCount: results.filter(result => result.targetKilled).length,
    conditionCount: results.filter(result => result.condition).length,
    friendlyFire: false,
    friendlyFireMode: "off",
    friendlyFireRisk: results.some(result => result.ally),
    friendlyFireHit: results.some(result => result.ally && result.hit !== false),
    targetPolicy: "enemies",
    aoeType: aoeConfig?.type ?? "blast",
    resultClass: "",
    ...summary,
  };
  const resolvedAoeConfig = aoeConfig && typeof aoeConfig === "object" ? aoeConfig : {};
  const resolvedIcon = icon || getAoeConfigIcon({ type: resolvedSummary.aoeType ?? resolvedAoeConfig.type });

  return {
    label,
    icon: resolvedIcon,
    cardClass: joinParts([
      isUtility ? "is-utility" : "is-damage",
      resolvedSummary.resultClass,
      resolvedSummary.friendlyFireHit ? "has-friendly-fire-hit" : "",
      resolvedSummary.friendlyFireRisk ? "has-friendly-fire-risk" : "",
    ], " "),
    statPills: buildAoeStatPills(resolvedSummary),
    metaRows: buildAoeMetaRows({
      summary: resolvedSummary,
      aoeConfig: resolvedAoeConfig,
      zonePolicy,
      damageType,
      baseDamage,
      isUtility,
    }),
    noticeRows: buildAoeNoticeRows(resolvedSummary),
    results: results.map(result => buildAoeResultView(result, { isUtility })),
    summary: resolvedSummary,
    hasResults: results.length > 0,
    friendlyFireActive: boolText(resolvedSummary.friendlyFire, "активен", "отключён"),
  };
}
