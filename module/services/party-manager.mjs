/**
 * Iron Hills — Party Manager
 * Управление группами персонажей (пачками).
 * Группы хранятся в game.settings.
 */

const SETTING_KEY = "partyGroups";
const SETTING_SCOPE = "world";

// Структура группы
// { id, label, color, isActive, localHours, location, status, memberIds[] }

export function getPartyGroups() {
  try {
    return game.settings.get("iron-hills-system", SETTING_KEY) ?? [];
  } catch {
    return [];
  }
}

export async function savePartyGroups(groups) {
  await game.settings.set("iron-hills-system", SETTING_KEY, groups);
}

export function getGroupForActor(actorId) {
  const groups = getPartyGroups();
  return groups.find(g => g.memberIds?.includes(actorId)) ?? null;
}

export function getActiveGroup() {
  return getPartyGroups().find(g => g.isActive) ?? null;
}

export function getMembersOfGroup(groupId) {
  const group = getPartyGroups().find(g => g.id === groupId);
  if (!group) return [];
  return (group.memberIds ?? [])
    .map(id => game.actors.get(id))
    .filter(Boolean);
}

export function registerPartySettings() {
  game.settings.register("iron-hills-system", SETTING_KEY, {
    name:    "Группы персонажей",
    scope:   SETTING_SCOPE,
    config:  false,
    type:    Array,
    default: []
  });
}

// ─── Party Manager App ───────────────────────────────────

export class IronHillsPartyManagerApp extends Application {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "party-manager"],
      width:     480,
      height:    500,
      resizable: true,
      title:     "👥 Группы персонажей"
    });
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/party-manager.hbs";
  }

  async getData() {
    const groups   = getPartyGroups();
    const allChars = (game.actors ?? [])
      .filter(a => a.type === "character")
      .map(a => ({
        id:       a.id,
        name:     a.name,
        img:      a.img,
        groupId:  getGroupForActor(a.id)?.id ?? "",
        groupLabel: getGroupForActor(a.id)?.label ?? "Без группы"
      }));

    return {
      groups: groups.map(g => ({
        ...g,
        members: (g.memberIds ?? [])
          .map(id => game.actors.get(id))
          .filter(Boolean)
          .map(a => ({ id: a.id, name: a.name, img: a.img })),
        memberCount: (g.memberIds ?? []).length,
        localHoursDisplay: g.localHours ?? 0,
      })),
      allChars,
      unassigned: allChars.filter(c => !c.groupId)
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Создать группу
    html.find("[data-create-group]").on("click", async () => {
      const name = await new Promise(resolve => {
        const dlg = new Dialog({
          title: "Новая группа",
          content: `<input id="grp-name" type="text" placeholder="Название группы"
            style="width:100%;background:#1b2333;border:1px solid rgba(120,150,200,0.3);
                   color:#e8edf5;padding:6px;border-radius:6px;">`,
          buttons: {
            ok: { label: "Создать", callback: () => resolve(document.getElementById("grp-name")?.value) }
          },
          default: "ok",
          close: () => resolve(null)
        });
        dlg.render(true);
      });
      if (!name) return;

      const groups = getPartyGroups();
      groups.push({
        id:         foundry.utils.randomID(),
        label:      name,
        color:      "#5b9cf6",
        isActive:   groups.length === 0,
        localHours: 0,
        location:   "",
        status:     "idle",
        memberIds:  []
      });
      await savePartyGroups(groups);
      this.render(false);
    });

    // Удалить группу
    html.find("[data-delete-group]").on("click", async e => {
      const groupId = e.currentTarget.dataset.groupId;
      const groups  = getPartyGroups().filter(g => g.id !== groupId);
      await savePartyGroups(groups);
      this.render(false);
    });

    // Сделать активной
    html.find("[data-activate-group]").on("click", async e => {
      const groupId = e.currentTarget.dataset.groupId;
      const groups  = getPartyGroups().map(g => ({ ...g, isActive: g.id === groupId }));
      await savePartyGroups(groups);
      this.render(false);
      ui.notifications.info(`Активная группа: ${groups.find(g => g.id === groupId)?.label}`);
    });

    // Добавить персонажа в группу
    html.find("[data-assign-char]").on("change", async e => {
      const charId  = e.currentTarget.dataset.charId;
      const groupId = e.currentTarget.value;

      const groups = getPartyGroups().map(g => ({
        ...g,
        memberIds: g.id === groupId
          ? [...new Set([...(g.memberIds ?? []), charId])]
          : (g.memberIds ?? []).filter(id => id !== charId)
      }));
      await savePartyGroups(groups);
      this.render(false);
    });

    // Удалить из группы
    html.find("[data-remove-member]").on("click", async e => {
      const { groupId, charId } = e.currentTarget.dataset;
      const groups = getPartyGroups().map(g => ({
        ...g,
        memberIds: g.id === groupId
          ? (g.memberIds ?? []).filter(id => id !== charId)
          : g.memberIds
      }));
      await savePartyGroups(groups);
      this.render(false);
    });

    // Изменить локацию
    html.find("[data-group-location]").on("change", async e => {
      const groupId = e.currentTarget.dataset.groupId;
      const loc     = e.currentTarget.value;
      const groups  = getPartyGroups().map(g =>
        g.id === groupId ? { ...g, location: loc } : g
      );
      await savePartyGroups(groups);
    });
  }
}
