# concept.md — AI Officer HP 概念層

ダークテーマの企業向け AI エージェント LP。GSAP + Lenis を軸に、ローダー / ニューラルネット Canvas / マグネットボタン / 3D ティルトカード / 疑似ターミナルを 1 ページに統合した「金太郎飴脱却」型のヒーロー LP。

## 8 つのコア技術

（出典: index.html / css/*.css / js/*.js）

### 1. 起動ローダー（SVG path モーフ + GSAP timeline）
**技術名**: GSAP timeline + SVG path `attr` アニメーション
**素人向け解説**: 0→100% のカウントアップ後、画面を覆う黒い SVG を液体のように上へめくり上げて消す起動演出。`setInterval` でランダム加算カウントし、100 到達で `gsap.timeline` がコンテンツをフェードアウトしつつ SVG path の `d` 属性を曲線変形させる。

```js
const interval = setInterval(() => {
  count += Math.floor(Math.random() * 4) + 1;
  if (count >= 100) { count = 100; clearInterval(interval); triggerLoaderFadeOut(); }
  percentEl.textContent = count;
}, 30);
// SVG path を上へ湾曲させて液体スライドアウト
tl.to(loaderPath, { attr: { d: "M0,0 L100,0 L100,0 Q50,-30 0,0 Z" }, duration: 0.8, ease: "power4.in" }, "-=0.2");
```
（出典: js/core.js L98–L131 ローダー）
（出典: index.html L24–L36 `#loader` + `loader-svg-path`）

### 2. Lenis 慣性スムーススクロール（GSAP ticker 統合）
**技術名**: Lenis 1.0.34 + GSAP ScrollTrigger
**素人向け解説**: マウスホイールの動きを慣性付きで滑らかに補間するスクロール。Lenis の `raf` を GSAP の `ticker` に乗せ、`lenis.on('scroll', ScrollTrigger.update)` で ScrollTrigger と同期させる。

```js
lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothTouch: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
```
（出典: js/core.js L17–L37 Lenis）

### 3. AI コア ニューラルネット Canvas（Canvas 2D・外部ライブラリ無し）
**技術名**: 素の Canvas 2D API（Particle / Pulse / BinaryStream の 3 クラス）
**素人向け解説**: ヒーロー背景の青い粒子群。中心を周回する 120 個の粒子（`Particle`）を細い線でつなぎ、線上をデータパケット（`Pulse`）が流れ、背景には極薄の 2 進/16 進の縦流れ（`BinaryStream`）が降る。マウス半径 150px 内の粒子は反発する。色相は 210±20（青〜シアン）を時間で循環。

```js
function initParticles(){ particles=[]; for(let i=0;i<120;i++) particles.push(new Particle()); }
// 接続線: 距離 90px 未満で青線、線上に確率 0.15 で Pulse を生成（最大 35）
const maxDist = 90; // drawConnections
if (Math.random() < 0.15 && pulses.length < 35 && connections.length > 0) { /* Pulse 生成 */ }
```
（出典: js/canvas.js L28–L82 Particle / L85–L113 Pulse / L116–L160 BinaryStream / L162–L257 init+animate）
（出典: index.html L62–L64 `#ai-core-canvas`）

### 4. マグネット追従ボタン（GSAP `gsap.to`）
**技術名**: GSAP マウス追従 + elastic 復帰
**素人向け解説**: `.magnet` クラスの要素（ロゴ・ナビ・巨大 CTA）がカーソルに引き寄せられる。中心からのオフセット ×0.35 で本体、内側テキストは ×0.15 で動かし奥行きを出す。離れると `elastic.out` で弾んで戻る。

```js
gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: "power2.out" });
// 内側テキスト（.btn-giant-text / .logo-dot）は x*0.15, y*0.15
btn.addEventListener('mouseleave', () => gsap.to(btn, { x:0, y:0, duration:0.5, ease:"elastic.out(1, 0.4)" }));
```
（出典: js/core.js L42–L88 マグネット）

### 5. 無限マーキー（CSS のみ・track 2 連複製）
**技術名**: CSS `width: max-content` + 同一コンテンツ 2 連
**素人向け解説**: ヒーロー下部を横スクロールする極薄の英字テロップ。同じ文字列ブロックを 2 つ並べ `marquee-track` を `display:flex; width:max-content` にする静的構造（移動アニメーションは GSAP/CSS で付加可能だが本実装は無限ループ用の 2 連配置が骨格）。

