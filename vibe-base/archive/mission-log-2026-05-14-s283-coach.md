## coach エージェント Check-out: 2026-05-14 (Session 283) — 教室授業スライド lesson-slides.html 構築

### 起点
マスター指示: 「教室で使うスライド資料が欲しい / HTML / 1ブロック1ページ / `/frontend-design` 使え」。Aiueo 教室の AI 初心者講座「AI に言うことを聞かせる方法（第 4 版）」用の単一 HTML プレゼン。

### 実施内容（コミット 1 件・lesson-slides.html 単一ファイル + assets）

**A. ベース構築（13 → 41 スライド化）**
- 単一 HTML `products/coach/lesson-slides.html` を新規作成
- 当初 13 ブロック版で着手 → マスター提供 Google Docs 正本（第 4 版）に従い 41 スライド構成に拡張
- 構成: 表紙 (1) + 第 0 章オリエン (6) + 第 1 章 AI を知る (5) + 第 2 章接し方原理 (5) + 第 3 章 2 つのコツ (14) + 第 4 章まとめ (10) = 41
- フォント: Fraunces (variable serif) + Noto Serif JP + Noto Sans JP
- パレット: dark base `oklch(0.14 0.022 265)` + amber `oklch(0.80 0.17 65)` + teal `oklch(0.74 0.14 195)` + magenta `oklch(0.65 0.22 0)`
- 縦スクロール構造 + ホイール/タッチ/キー/ボタンで easeOutExpo の "グワン" smooth scroll (duration 1100ms)
- 背景 aurora (3 blob drift 60-120s 周期) + grain overlay 0.018

**B. ELIZA ストーリーカード + lightbox**
- slide 1-1 (60 年前の AI ELIZA) に画像スタックカード埋め込み
- マスター提供 5 枚 (`Gemini_Generated_Image_*.png`) を `assets/eliza/01-05.png` にコピー
- クリックで lightbox 拡大、さらにクリックで 1→7 順送り
- マスター指示で「最初: ELIZA の物語タイトル」「最後: END」を追加して計 7 コマ
- lightbox 内に grain video overlay (mix-blend-mode: multiply / opacity 0.62) → セピア紙質統一感

**C. WMV/MP4 動画エフェクト**
- マスター提供 `nc67667_手書き風の枠.wmv` → 当初 MP4/WebM 変換 + 重ね合わせ実装 → **マスター指示で削除** (ノイズだけ残せ)
- `nc91367_フィルムノイズ.mp4` → 480p MP4 (885 KB) + WebM (782 KB) 変換、`assets/eliza/grain-effect.{mp4,webm}` に保存
- 手書き枠は HTML/CSS から削除済（video ファイルは `frame-effect.{mp4,webm}` として残置）

**D. 既存 4 仕掛けの配置**
- slide 0-2「なぜ在り方なのか」: インライン SVG ダイアグラム「やり方の箱の連鎖 vs 在り方の幹（warm-cool グラデ + Gaussian Blur 発光）」
- slide 1-1: ELIZA ストーリーカード（前述）
- slide 3-0「大前提」: invert スライド（クリーム反転 + radial glow）
- slide 3-13「ハルシネーション最小化」: インタラクティブ slider（許可レベル 0-100% → 幻覚率 50%→32% / 「分かりません」率 0→100% を双方向連動）

**E. Tariq クローン分析（`/perfect-web-clone`）**
- `https://thariqs.github.io/html-effectiveness/` の 7 サブページを curl 取得 (`products/coach/_research/tariq-clone/pages/`)
- 09-slide-deck.html (Tariq 版のスライド構造) を中心に分析、表現パターン 10 個抽出
- 抽出パターンから 3 つ採用 (invert / TL;DR / interactive slider 相当) → 既存実装に活かす形に転用
- `_research/` ディレクトリは `.gitignore` に追加（外部 HTML を git 管理外）

