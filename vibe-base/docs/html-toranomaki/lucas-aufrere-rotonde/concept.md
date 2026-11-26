# concept.md — Lucas Aufrère Rotonde 3D カルーセル 概念層

## 6 つのコア技術

（出典: 05pz9j49slg7c.js「Rotonde モジュール」節）

### 1. Three.js r171 + @react-three/fiber v9.6.0
**技術名**: Three.js WebGL レンダラー / React Three Fiber
**解説**: サイトは R3F で宣言的にシーンを組む。standalone 実装では vanilla Three.js を使い同等構造を再現する。dpr=[1,2], antialias=true, alpha=false。

### 2. 湾曲 PlaneGeometry（h$()）
**技術名**: 独自カーブドジオメトリ
**解説**: `PlaneGeometry(w, h, 16, 1)` の各頂点 Z を `r - sqrt(r²-x²)` で変位させ、カードを半径 9 の仮想シリンダー面に沿わせる。`r=9`、セグメント 16×1。

### 3. onBeforeCompile GLSL 注入（uFlatProgress / uSaturation）
**技術名**: MeshBasicMaterial.onBeforeCompile
**解説**: 頂点シェーダーに `uFlatProgress`（Z 平坦化率 0=湾曲/1=平坦）、フラグメントシェーダーに `uSaturation`（彩度 0=グレー/1=カラー）を注入する。luma weights: 0.299/0.587/0.114。

### 4. troika-three-text（curveRadius=-9 曲面テキスト）
**技術名**: troika-three-text v0.51.2
**解説**: 3D テキストを半径 -9 の曲面に沿って描画する。タイトル: Manrope 500 / インデックス・スタック: JetBrains Mono 400。

### 5. Rotonde 慣性カルーセル
**技術名**: 独自実装（SLOT_ANGLE + inertia + lerp）
**解説**: 6 枚のカードを半径 9 の円周に等間隔配置（SLOT_ANGLE=π/3）。ホイールで慣性スピン、矢印キーで 60° スナップ、ドラッグで直接操作。7 行構成（メイン 3 + ゴースト 4）。

### 6. FogExp2 + 暗背景
**技術名**: THREE.FogExp2
**解説**: 指数霧（color=#050505, density=0.035）で遠景を消去し、カード間の奥行き感を演出する。

---

## アーキテクチャ概要

フレームワーク（本家）: Next.js 15 + Turbopack / R3F v9.6.0 / Three.js r171
standalone 構成: Three.js r171 (vanilla) + troika-three-text v0.51.2

CDN (importmap):
```
"three": "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js"
"troika-three-text": "https://cdn.jsdelivr.net/npm/troika-three-text@0.51.2/dist/troika-three-text.esm.js"
```

Entry: `js/app.js` (type="module", top-level await 使用) | Style: `css/style.css`
Canvas: `<canvas id="c"></canvas>`
（出典: 05pz9j49slg7c.js 冒頭 / 15dmpvvfnvsgk.css）

---

## シーン設計

### カメラ + レンダラー
（出典: 05pz9j49slg7c.js Canvas props）

| 要素 | 値 |
|------|----|
| fov | 72 |
| near | 0.01 |
| far | 60 |
| dpr | min(devicePixelRatio, 2) |
| antialias | true |
| alpha | false |
| camera 初期位置 | [0, 0, 0] |
| scene.background | #050505 |
| FogExp2 color | #050505 |
| FogExp2 density | 0.035 |

### ロウ定義（7 行）
（出典: 05pz9j49slg7c.js hV, hH + hG(hB,N) projectOrder）

#### メイン 3 行 (hV)
| y | w | h | angleOffset | isMain | projectShift |
|---|---|---|-------------|--------|--------------|
| 4.5 | 3 | 2 | π/8 | false | 3 |
| 0 | 8 | 4.5 | 0 | true | 0 |
| -4.5 | 3 | 2 | π/8 | false | 5 |

#### ゴースト 4 行 (hH)
| y | w | h | angleOffset | opacity | mirrorY | projectShift |
|---|---|---|-------------|---------|---------|--------------|
| 9.5 | 3 | 2 | 0 | 0.45 | true | 1 |
| 14 | 2.55 | 1.7 | π/8 | 0.22 | false | 0 |
| -9.5 | 3 | 2 | 0 | 0.45 | true | 1 |
| -14 | 2.55 | 1.7 | π/8 | 0.22 | false | 0 |

mirrorY=true のカードは `mesh.scale.y = -1` を適用する（垂直反転）。
projectShift N: スロット i のプロジェクト = `PROJECTS[(i + N) % 6]`

### カード配置（半径 9 の円周）
（出典: 05pz9j49slg7c.js card positioning）

```
angle  = rotationAngle + i * (π/3) + row.angleOffset   // i = 0..5
x      = 9 * sin(angle)
z      = -9 * cos(angle)
rotY   = -angle
y      = row.y（固定）
```

### 湾曲ジオメトリ h$()
（出典: 05pz9j49slg7c.js h$()）

