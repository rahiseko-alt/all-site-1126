# WebGL Fluid Simulation デモ構築計画

コウヘイさんのご依頼に基づき、`PavelDoGreat/WebGL-Fluid-Simulation` を `agent-ag/` 配下にクローン（ぱくり）し、不要なプロモーションコード等をクリーンアップしたローカル動作デモを構築します。

## User Review Required

- **作業ディレクトリの厳守:**
  - すべてのファイルはグローバルルールに従い、`agent-ag/webgl-fluid-demo/` 配下に新規作成します。
- **コードのクリーンアップ:**
  - 本家コードに含まれるモバイルアプリ宣伝（App Store / Google Play 誘導）、Google Analytics、Discord/Twitter ソーシャルリンクなどのプロモーションコードを排除し、純粋に流体シミュレーションとパラメータ調整（dat.GUI）が動作するクリーンな状態に整えます。
  - `dat.gui.min.js` はローカル配置ではなく、信頼性の高い CDN（cdnjs）から読み込むように変更し、無駄な外部依存ファイルを減らします。

## Open Questions

特になし。

## Proposed Changes

### デモ構築（agent-ag 配下）

#### [NEW] [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-fluid-demo/index.html)
- 全画面表示用の `<canvas>` 要素의 정의.
- CDN からの `dat.gui` 読み込みおよび `script.js` の読み込み。
- 不要なプロモーション用スタイルや HTML タグの排除。

#### [NEW] [script.js](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-fluid-demo/script.js)
- 本家の WebGL 流体シミュレーションのコアロジックを配置。
- 不要なモバイルプロモーションポップアップの制御ロジック、Google Analytics のイベント送信コード、ソーシャルリンク（Twitter/Discord）の GUI ボタンなどを削除。

#### [NEW] [server.mjs](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-fluid-demo/server.mjs)
- デモをローカルで動かしてブラウザで確認するための、極めて軽量な静的 Node.js サーバー（Express などの外部依存なしのネイティブ実装）。

---

## Verification Plan

### Automated Tests
- `node --check agent-ag/webgl-fluid-demo/server.mjs`
- `node --check agent-ag/webgl-fluid-demo/script.js`
  ※構文エラーがないことを事前に機械的にチェックします。

### Manual Verification
1. `node agent-ag/webgl-fluid-demo/server.mjs` を実行して、ポート 3000 でサーバーを起動します。
2. ブラウザで `http://localhost:3000` にアクセスします。
3. 以下の項目を手動検証します：
   - マウスやドラッグ操作によって滑らかな流体（ネオンカラー）が画面上に発生し、溶け合うこと。
   - 右上の GUI コントローラーでパラメータ（解像度、拡散率、圧力、Bloom効果など）を操作して挙動が変わること。
   - 不要な広告やアプリ誘導のポップアップが表示されないこと。
