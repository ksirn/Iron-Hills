/**
 * Одноразовый генератор текста блока ARMORS для вставки в items-catalog.mjs
 * Запуск: node tools/_gen-armors-block.mjs
 */
const torso = [
  [2, 0], [4, 0], [7, 0], [9, 2], [11, 6], [14, 8], [17, 11], [21, 14], [28, 18], [36, 24],
];
const head = (i) => {
  const [p, m] = torso[i];
  return [Math.max(1, Math.round(p * 0.52)), Math.round(m * 0.55)];
};
const legs = (i) => {
  const [p, m] = torso[i];
  return [Math.max(1, Math.round(p * 0.82)), Math.round(m * 0.85)];
};
const arms = (i) => {
  const [p, m] = torso[i];
  return [Math.max(1, Math.round(p * 0.38)), Math.round(m * 0.4)];
};
const neck = (i) => {
  const [p, m] = torso[i];
  return [Math.max(1, Math.round(p * 0.25)), Math.round(m * 0.45)];
};
function R(ph, mg) {
  return mg > 0
    ? `{physical:${ph}, magical:${mg}}`
    : `{physical:${ph}}`;
}

const rows = [];

rows.push(`export const ARMORS = {`);
rows.push(`  // ─────────────────────────────────────────────────────────────`);
rows.push(`  // БРОНЯ И ЩИТЫ (типы 1–10)`);
rows.push(`  // resist → в компендиуме попадает в system.protection`);
rows.push(`  // img (опц.): systems/iron-hills-system/icons/items/armor/{id}.webp`);
rows.push(`  // affixes (T9–T10): резерв под расширение боя (как у оружия)`);
rows.push(`  // ─────────────────────────────────────────────────────────────`);
rows.push("");

