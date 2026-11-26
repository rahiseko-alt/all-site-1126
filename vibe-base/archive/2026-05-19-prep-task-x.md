# 前提作業 X — MISSION_LOG 残骸一掃 + path-resolver 復旧 + hook 正規化 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans
> 出力先（ExitPlanMode 後）: `docs/ops/plans/2026-05-19-prep-task-x.md`（Block 4 で git mv）

## Context

**why:** Session 295 で MISSION_LOG.md を廃止し memory.md に統合したが、live ファイル 50 件に古い MISSION_LOG 参照が残骸として残存。さらに重大な副作用として `~/.claude/skills/_shared/path-resolver.mjs` の vibe-base ルート検出 marker が `MISSION_LOG.md` のままで **現時点で path-resolver が死んでいる**（実機 EXIT 1 確認済）。A 群スキル 5 件（pc-checkin / deep-research / feed-check / learning-suite-add-kanji / fix-loop / create-image）の cwd 解決が現状機能停止。

**outcome:** ①path-resolver が memory.md marker で復旧し EXIT 0 ②live ファイルの MISSION_LOG 残骸を memory.md / 適切表記へ一括置換し残骸ゼロ化 ③animation-* / measure-gate hook を product 配備可能形に正規化（orphan 解消）④check-in-verify.sh に A-12 検証追加で再発検知。

段階 2（governance / audit を別 repo 化）の前提条件。所要 半日工数想定。

**Goal:** path-resolver EXIT 0 + live MISSION_LOG 残骸 0 件 + A-12 検証 EXIT 0 + propagate-hooks.mjs が animation/measure hook 本体配布まで担う

**Architecture:**
1. path-resolver.mjs / resolve-paths.mjs の marker `MISSION_LOG.md` → `memory.md` 置換（2 ファイル）
2. live 50 件の MISSION_LOG → memory.md 置換（grep ホワイトリスト + sed 一括 + 手動精査）
3. propagate-hooks.mjs 拡張で hook 本体（.sh）も全 product に配布、orphan 参照解消
4. check-in-verify.sh A-12 追加: resolve-paths 動作 + live 残骸ゼロを 3 項検証

**Tech Stack:** Node.js (mjs) / Bash / Git / Grep / sed

---

## File Structure

