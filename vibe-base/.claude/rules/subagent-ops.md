---
description: サブエージェント運用規律（Session 303 確立）
paths:
  - "**/.claude/agents/*.md"
  - "scripts/check-agents-spec.mjs"
  - "scripts/backup-agents.mjs"
---

## サブエージェント運用規律（Session 303 確立）

### 配置・正本
- **正本（編集先）:** `~/.claude/agents/{name}.md`（user-level・cwd 非依存・全 repo から可視）
- **バックアップ（自動ミラー）:** `vibe-base/.claude/agents/{name}.md`（`node scripts/backup-agents.mjs` で正本から同期・**手編集禁止**）
- `~/.claude/` は git 管理外。ミラーが唯一の復元経路であり、**必ずコミットする**。

#### ⚠️ サブ消滅デッドロック（2026-07-09 実証）
「そのサブ経由でしか書けない」hook（例: `job-application-write-gate`）を repo に持つ場合、
**hook はコミットされ、正本サブは git 管理外**という非対称が生じる。PC 初期化や別マシンへの
clone でサブだけが消えると、親セッションは hook に deny され、サブは存在しない。誰もそのファイルを
書けなくなる。実測で親 EXIT 2 を確認済み。

- 新規サブを作ったら **同一セッション内で `node scripts/backup-agents.mjs` を実行しコミットする**
- 乖離は Check-in の **A-19c**（`backup-agents.mjs --check`）が NG 検出する
- 復元手順: `cp .claude/agents/{name}.md ~/.claude/agents/`
- 新 product 追加時は何もしなくてよい（user-level agents は cwd 非依存で全 product 自動可視）
- サブエージェントのルール・定義を変えるのは司令塔のみ。product は呼ぶだけ

### 定義ファイルの書き方
- frontmatter 必須: `name`（kebab-case）/ `description`（`Use when` / `proactively` 句で自動委譲精度を上げる）
- frontmatter 推奨: `tools`（許可リスト・省略時は親の全ツール継承）/ `model`
- 本文: 役割定義（`You are a senior...`）→ When invoked（番号付き）→ チェックリスト → 出力形式
- 書くな: 親 CLAUDE.md の重複 / git status（自動注入済み）/ 存在しないエージェントへの参照 / JSON Communication Protocol（VoltAgent 由来・Claude Code では機能しない）
- 検証: `node scripts/check-agents-spec.mjs`（check-in-verify A-19・frontmatter 機械検証）

### 背景実行制約（重要）
- background sub-agent は Write / Edit / Bash が auto-deny（承認者不在のため）
- **実装・修正系エージェント（fullstack-developer / debugger）はフォアグラウンドで呼べ**
- 背景実行が有効なのは read-only 系（research-analyst 等）のみ
- 各エージェントの `description` 末尾にも実行モード制約を明記する

### Claude Code + Codex 連携時の実運用ワナ（zenn t_vana4 記事 2026-05-26 / vibe-base 適用版・Session 2026-05-27 統合）

以下 6 件は Claude Code と Codex CLI を subagent として並列運用した際の実障害事例。vibe-base の hook / deny / plan 設計で対処済のものと未対処のものを分類して記載する。

| # | ワナ | vibe-base での現状 | 追加対処 |
|---|------|------------------|---------|
| W1 | GitHub Free の auto-merge / branch protection 無効 | settings.json deny + CLAUDE.md ルールで二重防御済 | 変更不要 |
| W2 | subagent が自身の PR を自動マージする | deny / hook で auto-merge 明示禁止未設定 | 下記 W2 ルール追加 |
| W3 | GitHub API 直接呼び出しの認証エラー | path-resolver / gh CLI 統一済（permission-defense.md 参照） | 変更不要 |
| W4 | Markdown マーカー行の行頭インデントで機能不全 | plan / handover ファイルで混入リスクあり | 下記 W4 注意追記 |
| W5 | worktree 自動命名ブランチの push 流出 | 未対処 | 下記 W5 バリデーション追加推奨 |
| W6 | 低頻度 → 高頻度移行時の潜伏バグ露呈 | orchestration-discipline 規律 1「動的再配分」と連携 | 高頻度ストレステストを plan に組み込む |

#### W2 追加ルール（定義ファイルへの明示義務）
- **subagent は自身が作成した PR / commit を自分でマージ・push することを禁止する**
- 定義ファイル (`~/.claude/agents/{name}.md`) の本文に以下を追記すること:
  ```
  Do NOT merge or approve PRs that you yourself created. Always leave merge to the human operator.
  ```

#### W4 追加注意（plan / handover ファイルの書式）
- Markdown ファイル内のマーカー行は **行頭から始めること**
- 行頭スペース 4 個以上はコードブロックとして解釈され、パターンマッチが機能しなくなる
- plan ファイル・handover 指示書・checklist すべてに適用

#### W5 推奨対処（branch 名バリデーション）
- background subagent が git push を行う際、branch 名が `feature/*` / `fix/*` / `chore/*` のいずれかの命名規則に合致することを事前検証
- 自動命名ブランチ（worktree デフォルト: `claude/task-XXXXX`）のそのままの push を防ぐ

#### W6 連携注意（高頻度運用への段階的移行）
- subagent の並列数を増やす際は「低頻度 1 体 → 中頻度 N 体 → 高頻度 N 体」の 3 段移行を踏む
- 段階移行なしに一気に並列数を上げると潜伏バグが同時多発する
- 参照: `orchestration-discipline.md` 規律 1「各 wave で並列可能な依存なし作業の単位を抽出」

### 詳細
→ `docs/standards/templates/subagent-definition-checklist.md`（書くことチェック表）
