/**
 * Специализации для генератора NPC (вкладка «NPC» в инструментах мира).
 * Компендиум ih-npc по умолчанию пуст — актёры создаются с выбором тира и роли.
 */

/** @typedef {{ label: string, desc: string, skills: Record<string, number>, energy: number, mana: number, defense?: number }} NpcSpec */

/** @type {Record<string, NpcSpec>} */
export const NPC_SPECIALIZATIONS = {
  villager: {
    label: "Житель",
    desc: "Простолюдин поселения: холмовая деревня, трактир, рынок.",
    skills: { endurance: 1, crafting: 1, cooking: 1, perception: 1, trade: 1 },
    energy: 10,
    mana: 2,
    defense: 0,
  },
  guard: {
    label: "Страж",
    desc: "Городской или дорожный стражник в кольчуге и с щитом.",
    skills: { sword: 2, shield: 2, endurance: 2, athletics: 1, perception: 2 },
    energy: 14,
    mana: 3,
    defense: 2,
  },
  bandit: {
    label: "Бандит",
    desc: "Разбойник троп и окраин; нож, метательное, грубая куртка.",
    skills: { knife: 2, throwing: 2, stealth: 1, endurance: 1, streetwise: 1 },
    energy: 12,
    mana: 2,
    defense: 0,
  },
  mage: {
    label: "Маг",
    desc: "Обученный колдун нескольких школ; мантия и посох.",
    skills: { fire: 2, ice: 2, mind: 1, light: 1, lore: 2 },
    energy: 8,
    mana: 16,
    defense: 0,
  },
  crafter: {
    label: "Ремесленник",
    desc: "Кузнец, кожевник или плотник — мастерская и инструмент.",
    skills: { blacksmithing: 2, crafting: 3, endurance: 2, appraisal: 1, trade: 1 },
    energy: 14,
    mana: 3,
    defense: 0,
  },
  hunter: {
    label: "Охотник",
    desc: "Лесной стрелок и следопыт; лук, нож, выживание.",
    skills: { bow: 2, knife: 2, survival: 3, perception: 2, stealth: 1 },
    energy: 12,
    mana: 2,
    defense: 0,
  },
  noble: {
    label: "Дворянин",
    desc: "Землевладелец или чиновник; кортик, убеждение, свита.",
    skills: { persuasion: 3, leadership: 2, sword: 1, lore: 2, trade: 2 },
    energy: 10,
    mana: 4,
    defense: 1,
  },
  priest: {
    label: "Жрец",
    desc: "Служитель культа; жизнь, разум, проповедь и уход за паствой.",
    skills: { light: 3, mind: 2, lore: 3, persuasion: 2, medicine: 1 },
    energy: 9,
    mana: 14,
    defense: 0,
  },
};

/** Совместимость: старый импорт `NPC_ROLE_PROFILES`. */
export const NPC_ROLE_PROFILES = NPC_SPECIALIZATIONS;

export const NPC_TOKEN_IMAGE_BASE = "systems/iron-hills-system/icons/tokens/npc";

export const NPC_TIER_BANDS = Object.freeze([
  { id: "t1_3", label: "тир 1-3", tier: 2, tierRange: "1-3", faction: "frontier" },
  { id: "t4_6", label: "тир 4-6", tier: 5, tierRange: "4-6", faction: "settled" },
  { id: "t7_10", label: "тир 7-10", tier: 8, tierRange: "7-10", faction: "elite" },
]);

export function resolveNpcTierBandIdForTier(tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  if (t <= 3) return "t1_3";
  if (t <= 6) return "t4_6";
  return "t7_10";
}

export function getNpcRoleImage(roleKey, tierOrBandId = 1) {
  const specialization = NPC_SPECIALIZATIONS[roleKey] ? roleKey : "villager";
  const rawBand = String(tierOrBandId ?? "").trim();
  const bandId = NPC_TIER_BANDS.some((band) => band.id === rawBand)
    ? rawBand
    : resolveNpcTierBandIdForTier(tierOrBandId);
  return `${NPC_TOKEN_IMAGE_BASE}/${specialization}_${bandId}.webp`;
}

