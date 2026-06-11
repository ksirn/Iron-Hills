export const BODY_TRAUMA_PART_KEYS = Object.freeze([
  "head",
  "torso",
  "abdomen",
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
]);

export const BODY_TRAUMA_PART_LABELS = Object.freeze({
  head: "\u0413\u043e\u043b\u043e\u0432\u0430",
  torso: "\u0422\u043e\u0440\u0441",
  abdomen: "\u0416\u0438\u0432\u043e\u0442",
  leftArm: "\u041b\u0435\u0432\u0430\u044f \u0440\u0443\u043a\u0430",
  rightArm: "\u041f\u0440\u0430\u0432\u0430\u044f \u0440\u0443\u043a\u0430",
  leftLeg: "\u041b\u0435\u0432\u0430\u044f \u043d\u043e\u0433\u0430",
  rightLeg: "\u041f\u0440\u0430\u0432\u0430\u044f \u043d\u043e\u0433\u0430",
});

export const LEGACY_TRAUMA_FRACTURE_PART_KEYS = new Set([
  "leftArm",
  "rightArm",
  "leftLeg",
  "rightLeg",
]);

export const DEFAULT_BODY_TRAUMA_STATUS = Object.freeze({
  minorBleeding: 0,
  majorBleeding: 0,
  fracture: false,
  destroyed: false,
  splinted: false,
  tourniquet: false,
});

const ARM_PART_KEYS = new Set(["leftArm", "rightArm"]);
const LEG_PART_KEYS = new Set(["leftLeg", "rightLeg"]);
const VITAL_PART_KEYS = new Set(["head", "torso"]);

function clampNonNegativeInt(value) {
  return Math.max(0, Math.floor(Number(value ?? 0)));
}

function normalizeBoolStatus(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (value && typeof value === "object") {
    if (typeof value.active === "boolean") return value.active;
    if (typeof value.value === "number") return value.value > 0;
  }
  return false;
}

function clampPct(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value ?? 0))));
}

function formatPartHp(part) {
  if (!part || !(part.maxHp > 0)) return "\u2014";
  return `${Math.max(0, Math.round(part.currentHp))}/${Math.round(part.maxHp)}`;
}

function buildTreatmentTags(part) {
  const tags = [];
  if (part.activeMajorBleeding > 0) {
    tags.push({
      key: "major-bleeding",
      label: `\u0441\u0438\u043b\u044c\u043d\u0430\u044f \u043a\u0440\u043e\u0432\u044c ${part.activeMajorBleeding}`,
      cssClass: "is-critical",
    });
  }
  if (part.minorBleeding > 0) {
    tags.push({
      key: "minor-bleeding",
      label: `\u043a\u0440\u043e\u0432\u044c ${part.minorBleeding}`,
      cssClass: "is-danger",
    });
  }
  if (part.fracture) {
    tags.push({
      key: "fracture",
      label: "\u043f\u0435\u0440\u0435\u043b\u043e\u043c",
      cssClass: "is-warning",
    });
  }
  if (part.fractureSuppressed) {
    tags.push({
      key: "splinted",
      label: "\u0448\u0438\u043d\u0430",
      cssClass: "is-stable",
    });
  }
  if (part.suppressedMajorBleeding > 0) {
    tags.push({
      key: "tourniquet",
      label: "\u0436\u0433\u0443\u0442",
      cssClass: "is-stable",
    });
  }
  if (part.destroyed) {
    tags.push({
      key: "destroyed",
      label: "\u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043d\u043e",
      cssClass: "is-critical",
    });
  }

  return tags;
}

