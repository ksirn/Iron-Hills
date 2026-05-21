import { EntityPickerDialog } from "../apps/entity-picker.mjs";

export function relationTierForScore(score) {
  if (score >= 80) return "ally";
  if (score >= 40) return "friendly";
  if (score >= 10) return "cordial";
  if (score >= -9) return "neutral";
  if (score >= -39) return "unfriendly";
  if (score >= -79) return "hostile";
  return "enemy";
}

export async function changeRelationScoreForActor(characterActor, relationId, change, {
  render = null,
} = {}) {
  if (!game.user?.isGM) return { ok: false, reason: "not-gm" };

  const relationActor = game.actors.get(relationId);
  if (!relationActor) return { ok: false, reason: "missing-relation" };

  const current = Number(relationActor.system.info?.score ?? 0);
  const newScore = Math.max(-100, Math.min(100, current + Number(change ?? 0)));

  await relationActor.update({
    "system.info.score": newScore,
    "system.info.tier": relationTierForScore(newScore),
  });

  await ChatMessage.create({
    content: `📊 Репутация <b>${characterActor.name}</b> у <b>${relationActor.system.info?.targetName}</b>: ${current > 0 ? "+" : ""}${current} → ${newScore > 0 ? "+" : ""}${newScore}`
  });

  render?.(false);
  return { ok: true, relationActor, previous: current, next: newScore };
}

export async function addRelationForActor(characterActor, {
  render = null,
} = {}) {
  if (!game.user?.isGM) return { ok: false, reason: "not-gm" };

  const picked = await EntityPickerDialog.pick({
    title: "Выбрать цель репутации",
    types: ["settlement", "faction"],
    placeholder: "Поиск поселения или фракции...",
    groupBy: actor => actor.type === "settlement" ? "Поселения" : "Фракции",
  });

  if (!picked) return { ok: false, reason: "cancelled" };

  const existing = game.actors.find(actor =>
    actor.type === "relation" &&
    actor.system.info?.characterName === characterActor.name &&
    actor.system.info?.targetName === picked.name
  );
  if (existing) {
    ui.notifications.warn(`Репутация с "${picked.name}" уже существует.`);
    return { ok: false, reason: "already-exists", relationActor: existing };
  }

  const relationActor = await Actor.create({
    name: `${characterActor.name} → ${picked.name}`,
    type: "relation",
    img: picked.img,
    system: {
      info: {
        characterId: characterActor.id,
        characterName: characterActor.name,
        targetId: picked.id,
        targetName: picked.name,
        targetType: picked.type,
        score: 0,
        tier: "neutral",
        notes: ""
      }
    }
  });

  render?.(false);
  return { ok: true, relationActor };
}
