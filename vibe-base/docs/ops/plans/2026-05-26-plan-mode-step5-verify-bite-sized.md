# Plan Mode Step 5 検証 bite-sized 化 Implementation Plan

> **For agentic workers:** このプランは drifting-zooming-sunrise.md の Step 5 検証 6 項目 + ADR 番号重複解消 + Step 6 コミットを bite-sized step に分解したもの。Steps use checkbox (`- [ ]`) syntax for tracking. subagent-driven-development / executing-plans skill は本環境に未配備のため、orchestrator が手動で各 Task を進めるか、Plan Mode 規律に従い explore-agent / implement-agent / verify-agent に委譲する。

**Goal:** drifting-zooming-sunrise.md の Step 5 (検証 6 項目) を機械検証可能な bite-sized step に分解し、Step 6 コミットまで完遂して Plan Mode 再設計を formally close する。

**Architecture:** drifting Step 5 の各検証項目を「実行コマンド + 期待値 + 担当 agent」付き 2-5 分 step に分解。検証ログは `tmp/step5-verify-*.log` に集約。ADR 番号重複は 5 択でマスター判定後 implement step を実行。Step 6 コミットは 3 repo 個別。

**Tech Stack:** Bash (Git Bash on Windows), Node.js (mjs import probe), Glob, grep, JSON.parse (node -e), git

**保存先**: `~/.claude/plans/2026-05-26-plan-mode-step5-verify-bite-sized.md` (本 plan の自己保存先・`docs/ops/plans/` は area-gate.mjs で未登録ブロックされたため `~/.claude/plans/` に変更)

---

## File Structure

### 検証対象 (read-only)
- `vibe-governance/.claude/rules/plan-mode.md` (6758 B)
- `~/.claude/commands/plan.md` (2373 B)
- `vibe-governance/docs/adr/0001-plan-mode-c-design.md` (5450 B 詳細版)
- `vibe-base/docs/adr/0001-plan-mode-c-design.md` (1612 B 簡潔版・重複対象)
- `vibe-base/docs/standards/plan-mode.md` (23136 B)
- `vibe-base/.claude/commands/plan-template.md` (2680 B)
- `vibe-base/.claude/commands/plan-finalize.md` (2485 B)
- `vibe-base/.claude/agents/{explore,implement,verify}-agent.md` (各 1.5-2.3 KB)
- 3 repo の全 `.claude/settings.json`
- 全 product の `.claude/settings.json` (15 製品)

### 検証成果物 (create)
- `tmp/step5-verify-deletion.log` (Task 1)
- `tmp/step5-verify-settings.log` (Task 2)
- `tmp/step5-verify-propagate.log` (Task 3)
- `tmp/step5-verify-checkin.log` (Task 4)
- `tmp/step5-verify-c-rules.log` (Task 5)
- `tmp/step5-verify-c-command.log` (Task 6)
- `tmp/step5-verify-numbering.log` (Task 7)
- `tmp/step5-verify-deadlink.log` (Task 8)
- `tmp/step5-verify-simulation.log` (Task 9)
- `tmp/step5-summary.md` (全 Task 集計レポート)

### 編集対象 (Task 10 マスター判定後のみ)
- `vibe-base/docs/adr/0001-plan-mode-c-design.md` (削除 or pointer 化 or rename)

### memory.md / MISSION_LOG.md (Task 11 コミット時)
- `vibe-base/memory.md` P1.5 dangling reference 修正 + P4 1 entry 追加
- `vibe-base/MISSION_LOG.md` Step 5 完遂ブロック追記

---

## Task 1: 抹消網羅性検証 (drifting 検証 1)

**Files:**
- Read-only: 全リポジトリの `.claude/hooks/`
- Create: `tmp/step5-verify-deletion.log`

drifting plan で削除対象とされた 8 hook + 関連 5 scripts が全 location で 0 件であることを Glob で確認。

- [ ] **Step 1-1: 8 hook の vibe-base 全域 Glob**

