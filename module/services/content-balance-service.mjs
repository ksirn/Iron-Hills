import { GENERATED_PACKS } from "../compendium-builder.mjs";
import { MONSTER_HARVEST_DROP_POOLS } from "../constants/monster-loot-pools.mjs";

const ITEM_METRICS = Object.freeze([
  "value",
  "weight",
  "gridCells",
  "damage",
  "power",
  "manaCost",
  "energyCost",
  "protection",
]);

function emptyCounts() {
  return { error: 0, warn: 0, info: 0 };
}

function summarizeFindings(findings = []) {
  const out = emptyCounts();
  for (const row of findings) out[row.severity] = (out[row.severity] ?? 0) + 1;
  return out;
}

function normalizePackId(value) {
  return String(value ?? "").trim().replace(/^iron-hills-system\./, "");
}

function packFilterSet(packIds = null) {
  if (!Array.isArray(packIds) || !packIds.length) return null;
  return new Set(packIds.map(normalizePackId).filter(Boolean));
}

function contextPath(context = {}) {
  return [
    context.scope,
    context.pack,
    context.actor,
    context.item,
    context.metric,
  ].filter(Boolean).join(" / ");
}

function finding(severity, code, message, context = {}, details = {}) {
  return {
    severity,
    code,
    message,
    path: contextPath(context),
    context: { ...context },
    details,
  };
}