const defs = [
  {
    tier: 1,
    k: "leather",
    names: {
      head: "Кожаная шапка",
      torso: "Кожаная куртка",
      legs: "Кожаные сапоги",
      armL: "Кожаный наруч (л)",
      armR: "Кожаный наруч (п)",
      neck: "Кожаный горжет",
      sh: "Деревянный щит",
    },
    ids: {
      head: "leather_cap",
      torso: "leather_jacket",
      legs: "leather_boots",
      armL: "leather_bracer_left",
      armR: "leather_bracer_right",
      neck: "leather_gorget",
      sh: "wooden_shield",
    },
  },
  {
    tier: 2,
    k: "chain",
    names: {
      head: "Кольчужный капюшон",
      torso: "Кольчуга",
      legs: "Кольчужные поножи",
      armL: "Кольчужный рукав (л)",
      armR: "Кольчужный рукав (п)",
      neck: "Кольчужный горжет",
      sh: "Железный щит",
    },
    ids: {
      head: "chainmail_coif",
      torso: "chainmail",
      legs: "chain_leggings",
      armL: "chain_sleeves_left",
      armR: "chain_sleeves_right",
      neck: "chain_gorget",
      sh: "iron_shield",
    },
  },
  {
    tier: 3,
    k: "plate",
    names: {
      head: "Стальной шлем",
      torso: "Нагрудник",
      legs: "Набедренники",
      armL: "Стальной наруч (л)",
      armR: "Стальной наруч (п)",
      neck: "Стальной горжет",
      sh: "Рыцарский щит",
    },
    ids: {
      head: "plate_helm",
      torso: "plate_chest",
      legs: "plate_legs",
      armL: "plate_arms_left",
      armR: "plate_arms_right",
      neck: "plate_gorget",
      sh: "kite_shield",
    },
  },
  {
    tier: 4,
    k: "alloy",
    names: {
      head: "Легированный шлем",
      torso: "Легированный панцирь",
      legs: "Легированные поножи",
      armL: "Легир. наруч (л)",
      armR: "Легир. наруч (п)",
      neck: "Легир. горжет",
      sh: "Башенный щит",
    },
    ids: {
      head: "alloy_helm",
      torso: "alloy_chest",
      legs: "alloy_legs",
      armL: "alloy_bracer_left",
      armR: "alloy_bracer_right",
      neck: "alloy_gorget",
      sh: "tower_shield",
    },
  },
  {
    tier: 5,
    k: "mithril",
    names: {
      head: "Митрильный шлем",
      torso: "Митрильный нагрудник",
      legs: "Митрильные поножи",
      armL: "Митрильный наруч (л)",
      armR: "Митрильный наруч (п)",
      neck: "Митрильный горжет",
      sh: "Митрильный щит",
    },
    ids: {
      head: "mithril_helm",
      torso: "mithril_chest",
      legs: "mithril_legs",
      armL: "mithril_bracer_left",
      armR: "mithril_bracer_right",
      neck: "mithril_gorget",
      sh: "mithril_shield",
    },
  },
  {
    tier: 6,
    k: "darkiron",
    names: {
      head: "Шлем тёмного железа",
      torso: "Латы тёмного железа",
      legs: "Поножи тёмного железа",
      armL: "Наруч тёмн. железа (л)",
      armR: "Наруч тёмн. железа (п)",
      neck: "Горжет тёмн. железа",
      sh: "Щит тёмного железа",
    },
    ids: {
      head: "darkiron_helm",
      torso: "darkiron_chest",
      legs: "darkiron_legs",
      armL: "darkiron_bracer_left",
      armR: "darkiron_bracer_right",
      neck: "darkiron_gorget",
      sh: "darkiron_shield",
    },
  },
  {
    tier: 7,
    k: "void",
    names: {
      head: "Шлем звёздного металла",
      torso: "Доспех Пустоты",
      legs: "Поножи звёздного металла",
      armL: "Наруч Пустоты (л)",
      armR: "Наруч Пустоты (п)",
      neck: "Звёздный горжет",
      sh: "Щит звёздного металла",
    },
    ids: {
      head: "star_helm",
      torso: "void_armor",
      legs: "void_legs",
      armL: "void_bracer_left",
      armR: "void_bracer_right",
      neck: "void_gorget",
      sh: "starmetal_shield",
    },
  },
  {
    tier: 8,
    k: "celestial",
    names: {
      head: "Небесный шлем",
      torso: "Небесный нагрудник",
      legs: "Небесные поножи",
      armL: "Небесный наруч (л)",
      armR: "Небесный наруч (п)",
      neck: "Небесный горжет",
      sh: "Небесный щит",
    },
    ids: {
      head: "celestial_helm",
      torso: "celestial_plate",
      legs: "celestial_legs",
      armL: "celestial_bracer_left",
      armR: "celestial_bracer_right",
      neck: "celestial_gorget",
      sh: "celestial_shield",
    },
  },
  {
    tier: 9,
    k: "orichalcum",
    names: {
      head: "Корона Орихалка",
      torso: "Латы Орихалка",
      legs: "Поножи Орихалка",
      armL: "Наруч Орихалка (л)",
      armR: "Наруч Орихалка (п)",
      neck: "Горжет Орихалка",
      sh: "Щит Орихалка",
    },
    ids: {
      head: "orichalcum_helm",
      torso: "orichalcum_armor",
      legs: "orichalcum_legs",
      armL: "orichalcum_bracer_left",
      armR: "orichalcum_bracer_right",
      neck: "orichalcum_gorget",
      sh: "orichalcum_shield",
    },
  },
  {
    tier: 10,
    k: "adamantium",
    names: {
      head: "Шлем Бездны",
      torso: "Латы Бездны",
      legs: "Поножи Бездны",
      armL: "Наруч Бездны (л)",
      armR: "Наруч Бездны (п)",
      neck: "Горжет Бездны",
      sh: "Бастион Вечности",
    },
    ids: {
      head: "adamantium_helm",
      torso: "adamantium_plate",
      legs: "adamantium_legs",
      armL: "adamantium_bracer_left",
      armR: "adamantium_bracer_right",
      neck: "adamantium_gorget",
      sh: "eternity_aegis",
    },
  },
];

