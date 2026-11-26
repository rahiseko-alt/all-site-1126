# vibe-base 2 周目調整プロジェクト 2026-04-28

> **目的:** 構造改革プロジェクト（Session 213-222、共通憲法 v5.7 / 自己検証 SOP v5.8）の蓄積調整事項 26 件を**根本原因グルーピング式**で構造解消し、自走バックストップ体制を完成させる。
>
> **作成:** Session 225 (2026-04-28) / Opus 4.7 司令塔
>
> **想定セッション数:** 2〜3 セッション（G3 → G2 → G1 → G4 → G5 → R の順）

---

## §0 プロジェクト全体像

### 構造改革計画書からの継続関係

構造改革プロジェクト本体（T1-T16）は完走したが、進行中に蓄積した違和感 26 件をマスター運用「1 周終わってからまとめて再修正案」の方針で先送りしていた。本プロジェクトはその回収プロジェクト。

**重要:** 構造改革と同じ「個別タスク積み上げ」式を取らず、**根本原因グルーピング式**で進める。理由は Session 220-221 で「タグだけ進める」「書いてある≠効いている」のアンチパターンが改革プロジェクト自身でも再発したため、症状処理ではなく構造解消が必要。

### ゴール

1. **C カテゴリ 19 件を 5 メタルール改修 + 3 個別対応で構造解消**
2. **自己検証 SOP v5.8（Session 225 新設）の実運用を立ち上げ** — 各タスクで §A〜F の各区切りを経由
3. **A/B カテゴリ 7 件は記録のみ**（既解消 / 部分解消 / モニタ要）

### 成功基準

- ☐ G1〜G5 全タスク ✅
- ☐ R1〜R3 全タスク ✅
- ☐ 自己検証 SOP §A-1 機械検証が各タスクで EXIT 0
- ☐ 26 件全件のステータスが計画書付録で確定
- ☐ 共通憲法バージョンバンプ（必要に応じて v5.8 → v5.9）

### 完了マーカー

- 最終コミット: `feat(ops): complete second-cycle adjustments 2026-04-28 (G1-G5 + R1-R3)`
- MISSION_LOG: `## 2 周目調整プロジェクト 完了 [日時]`

### ✅ Session 225 で 1 セッション完走（2026-04-28）

| タスク | コミット | 影響 |
|---|---|---|
| G3 | `1f227c7` | CLAUDE.md v5.8 → v5.9（§3 SOP 索引分離 + sop-index.md 新設） |
| G2 | `a3f4721` | agent-rules.md v3.7 → v3.8（例外節 4 項目化、純増禁止） |
| G1 | `c9b7530` | product-cycle.md v9.3 → v9.4（テンプレ表統一 + CL 集約方針）|
| G4 | `5f96794` | product-cycle.md v9.4 → v9.5（種別 6→5 種に正規化） |
| G5 | `97d4114` | runbook/cost-config/backup-config テンプレ + p4-zero-procedure 新設 |
| R1 | (G4 同伴) | 統計テーブル整合 |
| R2 | (記録のみ) | 案 C 棚上げ確定 |
| R3 | (本コミット) | memory/feedback_plan-evolution.md + MEMORY.md P2 索引 |

**26 件 全件ステータス確定**: A 既解消 3 / B モニタ要 4 / C 解消 19 = 26 ✓

K3「計画書 ≠ 現状」を 2 度検知（G3 hook 60 行上限 / G2 見出し実態違い）→ 修正案承認 → 復帰の流れが自己検証 SOP §A-1 / §B-4 で機能した初の事例。R3 でこのパターンを Plan Mode 逸脱運用ルールとして memory に明文化。

---

## §1 タスク一覧 + 着手順 + 進捗テーブル

### 進捗テーブル

