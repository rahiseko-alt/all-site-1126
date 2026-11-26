# ADR-0003: git 運用を feature ブランチ + worktree に段階移行する

- Status: Accepted
- Date: 2026-06-21
- Deciders: マスター（小齊平 恒平）+ vibe-base 司令塔

## Context

vibe-base は毎セッション git で詰まる。典型的な詰まり方は次の連鎖である。

1. `git push` が rejected（リモートに bot 先行 commit がある）
2. `git pull --rebase` が「unstaged changes」で失敗（他エージェントの作業差分が working tree に常時混在・実測 119〜123 件）
3. `git stash` で退避してから rebase → push → `stash pop` という綱渡りを強いられる

根本原因は **「master 直 commit/push × 複数エージェントが単一 working tree / 単一 index を共有 × worktree・ブランチ分離なし」** の3条件が重なっていること。これは git が最も苦手とする構成で、世界標準（feature ブランチ＋作業ツリー分離）から外れている。前回（2026-06-21）A 肥大 / B 共有 index 肥大 / C 共有 index sweep を対症療法で根治したが、「ブランチを切らない運用そのもの」が残存原因として残っていた。

制約として、`products/x-auto-post/` の GitHub Actions 3本（post / analyze / refill）が github-actions[bot] で **master 直 push を日3回以上**行っている。これはリモートで完結し、ローカル作業とは別経路である。

## Decision

1. **bot（x-auto-post の GitHub Actions）は master 直 push のまま維持し、一切変更しない。** リモート完結でローカル作業と干渉しないため。
2. **人間/エージェントの作業だけを feature ブランチ + 専用 git worktree に分離する。** 各 worktree は独立した index / working tree を持つため、他エージェントの未 commit 差分が見えず、`git add`・`git status` が自分の差分しか対象にしない。master への取り込みは「`git fetch` → `git rebase origin/master` → 統合」の1点に局所化される。
3. **段階移行（1個ずつ試す）で進める。** 一括移行は走行中エージェントを壊すため禁止。
   - **Step 1**: 司令塔の作業1ケースを feature worktree で一周（作成→commit→master 統合→撤去）して検証する。← 本 ADR 起票はこの Step 1 のドッグフーディング成果物。
   - **Step 2**: 検証 OK なら各エージェントへ横展開し、命名規則・置き場所・撤去手順を `docs/ops/agent-rules.md` に正式化する。
   - **Step 3**: 横展開が一巡したら `pre-push` に master 直 push 拒否 hook を導入する（既存 git-lfs 行と共存・bot は GitHub Actions 経路でローカル pre-push を通らず無影響）。Step 3 を最後に置くのは、先に拒否 hook を入れると未移行のエージェントや ahead 状態の本体が即 push 不能になり詰まるため。

### 統合方法（再発防止・確定。Step1 分岐の教訓）

worktree の commit を master へ統合する際は、**PR 経由でなく、本体ローカル master で `git fetch && git merge <feature>` してから push する**（本体を必ず経由する＝分岐が構造的に起きない）。

- Step1 では feature を **PR 経由でマージし本体ローカル master を経由しなかった**ため、別 agent の本体直作業（kosespark webapp-mockup・homepage）と分岐した（共通祖先 `98ccb748`・origin +2 / 本体 +4）。`git merge origin/master`（merge commit `d076fff2c`・衝突ゼロ）で解消し push して `0 0` 復帰。
- やむを得ず PR を使った場合は、**マージ直後に本体で `git fetch && git merge origin/master` で必ず同期する**（同期忘れが分岐の唯一の原因）。
- 軽量 doc 更新は本体直 commit→即 push 可。重い実装作業は worktree で隔離し、最後に本体経由マージで統合する。

### 命名・配置規則（Step 1 実走で確定）