```html
<div class="marquee-track">
  <div class="marquee-content">AUTONOMOUS GOVERNANCE // … //&nbsp;</div>
  <div class="marquee-content">AUTONOMOUS GOVERNANCE // … //&nbsp;</div>
</div>
```
（出典: index.html L88–L97 marquee / css/base.css L284–L312）

### 6. 3D ティルトカード（CSS perspective + GSAP rotateX/Y・3 層分離）
**技術名**: CSS `perspective` / `transform-style: preserve-3d` + GSAP
**素人向け解説**: カードを 3 層に分離する。(a) 静止ガラス層 `.card-glass`（backdrop-filter）、(b) コンテンツ層 `.card-tilt-content`（GSAP で最大 ±8° ティルト）、(c) ホバー裏画像。ティルトを内側層だけに当てることで backdrop-filter のちらつきを回避する。子要素は `translateZ` 30/40/20px で浮き出す。

```js
const tiltX = (y - centerY) / centerY * -8;
const tiltY = (x - centerX) / centerX * 8;
gsap.to(tiltContent, { rotateX: tiltX, rotateY: tiltY, duration: 0.3, ease: 'power2.out' });
```
```css
.card-header { transform: translateZ(30px); }
.card-title  { transform: translateZ(40px); }
.card-desc   { transform: translateZ(20px); }
```
（出典: js/interactions.js L20–L91 ティルト / css/sections.css L113–L234 カード層）

### 7. マウス追従グロー & ボーダーグロー（CSS 変数 + radial-gradient + mask xor）
**技術名**: CSS `radial-gradient(... at var(--mouse-x) var(--mouse-y))` + `mask-composite: exclude`
**素人向け解説**: カードごとに `--glow-color`（Blue/Pink/Violet/Cyan）を割り当て、`mousemove` で `--mouse-x/--mouse-y` を更新。`.card-bg-glow` は背景にスポットライト、`.card-border-glow` は同じグラデを mask の xor 合成で縁だけ切り出し光らせる。裏画像はカーソル逆方向 ×-0.06 でパララックス。

```css
.card-bg-glow { background: radial-gradient(350px circle at var(--mouse-x,0px) var(--mouse-y,0px), var(--glow-color, rgba(37,99,235,0.15)) 0%, rgba(0,0,0,0) 80%); }
.card-border-glow { -webkit-mask-composite: xor; mask-composite: exclude; }
```
```js
card.style.setProperty('--mouse-x', `${x}px`);
const imageX = (x - centerX) * -0.06; // 裏画像パララックス
```
（出典: css/sections.css L170–L185 bg-glow / L236–L258 border-glow / js/interactions.js L13–L65）

### 8. 疑似ターミナル タイプライター（DOM 生成ループ）
**技術名**: `setInterval` 1 文字送り + ログ配列の循環
**素人向け解説**: Interface セクションのターミナル風 UI に、input/output/system の 3 種ログを 1 文字ずつタイプ表示。配列を順送りで無限ループし、行数 40 超で先頭を削除して DOM 肥大を防ぐ。input は 25ms、output は 12ms、system は 2ms で速度差を付ける。

```js
function typeWriter(text, element, speed = 15, onComplete = null) {
  let i = 0;
  const interval = setInterval(() => { element.textContent += text.charAt(i); i++;
    if (i >= text.length) { clearInterval(interval); onComplete && onComplete(); }
    logContainer.scrollTop = logContainer.scrollHeight; }, speed);
}
```
（出典: js/interactions.js L142–L216 ターミナル）

---

## アーキテクチャ概要

アーキテクチャ名: GSAP 主導の単一 HTML 多セクション LP（外部ビルド無し）
CDN:
- Lucide Icons: `https://unpkg.com/lucide@latest`（アイコン描画。`lucide.createIcons()`）
- GSAP 3.12.5: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`
- ScrollTrigger 3.12.5: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js`
- Lenis 1.0.34: `https://unpkg.com/@studio-freight/lenis@1.0.34/dist/lenis.min.js`
- Google Fonts: Outfit / Inter / Share Tech Mono

Entry: `index.html` | Style: `css/base.css` + `css/sections.css` + `css/effects.css`
JS 3 分割: `js/core.js`（Lenis/loader/magnet/reveal）→ `js/canvas.js`（ニューラルネット Canvas）→ `js/interactions.js`（ティルト/scrub/ターミナル）
Main class: `Particle` / `Pulse` / `BinaryStream`（canvas.js）
（出典: index.html L8–L19 head / L302–L311 script）

