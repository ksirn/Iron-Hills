/**
 * Генерация AI-промптов для портретов монстров и NPC (единый стиль с weapons-prompts).
 * Список монстров = ключи MONSTER_BESTIARY. Если в компендиуме ih-monsters больше строк
 * или есть «левые» записи без id, синхронизируй как GM из консоли:
 * await game.ironHills.syncMonsterPackToBestiary()
 *
 *   node tools/generate-creature-prompts.mjs           # docs/content/monsters-prompts*.md+json+csv и npc*
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { MONSTER_BESTIARY } from "../module/constants/monster-bestiary.mjs";
import { NPC_SPECIALIZATIONS } from "../module/constants/npc-profiles.mjs";
import { getMonsterHarvestDropLines } from "../module/constants/monster-loot-pools.mjs";
import { FOOD, MATERIALS } from "../module/constants/items-catalog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = resolve(ROOT, "docs/content");

/** Как в weapons-prompts: общий negative для всех иконок. */
const NEGATIVE =
  "text, watermark, logo, signature, blurry, low quality, multiple objects, hands, swarm, collage, crowded scene, person, playable character, HUD, perspective distortion, cluttered background, horizontal layout, sideways, nsfw";

const COMMON_TECH =
  "isolated fantasy creature illustration, centered, full body readable, painterly RPG style, matte painting, coherent lighting, ambient occlusion, game token suitable, circular crop friendly, neutral ground shadow, sharp focus";

/** Для человекоподобных NPC (не использовать creature-формулировку из COMMON_TECH). */
const NPC_COMMON_TECH =
  "isolated fantasy humanoid character portrait, waist-up readable, painterly RPG style, matte painting, coherent lighting, soft rim light, game token suitable, circular crop friendly, sharp focus, transparent or plain dark background";

/** Три промпта на специализацию: бедный / средний / зажиточный (соответствуют тирам генератора). */
const NPC_PROMPT_BANDS = [
  {
    id: "t1_3",
    labelRu: "низкая ступень (× тир 1–3)",
    tierMin: 1,
    tierMax: 3,
    moodTier: 2,
  },
  {
    id: "t4_6",
    labelRu: "средняя ступень (× тир 4–6)",
    tierMin: 4,
    tierMax: 6,
    moodTier: 5,
  },
  {
    id: "t7_10",
    labelRu: "высокая ступень (× тир 7–10)",
    tierMin: 7,
    tierMax: 10,
    moodTier: 8,
  },
];

/** Англоязычный «экономический» силуэт для промпта: одежда, инструмент, выражение лица по диапазону. */
const NPC_BAND_SILHOUETTE = {
  __default: {
    t1_3: "humble worn garments, frayed edges, tired eyes, bare essentials visible",
    t4_6: "well-kept layered clothes and kit, rested posture, small signs of means",
    t7_10: "premium fabrics subtle jewelry or insignia hints, commanding calm well-fed bearing",
  },
  villager: {
    t1_3: "patched hemp and soot-stained apron, thin hands hunger-worry gaze, crude wooden crockery cue",
    t4_6: "clean wool skirt or jerkin sturdy boots market-day neatness modest coin pouch",
    t7_10: "fine weave embroidery ring or clasp hint servant-free shoulders prosperous guild or rentier vibe",
  },
  guard: {
    t1_3: "ill-fitting gambeson rusty mail scrap militia levy wooden club or short spear fatigue",
    t4_6: "matching tabard neat chain or brigandine serviced blade duty belt confident watch stance",
    t7_10: "captain polished half-plate ceremonial sash veteran medals coif immaculate halberd or longsword",
  },
  bandit: {
    t1_3: "rag-wrapped outlaw desperate knife mud-caked cloak fear and starvation in eyes forest mud",
    t4_6: "organized leather armor matched throwing knives swagger road predator trophies",
    t7_10: "guilded highway captain ornate belt silk under leather mercenary finesse ruthless poise",
  },
  mage: {
    t1_3: "tattered robes borrowed staff ash on cuffs novice cantrips nervous focus cheap herbs",
    t4_6: "embroidered cuffs focus crystal belt pouch neat arcane braid respected hedge-wizard aura",
    t7_10: "rich velvet or archmage trim rune-thread gloves levitating dust motes authority without shouting",
  },
  crafter: {
    t1_3: "singed apron borrowed hammer calloused raw knuckles shared workshop grime apprentice poverty",
    t4_6: "own apron tools belt metal polish smell controlled burns master-signed leather brace",
    t7_10: "guild master medallion immaculate forge coat precision instruments displayed wealth in steel",
  },
  hunter: {
    t1_3: "mismatched furs snare twine hunger lean bow frayed string mud boots poacher desperation",
    t4_6: "oiled leather quiver trophies antler knife confident trail gait provisioned belt",
    t7_10: "noble hunt livery engraved bow silver cap fur mantle legend-tracker prestige",
  },
  noble: {
    t1_3: "ruined petty-gentry moth-eaten cloak ink-stained decree poverty pride hollow cheeks",
    t4_6: "court-cut doublet heraldic baldric groomed beard city politics steel",
    t7_10: "jeweled gorget heirloom blade signet glaring silks restrained power inner-circle elite",
  },
  priest: {
    t1_3: "worn cassock incense smoke poverty parish candles tired kindness dirt-under-nails holiness",
    t4_6: "embroidered stole neat tonsure blessed reliquary on cord trusted village pillar",
    t7_10: "heavy brocade mitre hinted grand altar authority choir-gold restrained divine theatre",
  },
};

