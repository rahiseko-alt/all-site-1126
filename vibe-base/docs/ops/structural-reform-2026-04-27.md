# vibe-base 構造改革プロジェクト 2026-04-27

> **目的:** catnose + Qiita起源 20運用ルールの vibe-base SOP統合 + 構造改革
> **作成:** Session 213 (2026-04-27) / Opus 4.7
> **着手担当:** vibe-base司令塔セッション（別セッション以降）
> **想定セッション数:** 4〜6セッション（16タスク × 平均25〜40分/タスク）

---

## §0 プロジェクト全体像

### ゴール
catnose + Qiita 20項目を vibe-base SOPに統合し、**3軸AND判定（存在 ∩ 波及 ∩ 発火実効性）で全項目○** にする。

### スコープ
- 含む: SOP新設4本、チェックリスト新設2本、skill改修2件、自動注入rule新設1本、横断ルール改修3件、全プロダクト波及3件（実体: CLAUDE.md=15件 / pc-progress.html=12件 / risk-diagnosis.md=8件。整合性は §1 進捗テーブル T14/T15/T16 を参照）
- 含まない: 個別プロダクト機能改修、既存プロダクトのバグ修正、新プロダクト立ち上げ

### pc-progress.html 不在 4 プロダクトの正式扱い（2 周目調整 G1 で確定）

| プロダクト | 現状 | 扱い |
|---|---|---|
| microscope | `pc-progress.md`（旧形式）存在、HTML 移行未完 | T15 対象外。HTML 移行は別タスクで個別判断 |
| aiueo | `pc-progress.md`（旧形式）存在、HTML 移行未完 | T15 対象外。HTML 移行は別タスクで個別判断 |
| affiliate-lp | PC 表未組込（テンプレ標準化前の初期プロダクト） | T15 対象外。PC 表新設は P0 から始める場合のみ実施 |
| x-poster-gas | retire 済み（Session 223 完全破棄）、x-bot に置換 | 対象外確定 |

### 前提
- 起点: T10（agent-rules.md #10例外節）が完了しないと他改修が規律違反になる
- 全タスク完了で「20項目全て○」になることがゴール（部分達成は失敗）

### 成功基準
- ☐ 16タスク全て ✅ 状態
- ☐ catnose+Qiita 20項目を再評価し、全件○
- ☐ 既存プロダクトの risk-diagnosis.md（8件）/ pc-progress.html（12件）/ CLAUDE.md（15件）が新SOPに整合
- ☐ vibe-base 共通憲法から計画書へのリファレンスあり

### 完了マーカー
- 最終コミット: `feat(ops): complete structural reform 2026-04-27 (T1-T16)`
- MISSION_LOG: `## 構造改革プロジェクト 完了 [日時]`
- 共通憲法 v5.6 へバージョンアップ（改革反映）

---

## §1 タスク一覧 + 着手順 + 進捗テーブル

### 進捗テーブル

| ID | タスク | 状態 | 担当セッション | 完了日 |
|---|---|---|---|---|
| T10 | agent-rules.md #10 例外節追加 | ✅ | Session 216 | 2026-04-27 |
| T11 | product-cycle.md 改修 | ✅ | Session 216 | 2026-04-27 |
| T13 | 共通憲法 §6 拡張 | ✅ | Session 216 | 2026-04-27 |
| T1 | 障害対応SOP新設 | ✅ | Session 217 | 2026-04-27 |
| T2 | バックアップSOP新設 | ✅ | Session 217 | 2026-04-27 |
| T3 | コスト・予算SOP新設 | ✅ | Session 217 | 2026-04-27 |
| T4 | レートリミットSOP新設 | ✅ | Session 218 | 2026-04-27 |
| T5 | 冪等性チェックリスト新設 | ✅ | Session 218 | 2026-04-27 |
| T6 | ライブラリ実在性チェックリスト新設 | ✅ | Session 218 | 2026-04-27 |
| T7 | security-review SKILL改修 | ✅ | Session 219 | 2026-04-27 |
| T8 | code-review SKILL改修 | ✅ | Session 219 | 2026-04-27 |
| T9 | security-runtime rule新設 | ✅ | Session 219 | 2026-04-27 |
| T12 | PC表テンプレに CL-16 追加（拡張版: 正本一本化+T11反映+CL-16+v9.3バンプ） | ✅ | Session 220 | 2026-04-27 |
| T14 | 全プロダクト自治憲法波及（実体15件、x-poster-gas は CLAUDE.md不在で対象外） | ✅ | Session 220 | 2026-04-27 |
| T15 | 全プロダクトPC表波及（12件: カテゴリA 6件 + カテゴリB 5件 + カテゴリC design-seed 1件、サブタスク T15a〜T15d で完了） | ✅ | Session 220-222 | 2026-04-28 |
| T16 | 既存プロダクト risk-diagnosis 再実施（8件: ai-concierge / biz-efficiency / design-seed / foodee / hearing-bot / kobaraku / omotenashi-trainer / review-analysis） | ✅ | Session 222 | 2026-04-28 |

**状態凡例:** ☐=未着手 / ⏳=実施中 / ✅=完了 / ⛔=詰まり

### 着手順 + 依存関係マップ

```
[起点] T10 (agent-rules例外節)
   │
   ├→ T11 (product-cycle改修) ─┬→ T12 (PC表テンプレ) ─→ T15 (全PC表波及)
   │                          └→ T1〜T6 (新SOP群、並列可) ─→ T16 (risk再実施)
   │
   ├→ T7, T8, T9 (skill改修、並列可)
   │
   └→ T13 (共通憲法§6拡張) ─→ T14 (全自治憲法波及)
```

### 推奨着手順
1. **第1セッション:** T10 → T11 → T13（横断ルール基盤）
2. **第2セッション:** T1, T2, T3（新SOP群その1）
3. **第3セッション:** T4, T5, T6（新SOP群その2）
4. **第4セッション:** T7, T8, T9（skill改修）
5. **第5セッション:** T12 → T14, T15（テンプレ + プロダクト波及）
6. **第6セッション:** T16（risk-diagnosis 再実施）+ 全体検証 + 完了マーカー

