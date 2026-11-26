# 完全再現: Add to Cart MorphSVG Animation

## 上位 plan からの constraint 変更

| 上位 plan | 本 plan での扱い | 承認証跡 |
| --- | --- | --- |
| N/A | 新規 scope: 提供された Add to Cart UI の完全再現 | ExitPlanMode 時に明示 |

## 影響範囲

- `docs/ops/plans/2026-06-14-add-to-cart.md` (新規)
- `agent-ag/add-to-cart-demo/` (新規ディレクトリ)
- `agent-ag/add-to-cart-demo/index.html` (新規)
- `agent-ag/add-to-cart-demo/css/style.css` (新規)
- `agent-ag/add-to-cart-demo/js/app.js` (新規)
- `agent-ag/add-to-cart-demo/server.mjs` (新規)
- `agent-ag/add-to-cart-demo/source_code.txt` (新規・スクラッチ)

Glob結果: 0件存在確認済み。

## サブエージェント割り振り方針

- `implement-agent` (sonnet) に実装を委譲。
- SCSSの展開とGSAPプラグインの読み込みがキーポイント。

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -f` で全 path 不在確認 |
| 1 | server.mjs の作成 (Port 3002) | implement-agent | sonnet | @docs/ops/plans/2026-06-14-add-to-cart.md | Step 5 で検証 |
| 2 | HTML/CSS の移植 (SCSS展開) | implement-agent | sonnet | `source_code.txt` | Step 5 で検証 |
| 3 | JS の移植 (MorphSVGPluginCDN追加) | implement-agent | sonnet | `source_code.txt` | Step 5 で検証 |
| 4 | ローカル実行とデバッグ | implement-agent | sonnet | @docs/ops/plans/2026-06-14-add-to-cart.md | Step 5 で検証 |
| 5 | テスト実行・受け入れ基準照合 | verify-agent | haiku | @docs/ops/plans/2026-06-14-add-to-cart.md | Glob 結果 / EXIT 0 |
| 6 | 最終 Glob 照合 | orchestrator | opus | — | 全 path 存在確認 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| MorphSVGPlugin 未定義エラー | コンソールエラー `MorphSVGPlugin is not defined` | 原則2: トライアル版CDN (`https://assets.codepen.io/16327/MorphSVGPlugin3.min.js`) を明示的に読み込む |
| SCSS構文エラー | 画面レイアウト崩れ | 原則1: CSSのネスト構造を手動で展開したプレーンなCSSにする |

## テスト方針

1. `server.mjs` を起動し、ローカルでデモ画面にアクセスできること（Port: 3002）。
2. ボタンをクリックすると、シャツが縮んでカートに入り、SVGがモーフィングして完了マークになること。
3. デベロッパーツールでエラーが一切出ていないこと。

## 受け入れ基準

WHEN /plan command is invoked THE SYSTEM SHALL output a template file matching docs/standards/templates/plan.md

- [ ] `Glob: agent-ag/add-to-cart-demo/index.html → 1 件存在`
- [ ] `Glob: agent-ag/add-to-cart-demo/css/style.css → 1 件存在`
- [ ] `Glob: agent-ag/add-to-cart-demo/js/app.js → 1 件存在`
- [ ] `Glob: agent-ag/add-to-cart-demo/server.mjs → 1 件存在`
- [ ] ブラウザ検証: エラーなし、アニメーションが 100% 同一の挙動を示すこと。

## 承認後モード

acceptEdits（理由: 全ステップ implement-agent / verify-agent 完結、protected paths 編集なし、新規ファイルのみ）
