---
name: web-design-css-modern
description: >
  Webページのレイアウト設計、スタイリング、レスポンシブ対応、CSSアニメーション、インタラクティブUI実装時に自動発動。
  Container Queries, :has(), CSS Nesting, @layer, @scope, oklch(), @property, Anchor Positioning, Popover API, content-visibility, Scroll-driven Animations, View Transitions, @starting-style の実装ガイド。
  トリガー: 「レイアウトを作って」「レスポンシブ対応して」「CSSで実装して」「スタイルを書いて」「配色を決めて」「ダークモード対応して」「ポップアップを作って」「ツールチップを実装して」。
---

# Web Design CSS Modern

## 概要
最新のCSSネイティブ機能を活用して、高品質・高パフォーマンスなWebデザインを構築するためのスキルです。JSに頼らず、ブラウザのネイティブ機能（コンポジタースレッドや型付きアニメーション）を活用します。

## 使用手順

ユーザーの要望に応じて、以下の判断フローに基づき、**必要な1つの参照ファイルのみ**を `view_file` ツールで読み込んでください。**決して複数のファイルを同時に読み込まないでください。**

### 判断フローチャート

1. **レイアウト設計・レスポンシブ対応**が求められている場合
   👉 `references/css-layout-patterns.md` を読み込む
   *(Grid, Subgrid, Container Queries, Flexbox)*

2. **配色設計・カラートークン・ダークモード**が求められている場合
   👉 `references/css-color-system.md` を読み込む
   *(oklch(), color-mix(), @property)*

3. **JS不要のポップアップ・ツールチップ・モーダル**が求められている場合
   👉 `references/css-interactive-ui.md` を読み込む
   *(Popover API, Anchor Positioning, @starting-style)*

4. **スクロール連動・ページ遷移アニメーション**が求められている場合
   👉 `references/css-animation-native.md` を読み込む
   *(Scroll-driven Animations, View Transitions)*

5. **CSSの階層構造整理・パフォーマンス最適化**が求められている場合
   👉 `references/css-architecture.md` を読み込む
   *(@layer, CSS Nesting, @scope, content-visibility)*

6. **美しいタイポグラフィ・流体フォントサイズ**が求められている場合
   👉 `references/css-typography-responsive.md` を読み込む
   *(text-wrap, clamp, round)*

## トークン節約ルール（厳守）
1. `references/` ディレクトリ内のファイルは、「必要な1ファイルだけ」読み込みます。全読み込みは禁止です。
2. 1つのタスクで参照するファイルは最大2ファイルまでに制限してください。
3. 同一セッションで既に読み込んだファイルは再読み込みしないでください。
4. 提供されているコードはコピペ可能な完全なスニペットです。必要な部分だけをクリップして使用してください。
