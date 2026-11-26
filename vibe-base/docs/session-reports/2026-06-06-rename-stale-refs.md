# Phase 3-2: 改名参照の陳腐化 grep

> Agent I 成果物。2026-06-06。read-only 調査 + 本ファイル Write のみ。実改変なし（是正候補の一覧化が成果）。

---

## 検索対象

- 旧スキル名: `ui-clone` / `perfect-web-clone` / `reference-site-measure` / `hero-scroll-grid` / `lp-design`（旧 design 系 8 skill）
- 旧コマンド: `/simplify`（→ `/code-review` に改名）
- 対象ディレクトリ: `.claude/rules/` / `docs/` / `~/.claude/skills/`

---

## 1. `/simplify` → `/code-review` 改名の残骸

【実行済み】`.claude/rules/` および `docs/`（archive 含む）を grep: `/simplify` パターン

### ヒット一覧

| ファイル | 行内容 | 判定 |
|---------|--------|------|
| `docs/session-reports/2026-06-06-opmod-phase2-3-plan.md` | "旧コマンド名/旧スキル名の参照を grep: `/simplify`→`/code-review` 改名" | **有効**（本計画ドキュメント・改名記録として正当） |
| `docs/session-reports/2026-06-04-operation-modernization-handover.md` | "- `/simplify→/code-review` 改名（破壊的・v2.1.147）に伴う skill/rules 参照の陳腐化点検" | **有効**（診断書・経緯記録として正当） |
| `docs/session-reports/2026-06-04-operation-modernization-handover.md` | "| 3-2 | `/simplify→/code-review` 等の改名に伴う参照陳腐化を grep 点検 |" | **有効**（同上・タスク一覧） |

**結論: `/simplify` 旧名が `.claude/rules/` や active docs の指示文中に「誤って使われている」箇所はゼロ。**
session-reports 内は改名の経緯記録であり是正不要。

---

## 2. `ui-clone` / `ui-clone-sop` 参照

【実行済み】対象全ファイルを grep

### ヒット一覧（active files のみ・archive 除外）

| ファイル | 行内容 | 判定 |
|---------|--------|------|
| `.claude/rules/session-lifecycle.md` L195 | `旧 /ui-clone 系の機械ゲートは廃止` | **有効**（廃止を明示する記録・参照として正当）|
| `.claude/rules/web-design.md` L36 | `docs/ops/ui-clone-sop.md`（UIパターン分析フレームワーク・付録） | **是正候補**（後述 §4 で判定） |
| `docs/md-inventory.md` L70 | `廃止。/web-design へ統合。本ファイルは pointer のみ` | **有効**（廃止を正しく記録） |
| `docs/ops/product-cycle.md` v8.4 changelog | `フェーズ索引に ui-clone-sop を補完` | **有効**（changelog は歴史記録・改変不要） |
| `docs/ops/product-cycle.md` v8.5 changelog | `P1#6→/ui-clone` | **有効**（changelog・改変不要） |
| `docs/ops/ui-clone-sop.md` L1 | 廃止バナー本体 | **有効**（廃止宣言・本来の存在目的） |

**Archive ファイル（是正不要）:**
- `archive/2026-05-20-scripts-residual-sorting.md`
- `archive/session-journal-archive-2026-05-18.md`
- `archive/mission-log-2026-05-14-s283-coach.md` 等

---

## 3. `perfect-web-clone` / `reference-site-measure` / `hero-scroll-grid` 参照

【実行済み】

### ヒット一覧

| パターン | ファイル | 行内容 | 判定 |
|---------|---------|--------|------|
| `perfect-web-clone` | `products/review-analysis/bot/review-app/.claude/skills/perfect-web-clone/SKILL.md` | SKILL.md 本体が存在 | **是正候補**（後述 §5） |
| `perfect-web-clone` | `archive/*.md` 複数 | 旧作業記録 | 有効（archive・改変不要） |
| `reference-site-measure` | `docs/ops/reference-site-selection-sop.md` L97 | `旧 /reference-site-measure skill は廃止` | **有効**（廃止を明示する正当な記録） |
| `reference-site-measure` | `archive/2026-05-20-scripts-residual-sorting.md` | 旧作業記録 | 有効（archive） |
| `hero-scroll-grid` | なし | ヒットなし | 是正不要 |

---

## 4. `docs/ops/ui-clone-sop.md` の判定（「書いてある≠効いている」検証）

【実行済み】

