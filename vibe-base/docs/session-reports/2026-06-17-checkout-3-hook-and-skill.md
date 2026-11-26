# Check-out 引継ぎ — checkin-hook 漏洩根治 + checkout 二重化解消（2026-06-17 第3セッション）

- branch: master / 本セッション最終 commit 908a2a5e
- 次セッションは本ファイルを先頭から Read してから着手すること。

## 🔴 最重要

1. **checkin-hook 全 product 漏洩を根治した**（commit 523e83df）。前セッションの改名（drift-checkin→checkin-hook）で propagate-hooks の除外リスト `ROOT_ONLY_HOOK_NAMES` が旧名のまま取り残され、checkin-hook が全22 product の settings.json に漏洩し毎 SessionStart で MODULE_NOT_FOUND exit 1 を量産していた。除外リストを同期し再伝播で除去。`/products/` を root 基準参照する hook が除外未登録なら propagate を停止する**再発 guard** を追加。
2. **checkout の二重化を解消した**（commit 908a2a5e）。checkout は「スキル1 + 陳腐化コマンド15」の二重構造で、コマンド版が HTML レポート生成等の現行スキル（MD固定）と矛盾する指示を抱えていた。コマンド15個を全削除し、`~/.claude/skills/checkout/SKILL.md` を単一正本化。`/checkout` は user-invocable スキルに解決され機能継続（本セッションの本 Check-out 自体がスキル発火で実証済み）。
3. **stale shift-ai セッションはマスター再起動で解消済**。再起動後 pc-version-gate/area-gate の新規 exit=1 ゼロを確認。

## A. 本セッション TL;DR

- セッション開始 check-in → 検知器が shift-ai stale 故障（pc-version-gate 等）と checkin-hook 故障を捕捉。
- ② stale shift-ai: マスター再起動で解消確認（pc-version-gate/area-gate 新規 exit1 ゼロ）。
- ① checkin-hook 故障の根因を実証（cwd 依存 → 真因は propagate 除外リストの名前不一致による全 product 漏洩）。Plan Mode → 承認 → 根治（除外リスト同期 + 再発 guard + 再伝播）。M1-M6 検証（M6 のみ既存 E-1 起因で EXIT1・本変更無関係）。
- 別件: checkout スキルが2個（スキル + コマンド）→ 慎重分析（再生成経路/存在前提ゲート/発火機構を事前確認）→ Plan Mode → 承認 → コマンド15削除でスキル単一正本化。M1-M5 全 PASS。

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| 523e83df | fix | checkin-hook 全product漏洩を根治（除外リスト名前同期 + 再発guard・24ファイル） |
| 908a2a5e | refactor | checkout 二重化解消（陳腐化コマンド14削除 + git-ignore分1件 rm） |

> 注: e73c4656 / 9d0db681 は**並行セッション（agent-ag dive-test）の commit**であり本セッション成果ではない。

## C. 影響波及

- 全 product の `.claude/settings.json` から SessionStart の checkin-hook エントリが除去（漏洩0）。root settings.json は据置（司令塔で正常解決）。
- propagate-hooks.mjs に `assertRootOnlyHooksCovered` guard 追加 → 今後 hook 改名で `/products/` 参照 hook の除外漏れが起きると propagate が即停止。
- checkout コマンド（vibe-base + 14 product）消滅 → `/checkout` はスキルのみで発火。

## D. 残作業

- **[H]** kosespark P0 立ち上げ。§1/§2/§3 がマスター情報待ちで実装着手不可。即死仮説「素人が Claude Code を使える」実機検証まで他フェーズ禁止。plan: なし。
- **[M]** PC ディスク掃除の残り（本セッション以前にマスター中止判断）。plan: `docs/ops/plans/2026-06-17-disk-cleanup.md`。
- **[L]** check-in E-1: product memory.md 15行超 6件（code-review-skills/homepage/instagram-auto-ops/kosespark/shift-ai/writer-auto-ops）圧縮。check-in-verify が EXIT1 になる既存要因。plan: なし。

## E. 配備済 subagent / skill / hook

- 新規 hook/script なし。既存 `scripts/propagate-hooks.mjs` に再発 guard 関数を1つ追加したのみ。
- checkout コマンド15個を削除（スキル本体 `~/.claude/skills/checkout/SKILL.md` は無編集で正本）。

## F. 本セッション生成レポート / 成果物

- `~/.claude/plans/flickering-chasing-raccoon.md`: 本セッションで2回使用（checkin-hook 根治 plan → checkout 統合 plan に上書き・両承認済）。
- 本ファイル（引継ぎ）。第1/第2セッション分は `2026-06-17-checkout.md` / `2026-06-17-checkout-2-governance.md`。

## G. 次セッション初手

1. 本ファイルを Read。
2. 最優先 D[H]: kosespark P0（マスター情報が揃っているか確認 → 揃えば即死仮説検証、未了ならブロック継続）。
3. 機械検証サマリ（本セッション）: checkin-hook 根治 M1-M5 PASS / checkout 統合 M1-M5 PASS / secret-grep 0 / コードレビュー no issues。
4. check-in 既存 NG（本件無関係）: E-1 product memory.md 15行超 6件 / D-3 runbook 不在 11件。
5. 注意: 作業ツリーに並行セッション（agent-ag）の差分が混在。コミットは必ずパス限定で。
