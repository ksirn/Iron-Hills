import { IronHillsCombatTechniqueApp } from "./combat-technique-app.mjs";
import { IronHillsSpellCastApp } from "./spell-cast-app.mjs";
import { placeAoeTemplate, applyAoeDamage, removeAoeTemplate, AOE_TYPES } from "../services/aoe-service.mjs";
import { getAvailableTechniques } from "../constants/combat-techniques.mjs";
import {
  getCombatUiState,
  isCombatActive,
  nextTurn,
  endCombat,
  canActorCommitAction,
  getActorPendingAction,
  continuePendingAction,
  cancelPendingAction,
  endTurnForActor,
  isActorActiveTurn,
  advanceTurnIfReady,
  spendActorSeconds,
  spendActionSeconds
} from "../services/combat-flow-service.mjs";

import {
  getPersistentActor,
  getPersistentActorUuid,
  resolvePersistentActorFromTokenOrUser
} from "../utils/actor-utils.mjs";
import {
  getHitLocation,
  getBestResistForZone
} from "../services/actor-state-service.mjs";
import { actorsAreAllies } from "../services/disposition-service.mjs";
import { num } from "../utils/math-utils.mjs";
import { getWeaponRange, getTokenGridDistance, getActorToken } from "../utils/item-utils.mjs";

function getRatio(value, max) {
  const safeMax = Math.max(1, num(max, 1));
  return Math.max(0, Math.min(1, num(value, 0) / safeMax));
}

function getZoneClass(value, max) {
  const ratio = getRatio(value, max);
  if (ratio <= 0) return "is-dead";
  if (ratio <= 0.25) return "is-critical";
  if (ratio <= 0.5) return "is-bad";
  if (ratio <= 0.75) return "is-warn";
  return "is-good";
}

function getHudActor() {
  return resolvePersistentActorFromTokenOrUser();
}

function getParticipantSideClass(side) {
  if (side === "ally") return "side-ally";
  if (side === "enemy") return "side-enemy";
  return "side-neutral";
}

function isFriendlySide(a, b) {
  if (a === "neutral" || b === "neutral") return false;
  return a === b;
}

function getPartTrauma(hpNode) {
  const status = hpNode?.status ?? {};
  return {
    minorBleeding: Number(status.minorBleeding ?? 0),
    majorBleeding: Number(status.majorBleeding ?? 0),
    fracture: Boolean(status.fracture),
    destroyed: Boolean(status.destroyed),
    splinted: Boolean(status.splinted),
    tourniquet: Boolean(status.tourniquet)
  };
}

// Строит строку tooltip для части тела
function buildZoneTooltip(label, value, max, trauma) {
  const parts = [`${label}: ${value}/${max}`];
  if (trauma.destroyed)       parts.push("⚫ Разрушено");
  if (trauma.majorBleeding)   parts.push(`🔴 Сильн. кровотечение: ${trauma.majorBleeding}`);
  if (trauma.minorBleeding)   parts.push(`🟡 Мал. кровотечение: ${trauma.minorBleeding}`);
  if (trauma.fracture)        parts.push("🟣 Перелом");
  if (trauma.tourniquet)      parts.push("🔵 Жгут наложен");
  if (trauma.splinted)        parts.push("🟢 Шина наложена");
  return parts.join(" | ");
}