Run:
```bash
node -e "
const {glob} = require('glob');
const patterns = [
  '**/plan-mode-banner.mjs','**/plan-mode-banner-verify.mjs',
  '**/plan-mode-entry-gate.mjs','**/plan-phase-gate.mjs',
  '**/completion-report-gate.mjs','**/question-template-gate.mjs',
  '**/subagent-stop-reviewer.mjs','**/bash-log-recorder.mjs'
];
(async () => {
  let total = 0;
  for (const p of patterns) {
    const files = await glob(p, { ignore: ['node_modules/**','**/archive/**','.git/**'] });
    console.log(p + ': ' + files.length + (files.length ? ' [' + files.join(',') + ']' : ''));
    total += files.length;
  }
  console.log('TOTAL_HITS: ' + total);
})();
" 2>&1 | tee tmp/step5-verify-deletion.log
```
Expected: 全パターン 0 件 / `TOTAL_HITS: 0`

- [ ] **Step 1-2: 5 script の vibe-governance Glob**

Run:
```bash
ls ../vibe-governance/scripts/check-plan-mode-conditions.mjs \
   ../vibe-governance/scripts/check-plan-phase-completion.mjs \
   ../vibe-governance/scripts/check-verification-evidence.mjs \
   ../vibe-governance/scripts/detect-plan-mode-scene.mjs \
   ../vibe-governance/scripts/check-plan-quality.mjs 2>&1 | tee -a tmp/step5-verify-deletion.log
```
Expected: 全 5 件「No such file or directory」(削除確認)

- [ ] **Step 1-3: 判定**

```bash
grep -c "TOTAL_HITS: 0" tmp/step5-verify-deletion.log
```
Expected: `1` (Step 1-1 ヒット 0 行が記録されている)

担当: verify-agent (Glob + Bash test -f は許可リスト内)

---

## Task 2: settings.json 健全性検証 (drifting 検証 2)

**Files:**
- Read-only: vibe-base + vibe-governance + 全 product の settings.json
- Create: `tmp/step5-verify-settings.log`

JSON.parse で構文 OK + plan-mode 系文字列 grep で 0 件を確認。

- [ ] **Step 2-1: settings.json 一覧取得**

Run:
```bash
node -e "
const {glob} = require('glob');
(async () => {
  const a = await glob('.claude/settings.json');
  const b = await glob('products/*/.claude/settings.json');
  const c = await glob('../vibe-governance/.claude/settings.json');
  const all = [...a,...b,...c];
  console.log('FOUND: ' + all.length);
  all.forEach(p => console.log(p));
  require('fs').writeFileSync('tmp/step5-settings-list.txt', all.join('\n'));
})();
" 2>&1 | tee tmp/step5-verify-settings.log
```
Expected: `FOUND:` の数値が 17 前後 (vibe-base 1 + 15 product + vibe-governance 1)

- [ ] **Step 2-2: 各 settings.json で JSON.parse**

Run:
```bash
PASS=0; FAIL=0
while IFS= read -r f; do
  if node -e "JSON.parse(require('fs').readFileSync('$f','utf-8'))" 2>/dev/null; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    echo "JSON FAIL: $f" | tee -a tmp/step5-verify-settings.log
  fi
done < tmp/step5-settings-list.txt
echo "PARSE_PASS=$PASS PARSE_FAIL=$FAIL" | tee -a tmp/step5-verify-settings.log
```
Expected: `PARSE_FAIL=0` / `PARSE_PASS` = Step 2-1 の FOUND と同値

- [ ] **Step 2-3: plan-mode 系文字列の grep**

Run:
```bash
while IFS= read -r f; do
  grep -E "plan-mode-banner|plan-mode-entry-gate|plan-phase-gate|completion-report-gate|question-template-gate|subagent-stop-reviewer|bash-log-recorder" "$f" 2>/dev/null
done < tmp/step5-settings-list.txt | tee tmp/step5-settings-grep.txt
echo "HITS: $(wc -l < tmp/step5-settings-grep.txt)" | tee -a tmp/step5-verify-settings.log
```
Expected: `HITS: 0`

担当: verify-agent

---

## Task 3: propagate-hooks.mjs 整合検証 (drifting 検証 3)

**Files:**
- Read-only: `../vibe-governance/scripts/propagate-hooks.mjs`
- Create: `tmp/step5-verify-propagate.log`

dry-run でエラーなし + product 同期状態が一貫していることを確認。

- [ ] **Step 3-1: script の存在確認**

Run:
```bash
ls -la ../vibe-governance/scripts/propagate-hooks.mjs 2>&1 | tee tmp/step5-verify-propagate.log
```
Expected: ファイル存在 (size > 0)

