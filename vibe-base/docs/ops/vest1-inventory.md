# vest1棚卸し結果

実施日: 2026-04-02
スキャン方法: vest1-inventory-design.md Phase 1 に従い機械的に実施（6種スキャン）

---

## 検出サマリー

| カテゴリ | 検出数 | vest1候補 | 重複あり | 所在不明 |
|----------|--------|-----------|----------|----------|
| テンプレート (T) | 17 | 10 | 4 | 0 |
| ボイラープレート (B) | 3 | 2 | 0 | 0 |
| チェックリスト (C) | 5 | 2 | 2 | 0 |
| **合計** | **25** | **14** | **6** | **0** |

---

## 全件リスト

### テンプレート (T)

| # | ファイルパス | カテゴリ | 内容の概要 | 重複候補 | vest1候補か | 備考 |
|---|-------------|----------|-----------|----------|------------|------|
| T1 | `docs/ops/design-doc-templates.md` | T | 設計書5種（PRD/デザインシステム/画面遷移/ペルソナ/検索） | — | Y | SOP内包型テンプレート集 |
| T2 | `docs/ops/external-service-check-template.md` | T | 外部サービス確認表 | T16, T17 | Y | review-analysisから汎用化 |
| T3 | `docs/ops/failure-scenario-template.md` | T | 障害シナリオ7カテゴリ | T14, T15 | Y | review-analysisから汎用化 |
| T4 | `docs/ops/onboarding-ops-templates.md` | T | 納品3種（プロビジョニング/マニュアル/PH Launch） | T13 | Y | review-analysisから汎用化 |
| T5 | `docs/ops/test-template-guide.md` | T | テスト2種（テストケース/UAT） | T18, T19 | Y | SOP内包型テンプレート集 |
| T6 | `docs/ops/email-template-guide.md` | T | メール設計4類型 | T13 | Y | review-analysisから汎用化 |
| T7 | `docs/ops/feature-comparison-template.html` | T | 競合比較表HTML雛形 | — | Y | comparison-sop.mdが参照 |
| T8 | `docs/templates/client-credentials.md` | T | クライアント納品メッセージ | — | Y | コピペ用テンプレート |
| T9 | `docs/templates/client-credentials.html` | T | T8のHTML版 | T8 | 不明 | md版との関係が不明 |
| T10 | `docs/templates/client-qr-guide.md` | T | QRコード発行・設置ガイド | — | Y | コピペ用テンプレート |
| T11 | `docs/templates/client-qr-guide.html` | T | T10のHTML版 | T10 | 不明 | md版との関係が不明 |
| T12 | `products/ai-concierge/docs/delivery/02-hearing-template.md` | T | ヒアリングテンプレート | — | N | AI Answer固有。vest1候補なし |
| T13 | `products/review-analysis/docs/delivery-template.md` | T | 納品物テンプレート | T4, T6 | N | vest1=T4/T6から派生。先頭に「共有版テンプレート」注記あり |
| T14 | `products/review-analysis/bot/review-app/docs/cl3-failure-scenarios.md` | T | 障害シナリオ記入済み | T3 | N | vest1=T3の記入済みインスタンス |
| T15 | `products/design-seed/docs/cl3-failure-scenarios.md` | T | 障害シナリオ記入済み | T3 | N | vest1=T3の記入済みインスタンス |
| T16 | `products/review-analysis/bot/review-app/docs/external-service-check.md` | T | 外部サービス確認記入済み | T2 | N | vest1=T2の記入済みインスタンス |
| T17 | `products/design-seed/docs/external-service-check.md` | T | 外部サービス確認記入済み | T2 | N | vest1=T2の記入済みインスタンス |
| T18 | `products/review-analysis/bot/review-app/docs/test-plan.md` | T | テスト計画記入済み | T5 | N | vest1=T5の記入済みインスタンス |
| T19 | `products/design-seed/docs/test-plan.md` | T | テスト計画記入済み | T5 | N | vest1=T5の記入済みインスタンス |

### ボイラープレート (B)

| # | ファイルパス | カテゴリ | 内容の概要 | 重複候補 | vest1候補か | 備考 |
|---|-------------|----------|-----------|----------|------------|------|
| B1 | `products/microscope/lp/public/og-template.html` | B | OGP画像テンプレートHTML | B2 | 不明 | microscope固有。他プロダクトに同種なし |
| B2 | `products/microscope/lp/dist/og-template.html` | B | B1のビルド出力 | B1 | N | distは自動生成。正本=B1 |
| B3 | `products/foodee/app/api/lib/firebase-admin.js` | B | Firebase Admin初期化コード | — | N | ファイル名にbase-を含むがスキャン誤検出。ボイラープレートではない |

### チェックリスト (C)

