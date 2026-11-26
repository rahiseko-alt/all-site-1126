# 全mdファイル棚卸し分類表

> **作成:** 2026-03-17 Session 31
> **分類軸:** スコープ（全体/プロダクト） / 読み込みタイミング / 重要度(A/B/C)
> **タイミング凡例:** 毎回=セッション開始時 / SOP=該当作業前 / 条件付き=製品作業時 / 必要時=参照要時のみ / 不要=通常読まない / 自動=ツール自動読込

---

## 全体スコープ（ルート）

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| 1 | `CLAUDE.md` | 共通憲法 v5.5 | 毎回 | A |
| 2 | `memory.md` | 共有日記（直近5件） | 毎回 | A |
| ~~3~~ | ~~`docs/master-statements-all.md`~~ | ~~削除済み(Session85)~~ | — | — |
| ~~4~~ | ~~`docs/note-material.md`~~ | ~~削除済み(Session31)~~ | — | — |
| 5 | `docs/p0-gap-report.md` | Wikibot/ShiftBoard P0ギャップ（v2.2時点） | 必要時 | C |
| 5b | `docs/web-page-classification.html` | WEBページ分類体系 v1.0（7セクション: 動機→ページ種別→ファネル→レイアウト→技術→収益） | 必要時 | B |
| 5c | `docs/scattered-asset-audit.html` | 散財資産棚卸し結果（A群6件+B群16件+C群2件+D群3件。工程再現性で判定） | 必要時 | A |
| 5d | `docs/pricing-guide.md` | アプリ開発料金設定ガイドv2（人月単価/工程別相場/機能別相場/見積補足7項目） | 必要時 | B |
| 5e | `docs/chatbot-market-research.html` | AIチャットボット市場調査（ココナラ/CW/ランサーズ実データ。価格帯/販売件数/購入者像/依頼内容） | 必要時 | B |
| 5f | `docs/research-bank/index.html` | Research Bankデータバンク（全プロダクト横断リサーチ資産カタログ。検索・フィルタ付き） | 必要時 | A |
| 5g | `docs/research-bank/coconala-dify-competitor-2026.html` | ココナラDify上位出品者競合調査（5出品者の価格構造/納品形態/API費用説明/保守設計/差別化分析） | 必要時 | B |
| 5h | `docs/research-bank/dify-cost-structure-2026.html` | Dify.aiコスト構造詳細調査（Cloud全プラン比較/セルフホスト要件/DSLエクスポート制限/納品方法別コスト試算/ココナラ出品向け） | 必要時 | B |
| 5i | `docs/research-bank/gas-chatbot-market-2026.html` | チャットボット×GAS連携市場調査（ココナラ1,152件/ランサーズ493件/CW。GAS×bot交差点=空白地帯。マネタイズ大作戦ポートフォリオ設計用） | 必要時 | B |
| 5j | `docs/research-bank/coconala-ai-tools-lateral-expansion-2026.html` | ヨコ展開パターン調査（チャットbot以外のAIツール開発20種。価格帯分布/レビュー実績/差別化切り口6案。React+Vercel+AI APIスキルの横展開戦略用） | 必要時 | B |
| 5k | `docs/research-bank/coconala-industry-chatbot-2026.html` | ococonaら業種特化チャットボット市場調査（全480件。業種別キーワード出品数/レビュー実績/汎用vs特化比較/ブルーオーシャン候補。ヨコ展開業種選定用） | 必要時 | B |
| 5l | `docs/research-bank/dify-yokoten-patterns-2026.html` | Difyヨコ展開パターン調査（ココナラDify出品20件超の全量調査。切り口別販売実績/価格帯/ブルーオーシャン候補7領域。チャットbot以外の商品企画用） | 必要時 | B |
| 5m | `docs/research-bank/coconala-price-cross-analysis-2026.html` | ococonala価格x実績クロス分析（AIチャットボット480件直接調査。価格帯別売れ行き実データ/TOP5組み合わせ/高単価売れる条件/空白地帯6候補。ヨコ展開価格設計用） | 必要時 | B |
| 5n | `docs/research-bank/coconala-yokoten-strategy-2026.html` | ヨコ展開戦略レポート統合版（4軸並列調査。業種特化7業種/用途特化5領域/アプリ開発5切り口/価格死の谷分析。優先順位S1〜B2の実行計画付き） | 必要時 | A |
| 5o | `docs/ai-chatbot-value-framework.md` | AIチャットボット価値定義フレームワーク v1.0（AI vs IT住み分け・核心価値「フワッとした要望を要件定義に整形して渡す」・訴求禁止領域・業種別具体例。AI Answer/Dify-Service出品訴求軸の根拠） | 必要時 | A |
| 5p | `docs/research-bank/obsidian-claudecode-japan-2026.html` | Obsidian × Claude Code 国内事業活用 数値根拠（中小DX需要・予算最頻値100-500万・1人IT顧問単価月1-2万〜10万・持続化補助金採択率51%・飲食店DX普及67.5%・3年廃業率70%・海外連携手段kepano-skills等。個人事業の意思決定用、26国内+16海外ソース。軸1/軸2はレート制限で未完） | 必要時 | A |
| 5q | `docs/research-bank/code-review-philosophy-2026.html` | コードレビュー思想・致命見落とし・AIレビュー限界 v2 統合リサーチ（7軸/101ソース。v1: Google/Microsoft/OWASP/MITRE/arXiv 4軸 + v2追加: Claude固有癖/現場ノウハウ/トップエンジニア個人ブログ 3軸。Anthropic Code Review公式FP<1%+GitHub Issues実体験5件+Simon Willison/Atwood/Spolsky/Abramov/Brooker/Hashimoto/Beck/Fowler/Hillel Wayne/Charity Majors/Will Larson/patio11/Kent C. Dodds個人ブログ+Qiita/Zenn/dev.to/HN/Reddit現場声。/code-review v2改修要件17項目+Session 296 Must 5件再判定 M3/M4/M5降格根拠付き） | 必要時 | A |
| 5r | `docs/research-bank/business-card-margin-golden-ratio-2026.html` | タテ型名刺の余白・黄金比デザイン定石（55×91mm。入稿97×61/仕上がり91×55/安全枠85×49・四辺3mm。黄金分割点34.8/56.2mm・三分割・余白率27%・QR15mm角+QZ2mm・連絡先最小6pt。国内印刷6社一致+デンソーウェーブ公式+デザイン定石統合/34ソース） | 必要時 | A |
| 5s | `docs/research-bank/business-card-designer-workflow-2026.html` | プロの名刺デザイン作業フロー（国内9ステップ+ヒアリング9項目+海外Modular Grid 1961+Vignelli/Pentagram+縦型71/29+「カード分解」業界位置判定=Modular Grid と本質一致だが縦型では段分解+中央軸+対角3点に読替え必要・Illustrator標準/Figma増加中・86ソース） | 必要時 | A |
| 5t | `docs/research-bank/business-card-pro-design-thinking-2026.html` | プロの名刺デザイン思考回路（余白決定6ステップ+黄金比「ルールではなく道具」仮説Yes支持+Markowsky 1.6〜1.7区別不能+φ三重道具運用+チャンク4±1+internal:external 1:1.5〜2+Visual Weight 5要素+Squint Test+N字視線+プロの自問14リスト・85ソース） | 必要時 | A |
| 5u | `docs/research-bank/business-card-copy-anti-cliche-2026.html` | 名刺コピー「ダサい/カッコいい」の構造差・逆張り検証（ダサ語60+件分類+5心理学的メカニズム M1クリシェ/M2 zombie nouns/M3 weasel/M4 Trust Equation分母/M5代弁押しつけ+Sagmeister 30年同一/Pentagram非公開/Behance Featured 16件全タグライン不在/原研哉=肩書1語+逆張り10原則+「短く誠実で力強い」数値基準10字以内/動詞1個/修飾語ゼロ/8音節以下+マスター文脈での逆張りコピー10案・107ソース） | 必要時 | A |
| 6 | `memory/patrol.md` | パトロール指示 | 条件付き | B |

