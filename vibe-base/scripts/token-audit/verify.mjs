#!/usr/bin/env node
// Step9 突合検証: audit.mjs とは別実装(readFileSync一括読み+split、かつ独立にsubagents/も再帰走査)で
// 現vibe-baseプロジェクトの日別outputを再計算し、audit.mjsが書き出した raw JSON(丸め前・厳密値)と ±1% で一致するか検証する。
// 2026-07-04 修正: (1) process.cwd()依存のパス解決バグ(自ディレクトリから実行するとENOENT)を REPO_ROOT 基準に修正
//               (2) レポート表示の丸め値("千tok")を逆算して比較していたため生じる偽FAILを、raw JSON(丸めなし)比較に修正
import fs from "fs";
import path from "path";
import { OUT_DIR, PROJECTS_DIR } from "./lib.mjs";

const vibeBaseDir = path.join(PROJECTS_DIR, "C--Users-user-Desktop-ClaudeCode-vibe-base");
const byDay = new Map();

function walk(dir) {
  const text_files = [];
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      const sub = path.join(p, "subagents");
      if (fs.existsSync(sub)) {
        for (const f of fs.readdirSync(sub)) {
          if (f.endsWith(".jsonl")) text_files.push(path.join(sub, f));
        }
      }
    } else if (entry.endsWith(".jsonl")) {
      text_files.push(p);
    }
  }
  return text_files;
}

for (const filePath of walk(vibeBaseDir)) {
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const u = o.message && o.message.usage;
    if (!u) continue;
    const day = o.timestamp ? o.timestamp.slice(0, 10) : "unknown";
    const cur = byDay.get(day) || 0;
    byDay.set(day, cur + (u.output_tokens || 0));
  }
}

const rawPath = path.join(OUT_DIR, "token-audit-raw.json");
if (!fs.existsSync(rawPath)) {
  console.log(`FAIL: ${rawPath} が存在しません。先に node audit.mjs を実行してください。`);
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));

let maxErrPct = 0, failDay = null, checked = 0;
for (const [day, entry] of Object.entries(raw)) {
  const reportedOut = entry.out;
  const recomputed = byDay.get(day) || 0;
  if (reportedOut === 0) continue;
  const errPct = Math.abs(recomputed - reportedOut) / reportedOut * 100;
  checked++;
  if (errPct > maxErrPct) { maxErrPct = errPct; failDay = day; }
  console.log(`${day}: raw=${reportedOut} recomputed=${recomputed} err=${errPct.toFixed(3)}%`);
}

console.log(`\n検証対象日数: ${checked}, 最大誤差: ${maxErrPct.toFixed(3)}% (${failDay})`);
if (maxErrPct <= 1.0) {
  console.log("PASS: 誤差 ±1% 以内");
  process.exit(0);
} else {
  console.log("FAIL: 誤差 ±1% 超過");
  process.exit(1);
}