function buildPartTreatmentPlan(part) {
  if (!part) {
    return {
      priority: 0,
      actionType: "",
      recommendedAction: "\u043d\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f",
      treatmentHint: "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0440\u043e\u0432\u043d\u043e\u0435.",
      priorityLabel: "\u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e",
      cssClass: "is-stable",
    };
  }

  if (part.destroyed && VITAL_PART_KEYS.has(part.partKey)) {
    return {
      priority: 100,
      actionType: "surgery",
      recommendedAction: "\u043a\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u0445\u0438\u0440\u0443\u0440\u0433\u0438\u044f",
      treatmentHint: "\u0416\u0438\u0437\u043d\u0435\u043d\u043d\u043e \u0432\u0430\u0436\u043d\u0430\u044f \u0437\u043e\u043d\u0430 \u0440\u0430\u0437\u0440\u0443\u0448\u0435\u043d\u0430.",
      priorityLabel: "\u0441\u043c\u0435\u0440\u0442\u0435\u043b\u044c\u043d\u043e",
      cssClass: "is-critical",
    };
  }

  if (part.activeMajorBleeding > 0) {
    return {
      priority: 90 + part.activeMajorBleeding,
      actionType: "tourniquet",
      recommendedAction: "\u0436\u0433\u0443\u0442",
      treatmentHint: "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043f\u0435\u0440\u0435\u0436\u0430\u0442\u044c \u0441\u0438\u043b\u044c\u043d\u043e\u0435 \u043a\u0440\u043e\u0432\u043e\u0442\u0435\u0447\u0435\u043d\u0438\u0435.",
      priorityLabel: "\u0441\u0440\u043e\u0447\u043d\u043e",
      cssClass: "is-critical",
    };
  }

  if (part.destroyed) {
    return {
      priority: 80,
      actionType: "surgery",
      recommendedAction: "\u0445\u0438\u0440\u0443\u0440\u0433\u0438\u044f",
      treatmentHint: "\u0427\u0430\u0441\u0442\u044c \u0442\u0435\u043b\u0430 \u0441\u0431\u0438\u0442\u0430 \u0434\u043e \u043d\u0443\u043b\u044f, \u043d\u0443\u0436\u043d\u043e \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435.",
      priorityLabel: "\u0442\u044f\u0436\u0435\u043b\u043e",
      cssClass: "is-critical",
    };
  }

  if (part.minorBleeding > 0) {
    return {
      priority: 70 + part.minorBleeding,
      actionType: "bandage",
      recommendedAction: "\u0431\u0438\u043d\u0442",
      treatmentHint: "\u041e\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c \u043c\u0430\u043b\u043e\u0435 \u043a\u0440\u043e\u0432\u043e\u0442\u0435\u0447\u0435\u043d\u0438\u0435.",
      priorityLabel: "\u0432\u0430\u0436\u043d\u043e",
      cssClass: "is-danger",
    };
  }

  if (part.fracture) {
    return {
      priority: 55,
      actionType: "splint",
      recommendedAction: "\u0448\u0438\u043d\u0430",
      treatmentHint: "\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0435\u0440\u0435\u043b\u043e\u043c.",
      priorityLabel: "\u0442\u0440\u0430\u0432\u043c\u0430",
      cssClass: "is-warning",
    };
  }

  if (part.suppressedMajorBleeding > 0) {
    return {
      priority: 45 + part.suppressedMajorBleeding,
      actionType: "surgery",
      recommendedAction: "\u0441\u0442\u0430\u0431\u0438\u043b\u0438\u0437\u0430\u0446\u0438\u044f",
      treatmentHint: "\u0416\u0433\u0443\u0442 \u0441\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u043a\u0440\u043e\u0432\u044c; \u043d\u0443\u0436\u043d\u043e \u0434\u043e\u043b\u0435\u0447\u0438\u0442\u044c \u0440\u0430\u043d\u0443.",
      priorityLabel: "\u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c",
      cssClass: "is-warning",
    };
  }

  if (part.fractureSuppressed) {
    return {
      priority: 25,
      actionType: "heal-part",
      recommendedAction: "\u043b\u0435\u0447\u0435\u043d\u0438\u0435",
      treatmentHint: "\u041f\u0435\u0440\u0435\u043b\u043e\u043c \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d, \u043c\u043e\u0436\u043d\u043e \u043b\u0435\u0447\u0438\u0442\u044c HP.",
      priorityLabel: "\u0441\u0442\u0430\u0431.",
      cssClass: "is-stable",
    };
  }

  if (part.maxHp > 0 && part.currentHp < part.maxHp) {
    return {
      priority: Math.max(10, Math.round((1 - part.hpRatio) * 40)),
      actionType: "heal-part",
      recommendedAction: "\u043b\u0435\u0447\u0435\u043d\u0438\u0435",
      treatmentHint: "\u0412\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c HP \u0447\u0430\u0441\u0442\u0438 \u0442\u0435\u043b\u0430.",
      priorityLabel: "\u043b\u0435\u0447\u0438\u0442\u044c",
      cssClass: "is-hurt",
    };
  }

  return {
    priority: 0,
    actionType: "",
    recommendedAction: "\u043d\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f",
    treatmentHint: "\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0440\u043e\u0432\u043d\u043e\u0435.",
    priorityLabel: "\u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e",
    cssClass: "is-stable",
  };
}