```
geo = new PlaneGeometry(w, h, 16, 1)
for each vertex (i += 3):
  x_abs    = min(|arr[i]|, 9)
  arr[i+2] = 9 - sqrt(81 - x_abs²)
geo.attributes.position.needsUpdate = true
geo.computeVertexNormals()
```

### GLSL 注入
（出典: 05pz9j49slg7c.js onBeforeCompile）

```glsl
// 頂点 — #include <begin_vertex> の直後
uniform float uFlatProgress;
transformed.z *= 1.0 - uFlatProgress;

// フラグメント — #include <map_fragment> の直後
uniform float uSaturation;
float luma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
diffuseColor.rgb = mix(vec3(luma), diffuseColor.rgb, uSaturation);
```

初期値: uFlatProgress=0（完全湾曲）/ uSaturation=1（完全彩色）

### troika-three-text ラベル（メインロウ w=8 のみ）
（出典: 05pz9j49slg7c.js troika-three-text labels）

| 種別 | フォント | fontSize | letterSpacing | curveRadius | position |
|------|--------|----------|---------------|-------------|----------|
| インデックス | JetBrains Mono 400 | 0.16 | 0.12 | -9 | [-4, 3.05, 0] |
| タイトル | Manrope 500 | 0.38 | -0.02 | -9 | [-4, 2.45, 0] |
| スタック+年 | JetBrains Mono 400 | 0.13 | 0.12 | -9 | [-4, -2.45, 0] |

フォント URL（出典: 05pz9j49slg7c.js hj定数, hP.font prop）:
- Manrope 500: `https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-500-normal.woff`
- JetBrains Mono 400: `https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff`

全ラベル共通: `anchorX='left'`, `anchorY='middle'`

### 6 プロジェクト（画像 URL）
（出典: 00ehrth4vmvp0.js projects 配列）

| index | name | year | stack | image |
|-------|------|------|-------|-------|
| 01 | Dexnill Productions | 2023 | Next.js · GSAP · WebGL | /projetSlider/dexnill-productions-lucas-aufrere.webp |
| 02 | Kengo Kuma | 2024 | Next.js · Three.js | /projetSlider/kengo-kuma-projet-lucas-aufrere.webp |
| 03 | Jacquemus | 2024 | WordPress · GSAP | /projetSlider/jacquemus-projet-lucas-aufrere.webp |
| 04 | Fyconic | 2025 | React · GSAP · WebGL-lite | /projetSlider/fyconic-projet-lucas-aufrere.webp |
| 05 | Poivre Blanc | 2025 | Next.js · GSAP | /projetSlider/poivreblanc/poivre-blanc.webp |
| 06 | BonBon Sauvage | 2024 | WordPress · Elementor · GSAP | /projetSlider/bonbonsauvage/bonbon-hero-1.webp |

ベース URL: `https://www.lucas-aufrere.com`（CORS 制限あり → 既知の改善点参照）

### アニメーション（per-frame）
（出典: 05pz9j49slg7c.js useFrame）

```
// 慣性
velocity *= pow(0.9, 60 * dt)
rotation += velocity

// スナップ補間
rotation += 0.14 * (target - rotation)
```

### フォーカス時カメラドリー
（出典: 05pz9j49slg7c.js camera focus dolly）

```
ease = clamp((focusProgress - 0.3) / 0.7, 0, 1)
t    = ease * ease
camera.position.z = -15 * t
camera.rotation.y = 0.18 * t
```

### インタラクション
（出典: 05pz9j49slg7c.js event handlers）

| イベント | 動作 |
|---------|------|
| wheel | velocity -= 2e-4 * deltaY |
| ArrowLeft | target -= π/3 |
| ArrowRight | target += π/3 |
| pointermove (drag) | rot -= 0.002 * dx（水平回転） |
| pointermove (drag) | dragY = clamp(dragY + 0.0015 * dy, -π/9, +π/9) |

hD = Math.PI/9（出典: 05pz9j49slg7c.js hD 定数）= 垂直ドラッグのクランプ上限。

### RotondeCanvas コンテナ CSS
（出典: 15dmpvvfnvsgk.css .RotondeCanvas-module-scss-module__zZrEOW__root）

```css
background-color: #050505;
width: 100%; height: 100dvh;
position: relative; overflow: hidden;
/* canvas */
touch-action: none; cursor: grab;
width: 100%; height: 100%; display: block;
/* canvas[data-dragging=true] */
cursor: grabbing;
```

---

## 既知の改善点

* **画像 CORS**: `lucas-aufrere.com` の /projetSlider/ 画像は CORS 制限により standalone demo で読込めない場合がある。同一オリジン配信または proxy が必要。
* **hD 下流用途**: dragY（hD クランプ済み）の具体的な visual 反映先はソース解析で確定できなかった。実装ではカメラ Y オフセット（camera.position.y = -dragY * 1.5）として近似している。
* **RotondeOverlay**: フォーカス時に表示されるプロジェクト詳細オーバーレイ（.RotondeOverlay-module）は standalone に未実装。
