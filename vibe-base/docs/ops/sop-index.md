# SOP 索引

> 共通憲法 §3 の詳細版。SOP の登録・参照を「自動注入経路の有無」で表 A/B に分離する。
>
> - **表 A**: `.claude/rules/<rule>.md` 経由で paths 自動注入される SOP（実体は編集時に自動注入される）
> - **表 B**: paths 注入なし、エージェント判断で必要時に直接参照する SOP

## 表 A: 自動注入経路あり

| SOP ファイル | 注入 rule | 用途 |
|---------|---------|------|
| `docs/ops/incident-response-sop.md` | `.claude/rules/incident.md` | 本番障害対応プロトコル（運用準備チェック参照） |
| `docs/ops/backup-strategy-sop.md` | `.claude/rules/backup.md` | バックアップ戦略（運用準備チェック参照） |
| `docs/ops/cost-budget-sop.md` | `.claude/rules/cost.md` | コスト・予算管理（運用準備チェック参照） |

## 表 B: 自動注入経路なし

| ファイル | 用途 |
|---------|------|
| `docs/ops/shared-asset-ops.md` | 散財→共有資産化 |
| `docs/md-inventory.md` | 全 md ファイル棚卸し |

## 全 SOP 一覧（自動生成・手動編集禁止）

> `node scripts/generate-sop-index.mjs` が docs/ops/ 直下の実体から生成する。乖離は Check-in A-25 が検知。

