function compactClassName(value = "") {
  return String(value ?? "")
    .split(/\s+/)
    .map(part => part.trim())
    .filter(Boolean)
    .join(" ");
}

export function escapeCombatHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeRows(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map(row => Array.isArray(row)
      ? { label: row[0], value: row[1], visible: row[2] }
      : row)
    .filter(row => row && row.visible !== false && row.label !== undefined);
}

function normalizeBadges(badges = []) {
  return (Array.isArray(badges) ? badges : [])
    .map(badge => typeof badge === "string" ? { label: badge } : badge)
    .filter(badge => badge && badge.visible !== false && badge.label !== undefined);
}

function getRowValueHtml(row = {}) {
  if (row.valueHtml !== undefined) return String(row.valueHtml ?? "");
  if (row.html) return String(row.value ?? "");
  return escapeCombatHtml(row.value ?? "");
}

export function buildCombatRows(rows = [], { className = "" } = {}) {
  const normalized = normalizeRows(rows);
  if (!normalized.length) return "";

  const classes = compactClassName(`ih-combat-row-grid ${className}`);
  const rowHtml = normalized
    .map(row => {
      const rowClasses = compactClassName(`ih-combat-row ${row.className ?? ""}`);
      const labelHtml = row.labelHtml !== undefined
        ? String(row.labelHtml ?? "")
        : escapeCombatHtml(row.label ?? "");
      return `
        <div class="${rowClasses}">
          <span>${labelHtml}</span>
          <b>${getRowValueHtml(row)}</b>
        </div>
      `;
    })
    .join("");

  return `<div class="${classes}">${rowHtml}</div>`;
}

export function buildCombatBadges(badges = [], { className = "" } = {}) {
  const normalized = normalizeBadges(badges);
  if (!normalized.length) return "";

  const classes = compactClassName(`ih-combat-badges ${className}`);
  const badgeHtml = normalized
    .map(badge => {
      const badgeClasses = compactClassName(`ih-combat-badge ${badge.className ?? ""}`);
      const labelHtml = badge.labelHtml !== undefined
        ? String(badge.labelHtml ?? "")
        : escapeCombatHtml(badge.label ?? "");
      return `<span class="${badgeClasses}">${labelHtml}</span>`;
    })
    .join("");

  return `<div class="${classes}">${badgeHtml}</div>`;
}

export function buildCombatNotices(notices = [], { className = "" } = {}) {
  const normalized = normalizeRows(notices);
  if (!normalized.length) return "";

  const classes = compactClassName(`ih-combat-notices ${className}`);
  const noticeHtml = normalized
    .map(notice => {
      const noticeClasses = compactClassName(`ih-combat-notice ${notice.className ?? ""}`);
      const labelHtml = notice.labelHtml !== undefined
        ? String(notice.labelHtml ?? "")
        : escapeCombatHtml(notice.label ?? "");
      return `
        <div class="${noticeClasses}">
          <span>${labelHtml}</span>
          <b>${getRowValueHtml(notice)}</b>
        </div>
      `;
    })
    .join("");

  return `<div class="${classes}">${noticeHtml}</div>`;
}

export function joinCombatHtml(...fragments) {
  return fragments
    .flat()
    .filter(fragment => fragment !== undefined && fragment !== null && fragment !== false)
    .map(fragment => String(fragment).trim())
    .filter(Boolean)
    .join("");
}

export function buildCombatParagraphs(lines = [], { className = "" } = {}) {
  const parts = (Array.isArray(lines) ? lines : [lines])
    .map(line => {
      if (line && typeof line === "object") return line;
      return { value: line };
    })
    .filter(line => line && line.visible !== false && line.value !== undefined && line.value !== null && line.value !== "");

  if (!parts.length) return "";

  return parts
    .map(line => {
      const classes = compactClassName(`${className} ${line.className ?? ""}`);
      const classAttr = classes ? ` class="${classes}"` : "";
      const html = line.html ? String(line.value ?? "") : escapeCombatHtml(line.value ?? "");
      return `<p${classAttr}>${html}</p>`;
    })
    .join("");
}

