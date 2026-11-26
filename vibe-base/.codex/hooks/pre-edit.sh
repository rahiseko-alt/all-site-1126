#!/bin/bash
# PreToolUse:Write|Edit — 本番ファイル無断変更防止（問題3対策）
# matcher は Write|Edit（Session 303: skills/agents/commands 書き込みガードの Write 経路を塞ぐ）
# .vercel/ ディレクトリが存在するプロダクト配下のファイルを本番とみなす
# ハードコード不要 — vercel linkした時点で自動的に保護対象になる

INPUT=$(cat)
FILE=$(echo "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).tool_input.file_path)}catch(e){console.log('')}})")

if [ -z "$FILE" ]; then
  exit 0
fi

# バックスラッシュをスラッシュに正規化
FILE=$(echo "$FILE" | sed 's|\\|/|g')

# .claude/skills・agents・commands の書き込みガード（v2.1.119 ガード弱体化対策）
if echo "$FILE" | grep -qE '/\.claude/(skills|agents|commands)/'; then
  SKILL_MARKER="${CLAUDE_PROJECT_DIR:-/c/Users/user/Desktop/ClaudeCode/vibe-base}/.allow-skill-edit"
  if [ -f "$SKILL_MARKER" ]; then
    NOW=$(date +%s)
    MTIME=$(stat -c %Y "$SKILL_MARKER" 2>/dev/null || stat -f %m "$SKILL_MARKER" 2>/dev/null || echo 0)
    AGE=$((NOW - MTIME))
    if [ "$AGE" -lt 600 ]; then
      RELPATH=$(echo "$FILE" | sed 's|.*/vibe-base/||')
      echo "✅ スキル書き込みを承認マーカーにより許可: $RELPATH (承認後 ${AGE}秒)" >&2
      exit 0
    fi
    echo "⚠️ 承認マーカーが期限切れです (${AGE}秒経過 / 上限600秒)。touch で更新してください: $SKILL_MARKER" >&2
  fi
  RELPATH=$(echo "$FILE" | sed 's|.*/vibe-base/||')
  echo "⚠️ スキル/エージェント/コマンドの書き込みはマスターの明示的指示が必要です: $RELPATH" >&2
  echo "承認する場合: touch \"$SKILL_MARKER\" （10分間有効）" >&2
  exit 2
fi

# products/ 配下でなければ無視
if ! echo "$FILE" | grep -q '/products/'; then
  exit 0
fi

# 設定ファイル・ドキュメントは対象外（CLAUDE.md, pc-progress.html, docs/, .md）
BASENAME=$(basename "$FILE")
if echo "$BASENAME" | grep -qE '^(CLAUDE\.md|memory.md\.md|pc-progress\.html)$'; then
  exit 0
fi
if echo "$FILE" | grep -qE '/docs/'; then
  exit 0
fi
if echo "$FILE" | grep -qE '/tmp/'; then
  exit 0
fi

# ファイルパスから上方向に .vercel/ を探す
DIR=$(dirname "$FILE")
FOUND_VERCEL=0
while [ "$DIR" != "/" ] && [ "$DIR" != "." ]; do
  if [ -d "$DIR/.vercel" ]; then
    FOUND_VERCEL=1
    break
  fi
  DIR=$(dirname "$DIR")
done

if [ "$FOUND_VERCEL" -eq 1 ]; then
  # 承認マーカー検査: プロジェクトルート（.vercel が見つかったDIR）に
  # .allow-prod-edit があり、かつ mtime が 10分(600秒)以内なら通過
  MARKER="$DIR/.allow-prod-edit"
  if [ -f "$MARKER" ]; then
    NOW=$(date +%s)
    MTIME=$(stat -c %Y "$MARKER" 2>/dev/null || stat -f %m "$MARKER" 2>/dev/null || echo 0)
    AGE=$((NOW - MTIME))
    if [ "$AGE" -lt 600 ]; then
      RELPATH=$(echo "$FILE" | sed 's|.*/vibe-base/||')
      echo "✅ 本番ファイル編集を承認マーカーにより許可: $RELPATH (承認後 ${AGE}秒)" >&2
      exit 0
    fi
    echo "⚠️ 承認マーカーが期限切れです (${AGE}秒経過 / 上限600秒)。touch で更新してください: $MARKER" >&2
  fi
  RELPATH=$(echo "$FILE" | sed 's|.*/vibe-base/||')
  echo "⚠️ 本番デプロイ済みプロダクトのファイルです: $RELPATH" >&2
  echo "このファイルの変更にはマスターの明示的指示が必要です。" >&2
  echo "承認する場合: touch $DIR/.allow-prod-edit （10分間有効）" >&2
  exit 2
fi

exit 0
