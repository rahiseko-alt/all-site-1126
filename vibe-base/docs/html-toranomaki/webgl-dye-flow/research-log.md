# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-10] webgl-dye-flow 調査（Claude Code / renai-game セッション）

### 調査経緯
原典 `docs/ops/webgl-fluid-knowhow.md`（PavelDoGreat/WebGL-Fluid-Simulation のクローン＋有機的アイドル自動巡回ノウハウ）を読み、外部依存ゼロの自己完結単一 HTML として再現した。サーバー不要・file:// 直接開放でも動作することを前提条件とした。

### 採用した流体ソルバ
Navier-Stokes 系の GPU 実装を採用。パイプラインは以下の順で実行される。

1. advection — 速度場・染料場を自己移流
2. curl 計算
3. vorticity confinement — 渦を強調
4. divergence 計算
5. pressure Jacobi 反復（20 回）— 非圧縮性を強制
6. gradient subtract — 速度場から圧力勾配を除去
7. advect dye — 染料を最終速度場で移流

テクスチャ精度は WebGL2 優先（`OES_texture_float` + `LINEAR` フィルタ）、WebGL2 非対応環境では WebGL1 + 半精度 float フォールバックへ自動切替する。

### 自動巡回アルゴリズムの要点
- **軌跡生成**: 独立した複数のサイン／コサイン波を合成してカオス的な巡回軌跡を生成。単一周波数の機械的ループを意図的に排除。
- **splat 強度**: 前フレームとの差分（移動速度）に ×8.0 を乗じて splat 半径・強度を決定。停止時は splat しない。
- **色相**: HSV モデルで毎フレーム +0.15° ずつ色相を回転させ、虹色グラデーションを自動生成。
- **ユーザー操作との切替**: 最後のポインタ操作から 3 秒間アイドルを検知したら自動巡回を再開。操作中は即時停止。手動と自動のシームレス切替を実現。

### 検証手法
- **Playwright（SwiftShader／ヘッドレス）**: console error 0、gl コンテキスト正常取得、canvas 中央ピクセルのサンプリングで非黒ピクセルが存在することを確認して実描画を判定。
- **虎の巻 blindtest（headed + GPU）**: `headless: false` + `--enable-gpu` + `--use-gl=angle` で起動。canvas 全ピクセルの黒ピクセル率 ≤ 95% を PASS 条件とする。

### 落とし穴
- headless モードは WebGL を描画しないため、実描画確認は headed + GPU 必須（SwiftShader は描画しない）。
- `type="module"` や外部 JS 読み込みを使うと `file://` プロトコルで CORS エラーになる。全スクリプトを単一 `<script>` タグにインライン化することで file:// 直開きでも動作する。
- 半精度 float FBO の `LINEAR` フィルタリングは `OES_texture_half_float_linear` 拡張が必要。拡張が取得できない環境では `NEAREST` フィルタに切り替えて継続する分岐が必須。
