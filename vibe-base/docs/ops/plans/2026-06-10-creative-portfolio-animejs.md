# Anime.js v4 レイアウトデモ（独立カード化）追加計画

コウヘイさんが `tmp/source.js.txt` に配置した2つのコードブロックを解析し、それぞれ独立したアニメーションデモ（シャッフルデモ ＆ アイテム追加デモ）として `agent-ag/` 配下に個別に構築し、ポータルに2つの別々のカードとして追加します。また、動作エラーとなっていた CDN パスを安定版に修正します。

## User Review Required

> [!IMPORTANT]
> **デモの独立カード化:**
> - `source.js.txt` 内の「シャッフルデモ」と「アイテム追加デモ」の2つを, 1つに統合するのではなく, それぞれ別個のデモとして独立させ, ポータル上に計5枚（以前の3枚 ＋ 新規2枚）のカードとして並ぶようにします。
>
> **CDN パスの修正:**
> - 404エラーとなっていた古いベータ版のCDNパスを, 最新の安定版 `https://cdn.jsdelivr.net/npm/animejs@4.4.1/dist/bundles/anime.esm.js` に修正して動作を確保します。

- **デザインのプレミアム化:**
  - 単調な文字表示ではなく, それぞれ高級感のあるダークテーマ（背景: #0F0F11、カード背景: #18181C）のもと, ネオンバイオレット・ブルーのグラデーション, 美しい角丸やシャドウを施してアニメーションが映えるようにします。

## Open Questions

特になし。

## Proposed Changes

### デモ追加とポータルの更新（agent-ag 配下）

#### [NEW] [index.html (Shuffle)](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/animejs-shuffle-demo/index.html)
- 1〜10のグリッドアイテムと「Shuffle」ボタンを配置した独立デモ HTML。
- ネオンバイオレットのグラデーションカードを使用。
- `anime.esm.js` 安定版をインポートし, シャッフルアニメーションを実装。

#### [NEW] [index.html (Add)](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/animejs-add-demo/index.html)
- 動的追加アイテムと「Add Item」ボタンを配置した独立デモ HTML。
- ネオンブルーのグラデーションカードを使用。
- `anime.esm.js` 安定版をインポートし, アイテムがフェードインしながらせり上がる追加アニメーションを実装（上限15個制御）。

#### [DELETE] [animejs-layout-demo/index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/animejs-layout-demo/index.html)
- 以前作成した, 左右分割で1つに統合していたデモファイルを削除します。

#### [MODIFY] [creative-portfolio-portal.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/creative-portfolio-portal.html)
- ポータル画面から旧 `animejs-layout-demo` カードを削除し, 代わりに以下の2つの新規カードを追加します。
  - **カード4: Anime.js v4 Shuffle** (iframe: `./animejs-shuffle-demo/index.html`)
  - **カード5: Anime.js v4 Dynamic Add** (iframe: `./animejs-add-demo/index.html`)

---

## Verification Plan

### Automated Tests
- `node --check agent-ag/server.mjs`

### Manual Verification
1. 共通サーバー起動状態で, ブラウザで `http://localhost:3000/creative-portfolio-portal.html` にアクセス。
2. 以下の挙動を手動検証：
   - 4枚目のカードとして「Anime.js v4 Shuffle」が表示され, クリックで滑らかなシャッフルが動作すること。
   - 5枚目のカードとして「Anime.js v4 Dynamic Add」が表示され, クリックで新規アイテムが滑らかにアニメーション追加されること。
