import { buildActorRestProfile } from "./body-trauma-service.mjs";
import {
  getActiveConditionEntries,
  getConditionLabel,
  getConditionValueFromMap,
} from "./condition-policy-service.mjs";

const DANGEROUS_CONDITIONS = new Set(["bleeding", "poison", "burning", "shock"]);
const CONTROL_CONDITIONS = new Set([
  "stunned",
  "unconscious",
  "sleeping",
  "feared",
  "fleeing",
  "grappled",
  "prone",
  "slowed",
]);

function clampNonNegative(value) {
  return Math.max(0, Number(value ?? 0));
}

function formatDelta(next, current, { plus = true } = {}) {
  const delta = Math.round(Number(next ?? 0) - Number(current ?? 0));
  if (delta === 0) return "0";
  if (delta > 0 && plus) return `+${delta}`;
  return `${delta}`;
}

function restChangeRows(profile) {
  if (!profile) return [];

  return [
    {
      key: "energy",
      label: "Энергия",
      value: `${profile.currentEnergy} -> ${profile.nextEnergy}`,
      delta: formatDelta(profile.nextEnergy, profile.currentEnergy),
      cssClass: profile.nextEnergy > profile.currentEnergy ? "is-good" : "is-muted",
    },
    {
      key: "mana",
      label: "Мана",
      value: `${profile.currentMana} -> ${profile.nextMana}`,
      delta: formatDelta(profile.nextMana, profile.currentMana),
      cssClass: profile.nextMana > profile.currentMana ? "is-good" : "is-muted",
    },
    {
      key: "energy-max",
      label: "Макс. энергия",
      value: `${profile.currentEnergyMax} -> ${profile.nextEnergyMax}`,
      delta: formatDelta(profile.nextEnergyMax, profile.currentEnergyMax),
      cssClass: profile.nextEnergyMax > profile.currentEnergyMax ? "is-good" : "is-muted",
    },
    {
      key: "pressure",
      label: "Давление",
      value: `${profile.energyRecoveryPenalty}`,
      delta: profile.energyRecoveryPenalty ? `-${profile.energyRecoveryPenalty}` : "0",
      cssClass: profile.energyRecoveryPenalty > 0 ? "is-warning" : "is-muted",
    },
  ];
}

function blockerLabel(blocker) {
  if (blocker === "bleeding") return "Остановить кровотечение";
  if (blocker === "burning") return "Потушить горение";
  return blocker;
}

function buildRestCard(type, profile) {
  const isFull = type === "full";
  const hasEnergy = Boolean(profile);
  const blockers = (profile?.blockers ?? []).map(blocker => ({
    key: blocker,
    label: blockerLabel(blocker),
  }));
  const blocked = !hasEnergy || Boolean(profile?.blocked);

  return {
    type,
    title: isFull ? "Полный отдых" : "Короткий отдых",
    cssClass: blocked ? "is-blocked" : "is-ready",
    canUse: hasEnergy && !blocked,
    blocked,
    blockedReason: !hasEnergy
      ? "Нет ресурса энергии"
      : blockers.map(blocker => blocker.label).join(", "),
    blockers,
    hasBlockers: blockers.length > 0,
    rows: restChangeRows(profile),
    profile,
  };
}

function buildActiveConditionRows(actor) {
  const conditions = actor?.system?.conditions ?? {};
  return getActiveConditionEntries(conditions).map(entry => {
    const numeric = clampNonNegative(entry.numericValue);
    let cssClass = "is-neutral";
    if (DANGEROUS_CONDITIONS.has(entry.key)) cssClass = "is-danger";
    else if (CONTROL_CONDITIONS.has(entry.key)) cssClass = "is-control";
    else if (entry.category === "buff" || entry.category === "prepared") cssClass = "is-good";

    return {
      ...entry,
      valueLabel: `${entry.value}`,
      numericValue: numeric,
      cssClass,
    };
  });
}

function estimateTraumaDamage(summary) {
  let total = 0;
  for (const part of Object.values(summary?.parts ?? {})) {
    total += Number(part.minorBleeding ?? 0);
    total += Number(part.activeMajorBleeding ?? 0) * 2;
  }
  return total;
}