const ti = (t) => `tier:${t}`;
const wt = {
  head: [0.5, 1, 2, 1.5, 1, 2, 1.5, 1.5, 1, 2],
  torso: [3, 8, 12, 10, 6, 12, 5, 5, 4, 6],
  legs: [1, 4, 5, 6, 4, 6, 4.5, 4.5, 4, 5],
  arm: [0.3, 2, 3, 2.5, 2, 3, 2.5, 2.5, 2, 2.5],
  neck: [0.2, 0.8, 1.2, 1, 0.8, 1.5, 1.2, 1.2, 1, 1.5],
  shield: [2, 4, 6, 8, 3, 10, 6, 6, 5, 8],
};
const val = {
  head: [8, 40, 150, 250, 700, 1200, 4000, 8000, 45000, 120000],
  torso: [20, 120, 350, 600, 1800, 3000, 8000, 20000, 60000, 200000],
  legs: [10, 60, 200, 480, 900, 2200, 6000, 16000, 48000, 160000],
  arm: [6, 30, 120, 200, 450, 900, 2400, 6000, 36000, 100000],
  neck: [5, 25, 80, 180, 400, 900, 2500, 6000, 40000, 100000],
  shield: [8, 50, 180, 420, 600, 3200, 9000, 22000, 70000, 220000],
};

defs.forEach((d, i) => {
  const t = d.tier - 1;
  const [hph, hm] = head(t);
  const [lph, lm] = legs(t);
  const [aph, am] = arms(t);
  const [nph, nm] = neck(t);
  const [sph, sm] = torso[t];
  const id = d.ids;

  rows.push(`  // ── Тир ${d.tier} — ${d.k === "void" ? "звезды / Пустота" : d.names.torso.split(" ")[0]} ──`);

  rows.push(`  ${id.head}: { id:"${id.head}", label:"${d.names.head}", ${ti(d.tier)}, slot:"head", resist:${R(hph, hm)}, weight:${wt.head[t]}, value:${val.head[t]} },`);

  rows.push(`  ${id.torso}: { id:"${id.torso}", label:"${d.names.torso}", ${ti(d.tier)}, slot:"torso", resist:${R(...torso[t])}, weight:${wt.torso[t]}, value:${val.torso[t]} },`);

  rows.push(`  ${id.legs}: { id:"${id.legs}", label:"${d.names.legs}", ${ti(d.tier)}, slot:"legs", resist:${R(lph, lm)}, weight:${wt.legs[t]}, value:${val.legs[t]} },`);

  rows.push(`  ${id.armL}: { id:"${id.armL}", label:"${d.names.armL}", ${ti(d.tier)}, slot:"leftArm", resist:${R(aph, am)}, weight:${wt.arm[t]}, value:${Math.round(val.arm[t] * 0.92)} },`);
  rows.push(`  ${id.armR}: { id:"${id.armR}", label:"${d.names.armR}", ${ti(d.tier)}, slot:"rightArm", resist:${R(aph, am)}, weight:${wt.arm[t]}, value:${Math.round(val.arm[t] * 0.92)} },`);

  rows.push(`  ${id.neck}: { id:"${id.neck}", label:"${d.names.neck}", ${ti(d.tier)}, slot:"neck", resist:${R(nph, nm)}, weight:${wt.neck[t]}, value:${val.neck[t]} },`);

  const affix =
    d.tier === 9
      ? `, affixes:{ ignoreArmor:0.05, criticalDamageMult:1.05 }`
      : d.tier === 10
        ? `, affixes:{ ignoreArmor:0.08, criticalDamageMult:1.1, executeBelowHp:0.05 }`
        : "";
  rows.push(`  ${id.sh}: { id:"${id.sh}", label:"${d.names.sh}", ${ti(d.tier)}, slot:"leftHand", resist:${R(sph, sm)}, weight:${wt.shield[t]}, value:${val.shield[t]}${affix} },`);

  rows.push("");
});

rows.push(`  // Совместимость: старый id перчаток только правая рука`);
rows.push(`  leather_gloves: { id:"leather_gloves", label:"Кожаные перчатки", tier:1, slot:"rightArm", resist:{physical:1}, weight:0.3, value:6 },`);
rows.push(`};`);

const text = rows.join("\n");
process.stdout.write(text);
