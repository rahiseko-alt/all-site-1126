# concept.md — Glassmorphism Tilt Card 概念層

## 7つのコア技術

（出典: AI Officer HP Aバージョン — ダークテーマ）

### 1. Glassmorphism基盤（CSS backdrop-filter）

カード本体に `backdrop-filter: blur(25px) saturate(200%)` を適用。背景色 `rgba(13, 15, 20, 0.12)` でほぼ透明にし、すりガラス質感を実現する。`-webkit-backdrop-filter` も併記してSafari互換を確保。

```css
backdrop-filter: blur(25px) saturate(200%);
-webkit-backdrop-filter: blur(25px) saturate(200%);
background-color: rgba(13, 15, 20, 0.12);
```
（出典: style.css L529–L530 `.capability-card`）

### 2. Stripe/Vercel風マウス追従スポットライト（CSS radial-gradient + JS CSS変数更新）

`.card-bg-glow` に `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), ...)` を設定。JSの`mousemove`でCSS変数 `--mouse-x`, `--mouse-y` をリアルタイム更新する。カードごとに `--glow-color` で色を変えることで個性を持たせる（Blue/Pink/Violet/Cyan）。

```css
background: radial-gradient(
  350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px),
  var(--glow-color, rgba(37, 99, 235, 0.15)) 0%,
  rgba(0,0,0,0) 80%
);
```
（出典: style.css L571–L582 `.card-bg-glow`）

```js
card.style.setProperty('--mouse-x', `${x}px`);
card.style.setProperty('--mouse-y', `${y}px`);
```
（出典: app.js L579–L586 mousemoveハンドラ）

### 3. Vercel風ボーダーグロー（CSS mask xor 合成）

`.card-border-glow` で同じくマウス追従グラデーションを配置するが、`-webkit-mask-composite: xor; mask-composite: exclude;` でボーダー部分のみを切り出して描画する。マウスが近づいた箇所だけ縁が光る高級感のある演出。

```css
-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
-webkit-mask-composite: xor;
mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
mask-composite: exclude;
```
（出典: style.css L629–L646 `.card-border-glow`）

### 4. 背面ホバー画像パララックス透過（CSS mix-blend-mode + JS逆方向移動）

`.card-hover-image` を `position: absolute` で背面に配置。通常時 `opacity: 0`、ホバー時 `opacity: 0.18` + `mix-blend-mode: overlay` で半透明に浮かび上がる。画像は `filter: grayscale(100%) brightness(120%) contrast(110%)` でモノクロ化。140%サイズでマウスの逆方向に `×-0.06` 移動させてパララックス効果を出す。

```css
.card-hover-image {
  width: 140%; height: 140%;
  filter: grayscale(100%) brightness(120%) contrast(110%);
}
```
（出典: style.css L541–L568 `.card-hover-image-wrapper` / `.card-hover-image`）

```js
const imageX = (x - centerX) * -0.06;
const imageY = (y - centerY) * -0.06;
gsap.to(hoverImage, { x: imageX, y: imageY, scale: 1.12, ... });
```
（出典: app.js L602–L615 parallax処理）

### 5. 3D Tilt（CSS perspective + GSAP gsap.to rotateX/rotateY）

カードに `perspective: 1000px; transform-style: preserve-3d;` を設定。マウス位置から中心点への距離を計算し `rotateX`/`rotateY` を最大±8度で適用する。子要素にはそれぞれ異なる `translateZ`（30px, 40px, 20px）を設定してテキストが浮き出る立体的な奥行きを演出。

```css
.card-header  { transform: translateZ(30px); }
.card-title   { transform: translateZ(40px); }
.card-desc    { transform: translateZ(20px); }
```
（出典: style.css L527–L528, L592, L615, L624 `.capability-card` 子要素）

```js
const tiltX = (y - centerY) / centerY * -8;
const tiltY = (x - centerX) / centerX * 8;
gsap.to(card, { rotateX: tiltX, rotateY: tiltY, duration: 0.3, ease: 'power2.out' });
```
（出典: app.js L588–L600 3D tilt処理）

