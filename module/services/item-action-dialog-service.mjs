import { getTargetPartLabel } from "./actor-state-service.mjs";
import {
  applyConfiguredItemAction,
  getItemActionType,
  getItemApplicationScope,
  resolveItemActionTargetActor,
  resolveItemTargetPart,
} from "./item-effect-service.mjs";

export function getMedicalPartOptions(actor) {
  const hp = actor?.system?.resources?.hp ?? {};
  const partKeys = ["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"];

  return partKeys
    .filter(partKey => hp?.[partKey])
    .map(partKey => ({
      key: partKey,
      label: getTargetPartLabel(partKey)
    }));
}

export async function promptTargetActorChoice(actorOptions, title = "Выбор цели") {
  if (!actorOptions?.length) return null;

  const optionsHtml = actorOptions
    .map(actor => `<option value="${actor.uuid}">${actor.name}</option>`)
    .join("");

  return await new Promise(resolve => {
    new Dialog({
      title,
      content: `
        <form>
          <div class="form-group">
            <label>Цель</label>
            <select name="targetActorUuid">
              ${optionsHtml}
            </select>
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "Выбрать",
          callback: html => {
            const uuid = html.find("[name='targetActorUuid']").val();
            resolve(uuid ? fromUuidSync(uuid) : null);
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

export async function promptMedicalTargetPart(actor, title = "Выбор части тела") {
  const parts = getMedicalPartOptions(actor);
  if (!parts.length) return null;

  const options = parts
    .map(part => `<option value="${part.key}">${part.label}</option>`)
    .join("");

  return await new Promise(resolve => {
    new Dialog({
      title,
      content: `
        <form>
          <div class="form-group">
            <label>Часть тела</label>
            <select name="targetPart">
              ${options}
            </select>
          </div>
        </form>
      `,
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
  title = "Выбор цели"
) {
  const result = await resolveItemActionTargetActor({
    sourceActor,
    item,
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
  fallbackTitle = "Выбор части тела"
) {
  return resolveItemTargetPart({
    targetActor,
    item,
    choosePart: actor => promptMedicalTargetPart(actor, fallbackTitle),
  });
}

export async function applyActionTypeItemFromDialog(sourceActor, item) {
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
    `Цель для: ${item.name}`
  );

  if (!targetActorInfo.ok && targetActorInfo.cancelled) {
    return { ok: true, handled: true, consumeItem: false, cancelled: true };
  }

  const targetActor = targetActorInfo.targetActor || sourceActor;
  const scope = getItemApplicationScope(item, "targeted");

  if (scope === "global") {
    return applyConfiguredItemAction({ sourceActor, targetActor, item });
  }

  const targetInfo = await resolveTargetPartByScopeFromDialog(
    targetActor,
    item,
    `Выбор части тела: ${targetActor.name}`
  );

  if (!targetInfo.ok && targetInfo.cancelled) {
    return { ok: true, handled: true, consumeItem: false, cancelled: true };
  }

  const targetPart = targetInfo.targetPart;
  if (!targetPart) {
    return { ok: true, handled: true, consumeItem: false, cancelled: true };
  }

  return applyConfiguredItemAction({ sourceActor, targetActor, item, targetPart });
}
