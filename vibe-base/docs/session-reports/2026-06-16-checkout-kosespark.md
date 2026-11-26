# Check-out 引継ぎ — kosespark 立ち上げ ＋ GSAP スキル化 ＋ hook 統治修正

- branch: `master` / HEAD: kosespark scaffold `b068c954` → hook修正 `6c3deb1e` → 本Check-out
- **次セッションは本ファイルを先頭から Read してから着手すること。**

## 🔴 最重要

1. **新規プロダクト kosespark 立ち上げ（P0）**。技術型は既存5型外の「Claude Code 拡張型」（新設）。**§1最重要/§2技術/§3デザインがマスター情報待ち＝確定まで実装着手不可**。即死仮説「素人が Claude Code を使える」を実機検証するまで他フェーズ進行禁止。
2. **scaffold の構造的欠陥を発見・修正**：product-scaffold / new-product SOP が `scripts/check-secret-patterns.mjs` のコピーを手順に含めず、kosespark の secret-write-gate hook が起動時に落ちる状態だった（code-reviewer 検出）。kosespark は修正済み。**次回 new-product でも再発する → scaffold 改善が必要**（下記 D 残作業）。
3. **drift-checkin の hook 不整合は未解決**（instagram-auto-ops 領分・越権回避で未着手）。root 全体 integrity はこの1件で FAIL のまま。

## A. 本セッション TL;DR

- GSAP 公式知識を user-level 統合スキル化（`~/.claude/skills/gsap/`・claude-skills-base repo）。詳細は別レポート `2026-06-16-checkout-gsap.md`。
- 新規プロダクト kosespark を product-scaffold から立ち上げ（CLAUDE.md/memory/failures/hypotheses/risk-diagnosis ＋ .claude 一式）。
- 技術型「Claude Code 拡張型」を新設（skills/MCP/subagents/hooks パッケージ・手始めは Claude Code デスクトップ版を連携）。
- 即死仮説・API キー預かり業態リスクを hypotheses.md / risk-diagnosis.md / CLAUDE.md §6 に明記。
- 前セッション積み残しの hook 統治不整合を解消：agent-ag-isolation-guard.mjs 撤去漏れ削除＋portfolio hook ×2 を SKIP_HOOKS 追加＋manifest 再同期。
- code-reviewer が secret-write-gate の依存欠落を検出 → check-secret-patterns.mjs コピーで修正。
- kosespark hook integrity EXIT 0 / fixture-suite 5/5 PASS。

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| `64f78c5`(skills-base) | feat | GSAP user-level スキル（別repo） |
| `bb61b8f0` | refactor | docs/skills/gsap 撤去・単一正本化 |
| `3459f0fa` | chore | GSAP Check-out（memory @参照） |
| `b068c954` | feat | kosespark 新規立ち上げ（26ファイル） |
| `6c3deb1e` | fix | hook 統治不整合解消（agent-ag撤去漏れ/portfolio SKIP/manifest同期） |
| （本Check-out） | chore | check-secret-patterns 補完 + 引継ぎ + memory |

## C. 影響波及

- `scripts/generate-hook-manifest.mjs` の SKIP_HOOKS に portfolio hook ×2 追加。今後 portfolio 系 hook は manifest 検査対象外（root settings.json には登録され動作する）。
- kosespark の `.claude/hooks/` は他 product 同様のコピー配布（survey §6 既知の重複・単一正本化は backlog）。

## D. 残作業

- **H**: kosespark §1最重要/§2技術（CC連携の具体・**API鍵管理方針**＝業態最大リスク）/§3デザインのマスター確定。これが決まるまで実装着手不可 — plan: なし
- **H**: **product-scaffold / new-product SOP に `scripts/check-secret-patterns.mjs` コピー手順を追加**（今回の欠陥の恒久対策・全新規 product で再発する）— plan: なし
- **M**: drift-checkin の wrapper mismatch 解消（instagram-auto-ops セッションで `--hook=drift-checkin`→`--hook=checkin-hook` 整合 or 実体リネーム）。root 全体 integrity 復旧 — plan: なし
- **L**: n8n も check-secret-patterns.mjs 不在で secret hook が壊れている可能性（横断チェック対象）— plan: なし
- **L**: GSAP 知識の upstream 定期更新 / manifest の matcher・event (unknown) を実値化（generate-hook-manifest に settings.json パース追加）— plan: なし

## E. 配備済 subagent / skill / hook

- skill: `gsap`（user-level・本セッション前半）。
- product: kosespark（.claude/hooks 19個 + settings.json）。
- SKIP_HOOKS: portfolio-deploy-build-gate / portfolio-generated-guard 追加。

## F. 本セッション生成レポート

- `docs/session-reports/2026-06-16-checkout-gsap.md`（GSAP 詳細）
- 本ファイル（kosespark + hook 統治）

## G. 次セッション初手

1. 本レポートを Read。
2. kosespark を進めるなら、まず **API キー預かりの鍵管理方針**（§2）をマスターと確定する（業態の最大リスク・これなしに連携実装着手不可）。
3. scaffold 欠陥対策（D-H の check-secret-patterns コピー手順追加）を別タスクで処理。
4. 機械検証サマリ（Wave A-2）：kosespark integrity EXIT 0 / シークレット混入 0。
5. コードレビュー（Wave A-3）：2件検出 → 1件修正（secret-write-gate 依存）/ 1件申し送り（manifest (unknown) 表示精度）。
