# Plan: memory 機構の context 圧迫 根治（全product共通）

> 正本は実装時に `docs/ops/plans/2026-06-23-memory-context-bloat-fix.md` へコピーする
> （`~/.claude/plans/` は git 管理外で消失リスク・failures.md 既知教訓）

## Context（なぜやるか）

マスター報告「数日でおかしくなった・compact 頻発・全ディレクトリで10回ほど再発」。前セッションは「全部 harness 固定費・削れない」と誤結論し炎上。

実測で2系統に分離（マスター貼付 `/context` 実数）：

| バケツ | 症状 | 真因 |
|--------|------|------|
| 注入（読込不要が毎回 auto-load） | 「開始時点の消費が増えた」 | product で `agent-rules.md @import 34KB≈12k`＋MEMORY.md 死蔵込 9.4KB |
| 書込（Messages に溜まる） | 「チェックイン直後から重い・compact頻発」 | pc-checkin が failures.md(24KB) 等を**全文Read**で Messages へ注入 |

**根因（マスター指摘で判明）**：書込量の上限が機械強制されていない。

| 上限 | 強制状況（実体確認済） |
|------|---------------------|
| code 500行（line-count-gate.mjs） | ✅ 書込時block。但し `.html/.js/.ts/.css` 等コードのみ・**.md 対象外** |
| memory.md 200行（check-in-verify.sh） | △ 事後WARN/NGのみ・書込は止まらない |
| failures.md 200行 / MEMORY.md 25KB / session-report | ❌ 強制 hook 無し（規約・コメントのみ） |

加えて上限の単位が**行数**。context コストは**バイト**。failures.md は109行で200行上限内なのに24KB＝1行が長文で上限をすり抜ける（測る軸が誤り）。

**目標**：(1) 注入・書込の固定オーバーヘッドを約 -21k／(2) memory系に**書込時バイト上限 gate** を新設し再肥大を機械封鎖（mission 2＝仕組み変更）。

## 影響範囲（既存修正 + 新規）

- 修正 `docs/ops/agent-rules.md`（canonical・据置・on-demand 化）
- 新規 `.claude/rules/agent-rules.md`（短ポインタ ~1KB）
- 修正 `products/*/CLAUDE.md` 26件＋`docs/standards/templates/product-scaffold/CLAUDE.md.template`（@import 張替）
- 修正 `MEMORY.md`（死蔵3件→archive）+ `archive/vibe-base-memory-202506.md`
- 新規 `.claude/hooks/memory-size-gate.mjs`（書込時バイト gate）＋ `.claude/settings.json` 登録（Write|Edit matcher）
- 新規 `scripts/failures-recent.sh`・`scripts/memory-prune-check.mjs`
- 修正 `~/.claude/skills/pc-checkin/SKILL.md`（failures 全文Read廃止）

## 実装ステップ

> 規律：削減は機械（hook/script/pointer）で強制。並列 Write/Edit 禁止（1メッセージ1編集）。3・4 は段階展開（1件diff確認→残継続）。

| # | 作業 | 受入対応 |
|---|------|---------|
| 1 | `.claude/rules/agent-rules.md` 新規。他5ルールと同型（要点3〜5行＋canonical → docs/ops/agent-rules.md） | 1 |
| 2 | scaffold template の `@../../docs/ops/agent-rules.md` → `@../../.claude/rules/agent-rules.md` | 3 |
| 3 | 26 product CLAUDE.md の同行を script で機械張替（path-scoped commit） | 2,3 |
| 4 | MEMORY.md 死蔵3件（【完了2026-06-16】toranomaki・【完了2026-06-17】Vercel・【脅威モデル訂正済】）を archive へ・本文1行ポインタ化 | 4 |
| 5 | **`.claude/hooks/memory-size-gate.mjs` 新規**（PreToolUse Write\|Edit）。対象 path がバイト上限超で block：failures.md ≤12KB / memory.md ≤6KB / MEMORY.md ≤8KB / session-report ≤4KB。settings.json 登録は HARD BLOCK 経路ゆえ orchestrator 直接＋必要時マスター手動適用 | 7 |
| 6 | `scripts/memory-prune-check.mjs` 新規。MEMORY.md の【完了】【放置決定】【訂正済】マーカー検出→archival 勧告 | 5 |
| 7 | `scripts/failures-recent.sh` 新規。failures.md の `[S✓]/[S]` 行＋末尾15行のみ出力 | 6 |
| 8 | pc-checkin SKILL.md STEP1：「failures.md 全文 Read 禁止・`scripts/failures-recent.sh` 出力で代替」明記 | 6 |

## 設計判断（採用/不採用）

- 採用：agent-rules を「短ポインタ @import＋canonical on-demand」化（既存5ルールと一貫・最小リスク）
- 採用：上限を**行数→バイト**に是正し**書込時 gate** で強制（事後WARN では再肥大を防げない＝憲法「hookで強制」準拠）
- 不採用：agent-rules.md／session-report 本体の中身削除（情報資産・on-demand で温存）
- 不採用：Serena 変更（マスター判断 現状維持）
- 不採用：session-reports 67件一括削除（@import は最新1件のみ・前セッション誤認）

