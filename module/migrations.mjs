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
import { STARTER_RECIPE_IDS } from "./constants/craft-knowledge.mjs";
import { MONSTER_BESTIARY } from "./constants/monster-bestiary.mjs";
import { SPELL_SCHOOL_KEYS, normalizeSpellSchoolKey } from "./constants/spells-catalog.mjs";
import { getMonsterHarvestDropLines } from "./constants/monster-loot-pools.mjs";
import { syncNpcPackLootFromProfiles } from "./compendium-builder.mjs";
import {
  buildMonsterHarvestEmbeddedItemData,
  monsterActorHasHarvestLootItems,
} from "./utils/monster-harvest-items.mjs";
import { normalizeItemActionSystem } from "./utils/item-runtime-normalization.mjs";

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
        "system.resources.hp.abdomen": { value: 70, max: 70 }
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
        const HP_UNIT = 440;
        const cell = n => {
          const mx = Math.max(1, Math.round((n / HP_UNIT) * baseHp));
          return { value: mx, max: mx };
        };
        updates["system.resources.hp"] = {
          head:     cell(35),
          torso:    cell(85),
          abdomen:  cell(70),
          leftArm:  cell(60),
          rightArm: cell(60),
          leftLeg:  cell(65),
          rightLeg: cell(65),
        };
      }

      if (actor.system?.combat?.baseThreshold === undefined) {
        updates["system.combat.baseThreshold"] = 4;
      }

      if (actor.system?.resources?.hp?.torso !== undefined &&
          actor.system?.resources?.hp?.abdomen === undefined) {
        updates["system.resources.hp.abdomen"] = { value: 70, max: 70 };
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
 * Переносит легаси-поля medicalAction/effectType/effectType2
 * в actionType/applicationScope/targetPart.
 * effectType сохраняется как runtime fallback для заклинаний, свитков и старых предметов.
 */
async function migrateUnifiedTargetingForItem(item) {
  if (!item) return;
  const supportedTypes = new Set(["consumable", "potion", "spell", "scroll"]);
  if (!supportedTypes.has(item.type)) return;

  const system = item.system ?? {};
  const updates = {};
  const normalizedSystem = { ...system };
  const legacyMedicalAction = String(system.medicalAction ?? "").trim();
  if (legacyMedicalAction && !String(normalizedSystem.effectType ?? normalizedSystem.effect ?? "").trim()) {
    normalizedSystem.effectType = legacyMedicalAction;
  }
  if (legacyMedicalAction && !String(normalizedSystem.actionType ?? "").trim()) {
    normalizedSystem.actionType = legacyMedicalAction;
  }
  normalizeItemActionSystem(normalizedSystem, {
    type: item.type,
    targetPart: item.type === "consumable" ? "" : "torso",
  });

  if (system.actionType === undefined) {
    updates["system.actionType"] = normalizedSystem.actionType ?? "";
  }
  if (system.applicationScope === undefined ||
      system.applicationScope === null ||
      system.applicationScope === "") {
    updates["system.applicationScope"] = normalizedSystem.applicationScope ?? (item.type === "potion" ? "global" : "targeted");
  }
  if (system.targetPart === undefined || system.targetPart === null) {
    updates["system.targetPart"] = normalizedSystem.targetPart ?? "";
  }

  for (const key of ["effect", "effectType", "actionType", "applicationScope", "targetActorMode", "targetPart"]) {
    if (normalizedSystem[key] !== undefined && normalizedSystem[key] !== system[key]) {
      updates[`system.${key}`] = normalizedSystem[key];
    }
  }

  for (const key of ["conditionKey", "conditionMode", "conditionValueKind", "duration"]) {
    if (normalizedSystem[key] !== undefined && normalizedSystem[key] !== system[key]) {
      updates[`system.${key}`] = normalizedSystem[key];
    }
  }

  if (system.medicalAction !== undefined) updates["system.-=medicalAction"] = null;
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

// Canonical magic schools are the spell catalog keys. Legacy keys stay readable,
// but actors get canonical skill nodes so future exp goes to the visible skills.
const CANONICAL_MAGIC_SKILL_ALIASES = Object.freeze({
  ice: ["water"],
  lightning: ["air"],
  light: ["life", "holy"],
  shadow: ["life", "mind"],
  summon: ["life", "mind"],
});

function mergeSkillNodes(nodes) {
  const validNodes = nodes.filter(Boolean);
  const merged = {
    value: 1,
    exp: 0,
    expNext: 25,
  };

  for (const node of validNodes) {
    merged.value = Math.max(merged.value, Number(node.value ?? 1));
    merged.exp = Math.max(merged.exp, Number(node.exp ?? 0));
    merged.expNext = Math.max(merged.expNext, Number(node.expNext ?? 25));
  }

  return merged;
}

function skillNodeChanged(current, next) {
  if (!current) return true;
  return Number(current.value ?? 1) !== Number(next.value ?? 1)
    || Number(current.exp ?? 0) !== Number(next.exp ?? 0)
    || Number(current.expNext ?? 25) !== Number(next.expNext ?? 25);
}

async function migrateSpellItemSchoolsInCollection(items, context = {}) {
  for (const item of items ?? []) {
    try {
      if (item.type !== "spell" && item.type !== "scroll") continue;
      const current = String(item.system?.school ?? "").trim();
      const normalized = normalizeSpellSchoolKey(current, { fallback: current });
      if (!normalized || normalized === current) continue;
      await item.update({ "system.school": normalized });
      debugLog("migrations:canonical-magic-school/item", {
        ...context,
        item: item.name,
        from: current,
        to: normalized,
      });
    } catch (err) {
      console.error("Iron Hills | migration:canonical-magic-school item", context?.actor, item?.name, err);
    }
  }
}

async function migrateCanonicalMagicSkills2026() {
  for (const actor of game.actors ?? []) {
    try {
      const skills = actor.system?.skills;
      if (skills) {
        const updates = {};

        for (const key of SPELL_SCHOOL_KEYS) {
          const aliases = CANONICAL_MAGIC_SKILL_ALIASES[key] ?? [];
          const merged = mergeSkillNodes([
            skills[key],
            ...aliases.map(alias => skills[alias]),
          ]);

          if (skillNodeChanged(skills[key], merged)) {
            updates[`system.skills.${key}`] = merged;
          }
        }

        if (Object.keys(updates).length) {
          await actor.update(updates);
          debugLog("migrations:canonical-magic-school/actor-skills", { actor: actor.name });
        }
      }

      await migrateSpellItemSchoolsInCollection(actor.items, { actor: actor.name });
    } catch (err) {
      console.error("Iron Hills | migration:canonical-magic-school actor", actor?.name, err);
    }
  }

  await migrateSpellItemSchoolsInCollection(game.items, { actor: null });
}

/** Старый шаблон HP (10/30/25/20×4) → распределение как в бою (35/85/70/60×2/65×2). */
async function migrateBodyPartHpTarkov2026() {
  for (const actor of game.actors ?? []) {
    try {
      if (actor.type !== "character" && actor.type !== "npc") continue;
      if (actor.getFlag?.("iron-hills-system", "hpZonesTarkovApr2026")) continue;

      const hp = actor.system?.resources?.hp;
      if (!hp?.torso?.max || hp.head === undefined) continue;

      const tMax = Number(hp.torso.max);
      const hMax = Number(hp.head?.max ?? 0);
      const aMax = Number(hp.abdomen?.max ?? NaN);
      const isClassicTemplate = tMax === 30 && hMax === 10;
      const isClassicWithAbdomen = tMax === 30 && Number.isFinite(aMax) && aMax === 25;
      if (!isClassicTemplate && !isClassicWithAbdomen) continue;

      const scalePart = (key, newMax) => {
        const p = hp[key];
        if (!p || p.max === undefined) return {};
        const ratio = Number(p.value ?? p.max) / Math.max(1, Number(p.max));
        const v = Math.min(newMax, Math.max(0, Math.round(newMax * ratio)));
        return { [`system.resources.hp.${key}`]: { value: v, max: newMax } };
      };

      const merged = {
        ...scalePart("head", 35),
        ...scalePart("torso", 85),
        ...scalePart("abdomen", 70),
        ...scalePart("leftArm", 60),
        ...scalePart("rightArm", 60),
        ...scalePart("leftLeg", 65),
        ...scalePart("rightLeg", 65),
      };
      if (hp.abdomen === undefined) {
        merged["system.resources.hp.abdomen"] = { value: 70, max: 70 };
      }

      await actor.update(merged);
      await actor.setFlag("iron-hills-system", "hpZonesTarkovApr2026", true);
      debugLog("migrations:hp-tarkov", { actor: actor.name });
    } catch (err) {
      console.error("Iron Hills | migration:hp-tarkov", actor?.name, err);
    }
  }
}

/** Старый урон без оружия: 1 / 2 / 5 → ×5. */
async function migrateUnarmedDamageScale2026() {
  for (const actor of game.actors ?? []) {
    try {
      if (!["character", "npc", "monster"].includes(actor.type)) continue;
      const u = Number(actor.system?.combat?.unarmedDamage);
      let next = null;
      if (actor.type === "character" && u === 1) next = 5;
      else if (actor.type === "npc" && u === 2) next = 10;
      else if (actor.type === "monster" && u === 5) next = 25;
      if (next == null) continue;
      await actor.update({ "system.combat.unarmedDamage": next });
      debugLog("migrations:unarmed-scale", { actor: actor.name, next });
    } catch (err) {
      console.error("Iron Hills | migration:unarmed-scale", actor?.name, err);
    }
  }
}

/** Персонажи без system.craft.knownRecipeIds получают деревенский минимум (до обучения новым). */
async function migrateCraftKnowledgeStarter() {
  for (const actor of game.actors ?? []) {
    try {
      if (actor.type !== "character") continue;
      const kr = actor.system?.craft?.knownRecipeIds;
      if (Array.isArray(kr)) continue;
      await actor.update({
        "system.craft.knownRecipeIds": [...STARTER_RECIPE_IDS],
      });
      debugLog("migrations:craft-knowledge", { actor: actor.name });
    } catch (err) {
      console.error("Iron Hills | migration:craft-knowledge", actor?.name, err);
    }
  }
}

/** POI: источник воды; монстр: поля лута в system.info. */
async function migrateWildernessSurvival2026() {
  for (const actor of game.actors ?? []) {
    try {
      if (actor.type === "poi") {
        const cur = actor.system?.info?.hasFreshWater;
        if (cur !== undefined) continue;
        await actor.update({ "system.info.hasFreshWater": false });
        continue;
      }
      if (actor.type !== "monster") continue;
      const info = actor.system?.info ?? {};
      const patch = {};
      if (info.desc === undefined) patch["system.info.desc"] = "";
      if (info.lootPool === undefined) patch["system.info.lootPool"] = "";
      if (info.lootTable === undefined) patch["system.info.lootTable"] = "";
      if (info.bestiaryId === undefined) patch["system.info.bestiaryId"] = "";
      if (Object.keys(patch).length) await actor.update(patch);
    } catch (err) {
      console.error("Iron Hills | migration:wilderness-survival", actor?.name, err);
    }
  }
}

/** NPC: поля лута / карманничества для «Обыск». */
async function migrateNpcLootFields202604() {
  for (const actor of game.actors ?? []) {
    try {
      if (actor.type !== "npc") continue;
      const info = actor.system?.info ?? {};
      const patch = {};
      if (info.desc === undefined) patch["system.info.desc"] = "";
      if (info.notes === undefined) patch["system.info.notes"] = "";
      if (info.lootTable === undefined) patch["system.info.lootTable"] = "";
      if (info.bestiaryId === undefined) patch["system.info.bestiaryId"] = "";
      if (info.corpseLootMode === undefined) patch["system.info.corpseLootMode"] = "wild";
      if (info.allowPickpocket === undefined) patch["system.info.allowPickpocket"] = true;
      if (info.pickpocketTable === undefined) patch["system.info.pickpocketTable"] = "";
      if (Object.keys(patch).length) await actor.update(patch);
    } catch (err) {
      console.error("Iron Hills | migration:npc-loot-fields", actor?.name, err);
    }
  }
}

/** Однократно: ih-npc — role/loot из профилей (волк и др. без lootTable после старых сборок). */
async function migrateNpcCompendiumLootFromProfilesOnce() {
  try {
    const r = await syncNpcPackLootFromProfiles({});
    debugLog("migrations:npc-compendium-loot-sync", r);
  } catch (err) {
    console.error("Iron Hills | migration:npc-compendium-loot-sync", err);
  }
}

/** Листы монстра в мире: system.info.lootPool + встроенные слоты добычи, если их ещё нет. */
async function migrateMonsterLootPoolEmbedded202604() {
  for (const actor of game.actors ?? []) {
    try {
      if (actor.type !== "monster") continue;
      const info = actor.system?.info ?? {};
      let pool = String(info.lootPool ?? "").trim();
      const lt = String(info.lootTable ?? "").trim();
      const bid = String(info.bestiaryId ?? "").trim();
      if (!pool && lt && getMonsterHarvestDropLines(lt).length) pool = lt;
      if (!pool && bid && MONSTER_BESTIARY[bid]?.lootPool)
        pool = String(MONSTER_BESTIARY[bid].lootPool).trim();

      const patch = {};
      if (pool && String(info.lootPool ?? "").trim() !== pool)
        patch["system.info.lootPool"] = pool;
      if (lt && pool) patch["system.info.lootTable"] = "";
      if (Object.keys(patch).length) await actor.update(patch);

      if (!pool) continue;
      if (!monsterActorHasHarvestLootItems(actor)) {
        const data = buildMonsterHarvestEmbeddedItemData(pool);
        if (data.length) await actor.createEmbeddedDocuments("Item", data);
      }
    } catch (err) {
      console.error("Iron Hills | migration:monster-loot-pool", err);
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
  { id: "2026-06-canonical-magic-schools", run: migrateCanonicalMagicSkills2026, label: "canonical magic schools" },
  { id: "2026-04-body-hp-tarkov",         run: migrateBodyPartHpTarkov2026,   label: "character/NPC limb HP totals" },
  { id: "2026-04-unarmed-scale",          run: migrateUnarmedDamageScale2026, label: "unarmedDamage legacy scale" },
  { id: "2026-04-craft-knowledge-starter",  run: migrateCraftKnowledgeStarter,  label: "craft knownRecipeIds starter" },
  { id: "2026-05-wilderness-survival-fields", run: migrateWildernessSurvival2026, label: "POI water / monster loot fields" },
  { id: "2026-04-npc-loot-fields", run: migrateNpcLootFields202604, label: "NPC loot / pickpocket fields" },
  { id: "2026-04-npc-pack-loot-sync", run: migrateNpcCompendiumLootFromProfilesOnce, label: "ih-npc loot+role из профилей" },
  { id: "2026-04-monster-lootpool-embedded", run: migrateMonsterLootPoolEmbedded202604, label: "monster lootPool + встроенная добыча" },
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