function silhouetteForNpcBand(specKey, bandId) {
  const row = NPC_BAND_SILHOUETTE[specKey] ?? {};
  const d = NPC_BAND_SILHOUETTE.__default;
  return row[bandId] ?? d[bandId] ?? d.t4_6;
}

const CREATURE_MOOD_BY_TIER = {
  1: "grimy scavenger prey, soot and mud, campfire rim light",
  2: "dangerous predator, damp atmosphere, moss and grit",
  3: "alpha beast, sharper details, dusk tension",
  4: "monster trophy beast, heroic scale creep, colder highlights",
  5: "eldritch predator, unnatural growths, ominous backlight",
  6: "apex kaiju-lite fantasy monster, heroic presence, cinematic contrast",
  7: "ominous, brooding, menacing presence, evil-looking, deep purple rim light wisps",
  8: "celestial aberration undertone, otherworldly predator, cosmic blue violet glow hints",
  9: "legendary apex beast, ornate trophy hunter quarry, golden rim accents",
  10: "primordial colossus, mythical kaiju silhouette, cracks of inner light leaking",
};

const NPC_MOOD_BY_TIER = {
  1: "commoner look, weary but alive, soot and hemp cloth",
  2: "skilled artisan or fighter, sharper gear hints, dusty daylight",
  3: "seasoned professional, restrained palette",
  4: "notable retinue vibes, finer weave and heraldic hint",
  5: "veteran bearing, understated steel and scars",
  6: "regional elite, immaculate gear discipline",
  7: "master-tier presence, bespoke armor cloth mix",
  8: "high delegate, controlled opulence",
  9: "legend-tier npc gravitas, story centerpiece energy",
  10: "mythic envoy, restrained awe",
};

function creatureTierMood(t) {
  const tier = Math.max(1, Math.min(10, Number(t) || 1));
  return CREATURE_MOOD_BY_TIER[tier] ?? CREATURE_MOOD_BY_TIER[6];
}

function npcTierMood(t) {
  const tier = Math.max(1, Math.min(10, Number(t) || 1));
  return NPC_MOOD_BY_TIER[tier] ?? NPC_MOOD_BY_TIER[5];
}

/** Убираем финальную точку у русского описания — иначе лишний разделитель перед английским хвостом промпта. */
function sanitizeFlavorText(desc, emptyFallback = "fantasy frontier denizen") {
  let s = String(desc ?? "").trim();
  if (!s) return emptyFallback;
  return s.replace(/[.。…]\s*$/, "").trim();
}

function buildMonsterPrompt(row) {
  const tier = Number(row.tier) || 1;
  const mood = creatureTierMood(tier);
  const labelRu = row.label ?? row.id;
  const flavor = sanitizeFlavorText(
    row.desc,
    "predatory fantasy beast of the Iron Hills wilds"
  );
  return (
    `Concept of "${labelRu}", one single fantasy monster token for tabletop RPG — Iron Hills: ash bogs, briar scrub, rusty mine runoff; ${flavor}; ` +
    `${COMMON_TECH}, tier ${tier} encounter presence, ${mood}, portrait-friendly framing, subtle breath fog, muted ochre rust evergreen brown palette, transparent or plain dark background, no UI frame, 1024x1024, soft rim light, slight specular highlights --ar 1:1`
  );
}

/**
 * @param {string} key
 * @param {Record<string, unknown>} profile
 * @param {{ id: string, labelRu: string, tierMin: number, tierMax: number, moodTier: number }} band
 */
function buildNpcPrompt(key, profile, band) {
  const mood = npcTierMood(band.moodTier);
  const labelRu = profile.label ?? key;
  const flavor = sanitizeFlavorText(
    profile.desc,
    "Iron Hills frontier settler or specialist"
  );
  const sil = silhouetteForNpcBand(key, band.id);
  return (
    `Concept of "${labelRu}" (${band.labelRu}), one humanoid npc portrait for Iron Hills VTT — ${flavor}; ` +
    `${NPC_COMMON_TECH}; status read clearly: ${sil}; ` +
    `use Iron Hills generator tiers ${band.tierMin}–${band.tierMax} for exact skill gear power; mood anchor (${mood}), ` +
    `single character readable silhouette human face rough frontier period no duplicate portraits 1024x1024 --ar 1:1`
  );
}