---

## §2 タスク詳細

> **指示書フォーマット:** `agent-task-protocol.md §5` 形式に準拠。各タスクは自己完結（パス・コマンド・受入条件が全て記載）

---

### T10: agent-rules.md #10 例外節追加

#### 何を変えるか
`docs/ops/agent-rules.md` の「テンプレート順守#10」セクションに例外節を追加。CL（チェックリスト）項目数の枠拡張を vibe-base 司令塔セッションでのみ可能にする。

#### Before
- 現行: タスク名・番号・種別の独自変更禁止（CL-1〜CL-15は7項目固定）

#### After
- セクション末尾に以下を追記:
```markdown
### 例外節
- CL-1〜CL-15 のレビュー項目数の追加は **vibe-base 司令塔セッションでのみ可**
- プロダクトエージェントは項目数を変更してはならない
- 追加時は `docs/ops/structural-reform-*.md` または同等の合意文書への記載必須
```

#### 受入条件
- [ ] `docs/ops/agent-rules.md` に「例外節」セクション存在
- [ ] CL項目数追加の権限が「vibe-base司令塔のみ」と明記
- [ ] grep 検証: `grep -A3 "例外節" docs/ops/agent-rules.md`

#### 検証コマンド
```bash
grep -q "### 例外節" docs/ops/agent-rules.md && echo "T10 OK"
grep -q "vibe-base 司令塔セッションでのみ可" docs/ops/agent-rules.md && echo "T10 OK2"
```

#### スコープ外
- 既存ルールの本文書き換え
- agent-rules.md の他セクション

#### 完了マーカー
コミット: `chore(ops): add exception clause to agent-rules #10 (T10)`
MISSION_LOG: `## T10 完了 [日時]`

#### 想定時間
15分

---

### T11: product-cycle.md 改修（P1#3a + P4#0新設）

#### 何を変えるか
`docs/ops/product-cycle.md` に新規タスク2件を追加:
- P1#3a「スキーマ + トランザクション設計」（DB/データ永続化を伴うプロダクト時のみ）
- P4#0「運用Runbook整備」（ゲート前必須）

#### Before
- P1#3「DB想定規模確認」のみで、スキーマ先行設計タスクなし
- P4 は「計測・改善」5タスクのみ、運用責任記述なし

#### After
- P1#3a 新設: タスク種別=設計、判定基準=「DB/データ永続化を伴うプロダクトの場合に必須」
  - 内容: スキーマ先行設計、エンティティ関係性言語化、冪等性境界設計
  - 参照SOP: `docs/standards/checklists/idempotency-checklist.md`（T5で作成）
- P4#0 新設: タスク種別=ゲート、判定基準=「全プロダクト必須」
  - 内容: Runbook整備（バックアップ・障害対応・予算アラート）
  - 参照SOP: `docs/ops/incident-response-sop.md`（T1）, `backup-strategy-sop.md`（T2）, `cost-budget-sop.md`（T3）

#### 受入条件
- [ ] product-cycle.md に「P1#3a」セクション存在
- [ ] product-cycle.md に「P4#0」セクション存在
- [ ] P1#3a に T5 へのリンクあり
- [ ] P4#0 に T1, T2, T3 へのリンクあり
- [ ] バージョン履歴更新（v9.1 → v9.2）  <!-- 訂正: 計画書作成時 v8.5→v8.6 と誤記。実態 v9.1 → Session 216 で v9.2 にバンプ -->


#### 検証コマンド
```bash
grep -q "P1#3a" docs/ops/product-cycle.md && echo "T11-1 OK"
grep -q "P4#0" docs/ops/product-cycle.md && echo "T11-2 OK"
grep -q "idempotency-checklist.md" docs/ops/product-cycle.md && echo "T11-3 OK"
grep -q "incident-response-sop.md" docs/ops/product-cycle.md && echo "T11-4 OK"
```

#### スコープ外
- 既存タスク（P1#1〜P4#5）の改修
- PC表テンプレへの反映（T12で実施）

#### 完了マーカー
コミット: `feat(ops): add P1#3a (schema design) + P4#0 (runbook) to product-cycle (T11)`
MISSION_LOG: `## T11 完了 [日時]`

#### 想定時間
30分

---

### T13: 共通憲法 §6 拡張（プロンプト貼付禁止）

#### 何を変えるか
`CLAUDE.md` §6 禁止事項に「シークレットの貼付禁止（プロンプト含む）」を追加。

#### Before
- §6: `main` への `--force` push / シークレットのコミット / `archive/` 無断削除

#### After
- §6: 上記 + `シークレットの貼付禁止（プロンプト・チャット履歴・エラーログ・スクショ含む。漏洩経路の最大は貼付）`

#### 受入条件
- [ ] CLAUDE.md §6 に「貼付禁止」明記
- [ ] バージョン v5.5 → v5.6 に更新
- [ ] 改訂履歴 `docs/ops/revision-history.md` に追記

#### 検証コマンド
```bash
grep -q "シークレットの貼付禁止" CLAUDE.md && echo "T13-1 OK"
grep -q "v5.6" CLAUDE.md && echo "T13-2 OK"
```

#### スコープ外
- 全プロダクト自治憲法への波及（T14で実施）

#### 完了マーカー
コミット: `feat(constitution): prohibit secret pasting to prompts (T13, v5.6)`
MISSION_LOG: `## T13 完了 [日時]`

#### 想定時間
15分

---

### T1: 障害対応SOP新設

#### 何を作るか
新規ファイル `docs/ops/incident-response-sop.md` を作成。catnose#5「障害分析と公表」+ Qiita#20「停止・記録・告知」を統合した本番障害対応プロトコル。

#### Before
- 該当ファイル: 存在しない
- `failure-scenario-template.md` は事前分析のみ
- `mission-log-ops.md` は開発進捗記録のみ

