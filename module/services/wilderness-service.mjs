/**
 * Охота, добыча, фляги и для походной игры.
 */
import { DRINK_VESSELS, HARVEST_TOOL_CATALOG_IDS } from "../constants/items-catalog.mjs";
import { MONSTER_BESTIARY, allocateMonsterHpParts } from "../constants/monster-bestiary.mjs";
import {
  MONSTER_HARVEST_DROP_POOLS,
  listMonsterLootPoolKeys,
} from "../constants/monster-loot-pools.mjs";
import { itemDataFromLootLine } from "../utils/loot-line-items.mjs";
import {
  buildMonsterHarvestEmbeddedItemData,
  monsterActorHasHarvestLootItems,
} from "../utils/monster-harvest-items.mjs";
import { grantSkillExp } from "./actor-state-service.mjs";
import { recalculateActorWeight } from "./inventory-service.mjs";
import { addItemToActorOrStack, transferItemQuantityBetweenActors } from "./trade-service.mjs";

function npcHasEmbeddedLoot(actor) {
  return (actor?.items?.size ?? 0) > 0;
}

async function transferAllEmbeddedInventoryTo(recipientActor, sourceActor) {
  if (!recipientActor?.id || !sourceActor?.id) return [];
  const names = [];
  const snapshot = [...sourceActor.items.values()];
  for (const it of snapshot) {
    const live = sourceActor.items.get(it.id);
    if (!live) continue;
    const q = Math.max(1, Number(live.system?.quantity ?? 1));
    try {
      await transferItemQuantityBetweenActors(sourceActor, recipientActor, live, q);
      names.push(`${live.name}${q > 1 ? `×${q}` : ""}`);
    } catch (e) {
      console.warn(`Iron Hills | corpse inventory transfer failed (${live?.name})`, e);
    }
  }
  return names;
}

/**
 * Одна случайная вещь из встроенного инвентаря NPC: полное или частичное количество.
 * @returns {Promise<string[]>} подписи для чата
 */