| ID | タスク | 含む項目 | 状態 | 担当セッション | 完了日 |
|---|---|---|---|---|---|
| G3 | §3 SOP 索引の役割再定義 | #8 #9 | ✅ | Session 225 | 2026-04-28 |
| G2 | 「純増」「参照解釈」アンチパターン構造化 | #11 #14 | ✅ | Session 225 | 2026-04-28 |
| G1 | テンプレ表の構造一貫性整備 | #6 #7 #12 #15 #18 | ✅ | Session 225 | 2026-04-28 |
| G4 | タスク種別 + モデル行の正規化 | #1 #2 #4 #5（+#17 同伴） | ✅ | Session 225 | 2026-04-28 |
| G5 | D 観点の実体不在解消（仕組み設計） | #24 #25 #26 | ✅ | Session 225 | 2026-04-28 |
| R1 | 統計テーブル整合（数値メンテ） | #3 | ✅ | Session 225 | 2026-04-28 |
| R2 | paths glob 過剰捕捉対応 | #13 | ✅ | Session 225 | 2026-04-28 |
| R3 | Plan 逸脱運用ルール明文化 | #23 | ✅ | Session 225 | 2026-04-28 |

**状態凡例:** ☐=未着手 / ⏳=実施中 / ✅=完了 / ⛔=詰まり

### 着手順 + 依存関係

```
[起点] G3 (§3 役割再定義)
   │
   ├→ G2 (アンチパターン構造化、agent-rules.md 改修)
   │     │
   │     ├→ G1 (テンプレ表統一、product-cycle.md 改修)
   │     │
   │     └→ G4 (種別正規化、product-cycle.md 改修)
   │
   └→ G5 (D 観点実体化、仕組み設計) ← 独立、いつでも着手可
           │
           ├→ R1 (G4 同伴コミット)
           ├→ R2 (G5 同伴 or 独立)
           └→ R3 (memory 記録のみ、最終)
```

### 推奨着手順

1. **第 1 セッション:** G3 → G2（メタルール基盤）
2. **第 2 セッション:** G1 → G4 → R1（同伴）
3. **第 3 セッション:** G5 → R2 → R3 + 完了処理

---

## §2 タスク詳細

> **指示書フォーマット:** `agent-task-protocol.md §5` 形式に準拠。各タスクは自己完結。

---

### G3: §3 SOP 索引の役割再定義

#### 何を変えるか
`CLAUDE.md` §3 SOP 運用テーブルの役割定義を再構築。「自動注入経路あり/なし」で表分離 + 登録基準明文化。

#### Before
- §3 冒頭コメント「自動注入対象外、必要時に直接参照せよ」
- 表内に `incident-response-sop.md` が登録（しかし実体は `.claude/rules/incident.md` 経由で自動注入される）→ 矛盾
- T2/T3（backup-strategy / cost-budget）は §3 未登録（T1 のみ登録）→ 非対称

#### After
- §3 を 2 表に分離:
  - **表 A: 自動注入経路あり**（`.claude/rules/*.md` 経由で paths 自動注入される SOP）
  - **表 B: 自動注入経路なし**（必要時に直接参照する SOP）
- 登録基準を §3 冒頭に明文化:
  - 表 A 登録基準: `.claude/rules/<rule>.md` で paths 注入される SOP
  - 表 B 登録基準: paths 注入なし、エージェント判断で参照する SOP
- T2/T3 を表 A に追加（自動注入されるため）

#### 受入条件
- [ ] `docs/ops/sop-index.md` 新設（表 A + 表 B + 参照資料 + 登録基準）
- [ ] CLAUDE.md §3 は索引参照のみに縮小（CLAUDE.md 60 行上限 hook 制約に従う）
- [ ] T1/T2/T3 の 3 SOP が全て sop-index.md 表 A に登録（対称性確保）
- [ ] 登録基準が sop-index.md に明文化
- [ ] 共通憲法バージョンバンプ（v5.8 → v5.9）
- [ ] revision-history.md 追記

