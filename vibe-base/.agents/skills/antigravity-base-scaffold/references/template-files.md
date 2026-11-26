# Antigravity Base — テンプレートファイル一覧

> [!IMPORTANT]
> このファイルに記載された全コードを、指定パスに `write_to_file` で作成せよ。
> コードの改変・省略は禁止。`$TARGET` はユーザー指定のターゲットディレクトリに置換すること。

---

## File 1: `$TARGET/package.json`

```json
{
  "name": "antigravity-base",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Antigravity 2.0 最適化フロントエンド基盤 — CPU軽量・AI自律検証対応",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview",
    "test:visual": "npx playwright test tests/visual.spec.js"
  },
  "devDependencies": {
    "vite": "^8.0.16",
    "@playwright/test": "^1.61.0"
  },
  "dependencies": {}
}
```

---

## File 2: `$TARGET/vite.config.js`

```js
import { defineConfig } from 'vite';

export default defineConfig({
  // ── ビルド設定 ──
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },

  // ── 開発サーバー設定 ──
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    hmr: {
      overlay: true,
    },
  },

  // ── CSS設定 ──
  css: {
    devSourcemap: true,
  },

  // ── パフォーマンス最適化（CPU環境向け） ──
  optimizeDeps: {
    entries: ['./src/main.js'],
  },
});
```

---

## File 3: `$TARGET/index.html`

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Antigravity Design Showcase</title>
  <meta name="description" content="Antigravity 2.0 最適化フロントエンド基盤 — AI自律検証対応デザインショーケース" />

  <!-- Google Fonts: Inter + Noto Sans JP -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />

  <!-- GSAP + ScrollTrigger (CDN) -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
</head>
<body>
  <div id="app">
    <div id="nav-bar"></div>
    <main>
      <div id="hero-section"></div>
      <div id="features-section"></div>
    </main>
    <div id="footer-section"></div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## File 4: `$TARGET/src/styles/reset.css`

```css
/* ===== Modern CSS Reset ===== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -moz-text-size-adjust: none;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

a {
  color: inherit;
  text-decoration: none;
}

ul, ol {
  list-style: none;
}
```

---

## File 5: `$TARGET/src/styles/tokens.css`

```css
/* ===== Design Tokens — CSS Custom Properties ===== */
/* Antigravityが値を変更するだけでデザイン全体を制御できる */

:root {
  /* ── カラーパレット（HSL指定 → AIが調整しやすい） ── */
  --color-bg-primary:      hsl(228, 18%, 8%);
  --color-bg-secondary:    hsl(228, 16%, 12%);
  --color-bg-tertiary:     hsl(228, 14%, 16%);
  --color-bg-card:         hsl(228, 16%, 14%);
  --color-bg-glass:        hsla(228, 18%, 16%, 0.6);

  --color-text-primary:    hsl(210, 40%, 96%);
  --color-text-secondary:  hsl(215, 20%, 65%);
  --color-text-muted:      hsl(215, 15%, 45%);

  --color-accent-primary:  hsl(250, 85%, 65%);
  --color-accent-hover:    hsl(250, 90%, 72%);
  --color-accent-glow:     hsla(250, 85%, 65%, 0.3);

  --color-accent-secondary: hsl(175, 70%, 50%);
  --color-accent-tertiary:  hsl(330, 80%, 60%);

  --color-border:          hsla(215, 20%, 40%, 0.2);
  --color-border-hover:    hsla(215, 20%, 50%, 0.3);

  /* ── グラデーション ── */
  --gradient-hero:         linear-gradient(135deg, hsl(250, 85%, 65%) 0%, hsl(330, 80%, 60%) 50%, hsl(175, 70%, 50%) 100%);
  --gradient-card:         linear-gradient(145deg, hsla(250, 60%, 50%, 0.08) 0%, hsla(330, 60%, 50%, 0.05) 100%);
  --gradient-text:         linear-gradient(135deg, hsl(250, 85%, 70%) 0%, hsl(175, 70%, 55%) 100%);

  /* ── スペーシング ── */
  --space-xs:   0.25rem;
  --space-sm:   0.5rem;
  --space-md:   1rem;
  --space-lg:   1.5rem;
  --space-xl:   2rem;
  --space-2xl:  3rem;
  --space-3xl:  4rem;
  --space-4xl:  6rem;
  --space-5xl:  8rem;

  /* ── ボーダー半径 ── */
  --radius-sm:   0.375rem;
  --radius-md:   0.75rem;
  --radius-lg:   1rem;
  --radius-xl:   1.5rem;
  --radius-full: 9999px;

  /* ── シャドウ ── */
  --shadow-sm:   0 1px 2px hsla(0, 0%, 0%, 0.3);
  --shadow-md:   0 4px 12px hsla(0, 0%, 0%, 0.3);
  --shadow-lg:   0 8px 32px hsla(0, 0%, 0%, 0.4);
  --shadow-glow: 0 0 40px var(--color-accent-glow);

  /* ── トランジション ── */
  --transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base:   250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   400ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── レイアウト ── */
  --max-width:     1200px;
  --header-height: 72px;
}
```

