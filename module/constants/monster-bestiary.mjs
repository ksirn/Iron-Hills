/**
 * Бестиарий (тип актёра monster): по 3 особи на тир 1–10 и пул разделки по инвентарю.
 */
import { MONSTER_HARVEST_DROP_POOLS } from "./monster-loot-pools.mjs";

export function allocateMonsterHpParts(pool) {
  const p = Math.max(8, Math.round(Number(pool) || 24));
  const head = Math.max(1, Math.round(p * 0.10));
  let torso = Math.max(3, Math.round(p * 0.30));
  let abdomen = Math.max(2, Math.round(p * 0.20));
  const arm = Math.max(2, Math.round(p * 0.09));
  const leg = Math.max(2, Math.round(p * 0.10));
  const sum = head + torso + abdomen + arm * 2 + leg * 2;
  const fix = p - sum;
  torso = Math.max(3, torso + fix);
  const mk = (v) => ({ value: v, max: v });
  return {
    head: mk(head),
    torso: mk(torso),
    abdomen: mk(abdomen),
    leftArm: mk(arm),
    rightArm: mk(arm),
    leftLeg: mk(leg),
    rightLeg: mk(leg),
  };
}

function cb(tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  const baseThreshold = Math.min(12, 3 + Math.floor(t / 2));
  return {
    baseThreshold,
    unarmedDamage: Math.round(7 + t * 5),
    unarmedSkill: Math.min(8, 2 + Math.floor(t / 2)),
    attackSkill: Math.min(9, 2 + Math.floor((t + 1) / 2)),
  };
}

export const MONSTER_TOKEN_IMAGES = Object.freeze({
  briar_troll_bud: "systems/iron-hills-system/icons/tokens/monsters/briar_troll_bud.webp",
  pitbone_horror: "systems/iron-hills-system/icons/tokens/monsters/pitbone_horror.webp",
  wyvern_fledgling: "systems/iron-hills-system/icons/tokens/monsters/wyvern_fledgling.webp",
});

function monsterTokenImage(id, fallback) {
  return MONSTER_TOKEN_IMAGES[id] ?? fallback;
}

