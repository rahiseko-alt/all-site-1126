# concept.md — Variable Font Drum 概念層

スクロールに連動して、可変フォントの文字列が 3D の円筒（ドラム）状に回転する。正面を向いた行ほど文字が太く・横幅が広く・不透明になり、奥/手前へ回り込む行は細く・狭く・透明に近づく。可変フォントの 2 軸（太さ・横幅）を回転角から連続制御するのが核。

出典の `app.js` / `style.css` / `index.html` は参照元 `agent-ag/variable-font-drum-demo/` のファイルを指す。

## 4 つのコア技術

### 1. 可変フォント（Variable Font）2 軸制御
**技術名**: Bandeins Strange Variable（`font-weight` 軸 200〜800 / `font-stretch` 軸 100%〜800%）
**素人向け解説**: 1 つのフォントファイルの中に「細い〜太い」「狭い〜広い」が連続値で入っていて、CSS から好きな中間値を指定できるフォント。普通のフォントは数段階しか持たないが、可変フォントは無段階。本デモはこの 2 軸を回転角に応じて毎フレーム書き換える。
（出典: style.css L1〜L12 `@font-face`、L9 `font-stretch: 100% 800%`、L10 `font-weight: 200 800`）

### 2. CSS 3D Transform による円筒（ドラム）配置
**技術名**: `transform-style: preserve-3d` + `perspective` + `rotateX` + `translateZ` + `transform-origin`
**素人向け解説**: 同じ文字列を 10 枚コピーし、それぞれを X 軸まわりに 36 度ずつ回した上で、回転軸から半径 `radius` だけ離して並べると、正多角形（=ほぼ円筒）の側面に文字が貼り付いたドラムになる。`transform-origin` を円筒の中心軸（`-radius` 奥）に置くのがミソ。
（出典: app.js L36〜L44 `positionTxt`、style.css L47〜L57 `.tube` / `.tube__inner`）

### 3. GSAP ScrollTrigger スクラブ回転
**技術名**: `gsap.to` + `ScrollTrigger`（`scrub: 1`）
**素人向け解説**: ページを長く（縦 1000vh）作り、スクロール量にドラムの回転を 1:1 で結びつける。`scrub:1` はスクロールに 1 秒の慣性で追従させる設定。スクロールするとドラムが回り、各行が次々と正面に来る。
（出典: app.js L65〜L94 `scrollRotate`、style.css L34 `height: 1000vh`）

### 4. 三角関数による半径算出と cos 半波補間
**技術名**: 正多角形外接半径の公式 + 余弦（cos）半波
**素人向け解説**: 「半径」は `行の高さ ÷ 2 ÷ sin(180°/枚数)` で求める（正多角形を作る幾何）。各行の「正面度」は自分の回転角の cos を 0〜1 に折り返した `|cos(角)/2 + 0.5|` で求め、これを太さ・横幅・透明度に掛ける。正面（角 0°）で 1、真裏（180°）で 0。
（出典: app.js L20 半径式、app.js L49〜L60 `setProps` の `conversion`）

---

## アーキテクチャ概要

アーキテクチャ名: GSAP 3.12.2 + ScrollTrigger（バニラ JS・ビルド不要の単一 HTML）
CDN: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js` と `.../ScrollTrigger.min.js`
フォント CDN: `https://s3-us-west-2.amazonaws.com/s.cdpn.io/61488/BandeinsStrangeVariableGX.ttf`
Entry: `index.html`（`js/app.js` を `<script>` で読込・classic script） | Style: `css/style.css`
Main 処理: `init()`（`clone → set3D → positionTxt → setProps → scrollRotate → stage フェードイン`）
（出典: index.html L21〜L26 script 群、app.js L96〜L107 `init`）

定数:
| 名前 | 値 | 意味 | 出典 |
|------|----|------|------|
| `numLines` | 10 | ドラムを構成する行数（clone 含む） | app.js L11 |
| `--fontSize` | 4 | font-size = `4vw` の係数 | style.css L14 |
| `angle` | 36° | `360 / numLines` 行間の回転角 | app.js L13 |
| `radius` | `(innerWidth/100*4)/2 / sin(18°)` | 円筒半径（px）。`sin(180/numLines deg)` | app.js L18〜L21 |
| `transform-origin` | `50% 50% -{radius}px` | 各行の回転中心を円筒軸へ | app.js L21 |

---

## シーン設計

背景は元デモの純黒 `#000` を **`#0a0a0a`** に変更（視覚的に黒と同等／blindtest の黒ピクセル判定 `r<10` を外すため。既存テーマ animejs-shuffle-items の `#0F0F11` と同方針）。

