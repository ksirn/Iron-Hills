import {
  MONSTER_BESTIARY,
} from "../constants/monster-bestiary.mjs";
import {
  NPC_PACK_ACTORS,
} from "../constants/npc-profiles.mjs";
import {
  WORLD_MAP_ASSETS,
  resolveWorldMapBackdrop,
} from "../constants/world-map.mjs";

const LEVELS = Object.freeze(["global", "region", "local", "encounter", "building"]);
const DEFAULT_LEVEL = "encounter";

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

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeLevel(value = DEFAULT_LEVEL) {
  const key = str(value);
  return LEVELS.includes(key) ? key : DEFAULT_LEVEL;
}

function row(label, value, note = "", tone = "is-safe", extra = {}) {
  return {
    label: str(label),
    value: str(value),
    note: str(note),
    tone: str(tone) || "is-safe",
    hasNote: Boolean(str(note)),
    ...extra,
  };
}

function hashString(value = "") {
  let hash = 2166136261;
  const text = str(value);
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRng(seed = "iron-hills-situation") {
  let state = hashString(seed) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted(list = [], rng = Math.random) {
  const values = safeArray(list).filter(Boolean);
  if (!values.length) return null;
  const total = values.reduce((sum, entry) => sum + Math.max(1, Number(entry.weight ?? 1) || 1), 0);
  let roll = rng() * total;
  for (const entry of values) {
    roll -= Math.max(1, Number(entry.weight ?? 1) || 1);
    if (roll <= 0) return entry;
  }
  return values[values.length - 1] ?? null;
}

function rangeCount(value, rng, fallback = 1) {
  if (Array.isArray(value)) {
    const min = Math.max(0, Math.round(Number(value[0]) || fallback));
    const max = Math.max(min, Math.round(Number(value[1]) || min));
    return min + Math.floor(rng() * (max - min + 1));
  }
  return Math.max(0, Math.round(Number(value) || fallback));
}

function textHasAny(text = "", terms = []) {
  const haystack = lower(text);
  return safeArray(terms).some(term => {
    const needle = lower(term);
    return needle && haystack.includes(needle);
  });
}

function uniqueRows(rows = []) {
  const seen = new Set();
  const out = [];
  for (const entry of safeArray(rows)) {
    const key = `${entry.label}|${entry.value}|${entry.note}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
}

const WORLD_MAP_CORE_SITUATION_MAP_POOL = Object.freeze([
  {
    id: "iron_hills_atlas",
    level: "global",
    label: "Iron Hills atlas",
    asset: WORLD_MAP_ASSETS.ironHillsGlobalAtlas,
    terrains: ["hills", "mountains", "road"],
    kinds: ["travel", "transition", "social"],
    tags: ["atlas", "iron hills", "region route", "caravan"],
    sceneScale: "world travel",
    entryHint: "Use this when the party chooses the next region-scale destination.",
    exitHint: "Resolve into a region map tile or a road event.",
    markers: [
      ["Region gate", "entry", "Choose which region tile becomes the next focus."],
      ["Trade route", "road", "Good place for rumors, taxes or caravan contracts."],
    ],
    situations: [
      {
        id: "caravan-rumor",
        title: "Caravan rumor thread",
        tone: "is-road",
        hook: "A caravan master points at a marked route and asks why the last wagons never arrived.",
        summary: "Use the atlas as a campaign-scale prompt, then drop into the matching region route.",
        actors: [
          { type: "npc", role: "villager", label: "Caravan witness", count: 1, placement: "near the chosen route marker" },
        ],
        loot: [
          { label: "Travel lead", value: "1 rumor", note: "Names a route, a missing person, and a possible reward." },
        ],
        clues: [
          { label: "Route mismatch", value: "map mark", note: "The marked route avoids the safest road for no obvious reason." },
        ],
        skills: [
          { label: "Trade", dc: 8, note: "Estimate whether the caravan story is economically plausible." },
          { label: "Lore", dc: 9, note: "Remember an older name for the same pass or valley." },
        ],
      },
    ],
  },
  {
    id: "iron_hills_region_routes",
    level: "region",
    label: "Iron Hills route web",
    asset: WORLD_MAP_ASSETS.ironHillsRegion,
    terrains: ["road", "hills", "plains", "forest"],
    kinds: ["travel", "transition", "encounter"],
    tags: ["region", "road", "route", "poi", "iron hills"],
    sceneScale: "regional travel",
    entryHint: "Party starts on the focused tile or from the previous route hop.",
    exitHint: "End by focusing a local map, POI, settlement or encounter map.",
    markers: [
      ["Road fork", "transition", "Main entry and exit marker for travel decisions."],
      ["Distant smoke", "point of interest", "Optional pull toward a local scene."],
    ],
    situations: [
      {
        id: "road-complication",
        title: "Road complication",
        tone: "is-warn",
        hook: "Fresh tracks leave the road toward an improvised camp or a hidden cache.",
        summary: "A fast regional prompt that can become a social scene, ambush or loot stop.",
        actors: [
          { type: "npc", role: "guard", label: "Road guard or witness", count: 1, placement: "at the road fork" },
        ],
        loot: [
          { label: "Road cache", value: "1 small container", note: "Hidden off the road; use container loot for the region tier." },
        ],
        clues: [
          { label: "Broken wheel rut", value: "track", note: "Points to either a damaged cart or staged accident." },
        ],
        skills: [
          { label: "Survival", dc: 8, note: "Read the direction and number of tracks." },
          { label: "Perception", dc: 9, note: "Notice watchers before stepping into the open." },
        ],
        twists: [
          { label: "False trail", value: "optional", note: "The obvious tracks were made to pull the party off the main road." },
        ],
      },
    ],
  },
  {
    id: "rivergate_market_local",
    level: "local",
    label: "Rivergate market district",
    asset: WORLD_MAP_ASSETS.rivergateCityLocal,
    terrains: ["town", "road"],
    kinds: ["trade", "social", "craft"],
    hotspotTypes: ["trade", "craft", "npc", "social"],
    tags: ["market", "city", "merchant", "blacksmith", "trade"],
    sceneScale: "city/local",
    entryHint: "Main road, gate or caravan stop.",
    exitHint: "District exits lead to market square, blacksmith house, gate or alley encounter.",
    markers: [
      ["Market stalls", "trade", "Primary merchant cluster."],
      ["Workshop row", "craft", "Repair, armor durability and blacksmith hooks."],
      ["Watch post", "npc", "Law, rumors and pressure."],
    ],
    situations: [
      {
        id: "market-pressure",
        title: "Market pressure",
        tone: "is-gold",
        hook: "A shortage, rumor or angry buyer turns normal shopping into a choice scene.",
        summary: "Use the local market as a fast generator for trade, rumors and quest hooks.",
        actors: [
          { type: "npc", role: "crafter", label: "Working artisan", count: 1, placement: "at the workshop row" },
          { type: "npc", role: "guard", label: "Market guard", count: 1, placement: "near the crowd or gate" },
        ],
        loot: [
          { label: "Merchant offer", value: "1 stock hook", note: "Tie to Tarkov trade stock and pending inventory." },
        ],
        clues: [
          { label: "Contradicting price", value: "rumor", note: "Someone is buying supplies above normal price." },
        ],
        skills: [
          { label: "Trade", dc: 8, note: "Spot the real market pressure." },
          { label: "Streetwise", dc: 9, note: "Find who is moving goods quietly." },
        ],
      },
    ],
  },
  {
    id: "ashford_village_local",
    level: "local",
    label: "Ashford village edges",
    asset: WORLD_MAP_ASSETS.ashfordVillageLocal,
    terrains: ["village", "forest", "plains"],
    kinds: ["social", "npc", "encounter"],
    hotspotTypes: ["npc", "social", "danger", "encounter"],
    tags: ["village", "field", "forest edge", "farm"],
    sceneScale: "village/local",
    entryHint: "Road into the village or a field path.",
    exitHint: "Move toward a house, forest encounter, field encounter or village square.",
    markers: [
      ["Village square", "npc", "Safe conversation and rumor marker."],
      ["Field edge", "transition", "Good exit into encounter maps."],
      ["Woodline", "danger", "Threat enters from here."],
    ],
    situations: [
      {
        id: "village-trouble",
        title: "Village trouble",
        tone: "is-active",
        hook: "A local asks for help, but the signs point outside the village instead of inside it.",
        summary: "A social opener that can become a forest, field or house encounter.",
        actors: [
          { type: "npc", role: "villager", label: "Worried villager", count: 1, placement: "near the village square" },
        ],
        loot: [
          { label: "Modest reward", value: "coins or supplies", note: "Small enough for tier 1-3 session play." },
        ],
        clues: [
          { label: "Mud on threshold", value: "physical clue", note: "Shows who entered after sunset." },
        ],
        skills: [
          { label: "Perception", dc: 7, note: "Notice which house or path was used recently." },
          { label: "Persuasion", dc: 8, note: "Get a nervous witness to talk." },
        ],
      },
    ],
  },
  {
    id: "koperny_mining_local",
    level: "local",
    label: "Koperny mining settlement",
    asset: WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
    terrains: ["mine", "dungeon", "mountains", "hills"],
    kinds: ["craft", "danger", "encounter"],
    hotspotTypes: ["craft", "danger", "encounter", "loot"],
    tags: ["mine", "settlement", "ore", "blacksmith", "cave"],
    sceneScale: "mining/local",
    entryHint: "Mine road, lift platform or foreman yard.",
    exitHint: "Resolve into mine tunnel, workshop, storage or ridge encounter.",
    markers: [
      ["Ore yard", "craft", "Repair, materials and heavy gear marker."],
      ["Lift cage", "transition", "Entry to tunnel-scale maps."],
      ["Foreman office", "npc", "Quest, permits and pressure."],
    ],
    situations: [
      {
        id: "mine-shortage",
        title: "Mine shortage",
        tone: "is-warn",
        hook: "The settlement can work, repair and trade, but a missing shipment makes every choice expensive.",
        summary: "A local mining hub prompt that supports repair, materials, gear durability and mine dangers.",
        actors: [
          { type: "npc", role: "crafter", label: "Mine smith", count: 1, placement: "at the ore yard" },
          { type: "npc", role: "guard", label: "Mine guard", count: 1, placement: "by the lift cage" },
        ],
        loot: [
          { label: "Material pile", value: "1 container", note: "Ore, leather straps, broken tools or repair parts." },
        ],
        clues: [
          { label: "Cold forge", value: "workshop clue", note: "The forge stopped because fuel or ore was diverted." },
        ],
        skills: [
          { label: "Blacksmithing", dc: 9, note: "Identify the missing material chain." },
          { label: "Athletics", dc: 8, note: "Move a heavy crate or clear a blocked cart." },
        ],
      },
    ],
  },
  {
    id: "dark_forest_encounter",
    level: "encounter",
    label: "Dark forest clearing",
    asset: WORLD_MAP_ASSETS.encounterForest,
    terrains: ["forest", "swamp", "river"],
    kinds: ["danger", "encounter", "loot"],
    hotspotTypes: ["danger", "encounter", "loot"],
    tags: ["dark forest", "forest", "wolf", "campfire", "hidden cache", "villager"],
    sceneScale: "encounter",
    entryHint: "Party enters from the safest visible trail edge.",
    exitHint: "Exit through the trail, deeper woodline or rescued NPC lead.",
    markers: [
      ["Trail entry", "entry", "Party start or retreat edge."],
      ["Burned campfire", "loot", "Hidden cache and clue anchor."],
      ["Dense woodline", "danger", "Threat entry and concealment."],
    ],
    situations: [
      {
        id: "wolves-and-villager",
        title: "Wolves over a burned camp",
        tone: "is-danger",
        hook: "A villager is trapped near a burned camp while a hungry pack circles from the trees.",
        summary: "Place the party at the trail edge, threats in the woodline, a hidden cache near the burned campfire, and one civilian in immediate danger.",
        actors: [
          { type: "monster", role: "predator", label: "Wolf pack", count: [2, 4], tags: ["wolf", "hound", "pack", "longtooth"], placement: "split between dense woodline and the campfire approach" },
          { type: "npc", role: "villager", label: "Threatened villager", count: 1, placement: "pinned between the campfire and a fallen tree" },
        ],
        loot: [
          { label: "Hidden cache", value: "1 container", note: "By the burned campfire; use hunter/container loot for the tier." },
        ],
        clues: [
          { label: "Half-buried bootprint", value: "track", note: "Shows the camp was searched before the pack arrived." },
          { label: "Fresh ash under old rain", value: "timeline", note: "The fire was rekindled recently, not from an old ruin." },
        ],
        skills: [
          { label: "Survival", dc: 8, note: "Read pack movement and avoid being surrounded." },
          { label: "Perception", dc: 9, note: "Spot the cache before combat ends or fire spreads." },
          { label: "Medicine", dc: 8, note: "Stabilize the villager after the fight." },
        ],
        twists: [
          { label: "Noise draws more", value: "optional", note: "Loud AoE or fire magic can pull one extra threat from the woodline." },
        ],
      },
    ],
  },
  {
    id: "road_ambush_encounter",
    level: "encounter",
    label: "Road ambush bend",
    asset: WORLD_MAP_ASSETS.encounterField,
    terrains: ["road", "plains", "hills"],
    kinds: ["danger", "encounter", "transition"],
    hotspotTypes: ["danger", "encounter", "transition"],
    tags: ["road", "ambush", "field", "bandit", "cart"],
    sceneScale: "encounter",
    entryHint: "Party enters along the road with visible exits at both ends.",
    exitHint: "Either road end returns to regional travel.",
    markers: [
      ["North road", "entry", "One travel edge."],
      ["Broken cart", "cover", "Cover, bait or searchable object."],
      ["Low ridge", "danger", "Ranged attacker or lookout position."],
    ],
    situations: [
      {
        id: "cart-bait",
        title: "Broken cart bait",
        tone: "is-danger",
        hook: "A broken cart blocks the bend; someone is watching from a low ridge.",
        summary: "A compact road encounter for cover, friendly fire, ranged lines and loot transfer.",
        actors: [
          { type: "npc", role: "bandit", label: "Road threats", count: [2, 3], placement: "behind the cart and on the low ridge" },
          { type: "npc", role: "guard", label: "Injured escort", count: 1, placement: "near the blocked wagon" },
        ],
        loot: [
          { label: "Wagon goods", value: "1 container", note: "Small trade goods, food or repair parts." },
        ],
        clues: [
          { label: "Clean cut harness", value: "sabotage", note: "The accident was staged." },
        ],
        skills: [
          { label: "Perception", dc: 9, note: "Notice the ridge watcher." },
          { label: "Athletics", dc: 8, note: "Move the cart or use it as cover." },
        ],
      },
    ],
  },
  {
    id: "mine_tunnel_encounter",
    level: "encounter",
    label: "Mine tunnel choke",
    asset: WORLD_MAP_ASSETS.encounterMineCave,
    terrains: ["mine", "dungeon", "mountains", "pass"],
    kinds: ["danger", "encounter", "loot", "craft"],
    hotspotTypes: ["danger", "encounter", "loot", "craft"],
    tags: ["mine", "tunnel", "ore", "cave", "blocked shaft"],
    sceneScale: "encounter",
    entryHint: "Party enters from the lit tunnel mouth or lift cage.",
    exitHint: "Side drift, blocked shaft or return lift.",
    markers: [
      ["Lift cage", "entry", "Safe-ish start marker."],
      ["Ore cart", "cover", "Cover and heavy object."],
      ["Blocked shaft", "hazard", "Noise, collapse or hidden route."],
    ],
    situations: [
      {
        id: "blocked-shaft",
        title: "Blocked shaft",
        tone: "is-warn",
        hook: "A blocked shaft hides a salvage cache, but movement and noise can wake whatever nested inside.",
        summary: "Use this for mine salvage, heavy equipment, durability loss and a contained monster fight.",
        actors: [
          { type: "monster", role: "cave threat", label: "Tunnel threat", count: [1, 3], tags: ["tunnel", "fung", "pit", "stone", "horror"], placement: "inside the side drift or behind the blocked shaft" },
          { type: "npc", role: "crafter", label: "Trapped miner", count: 1, placement: "behind the ore cart or trapped near the shaft" },
        ],
        loot: [
          { label: "Ore cache", value: "1 material cache", note: "Ore, broken tools or crafting material." },
        ],
        clues: [
          { label: "Fresh scrape marks", value: "hazard clue", note: "The collapse is recent and possibly deliberate." },
        ],
        skills: [
          { label: "Athletics", dc: 9, note: "Shift heavy debris without causing a collapse." },
          { label: "Blacksmithing", dc: 9, note: "Identify ore grade or tool sabotage." },
        ],
      },
    ],
  },
  {
    id: "market_square_encounter",
    level: "encounter",
    label: "Market square",
    asset: WORLD_MAP_ASSETS.encounterMarketSquare,
    terrains: ["town", "village", "road"],
    kinds: ["trade", "social", "npc", "encounter"],
    hotspotTypes: ["trade", "social", "npc", "encounter"],
    tags: ["market", "square", "merchant", "crowd", "rumor"],
    sceneScale: "encounter",
    entryHint: "Party starts at one street edge or near a known merchant.",
    exitHint: "Use alley, gate, workshop or main road exits.",
    markers: [
      ["Main stalls", "trade", "Trade and loot transfer anchor."],
      ["Crowd pocket", "npc", "Rumor or pickpocket risk."],
      ["Side alley", "transition", "Exit or danger route."],
    ],
    situations: [
      {
        id: "rumor-in-crowd",
        title: "Rumor in the crowd",
        tone: "is-active",
        hook: "A rumor, item or wanted person passes through the crowd before the party can pin it down.",
        summary: "A no-prep social/trade scene that can pivot into a chase, bargain or clue hunt.",
        actors: [
          { type: "npc", role: "villager", label: "Crowd witness", count: [1, 2], placement: "in the crowd pocket" },
          { type: "npc", role: "guard", label: "Market guard", count: 1, placement: "near the side alley" },
        ],
        loot: [
          { label: "Rumor lead", value: "1 lead", note: "Tie to a quest, merchant stock or nearby POI." },
        ],
        clues: [
          { label: "Repeated symbol", value: "visual clue", note: "A mark appears on crates, parchment or clothing." },
        ],
        skills: [
          { label: "Streetwise", dc: 8, note: "Find who started the rumor." },
          { label: "Perception", dc: 9, note: "Keep track of the person or item in the crowd." },
        ],
      },
    ],
  },
  {
    id: "blacksmith_house",
    level: "building",
    label: "Blacksmith house and forge",
    asset: WORLD_MAP_ASSETS.encounterHouseInterior,
    terrains: ["town", "village", "mine"],
    kinds: ["craft", "trade", "social", "npc"],
    hotspotTypes: ["craft", "trade", "social", "npc"],
    tags: ["blacksmith", "forge", "house", "workshop", "armor", "repair"],
    sceneScale: "building",
    entryHint: "Front door or open forge yard.",
    exitHint: "Street, back room, workshop yard or cellar hatch.",
    markers: [
      ["Forge", "craft", "Repair, durability and material checks."],
      ["Counter", "trade", "Buy/sell handoff and pending inventory hook."],
      ["Back room", "clue", "Family, debt, hidden stock or quest clue."],
    ],
    situations: [
      {
        id: "smith-family-hook",
        title: "Blacksmith family hook",
        tone: "is-gold",
        hook: "The smith can repair gear, but the real problem is hidden in the family workshop.",
        summary: "Place the blacksmith at the forge, the child/apprentice near the back room, and skill clues around tools, invoices and damaged gear.",
        actors: [
          { type: "npc", role: "crafter", label: "Blacksmith", count: 1, placement: "at the forge" },
          { type: "npc", role: "villager", label: "Smith's child or apprentice", count: 1, placement: "near the back room or counter" },
        ],
        loot: [
          { label: "Repair stock", value: "1 workbench cache", note: "Ore, straps, rivets, shield rim, weapon blank or armor patch." },
        ],
        clues: [
          { label: "Wrong hammer marks", value: "craft clue", note: "A damaged item was not made by this smith." },
          { label: "Unpaid invoice", value: "paper clue", note: "Names a mine, merchant or guard who pressured the family." },
          { label: "Warm hidden coals", value: "timing clue", note: "Someone used the forge after closing." },
        ],
        skills: [
          { label: "Blacksmithing", dc: 8, note: "Read tool marks and identify the real maker." },
          { label: "Trade", dc: 8, note: "Catch the debt, supply or contract pressure." },
          { label: "Persuasion", dc: 9, note: "Get the apprentice to reveal what was hidden." },
        ],
        twists: [
          { label: "Repair favor", value: "optional", note: "A good social outcome unlocks discounted repair or a material lead." },
        ],
      },
    ],
  },
  {
    id: "abandoned_cottage",
    level: "building",
    label: "Abandoned cottage",
    asset: WORLD_MAP_ASSETS.encounterHouseInterior,
    terrains: ["forest", "village", "plains", "swamp"],
    kinds: ["loot", "danger", "social", "encounter"],
    hotspotTypes: ["loot", "danger", "encounter", "npc"],
    tags: ["house", "cottage", "field", "forest", "cache"],
    sceneScale: "building",
    entryHint: "Front threshold or broken side wall.",
    exitHint: "Back garden, cellar, road or forest edge.",
    markers: [
      ["Threshold", "entry", "Party start marker."],
      ["Cold hearth", "clue", "Timeline and hidden cache marker."],
      ["Cellar hatch", "danger", "Optional threat or loot marker."],
    ],
    situations: [
      {
        id: "empty-house-not-empty",
        title: "Empty house, not empty",
        tone: "is-warn",
        hook: "The cottage looks abandoned until the party notices a new mark in old dust.",
        summary: "A compact search scene for clues, stealth, cache and optional danger.",
        actors: [
          { type: "monster", role: "lurker", label: "Hidden threat", count: [0, 2], tags: ["rat", "hound", "shade", "vermin"], placement: "cellar hatch or broken wall" },
        ],
        loot: [
          { label: "Old cache", value: "1 hidden container", note: "Under the hearth, floorboard or cellar shelf." },
        ],
        clues: [
          { label: "Clean line in dust", value: "track", note: "A recently moved object reveals a hiding place." },
        ],
        skills: [
          { label: "Perception", dc: 8, note: "Find the cache without tearing the house apart." },
          { label: "Stealth", dc: 8, note: "Avoid alerting anything below the floor." },
        ],
      },
    ],
  },
  {
    id: "field_encounter",
    level: "encounter",
    label: "Field encounter",
    asset: WORLD_MAP_ASSETS.encounterField,
    terrains: ["plains", "hills", "village", "road"],
    kinds: ["encounter", "social", "danger"],
    hotspotTypes: ["encounter", "danger", "npc", "social"],
    tags: ["field", "farm", "open ground", "road"],
    sceneScale: "encounter",
    entryHint: "Party starts from road, fence or tree line.",
    exitHint: "Road exit, crop rows, farmhouse or hill path.",
    markers: [
      ["Fence line", "cover", "Light cover and movement cost."],
      ["Crop rows", "concealment", "Concealment and search marker."],
      ["Farm path", "transition", "Exit or NPC arrival marker."],
    ],
    situations: [
      {
        id: "field-disturbance",
        title: "Field disturbance",
        tone: "is-warn",
        hook: "Something scattered tools, tracks and people across the field before anyone understood why.",
        summary: "Use the field to test open movement, ranged attacks, AoE friendly fire and rescue timing.",
        actors: [
          { type: "monster", role: "field threat", label: "Field threat", count: [1, 3], tags: ["hound", "longtooth", "pack", "rat"], placement: "moving between crop rows and fence line" },
          { type: "npc", role: "villager", label: "Farmhand", count: 1, placement: "near the farm path" },
        ],
        loot: [
          { label: "Dropped tools", value: "1 minor cache", note: "Tools, food, rope or field supplies." },
        ],
        clues: [
          { label: "Flattened crop line", value: "movement clue", note: "Shows the direction of the real disturbance." },
        ],
        skills: [
          { label: "Survival", dc: 8, note: "Follow tracks without losing the trail in open ground." },
          { label: "Athletics", dc: 8, note: "Cross fences or drag someone out quickly." },
        ],
      },
    ],
  },
]);

const WORLD_MAP_IRON_HILLS_EXPANDED_SITUATION_MAP_POOL = Object.freeze([
  {
    id: "iron_hills_frontier_paths",
    level: "global",
    label: "Iron Hills frontier paths",
    asset: WORLD_MAP_ASSETS.ironHillsGlobalAtlas,
    terrains: ["road", "hills", "mountains", "river"],
    kinds: ["travel", "transition", "social", "danger"],
    hotspotTypes: ["transition", "npc", "danger", "social"],
    tags: ["frontier", "iron hills", "pass", "river", "trade route", "road"],
    sceneScale: "world travel",
    entryHint: "Start from the party's current region marker or a caravan route.",
    exitHint: "Resolve into a region map: Rivergate, Ashford, Koperny Peak, Black Bor or the northern pass.",
    markers: [
      ["Frontier route", "road", "Long-distance travel line."],
      ["Border rumor", "npc", "A witness, patrol or caravan lead."],
      ["Threat arrow", "danger", "A distant pressure that can become a regional event."],
    ],
    situations: [
      {
        id: "missing-road-tax",
        title: "Missing road-tax wagons",
        tone: "is-road",
        kinds: ["travel", "transition", "social"],
        terrains: ["road", "hills"],
        hook: "Two tax wagons vanished between safe marks on the atlas, and every faction blames a different road.",
        summary: "A campaign-scale lead that points the GM toward a region route, a market pressure scene or a road ambush.",
        actors: [
          { type: "npc", role: "guard", label: "Border clerk", count: 1, placement: "at the frontier route marker" },
          { type: "npc", role: "villager", label: "Caravan witness", count: 1, placement: "near the last marked stop" },
        ],
        loot: [
          { label: "Ledger lead", value: "1 paper clue", note: "Names a tax chest, a route segment and a missing escort." },
        ],
        clues: [
          { label: "Changed seal", value: "paper clue", note: "The wax was replaced after the wagons left Rivergate." },
          { label: "Wrong distance", value: "map clue", note: "The reported travel time is too short for a loaded cart." },
        ],
        skills: [
          { label: "Trade", dc: 8, note: "Estimate whether the cargo value justifies the risk." },
          { label: "Lore", dc: 9, note: "Recall who controls the old toll stones." },
        ],
        twists: [
          { label: "Official silence", value: "optional", note: "A noble house wants the cargo recovered quietly." },
        ],
      },
      {
        id: "storm-on-the-pass",
        title: "Storm over the northern pass",
        tone: "is-warn",
        kinds: ["danger", "transition", "travel"],
        terrains: ["mountains", "pass", "hills"],
        minTier: 4,
        hook: "The northern pass is open on the atlas, but new lights above the ridges make guides refuse the road.",
        summary: "A global-to-region pressure hook for mountain travel, elite monsters and route closure.",
        actors: [
          { type: "npc", role: "hunter", label: "Pass guide", count: 1, placement: "at the safer route marker" },
        ],
        loot: [
          { label: "Weathered cache", value: "1 travel cache", note: "Cold gear, rope, old coin and a route token." },
        ],
        clues: [
          { label: "Blue ash", value: "weather clue", note: "Lightning struck stone more than once in the same place." },
        ],
        skills: [
          { label: "Survival", dc: 10, note: "Pick a route before the pass closes." },
          { label: "Athletics", dc: 9, note: "Judge whether loaded armor and packs can cross safely." },
        ],
      },
    ],
  },
  {
    id: "black_bor_local",
    level: "local",
    label: "Black Bor forest edge",
    asset: WORLD_MAP_ASSETS.ashfordVillageLocal,
    terrains: ["forest", "swamp", "river"],
    kinds: ["encounter", "danger", "loot", "social"],
    hotspotTypes: ["danger", "encounter", "loot", "npc", "social"],
    tags: ["black bor", "forest", "hunter", "camp", "woodline", "cache"],
    sceneScale: "forest/local",
    entryHint: "Trail from Ashford, charcoal track or riverbank approach.",
    exitHint: "Resolve into a forest encounter, hunter hut, river ford or hidden camp.",
    markers: [
      ["Hunter trail", "transition", "Main entry and exit line."],
      ["Charcoal pit", "clue", "Worksite, clue or campfire anchor."],
      ["Deep woodline", "danger", "Threat approach and concealment."],
      ["Old cache mark", "loot", "Hidden supplies or old hunter stash."],
    ],
    situations: [
      {
        id: "hunter-never-returned",
        title: "Hunter never returned",
        tone: "is-active",
        kinds: ["social", "danger", "encounter"],
        terrains: ["forest", "swamp"],
        hook: "A hunter's trail reaches the charcoal pit, but the return marks stop before the deep woodline.",
        summary: "A fast local forest hook that can become rescue, tracking or combat.",
        actors: [
          { type: "npc", role: "hunter", label: "Worried hunter", count: 1, placement: "at the hunter trail" },
          { type: "monster", role: "forest threat", label: "Forest threat", count: [1, 3], tags: ["wolf", "hound", "longtooth", "bear", "root"], placement: "inside the deep woodline" },
        ],
        loot: [
          { label: "Hunter stash", value: "1 hidden cache", note: "Arrows, food, simple medicine or pelt hooks." },
        ],
        clues: [
          { label: "Broken arrow wrap", value: "track clue", note: "The missing hunter fired while retreating." },
          { label: "Dragged fern line", value: "movement clue", note: "Something heavy moved parallel to the trail." },
        ],
        skills: [
          { label: "Survival", dc: 8, note: "Follow the trail without stepping into the wrong approach." },
          { label: "Perception", dc: 9, note: "Spot the stash and the ambush line." },
        ],
      },
      {
        id: "old-cache-new-owner",
        title: "Old cache, new owner",
        tone: "is-gold",
        kinds: ["loot", "danger"],
        terrains: ["forest", "river"],
        hook: "An old hunter mark is still good, but someone else has been using the cache recently.",
        summary: "A loot-forward local scene with a social or stealth turn before combat.",
        actors: [
          { type: "npc", role: "bandit", label: "Cache watcher", count: [1, 2], placement: "covering the cache mark from brush or a fallen trunk" },
        ],
        loot: [
          { label: "Shared cache", value: "1 hunter container", note: "Mixed supplies, a wrong coin purse and one map scrap." },
        ],
        clues: [
          { label: "Fresh cord knot", value: "ownership clue", note: "Not tied like a local hunter." },
        ],
        skills: [
          { label: "Stealth", dc: 9, note: "Reach the cache before the watcher reacts." },
          { label: "Streetwise", dc: 9, note: "Recognize the mark as a road-bandit handoff." },
        ],
      },
    ],
  },
  {
    id: "rivergate_warehouse_local",
    level: "local",
    label: "Rivergate warehouse row",
    asset: WORLD_MAP_ASSETS.rivergateCityLocal,
    terrains: ["town", "road", "river"],
    kinds: ["trade", "social", "loot", "danger"],
    hotspotTypes: ["trade", "npc", "loot", "danger", "social"],
    tags: ["warehouse", "rivergate", "market", "dock", "merchant", "stock"],
    sceneScale: "city/local",
    entryHint: "Gate street, dock stairs or market alley.",
    exitHint: "Resolve into market square, warehouse interior, street chase or river road.",
    markers: [
      ["Warehouse doors", "trade", "Inventory, stock and container handoff."],
      ["Dock ledger desk", "clue", "Paper trail and faction pressure."],
      ["Back alley", "danger", "Ambush, smuggling or chase route."],
      ["Market stairs", "transition", "Return to market square."],
    ],
    situations: [
      {
        id: "stock-arrived-wrong",
        title: "Stock arrived wrong",
        tone: "is-gold",
        kinds: ["trade", "social", "loot"],
        terrains: ["town", "river"],
        hook: "A merchant's crates arrive with the right seals and the wrong contents.",
        summary: "Use this to tie trade, Tarkov inventory, pending goods and a quick investigation.",
        actors: [
          { type: "npc", role: "villager", label: "Merchant factor", count: 1, placement: "at the warehouse doors" },
          { type: "npc", role: "guard", label: "Dock guard", count: 1, placement: "near the ledger desk" },
        ],
        loot: [
          { label: "Misdelivered crate", value: "1 trade container", note: "A safe source for tools, belts, attachments or materials." },
        ],
        clues: [
          { label: "Seal mismatch", value: "paper clue", note: "The wax is real, the cord pattern is not." },
          { label: "Wet crate bottom", value: "route clue", note: "The crate came by river, not by road." },
        ],
        skills: [
          { label: "Trade", dc: 8, note: "Price the missing contents and catch the false manifest." },
          { label: "Perception", dc: 9, note: "Find the crate that was opened and resealed." },
        ],
      },
      {
        id: "back-alley-collection",
        title: "Back alley collection",
        tone: "is-danger",
        kinds: ["danger", "encounter", "social"],
        terrains: ["town", "road"],
        hook: "A quiet debt collection behind the warehouse is one bad sentence away from violence.",
        summary: "A city pressure scene that can become negotiation, intimidation or a contained fight.",
        actors: [
          { type: "npc", role: "bandit", label: "Debt collectors", count: [2, 3], placement: "inside the back alley" },
          { type: "npc", role: "villager", label: "Cornered porter", count: 1, placement: "between crates and the alley exit" },
        ],
        loot: [
          { label: "Hidden purse", value: "1 small stash", note: "Copper/silver, IOU note or stolen key." },
        ],
        clues: [
          { label: "Repeated warehouse mark", value: "faction clue", note: "The same mark appears on three debt notes." },
        ],
        skills: [
          { label: "Persuasion", dc: 9, note: "De-escalate before blades come out." },
          { label: "Streetwise", dc: 8, note: "Identify who sent the collectors." },
        ],
      },
    ],
  },
  {
    id: "ashford_farmstead_local",
    level: "local",
    label: "Ashford farmstead ring",
    asset: WORLD_MAP_ASSETS.ashfordVillageLocal,
    terrains: ["village", "plains", "forest"],
    kinds: ["social", "npc", "encounter", "loot"],
    hotspotTypes: ["npc", "social", "encounter", "loot", "danger"],
    tags: ["ashford", "farm", "barn", "field", "village", "family"],
    sceneScale: "village/local",
    entryHint: "Village road, field lane or barn path.",
    exitHint: "Resolve into farmhouse, field encounter, forest edge or village square.",
    markers: [
      ["Farmhouse", "npc", "Family, rumor and safe conversation."],
      ["Barn", "loot", "Tools, animals and hidden supplies."],
      ["Field lane", "transition", "Route into field encounter."],
      ["Wood fence", "danger", "Threat or suspicious watcher line."],
    ],
    situations: [
      {
        id: "barn-door-open",
        title: "Barn door left open",
        tone: "is-active",
        kinds: ["social", "loot", "danger"],
        terrains: ["village", "plains"],
        hook: "The barn door is open before dawn, and the family insists nobody touched it.",
        summary: "A low-tier rural mystery that can point to animals, thieves or forest pressure.",
        actors: [
          { type: "npc", role: "villager", label: "Farm family", count: [1, 2], placement: "near the farmhouse" },
          { type: "monster", role: "field threat", label: "Field scavenger", count: [0, 2], tags: ["rat", "hound", "longtooth", "pack"], placement: "near the barn or fence line" },
        ],
        loot: [
          { label: "Farm supplies", value: "1 small cache", note: "Food, rope, tools, animal feed or a hidden coin jar." },
        ],
        clues: [
          { label: "Hay dragged outward", value: "track clue", note: "Something left through the field lane." },
          { label: "Clean boot beside mud", value: "human clue", note: "Not all tracks belong to animals." },
        ],
        skills: [
          { label: "Perception", dc: 7, note: "Separate animal tracks from boot marks." },
          { label: "Animal handling", dc: 8, note: "Calm livestock before searching the barn." },
        ],
      },
      {
        id: "field-line-signal",
        title: "Signal from the field line",
        tone: "is-warn",
        kinds: ["encounter", "npc", "danger"],
        terrains: ["plains", "village"],
        hook: "A lantern blinks from the field line at the same hour every night.",
        summary: "A village-to-field hook for stakeout, rescue, bandits or hidden travel.",
        actors: [
          { type: "npc", role: "bandit", label: "Field signalers", count: [1, 3], placement: "along the field lane or behind the fence" },
          { type: "npc", role: "villager", label: "Frightened watcher", count: 1, placement: "inside the farmhouse or by the barn" },
        ],
        loot: [
          { label: "Signal bundle", value: "1 clue cache", note: "Lantern oil, colored cloth, short note and road mark." },
        ],
        clues: [
          { label: "Repeated blink count", value: "code clue", note: "It is a count, not a warning." },
        ],
        skills: [
          { label: "Stealth", dc: 9, note: "Watch the field without being seen." },
          { label: "Lore", dc: 8, note: "Recognize old militia signal habits." },
        ],
      },
    ],
  },
  {
    id: "old_watch_ruins_local",
    level: "local",
    label: "Old watch ruins",
    asset: WORLD_MAP_ASSETS.kopernyPeakMiningLocal,
    terrains: ["ruins", "hills", "pass", "mountains"],
    kinds: ["danger", "loot", "encounter", "social"],
    hotspotTypes: ["danger", "loot", "encounter", "npc"],
    tags: ["ruins", "watchtower", "old road", "stone", "pass"],
    sceneScale: "ruins/local",
    entryHint: "Old road, broken stair or ridge path.",
    exitHint: "Resolve into tower encounter, cellar, pass road or ridge retreat.",
    markers: [
      ["Broken stair", "transition", "Vertical route and retreat."],
      ["Signal stone", "clue", "Old military mark or magic residue."],
      ["Collapsed room", "loot", "Hidden chest or remains."],
      ["Ridge shadow", "danger", "Threat approach and line of sight."],
    ],
    situations: [
      {
        id: "signal-stone-wakes",
        title: "Signal stone wakes",
        tone: "is-warn",
        kinds: ["danger", "encounter", "loot"],
        terrains: ["ruins", "hills", "pass"],
        minTier: 3,
        hook: "A dead signal stone flashes once when the party crosses the old road.",
        summary: "A ruin prompt for magic residue, vertical positions and a contained elite threat.",
        actors: [
          { type: "monster", role: "ruin threat", label: "Ruin guardian", count: [1, 2], tags: ["stone", "golem", "phantom", "bone", "horror"], placement: "near the signal stone or ridge shadow" },
        ],
        loot: [
          { label: "Collapsed room cache", value: "1 old chest", note: "Coin, old military gear, broken charm or map fragment." },
        ],
        clues: [
          { label: "Warm rune seam", value: "magic clue", note: "The signal stone reacted to a route, not to a person." },
        ],
        skills: [
          { label: "Lore", dc: 10, note: "Understand what the tower used to signal." },
          { label: "Athletics", dc: 9, note: "Use broken stairs without dropping gear." },
        ],
      },
      {
        id: "shelter-in-ruins",
        title: "Shelter in the ruins",
        tone: "is-active",
        kinds: ["social", "npc", "loot"],
        terrains: ["ruins", "hills"],
        hook: "Someone is living inside a collapsed room and keeping a careful watch on the old road.",
        summary: "A noncombat ruin contact that can reveal a route, cache or faction pressure.",
        actors: [
          { type: "npc", role: "hunter", label: "Ruin watcher", count: 1, placement: "inside the collapsed room" },
        ],
        loot: [
          { label: "Ruin shelter", value: "1 modest cache", note: "Food, old arrowheads, blanket, charcoal map." },
        ],
        clues: [
          { label: "Charcoal route map", value: "map clue", note: "Marks one safe path and one avoided road." },
        ],
        skills: [
          { label: "Persuasion", dc: 9, note: "Convince the watcher to share the real route." },
          { label: "Survival", dc: 8, note: "Tell how long the shelter has been used." },
        ],
      },
    ],
  },
  {
    id: "river_ford_encounter",
    level: "encounter",
    label: "River ford crossing",
    asset: WORLD_MAP_ASSETS.encounterForest,
    terrains: ["river", "swamp", "road", "forest"],
    kinds: ["transition", "danger", "encounter", "loot"],
    hotspotTypes: ["transition", "danger", "encounter", "loot"],
    tags: ["river", "ford", "swamp", "crossing", "ambush", "cache"],
    sceneScale: "encounter",
    entryHint: "Party starts at the dry bank or road edge.",
    exitHint: "Opposite bank, upstream trail or return to regional travel.",
    markers: [
      ["Dry bank", "entry", "Party start marker."],
      ["Shallow ford", "hazard", "Movement cost, prone risk and armor weight pressure."],
      ["Reed pocket", "danger", "Concealment, ambush or hidden creature."],
      ["Washed roots", "loot", "A cache can be lodged here."],
    ],
    situations: [
      {
        id: "ford-under-watch",
        title: "Ford under watch",
        tone: "is-danger",
        kinds: ["danger", "transition", "encounter"],
        terrains: ["river", "swamp"],
        hook: "The ford looks passable, but the reed pocket moves against the current.",
        summary: "A crossing encounter for armor weight, movement penalties, ranged lines and hidden threats.",
        actors: [
          { type: "monster", role: "river threat", label: "Ford threat", count: [1, 3], tags: ["fen", "marsh", "slither", "river", "wolf"], placement: "inside the reed pocket or shallow ford" },
        ],
        loot: [
          { label: "Washed cache", value: "1 wet container", note: "Water-damaged supplies, coins, hooks or fishing gear." },
        ],
        clues: [
          { label: "Current break", value: "hazard clue", note: "Something blocks the water under the surface." },
        ],
        skills: [
          { label: "Athletics", dc: 9, note: "Cross quickly while carrying heavy gear." },
          { label: "Survival", dc: 8, note: "Find the safest ford line." },
        ],
      },
      {
        id: "riverbank-handoff",
        title: "Riverbank handoff",
        tone: "is-active",
        kinds: ["social", "loot", "transition"],
        terrains: ["river", "road"],
        hook: "A sealed bundle is waiting under washed roots, but the intended courier is late.",
        summary: "A compact clue/loot scene for smuggling, courier work or faction setup.",
        actors: [
          { type: "npc", role: "villager", label: "Late courier", count: 1, placement: "approaching from the upstream trail" },
        ],
        loot: [
          { label: "Sealed bundle", value: "1 courier cache", note: "Quest item, letter, compact tool or small valuables." },
        ],
        clues: [
          { label: "Waterproof wrap", value: "trade clue", note: "Expensive preparation for a simple message." },
        ],
        skills: [
          { label: "Perception", dc: 8, note: "Find the bundle before the courier arrives." },
          { label: "Trade", dc: 9, note: "Judge the bundle's likely value without opening it." },
        ],
      },
    ],
  },
  {
    id: "ruined_watchtower_encounter",
    level: "encounter",
    label: "Ruined watchtower approach",
    asset: WORLD_MAP_ASSETS.encounterMineCave,
    terrains: ["ruins", "hills", "pass", "mountains"],
    kinds: ["danger", "encounter", "loot", "social"],
    hotspotTypes: ["danger", "encounter", "loot", "npc"],
    tags: ["ruins", "watchtower", "old road", "stone", "relic", "ridge"],
    sceneScale: "encounter",
    entryHint: "Party enters from the old road, broken stair or ridge trail.",
    exitHint: "Return to the road, climb the broken stair or retreat through the ridge trail.",
    markers: [
      ["Old road", "entry", "Party start and retreat route."],
      ["Broken stair", "hazard", "Vertical movement, fall risk and armor weight pressure."],
      ["Signal stone", "clue", "Relic mark, old military signal or magic residue."],
      ["Collapsed chamber", "loot", "Hidden cache, remains or relic container."],
      ["Ridge shadow", "danger", "Threat approach or ranged position."],
    ],
    situations: [
      {
        id: "tower-shadow-moves",
        title: "Tower shadow moves",
        tone: "is-danger",
        kinds: ["danger", "encounter"],
        terrains: ["ruins", "hills", "pass"],
        minTier: 3,
        hook: "The tower has no roof, but its shadow moves as if something is still standing above it.",
        summary: "A ruin encounter for vertical lines, cover, relic clues and a contained guardian threat.",
        actors: [
          { type: "monster", role: "ruin guardian", label: "Ruin guardian", count: [1, 2], tags: ["phantom", "bone", "stone", "horror", "golem"], placement: "near the signal stone or ridge shadow" },
        ],
        loot: [
          { label: "Collapsed chamber", value: "1 old cache", note: "Old coins, relic shard, broken charm or map fragment." },
        ],
        clues: [
          { label: "Shadow against sun", value: "magic clue", note: "The movement is tied to the signal stone, not the time of day." },
          { label: "Old boot nails", value: "route clue", note: "A patrol used the stair long after the tower fell." },
        ],
        skills: [
          { label: "Lore", dc: 10, note: "Identify the tower's old signal purpose." },
          { label: "Athletics", dc: 9, note: "Use the broken stair or pull someone clear of a fall." },
        ],
      },
      {
        id: "relic-under-stones",
        title: "Relic under stones",
        tone: "is-gold",
        kinds: ["loot", "social"],
        terrains: ["ruins", "hills"],
        hook: "A small relic is wedged under fallen stones, and a watcher claims it before the party touches it.",
        summary: "A loot/social ruin scene that can become a negotiation, claim dispute or quick ambush.",
        actors: [
          { type: "npc", role: "hunter", label: "Ruin watcher", count: 1, placement: "on the old road or above the broken stair" },
        ],
        loot: [
          { label: "Relic stones", value: "1 relic cache", note: "Charm, coin, old seal, map scrap or magic component." },
        ],
        clues: [
          { label: "Fresh pry marks", value: "search clue", note: "Someone tried to remove the relic without enough leverage." },
        ],
        skills: [
          { label: "Athletics", dc: 9, note: "Lift the stones without damaging the relic." },
          { label: "Persuasion", dc: 9, note: "Settle the claim before it turns violent." },
        ],
      },
    ],
  },
  {
    id: "warehouse_interior_building",
    level: "building",
    label: "Warehouse interior",
    asset: WORLD_MAP_ASSETS.encounterMarketSquare,
    terrains: ["town", "road", "river"],
    kinds: ["trade", "loot", "danger", "social"],
    hotspotTypes: ["trade", "loot", "danger", "npc", "social"],
    tags: ["warehouse", "interior", "merchant", "stock", "crate", "dock"],
    sceneScale: "building",
    entryHint: "Front loading doors, side office or river-side shutter.",
    exitHint: "Street, dock, office, cellar hatch or market square.",
    markers: [
      ["Loading doors", "entry", "Party entry and line of retreat."],
      ["Crate lanes", "cover", "Cover and searchable rows."],
      ["Ledger office", "clue", "Documents and social pressure."],
      ["Locked cage", "loot", "Valuable goods and trade hook."],
    ],
    situations: [
      {
        id: "missing-cage-key",
        title: "Missing cage key",
        tone: "is-gold",
        kinds: ["trade", "loot", "social"],
        terrains: ["town", "river"],
        hook: "The locked cage holds the right goods, but the only key vanished during unloading.",
        summary: "A trade/inventory scene with search, negotiation and a clean loot container target.",
        actors: [
          { type: "npc", role: "villager", label: "Warehouse keeper", count: 1, placement: "inside the ledger office" },
          { type: "npc", role: "guard", label: "Door guard", count: 1, placement: "near the loading doors" },
        ],
        loot: [
          { label: "Locked cage", value: "1 guarded container", note: "Use for attachments, belts, tools, materials or merchant stock." },
        ],
        clues: [
          { label: "Key scrape", value: "search clue", note: "Fresh scratch on a crate lane corner." },
          { label: "Short tally", value: "ledger clue", note: "One crate was counted twice." },
        ],
        skills: [
          { label: "Perception", dc: 8, note: "Find where the key was dragged or dropped." },
          { label: "Trade", dc: 8, note: "Spot the duplicate tally before accusations start." },
        ],
      },
      {
        id: "crate-lane-fight",
        title: "Crate lane fight",
        tone: "is-danger",
        kinds: ["danger", "encounter", "loot"],
        terrains: ["town", "road"],
        hook: "Someone kicks a crate lane over and turns the warehouse into tight cover.",
        summary: "A contained urban fight with cover, friendly fire risk and salvageable goods.",
        actors: [
          { type: "npc", role: "bandit", label: "Warehouse intruders", count: [2, 4], placement: "between crate lanes and the side office" },
        ],
        loot: [
          { label: "Scattered goods", value: "1 salvage pile", note: "Some goods are damaged if AoE or fire spreads." },
        ],
        clues: [
          { label: "Marked prybar", value: "tool clue", note: "The intruders brought the exact tool for this cage." },
        ],
        skills: [
          { label: "Athletics", dc: 9, note: "Push a crate lane or hold a choke point." },
          { label: "Perception", dc: 9, note: "Avoid hitting the wrong crate with AoE or ranged attacks." },
        ],
      },
    ],
  },
  {
    id: "healer_hut_building",
    level: "building",
    label: "Healer hut and herb room",
    asset: WORLD_MAP_ASSETS.encounterHouseInterior,
    terrains: ["village", "forest", "swamp", "river"],
    kinds: ["social", "npc", "loot", "craft"],
    hotspotTypes: ["npc", "social", "loot", "craft"],
    tags: ["healer", "hut", "herbs", "medicine", "forest", "village"],
    sceneScale: "building",
    entryHint: "Front mat, herb drying porch or back garden.",
    exitHint: "Village lane, garden path, forest trail or cellar shelf.",
    markers: [
      ["Treatment cot", "npc", "Medicine and body-part recovery hook."],
      ["Herb shelves", "loot", "Consumables, materials and clues."],
      ["Back garden", "transition", "Forest/swamp route."],
      ["Quiet corner", "clue", "Private confession or hidden symptom."],
    ],
    situations: [
      {
        id: "patient-with-wrong-wound",
        title: "Patient with the wrong wound",
        tone: "is-active",
        kinds: ["social", "npc", "craft"],
        terrains: ["village", "forest"],
        hook: "The patient says it was a work accident, but the wound pattern says otherwise.",
        summary: "A medicine-forward scene for diagnosis, body zones, conditions and a social reveal.",
        actors: [
          { type: "npc", role: "priest", label: "Local healer", count: 1, placement: "by the treatment cot" },
          { type: "npc", role: "villager", label: "Injured patient", count: 1, placement: "on the treatment cot" },
        ],
        loot: [
          { label: "Herb shelf", value: "1 medicine cache", note: "Bandages, salves, herbs or antidote component." },
        ],
        clues: [
          { label: "Clean blade line", value: "wound clue", note: "Not from a fall or tool accident." },
          { label: "Mud under cot", value: "route clue", note: "The patient was moved from outside the village." },
        ],
        skills: [
          { label: "Medicine", dc: 8, note: "Identify the wound source and stabilize the patient." },
          { label: "Persuasion", dc: 9, note: "Get the patient or healer to say who brought them in." },
        ],
      },
      {
        id: "missing-antidote-jar",
        title: "Missing antidote jar",
        tone: "is-warn",
        kinds: ["loot", "social", "danger"],
        terrains: ["swamp", "forest", "village"],
        hook: "A labeled antidote jar is missing, and the next patient may need it tonight.",
        summary: "A small hut investigation that can lead into swamp/forest encounters.",
        actors: [
          { type: "npc", role: "priest", label: "Worried healer", count: 1, placement: "between herb shelves and treatment cot" },
        ],
        loot: [
          { label: "Medicine supplies", value: "1 partial cache", note: "Everything except the missing jar." },
        ],
        clues: [
          { label: "Sticky ring", value: "shelf clue", note: "The jar was removed recently with wet hands." },
        ],
        skills: [
          { label: "Medicine", dc: 9, note: "Work out what poison or condition the jar treats." },
          { label: "Survival", dc: 8, note: "Track where the thief went from the back garden." },
        ],
      },
    ],
  },
  {
    id: "miner_bunkhouse_building",
    level: "building",
    label: "Miner bunkhouse",
    asset: WORLD_MAP_ASSETS.encounterHouseInterior,
    terrains: ["mine", "town", "hills", "mountains"],
    kinds: ["social", "craft", "danger", "loot"],
    hotspotTypes: ["npc", "craft", "danger", "loot", "social"],
    tags: ["miner", "bunkhouse", "mine", "tools", "shift", "ore"],
    sceneScale: "building",
    entryHint: "Front room, boot rack or shift door.",
    exitHint: "Mine yard, tool shed, sleeping room or cellar.",
    markers: [
      ["Shift board", "clue", "Who was where and when."],
      ["Tool rack", "craft", "Repair parts and sabotage clue."],
      ["Bunks", "npc", "Witnesses, belongings and tension."],
      ["Back cellar", "loot", "Hidden supplies or contraband."],
    ],
    situations: [
      {
        id: "wrong-name-on-shift-board",
        title: "Wrong name on the shift board",
        tone: "is-active",
        kinds: ["social", "craft", "danger"],
        terrains: ["mine", "hills"],
        hook: "A miner is listed on a shift they swear they never worked.",
        summary: "A bunkhouse investigation that connects mine accidents, repair parts and NPC pressure.",
        actors: [
          { type: "npc", role: "crafter", label: "Mine foreman", count: 1, placement: "near the shift board" },
          { type: "npc", role: "villager", label: "Accused miner", count: 1, placement: "near the bunks" },
        ],
        loot: [
          { label: "Tool rack", value: "1 tool cache", note: "Mining tools, rope, straps, repair metal or missing pick head." },
        ],
        clues: [
          { label: "Chalk overwritten", value: "board clue", note: "The name was changed after the shift began." },
          { label: "Clean pick head", value: "tool clue", note: "One tool was washed instead of repaired." },
        ],
        skills: [
          { label: "Blacksmithing", dc: 8, note: "Read tool wear and identify the wrong pick." },
          { label: "Persuasion", dc: 9, note: "Get miners to speak against the foreman or guild." },
        ],
      },
      {
        id: "cellar-contraband",
        title: "Cellar contraband",
        tone: "is-warn",
        kinds: ["loot", "danger", "social"],
        terrains: ["mine", "town"],
        hook: "The bunkhouse cellar holds supplies nobody wants listed on the shift board.",
        summary: "A loot/social pressure scene for faction hooks and mine black market goods.",
        actors: [
          { type: "npc", role: "bandit", label: "Contraband holder", count: [1, 2], placement: "at the back cellar or tool rack" },
        ],
        loot: [
          { label: "Contraband crate", value: "1 hidden container", note: "Ore, tools, illegal charms, stolen straps or silver." },
        ],
        clues: [
          { label: "Guild brand scraped off", value: "faction clue", note: "The goods were stolen from official stock." },
        ],
        skills: [
          { label: "Streetwise", dc: 9, note: "Identify where the contraband can be sold." },
          { label: "Perception", dc: 8, note: "Find the false plank before anyone blocks the door." },
        ],
      },
    ],
  },
  {
    id: "chapel_cellar_building",
    level: "building",
    label: "Road chapel cellar",
    asset: WORLD_MAP_ASSETS.encounterHouseInterior,
    terrains: ["road", "village", "ruins", "hills"],
    kinds: ["social", "npc", "loot", "danger"],
    hotspotTypes: ["npc", "social", "loot", "danger"],
    tags: ["chapel", "cellar", "road shrine", "priest", "relic", "ruins"],
    sceneScale: "building",
    entryHint: "Front chapel room, side door or cellar stair.",
    exitHint: "Road, grave path, cellar tunnel or village lane.",
    markers: [
      ["Front shrine", "npc", "Prayer, witness or social anchor."],
      ["Donation chest", "loot", "Coins, offerings and temptation."],
      ["Cellar stair", "danger", "Threat, secret or hidden route."],
      ["Old wall niche", "clue", "Relic mark or buried history."],
    ],
    situations: [
      {
        id: "donation-chest-open",
        title: "Donation chest open",
        tone: "is-active",
        kinds: ["social", "loot", "npc"],
        terrains: ["road", "village"],
        hook: "The donation chest is open, but the priest insists nothing was stolen.",
        summary: "A social clue scene that can reveal a relic, a hidden patient or a road debt.",
        actors: [
          { type: "npc", role: "priest", label: "Road priest", count: 1, placement: "near the front shrine" },
          { type: "npc", role: "villager", label: "Quiet witness", count: 1, placement: "near the side door" },
        ],
        loot: [
          { label: "Donation chest", value: "1 modest cache", note: "Copper, silver, prayer tokens or a planted clue." },
        ],
        clues: [
          { label: "No forced lock", value: "social clue", note: "Someone with a key opened it." },
          { label: "Dustless relic mark", value: "relic clue", note: "Something was removed from the wall niche." },
        ],
        skills: [
          { label: "Lore", dc: 8, note: "Identify what the missing relic mark means." },
          { label: "Persuasion", dc: 9, note: "Get the priest to explain why they are hiding the theft." },
        ],
      },
      {
        id: "cellar-stair-breathes",
        title: "Cellar stair breathes",
        tone: "is-danger",
        kinds: ["danger", "encounter", "loot"],
        terrains: ["ruins", "hills", "road"],
        minTier: 3,
        hook: "Cold air rises from the chapel cellar when nobody is near the stair.",
        summary: "A compact building danger scene that can become a cellar fight or relic clue.",
        actors: [
          { type: "monster", role: "cellar threat", label: "Cellar threat", count: [1, 2], tags: ["phantom", "bone", "pit", "horror", "shade"], placement: "below the cellar stair or behind the old wall niche" },
        ],
        loot: [
          { label: "Old wall niche", value: "1 relic cache", note: "Relic shard, old coin, prayer charm or sealed bone case." },
        ],
        clues: [
          { label: "Frost on lower steps", value: "hazard clue", note: "The cold begins below the normal cellar floor." },
        ],
        skills: [
          { label: "Lore", dc: 10, note: "Recognize what kind of relic or spirit is involved." },
          { label: "Medicine", dc: 9, note: "Help anyone touched by the cellar cold." },
        ],
      },
    ],
  },
]);

export const WORLD_MAP_SITUATION_MAP_POOL = Object.freeze([
  ...WORLD_MAP_CORE_SITUATION_MAP_POOL,
  ...WORLD_MAP_IRON_HILLS_EXPANDED_SITUATION_MAP_POOL,
]);

function inferTier(focusTile = {}, localView = {}, encounterView = {}, encounterKit = {}) {
  const raw =
    encounterKit?.tier
    ?? focusTile?.poiMeta?.tier
    ?? focusTile?.tier
    ?? localView?.danger
    ?? encounterView?.danger
    ?? focusTile?.danger
    ?? 2;
  return clamp(Math.round(num(raw, 2)), 1, 10);
}

function activeHotspot(localView = {}, encounterView = {}) {
  return localView.activeHotspot ?? encounterView.activeHotspot ?? null;
}

function inferKind({ focusTile = {}, localView = {}, encounterView = {}, sceneBrief = {} } = {}) {
  const hotspot = activeHotspot(localView, encounterView);
  return str(sceneBrief.kind) || str(hotspot?.hotspotType) || str(focusTile?.terrain) || "encounter";
}

function contextText(context = {}) {
  const hotspot = context.hotspot ?? null;
  return [
    context.activeLevelId,
    context.kind,
    context.terrain,
    context.focusTile?.label,
    context.focusTile?.terrainLabel,
    hotspot?.id,
    hotspot?.label,
    hotspot?.kind,
    hotspot?.hotspotType,
    hotspot?.npcRole,
    hotspot?.detail,
  ].filter(Boolean).join(" ");
}

function scoreMap(map, context = {}) {
  const level = normalizeLevel(context.activeLevelId);
  const kind = str(context.kind);
  const terrain = str(context.terrain);
  const hotspotType = str(context.hotspot?.hotspotType);
  const text = contextText(context);
  const focusLabel = lower(context.focusTile?.label);
  const genericTags = new Set([
    "trade",
    "social",
    "npc",
    "danger",
    "encounter",
    "loot",
    "craft",
    "transition",
    "travel",
    terrain,
    kind,
    hotspotType,
  ].map(lower).filter(Boolean));
  const specificTags = safeArray(map.tags)
    .map(str)
    .filter(tag => lower(tag).length >= 5 && !genericTags.has(lower(tag)));
  const buildingIntent = ["craft", "trade", "social", "npc", "loot"].includes(kind)
    || ["craft", "trade", "social", "npc", "loot"].includes(hotspotType)
    || textHasAny(text, [
      "house",
      "home",
      "forge",
      "workshop",
      "blacksmith",
      "cottage",
      "interior",
      "warehouse",
      "hut",
      "healer",
      "bunkhouse",
      "chapel",
      "cellar",
      "farmhouse",
    ]);
  let score = 0;

  if (map.level === level) score += 34;
  if (level === "encounter" && map.level === "building" && buildingIntent) score += 28;
  if (level === "local" && map.level === "building" && buildingIntent) score += 8;
  if (level === "region" && map.level === "local" && context.focusTile?.poi) score += 4;
  if (safeArray(map.terrains).includes(terrain)) score += 15;
  if (safeArray(map.kinds).includes(kind)) score += 12;
  if (hotspotType && safeArray(map.hotspotTypes).includes(hotspotType)) score += 14;
  if (textHasAny(text, map.tags)) score += 10;
  if (focusLabel && textHasAny(focusLabel, specificTags)) score += 16;
  if (textHasAny(text, [map.id, map.label])) score += 12;

  return score + Math.max(1, Number(map.weight ?? 1));
}

function chooseMap(context = {}, rng = Math.random) {
  const scored = WORLD_MAP_SITUATION_MAP_POOL
    .map(map => ({ ...map, _score: scoreMap(map, context) }))
    .filter(map => map._score > 0)
    .sort((a, b) => b._score - a._score || a.label.localeCompare(b.label));
  const topScore = scored[0]?._score ?? 0;
  const shortlist = scored.filter(map => map._score >= Math.max(1, topScore - 8)).slice(0, 5);
  return pickWeighted(shortlist.map(map => ({ ...map, weight: map._score })), rng)
    ?? pickWeighted(WORLD_MAP_SITUATION_MAP_POOL, rng);
}

function scoreTemplate(template = {}, context = {}) {
  const kind = str(context.kind);
  const hotspotType = str(context.hotspot?.hotspotType);
  const terrain = str(context.terrain);
  const tier = num(context.tier, 1);
  const minTier = Number(template.minTier);
  const maxTier = Number(template.maxTier);
  const text = contextText(context);
  let score = 1;
  if (safeArray(template.kinds).includes(kind)) score += 16;
  if (hotspotType && safeArray(template.hotspotTypes).includes(hotspotType)) score += 10;
  if (terrain && safeArray(template.terrains).includes(terrain)) score += 6;
  if (Number.isFinite(minTier) || Number.isFinite(maxTier)) {
    const aboveMin = !Number.isFinite(minTier) || tier >= minTier;
    const belowMax = !Number.isFinite(maxTier) || tier <= maxTier;
    score += aboveMin && belowMax ? 4 : -4;
  }
  if (textHasAny(text, template.tags)) score += 3;
  if (textHasAny(contextText(context), [template.id, template.title, template.hook])) score += 4;
  return Math.max(1, score);
}

function chooseTemplate(map = {}, context = {}, rng = Math.random) {
  const templates = safeArray(map.situations);
  if (!templates.length) return null;
  const scored = templates
    .map(template => ({
      ...template,
      weight: scoreTemplate(template, context),
    }))
    .sort((a, b) => b.weight - a.weight || str(a.title).localeCompare(str(b.title)));
  const topScore = scored[0]?.weight ?? 1;
  const shortlist = scored.filter(template => template.weight >= Math.max(1, topScore - 4));
  return pickWeighted(shortlist, rng) ?? scored[0] ?? templates[0];
}

function normalizeMonsterRows(rows = []) {
  return safeArray(rows)
    .map(entry => {
      const id = str(entry.id) || str(entry.value);
      const monster = MONSTER_BESTIARY[id] ?? null;
      return {
        id,
        label: str(entry.label) || monster?.label || id,
        tier: num(entry.tier ?? monster?.tier, 1),
        lootPool: str(entry.lootPool ?? monster?.lootPool),
        img: str(entry.img ?? monster?.img),
        source: "kit",
      };
    })
    .filter(entry => entry.id);
}

function monsterKeywordScore(monster = {}, tags = [], tier = 1) {
  const haystack = `${monster.id} ${monster.label} ${monster.desc} ${monster.lootPool}`;
  const tagScore = safeArray(tags).reduce((sum, tag) => sum + (lower(haystack).includes(lower(tag)) ? 3 : 0), 0);
  const tierScore = Math.max(0, 8 - Math.abs(num(monster.tier, tier) - tier));
  return tagScore + tierScore;
}

function selectMonster(spec = {}, context = {}) {
  const tier = num(context.tier, 1);
  const kitRows = normalizeMonsterRows(context.encounterKit?.monsterRows);
  const kitHit = kitRows
    .map(monster => ({ monster, score: monsterKeywordScore(monster, spec.tags, tier) + 4 }))
    .filter(entry => entry.score > 4)
    .sort((a, b) => b.score - a.score || a.monster.tier - b.monster.tier)[0]?.monster;
  if (kitHit) return kitHit;

  return Object.values(MONSTER_BESTIARY ?? {})
    .map(monster => ({ monster, score: monsterKeywordScore(monster, spec.tags, tier) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(num(a.monster.tier, tier) - tier) - Math.abs(num(b.monster.tier, tier) - tier))[0]?.monster ?? null;
}

function selectNpc(spec = {}, context = {}) {
  const wantedRole = str(spec.role) || "villager";
  const tier = num(context.tier, 1);
  const kitRows = safeArray(context.encounterKit?.npcRows)
    .map(entry => {
      const id = str(entry.id) || str(entry.value);
      const npc = NPC_PACK_ACTORS[id] ?? null;
      return {
        id,
        label: str(entry.label) || npc?.label || id,
        role: str(entry.role ?? npc?.specialization),
        sceneRole: str(entry.sceneRole ?? npc?.sceneRole),
        tier: num(entry.tier ?? npc?.tier, tier),
        img: str(entry.img ?? npc?.img),
        source: "kit",
      };
    })
    .filter(entry => entry.id);
  const kitHit = kitRows
    .map(npc => ({
      npc,
      score: (npc.role === wantedRole ? 10 : 0) + Math.max(0, 6 - Math.abs(num(npc.tier, tier) - tier)),
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.npc;
  if (kitHit) return kitHit;

  return Object.values(NPC_PACK_ACTORS ?? {})
    .map(npc => ({
      npc,
      score: (npc.specialization === wantedRole ? 10 : 0)
        + (npc.sceneRole === spec.sceneRole ? 4 : 0)
        + Math.max(0, 5 - Math.abs(num(npc.tier, tier) - tier)),
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(num(a.npc.tier, tier) - tier) - Math.abs(num(b.npc.tier, tier) - tier))[0]?.npc ?? null;
}

function buildActorRow(spec = {}, context = {}, rng = Math.random) {
  const count = rangeCount(spec.count, rng, 1);
  if (count <= 0) return null;
  const type = str(spec.type) || "npc";
  if (type === "monster") {
    const monster = selectMonster(spec, context);
    const id = str(monster?.id) || str(spec.id) || lower(spec.label).replace(/[^a-z0-9]+/g, "_");
    const name = str(monster?.label) || str(spec.label) || id;
    return row(
      str(spec.label) || name,
      `x${count}`,
      `${name}${id ? ` (${id})` : ""} - ${str(spec.placement) || "place on the map"}`,
      "is-danger",
      {
        id,
        actorKind: "monster",
        kind: "monster",
        count,
        tier: monster?.tier ?? context.tier ?? "",
        lootPool: monster?.lootPool ?? "",
        placement: str(spec.placement),
        sourceLabel: name,
        img: monster?.img ?? "",
      },
    );
  }

  const npc = selectNpc(spec, context);
  const id = str(npc?.id) || str(spec.id) || str(spec.role) || lower(spec.label).replace(/[^a-z0-9]+/g, "_");
  const name = str(npc?.label) || str(spec.label) || id;
  const role = str(npc?.specialization ?? spec.role);
  return row(
    str(spec.label) || name,
    `x${count}`,
    `${name}${id ? ` (${id})` : ""} - ${str(spec.placement) || "place on the map"}`,
    role === "bandit" ? "is-danger" : role === "crafter" ? "is-gold" : "is-active",
    {
      id,
      actorKind: "npc",
      kind: "npc",
      count,
      tier: npc?.tier ?? context.tier ?? "",
      role,
      sceneRole: npc?.sceneRole ?? spec.sceneRole ?? "",
      placement: str(spec.placement),
      sourceLabel: name,
      img: npc?.img ?? "",
    },
  );
}

function dcFor(spec = {}, tier = 1) {
  const raw = Number(spec.dc);
  if (Number.isFinite(raw)) return clamp(Math.round(raw + Math.max(0, tier - 2) * 0.5), 6, 18);
  return clamp(7 + Math.ceil(tier / 2), 6, 18);
}

function buildRowsFromSpecs(specs = [], tone = "is-safe") {
  return safeArray(specs).map(spec => row(spec.label, spec.value, spec.note, spec.tone || tone, spec));
}

function markerTone(kind = "") {
  const key = str(kind);
  if (["danger", "hazard", "monster", "enemy"].includes(key)) return "is-danger";
  if (["trade", "craft", "loot", "cache", "reward"].includes(key)) return "is-gold";
  if (["npc", "social", "quest", "clue"].includes(key)) return "is-active";
  return "is-road";
}

function sceneAnchorFor(kind = "", index = 0) {
  const key = str(kind);
  const presets = {
    map: { anchor: "full scene", x: 50, y: 50, w: 100, h: 100 },
    entry: { anchor: "west/safe edge", x: 10, y: 52, w: 16, h: 22 },
    exit: { anchor: "opposite/return edge", x: 90, y: 50, w: 16, h: 22 },
    transition: { anchor: "route edge", x: 84, y: 46, w: 18, h: 22 },
    monster: { anchor: "threat approach", x: 68, y: 44, w: 18, h: 18 },
    danger: { anchor: "threat approach", x: 70, y: 38, w: 20, h: 18 },
    hazard: { anchor: "hazard center", x: 58, y: 46, w: 22, h: 18 },
    npc: { anchor: "social focus", x: 46, y: 48, w: 14, h: 14 },
    social: { anchor: "social focus", x: 44, y: 50, w: 18, h: 16 },
    loot: { anchor: "searchable cache", x: 54, y: 58, w: 13, h: 12 },
    cache: { anchor: "searchable cache", x: 54, y: 58, w: 13, h: 12 },
    clue: { anchor: "clue object", x: 48, y: 52, w: 12, h: 10 },
    cover: { anchor: "cover line", x: 40, y: 44, w: 22, h: 14 },
    quest: { anchor: "objective focus", x: 52, y: 50, w: 18, h: 16 },
  };
  const base = presets[key] ?? presets.quest;
  if (["map", "entry", "exit", "transition"].includes(key)) return { ...base };
  const offset = (Number(index) || 0) % 4;
  return {
    ...base,
    x: clamp(Math.round(base.x + (offset - 1.5) * 4), 4, 96),
    y: clamp(Math.round(base.y + (offset % 2 ? 4 : -3)), 4, 96),
  };
}

function blueprintRow(label, value, note, kind, action, index = 0, extra = {}) {
  const anchor = sceneAnchorFor(kind, index);
  return row(label, value, `${anchor.anchor}. ${note}`.trim(), markerTone(kind), {
    markerKind: kind,
    sceneLayer: extra.sceneLayer || "manual",
    action,
    anchor: anchor.anchor,
    x: anchor.x,
    y: anchor.y,
    w: anchor.w,
    h: anchor.h,
    priority: extra.priority ?? index + 1,
    ...extra,
  });
}

function buildSceneBlueprintRows({ map = {}, mapAsset = "", actorRows = [], lootRows = [], clueRows = [], questRows = [] } = {}) {
  const mapMarkers = safeArray(map?.markers).map((marker, index) => {
    const kind = str(marker[1]) || "marker";
    return blueprintRow(
      str(marker[0]) || `Marker ${index + 1}`,
      kind,
      str(marker[2]) || "Use as a visible map marker.",
      kind,
      kind === "entry" || kind === "transition" ? "route-hotspot" : "map-hotspot",
      index,
      { sceneLayer: "map-marker" },
    );
  });

  return uniqueRows([
    blueprintRow("Scene asset", map?.label || "Generated map", mapAsset ? `Use backdrop ${mapAsset}.` : "Pick or create a matching Foundry Scene.", "map", "create-scene", 0, {
      sceneLayer: "scene",
      asset: mapAsset,
      priority: 0,
    }),
    blueprintRow("Entry hotspot", "Party start", map?.entryHint || "Place party at a safe readable edge.", "entry", "spawn-party", 0, {
      sceneLayer: "entry",
      priority: 1,
    }),
    ...mapMarkers,
    ...actorRows.map((actor, index) => blueprintRow(
      actor.label,
      actor.value,
      actor.placement || actor.note || "Place this actor group manually.",
      actor.actorKind === "monster" ? "monster" : "npc",
      "place-actor",
      index,
      {
        sceneLayer: "actor",
        id: actor.id,
        actorKind: actor.actorKind,
        count: actor.count,
        role: actor.role,
        sourceLabel: actor.sourceLabel,
      },
    )),
    ...lootRows.map((loot, index) => blueprintRow(
      loot.label,
      loot.value,
      loot.note || "Create a container, corpse loot or searchable stash.",
      "loot",
      "place-loot",
      index,
      { sceneLayer: "loot" },
    )),
    ...clueRows.slice(0, 4).map((clue, index) => blueprintRow(
      clue.label,
      clue.value,
      clue.note || "Place as inspectable clue or GM note.",
      "clue",
      "place-clue",
      index,
      { sceneLayer: "clue" },
    )),
    ...questRows.slice(0, 1).map((quest, index) => blueprintRow(
      quest.label,
      quest.value,
      quest.note || "Primary objective marker.",
      "quest",
      "objective-marker",
      index,
      { sceneLayer: "objective" },
    )),
    blueprintRow("Exit hotspot", "Transition", map?.exitHint || "Route back to previous layer or next location.", "exit", "route-hotspot", 0, {
      sceneLayer: "exit",
      priority: 99,
    }),
  ]);
}

function buildSceneHotspotRows(blueprintRows = []) {
  return safeArray(blueprintRows)
    .filter(entry => ["entry", "exit", "transition", "loot", "cache", "clue", "quest", "npc", "monster", "danger", "hazard", "cover"].includes(str(entry.markerKind)))
    .map((entry, index) => row(
      entry.label,
      `${entry.action || "hotspot"} @ ${entry.x ?? "-"}%,${entry.y ?? "-"}%`,
      entry.note,
      entry.tone,
      {
        ...entry,
        priority: entry.priority ?? index + 1,
      },
    ));
}

function buildSceneInstructionRows({ map = {}, actorRows = [], lootRows = [], clueRows = [], skillRows = [], sceneHotspotRows = [] } = {}) {
  return [
    row("1. Scene", map?.label || "Generated map", "Create/open the Scene using the suggested map asset, then add blueprint notes as map pins or drawings.", "is-road", { action: "create-scene" }),
    row("2. Entry/exit", `${sceneHotspotRows.filter(entry => ["entry", "exit", "transition"].includes(str(entry.markerKind))).length} route hotspots`, "Mark party entry, retreat edge and transition back to the map layer.", "is-road", { action: "place-routes" }),
    row("3. Actors", `${actorRows.length} actor rows`, "Drag prepared NPC/monster Actors manually and keep their original placement notes visible.", actorRows.length ? "is-warn" : "is-safe", { action: "place-actors" }),
    row("4. Loot/cache", `${lootRows.length} loot rows`, "Create a container or searchable stash, then route loot into Tarkov inventory after discovery.", lootRows.length ? "is-gold" : "is-safe", { action: "place-loot" }),
    row("5. Clues/checks", `${clueRows.length} clues / ${skillRows.length} checks`, "Turn clues into scene notes; use skill rows as reveal conditions.", clueRows.length || skillRows.length ? "is-active" : "is-safe", { action: "place-clues" }),
    row("6. Safety", "manual review", "Before play, verify cover, AoE/friendly fire lines, light, walls and token scale.", "is-warn", { action: "manual-review" }),
  ];
}

function canonicalNavigationLevel(level = DEFAULT_LEVEL) {
  const key = str(level);
  if (key === "building") return "encounter";
  return ["global", "region", "local", "encounter"].includes(key) ? key : DEFAULT_LEVEL;
}

function buildNavigationRows({ map = {}, context = {} } = {}) {
  const rawLevel = str(map?.level || context.activeLevelId || DEFAULT_LEVEL);
  const level = canonicalNavigationLevel(rawLevel);
  const label = str(map?.label) || str(context.focusTile?.label) || "Generated location";
  const hotspotId = str(context.kind || context.hotspot?.id || context.hotspot?.hotspotType);
  const col = context.focusTile?.col ?? 5;
  const rowCoord = context.focusTile?.row ?? 5;
  const isBuilding = rawLevel === "building";
  return [
    row("1. Global", "Iron Hills atlas", level === "global" ? "Current generation starts at campaign atlas scale." : "Campaign context; choose region before local play.", level === "global" ? "is-active" : "is-safe", {
      navLevel: "global",
      navAction: "open-world-map",
      navOrder: 1,
    }),
    row("2. Region", "Iron Hills route", level === "region" ? `${label}; route within the regional travel layer.` : "Route toward the local focus before dropping into scene scale.", level === "region" ? "is-active" : "is-road", {
      navLevel: "region",
      navAction: "open-world-map",
      navOrder: 2,
      col,
      row: rowCoord,
    }),
    row("3. Local", level === "global" ? "Choose local focus" : label, level === "local" ? "Current generation is a city/locality map." : "Use local layer to choose district, building, field edge or encounter approach.", level === "local" ? "is-active" : "is-road", {
      navLevel: "local",
      navAction: "open-world-map",
      navOrder: 3,
      col,
      row: rowCoord,
      hotspotId,
    }),
    row("4. Scene", `${label} / ${isBuilding ? "building/interior" : "encounter scene"}`, level === "encounter" ? "Current generation is ready for Foundry Scene setup." : "Final drop into a house, field, market square, cave or combat encounter.", level === "encounter" ? "is-active" : "is-warn", {
      navLevel: "encounter",
      navAction: "open-world-map",
      navOrder: 4,
      col,
      row: rowCoord,
      hotspotId,
      rawLevel,
    }),
    row("Entry route", "party entry", str(map?.entryHint) || "Choose a safe entry point.", "is-road", {
      navLevel: level,
      navAction: "entry",
      hotspotId: "entry",
    }),
    row("Exit route", "return / transition", str(map?.exitHint) || "Return to the previous layer.", "is-road", {
      navLevel: level === "encounter" ? "local" : "region",
      navAction: "exit",
      hotspotId: "exit",
    }),
  ];
}

function buildSkillRows(specs = [], tier = 1) {
  return safeArray(specs).map(spec => row(
    spec.label,
    `DC ${dcFor(spec, tier)}`,
    spec.note,
    spec.tone || "is-active",
    { skill: lower(spec.label), dc: dcFor(spec, tier) },
  ));
}

function rewardCoinsForTier(tier = 1, kind = "encounter") {
  const t = clamp(Math.round(num(tier, 1)), 1, 10);
  const base = 8 + t * 7;
  const multiplier = kind === "trade" ? 1.25
    : kind === "danger" || kind === "encounter" ? 1.4
      : kind === "loot" ? 1.1
        : 1;
  return Math.round(base * multiplier);
}

function defaultQuestVerb(kind = "encounter") {
  const key = str(kind);
  if (key === "trade") return "Recover or verify";
  if (key === "craft") return "Repair or identify";
  if (key === "loot") return "Find and secure";
  if (key === "social" || key === "npc") return "Convince or protect";
  if (key === "transition" || key === "travel") return "Cross or scout";
  if (key === "danger") return "Remove or contain";
  return "Resolve";
}

function rumorPrefixFor(context = {}, map = {}) {
  const terrain = str(context.terrain);
  if (context.kind === "trade") return "Market rumor";
  if (context.kind === "craft") return "Workshop rumor";
  if (context.kind === "loot") return "Cache rumor";
  if (context.kind === "social" || context.kind === "npc") return "Local rumor";
  if (terrain === "forest") return "Trail rumor";
  if (terrain === "mine" || terrain === "dungeon") return "Mine rumor";
  if (terrain === "river" || terrain === "swamp") return "Ford rumor";
  if (terrain === "ruins") return "Old-road rumor";
  if (map.level === "global" || map.level === "region") return "Travel rumor";
  return "Situation rumor";
}

function defaultLootTheme(context = {}, map = {}) {
  const terrain = str(context.terrain);
  const kind = str(context.kind);
  if (kind === "trade") return "merchant stock or warehouse crate";
  if (kind === "craft") return "tools, materials or repair parts";
  if (kind === "loot") return "hidden cache or container";
  if (terrain === "forest") return "hunter cache";
  if (terrain === "mine" || terrain === "dungeon") return "ore, tools or mine salvage";
  if (terrain === "ruins") return "old coin, relic or sealed container";
  if (terrain === "river" || terrain === "swamp") return "wet cache or courier bundle";
  if (terrain === "town") return "trade goods or coin purse";
  if (terrain === "village" || terrain === "plains") return "farm tools, food or local supplies";
  return `${map.label || "scene"} loot`;
}

function buildQuestRows(template = {}, context = {}, map = {}, actorRows = [], lootRows = []) {
  const explicitRows = buildRowsFromSpecs(template.questRows ?? template.quests, "is-active");
  if (explicitRows.length) return explicitRows;
  const kind = str(context.kind) || "encounter";
  const title = str(template.title) || str(map.label) || "Generated situation";
  const objective = `${defaultQuestVerb(kind)}: ${title}`;
  const actorText = actorRows.length
    ? `${actorRows.map(row => `${row.label} ${row.value}`.trim()).join(", ")}`
    : "no required actors";
  const lootText = lootRows.length
    ? lootRows.map(row => row.label).join(", ")
    : defaultLootTheme(context, map);
  return [
    row("Quest seed", objective, `${map.label || "Map pool"} · t${context.tier} · ${kind}`, "is-active", {
      kind: "quest",
      objective,
      tier: context.tier,
      scope: map.level || context.activeLevelId,
    }),
    row("Quest cast", actorRows.length ? actorText : "GM-selected cast", "Use actor rows as required NPC/monster placement.", actorRows.length ? "is-warn" : "is-safe", {
      kind: "quest-cast",
    }),
    row("Quest proof", lootText, "What the party can bring back, inspect or trade after resolving the scene.", "is-gold", {
      kind: "quest-proof",
    }),
  ];
}

function buildRumorRows(template = {}, context = {}, map = {}) {
  const explicitRows = buildRowsFromSpecs(template.rumorRows ?? template.rumors, "is-road");
  if (explicitRows.length) return explicitRows;
  const prefix = rumorPrefixFor(context, map);
  const title = str(template.title) || str(map.label) || "the scene";
  const hook = str(template.hook) || `Something is wrong around ${map.label || "the route"}.`;
  return [
    row(prefix, title, hook, "is-road", {
      kind: "rumor",
      scope: map.level || context.activeLevelId,
    }),
  ];
}

function buildRewardRows(template = {}, context = {}, map = {}) {
  const explicitRows = buildRowsFromSpecs(template.rewardRows ?? template.rewards, "is-gold");
  if (explicitRows.length) return explicitRows;
  const kind = str(context.kind) || "encounter";
  const silver = rewardCoinsForTier(context.tier, kind);
  const lootTheme = defaultLootTheme(context, map);
  const favor = kind === "craft" ? "repair discount or material access"
    : kind === "trade" ? "merchant discount or stock access"
      : kind === "social" || kind === "npc" ? "local reputation and information"
        : "salvage rights or bounty proof";
  return [
    row("Coin reward", `${silver} silver`, `Scale up for high-risk combat or if this becomes a full quest.`, "is-gold", {
      kind: "coin",
      rewardSilver: silver,
    }),
    row("Loot access", lootTheme, "Route into Tarkov inventory as container, corpse loot, merchant stock or handoff item.", "is-gold", {
      kind: "loot-access",
    }),
    row("Favor", favor, "Use as non-coin reward when the scene ends cleanly.", "is-active", {
      kind: "favor",
    }),
  ];
}

function buildConsequenceRows(template = {}, context = {}, map = {}) {
  const explicitRows = buildRowsFromSpecs(template.consequenceRows ?? template.consequences, "is-warn");
  if (explicitRows.length) return explicitRows;
  const kind = str(context.kind) || "encounter";
  const success = kind === "trade" ? "merchant stock opens or prices soften"
    : kind === "craft" ? "repair/material access improves"
      : kind === "social" || kind === "npc" ? "local witness becomes an ally"
        : kind === "transition" || kind === "travel" ? "safe route or map lead is confirmed"
          : "threat pressure drops around this location";
  const failure = kind === "trade" ? "stock is moved, prices rise or a faction blocks access"
    : kind === "craft" ? "repair parts vanish or gear durability becomes harder to restore"
      : kind === "social" || kind === "npc" ? "rumor turns hostile or witness disappears"
        : kind === "transition" || kind === "travel" ? "route becomes slower, taxed or dangerous"
          : "threat relocates, reinforces or damages the area";
  return [
    row("Success consequence", success, `${map.label || "Location"} becomes safer or more useful.`, "is-safe", {
      kind: "success",
    }),
    row("Failure consequence", failure, "Use this if the party retreats, ignores the hook or causes collateral damage.", "is-warn", {
      kind: "failure",
    }),
  ];
}

function mapPoolRows(context = {}) {
  return WORLD_MAP_SITUATION_MAP_POOL
    .map(map => ({
      map,
      score: scoreMap(map, context),
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.map.label.localeCompare(b.map.label))
    .slice(0, 5)
    .map(entry => row(entry.map.label, entry.map.level, `${entry.map.sceneScale} - score ${entry.score}`, "is-road", {
      id: entry.map.id,
      asset: entry.map.asset,
      score: entry.score,
    }));
}

function buildContext({
  activeLevelId = "region",
  focusTile = {},
  localView = {},
  encounterView = {},
  sceneBrief = {},
  encounterKit = {},
  seed = "",
} = {}) {
  const hotspot = activeHotspot(localView, encounterView);
  const kind = inferKind({ focusTile, localView, encounterView, sceneBrief });
  const terrain = str(focusTile?.terrain);
  const tier = inferTier(focusTile, localView, encounterView, encounterKit);
  const seedText = [
    "ih-situation-v1",
    seed,
    activeLevelId,
    focusTile?.label,
    focusTile?.terrain,
    focusTile?.col,
    focusTile?.row,
    hotspot?.id,
    hotspot?.hotspotType,
    kind,
    tier,
  ].filter(value => value !== undefined && value !== null && value !== "").join("|");
  return {
    activeLevelId: normalizeLevel(activeLevelId),
    focusTile,
    localView,
    encounterView,
    sceneBrief,
    encounterKit,
    hotspot,
    kind,
    terrain,
    tier,
    seed: seedText,
  };
}

export function buildWorldMapSituation(options = {}) {
  const context = buildContext(options);
  const rng = makeRng(context.seed);
  const map = chooseMap(context, rng);
  const template = chooseTemplate(map, context, rng);
  const title = str(template?.title) || str(map?.label) || "Generated situation";
  const actorRows = uniqueRows(safeArray(template?.actors)
    .map(spec => buildActorRow(spec, context, rng))
    .filter(Boolean));
  const lootRows = buildRowsFromSpecs(template?.loot, "is-gold");
  const clueRows = buildRowsFromSpecs(template?.clues, "is-active");
  const skillRows = buildSkillRows(template?.skills, context.tier);
  const twistRows = buildRowsFromSpecs(template?.twists, "is-warn");
  const questRows = buildQuestRows(template, context, map, actorRows, lootRows);
  const rumorRows = buildRumorRows(template, context, map);
  const rewardRows = buildRewardRows(template, context, map);
  const consequenceRows = buildConsequenceRows(template, context, map);
  const markerRows = uniqueRows([
    ...safeArray(map?.markers).map(marker => row(marker[0], marker[1], marker[2], markerTone(marker[1]))),
    ...actorRows.map(actor => row(actor.label, actor.value, actor.placement || actor.note, actor.tone, {
      id: actor.id,
      markerKind: actor.actorKind,
    })),
    ...lootRows.map(loot => row(loot.label, loot.value, loot.note, loot.tone, { markerKind: "loot" })),
    ...questRows.slice(0, 1).map(quest => row(quest.label, quest.value, quest.note, quest.tone, { markerKind: "quest" })),
  ]);
  const placementRows = uniqueRows([
    row("Entry", "party", map?.entryHint || "Choose a safe edge.", "is-road"),
    ...actorRows.map(actor => row(actor.label, actor.value, actor.placement || actor.note, actor.tone, {
      id: actor.id,
      actorKind: actor.actorKind,
      count: actor.count,
    })),
    ...lootRows,
    ...questRows.slice(0, 1),
    row("Exit", "transition", map?.exitHint || "Return to the previous map layer.", "is-road"),
  ]);
  const poolRows = mapPoolRows(context);
  const mapAsset = str(map?.asset) || resolveWorldMapBackdrop(context.activeLevelId, context.focusTile);
  const sceneBlueprintRows = buildSceneBlueprintRows({ map, mapAsset, actorRows, lootRows, clueRows, questRows });
  const sceneHotspotRows = buildSceneHotspotRows(sceneBlueprintRows);
  const sceneInstructionRows = buildSceneInstructionRows({ map, actorRows, lootRows, clueRows, skillRows, sceneHotspotRows });
  const navigationRows = buildNavigationRows({ map, context });
  const situationRows = [
    row("Generated map", map?.label || "Map pool", `${map?.level || context.activeLevelId} / ${map?.sceneScale || "scene"}`, mapAsset, "is-road", {
      id: map?.id ?? "",
      asset: mapAsset,
    }),
    row("Situation", title, template?.hook || "Use generated placements and clues as a GM prompt.", template?.tone || "is-active", {
      id: template?.id ?? "",
    }),
    row("GM intent", `${actorRows.length} actor rows`, `${lootRows.length} loot / ${clueRows.length} clues / ${skillRows.length} checks`, "is-gold"),
  ];
  const gmTextLines = [
    `Map: ${map?.label ?? "unknown"} (${map?.level ?? context.activeLevelId})`,
    `Situation: ${title}`,
    template?.summary ?? template?.hook ?? "",
    ...rumorRows.map(entry => `Rumor: ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...questRows.map(entry => `Quest: ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...navigationRows.map(entry => `Navigation: ${entry.label} ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...sceneInstructionRows.map(entry => `Scene setup: ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...sceneHotspotRows.map(entry => `Hotspot: ${entry.label} ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...placementRows.map(entry => `${entry.label}: ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...skillRows.map(entry => `${entry.label}: ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...rewardRows.map(entry => `Reward: ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...consequenceRows.map(entry => `Consequence: ${entry.value}${entry.note ? ` - ${entry.note}` : ""}`),
    ...twistRows.map(entry => `Twist: ${entry.label}${entry.note ? ` - ${entry.note}` : ""}`),
  ].map(str).filter(Boolean);

  return {
    hasSituation: true,
    id: `${map?.id ?? "map"}:${template?.id ?? "situation"}`,
    seed: context.seed,
    title,
    hook: str(template?.hook),
    summary: str(template?.summary || template?.hook),
    tone: str(template?.tone) || "is-active",
    map: {
      id: str(map?.id),
      label: str(map?.label),
      level: str(map?.level),
      sceneScale: str(map?.sceneScale),
      asset: mapAsset,
      entryHint: str(map?.entryHint),
      exitHint: str(map?.exitHint),
      tags: safeArray(map?.tags).map(str).filter(Boolean),
    },
    tier: context.tier,
    kind: context.kind,
    terrain: context.terrain,
    situationRows,
    actorRows,
    placementRows,
    markerRows,
    navigationRows,
    sceneBlueprintRows,
    sceneHotspotRows,
    sceneInstructionRows,
    lootRows,
    clueRows,
    skillRows,
    twistRows,
    questRows,
    rumorRows,
    rewardRows,
    consequenceRows,
    poolRows,
    gmTextLines,
    counts: {
      actors: actorRows.length,
      monsters: actorRows.filter(entry => entry.actorKind === "monster").length,
      npcs: actorRows.filter(entry => entry.actorKind === "npc").length,
      placements: placementRows.length,
      markers: markerRows.length,
      navigation: navigationRows.length,
      blueprint: sceneBlueprintRows.length,
      hotspots: sceneHotspotRows.length,
      sceneInstructions: sceneInstructionRows.length,
      loot: lootRows.length,
      clues: clueRows.length,
      skills: skillRows.length,
      twists: twistRows.length,
      quests: questRows.length,
      rumors: rumorRows.length,
      rewards: rewardRows.length,
      consequences: consequenceRows.length,
      poolCandidates: poolRows.length,
    },
    hasActorRows: actorRows.length > 0,
    hasPlacementRows: placementRows.length > 0,
    hasMarkerRows: markerRows.length > 0,
    hasNavigationRows: navigationRows.length > 0,
    hasSceneBlueprintRows: sceneBlueprintRows.length > 0,
    hasSceneHotspotRows: sceneHotspotRows.length > 0,
    hasSceneInstructionRows: sceneInstructionRows.length > 0,
    hasLootRows: lootRows.length > 0,
    hasClueRows: clueRows.length > 0,
    hasSkillRows: skillRows.length > 0,
    hasTwistRows: twistRows.length > 0,
    hasQuestRows: questRows.length > 0,
    hasRumorRows: rumorRows.length > 0,
    hasRewardRows: rewardRows.length > 0,
    hasConsequenceRows: consequenceRows.length > 0,
    hasPoolRows: poolRows.length > 0,
  };
}

export function getWorldMapSituationPoolStats() {
  const byLevel = LEVELS.reduce((acc, level) => ({ ...acc, [level]: 0 }), {});
  const byTerrain = {};
  const byKind = {};
  for (const map of WORLD_MAP_SITUATION_MAP_POOL) {
    byLevel[map.level] = (byLevel[map.level] ?? 0) + 1;
    for (const terrain of safeArray(map.terrains)) byTerrain[terrain] = (byTerrain[terrain] ?? 0) + 1;
    for (const kind of safeArray(map.kinds)) byKind[kind] = (byKind[kind] ?? 0) + 1;
  }
  return {
    total: WORLD_MAP_SITUATION_MAP_POOL.length,
    levels: byLevel,
    terrains: byTerrain,
    kinds: byKind,
  };
}