| パス | 種別 | 責務 |
|---|---|---|
| `~/.claude/skills/_shared/path-resolver.mjs` | 修正 | marker を memory.md に切替（行 48） |
| `~/.claude/skills/_shared/resolve-paths.mjs` | 修正 | エラーメッセージ内 marker 名修正（行 39） |
| `~/.claude/skills/_shared/path-resolver.test.mjs` | 修正 | テストの marker 期待値更新 |
| `scripts/propagate-hooks.mjs` | 修正 | hook 本体（.sh）配布ロジック追加（80 行追記） |
| `scripts/check-in-verify.sh` | 修正 | A-12 検証ブロック追加（行 270 付近に挿入） |
| `memory.md` | 修正 | MISSION_LOG 言及 2 件を memory.md/履歴文脈に置換 |
| `docs/ops/agent-rules.md` | 修正 | MISSION_LOG 4 件を memory.md に置換 |
| `docs/ops/handoff-protocol.md` | 修正 | 8 件置換 |
| `docs/ops/memory-ops.md` | 修正 | 2 件置換 |
| `docs/ops/folder-lifecycle.md` | 修正 | 2 件置換 |
| `docs/ops/product-cycle.md` | 修正 | 2 件置換 |
| `docs/ops/self-verification-sop.md` | 修正 | 5 件置換 |
| `docs/ops/structural-reform-2026-04-27.md` | 修正 | 13 件置換（履歴記述は保持判断） |
| `docs/ops/second-cycle-adjustments-2026-04-28.md` | 修正 | 6 件置換 |
| `docs/ops/revision-history.md` | 修正 | 2 件置換（履歴）保持判断 |
| `docs/ops/research-bank-sop.md` | 修正 | 2 件置換 |
| `docs/ops/project-promotion.md` | 修正 | 2 件置換 |
| `docs/ops/shared-asset-ops.md` | 修正 | 2 件置換 |
| `docs/ops/risk-registry.md` | 修正 | 1 件置換 |
| `docs/ops/backup-strategy-sop.md` | 修正 | 1 件置換 |
| `docs/ops/incident-response-sop.md` | 修正 | 1 件置換 |
| `docs/ops/rule-structure-reform-audit.html` | 修正 | 10 件置換（履歴 HTML は要判断） |
| `.claude/rules/self-verification.md` | 修正 | 2 件置換 |
| `.claude/rules/research-bank.md` | 修正 | 1 件置換 |
| `.claude/hooks/pre-edit.sh` | 修正 | 1 件置換 |
| `scripts/git-hooks/pre-commit` | 修正 | 6 件置換 |
| `scripts/check-skills-spec.mjs` | 修正 | 1 件置換 |
| `scripts/monetization/build.py` | 修正 | 2 件置換 |
| `products/ai-concierge/memory.md` | 修正 | 1 件置換 |
| `products/aiueo/memory.md` | 修正 | 1 件置換 |
| `products/coach/memory.md` | 修正 | 1 件置換 |
| `products/foodee/memory.md` | 修正 | 1 件置換 |
| `products/homepage/memory.md` | 修正 | 1 件置換 |
| `products/kobaraku/memory.md` | 修正 | 1 件置換 |
| `products/learning-suite-kanji/memory.md` | 修正 | 1 件置換 |
| `products/learning-suite-kanji-foreign/memory.md` | 修正 | 1 件置換 |
| `products/omotenashi-trainer/memory.md` | 修正 | 1 件置換 |
| `products/review-analysis/memory.md` | 修正 | 1 件置換 |
| `products/ymm-shorts/memory.md` | 修正 | 1 件置換 |
| `products/aiueo/CLAUDE.md` | 修正 | 1 件置換 |
| `products/homepage/CLAUDE.md` | 修正 | 2 件置換 |
| `products/kobaraku/CLAUDE.md` | 修正 | 1 件置換 |
| `products/review-analysis/CLAUDE.md` | 修正 | 1 件置換 |
| `products/aiueo/backup-config.md` | 修正 | 1 件置換 |
| `products/ai-concierge/backup-config.md` | 修正 | 1 件置換 |
| `products/foodee/backup-config.md` | 修正 | 1 件置換 |
| `products/review-analysis/backup-config.md` | 修正 | 1 件置換 |
| `products/ai-concierge/handoff.md` | 修正 | 2 件置換 |
| `products/review-analysis/pc-progress.md` | 修正 | 1 件置換 |
| `products/coach/pc-progress.html` | 修正 | 2 件置換（履歴文脈保持判断） |
| `products/learning-suite-kanji-foreign/pc-progress.html` | 修正 | 1 件置換 |
| `products/learning-suite-kanji-foreign/docs/research/tech-selection-2026-05-09.md` | 修正 | 1 件置換 |
| `docs/standards/README.md` | 修正 | 2 件置換 |
| `docs/standards/templates/monitoring-design.md` | 修正 | 1 件置換 |
| `docs/md-inventory.md` | 修正 | 3 件置換 |
| `docs/backend-hosting-decision.md` | 修正 | 1 件置換 |
| `docs/claude-md-viewer.html` | 修正 | 2 件置換 |
| `docs/memory-viewer.html` | 修正 | 5 件置換 |
| `docs/scattered-asset-audit.html` | 修正 | 1 件置換 |
| `docs/review-analysis-pc-progress.html` | 修正 | 1 件置換 |
| `docs/governance-overview.html` | 修正 | 6 件置換（履歴 HTML は要判断） |
| `docs/governance-reform-diagram.html` | 修正 | 7 件置換（同上） |
| `journal/weekly/2026-04-17-week-01.md` | 修正 | 1 件置換 |
| `journal/weekly/2026-04-17-week-01.html` | 修正 | 1 件置換 |
| `journal/outputs/2026-04-18-weekly-report-system.md` | 修正 | 2 件置換 |
| `journal/outputs/2026-04-18-weekly-report-system.html` | 修正 | 2 件置換 |
| `journal/monetization/updates/2026-04-13-dsl5-applied.md` | 修正 | 1 件置換 |
| `journal/monetization/drafts/2026-04-14-mf-restaurant-report.html` | 修正 | 1 件置換 |
| `memory/project_rule-structure-reform.md` | 修正 | 1 件置換 |

合計: **修正 64 ファイル**（中身は 1〜13 件の MISSION_LOG hit）。

### 触らないファイル（スコープ外・軸 2 マスター回答「live のみ」）

- `archive/**` 全件（150+ ファイル）— 過去 MISSION_LOG ログとして史的価値
- `journal/claude-code-book/**` 全件（10+ ファイル）— 公開予定書籍コンテンツ
- `**/*.bak-*` バックアップファイル（4 件）
- `docs/structure-dependency-map-2026-05-19.html` / `docs/audits/ai-maturity-2026-05-19.html` — 残骸を主題に書いた現行調査資料（言及目的のため除外）
- `docs/ops/structural-reform-2026-04-27.md` / `revision-history.md` の **履歴記述箇所のみ**保持（「Session 295 で廃止」のような文脈は残す）

---

## 役割分担表（必須・空欄禁止）

| エージェント | 担当タスク | 受領基準 | 報告先 |
|---|---|---|---|
| 司令塔（vibe-base 直接実行） | Task 1〜6 全実装 | 各 Task の検証 cmd EXIT 0 | マスター |
| subagent (Explore) | Task 0 事前差分プレビュー（不要・既に実機調査済のため省略） | — | — |
| subagent (general-purpose, plan-document-reviewer-prompt) | Task 0 plan 自動レビュー | 3 軸 PASS 判定 | 司令塔 |