function classifyMedicalSeverity(summary, recommendedParts) {
  if (!summary?.hasBodyHp) {
    return {
      severity: "none",
      severityClass: "is-none",
      title: "\u041d\u0435\u0442 \u0442\u0435\u043b\u0435\u0441\u043d\u043e\u0439 \u043a\u0430\u0440\u0442\u044b",
      icon: "?",
      summaryText: "\u0423 \u0430\u043a\u0442\u0435\u0440\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b HP \u043f\u043e \u0447\u0430\u0441\u0442\u044f\u043c \u0442\u0435\u043b\u0430.",
    };
  }

  if (summary.destroyedVital) {
    return {
      severity: "deadly",
      severityClass: "is-critical",
      title: "\u041a\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435",
      icon: "!",
      summaryText: "\u0420\u0430\u0437\u0440\u0443\u0448\u0435\u043d\u0430 \u0436\u0438\u0437\u043d\u0435\u043d\u043d\u0430\u044f \u0437\u043e\u043d\u0430.",
    };
  }

  if (summary.majorBleedingTotal > 0) {
    return {
      severity: "critical",
      severityClass: "is-critical",
      title: "\u0421\u0438\u043b\u044c\u043d\u0430\u044f \u043a\u0440\u043e\u0432\u043e\u043f\u043e\u0442\u0435\u0440\u044f",
      icon: "!",
      summaryText: "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0436\u0433\u0443\u0442 \u0438\u043b\u0438 \u0442\u0440\u0430\u0432\u043c\u043f\u0430\u043a\u0435\u0442.",
    };
  }

  if (
    summary.minorBleedingTotal > 0 ||
    summary.fracturesTotal > 0 ||
    summary.destroyedTotal > 0 ||
    summary.abdomenEnergyPenalty >= 4
  ) {
    return {
      severity: "urgent",
      severityClass: "is-urgent",
      title: "\u041d\u0443\u0436\u043d\u0430 \u043f\u043e\u043c\u043e\u0449\u044c",
      icon: "+",
      summaryText: recommendedParts[0]?.treatmentHint ?? "\u0415\u0441\u0442\u044c \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0435 \u0442\u0440\u0430\u0432\u043c\u044b.",
    };
  }

  if (summary.suppressedMajorBleedingTotal > 0 || summary.splintedTotal > 0 || recommendedParts.length > 0) {
    return {
      severity: "hurt",
      severityClass: "is-hurt",
      title: "\u0421\u0442\u0430\u0431\u0438\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d",
      icon: "~",
      summaryText: "\u041e\u0441\u0442\u0430\u043b\u0438\u0441\u044c \u0434\u043e\u043b\u0435\u0447\u0438\u0432\u0430\u043d\u0438\u0435 \u0438 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c.",
    };
  }

  return {
    severity: "stable",
    severityClass: "is-stable",
    title: "\u0421\u0442\u0430\u0431\u0438\u043b\u0435\u043d",
    icon: "\u2713",
    summaryText: "\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u0442\u0440\u0430\u0432\u043c \u043d\u0435\u0442.",
  };
}

function buildTriageStatChips(summary) {
  const chips = [
    {
      key: "bleeding",
      label: "\u041a\u0440\u043e\u0432\u044c",
      value: summary.activeBleedingTotal > 0 ? `${summary.activeBleedingTotal}` : "0",
      cssClass: summary.majorBleedingTotal > 0 ? "is-critical" : (summary.minorBleedingTotal > 0 ? "is-danger" : "is-stable"),
    },
    {
      key: "fractures",
      label: "\u041f\u0435\u0440\u0435\u043b\u043e\u043c\u044b",
      value: `${summary.fracturesTotal}`,
      cssClass: summary.fracturesTotal > 0 ? "is-warning" : "is-stable",
    },
    {
      key: "stabilized",
      label: "\u0421\u0442\u0430\u0431.",
      value: `${summary.suppressedMajorBleedingTotal + summary.splintedTotal}`,
      cssClass: summary.suppressedMajorBleedingTotal + summary.splintedTotal > 0 ? "is-stable" : "is-muted",
    },
  ];

  if (summary.abdomenEnergyPenalty > 0) {
    chips.push({
      key: "abdomen-energy",
      label: "\u042d\u043d\u0435\u0440\u0433\u0438\u044f",
      value: `-${summary.abdomenEnergyPenalty}`,
      cssClass: summary.abdomenEnergyPenalty >= 4 ? "is-danger" : "is-warning",
    });
  } else {
    chips.push({
      key: "abdomen-energy",
      label: "\u042d\u043d\u0435\u0440\u0433\u0438\u044f",
      value: "0",
      cssClass: "is-stable",
    });
  }

  return chips;
}

