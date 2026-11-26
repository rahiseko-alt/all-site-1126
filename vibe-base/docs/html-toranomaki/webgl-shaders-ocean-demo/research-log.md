# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-10] webgl-shaders-ocean-demo 調査（Codex 実施）

### 目的
`portfolio/webgl-shaders-ocean-demo` を HTML虎の巻へ登録するため、画面構成・使用ライブラリ・アニメーション更新箇所を確認した。

### 確認内容
- Three.js 0.169.0 を importmap で読み込む standalone 構成であることを確認
- `Water` / `Sky` / `EffectComposer` / `OrbitControls` / `GUI` / `Stats` が主要な構成要素であることを確認
- `textures/waternormals.jpg` が水面表現の必須アセットであることを確認
- `server.mjs` が静的配信とポート自動繰り上げを担っていることを確認

### 反映方針
- 概念層は水面・空・ポストプロセス・UI の 5 技術で整理した
- 実装層は `impl-threejs-r169/` として登録し、元デモの動作をそのまま保持する方針にした