## 全体スコープ — SOP（docs/ops/）

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| 7 | `docs/ops/product-cycle.md` | PCサイクル v9.0 | SOP | A |
| 7b | `docs/ops/agent-rules.md` | 全エージェント共通ルール v3.5（思考原則+報告ラベル+過失教訓参照義務+プロダクト固有情報の記録場所規律） | 常時 | A |
| 7c | `docs/ops/session-191-lessons.md` | 司令塔6件過失カタログ+3軸独立調査具体例+Check-in自己診断チェックリスト | 常時 | A |
| 8 | `archive/git-workflow.md` | コミット・ブランチ手順（廃止・session-lifecycle.md に統合 2026-05-11） | 廃止 | — |
| 9 | `docs/ops/memory-ops.md` | memory.md書込・圧縮・/clear詳細手順 | SOP | A |
| 10 | `docs/ops/handoff-protocol.md` | AI間引き継ぎ・外部製品取込5ステップ | SOP | A |
| 11 | `docs/ops/comparison-sop.md` | 比較・検証統合表SOP (旧competitive-research-sop) | SOP | A |
| 12 | `docs/ops/folder-lifecycle.md` | フォルダ構造変更SOP | SOP | A |
| 13 | `archive/agent-task-protocol.md` | エージェントタスク委託手順（廃止 2026-05-12: 公式ドキュメントで代替・vibe-base 独自規範は self-verification / 三打席で代替済） | 廃止 | — |
| 15 | `docs/ops/revision-history.md` | CLAUDE.md改訂履歴 | 必要時 | C |
| 15b | `docs/ops/risk-diagnosis-sop.md` | リスク診断SOP v2.0（P0全件フィルター+タグ方式+ゲート消化+本フィルター） | SOP | A |
| 15d | `docs/ops/risk-registry.md` | 共有リスク台帳（全プロダクト横断の既知リスク蓄積。閲覧=全員、記入=vibe-baseのみ） | SOP | A |
| 15e | `docs/ops/dead-end-registry.md` | ドン詰まり台帳（外部サービス既知制約。P0#10フィルタで照合必須。ドン詰まり発生時に追記） | SOP | A |
| 15c | `docs/ops/legal-reference.md` | 法令表記（特商法/プライバシー/利用規約） | SOP | A |
| 15e2 | `docs/ops/shared-asset-ops.md` | 散財→共有資産化SOP v1.1（vibe-base司令塔のみ） | SOP | A |
| 15f | `docs/ops/research-bank-sop.md` | Research Bankデータバンク運用ルール v2.0（リサーチ+CSS計測+スクリプト等セッション成果物を一元蓄積） | SOP | A |
| 15g | `docs/ops/external-service-check-template.md` | 外部サービス確認テンプレート v1.0（P1 #7用。SDK/認証/制限/リスク/対応の調査フォーマット） | SOP | A |
| 15h | `docs/ops/vercel-deploy-checklist.md` | Vercelデプロイ前チェックリスト v1.0（環境変数+GCP設定+デプロイ前後確認） | SOP | A |
| 15h | `docs/ops/email-template-guide.md` | メール自動送信設計テンプレート v1.0（P2 #20-21用。4類型: ウェルカム/フォローアップ/管理者通知/自動返信） | SOP | B |
| 15i | `docs/ops/failure-scenario-template.md` | 障害シナリオ分析テンプレート v1.0（P1 #12 CL-3用。7カテゴリの障害分析フレームワーク） | SOP | A |
| 15j | `docs/ops/design-doc-templates.md` | 設計ドキュメントテンプレート集 v1.0（PRD/デザインシステム/画面遷移+API/ペルソナ+ジャーニー/検索設計） | SOP | B |
| 15k | `docs/ops/test-template-guide.md` | テスト系テンプレートガイド v1.0（P1 #10-11用。TCグループ分類+レスポンシブ検証+UATチェックリスト） | SOP | B |
| 15l | `docs/ops/onboarding-ops-templates.md` | 運用・納品テンプレート集 v1.0（P2 #23-24用。プロビジョニングガイド/運用マニュアル/PH Launch） | SOP | B |
| 15m | `docs/ops/feature-inventory-sop.md` | 機能棚卸し表SOP v1.0（全機能×8列HTML。実装状態/実行可否/API種類/コスト/発火タイミング） | SOP | A |
| 15n | `archive/agent-task-protocol.md` | エージェントタスクプロトコル（廃止 2026-05-12） | 廃止 | — |
| 15o | `docs/ops/project-promotion.md` | プロジェクト昇格手順（外部リポ→vibe-base移管。移動元削除+記録更新+技術検証） | SOP | B |
| 15p | `docs/ops/ui-clone-sop.md` | 廃止。`/web-design`（docs/standards/web-design-flow.md）へ統合。本ファイルは pointer のみ | SOP | B |
| 15q | `docs/ops/rules-verification-matrix.html` | ルール構造改革 発火検証マトリクス（.claude/rules/ 14ファイル vs PC表73タスク。自動注入率87.5%。最小検証セット11タスク。v5.4 で web-design.md 追加） | 参照 | A |
| 15r | `docs/ops/rule-structure-reform-audit.html` | ルール構造改革1+2 セカンドオピニオン審査資料（3層設計・全rulesファイル全文・持続性ガード・検証結果・残存リスク） | 参照 | A |
| 15s | `docs/ops/vest1-inventory.md` | vest1棚卸し結果（T18/B5/C5。vest1候補16件。重複4件。未回収改良5件。SOP内包テンプレート6件） | 参照 | A |
| 15t | `docs/ops/vest1-undefined-review.html` | vest1未定義4件レビュー（ヒアリング/OGP/運用マニュアル/プロビジョニング。判断選択肢+推奨付き） | 参照 | B |
| 15u | `docs/standards/templates/hearing-template.md` | vest1: ヒアリングテンプレート（受託納品型プロダクト共通。5W2H付き） | vest1 | A |
| 15v | `docs/standards/boilerplate/og-image-template.html` | vest1: OGP画像テンプレート（SNSシェア用サムネイル。5W2H付き。EDIT HEREで差替） | vest1 | A |
| 15w | `docs/ops/vest1-duplicate-review.html` | vest1重複4件レビュー（credentials md/html・QRガイド・PC表旧版・pricing-guide） | 参照 | B |
| 15x | `docs/standards/templates/qr-guide.md` | vest1: QRコード発行・設置ガイド（汎用版。5W2H付き） | vest1 | A |
| 15y | `docs/ops/vest1-improvement-review.html` | vest1未回収改良5件レビュー（納品/障害シナリオ×2/外部サービス/テスト計画。4件現状維持+1件小改善） | 参照 | B |
| 15z | `docs/standards/vest1-catalog.html` | vest1全13件カタログ（5W2H+素人向け説明。カード型UI。T/B/C分類） | 参照 | A |
| 15z2 | `docs/ops/vest1-gap-analysis.html` | vest1ギャップ分析v2（PC表74タスク×計測記録×品質検証。❌9件+△8件） | 参照 | A |
| 15z3 | `docs/ops/vest1-gap-materials.html` | vest1ギャップ材料一覧（既存プロダクトから発見したひな形素材。6件発見+3件なし） | 参照 | A |
| 15z4 | `docs/standards/templates/revenue-model.md` | vest1: 収益モデル設計テンプレート（P0#14-15。損益計算+競合価格比較+損益分岐点） | vest1 | A |
| 15z5 | `docs/standards/templates/site-measurement.md` | vest1: サイト計測表テンプレート（STEP 3-5統合。メタデータ+座標+CSS30項目+検証結果） | vest1 | A |
| 15z6 | `docs/standards/templates/hypothesis-verification.md` | vest1: 即死仮説検証記録テンプレート（P1#9a。仮説×計測×合否判定） | vest1 | A |
| 15z7 | `docs/standards/templates/monitoring-design.md` | vest1: ログ・監視設計テンプレート（P1#9b。ログ収集+アラート+死活監視+障害対応フロー） | vest1 | A |
| 15z8 | `docs/standards/templates/performance-baseline.md` | vest1: 性能ベースライン計測表テンプレート（P1#9c。Lighthouse+API応答+リソースサイズ+P4比較用） | vest1 | A |
| 15z9 | `docs/standards/checklists/seo-checklist.md` | vest1: SEO設定チェックリスト（P2#5-8。ページ×5項目マトリクス+検証結果） | vest1 | A |
| 15z10 | `docs/standards/boilerplate/legal-template.html` | vest1: 利用規約+プライバシーポリシー+免責事項HTMLテンプレート（P2#13。9条+5条+免責） | vest1 | A |
| 15z11 | `docs/standards/templates/marketing-tracker.md` | vest1: 集客施策管理表テンプレート（P3#1,3。チャネル選定+導線設計+施策管理+KPI） | vest1 | A |
| 15z12 | `docs/standards/templates/p4-measurement.md` | vest1: P4計測ダッシュボードテンプレート（P4#1-2。KPIステージ別+トラフィック+収益+劣化検知+Go/No-Go） | vest1 | A |
| 15z13 | `docs/ops/vest1-new-9-overview.html` | vest1新規9件一覧（ギャップ分析v2で特定→作成した9テンプレートのカード型サマリー） | 参照 | B |
| 15z16 | `docs/standards/templates/components.md` | vest1: コンポーネントカタログテンプレート v1.0（Atomic Design 3階層。SKILL.md v11対応） | vest1 | A |
| 15z17 | `docs/standards/checklists/area-setup-checklist.md` | vest1: 運用エリア新設チェックリスト v1.1（4点セット+hook伝播） | vest1 | A |
| 15z18 | `docs/standards/boilerplate/thumbnail-master.html` | vest1 #26 v2.0: サムネイル お手本（全プロダクト共通の最初の1枚。中央集約型/1220x1240縦長/パープル×バイオレット×ゴールド/70:25:5/ジャンプ率211:119:43） | vest1 | A |
| 15z19 | `docs/standards/templates/thumbnail-master-guide.md` | vest1 #27 v2.0: サムネイル お手本 黄金律ガイド（5原則解説: 構図/配置/文字数/配色/階層。#26の運用ルール。アクセント色分散禁止） | vest1 | A |
| 15z21 | `docs/ops/notebooklm-mcp-sop.md` | NotebookLM MCP運用SOP v1.0（ノート記入ルール・context圧迫対策・query結果保存・判断フロー） | SOP | A |

