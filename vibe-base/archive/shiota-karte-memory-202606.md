# shiota-karte memory archive (2026-06)
> 元 products/shiota-karte/memory.md から移行した P3・P4 コンテンツ
> 作成: 2026-06-10 / コンテキスト改革 Phase C

---

## P3: 失敗事例

### [2026-06-03 Session][severity:M] A/B 正本取り違え＋現物未確認＋冗長説明で多数差し戻し（マスター「切れるぞ」）

**該当客観基準**: ④マスター差し戻し 3 件以上同一セッション内

**事象**: 司令塔が (1) A/B 2 正本を 3 回取り違え、(2) grep 結果のみで「歯項目なし」と誤断定（実際は SVG アイコンで存在）、(3) ブラウザを複数タブ同時に開きマスター混乱（マスターは似た画面が並ぶと混乱するため毎回全タブを閉じる運用）、(4) 説明が長く専門的でマスター「1 ミリも理解できない」「あほ」「いい加減にしろ」「切れるぞ」。**マスターは解任寸前まで苛立った**。

**根本原因**: 実物（ブラウザ/ファイル）を見ず grep・記憶で断定した。素人マスター視点の欠如。

**再発防止**: (a) 判断前に必ず現物をブラウザ起動 or Read で確認（grep 単独で断定禁止）。(b) **ブラウザは「確認対象 1 個だけ」開く**。(c) 説明は 2 列表・素人語・1 手ずつ伴走。(d) 複数正本は最初にファイル実体で確定し以後混同しない。関連 commit 500f7ff8。

### [2026-05-31 Session][severity:H] 提案ver デザインを AI 独断方向決定 → 0 点 → 全破棄・解雇

**該当客観基準**: ④マスター差し戻し 3 件以上同一セッション内

**事象**: 提案ver カルテのデザイン刷新で「ラグジュアリー（深ネイビー×ゴールド・明朝体）」という方向をマスター未確認のまま独断で実装。結果 0 点・「殺意がわく」「死ね」「お前がデザインするな」で全破棄・解雇。

**根本原因**: デザイン作業の本質は「情報設計（何を主役に・何を隠すか）」なのに、配色/フォントの系統選択にすり替えて独断で走った。マスターのペイン一次データを待たず解を先に作った。

**再発防止**: (a) カルテ/UI デザインは情報設計（主役・優先順位・開閉）をマスターと先に合意してから見た目に入る（配色から入るな）(b) デザイン方向を AI の用意した選択肢に押し込めるな (c) 「デザインプロとして」依頼された時こそ独断実装でなく要件ヒアリングを先行。

### [2026-05-29 03:00 Session][severity:H] 歯セクション外周不変 3 連続違反 + Plan Mode 再入

**該当客観基準**: ④マスター差し戻し 3 件以上同一セッション内 + ⑥Plan Mode 再入

**事象**: `.bp-teeth` 内 `.tt-pair` の grid 構造を 3 回連続で改造し、マスター指示「外周絶対不変」を破った。Plan Mode 再入 2 回。

**根本原因**: grid container 内部の子要素配置を変えると stretch 親と min-height 子の組合せで内部変動が外周に波及する経路を見落とした。

**再発防止**: (a) 外周不変要件があるときは height を CSS で hard fix（min-height でなく height）、(b) 内部 grid 子要素に `min-height:0; min-width:0` を必ず付与、(c) 内部 img に `max-height:100%; max-width:100%` で溢れ止め、(d) 修正前後で必ず DevTools 測定し computed height の数値で確認。

→ `failures.md` 参照

### [2026-05-31 Session][severity:M] 歯解剖図サイズ変更でマスター差し戻し（0 点 2 回）

**該当客観基準**: ④マスター差し戻し 3 件以上同一セッション内

**事象**: マスター指示「画像添付欄に合わせろ」を取り違え。(1) 統合解剖図を上下中央積みにした（指示は改修前の左右 2 列）(2)「添付欄に合わせる」を「解剖図を添付カードサイズにする」と誤解。aspect-ratio を class→id 化で specificity 上昇 + `tt-diagram-card max-width:160px` が is-drawing を阻害し描画モードが 136×490 に潰れた。

**根本原因**: (1) UI 変更で「改修前の構造」を確認せず独自レイアウトを採用 (2) CSS specificity（id 1-0-0 > class 0-3-0）が is-drawing 状態クラスを阻害する罠を見落とし。

**再発防止**: (a)「○○に合わせろ」は既存パターンを grep/Read で確認し踏襲を第一に (b) 状態クラス（is-drawing 等）で切替える CSS は id セレクタの specificity に注意し `:not(.is-drawing)` で限定 (c) UI 変更後は必ず自分で画面目視確認してからマスターに見せる。

---

## P4: 永続教訓

