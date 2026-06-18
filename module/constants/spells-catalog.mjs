/**
 * Iron Hills — Spells Catalog
 * Заклинания по школам и рангам.
 *
 * aoe: {
 *   type:     "blast" | "pierce" | "sweep" | "shards" | "chain" | "nova"
 *   shape:    "circle" | "cone" | "ray" | "rect"
 *   distance: клеток
 *   maxTargets: максимум целей (undefined = все)
 * }
 *
 * friendlyFire: boolean — если true, AoE задевает союзников (по token disposition).
 *   По умолчанию — false. Полезно для массовых заклинаний типа "Метеор", где
 *   ущерб слепой и режиссируется именно "ковровым" поражением.
 */

export const SPELL_SCHOOLS = {
  fire:       { id:"fire",       label:"Огонь",    icon:"🔥", color:"#ff4400" },
  ice:        { id:"ice",        label:"Лёд",       icon:"❄️", color:"#88ccff" },
  lightning:  { id:"lightning",  label:"Молния",   icon:"⚡", color:"#ffee44" },
  shadow:     { id:"shadow",     label:"Тьма",     icon:"🌑", color:"#6600aa" },
  light:      { id:"light",      label:"Свет",     icon:"✨", color:"#ffee99" },
  earth:      { id:"earth",      label:"Земля",    icon:"🪨", color:"#886633" },
  mind:       { id:"mind",       label:"Разум",    icon:"🧠", color:"#cc88ff" },
  summon:     { id:"summon",     label:"Призыв",   icon:"👻", color:"#44aa88" },
};

export const SPELL_SCHOOL_KEYS = Object.freeze(Object.keys(SPELL_SCHOOLS));

export const SPELL_SCHOOL_ALIASES = Object.freeze({
  water: "ice",
  air: "lightning",
  life: "light",
  holy: "light",
});

export function normalizeSpellSchoolKey(school, { fallback = "" } = {}) {
  const key = String(school ?? "").trim();
  if (!key) return fallback;
  if (SPELL_SCHOOLS[key]) return key;
  return SPELL_SCHOOL_ALIASES[key] ?? fallback;
}

const SPELL_IMAGE_BY_SCHOOL = Object.freeze({
  fire: "systems/iron-hills-system/icons/items/spells/fire_bolt.webp",
  ice: "systems/iron-hills-system/icons/items/spells/ice_shard.webp",
  lightning: "systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp",
  shadow: "systems/iron-hills-system/icons/items/spells/shadow_bolt.webp",
  light: "systems/iron-hills-system/icons/items/spells/holy_smite.webp",
  earth: "systems/iron-hills-system/icons/items/spells/stone_throw.webp",
  mind: "systems/iron-hills-system/icons/items/spells/haste_spell.webp",
  summon: "systems/iron-hills-system/icons/items/spells/summon_skeleton.webp",
});

