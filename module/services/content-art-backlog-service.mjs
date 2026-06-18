import {
  ARMORS,
  ATTACHMENTS,
  BACKPACKS,
  BELTS,
  CONSUMABLES,
  FOOD,
  MATERIALS,
  POTIONS,
  THROWABLES,
  TOOLS,
  WEAPONS,
} from "../constants/items-catalog.mjs";
import { SPELLS } from "../constants/spells-catalog.mjs";
import {
  armorToItemData,
  attachmentToItemData,
  backpackToItemData,
  beltToItemData,
  consumableToItemData,
  foodToItemData,
  materialToItemData,
  potionToItemData,
  spellToItemData,
  throwableToItemData,
  toolToItemData,
  weaponToItemData,
} from "../utils/catalog-item-data.mjs";

const SYSTEM_ID = "iron-hills-system";
const SYSTEM_ASSET_PREFIX = `systems/${SYSTEM_ID}/`;
const DEFAULT_NEGATIVE_PROMPT = [
  "text",
  "watermark",
  "logo",
  "signature",
  "blurry",
  "low quality",
  "cluttered background",
  "multiple unrelated objects",
  "human hands",
  "human face",
  "nsfw",
].join(", ");

const CATALOGS = Object.freeze([
  { id: "weapons", type: "weapon", rows: WEAPONS, converter: weaponToItemData, assetDir: "weapons", promptFile: "weapons-prompts.json" },
  { id: "armor", type: "armor", rows: ARMORS, converter: armorToItemData, assetDir: "armor", promptFile: "armor-prompts.json" },
  { id: "materials", type: "material", rows: MATERIALS, converter: materialToItemData, assetDir: "materials", promptFile: "monster-loot-prompts.json" },
  { id: "potions", type: "potion", rows: POTIONS, converter: potionToItemData, assetDir: "potions", promptFile: "potions-prompts.json" },
  { id: "food", type: "food", rows: FOOD, converter: foodToItemData, assetDir: "food", promptFile: "food-prompts.json" },
  { id: "tools", type: "tool", rows: TOOLS, converter: toolToItemData, assetDir: "tools", promptFile: "gear-prompts.json" },
  { id: "belts", type: "belt", rows: BELTS, converter: beltToItemData, assetDir: "belts", promptFile: "gear-prompts.json" },
  { id: "backpacks", type: "backpack", rows: BACKPACKS, converter: backpackToItemData, assetDir: "backpacks", promptFile: "gear-prompts.json" },
  { id: "attachments", type: "attachment", rows: ATTACHMENTS, converter: attachmentToItemData, assetDir: "attachments", promptFile: "gear-prompts.json" },
  { id: "consumables", type: "consumable", rows: CONSUMABLES, converter: consumableToItemData, assetDir: "consumables", promptFile: "consumables-prompts.json" },
  { id: "throwables", type: "throwable", rows: THROWABLES, converter: throwableToItemData, assetDir: "throwables", promptFile: "throwables-prompts.json" },
  { id: "spells", type: "spell", rows: SPELLS, converter: spellToItemData, assetDir: "spells", promptFile: "spells-prompts.json" },
]);

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePath(value) {
  return String(value ?? "").trim().replace(/\\/g, "/");
}