- [ ] **Step 3-2: dry-run 実行**

Run:
```bash
node ../vibe-governance/scripts/propagate-hooks.mjs --dry-run 2>&1 | tee -a tmp/step5-verify-propagate.log
echo "EXIT: $?" | tee -a tmp/step5-verify-propagate.log
```
Expected: `EXIT: 0` + 出力に "error" / "ERR" / "Cannot find" の文字列が無い

- [ ] **Step 3-3: error pattern grep**

Run:
```bash
grep -ciE "(error|cannot find|ERR_)" tmp/step5-verify-propagate.log
```
Expected: 0 (ただし `EXIT: 0` 行を grep が拾わないよう確認)

担当: verify-agent (dry-run は副作用なし) / `--dry-run` フラグが未実装の場合は orchestrator が code 確認後判断

---

## Task 4: check-in-verify.sh 健全性検証 (drifting 検証 4)

**Files:**
- Read-only: `scripts/check-in-verify.sh` (vibe-base) と `../vibe-governance/scripts/check-in-verify.sh`
- Create: `tmp/step5-verify-checkin.log`

A-10 (plan 品質検証) + bash-log 参照セクションが除去されたままで EXIT 0 を確認。

- [ ] **Step 4-1: vibe-base 側の script 存在確認**

Run:
```bash
ls -la scripts/check-in-verify.sh 2>&1 | tee tmp/step5-verify-checkin.log
```
Expected: 存在 or 「No such file」(後者なら Task 4-2 をスキップしマスター報告)

- [ ] **Step 4-2: A-10 / bash-log セクション削除確認**

Run:
```bash
[ -f scripts/check-in-verify.sh ] && grep -cE "(A-10|bash-log|plan品質|plan quality)" scripts/check-in-verify.sh | tee -a tmp/step5-verify-checkin.log
```
Expected: 0 (削除済)

- [ ] **Step 4-3: スクリプト実行**

Run:
```bash
[ -f scripts/check-in-verify.sh ] && bash scripts/check-in-verify.sh 2>&1 | tee -a tmp/step5-verify-checkin.log; echo "EXIT: $?" | tee -a tmp/step5-verify-checkin.log
```
Expected: `EXIT: 0`

担当: verify-agent

---

## Task 5: C の動作検証 — rules H2 5 項目存在 (drifting 検証 5a)

**Files:**
- Read-only: `../vibe-governance/.claude/rules/plan-mode.md` + `docs/standards/plan-mode.md`
- Create: `tmp/step5-verify-c-rules.log`

drifting Step 4-1 で定義した H2 5 項目 (Plan Mode とは / いつ使うか / plan の固定 H2 構造 / セッション分離 / plan の進化 / plan の実体照合) が rules に揃っていることを確認。実体は 6 項目だが drifting Step 4-1 列挙ベース。

- [ ] **Step 5-1: vibe-governance 側 H2 抽出**

Run:
```bash
grep -nE "^## " ../vibe-governance/.claude/rules/plan-mode.md | tee tmp/step5-verify-c-rules.log
echo "H2_COUNT_GOV: $(grep -cE '^## ' ../vibe-governance/.claude/rules/plan-mode.md)" | tee -a tmp/step5-verify-c-rules.log
```
Expected: `H2_COUNT_GOV: 6` 以上 (drifting Step 4-1 で 6 項目列挙)

- [ ] **Step 5-2: vibe-base 側 (standards) H2 抽出**

Run:
```bash
grep -nE "^## " docs/standards/plan-mode.md | tee -a tmp/step5-verify-c-rules.log
echo "H2_COUNT_VBASE: $(grep -cE '^## ' docs/standards/plan-mode.md)" | tee -a tmp/step5-verify-c-rules.log
```
Expected: `H2_COUNT_VBASE` >= 6 (実体は更新後 12-15 程度のはず・要素吸収済)

- [ ] **Step 5-3: 必須キーワード照合**

Run:
```bash
for kw in "Plan Mode とは" "いつ使うか" "固定 H2 構造" "セッション分離" "plan の進化" "plan の実体照合"; do
  COUNT=$(grep -c "$kw" docs/standards/plan-mode.md)
  echo "kw='$kw' count=$COUNT" | tee -a tmp/step5-verify-c-rules.log
done
```
Expected: 全キーワード count >= 1

