import {
  buildActorMedicalTriage,
  getBodyTraumaPartLabel,
} from "./body-trauma-service.mjs";
import {
  buildSystemDialogContent,
  buildSystemDialogSelect,
} from "./combat-chat-service.mjs";
import {
  applyConfiguredItemAction,
  getItemActionType,
  getItemApplicationScope,
  normalizeItemActionSelectedActors,
  resolveItemActionTargetActor,
  resolveItemTargetPart,
} from "./item-effect-service.mjs";

function getPartActionPriority(part, actionType = "") {
  const type = String(actionType ?? "").trim();
  const missingHp = Math.max(0, Number(part?.missingHp ?? 0));

  if (type === "tourniquet") {
    return part.activeMajorBleeding > 0 ? 300 + part.activeMajorBleeding : 0;
  }
  if (type === "bandage") {
    if (part.minorBleeding > 0) return 280 + part.minorBleeding;
    return part.activeMajorBleeding > 0 ? 20 : 0;
  }
  if (type === "splint") {
    return part.fracture ? 260 : 0;
  }
  if (type === "surgery") {
    if (part.destroyed) return 320;
    if (part.suppressedMajorBleeding > 0) return 220 + part.suppressedMajorBleeding;
    if (part.activeMajorBleeding > 0) return 90 + part.activeMajorBleeding;
    return part.fractureSuppressed ? 80 : 0;
  }
  if (type === "heal-part") {
    if (part.destroyed) return 230;
    return missingHp > 0 ? 120 + missingHp : 0;
  }

  return Number(part?.priority ?? part?.treatmentSort ?? 0);
}

function buildMedicalPartOptionLabel(part, actionPriority = 0) {
  const details = [part.hpLabel].filter(Boolean);

  if (actionPriority > 0 && part.recommendedAction) {
    details.push(part.recommendedAction);
  } else if (part.hasTags) {
    details.push(part.tags.slice(0, 2).map(tag => tag.label).join(" + "));
  }

  return details.length
    ? `${part.label} \u00b7 ${details.join(" \u00b7 ")}`
    : part.label;
}

export function getMedicalPartOptions(actor, { actionType = "" } = {}) {
  const hp = actor?.system?.resources?.hp ?? {};
  const partKeys = ["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"];
  const triage = buildActorMedicalTriage(actor);
  const rowsByKey = new Map((triage.partRows ?? []).map(part => [part.key, part]));

  return partKeys
    .filter(partKey => hp?.[partKey])
    .map((partKey, index) => {
      const part = rowsByKey.get(partKey) ?? {
        key: partKey,
        label: getBodyTraumaPartLabel(partKey),
        hpLabel: "",
        priority: 0,
        tags: [],
        hasTags: false,
      };
      const actionPriority = getPartActionPriority(part, actionType);

      return {
        key: partKey,
        label: buildMedicalPartOptionLabel(part, actionPriority),
        baseLabel: part.label,
        actionPriority,
        priority: Number(part.priority ?? 0),
        treatmentHint: part.treatmentHint ?? "",
        recommendedAction: part.recommendedAction ?? "",
        order: index,
      };
    })
    .sort((left, right) =>
      right.actionPriority - left.actionPriority ||
      right.priority - left.priority ||
      left.order - right.order
    );
}

export async function promptTargetActorChoice(actorOptions, title = "Выбор цели") {
  if (!actorOptions?.length) return null;
  if (typeof globalThis.Dialog !== "function") return null;

  return await new Promise(resolve => {
    new Dialog({
      title,
      content: buildSystemDialogContent({
        className: "ih-item-target-dialog",
        headline: title,
        headlineMeta: "выбор цели",
        formHtml: buildSystemDialogSelect({
          name: "targetActorUuid",
          label: "Цель",
          options: actorOptions.map(actor => ({
            value: actor.uuid,
            label: actor.name,
          })),
          selectedValue: actorOptions[0]?.uuid ?? "",
        }),
      }),
      buttons: {
        ok: {
          label: "Выбрать",
          callback: html => {
            const uuid = html.find("[name='targetActorUuid']").val();
            const fallback = actorOptions.find(actor => actor.uuid === uuid) ?? null;
            resolve(uuid && typeof globalThis.fromUuidSync === "function"
              ? (globalThis.fromUuidSync(uuid) ?? fallback)
              : fallback);
          }
        },
        cancel: {
          label: "Отмена",
          callback: () => resolve(null)
        }
      },
      default: "ok",
      close: () => resolve(null)
    }).render(true);
  });
}

