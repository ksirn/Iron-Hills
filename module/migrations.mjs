/**
 * Iron Hills — World Migrations
 *
 * Все одноразовые миграции мирового состояния (актеры, предметы) живут здесь.
 * Каждая миграция:
 *   - имеет уникальный id;
 *   - идемпотентна по своему действию (повторный запуск не должен ломать данные);
 *   - запускается ровно один раз для мира (трекер хранится в settings).
 *
 * Запуск: импортировать `runWorldMigrations` и вызвать в Hooks.once("ready").
 * Только GM выполняет миграции — клиенты выходят сразу.
 */

import { debugLog } from "./utils/debug-utils.mjs";

const SETTING_KEY = "schemaState";
const SETTING_NS  = "iron-hills-system";

const DURABILITY_BY_TIER = {
  1: 15, 2: 25, 3: 40, 4: 65, 5: 100,
  6: 140, 7: 185, 8: 230, 9: 265, 10: 300,
};

function getDurabilityByTier(tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  return DURABILITY_BY_TIER[t] ?? 100;
}

/** Регистрация хранилища применённых миграций. Вызывать в Hooks.once("init"). */
export function registerMigrationSettings() {
  game.settings.register(SETTING_NS, SETTING_KEY, {
    name:    "Iron Hills schema state",
    scope:   "world",
    config:  false,
    type:    Object,
    default: { applied: [] },
  });
}

async function readSchemaState() {
  try {
    return foundry.utils.deepClone(
      game.settings.get(SETTING_NS, SETTING_KEY) ?? { applied: [] }
    );
  } catch (_err) {
    return { applied: [] };
  }
}

async function writeSchemaState(state) {
  try {
    await game.settings.set(SETTING_NS, SETTING_KEY, state);
  } catch (err) {
    console.warn("Iron Hills | failed to persist schema state", err);
  }
}

// ── Миграции ──────────────────────────────────────────────

/**
 * Унификация частей тела: добавить abdomen актерам, у которых его нет.
 * До этой миграции некоторые актеры жили без живота как отдельной зоны.
 */
async function migrateAbdomen() {
  for (const actor of game.actors ?? []) {
    try {
      const hp = actor.system?.resources?.hp;
      if (!hp || hp.abdomen !== undefined) continue;
      await actor.update({
        "system.resources.hp.abdomen": { value: 25, max: 25 }
      });
      debugLog("migrations:abdomen", { actor: actor.name });
    } catch (err) {
      console.error("Iron Hills | migration:abdomen", actor?.name, err);
    }
  }
}

/**
 * Резерв души — добавить только тем character'ам у которых блока ещё нет.
 */
async function migrateSoulReserveBlock() {
  for (const actor of game.actors ?? []) {
    try {
      if (actor.type !== "character") continue;
      const sr = actor.system?.resources?.soulReserve;
      if (sr !== undefined) continue;
      await actor.update({
        "system.resources.soulReserve": { mana: 0, energy: 0, daysSinceDeath: 0 }
      });
      debugLog("migrations:soulReserve", { actor: actor.name });
    } catch (err) {
      console.error("Iron Hills | migration:soulReserve", actor?.name, err);
    }
  }
}

/**
 * Старая monster-структура NPC (одна полоска hp.value) → новые части тела.
 * Также устанавливает baseThreshold по умолчанию.
 */