function buildMonsterLootBulletList(row) {
  const poolKey = row.lootPool ?? row.lootTable ?? "";
  const lines = getMonsterHarvestDropLines(poolKey);
  if (!lines.length) return "";
  const bullets = lines
    .map((ln) => {
      const nm =
        ln.type === "food"
          ? FOOD[ln.catalogId]?.label ?? ln.catalogId
          : MATERIALS[ln.catalogId]?.label ?? ln.catalogId;
      return `- **${nm}** (\`${ln.catalogId}\`, ${ln.type}) — ~${ln.chancePct}%, ×${ln.qtyMin}–${ln.qtyMax}`;
    })
    .join("\n");
  return (
    `**Добыча с туши** (пул \`${poolKey}\`):\n${bullets}\n\n` +
    `*Промпты иконок дропа:* \`docs/content/monster-loot-prompts.md\` (уникальные + по пулам).\n`
  );
}

function buildMonsterLootSummaryOneLine(row) {
  const poolKey = row.lootPool ?? row.lootTable ?? "";
  const lines = getMonsterHarvestDropLines(poolKey);
  if (!lines.length) return "";
  return lines
    .map((ln) => {
      const nm =
        ln.type === "food"
          ? FOOD[ln.catalogId]?.label ?? ln.catalogId
          : MATERIALS[ln.catalogId]?.label ?? ln.catalogId;
      return `${nm} ~${ln.chancePct}%`;
    })
    .join("; ");
}

function buildMdMonsters() {
  const byTier = {};
  for (const row of Object.values(MONSTER_BESTIARY)) {
    const ti = Number(row.tier) || 1;
    if (!byTier[ti]) byTier[ti] = [];
    byTier[ti].push(row);
  }
  let md = `# Iron Hills — AI-промпты: монстры (бестиарий)

> Автогенерация из \`MONSTER_BESTIARY\` — перегенерация после правок ростеровой таблицы:
> \`node tools/generate-creature-prompts.mjs\`

**Правила использования:**
- Aspect ratio по умолчанию **--ar 1:1**, **1024×1024** под токен (как в блоке промпта).
- Готовые токены клади в \`systems/iron-hills-system/icons/tokens/monsters/{id}.webp\` — замени \`{id}\` на ключ из заголовка (например \`fen_slitherer.webp\`); путь пропиши в листе актёра/compendium или через GM.
- Каждый монстр компендиума **ih-monsters** соответствует одному блоку ниже (**полнота ключей проверяется при генерации**).
- **Иконки добычи с туши** (сырое мясо, железы, шкуры и т.д.): \`node tools/generate-monster-loot-prompts.mjs\` → \`docs/content/monster-loot-prompts.md\`.

**Negative prompt (один на все):**
\`\`\`
${NEGATIVE}
\`\`\`

`;

  const tiers = Object.keys(byTier)
    .map(Number)
    .sort((a, b) => a - b);
  for (const ti of tiers) {
    md += `\n## Тир ${ti}\n\n`;
    for (const row of byTier[ti].sort((a, b) => a.label.localeCompare(b.label, "ru"))) {
      md += `### ${row.label} *(\`${row.id}\`, AR 1:1 1024×1024, пул добычи: \`${row.lootPool ?? row.lootTable ?? ""}\`)*\n\n\`\`\`\n${buildMonsterPrompt(row)}\n\`\`\`\n\n${buildMonsterLootBulletList(row)}\n`;
    }
  }
  return md;
}

function buildMdNpcs() {
  const list = Object.entries(NPC_SPECIALIZATIONS).map(([key, p]) => ({ key, ...p }));
  list.sort((a, b) => a.key.localeCompare(b.key));

  let md = `# Iron Hills — AI-промпты: NPC (специализации × диапазон тира)

> Автогенерация из \`NPC_SPECIALIZATIONS\` + три диапазона (\`t1_3\`, \`t4_6\`, \`t7_10\`): \`node tools/generate-creature-prompts.mjs\`
>
> Выбери блок по **специализации** и по **ступени из генератора** (1–3 беднее, 7–10 богаче/элитнее). Один промпт не обязан на каждый из десяти тиров — ступени внутри диапазона можно уточнять текстом («чуть голодает», «после удачного года»).

**Правила использования:**
- **1:1**, **1024×1024** — см. промпт.
- Имя файла токена: \`icons/tokens/npc/{ключ}_{диапазон}.webp\`, например \`villager_t4_6.webp\`, \`bandit_t7_10.webp\`.

**Negative prompt (один на все):**
\`\`\`
${NEGATIVE}
\`\`\`

`;

  const bandTitles = {
    t1_3: "Беднее / простой люд (генератор × тир 1–3)",
    t4_6: "Середина / умелые (генератор × тир 4–6)",
    t7_10: "Зажиточнее / статус и элита (генератор × тир 7–10)",
  };

  for (const row of list) {
    md += `## ${row.label} (\`${row.key}\`)\n\n`;
    for (const band of NPC_PROMPT_BANDS) {
      md += `### ${bandTitles[band.id] ?? band.id}\n`;
      md += `*prompt id:* \`${row.key}_${band.id}\` · *tiers:* ${band.tierMin}–${band.tierMax}\n\n`;
      md += `\`\`\`\n${buildNpcPrompt(row.key, row, band)}\n\`\`\`\n\n`;
    }
  }
  return md;
}

