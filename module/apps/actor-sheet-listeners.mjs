import {
  addRelationForActor,
  changeRelationScoreForActor,
} from "../services/relation-ui-service.mjs";
import {
  addDiseaseForActorSheet,
  advanceCombatTurnForActorSheet,
  assignQuickSlotForActorSheet,
  cancelPendingCombatActionForActorSheet,
  castSpellLikeForActorSheet,
  clearQuickSlotForActorSheet,
  continuePendingCombatActionForActorSheet,
  craftRecipeForActorSheet,
  cureDiseaseForActorSheet,
  deleteOwnedItemForActorSheet,
  endCombatForActorSheet,
  endCombatTurnForActorSheet,
  equipArmorForActorSheet,
  equipWeaponForActorSheet,
  fullRestForActorSheet,
  getActorForSheet,
  openTradeWindowForActorSheet,
  performHandAttackForActorSheet,
  repairItemForActorSheet,
  reviveActorForActorSheet,
  rollUniversalSkillForActorSheet,
  shortRestForActorSheet,
  startCombatForActorSheet,
  toggleAwakenedForActorSheet,
  unequipArmorForActorSheet,
  unequipHandForActorSheet,
  updateActiveEffectsTickForActorSheet,
  useInventoryActionForActorSheet,
  useQuickSlotForActorSheet,
} from "../services/actor-sheet-orchestration-service.mjs";

function bindClick(html, selector, handler, {
  stopPropagation = false,
  preventDefault = true,
} = {}) {
  html.find(selector).on("click", async event => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();
    await handler(event);
  });
}

function getActorItem(actor, event) {
  const itemId = event.currentTarget.dataset.itemId;
  return itemId ? actor.items.get(itemId) : null;
}

async function handleRelationChange(sheet, actor, event) {
  const relId = event.currentTarget.dataset.relId;
  const change = Number(event.currentTarget.dataset.relChange ?? 0);
  return changeRelationScoreForActor(actor, relId, change, {
    render: (force) => sheet.render(force),
  });
}

async function handleAddRelation(sheet, actor) {
  return addRelationForActor(actor, {
    render: (force) => sheet.render(force),
  });
}

function bindCombatControls(sheet, html, options) {
  bindClick(html, "[data-action='continue-pending-combat']", () => continuePendingCombatActionForActorSheet(sheet, options));
  bindClick(html, "[data-action='cancel-pending-combat']", () => cancelPendingCombatActionForActorSheet(sheet));
  bindClick(html, "[data-action='end-combat-turn']", () => endCombatTurnForActorSheet(sheet));
  bindClick(html, "[data-start-combat]", () => startCombatForActorSheet(sheet));
  bindClick(html, "[data-end-combat]", () => endCombatForActorSheet(sheet));
  bindClick(html, "[data-next-turn]", () => advanceCombatTurnForActorSheet(sheet));
  bindClick(html, "[data-continue-pending-action]", () => continuePendingCombatActionForActorSheet(sheet, options));
  bindClick(html, "[data-cancel-pending-action]", () => cancelPendingCombatActionForActorSheet(sheet));
}

function bindEquipmentControls(sheet, html, options) {
  bindClick(html, "[data-equip-right]", event => equipWeaponForActorSheet(sheet, event.currentTarget.dataset.itemId, "rightHand", options));
  bindClick(html, "[data-equip-left]", event => equipWeaponForActorSheet(sheet, event.currentTarget.dataset.itemId, "leftHand", options));
  bindClick(html, "[data-unequip-right]", () => unequipHandForActorSheet(sheet, "rightHand", options));
  bindClick(html, "[data-unequip-left]", () => unequipHandForActorSheet(sheet, "leftHand", options));
  bindClick(html, "[data-equip-armor]", event => equipArmorForActorSheet(sheet, event.currentTarget.dataset.itemId, options));
  bindClick(html, "[data-unequip-armor]", event => unequipArmorForActorSheet(sheet, event.currentTarget.dataset.slotKey, options));
  bindClick(html, "[data-assign-quickslot]", event =>
    assignQuickSlotForActorSheet(sheet, event.currentTarget.dataset.itemId, event.currentTarget.dataset.slotKey)
  );
  bindClick(html, "[data-clear-quickslot]", event => clearQuickSlotForActorSheet(sheet, event.currentTarget.dataset.slotKey));
  bindClick(html, "[data-use-quickslot]", event => useQuickSlotForActorSheet(sheet, event.currentTarget.dataset.slotKey, {
    targets: globalThis.game?.user?.targets ?? [],
  }, options));
  bindClick(html, "[data-delete-item]", event => deleteOwnedItemForActorSheet(sheet, event.currentTarget.dataset.itemId, options));
}

