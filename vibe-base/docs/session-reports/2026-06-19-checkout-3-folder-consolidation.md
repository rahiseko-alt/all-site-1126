# Check-out 引継ぎ — vibe-base 2フォルダ分裂の統合（2026-06-19・3本目）

- branch: master / 本セッション commit（vibe-base）= `f9329b43`→`364c4127`→`480f2862`→`40c9a4ee`→`f3f64191`（全 push 済）
- 次セッションは本ファイルを先頭から Read してから着手すること。

## 🔴 最重要

1. **デスクトップの vibe-base は本物1つ（`C:\Users\user\Desktop\ClaudeCode\vibe-base`）に統合完了**。旧 A（`Desktop\vibe-base`・git管理外）はマスターが `Desktop\倉庫\old-desktop-vibe-base-20260619` へ**リネーム退避**済（削除でなく可逆）。
2. **倉庫の退避物は当面残す**。ymm 等が ClaudeCode 側で正常動作すると確認できてから、マスターが後日削除（本セッションでは削除しない＝観察タスクは memory に書かない方針）。
3. A への再発参照（git hooksPath / ymm-shorts py / .codex hooks / 各 docs の旧パス）は全遮断済。今後 A 復活経路なし。

## A. 本セッション TL;DR

1. デスクトップに vibe-base が2つ（A=`Desktop\vibe-base` git管理外 / B=`Desktop\ClaudeCode\vibe-base` 正本）存在し重複＋乖離。サブ3体で構造リサーチ。
2. 実地検証で判明: A は B の2-3%しか持たない殻＋固有実験2件＋DB残骸。調査エージェントの「壊れ参照」報告は誤判定（要自前検証）。
3. **救出**: A 固有の `agent-ag/sudowrite-clone`(19・手作りReactエディタ) と `agent-ag/dive-test-run`(8・独自WebGL) を B へ救出し `.gitignore` 例外で git 追跡化（agent-ag は本来 scratch 無視領域）。
4. **遮断**: git `core.hooksPath`(A指し) を unset→既定B（保安hook pre-commit 復活＋lfs温存）。ymm-shorts py/docs・B全実行系・.codex hooks の旧パス `Desktop\vibe-base` を `Desktop\ClaudeCode\vibe-base` へ是正（実行系残0）。
5. **除去**: マスターが A を倉庫へリネーム退避（救出・遮断完了後）。
6. 教訓3件を記録（master-instruction-patterns D-2 / failures.md ×2）。
7. push 時 LFS lock 検証が TLS timeout → `lfs...locksverify false` 設定で回避し push 完了。

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| `f9329b43` | fix | sudowrite救出+B全docの旧パス遮断（29file） |
| `364c4127` | fix | ymm-shorts 旧パス遮断（24file） |
| `480f2862` | fix | .codex hooks 旧パス遮断（2file） |
| `40c9a4ee` | fix | dive-test-run 独自版救出（8file） |
| `f3f64191` | docs | 教訓記録（D-2/failures ×2） |

## C. 影響波及

- B `.git/config`: core.hooksPath を unset（既定 .git/hooks）。lfs hooks 再生成＋pre-commit 保安hook が復活（従来 A 参照で無効化されていた）。`lfs.https://...locksverify=false` 設定済（GitHub 非対応 lock API の TLS timeout 回避）。
- `.gitignore`: agent-ag scratch 無視に対し `!agent-ag/sudowrite-clone/` `!agent-ag/dive-test-run-A-variant/` の追跡例外2件を追加（救出物のみ追跡・他 scratch は無視維持）。
- 救出物の配置: B/agent-ag/sudowrite-clone（実体）/ B/agent-ag/dive-test-run-A-variant（B 既存 dive-test-run と別保存・上書きせず）。

## D. 残作業

- **[L][マスター]** 倉庫 `old-desktop-vibe-base-20260619` の最終削除（ymm 等が ClaudeCode 側で正常動作と確認後・任意時期）。
- **[H]** kosespark P0 立ち上げ（§1/§2/§3 マスター情報待ち・継続）。plan: なし。
- **[M]** PC ディスク掃除の残り。plan: `docs/ops/plans/2026-06-17-disk-cleanup.md`。

## E. 配備済 subagent / skill / hook

- 新規 hook/skill なし。`.gitignore` に追跡例外2件追加。git config（hooksPath unset / lfs locksverify）変更。

## F. 本セッション生成レポート / 成果物

- `~/.claude/plans/3-memory-md-product-serene-thunder.md`: 本作業 plan（承認済・2フォルダ統合版に上書き）。
- 本ファイル（引継ぎ）。

## G. 次セッション初手

1. 本ファイルを Read。
2. 倉庫退避物の扱い（残作業 D[L]）をマスターに確認（不要なら触らない）。
3. 最優先 D[H]: kosespark P0。
4. 機械検証サマリ（本セッション）: 全実行系の A 参照=0 / sudowrite 19・dive-test-run-A-variant 8 が git 追跡 / hooksPath 既定B / check-in EXIT0・NG0 / secret 0 / verify-agent 全AC PASS。
5. 注意: 並行セッションが同一 working tree を実時間で編集する環境では、救出/修正は**即コミット**（本セッションで merge による未コミット revert 事故あり）。
