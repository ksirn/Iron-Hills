/**
 * Iron Hills — AI-промпты иконок добычи с разделки монстров (еда + материалы из пулов).
 *
 *   node tools/generate-monster-loot-prompts.mjs
 *   node tools/generate-monster-loot-prompts.mjs csv | md | json
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { MONSTER_HARVEST_DROP_POOLS } from "../module/constants/monster-loot-pools.mjs";
import { FOOD, MATERIALS } from "../module/constants/items-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = resolve(ROOT, "docs/content");

const NEGATIVE =
  "text, watermark, logo, signature, blurry, low quality, cluttered wide shot, multiple objects collage, human face full portrait, nsfw";

const TECH_FOOD_HARVEST =
  "single isolated fantasy RPG food ingredient from monster carcass, centered, transparent or plain dark background, square inventory icon, no hands, sharp focus, painterly, controlled mild gore only if meat";

const TECH_MAT_HARVEST =
  "single isolated fantasy RPG harvest trophy reagent icon, centered, transparent or plain dark background, square 1024 composition, sharp focus, painterly detail";

/** Настроение по «ступени пула» (_t7 и т.д.). */
const ORGANIC_HARVEST_MOOD = {
  1: "vermin scrap ash-bog grit humble hunt yield",
  2: "wetland predator trail dressing damp moss",
  3: "alpine pack-beast alpha musk trophy read",
  4: "wyvern drake trophy scales sinew resin elite quarry",
  5: "caravan-hunted prize cuts hardened scales hoard",
  6: "kaiju-class bulk hide venom reservoirs",
  7: "beast-lord mantle layered hides glands legendary",
  8: "beast-lord apex resin reservoirs armored slabs",
  9: "beast-lord pinnacle trophy hoard dense scales",
  10: "primordial kaiju apex colossus reagent avalanche",
};

function inferPoolTier(poolKey) {
  const m = /_t(\d+)\s*$/i.exec(String(poolKey));
  return m ? Math.max(1, Math.min(10, Number(m[1]) || 1)) : 4;
}

function moodForTier(t) {
  return ORGANIC_HARVEST_MOOD[Math.max(1, Math.min(10, t))] ?? ORGANIC_HARVEST_MOOD[4];
}

function buildHarvestFoodPrompt(f, tierHint) {
  const tierItem = Math.max(1, Math.min(10, Number(f.tier ?? 1)));
  const tier = Math.max(tierItem, tierHint);
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
      ? "serpent jelly ichor cup trail-wrap moist sheen"
      : sat > hyd * 2
        ? "dense haunch steak marbling sinew ribbons field salt"
        : "mixed hunter trim portions sinew marbling";
  return (
    `${namePart}monster harvest butcher fantasy — ${cut}, ` +
    `oiled cloth or rough wooden board NOT banquet china, coarse salt and twine, ` +
    `${TECH_FOOD_HARVEST}, mood ${moodForTier(tier)}, tier ${tier} quarry read --ar 1:1`
  );
}

function materialCategoryHint(m) {
  const label = String(m.label ?? "");
  const c = String(m.category ?? "misc");
  if (c === "hide")
    return "folded uncured hide fur edge scale plates subtle salt cure beginning";
  if (c === "herb") {
    if (/яд|venom|желч/i.test(label)) return "visceral sac bulb stoppered wax cord alchemical";
    if (/смол|resin/i.test(label)) return "dark amber resin plug predator gum cluster";
    return "dried gland herb bundle resin flecks twine wrap";
  }
  if (/клык|fang|оскол/i.test(label)) return "splintered enamel ivory shard trophy tip";
  if (/жил|sinew/i.test(label)) return "fibrous tendon coil stripped sinew filament spool cue";
  if (/кольц/i.test(label)) return "bristle rings bundled hog trophy craft rings";
  if (/киль|bone|кост/i.test(label)) return "lightweight beast bone keel ridge marrow hollow";
  if (/гриб/i.test(label)) return "bog mushroom cluster mud grit spores muted";
  return "monster trophy fragment readable silhouette";
}

