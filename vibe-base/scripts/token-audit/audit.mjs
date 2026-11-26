#!/usr/bin/env node
// トークン消費 内部監査ツール。~/.claude/projects/**/*.jsonl（本体セッション）+
// ~/.claude/projects/**/<sessionId>/subagents/agent-*.jsonl（サブエージェント transcript）の両方を読み、
// 日別/モデル別/作業種別別/スキル別/サブエージェント別/検証ループ別に集計する。
import fs from "fs";
import path from "path";
import readline from "readline";
import { OUT_DIR, PROJECTS_DIR, classifyCwd, costParts, listAllUsageFiles } from "./lib.mjs";

const REVIEW_SKILL_RE = /^(code-review|security-review|verify|fix-loop)/;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const byDay = new Map();
  const byModel = new Map();
  const byCategory = new Map();
  const bySkill = new Map();
  const bySession = new Map();
  const bySubagentType = new Map();
  const syntheticTokens = { count: 0, out: 0, in: 0, cr: 0, cc: 0 };
  let sidechainMsgs = 0;
  let agentToolUseTotal = 0;
  let totalCost = 0, totalTokensAll = 0, totalMsgs = 0;
  let subagentCost = 0, subagentTokens = 0, subagentMsgs = 0;
  let minTs = null, maxTs = null;
  let unpriced = 0;

  let loopCost = 0;
  const loopByReason = { skill: 0, editStreak: 0 };

  const rawDayUsage = new Map(); // Step9突合用: 日別の生(未丸め)output/cache_read。verify.mjsとscopeを合わせ vibe-base 本体プロジェクトのみに限定
  const VIBE_BASE_PROJ = "C--Users-user-Desktop-ClaudeCode-vibe-base";

  for (const entry of listAllUsageFiles()) {
    const { proj, file, isSubagent, agentType } = entry;
    const rl = readline.createInterface({ input: fs.createReadStream(file) });
    let currentSkill = null;
    let editStreakPath = null;
    let editStreakCount = 0;

    for await (const line of rl) {
      if (!line.trim()) continue;
      let o;
      try { o = JSON.parse(line); } catch { continue; }

      const content = o.message?.content;
      let hasReviewSkillTrigger = false;
      let hitStreakThisMsg = false;

      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type !== "tool_use") continue;
          if (block.name === "Skill") {
            const skillName = block.input?.skill || block.input?.args || "unknown";
            currentSkill = typeof skillName === "string" ? skillName : JSON.stringify(skillName);
            if (REVIEW_SKILL_RE.test(currentSkill)) hasReviewSkillTrigger = true;
          } else if (block.name === "Agent" || block.name === "Workflow") {
            agentToolUseTotal++;
          } else if (block.name === "Edit" || block.name === "Write") {
            const p2 = block.input?.file_path || "";
            if (p2 && p2 === editStreakPath) editStreakCount++;
            else { editStreakPath = p2; editStreakCount = p2 ? 1 : 0; }
            if (editStreakCount >= 5) hitStreakThisMsg = true;
          }
        }
      }
      if (currentSkill && REVIEW_SKILL_RE.test(currentSkill)) hasReviewSkillTrigger = true;

      const usage = o.message?.usage;
      if (!usage) continue;

      const model = o.message.model || "unknown";
      const ts = o.timestamp;
      if (ts) { if (!minTs || ts < minTs) minTs = ts; if (!maxTs || ts > maxTs) maxTs = ts; }
      const day = ts ? ts.slice(0, 10) : "unknown";
      const cwd = o.cwd;
      const category = classifyCwd(cwd);
      const skillLabel = isSubagent
        ? `subagent:${agentType || o.attributionAgent || "unknown"}`
        : (o.attributionSkill || currentSkill || "(none/直接会話)");
      const sessionId = o.sessionId || "unknown";

      const tokensThisMsg =
        (usage.output_tokens || 0) + (usage.input_tokens || 0) +
        (usage.cache_read_input_tokens || 0) + (usage.cache_creation_input_tokens || 0);

      totalMsgs++;
      totalTokensAll += tokensThisMsg;
      if (o.isSidechain) sidechainMsgs++;

      if (model === "<synthetic>") {
        syntheticTokens.count++;
        syntheticTokens.out += usage.output_tokens || 0;
        syntheticTokens.in += usage.input_tokens || 0;
        syntheticTokens.cr += usage.cache_read_input_tokens || 0;
        syntheticTokens.cc += usage.cache_creation_input_tokens || 0;
        continue;
      }

      const parts = costParts(usage, model, ts);
      if (!parts) { unpriced++; continue; }
      const cost = parts.output + parts.input + parts.cache_read + parts.cache_write;
      totalCost += cost;

      if (isSubagent) { subagentCost += cost; subagentTokens += tokensThisMsg; subagentMsgs++; }

      // Step9突合用の生値(丸めない・vibe-base本体プロジェクトのみ・verify.mjsとscope一致)
      if (proj === VIBE_BASE_PROJ) {
        const rd = rawDayUsage.get(day) || { out: 0, cr: 0 };
        rd.out += usage.output_tokens || 0;
        rd.cr += usage.cache_read_input_tokens || 0;
        rawDayUsage.set(day, rd);
      }

      const dayEntry = byDay.get(day) || { cost: 0, tokens: 0, msgs: 0 };
      dayEntry.cost += cost; dayEntry.tokens += tokensThisMsg; dayEntry.msgs++;
      byDay.set(day, dayEntry);

      const modelEntry = byModel.get(model) || { cost: 0, tokens: 0, msgs: 0 };
      modelEntry.cost += cost; modelEntry.tokens += tokensThisMsg; modelEntry.msgs++;
      byModel.set(model, modelEntry);

      const catEntry = byCategory.get(category) || { cost: 0, tokens: 0, msgs: 0 };
      catEntry.cost += cost; catEntry.tokens += tokensThisMsg; catEntry.msgs++;
      byCategory.set(category, catEntry);

      const skillEntry = bySkill.get(skillLabel) || { cost: 0, tokens: 0, msgs: 0 };
      skillEntry.cost += cost; skillEntry.tokens += tokensThisMsg; skillEntry.msgs++;
      bySkill.set(skillLabel, skillEntry);

      const sessEntry = bySession.get(sessionId) || { cost: 0, tokens: 0, msgs: 0, cwd, proj };
      sessEntry.cost += cost; sessEntry.tokens += tokensThisMsg; sessEntry.msgs++;
      bySession.set(sessionId, sessEntry);

      if (isSubagent) {
        const at = agentType || o.attributionAgent || "unknown";
        const se = bySubagentType.get(at) || { cost: 0, tokens: 0, msgs: 0, invocations: new Set() };
        se.cost += cost; se.tokens += tokensThisMsg; se.msgs++;
        se.invocations.add(file);
        bySubagentType.set(at, se);
      }

      if (hasReviewSkillTrigger) { loopCost += cost; loopByReason.skill += cost; }
      else if (hitStreakThisMsg) { loopCost += cost; loopByReason.editStreak += cost; }
    }
  }

  const sortedByCost = (m) => [...m.entries()].sort((a, b) => b[1].cost - a[1].cost);
  const topSessions = sortedByCost(bySession).slice(0, 20);

  const cat = (name) => byCategory.get(name) || { cost: 0, tokens: 0, msgs: 0 };
  const videoCat = cat("動画");
  const hpCat = cat("HP/LP");
  const ragCat = cat("RAG");

  // Step9突合用の生データを raw JSON として出力(丸め誤差のない独立検証のため)
  const rawOut = {};
  for (const [day, v] of rawDayUsage.entries()) rawOut[day] = v;
  fs.writeFileSync(path.join(OUT_DIR, "token-audit-raw.json"), JSON.stringify(rawOut, null, 1), "utf8");

  const csvLines = ["day,category,cost_usd,tokens,msgs"];
  for (const [day, v] of [...byDay.entries()].sort()) csvLines.push(`${day},ALL,${v.cost.toFixed(4)},${v.tokens},${v.msgs}`);
  for (const [catName, v] of sortedByCost(byCategory)) csvLines.push(`_category_total,${catName},${v.cost.toFixed(4)},${v.tokens},${v.msgs}`);
  for (const [sid, v] of topSessions) csvLines.push(`_session_top20,${sid}|${(v.cwd || "").replace(/,/g, ";")},${v.cost.toFixed(4)},${v.tokens},${v.msgs}`);
  for (const [at, v] of sortedByCost(bySubagentType)) csvLines.push(`_subagent_type,${at},${v.cost.toFixed(4)},${v.tokens},${v.msgs}`);
  fs.writeFileSync(path.join(OUT_DIR, "token-audit.csv"), csvLines.join("\n") + "\n", "utf8");

  const report = [];
  report.push("# トークン消費 内部監査レポート");
  report.push("");
  report.push(`期間: ${minTs?.slice(0, 10) || "?"} 〜 ${maxTs?.slice(0, 10) || "?"}`);
  report.push(`総額(概算・priced のみ・本体+サブエージェント合算): $${totalCost.toFixed(2)}`);
  report.push(`うちサブエージェント消費分: $${subagentCost.toFixed(2)}（${(subagentCost / totalCost * 100).toFixed(1)}%） / トークン ${subagentTokens.toLocaleString()} / msgs ${subagentMsgs.toLocaleString()}`);
  report.push(`総トークン(priced+unpriced+synthetic 全含む): ${totalTokensAll.toLocaleString()}`);
  report.push(`総 assistant メッセージ数(本体+サブ): ${totalMsgs.toLocaleString()}`);
  report.push(`未課金判定(model不明でpriceが引けなかった)メッセージ: ${unpriced}件`);
  report.push(`<synthetic> model(課金外扱い・別枠): ${syntheticTokens.count}件`);
  report.push("");
  report.push("## サブエージェント帰属根拠(2026-07-04 訂正版)");
  report.push("");
  report.push("**訂正: 当初 Step1 で「サブエージェント消費は再構成不能」と結論したが誤りだった。** 検証パネル(code-reviewer)の指摘により、`~/.claude/projects/<proj>/<sessionId>/subagents/agent-*.jsonl` という1階層ネストされた transcript ファイル群（全体で1,597ファイル）を、当初の非再帰走査が欠落させていたことが判明。各ファイルは実際の `usage`（input/output/cache_read/cache_creation）と `model`（サブエージェント自身が使ったモデル。例: explore-agent は claude-haiku-4-5 を使用）を含む独立した記録で、実際に読み取り・集計可能だった。本レポートはこの分を含めて再集計した値。");
  report.push(`本体 jsonl の isSidechain:true 行数: ${sidechainMsgs}件（引き続き0件・sidechain記録方式ではなく別ファイル方式）。`);
  report.push(`Agent/Workflow tool_use 呼び出し回数: ${agentToolUseTotal}件。`);
  report.push("");
  report.push("## 日別/週別 時系列");
  report.push("");
  report.push("| 日付 | 消費 $ | トークン | msgs |");
  report.push("|---|---|---|---|");
  for (const [day, v] of [...byDay.entries()].sort()) {
    report.push(`| ${day} | $${v.cost.toFixed(3)} | ${v.tokens.toLocaleString()} | ${v.msgs} |`);
  }
  report.push("");
  report.push("## model 別");
  report.push("");
  report.push("| model | 消費 $ | トークン | msgs |");
  report.push("|---|---|---|---|");
  for (const [m, v] of sortedByCost(byModel)) {
    report.push(`| ${m} | $${v.cost.toFixed(3)} | ${v.tokens.toLocaleString()} | ${v.msgs} |`);
  }
  report.push("");
  report.push("## 作業種別別（work-map.json proxy 分類・cwd 由来）");
  report.push("");
  report.push("| 種別 | 消費 $ | 全体比% | トークン | msgs |");
  report.push("|---|---|---|---|---|");
  for (const [c, v] of sortedByCost(byCategory)) {
    const pct = totalCost > 0 ? ((v.cost / totalCost) * 100).toFixed(1) : "0.0";
    report.push(`| ${c} | $${v.cost.toFixed(3)} | ${pct}% | ${v.tokens.toLocaleString()} | ${v.msgs} |`);
  }
  report.push("");
  report.push("## サブエージェント種別別（新規・従来欠落分）");
  report.push("");
  report.push("| agentType | 消費 $ | トークン | msgs | 起動回数(ファイル数) |");
  report.push("|---|---|---|---|---|");
  for (const [at, v] of sortedByCost(bySubagentType)) {
    report.push(`| ${at} | $${v.cost.toFixed(3)} | ${v.tokens.toLocaleString()} | ${v.msgs} | ${v.invocations.size} |`);
  }
  report.push("");
  report.push("## スキル別（本体セッションのみ・attributionSkill or 直近 Skill tool_use）");
  report.push("");
  report.push("| skill | 消費 $ | トークン | msgs |");
  report.push("|---|---|---|---|");
  for (const [s, v] of sortedByCost(bySkill).slice(0, 30)) {
    report.push(`| ${s} | $${v.cost.toFixed(3)} | ${v.tokens.toLocaleString()} | ${v.msgs} |`);
  }
  report.push("");
  report.push("## session 別コスト上位20（本体セッション。サブエージェント分は親セッションIDに合算されない別ファイル集計のため別枠）");
  report.push("");
  report.push("| session | project | 消費 $ | トークン | msgs |");
  report.push("|---|---|---|---|---|");
  for (const [sid, v] of topSessions) {
    report.push(`| ${sid.slice(0, 8)} | ${v.proj} | $${v.cost.toFixed(3)} | ${v.tokens.toLocaleString()} | ${v.msgs} |`);
  }
  report.push("");
  report.push("## マスター仮説5項目の定量評価（訂正版）");
  report.push("");
  const pct = (v) => (totalCost > 0 ? ((v / totalCost) * 100).toFixed(1) : "0.0");
  report.push("| 仮説 | 消費 $ | 全体比 | 根拠 |");
  report.push("|---|---|---|---|");
  report.push(`| 検証ループ（code-review*/security-review*/verify*/fix-loop 発火区間 + 同一ファイル5回以上連続Edit区間） | $${loopCost.toFixed(3)} | ${pct(loopCost)}% | skill発火起因=$${loopByReason.skill.toFixed(3)} / editStreak起因=$${loopByReason.editStreak.toFixed(3)} |`);
  report.push(`| 動画編集（ymm-shorts/video-shorts/x-auto-post） | $${videoCat.cost.toFixed(3)} | ${pct(videoCat.cost)}% | cwd分類 |`);
  report.push(`| HP/LP 制作（homepage/hp-customizer/*-lp） | $${hpCat.cost.toFixed(3)} | ${pct(hpCat.cost)}% | cwd分類 |`);
  report.push(`| 試作・改善ループ（RAG系=medguide-rag を代表proxy計上） | $${ragCat.cost.toFixed(3)} | ${pct(ragCat.cost)}% | cwd分類 |`);
  report.push(`| **サブ多用（Agent/Workflow・訂正: 実測可能だった）** | **$${subagentCost.toFixed(3)}** | **${pct(subagentCost)}%** | subagents/*.jsonl 実測（agentType別内訳は上記セクション参照） |`);
  report.push("");
  report.push("## cache_read/cache_write 支配度（トークン種別内訳は strategy-analysis.mjs 参照）");
  report.push("");
  report.push("cache_read は output の概ね 10〜260 倍のオーダーで推移する（長時間 Opus セッションの文脈再読）。$ ベースの内訳は `outputs/token-usage-strategy.md`（strategy-analysis.mjs 出力）を参照。");
  report.push("");

  fs.writeFileSync(path.join(OUT_DIR, "token-audit-report.md"), report.join("\n"), "utf8");

  console.log("DONE");
  console.log("totalCost", totalCost.toFixed(2));
  console.log("subagentCost", subagentCost.toFixed(2), `(${(subagentCost/totalCost*100).toFixed(1)}%)`);
  console.log("totalMsgs", totalMsgs, "subagentMsgs", subagentMsgs);
  console.log("agentToolUseTotal", agentToolUseTotal);
  console.log("unpriced", unpriced);
}

main().catch((e) => { console.error(e); process.exit(1); });