async function migrateNpcStructure() {
  for (const actor of game.actors ?? []) {
    try {
      if (actor.type !== "npc") continue;
      const updates = {};
      const hp = actor.system?.resources?.hp;

      if (hp && hp.value !== undefined && hp.torso === undefined) {
        const baseHp = Number(hp.value ?? 30);
        updates["system.resources.hp"] = {
          head:     { value: Math.ceil(baseHp * 0.25), max: Math.ceil(baseHp * 0.25) },
          torso:    { value: Math.ceil(baseHp * 0.50), max: Math.ceil(baseHp * 0.50) },
          abdomen:  { value: Math.ceil(baseHp * 0.40), max: Math.ceil(baseHp * 0.40) },
          leftArm:  { value: Math.ceil(baseHp * 0.30), max: Math.ceil(baseHp * 0.30) },
          rightArm: { value: Math.ceil(baseHp * 0.30), max: Math.ceil(baseHp * 0.30) },
          leftLeg:  { value: Math.ceil(baseHp * 0.35), max: Math.ceil(baseHp * 0.35) },
          rightLeg: { value: Math.ceil(baseHp * 0.35), max: Math.ceil(baseHp * 0.35) },
        };
      }

      if (actor.system?.combat?.baseThreshold === undefined) {
        updates["system.combat.baseThreshold"] = 4;
      }

      if (actor.system?.resources?.hp?.torso !== undefined &&
          actor.system?.resources?.hp?.abdomen === undefined) {
        updates["system.resources.hp.abdomen"] = { value: 25, max: 25 };
      }

      if (Object.keys(updates).length) {
        await actor.update(updates);
        debugLog("migrations:npc-structure", { actor: actor.name });
      }
    } catch (err) {
      console.error("Iron Hills | migration:npc-structure", actor?.name, err);
    }
  }
}

/**
 * Прочность существующим weapon/armor/tool у акторов.
 * Назначает по таблице тира, если durability ещё не задана.
 */
async function migrateDurability() {
  const DURABLE = new Set(["weapon", "armor", "tool"]);
  for (const actor of game.actors ?? []) {
    for (const item of actor.items ?? []) {
      try {
        if (!DURABLE.has(item.type)) continue;
        if (item.system?.durability !== undefined) continue;
        const maxDur = getDurabilityByTier(item.system?.tier);
        await item.update({
          "system.durability": { value: maxDur, max: maxDur }
        });
        debugLog("migrations:durability", { actor: actor.name, item: item.name });
      } catch (err) {
        console.error("Iron Hills | migration:durability", actor?.name, item?.name, err);
      }
    }
  }
}

/**
 * Унификация модели применения предметов (consumable/potion/spell/scroll).
 * Удаляет легаси-поля medicalAction/effectType/effectType2 и переносит их
 * в actionType/applicationScope/targetPart.
 */
async function migrateUnifiedTargetingForItem(item) {
  if (!item) return;
  const supportedTypes = new Set(["consumable", "potion", "spell", "scroll"]);
  if (!supportedTypes.has(item.type)) return;

  const system = item.system ?? {};
  const updates = {};

  if (system.actionType === undefined) {
    updates["system.actionType"] = "";
  }
  if (system.applicationScope === undefined ||
      system.applicationScope === null ||
      system.applicationScope === "") {
    updates["system.applicationScope"] = item.type === "potion" ? "global" : "targeted";
  }
  if (system.targetPart === undefined || system.targetPart === null) {
    updates["system.targetPart"] = "";
  }

  const currentActionType = String(system.actionType ?? "").trim();
  const legacyMedicalAction = String(system.medicalAction ?? "").trim();
  const legacyEffectType = String(system.effectType ?? "").trim();

  if (!currentActionType) {
    if (legacyMedicalAction) {
      updates["system.actionType"] = legacyMedicalAction;
    } else if (legacyEffectType) {
      if (legacyEffectType === "reduceBleeding") updates["system.actionType"] = "bandage";
      else if (legacyEffectType === "restoreEnergy") updates["system.actionType"] = "restore-energy";
      else if (legacyEffectType === "restoreMana") updates["system.actionType"] = "restore-mana";
      else if (legacyEffectType === "healHP") updates["system.actionType"] = "heal-body";
      else if (legacyEffectType === "heal") {
        updates["system.actionType"] = system.targetPart ? "heal-part" : "heal-body";
      }
    }
  }

  if (system.medicalAction !== undefined) updates["system.-=medicalAction"] = null;
  if (system.effectType !== undefined)    updates["system.-=effectType"]    = null;
  if (system.effectType2 !== undefined)   updates["system.-=effectType2"]   = null;

  if (Object.keys(updates).length) {
    await item.update(updates);
  }
}