- [importance:H][2026-06-04] **⚠️ 階層フロー（飼い主→ワンちゃん→カルテ）はマスター却下・カルテ単体で進める方針確定**。trimmer-system との共有（コピー/依存/ファイル流用）は厳禁（マスター2回明示「共有はしない」）。
- [importance:H][2026-06-04] **⚠️ 公開ペイロードは KV 値上限 25MB**。写真は必ずクライアント圧縮してから保存する。対策: `compressDataUrl(dataUrl,1600,0.85)`。worker `handleAddReport` に 25MB 超ガード追加。
- [importance:H][2026-06-04] **⚠️ 編集エンジンは `beauty-report-mobile.html` 単一正本（PC/スマホ両対応・editable.html は廃止済）**。PC マウス対応（ホイールズーム/パン）は `createDrawer` 内に加算実装。
- [importance:H][2026-06-04] **⚠️ 公開 API 無認証は意図的仕様・蒸し返し禁止**（マスター「不要。二度と言うな」2 回明示）。WRITE_TOKEN 廃止確定方針。
- [importance:H][2026-06-04] **本番構成**: ドメイン `shiota-karte.kouheikosehira.com`。Pages `shiota-karte`（静的配信）。Worker `shiota-karte-worker`（routes `/p/* /api/*`）。KV binding `REPORTS` = id `eaf26014d4834c8e9c024441d4702bad`。デプロイ: `cd worker && npx wrangler deploy` / `npx wrangler pages deploy dist --project-name=shiota-karte --branch=main --commit-dirty=true`。dist 構成は `beauty-report-reference.jpg`・`犬の歯列画像*.png` 除外必須。
- [importance:H][2026-06-04] **⚠️ 閲覧 `/p/{slug}/{reportId}` は深い URL のため HTML の相対パスが 404**。対策: worker `renderReport` が `<head>` 直後に `<base href="/">` を注入。HTML の相対パスを絶対化したり base 注入を外したりするとこのバグが再発する。
- [importance:M][2026-06-04] **閲覧モードのサマリーバッジは `document.dispatchEvent(new Event('input'))` で同期**。applyReport 末に明示発火しないとバッジがデフォルト値のまま残る。
- [importance:H][2026-06-03] **⚠️ 2者区別（納品正本A × 預かり原本）— 取り違えは案件存続リスク**。B（ポチ版）は 2026-06-03 に剥離済・shiota-karte は A 単独。**納品正本A** = `src/beauty-report-mobile.html`。**預かり原本** = `docs/beauty-report-reference.jpg`。現物確認は1個ずつブラウザで開く（複数同時禁止）。
- [importance:H][2026-06-03] **編集閲覧兼用アーキ**: `beauty-report-mobile.html` 単一正本。閲覧判定=`window.__VIEW__` または URL `?mode=view`。CSS(is-readonly) でクリックトグル選択ボタンを `pointer-events:none`（contenteditable だけでは不十分）。Worker が `<script>window.__REPORT__=…;window.__VIEW__=true</script>` を `</head>` 前注入。デプロイ: `--commit-message` は ASCII 明示必須（日本語は Cloudflare API UTF-8 拒否）。
- [importance:H][2026-05-29] **スマホ描画ツールは Konva.js（Canvas2D）**。ジェスチャ分離（1本指=描く/2本指=ピンチズーム&パン）。画像を Konva.Image 化し stage.scale+position でズーム。座標は imageRect 基準正規化。テキストは textarea で複数行。
- [importance:M][2026-05-31] **prod-edit hook 摩擦は解消済**。shiota-karte は `.vercel` 不在（本番は Cloudflare Pages）のため src/ 編集は無プロンプトで即通過。
- [importance:H][2026-05-29] **「外周が動く」系レイアウト不具合の真因特定は測定先行（目視禁止）**。無制約画像が grid track を min-content まで押し広げる。修正は `img{max-width:100%;max-height:100%;object-fit:contain}` + grid item `min-width:0` の 2 点。
- [importance:H][2026-05-28] **正本「オリジナル HTML」確定**: `src/beauty-report.html`（sha256: `19970ecc24d5b899c7477ca3d739314aa719375c38f39f65f58ef24e4481f45b`・314 行・2026-05-28 23:05）。今後の派生・調整は本ファイルをベースとして参照し、構造の独断改変は禁止。
- [importance:H][2026-05-28] **ハック不要の単一データフロー設計**: 後付けの文字列置換ハックや仮のハードコード配列は絶対に避け、状態管理オブジェクトからクリーンな単一データフローを最初から構築。
- [importance:M][2026-05-28] **ビジュアル・フィデリティ**: 参照デザイン画像が存在する場合、グリッド比率・カラーパレット・金属調グラデーション・吹き出し装飾・手書き風フォント等を細部まで観察しプレミアムな質感まで完全にシンクロさせること。
- [importance:H][2026-05-31] **公開バックエンド = Cloudflare Workers KV + Worker（顧客固有 URL + 月別蓄積）**。KV(binding=REPORTS): `index/customers.json` / `customers/{slug}.json` / `reports/{slug}/{reportId}.json`。書込保護は WRITE_TOKEN（廃止済・2026-06-04）。
- [importance:H][2026-05-31] **Konva 描画ツールの factory 化（2 インスタンス）**: `createDrawer(opts)` factory で体マーキング(`__SALTYDOG_BM`)と歯解剖図(`__SALTYDOG_TEETH`)を独立生成。CSS は `.draw-section` 共通クラス化で全画面描画(is-drawing)を両セクション共有。**罠: aspect-ratio/max-width を id 化すると specificity で is-drawing を阻害 → `:not(.is-drawing)` 限定必須**。