**事実確認:**
- `docs/ops/ui-clone-sop.md` は実在する（`test -f` → OK）
- ファイル冒頭（L1）: `> **廃止・統合済み。** UI/WEB/LP デザインの正本は docs/standards/web-design-flow.md`
- ファイルの実内容: **付録A（UIデザインパターン分析フレームワーク）のみ** — 廃止前の本体は v4.0（2026-04-10）以降に除去済み
- `.claude/rules/web-design.md` L36: `docs/ops/ui-clone-sop.md`（UIパターン分析フレームワーク・付録）と明記

**判定: 有効（付録として残すことが意図的）**

根拠:
1. `ui-clone-sop.md` 冒頭の廃止バナーが「廃止済み skill の残骸」を防いでいる
2. `web-design.md` の参照が「付録」と明記しており、AI は「廃止済みスキルとして発火する」誤解は起こらない
3. 付録Aの「UIデザインパターン分析フレームワーク」はデザイン分析時に利用可能な有効資産
4. `docs/md-inventory.md` も「廃止・pointer のみ」と正確に記述済み

**「書いてある≠効いている」には**該当しない。廃止済みであることを正確に記述した上で付録を保持するのは意図的な設計。

---

## 5. `perfect-web-clone` SKILL.md（products 配下）

【実行済み】

`products/review-analysis/bot/review-app/.claude/skills/perfect-web-clone/SKILL.md` が実在。

**判定: 是正候補（要マスター確認）**

根拠:
- `products/review-analysis/` は現行プロダクト（廃止済みでない）だが、配下に `.claude/skills/` を持つのは異例
- `~/.claude/skills/` が user-level 正本（skill-deployment.md §5.3）のため、product 配下の skills は重複リスクあり
- `ui-ux-pro-max` は `~/.claude/skills/` に存在するが SKILL.md なし（→ `ui-ux-pro-max` の scripts が `perfect-web-clone` の前身の可能性）
- ただし review-analysis プロダクト固有の用途で残されている可能性もあり、削除は要マスター確認

---

## 6. `lp-design`（旧 design 系スキル）参照

【実行済み】`.claude/rules/lp-design.md` として現在も **active rule として存在・維持中**。

### 判定: 有効（廃止されていない）

- `.claude/rules/lp-design.md` は path-scoped rule として `products/*/lp/**` に適用中
- `docs/ops/lp-design-sop.md` も実在・`lp-design.md` から参照
- `docs/ops/reference-site-selection-sop.md` も実在
- `docs/ops/product-cycle.md` L159 に `lp-design-sop.md` 参照あり（有効）
- `docs/session-reports/2026-06-04-operation-modernization-handover.md` で path-scoped 化候補として挙げられているが、廃止候補ではない

---

## 7. `~/.claude/skills/` 内の廃止スキル参照

【実行済み】`ls ~/.claude/skills/` 実測: 廃止スキル（ui-clone / perfect-web-clone / reference-site-measure / hero-scroll-grid）は **user-level skills には存在しない**。

- `~/.claude/skills/ui-clone` → 不在
- `~/.claude/skills/perfect-web-clone` → 不在
- `~/.claude/skills/reference-site-measure` → 不在
- `~/.claude/skills/hero-scroll-grid` → 不在

廃止スキルは user-level からは除去済み。

---

## 総括：是正候補一覧

【実行済み】アクティブファイル（archive 除外）での是正候補のみ掲載。

| # | ファイル | パターン | 判定 | 推奨アクション |
|---|---------|---------|------|--------------|
| R-1 | `.claude/rules/web-design.md` L36 | `ui-clone-sop.md` 参照 | **有効（残す）** | 変更不要（「付録」と明記されており意図的） |
| R-2 | `products/review-analysis/bot/review-app/.claude/skills/perfect-web-clone/SKILL.md` | perfect-web-clone SKILL.md 実在 | **是正候補** | product 配下スキルの正当性を要マスター確認。不要なら削除、必要なら user-level へ移行 |
| R-3 | `docs/ops/reference-site-selection-sop.md` L97 | `旧 /reference-site-measure skill は廃止` 記述 | **有効（残す）** | 廃止明記は正当な歴史記録 |
| R-4 | `session-lifecycle.md` L195 | `旧 /ui-clone 系の機械ゲートは廃止` | **有効（残す）** | 廃止明記は正当 |

**純粋な「是正必要」判定: R-2 のみ（1件）**

---

## ui-clone-sop 最終判定

`docs/ops/ui-clone-sop.md` は：
- 廃止済みスキルの残骸（「書いてある≠効いている」）では**ない**
- 廃止宣言バナー付き付録として有効に機能している
- `web-design.md` からの参照も「付録」と明示されており AI 誤発火リスクなし
- **維持 — 是正不要**

---

v1.0 | 2026-06-06 | Agent I 初版（調査のみ・実改変なし）
