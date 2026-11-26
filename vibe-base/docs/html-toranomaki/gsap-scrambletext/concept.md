# concept.md — ScrambleText 概念層

## N つのコア技術
（出典: js/app.js）
### 1. ScrambleText
**技術名**: gsap.ScrambleText
**素人向け解説**: ハッカー風のテキスト解読エフェクトです。目的の文字列に定着するまで文字をランダムな記号でシャッフルさせます。

## アーキテクチャ概要
ScrambleText: gsap + 3.15.0
CDN: https://unpkg.com/gsap@3.15.0/dist/gsap.min.js
Entry: index.html | Style: css/style.css

## シーン設計
ハイテクなUIやロード画面にぴったりで、様々な文字セットを指定できます。
（出典: js/app.js L1〜L10）
