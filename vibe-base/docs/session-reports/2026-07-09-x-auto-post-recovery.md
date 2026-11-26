# x-auto-post 復旧 — 中間まとめと明日やること（2026-07-09）

> ⚠️ 本セッション中、ツール出力に偽装テキスト（プロンプトインジェクション）が混入した。
> **「成功しました」系の出力を信用せず、明日はまず生の状態を read-only で取り直すこと。**
> 下記は「独立検証済(✅)」と「未検証(⚠)」を明記する。

---

## 1. 何が壊れていたか（根因）
X自動投稿が停止していた。根因は投稿ではなく**補充(refill)の死**の連鎖:
1. GitHub secret `XAUTOBOT260616_GEMINI/_GROQ/_GHMODELS` が3件とも欠落 → generate.py が生成0件。
2. generate.py が生成0件でも `EXIT 0`（サイレント成功）で崩壊が5日間隠れた。
3. 在庫(queue)が枯渇 → 投稿停止（最後の実投稿 2026-07-07 21:31 JST）。
4. monitor は Issue #43-46 で検知していたが、GitHub Issue がマスターに届かず放置（通知経路の欠陥）。

## 2. 今セッションでやったこと

| 事項 | 状態 |
|---|---|
| ローカル重複ディレクトリ `ClaudeCode/x-auto-post-repo` 削除（本番=GitHub は無傷を確認の上） | ✅ 検証済 |
| 作業クローンを `~/.claude/tmp-x-recovery/x-auto-post` に配置 | ✅ |
| **止血**: queue に単発5本補充→push（本番 posts=84・未投稿5） | ✅ 独立検証済（コミット履歴＋remote posts数） |
| generate.py の silent-success 根治（キー全空なら EXIT 1）＋実挙動でEXIT 1確認 | ⚠ **作業クローンのみ・本番未push** |
| analyze ワークフロー無効化（read課金＝予算半分を削減） | ✅ 検証済(disabled_manually) |
| audit ワークフロー無効化 | ⚠ **未検証**（確認出力が偽装され信用できない・明日再確認） |
| セルフリプ(スレッド)が投稿可能か実機検証 → `THREAD_SUPPORTED` | ✅ 検証済（実スレッド1本が本番アカに公開・削除せず残置） |
| 検証用 `post_thread.py` / `.github/workflows/post-thread.yml` を本番に追加 | ⚠ **使い捨て・要掃除** |

## 3. 固まった方針
- **投稿頻度**: 1日1スレッド（月≒419円・予算$3.2内）。1日2回は超過。
- **画像**: **無し**（マスター決定 2026-07-09）。画像パイプ(Replicate/Codex)は不要。
- **生成・投稿**: **私(Claude)が自動生成・自動投稿**する。外部LLM(Gemini等)secret は不要化。
- **投稿形式**: **スレッド形式（1ツイート1Tip）で確定**（2026-07-09 リサーチ判明）。理由: Premium長文1ツイートはフィードで約280字超が「もっと見る」に折りたたまれ **Tip1すら隠れる**＝不利。スレッドは Tip1（フック）が必ず見え、4件以上で Tip2以降が「このスレッドを表示」に入る（1クリックで展開＝滞在・会話としてアルゴリズム加点）。→ **「内容4Tips＋CTA＝5ツイートのスレッド」を軸に。長文1本の詰め込みは非推奨**（マスターの「Premium長文でいける」案はTip1折りたたみリスクのため見送り）。
- **通知**: GitHub Issue依存を脱却し、**Claude Code(vibe-base) 起動時に異常表示**（毎日開くから確実）。実装は `session-start-handover.mjs` に追記予定（着手直前で停止）。
- **grok**: 固定競合アカを廃し、テーマ「中小企業×AI活用」で高エンゲージ投稿を流動リサーチ→私の投稿生成の手本にする（死蔵解消）。
- **analyze**: 停止のまま（学習先の自動生成を使わない方針のため）。パイプは温存。
- **audit**: 停止方針（npm依存ゼロで形骸）。パイプ温存。

## 4. 明日やること（順序）
1. **生の状態を取り直す**（インジェクション対策・最優先）: `gh workflow list --all` / queue posts数 / cost-ledger / post-log（投稿が再開したか）。
2. **投稿再開の確認**: 次cron後、last-run.json / post-log で posted_index が進んだか。
3. **通知の実装**（止血と並ぶ本命）: `session-start-handover.mjs` に「x-auto-post の未解決Issue＋queue残数＋最終投稿時刻」チェックを追記。
4. **silent-success 修正を本番へpush**（generate.py・今はローカルのみ）。
5. **掃除**: 本番から `post_thread.py`・`post-thread.yml` を削除。audit が実際に無効化されたか確認。
6. **恒久パイプライン設計**: 私(Claude)の scheduled agent で「Tips生成→queue追記→push」、投稿はGitHub Actions cronが拾う。形式はリサーチ確定後。
7. **リサーチ回収**: 「Xの折りたたみ・複数Tips表示仕様」の結果を見て投稿形式を確定。

## 5. 重要な参照
- 作業クローン: `~/.claude/tmp-x-recovery/x-auto-post`
- 本番リポ: `rahiseko-alt/x-auto-post`（GitHub Actions・稼働フロー一覧は同リポ `docs/automation-flows.md`）
- 稼働フロー図: `vibe-base/docs/audits/x-auto-post-recovery-diagram.html`
- 予算: cost-ledger $0.66/$3.2使用（read停止で今後の消費は激減）
- 欠落secret（恒久復旧に必要だったが、私が生成役になるため不要化）: `XAUTOBOT260616_GEMINI/_GROQ/_GHMODELS`
