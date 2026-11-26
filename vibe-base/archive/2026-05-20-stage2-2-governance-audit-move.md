# Stage 2-2: governance / audit 資産を別 repo へ filter-repo 移転

> 段階 2 工程 2-2 のみ・移転完了で停止（参照書換 2-3 / script 改造 2-4 / vibe-base 縮小 2-5 は別セッション）

---

## 1. Context

memory.md P1#1「段階 2 [37]-[69]」のうち、工程 2-1（vibe-governance / vibe-audits 別 repo 新設）は Session 299 commit `5ff1f4a` / `8d51794` で完遂済（init commit 雛形 CLAUDE.md + memory.md のみ）。

本工程 2-2 では vibe-base の governance 8 領域 + audit 1 領域を `git filter-repo` で履歴ごと抽出し、既存の雛形を上書きして新 repo に物理移転する。完了後、vibe-base から該当ファイルを削除しコミット。

13 product からの cross-repo 参照（382 件）書換は工程 2-3、script 改造は工程 2-4、vibe-base に薄い参照宣言 CLAUDE.md を置くのは工程 2-5（**いずれも本計画スコープ外**）。本工程完了時点で vibe-base は **governance なし状態（一時的に不完全）** になることをマスター承認済。

---

## 2. Goal

- vibe-governance に vibe-base 由来の **173 ファイル**（docs/ops + .claude/rules + docs/standards + docs/adr + scripts + memory + CLAUDE.md + memory.md）が **git log 履歴を保持した形で** 存在する
- vibe-audits に vibe-base 由来の **3 ファイル**（docs/audits/）が同様に存在する
- vibe-base から該当 176 ファイルが消失し、削除 commit が main に乗っている
- 雛形 init commit（`5ff1f4a` / `8d51794`）は backup tag で復元可能な状態で保全

---

## 3. Scope

### In
- git filter-repo インストール
- vibe-base working tree クリーンアップ（dirty 1 件 + untracked 6 件処理）
- governance 8 領域の vibe-governance 移転（filter-repo + force push）
- audit 1 領域の vibe-audits 移転（同上）
- vibe-base 側からの削除コミット
- 移転完了の機械検証

