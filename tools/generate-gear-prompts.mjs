/**
 * Iron Hills — AI-промпты для инструментов, поясов, рюкзаков и креплений.
 *
 *   node tools/generate-gear-prompts.mjs
 *   node tools/generate-gear-prompts.mjs csv | md | json
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { TOOLS, BELTS, BACKPACKS, ATTACHMENTS } from "../module/constants/items-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const TIER_MOOD = {
  1:  "modest worn traveler gear",
  2:  "reliable soldier surplus quality",
  3:  "guild craftsman upgraded fittings",
  4:  "merchant caravan rugged prestige",
  5:  "noble artisan embossed fittings",
  6:  "elite siege train officer workshop",
  7:  "rare siege caravan engineered spectacle",
  8:  "starmetal accents artifact hints",
  9:  "legendary planar shimmer restrained",
  10: "mythic relic aura barely restrained",
};

const TECH_BASE =
  "single isolated fantasy RPG inventory icon, centered, transparent or plain dark background, square composition, sharp focus, painterly detailed illustration";

const NEGATIVE_TAGS =
  "text, watermark, logo, signature, blurry, low quality, cluttered warehouse wide shot, multiple objects collage, human face full portrait, holding hands visible, nsfw";

function promptTools(t) {
  const tier = Math.max(1, Math.min(10, Number(t.tier ?? 1)));
  const w = Number(t.weight ?? 0);
  const heavy =
    w >= 35 ? "emphasis massive ox-cart wheels timber beams ropes sweat gloss metal enormous portable forge silhouette"
      : w >= 18 ? "emphasis bulky wagon planks reinforced hinges straps draft-animal towing cues"
      : "emphasis handheld toolkit readable silhouette compact bench fold hinges";

  const craftHint =
    { blacksmithing:"forge tongs hammer anvil sparks soot",
      alchemy:"glass retorts clamps burner coils bottles racks",
      cooking:"iron grate kettle pans stacked crates skewers steam",
      mining:"pickaxe drill brace crank cables reinforcement plate",
      crafting:"vise clamps rulers drawers pegboard folded bench legs sawdust",
    }[t.craftType] ?? "crafted fantasy workshop prop";

  const namePart = t.label ? `Concept "${t.label}", ` : "";
  return `${namePart}${heavy}, ${craftHint}, ${TIER_MOOD[tier]}, ${TECH_BASE}. ${t.desc ? String(t.desc).slice(0, 160) + "." : ""} --ar 1:1`;
}

function promptBelts(b) {
  const tier = Math.max(1, Math.min(10, Number(b.tier ?? 1)));
  const slots = (b.containerSlots?.cols ?? 0) * (b.containerSlots?.rows ?? 0);
  const attach = (b.attachmentSlots ?? []).length;
  const namePart = b.label ? `Concept "${b.label}", ` : "";
  return `${namePart}fantasy waist belt pouches straps buckle studs utility loops; roughly ${slots} pouch slots narrative hint and ${attach} side mounts for weapon frogs quivers holsters; leather textile mixed metals; ${TIER_MOOD[tier]}, ${TECH_BASE}. --ar 1:1`;
}

function promptBackpacks(p) {
  const tier = Math.max(1, Math.min(10, Number(p.tier ?? 1)));
  const w = Number(p.weight ?? 1);
  const beast =
    w >= 6 ? "emphasis saddle straps beast harness mount frames oversized haul bag meant for draft animal NOT worn by human silhouette alone"
      : "";
  const namePart = p.label ? `Concept "${p.label}", ` : "";
  return `${namePart}${beast}fantasy backpack satchel straps buckles rolled blanket bedroll cues; arcane stitching subtle if high tier; ${TIER_MOOD[tier]}, ${TECH_BASE}. --ar 1:1`;
}

function promptAttachments(a) {
  const tier = Math.max(1, Math.min(10, Number(a.tier ?? 1)));
  const hook =
    (a.attachesTo ?? "belt") === "torso"
      ? "torso harness modular straps threaded clips climbing buckle tactical vest snippet"
      : (a.attachesTo ?? "") === "backpack"
        ? "mount bracket modular pouch snaps clips backpack accessory riveted straps"
        : "belt-mounted frog strap buckle swivel clips hanger bracket fantasy utility";

  const namePart = a.label ? `Concept "${a.label}", ` : "";
  return `${namePart}${hook}; weapon accessory silhouette readable silhouette empty slots implied; ${TIER_MOOD[tier]}, ${TECH_BASE}. --ar 1:1`;
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function sortTierThenId(rows) {
  return [...rows].sort((a, b) => (a.tier - b.tier) || String(a.id).localeCompare(String(b.id)));
}

function asCsv(rows) {
  const head = "category,id,name,tier,weight,value,prompt,negative";
  const body = rows.map((r) =>
    [r.category, r.id, r.name, r.tier, r.weight ?? "", r.value ?? "", r.prompt, NEGATIVE_TAGS].map(escapeCsv).join(","),
  ).join("\n");
  return head + "\n" + body + "\n";
}

function asMd(rows) {
  const lines = [
    "# Iron Hills — AI-промпты: инструменты, пояса, рюкзаки, крепления",
    "",
    "> Источник: `TOOLS`, `BELTS`, `BACKPACKS`, `ATTACHMENTS`. Перегенерация: `node tools/generate-gear-prompts.mjs`",
    "",
    "**Negative (общий):**",
    "```",
    NEGATIVE_TAGS,
    "```",
    "",
  ];

  const sections = [
    ["Инструменты и переносные мастерские", "tools"],
    ["Пояса", "belts"],
    ["Рюкзаки и сумки", "backpacks"],
    ["Крепления", "attachments"],
  ];

  for (const [title, cat] of sections) {
    lines.push(`## ${title}`, "");
    const chunk = rows
      .filter((r) => r.category === cat)
      .sort((a, b) => (a.tier - b.tier) || String(a.id).localeCompare(String(b.id)));
    let lastTier = -1;
    for (const r of chunk) {
      if (r.tier !== lastTier) {
        lines.push(`### Тир ${r.tier}`, "");
        lastTier = r.tier;
      }
      lines.push(`#### ${r.name} (\`${r.id}\`)`, "", "```", r.prompt, "```", "");
    }
  }

  return lines.join("\n");
}

function asJson(rows) {
  return JSON.stringify({ negative: NEGATIVE_TAGS, items: rows }, null, 2);
}

function buildRows() {
  const rows = [];

  for (const t of Object.values(TOOLS)) {
    rows.push({
      category: "tools",
      id: t.id,
      name: t.label,
      tier: t.tier ?? 1,
      weight: t.weight,
      value: t.value,
      prompt: promptTools(t),
    });
  }

  for (const b of Object.values(BELTS)) {
    rows.push({
      category: "belts",
      id: b.id,
      name: b.label,
      tier: b.tier ?? 1,
      weight: b.weight,
      value: b.value,
      prompt: promptBelts(b),
    });
  }

  for (const p of Object.values(BACKPACKS)) {
    rows.push({
      category: "backpacks",
      id: p.id,
      name: p.label,
      tier: p.tier ?? 1,
      weight: p.weight,
      value: p.value,
      prompt: promptBackpacks(p),
    });
  }

  for (const a of Object.values(ATTACHMENTS)) {
    rows.push({
      category: "attachments",
      id: a.id,
      name: a.label,
      tier: a.tier ?? 1,
      weight: a.weight,
      value: a.value,
      prompt: promptAttachments(a),
    });
  }

  return sortTierThenId(rows);
}

function main() {
  const fmt = (process.argv[2] ?? "all").toLowerCase();
  const rows = buildRows();

  if (fmt === "csv") return process.stdout.write(asCsv(rows));
  if (fmt === "md") return process.stdout.write(asMd(rows));
  if (fmt === "json") return process.stdout.write(asJson(rows));

  const outDir = resolve(ROOT, "docs/content");
  writeFileSync(resolve(outDir, "gear-prompts.csv"), asCsv(rows), "utf8");
  writeFileSync(resolve(outDir, "gear-prompts.md"), asMd(rows), "utf8");
  writeFileSync(resolve(outDir, "gear-prompts.json"), asJson(rows), "utf8");
  process.stdout.write(`Сгенерировано ${rows.length} промптов:\n  - docs/content/gear-prompts.{md,csv,json}\n`);
}

main();
