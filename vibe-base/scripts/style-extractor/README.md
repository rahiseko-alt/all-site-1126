# style-extractor scripts

Lucent-Snow/style-extractor からスクリプトのみ抽出（2026-03-26）。
SKILL.mdは入れていない（作者信頼性の問題）。コード自体は安全性監査済み。

## 使い方

全スクリプトはブラウザ内で実行するIIFE。Puppeteerの `page.evaluate()` または chrome-devtools-mcp の `evaluate_script` に貼り付けて使う。

### transition-scanner.js
CSS transition の一括スキャン + @keyframes 抽出。
```js
// Puppeteer example
await page.evaluate(fs.readFileSync('scripts/style-extractor/transition-scanner.js', 'utf8'));
const transitions = await page.evaluate(() => __seTransition.scan());
const keyframes = await page.evaluate(() => __seTransition.keyframes());
```

### interaction-diff.js
インタラクション前後の inline style + computed style 差分を取得。
```js
await page.evaluate(fs.readFileSync('scripts/style-extractor/interaction-diff.js', 'utf8'));
await page.evaluate(() => __seDiff.watch(['.hero', 'button', '[data-appear]']));
const diff = await page.evaluate(() => __seDiff.triggerAndCapture(() => document.querySelector('.nav-item').click()));
```

### motion-tools.js
`document.getAnimations()` スナップショット + rAF サンプリング。
```js
await page.evaluate(fs.readFileSync('scripts/style-extractor/motion-tools.js', 'utf8'));
const capture = await page.evaluate(() => __seMotion.capture('page-load'));
const sample = await page.evaluate(() => __seMotion.sample('.animated-el', { durationMs: 800 }));
```

### library-detect.js
GSAP / Swiper / AOS / Framer Motion / Lottie / Three.js 等の検出。
```js
await page.evaluate(fs.readFileSync('scripts/style-extractor/library-detect.js', 'utf8'));
// 戻り値: { globals, instances, dom, fingerprints, assets }
```

### extract-keyframes.py
ダウンロード済みCSSファイルから @keyframes を抽出（オフライン）。
```bash
python scripts/style-extractor/extract-keyframes.py evidence/assets/ --out keyframes.md
```

## 出典
- リポジトリ: https://github.com/Lucent-Snow/style-extractor
- ライセンス: 未設定（注意）
- 安全性: コード監査済み（外部通信0/eval0/不可視Unicode0）
