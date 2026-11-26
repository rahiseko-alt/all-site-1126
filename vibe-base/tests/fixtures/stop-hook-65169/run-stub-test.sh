#!/usr/bin/env bash
# run-stub-test.sh — stop-hook-65169 fixture 単体テスト
#
# 本番 settings.json / hook を一切変更せず、
# stub スクリプト自体が正常動作するかを検証する。
#
# 使用方法（vibe-base ルートから）:
#   bash tests/fixtures/stop-hook-65169/run-stub-test.sh
#
# 終了コード:
#   0 = 全 stub PASS
#   1 = いずれかの stub FAIL

set -uo pipefail

FIXTURE_DIR="$(cd "$(dirname "$0")" && pwd)"
TMP_DIR="$(mktemp -d)"
PASS=0
FAIL=0

echo "=== stop-hook-65169 stub test ==="
echo "fixture dir : ${FIXTURE_DIR}"
echo "tmp dir     : ${TMP_DIR}"
echo ""

# --- E-1: stub-stop-hook.sh ---
OUT_STOP="${TMP_DIR}/stop-fired.txt"
FIXTURE_OUT="${OUT_STOP}" bash "${FIXTURE_DIR}/stub-stop-hook.sh" 2>/dev/null
if grep -q "Stop hook fired" "${OUT_STOP}" 2>/dev/null; then
  echo "[PASS] E-1: stub-stop-hook.sh 発火証跡確認"
  PASS=$((PASS + 1))
else
  echo "[FAIL] E-1: stub-stop-hook.sh 発火証跡なし"
  FAIL=$((FAIL + 1))
fi

# --- E-2: stub-subagent-stop-hook.sh ---
OUT_SUBAGENT="${TMP_DIR}/subagent-fired.txt"
FIXTURE_OUT="${OUT_SUBAGENT}" bash "${FIXTURE_DIR}/stub-subagent-stop-hook.sh" 2>/dev/null
if grep -q "SubagentStop hook fired" "${OUT_SUBAGENT}" 2>/dev/null; then
  echo "[PASS] E-2: stub-subagent-stop-hook.sh 発火証跡確認"
  PASS=$((PASS + 1))
else
  echo "[FAIL] E-2: stub-subagent-stop-hook.sh 発火証跡なし"
  FAIL=$((FAIL + 1))
fi

# --- E-3: PostToolUse[Agent] は runtime 依存のため stub テスト対象外 ---
echo "[SKIP] E-3: PostToolUse[Agent] — #65169 バグにより非発火。runtime 検証は実機必要（禁止）。"
echo "[SKIP] E-4: Stop hook 自動連鎖 — #65169 解消後に判断。"
echo "[SKIP] E-5: SubagentStop runtime 発火 — 実機検証対象外。"

# --- 清掃 ---
rm -rf "${TMP_DIR}"

echo ""
echo "=== 結果: PASS ${PASS} / FAIL ${FAIL} / SKIP 3 ==="

if [ "${FAIL}" -gt 0 ]; then
  exit 1
fi
exit 0
