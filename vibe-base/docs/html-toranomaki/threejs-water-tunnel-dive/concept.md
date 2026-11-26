# concept.md — 3Dスクロール水流トンネル潜行 概念層

## 3つのコア技術

（出典: agent-ag/dive-test-run/main.js 「3D CatmullRom Path」節、および「Animation Loop」節）

### 1. 3D曲線パスに沿った円筒トンネル生成とカメラナビゲーション
**技術名**: `THREE.CatmullRomCurve3` / `THREE.TubeGeometry` / `THREE.PerspectiveCamera`
**素人向け解説**: 3次元空間に曲がりくねった見えないレール（曲線パス）を敷き、そのレールに沿って円筒形の水のチューブを自動生成します。カメラもスクロール進捗と連動してそのレール上を前進・下降し、カメラの注視点を常に少し先に向けることで、うねるトンネルの中を本当に滑走しているようなシネマティックなカメラワークを実現します。

### 2. スクロール速度連動型の視野角（FOV）伸縮とカメラシェイク効果
**技術名**: `Lenis.on('scroll')` / `THREE.MathUtils.lerp` / `camera.fov` / `camera.rotation`
**素人向け解説**: スクロールする「瞬間の速さ」を監視し、早くスクロールするほどカメラの視野角をラッパ状に押し広げ、スターウォーズのワープシーンのような高速なスピード感を演出します。さらに、速度が一定値を超えるとカメラの角度を微細にノイズ振動させ、水中を突き進む際の水圧やスピードによる振動を臨場感たっぷりに再現します。

### 3. Simplex Noise によるパーティクルの流体乱流（うねり）エフェクト
**技術名**: `simplex-noise` / `createNoise4D`
**素人向け解説**: トンネル内を流れる無数の光の泡（パーティクル）に、数学的なノイズ関数を用いて微小な揺らぎを与えます。泡が機械的にまっすぐ進むのではなく、実際の水流や大気の流れに巻き込まれてゆらゆらとうねりながら流れるため、空間の密度感と有機的なリアルさが劇的に高まります。

---

## アーキテクチャ概要

ThreeJS-Wormhole: Three.js (r173) + GSAP (3.12.5) + Lenis (1.1.18) + Simplex-Noise (4.0.3)
CDN: esm.sh (https://esm.sh/)
Entry: js/app.js | Style: css/style.css
Main class: THREE.WebGLRenderer, THREE.PerspectiveCamera, THREE.Scene, THREE.TubeGeometry, THREE.Points
（出典: agent-ag/dive-test-run/main.js L1〜L65）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| Scene0 (Intro) | 背景色 / フォグ | #020608 / FogExp2 密度 0.018 |
| Scene0 (Intro) | カメラ初期位置 | (0, 0, 15) |
| Scene0 (Intro) | 案内テキスト | 「SPATIAL DIVE」 フェードイン状態で待機 |
| Scene1 (Descent) | トンネル水流移動速度 | 通常時 flowSpeed: 0.004 -> 急降下時最大 flowSpeed: 0.08 |
| Scene1 (Descent) | 泡の移動速度 | 通常時 particleSpeed: 0.002 -> 急降下時最大 particleSpeed: 0.015 |
| Scene1 (Descent) | 案内テキスト | 「THE DESCENT」 急降下開始時にフェードイン |
| Scene2 (Essence) | パーティクル乱流 | Simplex-Noise スケール 0.08 / 時間スケール 0.6 / 振幅強度 0.25 |
| Scene2 (Essence) | 案内テキスト | 「FLOATING ESSENCE」 浮遊シーンでフェードイン |
| Scene3 (Core) | カメラ終点 | パスの終端付近 (0, -45, -72) にアプローチ |
| Scene3 (Core) | 案内テキスト | 「THE CORE」 終点アプローチでフェードイン |

アニメーション:
- レンダーループ `animate` 内で、スクロール進捗（0.0〜1.0）に応じたパス上の3D座標にカメラを配置。
- `lookAt` をパスの `t + 0.012` に向けて自動カーブ。
- 水流テクスチャの `offset.y` を `flowSpeed` でマイナス方向にスライド。
- パーティクル座標配列に対して `noise4D` を適用し、元の配列値を書き換えてうねりを適用。
- `scrollVelocity` が 1.0 を超えたら `Math.sin(time)` に基づくカメラシェイクを加算。
（出典: agent-ag/dive-test-run/main.js L397〜L469）

---

## 初期失敗パターン

（出典: agent-ag/dive-test-run/main.js L447〜L459 [旧実装コードの optimized 経緯]）

*   **毎フレームのVector3オブジェクトアロケーションによるGC詰まり**:
    *   当初、数千個のパーティクルの座標をノイズ変形させて更新する際、ループ内で `new THREE.Vector3()` を毎回新規生成していたため、ブラウザのガベージコレクション（GC）が頻発してフレームレートが 15fps 以下に激しく低下した。
    *   **対策**: ループの外側で再利用可能な一時変数 `tempTangent`, `tempNormal`, `tempBinormal` 等を1回だけインスタンス化しておき、ループ内ではオブジェクト生成を行わず、数値の配列直接代入（Float32Array）のみを行うことで、60fps の滑らかな動作を確保した。

---

## 既知の改善点

*   **グラデーションフォグの表現強化**: 深度に応じたフォグカラーを単一色（暗闇）だけでなく、ポイントライトのネオン色（青、紫、ピンク）の減衰と同期させ、奥側がカラフルに光りながら暗闇に溶け込む演出の調整。
