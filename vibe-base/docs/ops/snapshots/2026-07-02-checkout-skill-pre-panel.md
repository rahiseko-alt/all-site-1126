---
name: checkout
description: セッション終了時の Check-out 工程を自動実行する。memory.md P1 更新 / failures.md 追記 / コミット前チェック / Check-out レポート MD 生成 / @ 参照追記 / EXIT までを順序固定で実行。
user-invocable: true
argument-hint: "[product-name]"
short_label: セッション終了ルーチン
usage_examples:
  - 「Check-out」
  - 「セッション終了」
  - 「キリよく締めて」
---

セッション終了の機械強制ルーチン。AI 自己規律不信原則 (memory P1.5) に基づき、Wave A (4 並列・read-only 検証) → Wave B (2 並列・集約 Write) の 2 wave 構造。

## Path Resolution (先頭で必ず実施)

```bash
VIBE_BASE_ROOT=$(node ~/.claude/skills/_shared/resolve-paths.mjs --vibe-root)
PRODUCT_ROOT=$(node ~/.claude/skills/_shared/resolve-paths.mjs --product-root)
```

本文中の `memory.md` / `docs/` / `tmp/` は **すべて `$VIBE_BASE_ROOT/` 配下**。引数 `[product-name]` 省略時は `$PRODUCT_ROOT` の basename を current product とする。

## 自 memory.md パス
- vibe-base 司令塔 (cwd = vibe-base ルート) → `$VIBE_BASE_ROOT/memory.md`
- プロダクト (cwd = `products/{X}/`) → `$VIBE_BASE_ROOT/products/{X}/memory.md`

## トリガー条件

- マスター発話「Check-out」「セッション終了」「キリよく締めて」「コミットして閉じよう」
- セッション終了前 (`/clear` / `/compact` / EXIT 直前)
- 三打席ルール抵触時 (CLAUDE.md §4)

---

## Wave A: 並列実行 (4 工程・read-only)

**全 4 工程を 1 メッセージ内で同時起動する** (orchestration-discipline.md 規律 1)。結果が揃ったら Wave B へ進む。

### A-1: コミット漏れ・意図しない差分の確認

orchestrator が Bash で直接実行:

```bash
git status --short
git diff --stat HEAD
```

確認観点 (該当あればマスター提示):
- unstaged ファイルの有無 (意図的残置か誤って漏らしたか判定)
- xlsx / settings.local.json / .env 等 機密候補ファイルの混入
- 想定外パスへの差分

### A-2: 機械検証 (テスト / 型 / lint / シークレット混入)

orchestrator が Bash 並列実行 → verify-agent (Haiku) で PASS/FAIL 判定:

orchestrator 側:
```bash
# product / 言語に応じて選択 (該当なしは skip)
npm test 2>&1; echo "EXIT_TEST=$?"
npm run typecheck 2>&1; echo "EXIT_TYPE=$?"
npm run lint 2>&1; echo "EXIT_LINT=$?"
# シークレット混入検査 (vibe-base 全体)
grep -rEn '(AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|xoxb-)' --include='*.{js,ts,mjs,json,md,html}' . 2>/dev/null | head -5
```

verify-agent 呼出 (推論ゼロ・PASS/FAIL のみ):
```
Agent(
  subagent_type: "verify-agent",
  description: "Check-out 機械検証 PASS/FAIL 判定",
  prompt: "以下の Bash 実行結果を受領済。各項目の EXIT code と出力を見て PASS/FAIL 表で返却。理由・改善案は不要。
    1. npm test : EXIT=<n>
    2. npm run typecheck : EXIT=<n>
    3. npm run lint : EXIT=<n>
    4. secret-grep : マッチ件数=<n> (期待値: 0)
  出力フォーマット: '1. <name> : PASS/FAIL'"
)
```

### A-3: 別 AI に成果物のチェックを依頼

code-reviewer (Sonnet) に最小粒度で依頼:

```
Agent(
  subagent_type: "code-reviewer",
  description: "Check-out 直前 diff レビュー",
  prompt: "対象: git diff HEAD
  観点 3 件: バグ / セキュリティ / 不要コード (デバッグ残留・dead code)
  出力: 1 件 1 行・file:line — 問題 のみ。理由・修正案は出さない。指摘 0 件なら 'no issues' を返す。"
)
```

### A-4: tmp/ 中間ファイルの捨てる/残す判定

orchestrator が Bash で実行:

```bash
ls -la tmp/ 2>/dev/null | head -50
```

