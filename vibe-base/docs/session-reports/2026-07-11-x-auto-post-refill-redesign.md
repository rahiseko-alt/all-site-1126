# 2026-07-11 — x-auto-post 補充無人化 再設計plan実装（Step1〜6完了・Step7でブロック中）

> branch: x-auto-post は独立repo `rahiseko-alt/x-auto-post`（HEAD: f16d1076 push済）／本セッションは vibe-base 司令塔
> **次セッションで本ファイル先頭から Read 必須**

## 🔴 最重要

1. **承認済み plan `~/.claude/plans/iridescent-honking-squid.md` の Step1〜6は完了・push済み。Step7で実行がブロックされ、マスター判断でここで停止した。** 無理に迂回・force・別方式への切り替えはしていない。
2. **ブロックの原因はx-auto-postリポジトリ自身の`.claude/settings.json`にある`"Bash(git push:*)"`という広域deny。** routineの正当なpush（`claude/refill-*`ブランチへの、force無し・rebase無し）まで一律で拒否している。
3. **この広域denyは意図的な再強化ではなく、07-06のflatten作業（commit `7e3e6055`）で誤って巻き戻された回帰の可能性が高い。** commit `2b916a8c`で「denyから`git push:*`等の広域禁止を撤去（pushをAIに委譲）。`--force`/`reset --hard`等の危険系のみ保護維持」と明記して撤去済みだった（vibe-base側ADR-0003と同じ方針）のに、flatten時に別テンプレートの設定が混入したとみられる。該当セッションレポート（`2026-07-06-checkout-2.md`）にこの変更への言及・意図的な再強化の記録はない。
4. **マスターへ「`--force`/`-f`のみdenyに絞り直してよいか」を確認しようとしたところ、マスターが「無理に進めるな、詰まるならここで終わり」と明示的に判断。** settings.jsonへの変更は一切行っていない。次に着手する時は、この deny 方針をどうするかをマスターと決めてから動くこと。

## A. 本セッション TL;DR

1. `/pc-checkin` → x-auto-postディレクトリ（vibe-base側）が空で自治憲法・memory.mdが無いことを発見。実体は別リポジトリ`rahiseko-alt/x-auto-post`、作業クローンは`~/.claude/tmp-x-recovery/`配下という構造を確認。
2. 過去1週間の意思決定を洗い出し（`gh issue list`で放置Issue7件を発見・根拠コメント付きでクローズ）。
3. 承認済み再設計plan`iridescent-honking-squid.md`（前版が日付キー衝突で3回破綻→内容ハッシュ+セッションID方式へ作り直し）のStep1〜6を実装:
   - Step1: 残骸ファイル`ops/thread-drafts-2026-07-09/10.json`を削除（`ops/drafts-archive/`に同一内容ありJSON意味比較で確認済み）
   - Step2: `studio/append_threads.py`に`--allow-empty`追加。使い捨てクローンで「追記0件→EXIT0」「品質不合格→allow-emptyでもEXIT1維持」を実測検証
   - Step3: `ops/refill-routine.md`全面書き直し（草稿名を`ops/drafts/<sha256先頭12桁>.json`、ブランチ名を`claude/refill-<CLAUDE_CODE_REMOTE_SESSION_IDの英数部>`に変更）
   - Step4: `.github/workflows/refill-merge.yml`全面書き直し（「masterに同名ファイルがあるか」判定を全廃、`append_threads.py --allow-empty`の冪等性のみに依存、最大5回のrebaseリトライ追加）。使い捨てクローン+ローカルbare originで6シナリオ実走検証（正常投入・冪等重複防止・不正ブランチ名拒否・許可外ファイル拒否・他ジョブ非消失・posted_index不変）
   - Step5: 検証パネル（code-reviewer + security-reviewer）実施。**code-reviewerがblocking 1件検出**（孤立ブランチ混入で`set -e`によりジョブ全体がabortし他ブランチが未処理・FAILED_BRANCHES記録も消える）→修正→孤立ブランチ+正常ブランチ混在シナリオで再現・修正確認→再レビューでPASS。security-reviewerはblocking 0件（advisory数件のみ）
   - Step6: マスター確認の上、`rahiseko-alt/x-auto-post`のmasterへpush（`de7cf8ed..f16d1076`、5コミット）
4. Step7（routineを手動で1回実行）をマスターに依頼。routine自体は正しく動作: 在庫11本を検知→6本の草稿生成→`--dry-run`でEXIT0確認→ローカルcommit（草稿1ファイルのみ、`queue.json`未編集）→ブランチ`claude/refill-cse0168gudwe8ivfe8ooefmqcsd`作成。**しかし`git push`が環境のパーミッションポリシーによりハード拒否**。routineは規約通り（force push/rebaseで迂回せず中止して報告）に停止し、正しくフェイルセーフに振る舞った。
5. 原因調査: x-auto-postリポジトリの`.claude/settings.json`のdenyに`"Bash(git push:*)"`（無条件）があることを特定。git log調査で、この広域denyは一度撤去されたのに flatten で回帰した可能性が高いと判明。
6. マスターに「`--force`/`-f`のみへ絞り直してよいか」を確認しようとしたところ、マスターから「無理に進めるな、詰まるならここで終わり」と明示の指示。settings.json変更・別方式の模索を含め、これ以上の対応はせず本レポートの作成に切り替えた。

## B. 完了 commit 一覧

