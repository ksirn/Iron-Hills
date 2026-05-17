/**
 * Iron Hills — Compendium Builder
 * Заполняет компендиумы системы предметами из каталога.
 * Запускается один раз при первом запуске мира (GM).
 * Повторный запуск: game.ironHills.buildCompendiums()
 */

import { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, TOOLS, BELTS, BACKPACKS, ATTACHMENTS, DRINK_VESSELS } from "./constants/items-catalog.mjs";
import { SPELLS } from "./constants/spells-catalog.mjs";
import { NPC_ROLE_PROFILES, resolveNpcProfileKey } from "./constants/npc-profiles.mjs";
import { MONSTER_BESTIARY, resolveMonsterPackDocToBestiaryId } from "./constants/monster-bestiary.mjs";
import { monsterRowToActorData, buildDrinkVesselItemData } from "./services/wilderness-service.mjs";
import { replaceMonsterHarvestEmbeddedItems } from "./utils/monster-harvest-items.mjs";

// ── Конвертеры из каталога в данные Item ────────────────────

function materialToItem(m) {
  const conventionMatImg = `systems/iron-hills-system/icons/items/materials/${m.id}.webp`;
  return {
    name: m.label,
    type: "material",
    img:  m.img ?? conventionMatImg,
    flags: {
      "iron-hills-system": {
        catalogId: m.id ?? "",
      },
    },
    system: {
      tier:     m.tier,
      category: m.category,
      weight:   m.weight  ?? 1,
      quantity: 1,
      gridW:    1, gridH: 1,
      value:    m.value   ?? 0,
      quality:  "common",
    }
  };
}

function weaponToItem(w) {
  const IMG = {
    sword:"icons/weapons/swords/sword-shortsword.webp",
    axe:"icons/weapons/axes/axe-battle.webp",
    spear:"icons/weapons/polearms/spear.webp",
    knife:"icons/weapons/daggers/dagger.webp",
    mace:"icons/weapons/maces/mace.webp",
    flail:"icons/weapons/flails/flail.webp",
    bow:"icons/weapons/bows/shortbow.webp",
    crossbow:"icons/weapons/crossbows/crossbow.webp",
    throwing:"icons/weapons/thrown/javelin.webp",
    unarmed:"icons/skills/melee/unarmed-punch.webp",
    exotic:"icons/weapons/staves/staff.webp",
  };
  const defaultImg = IMG[w.skill] ?? "icons/weapons/swords/sword-shortsword.webp";

  const system = {
    tier:       w.tier,
    quality:    "common",
    weight:     w.weight     ?? 2,
    quantity:   1,
    gridW:      w.gridW      ?? 1,
    gridH:      w.gridH      ?? 2,
    damage:     w.damage     ?? 3,
    damageType: w.damageType ?? "physical",
    skill:      w.skill      ?? "sword",
    twoHanded:  w.twoHanded  ?? false,
    energyCost: w.energyCost ?? 8,
    timeCost:   w.timeCost   ?? 2.0,
    value:      w.value      ?? 10,
    durability: { value: 40 + w.tier*10, max: 40 + w.tier*10 },
    range:      w.range ?? 1,
  };
  if (w.affixes && typeof w.affixes === "object") {
    system.affixes = foundry.utils.deepClone(w.affixes);
  }

  return {
    name: w.label,
    type: "weapon",
    img:  w.img ?? defaultImg,
    flags: {
      "iron-hills-system": {
        catalogId: w.id ?? "",
      },
    },
    system,
  };
}