#### After
新規ファイル構成（必須セクション）:
```
§0 自動注入
§1 検知（アラート種別 + エスカレーション基準）
§2 即時対応（停止判断フロー / 影響範囲特定）
§3 ユーザー告知（status page + メール + SNS、テンプレート提供）
§4 原因究明（タイムライン作成 + 5whys）
§5 再発防止（コードレベル + プロセスレベル）
§6 公表ポリシー（公表する/しない判断基準、外向きpostmortemテンプレ）
§7 各プロダクトの runbook.md テンプレ
```
冒頭に `> ⚠️ 要点は .claude/rules/incident.md で自動注入される。ここは詳細版。`

#### 受入条件
- [ ] ファイル `docs/ops/incident-response-sop.md` 存在
- [ ] §1〜§7 全セクション実装（各セクション最低3項目以上）
- [ ] 各セクションに「実例」「テンプレート文言」「実施タイミング」あり
- [ ] 自動注入リンクあり
- [ ] `.claude/rules/incident.md` を新設し `paths: ["products/*/runbook.md"]` で自動注入設定
- [ ] product-cycle.md P4#0 から本SOPへの参照リンク（T11完了前提）
- [ ] CLAUDE.md §3 のSOP一覧に登録

#### 検証コマンド
```bash
test -f docs/ops/incident-response-sop.md && echo "T1-1 OK"
[ "$(grep -c "^## §" docs/ops/incident-response-sop.md)" -ge 7 ] && echo "T1-2 OK"
test -f .claude/rules/incident.md && echo "T1-3 OK"
grep -q "products/\*/runbook.md" .claude/rules/incident.md && echo "T1-4 OK"
grep -q "incident-response-sop.md" docs/ops/product-cycle.md && echo "T1-5 OK"
grep -q "incident-response-sop.md" CLAUDE.md && echo "T1-6 OK"
```

#### スコープ外
- 個別プロダクトの runbook.md 作成（T14で実施）
- アラート監視ツール（Sentry等）選定 — マスター別途判断

#### 完了マーカー
コミット: `feat(ops): add incident-response SOP (T1)`
MISSION_LOG: `## T1 完了 [日時]`

#### 想定時間
40分

---

### T2: バックアップ戦略SOP新設

#### 何を作るか
新規ファイル `docs/ops/backup-strategy-sop.md`。catnose#3「ストレージ自動バックアップ」を実装ガイド化。

#### After
新規ファイル構成:
```
§1 バックアップ対象（DB / オブジェクトストレージ / 環境変数 / シークレット）
§2 バックアップ先（別クラウド推奨、rclone活用パターン）
§3 頻度と世代管理（日次・週次・月次の3段階）
§4 リストア検証（最低四半期に1回）
§5 暗号化（バックアップ時の必須要件）
§6 各プロダクトの backup-config.md テンプレ
```

#### 受入条件
- [ ] ファイル存在
- [ ] §1〜§6 全セクション実装
- [ ] rclone等の具体ツール例あり
- [ ] 自動注入: `.claude/rules/backup.md` 新設、`paths: ["products/*/backup-config.md"]`
- [ ] product-cycle.md P4#0 から参照リンク

#### 検証コマンド
```bash
test -f docs/ops/backup-strategy-sop.md && echo "T2-1 OK"
[ "$(grep -c "^## §" docs/ops/backup-strategy-sop.md)" -ge 6 ] && echo "T2-2 OK"
test -f .claude/rules/backup.md && echo "T2-3 OK"
```

#### スコープ外
- 個別プロダクトの backup-config.md 作成（T14で実施）

#### 完了マーカー
コミット: `feat(ops): add backup-strategy SOP (T2)`
想定時間: 35分

---

### T3: コスト・予算SOP新設

#### 何を作るか
新規ファイル `docs/ops/cost-budget-sop.md`。Qiita#13「コスト見積もり・予算アラート強制設定」を実装ガイド化。

#### After
```
§1 開発着手前の見積もり手順（課金単位 / ユーザー数仮定 / 月額試算）
§2 ハードリミット設定（GCP Budget Alert / Vercel Analytics / Stripe / OpenAI usage limit）
§3 リリース後の監視（日次・週次トレンド）
§4 緊急停止プロトコル（予算超過時）
§5 各プロダクトの cost-config.md テンプレ
```

#### 受入条件
- [ ] ファイル存在
- [ ] §1〜§5 全セクション実装
- [ ] 主要サービス（GCP/Vercel/OpenAI/Anthropic/Stripe）の予算アラート設定手順あり
- [ ] 自動注入: `.claude/rules/cost.md` 新設
- [ ] product-cycle.md P4#0 から参照

#### 検証コマンド
```bash
test -f docs/ops/cost-budget-sop.md && echo "T3-1 OK"
[ "$(grep -c "^## §" docs/ops/cost-budget-sop.md)" -ge 5 ] && echo "T3-2 OK"
test -f .claude/rules/cost.md && echo "T3-3 OK"
```

#### 完了マーカー
コミット: `feat(ops): add cost-budget SOP (T3)`
想定時間: 35分

---

### T4: レートリミットSOP新設

#### 何を作るか
新規ファイル `docs/ops/rate-limit-sop.md`。catnose#2「APIレートリミット導入」を自プロダクト側送信制御ガイド化。

#### After
```
§1 認証不要エンドポイントへのレートリミット必須化
§2 IP別 / ユーザー別 / API別の制限設計
§3 実装パターン（Vercel Edge Middleware / Express Rate Limit / Upstash Ratelimit）
§4 制限超過時のレスポンス設計（429 + Retry-After）
§5 監視と調整
```

#### 受入条件
- [ ] ファイル存在
- [ ] §1〜§5 全セクション実装
- [ ] 主要技術スタック（Next.js/Express）の実装例コードあり
- [ ] 自動注入: `.claude/rules/rate-limit.md` 新設、`paths: ["**/api/**"]`
- [ ] product-cycle.md P1#13 と CL-10 から参照