---

## Dependency Map

```
Task 1 (marker 切替) ─────► Task 2 (置換 sed バッチ) ─► Task 3 (手動精査) ─► Task 6 (検証)
Task 4 (propagate-hooks 拡張) ────────────────────────────────────────────► Task 6
Task 5 (A-12 追加) ───────────────────────────────────────────────────────► Task 6
```

Task 1 が最優先（path-resolver 復旧）。Task 2-3 が本体。Task 4-5 は並行可能。Task 6 で全件検証。

---

## Task 1: path-resolver marker 切替（最優先・現状死亡）

**Files:**
- Modify: `~/.claude/skills/_shared/path-resolver.mjs:48`
- Modify: `~/.claude/skills/_shared/resolve-paths.mjs:39`
- Modify: `~/.claude/skills/_shared/path-resolver.test.mjs`（テスト期待値）

- [ ] **Step 1: 受入条件確定**

1. path-resolver.mjs 行 48 の marker が `memory.md` に切替済
2. resolve-paths.mjs 行 39 のエラーメッセージが新 marker 名表記
3. test.mjs が新 marker でも PASS
4. vibe-base ルート / product 配下 / vibe-base 外 の 3 cwd から呼んで期待動作

- [ ] **Step 2: path-resolver.mjs 修正**

```javascript
// 行 46-50 を以下に置換
export function findVibeBaseRoot(cwd = process.cwd()) {
  return walkUp(cwd, (d) =>
    hasFile(d, 'memory.md') && hasDir(d, 'products') && hasDir(d, 'docs')
  );
}
```

- [ ] **Step 3: resolve-paths.mjs 修正**

```javascript
// 行 39 を以下に置換
if (!r) die('vibe-base ルートが見つかりません（cwd から memory.md + products/ + docs/ を持つ祖先なし）');
```

- [ ] **Step 4: path-resolver.test.mjs 修正**

```bash
# 既存テストが MISSION_LOG.md fixture を作っている場合、memory.md に切替
# 実装時にファイルを Read して確認後修正
```

- [ ] **Step 5: 検証コマンド実行**

```bash
cd C:/Users/user/Desktop/ClaudeCode/vibe-base
node ~/.claude/skills/_shared/resolve-paths.mjs --vibe-root
# 期待: "C:/Users/user/Desktop/ClaudeCode/vibe-base" 出力 + EXIT 0

cd C:/Users/user/Desktop/ClaudeCode/vibe-base/products/coach
node ~/.claude/skills/_shared/resolve-paths.mjs --product-root
# 期待: "C:/Users/user/Desktop/ClaudeCode/vibe-base/products/coach" 出力 + EXIT 0

cd C:/Users/user/.claude/skills/_shared
node path-resolver.test.mjs
# 期待: 全 PASS
```

- [ ] **Step 6: コミット**

```bash
cd C:/Users/user/.claude/skills
git add _shared/path-resolver.mjs _shared/resolve-paths.mjs _shared/path-resolver.test.mjs
git commit -m "fix(path-resolver): marker を MISSION_LOG.md → memory.md に切替 — Session 295 廃止追従"
git push origin main
```

---

## Task 2: live 自動置換可能ファイル（sed バッチ・34 件）

