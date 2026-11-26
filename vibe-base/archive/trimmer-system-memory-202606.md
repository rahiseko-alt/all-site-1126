# trimmer-system memory archive (2026-06)
> 元 products/trimmer-system/memory.md から移行した P3・P4 コンテンツ
> 作成: 2026-06-10 / コンテキスト改革 Phase C

---

## P3: 失敗事例

### [2026-06-05 Session][severity:H] 描画線・「編集不可」で目先修正連敗→git緊急ロールバック→真因は別所(showPreview)

**該当客観基準**: ②git rollback(`git checkout 903e9322`) + ④マスター差し戻し3件以上(「しね」「殺すぞ」級多数) + ⑥Plan Mode再入

**事象**: UI多発指摘(日付/体重/ガラスバー/戻る/描画)に対し、(1)描画 export を `batchDraw()`(非同期=空書出)で直し線消失→revert→`draw()`同期化でも実機未解決、(2)「編集が全くできない」を headless(動作OK)だけで判断し実機再現せず迷走、を反復。最終的に FB2 を `git checkout` で1個前にロールバック。描画の真因は **export でなく showPreview が is-readonly 切替時に `.bm-single` へ export 画像を流していない**点で、20体×2段調査＋**実再現(exportImage PNG のピンク画素62px)** ＋**本番実データ確認(公開ページ線2147px)** でようやく確定。**export コードは終始正常**(連敗は全て誤診)。

**根本原因**: 実機/実データで再現せず headless と憶測で目先修正を反復(2026-06-04 チカチカと同型再発)。「公開は正常／プレビューだけ異常」の差分を最初に取らなかった。マスターの新指摘ごとに飛びつき、削除ボタン依頼を何度も後回し。

**再発防止**: (a)描画系は最初に**実再現(PNG画素計測)＋本番実データ確認**で破損箇所を客観確定→1点修正 (b)「A正常・B異常」併存は**差分が真因**(プレビュー vs 公開の .bm-single 流し込み差) (c)同一箇所2回外しで即停止しサブ調査へ (d)依頼は割り込みでも完遂を優先。関連 commit c3b51a03/18fd71ca。

### [2026-06-04 Session][severity:H] 描画チカチカを目先修正4連敗・解任寸前（マスター「いい加減にしろ」「根本対策してないだろ」）

**該当客観基準**: ④マスター差し戻し 3 件以上（実質4回の修正全外し）

**事象**: 描画モードの「チカチカ」を、原因未特定のまま onVVResize撤去/dispatchEvent削除/svh化/サイズガード と**目先のエラー対応で4回修正し全て外した**。各回デプロイしてマスター実機で「だめ」。チカチカは**実ブラウザ(Chrome)特有でheadless再現せず**、私のheadless検証(is-drawing安定/resize0)が無意味だった。マスター「目先のエラー対応してるだけだろ？根本的な対策してないだろ？」で覚醒→サブ10+2体でリサーチし真因確定。

**根本原因(プロセス)**: 実ブラウザでしか再現しないUIバグを、再現確認なく当てずっぽうで修正した。「リサーチ→原因確定→修正」の順序を踏まず表面エラーに飛びついた。headless再現不可なのにheadlessの計測を根拠にした。

**真因(技術)**: 描画オーバーレイ `.draw-section` が `<details class="hc">` の子。is-drawing時に `.draw-section` だけfixedで浮くが祖先 `.hc` カードが通常フローで背後残留。`.hc:hover{transform:translateY(-2px)}` がオーバーレイの `inset:8px` 枠から露出し、カーソルが枠/縁を跨ぐとhover振動→チカチカ(Chrome発生/Firefox非発生/実ブラウザのみ/A版正常 と全整合)。解法= `inset:0` 全画面化で背後を物理的に覆う + `body.is-drawing-active` で背後hover無効化。commit b92e58e4。

