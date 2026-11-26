# concept.md — 3D CSS Solar System 概念層

## 4つのコア技術

（出典: css/styles.css「animations」「speed」節、index.html ツリー構造）

### 1. 入れ子 transform による 3D 公転軌道
**技術名**: CSS 3D Transforms（`transform-style: preserve-3d` + `@keyframes orbit`）
**素人向け解説**: 各惑星は「軌道(`.orbit`)」という円の中に入れ子で置かれ、軌道そのものを Z 軸でぐるぐる回す。`preserve-3d` を親から子へ連鎖させることで、平面の円が傾いて立体の楕円軌道に見える。JS で位置計算せず、回転アニメ 1 本で公転を表現する。

```css
.orbit { transform-style: preserve-3d; animation-name: orbit; animation-iteration-count: infinite; animation-timing-function: linear; }
@keyframes orbit { 0% { transform: rotateZ(0deg); } 100% { transform: rotateZ(-360deg); } }
```
（出典: css/styles.css L66–L75 `.orbit` / L177–L182 `@keyframes orbit`）

### 2. 逆回転で惑星の向きを固定する invert アニメ
**技術名**: カウンター回転（`@keyframes invert`）
**素人向け解説**: 軌道が回ると、その中の惑星も一緒に回ってしまい影や模様が回転して見えてしまう。`.pos` 要素に軌道と逆向きの回転をかけ、惑星本体の向きを常に一定に保つ。これで影グラデーション（昼夜境界）が破綻しない。

```css
.pos { transform-style: preserve-3d; animation-name: invert; animation-iteration-count: infinite; animation-timing-function: linear; }
@keyframes invert { 0% { transform: rotateX(-90deg) rotateY(360deg) rotateZ(0deg); } 100% { transform: rotateX(-90deg) rotateY(0deg) rotateZ(0deg); } }
```
（出典: css/styles.css L80–L90 `.pos` / L191–L196 `@keyframes invert`）

### 3. inset box-shadow による昼夜の陰影
**技術名**: アニメーション付き `inset box-shadow`（`@keyframes shadow-{planet}`）
**素人向け解説**: 惑星の球体感は、内側に落とす影（`inset box-shadow`）を公転位置に合わせて動かして表現する。影が上→左→下→右と一周することで、太陽光が当たる面と影の面（昼と夜）が回って見える。テクスチャは inline base64 PNG で外部画像を使わない。

```css
#mercury .planet { animation-name: shadow-mercury; }
@keyframes shadow-mercury {
  0% { box-shadow: inset 0 0 1px rgba(0,0,0,0.5); }   /* TOP */
  50% { box-shadow: inset 13px -5px 4px rgba(0,0,0,0.5); }  /* BOTTOM */
  100% { box-shadow: inset 0 0 1px rgba(0,0,0,0.5); } }
```
（出典: css/styles.css L734–L760 `#mercury .planet` / `@keyframes shadow-mercury`、L1397–L1427 inline base64 テクスチャ）

### 4. body/universe クラス切替による状態機械（jQuery）
**技術名**: jQuery 1.8.1 によるクラストグル（外部依存は jQuery + prefixfree のみ）
**素人向け解説**: 2D/3D 切替、ズーム、表示スケール（速度/サイズ/距離）はすべて body・#universe・#solar-system へのクラス付け替えだけで切り替える。JS はクラスを足し引きするだけで、見た目の変化は全部 CSS が担う。起動時に `opening`→`view-3D` へ遷移し 2 秒後に UI を出すオープニング演出を行う。

```js
$(window).load(function(){
  var body = $("body");
  var init = function() { body.removeClass('view-2D opening').addClass("view-3D").delay(2000).queue(function(){ $(this).removeClass('hide-UI').addClass("set-speed"); $(this).dequeue(); }); };
  $("#data a").click(function(e){ var ref=$(this).attr("class"); $("#solar-system").removeClass().addClass(ref); e.preventDefault(); });
  init();
});
```
（出典: js/scripts.js L1–L42）

---

## アーキテクチャ概要

