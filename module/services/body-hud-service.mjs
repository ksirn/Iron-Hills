import {
  BODY_TRAUMA_PART_KEYS,
  buildActorMedicalTriage,
  getActorBodyTraumaSummary,
  getBodyPartTraumaStatus,
  getBodyTraumaPartLabel,
} from "./body-trauma-service.mjs";

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampPct(value) {
  return Math.max(0, Math.min(100, Math.round(asNumber(value, 0))));
}

function ratioPct(value, max) {
  const safeMax = Math.max(1, asNumber(max, 1));
  return clampPct((asNumber(value, 0) / safeMax) * 100);
}

function healthClass(value, max, trauma = {}) {
  if (trauma.destroyed || asNumber(value, 0) <= 0) return "is-dead";
  const ratio = Math.max(0, Math.min(1, asNumber(value, 0) / Math.max(1, asNumber(max, 1))));
  if (ratio <= 0.25) return "is-critical";
  if (ratio <= 0.5) return "is-bad";
  if (ratio <= 0.75) return "is-warn";
  return "is-good";
}

function shortPartLabel(partKey) {
  if (partKey === "leftArm") return "L Arm";
  if (partKey === "rightArm") return "R Arm";
  if (partKey === "leftLeg") return "L Leg";
  if (partKey === "rightLeg") return "R Leg";
  if (partKey === "abdomen") return "Abd";
  return getBodyTraumaPartLabel(partKey);
}

function miniPartLabel(partKey) {
  return {
    head: "Г",
    torso: "Т",
    abdomen: "Ж",
    leftArm: "ЛР",
    rightArm: "ПР",
    leftLeg: "ЛН",
    rightLeg: "ПН",
  }[partKey] ?? shortPartLabel(partKey);
}

function sheetFigureClass(partKey) {
  return {
    head: "ih-cs-fig-head",
    torso: "ih-cs-fig-torso",
    abdomen: "ih-cs-fig-abdomen",
    leftArm: "ih-cs-fig-arm",
    rightArm: "ih-cs-fig-arm",
    leftLeg: "ih-cs-fig-leg",
    rightLeg: "ih-cs-fig-leg",
  }[partKey] ?? "ih-cs-fig-part";
}

function traumaDots(part) {
  const dots = [];

  if (part.destroyed) {
    dots.push({ key: "destroyed", cssClass: "dot-destroyed", label: "\u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043d\u043e", valueLabel: "" });
  }
  if (part.activeMajorBleeding > 0) {
    dots.push({ key: "major-bleeding", cssClass: "dot-major", label: "\u0441\u0438\u043b\u044c\u043d\u0430\u044f \u043a\u0440\u043e\u0432\u044c", valueLabel: `${part.activeMajorBleeding}` });
  }
  if (part.minorBleeding > 0) {
    dots.push({ key: "minor-bleeding", cssClass: "dot-minor", label: "\u043a\u0440\u043e\u0432\u044c", valueLabel: `${part.minorBleeding}` });
  }
  if (part.fracture) {
    dots.push({ key: "fracture", cssClass: "dot-fracture", label: "\u043f\u0435\u0440\u0435\u043b\u043e\u043c", valueLabel: "" });
  }
  if (part.suppressedMajorBleeding > 0 || part.tourniquet) {
    dots.push({ key: "tourniquet", cssClass: "dot-tourniquet", label: "\u0436\u0433\u0443\u0442", valueLabel: part.suppressedMajorBleeding ? `${part.suppressedMajorBleeding}` : "" });
  }
  if (part.fractureSuppressed || part.splinted) {
    dots.push({ key: "splinted", cssClass: "dot-splinted", label: "\u0448\u0438\u043d\u0430", valueLabel: "" });
  }

  return dots.slice(0, 5);
}

function buildSheetTrauma(part) {
  return {
    ...part,
    majorBleedingSuppressed: part.suppressedMajorBleeding > 0,
    majorBleedingTitle: part.suppressedMajorBleeding > 0
      ? `\u0441\u0438\u043b\u044c\u043d\u0430\u044f \u043a\u0440\u043e\u0432\u044c \u043f\u0435\u0440\u0435\u0436\u0430\u0442\u0430: ${part.suppressedMajorBleeding}`
      : `\u0441\u0438\u043b\u044c\u043d\u0430\u044f \u043a\u0440\u043e\u0432\u044c: ${part.majorBleeding}`,
  };
}