---

## File 6: `$TARGET/src/styles/typography.css`

```css
/* ===== Typography System ===== */

body {
  font-family: 'Noto Sans JP', 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 1rem;
  color: var(--color-text-primary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Inter', 'Noto Sans JP', system-ui, sans-serif;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h1 {
  font-size: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
}

h2 {
  font-size: clamp(1.75rem, 3vw + 0.5rem, 2.75rem);
}

h3 {
  font-size: clamp(1.25rem, 2vw + 0.25rem, 1.75rem);
}

p {
  font-size: 1.0625rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.text-gradient {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent-primary);
}
```

---

## File 7: `$TARGET/src/styles/animations.css`

```css
/* ===== Micro-Animations & Keyframes ===== */

/* フェードイン上昇 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* フェードイン */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* パルス発光 */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px var(--color-accent-glow);
  }
  50% {
    box-shadow: 0 0 40px var(--color-accent-glow), 0 0 60px hsla(250, 85%, 65%, 0.15);
  }
}

/* 浮遊 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}

/* グラデーションシフト */
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* スピン（ローディング用） */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ユーティリティクラス */
.animate-fade-in-up {
  animation: fadeInUp 0.6s var(--transition-base) both;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease both;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

/* GSAP初期状態（JSでアニメーション前に適用） */
.gsap-hidden {
  opacity: 0;
  transform: translateY(40px);
}
```

---

## File 8: `$TARGET/src/styles/index.css`

```css
/* ===== Style Entry Point ===== */
/* 順序重要: reset → tokens → typography → animations → page styles */

@import './reset.css';
@import './tokens.css';
@import './typography.css';
@import './animations.css';

/* ── グローバルベース ── */
body {
  background-color: var(--color-bg-primary);
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── セクション共通 ── */
.section {
  padding: var(--space-5xl) var(--space-xl);
  max-width: var(--max-width);
  margin: 0 auto;
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-4xl);
}

.section-header .text-label {
  margin-bottom: var(--space-sm);
  display: block;
}

/* ── ボタン共通 ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: var(--color-accent-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-accent-hover);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
  transform: translateY(-2px);
}

/* ── グラスモーフィズム共通 ── */
.glass {
  background: var(--color-bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
}

/* ── カード共通 ── */
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  transition: all var(--transition-base);
}

.card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

/* ── ナビゲーション ── */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-2xl);
  transition: all var(--transition-base);
}

.nav.scrolled {
  background: var(--color-bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
}

.nav-logo {
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.nav-links {
  display: flex;
  gap: var(--space-xl);
  align-items: center;
}

.nav-links a {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
  position: relative;
}

.nav-links a:hover {
  color: var(--color-text-primary);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-accent-primary);
  transition: width var(--transition-base);
}

.nav-links a:hover::after {
  width: 100%;
}

/* ── ヒーローセクション ── */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: calc(var(--header-height) + var(--space-4xl)) var(--space-xl) var(--space-4xl);
  position: relative;
  overflow: hidden;
}

.hero-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  pointer-events: none;
}

.hero-bg-orb--1 {
  width: 600px;
  height: 600px;
  background: var(--color-accent-primary);
  top: -100px;
  right: -200px;
}

.hero-bg-orb--2 {
  width: 400px;
  height: 400px;
  background: var(--color-accent-tertiary);
  bottom: -50px;
  left: -100px;
}

.hero-bg-orb--3 {
  width: 300px;
  height: 300px;
  background: var(--color-accent-secondary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-glass);
  backdrop-filter: blur(10px);
  font-size: 0.8125rem;
  color: var(--color-accent-primary);
  font-weight: 500;
  margin-bottom: var(--space-xl);
}

.hero-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  animation: pulseGlow 2s ease-in-out infinite;
}

.hero h1 {
  margin-bottom: var(--space-lg);
}

.hero-description {
  font-size: 1.1875rem;
  max-width: 600px;
  margin: 0 auto var(--space-2xl);
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

/* ── フィーチャーセクション ── */
.features {
  padding: var(--space-5xl) var(--space-xl);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-xl);
  max-width: var(--max-width);
  margin: 0 auto;
}

.feature-card {
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-hero);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: var(--space-lg);
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
}

.feature-card h3 {
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.feature-card p {
  font-size: 0.9375rem;
  line-height: 1.7;
}

/* ── フッター ── */
.footer {
  margin-top: auto;
  padding: var(--space-3xl) var(--space-xl);
  border-top: 1px solid var(--color-border);
  text-align: center;
  background: var(--color-bg-secondary);
}

.footer-content {
  max-width: var(--max-width);
  margin: 0 auto;
}

.footer-brand {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 800;
  margin-bottom: var(--space-md);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.footer-links a {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--color-accent-primary);
}

.footer-copy {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

/* ── レスポンシブ ── */
@media (max-width: 768px) {
  .nav-links {
    display: none; /* モバイルではハンバーガーメニュー化（将来拡張） */
  }

  .hero {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
    padding: 0 var(--space-md);
  }

  .section {
    padding: var(--space-3xl) var(--space-md);
  }
}
```