export class IronHillsCombatHudApp extends Application {
  constructor(options = {}) {
    super(options);
    // Компактный режим убран — панель всегда развёрнута
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes:   ["iron-hills", "combat-hud-app"],
      width:     220,
      height:    "auto",
      resizable: false,
      title:     "HUD",
      popOut:    true,
    });
  }

  setPosition(pos = {}) {
    // Фиксируем в нижнем левом углу над тулбаром
    const tbH = document.getElementById("ih-tb")?.offsetHeight ?? 60;
    const h   = this.element?.[0]?.offsetHeight ?? 400;
    pos.left   = 4;
    pos.top    = window.innerHeight - tbH - h - 8;
    pos.width  = 320;
    return super.setPosition(pos);
  }

  get template() {
    return "systems/iron-hills-system/templates/apps/combat-hud.hbs";
  }

  _applySizing() {
    try {
      if (!this.rendered) return;
      this.setPosition({
        width: this._compactMode ? 320 : 620,
        height: "auto"
      });
    } catch (err) {
      console.warn("Iron Hills | HUD sizing failed", err);
    }
  }

  _refreshHud({ keepOnTop = false } = {}) {
    if (!this.rendered) return;
    this.render(false, { focus: false });

    window.setTimeout(() => {
      this._applySizing();
      if (keepOnTop) {
        try {
          if (this.element?.length) this.bringToTop();
        } catch (_err) {}
      }
    }, 10);
  }

  _canActorUseCombatAction(actor) {
    return canActorCommitAction(actor);
  }

  async _toggleCompactMode() {
    this._compactMode = !this._compactMode;
    this.render(true, { focus: false });

    window.setTimeout(() => {
      this._applySizing();
      try {
        if (this.element?.length) this.bringToTop();
      } catch (_err) {}
    }, 10);
  }

  // Универсальный вызов атаки — работает для персонажей, NPC и монстров
  async _callPerformAttack(actor, params) {
    // Персонаж — есть _performAttack на sheet
    if (typeof actor.sheet?._performAttack === "function") {
      return actor.sheet._performAttack(params);
    }
    // NPC/монстр — используем упрощённую атаку через combat-flow-service
    return this._performNpcAttack(actor, params);
  }

  async _performNpcAttack(actor, {
    skillKey, label, damageType = "physical",
    baseDamage = 1, energyCost = 5, weapon = null,
    hitBonus = 0, ignoreArmor = 0, targetZone = null,
    aimed = false, technique = null,
  }) {
    // Штраф прочности оружия (NPC-атака, упрощённая)
    if (weapon) {
      const cur  = Number(weapon.system?.durability?.value ?? 100);
      const max  = Number(weapon.system?.durability?.max   ?? 100);
      const pct  = max > 0 ? cur / max : 1;
      if (pct <= 0) {
        ui.notifications.warn(`${weapon.name} сломан — атака невозможна!`);
        return;
      }
      const mult = pct <= 0.25 ? 0.70 : pct <= 0.50 ? 0.85 : pct <= 0.75 ? 0.95 : 1;
      baseDamage = Math.max(1, Math.floor(baseDamage * mult));
      // Износ оружия (20% шанс за атаку)
      if (Math.random() < 0.2) {
        import("../services/durability-service.mjs").then(({ wearItem }) => {
          wearItem(weapon, 1, actor).catch(() => {});
        });
      }
    }
    // Проверяем энергию
    const energy = actor.system?.resources?.energy;
    const curEnergy = Number(energy?.value ?? 0);
    if (curEnergy < energyCost) {
      ui.notifications.warn(`${actor.name}: недостаточно энергии (${curEnergy}/${energyCost})`);
      return;
    }

    // Цель: явный таргет → авто-поиск ближайшего НЕ-союзника по disposition
    const targetTokenObj = [...(game.user.targets ?? [])].find(t => t.actor)
                ?? [...(game.canvas?.tokens?.placeables ?? [])]
                    .find(t => t.actor && t.actor.id !== actor.id
                            && !actorsAreAllies(actor, t.actor));
    const target = targetTokenObj?.actor;

    // Проверка дальности атаки
    if (target && weapon) {
      const attackerToken = getActorToken(actor);
      if (attackerToken && targetTokenObj && canvas?.scene) {
        const dist = getTokenGridDistance(attackerToken, targetTokenObj);
        const range = getWeaponRange(weapon);
        if (dist > range) {
          ui.notifications.warn(`${actor.name}: цель вне досягаемости (${Math.ceil(dist)}/${range} клеток)`);
          return;
        }
      }
    }

    // Бросок атаки
    const skillVal = Number(actor.system?.skills?.[skillKey]?.value
                  ?? actor.system?.combat?.attackBonus ?? 3);
    const dieSize  = Math.min(20, Math.max(2, skillVal * 2));
    const roll     = await new Roll(`1d${dieSize}`).evaluate();
    const total    = roll.total + (hitBonus ?? 0);

    // Снимаем энергию
    await actor.update({ "system.resources.energy.value": Math.max(0, curEnergy - energyCost) });

    // Строим сообщение в чат
    let content = `<div style="font-family:var(--font-primary);padding:6px">
      <b>${actor.name}</b> атакует: <b>${label}</b><br>
      Бросок: <b>${total}</b> (d${dieSize}${hitBonus ? `${hitBonus >= 0 ? "+" : ""}${hitBonus}` : ""})
      ${technique ? `<br>Приём: ${technique.icon ?? "⚔"} ${technique.label}` : ""}
      ${aimed ? `<br>🎯 Прицел: ${targetZone}` : ""}`;

    if (target) {
      const locRoll = await new Roll("1d20").evaluate();
      const locKey  = targetZone ?? getHitLocation(locRoll.total);
      const reduction = getBestResistForZone(target, locKey, damageType);
      const armorPen  = Math.round(reduction * (ignoreArmor ?? 0));
      const effRed    = Math.max(0, reduction - armorPen);
      const margin    = Math.max(0, total - 5);
      const rawDmg    = Number(baseDamage) + margin;
      const finalDmg  = Math.max(0, rawDmg - effRed);

      // Наносим урон
      if (target.system?.resources?.hp) {
        if (target.type === "monster") {
          const hp = Number(target.system.resources.hp.value ?? 0);
          await target.update({ "system.resources.hp.value": Math.max(0, hp - finalDmg) });
        } else {
          const torsoHp = Number(target.system.resources.hp?.[locKey]?.value ?? target.system.resources.hp?.torso?.value ?? 0);
          const hpPath  = target.system.resources.hp?.[locKey] ? `system.resources.hp.${locKey}.value` : "system.resources.hp.torso.value";
          await target.update({ [hpPath]: Math.max(0, torsoHp - finalDmg) });
        }
      }

      content += `<br>→ ${target.name}: урон <b>${finalDmg}</b>`;
      if (effRed > 0) content += ` (броня −${effRed})`;
    } else {
      content += `<br><i>Нет цели</i>`;
    }

    content += `</div>`;
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
  }

  // ── Кастование заклинания ───────────────────────────────────
  async _castSpell() {
    const actor = getHudActor();
    if (!actor) return;

    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) {
      ui.notifications.warn(combatCheck.reason);
      return;
    }

    // Получаем цели
    const targets = [...(game.user.targets ?? [])].map(t => t.actor).filter(Boolean);

    // Открываем диалог выбора заклинания
    const choice = await IronHillsSpellCastApp.choose(actor, targets);
    if (!choice) return;

    const { spell } = choice;
    const manaCur = Number(actor.system?.resources?.mana?.value ?? 0);

    if (manaCur < spell.manaCost) {
      ui.notifications.warn(`Недостаточно маны (${manaCur}/${spell.manaCost})`);
      return;
    }

    // Тратим ману и время
    await actor.update({ "system.resources.mana.value": Math.max(0, manaCur - spell.manaCost) });

    spendActorSeconds(actor.id, spell.castTime, {
      actionType: "spell", label: spell.label
    });

    // AoE заклинание
    if (spell.aoe) {
      const result = await placeAoeTemplate({
        aoeType:      spell.aoe.shape,
        distance:     spell.aoe.distance,
        label:        spell.label,
        color:        { fire:"#ff4400", ice:"#88ccff", lightning:"#ffee44",
                        shadow:"#6600aa", light:"#ffee99", earth:"#886633",
                        mind:"#cc88ff", summon:"#44aa88" }[spell.school] ?? "#8888ff",
        attacker:     actor,
        skillKey:     "magic",
        friendlyFire: spell.friendlyFire ?? false,
      });

      if (!result) { this._refreshHud({ keepOnTop:true }); return; }

      const { template, targets: zoneTargets } = result;

      await applyAoeDamage({
        attacker:     actor,
        targets:      zoneTargets,
        baseDamage:   spell.damage,
        skillKey:     "magic",
        damageType:   spell.damageType,
        aoeType:      spell.aoe.type,
        maxTargets:   spell.aoe.maxTargets ?? null,
        chainDecay:   spell.aoe.chainDecay ?? 0.8,
        label:        spell.label,
        effect:       spell.effect,
        friendlyFire: spell.friendlyFire ?? false,
      });

      await removeAoeTemplate(template, 3000);

    } else if (spell.damage > 0) {
      // Одиночное заклинание
      const target = targets[0] ?? [...(game.user.targets??[])][0]?.actor;
      if (!target) {
        ui.notifications.warn("Нет цели — возьми цель в таргет (T)");
        this._refreshHud({ keepOnTop:true });
        return;
      }

      const skillVal = Number(actor.system?.skills?.magic?.value
                            ?? actor.system?.skills?.sorcery?.value ?? 3);
      const dieSize  = Math.min(20, Math.max(2, skillVal * 2));
      const roll     = await new Roll(`1d${dieSize}`).evaluate();
      const defVal   = Number(target.system?.skills?.defense?.value ?? 0);
      const hit      = roll.total >= 5 + defVal;

      if (hit) {
        const hp     = target.system?.resources?.hp?.torso?.value
                    ?? target.system?.resources?.hp?.value ?? 0;
        const hpPath = target.system?.resources?.hp?.torso !== undefined
          ? "system.resources.hp.torso.value" : "system.resources.hp.value";
        await target.update({ [hpPath]: Math.max(0, hp - spell.damage) });

        if (spell.effect?.applyCondition &&
            Math.random() < (spell.effect.conditionChance ?? 1)) {
          await target.update({ [`system.conditions.${spell.effect.applyCondition}`]: 1 });
        }
      }

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div style="padding:6px">
          ✨ <b>${actor.name}</b> → <b>${spell.label}</b> → ${target.name}<br>
          Бросок: <b>${roll.total}</b> — ${hit ? `попал, урон <b>${spell.damage}</b>` : "промах"}
          ${hit && spell.effect?.applyCondition ? ` · ${spell.effect.applyCondition}` : ""}
        </div>`
      });

    } else if (spell.effect?.special === "buff" || spell.effect?.special === "debuff") {
      // Бафф/дебафф
      const tgt = targets[0] ?? actor;
      if (spell.effect.applyCondition) {
        await tgt.update({ [`system.conditions.${spell.effect.applyCondition}`]: 1 });
      }
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div style="padding:6px">✨ <b>${spell.label}</b> → ${tgt.name}</div>`
      });
    }

    this._refreshHud({ keepOnTop: true });
  }

  // ── Кастование заклинания ───────────────────────────────────
  async _castSpell() {
    const actor = getHudActor();
    if (!actor) return;
    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) { ui.notifications.warn(combatCheck.reason); return; }
    const targets = [...(game.user.targets ?? [])].map(t => t.actor).filter(Boolean);
    const choice  = await IronHillsSpellCastApp.choose(actor, targets);
    if (!choice) return;
    const { spell } = choice;
    const manaCur = Number(actor.system?.resources?.mana?.value ?? 0);
    if (manaCur < spell.manaCost) {
      ui.notifications.warn(`Недостаточно маны (${manaCur}/${spell.manaCost})`); return;
    }
    await actor.update({ "system.resources.mana.value": Math.max(0, manaCur - spell.manaCost) });
    spendActorSeconds(actor.id, spell.castTime, { actionType:"spell", label:spell.label });

    const SCHOOL_COLORS = {
      fire:"#ff4400", ice:"#88ccff", lightning:"#ffee44",
      shadow:"#6600aa", light:"#ffee99", earth:"#886633",
      mind:"#cc88ff", summon:"#44aa88"
    };

    if (spell.aoe) {
      const result = await placeAoeTemplate({
        aoeType:      spell.aoe.shape,
        distance:     spell.aoe.distance,
        label:        spell.label,
        color:        SCHOOL_COLORS[spell.school] ?? "#8888ff",
        attacker:     actor,
        skillKey:     "magic",
        hitBonus:     0,
        friendlyFire: spell.friendlyFire ?? false,
      });
      if (!result) { this._refreshHud({ keepOnTop:true }); return; }
      const { template, targets: zoneTargets } = result;
      await applyAoeDamage({
        attacker: actor, targets: zoneTargets,
        baseDamage: spell.damage, skillKey: "magic",
        damageType: spell.damageType, aoeType: spell.aoe.type,
        maxTargets: spell.aoe.maxTargets ?? null,
        chainDecay: spell.aoe.chainDecay ?? 0.8,
        label: spell.label, effect: spell.effect,
        friendlyFire: spell.friendlyFire ?? false,
      });
      await removeAoeTemplate(template, 3000);
    } else if (spell.damage > 0) {
      const target = targets[0];
      if (!target) { ui.notifications.warn("Возьми цель в таргет (T)"); this._refreshHud({ keepOnTop:true }); return; }
      const skillVal = Number(actor.system?.skills?.magic?.value ?? actor.system?.skills?.sorcery?.value ?? 3);
      const dieSize  = Math.min(20, Math.max(2, skillVal * 2));
      const roll     = await new Roll(`1d${dieSize}`).evaluate();
      const defVal   = Number(target.system?.skills?.defense?.value ?? 0);
      const hit      = roll.total >= 5 + defVal;
      if (hit) {
        const hpPath = target.system?.resources?.hp?.torso !== undefined ? "system.resources.hp.torso.value" : "system.resources.hp.value";
        const hp     = target.system?.resources?.hp?.torso?.value ?? target.system?.resources?.hp?.value ?? 0;
        await target.update({ [hpPath]: Math.max(0, hp - spell.damage) });
        if (spell.effect?.applyCondition && Math.random() < (spell.effect.conditionChance ?? 1))
          await target.update({ [`system.conditions.${spell.effect.applyCondition}`]: 1 });
      }
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div style="padding:6px">✨ <b>${actor.name}</b> → <b>${spell.label}</b> → ${target.name}<br>Бросок: <b>${roll.total}</b> — ${hit ? `попал, урон <b>${spell.damage}</b>` : "промах"}${hit && spell.effect?.applyCondition ? ` · ${spell.effect.applyCondition}` : ""}</div>`
      });
    } else if (spell.effect?.applyCondition) {
      const tgt = targets[0] ?? actor;
      await tgt.update({ [`system.conditions.${spell.effect.applyCondition}`]: 1 });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div style="padding:6px">✨ <b>${spell.label}</b> → ${tgt.name}</div>`
      });
    }
    this._refreshHud({ keepOnTop: true });
  }

    // ── AoE Атака ──────────────────────────────────────────────
  async _performAoeAttack(actor, { aoeType, distance, baseDamage, energyCost,
      skillKey, label, damageType = "physical", ignoreArmor = 0 }) {

    // Проверяем энергию
    const curEnergy = Number(actor.system?.resources?.energy?.value ?? 0);
    if (curEnergy < energyCost) {
      ui.notifications.warn(`Недостаточно энергии (${curEnergy}/${energyCost})`);
      return;
    }

    // Уведомляем игроков
    ui.notifications.info(`${actor.name}: ${label} — укажи зону на сцене`);

    // Размещаем шаблон. Физика по умолчанию не задевает союзников.
    const result = await placeAoeTemplate({
      aoeType, distance, label,
      color:        skillKey === "bow" || skillKey === "crossbow" ? "#4488ff" : "#ff4444",
      attacker:     actor,
      skillKey,
      hitBonus:     0,
      friendlyFire: false,
    });

    if (!result) {
      ui.notifications.info("Атака отменена");
      return;
    }

    const { template, targets } = result;

    // Списываем энергию
    await actor.update({ "system.resources.energy.value": Math.max(0, curEnergy - energyCost) });

    // Бросок атаки (один для всего AoE)
    const skillVal = Number(actor.system?.skills?.[skillKey]?.value ?? 3);
    const dieSize  = Math.min(20, Math.max(2, skillVal * 2));
    const roll     = await new Roll(`1d${dieSize}`).evaluate();

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div style="padding:4px">💥 <b>${label}</b> — бросок: <b>${roll.total}</b> (d${dieSize})</div>`
    });

    // Применяем урон. Физический AoE (стрелы, удары) по умолчанию не задевает союзников.
    await applyAoeDamage({
      attacker: actor, targets, baseDamage, skillKey, damageType, ignoreArmor, label,
      friendlyFire: false,
    });

    // Удаляем шаблон через 3 секунды
    await removeAoeTemplate(template, 3000);

    this._refreshHud({ keepOnTop: true });
  }

  // ── «Перевести дух» — тратит весь ход, восстанавливает энергию ─
  async _breathe() {
    const actor = getHudActor();
    if (!actor) return;

    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) {
      ui.notifications.warn(combatCheck.reason || "Сейчас действие недоступно.");
      return;
    }

    const energyMax = Number(actor.system?.resources?.energy?.max   ?? 10);
    const baseMax   = Number(actor.system?.resources?.energy?.baseMax ?? energyMax);
    const minMax    = Math.max(1, Math.floor(baseMax * 0.20));

    // Восстанавливаем энергию до max, но max -1 (небольшая усталость от передышки в бою)
    const newMax = Math.max(minMax, energyMax - 1);
    await actor.update({
      "system.resources.energy.value": newMax,
      "system.resources.energy.max":   newMax,
    });

    // Тратим весь ход
    spendActionSeconds(actor, 6, { actionType: "breathe", label: "Перевести дух" });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div style="padding:6px">
        💨 <b>${actor.name}</b> переводит дух.<br>
        ⚡ Энергия: <b>${newMax}/${newMax}</b>
        ${newMax < energyMax ? `<br><span style="color:#f87171">Макс. энергии −1 от усталости</span>` : ""}
      </div>`
    });

    this._refreshHud({ keepOnTop: true });
  }

  async _attack(hand) {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    const combatCheck = this._canActorUseCombatAction(actor);
    if (!combatCheck.ok) {
      ui.notifications.warn(combatCheck.reason || "Сейчас действие недоступно.");
      return;
    }

    const weaponId = actor.system?.equipment?.[hand];
    const weapon   = weaponId ? actor.items.get(weaponId) : null;

    // Базовые параметры атаки
    // Для монстров — берём из combat профиля если нет экипированного оружия
    const isMonster  = actor.type === "monster";
    const npcAttack  = actor.system?.combat?.attacks?.[0]; // первая атака из профиля

    const baseParams = weapon ? {
      hand,
      skillKey:   weapon.system.skill,
      label:      weapon.name,
      damageType: weapon.system.damageType,
      baseDamage: Number(weapon.system.damage ?? 1),
      energyCost: Number(weapon.system.energyCost ?? 10),
      weapon,
    } : isMonster && npcAttack ? {
      hand,
      skillKey:   npcAttack.skillKey ?? "unarmed",
      label:      npcAttack.label    ?? actor.name,
      damageType: npcAttack.damageType ?? "physical",
      baseDamage: Number(npcAttack.damage ?? actor.system?.combat?.damage ?? 2),
      energyCost: Number(npcAttack.energyCost ?? 3),
      weapon:     null,
    } : {
      hand,
      skillKey:   "unarmed",
      label:      isMonster ? `Атака: ${actor.name}` : "Кулаки",
      damageType: "physical",
      baseDamage: Number(actor.system?.combat?.damage ?? actor.system?.combat?.unarmedDamage ?? 1),
      energyCost: isMonster ? 3 : 2,
      weapon:     null,
    };

    // Получаем цели из таргетов
    const targets = [...(game.user.targets ?? [])].map(t => t.actor).filter(Boolean);

    // Есть ли доступные приёмы или прицельный удар?
    const techniques = weapon ? getAvailableTechniques(actor, weapon) : [];
    const skillVal   = Number(actor.system?.skills?.[baseParams.skillKey]?.value ?? 0);
    const canAim     = skillVal >= 3;

    if (techniques.length > 0 || canAim) {
      // Показываем диалог выбора
      const choice = await IronHillsCombatTechniqueApp.choose(actor, weapon, targets);
      if (!choice) return; // отмена

      if (choice.type === "basic") {
        // Обычный удар
        await this._callPerformAttack(actor, baseParams);

      } else if (choice.type === "technique") {
        const tech = choice.technique;

        // AoE приём — используем MeasuredTemplate
        if (tech.effect.special === "aoe" && tech.effect.aoe) {
          const aoeStr  = tech.effect.aoe; // "melee_adjacent" | "ranged_3targets" | etc
          const isRanged = aoeStr.startsWith("ranged");
          const aoeType  = isRanged ? "circle" : "circle";
          const dist     = isRanged ? 4 : 1; // клетки
          await this._performAoeAttack(actor, {
            aoeType,
            distance:    dist,
            baseDamage:  Math.round(baseParams.baseDamage * (tech.effect.damage ?? 1)),
            energyCost:  baseParams.energyCost + (tech.energyCost ?? 0),
            skillKey:    baseParams.skillKey,
            label:       `${baseParams.label}: ${tech.label}`,
            damageType:  baseParams.damageType,
            ignoreArmor: tech.effect.ignoreArmor ?? 0,
          });
        } else {
          // Обычный одиночный приём
          await this._callPerformAttack(actor, {
            ...baseParams,
            label:       `${baseParams.label}: ${tech.label}`,
            baseDamage:  Math.round(baseParams.baseDamage * (tech.effect.damage ?? 1)),
            energyCost:  baseParams.energyCost + (tech.energyCost ?? 0),
            ignoreArmor: tech.effect.ignoreArmor ?? 0,
            technique:   tech,
            applyCondition: tech.effect.applyCondition ?? null,
            conditionDuration: tech.effect.conditionDuration ?? 0,
            conditionChance: tech.effect.conditionChance ?? 1.0,
          });
        }

      } else if (choice.type === "aimed") {
        // Прицельный удар
        const zone = choice.zone;
        const extraEnergy = 4; // прицеливание стоит доп. энергии
        await this._callPerformAttack(actor, {
          ...baseParams,
          label:       `${baseParams.label} → ${zone.label}`,
          baseDamage:  Math.round(baseParams.baseDamage * zone.damageMult),
          energyCost:  baseParams.energyCost + extraEnergy,
          hitBonus:    zone.hitMod,
          targetZone:  zone.key,
          aimed:       true,
        });
      }
    } else {
      // Нет приёмов — сразу обычный удар
      await this._callPerformAttack(actor, baseParams);
    }

    this._refreshHud({ keepOnTop: true });
  }

  async _useQuickSlot(slotKey) {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    await actor.sheet._useQuickSlot(slotKey);
    this._refreshHud({ keepOnTop: true });
  }

  async _continuePendingAction() {
    const actor = getHudActor();
    if (!actor?.sheet) return;

    const pending = getActorPendingAction(actor);
    if (!pending) {
      ui.notifications.warn("Нет длительного действия для продолжения.");
      return;
    }

    const result = continuePendingAction(actor);
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось продолжить действие.");
      return;
    }

    if (!result.done) {
      ui.notifications.info(
        `${actor.name} продолжает действие. Осталось ${Number(result.action?.remainingSeconds ?? 0)} сек.`
      );
      this._refreshHud({ keepOnTop: true });
      return;
    }

    if (typeof actor.sheet?._executePendingCombatAction === "function") {
      await actor.sheet._executePendingCombatAction(result.action);
    }

    this._refreshHud({ keepOnTop: true });
  }

  async _cancelPendingAction() {
    const actor = getHudActor();
    if (!actor) return;

    const result = cancelPendingAction(actor);
    if (!result?.ok) {
      ui.notifications.warn(result?.reason || "Не удалось отменить действие.");
      return;
    }

    ui.notifications.info(`${actor.name} отменяет длительное действие.`);
    this._refreshHud({ keepOnTop: true });
  }

