/**
 * Iron Hills — Combat Techniques
 * Боевые приёмы по типам оружия.
 * 
 * Разблокировка: навык персонажа >= reqSkill И ступень оружия >= reqWeaponTier
 * 
 * effect: что делает приём
 *   - damage: множитель к базовому урону
 *   - energyCost: доп. энергия сверх обычного удара
 *   - applyCondition: накладываемый статус
 *   - conditionDuration: длительность в секундах боя
 *   - ignoreArmor: процент игнорирования защиты (0-1)
 *   - aoe: атака по нескольким целям
 *   - special: строка для кастомной обработки
 */

export const TECHNIQUES = {

  // ══════════════════════════════════════════════════════════
  // МЕЧИ (sword)
  // ══════════════════════════════════════════════════════════
  sword_feint: {
    id: "sword_feint", label: "Финт", icon: "🌀",
    skill: "sword", reqSkill: 2, reqWeaponTier: 1,
    desc: "Обманный выпад. Снижает защиту цели на 2 до следующего удара.",
    energyCost: 2,
    effect: { damage: 0.5, applyCondition: "exposed", conditionDuration: 6 },
  },
  sword_cleave: {
    id: "sword_cleave", label: "Разрубить", icon: "⚔",
    skill: "sword", reqSkill: 4, reqWeaponTier: 2,
    desc: "Мощный рубящий удар. Игнорирует 30% брони.",
    energyCost: 5,
    effect: { damage: 1.2, ignoreArmor: 0.3 },
  },
  sword_whirlwind: {
    id: "sword_whirlwind", label: "Вихрь", icon: "🌪",
    skill: "sword", reqSkill: 6, reqWeaponTier: 3,
    desc: "Круговой удар по всем врагам в ближнем бою.",
    energyCost: 7,
    effect: { damage: 0.8, aoe: "melee_adjacent", special: "aoe" },
  },
  sword_riposte: {
    id: "sword_riposte", label: "Рипост", icon: "🛡",
    skill: "sword", reqSkill: 9, reqWeaponTier: 5,
    desc: "После блока — мгновенная контратака с двойным уроном.",
    energyCost: 4,
    effect: { damage: 2.0, special: "counter_after_block" },
  },

  // ══════════════════════════════════════════════════════════
  // ТОПОРЫ (axe)
  // ══════════════════════════════════════════════════════════
  axe_stun: {
    id: "axe_stun", label: "Оглушающий удар", icon: "💫",
    skill: "axe", reqSkill: 2, reqWeaponTier: 1,
    desc: "Удар плашмя. Шанс оглушить цель на 1 раунд.",
    energyCost: 4,
    effect: { damage: 0.7, applyCondition: "stunned", conditionDuration: 6, conditionChance: 0.5 },
  },
  axe_shieldbreak: {
    id: "axe_shieldbreak", label: "Зацеп щита", icon: "🔓",
    skill: "axe", reqSkill: 4, reqWeaponTier: 2,
    desc: "Цепляет щит и рывком лишает цель защиты.",
    energyCost: 5,
    effect: { damage: 0.6, applyCondition: "shield_lost", conditionDuration: 12, special: "disarm_shield" },
  },
  axe_armorcrack: {
    id: "axe_armorcrack", label: "Расколоть броню", icon: "🪓",
    skill: "axe", reqSkill: 6, reqWeaponTier: 3,
    desc: "Наносит урон броне, снижая её защиту на 2 до конца боя.",
    energyCost: 6,
    effect: { damage: 1.0, applyCondition: "armor_cracked", conditionDuration: 999 },
  },
  axe_execute: {
    id: "axe_execute", label: "Казнь", icon: "☠",
    skill: "axe", reqSkill: 9, reqWeaponTier: 5,
    desc: "Добивающий удар. ×3 урон если у цели < 30% HP торса.",
    energyCost: 8,
    effect: { damage: 3.0, special: "execute_low_hp" },
  },

  // ══════════════════════════════════════════════════════════
  // КОПЬЯ (spear)
  // ══════════════════════════════════════════════════════════
  spear_firstblood: {
    id: "spear_firstblood", label: "Удар с замаха", icon: "🏹",
    skill: "spear", reqSkill: 2, reqWeaponTier: 1,
    desc: "Первый удар в бою — +50% урон. Только один раз за бой.",
    energyCost: 3,
    effect: { damage: 1.5, special: "first_strike_only" },
  },
  spear_pushback: {
    id: "spear_pushback", label: "Отброс", icon: "💨",
    skill: "spear", reqSkill: 4, reqWeaponTier: 2,
    desc: "Толчок древком. Отбрасывает цель на 1 клетку, прерывает атаку.",
    energyCost: 5,
    effect: { damage: 0.5, applyCondition: "pushed", special: "knockback_1" },
  },
  spear_piercing: {
    id: "spear_piercing", label: "Укол в щель", icon: "🎯",
    skill: "spear", reqSkill: 6, reqWeaponTier: 3,
    desc: "Точный удар в уязвимое место. Игнорирует 50% брони.",
    energyCost: 6,
    effect: { damage: 1.1, ignoreArmor: 0.5 },
  },
  spear_formation: {
    id: "spear_formation", label: "Строй", icon: "🛡",
    skill: "spear", reqSkill: 9, reqWeaponTier: 4,
    desc: "Пока союзник рядом — +3 к защите и атака по врагу при его приближении.",
    energyCost: 1,
    effect: { special: "formation_stance" },
  },

  // ══════════════════════════════════════════════════════════
  // НОЖИ (knife)
  // ══════════════════════════════════════════════════════════
  knife_backstab: {
    id: "knife_backstab", label: "Подлый удар", icon: "🗡",
    skill: "knife", reqSkill: 2, reqWeaponTier: 1,
    desc: "Из укрытия или сзади — ×2 урон.",
    energyCost: 2,
    effect: { damage: 2.0, special: "requires_hidden_or_flank" },
  },
  knife_throw: {
    id: "knife_throw", label: "Метнуть нож", icon: "🎯",
    skill: "knife", reqSkill: 3, reqWeaponTier: 1,
    desc: "Бросает нож в цель. Дальность 3 клетки, теряет нож.",
    energyCost: 3,
    effect: { damage: 0.8, special: "throw_weapon_ranged_3" },
  },
  knife_intercept: {
    id: "knife_intercept", label: "Перехват", icon: "✋",
    skill: "knife", reqSkill: 5, reqWeaponTier: 2,
    desc: "Реакция на атаку ближнего боя — контрудар с уроном.",
    energyCost: 4,
    effect: { damage: 1.0, special: "reaction_interrupt" },
  },
  knife_bleed: {
    id: "knife_bleed", label: "Вскрыть вену", icon: "🩸",
    skill: "knife", reqSkill: 7, reqWeaponTier: 3,
    desc: "Порез вызывает кровотечение — 1 урон/раунд в течение 5 раундов.",
    energyCost: 4,
    effect: { damage: 0.6, applyCondition: "bleeding", conditionDuration: 30 },
  },

  // ══════════════════════════════════════════════════════════
  // БУЛАВЫ (mace)
  // ══════════════════════════════════════════════════════════
  mace_crush: {
    id: "mace_crush", label: "Дробящий удар", icon: "💥",
    skill: "mace", reqSkill: 2, reqWeaponTier: 1,
    desc: "Мощный удар. Шанс оглушить, игнорирует 20% брони.",
    energyCost: 4,
    effect: { damage: 1.1, ignoreArmor: 0.2, applyCondition: "stunned", conditionChance: 0.35, conditionDuration: 6 },
  },
  mace_bonebreak: {
    id: "mace_bonebreak", label: "Сломать кость", icon: "🦴",
    skill: "mace", reqSkill: 5, reqWeaponTier: 2,
    desc: "Целенаправленный удар по конечности. Накладывает перелом — -3 к навыкам пострадавшей руки/ноги.",
    energyCost: 6,
    effect: { damage: 1.2, applyCondition: "broken_limb", conditionDuration: 999 },
  },
  mace_counter: {
    id: "mace_counter", label: "Контрудар", icon: "🔄",
    skill: "mace", reqSkill: 7, reqWeaponTier: 3,
    desc: "При получении удара — немедленный удар булавой в ответ.",
    energyCost: 1,
    effect: { damage: 0.8, special: "auto_counter_on_hit" },
  },

  // ══════════════════════════════════════════════════════════
  // КИСТЕНИ (flail)
  // ══════════════════════════════════════════════════════════
  flail_bypass: {
    id: "flail_bypass", label: "Обход щита", icon: "⛓",
    skill: "flail", reqSkill: 2, reqWeaponTier: 1,
    desc: "Гибкое оружие огибает щит. Игнорирует защиту щита.",
    energyCost: 3,
    effect: { damage: 1.0, special: "ignore_shield" },
  },
  flail_entangle: {
    id: "flail_entangle", label: "Захлёст", icon: "🌀",
    skill: "flail", reqSkill: 5, reqWeaponTier: 2,
    desc: "Обматывает цепью руку с оружием. Цель не может атаковать 1 раунд.",
    energyCost: 5,
    effect: { damage: 0.4, applyCondition: "disarmed", conditionDuration: 6 },
  },

  // ══════════════════════════════════════════════════════════
  // ЛУКИ (bow)
  // ══════════════════════════════════════════════════════════
  bow_aimed: {
    id: "bow_aimed", label: "Прицельный выстрел", icon: "🎯",
    skill: "bow", reqSkill: 2, reqWeaponTier: 1,
    desc: "Тратит 1 раунд на прицеливание. Следующий выстрел +3 к броску.",
    energyCost: 2,
    effect: { damage: 1.0, special: "aim_bonus_3_next_shot" },
  },
  bow_legshot: {
    id: "bow_legshot", label: "Выстрел в ногу", icon: "🦵",
    skill: "bow", reqSkill: 4, reqWeaponTier: 2,
    desc: "Прицельный выстрел в ногу. Замедляет цель вдвое.",
    energyCost: 4,
    effect: { damage: 0.7, targetZone: "leftLeg", applyCondition: "slowed", conditionDuration: 30 },
  },
  bow_volley: {
    id: "bow_volley", label: "Залп", icon: "🏹",
    skill: "bow", reqSkill: 6, reqWeaponTier: 3,
    desc: "Три быстрых стрелы по разным целям в зоне досягаемости.",
    energyCost: 9,
    effect: { damage: 0.7, aoe: "ranged_3targets", special: "aoe" },
  },
  bow_headshot: {
    id: "bow_headshot", label: "Выстрел в голову", icon: "💀",
    skill: "bow", reqSkill: 8, reqWeaponTier: 4,
    desc: "Крайне сложный выстрел. -20% попасть. При попадании — оглушение и ×2 урон.",
    energyCost: 6,
    effect: { damage: 2.0, targetZone: "head", hitPenalty: -4, applyCondition: "stunned", conditionDuration: 6 },
  },

  // ══════════════════════════════════════════════════════════
  // АРБАЛЕТЫ (crossbow)
  // ══════════════════════════════════════════════════════════
  crossbow_piercing: {
    id: "crossbow_piercing", label: "Бронебойный болт", icon: "🔩",
    skill: "crossbow", reqSkill: 2, reqWeaponTier: 1,
    desc: "Специальный болт. Игнорирует 40% брони.",
    energyCost: 4,
    effect: { damage: 1.0, ignoreArmor: 0.4 },
  },
  crossbow_sleep: {
    id: "crossbow_sleep", label: "Усыпляющий болт", icon: "💤",
    skill: "crossbow", reqSkill: 5, reqWeaponTier: 2,
    desc: "Болт с ядом. Не убивает — усыпляет цель на 3 раунда.",
    energyCost: 5,
    effect: { damage: 0.2, applyCondition: "sleeping", conditionDuration: 18 },
  },
  crossbow_rapidload: {
    id: "crossbow_rapidload", label: "Быстрая перезарядка", icon: "⚡",
    skill: "crossbow", reqSkill: 7, reqWeaponTier: 3,
    desc: "Пассивный навык. Убирает штраф раунда на перезарядку.",
    energyCost: 1,
    effect: { special: "passive_no_reload_penalty" },
  },

  // ══════════════════════════════════════════════════════════
  // БЕЗ ОРУЖИЯ (unarmed)
  // ══════════════════════════════════════════════════════════
  unarmed_throw: {
    id: "unarmed_throw", label: "Бросок", icon: "🤸",
    skill: "unarmed", reqSkill: 2, reqWeaponTier: 0,
    desc: "Захватить и бросить противника на землю. Цель теряет действие.",
    energyCost: 5,
    effect: { damage: 0.3, applyCondition: "prone", conditionDuration: 6 },
  },
  unarmed_grapple: {
    id: "unarmed_grapple", label: "Захват", icon: "🤼",
    skill: "unarmed", reqSkill: 4, reqWeaponTier: 0,
    desc: "Зажать противника. Пока держишь — он не может двигаться и атаковать.",
    energyCost: 4,
    effect: { damage: 0, applyCondition: "grappled", conditionDuration: 6, special: "maintain_grapple" },
  },
  unarmed_lowblow: {
    id: "unarmed_lowblow", label: "Удар в пах", icon: "😵",
    skill: "unarmed", reqSkill: 3, reqWeaponTier: 0,
    desc: "Удар ниже пояса. Оглушение на 1 раунд (только против гуманоидов).",
    energyCost: 3,
    effect: { damage: 0.6, applyCondition: "stunned", conditionDuration: 6, conditionChance: 0.8 },
  },
  unarmed_ki_strike: {
    id: "unarmed_ki_strike", label: "Удар ки", icon: "✨",
    skill: "unarmed", reqSkill: 8, reqWeaponTier: 0,
    desc: "Концентрация внутренней силы. Удар проходит сквозь броню.",
    energyCost: 7,
    effect: { damage: 1.5, ignoreArmor: 1.0 },
  },

  // ══════════════════════════════════════════════════════════
  // ЩИТЫ (shield)
  // ══════════════════════════════════════════════════════════
  shield_bash: {
    id: "shield_bash", label: "Удар щитом", icon: "🛡",
    skill: "shield", reqSkill: 2, reqWeaponTier: 1,
    desc: "Таранный удар щитом. Отбрасывает врага, прерывает его атаку.",
    energyCost: 4,
    effect: { damage: 0.5, applyCondition: "pushed", special: "knockback_1" },
  },
  shield_wall: {
    id: "shield_wall", label: "Стена щитов", icon: "🏰",
    skill: "shield", reqSkill: 5, reqWeaponTier: 2,
    desc: "Вместе с союзником: +4 к защите для обоих, пока стоите рядом.",
    energyCost: 1,
    effect: { special: "shield_wall_formation" },
  },

  // ══════════════════════════════════════════════════════════
  // МЕТАТЕЛЬНОЕ (throwing)
  // ══════════════════════════════════════════════════════════
  throwing_precise: {
    id: "throwing_precise", label: "Точный бросок", icon: "🎯",
    skill: "throwing", reqSkill: 3, reqWeaponTier: 1,
    desc: "Выбор зоны тела. +2 к броску, можно выбрать голову.",
    energyCost: 3,
    effect: { damage: 1.0, special: "choose_zone" },
  },
  throwing_multicast: {
    id: "throwing_multicast", label: "Веер", icon: "🌟",
    skill: "throwing", reqSkill: 6, reqWeaponTier: 2,
    desc: "Три метательных снаряда по трём разным целям.",
    energyCost: 7,
    effect: { damage: 0.6, aoe: "ranged_3targets", special: "aoe" },
  },
};

