function repairResult({
  ok = true,
  changed = false,
  reason = "",
  repair = null,
  restored = 0,
  repairCap = 0,
} = {}) {
  return { ok, changed, reason, repair, restored, repairCap };
}

export function getRepairSkillForItem(actor, item) {
  const skills = actor?.system?.skills ?? {};
  const type = item?.type;
  const material = String(item?.system?.material ?? "").toLowerCase();
  const subtype = String(item?.system?.subtype ?? "").toLowerCase();

  if (type === "weapon") {
    return {
      key: "smithing",
      label: "Кузнечное дело",
      value: Number(skills.smithing?.value ?? 1),
    };
  }

  if (type === "armor") {
    const isLeather = material.includes("кожа") || material.includes("leather")
      || subtype.includes("кожа") || subtype.includes("cloth");
    if (isLeather) {
      return {
        key: "crafting",
        label: "Ремесло",
        value: Number(skills.crafting?.value ?? skills.alchemy?.value ?? 1),
      };
    }

    return {
      key: "smithing",
      label: "Кузнечное дело",
      value: Number(skills.smithing?.value ?? 1),
    };
  }

  if (type === "tool") {
    const isAlchemic = subtype.includes("алхим") || subtype.includes("alch");
    if (isAlchemic) {
      return {
        key: "alchemy",
        label: "Алхимия",
        value: Number(skills.alchemy?.value ?? 1),
      };
    }

    return {
      key: "crafting",
      label: "Ремесло",
      value: Number(skills.crafting?.value ?? 1),
    };
  }

  return {
    key: "crafting",
    label: "Ремесло",
    value: Number(skills.crafting?.value ?? 1),
  };
}

export async function repairActorItem(actor, item, {
  applySkillExp = null,
} = {}) {
  if (!actor || !item) {
    return repairResult({ ok: false, reason: "missing-item" });
  }

  const repair = getRepairSkillForItem(actor, item);
  const itemTier = Number(item.system?.tier ?? 1);
  const durMax = Number(item.system?.durability?.max ?? 100);
  const current = Number(item.system?.durability?.value ?? 0);

  if (itemTier > repair.value) {
    ui.notifications.warn(
      `Нужен навык "${repair.label}" ступени ${itemTier} для ремонта (у вас: ${repair.value})`
    );
    return repairResult({ ok: false, reason: "skill-too-low", repair });
  }

  const ratio = Math.min(2, repair.value / Math.max(1, itemTier));
  const repairCap = Math.floor(durMax * (0.5 + ratio * 0.2));
  const restored = repairCap - current;

  if (restored <= 0) {
    ui.notifications.info(`${item.name} уже в максимальном состоянии для вашего уровня.`);
    return repairResult({ ok: true, reason: "already-at-cap", repair, repairCap });
  }

  await item.update({ "system.durability.value": repairCap });

  await ChatMessage.create({
    content: `🔨 <b>${actor.name}</b> починил <b>${item.name}</b> (+${restored} прочности → ${repairCap}/${durMax})<br>
      <small>Навык: ${repair.label} ст.${repair.value}</small>`,
    speaker: ChatMessage.getSpeaker({ actor }),
  });

  await applySkillExp?.(repair.key, `Ремонт: ${item.name}`);

  return repairResult({
    changed: true,
    repair,
    restored,
    repairCap,
  });
}
