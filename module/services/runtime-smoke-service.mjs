import { getCompendiumBuildPlan } from "../compendium-builder.mjs";
import {
  validateGeneratedPackSources,
  validateIronHillsContent,
} from "./content-validation-service.mjs";
import { auditIronHillsAssets } from "./content-asset-audit-service.mjs";

const SYSTEM_ID = "iron-hills-system";

const REQUIRED_API = Object.freeze([
  "validateContent",
  "validateGeneratedContent",
  "repairContent",
  "prepareContentPatch",
  "checkContentReadiness",
  "auditContentBalance",
  "auditCatalogs",
  "auditAssets",
  "buildCompendiums",
  "syncAllCatalogItemPacks",
  "syncNpcPackLootFromProfiles",
  "syncMonsterPackToBestiary",
  "openCompendiumBrowser",
  "openGridInventory",
  "openTrade",
  "openCombatDirector",
  "openCombatManager",
  "gmControl",
  "runGmControlAction",
]);

function nowMs() {
  return typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();
}

function elapsedSince(start) {
  return Math.max(0, Math.round(nowMs() - start));
}

function finding(severity, code, message, context = {}, details = {}) {
  const path = [context.scope, context.pack, context.actor, context.item].filter(Boolean).join(" / ");
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

async function runSection(id, label, fn) {
  const start = nowMs();
  try {
    const result = await fn();
    const findings = result?.findings ?? [];
    const counts = summarizeFindings(findings);
    return {
      id,
      label,
      status: counts.error > 0 ? "issues" : "ok",
      ms: elapsedSince(start),
      counts,
      summary: result?.summary ?? {},
      findings,
      result,
    };
  } catch (err) {
    return {
      id,
      label,
      status: "failed",
      ms: elapsedSince(start),
      counts: { error: 1, warn: 0, info: 0 },
      summary: {},
      findings: [finding("error", "section-failed", "Runtime smoke section failed.", { scope: id }, {
        error: String(err?.message ?? err),
      })],
      error: String(err?.message ?? err),
    };
  }
}

function normalizePackId(value) {
  return String(value ?? "").trim().replace(/^iron-hills-system\./, "");
}

function normalizeOptions(options = {}) {
  return {
    includeAssets: options.includeAssets !== false,
    includeGeneratedSources: options.includeGeneratedSources !== false,
    includePacks: options.includePacks !== false,
    includeWorld: Boolean(options.includeWorld),
    includeInventory: options.includeInventory !== false,
    includeTrade: options.includeTrade !== false,
    includeCombat: options.includeCombat !== false,
    includePrepared: options.includePrepared !== false,
    includeMedicine: options.includeMedicine !== false,
    includeLifecycle: options.includeLifecycle !== false,
    includeWorldSituations: options.includeWorldSituations !== false,
    sampleDocsPerPack: Math.max(1, Math.min(10, Number(options.sampleDocsPerPack ?? 2))),
    checkAssetFiles: Boolean(options.checkAssetFiles ?? options.checkFilesystem ?? false),
    actor: options.actor ?? null,
    merchant: options.merchant ?? null,
    buyer: options.buyer ?? null,
    packIds: Array.isArray(options.packIds) && options.packIds.length
      ? options.packIds.map(normalizePackId).filter(Boolean)
      : null,
  };
}

function gamePacksArray() {
  const packs = globalThis.game?.packs;
  if (!packs) return [];
  if (typeof packs.values === "function") return Array.from(packs.values());
  return Array.from(packs).map(entry => Array.isArray(entry) ? entry[1] : entry).filter(Boolean);
}

function getPack(collection) {
  return globalThis.game?.packs?.get?.(collection) ?? null;
}

function documentTypeOfPack(pack) {
  return pack?.documentName ?? pack?.metadata?.type ?? pack?.metadata?.documentName ?? "";
}

function packageNameOfPack(pack) {
  return pack?.metadata?.packageName ?? pack?.metadata?.package ?? pack?.metadata?.system ?? "";
}

function systemVersion() {
  return globalThis.game?.system?.version
    ?? globalThis.game?.system?.data?.version
    ?? globalThis.game?.system?._source?.version
    ?? "";
}

async function environmentSmoke() {
  const findings = [];
  const foundryVersion = globalThis.game?.version ?? globalThis.game?.release?.version ?? "";
  const generation = Number(globalThis.game?.release?.generation ?? 0);
  const build = Number(globalThis.game?.release?.build ?? 0);
  const systemId = globalThis.game?.system?.id ?? "";

  if (!globalThis.game) {
    findings.push(finding("error", "game-unavailable", "Foundry game object is not available.", { scope: "environment" }));
  }
  if (systemId && systemId !== SYSTEM_ID) {
    findings.push(finding("error", "wrong-system", "Loaded system id does not match Iron Hills.", { scope: "environment" }, { systemId }));
  }
  if (generation && generation !== 12) {
    findings.push(finding("warn", "unexpected-foundry-generation", "Runtime is not Foundry VTT v12.", { scope: "environment" }, { generation, build, foundryVersion }));
  }
  if (generation === 12 && build && build !== 343) {
    findings.push(finding("info", "foundry-build-differs", "Runtime Foundry v12 build differs from the current target build 343.", { scope: "environment" }, { generation, build, foundryVersion }));
  }

  const api = globalThis.game?.ironHills ?? {};
  const missingApi = REQUIRED_API.filter(key => typeof api[key] !== "function");
  for (const key of missingApi) {
    findings.push(finding("error", "missing-game-api", "Required game.ironHills API is missing.", { scope: "environment" }, { key }));
  }

  return {
    summary: {
      foundryVersion,
      generation,
      build,
      systemId,
      systemVersion: systemVersion(),
      isGM: Boolean(globalThis.game?.user?.isGM),
      requiredApi: REQUIRED_API.length,
      missingApi: missingApi.length,
    },
    findings,
  };
}

async function packSmoke(options) {
  const findings = [];
  const plan = getCompendiumBuildPlan({ packIds: options.packIds });
  const packRows = [];
  let docsChecked = 0;
  let embeddedChecked = 0;
  let uuidResolved = 0;
  let sheetAvailable = 0;

  for (const expected of plan.packs ?? []) {
    const collection = expected.collection ?? `${SYSTEM_ID}.${expected.packName}`;
    const pack = getPack(collection);
    const context = { scope: "packs", pack: expected.packName };

    if (!pack) {
      findings.push(finding("error", "pack-missing", "Generated pack is not registered in game.packs.", context, { collection }));
      packRows.push({ ...expected, collection, found: false, docs: 0, index: 0 });
      continue;
    }

    const packageName = packageNameOfPack(pack);
    const documentType = documentTypeOfPack(pack);
    if (packageName && packageName !== SYSTEM_ID) {
      findings.push(finding("error", "pack-package-mismatch", "Pack belongs to a different package.", context, { packageName }));
    }
    if (documentType && documentType !== expected.documentType) {
      findings.push(finding("error", "pack-document-type-mismatch", "Pack document type differs from generated plan.", context, {
        expected: expected.documentType,
        actual: documentType,
      }));
    }

    let index = null;
    try {
      index = await pack.getIndex();
    } catch (err) {
      findings.push(finding("error", "pack-index-failed", "Pack index could not be read.", context, {
        error: String(err?.message ?? err),
      }));
      packRows.push({ ...expected, collection, found: true, docs: 0, index: 0 });
      continue;
    }

    const indexSize = Number(index?.size ?? index?.length ?? 0);
    if (indexSize !== Number(expected.expected ?? 0)) {
      findings.push(finding("error", "pack-count-mismatch", "Pack index size does not match generated plan.", context, {
        expected: expected.expected,
        actual: indexSize,
      }));
    }

    let docs = [];
    try {
      docs = await pack.getDocuments();
    } catch (err) {
      findings.push(finding("error", "pack-documents-failed", "Pack documents could not be read.", context, {
        error: String(err?.message ?? err),
      }));
      packRows.push({ ...expected, collection, found: true, docs: 0, index: indexSize });
      continue;
    }

    if (docs.length !== Number(expected.expected ?? 0)) {
      findings.push(finding("error", "pack-document-count-mismatch", "Loaded pack document count does not match generated plan.", context, {
        expected: expected.expected,
        actual: docs.length,
      }));
    }

    for (const doc of docs.slice(0, options.sampleDocsPerPack)) {
      docsChecked += 1;
      if (!doc?.id || !doc?.name || !doc?.type) {
        findings.push(finding("error", "bad-pack-doc", "Sample pack document is missing id/name/type.", context, {
          id: doc?.id,
          name: doc?.name,
          type: doc?.type,
        }));
      }
      if (doc?.uuid && typeof globalThis.fromUuid === "function") {
        const resolved = await globalThis.fromUuid(doc.uuid).catch(() => null);
        if (resolved?.id === doc.id) uuidResolved += 1;
        else findings.push(finding("warn", "uuid-resolution-failed", "Sample pack document UUID did not resolve back to the document.", context, { uuid: doc.uuid }));
      }
      try {
        if (doc?.sheet) sheetAvailable += 1;
      } catch (err) {
        findings.push(finding("warn", "sheet-instantiation-failed", "Sample pack document sheet could not be instantiated.", context, {
          uuid: doc?.uuid,
          error: String(err?.message ?? err),
        }));
      }

      const embeddedItems = Array.from(doc?.items ?? []);
      embeddedChecked += embeddedItems.length;
      if (expected.documentType === "Actor" && doc.type === "monster" && !embeddedItems.length) {
        findings.push(finding("warn", "monster-without-embedded-loot", "Monster sample has no embedded items.", context, {
          actor: doc.name,
        }));
      }
    }

    packRows.push({
      packName: expected.packName,
      collection,
      documentType,
      found: true,
      expected: expected.expected,
      index: indexSize,
      docs: docs.length,
      samples: Math.min(docs.length, options.sampleDocsPerPack),
    });
  }

  return {
    summary: {
      packsExpected: plan.packs?.length ?? 0,
      totalExpected: plan.totalExpected ?? 0,
      packsFound: packRows.filter(row => row.found).length,
      docsChecked,
      embeddedChecked,
      uuidResolved,
      sheetAvailable,
    },
    packs: packRows,
    findings,
  };
}

function findActorCandidate(input, predicate = () => true) {
  if (!globalThis.game?.actors) return null;
  if (input?.items || input?.type) return input;
  if (typeof input === "string") {
    const byId = game.actors.get(input);
    if (byId) return byId;
    return game.actors.find(actor => actor.name === input) ?? null;
  }
  return game.actors.find(predicate) ?? null;
}

async function inventorySmoke(options) {
  const findings = [];
  const actor = findActorCandidate(options.actor, candidate => candidate.type === "character")
    ?? findActorCandidate(null, candidate => ["character", "npc", "merchant"].includes(candidate.type));

  if (!actor) {
    findings.push(finding("info", "inventory-actor-unavailable", "No world actor is available for inventory smoke.", { scope: "inventory" }));
    return { summary: { skipped: true }, findings };
  }

  const appGlobalAvailable = typeof globalThis.Application !== "undefined";
  if (!appGlobalAvailable) {
    findings.push(finding("warn", "application-global-missing", "Foundry Application class is unavailable; inventory app module was not loaded.", { scope: "inventory", actor: actor.name }));
    return { summary: { skipped: true, actor: actor.name }, findings };
  }

  const { buildContainers, getPendingItemsForActor } = await import("../apps/grid-inventory-app.mjs");
  const containers = buildContainers(actor);
  const sections = containers.flatMap(container => container.sections ?? []);
  const pending = getPendingItemsForActor(actor, containers);
  const cellCount = sections.reduce((sum, section) => sum + Number(section.cols ?? 0) * Number(section.rows ?? 0), 0);

  if (!containers.length) {
    findings.push(finding("warn", "inventory-no-containers", "Inventory smoke actor has no inventory containers.", { scope: "inventory", actor: actor.name }));
  }
  for (const section of sections) {
    if (!section.key || !Number(section.cols) || !Number(section.rows)) {
      findings.push(finding("error", "bad-inventory-section", "Inventory section has invalid grid dimensions.", { scope: "inventory", actor: actor.name }, {
        section: section.key,
        cols: section.cols,
        rows: section.rows,
      }));
    }
  }

  return {
    summary: {
      actor: actor.name,
      actorType: actor.type,
      items: actor.items?.size ?? Array.from(actor.items ?? []).length,
      containers: containers.length,
      sections: sections.length,
      cells: cellCount,
      pendingItems: pending.length,
    },
    findings,
  };
}

async function tradeSmoke(options) {
  const findings = [];
  const buyer = findActorCandidate(options.buyer, candidate => candidate.type === "character");
  const merchant = findActorCandidate(options.merchant, candidate => candidate.type === "merchant");

  if (!buyer || !merchant) {
    findings.push(finding("info", "trade-actors-unavailable", "Buyer and merchant world actors are not both available for trade smoke.", { scope: "trade" }, {
      hasBuyer: Boolean(buyer),
      hasMerchant: Boolean(merchant),
    }));
    return { summary: { skipped: true, hasBuyer: Boolean(buyer), hasMerchant: Boolean(merchant) }, findings };
  }

  const { buildTarkovTradeQuote } = await import("./trade-service.mjs");
  const merchantItem = Array.from(merchant.items ?? []).find(item => item.type !== "spell") ?? null;
  const quote = buildTarkovTradeQuote({
    buyer,
    merchant,
    merchantOffers: merchantItem ? [{ item: merchantItem, qty: 1 }] : [],
    playerOffers: [],
    merchantCoins: 0,
    playerCoins: 0,
  });

  if (!quote.ok || !quote.canTrade) {
    findings.push(finding("warn", "trade-quote-blocked", "Tarkov trade quote could not be built for available buyer/merchant.", { scope: "trade" }, {
      reason: quote.reason,
    }));
  }
  if (!merchantItem) {
    findings.push(finding("info", "merchant-empty", "Merchant has no non-spell item to price in trade smoke.", { scope: "trade", actor: merchant.name }));
  }

  return {
    summary: {
      buyer: buyer.name,
      merchant: merchant.name,
      merchantItems: merchant.items?.size ?? Array.from(merchant.items ?? []).length,
      quotedItem: merchantItem?.name ?? "",
      quoteOk: Boolean(quote.ok),
      canTrade: Boolean(quote.canTrade),
      buyerCanPay: Boolean(quote.buyerCanPay),
      merchantCanPay: Boolean(quote.merchantCanPay),
      buyerPays: Number(quote.buyerPays ?? 0),
      merchantPays: Number(quote.merchantPays ?? 0),
    },
    findings,
  };
}

const SMOKE_ENCUMBRANCE = Object.freeze({
  label: "Smoke",
  ratio: 0,
  attackPenalty: 0,
  energyMultiplier: 1,
});

const SMOKE_INJURIES = Object.freeze({
  meleePenalty: 0,
  throwPenalty: 0,
  attackPenalty: 0,
  castPenalty: 0,
});

function smokeHpPart(value = 12) {
  return {
    value,
    max: value,
    status: {
      minorBleeding: 0,
      majorBleeding: 0,
      fracture: false,
      destroyed: false,
      splinted: false,
      tourniquet: false,
    },
  };
}

function applySmokePatch(root, patch = {}) {
  for (const [path, value] of Object.entries(patch)) {
    const parts = String(path).split(".").filter(Boolean);
    let cursor = root;
    for (const part of parts.slice(0, -1)) {
      if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
      cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;
  }
}

function makeSmokeActor({
  id,
  name,
  type = "character",
  disposition = 0,
  skills = {},
  combat = {},
} = {}) {
  const updates = [];
  const actor = {
    id,
    name,
    type,
    uuid: `Actor.${id}`,
    documentName: "Actor",
    hasPlayerOwner: disposition > 0,
    prototypeToken: { disposition },
    flags: {},
    items: new Map(),
    system: {
      skills: {
        unarmed: { value: 5 },
        sword: { value: 8 },
        shield: { value: 3 },
        fire: { value: 6 },
        ...skills,
      },
      resources: {
        energy: { value: 30, max: 30 },
        mana: { value: 20, max: 20 },
        weight: { value: 0, max: 100 },
        hp: {
          head: smokeHpPart(10),
          torso: smokeHpPart(18),
          abdomen: smokeHpPart(14),
          leftArm: smokeHpPart(10),
          rightArm: smokeHpPart(10),
          leftLeg: smokeHpPart(12),
          rightLeg: smokeHpPart(12),
        },
      },
      equipment: {},
      conditions: {},
      info: { armorTier: 0 },
      combat: {
        attackSkill: 8,
        damage: 2,
        attacks: [
          {
            label: "Smoke strike",
            skillKey: "sword",
            damage: 2,
            damageType: "physical",
            energyCost: 2,
          },
        ],
        ...combat,
      },
    },
    async update(patch) {
      updates.push({ ...patch });
      applySmokePatch(actor, patch);
      return actor;
    },
    getFlag: (namespace, key) => actor.flags?.[namespace]?.[key] ?? null,
    async setFlag(namespace, key, value) {
      await actor.update({ [`flags.${namespace}.${key}`]: value });
      return value;
    },
    testUserPermission: () => true,
  };
  actor._ihSmokeUpdates = updates;
  return actor;
}

function addSmokeItem(actor, item, slot = "") {
  if (!actor || !item?.id) return item;
  actor.items?.set?.(item.id, item);
  if (slot) actor.system.equipment[slot] = item.id;
  return item;
}

function withSmokeItemUpdate(item) {
  const updates = [];
  item._ihSmokeUpdates = updates;
  item.update = async patch => {
    updates.push({ ...patch });
    applySmokePatch(item, patch);
    return item;
  };
  return item;
}

function makeSmokeWeapon({
  id = "ih-smoke-weapon",
  name = "Smoke Weapon",
  skill = "sword",
  damage = 4,
  damageType = "physical",
  range = 1,
  tier = 3,
} = {}) {
  return withSmokeItemUpdate({
    id,
    name,
    type: "weapon",
    img: "",
    system: {
      skill,
      damage,
      damageType,
      range,
      tier,
      energyCost: 2,
      durability: { value: 20, max: 20 },
      affixes: {},
    },
  });
}

function makeSmokeShield({
  id = "ih-smoke-shield",
  name = "Smoke Shield",
} = {}) {
  return withSmokeItemUpdate({
    id,
    name,
    type: "armor",
    img: "",
    system: {
      isShield: true,
      slot: "shield",
      durability: { value: 20, max: 20 },
      resist: { physical: 2, magical: 0 },
    },
  });
}

function makeSmokeTargetRef(actor, metrics = {}) {
  return {
    actor,
    _ihAoe: {
      projectionFromOrigin: Number(metrics.projectionFromOrigin ?? 0),
      distanceFromOrigin: Number(metrics.distanceFromOrigin ?? 0),
      sideFromOrigin: Number(metrics.sideFromOrigin ?? 0),
    },
  };
}

function pushCombatFinding(findings, ok, code, message, details = {}, severity = "error") {
  if (ok) return;
  findings.push(finding(severity, code, message, { scope: "combat" }, details));
}

function pushPreparedFinding(findings, ok, code, message, details = {}, severity = "error") {
  if (ok) return;
  findings.push(finding(severity, code, message, { scope: "prepared" }, details));
}

function isFinitePercent(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100;
}

async function combatSmoke() {
  ensureFoundryUtilsForSmoke();
  const findings = [];
  const [
    attackService,
    hitContextService,
    attackProfileService,
    actorStateService,
    damageTypeService,
    targetService,
    aoePolicyService,
    aoeService,
    combatPresentationService,
    combatChatService,
    skillRollService,
    spellsCatalog,
    spellRuntimeService,
    spellEffectService,
    actionDispatchService,
    actorItemUseService,
    attackFlowService,
    armorBurdenService,
    itemsCatalog,
    catalogItemData,
    combatEventService,
  ] = await Promise.all([
    import("./combat-attack-service.mjs"),
    import("./combat-hit-context-service.mjs"),
    import("./combat-attack-profile-service.mjs"),
    import("./actor-state-service.mjs"),
    import("./damage-type-service.mjs"),
    import("./combat-action-target-service.mjs"),
    import("./aoe-policy-service.mjs"),
    import("./aoe-service.mjs"),
    import("./combat-presentation-service.mjs"),
    import("./combat-chat-service.mjs"),
    import("./skill-roll-service.mjs"),
    import("../constants/spells-catalog.mjs"),
    import("./spell-runtime-service.mjs"),
    import("./spell-effect-service.mjs"),
    import("./actor-action-dispatch-service.mjs"),
    import("./actor-item-use-service.mjs"),
    import("./attack-flow-service.mjs"),
    import("./armor-burden-service.mjs"),
    import("../constants/items-catalog.mjs"),
    import("../utils/catalog-item-data.mjs"),
    import("./combat-event-service.mjs"),
  ]);
  const combatEventStartCount = combatEventService.getCombatEventLog().length;

  const attacker = makeSmokeActor({
    id: "ih-smoke-attacker",
    name: "Smoke Attacker",
    disposition: 1,
  });
  const target = makeSmokeActor({
    id: "ih-smoke-target",
    name: "Smoke Target",
    disposition: -1,
  });
  const ally = makeSmokeActor({
    id: "ih-smoke-ally",
    name: "Smoke Ally",
    disposition: 1,
  });
  const farTarget = makeSmokeActor({
    id: "ih-smoke-far-target",
    name: "Smoke Far Target",
    disposition: -1,
  });

  const systemChatHtml = combatChatService.buildCombatChatCard({
    title: "<System>",
    subtitle: "Smoke",
    icon: "+",
    status: "OK",
    rows: [
      ["Unsafe", "<b>escaped</b>"],
    ],
    bodyHtml: combatChatService.buildCombatParagraphs(["<script>safe</script>"]),
    className: "ih-system-chat-card",
  });
  pushCombatFinding(
    findings,
    systemChatHtml.includes("ih-system-chat-card")
      && systemChatHtml.includes("&lt;System&gt;")
      && systemChatHtml.includes("&lt;b&gt;escaped&lt;/b&gt;")
      && systemChatHtml.includes("&lt;script&gt;safe&lt;/script&gt;")
      && !systemChatHtml.includes("<script>safe</script>"),
    "bad-system-chat-card-renderer",
    "System chat card renderer should preserve classes while escaping row and paragraph text.",
    { systemChatHtml },
  );

  const systemDialogHtml = combatChatService.buildSystemDialogContent({
    className: "ih-smoke-system-dialog",
    headline: "<Dialog>",
    headlineMeta: "target",
    status: "<Ready>",
    rows: [
      ["Unsafe", "<b>row</b>"],
    ],
    formHtml: combatChatService.buildSystemDialogForm([
      combatChatService.buildSystemDialogInput({
        id: "unsafe-input",
        label: "Input <x>",
        value: "<typed>",
      }),
      combatChatService.buildSystemDialogSelectField({
        name: "target",
        label: "Target <x>",
        options: [
          { value: "<bad>", label: "<label>" },
        ],
        selectedValue: "<bad>",
      }),
    ]),
  });
  pushCombatFinding(
    findings,
    systemDialogHtml.includes("ih-system-dialog")
      && systemDialogHtml.includes("ih-smoke-system-dialog")
      && systemDialogHtml.includes("&lt;Dialog&gt;")
      && systemDialogHtml.includes("&lt;Ready&gt;")
      && systemDialogHtml.includes("&lt;b&gt;row&lt;/b&gt;")
      && systemDialogHtml.includes('id="unsafe-input"')
      && systemDialogHtml.includes('value="&lt;typed&gt;"')
      && systemDialogHtml.includes('select name="target"')
      && systemDialogHtml.includes('value="&lt;bad&gt;" selected')
      && systemDialogHtml.includes("&lt;label&gt;")
      && !systemDialogHtml.includes("<bad>")
      && !systemDialogHtml.includes("style="),
    "bad-system-dialog-renderer",
    "System dialog renderer should preserve classes, escape text and select values, and avoid inline styles.",
    { systemDialogHtml },
  );

  const skillDialogHtml = skillRollService.buildSkillRollDialogContent({
    className: "ih-smoke-dialog",
    headline: "<Roll>",
    headlineMeta: "d20",
    status: "<Ready>",
    rows: [
      ["Unsafe", "<b>value</b>"],
    ],
    notes: [
      ["Note", "<script>safe</script>"],
    ],
  });
  pushCombatFinding(
    findings,
    skillDialogHtml.includes("ih-skill-dialog")
      && skillDialogHtml.includes("ih-smoke-dialog")
      && skillDialogHtml.includes("&lt;Roll&gt;")
      && skillDialogHtml.includes("&lt;Ready&gt;")
      && skillDialogHtml.includes("&lt;b&gt;value&lt;/b&gt;")
      && skillDialogHtml.includes("&lt;script&gt;safe&lt;/script&gt;")
      && !skillDialogHtml.includes("<script>safe</script>")
      && !skillDialogHtml.includes("style="),
    "bad-skill-roll-dialog-renderer",
    "Skill roll dialog renderer should preserve classes, escape text, and avoid inline styles.",
    { skillDialogHtml },
  );

  const baseParams = attackProfileService.buildActorBaseAttackParams(attacker);
  pushCombatFinding(
    findings,
    baseParams?.skillKey === "sword" && baseParams?.baseDamage > 0,
    "bad-base-attack-profile",
    "Synthetic actor base attack profile did not resolve expected natural attack params.",
    { baseParams },
  );

  const chance = hitContextService.calculateHitChance(attacker, target, {
    skillKey: "sword",
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: SMOKE_INJURIES,
  });
  pushCombatFinding(
    findings,
    isFinitePercent(chance?.pct) && chance?.dieSize === 16 && chance?.threshold >= 1,
    "bad-hit-chance",
    "Combat hit chance calculation returned an invalid result.",
    { chance },
  );

  const modePenaltyInjuries = Object.freeze({
    meleePenalty: 4,
    throwPenalty: 1,
    castPenalty: 2,
    attackPenalty: 9,
  });
  const meleePenaltyChance = hitContextService.calculateHitChance(attacker, target, {
    skillKey: "sword",
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: modePenaltyInjuries,
  });
  const rangedPenaltyChance = hitContextService.calculateHitChance(attacker, target, {
    skillKey: "bow",
    skillValueFallback: 8,
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: modePenaltyInjuries,
  });
  const castPenaltyChance = hitContextService.calculateHitChance(attacker, target, {
    skillKey: "magic",
    skillValueFallback: 6,
    attackMode: "cast",
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: modePenaltyInjuries,
  });
  pushCombatFinding(
    findings,
    meleePenaltyChance?.context?.attackMode === "melee"
      && meleePenaltyChance?.attackPenalty === 4
      && rangedPenaltyChance?.context?.attackMode === "ranged"
      && rangedPenaltyChance?.attackPenalty === 1
      && castPenaltyChance?.context?.attackMode === "cast"
      && castPenaltyChance?.attackPenalty === 2,
    "bad-attack-mode-penalty-routing",
    "Attack-mode penalty routing should use melee, ranged/throwing, and cast injury penalties independently.",
    { meleePenaltyChance, rangedPenaltyChance, castPenaltyChance },
  );

  const typedArmor = withSmokeItemUpdate({
    id: "ih-smoke-typed-armor",
    name: "Smoke Typed Armor",
    type: "armor",
    system: {
      protection: { physical: 10, magical: 3, fire: 7 },
      durability: { value: 20, max: 20 },
    },
  });
  const fireReduction = actorStateService.getDamageReduction(typedArmor, "fire");
  const iceReduction = actorStateService.getDamageReduction(typedArmor, "ice");
  const physicalReduction = actorStateService.getDamageReduction(typedArmor, "physical");
  const healingReduction = actorStateService.getDamageReduction(typedArmor, "healing");
  const resistanceOptions = damageTypeService.getDamageResistanceOptions({
    physical: 10,
    magical: 3,
    fire: 7,
  });
  const fireResistanceOption = resistanceOptions.find(option => option.key === "fire");
  pushCombatFinding(
    findings,
    damageTypeService.normalizeDamageType("flame") === "fire"
      && damageTypeService.getDamageArmorChannel("fire") === "magical"
      && damageTypeService.getDamageArmorChannelLabel("fire") === damageTypeService.getDamageArmorChannelLabel("magical")
      && damageTypeService.isShieldBlockableDamageType("fire") === false
      && damageTypeService.isShieldBlockableDamageType("physical") === true
      && resistanceOptions.length >= 8
      && fireResistanceOption?.value === 7
      && fireResistanceOption?.armorChannel === "magical"
      && fireReduction === 7
      && iceReduction === 3
      && physicalReduction === 10
      && healingReduction === 0,
    "bad-damage-type-policy",
    "Damage type policy should preserve elemental damage while routing armor and shields through stable channels.",
    { fireReduction, iceReduction, physicalReduction, healingReduction, fireResistanceOption },
  );

  const armorRuleTarget = makeSmokeActor({
    id: "ih-smoke-armor-rule-target",
    name: "Smoke Armor Rule Target",
    disposition: -1,
  });
  armorRuleTarget.system.resources.hp.torso = smokeHpPart(100);
  const armorRuleItem = addSmokeItem(armorRuleTarget, withSmokeItemUpdate({
    id: "ih-smoke-armor-rule",
    name: "Smoke Armor Rule",
    type: "armor",
    system: {
      slot: "torso",
      covers: ["torso", "abdomen"],
      protection: { physical: 25 },
      durability: { value: 100, max: 100 },
    },
  }), "torso");
  const armorRuleResult = await attackService.resolveSingleAttack({
    attacker,
    target: armorRuleTarget,
    skillKey: "sword",
    baseDamage: 50,
    damageType: "physical",
    energyCost: 0,
    targetZone: "torso",
    spendEnergy: false,
    wearWeapon: false,
    wearArmor: true,
    applyInjuries: false,
    shieldIntercept: false,
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => ({
      total: 4,
      rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: 4 }],
      exploded: false,
    }),
  });
  pushCombatFinding(
    findings,
    armorRuleResult?.rawDamage === 50
      && armorRuleResult?.reduction === 25
      && armorRuleResult?.finalDamage === 25
      && Number(armorRuleItem.system.durability.value ?? 0) === 50
      && Number(armorRuleTarget.system.resources.hp.torso.value ?? 0) === 75,
    "bad-armor-durability-damage-gate",
    "Armor should lose incoming damage as durability, absorb up to protection/current durability, and pass the remainder to body HP.",
    { armorRuleResult, armorDurability: armorRuleItem.system.durability, torso: armorRuleTarget.system.resources.hp.torso },
  );

  const lowDurabilityArmorLayer = await attackService.resolveDurableDefenseLayer({
    item: withSmokeItemUpdate({
      id: "ih-smoke-low-durability-armor",
      name: "Smoke Low Durability Armor",
      type: "armor",
      system: {
        protection: { physical: 25 },
        durability: { value: 10, max: 100 },
      },
    }),
    incomingDamage: 50,
    damageType: "physical",
    wear: false,
  });
  const shieldThenArmorShieldLayer = await attackService.resolveDurableDefenseLayer({
    item: withSmokeItemUpdate({
      id: "ih-smoke-layer-shield",
      name: "Smoke Layer Shield",
      type: "armor",
      system: {
        isShield: true,
        protection: { physical: 15 },
        durability: { value: 50, max: 50 },
      },
    }),
    incomingDamage: 50,
    damageType: "physical",
    wear: false,
    kind: "shield",
  });
  const shieldThenArmorBodyLayer = await attackService.resolveDurableDefenseLayer({
    item: withSmokeItemUpdate({
      id: "ih-smoke-layer-armor",
      name: "Smoke Layer Armor",
      type: "armor",
      system: {
        protection: { physical: 25 },
        durability: { value: 100, max: 100 },
      },
    }),
    incomingDamage: shieldThenArmorShieldLayer.remainingDamage,
    damageType: "physical",
    wear: false,
    kind: "armor",
  });
  pushCombatFinding(
    findings,
    lowDurabilityArmorLayer.absorbed === 10
      && lowDurabilityArmorLayer.remainingDamage === 40
      && lowDurabilityArmorLayer.durabilityAfter === 0
      && shieldThenArmorShieldLayer.absorbed === 15
      && shieldThenArmorShieldLayer.remainingDamage === 35
      && shieldThenArmorBodyLayer.absorbed === 25
      && shieldThenArmorBodyLayer.remainingDamage === 10,
    "bad-shield-armor-layering",
    "Shield and armor layers should resolve sequentially using protection capped by current durability.",
    { lowDurabilityArmorLayer, shieldThenArmorShieldLayer, shieldThenArmorBodyLayer },
  );

  const armorRows = Object.values(itemsCatalog.ARMORS ?? {});
  const armorClasses = ["light", "medium", "heavy"];
  const armorSlots = ["head", "neck", "torso", "leftArm", "rightArm", "legs"];
  const shieldSlots = new Set(["leftHand", "rightHand", "shield"]);
  const armorCoverage = new Set();
  const shieldCoverage = new Set();
  for (const row of armorRows) {
    const tier = Number(row?.tier ?? 0);
    const cls = String(row?.armorClass ?? "");
    const slot = String(row?.slot ?? "");
    if (!tier || !armorClasses.includes(cls)) continue;
    if (shieldSlots.has(slot)) shieldCoverage.add(`${tier}:${cls}`);
    else if (armorSlots.includes(slot)) armorCoverage.add(`${tier}:${cls}:${slot}`);
  }
  const missingArmorCoverage = [];
  const missingShieldCoverage = [];
  for (let tier = 1; tier <= 10; tier += 1) {
    for (const cls of armorClasses) {
      for (const slot of armorSlots) {
        const key = `${tier}:${cls}:${slot}`;
        if (!armorCoverage.has(key)) missingArmorCoverage.push(key);
      }
      const shieldKey = `${tier}:${cls}`;
      if (!shieldCoverage.has(shieldKey)) missingShieldCoverage.push(shieldKey);
    }
  }
  pushCombatFinding(
    findings,
    missingArmorCoverage.length === 0 && missingShieldCoverage.length === 0,
    "bad-armor-class-catalog-coverage",
    "Armor catalog should provide light, medium, and heavy body armor plus shield options for every tier.",
    {
      missingArmorCoverage: missingArmorCoverage.slice(0, 20),
      missingShieldCoverage: missingShieldCoverage.slice(0, 20),
      armorRows: armorRows.length,
    },
  );

  function smokeCatalogArmor(id) {
    const row = itemsCatalog.ARMORS?.[id];
    if (!row) return null;
    const itemData = catalogItemData.armorToItemData(row);
    return withSmokeItemUpdate({
      id,
      name: itemData.name,
      type: itemData.type,
      img: itemData.img,
      flags: itemData.flags,
      system: itemData.system,
    });
  }

  const lightPlate = smokeCatalogArmor("light_plate_chest");
  const mediumPlate = smokeCatalogArmor("medium_plate_chest");
  const heavyPlate = smokeCatalogArmor("plate_chest");
  const lightShield = smokeCatalogArmor("light_tower_shield");
  const mediumShield = smokeCatalogArmor("medium_tower_shield");
  const heavyShield = smokeCatalogArmor("tower_shield");
  const lightArmorActor = makeSmokeActor({
    id: "ih-smoke-light-armor-actor",
    name: "Smoke Light Armor Actor",
    skills: { endurance: { value: 0 }, athletics: { value: 0 } },
  });
  const mediumArmorActor = makeSmokeActor({
    id: "ih-smoke-medium-armor-actor",
    name: "Smoke Medium Armor Actor",
    skills: { endurance: { value: 0 }, athletics: { value: 0 } },
  });
  const heavyArmorActor = makeSmokeActor({
    id: "ih-smoke-heavy-armor-actor",
    name: "Smoke Heavy Armor Actor",
    skills: { endurance: { value: 0 }, athletics: { value: 0 } },
  });
  if (lightPlate) addSmokeItem(lightArmorActor, lightPlate, "torso");
  if (mediumPlate) addSmokeItem(mediumArmorActor, mediumPlate, "torso");
  if (heavyPlate) addSmokeItem(heavyArmorActor, heavyPlate, "torso");
  const lightBurden = armorBurdenService.getArmorBurdenInfo(lightArmorActor);
  const mediumBurden = armorBurdenService.getArmorBurdenInfo(mediumArmorActor);
  const heavyBurden = armorBurdenService.getArmorBurdenInfo(heavyArmorActor);
  pushCombatFinding(
    findings,
    lightPlate?.system?.requirements?.athletics === 0
      && lightPlate?.system?.requirements?.endurance === 0
      && lightBurden.hasPenalty === false
      && mediumBurden.hasPenalty === true
      && heavyBurden.hasPenalty === true
      && Number(heavyBurden.actionSecondsFlat ?? 0) > Number(mediumBurden.actionSecondsFlat ?? 0)
      && Number(heavyBurden.movementPenalty ?? 0) > Number(mediumBurden.movementPenalty ?? 0)
      && Number(heavyBurden.energyMultiplier ?? 1) > Number(mediumBurden.energyMultiplier ?? 1)
      && lightShield?.system?.armorClass === "light"
      && mediumShield?.system?.armorClass === "medium"
      && heavyShield?.system?.armorClass === "heavy",
    "bad-armor-class-burden-profile",
    "Light armor should stay penalty-free, while medium/heavy armor and shields should expose escalating requirements and penalties.",
    { lightPlate, mediumPlate, heavyPlate, lightShield, mediumShield, heavyShield, lightBurden, mediumBurden, heavyBurden },
  );

  const aoeChance = aoeService.calcHitChance(attacker, target, "sword", 0, null, {
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: SMOKE_INJURIES,
  });
  pushCombatFinding(
    findings,
    aoeChance?.pct === chance?.pct && aoeChance?.dieSize === chance?.dieSize,
    "aoe-hit-chance-drift",
    "AoE hit chance wrapper differs from the shared hit-context service.",
    { chance, aoeChance },
  );

  const attackResult = await attackService.resolveSingleAttack({
    attacker,
    target,
    skillKey: "sword",
    baseDamage: 0,
    damageType: "physical",
    energyCost: 2,
    targetZone: "torso",
    spendEnergy: false,
    wearWeapon: false,
    wearArmor: false,
    applyInjuries: false,
    shieldIntercept: false,
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => ({
      total: 4,
      rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: 4 }],
      exploded: false,
    }),
  });
  pushCombatFinding(
    findings,
    attackResult?.hit === true
      && attackResult?.finalDamage === 0
      && attackResult?.targetKilled === false
      && attackResult?.remainingHP === 18
      && target._ihSmokeUpdates.length === 0,
    "zero-damage-attack-mutated-target",
    "Zero-damage hit should not damage, kill, or mutate the target.",
    { attackResult, updates: target._ihSmokeUpdates },
  );
  const attackChatData = attackService.buildAttackChatData({
    label: "Smoke Attack",
    skillKey: "sword",
    attacker,
    target,
    result: attackResult,
  });
  pushCombatFinding(
    findings,
    attackChatData?.statusClass === "is-hit"
      && attackChatData?.statPills?.some(pill => pill.label === "Результат" && pill.value === "Попадание")
      && attackChatData?.metaRows?.some(row => row.label === "Цель" && row.value === target.name)
      && attackChatData?.rollRows?.some(row => row.label === "Эффективно" && row.value === attackResult.effectiveRoll)
      && attackChatData?.damageRows?.some(row => row.label === "Зона" && String(row.value).includes("Торс"))
      && attackChatData?.damageRows?.some(row => row.label === "Итоговый урон" && row.value === 0),
    "bad-single-attack-chat-view-model",
    "Single-target attack chat view model should expose status, target, roll, hit zone, and final damage.",
    { attackChatData, attackResult },
  );

  const missResult = await attackService.resolveSingleAttack({
    attacker,
    target,
    skillKey: "sword",
    baseDamage: 5,
    damageType: "physical",
    energyCost: 2,
    targetZone: "torso",
    spendEnergy: false,
    wearWeapon: false,
    wearArmor: false,
    applyInjuries: false,
    shieldIntercept: false,
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => ({
      total: 1,
      rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: 1 }],
      exploded: false,
    }),
  });
  pushCombatFinding(
    findings,
    missResult?.hit === false && target._ihSmokeUpdates.length === 0,
    "miss-attack-mutated-target",
    "Missed attack should not mutate the target.",
    { missResult, updates: target._ihSmokeUpdates },
  );

  const missAliasResult = await attackService.resolveSingleAttack({
    attacker,
    target,
    skillKey: "sword",
    baseDamage: 5,
    damageType: "physical",
    energyCost: 2,
    targetZone: "legs",
    spendEnergy: false,
    wearWeapon: false,
    wearArmor: false,
    applyInjuries: false,
    shieldIntercept: false,
    encumbrance: SMOKE_ENCUMBRANCE,
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => ({
      total: 1,
      rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: 1 }],
      exploded: false,
    }),
  });
  pushCombatFinding(
    findings,
    missAliasResult?.hit === false
      && missAliasResult?.locationKey === "leftLeg"
      && target._ihSmokeUpdates.length === 0,
    "bad-single-target-zone-normalization",
    "Single-target attack zones should normalize aliases like legs before hit/miss result rendering.",
    { missAliasResult, updates: target._ihSmokeUpdates },
  );

  const token = {
    id: "ih-smoke-token",
    documentName: "Token",
    actor: target,
    document: {
      id: "ih-smoke-token-doc",
      uuid: "Scene.ih-smoke.Token.ih-smoke-token",
      parent: { id: "ih-smoke-scene" },
      actor: target,
    },
    scene: { id: "ih-smoke-scene" },
  };
  const normalizedTargets = targetService.normalizeCombatTargets(new Set([token]));
  const targetRefs = targetService.buildCombatTargetRefs(normalizedTargets);
  const targetPayload = targetService.buildCombatTargetPayload(normalizedTargets);
  const actionTargetContext = targetService.buildCombatActionTargetContext({
    targets: normalizedTargets,
    targetZone: "belly",
    targetZoneMode: "aimed",
    friendlyFireMode: "auto",
    spellOverrides: {
      targetZone: "legs",
      targetZoneMode: "fixed",
      friendlyFire: true,
    },
  });
  const actionTargetPayload = targetService.buildCombatActionTargetPayload({
    targets: normalizedTargets,
    targetZone: "belly",
    targetZoneMode: "aimed",
    friendlyFireMode: "auto",
  });
  pushCombatFinding(
    findings,
    normalizedTargets.length === 1
      && targetRefs.length === 1
      && targetRefs[0].actorUuid === target.uuid
      && Array.isArray(targetPayload.targetRefs),
    "bad-combat-target-refs",
    "Combat target refs did not preserve actor/token identity.",
    { targetRefs, targetPayload },
  );
  pushCombatFinding(
    findings,
    actionTargetContext.targets.length === 1
      && actionTargetContext.targetRefs.length === 1
      && actionTargetContext.targetZone === "abdomen"
      && actionTargetContext.targetPart === "abdomen"
      && actionTargetContext.targetZoneMode === "aimed"
      && actionTargetContext.friendlyFire === true
      && actionTargetContext.friendlyFireMode === "auto"
      && actionTargetContext.spellOverrides?.targetZone === "leftLeg"
      && actionTargetPayload.targetZone === "abdomen"
      && actionTargetPayload.targetZoneMode === "aimed"
      && actionTargetPayload.friendlyFireMode === "auto"
      && actionTargetPayload.targetRefs?.length === 1,
    "bad-combat-action-target-context",
    "Combat action target context should normalize target refs, zones, friendly-fire mode, and spell overrides consistently.",
    { actionTargetContext, actionTargetPayload },
  );

  const queuedAttackTarget = makeSmokeActor({
    id: "ih-smoke-queued-attack-target",
    name: "Smoke Queued Attack Target",
    disposition: -1,
  });
  let queuedAttackTimeArgs = null;
  let queuedAttackAppliedImmediately = false;
  const queuedAttack = await attackFlowService.performActorAttack({
    actor: attacker,
    skillKey: "sword",
    label: "Smoke queued attack",
    baseDamage: 2,
    energyCost: 2,
    targetZone: "torso",
    targetZoneMode: "fixed",
    targets: [makeSmokeTargetRef(queuedAttackTarget)],
    resolveCombatTimeCost: async args => {
      queuedAttackTimeArgs = args;
      return {
        ok: true,
        queued: true,
        actionType: args.actionType,
        data: args.payload,
      };
    },
    requestHostileAction: async () => true,
    afterAttack: async () => {
      queuedAttackAppliedImmediately = true;
    },
  });
  const queuedAttackRefs = queuedAttackTimeArgs?.payload?.targetRefs ?? [];
  let resumedAttack = null;
  let resumedAttackSkillExp = 0;
  let resumedAttackSummary = null;
  const previousAttackFromUuidSync = globalThis.fromUuidSync;
  globalThis.fromUuidSync = uuid => {
    if (uuid === queuedAttackTarget.uuid) return queuedAttackTarget;
    if (typeof previousAttackFromUuidSync !== "function") return null;
    try {
      return previousAttackFromUuidSync(uuid);
    } catch (_err) {
      return null;
    }
  };
  try {
    resumedAttack = await actionDispatchService.executeActorPendingCombatAction(
      attacker,
      {
        actionType: "attack",
        label: "Smoke queued attack",
        data: queuedAttackTimeArgs?.payload ?? {},
      },
      {
        performAttack: args => attackFlowService.performActorAttack({
          ...args,
          actor: attacker,
          requestHostileAction: async () => true,
          dieRoller: async skillValue => ({
            total: Math.max(12, Number(skillValue) * 2),
            rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: Math.max(12, Number(skillValue) * 2) }],
            exploded: false,
          }),
          applySkillExp: async () => {
            resumedAttackSkillExp += 1;
          },
          afterAttack: async ({ summary }) => {
            resumedAttackSummary = summary;
          },
        }),
      },
    );
  } finally {
    if (previousAttackFromUuidSync) globalThis.fromUuidSync = previousAttackFromUuidSync;
    else delete globalThis.fromUuidSync;
  }
  const resumedAttackResult = resumedAttack?.result?.result ?? null;
  const resumedAttackResultSummary = resumedAttack?.result?.summary ?? resumedAttackSummary;
  pushCombatFinding(
    findings,
    queuedAttack?.queued === true
      && queuedAttack?.reason === "queued"
      && queuedAttackAppliedImmediately === false
      && queuedAttackTimeArgs?.actionType === "attack"
      && queuedAttackRefs.length === 1
      && queuedAttackRefs[0]?.actorUuid === queuedAttackTarget.uuid
      && queuedAttackTimeArgs?.payload?.targetZone === "torso"
      && queuedAttackTimeArgs?.payload?.targetZoneMode === "fixed"
      && resumedAttack?.ok === true
      && resumedAttackResult?.hit === true
      && resumedAttackResult?.locationKey === "torso"
      && Number(resumedAttackResult?.finalDamage ?? 0) > 0
      && Number(queuedAttackTarget.system.resources.hp.torso.value ?? 18) < 18
      && resumedAttackResultSummary?.targetId === queuedAttackTarget.id
      && resumedAttackResultSummary?.selectedTargetCount === 1
      && resumedAttackResultSummary?.surroundCount === 0
      && resumedAttackSkillExp === 1,
    "bad-single-attack-pending-flow",
    "Single-target attacks should queue with target refs and resume through the combat action dispatcher without losing target zone or result summary.",
    {
      queuedAttack,
      queuedPayload: queuedAttackTimeArgs?.payload,
      resumedAttack,
      resumedAttackSummary: resumedAttackResultSummary,
      targetUpdates: queuedAttackTarget._ihSmokeUpdates,
    },
  );

  const consumableActor = makeSmokeActor({
    id: "ih-smoke-consumable-user",
    name: "Smoke Consumable User",
    disposition: 1,
  });
  const consumableTarget = makeSmokeActor({
    id: "ih-smoke-consumable-target",
    name: "Smoke Consumable Target",
    disposition: -1,
  });
  const smokeConsumable = addSmokeItem(consumableActor, withSmokeItemUpdate({
    id: "ih-smoke-combat-consumable",
    name: "Smoke Combat Consumable",
    type: "consumable",
    system: { actionType: "apply-condition", power: 1 },
  }));
  let consumableAppliedDuringQueue = false;
  let queuedConsumableTimeArgs = null;
  const queuedConsumable = await actorItemUseService.useConsumableItemFromSheet(
    consumableActor,
    smokeConsumable.id,
    {
      targets: [makeSmokeTargetRef(consumableTarget)],
      resolveCombatTimeCost: async args => {
        queuedConsumableTimeArgs = args;
        return {
          ok: true,
          queued: true,
          actionType: args.actionType,
          data: args.payload,
        };
      },
      applyActionTypeItem: async () => {
        consumableAppliedDuringQueue = true;
        return { ok: true, handled: true, changed: true };
      },
    },
  );
  let immediateConsumableAppliedTargets = 0;
  let immediateConsumableRefreshes = 0;
  const immediateConsumable = await actorItemUseService.useConsumableItemFromSheet(
    consumableActor,
    smokeConsumable.id,
    {
      targets: [makeSmokeTargetRef(consumableTarget)],
      resolveCombatTimeCost: async () => ({ ok: true, queued: false }),
      applyActionTypeItem: async (_actor, _item, options = {}) => {
        immediateConsumableAppliedTargets = targetService.normalizeCombatTargets(options.targets).length;
        return { ok: true, handled: true, changed: true };
      },
      afterRefresh: async () => {
        immediateConsumableRefreshes += 1;
      },
    },
  );
  const queuedConsumableRefs = queuedConsumableTimeArgs?.payload?.targetRefs ?? [];
  let resumedConsumable = null;
  let resumedConsumableTargets = 0;
  const previousFromUuidSync = globalThis.fromUuidSync;
  globalThis.fromUuidSync = uuid => {
    if (uuid === consumableTarget.uuid) return consumableTarget;
    if (typeof previousFromUuidSync !== "function") return null;
    try {
      return previousFromUuidSync(uuid);
    } catch (_err) {
      return null;
    }
  };
  try {
    resumedConsumable = await actorItemUseService.resumePendingItemAction(
      consumableActor,
      { itemId: smokeConsumable.id, targetRefs: queuedConsumableRefs },
      { allowedTypes: ["consumable"], missingMessage: "Smoke consumable missing." },
      {
        useConsumable: async (_itemId, options = {}) => {
          resumedConsumableTargets = targetService.normalizeCombatTargets(options.targets).length;
          return { ok: true, handled: true };
        },
      },
    );
  } finally {
    if (previousFromUuidSync) globalThis.fromUuidSync = previousFromUuidSync;
    else delete globalThis.fromUuidSync;
  }
  pushCombatFinding(
    findings,
    queuedConsumable?.ok === true
      && queuedConsumable?.queued === true
      && consumableAppliedDuringQueue === false
      && queuedConsumableTimeArgs?.actionType === "use-consumable"
      && queuedConsumableTimeArgs?.payload?.itemId === smokeConsumable.id
      && queuedConsumableRefs.length === 1
      && queuedConsumableRefs[0]?.actorUuid === consumableTarget.uuid
      && immediateConsumable?.ok === true
      && immediateConsumable?.handled === true
      && immediateConsumableAppliedTargets === 1
      && immediateConsumableRefreshes === 1
      && resumedConsumable?.ok === true
      && resumedConsumableTargets === 1,
    "bad-combat-consumable-pending",
    "Combat consumable use should queue without applying immediately and preserve target refs for continuation.",
    {
      queuedConsumable,
      queuedPayload: queuedConsumableTimeArgs?.payload,
      consumableAppliedDuringQueue,
      immediateConsumable,
      immediateConsumableAppliedTargets,
      immediateConsumableRefreshes,
      resumedConsumable,
      resumedConsumableTargets,
    },
  );

  const blastConfig = aoePolicyService.normalizeAoeConfig({
    type: "blast",
    shape: "cone",
    distance: 3,
    maxTargets: null,
    friendlyFireMode: "auto",
    targetZoneMode: "fixed",
    targetZone: "legs",
    damageType: "fire",
  });
  const fixedZonePolicy = aoePolicyService.buildAoeTargetZonePolicy({
    aoe: blastConfig,
    mode: blastConfig.targetZoneMode,
  });
  const aimedZonePolicy = aoePolicyService.buildAoeTargetZonePolicy({
    targetZone: "head",
    mode: "aimed",
  });
  pushCombatFinding(
    findings,
    blastConfig.friendlyFire === true
      && blastConfig.targetZone === "leftLeg"
      && fixedZonePolicy.usesFixedZone === true
      && aoePolicyService.resolveAoeTargetZoneForTarget(fixedZonePolicy) === "leftLeg"
      && aoePolicyService.resolveAoeTargetZoneDetails(fixedZonePolicy).source === "fixed"
      && aoePolicyService.resolveAoeTargetZoneDetails({ mode: "random" }, { _ihAoe: { targetZone: "abdomen" } }).zone === "abdomen"
      && aoePolicyService.resolveAoeTargetZoneDetails({ mode: "random" }, { _ihAoe: { targetZone: "abdomen" } }).source === "target"
      && aimedZonePolicy.requiresChoice === true,
    "bad-aoe-policy-normalization",
    "AoE policy normalization did not resolve friendly fire and hit-zone policy as expected.",
    { blastConfig, fixedZonePolicy, aimedZonePolicy },
  );

  const friendlyFirePolicy = aoePolicyService.filterAoeTargetsByPolicy(
    [makeSmokeTargetRef(target), makeSmokeTargetRef(ally)],
    { attacker, friendlyFire: true },
  );
  pushCombatFinding(
    findings,
    friendlyFirePolicy.policy === "all" && friendlyFirePolicy.targets.length === 2,
    "bad-friendly-fire-all-policy",
    "Friendly-fire AoE policy should keep all valid targets.",
    { friendlyFirePolicy },
  );

  let enemyPolicy = null;
  if (typeof globalThis.canvas !== "undefined") {
    enemyPolicy = aoePolicyService.filterAoeTargetsByPolicy(
      [makeSmokeTargetRef(target), makeSmokeTargetRef(ally)],
      { attacker, friendlyFire: false },
    );
    pushCombatFinding(
      findings,
      enemyPolicy.policy === "enemies"
        && enemyPolicy.targets.length === 1
        && enemyPolicy.targets[0]?.actor?.id === target.id
        && enemyPolicy.skipped === 1,
      "bad-friendly-fire-off-policy",
      "Friendly-fire off policy should skip allied targets.",
      { enemyPolicy },
    );
  } else {
    findings.push(finding(
      "info",
      "disposition-policy-skipped",
      "Friendly-fire off disposition filtering was skipped outside a Foundry canvas runtime.",
      { scope: "combat" },
    ));
  }

  const typedTargets = [
    makeSmokeTargetRef(target, { projectionFromOrigin: 4, distanceFromOrigin: 4, sideFromOrigin: 0 }),
    makeSmokeTargetRef(farTarget, { projectionFromOrigin: 12, distanceFromOrigin: 12, sideFromOrigin: 4 }),
    makeSmokeTargetRef(attacker, { projectionFromOrigin: 0, distanceFromOrigin: 0, sideFromOrigin: 0 }),
  ];
  const pierceTargets = aoeService.filterTargetsByAoeType(typedTargets, "pierce", 1, attacker);
  const blastTargets = aoeService.filterTargetsByAoeType(typedTargets, "blast", null, attacker);
  pushCombatFinding(
    findings,
    pierceTargets.length === 1
      && pierceTargets[0]?.actor?.id === target.id
      && blastTargets.length === 2
      && blastTargets.every(ref => ref.actor?.id !== attacker.id),
    "bad-aoe-type-filtering",
    "AoE type filtering did not select pierce/blast targets correctly.",
    { pierceTargets: pierceTargets.map(ref => ref.actor?.id), blastTargets: blastTargets.map(ref => ref.actor?.id) },
  );

  const aoeDamageTarget = makeSmokeActor({
    id: "ih-smoke-aoe-target",
    name: "Smoke AoE Target",
    disposition: -1,
  });
  const aoeDamageAlly = makeSmokeActor({
    id: "ih-smoke-aoe-ally",
    name: "Smoke AoE Ally",
    disposition: 1,
  });
  const aoeDamageResults = await aoeService.applyAoeDamage({
    attacker,
    targets: [
      makeSmokeTargetRef(aoeDamageTarget, { projectionFromOrigin: 2, distanceFromOrigin: 2, sideFromOrigin: 0 }),
      makeSmokeTargetRef(aoeDamageAlly, { projectionFromOrigin: 3, distanceFromOrigin: 3, sideFromOrigin: 0 }),
    ],
    baseDamage: 2,
    skillKey: "sword",
    damageType: "physical",
    label: "Smoke AoE",
    aoeType: "blast",
    friendlyFire: false,
    targetZone: "torso",
    targetZoneMode: "fixed",
    hitBonus: 0,
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => ({
      total: Math.max(12, Number(skillValue) * 2),
      rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: Math.max(12, Number(skillValue) * 2) }],
      exploded: false,
    }),
    createChat: false,
  });
  const aoeDamageSummary = aoeDamageResults.summary ?? {};
  pushCombatFinding(
    findings,
    aoeDamageResults.length === 1
      && aoeDamageResults[0]?.actorId === aoeDamageTarget.id
      && aoeDamageResults[0]?.hit === true
      && aoeDamageResults[0]?.zoneKey === "torso"
      && aoeDamageResults[0]?.zoneSource === "fixed"
      && aoeDamageResults[0]?.targetPolicy === "enemies"
      && Number(aoeDamageResults[0]?.damage ?? 0) > 0
      && aoeDamageTarget._ihSmokeUpdates.length > 0
      && aoeDamageAlly._ihSmokeUpdates.length === 0
      && aoeDamageSummary.alliesSpared === 1
      && aoeDamageSummary.hitCount === 1
      && aoeDamageSummary.enemyCount === 1
      && aoeDamageSummary.allyCount === 0
      && aoeDamageSummary.enemiesHit === 1
      && aoeDamageSummary.killCount === 0
      && aoeDamageSummary.targetPolicy === "enemies"
      && aoeDamageSummary.friendlyFireMode === "off"
      && aoeDamageSummary.resultClass === "is-damage",
    "bad-aoe-damage-resolution",
    "AoE damage should resolve per target, skip allies when friendly fire is off, and expose a summary.",
    {
      results: aoeDamageResults,
      summary: aoeDamageSummary,
      targetUpdates: aoeDamageTarget._ihSmokeUpdates,
      allyUpdates: aoeDamageAlly._ihSmokeUpdates,
    },
  );

  const autoAoeEnemy = makeSmokeActor({
    id: "ih-smoke-auto-aoe-target",
    name: "Smoke Auto AoE Target",
    disposition: -1,
  });
  const autoAoeAlly = makeSmokeActor({
    id: "ih-smoke-auto-aoe-ally",
    name: "Smoke Auto AoE Ally",
    disposition: 1,
  });
  let autoAoeRoll = 0;
  const autoAoeResults = await aoeService.applyAoeDamage({
    attacker,
    targets: [
      makeSmokeTargetRef(autoAoeEnemy, { projectionFromOrigin: 2, distanceFromOrigin: 2, sideFromOrigin: 0 }),
      makeSmokeTargetRef(autoAoeAlly, { projectionFromOrigin: 3, distanceFromOrigin: 3, sideFromOrigin: 1 }),
    ],
    baseDamage: 2,
    skillKey: "sword",
    damageType: "fire",
    label: "Smoke Auto AoE",
    aoeType: "blast",
    friendlyFireMode: "auto",
    targetZone: "abdomen",
    targetZoneMode: "fixed",
    hitBonus: 20,
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => {
      autoAoeRoll += 1;
      const total = Math.max(14, Number(skillValue) * 2) + autoAoeRoll;
      return {
        total,
        rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: total }],
        exploded: false,
      };
    },
    createChat: false,
  });
  const autoAoeSummary = autoAoeResults.summary ?? {};
  pushCombatFinding(
    findings,
    autoAoeResults.length === 2
      && autoAoeResults.some(result => result.actorId === autoAoeEnemy.id && result.hit === true)
      && autoAoeResults.some(result => result.actorId === autoAoeAlly.id && result.ally === true && result.hit === true)
      && autoAoeResults.every(result => result.zoneKey === "abdomen" && result.zoneSource === "fixed")
      && autoAoeResults.every(result => result.friendlyFireMode === "auto" && result.targetPolicy === "all")
      && autoAoeSummary.friendlyFire === true
      && autoAoeSummary.friendlyFireMode === "auto"
      && autoAoeSummary.targetPolicy === "all"
      && autoAoeSummary.alliesHit === 1
      && autoAoeSummary.allyCount === 1
      && autoAoeSummary.enemyCount === 1
      && autoAoeSummary.enemiesHit === 1
      && autoAoeSummary.friendlyFireRisk === true
      && autoAoeSummary.friendlyFireHit === true
      && autoAoeSummary.resultClass === "is-friendly-fire"
      && autoAoeRoll === 2,
    "bad-aoe-auto-friendly-fire",
    "Auto friendly-fire AoE should resolve every selected target separately and keep per-target zone metadata.",
    { results: autoAoeResults, summary: autoAoeSummary, autoAoeRoll },
  );
  const autoAoeChatData = combatPresentationService.buildAoeChatData({
    label: "Smoke Auto AoE",
    results: autoAoeResults,
    summary: autoAoeSummary,
    aoeConfig: {
      type: "blast",
      shape: "circle",
      distance: 3,
      friendlyFireMode: "auto",
      targetZone: "abdomen",
      targetZoneMode: "fixed",
    },
    damageType: "fire",
    baseDamage: 2,
  });
  const autoAoeAllyView = autoAoeChatData.results.find(result => result.actorId === autoAoeAlly.id);
  const autoAoeEnemyView = autoAoeChatData.results.find(result => result.actorId === autoAoeEnemy.id);
  pushCombatFinding(
    findings,
    autoAoeChatData.statPills.some(pill => pill.label === "Союзники" && pill.value === "1/0")
      && autoAoeChatData.statPills.some(pill => pill.className === "is-danger")
      && String(autoAoeChatData.cardClass).includes("has-friendly-fire-hit")
      && autoAoeChatData.executionRows?.some(row => row.label === "Friendly fire" && row.className === "is-danger")
      && autoAoeChatData.executionRows?.some(row => row.label === "Hit zone" && String(row.value).includes("Живот"))
      && autoAoeAllyView?.badges?.some(badge => badge.className === "is-danger")
      && autoAoeAllyView?.detailRows?.some(row => row.label === "Зона" && String(row.value).includes("Живот"))
      && autoAoeAllyView?.detailRows?.some(row => row.label === "Friendly fire" && String(row.value).includes("типу"))
      && autoAoeAllyView?.detailRows?.some(row => row.label === "Позиция" && String(row.value).includes("смещ. 1"))
      && autoAoeEnemyView?.badges?.some(badge => badge.className === "is-enemy"),
    "bad-aoe-chat-view-model",
    "AoE chat view model should expose per-target side, friendly-fire, zone-source, and metric details.",
    { autoAoeChatData, autoAoeAllyView, autoAoeEnemyView },
  );

  const injuryAoeTarget = makeSmokeActor({
    id: "ih-smoke-injury-aoe-target",
    name: "Smoke Injury AoE Target",
    disposition: -1,
  });
  const injuryAoeResults = await aoeService.applyAoeDamage({
    attacker,
    targets: [makeSmokeTargetRef(injuryAoeTarget, { projectionFromOrigin: 2, distanceFromOrigin: 2, sideFromOrigin: 0 })],
    baseDamage: 9,
    skillKey: "sword",
    damageType: "physical",
    label: "Smoke Injury AoE",
    aoeType: "blast",
    friendlyFire: false,
    targetZone: "abdomen",
    targetZoneMode: "fixed",
    hitBonus: 20,
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => ({
      total: Math.max(14, Number(skillValue) * 2),
      rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: Math.max(14, Number(skillValue) * 2) }],
      exploded: false,
    }),
    createChat: false,
  });
  const injuryAoeSummary = injuryAoeResults.summary ?? {};
  pushCombatFinding(
    findings,
    injuryAoeResults.length === 1
      && injuryAoeResults[0]?.hit === true
      && injuryAoeResults[0]?.zoneKey === "abdomen"
      && Number(injuryAoeTarget.system.resources.hp.abdomen.status.minorBleeding ?? 0) > 0
      && Number(injuryAoeTarget.system.conditions.shock ?? 0) > 0
      && injuryAoeSummary.damageTotal >= 9
      && injuryAoeSummary.resultClass === "is-damage",
    "bad-aoe-default-injury-policy",
    "Harmful AoE should apply injury effects by default so selected hit zones have mechanical consequences.",
    { results: injuryAoeResults, summary: injuryAoeSummary, updates: injuryAoeTarget._ihSmokeUpdates },
  );

  const lethalAoeTarget = makeSmokeActor({
    id: "ih-smoke-lethal-aoe-target",
    name: "Smoke Lethal AoE Target",
    disposition: -1,
  });
  const lethalAoeResults = await aoeService.applyAoeDamage({
    attacker,
    targets: [makeSmokeTargetRef(lethalAoeTarget, { projectionFromOrigin: 1, distanceFromOrigin: 1, sideFromOrigin: 0 })],
    baseDamage: 12,
    skillKey: "sword",
    damageType: "physical",
    label: "Smoke Lethal AoE",
    aoeType: "blast",
    friendlyFire: false,
    targetZone: "head",
    targetZoneMode: "fixed",
    hitBonus: 20,
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => ({
      total: Math.max(14, Number(skillValue) * 2),
      rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: Math.max(14, Number(skillValue) * 2) }],
      exploded: false,
    }),
    createChat: false,
  });
  const lethalAoeSummary = lethalAoeResults.summary ?? {};
  const lethalAoeChatData = combatPresentationService.buildAoeChatData({
    label: "Smoke Lethal AoE",
    results: lethalAoeResults,
    summary: lethalAoeSummary,
    aoeConfig: {
      type: "blast",
      shape: "circle",
      distance: 3,
      friendlyFireMode: "off",
      targetZone: "head",
      targetZoneMode: "fixed",
    },
    damageType: "physical",
    baseDamage: 12,
  });
  pushCombatFinding(
    findings,
    lethalAoeResults.length === 1
      && lethalAoeResults[0]?.targetKilled === true
      && lethalAoeSummary.killCount === 1
      && lethalAoeSummary.resultClass === "is-lethal"
      && String(lethalAoeChatData.cardClass).includes("is-lethal")
      && lethalAoeChatData.statPills.some(pill => pill.className === "is-kill")
      && lethalAoeChatData.results[0]?.badges?.some(badge => badge.className === "is-kill"),
    "bad-aoe-lethal-summary",
    "Lethal AoE results should be summarized and highlighted in the chat view model.",
    { results: lethalAoeResults, summary: lethalAoeSummary, chatData: lethalAoeChatData },
  );

  const utilityAoeAlly = makeSmokeActor({
    id: "ih-smoke-utility-aoe-ally",
    name: "Smoke Utility AoE Ally",
    disposition: 1,
  });
  const utilityAoeEnemy = makeSmokeActor({
    id: "ih-smoke-utility-aoe-enemy",
    name: "Smoke Utility AoE Enemy",
    disposition: -1,
  });
  await utilityAoeAlly.update({ "system.resources.hp.abdomen.value": 7 });
  await utilityAoeEnemy.update({ "system.resources.hp.abdomen.value": 7 });
  utilityAoeAlly._ihSmokeUpdates.length = 0;
  utilityAoeEnemy._ihSmokeUpdates.length = 0;
  const utilityAoeResults = await aoeService.applyAoeUtilityEffect({
    attacker,
    targets: [
      makeSmokeTargetRef(utilityAoeAlly, { projectionFromOrigin: 1, distanceFromOrigin: 1, sideFromOrigin: 0 }),
      makeSmokeTargetRef(utilityAoeEnemy, { projectionFromOrigin: 2, distanceFromOrigin: 2, sideFromOrigin: 0 }),
    ],
    effect: { special: "heal" },
    power: 4,
    label: "Smoke Utility AoE",
    aoeType: "blast",
    targetZone: "belly",
    targetZoneMode: "fixed",
    friendlyFire: false,
    friendlyFireMode: "off",
    createChat: false,
  });
  const utilityAoeSummary = utilityAoeResults.summary ?? {};
  pushCombatFinding(
    findings,
    utilityAoeResults.length === 1
      && utilityAoeResults[0]?.actorId === utilityAoeAlly.id
      && utilityAoeResults[0]?.zoneKey === "abdomen"
      && utilityAoeResults[0]?.zoneSource === "fixed"
      && Number(utilityAoeResults[0]?.metrics?.projectionFromOrigin ?? -1) === 1
      && Number(utilityAoeResults[0]?.healed ?? 0) === 4
      && Number(utilityAoeAlly.system.resources.hp.abdomen.value ?? 0) === 11
      && Number(utilityAoeEnemy.system.resources.hp.abdomen.value ?? 0) === 7
      && utilityAoeSummary.targetPolicy === "allies"
      && utilityAoeSummary.selectedTargets === 1
      && utilityAoeSummary.skippedByPolicy === 1
      && utilityAoeSummary.healingTotal === 4,
    "bad-aoe-utility-resolution",
    "AoE utility effects should use the shared target policy, zone policy, and summary contract.",
    {
      results: utilityAoeResults,
      summary: utilityAoeSummary,
      allyUpdates: utilityAoeAlly._ihSmokeUpdates,
      enemyUpdates: utilityAoeEnemy._ihSmokeUpdates,
    },
  );

  const undeadTarget = makeSmokeActor({
    id: "ih-smoke-undead-target",
    name: "Smoke Skeleton",
    type: "monster",
    disposition: -1,
  });
  undeadTarget.system.info.bestiaryId = "skeleton";
  undeadTarget.system.info.tags = "undead skeleton";
  const undeadSpell = await spellEffectService.applySingleTargetSpellDamage({
    caster: attacker,
    target: undeadTarget,
    skillKey: "fire",
    baseDamage: 2,
    damageType: "magical",
    label: "Smoke holy spell",
    effect: { special: "double_vs_undead" },
    targetZone: "torso",
    injuries: SMOKE_INJURIES,
    dieRoller: async skillValue => ({
      total: Math.max(10, Number(skillValue) * 2),
      rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: Math.max(10, Number(skillValue) * 2) }],
      exploded: false,
    }),
    renderHtml: false,
  });
  pushCombatFinding(
    findings,
    undeadSpell.ok === true
      && undeadSpell.damageMultiplier === 2
      && undeadSpell.result?.hit === true
      && Number(undeadSpell.result?.rawDamage ?? 0) >= 4
      && undeadTarget._ihSmokeUpdates.length > 0,
    "bad-undead-spell-multiplier",
    "Single-target spell damage should apply configured undead multipliers before damage resolution.",
    { undeadSpell, updates: undeadTarget._ihSmokeUpdates },
  );

  const banishTarget = makeSmokeActor({
    id: "ih-smoke-banish-target",
    name: "Smoke Weak Skeleton",
    type: "monster",
    disposition: -1,
  });
  banishTarget.system.info.tier = 1;
  banishTarget.system.info.bestiaryId = "skeleton";
  banishTarget.system.info.tags = "undead skeleton";
  let banished = false;
  const banishEffect = await spellEffectService.applySingleTargetSpellUtilityEffect({
    caster: attacker,
    target: banishTarget,
    effect: { special: "banish" },
    power: 0,
    roll: { total: 10 },
    schoolSkill: { value: 6 },
    markActorDead: async targetActor => {
      banished = targetActor?.id === banishTarget.id;
      await targetActor?.update?.({ "system.conditions.unconscious": 60 });
    },
  });
  pushCombatFinding(
    findings,
    banishEffect.ok === true
      && banishEffect.handled === true
      && banishEffect.banish?.destroyed === true
      && banished === true
      && banishTarget._ihSmokeUpdates.length > 0,
    "bad-banish-spell-effect",
    "Banish utility spell should resolve against weak undead/summoned targets.",
    { banishEffect, banished, updates: banishTarget._ihSmokeUpdates },
  );
  const combatEvents = combatEventService.getCombatEventLog();
  const newCombatEventCount = Math.max(0, combatEvents.length - combatEventStartCount);
  const newCombatEvents = newCombatEventCount > 0 ? combatEvents.slice(0, newCombatEventCount) : [];
  const smokeCombatEvents = newCombatEvents.filter(event => {
    const haystack = `${event.title ?? ""} ${event.actorName ?? ""} ${event.targetName ?? ""}`;
    return haystack.includes("Smoke");
  });
  const combatEventStats = combatEventService.getCombatEventStats(smokeCombatEvents);
  const smokeAoeEvent = smokeCombatEvents.find(event => event.type === "aoe" && event.title === "Smoke Auto AoE");
  const smokeSpellDamageEvent = smokeCombatEvents.find(event => event.type === "spell" && event.title === "Smoke holy spell");
  const smokeUtilityEvent = smokeCombatEvents.find(event => event.type === "utility" && event.status === "down" && event.targetName === banishTarget.name);
  pushCombatFinding(
    findings,
    Boolean(smokeAoeEvent)
      && smokeAoeEvent?.friendlyFire === true
      && smokeAoeEvent?.chips?.some(chip => chip.label === "FF")
      && Boolean(smokeSpellDamageEvent)
      && Number(smokeSpellDamageEvent?.damage ?? 0) > 0
      && Boolean(smokeUtilityEvent)
      && smokeUtilityEvent?.targetKilled === true
      && smokeUtilityEvent?.chips?.some(chip => chip.className === "is-kill")
      && combatEventStats.total >= 3
      && combatEventStats.damage > 0
      && combatEventStats.utility > 0
      && combatEventStats.rows.some(row => row.className === "is-utility"),
    "bad-combat-event-director-log",
    "Combat Director event log should receive attack/spell, AoE, friendly-fire, and utility spell events with aggregate stats.",
    { smokeAoeEvent, smokeSpellDamageEvent, smokeUtilityEvent, combatEventStats, newCombatEventCount, smokeCombatEvents: smokeCombatEvents.slice(0, 8) },
  );

  let spellAoeConfigs = 0;
  let spellAimedConfigs = 0;
  let spellFixedConfigs = 0;
  let spellZoneAliases = 0;
  let spellFriendlyFireAuto = 0;
  const spells = Object.entries(spellsCatalog.SPELLS ?? {});
  const validShapes = new Set(aoePolicyService.AOE_SHAPE_KEYS);
  const validTypes = new Set(aoePolicyService.AOE_TYPE_KEYS);
  const validZoneModes = new Set(aoePolicyService.AOE_TARGET_ZONE_MODE_KEYS);
  const validFriendlyFireModes = new Set(aoePolicyService.AOE_FRIENDLY_FIRE_MODE_KEYS);
  const validBodyZones = new Set(aoePolicyService.BODY_ZONE_KEYS);

  for (const [spellId, spell] of spells) {
    if (!spell?.aoe) continue;
    spellAoeConfigs += 1;
    const context = { scope: "combat", item: spellId };
    const rawAoe = spell.aoe;
    const rawZone = rawAoe.targetZone ?? rawAoe.targetPart ?? null;
    const normalizedZone = aoePolicyService.normalizeAoeTargetZone(rawZone);
    const normalized = aoePolicyService.normalizeAoeConfig(rawAoe, {
      damageType: spell.damageType,
      friendlyFireMode: spell.friendlyFireMode,
      targetZone: rawZone,
    });

    if (rawZone && normalizedZone && rawZone !== normalizedZone) spellZoneAliases += 1;
    if (normalized.targetZoneMode === "aimed") spellAimedConfigs += 1;
    if (normalized.targetZoneMode === "fixed") spellFixedConfigs += 1;
    if (normalized.friendlyFireMode === "auto") spellFriendlyFireAuto += 1;

    if (rawAoe.shape && !validShapes.has(rawAoe.shape)) {
      findings.push(finding("error", "invalid-spell-aoe-shape", "Spell AoE shape is not supported by AoE policy.", context, { shape: rawAoe.shape }));
    }
    if (rawAoe.type && !validTypes.has(rawAoe.type)) {
      findings.push(finding("error", "invalid-spell-aoe-type", "Spell AoE type is not supported by AoE policy.", context, { type: rawAoe.type }));
    }
    if (rawAoe.targetZoneMode && !validZoneModes.has(rawAoe.targetZoneMode)) {
      findings.push(finding("error", "invalid-spell-zone-mode", "Spell AoE targetZoneMode is not supported by AoE policy.", context, { targetZoneMode: rawAoe.targetZoneMode }));
    }
    if (rawAoe.friendlyFireMode && !validFriendlyFireModes.has(rawAoe.friendlyFireMode)) {
      findings.push(finding("error", "invalid-spell-friendly-fire-mode", "Spell AoE friendlyFireMode is not supported by AoE policy.", context, { friendlyFireMode: rawAoe.friendlyFireMode }));
    }
    if (rawZone && (!normalizedZone || !validBodyZones.has(normalizedZone))) {
      findings.push(finding("error", "invalid-spell-target-zone", "Spell AoE target zone cannot be applied to body HP zones.", context, { targetZone: rawZone, normalizedZone }));
    }
    if (normalized.targetZoneMode === "fixed" && !normalized.targetZone) {
      findings.push(finding("warn", "fixed-spell-zone-without-zone", "Fixed-zone AoE spell has no usable target zone.", context));
    }
  }

  const spellRuntimeReport = spellRuntimeService.validateSpellCatalogRuntime(spellsCatalog.SPELLS);
  for (const f of spellRuntimeReport.findings ?? []) findings.push(f);
  pushCombatFinding(
    findings,
    spellRuntimeReport.ok === true
      && spellRuntimeReport.summary.total === spells.length
      && spellRuntimeReport.summary.aoe === spellAoeConfigs
      && spellRuntimeReport.summary.damage > 0
      && spellRuntimeReport.summary.utility > 0
      && spellRuntimeReport.summary.defaultSelf >= 1,
    "bad-spell-runtime-normalization",
    "Spell runtime normalizer should classify catalog spells consistently for casting, UI, and generated item data.",
    { spellRuntimeSummary: spellRuntimeReport.summary },
  );
  const aimedSpellChoice = spellRuntimeService.buildSpellChoicePayload({
    targetZoneMode: "aimed",
    aoe: { targetZoneMode: "aimed", friendlyFireMode: "auto" },
  }, {
    targetZone: "head",
    targetZoneMode: "aimed",
    friendlyFire: true,
    friendlyFireMode: "auto",
  });
  const randomSpellChoice = spellRuntimeService.buildSpellChoicePayload({
    targetZone: "torso",
    targetZoneMode: "fixed",
    aoe: { targetZone: "torso", targetZoneMode: "fixed" },
  }, {
    targetZone: "",
    targetZoneMode: "random",
    friendlyFire: false,
    friendlyFireMode: "off",
  });
  const autoModeSpellChoice = spellRuntimeService.buildSpellChoicePayload({
    aoe: { friendlyFireMode: "off", friendlyFire: false },
  }, {
    friendlyFireMode: "auto",
  });
  pushCombatFinding(
    findings,
    aimedSpellChoice.targetZone === "head"
      && aimedSpellChoice.targetPart === "head"
      && aimedSpellChoice.targetZoneMode === "aimed"
      && aimedSpellChoice.aoe?.targetZoneMode === "aimed"
      && aimedSpellChoice.friendlyFireMode === "auto"
      && aimedSpellChoice.friendlyFire === true
      && randomSpellChoice.targetZone === undefined
      && randomSpellChoice.targetPart === undefined
      && randomSpellChoice.targetZoneMode === "random"
      && randomSpellChoice.aoe?.targetZone === undefined
      && randomSpellChoice.aoe?.targetZoneMode === "random"
      && randomSpellChoice.friendlyFireMode === "off"
      && autoModeSpellChoice.friendlyFireMode === "auto"
      && autoModeSpellChoice.friendlyFire === undefined
      && autoModeSpellChoice.aoe?.friendlyFireMode === "auto"
      && autoModeSpellChoice.aoe?.friendlyFire === undefined,
    "bad-spell-choice-payload-policy",
    "Spell choice payload should preserve aimed/fixed/random zone policy and friendly-fire mode overrides.",
    { aimedSpellChoice, randomSpellChoice, autoModeSpellChoice },
  );

  const combatFlow = await import("./combat-flow-service.mjs").catch(err => ({ _importError: err }));
  const flowApi = [
    "getCombatState",
    "getCombatUiState",
    "getActorCombatUiState",
    "getParticipantUiState",
    "isCombatActive",
    "getActorPendingAction",
    "restoreActorPendingAction",
    "startPendingAction",
    "continuePendingAction",
    "cancelPendingAction",
    "requestActionTimeCommit",
    "normalizeCombatActionSeconds",
    "resolvePendingActionProgress",
  ];
  const missingFlowApi = flowApi.filter(key => typeof combatFlow[key] !== "function");
  if (combatFlow._importError) {
    findings.push(finding("error", "combat-flow-import-failed", "Combat flow service could not be imported.", { scope: "combat" }, {
      error: String(combatFlow._importError?.message ?? combatFlow._importError),
    }));
  }
  for (const key of missingFlowApi) {
    findings.push(finding("error", "missing-combat-flow-api", "Combat flow service is missing an expected API.", { scope: "combat" }, { key }));
  }
  if (combatFlow.DEFAULT_TURN_SECONDS !== 6) {
    findings.push(finding("warn", "unexpected-turn-seconds", "Combat turn seconds differs from the intended 6-second action economy.", { scope: "combat" }, {
      defaultTurnSeconds: combatFlow.DEFAULT_TURN_SECONDS,
    }));
  }
  const normalizedHalfSecond = combatFlow.normalizeCombatActionSeconds?.(0.25);
  const normalizedZero = combatFlow.normalizeCombatActionSeconds?.(0, { allowZero: true });
  const pendingPreview = combatFlow.resolvePendingActionProgress?.({
    id: "ih-smoke-pending",
    label: "Smoke pending",
    actionType: "attack",
    totalSeconds: 8,
    spentSeconds: 6,
    remainingSeconds: 2,
    requiresConfirmation: true,
    data: { actionType: "attack" },
  }, 1.5);
  const pendingParticipantUi = combatFlow.getParticipantUiState?.({
    id: "ih-smoke-pending-participant",
    actorName: "Smoke Pending Actor",
    side: "ally",
    active: true,
    defeated: false,
    maxSeconds: 6,
    remainingSeconds: 4,
    pendingAction: {
      id: "ih-smoke-pending-action",
      label: "Smoke long action",
      actionType: "attack",
      totalSeconds: 8,
      spentSeconds: 6,
      remainingSeconds: 2,
      requiresConfirmation: true,
      awaitingConfirmation: true,
      data: { actionType: "attack" },
    },
  });
  pushCombatFinding(
    findings,
    normalizedHalfSecond === 0.5
      && normalizedZero === 0
      && pendingPreview?.completed === false
      && pendingPreview?.spentNow === 1.5
      && pendingPreview?.remainingActionSeconds === 0.5
      && pendingPreview?.remainingTurnSeconds === 0,
    "bad-combat-time-normalization",
    "Combat action seconds or pending progress normalization returned an invalid result.",
    { normalizedHalfSecond, normalizedZero, pendingPreview },
  );
  pushCombatFinding(
    findings,
    pendingParticipantUi?.hasPendingAction === true
      && pendingParticipantUi?.canStartNewAction === false
      && pendingParticipantUi?.canContinuePendingAction === true
      && pendingParticipantUi?.pendingActionProgressPct === 75
      && pendingParticipantUi?.pendingActionStatus === "awaiting",
    "bad-combat-pending-ui-state",
    "Combat participant UI state should block new actions while exposing pending progress and continuation state.",
    { pendingParticipantUi },
  );
  const normalizedPendingFailure = actionDispatchService.normalizePendingExecutionResult?.(
    { ok: false, reason: "smoke-failed" },
    { actionType: "attack" },
  );
  const normalizedPendingQueued = actionDispatchService.normalizePendingExecutionResult?.(
    { ok: true, queued: true },
    { actionType: "spell" },
  );
  pushCombatFinding(
    findings,
    normalizedPendingFailure?.ok === false
      && normalizedPendingFailure?.reason === "smoke-failed"
      && normalizedPendingQueued?.ok === false
      && normalizedPendingQueued?.queued === true,
    "bad-pending-execution-result-normalization",
    "Pending execution result normalization should preserve failed/queued handlers as non-success.",
    { normalizedPendingFailure, normalizedPendingQueued },
  );

  let combatActive = null;
  let combatUiParticipants = 0;
  if (globalThis.game && typeof combatFlow.isCombatActive === "function") {
    try {
      combatActive = combatFlow.isCombatActive();
      const uiState = combatFlow.getCombatUiState?.();
      combatUiParticipants = Number(uiState?.participants?.length ?? 0);
    } catch (err) {
      findings.push(finding("warn", "combat-flow-read-failed", "Combat flow read-only state check failed.", { scope: "combat" }, {
        error: String(err?.message ?? err),
      }));
    }
  }

  return {
    summary: {
      syntheticActors: 4,
      hitChancePct: chance?.pct ?? 0,
      attackHit: Boolean(attackResult?.hit),
      attackFinalDamage: Number(attackResult?.finalDamage ?? 0),
      attackMutations: target._ihSmokeUpdates.length,
      targetRefs: targetRefs.length,
      queuedAttack: Boolean(queuedAttack?.queued),
      resumedAttackDamage: Number(resumedAttackResult?.finalDamage ?? 0),
      consumableQueued: Boolean(queuedConsumable?.queued),
      consumablePendingTargetRefs: queuedConsumableRefs.length,
      aoePolicy: blastConfig.type,
      aoeFriendlyFireAuto: Boolean(blastConfig.friendlyFire),
      pierceTargets: pierceTargets.length,
      aoeDamageTargets: aoeDamageResults.length,
      aoeDamageTotal: Number(aoeDamageSummary.damageTotal ?? 0),
      aoeAlliesSpared: Number(aoeDamageSummary.alliesSpared ?? 0),
      aoeFriendlyFireHits: Number(autoAoeSummary.alliesHit ?? 0),
      aoeInjuryBleed: Number(injuryAoeTarget.system.resources.hp.abdomen.status.minorBleeding ?? 0),
      aoeLethalKills: Number(lethalAoeSummary.killCount ?? 0),
      aoeUtilityTargets: utilityAoeResults.length,
      aoeUtilityHealing: Number(utilityAoeSummary.healingTotal ?? 0),
      undeadSpellMultiplier: Number(undeadSpell.damageMultiplier ?? 1),
      banishDestroyed: Boolean(banishEffect.banish?.destroyed),
      combatEvents: newCombatEventCount,
      combatEventDamage: Number(combatEventStats.damage ?? 0),
      combatEventUtility: Number(combatEventStats.utility ?? 0),
      spellAoeConfigs,
      spellAimedConfigs,
      spellFixedConfigs,
      spellZoneAliases,
      spellFriendlyFireAuto,
      spellRuntimeDamage: spellRuntimeReport.summary.damage,
      spellRuntimeUtility: spellRuntimeReport.summary.utility,
      spellRuntimeDefaultSelf: spellRuntimeReport.summary.defaultSelf,
      flowApi: flowApi.length - missingFlowApi.length,
      defaultTurnSeconds: combatFlow.DEFAULT_TURN_SECONDS,
      combatActive,
      combatUiParticipants,
    },
    findings,
  };
}

