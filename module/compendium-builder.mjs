/**
 * Iron Hills — Compendium Builder
 * Заполняет компендиумы системы предметами из каталога.
 * Запускается один раз при первом запуске мира (GM).
 * Повторный запуск: game.ironHills.buildCompendiums()
 */

import { MATERIALS, WEAPONS, ARMORS, POTIONS, FOOD, TOOLS, BELTS, BACKPACKS, ATTACHMENTS } from "./constants/items-catalog.mjs";
import { SPELLS } from "./constants/spells-catalog.mjs";
import { NPC_ROLE_PROFILES } from "./constants/npc-profiles.mjs";

// ── Конвертеры из каталога в данные Item ────────────────────

function materialToItem(m) {
  return {
    name: m.label,
    type: "material",
    img:  `icons/commodities/metal/${m.category === 'metal' ? 'ingot-iron' : 'ore'}.webp`,
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
  return {
    name: w.label,
    type: "weapon",
    img:  IMG[w.skill] ?? "icons/weapons/swords/sword-shortsword.webp",
    system: {
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
    }
  };
}

function armorToItem(a) {
  // gridW/gridH по слоту
  const SLOT_GRID = {
    head:{w:2,h:2}, torso:{w:2,h:3}, leftArm:{w:1,h:2}, rightArm:{w:1,h:2},
    legs:{w:2,h:3}, leftHand:{w:2,h:2}, rightHand:{w:2,h:2},
    neck:{w:1,h:1}, ringLeft:{w:1,h:1}, ringRight:{w:1,h:1},
    belt:{w:2,h:1}, backpack:{w:2,h:3},
  };
  const sg = SLOT_GRID[a.slot] ?? {w:2,h:2};
  return {
    name: a.label,
    type: "armor",
    img:  `icons/equipment/chest/breastplate-${a.tier <= 1 ? 'leather' : a.tier <= 3 ? 'steel' : 'metal'}-plain.webp`,
    system: {
      tier:    a.tier,
      quality: "common",
      weight:  a.weight ?? 3,
      quantity: 1,
      gridW:   sg.w,
      gridH:   sg.h,
      slot:    a.slot,
      protection: a.resist ?? { physical: a.tier, magical: 0 },
      value:   a.value ?? 20,
      durability: { value: 50 + a.tier*15, max: 50 + a.tier*15 },
    }
  };
}

function potionToItem(p) {
  return {
    name: p.label,
    type: "potion",
    img:  "icons/consumables/potions/potion-round-empty-green.webp",
    system: {
      tier:    p.tier,
      quality: "common",
      weight:  p.weight ?? 0.3,
      quantity: 1,
      effect:  p.effect  ?? "healHP",
      power:   p.power   ?? 5,
      scope:   "single",
      target:  "self",
      zone:    "torso",
      value:   p.value   ?? 20,
    }
  };
}

function foodToItem(f) {
  return {
    name: f.label,
    type: "food",
    img:  "icons/consumables/food/bread-loaf-round-brown.webp",
    system: {
      tier:      f.tier ?? 1,
      quality:   "common",
      weight:    f.weight  ?? 0.5,
      quantity:  1,
      satiety:   f.satiety  ?? 10,
      hydration: f.hydration ?? 5,
      value:     f.value    ?? 2,
    }
  };
}

function toolToItem(t) {
  return {
    name: t.label,
    type: "tool",
    img:  "icons/tools/hand/hammer-claw-black.webp",
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
  return {
    name: a.label, type: "attachment",
    img:  "icons/equipment/waist/pouch-belt-large-tan.webp",
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
    }
  };
}

function beltToItem(b) {
  return {
    name: b.label, type: "belt",
    img:  "icons/equipment/waist/belt-thick-wrapped-brown.webp",
    system: {
      tier: b.tier, quality:"common", weight:b.weight ?? 0.5,
      quantity:1, value:b.value ?? 10,
      gridW: b.gridW ?? 2, gridH: b.gridH ?? 1,
      containerSlots: b.containerSlots ?? {cols:3,rows:1},
      attachmentSlots: b.attachmentSlots ?? [],
      weightFactor: b.weightFactor ?? 1.0,
      description: b.desc ?? "",
      durability:{value:25,max:25},
    }
  };
}

function backpackToItem(b) {
  return {
    name: b.label, type: "backpack",
    img:  "icons/containers/bags/pack-simple-leather-tan.webp",
    system: {
      tier: b.tier, quality:"common", weight:b.weight ?? 1,
      quantity:1, value:b.value ?? 20,
      gridW: b.gridW ?? 2, gridH: b.gridH ?? 3,
      containerSlots: b.containerSlots ?? {cols:5,rows:6},
      attachmentSlots: b.attachmentSlots ?? [],
      weightFactor: b.weightFactor ?? 0.9,
      description: b.desc ?? "",
      durability:{value:30,max:30},
    }
  };
}

function npcProfileToActor(key, profile) {
  return {
    name:   profile.label,
    type:   "npc",
    img:    profile.isCreature
      ? "icons/creatures/mammals/wolf-shadow-black.webp"
      : "icons/svg/mystery-man.svg",
    system: {
      info: {
        tier:   profile.tier ?? 1,
        role:   key,
        desc:   profile.desc ?? "",
      },
      resources: {
        energy:    { value: profile.energy ?? 10, max: profile.energy ?? 10 },
        mana:      { value: profile.mana   ?? 5,  max: profile.mana   ?? 5  },
        hp: {
          head:     { value:5, max:5 },
          torso:    { value:10, max:10 },
          abdomen:  { value:8, max:8 },
          leftArm:  { value:6, max:6 },
          rightArm: { value:6, max:6 },
          leftLeg:  { value:7, max:7 },
          rightLeg: { value:7, max:7 },
        }
      },
      skills: Object.fromEntries(
        Object.entries(profile.skills ?? {}).map(([k,v]) => [k, { value:v, exp:0 }])
      ),
    }
  };
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
      const data = converter(raw);
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
      desc:       s.desc       ?? "",
      aoe:        s.aoe        ?? null,
      value:      s.rank * 50,
      weight:     0,
      quantity:   1,
    }
  };
}

export async function buildCompendiums() {
  if (!game.user?.isGM) { ui.notifications.warn("Только GM может заполнять компендиумы."); return; }

  ui.notifications.info("Iron Hills | Заполняем компендиумы...");

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
    fillPack("ih-npc",         NPC_ROLE_PROFILES, (v) => npcProfileToActor(v.id ?? 'npc', v)),
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
    "ih-food","ih-tools","ih-npc","ih-gods"
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
