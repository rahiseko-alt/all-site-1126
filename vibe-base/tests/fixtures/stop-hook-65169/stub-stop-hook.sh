#!/usr/bin/env bash
# stub-stop-hook.sh — ダミー Stop hook（fixture 専用・本番登録なし）
#
# 本番 settings.json に Stop イベントが追加された場合に
# このスクリプトが発火するかを検証するための stub。
# 発火証跡として FIXTURE_OUT（デフォルト: /tmp/stop-hook-fired.txt）にタイムスタンプを書き込む。
#
# 使用方法:
#   FIXTURE_OUT=/tmp/stop-hook-fired.txt bash stub-stop-hook.sh

set -euo pipefail

OUT="${FIXTURE_OUT:-/tmp/stop-hook-65169-stop-fired.txt}"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "Stop hook fired at ${TIMESTAMP}" >> "${OUT}"
echo "[STUB] Stop hook: wrote to ${OUT}" >&2

exit 0