> **計画書訂正履歴**: 当初 After 設計「CLAUDE.md §3 を表 A/B 2 表構成」は CLAUDE.md 60 行上限 hook と矛盾し、Session 225 G3 実装中に hook ブロックで検知。修正案 A（§3 索引最小化 + sop-index.md 別ファイル）にマスター承認で変更。これは自己検証 SOP K3「計画書スナップショット陳腐化」パターンの実例で、計画書作成時に hook 制約を事前確認していなかったことが原因（2 周目調整事項として追記候補）。

#### 検証コマンド
```bash
test -f docs/ops/sop-index.md
grep -q "sop-index.md" CLAUDE.md
grep -c "incident-response-sop.md\|backup-strategy-sop.md\|cost-budget-sop.md" docs/ops/sop-index.md  # 3 以上
grep -q "v5.9" CLAUDE.md
[ "$(wc -l < CLAUDE.md)" -le 60 ]  # CLAUDE.md 60 行上限遵守
```

#### スコープ外
- 表 A/B の SOP 本体改修
- 個別 rule の改修

#### 完了マーカー
コミット: `feat(constitution): split §3 SOP index by auto-injection path (G3, v5.9)`
想定時間: 25 分

---

### G2: 「純増」「参照解釈」アンチパターン構造化

#### 何を変えるか
`docs/ops/agent-rules.md` に **#10 例外節を拡張**して、メタルール 3 件を統合明文化:
1. 「**参照** vs **項目追加**」の判別ルール（#11 受入条件曖昧性対策）
2. **CL バンプ判断基準**（#14 タスク追加=バンプ／CL項目追加=据え置き の非対称解消）
3. **種別純増禁止ルール**（メタルール「Refactor-on-Write」の明示具体化）

#### Before
- agent-rules.md #10 例外節（Session 216 T10 で追加）: CL 項目数追加権限を司令塔に限定
- 「参照」と「項目追加」の判別ルールが不在 → エージェント解釈依存
- バンプ判断（タスク追加 vs CL 項目追加）の基準が不在
- 種別純増の判断基準が「Refactor-on-Write」のみ抽象的

#### After
agent-rules.md #10 例外節を以下のように拡張:

```markdown
### #10 例外節（v3.7 → v3.8）

**1. CL 項目数追加権限**
- CL-1〜CL-15 のレビュー項目数の追加は **vibe-base 司令塔セッションでのみ可**
- 追加時は `docs/ops/structural-reform-*.md` または同等の合意文書への記載必須

**2. 「参照」vs「項目追加」判別ルール（v3.8 新設）**
- 受入条件文言「**○○ から参照**」 = `**必読:**` 行追加で完結。項目追加禁止
- 受入条件文言「**項目数を N → M に拡張**」 = 項目追加 OK（権限あり）
- 迷ったら計画書本体に明示記載があるか確認、なければマスター質問

**3. CL バンプ判断基準（v3.8 新設）**
- タスク数追加 → SOP バージョンバンプ必須
- CL 項目数追加 → SOP バージョンバンプ必須（v3.8 で統一）
- 必読行追加のみ → バンプ任意（軽微変更）

**4. 種別純増禁止ルール（v3.8 新設）**
- 既存種別（自動/QA/手動/レビュー/ゲート）への分類を最優先
- 純増する場合は計画書または agent-rules.md への根拠記載必須
- 「設計」種別は今後の追加を禁止（既存 P1#3a は v3.8 移行期に「自動」へ再分類検討、G4 で実施）
```

#### 受入条件
- [ ] agent-rules.md #10 例外節が 4 項目構成に拡張
- [ ] バージョン v3.7 → v3.8 にバンプ
- [ ] 「参照 vs 項目追加」判別ルール明記
- [ ] CL バンプ判断基準明記
- [ ] 種別純増禁止ルール明記
- [ ] 自己検証 SOP §B-3 純増判定との整合性確認

#### 検証コマンド
```bash
# 計画書訂正（K3）: 実態は「### 例外節（テンプレート順守 #10 の補足）」、当初記載「### #10 例外節」は実態と異なるため訂正
grep -A 30 "### 例外節" docs/ops/agent-rules.md
grep -q "v3.8" docs/ops/agent-rules.md
grep -q "「参照」vs「項目追加」" docs/ops/agent-rules.md
grep -q "CL バンプ判断基準" docs/ops/agent-rules.md
grep -q "種別純増禁止ルール" docs/ops/agent-rules.md
```