- ブランチ: `feature/<topic>-<yyyymmdd>`
- worktree 置き場所: **`vibe-base/.worktrees/<topic>`（本体配下）**。`.git/info/exclude` に `.worktrees/` を登録して本体 status から除外する。
  - 当初は本体の兄弟 `../vibe-base-<topic>` を想定したが、**`outside-vibe-base-gate` hook が vibe-base 外パスへの編集を全ブロックする**ため断念（Step 1 で実証）。配下に置くことで hook を回避しつつ隔離を維持する。
- 起点: `origin/master`（bot 最新を含み、本体の未 push ahead を含まないクリーン起点）
- staging: `git add -- <明示パス>`（`-A`/`.`/`-a` 禁止・既存 `pre-git-staging-gate` と整合）

## Consequences

**良い:**
- push 衝突が消える（feature ブランチは bot が触らない）
- unstaged 混在の綱渡り（path-scoped staging / stash 退避）が不要になる
- 他エージェントの作業を物理的に巻き込めなくなる（index 独立）

**悪い / コスト:**
- worktree の作成・撤去という運用手順が増える
- 作業ツリーが複製される（.git オブジェクトは共有のため約4.1GB は複製されないが、products 等のツリーは複製される）
- `outside-vibe-base-gate` hook との両立のため worktree を本体配下に置く必要がある（兄弟配置は不可）

**中立:**
- bot は従来どおり master 直 push を継続。人間の feature→master 統合は統合直前の `git fetch` + `git rebase origin/master` で bot 先行分を取り込む

## 関連

- `docs/ops/agent-rules.md` — Step 2 で worktree 運用節を正式化（現状は「単一 working tree 共有 + path-scoped add」前提）
- `products/learning-suite-kanji/CLAUDE.md` — 既存の worktree 提案記述は本 ADR へのポインタに統合（重複定義解消）
- `.claude/hooks/pre-git-staging-gate.mjs` — worktree 下でも path-scoped 強制を維持
- `.claude/hooks/`（outside-vibe-base-gate）— worktree は本体配下に置くことで両立
- 旧根治記録: `docs/session-reports/2026-06-21-checkout-git-resilience.md`（A/B/C 対症療法）

## Step 3 確定仕様（2026-06-22 改訂）— autoland による統合自動化

当初の Step 3 案「`pre-push` で master 直 push を一律拒否する hook」は撤回した。理由は 2 点:

1. 統合方法（本節上記）が「本体ローカル master で push」である以上、master 直 push 自体が正規手順であり、一律拒否は正規統合まで止めてしまう。
2. マスターが安全境界を「①勝手にデプロイしない ②シークレット漏らさない ③アカウント情報を触らない」と明確化（2026-06-22）。**git push（コードを GitHub に上げる行為）はデプロイではない**（CI 自動デプロイ無しを確認済）ため、AI に委ねてよい。`.claude/settings.json` の deny からも `Bash(git push:*)` を撤去し、`--force`/`reset --hard`/秘密/アカウント/不可逆のみを deny、デプロイ（`vercel --prod`/`npm publish`）は ask に移した。

代わりに **autoland（`scripts/git-autoland.mjs`）で統合品質を担保**する。これは hook による「禁止」ではなく、スクリプトによる「正しい統合手順の自動実行」である。

### autoland 統合フロー

1. `node scripts/git-worktree-new.mjs <topic>` — `feature/<topic>-<yyyymmdd>` を `.worktrees/<topic>` に作成（起点 origin/master）。
2. worktree 内で作業し path-scoped commit（`git add -- <明示パス>`）。
3. `node scripts/git-autoland.mjs` — **fetch → rebase origin/master（衝突時 abort・master 不変）→ 機械検証（git fsck・変更 js の node --check・lint/build があれば実行）→ ff-only merge → push → feature ブランチ削除** を自動実行。`--dry-run` で検証まで（master 不変）。
4. `git worktree remove .worktrees/<topic> && git worktree prune` で撤去。

これにより、マスターはターミナルで git を操作せず、AI が autoland で統合まで完遂する。bot（x-auto-post）は従来どおり不可侵。push が bot 先行で rejected された場合は fetch して autoland を再実行（rebase からやり直し）すれば取り込まれる。
