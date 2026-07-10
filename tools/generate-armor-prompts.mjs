/**
 * Iron Hills — генератор AI-промптов для всех позиций брони и щитов из items-catalog.
 *
 *   node tools/generate-armor-prompts.mjs
 *   node tools/generate-armor-prompts.mjs csv | md | json
 *
 * CSV: id,name,tier,slot,gridW,gridH,aspect,resolution,prompt,negative
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ARMORS } from "../module/constants/items-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const TIER_STYLE = {
  1:  { mat: "rough leather, crude brass rivets, bone toggles, untreated hide",
        mood: "stitched patches, scratches, frontier militia gear",
        light: "dim warm campfire light" },
  2:  { mat: "interlocking mail rings, mild steel, padded arming cap layer, waxed leather edging",
        mood: "battle-worn ring mail, functional, no flourish",
        light: "neutral daylight" },
  3:  { mat: "polished steel plates, articulated lames, leather straps, simple etchings",
        mood: "knight-issue half plate, well-maintained soldier kit",
        light: "forge embers glow in background" },
  4:  { mat: "tempered steel with bronze/brass inlays, blackened edges, heraldic crest embossing",
        mood: "commander-grade, decorative but practical",
        light: "clean white studio light" },
  5:  { mat: "mithril gleam (silver-white with faint blue tint), featherweight plates, sapphire rivets",
        mood: "masterwork, elven-smith finish, faintly magical",
        light: "cool blue rim light" },
  6:  { mat: "dark iron with subtle purple sheen, soot patina, silver runes etched into seams",
        mood: "heavy, ominous, infernal forge aesthetic",
        light: "deep violet under-glow, faint ember particles" },
  7:  { mat: "starmetal (blue-black metal with starfield shimmer), void-crystal studs, faint smoke wisps",
        mood: "cosmic horror luxury, unsettling elegance",
        light: "cosmic violet and starfield bokeh" },
  8:  { mat: "celestial steel (pearlescent silver), gold filigree halos, feather engravings",
        mood: "angelic crusader aesthetic, immaculate",
        light: "soft heavenly radiance, lens glow" },
  9:  { mat: "orichalcum (golden-red alloy), ornate filigree, sun-disc reliefs",
        mood: "legendary relic armor, divine heraldry",
        light: "golden divine backlight, sparks of holy energy" },
  10: { mat: "adamantium shell with inner star-heart luminosity, godsteel seams, abyss-black enamel trim",
        mood: "primordial bulwark, cracks of leaking daylight along plates",
        light: "blinding aura edges, subtle space distortion shimmer" },
};

/** Совпадает с SLOT_GRID в compendium-builder armorToItem */
function slotGrid(slot) {
  const SLOT_GRID = {
    head: { w: 2, h: 2 }, torso: { w: 2, h: 3 }, leftArm: { w: 1, h: 2 }, rightArm: { w: 1, h: 2 },
    legs: { w: 2, h: 3 }, leftHand: { w: 2, h: 2 }, rightHand: { w: 2, h: 2 },
    neck: { w: 1, h: 1 }, ringLeft: { w: 1, h: 1 }, ringRight: { w: 1, h: 1 },
    belt: { w: 2, h: 1 }, backpack: { w: 2, h: 3 },
  };
  const g = SLOT_GRID[slot];
  return { gridW: g?.w ?? 2, gridH: g?.h ?? 2 };
}

function getObjectFragment(slot) {
  const map = {
    head: "a single fantasy helmet / head armor piece (front-three-quarter view), clear silhouette",
    torso: "a single fantasy torso armor piece (cuirass / breastplate / jack-of-plates), no limbs attached",
    legs: "a single pair of fantasy leg armor (greaves / sabatons combined piece), symmetrical pair read as one item",
    leftArm: "a single fantasy arm armor piece for left arm (vambrace / bracer / pauldron cuff)",
    rightArm: "a single fantasy arm armor piece for right arm (vambrace / bracer / pauldron cuff)",
    neck: "a single fantasy gorget / neck guard collar armor piece",
    leftHand: "a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face",
    rightHand: "a single fantasy shield (held vertically), kite/heater/tower silhouette, straps visible on back face",
  };
  return map[slot] ?? "a single fantasy armor piece";
}