### Out（本計画では触らない）
- products/*/ の cross-repo 参照書換（工程 2-3）
- propagate-hooks / check-rules-coverage / check-in-verify の cross-repo 対応（工程 2-4）
- vibe-base に薄い参照宣言 CLAUDE.md / 製品横断 memory.md を新設（工程 2-5）
- worktree `vibe-base-plan-mode` の整理
- vibe-base 側で governance 不在による hook 不発等の修復作業

---

## 4. Constraints / Assumptions

| 区分 | 内容 |
|---|---|
| 制約 | filter-repo は未インストール。Python パッケージ `git-filter-repo` を pip で導入する必要あり |
| 制約 | vibe-governance / vibe-audits は雛形 init commit を持つ。master 承認で **上書き廃棄**（backup tag で復元可能化） |
| 制約 | filter-repo の出力は --force で push する（local file URL への `--mirror` push） |
| 制約 | 並列 Write/Edit 禁止規律（memory P2 教訓 #11）→ 全 git 操作は Bash で順次実行 |
| 前提 | vibe-base の git log には移転対象ファイル全件の履歴が残っている（実体照合で確認済） |
| 前提 | filter-repo 適用後は **新 repo 単独で過去 commit が辿れる**（cross-repo の commit ハッシュ参照は別問題） |
| 前提 | 移転後 vibe-base は governance 不在で動作不全。マスター承認済の意図的中間状態 |

---

## 5. Approach

filter-repo を使う 2 系統並列ワークフロー（governance 系・audit 系）。各系統で:

1. vibe-base を bare 非ローカル clone（filter-repo は default で --no-local 強制）
2. clone 内で `git filter-repo --path <paths>` 実行（多 path 指定で OR 抽出）
3. 既存 vibe-governance / vibe-audits を tag backup 後にディレクトリリネーム
4. filter-repo 出力 clone を新 repo 名にリネーム（実質置換）
5. リモート再設定 + 動作確認

完了後、vibe-base 側で `git rm -rf` + commit。

---

## 6. Tasks（順次実行・依存関係順）

### T0. vibe-base working tree クリーンアップ
- 目的: filter-repo は dirty tree で動作不安定。事前に整理
- 手順:
  - `git status` で modified / untracked 全件確認
  - `docs/ops/plans/2026-05-19-prep-task-x.md` の modified を内容確認後 commit（実体 diff をマスター提示）
  - untracked 6 件（lskf html ×2 / coach logs / svelte-kit / ymm-shorts mp4 / tmp_inspect.py）を **個別判定**: lskf html は coach product 系 → コミット候補、それ以外は .gitignore 追加 or 削除を本人判断
- 検証: `git status --short` 出力が空（EXIT 0 同等）
- 重度: 軽

### T1. git-filter-repo インストール
- 目的: 履歴抽出ツール導入
- 手順: `pip install git-filter-repo` → `git filter-repo --version` で確認
- 検証: `git filter-repo --version` が `2.x.x` を返す（EXIT 0）
- 重度: 軽
- 注: Python 未導入なら別途要対処（masterに事前確認 — Python 環境がある前提で進める）

### T2. vibe-governance / vibe-audits の init commit を tag backup
- 目的: 雛形を後から復元可能にする
- 手順:
  - `cd ~/Desktop/ClaudeCode/vibe-governance && git tag init-skeleton-2026-05-19 5ff1f4a`
  - `cd ~/Desktop/ClaudeCode/vibe-audits && git tag init-skeleton-2026-05-19 8d51794`
- 検証: `git tag -l "init-skeleton-*"` で各 repo で 1 件返る
- 重度: 軽

### T3. governance 系 filter-repo 抽出
- 目的: vibe-base から 8 領域 + 2 ルートファイルを履歴付き抽出
- 手順:
  ```bash
  cd ~/Desktop/ClaudeCode
  git clone --no-local vibe-base vibe-base-extract-governance
  cd vibe-base-extract-governance
  git filter-repo \
    --path docs/ops --path .claude/rules --path docs/standards \
    --path docs/adr --path scripts --path memory \
    --path CLAUDE.md --path memory.md
  ```
- 検証:
  - `git ls-files | wc -l` が **約 173**（許容 ±5）
  - `git log --oneline | head -5` で vibe-base 由来 commit が見える
  - `ls` で対象 8 領域のみ存在（products/ や docs/research-bank/ 等が含まれていないこと）
- 重度: 中（filter-repo 操作）

### T4. vibe-governance ディレクトリ置換
- 目的: 既存 vibe-governance を退避 → filter-repo 出力に置き換え
- 手順:
  ```bash
  cd ~/Desktop/ClaudeCode
  mv vibe-governance vibe-governance-init-backup-2026-05-20
  mv vibe-base-extract-governance vibe-governance
  cd vibe-governance
  git remote remove origin 2>/dev/null || true
  ```
- 検証:
  - `cd vibe-governance && git log --oneline | wc -l` が **数百件以上**（vibe-base 全 commit から filter された数）
  - `ls` で 8 領域 + CLAUDE.md + memory.md のみ
  - 雛形バックアップ `~/Desktop/ClaudeCode/vibe-governance-init-backup-2026-05-20/` 存在
- 重度: 軽

### T5. audit 系 filter-repo 抽出 + vibe-audits 置換
- 目的: T3-T4 と同型を audit に適用
- 手順:
  ```bash
  cd ~/Desktop/ClaudeCode
  git clone --no-local vibe-base vibe-base-extract-audits
  cd vibe-base-extract-audits
  git filter-repo --path docs/audits
  cd ..
  mv vibe-audits vibe-audits-init-backup-2026-05-20
  mv vibe-base-extract-audits vibe-audits
  cd vibe-audits
  git remote remove origin 2>/dev/null || true
  ```
- 検証:
  - `git ls-files | wc -l` が **3**（docs/audits/{README.md, ai-maturity-2026-05-19.html, ai-maturity-2026-05-19.pdf}）
  - `git log --oneline` で `4ebe8aa`（docs/audits 新設 commit）が見える
- 重度: 軽

### T6. vibe-base から移転済 9 領域を削除
- 目的: 工程 2-2 達成条件「vibe-base から消失」
- 手順:
  ```bash
  cd ~/Desktop/ClaudeCode/vibe-base
  git rm -rf docs/ops docs/standards docs/adr docs/audits .claude/rules scripts memory CLAUDE.md memory.md
  git status
  ```
- 検証: `git diff --cached --stat` で 176 件前後の削除 stage
- 重度: 中（vibe-base 動作不全化）

### T7. vibe-base 削除 commit
- 手順:
  ```bash
  git commit -m "$(cat <<'EOF'
  refactor(stage-2-2): move governance/audit assets to vibe-governance/vibe-audits

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```
- 検証: `git log --oneline -1` に新 commit + `git ls-files | grep -E "^(docs/(ops|standards|adr|audits)|\.claude/rules|scripts|memory)" | wc -l` が 0
- 重度: 軽

### T8. 機械検証（3 repo 横断）
- 目的: 工程 2-2 達成条件を機械的に裏取り
- 検証コマンド（4 件全て EXIT 0 + 期待出力）:
  - `cd ~/Desktop/ClaudeCode/vibe-governance && git ls-files | wc -l` ≥ 170
  - `cd ~/Desktop/ClaudeCode/vibe-audits && git ls-files | wc -l` == 3
  - `cd ~/Desktop/ClaudeCode/vibe-base && [ ! -e CLAUDE.md ] && [ ! -e memory.md ] && [ ! -d docs/ops ] && [ ! -d .claude/rules ] && echo OK`
  - 各 governance repo で `git log --oneline | wc -l` が **2 以上**（init skeleton tag + filter-repo 抽出履歴）
- 重度: 軽

### T9. memory.md P1#1 更新（ただし memory.md は移転済 → vibe-governance/memory.md に書く）
- 目的: 工程 2-2 完了マーク + 工程 2-3 を次タスクとして明示
- 手順: `vibe-governance/memory.md` の P1#1 工程表で 2-2 を ✅ 済へ更新（パス先・実体・git log 3 点照合済を明記）
- 検証: `cd ~/Desktop/ClaudeCode/vibe-governance && grep "2-2.*✅" memory.md` で 1 行返る
- 重度: 軽

### T10. 工程 2-2 完了報告 + Check-out 準備
- 目的: マスターへの完了報告 + 次セッション 2-3 着手の準備
- 手順: マスターに 3 行報告（ファイル数・commit hash・次工程）→ 承認後 Check-out

---

## 7. Critical files

### 移転対象 → vibe-governance（173 件・抜粋）
- `CLAUDE.md`
- `memory.md`
- `docs/ops/` 配下 62 件
- `.claude/rules/` 配下 26 件
- `docs/standards/` 配下 36 件
- `docs/adr/` 配下 2 件
- `scripts/` 配下 35 件
- `memory/` 配下 9 件

### 移転対象 → vibe-audits（3 件）
- `docs/audits/README.md`
- `docs/audits/ai-maturity-2026-05-19.html`
- `docs/audits/ai-maturity-2026-05-19.pdf`

### 影響を受けるが今回触らないファイル
- `products/*/CLAUDE.md`（governance 参照が壊れる・工程 2-3 で書換）
- `products/*/runbook.md` `risk-diagnosis.md` `cost-config.md` `backup-config.md` `memory.md` `pc-progress.html`（同上）

---

## 8. Verification

T0〜T9 各タスクの「検証」行を順次実行。最終確認は **T8 の 4 件 EXIT 0** が必須。

加えて全体終了後の **状態スナップショット**:
- `cd ~/Desktop/ClaudeCode && du -sh vibe-base vibe-governance vibe-audits` で 3 repo 容量比較（vibe-base が 約 2.0M 縮小しているはず）
- `git log --since="2 hours ago" --all` で 3 repo の今回作業 commit を一覧

---

## 9. Rollback

| シナリオ | 戻し方 |
|---|---|
| filter-repo 中で誤動作 | 抽出 clone (`vibe-base-extract-*`) は破棄して再 clone（vibe-base 本体に影響なし） |
| vibe-governance / vibe-audits 出力が壊れた | バックアップディレクトリ（`vibe-governance-init-backup-2026-05-20` 等）から `mv` で復元 |
| vibe-base の削除 commit が誤り | `git reset --hard HEAD~1` で削除 commit 取消（ただし `git rm` の reflog 内で可能） |
| 全工程やり直したい | 各 repo を init backup tag (`init-skeleton-2026-05-19`) に reset --hard |

backup ディレクトリは **1 週間** 保持後マスター確認のうえ削除（工程 2-5 完了確認後を目処）。

---

## 10. Risk register

| # | リスク | 重度 | 対策 |
|---|------|----|------|
| R1 | filter-repo の pip インストールが PowerShell で失敗 | 中 | T1 で確認 NG なら即停止 + マスター報告（Python 環境問題） |
| R2 | filter-repo 出力に予期しないファイルが残る（path 指定漏れ） | 中 | T3 / T5 の検証で `ls` 全件チェック・想定外あれば再 filter-repo |
| R3 | vibe-base 削除 commit 後に products/ ビルドが壊れる | 高 | 想定内（工程 2-2 達成条件の副作用）。マスター承認済中間状態 |
| R4 | filter-repo が日本語パス（`docs/standards/` 内）で文字化け | 低 | filter-repo は UTF-8 ネイティブ対応・git config core.quotepath false で対処可 |
| R5 | 雛形 init commit の tag backup 漏れ | 低 | T2 で明示・検証コマンドあり |
| R6 | vibe-base の dirty/untracked ファイルがプライベート情報含む | 中 | T0 で個別判定 + .gitignore 追記方針確認 |

---

## 11. Definition of Done

すべて満たすこと:

- [ ] T0〜T9 全タスク EXIT 0
- [ ] T8 の機械検証 4 件 EXIT 0
- [ ] vibe-governance / vibe-audits / vibe-base の 3 repo 状態を `git log --oneline -1` で確認できる
- [ ] backup tag (`init-skeleton-2026-05-19`) が vibe-governance / vibe-audits で確認できる
- [ ] backup ディレクトリ（`vibe-governance-init-backup-2026-05-20` / `vibe-audits-init-backup-2026-05-20`）存在
- [ ] vibe-governance/memory.md P1#1 で工程 2-2 が ✅ 済（パス・実体・git log 3 点照合明記）
- [ ] マスターへ完了報告（3 行 / ファイル数 / commit hash / 次工程） → 承認

---

## 12. 役割分担表

| 担当 | 作業範囲 |
|---|---|
| Claude（vibe-base 司令塔） | T0〜T9 全実行・各タスク検証コマンド実行・マスターへの報告 |
| マスター（人間） | T0 untracked 6 件の個別判定（.gitignore 追加 or 削除）/ Python 環境確認 / 最終承認 |
| Subagent | なし（本計画は分業対象なし。ただし plan-document-reviewer-prompt subagent が本 plan file を別途レビュー予定） |

---

## 13. ADR ポインタ

- 関連 ADR: `vibe-governance/docs/adr/0001-auto-hearing-plan-mode.md`（移転後の新所在）
- 関連設計書: `vibe-governance/docs/structure-vision-2026-05-19.html`（番号 [37]-[69] の段階 2 全貌）/ `vibe-governance/docs/structure-dependency-map-2026-05-19.html`（依存 80 件・工程 2-3 で参照）

---

## 14. Reviewer hint（3 軸）

- **Completeness**: T0〜T10 + 検証 + rollback + Definition of Done すべて記述済
- **Spec Coverage**: 工程 2-2 達成条件「新 repo 存在・vibe-base 消失・git 履歴保持」3 点を T3+T6+T8 で網羅
- **Buildability**: 全 Task に検証コマンド + 期待 EXIT 0 を明記・実体 path は探索で確認済

---

## 15. 所要時間見積

- T0〜T10 順次実行で **2〜3 時間**（filter-repo 実行 + 検証 + 報告含む）
- マスター判定待ち時間（T0 untracked 個別判定）は別途
