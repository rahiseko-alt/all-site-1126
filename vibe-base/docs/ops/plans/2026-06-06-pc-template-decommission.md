# Plan: PC表「固定テンプレ配布」廃止 → Plan Mode 都度生成 + 照合リスト

> 2026-06-06 実行・完遂。固定テンプレ `pc-template.html` の一律コピー配布をやめ、進捗管理を Plan Mode（plan ファイル）+ 照合リスト `docs/standards/checklists/pc-checklist.md` に移行。仮説テーブルは `products/{product}/hypotheses.md` を新正本化。

## 影響範囲

- 新設: `docs/standards/checklists/pc-checklist.md`・`products/{product}/hypotheses.md` ×12・`docs/ops/pc-decommission-migration-log.md`
- 書換: 自動ロード経路（root CLAUDE.md・session-lifecycle・product-development・agent-rules・MEMORY.md）・product-cycle.md・全 product CLAUDE.md ×17・カタログ・runbook 3件・plan-template/plan-finalize/pc-checkin SKILL・producttype-typology.md（リネーム）
- 削除: pc-progress 実体 34 + pc-template.html + pc-version-gate.mjs 23 + orphan scripts 3

## 実行サマリ（Phase 1〜3 完遂・コミット済）

- Phase 1: 検知ゲート無効化 / hook 解除 / 新基盤追加（pc-checklist・hypotheses ×12・plan 統合）
- Phase 2: カタログ / runbook / orphan 削除 / scaffold 手順
- Phase 3: product-cycle 再構成 / CLAUDE.md ×17 / 自動ロード C1 / 実体削除（移送ログ退避後）

## テスト方針

- 各 Phase 後 `bash scripts/check-in-verify.sh` EXIT 0 を確認 → 受け入れ基準 7
- Glob/grep で残骸ゼロを確認 → 受け入れ基準 1/4/5/6/9
- 通電テスト（hook-integrity・settings-spec・クロスリファレンス）→ 受け入れ基準 12

## 受け入れ基準

1. PC表参照残骸ゼロ — `grep -rnE "pc-progress|pc-template|check-pc-version|pc-version-gate" scripts/ .claude/settings.json` の hit が休眠ガード（check-in-verify.sh B-5）以外ゼロ
2. 照合リスト存在 — `docs/standards/checklists/pc-checklist.md` が `checklist-version` と G-P0/P1/P2/P4 を含む（grep 確認）
3. finalize ゲート統合 — `.claude/commands/plan-finalize.md` に Stage 0.5（0.5. ゲート照合）が存在（grep 確認）
4. 実体消滅 — Glob `products/**/pc-progress*` が 0 件（複製・.bak 含む）
5. テンプレ消滅 — `docs/standards/templates/pc-template.html` 不在（test -f 非0）+ vest1-inventory/README から pc-template 除去（grep 0）
6. CLAUDE.md 統一 — 全 `products/*/CLAUDE.md` から pc-progress 参照消滅（grep 0）・Plan Mode 進捗管理に統一
7. 機械検証通過 — `bash scripts/check-in-verify.sh` EXIT 0（NG 0）
8. 未消化情報移送 — `docs/ops/pc-decommission-migration-log.md` 存在 + 12 製品分セクション（grep "^## " で 12）
9. 自動ロード経路クリーン — ルート`CLAUDE.md`・`session-lifecycle.md`・`product-development.md`・`MEMORY.md` に PC表参照 grep 0 件
10. 番号体系整合 — `self-verification-sop.md` §1-A 表に PC 表 A-1 行が不在・`agent-rules.md` K1/K5 早見表に A-1/B-4 欠番参照なし（K1=D-5 参照）
11. 仮説テーブル移送 — P0着手済 12 製品に `products/{product}/hypotheses.md` 存在（Glob 12）
12. 通電テスト — `check-hook-integrity.mjs` / `check-settings-spec.mjs` EXIT 0・`producttype-typology.md`（旧 pc-template-v10-typology リネーム）存在 + `pc-template-v10-typology` 参照が `.claude/` `docs/ops/` で 0。md-inventory.md は当初から不在のため照合対象外

## 設計判断（本 plan 承認で確定）

- 設計判断1: `products/{product}/hypotheses.md`（仮説テーブル新正本・永続独立ファイル）
- 設計判断2: productType を各 product CLAUDE.md §0 メタへ移送（typology は種別定義ガイドとして `producttype-typology.md` 存続）

## 承認後モード

default（本 plan は実行完遂済・記録用。検証は verify-agent で実施）
