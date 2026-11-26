#!/usr/bin/env node
// 戦略判断用の深掘り分析: (1)トークン種別別$内訳 (2)skill別$(プロセス儀式 vs 実作業 vs サブエージェント) (3)セッション長とcost/msgの相関
import fs from "fs";
import readline from "readline";
import { costParts, listAllUsageFiles } from "./lib.mjs";

const tokenTypeCost = { output: 0, input: 0, cache_read: 0, cache_write: 0 };
const bySkill = new Map();
const sessionAgg = new Map();

const REVIEW_SKILL_RE = /^(code-review|security-review|verify|fix-loop)/;
const PROCESS_SKILLS = new Set(["checkout", "pc-checkin", "plan-finalize", "plan", "plan-template", "update-config"]);

for (const { file, isSubagent, agentType } of listAllUsageFiles()) {
  const rl = readline.createInterface({ input: fs.createReadStream(file) });
  let currentSkill = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    let o; try { o = JSON.parse(line); } catch { continue; }

    const content = o.message?.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block.type === "tool_use" && block.name === "Skill") {
          const s = block.input?.skill || block.input?.args || "unknown";
          currentSkill = typeof s === "string" ? s : JSON.stringify(s);
        }
      }
    }

    const u = o.message?.usage; if (!u) continue;
    const model = o.message.model || "unknown";
    if (model === "<synthetic>") continue;
    const parts = costParts(u, model, o.timestamp);
    if (!parts) continue;
    const totalCost = parts.output + parts.input + parts.cache_read + parts.cache_write;

    tokenTypeCost.output += parts.output;
    tokenTypeCost.input += parts.input;
    tokenTypeCost.cache_read += parts.cache_read;
    tokenTypeCost.cache_write += parts.cache_write;

    const skillLabel = isSubagent
      ? `subagent:${agentType || o.attributionAgent || "unknown"}`
      : (o.attributionSkill || currentSkill || "(none/直接会話)");
    const se = bySkill.get(skillLabel) || { cost: 0, msgs: 0, sessions: new Set() };
    se.cost += totalCost; se.msgs++; se.sessions.add(o.sessionId);
    bySkill.set(skillLabel, se);

    if (!isSubagent) {
      const sid = o.sessionId || "unknown";
      const sess = sessionAgg.get(sid) || { cost: 0, msgs: 0 };
      sess.cost += totalCost; sess.msgs++;
      sessionAgg.set(sid, sess);
    }
  }
}

const totalCost = Object.values(tokenTypeCost).reduce((a, b) => a + b, 0);
console.log("=== トークン種別別 $ 内訳(全体・本体+サブエージェント合算) ===");
for (const [k, v] of Object.entries(tokenTypeCost)) {
  console.log(`${k}: $${v.toFixed(2)} (${(v/totalCost*100).toFixed(1)}%)`);
}
console.log(`total: $${totalCost.toFixed(2)}`);

console.log("\n=== プロセス儀式 vs 実作業 vs サブエージェント vs 直接会話 ===");
let processCost = 0, reviewCost = 0, workCost = 0, noneCost = 0, subagentCost = 0;
for (const [skill, e] of bySkill.entries()) {
  if (skill.startsWith("subagent:")) subagentCost += e.cost;
  else if (PROCESS_SKILLS.has(skill)) processCost += e.cost;
  else if (REVIEW_SKILL_RE.test(skill)) reviewCost += e.cost;
  else if (skill === "(none/直接会話)") noneCost += e.cost;
  else workCost += e.cost;
}
console.log(`プロセス儀式(checkout/pc-checkin/plan-finalize/plan/update-config): $${processCost.toFixed(2)} (${(processCost/totalCost*100).toFixed(1)}%)`);
console.log(`検証系(code-review/security-review/verify/fix-loop): $${reviewCost.toFixed(2)} (${(reviewCost/totalCost*100).toFixed(1)}%)`);
console.log(`実作業スキル(その他Skill発火): $${workCost.toFixed(2)} (${(workCost/totalCost*100).toFixed(1)}%)`);
console.log(`直接会話(スキル未発火・本体): $${noneCost.toFixed(2)} (${(noneCost/totalCost*100).toFixed(1)}%)`);
console.log(`サブエージェント(全種合算・訂正で新規計上): $${subagentCost.toFixed(2)} (${(subagentCost/totalCost*100).toFixed(1)}%)`);

console.log("\n=== skill別トップ20(セッション数も) ===");
for (const [skill, e] of [...bySkill.entries()].sort((a,b)=>b[1].cost-a[1].cost).slice(0,20)) {
  console.log(`${skill}: $${e.cost.toFixed(2)}  msgs=${e.msgs}  sessions=${e.sessions.size}  avg$/session=${(e.cost/e.sessions.size).toFixed(2)}`);
}

console.log("\n=== セッション長バケット別 avg cost/msg(本体セッションのみ・サブエージェント分は別枠のため除外) ===");
const buckets = [[0,50],[50,200],[200,500],[500,1000],[1000,Infinity]];
const bucketAgg = buckets.map(() => ({cost:0, msgs:0, sessions:0}));
for (const [, sess] of sessionAgg.entries()) {
  const idx = buckets.findIndex(([lo,hi]) => sess.msgs >= lo && sess.msgs < hi);
  if (idx < 0) continue;
  bucketAgg[idx].cost += sess.cost;
  bucketAgg[idx].msgs += sess.msgs;
  bucketAgg[idx].sessions++;
}
buckets.forEach(([lo,hi], i) => {
  const b = bucketAgg[i];
  if (b.msgs === 0) return;
  console.log(`msgs ${lo}-${hi === Infinity ? "+" : hi}: sessions=${b.sessions}  total_msgs=${b.msgs}  avg_cost/msg=$${(b.cost/b.msgs).toFixed(4)}  total_cost=$${b.cost.toFixed(2)}`);
});
