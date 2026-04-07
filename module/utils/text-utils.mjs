export function getExpNext(level) {
  const progression = {
    1: 25,
    2: 35,
    3: 50,
    4: 70,
    5: 95,
    6: 125,
    7: 160,
    8: 200,
    9: 250
  };
  return progression[level] ?? null;
}

export function formatSignedNumber(value) {
  const n = Number(value ?? 0);
  return n >= 0 ? `+${n}` : `${n}`;
}

export function buildChatSectionRow(label, value) {
  return `<p><b>${label}:</b> ${value}</p>`;
}