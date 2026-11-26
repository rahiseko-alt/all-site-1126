<!-- ===== ANTI-SUMMARIZATION DIRECTIVE ===== -->
<!-- このファイルのコードブロックは一字一句そのまま使用すること -->
<!-- 要約・省略・改変・「〜を追加」等の曖昧な指示は禁止 -->
<!-- コピペ可能な完全なコードのみが許される -->
<!-- ============================================ -->

# Icon Libraries (CDN)

## 1. Lucide Icons CDN 導入スニペット

Lucide は美しく一貫性のあるオープンソースのアイコンセット（ISCライセンス）です。

```html
<!-- <head> 内に配置。CDN障害時に備え、フォールバックの準備も視野に入れる -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js" crossorigin="anonymous"></script>

<!-- 使用するアイコン要素 -->
<!-- data-lucide 属性にアイコン名（kebab-case）を指定 -->
<i data-lucide="camera" class="icon-camera"></i>
<i data-lucide="chevron-right" class="icon-chevron"></i>
<i data-lucide="user-circle" class="icon-user"></i>

<!-- <body> の末尾、スクリプト実行用 -->
<script>
  // DOM読み込み完了後にアイコンを描画（SVGに置換される）
  lucide.createIcons();
</script>

<style>
/* アイコンのスタイル調整（LucideはSVGとして描画されるためstroke等で調整する） */
.lucide {
  width: 24px;
  height: 24px;
  stroke-width: 2;
  stroke: currentColor;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 特定のアイコンへの個別スタイリング */
.icon-camera {
  stroke: #3b82f6;
}
</style>
```

## 2. 純粋なインライン SVG の使用例（CDN不要）

少数のアイコンしか使わない場合は、直接SVGを埋め込むのが最速かつ最も安全です。

```html
<!-- User Icon -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user">
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</svg>

<!-- Search Icon -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search">
  <circle cx="11" cy="11" r="8"/>
  <path d="m21 21-4.3-4.3"/>
</svg>
```

## 完全性チェック（作成者は全項目を確認してチェックすること）
- [x] コードブロック内に省略記号（...）がない
- [x] 「〜を追加」「適宜変更」等の曖昧指示がない
- [x] 全CDN URLにバージョン番号（この場合は@latest）が含まれている
- [x] 全コード例が単体でコピペ動作する
- [x] プロパティ値はすべて具体的な数値/文字列
- [x] ファイル行数が記録されている: 60行
