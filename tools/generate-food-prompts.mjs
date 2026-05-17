/**
 * Iron Hills — генератор AI-промптов для еды из FOOD.
 *
 *   node tools/generate-food-prompts.mjs
 *   node tools/generate-food-prompts.mjs csv | md | json
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { FOOD } from "../module/constants/items-catalog.mjs";
import { MONSTER_HARVEST_DROP_POOLS } from "../module/constants/monster-loot-pools.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const TIER_STYLE = {
  1:  { plating: "wooden trencher, coarse linen napkin", mood: "tavern staples, hearth smoke", light: "warm amber candlelight" },
  2:  { plating: "simple glazed ceramic plate", mood: "respectable inn fare", light: "cozy lantern glow" },
  3:  { plating: "white pottery dish with herb garnish", mood: "guild-town merchant lunch", light: "neutral daylight window" },
  4:  { plating: "bronze charger plate with carved rim", mood: "caravan feast seasoned by road spice", light: "clean side light" },
  5:  { plating: "silver-plated platter", mood: "manor hall banquet snippet", light: "soft rim highlights" },
  6:  { plating: "cast iron skillet presentation still steaming", mood: "noble hunter lodge luxury", light: "fire-kissed glow" },
  7:  { plating: "dark slate plate bioluminescent garnish accents", mood: "exotic imported rarity", light: "cool moonlit shimmer" },
  8:  { plating: "pearlescent porcelain", mood: "master-chef artistry visible saucing", light: "studio highlight gradient" },
  9:  { plating: "gold-leaf trimmed platter", mood: "legendary banquet centerpiece miniature", light: "golden divine backlight" },
  10: { plating: "floating crystalline dish barely touching surface", mood: "mythical feast worthy of gods", light: "spark halo lens flare subtle aura distortion" },
};

const TECH_TAGS =
  "single isolated fantasy RPG food shot, centered, transparent or plain dark background, square composition for inventory icon, no hands holding food in frame, sharp focus, painterly style";

const NEGATIVE_TAGS =
  "text, watermark, logo, signature, blurry, low quality, cluttered banquet hall wide shot, multiple unrelated plates, eating utensils alone without food, human face, nsfw";

/** Какие пулы разделки ссылаются на данный food.id */
function collectFoodHarvestPoolsById() {
  /** @type {Record<string, string[]>} */
  const out = {};
  for (const [poolKey, lines] of Object.entries(MONSTER_HARVEST_DROP_POOLS)) {
    for (const ln of lines) {
      if (ln.type !== "food" || !ln.catalogId) continue;
      const id = ln.catalogId;
      if (!out[id]) out[id] = [];
      if (!out[id].includes(poolKey)) out[id].push(poolKey);
    }
  }
  for (const k of Object.keys(out)) out[k].sort();
  return out;
}

function inferPoolTier(poolKey) {
  const m = /_t(\d+)\s*$/i.exec(String(poolKey));
  return m ? Math.max(1, Math.min(10, Number(m[1]) || 1)) : 4;
}

function maxHarvestTierForFood(catalogId) {
  const pools = collectFoodHarvestPoolsById()[catalogId] ?? [];
  let t = Number(FOOD[catalogId]?.tier ?? 1) || 1;
  for (const pk of pools) t = Math.max(t, inferPoolTier(pk));
  return Math.max(1, Math.min(10, t));
}

/** Промпт под иконку «добыча с туши» (сырое мясо / разделка), если еда есть в пулах монстров. */
function buildHarvestFoodPrompt(f) {
  const tier = maxHarvestTierForFood(f.id);
  const style = TIER_STYLE[tier];
  const namePart = f.label ? `Concept "${f.label}", ` : "";

  const sat = Number(f.satiety ?? 0);
  const hyd = Number(f.hydration ?? 0);
  const grubLike =
    /grub|highland_grub|larva/i.test(String(f.id)) ||
    /трутн|личин|гусениц/i.test(String(f.label ?? ""));
  const serpentLike =
    /serpent|snake|зме|fillet_raw/i.test(String(f.id)) || /зме|змеин/i.test(String(f.label ?? ""));
  const cut = grubLike
    ? "chitinous grub haunch segmented meat pale marrow seam fantasy insect quarry cut"
    : serpentLike
    ? "serpent fillet translucent jelly ichor sheen scale-side muscle striation"
    : hyd > sat * 1.2
      ? "serpent ichor jelly trail-wrap humid sheen field cup"
      : sat > hyd * 2
        ? "thick haunch marbling sinew ribbons coarse salt flake"
        : "mixed hunter trims sinew stripe marbling readable cut";

  return (
    `${namePart}fantasy RPG monster harvest food icon — ${cut}, butcher stone or stained board oiled rag NOT banquet china twine wrap, ` +
    `muted ${style.mood} undertone tier ${tier} quarry, ` +
    `${TECH_TAGS}, gritty rim hunter camp light ${style.light} --ar 1:1`
  );
}

