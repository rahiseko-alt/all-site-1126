# concept.md — 染料の流れ（WebGL流体自動巡回）概念層

## 8 つのコア技術

（出典: webgl-dye-flow.html 全体・webgl-fluid-knowhow.md 各節）

### 1. WebGL流体ソルバ（advection）
**技術名**: advectionShader（GLSL）
**素人向け解説**: 流体の「染料（色）」と「速度」を、前フレームの流れに乗せて次の位置へ運ぶ処理。川の水が下流へ流れていくイメージ。dissipation（減衰率）を掛けることで時間とともに薄れていく。
（出典: webgl-dye-flow.html L141〜L143）

### 2. 発散計算（divergence）
**技術名**: divergenceShader（GLSL）
**素人向け解説**: 流体が「湧き出している」か「吸い込まれている」かを各点で計算する。非圧縮流体では発散がゼロになるよう強制するための前処理。
（出典: webgl-dye-flow.html L145〜L149）

### 3. 渦度強調（vorticity / curl）
**技術名**: curlShader + vorticityShader（GLSL）
**素人向け解説**: 流体の「ぐるぐる回る力（渦）」を計算し、その渦をさらに強める方向に力を加える。これがないと渦がすぐに消えてのっぺりした流れになる。CURL=30 という数値が強さを決める。
（出典: webgl-dye-flow.html L151〜L160）

### 4. 圧力 Jacobi 反復（pressure Jacobi）
**技術名**: pressureShader（GLSL）× 20回ループ
**素人向け解説**: 流体に圧力差をなくす「ならし計算」を20回繰り返す。回数が多いほど物理的に正確な動きになるが負荷も増す。PRESSURE_ITERATIONS=20 が設定値。
（出典: webgl-dye-flow.html L162〜L165、L362〜L365）

### 5. 勾配減算（gradient subtract）
**技術名**: gradientSubtractShader（GLSL）
**素人向け解説**: 圧力から速度場を補正し「水が圧縮されない」状態に戻す最終工程。流体物理の非圧縮条件を保つ要。
（出典: webgl-dye-flow.html L167〜L170）

### 6. 多重サイン波 AutoPointer
**技術名**: AutoPointer クラス（JavaScript）
**素人向け解説**: 3種類の異なる周波数のサイン・コサイン波を足し合わせて自動ポインタの軌跡を作る。周波数の比率が整数比にならないため、二度と同じ軌跡を通らないカオス的な動きが生まれる。5個のポインタが同時に独立して動く。
（出典: webgl-dye-flow.html L265〜L284・webgl-fluid-knowhow.md「① 多重サイン・コサイン波合成」節）

### 7. 速度比例 splat（前フレーム差分×慣性係数）
**技術名**: splat 関数（JavaScript + splatShader GLSL）
**素人向け解説**: AutoPointer の現在位置と1フレーム前の位置の差を「移動速度」として流体に伝える。8.0 という慣性係数を掛けることで、速く動くほど大きな渦が生まれる物理的に自然な力加減になる。
（出典: webgl-dye-flow.html L319〜L330、L404・webgl-fluid-knowhow.md「② 速度に比例した自然な流体力」節）

### 8. HSV色相回転 + 3秒アイドル判定
**技術名**: HSVtoRGB 関数 + lastInputTime 判定（JavaScript）
**素人向け解説**: 各 AutoPointer が自分の色相（hue）を毎フレーム +0.15° ずつ回転させることで、色が赤→黄→緑→青→紫と連続変化する。ユーザー操作から3000ミリ秒（IDLE_MS）経過すると自動巡回モードに切り替わり、操作再開で即座に手動モードに戻る。
（出典: webgl-dye-flow.html L250〜L262、L279、L396〜L413・webgl-fluid-knowhow.md「§4 シームレスな移行と入力検知」節）

---

## アーキテクチャ概要

**技術スタック**: WebGL2 優先・WebGL1（experimental-webgl）フォールバック・半精度 float（HALF_FLOAT / HALF_FLOAT_OES）
（出典: webgl-dye-flow.html L48〜L73）

**CDN**: なし＝外部依存ゼロ（dat.GUI・Google Analytics・ソーシャルボタンをすべて排除した自己完結実装）
（出典: webgl-fluid-knowhow.md「② プロモーション・トラッキングコードの排除」節）

**ファイル構成**:

| 役割 | ファイル |
|------|---------|
| Entry / Style / Main | 単一 index.html にすべて内包 |
| CSS | `<style>` タグ内（L7〜L14） |
| JavaScript | `<script>` タグ内（L20〜L437） |

**主要関数/クラス**:

| 名前 | 役割 |
|------|------|
| `getWebGLContext` | WebGL2→WebGL1 フォールバック・拡張取得 |
| `Program` | シェーダーリンク・uniform マップ生成 |
| `createDoubleFBO` | ping-pong ダブルバッファ生成 |
| `step` | 毎フレームの流体物理演算（curl→vorticity→divergence→pressure→gradient subtract→advect） |
| `splat` | 指定座標に速度+染料を注入 |
| `applyInputs` | アイドル判定・AutoPointer/ユーザー入力を splat に振り分け |
| `AutoPointer` | 多重サイン波軌跡・HSV色相回転を保持する自動ポインタ |

（出典: webgl-dye-flow.html L48、L116、L219、L333、L319、L395、L265）

---

## シーン設計

| 要素 | 設定値 |
|------|--------|
| 背景色 | #000（黒・CSS L9） |
| SIM_RESOLUTION | 128（速度場のシミュ解像度） |
| DYE_RESOLUTION | 1024（染料テクスチャ解像度） |
| DENSITY_DISSIPATION | 1.0（染料の減衰率・小さいほど長く残る） |
| VELOCITY_DISSIPATION | 0.2（速度の減衰率・大きいほど早く止まる） |
| PRESSURE | 0.8（圧力クリア係数） |
| PRESSURE_ITERATIONS | 20（Jacobi反復回数） |
| CURL | 30（渦度強調の強さ） |
| SPLAT_RADIUS | 0.25（splat の影響半径） |
| IDLE_MS | 3000（ms）アイドル判定閾値 |
| AUTO_POINTERS | 5（同時駆動する AutoPointer 数） |
| 慣性係数 | 8.0（AutoPointer の dx/dy に乗算） |
| HSV 色相回転速度 | 毎フレーム +0.15°（AutoPointer.update 内） |

（出典: webgl-dye-flow.html L34〜L45、L279、L404）

**アニメーション**: アイドル時は5本の AutoPointer が多重サイン波軌跡（xOffset = sin×0.35 + sin×0.1 + cos×0.05、yOffset = cos×0.35 + cos×0.1 + sin×0.05）で画面全体を走り、速度差分×8.0 で流体を撹拌しながら HSV 色相を回転させる。ユーザーがマウス/タッチ操作すると即座に手動モードへ移行し、手動時の慣性係数は 6.0。操作終了から3秒後に自動巡回へ復帰。
（出典: webgl-dye-flow.html L269〜L280、L395〜L413）

---

## 初期失敗パターン

（出典: webgl-fluid-knowhow.md「③ 多重サイン・コサイン波合成による『カオス的軌跡』」節・「② 速度に比例した自然な流体力」節）

- **単一サイン波は機械的にチープ**: 1種類のサイン波だと完全に同じ軌跡を繰り返す周期運動になり、人工的で安っぽく見える。3種類の周波数（×1.0 / ×2.3 / ×0.7 など整数比にならない比率）を合成することでカオス化し、二度と同じ軌跡を通らなくなる。

- **速度を与えないと渦が出ない**: AutoPointer の座標だけを splat に渡して dx=0/dy=0 にすると、流体に「力」が加わらず渦が生まれない。前フレーム差分（現在位置 - 前フレーム位置）を速度として渡し、慣性係数 8.0 を乗算することで初めて自然な渦が発生する。

---

## 既知の改善点

- **モバイル負荷対策**: SIM_RESOLUTION と DYE_RESOLUTION をデバイス性能に応じて自動低下させる（例: モバイルで 64/512 に半減）。現状は全デバイス同一設定。
- **prefers-reduced-motion 対応**: `@media (prefers-reduced-motion: reduce)` を検知して AutoPointer を停止し、静止状態にする。現状は未実装。
- **色のロマンティック化**: HSV 彩度 1.0 / 輝度 1.0 の設定はビビッドすぎる。彩度 0.7・輝度 0.8 程度に落とし、パステル調のやわらかい色合いにすることで恋愛演出向きの雰囲気になる。
- **WebGL 非対応フォールバック**: 現状は `hintEl.textContent` でエラーを表示して停止するのみ。CSS アニメーションによる代替背景を用意すると完全なフォールバックになる。