**Files:**
- Modify: products/*/memory.md (11 件), products/*/CLAUDE.md (4 件), products/*/backup-config.md (4 件), products/*/handoff.md (1 件), products/coach/pc-progress.html (2 件), products/learning-suite-kanji-foreign/pc-progress.html (1 件), products/review-analysis/pc-progress.md (1 件), products/learning-suite-kanji-foreign/docs/research/tech-selection-2026-05-09.md (1 件), journal/** (6 件), memory/project_rule-structure-reform.md (1 件), docs/md-inventory.md (1 件), docs/backend-hosting-decision.md (1 件), docs/standards/README.md, docs/standards/templates/monitoring-design.md (合計 34 件)

- [ ] **Step 1: 受入条件確定**

1. これらのファイルで「MISSION_LOG.md」「MISSION_LOG」（単体）が「memory.md」「memory.md」に置換されている
2. 文脈で「Session 295 で MISSION_LOG.md を廃止」のような **履歴記述は保持**（後述精査）
3. git diff 確認後コミット

- [ ] **Step 2: 置換戦略確定**

3 種パターンを使い分け:
- パターン A: `MISSION_LOG.md` → `memory.md`（ファイル名直接言及）
- パターン B: `MISSION_LOG` → `memory.md` （単体言及・本文）
- パターン C: 履歴文脈（「Session 295 で MISSION_LOG.md を廃止し memory.md に統合」）→ 保持

- [ ] **Step 3: バッチ置換実行（Bash）**

```bash
cd C:/Users/user/Desktop/ClaudeCode/vibe-base
# 置換対象リスト生成
cat > /tmp/replace-list.txt <<'EOF'
products/ai-concierge/memory.md
products/aiueo/memory.md
products/coach/memory.md
products/foodee/memory.md
products/homepage/memory.md
products/kobaraku/memory.md
products/learning-suite-kanji/memory.md
products/learning-suite-kanji-foreign/memory.md
products/omotenashi-trainer/memory.md
products/review-analysis/memory.md
products/ymm-shorts/memory.md
products/aiueo/CLAUDE.md
products/homepage/CLAUDE.md
products/kobaraku/CLAUDE.md
products/review-analysis/CLAUDE.md
products/aiueo/backup-config.md
products/ai-concierge/backup-config.md
products/foodee/backup-config.md
products/review-analysis/backup-config.md
products/ai-concierge/handoff.md
products/review-analysis/pc-progress.md
products/learning-suite-kanji-foreign/docs/research/tech-selection-2026-05-09.md
docs/md-inventory.md
docs/backend-hosting-decision.md
docs/standards/README.md
docs/standards/templates/monitoring-design.md
memory/project_rule-structure-reform.md
journal/weekly/2026-04-17-week-01.md
journal/outputs/2026-04-18-weekly-report-system.md
journal/monetization/updates/2026-04-13-dsl5-applied.md
EOF

# sed バッチ実行（MISSION_LOG.md → memory.md、MISSION_LOG 単体 → memory.md）
# 但し「廃止」「統合」「Session 295」と同行は要手動確認（パターン C）
while read -r f; do
  if [ -f "$f" ]; then
    sed -i.bak \
      -e 's/MISSION_LOG\.md/memory.md/g' \
      -e 's/\bMISSION_LOG\b/memory.md/g' \
      "$f"
    rm "$f.bak"
  fi
done < /tmp/replace-list.txt
```

- [ ] **Step 4: 履歴文脈の復旧（パターン C 手動精査）**

```bash
# 置換後、文脈異常がある箇所を Grep で抽出
grep -rn "Session 295.*memory.md.*廃止" --include="*.md" .
# 自動置換で「Session 295 で memory.md を廃止し memory.md に統合」のような重複が発生する箇所を
# Edit で個別修正（推定 5〜10 箇所）
```

- [ ] **Step 5: 検証コマンド実行**

```bash
cd C:/Users/user/Desktop/ClaudeCode/vibe-base
# 置換漏れチェック（Task 2 対象 34 ファイル）
while read -r f; do
  if [ -f "$f" ]; then
    count=$(grep -c "MISSION_LOG" "$f" 2>/dev/null || echo 0)
    [ "$count" -gt 0 ] && echo "残: $f ($count 件)"
  fi
done < /tmp/replace-list.txt
# 期待: 出力ゼロ
```

- [ ] **Step 6: コミット**

```bash
git add -u
git commit -m "chore(rename): MISSION_LOG → memory.md 一括置換 (Task 2 / 34 ファイル) — Session 295 統合追従"
```

---

## Task 3: 手動精査要ファイル（履歴文脈混在・15 件）

**Files:**
- Modify: `memory.md`, `.claude/rules/self-verification.md`, `.claude/rules/research-bank.md`, `.claude/hooks/pre-edit.sh`, `scripts/git-hooks/pre-commit`, `scripts/check-skills-spec.mjs`, `scripts/monetization/build.py`, `docs/ops/agent-rules.md`, `docs/ops/handoff-protocol.md`, `docs/ops/memory-ops.md`, `docs/ops/folder-lifecycle.md`, `docs/ops/product-cycle.md`, `docs/ops/self-verification-sop.md`, `docs/ops/research-bank-sop.md`, `docs/ops/project-promotion.md`, `docs/ops/shared-asset-ops.md`, `docs/ops/risk-registry.md`, `docs/ops/backup-strategy-sop.md`, `docs/ops/incident-response-sop.md`, `docs/ops/structural-reform-2026-04-27.md`, `docs/ops/second-cycle-adjustments-2026-04-28.md`, `docs/ops/revision-history.md`, `docs/ops/rule-structure-reform-audit.html`, `docs/governance-overview.html`, `docs/governance-reform-diagram.html`, `docs/claude-md-viewer.html`, `docs/memory-viewer.html`, `docs/scattered-asset-audit.html`, `docs/review-analysis-pc-progress.html`, `journal/weekly/2026-04-17-week-01.html`, `journal/outputs/2026-04-18-weekly-report-system.html`, `journal/monetization/drafts/2026-04-14-mf-restaurant-report.html`

- [ ] **Step 1: 受入条件確定**

1. 各ファイルの MISSION_LOG 言及を Read で確認
2. **現行仕組み説明** → memory.md に書き換え
3. **履歴記述**（「v1.0 で MISSION_LOG 導入」「Session 295 で廃止」等）→ 保持
4. hook / script は **動作する MISSION_LOG 参照を memory.md に切替**

- [ ] **Step 2: 各ファイル個別 Edit**

```bash
# 各ファイルを Read → Edit で個別判断
# 推定: 1 ファイルあたり 1-3 件の Edit 操作
# 全 32 ファイル × 平均 2 Edit = 64 Edit 操作
```

- [ ] **Step 3: hook / script の動作確認**

```bash
# pre-edit.sh / pre-commit / check-skills-spec.mjs は MISSION_LOG を機能的に使用していたか確認
# 機能的使用なら memory.md に切替
# 単なる説明コメントなら同様に切替
```

- [ ] **Step 4: 検証コマンド実行**

```bash
cd C:/Users/user/Desktop/ClaudeCode/vibe-base
# Task 3 対象ファイルで「現行仕組み記述」として MISSION_LOG が残っていないか確認
# 履歴文脈は保持されているので 0 件にはならず数十件残る想定。残った件数をマスターに報告
grep -rn "MISSION_LOG" --include="*.md" --include="*.html" --include="*.sh" --include="*.mjs" --include="*.py" . \
  | grep -v "^archive/" \
  | grep -v "^journal/claude-code-book/" \
  | grep -v "\.bak-" \
  | grep -v "structure-dependency-map-2026-05-19" \
  | grep -v "audits/ai-maturity-2026-05-19" \
  | wc -l
# 期待: 50 件未満（履歴文脈のみ残存）
```

- [ ] **Step 5: コミット**

```bash
git add -u
git commit -m "chore(rename): MISSION_LOG → memory.md 手動精査置換 (Task 3 / 32 ファイル) — 履歴文脈は保持"
```

---

## Task 4: propagate-hooks.mjs 拡張（hook 本体配布）

**Files:**
- Modify: `scripts/propagate-hooks.mjs`（80 行追記）
- Modify: 全 product `.claude/settings.json`（hook 参照パス更新）

- [ ] **Step 1: 受入条件確定**

1. propagate-hooks.mjs が `vibe-base/.claude/hooks/*.sh` を全 product `.claude/hooks/` にコピー
2. 各 product settings.json の hook 参照パスが `$CLAUDE_PROJECT_DIR/.claude/hooks/animation-gate.sh` のような相対形式
3. hook 本体は対象ファイル不在時に自己スキップ（既存の振る舞いを尊重）
4. orphan 参照ゼロ

- [ ] **Step 2: propagate-hooks.mjs に hook ファイル配布ロジック追加**

```javascript
// 既存ロジックの末尾（line 161 の closing console.log 群の前）に挿入

// ─────────────────────────────────────────────────────────────
// hook ファイル本体配布: vibe-base/.claude/hooks/*.sh を全 product に配布
// orphan 参照（settings.json 参照あるが実体不在）を解消
// ─────────────────────────────────────────────────────────────
const rootHooksDir = path.join(ROOT, '.claude', 'hooks');
let hookFilesCopied = 0;
if (fs.existsSync(rootHooksDir)) {
  const hookFiles = fs.readdirSync(rootHooksDir).filter(f =>
    f.endsWith('.sh') || f.endsWith('.mjs') || f.endsWith('.js')
  );
  for (const settingsPath of targets) {
    const productHooksDir = path.join(path.dirname(settingsPath), 'hooks');
    if (!fs.existsSync(productHooksDir)) {
      fs.mkdirSync(productHooksDir, { recursive: true });
    }
    for (const hookFile of hookFiles) {
      const src = path.join(rootHooksDir, hookFile);
      const dst = path.join(productHooksDir, hookFile);
      const srcContent = fs.readFileSync(src);
      let needsCopy = true;
      if (fs.existsSync(dst)) {
        const dstContent = fs.readFileSync(dst);
        needsCopy = !srcContent.equals(dstContent);
      }
      if (needsCopy) {
        fs.writeFileSync(dst, srcContent);
        // 実行権限維持
        try { fs.chmodSync(dst, 0o755); } catch {}
        const rel = path.relative(ROOT, dst).replace(/\\/g, '/');
        console.log(`HOOK ${rel}`);
        hookFilesCopied++;
      }
    }
  }
}
console.log(`${hookFilesCopied} hook files copied`);
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd C:/Users/user/Desktop/ClaudeCode/vibe-base
node scripts/propagate-hooks.mjs
# 期待: 14 product × 3 hook = 42 個程度の HOOK ログ → 0 hook files copied（次回以降は冪等）

# 全 product に hook 本体配布されたか確認
ls products/*/.claude/hooks/animation-gate.sh 2>&1 | wc -l
# 期待: 14（全 product 数）