async function preparedSmoke() {
  ensureFoundryUtilsForSmoke();

  const [
    preparedStateService,
    reactionService,
  ] = await Promise.all([
    import("./combat-prepared-state-service.mjs"),
    import("./combat-reaction-service.mjs"),
  ]);

  const findings = [];
  const attacker = makeSmokeActor({
    id: "ih-smoke-prepared-attacker",
    name: "Smoke Prepared Attacker",
    disposition: -1,
    skills: { sword: { value: 8 }, knife: { value: 8 }, bow: { value: 8 } },
  });
  const defender = makeSmokeActor({
    id: "ih-smoke-prepared-defender",
    name: "Smoke Prepared Defender",
    disposition: 1,
    skills: { sword: { value: 10 }, knife: { value: 10 }, shield: { value: 6 } },
  });
  const aimActor = makeSmokeActor({
    id: "ih-smoke-prepared-aim",
    name: "Smoke Prepared Aim",
    disposition: 1,
    skills: { bow: { value: 9 }, throwing: { value: 9 } },
  });

  const sword = addSmokeItem(defender, makeSmokeWeapon({
    id: "ih-smoke-riposte-sword",
    name: "Smoke Riposte Sword",
    skill: "sword",
    damage: 4,
  }), "rightHand");
  addSmokeItem(defender, makeSmokeShield(), "shield");
  const knife = addSmokeItem(defender, makeSmokeWeapon({
    id: "ih-smoke-intercept-knife",
    name: "Smoke Intercept Knife",
    skill: "knife",
    damage: 3,
  }), "leftHand");
  const bow = addSmokeItem(aimActor, makeSmokeWeapon({
    id: "ih-smoke-aim-bow",
    name: "Smoke Aim Bow",
    skill: "bow",
    damage: 3,
    range: 8,
  }), "rightHand");

  const highRoll = async skillValue => ({
    total: Math.max(12, Number(skillValue) * 2),
    rolls: [{ die: Math.max(2, Number(skillValue) * 2), result: Math.max(12, Number(skillValue) * 2) }],
    exploded: false,
  });

  const riposteTechnique = {
    id: "ih-smoke-riposte",
    label: "Smoke Riposte",
    skill: "sword",
    effect: { damage: 2, special: "counter_after_block", targetZone: "torso" },
  };
  const ripostePrepared = await preparedStateService.applyPreparedTechniqueEffect({
    actor: defender,
    technique: riposteTechnique,
    weapon: sword,
  });
  const riposte = await reactionService.applyPreparedCombatReaction({
    attacker,
    defender,
    result: {
      hit: true,
      finalDamage: 1,
      targetKilled: false,
      shieldBlock: { success: true },
    },
    sourceSkillKey: "sword",
    sourceDamageType: "physical",
    phase: "post-hit",
    dieRoller: highRoll,
    onLethal: () => {},
  });
  const riposteAfter = preparedStateService.getPreparedTechniquePayload(defender, "riposte_ready");
  pushPreparedFinding(
    findings,
    ripostePrepared.ok === true
      && riposte.triggered === true
      && riposte.result?.hit === true
      && Number(defender.system.conditions?.riposte_ready ?? 0) === 0
      && riposteAfter == null,
    "bad-riposte-reaction",
    "Prepared riposte should trigger after shield block, use stored weapon params, and consume its status/payload.",
    { ripostePrepared, riposte, riposteAfter },
  );

  const interceptTechnique = {
    id: "ih-smoke-intercept",
    label: "Smoke Intercept",
    skill: "knife",
    effect: { damage: 1, special: "reaction_interrupt", targetZone: "torso" },
  };
  const interceptPrepared = await preparedStateService.applyPreparedTechniqueEffect({
    actor: defender,
    technique: interceptTechnique,
    weapon: knife,
  });
  const intercept = await reactionService.applyPreparedCombatReaction({
    attacker,
    defender,
    result: null,
    sourceSkillKey: "sword",
    sourceDamageType: "physical",
    phase: "pre-hit",
    dieRoller: highRoll,
    onLethal: () => {},
  });
  pushPreparedFinding(
    findings,
    interceptPrepared.ok === true
      && intercept.triggered === true
      && intercept.interrupted === true
      && Number(defender.system.conditions?.intercept_ready ?? 0) === 0,
    "bad-intercept-reaction",
    "Prepared intercept should trigger before an incoming melee physical attack and interrupt on hit.",
    { interceptPrepared, intercept },
  );
  pushPreparedFinding(
    findings,
    typeof riposte.html === "string"
      && riposte.html.includes("ih-smoke-template")
      && typeof intercept.html === "string"
      && intercept.html.includes("ih-smoke-template")
      && intercept.html.includes("ih-combat-interrupt")
      && intercept.html.includes("ih-combat-status"),
    "bad-prepared-reaction-chat-card",
    "Prepared reactions should render the reaction attack template and structured combat chat cards for interrupts.",
    { riposteHtml: riposte.html, interceptHtml: intercept.html },
  );

  const aimTechnique = {
    id: "ih-smoke-aim",
    label: "Smoke Aim",
    skill: "bow",
    effect: { damage: 1, special: "aim_bonus_3_next_shot" },
  };
  const aimPrepared = await preparedStateService.applyPreparedTechniqueEffect({
    actor: aimActor,
    technique: aimTechnique,
    weapon: bow,
  });
  const wrongSkillBonus = await preparedStateService.consumePreparedAttackBonus(aimActor, {
    skillKey: "throwing",
    weapon: null,
  });
  const rightSkillBonus = await preparedStateService.consumePreparedAttackBonus(aimActor, {
    skillKey: "bow",
    weapon: bow,
  });
  pushPreparedFinding(
    findings,
    aimPrepared.ok === true
      && wrongSkillBonus.consumed === false
      && Number(aimActor.system.conditions?.aimed_shot_bonus ?? 0) === 0
      && rightSkillBonus.consumed === true
      && rightSkillBonus.hitBonus === 3,
    "bad-aimed-shot-bonus",
    "Prepared aim should stay tied to the prepared ranged skill/weapon and consume only on the matching shot.",
    { aimPrepared, wrongSkillBonus, rightSkillBonus },
  );

  return {
    summary: {
      syntheticActors: 3,
      riposteTriggered: Boolean(riposte.triggered),
      riposteHit: Boolean(riposte.result?.hit),
      interceptTriggered: Boolean(intercept.triggered),
      interceptInterrupted: Boolean(intercept.interrupted),
      aimBonusConsumed: Boolean(rightSkillBonus.consumed),
      actorUpdates: attacker._ihSmokeUpdates.length + defender._ihSmokeUpdates.length + aimActor._ihSmokeUpdates.length,
    },
    findings,
  };
}

