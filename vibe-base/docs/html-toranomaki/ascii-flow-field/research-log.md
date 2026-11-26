# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-26] ascii-flow-field 調査（Claude / homepage session）

### 元ネタの特定手法（Playwright によるライブ解析）
参考サイト maximiliankaspar.com は WebFetch が 403 を返したため、Playwright（headless・swiftshader）で実描画して DOM/script を直接抽出した。判明事項:
- 背景は `position:fixed` の WebGL2 canvas（rect 0×0＝非表示）。実体は別途生成される ASCII の DOM テキスト層。
- ロード script: gsap 3.15 / Lenis / barba（ページ遷移・スクロール用）と、背景専用の `maximiliankaspar.github.io/ascii-animation/ascii-parcel-project.js`。
- 背景アニメは上記サイト本体ではなく独立リポジトリ由来。

### 手法の確定（GitHub ソース解析）
`maximiliankaspar/ascii-animation` の package.json と src/main.js を確認:
- 依存は `three ^0.158.0` + `parcel`（ASCII 専用ライブラリは不使用）。
- パイプライン: STLLoader で .stl を読み込み → `MeshNormalMaterial` → `THREE.AsciiEffect`（公式 example）で ASCII 化 → Z 軸 0.001 rad/frame 回転。
- 文字セット `' .:-=+*1#%@0$!*'`、`invert:false`、文字色 `#ADADAD` / 白背景。
- すなわち中核は MIT の three.js 公式 example（AsciiEffect / STLLoader）。固有資産は本人の .stl のみ。

### 本テーマの設計判断（被写体の差し替え）
- 写真（顔）を AsciiEffect に通すと写実が崩れ不気味の谷に落ちる（実機検証で確認・棄却）。
- 元サイトが成立する理由は被写体が抽象 3D 彫刻だから。→ 被写体を「手続き生成の流体ノイズ場」に置換。
- AsciiEffect 変換エンジンは元サイトと同一（文字セット・グレー/白）に保ち、輝度供給源だけを自作 GLSL（value noise → fbm → 二段ドメインワープ）に差し替えた。3D アセット調達ゼロ・完全手続き生成。

### パフォーマンス知見
- AsciiEffect は CPU/DOM 律速（毎フレーム DOM テキスト再構築）。GPU ではなく DOM 更新が支配的。
- 対策: 見た目の動きは実時間 dt で進め、DOM 更新（effect.render）だけを fps 上限（既定 30）で間引くアキュムレータ方式。
- headless swiftshader での fps 値は実機を代表しないため、fps 判定は実機ブラウザで行うこと。

### 検証手段
- Playwright で HTTP 配信ページを開き pageerror 0 件 / AsciiEffect の DOM テキスト層生成 / 1.2 秒で約 20% の文字が変化（＝流れている）ことを確認。