## リスク

| リスク | 対策 |
|--------|------|
| @import 解除で共通ルール劣化 | ポインタに要点3〜5行を残し critical 可視維持・詳細は on-demand Read |
| 26 product 一括張替で別agent作業を巻込 | script 機械置換・1件diff→残継続・`git commit -- <明示パス>` |
| size-gate が正当な大型編集を誤block | バイト上限は実測+余裕（failures現24KB→12KBは要 archive 前提）・既存超過は warn 移行措置・閾値は可変 |
| settings.json への hook 登録が HARD BLOCK | orchestrator 直接編集・不可時マスター手動（全文Write→cp で byte 正確・failures教訓） |
| product CLAUDE.md 越権懸念 | @import 行は冒頭 infra boilerplate＝司令塔 §0 領域・マスター明示指示済 |

## テスト方針

- ステップ3後：`grep -rl "@../../docs/ops/agent-rules.md" products/*/CLAUDE.md | wc -l`=0／新行=26
- size-gate 単体：fixture（上限超 .md と上限内 .md）を `echo '{...}' | node memory-size-gate.mjs` で block/pass 確認（本番 settings を汚さず tests/fixtures 経由）
- 新script単体：`bash scripts/failures-recent.sh`・`node scripts/memory-prune-check.mjs` を CLI 起動し EXIT+stderr 確認
- hook 健全性：`node scripts/check-hook-integrity.mjs` EXIT 0
- 実効測定（最重要）：実装後 product 新規セッションで `/context` 取得し agent-rules 由来 12k→~0.3k を before/after 数値で確認（マスター目視）
- verify-agent に受入基準全件 機械検証→PASS/FAIL 表（commit 前・FAIL 1件で commit 禁止）

## 実装時ルート変更（plan乖離記録）

ステップ2・3（@import を `.claude/rules/agent-rules.md` へ張替＋26 product 編集）は **check-rules-coverage.sh #2 が product CLAUDE.md に `@docs/ops/agent-rules.md` を必須化**しているため hook block される。ゴール（@imported 34KB 縮小）不変のまま **ルートC** に変更：@import パス（`@docs/ops/agent-rules.md`）据置きで本体を縮小。canonical を `docs/rules/agent-rules-canonical.md` へ退避し `docs/ops/agent-rules.md` を ~1.3KB ポインタ化。**26 product 編集・template 編集・hook 改変は不要**。下記 AC1〜3 をルートC版に置換。

## 受け入れ基準

1. agent-rules 本体縮小：`docs/ops/agent-rules.md`（@import 先）が 34001→約1.3KB — 検証 `wc -c docs/ops/agent-rules.md`
2. canonical 退避：`docs/rules/agent-rules-canonical.md` が存在し旧本体と byte/sha 一致（34001B） — 検証 `wc -c`＋`sha256sum`
3. @import パス不変：`grep -rl "@.*docs/ops/agent-rules.md" products/*/CLAUDE.md` が 26 件（hook#2 満たす・編集不要） — 検証 grep+`wc -l`
4. MEMORY 死蔵掃除：死蔵3件消失・archive 移動・バイト減（9439→7740） — 検証 `wc -c` before/after＋`grep -cE '【完了|【放置決定|【脅威モデル訂正済'`=0
5. prune gate 稼働：`node scripts/memory-prune-check.mjs` 死蔵検出で warn・clean時 exit 0 — 検証 `node ...; echo $?`
6. failures 抜粋稼働：`scripts/failures-recent.sh` が抜粋出力（9666B<全文24262B）＋pc-checkin SKILL.md に全文Read禁止明記 — 検証 `bash ...| wc -c`＋`grep "全文 Read 禁止"`
7. size-gate 稼働：`memory-size-gate.mjs` が上限超 .md を block・上限内 pass（fixture 単体）・全27 product settings＋root に Write\|Edit matcher 登録 — 検証 fixture 2件＋`grep -rl memory-size-gate products/*/.claude/settings.json`
8. hook 健全性維持：`node scripts/check-hook-integrity.mjs` EXIT 0 — 検証 `node ...; echo $?`
9. 実効削減実証：product 新規セッションの `/context` で agent-rules 由来 12k→~0.3k・memory 固定費削減 — 検証 `/context` before/after（マスター目視合格）

## 承認後モード

- ステップ1〜8 順次・1メッセージ1編集。3・4 段階展開。
- 実装は司令塔直接（settings/hook/skill/template/全product横断＝orchestrator 領域）。settings.json 登録が block されたらマスター手動へ即移行。
- 完遂前に verify-agent 呼出→PASS→`git commit -- <明示パス>`→/context 実測をマスター提示。