function ensureFoundryUtilsForSmoke() {
  const existingFoundry = globalThis.foundry ?? {};
  const existingUtils = existingFoundry.utils ?? {};
  const getProperty = existingUtils.getProperty ?? ((object, path) => {
    if (!object || !path) return undefined;
    return String(path).split(".").filter(Boolean).reduce((value, key) => value?.[key], object);
  });
  const deepClone = existingUtils.deepClone ?? (value => {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  });

  globalThis.foundry = {
    ...existingFoundry,
    utils: {
      ...existingUtils,
      getProperty,
      deepClone,
    },
  };

  if (typeof globalThis.renderTemplate !== "function") {
    globalThis.renderTemplate = async (_template, data = {}) =>
      `<section class="ih-smoke-template"><h4>${data.label ?? ""}</h4></section>`;
  }
}

function pushMedicineFinding(findings, ok, code, message, details = {}, severity = "error") {
  if (ok) return;
  findings.push(finding(severity, code, message, { scope: "medicine" }, details));
}

function pushLifecycleFinding(findings, ok, code, message, details = {}, severity = "error") {
  if (ok) return;
  findings.push(finding(severity, code, message, { scope: "lifecycle" }, details));
}

async function medicineSmoke() {
  ensureFoundryUtilsForSmoke();

  const [
    bodyTraumaService,
    bodyHudService,
    conditionService,
    hitEffectService,
    itemActionDialogService,
  ] = await Promise.all([
    import("./body-trauma-service.mjs"),
    import("./body-hud-service.mjs"),
    import("./condition-service.mjs"),
    import("./hit-effect-service.mjs"),
    import("./item-action-dialog-service.mjs"),
  ]);

  const findings = [];
  const actor = makeSmokeActor({
    id: "ih-smoke-medicine",
    name: "Smoke Medicine",
  });
  const item = { id: "ih-smoke-medkit", name: "Smoke Medkit", type: "potion", system: { power: 1 } };
  const dialogTarget = makeSmokeActor({
    id: "ih-smoke-medicine-dialog-target",
    name: "Smoke Dialog Target",
  });
  const dialogBandage = {
    id: "ih-smoke-dialog-bandage",
    name: "Smoke Dialog Bandage",
    type: "consumable",
    system: {
      actionType: "bandage",
      applicationScope: "targeted",
      targetActorMode: "targeted",
      targetPart: "",
      power: 1,
    },
  };

  await dialogTarget.update({
    "system.resources.hp.abdomen.status.minorBleeding": 1,
  });
  await conditionService.ensureActorBodyTraumaStatusStructure(dialogTarget);
  const dialogBandageResult = await itemActionDialogService.applyActionTypeItemFromDialog(
    actor,
    dialogBandage,
    {
      selectedActors: [dialogTarget, dialogTarget],
      targetPart: "belly",
    },
  );
  const dialogAbdomenAfter = bodyTraumaService.getBodyPartTraumaStatus(dialogTarget, "abdomen");
  pushMedicineFinding(
    findings,
    dialogBandageResult.consumeItem === true
      && dialogAbdomenAfter.minorBleeding === 0
      && dialogTarget._ihSmokeUpdates.some(update => update["system.resources.hp.abdomen.status.minorBleeding"] === 0)
      && actor._ihSmokeUpdates.length === 0,
    "bad-dialog-item-target-resolution",
    "Configured item actions should resolve legacy targetActorMode aliases, deduplicate selected targets, and accept a preset target part without opening a dialog.",
    {
      dialogBandageResult,
      dialogAbdomenAfter,
      dialogTargetUpdates: dialogTarget._ihSmokeUpdates,
      sourceUpdates: actor._ihSmokeUpdates,
    },
  );

  await actor.update({
    "system.resources.hp.torso.status.majorBleeding": 2,
    "system.resources.hp.leftArm.status.fracture": true,
    "system.resources.hp.abdomen.value": 3,
    "system.resources.hp.abdomen.status.minorBleeding": 1,
    "system.resources.hp.rightLeg.value": 0,
  });
  await conditionService.ensureActorBodyTraumaStatusStructure(actor);
  await conditionService.refreshActorBodyTraumaStatus(actor);

  const initialSummary = bodyTraumaService.getActorBodyTraumaSummary(actor);
  pushLifecycleFinding(
    findings,
    initialSummary.hasActiveBleeding === true
      && initialSummary.parts.leftArm.rawFracture === true
      && initialSummary.parts.rightLeg.destroyed === true,
    "bad-initial-trauma-summary",
    "Synthetic trauma actor did not expose expected bleeding, fracture, and destroyed limb state.",
    { initialSummary },
  );

  const initialTriage = bodyTraumaService.buildActorMedicalTriage(actor);
  const tourniquetOptions = itemActionDialogService.getMedicalPartOptions(actor, { actionType: "tourniquet" });
  const bandageOptions = itemActionDialogService.getMedicalPartOptions(actor, { actionType: "bandage" });
  const splintOptions = itemActionDialogService.getMedicalPartOptions(actor, { actionType: "splint" });
  pushMedicineFinding(
    findings,
    initialTriage.needsAttention === true
      && initialTriage.primaryPart?.key === "torso"
      && initialTriage.primaryPart?.actionType === "tourniquet"
      && tourniquetOptions[0]?.key === "torso"
      && bandageOptions[0]?.key === "abdomen"
      && splintOptions[0]?.key === "leftArm",
    "bad-medical-triage-priority",
    "Medical triage and item target dialogs should prioritize the body part relevant to the selected treatment.",
    { initialTriage, tourniquetOptions, bandageOptions, splintOptions },
  );

  const initialBodyHud = bodyHudService.buildActorBodyHud(actor, { medicalTriage: initialTriage });
  const initialResourceHud = bodyHudService.buildActorResourceHud(actor);
  pushMedicineFinding(
    findings,
    initialBodyHud.hasBodyMap === true
      && initialBodyHud.parts.length === 7
      && initialBodyHud.figureRows.length === 4
      && initialBodyHud.sheetFigureRows.length === 4
      && initialBodyHud.partMap.torso?.hasIssue === true
      && initialBodyHud.partMap.torso?.sheetPartClass?.includes("ih-cs-fig-torso")
      && initialBodyHud.partMap.torso?.trauma?.majorBleedingTitle
      && initialBodyHud.partMap.abdomen?.hasIssue === true
      && initialBodyHud.partMap.rightLeg?.cssClass === "is-dead"
      && initialBodyHud.chips.some(chip => chip.key === "abdomen-energy" && chip.cssClass !== "is-stable")
      && initialResourceHud.find(row => row.key === "energy")?.pct === 100
      && initialResourceHud.find(row => row.key === "mana")?.pct === 100,
    "bad-body-hud-view-model",
    "Body HUD view model should expose synchronized body parts, urgent trauma chips, dead limbs, and resource bars for the combat HUD.",
    { initialBodyHud, initialResourceHud },
  );

  const tourniquetResult = await conditionService.applyMedicalActionToBodyPart(
    actor,
    actor,
    item,
    "tourniquet",
    "torso",
    1,
  );
  const torsoAfterTourniquet = bodyTraumaService.getBodyPartTraumaStatus(actor, "torso");
  const torsoHpBeforeTick = Number(actor.system.resources.hp.torso.value ?? 0);
  await conditionService.tickActorBodyTrauma(actor, { minorBleeding: false, majorBleeding: true });
  const torsoHpAfterTick = Number(actor.system.resources.hp.torso.value ?? 0);
  pushMedicineFinding(
    findings,
    tourniquetResult.consumeItem === true
      && torsoAfterTourniquet.majorBleeding === 2
      && torsoAfterTourniquet.activeMajorBleeding === 0
      && torsoAfterTourniquet.suppressedMajorBleeding === 2
      && torsoHpAfterTick === torsoHpBeforeTick,
    "bad-tourniquet-suppression",
    "Tourniquet should suppress major bleeding without removing the underlying wound or dealing bleed tick damage.",
    { tourniquetResult, torsoAfterTourniquet, torsoHpBeforeTick, torsoHpAfterTick },
  );

  const splintResult = await conditionService.applyMedicalActionToBodyPart(
    actor,
    actor,
    item,
    "splint",
    "leftArm",
    1,
  );
  const leftArmAfterSplint = bodyTraumaService.getBodyPartTraumaStatus(actor, "leftArm");
  pushMedicineFinding(
    findings,
    splintResult.consumeItem === true
      && leftArmAfterSplint.rawFracture === true
      && leftArmAfterSplint.fracture === false
      && leftArmAfterSplint.fractureSuppressed === true
      && leftArmAfterSplint.splinted === true,
    "bad-splint-suppression",
    "Splint should preserve fracture history while suppressing active fracture penalties.",
    { splintResult, leftArmAfterSplint },
  );

  const bandageResult = await conditionService.applyMedicalActionToBodyPart(
    actor,
    actor,
    item,
    "bandage",
    "abdomen",
    1,
  );
  const abdomenAfterBandage = bodyTraumaService.getBodyPartTraumaStatus(actor, "abdomen");
  const restProfile = bodyTraumaService.buildActorRestProfile(actor, "short");
  pushMedicineFinding(
    findings,
    bandageResult.consumeItem === true
      && abdomenAfterBandage.minorBleeding === 0
      && restProfile.abdomenEnergyPenalty > 0,
    "bad-abdomen-medical-state",
    "Bandage should clear minor abdomen bleeding while low abdomen HP continues to affect energy recovery.",
    { bandageResult, abdomenAfterBandage, abdomenEnergyPenalty: restProfile.abdomenEnergyPenalty },
  );

  const healResult = await hitEffectService.healActorBodyPart(actor, "rightLeg", 3);
  const rightLegAfterHeal = bodyTraumaService.getBodyPartTraumaStatus(actor, "rightLeg");
  pushMedicineFinding(
    findings,
    healResult.healed === 3
      && healResult.newHP === 3
      && rightLegAfterHeal.destroyed === false,
    "bad-body-part-heal-refresh",
    "Body-part healing should refresh destroyed flags and derived trauma state.",
    { healResult, rightLegAfterHeal },
  );

  const finalSummary = bodyTraumaService.getActorBodyTraumaSummary(actor);

  return {
    summary: {
      syntheticActors: 2,
      dialogItemTargetResolved: Boolean(dialogBandageResult.consumeItem),
      triageSeverity: initialTriage.severity,
      tourniquetSuppressedMajor: torsoAfterTourniquet.suppressedMajorBleeding,
      splintedFractures: finalSummary.splintedTotal,
      activeBleeding: finalSummary.activeBleedingTotal,
      abdomenEnergyPenalty: restProfile.abdomenEnergyPenalty,
      actorUpdates: actor._ihSmokeUpdates.length + dialogTarget._ihSmokeUpdates.length,
    },
    findings,
  };
}

