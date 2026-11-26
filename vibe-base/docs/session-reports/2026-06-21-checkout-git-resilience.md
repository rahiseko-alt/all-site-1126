# Check-out レポート — vibe-base 司令塔 2026-06-21（git「いつも詰まる」根本解決 + 虎の巻一連）

> **次セッションは本ファイルを必ず先に Read してから着手すること。**

- branch: master（origin と同期・**全 commit push 済 = ahead/behind 0/0**）
- 種別: git レジリエンス根治（B+C）+ 虎の巻取込/3段ゲート/デプロイ

---

## 🔴 最重要（次セッションが即ハマる/知るべき2点）

1. **新 hook `pre-git-staging-gate` が稼働中（全25product にも propagate 済）**。`git add -A` / `git add .` / `git add --all` / `git commit -a|-am|--all` は **block される**。今後は必ず **path-scoped**:
   - `git add <明示パス>`（例 `git add docs/ scripts/foo.mjs`）
   - `git commit -m "..." -- <明示パス>`
   - 一括 add がどうしても要る時のみ `touch .allow-add-all`（10分TTLバイパス）。
   理由=共有 index で他セッションの staged を巻き込む「commit 食われ」を機械封鎖（本日2回実害→根治）。
2. **肥大ジャンクは gitignore 済**: `outputs/`・`backups/`・`.playwright-mcp/`・`test-results/`。これらは**追跡解除済**（working tree は残存）。`git add` で再追跡しようとしないこと（gitignore が弾く）。

---

## A. 本セッション TL;DR

**虎の巻系**（前半）:
1. outbox 8件取込（portfolio 22→30）+ order採番バグ根治（`018acf3e`）。
2. blindtest を「描画＋操作中JSエラー0」へ格上げ（`908823a2`）。
3. **虎の巻 3段ゲート化**（`4715dfe5`）: hook `toranomaki-generated-guard` で canonical 直書きを Deny・intake rollback・司令塔 Add 領域 `.toranomaki-outbox/`・RULES §8.7。**docs/html-toranomaki/ 直書き禁止＝Add領域→intake 必須**。
4. intake rollback の rmSync 境界チェック（`01979db3`）。
5. webgl-dark-void-dive（非適合異物）を司令塔判定で却下→`outputs/toranomaki-rejected/` 隔離。
6. デプロイ（portal 30カード・`portfolio.kouheikosehira.com` 反映）。

**git「いつも詰まる」根治**（後半・10サブ調査で真因特定）:
7. 真因＝**A 肥満**（.git 4.1GB・動画2.85GB）/ **B 共有index肥大**（outputs等22,847 staged→autostash数分）/ **C 共有index sweep**（`git add -A`が他者staged巻込＝commit食われ）。band-aid で20+セッション凌いだだけだった。
8. **B 根治**（`5a75fe83`）: 肥大源 gitignore＋`git rm --cached`。staged 22,847→数百・追跡 28,753→約8,500・autostash 即時化。
9. **A 緩和**: `git config http.postBuffer 524288000`。以後 push は `curl 16` 中断せず通過（実証済）。
10. **C 根治**（`4026dceb`）: `pre-git-staging-gate` hook で無差別 stage を機械封鎖・全25product propagate。
11. **A 履歴縮小は不採用**（マスター判断）: postBuffer で急性症状解消済・履歴書換/force-push の害が大。

---

## B. 完了 commit（全て origin/master 反映済・ahead/behind 0/0）

| hash | 内容 |
|------|------|
| `018acf3e` | 虎の巻 outbox 8件取込＋order採番根治 |
| `908823a2` | blindtest 格上げ |
| `4715dfe5` | 虎の巻 3段ゲート化 |
| `01979db3` | intake rollback rmSync 境界 |
| `2c03b86f` | checkout-3（前回引継ぎ） |
| `5a75fe83` | git B 根治（肥大源 gitignore＋追跡解除） |
| `4026dceb` | git C 根治（pre-git-staging-gate hook） |

---

## C. 影響波及（必読）

- **git 運用が変わった**: path-scoped staging が機械強制（add -A/./commit -a は block）。詳細→ `docs/rules/permission-defense-canonical.md`「git の無差別 stage…」節。
- **虎の巻の作り方が変わった**: docs/ 直書き禁止・Add領域→intake（RULES §6/§8.7）。
- gitignore 追加で `outputs/`・`backups/`・`.playwright-mcp/`・`test-results/` は版管理外（永続化したい成果物は docs/ 等へ昇格）。
- A（.git 4.1GB）は残存。clone/fetch は重いままだが push は postBuffer で通る。緊急性なし。

---

## D. 残作業

| 優先度 | 内容 |
|--------|------|
| H | kosespark P0 立ち上げ（マスター §1/§2/§3 情報待ち＝着手不可）。 |
| M | PC ディスク掃除（plan: docs/ops/plans/2026-06-17-disk-cleanup.md）。tmp/ 肥大。 |
| L（保留決定） | A 履歴縮小（filter-repo/LFS・force-push 要）。**不採用確定**（postBuffer で十分）。再燃時のみ別 plan。 |
| 軽微 | `pre-git-staging-gate` の既知ギャップ（`git commit -m "x" --all` の稀な順序を取りこぼす・複合コマンド`&&`はsafe-side通過）。実害小だが完全強制が要れば改修。 |
| 片付け | portal 確認サーバ（バックグラウンド・ポート8770）＋ `tmp/portal-serve.mjs`（一時）。不要なら停止・削除。 |

---

## E. 配備済 hook / 変更

- **新規 hook**: `.claude/hooks/pre-git-staging-gate.mjs`（PreToolUse:Bash・**全product propagate**・manifest 11件）/ `.claude/hooks/toranomaki-generated-guard.mjs`（root専用・前半）。
- **変更**: `.gitignore`（肥大源4種）/ `scripts/toranomaki-intake.mjs`（Add領域+rollback）/ `scripts/toranomaki-blindtest.mjs`（格上げ）/ `docs/html-toranomaki/RULES.md`（§6/§8.7）/ `docs/rules/permission-defense-canonical.md`（git staging gate 節）。

---

## F. 本セッション生成物 / 一時物

- 本ファイル + `outputs/toranomaki-rejected/webgl-dark-void-dive/`（却下隔離・保全）。
- `tmp/portal-serve.mjs`（portal配信・一時）。バックグラウンドサーバ ポート8770 起動中。

---

## G. 次セッション初手

1. 本ファイルを Read。
2. **git は path-scoped 必須**（add -A/. は hook block）。コミットは `git commit -- <パス>`。
3. 虎の巻テーマは docs/ 直書き禁止（Add領域→intake）。
4. push は司令塔 deny → マスター `! git push`（postBuffer 設定済で通る）。

### 機械検証サマリ（Wave A）
- ahead/behind: 0/0（全 push 済）/ 自領域 clean
- pre-git-staging-gate: 構文OK・block 6/6・pass 8/8 / check-hook-integrity EXIT 0（manifest 11）
- toranomaki-verify: EXIT 0（三者一致）/ secret 0
- コードレビュー（Wave A-3）: 軽微エッジ3件のみ（`--all=yes`=git不正構文で非実害・`-m "x" --all`稀順序・複合bypass設計通り）。共通失敗モードは捕捉。