#### スコープ外
- 既存 P1#3a 種別の再分類（G4 で実施）
- 個別 SOP のバージョンバンプ（各 SOP 改修時に実施）

#### 完了マーカー
コミット: `feat(rules): expand #10 exception clause with anti-pattern meta rules (G2, v3.8)`
想定時間: 30 分

---

### G1: テンプレ表の構造一貫性整備

#### 何を変えるか
`docs/ops/product-cycle.md` の「このフェーズで使うテンプレート」表を**全フェーズ統一フォーマット必須化**:
1. P4 にテンプレ表新設（#7、現状不在）
2. P1 テンプレ表に冪等性 CL 追加（#6、発火タイミング明示）
3. CL 本体の集約方針確定（#18、§10 内集約 vs `docs/standards/checklists/` 分離）
4. CL-1 必読行肥大化解消（#12、フェーズ別テンプレ表に集約）
5. pc-progress.html 不在プロダクト（aiueo/affiliate-lp/x-poster-gas）の扱い計画書化（#15）<!-- microscope → 廃棄済み 2026-04-29 -->

#### Before
- P4 にテンプレ表が存在しない
- P1 テンプレ表に冪等性 CL（T5 で新設）が「AI への指示テンプレート列にのみ」記載 → 発火タイミング曖昧
- CL-1 必読行が `test-template-guide.md` + `idempotency-checklist.md` の 2 行（今後さらに増えるリスク）
- CL 本体は §10 内集約（CL-1〜CL-15）と `docs/standards/checklists/` 分離（冪等性/ライブラリ）が混在
- 計画書 §0 で pc-progress.html 不在 4 プロダクトの扱い未明示（T15 対象を 12 件に絞ったが正式宣言なし）

#### After
1. **P4 テンプレ表新設** — 他フェーズ（P0/P1/P2/P3）と同フォーマット。runbook テンプレ + backup-config.md + cost-config.md を含める
2. **P1 テンプレ表に冪等性 CL を独立行追加** — 発火タイミング = P1#3a「設計」着手時 と明示
3. **CL 集約方針確定**:
   - 短い CL（5 項目以下）: §10 内集約
   - 長い CL（6 項目以上）: `docs/standards/checklists/` に分離
   - 既存 CL-14（12 項目、T8 で 7→12 拡張）は `docs/standards/checklists/` への分離検討（後続セッション）
4. **CL-1 必読行をテンプレ表に集約** — `test-template-guide.md` / `idempotency-checklist.md` を P1 テンプレ表に移動、CL-1 必読行は最小化
5. **計画書に「pc-progress.html 不在プロダクト」の扱い節を新設** — aiueo は HTML 移行待ち、affiliate-lp は PC 表組込予定なし、x-poster-gas は廃棄済み（x-bot に置換）、microscope は廃棄済み（2026-04-29）と正式宣言

#### 受入条件
- [ ] product-cycle.md P4 セクションに「このフェーズで使うテンプレート」表が存在
- [ ] P1 テンプレ表に冪等性 CL が独立行で記載、発火タイミング = P1#3a と明示
- [ ] CL 集約方針が product-cycle.md §10 冒頭に明記
- [ ] CL-1 必読行が 1 行以下に縮小（テンプレ表へ移動）
- [ ] structural-reform-2026-04-27.md §0 に pc-progress.html 不在 4 プロダクトの扱い節新設
- [ ] product-cycle.md バージョンバンプ（v9.3 → v9.4、agent-rules.md v3.8 のバンプ判断基準適用）

