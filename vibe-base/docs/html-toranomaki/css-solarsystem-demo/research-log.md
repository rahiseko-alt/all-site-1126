# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-16] 3D CSS Solar System 逆輸入調査（司令塔（逆輸入））

### 背景
portfolio/css-solarsystem-demo/ にビルド出力（index.html / css/styles.css / js/scripts.js / scripts.min.js）のみが存在し、docs 原本（concept.md / research-log.md / impl）が欠落していた。RULES.md に沿って原本を整備する逆輸入を実施した。

### 出典の特定方法
原本 .md（Gemini 生成）が無いため、実行ファイルを一次情報として直接読解し出典行を付与した。
- 公転・自転向き固定・陰影の 3 アニメは `@keyframes orbit/invert/shadow-{planet}` を grep で位置特定（styles.css L177/L191/L737〜）。
- 軌道半径・公転周期・惑星サイズは `.scale-stretched` ブロック（L319〜L516）から表化。
- 状態機械は scripts.js のクラストグル（L1〜L42）から抽出。

### 外部依存・404 リスク
- 外部 CDN: jQuery 1.8.1（googleapis）、prefixfree 1.0.7（cdnjs）、Open Sans（Google Fonts `@import`）。いずれも HTML/CSS 内のリモート URL で、ローカル相対参照の欠損は無し。
- 惑星テクスチャ・星空背景はすべて inline base64 PNG（styles.css L1393〜L1427）。外部画像参照ゼロ＝ローカル 404 リスクなし。

### impl 命名判定
外部ライブラリは jQuery を使うが、視覚表現の本体は素 CSS の 3D Transform で、JS はクラストグルの補助に留まる。ライブラリ版を冠する固有名（threejs 等）に当たらないため `impl-vanilla-1.0` とした。

### コピー方針
index.html が参照するのは `js/scripts.js`（L149）のみ。`scripts.min.js` は未参照のため RULES の指示どおり除外し、index.html / styles.css / scripts.js を一対一コピーした。

### ライセンス
styles.css 冒頭に Copyright (c) 2012 Julian Garnier, MIT License の記載あり（原作者明記）。
