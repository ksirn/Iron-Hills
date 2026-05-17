/**
 * Iron Hills — генератор AI-промптов для зелий из POTIONS.
 *
 *   node tools/generate-potion-prompts.mjs
 *   node tools/generate-potion-prompts.mjs csv | md | json
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { POTIONS } from "../module/constants/items-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const TIER_STYLE = {
  1:  { liquid: "murky russet suspension, sediment at bottom", vessel: "cheap blown glass", glow: "none" },
  2:  { liquid: "clear amber serum", vessel: "simple flask with cork", glow: "very faint inner shimmer" },
  3:  { liquid: "ruby-red translucent liquid", vessel: "faceted crystal vial", glow: "soft pulse every few seconds" },
  4:  { liquid: "deep sapphire swirl with metallic flakes", vessel: "steel-capped alchemical bottle", glow: "steady faint aura" },
  5:  { liquid: "pearlescent gradient liquid", vessel: "ornate flask with seal wax", glow: "warm halo" },
  6:  { liquid: "silver-threaded emerald liquor", vessel: "mithril-trimmed phial", glow: "cold magical steam wisps" },
  7:  { liquid: "star-speckled violet plasma", vessel: "void-glass ampoule", glow: "orbiting dust motes of light" },
  8:  { liquid: "radiant golden ichor", vessel: "filigree celestial flask", glow: "sunbeam god-rays through liquid" },
  9:  { liquid: "molten sunrise-orange core fluid", vessel: "orichalcum-stoppered relic bottle", glow: "voluntary sparks along rim" },
  10: { liquid: "prismatic abyss-black mirror fluid", vessel: "adamant seal amphora-miniature", glow: "reality ripple distortion around vessel" },
};

function effectWords(effect) {
  const map = {
    healHP:           "concept: wounds knitting shut, restorative warmth",
    healAll:          "concept: total bodily renewal, cathedral purity",
    restoreEnergy:    "concept: lightning stamina surge, brisk vitality",
    restoreEnergyMax: "concept: expanded lung-heart endurance reservoir",
    restoreMana:      "concept: arcane reservoir refill, whispering sparks",
    restoreHydration: "concept: crisp mountain spring clarity",
    curePoison:       "concept: cleansing green shimmer neutralizing toxins",
    speedBoost:       "concept: wind-cut streak motes, kinetic hurry readiness",
  };
  return map[effect] ?? "concept: alchemical empowerment";
}

const TECH_TAGS =
  "single isolated fantasy potion bottle or small flask, centered, transparent or plain dark background, vertical orientation, icon clarity, no human hands, sharp focus, painterly RPG inventory sprite";

const NEGATIVE_TAGS =
  "text, watermark, logo, signature, blurry, low quality, cluttered shelf of bottles, laboratory clutter, multiple unrelated potions, human face, nsfw";

function buildPrompt(p) {
  const tier = Math.max(1, Math.min(10, Number(p.tier ?? 1)));
  const style = TIER_STYLE[tier];
  const eff = effectWords(p.effect ?? "healHP");
  const namePart = p.label ? `Concept "${p.label}", ` : "";

  const base = [
    namePart + "a single fantasy consumable potion bottle / sealed alchemical flask,",
    `${eff},`,
    `liquid appearance: ${style.liquid}, vessel: ${style.vessel},`,
    `${style.glow},`,
    TECH_TAGS + ",",
    "1024x1024 composition suitable for square inventory slot",
  ].join(" ");

  return `${base} --ar 1:1`;
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function asCsv(rows) {
  const head = "id,name,tier,effect,power,prompt,negative";
  const body = rows.map((r) =>
    [r.id, r.name, r.tier, r.effect, r.power, r.prompt, NEGATIVE_TAGS].map(escapeCsv).join(","),
  ).join("\n");
  return head + "\n" + body + "\n";
}

function asMd(rows) {
  const lines = [
    "# Iron Hills — AI-промпты для зелий",
    "",
    "> Источник: `POTIONS` в `items-catalog.mjs`. Перегенерация: `node tools/generate-potion-prompts.mjs`",
    "",
    "**Negative (общий):**",
    "```",
    NEGATIVE_TAGS,
    "```",
    "",
  ];
  let lastTier = -1;
  for (const r of rows) {
    if (r.tier !== lastTier) {
      lines.push("", `## Тир ${r.tier}`, "");
      lastTier = r.tier;
    }
    lines.push(`### ${r.name} *(\`${r.id}\`, ${r.effect}, power ${r.power})*`, "", "```", r.prompt, "```", "");
  }
  return lines.join("\n");
}

function asJson(rows) {
  return JSON.stringify({ negative: NEGATIVE_TAGS, items: rows }, null, 2);
}

function buildRows() {
  return Object.values(POTIONS)
    .map((p) => ({
      id: p.id,
      name: p.label,
      tier: p.tier,
      effect: p.effect ?? "healHP",
      power: p.power ?? 0,
      prompt: buildPrompt(p),
    }))
    .sort((a, b) => (a.tier - b.tier) || a.effect.localeCompare(b.effect) || a.id.localeCompare(b.id));
}

function main() {
  const fmt = (process.argv[2] ?? "all").toLowerCase();
  const rows = buildRows();

  if (fmt === "csv") return process.stdout.write(asCsv(rows));
  if (fmt === "md") return process.stdout.write(asMd(rows));
  if (fmt === "json") return process.stdout.write(asJson(rows));

  const outDir = resolve(ROOT, "docs/content");
  writeFileSync(resolve(outDir, "potions-prompts.csv"), asCsv(rows), "utf8");
  writeFileSync(resolve(outDir, "potions-prompts.md"), asMd(rows), "utf8");
  writeFileSync(resolve(outDir, "potions-prompts.json"), asJson(rows), "utf8");
  process.stdout.write(
    `Сгенерировано ${rows.length} промптов:\n` +
      `  - docs/content/potions-prompts.{md,csv,json}\n`,
  );
}

main();
