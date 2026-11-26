# Plan: Dennis Snellenberg Portfolio Recreation

Dennis Snellenbergのポートフォリオ（https://dennissnellenberg.com/）に実装されている象徴的なインタラクション（プリローダー、マグネットボタン、カーソル追従画像スライダー、セクション間の曲線スクロール遷移）を、HTML/CSS/JS（GSAP, Lenis）を用いて `agent-ag/` 配下に完全再現し、クリエイティブポータルに統合します。

## 上位 plan からの constraint 変更
`N/A` (新規計画のため)

## 影響範囲
### [NEW] [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/dennis-snellenberg-portfolio/index.html)
### [NEW] [style.css](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/dennis-snellenberg-portfolio/css/style.css)
### [NEW] [app.js](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/dennis-snellenberg-portfolio/js/app.js)
### [NEW] [server.mjs](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/dennis-snellenberg-portfolio/server.mjs)
### [MODIFY] [creative-portfolio-portal.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/creative-portfolio-portal.html)
### [MODIFY] [registry.json](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/docs/html-toranomaki/registry.json)

> [!NOTE]
> `agent-ag/dennis-snellenberg-portfolio/` 以下の新規パスについて、`Glob` 照合により競合ファイルが存在しないことを事前に確認済みです。

## サブエージェント割り振り方針
- **implement-agent (Sonnet)**: HTML/CSS/JS/Serverの実装、およびポータルとレジストリの更新を担当します。
- **verify-agent (Haiku)**: 成果物の存在確認、`node --check`、およびポータルのビルドチェックを担当します。
- **Explore agent**: 計画立案時のリサーチを担当（既に完了）。

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -f` で全パス不在確認 |
| 1 | `server.mjs` 新規作成 | implement-agent | sonnet | — | `node --check` |
| 2 | `index.html` 新規作成 (Preloader/Project List/Magnetic/SVG Curve) | implement-agent | sonnet | — | ファイル存在確認 |
| 3 | `css/style.css` 新規作成 (Neue Montrealフォント, レイアウト, SVGマスク) | implement-agent | sonnet | — | ファイル存在確認 |
| 4 | `js/app.js` 新規作成 (GSAP Preloader / Lenis / QuickTo Cursor / Magnetic / ScrollTrigger) | implement-agent | sonnet | — | `node --check` |
| 5 | `registry.json` に新デモ `dennis-snellenberg-portfolio` を登録 | implement-agent | sonnet | @docs/html-toranomaki/registry.json | `json-canary` 整合検証 |
| 6 | `creative-portfolio-portal.html` へのiframe追加とビルド検証 | implement-agent | sonnet | @agent-ag/creative-portfolio-portal.html | `node scripts/build-portfolio.mjs` 実行 |
| 7 | 全体の機械検証 | verify-agent | haiku | @\<plan path\> | verify-agent による全検証合格 |
| 8 | 最終 Glob 照合 | orchestrator | opus | — | 全パス存在確認 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| SVGパスの伸縮アニメーションがレスポンシブで歪む | 画面リサイズ時に曲線が崩れる | 原則 2: `viewBox` または `preserveAspectRatio="none"` を適用し、SVGとコンテナのサイズを動的に計算・同期する。 |
| Lenisの仮想スクロールとScrollTriggerの同期不全 | スクリュー時にスクロールトリガーが反応しない | 原則 2: `ScrollTrigger.update` を Lenis のスクロールリスナーにバインドし、`gsap.ticker` と統合する。 |
| Barba.js等の不在による遷移制限 | ページ遷移時にメモリリークやリスナー重複が発生 | 原則 3: 今回はBarba.jsを省略し、シングルページ（SPA風）の構成として1ページ内に全てのセクションを集約する。 |

## テスト方針
1. **構文チェック**: `node --check` で `app.js` および `server.mjs` の文法整合性を検証。
2. **ビルドチェック**: `node scripts/build-portfolio.mjs` を実行し、ポータルサイトのHTMLが正しく再生成されることを検証。
3. **目視・操作検証**: ローカルサーバーを起動し、ブラウザで以下を確認：
   - ローダー（挨拶サイクリングと丸い引き上げ）
   - Lenisによる慣性スクロール
   - プロジェクトリストホバー時の円形画像プレビューの追従と切り替え
   - お問い合わせボタン（Contact）のマグネットホバーおよび文字のパララックス
   - フッターセクション境界線のスクロール連動平ら化

## 受け入れ基準
- **WHEN** page loads **THE SYSTEM SHALL** show a preloader cycling languages and sliding up with a curved SVG path.
- **WHEN** scrolling the page **THE SYSTEM SHALL** apply a smooth inertia effect using Lenis.
- **WHEN** hovering over a project list item **THE SYSTEM SHALL** display a circular preview box with the project image smoothly following the mouse.
- **WHEN** hover near the magnetic button **THE SYSTEM SHALL** pull the button and internal text toward the cursor with rubber-band elastic easing.
- **WHEN** scrolling to the footer **THE SYSTEM SHALL** flatten the curved border of the preceding section.
- **WHEN** `node scripts/build-portfolio.mjs` is run **THE SYSTEM SHALL** compile the portal without errors.

## 承認後モード
acceptEdits（理由: すべてのステップが `implement-agent` で完結し、`.git` や `.claude` などの保護されたパスの編集がなく、新規ファイルの追加も所定 of `agent-ag` ディレクトリ内に限定されるため。）