/** Индекс по навыку — быстрый поиск */
export const TECHNIQUES_BY_SKILL = {};
for (const [id, tech] of Object.entries(TECHNIQUES)) {
  if (!TECHNIQUES_BY_SKILL[tech.skill]) TECHNIQUES_BY_SKILL[tech.skill] = [];
  TECHNIQUES_BY_SKILL[tech.skill].push(tech);
}

/** Получить доступные приёмы для персонажа с оружием */
export function getAvailableTechniques(actor, weapon) {
  if (!actor || !weapon) return [];
  const skillKey  = weapon.system?.skill;
  if (!skillKey) return [];
  const skillVal  = Number(actor.system?.skills?.[skillKey]?.value ?? 0);
  const weapTier  = Number(weapon.system?.tier ?? 1);
  const techs     = TECHNIQUES_BY_SKILL[skillKey] ?? [];
  return techs.filter(t =>
    skillVal  >= t.reqSkill &&
    weapTier  >= t.reqWeaponTier
  );
}

/** Описание статусов */
export const CONDITION_LABELS = {
  stunned:      { label:"Оглушён",       icon:"💫", color:"#facc15" },
  exposed:      { label:"Уязвим",        icon:"👁",  color:"#f87171" },
  pushed:       { label:"Отброшен",      icon:"💨", color:"#a8b8d0" },
  prone:        { label:"Повержен",      icon:"🤸", color:"#94a3b8" },
  bleeding:     { label:"Кровотечение",  icon:"🩸", color:"#ef4444" },
  slowed:       { label:"Замедлен",      icon:"🐢", color:"#818cf8" },
  grappled:     { label:"Захвачен",      icon:"🤼", color:"#f97316" },
  sleeping:     { label:"Усыплён",       icon:"💤", color:"#7dd3fc" },
  disarmed:     { label:"Разоружён",     icon:"✋", color:"#fbbf24" },
  shield_lost:  { label:"Без щита",      icon:"🔓", color:"#fb923c" },
  broken_limb:  { label:"Перелом",       icon:"🦴", color:"#a3a3a3" },
  armor_cracked:{ label:"Броня треснута",icon:"🪓", color:"#78716c" },
};
