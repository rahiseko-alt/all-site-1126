# 2026-06-17 HTML虎の巻 outbox intake — 再現度100% 計画

## Context（なぜやるか）

SessionStart hook が outbox 取込待ち 5 件を検出。マスター指示「#1 を実行・**再現度100%** のための計画を立てろ」。
「再現度100%」= 取込後の虎の巻／公開ポータルのデモが、クリエイティブ各エージェントが作った原本と寸分違わず再現されること。
本計画は (a) 再現度を破壊しうる脅威の特定と封鎖、(b) 取込後の機械＋目視検証手順を固める。

## 結論先出し：コピー再現度は既に構造保証されている

| 工程 | 実装 | 再現度 |
|------|------|--------|
| intake 配置 (`placeTheme`) | `fs.copyFileSync` で outbox→docs を byte-exact コピー（meta.json のみ除外） | 100% |
| 公開 build (`copyImpl`) | docs→portfolio を再帰コピー。**除外は `*.md`（知識層）のみ**＝qr.svg 等アセットは複製 | 100%（実行層） |

→ ファイルレベルの再現度は intake エンジン自体が既に100%。脅威は「壊れた提出物を取り込む」「弱い検証で破綻を見逃す」の2点に集約される。

## 影響範囲

- `docs/html-toranomaki/{slug}/`（原本・単一正本）
- `docs/html-toranomaki/registry.json`（メタ単一正本・json-canary 保護）
- `portfolio/{slug}/` ＋ `portfolio/creative-portfolio-portal.html`（生成物・直接編集は hook Deny）
- 提出元（読取のみ・編集しない＝他エージェント領域）: `products/homepage/.toranomaki-outbox/`・`agent-ag/.toranomaki-outbox/`

## 提出物 5 件の再現度リスク評価

| slug | impl | 種別 | 命名規約 | 知識層 | 外部依存 | 判定 |
|------|------|------|---------|--------|---------|------|
| flip-qr-popout | impl-gsap-3.12 | UPDATE | OK | concept+research 有 | GSAP CDN・qr.svg(同梱・複製される) | 取込可 |
| hover-color-buttons | impl-vanilla-1.0 | UPDATE | OK | 有 | Google Fonts のみ | 取込可 |
| hover-reveal-icon | impl-vanilla-1.0 | UPDATE | OK | 有 | Google Fonts のみ | 取込可 |
| threejs-water-tunnel-dive | impl-threejs-r173 | INSERT | OK | 有 | importmap→unpkg/esm.sh（three/gsap/lenis/simplex） | 取込可・要目視 |
| **glassmorphism-tilt-card** | **ai-officer-hp** | UPDATE | **違反** | **concept/research 提出なし** | Unsplash画像4・lucide・lenis CDN | **BLOCKER** |

### 最上流ブロッカー（1件）: glassmorphism-tilt-card

現状 registry／docs は **impl-gsap-3.12（命名OK・concept/research 完備・portfolio:true order:9）で正常公開中**。
今回の outbox 提出は **稼働中エントリを退行させる**:

1. impl 名 `ai-officer-hp` が RULES §3 `impl-{lib}-{ver}` 規約違反（製品フォルダ名のまま）
2. 提出に concept.md / research-log.md なし → 知識層が新 impl と不一致のまま放置
3. 取込すると registry impl が `impl-gsap-3.12 → ai-officer-hp` に反転し、旧 impl-gsap-3.12 が孤児化
4. これは failures.md L92 の欠陥そのものの**再導入**

intake エンジンはこれを止められない（ai-officer-hp は DOM デモで blindtest 黒判定を自明 PASS＝誤通過）。
→ **取込前に gate out が必須**。

## blindtest の限界（再現度100%を自動 PASS だけで主張不可）

`toranomaki-blindtest.mjs` は「黒ピクセル率95%超で FAIL」のみ。以下を検証**しない**:

- console / page error は記録するだけで FAIL にしない（L149）→ JS エラー・404 を見逃す
- 中央 hover 1回・3秒待ちのみ → flip / scroll / hover-reveal の操作再現を検証不能
- 白背景の DOM デモ（homepage 4件）は黒判定を自明 PASS＝実質ノーシグナル

→ WebGL（threejs）には有効だが、DOM デモ4件には**マスター目視が再現度の最終ゲート**（CLAUDE.md「見せて」= ブラウザで開く）。

## 実装ステップ