<!-- AUTO-GENERATED:BEGIN -->
| ファイル | タイトル |
|---------|---------|
| `docs/ops/2026-06-16-long-to-short-video-tool-tasks.md` | やる事レポート — 長編→縦型ショート 自動編集ツール（kosespark 引き継ぎ） |
| `docs/ops/agent-rules.md` | agent-rules — ポインタ |
| `docs/ops/agentic-loop-principles.md` | エージェンティック・ループ設計原則 |
| `docs/ops/antigravity-remotion-setup.md` | Remotion × Replicate セットアップ手順（Antigravity用） |
| `docs/ops/antigravity-tools-reference.md` | 外部AI連携リファレンス（Antigravity用） |
| `docs/ops/api-provider-compliance.md` | API Provider Compliance Reference |
| `docs/ops/backup-strategy-sop.md` | バックアップ戦略SOP |
| `docs/ops/beginner-dns-nav.md` | 独自ドメイン（サブドメイン）公開：初心者ナビ 📝 |
| `docs/ops/check-in-number-registry.md` | check-in 機械検証 番号台帳（A-nn の単一正本） |
| `docs/ops/comparison-sop.md` | 比較・検証統合表 運用ルール v2.0 |
| `docs/ops/cost-budget-sop.md` | コスト・予算SOP |
| `docs/ops/cross-product-survey-2026-06-11.md` | 全製品横断調査レポート — 2026-06-11 |
| `docs/ops/dead-end-registry.md` | ドン詰まり台帳（Dead-End Registry） |
| `docs/ops/dead-products-registry.md` | 廃番プロダクト台帳 |
| `docs/ops/design-doc-templates.md` | 設計ドキュメントテンプレート集 v1.0 |
| `docs/ops/email-template-guide.md` | メール自動送信 設計テンプレート v1.0 |
| `docs/ops/excel-product-sop.md` | Excel プロダクト開発 SOP |
| `docs/ops/external-service-check-template.md` | 外部サービス確認テンプレート v1.0 |
| `docs/ops/failure-scenario-template.md` | 障害シナリオ分析テンプレート v1.0 |
| `docs/ops/feature-inventory-sop.md` | 機能棚卸し表 SOP v1.0 |
| `docs/ops/folder-lifecycle.md` | フォルダライフサイクルSOP v1.2 |
| `docs/ops/git-branching-guide.md` | Git ブランチ/フォーク運用 + ポートフォリオ公開ガイド |
| `docs/ops/handoff-protocol.md` | AI間引き継ぎプロトコル |
| `docs/ops/health-report-2026-06-11.md` | 全製品健康診断レポート — 2026-06-11 |
| `docs/ops/incident-response-sop.md` | 障害対応SOP — 本番障害対応プロトコル |
| `docs/ops/legal-reference.md` | 法令表記リファレンス（正本） |
| `docs/ops/listing-cycle.md` | 出品計画サイクル SOP（ココナラ・マネタイズ作戦） |
| `docs/ops/lp-design-sop.md` | LP設計SOP v1.0 |
| `docs/ops/master-instruction-patterns.md` | マスター反復指示パターン カタログ + 仕組み化バックログ |
| `docs/ops/memory-ops.md` | memory.md 運用手順（分散運用 v2.0 β 統合型・Session 295〜） |
| `docs/ops/new-product-sop.md` | 新 product 追加 SOP |
| `docs/ops/notebooklm-mcp-sop.md` | NotebookLM MCP 運用SOP v1.0 |
| `docs/ops/onboarding-ops-templates.md` | 運用・納品テンプレート集 v1.0 |
| `docs/ops/p4-zero-procedure.md` | 運用準備チェック手順（運用Runbook整備） |
| `docs/ops/pc-decommission-migration-log.md` | PC表廃止 移送ログ（pc-progress.html 削除前の未消化情報退避） |
| `docs/ops/plan-execution-order.md` | 監査 2026-07 改善 plan 群 — 実行順の単一正本 |
| `docs/ops/product-cycle.md` | プロダクトサイクル詳細（P0→P4） |
| `docs/ops/producttype-typology.md` | 5 種別 productType 分類定義 |
| `docs/ops/project-promotion.md` | プロジェクト昇格手順 |
| `docs/ops/rate-limit-sop.md` | レートリミットSOP — API濫用防止プロトコル |
| `docs/ops/reference-site-selection-sop.md` | 参考サイト選定SOP v1.1 |
| `docs/ops/research-bank-sop.md` | Research Bank 運用ルール v2.0 |
| `docs/ops/revision-history.md` | CLAUDE.md 改訂履歴 |
| `docs/ops/risk-diagnosis-sop.md` | リスク診断SOP v4.0 |
| `docs/ops/risk-registry.md` | 共有リスク台帳 |
| `docs/ops/second-cycle-adjustments-2026-04-28.md` | vibe-base 2 周目調整プロジェクト 2026-04-28 |
| `docs/ops/self-verification-sop.md` | 自己検証 SOP v1.0 |
| `docs/ops/sentry-introduction-sop.md` | Sentry 導入 SOP — エラー追跡・監視導入プロトコル |
| `docs/ops/serena-contribution-report.md` | Serena MCP 導入貢献レポート（実測版） |
| `docs/ops/serena-mcp-setup.md` | Serena MCP セットアップ runbook（vibe-base 環境） |
| `docs/ops/session-191-lessons.md` | Session 191 行動記録 — 司令塔エージェントの過失と教訓カタログ |
| `docs/ops/shared-asset-ops.md` | 共有資産化SOP v1.0 |
| `docs/ops/structural-diagnosis.md` | 構造診断・正常化手順 v2.0 |
| `docs/ops/structural-reform-2026-04-27.md` | vibe-base 構造改革プロジェクト 2026-04-27 |
| `docs/ops/test-template-guide.md` | テスト系テンプレートガイド v1.0 |
| `docs/ops/transcript-retention-policy.md` | Transcript 保持方針（E-4・2026-07-10 策定） |
| `docs/ops/trigger-map.md` | 統合トリガーマップ v2.0 |
| `docs/ops/ui-clone-sop.md` | UI模写SOP — 付録（参考資料） |
| `docs/ops/vault-reflection-reliability.md` | vault 反映の確実性設計（内部改善 → vault 常時反映） |
| `docs/ops/vercel-deploy-checklist.md` | Vercel デプロイ前チェックリスト テンプレート v1.0 |
| `docs/ops/vest1-inventory.md` | vest1棚卸し結果 |
| `docs/ops/video-production-sop.md` | 動画制作SOP v1.2 |
| `docs/ops/webgl-fluid-knowhow.md` | WebGL Fluid Simulation クローン＆自動巡回実装ノウハウ |
| `docs/ops/windows-bash-safe-io.md` | Windows 環境での Bash 安全 I/O 手順（E-7・2026-07-10 策定） |
| `docs/ops/works-portfolio-deploy.md` | 技術ポートフォリオ（営業資料）デプロイ手順 |
| `docs/ops/zod-validation-sop.md` | zod 入力検証 SOP — 全 API ルート構造化バリデーション |
<!-- AUTO-GENERATED:END -->

## 参照資料（判断基準・知識体系）

| ファイル | 用途 |
|---------|------|
| `docs/standards/README.md` | vest1（テンプレート・雛形・チェックリストの正本） |

## 登録基準

- **表 A 登録基準**: `.claude/rules/<rule>.md` で paths 注入される SOP（rule の `paths:` フィールドで対象ファイル編集時に自動注入される）
- **表 B 登録基準**: paths 注入なし、エージェント判断で参照する SOP
- **新規 SOP 作成時の運用**: どちらの経路かを明確化し、対応する表に必ず登録すること（Session 217 T1-T3 で発生した登録非対称性の再発防止）

---

v2.0 | 2026-07-07 | 自動生成区間導入