### 6. スクロール連動フェード（GSAP Timeline + ScrollTrigger scrub）

外側ラッパー `.capability-card-wrapper` に `gsap.timeline` + `scrollTrigger({ scrub: 1.2 })` を適用。ビューポート下端から出現時に `y: 50→0, opacity: 0.1→1` でフェードイン、上端消去時に `y: 0→-50, opacity: 1→0.1` でフェードアウト。内側のカード本体とは別要素にスクロール移動を割り当てることでホバー3D Tiltとのtransform競合を回避する。

```js
tl.fromTo(card, { y: 50, opacity: 0.1 }, { y: 0, opacity: 1, duration: 0.35 })
  .to(card, { y: 0, opacity: 1, duration: 0.3 })
  .to(card, { y: -50, opacity: 0.1, duration: 0.35 });
```
（出典: app.js L652–L683 timeline ScrollTrigger処理）
（出典: style.css L508–L513 `.capability-card-wrapper`）

### 7. セクション常駐カスタムカーソル（CSS transition + JS mousemove セクション検知）

カードごとに `data-cursor-text`（日本語ラベル）と `data-cursor-shape`（circle/square/leaf/blob）を指定。セクション背景にいる時も常に85pxに拡大した状態を維持し、セクション名のデフォルトラベル（能力マップ/稼働ログ等）を半透明で常時表示する。

```js
const section = target.closest('#capabilities, #interface, #connect, footer');
if (section && !header) {
  document.body.classList.add('cursor-section-active');
}
```
（出典: app.js L51–L79 mousemoveセクション検知）

```css
body.cursor-section-active #custom-cursor {
  width: 85px; height: 85px;
}
body.cursor-section-active #custom-cursor-label {
  opacity: 0.4;
}
```
（出典: style.css L75–L85 `cursor-section-active` CSS）

---

## アーキテクチャ概要

- GSAP 3.12.5（CDN）、ScrollTrigger（CDN）、Lenis 1.0.34（CDN）、Lucide Icons（CDN）
- Entry: `index.html` | Style: `css/style.css` | JS: `js/app.js`
- Google Fonts: Outfit, Inter, Share Tech Mono

（出典: index.html `<head>` CDN読み込み部）

---

## シーン設計

| 要素 | 設定値 |
|------|--------|
| 背景色 | `#07080a` (--bg-dark) |
| カード背景 | `rgba(13, 15, 20, 0.12)` |
| アクセント | `#2563eb` (--accent) |
| ブラー強度 | 25px |
| 彩度 | 200% |
| Tilt最大角度 | ±8deg |
| scrub | 1.2 |
| グロー半径 | 350px |
| フェードイン移動量 | y: 50px |
| フェードアウト移動量 | y: -50px |
| カスタムカーソル拡大サイズ | 85px |
| グローカラー（Blue） | `rgba(37, 99, 235, 0.45)` |
| グローカラー（Pink） | `rgba(236, 72, 153, 0.45)` |
| グローカラー（Violet） | `rgba(139, 92, 246, 0.45)` |
| グローカラー（Cyan） | `rgba(6, 182, 212, 0.45)` |

（出典: style.css L517–L529, app.js L568–L573）

---

## 初期失敗パターン

GSAPの `ScrollTrigger` の `scrub` をカード本体（`.capability-card`）に直接適用すると、ホバー時の `gsap.to` による3D `rotateX`/`rotateY` が上書きされてカクつく問題が発生した。

**解決策**: ラッパー要素 `.capability-card-wrapper` を導入し、スクロール連動トランスフォームとホバー3Dトランスフォームを別の要素に分離することで競合を回避。

（出典: app.js L652–L660, style.css L508–L513）

---

## 既知の改善点

- **タッチデバイスでのカスタムカーソル非表示制御**: `@media (hover: hover)` によるカーソル表示の出し分けが未適用。タッチオンリー端末では無駄なDOM要素が残る。
- **画像アセットの外部依存**: カードホバー画像が外部Unsplash CDNに依存しており、ローカルアセット化が未対応。オフライン環境やCDN障害時に画像が表示されない。