function isShieldSlot(slot) {
  return slot === "leftHand" || slot === "rightHand" || slot === "shield";
}

function getArmorClassFragment(armorClass, slot) {
  const shield = isShieldSlot(slot);
  const map = {
    light: shield
      ? "light shield profile, small agile buckler or heater shield, slim solid face, quick straps"
      : "light armor profile, flexible, low bulk, travel-ready, no movement restriction feel",
    medium: shield
      ? "medium shield profile, sturdy heater or kite shield, reinforced solid face, balanced weight"
      : "medium armor profile, balanced protection and mobility, layered plates over padding",
    heavy: shield
      ? "heavy shield profile, broad tower or war shield, thick solid face, high durability, imposing mass"
      : "heavy armor profile, dense protective plates, high durability, imposing mass, slower silhouette",
  };
  return map[armorClass] ?? map.medium;
}

function getArmorAffixFragment(affixes, slot) {
  if (!affixes) return "";
  const parts = [];
  if (slot === "leftHand" || slot === "rightHand") {
    if (affixes.ignoreArmor >= 0.05) parts.push("striking surface leaves faint disruptive shimmer where blows connect");
    if (affixes.criticalDamageMult > 1) parts.push("harmonic resonance lines etched for devastating counters");
    if (affixes.executeBelowHp > 0) parts.push("ominous finishing aura etched along rim");
  } else {
    if (affixes.ignoreArmor >= 0.05) parts.push("plates subtly phase strikes aside");
    if (affixes.criticalDamageMult > 1) parts.push("fatal-impact wards etched along ridges");
    if (affixes.executeBelowHp > 0) parts.push("coupe-de-grâce shimmer along edges");
  }
  return parts.length ? ", " + parts.join(", ") : "";
}

const TECH_TAGS = "isolated single object, transparent or plain dark background, centered, full item visible, armor catalog orthographic clarity, no human, no hands wearing it, sharp focus, high detail, painterly fantasy icon, soft rim light";

const NEGATIVE_TAGS = "text, watermark, logo, signature, blurry, low quality, multiple separate armor sets, full suit spread out, human body, character wearing armor, cluttered background, nsfw";
const SHIELD_NEGATIVE_TAGS = `${NEGATIVE_TAGS}, hole in center, cutout center, ring shield, donut shape, empty middle, broken missing center, transparent hole through shield`;

function getNegativeTags(a) {
  return isShieldSlot(a?.slot) ? SHIELD_NEGATIVE_TAGS : NEGATIVE_TAGS;
}

function getAspectInfo(gridW, gridH) {
  const w = Math.max(1, Number(gridW || 1));
  const h = Math.max(1, Number(gridH || 1));
  if (w === h) {
    return { ar: "1:1", resolution: "1024x1024", orientation: "balanced composition, helmet-centered" };
  }
  if (h / w >= 2.5) {
    return { ar: "1:3", resolution: "512x1536", orientation: "vertical orientation, torso armor upright" };
  }
  if (h / w >= 1.8) {
    return { ar: "1:2", resolution: "768x1536", orientation: "vertical orientation, armor piece upright" };
  }
  return { ar: "1:1", resolution: "1024x1024", orientation: "balanced composition" };
}

