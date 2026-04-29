/**
 * Iron Hills — Launcher
 * Простой DOM-попап, не использует Application.
 * Появляется над кнопкой макроса, закрывается при клике вне.
 */

const TOOLS = [
  { section:"Персонаж", key:"openCombatHud",     label:"HUD",       icon:"⚔",  gm:false },
  { section:"Персонаж", key:"openGridInventory", label:"Инвентарь", icon:"🎒",  gm:false },
  { section:"Персонаж", key:"openCraftWindow",   label:"Крафт",     icon:"🔨",  gm:false },
  { section:"Персонаж", key:"openAlchemyWindow", label:"Алхимия",   icon:"⚗",  gm:false },
  { section:"Мир",      key:"openWorldMap",      label:"Карта",     icon:"🗺",  gm:false },
  { section:"Мир",      key:"openQuestBoard",    label:"Задания",   icon:"📋",  gm:false },
  { section:"Мир",      key:"openWorldJournal",  label:"Дневник",   icon:"📜",  gm:false },
  { section:"GM",       key:"openTravelManager", label:"Время",     icon:"⏳",  gm:true  },
  { section:"GM",       key:"openPartyManager",  label:"Группы",    icon:"👥",  gm:true  },
  { section:"GM",       key:"openCombatManager", label:"Бой",       icon:"🗡",  gm:true  },
  { section:"GM",       key:"openWorldTools",    label:"World",     icon:"🌍",  gm:true  },
];

let _popup = null;
let _closeHandler = null;

function closePopup() {
  _popup?.remove();
  _popup = null;
  if (_closeHandler) {
    document.removeEventListener("click", _closeHandler, true);
    _closeHandler = null;
  }
}

function openPopup() {
  // Тогл
  if (_popup) { closePopup(); return; }

  const isGM   = game.user?.isGM ?? false;
  const tools  = TOOLS.filter(t => !t.gm || isGM);

  // Строим HTML
  const popup = document.createElement("div");
  popup.id = "ih-launcher-popup";
  popup.className = "ih-launcher-popup";

  // Группируем
  const sections = [...new Set(tools.map(t => t.section))];
  for (const sec of sections) {
    const items = tools.filter(t => t.section === sec);

    const secEl = document.createElement("div");
    secEl.className = "ih-lp-section";

    const label = document.createElement("div");
    label.className = "ih-lp-label";
    label.textContent = sec;
    secEl.appendChild(label);

    const grid = document.createElement("div");
    grid.className = "ih-lp-grid";

    for (const tool of items) {
      const btn = document.createElement("button");
      btn.className = "ih-lp-btn";
      btn.title = tool.label;
      btn.innerHTML = `<span class="ih-lp-icon">${tool.icon}</span><span class="ih-lp-text">${tool.label}</span>`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const fn = game.ironHills?.[tool.key];
        if (typeof fn === "function") {
          const actor = canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
          try { fn(actor); } catch { try { fn(); } catch(err) { console.error(err); } }
        }
        closePopup();
      });
      grid.appendChild(btn);
    }

    secEl.appendChild(grid);
    popup.appendChild(secEl);
  }

  // Позиционируем над макробаром
  document.body.appendChild(popup);
  _popup = popup;

  // Определяем позицию
  const hotbar = document.getElementById("hotbar");
  if (hotbar) {
    const rect = hotbar.getBoundingClientRect();
    const ph   = popup.offsetHeight || 300;
    popup.style.left   = Math.max(4, rect.left) + "px";
    popup.style.bottom = (window.innerHeight - rect.top + 8) + "px";
  } else {
    popup.style.left   = "4px";
    popup.style.bottom = "80px";
  }

  // Закрываем при клике вне попапа
  setTimeout(() => {
    _closeHandler = (e) => {
      if (!popup.contains(e.target)) closePopup();
    };
    document.addEventListener("click", _closeHandler, true);
  }, 50);
}

class IronHillsLauncherApp {
  static open()  { openPopup(); }
  static close() { closePopup(); }
}

export { IronHillsLauncherApp };