**F. 3 段展開構造プロトタイプ（マスター最新指示）**
- slide 1-2 (派遣社員) で「第●章 + お題 + クリック可能カード → Key Message 展開 → 縮小 + サブメッセージ展開」の 3 ステート構造を実装
- 初版は `position: absolute + visibility` で展開しない不具合 → max-height/padding/border-width/transform ベースに書き直し
- ease-expo 680ms + scale + translateY で「グワッ」と展開
- State 2 では Key Message を実際に縮小 (max-height 600→240px / padding 44→18px / font-size 28→15.5px)
- 第●章 eyebrow を白 1 色に修正（グラデやめ）

### 未解決事項（次回着手手順）

**1. 3 段展開構造を残り 36 ブロックに展開（最優先）**
- 現状 slide 1-2 のみプロトタイプ実装済み・マスター承認待ち
- 動作確認 OK が出たら、残り 36 ブロック（cover/問いかけ 2 枚 1-0 3-7 / conclusion 4-10 を除く全 block 系）に同じ構造を機械的に適用
- 各スライドの既存 `<div class="key">` の glass 内容 = Key Message、`<div class="args-wrap">` の args = サブメッセージ、として変換
- 例外スライド: 0-1 / 0-4 / 0-5 / 2-2 / 2-3 / 3-5 / 3-12 / 4-3 等は key-only or args-only 構造。これらは Key カードのみで終わる 2-stage 版にする

**2. 細部の調整候補（マスター提示済 / 検証要）**
- グラデ・ガラス・ネオン・カードグリッド を「漫然と」ではなく「意図的に」使う方向は確立済
- フィルムノイズの opacity 0.62 が強すぎるか確認
- aurora blob の drift 速度（90-120s）は静かすぎる/動きすぎないか
- scroll の easeOutExpo 1100ms グワン感の体感

**3. /copywriting で 13→41 ブロックの Key Message 全面磨き（未着手）**
- 元タスク #4。正本テキストをそのまま使っているので、コピーライティング原則で磨くフェーズ未実施
- staged 構造完成後に着手

**4. PC 表外作業**
- coach の lesson-slides.html は PC 表（P0-P4）の対象外（LP 本体ではなく授業用ツール）
- P0 自体は Session 239 から停滞中（マスター P0#3 仮説リスト承認待ち）

### 変更ファイル

- `products/coach/lesson-slides.html` 新規 (約 2700 行)
- `products/coach/assets/eliza/01-05.png` 新規 (ELIZA イラスト 5 枚 × 約 2MB = 10MB)
- `products/coach/assets/eliza/frame-effect.{mp4,webm}` 新規 (手書き枠動画・現在は HTML 未使用)
- `products/coach/assets/eliza/grain-effect.{mp4,webm}` 新規 (フィルムノイズ・lightbox に重畳)
- `.gitignore` 更新 (`products/coach/_research/` 追加)
- `products/coach/_research/tariq-clone/` (gitignore 対象・page_data.json + pages/ 7 ファイル)

### Check-in 機械検証
- 実施せず（マスター指示外 + cwd が `products/coach/` 配下のため、`scripts/check-in-verify.sh` は vibe-base ルートからの実行が必要）

### PC 表バージョン
- coach v9.3 (据え置き・lesson-slides は PC 表外)

### エラー回数
- マスター差し戻し: 4 件（① 単独発火禁止対応の冗長確認 ② デザイン保守的「30 年前の WEB」批判 ③ 視認性悪化（glass 透過過剰）④ 3 段展開の動作不良）
- 自爆漏洩: 0 件
- データ破壊: 0 件

### 次セッション着手手順（要点）

1. `products/coach/lesson-slides.html` をブラウザで開いて slide 1-2 派遣社員の 3 段展開動作を再確認
2. マスター承認確認（カード展開 / Key 縮小 / Sub 展開）
3. OK なら残り 36 block 系スライド (data-i 1-8, 10-11, 12-16, 17-20, 21-30, 31-39) を staged 構造に変換する一括展開タスク開始
4. 例外スライド (key-only / args-only / 問いかけ専用 / conclusion) は別パターンとして処理