async function migrateUnifiedTargeting() {
  for (const item of game.items ?? []) {
    try { await migrateUnifiedTargetingForItem(item); }
    catch (err) { console.error("Iron Hills | migration:unifiedTargeting (world item)", item?.name, err); }
  }
  for (const actor of game.actors ?? []) {
    for (const item of actor.items ?? []) {
      try { await migrateUnifiedTargetingForItem(item); }
      catch (err) { console.error("Iron Hills | migration:unifiedTargeting (embedded)", actor?.name, item?.name, err); }
    }
  }
}

/**
 * Синхронизация max резерва души с фактическим max энергии/маны.
 * Применяется только к character'ам.
 */
async function migrateSoulReserveMaxSync() {
  for (const actor of game.actors ?? []) {
    if (actor.type !== "character") continue;

    const res       = actor.system?.resources ?? {};
    const energyMax = Number(res.energy?.max ?? 10);
    const manaMax   = Number(res.mana?.max   ?? 10);
    const soul      = res.soul ?? {};

    const curEnMax = Number(soul.energyReserve?.max ?? 0);
    const curMnMax = Number(soul.manaReserve?.max   ?? 0);
    const curEnVal = Number(soul.energyReserve?.value ?? 0);
    const curMnVal = Number(soul.manaReserve?.value   ?? 0);

    const updates = {};
    if (curEnMax !== energyMax) {
      updates["system.resources.soul.energyReserve.max"] = energyMax;
      if (curEnVal >= curEnMax) updates["system.resources.soul.energyReserve.value"] = energyMax;
    }
    if (curMnMax !== manaMax) {
      updates["system.resources.soul.manaReserve.max"] = manaMax;
      if (curMnVal >= curMnMax) updates["system.resources.soul.manaReserve.value"] = manaMax;
    }

    if (Object.keys(updates).length) {
      try {
        await actor.update(updates);
        debugLog("migrations:soulReserve-max", { actor: actor.name, updates });
      } catch (err) {
        console.error("Iron Hills | migration:soulReserve-max", actor?.name, err);
      }
    }
  }
}

/**
 * Унификация таксономии скилов: bows→bow, crossbows→crossbow,
 * shields→shield, swords→sword. Переносит лучшие value/exp/expNext,
 * затем удаляет старые ключи.
 */
const SKILL_RENAMES = Object.freeze({
  bows:      "bow",
  crossbows: "crossbow",
  shields:   "shield",
  swords:    "sword",
});

// Скилы, которых больше нет в template.json — удаляем при миграции.
// Помечены как мёртвые: ни код, ни UI их не читает.
const SKILL_DELETIONS = Object.freeze(["armor"]);

