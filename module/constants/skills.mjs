/**
 * Iron Hills — Skills
 * Полный список навыков. Навык = ступень (1-10).
 * Куб броска = d(навык*2), порог = навык*2.
 */

export const SKILL_GROUPS = [
  {
    key: "physical",
    label: "Физические",
    skills: [
      { key:"athletics",   label:"Атлетика",        desc:"Бег, прыжки, лазание" },
      { key:"endurance",   label:"Выносливость",     desc:"Длительные нагрузки, сопротивление боли" },
      { key:"perception",  label:"Внимательность",   desc:"Замечать детали, засады, следы" },
      { key:"survival",    label:"Выживание",         desc:"Ориентирование, охота, лагерь" },
      { key:"stealth",     label:"Скрытность",        desc:"Тихое передвижение, укрытие" },
      { key:"riding",      label:"Верховая езда",     desc:"Управление лошадью и ездовыми" },
      { key:"medicine",    label:"Медицина",           desc:"Перевязка ран, лечение болезней" },
      { key:"swimming",    label:"Плавание",           desc:"Преодоление водных препятствий, подводная охота" },
      { key:"lockpicking", label:"Взлом",              desc:"Замки, ловушки, механизмы" },
    ]
  },
  {
    key: "social",
    label: "Социальные",
    skills: [
      { key:"trade",       label:"Торговля",          desc:"Торг, оценка товара. Влияет на цены" },
      { key:"persuasion",  label:"Убеждение",         desc:"Уговоры, ложь, дипломатия, запугивание" },
      { key:"streetwise",  label:"Уличная смекалка",  desc:"Слухи, криминальные связи, чёрный рынок" },
      { key:"leadership",  label:"Лидерство",          desc:"Командование, поднятие морали" },
      { key:"lore",        label:"Знания",             desc:"История, легенды, магия, анатомия" },
      { key:"acting",      label:"Актёрство",          desc:"Маскировка, перевоплощение, обман внешностью" },
      { key:"taming",      label:"Дрессировка",        desc:"Управление животными, приручение" },
    ]
  },
  {
    key: "combat",
    label: "Оружие",
    skills: [
      { key:"sword",       label:"Мечи",              desc:"Одноручные и полуторные мечи" },
      { key:"axe",         label:"Топоры",             desc:"Боевые топоры и секиры" },
      { key:"spear",       label:"Копья",              desc:"Копья, алебарды, посохи" },
      { key:"knife",       label:"Ножи",               desc:"Ножи, кинжалы, короткие клинки" },
      { key:"mace",        label:"Булавы",             desc:"Булавы, молоты, дубины с навершием" },
      { key:"flail",       label:"Кистени",            desc:"Кистени, цепи, гибкое оружие" },
      { key:"bow",         label:"Луки",               desc:"Короткие и длинные луки" },
      { key:"crossbow",    label:"Арбалеты",           desc:"Лёгкие и тяжёлые арбалеты" },
      { key:"throwing",    label:"Метательное",        desc:"Ножи, камни, дротики" },
      { key:"unarmed",     label:"Без оружия",         desc:"Кулачный бой, борьба" },
      { key:"shield",      label:"Щит",                desc:"Блок, отражение, таранный удар" },
      { key:"exotic",      label:"Экзотическое",       desc:"Нестандартное и редкое оружие" },
    ]
  },
  {
    key: "craft",
    label: "Ремесло",
    skills: [
      { key:"blacksmithing",label:"Кузнечное дело",   desc:"Оружие и броня из металла" },
      { key:"crafting",    label:"Ремесло",            desc:"Кожа, дерево, ткань" },
      { key:"alchemy",     label:"Алхимия",            desc:"Зелья, яды, реагенты" },
      { key:"cooking",     label:"Готовка",            desc:"Еда с бонусами, консервация" },
      { key:"mining",      label:"Горное дело",        desc:"Добыча руды, работа в шахте" },
      { key:"herbalism",   label:"Травничество",       desc:"Сбор и определение трав" },
      { key:"enchanting",  label:"Зачарование",        desc:"Нанесение магических свойств на предметы. Требует мана-камней" },
      { key:"jewelry",     label:"Ювелирное дело",     desc:"Кольца, амулеты, инкрустация камней" },
      { key:"appraisal",   label:"Оценка",              desc:"Определение стоимости, происхождения и свойств предметов. Полная идентификация." },
    ]
  },
  {
    key: "magic",
    label: "Магия",
    skills: [
      { key:"fire",        label:"Огонь",              desc:"Горение, свет, тепло, взрывы" },
      { key:"water",       label:"Вода",               desc:"Лёд, лечение, очищение" },
      { key:"earth",       label:"Земля",              desc:"Камень, металл, защита" },
      { key:"air",         label:"Воздух",             desc:"Ветер, молния, скорость" },
      { key:"life",        label:"Жизнь",              desc:"Исцеление, яды, некромантия" },
      { key:"mind",        label:"Разум",              desc:"Иллюзии, контроль, телепатия" },
    ]
  }
];

export const SKILLS_FLAT = SKILL_GROUPS.flatMap(g => g.skills.map(s => ({ ...s, group: g.key })));

export const TRADE_SKILL_MODIFIERS = {
  1:  { buy: 1.20, sell: 0.60 },
  2:  { buy: 1.10, sell: 0.70 },
  3:  { buy: 1.05, sell: 0.75 },
  4:  { buy: 1.00, sell: 0.80 },
  5:  { buy: 0.95, sell: 0.85 },
  6:  { buy: 0.90, sell: 0.88 },
  7:  { buy: 0.85, sell: 0.90 },
  8:  { buy: 0.80, sell: 0.93 },
  9:  { buy: 0.75, sell: 0.95 },
  10: { buy: 0.70, sell: 1.00 },
};