function buildNextTickPreview(actor, shortProfile) {
  const conditions = actor?.system?.conditions ?? {};
  const bleeding = clampNonNegative(getConditionValueFromMap(conditions, "bleeding"));
  const poison = clampNonNegative(getConditionValueFromMap(conditions, "poison"));
  const burning = clampNonNegative(getConditionValueFromMap(conditions, "burning"));
  const traumaBleed = estimateTraumaDamage(shortProfile?.summary);
  const legacyBleedDamage = traumaBleed > 0 ? 0 : bleeding;
  const totalDamage = traumaBleed + legacyBleedDamage + poison + burning;
  const rows = [];

  if (traumaBleed > 0) rows.push({ key: "trauma", label: "Кровь по зонам", value: `-${traumaBleed} HP`, cssClass: "is-danger" });
  if (legacyBleedDamage > 0) rows.push({ key: "bleeding", label: getConditionLabel("bleeding"), value: `-${legacyBleedDamage} HP`, cssClass: "is-danger" });
  if (poison > 0) rows.push({ key: "poison", label: getConditionLabel("poison"), value: `-${poison} HP`, cssClass: "is-danger" });
  if (burning > 0) rows.push({ key: "burning", label: getConditionLabel("burning"), value: `-${burning} HP`, cssClass: "is-danger" });

  return {
    totalDamage,
    hasDamage: totalDamage > 0,
    rows,
    summaryLabel: totalDamage > 0 ? `-${totalDamage} HP на тике` : "урона от тика нет",
  };
}

function buildRecoveryWarnings(shortProfile, fullProfile, activeRows, tickPreview) {
  const warnings = [];

  if (fullProfile?.blocked) {
    warnings.push({
      key: "full-rest-blocked",
      label: "Полный отдых заблокирован",
      value: fullProfile.blockers.map(blockerLabel).join(", "),
      cssClass: "is-danger",
    });
  }

  if (tickPreview.hasDamage) {
    warnings.push({
      key: "tick-damage",
      label: "Следующий тик",
      value: tickPreview.summaryLabel,
      cssClass: "is-danger",
    });
  }

  if (shortProfile?.abdomenEnergyPenalty > 0) {
    warnings.push({
      key: "abdomen",
      label: "Живот",
      value: `-${shortProfile.abdomenEnergyPenalty} к восстановлению`,
      cssClass: "is-warning",
    });
  }

  const controlCount = activeRows.filter(row => CONTROL_CONDITIONS.has(row.key)).length;
  if (controlCount > 0) {
    warnings.push({
      key: "control",
      label: "Контроль",
      value: `${controlCount} эффект(ов)`,
      cssClass: "is-control",
    });
  }

  return warnings;
}

function resolveRecoveryStatus({ fullProfile, activeRows, tickPreview, warnings }) {
  if (tickPreview.hasDamage) {
    return {
      key: "danger",
      title: "Опасное состояние",
      detail: tickPreview.summaryLabel,
      cssClass: "is-danger",
    };
  }

  if (fullProfile?.blocked) {
    return {
      key: "blocked",
      title: "Нельзя полноценно отдыхать",
      detail: fullProfile.blockers.map(blockerLabel).join(", "),
      cssClass: "is-warning",
    };
  }

  if (warnings.length > 0 || activeRows.length > 0) {
    return {
      key: "recovering",
      title: "Нужно восстановление",
      detail: warnings[0]?.value || `${activeRows.length} эффект(ов)`,
      cssClass: "is-hurt",
    };
  }

  return {
    key: "ready",
    title: "Готов к действиям",
    detail: "критичных эффектов нет",
    cssClass: "is-ready",
  };
}

export function buildActorRecoveryPlan(actor) {
  if (!actor) {
    return {
      visible: false,
      status: { key: "none", title: "Нет актёра", detail: "", cssClass: "is-muted" },
      activeConditions: [],
      hasActiveConditions: false,
      warnings: [],
      hasWarnings: false,
      shortRest: null,
      fullRest: null,
      nextTick: { totalDamage: 0, hasDamage: false, rows: [], summaryLabel: "" },
    };
  }

  const hasEnergy = Boolean(actor.system?.resources?.energy);
  const shortProfile = hasEnergy ? buildActorRestProfile(actor, "short") : null;
  const fullProfile = hasEnergy ? buildActorRestProfile(actor, "full") : null;
  const activeConditions = buildActiveConditionRows(actor);
  const nextTick = buildNextTickPreview(actor, shortProfile);
  const warnings = buildRecoveryWarnings(shortProfile, fullProfile, activeConditions, nextTick);
  const status = resolveRecoveryStatus({ fullProfile, activeRows: activeConditions, tickPreview: nextTick, warnings });

  return {
    visible: true,
    hasEnergy,
    status,
    activeConditions,
    activeConditionPreview: activeConditions.slice(0, 6),
    hasActiveConditions: activeConditions.length > 0,
    activeConditionCount: activeConditions.length,
    warnings,
    warningPreview: warnings.slice(0, 4),
    hasWarnings: warnings.length > 0,
    shortRest: buildRestCard("short", shortProfile),
    fullRest: buildRestCard("full", fullProfile),
    nextTick,
    needsAttention: status.key !== "ready",
  };
}