## Aiueo スコープ（docs/ + products/aiueo/）

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| 16 | `products/aiueo/CLAUDE.md` | 自治憲法 v1.2 | 条件付き | A |
| 17 | `docs/aiueo-p0-plan.md` | P0仮説テーブル（P2#13/P4参照） | 条件付き | A |
| 18 | `products/aiueo/pc-progress.md` | PC表（製品ディレクトリに移動済み） | 条件付き | A |
| 19 | `docs/client-registry.md` | Bモデル クライアント台帳 | 条件付き | A |
| 20 | `docs/aiueo-business-model-decision.md` | Bモデル決定全文 | 必要時 | B |
| 21 | `docs/aiueo-dev-checklist.md` | 開発チェックリスト（feature-comparison.htmlから参照） | 必要時 | B |
| 22 | `docs/aiueo-external-services.md` | 外部サービス一覧 | 必要時 | B |
| 23 | `docs/aiueo-ui-competitive-research.md` | UI競合調査（UI変更時必須） | 必要時 | B |
| 24 | `docs/kds-dashboard-ui-research.md` | KDS/ダッシュボードUI調査 | 必要時 | B |
| 25 | `docs/pos-checkout-ui-research.md` | レジUI調査 | 必要時 | B |
| 26 | `docs/onboarding-setup.md` | 半自動オンボーディング手順 | 必要時 | B |
| 27 | `docs/templates/client-credentials.md` | クライアント資格情報テンプレ | 必要時 | B |
| 28 | `docs/templates/client-qr-guide.md` | QRガイドテンプレ | 必要時 | B |
| ~~29~~ | ~~`docs/plan-session20-resilience.md`~~ | ~~削除済み(Session32)~~ | — | — |
| 30 | `docs/backend-hosting-decision.md` | ADR: ホスティング選定 | 必要時 | C |
| 31 | `products/aiueo/app/docs/prd.md` | 製品要求仕様 | 必要時 | A |
| 32 | `products/aiueo/app/PLAN.md` | スプリント仕様書（1,325行） | 必要時 | B |
| 33 | `products/aiueo/app/docs/screen-flow-and-api-spec.md` | 画面遷移+API仕様 | 必要時 | B |
| 34 | `products/aiueo/app/docs/operation-manual.md` | 運用マニュアル（オーナー向け） | 必要時 | B |
| 35 | `products/aiueo/app/docs/user-acceptance-test.md` | UATチェックリスト | 必要時 | B |
| ~~36~~ | ~~`products/aiueo/app/docs/development-guidelines.md`~~ | ~~削除済み(Session31)~~ | — | — |
| ~~37~~ | ~~`products/aiueo/app/docs/technical-due-diligence.md`~~ | ~~削除済み(Session32)~~ | — | — |
| ~~38~~ | ~~`products/aiueo/app/docs/system-handover.md`~~ | ~~削除済み(Session31)~~ | — | — |
| ~~39~~ | ~~`products/aiueo/app/docs/press-kit.md`~~ | ~~削除済み(Session31)~~ | — | — |
| 40 | `products/aiueo/app/docs/sheets-schema.md` | GAS時代スキーマ（遺物） | 不要 | C |
| ~~41~~ | ~~`products/aiueo/app/docs/templates/kickoff-prompt.md`~~ | ~~削除済み(Session31)~~ | — | — |
| ~~42~~ | ~~`products/aiueo/app/docs/templates/prd-template.md`~~ | ~~削除済み(Session31)~~ | — | — |
| ~~43~~ | ~~`products/aiueo/app/docs/templates/quality-check-prompt.md`~~ | ~~削除済み(Session31)~~ | — | — |
| ~~44~~ | ~~`products/aiueo/app/.agent/workflows/opus-rule.md`~~ | ~~削除済み(Session31)~~ | — | — |
| 45 | `products/aiueo/app/.claude/skills/shadcn-ui.md` | shadcn-uiスキル定義 | 自動 | C |
| ~~46~~ | ~~`products/aiueo/app/handover.md`~~ | ~~削除済み(Session31)~~ | — | — |
| 47 | `products/aiueo/app/backend/changelog.md` | PBバックエンド変更履歴 | 不要 | C |
| 48 | `products/aiueo/app/backend/license.md` | PBライセンス | 不要 | C |
| 49 | `products/aiueo/app/readme.md` | プロジェクトREADME | 不要 | C |
| 50 | `products/aiueo/app/frontend/readme.md` | フロントREADME | 不要 | C |
| 51 | `products/aiueo/lp/docs/session27-handoff.md` | Session27引き継ぎ | 不要 | C |
| 52 | `products/aiueo/lp/docs/cta-before.md` | CTA修正前記録 | 不要 | C |
| 53 | `products/aiueo/video/assets/README_LOGO.md` | ロゴアセット説明 | 不要 | C |
| 54 | `products/aiueo/video/public/README_BGM.md` | BGMアセット説明 | 不要 | C |