#### 検証コマンド
```bash
grep -A 20 "## P4" docs/ops/product-cycle.md | grep -q "このフェーズで使うテンプレート"
grep -A 20 "## P1" docs/ops/product-cycle.md | grep -q "idempotency-checklist"
grep -B 2 -A 10 "^### CL-1" docs/ops/product-cycle.md  # 必読行 1 行以下確認
grep -q "pc-progress.html 不在" docs/ops/structural-reform-2026-04-27.md
grep -q "v9.4" docs/ops/product-cycle.md
```

#### スコープ外
- 既存 CL-1〜CL-15 の `docs/standards/checklists/` 分離（後続セッションで個別判断）
- runbook テンプレ本体作成（G5 で実施）

#### 完了マーカー
コミット: `feat(ops): unify template tables across phases + CL aggregation policy (G1, v9.4)`
想定時間: 60 分

---

### G4: タスク種別 + モデル行の正規化

#### 何を変えるか
`docs/ops/product-cycle.md` のタスク種別を 5 種に正規化（純増解消）+ 推奨モデル行を新タスクに同期 + 統計テーブル整合（#17 同伴）:
1. P4#0 種別「ゲート」を「自動」または「レビュー」に再分類（#1）
2. P1#3a 種別「設計」を「自動」に再分類（#2、Session 216 で純増した種別を解消）
3. P1 推奨モデル行に #3a 追加（#4）
4. P4 推奨モデル行に #0 追加（#5）
5. **同伴**: 統計テーブルの P4 ゲート 2 構成違和感解消（#17）

#### Before
- 種別 6 種（自動/QA/手動/レビュー/ゲート/設計）— Session 216 で「設計」純増
- P4#0 がゲート種別（P4#5 と 2 ゲート構成、構造的違和感）
- P1 推奨モデル行: `#0 中級 / #1-5 Opus / #6a...` → #3a 不在
- P4 推奨モデル行: `#1-2 中級 / #3-4 Opus / #5 Opus` → #0 不在
- 統計テーブル（v9.3 で更新済み）: P1:18 / P4:6 / 合計:76 / ゲート:5（P2#27, P4#0, P4#5 の 3 ゲートだが、テーブル上ゲート数が不明瞭）

#### After
1. **P4#0 種別を「レビュー」に変更** — CL-16「運用準備チェック」と整合、P4#5 の単独ゲート構成に戻す
2. **P1#3a 種別を「自動」に変更** — 「設計」種別を廃止、5 種類に戻す
3. **P1 推奨モデル行**: `#0 中級 / #1-3 Opus / #3a 中級 / #4-5 Opus / #6a 中級 / #6b 中級 / #7-13 Opus`
4. **P4 推奨モデル行**: `#0 中級 / #1-2 中級 / #3-4 Opus / #5 Opus`
5. **統計テーブル更新**: P1:18 / P4:6 / 合計:76 / ゲート:**2**（P2#27, P4#5）
6. **既存 PC 表 12 件の影響**: 「設計」種別を使用していた pc-progress.html を「自動」に再分類するか、過渡期として現状維持か → マスター承認事項

#### 受入条件
- [ ] P4#0 種別が「レビュー」に変更
- [ ] P1#3a 種別が「自動」に変更
- [ ] P1/P4 推奨モデル行に #3a/#0 追加
- [ ] 統計テーブル整合（ゲート数 2 で確定）
- [ ] product-cycle.md バージョンバンプ（v9.4 → v9.5、構造変更）
- [ ] 既存 PC 表 12 件への影響処理がマスター承認済み

#### 検証コマンド
```bash
grep -A 2 "P4#0" docs/ops/product-cycle.md | grep -q "レビュー"
grep -A 2 "P1#3a" docs/ops/product-cycle.md | grep -q "自動"
grep -E "推奨モデル.*#3a|推奨モデル.*#0" docs/ops/product-cycle.md
grep -q "ゲート.*2\|ゲート: 2" docs/ops/product-cycle.md
grep -q "v9.5" docs/ops/product-cycle.md
```

#### スコープ外
- 既存 PC 表 12 件の「設計」→「自動」再分類（マスター承認後、個別 Edit）
- pc-template.html の種別 CSS 変更（`--t-design` 削除等は v9.5 同期で実施）

