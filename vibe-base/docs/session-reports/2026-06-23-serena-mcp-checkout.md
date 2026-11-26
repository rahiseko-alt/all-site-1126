# Check-out 引継ぎ — Serena MCP 導入（vibe-base 最適構成で確立・全6基準クリア）

> branch: master / HEAD: ebd9d5f0c（push 済・ローカル=リモート一致）
> 次セッションは本ファイルを先頭から Read してから着手すること。

## 🔴 最重要

1. **Serena MCP を導入完了。日常はマスター操作不要**＝コード主体の product を作業対象にすると AI が起動時に自動 activate・初回のみ自動 index する。使い方の正本 → `docs/ops/serena-mcp-setup.md`。
2. **root 全体を activate するな**（`.worktrees/` 二重化で 150s スキャン→接続不能の再発）。必ず `products/<name>` を指す。登録は無 project 高速ブート（`--project-from-cwd` 撤去済）。
3. 前セッション（Godot/spire-lite）の **権限モデル変更は継続有効**：git push は AI 可（`--force`/`reset --hard`/`.env`/`gh auth` は保護）。デプロイは ask。git は path-scoped 必須。詳細 → `docs/session-reports/2026-06-23-checkout.md`（前報）。

## A. 本セッション TL;DR

1. Serena 本体を公式手順で導入（`uv tool install -p 3.13 serena-agent` → v1.5.3）
2. 当初 `serena setup claude-code`（`--project-from-cwd`）はモノレポ root 丸ごとスキャンで **initialize 150s 超 timeout＝接続不能**と実測（`.gitignore` 読込だけで 30.6s・`.git/info/exclude` 不読で `.worktrees/` 二重走査）
3. 根治：**無 project 高速ブート登録**へ変更（`claude mcp list` で `serena ✔ Connected`）
4. global `ignored_paths`（`.worktrees`/`node_modules`/`archive`/`backups`/`outputs`）と Serena 3 hook（activate/remind/cleanup）をマスター手動適用（`scripts/serena-finalize-setup.mjs` 冪等実行）
5. `products/x-auto-post`（純 Python 15ファイル）を index・`project.yml` 配置（cache は gitignore）
6. **live MCP 検証**：別セッション（Sonnet 4.6）で `activate_project` → `find_symbol load_queue`（post.py 20-26行）成功＝end-to-end 実動作確認・全6基準クリア
7. Opus override は `PYTHONUTF8=1` 必須（cp932 で em-dash UnicodeError＝0バイト回避）と判明・8015文字出力

## B. 完了 commit 一覧（push 済）

| hash | 種別 | 内容 |
|---|---|---|
| be524e0cc | feat(serena) | Serena 導入（無 project 登録/global設定/3hook/x-auto-post index/runbook）5ファイル |
| ebd9d5f0c | merge | origin/master 取込（bot の x-auto-post データ更新・衝突ゼロ）→ push |

## C. 影響波及（必読）

- **Serena 3 hook は user スコープ＝全 product・司令塔の全セッション起動に効く**。SessionStart の activate hook が毎回「project を activate せよ」を注入する。`/pc-checkin` と毎回併発するのが煩わしければ、user 設定から外し Serena を使う product の `.claude/settings.json` へ移す（runbook §残2 注記）。
- global `ignored_paths` は `~/.serena/serena_config.yml`（vibe-base 外・AI 編集不可・マスター手動済）。
- 設定変更は**次に起動する新セッションから**有効（起動時読込）。

## D. 残作業

**H** — なし（Serena 導入は完了・持ち越しゼロ）

**M**
- 前 P1 を継続: spire-lite P0（Godot・マスター主導）/ kosespark P0（§1-3 情報待ち）/ git autoland 残穴（`git-autoland.mjs` L119 worktree 二重 checkout）

**L**
- ⚠️ `~/.claude/settings.json` の `env.TWITTER_BEARER_TOKEN` が**平文**（既存・本セッション混入ではない）。Secrets/キーチェーン移設を検討
- GDScript（spire-lite）で Serena を使う場合は Godot エディタ起動中（TCP 6008 内蔵 LSP）が前提

## E. 配備済 subagent / skill / hook（本セッション追加分）

- MCP: `serena`（user scope・無 project・`--context claude-code`）
- スクリプト: `scripts/serena-finalize-setup.mjs`（global設定/hook の冪等適用・マスター `!node` 実行用）
- doc: `docs/ops/serena-mcp-setup.md`（正本 runbook）・`.claude/rules/structural-ops.md` に参照ポインタ追記
- product: `products/x-auto-post/.serena/project.yml`（Python・index 済）
- hook 追加: なし（Serena hook は user settings へマスター手動・本 repo 外）

## F. 本セッション生成レポート / 成果物

- 本ファイル
- runbook: `docs/ops/serena-mcp-setup.md`（使い方の単一正本）
- plan: `~/.claude/plans/github-glimmering-kahn.md`（Serena 導入最適化・承認済）

## G. 次セッション初手

1. 本ファイルを Read
2. Serena は導入済・日常操作不要。コード product を触る時に AI が自動 activate/index
3. **root を activate しない**・`products/<name>` を指す
4. 機械検証サマリ: シークレット混入 0 / Serena live `find_symbol` PASS（別セッション実観測）/ 全6基準クリア
5. コードレビュー指摘: 0 件（成果は live 検証済・既 commit/push）
