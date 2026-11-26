# CLAUDE.md 改訂履歴

> 本ファイルは CLAUDE.md の全改訂履歴を保管する。CLAUDE.md 本体には最新バージョンのみ記載する。

---

| バージョン | 日付 | 変更者 | 内容 |
|------------|------|--------|------|
| v1.0 | 2026-02-24 | Claude | 初版制定 |
| v1.1 | 2026-02-26 | Claude | MISSION_LOG 直近5件制・エージェント自己レビュープロトコル追加 |
| v1.2 | 2026-02-26 | Claude | 3段階レビューフロー（エージェント実装→エージェント Opus検証→Claude最終確認）に改訂 |
| v1.3 | 2026-02-28 | Claude | 横断チェック必須ルール・モデル使い分けガイドライン追加 |
| v1.4 | 2026-03-01 | Claude | 3段階レビューフロー廃止→MISSION_LOG完結型の引き継ぎルールに改訂。コピペ依頼・仲介作業の禁止を明文化 |
| v1.5 | 2026-03-02 | Claude | エージェント マイクロタスク方式追加。証拠付き Check-out・スコープ外変更禁止の参照追加 |
| v1.6 | 2026-03-02 | Claude | エージェント モデル・モード推奨ガイドライン追加。タスク指示テンプレートにモデル推奨フィールド追加 |
| v1.7 | 2026-03-02 | Claude | グループクォータ管理の原則を追加。外様グループ温存戦略を明文化 |
| v1.8 | 2026-03-05 | Claude | 三打席ルール精緻化（「3回連続」→「同一箇所3回」）。AIセルフガバナンス新設 |
| v1.9 | 2026-03-06 | Claude | ビジネスサイクル・タスクルール（GHOST OPERATION）新設。D方式→A移行の段階的移行戦略 |
| v2.0 | 2026-03-06 | Claude | プロジェクト昇格手順を新設。昇格=移動の原則、7ステップ手順 |
| v2.1 | 2026-03-08 | Claude | タスク完了の定義を新設。デプロイ+本番URL動作確認を含む5ステップを必須化 |
| v2.2 | 2026-03-09 | Claude | タスク指示テンプレートに目視確認チェックリスト・ギブアップルール追加 |
| v3.0 | 2026-03-09 | Claude | **3レイヤーリファクタ:** 466行→~120行に圧縮。手順詳細を `docs/ops/` に分離（7ファイル）。SOP索引を命令型トリガーとして新設。メタルール（Refactor-on-Write / Reference-over-Redundancy / Self-Correction Loop）新設 |
| v4.0 | 2026-03-10 | Claude | 0ベース再構築。プロダクトサイクル(P0-P4)新設。product-cycle.md分離 |
| v4.1 | 2026-03-16 | Claude | P2.5「販売準備」フェーズ新設 |
| v4.2 | 2026-03-16 | Claude | P2に★表示内容検証追加。フォルダライフサイクルSOP新設 |
| v4.3 | 2026-03-17 | Claude | §5にCheck-in義務・製品参照義務・PC表連動を追加。ガバナンス改革（Session28合意） |
| v4.4 | 2026-03-18 | Claude | §5にHTML提示義務を追加（PC表・競合比較表はHTMLで提示がデフォルト） |
| v4.5 | 2026-03-18 | Claude | §5からHTML提示義務をMEMORY.mdに移動（ガバナンスルールとして異質のため）。CLAUDE.mdビューアHTML新設 |
| v4.6 | 2026-03-18 | Claude | 全エージェント共通ルールを`docs/ops/agent-rules.md`に分離。MEMORY.md→①全エージェント②vibe-base司令塔に2層化。§5からMEMORY.md読込削除。§6重複削除（48→47行） |
| v4.7 | 2026-03-20 | Claude | §5に「会話復帰」追加。SESSION_JOURNAL.md導入（セッション間の会話文脈をマスター第一声トリガーで検索→確認質問→再開） |
| v4.8 | 2026-03-24 | Claude | A群共有資産化。§3にSOP4件+参照資料3件追加（external-service-check-template/vercel-deploy-checklist/email-template-guide/failure-scenario-template/pricing-guide/web-page-classification/scattered-asset-audit） |
| v4.9 | 2026-03-24 | Claude | B群テンプレート化。§3にSOP3件追加（design-doc-templates/test-template-guide/onboarding-ops-templates）。product-cycle.md v8.2に対応 |
| v5.0 | 2026-04-02 | Claude | §3 SOP索引32行→SOP運用4行に縮小。28/32本は.claude/rules/で自動注入（Push型移行完了）。除外4本+参照資料のみ残置。持続性ガードフック3種+検証スクリプト新設 |
| v5.1 | 2026-04-10 | Claude | §5.1 トークン効率規律新設（自己生成ファイル再読禁止/ポーリング待機禁止/コマンド連結義務。Session 150）。§0 1フォルダ=1エージェント記述強化。§2 Continue ループ一文追加。§3 前段「28/32本」文削除+scattered-asset-audit削除+patrol.md パス明記。§5.1 自己生成ファイル再読禁止から説教口調一句削除。冒頭引用ブロック削除（Session 151 包括精査） |
| v5.2 | 2026-04-13 | Claude | §5.1 に「バックグラウンド実行原則（原則委譲）」追加。長時間作業は `Agent` + `run_in_background: true` で委譲し、前景で抱え込むな。前景実行の例外は①30秒未満②判断に即座に要する場合のみ。Session 167 マスター指示 |
| v5.3 | 2026-04-17 | Claude (Opus 4.7) | **Opus 4.7 対応改訂（Refactor-on-Write方式）。** ①CLAUDE.md §5.1 に「モデル温存」項目追加（opusplan標準化）②agent-task-protocol.md §1 を Refactor（Opus 4.7 xhigh デフォルト・新トークナイザー1.35倍・L1-L5 5段階分類・既存PC表 model 列との対応表を新設）③session-lifecycle.md に /compact 章追加（Plan Mode→実装移行時の文脈保持）④MEMORY.md P1.5 に Opus 4.7 モデル選定トリガー追加。Haiku 4.5 は vibe-base タスク特性（設計判断多）により不採用。パイロット: portfolio プロダクトで1週間実測後に task_budget 数値確定。Session 180 web版Opus 4.7 提案書を現場判断で Refactor 実装 |
| v5.4 | 2026-04-22 | Claude | §3 参照資料テーブルから 2 項目を削除（pricing-guide.md は product-cycle.md S5#15 への二重記載を解消、web-page-classification.html は .claude/rules/lp-design.md に移設） |
| v5.5 | 2026-04-22 | Claude | §5.1 トークン効率規律を要約圧縮（本文 ≈240字 → ≈100字）。詳細を `docs/ops/agent-task-protocol.md` §1 へ委譲。モデル温存項の「`/model opusplan` 推奨」記述を削除し、`memory/feedback_opus-manual-operation.md` へ参照集約（Session 183 マスター確定判断との整合）。agent-task-protocol.md §1-1/§1-2/§1-5 の opusplan 能動推奨も同時駆除 |
| v5.6 | 2026-04-27 | Claude (Opus 4.7) | §6 禁止事項にシークレット貼付禁止を追加（プロンプト・チャット履歴・エラーログ・スクショ含む。漏洩経路の最大は貼付）。構造改革プロジェクト T13 |
| v5.7 | 2026-04-28 | Claude (Opus 4.7) | **構造改革プロジェクト 完了マーカー（T1-T16 全完了）。** catnose + Qiita 起源 20運用ルールの vibe-base SOP統合 + 構造改革を6セッション（Session 213-222）かけて完遂。新設SOP 4本（incident-response/backup-strategy/cost-budget/rate-limit）+ 新設チェックリスト 2本（idempotency/library-verification）+ skill改修 2件（security-review/code-review）+ 自動注入rule新設（security-runtime）+ 横断ルール改修 3件（agent-rules/product-cycle/共通憲法 §6）+ プロダクト波及 3件（CLAUDE.md 15件 / pc-progress.html 12件 / risk-diagnosis.md 8件）+ リスク診断 SOP v3.0 化（D 運用品質ダメージ 4項目新設）+ 共有リスク台帳 横断パターン #8〜#12 追加。改革本来意図「ルールを書く ≠ ルールが効く」状態の構造的検知が機能した（D4 runbook 不在の全件可視化、D1 マネージド DB バックアップ限定の横断発見）|
| v5.8 | 2026-04-28 | Claude (Opus 4.7) | **自己検証 SOP 新設（Session 224）。** 構造改革で得た自走バックストップ体制が進行途中で機能不全に陥っていないかを毎ターン検証する仕組みを SOP 化。`docs/ops/self-verification-sop.md`（6 区切り検証工程 + OK/NG 基準 + NG 時修正シミュレーション 5 ケース）+ `.claude/rules/self-verification.md`（自動注入、paths: `**`）+ §5 AIセルフガバナンスに「自己検証工程」項追加。改革プロジェクト自身でも再発した 3 アンチパターン（タグ ≠ 中身 / 書いてある ≠ 効いている / 計画書 ≠ 現状）を構造的に検知する。 |
| v5.9 | 2026-04-28 | Claude (Opus 4.7) | **2 周目調整プロジェクト G3 完了（Session 225）。** §3 SOP 索引を「自動注入経路の有無」で表 A/B に分離。表 A（incident-response / backup-strategy / cost-budget の 3 SOP、`.claude/rules/<rule>.md` 経由で paths 自動注入）+ 表 B（shared-asset-ops / md-inventory、エージェント判断で直接参照）+ 参照資料（vest1）。Session 217 T1-T3 で発生していた登録非対称性（T1 のみ §3 登録、T2/T3 未登録）と冒頭コメント「自動注入対象外」と incident-response-sop の自動注入実体との矛盾を構造解消。表分離により今後の SOP 新設時の登録基準が明文化された。 |
| v6.0 | 2026-06-06 | Claude (Opus 4.8) | **§7 plan-mode 固定 H2 構造を 7→8 項目に拡張（canonical `docs/standards/plan-mode.md`）。** ①新固定 H2「サブエージェント割り振り方針」追加（モデル使い分け基準表 + @注入の原則。思想 2・5 の実装を起草時点で具体化）②「実装ステップ」表記法に「モデル」「@注入ファイル」列追加（subagent のコンテキスト非継承による必要ファイル渡し漏れを構造防止）③「リスク」→「リスク・トラブル想定とリカバリープラン」に拡張し orchestration-discipline 規律 2「4 原則」を起草時先回りで紐付け（規律 2 は実走中の事後原則・本欄は起草時の事前設計で役割分離）。ルート雛形 `.claude/commands/plan-template.md` 同期 + `plan-finalize.md` Step 3 を新列に整合。plan-schema-gate は新項目を必須化しない設計を維持（既存 plan 非破壊）。**既知の別課題（本 plan scope 外）**: `products/*/.claude/commands/plan-template.md` 19 件への commands 自動伝播機構が不在。product は CLAUDE.md → `.claude/rules/plan-mode.md` → canonical @import で新項目が実効的に届くため当面は実害なしだが、雛形コマンド自体の伝播は将来課題。 |
