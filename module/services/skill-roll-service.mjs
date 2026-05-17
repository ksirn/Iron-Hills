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
      content: `<div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;padding:4px;text-align:center;">
        <div style="margin-bottom:8px;">
          <span style="font-size:32px;font-weight:700;color:#facc15;">${result}</span>
          <span style="color:#6a7d99;font-size:13px;"> на d${currentDie}</span>
        </div>
        <p style="color:#4ade80;font-weight:600;margin:4px 0;">Максимум! Можно рискнуть.</p>
        <p style="font-size:12px;margin:4px 0;">Перейти на <b style="color:#5b9cf6">d${nextDie}</b>?</p>
        <p style="font-size:11px;color:#6a7d99;margin:4px 0;">Отмена — зафиксировать <b>${result}</b></p>
      </div>`
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
      content: `<div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;padding:4px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="color:#6a7d99;font-size:12px;">Навык:</span>
          <b style="color:#5b9cf6;font-size:18px;">d${dieSize}</b>
        </div>
        ${hasThreshold ? `<div style="margin-bottom:10px;padding:6px 10px;background:rgba(91,156,246,0.08);border:1px solid rgba(91,156,246,0.2);border-radius:6px;font-size:12px;">
          Порог: <b style="color:#e8edf5">${threshold}</b>
        </div>` : ""}
        <p style="font-size:11px;color:#6a7d99;margin:0;">Выбери стратегию броска:</p>
      </div>`,
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

    let flavor = `<b>${label}</b> — ${display}`;
    if (isAnticrit) flavor += `<br><span style="color:#f87171">💀 АНТИКРИТ!</span>`;
    if (threshold !== null) {
      const hit = total >= threshold;
      flavor += `<br>${hit
        ? `<span style="color:#4ade80">✓ Успех (перевес: +${total - threshold})</span>`
        : `<span style="color:#f87171">✗ Провал</span>`}`;
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: flavor
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
          content: `<div style="font-family:'Segoe UI',sans-serif;color:#a8b8d0;padding:4px 0;">
            <div style="font-size:20px;font-weight:700;color:#e8edf5;text-align:center;margin-bottom:8px;">${display}</div>
            ${threshold !== null ? `<div style="text-align:center;margin-bottom:8px;color:${total >= threshold ? "#4ade80" : "#f87171"};">
              ${total >= threshold ? "✓ Успех!" : "✗ Провал"}
            </div>` : ""}
            <div style="font-size:11px;color:#6a7d99;text-align:center;">
              Перебросить: −${energyCostPerRoll} энергии (осталось: ${energy})
            </div>
          </div>`,
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

    let flavor = `<b>${label}</b> — попыток: ${attempts}, итог: <b>${finalTotal}</b>`;
    if (threshold !== null) {
      flavor += `<br>${finalTotal >= threshold
        ? `<span style="color:#4ade80">✓ Успех (перевес: +${finalTotal - threshold})</span>`
        : `<span style="color:#f87171">✗ Провал</span>`}`;
    }

    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: flavor });
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

    let flavor = `<b>${label}</b> — до порога ${threshold}`;
    flavor += `<br>Попыток: ${attempts}${exploded ? " 💥" : ""}, итог: <b>${total}</b>`;
    flavor += `<br>${success
      ? `<span style="color:#4ade80">✓ Успех! Перевес: +${margin}</span>`
      : `<span style="color:#f87171">✗ Провал после ${attempts} попыток</span>`}`;
    if (isAnticrit) flavor += `<br><span style="color:#f87171">💀 Антикрит на первом броске!</span>`;

    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: flavor });
    await applySkillExp?.(skillKey, label);
    return { total, strategy, success, margin };
  }

  return null;
}
