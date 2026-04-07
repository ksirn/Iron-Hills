export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}