async _endTurnForActor() {
  const actor = getHudActor();
  if (!actor) return;

  const result = endTurnForActor(actor);
  if (!result?.ok) {
    ui.notifications.warn(result?.reason || "Не удалось завершить ход.");
    return;
  }

  const advanceResult = await advanceTurnIfReady();
  if (!advanceResult?.ok) {
    ui.notifications.warn(advanceResult?.reason || "Ход завершён, но передача следующему участнику не выполнена.");
    this._refreshHud({ keepOnTop: true });
    return;
  }

  this._refreshHud({ keepOnTop: true });
}

// _endMyTurn удалён: дублировал _endTurnForActor, но без advanceTurnIfReady.
  // Все вызовы завершения хода идут через _endTurnForActor.

async _nextTurn() {
  if (!isCombatActive()) {
    ui.notifications.warn("Активного боя нет.");
    return;
  }

  const actor = getHudActor();

  if (actor && isActorActiveTurn(actor)) {
    await this._endTurnForActor();
    return;
  }

  if (game.user?.isGM) {
    const nextResult = await nextTurn();
    if (nextResult?.ok === false) {
      ui.notifications.warn(nextResult?.reason || "Не удалось передать ход.");
      return;
    }

    this._refreshHud({ keepOnTop: true });
    return;
  }

  ui.notifications.warn("Сейчас не ваш активный ход.");
}

  async _endCombat() {
    if (!isCombatActive()) {
      ui.notifications.warn("Активного боя нет.");
      return;
    }

    await endCombat();
    this._refreshHud({ keepOnTop: true });
  }

  async getData() {
    const actor = getHudActor();
    const state = getCombatUiState();
const current =
  (state.participants ?? [])[Math.max(0, Number(state.turn ?? 1) - 1)] ?? null;

    if (!actor) {
      return {
        hasActor: false,
        combatActive: isCombatActive(),
        compactMode: this._compactMode
      };
    }

    const hp = actor.system?.resources?.hp ?? {};
    const resources = actor.system?.resources ?? {};
    const quickSlots = actor.system?.quickSlots ?? {};
    const slotKeys = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6"];
    const actorUuid = getPersistentActorUuid(actor);
    const actorParticipant =
      (state.participants ?? []).find(participant => participant.actorUuid === actorUuid) ?? null;
    const actorSide = actorParticipant?.side ?? "neutral";
    const pendingAction = actorParticipant?.pendingAction ?? null;

    return {
      hasActor: true,
      compactMode: true,
      combatActive: isCombatActive(),
      actorName: actor.name,
      actorImg: actor.img,
      actorSide,
      actorSideClass: getParticipantSideClass(actorSide),
isCurrentTurn: Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
canEndTurn: Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
canContinuePendingAction:
  Boolean(actorParticipant?.pendingAction) &&
  Boolean(current && actorUuid && String(current.actorUuid ?? "") === String(actorUuid)),
      currentTurnName: current?.actorName || "—",
      secondsLeft: actorParticipant ? num(actorParticipant.remainingSeconds, 0) : null,
      isSkippingTurn: Boolean(
        actorParticipant &&
        Number(actorParticipant.remainingSeconds ?? 0) <= 0 &&
        !actorParticipant.pendingAction &&
        actorParticipant.hasActed
      ),

      energyValue: num(resources.energy?.value, 0),
      energyMax: num(resources.energy?.max, 0),
      manaValue: num(resources.mana?.value, 0),
      manaMax: num(resources.mana?.max, 0),
      satietyValue: num(resources.satiety?.value, 0),
      satietyMax: num(resources.satiety?.max, 0),
      hydrationValue: num(resources.hydration?.value, 0),
      hydrationMax: num(resources.hydration?.max, 0),
      energyPct: Math.round(getRatio(resources.energy?.value, resources.energy?.max) * 100),
      manaPct: Math.round(getRatio(resources.mana?.value, resources.mana?.max) * 100),
      satietyPct: Math.round(getRatio(resources.satiety?.value, resources.satiety?.max) * 100),
      hydrationPct: Math.round(getRatio(resources.hydration?.value, resources.hydration?.max) * 100),

      pendingAction,
      hasPendingAction: Boolean(pendingAction),
      pendingActionLabel: pendingAction?.label || "",
      pendingActionRemainingSeconds: Number(pendingAction?.remainingSeconds ?? 0),
      canCancelPendingAction: Boolean(pendingAction),

      zones: [
        { key: "head", label: "Голова", value: num(hp.head?.value, 0), max: num(hp.head?.max, 0), pct: Math.round(getRatio(hp.head?.value, hp.head?.max) * 100), cssClass: getZoneClass(hp.head?.value, hp.head?.max), trauma: getPartTrauma(hp.head), tooltip: buildZoneTooltip("Голова", num(hp.head?.value,0), num(hp.head?.max,0), getPartTrauma(hp.head)) },
        { key: "torso", label: "Торс", value: num(hp.torso?.value, 0), max: num(hp.torso?.max, 0), pct: Math.round(getRatio(hp.torso?.value, hp.torso?.max) * 100), cssClass: getZoneClass(hp.torso?.value, hp.torso?.max), trauma: getPartTrauma(hp.torso), tooltip: buildZoneTooltip("Торс", num(hp.torso?.value,0), num(hp.torso?.max,0), getPartTrauma(hp.torso)) },
        { key: "abdomen", label: "Живот", value: num(hp.abdomen?.value, 0), max: num(hp.abdomen?.max, 0), pct: Math.round(getRatio(hp.abdomen?.value, hp.abdomen?.max) * 100), cssClass: getZoneClass(hp.abdomen?.value, hp.abdomen?.max), trauma: getPartTrauma(hp.abdomen), tooltip: buildZoneTooltip("Живот", num(hp.abdomen?.value,0), num(hp.abdomen?.max,0), getPartTrauma(hp.abdomen)) },
        { key: "leftArm", label: "Л. рука", value: num(hp.leftArm?.value, 0), max: num(hp.leftArm?.max, 0), pct: Math.round(getRatio(hp.leftArm?.value, hp.leftArm?.max) * 100), cssClass: getZoneClass(hp.leftArm?.value, hp.leftArm?.max), trauma: getPartTrauma(hp.leftArm), tooltip: buildZoneTooltip("Л. рука", num(hp.leftArm?.value,0), num(hp.leftArm?.max,0), getPartTrauma(hp.leftArm)) },
        { key: "rightArm", label: "П. рука", value: num(hp.rightArm?.value, 0), max: num(hp.rightArm?.max, 0), pct: Math.round(getRatio(hp.rightArm?.value, hp.rightArm?.max) * 100), cssClass: getZoneClass(hp.rightArm?.value, hp.rightArm?.max), trauma: getPartTrauma(hp.rightArm), tooltip: buildZoneTooltip("П. рука", num(hp.rightArm?.value,0), num(hp.rightArm?.max,0), getPartTrauma(hp.rightArm)) },
        { key: "leftLeg", label: "Л. нога", value: num(hp.leftLeg?.value, 0), max: num(hp.leftLeg?.max, 0), pct: Math.round(getRatio(hp.leftLeg?.value, hp.leftLeg?.max) * 100), cssClass: getZoneClass(hp.leftLeg?.value, hp.leftLeg?.max), trauma: getPartTrauma(hp.leftLeg), tooltip: buildZoneTooltip("Л. нога", num(hp.leftLeg?.value,0), num(hp.leftLeg?.max,0), getPartTrauma(hp.leftLeg)) },
        { key: "rightLeg", label: "П. нога", value: num(hp.rightLeg?.value, 0), max: num(hp.rightLeg?.max, 0), pct: Math.round(getRatio(hp.rightLeg?.value, hp.rightLeg?.max) * 100), cssClass: getZoneClass(hp.rightLeg?.value, hp.rightLeg?.max), trauma: getPartTrauma(hp.rightLeg), tooltip: buildZoneTooltip("П. нога", num(hp.rightLeg?.value,0), num(hp.rightLeg?.max,0), getPartTrauma(hp.rightLeg)) }
      ],

      quickSlots: slotKeys.map(slotKey => {
        const itemId = quickSlots?.[slotKey];
        const item = itemId ? actor.items.get(itemId) : null;
        return {
          slotKey,
          short: slotKey.replace("slot", ""),
          itemName: item?.name || "—"
        };
      }),

      rightHandName: actor.system?.equipment?.rightHand
        ? (actor.items.get(actor.system.equipment.rightHand)?.name || "Кулаки")
        : "Кулаки",

      leftHandName: actor.system?.equipment?.leftHand
        ? (actor.items.get(actor.system.equipment.leftHand)?.name || "Кулаки")
        : "Кулаки",

      // Глобальные эффекты — показываются на портрете как иконки
      globalEffects: [
        { key: "stunned",  label: "Оглушение",   icon: "fa-dizzy",     color: "var(--ih-hp-warn)", active: num(actor.system?.conditions?.stunned, 0) > 0,                                                                            value: num(actor.system?.conditions?.stunned, 0) },
        { key: "poison",   label: "Яд",           icon: "fa-skull",     color: "var(--ih-food)",    active: num(actor.system?.conditions?.poison, 0) > 0,                                                                             value: num(actor.system?.conditions?.poison, 0) },
        { key: "burning",  label: "Горение",      icon: "fa-fire",      color: "var(--ih-hp-bad)",  active: num(actor.system?.conditions?.burning, 0) > 0,                                                                            value: num(actor.system?.conditions?.burning, 0) },
        { key: "shock",    label: "Шок",          icon: "fa-bolt",      color: "var(--ih-mana)",    active: num(actor.system?.conditions?.shock, 0) > 0,                                                                              value: num(actor.system?.conditions?.shock, 0) },
        { key: "bleeding", label: "Кровотечение", icon: "fa-droplet",   color: "var(--ih-hp-crit)", active: num(actor.system?.conditions?.bleeding, 0) > 0,                                                                           value: num(actor.system?.conditions?.bleeding, 0) },
        { key: "silence",  label: "Безмолвие",   icon: "fa-volume-xmark", color: "#a78bfa",         active: num(actor.system?.conditions?.silencedUntil, 0) > (game.time?.worldTime ?? 0),                                            value: "🔇" },
        { key: "slow",     label: "Замедление",  icon: "fa-person-walking", color: "#94a3b8",        active: num(actor.system?.conditions?.slowPenalty, 0) > 0,                                                                        value: num(actor.system?.conditions?.slowPenalty, 0) },
        { key: "feared",   label: "Страх",       icon: "fa-ghost",     color: "#c084fc",           active: num(actor.system?.conditions?.feared, 0) > 0,                                                                              value: num(actor.system?.conditions?.feared, 0) }
      ],
      hasGlobalEffects: [
        num(actor.system?.conditions?.stunned, 0) > 0,
        num(actor.system?.conditions?.poison, 0) > 0,
        num(actor.system?.conditions?.burning, 0) > 0,
        num(actor.system?.conditions?.shock, 0) > 0,
        num(actor.system?.conditions?.bleeding, 0) > 0,
        num(actor.system?.conditions?.silencedUntil, 0) > (game.time?.worldTime ?? 0),
        num(actor.system?.conditions?.slowPenalty, 0) > 0,
        num(actor.system?.conditions?.feared, 0) > 0
      ].some(Boolean),

      // Флаги для управления доступностью действий
      isGM: Boolean(game.user?.isGM),
      canActFreely: !isCombatActive(),
      canAttack: isCombatActive(),

      // Энергия — для кнопки «Перевести дух»
      energyCur:  Number(actor.system?.resources?.energy?.value ?? 0),
      energyMax:  Number(actor.system?.resources?.energy?.max   ?? 0),
      canBreathe: isCombatActive() &&
                  Number(actor.system?.resources?.energy?.value ?? 0) <
                  Number(actor.system?.resources?.energy?.max   ?? 0),
      manaCur:    Number(actor.system?.resources?.mana?.value ?? 0),
      manaMax:    Number(actor.system?.resources?.mana?.max   ?? 0),
      hasMana:    Number(actor.system?.resources?.mana?.max   ?? 0) > 0,
      rightHandEquipped: !!actor.system?.equipment?.rightHand,
      isSprinting: game.ironHills?._moveMode === "sprint",

      queue: (state.participants ?? []).map(participant => {
        const side = participant.side ?? "neutral";
        const isFriendly = actorSide !== "neutral" && isFriendlySide(actorSide, side);

        return {
          name: participant.actorName,
          secondsLeft: participant.remainingSeconds,
          initiative: participant.initiative,
          isCurrent: participant.id === state.activeParticipantId,
          sideClass: getParticipantSideClass(side),
          relationLabel: side === "neutral" ? "N" : (isFriendly ? "F" : "E")
        };
      })
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-attack-hand]").on("click", async event => {
      event.preventDefault();
      await this._attack(event.currentTarget.dataset.attackHand);
    });

    html.find("[data-continue-pending]").on("click", async event => {
      event.preventDefault();
      await this._continuePendingAction();
    });

    html.find("[data-cancel-pending]").on("click", async event => {
      event.preventDefault();
      await this._cancelPendingAction();
    });

    html.find("[data-breathe]").on("click", async event => {
      event.preventDefault();
      await this._breathe();
    });

    html.find("[data-toggle-sprint]").on("click", () => {
      const cur = game.ironHills?._moveMode ?? "walk";
      game.ironHills?.setMoveMode?.(cur === "sprint" ? "walk" : "sprint");
      this.render(false);
    });

    html.find("[data-cast-spell]").on("click", async event => {
      event.preventDefault();
      await this._castSpell();
    });

    html.find("[data-end-turn]").on("click", async event => {
      event.preventDefault();
      await this._endTurnForActor();
    });

    html.find("[data-quickslot]").on("click", async event => {
      event.preventDefault();
      await this._useQuickSlot(event.currentTarget.dataset.quickslot);
    });

    html.find("[data-next-turn]").on("click", async event => {
      event.preventDefault();
      await this._nextTurn();
    });

    html.find("[data-end-combat]").on("click", async event => {
      event.preventDefault();
      await this._endCombat();
    });

    html.find("[data-toggle-compact]").on("click", async event => {
      event.preventDefault();
      await this._toggleCompactMode();
    });

    window.setTimeout(() => this._applySizing(), 10);
  }
}