function buildHarvestMaterialPrompt(m, tierHint) {
  const tierItem = Math.max(1, Math.min(10, Number(m.tier ?? 1)));
  const tier = Math.max(tierItem, tierHint);
  const namePart = m.label ? `Concept "${m.label}", ` : "";
  const hint = materialCategoryHint(m);
  return (
    `${namePart}fantasy harvest material — ${hint}, ${TECH_MAT_HARVEST}, ${moodForTier(tier)} atmosphere, tier ${tier} drop read --ar 1:1`
  );
}

function maxTierHintForCatalog(type, catalogId) {
  let maxT = 1;
  for (const [pk, lines] of Object.entries(MONSTER_HARVEST_DROP_POOLS)) {
    if (lines.some((ln) => ln.type === type && ln.catalogId === catalogId))
      maxT = Math.max(maxT, inferPoolTier(pk));
  }
  return maxT;
}

function lootPromptForLine(type, catalogId, poolKey) {
  const th = inferPoolTier(poolKey);
  if (type === "food") {
    const f = FOOD[catalogId];
    if (!f) return `missing FOOD ${catalogId}`;
    return buildHarvestFoodPrompt(f, th);
  }
  const m = MATERIALS[catalogId];
  if (!m) return `missing MATERIAL ${catalogId}`;
  return buildHarvestMaterialPrompt(m, th);
}

function displayName(type, catalogId) {
  if (type === "food") return FOOD[catalogId]?.label ?? catalogId;
  return MATERIALS[catalogId]?.label ?? catalogId;
}

function escapeCsv(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildFlattenedRows() {
  /** @type {Array<Record<string, unknown>>} */
  const rows = [];
  const poolKeys = Object.keys(MONSTER_HARVEST_DROP_POOLS).sort();
  for (const poolKey of poolKeys) {
    const lines = MONSTER_HARVEST_DROP_POOLS[poolKey] ?? [];
    for (const ln of lines) {
      rows.push({
        poolKey,
        type: ln.type,
        catalogId: ln.catalogId,
        name: displayName(ln.type, ln.catalogId),
        qtyMin: ln.qtyMin,
        qtyMax: ln.qtyMax,
        chancePct: ln.chancePct,
        prompt: lootPromptForLine(ln.type, ln.catalogId, poolKey),
        negative: NEGATIVE,
      });
    }
  }
  return rows;
}

function buildUniqueRows() {
  /** @type {Map<string, { type: string, catalogId: string }>} */
  const seen = new Map();
  for (const [poolKey, lines] of Object.entries(MONSTER_HARVEST_DROP_POOLS)) {
    for (const ln of lines) {
      const k = `${ln.type}:${ln.catalogId}`;
      if (!seen.has(k)) seen.set(k, { type: ln.type, catalogId: ln.catalogId });
    }
  }
  const out = [];
  for (const { type, catalogId } of seen.values()) {
    const th = maxTierHintForCatalog(type, catalogId);
    const prompt =
      type === "food"
        ? FOOD[catalogId]
          ? buildHarvestFoodPrompt(FOOD[catalogId], th)
          : `missing FOOD ${catalogId}`
        : MATERIALS[catalogId]
          ? buildHarvestMaterialPrompt(MATERIALS[catalogId], th)
          : `missing MATERIAL ${catalogId}`;
    out.push({
      type,
      catalogId,
      name: displayName(type, catalogId),
      tierHint: th,
      prompt,
      negative: NEGATIVE,
      pools: Object.keys(MONSTER_HARVEST_DROP_POOLS)
        .filter((pk) =>
          (MONSTER_HARVEST_DROP_POOLS[pk] ?? []).some(
            (ln) => ln.type === type && ln.catalogId === catalogId,
          ),
        )
        .sort(),
    });
  }
  out.sort(
    (a, b) =>
      String(a.type).localeCompare(String(b.type)) ||
      String(a.catalogId).localeCompare(String(b.catalogId)),
  );
  return out;
}

function asCsvFlat(rows) {
  const head =
    "poolKey,type,catalogId,name,qtyMin,qtyMax,chancePct,prompt,negative";
  const body = rows
    .map((r) =>
      [
        r.poolKey,
        r.type,
        r.catalogId,
        r.name,
        r.qtyMin,
        r.qtyMax,
        r.chancePct,
        r.prompt,
        r.negative,
      ]
        .map(escapeCsv)
        .join(","),
    )
    .join("\n");
  return head + "\n" + body + "\n";
}

function asCsvUnique(rows) {
  const head = "type,catalogId,name,tierHint,pools,prompt,negative";
  const body = rows
    .map((r) =>
      [
        r.type,
        r.catalogId,
        r.name,
        r.tierHint,
        r.pools.join(";"),
        r.prompt,
        r.negative,
      ]
        .map(escapeCsv)
        .join(","),
    )
    .join("\n");
  return head + "\n" + body + "\n";
}

function asMd(flat, unique) {
  const lines = [
    "# Iron Hills — AI-промпты: добыча с разделки монстров",
    "",
    "> Источник: `MONSTER_HARVEST_DROP_POOLS` + подписи из `FOOD` / `MATERIALS`.",
    "> Перегенерация: `node tools/generate-monster-loot-prompts.mjs`",
    "",
    "Используй **уникальные** строки для одной иконки на предмет; секция **по пулам** — чтобы видеть, у какого круга тварей какой шанс и количество.",
    "",
    "**Negative (общий):**",
    "```",
    NEGATIVE,
    "```",
    "",
    "## Уникальные предметы добычи (один промпт на id)",
    "",
  ];
  let lastType = "";
  for (const r of unique) {
    if (r.type !== lastType) {
      lines.push("", `### ${r.type === "food" ? "Еда" : "Материалы"}`, "");
      lastType = r.type;
    }
    lines.push(
      `#### ${r.name} *(\`${r.catalogId}\`, пулы: ${r.pools.map((p) => `\`${p}\``).join(", ")})*`,
      "",
      "```",
      r.prompt,
      "```",
      "",
    );
  }
  lines.push("", "---", "", "## По пулам разделки", "");
  const byPool = Object.keys(MONSTER_HARVEST_DROP_POOLS).sort();
  for (const pk of byPool) {
    lines.push(`### Пул \`${pk}\` *(ступень пула ~ ${inferPoolTier(pk)})*`, "");
    for (const ln of MONSTER_HARVEST_DROP_POOLS[pk] ?? []) {
      const row = flat.find(
        (x) =>
          x.poolKey === pk &&
          x.catalogId === ln.catalogId &&
          x.type === ln.type,
      );
      if (!row) continue;
      lines.push(
        `#### ${row.name} *(\`${ln.catalogId}\`, ${ln.type})* — ~${ln.chancePct}%, ×${ln.qtyMin}–${ln.qtyMax}`,
        "",
        "```",
        row.prompt,
        "```",
        "",
      );
    }
  }
  return lines.join("\n");
}