async function lifecycleSmoke() {
  ensureFoundryUtilsForSmoke();

  const [
    bodyTraumaService,
    conditionService,
    recoveryService,
  ] = await Promise.all([
    import("./body-trauma-service.mjs"),
    import("./condition-service.mjs"),
    import("./recovery-service.mjs"),
  ]);

  const findings = [];
  const actor = makeSmokeActor({
    id: "ih-smoke-lifecycle",
    name: "Smoke Lifecycle",
  });

  await actor.update({
    "system.conditions.stunned": 6,
    "system.conditions.hasted": 6,
    "system.conditions.burning": 2,
    "system.resources.hp.torso.status.minorBleeding": 1,
  });

  const torsoBefore = Number(actor.system.resources.hp.torso.value ?? 0);
  const tick = await conditionService.applyActorTurnStartLifecycleTick(actor, {
    seconds: 6,
    notifyEmpty: false,
    createChat: false,
    rollLocation: () => 7,
  });
  const torsoAfter = Number(actor.system.resources.hp.torso.value ?? 0);
  const traumaSummary = bodyTraumaService.getActorBodyTraumaSummary(actor);
  const stunnedAfter = conditionService.getActorConditionValue(actor, "stunned");
  const hastedAfter = conditionService.getActorConditionValue(actor, "hasted");
  const burningAfter = conditionService.getActorConditionValue(actor, "burning");
  const bleedingAfter = conditionService.getActorConditionValue(actor, "bleeding");
  const skippedStunned = (tick.skipConditions ?? []).some(condition => condition.key === "stunned");
  const lifecycleChatData = conditionService.buildConditionTickChatData(actor, tick.effects, {
    skipConditions: tick.skipConditions,
    seconds: 6,
  });
  const lifecycleChatHtml = conditionService.buildConditionTickChatHtml(actor, tick.effects, {
    skipConditions: tick.skipConditions,
    seconds: 6,
  });

  pushLifecycleFinding(
    findings,
    tick.changed === true
      && skippedStunned
      && stunnedAfter === 0
      && hastedAfter === 0
      && burningAfter === 1
      && torsoAfter === torsoBefore - 3
      && traumaSummary.activeBleedingTotal === 1
      && bleedingAfter === 1,
    "bad-turn-start-lifecycle",
    "Turn-start lifecycle should process trauma, ongoing damage, duration decay, and skip-turn control exactly once.",
    {
      tick,
      torsoBefore,
      torsoAfter,
      stunnedAfter,
      hastedAfter,
      burningAfter,
      bleedingAfter,
      traumaSummary,
    },
  );
  pushLifecycleFinding(
    findings,
    lifecycleChatData?.badges?.some(badge => badge.label === "-3 HP" && badge.className === "is-danger")
      && lifecycleChatData?.notices?.some(notice => notice.label === "Пропуск хода" && String(notice.value).includes("Оглушение"))
      && lifecycleChatData?.rows?.some(row => String(row.label).includes("Горение") && String(row.value).includes("-2 HP"))
      && lifecycleChatData?.rows?.some(row => String(row.label).includes("Оглушение") && String(row.value).includes("6 -> 0"))
      && lifecycleChatHtml.includes("ih-combat-lifecycle-card")
      && lifecycleChatHtml.includes("ih-combat-row-grid"),
    "bad-lifecycle-chat-view-model",
    "Turn-start lifecycle chat should expose total damage, skip-turn notice, duration decay, ongoing damage, and card classes.",
    { lifecycleChatData, lifecycleChatHtml },
  );

  const restActor = makeSmokeActor({
    id: "ih-smoke-recovery",
    name: "Smoke Recovery",
  });
  await restActor.update({
    "system.resources.energy.value": 4,
    "system.resources.energy.max": 12,
    "system.resources.energy.baseMax": 12,
    "system.resources.mana.value": 2,
    "system.resources.mana.max": 10,
    "system.conditions.stunned": 12,
    "system.conditions.hasted": 6,
    "system.conditions.feared": 6,
    "system.conditions.silencedUntil": 60,
    "system.conditions.slowPenalty": 2,
    "system.conditions.poison": 2,
  });
  const recoveryBeforeRest = recoveryService.buildActorRecoveryPlan(restActor);
  const fullRestResult = await conditionService.applyActorFullRest(restActor);
  const recoveryAfterRest = recoveryService.buildActorRecoveryPlan(restActor);
  const clearedRestKeys = new Set((fullRestResult.clearedConditions ?? []).map(condition => condition.key));

  pushLifecycleFinding(
    findings,
    recoveryBeforeRest.needsAttention === true
      && recoveryBeforeRest.fullRest.canUse === true
      && fullRestResult.ok === true
      && conditionService.getActorConditionValue(restActor, "stunned") === 0
      && conditionService.getActorConditionValue(restActor, "hasted") === 0
      && conditionService.getActorConditionValue(restActor, "feared") === 0
      && conditionService.getActorConditionValue(restActor, "silencedUntil") === 0
      && conditionService.getActorConditionValue(restActor, "slowPenalty") === 0
      && conditionService.getActorConditionValue(restActor, "poison") === 1
      && clearedRestKeys.has("stunned")
      && clearedRestKeys.has("hasted")
      && recoveryAfterRest.nextTick.totalDamage === 1,
    "bad-full-rest-recovery",
    "Full rest should clear temporary combat states, reduce poison by one, and expose the remaining recovery pressure in the recovery plan.",
    {
      recoveryBeforeRest,
      fullRestResult,
      recoveryAfterRest,
      updates: restActor._ihSmokeUpdates,
    },
  );

  const summonActor = makeSmokeActor({
    id: "ih-smoke-summon",
    name: "Smoke Summon",
    type: "monster",
  });
  await summonActor.update({
    "system.resources.hp.value": 12,
    [`flags.${SYSTEM_ID}.summoned`]: {
      summonId: "skeleton",
      casterId: actor.id,
      casterName: actor.name,
      duration: 6,
      remaining: 6,
      totalDuration: 6,
    },
  });
  const summonTick = await conditionService.applyActorTurnStartLifecycleTick(summonActor, {
    seconds: 6,
    notifyEmpty: false,
    createChat: false,
  });
  const summonState = conditionService.getActorSummonState(summonActor);
  const summonHpAfter = Number(summonActor.system.resources.hp.value ?? -1);
  const summonExpiredEffect = (summonTick.effects ?? []).find(effect => effect.phase === "summon");

  pushLifecycleFinding(
    findings,
    summonTick.changed === true
      && summonTick.summonTick?.expired === true
      && summonTick.summonTick?.expiration?.ok === true
      && summonExpiredEffect?.expired === true
      && summonState?.expired === true
      && Number(summonState?.remaining ?? -1) === 0
      && summonHpAfter === 0,
    "bad-summon-lifecycle-expiration",
    "Summoned actors should tick their remaining duration, expire on turn start, and become defeated without deleting the actor document by default.",
    {
      summonTick,
      summonState,
      summonHpAfter,
      updates: summonActor._ihSmokeUpdates,
    },
  );

  return {
    summary: {
      syntheticActors: 3,
      effects: tick.effects?.length ?? 0,
      skipConditions: tick.skipConditions?.length ?? 0,
      torsoDamage: torsoBefore - torsoAfter,
      burningAfter,
      bleedingAfter,
      fullRestCleared: fullRestResult.clearedConditions?.length ?? 0,
      summonExpired: Boolean(summonState?.expired),
    },
    findings,
  };
}