担当: verify-agent

---

## Task 6: C の動作検証 — /plan 雛形出力 (drifting 検証 5b)

**Files:**
- Read-only: `~/.claude/commands/plan.md` + `.claude/commands/plan-template.md`
- Create: `tmp/step5-verify-c-command.log`

`/plan` コマンドファイルが H2 雛形 5 項目を含むことを構造的に確認。実行はユーザー操作 (Skill 起動) が必要なため、ここではファイル中身の機械検証に絞る。

- [ ] **Step 6-1: ~/.claude/commands/plan.md 存在 + 雛形 H2 確認**

Run:
```bash
ls -la ~/.claude/commands/plan.md | tee tmp/step5-verify-c-command.log
grep -E "^(## |```markdown)" ~/.claude/commands/plan.md | head -20 | tee -a tmp/step5-verify-c-command.log
```
Expected: 存在 + 雛形セクションに H2 5 項目以上の言及

- [ ] **Step 6-2: 雛形 H2 必須項目の grep**

Run:
```bash
for kw in "影響範囲" "実装ステップ" "リスク" "テスト方針" "受け入れ基準"; do
  COUNT=$(grep -c "$kw" ~/.claude/commands/plan.md)
  echo "kw='$kw' count=$COUNT" | tee -a tmp/step5-verify-c-command.log
