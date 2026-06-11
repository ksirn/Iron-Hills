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
import { SPELLS, SPELLS_BY_SCHOOL, SPELL_SCHOOLS } from "../constants/spells-catalog.mjs";
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
import { validateItemData } from "./content-validation-service.mjs";

const FULL_TIER_SET = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const CATALOGS = Object.freeze([
  { id: "materials", label: "Materials", type: "material", rows: MATERIALS, converter: materialToItemData, expectedTiers: FULL_TIER_SET },
  { id: "weapons", label: "Weapons", type: "weapon", rows: WEAPONS, converter: weaponToItemData, expectedTiers: FULL_TIER_SET },
  { id: "armor", label: "Armor", type: "armor", rows: ARMORS, converter: armorToItemData, expectedTiers: FULL_TIER_SET },
  { id: "potions", label: "Potions", type: "potion", rows: POTIONS, converter: potionToItemData, expectedTiers: FULL_TIER_SET },
  { id: "food", label: "Food", type: "food", rows: FOOD, converter: foodToItemData, expectedTiers: FULL_TIER_SET },
  { id: "tools", label: "Tools", type: "tool", rows: TOOLS, converter: toolToItemData, expectedTiers: FULL_TIER_SET, tierSeverity: "info" },
  { id: "belts", label: "Belts", type: "belt", rows: BELTS, converter: beltToItemData, expectedTiers: FULL_TIER_SET, tierSeverity: "info" },
  { id: "backpacks", label: "Backpacks", type: "backpack", rows: BACKPACKS, converter: backpackToItemData, expectedTiers: FULL_TIER_SET, tierSeverity: "info" },
  { id: "attachments", label: "Attachments", type: "attachment", rows: ATTACHMENTS, converter: attachmentToItemData, tierSeverity: "info" },
  { id: "consumables", label: "Consumables", type: "consumable", rows: CONSUMABLES, converter: consumableToItemData, tierSeverity: "info" },
  { id: "throwables", label: "Throwables", type: "throwable", rows: THROWABLES, converter: throwableToItemData, tierSeverity: "info" },
  { id: "spells", label: "Spells", type: "spell", rows: SPELLS, converter: spellToItemData, expectedTiers: FULL_TIER_SET, tierField: "rank", tierSeverity: "info" },
]);

function finding(severity, code, message, context = {}, details = {}) {
  const path = [context.scope, context.catalog, context.key].filter(Boolean).join(" / ");
  return {
    severity,
    code,
    message,
    path,
    context: { ...context },
    details,
  };
}

function summarizeFindings(findings) {
  const out = { error: 0, warn: 0, info: 0 };
  for (const f of findings ?? []) out[f.severity] = (out[f.severity] ?? 0) + 1;
  return out;
}

function isPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function isNonNegativeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

function rowTier(row, tierField = "tier") {
  return Number(row?.[tierField] ?? row?.tier ?? row?.rank ?? 0);
}

function sortedUnique(values) {
  return [...new Set(values)].sort((a, b) => Number(a) - Number(b));
}

function validateRawRow(row, key, catalog) {
  const findings = [];
  const context = { scope: "catalog", catalog: catalog.id, key };

  if (!row || typeof row !== "object") {
    findings.push(finding("error", "bad-row", "Catalog row is not an object.", context));
    return findings;
  }

  if (row.id && row.id !== key) {
    findings.push(finding("error", "id-key-mismatch", "Catalog row id does not match its object key.", context, { id: row.id, key }));
  }
  if (!String(row.id ?? "").trim()) {
    findings.push(finding("error", "missing-id", "Catalog row is missing id.", context));
  }
  if (!String(row.label ?? "").trim()) {
    findings.push(finding("error", "missing-label", "Catalog row is missing label.", context));
  }

  const tier = rowTier(row, catalog.tierField);
  if (!Number.isFinite(tier) || tier < 1 || tier > 10) {
    findings.push(finding("warn", "tier-out-of-range", "Catalog row tier/rank should be in 1..10.", context, { tier }));
  }

  if (catalog.type !== "spell") {
    if (!isPositiveNumber(row.value)) findings.push(finding("error", "bad-row-value", "Catalog row should have positive value.", context, { value: row.value }));
    if (!isNonNegativeNumber(row.weight)) findings.push(finding("warn", "bad-row-weight", "Catalog row should have non-negative weight.", context, { weight: row.weight }));
  }

  if (catalog.type === "spell") {
    if (!String(row.school ?? "").trim()) findings.push(finding("warn", "missing-spell-school", "Spell row is missing school.", context));
    if (!isNonNegativeNumber(row.manaCost)) findings.push(finding("warn", "bad-spell-mana-cost", "Spell manaCost should be non-negative.", context));
    if (!isNonNegativeNumber(row.castTime)) findings.push(finding("warn", "bad-spell-cast-time", "Spell castTime should be non-negative.", context));
    if (row.aoe && typeof row.aoe === "object") {
      if (!String(row.aoe.friendlyFireMode ?? "").trim()) findings.push(finding("info", "missing-aoe-friendly-fire-mode", "AoE spell should declare friendlyFireMode.", context));
      if (!String(row.aoe.targetZoneMode ?? "").trim()) findings.push(finding("info", "missing-aoe-zone-mode", "AoE spell should declare targetZoneMode.", context));
    }
  }

  return findings;
}

