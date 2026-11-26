#!/bin/bash
# PostToolUse:Write|Edit — ルール構造改革の持続性ガード（#1 SOP未カバー / #2 @import漏れ / #3 §3肥大化 / #4 運用フォルダ基盤チェック）

INPUT=$(cat)
FILE=$(echo "$INPUT" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).tool_input.file_path)}catch(e){console.log('')}})")

if [ -z "$FILE" ]; then
  exit 0
fi

FILE=$(echo "$FILE" | sed 's|\\|/|g')
BASE_DIR="${CLAUDE_PROJECT_DIR:-/c/Users/user/Desktop/ClaudeCode/vibe-base}"
RELPATH=$(echo "$FILE" | sed 's|.*/vibe-base/||')

# ============================================================
# #1: SOP未カバー検知 — docs/ops/*.md に書き込み時
# ============================================================
if echo "$RELPATH" | grep -qE '^docs/ops/[^/]+\.md$'; then
  SOPNAME=$(basename "$RELPATH")

  # 意図的除外はスキップ（SOPではない or 司令塔専用で稀な操作）
  case "$SOPNAME" in
    project-promotion.md|shared-asset-ops.md|beginner-dns-nav.md|revision-history.md|vest1-inventory.md|rule-structure-reform-audit.md) exit 0 ;;
  esac

  # .claude/rules/ 内の全ファイルの「詳細:」行を検索
  COVERED=0
  if grep -rl "$SOPNAME" "$BASE_DIR/.claude/rules/" >/dev/null 2>&1; then
    COVERED=1
  fi

  if [ "$COVERED" -eq 0 ]; then
    echo "{\"decision\":\"block\",\"reason\":\"⚠️ SOP未カバー検知: $SOPNAME が .claude/rules/ のどのファイルからも参照されていません。rulesファイルの『詳細:』行に追加するか、既存rulesのpathsでカバーしてください。\"}"
    exit 0
  fi
fi

# ============================================================
# #2: @import漏れ検知 — products/*/CLAUDE.md に書き込み時
# ============================================================
if echo "$RELPATH" | grep -qE '^products/[^/]+/CLAUDE\.md$'; then
  UNIX_FILE=$(echo "$FILE" | sed 's|^C:|/c|')
  if [ -f "$UNIX_FILE" ]; then
    if ! grep -q '@.*docs/ops/agent-rules.md' "$UNIX_FILE" 2>/dev/null; then
      echo "{\"decision\":\"block\",\"reason\":\"⚠️ @import漏れ検知: $RELPATH に @docs/ops/agent-rules.md が含まれていません。プロダクトCLAUDE.mdには @docs/ops/agent-rules.md の行を追加してください。\"}"
      exit 0
    fi
  fi
fi

# ============================================================
# #3: §3肥大化防止 — ルートCLAUDE.md に書き込み時
# ============================================================
if echo "$RELPATH" | grep -qE '^CLAUDE\.md$'; then
  UNIX_FILE="$BASE_DIR/CLAUDE.md"
  if [ -f "$UNIX_FILE" ]; then
    LINES=$(wc -l < "$UNIX_FILE")
    if [ "$LINES" -gt 60 ]; then
      echo "{\"decision\":\"block\",\"reason\":\"⚠️ §3肥大化検知: CLAUDE.md が ${LINES}行です（上限60行）。SOPの追加は .claude/rules/ で行い、CLAUDE.md には書かないでください。\"}"
      exit 0
    fi
  fi
fi

# ============================================================
# #4: 運用フォルダ基盤チェック — docs/ops/{subdir}/ 配下に書き込み時
# フォルダだけ作ってルール基盤を作らない問題を防止
# ============================================================
if echo "$RELPATH" | grep -qE '^docs/ops/[^/]+/'; then
  # サブディレクトリ名を抽出（docs/ops/research-inbox/foo.md → research-inbox）
  SUBDIR=$(echo "$RELPATH" | sed 's|^docs/ops/\([^/]*\)/.*|\1|')

  # 意図的除外: 汎用SOP3点が不要なサブディレクトリ（専用gate/正本SOP/area-gate登録で既にカバー）
  #   plans: plan-mode.md が正本SOP・plan-schema-gate が専用検証・area-gate 登録済。
  #          汎用 plans-sop.md を要求すると plan を正規置き場に書けず session-reports へ逃がす穴が生じる（2026-06-06 #5/#6 同根修正）
  case "$SUBDIR" in
    plans) exit 0 ;;
  esac

  # .gitkeep は無視
  if echo "$RELPATH" | grep -qE '\.gitkeep$'; then
    exit 0
  fi

  MISSING=""

  # 1. SOP存在チェック
  SOP_FILE="$BASE_DIR/docs/ops/${SUBDIR}-sop.md"
  if [ ! -f "$SOP_FILE" ]; then
    MISSING="${MISSING}\n  - docs/ops/${SUBDIR}-sop.md（SOP）"
  fi

  # 2. Rules存在チェック
  RULES_FILE="$BASE_DIR/.claude/rules/${SUBDIR}.md"
  if [ ! -f "$RULES_FILE" ]; then
    MISSING="${MISSING}\n  - .claude/rules/${SUBDIR}.md（自動注入ルール）"
  fi

  # 3. area-gate.mjs エントリチェック
  GATE_FILE="$BASE_DIR/.claude/hooks/area-gate.mjs"
  if [ -f "$GATE_FILE" ]; then
    if ! grep -q "$SUBDIR" "$GATE_FILE" 2>/dev/null; then
      MISSING="${MISSING}\n  - .claude/hooks/area-gate.mjs に ${SUBDIR} のエントリ（Hook強制）"
    fi
  else
    MISSING="${MISSING}\n  - .claude/hooks/area-gate.mjs が存在しない"
  fi

  # 4. session-lifecycle.md 動線マップ掲載チェック（読ませる仕組み）
  LIFECYCLE_FILE="$BASE_DIR/.claude/rules/session-lifecycle.md"
  if [ -f "$LIFECYCLE_FILE" ]; then
    if ! grep -q "$SUBDIR" "$LIFECYCLE_FILE" 2>/dev/null; then
      MISSING="${MISSING}\n  - .claude/rules/session-lifecycle.md の動線マップに ${SUBDIR} を追加（全エージェントへの読ませる仕組み）"
    fi
  fi

  if [ -n "$MISSING" ]; then
    echo "{\"decision\":\"block\",\"reason\":\"⛔ 運用フォルダ基盤未整備: docs/ops/${SUBDIR}/ にファイルを書こうとしましたが、ルール基盤が不足しています。\\n\\n手順書を先に読め: docs/standards/checklists/area-setup-checklist.md\\n\\n不足:\\n${MISSING}\\n\\n自己流で作るな。上記vest1の手順通りに作成せよ。\"}"
    exit 0
  fi
fi

exit 0