<!-- microscope → 廃棄済み 2026-04-29（マスター指示） -->

## クチコミ分析AI スコープ

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| 59 | `products/review-analysis/CLAUDE.md` | 自治憲法 v1.0 | 条件付き | A |
| 60 | `docs/review-ai-competitor-research.md` | 競合調査票 | 必要時 | B |
| 61 | `products/review-analysis/bot/demo-manual.md` | GAS版デモ取扱説明書 | 必要時 | B |
| 62 | `products/review-analysis/bot/review-app/docs/external-services.md` | 外部サービス一覧 | 必要時 | B |
| 63 | `products/review-analysis/bot/review-app/README.md` | プロジェクトREADME | 不要 | C |

## Wikipedia Draft Bot スコープ

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| ~~64~~ | ~~`products/wikipedia-draft-bot/project-guidelines.md`~~ | ~~削除済み(Session31)~~ | — | — |
| 65 | `products/wikipedia-draft-bot/wikipedia-draft.md` | 草案テンプレ/管理 | 必要時 | C |
| 66 | `products/wikipedia-draft-bot/.agent/skills/wikipedia-author/SKILL.md` | エージェントスキル定義 | 自動 | C |
| 67 | `products/wikipedia-draft-bot/drafts/` **×14件** | 成果物（草案） | 不要 | C |