function buildPrompt(a) {
  const tier = Math.max(1, Math.min(10, Number(a.tier ?? 1)));
  const style = TIER_STYLE[tier];
  const { gridW, gridH } = slotGrid(a.slot);
  const aspect = getAspectInfo(gridW, gridH);
  const objFrag = getObjectFragment(a.slot);
  const classFrag = getArmorClassFragment(a.armorClass, a.slot);
  const affixFrag = getArmorAffixFragment(a.affixes, a.slot);
  const namePart = a.label ? `Concept art for "${a.label}", ` : "";

  const base = [
    namePart + objFrag + ",",
    classFrag + ",",
    `crafted from ${style.mat},`,
    `${style.mood}${affixFrag},`,
    `${aspect.orientation},`,
    TECH_TAGS + ",",
    `${aspect.resolution},`,
    style.light,
  ].join(" ");

  return `${base} --ar ${aspect.ar}`;
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function asCsv(rows) {
  const head = "id,name,tier,slot,gridW,gridH,aspect,resolution,prompt,negative";
  const body = rows.map((r) =>
    [r.id, r.name, r.tier, r.slot, r.gridW, r.gridH, r.aspect, r.resolution, r.prompt, r.negative]
      .map(escapeCsv)
      .join(","),
  ).join("\n");
  return head + "\n" + body + "\n";
}

function asMd(rows) {
  const lines = [
    "# Iron Hills — AI-промпты для брони и щитов",
    "",
    "> Автогенерация из `ARMORS` (см. `tools/generate-armor-prompts.mjs`).",
    "> `node tools/generate-armor-prompts.mjs`",
    "",
    "**Использование:**",
    "- Каждый промпт содержит `--ar` для aspect ratio.",
    "- Клади спрайты в `icons/items/armor/{id}.webp` (или путь из `armorToItem` по умолчанию).",
    "",
    "**Negative prompt (общий):**",
    "```",
    NEGATIVE_TAGS,
    "```",
    "",
    "**Negative prompt (shield):**",
    "```",
    SHIELD_NEGATIVE_TAGS,
    "```",
    "",
  ];
  let lastTier = -1;
  for (const r of rows) {
    if (r.tier !== lastTier) {
      lines.push("", `## Тир ${r.tier}`, "");
      lastTier = r.tier;
    }
    const meta = `${r.slot}, ${r.gridW}×${r.gridH}, AR ${r.aspect}, ${r.resolution}`;
    lines.push(`### ${r.name} *(\`${r.id}\`, ${meta})*`, "", "```", r.prompt, "```", "");
    if (r.negative !== NEGATIVE_TAGS) lines.push("Negative:", "", "```", r.negative, "```", "");
  }
  return lines.join("\n");
}

function asJson(rows) {
  return JSON.stringify({ negative: NEGATIVE_TAGS, shieldNegative: SHIELD_NEGATIVE_TAGS, items: rows }, null, 2);
}

function buildRows() {
  return Object.values(ARMORS)
    .map((a) => {
      const { gridW, gridH } = slotGrid(a.slot);
      const aspect = getAspectInfo(gridW, gridH);
      return {
        id: a.id,
        name: a.label,
        tier: a.tier,
        slot: a.slot,
        gridW,
        gridH,
        aspect: aspect.ar,
        resolution: aspect.resolution,
        prompt: buildPrompt(a),
        negative: getNegativeTags(a),
      };
    })
    .sort((a, b) =>
      (a.tier - b.tier) || String(a.slot).localeCompare(String(b.slot)) || a.id.localeCompare(b.id),
    );
}

function main() {
  const fmt = (process.argv[2] ?? "all").toLowerCase();
  const rows = buildRows();

  if (fmt === "csv") return process.stdout.write(asCsv(rows));
  if (fmt === "md") return process.stdout.write(asMd(rows));
  if (fmt === "json") return process.stdout.write(asJson(rows));

  const outDir = resolve(ROOT, "docs/content");
  writeFileSync(resolve(outDir, "armor-prompts.csv"), asCsv(rows), "utf8");
  writeFileSync(resolve(outDir, "armor-prompts.md"), asMd(rows), "utf8");
  writeFileSync(resolve(outDir, "armor-prompts.json"), asJson(rows), "utf8");
  process.stdout.write(
    `Сгенерировано ${rows.length} промптов:\n` +
      `  - docs/content/armor-prompts.md\n` +
      `  - docs/content/armor-prompts.csv\n` +
      `  - docs/content/armor-prompts.json\n`,
  );
}

main();
