# 2026-07-09 Check-out — x-auto-post スレッド投稿ランタイム本番投入

> branch: x-auto-post は独立repo `rahiseko-alt/x-auto-post`（HEAD: f15cdcfe push済）／本セッションは vibe-base 司令塔
> **次セッションで本ファイル先頭から Read 必須**

## 🔴 最重要

1. **x-auto-post は本番稼働中に切り替わった**（旧・単発投稿 → 3本スレッド・1日2回 8:00/20:00 JST）。**最初の実スレッド投稿は 2026-07-09 20:00 JST（議事録スレッド）**。実口座・実課金。
2. **残存リスク（未根治・要注意）**: 投稿成功後に GitHub Actions の `git push` が全リトライ失敗すると、posted_index 前進がリモートに残らず**次回同一スレッドを再投稿**する。push リトライ(rebase)＋job失敗時Issueで緩和済だが根治は「状態をgit共有JSONから外す」持続可能版（D-1）。
3. **検知(Telegram)は未実装**（マスター指示で後回し）。今の異常通知は GitHub Issue のみ＝オーナーに届きにくい。投稿が止まったら気づけない状態。
4. **補充は無人化されていない**。queue に3本スレ6本＝約3日分。**~2026-07-12 までに補充**しないと枯渇（refill workflow は無効化済）。

## A. 本セッション TL;DR

1. 「投稿が止まった」と誤診（古い fetch を見た）→ 実際は7/9 09:15 JST に投稿成功済で正常だった。生状態を read-only 再取得して確定。
2. マスター指示で「①根本原因を潰す ②持続可能 ③確実に感知/復旧」の3条件を満たす方式を外部リサーチ（GitHub Actions cron信頼性/Dead Man's Switch/Telegram/fail-closed）。plan: `~/.claude/plans/snug-launching-cook.md`。
3. スレッド投稿ランタイムを実装（post.py 全書換）: 単発/2段(self_reply)/N段(thread_items)対応。全ツイート成功時のみ posted_index 前進。途中失敗は thread-state.json に pending 保存し次回 root 再投稿せず再開。
4. workflow: 1日2回(JST 8:00/20:00)化・concurrency 直列化・commit if:always()・push rebase リトライ・timeout 10分。
5. code-reviewer 2周で重複投稿経路を検出→全閉塞/緩和（並列実行・状態保存順序・checksum衝突・id欠落・push失敗）。テスト全green（test_self_reply_threading 5/5 で途中失敗→再開の root 非再投稿を実証）。
6. 中小企業×AI活用の3本スレッド6本を生成（各tweet 140字ぎりぎり・折畳なし）→ queue 投入。
7. クリーンクローンから本番 push（f15cdcfe）。reply/refill workflow を無効化（コスト超過回避・壊れ排除）。
8. 本番CI で DRY_RUN 空撃ち検証成功（新queue読込→3本スレ展開→実投稿ゼロ）。
9. コスト: 3本×2回/日=6投稿/日 → 月 ≈ $2.79（¥432）< 上限 $3.2。

## B. 完了 commit 一覧（rahiseko-alt/x-auto-post）

| hash | 種別 | 内容 |
|---|---|---|
| f15cdcfe | feat | スレッド投稿ランタイム＋1日2回化＋重複投稿防止＋6本投入＋使い捨て掃除 |

## C. 影響波及

- **投稿形式が単発→スレッドに変わった**（公開アカで可視の変化）。
- reply（自動返信）・refill（LLM補充）workflow を無効化。reply=コスト、refill=壊れ＋Claude生成へ置換方針。analyze は既存無効のまま。
- 作業クローン `~/.claude/tmp-x-recovery/x-auto-post` は9コミット遅れ＋dirty（generate.py の silent-success 修正が未push）。本番 push はクリーンクローン `~/.claude/tmp-x-recovery/x-live-07091213` から実施。
- vibe-base 側は別セッションが portfolio/job-applications を並行編集中。本 checkout は memory.md + 本report のみ path-scoped commit（他は不干渉）。

## D. 残作業

### 優先度 H
- **D-1 持続可能版の根治**: 複数workflowが同一gitのJSON状態を共有する構造脆弱性（push失敗→再投稿）。状態をgitから外す or per-file化。plan: `~/.claude/plans/snug-launching-cook.md`
- **D-2 補充の無人化**: Claude 定期生成→queue→push（scheduled routine 等）。~7/12までに手動補充 or 仕組み化。
- **D-3 検知(Telegram)**: Dead Man's Switch(Healthchecks.io)+Telegram で「止まった」を確実に届ける。マスター指示で後回し中。BotFather でBot作成→トークン受領が着手条件。

### 優先度 M
- generate.py の silent-success 修正（作業クローンに未push）を、refill 復活時に反映。
- 作業クローンの整理（dirty な tmp-x-recovery/x-auto-post と x-live-* の後片付け）。

## E. 配備済 subagent / skill / hook

なし（既存 code-reviewer を利用・2周）。

## F. 本セッション生成レポート

- `~/.claude/tmp-x-recovery/x-live-07091213/ops/thread-drafts-2026-07-09.json`（生成した6スレッドの正本・repoにcommit済）

## G. 次セッション初手

1. 本ファイルを読む
2. 🔴最重要2（push失敗→再投稿リスク）と4（補充~7/12）を確認。20:00 JST 初回投稿がX実アカで出たかを `gh run list --workflow=x-auto-post.yml --repo rahiseko-alt/x-auto-post` と実アカで確認
3. 機械検証: secret検出0件・x-repo テスト全green（threading 5/5・metadata 3/3・reply 11/11）・本番CI DRY_RUN success
4. コードレビュー: code-reviewer 2周、重複投稿の blocking 経路は全て閉塞/緩和済（残 advisory=D-1 の構造根治）
