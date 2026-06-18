/**
 * Iron Hills — Grid Inventory App v4
 * Один экран: слоты экипировки слева, все секции инвентаря вертикально справа.
 * Стек брони: резист берётся лучший из слоёв покрывающих зону.

 */

import { getPersistentActor, isSyntheticActorDocument } from "../utils/actor-utils.mjs";
import {
  getBestResistForZone as _getBestResistForZone,
  DEFAULT_SLOT_COVERS as SLOT_COVERS,
  buildOverviewSummary,
  getEncumbranceInfo,
} from "../services/actor-state-service.mjs";
import {
  buildActorBodyHud,
  buildActorResourceHud,
} from "../services/body-hud-service.mjs";
import {
  clearContainedItemsForEquipmentSlot,
  clearItemGridPlacement,
  equipActorItem,
  EQUIPMENT_SLOT_DEFS,
  getCompatibleEquipmentSlots,
  moveItemToInventorySection,
  unequipActorSlot
} from "../services/inventory-service.mjs";
import { buildSystemDialogContent } from "../services/combat-chat-service.mjs";
import {
  formatItemActionSummary,
  formatSpellSchoolRank,
  getItemQuantity,
  isStackable,
} from "../utils/item-utils.mjs";
import { formatCurrency } from "../utils/currency.mjs";

// Реэкспорт канонической функции — для обратной совместимости с прежним публичным API.
// Все новые потребители должны импортировать напрямую из services/actor-state-service.mjs.
export const getBestResistForZone = _getBestResistForZone;

const CELL = 46;

/** Возвращает world-актора — всегда пишем в него, не в токен */
function toWorldActor(actor) {
  if (!actor) return actor;
  return getPersistentActor(actor) ?? actor;
}

function _refreshPendingApp(actor) {
  if (!actor) return;
  for (const app of Object.values(ui.windows ?? {})) {
    if (app.constructor?.name !== "PendingItemsApp") continue;
    if (app._actor?.id !== actor.id) continue;
    if (!app.rendered) break;
    const remaining = app._getPendingItems?.() ?? [];
    if (remaining.length === 0) app.close({ force: true });
    else app.render(false);
    break;
  }
}

function findGridInventoryApp(actor) {
  const actorId = actor?.id;
  if (!actorId) return null;
  return Object.values(ui.windows ?? {}).find(app =>
    app.constructor?.name === "IronHillsGridInventoryApp" &&
    app.actor?.id === actorId
  ) ?? null;
}

function getInventoryFlags(item) {
  return item?.flags?.["iron-hills-system"] ?? {};
}

function isMountedAttachment(item, actor = null) {
  if (item?.type !== "attachment") return false;
  const containerKey = String(getInventoryFlags(item).container ?? "");
  if (!/^(belt|torso|backpack)_attach_[^_]+$/.test(containerKey)) return false;
  if (!actor) return true;

  return getAttachmentMountTargets(actor, item, { includeOccupied: true }).some(target =>
    target.key === containerKey &&
    target.occupiedBy?.id === item.id
  );
}

function isPendingIgnoredItem(item, actor = null) {
  if (item?.type === "spell") return true;
  return isMountedAttachment(item, actor);
}

function getAutoPlaceItemPriority(item) {
  const typePriority = {
    backpack: 0,
    belt: 1,
    weapon: 2,
    armor: 3,
    jewelry: 4,
  };
  const area = Math.max(1, Number(item?.system?.gridW ?? 1)) * Math.max(1, Number(item?.system?.gridH ?? 1));
  return [(typePriority[item?.type] ?? 10), -area, item?.name ?? ""];
}

function sortItemsForAutoPlacement(items) {
  return [...items].sort((a, b) => {
    const pa = getAutoPlaceItemPriority(a);
    const pb = getAutoPlaceItemPriority(b);
    for (let i = 0; i < pa.length; i++) {
      if (typeof pa[i] === "number" && pa[i] !== pb[i]) return pa[i] - pb[i];
      if (typeof pa[i] === "string" && pa[i] !== pb[i]) return pa[i].localeCompare(pb[i], "ru");
    }
    return 0;
  });
}

