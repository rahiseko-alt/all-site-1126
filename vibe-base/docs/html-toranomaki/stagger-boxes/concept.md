# concept.md — Stagger Boxes（ウェーブリボン）概念層

## 概要

（出典: CodePen wvMgXxN "Content Transition" by Elegant Seagulls）

横長の薄い棒（box）を画面いっぱいに積層し、スクロール量に連動して一本ずつ時間差（stagger）で横スライド＋回転させることで、棒の集合が一枚のリボンのようにうねって流れる演出。棒が動いた背後から「SCROLL UP」テキストが現れる。

## コア技術

### 1. pinned + scrub タイムライン（GSAP ScrollTrigger）

トリガー区画 `.trigger` を `pin: true` で画面に固定し、`scrub: 0.5` でスクロール量にタイムラインの再生位置を写像する。スクロールを止めるとアニメーションも止まり、戻すと逆再生される。

```js
gsap.timeline({
  scrollTrigger: { trigger: ".trigger", start: "top top", end: "+=70%", pin: true, scrub: 0.5 }
})
```

### 2. stagger による時間差伝播

`stagger: { amount: 1 }` は「全要素の開始を合計1秒の中に均等配分する」指定。要素数が増えても総時間は変わらず、先頭から末尾へ波が伝播する密度だけが上がる。これがリボンのうねりの源。

```js
.to(".box", { xPercent: 100, duration: 1, ease: "power1.inOut", stagger: { amount: 1 } })
```

### 3. スライドと回転の3トラック重ね合わせ

同一ターゲットに対し、(1) 横スライド `xPercent: 100`、(2) `rotation: 0→45deg`、(3) `rotation: 45→0deg` の3トラックを時間差で重ねる。位置 `0` と `1` にずらして配置することで、棒が傾きながら流れ、通り過ぎると元の水平に戻る波形を作る。

```js
.to(".box", { rotation: 45, duration: 1, ease: "power1.out", stagger: { amount: 1 } }, 0)
.to(".box", { rotation: 0,  duration: 1, ease: "power1.in",  stagger: { amount: 1 } }, 1)
```

### 4. 背後テキストの出し分け（同色レイヤー）

ラベルを棒と同系色（背景色 `--light`）でカードの上（`z-index: 2`）に置く。静止時、暗い棒の上の「SCROLL DOWN」は明色で読め、明るい背景上の「SCROLL UP」は同化して隠れる。棒が右へ流れると背景が露出し「SCROLL UP」が現れる。

---

## アーキテクチャ概要

- GSAP 3.12.5（CDN）、ScrollTrigger（CDN）
- Entry: `index.html` | Style: `css/style.css` | JS: `js/app.js`
- 棒は JS で `BAR_COUNT = 100` 本を動的生成（静的 div 列の手書きを廃し、本数を1定数で可変に）

---

## シーン設計

| 要素 | 設定値 |
|------|--------|
| 背景色（--light） | `#eeeeee` |
| 棒色（--dark） | `#161616` |
| 棒の高さ | `1.2vh` |
| 棒の幅 | `50%` |
| 棒の重なり | `margin-bottom: -0.2vh` |
| 棒の本数 | 100 |
| スライド量 | `xPercent: 100` |
| 最大傾き | `45deg` |
| stagger | `amount: 1`（合計1秒に均等配分） |
| scrub | 0.5 |
| pin 区間 | `+=70%` |

---

## 初期失敗パターン

棒を静的 HTML に100個手書きすると本数変更が苦痛で、行数も肥大する。JS の生成ループに置換し、`BAR_COUNT` 1箇所で本数・密度を制御できるようにした。

---

## 既知の改善点

- **タッチ端末のスクロール体験**: `pin` + `scrub` はモバイルの慣性スクロールと相性が悪い場合がある。`ScrollTrigger.normalizeScroll()` の適用は未検証。
- **prefers-reduced-motion 未対応**: モーション低減設定時にアニメーションを抑制する分岐が未実装。