function buildSystemDialogRows(rows = [], className = "") {
  const normalized = normalizeRows(rows);
  if (!normalized.length) return "";

  const rowHtml = normalized
    .map(row => {
      const rowClasses = compactClassName(`ih-system-dialog-row ${row.className ?? ""}`);
      const labelHtml = row.labelHtml !== undefined
        ? String(row.labelHtml ?? "")
        : escapeCombatHtml(row.label ?? "");
      return `
        <div class="${rowClasses}">
          <span>${labelHtml}</span>
          <b>${getRowValueHtml(row)}</b>
        </div>
      `;
    })
    .join("");

  return `<div class="${compactClassName(`ih-system-dialog-rows ${className}`)}">${rowHtml}</div>`;
}

function buildSystemDialogNotes(notes = [], className = "") {
  const normalized = normalizeRows(notes);
  if (!normalized.length) return "";

  const noteHtml = normalized
    .map(note => {
      const noteClasses = compactClassName(`ih-system-dialog-note ${note.className ?? ""}`);
      const labelHtml = note.labelHtml !== undefined
        ? String(note.labelHtml ?? "")
        : escapeCombatHtml(note.label ?? "");
      return `
        <div class="${noteClasses}">
          <span>${labelHtml}</span>
          <b>${getRowValueHtml(note)}</b>
        </div>
      `;
    })
    .join("");

  return `<div class="${compactClassName(`ih-system-dialog-notes ${className}`)}">${noteHtml}</div>`;
}

export function buildSystemSelectOptions(options = [], selectedValue = "") {
  return (Array.isArray(options) ? options : [])
    .map(option => {
      const entry = typeof option === "string" ? { value: option, label: option } : option;
      if (!entry || entry.visible === false) return "";
      const value = entry.value ?? entry.key ?? "";
      const label = entry.label ?? value;
      const selected = String(value) === String(selectedValue) ? " selected" : "";
      const disabled = entry.disabled ? " disabled" : "";
      return `<option value="${escapeCombatHtml(value)}"${selected}${disabled}>${escapeCombatHtml(label)}</option>`;
    })
    .join("");
}

export function buildSystemDialogSelectField({
  name = "value",
  label = "",
  options = [],
  selectedValue = "",
  className = "",
} = {}) {
  const fieldClasses = compactClassName(`ih-system-dialog-field ${className}`);
  const safeName = escapeCombatHtml(name);
  return `
    <div class="${fieldClasses}">
      ${label ? `<label>${escapeCombatHtml(label)}</label>` : ""}
      <select name="${safeName}">${buildSystemSelectOptions(options, selectedValue)}</select>
    </div>
  `;
}

export function buildSystemDialogSelect(options = {}) {
  return buildSystemDialogForm(buildSystemDialogSelectField(options));
}

export function buildSystemDialogInput({
  id = "",
  name = "",
  type = "text",
  label = "",
  value = "",
  placeholder = "",
  min = null,
  max = null,
  step = null,
  className = "",
} = {}) {
  const fieldClasses = compactClassName(`ih-system-dialog-field ${className}`);
  const attrs = [
    id ? `id="${escapeCombatHtml(id)}"` : "",
    name ? `name="${escapeCombatHtml(name)}"` : "",
    `type="${escapeCombatHtml(type)}"`,
    value !== null && value !== undefined ? `value="${escapeCombatHtml(value)}"` : "",
    placeholder ? `placeholder="${escapeCombatHtml(placeholder)}"` : "",
    min !== null && min !== undefined ? `min="${escapeCombatHtml(min)}"` : "",
    max !== null && max !== undefined ? `max="${escapeCombatHtml(max)}"` : "",
    step !== null && step !== undefined ? `step="${escapeCombatHtml(step)}"` : "",
  ].filter(Boolean).join(" ");

  return `
    <div class="${fieldClasses}">
      ${label ? `<label>${escapeCombatHtml(label)}</label>` : ""}
      <input ${attrs}>
    </div>
  `;
}

