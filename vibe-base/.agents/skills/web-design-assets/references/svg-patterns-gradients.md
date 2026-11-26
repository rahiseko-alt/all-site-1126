<!-- ===== ANTI-SUMMARIZATION DIRECTIVE ===== -->
<!-- このファイルのコードブロックは一字一句そのまま使用すること -->
<!-- 要約・省略・改変・「〜を追加」等の曖昧な指示は禁止 -->
<!-- コピペ可能な完全なコードのみが許される -->
<!-- ============================================ -->

# SVG Patterns & Gradients

## 1. Hero Patterns (SVG 背景パターン)

外部画像ファイルへのリクエストを減らすため、CSS内に直接SVGコードを埋め込みます。

```css
/* ドットパターン (Polka Dots) */
.bg-pattern-dots {
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
}

/* 方眼紙パターン (Graph Paper) */
.bg-pattern-grid {
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

/* トポグラフィパターン (Topography) */
.bg-pattern-topo {
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
```

## 2. CSS グラデーション (OKLCH 利用)

RGBではなくOKLCH色空間を利用することで、色がくすまない（マディグラデーションにならない）鮮やかで美しいグラデーションを実現します。

```css
/* 鮮やかなリニアグラデーション（青 → 紫 → ピンク） */
.gradient-vibrant {
  background: linear-gradient(
    135deg,
    oklch(0.65 0.25 250) 0%,   /* 青 */
    oklch(0.60 0.25 300) 50%,  /* 紫 */
    oklch(0.65 0.25 350) 100%  /* ピンク */
  );
  color: white;
}

/* 柔らかいメッシュ風・ラジアルグラデーション（パステル調） */
.gradient-mesh-soft {
  background-color: oklch(0.95 0.05 200); /* ベース：薄い水色 */
  background-image: 
    radial-gradient(at 0% 0%, oklch(0.90 0.1 280) 0px, transparent 50%),   /* 左上：紫 */
    radial-gradient(at 100% 0%, oklch(0.90 0.1 330) 0px, transparent 50%), /* 右上：ピンク */
    radial-gradient(at 100% 100%, oklch(0.90 0.1 80) 0px, transparent 50%),/* 右下：黄色 */
    radial-gradient(at 0% 100%, oklch(0.90 0.1 160) 0px, transparent 50%); /* 左下：緑 */
  color: #1e293b;
}

/* テキストグラデーション */
.text-gradient {
  background: linear-gradient(
    to right,
    oklch(0.7 0.2 20),
    oklch(0.7 0.2 60)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}
```

## 完全性チェック（作成者は全項目を確認してチェックすること）
- [x] コードブロック内に省略記号（...）がない
- [x] 「〜を追加」「適宜変更」等の曖昧指示がない
- [x] 全CDN URLにバージョン番号が含まれている（このファイルには無し）
- [x] 全コード例が単体でコピペ動作する
- [x] プロパティ値はすべて具体的な数値/文字列
- [x] ファイル行数が記録されている: 68行