export const NPC_EXACT_TIER_PREVIEW_ACTORS = Object.freeze([
  { tier: 1, specialization: "villager", label: "Эшфордский проводник", faction: "ashford", sceneRole: "safe-guide" },
  { tier: 2, specialization: "guard", label: "Ривергейтский страж", faction: "rivergate", sceneRole: "gate-guard" },
  { tier: 3, specialization: "bandit", label: "Разбойник с западной дороги", faction: "outlaws", sceneRole: "road-threat" },
  { tier: 4, specialization: "hunter", label: "Охотник Чёрного Бора", faction: "frontier", sceneRole: "wilderness-contact" },
  { tier: 5, specialization: "crafter", label: "Копёрный кузнец", faction: "miners-guild", sceneRole: "repair-and-trade" },
  { tier: 6, specialization: "mage", label: "Рудничный геомант", faction: "miners-guild", sceneRole: "arcane-support" },
  { tier: 7, specialization: "priest", label: "Жрец дорожного святилища", faction: "temple", sceneRole: "healer" },
  { tier: 8, specialization: "noble", label: "Интендант Железных Холмов", faction: "iron-hills", sceneRole: "quest-patron" },
  { tier: 9, specialization: "guard", label: "Капитан северного перевала", faction: "iron-hills", sceneRole: "elite-guard" },
  { tier: 10, specialization: "mage", label: "Архимаг старой крепости", faction: "old-iron-castle", sceneRole: "boss-caster" },
]);

function buildNpcBandPackEntries() {
  return Object.entries(NPC_SPECIALIZATIONS).flatMap(([roleKey, profile]) =>
    NPC_TIER_BANDS.map((band) => {
      const id = `${roleKey}_${band.id}`;
      return [id, {
        id,
        specialization: roleKey,
        label: `${profile.label} (${band.label})`,
        tier: band.tier,
        tierRange: band.tierRange,
        faction: band.faction,
        img: getNpcRoleImage(roleKey, band.id),
        desc: `${profile.desc} Готовый NPC-архетип для быстрых сцен и тестов тира ${band.tierRange}.`,
      }];
    })
  );
}

function buildNpcExactTierPackEntries() {
  return NPC_EXACT_TIER_PREVIEW_ACTORS.map((seed) => {
    const roleKey = NPC_SPECIALIZATIONS[seed.specialization] ? seed.specialization : "villager";
    const profile = NPC_SPECIALIZATIONS[roleKey];
    const tier = Math.max(1, Math.min(10, Number(seed.tier) || 1));
    const id = `${roleKey}_exact_t${tier}`;
    return [id, {
      id,
      specialization: roleKey,
      label: `${seed.label} (тир ${tier})`,
      tier,
      tierRange: `${tier}`,
      faction: seed.faction ?? "iron-hills",
      sceneRole: seed.sceneRole ?? "session-npc",
      img: getNpcRoleImage(roleKey, tier),
      desc: `${profile.desc} Точный NPC-архетип тира ${tier} для первой сессии Iron Hills, smoke-тестов и быстрой расстановки на картах.`,
    }];
  });
}

export const NPC_PACK_ACTORS = Object.freeze(Object.fromEntries([
  ...buildNpcBandPackEntries(),
  ...buildNpcExactTierPackEntries(),
]));

/**
 * Таблица останков простолюдина по ступени NPC (1–10).
 * @param {number} tier
 */
export function citizenRemainsLootKey(tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  if (t <= 3) return "citizen_remains_t1";
  if (t <= 7) return "citizen_remains_t2";
  return "citizen_remains_t3";
}

/**
 * Таблица карманничества по ступени.
 * @param {number} tier
 */
export function pettyPickpocketLootKey(tier) {
  const t = Math.max(1, Math.min(10, Number(tier) || 1));
  if (t <= 3) return "petty_pickpocket_t1";
  if (t <= 7) return "petty_pickpocket_t2";
  return "petty_pickpocket_t3";
}

/**
 * Ключ {@link NPC_SPECIALIZATIONS} по полям актёра.
 * @param {{ name?: string; system?: { info?: { specialization?: string, role?: string } } }} doc
 * @returns {string|null}
 */
export function resolveNpcProfileKey(doc) {
  const spec = String(doc?.system?.info?.specialization ?? "").trim();
  if (spec && NPC_SPECIALIZATIONS[spec]) return spec;
  const role = String(doc?.system?.info?.role ?? "").trim();
  if (role && NPC_SPECIALIZATIONS[role]) return role;
  const name = String(doc?.name ?? "").trim();
  if (!name) return null;
  const hit = Object.entries(NPC_SPECIALIZATIONS).find(([, p]) => p.label === name);
  return hit ? hit[0] : null;
}
