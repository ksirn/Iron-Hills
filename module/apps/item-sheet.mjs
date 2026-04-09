class IronHillsItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills-sheet", "sheet", "actor"],
      width: 540,
      height: 480
    });
  }

  get template() {
    switch (this.item.type) {
      case "weapon":
        return "systems/iron-hills-system/templates/item/weapon-sheet.hbs";
      case "armor":
        return "systems/iron-hills-system/templates/item/armor-sheet.hbs";
      case "food":
        return "systems/iron-hills-system/templates/item/food-sheet.hbs";
      case "material":
        return "systems/iron-hills-system/templates/item/material-sheet.hbs";
      case "resource":
        return "systems/iron-hills-system/templates/item/resource-sheet.hbs";
      case "tool":
        return "systems/iron-hills-system/templates/item/tool-sheet.hbs";
      case "spell":
        return "systems/iron-hills-system/templates/item/spell-sheet.hbs";
      case "potion":
        return "systems/iron-hills-system/templates/item/potion-sheet.hbs";
      case "scroll":
        return "systems/iron-hills-system/templates/item/scroll-sheet.hbs";
      case "throwable":
        return "systems/iron-hills-system/templates/item/throwable-sheet.hbs";
      case "consumable":
        return "systems/iron-hills-system/templates/item/consumable-sheet.hbs";
      default:
        return "systems/iron-hills-system/templates/item/generic-item-sheet.hbs";
    }
  }

  async getData() {
    const context = await super.getData();
    context.system = this.item.system;
    return context;
  }
}

export { IronHillsItemSheet };
