# concept.md — Dennis Snellenberg 再現 概念層

## 3 つのコア技術

（出典: index.html「Smooth Scroll & GSAP CDNs」節）

### 1. Lenis
**技術名**: Lenis (Smooth Scroll)
**素人向け解説**: ウェブページのスクロールを滑らかにするためのライブラリです。マウスホイールによる急激な動きを吸収し、慣性を伴った滑らかなスクロール感を提供します。

### 2. GSAP (GreenSock Animation Platform)
**技術名**: GSAP (GSAP core)
**素人向け解説**: 高度なアニメーションを簡単かつ高速に作成できる JavaScript ライブラリです。要素の移動、回転、フェードインや、時間の経過に応じた複雑なアニメーションの順序制御（タイムライン）が可能です。

### 3. ScrollTrigger
**技術名**: ScrollTrigger (GSAP Plugin)
**素人向け解説**: ユーザーのスクロール位置に合わせてアニメーションをトリガーしたり、スクロール量に直結してアニメーションの進行を制御（スクラブ）したりするGSAPの拡張機能です。

---

## アーキテクチャ概要

Dennis Snellenberg Recreation: GSAP 3.12.5 + Lenis 1.0.42
CDN: https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js, https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js, https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
Entry: index.html | Style: css/style.css | Script: js/app.js
Main class: Lenis, gsap
（出典: index.html L7-L13, L154-L156）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| Preloader | 背景色 | `#141517` |
| Preloader | Word Cycle | `["Hello", "Bonjour", "Ciao", "Olà", "こんにちは", "Hello"]` が 220ms 間隔で切り替わる |
| Preloader | Morph Path (d) | 最初: `M0 0 L100 0 L100 100 Q50 100 0 100 Z` |
| Preloader | Morph Path (d) 中間 | `M0 0 L100 0 L100 100 Q50 0 0 100 Z` (duration: 0.8s, ease: `power2.inOut`) |
| Preloader | Morph Path (d) 終了 | `M0 0 L100 0 L100 0 Q50 0 0 0 Z` (duration: 0.4s, ease: `power2.in`, delay: -0.2s from step 1) |
| Preloader | Container Y | `-100%` にスライド (duration: 1.0s, ease: `power4.inOut`, delay: 0) |
| Hero | 背景色 | `#0F0F11` (CSS: `--bg-color`) |
| Hero | Scroll Indicator | `bounce` アニメーション (duration: 2s, infinite) |
| About | big-button (magnetic) | x, y: マウス相対移動量の 45% (duration: 0.35s, ease: `power2.out`), btn-text: 25% (duration: 0.35s, ease: `power2.out`) |
| About | big-button (release) | x, y: `0` (duration: 0.85s, ease: `elastic.out(1.2, 0.4)`) |
| Projects | project-item hover | padding: `2.5rem 1.5rem` (normal: `2.5rem 0`), border-color: `transparent`, hover line scaling (scaleX: 1) |
| Projects | project-preview-container | scale: 0から1、autoAlpha: 0から1 (duration: 0.35s, ease: `back.out(1.7)`) |
| Projects | project-preview-container position | Mouse follow with gsap.quickTo (duration: 0.45s, ease: `power3.out`, x-offset: -140, y-offset: -175) |
| Projects | project-preview-slider | yPercent: `-25 * index` (duration: 0.5s, ease: `power2.out`) |
| Transition | curve-path (d) | `ScrollTrigger` により、スクロールに追従して `M0 0 C50 100 50 100 100 0 L100 100 L0 100 Z` から `M0 0 C50 0 50 0 100 0 L100 100 L0 100 Z` へ平坦化 (trigger: `.curved-boundary-container`, start: `top bottom`, end: `bottom top`, scrub: true, ease: `none`) |
| Footer | Contact button | x, y: マウス相対移動量の 45% (duration: 0.35s, ease: `power2.out`), btn-text: 25% (duration: 0.35s, ease: `power2.out`) |
| Footer | Contact button (release) | x, y: `0` (duration: 0.85s, ease: `elastic.out(1.2, 0.4)`) |
| Footer | nav items | x, y: マウス相対移動量の 40% (duration: 0.3s, ease: `power2.out`), release: `0` (duration: 0.6s, ease: `elastic.out(1.2, 0.4)`) |

アニメーション:
- ロード完了時に Word Cycle が終了し、Preloader Overlay がSVGパスのモーフ変形を伴いながら上部にスライドアウトする（`app.js` L23-L55）。
- スムーズスクロール (Lenis) がスクロール値の更新と `ScrollTrigger.update` を連携させて制御する（`app.js` L60-L80）。
- Footer 上部の境界カーブ要素（`.curved-boundary-container`）に差し掛かると、スクロール量に応じてSVGの制御点が変化し、境界線がフラットに変化する（`app.js` L84-L99）。
- Projects セクションの各項目にホバーすると、マウス追従するフローティングプレビュー画像コンテナが表示され、インデックスに応じた画像位置へ垂直スライドする（`app.js` L104-L152）。
- ナビゲーションおよび大きなボタンにホバーすると、要素がマウスカーソル側に吸い付くように動き、ホバー解除時に伸縮（弾性）を伴い元の位置に戻る（`app.js` L157-L238）。
（出典: app.js L1-L238, style.css L57-L499）

---

## 既知の改善点

* **プレローダー表示中のスクロール防止**: プレローダー実行中にページスクロールが行われないように `body.loading` クラスで `overflow: hidden` を適用する対策の徹底。（出典: style.css L32-L34）
* **クイックマウスフォロワーのセンタリング最適化**: ホバープレビュー要素がウィンドウの境界外に出た際のクリッピングや、素早いドラッグ時のレスポンスラグ調整。
* **画面サイズに応じた弾性パラメータの調整**: モバイル端末などのタッチ操作時のマグネット機能の無効化（現在は `smoothTouch: false` などのLenis設定はあるが、JS側のタッチ判定によるマグネット制御が必要）。
