export const NPC_ROLE_PROFILES = {
  villager: {
    label: "Житель",
    skills: { endurance: 1, crafting: 1, cooking: 1, perception: 1 },
    defense: 5
  },
  guard: {
    label: "Стражник",
    skills: { sword: 2, endurance: 2, athletics: 1, perception: 1 },
    defense: 7
  },
  bandit: {
    label: "Бандит",
    skills: { knife: 2, throwing: 1, endurance: 1, perception: 1 },
    defense: 6
  },
  mage: {
    label: "Маг",
    skills: { fire: 2, water: 1, life: 1, mind: 1 },
    defense: 5
  },
  crafter: {
    label: "Ремесленник",
    skills: { blacksmithing: 2, crafting: 2, endurance: 1 },
    defense: 5
  },
  hunter: {
    label: "Охотник",
    skills: { throwing: 2, knife: 1, perception: 2, survival: 2 },
    defense: 6
  }
};