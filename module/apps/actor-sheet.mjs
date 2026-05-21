import {
  getPersistentActor,
} from "../utils/actor-utils.mjs";
import {
  buildActorSheetDataContext,
  prepareActorSheetDataActor,
} from "../services/actor-sheet-data-service.mjs";
import {
  dropItemForActorSheet,
} from "../services/actor-sheet-orchestration-service.mjs";
import { bindActorSheetListeners } from "./actor-sheet-listeners.mjs";
import { TarkovTradeApp } from "./tarkov-trade-app.mjs";

class IronHillsActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["iron-hills", "sheet", "actor"],
      width: 820,
      height: 700,
      resizable: true,
    });
  }

  get template() {
    return `systems/iron-hills-system/templates/actor/${this.actor.type}-sheet.hbs`;
  }

  _getActorForState() {
    return getPersistentActor(this.actor) ?? this.actor;
  }

  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);

    if (data?.type === "Item") {
      return this._onDropItem(event, data);
    }

    return super._onDrop(event);
  }

  async _onDropItem(event, data) {
    return dropItemForActorSheet(this, data);
  }

  async getData() {
    const actor = this._getActorForState();
    await prepareActorSheetDataActor(actor);
    const context = await super.getData();

    return buildActorSheetDataContext({
      actor,
      sourceActor: this.actor,
      context,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    bindActorSheetListeners(this, html, {
      actorSheetClass: IronHillsActorSheet,
      tradeAppClass: TarkovTradeApp,
    });
  }
}

export { IronHillsActorSheet };