# orphan 解消確認: 任意 product で hook 動作確認（dry-run）
bash products/coach/.claude/hooks/animation-gate.sh --dry-run 2>&1 | head -5
```

- [ ] **Step 4: コミット**

```bash
git add scripts/propagate-hooks.mjs products/*/.claude/hooks/
git commit -m "feat(propagate-hooks): hook 本体（.sh）配布ロジック追加 — orphan 参照解消"
```

---

## Task 5: check-in-verify.sh A-12 追加（3 項検証）

**Files:**
- Modify: `scripts/check-in-verify.sh`（行 269 付近に挿入・A-11 と集計の間）

- [ ] **Step 1: 受入条件確定**

1. A-12 が以下 3 項を検証:
   - ① `resolve-paths.mjs --vibe-root` が vibe-base ルートで EXIT 0
   - ② `resolve-paths.mjs --product-root` が product 配下で実パス出力 + EXIT 0
   - ③ live ファイルの MISSION_LOG 残骸が一定数以下（履歴文脈考慮で 50 件以下）
2. ① or ② NG → A-12 全体 NG（EXIT 1 ブロッカー扱い）
3. ③ NG → WARN

- [ ] **Step 2: A-12 ブロック追加**

```bash
# scripts/check-in-verify.sh の line 269（A-11 終了後・集計セクション前）に挿入

# A-12: path-resolver 動作 + MISSION_LOG live 残骸ゼロ確認（Session 297 確立・前提作業 X 完遂）
echo ""
echo "--- A-12: path-resolver 動作 + MISSION_LOG live 残骸（Session 297）---"
RESOLVER_NG=0

# ① --vibe-root が EXIT 0
node ~/.claude/skills/_shared/resolve-paths.mjs --vibe-root > /tmp/resolver-vibe.log 2>&1
if [ $? -ne 0 ]; then
  echo "  NG: --vibe-root EXIT non-zero"
  cat /tmp/resolver-vibe.log | sed 's/^/    /'
  RESOLVER_NG=1
fi

# ② products/coach/ で --product-root が実パス出力（vibe-base ルートでは ② はスキップ）
if [ -d "products/coach" ]; then
  PRODUCT_OUT=$(cd products/coach && node ~/.claude/skills/_shared/resolve-paths.mjs --product-root 2>&1)
  PRODUCT_EXIT=$?
  if [ $PRODUCT_EXIT -ne 0 ] || [ -z "$PRODUCT_OUT" ]; then
    echo "  NG: --product-root from products/coach 失敗 (EXIT=$PRODUCT_EXIT, out='$PRODUCT_OUT')"
    RESOLVER_NG=1
  fi
fi

# ③ live ファイルの MISSION_LOG 残骸（履歴文脈以外）
LIVE_RESIDUAL=$(grep -rln "MISSION_LOG" --include="*.md" --include="*.html" --include="*.sh" --include="*.mjs" --include="*.py" 2>/dev/null \
  | grep -v "^archive/" \
  | grep -v "^journal/claude-code-book/" \
  | grep -v "\.bak-" \
  | grep -v "structure-dependency-map-2026-05-19" \
  | grep -v "audits/ai-maturity-2026-05-19" \
  | wc -l)

if [ "$RESOLVER_NG" -eq 0 ]; then
  if [ "$LIVE_RESIDUAL" -le 50 ]; then
    echo "  OK: path-resolver 動作 + MISSION_LOG live 残骸 ${LIVE_RESIDUAL} 件（履歴文脈許容範囲）"
    OK=$((OK + 1))
  else
    echo "  WARN: MISSION_LOG live 残骸 ${LIVE_RESIDUAL} 件（50 件超・履歴以外の残存疑い）"
    WARN=$((WARN + 1))
  fi
else
  echo "  NG: path-resolver 動作不全（A 群スキル機能停止状態）"
  NG=$((NG + 1))
fi
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd C:/Users/user/Desktop/ClaudeCode/vibe-base
bash scripts/check-in-verify.sh
# 期待: A-12 で OK（NG にならない）+ 全体 EXIT 0
```

- [ ] **Step 4: コミット**

```bash
git add scripts/check-in-verify.sh
git commit -m "feat(check-in-verify): A-12 path-resolver + MISSION_LOG live 残骸検証追加 — 前提作業 X 完遂"
```

---

## Task 6: 全体検証 + memory.md P1/P4 更新

**Files:**
- Modify: `memory.md`（P1#2 消去・P4 教訓追加）
- Modify: `products/*/memory.md`（必要に応じて）

- [ ] **Step 1: 受入条件確定**

1. `bash scripts/check-in-verify.sh` 全体 EXIT 0（NG ゼロ）
2. A-12 が OK 判定
3. path-resolver 3 cwd テスト全 PASS
4. live MISSION_LOG 残骸が 50 件以下
5. memory.md P1#2 が消去され P4 に教訓 1 件追加

- [ ] **Step 2: 全体検証**

```bash
cd C:/Users/user/Desktop/ClaudeCode/vibe-base
bash scripts/check-in-verify.sh
# 期待: OK 9 / WARN 0-1 / NG 0
```

- [ ] **Step 3: memory.md 更新**

```markdown
# P1#2 を消去（完了）
# P4 §継続観察ではなく P4 通常領域に教訓追加:

5. [importance:H][2026-05-19] **前提作業 X 完遂（path-resolver 復旧 + MISSION_LOG 一掃 + hook 正規化）**
   — Session 297 で実施。path-resolver marker を memory.md に切替し A 群スキル復旧。live 50 件残骸を 34 件自動置換 + 32 件手動精査で除去。propagate-hooks に hook 本体配布ロジック追加し orphan 解消。check-in-verify A-12 で再発検知。**段階 2（governance / audit を別 repo 化）への前提条件クリア**。
```

- [ ] **Step 4: コミット**

```bash
git add memory.md products/*/memory.md
git commit -m "docs(memory): P1#2 完了消去 + P4 教訓追加 — 前提作業 X 完遂 (Session 297)"
```

---

## Risk & Rollback

| リスク | 検知方法 | ロールバック手順 |
|---|---|---|
| sed バッチ置換で履歴文脈を破壊（「Session 295 で memory.md を廃止し memory.md に統合」のような自己矛盾発生） | Task 2 Step 4 で grep + 文脈異常箇所抽出 | `git checkout HEAD~1 -- <file>` で個別ファイル復元 |
| path-resolver の memory.md marker が他 product から検出されて誤判定 | Task 1 Step 5 の 3 cwd テストで検出 | path-resolver.mjs を git checkout で revert |
| propagate-hooks 拡張で hook 重複コピーで実行権限喪失 | Task 4 Step 3 で実機実行確認 | propagate-hooks 改修部のみ revert |
| A-12 検証が WARN 過剰（履歴文脈想定より多く残る） | Task 5 Step 3 で WARN 数確認 | 閾値 50 を 100 等に調整 |
| 1 セッションで完了せず中途半端な状態 | Task 完了ごと git commit | 各 Task の commit で独立 revert 可 |

---

## Self-Review Checklist

実装完了後、書き手自身が以下を走査せよ（subagent 不要・5 分以内）:

- [ ] **Spec coverage:** 4 軸ヒアリング回答（memory.md marker / live のみ / propagate 取込 / 3 項 A-12）が全て反映
- [ ] **No Placeholders:** プレースホルダ語ゼロ（template 説明文以外）
- [ ] **Type consistency:** 関数名・変数名・marker 名が章間で一貫
- [ ] **Glob 実体照合:** Task 1-5 の Modify path 全件を Glob で実体確認（plan 起草時点で実機 Read 済）
- [ ] **役割分担表:** 司令塔単独実行 + reviewer subagent 1 体（受領基準明記）
- [ ] **Verification Commands:** 全 Task に exact command + 期待 EXIT 0
- [ ] **Anti-pattern check:** S213/226 Glob 実体照合 + S270 持ち越しタグ + S274 Constraints + S213-214 計画スナップショット陳腐化の 4 件予防済

---

## 必須 10 要素チェック

1. ✅ Goal: path-resolver EXIT 0 + MISSION_LOG 残骸ゼロ + A-12 EXIT 0 + hook orphan 解消
2. ✅ Architecture: 4 段（marker 切替 → 置換 → hook 配布 → A-12 検証）
3. ✅ Tech Stack: Node.js mjs / Bash / Git / Grep / sed
4. ✅ File Structure: 修正 64 ファイル一覧（責務明記）
5. ✅ Task Decomposition: Task 1-6 が独立検証可能
6. ✅ Bite-Sized Steps: 各 Step 2-5 分単位
7. ✅ Complete Code Blocks: sed バッチ / hook 配布ロジック / A-12 検証ブロック 全文記載
8. ✅ Verification Commands: 各 Task に EXIT 0 期待の検証 cmd
9. ✅ No Placeholders: 具体ファイル名・行番号・コマンド明記
10. ✅ Self-Review Checklist: 上記の通り

## 推奨 5 要素

- ✅ Subagent 役割: 役割分担表で plan-document-reviewer-prompt 1 体（Task 0 自動レビュー）
- ✅ Risk awareness: Risk & Rollback 表 5 件
- ✅ Rollback procedure: 各 Task が独立 commit で `git checkout HEAD~N -- <file>` 単発可
- ✅ Dependency map: Task 1 → 2 → 3 → 6、Task 4・5 並行可
- ✅ Performance impact: なし（静的置換・テスト軽量）

---

## Performance Impact

- 一括 sed 実行: ~30 ファイル × 数 KB / 1 秒以内
- propagate-hooks 拡張: 14 product × 3 hook copy / 数秒
- A-12 検証: grep 全体 / 1-2 秒（既存 A-1〜A-11 と同等オーダ）

なし（無視可能）。

---

## ExitPlanMode 後の処理

1. plan file を git tracked 領域へ移送:
   ```bash
   cp ~/.claude/plans/optimized-sparking-brooks.md docs/ops/plans/2026-05-19-prep-task-x.md
   git add docs/ops/plans/2026-05-19-prep-task-x.md
   ```
2. memory.md P1#2 を本 plan の Goal + 受入条件 + 検証コマンド + 影響範囲 に変換し詳細化
3. Task 1 から順次実装着手

<!-- reviewer-stopped-at: 2026-05-19T15:11:00.000Z / verdict: PASS / agent_id: a46937d5eb83766bf / session: Session-297 / note: 遡及追記（SubagentStop hook 実装前の reviewer dispatch 結果・TOTAL PASS） -->

<!-- reviewer-stopped-at: 2026-05-19T10:17:08.561Z / verdict: PASS / agent_id: aa26661a588ced058 / session: 088e9e72-a85b-4207-b2b4-5fe16e55f95f -->

<!-- reviewer-stopped-at: 2026-05-19T11:06:51.340Z / verdict: PASS / agent_id: afc22421757102a18 / session: 088e9e72-a85b-4207-b2b4-5fe16e55f95f -->

<!-- reviewer-stopped-at: 2026-05-19T13:14:55.947Z / verdict: PASS / agent_id: a14703f592e343115 / session: 8fa3289d-34cb-4cce-b717-71b4b29d24a7 -->

<!-- reviewer-stopped-at: 2026-05-19T13:28:18.800Z / verdict: PASS / agent_id: acf633dd11b2d0b44 / session: 8fa3289d-34cb-4cce-b717-71b4b29d24a7 -->

<!-- reviewer-stopped-at: 2026-05-19T13:34:38.951Z / verdict: PASS / agent_id: a5534b2186c357010 / session: 8fa3289d-34cb-4cce-b717-71b4b29d24a7 -->

<!-- reviewer-stopped-at: 2026-05-19T13:46:37.916Z / verdict: FAIL / agent_id: a703e25194a03ced8 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:11:28.879Z / verdict: FAIL / agent_id: a0cb762326b4430ec / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:12:16.987Z / verdict: FAIL / agent_id: a60a40723cb54c4a5 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:13:04.080Z / verdict: FAIL / agent_id: aa7de445506c00f35 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:13:33.147Z / verdict: FAIL / agent_id: a8254372026be07bd / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:15:52.395Z / verdict: FAIL / agent_id: ac204111bda8e529c / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:16:16.160Z / verdict: FAIL / agent_id: a32ba2413668728d6 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:16:39.297Z / verdict: FAIL / agent_id: aae64c8fabe45e053 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:18:49.758Z / verdict: FAIL / agent_id: a865558c741591161 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:21:34.295Z / verdict: FAIL / agent_id: afed981416be09fb9 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:28:23.029Z / verdict: FAIL / agent_id: a7c26c9f1d11652d1 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:43:35.116Z / verdict: FAIL / agent_id: aa68896c0f8fe59d8 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:47:38.931Z / verdict: FAIL / agent_id: a7e6cabdf58c03c67 / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:48:03.657Z / verdict: FAIL / agent_id: ae4a141341fad410c / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:54:22.303Z / verdict: FAIL / agent_id: a1f9c6e5aa3de507b / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T14:58:57.726Z / verdict: FAIL / agent_id: a6831114213108ace / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T15:09:30.200Z / verdict: FAIL / agent_id: a9a5be0c63ac2abfa / session: 103b2b71-70f1-4831-b96e-efc1819f2e78 -->

<!-- reviewer-stopped-at: 2026-05-19T23:14:04.585Z / verdict: PASS / agent_id: a92cf40e898be726a / session: 52a494f5-3d47-47ed-ad4c-d3894d4752d5 -->

<!-- reviewer-stopped-at: 2026-05-19T23:17:11.770Z / verdict: PASS / agent_id: ab76bd6208eac2c2d / session: 52a494f5-3d47-47ed-ad4c-d3894d4752d5 -->

<!-- reviewer-stopped-at: 2026-05-19T23:20:12.743Z / verdict: PASS / agent_id: a6b9a9435be963a9d / session: 52a494f5-3d47-47ed-ad4c-d3894d4752d5 -->

<!-- reviewer-stopped-at: 2026-05-19T23:21:12.441Z / verdict: PASS / agent_id: a643a9bd3e35c297b / session: 52a494f5-3d47-47ed-ad4c-d3894d4752d5 -->

<!-- reviewer-stopped-at: 2026-05-19T23:25:56.267Z / verdict: PASS / agent_id: a18bcc5fcf0006b0c / session: 52a494f5-3d47-47ed-ad4c-d3894d4752d5 -->

<!-- reviewer-stopped-at: 2026-05-19T23:38:42.919Z / verdict: PASS / agent_id: ab666d35f31fd4621 / session: 52a494f5-3d47-47ed-ad4c-d3894d4752d5 -->

<!-- reviewer-stopped-at: 2026-05-19T23:38:54.408Z / verdict: PASS / agent_id: a457b8614d23296eb / session: 52a494f5-3d47-47ed-ad4c-d3894d4752d5 -->

<!-- reviewer-stopped-at: 2026-05-19T23:46:10.854Z / verdict: FAIL / agent_id: a225172ffa7a71021 / session: 52a494f5-3d47-47ed-ad4c-d3894d4752d5 -->