function pushIf(findings, condition, severity, code, message, context, details = {}) {
  if (condition) findings.push(finding(severity, code, message, context, details));
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function cleanTier(value) {
  const n = Math.round(Number(value) || 0);
  return Math.max(1, Math.min(10, n || 1));
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function roundMetric(value) {
  return Math.round(Number(value) * 100) / 100;
}

function stats(values = []) {
  const nums = values.map(Number).filter(Number.isFinite);
  if (!nums.length) return null;
  const sum = nums.reduce((acc, value) => acc + value, 0);
  return {
    count: nums.length,
    min: roundMetric(Math.min(...nums)),
    max: roundMetric(Math.max(...nums)),
    avg: roundMetric(sum / nums.length),
    median: roundMetric(median(nums)),
  };
}

function ensureBucket(map, key, seed = {}) {
  if (!map.has(key)) map.set(key, { ...seed, count: 0, metrics: Object.fromEntries(ITEM_METRICS.map(metric => [metric, []])) });
  return map.get(key);
}

function addMetric(bucket, metric, value) {
  const n = numberOrNull(value);
  if (n === null) return;
  if ((metric === "damage" || metric === "power" || metric === "protection") && n <= 0) return;
  if (!bucket.metrics[metric]) bucket.metrics[metric] = [];
  bucket.metrics[metric].push(n);
}

function protectionScore(system = {}) {
  const protection = system.protection ?? {};
  const physical = numberOrNull(protection.physical) ?? 0;
  const magical = numberOrNull(protection.magical) ?? 0;
  return physical + magical;
}

function itemMetricValues(itemData = {}) {
  const system = itemData.system ?? {};
  const gridW = numberOrNull(system.gridW) ?? 1;
  const gridH = numberOrNull(system.gridH) ?? 1;
  return {
    value: system.value,
    weight: system.weight,
    gridCells: gridW * gridH,
    damage: system.damage,
    power: system.power,
    manaCost: system.manaCost,
    energyCost: system.energyCost,
    protection: itemData.type === "armor" ? protectionScore(system) : null,
  };
}

function validateItemBalance(itemData, context, findings) {
  const system = itemData.system ?? {};
  const type = String(itemData.type ?? "").trim();
  const tier = numberOrNull(system.tier ?? system.rank);
  const value = numberOrNull(system.value);
  const weight = numberOrNull(system.weight);
  const gridW = numberOrNull(system.gridW);
  const gridH = numberOrNull(system.gridH);
  const itemName = String(itemData.name ?? context.item ?? "").trim();
  const itemContext = { ...context, item: itemName || context.item || "" };

  pushIf(findings, !type, "error", "balance-missing-type", "Item has no type for balance profiling.", itemContext);
  pushIf(findings, tier === null || tier < 1 || tier > 10, "error", "balance-tier-out-of-range", "Item tier/rank should be in range 1..10.", itemContext, { tier });
  pushIf(findings, value === null || value <= 0, "error", "balance-bad-value", "Item value should be positive for economy profiling.", itemContext, { value });
  pushIf(findings, weight === null || weight < 0, "warn", "balance-bad-weight", "Item weight should be non-negative for inventory profiling.", itemContext, { weight });
  pushIf(findings, gridW === null || gridW < 1 || gridH === null || gridH < 1, "error", "balance-bad-grid", "Item grid size should be positive.", itemContext, { gridW, gridH });

  const clean = cleanTier(tier);
  if (type === "weapon") {
    const damage = numberOrNull(system.damage);
    const energy = numberOrNull(system.energyCost);
    pushIf(findings, damage === null || damage <= 0, "error", "balance-bad-weapon-damage", "Weapon damage should be positive.", itemContext, { damage });
    pushIf(findings, damage !== null && damage > clean * 55, "warn", "balance-weapon-damage-spike", "Weapon damage is far above the current tier profile.", itemContext, { tier: clean, damage });
    pushIf(findings, energy !== null && energy > 18, "info", "balance-high-weapon-energy", "Weapon energy cost is unusually high for a 6-second combat action.", itemContext, { energy });
  }

  if (type === "armor") {
    const protection = protectionScore(system);
    pushIf(findings, protection <= 0, "warn", "balance-zero-armor-protection", "Armor has no physical or magical protection.", itemContext, { protection });
    pushIf(findings, protection > clean * 35, "warn", "balance-armor-protection-spike", "Armor protection is far above the current tier profile.", itemContext, { tier: clean, protection });
  }

  if (type === "spell") {
    const damage = numberOrNull(system.damage) ?? 0;
    const mana = numberOrNull(system.manaCost);
    pushIf(findings, damage > 0 && damage > clean * 35, "warn", "balance-spell-damage-spike", "Spell damage is far above the current rank profile.", itemContext, { tier: clean, damage });
    pushIf(findings, mana !== null && mana > clean * 5, "info", "balance-high-spell-mana", "Spell mana cost is high for its rank.", itemContext, { tier: clean, mana });
  }

  if (gridW !== null && gridH !== null) {
    const gridCells = gridW * gridH;
    pushIf(findings, gridCells > 30, "info", "balance-large-grid-item", "Item occupies a very large inventory footprint.", itemContext, { gridW, gridH, gridCells });
  }
}

function summarizeTierMap(tierMap) {
  return [...tierMap.values()]
    .sort((a, b) => a.tier - b.tier)
    .map(bucket => ({
      tier: bucket.tier,
      count: bucket.count,
      metrics: Object.fromEntries(
        Object.entries(bucket.metrics)
          .map(([metric, values]) => [metric, stats(values)])
          .filter(([, value]) => value)
      ),
    }));
}

function summarizeTypeMap(typeMap) {
  return [...typeMap.values()]
    .sort((a, b) => a.type.localeCompare(b.type))
    .map(typeBucket => ({
      type: typeBucket.type,
      count: typeBucket.count,
      metrics: Object.fromEntries(
        Object.entries(typeBucket.metrics)
          .map(([metric, values]) => [metric, stats(values)])
          .filter(([, value]) => value)
      ),
      tiers: summarizeTierMap(typeBucket.tiers),
    }));
}

function addItemToBuckets(itemData, buckets) {
  const system = itemData.system ?? {};
  const type = String(itemData.type ?? "unknown");
  const tier = cleanTier(system.tier ?? system.rank);
  const typeBucket = ensureBucket(buckets.byType, type, {
    type,
    tiers: new Map(),
  });
  const tierBucket = ensureBucket(typeBucket.tiers, String(tier), { tier });
  const metrics = itemMetricValues(itemData);

  typeBucket.count += 1;
  tierBucket.count += 1;
  for (const metric of ITEM_METRICS) {
    addMetric(typeBucket, metric, metrics[metric]);
    addMetric(tierBucket, metric, metrics[metric]);
  }
}

function detectTierRegressions(typeSummaries, findings) {
  for (const typeSummary of typeSummaries) {
    let previousValue = null;
    let previousDamage = null;
    let previousDamageCount = 0;
    let previousProtection = null;
    let previousProtectionCount = 0;
    for (const tierRow of typeSummary.tiers) {
      const value = tierRow.metrics.value?.median ?? null;
      const damage = tierRow.metrics.damage?.median ?? null;
      const damageCount = Number(tierRow.metrics.damage?.count ?? 0);
      const protection = tierRow.metrics.protection?.median ?? null;
      const protectionCount = Number(tierRow.metrics.protection?.count ?? 0);
      const context = { scope: "balance", pack: typeSummary.type, metric: `tier-${tierRow.tier}` };

      pushIf(
        findings,
        previousValue !== null && value !== null && value < previousValue * 0.65,
        "warn",
        "balance-value-regression",
        "Median value drops sharply compared with the previous populated tier.",
        context,
        { previous: previousValue, current: value }
      );
      pushIf(
        findings,
        previousDamage !== null && damage !== null && previousDamageCount >= 2 && damageCount >= 2 && damage < previousDamage * 0.75,
        "warn",
        "balance-damage-regression",
        "Median damage drops sharply compared with the previous populated tier.",
        context,
        { previous: previousDamage, current: damage }
      );
      pushIf(
        findings,
        previousProtection !== null && protection !== null && previousProtectionCount >= 2 && protectionCount >= 2 && protection < previousProtection * 0.75,
        "warn",
        "balance-protection-regression",
        "Median armor protection drops sharply compared with the previous populated tier.",
        context,
        { previous: previousProtection, current: protection }
      );

      if (value !== null) previousValue = value;
      if (damage !== null) {
        previousDamage = damage;
        previousDamageCount = damageCount;
      }
      if (protection !== null) {
        previousProtection = protection;
        previousProtectionCount = protectionCount;
      }
    }
  }
}

function hpTotal(resources = {}) {
  return Object.values(resources.hp ?? {}).reduce((sum, part) => sum + Number(part?.max ?? part?.value ?? 0), 0);
}

function monsterMetricValues(actorData = {}) {
  const system = actorData.system ?? {};
  const armor = system.resources?.armor ?? {};
  return {
    hp: hpTotal(system.resources ?? {}),
    energy: system.resources?.energy?.max ?? system.resources?.energy?.value,
    mana: system.resources?.mana?.max ?? system.resources?.mana?.value,
    armor: Number(armor.physical ?? 0) + Number(armor.magical ?? 0),
    unarmedDamage: system.combat?.unarmedDamage,
    attackSkill: system.combat?.attackSkill,
    baseThreshold: system.combat?.baseThreshold,
    harvestItems: Array.isArray(actorData.items) ? actorData.items.length : 0,
  };
}

function analyzeGeneratedItems(filter) {
  const findings = [];
  const buckets = { byType: new Map() };
  let itemsChecked = 0;

  for (const spec of GENERATED_PACKS ?? []) {
    if (filter && !filter.has(spec.packName)) continue;
    if (spec.documentType !== "Item") continue;

    for (const [key, row] of Object.entries(spec.rows ?? {})) {
      const context = { scope: "balance", pack: spec.packName, item: key };
      let itemData = null;
      try {
        itemData = spec.converter(row, key);
      } catch (err) {
        findings.push(finding("error", "balance-conversion-failed", "Generated item row could not be converted for balance profiling.", context, {
          error: String(err?.message ?? err),
        }));
        continue;
      }

      itemsChecked += 1;
      validateItemBalance(itemData, context, findings);
      addItemToBuckets(itemData, buckets);
    }
  }

  const byType = summarizeTypeMap(buckets.byType);
  detectTierRegressions(byType, findings);

  return {
    scope: "balance-items",
    itemsChecked,
    counts: summarizeFindings(findings),
    findings,
    byType,
  };
}

function analyzeGeneratedMonsters(filter) {
  const findings = [];
  const byTier = new Map();
  let actorsChecked = 0;
  const monsterSpec = (GENERATED_PACKS ?? []).find(spec => spec.documentType === "Actor" && spec.packName === "ih-monsters");
  if (!monsterSpec || (filter && !filter.has(monsterSpec.packName))) {
    return {
      scope: "balance-monsters",
      actorsChecked,
      counts: emptyCounts(),
      findings,
      tiers: [],
      lootPoolsReferenced: 0,
    };
  }

  const lootPoolKeys = new Set(Object.keys(MONSTER_HARVEST_DROP_POOLS ?? {}));
  for (const [key, row] of Object.entries(monsterSpec.rows ?? {})) {
    const context = { scope: "balance", pack: monsterSpec.packName, actor: key };
    let actorData = null;
    try {
      actorData = monsterSpec.converter(row, key);
    } catch (err) {
      findings.push(finding("error", "balance-monster-conversion-failed", "Generated monster row could not be converted for balance profiling.", context, {
        error: String(err?.message ?? err),
      }));
      continue;
    }

    actorsChecked += 1;
    const system = actorData.system ?? {};
    const tier = cleanTier(system.info?.tier ?? row.tier);
    const lootPool = String(system.info?.lootPool ?? row.lootPool ?? "").trim();
    const tierBucket = ensureBucket(byTier, String(tier), {
      tier,
      metrics: {
        hp: [],
        energy: [],
        mana: [],
        armor: [],
        unarmedDamage: [],
        attackSkill: [],
        baseThreshold: [],
        harvestItems: [],
      },
    });
    const metrics = monsterMetricValues(actorData);

    tierBucket.count += 1;
    for (const [metric, value] of Object.entries(metrics)) addMetric(tierBucket, metric, value);

    pushIf(findings, !lootPool, "error", "balance-monster-missing-loot-pool", "Monster is missing a loot pool.", context);
    pushIf(findings, lootPool && !lootPoolKeys.has(lootPool), "error", "balance-monster-unknown-loot-pool", "Monster references an unknown harvest loot pool.", context, { lootPool });
    pushIf(findings, metrics.hp <= 0, "error", "balance-monster-bad-hp", "Monster HP pool should be positive.", context, { hp: metrics.hp });
    pushIf(findings, metrics.unarmedDamage > tier * 60, "warn", "balance-monster-damage-spike", "Monster unarmed damage is far above the current tier profile.", context, { tier, unarmedDamage: metrics.unarmedDamage });
  }

  const tiers = [...byTier.values()]
    .sort((a, b) => a.tier - b.tier)
    .map(bucket => ({
      tier: bucket.tier,
      count: bucket.count,
      metrics: Object.fromEntries(
        Object.entries(bucket.metrics)
          .map(([metric, values]) => [metric, stats(values)])
          .filter(([, value]) => value)
      ),
    }));

  for (const tierRow of tiers) {
    pushIf(
      findings,
      tierRow.count !== 3,
      "info",
      "balance-monster-tier-count",
      "Monster tier does not have exactly three generated actors.",
      { scope: "balance", pack: "ih-monsters", metric: `tier-${tierRow.tier}` },
      { count: tierRow.count }
    );
  }

  return {
    scope: "balance-monsters",
    actorsChecked,
    counts: summarizeFindings(findings),
    findings,
    tiers,
    lootPoolsReferenced: new Set(Object.values(monsterSpec.rows ?? {}).map(row => row.lootPool).filter(Boolean)).size,
  };
}

function topMetric(typeRows, metric) {
  let max = 0;
  for (const typeRow of typeRows) {
    const value = Number(typeRow.metrics?.[metric]?.max ?? 0);
    if (value > max) max = value;
  }
  return roundMetric(max);
}

export function buildIronHillsContentBalanceReport(options = {}) {
  const filter = packFilterSet(options.packIds ?? options.packs ?? null);
  const items = analyzeGeneratedItems(filter);
  const monsters = analyzeGeneratedMonsters(filter);
  const findings = [
    ...(items.findings ?? []),
    ...(monsters.findings ?? []),
  ];
  const counts = summarizeFindings(findings);
  const itemTypes = items.byType.length;
  const itemTierRows = items.byType.reduce((sum, row) => sum + row.tiers.length, 0);

  return {
    label: "Iron Hills content balance profile",
    scope: "balance",
    ok: counts.error === 0,
    counts,
    itemsChecked: items.itemsChecked,
    actorsChecked: monsters.actorsChecked,
    summary: {
      itemTypes,
      itemTierRows,
      monsterTierRows: monsters.tiers.length,
      lootPoolsReferenced: monsters.lootPoolsReferenced,
      maxItemValue: topMetric(items.byType, "value"),
      maxWeaponDamage: topMetric(items.byType.filter(row => row.type === "weapon"), "damage"),
      maxArmorProtection: topMetric(items.byType.filter(row => row.type === "armor"), "protection"),
      maxSpellDamage: topMetric(items.byType.filter(row => row.type === "spell"), "damage"),
      maxMonsterHp: topMetric([{ metrics: { hp: stats(monsters.tiers.flatMap(row => row.metrics.hp ? [row.metrics.hp.max] : [])) } }], "hp"),
    },
    sections: [
      {
        scope: items.scope,
        itemsChecked: items.itemsChecked,
        counts: items.counts,
      },
      {
        scope: monsters.scope,
        actorsChecked: monsters.actorsChecked,
        counts: monsters.counts,
      },
    ],
    items,
    monsters,
    findings,
  };
}

function formatMetric(metric = null) {
  if (!metric) return "-";
  return `${metric.min}..${metric.max} (med ${metric.median})`;
}

export function formatContentBalanceReport(report, { maxFindings = 20, maxTypes = 16 } = {}) {
  if (!report || report.skipped) {
    const reason = report?.reason ? `: ${report.reason}` : "";
    return `Iron Hills content balance profile: SKIPPED${reason}`;
  }

  const counts = report.counts ?? {};
  const summary = report.summary ?? {};
  const lines = [
    `Iron Hills content balance profile: ${report.ok ? "OK" : "ISSUES"}`,
    `Items=${Number(report.itemsChecked ?? 0)}, actors=${Number(report.actorsChecked ?? 0)}, errors=${Number(counts.error ?? 0)}, warnings=${Number(counts.warn ?? 0)}, info=${Number(counts.info ?? 0)}`,
    `Coverage: itemTypes=${Number(summary.itemTypes ?? 0)}, itemTierRows=${Number(summary.itemTierRows ?? 0)}, monsterTierRows=${Number(summary.monsterTierRows ?? 0)}, lootPools=${Number(summary.lootPoolsReferenced ?? 0)}`,
    `Peaks: value=${Number(summary.maxItemValue ?? 0)}, weaponDamage=${Number(summary.maxWeaponDamage ?? 0)}, armorProtection=${Number(summary.maxArmorProtection ?? 0)}, spellDamage=${Number(summary.maxSpellDamage ?? 0)}, monsterHp=${Number(summary.maxMonsterHp ?? 0)}`,
  ];

  const typeRows = report.items?.byType ?? [];
  if (typeRows.length) {
    lines.push("Item type medians:");
    for (const row of typeRows.slice(0, maxTypes)) {
      lines.push(`- ${row.type}: n=${row.count}, value=${formatMetric(row.metrics?.value)}, weight=${formatMetric(row.metrics?.weight)}`);
    }
    if (typeRows.length > maxTypes) lines.push(`...and ${typeRows.length - maxTypes} more item types.`);
  }

  const monsterRows = report.monsters?.tiers ?? [];
  if (monsterRows.length) {
    lines.push("Monster tiers:");
    for (const row of monsterRows) {
      lines.push(`- tier ${row.tier}: n=${row.count}, hp=${formatMetric(row.metrics?.hp)}, damage=${formatMetric(row.metrics?.unarmedDamage)}, armor=${formatMetric(row.metrics?.armor)}`);
    }
  }

  const findings = report.findings ?? [];
  if (findings.length) {
    lines.push("Top balance findings:");
    for (const row of findings.slice(0, maxFindings)) {
      lines.push(`- [${row.severity}] ${row.code}: ${row.path || "(unknown)"} - ${row.message}`);
    }
    if (findings.length > maxFindings) lines.push(`...and ${findings.length - maxFindings} more findings.`);
  }

  return lines.join("\n");
}

export function getContentBalanceSummary(options = {}) {
  const report = buildIronHillsContentBalanceReport(options);
  return report.summary;
}
