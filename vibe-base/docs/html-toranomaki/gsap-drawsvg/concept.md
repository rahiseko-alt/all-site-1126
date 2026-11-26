# concept.md — DrawSVG 概念層

## N つのコア技術
（出典: js/app.js）
### 1. DrawSVG
**技術名**: gsap.DrawSVG
**素人向け解説**: SVGの線を徐々に表示・非表示させます。サインが書かれるような演出や、ダイナミックなイラストの描画に最適です。

## アーキテクチャ概要
DrawSVG: gsap + 3.15.0
CDN: https://unpkg.com/gsap@3.15.0/dist/gsap.min.js
Entry: index.html | Style: css/style.css

## シーン設計
複雑なパスでも、まるで目に見えないペンで描かれているかのような演出が可能です。
（出典: js/app.js L1〜L10）