export function actorHasBodyHp(actor) {
  return Boolean(actor?.system?.resources?.hp?.torso);
}

export function getBodyTraumaPartLabel(partKey) {
  return BODY_TRAUMA_PART_LABELS[partKey] ?? String(partKey ?? "");
}

export function getBodyPartHpNode(actor, partKey) {
  return actor?.system?.resources?.hp?.[partKey] ?? null;
}

export function getBodyPartStatusValue(actor, partKey, statusKey) {
  const raw = actor?.system?.resources?.hp?.[partKey]?.status?.[statusKey];

  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  if (raw && typeof raw === "object") {
    if (typeof raw.value === "number") return raw.value;
    if (typeof raw.active === "boolean") return raw.active ? 1 : 0;
  }

  return 0;
}

export function getBodyPartStatusBool(actor, partKey, statusKey) {
  return normalizeBoolStatus(actor?.system?.resources?.hp?.[partKey]?.status?.[statusKey]);
}

export function getBodyPartTraumaStatus(actor, partKey) {
  const rawHpNode = getBodyPartHpNode(actor, partKey);
  const hpNode = rawHpNode ?? {};
  const hasHpNode = Boolean(rawHpNode);
  const status = hpNode.status ?? {};
  const currentHp = Number(hpNode.value ?? 0);
  const maxHp = Number(hpNode.max ?? 0);
  const splinted = normalizeBoolStatus(status.splinted);
  const tourniquet = normalizeBoolStatus(status.tourniquet);
  const minorBleeding = clampNonNegativeInt(status.minorBleeding);
  const majorBleeding = clampNonNegativeInt(status.majorBleeding);
  const activeMajorBleeding = tourniquet ? 0 : majorBleeding;
  const suppressedMajorBleeding = Math.max(0, majorBleeding - activeMajorBleeding);
  const destroyed = hasHpNode && (currentHp <= 0 || normalizeBoolStatus(status.destroyed));
  const rawFracture = normalizeBoolStatus(status.fracture);
  const fracture = rawFracture && !splinted;

  return {
    partKey,
    currentHp,
    maxHp,
    hpRatio: maxHp > 0 ? Math.max(0, Math.min(1, currentHp / maxHp)) : 1,
    destroyed,
    rawFracture,
    fracture,
    fractureSuppressed: rawFracture && splinted,
    splinted,
    tourniquet,
    minorBleeding,
    majorBleeding,
    activeMajorBleeding,
    suppressedMajorBleeding,
    bleedingPressure: minorBleeding + activeMajorBleeding * 2,
  };
}

export function getBodyPartTraumaSnapshot(actor, partKey) {
  const hpNode = getBodyPartHpNode(actor, partKey) ?? {};
  return {
    ...getBodyPartTraumaStatus(actor, partKey),
    value: Number(hpNode.value ?? 0),
    max: Number(hpNode.max ?? 0),
    status: hpNode.status ?? {},
  };
}

function getLowHpEnergyPenalty(part) {
  if (!part || !(part.maxHp > 0)) return 0;
  if (part.currentHp <= 0) return 4;
  if (part.hpRatio <= 0.25) return 3;
  if (part.hpRatio <= 0.5) return 1;
  return 0;
}

export function getAbdomenEnergyPenalty(summaryOrActor) {
  const summary = summaryOrActor?.parts
    ? summaryOrActor
    : getActorBodyTraumaSummary(summaryOrActor);
  const abdomen = summary?.parts?.abdomen;
  if (!abdomen) return 0;

  const bleedingPenalty = abdomen.bleedingPressure;
  const traumaPenalty =
    (abdomen.destroyed ? 6 : 0) +
    (abdomen.fracture ? 2 : 0) +
    getLowHpEnergyPenalty(abdomen);

  return Math.min(12, clampNonNegativeInt(bleedingPenalty + traumaPenalty));
}

