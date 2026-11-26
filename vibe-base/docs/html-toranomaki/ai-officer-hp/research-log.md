# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-16] ai-officer-hp 原本逆輸入調査（司令塔（逆輸入））

### 背景
`portfolio/ai-officer-hp/` にビルド出力のみが存在し、`docs/html-toranomaki/` 側に概念層・手法層の原本が欠落していた。portfolio 側の A 版実行ファイルから docs 原本を逆輸入（リバース）して三者正本（concept.md / research-log.md / impl-*）を整備した。

### A/B 判定
- portfolio に A 版（`index.html` + 非 `-b` ファイル）と B 版（`index-b.html` / `app-b.js` / `style-b.css`）が併存。
- B 系は A/B 検証残骸のため不採用。A 版が参照する実ファイルのみを正本に採用した。
- A 版エントリ `index.html` の参照: css/base.css・css/sections.css・css/effects.css・js/core.js・js/canvas.js・js/interactions.js（出典: portfolio/ai-officer-hp/index.html L17–L19, L309–L311）。

### 使用ライブラリ・バージョン判定（impl 命名根拠）
| ライブラリ | バージョン | 出典 |
|-----------|-----------|------|
| GSAP | 3.12.5 | index.html L303 CDN |
| ScrollTrigger | 3.12.5 | index.html L304 CDN |
| Lenis | 1.0.34 | index.html L306 CDN |
| Lucide Icons | latest（非固定） | index.html L14 CDN |
| Canvas 2D | 外部ライブラリ無し | js/canvas.js（素の getContext('2d')） |
- アニメーションの主軸が GSAP のため impl 名を `impl-gsap-3.12` とした（`latest` 禁止規約に準拠しメジャー+マイナーを明記）。

### verbatim copy
- portfolio A 版実行ファイルを `impl-gsap-3.12/` へ一対一コピー（index.html + css/3 ファイル + js/3 ファイル）。相対パス `./css/` `./js/` を維持。改変なし。

### blindtest 結果
- `node scripts/toranomaki-blindtest.mjs ai-officer-hp impl-gsap-3.12` → EXIT 0 / 黒ピクセル率 0.0%（43/1152000）/ PASS。
- 検出 404 はカードホバー用 Unsplash 外部 CDN 画像のみ（初期描画に不要・ローカル相対参照の欠落ではない）。impl 内のローカル参照（css/js）は全て存在し 404 なし。

### 関連テーマ
- `glassmorphism-tilt-card` の concept.md が本 LP の「カード部分のみ」を抜き出して documented 済み（出典記載が「AI Officer HP A バージョン」）。本テーマはページ全体（ローダー / Canvas / マグネット / マーキー / ターミナル / カード）を統合した上位の原本として整備した。
