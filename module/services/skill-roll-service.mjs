import {
  buildCombatChatCard,
  escapeCombatHtml,
} from "./combat-chat-service.mjs";

export function getSkillDieSize(skillValue) {
  return Math.max(2, Number(skillValue ?? 1) * 2);
}

export function formatExplodingDiceRoll(result, fallbackDieSize = null) {
  const rolls = Array.isArray(result?.rolls) ? result.rolls : [];
  const total = Number(result?.total ?? 0);
  const dieSize = fallbackDieSize ?? Number(rolls[0]?.die ?? 2);

  if (result?.exploded && rolls.length) {
    return `💥 ${rolls.map(r => `d${r.die}=${r.result}`).join(" → ")}`;
  }

  return `d${dieSize} = ${total}`;
}

function normalizeDialogRows(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map(row => Array.isArray(row)
      ? { label: row[0], value: row[1], visible: row[2] }
      : row)
    .filter(row => row && row.visible !== false && row.label !== undefined);
}

export function buildSkillRollDialogContent({
  className = "",
  headline = "",
  headlineMeta = "",
  status = "",
  statusClass = "",
  rows = [],
  notes = [],
} = {}) {
  const rowHtml = normalizeDialogRows(rows)
    .map(row => `
      <div class="ih-skill-dialog-row ${escapeCombatHtml(row.className ?? "")}">
        <span>${escapeCombatHtml(row.label ?? "")}</span>
        <b>${escapeCombatHtml(row.value ?? "")}</b>
      </div>
    `)
    .join("");
  const noteHtml = normalizeDialogRows(notes)
    .map(row => `
      <div class="ih-skill-dialog-note ${escapeCombatHtml(row.className ?? "")}">
        <span>${escapeCombatHtml(row.label ?? "")}</span>
        <b>${escapeCombatHtml(row.value ?? "")}</b>
      </div>
    `)
    .join("");

  return `
    <div class="ih-skill-dialog ${escapeCombatHtml(className)}">
      ${headline ? `
        <div class="ih-skill-dialog-headline">
          <b>${escapeCombatHtml(headline)}</b>
          ${headlineMeta ? `<span>${escapeCombatHtml(headlineMeta)}</span>` : ""}
        </div>
      ` : ""}
      ${status ? `<div class="ih-skill-dialog-status ${escapeCombatHtml(statusClass)}">${escapeCombatHtml(status)}</div>` : ""}
      ${rowHtml ? `<div class="ih-skill-dialog-rows">${rowHtml}</div>` : ""}
      ${noteHtml ? `<div class="ih-skill-dialog-notes">${noteHtml}</div>` : ""}
    </div>
  `;
}

export async function rollExplodingDice(skillValue) {
  const rolls = [];
  let total = 0;
  let currentDie = getSkillDieSize(skillValue);
  let exploded = false;

  while (true) {
    const roll = await new Roll(`1d${currentDie}`).evaluate();
    const result = roll.total;
    rolls.push({ die: currentDie, result });
    total = result;

    if (result < currentDie) break;

    const nextDie = Math.min(currentDie + 2, 20);
    if (nextDie === currentDie) break;

    const confirmed = await Dialog.confirm({
      title: "💥 Взрыв куба!",
      content: buildSkillRollDialogContent({
        className: "ih-skill-dialog-explode",
        headline: result,
        headlineMeta: `на d${currentDie}`,
        status: "Максимум. Можно рискнуть.",
        statusClass: "is-good",
        rows: [
          ["Текущий куб", `d${currentDie}`],
          ["Следующий куб", `d${nextDie}`],
          ["Отмена", `зафиксировать ${result}`],
        ],
      }),
    });

    if (!confirmed) break;

    exploded = true;
    currentDie = nextDie;
  }

  return { total, rolls, exploded };
}

async function chooseSkillRollStrategy({ label, dieSize, threshold }) {
  return await new Promise(resolve => {
    const hasThreshold = threshold !== null;
    const dlg = new Dialog({
      title: `🎲 ${label}`,
      content: buildSkillRollDialogContent({
        className: "ih-skill-dialog-strategy",
        headline: label,
        headlineMeta: "выбор броска",
        status: "Выбери стратегию броска",
        rows: [
          ["Навык", `d${dieSize}`],
          ["Порог", threshold, hasThreshold],
        ],
      }),
      buttons: {
        simple: {
          label: "🎲 Один бросок",
          callback: () => resolve("simple")
        },
        reroll: {
          label: "🔄 До победного",
          callback: () => resolve("reroll")
        },
        ...(hasThreshold ? { target: {
          label: "🎯 До порога",
          callback: () => resolve("target")
        }} : {})
      },
      default: "simple",
      close: () => resolve(null)
    });
    dlg.render(true);
  });
}