## Booking App スコープ（削除予定）

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| 68 | `products/booking-app/readme.md` | プロジェクトREADME | 不要 | C |
| 69 | `products/booking-app/master-prompt.md` | マスタープロンプト | 不要 | C |
| 70 | `products/booking-app/quality-check-prompt.md` | 品質チェック | 不要 | C |
| 71 | `products/booking-app/docs/prd.md` | 製品仕様 | 不要 | C |
| 72 | `products/booking-app/docs/api-spec.md` | API仕様 | 不要 | C |
| 73 | `products/booking-app/docs/db-schema.md` | DBスキーマ | 不要 | C |
| 74 | `products/booking-app/docs/screen-flow.md` | 画面遷移 | 不要 | C |
| 75 | `products/booking-app/docs/changelog.md` | 変更履歴 | 不要 | C |
| 76 | `products/booking-app/frontend/readme.md` | フロントREADME | 不要 | C |

## Shift Board App スコープ（削除予定）

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| 77 | `products/shift-board-app/readme.md` | プロジェクトREADME | 不要 | C |
| 78 | `products/shift-board-app/MASTER_PROMPT.md` | マスタープロンプト | 不要 | C |
| 79 | `products/shift-board-app/QUALITY_CHECK_PROMPT.md` | 品質チェック | 不要 | C |
| 80 | `products/shift-board-app/.agent/workflows/opus-rule.md` | エージェントワークフロー | 不要 | C |
| 81 | `products/shift-board-app/docs/prd.md` | 製品仕様 | 不要 | C |
| 82 | `products/shift-board-app/docs/API_SPEC.md` | API仕様 | 不要 | C |
| 83 | `products/shift-board-app/docs/DB_SCHEMA.md` | DBスキーマ | 不要 | C |
| 84 | `products/shift-board-app/docs/SCREEN_FLOW.md` | 画面遷移 | 不要 | C |
| 85 | `products/shift-board-app/docs/changelog.md` | 変更履歴 | 不要 | C |