done
```
Expected: 全 5 キーワード count >= 1

- [ ] **Step 6-3: vibe-base/.claude/commands/plan-template.md と整合**

Run:
```bash
diff <(grep -E "^## " ~/.claude/commands/plan.md) <(grep -E "^## " .claude/commands/plan-template.md) | tee -a tmp/step5-verify-c-command.log || true
echo "PLAN_VS_TEMPLATE_DIFF_LINES: $(diff <(grep -E '^## ' ~/.claude/commands/plan.md) <(grep -E '^## ' .claude/commands/plan-template.md) | wc -l)" | tee -a tmp/step5-verify-c-command.log
```
Expected: 差分行数 == 0 (両者の H2 構造一致) もしくは差分内容を master に共有して判断

担当: verify-agent

---

## Task 7: 通電テスト — 番号連続性 (drifting 検証 6a)

**Files:**
- Read-only: `../vibe-governance/.claude/rules/session-lifecycle.md` + `scripts/check-in-verify.sh` + `docs/adr/`
- Create: `tmp/step5-verify-numbering.log`

drifting Step 2 で session-lifecycle / check-in-verify の Plan Mode セクション除去・A-N 番号繰り直しが行われたため、現在の番号連続性を確認。

- [ ] **Step 7-1: session-lifecycle.md の H2/H3 番号一覧**

Run:
```bash
ls ../vibe-governance/.claude/rules/session-lifecycle.md 2>&1 | tee tmp/step5-verify-numbering.log
[ -f ../vibe-governance/.claude/rules/session-lifecycle.md ] && grep -nE "^#{2,3} " ../vibe-governance/.claude/rules/session-lifecycle.md | tee -a tmp/step5-verify-numbering.log
```
Expected: ファイル存在 + 番号付き見出し連番 (1,2,3,... または A,B,C,...)

- [ ] **Step 7-2: check-in-verify A-N 番号連続性**

Run:
```bash
[ -f scripts/check-in-verify.sh ] && grep -oE "A-[0-9]+" scripts/check-in-verify.sh | sort -u | tee -a tmp/step5-verify-numbering.log
[ -f ../vibe-governance/scripts/check-in-verify.sh ] && grep -oE "A-[0-9]+" ../vibe-governance/scripts/check-in-verify.sh | sort -u | tee -a tmp/step5-verify-numbering.log
```
Expected: A-1, A-2, ... A-N が連番で歯抜けなし

- [ ] **Step 7-3: ADR 番号一覧**

Run:
```bash
ls docs/adr/*.md ../vibe-governance/docs/adr/*.md 2>&1 | tee -a tmp/step5-verify-numbering.log
```
Expected: 全 ADR が 000N 命名・vibe-base / vibe-governance で番号重複あれば Task 10 で扱う

担当: verify-agent

---

## Task 8: 通電テスト — クロスリファレンス dead-link (drifting 検証 6b)

**Files:**
- Read-only: vibe-base + vibe-governance の全 md / json で plan-mode 系言及
- Create: `tmp/step5-verify-deadlink.log`

抹消された hook / script / docs への参照が dead link として残っていないか grep で網羅検査。

- [ ] **Step 8-1: 削除済 path の grep**

Run:
```bash
PATTERNS=(
  "plan-mode-banner"
  "plan-mode-entry-gate"
  "plan-phase-gate"
  "completion-report-gate"
  "question-template-gate"
  "subagent-stop-reviewer"
  "bash-log-recorder"
  "check-plan-mode-conditions"
  "check-plan-phase-completion"
  "check-verification-evidence"
  "detect-plan-mode-scene"
  "check-plan-quality"
  "plan-mode-auto-hearing"
  "plan-mode-mechanical-enforcement"
)
> tmp/step5-verify-deadlink.log
for p in "${PATTERNS[@]}"; do
  COUNT=$(grep -rEl "$p" --include="*.md" --include="*.json" --include="*.sh" --include="*.mjs" --include="*.js" 2>/dev/null | grep -vE "(archive/|\.git/|node_modules/|tmp/|MISSION_LOG\.md|memory\.md)" | wc -l)
  echo "pattern='$p' file_count=$COUNT" | tee -a tmp/step5-verify-deadlink.log
done
```
Expected: 全パターン file_count == 0 (memory.md / MISSION_LOG.md / archive/ は履歴のため除外)

- [ ] **Step 8-2: 残存箇所の詳細 (count > 0 のとき)**

Run:
```bash
grep -rEn "plan-mode-banner|plan-phase-gate|completion-report-gate|question-template-gate|subagent-stop-reviewer|bash-log-recorder|check-plan-mode-conditions|plan-mode-auto-hearing|plan-mode-mechanical-enforcement" --include="*.md" --include="*.json" --include="*.sh" --include="*.mjs" 2>/dev/null | grep -vE "(archive/|\.git/|node_modules/|tmp/|MISSION_LOG\.md|memory\.md)" | head -40 | tee -a tmp/step5-verify-deadlink.log
```
Expected: 0 行 (Step 8-1 で 0 件確認後の二重チェック)

- [ ] **Step 8-3: memory.md 内の dangling 参照 (本セッションで判明済) 確認**

Run:
```bash
grep -nE "plan-mode-mechanical-enforcement-2026-05-19" memory.md | tee -a tmp/step5-verify-deadlink.log
echo "DANGLING_IN_MEMORY: $(grep -cE 'plan-mode-mechanical-enforcement-2026-05-19' memory.md)" | tee -a tmp/step5-verify-deadlink.log
```
Expected: `DANGLING_IN_MEMORY: 0` (本 plan 完遂後に memory P1.5 を修正したか確認・1 以上ならその後 Task 11 で修正)

担当: verify-agent

---

## Task 9: 通電テスト — 運用シミュレーション (drifting 検証 6c)

**Files:**
- Read-only: `docs/standards/plan-mode.md` + `~/.claude/commands/plan.md` + `.claude/agents/{explore,implement,verify}-agent.md`
- Create: `tmp/step5-verify-simulation.log`

「C の rules だけで担当 AI が plan を書けるか」を擬似的に確認。シミュレーション項目は判定可能形式に絞る。

- [ ] **Step 9-1: agent 定義 3 種の frontmatter 検証**

Run:
```bash
> tmp/step5-verify-simulation.log
for agent in explore implement verify; do
  f=.claude/agents/${agent}-agent.md
  echo "=== $f ===" | tee -a tmp/step5-verify-simulation.log
  head -10 "$f" | tee -a tmp/step5-verify-simulation.log
  REQUIRED_KEYS="name description tools model"
  for k in $REQUIRED_KEYS; do
    COUNT=$(grep -c "^${k}:" "$f")
    echo "  $k: count=$COUNT" | tee -a tmp/step5-verify-simulation.log
  done
done
```
Expected: 全 agent で name / description / tools / model 各 count == 1

- [ ] **Step 9-2: H2 構造を埋められるか確認 (本 plan ファイル自体が証明)**

Run:
```bash
echo "本 plan が固定 H2 構造で書かれているか自己照合:" | tee -a tmp/step5-verify-simulation.log
grep -E "^## (Task|File Structure|Self-Review)" ~/.claude/plans/2026-05-26-plan-mode-step5-verify-bite-sized.md | tee -a tmp/step5-verify-simulation.log
echo "TASK_COUNT: $(grep -cE '^## Task ' ~/.claude/plans/2026-05-26-plan-mode-step5-verify-bite-sized.md)" | tee -a tmp/step5-verify-simulation.log
```
Expected: `TASK_COUNT: 11` (本 plan の Task 数)

- [ ] **Step 9-3: standards plan-mode.md の subagent 委譲規律言及**

Run:
```bash
for kw in "explore-agent" "implement-agent" "verify-agent" "subagent" "委譲"; do
  COUNT=$(grep -c "$kw" docs/standards/plan-mode.md)
  echo "kw='$kw' count=$COUNT" | tee -a tmp/step5-verify-simulation.log
done
```
Expected: 各キーワード count >= 1

担当: orchestrator (シミュレーションは判断要素を含む) または verify-agent

---

## Task 10: ADR 番号重複解消 (drifting 既知問題)

**Files:**
- Read-only: `vibe-base/docs/adr/0001-plan-mode-c-design.md` (1612 B 簡潔版) + `../vibe-governance/docs/adr/0001-plan-mode-c-design.md` (5450 B 詳細版)
- Edit (マスター判定 5 択後・branch 5 ごとに 1 つ実行):
  - 選択 A: vibe-base 側削除 (canonical = governance 側)
  - 選択 B: vibe-base 側を 1 行 pointer に置換
  - 選択 C: vibe-base 側を 0002 にリネーム
  - 選択 D: vibe-governance 側内容を vibe-base 側にコピーし governance 側は pointer 化 (vibe-governance 編集はマスター手動 / 別セッション)
  - 選択 E: 現状維持 (memory P2 フラグはそのまま運用注意として残す)

memory P1 #8 (vibe-base 外編集禁止) を踏まえ A/B/C/E は司令塔で完結可・D はマスター手動 or 別セッション。

- [ ] **Step 10-1: 両 ADR の中身を並列表示してマスターに見せる**

Run:
```bash
echo "=== vibe-base 簡潔版 (1612 B) ===" > tmp/step5-adr-compare.txt
cat docs/adr/0001-plan-mode-c-design.md >> tmp/step5-adr-compare.txt
echo "" >> tmp/step5-adr-compare.txt
echo "=== vibe-governance 詳細版 (5450 B) ===" >> tmp/step5-adr-compare.txt
cat ../vibe-governance/docs/adr/0001-plan-mode-c-design.md >> tmp/step5-adr-compare.txt
diff docs/adr/0001-plan-mode-c-design.md ../vibe-governance/docs/adr/0001-plan-mode-c-design.md > tmp/step5-adr-diff.txt || true
echo "DIFF_LINES: $(wc -l < tmp/step5-adr-diff.txt)" | tee -a tmp/step5-verify-deadlink.log
```
Expected: 比較資料生成 + マスターに `tmp/step5-adr-compare.txt` を提示し 5 択判定を仰ぐ

- [ ] **Step 10-2: マスター判定を AskUserQuestion で取得**

司令塔タスク: AskUserQuestion で A/B/C/D/E のいずれかをマスターに選ばせる。option order = 推奨 B が先頭 (1 行 pointer は dead-link 不発生で安全)。

- [ ] **Step 10-3a: 選択 A 実行 (vibe-base 側削除)**

```bash
git rm docs/adr/0001-plan-mode-c-design.md
# 関連 memory P2 索引も更新 (Task 11 にて)
```
Expected: git status で deleted 表示

- [ ] **Step 10-3b: 選択 B 実行 (1 行 pointer 化)**

`docs/adr/0001-plan-mode-c-design.md` を以下の内容で上書き:
```markdown
# ADR 0001: Plan Mode C 設計の採用

詳細版は `../vibe-governance/docs/adr/0001-plan-mode-c-design.md` を参照。本ファイルは vibe-base 配下からの dead-link 防止 pointer。
```
Run: `git diff docs/adr/0001-plan-mode-c-design.md` で 1 file changed を確認

- [ ] **Step 10-3c: 選択 C 実行 (0002 へリネーム)**

```bash
git mv docs/adr/0001-plan-mode-c-design.md docs/adr/0002-plan-mode-c-design.md
```
Expected: 0002 として独立 ADR 化 (テーマ同一の重複 ADR を 2 本維持・運用上は非推奨)

- [ ] **Step 10-3d: 選択 D 実行 (governance 側を pointer 化)**

vibe-governance 側の編集はマスター手動 or 別セッションで実施。司令塔は vibe-base 側を詳細版に上書き (governance 5450 B の中身を copy)。
```bash
cp ../vibe-governance/docs/adr/0001-plan-mode-c-design.md docs/adr/0001-plan-mode-c-design.md
git diff --stat docs/adr/0001-plan-mode-c-design.md
```
Expected: 1612 → 5450 B に拡張・vibe-governance 側 pointer 化はマスター別タスクで対応

- [ ] **Step 10-3e: 選択 E 実行 (現状維持)**

何もしない。memory P2 索引に「重複承知・E 採用」を 1 行追記 (Task 11 にて)。

- [ ] **Step 10-4: 選択後の dead-link 再検査**

Run:
```bash
grep -rEl "docs/adr/0001-plan-mode" --include="*.md" --include="*.json" 2>/dev/null | grep -vE "(archive/|\.git/|node_modules/|tmp/)" | tee tmp/step5-adr-postlink.txt
echo "ADR_REF_FILES: $(wc -l < tmp/step5-adr-postlink.txt)" | tee -a tmp/step5-verify-deadlink.log
```
Expected: 選択 A 後は memory.md / CLAUDE.md 等の参照が dangling なら別途修正。選択 B/C/D/E では既存参照が生きていること

担当: orchestrator (マスター対話 + git 操作)

---

## Task 11: 検証集計 + memory / MISSION_LOG 更新 + Step 6 コミット

**Files:**
- Create: `tmp/step5-summary.md`
- Modify: `memory.md` (P1.5 / P4)
- Append: `MISSION_LOG.md`
- Commit: vibe-base 1 commit (vibe-governance 側は別セッション)

- [ ] **Step 11-1: 全 Task ログを集計**

Run:
```bash
{
  echo "# Step 5 検証結果サマリ (plan: 2026-05-26-plan-mode-step5-verify-bite-sized.md)"
  echo
  for f in tmp/step5-verify-*.log; do
    echo "## $f"; echo
    echo '```'; cat "$f"; echo '```'; echo
  done
} > tmp/step5-summary.md
wc -l tmp/step5-summary.md
```
Expected: ファイル生成 + 行数 50 以上

- [ ] **Step 11-2: memory.md P1.5 dangling reference 修正**

`memory.md` の以下を Edit で訂正 (orchestrator 直接 Edit):
- 現: `docs/ops/plan-mode-mechanical-enforcement-2026-05-19.md`
- 修正: `~/.claude/plans/drifting-zooming-sunrise.md` + 派生 `wondrous-herding-forest.md` / `cheerful-inventing-frog.md` / `2026-05-26-plan-mode-step5-verify-bite-sized.md`

Run after edit:
```bash
grep -c "plan-mode-mechanical-enforcement-2026-05-19" memory.md
```
Expected: 0

- [ ] **Step 11-3: memory.md P4 永続教訓に Step 5 完遂を 1 entry 追加**

新規 entry 内容:
```
- [importance:M][2026-05-26] **drifting plan Step 5 検証 6 項目 bite-sized 化 + 完遂 (plan: ~/.claude/plans/2026-05-26-plan-mode-step5-verify-bite-sized.md)** — Task 1-11 全 PASS。Plan Mode 再設計 (C 設計) は配備物 10 件 + 抹消網羅 + settings.json 健全 + 番号連続性 + dead-link 0 + 運用シミュレーション通過で formally close。ADR 番号重複は選択 [マスター判定値] で解消。**Why**: drifting Step 5-6 を bite-sized 化することで「実態として配備済だが検証されていない」状態を機械検証可能化。**How to apply**: 今後同様の「ざっくり plan + 部分実装済」状態を扱う際は writing-plans skill で Step 単位 bite-sized 化 → verify-agent 委譲フローを踏襲。
```

- [ ] **Step 11-4: MISSION_LOG.md にセッションブロック append (Bash heredoc)**

Run:
```bash
cat >> MISSION_LOG.md <<'EOF'

## [2026-05-26] drifting plan Step 5 bite-sized 化完遂 (plan: ~/.claude/plans/2026-05-26-plan-mode-step5-verify-bite-sized.md)

### Scope
drifting-zooming-sunrise.md の Step 5 検証 6 項目 + ADR 番号重複解消 + Step 6 コミットを bite-sized 化し全 Task PASS。

### 結果
Task 1-11 全 PASS / ADR 重複は選択 [マスター判定] で解消 / 残作業: vibe-governance 側コミット (別セッション・選択 D 採用時のみ)。

### 教訓 (P4 反映済)
ざっくり plan + 部分実装済の状態は writing-plans skill で Step 単位に bite-sized 化することで機械検証可能化できる。
EOF
wc -l MISSION_LOG.md
```
Expected: 行数増加 (memory P3 #1「heredoc で SJIS mojibake 回避」教訓踏襲)

- [ ] **Step 11-5: git diff --stat で変更ファイル確認**

Run:
```bash
git diff --stat memory.md MISSION_LOG.md docs/adr/0001-plan-mode-c-design.md
git status --short
```
Expected: 3-4 ファイルの変更/追加

- [ ] **Step 11-6: コミット (マスター指示時のみ)**

Run:
```bash
git add memory.md MISSION_LOG.md docs/adr/0001-plan-mode-c-design.md
git commit -m "$(cat <<'COMMIT'
chore(plan-mode): drifting Step 5 検証完遂 + ADR 重複解消 (選択 [X])

plan: ~/.claude/plans/2026-05-26-plan-mode-step5-verify-bite-sized.md
- Task 1-9: drifting plan 検証 6 項目 bite-sized 化 + 全 PASS
- Task 10: ADR 番号重複を選択 [X] で解消
- Task 11: memory.md P1.5 dangling reference 修正 + P4 達成記録 1 entry 追加
- MISSION_LOG.md: セッション締めブロック append

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
COMMIT
)"
git log -1 --oneline
```
Expected: 1 commit 作成

担当: orchestrator (memory / MISSION_LOG / commit は orchestrator 必須・memory P4 [2026-05-23])

---

## Self-Review

### Spec coverage
- ✅ drifting Step 5-1 (抹消網羅) → Task 1
- ✅ drifting Step 5-2 (settings.json 健全) → Task 2
- ✅ drifting Step 5-3 (propagate) → Task 3
- ✅ drifting Step 5-4 (check-in-verify) → Task 4
- ✅ drifting Step 5-5a (rules H2) → Task 5
- ✅ drifting Step 5-5b (/plan 雛形) → Task 6
- ✅ drifting Step 5-6a (番号連続性) → Task 7
- ✅ drifting Step 5-6b (dead-link) → Task 8
- ✅ drifting Step 5-6c (運用シミュレーション) → Task 9
- ✅ ADR 番号重複解消 → Task 10
- ✅ drifting Step 6 (コミット) → Task 11

### Placeholder scan
- ⚠ Task 10-3d で「vibe-governance 編集はマスター手動 / 別セッション」と TBD っぽい記述あり。これは memory P1 #8 (vibe-base 外編集禁止) との衝突で意図的に保留。マスター判定 5 択時に説明する形にしている
- それ以外の TBD / TODO / 「実装後で」は無し

### Type consistency
- 全 Task で `tmp/step5-verify-*.log` の命名規則統一
- 担当 agent の表記が verify-agent / implement-agent / orchestrator で一貫
- 期待値の単位 (件数 / 行数 / EXIT code) を Step ごとに明示

---

## Execution Handoff

Plan complete and saved to `~/.claude/plans/2026-05-26-plan-mode-step5-verify-bite-sized.md`.

本環境では subagent-driven-development / executing-plans skill が未配備のため、以下 2 オプションのいずれか:

**1. Inline 実行 (推奨・本環境で確実に動く)** — orchestrator がこのセッションで Task 1-11 を順次実行。bite-sized step を 1 個ずつ check off。

**2. agent 委譲実行** — Task 単位で `explore-agent` / `implement-agent` / `verify-agent` を Agent tool で起動。ただし verify-agent の許可 Bash が `node -e` / `wc -l` / `grep -cE` をカバーしないため、verify-agent の Bash 許可拡張または各 Task で orchestrator フォールバックが必要。

どちらの方式で進めるかは plan 承認時にマスター判定。
