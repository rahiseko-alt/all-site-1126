# Claude Code 運用近代化 — 公式整合化 実行計画 + 診断資料（引継ぎ）

> **次セッション必読の引継ぎファイル。** 本ファイルは「①診断資料（この資料）」と「②実行計画」を一体化したもの。
> 2026-06-04 セッションで 5体並列リサーチ（公式docs + GitHub一次 + 識者二次）＋現状実測により作成。
> Gmail 下書き（件名「【診断書】vibe-base 運用 …」）に同一診断のメール版あり。

---

## Context（なぜこの計画が要るか）

マスターが「現運用がイマイチな感触」と提起。公式最新運用を 5体並列でリサーチし、現運用と比較した結果、
**体感劣化の主因は運用の質ではなく "重さ"（コンテキスト恒常圧迫）** と判明した。
個々の設計（permission3段・Worker/Evaluator分離・plan mode機械強制）は公式と高度に整合しており先進的だが、
**CLAUDE.md/rules の実効総量が公式の唯一の定量注意点「200行target・長いと半分を無視」に抵触**している。

本計画は **公式一次ソースで裏付く是正（❌3件）を最優先**とし、二次情報由来の仮説は「要実測」として分離する。

---

## 診断資料（この資料・出典階層分離版）

### 現状 実測スナップショット（2026-06-04）

| 項目 | 実測 | 公式基準 | 状態 |
|------|------|---------|------|
| root CLAUDE.md | 56行 | ≤200行 | ✅ |
| `.claude/rules/` | 27ファイル・1165行 | 必要時のみ | ⚠️ |
| product毎の@import | 9ルール常時注入（実効数百行/session） | path-scopedで節約 | ❌ |
| `.claude/hooks/` | 16本・全17productへpropagate（実質200+） | 毎回必要なものに限定 | ⚠️ |
| skills | 28件 | on-demand（数値上限は公式に無し） | ⚠️要実測 |
| agents | 9件 | — | ✅ |
| settings.json | 174行/deny60 | — | ✅ |
| settings.local.json | 53KB/allow401件 | 定期棚卸し | ⚠️要実測 |
| auto-memory | MEMORY.md 121行＋memory/153ファイル | 200行/25KB自動trim・既定ON | ⚠️ |
| products | 17 | — | — |

### 公式基準 判定集計
**✅整合9 / ⚠️要対応10 / ❌明確乖離3 / ❓未確認2**

### ❌ 公式一次ソースで裏付く明確乖離（3件・同一問題の3側面）
1. **CLAUDE.md/rules 実効総量が200行targetを大幅超過**（9rules常時@import）。公式「長いと半分を無視」（best-practices）に抵触。
2. **@import をコンテキスト節約目的で誤用**。公式仕様「importも起動時に文脈へ入る＝節約にならない」（memory）。
3. **`paths:` による path-scoped 化（公式機能）が未使用**。是正手段が手つかず。

### ⚠️ 要対応（公式裏付けが強い順）
- auto-memory機能（公式・既定ON）への寄せ替え＝文脈圧迫を構造的に解消
- 公式 Protected Paths（`.claude`/`.mcp.json`/シェル設定/`.git` を標準保護）と重複する独自 HARD BLOCK の撤去判定
- Stop hook 自動verify計画 × 既知バグ #65169（PostToolUse が Agent 完了で非発火）の事前検証
- permissionDecision `defer`・hookイベント31種・subagent新機能（`memory:`/`skills:`/`isolation:worktree`/Fork）の未活用
- `/simplify→/code-review` 改名（破壊的・v2.1.147）に伴う skill/rules 参照の陳腐化点検

### 二次情報の扱い（単独で是正根拠にしない）
- **公式を補強（方向性のみ採用）**: ルール過多→遵守低下／Hook Spam回避／curation over collection／deny50超脆弱性（v2.1.90修正）。**数値は鵜呑みにしない**。
- **公式裏付けなし（仮説扱い）**: Skills20件キャップ／14ルールで52%／500・1000行閾値／文脈70・85%／マルチエージェント95%不要。**公式に数値基準は存在しない**。

### ❓ 未確認（次セッションで確認）
- MCP Tool Search の有効状態（既定有効・要 `claude` 設定確認）
- インストール経路（npm非推奨→native installer・要 `claude --version` 確認）

---

## ゴール / EARS 意図文

- システムは、各 product CLAUDE.md がセッション開始時に常時注入するルール総量を、公式の 200 行 target に近づける形へ削減すること。
- システムは、該当作業時のみ必要なルールを `paths:` frontmatter による path-scoped rule へ移行し、常時 @import から外すこと。
- ゴールは「ルールの削除・規律の弱体化」ではなく、「**同じ規律を、より軽いロード方式で効かせる**」こと。規律内容は不変。

## 上位 plan からの constraint 変更
- なし（新規）。CLAUDE.md §1 Refactor-on-Write / §5 セルフガバナンスは不変。

## 影響範囲
- `.claude/rules/*.md`（frontmatter `paths:` 追加・本文不変）
- 全 product `CLAUDE.md` の `@import` 行（常時 import を path-scoped 移行分だけ削減）
- `~/.claude/projects/.../memory/MEMORY.md` + `memory/`（auto-memory 寄せ替え検討）
- `.claude/hooks/pre-edit.sh`（Protected Paths 重複分の撤去判定・**guardrail のためマスター手動編集前提**）
- `scripts/check-in-verify.sh`（path-scoped 移行の検証項目追加）