export const MONSTER_BESTIARY = {
  // ── Тир 1 ──────────────────────────────────────
  ash_rot_mites: {
    id: "ash_rot_mites",
    label: "Гнильный рой‑клещ",
    tier: 1,
    hpPool: 28,
    img: "icons/creatures/invertebrates/spider-striped-red.webp",
    lootPool: "vermin_bundle_t1",
    initiative: 8,
    energy: 6,
    mana: 0,
    armor: { physical: 0, magical: 0 },
    combat: { ...cb(1), baseThreshold: 3 },
    skills: { knife: 1 },
    desc: "Слизистый многоножковый рой из пепельных отвалов; мало мяса, годны для простых реагентов.",
  },
  briar_rat_boss: {
    id: "briar_rat_boss",
    label: "Крысиный вожак колючника",
    tier: 1,
    hpPool: 32,
    img: "icons/creatures/mammals/rat-brown.webp",
    lootPool: "predator_scrap_t1",
    initiative: 10,
    energy: 10,
    mana: 0,
    armor: { physical: 0, magical: 0 },
    combat: cb(1),
    skills: { knife: 2, endurance: 1 },
    desc: "Стаейный падальщик дорогих кустарников; шкура в грязи, но узнаваема.",
  },
  scrap_hound_runner: {
    id: "scrap_hound_runner",
    label: "Хламовый гончар",
    tier: 1,
    hpPool: 34,
    img: "icons/creatures/mammals/wolf-shadow-black.webp",
    lootPool: "predator_scrap_t1",
    initiative: 11,
    energy: 12,
    mana: 0,
    armor: { physical: 1, magical: 0 },
    combat: { ...cb(1), baseThreshold: 4 },
    skills: { knife: 2, perception: 1 },
    desc: "Полудикая собака шахтёрских отвалов, чует руду по старому железу.",
  },

  // ── Тир 2 ──────────────────────────────────────
  fen_slitherer: {
    id: "fen_slitherer",
    label: "Топкая змеень",
    tier: 2,
    hpPool: 42,
    img: "icons/creatures/reptiles/snake-brown.webp",
    lootPool: "wetland_glean_t2",
    initiative: 8,
    energy: 10,
    mana: 0,
    armor: { physical: 0, magical: 0 },
    combat: cb(2),
    skills: { knife: 1 },
    desc: "Низкая змея топей; желчь слабеет на солнце.",
  },
  peat_adder_pair: {
    id: "peat_adder_pair",
    label: "Торфяной гремучник",
    tier: 2,
    hpPool: 46,
    img: "icons/creatures/reptiles/lizard-purple.webp",
    lootPool: "wetland_glean_t2",
    initiative: 8,
    energy: 10,
    mana: 2,
    armor: { physical: 2, magical: 0 },
    combat: cb(2),
    skills: { knife: 2, stealth: 1 },
    desc: "Пара охотничьего размера с ядовитыми узорами между чешуйками.",
  },
  tunnel_fung_batch: {
    id: "tunnel_fung_batch",
    label: "Рой шахтёрской мерзости",
    tier: 2,
    hpPool: 44,
    img: "icons/creatures/magical/beholder-single-eye-purple.webp",
    lootPool: "vermin_bundle_t1",
    initiative: 9,
    energy: 8,
    mana: 6,
    armor: { physical: 2, magical: 1 },
    combat: cb(2),
    skills: { light: 1 },
    desc: "Сгусток гриба и камня живёт у малых узлов маны под шахтой.",
  },

  // ── Тир 3 ──────────────────────────────────────
  root_gnaw_bear: {
    id: "root_gnaw_bear",
    label: "Корнеед‑медвежий",
    tier: 3,
    hpPool: 62,
    img: "icons/creatures/mammals/bear-brown.webp",
    lootPool: "brute_carve_t2",
    initiative: 6,
    energy: 16,
    mana: 0,
    armor: { physical: 5, magical: 0 },
    combat: cb(3),
    skills: { unarmed: 2, athletics: 1 },
    desc: "Пухлый падальщик меж корней; шкуры грубы, но питательны.",
  },
  marsh_beta_wolf: {
    id: "marsh_beta_wolf",
    label: "Болотный вожак‑волк",
    tier: 3,
    hpPool: 58,
    img: "icons/creatures/mammals/wolf-white.webp",
    lootPool: "pack_leader_t3",
    initiative: 12,
    energy: 14,
    mana: 4,
    armor: { physical: 3, magical: 2 },
    combat: cb(3),
    skills: { knife: 3, perception: 2 },
    desc: "Вожак стаи; железы сильнее обычного дичка.",
  },
  glade_longtooth: {
    id: "glade_longtooth",
    label: "Полевой длиннозуб",
    tier: 3,
    hpPool: 56,
    img: "icons/creatures/mammals/cat-large-panther.webp",
    lootPool: "pack_leader_t3",
    initiative: 13,
    energy: 16,
    mana: 0,
    armor: { physical: 2, magical: 0 },
    combat: cb(3),
    skills: { stealth: 2, knife: 3 },
    desc: "Прыгуны лесных полян; охотники ценят сухожилия.",
  },

  // ── Тир 4 ──────────────────────────────────────
  wyvern_fledgling: {
    id: "wyvern_fledgling",
    label: "Виверн‑птенец",
    tier: 4,
    hpPool: 86,
    img: monsterTokenImage("wyvern_fledgling", "icons/creatures/avian/drake-green.webp"),
    lootPool: "apex_slice_t4",
    initiative: 11,
    energy: 20,
    mana: 14,
    armor: { physical: 7, magical: 4 },
    combat: cb(4),
    skills: { spear: 2 },
    desc: "Молодые крылатые падальщики; чешуя пока нежнее взрослой.",
  },
  rustfang_worg_band: {
    id: "rustfang_worg_band",
    label: "Стая ржавых клыков",
    tier: 4,
    hpPool: 82,
    img: "icons/creatures/mammals/worg-red.webp",
    lootPool: "apex_slice_t4",
    initiative: 10,
    energy: 18,
    mana: 6,
    armor: { physical: 9, magical: 2 },
    combat: cb(4),
    skills: { knife: 4 },
    desc: "Собачьи загоны рудников; шерсть густая, с железными вкраплениями.",
  },
  briar_troll_bud: {
    id: "briar_troll_bud",
    label: "Поросль шипастого тролля",
    tier: 4,
    hpPool: 92,
    img: monsterTokenImage("briar_troll_bud", "icons/creatures/humanoids/giant-troll.webp"),
    lootPool: "apex_slice_t4",
    initiative: 5,
    energy: 22,
    mana: 0,
    armor: { physical: 11, magical: 1 },
    combat: cb(4),
    skills: { mace: 3 },
    desc: "Косолапый юнец большого рода троллей из колючих зарослей.",
  },

  // ── Тир 5 ──────────────────────────────────────
  elder_thorn_sentinel: {
    id: "elder_thorn_sentinel",
    label: "Старый браменный часовой",
    tier: 5,
    hpPool: 108,
    img: "icons/creatures/magical/tree-face-orange.webp",
    lootPool: "brute_prize_t5",
    initiative: 4,
    energy: 18,
    mana: 22,
    armor: { physical: 15, magical: 9 },
    combat: cb(5),
    skills: { earth: 2, axe: 3 },
    desc: "Полурастение‑хранитель торфов и грибных коридоров.",
  },
  river_maw_spawn: {
    id: "river_maw_spawn",
    label: "Порождение речной пасти",
    tier: 5,
    hpPool: 102,
    img: "icons/creatures/magical/thorns-poison-purple.webp",
    lootPool: "brute_prize_t5",
    initiative: 6,
    energy: 26,
    mana: 26,
    armor: { physical: 9, magical: 15 },
    combat: cb(5),
    skills: { ice: 2, knife: 3 },
    desc: "Слякотный хищник фарватеров и промоин.",
  },
  gorge_stone_lurker: {
    id: "gorge_stone_lurker",
    label: "Каменный подкрад ущелья",
    tier: 5,
    hpPool: 118,
    img: "icons/creatures/magical/beholder-single-eye-purple.webp",
    lootPool: "brute_prize_t5",
    initiative: 3,
    energy: 14,
    mana: 18,
    armor: { physical: 18, magical: 6 },
    combat: cb(5),
    skills: { unarmed: 4, earth: 2 },
    desc: "Сшит из обломков и смолы русла — тяжёлый каменный хищник.",
  },

  // ── Тир 6 ──────────────────────────────────────
  ridge_wyvern: {
    id: "ridge_wyvern",
    label: "Гребнеспинная виверна",
    tier: 6,
    hpPool: 148,
    img: "icons/creatures/avian/drake-blue.webp",
    lootPool: "kaiju_shard_t6",
    initiative: 13,
    energy: 32,
    mana: 32,
    armor: { physical: 18, magical: 16 },
    combat: cb(6),
    skills: { spear: 5 },
    desc: "Взрослая охотница среди кряжей и утёсов.",
  },
  ironhide_ram: {
    id: "ironhide_ram",
    label: "Железношёрстный таран",
    tier: 6,
    hpPool: 155,
    img: "icons/creatures/mammals/boar-brown.webp",
    lootPool: "kaiju_shard_t6",
    initiative: 7,
    energy: 28,
    mana: 0,
    armor: { physical: 24, magical: 4 },
    combat: cb(6),
    skills: { mace: 5, athletics: 3 },
    desc: "Наросты руды по хребту — топор нужен основательнее.",
  },
  obsidian_skerry_swarm: {
    id: "obsidian_skerry_swarm",
    label: "Обсидиановый шквал‑жук",
    tier: 6,
    hpPool: 132,
    img: "icons/creatures/invertebrates/ant-giant-red.webp",
    lootPool: "kaiju_shard_t6",
    initiative: 14,
    energy: 20,
    mana: 20,
    armor: { physical: 10, magical: 18 },
    combat: cb(6),
    skills: { fire: 2, perception: 3 },
    desc: "Самосветящийся летающий рой — жало греется до раскала.",
  },

  // ── Тир 7 ──────────────────────────────────────
  cliffshade_griffon: {
    id: "cliffshade_griffon",
    label: "Тенегриф утёсов",
    tier: 7,
    hpPool: 175,
    img: "icons/creatures/avian/harpy-green.webp",
    lootPool: "beast_lord_t7",
    initiative: 14,
    energy: 38,
    mana: 24,
    armor: { physical: 20, magical: 22 },
    combat: cb(7),
    skills: { spear: 5, athletics: 4 },
    desc: "Когти царапают камень; тень от крыла режет вертикаль скалы.",
  },
  pitbone_horror: {
    id: "pitbone_horror",
    label: "Костяная тварь ямы",
    tier: 7,
    hpPool: 188,
    img: monsterTokenImage("pitbone_horror", "icons/creatures/unholy/abomination.webp"),
    lootPool: "beast_lord_t7",
    initiative: 5,
    energy: 22,
    mana: 30,
    armor: { physical: 26, magical: 10 },
    combat: cb(7),
    skills: { mace: 5, endurance: 4 },
    desc: "Скопище черепов и сухожилий, шевелящееся разом как одно.",
  },
  ash_ember_larva_colossus: {
    id: "ash_ember_larva_colossus",
    label: "Пепельный гигант‑личинка",
    tier: 7,
    hpPool: 165,
    img: "icons/creatures/amphibians/frog-purple.webp",
    lootPool: "beast_lord_t7",
    initiative: 4,
    energy: 34,
    mana: 40,
    armor: { physical: 14, magical: 20 },
    combat: cb(7),
    skills: { fire: 4, knife: 2 },
    desc: "Ползущий жар между шлаковыми кучами; шкура курится сама собой.",
  },

  // ── Тир 8 ──────────────────────────────────────
  frostgrave_direwolf: {
    id: "frostgrave_direwolf",
    label: "Морозный великоволк",
    tier: 8,
    hpPool: 210,
    img: "icons/creatures/mammals/wolf-white.webp",
    lootPool: "beast_lord_t8",
    initiative: 15,
    energy: 40,
    mana: 36,
    armor: { physical: 22, magical: 26 },
    combat: cb(8),
    skills: { knife: 6, stealth: 3 },
    desc: "Низкий вой обмерзших туманностей по ночному полю.",
  },
  ravine_basalt_walker: {
    id: "ravine_basalt_walker",
    label: "Базальтовый странник ущелья",
    tier: 8,
    hpPool: 238,
    img: "icons/creatures/humanoids/giant-earth.webp",
    lootPool: "beast_lord_t8",
    initiative: 2,
    energy: 20,
    mana: 28,
    armor: { physical: 32, magical: 14 },
    combat: cb(8),
    skills: { earth: 5, unarmed: 5 },
    desc: "Ступени из плит, срастаются с утёсом при каждом шаге.",
  },
  stormbreak_idol_golem: {
    id: "stormbreak_idol_golem",
    label: "Буреломный идол‑голем",
    tier: 8,
    hpPool: 226,
    img: "icons/creatures/humanoids/golem-clay-brown.webp",
    lootPool: "beast_lord_t8",
    initiative: 3,
    energy: 26,
    mana: 22,
    armor: { physical: 30, magical: 20 },
    combat: cb(8),
    skills: { lightning: 3, axe: 5 },
    desc: "Статуя времен старых шахт‑святынь, пробуждена бурей.",
  },

  // ── Тир 9 ──────────────────────────────────────
  starfur_ursine: {
    id: "starfur_ursine",
    label: "Звёздношёрстный медведь",
    tier: 9,
    hpPool: 275,
    img: "icons/creatures/mammals/bear-brown.webp",
    lootPool: "beast_lord_t9",
    initiative: 8,
    energy: 52,
    mana: 48,
    armor: { physical: 28, magical: 32 },
    combat: cb(9),
    skills: { unarmed: 7, athletics: 5 },
    desc: "Свет точек на шкурном полотне кружится после заката.",
  },
  phantom_knight_mount: {
    id: "phantom_knight_mount",
    label: "Скверноконный рыцарь‑зрак",
    tier: 9,
    hpPool: 268,
    img: "icons/creatures/mammals/worg-shadow-black.webp",
    lootPool: "beast_lord_t9",
    initiative: 12,
    energy: 36,
    mana: 54,
    armor: { physical: 30, magical: 30 },
    combat: cb(9),
    skills: { sword: 6, spear: 4 },
    desc: "Слипшийся образ коня и костей в дымчатой бронепластине.",
  },
  cauldr_edge_drakebond: {
    id: "cauldr_edge_drakebond",
    label: "Краевой надсмотрщик‑змеедракон",
    tier: 9,
    hpPool: 260,
    img: "icons/creatures/avian/drake-red.webp",
    lootPool: "beast_lord_t9",
    initiative: 11,
    energy: 48,
    mana: 50,
    armor: { physical: 26, magical: 34 },
    combat: cb(9),
    skills: { spear: 7, fire: 4 },
    desc: "Хранит стык жаровни и рудного пласта; дыхание жжёт шлак.",
  },

  // ── Тир 10 ──────────────────────────────────────
  worldspine_serpent: {
    id: "worldspine_serpent",
    label: "Змей мирового остова",
    tier: 10,
    hpPool: 340,
    img: "icons/creatures/reptiles/snake-green-brown.webp",
    lootPool: "primordial_harvest_t10",
    initiative: 6,
    energy: 60,
    mana: 70,
    armor: { physical: 38, magical: 36 },
    combat: cb(10),
    skills: { earth: 7, spear: 6 },
    desc: "Длина затмевает хребет; чешуйка как кровати настила.",
  },
  ashridge_colossus: {
    id: "ashridge_colossus",
    label: "Колосс Пепельного хребта",
    tier: 10,
    hpPool: 395,
    img: "icons/creatures/humanoids/giant-troll.webp",
    lootPool: "primordial_harvest_t10",
    initiative: 4,
    energy: 40,
    mana: 20,
    armor: { physical: 45, magical: 18 },
    combat: cb(10),
    skills: { mace: 8, axe: 6 },
    desc: "Горячий титан между заводями шлака и старыми печами.",
  },
  vein_gullet_leviathan: {
    id: "vein_gullet_leviathan",
    label: "Пожиратель рудных жил",
    tier: 10,
    hpPool: 368,
    img: "icons/creatures/mammals/worg-red.webp",
    lootPool: "primordial_harvest_t10",
    initiative: 5,
    energy: 52,
    mana: 64,
    armor: { physical: 42, magical: 40 },
    combat: cb(10),
    skills: { fire: 6, endurance: 6 },
    desc: "Рот как штрек; глушит залежи голым жаром и голодом.",
  },
};