function armorToItem(a) {
  const SLOT_GRID = {
    head:{w:2,h:2}, torso:{w:2,h:3}, leftArm:{w:1,h:2}, rightArm:{w:1,h:2},
    legs:{w:2,h:3}, leftHand:{w:2,h:2}, rightHand:{w:2,h:2},
    neck:{w:1,h:1}, ringLeft:{w:1,h:1}, ringRight:{w:1,h:1},
    belt:{w:2,h:1}, backpack:{w:2,h:3},
  };
  const DEFAULT_COVERS = {
    head:["head"], torso:["torso"], legs:["leftLeg","rightLeg"],
    leftArm:["leftArm"], rightArm:["rightArm"], neck:["neck"],
    leftHand:["leftArm","torso"], rightHand:["rightArm","torso"],
  };
  const sg = SLOT_GRID[a.slot] ?? {w:2,h:2};
  const resistRaw = a.resist ?? { physical: a.tier, magical: 0 };
  const imgFromResist =
    typeof resistRaw === "object" && resistRaw !== null && typeof resistRaw.img === "string"
      ? resistRaw.img
      : undefined;
  const resist = foundry.utils.deepClone(resistRaw);
  if (typeof resist === "object" && resist !== null) delete resist.img;
  const conventionArmorImg = `systems/iron-hills-system/icons/items/armor/${a.id}.webp`;
  const system = {
    tier:    a.tier,
    quality: "common",
    weight:  a.weight ?? 3,
    quantity: 1,
    gridW:   sg.w,
    gridH:   sg.h,
    slot:    a.slot,
    protection: resist,
    value:   a.value ?? 20,
    durability: { value: 50 + a.tier*15, max: 50 + a.tier*15 },
    covers: a.covers ?? DEFAULT_COVERS[a.slot] ?? ["torso"],
  };
  if (a.affixes && typeof a.affixes === "object") {
    system.affixes = foundry.utils.deepClone(a.affixes);
  }
  return {
    name: a.label,
    type: "armor",
    img:  a.img ?? imgFromResist ?? conventionArmorImg,
    flags: {
      "iron-hills-system": {
        catalogId: a.id ?? "",
      },
    },
    system,
  };
}

function potionActionConfig(p) {
  const effect = p.effect ?? p.effectType ?? "healHP";
  const targetPart = p.targetPart ?? p.zone ?? "torso";
  const map = {
    healHP: {
      actionType: "heal-part",
      applicationScope: "targeted",
      targetActorMode: "selected-or-self",
      targetPart,
    },
    healAll: {
      actionType: "heal-body",
      applicationScope: "global",
      targetActorMode: "self",
      targetPart: "",
    },
    restoreEnergy: {
      actionType: "restore-energy",
      applicationScope: "global",
      targetActorMode: "self",
      targetPart: "",
    },
    restoreEnergyMax: {
      actionType: "restore-energy-max",
      applicationScope: "global",
      targetActorMode: "self",
      targetPart: "",
    },
    restoreMana: {
      actionType: "restore-mana",
      applicationScope: "global",
      targetActorMode: "self",
      targetPart: "",
    },
    restoreHydration: {
      actionType: "restore-hydration",
      applicationScope: "global",
      targetActorMode: "self",
      targetPart: "",
    },
    restoreSatiety: {
      actionType: "restore-satiety",
      applicationScope: "global",
      targetActorMode: "self",
      targetPart: "",
    },
    curePoison: {
      actionType: "cure-poison",
      applicationScope: "global",
      targetActorMode: "selected-or-self",
      targetPart: "",
    },
    cureDisease: {
      actionType: "cure-disease",
      applicationScope: "global",
      targetActorMode: "selected-or-self",
      targetPart: "",
    },
  };
  return map[effect] ?? {
    actionType: "",
    applicationScope: "global",
    targetActorMode: "self",
    targetPart: "",
  };
}

function potionToItem(p) {
  const defaultImg = "icons/consumables/potions/potion-round-empty-green.webp";
  const action = potionActionConfig(p);
  return {
    name: p.label,
    type: "potion",
    img:  p.img ?? defaultImg,
    flags: {
      "iron-hills-system": {
        catalogId: p.id ?? "",
      },
    },
    system: {
      tier:    p.tier,
      quality: "common",
      weight:  p.weight ?? 0.3,
      quantity: 1,
      effect:  p.effect  ?? "healHP",
      effectType: p.effect ?? "healHP",
      actionType: action.actionType,
      applicationScope: action.applicationScope,
      targetActorMode: action.targetActorMode,
      targetPart: action.targetPart,
      power:   p.power   ?? 5,
      scope:   "single",
      target:  "self",
      zone:    "torso",
      value:   p.value   ?? 20,
    }
  };
}