判定基準 (該当別にマスター提示):
- **捨てる**: 一時集計 TSV / 中間 HTML / リクエスト用 JSON / 検証用 stub
- **昇格**: 調査結果 HTML → `docs/research-bank/` / 設計 plan → `docs/ops/plans/` / 1 回限り報告 → `docs/session-reports/`
- **判断不能**: マスターに 1 件ずつ確認

---

## Wave B: 集約 (2 工程・Wave A 結果が入力)

Wave A が全 4 工程完了したら 1 メッセージ内で B-1 + B-2 を同時起動。

### B-1: 引継ぎメモを下書きしてマスターに見せる

orchestrator が Write で `$VIBE_BASE_ROOT/docs/session-reports/YYYY-MM-DD-checkout.md` 生成（**Markdown 固定**。HTML は使わない＝次セッションの AI が @ 参照で読む際のトークン浪費・CSS ノイズを避けるため。2026-06-12 確定）。

必須セクション (テンプレ準拠・MD 見出し):
- **見出し + メタ**: タイトル + branch/HEAD + 「次セッションで本ファイル先頭から Read 必須」明示
- **🔴 最重要**: 最重要事項 (1-3 件・例: 破壊的変更 / 規律違反 / 復旧手順)
- **A. 本セッション TL;DR**: 完遂事項 5-10 件
- **B. 完了 commit 一覧**: hash + 種別 + 内容（MD 表）
- **C. 影響波及** (該当あれば・必読セクション)
- **D. 残作業** (次セッション着手対象・優先度 H/M/L 別)
- **E. 配備済 subagent / skill / hook**: 本セッション追加分
- **F. 本セッション生成レポート** (`tmp/` 配下): 次セッションで参照可
- **G. 次セッション初手**: 1-5 step + 機械検証結果サマリ (Wave A-2) + コードレビュー指摘件数 (Wave A-3)

Write 後、マスターに「引継ぎ MD 生成・確認お願いします」と提示。

### B-2: 永続メモに「今回の学び」を昇格

orchestrator が Edit で `$VIBE_BASE_ROOT/memory.md` (or `$PRODUCT_ROOT/memory.md`) 更新。

**書込頻度規律 (100% 必須 vs 条件付きの区別・無条件全書き禁止):**

| 領域 | 頻度 | 条件 |
|------|------|------|
| P1 引継ぎミッション | **毎回必須 (100%)** | 無条件。完了タスク削除 + 新規引継ぎ追加 |
| @ 参照 (B-2.5) | **毎回必須 (100%)** | 無条件。本セッションの引継ぎ MD で上書き |
| P2 ADR 索引 | 条件付き | 重大決定があった時のみ |
| P3 失敗事例 | 条件付き | 客観 7 基準のいずれか該当時のみ (非該当の教訓は `failures.md`) |
| P4 永続教訓 | 任意 | 教訓化したい時のみ |

> P1 + @ 参照 (B-2.5) + コミット (EXIT) は Check-out の必須工程。skip 禁止。
> P2-P4 は該当なしなら無記入でよい (無理に埋めるな・観察タスクは書くな)。

**Step B-2.1: P1 引継ぎミッション更新 (3 件枠)**
- P1 には「次セッションに引き継ぐべき作業状態・決定事項」のみ記載する
- スタイルルール・行動規範は記載しない（`~/.claude/CLAUDE.md` に移管済）
- ルール: 今セッションで完了したタスクは削除、新規に発生した引継ぎ事項は追加
- 「完了したか判定」は不要。次セッションで引き継ぐ事実だけを列挙する
- 各 entry に `[importance:H/M/L][YYYY-MM-DD]` タグ付与

**P1 エントリ形式（厳守）:**
```
[importance:H/M/L][YYYY-MM-DD] タスク名（60字以内） — plan: {path}
```
- 1行形式固定。narrative（経緯・背景・詳細）を P1 エントリに書くことは禁止
- plan path が存在する場合は必ず記載。ない場合は「— plan: なし」
- 枠数: 3件（4件以上になる場合は importance:L を plan ファイルに移動して削除）
- P1 冒頭に「> 直近 plan: {path}」行を記載すること
- `docs/standards/checklists/pc-checklist.md`（照合リスト）を変更した場合は同ファイルの `checklist-version` を更新すること（pc-checkin STEP 4 がこれを読む）

**archive 強制条件:**
- memory.md が 80行超 → P4 を archive/{agent}-memory-YYYYMM.md に退避してから P4 を pointer 1行に置換
- P3 合計 10行超 → 1件1行形式（[YYYY-MM-DD][基準N] 事象1行 / 根本原因: 1行 / 再発防止: 1行）に圧縮
- importance:L かつ 90日経過 → P1 エントリ削除

