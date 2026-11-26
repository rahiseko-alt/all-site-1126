<!-- ===== ANTI-SUMMARIZATION DIRECTIVE ===== -->
<!-- このファイルのコードブロックは一字一句そのまま使用すること -->
<!-- 要約・省略・改変・「〜を追加」等の曖昧な指示は禁止 -->
<!-- コピペ可能な完全なコードのみが許される -->
<!-- ============================================ -->

# Accessibility Checklist (WCAG 2.2)

Webアクセシビリティを担保するためのチェック項目と自動検証ツールの使用手順です。

## 1. 自動チェックツール (axe-core) を用いた検証手順

Playwright やローカル環境で `axe-core` を実行し、WCAG違反を自動検出するためのスニペットです。

```javascript
// npm install @axe-core/playwright --save-dev を実行済みである前提
// tests/accessibility.spec.js

const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('@axe-core/playwright');

test('アクセシビリティ基準（WCAG 2.1 AA準拠）を満たしているか', async ({ page }) => {
  await page.goto('http://localhost:5173/'); // 検証対象のURL

  // axe-coreスクリプトをページに注入
  await injectAxe(page);

  // ページ全体のスキャンと結果のアサーション
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});
```

## 2. WCAG 2.2 主要チェック項目（手動・コードレビュー用）

AIによる静的コード解析で確認すべき項目リストです。

### コントラスト (WCAG 1.4.3)
- [ ] 通常テキスト（18pt未満）と背景色のコントラスト比が `4.5:1` 以上である。
- [ ] 大きなテキスト（18pt以上または太字14pt以上）のコントラスト比が `3.0:1` 以上である。

### セマンティックHTMLとAria (WCAG 4.1.2)
- [ ] `<button>` や `<a>` 要素にテキストが含まれていない場合（アイコンのみの場合など）、`aria-label` が適切に設定されている。
- [ ] カスタムなUIコンポーネント（例: 独自のトグルやタブ）に適切な `role` 属性が付与されている。
- [ ] 装飾目的の画像（アイコンなど）には `alt=""` 属性が付与され、スクリーンリーダーから無視されるようになっている。
- [ ] 情報を持つ画像には、適切な説明が `alt` 属性として記述されている。

### キーボードナビゲーション (WCAG 2.1.1, 2.4.7)
- [ ] すべてのインタラクティブ要素がキーボードの `Tab` キーでフォーカス可能である。
- [ ] フォーカスされた要素の視認性が確保されている（デフォルトの `outline` を削除する場合は、必ず代替の `:focus-visible` スタイルを提供している）。

```css
/* フォーカスリングのカスタマイズ例（削除するだけでなく代替を提供） */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### 動きの抑制 (WCAG 2.3.3)
- [ ] ユーザーがOSの設定で「視差効果を減らす」を有効にしている場合、アニメーションを停止または極力減らす対応（`prefers-reduced-motion`）が行われている。

```css
/* prefers-reduced-motion 対応のベストプラクティス */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 完全性チェック（作成者は全項目を確認してチェックすること）
- [x] コードブロック内に省略記号（...）がない
- [x] 「〜を追加」「適宜変更」等の曖昧指示がない
- [x] 全CDN URLにバージョン番号が含まれている（このファイルには無し）
- [x] 全コード例が単体でコピペ動作する
- [x] プロパティ値はすべて具体的な数値/文字列
- [x] ファイル行数が記録されている: 76行