3D CSS Solar System: 素CSS（3D Transform / keyframes）＋ jQuery 1.8.1
CDN:
- jQuery 1.8.1 — `https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js`
- prefixfree 1.0.7 — `https://cdnjs.cloudflare.com/ajax/libs/prefixfree/1.0.7/prefixfree.min.js`
- Google Fonts Open Sans — CSS 内 `@import url(http://fonts.googleapis.com/css?family=Open+Sans:400,300)`
Entry: index.html | Style: css/styles.css | JS: js/scripts.js
DOM 階層: `#universe > #galaxy > #solar-system > #{planet}.orbit > .pos > .planet`（土星は `.planet > .ring`、地球は入れ子 `.orbit > .pos > .moon`）
状態クラス（body）: `view-2D`/`view-3D`・`zoom-large`/`zoom-close`・`hide-UI`・`opening`・`data-open/close`・`controls-open/close`・`set-speed`
スケールクラス（#universe）: `scale-stretched`（速度表示・既定）/ `scale-s`（実サイズ比）/ `scale-d`（実距離比）
（出典: index.html L12–L150、css/styles.css L44–L101、L316–L461）

ライセンス: Copyright (c) 2012 Julian Garnier, MIT License（出典: css/styles.css L2–L5）

---

## シーン設計

| 要素 | 設定値 |
|------|--------|
| body 背景色 | `#08090A`（背景に星空 base64 PNG タイル） |
| 太陽 #sun 色 | `#FB7209`・glow `box-shadow: 0 0 60px rgba(255,160,60,0.4)` |
| 太陽サイズ（stretched） | `font-size: 24em` |
| 軌道線 | `border: 1px solid rgba(255,255,255,0.2)` 円 |
| 惑星既定色 | `#202020`（テクスチャ base64 で上書き） |
| 地球の月 | `background-color: white`・`font-size: 1.2em` |
| 土星リング | `border: 0.3em solid rgba(160,147,130,0.7)`＋外周 `0.07em solid rgba(160,147,130,0.5)` |
| 影グラデ | `inset box-shadow rgba(0,0,0,0.5)`（昼夜境界） |

軌道半径（scale-stretched, em） / 公転周期（animation-duration）/ 惑星サイズ（font-size em）:

| 惑星 | 軌道直径 | 公転周期(s) | サイズ(em) |
|------|---------|-------------|-----------|
| Mercury | 32em | 2.89016 | 1.5 |
| Venus | 40em | 7.38237 | 3.72 |
| Earth | 56em | 12.00021 | 3.92 |
| Earth(月軌道) | 6em | 0.89764 | 1.2 |
| Mars | 72em | 22.57017 | 2.9 |
| Jupiter | 100em | 142.35138 | 12 |
| Saturn | 150em | 353.36998 | 10.8 |
| Uranus | 186em | 1008.20215 | 4.68 |
| Neptune | 210em | 1977.49584 | 4.9 |

base font-size: `body { font-size: 10px }`（em の基準）。
（出典: css/styles.css L38–L42、L319–L394、L464–L516）

アニメーション:
- 公転 = `.orbit` の `@keyframes orbit`（rotateZ 0→-360deg）を惑星ごとの `animation-duration` で回す。
- 自転向き固定 = `.pos` の `@keyframes invert`（rotateX(-90deg) で軌道面に倒し rotateY 360→0deg）。
- 昼夜陰影 = `.planet` の `@keyframes shadow-{planet}`（inset box-shadow を TOP→LEFT→BOTTOM→RIGHT と一周）。
- 起動演出 = JS `init()` が body を `opening view-2D` → `view-3D` に変え、2 秒後 `hide-UI` 除去＋`set-speed` 付与で UI 出現。
- timing-function は全て `linear`・`animation-iteration-count: infinite`。
（出典: css/styles.css L66–L196、L737–L760、js/scripts.js L7–L12）

---

## 初期失敗パターン（省略可）

（出典: css/styles.css L80–L90 `.pos` `invert` / L191–L196）

軌道(`.orbit`)を回すと内側の惑星も同方向に回ってしまい、影（昼夜境界）が一緒に回って球体に見えなくなる。`.pos` に軌道と打ち消す `invert` 回転を入れ、惑星本体の向きを公転中も一定に保つことで解決した。`preserve-3d` を親から子まで途切れず連鎖させないと立体が潰れて平面に戻る点も注意。

---

## 既知の改善点

- **CDN 依存**: jQuery 1.8.1（2012 年）と prefixfree は古く、prefixfree は現代ブラウザでは不要。vanilla JS のクラストグルへ置換可能。
- **`@import` の HTTP**: フォント `@import` が `http://`（非 https）。混在コンテンツ警告の恐れがあるため `https://` 化が望ましい。
- **a11y**: 軌道・スケール切替が見た目のみで、スクリーンリーダー向けの状態通知がない。
- **モバイル**: `font-size: 10px` 基準の em レイアウトのため、小画面では木星・海王星軌道が画面外へ出る。