| シーン | 要素 | 設定値 |
|--------|------|--------|
| 全体 | `body` 背景色 | `#0a0a0a`（元 `#000` から変更） |
| 全体 | `body` 文字色 / 高さ | `#fff` / `height: 1000vh`（スクロール領域） |
| 全体 | font smoothing | `-webkit-font-smoothing: antialiased` |
| ドラム | `.stage` | flex 中央寄せ・`width/height:100%`・初期 `visibility:hidden` |
| ドラム | `.tube` | `position:fixed`・`top:50vh; left:50vw`・`perspective:100vw` |
| ドラム | `.tube__inner` | `position:relative`・`transform-style:preserve-3d` |
| 行 | `.line`（h1） | `position:absolute`・`top/left:50%`・`translate(-50%,-50%)`・`margin:0` |
| 行 | `.line` フォント | family `Bandeins-Strange`・`font-size:calc(4 * 1vw)`・初期 `font-stretch:800%`・`font-weight:800`・`text-transform:uppercase`・`line-height:1`・`transform-style:preserve-3d` |
| 行 | 初期テキスト | `Drum Rolling`（input の初期 value と同一・CSS uppercase で `DRUM ROLLING` 表示） |
| UI | `.controls` 位置 | `position:fixed`・`top:2rem`・`left:50%`・`translateX(-50%)`・`z-index:100` |
| UI | `.controls` ガラス背景 | `radial-gradient(circle at 50% 50%, rgba(255,255,255,.15) 0%, rgba(255,255,255,.05) 100%)` |
| UI | `.controls` blur/枠/角 | `backdrop-filter:blur(16px)`・`border:1px solid rgba(255,255,255,.2)`・`border-top:1px rgba(255,255,255,.4)`・`border-radius:50px`・`padding:.8rem 1.5rem` |
| UI | `.controls` 影（複合） | `0 15px 35px rgba(0,0,0,.5), 0 0 40px rgba(255,255,255,.15), inset 0 0 20px rgba(255,255,255,.1)` |
| UI | `.controls` transition | `all .4s cubic-bezier(.25,.8,.25,1)` |
| UI | `.controls:hover` | 背景・枠を明るく・`translateY(-2px) scale(1.02)`・影を強調 |
| UI | `#text-input` | `background:transparent`・`border:none`・`color:#fff`・`font-size:1.5rem`・`text-align:center`・`width:250px`・`letter-spacing:2px`・`font-weight:300`・`outline:none` |
| UI | `#text-input:focus` | `text-shadow:0 0 15px rgba(255,255,255,.8)` |

（出典: style.css L25〜L128 全セレクタ、index.html L10〜L19）

### 配置ロジック（初期状態）
- 行を `numLines-1`(=9) 個 clone し計 10 行。各行に `line--1`〜`line--10` を付与。
- 各行 `i`（0 始まり）: `rotationX = -36 * i`、`z = radius`、`transformOrigin = "50% 50% -{radius}px"`。
- 半径: `fontSizePx = innerWidth/100*4`、`radius = (fontSizePx/2) / sin(18° in rad)`。`resize` で再計算し再配置。
（出典: app.js L24〜L44、L98〜L102）

### アニメーション
1. **スクロール回転**: ScrollTrigger（trigger `.stage`・`start:"top top"`・`scrub:1`）で全 `.line` を `rotateX:"+=1080"`（3 回転）。`onUpdate` 毎に各行へ `setProps` を適用。
2. **可変フォント連動（setProps）**: 各行の現在 `rotateX`(deg) → `rad` → `conversion = |cos(rad)/2 + 0.5|`。これを使い `opacity = conversion + 0.1`、`fontWeight = 200 + 700*conversion`、`fontStretch = (100 + 700*conversion) + "%"` を `gsap.quickSetter(target,"css")` で書き込む。
3. **遠近の寄り**: 同じ ScrollTrigger で `.tube` の `perspective` を `100vw → 1vw`（`ease:'expo.out'`）。スクロール序盤で一気に近接遠近へ寄る。
4. **登場**: `init` 末尾で `.stage` を `autoAlpha:0 → 1`（`duration:2, delay:2`）でフェードイン。
5. **テキスト更新**: `#text-input` の `input` イベントで全 `.line` の `innerText` を入力値（空なら半角空白）に置換。
（出典: app.js L65〜L94 / L46〜L63 / L106 / L109〜L122）

---

## 初期失敗パターン

- **純黒背景 `#000` は blindtest で FAIL する**: blindtest は「黒ピクセル率 95% 超＝未描画」と判定する（`r<10 && g<10 && b<10`）。黒背景＋細い白文字は描画成功でも黒比率が 95% を超えるため、背景を `#0a0a0a`（r≥10）にして判定を外す。
- **`type="module"` は使わない**: app.js は GSAP をグローバル（`window.gsap`）参照する classic script。`<script src="js/app.js">`（module 属性なし）で読み込む。
（出典: style.css L35 元 `background:black`、index.html L22〜L26）

---

## 既知の改善点

* **`set3D` は font-size を JS で 4vw と二重定義**: CSS の `--fontSize` を `gsap.getProperty(':root','--fontSize')` で読むため、CSS 変数と JS が同期している前提に依存する。
* **フォントが外部 S3 依存**: Bandeins Strange はデモ用 CDN。オフライン/CORS 障害時は無効。恒久利用ならローカル配信に切替。
* **モバイル未最適化**: `font-size:4vw` 固定で、極端な縦長画面では行の重なりが詰まる。
* **`will-change` 未指定**: 多数の 3D 要素を毎フレーム再描画するため、低性能端末では回転がカクつく余地がある。
