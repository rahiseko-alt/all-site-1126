# クリエイティブデモ追加（Constellations & Solar System）計画

コウヘイさんのご依頼に基づき、ポータルサイト（`creative-portfolio-portal.html`）に、さらに 2 つの傑作デモ（Three.js による神秘的な星座シミュレーション、および純粋な CSS 3D による太陽系モデル）を追加し、3 つのデモが並ぶ豪華なポータルへと拡張します。

## User Review Required

- **追加するデモ:**
  1. **Three.js Constellations (Drawrange):** 星空の中に漂うパーティクルが自動で結線され、リアルタイムに星座を生成する神秘的デモ。
  2. **3D CSS Solar System:** WebGL や 3D Canvas を一切使わず、純粋な HTML と CSS 3D アニメーションのみで滑らかに動作する太陽系モデル。
- **ポータル画面の更新:**
  - `creative-portfolio-portal.html` を更新し、新デモを iframe 経由で読み込むカードを追加します。

## Open Questions

特になし。

## Proposed Changes

### デモの追加（agent-ag 配下）

#### [NEW] [index.html (Constellations)](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-constellations-demo/index.html)
- Three.js を用いた星座（Drawrange）デモ。
- CDN から `three.min.js` を読み込み、本家サンプルコードを最適化して配置。

#### [NEW] [index.html (Solar System)](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/css-solarsystem-demo/index.html)
- 3D CSS 太陽系デモの構造 HTML。
- `css/styles.css` を読み込み、ダッシュボード制御用の JS は軽量化または CDN 連携。

#### [NEW] [styles.css (Solar System)](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/css-solarsystem-demo/css/styles.css)
- CSS 3D トランスフォームやキーフレームアニメーションを含む、太陽系描画用のスタイルシート。

#### [MODIFY] [creative-portfolio-portal.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/creative-portfolio-portal.html)
- グリッドレイアウトに新デモ2件（Constellations / 3D CSS Solar System）のカードを追加。
- それぞれ `webgl-constellations-demo/index.html` と `css-solarsystem-demo/index.html` を iframe の src として指定。

---

## Verification Plan

### Automated Tests
N/A（新規 JS ロジックファイルの追加はないため、構文エラーチェックはスキップ。既存の共通サーバーは変更なし）

### Manual Verification
1. `node agent-ag/server.mjs` が起動している状態で、ブラウザで `http://localhost:3000` にアクセスします。
2. 以下の挙動を手動検証します：
   - ポータルが 3 列グリッド（流体シミュレーション / Constellations / 3D CSS Solar System）として美しく並ぶこと。
   - 追加された 2 枚のカード内の iframe でデモが正常に動き、インタラクションが行えること。
