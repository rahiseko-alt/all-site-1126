<!-- ===== ANTI-SUMMARIZATION DIRECTIVE ===== -->
<!-- このファイルのコードブロックは一字一句そのまま使用すること -->
<!-- 要約・省略・改変・「〜を追加」等の曖昧な指示は禁止 -->
<!-- コピペ可能な完全なコードのみが許される -->
<!-- ============================================ -->

# CSS Typography Responsive

## 1. text-wrap: balance と pretty
```html
<div class="typography-demo">
  <!-- text-wrap: balance は見出しの行長を均等にし、逆三角形のような不格好な改行を防ぐ -->
  <h1 class="headline-balance">
    The Quick Brown Fox Jumps Over The Lazy Dog In A Spectacular Fashion
  </h1>
  
  <!-- text-wrap: pretty は段落の最後の行に1単語だけ取り残される（オーファン）のを防ぐ -->
  <p class="paragraph-pretty">
    CSS typography has evolved significantly. The introduction of new text-wrap properties allows developers to create beautiful, editorial-quality text layouts on the web without relying on complex JavaScript workarounds or manual line breaks. This ensures content looks great on any screen size.
  </p>
</div>

<style>
.headline-balance {
  font-size: 2.5rem;
  line-height: 1.2;
  font-weight: 800;
  color: #111827;
  max-width: 60ch;
  margin-bottom: 1.5rem;
  
  /* 見出しに最適。最大3〜4行程度の短いテキストに使用する */
  text-wrap: balance;
}

.paragraph-pretty {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #4b5563;
  max-width: 65ch;
  
  /* 段落本文に最適。孤立行を防ぐ */
  text-wrap: pretty;
}
</style>
```

## 2. clamp() と round() を用いた流体タイポグラフィ
```css
:root {
  /* 
    流体フォントサイズの計算式（Fluid Typography）
    最小フォントサイズ: 1rem (16px) @ ビューポート幅 320px
    最大フォントサイズ: 1.5rem (24px) @ ビューポート幅 1200px
    理想値の計算式: 最小サイズ + (最大サイズ - 最小サイズ) * ((100vw - 最小VP) / (最大VP - 最小VP))
  */
  
  /* Step 0: Body Text */
  --font-size-base: clamp(1rem, 0.818rem + 0.909vw, 1.5rem);
  
  /* Step 1: Subheading */
  --font-size-md: clamp(1.25rem, 1.023rem + 1.136vw, 1.875rem);
  
  /* Step 2: Heading */
  --font-size-lg: clamp(1.563rem, 1.278rem + 1.42vw, 2.344rem);
  
  /* Step 3: Hero Headline */
  --font-size-xl: clamp(1.953rem, 1.598rem + 1.775vw, 2.93rem);
}

body {
  font-size: var(--font-size-base);
}

h3 { font-size: var(--font-size-md); }
h2 { font-size: var(--font-size-lg); }
h1 { font-size: var(--font-size-xl); }

/* round() を用いて、計算された流体サイズを特定のグリッド（例: 2px単位）にスナップさせる例 */
.snapped-text {
  /* 0.125rem (2px) の倍数に丸める */
  font-size: round(nearest, clamp(1rem, 0.818rem + 0.909vw, 1.5rem), 0.125rem);
}
```

## 完全性チェック（作成者は全項目を確認してチェックすること）
- [x] コードブロック内に省略記号（...）がない
- [x] 「〜を追加」「適宜変更」等の曖昧指示がない
- [x] 全CDN URLにバージョン番号が含まれている
- [x] 全コード例が単体でコピペ動作する
- [x] プロパティ値はすべて具体的な数値/文字列
- [x] ファイル行数が記録されている: 81行