#### 完了マーカー
コミット: `feat(ops): normalize task types (P4#0=review, P1#3a=auto) + stats table (G4, v9.5)`
想定時間: 50 分

---

### G5: D 観点の実体不在解消（仕組み設計）

#### 何を変えるか
構造改革 T16 で発見された D 観点全プロダクト不在（D1 / D2 / D3 / D4）に対し、**司令塔としての仕組み設計**を行う。個別プロダクトの実体作成はプロダクトエージェント担当（司令塔は引き継ぎ可能な状態にする）:
1. **runbook.md テンプレ**作成（#24、D4 障害対応プロトコル）
2. **cost-config.md テンプレ**作成（#25、D2 予算アラート設定）
3. **backup-config.md テンプレ**作成（#26、D1 バックアップ手順）
4. **P4#0 着手フロー**ドキュメント化（プロダクトエージェントが「P4#0 を抜ける」手順）

#### Before
- runbook.md / cost-config.md / backup-config.md テンプレが存在しない
- 各プロダクトエージェントが P4#0 着手時に何をすればよいか曖昧
- 既存 SOP（incident-response-sop.md / backup-strategy-sop.md / cost-budget-sop.md）は詳細版だが、テンプレ雛形が独立していない

#### After
1. **`docs/standards/templates/runbook-template.md`** 新設 — incident-response-sop.md §7 の runbook テンプレを独立化
2. **`docs/standards/templates/cost-config-template.md`** 新設 — cost-budget-sop.md §5 のテンプレを独立化、予算アラート設定スクリーンショット添付欄を含む
3. **`docs/standards/templates/backup-config-template.md`** 新設 — backup-strategy-sop.md §6 のテンプレを独立化
4. **`docs/ops/p4-zero-procedure.md`** 新設 — P4#0「運用 Runbook 整備」をプロダクトエージェントがどう抜けるかの手順書（D 観点 4 件 × チェック項目 + マスター承認フロー）
5. **product-cycle.md P4#0 から各テンプレへの参照リンク追加**（G1 で新設した P4 テンプレ表に統合）

#### 受入条件
- [ ] 3 テンプレ（runbook / cost-config / backup-config）が `docs/standards/templates/` に存在
- [ ] `docs/ops/p4-zero-procedure.md` 存在
- [ ] product-cycle.md P4#0 から各テンプレ参照リンク追加
- [ ] 各テンプレに「プロダクトでコピーして使う」前提の指示記載
- [ ] vest1 規約（標準テンプレ命名規則）遵守

#### 検証コマンド
```bash
test -f docs/standards/templates/runbook-template.md && echo "RUNBOOK_OK"
test -f docs/standards/templates/cost-config-template.md && echo "COST_OK"
test -f docs/standards/templates/backup-config-template.md && echo "BACKUP_OK"
test -f docs/ops/p4-zero-procedure.md && echo "P4_PROCEDURE_OK"
grep -q "runbook-template.md" docs/ops/product-cycle.md && echo "REF_OK"
```

#### スコープ外
- 個別プロダクトの runbook.md / cost-config.md / backup-config.md 実体作成（プロダクトエージェント担当）
- ai-concierge D1 OUT / D4 OUT の解消（プロダクトエージェント代行）

#### 完了マーカー
コミット: `feat(standards): add D-perspective templates + P4#0 procedure (G5)`
想定時間: 60 分

---

### R1: 統計テーブル整合（数値メンテ）

#### 何を変えるか
G4 で統計テーブルを更新するため、**G4 と同伴コミット**で実施。独立タスクではない。

#### 内容
G4 受入条件「統計テーブル整合（ゲート数 2 で確定）」に統合済み。

---

### R2: paths glob 過剰捕捉対応 ✅

#### 採用案
**案 C（影響軽微として記録のみ、着手不要）** — Session 225 で司令塔自己判断。