const BASE_SPELLS = {

  // ══════════════════════════════════════════════════════════
  // ОГОНЬ
  // ══════════════════════════════════════════════════════════
  fire_bolt: {
    id:"fire_bolt", label:"Огненный Bolt", school:"fire", rank:1,
    manaCost:2, castTime:2, damage:20, damageType:"fire",
    desc:"Сгусток огня в одну цель.",
    aoe: null,
    effect: null, img:"systems/iron-hills-system/icons/items/spells/fire_bolt.webp" },
  burning_hands: {
    id:"burning_hands", label:"Горящие руки", school:"fire", rank:2,
    manaCost:4, castTime:3, damage:30, damageType:"fire",
    desc:"Конус огня прямо перед кастером. Бросок на каждого в зоне.",
    aoe: { type:"blast", shape:"cone", distance:3, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"burning", conditionDuration:12, conditionChance:0.5 }, img:"systems/iron-hills-system/icons/items/spells/burning_hands.webp" },
  fireball: {
    id:"fireball", label:"Огненный Шар", school:"fire", rank:4,
    manaCost:8, castTime:4, damage:60, damageType:"fire",
    desc:"Взрыв в точке. Все в радиусе 3 клеток — бросок на каждого.",
    aoe: { type:"blast", shape:"circle", distance:3, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"burning", conditionDuration:6, conditionChance:0.4 }, img:"systems/iron-hills-system/icons/items/spells/fireball.webp" },
  fire_wall: {
    id:"fire_wall", label:"Стена Огня", school:"fire", rank:5,
    manaCost:10, castTime:5, damage:40, damageType:"fire",
    desc:"Линия огня. Каждый кто пройдёт — получает урон.",
    aoe: { type:"blast", shape:"ray", distance:5, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"burning", conditionDuration:6, conditionChance:0.6 }, img:"systems/iron-hills-system/icons/items/spells/fire_wall.webp" },
  meteor: {
    id:"meteor", label:"Метеор", school:"fire", rank:8,
    manaCost:20, castTime:8, damage:150, damageType:"fire",
    desc:"Метеор падает в точку. Огромная зона, огромный урон.",
    aoe: { type:"blast", shape:"circle", distance:5, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"burning", conditionDuration:30, conditionChance:0.8 }, img:"systems/iron-hills-system/icons/items/spells/meteor.webp" },

  // ══════════════════════════════════════════════════════════
  // ЛЁДID
  // ══════════════════════════════════════════════════════════
  ice_shard: {
    id:"ice_shard", label:"Ледяной Осколок", school:"ice", rank:1,
    manaCost:2, castTime:2, damage:25, damageType:"ice",
    desc:"Осколок льда в одну цель. Шанс замедлить.",
    aoe: null,
    effect: { applyCondition:"slowed", conditionDuration:6, conditionChance:0.4 }, img:"systems/iron-hills-system/icons/items/spells/ice_shard.webp" },
  ice_shards: {
    id:"ice_shards", label:"Ледяные Осколки", school:"ice", rank:3,
    manaCost:6, castTime:3, damage:35, damageType:"ice",
    desc:"4 осколка летят в случайных врагов в зоне. Максимум 4 цели, бросок на каждую.",
    aoe: { type:"shards", shape:"circle", distance:4, maxTargets:4, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"slowed", conditionDuration:6, conditionChance:0.5 }, img:"systems/iron-hills-system/icons/items/spells/ice_shards.webp" },
  frost_nova: {
    id:"frost_nova", label:"Морозная Вспышка", school:"ice", rank:4,
    manaCost:8, castTime:3, damage:30, damageType:"ice",
    desc:"Взрыв льда вокруг кастера. Все в радиусе 2 клеток — заморожены.",
    aoe: { type:"nova", shape:"circle", distance:2, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"stunned", conditionDuration:6, conditionChance:0.7 }, img:"systems/iron-hills-system/icons/items/spells/frost_nova.webp" },
  blizzard: {
    id:"blizzard", label:"Вьюга", school:"ice", rank:6,
    manaCost:14, castTime:6, damage:40, damageType:"ice",
    desc:"Буря в большой зоне. Бросок на каждого каждый раунд 3 раунда.",
    aoe: { type:"blast", shape:"circle", distance:5, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"slowed", conditionDuration:18, conditionChance:0.8 }, img:"systems/iron-hills-system/icons/items/spells/blizzard.webp" },

  // ══════════════════════════════════════════════════════════
  // МОЛНИЯ
  // ══════════════════════════════════════════════════════════
  lightning_bolt_spell: {
    id:"lightning_bolt_spell", label:"Молния", school:"lightning", rank:2,
    manaCost:4, castTime:2, damage:40, damageType:"lightning",
    desc:"Молния пробивает первого врага и летит дальше. Pierce — останавливается на первом.",
    aoe: { type:"pierce", shape:"ray", distance:8, maxTargets:1, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"stunned", conditionDuration:3, conditionChance:0.3 }, img:"systems/iron-hills-system/icons/items/spells/lightning_bolt_spell.webp" },
  chain_lightning: {
    id:"chain_lightning", label:"Цепная Молния", school:"lightning", rank:5,
    manaCost:10, castTime:4, damage:50, damageType:"lightning",
    desc:"Молния прыгает между 4 ближайшими врагами. Урон -20% каждый прыжок.",
    aoe: { type:"chain", shape:"circle", distance:4, maxTargets:4, chainDecay:0.8, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"stunned", conditionDuration:3, conditionChance:0.4 }, img:"systems/iron-hills-system/icons/items/spells/chain_lightning.webp" },
  thunder_clap: {
    id:"thunder_clap", label:"Гром", school:"lightning", rank:3,
    manaCost:6, castTime:3, damage:30, damageType:"lightning",
    desc:"Ударная волна. Sweep — задевает до 3 врагов слева направо.",
    aoe: { type:"sweep", shape:"cone", distance:3, maxTargets:3, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"pushed", conditionChance:0.6 }, img:"systems/iron-hills-system/icons/items/spells/thunder_clap.webp" },

  // ══════════════════════════════════════════════════════════
  // ТЬМА
  // ══════════════════════════════════════════════════════════
  shadow_bolt: {
    id:"shadow_bolt", label:"Тёмный Заряд", school:"shadow", rank:1,
    manaCost:2, castTime:2, damage:25, damageType:"shadow",
    desc:"Тёмная энергия в одну цель. Снижает защиту.",
    aoe: null,
    effect: { applyCondition:"exposed", conditionDuration:6 }, img:"systems/iron-hills-system/icons/items/spells/shadow_bolt.webp" },
  void_burst: {
    id:"void_burst", label:"Взрыв Пустоты", school:"shadow", rank:5,
    manaCost:10, castTime:4, damage:70, damageType:"shadow",
    desc:"Взрыв тёмной энергии вокруг цели.",
    aoe: { type:"blast", shape:"circle", distance:3, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"exposed", conditionDuration:12, conditionChance:0.6 }, img:"systems/iron-hills-system/icons/items/spells/void_burst.webp" },
  drain_life: {
    id:"drain_life", label:"Высасывание Жизни", school:"shadow", rank:4,
    manaCost:8, castTime:3, damage:50, damageType:"shadow",
    desc:"Похищает жизнь — кастер восстанавливает HP равное нанесённому урону.",
    aoe: null,
    effect: { special:"lifesteal" }, img:"systems/iron-hills-system/icons/items/spells/drain_life.webp" },

  // ══════════════════════════════════════════════════════════
  // СВЕТ
  // ══════════════════════════════════════════════════════════
  holy_smite: {
    id:"holy_smite", label:"Праведный Удар", school:"light", rank:2,
    manaCost:4, castTime:2, damage:40, damageType:"holy",
    desc:"Световой удар. Двойной урон нежити.",
    aoe: null,
    effect: { special:"double_vs_undead" }, img:"systems/iron-hills-system/icons/items/spells/holy_smite.webp" },
  healing_wave: {
    id:"healing_wave", label:"Волна Исцеления", school:"light", rank:3,
    manaCost:6, castTime:3, damage:0, damageType:"healing",
    desc:"Лечит всех союзников в радиусе 3 клеток. Бросок на каждого.",
    aoe: { type:"nova", shape:"circle", distance:3, maxTargets:null, friendlyFireMode:"off", targetZoneMode:"fixed", targetZone:"torso" },
    effect: { special:"heal", healAmount:10 }, img:"systems/iron-hills-system/icons/items/spells/healing_wave.webp" },
  divine_wrath: {
    id:"divine_wrath", label:"Божественный Гнев", school:"light", rank:6,
    manaCost:12, castTime:5, damage:90, damageType:"holy",
    desc:"Луч света бьёт всех врагов в линии. Pierce — проходит насквозь.",
    aoe: { type:"blast", shape:"ray", distance:10, maxTargets:null, friendlyFireMode:"off", targetZoneMode:"random" },
    effect: { applyCondition:"stunned", conditionDuration:6, conditionChance:0.5 }, img:"systems/iron-hills-system/icons/items/spells/divine_wrath.webp" },

  // ══════════════════════════════════════════════════════════
  // ЗЕМЛЯ
  // ══════════════════════════════════════════════════════════
  stone_throw: {
    id:"stone_throw", label:"Бросок Камня", school:"earth", rank:1,
    manaCost:2, castTime:2, damage:30, damageType:"physical",
    desc:"Магический камень в одну цель. Шанс оглушить.",
    aoe: null,
    effect: { applyCondition:"stunned", conditionDuration:3, conditionChance:0.3 }, img:"systems/iron-hills-system/icons/items/spells/stone_throw.webp" },
  earthquake: {
    id:"earthquake", label:"Землетрясение", school:"earth", rank:7,
    manaCost:16, castTime:6, damage:60, damageType:"physical",
    desc:"Земля трясётся в огромной зоне. Все падают.",
    aoe: { type:"blast", shape:"circle", distance:6, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: { applyCondition:"prone", conditionDuration:6, conditionChance:0.9 }, img:"systems/iron-hills-system/icons/items/spells/earthquake.webp" },
  rock_shards: {
    id:"rock_shards", label:"Каменные Осколки", school:"earth", rank:3,
    manaCost:5, castTime:3, damage:40, damageType:"physical",
    desc:"3 осколка в случайных врагов. Максимум 3 цели.",
    aoe: { type:"shards", shape:"circle", distance:4, maxTargets:3, friendlyFireMode:"auto", targetZoneMode:"random" },
    effect: null, img:"systems/iron-hills-system/icons/items/spells/rock_shards.webp" },

  // ══════════════════════════════════════════════════════════
  // РАЗУМ
  // ══════════════════════════════════════════════════════════
  haste_spell: {
    id:"haste_spell", label:"Ускорение", school:"mind", rank:3,
    manaCost:5, castTime:2, damage:0, damageType:"none",
    desc:"Цель получает состояние Ускорение — время действий вдвое меньше.",
    aoe: null,
    effect: { special:"buff", applyCondition:"hasted", conditionDuration:18 }, img:"systems/iron-hills-system/icons/items/spells/haste_spell.webp" },
  slow_spell: {
    id:"slow_spell", label:"Замедление", school:"mind", rank:2,
    manaCost:4, castTime:2, damage:0, damageType:"none",
    desc:"Цель замедлена — время действий вдвое больше.",
    aoe: null,
    effect: { special:"debuff", applyCondition:"slowed", conditionDuration:18 }, img:"systems/iron-hills-system/icons/items/spells/slow_spell.webp" },
  mass_slow: {
    id:"mass_slow", label:"Массовое Замедление", school:"mind", rank:5,
    manaCost:10, castTime:4, damage:0, damageType:"none",
    desc:"Все враги в зоне замедлены. Бросок воли на сопротивление.",
    aoe: { type:"blast", shape:"circle", distance:4, maxTargets:null, friendlyFireMode:"off", targetZoneMode:"random" },
    effect: { special:"debuff", applyCondition:"slowed", conditionDuration:12 }, img:"systems/iron-hills-system/icons/items/spells/mass_slow.webp" },
  fear: {
    id:"fear", label:"Страх", school:"mind", rank:4,
    manaCost:7, castTime:3, damage:0, damageType:"none",
    desc:"Цель охвачена ужасом — бежит прочь 2 раунда.",
    aoe: null,
    effect: { special:"debuff", applyCondition:"fleeing", conditionDuration:12 }, img:"systems/iron-hills-system/icons/items/spells/fear.webp" },

  // ══════════════════════════════════════════════════════════
  // ПРИЗЫВ
  // ══════════════════════════════════════════════════════════
  summon_skeleton: {
    id:"summon_skeleton", label:"Призвать Скелета", school:"summon", rank:3,
    manaCost:8, castTime:5, damage:0, damageType:"none",
    desc:"Призывает скелета-воина на 3 раунда.",
    aoe: null,
    effect: { special:"summon", summonId:"skeleton", duration:18 }, img:"systems/iron-hills-system/icons/items/spells/summon_skeleton.webp" },
  banish: {
    id:"banish", label:"Изгнание", school:"summon", rank:4,
    manaCost:8, castTime:3, damage:0, damageType:"none",
    desc:"Изгоняет призванное существо или нежить. Инстант-убийство для слабых.",
    aoe: null,
    effect: { special:"banish" }, img:"systems/iron-hills-system/icons/items/spells/banish.webp" },
  astral_binding_circle: {
    id:"astral_binding_circle", label:"Круг Астральных Оков", school:"summon", rank:9,
    manaCost:24, castTime:7, damage:45, damageType:"magical",
    desc:"Высшая печать призыва, которая стягивает существ к границе круга и сковывает их. Каждая цель проходит отдельную проверку.",
    aoe: { type:"blast", shape:"circle", distance:4, maxTargets:null, friendlyFireMode:"auto", targetZoneMode:"fixed", targetZone:"legs" },
    effect: { applyCondition:"grappled", conditionDuration:12, conditionChance:0.75 }, img:"systems/iron-hills-system/icons/items/spells/astral_binding_circle.webp" },

  // ═══════════════════════════════════════════════════════════════════
  // ВЕРШИННЫЕ ЗАКЛИНАНИЯ
  // ═══════════════════════════════════════════════════════════════════
  heavenfall: {
    id:"heavenfall", label:"Небесное Падение", school:"light", rank:10,
    manaCost:32, castTime:10, damage:220, damageType:"holy",
    desc:"Высшее площадное заклинание света. Каждая цель в зоне проходит отдельную проверку попадания; союзники не задеваются.",
    aoe: { type:"blast", shape:"circle", distance:6, maxTargets:null, friendlyFireMode:"off", targetZoneMode:"aimed", targetZone:"torso" },
    effect: { applyCondition:"stunned", conditionDuration:6, conditionChance:0.5 }, img:"systems/iron-hills-system/icons/items/spells/heavenfall.webp" },
};

function aoe(type, shape, distance, extra = {}) {
  return {
    type,
    shape,
    distance,
    maxTargets: null,
    friendlyFireMode: "auto",
    targetZoneMode: "random",
    ...extra,
  };
}

function condition(applyCondition, conditionDuration = 6, conditionChance = 1, extra = {}) {
  return { applyCondition, conditionDuration, conditionChance, ...extra };
}

const SUPPLEMENTAL_SPELL_ROWS = Object.freeze([
  { id:"cinder_lance", label:"Пепельное копье", school:"fire", rank:3, damage:48, damageType:"fire", desc:"Сжатое копье жара в одну цель; хорошо пробивает открытые зоны.", effect: condition("burning", 6, 0.35) },
  { id:"ashen_step", label:"Шаг сквозь угли", school:"fire", rank:6, damage:0, damageType:"none", desc:"Краткий рывок на жаре: цель получает ускорение и сбрасывает темп боя.", effect:{ special:"buff", applyCondition:"hasted", conditionDuration:6 } },
  { id:"volcanic_burst", label:"Вулканический выброс", school:"fire", rank:7, damage:94, damageType:"fire", desc:"Разрыв лавовых искр по площади; каждая цель проверяется отдельно.", aoe: aoe("blast", "circle", 3), effect: condition("burning", 12, 0.55) },
  { id:"phoenix_brand", label:"Клеймо феникса", school:"fire", rank:9, damage:0, damageType:"healing", desc:"Огненная печать закрывает раны союзника и дает короткий всплеск энергии.", effect:{ special:"heal", healAmount:46, applyCondition:"hasted", conditionDuration:6 }, targetZone:"torso" },
  { id:"sunforge_cataclysm", label:"Катаклизм солнечной кузни", school:"fire", rank:10, damage:185, damageType:"fire", desc:"Высший огненный взрыв с прицельным центром поражения и риском friendly fire.", aoe: aoe("blast", "circle", 6, { targetZoneMode:"aimed", targetZone:"torso" }), effect: condition("burning", 30, 0.85) },

  { id:"frostbite_touch", label:"Касание обморожения", school:"ice", rank:2, damage:28, damageType:"ice", desc:"Ледяной контакт замедляет цель и делает ее уязвимой для добивания.", effect: condition("slowed", 12, 0.55) },
  { id:"glacial_wall", label:"Ледниковая стена", school:"ice", rank:5, damage:42, damageType:"ice", desc:"Полоса льда режет линию боя и может зацепить всех на траектории.", aoe: aoe("blast", "rect", 5), effect: condition("slowed", 12, 0.65) },
  { id:"winter_maw", label:"Пасть зимы", school:"ice", rank:7, damage:86, damageType:"ice", desc:"Конус ледяного ветра с отдельной проверкой попадания по каждой цели.", aoe: aoe("blast", "cone", 4), effect: condition("slowed", 18, 0.75) },
  { id:"crystal_prison", label:"Кристальная тюрьма", school:"ice", rank:8, damage:44, damageType:"ice", desc:"Одиночная цель сковывается льдом; урон мал, контроль высок.", effect: condition("grappled", 12, 0.85) },
  { id:"whiteout_field", label:"Поле белой мглы", school:"ice", rank:9, damage:120, damageType:"ice", desc:"Большая зона снежной слепоты и холода; friendly fire определяется зоной.", aoe: aoe("blast", "circle", 5), effect: condition("slowed", 24, 0.8) },
  { id:"absolute_zero", label:"Абсолютный ноль", school:"ice", rank:10, damage:160, damageType:"ice", desc:"Высшее ледяное заклинание с прицельной зоной заморозки.", aoe: aoe("blast", "circle", 4, { targetZoneMode:"aimed", targetZone:"torso" }), effect: condition("stunned", 12, 0.7) },

  { id:"static_spark", label:"Статическая искра", school:"lightning", rank:1, damage:18, damageType:"lightning", desc:"Быстрый разряд в одну цель; дешевое стартовое заклинание молнии.", effect: condition("stunned", 3, 0.15) },
  { id:"storm_javelin", label:"Штормовой дротик", school:"lightning", rank:4, damage:58, damageType:"lightning", desc:"Линейный удар молнии в первую значимую цель на траектории.", aoe: aoe("pierce", "ray", 7, { maxTargets:1 }), effect: condition("stunned", 3, 0.35) },
  { id:"voltaic_net", label:"Вольтовая сеть", school:"lightning", rank:6, damage:54, damageType:"lightning", desc:"Сеть разрядов выбирает несколько целей в зоне и тормозит их.", aoe: aoe("chain", "circle", 4, { maxTargets:5, chainDecay:0.85 }), effect: condition("slowed", 12, 0.6) },
  { id:"thunderstep", label:"Громовой шаг", school:"lightning", rank:7, damage:70, damageType:"lightning", desc:"Взрыв вокруг кастера после рывка; может зацепить союзников.", aoe: aoe("nova", "circle", 2), effect: condition("pushed", 0, 0.7) },
  { id:"sky_spear", label:"Копье небес", school:"lightning", rank:8, damage:118, damageType:"lightning", desc:"Сильный одиночный удар с прицеливанием в выбранную зону.", targetZone:"torso", targetZoneMode:"aimed", effect: condition("stunned", 6, 0.45) },
  { id:"storm_crown", label:"Корона бури", school:"lightning", rank:9, damage:128, damageType:"lightning", desc:"Кольцо молний вокруг выбранной точки; каждая цель проверяется отдельно.", aoe: aoe("blast", "circle", 5), effect: condition("stunned", 6, 0.55) },
  { id:"worldbolt", label:"Мировая молния", school:"lightning", rank:10, damage:175, damageType:"lightning", desc:"Высшая линия молнии, способная пройти через строй.", aoe: aoe("blast", "ray", 12, { targetZoneMode:"aimed", targetZone:"torso" }), effect: condition("stunned", 6, 0.65) },

  { id:"dusk_needle", label:"Сумеречная игла", school:"shadow", rank:2, damage:28, damageType:"shadow", desc:"Тонкий укол тьмы снижает защиту цели.", effect: condition("exposed", 12, 0.65) },
  { id:"veil_of_dread", label:"Покров ужаса", school:"shadow", rank:3, damage:0, damageType:"none", desc:"Цель охватывает паника; полезно против одиночных опасных противников.", effect:{ special:"fear", applyCondition:"fleeing", conditionDuration:12 } },
  { id:"umbral_chains", label:"Теневые цепи", school:"shadow", rank:6, damage:48, damageType:"shadow", desc:"Цепи тьмы удерживают несколько целей в небольшой зоне.", aoe: aoe("shards", "circle", 3, { maxTargets:5 }), effect: condition("grappled", 12, 0.7) },
  { id:"soul_eclipse", label:"Затмение души", school:"shadow", rank:7, damage:88, damageType:"shadow", desc:"Площадной удар по воле и плоти; оставляет цели уязвимыми.", aoe: aoe("blast", "circle", 4), effect: condition("exposed", 18, 0.75) },
  { id:"death_whisper", label:"Шепот смерти", school:"shadow", rank:8, damage:125, damageType:"shadow", desc:"Сильное одиночное заклинание тьмы с частичным высасыванием жизни.", effect:{ special:"lifesteal", applyCondition:"exposed", conditionDuration:12, conditionChance:0.45 } },
  { id:"nightfall_zone", label:"Зона ночепада", school:"shadow", rank:9, damage:125, damageType:"shadow", desc:"Большая зона тьмы с отдельными проверками попадания и контролем.", aoe: aoe("blast", "circle", 5), effect: condition("fleeing", 12, 0.45) },
  { id:"void_judgement", label:"Суд Пустоты", school:"shadow", rank:10, damage:170, damageType:"shadow", desc:"Высшее теневое поражение по выбранной зоне тела.", aoe: aoe("blast", "circle", 4, { targetZoneMode:"aimed", targetZone:"head" }), effect: condition("exposed", 24, 0.9) },

  { id:"guiding_glimmer", label:"Путеводный отблеск", school:"light", rank:1, damage:0, damageType:"none", desc:"Малая молитва поддержки: цель получает короткий прилив ясности.", effect:{ special:"buff", applyCondition:"hasted", conditionDuration:6 } },
  { id:"warding_sigil", label:"Охранная печать", school:"light", rank:4, damage:0, damageType:"none", desc:"Защитный свет стабилизирует цель перед опасным обменом.", effect:{ special:"buff", applyCondition:"hasted", conditionDuration:6 } },
  { id:"radiant_chain", label:"Лучистая цепь", school:"light", rank:5, damage:48, damageType:"holy", desc:"Свет перескакивает между врагами, но не задевает союзников.", aoe: aoe("chain", "circle", 4, { maxTargets:4, chainDecay:0.85, friendlyFireMode:"off" }), effect: condition("stunned", 3, 0.35) },
  { id:"sanctuary_ring", label:"Кольцо убежища", school:"light", rank:7, damage:0, damageType:"healing", desc:"Площадное лечение союзников без friendly fire.", aoe: aoe("nova", "circle", 3, { friendlyFireMode:"off", targetZoneMode:"fixed", targetZone:"torso" }), effect:{ special:"heal", healAmount:34 } },
  { id:"sunlance", label:"Солнечное копье", school:"light", rank:8, damage:115, damageType:"holy", desc:"Прицельный луч света по важной зоне цели.", targetZone:"torso", targetZoneMode:"aimed", effect: condition("stunned", 6, 0.35) },
  { id:"martyr_aegis", label:"Эгида мученика", school:"light", rank:9, damage:0, damageType:"healing", desc:"Мощная поддержка одной цели: лечение и краткое ускорение.", effect:{ special:"heal", healAmount:58, applyCondition:"hasted", conditionDuration:6 }, targetZone:"torso" },

  { id:"mud_snare", label:"Грязевая хватка", school:"earth", rank:2, damage:18, damageType:"physical", desc:"Земля цепляет ноги цели и мешает движению.", targetZone:"legs", targetZoneMode:"fixed", effect: condition("grappled", 6, 0.55) },
  { id:"ironroot_grasp", label:"Хват железного корня", school:"earth", rank:4, damage:42, damageType:"physical", desc:"Корни удерживают несколько целей в зоне.", aoe: aoe("shards", "circle", 3, { maxTargets:4, targetZoneMode:"fixed", targetZone:"legs" }), effect: condition("grappled", 12, 0.65) },
  { id:"boulder_barrage", label:"Каменный залп", school:"earth", rank:5, damage:62, damageType:"physical", desc:"Несколько каменных осколков выбирают цели в области.", aoe: aoe("shards", "circle", 4, { maxTargets:5 }), effect: condition("prone", 6, 0.35) },
  { id:"stone_skin", label:"Каменная кожа", school:"earth", rank:6, damage:0, damageType:"none", desc:"Защитный слой камня дает время на позиционную игру.", effect:{ special:"buff", applyCondition:"hasted", conditionDuration:6 } },
  { id:"tectonic_spear", label:"Тектоническое копье", school:"earth", rank:8, damage:125, damageType:"physical", desc:"Прицельный каменный удар из-под земли.", targetZone:"abdomen", targetZoneMode:"aimed", effect: condition("prone", 6, 0.5) },
  { id:"mountain_collapse", label:"Обвал горы", school:"earth", rank:9, damage:145, damageType:"physical", desc:"Большая зона обвала; опасна для всех в радиусе.", aoe: aoe("blast", "circle", 5), effect: condition("prone", 12, 0.75) },
  { id:"worldroot_verdict", label:"Приговор Мирового Корня", school:"earth", rank:10, damage:175, damageType:"physical", desc:"Высшее земное заклинание, удерживающее и калечащее выбранную зону.", aoe: aoe("blast", "circle", 4, { targetZoneMode:"aimed", targetZone:"legs" }), effect: condition("grappled", 18, 0.85) },

  { id:"focus_thread", label:"Нить фокуса", school:"mind", rank:1, damage:0, damageType:"none", desc:"Малый ментальный импульс ускоряет союзника или самого кастера.", effect:{ special:"buff", applyCondition:"hasted", conditionDuration:6 } },
  { id:"mind_lance", label:"Копье разума", school:"mind", rank:6, damage:72, damageType:"psychic", desc:"Одиночный удар по воле с шансом оглушить.", effect: condition("stunned", 6, 0.45) },
  { id:"memory_cage", label:"Клетка памяти", school:"mind", rank:7, damage:0, damageType:"none", desc:"Цель застревает в навязанном воспоминании и теряет темп.", effect:{ special:"debuff", applyCondition:"grappled", conditionDuration:12 } },
  { id:"puppet_panic", label:"Кукольная паника", school:"mind", rank:8, damage:45, damageType:"psychic", desc:"Ментальная волна гонит несколько целей из опасной зоны.", aoe: aoe("blast", "cone", 4, { friendlyFireMode:"off" }), effect: condition("fleeing", 12, 0.65) },
  { id:"thought_storm", label:"Буря мыслей", school:"mind", rank:9, damage:116, damageType:"psychic", desc:"Площадной ментальный шторм без поражения союзников.", aoe: aoe("blast", "circle", 5, { friendlyFireMode:"off" }), effect: condition("slowed", 18, 0.75) },
  { id:"absolute_command", label:"Абсолютный приказ", school:"mind", rank:10, damage:0, damageType:"none", desc:"Высший контроль: прицельное подавление одной цели.", targetZone:"head", targetZoneMode:"aimed", effect:{ special:"debuff", applyCondition:"stunned", conditionDuration:12, conditionChance:0.8 } },

  { id:"call_wisp", label:"Призвать огонек", school:"summon", rank:1, damage:0, damageType:"none", desc:"Малый призыв разведочного духа на короткую сцену.", effect:{ special:"summon", summonId:"wisp", duration:18 } },
  { id:"bind_familiar", label:"Связать фамильяра", school:"summon", rank:2, damage:0, damageType:"none", desc:"Призыв простого помощника для разведки и мелких поручений.", effect:{ special:"summon", summonId:"familiar", duration:30 } },
  { id:"spirit_guardian", label:"Дух-хранитель", school:"summon", rank:5, damage:35, damageType:"magical", desc:"Защитный дух атакует ближайших врагов в малой зоне.", aoe: aoe("nova", "circle", 2, { friendlyFireMode:"off" }), effect:{ special:"summon", summonId:"guardian", duration:18 } },
  { id:"rift_hounds", label:"Гончие разлома", school:"summon", rank:6, damage:58, damageType:"magical", desc:"Призывная стая кусает до нескольких целей.", aoe: aoe("shards", "circle", 4, { maxTargets:4 }), effect:{ special:"summon", summonId:"rift_hound", duration:18 } },
  { id:"banishing_wave", label:"Волна изгнания", school:"summon", rank:7, damage:70, damageType:"magical", desc:"Площадная антимагическая волна против призванных и нежити.", aoe: aoe("blast", "cone", 4, { friendlyFireMode:"off" }), effect:{ special:"banish", applyCondition:"stunned", conditionDuration:6, conditionChance:0.45 } },
  { id:"gate_lock", label:"Замок врат", school:"summon", rank:8, damage:0, damageType:"none", desc:"Закрывает перемещение и удерживает существ в выбранной зоне.", aoe: aoe("blast", "circle", 4, { friendlyFireMode:"off", targetZoneMode:"fixed", targetZone:"legs" }), effect: condition("grappled", 18, 0.8) },
  { id:"avatar_pact", label:"Договор аватара", school:"summon", rank:10, damage:120, damageType:"magical", desc:"Высший призыв: существо прорывает реальность и бьет по выбранной зоне.", aoe: aoe("blast", "circle", 5, { targetZoneMode:"aimed", targetZone:"torso" }), effect:{ special:"summon", summonId:"avatar", duration:30, applyCondition:"stunned", conditionDuration:6, conditionChance:0.5 } },
]);

function supplementalSpell(row) {
  const rank = Math.max(1, Math.min(10, Number(row.rank) || 1));
  return {
    id: row.id,
    label: row.label,
    school: row.school,
    rank,
    manaCost: row.manaCost ?? Math.max(1, Math.round(rank * 2.4 + (row.aoe ? 1 : 0))),
    castTime: row.castTime ?? Math.min(10, Math.max(1, Math.ceil(rank * 0.65))),
    damage: row.damage ?? 0,
    damageType: row.damageType ?? "magical",
    desc: row.desc ?? "",
    targetZone: row.targetZone ?? "",
    targetZoneMode: row.targetZoneMode ?? "",
    aoe: row.aoe ?? null,
    effect: row.effect ?? null,
    img: row.img ?? SPELL_IMAGE_BY_SCHOOL[row.school] ?? SPELL_IMAGE_BY_SCHOOL.mind,
  };
}

export const SPELLS = {
  ...BASE_SPELLS,
  ...Object.fromEntries(SUPPLEMENTAL_SPELL_ROWS.map((row) => [row.id, supplementalSpell(row)])),
};

/** Все заклинания по школе */
export const SPELLS_BY_SCHOOL = {};
for (const [id, spell] of Object.entries(SPELLS)) {
  if (!SPELLS_BY_SCHOOL[spell.school]) SPELLS_BY_SCHOOL[spell.school] = [];
  SPELLS_BY_SCHOOL[spell.school].push(spell);
}

/** Заклинания доступные персонажу (выучены, ранг <= навык магии) */
export function getAvailableSpells(actor) {
  const knownIds = actor.items
    ?.filter(i => i.type === "spell")
    ?.map(i => i.system?.spellId ?? i.name) ?? [];
  const magicSkill = Number(actor.system?.skills?.magic?.value
    ?? actor.system?.skills?.sorcery?.value ?? 0);
  return Object.values(SPELLS).filter(s =>
    knownIds.includes(s.id) && s.rank <= magicSkill
  );
}
