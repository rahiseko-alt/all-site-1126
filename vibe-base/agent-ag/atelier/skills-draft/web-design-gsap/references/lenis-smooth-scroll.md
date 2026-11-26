# Lenis Smooth Scroll & GSAP ScrollTrigger Integration

Lenis は、Web サイトに慣性スクロール（スムーズスクロール）を導入するための軽量かつ高性能なライブラリです。GSAP の ScrollTrigger と完全に同期させることで、スクロール連動アニメーションの品質を飛躍的に向上させることができます。

---

## 1. クイックスタート (CDN 導入)

HTML に以下の CDN リンクを追加します。

```html
<!-- Lenis CSS (スクロール動作の最適化) -->
<style>
  html.lenis, html.lenis body {
    height: auto;
  }
  .lenis-smooth {
    scroll-behavior: auto !important;
  }
  .lenis-smooth [data-lenis-prevent] {
    overscroll-behavior: contain;
  }
  .lenis-blocked {
    overflow: hidden;
  }
  .lenis-stopped {
    overflow: hidden;
  }
</style>

<!-- Lenis JS -->
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
<!-- GSAP & ScrollTrigger -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

---

## 2. 基本セットアップ・初期化

JavaScript で Lenis を初期化し、GSAP の Ticker と ScrollTrigger に同期させます。

```javascript
// Lenis の初期化
const lenis = new Lenis({
  duration: 1.2, // スクロールのアニメーション時間（秒）
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // イージング関数
  direction: 'vertical', // スクロール方向 ('vertical' | 'horizontal')
  gestureDirection: 'vertical', // タッチジェスチャの方向
  smoothWheel: true, // ホイールスクロールをスムーズにするか
  wheelMultiplier: 1, // ホイールスクロールの速度倍率
  touchMultiplier: 1.5, // タッチスクロールの速度倍率
  infinite: false, // 無限スクロールにするか
});

// ScrollTrigger と Lenis の同期
// Lenis がスクロールするたびに ScrollTrigger を更新する
lenis.on('scroll', ScrollTrigger.update);

// GSAP の Ticker に Lenis の raf (requestAnimationFrame) を追加
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // ミリ秒単位で渡す
});

// Ticker の遅延補正を無効化（スクロール時のカクつきを防止）
gsap.ticker.lagSmoothing(0);
```

---

## 3. 主要な API とユースケース

### スクロールの制御（一時停止と再開）
ポップアップやフルスクリーンメニューを開いた際に、背後のページスクロールを止めたい場合に使用します。

```javascript
// スクロールを一時停止
lenis.stop();

// スクロールを再開
lenis.start();
```

### 指定要素へのスムーズスクロール (Anchor Scroll)
ページ内リンクをクリックした際、特定のターゲット要素まで慣性スクロールで移動します。

```javascript
const button = document.querySelector('#scroll-to-target');
button.addEventListener('click', () => {
  lenis.scrollTo('#target-section', {
    offset: -50,       // スクロール先のオフセット（ピクセル）
    duration: 1.5,     // スクロールにかける時間（秒）
    immediate: false,  // アニメーションなしで即座に移動するか
    easing: (t) => t,  // カスタムイージング
  });
});
```

### 特定エリアでの慣性スクロール防止 (`data-lenis-prevent`)
地図要素（Google Maps）や、内部スクロールを持つモーダル・コンテナなど、ページ全体のスムーズスクロールに干渉させたくない要素には HTML 属性を付与します。

```html
<div class="modal-scroll-area" data-lenis-prevent>
  <!-- この中では親ページの Lenis スクロールがトリガーされません -->
</div>
```

---

## 4. GSAP ScrollTrigger との連携時のベストプラクティス

1. **`pin` と `scrub` の同期**:
   Lenis の慣性スクロールと ScrollTrigger の `scrub: true` または `scrub: 1` などの設定は相性が抜群です。ホイールを止めた後も滑らかにアニメーションが慣性で動き続けます。
2. **ページ遷移時のリセット**:
   SPA や動的なコンテンツ読み込み時、ページの高さが変わった場合は必ず Lenis を更新してください。
   ```javascript
   lenis.resize();
   ```
3. **アンカーリンクのデフォルト挙動のオーバーライド**:
   CSS の `scroll-behavior: smooth` は Lenis と競合するため使用せず、必ず JavaScript 側の `lenis.scrollTo()` を使用してください。
