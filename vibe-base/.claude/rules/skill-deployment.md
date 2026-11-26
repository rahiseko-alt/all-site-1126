---
description: スキル配置規律（user-level 単一正本・Session 282 確立）
paths:
  - ".claude/skills/**"
  - "scripts/check-skills-spec.mjs"
---

## スキル配置規律（user-level 単一正本・Session 282 確立）

- **物理正本:** `~/.claude/skills/{name}/SKILL.md`（独立 git repo `rahiseko-alt/claude-skills-base`）
- **vibe-base 側には配置しない:** `.claude/skills/` は `.gitignore` で除外
- **配置判定:**
  - **C 群** (project-agnostic): そのまま新規作成（code-review / security-review / vercel-deploy 等）
  - **B 群** (軽依存): `$CLAUDE_PROJECT_DIR` のみ使用、絶対パス禁止
  - **A 群** (vibe-base 固有): `_shared/path-resolver.mjs` 経由でのみ参照（pc-checkin / deep-research / feed-check / learning-suite-add-kanji / fix-loop / create-image / masking-grep / formation / verification-panel-call / decommission-plan）。SKILL.md 内の呼出形式は **`node ~/.claude/skills/_shared/resolve-paths.mjs --vibe-root|--product-root|--vault-root|--master-name-file` CLI 形式に統一**（Session 283 確立・旧 `node --input-type=module -e "import(...)"` 形式は廃止。`Bash(node -e *)` ask 化と整合）
- **frontmatter 必須項目:** `name` / `description` / `short_label` / `usage_examples`
- **個人情報依存:** `~/.claude/settings.json` の env 経由でのみ注入（`MASTER_VAULT_ROOT` / `MASTER_NAME_FILE` 等）。vibe-base には書かない
- **検証:** `node scripts/check-skills-spec.mjs`（毎セッション check-in で実行・A-6 として組込）
- **復元（新環境 / PC リプレース）:** `cd ~/.claude && git clone https://github.com/rahiseko-alt/claude-skills-base skills`
- **新規 product 追加時:** 何もしなくて良い（user-level skills は cwd 非依存で全 product 自動可視）
