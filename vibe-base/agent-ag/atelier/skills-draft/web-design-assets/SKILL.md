---
name: web-design-assets
description: >
  Webデザインで使用するアイコン、フォント、背景パターン、グラデーション、画像素材、タイポグラフィの選定・適用時に自動発動。
  Lucide Icons, Google Fonts, Open Props, Hero Patterns, Utopia.fyi, Pexels API の CDN スニペットと使い方。
  トリガー: 「アイコンを選んで」「フォントを決めて」「背景を作って」「デザイントークンを設計して」「配色パレットを作って」「グラデーションを適用して」「画像を使いたい」「タイポグラフィを設計して」。
---

# Web Design Assets

## 概要
高品質なWebデザインを構築するために必要な、無料かつ商用利用可能なアセット・ライブラリのセットです。ゼロビルド（CDN読み込み）で即座に利用できるものを厳選しています。

## 使用手順

ユーザーの要望に応じて、以下の判断フローに基づき、**必要な1つの参照ファイルのみ**を `view_file` ツールで読み込んでください。

### 判断フローチャート

1. **アイコン**が必要な場合
   👉 `references/icon-libraries-cdn.md` を読み込む
   *(Lucide Icons)*

2. **Webフォント**が必要な場合
   👉 `references/font-guide.md` を読み込む
   *(Inter, Noto Sans JP)*

3. **CSSデザイン変数のベースセット（トークン）**が必要な場合
   👉 `references/css-tokens-open-props.md` を読み込む
   *(Open Props)*

4. **背景パターンやグラデーション**が必要な場合
   👉 `references/svg-patterns-gradients.md` を読み込む
   *(Hero Patterns, CSS Gradients)*

5. **ダミー画像や写真素材**が必要な場合
   👉 `references/image-api-guide.md` を読み込む
   *(Pexels API)*

## トークン節約ルール（厳守）
1. `references/` ディレクトリ内のファイルは、「必要な1ファイルだけ」読み込みます。全読み込みは禁止です。
2. 1つのタスクで参照するファイルは最大2ファイルまでに制限してください。
3. 同一セッションで既に読み込んだファイルは再読み込みしないでください。
4. 提供されているコードはコピペ可能な完全なスニペットです。必要な部分だけをクリップして使用してください。