/** Tactical inventory dashboard view model. */
function clampPct(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function ratioPct(value, max) {
  return clampPct((Number(value ?? 0) / Math.max(1, Number(max ?? 1))) * 100);
}

function formatWeight(value) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return "0";
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function loadClassFromPct(pct) {
  if (pct >= 100) return "is-danger";
  if (pct >= 75) return "is-warn";
  if (pct >= 50) return "is-medium";
  return "is-good";
}

function sumSectionCells(sections) {
  return sections.reduce((sum, section) =>
    sum + Math.max(0, Number(section.cols ?? 0)) * Math.max(0, Number(section.rows ?? 0)), 0);
}

function sumPlacedCells(sections) {
  return sections.reduce((sum, section) =>
    sum + (section.placed ?? []).reduce((inner, item) =>
      inner + Math.max(1, Number(item.w ?? 1)) * Math.max(1, Number(item.h ?? 1)), 0), 0);
}

function sumPendingCells(pendingItems) {
  return pendingItems.reduce((sum, item) =>
    sum + Math.max(1, Number(item.w ?? 1)) * Math.max(1, Number(item.h ?? 1)), 0);
}

function buildInventoryDashboard(actor, { allSections = [], pendingItems = [], totalOverflow = 0 } = {}) {
  const overview = buildOverviewSummary(actor);
  const encumbrance = getEncumbranceInfo(actor);
  const body = buildActorBodyHud(actor);
  const resourceBars = buildActorResourceHud(actor);
  const totalCells = sumSectionCells(allSections);
  const usedCells = sumPlacedCells(allSections);
  const freeCells = Math.max(0, totalCells - usedCells);
  const gridPct = ratioPct(usedCells, totalCells);
  const pendingCells = sumPendingCells(pendingItems);
  const pendingCount = pendingItems.length;
  const weightPct = ratioPct(overview.weightValue, overview.weightMax);
  const coinsLabel = formatCurrency(overview.coins);
  const hasPending = pendingCount > 0;
  const hasOverflow = totalOverflow > 0;

  return {
    cssClass: hasPending ? "has-pending" : hasOverflow ? "has-overflow" : "is-clear",
    actorName: actor?.name ?? "",
    actorImg: actor?.img ?? "icons/svg/mystery-man.svg",
    body,
    resourceBars,
    weight: {
      value: overview.weightValue,
      max: overview.weightMax,
      label: `${formatWeight(overview.weightValue)} / ${formatWeight(overview.weightMax)} кг`,
      pct: weightPct,
      cssClass: loadClassFromPct(weightPct),
      encumbranceLabel: encumbrance.label,
      armorBurdenLabel: encumbrance.armorBurden?.label ?? "Без брони",
      armorHasPenalty: Boolean(encumbrance.armorBurden?.hasPenalty),
      armorActionSecondsFlat: encumbrance.actionSecondsFlat ?? 0,
      armorMovementPenalty: encumbrance.movementPenalty ?? 0,
      energyMultiplier: encumbrance.energyMultiplier,
    },
    grid: {
      totalCells,
      usedCells,
      freeCells,
      pct: gridPct,
      cssClass: loadClassFromPct(gridPct),
      label: `${usedCells}/${totalCells}`,
    },
    pending: {
      count: pendingCount,
      cells: pendingCells,
      label: hasPending ? `${pendingCount} шт.` : "нет",
      cssClass: hasPending ? "is-danger" : "is-good",
    },
    overflow: {
      count: totalOverflow,
      cssClass: hasOverflow ? "is-warn" : "is-good",
    },
    coinsLabel,
    chips: [
      { key: "coins", icon: "fa-coins", label: "Монеты", value: coinsLabel, cssClass: "is-money" },
      { key: "sections", icon: "fa-box-archive", label: "Секции", value: `${allSections.length}`, cssClass: "is-muted" },
      { key: "free", icon: "fa-border-all", label: "Свободно", value: `${freeCells}`, cssClass: freeCells > 0 ? "is-good" : "is-warn" },
      { key: "pending", icon: "fa-inbox", label: "Pending", value: hasPending ? `${pendingCount}` : "0", cssClass: hasPending ? "is-danger" : "is-good" },
      { key: "overflow", icon: "fa-triangle-exclamation", label: "Overflow", value: `${totalOverflow}`, cssClass: hasOverflow ? "is-warn" : "is-good" },
    ],
  };
}

/** Геометрия силуэта (пиксели) — синхронно с CELL инвентарной сетки */
function getInventoryItemGridSize(item) {
  const f = getInventoryFlags(item);
  const rotated = !!f.rotated;
  const bw = Number(item.system?.gridW ?? 1);
  const bh = Number(item.system?.gridH ?? 1);
  return {
    w: rotated ? bh : bw,
    h: rotated ? bw : bh,
    rotated,
  };
}

function getMountedAttachmentForKey(actor, mountKey) {
  if (!actor || !mountKey) return null;
  return Array.from(actor.items ?? []).find(item =>
    item.type === "attachment" &&
    getInventoryFlags(item).container === mountKey
  ) ?? null;
}

function getAttachmentCarrierSlotKeys(item) {
  const attachTo = String(item?.system?.attachesTo ?? "").trim();
  if (["belt", "torso", "backpack"].includes(attachTo)) return [attachTo];
  return ["belt", "torso", "backpack"];
}

function getAttachmentMountTargets(actor, item, { includeOccupied = false } = {}) {
  if (!actor || item?.type !== "attachment") return [];

  const equip = actor.system?.equipment ?? {};
  const targets = [];

  for (const slotKey of getAttachmentCarrierSlotKeys(item)) {
    const carrierId = equip[slotKey];
    const carrier = carrierId ? actor.items.get(carrierId) : null;
    if (!carrier) continue;

    const slots = Array.isArray(carrier.system?.attachmentSlots) ? carrier.system.attachmentSlots : [];
    for (const slotDef of slots) {
      const key = String(slotDef?.key ?? "").trim();
      if (!key) continue;
      const mountKey = `${slotKey}_attach_${key}`;
      const mounted = getMountedAttachmentForKey(actor, mountKey);
      if (mounted && mounted.id !== item.id && !includeOccupied) continue;
      targets.push({
        key: mountKey,
        slotKey,
        carrier,
        slotDef,
        occupiedBy: mounted,
        label: `${carrier.name}: ${slotDef.label ?? key}`,
      });
    }
  }

  return targets;
}

function findFreeAttachmentMount(actor, item) {
  return getAttachmentMountTargets(actor, item, { includeOccupied: false })[0] ?? null;
}

async function clearAttachmentSectionItems(actor, mountKey) {
  if (!actor || !mountKey) return;
  const sectionKey = `${mountKey}_items`;
  const updates = [];
  for (const item of actor.items ?? []) {
    if (getInventoryFlags(item).sectionKey === sectionKey) {
      updates.push(clearItemGridPlacement(item));
    }
  }
  await Promise.all(updates);
}

async function mountAttachment(actor, item, mount) {
  if (!actor || !item || !mount?.key) return false;
  await clearAttachmentSectionItems(actor, getInventoryFlags(item).container);
  await item.update({
    "flags.iron-hills-system.container": mount.key,
    "flags.iron-hills-system.sectionKey": null,
    "flags.iron-hills-system.gridPos": null,
  });
  return true;
}

async function unmountAttachment(actor, item) {
  if (!actor || item?.type !== "attachment") return false;
  await clearAttachmentSectionItems(actor, getInventoryFlags(item).container);
  await clearItemGridPlacement(item);
  return true;
}

function explainAutoPlaceForItem(actor, item, conts = null) {
  if (!actor || !item) return { ok: false, text: "Предмет не найден", statusClass: "bad" };

  if (item.type === "attachment") {
    const mount = findFreeAttachmentMount(actor, item);
    if (mount) return { ok: true, text: `Auto: ${mount.label}`, statusClass: "ok" };
  }

  const qty = getItemQuantity(item);
  const equip = actor.system?.equipment ?? {};
  const compatibleSlots = getCompatibleEquipmentSlots(item);

  if (qty <= 1 && compatibleSlots.length) {
    const freeSlot = compatibleSlots.find(s => {
      const equippedId = equip[s.key];
      return !equippedId || !actor.items.get(equippedId);
    });
    if (freeSlot) return { ok: true, text: `Авто: ${freeSlot.label}`, statusClass: "ok" };
  }

  const { w, h } = getInventoryItemGridSize(item);
  const containers = conts ?? buildContainers(actor);
  const sections = containers.flatMap(cont =>
    (cont.sections ?? []).map(sec => ({ cont, sec }))
  );

  if (!sections.length) {
    const text = compatibleSlots.length ? "Не разместить: слоты заняты" : "Не разместить: нет контейнера";
    return { ok: false, text, statusClass: "bad" };
  }

  const compatibleSections = [];
  let blockedBySize = false;

  for (const { sec } of sections) {
    if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) continue;
    if (sec.maxItemW && w > sec.maxItemW) { blockedBySize = true; continue; }
    if (sec.maxItemH && h > sec.maxItemH) { blockedBySize = true; continue; }
    compatibleSections.push(sec);
    if (findFreeSlot(sec.grid, w, h)) {
      return { ok: true, text: `Авто: ${sec.label}`, statusClass: "ok" };
    }
  }

  if (compatibleSlots.length && qty <= 1) {
    return { ok: false, text: "Слоты экипировки заняты", statusClass: "warn" };
  }

  if (!compatibleSections.length) {
    const reason = blockedBySize ? "слишком большой" : "нет подходящей секции";
    return { ok: false, text: `Не разместить: ${reason}`, statusClass: "bad" };
  }

  return { ok: false, text: "Нет свободного места", statusClass: "warn" };
}

function summarizeAutoPlaceFailures(actor, failedItems) {
  const conts = buildContainers(actor);
  return failedItems.slice(0, 4).map(item => {
    const reason = explainAutoPlaceForItem(actor, item, conts);
    return `${item.name}: ${reason.text}`;
  }).join("; ");
}

const SIL_W = 212;
const SIL_EDGE = 6;
const SIL_GAP = 6;
const HAND_W = 52;
const MID_GAP = 8;
const HAND_LEFT_X = SIL_EDGE;
const HAND_RIGHT_X = SIL_W - SIL_EDGE - HAND_W;
const CENTER_X = HAND_LEFT_X + HAND_W + MID_GAP;
const CENTER_W = HAND_RIGHT_X - MID_GAP - CENTER_X;
const HEAD_SLOT_H = 52;
const NECK_H = 22;
const TORSO_H = 48;
const LEGS_H = 52;
const ARM_SLOT_H = 46;
const RING_H = 34;
const BELT_H = 40;
const BELT_W = 100;
/** Верхний ряд «руки»: высота слота по footprint предмета (grid), до этого px макс. при подгонке */
const HAND_SLOT_CAP_PX = 132;

function _equipFootprint(item) {
  if (!item) return { gw: 1, gh: 1 };
  let gw = Number(item.system?.gridW ?? 1);
  let gh = Number(item.system?.gridH ?? 1);
  const rt = !!item.flags?.["iron-hills-system"]?.rotated;
  if (rt) [gw, gh] = [gh, gw];
  return { gw: Math.max(1, gw), gh: Math.max(1, gh) };
}

/** Высота превью оружия/щита в руке — по max(gridW,gridH)×CELL как в сумке */
function _handSlotHeightPx(item) {
  if (!item) return CELL;
  const { gw, gh } = _equipFootprint(item);
  const span = Math.max(gw, gh);
  return Math.round(span * CELL);
}

/**
 * Строит массив слотов с координатами и высоту силуэта.
 * Руки: высота слота ≈ max(gridW,gridH)×CELL (как в сумке), ограничено HAND_SLOT_CAP_PX.
 * Голова — фиксированная высота HEAD_SLOT_H (не привязана к длине меча).
 * Если меч очень выше блока голова→шея→торс, центральную колонку опускаем так,
 * чтобы ряд «ноги» (и наручи в боковых колонках) начинался ниже нижней границы полосы оружия.
 */