function main() {
  const monsterRows = Object.values(MONSTER_BESTIARY).map((row) => ({
    id: row.id,
    name: row.label,
    tier: row.tier,
    lootPool: row.lootPool ?? row.lootTable,
    lootSummaryRu: buildMonsterLootSummaryOneLine(row),
    prompt: buildMonsterPrompt(row),
    negative: NEGATIVE,
  }));
  const npcRows = Object.entries(NPC_SPECIALIZATIONS).flatMap(([key, p]) =>
    NPC_PROMPT_BANDS.map((band) => ({
      id: `${key}_${band.id}`,
      specialization: key,
      name: p.label,
      tierBand: band.id,
      tierRange: `${band.tierMin}-${band.tierMax}`,
      moodAnchorTier: band.moodTier,
      prompt: buildNpcPrompt(key, p, band),
      negative: NEGATIVE,
    }))
  );
  npcRows.sort((a, b) => a.id.localeCompare(b.id));

  writeFileSync(resolve(CONTENT, "monsters-prompts.md"), buildMdMonsters(), "utf8");
  writeFileSync(resolve(CONTENT, "npc-prompts.md"), buildMdNpcs(), "utf8");
  writeFileSync(resolve(CONTENT, "monsters-prompts.json"), JSON.stringify(monsterRows, null, 2), "utf8");
  writeFileSync(resolve(CONTENT, "npc-prompts.json"), JSON.stringify(npcRows, null, 2), "utf8");

  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const monCsv = ["id,name,tier,lootPool,lootSummaryRu,prompt,negative"]
    .concat(
      monsterRows.map((r) =>
        [r.id, r.name, r.tier, r.lootPool, r.lootSummaryRu, r.prompt, r.negative].map(esc).join(","),
      ),
    )
    .join("\n");
  const npcCsv = ["id,specialization,name,tierBand,tierRange,moodAnchorTier,prompt,negative"]
    .concat(
      npcRows.map((r) =>
        [
          r.id,
          r.specialization,
          r.name,
          r.tierBand,
          r.tierRange,
          r.moodAnchorTier,
          r.prompt,
          r.negative,
        ]
          .map(esc)
          .join(",")
      )
    )
    .join("\n");
  writeFileSync(resolve(CONTENT, "monsters-prompts.csv"), monCsv, "utf8");
  writeFileSync(resolve(CONTENT, "npc-prompts.csv"), npcCsv, "utf8");

  const beastKeys = Object.keys(MONSTER_BESTIARY).sort();
  const rowIds = monsterRows.map((r) => r.id).sort();
  if (beastKeys.length !== rowIds.length || beastKeys.some((k, i) => k !== rowIds[i])) {
    throw new Error(
      `Iron Hills | generate-creature-prompts: MONSTER_BESTIARY и выход расходятся: ${JSON.stringify(beastKeys)} vs ${JSON.stringify(rowIds)}`
    );
  }
  const npcSpecKeys = Object.keys(NPC_SPECIALIZATIONS).sort();
  const expectedNpcIds = npcSpecKeys
    .flatMap((k) => NPC_PROMPT_BANDS.map((b) => `${k}_${b.id}`))
    .sort();
  const npcGenIds = npcRows.map((r) => r.id).sort();
  if (
    expectedNpcIds.length !== npcGenIds.length ||
    expectedNpcIds.some((id, i) => id !== npcGenIds[i])
  ) {
    throw new Error(
      "Iron Hills | generate-creature-prompts: состав npcRows не совпадает SPECIALIZATIONS×BANDS"
    );
  }

  console.log(
    `Written monsters (${beastKeys.length}) + NPC (${npcSpecKeys.length} specs × ${NPC_PROMPT_BANDS.length} bands = ${npcRows.length}); ключи монстров — бестиарий.`
  );
}

main();
