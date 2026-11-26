## coach エージェント Check-out: 2026-05-15 (Session 286) — 第 3/4 章統合 4 件 + 7P シェフ大型化 + ADDRESSING 規約 1 本化（仕組み化）

### 起点
セッション開始 `/pc-checkin` 発火 → マスター「一旦ブラウザで開け」→ lesson-slides.html 確認後、4 件統合指示「12-15 / 17-19 / 20+21 / 27-31 統合（裏でやれ）」+「シェフスライドは 7P に移設+画面に大きく表示、背景になじませろ」→ 並列エージェント 2 件 Edit 拒否で停止 → マスター「私のエディットではないが、無理やり仕組みの方をいじるなよ」で foreground 直接 Edit に切替 → 完遂後マスター指摘「規律なのか？仕組みになっていないならダメだ。コード書き換えに影響する重要な事だろ」→ Plan モードで 6 弱点抽出 → A+B+C+D 仕組み化提案 → マスター承認 → 完遂。

### 実施内容（コミット 1 件: ec02c6a・lesson-slides.html +538/-421 + 新規 1 + 既存 1 拡張）

**A. 章ブロック統合 4 件（DOM active 31→21 slides）**
- 第 3 章前半「嘘の正体」(3-5/3-6/3-7/3-8) → chapter-staged 3a (4 step)
- 第 3 章中盤「付き合い方」(3-10/3-11/3-12) → chapter-staged 3b (3 step)
- 第 3 章後半「嘘を最小化」(3-13/3-14) → chapter-staged 3c (2 step・slider 含む)
- 第 4 章「最強プロンプトと自分の言葉」(4-5〜4-9) → chapter-staged 4 (5 step)

**B. 7P シェフ画像改修**
- 小型 story-card lightbox トリガー削除
- 3 コマ大型直接表示（`.chef-frames` grid・`mask-image: radial-gradient` で白フェード・border/box-shadow なし）
- JS `stories.chef` data ブロック削除（eliza/haken は温存）

**C. ADDRESSING 規約 1 本化（仕組み化 A+B+C+D）**
- A: HTML 先頭 ADDRESSING 規約コメント追加（5 項目明示）
- B: chapter-staged hardcoded `Chapter NN` (8 件) → 空 div 化（JS-less fallback 一貫性確保）
- C: JS init で data-i 残存 + hardcoded Chapter 検出 → console.warn
- D: `scripts/check-lesson-slides-canonical.mjs` 新規（5 ルール検証）+ `check-in-verify.sh` A-7 として組込
- 検証: 規約違反ゼロ・EXIT 0 確認済

**D. 真実源 1 本化（物理削除）**
- `data-i` 属性 23 → 0（PowerShell 一括 regex）
- DOM 位置番号コメント prefix `<!-- ═══ NN · ... -->` 23 → 0（PowerShell 一括 regex）
- corner tr 動的「NN / 21」を全 slide 統一（chapter-staged 例外撤廃）
- マスター画面表示 = ソース照合キー 完全一致

### マスター指摘で覚醒（司令塔過失 3 件）

1. **並列エージェント乱発・1 ファイル衝突リスク**: 「裏でやれ」を受けて 7P 改修 + 4 件統合の並列 2 エージェント起動 → 両方 Edit 拒否で停止 → マスター「私のエディットではないが、無理やり仕組みの方をいじるなよ。通すことを優先して仕組みをいじるのは禁止」で停止 → foreground 直接 Edit に切替（完遂）
2. **規律と仕組みの混同**: ページ番号「NN / 21」統一を「規律」として済まそうとした → マスター「規律なのか？仕組みになっていないならダメだ。コード書き換えに影響する重要な事だろ」で覚醒 → A+B+C+D 仕組み化提案
3. **ページ番号体系の誤伝達**: 統合タスクで data-i / DOM idx / visible page を混同したエージェント指示書を発行 → マスター「俺が見る番号は１つ。お前は俺の指示した番号通りに作業する。お前の作業は俺の見ている番号と一致する」で物理一本化を要求 → 仕組み化に発展

### 未解決事項

#### 本セッション新規持ち越し
- ブラウザリロード後の全 21 slide「NN / 21」表示の目視確認
- 8 chapter-staged の prev/next ボタン・進行ドット動作確認（特に 3c slider）
- 3a step 2（問いかけ「これって AI だけ？」）の中央寄せ保持確認
- lesson ID コメント（`3-5 ハル...` 等）の将来仕組み化（マスター「最終的に変える時が来る」）

#### 既存持ち越し（coach プロダクト固有）
- 残り単独 slide（旧 data-i=12/13/17/18/25/31/32/33/34 相当）の統合判断 — マスター判断要
- `/copywriting` で全 21 slide の Key Message 全面磨き
- LP 本体 (`index.html`) の P0 ゲート (P0#18 Go/No-Go) / Cloudflare Pages デプロイ
- 予約導線 (Google Calendar) / 決済導線 (Stripe) 未実装

#### 既存持ち越し（vibe-base 司令塔領域・本エージェント対象外）
- Session 285 持ち越し全件（PC 表 v9.3 → v10.0 統合案実装 / 各 SOP 機械化）
- Session 283 持ち越し permission/hook F-1〜F-7 検証
- ymm-shorts / register-set.mjs / /skill-menu 実運用テスト

### 変更ファイル
- `products/coach/lesson-slides.html`（+538 / -421）
- `scripts/check-in-verify.sh`（+14 行・A-7 組込）
- `scripts/check-lesson-slides-canonical.mjs`（新規・93 行）
- `archive/mission-log-2026-05-14-s282.md`（Session 282 退避）

### Check-in 機械検証
- 開始時: 実施できず（cwd が `products/coach/` 配下・bash subshell の node PATH 不通）
- 終了時: A-7 単体 EXIT 0 確認済（`node scripts/check-lesson-slides-canonical.mjs`）

### PC 表バージョン
- coach 自治憲法 v1.0 / pc-progress.html v9.3（据え置き・lesson-slides は PC 表外作業）

### エラー回数
- マスター差し戻し: 4 件（並列エージェント 2 件 Edit 拒否 / 規律 vs 仕組み混同 / 番号体系誤伝達 / シェフ画像 Edit で「シェフ」typo）
- 司令塔過失: 3 件覚醒（上記）
- 自爆漏洩: 0 件
- データ破壊: 0 件

### 行動ログ
- coach エージェントは行動ログヒアリング対象外（vibe-base 司令塔のみの規律）

### 次セッション着手手順（要点）
1. `products/coach/lesson-slides.html` をブラウザで開き、全 21 slide 右上「NN / 21」表示確認
2. 8 chapter-staged の prev/next 動作確認（特に 3c slider / 3a 問いかけ中央寄せ）
3. マスター判断: 残り単独 slide の統合 / `/copywriting` Key Message 磨き / LP P0 進行 のいずれか
4. `bash scripts/check-in-verify.sh` で A-1〜A-7 全機械検証 EXIT 0 確認
