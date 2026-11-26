#!/usr/bin/env node
// 追加検証: カテゴリ×モデル のクロス集計 + カテゴリ別平均コスト/msg（本体+サブエージェント合算）
import fs from "fs";
import readline from "readline";
import { classifyCwd, costParts, listAllUsageFiles } from "./lib.mjs";

const cross = new Map();
const catTotals = new Map();

for (const { file } of listAllUsageFiles()) {
  const rl = readline.createInterface({ input: fs.createReadStream(file) });
  for await (const line of rl) {
    if (!line.trim()) continue;
    let o; try { o = JSON.parse(line); } catch { continue; }
    const u = o.message?.usage; if (!u) continue;
    const model = o.message.model || "unknown";
    if (model === "<synthetic>") continue;
    const cat = classifyCwd(o.cwd);
    const parts = costParts(u, model, o.timestamp);
    if (!parts) continue;
    const cost = parts.output + parts.input + parts.cache_read + parts.cache_write;
    const tokens = (u.output_tokens||0)+(u.input_tokens||0)+(u.cache_read_input_tokens||0)+(u.cache_creation_input_tokens||0);

    if (!cross.has(cat)) cross.set(cat, new Map());
    const modelMap = cross.get(cat);
    const e = modelMap.get(model) || { cost: 0, tokens: 0, msgs: 0 };
    e.cost += cost; e.tokens += tokens; e.msgs++;
    modelMap.set(model, e);

    const ct = catTotals.get(cat) || { cost: 0, tokens: 0, msgs: 0 };
    ct.cost += cost; ct.tokens += tokens; ct.msgs++;
    catTotals.set(cat, ct);
  }
}

console.log("=== カテゴリ別 平均コスト/msg・平均トークン/msg（本体+サブエージェント合算） ===");
for (const [cat, t] of [...catTotals.entries()].sort((a,b)=>b[1].cost-a[1].cost)) {
  console.log(`${cat}: avg_cost/msg=$${(t.cost/t.msgs).toFixed(4)}  avg_tokens/msg=${Math.round(t.tokens/t.msgs).toLocaleString()}  msgs=${t.msgs}  total=$${t.cost.toFixed(2)}`);
}

console.log("\n=== カテゴリ×モデル 内訳(msgs構成比%) ===");
for (const [cat, modelMap] of cross.entries()) {
  const total = catTotals.get(cat).msgs;
  const parts = [...modelMap.entries()].sort((a,b)=>b[1].msgs-a[1].msgs)
    .map(([m,e]) => `${m}=${(e.msgs/total*100).toFixed(0)}%($${e.cost.toFixed(0)})`).join(", ");
  console.log(`${cat}: ${parts}`);
}
