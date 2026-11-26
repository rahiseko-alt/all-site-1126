# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-27] lucas-aufrere-rotonde 調査（Claude Sonnet 4.6）

### Step 1: HTML `<head>` + 技術スタック特定

Node.js `fetch()` で HTML を取得（WebFetch は head タグを markdown 変換で消す問題を回避）。

検出技術スタック（meta keywords より）:
- Next.js, React, GSAP, Motion, WordPress, Three.js, WebGL, TypeScript
- フォント: Manrope（WOFF2 プリロード x2）
- CSS チャンク: `17r4~eua6zz0f.css`（Manrope @font-face）/ `12u0pwmje6kap.css`（global reset, dark）

結論: Three.js 使用 → Step 5 ターゲット。ただしトップページと /projets で JS チャンク数が異なる（トップ: 13 / /projets: 14）ことを確認。

### Step 2: JS/CSS ソース直読

チャンク構成を特定:
- `14w0wssm09w55.js` (150KB): Lenis v1.3.23 + GSAP ScrollTrigger
- `00ehrth4vmvp0.js` (36KB): useScrollReveal / Rotonde 定数 / 6 プロジェクトデータ
- `0orvopuuxogm5.js` (42KB): Hero コンポーネント / tile effect / RotondeSection
- `05pz9j49slg7c.js` (973KB, /projets のみ): Three.js r171 + R3F v9.6.0 + troika-three-text + Rotonde 実装本体

Three.js REVISION=171 を `05pz9j49slg7c.js` 内で確認。

Lenis 設定値（`14w0wssm09w55.js` より）:
- lerp=0.1（mobile=1）/ smoothWheel=true（mobile=false）/ wheelMultiplier=1

Rotonde 定数（`00ehrth4vmvp0.js` MODULE 80116 より）:
- DOLLY_DISTANCE=15 / PROJECT_COUNT=6 / SLOT_ANGLE=π/3

### Step 3: 公式ドキュメント確認

троika-three-text API（CDN URL + props）を確認:
- `https://cdn.jsdelivr.net/npm/troika-three-text@0.51.2/dist/troika-three-text.esm.js`
- props: `font`, `fontSize`, `letterSpacing`, `curveRadius`, `anchorX`, `anchorY`, `color`
- `.sync()` で非同期フォント読込をトリガーする

### Step 4: Playwright 動作確認

トップページ: ブラウザ起動 + スクリーンショット取得成功。
/projets: `networkidle` タイムアウト（Three.js の continuous RAF loop によりネットワーク待機が終わらない）→ 正常動作の副作用として確認。

### Step 5: GLSL / Three.js ソース直読

`05pz9j49slg7c.js`（973KB）を Node.js fetch で取得し文字列解析:

**湾曲ジオメトリ h$()** を確認（`PlaneGeometry + Z 変位` パターン）:
```js
arr[i+2] = cornerRadius - Math.sqrt(r2 - x*x)
```

**onBeforeCompile GLSL 注入** を確認:
- vertex: `transformed.z *= 1.0 - uFlatProgress`
- fragment: luma weights `0.299, 0.587, 0.114` + `mix(vec3(luma), rgb, uSaturation)`

**R3F Canvas props** を確認: dpr=[1,2], fov=72, near=0.01, far=60, antialias=true, alpha=false

**カメラドリー** を確認: `ease²`, z=-15*t, rotY=0.18*t

**useFrame 回転ロジック** を確認:
- lerp: `r.current += 0.14 * (target - r.current)`
- inertia: `velocity *= pow(0.9, 60*dt)`
- wheel: `velocity -= 2e-4 * wheelDelta`
- arrow: `±SLOT_ANGLE (π/3)`

**hV / hH row 定義** を確認（y, w, h, angleOffset, projectOrder, isMain, opacity, mirrorY 全値）

**troika-three-text ラベル** props 確認（3 種類: index/title/stack+year）

**hD=Math.PI/9** 用途確認（ポインタムーブイベント内):
- `c.current = Math.max(-hD, Math.min(hD, c.current + 0.0015 * n))`
- n = clientY delta → 垂直ドラッグ量を ±π/9 にクランプ

**RotondeCanvas CSS** 確認（`15dmpvvfnvsgk.css` 内 `.zZrEOW__root` クラス）:
- /projets ページのみ読み込まれる第3 CSS チャンク
- `height:100dvh`, `cursor:grab`, `data-dragging=true→grabbing`

**6 プロジェクト画像 URL** 確認（`00ehrth4vmvp0.js` projetSlider 配列より全6件）:
- dexnill, kengo-kuma, jacquemus, fyconic, poivreblanc, bonbon-sauvage 全て確認済

### 未解決 / 近似適用

- hD の downstream 用途: `c.current`（dragY）がカメラ/scene のどの値に適用されるかは source trace 未完。concept.md「既知の改善点」に記載。
- RotondeOverlay（フォーカス時プロジェクト詳細）: 別コンポーネントのため standalone 実装対象外。
