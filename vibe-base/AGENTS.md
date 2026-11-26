# Codex Project Conventions

この `AGENTS.md` は Codex 用の入口であり、Vibe*base の正本ルールを再定義しない。判断に迷ったら、以下の順に正本を読む。

1. `CLAUDE.md`
2. `docs/standards/plan-mode.md`
3. `.claude/rules/*.md`
4. `docs/rules/*-canonical.md`

## 共通憲法

- `CLAUDE.md` の Refactor-on-Write / Reference-over-Redundancy / Self-Correction Loop を Codex でも遵守する。
- 1 フォルダ = 1 エージェント。作業ディレクトリ範囲外の編集は、ユーザーの明示指示または許可がある場合だけ行う。
- 製品作業では、作業前に `products/{product}/CLAUDE.md` と `products/{product}/memory.md` P1 を読む。
- シークレット、`.env*`、`secrets/`、`.git/`、本番デプロイ、force push、破壊的操作は Claude 側 deny/ask の意図を Codex でも守る。
- 未検証を確認済みとして報告しない。検証できない場合は、できなかった理由を明示する。

## Plan Mode 運用規律

Plan Mode の canonical は `docs/standards/plan-mode.md`。`.claude/rules/plan-mode.md` は pointer。

- Claude Code では `.claude/settings.json` の `permissions.defaultMode: "plan"` により全セッションを Plan Mode から始める。
- Codex では Claude Code の権限モード自体は起動できないため、多ファイル変更・影響範囲不明・設計判断を含む作業では、編集前に同等の read-only 調査と plan 化を手動で再現する。
- 立案中の codebase 調査は `explore-agent`、承認後の実装は `implement-agent`、受け入れ基準の機械検証は `verify-agent` に委譲する。Codex のツール規約で subagent 起動が許可されない場合は、同じ責務分離を手元の読み取り・編集・検証で再現し、その制限を必要時だけ報告する。
- plan ファイルに「新規作成」と書く全 path は、書く前に必ず Glob / `test -f` 相当で実体不在を確認する。
- `pre-write-glob-check` は canonical では撤去済み。新規 path の安全担保は、立案時の手動 Glob 義務と native Write-before-Read 制約に委譲する。

## Plan 雛形

- `/plan-template [タスク名]`: plan ファイルの固定見出し構造を出力する。
- `/plan-finalize [plan ファイル path]`: 承認後モードを判定し plan に書き込む。
- plan の保存先は `.claude/settings.json` の `permissions.plansDirectory: "./docs/ops/plans"` に従う。

## Codex Hooks

- Codex 側 hooks は `.codex/hooks.json` に置く。
- Claude 側 hooks の正本は `.claude/settings.json` と `.claude/hooks/`。Codex 側はそのうち Codex で安全に実行できるものだけを移植する。
- canonical で撤去された hook を Codex 側に復活させない。

## ADR

- `docs/adr/0001-plan-mode-c-design.md`: Plan Mode の A/B 抹消と C 採用の決定経緯。
