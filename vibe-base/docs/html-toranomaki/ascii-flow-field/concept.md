# concept.md — ascii-flow-field 概念層

写真や 3D モデルではなく、**手続き生成した流体ノイズ場**を three.js の `AsciiEffect` で ASCII 文字に変換した全画面背景。白地に暗い ASCII 構造がゆっくり流れ、前景にブランドコピーを重ねる。具象（顔・写真）は不気味の谷に落ちるため、抽象的な生成パターンを被写体に選ぶのが要点。

## 3 つのコア技術

（出典: impl-threejs-r158/js/app.js「shader / AsciiEffect / render loop」節）

### 1. AsciiEffect（ASCII 変換）
**技術名**: `three/addons/effects/AsciiEffect.js`（three.js 公式 example・MIT）
**素人向け解説**: 3D の描画結果を読み取り、明るさに応じて ` .:-=+*1#%@0$!*` の文字へ置き換えて DOM テキスト層を作る。明るい所は空白、暗い所は濃い文字になる。WebGL canvas 自体は隠れ、画面に見えるのは文字でできた層。

### 2. domain-warped fbm（流体ノイズ生成）
**技術名**: 自作 GLSL フラグメントシェーダ（value noise → fbm → 二段ドメインワープ）
**素人向け解説**: ランダムな濃淡（ノイズ）を複数スケールで重ねて雲のような模様（fbm）を作り、その座標自体を別のノイズで歪める（ドメインワープ）。これを時間で動かすと、有機的に「流れる」模様になる。外部ライブラリ不要。

### 3. フルスクリーンクワッド + 描画間引き
**技術名**: `THREE.OrthographicCamera(-1,1,1,-1,0,1)` + `PlaneGeometry(2,2)` + fps cap ループ
**素人向け解説**: 画面いっぱいの平面 1 枚にシェーダを描くだけの構成。AsciiEffect は毎フレーム大量の DOM 文字を作り直して重いので、見た目の動きは実時間で進めつつ DOM 更新だけを上限 fps（既定 30）に間引いて軽くする。

---

## アーキテクチャ概要

構成: three.js 0.158.0（ESM・importmap）
CDN: `https://unpkg.com/three@0.158.0/build/three.module.js` + `https://unpkg.com/three@0.158.0/examples/jsm/`
Entry: index.html（importmap + `<script type="module" src="js/app.js">`） | Style: css/style.css
Main: `AsciiEffect`（変換）/ `ShaderMaterial`（ノイズ生成）
（出典: impl-threejs-r158/index.html L8〜L16・impl-threejs-r158/js/app.js L1〜L4）

描画パイプライン:
1. `ShaderMaterial` を貼った全画面平面を WebGL に描画（輝度場を生成）
2. `AsciiEffect.render(scene, camera)` がその輝度を ASCII 文字へ変換し `#ascii-stage` 直下に DOM 層を生成
3. CSS で DOM 層を `position:fixed; inset:0; z-index:0`（最背面）に固定、前景 `.fg` を `z-index:2` で重ねる
（出典: impl-threejs-r158/js/app.js L74〜L83・impl-threejs-r158/css/style.css L6〜L13）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| 背景 | 背景色 | `#ffffff`（白地） |
| 背景 | 文字色 | `#ADADAD`（グレー） |
| 背景 | 文字セット | `' .:-=+*1#%@0$!*'`（明→暗・15 階調） |
| 背景 | AsciiEffect resolution | `0.18`（グリッド密度） |
| 背景 | invert | `false` |
| 背景 | ノイズ速さ u_speed | `0.35` |
| 背景 | うねり u_scale | `2.6` |
| 背景 | コントラスト u_contrast | `1.4` |
| 背景 | 密度 u_density | `0.55` |
| 背景 | 構図マスク | `smoothstep(0.12, 0.62, vUv.x)`（左クリア・右へ構造） |
| 前景 | 左上ラベル | `■ kouhei kosehira`（14px） |
| 前景 | 左下見出し | `ai developer. / systems that think.`（clamp 28〜88px） |

アニメーション: `u_time` を実時間（dt）で加算し、シェーダ内で二段ドメインワープの座標オフセットに使う（`t = u_time * u_speed`）。これによりノイズ場が連続的に流れる。DOM 更新は `capFps = 30` のアキュムレータで間引く。
（出典: impl-threejs-r158/js/app.js L55〜L66・L92〜L101）

構図の要点: 前景テキストが画面左に置かれるため、シェーダ末尾の `mask = smoothstep(0.12, 0.62, vUv.x)` で左 12〜62% を徐々にクリアにし、構造を右側へ寄せて可読性を確保する。
（出典: impl-threejs-r158/js/app.js L68〜L70）

---

## 初期失敗パターン

（出典: impl-threejs-r158/js/app.js L6〜L16・L92〜L101）

* **被写体に写真（顔）を使う** → ASCII のダウンサンプリングで写実が崩れ「不気味の谷」になる。被写体は抽象的な生成パターンまたは抽象 3D 形状を選ぶ。
* **毎フレーム AsciiEffect.render** → 解像度 0.18 / 1440×900 で毎フレーム約 2 万字の DOM を再構築し fps が激落ちする。動きは実時間で進めつつ DOM 更新を fps 上限で間引く。
* **`type="module"` を file:// で開く** → ESM import と CORS で失敗。必ずローカル HTTP サーバ経由で開く。

---

## 既知の改善点

* **構図マスクの固定**: 現状は左クリアの横方向マスク 1 種を baked。中央集約・縁取り等を切替可能にするとレイアウト適応性が上がる。
* **モバイル**: 縦長画面では `u_scale` を上げないと模様が粗くなる。アスペクト連動の scale 補正が望ましい。
* **色対応**: 現状は輝度のみ（グレー単色）。`@scii` 等のカラー対応 ASCII でブランドカラーを乗せる拡張余地。
* **prefers-reduced-motion**: モーション抑制設定時はアニメーションを停止する配慮を追加する。