export async function performUniversalSkillRoll(actor, skillKey, label, options = {}, {
  applySkillExp = null,
  dieRoller = rollExplodingDice,
} = {}) {
  const skill = actor?.system?.skills?.[skillKey];
  if (!skill) {
    ui.notifications.warn(`Навык ${skillKey} не найден`);
    return null;
  }

  const skillValue = Number(skill.value ?? 1);
  const dieSize = getSkillDieSize(skillValue);
  const threshold = options.threshold ?? null;
  const strategy = await chooseSkillRollStrategy({ label, dieSize, threshold });
  if (!strategy) return null;

  if (strategy === "simple") {
    const rollResult = await dieRoller(skillValue);
    const total = rollResult.total;
    const display = formatExplodingDiceRoll(rollResult, dieSize);
    const isAnticrit = total === 1 && dieSize > 2;
    const hit = threshold !== null ? total >= threshold : null;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildCombatChatCard({
        title: label,
        subtitle: actor.name,
        icon: isAnticrit ? "!" : "*",
        status: isAnticrit ? "Антикрит" : hit === null ? "Бросок" : hit ? "Успех" : "Провал",
        statusClass: isAnticrit || hit === false ? "is-danger" : hit === true ? "is-good" : "is-muted",
        rows: [
          ["Стратегия", "один бросок"],
          ["Куб", `d${dieSize}`],
          ["Бросок", display],
          ["Итог", total],
          ["Порог", threshold, threshold !== null],
          ["Перевес", total - threshold, threshold !== null],
        ],
        className: "ih-system-chat-card ih-skill-roll-chat-card",
      }),
    });
    await applySkillExp?.(skillKey, label);
    return { total, strategy, success: threshold !== null ? total >= threshold : null };
  }

  if (strategy === "reroll") {
    const energyCostPerRoll = options.energyCostPerReroll ?? 10;
    let attempts = 0;
    let finalTotal = 0;
    let satisfied = false;
    const maxAttempts = 10;

    while (!satisfied && attempts < maxAttempts) {
      attempts++;
      const rollResult = await dieRoller(skillValue);
      const total = rollResult.total;
      finalTotal = total;

      const display = formatExplodingDiceRoll(rollResult, dieSize);
      const energy = Number(actor.system.resources?.energy?.value ?? 0);
      const canAfford = energy >= energyCostPerRoll;

      const choice = await new Promise(resolve => {
        const dlg = new Dialog({
          title: `🔄 ${label} — попытка ${attempts}`,
          content: buildSkillRollDialogContent({
            className: "ih-skill-dialog-reroll",
            headline: display,
            headlineMeta: `попытка ${attempts}`,
            status: threshold !== null
              ? total >= threshold ? "Успех" : "Провал"
              : "Результат броска",
            statusClass: threshold !== null
              ? total >= threshold ? "is-good" : "is-danger"
              : "",
            rows: [
              ["Порог", threshold, threshold !== null],
              ["Итог", total],
              ["Энергия", `${energy}/${energyCostPerRoll}`],
              ["Переброс", canAfford ? `-${energyCostPerRoll}` : "недоступен"],
            ],
          }),
          buttons: {
            keep: { label: "✓ Оставить", callback: () => resolve("keep") },
            reroll: {
              label: canAfford ? `🔄 Перебросить (−${energyCostPerRoll}⚡)` : "⚡ Нет энергии",
              callback: () => resolve(canAfford ? "reroll_energy" : "keep")
            }
          },
          default: "keep",
          close: () => resolve("keep")
        });
        dlg.render(true);
      });

      if (choice === "keep") {
        satisfied = true;
        break;
      }

      if (choice === "reroll_energy") {
        const newEnergy = Math.max(0, Number(actor.system.resources?.energy?.value ?? 0) - energyCostPerRoll);
        await actor.update({ "system.resources.energy.value": newEnergy });
      } else if (choice === "reroll_mana") {
        const newMana = Math.max(0, Number(actor.system.resources?.mana?.value ?? 0) - energyCostPerRoll);
        await actor.update({ "system.resources.mana.value": newMana });
      }
    }

    const success = threshold !== null ? finalTotal >= threshold : null;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildCombatChatCard({
        title: label,
        subtitle: actor.name,
        icon: "*",
        status: success === null ? "Итог" : success ? "Успех" : "Провал",
        statusClass: success === false ? "is-danger" : success === true ? "is-good" : "is-muted",
        rows: [
          ["Стратегия", "до победного"],
          ["Попыток", attempts],
          ["Итог", finalTotal],
          ["Порог", threshold, threshold !== null],
          ["Перевес", finalTotal - threshold, threshold !== null],
        ],
        className: "ih-system-chat-card ih-skill-roll-chat-card ih-skill-reroll-card",
      }),
    });
    await applySkillExp?.(skillKey, label);
    return { total: finalTotal, strategy, success: threshold !== null ? finalTotal >= threshold : null };
  }

  if (strategy === "target" && threshold !== null) {
    let total = 0;
    let attempts = 0;
    let exploded = false;
    const maxAttempts = 20;

    while (total < threshold && attempts < maxAttempts) {
      attempts++;
      const result = await dieRoller(skillValue);
      total = result.total;
      if (result.exploded) exploded = true;
      if (total >= threshold) break;

      await new Promise(r => setTimeout(r, 100));
    }

    const success = total >= threshold;
    const margin = total - threshold;
    const isAnticrit = total === 1 && dieSize > 2 && attempts === 1;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: buildCombatChatCard({
        title: label,
        subtitle: actor.name,
        icon: isAnticrit ? "!" : "*",
        status: isAnticrit ? "Антикрит" : success ? "Успех" : "Провал",
        statusClass: isAnticrit || !success ? "is-danger" : "is-good",
        rows: [
          ["Стратегия", "до порога"],
          ["Порог", threshold],
          ["Попыток", attempts],
          ["Взрыв куба", exploded ? "да" : "нет"],
          ["Итог", total],
          ["Перевес", margin],
        ],
        className: "ih-system-chat-card ih-skill-roll-chat-card ih-skill-target-card",
      }),
    });
    await applySkillExp?.(skillKey, label);
    return { total, strategy, success, margin };
  }

  return null;
}