async function validationSmoke(options) {
  const findings = [];
  const generatedSources = options.includeGeneratedSources
    ? validateGeneratedPackSources({ packIds: options.packIds })
    : null;
  const livePacks = options.includePacks
    ? await validateIronHillsContent({
      includeGenerated: true,
      includeWorld: options.includeWorld,
      includePacks: true,
      packIds: options.packIds,
    })
    : null;

  for (const f of generatedSources?.findings ?? []) findings.push(f);
  for (const f of livePacks?.findings ?? []) findings.push(f);

  return {
    summary: {
      generatedSourceItems: Number(generatedSources?.itemsChecked ?? 0),
      generatedSourceActors: Number(generatedSources?.actorsChecked ?? 0),
      liveItemsChecked: Number(livePacks?.itemsChecked ?? 0),
      generatedSourceErrors: Number(generatedSources?.counts?.error ?? 0),
      liveValidationErrors: Number(livePacks?.counts?.error ?? 0),
    },
    generatedSources,
    livePacks,
    findings,
  };
}

async function worldSituationSmoke() {
  const findings = [];
  const [
    situationService,
    sceneBriefService,
  ] = await Promise.all([
    import("./world-map-situation-generator-service.mjs"),
    import("./world-map-scene-brief-service.mjs"),
  ]);

  const forestBrief = sceneBriefService.buildWorldMapSceneBrief({
    activeLevelId: "encounter",
    focusTile: { label: "Dark Forest", terrain: "forest", danger: 2, col: 2, row: 4 },
    localView: { danger: 2 },
    encounterView: { danger: 2 },
    situationSeed: "runtime-smoke-forest",
  });
  const forestSituation = forestBrief.situation;
  const blacksmithSituation = situationService.buildWorldMapSituation({
    activeLevelId: "encounter",
    focusTile: { label: "Blacksmith House", terrain: "town", danger: 1, col: 5, row: 2 },
    localView: {
      activeHotspot: {
        id: "workshops",
        label: "Workshop Row",
        hotspotType: "craft",
        npcRole: "crafter",
      },
    },
    encounterView: { danger: 1 },
    sceneBrief: { kind: "craft" },
    seed: "runtime-smoke-blacksmith",
  });
  const stats = situationService.getWorldMapSituationPoolStats();

  if (!forestSituation?.hasSituation || !forestSituation.hasPlacementRows || !forestSituation.hasSkillRows) {
    findings.push(finding("error", "world-situation-forest-empty", "Forest scene brief did not generate actionable situation rows.", { scope: "world-situations" }, {
      forestSituation,
    }));
  }
  if (!String(forestSituation?.map?.id ?? "").includes("forest") && !String(forestSituation?.map?.label ?? "").toLowerCase().includes("forest")) {
    findings.push(finding("warn", "world-situation-forest-map-mismatch", "Forest context did not choose a forest-flavored generated map.", { scope: "world-situations" }, {
      map: forestSituation?.map,
    }));
  }
  if (!blacksmithSituation?.map?.id?.includes("blacksmith") || !blacksmithSituation.skillRows?.some(row => String(row.label).toLowerCase().includes("blacksmith"))) {
    findings.push(finding("error", "world-situation-blacksmith-mismatch", "Craft/blacksmith context did not generate the blacksmith house situation.", { scope: "world-situations" }, {
      blacksmithSituation,
    }));
  }
  for (const level of ["global", "region", "local", "encounter", "building"]) {
    if (!Number(stats.levels?.[level] ?? 0)) {
      findings.push(finding("error", "world-situation-pool-level-empty", "World situation map pool has no entries for a required level.", { scope: "world-situations" }, {
        level,
        stats,
      }));
    }
  }

  return {
    summary: {
      poolMaps: stats.total,
      levels: Object.keys(stats.levels ?? {}).length,
      forestMap: forestSituation?.map?.id ?? "",
      forestPlacements: forestSituation?.counts?.placements ?? 0,
      blacksmithMap: blacksmithSituation?.map?.id ?? "",
      blacksmithSkills: blacksmithSituation?.counts?.skills ?? 0,
    },
    forestSituation,
    blacksmithSituation,
    stats,
    findings,
  };
}