---

## File 9: `$TARGET/src/components/nav-bar.js`

```js
/**
 * ナビゲーションバーコンポーネント
 * スクロール時に半透明glassmorphismヘッダーに変化
 */
export function renderNavBar(container) {
  container.innerHTML = `
    <nav class="nav" id="main-nav">
      <div class="nav-logo">
        <span class="text-gradient">AG</span> Studio
      </div>
      <div class="nav-links">
        <a href="#features-section">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#" class="btn btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.8125rem;">Get Started</a>
      </div>
    </nav>
  `;

  // スクロール検知 → .scrolled クラス付与
  const nav = container.querySelector('#main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}
```

---

## File 10: `$TARGET/src/components/hero-section.js`

```js
/**
 * ヒーローセクションコンポーネント
 * 背景にグラデーションオーブ、中央にテキスト＋CTAボタン
 */
export function renderHeroSection(container) {
  container.innerHTML = `
    <div class="hero">
      <!-- 背景オーブ（装飾） -->
      <div class="hero-bg-orb hero-bg-orb--1"></div>
      <div class="hero-bg-orb hero-bg-orb--2"></div>
      <div class="hero-bg-orb hero-bg-orb--3"></div>

      <div class="hero-content">
        <div class="hero-badge gsap-hidden">
          <span class="hero-badge-dot"></span>
          Antigravity 2.0 Optimized
        </div>

        <h1 class="gsap-hidden">
          Design at the<br />
          <span class="text-gradient">Speed of Thought</span>
        </h1>

        <p class="hero-description gsap-hidden">
          AIが自律的にUIを検証・修正する次世代フロントエンド基盤。<br />
          CPU軽量設計で、あなたのローカル環境でも瞬時にビルド。
        </p>

        <div class="hero-actions gsap-hidden">
          <button class="btn btn-primary" id="hero-cta-primary">
            <span>🚀</span> Explore Features
          </button>
          <button class="btn btn-secondary" id="hero-cta-secondary">
            <span>📖</span> Documentation
          </button>
        </div>
      </div>
    </div>
  `;
}
```

---

## File 11: `$TARGET/src/components/feature-card.js`

```js
/**
 * フィーチャーカードセクションコンポーネント
 * 3カラムのカードグリッド
 */

const FEATURES = [
  {
    icon: '⚡',
    title: 'Lightning Build',
    description: 'Vite 8.x + esbuild による瞬間ビルド。i5 CPU でもコールドスタート 300ms 以下。HMR は体感ゼロ秒。',
  },
  {
    icon: '🔍',
    title: 'AI Visual Inspection',
    description: 'Playwright + pixelmatch による自律的 Visual Regression Testing。Antigravity がスクリーンショットを比較し、ピクセル単位でUIの整合性を検証。',
  },
  {
    icon: '🎨',
    title: 'Design Token System',
    description: 'CSS Custom Properties による完全トークン化。カラー・スペーシング・タイポグラフィを1箇所変更するだけでデザイン全体が連動。',
  },
  {
    icon: '🧩',
    title: 'Component Architecture',
    description: '1ファイル1コンポーネント、各200行以内。AIが全容を把握して安全に修正できるサイズに設計。',
  },
  {
    icon: '🌊',
    title: 'GSAP Animations',
    description: 'ScrollTrigger 連動のスクロールアニメーション。60fps を維持しながらプレミアムなモーションを実現。',
  },
  {
    icon: '🌐',
    title: 'Browser Subagent Ready',
    description: 'Antigravity 2.0 の Browser Subagent（Gemini UI Checkpoint）と完全互換。DOM解析・自律修正の最適ターゲット。',
  },
];

export function renderFeatureCards(container) {
  const cardsHtml = FEATURES.map((f, i) => `
    <div class="card feature-card gsap-hidden" data-feature-index="${i}">
      <div class="feature-icon">${f.icon}</div>
      <h3>${f.title}</h3>
      <p>${f.description}</p>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="features">
      <div class="section-header">
        <span class="text-label">Features</span>
        <h2 class="gsap-hidden">
          Built for <span class="text-gradient">AI-Driven</span> Development
        </h2>
        <p class="gsap-hidden" style="max-width: 600px; margin: var(--space-md) auto 0;">
          Antigravity 2.0 のデザイン能力を100%引き出すために設計された、すべての機能。
        </p>
      </div>
      <div class="features-grid">
        ${cardsHtml}
      </div>
    </div>
  `;
}
```

