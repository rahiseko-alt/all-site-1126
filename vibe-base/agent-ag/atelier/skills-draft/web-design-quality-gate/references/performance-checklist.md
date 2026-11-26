<!-- ===== ANTI-SUMMARIZATION DIRECTIVE ===== -->
<!-- このファイルのコードブロックは一字一句そのまま使用すること -->
<!-- 要約・省略・改変・「〜を追加」等の曖昧な指示は禁止 -->
<!-- コピペ可能な完全なコードのみが許される -->
<!-- ============================================ -->

# Performance Checklist

フロントエンドのレンダリングパフォーマンスとCore Web Vitalsを最適化するためのチェックリストと手順です。

## 1. 静的コードレビュー項目

AIがHTML/CSSコードをレビューする際の必須チェック項目です。

### 画像最適化 (LCP 改善)
- [ ] ファーストビュー（Above the fold）に表示される最大のヒーロー画像や重要な画像には、`fetchpriority="high"` 属性が付与されている。
- [ ] 画面外（Below the fold）の画像には、すべて `loading="lazy"` 属性が付与されている。
- [ ] すべての `<img>` タグに `width` と `height` 属性が指定され、レイアウトシフト（CLS）が防がれている。

```html
<!-- 最適な画像読み込み例 -->
<!-- ファーストビュー画像 -->
<img src="hero-banner.jpg" width="1200" height="600" alt="Main banner" fetchpriority="high">

<!-- 画面外の画像 -->
<img src="footer-logo.png" width="200" height="50" alt="Footer Logo" loading="lazy">
```

### レンダリング最適化 (INP, スクロール改善)
- [ ] 長いリスト、フィード、または画面外の重いコンポーネントに `content-visibility: auto` と `contain-intrinsic-size` が適用されている。

```css
/* content-visibility 適用例 */
.long-list-item {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px; /* 要素の推定高さを指定 */
}
```

- [ ] アニメーションには `transform` (translate, scale, rotate) と `opacity` のみが使用されており、`width`, `height`, `top`, `margin` などのレイアウトをトリガーするプロパティのアニメーションは避けられている。

## 2. Lighthouse 実行手順 (司令塔向け手動指示)

実際のCore Web Vitalsスコアを計測するため、AIから人間（司令塔）に対して以下のコマンド実行を指示してください。

```bash
# Chromeがインストールされている環境でCLIからLighthouseを実行するコマンド
npx lighthouse http://localhost:5173/ --view --quiet --chrome-flags="--headless"
```
※指示時の注意事項：開発用サーバー（dev server）のスコアは参考値です。正確なパフォーマンス計測はプロダクションビルド（`npm run build` および `npm run preview` 等）に対して行う必要があります。

## 完全性チェック（作成者は全項目を確認してチェックすること）
- [x] コードブロック内に省略記号（...）がない
- [x] 「〜を追加」「適宜変更」等の曖昧指示がない
- [x] 全CDN URLにバージョン番号が含まれている（このファイルには無し）
- [x] 全コード例が単体でコピペ動作する
- [x] プロパティ値はすべて具体的な数値/文字列
- [x] ファイル行数が記録されている: 55行
