#!/bin/bash
# scripts/failures-recent.sh
#
# pc-checkin 用: failures.md の「全文 Read」を避け、必要部分だけを抜粋出力する。
# failures.md は 1 行が長文化し 24KB 超のため、全文 Read は毎チェックイン context を ~8k トークン圧迫する。
# 抜粋 = (1) 機械検証昇格済/対象タグ行 [S✓]/[S]（再発防止の要） + (2) 直近 15 行（最新の教訓）。
#
# 使い方:
#   bash scripts/failures-recent.sh [path]    # default: vibe-base ルート failures.md
#
# 参照: docs/ops/plans/2026-06-23-memory-context-bloat-fix.md

set -uo pipefail

BASE_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
F="${1:-$BASE_DIR/failures.md}"

if [ ! -f "$F" ]; then
  echo "failures-recent: not found ($F)"
  exit 0
fi

TOTAL=$(grep -c '^- ' "$F")
SDONE=$(grep -cE '^- \[S✓\]' "$F")
SBACK=$(grep -cE '^- \[S\] ' "$F")
echo "# failures.md 抜粋（全文 Read の代替）"
echo "# 対象: $F"
echo "# サマリ: 全 ${TOTAL} 件 / [S✓] 機械強制済=${SDONE}（hook/script で enforce 済・再読不要）/ [S] 未昇格 backlog=${SBACK}"
echo ""
echo "## [S] 未昇格 backlog（まだ機械化されていない＝要留意）"
grep -nE '^- \[S\] ' "$F" || echo "  (なし)"
echo ""
echo "## 直近 15 行（最新の教訓）"
tail -15 "$F"
echo ""
echo "# [S✓] は機械強制済のため抜粋から除外。全文が要る時だけ failures.md を Read。"
