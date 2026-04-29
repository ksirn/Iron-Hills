/**
 * Iron Hills — генератор AI-промптов для всех weapon-позиций из items-catalog.
 *
 * Использование (Node 18+):
 *
 *   node tools/generate-weapon-prompts.mjs           # генерирует все три файла в docs/content/
 *   node tools/generate-weapon-prompts.mjs csv       # печатает CSV в stdout
 *   node tools/generate-weapon-prompts.mjs md        # печатает MD в stdout
 *   node tools/generate-weapon-prompts.mjs json      # печатает JSON в stdout
 *
 * CSV-колонки: id,name,tier,skill,twoHanded,prompt,negative
 *
 * Источник истины — `module/constants/items-catalog.mjs`. Если ты добавишь
 * новые позиции туда, скрипт автоматически выплюнет промпты и для них.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { WEAPONS } from "../module/constants/items-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── 1. Стилевая база по тирам ─────────────────────────────────
const TIER_STYLE = {
  1:  { mat: "rough copper, crude bronze, untreated wood, tied with sinew",
        mood: "worn, scratched, chipped edge, peasant militia tool",
        light: "dim warm campfire light" },
  2:  { mat: "bronze fittings, oak wood, tin rivets, rough leather wrap",
        mood: "tribal, hand-forged, well-used",
        light: "neutral daylight" },
  3:  { mat: "polished iron, hardwood haft, carbonized leather, simple etchings",
        mood: "standard issue, town-blacksmith made, well-maintained",
        light: "forge embers glow in background" },
  4:  { mat: "tempered steel, ironwood, bronze inlays, riveted leather, family-crest engraving",
        mood: "well-maintained, polished, decorative, soldier-grade",
        light: "clean white studio light" },
  5:  { mat: "tempered blue-silver steel, spirit-wood, sapphire inlay, faint mithril runes",
        mood: "master-crafted, faint magical etching, polished surfaces",
        light: "cool blue rim light, runes faintly glowing" },
  6:  { mat: "mithril (silver-white metal with blue sheen), ebony wood, silver runes, diamond inlay",
        mood: "elven and dwarven luxury craftsmanship, glowing engravings",
        light: "soft silver glow, magical particles drifting upward" },
  7:  { mat: "dark iron with purple crystal veins, eternal-wood grip, void-crystal pommel, faint smoke",
        mood: "ominous, brooding, menacing presence, evil-looking",
        light: "deep purple glow, wisps of smoke, ember-like sparks" },
  8:  { mat: "starmetal (deep blue metal with starfield interior), world-tree wood, dragon-leather grip, slowly rotating runes",
        mood: "celestial, otherworldly, primordial",
        light: "cosmic blue and violet glow, starfield bokeh, slowly orbiting glowing runes" },
  9:  { mat: "orichalcum (golden-red metal), star-shard accents, leviathan leather grip, ornate engravings",
        mood: "legendary, ornate, divine craftsmanship, hero-tier",
        light: "golden divine light, lens flare, sparks of pure energy" },
  10: { mat: "adamantium with starheart core, godsteel hilt, leviathan leather grip, reality bending around the edge",
        mood: "mythical primordial weapon, wielded by gods, cracks of light leaking from the metal",
        light: "intense divine aura, space-time distortion, lens flare, sparks of pure light" },
};

// ── 2. Фрагмент объекта по skill (+ twoHanded для тех, у кого есть варианты) ──
function getObjectFragment(skill, twoHanded) {
  const map = {
    knife:    "a single fantasy combat knife / dagger, leaf-shaped blade, full tang, leather-wrapped grip",
    sword:    twoHanded
      ? "a single fantasy two-handed greatsword, long straight blade, large cross guard, ricasso, two-hand grip"
      : "a single fantasy arming sword, straight double-edged blade, cross guard, leather-wrapped grip",
    axe:      twoHanded
      ? "a single fantasy two-handed battle axe / great-axe, large bearded head, long oak haft, iron rivets"
      : "a single fantasy hand axe, single-bit head, wooden haft, iron banding",
    spear:    "a single fantasy spear, long straight shaft, leaf-shaped spearhead, bound with leather strap",
    mace:     twoHanded
      ? "a single fantasy two-handed war hammer, large blunt head with spike on the back, long haft"
      : "a single fantasy mace, flanged head, short metal haft, leather grip",
    flail:    "a single fantasy flail, spiked metal ball on chain, wooden grip, dangerous looking",
    bow:      "a single fantasy longbow, recurve limbs, drawstring, no arrow nocked",
    crossbow: "a single fantasy crossbow, wooden tiller with steel limbs, intricate trigger mechanism, no bolt loaded",
    throwing: "a set of three fantasy throwing daggers / chakrams arranged in a fan, balanced, identical",
    exotic:   "a single fantasy wizard's staff, tall straight pole, ornamented head, no orb floating",
  };
  return map[skill] ?? "a single fantasy weapon, generic shape";
}

// ── 3. Доп. слова, если у предмета есть affixes (T9-10) ───────
function getAffixFragment(affixes) {
  if (!affixes) return "";
  const parts = [];
  if (affixes.ignoreArmor       >= 0.5) parts.push("blade glowing through armor like cutting through paper");
  else if (affixes.ignoreArmor  >= 0.3) parts.push("metal seems to phase through reality");
  if (affixes.bleedingBonus     >  0)   parts.push("edge dripping with blood-red light");
  if (affixes.lifeSteal         >  0)   parts.push("crimson essence swirling around the blade");
  if (affixes.executeBelowHp    >  0)   parts.push("aura of finality, soul-reaping shimmer");
  if (affixes.stunChance        >  0)   parts.push("crackling lightning arcs along the surface");
  if (affixes.disarmChance      >  0)   parts.push("hooked / barbed shape designed to catch and disarm");
  if (affixes.criticalDamageMult > 1)   parts.push("razor-sharp focal lines, killing-strike geometry");
  return parts.length ? ", " + parts.join(", ") : "";
}

// ── 4. Общие технические теги ─────────────────────────────────
const TECH_TAGS = "isolated single object, transparent or plain dark background, centered, full item visible, side view, no human, no hands, sharp focus, high detail, painterly style, fantasy item icon, soft rim light, slight specular highlights";

const NEGATIVE_TAGS = "text, watermark, logo, signature, blurry, low quality, multiple objects, hands, person, character, perspective distortion, cluttered background, horizontal layout, sideways, nsfw";

// ── 4a. Aspect ratio / resolution / orientation по gridW×gridH ──
function getAspectInfo(gridW, gridH) {
  const w = Math.max(1, Number(gridW || 1));
  const h = Math.max(1, Number(gridH || 1));
  if (w === h) {
    return { ar: "1:1", resolution: "1024x1024", orientation: "fan layout, balanced composition" };
  }
  if (h / w >= 4) {
    return { ar: "1:4", resolution: "384x1536", orientation: "extreme vertical orientation, weapon pointing up, full length visible top-to-bottom" };
  }
  if (h / w >= 3) {
    return { ar: "1:3", resolution: "512x1536", orientation: "vertical orientation, weapon pointing up" };
  }
  if (h / w >= 2) {
    return { ar: "1:2", resolution: "768x1536", orientation: "vertical orientation" };
  }
  return { ar: "1:1", resolution: "1024x1024", orientation: "balanced composition" };
}

// ── 5. Сборка промпта ─────────────────────────────────────────
function buildPrompt(weapon) {
  const tier  = Math.max(1, Math.min(10, Number(weapon.tier ?? 1)));
  const style = TIER_STYLE[tier];
  const aspect = getAspectInfo(weapon.gridW, weapon.gridH);

  const objFrag    = getObjectFragment(weapon.skill, Boolean(weapon.twoHanded));
  const affixFrag  = getAffixFragment(weapon.affixes);
  const namePart   = weapon.label ? `Concept of "${weapon.label}", ` : "";

  // Базовый промпт (без --ar, чтобы можно было подставить под любой генератор)
  const base = [
    namePart + objFrag + ",",
    `made of ${style.mat},`,
    `${style.mood}${affixFrag},`,
    `${aspect.orientation},`,
    TECH_TAGS + ",",
    `${aspect.resolution},`,
    style.light,
  ].join(" ");

  // Midjourney-флаг для удобства (не мешает другим генераторам — они его проигнорируют)
  return `${base} --ar ${aspect.ar}`;
}

// ── 6. Output форматтеры ──────────────────────────────────────
function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function asCsv(rows) {
  const head = "id,name,tier,skill,twoHanded,gridW,gridH,aspect,resolution,prompt,negative";
  const body = rows.map(r => [
    r.id,
    r.name,
    r.tier,
    r.skill,
    r.twoHanded ? "true" : "false",
    r.gridW,
    r.gridH,
    r.aspect,
    r.resolution,
    r.prompt,
    NEGATIVE_TAGS,
  ].map(escapeCsv).join(",")).join("\n");
  return head + "\n" + body + "\n";
}

function asMd(rows) {
  const lines = ["# Iron Hills — AI-промпты для всех weapon-позиций", "",
    "> Автогенерация из `WEAPONS` (см. `tools/generate-weapon-prompts.mjs`).",
    "> Если в каталоге появятся новые позиции — перегенерируй командой:",
    "> `node tools/generate-weapon-prompts.mjs`",
    "",
    "**Правила использования:**",
    "- Каждый промпт уже содержит правильный aspect ratio (`--ar 1:3`, `--ar 1:4`, ...) и resolution.",
    "- Картинку клади в `icons/items/weapons/{id}.webp` (где `{id}` указан в заголовке блока).",
    "- После добавления картинок выполни `node tools/apply-weapon-images.mjs` — скрипт пропишет `img:` в `items-catalog.mjs`.",
    "",
    `**Negative prompt (один на все):**`, "```", NEGATIVE_TAGS, "```", ""];
  let lastTier = -1;
  for (const r of rows) {
    if (r.tier !== lastTier) {
      lines.push("", `## Тир ${r.tier}`, "");
      lastTier = r.tier;
    }
    const meta = `${r.skill}${r.twoHanded ? ", 2H" : ""}, ${r.gridW}×${r.gridH}, AR ${r.aspect}, ${r.resolution}`;
    lines.push(`### ${r.name} *(\`${r.id}\`, ${meta})*`);
    lines.push("");
    lines.push("```");
    lines.push(r.prompt);
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}

function asJson(rows) {
  return JSON.stringify({ negative: NEGATIVE_TAGS, items: rows }, null, 2);
}

// ── 7. Main ───────────────────────────────────────────────────
function buildRows() {
  return Object.values(WEAPONS)
    .map(w => {
      const aspect = getAspectInfo(w.gridW, w.gridH);
      return {
        id:         w.id,
        name:       w.label,
        tier:       w.tier,
        skill:      w.skill,
        twoHanded:  w.twoHanded,
        gridW:      w.gridW ?? 1,
        gridH:      w.gridH ?? 1,
        aspect:     aspect.ar,
        resolution: aspect.resolution,
        prompt:     buildPrompt(w),
      };
    })
    .sort((a, b) => (a.tier - b.tier) || a.skill.localeCompare(b.skill) || a.id.localeCompare(b.id));
}

function main() {
  const fmt  = (process.argv[2] ?? "all").toLowerCase();
  const rows = buildRows();

  if (fmt === "csv")  return process.stdout.write(asCsv(rows));
  if (fmt === "md")   return process.stdout.write(asMd(rows));
  if (fmt === "json") return process.stdout.write(asJson(rows));

  // По умолчанию — записываем все три файла в docs/content/
  const outDir = resolve(ROOT, "docs/content");
  writeFileSync(resolve(outDir, "weapons-prompts.csv"),  asCsv(rows),  "utf8");
  writeFileSync(resolve(outDir, "weapons-prompts.md"),   asMd(rows),   "utf8");
  writeFileSync(resolve(outDir, "weapons-prompts.json"), asJson(rows), "utf8");
  process.stdout.write(
    `Сгенерировано ${rows.length} промптов:\n` +
    `  - docs/content/weapons-prompts.md   (читаемый каталог)\n` +
    `  - docs/content/weapons-prompts.csv  (для batch-генератора)\n` +
    `  - docs/content/weapons-prompts.json (для скриптов)\n`
  );
}

main();
