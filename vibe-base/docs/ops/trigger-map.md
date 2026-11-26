# 統合トリガーマップ v2.0

> 元 auto-memory/trigger-map.md から移行 (2026-06-10)

**使い方:** アクション実行前に、これからやることが下記に該当するか確認。
- 「発火スキル」列にスキルがあれば、その順序で発火
- 「参照」列にファイルがあれば、発火前に読む

## スキル発火テーブル

| # | トリガー（これからやること） | 発火スキル（→は連鎖順） | 参照SOP・メモリ |
|---|---------------------------|----------------------|---------------|
| 1 | **製品名を指定して作業開始** | `/pc-checkin` → 次タスクに応じた下記スキル | memory.md, 自治憲法 |
| 2 | **LP制作・ランディングページ作成** | `/web-design` | `lp-design-sop.md`, `ui-clone-sop.md`, `reference-site-selection-sop.md` |
| 3 | **UI模写・クローン・デザイン再現** | `/web-design` | `ui-clone-sop.md` |
| 4 | **参考サイト選定・CSS計測** | `/web-design` | `reference-site-selection-sop.md`, `research-bank-sop.md` |
| 5 | **デプロイ・本番反映** | `/vercel-deploy` | `vercel-deploy-checklist.md` |
| 6 | **セキュリティ診断** | `/security-review` | — |
| 7 | **コードレビュー** | `/code-review` | — |
| 8 | **ディープリサーチ・根拠が必要な意思決定** | `/deep-research` | `research-bank-sop.md` |
| 9 | **再発指摘（「前も言った」等）/ 対策をファイルに記録** | `/fix-loop` | MEMORY.md, `agent-rules.md` |
| 10 | **アニメーション・モーション追加** | `/web-design`（※模写完了後の部分変更フェーズのみ） | — |
| 11 | **無限スクロール要素（ロゴ/証言/ティッカー）** | `/web-design`（※模写完了後の部分変更フェーズのみ） | — |
| 12 | **ヒーロー背景グリッド** | `/web-design`（※模写完了後の部分変更フェーズのみ） | — |
| 13 | **機会再評価・眠ってるネタ掘り起こし・新しいビジネスチャンス探索（新能力で過去ネタを再評価）** | `/opportunity-scan` | `reference_knowledge-vault.md`, `project_business-concept.md` |
| 14 | **plan 完遂宣言・マイルストーン完了判定・commit 前検証** | `verification-panel-call` → 検証パネル（レンズ選定は `docs/standards/verification-panel.md` の選別マトリクス・verify-agent は全ケース必須） | `docs/standards/verification-panel.md`, orchestration-discipline 規律3 |
| 15 | **求人・案件への応募文作成**（司令塔が直に書くな） | `job-application-writer` サブへ委譲（foreground）。**骨子（事実）が無ければ書かせるな**・出力後は骨子との差分と数値の算術を司令塔が検算 | hook `job-application-agent-gate`（UserPromptSubmit・root のみ）／対象外＝出品文・営業提案書・改善提案 |
| 16 | **外部公開物（ポートフォリオ/LP/提案書/レポート）の作成・修正・commit 前** | `masking-grep` | `docs/standards/masking-dictionary.json` |
| 17 | **複数エージェント展開・N体並列・編成** | `formation` | `docs/rules/orchestration-discipline-canonical.md` |
| 18 | **統廃合・廃番・撤去・製品を畳む** | `decommission-plan` | `docs/ops/dead-products-registry.md` |

## メモリ参照テーブル（スキル発火なし・行動規範のみ）

| # | トリガー（これからやること） | 参照メモリ |
|---|---------------------------|-----------|
| 15 | ファイル作成・編集後 | `research-bank-sop.md` §5-2 参照 |
| 16 | 選択肢・提案 | MEMORY.md P2 行動規範 |
| 17 | 外部サービス選定 | `dead-end-registry.md`, 既存インフラ横展開が先（MEMORY.md P2） |
| 18 | リサーチ成果物の保存 | `research-bank-sop.md` §5-2（EXIT前にBank登録+index.htmlエントリ追加） |
| 19 | Check-out・引き継ぎ | `research-bank-sop.md` §5-2 |
| 20 | マスターの質問に回答 | MEMORY.md P2 行動規範 |
| 21 | コスト関連の提案 | MEMORY.md P2 行動規範 |
| 22 | foodee作業 | `products/foodee/CLAUDE.md` |
| 23 | **APIキー未設定・無効に遭遇** | `agent-rules.md`「APIキー未設定時の行動ルール」— **他プロダクトの.envを読むな。マスターに報告して待機** |

| 27 | **「エルメ」「L Message」「LMessage」発話** | `products/biz-efficiency/line-erume-setup/README.md` 先頭を読む → 該当ファイルへ誘導 |
| 28 | **「LINE設定」「LINE連携」「LINE代行」発話** | `products/biz-efficiency/line-erume-setup/sop-official-flow.md` + `customer-manual.html` |
| 29 | **「名刺」「QR」「友だち追加URL」発話** | `products/biz-efficiency/line-erume-setup/management-plan.md` §4 |
| 30 | **「エルメ失敗」「既読つかない」「Webhook届かない」発話** | `products/biz-efficiency/line-erume-setup/failure-catalog.md` |
| 31 | **「代行サービス」「エルメ出品」「LINE設定販売」発話** | `products/biz-efficiency/line-erume-setup/management-plan.md` §6 + `customer-manual.html` |
| 32 | **「小齊平 LINE」「@559jnyrg」「前回のLINE」発話** | `products/biz-efficiency/line-erume-setup/README.md` §稼働中アセット |

## 禁止ルート

| 禁止 | 理由 |
|------|------|
| アニメーション・マーキー・ヒーローグリッド系の `/web-design` を模写完了前に発火 | 部品追加は模写→承認後のフェーズでのみ実施 |
| `/web-design` を競合分析・コピーライティング工程なしにLP制作に使用 | PASONA構成・競合分析・コピーライティングが欠落する |

**Why:** 旧trigger-mapはメモリ参照ガイドのみで、スキル発火の導線がなかった。14スキル中4つしかカバーされず、発火漏れ・順序逆転が発生していた。

**How to apply:** ツール呼び出しの直前にこのマップを照合。該当行があればスキルを発火し、参照ファイルを読んでから動け。
