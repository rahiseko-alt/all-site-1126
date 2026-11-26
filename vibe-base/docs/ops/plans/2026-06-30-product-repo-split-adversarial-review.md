# 移行スクリプト 3検証者 統合レビュー（実行前）

対象: `scripts/migrate-products-to-repos.mjs` + `scripts/_lib/standard-gitignore.txt`
検証日: 2026-06-30 / 検証者: A(バグ) B(データ破壊) C(整合性)
関連 plan: `~/.claude/plans/starry-wiggling-eagle.md`

## CRITICAL（実行したら確実に事故・必ず修正）

| # | 欠陥 | 根拠 | 修正 |
|---|------|------|------|
| C1 | **shift-ai の `portfolio/` は本体ソース52件**（GSAP/MorphSVGデモ群）。当初「771MB生成物」と誤認。standard の `portfolio/` 除外で本体が消える | git ls-files で52件追跡中（検証C） | standard から `portfolio/` 削除 |
| C2 | **`.env.example` 誤除外**。`.env.*` に `!.env.example` 否定がなく、追跡中の .env.example 6件が消失。append が末尾で製品側 whitelist も上書き | 追跡6件: ai-concierge/app 他（検証C） | `.env.*` 直後に `!.env.example` |
| C3 | **learning-suite-kanji 実行部が未分岐**。plan は「URL照合のみ」だがコードは add→commit→push 実行。既存本番リポに `init:migrate` ジャンクcommit を push | GUARD は tracked===0 要求だが lsk は tracked>0 で SKIP されない（検証A+B） | 実行部で lsk を分岐（rm--cachedのみ） |
| C4 | **グローバル除外が未移植**。`.vercel`/`.wrangler/`/`__pycache__/`/`settings.local.json`/`secrets/`/`credentials.json` 等（products/で始まらない行）が新リポにコミットされる。**secret漏洩リスク** | ~10製品に .vercel、約20製品に settings.local.json（検証C） | standard に追加 |

## HIGH

| # | 欠陥 | 修正 |
|---|------|------|
| H1 | **大型ガードが非ASCII名で機能しない**。quotepath=true で日本語名が statSync 失敗→catch握り潰し→「大型でない」扱い。74件の非ASCIIファイル存在 | `-c core.quotepath=false ... -z` でNUL区切り取得 |
| H2 | **vibe-base index を28回書いて一度もcommitしない**。dirty放置で並行セッション衝突面を最大化（=記録済「2万件喪失」クラス） | 各 rm--cached を `commit -- products/<name>/` で原子化 |
| H3 | **dry-runが大型ガード/ステージ数を計算しない**。「焼き込み事前確認」目的で誤った安心 | dry-runでも試算 or plan約束を削除 |
| H4 | **素材動画/zipの誤除外**。`*.mp4`/`*.zip` 一律除外がLP素材(coach frame-effect.mp4 264KB)・漢字データ(lsk-foreign Unihan.zip 8.5MB)を巻き込む。10MB未満で大型ガードも素通り | サイズベースに寄せる（方針確認） |

## MEDIUM/LOW

- M1: 実行前 index 健全性アサート無し → 冒頭で `git diff --cached --quiet` 非0なら abort
- M2: rmSync 無効判定が HEAD のみ → objects/refs/logs 三点空チェック（今回は実体空を実証済=この run は安全）
- M3: add/commit が sh()で握り潰し → shSafe化
- M4: review-analysis 1.48GB の node_modules が個別<10MB で素通り → ファイル数/総バイト上限ガード
- L1: needRules の substring 重複判定が緩い（行単位完全一致に）

## 良好（対応不要・確認済）
- propagate-hooks は移行後も動く（git index 非依存・検証C実証）
- 順序（.gitignore→add）は正しい（検証A実証）
- 部分失敗の多くは冪等再実行で回復（検証A）
- 他共有スクリプトは git 追跡非依存で壊れない（検証C）
- dist/build は既にルート除外済で no-op（検証C）
- gh repo create は既存リポをスキップ・push は --force 無しで履歴破壊しない（検証B）

## リカバリープラン要点（検証B）
- 共有index衝突: 失敗製品を `--product=` 再実行（冪等）。残った index.lock は手動削除
- index巻き込み(push前): `git restore --staged products/` で巻戻し→正パスで再commit
- index巻き込み(push後): `git revert <sha>`（reset --hard 禁止＝他作業破壊）
- 大型ガードreset: 無害。.gitignore手当てして再実行
- 無効.git誤削除: .git復元→`git fsck --lost-found`→reflog回収（完全削除後は不可逆）

## 実行前チェックリスト（検証B）
1. 全並行セッション閉鎖
2. `find products/renai-game/.git products/shift-ai/.git -type f` → 0件（実証済）
3. `git -C vibe-base diff --cached --quiet; echo $?` → 0（現状156件dirty=Step1先行commit要）
4. `gh repo list rahiseko-alt --limit 60` で同名衝突確認
5. `.git/index.lock` 不在確認
