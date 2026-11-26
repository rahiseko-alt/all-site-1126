#!/usr/bin/env bash
# stub-subagent-stop-hook.sh — ダミー SubagentStop hook（fixture 専用・本番登録なし）
#
# SubagentStop イベントが配備された際に発火するかを検証するための stub。
# 発火証跡として FIXTURE_OUT にタイムスタンプを書き込む。
#
# 使用方法:
#   FIXTURE_OUT=/tmp/subagent-stop-hook-fired.txt bash stub-subagent-stop-hook.sh

set -euo pipefail

OUT="${FIXTURE_OUT:-/tmp/stop-hook-65169-subagent-fired.txt}"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "SubagentStop hook fired at ${TIMESTAMP}" >> "${OUT}"
echo "[STUB] SubagentStop hook: wrote to ${OUT}" >&2

exit 0