function pickRandomEmbeddedItem(actorDoc) {
  const pool = [...actorDoc.items.values()];
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

async function stealOneRandomNpcInventoryQty(recipientActor, sourceNpc, { partial }) {
  const live = pickRandomEmbeddedItem(sourceNpc);
  if (!live) return [];
  const qty = Math.max(1, Number(live.system?.quantity ?? 1));
  const move =
    partial && qty > 1 ? Math.max(1, Math.floor(qty / 2)) : qty;
  try {
    await transferItemQuantityBetweenActors(sourceNpc, recipientActor, live, move);
    return [`${live.name}${move > 1 ? `×${move}` : ""}`];
  } catch (e) {
    console.warn("Iron Hills | pickpocket inventory transfer failed", e);
    return [];
  }
}

/** Совместимость с макросами: ключи пулов добычи монстра. */
export function lootTableKeys() {
  return listMonsterLootPoolKeys();
}

/** Порог «Выживания» для разделки: база по ступени твари */
export function butcherDifficultyForTier(tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  return 4 + t * 2;
}

/** Первый предмет типа tool в инвентаре с каталогным id из набора разделки. */
export function findHarvestToolOnActor(actor) {
  if (!actor?.items) return null;
  for (const it of actor.items) {
    if (it.type !== "tool") continue;
    const cid = it.getFlag?.("iron-hills-system", "catalogId");
    if (cid && HARVEST_TOOL_CATALOG_IDS.has(String(cid))) return it;
    const nid = String(it.system?.nativeId ?? it.system?.recipeId ?? "");
    if (nid && HARVEST_TOOL_CATALOG_IDS.has(nid)) return it;
  }
  return null;
}

/** Ступень твари для проверки (лист монстра или бестиарий). */
export function resolveMonsterHarvestTier(monsterActorOrBid) {
  if (!monsterActorOrBid) return 1;

  if (typeof monsterActorOrBid === "string") {
    const s = monsterActorOrBid.trim();
    const tierFromTables = /^[a-z0-9_]+_t(\d+)$/i.exec(s);
    if (tierFromTables) return Math.max(1, Math.min(10, Number(tierFromTables[1]) || 1));
    return Number(MONSTER_BESTIARY[s]?.tier ?? 1);
  }

  const a = monsterActorOrBid;
  const fromSheet = Number(a.system?.info?.tier ?? NaN);
  if (Number.isFinite(fromSheet) && fromSheet >= 1) return fromSheet;
  const bid = String(a.system?.info?.bestiaryId ?? "").trim();
  if (bid && MONSTER_BESTIARY[bid]?.tier != null)
    return Number(MONSTER_BESTIARY[bid].tier ?? 1);
  const pk = resolveMonsterLootPool(a);
  if (pk) return resolveMonsterHarvestTier(pk);
  return 1;
}

/**
 * Пул возможной добычи с разделки: строка ключей монстра или bestiary id.
 * @deprecated resolveHarvestLootTableKey — синоним
 */
export function resolveMonsterLootPool(monsterActorOrKey) {
  if (typeof monsterActorOrKey === "string") {
    const s = monsterActorOrKey.trim();
    if (MONSTER_HARVEST_DROP_POOLS[s]?.length) return s;
    return String(MONSTER_BESTIARY[s]?.lootPool ?? "").trim();
  }
  let pool = String(monsterActorOrKey?.system?.info?.lootPool ?? "").trim();
  const legacy = String(monsterActorOrKey?.system?.info?.lootTable ?? "").trim();
  if (!pool && legacy && MONSTER_HARVEST_DROP_POOLS[legacy]?.length) pool = legacy;
  const bid = String(monsterActorOrKey?.system?.info?.bestiaryId ?? "").trim();
  if (!pool && bid && MONSTER_BESTIARY[bid]?.lootPool) pool = String(MONSTER_BESTIARY[bid].lootPool);
  return pool.trim();
}

/** @deprecated Используй {@link resolveMonsterLootPool}. */
export function resolveHarvestLootTableKey(monsterActorOrTableKey) {
  return resolveMonsterLootPool(monsterActorOrTableKey);
}
/** DC «Скрытности» для карманничества: чем выше ступень цели, тем сложнее. */
export function pickpocketDcForTier(tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  return Math.min(22, 8 + t * 2);
}

/** Живая цель для воровства (не «тушка» для разделки). */
export function isActorAliveForPickpocket(actor) {
  return !!actor && !isActorLootableCarcass(actor);
}

/**
 * Блок «Карманничество» в окне «Обыск».
 */
export function buildLootTransferPickpocketPresentation(leftActor, rightActor) {
  const isGm = !!game?.user?.isGM;
  const out = {
    showPickpocketPanel: false,
    canAttemptPickpocket: false,
    pickpocketMutedHint: "",
    pickpocketDc: 0,
    isGm,
    showPickpocketGmBypass: false,
  };

  if (!leftActor || !rightActor || leftActor.id === rightActor.id) return out;
  if (leftActor.type !== "character") return out;
  if (rightActor.type !== "npc") return out;

  if (rightActor.system?.info?.allowPickpocket === false) return out;

  if (!isActorAliveForPickpocket(rightActor)) return out;

  if (!npcHasEmbeddedLoot(rightActor)) return out;

  const pocketsDone = !!rightActor.getFlag?.("iron-hills-system", "pocketsLooted");
  if (pocketsDone) return out;

  const stealth = leftActor.system?.skills?.stealth;
  const tier = Math.max(1, Math.min(10, Number(rightActor.system?.info?.tier ?? 1)));
  const dc = pickpocketDcForTier(tier);

  out.showPickpocketPanel = true;
  out.pickpocketDc = dc;
  out.canAttemptPickpocket = !!stealth;
  if (!stealth) {
    out.pickpocketMutedHint = "На листе персонажа нет навыка «Скрытность».";
  }
  out.showPickpocketGmBypass = isGm;
  return out;
}

/** Монстр или NPC-животное может нести пул разделки / инвентарь. */
export const HARVEST_CARCASS_ACTOR_TYPES = Object.freeze(["monster", "npc"]);

/** Панель «Разделка»: мёртвый монстр — инвентарь добычи с шансами; мёртвый NPC — весь лист без навыков. */
export function actorHasHarvestLootTable(actor) {
  if (!actor) return false;
  if (actor.type === "monster") return monsterActorHasHarvestLootItems(actor);
  return actor.type === "npc" && npcHasEmbeddedLoot(actor);
}

/** Поверженное существо: все зоны HP = 0, или без сознания (для многозональных листов). */
export function isActorLootableCarcass(actor) {
  if (!actor) return false;
  if (!HARVEST_CARCASS_ACTOR_TYPES.includes(actor.type)) return false;

  const unc = Number(actor.system?.conditions?.unconscious ?? 0) > 0;
  const hp = actor.system?.resources?.hp;
  if (!hp) return unc;

  const hasZones = hp.torso != null || hp.head != null || hp.abdomen != null;
  if (hasZones) {
    const keys = ["head", "torso", "abdomen", "leftArm", "rightArm", "leftLeg", "rightLeg"];
    const allZero = keys.every((k) => Number(hp[k]?.value ?? 0) <= 0);
    return allZero || unc;
  }

  return Number(hp.value ?? 0) <= 0 || unc;
}

/**
 * Контекст для окна «Обыск»: показывать блок разделки между персонажем и тушкой.
 */
export function buildLootTransferHarvestPresentation(leftActor, rightActor) {
  const isGm = !!game?.user?.isGM;

  const out = {
    showHarvestPanel: false,
    canAttemptHarvest: false,
    harvestMutedHint: "",
    harvestDc: 0,
    harvestWildMode: true,
    isGm,
    showHarvestGmBypass: false,
  };

  if (!leftActor || !rightActor || leftActor.id === rightActor.id) return out;
  if (leftActor.type !== "character") return out;
  if (!HARVEST_CARCASS_ACTOR_TYPES.includes(rightActor.type)) return out;

  /** Монстр: разделка по встроенным слотам добычи. NPC — перенос листа. */
  const isMonster = rightActor.type === "monster";
  const isNpc = rightActor.type === "npc";
  const monsterHasHarvest = isMonster && monsterActorHasHarvestLootItems(rightActor);
  const npcCanStrip = isNpc && npcHasEmbeddedLoot(rightActor);
  if (!monsterHasHarvest && !npcCanStrip) return out;

  const looted = !!rightActor.getFlag?.("iron-hills-system", "carcassLooted");
  if (looted) return out;

  const corpseOk = isActorLootableCarcass(rightActor);
  const wildMode = isMonster;
  out.harvestWildMode = wildMode;
  const tool = wildMode ? findHarvestToolOnActor(leftActor) : null;
  const tier = resolveMonsterHarvestTier(rightActor);
  const dc = butcherDifficultyForTier(tier);

  out.showHarvestPanel = corpseOk;
  out.harvestDc = dc;

  if (!corpseOk) return out;

  if (!wildMode) {
    out.canAttemptHarvest = true;
    out.harvestMutedHint = "";
  } else {
    out.canAttemptHarvest = !!tool;
    if (!tool) {
      out.harvestMutedHint =
        "Нужен инструмент в инвентаре: «Набор разделки туши» или «Скрутка полевого мясника».";
    }
  }

  out.showHarvestGmBypass = isGm && corpseOk;

  return out;
}

async function markCarcassLootedIfApplicable(carcassActor, lootNames, { force } = {}) {
  if (!carcassActor?.setFlag) return;
  if (!force && !lootNames?.length) return;
  await carcassActor.setFlag("iron-hills-system", "carcassLooted", true).catch(() => {});
}

async function markPocketsLootedIfApplicable(targetActor, lootNames) {
  if (!targetActor?.setFlag || !lootNames?.length) return;
  if ((targetActor.items?.size ?? 0) === 0) {
    await targetActor.setFlag("iron-hills-system", "pocketsLooted", true).catch(() => {});
  }
}

async function grantMonsterHarvestFromCarcass(butcher, carcass, { partialHarvest = false, gmBypass = false } = {}) {
  if (!butcher?.id || !carcass?.id) return [];
  const pool = [...carcass.items.values()].filter((it) => it?.getFlag?.("iron-hills-system", "harvestLoot"));
  const names = [];
  for (const it of pool) {
    const live = carcass.items.get(it.id);
    if (!live) continue;
    let pct = Number(live.getFlag?.("iron-hills-system", "harvestChancePct") ?? 100);
    pct = Math.max(1, Math.min(100, pct));
    if (partialHarvest) pct = Math.max(8, Math.floor(pct * 0.52));
    const q = Math.max(1, Number(live.system?.quantity ?? 1));
    try {
      if (gmBypass || Math.random() * 100 < pct) {
        await transferItemQuantityBetweenActors(carcass, butcher, live, q);
        names.push(`${live.name}${q > 1 ? `×${q}` : ""}`);
      } else {
        await live.delete();
      }
    } catch (e) {
      console.warn("Iron Hills | harvest loot transfer failed", e);
      await live.delete().catch(() => {});
    }
  }
  await recalculateActorWeight(butcher).catch(() => {});
  await recalculateActorWeight(carcass).catch(() => {});
  return names;
}

/**
 * Выдать уже разрешённые строки лута.
 * @returns {Promise<string[]>} имена предметов
 */
export async function grantLootLines(actor, lines, meta = {}) {
  if (!actor?.id) return [];
  const names = [];

  for (const ln of lines) {
    const q = Math.max(1, Number(ln.qty) || 1);
    const data = itemDataFromLootLine({ ...ln, qty: q });
    if (!data) continue;
    const doc = await addItemToActorOrStack(actor, data);
    names.push(doc.name);
  }

  await recalculateActorWeight(actor);

  if (meta.silentLootChat) return names;

  const tag = meta.harvestSummary
    ? meta.harvestSummary
    : meta.sourceTag
      ? String(meta.sourceTag)
      : "";

  if (names.length) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div><b>${actor.name}</b> получает добычу: ${names.join(", ")}.${
        tag ? `<br><span style="opacity:0.72;font-size:11px;">${tag}</span>` : ""
      }</div>`,
    });
  }

  return names;
}

/** Бросок навыка «Выживание» против порога разделки. */
async function rollSurvivalButcher(actor, tool, dc) {
  const survival = actor.system?.skills?.survival;
  if (!survival) return { ok: false, total: 0, die: 0, toolBonus: 0, reason: "no_skill" };

  const skillVal = Math.max(1, Math.min(10, Number(survival.value ?? 1)));
  const die = Math.max(2, skillVal * 2);
  const toolTier = Math.max(1, Number(tool?.system?.tier ?? 1));
  const toolBonus = Math.min(2, Math.max(0, toolTier - 1));

  const roll = await new Roll(`1d${die} + ${toolBonus}`).evaluate();
  const total = Number(roll.total ?? 0);

  const ok = total >= dc;
  const margin = Math.max(2, Math.ceil(dc / 3));
  const partial = !ok && total >= dc - margin;

  return {
    ok,
    partial,
    total,
    die,
    toolBonus,
    dc,
    roll,
    reason: null,
  };
}

/** Бросок «Скрытности» для карманничества (как Выживание, без инструмента). */
async function rollStealthPick(actor, dc) {
  const st = actor.system?.skills?.stealth;
  if (!st) return { ok: false, total: 0, die: 0, dc, roll: null, reason: "no_skill" };

  const skillVal = Math.max(1, Math.min(10, Number(st.value ?? 1)));
  const die = Math.max(2, skillVal * 2);
  const roll = await new Roll(`1d${die}`).evaluate();
  const total = Number(roll.total ?? 0);
  const margin = Math.max(2, Math.ceil(dc / 3));
  const ok = total >= dc;
  const partial = !ok && total >= dc - margin;
  return { ok, partial, total, die, dc, roll, reason: null };
}

/**
 * Карманничество по живой цели-NPC.
 * @param {boolean} [opts.bypassPickpocketCheck] — только GM: выдать лут без проверки
 */
export async function pickpocketNpc(actor, targetNpc, opts = {}) {
  if (!actor) return { names: [], outcome: "no_actor" };
  if (!targetNpc || targetNpc.type !== "npc") {
    ui.notifications.warn("Карманничество доступно только к NPC.");
    return { names: [], outcome: "bad_target" };
  }

  if (targetNpc.getFlag?.("iron-hills-system", "pocketsLooted")) {
    ui.notifications.warn("Карманы этой цели уже пусты.");
    return { names: [], outcome: "already" };
  }

  if (!isActorAliveForPickpocket(targetNpc)) {
    ui.notifications.warn("С живой цели воруют: эта цель повержена — используй разделку / останки.");
    return { names: [], outcome: "not_alive_target" };
  }

  if (targetNpc.system?.info?.allowPickpocket === false) {
    ui.notifications.warn("У цели отключено карманничество.");
    return { names: [], outcome: "disabled" };
  }

  if (!npcHasEmbeddedLoot(targetNpc)) {
    ui.notifications.warn("На листе NPC нечего забирать — инвентарь пуст.");
    return { names: [], outcome: "disabled" };
  }

  const gmBypass = !!opts.bypassPickpocketCheck && !!game?.user?.isGM;
  const tier = Math.max(1, Math.min(10, Number(targetNpc.system?.info?.tier ?? 1)));
  const dc = pickpocketDcForTier(tier);
  const vName = targetNpc.name ?? "цель";

  const grantPickpocketLoot = async ({ partial }) =>
    stealOneRandomNpcInventoryQty(actor, targetNpc, { partial: !!partial });

  if (gmBypass) {
    const names = await transferAllEmbeddedInventoryTo(actor, targetNpc);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><i>GM:</i> карманничество без проверки — <b>${vName}</b> (инвентарь листа)${
        names.length ? ` — ${names.join(", ")}` : ""
      }</p>`,
    });
    await markPocketsLootedIfApplicable(targetNpc, names);
    return { names, outcome: "gm_bypass", dc };
  }

  const res = await rollStealthPick(actor, dc);
  if (res.reason === "no_skill") {
    ui.notifications.warn("Нет навыка «Скрытность».");
    return { names: [], outcome: "no_skill", dc };
  }

  const lineRoll = `<b>${res.total}</b> (1d${res.die} vs DC ${res.dc})`;
  let names = [];
  let outcome = "fail";

  if (res.ok) {
    names = await grantPickpocketLoot({});
    outcome = "full";
    await grantSkillExp(actor, "stealth", "Скрытность — карманничество", 4);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>Карманник:</b> ${actor.name} — удача ${lineRoll}; у <b>${vName}</b> пропадает: ${
        names.length ? names.join(", ") : "ничего ценного"
      }.</p>`,
    });
  } else if (res.partial) {
    names = await grantPickpocketLoot({ partial: true });
    outcome = "partial";
    await grantSkillExp(actor, "stealth", "Скрытность — карманничество", 2);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>Карманник:</b> ${actor.name} — на грани ${lineRoll}; у <b>${vName}</b> уводится: ${
        names.length ? names.join(", ") : "почти ничего"
      }.</p>`,
    });
  } else {
    await grantSkillExp(actor, "stealth", "Скрытность — карманничество", 1);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>Карманник пойман на глазу:</b> ${actor.name} ${lineRoll} — <b>${vName}</b> замечает попытку.</p>`,
    });
  }

  await markPocketsLootedIfApplicable(targetNpc, names);

  return { names, outcome, dc };
}

/**
 * Обыск тела NPC (весь инвентарь без проверок) или разделка мёртвого монстра (таблица + «Выживание»).
 * @param {object} opts
 * @param {boolean} [opts.bypassHarvestCheck] — только GM: выдать полный лут без проверки
 * @returns {Promise<{ names: string[], outcome: string, dc?: number }>}
 */
export async function harvestMonsterCarcass(actor, monsterActorOrTable, opts = {}) {
  if (!actor) return { names: [], outcome: "no_actor" };

  const carcassDoc =
    typeof monsterActorOrTable === "object" && monsterActorOrTable?.id ? monsterActorOrTable : null;

  if (carcassDoc?.getFlag?.("iron-hills-system", "carcassLooted")) {
    ui.notifications.warn("Эту тушу уже разделали.");
    return { names: [], outcome: "already_harvested" };
  }

  const gmBypass = !!opts.bypassHarvestCheck && !!game?.user?.isGM;

  const monName =
    typeof monsterActorOrTable === "object" && monsterActorOrTable?.name
      ? monsterActorOrTable.name
      : "добыча";

  const tier = resolveMonsterHarvestTier(monsterActorOrTable);
  const dc = butcherDifficultyForTier(tier);

  if (!gmBypass && carcassDoc && !isActorLootableCarcass(carcassDoc)) {
    ui.notifications.warn(
      "Обыск трупа или разделка — только с поверженной целью (HP по частям = 0 или без сознания). Живого монстра нельзя обыскать.",
    );
    return { names: [], outcome: "not_carcass" };
  }

  // ── NPC: только содержимое листа, без навыков и таблиц ──
  if (carcassDoc?.type === "npc") {
    const names = await transferAllEmbeddedInventoryTo(actor, carcassDoc);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>Обыск:</b> ${actor.name} обшаривает <b>${monName}</b>. ${
        names.length ? `Забирает: ${names.join(", ")}.` : "Подходящих вещей не находит."
      }</p>`,
    });
    await markCarcassLootedIfApplicable(carcassDoc, names, { force: true });
    return { names, outcome: "npc_inventory", dc };
  }

  // ── Монстр: встроенные слоты добычи на листе, шанс при каждой разделке ──
  if (!monsterActorHasHarvestLootItems(carcassDoc)) {
    ui.notifications.warn(
      "У монстра нет разделочной добычи на листе. GM: синхронизируй компендиум монстров после обновления системы.",
    );
    return { names: [], outcome: "no_harvest_slots" };
  }

  if (gmBypass) {
    const names = await grantMonsterHarvestFromCarcass(actor, carcassDoc, { gmBypass: true });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><i>GM:</i> разделка без проверки — <b>${monName}</b>${names.length ? ` — ${names.join(", ")}` : ""}</p>`,
    });
    await markCarcassLootedIfApplicable(carcassDoc, names);
    return { names, outcome: "gm_bypass", dc };
  }

  const tool = findHarvestToolOnActor(actor);
  if (!tool) {
    ui.notifications.warn("Нужен инструмент разделки («Набор разделки туши» или «Скрутка полевого мясника») в инвентаре.");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>${actor.name}</b> не может разделать <b>${monName}</b> — нет набора разделки.</p>`,
    });
    return { names: [], outcome: "no_tool", dc };
  }

  const skillSnap = actor.system?.skills?.survival;
  if (!skillSnap) {
    ui.notifications.warn("На листе нет навыка «Выживание».");
    return { names: [], outcome: "no_skill", dc };
  }

  const res = await rollSurvivalButcher(actor, tool, dc);
  const inner = `1d${res.die}${res.toolBonus > 0 ? ` + ${res.toolBonus}` : ""}`;
  const lineRoll = `<b>${res.total}</b> (${inner} vs DC ${res.dc})`;

  let names = [];
  let outcome = "fail";

  if (res.ok) {
    names = await grantMonsterHarvestFromCarcass(actor, carcassDoc, { partialHarvest: false });
    outcome = "full";
    await grantSkillExp(actor, "survival", "Выживание — разделка", 4);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>Разделка:</b> ${actor.name} — удача ${lineRoll}; добыча с <b>${monName}</b> богаче.</p>`,
    });
  } else if (res.partial) {
    names = await grantMonsterHarvestFromCarcass(actor, carcassDoc, { partialHarvest: true });
    outcome = "partial";
    await grantSkillExp(actor, "survival", "Выживание — разделка", 2);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>Разделка:</b> ${actor.name} — средне ${lineRoll}; с <b>${monName}</b> уходит лишь часть трофеев.</p>`,
    });
  } else {
    await grantSkillExp(actor, "survival", "Выживание — разделка", 1);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<p><b>Разделка провалена:</b> ${actor.name} ${lineRoll} — <b>${monName}</b> порчена или ускользает.</p>`,
    });
  }

  await markCarcassLootedIfApplicable(carcassDoc, names);

  return { names, outcome, dc };
}

export async function grantMonsterLootTo(actor, monsterActorOrTable, opts = {}) {
  if (!actor) return [];

  const carcassDoc =
    typeof monsterActorOrTable === "object" && monsterActorOrTable?.id ? monsterActorOrTable : null;

  if (opts.skipHarvestCheck === true) {
    if (carcassDoc?.type === "npc") {
      return transferAllEmbeddedInventoryTo(actor, carcassDoc);
    }
    if (carcassDoc?.type === "monster") {
      return grantMonsterHarvestFromCarcass(actor, carcassDoc, { gmBypass: true });
    }
    ui.notifications.warn("Нужен лист монстра или NPC для выдачи добычи.");
    return [];
  }

  const r = await harvestMonsterCarcass(actor, monsterActorOrTable, opts);
  return r.names ?? [];
}

export function monsterRowToActorData(row) {
  const hp = allocateMonsterHpParts(row.hpPool);
  const skillObj = Object.fromEntries(
    Object.entries(row.skills ?? {}).map(([k, v]) => [
      k,
      { value: Number(v) || 1, exp: 0 },
    ])
  );
  const ar = row.armor ?? {};
  const poolKey = String(row.lootPool ?? row.lootTable ?? "").trim();
  return {
    name: row.label,
    type: "monster",
    img: row.img ?? "icons/svg/mystery-man.svg",
    items: buildMonsterHarvestEmbeddedItemData(poolKey),
    system: {
      combat: row.combat,
      initiative: Number(row.initiative ?? 10),
      info: {
        role: row.id ?? "",
        tier: Number(row.tier ?? 1),
        faction: "",
        desc: row.desc ?? "",
        lootPool: poolKey,
        bestiaryId: row.id ?? "",
      },
      resources: {
        hp,
        armor: {
          physical: Number(ar.physical ?? 0),
          magical: Number(ar.magical ?? 0),
        },
        energy: {
          value: Number(row.energy ?? 10),
          max: Number(row.energy ?? 10),
          baseMax: Number(row.energy ?? 10),
        },
        mana: {
          value: Number(row.mana ?? 0),
          max: Number(row.mana ?? 0),
          baseMax: Number(row.mana ?? 0),
        },
      },
      skills: skillObj,
      conditions: {
        stunned: 0,
        poison: 0,
        burning: 0,
        hasted: 0,
        slowed: 0,
        unconscious: 0,
      },
      loot: [],
    },
  };
}

/**
 * Конвертирует запись каталога фляги в Item (consumable + заряды).
 * `initialCharges` опционально: по умолчанию полная ёмкость.
 */
export function buildDrinkVesselItemData(vesselCatalogId, { initialCharges } = {}) {
  const v = DRINK_VESSELS[String(vesselCatalogId ?? "")];
  if (!v) return null;
  const max = Math.max(1, Number(v.vesselMax ?? 1));
  const filled = Math.min(
    max,
    Math.max(
      0,
      initialCharges !== undefined && initialCharges !== null
        ? Number(initialCharges)
        : max
    )
  );
  const img = `systems/iron-hills-system/icons/items/consumables/${v.id}.webp`;

  const baseWt = Number(v.weight ?? 0.35);
  const hydratedExtra = filled * 0.02;

  return {
    name: v.label,
    type: "consumable",
    img,
    flags: {
      "iron-hills-system": {
        catalogId: v.id,
        kind: "drink_vessel",
      },
    },
    system: {
      tier: Number(v.tier ?? 1),
      quality: "common",
      weight: baseWt + hydratedExtra,
      quantity: 1,
      power: Number(v.vesselHydrationPerDrink ?? 10),
      actionType: "drink-vessel",
      applicationScope: "global",
      targetActorMode: "self",
      vesselMax: max,
      vesselCurrent: filled,
      vesselHydrationPerDrink: Number(v.vesselHydrationPerDrink ?? 0),
      vesselSatietyPerDrink: Number(v.vesselSatietyPerDrink ?? 0),
      vesselLiquidLabel: String(v.vesselLiquidLabel ?? "Вода"),
      gridW: 1,
      gridH: 2,
      value: Number(v.value ?? 4),
    },
  };
}

/**
 * GM: можно вызвать с { force:true } («мы у воды» без POI на сцене).
 * Если передан poiActor типа poi — нужен флаг info.hasFreshWater.
 */
export async function refillActorVessels(actor, opts = {}) {
  if (!actor) return { updated: 0 };

  let allowed = !!opts.force || game.user?.isGM;

  const poi = opts.poiActor;
  if (!allowed && poi?.type === "poi" && poi.system?.info?.hasFreshWater) {
    allowed = true;
  }

  if (!allowed) {
    ui.notifications.warn(
      "Пополнение фляг: включи галочку «Свежая вода» на POI‑акторе, или ведущий вызывает refill с { force:true }.",
    );
    return { updated: 0 };
  }

  let updated = 0;

  for (const it of actor.items ?? []) {
    if (it.type !== "consumable") continue;

    const max = Number(it.system?.vesselMax ?? 0);
    if (!(max > 0)) continue;

    const cur = Number(it.system?.vesselCurrent ?? 0);
    const fillAmt = Math.max(0, max - cur);
    if (fillAmt <= 0) continue;

    const baseWt = Math.max(
      0.1,
      Number(it.system?.weight ?? 0.35) - (cur * 0.02),
    );
    const label = String(it.system?.vesselLiquidLabel ?? "Вода") || "Вода";

    await it.update({
      "system.vesselCurrent": max,
      "system.vesselLiquidLabel": label,
      "system.weight": baseWt + max * 0.02,
    });
    updated++;
  }

  await recalculateActorWeight(actor);
  if (updated > 0) {
    ui.notifications.info(`Обновлено ёмкостей для питья: ${updated}.`);
  } else {
    ui.notifications.info("Нечего пополнять (фляги полные или нет подходящих предметов).");
  }

  return { updated };
}
