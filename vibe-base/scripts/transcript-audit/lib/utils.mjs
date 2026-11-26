import fs from 'node:fs';

export function asciiSafe(str) {
  const s = String(str);
  const bs = String.fromCharCode(92);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code > 127) {
      out += bs + 'u' + code.toString(16).padStart(4, '0');
    } else {
      out += s.charAt(i);
    }
  }
  return out;
}

export function log(msg) {
  process.stdout.write(asciiSafe(msg) + String.fromCharCode(10));
}

export function warn(msg) {
  process.stderr.write(asciiSafe(msg) + String.fromCharCode(10));
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function median(arr) {
  if (!arr || arr.length === 0) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function mode(arr) {
  if (!arr || arr.length === 0) return null;
  const freq = new Map();
  let best = null;
  let bestCount = -1;
  for (const v of arr) {
    const c = (freq.get(v) || 0) + 1;
    freq.set(v, c);
    if (c > bestCount || (c === bestCount && (best === null || v < best))) {
      bestCount = c;
      best = v;
    }
  }
  return best;
}

export function bump(map, key) {
  map[key] = (map[key] || 0) + 1;
}

export function bumpNested(map, outerKey, innerKey) {
  if (!map[outerKey]) map[outerKey] = {};
  map[outerKey][innerKey] = (map[outerKey][innerKey] || 0) + 1;
}

export function finalizeFreqMap(freqMap) {
  const values = Object.values(freqMap);
  return {
    freq: freqMap,
    counts_median: median(values),
    counts_mode: mode(values),
  };
}

export function numOr0(v) {
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0;
}

export function statsOf(arr) {
  return {
    raw: arr,
    sum: arr.reduce((a, b) => a + b, 0),
    median: median(arr),
    mode: mode(arr),
    count: arr.length,
  };
}