**再発防止**: (a)実ブラウザ特有バグ(hover/scrollbar/GPU/native resize)はheadless再現不可→headed Playwrightか実機で**再現してから**直す (b)目先修正を繰り返すな・原因確定前に直すな (c)正常版(A)と不具合版(B)が併存する時は**差分が真因**・まず差分を取れ (d)「カーソルを要素外で明滅・内で収まる・実ブラウザのみ」は `:hover{transform}` 振動の固有シグネチャ。

### [2026-06-03 Session][severity:M] A/B 正本取り違え＋現物未確認＋冗長説明で多数差し戻し（マスター「切れるぞ」）

**該当客観基準**: ④マスター差し戻し 3 件以上同一セッション内

**事象**: 司令塔が (1) A/B 2 正本を 3 回取り違え、(2) grep 結果のみで「歯項目なし」と誤断定（実際は SVG アイコンで存在）、(3) ブラウザを複数タブ同時に開きマスター混乱（マスターは似た画面が並ぶと混乱するため毎回全タブを閉じる運用）、(4) 説明が長く専門的でマスター「1 ミリも理解できない」「あほ」「いい加減にしろ」「切れるぞ」。**マスターは解任寸前まで苛立った**。

**根本原因**: 実物（ブラウザ/ファイル）を見ず grep・記憶で断定した。素人マスター視点（専門用語・一度に複数提示）の欠如。

**再発防止**: (a) 判断前に必ず現物をブラウザ起動 or Read で確認（grep 単独で断定禁止）。(b) **ブラウザは「確認対象 1 個だけ」開く**。(c) 説明は 2 列表・素人語・1 手ずつ伴走。(d) 複数正本（A/B・原本）は最初にファイル実体で確定し以後混同しない。関連 commit 500f7ff8。

### [2026-05-31 Session][severity:H] 提案ver デザインを AI 独断方向決定 → 0 点 → 全破棄・解雇

**該当客観基準**: ④マスター差し戻し 3 件以上同一セッション内

**事象**: 提案ver カルテのデザイン刷新で「ラグジュアリー（深ネイビー×ゴールド・明朝体）」という方向を **マスター未確認のまま独断で実装**。結果 0 点・「殺意がわく」「死ね」「お前がデザインするな」で全破棄・解雇。

**根本原因**: デザイン作業の本質は「見た目の系統選び」ではなく「情報設計（何を主役に・何を隠すか）」だったのに配色/フォントの系統選択にすり替えて独断で走った。

**再発防止**: (a) カルテ/UI デザインは **情報設計（主役・優先順位・開閉）をマスターと先に合意**してから見た目に入る（配色から入るな）(b) デザイン方向を AI の用意した選択肢に押し込えるな (c)「デザインプロとして」依頼された時こそ独断実装でなく要件ヒアリングを先行。

### [2026-05-29 03:00 Session][severity:H] 歯セクション外周不変 3 連続違反 + Plan Mode 再入

**該当客観基準**: ④マスター差し戻し 3 件以上同一セッション内 + ⑥Plan Mode 再入

**事象**: 司令塔が `.bp-teeth` 内 `.tt-pair` の grid 構造を 3 回連続で改造し、マスター指示「外周絶対不変」を破った。Plan Mode 再入 2 回。

**根本原因**: grid container 内部の子要素配置を変えると、内部要素の自然サイズ算出が連鎖し、min-height:130px を維持しても親 stretch で全体高が変動する。

**再発防止**: (a) 外周不変要件は `.bp-teeth` の height を CSS で hard fix（min-height でなく height）、(b) 内部 grid 子要素に `min-height:0; min-width:0` 付与、(c) 内部 img に `max-height:100%; max-width:100%` 溢れ止め、(d) 修正前後で必ず DevTools 測定し computed height の数値で確認。→ `failures.md` 参照

### [2026-05-31 Session][severity:M] 歯解剖図サイズ変更でマスター差し戻し（0 点 2 回）