#### 判断根拠
- テスト編集時に rate-limit rule が注入されても、害ではなく「テストでも rate-limit を考慮」は良い習慣
- 案 A（exclude パターン）は glob 設計の手間が利益を上回る
- 影響軽微で着手コストが利益を上回る

#### 将来対応
将来 rule 注入が実害（パフォーマンス低下・誤注入）を生じた時点で案 A 実装を再検討。記録のみで完了。

---

### R3: Plan 逸脱運用ルール明文化 ✅

#### 完了内容
- `memory/feedback_plan-evolution.md` 新設（Plan は進化を許容、計画書本体は最小訂正、進捗テーブル + MISSION_LOG で実態反映、スコープクリープと合理的進化を区別）
- MEMORY.md P2 参照索引にエントリ追加（Session 225 G3/G2 で実体験した K3 計画書スナップショット陳腐化パターンも同じ枠組みで処理する旨を記載）

#### 受入条件
- [x] `memory/feedback_plan-evolution.md` 存在
- [x] MEMORY.md P2 索引にエントリ追加

---

### A. 既解消（記録のみ）

| # | 項目 | 解消経路 |
|---|---|---|
| 16 | 計画書 §0「全 17 プロダクト」陳腐化 | Session 222 で整合更新 |
| 19 | x-poster-gas retire | Session 223 で完全破棄 + x-bot 新設 |
| 20 | PC 表 v8.0 系 5 件の構造同期 | Session 222 T15 完走 |

### B. 部分解消・モニタ要（記録のみ）

| # | 項目 | 状態 / 対応経路 |
|---|---|---|
| 10 | T11 先回り良例 | メタ知見記録（R3 同伴で memory 化検討） |
| 17 | P4 ゲート 2 構成違和感 | G4 内同時解消 |
| 21 | タグだけ進める再発 | 自己検証 SOP §A-1（Session 225）で対応済み |
| 22 | ai-concierge 規律違反 | ai-concierge プロダクトエージェント引き継ぎ |

---

## §3 セッション跨ぎ運用ルール

### 基本原則
- 各タスク完了時に**必ずコミット** + **MISSION_LOG に「G## 完了」記録**
- 次セッション開始時、Check-in 直後に本ファイル `docs/ops/second-cycle-adjustments-2026-04-28.md` を読む
- 進捗は §1 進捗テーブルで管理（☐/⏳/✅/⛔）

### 自己検証 SOP の運用組み込み（Session 225 新設、本プロジェクトで実運用立ち上げ）

各タスクで自己検証 SOP `docs/ops/self-verification-sop.md` の各区切りを必ず経由:

| 区切り | 本プロジェクトでの適用 |
|---|---|
| **§A. Check-in** | A-1 機械検証で計画書記述（バージョン番号・パス）と現状ファイル整合確認。特に G1/G4 で product-cycle.md バージョンバンプ前後の内部定数照合 |
| **§B. 着手前** | B-1 受入条件箇条書き、B-3 純増判定（G2 で確立した「参照 vs 項目追加」判別ルールを適用）、B-4 参照経路生存確認（G3 改修後の §3 表 A/B 整合確認） |
| **§C. 実装中** | C-1 各 Edit を受入条件 #X に紐付け、C-4 hook 順序（rule → SOP）。新規 rule 作成は G3/G2 のみ |
| **§D. 完了判定前** | D-1 検証コマンド全 EXIT 0、D-3 実体ファイル存在（G5 のテンプレ 4 件）、D-5 grep 整合（G1/G4 のバージョンバンプ） |
| **§E. コミット前** | E-2 意図しない変更の混入なし、E-4 MISSION_LOG vs git diff-stat 一致 |
| **§F. Check-out** | F-1 次 AI が MISSION_LOG だけで再開可能か、F-3 plan file 参照禁止 |

### NG 検知時の即時対応
自己検証 SOP §2.3 のフロー（停止 → 報告 → 合意 → 修正 → 再検証 → 再開 → 記録）を遵守。

