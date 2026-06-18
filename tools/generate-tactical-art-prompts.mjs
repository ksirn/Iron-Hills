/**
 * Iron Hills art prompts for consumables, throwables, and spells.
 *
 *   node tools/generate-tactical-art-prompts.mjs
 *   node tools/generate-tactical-art-prompts.mjs consumables | throwables | spells
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { CONSUMABLES, THROWABLES } from "../module/constants/items-catalog.mjs";
import { SPELLS } from "../module/constants/spells-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "docs/content");

const TIER_STYLE = {
  1: "humble frontier craft, worn cloth, dull leather, simple clay or iron fittings",
  2: "reliable guild-apprentice craft, clean seams, bronze pins, functional finish",
  3: "field-proven adventurer gear, reinforced details, readable silhouette",
  4: "professional mercenary quality, polished steel fittings, careful packing",
  5: "masterwork guild finish, subtle runes, clean alchemical glass and fine leather",
  6: "elite expedition quality, mithril or silver accents, faint magical residue",
  7: "rare occult workshop craft, dark crystal traces, controlled eerie glow",
  8: "artifact-grade craft, starmetal glints, celestial or void-touched materials",
  9: "legendary relic quality, ornate sacred geometry, strong but contained aura",
  10: "mythic relic presence, impossible materials, reality ripple kept subtle",
};

const TECH_ITEM =
  "single isolated fantasy RPG inventory icon, centered, full object visible, transparent or plain dark background, sharp focus, painterly detailed illustration, readable at small Tarkov-style inventory cell size";

const TECH_SPELL =
  "single isolated fantasy RPG spell icon, centered magical effect or glyph, no caster, no hands, no book page, plain dark or transparent background, sharp painterly detail, readable at small square action-bar and inventory icon size";

const NEGATIVE_ITEM =
  "text, watermark, logo, signature, blurry, low quality, multiple unrelated objects, cluttered background, human hands, human face, character portrait, modern plastic, hospital equipment, sci-fi device, nsfw";

const NEGATIVE_SPELL =
  "text, watermark, logo, signature, blurry, low quality, character portrait, caster silhouette, hands, book page, UI border, flat emoji, simple vector symbol, nsfw";

function tierOf(row) {
  const value = Number(row?.tier ?? row?.rank ?? 1);
  return Math.max(1, Math.min(10, Number.isFinite(value) ? Math.round(value) : 1));
}

function aspectInfo(gridW, gridH) {
  const w = Math.max(1, Number(gridW || 1));
  const h = Math.max(1, Number(gridH || 1));
  if (h / w >= 4) return { aspect: "1:4", resolution: "384x1536", orientation: "extreme vertical orientation, full length visible top-to-bottom" };
  if (h / w >= 3) return { aspect: "1:3", resolution: "512x1536", orientation: "vertical orientation, full length visible" };
  if (h / w >= 2) return { aspect: "1:2", resolution: "768x1536", orientation: "vertical compact object framing" };
  if (w / h >= 2) return { aspect: "2:1", resolution: "1536x768", orientation: "wide compact object framing" };
  return { aspect: "1:1", resolution: "1024x1024", orientation: "balanced square inventory composition" };
}

function namePart(row) {
  return row?.label ? `Concept "${row.label}", ` : "";
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function sortTierThenId(rows) {
  return [...rows].sort((a, b) => (a.tier - b.tier) || a.id.localeCompare(b.id));
}

function consumableObjectFragment(row) {
  const id = String(row?.id ?? "");
  const effect = String(row?.effect ?? "");

  if (id.includes("waterskin")) return "leather waterskin with cork stopper, stitched seams, small water bead highlights";
  if (id.includes("canteen")) return "iron canteen with leather strap, dented field metal, screw cap";
  if (id.includes("gourd")) return "traveler gourd canteen with ranger cord wrap, carved wooden stopper";

  const byEffect = {
    reduceBleeding: "rolled field bandage and folded dressing bundle, red wax seal, clean linen texture",
    tourniquet: "compact leather tourniquet strap with brass windlass and buckle, coiled readable silhouette",
    splint: "wooden splint pair tied with linen straps, bone pins and soft padding visible",
    stopMinorBleeding: "hemostatic cloth packet and clotting powder sachet, sealed field-medic pouch",
    stabilizeBody: "compact trauma kit pouch opened just enough to show bandage roll, splint slats, tonic vial",
    surgery: "fantasy surgical field kit, folded leather case with bone saw, sutures, forceps, antiseptic vial",
    cureDisease: "antiseptic wash bottle, blue glass, waxed label blank, herbal sediment and clean cloth wrap",
    bandage: "suture roll with curved needle, clean thread spool, tiny brass needle case",
    stimulant: "small battle stimulant ampoule in leather injector sleeve, amber liquid, caution cord",
    healHP: "restorative green ampoule with silver cap, clean healing glow, tiny bandage tie",
  };

  return byEffect[effect] ?? "compact fantasy field-medicine supply, cloth wrap, leather pouch, small alchemical vial";
}

function consumableEffectMood(row) {
  const effect = String(row?.effect ?? "");
  const map = {
    reduceBleeding: "blood control, clean pressure dressing, practical battlefield first aid",
    tourniquet: "major bleeding control, urgent limb stabilization, rugged and reliable",
    splint: "fracture stabilization, rigid supports, recovery after crushing hit",
    stopMinorBleeding: "instant clotting, powder dust, alchemical seal against bleeding",
    stabilizeBody: "body stabilization after multiple wounds, organized emergency kit",
    surgery: "serious wound treatment, surgical precision, recovery of damaged body zones",
    cureDisease: "infection cleansing, antiseptic blue clarity, herbal purity",
    bandage: "precise stitching and wound closure, calm professional treatment",
    stimulant: "short combat surge, bitter stimulant, controlled urgency",
    healHP: "restorative healing warmth, wound closing magic, safe green glow",
  };
  return map[effect] ?? "survival utility, practical fantasy expedition medicine";
}

function buildConsumablePrompt(row) {
  const aspect = aspectInfo(row.gridW, row.gridH);
  const tier = tierOf(row);
  const parts = [
    namePart(row) + consumableObjectFragment(row),
    consumableEffectMood(row),
    TIER_STYLE[tier],
    aspect.orientation,
    `${aspect.resolution}`,
    TECH_ITEM,
  ];
  return `${parts.filter(Boolean).join(", ")} --ar ${aspect.aspect}`;
}

function throwableObjectFragment(row) {
  const id = String(row?.id ?? "");
  const damage = String(row?.damageType ?? "");

  if (id.includes("knife")) return "bundle of three throwing knives bound by dark leather cord, balanced steel blades, fan arrangement";
  if (id.includes("shrapnel") || id.includes("clay")) return "sealed clay shrapnel pot with twine fuse, chipped pottery, visible metal shards embedded";
  if (id.includes("oil") || id.includes("fire")) return "flask of burning alchemical oil with waxed rag fuse, orange liquid, soot-black glass";
  if (id.includes("venom") || damage === "poison") return "thin green venom vial in protective wicker cage, skull charm, toxic glow restrained";
  if (id.includes("thunder") || damage === "lightning") return "charged thunderstone wrapped in copper wire, blue-white arcs crawling over rough crystal";
  if (id.includes("frost") || damage === "ice") return "frostburst glass flask, icy blue liquid, hoarfrost crust, sealed with silver cap";
  if (id.includes("blessed") || damage === "holy") return "clear blessed water globe in brass reliquary cage, pale gold light, sacred wax seal";
  if (id.includes("dragonfire")) return "heavy dragonfire bomb, red-black alchemical shell, claw-like brass ribs, dangerous ember core";
  if (id.includes("void") || damage === "shadow") return "void splinter grenade, black glass orb with purple cracks, shard cage, drifting dark motes";
  if (id.includes("sunburst")) return "sunburst phial in golden reliquary frame, white-gold liquid, small radiant flare contained";
  if (id.includes("genesis")) return "mythic star bomb, miniature astrolabe casing around luminous star core, impossible prismatic metal";

  return "single fantasy throwable alchemical charge, readable silhouette, fuse and reinforced casing";
}

function throwableEffectMood(row) {
  const damage = String(row?.damageType ?? "");
  const aoe = row?.aoe ?? null;
  const shape = aoe?.shape ? `${aoe.shape} area cue` : "single-target cue";
  const map = {
    physical: "impact shards and kinetic fragmentation",
    fire: "contained flame and alchemical heat",
    poison: "toxic vapor and venomous green staining",
    lightning: "crackling charge and copper conductor detail",
    ice: "cold burst and frost crystal rim",
    holy: "sacred flare, clean radiance, friendly-fire discipline when applicable",
    shadow: "void splinters, cursed darkness, unstable occult containment",
    true: "reality-breaking star impact, rare artifact danger",
  };
  return `${map[damage] ?? "battlefield utility effect"}, ${shape}`;
}

function buildThrowablePrompt(row) {
  const aspect = aspectInfo(row.gridW, row.gridH);
  const tier = tierOf(row);
  const parts = [
    namePart(row) + throwableObjectFragment(row),
    throwableEffectMood(row),
    TIER_STYLE[tier],
    aspect.orientation,
    `${aspect.resolution}`,
    TECH_ITEM,
  ];
  return `${parts.filter(Boolean).join(", ")} --ar ${aspect.aspect}`;
}

const SCHOOL_STYLE = {
  fire: "orange-red flame, ember sparks, blackened rim, molten core",
  ice: "cyan frost crystals, cold mist, sharp translucent shards",
  lightning: "blue-white lightning forks, copper-gold charge, electric halo",
  shadow: "deep violet-black void energy, smoke wisps, cracked darkness",
  light: "white-gold sacred radiance, clean rays, pearl glow",
  earth: "stone, ochre dust, cracked ground glyph, heavy mineral fragments",
  mind: "violet psychic rings, thought-wave distortion, subtle eye-like geometry",
  summon: "teal necromantic summoning circle, bone-white motes, binding runes",
};

function spellShapeFragment(spell) {
  const aoe = spell?.aoe ?? null;
  if (!aoe) return "single-target magical projectile or focused spell sigil";
  const type = String(aoe.type ?? "");
  const shape = String(aoe.shape ?? "");
  if (type === "chain") return "branching chain arcs between small target sparks, readable bouncing path";
  if (type === "nova") return "radial nova ring expanding outward from a bright center";
  if (type === "pierce" || shape === "ray") return "long narrow ray or lance of magic crossing the icon diagonally";
  if (shape === "cone") return "fan-shaped cone burst, wide front edge, clear directional sweep";
  if (type === "shards") return "cluster of several magical shards flying outward, each shard distinct";
  if (shape === "circle") return "circular area blast glyph, ring boundary and impact center";
  return "clear area-of-effect spell geometry";
}

function spellEffectFragment(spell) {
  const effect = spell?.effect ?? null;
  if (effect?.special === "heal") return "healing energy, gentle restorative pulse, no injury gore";
  if (effect?.special === "buff") return "empowering aura, upward motion, quickened rhythm";
  if (effect?.special === "debuff") return "constricting aura, downward pressure, hostile control magic";
  if (effect?.special === "summon") return "summoning portal, skeletal hint only as tiny glyph silhouette, no full character";
  if (effect?.special === "banish") return "banishment seal, dissolving hostile spirit outline abstracted";
  if (effect?.special === "lifesteal") return "crimson shadow siphon, life thread pulled into dark core";
  if (effect?.applyCondition) return `condition cue: ${effect.applyCondition}, visually embedded as small runic accent`;
  return "pure spell energy, readable magical purpose";
}

function buildSpellPrompt(spell) {
  const tier = tierOf(spell);
  const school = String(spell?.school ?? "arcane");
  const style = SCHOOL_STYLE[school] ?? "arcane blue-violet glyph light, silver sparks";
  const parts = [
    namePart(spell) + `spell icon for ${school} magic`,
    style,
    spellShapeFragment(spell),
    spellEffectFragment(spell),
    `rank ${tier}, ${TIER_STYLE[tier]}`,
    "1024x1024",
    TECH_SPELL,
  ];
  return `${parts.filter(Boolean).join(", ")} --ar 1:1`;
}

function consumableRows() {
  return sortTierThenId(Object.values(CONSUMABLES).map((row) => {
    const aspect = aspectInfo(row.gridW, row.gridH);
    return {
      category: "consumables",
      id: row.id,
      name: row.label,
      tier: tierOf(row),
      effect: row.effect ?? "vessel",
      gridW: row.gridW ?? 1,
      gridH: row.gridH ?? 1,
      aspect: aspect.aspect,
      resolution: aspect.resolution,
      prompt: buildConsumablePrompt(row),
    };
  }));
}

function throwableRows() {
  return sortTierThenId(Object.values(THROWABLES).map((row) => {
    const aspect = aspectInfo(row.gridW, row.gridH);
    return {
      category: "throwables",
      id: row.id,
      name: row.label,
      tier: tierOf(row),
      damageType: row.damageType ?? "",
      effectType: row.effectType ?? "",
      gridW: row.gridW ?? 1,
      gridH: row.gridH ?? 1,
      aspect: aspect.aspect,
      resolution: aspect.resolution,
      prompt: buildThrowablePrompt(row),
    };
  }));
}

function spellRows() {
  return sortTierThenId(Object.values(SPELLS).map((spell) => ({
    category: "spells",
    id: spell.id,
    name: spell.label,
    tier: tierOf(spell),
    school: spell.school ?? "arcane",
    damageType: spell.damageType ?? "",
    aoeType: spell.aoe?.type ?? "",
    aoeShape: spell.aoe?.shape ?? "",
    gridW: 1,
    gridH: 1,
    aspect: "1:1",
    resolution: "1024x1024",
    prompt: buildSpellPrompt(spell),
  })));
}

function asCsv(rows, negative) {
  const extraKeys = Array.from(new Set(rows.flatMap(row => Object.keys(row))))
    .filter(key => !["prompt"].includes(key));
  const header = [...extraKeys, "prompt", "negative"];
  const body = rows.map(row => header.map(key => escapeCsv(key === "negative" ? negative : row[key])).join(",")).join("\n");
  return header.join(",") + "\n" + body + "\n";
}

function asMd(rows, negative, title, source) {
  const lines = [
    `# Iron Hills - ${title}`,
    "",
    `> Source: ${source}. Regenerate: \`node tools/generate-tactical-art-prompts.mjs\``,
    "",
    "Generation notes:",
    "- Keep exact target file names from `docs/content/art-batch.*`.",
    "- Respect `gridW`, `gridH`, `aspect`, and `resolution`; the prompt already includes the correct framing.",
    "- Prefer one visible object or one readable spell effect, not a scene.",
    "",
    "Negative prompt:",
    "```",
    negative,
    "```",
    "",
  ];

  let lastTier = -1;
  for (const row of rows) {
    if (row.tier !== lastTier) {
      lines.push("", `## Tier ${row.tier}`, "");
      lastTier = row.tier;
    }
    const meta = [
      row.school,
      row.damageType,
      row.effect,
      `${row.gridW}x${row.gridH}`,
      `AR ${row.aspect}`,
      row.resolution,
    ].filter(Boolean).join(", ");
    lines.push(`### ${row.name} (\`${row.id}\`, ${meta})`, "", "```", row.prompt, "```", "");
  }

  return lines.join("\n");
}

function asJson(rows, negative) {
  return JSON.stringify({ negative, items: rows }, null, 2);
}

function writeSet(fileBase, rows, negative, title, source) {
  writeFileSync(resolve(OUT_DIR, `${fileBase}.csv`), asCsv(rows, negative), "utf8");
  writeFileSync(resolve(OUT_DIR, `${fileBase}.md`), asMd(rows, negative, title, source), "utf8");
  writeFileSync(resolve(OUT_DIR, `${fileBase}.json`), asJson(rows, negative), "utf8");
}

const SETS = {
  consumables: {
    fileBase: "consumables-prompts",
    title: "AI prompts: consumables and field medicine",
    source: "`CONSUMABLES` in `items-catalog.mjs`",
    negative: NEGATIVE_ITEM,
    rows: consumableRows,
  },
  throwables: {
    fileBase: "throwables-prompts",
    title: "AI prompts: throwables and alchemical weapons",
    source: "`THROWABLES` in `items-catalog.mjs`",
    negative: NEGATIVE_ITEM,
    rows: throwableRows,
  },
  spells: {
    fileBase: "spells-prompts",
    title: "AI prompts: spells",
    source: "`SPELLS` in `spells-catalog.mjs`",
    negative: NEGATIVE_SPELL,
    rows: spellRows,
  },
};

function main() {
  const mode = String(process.argv[2] ?? "all").trim().toLowerCase();
  const keys = mode === "all" ? Object.keys(SETS) : [mode];
  let total = 0;

  for (const key of keys) {
    const set = SETS[key];
    if (!set) throw new Error(`Unknown prompt set: ${key}`);
    const rows = set.rows();
    writeSet(set.fileBase, rows, set.negative, set.title, set.source);
    total += rows.length;
    process.stdout.write(`Generated ${rows.length} prompts: docs/content/${set.fileBase}.{md,csv,json}\n`);
  }

  process.stdout.write(`Total prompts generated: ${total}\n`);
}

main();