export function resolveMonsterPackDocToBestiaryId(doc) {
  if (!doc || doc.type !== "monster") return null;
  const bid = String(doc.system?.info?.bestiaryId ?? "").trim();
  if (bid && MONSTER_BESTIARY[bid]) return bid;
  const role = String(doc.system?.info?.role ?? "").trim();
  if (role && MONSTER_BESTIARY[role]) return role;
  const name = String(doc.name ?? "").trim();
  const hit = Object.values(MONSTER_BESTIARY).find((r) => r.label === name);
  return hit?.id ?? null;
}

export function assertMonsterLootBindings() {
  for (const m of Object.values(MONSTER_BESTIARY)) {
    const t = m.lootPool;
    if (!MONSTER_HARVEST_DROP_POOLS[t]?.length) {
      console.warn(`Iron Hills | Бестиарий ${m.id}: неизвестный или пустой пул добычи «${t}»`);
    }
  }
}

export function monsterBestiaryKeysByTier(tier) {
  const ti = Number(tier);
  return Object.values(MONSTER_BESTIARY)
    .filter(m => Number(m.tier) === ti)
    .map(m => m.id);
}

export function resolveMonsterHpPartsFromActor(monsterActor) {
  const hid = monsterActor?.system?.info?.bestiaryId;
  let pool = monsterActor?.system?.resources?.hp?.torso?.max;
  pool = Number(pool);
  const row = MONSTER_BESTIARY[hid ?? ""];
  if (Number.isFinite(row?.hpPool)) return allocateMonsterHpParts(row.hpPool);
  const sum = monsterActor?.system?.resources?.hp
    ? Object.values(monsterActor.system.resources.hp).reduce(
      (acc, z) => acc + Number(z?.max ?? 0), 0
    )
    : 0;
  if (sum > 0) return monsterActor.system.resources.hp;
  return allocateMonsterHpParts(Number.isFinite(pool) ? pool : 40);
}
