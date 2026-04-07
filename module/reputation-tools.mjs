function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getRelations() {
  return game.actors.filter(a => a.type === "relation");
}

function relationTier(score) {
  if (score <= -15) return "hostile";
  if (score <= -5) return "unfriendly";
  if (score < 5) return "neutral";
  if (score < 15) return "friendly";
  return "trusted";
}

function makeRelationName(characterName, targetType, targetName) {
  return `${characterName} → ${targetType}:${targetName}`;
}

async function getOrCreateRelation(characterName, targetType, targetName) {
  let relation = getRelations().find(r =>
    (r.system.info?.characterName || "") === characterName &&
    (r.system.info?.targetType || "") === targetType &&
    (r.system.info?.targetName || "") === targetName
  );

  if (relation) return relation;

  relation = await Actor.create({
    name: makeRelationName(characterName, targetType, targetName),
    type: "relation",
    system: {
      info: {
        characterName,
        targetType,
        targetName,
        score: 0,
        tier: "neutral",
        notes: ""
      }
    }
  });

  return relation;
}

async function adjustRelation(characterName, targetType, targetName, delta, note = "") {
  if (!characterName || !targetType || !targetName || !delta) return null;

  const relation = await getOrCreateRelation(characterName, targetType, targetName);
  const current = Number(relation.system.info?.score ?? 0);
  const next = clamp(current + Number(delta), -100, 100);
  const tier = relationTier(next);

  const notes = relation.system.info?.notes || "";
  const nextNotes = note ? `${note}\n${notes}`.trim() : notes;

  await relation.update({
    "system.info.score": next,
    "system.info.tier": tier,
    "system.info.notes": nextNotes
  });

  return relation;
}

function getRelationScore(characterName, targetType, targetName) {
  const relation = getRelations().find(r =>
    (r.system.info?.characterName || "") === characterName &&
    (r.system.info?.targetType || "") === targetType &&
    (r.system.info?.targetName || "") === targetName
  );

  return relation ? Number(relation.system.info?.score ?? 0) : 0;
}

Hooks.once("ready", () => {
  game.ironHills = game.ironHills || {};
  game.ironHills.reputation = {
    getOrCreateRelation,
    adjustRelation,
    getRelationScore,
    relationTier
  };
});