#### 検証コマンド
```bash
test -f docs/ops/rate-limit-sop.md && echo "T4-1 OK"
test -f .claude/rules/rate-limit.md && echo "T4-2 OK"
grep -q "rate-limit-sop.md" docs/ops/product-cycle.md && echo "T4-3 OK"
```

#### 完了マーカー
コミット: `feat(ops): add rate-limit SOP (T4)`
想定時間: 30分

---

### T5: 冪等性チェックリスト新設

#### 何を作るか
新規ファイル `docs/standards/checklists/idempotency-checklist.md`。Qiita#16「トランザクション・冪等性確保」を CL 形式に。

#### After
```
§1 冪等性が必要な処理（決済 / 通知 / DB書込 / 外部API呼出）
§2 冪等キー設計（UUID v4 / クライアント生成キー / Idempotency-Key ヘッダー）
§3 トランザクション境界の決定
§4 リトライポリシー（指数バックオフ）
§5 チェックリスト（10項目以上）
```

#### 受入条件
- [ ] ファイル存在
- [ ] §1〜§5 全セクション実装
- [ ] チェックリスト10項目以上
- [ ] T11 完了後、CL-1（コア機能）から本チェックリストへの参照追加

#### 検証コマンド
```bash
test -f docs/standards/checklists/idempotency-checklist.md && echo "T5-1 OK"
[ "$(grep -c "^- \[ \]" docs/standards/checklists/idempotency-checklist.md)" -ge 10 ] && echo "T5-2 OK"
```

#### 完了マーカー
コミット: `feat(standards): add idempotency checklist (T5)`
想定時間: 25分

---

### T6: ライブラリ実在性チェックリスト新設

#### 何を作るか
新規ファイル `docs/standards/checklists/library-verification-checklist.md`。Qiita#11「AI提案ライブラリの実在性確認」を CL 形式に。

#### After
```
§1 npm/pip 公式リポジトリでの実在性確認
§2 最終更新日・スター数・Issue数
§3 メンテナの活動状況
§4 ライセンス確認（GPL汚染防止）
§5 タイポスクワッティング検知（疑わしい類似名チェック）
§6 package-lock.json でのバージョン固定
§7 npm audit / Snyk スキャン
§8 チェックリスト（8項目以上）
```

#### 受入条件
- [ ] ファイル存在
- [ ] §1〜§8 全セクション実装
- [ ] チェックリスト8項目以上
- [ ] AIが新規パッケージ追加した時の実行手順あり

#### 検証コマンド
```bash
test -f docs/standards/checklists/library-verification-checklist.md && echo "T6-1 OK"
[ "$(grep -c "^- \[ \]" docs/standards/checklists/library-verification-checklist.md)" -ge 8 ] && echo "T6-2 OK"
```

#### 完了マーカー
コミット: `feat(standards): add library-verification checklist (T6)`
想定時間: 25分

---

### T7: security-review SKILL改修

#### 何を変えるか
`.claude/skills/security-review/SKILL.md` のトリガーを前倒し + 観点追加。

#### Before
- トリガー: 「P1#13（CL-10）着手時、またはセキュリティ懸念発生時」
- 観点: 9カテゴリ

#### After
- トリガー二段化:
  - **早期スキャン:** P1#4（コア機能実装）着手前の30秒スキャン
  - **フル診断:** P1#13（CL-10）で従来通り
- 観点11カテゴリに拡張:
  - 既存9 + **2-10. IDOR（権限差し替え攻撃面）** + **2-11. プロンプト・LLM入出力の機密漏洩**

#### 受入条件
- [ ] description に「P1#4着手前の早期スキャン」追加
- [ ] §2-10 IDOR セクション追加
- [ ] §2-11 プロンプト機密 セクション追加
- [ ] 早期スキャンの所要時間「30秒」明記

#### 検証コマンド
```bash
grep -q "P1#4着手前" .claude/skills/security-review/SKILL.md && echo "T7-1 OK"
grep -q "2-10\." .claude/skills/security-review/SKILL.md && echo "T7-2 OK"
grep -q "2-11\." .claude/skills/security-review/SKILL.md && echo "T7-3 OK"
```

#### 完了マーカー
コミット: `feat(skills): expand security-review trigger + IDOR/prompt-secret (T7)`
想定時間: 30分

---

### T8: code-review SKILL改修

#### 何を変えるか
`.claude/skills/code-review/SKILL.md` のトリガーを前倒し + 観点5件追加。

#### Before
- トリガー: 「P2#15（CL-14）着手時」
- 観点: 7項目

#### After
- トリガー: 「**本番デプロイ前必須**」（早期化）
- 観点12項目に拡張:
  - 既存7 + **2-8. 画像/フォント未最適化** + **2-9. ライブラリ実在性未検証** + **2-10. コード説明可能性（行単位で説明できるか）** + **2-11. レートリミット送信側未実装** + **2-12. 詳細エラー返却の有無**

#### 受入条件
- [ ] description に「本番デプロイ前必須」追加
- [ ] §2-8〜§2-12 全セクション追加
- [ ] CL-14（コードレビュー）の項目数を7→12に拡張（T10例外節適用）

#### 検証コマンド
```bash
grep -q "本番デプロイ前必須" .claude/skills/code-review/SKILL.md && echo "T8-1 OK"
for i in 8 9 10 11 12; do grep -q "2-$i\." .claude/skills/code-review/SKILL.md && echo "T8-$i OK"; done
```

#### 完了マーカー
コミット: `feat(skills): expand code-review observation 7→12 (T8)`
想定時間: 35分

---

### T9: security-runtime rule新設

#### 何を作るか
新規ファイル `.claude/rules/security-runtime.md`。実装ファイル編集時の自動注入で、セキュリティ観点を設計フェーズに到達させる。

