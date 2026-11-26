# Check-out 引継ぎ — ガバナンス監査 + hook 検知死角の完全解消（2026-06-17 第2セッション）

- branch: master / 最新 commit 70799622（本セッション最終）
- 次セッションは本ファイルを先頭から Read してから着手すること。

## 🔴 最重要

1. **hook 検知死角を完全解消した**。直接登録の3 hook（pre-edit.sh / post-bash.js / post-write.sh）を hook-runner 経由化し、全26 product へ伝播。今後この3 hook が故障すれば exit 1 が jsonl に記録され check-in A-22 が検知する。
2. **検知器が次の故障を即捕捉**: instagram-auto-ops の `checkin-hook.mjs`（SessionStart hook・旧名 drift-checkin）が**毎起動で exit 1 クラッシュ**＝ドリフト監視が静かに機能停止中。根因調査は次セッションの最優先（product 領域）。failures.md に [S] 登録済。
3. **shift-ai stale セッションは解消済**（マスターが再起動）。pc-version-gate/area-gate の exit 1 は再起動前 11:10 が最後。新セッションは clean。

## A. 本セッション TL;DR

- 司令塔チェックイン → Vercel hardening（agent-ag→portfolio リネーム/lab alias Remove/Git非連携確認）完遂・memory 記録。
- 内部監査（公式 code.claude.com 2026-06 + GitHub をベンチマーク）実施 → 総合 7.5/10（ノウハウ8・運用適正度7）。設計は公式並走、弱点は「書いた≠効いている」実効ギャップ。レポート: `docs/session-reports/2026-06-17-vibe-base-maturity-audit.md`。
- 監査の投資施策を実装: 施策1（failures→機械検証 昇格選別 mark + `scripts/failures-coverage.mjs` + check-in A-21）/ 施策2（hook 実行時故障検知 `scripts/check-hook-runtime-errors.mjs` + check-in A-22）。施策3（脆弱）・施策4（対象不在）は精査の上 正直に却下。
- 施策2 が即座に shift-ai の stale セッション故障（pc-version-gate/area-gate exit1 計372件）を発見。
- 検知の前提となる「全 hook の hook-runner 経由化」の死角（直接登録3 hook）を Plan Mode で計画 → 承認 → 完全実装（本セッションの主成果）。drift-checkin 命名不一致（整合性ゲート RED）と post-write.sh 旧パス drift も同時除去。check-hook-integrity PASSED。

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| 584ec9de | chore | Vercel hardening 完了記録（memory） |
| 77488572 | feat | 施策1 failures昇格選別 + 施策2 hook実行時故障検知 |
| 4c43ae9d | docs | stale session の hook 非伝播教訓を failures 登録 |
| 70799622 | fix | 3 hook を hook-runner 経由化（検知死角解消）+ drift-checkin 整合 + post-write 旧パス修正（48ファイル） |

## C. 影響波及

- 全26 product の `.claude/settings.json`（hooks ブロック）+ `post-write.sh` が更新（propagate-hooks 経由・正本=ルート settings.json）。
- check-hook-integrity が GREEN 化（drift-checkin → checkin-hook 命名整合で wrapper mismatch 解消）。
- ログ識別名: drift-checkin → **checkin-hook** に変更（実体 basename と一致させた）。

## D. 残作業

- **[H]** `checkin-hook.mjs`（instagram-auto-ops drift）が毎 SessionStart で exit 1 クラッシュ。根因調査・修正（product 領域）。検知: `node scripts/check-hook-runtime-errors.mjs --list`。
- **[M]** PC高速化ディスク掃除の残り（本セッションでマスター中止判断）。runbook: `docs/ops/plans/2026-06-17-disk-cleanup.md`。
- **[L]** check-hook-integrity (e) wrapper 照合を .sh/.js 対応へ拡張（共有パース改変リップル risk・現状 .mjs のみ照合）。
- **[L]** 施策1 failures 分類の継続キュレーション（現 [S✓]9 / [S]残3 / [M]80）。
- **[L]** kosespark P0 立ち上げ（マスター情報待ちでブロック継続）。

## E. 配備済 subagent / skill / hook

- 新規 script: `scripts/failures-coverage.mjs`（施策1）/ `scripts/check-hook-runtime-errors.mjs`（施策2）。
- check-in-verify.sh: A-21（failures カバレッジ報告）/ A-22（hook 実行時故障スキャン）を追加。
- hook 本体の新規追加なし（既存3 hook のラッパ化のみ）。

## F. 本セッション生成レポート / 成果物

- `docs/session-reports/2026-06-17-vibe-base-maturity-audit.md`（公式ベンチ採点・7.5/10）。
- `~/.claude/plans/flickering-chasing-raccoon.md`（死角解消 plan・承認済）。
- `tmp/hook-wrap/`（settings.json/post-write.sh の修正版スクラッチ・byte正確cp用・破棄可）。

## G. 次セッション初手

1. 本ファイルを Read。
2. 最優先 D[H]: `checkin-hook.mjs`（instagram-auto-ops）の exit 1 根因調査。CLI 単体起動 `echo '{}' | node products/instagram-auto-ops/drift/checkin-hook.mjs` で再現。
3. 機械検証サマリ（本セッション）: M1-M4 全 PASS / check-hook-integrity PASSED / secret-grep 0件 / 全 spec green（settings 19PASS）。
4. コードレビュー指摘: N/A（成果は config/script で commit 済・check-hook-integrity と check-in 機械検証で代替）。
5. check-in 既存 NG（本件無関係）: E-1 product memory.md 15行超 6件 / D-3 runbook 不在 11件。別タスク。