**該当客観基準**: ④マスター差し戻し 3 件以上同一セッション内

**事象**: マスター指示「画像添付欄に合わせろ」を取り違え。統合解剖図を上下中央積みにした（指示は改修前の左右 2 列）。`tt-diagram-card max-width:160px` が is-drawing（全画面描画）を阻害し描画モードが 136×490 に潰れた。0 点 2 回 + やり直し複数。

**根本原因**: (1) 改修前の構造を確認せず独自レイアウトを採用 (2) CSS specificity（id 1-0-0 > class 0-3-0）が is-drawing 状態クラスを阻害する罠を見落とし。

**再発防止**: (a)「○○に合わせろ」は既存パターンを grep/Read で確認し踏襲を第一に (b) 状態クラス（is-drawing 等）で切替える CSS は id セレクタの specificity に注意し `:not(.is-drawing)` で限定 (c) UI 変更後は必ず自分で画面目視確認してからマスターに見せる。

---

## P4: 永続教訓

- [importance:M][2026-06-08] **状態を調べる前に「禁止/危険」と断定するな**。grid 履歴削除を push 状態未確認のまま「§6 force push 違反・壊れる」と断定→マスター「調べればわかるだろ」。`git branch -r --contains` / `status -sb` で未送信を確認すれば force-push 不要＝§6 非抵触と即判明した。**履歴 rewrite 安全手順**=stash 退避→クリーン地点から新branch→残すコミットを cherry-pick→`git branch -f master`。

- [importance:H][2026-06-05] **ポチ版B 5要件＋FB の実装アーキ（初期 commit b716591c）**。**現正本(0e5205b2)要点**: navBackTo は `!__VIEW__` 判定・日付起動は input click→showPicker・**showPreview は is-readonly 切替前に `__SALTYDOG_BM/TEETH.exportImage()` を `.bm-single` へ流す(c3b51a03＝描画線がプレビューで出る要)**・飼い主/犬に削除ボタンUI＋削除API(18fd71ca/7b7aee60)。①〜⑤の実装詳細は元ファイル参照（git log で復元可能）。

