# concept.md — ScrollSmoother 概念層

## N つのコア技術
（出典: js/app.js）
### 1. ScrollSmoother
**技術名**: gsap.ScrollSmoother
**素人向け解説**: ページ全体に慣性が効いた「バターのようになめらかなスクロール感」を追加するプレミアムプラグイン。パララックス（視差）効果もネイティブにサポートします。

## アーキテクチャ概要
ScrollSmoother: gsap + 3.15.0
CDN: https://unpkg.com/gsap@3.15.0/dist/gsap.min.js
Entry: index.html | Style: css/style.css

## シーン設計
このページ全体が **ScrollSmoother** で包まれています。物理的な慣性が効いた、バターのようになめらかなスクロール感にお気づきでしょうか？ScrollTriggerとネイティブに統合された、究極のプレミアムスクロール体験です。
（出典: js/app.js L1〜L10）
