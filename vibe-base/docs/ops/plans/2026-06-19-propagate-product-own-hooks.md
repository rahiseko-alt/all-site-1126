# plan: propagate-hooks.mjs に product 固有 hook 保持を追加 + x-auto-post トンマナ hook 復元

> 種別: 司令塔・横断機構 hotfix（残 M「queue-guard-gate / session-start-tone ドリフト」根本解決）
> 承認: マスター方針1（根本解決）2026-06-19 承認済
> 担当: orchestrator 直接（settings.json + scripts 編集を含むため・subagent HARD BLOCK 回避）

## ⚠ 危険項目

なし（root settings.json は伝播対象外・既存 deny/ask union 維持・hooks マージは追加方向のみ）

## 上位 plan からの constraint 変更

なし（独立 hotfix）

## 背景（確定済の調査結果）

- x-auto-post のトンマナ機械強制 hook 2件（`queue-guard-gate`=PostToolUse / `session-start-tone`=SessionStart）はマスター指示 2026-06-17（commit `35242f9b`/`5e7ac0f6`）で settings.json に登録された。
- commit `70799622`（hook-runner 経由化・propagate 実行）で settings.json から消失。以降 `523e83df`/`416c043d` も未登録。**現状トンマナ機械強制は無効**。
- 根本原因: `scripts/propagate-hooks.mjs` line 196-200 が `settings.hooks = productHooks`（root 由来）で**完全置換**し、root に存在しない product 固有 hook 登録を保持しない構造的欠陥。

## 影響範囲

- `scripts/propagate-hooks.mjs`（マージロジック追加）
- `products/x-auto-post/.claude/settings.json`（2 hook 復元）
- 横断監査対象: 全 product settings.json の git 履歴（root 外 hook を持った product の特定）
- 残 L 連動: `generate-hook-manifest.mjs` の integrity 整合（queue-guard-gate/session-start-tone を product 固有として扱えるか）

## 実装ステップ

| # | 内容 | 担当 | 検証 |
|---|------|------|------|
| 1 | 横断監査: 全 product settings.json 履歴で root 外 hook 名を列挙し固有 hook を持つ product を特定 | orchestrator | `git log -p` grep で hook 名 unique 抽出 |
| 2 | propagate-hooks.mjs に `extractProductOwnHooks` + マージロジック追加（root hook 名に無い entry を保持・append） | orchestrator | `node --check` |
| 3 | x-auto-post settings.json に2 hook entry を復元（hook-runner 経由形式・現行 hook 構成は維持） | orchestrator | grep -c で2件確認 |
| 4 | propagate 再実行 → x-auto-post 2件保持 + 他 product 巻き込み0 + 冪等（2回目 SYNC 0） | orchestrator | 実行ログ |
| 5 | generate-hook-manifest 整合確認（integrity PASS or SKIP 設計判断） | orchestrator | `check-hook-integrity` |
| 6 | verify-agent で受け入れ基準を機械検証 | verify-agent | PASS/FAIL 表 |

## リスク

- マージロジックの冪等性破綻（再実行で固有 hook が重複追加）→ ステップ4で2回実行し SYNC 0 を確認
- 横断監査で x-auto-post 以外の固有 hook 消失が見つかった場合はスコープ拡大 → マスター報告して方針合意

## テスト方針

- Run: `node --check scripts/propagate-hooks.mjs` Expected: EXIT 0
- Run: `git show 5e7ac0f6:products/x-auto-post/.claude/settings.json | grep -c "queue-guard-gate\|session-start-tone"` Expected: 2（復元元の存在確認）
- Run: propagate 2回実行し2回目の `hooks updated` Expected: 0（冪等）
- Run: `node scripts/check-hook-integrity.mjs` Expected: PASS

## 受け入れ基準

1. `node --check scripts/propagate-hooks.mjs` が EXIT 0
2. `grep -c "queue-guard-gate" products/x-auto-post/.claude/settings.json` が 1 以上（PostToolUse 復元）
3. `grep -c "session-start-tone" products/x-auto-post/.claude/settings.json` が 1 以上（SessionStart 復元）
4. propagate 再実行2回目の `hooks updated` 行が `0/N` であること（冪等性・固有 hook 重複なし）を実行ログで確認
5. propagate 実行後、`git diff --stat` で x-auto-post 以外の product settings.json に新規 diff 行が0であること（巻き込み0）
6. `node scripts/check-hook-integrity.mjs` が PASS であること（または queue-guard-gate/session-start-tone を product 固有として扱う設計が整合）
7. `git log -p -- 'products/*/.claude/settings.json'` を grep した root 外 hook 名一覧と現 settings.json を照合し、x-auto-post 以外に固有 hook 消失 product が0件であることを確認（あればマスター報告）

## 承認後モード

実装は orchestrator 直接（settings.json 編集の subagent HARD BLOCK 回避）。ステップ6 verify-agent のみ subagent 委譲。