function classifyImagePath(img) {
  const path = normalizePath(img);
  if (!path) return "missing";
  if (path === "icons/svg/item-bag.svg") return "generic";
  if (path.startsWith(SYSTEM_ASSET_PREFIX)) return "system";
  if (path.startsWith("icons/")) return "core";
  if (path.startsWith("modules/")) return "module";
  if (/^https?:\/\//i.test(path)) return "remote";
  return "other";
}

function targetSystemPath(catalog, id) {
  return `${SYSTEM_ASSET_PREFIX}icons/items/${catalog.assetDir}/${id}.webp`;
}

function targetRelativePath(catalog, id) {
  return `icons/items/${catalog.assetDir}/${id}.webp`;
}

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function promptKey(catalogId, id) {
  return `${catalogId}:${id}`;
}

function promptOverrideFor(promptOverrides, catalogId, id) {
  if (!promptOverrides) return null;
  if (promptOverrides instanceof Map) {
    return promptOverrides.get(promptKey(catalogId, id)) ?? promptOverrides.get(id) ?? null;
  }
  return promptOverrides[promptKey(catalogId, id)] ?? promptOverrides[id] ?? null;
}

function aspectForGrid(gridW, gridH) {
  const w = Math.max(1, numberOr(gridW, 1));
  const h = Math.max(1, numberOr(gridH, 1));
  if (h / w >= 4) return { aspect: "1:4", resolution: "384x1536", orientation: "extreme vertical item orientation, full length visible" };
  if (h / w >= 3) return { aspect: "1:3", resolution: "512x1536", orientation: "vertical item orientation, full length visible" };
  if (h / w >= 2) return { aspect: "1:2", resolution: "768x1536", orientation: "vertical item orientation" };
  return { aspect: "1:1", resolution: "1024x1024", orientation: "centered square inventory composition" };
}

function tierMaterialWords(tier) {
  const t = Math.max(1, Math.min(10, Math.round(numberOr(tier, 1))));
  if (t <= 1) return "rough low-tier materials, worn edges, practical peasant craft";
  if (t <= 3) return "iron, bronze, seasoned leather and utilitarian workshop finish";
  if (t <= 5) return "tempered steel, polished fittings, subtle guild-quality decoration";
  if (t <= 7) return "mithril, dark iron, rare crystal accents and restrained magical glow";
  if (t <= 9) return "orichalcum, starmetal, ornate heroic craftsmanship and luminous accents";
  return "mythic godsteel, adamant core, reality-bending magical highlights";
}

function objectWords(type, row, itemData) {
  const system = itemData?.system ?? {};
  if (type === "weapon") {
    const skill = system.skill ?? row.skill ?? "weapon";
    const twoHanded = Boolean(system.twoHanded ?? row.twoHanded);
    const map = {
      knife: "a single fantasy dagger or combat knife",
      sword: twoHanded ? "a single fantasy two-handed greatsword" : "a single fantasy arming sword",
      axe: twoHanded ? "a single fantasy two-handed battle axe" : "a single fantasy hand axe",
      spear: "a single fantasy spear or polearm",
      mace: twoHanded ? "a single fantasy war hammer" : "a single fantasy mace",
      flail: "a single fantasy flail with chain and striking head",
      bow: "a single fantasy bow, no arrow nocked",
      crossbow: "a single fantasy crossbow, no bolt loaded",
      throwing: "a small set of matching fantasy throwing weapons",
      exotic: "a single fantasy staff or unusual arcane weapon",
    };
    return map[skill] ?? "a single fantasy weapon";
  }
  if (type === "potion") return "a single sealed fantasy potion bottle or alchemical flask";
  if (type === "food") return "a single fantasy food ration or drink vessel";
  if (type === "spell") return `a magic spell icon for ${system.school ?? row.school ?? "arcane"} magic`;
  if (type === "throwable") return "a single fantasy throwable consumable weapon";
  if (type === "consumable") return "a compact fantasy utility consumable or medical supply";
  if (type === "material") return "a single fantasy crafting material";
  if (type === "armor") return "a single fantasy armor piece";
  if (type === "belt") return "a single fantasy utility belt";
  if (type === "backpack") return "a single fantasy backpack or pouch";
  if (type === "attachment") return "a single fantasy modular equipment attachment";
  if (type === "tool") return "a single fantasy crafting or survival tool";
  return `a single fantasy ${type || "item"}`;
}

function buildFallbackPrompt(catalog, row, itemData) {
  const system = itemData?.system ?? {};
  const grid = aspectForGrid(system.gridW ?? row.gridW, system.gridH ?? row.gridH);
  const name = row.label ?? itemData?.name ?? row.id;
  const tier = system.tier ?? system.rank ?? row.tier ?? row.rank ?? 1;
  const details = [
    `Concept "${name}"`,
    objectWords(catalog.type, row, itemData),
    tierMaterialWords(tier),
    grid.orientation,
    "single isolated fantasy RPG inventory icon",
    "centered",
    "full object visible",
    "plain dark or transparent background",
    "sharp painterly detail",
    grid.resolution,
  ];
  return `${details.filter(Boolean).join(", ")} --ar ${grid.aspect}`;
}

function shouldInclude(classification, options) {
  if (options.includeAll) return true;
  if (classification === "system") return Boolean(options.includeSystem);
  if (classification === "missing") return options.includeMissing !== false;
  return options.includeNonSystem !== false;
}

function addToMapCount(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function mapToObject(map) {
  return Object.fromEntries([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function sortedItems(items) {
  return [...items].sort((a, b) =>
    a.catalog.localeCompare(b.catalog)
    || a.tier - b.tier
    || a.type.localeCompare(b.type)
    || a.id.localeCompare(b.id)
  );
}

export function buildContentArtBacklog(options = {}) {
  const typeFilter = Array.isArray(options.catalogs) && options.catalogs.length
    ? new Set(options.catalogs.map(value => String(value ?? "").trim()).filter(Boolean))
    : null;
  const targetExists = typeof options.targetExists === "function" ? options.targetExists : null;
  const promptOverrides = options.promptOverrides ?? null;
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const items = [];
  const byCatalog = new Map();
  const byClassification = new Map();
  const byTargetState = new Map();

  for (const catalog of CATALOGS) {
    if (typeFilter && !typeFilter.has(catalog.id) && !typeFilter.has(catalog.type)) continue;

    for (const [key, row] of Object.entries(catalog.rows ?? {})) {
      let itemData = null;
      try {
        itemData = catalog.converter(row);
      } catch {
        continue;
      }

      const id = String(row?.id ?? key);
      const currentImg = normalizePath(itemData?.img);
      const classification = classifyImagePath(currentImg);
      if (!shouldInclude(classification, options)) continue;

      const targetImg = targetSystemPath(catalog, id);
      const targetFile = targetRelativePath(catalog, id);
      const exists = targetExists ? Boolean(targetExists(targetFile)) : false;
      const override = promptOverrideFor(promptOverrides, catalog.id, id);
      const prompt = compactText(override?.prompt ?? buildFallbackPrompt(catalog, row, itemData));
      const negative = compactText(override?.negative ?? options.negativePrompt ?? DEFAULT_NEGATIVE_PROMPT);
      const system = itemData?.system ?? {};
      const tier = numberOr(system.tier ?? system.rank ?? row.tier ?? row.rank, 1);
      const gridW = numberOr(system.gridW ?? row.gridW, 1);
      const gridH = numberOr(system.gridH ?? row.gridH, 1);
      const aspect = aspectForGrid(gridW, gridH);

      addToMapCount(byCatalog, catalog.id);
      addToMapCount(byClassification, classification);
      addToMapCount(byTargetState, exists ? "targetExists" : "targetMissing");

      items.push({
        catalog: catalog.id,
        type: catalog.type,
        id,
        name: itemData?.name ?? row.label ?? id,
        tier,
        gridW,
        gridH,
        aspect: aspect.aspect,
        resolution: aspect.resolution,
        currentImg,
        currentImageClass: classification,
        targetImg,
        targetFile,
        targetExists: exists,
        promptSource: override?.source ?? "fallback",
        prompt,
        negative,
        rowHasExplicitImg: Boolean(row?.img),
      });
    }
  }

  const sorted = sortedItems(items);
  return {
    label: "Iron Hills item art backlog",
    generatedAt,
    ok: sorted.length === 0,
    summary: {
      total: sorted.length,
      byCatalog: mapToObject(byCatalog),
      byClassification: mapToObject(byClassification),
      byTargetState: mapToObject(byTargetState),
    },
    negative: options.negativePrompt ?? DEFAULT_NEGATIVE_PROMPT,
    items: sorted,
  };
}

export function formatContentArtBacklogReport(report, { maxItems = 24 } = {}) {
  const summary = report?.summary ?? {};
  const lines = [
    `Iron Hills item art backlog: ${Number(summary.total ?? 0)} items`,
    `By catalog: ${Object.entries(summary.byCatalog ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    `By current image: ${Object.entries(summary.byClassification ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    `Targets: ${Object.entries(summary.byTargetState ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
  ];

  const items = report?.items ?? [];
  if (items.length) {
    lines.push("Top backlog items:");
    for (const item of items.slice(0, maxItems)) {
      lines.push(`- ${item.catalog}/${item.id}: ${item.name} -> ${item.targetFile} (${item.currentImageClass})`);
    }
    if (items.length > maxItems) lines.push(`...and ${items.length - maxItems} more items.`);
  }

  return lines.join("\n");
}

export function contentArtBacklogToCsv(report) {
  const rows = report?.items ?? [];
  const header = [
    "catalog",
    "id",
    "name",
    "tier",
    "type",
    "gridW",
    "gridH",
    "aspect",
    "targetFile",
    "targetImg",
    "targetExists",
    "currentImg",
    "prompt",
    "negative",
  ];
  const escape = (value) => {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    header.join(","),
    ...rows.map(row => header.map(key => escape(row[key])).join(",")),
  ].join("\n") + "\n";
}

export function contentArtBacklogToMarkdown(report) {
  const summary = report?.summary ?? {};
  const lines = [
    "# Iron Hills Item Art Backlog",
    "",
    `Generated: ${report?.generatedAt ?? ""}`,
    "",
    "This file lists catalog items that still use non-system item images. Generate prompt-driven assets at `targetFile`, validate them, then apply them to the item/spell catalogs.",
    "",
    "## Summary",
    "",
    `- Total backlog items: ${Number(summary.total ?? 0)}`,
    `- By catalog: ${Object.entries(summary.byCatalog ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    `- By current image: ${Object.entries(summary.byClassification ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    `- Target files: ${Object.entries(summary.byTargetState ?? {}).map(([key, value]) => `${key}=${value}`).join(", ") || "-"}`,
    "",
    "## Generation Rules",
    "",
    "- Prefer `node tools/generate-art-batch.mjs` for the generation queue; it keeps batch ids, prompts, target paths, and Tarkov grid proportions together.",
    "- Generate one prompt-driven image per row and save it exactly at `targetFile`.",
    "- Prefer WebP output; keep the object isolated, readable in a 52px inventory cell, and fully visible.",
    "- Preserve the row's grid footprint: tall weapons must stay portrait/vertical, square consumables should stay close to square.",
    "- After images exist, run `node tools/audit-art-targets.mjs` before `node tools/apply-art-backlog.mjs --dry-run`.",
    "- Do not use deterministic placeholder/icon-symbol art for this backlog.",
    "",
  ];

  let lastCatalog = "";
  for (const item of report?.items ?? []) {
    if (item.catalog !== lastCatalog) {
      lines.push("", `## ${item.catalog}`, "");
      lastCatalog = item.catalog;
    }
    lines.push(`### ${item.name} (\`${item.id}\`)`);
    lines.push("");
    lines.push(`- Tier/type: ${item.tier}, ${item.type}`);
    lines.push(`- Current: \`${item.currentImg || "(missing)"}\``);
    lines.push(`- Target: \`${item.targetFile}\``);
    lines.push(`- Prompt source: ${item.promptSource || "fallback"}`);
    lines.push("");
    lines.push("```");
    lines.push(item.prompt);
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}
