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

export const SPELLS = {

  // ══════════════════════════════════════════════════════════
  // ОГОНЬ
  // ══════════════════════════════════════════════════════════
  fire_bolt: {
    id:"fire_bolt", label:"Огненный Bolt", school:"fire", rank:1,
    manaCost:2, castTime:2, damage:4, damageType:"fire",
    desc:"Сгусток огня в одну цель.",
    aoe: null,
    effect: null,
  },
  burning_hands: {
    id:"burning_hands", label:"Горящие руки", school:"fire", rank:2,
    manaCost:4, castTime:3, damage:6, damageType:"fire",
    desc:"Конус огня прямо перед кастером. Бросок на каждого в зоне.",
    aoe: { type:"blast", shape:"cone", distance:3, maxTargets:null },
    effect: { applyCondition:"burning", conditionDuration:12, conditionChance:0.5 },
  },
  fireball: {
    id:"fireball", label:"Огненный Шар", school:"fire", rank:4,
    manaCost:8, castTime:4, damage:12, damageType:"fire",
    desc:"Взрыв в точке. Все в радиусе 3 клеток — бросок на каждого.",
    aoe: { type:"blast", shape:"circle", distance:3, maxTargets:null },
    effect: { applyCondition:"burning", conditionDuration:6, conditionChance:0.4 },
  },
  fire_wall: {
    id:"fire_wall", label:"Стена Огня", school:"fire", rank:5,
    manaCost:10, castTime:5, damage:8, damageType:"fire",
    desc:"Линия огня. Каждый кто пройдёт — получает урон.",
    aoe: { type:"blast", shape:"ray", distance:5, maxTargets:null },
    effect: { applyCondition:"burning", conditionDuration:6, conditionChance:0.6 },
  },
  meteor: {
    id:"meteor", label:"Метеор", school:"fire", rank:8,
    manaCost:20, castTime:8, damage:30, damageType:"fire",
    desc:"Метеор падает в точку. Огромная зона, огромный урон.",
    aoe: { type:"blast", shape:"circle", distance:5, maxTargets:null },
    effect: { applyCondition:"burning", conditionDuration:30, conditionChance:0.8 },
  },

  // ══════════════════════════════════════════════════════════
  // ЛЁДID
  // ══════════════════════════════════════════════════════════
  ice_shard: {
    id:"ice_shard", label:"Ледяной Осколок", school:"ice", rank:1,
    manaCost:2, castTime:2, damage:5, damageType:"ice",
    desc:"Осколок льда в одну цель. Шанс замедлить.",
    aoe: null,
    effect: { applyCondition:"slowed", conditionDuration:6, conditionChance:0.4 },
  },
  ice_shards: {
    id:"ice_shards", label:"Ледяные Осколки", school:"ice", rank:3,
    manaCost:6, castTime:3, damage:7, damageType:"ice",
    desc:"4 осколка летят в случайных врагов в зоне. Максимум 4 цели, бросок на каждую.",
    aoe: { type:"shards", shape:"circle", distance:4, maxTargets:4 },
    effect: { applyCondition:"slowed", conditionDuration:6, conditionChance:0.5 },
  },
  frost_nova: {
    id:"frost_nova", label:"Морозная Вспышка", school:"ice", rank:4,
    manaCost:8, castTime:3, damage:6, damageType:"ice",
    desc:"Взрыв льда вокруг кастера. Все в радиусе 2 клеток — заморожены.",
    aoe: { type:"nova", shape:"circle", distance:2, maxTargets:null },
    effect: { applyCondition:"stunned", conditionDuration:6, conditionChance:0.7 },
  },
  blizzard: {
    id:"blizzard", label:"Вьюга", school:"ice", rank:6,
    manaCost:14, castTime:6, damage:8, damageType:"ice",
    desc:"Буря в большой зоне. Бросок на каждого каждый раунд 3 раунда.",
    aoe: { type:"blast", shape:"circle", distance:5, maxTargets:null },
    effect: { applyCondition:"slowed", conditionDuration:18, conditionChance:0.8 },
  },

  // ══════════════════════════════════════════════════════════
  // МОЛНИЯ
  // ══════════════════════════════════════════════════════════
  lightning_bolt_spell: {
    id:"lightning_bolt_spell", label:"Молния", school:"lightning", rank:2,
    manaCost:4, castTime:2, damage:8, damageType:"lightning",
    desc:"Молния пробивает первого врага и летит дальше. Pierce — останавливается на первом.",
    aoe: { type:"pierce", shape:"ray", distance:8, maxTargets:1 },
    effect: { applyCondition:"stunned", conditionDuration:3, conditionChance:0.3 },
  },
  chain_lightning: {
    id:"chain_lightning", label:"Цепная Молния", school:"lightning", rank:5,
    manaCost:10, castTime:4, damage:10, damageType:"lightning",
    desc:"Молния прыгает между 4 ближайшими врагами. Урон -20% каждый прыжок.",
    aoe: { type:"chain", shape:"circle", distance:4, maxTargets:4, chainDecay:0.8 },
    effect: { applyCondition:"stunned", conditionDuration:3, conditionChance:0.4 },
  },
  thunder_clap: {
    id:"thunder_clap", label:"Гром", school:"lightning", rank:3,
    manaCost:6, castTime:3, damage:6, damageType:"lightning",
    desc:"Ударная волна. Sweep — задевает до 3 врагов слева направо.",
    aoe: { type:"sweep", shape:"cone", distance:3, maxTargets:3 },
    effect: { applyCondition:"pushed", conditionChance:0.6 },
  },

  // ══════════════════════════════════════════════════════════
  // ТЬМА
  // ══════════════════════════════════════════════════════════
  shadow_bolt: {
    id:"shadow_bolt", label:"Тёмный Заряд", school:"shadow", rank:1,
    manaCost:2, castTime:2, damage:5, damageType:"shadow",
    desc:"Тёмная энергия в одну цель. Снижает защиту.",
    aoe: null,
    effect: { applyCondition:"exposed", conditionDuration:6 },
  },
  void_burst: {
    id:"void_burst", label:"Взрыв Пустоты", school:"shadow", rank:5,
    manaCost:10, castTime:4, damage:14, damageType:"shadow",
    desc:"Взрыв тёмной энергии вокруг цели.",
    aoe: { type:"blast", shape:"circle", distance:3, maxTargets:null },
    effect: { applyCondition:"exposed", conditionDuration:12, conditionChance:0.6 },
  },
  drain_life: {
    id:"drain_life", label:"Высасывание Жизни", school:"shadow", rank:4,
    manaCost:8, castTime:3, damage:10, damageType:"shadow",
    desc:"Похищает жизнь — кастер восстанавливает HP равное нанесённому урону.",
    aoe: null,
    effect: { special:"lifesteal" },
  },

  // ══════════════════════════════════════════════════════════
  // СВЕТ
  // ══════════════════════════════════════════════════════════
  holy_smite: {
    id:"holy_smite", label:"Праведный Удар", school:"light", rank:2,
    manaCost:4, castTime:2, damage:8, damageType:"holy",
    desc:"Световой удар. Двойной урон нежити.",
    aoe: null,
    effect: { special:"double_vs_undead" },
  },
  healing_wave: {
    id:"healing_wave", label:"Волна Исцеления", school:"light", rank:3,
    manaCost:6, castTime:3, damage:0, damageType:"healing",
    desc:"Лечит всех союзников в радиусе 3 клеток. Бросок на каждого.",
    aoe: { type:"nova", shape:"circle", distance:3, maxTargets:null },
    effect: { special:"heal", healAmount:10 },
  },
  divine_wrath: {
    id:"divine_wrath", label:"Божественный Гнев", school:"light", rank:6,
    manaCost:12, castTime:5, damage:18, damageType:"holy",
    desc:"Луч света бьёт всех врагов в линии. Pierce — проходит насквозь.",
    aoe: { type:"blast", shape:"ray", distance:10, maxTargets:null },
    effect: { applyCondition:"stunned", conditionDuration:6, conditionChance:0.5 },
  },

  // ══════════════════════════════════════════════════════════
  // ЗЕМЛЯ
  // ══════════════════════════════════════════════════════════
  stone_throw: {
    id:"stone_throw", label:"Бросок Камня", school:"earth", rank:1,
    manaCost:2, castTime:2, damage:6, damageType:"physical",
    desc:"Магический камень в одну цель. Шанс оглушить.",
    aoe: null,
    effect: { applyCondition:"stunned", conditionDuration:3, conditionChance:0.3 },
  },
  earthquake: {
    id:"earthquake", label:"Землетрясение", school:"earth", rank:7,
    manaCost:16, castTime:6, damage:12, damageType:"physical",
    desc:"Земля трясётся в огромной зоне. Все падают.",
    aoe: { type:"blast", shape:"circle", distance:6, maxTargets:null },
    effect: { applyCondition:"prone", conditionDuration:6, conditionChance:0.9 },
  },
  rock_shards: {
    id:"rock_shards", label:"Каменные Осколки", school:"earth", rank:3,
    manaCost:5, castTime:3, damage:8, damageType:"physical",
    desc:"3 осколка в случайных врагов. Максимум 3 цели.",
    aoe: { type:"shards", shape:"circle", distance:4, maxTargets:3 },
    effect: null,
  },

  // ══════════════════════════════════════════════════════════
  // РАЗУМ
  // ══════════════════════════════════════════════════════════
  haste_spell: {
    id:"haste_spell", label:"Ускорение", school:"mind", rank:3,
    manaCost:5, castTime:2, damage:0, damageType:"none",
    desc:"Цель получает состояние Ускорение — время действий вдвое меньше.",
    aoe: null,
    effect: { special:"buff", applyCondition:"hasted", conditionDuration:18 },
  },
  slow_spell: {
    id:"slow_spell", label:"Замедление", school:"mind", rank:2,
    manaCost:4, castTime:2, damage:0, damageType:"none",
    desc:"Цель замедлена — время действий вдвое больше.",
    aoe: null,
    effect: { special:"debuff", applyCondition:"slowed", conditionDuration:18 },
  },
  mass_slow: {
    id:"mass_slow", label:"Массовое Замедление", school:"mind", rank:5,
    manaCost:10, castTime:4, damage:0, damageType:"none",
    desc:"Все враги в зоне замедлены. Бросок воли на сопротивление.",
    aoe: { type:"blast", shape:"circle", distance:4, maxTargets:null },
    effect: { special:"debuff", applyCondition:"slowed", conditionDuration:12 },
  },
  fear: {
    id:"fear", label:"Страх", school:"mind", rank:4,
    manaCost:7, castTime:3, damage:0, damageType:"none",
    desc:"Цель охвачена ужасом — бежит прочь 2 раунда.",
    aoe: null,
    effect: { special:"debuff", applyCondition:"fleeing", conditionDuration:12 },
  },

  // ══════════════════════════════════════════════════════════
  // ПРИЗЫВ
  // ══════════════════════════════════════════════════════════
  summon_skeleton: {
    id:"summon_skeleton", label:"Призвать Скелета", school:"summon", rank:3,
    manaCost:8, castTime:5, damage:0, damageType:"none",
    desc:"Призывает скелета-воина на 3 раунда.",
    aoe: null,
    effect: { special:"summon", summonId:"skeleton", duration:18 },
  },
  banish: {
    id:"banish", label:"Изгнание", school:"summon", rank:4,
    manaCost:8, castTime:3, damage:0, damageType:"none",
    desc:"Изгоняет призванное существо или нежить. Инстант-убийство для слабых.",
    aoe: null,
    effect: { special:"banish" },
  },
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