---

## File 12: `$TARGET/src/components/footer-section.js`

```js
/**
 * フッターコンポーネント
 */
export function renderFooter(container) {
  const year = new Date().getFullYear();

  container.innerHTML = `
    <div class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="text-gradient">AG</span> Studio
        </div>
        <div class="footer-links">
          <a href="#features-section">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="https://antigravity.google" target="_blank" rel="noopener noreferrer">Antigravity</a>
        </div>
        <p class="footer-copy">
          &copy; ${year} AG Studio. Powered by Antigravity 2.0 &mdash; CPU Optimized Frontend.
        </p>
      </div>
    </div>
  `;
}
```

---

## File 13: `$TARGET/src/utils/animate.js`

```js
/**
 * GSAP ScrollTrigger 連携ユーティリティ
 * CDN版GSAPが読み込まれていることが前提（index.htmlでdefer読み込み済み）
 */

/**
 * .gsap-hidden クラスを持つ要素にスクロール連動フェードインを適用
 */
export function initScrollAnimations() {
  // GSAPとScrollTriggerがグローバルに読み込まれるまで待機
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[animate] GSAP not loaded yet, retrying in 100ms...');
    setTimeout(initScrollAnimations, 100);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // .gsap-hidden を持つ全要素をアニメーション対象にする
  const elements = document.querySelectorAll('.gsap-hidden');

  elements.forEach((el, index) => {
    gsap.fromTo(el,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: index * 0.1,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}

/**
 * ヒーロー背景オーブのゆっくりした浮遊アニメーション
 */
export function initOrbAnimations() {
  if (typeof gsap === 'undefined') {
    setTimeout(initOrbAnimations, 100);
    return;
  }

  const orbs = document.querySelectorAll('.hero-bg-orb');
  orbs.forEach((orb, i) => {
    gsap.to(orb, {
      y: `random(-30, 30)`,
      x: `random(-20, 20)`,
      duration: `random(4, 7)`,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.5,
    });
  });
}
```

---

## File 14: `$TARGET/src/main.js`

```js
/**
 * アプリケーションエントリポイント
 * 各コンポーネントをレンダリングし、アニメーションを初期化
 */
import { renderNavBar }       from './components/nav-bar.js';
import { renderHeroSection }  from './components/hero-section.js';
import { renderFeatureCards }  from './components/feature-card.js';
import { renderFooter }        from './components/footer-section.js';
import { initScrollAnimations, initOrbAnimations } from './utils/animate.js';

// DOM構築
function init() {
  renderNavBar(document.getElementById('nav-bar'));
  renderHeroSection(document.getElementById('hero-section'));
  renderFeatureCards(document.getElementById('features-section'));
  renderFooter(document.getElementById('footer-section'));

  // GSAP アニメーション初期化（CDN読み込み完了後に実行）
  initScrollAnimations();
  initOrbAnimations();
}

// DOMContentLoaded で初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

---

## File 15: `$TARGET/tests/visual.spec.js`

```js
// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Antigravity Base — Visual Regression', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // ページ読み込み完了を待つ
    await page.waitForLoadState('networkidle');
    // GSAP アニメーション完了を待つ（1.5秒）
    await page.waitForTimeout(1500);
  });

  test('ページタイトルが正しい', async ({ page }) => {
    await expect(page).toHaveTitle(/Antigravity Design Showcase/);
  });

  test('ナビゲーションバーが表示される', async ({ page }) => {
    const nav = page.locator('#main-nav');
    await expect(nav).toBeVisible();
  });

  test('ヒーローセクションのh1が表示される', async ({ page }) => {
    const h1 = page.locator('.hero h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Speed of Thought');
  });

  test('フィーチャーカードが6枚表示される', async ({ page }) => {
    const cards = page.locator('.feature-card');
    await expect(cards).toHaveCount(6);
  });

  test('フルページスクリーンショット', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/full-page.png',
      fullPage: true,
    });
  });

  test('ヒーローセクションスクリーンショット', async ({ page }) => {
    const hero = page.locator('.hero');
    await hero.screenshot({
      path: 'tests/screenshots/hero-section.png',
    });
  });

  test('スクロール後にナビがglass化する', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);
    const nav = page.locator('#main-nav');
    await expect(nav).toHaveClass(/scrolled/);
  });

});
```

---

## ディレクトリ（空）

### `$TARGET/tests/screenshots/`

空ディレクトリとして作成する。コマンド例:
```bash
mkdir -p $TARGET/tests/screenshots
```