function bindItemUseControls(sheet, html, options) {
  bindClick(html, "[data-item-action]", event => useInventoryActionForActorSheet(sheet, event.currentTarget.dataset.itemAction, event.currentTarget.dataset.itemId, {
    targets: globalThis.game?.user?.targets ?? [],
  }, options));
}

function bindActorStateControls(sheet, html, actor) {
  bindClick(html, "[data-short-rest]", () => shortRestForActorSheet(sheet));
  bindClick(html, "[data-full-rest]", () => fullRestForActorSheet(sheet));
  bindClick(html, "[data-update-effects]", () => updateActiveEffectsTickForActorSheet(sheet));
  bindClick(html, "[data-toggle-awakened]", () => toggleAwakenedForActorSheet(sheet, actor));
  bindClick(html, "[data-cure-disease]", event => cureDiseaseForActorSheet(sheet, actor, event.currentTarget.dataset.cureDisease));
  bindClick(html, "[data-add-disease]", () => addDiseaseForActorSheet(sheet, actor));

  bindClick(html, "[data-revive-actor]", async event => {
    if (!game.user?.isGM) {
      ui.notifications.warn("РўРѕР»СЊРєРѕ GM РјРѕР¶РµС‚ РІРѕСЃРєСЂРµС€Р°С‚СЊ РїРµСЂСЃРѕРЅР°Р¶РµР№.");
      return;
    }

    await reviveActorForActorSheet(sheet, actor, Number(event.currentTarget.dataset.quality ?? 1));
  });
}

function bindWorldRelationControls(sheet, html, actor) {
  bindClick(html, "[data-rel-change]", event => handleRelationChange(sheet, actor, event));
  bindClick(html, "[data-add-relation]", () => handleAddRelation(sheet, actor));
}

function bindSkillAndCraftControls(sheet, html, actor) {
  bindClick(html, "[data-skill-roll]", async event => {
    const skillKey = event.currentTarget.dataset.skillRoll;
    const label = event.currentTarget.dataset.label ?? skillKey;
    const threshold = event.currentTarget.dataset.threshold
      ? Number(event.currentTarget.dataset.threshold)
      : null;
    await rollUniversalSkillForActorSheet(sheet, skillKey, label, { threshold });
  });

  bindClick(html, "[data-item-repair]", async event => {
    const item = getActorItem(actor, event);
    if (!item) return;
    await repairItemForActorSheet(sheet, actor, item);
  });

  bindClick(html, "[data-craft-recipe]", event => craftRecipeForActorSheet(sheet, event.currentTarget.dataset.recipeId));
}

function bindMagicAndCombatActions(sheet, html, actor, options) {
  bindClick(html, "[data-cast-spell]", async event => {
    const item = getActorItem(actor, event);
    await castSpellLikeForActorSheet(sheet, { item, isScroll: false }, options);
  });

  bindClick(html, "[data-use-scroll]", async event => {
    const item = getActorItem(actor, event);
    await castSpellLikeForActorSheet(sheet, { item, isScroll: true }, options);
  });

  bindClick(html, "[data-attack]", event => performHandAttackForActorSheet(sheet, event.currentTarget.dataset.attack, actor, options));
}

export function bindActorSheetListeners(sheet, html, options = {}) {
  const actor = getActorForSheet(sheet);

  html.find("[data-open-inventory]").on("click", () => {
    game.ironHills?.openGridInventory?.(getActorForSheet(sheet));
  });

  html.find("a.is-disabled").on("click", event => {
    event.preventDefault();
    event.stopPropagation();

    const reason = event.currentTarget.getAttribute("title") || "Р”РµР№СЃС‚РІРёРµ РЅРµРґРѕСЃС‚СѓРїРЅРѕ";
    ui.notifications.warn(reason);
  });

  bindCombatControls(sheet, html, options);
  bindEquipmentControls(sheet, html, options);
  bindItemUseControls(sheet, html, options);
  bindActorStateControls(sheet, html, actor);
  bindWorldRelationControls(sheet, html, actor);
  bindSkillAndCraftControls(sheet, html, actor);
  bindMagicAndCombatActions(sheet, html, actor, options);

  bindClick(html, "[data-open-trade-app]", () => openTradeWindowForActorSheet(sheet, options), {
    stopPropagation: true,
  });
}