**Step B-2.2: P2 ADR 索引** (重大決定があれば)
- 新規 ADR を `docs/adr/NNNN-*.md` に作成 (Nygard 標準)
- memory.md P2 に 1 行索引追記 (6 件超で古い順削除)

**Step B-2.3: P3 失敗事例** (客観 7 基準該当時のみ)
- 7 基準: ①全体悪影響 ②git revert/reset ③三打席抵触 ④マスター差し戻し 3 件以上 ⑤プロセス kill ⑥Plan Mode 再入 ⑦機械検証 NG
- 該当外で教訓化したい → `failures.md` (1 失敗 1 行 / 200 行上限) へ
- 記述ルール: role/事象ベース・**個人名禁止** (SRE blameless)・根本原因 1 行 / 再発防止策 1 行

**Step B-2.4: P4 永続教訓** (任意・importance タグ付き)
- 110 行超で archive 候補 (importance L 優先・退避先 `archive/{agent}-memory-YYYYMM.md`)

**Step B-2.5: memory.md 冒頭 @ 参照を本セッションの引継ぎ MD で上書き**

```markdown
## 引継ぎレポート (次セッション必読)

@docs/session-reports/YYYY-MM-DD-checkout.md

> 次セッションは本ファイル冒頭の上記レポートを **必ず先に Read** してから着手すること。
```

**@ 参照の解決ルール（単一書式を強制しない）:**
- レポート置き場は3種いずれも正当: ルート `docs/session-reports/` / 製品ローカル `products/{product}/docs/` / 製品ローカル `ops/`。実体が在る場所に合わせて書く。
- 司令塔 memory.md・ルート保存 → `@docs/session-reports/...`（ルート基準）。製品ローカル保存 → 製品相対（例 `@docs/session-reports/...`=製品dir基準・`@ops/...`）。**実体と異なる場所に書き換えるな**（`session-reports/` 欠落等の誤記は `check-in-verify.sh` B-7 が NG 検出する）。
- レポート未作成の製品は @行を置かず `> 引継ぎレポート未作成（…）` のプレースホルダにする（B-7 は @行なしを skip）。

**⚠ MEMORY.md（auto-memory）には日付付き引継ぎ参照を書かない:**
- 引継ぎの単一正本は `vibe-base/memory.md` 冒頭の @参照（本 Step が毎回更新）。ADR-0002 で MEMORY.md=永続行動規範 / memory.md=セッション引継ぎと役割分担済。
- MEMORY.md 冒頭は `→ 最新の引継ぎは vibe-base/memory.md 冒頭の @参照を読め` の単一ポインタのみ。**二重に日付パスを書くと鮮度ドリフト（MEMORY.md だけ取り残される）が再発する**（2026-06-19 根治）。

---

## EXIT

### コミット

```bash
git status --short
git add {実体ファイル名・指定}
git commit -m "$(cat <<'EOF'
chore(memory): Check-out — session handover report + memory.md @ 参照更新

{本セッション要点 2-3 行}

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

prefix: `chore(memory):` 等 Conventional Commits 準拠。本文は要点 2-3 行 (詳細は MD 引継ぎレポート参照)。

### 最終確認 (機械検証で代替・主観排除)

Wave A-2 (verify-agent) の PASS/FAIL 表をそのまま EXIT 直前報告に転記:

```
Check-out 完了:
- commit: {hash}
- 引継ぎ MD: docs/session-reports/{date}-checkout.md
- 機械検証: PASS N/M (FAIL があれば項目名併記)
- コードレビュー指摘: {n} 件 (内容は引継ぎ MD F セクション参照)
- 次セッション残作業: H {n} 件 / M {n} 件 / L {n} 件
```

---

## 注意事項

- **マスター個人の行動ログ / 備忘録 / 人生計画 は memory.md に書くな** (vault 行動ログの専有領域)
- **agent ↔ agent 直接通信禁止** (引き継ぎは memory.md P1 経由のみ・マスター仲介禁止)
- **SESSION_JOURNAL.md は書込まない** (Session 295 廃止)
- **Wave A の verify-agent / code-reviewer はモデル自動割当**: agent frontmatter で `model: haiku` / `model: sonnet` 指定済・Check-out 側で指定不要

---

## 関連

- `pc-checkin` skill — セッション開始 (本スキルの対照)
- `.claude/rules/session-lifecycle.md` — Check-out 全規律 (正本)
- `.claude/rules/orchestration-discipline.md` — Wave 並列化規律 (規律 1) + verify-agent 自動連鎖 (規律 3)
- `failures.md` — 1 失敗 1 行 / 200 行上限の失敗事例集 (P3 7 基準非該当の教訓格納先)
