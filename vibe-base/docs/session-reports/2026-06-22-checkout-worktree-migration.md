# Check-out 引継ぎ — git worktree 移行 Step1 ＋ 分岐根治 ＋ 再発防止

> branch: master / HEAD: e8149931a（origin と一致 `0 0`）
> **次セッションは本ファイルを先頭から Read してから着手すること。**

## 🔴 最重要

1. **git の分岐は根治済み。今後 worktree 統合は「本体ローカル master に `git merge`→push」する（PR 経由禁止）。** 正本 → `docs/adr/0003-worktree-feature-branch-migration.md`「統合方法」節。Step1 で PR 経由マージし本体を飛ばしたため別 agent 作業と分岐した教訓。
2. **bot 競合が残る構造課題。** x-auto-post の GitHub Actions が master 直 push（日3回+）。人間のローカル push と競合し、今回2回 rejected → 都度 `git fetch && git merge origin/master` で取り込んで完遂。**次の改善点 = 人間側を競合に強い運用へ**（Step2/3 と併せて検討）。
3. **本体に別 agent の131件未 commit が常駐**（meishi-maker prototype・homepage coverflow・kosespark webapp-mockup）。司令塔は触らない・path-scoped commit 厳守。

## A. 本セッション TL;DR

1. P1 #1〜#3 の完了状況をサブ3体で実体確認
2. ディスク掃除 一部実行（codex/hf/npm/agent-ag 2clone・約3GB+解放）
3. 新規 P0 製品2件（meishi-maker・hp-customizer）立ち上げ
4. 虎の子 `toranoko/` = 俺専用 技術アーカイブ（registry30件・3カラム白基調・localhost:3100）
5. **git worktree 移行 Step1 完了**（ADR-0003・agent-rules worktree 節・PR #37）
6. **分岐根治**: PR 経由が本体非経由で別 agent 作業と分岐 → 本体経由 merge（`d076fff2c`）で解消・push `0 0`
7. **再発防止策を ADR-0003「統合方法」に確定**（本体経由 merge→push）

## B. 完了 commit 一覧（本セッション・全 push 済）

| hash | 種別 | 内容 |
|---|---|---|
| 8656ed9f | feat(products) | meishi-maker / hp-customizer P0 + toranoko 初版 |
| 0b0d12f5 | refactor(toranoko) | 技術アーカイブに作り直し |
| 5175f1ab | chore(memory) | 前回 Check-out |
| 7d99a9045 | feat(ops) | ADR-0003 + agent-rules worktree 節（feature worktree 経由） |
| d076fff2c | merge | 分岐解消（worktree移行 と kosespark/homepage 統合） |
| 2d821e88a | docs(adr) | 再発防止「統合方法」節 + memory 更新 |
| e8149931a | merge | bot 先行(x-auto-post)取り込み再統合 |

## C. 影響波及

- ADR-0003 は全エージェントの git 運用に影響（worktree 統合は本体経由必須）。agent-rules.md「git worktree 運用」節に要点。
- worktree 配置は `vibe-base/.worktrees/<topic>`（本体配下・`.git/info/exclude` 登録）。兄弟配置は `outside-vibe-base-gate` hook で不可。
- 教訓: Windows は `git worktree remove` がロックでツリー削除失敗 → 撤去後に物理残骸（`.worktrees` 再帰ファイル数）確認必須。

## D. 残作業

**H**
- kosespark P0 即死仮説#1 検証（§1/§2/§3 マスター情報待ち・未着手）

**M**
- worktree 移行 Step2（各 agent 横展開＋learning-suite CLAUDE.md L48-77 ポインタ化）/ Step3（横展開一巡後 pre-push master 拒否 hook）— ADR-0003
- **bot 競合の解消**（人間側を PR/サーバ側マージ等 競合に強い運用へ・Step2/3 と併せ設計）
- 新製品 meishi-maker/hp-customizer の §1/§3・DB/認証/課金 マスター確定待ち（meishi-maker は別 agent が prototype 実装中）

**L**
- PC ディスク掃除残（agent-ag npm install 再構築・tmp 2GB/outputs 選別）
- 本体131件の別 agent 未 commit の整理（worktree 運用定着で今後混在解消）

## E. 配備済 subagent / skill / hook（本セッション追加分）

- なし（既存 new-product / checkout 使用・ADR-0003 と agent-rules 追記のみ）

## F. 本セッション生成レポート

- 本ファイル
- 前半分: `docs/session-reports/2026-06-21-checkout-new-products-toranoko.md`
- 新規ツール: `toranoko/scripts/build-toranoko.mjs` + `toranoko/server.mjs`

## G. 次セッション初手

1. 本ファイルを Read
2. 作業時は ADR-0003 の worktree 手順を使う（`.worktrees/<topic>`・本体経由 merge→push）
3. push 時 bot 競合に注意（rejected なら `git fetch && git merge origin/master` → 再 push）
4. 機械検証サマリ: シークレット混入 0 / 私領域の未 push 0
5. コードレビュー: スキップ（git 運用・doc・低リスク）