#### After
```yaml
---
description: 実装ファイル編集時にセキュリティ観点を自動注入
paths:
  - "**/api/**"
  - "**/*.route.*"
  - "**/middleware.*"
  - "**/auth/**"
---

# 実装中セキュリティ規律（自動注入）

- IDOR対策: データ取得時に「ログイン中本人か」をサーバー側で必ず検証
- プロンプト機密: APIキー・トークン・個人情報をプロンプト/エラーログ/スクショに貼るな
- 入力バリデーション: 全入力をサーバー側で再検証（クライアント側は補助）
- エラー隠蔽: 本番環境では抽象メッセージのみ返す
- レートリミット: 認証不要エンドポイントには必須
- 詳細SOP: docs/ops/rate-limit-sop.md / docs/ops/incident-response-sop.md
```

#### 受入条件
- [ ] ファイル存在
- [ ] frontmatter `paths` 設定（4パターン以上）
- [ ] 5つの規律明記
- [ ] 詳細SOP（T1, T4）への参照リンク

#### 検証コマンド
```bash
test -f .claude/rules/security-runtime.md && echo "T9-1 OK"
grep -q "paths:" .claude/rules/security-runtime.md && echo "T9-2 OK"
grep -q "IDOR" .claude/rules/security-runtime.md && echo "T9-3 OK"
```

#### 完了マーカー
コミット: `feat(rules): add security-runtime auto-injection (T9)`
想定時間: 20分

---

### T12: PC表テンプレに CL-16 追加

#### 何を変えるか
`docs/standards/templates/pc-template.html` の CL（チェックリスト）一覧に **CL-16「運用準備チェック」** を追加。

#### Before
- CL-1〜CL-15 の 15項目

#### After
- CL-16「運用準備チェック」追加。発火タイミング: P2#27ゲート前
- チェック項目: バックアップ設定 / 障害対応Runbook / 予算アラート / レートリミット / 冪等性 / ライブラリ実在性 / コスト見積もり

#### 受入条件
- [ ] テンプレに CL-16 セクション追加
- [ ] 発火タイミング「P2#27ゲート前」明記
- [ ] チェック項目最低7つ
- [ ] CURRENT_SOP_VERSION バンプ（既存値+1）

#### 検証コマンド
```bash
grep -q "CL-16" docs/standards/templates/pc-template.html && echo "T12-1 OK"
grep -q "運用準備" docs/standards/templates/pc-template.html && echo "T12-2 OK"
```

#### 完了マーカー
コミット: `feat(templates): add CL-16 (operations readiness) to pc-template (T12)`
想定時間: 25分

---

### T14: 全17プロダクト自治憲法波及（プロンプト貼付禁止 + Runbookセクション）

#### 何を変えるか
`products/*/CLAUDE.md` 全17件に以下を追加:
- §6禁止事項に「シークレット貼付禁止」（T13と同期）
- 「§X 運用Runbook」セクション参照（T1へのリンク）

#### 対象プロダクト（17件）
affiliate-lp / ai-concierge / aiueo / biz-efficiency / design-seed / dify-service / foodee / hearing-bot / homepage / kobaraku / omotenashi-trainer / review-analysis / video-studio + その他

#### 受入条件
- [ ] 全17件の CLAUDE.md に貼付禁止追記
- [ ] 全17件にRunbookセクション参照
- [ ] 各プロダクトの自治憲法バージョンバンプ

#### 検証コマンド
```bash
for f in products/*/CLAUDE.md; do
  grep -q "貼付禁止" "$f" || echo "MISSING: $f"
done
for f in products/*/CLAUDE.md; do
  grep -q "incident-response-sop.md" "$f" || echo "MISSING_RUNBOOK: $f"
done
```
出力空 = 全件OK

#### 完了マーカー
コミット: `feat(products): propagate paste-ban + runbook ref to all CLAUDE.md (T14)`
想定時間: 60分

---

### T15: 全プロダクトPC表 v9.3 真の同期（Session 221 で再定義）

> **再定義の経緯（Session 221 発見）**: Session 220 で「7件 v9.3 同期完了」と認識した状態は **pcVersion フィールドだけ "9.3" に書き換えた不完全状態** だった。内部 `CURRENT_SOP_VERSION` 定数は "9.1" のまま、TC マップ/CSS変数/P4#0 全て未対応、ai-concierge は P1#6a/6b 独自命名（規律違反）、design-seed は更に旧形式（sopVersion="8.6"）で未把握。**T15 を 4サブタスク T15a〜T15d に分割。実体は12件**（旧記述「全17プロダクト」は誤り。pc-progress.html を持つプロダクトのみ対象）。

#### 対象12件のカテゴリ分類

| カテゴリ | プロダクト | pcVer | 内部 SOP_VER | 備考 |
|---|---|---|---|---|
| A（タグ済 / 構造ほぼ同期済） | ai-concierge / biz-efficiency / dify-service / foodee / gas-bot / homepage | 9.3 | 9.1（→Phase 1 で 9.3） | T15a で機械更新済 |
| B（v8.0据置） | hearing-bot / kobaraku / omotenashi-trainer / review-analysis / video-studio | 8.0 | 8.0 | T15d で Phase 1+2 一体化 |
| C（旧形式） | design-seed | sopVersion=8.6 | 8.6 | T15c で sopVersion→pcVersion 移行 |

---

### T15a: カテゴリA 6件 Phase 1 機械更新 + Phase 2A dify/homepage P4#0 追加 ✅

**Session 221 完了**（コミット 0417f98）。記録目的のみ。

実施内容:
- ai-concierge / biz-efficiency / dify-service / foodee / gas-bot / homepage の pc-progress.html に対し:
  - CSS 変数 `--t-design:#0c4a6e; --t-design-bg:#e0f2fe;` 追加
  - CSS クラス `.type-design{background:var(--t-design-bg);color:var(--t-design)}` 追加
  - JS `const TC` マップに `"設計":"type-design"` 追加
  - JS `const CURRENT_SOP_VERSION = "9.1"` → `"9.3"`