function asJson(flat, unique) {
  return JSON.stringify(
    {
      negative: NEGATIVE,
      uniqueLoot: unique,
      byPool: Object.fromEntries(
        Object.keys(MONSTER_HARVEST_DROP_POOLS)
          .sort()
          .map((pk) => [
            pk,
            (MONSTER_HARVEST_DROP_POOLS[pk] ?? []).map((ln) => ({
              ...ln,
              name: displayName(ln.type, ln.catalogId),
              prompt: lootPromptForLine(ln.type, ln.catalogId, pk),
            })),
          ]),
      ),
    },
    null,
    2,
  );
}

function main() {
  const fmt = (process.argv[2] ?? "all").toLowerCase();
  const flat = buildFlattenedRows();
  const unique = buildUniqueRows();

  if (fmt === "csv") return process.stdout.write(asCsvFlat(flat));
  if (fmt === "md") return process.stdout.write(asMd(flat, unique));
  if (fmt === "json") return process.stdout.write(asJson(flat, unique));

  writeFileSync(resolve(CONTENT, "monster-loot-prompts.md"), asMd(flat, unique), "utf8");
  writeFileSync(
    resolve(CONTENT, "monster-loot-prompts.unique.csv"),
    asCsvUnique(unique),
    "utf8",
  );
  writeFileSync(resolve(CONTENT, "monster-loot-prompts.csv"), asCsvFlat(flat), "utf8");
  writeFileSync(resolve(CONTENT, "monster-loot-prompts.json"), asJson(flat, unique), "utf8");
  process.stdout.write(
    `Сгенерировано: уникальных ${unique.length}, строк по пулам ${flat.length}\n  - docs/content/monster-loot-prompts.{md,json}\n  - docs/content/monster-loot-prompts.csv (плоская)\n  - docs/content/monster-loot-prompts.unique.csv\n`,
  );
}

main();
