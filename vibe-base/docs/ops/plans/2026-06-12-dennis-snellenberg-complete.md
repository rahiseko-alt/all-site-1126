# Plan: Dennis Snellenberg Complete Recreation

Dennis SnellenbergのWebサイト（https://dennissnellenberg.com/）の完全再現において、不足している3大コア要素（①無限テキストスライダー、②フローティング・ハンバーガー ＆ 曲線サイドメニュー、③ホバー時の "View" カスタムカーソル）を `agent-ag/` 配下のソースコードに追加実装します。

## 上位 plan からの constraint 変更
`N/A` (新規計画のため)

## 影響範囲
### [MODIFY] [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/dennis-snellenberg-portfolio/index.html)
### [MODIFY] [style.css](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/dennis-snellenberg-portfolio/css/style.css)
### [MODIFY] [app.js](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/dennis-snellenberg-portfolio/js/app.js)

## サブエージェント割り振り方針
- **implement-agent (Sonnet)**: HTML/CSS/JSファイルの書き換え、各アニメーション（無限Marquee、SVG曲線サイドメニュー、カスタムカーソルラベル）の実装を担当します。
- **verify-agent (Haiku)**: 成果物の動作に構文エラーがないことの検証（`node --check`）を担当します。

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -f` で全修正対象ファイル存在確認 |
| 1 | `index.html` 修正 (無限Marqueeコンテナ, menu-btn, side-menu SVG, cursor-label追加) | implement-agent | sonnet | @agent-ag/dennis-snellenberg-portfolio/index.html | ファイル存在確認 |
| 2 | `css/style.css` 修正 (Marquee, menu-btn, side-menu曲線, Viewカーソル用のスタイル定義) | implement-agent | sonnet | @agent-ag/dennis-snellenberg-portfolio/css/style.css | ファイル存在確認 |
| 3 | `js/app.js` 修正 (Marqueeループ・スクロール連動、menuクリック時のSVG変形・スライドイン、ViewカーソルquickTo) | implement-agent | sonnet | @agent-ag/dennis-snellenberg-portfolio/js/app.js | `node --check` |
| 4 | 全体の機械検証 | verify-agent | haiku | @\<plan path\> | verify-agent による構文検証合格 |
| 5 | 最終 Glob 照合 | orchestrator | opus | — | 全パス存在確認 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| 無限Marqueeのループ時にテキストが途切れる | ループの繋ぎ目でガタつきが発生する | 原則 2: テキストの複製幅を `xPercent: -50` または画面幅以上に設定し、`modifiers` または標準の GSAP 無限ループ計算式を適用する。 |
| サイドメニューのSVG曲線（Qベジェ）が画面サイズ変更で崩れる | メニューの境界線が不自然に変形する | 原則 3: メニュー幅を固定（例: 400px）にし、SVGのビューポートとパスの相対座標を画面幅ではなくメニュー幅基準で静的に描画する。 |

## テスト方針
1. **構文チェック**: `node --check` で `app.js` の文法整合性を検証。
2. **目視・操作検証**: ローカルサーバーを起動し、ブラウザで以下を確認：
   - ヒーローセクションで巨大なテキストが無限ループで横に流れ、スクロール方向によって左右の流れが切り替わること。
   - スクロール時に右上に丸いメニューボタンが現れ、クリックすると右から曲線（ゴムのふくらみ）を伴ってサイドメニューがスライドインすること。
   - プロジェクトリストホバー時に、画像プレビューに加えて青い丸（"View"）がマウスに追従し、滑らかに拡大縮小すること。

## 受け入れ基準
- **WHEN** page loads **THE SYSTEM SHALL** scroll the hero text horizontally in an infinite loop, reversing directions based on page scroll velocity.
- **WHEN** scrolling down **THE SYSTEM SHALL** reveal a round floating menu button in the top-right corner.
- **WHEN** the menu button is clicked **THE SYSTEM SHALL** slide in the side menu from the right with a curved SVG path morphing transition.
- **WHEN** hovering over a project item **THE SYSTEM SHALL** show a circular "View" cursor label smoothly following the cursor.
- **WHEN** `node --check` is run **THE SYSTEM SHALL** verify `app.js` with exit code 0.

## 承認後モード
acceptEdits（理由: 既存の3ファイル（HTML, CSS, JS）の修正のみで完結し、影響範囲が完全に `agent-ag/` 配下に閉じているため。）