- dify-service と homepage の `p4: { tasks: [...] }` 先頭に P4#0「運用Runbook整備」を追加（× 初期値）

検証 PASS: `check-pc-version.mjs` hook 全6件 EXIT 0、ブラウザ目視マスター承認済み。

---

### T15b: カテゴリA Phase 2A 残4件（差分追加）

#### 何を変えるか
ai-concierge / biz-efficiency / foodee / gas-bot の pc-progress.html に対し、**プロダクト個別の差分**を追加（Phase 1 機械更新は T15a で完了済）。

#### 対象ファイルと作業内容

| プロダクト | 作業内容 |
|---|---|
| `products/ai-concierge/pc-progress.html` | (1) P1#6a/6b の `task` フィールドを「参考サイト計測（measure-site.mjs → site-measurement.md）」「画面を作る（UI実装 — 模写→フレームワーク化）」に戻す + (2) 既存 ○ rationale（「UI設計書作成…」「UI実装適用…」）を `note` 欄に退避し、status は × へリセット（次セッションで /ui-clone で再実施）+ (3) P4#0 タスク追加（× 初期値、p4 先頭に挿入） |
| `products/biz-efficiency/pc-progress.html` | (1) P1#3a 補完判断（VBA Excel プロダクトで DB 永続化なし → skip + マスター承認）+ (2) P1#6a/6b 補完判断（VBA で UI 模写なし → skip）+ (3) P4#0 追加（× 初期値） |
| `products/foodee/pc-progress.html` | (1) P1#3a 補完（Firestore 使用 → ○ + 既存 P1#9b の Firestore 設計記録を rationale に転記）+ (2) P1#6a/6b 既存記録確認（旧 P1#6 がインライン残存していないか）+ (3) P4#0 追加（× 初期値） |
| `products/gas-bot/pc-progress.html` | (1) P2#15「コードレビュー」(CL-14) タスク追加 + (2) P2#27「公開・販売 Go/No-Go判定」(CL-16) タスク追加 + (3) P1#3a/6a/6b 補完判断（GAS+Sheets で DB 永続化なし → 3a skip / UI なし → 6a/6b skip）+ (4) P4#0 追加 — 構造同期作業に近いがカテゴリAなので Phase 1 は T15a で完了済 |

#### 受入条件（共通）
- [ ] 対象4件で `check-pc-version.mjs` hook EXIT 0
- [ ] ブラウザ表示で「PC表バージョン不一致」エラー帯が出ないこと
- [ ] 既存 ○/△/skip タスクの rationale が破壊されていないこと（grep 件数照合）
- [ ] ai-concierge: 規律違反（P1#6a/6b 独自命名）が解消（task フィールドが pc-template.html v9.3 と完全一致）
- [ ] 各プロダクト個別マスター承認（agent-rules.md L77）

#### 検証コマンド
```bash
# 対象4件で hook PASS
for f in products/ai-concierge/pc-progress.html products/biz-efficiency/pc-progress.html products/foodee/pc-progress.html products/gas-bot/pc-progress.html; do
  node scripts/check-pc-version.mjs "$f"
done

# ai-concierge の P1#6a/6b 規律戻し確認
grep -E '"6a".*参考サイト計測|"6b".*画面を作る' products/ai-concierge/pc-progress.html

# 全4件で P4#0 存在
for f in products/ai-concierge/pc-progress.html products/biz-efficiency/pc-progress.html products/foodee/pc-progress.html products/gas-bot/pc-progress.html; do
  grep -q '"運用準備"' "$f" || echo "MISSING_P4_0: $f"
done
```

#### スコープ外
- 個別 runbook.md ファイル作成（P4#0 を ○ 化する作業は別タスク）
- gas-bot の P2#15/P2#27 status 評価（× 初期値で追加するのみ。評価は次回プロダクトエージェント側）

#### 完了マーカー
コミット: `feat(products): T15b カテゴリA Phase 2A 残4件（個別差分） (Session N)`
MISSION_LOG: `## T15b 完了 [日時]`

#### 想定時間
60分（4件 × 15分）

---

### T15c: design-seed 旧形式移行（sopVersion → pcVersion）

#### 何を変えるか
`products/design-seed/pc-progress.html` を v8.7 旧形式（`sopVersion="8.6"`、CURRENT_SOP_VERSION="8.6"）から v9.3 に完全同期。

#### 対象ファイル
- `products/design-seed/pc-progress.html`

#### 作業内容
1. **メタフィールド名変更**: `const PC = { ... sopVersion: "8.7", ...}` → `pcVersion: "9.3"`
2. **renderSopVersionCheck() 内の参照変更**: `PC.sopVersion` → `PC.pcVersion`
3. **メタ情報レンダリング**: `SOP: v${PC.sopVersion}` → `PC版: v${PC.pcVersion||"未設定"}`
4. **CSS 機械更新**: `--t-design / .type-design` 追加（T15a と同じ）
5. **JS 機械更新**: TC マップに `"設計":"type-design"` 追加 / `CURRENT_SOP_VERSION = "8.6"` → `"9.3"`
6. **モデル系列追加**: `--m-* / .model-* / td.model / MC マップ / mb 関数` 追加
7. **テーブルヘッダ拡張**: `<th>推奨</th>` 列追加 + `td class="model"` セル追加
8. **renderP0 / renderPhase**: 推奨モデル列のレンダリング行追加
9. **データセクション再構築**: 既存 p1 ○14 + p2 ○6 を保持しつつ:
   - p1 に id "3a"/"6a"/"6b"/"9a"/"9b"/"9c" 補完（design-seed は DB 使用有無 → マスター確認、おそらく不使用で 3a skip）
   - p2 に id 15「コードレビュー」(CL-14) + id 27「公開・販売 Go/No-Go判定」(CL-16) を旧 id 順序に挿入
   - p4 に id 0「運用Runbook整備」追加
   - 仮説テーブルに `severity` フィールド追加（既存仮説に合わせて即死/重要/補助 を割当 — マスター確認）
   - 全タスクに `model` フィールド追加（テンプレ v9.3 と一致）