| # | 手順 | コマンド/対象 | 受け入れ |
|---|------|--------------|---------|
| 0 | glassmorphism を取込対象から退避（提出フォルダを一時 hold へ move・**編集はしない**） | `products/homepage/.toranomaki-outbox/glassmorphism-tilt-card` → `tmp/intake-hold-20260617/` | 退避後 outbox に4件のみ |
| 1 | 取込実行（配置→blindtest→registry→build） | `node scripts/toranomaki-intake.mjs` | EXIT 0・取込4件・失敗0 |
| 2 | byte-identity 検証（outbox→docs） | 各ファイル sha256 一致（テスト方針参照） | 全一致 |
| 3 | 実行層 identity 検証（docs→portfolio・md除外） | 各ファイル sha256 一致 | 全一致 |
| 4 | アセット存在＆参照検証 | qr.svg が docs/portfolio 双方に存在・相対参照に 404 なし | OK |
| 5 | 三者一致検証 | `node scripts/toranomaki-verify.mjs` | EXIT 0 |
| 6 | マスター目視（再現度の最終ゲート） | 各 index.html をブラウザ全画面で開き flip/scroll/hover を操作確認 | マスター合格 |
| 7 | glassmorphism を退避から復元 | hold → outbox へ戻す | 復元完了 |
| 8 | commit（マスター承認後・パス限定） | `git commit -- <docs/portfolio 限定パス>` | 巻込みなし |

> ステップ0の move は配置物の編集ではなく取込スコープ制御。intake エンジンに per-slug 選択フラグが無いための運用回避。提出物の中身は一切改変しない。

## リスクと対策

| リスク | 対策 |
|--------|------|
| glassmorphism 退避忘れ → 稼働エントリ退行 | ステップ0を必須先行・退避後に outbox 4件を目視確認してから intake |
| 並行セッションの staged 巻込み | commit は `git commit -- <明示パス>`・直前 `git diff --cached --name-only`・後 `git show HEAD --stat`（failures L93/L95） |
| threejs CDN 失敗で黒画面 | blindtest が黒判定 FAIL で registry 未更新＝公開汚染しない（自動安全網）・通過後もマスター目視 |
| 外部画像/CDN 失効（glassmorphism Unsplash 等） | byte-exact 再現の範囲。原本がそう作られている＝再現度問題ではなく堅牢性課題として別途記録 |

## テスト方針

ステップ2-3 の byte-identity は使い捨てワンライナーで実施する:

    # outbox→docs（meta.json 除く全ファイル sha256 比較）
    # docs→portfolio（*.md 除く全ファイル sha256 比較）

ステップ5 `toranomaki-verify.mjs` が registry / docs / portfolio の三者一致（slug・impl・存在）を保証する。
WebGL（threejs）は blindtest 黒判定が自動ゲート。DOM 4件はマスター目視がゲート。

## 機械検証可能条件

| # | 条件 | 検証コマンド | 合格 |
|---|------|-------------|------|
| M1 | 取込4件・失敗0 | `node scripts/toranomaki-intake.mjs` の EXIT code と末尾サマリ | EXIT 0・取込4件 |
| M2 | outbox→docs byte一致 | 各ファイル `sha256sum` 比較 | 差分0 |
| M3 | docs→portfolio byte一致（md除外） | 各ファイル `sha256sum` 比較 | 差分0 |
| M4 | qr.svg 存在 | `test -f docs/.../flip-qr-popout/impl-gsap-3.12/qr.svg && test -f portfolio/flip-qr-popout/qr.svg` | 双方 OK |
| M5 | 三者一致 | `node scripts/toranomaki-verify.mjs` の EXIT code | EXIT 0 |

## 受け入れ基準

1. glassmorphism 退避と4件取込 — `node scripts/toranomaki-intake.mjs` が EXIT 0・取込4件・失敗0 を出力
2. outbox→docs byte一致 — 全対象ファイルの `sha256sum` 比較で差分0
3. docs→portfolio byte一致（md除外）— 全対象ファイルの `sha256sum` 比較で差分0
4. qr.svg 同梱 — `test -f` で docs・portfolio 双方に存在を確認し参照 404 なし
5. 三者一致 — `node scripts/toranomaki-verify.mjs` が EXIT 0
6. デモ再現目視 — `node scripts/toranomaki-blindtest.mjs` の screenshot（`test-results/`）とブラウザ全画面操作をマスターが確認し合格と回答
7. glassmorphism 復元 — hold→outbox へ戻し `ls` で4→5件に戻ったことを確認
8. commit 健全性 — `git show HEAD --stat` で対象パス限定・並行 staged 巻込みゼロを確認

## 承認後モード

- ステップ0-5・7-8 は司令塔直接実行（intake/verify/commit は司令塔権限内・push はマスター手動）。
- ステップ6 はマスター目視ゲート。
- glassmorphism の根本修正は homepage エージェント領域＝本バッチ外（下記）。

## glassmorphism の根本解決（別タスク・本バッチ外）

退避した提出物は homepage エージェント領域。司令塔は concept.md を代筆しない。homepage 側で:
- impl フォルダを `ai-officer-hp` → `impl-{lib}-{ver}` 規約名へ改名
- concept.md / research-log.md を新 impl に整合させて同梱
- 既存 impl-gsap-3.12 を更新するのか別バージョンとして増やすのか意図を確定
してから再提出。司令塔はそれを取込む。