## その他プロダクト

| # | ファイル | スコープ | 内容 | タイミング | 重要度 |
|---|---------|---------|------|----------|--------|
| 87 | `products/x-bot/CLAUDE.md` | x-bot | 自治憲法 v1.0（X自動投稿BOT、x-poster-gas置換） | 条件付き | A |
| 87b | `products/x-bot/pc-progress.html` | x-bot | PC表 | 条件付き | A |
| 88 | `products/kobaraku/design-spec.md` | Kobaraku | デザイン仕様書 | 条件付き | B |
| 89a | `products/kobaraku/CLAUDE.md` | Kobaraku | 自治憲法 v1.0 | 条件付き | A |
| 89b | `products/kobaraku/pc-progress.md` | Kobaraku | PC表 | 条件付き | A |
| 90a | `products/foodee/CLAUDE.md` | foodee | 自治憲法 v1.2 | 条件付き | A |
| 90b | `products/foodee/pc-progress.html` | foodee | PC表 | 条件付き | A |
| 90c | `products/foodee/risk-diagnosis.md` | foodee | リスク診断書 | 条件付き | A |
| 90d | `products/foodee/legal-and-ux-reference.md` | foodee | 法務・UX統合リファレンス（著作権法+Feedlyベンチマーク） | 条件付き | B |
| 91d | `products/ai-concierge/CLAUDE.md` | ai-concierge | 自治憲法 v4.0（1名体制+技術スタック+ビジネスモデル） | 条件付き | A |
| 91d-2 | `products/ai-concierge/handoff.md` | ai-concierge | 統合引き継ぎ書（1名体制移行。旧handoff-a/d廃止） | 条件付き | A |
| 91d-5 | `products/ai-concierge/listing-draft-a.md` | ai-concierge | ココナラ出品原稿A（WebアプリMVP開発 ¥20,000） | 必要時 | B |
| 91d-6 | `products/ai-concierge/listing-draft-b.md` | ai-concierge | ココナラ出品原稿B（AI Answer ¥30,000） | 必要時 | B |
| 91d-7 | `products/ai-concierge/listing-draft-c.md` | ai-concierge | ココナラ出品原稿C（AI連携ツール汎用 ¥20,000） | 必要時 | B |
| 91e | `products/ai-concierge/market-research.html` | ai-concierge | P0市場調査（問い合わせ対応課題6項目のデータ集） | 条件付き | B |
| 91f | `products/ai-concierge/p0-research.html` | ai-concierge | P0統合リサーチレポート（市場145億円/SMB採用1.3%/買い切りモデル/ターゲット定義根拠30+ソース） | 条件付き | B |
| 91g | `products/ai-concierge/pc-progress.html` | ai-concierge | PC表 v8.7 | 条件付き | A |
| 91h | `products/ai-concierge/dev-checklist.html` | ai-concierge | プロジェクト固有チェック表 v1.0（実装34タスク。PC表と併用） | 条件付き | A |
| 92a | `products/ymm-shorts/CLAUDE.md` | ymm-shorts | 自治憲法 v0.3（マスター個人ローカル Python CLI 開発・pyautogui + YMM4 GUI 自動化・Session 277 で実装本体を src/ に集約） | 条件付き | A |
| 92b | `products/ymm-shorts/handoff.md` | ymm-shorts | 引継ぎ書（10 章・Session 257 経緯 + #1/#4 残タスク） | 条件付き | A |
| 92c | `products/ymm-shorts/pc-progress.html` | ymm-shorts | PC 表 v9.3 | 条件付き | A |
| 92d | `products/ymm-shorts/runbook.md` | ymm-shorts | 運用 Runbook（標準テンプレ転記・中身埋めは方針確定後） | 条件付き | B |
| 92e | `products/ymm-shorts/cost-config.md` | ymm-shorts | コスト・予算設定（標準テンプレ転記・中身埋めは方針確定後） | 条件付き | B |
| 92f | `products/ymm-shorts/backup-config.md` | ymm-shorts | バックアップ設定（標準テンプレ転記・中身埋めは方針確定後） | 条件付き | B |
<!-- biz-efficiency → 廃番済み 2026-05-02 Session 241（旧 94a-94f 全削除） -->

