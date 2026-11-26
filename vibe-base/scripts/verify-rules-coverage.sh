#!/bin/bash
# #4 定期検証: docs/ops/ の全SOPが .claude/rules/ からカバーされているか検査
# 手動実行: bash scripts/verify-rules-coverage.sh

GOV="$(cd "$(dirname "$0")/.." && pwd)"
PRODUCTS="$(node "$GOV/scripts/repo-paths.mjs" --products-root)"
RULES_DIR="$GOV/.claude/rules"
OPS_DIR="$GOV/docs/ops"

# 意図的除外リスト（SOPではない or 司令塔専用で稀な操作）
# ui-clone-sop.md=skill 付録（正本は ui-clone/SKILL.md）/ vest1-inventory.md=棚卸し結果成果物（SOPではない）
EXCLUDED="project-promotion.md shared-asset-ops.md beginner-dns-nav.md revision-history.md ui-clone-sop.md vest1-inventory.md"

echo "=== ルールカバレッジ検証 ==="
echo ""

TOTAL=0
COVERED=0
UNCOVERED=0
UNCOVERED_LIST=""

for SOP in "$OPS_DIR"/*.md; do
  SOPNAME=$(basename "$SOP")
  TOTAL=$((TOTAL + 1))

  # 意図的除外チェック
  SKIP=0
  for EX in $EXCLUDED; do
    if [ "$SOPNAME" = "$EX" ]; then
      SKIP=1
      break
    fi
  done
  if [ "$SKIP" -eq 1 ]; then
    echo "  [除外] $SOPNAME"
    continue
  fi

  # .claude/rules/ 内を検索
  if grep -rl "$SOPNAME" "$RULES_DIR/" >/dev/null 2>&1; then
    COVERED=$((COVERED + 1))
    echo "  [OK]   $SOPNAME"
  else
    UNCOVERED=$((UNCOVERED + 1))
    UNCOVERED_LIST="$UNCOVERED_LIST  - $SOPNAME\n"
    echo "  [MISS] $SOPNAME"
  fi
done

echo ""
echo "=== @import検証 ==="
echo ""

# 非アクティブプロダクト除外リスト（再起動時に@import追加して除外から外す）
INACTIVE="affiliate-lp microscope profile video-studio"

IMPORT_OK=0
IMPORT_MISS=0
IMPORT_MISS_LIST=""

for PCLAUD in "$PRODUCTS"/products/*/CLAUDE.md; do
  PRODUCT=$(echo "$PCLAUD" | sed 's|.*/products/||;s|/CLAUDE.md||')

  # 非アクティブ除外チェック
  SKIP_PROD=0
  for INACT in $INACTIVE; do
    if [ "$PRODUCT" = "$INACT" ]; then
      SKIP_PROD=1
      break
    fi
  done
  if [ "$SKIP_PROD" -eq 1 ]; then
    echo "  [凍結] $PRODUCT"
    continue
  fi

  if grep -q '@.*docs/ops/agent-rules.md' "$PCLAUD" 2>/dev/null; then
    IMPORT_OK=$((IMPORT_OK + 1))
    echo "  [OK]   $PRODUCT"
  else
    IMPORT_MISS=$((IMPORT_MISS + 1))
    IMPORT_MISS_LIST="$IMPORT_MISS_LIST  - $PRODUCT\n"
    echo "  [MISS] $PRODUCT"
  fi
done

echo ""
echo "=== CLAUDE.md行数 ==="
LINES=$(wc -l < "$GOV/CLAUDE.md")
if [ "$LINES" -gt 60 ]; then
  echo "  [WARN] ${LINES}行（上限60行を超過）"
else
  echo "  [OK]   ${LINES}行（上限60行以内）"
fi

echo ""
echo "=== サマリ ==="
echo "SOP総数: $TOTAL / カバー済み: $COVERED / 未カバー: $UNCOVERED / 除外: $(echo $EXCLUDED | wc -w)"
echo "@import: OK=$IMPORT_OK / 漏れ=$IMPORT_MISS"
echo "CLAUDE.md: ${LINES}行"

if [ "$UNCOVERED" -gt 0 ] || [ "$IMPORT_MISS" -gt 0 ] || [ "$LINES" -gt 60 ]; then
  echo ""
  echo "⚠️ 問題あり"
  if [ "$UNCOVERED" -gt 0 ]; then
    echo "未カバーSOP:"
    echo -e "$UNCOVERED_LIST"
  fi
  if [ "$IMPORT_MISS" -gt 0 ]; then
    echo "@import漏れ:"
    echo -e "$IMPORT_MISS_LIST"
  fi
  exit 1
else
  echo ""
  echo "✅ 全項目OK"
  exit 0
fi
