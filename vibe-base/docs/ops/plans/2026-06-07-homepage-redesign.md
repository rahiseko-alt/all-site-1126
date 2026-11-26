# 2026-06-07-homepage-redesign

小齊平 恒平さんのホームページを「AI顧問 / APP開発 / AI個人コーチ」を軸にした未来的でプレミアム感のある個人サイトへリニューアルする実装計画書。

## 上位 plan からの constraint 変更
N/A

## 影響範囲
`products/homepage/index.html` [MODIFY]

## サブエージェント割り振り方針
- **調査**: `explore-agent` (haiku) を用いて、既存の `index.html` のCSSクラス構造とレスポンシブ設定を確認。
- **実装**: `implement-agent` (sonnet) を用いて、CSS変更およびHTMLコンテンツの改修を実施。
- **検証**: `verify-agent` (haiku) を用いて、受入基準のコマンド実行とローカル検証を実施。

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前確認およびバックアップ | orchestrator | opus | — | `cp products/homepage/index.html products/homepage/index.html.bak` でバックアップ取得 |
| 1 | デザインシステム（CSS変数・光彩効果）の改修 | implement-agent | sonnet | @products/homepage/index.html | TSLデモから着想を得た「AI」感のあるインディゴ/パープルの光彩を定義 |
| 2 | ヒーローセクションおよびナビゲーションの改修 | implement-agent | sonnet | @products/homepage/index.html | キャッチコピーと事業定義の更新 |
| 3 | 3大事業（AI顧問/APP開発/AI個人コーチ）紹介セクションの実装 | implement-agent | sonnet | @products/homepage/index.html | すりガラスカードとネオングローホバーを持つ3列レイアウト（レスポンシブ時は1列） |
| 4 | 料金体系（Pricing）の刷新 | implement-agent | sonnet | @products/homepage/index.html | 新しい3大事業に対応した適正価格への更新 |
| 5 | 実績（Works）および自己紹介（About Me）の文脈調整 | implement-agent | sonnet | @products/homepage/index.html | 開発実績とコーチング実績としての位置付け、ストーリーの修正 |
| 6 | 構文検査とローカル表示テスト | verify-agent | haiku | @products/homepage/index.html | `node scripts/check-hooks-syntax.mjs` およびローカルブラウザ確認での崩れなし確認 |
| 7 | 本番デプロイと動作確認 | orchestrator | opus | — | `vercel deploy --prod`（homepageディレクトリ内）で本番公開し、URLで確認 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| レスポンシブ時（スマホ表示）のレイアウト崩れ | ローカル表示確認時にフレックス/グリッド要素がはみ出す | 原則 2: メディアクエリの閾値を調整し、1列表示にフォールバックさせる |
| Vercelデプロイエラー（Root Directory齟齬など） | `vercel deploy` が非ゼロで終了する | 原則 3: `.vercel/project.json` および `vercel.json` の設定が変更されていないか照合し、現状維持で再デプロイ |

## テスト方針
1. `node scripts/check-hooks-syntax.mjs` が成功すること
2. `bash scripts/check-in-verify.sh` が成功すること
3. `products/homepage/index.html` をブラウザで開き、スクロールアニメーションやホバー時のグロー効果が崩れなく動作すること

## 受け入れ基準
- **EARS**:
  - `WHEN the index.html is loaded in a browser THE SYSTEM SHALL display the profile of Kouhei Kosehira featuring three core services: AI Advisor, App Development, and AI Personal Coach, with responsive layout and modern aesthetics.`
- **機械検証**:
  - `Glob: products/homepage/index.html → 1 file`
  - `grep -q "AI顧問" products/homepage/index.html → 1 match以上`
  - `grep -q "APP開発" products/homepage/index.html → 1 match以上`
  - `grep -q "AI個人コーチ" products/homepage/index.html → 1 match以上`

## 承認後モード
`acceptEdits`（理由: `index.html` のみの改修であり、インフラやDB等への破壊的影響がないため）