async function assetSmoke(options) {
  const report = await auditIronHillsAssets({
    checkFilesystem: options.checkAssetFiles,
    packIds: options.packIds,
  });
  return {
    summary: {
      images: Number(report.summary?.imagesChecked ?? 0),
      systemImages: Number(report.summary?.systemImages ?? 0),
      missingSystemImages: Number(report.summary?.missingSystemImages ?? 0),
      packDirectoriesChecked: Number(report.summary?.packDirectoriesChecked ?? 0),
      missingPackDirectories: Number(report.summary?.missingPackDirectories ?? 0),
      checkerMode: report.checkFilesystem ? report.checkerMode : "disabled",
    },
    findings: report.findings ?? [],
    report,
  };
}

export async function runIronHillsRuntimeSmoke(options = {}) {
  const resolved = normalizeOptions(options);
  const sections = [];

  sections.push(await runSection("environment", "Foundry runtime and game API", () => environmentSmoke(resolved)));
  if (resolved.includePacks) {
    sections.push(await runSection("packs", "Generated compendium packs", () => packSmoke(resolved)));
  }

  if (resolved.includeAssets) {
    sections.push(await runSection("assets", "Assets and pack manifest", () => assetSmoke(resolved)));
  }
  if (resolved.includeGeneratedSources || resolved.includePacks) {
    sections.push(await runSection("validation", "Generated/live content validation", () => validationSmoke(resolved)));
  }
  if (resolved.includeWorldSituations) {
    sections.push(await runSection("world-situations", "World Map situation generator", () => worldSituationSmoke(resolved)));
  }
  if (resolved.includeInventory) {
    sections.push(await runSection("inventory", "Inventory view model smoke", () => inventorySmoke(resolved)));
  }
  if (resolved.includeTrade) {
    sections.push(await runSection("trade", "Tarkov trade quote smoke", () => tradeSmoke(resolved)));
  }
  if (resolved.includeCombat) {
    sections.push(await runSection("combat", "Combat mechanics smoke", () => combatSmoke(resolved)));
  }
  if (resolved.includePrepared) {
    sections.push(await runSection("prepared", "Prepared actions and reactions smoke", () => preparedSmoke(resolved)));
  }
  if (resolved.includeMedicine) {
    sections.push(await runSection("medicine", "Medicine and body trauma smoke", () => medicineSmoke(resolved)));
  }
  if (resolved.includeLifecycle) {
    sections.push(await runSection("lifecycle", "Turn lifecycle and condition tick smoke", () => lifecycleSmoke(resolved)));
  }

  const findings = sections.flatMap(section => section.findings ?? []);
  const counts = summarizeFindings(findings);
  return {
    ok: sections.every(section => section.status !== "failed") && counts.error === 0,
    options: resolved,
    summary: {
      sections: sections.length,
      errors: counts.error,
      warnings: counts.warn,
      info: counts.info,
      foundryVersion: globalThis.game?.version ?? globalThis.game?.release?.version ?? "",
      systemVersion: systemVersion(),
    },
    counts,
    sections,
    findings,
  };
}