function computeEquipSilhouetteLayout(actor) {
  const equip = actor.system?.equipment ?? {};
  const items = actor.items;
  const leftItem = equip.leftHand ? items.get(equip.leftHand) : null;
  const rightItem = equip.rightHand ? items.get(equip.rightHand) : null;

  const rawL = _handSlotHeightPx(leftItem);
  const rawR = _handSlotHeightPx(rightItem);

  const hL = Math.min(rawL, HAND_SLOT_CAP_PX);
  const hR = Math.min(rawR, HAND_SLOT_CAP_PX);

  const TOP = SIL_EDGE;
  const weaponBottom = TOP + Math.max(hL, hR);
  const WEAPON_TO_LEGS_GAP = 8;

  let neck_y = TOP + HEAD_SLOT_H + SIL_GAP;
  let torso_y = neck_y + NECK_H + SIL_GAP;
  let legs_y = torso_y + TORSO_H + SIL_GAP;

  const minLegsY = weaponBottom + WEAPON_TO_LEGS_GAP;
  if (legs_y < minLegsY) {
    const push = minLegsY - legs_y;
    neck_y += push;
    torso_y += push;
    legs_y += push;
  }

  const arms_y = legs_y;

  const slots = [];

  slots.push({
    key: "leftHand",
    label: "Л. рука",
    icon: "🗡",
    x: HAND_LEFT_X,
    y: TOP,
    w: HAND_W,
    h: hL,
    slotKind: "handLeft",
    accepts: ["weapon", "armor"],
    group: "hands",
  });
  slots.push({
    key: "rightHand",
    label: "П. рука",
    icon: "⚔",
    x: HAND_RIGHT_X,
    y: TOP,
    w: HAND_W,
    h: hR,
    slotKind: "handRight",
    accepts: ["weapon", "armor"],
    group: "hands",
  });

  slots.push({
    key: "head",
    label: "Голова",
    icon: "⛑",
    x: CENTER_X,
    y: TOP,
    w: CENTER_W,
    h: HEAD_SLOT_H,
    slotKind: "head",
    accepts: ["armor"],
    group: "body",
  });

  slots.push({
    key: "neck",
    label: "Шея",
    icon: "📿",
    x: CENTER_X,
    y: neck_y,
    w: CENTER_W,
    h: NECK_H,
    slotKind: "neck",
    accepts: ["jewelry"],
    group: "body",
  });

  slots.push({
    key: "torso",
    label: "Торс",
    icon: "🛡",
    x: CENTER_X,
    y: torso_y,
    w: CENTER_W,
    h: TORSO_H,
    slotKind: "torso",
    accepts: ["armor"],
    group: "body",
  });

  slots.push({
    key: "legs",
    label: "Ноги",
    icon: "👖",
    x: CENTER_X,
    y: legs_y,
    w: CENTER_W,
    h: LEGS_H,
    slotKind: "legs",
    accepts: ["armor"],
    group: "body",
  });

  slots.push({
    key: "leftArm",
    label: "Л. наруч",
    icon: "🦾",
    x: HAND_LEFT_X,
    y: arms_y,
    w: HAND_W,
    h: ARM_SLOT_H,
    slotKind: "armLeft",
    accepts: ["armor"],
    group: "body",
  });
  slots.push({
    key: "rightArm",
    label: "П. наруч",
    icon: "🦾",
    x: HAND_RIGHT_X,
    y: arms_y,
    w: HAND_W,
    h: ARM_SLOT_H,
    slotKind: "armRight",
    accepts: ["armor"],
    group: "body",
  });

  const ring_y = legs_y + LEGS_H + 12;
  slots.push({
    key: "ringLeft",
    label: "Кольцо Л",
    icon: "💍",
    x: HAND_LEFT_X,
    y: ring_y,
    w: 60,
    h: RING_H,
    slotKind: "ring",
    accepts: ["jewelry"],
    group: "jewelry",
  });
  slots.push({
    key: "ringRight",
    label: "Кольцо П",
    icon: "💍",
    x: HAND_RIGHT_X,
    y: ring_y,
    w: 60,
    h: RING_H,
    slotKind: "ring",
    accepts: ["jewelry"],
    group: "jewelry",
  });

  const belt_y = ring_y + RING_H + 10;
  slots.push({
    key: "belt",
    label: "Пояс",
    icon: "🔗",
    x: HAND_LEFT_X,
    y: belt_y,
    w: BELT_W,
    h: BELT_H,
    slotKind: "belt",
    accepts: ["belt"],
    group: "carry",
  });
  slots.push({
    key: "backpack",
    label: "Рюкзак",
    icon: "🎒",
    x: 6 + BELT_W + 8,
    y: belt_y,
    w: BELT_W,
    h: BELT_H,
    slotKind: "backpack",
    accepts: ["backpack"],
    group: "carry",
  });

  const silhouetteHeight = belt_y + BELT_H + SIL_EDGE;

  return { slots, silhouetteHeight: Math.max(316, silhouetteHeight) };
}

// ─── Алгоритм сетки ──────────────────────────────────────

function makeGrid(cols, rows) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function canPlace(grid, col, row, w, h) {
  if (col < 0 || row < 0) return false;
  if (!grid[0] || col + w > grid[0].length || row + h > grid.length) return false;
  for (let r = row; r < row + h; r++)
    for (let c = col; c < col + w; c++)
      if (grid[r][c] !== null) return false;
  return true;
}

function placeOnGrid(grid, col, row, w, h, id) {
  for (let r = row; r < row + h; r++)
    for (let c = col; c < col + w; c++)
      grid[r][c] = id;
}

function findFreeSlot(grid, w, h) {
  if (!grid || !grid.length || !grid[0] || !grid[0].length) return null;
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (canPlace(grid, c, r, w, h)) return { col: c, row: r };
  return null;
}

// ─── Построение контейнеров ──────────────────────────────

function buildContainers(actor) {
  const equip    = actor.system?.equipment ?? {};
  const allItems = Array.from(actor.items ?? []);
  const getF     = (item) => item?.flags?.["iron-hills-system"] ?? {};

  const containers = [];

  // 1. КАРМАНЫ — 4 изолированных слота 1×1
  containers.push({
    key: "pockets", label: "Карманы", icon: "🤲",
    sourceItemId: null,
    sections: [{
      key: "pockets_main", label: "Карманы",
      cols: 4, rows: 1,
      allowedTypes: null, maxItemW: 1, maxItemH: 1,
      accessSeconds: 0, pocketMode: true,
    }],
  });

  // 2. ПОЯС — от экипированного ремня
  const beltItem = equip.belt ? actor.items.get(equip.belt) : null;
  if (beltItem) {
    const cfg = beltItem.system;
    const cols = cfg?.containerSlots?.cols ?? 0;
    const rows = cfg?.containerSlots?.rows ?? 1;
    const attachSlots = Array.isArray(cfg?.attachmentSlots) ? cfg.attachmentSlots : [];
    const secs = [];

    if (cols > 0) secs.push({
      key: "belt_main", label: beltItem.name,
      cols, rows, allowedTypes: null,
      maxItemW: null, maxItemH: null,
      accessSeconds: cfg?.accessSeconds ?? 1,
    });

    for (const as of attachSlots) {
      const ai = allItems.find(i => getF(i).container === `belt_attach_${as.key}`);
      if (ai?.type === "attachment") {
        secs.push({
          key: `belt_attach_${as.key}_items`,
          label: ai.system?.addsLabel ?? ai.name,
          cols: ai.system?.addsSlots?.cols ?? 3,
          rows: ai.system?.addsSlots?.rows ?? 1,
          allowedTypes:  Array.isArray(ai.system?.allowedTypes)  ? ai.system.allowedTypes  : null,
          allowedSkills: Array.isArray(ai.system?.allowedSkills) ? ai.system.allowedSkills : null,
          maxItemW: null, maxItemH: null,
          accessSeconds: ai.system?.accessSeconds ?? 1,
          sourceItemId: ai.id,
        });
      }
    }

    if (secs.length) containers.push({
      key: "belt", label: "Пояс", icon: "🔗",
      sourceItemId: beltItem.id, sections: secs,
    });
  }

  // 3. ТОРС — от брони торса (если есть containerSlots)
  const torsoItem = equip.torso ? actor.items.get(equip.torso) : null;
  if (torsoItem) {
    const cfg  = torsoItem.system;
    const cols = cfg?.containerSlots?.cols ?? 0;
    const rows = cfg?.containerSlots?.rows ?? 0;
    const secs = [];
    if (cols > 0 && rows > 0) secs.push({
      key: "torso_main", label: torsoItem.name,
      cols, rows, allowedTypes: null, maxItemW: null, maxItemH: null,
      accessSeconds: cfg?.accessSeconds ?? 1,
    });
    const attachSlots = Array.isArray(cfg?.attachmentSlots) ? cfg.attachmentSlots : [];
    for (const as of attachSlots) {
      const ai = allItems.find(i => getF(i).container === `torso_attach_${as.key}`);
      if (ai?.type === "attachment") {
        secs.push({
          key: `torso_attach_${as.key}_items`,
          label: ai.system?.addsLabel ?? ai.name,
          cols: ai.system?.addsSlots?.cols ?? 2,
          rows: ai.system?.addsSlots?.rows ?? 2,
          allowedTypes:  Array.isArray(ai.system?.allowedTypes)  ? ai.system.allowedTypes  : null,
          allowedSkills: Array.isArray(ai.system?.allowedSkills) ? ai.system.allowedSkills : null,
          maxItemW: null, maxItemH: null,
          accessSeconds: ai.system?.accessSeconds ?? 1,
          sourceItemId: ai.id,
        });
      }
    }
    if (secs.length) containers.push({
      key: "torso", label: "Торс", icon: "🛡",
      sourceItemId: torsoItem.id, sections: secs,
    });
  }

  // 4. РЮКЗАК
  const bagItem = equip.backpack ? actor.items.get(equip.backpack) : null;
  if (bagItem) {
    const cfg  = bagItem.system;
    const sections = [{
      key: "backpack_main", label: bagItem.name,
      cols: cfg?.containerSlots?.cols ?? 5,
      rows: cfg?.containerSlots?.rows ?? 6,
      allowedTypes: null, maxItemW: null, maxItemH: null,
      accessSeconds: cfg?.accessSeconds ?? 3,
    }];
    const attachSlots = Array.isArray(cfg?.attachmentSlots) ? cfg.attachmentSlots : [];
    for (const as of attachSlots) {
      const ai = allItems.find(i => getF(i).container === `backpack_attach_${as.key}`);
      if (ai?.type === "attachment") {
        sections.push({
          key: `backpack_attach_${as.key}_items`,
          label: ai.system?.addsLabel ?? ai.name,
          cols: ai.system?.addsSlots?.cols ?? 3,
          rows: ai.system?.addsSlots?.rows ?? 2,
          allowedTypes:  Array.isArray(ai.system?.allowedTypes)  ? ai.system.allowedTypes  : null,
          allowedSkills: Array.isArray(ai.system?.allowedSkills) ? ai.system.allowedSkills : null,
          maxItemW: null, maxItemH: null,
          accessSeconds: ai.system?.accessSeconds ?? 2,
          sourceItemId: ai.id,
        });
      }
    }
    containers.push({
      key: "backpack", label: "Рюкзак", icon: "🎒",
      sourceItemId: bagItem.id,
      sections,
    });
  }

  // Размещаем предметы в секциях
  for (const cont of containers) {
    for (const sec of cont.sections) {
      const grid = makeGrid(sec.cols, sec.rows);
      const placed = [], overflow = [];

      const mine = allItems
        .filter(i => {
          const f = getF(i);
          if (f.sectionKey !== sec.key) return false;
          if (isMountedAttachment(i, actor)) return false;
          if (Object.values(equip).includes(i.id)) return false;
          // Фильтр по навыку (для ножен, крюков и т.д.)
          if (sec.allowedSkills?.length && i.system?.skill) {
            if (!sec.allowedSkills.includes(i.system.skill)) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const pa = getF(a).gridPos, pb = getF(b).gridPos;
          return ((pa?.row ?? 99) - (pb?.row ?? 99)) || ((pa?.col ?? 99) - (pb?.col ?? 99));
        });

      for (const item of mine) {
        const f = getF(item);
        const rotated = !!f.rotated;
        const bw = Number(item.system?.gridW ?? 1);
        const bh = Number(item.system?.gridH ?? 1);
        const w  = rotated ? bh : bw;
        const h  = rotated ? bw : bh;

        if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) { overflow.push(item); continue; }
        if (sec.maxItemW && w > sec.maxItemW) { overflow.push(item); continue; }
        if (sec.maxItemH && h > sec.maxItemH) { overflow.push(item); continue; }

        const pos = f.gridPos;
        if (pos && canPlace(grid, pos.col, pos.row, w, h)) {
          placeOnGrid(grid, pos.col, pos.row, w, h, item.id);
          placed.push({ item, col: pos.col, row: pos.row, w, h, rotated });
        } else {
          const free = findFreeSlot(grid, w, h);
          if (free) {
            placeOnGrid(grid, free.col, free.row, w, h, item.id);
            placed.push({ item, col: free.col, row: free.row, w, h, rotated });
          } else overflow.push(item);
        }
      }
      sec.grid = grid;
      sec.placed = placed;
      sec.overflow = overflow;
    }
  }

  // Предметы без секции → overflow рюкзака / карманов
  const assigned = new Set();
  for (const cont of containers)
    for (const sec of cont.sections)
      for (const p of (sec.placed ?? []))
        assigned.add(p.item.id);

  const unassigned = allItems.filter(i => {
    const f = getF(i);
    return !assigned.has(i.id) && !Object.values(equip).includes(i.id)
      && !isPendingIgnoredItem(i, actor);
  });

    return containers;
}