> [!NOTE]
> 裏画像（`.card-hover-image`）は Unsplash 外部 CDN 依存。ホバー時のみ表示で初期描画には不要。CDN 障害時は画像のみ非表示（レイアウト・他演出は影響なし）。

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| 全体 | 背景色 | `#07080a` (--bg-dark) |
| 全体 | アクセント | `#2563eb` (--accent) |
| 全体 | フォント | Outfit / Inter / Share Tech Mono |
| Loader | カウント間隔 | 30ms・ランダム +1〜4 |
| Loader | SVG 初期 path | `M0,0 L100,0 L100,100 Q50,100 0,100 Z` → `M0,0 L100,0 L100,0 Q50,-30 0,0 Z` |
| Hero Canvas | 粒子数 | 120 |
| Hero Canvas | 周回半径 | baseRadius 100〜250 + noise±45 |
| Hero Canvas | 接続線距離 | 90px・線色 `rgba(59,130,246,α)` |
| Hero Canvas | マウス反発半径 | 150px・力 ×40 |
| Hero Canvas | 色相 | hue 210±20（青〜シアン） |
| Hero Canvas | Pulse | 確率0.15/frame・最大35・速度0.015〜0.035 |
| Hero | タイトル | `font-size:80px` Outfit 700・accent-text は白→#3b82f6 グラデ |
| Marquee | 文字色 | `rgba(255,255,255,0.15)`・`font-size:20px` |
| Card | ガラス背景 | `rgba(13,15,20,0.12)` + `backdrop-filter: blur(25px) saturate(200%)` |
| Card | Tilt 最大角 | ±8deg |
| Card | translateZ | header30 / title40 / desc20 px |
| Card | bg-glow 半径 | 350px / border-glow 半径 250px |
| Card | グローカラー | Blue `rgba(37,99,235,0.45)` / Pink `rgba(236,72,153,0.45)` / Violet `rgba(139,92,246,0.45)` / Cyan `rgba(6,182,212,0.45)` |
| Card | 裏画像 | 140%サイズ・`grayscale(100%) brightness(120%) contrast(110%)`・逆方向 ×-0.06 |
| Card scrub | ScrollTrigger | start `top 95%` / end `bottom 5%` / scrub 1.2・`y:50→0→-50, opacity:0.1→1→0.1` |
| Terminal | 高さ | 500px・速度 input25/output12/system2 ms・最大40行 |
| Connect | CTA | `.btn-giant` 直径220px 円・ホバー scale1.15・magnet 追従 |

アニメーション要約:
- Hero 入場: ローダー消去後 `triggerHeroEntrance()` で header フェードダウン → `.reveal-text span` を `yPercent:100→0` stagger0.15 → canvas opacity 0→0.8
- Identity: `.reveal-words` を単語分割し `top 85%` で `yPercent:0` stagger0.02。`.reveal-item` は `y:50→0, opacity:0→1`
- Capabilities: 各カードラッパーに scrub timeline（出現時下から、退出時上へ抜ける）
- Card ホバー: 内側層に rotateX/Y ティルト + bg/border グロー点灯 + 裏画像パララックス
（出典: js/core.js L136–L212 / js/interactions.js L96–L137）

---

## 初期失敗パターン

ScrollTrigger の `scrub` をカード本体（`.capability-card`）に直接当てると、ホバー時の `gsap.to` による 3D `rotateX/rotateY` が上書きされてカクついた。また backdrop-filter を持つ層に直接ティルトを当てるとちらつきが発生した。

**解決策**: ラッパー `.capability-card-wrapper`（scrub 担当）／ガラス `.card-glass`（静止）／`.card-tilt-content`（ティルト担当）の 3 層に責務分離し、transform 競合と backdrop-filter フリッカーを同時に回避した。
（出典: js/interactions.js L24, L42 コメント / L104–L137 / css/sections.css L106–L199）

---

## 既知の改善点

* **裏画像の外部依存**: カードホバー画像が Unsplash 外部 CDN 依存。ローカルアセット化が未対応でオフライン・CDN 障害時に裏画像のみ欠落する。
* **タッチ端末でのカスタム演出**: マグネット / ティルトは hover 前提。`@media (hover: hover)` での出し分けが未適用でタッチオンリー端末では無効動作の DOM が残る。
* **Lucide `@latest` 参照**: CDN が `lucide@latest` でバージョン非固定。再現性のためバージョン固定が望ましい（impl 内 index.html もこの行を踏襲）。