function buildPrompt(f) {
  const tier = Math.max(1, Math.min(10, Number(f.tier ?? 1)));
  const style = TIER_STYLE[tier];
  const namePart = f.label ? `Concept "${f.label}", ` : "";

  const sat = Number(f.satiety ?? 0);
  const hyd = Number(f.hydration ?? 0);
  const vibe =
    hyd > sat * 1.2 ? "emphasis on steam mug / jug / soup moisture shimmer"
      : sat > hyd * 2 ? "emphasis on hearty solids roast carved portions"
      : "balanced solids and hydration cues";

  const base = [
    namePart + "fantasy edible dish photograph — ",
    vibe + ",",
    `${style.plating}, ${style.mood},`,
    TECH_TAGS + ",",
    "1024x1024 inventory sprite framing",
    style.light + ".",
  ].join(" ");

  return `${base} --ar 1:1`;
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function asCsv(rows) {
  const head =
    "id,name,tier,satiety,hydration,value,harvestPools,prompt,promptHarvest,negative";
  const body = rows
    .map((r) =>
      [
        r.id,
        r.name,
        r.tier,
        r.satiety,
        r.hydration,
        r.value,
        r.harvestPools.join(";"),
        r.prompt,
        r.promptHarvest,
        NEGATIVE_TAGS,
      ].map(escapeCsv).join(","),
    )
    .join("\n");
  return head + "\n" + body + "\n";
}

function asMd(rows) {
  const foodPoolMap = collectFoodHarvestPoolsById();
  const inPools = Object.keys(foodPoolMap).sort();
  const lines = [
    "# Iron Hills — AI-промпты для еды и напитков",
    "",
    "> Источник: `FOOD`. Перегенерация: `node tools/generate-food-prompts.mjs`",
    "",
    "Позиции из **пулов разделки монстров** ниже по тирам дублируют колонку **«разделка»**: иконка сыро́й добычи / разделочного стола (см. также `docs/content/monster-loot-prompts.md` для материалов и полной разбивки по пулам).",
    "",
    "**Negative (общий):**",
    "```",
    NEGATIVE_TAGS,
    "```",
    "",
    "## Id еды, встречающиеся в добыче монстров",
    "",
    inPools.length
      ? inPools.map((id) => `- \`${id}\` — пулы: ${foodPoolMap[id].map((p) => `\`${p}\``).join(", ")}`).join("\n")
      : "(нет)",
    "",
  ];
  let lastTier = -1;
  for (const r of rows) {
    if (r.tier !== lastTier) {
      lines.push("", `## Тир ${r.tier}`, "");
      lastTier = r.tier;
    }
    lines.push(`### ${r.name} *(\`${r.id}\`, 🍖${r.satiety} 💧${r.hydration})*`, "", "```", r.prompt, "```", "");
    if (r.harvestPools.length) {
      lines.push(
        `*В пулах разделки:* ${r.harvestPools.map((p) => `\`${p}\``).join(", ")}`,
        "",
        "**Промпт для иконки добычи (разделка / сыро́е):**",
        "",
        "```",
        r.promptHarvest,
        "```",
        "",
      );
    }
  }
  return lines.join("\n");
}

function asJson(rows) {
  return JSON.stringify({ negative: NEGATIVE_TAGS, items: rows }, null, 2);
}

function buildRows() {
  const foodPoolMap = collectFoodHarvestPoolsById();
  return Object.values(FOOD)
    .map((f) => {
      const harvestPools = foodPoolMap[f.id] ?? [];
      return {
        id: f.id,
        name: f.label,
        tier: f.tier,
        satiety: f.satiety ?? 0,
        hydration: f.hydration ?? 0,
        value: f.value ?? 0,
        harvestPools,
        prompt: buildPrompt(f),
        promptHarvest: harvestPools.length ? buildHarvestFoodPrompt(f) : "",
      };
    })
    .sort((a, b) => (a.tier - b.tier) || a.id.localeCompare(b.id));
}

function main() {
  const fmt = (process.argv[2] ?? "all").toLowerCase();
  const rows = buildRows();

  if (fmt === "csv") return process.stdout.write(asCsv(rows));
  if (fmt === "md") return process.stdout.write(asMd(rows));
  if (fmt === "json") return process.stdout.write(asJson(rows));

  const outDir = resolve(ROOT, "docs/content");
  writeFileSync(resolve(outDir, "food-prompts.csv"), asCsv(rows), "utf8");
  writeFileSync(resolve(outDir, "food-prompts.md"), asMd(rows), "utf8");
  writeFileSync(resolve(outDir, "food-prompts.json"), asJson(rows), "utf8");
  process.stdout.write(`Сгенерировано ${rows.length} промптов:\n  - docs/content/food-prompts.{md,csv,json}\n`);
}

main();
