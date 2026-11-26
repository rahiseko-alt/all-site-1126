# クリエイティブデモ・ポータル（creative-portfolio-portal）構築計画

コウヘイさんのご依頼に基づき、今後コウヘイさんが提示する様々なクリエイティブデモ（CodePen や Web サイト）を、1つのページに iframe 方式で美しく並べて同時に閲覧・操作できる「ポータルダッシュボード」を構築します。最初のデモとして、今回構築した `WebGL Fluid Simulation` を登録します。

## User Review Required

- **今後のデモ追加フロー:**
  - 今後、コウヘイさんから「この URL のデモを追加して」と指示を受けるたびに、そのデモのコードを `agent-ag/` 配下にクローン（再現）し、本ポータルページ（`creative-portfolio-portal.html`）に新しい iframe カードとして追加していきます。これにより、どんどんデモが蓄積されるコレクションページになります。
- **サーバーの共通化:**
  - 既存の `agent-ag/webgl-fluid-demo/server.mjs` を `agent-ag/server.mjs` に移動・昇格し、ポータル全体および配下のすべてのデモを 1 つのサーバーでマウントして一括配信できるようにします。

## Open Questions

特になし。

## Proposed Changes

### ポータル構築とサーバーの共通化（agent-ag 配下）

#### [NEW] [creative-portfolio-portal.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/creative-portfolio-portal.html)
- プレミアム感のある美しいダークテーマのダッシュボード画面。
- CSS Grid を使用した、美しくレスポンシブなカードレイアウト（グリッド配置）。
- 各カード内に `<iframe>` を配置し、個別デモを埋め込み表示。
- カードには「デモタイトル」「説明」「全画面表示ボタン」を配置。
- 最初のデモとして `./webgl-fluid-demo/index.html` をマウント。

#### [NEW] [server.mjs](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/server.mjs)
- `agent-ag/` をルートディレクトリとし、配下のすべての静的ファイル（ポータルおよび各デモ）をポート 3000 で一括配信する、Node.js ネイティブの静的ファイルサーバー。

#### [DELETE] [server.mjs (個別)](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-fluid-demo/server.mjs)
- 共通サーバーに統合するため、個別のサーバーファイルを削除します。

---

## Verification Plan

### Automated Tests
- `node --check agent-ag/server.mjs`
  ※共通サーバーに構文エラーがないことをチェックします。

### Manual Verification
1. `node agent-ag/server.mjs` を実行し、共通サーバーを起動します。
2. ブラウザで `http://localhost:3000/creative-portfolio-portal.html` にアクセスします。
3. 以下の項目を手動検証します：
   - 美しいグリッドレイアウトでポータルが開くこと。
   - 最初のカードとして `WebGL Fluid Simulation` の iframe が表示され、カード内で直接流体が美しく蠢き（自動巡回）、かつドラッグ操作に反応すること。
   - 今後他のデモが追加された際に並べられるグリッドの余白やカードデザインが適切であること。