- [importance:M][2026-06-05] **20体 read-only 監査(112エージェント・8.2M tokens)結論**: 致命バグ・回帰ゼロ。確定 findings は品質負債中心(L)。**features 優先で即修正せず記録のみ**。要マスター判断=無認証 IDOR write(P1#3)。

- [importance:H][2026-06-04] **dist 生成は `npm run build` 1 本に自動化（手動 Copy-Item 撲滅）**。実体 `scripts/build-dist.mjs`。**変換ルール**: HTML `src/design-samples/ponchi-v2.html`→`dist/ponchi-v2.html`（`../assets/`→`/assets/`・`../js/`→`/js/` を replaceAll）。**末尾 self-check** が生成 HTML の相対パス残存 0 件を assert（残れば exit 1）。commit 8dcf1aff。

- [importance:H][2026-06-04] **ポチ版B 4不具合の真因と解法（commit b1614d33・本番Worker版01492073デプロイ済）**。不具合1=肉球 px ハードコード→CSS変数+%。**不具合2の「詰まり」は計測アーティファクト**（閉じた details 内でfixed無効→enterDrawingMode で `section.closest('details').open=true` の防御1行追加）。不具合3=params多重ネスト→`normalizeParams`（深さ無制限平坦化）。不具合4=重複reportId上書き防止。

- [importance:M][2026-06-04] **wrangler dev 陳腐化の罠**=起動済 dev サーバが古い Worker バンドルを配信し続ける。**サブエージェントに build/検証を委ねると削除系で deny 迂回を試みる挙動を観測→削除系は subagent prompt で明示禁止**。

- [importance:H][2026-06-03] **⚠️ 最重要認識: 3者区別（A・B 2正本 × 預かり原本）—取り違えは案件存続リスク**。**納品正本A**= `src/beauty-report-mobile.html`（shiota-karte に分離済み）。**納品正本B**= `src/design-samples/ponchi-v2.html`。**預かり原本**= `docs/beauty-report-reference.jpg`（編集上書き厳禁）。canonical → CLAUDE.md §1。

- [importance:H][2026-06-03] **編集閲覧兼用アーキ（クライアント版A 確立・ポチ版B も同手順で実装）**: **閲覧判定**=`window.__VIEW__` または URL `?mode=view`→`body.classList.add('is-readonly')`。**CSS(is-readonly)**=編集UI非表示、**クリックトグル選択ボタンを `pointer-events:none`**（contenteditable だけでは不十分）。**データ復元**=`window.SaltyDogPublish.applyReport(report)`。**Worker**=`handlePublicPage` が `/p/{slug}/{reportId}` で HTML 取得し `<script>window.__REPORT__=…;window.__VIEW__=true</script>` を注入。**デプロイ**: Cloudflare Pages で `--commit-message` は ASCII 明示必須（日本語 UTF-8 は API 拒否）。

- [importance:H][2026-05-29] **スマホ描画ツールは Konva.js(Canvas2D)**。(1) **ジェスチャ分離**=pointer Map で 1 本指=描く/2 本指=ピンチズーム&パン。(2) **画像を Konva.Image 化**し stage.scale+position でズーム（公式式・scale 1-5/pos bounds clamp）。(3) **当たり判定は手動 bbox**（Konva の text hit はグリフ依存で不安定）。(4) **テキスト**=textarea で複数行、入力中は `visualViewport` でキーボード直上固定（font 16px で iOS 自動ズーム防止）。リサーチ正本→`docs/drawing-annotation-method-2026.html`。

- [importance:H][2026-05-29] **「外周が動く」系レイアウト不具合の真因特定は測定先行（目視禁止）**。真因は `nail-diagram.png`（2266×1888）等の**無制約画像**。修正は `.report-page img{max-width:100%;max-height:100%;object-fit:contain}` + grid item `min-width:0` の 2 点。

- [importance:H][2026-05-28] **正本「オリジナル HTML」確定**: `src/beauty-report.html`（sha256: `19970ecc...`・314 行）。今後の派生・調整は本ファイルをベースとして参照し、構造の独断改変は禁止。

- [importance:H][2026-05-28] **ハック不要の単一データフロー設計**: 後付けの文字列置換ハックや仮のハードコード配列は禁止。状態管理オブジェクト（state.js）から直接マッピングするクリーンな単一データフローを最初から構築すること。

- [importance:H][2026-05-30] **本番デプロイ確立（Cloudflare Pages・`trimmer-system.kouheikosehira.com`）**。手順: `npx wrangler pages deploy dist --project-name=trimmer-system --branch=main --commit-dirty=true`。**顧客カルテ `assets/beauty-report-reference.jpg` は除外必須**。

- [importance:H][2026-05-31] **公開バックエンド = Cloudflare Workers KV + Worker**。route `/p/*`(公開閲覧)・`/api/*`(書込) を Worker、他は Pages へフォールスルー。**KV(binding=REPORTS・id `50241192b25149eb8f846653ecae8f64`)**。**※認証は 2026-06-04 無認証で確定（マスター明示）・WRITE_TOKEN/Bearer は廃止**。デプロイ: `cd worker && npx wrangler deploy`。

- [importance:H][2026-05-31] **Konva 描画ツールの factory 化（2 インスタンス）+ 歯解剖図描画**。`createDrawer(opts)` factory で体マーキング(`__SALTYDOG_BM`)と歯解剖図(`__SALTYDOG_TEETH`)を独立生成。歯は**改修前の左右 2 列**で「この子の歯 | 解剖図」。**罠: aspect-ratio/max-width を id 化すると specificity で is-drawing（全画面）を阻害 → `:not(.is-drawing)` 限定必須**。