function partTooltip(part, label) {
  const lines = [`${label}: ${Math.max(0, Math.round(part.currentHp))}/${Math.max(0, Math.round(part.maxHp))}`];
  if (part.destroyed) lines.push("\u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043d\u043e");
  if (part.activeMajorBleeding > 0) lines.push(`\u0441\u0438\u043b\u044c\u043d\u0430\u044f \u043a\u0440\u043e\u0432\u044c: ${part.activeMajorBleeding}`);
  if (part.suppressedMajorBleeding > 0) lines.push(`\u0436\u0433\u0443\u0442: ${part.suppressedMajorBleeding}`);
  if (part.minorBleeding > 0) lines.push(`\u043a\u0440\u043e\u0432\u044c: ${part.minorBleeding}`);
  if (part.fracture) lines.push("\u043f\u0435\u0440\u0435\u043b\u043e\u043c");
  if (part.fractureSuppressed) lines.push("\u043f\u0435\u0440\u0435\u043b\u043e\u043c \u0441\u0442\u0430\u0431\u0438\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d");
  return lines.join(" | ");
}

function buildBodyPart(actor, partKey, figureClass) {
  const part = getBodyPartTraumaStatus(actor, partKey);
  const trauma = buildSheetTrauma(part);
  const label = getBodyTraumaPartLabel(partKey);
  const current = Math.max(0, Math.round(part.currentHp));
  const max = Math.max(0, Math.round(part.maxHp));
  const pct = ratioPct(current, max);
  const cssClass = healthClass(current, max, trauma);
  const dots = traumaDots(part);
  const hasIssue = Boolean(
    part.destroyed ||
    part.activeMajorBleeding > 0 ||
    part.suppressedMajorBleeding > 0 ||
    part.minorBleeding > 0 ||
    part.fracture ||
    part.fractureSuppressed
  );

  return {
    key: partKey,
    label,
    shortLabel: shortPartLabel(partKey),
    miniLabel: miniPartLabel(partKey),
    value: current,
    max,
    hpLabel: max > 0 ? `${current}/${max}` : "\u2014",
    pct,
    cssClass,
    figureClass,
    partClass: [
      "ih-fig-part",
      figureClass,
      cssClass,
      hasIssue ? "has-trauma" : "",
      ["head", "torso"].includes(partKey) ? "is-vital" : "",
    ].filter(Boolean).join(" "),
    sheetPartClass: [
      "ih-cs-fig-part",
      sheetFigureClass(partKey),
      cssClass,
      hasIssue ? "has-trauma" : "",
      ["head", "torso"].includes(partKey) ? "is-vital" : "",
    ].filter(Boolean).join(" "),
    trauma,
    dots,
    hasDots: dots.length > 0,
    hasIssue,
    tooltip: partTooltip(part, label),
  };
}

function buildBodyChips(summary, medicalTriage, currentHp, maxHp, hpPct) {
  const chips = [
    {
      key: "hp",
      label: "HP",
      value: maxHp > 0 ? `${currentHp}/${maxHp}` : "\u2014",
      cssClass: healthClass(currentHp, maxHp),
    },
  ];

  for (const chip of medicalTriage?.statChips ?? []) chips.push(chip);

  return chips.slice(0, 5);
}

function overviewClass(summary, medicalTriage, hpPct) {
  if (!summary?.hasBodyHp) return "is-none";
  if (summary.destroyedVital || medicalTriage?.severityClass === "is-critical") return "is-critical";
  if (summary.activeBleedingTotal > 0 || hpPct <= 25) return "is-danger";
  if (summary.fracturesTotal > 0 || summary.destroyedTotal > 0 || summary.abdomenEnergyPenalty > 0 || hpPct <= 55) return "is-warning";
  if (summary.suppressedMajorBleedingTotal > 0 || summary.splintedTotal > 0 || hpPct < 100) return "is-hurt";
  return "is-stable";
}