export function buildSystemDialogForm(fieldsHtml = [], { className = "" } = {}) {
  const fields = (Array.isArray(fieldsHtml) ? fieldsHtml : [fieldsHtml])
    .map(field => String(field ?? "").trim())
    .filter(Boolean)
    .join("");
  if (!fields) return "";
  return `<form class="${compactClassName(`ih-system-dialog-form ${className}`)}">${fields}</form>`;
}

export function buildSystemDialogContent({
  className = "",
  headline = "",
  headlineMeta = "",
  status = "",
  statusClass = "",
  rows = [],
  notes = [],
  bodyHtml = "",
  formHtml = "",
} = {}) {
  const classes = compactClassName(`ih-system-dialog ${className}`);
  const headlineHtml = headline || headlineMeta ? `
    <div class="ih-system-dialog-headline">
      ${headline ? `<b>${escapeCombatHtml(headline)}</b>` : ""}
      ${headlineMeta ? `<span>${escapeCombatHtml(headlineMeta)}</span>` : ""}
    </div>
  ` : "";
  const statusHtml = status ? `
    <div class="${compactClassName(`ih-system-dialog-status ${statusClass}`)}">${escapeCombatHtml(status)}</div>
  ` : "";

  return `<div class="${classes}">${joinCombatHtml(
    headlineHtml,
    statusHtml,
    buildSystemDialogRows(rows),
    bodyHtml,
    buildSystemDialogNotes(notes),
    formHtml,
  )}</div>`;
}

export function buildCombatChatCard({
  title = "",
  subtitle = "",
  icon = "",
  status = "",
  statusClass = "",
  badges = [],
  rows = [],
  notices = [],
  bodyHtml = "",
  footerHtml = "",
  className = "",
} = {}) {
  const classes = compactClassName(`ih-chat-card ih-combat-chat-card ${className}`);
  const hasHead = title || subtitle || icon || status;
  const headHtml = hasHead ? `
    <div class="ih-combat-chat-head">
      <div class="ih-combat-chat-title">
        ${icon ? `<span class="ih-combat-chat-icon">${escapeCombatHtml(icon)}</span>` : ""}
        <span>
          ${title ? `<b>${escapeCombatHtml(title)}</b>` : ""}
          ${subtitle ? `<small>${escapeCombatHtml(subtitle)}</small>` : ""}
        </span>
      </div>
      ${status ? `<span class="${compactClassName(`ih-combat-status ${statusClass}`)}">${escapeCombatHtml(status)}</span>` : ""}
    </div>
  ` : "";

  const contentHtml = joinCombatHtml(
    headHtml,
    buildCombatBadges(badges),
    buildCombatRows(rows),
    bodyHtml ? `<div class="ih-combat-body">${bodyHtml}</div>` : "",
    buildCombatNotices(notices),
    footerHtml ? `<div class="ih-combat-footer">${footerHtml}</div>` : "",
  );

  return `<div class="${classes}">${contentHtml}</div>`;
}

export async function createCombatChatMessage({
  actor = null,
  speaker = null,
  title = "",
  subtitle = "",
  icon = "",
  status = "",
  statusClass = "",
  badges = [],
  rows = [],
  notices = [],
  bodyHtml = "",
  footerHtml = "",
  className = "",
  content = null,
} = {}) {
  const resolvedContent = content ?? buildCombatChatCard({
    title,
    subtitle,
    icon,
    status,
    statusClass,
    badges,
    rows,
    notices,
    bodyHtml,
    footerHtml,
    className,
  });

  if (!globalThis.ChatMessage?.create) {
    return {
      ok: false,
      skipped: true,
      reason: "chat-unavailable",
      content: resolvedContent,
    };
  }

  return globalThis.ChatMessage.create({
    speaker: speaker ?? (actor && globalThis.ChatMessage?.getSpeaker
      ? globalThis.ChatMessage.getSpeaker({ actor })
      : undefined),
    content: resolvedContent,
  });
}
