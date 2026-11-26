# Romain Avalle — Interactive Developer (Complete Reproduction)

`https://romainavalle.dev/` の完全再現プロジェクトです。

## 再現されている機能・構成

- **WebGL インスタンスド ASCII レンダラー (`src/utils/asciiEffect.js`, `src/utils/sceneController.js`)**
  - Three.js シーンをフレームバッファに描画し、カスタム GLSL シェーダーで輝度を3種類の文字セット（Hero / Projects / Mail）に変換
  - カーソル反発・フッター（Let's talk）での磁石吸引・カーソル軌跡リボン・クリック時の衝撃波リップル・4秒無操作時の画面メルト（溶け落ち）演出・スクロール速度に応じた横揺れ
  - キーボード入力に応じた7パターンの手続き型スタティックノイズと、エコー対応の3D文字ポップ演出
  - 自己紹介セクションでの 3D モデル（`/glbs/test.glb`）の回転・チルト表示
  - フッター領域での反転 ASCII キャンバス同期描画
- **Web Audio API 手続き型シンセサイザー (`src/utils/sound.js`)**
  - 10種類の楽器（`1`〜`0`: synth, piano, drums, guitar〔Karplus-Strong弦合成〕, organ, trumpet, violin, flute, bass, marimba）
  - ピッチ変更（`↑` / `↓`）、ディレイエコー変更（`←` / `→`）、効果音（click, blip, hover, whoosh, chime）
- **ローダー・ピクセルトランジション・タイポグラフィ演出**
  - 初回ロード時のブロック文字スクランブルと放射状ピクセルキャンバスによる画面オープン（`src/components/Common/Loader.vue`）
  - View Transitions API と動的ピクセルマスクによる白黒テーマ切り替え（`src/utils/pixelTransition.js`）
  - GSAP `SplitText` + `ScrambleTextPlugin` による行アニメーション、スクランブル表示、ホバーで文字が落下・復帰する `fallingLetters`（`src/utils/fallingLetters.js`）
  - 全39件の実績リストと上下方向判定つき無限スクロールマーキー（`src/components/Home/Works.vue`, `src/components/Home/Work.vue`）
  - コナミコマンド（`↑ ↑ ↓ ↓ ← → ← → b a`）による Comic Sans / Comic Mono モード切り替えと、`Alt + G` による12カラム開発グリッド表示
  - 404 エラーページの ASCII ブロック崩しゲーム（`src/pages/error.vue`, `src/components/Error/BrickBreaker.vue`）

## 起動方法

```bash
npm install
npm run dev
```

本番ビルド・プレビュー:

```bash
npm run build
npm run preview
```