function buildFigureRows(partMap) {
  return [
    { key: "head", rowClass: "ih-fig-row is-head", parts: [partMap.head] },
    { key: "upper", rowClass: "ih-fig-row is-upper", parts: [partMap.leftArm, partMap.torso, partMap.rightArm] },
    { key: "abdomen", rowClass: "ih-fig-row is-abdomen", parts: [partMap.abdomen] },
    { key: "legs", rowClass: "ih-fig-row is-legs", parts: [partMap.leftLeg, { gap: true, gapClass: "ih-fig-gap" }, partMap.rightLeg] },
  ];
}

export function buildActorBodyHud(actor, { medicalTriage = null } = {}) {
  const summary = getActorBodyTraumaSummary(actor);
  const triage = medicalTriage ?? buildActorMedicalTriage(actor);
  const parts = BODY_TRAUMA_PART_KEYS.map(partKey => {
    const figureClass = {
      head: "ih-fig-head",
      torso: "ih-fig-torso",
      abdomen: "ih-fig-abdomen",
      leftArm: "ih-fig-arm ih-fig-left-arm",
      rightArm: "ih-fig-arm ih-fig-right-arm",
      leftLeg: "ih-fig-leg ih-fig-left-leg",
      rightLeg: "ih-fig-leg ih-fig-right-leg",
    }[partKey] ?? "ih-fig-part";
    return buildBodyPart(actor, partKey, figureClass);
  });
  const partMap = Object.fromEntries(parts.map(part => [part.key, part]));
  const hpParts = parts.filter(part => part.max > 0);
  const currentHp = hpParts.reduce((sum, part) => sum + part.value, 0);
  const maxHp = hpParts.reduce((sum, part) => sum + part.max, 0);
  const hpPct = ratioPct(currentHp, maxHp);
  const cssClass = overviewClass(summary, triage, hpPct);
  const urgentParts = triage?.recommendedPreview ?? [];

  return {
    visible: Boolean(summary.hasBodyHp),
    hasBodyMap: Boolean(summary.hasBodyHp),
    cssClass,
    title: triage?.title ?? "\u0422\u0435\u043b\u043e",
    detail: triage?.actionHint ?? triage?.summaryText ?? "",
    hpPct,
    hpLabel: maxHp > 0 ? `${currentHp}/${maxHp}` : "\u2014",
    currentHp,
    maxHp,
    summary,
    medicalTriage: triage,
    chips: buildBodyChips(summary, triage, currentHp, maxHp, hpPct),
    hasChips: true,
    parts,
    partMap,
    figureRows: buildFigureRows(partMap),
    urgentParts,
    hasUrgentParts: urgentParts.length > 0,
    issueCount: parts.filter(part => part.hasIssue).length,
  };
}

const RESOURCE_CONFIG = Object.freeze([
  { key: "energy", label: "\u042d\u043d\u0435\u0440\u0433\u0438\u044f", iconClass: "fa-bolt" },
  { key: "mana", label: "\u041c\u0430\u043d\u0430", iconClass: "fa-star" },
  { key: "satiety", label: "\u0421\u044b\u0442\u043e\u0441\u0442\u044c", iconClass: "fa-utensils" },
  { key: "hydration", label: "\u0412\u043e\u0434\u0430", iconClass: "fa-droplet" },
]);

function buildResourceBar(resources, config) {
  const node = resources?.[config.key] ?? {};
  const value = Math.max(0, Math.round(asNumber(node.value, 0)));
  const max = Math.max(0, Math.round(asNumber(node.max, 0)));
  const pct = ratioPct(value, max);
  const low = max > 0 && pct <= 25;
  const warn = max > 0 && pct <= 50 && !low;
  const cssClass = [
    `is-${config.key}`,
    low ? "is-low" : "",
    warn ? "is-warn" : "",
    max <= 0 ? "is-empty" : "",
  ].filter(Boolean).join(" ");

  return {
    ...config,
    value,
    max,
    pct,
    valueLabel: max > 0 ? `${value}/${max}` : "\u2014",
    cssClass,
    tooltip: `${config.label}: ${max > 0 ? `${value}/${max}` : "\u2014"}`,
  };
}

export function buildActorResourceHud(actor) {
  const resources = actor?.system?.resources ?? {};
  return RESOURCE_CONFIG.map(config => buildResourceBar(resources, config));
}
