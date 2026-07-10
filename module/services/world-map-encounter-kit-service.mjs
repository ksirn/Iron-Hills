import {
  MONSTER_BESTIARY,
} from "../constants/monster-bestiary.mjs";
import {
  getMonsterHarvestDropLines,
} from "../constants/monster-loot-pools.mjs";
import {
  NPC_PACK_ACTORS,
  NPC_SPECIALIZATIONS,
} from "../constants/npc-profiles.mjs";
import {
  WORLD_CONTENT_CONTAINER_THEMES,
  WORLD_CONTENT_POI_THEMES,
} from "./world-content-service.mjs";

function str(value = "") {
  return String(value ?? "").trim();
}

function lower(value = "") {
  return str(value).toLocaleLowerCase("ru");
}

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function row(label, value, note = "", tone = "is-safe", extra = {}) {
  return {
    label: str(label),
    value: str(value),
    note: str(note),
    tone,
    hasNote: Boolean(str(note)),
    ...extra,
  };
}

function terrainKeywords(terrain = "") {
  const key = str(terrain);
  const map = {
    forest: ["wolf", "bear", "glade", "briar", "root", "hound", "pelt", "лес", "волк", "медв"],
    swamp: ["fen", "marsh", "peat", "bog", "serpent", "slither", "болот", "топ"],
    mine: ["tunnel", "fung", "pit", "stone", "ore", "iron", "horror", "шах", "кам", "гриб"],
    dungeon: ["tunnel", "pit", "horror", "stone", "undead", "bone", "cave", "подзем", "кость"],
    ruins: ["bone", "horror", "ancient", "shade", "ruin", "пепел", "тень"],
    road: ["hound", "rat", "runner", "pack", "scrap", "дорож", "стая"],
    pass: ["wyvern", "drake", "alpine", "ridge", "stone", "гор", "перевал"],
    mountains: ["wyvern", "drake", "alpine", "ridge", "stone", "гор"],
    hills: ["bear", "hound", "root", "stone", "холм"],
    plains: ["hound", "longtooth", "glade", "pack", "пол"],
    river: ["fen", "marsh", "serpent", "slither", "river", "рек"],
    town: ["rat", "hound", "scrap", "vermin", "крыс"],
    village: ["rat", "hound", "wolf", "briar", "деревн"],
  };
  return map[key] ?? [];
}

function inferKind({ focusTile = {}, localView = {}, encounterView = {}, sceneBrief = {} } = {}) {
  const hotspot = localView.activeHotspot ?? encounterView.activeHotspot ?? null;
  return str(sceneBrief.kind) || str(hotspot?.hotspotType) || str(focusTile?.terrain) || "encounter";
}

function inferTier(focusTile = {}, localView = {}, encounterView = {}) {
  return clamp(Math.round(
    num(focusTile?.poiMeta?.tier,
      num(focusTile?.tier,
        num(localView?.danger,
          num(encounterView?.danger,
            num(focusTile?.danger, 2)))))
  ), 1, 10);
}