function formatSummaryMap(summary = {}) {
  const entries = Object.entries(summary)
    .filter(([, value]) => value !== undefined && value !== null && typeof value !== "object");
  if (!entries.length) return "";
  return entries.map(([key, value]) => `${key}=${value}`).join(", ");
}

export function formatRuntimeSmokeReport(report, { maxFindings = 20 } = {}) {
  const counts = report?.counts ?? {};
  const lines = [
    `Iron Hills runtime smoke: ${report?.ok ? "OK" : "ISSUES"}`,
    `Foundry: ${report?.summary?.foundryVersion || "unknown"}, system=${report?.summary?.systemVersion || "unknown"}`,
    `Findings: ${counts.error ?? 0} errors, ${counts.warn ?? 0} warnings, ${counts.info ?? 0} info`,
    "Sections:",
  ];

  for (const section of report?.sections ?? []) {
    const summary = formatSummaryMap(section.summary);
    lines.push(
      `- ${section.status}: ${section.label} (${section.ms} ms` +
      `${summary ? `; ${summary}` : ""})`
    );
  }

  const findings = report?.findings ?? [];
  if (findings.length) {
    lines.push("Top findings:");
    for (const f of findings.slice(0, maxFindings)) {
      const detail = f.details?.error ? ` (${f.details.error})` : "";
      lines.push(`- [${f.severity}] ${f.code}: ${f.path || "(unknown)"} - ${f.message}${detail}`);
    }
    if (findings.length > maxFindings) lines.push(`...and ${findings.length - maxFindings} more findings.`);
  }

  return lines.join("\n");
}