### x-auto-post（独立repo・master・push済）

| hash | 種別 | 内容 |
|---|---|---|
| d31d0f99 | chore | 日付ベース草稿の残骸を削除（Step1） |
| e83b2d0b | feat | append_threads.py に --allow-empty を追加（Step2） |
| 4a744c0e | docs | refill-routine.md を内容ハッシュ+セッションID方式に全面書き直し（Step3） |
| 10f06fa1 | feat | refill-merge.yml を内容ハッシュ+セッションID方式に全面書き直し（Step4） |
| f16d1076 | fix | 孤立ブランチ混入時のジョブ全体abortを防止（Step5・検証パネルblocking対応） |

### vibe-base（master）

| hash | 種別 | 内容 |
|---|---|---|
| （本 commit） | chore | 引継ぎレポート + memory.md P1 更新 |

## C. 影響波及

- **`rahiseko-alt/x-auto-post`のmasterは既にStep1〜6の内容で更新済み。** 投稿(daily)・監視(monitor)への影響はゼロ（`queue.json`の既存entry・`posted_index`・`post.py`の投稿ロジック・`X_API_*` secret・`studio/monitor.py`はいずれも無変更）。
- **補充(refill)パイプラインは「push が通れば正しく動く」ところまで完成しているが、実際に1回通して検証(Step7・8)するところで止まっている。** 在庫は13本、枯渇見込みは7/17夜のまま変わらず。
- routineが今回生成した6本の草稿（`ops/drafts/90eacbdb5fc6.json`相当、ブランチ`claude/refill-cse0168gudwe8ivfe8ooefmqcsd`）は、routineを実行したCCRサンドボックス内にのみローカルcommitとして存在し、push未了のため**そのサンドボックスが破棄されると失われる**。ただしpushが通るようになれば同じ手順で再生成は容易（既存のqueue.jsonやposted_indexには一切影響していない）。

## D. 残作業

### 優先度 H（マスター判断待ち・AIは提案のみで独断で変更しない）

- **x-auto-postの`.claude/settings.json`の`"Bash(git push:*)"`（広域deny）をどう扱うか。** 選択肢:
  1. `--force`/`-f`のみdenyに絞り直す（vibe-base側ADR-0003・commit`2b916a8c`の既定方針と統一）
  2. 別の方式を検討する（settings.jsonは触らず、routineの成果物をpush以外の経路でmasterに載せる等）
  3. 補充無人化そのものを一旦保留し、手動補充（`studio/append_threads.py`を人が実行）で7/17夜の枯渇を回避する運用に戻す
- 上記が決まるまで、Step7（routine手動実行）・Step8（refill merge手動実行）は**着手不可**。

### 優先度 M（変更なし・plan記載のまま）

- `x-auto-post-refill.yml:50`と`feed-check-broadcast.yml:39`の`git push`にrebaseリトライが無い（既知の穴・本件スコープ外）
- `queue_store.save_queue`がatomic renameでない
- `append_threads.py`の冪等キーはroot bodyのみ（thread_items差分の草稿はskipされる・fail-safe方向）
- dedupが完全一致文字列判定のみ（近似重複を検出できない）
- X自動返信のX社事前承認取得有無（未確認・マスター確認要・最優先のまま）

## E. 配備済 subagent / skill / hook

- 本セッションで新規追加した hook・skill・subagentはなし。code-reviewer / security-reviewer を検証パネルとして通常呼出（x-repoクローンに対して）。

## F. 本セッション生成レポート

- 本引継ぎMD: `docs/session-reports/2026-07-11-x-auto-post-refill-redesign.md`
- 使い捨てリハーサルスクリプト: `~/.claude/tmp-x-recovery/rehearse4.sh`（正常/冪等/不正ブランチ名/許可外ファイル/他ジョブ非消失シナリオ）・`rehearse5.sh`（孤立ブランチ混入シナリオ）。実行後の使い捨てbare origin/クローンは都度削除済み。

## G. 次セッション初手

1. 本ファイルを読む
2. 🔴最重要4（deny方針の選択肢3つ）をマスターに確認してから着手する。**マスター判断が無いままsettings.jsonを変更しない。**
3. 方針が決まったら、Step7（routine手動実行）→Step8（refill merge手動実行）を再実行。plan `~/.claude/plans/iridescent-honking-squid.md`のG節「次セッション初手」も参照
4. 機械検証: `gh secret list --repo rahiseko-alt/x-auto-post`・`git log rahiseko-alt/x-auto-post`のHEADが`f16d1076`以降であることを確認してから着手する

## H. 本セッションで踏んだ失敗（再発防止）

1. **settings.jsonの広域denyという構造的ブロックの存在を、plan策定時・Step6のpush前に検知できなかった。** Step7で実際にrountineを走らせて初めて判明した。→ 次回以降、GitHub Actions以外の実行主体（scheduled routine等）が絡むplanでは、実装着手前に対象repoの`.claude/settings.json`のdeny一覧も事前確認すべき。
2. **マスターへの確認（AskUserQuestion）が「詰まったらどう解決するか」を前提にした質問になっており、「詰まったらここで終わってよい」という選択肢を用意していなかった。** マスターから明示的に指摘を受けて是正した。→ ブロッキングな問題に直面した時の確認は、解決策の選択だけでなく「無理に進めず一旦停止する」ことも常に選択肢に含めること。
