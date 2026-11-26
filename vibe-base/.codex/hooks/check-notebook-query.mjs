#!/usr/bin/env node
/**
 * PreToolUse hook: create-image スキル STEP 2 強制
 *
 * 対象: Bash で `scripts/replicate-generate/generate.py` を呼ぶ瞬間
 * 動作: 同セッション内に NotebookLM `notebook_query` 呼び出しが
 *       1回でもあれば pass、なければ block
 *
 * 参照: .claude/skills/create-image/SKILL.md STEP 2
 *       NotebookLM ノート ClaudeCode-BestPractice の #1 #2
 */
import { readFileSync } from "fs";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8"));
} catch {
  process.exit(0);
}

const toolInput = input.tool_input || {};
const cmd = toolInput.command || "";

// 対象コマンド以外は素通し
if (!/replicate-generate[\\/]generate\.py/.test(cmd)) {
  process.exit(0);
}

const transcriptPath = input.transcript_path;
if (!transcriptPath) {
  process.exit(0);
}

let transcript;
try {
  transcript = readFileSync(transcriptPath, "utf-8");
} catch (e) {
  console.error(`[create-image hook] transcript read error: ${e.message}`);
  process.exit(0);
}

if (!/mcp__notebooklm-mcp__notebook_query/.test(transcript)) {
  console.error(
    "[BLOCKED] create-image スキル STEP 2 違反: NotebookLM ベスプラ未参照のまま Replicate を呼ぼうとしています。\n" +
      "対処: ClaudeCode-BestPractice ノートの #1 (Replicate運用マニュアル) と #2 (Prompt Writing Spec) を notebook_query で先に参照してください。"
  );
  process.exit(2);
}

process.exit(0);