function inferTheme({ focusTile = {}, kind = "encounter" } = {}) {
  const terrain = str(focusTile?.terrain);
  const label = lower(focusTile?.label);
  if (kind === "trade") {
    return { poiTheme: "watchpost", containerTheme: "military", npcRoles: ["villager", "guard"], sceneRoles: ["repair-and-trade", "quest-patron"], combat: false };
  }
  if (kind === "craft") {
    return { poiTheme: "watchpost", containerTheme: "military", npcRoles: ["crafter", "guard"], sceneRoles: ["repair-and-trade"], combat: false };
  }
  if (kind === "social" || kind === "npc") {
    return { poiTheme: "hunter", containerTheme: "hunter", npcRoles: ["villager", "hunter", "priest"], sceneRoles: ["safe-guide", "healer", "quest-patron"], combat: false };
  }
  if (label.includes("дорог") || terrain === "road") {
    return { poiTheme: "watchpost", containerTheme: "military", npcRoles: ["bandit", "guard", "hunter"], sceneRoles: ["road-threat", "gate-guard"], combat: true };
  }
  if (label.includes("бор") || terrain === "forest") {
    return { poiTheme: "beast", containerTheme: "hunter", npcRoles: ["hunter", "bandit"], sceneRoles: ["wilderness-contact", "safe-guide"], combat: true };
  }
  if (terrain === "swamp" || terrain === "river") {
    return { poiTheme: "beast", containerTheme: "alchemy", npcRoles: ["hunter", "priest"], sceneRoles: ["healer", "wilderness-contact"], combat: true };
  }
  if (label.includes("пласт") || terrain === "mine" || terrain === "dungeon") {
    return { poiTheme: "forgotten", containerTheme: "ruins", npcRoles: ["crafter", "guard", "mage"], sceneRoles: ["repair-and-trade", "arcane-support"], combat: true };
  }
  if (terrain === "ruins") {
    return { poiTheme: "ancient", containerTheme: "ruins", npcRoles: ["mage", "guard", "bandit"], sceneRoles: ["arcane-support", "road-threat"], combat: true };
  }
  if (terrain === "pass" || terrain === "mountains") {
    return { poiTheme: "watchpost", containerTheme: "military", npcRoles: ["guard", "bandit"], sceneRoles: ["elite-guard", "road-threat"], combat: true };
  }
  return { poiTheme: "bandit", containerTheme: "bandit", npcRoles: ["bandit", "guard"], sceneRoles: ["road-threat"], combat: kind === "danger" || kind === "encounter" };
}

function textMatchesKeywords(text, keywords = []) {
  const clean = lower(text);
  return keywords.reduce((sum, keyword) => sum + (clean.includes(lower(keyword)) ? 1 : 0), 0);
}