async function migrateSkillTaxonomy() {
  for (const actor of game.actors ?? []) {
    try {
      const skills = actor.system?.skills;
      if (!skills) continue;

      const updates = {};
      let dirty = false;

      for (const [oldKey, newKey] of Object.entries(SKILL_RENAMES)) {
        const oldNode = skills[oldKey];
        if (!oldNode) continue;
        dirty = true;

        const newNode = skills[newKey] ?? { value: 1, exp: 0 };
        const merged = {
          value: Math.max(Number(oldNode.value ?? 1), Number(newNode.value ?? 1)),
          exp:   Math.max(Number(oldNode.exp   ?? 0), Number(newNode.exp   ?? 0)),
        };
        if (oldNode.expNext !== undefined || newNode.expNext !== undefined) {
          merged.expNext = Math.max(
            Number(oldNode.expNext ?? 25),
            Number(newNode.expNext ?? 25),
          );
        }

        updates[`system.skills.${newKey}`] = merged;
        updates[`system.skills.-=${oldKey}`] = null;
      }

      for (const deadKey of SKILL_DELETIONS) {
        if (skills[deadKey] !== undefined) {
          updates[`system.skills.-=${deadKey}`] = null;
          dirty = true;
        }
      }

      // Дополнительно: items со старым system.skill = "bows"|"crossbows"|"swords"|"shields"
      for (const item of actor.items ?? []) {
        const skill = item.system?.skill;
        if (skill && SKILL_RENAMES[skill]) {
          try {
            await item.update({ "system.skill": SKILL_RENAMES[skill] });
            debugLog("migrations:skill-taxonomy/item", {
              actor: actor.name, item: item.name, from: skill, to: SKILL_RENAMES[skill]
            });
          } catch (err) {
            console.error("Iron Hills | migration:skill-taxonomy item", actor?.name, item?.name, err);
          }
        }
      }

      if (dirty) {
        await actor.update(updates);
        debugLog("migrations:skill-taxonomy/actor", { actor: actor.name });
      }
    } catch (err) {
      console.error("Iron Hills | migration:skill-taxonomy", actor?.name, err);
    }
  }

  // World-level items тоже мигрируем
  for (const item of game.items ?? []) {
    try {
      const skill = item.system?.skill;
      if (skill && SKILL_RENAMES[skill]) {
        await item.update({ "system.skill": SKILL_RENAMES[skill] });
        debugLog("migrations:skill-taxonomy/world-item", {
          item: item.name, from: skill, to: SKILL_RENAMES[skill]
        });
      }
    } catch (err) {
      console.error("Iron Hills | migration:skill-taxonomy world item", item?.name, err);
    }
  }
}

// ── Реестр миграций (порядок имеет значение) ──────────────

const MIGRATIONS = [
  { id: "2026-01-abdomen",                run: migrateAbdomen,                label: "abdomen HP" },
  { id: "2026-01-soul-reserve-block",     run: migrateSoulReserveBlock,       label: "soulReserve block" },
  { id: "2026-01-npc-structure",          run: migrateNpcStructure,           label: "NPC structure" },
  { id: "2026-01-durability",             run: migrateDurability,             label: "item durability" },
  { id: "2026-01-unified-targeting",      run: migrateUnifiedTargeting,       label: "unified targeting" },
  { id: "2026-01-soul-reserve-max-sync",  run: migrateSoulReserveMaxSync,     label: "soulReserve max sync" },
  { id: "2026-04-skill-taxonomy",         run: migrateSkillTaxonomy,          label: "skill taxonomy unification" },
];

/**
 * Главная точка входа. Идемпотентно прогоняет все миграции, не запущенные ранее.
 * Вызывать в Hooks.once("ready"). Только GM применяет миграции.
 */
export async function runWorldMigrations() {
  if (!game.user?.isGM) return;

  const state = await readSchemaState();
  const applied = new Set(state.applied ?? []);
  let changed = false;

  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    try {
      console.log(`Iron Hills | migrations: running "${m.label}" (${m.id})`);
      await m.run();
      applied.add(m.id);
      changed = true;
    } catch (err) {
      console.error(`Iron Hills | migrations: "${m.label}" failed`, err);
      // Не помечаем как applied — повторим при следующем запуске
    }
  }

  if (changed) {
    await writeSchemaState({ applied: [...applied] });
    ui.notifications?.info?.("Iron Hills: миграции данных применены.");
  }
}

/**
 * Принудительный повторный прогон конкретной миграции из консоли:
 *   await game.ironHills.migrations.runOne("2026-04-skill-taxonomy")
 */
export async function runOneMigration(id) {
  const m = MIGRATIONS.find(x => x.id === id);
  if (!m) {
    ui.notifications?.warn?.(`Migration "${id}" не найдена.`);
    return;
  }
  await m.run();
  ui.notifications?.info?.(`Migration "${m.label}" выполнена повторно.`);
}

/** Список всех миграций — для UI/консоли. */
export function listMigrations() {
  return MIGRATIONS.map(m => ({ id: m.id, label: m.label }));
}
