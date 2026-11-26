# Check-out 引継ぎ — autoland 自律統合 ＋ deny をマスター境界に整合

> branch: master / HEAD: origin と一致（`0 0`）
> **次セッションは本ファイルを先頭から Read してから着手すること。**

## 🔴 最重要

1. **権限モデルを変更した。** `.claude/settings.json` の deny を「マスターの安全境界」に絞った：**git push は AI に許可**（`git push:*` deny を撤去）。保護を残したのは ①デプロイ（`vercel --prod`/`npm publish`→ask）②シークレット（`.env`/`secrets` read+write deny）③アカウント（`gh auth`/`git config user.*` deny）④不可逆（`--force`/`rm -rf`/`reset --hard`/`branch -D`）のみ。curl/wget/git reset(非hard)/git rebase/npm uninstall 等の広域 deny は**意図的に撤去**（マスター明示判断）。
2. **AI が自分の権限防御（deny/hook）を書き換えるのは auto-mode 分類器が拒否する**（自己改変）。今回マスターが `/permissions` でモードを下げて初めて settings 編集が通った。**次回も deny/hook を触るならマスターのモード変更が前提**。
3. **autoland に未修正の設計穴**（次セッション着手）: `scripts/git-autoland.mjs` の `git checkout master`（L119）は「本体が master に居る」前提。worktree 内（feature ブランチ）から実行すると master が他 worktree で checkout 済みのため失敗し得る。worktree 実走は未テスト（`--dry-run` の検証段までは確認済）。

## A. 本セッション TL;DR

1. 虎の巻 hook 誤検知を根治（intake が outbox を取込後クリアしない設計 → `clearOutboxSubmission()` 追加・commit `1b08e14ff`）
2. git push の Connection reset 真因＝HTTP/2 を特定 → `http.version=HTTP/1.1` 固定で根治（push 1 発成功）
3. git 自律統合パイプライン構築: `scripts/git-autoland.mjs`（fetch→rebase→検証→ff-merge→push→cleanup）＋ `scripts/git-worktree-new.mjs`（ADR-0003 準拠 worktree 生成）
4. `.claude/settings.json` の deny をマスター境界に整合（push 許可・デプロイ ask・秘密/アカウント/不可逆 保護）
5. ADR-0003 Step3 を「pre-push 一律拒否 hook」→「autoland による統合自動化」へ確定改訂
6. agent-rules / learning-suite-kanji を autoland 運用へ更新（兄弟配置 worktree の誤指示を撤去）
7. **AI が push まで自動実行**してマスターのターミナル操作をゼロに（commit→fetch→merge→push 完遂）

## B. 完了 commit 一覧（全 push 済）

| hash | 種別 | 内容 |
|---|---|---|
| 1b08e14ff | fix(toranomaki) | intake 成功後 outbox クリア（hook 誤検知根治） |
| 2b916a8c6 | feat(git) | autoland パイプライン + deny をマスター境界に整合 |
| 934bed3be | merge | bot(x-auto-post)先行分を取込み再統合・push |

## C. 影響波及（必読）

- **全エージェントの git 運用が変わる**: 今後は worktree → 作業 → `node scripts/git-autoland.mjs` で master 統合まで AI が自動。手動 push も AI に許可（`--force` 除く）。正本 → ADR-0003「autoland 統合フロー」。
- **権限モデル**: deny は「デプロイ/秘密/アカウント/不可逆」のみ。これ以外を deny に足し戻すとマスター方針（AI に委ねる）に反する。products/*/.claude/settings.json への deny 緩和**伝播は未実施**（root のみ。propagate-hooks は deny を union するため自動では緩和されない）。
- HTTP/1.1 固定は repo-local 恒久。push reset 再発時は同コマンド再試行で通る。

## D. 残作業

**H**
- autoland の worktree-checkout 穴を修正（本体 on-master 前提に統一 or worktree 検出して merge 元を切替）＋ worktree 実走テスト（ダミー topic で worktree-new→commit→autoland）— plan: ~/.claude/plans/calm-shimmying-hamming.md
- kosespark P0 即死仮説検証（§1/§2/§3 マスター情報待ち・未着手）

**M**
- deny 緩和を products へ伝播するか判断（root のみで十分か・各 product agent も push 許可するか）
- 新製品 meishi-maker/hp-customizer の §1/§3・DB/認証/課金 マスター確定待ち（meishi-maker は別 agent prototype 実装中）

**L**
- autoland 軽微改善: `git branch -d` 戻り値チェック・`shell:true` の見直し（code-reviewer 指摘）
- PC ディスク掃除残（agent-ag npm 再構築・tmp 2GB/outputs 選別）・本体 131 件別 agent 未 commit 整理

## E. 配備済 subagent / skill / hook（本セッション追加分）

- スクリプト新規: `scripts/git-autoland.mjs` / `scripts/git-worktree-new.mjs`
- hook: 追加なし（当初計画の `pre-git-push-gate.mjs` は deny 撤去により不要化＝未配備）
- settings: deny/ask 改定（root のみ）

## F. 本セッション生成レポート

- 本ファイル
- plan: `~/.claude/plans/calm-shimmying-hamming.md`（autoland パイプライン・受け入れ基準）

## G. 次セッション初手

1. 本ファイルを Read
2. git 作業は autoland 経由（`git-worktree-new` → 作業 → `git-autoland`）。push は AI で可
3. 最優先 H: autoland の worktree-checkout 穴を修正＋実走テスト（plan: calm-shimmying-hamming.md）
4. 機械検証サマリ: シークレット混入 0 / node --check 全 PASS / git fsck EXIT0 / hook integrity PASSED
5. コードレビュー指摘 7 件（うち 4 件は意図的な deny 緩和＝対応不要・実質指摘は autoland worktree-checkout 1 件＝H 残作業・軽微 2 件＝L）