| # | ファイルパス | カテゴリ | 内容の概要 | 重複候補 | vest1候補か | 備考 |
|---|-------------|----------|-----------|----------|------------|------|
| C1 | `docs/ops/vercel-deploy-checklist.md` | C | Vercelデプロイ前後チェック | C3 | Y | review-analysisから汎用化 |
| C2 | `docs/aiueo-dev-checklist.md` | C | Aiueo開発指示チェックリスト | — | N | Aiueo固有の機能実装チェック。汎用テンプレートではない |
| C3 | `products/review-analysis/bot/review-app/docs/vercel-env-checklist.md` | C | Vercel環境変数チェック | C1 | N | vest1=C1から派生。先頭に「共有版テンプレート」注記あり |
| C4 | `products/ai-concierge/dev-checklist.html` | C | AI Answer開発チェックリスト | — | N | AI Answer固有 |
| C5 | `products/foodee/docs/external-service-check.md` | C | 外部サービス確認記入済み | T3 | N | vest1=T3の記入済みインスタンス（C兼T） |

---

## vest1未定義リスト — ✅ 全件解決済み（2026-04-02 Session 111）

| # | 種類の名前 | 判断 | 対応 |
|---|-----------|------|------|
| 1 | ヒアリングテンプレート | vest1化 | `docs/standards/templates/hearing-template.md` に5W2H付き汎用版を配置 |
| 2 | OGPテンプレートHTML | vest1化 | `docs/standards/boilerplate/og-image-template.html` に5W2H付き汎用版を配置 |
| 3 | 運用マニュアル | 対象外 | 固有品（記入済みインスタンス）。vest1テンプレ(§2)は既存 |
| 4 | プロビジョニングガイド | 対象外 | 固有品（記入済みインスタンス）。vest1テンプレ(§1)は既存 |

---

## vest1重複リスト — ✅ 全件解決済み（2026-04-02 Session 111）

| # | 種類の名前 | 判断 | 対応 |
|---|-----------|------|------|
| 1 | クライアント納品メッセージ md/html | 両方残す | 用途違い（テキスト送付 vs 印刷渡し） |
| 2 | QRコード発行ガイド md/html | vest1化 | `docs/standards/templates/qr-guide.md` に5W2H付き汎用版を配置。旧Aiueo固有版を差替 |
| 3 | 価格ガイド 2箇所 | hearing-bot版を削除 | `products/hearing-bot/pricing-guide.md` を削除。CLAUDE.mdの参照先を `docs/pricing-guide.md` に変更 |

---

## 未回収改良リスト — ✅ 全件解決済み（2026-04-02 Session 111）

| # | vest1 | 派生版 | 判断 | 対応 |
|---|-------|-------|------|------|
| 1 | onboarding-ops-templates.md | AI Answer 納品7本 | 現状維持 | 雛形の構造改善なし。派生版は記入済みインスタンス |
| 2 | failure-scenario-template.md | クチコミ分析AI版 | 現状維持 | 雛形を忠実に使用 = テンプレートが機能している証拠 |
| 3 | failure-scenario-template.md | デザインの種版 | 現状維持 | 同上 |
| 4 | external-service-check-template.md | foodee版 | 現状維持 | 同上 |
| 5 | test-template-guide.md | デザインの種版 | vest1に小改善 | テストケーステーブルに「結果」列を追加（4列→5列） |

---

## 補足: SOP内包型テンプレートの一覧

以下はSOPファイル内にテンプレート（記入欄・雛形）が埋め込まれているもの。SOPとしては棚卸し対象外だが、テンプレート部分はvest1管理対象。

| SOP | 内包されるテンプレート | 独立ファイル化済みか |
|-----|---------------------|---------------------|
| `docs/ops/risk-diagnosis-sop.md` | §13 risk-diagnosis.md テンプレート | いいえ（SOP内に埋込） |
| `docs/ops/video-production-sop.md` | Appendix A 進行表テンプレート | いいえ（SOP内に埋込） |
| `docs/ops/legal-reference.md` | Appendix A 法的調査テンプレート | いいえ（SOP内に埋込） |
| `docs/ops/agent-task-protocol.md` | §8-4 調査指示書テンプレート / §8-5 出力フォーマット | いいえ（SOP内に埋込） |
| `docs/ops/product-cycle.md` | §10 レビューチェックリスト集 CL-1〜CL-14 | いいえ（SOP内に埋込） |
| `docs/ops/comparison-sop.md` | 比較表テンプレート参照（`feature-comparison-template.html`） | はい → T7 |

---

## スキャン対象外（除外理由）

| 種別 | 除外件数 | 理由 |
|------|---------|------|
| `.next/` ビルド出力 | 20+ | Next.jsの自動生成ファイル |
| `archive/` | 全件 | 凍結済み |
| `node_modules/` | 全件 | 依存パッケージ |
| `.git/` | 全件 | バージョン管理 |
| SOP手順書本体 | 32本 | 設計書の指示で対象外 |