function selectMonsters({ tier, terrain, theme }) {
  if (!theme.combat) return [];
  const keywords = terrainKeywords(terrain);
  return Object.values(MONSTER_BESTIARY ?? {})
    .map(monster => {
      const tierDelta = Math.abs(num(monster.tier, tier) - tier);
      const haystack = `${monster.id} ${monster.label} ${monster.desc} ${monster.lootPool}`;
      const keywordScore = textMatchesKeywords(haystack, keywords);
      const score = Math.max(0, 8 - tierDelta * 2) + keywordScore * 3;
      return { monster, score, tierDelta, keywordScore };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.tierDelta - b.tierDelta || a.monster.label.localeCompare(b.monster.label, "ru"))
    .slice(0, 4)
    .map(({ monster, keywordScore }) => row(
      `t${monster.tier} ${monster.label}`,
      monster.id,
      `${monster.lootPool} · HP ${monster.hpPool}${keywordScore ? ` · terrain match ${keywordScore}` : ""}`,
      "is-danger",
      {
        id: monster.id,
        tier: monster.tier,
        lootPool: monster.lootPool,
        img: monster.img ?? "",
      }
    ));
}

function selectNpcs({ tier, theme, hotspot = null }) {
  const wantedRoles = new Set(theme.npcRoles ?? []);
  const wantedSceneRoles = new Set(theme.sceneRoles ?? []);
  const hotspotRole = str(hotspot?.npcRole);
  if (hotspotRole && NPC_SPECIALIZATIONS[hotspotRole]) wantedRoles.add(hotspotRole);
  if (hotspotRole) wantedSceneRoles.add(hotspotRole);

  return Object.values(NPC_PACK_ACTORS ?? {})
    .map(npc => {
      const role = str(npc.specialization);
      const sceneRole = str(npc.sceneRole);
      const tierDelta = Math.abs(num(npc.tier, tier) - tier);
      let score = Math.max(0, 6 - tierDelta);
      if (wantedRoles.has(role)) score += 5;
      if (sceneRole && wantedSceneRoles.has(sceneRole)) score += 7;
      if (str(npc.tierRange) === String(tier)) score += 2;
      return { npc, score, tierDelta };
    })
    .filter(entry => entry.score > 4)
    .sort((a, b) => b.score - a.score || a.tierDelta - b.tierDelta || a.npc.label.localeCompare(b.npc.label, "ru"))
    .slice(0, 5)
    .map(({ npc }) => row(
      `t${npc.tier} ${npc.label}`,
      npc.id,
      `${npc.specialization}${npc.sceneRole ? ` · ${npc.sceneRole}` : ""}`,
      npc.specialization === "bandit" ? "is-danger" : npc.specialization === "crafter" ? "is-gold" : "is-active",
      {
        id: npc.id,
        tier: npc.tier,
        role: npc.specialization,
        sceneRole: npc.sceneRole ?? "",
        img: npc.img ?? "",
      }
    ));
}

function harvestRows(monsterRows = []) {
  const rows = [];
  const seen = new Set();
  for (const monster of monsterRows) {
    const pool = str(monster.lootPool);
    if (!pool || seen.has(pool)) continue;
    seen.add(pool);
    const drops = getMonsterHarvestDropLines(pool).slice(0, 4);
    for (const drop of drops) {
      rows.push(row(
        `${drop.type}:${drop.catalogId}`,
        `${drop.qtyMin}-${drop.qtyMax}`,
        `${drop.chancePct}% · ${pool}`,
        "is-gold"
      ));
    }
  }
  return rows.slice(0, 8);
}

function generatorRows({ tier, theme }) {
  const rows = [];
  const poiTheme = WORLD_CONTENT_POI_THEMES[theme.poiTheme] ? theme.poiTheme : "bandit";
  const containerTheme = WORLD_CONTENT_CONTAINER_THEMES[theme.containerTheme] ? theme.containerTheme : "bandit";
  rows.push(row("POI loot", `buildPoiLootItems(\"${poiTheme}\", ${tier})`, WORLD_CONTENT_POI_THEMES[poiTheme]?.label ?? poiTheme, "is-gold"));
  rows.push(row("Container", `randomContainerLoot(\"${containerTheme}\", ${tier})`, WORLD_CONTENT_CONTAINER_THEMES[containerTheme]?.label ?? containerTheme, "is-gold"));
  return rows;
}

export function buildWorldMapEncounterKit({
  activeLevelId = "region",
  focusTile = {},
  localView = {},
  encounterView = {},
  sceneBrief = {},
} = {}) {
  const hotspot = localView.activeHotspot ?? encounterView.activeHotspot ?? null;
  const kind = inferKind({ focusTile, localView, encounterView, sceneBrief });
  const tier = inferTier(focusTile, localView, encounterView);
  const terrain = str(focusTile?.terrain);
  const theme = inferTheme({ focusTile, kind });
  const monsterRows = selectMonsters({ tier, terrain, theme });
  const npcRows = selectNpcs({ tier, theme, hotspot });
  const harvest = harvestRows(monsterRows);
  const generators = generatorRows({ tier, theme });
  const kitRows = [
    row("Tier", `t${tier}`, `${focusTile?.label || focusTile?.terrainLabel || terrain || "focus"} · ${kind}`, "is-warn"),
    row("Theme", theme.poiTheme, `${WORLD_CONTENT_POI_THEMES[theme.poiTheme]?.label ?? theme.poiTheme} / ${WORLD_CONTENT_CONTAINER_THEMES[theme.containerTheme]?.label ?? theme.containerTheme}`, "is-road"),
    row("Actors", `${npcRows.length + monsterRows.length}`, `${npcRows.length} NPC · ${monsterRows.length} monsters`, npcRows.length + monsterRows.length ? "is-active" : "is-warn"),
    row("Loot", `${generators.length + harvest.length}`, `${generators.length} generators · ${harvest.length} harvest lines`, "is-gold"),
  ];

  return {
    hasKit: true,
    activeLevelId,
    tier,
    kind,
    poiTheme: theme.poiTheme,
    containerTheme: theme.containerTheme,
    combat: theme.combat,
    kitRows,
    monsterRows,
    npcRows,
    generatorRows: generators,
    harvestRows: harvest,
    hasKitRows: kitRows.length > 0,
    hasMonsterRows: monsterRows.length > 0,
    hasNpcRows: npcRows.length > 0,
    hasGeneratorRows: generators.length > 0,
    hasHarvestRows: harvest.length > 0,
  };
}