#### 受入条件
- [ ] `pcVersion: "9.3"` フィールド存在
- [ ] `sopVersion` フィールド削除
- [ ] `CURRENT_SOP_VERSION = "9.3"` 反映
- [ ] `check-pc-version.mjs` hook EXIT 0
- [ ] ブラウザ表示で旧 ○ 14+6=20件 のうち、全件が新構造の対応位置に維持されている
- [ ] マスター承認

#### 検証コマンド
```bash
grep -q 'pcVersion: "9.3"' products/design-seed/pc-progress.html && echo PCVER_OK
! grep -q 'sopVersion' products/design-seed/pc-progress.html && echo SOPVER_REMOVED
node scripts/check-pc-version.mjs products/design-seed/pc-progress.html
cmd.exe //c start "" "products\design-seed\pc-progress.html"
```

#### スコープ外
- design-seed の P3/P4 進捗評価（今回は構造同期のみ、評価は次回）

#### 完了マーカー
コミット: `feat(design-seed): T15c sopVersion→pcVersion 移行 + v9.3 構造同期 (Session N)`
MISSION_LOG: `## T15c 完了 [日時]`

#### 想定時間
40分（単件だが構造変更が多い）

---

### T15d: カテゴリB 5件 Phase 1+2 一体化（エージェント委任）

#### 何を変えるか
`products/{hearing-bot,kobaraku,omotenashi-trainer,review-analysis,video-studio}/pc-progress.html` を v8.0 から v9.3 へ構造再構築。**Phase 1 と Phase 2 を分けるとレンダ崩れリスクが高いため一体化**（v8.0 はデータに `model` フィールド無/仮説 `severity` 無/renderコードに「推奨」列無/MC マップ無/--m-* CSS無 = Phase 1 だけ機械更新するとデータと renderコードが不整合）。

#### 対象ファイルと既存 ○ 件数（Session 221 確認）

| プロダクト | 既存 ○（保持要） | 特殊事情 |
|---|---|---|
| hearing-bot | p1=○5 / p2=○7 計12件 | 「販売しない自社営業ツール」skip 多数 |
| kobaraku | p1=○3+△2 / p2=○4+△1 計10件 | 「個人向け無償ツール」skip 多数 |
| omotenashi-trainer | p1=○10 / p2=○15 計25件 | LP型シングルファイルHTML、買い切り型 |
| review-analysis | p1=○14 / p2=○22 計36件 | **完了率最高、全タスク位置を慎重に保持** |
| video-studio | 全× | プロトタイプ段階、rationale 複製不要（テンプレ機械コピーで OK） |

#### 委任戦略
Plan §8 通り、汎用エージェント 5体並列で各プロダクト1件ずつ担当。各エージェントには以下を渡す:
- 旧 PC表の絶対パス（カテゴリB 各件）
- 正本テンプレ v9.3 絶対パス（`docs/standards/templates/pc-template.html`）
- 既存 ○ タスクのリスト + rationale
- 本指示書（agent-task-protocol §5 形式）

#### 各エージェントへの指示

1. **テンプレ v9.3 のレンダリングコード+CSS を旧 PC表に移植**:
   - データセクション（`const PC = {...};` まで）以外を全置換
2. **データセクション再構築**:
   - 既存 ○/△ rationale を新タスク id 構造の対応位置に移植（v8.0 → v9.3 の id マッピング表は Session 221 Plan §3 Phase 2B 参照、または明示的に作成）
   - 新タスク（P1#3a/6a/6b/9a/9b/9c, P2#15, P2#27, P4#0）を全件 × 初期値で挿入
   - 全タスクに `model` フィールド追加（テンプレ v9.3 推奨値を流用）
   - 仮説テーブルに `severity` 追加（既存仮説の重要度を即死/重要/補助 で再評価）
   - `pcVersion: "8.0"` → `"9.3"`
3. **製品固有の skip 理由を保持**:
   - hearing-bot: 「販売しない自社営業ツール」
   - kobaraku: 「個人向け無償ツール」
   - omotenashi-trainer: LP型/買い切り
   - 各々の skip rationale を v9.3 構造の該当タスクで維持
4. **video-studio のみ例外**: 既存 rationale が無いので、テンプレ v9.3 をそのままコピー → product 名のみ書き換え

#### 受入条件（各プロダクト）
- [ ] `check-pc-version.mjs` hook EXIT 0
- [ ] ブラウザ表示でバージョン不一致エラー帯なし、完了率セクション正常レンダ
- [ ] 旧 ○/△ rationale が新構造で維持（grep 件数照合: 移植前後で既存 ○ 件数同一）
- [ ] 各プロダクト個別マスター承認（agent-rules.md L77）

#### 検証コマンド
```bash
for f in products/hearing-bot/pc-progress.html products/kobaraku/pc-progress.html products/omotenashi-trainer/pc-progress.html products/review-analysis/pc-progress.html products/video-studio/pc-progress.html; do
  node scripts/check-pc-version.mjs "$f"
done

# 各件で「推奨」列が renderコードに含まれている
for f in products/hearing-bot/pc-progress.html products/kobaraku/pc-progress.html products/omotenashi-trainer/pc-progress.html products/review-analysis/pc-progress.html products/video-studio/pc-progress.html; do
  grep -q '<th>推奨</th>' "$f" || echo "MISSING_MODEL_HEADER: $f"
done

# 全5件で P4#0 存在
for f in products/hearing-bot/pc-progress.html products/kobaraku/pc-progress.html products/omotenashi-trainer/pc-progress.html products/review-analysis/pc-progress.html products/video-studio/pc-progress.html; do
  grep -q '"運用準備"' "$f" || echo "MISSING_P4_0: $f"
done

# 全5件で hypotheses.severity 存在
for f in products/hearing-bot/pc-progress.html products/kobaraku/pc-progress.html products/omotenashi-trainer/pc-progress.html products/review-analysis/pc-progress.html products/video-studio/pc-progress.html; do
  grep -q 'severity:' "$f" || echo "MISSING_SEVERITY: $f"
done
```

