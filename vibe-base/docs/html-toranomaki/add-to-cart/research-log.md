# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-16] add-to-cart 調査（遡及記録）

### 注記（遡及記録である旨）
本エントリは concept.md 作成時に research-log.md が欠落していたため、既存の元実装 `impl-gsap-3.12/`（`index.html` / `js/app.js` / `css/style.css`）から逆算して調査手法を再構成した遡及記録である。元調査の実施日時・参照 URL は確認できないため記載しない。下記は実装ファイルから事実として確認できた内容のみで構成する。

### テーマと到達点
GSAP + MorphSVGPlugin による add-to-cart マイクロインタラクション。ボタンクリックでシャツ SVG が落下してカートに収まり、カートが横移動した後にチェックマーク状態へ遷移する。さらにグラスモーフィズム調コントロールパネルから背景・テキスト・シャツ・カート・チェックの各色とメッセージテキストをリアルタイム変更できる。

### 技術選定の逆算
- SVG パスを滑らかに別パスへ変形させる要件（ボタン上辺の「ぷにっ」とした凹み、シャツの伸縮変形）があるため、CSS transition では表現できず GSAP の `MorphSVGPlugin` を選定したと判断できる（出典: js/app.js L141-166 の `morphSVG` キーフレーム）。
- アニメーション本体はすべて CSS カスタムプロパティ（`--shirt-y` / `--cart-x` / `--background-scale` 等）を GSAP の `keyframes` で時間駆動する設計。値の補間は GSAP、見た目への反映は CSS 側 transform に委ねる分離構成（出典: js/app.js L43-140）。
- カラー切替も同じ CSS 変数経由で、`element.style.setProperty()` により親要素の変数を書き換える方式（出典: js/app.js L7-33）。

### 参照したライブラリ公式 API
- GSAP 3.12.2 コア: `gsap.registerPlugin()` / `gsap.to(target, { keyframes: [...] })` / イージング `elastic.out(1, .6)` `power1.in` 等（出典: index.html L76, js/app.js L1,L43-140）。
- GSAP MorphSVGPlugin: `gsap.to(path, { morphSVG: '{パスデータ}' })` による SVG パスモーフ（出典: js/app.js L141-166）。本デモは MorphSVGPlugin3 を CodePen の配布 URL（`https://assets.codepen.io/16327/MorphSVGPlugin3.min.js`）から読み込んでいる。MorphSVGPlugin は GSAP の Club 系（有償/トライアル）プラグインである点に注意（出典: index.html L77）。
- 本テーマで Anime.js v4 createLayout は使用していない（実装は GSAP のみ）。

### 再現の要点
1. CDN は 2 本必須。`gsap.min.js`（3.12.2）→ `MorphSVGPlugin3.min.js` の順で読み込み、`js/app.js` 冒頭で `gsap.registerPlugin(MorphSVGPlugin)` を呼ぶ（出典: index.html L76-78, js/app.js L1）。
2. DOM 構造: `.add-to-cart` ボタン内に `.morph`（上辺パス）・`.shirt`（first/second の 2 枚 SVG）・`.cart`（shape/wheel/tick）を内包する（出典: index.html L31-74）。
3. 落下〜収納の演出は CSS 変数 `--shirt-y` `--shirt-scale` `--cart-x` `--cart-clip` `--cart-tick-offset` を段階的な keyframes で駆動し、`onComplete` で `overflow:hidden` 切替・テキスト復帰を行う（出典: js/app.js L65-134）。
4. 色反転トリックは同一シャツ SVG を 2 枚（`.first` / `.second`）重ね、カート縁の Y 座標を基準に clip で上下をマスクして実現する（出典: concept.md「Clip-Path による『隠蔽』と『色反転トリック』」節, index.html L36-65）。
5. 多重再発火防止: `button.classList.contains('active')` で実行中はクリックを無視し、最終 keyframe の `onComplete` で `active` を外す（出典: js/app.js L48-53,L130-132）。
