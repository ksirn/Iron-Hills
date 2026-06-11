function asElementList(root) {
  if (!root) return [];
  const ElementCtor = globalThis.Element;
  if (!ElementCtor) return [];
  if (root.jquery && typeof root.toArray === "function") return root.toArray();
  if (root instanceof ElementCtor) return [root];
  if (root[0] instanceof ElementCtor) return [root[0]];
  return [];
}

function getBoundElements(root, selector) {
  return asElementList(root).flatMap(element => {
    const matches = element.matches?.(selector) ? [element] : [];
    return matches.concat(Array.from(element.querySelectorAll?.(selector) ?? []));
  });
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.min(max, Math.max(min, number));
}

function safeColor(value) {
  const color = String(value ?? "").trim();
  if (!color) return "";
  if (/^#[0-9a-fA-F]{3,8}$/.test(color)) return color;
  if (/^var\(--[A-Za-z0-9_-]+\)$/.test(color)) return color;
  if (/^rgba?\([\d\s.,%]+\)$/.test(color)) return color;
  if (/^hsla?\([\d\s.,%]+\)$/.test(color)) return color;
  return "";
}

function setPct(element, attr, property) {
  if (!element.hasAttribute(attr)) return;
  const value = clampNumber(element.getAttribute(attr), 0, 100);
  if (value === null) return;
  element.style[property] = `${value}%`;
}

function setPx(element, attr, property) {
  if (!element.hasAttribute(attr)) return;
  const value = clampNumber(element.getAttribute(attr), 0, 5000);
  if (value === null) return;
  element.style[property] = `${value}px`;
}

function setColor(element, attr, property) {
  if (!element.hasAttribute(attr)) return;
  const color = safeColor(element.getAttribute(attr));
  if (!color) return;
  element.style[property] = color;
}

function setColorVar(element, attr, variableName) {
  if (!element.hasAttribute(attr)) return;
  const color = safeColor(element.getAttribute(attr));
  if (!color) return;
  element.style.setProperty(variableName, color);
}

export function applyDynamicStyleBindings(root) {
  const selector = [
    "[data-ih-style-width-pct]",
    "[data-ih-style-height-pct]",
    "[data-ih-style-margin-left-pct]",
    "[data-ih-style-left-px]",
    "[data-ih-style-top-px]",
    "[data-ih-style-width-px]",
    "[data-ih-style-height-px]",
    "[data-ih-style-min-height-px]",
    "[data-ih-style-color]",
    "[data-ih-style-background]",
    "[data-ih-style-border-color]",
    "[data-ih-style-quality-color]",
    "[data-ih-style-school-color]",
    "[data-ih-style-pack-color]",
  ].join(",");

  for (const element of getBoundElements(root, selector)) {
    setPct(element, "data-ih-style-width-pct", "width");
    setPct(element, "data-ih-style-height-pct", "height");
    setPct(element, "data-ih-style-margin-left-pct", "marginLeft");
    setPx(element, "data-ih-style-left-px", "left");
    setPx(element, "data-ih-style-top-px", "top");
    setPx(element, "data-ih-style-width-px", "width");
    setPx(element, "data-ih-style-height-px", "height");
    setPx(element, "data-ih-style-min-height-px", "minHeight");
    setColor(element, "data-ih-style-color", "color");
    setColor(element, "data-ih-style-background", "background");
    setColor(element, "data-ih-style-border-color", "borderColor");
    setColorVar(element, "data-ih-style-quality-color", "--quality-color");
    setColorVar(element, "data-ih-style-school-color", "--school-color");
    setColorVar(element, "data-ih-style-pack-color", "--pack-color");
  }
}
