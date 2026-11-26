# Check-out レポート — vibe-base 司令塔 2026-06-19（虎の巻 hook 誤配備 根本修正）

> **次セッションは本ファイルを必ず先に Read してから着手すること。**

- branch: master
- HEAD: `416c043d`（本修正コミット）
- 種別: 司令塔・横断 hotfix（shift-ai 申し送り AC-D6 importance:H）

---

## 🔴 最重要

1. **虎の巻専用 hook 3 件の横展開誤配備を根本修正済み**。拡散機構（`scripts/propagate-hooks.mjs`）を直し、全 product から登録・実体を一掃した。再発防止は明示リスト `ROOT_ONLY_HOOK_NAMES` が single source。
2. **スコープ外の別ドリフトを発見（未対応）**: `queue-guard-gate` / `session-start-tone` が未登録の product hook として manifest 再生成時に表面化。本コミットには含めず HEAD manifest を復元した（D 残作業参照）。

---

## A. 本セッション TL;DR

1. shift-ai Check-out 申し送り（虎の巻 hook 横展開誤配備の横断根本修正・importance:H）を受領。
2. 一次調査で根本原因を確定: `propagate-hooks.mjs` が root の全 hook を `checkin-hook` のみ除外して全 product へ ①settings.json 登録（完全置換）②`.mjs` 実体コピー の両方を配布。portfolio/虎の巻 3 hook が除外リスト未登録で拡散。
3. 自動ガード `assertRootOnlyHooksCovered` は子コマンドの `/products/` 参照しか捕捉せず、`$CLAUDE_PROJECT_DIR/scripts/build-portfolio.mjs` を実行する portfolio hook を取りこぼした（K2）。
4. `generate-hook-manifest.mjs` は既に SKIP_HOOKS で portfolio 2 件を root-only 扱い → 2 スクリプトで定義乖離（K5）。`session-start-toranomaki` はどちらにも未登録だった。
5. 修正: `ROOT_ONLY_HOOK_NAMES` に 3 hook 追加 + hook ファイルコピーループでも除外 + `SKIP_HOOKS` に session-start-toranomaki 追加（定義整合）。
6. `propagate-hooks.mjs` 再実行で 23 product settings.json から 3 hook 登録を一掃（`0 hook files copied` 確認）。
7. 誤配備 .mjs 実体 75 件削除（tracked 22 = git rm / untracked 53 = rm）。**plan の 47 件は git status truncate による過小評価で実数 75 だった（K3）**。
8. 検証: check-hook-integrity PASS / propagate 冪等（3回目 SYNC 0）/ root 正本 3 件不変 / 別エージェント homepage M・未追跡 settings.json 2件 巻き込み 0。

---

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| `416c043d` | fix(hooks) | 虎の巻 hook 横展開誤配備の根本修正（48 ファイル: scripts 2 + settings.json 23 + 削除 .mjs 22 + failures.md 1） |
| （本 Check-out） | chore(memory) | 引継ぎ MD + memory.md @ 参照更新 |

---

## C. 影響波及（必読）

- 23 product の `.claude/settings.json` から虎の巻 3 hook（portfolio-deploy-build-gate / portfolio-generated-guard / session-start-toranomaki）登録を除去。これら product でのデプロイ・Write/Edit が虎の巻 hook で誤ブロックされなくなった。
- **root `.claude/settings.json` の 3 hook 登録と root `.claude/hooks/` の正本 .mjs は不変**（PROJECT_DIR=root で正常動作。虎の巻デプロイ防御は維持）。
- 未追跡 settings.json 2 件（learning-suite-kanji / writer-auto-ops＝別エージェント新規 product 仕掛中）は巻き込まず。on-disk は既に修正済（whoever commits gets fixed version）。

---

## D. 残作業

| 優先度 | 内容 |
|--------|------|
| H | （引き継ぎ無し。虎の巻 hook 横断修正は完了） |
| M | **別ドリフト調査**: `queue-guard-gate` / `session-start-tone` が未登録の product hook として存在（manifest 再生成で表面化）。どの product のどの目的の hook か特定し、登録するか削除するか判断。本セッションはスコープ外として HEAD manifest 復元で回避。 |
| M | カスタムドメイン `codex.kouheikosehira.com`（shift-ai 引継ぎ）: Cloudflare DNS 追加後 `vercel alias set`。DNS 追加はマスター作業。 |
| L | manifest を正規再生成する場合は上記 M ドリフト解消が前提（`generate-hook-manifest.mjs --write` は queue-guard-gate/session-start-tone で integrity FAIL する）。 |

---

## E. 配備済 subagent / skill / hook

- 追加なし。**変更**: `propagate-hooks.mjs`（ROOT_ONLY_HOOK_NAMES に portfolio/虎の巻 3 hook 追加・ファイルコピー除外）/ `generate-hook-manifest.mjs`（SKIP_HOOKS に session-start-toranomaki 追加）。
- **削除**: 全 product の虎の巻 .mjs 実体 75 件。

---

## F. 本セッション生成レポート

- 本ファイルのみ。plan: `~/.claude/plans/twinkly-tinkering-dusk.md`（承認済・実走完了）。
- 一時ファイルは `/tmp`（OS 一時領域）使用・vibe-base/tmp への成果物生成なし。

---

## G. 次セッション初手

1. 本ファイルを Read。
2. 残作業 M「queue-guard-gate / session-start-tone ドリフト」に着手するなら、まず `grep -rl "queue-guard-gate\|session-start-tone" products` で実体 product を特定 → 用途判断 → 登録 or 削除。
3. shift-ai 残（codex カスタムドメイン）はマスターの Cloudflare DNS 状況確認が前提。

### 機械検証サマリ（Wave A）
- syntax（propagate / generate-hook-manifest）: OK
- check-hook-integrity: PASS
- secret grep（自コミット範囲）: 0 マッチ
- propagate 冪等性: SYNC/HOOK 0（3回目）

### コードレビュー指摘（Wave A-3 / self）
- no issues（除外リスト追加＋設定/実体削除のみ・バグ/機密/dead code なし）