#### スコープ外
- 既存 × タスクの ○ 化（status評価は構造同期と別軸）
- 仮説テーブルの内容追加（既存H1〜Hn にseverity を割当するのみ。新仮説追加なし）

#### 完了マーカー
コミット: `feat(products): T15d カテゴリB 5件 Phase 1+2 一体化（v8.0→v9.3 構造再構築） (Session N)`
MISSION_LOG: `## T15d 完了 [日時]`

#### 想定時間
2.5時間（5件並列、エージェント1体あたり30分想定 + 司令塔の検証30分）

---

### T16: 既存プロダクト risk-diagnosis 再実施

#### 何を変えるか
`products/*/risk-diagnosis.md` 全件を新SOPで再評価。バックアップ/予算/冪等性/ライブラリ実在性 観点で追加検知。

#### 受入条件
- [ ] 全プロダクトの risk-diagnosis.md に新4観点（A2拡張・C5バックアップ・C6冪等性・C7ライブラリ実在性 等）追加
- [ ] sop-version: 2.0 → 3.0 にバンプ
- [ ] 検知された新規リスクを共有台帳 `docs/ops/risk-registry.md` に追記
- [ ] マスター承認

#### 検証コマンド
```bash
for f in products/*/risk-diagnosis.md; do
  grep -q "sop-version: 3.0" "$f" || echo "OLD_VERSION: $f"
done
```

#### 完了マーカー
コミット: `feat(products): re-diagnose all risk with v3.0 SOP (T16)`
想定時間: 90分

---

## §3 セッション跨ぎ運用ルール

### 基本原則
- 各タスク完了時に **必ずコミット** + **MISSION_LOG に「T## 完了」記録**
- 次セッション開始時、Check-in直後に本ファイル `docs/ops/structural-reform-2026-04-27.md` を読む
- 進捗は §1 進捗テーブルで管理（☐/⏳/✅/⛔）
- 失敗 or 詰まったタスクは「⛔ 詰まり: 理由」を記載

### セッション開始手順（vibe-base司令塔 引き継ぎ）
1. 通常Check-in（MISSION_LOG / session-191-lessons / propagate-hooks）
2. 本ファイル読み込み: `Read docs/ops/structural-reform-2026-04-27.md`
3. §1 進捗テーブルで「次に着手すべきタスク」特定
4. 該当タスクの §2 詳細を Read（**自己完結指示書**として機能）
5. 受入条件 + 検証コマンドを把握してから実装着手

### セッション終了手順
1. 完了タスクの進捗テーブル状態を ✅ に更新
2. 完了マーカー（コミット + MISSION_LOG記録）
3. Check-out: 「T## 完了」「次セッションで着手予定: T##」を MISSION_LOG に明記

### 低能モデルが引き継ぐ場合の追加ガード
- 各タスク詳細は **完全自己完結**: パス・コマンド・受入条件・検証コマンドが指示書内に全て記載
- 推測・ハルシネーション防止: 「Before」「After」「受入条件」を厳密に守る
- 不明点はマスター質問を **必ず行う**（自己判断で進めない）
- 検証コマンドが全て OK 出力するまで「完了」と称してはならない

---

## §4 完了基準（プロジェクト全体 DONE）

### 全タスク完了の検証コマンド
```bash
# 全16タスクの検証コマンドを順次実行
bash docs/ops/structural-reform-verify.sh  # ※このスクリプトは最終セッションで作成
```

### 最終確認（全16タスク完了後）
- [ ] 進捗テーブル全件 ✅
- [ ] 各検証コマンド全件 OK
- [ ] catnose+Qiita 20項目を再評価し全件○（本ファイル末尾に評価表追加）
- [ ] 共通憲法 v5.6 にバンプ
- [ ] 改訂履歴 `docs/ops/revision-history.md` に「構造改革2026-04-27 完了」記載
- [ ] MISSION_LOG: `## 構造改革プロジェクト 完了 [日時]`

---

## §5 ロールバック手順

### 部分ロールバック（特定タスクのみ取り消し）
```bash
git log --oneline | grep "(T##)"
git revert <commit-hash>
# 進捗テーブルを ✅ → ☐ に戻す
```

### 全面ロールバック（プロジェクト全体取り消し）
```bash
git log --oneline | head -50  # 開始時点のコミット特定
git reset --hard <開始時点のcommit-hash>  # ⚠️ destructive。マスター承認必須
```

### 中途半端な状態の修復
- T10完了前にT11以降を着手して agent-rules.md #10 違反 → T10を先に完了させる
- T12完了前にT15を着手 → T12を先に完了させる
- 詰まりタスクは ⛔ で停止し、原因解析後に方針決定

---

## 付録A: 元データ参照

### 20運用ルール出典
- **catnose** ノートブック: `ClaudeCode-Useful information` (id: a9fafbb9-cd9a-4c91-bbd2-ae07b75c1543)
- **Qiita** 「エンジニア歴20年が素人バイブコーディング勢に物申す」
- **抽出ノート1** (catnose 9項目): note_id `6e3d13a0-b260-4ad8-b135-7cb7264ec5a1`
- **抽出ノート2** (Qiita 13項目): note_id `5de2cb12-6146-463d-bf8b-6fec5eb6b549`
- ※ catnose#7「細く長く設計」と #8「技術アウトプット」は除外済み（マスター判断）

### サブエージェント議論結果
- エージェントA（現状維持派）: ○13 / ×7 → B案推奨
- エージェントB（構造改革派）: ○6 / ×14 → C案推奨
- 司令塔判定: B寄りC案で段階実施（本計画書）

---

v1.0 | 2026-04-27 | Session 213 / Opus 4.7 / 司令塔エージェント作成