function foodToItem(f) {
  const defaultImg = "icons/consumables/food/bread-loaf-round-brown.webp";
  const sys = {
    tier:      f.tier ?? 1,
    quality:   "common",
    weight:    f.weight ?? 0.5,
    quantity:  1,
    satiety:   f.satiety ?? 10,
    hydration: f.hydration ?? 5,
    value:     f.value ?? 2,
    gridW:     f.gridW ?? 1,
    gridH:     f.gridH ?? 1,
  };
  if (f.bonus && typeof f.bonus === "object") {
    sys.bonus = foundry.utils.deepClone(f.bonus);
  }
  return {
    name: f.label,
    type: "food",
    img:  f.img ?? defaultImg,
    flags: {
      "iron-hills-system": {
        catalogId: f.id ?? "",
      },
    },
    system: sys,
  };
}

function toolToItem(t) {
  const conventionToolImg = `systems/iron-hills-system/icons/items/tools/${t.id}.webp`;
  return {
    name: t.label,
    type: "tool",
    img:  t.img ?? conventionToolImg,
    flags: {
      "iron-hills-system": {
        catalogId: t.id ?? "",
      },
    },
    system: {
      tier:      t.tier,
      quality:   "common",
      weight:    t.weight    ?? 2,
      quantity:  1,
      craftType: t.craftType ?? "crafting",
      value:     t.value     ?? 10,
    }
  };
}

function attachmentToItem(a) {
  const conventionAttachImg = `systems/iron-hills-system/icons/items/attachments/${a.id}.webp`;
  return {
    name: a.label, type: "attachment",
    img:  a.img ?? conventionAttachImg,
    system: {
      tier: a.tier, quality:"common", weight:a.weight ?? 0.3,
      quantity:1, value:a.value ?? 10,
      gridW: a.gridW ?? 1, gridH: a.gridH ?? 2,
      attachesTo:   a.attachesTo   ?? "belt",
      addsLabel:    a.addsLabel    ?? a.label,
      addsSlots:    a.addsSlots    ?? {cols:2,rows:1},
      allowedTypes: a.allowedTypes ?? null,
      allowedSkills:a.allowedSkills ?? [],
      accessSeconds:a.accessSeconds ?? 1,
      description:  a.desc ?? "",
      durability:{value:20,max:20},
    },
    flags: {
      "iron-hills-system": {
        catalogId: a.id ?? "",
      },
    },
  };
}

function beltToItem(b) {
  const conventionBeltImg = `systems/iron-hills-system/icons/items/belts/${b.id}.webp`;
  return {
    name: b.label, type: "belt",
    img:  b.img ?? conventionBeltImg,
    system: {
      tier: b.tier, quality:"common", weight:b.weight ?? 0.5,
      quantity:1, value:b.value ?? 10,
      gridW: b.gridW ?? 2, gridH: b.gridH ?? 1,
      containerSlots: b.containerSlots ?? {cols:3,rows:1},
      attachmentSlots: b.attachmentSlots ?? [],
      weightFactor: b.weightFactor ?? 1.0,
      description: b.desc ?? "",
      durability:{value:25,max:25},
    },
    flags: {
      "iron-hills-system": {
        catalogId: b.id ?? "",
      },
    },
  };
}

function backpackToItem(b) {
  const conventionPackImg = `systems/iron-hills-system/icons/items/backpacks/${b.id}.webp`;
  return {
    name: b.label, type: "backpack",
    img:  b.img ?? conventionPackImg,
    system: {
      tier: b.tier, quality:"common", weight:b.weight ?? 1,
      quantity:1, value:b.value ?? 20,
      gridW: b.gridW ?? 2, gridH: b.gridH ?? 3,
      containerSlots: b.containerSlots ?? {cols:5,rows:6},
      attachmentSlots: b.attachmentSlots ?? [],
      weightFactor: b.weightFactor ?? 0.9,
      description: b.desc ?? "",
      durability:{value:30,max:30},
    },
    flags: {
      "iron-hills-system": {
        catalogId: b.id ?? "",
      },
    },
  };
}



async function emptyActorPack(packName) {
  const pack = game.packs.get(`iron-hills-system.${packName}`);
  if (!pack) return 0;
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  for (const doc of docs) await doc.delete();
  return docs.length;
}