function coverageFindings(rows, catalog) {
  const findings = [];
  if (!catalog.expectedTiers) return findings;
  const tiers = new Set(Object.values(rows ?? {}).map(row => rowTier(row, catalog.tierField)).filter(t => Number.isFinite(t) && t > 0));
  const missing = catalog.expectedTiers.filter(tier => !tiers.has(tier));
  if (missing.length) {
    findings.push(finding(
      catalog.tierSeverity ?? "warn",
      "tier-coverage-gap",
      "Catalog has missing tier/rank coverage.",
      { scope: "catalog", catalog: catalog.id },
      { missing }
    ));
  }
  return findings;
}

function spellSchoolFindings() {
  const findings = [];
  for (const schoolId of Object.keys(SPELL_SCHOOLS ?? {})) {
    const count = SPELLS_BY_SCHOOL[schoolId]?.length ?? 0;
    if (count < 3) {
      findings.push(finding(
        "info",
        "thin-spell-school",
        "Spell school has fewer than 3 spells; content patch may want more coverage.",
        { scope: "catalog", catalog: "spells", key: schoolId },
        { count }
      ));
    }
  }
  return findings;
}

function auditCatalog(catalog) {
  const findings = [];
  const convertedFindings = [];
  const rows = catalog.rows ?? {};
  const tiers = [];
  let missingImg = 0;
  let converted = 0;

  for (const [key, row] of Object.entries(rows)) {
    findings.push(...validateRawRow(row, key, catalog));
    if (!row?.img) missingImg += 1;
    const tier = rowTier(row, catalog.tierField);
    if (Number.isFinite(tier) && tier > 0) tiers.push(tier);

    try {
      const itemData = catalog.converter(row);
      converted += 1;
      convertedFindings.push(...validateItemData(itemData, {
        scope: "catalog-converted",
        pack: catalog.id,
        item: itemData?.name ?? key,
      }));
    } catch (err) {
      findings.push(finding(
        "error",
        "conversion-failed",
        "Catalog row could not be converted to item data.",
        { scope: "catalog", catalog: catalog.id, key },
        { error: String(err?.message ?? err) }
      ));
    }
  }

  findings.push(...coverageFindings(rows, catalog));
  findings.push(...convertedFindings);

  return {
    id: catalog.id,
    label: catalog.label,
    type: catalog.type,
    rowsChecked: Object.keys(rows).length,
    converted,
    missingImg,
    tiers: sortedUnique(tiers),
    counts: summarizeFindings(findings),
    findings,
  };
}

export function auditIronHillsCatalogs() {
  const sections = CATALOGS.map(auditCatalog);
  const extraFindings = spellSchoolFindings();
  const findings = [
    ...sections.flatMap(section => section.findings),
    ...extraFindings,
  ];

  return {
    ok: findings.every(f => f.severity !== "error"),
    rowsChecked: sections.reduce((sum, section) => sum + section.rowsChecked, 0),
    converted: sections.reduce((sum, section) => sum + section.converted, 0),
    missingImg: sections.reduce((sum, section) => sum + section.missingImg, 0),
    counts: summarizeFindings(findings),
    sections: sections.map(section => ({
      id: section.id,
      label: section.label,
      type: section.type,
      rowsChecked: section.rowsChecked,
      converted: section.converted,
      missingImg: section.missingImg,
      tiers: section.tiers,
      counts: section.counts,
    })),
    findings,
  };
}

export function formatCatalogReadinessReport(report, { maxFindings = 20 } = {}) {
  const counts = report?.counts ?? {};
  const lines = [
    `Iron Hills catalog readiness: ${report?.ok ? "OK" : "ISSUES"}`,
    `Rows checked: ${report?.rowsChecked ?? 0}, converted: ${report?.converted ?? 0}`,
    `Raw rows without explicit img: ${report?.missingImg ?? 0}`,
    `Findings: ${counts.error ?? 0} errors, ${counts.warn ?? 0} warnings, ${counts.info ?? 0} info`,
  ];

  for (const section of report?.sections ?? []) {
    lines.push(
      `- ${section.id}: ${section.rowsChecked} rows, ${section.converted} converted, ` +
      `${section.missingImg} convention images, tiers ${section.tiers.join(",") || "-"}, ` +
      `${section.counts.error ?? 0}/${section.counts.warn ?? 0}/${section.counts.info ?? 0}`
    );
  }

  const findings = report?.findings ?? [];
  if (findings.length) {
    lines.push("Top findings:");
    for (const f of findings.slice(0, maxFindings)) {
      lines.push(`- [${f.severity}] ${f.code}: ${f.path || "(unknown)"} - ${f.message}`);
    }
    if (findings.length > maxFindings) lines.push(`...and ${findings.length - maxFindings} more findings.`);
  }

  return lines.join("\n");
}
