# Git ブランチ/フォーク運用 + ポートフォリオ公開ガイド

> **位置づけ**: Git 完全独立ロードマップ Phase D の**設計書**。本ガイドは方針と手順の骨子を定義する。個別の実走（特に D-3 の cron 製品移設）は本ガイドを参照しつつ**別 plan を起票**して行う。
> 上位 plan: `~/.claude/plans/github-vibe-base-github-git-github-dreamy-emerson.md`

## 前提

- 分離済み製品は `products/<name>/` に独立ローカル git リポ（`.git`）を持つ。
- 1軍製品のうち homepage, foodee, medguide-rag は GitHub 独立リポ（`rahiseko-alt/<name>`）を持つ。**coach は既存 PUBLIC リポ（2026-05-16 作成・別履歴）との整合調整のため GitHub 接続を保留中**（現状はローカル独立リポのみ・remote 未設定）。coach の GitHub 統合は D-1 の運用に沿って別途決定する。
- 新規製品は `scripts/init-product-repo.mjs` でローカル独立スタート（`docs/ops/new-product-sop.md` Step 6）。
- cron/secrets 依存の 4 製品（x-auto-post, google-slides-gen, shift-ai, ai-concierge）は現在 vibe-base root に残留し GitHub Actions 稼働中。これらの独立は D-3 の移設手順とセットで行う。

---

## D-1. feature branch / fork 運用

### 原則（ADR-0003 準拠）

- **統合は本体経由の `merge` → `push`。PR 経由の統合は禁止**（分岐の根治のため。詳細 → `docs/adr/0003-worktree-feature-branch-migration.md`）。
- ブランチはローカルで切り、ローカルで `merge` してから `push` する。GitHub 上での PR マージは使わない（履歴の分岐と乖離を生むため）。

### feature branch の基本フロー（製品リポ内）

```bash
cd products/<name>
git switch -c feature/<topic>        # ブランチを切る
# ... 作業・commit（path-scoped commit 規律は共通憲法どおり）...
git switch main
git merge --no-ff feature/<topic>    # 本体にローカル merge
git push origin main                 # 反映（remote がある製品のみ）
git branch -d feature/<topic>        # ブランチ削除
```

- `--no-ff` で feature の単位を履歴に残す（レビュー単位の可視化）。
- 大規模・並行作業は worktree を使う（`git worktree add ../<name>-<topic> feature/<topic>`）。統合は上記どおり本体で merge。

### fork の使い分け

| 用途 | 手段 |
|------|------|
| 自分の製品の機能追加・修正 | feature branch（fork 不要） |
| 他者 OSS への貢献・改変 | fork（upstream を remote に追加し追従） |
| 公開ポートフォリオの派生・実験公開 | fork（本体を汚さず実験リポを分ける） |

---

## D-2. public 化チェックリスト

private リポを public 化する前に**全項目を通過**させる。1 つでも未通過なら public 化しない。

| # | 項目 | 検証 |
|---|------|------|
| 1 | **secrets 全走査（git 履歴含む）** | 作業ツリー: `git -C products/<name> grep -inE 'sk-[A-Za-z0-9]{20,}\|ghp_[A-Za-z0-9]{20,}\|AKIA[0-9A-Z]{16}\|-----BEGIN'`。履歴: `git -C products/<name> log -p \| grep -iE '<同パターン>'`（履歴に混入があれば `git filter-repo` で除去してから公開） |
| 2 | **顧客情報・個人情報の除去** | 実顧客名・メール・電話・住所・実データの有無を目視 + grep。サンプル/ダミーに置換 |
| 3 | **LICENSE 配置** | `test -f products/<name>/LICENSE`（公開意図に合うライセンスを選定） |
| 4 | **README 整備** | 概要・セットアップ・スクショ・技術スタックが揃っている |
| 5 | **可視性変更** | `gh repo edit rahiseko-alt/<name> --visibility public --accept-visibility-change-consequences` |

- **第 1 号候補 = medguide-rag**（医療文書 RAG + 評価ループ・外部ポートフォリオ）。Stage 実装完了後に本チェックリストを通して公開する。
- 公開後も secrets 走査は継続（新規 commit に混入しないよう `secret-write-gate` hook が防御）。

---

## D-3. cron 4 製品の workflow 移設手順（骨子・実走は別 plan）

対象: **x-auto-post, google-slides-gen, shift-ai, ai-concierge**（GitHub Actions cron / secrets 依存で root 残留中）。

移設は稼働破壊のリスクが高いため、**1 製品ずつ・以下の順序を厳守**する。各製品ごとに別 plan を起票し、cron 空白帯で実施する。

### 順序（1 製品分）

1. **新リポ準備**: `gh repo create rahiseko-alt/<name> --private` → ローカル製品リポに remote 追加 → push（コード先行・workflow 未有効）。
2. **secrets 再登録**: root リポの Actions secrets を新リポに `gh secret set` で移す（値は貼付経路を作らず、マスター操作 or 既存の安全な取り込み経路を使う。憲法 §5.2 の secrets 貼付禁止を厳守）。
3. **workflow yml 移動**: root `.github/workflows/<name>-*.yml` を新リポ `.github/workflows/` へ移す。`working-directory: products/<name>` 等の root 前提パスを新リポ基準に書き換える。
4. **新リポで cron 有効化**: 新リポで Actions を有効にし、`workflow_dispatch` で 1 回手動実行して green を確認。
5. **root 側 cron 停止**: root の当該 yml を削除（または schedule 除去）→ commit → push。**新リポ稼働の green 確認後に停止する**（二重稼働の空白を作らない順序）。
6. **root untrack**: 製品コードを root から untrack（`scripts/migrate-products-to-repos.mjs --product=<name>`）。

### 注意

- **二重投稿/欠番リスク**（特に x-auto-post）: 状態ファイル（queue-meta / posted_index / scoring / topics）の唯一性を移設前後で担保する。移設は投稿 cron の空白帯に行い、新旧の同時稼働時間を作らない。
- **audit.yml 等の横断 workflow**: 移設製品のパス参照を除去する（`docs/ops/new-product-sop.md` / 本ロードマップ B-2 と同様）。
- 各移設 plan の受け入れ基準に「新リポ最初の cron run = success」「root 側 run が停止」「root untrack（`git ls-files products/<name>` = 0）」を含める。

---

## 関連参照

- `docs/adr/0003-worktree-feature-branch-migration.md` — ローカル merge・PR 経由禁止の決定経緯
- `docs/ops/new-product-sop.md` Step 6 — 新規製品の独立リポ初期化
- `scripts/init-product-repo.mjs` / `scripts/migrate-products-to-repos.mjs` — リポ初期化・分離スクリプト
- `~/.claude/plans/github-vibe-base-github-git-github-dreamy-emerson.md` — 上位ロードマップ（Phase A〜D）