// ── Основная функция заполнения ────────────────────────────

async function fillPack(packName, items, converter) {
  const pack = game.packs.get(`iron-hills-system.${packName}`);
  if (!pack) {
    console.warn(`Iron Hills | Pack not found: ${packName}`);
    return 0;
  }

  // Разблокируем компендиум
  await pack.configure({ locked: false });

  // Удаляем старое содержимое
  const existing = await pack.getDocuments();
  for (const doc of existing) await doc.delete();

  // Добавляем новые записи
  let count = 0;
  const cls = pack.documentClass;
  for (const [id, raw] of Object.entries(items)) {
    try {
      const data = converter(raw, id);
      await cls.create(data, { pack: `iron-hills-system.${packName}` });
      count++;
    } catch(e) {
      console.error(`Iron Hills | Error creating ${id}:`, e);
    }
  }

  // Не блокируем — оставляем доступными для просмотра
  // (locked=true мешает открывать листы предметов)
  return count;
}

/**
 * Подтягивает в компендиум поля из каталога WEAPONS (img, range, affixes, catalogId),
 * не удаляя записи — безопасно, если предметы уже на персонажах.
 */
export async function syncWeaponPackFromCatalog() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум.");
    return { updated: 0, total: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-weapons");
  if (!pack) {
    ui.notifications.error("Пак ih-weapons не найден.");
    return { updated: 0, total: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;

  for (const doc of docs) {
    let w = null;
    const cid = doc.getFlag?.("iron-hills-system", "catalogId");
    if (cid && WEAPONS[cid]) w = WEAPONS[cid];
    if (!w) w = Object.values(WEAPONS).find(x => x.label === doc.name);
    if (!w) continue;

    const patch = {};
    if (w.img && doc.img !== w.img) patch.img = w.img;
    if (w.range != null && Number(doc.system?.range ?? 0) !== Number(w.range)) {
      patch["system.range"] = w.range;
    }
    if (w.affixes && typeof w.affixes === "object") {
      patch["system.affixes"] = foundry.utils.deepClone(w.affixes);
    }

    const needsCatalogFlag = Boolean(w.id && (!cid || cid !== w.id));
    if (needsCatalogFlag) {
      const flags = foundry.utils.deepClone(doc.flags ?? {});
      flags["iron-hills-system"] = {
        ...(flags["iron-hills-system"] ?? {}),
        catalogId: w.id,
      };
      patch.flags = flags;
    }

    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | Компендиум оружия: обновлено записей ${updated} из ${docs.length}.`);
  return { updated, total: docs.length };
}

/**
 * Подтягивает в компендиум ih-armor поля из каталога ARMORS (img, protection, affixes, catalogId).
 */
export async function syncArmorPackFromCatalog() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум.");
    return { updated: 0, total: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-armor");
  if (!pack) {
    ui.notifications.error("Пак ih-armor не найден.");
    return { updated: 0, total: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;

  for (const doc of docs) {
    let a = null;
    const cid = doc.getFlag?.("iron-hills-system", "catalogId");
    if (cid && ARMORS[cid]) a = ARMORS[cid];
    if (!a) a = Object.values(ARMORS).find((x) => x.label === doc.name);
    if (!a) continue;

    const rawResist = a.resist ?? { physical: a.tier ?? 0 };
    const imgFromCatalogResist =
      typeof rawResist === "object" && rawResist !== null && typeof rawResist.img === "string"
        ? rawResist.img
        : undefined;
    const resist = (() => {
      const out = foundry.utils.deepClone(rawResist);
      if (typeof out === "object" && out !== null) delete out.img;
      return out;
    })();
    const patch = {};
    const conventionArmorImg = `systems/iron-hills-system/icons/items/armor/${a.id}.webp`;
    const desiredArmorImg = a.img ?? imgFromCatalogResist ?? conventionArmorImg;
    if (doc.img !== desiredArmorImg) patch.img = desiredArmorImg;

    const prot = doc.system?.protection ?? {};
    const np = resist.physical ?? 0;
    const nm = resist.magical ?? 0;
    const cp = prot.physical ?? 0;
    const cm = prot.magical ?? 0;
    if (np !== cp || nm !== cm) {
      patch["system.protection"] = foundry.utils.deepClone(resist);
    }

    if (a.affixes && typeof a.affixes === "object") {
      patch["system.affixes"] = foundry.utils.deepClone(a.affixes);
    }

    const needsCatalogFlag = Boolean(a.id && (!cid || cid !== a.id));
    if (needsCatalogFlag) {
      const flags = foundry.utils.deepClone(doc.flags ?? {});
      flags["iron-hills-system"] = {
        ...(flags["iron-hills-system"] ?? {}),
        catalogId: a.id,
      };
      patch.flags = flags;
    }

    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | Компендиум брони: обновлено записей ${updated} из ${docs.length}.`);
  return { updated, total: docs.length };
}

/**
 * Подтягивает в компендиум ih-potions поля из каталога POTIONS (img, effect, power, tier, value, catalogId).
 */
export async function syncPotionPackFromCatalog() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум.");
    return { updated: 0, total: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-potions");
  if (!pack) {
    ui.notifications.error("Пак ih-potions не найден.");
    return { updated: 0, total: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;

  for (const doc of docs) {
    let p = null;
    const cid = doc.getFlag?.("iron-hills-system", "catalogId");
    if (cid && POTIONS[cid]) p = POTIONS[cid];
    if (!p) p = Object.values(POTIONS).find((x) => x.label === doc.name);
    if (!p) continue;

    const patch = {};
    const imgPath = p.img ?? "icons/consumables/potions/potion-round-empty-green.webp";
    if (doc.img !== imgPath) patch.img = imgPath;

    const action = potionActionConfig(p);
    if ((doc.system?.effect ?? "") !== (p.effect ?? "healHP")) patch["system.effect"] = p.effect ?? "healHP";
    if ((doc.system?.effectType ?? "") !== (p.effect ?? "healHP")) patch["system.effectType"] = p.effect ?? "healHP";
    if ((doc.system?.actionType ?? "") !== action.actionType) patch["system.actionType"] = action.actionType;
    if ((doc.system?.applicationScope ?? "") !== action.applicationScope) patch["system.applicationScope"] = action.applicationScope;
    if ((doc.system?.targetActorMode ?? "") !== action.targetActorMode) patch["system.targetActorMode"] = action.targetActorMode;
    if ((doc.system?.targetPart ?? "") !== action.targetPart) patch["system.targetPart"] = action.targetPart;
    if (Number(doc.system?.power ?? 0) !== Number(p.power ?? 5)) patch["system.power"] = p.power ?? 5;
    if (Number(doc.system?.tier ?? 0) !== Number(p.tier ?? 1)) patch["system.tier"] = p.tier ?? 1;
    if (Number(doc.system?.value ?? 0) !== Number(p.value ?? 20)) patch["system.value"] = p.value ?? 20;
    const w = p.weight ?? 0.3;
    if (Number(doc.system?.weight ?? 0) !== Number(w)) patch["system.weight"] = w;

    const needsCatalogFlag = Boolean(p.id && (!cid || cid !== p.id));
    if (needsCatalogFlag) {
      const flags = foundry.utils.deepClone(doc.flags ?? {});
      flags["iron-hills-system"] = {
        ...(flags["iron-hills-system"] ?? {}),
        catalogId: p.id,
      };
      patch.flags = flags;
    }

    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | Компендиум зелий: обновлено записей ${updated} из ${docs.length}.`);
  return { updated, total: docs.length };
}

const DEFAULT_FOOD_IMG = "icons/consumables/food/bread-loaf-round-brown.webp";

/**
 * Подтягивает в компендиум ih-food поля из каталога FOOD (img, satiety, hydration, value, tier, bonus, catalogId).
 */
export async function syncFoodPackFromCatalog() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум.");
    return { updated: 0, total: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-food");
  if (!pack) {
    ui.notifications.error("Пак ih-food не найден.");
    return { updated: 0, total: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;

  for (const doc of docs) {
    let f = null;
    const cid = doc.getFlag?.("iron-hills-system", "catalogId");
    if (cid && FOOD[cid]) f = FOOD[cid];
    if (!f) f = Object.values(FOOD).find((x) => x.label === doc.name);
    if (!f) continue;

    const patch = {};
    const imgPath = f.img ?? DEFAULT_FOOD_IMG;
    if (doc.img !== imgPath) patch.img = imgPath;

    if (Number(doc.system?.satiety ?? 0) !== Number(f.satiety ?? 10)) patch["system.satiety"] = f.satiety ?? 10;
    if (Number(doc.system?.hydration ?? 0) !== Number(f.hydration ?? 5)) patch["system.hydration"] = f.hydration ?? 5;
    if (Number(doc.system?.value ?? 0) !== Number(f.value ?? 2)) patch["system.value"] = f.value ?? 2;
    if (Number(doc.system?.tier ?? 0) !== Number(f.tier ?? 1)) patch["system.tier"] = f.tier ?? 1;
    const w = f.weight ?? 0.5;
    if (Number(doc.system?.weight ?? 0) !== Number(w)) patch["system.weight"] = w;

    const gw = f.gridW ?? 1;
    const gh = f.gridH ?? 1;
    if (Number(doc.system?.gridW ?? 1) !== gw) patch["system.gridW"] = gw;
    if (Number(doc.system?.gridH ?? 1) !== gh) patch["system.gridH"] = gh;

    if (f.bonus && typeof f.bonus === "object") {
      const next = foundry.utils.deepClone(f.bonus);
      if (JSON.stringify(doc.system?.bonus ?? null) !== JSON.stringify(next)) {
        patch["system.bonus"] = next;
      }
    }

    const needsCatalogFlag = Boolean(f.id && (!cid || cid !== f.id));
    if (needsCatalogFlag) {
      const flags = foundry.utils.deepClone(doc.flags ?? {});
      flags["iron-hills-system"] = {
        ...(flags["iron-hills-system"] ?? {}),
        catalogId: f.id,
      };
      patch.flags = flags;
    }

    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | Компендиум еды: обновлено записей ${updated} из ${docs.length}.`);
  return { updated, total: docs.length };
}


function spellToItem(s) {
  const SCHOOL_IMGS = {
    fire:      "icons/magic/fire/flame-burning-campfire-orange.webp",
    ice:       "icons/magic/water/ice-block-frozen-mountain.webp",
    lightning: "icons/magic/lightning/bolt-strike-blue.webp",
    shadow:    "icons/magic/unholy/orb-glowing-green.webp",
    light:     "icons/magic/holy/projectile-orb-yellow.webp",
    earth:     "icons/magic/earth/projectile-boulder-brown.webp",
    mind:      "icons/magic/symbols/rune-sigil-purple-pink.webp",
    summon:    "icons/magic/life/cross-worn-green.webp",
  };
  return {
    name: s.label,
    type: "spell",
    img:  SCHOOL_IMGS[s.school] ?? "icons/magic/symbols/rune-sigil-purple-pink.webp",
    system: {
      tier:       s.rank,
      spellId:    s.id,
      school:     s.school,
      rank:       s.rank,
      manaCost:   s.manaCost,
      castTime:   s.castTime,
      damage:     s.damage     ?? 0,
      damageType: s.damageType ?? "magical",
      effectType: Number(s.damage ?? 0) > 0 ? "damage" : (s.effect?.special === "heal" ? "heal" : ""),
      power:      Number(s.damage ?? 0) > 0 ? Number(s.damage ?? 0) : Number(s.effect?.healAmount ?? 0),
      targetPart: s.targetPart ?? s.targetZone ?? "torso",
      targetZone: s.targetZone ?? s.targetPart ?? "",
      friendlyFire: Boolean(s.friendlyFire ?? false),
      actionType: "",
      applicationScope: s.aoe ? "area" : "targeted",
      targetActorMode: s.aoe ? "area" : "selected-only",
      desc:       s.desc       ?? "",
      aoe:        s.aoe        ?? null,
      value:      s.rank * 50,
      weight:     0,
      quantity:   1,
    }
  };
}

/**
 * Приводит записи ih-npc (если остались вручную) к specialization; выравнивает лут:
 * таблицы сброшены (добыча/карман с листа), явные ключи перезапишутся при forceLoot или рассогласовании.
 * Консоль: await game.ironHills.syncNpcPackLootFromProfiles({ forceLoot: true })
 *
 * @param {{ forceLoot?: boolean }} options — forceLoot: переписать лут даже при совпадении с каноном
 */
export async function syncNpcPackLootFromProfiles(options = {}) {
  const forceLoot = !!options.forceLoot;
  if (!game?.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать NPC-компендиум.");
    return { updated: 0, scanned: 0 };
  }
  const pack = game.packs.get("iron-hills-system.ih-npc");
  if (!pack) {
    ui.notifications.error("Пак ih-npc не найден.");
    return { updated: 0, scanned: 0 };
  }
  await pack.configure({ locked: false });
  const docs = await pack.getDocuments();
  let updated = 0;
  let scanned = 0;

  for (const doc of docs) {
    if (doc.type !== "npc") continue;
    scanned++;
    const key = resolveNpcProfileKey(doc);
    if (!key) continue;
    const prof = NPC_ROLE_PROFILES[key];
    if (!prof) continue;

    const tier = Math.max(1, Math.min(10, Number(doc.system?.info?.tier ?? 1)));
    const wantLoot = "";
    const wantPick = "";
    const curLoot = String(doc.system?.info?.lootTable ?? "").trim();
    const curPick = String(doc.system?.info?.pickpocketTable ?? "").trim();
    const spec = String(doc.system?.info?.specialization ?? "").trim();
    const label = String(doc.system?.info?.role ?? "").trim();
    const labelBad = label !== prof.label;
    const specBad = spec !== key;
    const needLootRebuild =
      forceLoot || curLoot !== wantLoot || curPick !== wantPick || labelBad || specBad;

    const patch = {};
    if (needLootRebuild) {
      patch["system.info.lootTable"] = wantLoot;
      patch["system.info.allowPickpocket"] = true;
      patch["system.info.pickpocketTable"] = wantPick;
    }
    if (specBad) patch["system.info.specialization"] = key;
    if (labelBad) patch["system.info.role"] = prof.label;
    if (Object.keys(patch).length) {
      await doc.update(patch);
      updated++;
    }
  }

  ui.notifications.info(`Iron Hills | ih-npc: обновлено ${updated} из ${scanned} NPC.`);
  return { updated, scanned };
}

const IH_MONSTERS_PACK = "iron-hills-system.ih-monsters";

/**
 * Совмещает компендиум монстров с `MONSTER_BESTIARY` (= одному промпту на строку в monsters-prompts.md):
 * удаляет записи без известного id, дубликаты ключей и лишнее; добавляет недостающих.
 *
 * Консоль (GM): `await game.ironHills.syncMonsterPackToBestiary()`
 *
 * @param {{ patchFields?: boolean }} [options] patchFields: lootPool / bestiaryId / role + слоты разделки по бестиарию (по умолчанию true)
 */
export async function syncMonsterPackToBestiary(options = {}) {
  const patchFields = options.patchFields !== false;

  if (!game?.user?.isGM) {
    ui.notifications.warn("Только GM может синхронизировать компендиум монстров.");
    return { deleted: 0, created: 0, patched: 0, canon: 0 };
  }
  const pack = game.packs.get(IH_MONSTERS_PACK);
  if (!pack) {
    ui.notifications.error("Пак ih-monsters не найден.");
    return { deleted: 0, created: 0, patched: 0, canon: 0 };
  }
  await pack.configure({ locked: false });

  const cls = pack.documentClass;
  const docs = await pack.getDocuments();

  const byKey = new Map();
  const surplus = [];

  for (const doc of docs) {
    if (doc.type !== "monster") {
      surplus.push(doc);
      continue;
    }
    const key = resolveMonsterPackDocToBestiaryId(doc);
    if (!key) {
      surplus.push(doc);
      continue;
    }
    if (byKey.has(key)) {
      surplus.push(doc);
      continue;
    }
    byKey.set(key, doc);
  }

  let deleted = 0;
  for (const doc of surplus) {
    await doc.delete();
    deleted++;
  }

  let created = 0;
  let patched = 0;
  const canonKeys = Object.keys(MONSTER_BESTIARY);

  for (const key of canonKeys) {
    const row = MONSTER_BESTIARY[key];
    let doc = byKey.get(key);
    if (!doc) {
      await cls.create(monsterRowToActorData(row), { pack: IH_MONSTERS_PACK });
      created++;
      continue;
    }
    if (patchFields && row) {
      const patch = {};
      const bid = String(doc.system?.info?.bestiaryId ?? "").trim();
      const role = String(doc.system?.info?.role ?? "").trim();
      const curPool = String(doc.system?.info?.lootPool ?? "").trim();
      const wantPool = String(row.lootPool ?? "").trim();
      const legacyLt = String(doc.system?.info?.lootTable ?? "").trim();
      if (bid !== key) patch["system.info.bestiaryId"] = key;
      if (role !== key) patch["system.info.role"] = key;
      if (wantPool !== curPool) patch["system.info.lootPool"] = wantPool;
      if (legacyLt !== "") patch["system.info.lootTable"] = "";
      const wantTier = Number(row.tier ?? 1);
      if (Number(doc.system?.info?.tier ?? 0) !== wantTier) patch["system.info.tier"] = wantTier;
      const wantImg = row.img ?? doc.img;
      if (wantImg && doc.img !== wantImg) patch.img = wantImg;

      if (Object.keys(patch).length) {
        await doc.update(patch);
        patched++;
      }
      const live = await pack.getDocument(doc.id);
      await replaceMonsterHarvestEmbeddedItems(live, wantPool);
    }
  }

  ui.notifications.info(
    `Iron Hills | ih-monsters: удалено лишних ${deleted}, добавлено ${created}, патч полей ${patched}; в бестиарии всего ${canonKeys.length} (строго под промпты).`
  );
  return { deleted, created, patched, canon: canonKeys.length };
}

export async function buildCompendiums() {
  if (!game.user?.isGM) { ui.notifications.warn("Только GM может заполнять компендиумы."); return; }

  ui.notifications.info("Iron Hills | Заполняем компендиумы...");

  await emptyActorPack("ih-npc");

  const results = await Promise.all([
    fillPack("ih-weapons",     WEAPONS,    weaponToItem),
    fillPack("ih-armor",       ARMORS,     armorToItem),
    fillPack("ih-materials",   MATERIALS,  materialToItem),
    fillPack("ih-potions",     POTIONS,    potionToItem),
    fillPack("ih-food",        FOOD,       foodToItem),
    fillPack("ih-tools",       TOOLS,      toolToItem),
    fillPack("ih-belts",       BELTS,      beltToItem),
    fillPack("ih-backpacks",   BACKPACKS,  backpackToItem),
    fillPack("ih-attachments", ATTACHMENTS,attachmentToItem),
    fillPack("ih-spells",      SPELLS,     spellToItem),
    fillPack("ih-monsters",    MONSTER_BESTIARY, monsterRowToActorData),
    fillPack("ih-consumables", DRINK_VESSELS, (v) => buildDrinkVesselItemData(v.id)),
  ]);

  const total = results.reduce((a,b) => a+b, 0);
  ui.notifications.info(`Iron Hills | Компендиумы заполнены: ${total} записей.`);
  console.log("Iron Hills | Compendiums built:", results);
}

export async function initCompendiums() {
  if (!game.user?.isGM) return;

  // Разблокируем все компендиумы системы чтобы можно было открывать листы
  const packIds = [
    "ih-weapons","ih-armor","ih-materials","ih-potions","ih-spells",
    "ih-food","ih-tools","ih-npc","ih-gods",
    "ih-belts","ih-backpacks","ih-attachments",
    "ih-monsters","ih-consumables",
  ];
  for (const id of packIds) {
    const pack = game.packs.get(`iron-hills-system.${id}`);
    if (pack?.locked) {
      await pack.configure({ locked: false });
    }
  }

  // Проверяем не заполнены ли уже
  const weaponPack = game.packs.get("iron-hills-system.ih-weapons");
  if (!weaponPack) return;

  const docs = await weaponPack.getDocuments();
  if (docs.length > 0) return; // уже заполнено

  console.log("Iron Hills | Первый запуск — заполняем компендиумы...");
  await buildCompendiums();
}