---

## 実装ステップ（Phase 制・各 Phase 完了でマスター判定）

### Phase 1 — 公式❌3件の解消（最優先・同一 Plan）
| # | 作業 | 方式 |
|---|------|------|
| 1-1 | 全27 rules を「基幹（常時）/ 作業限定（path-scoped）」に分類 | Read + 分類表作成。基幹候補=permission-defense/session-lifecycle/self-verification/plan-mode/orchestration-discipline。作業限定候補=web-design/lp-design/notebooklm/research-bank/coconala-listings/video-production/subagent-ops 等 |
| 1-2 | 作業限定 rules に `paths:` frontmatter 付与（公式 memory 仕様） | 例: web-design.md → `paths: ["**/*.html","**/*.css","**/*.tsx"]` |
| 1-3 | 全 product CLAUDE.md の該当 @import 行を削除（path-scoped 化で自動ロードに移行） | propagate-hooks.mjs 類似の一括 patch（canary 経由・本番一括書換規律に従う） |
| 1-4 | 実効ロード行数を `/memory` で実測し 200 行 target との差を記録 | before/after 比較 |

### Phase 2 — ⚠️公式裏付け強の対応（Phase 1 承認後）
| # | 作業 | 方式 |
|---|------|------|
| 2-1 | auto-memory 寄せ替えの可否検証（既定ON・200行/25KB自動trim） | 現 memory.md 手管理との役割分担を ADR 化 |
| 2-2 | 独自 HARD BLOCK（pre-edit.sh の `.claude/*` block）と公式 Protected Paths の重複撤去判定 | guardrail ゆえ**マスター手動編集**・撤去後の代替防御層を明示 |
| 2-3 | Stop hook 自動verify計画 × #65169 の事前検証（fixture方式・本番非破壊） | PostToolUse が Agent 完了で発火するか単体テストで確認 |

### Phase 3 — 要実測・❓未確認（Phase 2 承認後）
| # | 作業 | 方式 |
|---|------|------|
| 3-1 | skills 呼び出し頻度・settings.local allow 使用実績のログ取得 → 棚卸し判断 | `/usage` カテゴリ別内訳（v2.1.149+）活用。**二次の「20件」を理由に削らない・実測ベース** |
| 3-2 | `/simplify→/code-review` 等の改名に伴う参照陳腐化を grep 点検 | skill/rules 内の旧コマンド名検索 |
| 3-3 | MCP Tool Search 有効状態・インストール経路（npm/native）の確認 | `claude --version` 等 |

---

## リスク
- path-scoped 化で「本来常時必要なルールまで作業限定にする」誤分類リスク → 1-1 の分類はマスター承認を挟む
- 一括 @import 削除での product CLAUDE.md 破壊 → canary lib（`scripts/_lib/json-canary.mjs` 相当の md 版 or 慎重な Edit）+ dry-run
- guardrail hook の手動編集ミス → tmp に正本 Write → マスターが byte 正確コピー（feedback_hook-realworld-test-safety 厳守）

## テスト方針
- Phase 1: `/memory` で before/after の実効ロード行数を実測。全 product CLAUDE.md が構文健全（@import 解決）であることを確認。`bash scripts/check-in-verify.sh` EXIT 0。
- Phase 2-3: 各変更は fixture 方式で本番非破壊検証。guardrail 変更は単体テスト stub の PASS を完了判定とする（実機破壊検証は絶対に提案しない）。

## 受け入れ基準
1. ルール分類完了: 27 rules を「基幹/作業限定」に分類した表が存在し、マスター承認済み（grep で分類表ファイル存在確認）。
2. path-scoped 付与: 作業限定 rules に `paths:` frontmatter が付与され、`grep -l "^paths:" .claude/rules/*.md` が該当件数を返す。
3. @import 削減: 全 product CLAUDE.md の常時 @import 行数が before より減少（`grep -c "^@../../.claude/rules" products/*/CLAUDE.md` の合計が減少）。
4. ロード実測: `/memory` 実効ロード行数の before/after を記録し、200 行 target への接近を数値で提示。
5. 機械検証: `bash scripts/check-in-verify.sh` が EXIT 0（規律不変の確認）。
6. 規律不変: 各 rule の本文（規律内容）は変更ゼロ（`git diff` で frontmatter 行のみ変更を確認）。

## 承認後モード
- Phase 1 は Plan Mode で起案 → ExitPlanMode 承認 → implement-agent で実装 → verify-agent で受入基準機械検証（orchestration-discipline 規律3）。
- guardrail 編集（2-2）はマスター手動編集を計画に明記。

---

## 次セッション引継ぎ指示（@注入対象）
1. 本ファイルを最初に Read（memory.md 冒頭の @ 参照で自動注入）。
2. Phase 1-1（27 rules 分類）から着手。分類表をマスターに提示し承認を得てから 1-2 へ。
3. 「ゴール＝規律を軽いロード方式で効かせる・規律内容は不変」を厳守。削除・弱体化は禁止。
4. 二次情報の数値（20件キャップ等）を是正根拠に使わない。公式 ❌3件 を起点とする。