## アーカイブ（一括）

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| 89 | `archive/antigravity-daily/` **×8件** | Antigravity日報 | 不要 | C |
| 90 | `archive/mission-log-*` **×20件** | 過去memory.md | 不要 | C |

## Remotionスキル（一括）

| # | ファイル | スコープ | 内容 | タイミング | 重要度 |
|---|---------|---------|------|----------|--------|
| 91 | `products/aiueo/video/.skills/remotion/` **×31件** | Aiueo | Remotionルール（ツール提供） | 自動 | C |

## vibe-base共有スキル（.claude/skills/）

| # | ファイル | 内容 | タイミング | 重要度 |
|---|---------|------|----------|--------|
| 91b | `.claude/skills/fix-loop/SKILL.md` | 対策検証ループ v2.0（A:再発/B:新規分岐。ドライラン必須） | 自動 | A |
| 91d-2 | `.claude/skills/deep-research/SKILL.md` | ディープリサーチ+Bank登録スキル | 自動 | A |

## Auto-Memory（~/.claude/projects/.../memory/）

| # | ファイル | スコープ | 内容 | タイミング | 重要度 |
|---|---------|---------|------|----------|--------|
| 92 | `MEMORY.md` | 全体 | メモリ索引 | 毎回(自動) | A |
| 93 | `feedback_aiueo-focus-only.md` | 全体 | Aiueo以外提示禁止 | 毎回(自動) | A |
| 94 | `feedback_customer-facing-bugs.md` | 全体 | 顧客影響=深刻バグ | 毎回(自動) | A |
| 95 | `feedback_mockup-quality.md` | 全体 | UI変更=競合調査必須 | 毎回(自動) | A |
| 96 | `feedback_ui-refresh-opus-only.md` | 全体 | UI刷新はOpusのみ | 毎回(自動) | A |
| 97 | `feedback_wait-for-go.md` | 全体 | 正式GO前に着手するな | 毎回(自動) | A |
| 98 | `feedback_reasoning-gear.md` | 全体 | 推論矯正ルール | 必要時 | B |
| 99 | `feedback_x-posting-manual.md` | 全体 | X投稿=マスター手動 | 必要時 | B |
| 100 | `feedback_no-rework-feature-table.md` | 全体 | 機能比較表再作成禁止 | 必要時 | B |
| 101 | `feedback_open-html-yourself.md` | 全体 | HTMLは自分で開け | 必要時 | B |
| 102 | `feedback_p4-no-todo.md` | 全体 | P4計測TODO非表示 | 必要時 | B |
| 103 | `feedback_sonnet-in-ag-dir.md` | 全体 | Sonnetもエージェント配下で作業可 | 必要時 | B |
| 104 | `project_governance-reform.md` | 全体 | ガバナンス改革案（Session28合意） | 条件付き | A |
| 105 | `project_aiueo-business-model.md` | Aiueo | Bモデル確定 | 必要時 | A |
| 106 | `project_aiueo-dev-priorities.md` | Aiueo | 開発優先度(3/14確定) | 必要時 | B |
| 107 | `project_onboarding-semi-auto.md` | Aiueo | オンボーディング半自動化 | 必要時 | B |
| 108 | `project_ui-refresh-state.md` | Aiueo | UI刷新現状 | 必要時 | B |
| 109 | `reference_aiueo-feature-table.md` | Aiueo | 機能比較表への参照 | 必要時 | B |
| 110 | `project_review-ai-dev-decisions.md` | クチコミ分析AI | 開発判断記録 | 必要時 | B |
| 111 | `project_p3-hold.md` | 全体 | 集客話題禁止 | 必要時 | B |
| 112 | `project_session20-reform-plan.md` | 全体 | Session20改革計画 | 必要時 | C |
| ~~113~~ | ~~`project_skill-proposals.md`~~ | ~~全体~~ | ~~削除済み(Session31)~~ | — | — |
| ~~114~~ | ~~`project_pc-sales-ready-gap.md`~~ | ~~全体~~ | ~~削除済み(Session31)~~ | — | — |
| 115 | `pc-prompt-feedback.md` | 全体 | PC管理プロンプト改善メモ | 必要時 | B |
| 116 | `ga4-mcp-setup.md` | 全体 | GA4 MCP設定 | 必要時 | B |
| 117 | `litlink-setup.md` | 全体 | lit.link集客導線 | 必要時 | C |
| ~~118~~ | ~~`master-statements-key.md`~~ | ~~全体~~ | ~~廃止(Session85)~~ | — | — |
| ~~119~~ | ~~`x-poster-v6-sheets-design.md`~~ | ~~X-Poster~~ | ~~廃止(Session216 x-poster-gas完全破棄)~~ | — | — |

---

## 集計

| 重要度 | 件数 | 割合 |
|--------|------|------|
| A | 23 | 18% |
| B | 46 | 37% |
| C | 51 | 41% |

| タイミング | 件数 |
|-----------|------|
| 毎回/毎回(自動) | 8 |
| SOP | 8 |
| 条件付き | 17 |
| 必要時 | 45 |
| 不要 | 38 |
| 自動 | 4 |
