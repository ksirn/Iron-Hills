// Iron Hills — World Map Data
export const TERRAIN_TYPES = {
  "road": {
    "label": "Дорога",
    "icon": "🛤",
    "costHours": 0.5,
    "color": "#a8956b"
  },
  "plains": {
    "label": "Равнина",
    "icon": "🌾",
    "costHours": 1,
    "color": "#6b8e4e"
  },
  "forest": {
    "label": "Лес",
    "icon": "🌲",
    "costHours": 2,
    "color": "#2d5a27"
  },
  "swamp": {
    "label": "Болото",
    "icon": "💧",
    "costHours": 3,
    "color": "#4a6741"
  },
  "hills": {
    "label": "Холмы",
    "icon": "⛰",
    "costHours": 2,
    "color": "#7a6548"
  },
  "mountains": {
    "label": "Горы",
    "icon": "🏔",
    "costHours": 4,
    "color": "#6b6b6b"
  },
  "pass": {
    "label": "Перевал",
    "icon": "🏔",
    "costHours": 6,
    "color": "#8b7355"
  },
  "river": {
    "label": "Река",
    "icon": "🌊",
    "costHours": 99,
    "color": "#3b82f6",
    "blockedFor": [
      "foot",
      "horse",
      "cart"
    ]
  },
  "town": {
    "label": "Город",
    "icon": "🏘",
    "costHours": 0,
    "color": "#c4a35a"
  },
  "ruin": {
    "label": "Руины",
    "icon": "🏚",
    "costHours": 1,
    "color": "#7a7a7a"
  },
  "dungeon": {
    "label": "Подземелье",
    "icon": "⚰",
    "costHours": 1,
    "color": "#4a3728"
  },
  "mine": {
    "label": "Шахта",
    "icon": "⛏",
    "costHours": 1,
    "color": "#5a5a6b"
  }
};

export const TRANSPORT_TYPES = {
  "foot": {
    "label": "Пешком",
    "icon": "🚶",
    "speedMult": 1.0,
    "blocked": [
      "river"
    ]
  },
  "horse": {
    "label": "Верхом",
    "icon": "🐴",
    "speedMult": 0.6,
    "blocked": [
      "river",
      "mountains"
    ]
  },
  "cart": {
    "label": "Телега",
    "icon": "🛒",
    "speedMult": 0.8,
    "blocked": [
      "river",
      "mountains",
      "pass",
      "swamp"
    ]
  },
  "boat": {
    "label": "Лодка",
    "icon": "⛵",
    "speedMult": 0.3,
    "onlyOn": [
      "river"
    ]
  }
};

export const DEFAULT_REGIONS = {
  "iron_hills": {
    "id": "iron_hills",
    "label": "Iron Hills",
    "cols": 10,
    "rows": 10,
    "tileSize": 60,
    "tiles": [
      {
        "col": 0,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 0,
        "terrain": "pass",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 0,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 1,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 1,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 1,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 1,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 1,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 1,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 1,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 1,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 1,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 1,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 2,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 2,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 2,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 2,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 2,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 2,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 2,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 2,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 2,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 2,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 3,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 3,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 3,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 3,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 3,
        "terrain": "road",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 3,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 3,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 3,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 3,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 3,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 4,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 4,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 4,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 4,
        "terrain": "mine",
        "label": "Шахта",
        "sceneId": null,
        "discovered": true,
        "poi": true
      },
      {
        "col": 4,
        "row": 4,
        "terrain": "road",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 4,
        "terrain": "town",
        "label": "Эшфорд",
        "sceneId": null,
        "discovered": true,
        "poi": true
      },
      {
        "col": 6,
        "row": 4,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 4,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 4,
        "terrain": "swamp",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 4,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 5,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 5,
        "terrain": "road",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 5,
        "terrain": "road",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 5,
        "terrain": "road",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 5,
        "terrain": "road",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 5,
        "terrain": "road",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 5,
        "terrain": "road",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 5,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 5,
        "terrain": "swamp",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 5,
        "terrain": "swamp",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 6,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 6,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 6,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 6,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 6,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 6,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 6,
        "terrain": "ruin",
        "label": "Старые руины",
        "sceneId": null,
        "discovered": true,
        "poi": true
      },
      {
        "col": 7,
        "row": 6,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 6,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 6,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 7,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 7,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 7,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 7,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 7,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 7,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 7,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 7,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 7,
        "terrain": "plains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 7,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 8,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 8,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 8,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 8,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 8,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 8,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 8,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 8,
        "terrain": "hills",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 8,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 8,
        "terrain": "forest",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 0,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 1,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 2,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 3,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 4,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 5,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 6,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 7,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 8,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      },
      {
        "col": 9,
        "row": 9,
        "terrain": "mountains",
        "label": "",
        "sceneId": null,
        "discovered": true
      }
    ],
    "groups": {
      "default": {
        "col": 5,
        "row": 4
      }
    }
  }
};
