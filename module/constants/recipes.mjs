/**
 * Iron Hills — Craft Recipes
 * Рецепты крафта по ступеням.
 * difficulty = порог навыка (1-20 соответствует ступени 1-10).
 */

export const CRAFT_RECIPES = {

  // ══════════════════════════════════════════════
  // СТУПЕНЬ 1 — начальные рецепты
  // ══════════════════════════════════════════════

  // Кузнечное дело
  iron_knife: {
    id:"iron_knife", label:"Железный нож",
    skillKey:"blacksmithing", difficulty:2,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[
      { type:"material", category:"metal", tier:1, quantity:1 }
    ],
    result:{ type:"weapon", name:"Железный нож",
      system:{ damage:3, damageType:"physical", skill:"knife", weight:0.5, twoHanded:false, energyCost:5, tier:1 }}
  },
  iron_sword: {
    id:"iron_sword", label:"Железный меч",
    skillKey:"blacksmithing", difficulty:4,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[
      { type:"material", category:"metal", tier:1, quantity:2 },
      { type:"material", category:"wood",  tier:1, quantity:1 }
    ],
    result:{ type:"weapon", name:"Железный меч",
      system:{ damage:4, damageType:"physical", skill:"sword", weight:3, twoHanded:false, energyCost:8, tier:1 }}
  },
  iron_axe: {
    id:"iron_axe", label:"Железный топор",
    skillKey:"blacksmithing", difficulty:3,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[
      { type:"material", category:"metal", tier:1, quantity:2 },
      { type:"material", category:"wood",  tier:1, quantity:1 }
    ],
    result:{ type:"weapon", name:"Железный топор",
      system:{ damage:4, damageType:"physical", skill:"axe", weight:3, twoHanded:false, energyCost:9, tier:1 }}
  },
  iron_spear: {
    id:"iron_spear", label:"Железное копьё",
    skillKey:"blacksmithing", difficulty:3,
    tool:{ craftType:"blacksmithing", tier:1 },
    ingredients:[
      { type:"material", category:"metal", tier:1, quantity:1 },
      { type:"material", category:"wood",  tier:1, quantity:2 }
    ],
    result:{ type:"weapon", name:"Железное копьё",
      system:{ damage:4, damageType:"physical", skill:"spear", weight:3, twoHanded:true, energyCost:7, tier:1 }}
  },
  leather_jacket: {
    id:"leather_jacket", label:"Кожаная куртка",
    skillKey:"crafting", difficulty:3,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { type:"material", category:"hide",  tier:1, quantity:3 },
      { type:"material", category:"fiber", tier:1, quantity:1 }
    ],
    result:{ type:"armor", name:"Кожаная куртка",
      system:{ slot:"torso", protection:{ physical:2, magical:0 }, weight:3, tier:1 }}
  },
  leather_cap: {
    id:"leather_cap", label:"Кожаная шапка",
    skillKey:"crafting", difficulty:2,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { type:"material", category:"hide", tier:1, quantity:1 },
      { type:"material", category:"fiber",tier:1, quantity:1 }
    ],
    result:{ type:"armor", name:"Кожаная шапка",
      system:{ slot:"head", protection:{ physical:1, magical:0 }, weight:0.5, tier:1 }}
  },
  wooden_shield: {
    id:"wooden_shield", label:"Деревянный щит",
    skillKey:"crafting", difficulty:2,
    tool:{ craftType:"crafting", tier:1 },
    ingredients:[
      { type:"material", category:"wood", tier:1, quantity:3 },
      { type:"material", category:"metal",tier:1, quantity:1 }
    ],
    result:{ type:"armor", name:"Деревянный щит",
      system:{ slot:"leftHand", protection:{ physical:2, magical:0 }, weight:2, tier:1 }}
  },

  // Алхимия 1ст.
  minor_heal_potion: {
    id:"minor_heal_potion", label:"Малое зелье лечения",
    skillKey:"alchemy", difficulty:2,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { type:"material", category:"herb", tier:1, quantity:2 }
    ],
    result:{ type:"potion", name:"Малое зелье лечения",
      system:{ effect:"healHP", power:3, scope:"single", target:"self", weight:0.3, tier:1 }}
  },
  minor_energy_potion: {
    id:"minor_energy_potion", label:"Малое зелье бодрости",
    skillKey:"alchemy", difficulty:2,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { type:"material", category:"herb", tier:1, quantity:2 }
    ],
    result:{ type:"potion", name:"Малое зелье бодрости",
      system:{ effect:"restoreEnergy", power:4, scope:"single", target:"self", weight:0.3, tier:1 }}
  },
  antidote_weak: {
    id:"antidote_weak", label:"Слабое противоядие",
    skillKey:"alchemy", difficulty:3,
    tool:{ craftType:"alchemy", tier:1 },
    ingredients:[
      { type:"material", category:"herb", tier:1, quantity:2 },
      { type:"material", category:"herb", tier:1, quantity:1 }
    ],
    result:{ type:"potion", name:"Слабое противоядие",
      system:{ effect:"curePoison", power:1, scope:"single", target:"self", weight:0.3, tier:1 }}
  },

  // Готовка 1ст.
  cooked_stew: {
    id:"cooked_stew", label:"Тушёное мясо",
    skillKey:"cooking", difficulty:2,
    tool:{ craftType:"cooking", tier:1 },
    ingredients:[
      { type:"food", category:"meat",  tier:1, quantity:1 },
      { type:"material", category:"herb", tier:1, quantity:1 }
    ],
    result:{ type:"food", name:"Тушёное мясо",
      system:{ satiety:30, hydration:10, weight:0.8, tier:1 }}
  },

  // ══════════════════════════════════════════════
  // СТУПЕНЬ 2 — продвинутые рецепты
  // ══════════════════════════════════════════════

  steel_sword: {
    id:"steel_sword", label:"Стальной меч",
    skillKey:"blacksmithing", difficulty:8,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { type:"material", category:"metal", tier:2, quantity:2 },
      { type:"material", category:"wood",  tier:1, quantity:1 },
      { type:"material", category:"hide",  tier:1, quantity:1 }
    ],
    result:{ type:"weapon", name:"Стальной меч",
      system:{ damage:6, damageType:"physical", skill:"sword", weight:2.5, twoHanded:false, energyCost:8, tier:2 }}
  },
  steel_axe: {
    id:"steel_axe", label:"Стальной топор",
    skillKey:"blacksmithing", difficulty:7,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { type:"material", category:"metal", tier:2, quantity:2 },
      { type:"material", category:"wood",  tier:1, quantity:1 }
    ],
    result:{ type:"weapon", name:"Стальной топор",
      system:{ damage:7, damageType:"physical", skill:"axe", weight:3, twoHanded:false, energyCost:9, tier:2 }}
  },
  chainmail: {
    id:"chainmail", label:"Кольчуга",
    skillKey:"blacksmithing", difficulty:10,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { type:"material", category:"metal", tier:2, quantity:4 },
      { type:"material", category:"metal", tier:1, quantity:2 }
    ],
    result:{ type:"armor", name:"Кольчуга",
      system:{ slot:"torso", protection:{ physical:4, magical:0 }, weight:8, tier:2 }}
  },
  iron_shield: {
    id:"iron_shield", label:"Железный щит",
    skillKey:"blacksmithing", difficulty:6,
    tool:{ craftType:"blacksmithing", tier:2 },
    ingredients:[
      { type:"material", category:"metal", tier:1, quantity:3 },
      { type:"material", category:"wood",  tier:1, quantity:1 }
    ],
    result:{ type:"armor", name:"Железный щит",
      system:{ slot:"leftHand", protection:{ physical:4, magical:0 }, weight:4, tier:2 }}
  },

  // Алхимия 2ст.
  heal_potion: {
    id:"heal_potion", label:"Зелье лечения",
    skillKey:"alchemy", difficulty:6,
    tool:{ craftType:"alchemy", tier:2 },
    ingredients:[
      { type:"material", category:"herb", tier:2, quantity:2 },
      { type:"material", category:"herb", tier:1, quantity:1 }
    ],
    result:{ type:"potion", name:"Зелье лечения",
      system:{ effect:"healHP", power:8, scope:"single", target:"self", weight:0.3, tier:2 }}
  },
  mana_potion: {
    id:"mana_potion", label:"Зелье маны",
    skillKey:"alchemy", difficulty:8,
    tool:{ craftType:"alchemy", tier:2 },
    ingredients:[
      { type:"material", category:"herb",  tier:2, quantity:1 },
      { type:"material", category:"stone", tier:2, quantity:1 }
    ],
    result:{ type:"potion", name:"Зелье маны",
      system:{ effect:"restoreMana", power:8, scope:"single", target:"self", weight:0.3, tier:2 }}
  },

  // ══════════════════════════════════════════════
  // СТУПЕНЬ 3 — мастерские рецепты
  // ══════════════════════════════════════════════

  tempered_sword: {
    id:"tempered_sword", label:"Закалённый меч",
    skillKey:"blacksmithing", difficulty:12,
    tool:{ craftType:"blacksmithing", tier:3 },
    ingredients:[
      { type:"material", category:"metal", tier:2, quantity:3 },
      { type:"material", category:"stone", tier:2, quantity:1 },
      { type:"material", category:"wood",  tier:2, quantity:1 }
    ],
    result:{ type:"weapon", name:"Закалённый меч",
      system:{ damage:8, damageType:"physical", skill:"sword", weight:2.5, twoHanded:false, energyCost:8, tier:3 }}
  },
  plate_chest: {
    id:"plate_chest", label:"Нагрудник",
    skillKey:"blacksmithing", difficulty:14,
    tool:{ craftType:"blacksmithing", tier:3 },
    ingredients:[
      { type:"material", category:"metal", tier:3, quantity:3 },
      { type:"material", category:"metal", tier:2, quantity:2 },
      { type:"material", category:"fiber", tier:2, quantity:1 }
    ],
    result:{ type:"armor", name:"Нагрудник",
      system:{ slot:"torso", protection:{ physical:7, magical:0 }, weight:12, tier:3 }}
  },
  greater_heal: {
    id:"greater_heal", label:"Большое зелье лечения",
    skillKey:"alchemy", difficulty:12,
    tool:{ craftType:"alchemy", tier:3 },
    ingredients:[
      { type:"material", category:"herb",  tier:3, quantity:1 },
      { type:"material", category:"herb",  tier:2, quantity:2 },
      { type:"material", category:"stone", tier:2, quantity:1 }
    ],
    result:{ type:"potion", name:"Большое зелье лечения",
      system:{ effect:"healHP", power:20, scope:"single", target:"self", weight:0.3, tier:3 }}
  },
};
