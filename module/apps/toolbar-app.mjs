/**
 * Iron Hills — Sidebar v1
 * Вертикальный бар слева под панелью инструментов Foundry.
 * Кнопка внизу бара сворачивает/разворачивает.
 */

const TOOLS = [
  { key:"openGridInventory", label:"Инвентарь", icon:"🎒",  gm:false, sec:"char"  },
  { key:"openCraftWindow",   label:"Крафт",     icon:"🔨",  gm:false, sec:"char"  },

  { key:"openSearch",        label:"Обыск",     icon:"🔍",  gm:false, sec:"char"  },
  { key:"openTrade",         label:"Торговля",  icon:"🏪",  gm:false, sec:"char"  },
  { key:"openAlchemyWindow", label:"Алхимия",   icon:"⚗",  gm:false, sec:"char"  },
  { key:"openWorldMap",      label:"Карта",     icon:"🗺",  gm:false, sec:"world" },
  { key:"openQuestBoard",    label:"Задания",   icon:"📋",  gm:false, sec:"world" },
  { key:"openWorldJournal",      label:"Дневник",    icon:"📜",  gm:false, sec:"world" },
  { key:"openCompendiumBrowser", label:"Справочник", icon:"📚",  gm:false, sec:"world" },
  { key:"openTravelManager", label:"Время",     icon:"⏳",  gm:true,  sec:"gm"    },
  { key:"openPartyManager",  label:"Группы",    icon:"👥",  gm:true,  sec:"gm"    },
  { key:"openCombatManager", label:"Бой",       icon:"🗡",  gm:true,  sec:"gm"    },
  { key:"openWorldTools",    label:"World",     icon:"🌍",  gm:true,  sec:"gm"    },
  { key:"openWeather",       label:"Погода",    icon:"🌤",  gm:true,  sec:"gm"    },
];

const SEC_LABELS = { char:"Персонаж", world:"Мир", gm:"GM" };
const SEC_ORDER  = ["char","world","gm"];

let _collapsed = localStorage.getItem("ih-sb-collapsed") === "1";

function build() {
  document.getElementById("ih-sb")?.remove();

  const isGM = game.user?.isGM ?? false;
  const sb   = document.createElement("nav");
  sb.id = "ih-sb";
  if (_collapsed) sb.dataset.collapsed = "1";

  if (!_collapsed) {
    for (const secId of SEC_ORDER) {
      const items = TOOLS.filter(t => t.sec === secId && (!t.gm || isGM));
      if (!items.length) continue;

      // Вертикальный разделитель между секциями
      if (sb.querySelector(".ih-sb-btn")) {
        const sep = document.createElement("div");
        sep.className = "ih-sb-lbl";
        sb.appendChild(sep);
      }

      for (const t of items) {
        const btn = document.createElement("button");
        btn.className = "ih-sb-btn";
        btn.title     = t.label;
        btn.innerHTML = `<span class="ih-sb-icon">${t.icon}</span>
                         <span class="ih-sb-txt">${t.label}</span>`;
        btn.addEventListener("click", () => {
          // Режимы движения — особый вызов
          const fn = game.ironHills?.[t.key];
          if (!fn) { ui.notifications?.warn(t.label + " недоступно"); return; }
          const actor = canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
          try { fn(actor); } catch { try { fn(); } catch(e) { console.error(e); } }
        });
        sb.appendChild(btn);
      }
    }

    // Время мира
    const time = document.createElement("div");
    time.id        = "ih-sb-time";
    time.innerHTML = `<div class="ih-sb-time-icon">🕐</div>
                      <div id="ih-sb-tv">—</div>`;
    sb.appendChild(time);
  }

  // Кнопка сворачивания — всегда внизу
  const tog = document.createElement("button");
  tog.id          = "ih-sb-tog";
  tog.title       = _collapsed ? "Развернуть панель" : "Свернуть панель";
  tog.textContent = _collapsed ? "▶" : "◀";
  tog.addEventListener("click", () => {
    _collapsed = !_collapsed;
    localStorage.setItem("ih-sb-collapsed", _collapsed ? "1" : "0");
    build();
  });
  sb.appendChild(tog);

  document.body.appendChild(sb);
  updateTime();
}

function updateTime() {
  const el = document.getElementById("ih-sb-tv");
  if (!el) return;
  const w = game.time?.worldTime ?? 0;
  const h = Math.floor((w / 3600) % 24);
  const m = Math.floor((w / 60)   % 60);
  const d = Math.floor(w / 86400);
  el.innerHTML = `<span style="font-size:8px;color:var(--ih-text-2)">День ${d + 1}</span>
                  <span style="font-size:12px">${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}</span>`;
}

export function initToolbar() {
  Hooks.once("ready", () => {
    build();
    setTimeout(() => updateTime(), 500);
    setInterval(() => updateTime(), 30000);
  });
  Hooks.on("updateWorldTime", () => updateTime());
}
