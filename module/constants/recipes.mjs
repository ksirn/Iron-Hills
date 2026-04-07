export const CRAFT_RECIPES = {
  ironSword: {
    id: "ironSword",
    label: "Железный меч",
    skillKey: "blacksmithing",
    difficulty: 6,
    tool: { craftType: "blacksmithing", tier: 1 },
    ingredients: [
      { type: "material", category: "metal", quantity: 2 },
      { type: "material", category: "wood", quantity: 1 }
    ],
    result: {
      type: "weapon",
      name: "Железный меч",
      system: {
        damage: 3,
        damageType: "physical",
        skill: "sword",
        weight: 3,
        twoHanded: false,
        energyCost: 10
      }
    }
  },

  leatherVest: {
    id: "leatherVest",
    label: "Кожаный жилет",
    skillKey: "crafting",
    difficulty: 5,
    tool: { craftType: "crafting", tier: 1 },
    ingredients: [
      { type: "material", category: "hide", quantity: 3 },
      { type: "material", category: "fiber", quantity: 1 }
    ],
    result: {
      type: "armor",
      name: "Кожаный жилет",
      system: {
        slot: "torso",
        weight: 4,
        protection: {
          physical: 2,
          magical: 0
        }
      }
    }
  },

  herbalInfusion: {
    id: "herbalInfusion",
    label: "Травяной настой",
    skillKey: "alchemy",
    difficulty: 5,
    tool: { craftType: "alchemy", tier: 1 },
    ingredients: [
      { type: "material", category: "herbs", quantity: 2 },
      { type: "resource", category: "water", quantity: 1 }
    ],
    result: {
      type: "food",
      name: "Травяной настой",
      system: {
        satiety: 5,
        hydration: 25,
        weight: 1
      }
    }
  },

  stew: {
    id: "stew",
    label: "Похлёбка",
    skillKey: "cooking",
    difficulty: 4,
    tool: { craftType: "cooking", tier: 1 },
    ingredients: [
      { type: "material", category: "meat", quantity: 1 },
      { type: "material", category: "herbs", quantity: 1 },
      { type: "resource", category: "water", quantity: 1 }
    ],
    result: {
      type: "food",
      name: "Похлёбка",
      system: {
        satiety: 35,
        hydration: 10,
        weight: 1
      }
    }
  }
};