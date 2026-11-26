# Add to Cart カスタマイズ機能実装

## 上位 plan からの constraint 変更

| 上位 plan | 本 plan での扱い | 承認証跡 |
| --- | --- | --- |
| N/A | 既存デモの単一ボタン化 ＋ UI コントロールパネル追加 | ExitPlanMode 時に明示 |

## 影響範囲

- `docs/ops/plans/2026-06-14-add-to-cart-customize.md` (新規)
- `agent-ag/add-to-cart-demo/index.html` (変更)
- `agent-ag/add-to-cart-demo/css/style.css` (変更)
- `agent-ag/add-to-cart-demo/js/app.js` (変更)

Glob結果: 対象ファイルは全て存在確認済み。

## サブエージェント割り振り方針

- `implement-agent` (sonnet) に実装を委譲。
- 既存のCSS変数の仕組みを利用して、JSから `element.style.setProperty` で動的に色を書き換えるロジックを実装。

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | 該当ファイル存在確認 |
| 1 | HTMLの単一化とパネル追加 | implement-agent | sonnet | `index.html` | Step 4 で検証 |
| 2 | CSSの整理とパネルのスタイリング | implement-agent | sonnet | `css/style.css` | Step 4 で検証 |
| 3 | JSによるリアルタイム反映ロジック実装 | implement-agent | sonnet | `js/app.js` | Step 4 で検証 |
| 4 | テスト実行・受け入れ基準照合 | verify-agent | haiku | @docs/ops/plans/2026-06-14-add-to-cart-customize.md | Glob 結果 / EXIT 0 |
| 5 | 最終 Glob 照合 | orchestrator | opus | — | 完了確認 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| 服がカートに入った瞬間の色反転が壊れる | ブラウザ確認で色が黒いまま等 | 原則1: `shirt-second-color` などの反転色用変数もJSで連動して書き換えるロジックを実装する |

## テスト方針

1. コントロールパネルの各カラーピッカーを操作した際、ボタンの背景、テキスト、服、カート、チェックマークの色が即座に変わること。
2. テキストボックスの文字を変えた際、ボタン内の文字が変わること。
3. アニメーションさせても色の崩れが発生しないこと。

## 受け入れ基準

- [ ] `Glob: agent-ag/add-to-cart-demo/index.html` (更新済)
- [ ] ブラウザ検証: パネルによる動的変更が機能し、アニメーションも正常に動作すること。

## 承認後モード

acceptEdits
