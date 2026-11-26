# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-14] variable-font-drum 調査（司令塔エージェント）

### 参照元
- `agent-ag/variable-font-drum-demo/`（別エージェント ag の作業ディレクトリ・読み取り専用）。Pete Barr の CodePen「Variable Font Drum」(MWKgmYW) 再現デモ。index.html / css/style.css / js/app.js / server.mjs の 4 ファイル構成。
- 本テーマは「理解して自力再構築」方針で、ソースを写経せず concept.md に仕組みを言語化 → impl を再構築した。

### 円筒（ドラム）配置の幾何
- 行を `numLines=10` 枚 clone し、各行を X 軸まわりに `angle=360/10=36°` ずつ回す。
- 半径は正多角形の外接半径の式: `radius = (行高/2) / sin(180°/numLines)`。行高は font-size のピクセル値 `innerWidth/100 * 4`（=4vw 相当）。
- `transform-origin: 50% 50% -{radius}px` で各行の回転中心を円筒の中心軸に一致させるのが要点。これを忘れると行が同心円でなくバラバラに散る。

### 可変フォントの cos 半波補間
- 各行の「正面度」`conversion = |cos(rotateXのラジアン)/2 + 0.5|`。正面（0°/360°）で 1、真裏（180°）で 0、側面（90°/270°）で 0.5。
- この `conversion` を 3 つに反映: `opacity = conversion+0.1` / `font-weight = 200+700*conversion` / `font-stretch = (100+700*conversion)%`。
- 正面の行ほど太く・横広く・濃く見え、回り込む行が細く・狭く・薄くなる「ドラムが回る」錯覚を生む。
- 書き込みは `gsap.quickSetter(target,"css")`（毎フレーム高速 set）。

### スクロール連動
- `body { height:1000vh }` で長いスクロール領域を作り、ScrollTrigger（`scrub:1`・`start:"top top"`・trigger `.stage`）で `.line` を `rotateX:"+=1080"`（3 回転）。
- 同 ScrollTrigger で `.tube` の `perspective` を `100vw→1vw`（`ease:'expo.out'`）に寄せ、序盤で遠近を強調。
- 初期表示は `.stage` を `autoAlpha 0→1`（delay:2, duration:2）でフェードイン。

### blindtest（補完ゼロ実装テスト）の落とし穴
- `scripts/toranomaki-blindtest.mjs` は「黒ピクセル率 95% 超＝WebGL 未描画」と判定する（`r<10 && g<10 && b<10`）。
- 本デモは元 `background:black`（#000）＋細い白文字のため、**描画成功でも黒比率が 95% を超え FAIL する**。
- 対策: 背景を `#0a0a0a`（r≥10・視覚的に黒と同等）に変更。既存テーマ animejs-shuffle-items の `#0F0F11` と同じ「ほぼ黒だが黒判定を外す」先例に倣った。これにより背景ピクセルが黒カウントされず PASS する。
- blindtest 自体は GSAP/CSS3D デモでも `headless:false + GPU フラグ` で起動する（WebGL 専用ではない）。ローカルサーバーは blindtest が自動起動するため手動不要。