function getPendingItemsForActor(actor, containers = null) {
  const liveActor = toWorldActor(actor);
  if (!liveActor) return [];

  const conts = containers ?? buildContainers(liveActor);
  const assigned = new Set();
  for (const c of conts)
    for (const s of c.sections ?? [])
      for (const p of s.placed ?? [])
        assigned.add(p.item?.id);

  const equip = liveActor.system?.equipment ?? {};
  return liveActor.items.filter(i =>
    !assigned.has(i.id) &&
    !Object.values(equip).includes(i.id) &&
    !isPendingIgnoredItem(i, liveActor)
  );
}

// ─── App ─────────────────────────────────────────────────

class IronHillsGridInventoryApp extends Application {

  constructor(actor, options = {}) {
    super(options);
    this.actor      = actor;
    this._dragData  = null;
    this._activeSec = "pockets_main";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "grid-inventory"],
      width:     980,
      height:    680,
      resizable: true,
      minimizable: false,
      title:     "Инвентарь"
    });
  }

  static findOpenForActor(actor) {
    return findGridInventoryApp(toWorldActor(actor));
  }

  static openForActor(actor, options = {}) {
    const liveActor = toWorldActor(actor);
    if (!liveActor) return null;

    const existing = IronHillsGridInventoryApp.findOpenForActor(liveActor);
    if (existing) {
      existing.actor = liveActor;
      existing.render(existing.rendered ? false : true);
      existing.bringToTop?.();
      return existing;
    }

    const app = new IronHillsGridInventoryApp(liveActor, options);
    app.render(true);
    return app;
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/grid-inventory.hbs";
  }

  async close(options = {}) {
    const pending = getPendingItemsForActor(this.actor);
    if (pending.length > 0 && !options.force) {
      ui.notifications.warn(`Сначала размести или выброси предметы к распределению: ${pending.length} шт.`);
      this.render(false);
      this.bringToTop?.();
      return;
    }

    return super.close(options);
  }

  async getData() {
    this.actor = toWorldActor(this.actor);
    const actor  = this.actor;
    this.options.title = `Инвентарь — ${actor.name}`;
    const equip  = actor.system?.equipment ?? {};
    const conts  = buildContainers(actor);

    // Слоты экипировки — координаты от footprint предметов в руках (gridW/gridH), без пересечения наручей
    const { slots: geoSlots, silhouetteHeight: equipSilhouetteH } = computeEquipSilhouetteLayout(actor);

    const equipSlots = geoSlots.map(slot => {
      const itemId = equip[slot.key];
      const item   = itemId ? actor.items.get(itemId) : null;
      const covers = item?.system?.covers ?? SLOT_COVERS[slot.key] ?? [];
      return {
        ...slot,
        hasItem:   !!item,
        itemId:    item?.id ?? "",
        itemName:  item?.name ?? "",
        itemImg:   item?.img ?? "",
        itemTier:  item?.system?.tier ?? "",
        resist:    item?.system?.resist ?? null,
        covers:    covers.join(", "),
        durPct:    item?.system?.durability
          ? Math.round(item.system.durability.value / Math.max(1, item.system.durability.max) * 100)
          : null,
        durClass: (() => {
          if (!item?.system?.durability) return "dur-good";
          const pct = Math.round(item.system.durability.value / Math.max(1,item.system.durability.max)*100);
          return pct<=0?"dur-broken":pct<=25?"dur-critical":pct<=50?"dur-damaged":pct<=75?"dur-worn":"dur-good";
        })(),
        itemTooltipStats: (() => {
          if (!item) return "";
          const s = item.system ?? {};
          const parts = [];
          if (s.damage)               parts.push(`⚔ Урон: ${s.damage}`);
          if (s.skill)                parts.push(`🎯 Навык: ${s.skill}`);
          if (s.energyCost)           parts.push(`⚡ Энергия: ${s.energyCost}`);
          if (s.twoHanded)            parts.push(`🤲 Двуручное`);
          if (s.protection?.physical) parts.push(`🛡 Защита: ${s.protection.physical}`);
          if (s.armorClassLabel)      parts.push(`🛡 ${s.armorClassLabel}`);
          if (s.requirementsLabel)    parts.push(`Треб.: ${s.requirementsLabel}`);
          if (s.satiety)              parts.push(`🍖 Сытость: +${s.satiety}`);
          if (s.hydration)            parts.push(`💧 Жажда: +${s.hydration}`);
          {
            const actionSummary = formatItemActionSummary(s);
            if (actionSummary) parts.push(actionSummary);
          }
          if (s.school)               parts.push(formatSpellSchoolRank(s));
          if (s.weight)               parts.push(`⚖ ${s.weight} кг`);
          const desc = s.description ?? s.desc ?? "";
          if (desc) parts.push(String(desc).replace(/<[^>]+>/g,"").slice(0,80));
          return parts.join(" · ");
        })(),
      };
    });

    // Все секции всех контейнеров — для отображения на одном экране
    const allSections = [];
    for (const cont of conts) {
      for (const sec of cont.sections) {
        const gap = sec.pocketMode ? 8 : 0;
        allSections.push({
          contKey:   cont.key,
          contLabel: cont.label,
          contIcon:  cont.icon,
          key:       sec.key,
          label:     sec.label,
          cols:      sec.cols,
          rows:      sec.rows,
          accessSeconds: sec.accessSeconds,
          sourceItemId:  sec.sourceItemId ?? "",
          sourceItemName: sec.sourceItemId ? (actor.items.get(sec.sourceItemId)?.name ?? "") : "",
          allowedLabel:  sec.allowedTypes?.join(", ") ?? null,
          pocketMode:    !!sec.pocketMode,
          isActive:      sec.key === this._activeSec,
          gridW: sec.pocketMode ? sec.cols*(CELL+8) : sec.cols*CELL,
          gridH: sec.rows * CELL,
          cells: this._buildCells(sec.cols, sec.rows, !!sec.pocketMode),
          placed: (sec.placed ?? []).map(p => this._mapPlaced(p, !!sec.pocketMode)),
          overflow: (sec.overflow ?? []).map(i => ({
            itemId: i.id, name: i.name,
            img: i.img ?? "icons/svg/item-bag.svg", type: i.type,
          })),
        });
      }
    }

    const totalOverflow = allSections.reduce((n,s) => n + s.overflow.length, 0);
    const pendingItems = getPendingItemsForActor(actor, conts).map(item => this._mapPendingItem(item, conts));
    const inventoryDashboard = buildInventoryDashboard(actor, { allSections, pendingItems, totalOverflow });

    return {
      actor,
      inventoryDashboard,
      equipSlots,
      equipSilhouetteH,
      allSections,
      totalOverflow,
      pendingItems,
      hasPending: pendingItems.length > 0,
      cellSize: CELL
    };
  }

  _buildCells(cols, rows, pocketMode = false) {
    const gap = pocketMode ? 8 : 0;
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        cells.push({ col:c, row:r, x:c*(CELL+gap), y:r*CELL, size:CELL, isPocket:pocketMode });
    return cells;
  }

  _mapPlaced(p, pocketMode = false) {
    const gap = pocketMode ? 8 : 0;
    const identified  = p.item.system?.identified !== false;
    const visibleName = identified
      ? p.item.name
      : (p.item.system?.unidentifiedName || "❓ Неизвестный предмет");
    const sys = p.item.system ?? {};
    const tooltipParts = [];
    if (identified) {
      if (sys.damage)               tooltipParts.push(`⚔ Урон: ${sys.damage}`);
      if (sys.skill)                tooltipParts.push(`🎯 Навык: ${sys.skill}`);
      if (sys.energyCost)           tooltipParts.push(`⚡ Энергия: ${sys.energyCost}`);
      if (sys.twoHanded)            tooltipParts.push(`🤲 Двуручное`);
      if (sys.protection?.physical) tooltipParts.push(`🛡 Защита: ${sys.protection.physical}`);
      if (sys.armorClassLabel)      tooltipParts.push(`🛡 ${sys.armorClassLabel}`);
      if (sys.requirementsLabel)    tooltipParts.push(`Треб.: ${sys.requirementsLabel}`);
      if (sys.satiety)              tooltipParts.push(`🍖 Сытость: +${sys.satiety}`);
      if (sys.hydration)            tooltipParts.push(`💧 Жажда: +${sys.hydration}`);
      {
        const actionSummary = formatItemActionSummary(sys);
        if (actionSummary) tooltipParts.push(actionSummary);
      }
      if (sys.school)               tooltipParts.push(formatSpellSchoolRank(sys));
      if (sys.weight)               tooltipParts.push(`⚖ ${sys.weight} кг`);
      const desc = sys.description ?? sys.desc ?? "";
      if (desc) tooltipParts.push(String(desc).replace(/<[^>]+>/g,"").slice(0,80));
    }
    const durVal = p.item.system?.durability?.value ?? -1;
    const durMax = p.item.system?.durability?.max   ?? 100;
    const durPct = durVal >= 0 && durMax > 0
      ? Math.round(durVal / durMax * 100) : null;
    const durClass = !durPct ? "" : durPct <= 0 ? "dur-broken"
      : durPct <= 25 ? "dur-critical" : durPct <= 50 ? "dur-damaged"
      : durPct <= 75 ? "dur-worn" : "dur-good";

    return {
      itemId:  p.item.id, name: p.item.name,
      img:     p.item.img ?? "icons/svg/item-bag.svg",
      type:    p.item.type, tier: p.item.system?.tier ?? 1,
      qty:     getItemQuantity(p.item),
      w:p.w, h:p.h, col:p.col, row:p.row, rotated:p.rotated,
      durPct, durClass,
      isBroken: (p.item.system?.durability?.value ?? 1) <= 0,
      cssLeft: p.col*(CELL+gap), cssTop: p.row*CELL,
      cssW: p.w*CELL-3, cssH: p.h*CELL-3,
      identified, visibleName,
      tooltipStats: tooltipParts.join(" · "),
    };
  }

  _mapPendingItem(item, conts = null) {
    const { w, h } = getInventoryItemGridSize(item);
    const qty = getItemQuantity(item);
    const placement = explainAutoPlaceForItem(this.actor, item, conts);

    return {
      itemId: item.id,
      name: item.name,
      img: item.img ?? "icons/svg/item-bag.svg",
      type: item.type,
      w,
      h,
      qty: isStackable(item) && qty > 1 ? qty : null,
      tier: item.system?.tier ?? 1,
      placementText: placement.text,
      placementClass: placement.statusClass,
      canAutoPlace: placement.ok,
    };
  }

  // ─── Listeners ───────────────────────────────────────

  activateListeners(html) {
    super.activateListeners(html);

    // Клик по секции — делает активной (для drag target)
    html.find("[data-sec-key]").on("click", e => {
      this._activeSec = e.currentTarget.dataset.secKey;
      html.find(".ih-gi-sec-block").removeClass("is-active");
      html.find(`[data-sec-key="${this._activeSec}"]`).addClass("is-active");
    });

    // Tooltip позиционирование
    html.on("mouseenter", ".ih-gi-item", e => {
      const tip = $(e.currentTarget).find(".ih-gi-tooltip").first();
      if (!tip.length) return;
      const rect = e.currentTarget.getBoundingClientRect();
      let left = rect.right + 8;
      let top  = rect.top;
      if (left + 200 > window.innerWidth)  left = rect.left - 210;
      if (top  + 160 > window.innerHeight) top  = window.innerHeight - 165;
      tip.css({ display:"block", position:"fixed", top:Math.max(4,top), left:Math.max(4,left), zIndex:99999 });
    });
    html.on("mouseleave", ".ih-gi-item", () => {
      html.find(".ih-gi-tooltip").css("display","none");
    });

      // Tooltip позиционирование в инвентаре
    html.on("mouseenter", ".ih-gi-item", e => {
      const tip = $(e.currentTarget).find(".ih-gi-tooltip").first();
      if (!tip.length) return;
      const rect = e.currentTarget.getBoundingClientRect();
      let left = rect.right + 8;
      let top  = rect.top;
      if (left + 200 > window.innerWidth)  left = rect.left - 210;
      if (top  + 160 > window.innerHeight) top  = window.innerHeight - 165;
      tip.css({ display:"block", position:"fixed",
                top:Math.max(4,top), left:Math.max(4,left), zIndex:99999 });
    });
    html.on("mouseleave", ".ih-gi-item, .ih-gi-equip-slot", () => {
      html.find(".ih-gi-tooltip").css("display", "none");
    });

    // Tooltip на слотах экипировки
    html.on("mouseenter", ".ih-gi-equip-slot.has-item", e => {
      const tip = $(e.currentTarget).find(".ih-gi-tooltip").first();
      if (!tip.length) return;
      const rect = e.currentTarget.getBoundingClientRect();
      let left = rect.right + 8;
      let top  = rect.top;
      if (left + 200 > window.innerWidth)  left = rect.left - 210;
      if (top  + 160 > window.innerHeight) top  = window.innerHeight - 165;
      tip.css({ display:"block", position:"fixed",
                top:Math.max(4,top), left:Math.max(4,left), zIndex:99999 });
    });

      // Drag start с предмета
    html.find(".ih-gi-item").on("dragstart", e => {
      const el = e.currentTarget;
      this._dragData = { itemId: el.dataset.itemId, fromSec: el.dataset.secKey };
      if (e.originalEvent?.dataTransfer) {
        e.originalEvent.dataTransfer.effectAllowed = "move";
        e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(this._dragData));
      }
    });

    html.find(".ih-gi-pending-item").on("dragstart", e => {
      const el = e.currentTarget;
      this._dragData = { itemId: el.dataset.pendingItemId, fromPending: true };
      if (e.originalEvent?.dataTransfer) {
        e.originalEvent.dataTransfer.effectAllowed = "move";
        e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(this._dragData));
      }
      $(el).addClass("dragging");
    });

    html.find(".ih-gi-pending-item").on("dragend", e => {
      $(e.currentTarget).removeClass("dragging");
    });

    // Drop на каждый canvas
    html.find(".ih-gi-canvas").each((_, canvasEl) => {
      canvasEl.addEventListener("dragover", e => {
        e.preventDefault();
        this._highlightCell($(canvasEl), e);
      });
      canvasEl.addEventListener("dragleave", () => {
        $(canvasEl).find(".ih-gi-cell").removeClass("drag-over");
      });
      canvasEl.addEventListener("drop", e => {
        e.preventDefault();
        $(canvasEl).find(".ih-gi-cell").removeClass("drag-over");
        const secKey = canvasEl.dataset.secKey;
        // Принимаем drag из pending stash
        if (!this._dragData) {
          try {
            const ext = JSON.parse(e.dataTransfer?.getData("text/plain") ?? "{}");
            if (ext.itemId) this._dragData = ext;
          } catch {}
        }
        this._onCanvasDrop(e, canvasEl, secKey);
      });
    });

    // Drop на слот экипировки
    html.find(".ih-gi-equip-slot").on("dragover", e => e.preventDefault());
    html.find(".ih-gi-equip-slot").on("drop", e => {
      e.preventDefault(); e.stopPropagation();
      // Принимаем drag из pending stash
      if (!this._dragData) {
        try {
          const ext = JSON.parse((e.originalEvent ?? e).dataTransfer?.getData("text/plain") ?? "{}");
          if (ext.itemId) this._dragData = ext;
        } catch {}
      }
      this._onEquipDrop(e.currentTarget.dataset.slot, e.originalEvent ?? e);
    });

    // Drag с экипировки
    html.find(".ih-gi-equip-slot.has-item").on("dragstart", e => {
      const slot   = e.currentTarget.dataset.slot;
      const itemId = this.actor.system?.equipment?.[slot];
      if (itemId) {
        this._dragData = { itemId, fromEquip: slot };
        if (e.originalEvent?.dataTransfer)
          e.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(this._dragData));
      }
    });

    html.find(".ih-gi-pending-zone").on("dragover", e => {
      e.preventDefault();
      $(e.currentTarget).addClass("drag-over");
    });

    html.find(".ih-gi-pending-zone").on("dragleave", e => {
      $(e.currentTarget).removeClass("drag-over");
    });

    html.find(".ih-gi-pending-zone").on("drop", async e => {
      e.preventDefault();
      e.stopPropagation();
      $(e.currentTarget).removeClass("drag-over");

      let data = this._dragData;
      if (!data) {
        try {
          data = JSON.parse((e.originalEvent ?? e).dataTransfer?.getData("text/plain") ?? "{}");
        } catch {}
      }

      this._dragData = null;
      await this._moveToPending(data);
    });

    // ПКМ на предмет
    html.find(".ih-gi-item").on("contextmenu", e => {
      e.preventDefault();
      this._ctxMenu(e.currentTarget.dataset.itemId, e.currentTarget.dataset.secKey);
    });

    html.find(".ih-gi-sec-header[data-source-item-id]").on("contextmenu", async e => {
      e.preventDefault();
      e.stopPropagation();
      await this._confirmUnmountAttachment(e.currentTarget.dataset.sourceItemId);
    });

    html.find("[data-unmount-attachment]").on("click", async e => {
      e.preventDefault();
      e.stopPropagation();
      await this._confirmUnmountAttachment(e.currentTarget.dataset.itemId);
    });

    // ПКМ на слот экипировки — контекстное меню
    html.find(".ih-gi-equip-slot.has-item").on("contextmenu", async e => {
      e.preventDefault();
      const slot   = e.currentTarget.dataset.slot;
      const itemId = this.actor.system?.equipment?.[slot];
      if (!itemId) return;
      const item = this.actor.items.get(itemId);
      if (!item) return;

      // Строим кнопки идентификации
      let identBtns = {};
      const isIdentifiable = ["weapon","armor","tool","potion","spell","material"].includes(item.type);
      if (isIdentifiable) {
        try {
          const { IDENTIFY_ASPECTS, getIdentStatus } = await import("../services/identification-service.mjs");
          const status = getIdentStatus(item);
          const isIdentified = item.system?.identified !== false;
          if (!isIdentified) {
            for (const asp of status.applicable) {
              if (!asp.revealed) {
                identBtns[`ident_${asp.key}`] = {
                  label: `${asp.label} (DC ${asp.dc})`,
                  callback: () => `ident_${asp.key}`,
                };
              }
            }
          }
          if (game.user?.isGM) {
            if (!isIdentified)
              identBtns["ident_all"] = { label: "✅ Опознать (GM)", callback: () => "ident_all" };
            else
              identBtns["unident"]   = { label: "❓ Сделать неопознанным", callback: () => "unident" };
          }
        } catch {}
      }

      const choice = await Dialog.wait({
        title:   item.name,
        content: buildSystemDialogContent({
          className: "ih-inventory-action-dialog",
          headline: item.name,
          headlineMeta: "экипировка",
        }),
        buttons: {
          unequip: { label: "↩ Снять",            callback: () => "unequip" },

          ...identBtns,
        },
        default: "view",
        close:   () => null,
      });

      if (!choice) return;
      if (choice === "unequip") { await this._unequip(slot, itemId); return; }

      if (choice === "ident_all") {
        const { fullyIdentify } = await import("../services/identification-service.mjs").catch(()=>({}));
        if (fullyIdentify) await fullyIdentify(item, null, 0);
        this.render(false); return;
      }
      if (choice === "unident") {
        const { makeUnidentified } = await import("../services/identification-service.mjs").catch(()=>({}));
        if (makeUnidentified) await makeUnidentified(item);
        this.render(false); return;
      }
      if (choice?.startsWith("ident_")) {
        const { attemptIdentify } = await import("../services/identification-service.mjs").catch(()=>({}));
        if (attemptIdentify) await attemptIdentify(this.actor, item, choice.replace("ident_", ""));
        this.render(false); return;
      }
    });

    // Дабл-клик — быстрая экипировка
    html.find(".ih-gi-item").on("dblclick", async e => {
      await this._quickEquip(e.currentTarget.dataset.itemId);
    });

    // Авто-размещение
    html.find("[data-auto-place]").on("click", e => {
      this._autoPlace(e.currentTarget.dataset.itemId);
    });

    html.find("[data-auto-place-all]").on("click", async e => {
      e.preventDefault();
      const failed = await IronHillsGridInventoryApp.autoPlaceAllItems(this.actor);
      if (failed.length === 0) ui.notifications.info("Все предметы размещены.");
      else {
        const details = summarizeAutoPlaceFailures(toWorldActor(this.actor), failed);
        ui.notifications.warn(`Не разместилось: ${failed.length} шт. ${details}`);
      }
      this.render(false);
      _refreshPendingApp(this.actor);
    });

    html.find("[data-drop-to-ground]").on("click", async e => {
      e.preventDefault();
      const itemId = e.currentTarget.dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (!item) return;

      const drop = await Dialog.confirm({
        title: "Выбросить на землю?",
        content: buildSystemDialogContent({
          className: "ih-inventory-confirm-dialog",
          headline: "Выбросить на землю?",
          status: "Подтверждение",
          statusClass: "is-warn",
          rows: [
            ["Предмет", item.name],
            ["Действие", "выбросить на землю"],
          ],
        }),
        defaultYes: false,
      });
      if (!drop) return;

      await game.ironHills?.dropToGround?.([item], this.actor);
      this.render(false);
      _refreshPendingApp(this.actor);
    });
  }

  async _confirmUnmountAttachment(itemId) {
    if (!itemId) return false;
    const item = this.actor.items.get(itemId);
    if (!item || item.type !== "attachment") return false;

    const ok = await Dialog.confirm({
      title: item.name,
      content: buildSystemDialogContent({
        className: "ih-inventory-confirm-dialog",
        headline: item.name,
        headlineMeta: "крепление",
        status: "Снять крепление?",
        statusClass: "is-warn",
        rows: [
          ["Действие", "снять крепление"],
          ["Содержимое", "отправить в pending"],
        ],
      }),
      defaultYes: false,
    });
    if (!ok) return false;

    await unmountAttachment(toWorldActor(this.actor), item);
    this.render(false);
    _refreshPendingApp(this.actor);
    return true;
  }

  async _moveToPending(data) {
    if (!data?.itemId || data.fromPending) return;

    const worldActor = toWorldActor(this.actor);
    this.actor = worldActor;
    const item = worldActor.items.get(data.itemId);
    if (!item) return;

    const equip = worldActor.system?.equipment ?? {};
    const oldSlot = data.fromEquip
      ?? Object.entries(equip).find(([, itemId]) => itemId === data.itemId)?.[0];

    if (oldSlot) {
      await unequipActorSlot(worldActor, oldSlot);
    } else {
      await clearItemGridPlacement(item);
    }

    this.render(false);
    _refreshPendingApp(worldActor);
  }

  _onCanvasDrop(e, canvasEl, secKey) {
    let data = this._dragData;
    if (!data) { try { data = JSON.parse(e.dataTransfer?.getData("text/plain")??"{}"); } catch { return; } }
    this._dragData = null;
    if (!data?.itemId) return;

    const rect = canvasEl.getBoundingClientRect();
    const sec  = buildContainers(this.actor)
      .flatMap(c => c.sections).find(s => s.key === secKey);
    const gap  = sec?.pocketMode ? 8 : 0;
    const col  = Math.floor((e.clientX - rect.left)  / (CELL + gap));
    const row  = Math.floor((e.clientY - rect.top)   / CELL);

    this._placeInSection(data.itemId, secKey, col, row);
  }

  async _placeInSection(itemId, secKey, col, row) {
    const item  = this.actor.items.get(itemId);
    if (!item) return;

    const conts = buildContainers(this.actor);
    let sec = null;
    for (const cont of conts) {
      sec = cont.sections.find(s => s.key === secKey);
      if (sec) break;
    }
    if (!sec) return;

    if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) {
      ui.notifications.warn(`В "${sec.label}" нельзя класть ${item.type}`); return;
    }

    const f  = item.flags?.["iron-hills-system"] ?? {};
    const rt = !!f.rotated;
    const bw = Number(item.system?.gridW ?? 1), bh = Number(item.system?.gridH ?? 1);
    const w  = rt ? bh : bw, h = rt ? bw : bh;

    if (sec.maxItemW && w > sec.maxItemW) { ui.notifications.warn(`Предмет слишком широк для "${sec.label}"`); return; }
    if (sec.maxItemH && h > sec.maxItemH) { ui.notifications.warn(`Предмет слишком длинный для "${sec.label}"`); return; }

    // Убираем из старой позиции
    if (sec.grid) {
      for (let r = 0; r < sec.grid.length; r++)
        for (let c = 0; c < sec.grid[r].length; c++)
          if (sec.grid[r][c] === itemId) sec.grid[r][c] = null;
    }

    if (!canPlace(sec.grid ?? makeGrid(sec.cols, sec.rows), col, row, w, h)) {
      ui.notifications.warn("Нет места"); return;
    }

    await moveItemToInventorySection(item, secKey, { col, row });
    this.render(false);
    // Уведомляем PendingItemsApp об изменении
    _refreshPendingApp(this.actor);
  }

  async _onEquipDrop(slot, e) {
    let data = this._dragData;
    if (!data) { try { data = JSON.parse(e.dataTransfer?.getData("text/plain")??"{}"); } catch { return; } }
    this._dragData = null;
    if (!data?.itemId) return;

    const actorDoc = toWorldActor(this.actor);
    const item     = actorDoc?.items?.get(data.itemId);
    if (!item) return;
    const slotMeta = EQUIPMENT_SLOT_DEFS.find(s => s.key === slot);
    const slotCfg = getCompatibleEquipmentSlots(item).find(s => s.key === slot);
    if (!slotCfg) {
      if (item.type === "attachment") {
        const mount = getAttachmentMountTargets(actorDoc, item).find(target => target.slotKey === slot);
        if (mount) {
          await mountAttachment(actorDoc, item, mount);
          this.render(false);
          _refreshPendingApp(this.actor);
          return;
        }
      }
      ui.notifications.warn(`В "${slotMeta?.label ?? slot}" нельзя надеть ${item.name}`); return;
    }

    const equipped = await equipActorItem(actorDoc, item, slot);
    if (!equipped) return;

    // Снимаем предмет из старого слота если он уже надет куда-то

    // Если в новом слоте что-то было — снимаем это
    this.render(false);
    _refreshPendingApp(this.actor);
  }

  async _unequip(slot, itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;

    const worldActor = toWorldActor(this.actor);
    const worldItem = await unequipActorSlot(worldActor, slot) ?? (worldActor.items.get(itemId) ?? item);
    // Сбрасываем позицию в grid чтобы предмет попал в нераспределённые

    // Небольшая пауза чтобы Foundry успел обновить состояние
    await new Promise(r => setTimeout(r, 100));

    // Пробуем авторазместить в контейнер
    const conts = buildContainers(worldActor);
    const placed = await IronHillsGridInventoryApp._autoPlaceItem(worldActor, worldItem, conts);

    if (!placed) {
      const drop = await Dialog.confirm({
        title:   `${worldItem.name} не влезает`,
        content: buildSystemDialogContent({
          className: "ih-inventory-confirm-dialog",
          headline: `${worldItem.name} не влезает`,
          status: "Нет свободного места",
          statusClass: "is-danger",
          rows: [
            ["Предмет", worldItem.name],
            ["Проблема", "нет места в рюкзаках и карманах"],
          ],
          notes: [
            ["Вариант", "выбросить на землю"],
          ],
        }),
        yes:     () => true,
        no:      () => false,
        defaultYes: false,
      });
      if (drop) {
        await game.ironHills?.dropToGround?.([worldItem], worldActor);
      } else {
        // Отказался выбрасывать — открываем PendingItemsApp
        const { PendingItemsApp } = await import("./pending-items-app.mjs").catch(()=>({}));
        if (PendingItemsApp) await PendingItemsApp.openIfNeeded(worldActor);
      }
    }

    this.render(false);
    _refreshPendingApp(this.actor);
  }

  async _clearContainedItemsForSlot(actor, slot) {
    await clearContainedItemsForEquipmentSlot(actor, slot);
  }

  async _rotate(itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;
    const f = item.flags?.["iron-hills-system"] ?? {};
    await item.update({ "flags.iron-hills-system.rotated": !f.rotated });
    this.render(false);
  }

  async _quickEquip(itemId) {
    const item = this.actor.items.get(itemId);
    if (!item) return;

    const mounted = await IronHillsGridInventoryApp._tryAutoMountAttachment(this.actor, item);
    if (mounted) {
      this.render(false);
      _refreshPendingApp(this.actor);
      return;
    }

    const compat = getCompatibleEquipmentSlots(item);
    if (!compat.length) return;
    const equip  = this.actor.system?.equipment ?? {};
    const free   = compat.find(s => !equip[s.key]) ?? compat[0];
    await this._onEquipDrop(free.key, { dataTransfer: { getData: () => JSON.stringify({ itemId }) } });
  }

  /**
   * Авторазместить все нераспределённые предметы актора.
   * Возвращает массив предметов которые не влезли.
   */
  static async autoPlaceAllItems(actor) {
    const target = toWorldActor(actor);
    if (!target) return [];
    const unplaced = sortItemsForAutoPlacement(getPendingItemsForActor(target));

    const failed = [];
    for (const item of unplaced) {
      const liveItem = target.items.get(item.id);
      if (!liveItem) continue;

      const mounted = await IronHillsGridInventoryApp._tryAutoMountAttachment(target, liveItem);
      if (mounted) continue;

      const equipped = await IronHillsGridInventoryApp._tryAutoEquip(target, liveItem);
      if (equipped) continue;

      const placed = await IronHillsGridInventoryApp._autoPlaceItem(target, liveItem, buildContainers(target));
      if (!placed) failed.push(liveItem);
    }

    return failed.filter(item => getPendingItemsForActor(target).some(p => p.id === item.id));
  }

  /** Попытка разместить один предмет в свободную ячейку */
  static async _autoPlaceItem(actor, item, conts) {
    const f  = getInventoryFlags(item);
    const rt = !!f.rotated;
    const w  = rt ? (item.system?.gridH ?? 1) : (item.system?.gridW ?? 1);
    const h  = rt ? (item.system?.gridW ?? 1) : (item.system?.gridH ?? 1);

    for (const cont of conts) {
      if (cont.isPending) continue;
      for (const sec of cont.sections) {
        if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) continue;
        if (sec.maxItemW && w > sec.maxItemW) continue;
        if (sec.maxItemH && h > sec.maxItemH) continue;
        const slot = findFreeSlot(sec.grid, w, h);
        if (slot) {
          await moveItemToInventorySection(item, sec.key, { col: slot.col, row: slot.row });
          // Обновляем grid для следующей итерации
          for (let r = slot.row; r < slot.row + h; r++)
            for (let c = slot.col; c < slot.col + w; c++)
              if (sec.grid[r]) sec.grid[r][c] = item.id;
          return true;
        }
      }
    }
    return false;
  }


  /** Попытка надеть предмет в подходящий свободный слот экипировки */
  static async _tryAutoMountAttachment(actor, item) {
    if (item?.type !== "attachment") return false;
    const target = toWorldActor(actor);
    const mount = findFreeAttachmentMount(target, item);
    if (!mount) return false;
    return mountAttachment(target, item, mount);
  }

  static async _tryAutoEquip(actor, item) {
    const qty = getItemQuantity(item);
    if (qty > 1) return false;

    const equip = actor.system?.equipment ?? {};
    const slots = getCompatibleEquipmentSlots(item);

    // Слот свободен если: не задан, пустая строка, или предмет с таким id не существует
    const slotCfg = slots.find(s => {
      const cur = equip[s.key];
      if (!cur) return true; // пусто
      return !actor.items.get(cur); // предмет удалён
    });
    if (!slotCfg) return false;

    const target = toWorldActor(actor);
    return equipActorItem(target, item, slotCfg.key);
  }

  async _autoPlace(itemId) {
    const item  = this.actor.items.get(itemId);
    if (!item) return;

    const mounted = await IronHillsGridInventoryApp._tryAutoMountAttachment(this.actor, item);
    if (mounted) {
      this.render(false);
      _refreshPendingApp(this.actor);
      return;
    }

    const equipped = await IronHillsGridInventoryApp._tryAutoEquip(this.actor, item);
    if (equipped) {
      this.render(false);
      _refreshPendingApp(this.actor);
      return;
    }

    const placed = await IronHillsGridInventoryApp._autoPlaceItem(this.actor, item, buildContainers(this.actor));
    if (placed) {
      this.render(false);
      _refreshPendingApp(this.actor);
      return;
    }

    const reason = explainAutoPlaceForItem(toWorldActor(this.actor), item);
    ui.notifications.warn(reason.text);
  }

  async _ctxMenu(itemId, currentSec) {
    const item  = this.actor.items.get(itemId);
    if (!item) return;

    const equipBtns = {};
    for (const s of getCompatibleEquipmentSlots(item))
      equipBtns[s.key] = { label:`${s.icon} → ${s.label}`, callback:()=>s.key };

    const mountBtns = {};
    if (item.type === "attachment") {
      for (const mount of getAttachmentMountTargets(this.actor, item)) {
        mountBtns[`mount:${mount.key}`] = {
          label: `+ ${mount.label}`,
          callback: () => `mount:${mount.key}`,
        };
      }
      if (isMountedAttachment(item, this.actor)) {
        mountBtns.unmount = { label: "Unmount attachment", callback: () => "unmount" };
      }
    }

    const moveBtns = {};
    const conts = buildContainers(this.actor);
    for (const cont of conts)
      for (const sec of cont.sections) {
        if (sec.key === currentSec) continue;
        if (sec.allowedTypes && !sec.allowedTypes.includes(item.type)) continue;
        moveBtns[sec.key] = { label:`${cont.icon} → ${sec.label}`, callback:()=>`move:${sec.key}` };
      }

    // Стоимость ремонта
    const durCur  = Number(item.system?.durability?.value ?? 100);
    const durMax  = Number(item.system?.durability?.max   ?? 100);
    const durTier = Number(item.system?.tier ?? 1);
    const repairCostDisplay = Math.ceil(Math.max(0, durMax - durCur) * durTier * 10);

    // Опции идентификации
    const isIdentifiable = ["weapon","armor","tool","potion","spell","material"].includes(item.type);
    const isIdentified   = item.system?.identified !== false;
    let identBtns = {};
    if (isIdentifiable) {
      const { IDENTIFY_ASPECTS, getIdentStatus } = await import("../services/identification-service.mjs").catch(()=>({}));
      if (IDENTIFY_ASPECTS) {
        const status = getIdentStatus(item);
        if (!isIdentified) {
          // Кнопки раскрытия аспектов
          for (const asp of status.applicable) {
            if (!asp.revealed) {
              identBtns[`ident_${asp.key}`] = {
                label: `${asp.label} (DC ${asp.dc})`,
                callback: () => `ident_${asp.key}`
              };
            }
          }
        }
        if (game.user?.isGM) {
          if (!isIdentified) {
            identBtns["ident_all"] = { label: "✅ Опознать полностью (GM)", callback: () => "ident_all" };
          } else {
            identBtns["unident"]   = { label: "❓ Сделать неопознанным",    callback: () => "unident"   };
          }
        }
      }
    }

    const choice = await Dialog.wait({
      title: item.name,
      content: buildSystemDialogContent({
        className: "ih-inventory-action-dialog",
        headline: item.name,
        headlineMeta: `ст.${item.system?.tier ?? 1}`,
      }),
      buttons:{
        ...equipBtns, ...mountBtns, ...moveBtns,
        rotate:{ label:"↺ Повернуть", callback:()=>"rotate" },
        ...( ["weapon","armor","tool"].includes(item.type) && Number(item.system?.durability?.value??100) < Number(item.system?.durability?.max??100)
          ? { repair: { label:`🔨 Починить (${repairCostDisplay} мед.)`, callback:()=>"repair" } } : {} ),
        ...identBtns,
        drop:  { label:"🪨 На землю",    callback:()=>"ground" },
        del:   { label:"🗑 Удалить",      callback:()=>"delete" },
      },
      default:"rotate"
    });

    if (!choice) return;

    // Идентификация
    if (choice?.startsWith?.("ident_")) {
      const { attemptIdentify, fullyIdentify, IDENTIFY_ASPECTS } = await import("../services/identification-service.mjs").catch(()=>({}));
      if (!attemptIdentify) return;
      if (choice === "ident_all") {
        await fullyIdentify(item, null, 0);
      } else {
        const aspect = choice.replace("ident_", "");
        await attemptIdentify(this.actor, item, aspect);
      }
      this.render(false); return;
    }
    if (choice === "unident") {
      const { makeUnidentified } = await import("../services/identification-service.mjs").catch(()=>({}));
      if (makeUnidentified) await makeUnidentified(item);
      this.render(false); return;
    }

    if (choice==="repair") {
      const { repairItem } = await import("../services/durability-service.mjs");
      await repairItem(item, this.actor, game.user?.isGM);
      this.render(false); return;
    }
    if (choice==="rotate")        { await this._rotate(itemId); return; }
    if (choice==="ground")        {
      await game.ironHills.dropToGround?.([item], this.actor)
         ?? ui.notifications.warn("dropToGround не доступен");
      this.render(false); _refreshPendingApp(this.actor); return;
    }
    if (choice==="delete")        { await item.delete(); this.render(false); _refreshPendingApp(this.actor); return; }
    if (choice === "unmount") {
      await unmountAttachment(toWorldActor(this.actor), item);
      this.render(false);
      _refreshPendingApp(this.actor);
      return;
    }
    if (choice.startsWith("mount:")) {
      const mountKey = choice.replace("mount:", "");
      const worldActor = toWorldActor(this.actor);
      const mount = getAttachmentMountTargets(worldActor, item).find(t => t.key === mountKey);
      if (mount) await mountAttachment(worldActor, item, mount);
      this.render(false);
      _refreshPendingApp(this.actor);
      return;
    }
    if (choice.startsWith("move:")){
      const t=choice.replace("move:","");
      await moveItemToInventorySection(item, t, null);
      this.render(false);
      _refreshPendingApp(this.actor);
      return;
    }
    await this._onEquipDrop(choice, { dataTransfer:{getData:()=>JSON.stringify({itemId})} });
  }

  _highlightCell(jqCanvas, e) {
    const canvasEl = jqCanvas[0];
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const secKey = canvasEl.dataset.secKey;
    const sec = buildContainers(this.actor).flatMap(c=>c.sections).find(s=>s.key===secKey);
    const gap = sec?.pocketMode ? 8 : 0;
    const col = Math.floor((e.clientX-rect.left)/(CELL+gap));
    const row = Math.floor((e.clientY-rect.top)/CELL);
    jqCanvas.find(".ih-gi-cell").removeClass("drag-over");
    jqCanvas.find(`.ih-gi-cell[data-col="${col}"][data-row="${row}"]`).addClass("drag-over");
  }
}

export { IronHillsGridInventoryApp, buildContainers, getPendingItemsForActor };