### 低能モデルが引き継ぐ場合の追加ガード
- 各タスク詳細は **完全自己完結**（パス・コマンド・受入条件が指示書内に全て記載）
- 推測・ハルシネーション防止: 「Before」「After」「受入条件」を厳密に守る
- 不明点はマスター質問を **必ず行う**
- 検証コマンドが全件 OK 出力するまで「完了」と称してはならない

---

## §4 完了基準（プロジェクト全体 DONE）

### 全タスク完了の検証
```bash
# G1〜G5 + R1〜R3 の各検証コマンドを順次実行
bash docs/ops/second-cycle-verify.sh  # ※最終セッションで作成（任意）
```

### 最終確認
- [ ] 進捗テーブル全件 ✅
- [ ] 各検証コマンド全件 OK
- [ ] 26 件全件のステータスが計画書付録で確定
- [ ] 改訂履歴 `docs/ops/revision-history.md` に「2 周目調整 2026-04-28 完了」記載
- [ ] MISSION_LOG: `## 2 周目調整プロジェクト 完了 [日時]`

---

## §5 ロールバック手順

### 部分ロールバック（特定タスクのみ取り消し）
```bash
git log --oneline | grep "(G##)\|(R##)"
git revert <commit-hash>
# 進捗テーブルを ✅ → ☐ に戻す
```

### 全面ロールバック（プロジェクト全体取り消し）
```bash
git log --oneline | head -20  # 開始時点のコミット特定
git reset --hard <開始時点のcommit-hash>  # ⚠️ destructive、マスター承認必須
```

---

## 付録: 26 件 ↔ カテゴリ対応表

| # | 項目 | カテゴリ | グループ |
|---|---|---|---|
| 1 | P4#0 種別「ゲート」の妥当性 | C | G4 |
| 2 | P1#3a 種別「設計」の純増 | C | G4 |
| 3 | product-cycle.md 統計テーブル不整合 | C | R1（G4 同伴） |
| 4 | P1 推奨モデル行に #3a 不在 | C | G4 |
| 5 | P4 推奨モデル行に #0 不在 | C | G4 |
| 6 | P1 テンプレ表に冪等性 CL 未記載 | C | G1 |
| 7 | P4 テンプレ表が存在しない | C | G1 |
| 8 | CLAUDE.md §3 SOP 登録の非対称性 | C | G3 |
| 9 | §3 冒頭コメントとの矛盾 | C | G3 |
| 10 | T11 先回り良例 | B | 記録のみ |
| 11 | T4 受入条件「CL-10 から参照」のスコープ曖昧性 | C | G2 |
| 12 | CL-1 必読行肥大化リスク | C | G1 |
| 13 | paths glob `**/api/**` の広さ | C | R2 |
| 14 | CL 項目数変更時バージョンバンプ運用未明文化 | C | G2 |
| 15 | pc-progress.html 不在 4 プロダクトの扱い | C | G1 |
| 16 | 計画書 §0「全 17 プロダクト」陳腐化 | A | 解消済み |
| 17 | P4 ゲート 2 構成違和感 | B | G4 同伴 |
| 18 | CL 本体集約 vs 分離の構造再考 | C | G1 |
| 19 | x-poster-gas retire | A | 解消済み |
| 20 | PC 表 v8.0 系 5 件の構造同期 | A | 解消済み |
| 21 | 「タグだけ進める」再発 | B | 自己検証 SOP §A-1 で対応済み |
| 22 | ai-concierge P1#6a/6b 規律違反 | B | プロダクトエージェント引き継ぎ |
| 23 | Plan 逸脱運用ルール | C | R3 |
| 24 | D4 runbook 全プロダクト未整備 | C | G5 |
| 25 | A2 予算アラート全プロダクト未設定 | C | G5 |
| 26 | D1 マネージド DB バックアップ未整備 | C | G5 |

合計: A(3) + B(4) + C(19) = **26 件 ✓**

---

v1.0 | 2026-04-28 | Session 225 / Opus 4.7 / 司令塔エージェント作成