export function getActorBodyTraumaSummary(actor) {
  const parts = {};
  let minorBleedingTotal = 0;
  let majorBleedingTotal = 0;
  let majorBleedingRawTotal = 0;
  let suppressedMajorBleedingTotal = 0;
  let fracturesTotal = 0;
  let splintedTotal = 0;
  let destroyedTotal = 0;
  let destroyedArms = 0;
  let destroyedLegs = 0;
  let destroyedVital = false;

  for (const partKey of BODY_TRAUMA_PART_KEYS) {
    const part = getBodyPartTraumaStatus(actor, partKey);
    parts[partKey] = part;

    minorBleedingTotal += part.minorBleeding;
    majorBleedingTotal += part.activeMajorBleeding;
    majorBleedingRawTotal += part.majorBleeding;
    suppressedMajorBleedingTotal += part.suppressedMajorBleeding;

    if (part.fracture) fracturesTotal += 1;
    if (part.splinted) splintedTotal += 1;
    if (part.destroyed) {
      destroyedTotal += 1;
      if (ARM_PART_KEYS.has(partKey)) destroyedArms += 1;
      if (LEG_PART_KEYS.has(partKey)) destroyedLegs += 1;
      if (VITAL_PART_KEYS.has(partKey)) destroyedVital = true;
    }
  }

  const armFractures =
    (parts.leftArm?.fracture ? 1 : 0) +
    (parts.rightArm?.fracture ? 1 : 0);
  const legFractures =
    (parts.leftLeg?.fracture ? 1 : 0) +
    (parts.rightLeg?.fracture ? 1 : 0);
  const activeBleedingTotal = minorBleedingTotal + majorBleedingTotal * 2;
  const traumaShock =
    majorBleedingTotal +
    armFractures +
    legFractures +
    destroyedArms +
    destroyedLegs +
    (destroyedVital ? 100 : 0);

  const summary = {
    hasBodyHp: actorHasBodyHp(actor),
    parts,
    minorBleedingTotal,
    majorBleedingTotal,
    majorBleedingRawTotal,
    suppressedMajorBleedingTotal,
    activeBleedingTotal,
    fracturesTotal,
    splintedTotal,
    destroyedTotal,
    destroyedArms,
    destroyedLegs,
    destroyedVital,
    armFractures,
    legFractures,
    traumaShock,
    hasActiveBleeding: activeBleedingTotal > 0,
    hasSuppressedBleeding: suppressedMajorBleedingTotal > 0,
  };

  summary.abdomenEnergyPenalty = getAbdomenEnergyPenalty(summary);
  return summary;
}

export function buildActorMedicalTriage(actor) {
  const summary = getActorBodyTraumaSummary(actor);
  const partRows = BODY_TRAUMA_PART_KEYS.map(partKey => {
    const part = summary.parts[partKey] ?? getBodyPartTraumaStatus(actor, partKey);
    const treatment = buildPartTreatmentPlan(part);
    const hpPct = clampPct((part.hpRatio ?? 1) * 100);
    const missingHp = Math.max(0, Math.round(Number(part.maxHp ?? 0) - Number(part.currentHp ?? 0)));
    const tags = buildTreatmentTags(part);

    return {
      ...part,
      key: partKey,
      label: getBodyTraumaPartLabel(partKey),
      shortLabel: getBodyTraumaPartLabel(partKey).replace(/\s+/g, " "),
      hpLabel: formatPartHp(part),
      hpPct,
      missingHp,
      tags,
      hasTags: tags.length > 0,
      hasIssue: treatment.priority > 0 || tags.length > 0,
      treatmentSort: treatment.priority,
      ...treatment,
    };
  });
  const recommendedParts = [...partRows]
    .filter(part => part.priority > 0)
    .sort((left, right) => right.priority - left.priority || BODY_TRAUMA_PART_KEYS.indexOf(left.key) - BODY_TRAUMA_PART_KEYS.indexOf(right.key));
  const severityInfo = classifyMedicalSeverity(summary, recommendedParts);
  const primaryPart = recommendedParts[0] ?? null;
  const needsAttention = recommendedParts.length > 0
    || summary.activeBleedingTotal > 0
    || summary.suppressedMajorBleedingTotal > 0
    || summary.fracturesTotal > 0
    || summary.splintedTotal > 0
    || summary.abdomenEnergyPenalty > 0;

  return {
    ...summary,
    ...severityInfo,
    visible: summary.hasBodyHp,
    needsAttention,
    statChips: buildTriageStatChips(summary),
    partRows,
    recommendedParts,
    urgentParts: recommendedParts.filter(part => part.priority >= 55),
    recommendedPreview: recommendedParts.slice(0, 4),
    primaryPart,
    primaryAction: primaryPart
      ? `${primaryPart.recommendedAction}: ${primaryPart.label}`
      : "\u041d\u0435\u0442 \u0441\u0440\u043e\u0447\u043d\u044b\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439",
    actionHint: primaryPart?.treatmentHint ?? severityInfo.summaryText,
    hasRecommendedParts: recommendedParts.length > 0,
    recommendedCount: recommendedParts.length,
    bodyStatusLabel: needsAttention
      ? `${severityInfo.title} \u00b7 ${recommendedParts.length || summary.activeBleedingTotal || summary.fracturesTotal}`
      : severityInfo.title,
  };
}

