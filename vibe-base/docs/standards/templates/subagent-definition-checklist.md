# サブエージェント定義 書くことチェック表

公式仕様（`code.claude.com/docs/en/sub-agents.md`）準拠。`~/.claude/agents/{name}.md` を
作成・改修する際のチェックリスト。運用規律 → `.claude/rules/subagent-ops.md`

## A. Frontmatter（YAML）

| 項目 | 区分 | 公式仕様 | 記入推奨例 |
|------|------|---------|-----------|
| `name` | **必須** | 小文字・ハイフンのみ。ファイル名と一致不要 | `code-reviewer` |
| `description` | **必須** | いつ使うかを自然言語で。`Use proactively` / `Use when` 句で自動委譲精度UP | `"Expert code review specialist. Use proactively after code changes."` |
| `tools` | 推奨 | カンマ区切り許可リスト。省略=親の全ツール継承 | `Read, Grep, Glob, Bash` |
| `model` | 推奨 | `sonnet`/`opus`/`haiku`/`inherit`/フルID。省略=`inherit` | `sonnet` |
| `disallowedTools` | 任意 | 拒否リスト（親から除去） | `Edit, Write` |
| `maxTurns` | 任意 | 最大ターン数（超過で自動停止） | `20` |
| `permissionMode` | 任意 | `default`/`acceptEdits`/`auto`/`plan` 等 | `auto` |
| `skills` | 任意 | 起動時プリロードするスキル | `api-conventions` |
| `memory` | 任意 | `user`/`project`/`local` | `user` |
| `isolation` | 任意 | `worktree` 指定で隔離実行 | `worktree` |
| `background` | 任意 | 並行実行（`true` で permission auto-deny） | `true` |
| `effort` | 任意 | `low`〜`max` | `high` |
| `color` | 任意 | UI 表示色 | `blue` |

## B. システムプロンプト本文（frontmatter 以降）

| 要素 | 区分 | 公式推奨の書き方 |
|------|------|----------------|
| 役割定義 | **必須** | 冒頭 `You are a senior...` で role を明示 |
| When invoked | 推奨 | 着手時の段取りを番号付きで |
| チェックリスト | 推奨 | 目視確認すべき項目を箇条書き |
| 出力形式 | 推奨 | 結果の提示形式（優先度分け等） |
| 評価基準 | 推奨 | 判定軸（カバレッジ閾値・複雑度など） |
| デザイン品質 | UI/レビュー系のみ | デザインを産出/レビューする agent は `docs/standards/design-yardstick/` の golden set で骨格パラダイムを照合する旨を本文に明記。**適用は LP/マーケ系のみ**（業務 UI＝管理画面/EC 一覧/フォームには適用しない）。self-check 側は PASS/FAIL 確定をせず骨格確認まで（judge 分離設計） |
| 思考の癖 | **検証系のみ必須** | 検証パネル所属（`verify-agent` / `code-reviewer` / `security-reviewer` / `spec-audit-agent` / `ux-quality-reviewer`）は本文に `## 思考の癖` 見出しで意図的な視点の偏りを明記する。無指定だと全レンズが同じ優等生に収束し多様性が失われるため。正本: `docs/standards/verification-panel.md`（レンズ定義を複製せず参照のみ） |
| 判断基準 | **検証系のみ必須** | 検証パネル所属は本文に `## 判断基準` 見出しで PASS/FAIL の証拠定義を明記する（反証モード: 反証を具体化できたら FAIL）。基準の複製は禁止（Reference-over-Redundancy）、正本 `docs/standards/verification-panel.md` を参照する |
| 出力書式 | **検証系のみ必須** | 検証パネル所属は返却フォーマットを `file:line — [タグ] — 指摘1行` + `VERDICT:` 行で統一する（重複判定の機械化のため） |
| 完了の証拠定義 | **実装・調査系のみ必須** | 実装パネル所属（`explore-agent` / `implement-agent` / `backend-engineer-agent` / `frontend-engineer-agent` / `debugger` / `fullstack-developer` / `research-analyst`）は本文に `## 完了の証拠定義` 見出しで DoD（物証で示す完了条件）を明記する。DoD 欠落は check-agents-spec A-7.6 が NG 検出。`## 思考の視点`（軽い1行の意図的視点）は推奨（欠落は WARN）。正本: 本チェックリスト |
| **成果物パスの申告欄** | **実装系・検証系は必須（M-3）** | 実装系（`implement-agent` 等）・検証系（`verify-agent` 等）の subagent 定義は、完了報告の返却フォーマットに **成果物パスを申告する欄**を設ける。申告されたパスは `verify-agent` の管轄拡張（M-3）が `ls` / `wc -l` / `sha256sum` で実在・中身を機械照合する（パス不在 or `wc -l` 0 行は FAIL）。**申告のない subagent（探索系等）は対象外**（種別ごとに成果物定義が異なり汎用ゲート化しないため、申告ベースに限定する設計）。正本: `.claude/agents/verify-agent.md`（照合ロジック） / 本チェックリスト（申告欄の書式義務） |

## C. 書くべきでないもの（公式が「自動ロード済み」と明記）

- 親 `CLAUDE.md` の内容（全階層自動注入される）
- git status（自動スナップショット済み）
- システム環境情報（作業ディレクトリ等）
- 存在しないエージェントへの「Integration with other agents」参照
- VoltAgent 向け JSON Communication Protocol / Progress tracking ブロック（Claude Code では機能しない）

## D. 検証

`node scripts/check-agents-spec.mjs`（check-in-verify A-19）で frontmatter を機械検証:
- 公式フィールドのみ（A 節の公式全項目）
- 必須フィールド存在（name / description）
- name が kebab-case
- **UI 専業 agent は品質基準スキルを `skills` でプリロード（A-7.4）**: `frontend-engineer-agent` は `skills: web-design` 必須（欠落で NG）。対象は `check-agents-spec.mjs` の `UI_SKILL_REQUIRED` allowlist で管理。新規 UI 専業 agent 追加時は allowlist に追記する
- **実装・調査系 agent は `## 完了の証拠定義`（DoD）を本文に必須（A-7.6）**: 欠落で NG。`## 思考の視点` は推奨（欠落で WARN）。対象は `check-agents-spec.mjs` の `IMPLEMENTATION_PANEL` allowlist で管理

- **Codex mirror は手編集禁止**: `.codex/agents/*.toml` は `.claude/agents/*.md` から `node scripts/sync-codex-agents-from-claude.mjs` で生成する

## E. 出典

公式: https://code.claude.com/docs/en/sub-agents.md
