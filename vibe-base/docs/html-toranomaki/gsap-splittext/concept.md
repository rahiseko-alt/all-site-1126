# concept.md — SplitText 概念層

## N つのコア技術
（出典: js/app.js）
### 1. SplitText
**技術名**: gsap.SplitText
**素人向け解説**: あらゆるテキストを一瞬で「1文字ずつ」「1単語ずつ」「1行ずつ」に分割し、複雑なタイポグラフィ・アニメーションの実装を極めて簡単にするプラグインです。

## アーキテクチャ概要
SplitText: gsap + 3.15.0
CDN: https://unpkg.com/gsap@3.15.0/dist/gsap.min.js
Entry: index.html | Style: css/style.css

## シーン設計
レスポンシブなレイアウトや画面サイズ変更にも賢く対応し、文字が爆発して再構築されるような動きを数行で実装できます。
（出典: js/app.js L1〜L10）