export function buildActorRestProfile(actor, type = "short") {
  const summary = getActorBodyTraumaSummary(actor);
  const resources = actor?.system?.resources ?? {};
  const energy = resources.energy ?? {};
  const mana = resources.mana ?? {};
  const endurance = Math.max(0, Number(actor?.system?.skills?.endurance?.value ?? 1));
  const conditions = actor?.system?.conditions ?? {};

  const currentEnergy = Number(energy.value ?? 0);
  const baseEnergyMax = Number(energy.baseMax ?? energy.max ?? 10);
  const currentEnergyMax = Number(energy.max ?? baseEnergyMax);
  const currentMana = Number(mana.value ?? 0);
  const maxMana = Number(mana.max ?? 50);
  const bleeding = Math.max(
    clampNonNegativeInt(conditions.bleeding),
    clampNonNegativeInt(summary.activeBleedingTotal),
  );
  const shock = Math.max(clampNonNegativeInt(conditions.shock), clampNonNegativeInt(summary.traumaShock));
  const poison = clampNonNegativeInt(conditions.poison);
  const burning = clampNonNegativeInt(conditions.burning);
  const missingEnergyMax = Math.max(0, baseEnergyMax - currentEnergyMax);
  const recoveredEnergyMax = type === "full"
    ? missingEnergyMax
    : Math.min(
        missingEnergyMax,
        Math.max(missingEnergyMax > 0 ? 1 : 0, Math.floor(missingEnergyMax * 0.5)),
      );
  const nextEnergyMax = Math.min(baseEnergyMax, currentEnergyMax + recoveredEnergyMax);
  const energyBaseGain = 20 + endurance * 2;
  const energyRecoveryPenalty =
    bleeding * 2 +
    summary.abdomenEnergyPenalty +
    Math.floor(shock / 2) +
    poison +
    burning * 2;
  const manaRecoveryPenalty = Math.floor(shock / 2) + Math.floor(poison / 2);
  const restoredEnergy = type === "full"
    ? Math.max(0, nextEnergyMax - currentEnergy)
    : Math.max(0, energyBaseGain - energyRecoveryPenalty);
  const restoredMana = type === "full"
    ? Math.max(0, maxMana - currentMana)
    : Math.max(0, 10 + Math.floor(endurance / 2) - manaRecoveryPenalty);
  const blockers = [];

  if (type === "full") {
    if (bleeding > 0) blockers.push("bleeding");
    if (burning > 0) blockers.push("burning");
  }

  return {
    type,
    actor,
    summary,
    endurance,
    bleeding,
    shock,
    poison,
    burning,
    abdomenEnergyPenalty: summary.abdomenEnergyPenalty,
    currentEnergy,
    currentEnergyMax,
    baseEnergyMax,
    nextEnergyMax,
    missingEnergyMax,
    recoveredEnergyMax,
    currentMana,
    maxMana,
    restoredEnergy,
    restoredMana,
    nextEnergy: type === "full"
      ? nextEnergyMax
      : Math.min(nextEnergyMax, currentEnergy + restoredEnergy),
    nextMana: type === "full"
      ? maxMana
      : Math.min(maxMana, currentMana + restoredMana),
    energyRecoveryPenalty,
    manaRecoveryPenalty,
    blockers,
    blocked: blockers.length > 0,
  };
}
