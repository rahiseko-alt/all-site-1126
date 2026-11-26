# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-20] GSAP Cover Flow 調査（Antigravity）

### プロトタイプの移植
既存の Pug/Stylus による Cover Flow の CodePen サンプルを Vanilla HTML/CSS/JS に変換。
GSAP 3.7.0 の ESM 版をインポートし、ScrollTrigger と Draggable を組み込んで無限スクロール・ドラッグ可能なカルーセルを構築。

### ポートフォリオデモのはめ込み
静的な画像の代わりに、各デモサイト（https://portfolio.kouheikosehira.com/*）に Puppeteer でアクセスし、アニメーションが落ち着く4秒後を狙ってスクリーンショットを自動撮影。それらを `assets/{id}.png` に保存し、JS 側からカードの `background-image` として組み込む改修を実施。