export async function promptMedicalTargetPart(
  actor,
  title = "Выбор части тела",
  { item = null, actionType = getItemActionType(item) } = {}
) {
  const parts = getMedicalPartOptions(actor, { actionType });
  if (!parts.length) return null;
  if (typeof globalThis.Dialog !== "function") return null;
  const selectedPart = parts.find(part => part.actionPriority > 0) ?? parts[0] ?? null;

  return await new Promise(resolve => {
    new Dialog({
      title,
      content: buildSystemDialogContent({
        className: "ih-item-target-dialog",
        headline: title,
        headlineMeta: "часть тела",
        formHtml: buildSystemDialogSelect({
          name: "targetPart",
          label: "Часть тела",
          options: parts.map(part => ({
            value: part.key,
            label: part.label,
          })),
          selectedValue: selectedPart?.key ?? "",
        }),
      }),
      buttons: {
        ok: {
          label: "Применить",
          callback: html => resolve(html.find("[name='targetPart']").val())
        },
        cancel: {
          label: "Отмена",
          callback: () => resolve(null)
        }
      },
      default: "ok",
      close: () => resolve(null)
    }).render(true);
  });
}

export async function resolveActionTargetActorFromDialog(
  sourceActor,
  item,
  title = "Выбор цели",
  { targets = null, selectedActors = null, targetActor = null } = {}
) {
  const resolvedSelectedActors = normalizeItemActionSelectedActors(sourceActor, {
    targets,
    selectedActors,
  });

  const result = await resolveItemActionTargetActor({
    sourceActor,
    item,
    targetActor,
    selectedActors: resolvedSelectedActors,
    chooseActor: actorOptions => promptTargetActorChoice(actorOptions, title),
  });

  if (!result.ok && result.reason) {
    ui.notifications.warn(result.reason);
  }

  return result;
}

export async function resolveTargetPartByScopeFromDialog(
  targetActor,
  item,
  fallbackTitle = "Выбор части тела",
  { targetPart = null } = {}
) {
  return resolveItemTargetPart({
    targetActor,
    item,
    targetPart,
    choosePart: actor => promptMedicalTargetPart(actor, fallbackTitle, { item }),
  });
}

export async function applyActionTypeItemFromDialog(sourceActor, item, {
  targets = null,
  selectedActors = null,
  targetActor = null,
  targetPart = null,
} = {}) {
  const actionType = getItemActionType(item);
  if (!actionType) {
    return { ok: true, handled: false, consumeItem: false, cancelled: false };
  }

  if (actionType === "drink-vessel") {
    return applyConfiguredItemAction({ sourceActor, item });
  }

  const targetActorInfo = await resolveActionTargetActorFromDialog(
    sourceActor,
    item,
    `Цель для: ${item.name}`,
    { targets, selectedActors, targetActor }
  );

  if (!targetActorInfo.ok && targetActorInfo.cancelled) {
    return { ok: true, handled: true, consumeItem: false, cancelled: true };
  }

  const resolvedTargetActor = targetActorInfo.targetActor || sourceActor;
  const scope = getItemApplicationScope(item, "targeted");

  if (scope === "global") {
    return applyConfiguredItemAction({ sourceActor, targetActor: resolvedTargetActor, item });
  }

  const targetInfo = await resolveTargetPartByScopeFromDialog(
    resolvedTargetActor,
    item,
    `Выбор части тела: ${resolvedTargetActor.name}`,
    { targetPart }
  );

  if (!targetInfo.ok && targetInfo.cancelled) {
    return { ok: true, handled: true, consumeItem: false, cancelled: true };
  }

  const resolvedTargetPart = targetInfo.targetPart;
  if (!resolvedTargetPart) {
    return { ok: true, handled: true, consumeItem: false, cancelled: true };
  }

  return applyConfiguredItemAction({
    sourceActor,
    targetActor: resolvedTargetActor,
    item,
    targetPart: resolvedTargetPart,
  });
}
