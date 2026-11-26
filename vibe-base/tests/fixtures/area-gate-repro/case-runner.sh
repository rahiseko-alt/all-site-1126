#!/bin/bash
# case-runner.sh — area-gate fixture テストランナー
# 使い方: bash tests/fixtures/area-gate-repro/case-runner.sh
# 実行場所: vibe-base ルート

VIBE_BASE="$(cd "$(dirname "$0")/../../.." && pwd)"
GATE="$VIBE_BASE/.claude/hooks/area-gate.mjs"
FIXTURE_DIR="$(dirname "$0")"

pass=0
fail=0

run_test() {
  local name="$1"
  local input="$2"
  local expect_exit="$3"
  local expect_has_block="$4"  # "yes" or "no"

  stdout=$(echo "$input" | node "$GATE" 2>/tmp/case-runner-stderr.tmp)
  actual_exit=$?
  stderr=$(cat /tmp/case-runner-stderr.tmp)

  # Check if stdout contains "decision":"block"
  if echo "$stdout" | grep -q '"decision":"block"'; then
    has_block="yes"
  else
    has_block="no"
  fi

  exit_ok=false
  block_ok=false
  [ "$actual_exit" -eq "$expect_exit" ] && exit_ok=true
  [ "$has_block" = "$expect_has_block" ] && block_ok=true

  if $exit_ok && $block_ok; then
    echo "[PASS] $name (exit=$actual_exit, has_block=$has_block)"
    pass=$((pass+1))
  else
    echo "[FAIL] $name"
    echo "  Expected: exit=$expect_exit, has_block=$expect_has_block"
    echo "  Actual:   exit=$actual_exit, has_block=$has_block"
    echo "  STDOUT: $stdout"
    echo "  STDERR: $stderr"
    fail=$((fail+1))
  fi
}

echo "=== area-gate fixture tests ==="
echo ""

# Test 1: plans area — should pass through (exit 0, no block)
run_test "plans-passthrough" \
  "$(cat "$FIXTURE_DIR/case-allowed-area.json")" \
  0 "no"

# Test 2: research-bank — should block (exit 0, decision=block in stdout)
run_test "research-bank-block" \
  "$(cat "$FIXTURE_DIR/case-blocked-area.json")" \
  0 "yes"

# Test 3: malformed JSON — should gracefully exit 0
run_test "malformed-input-graceful" \
  "$(cat "$FIXTURE_DIR/case-malformed-input.json")" \
  0 "no"

# Test 4: syntax-error fixture self-check (node --check)
node --check "$FIXTURE_DIR/case-syntax-error.mjs" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "[PASS] case-syntax-error.mjs is valid JS (safe fixture)"
  pass=$((pass+1))
else
  echo "[FAIL] case-syntax-error.mjs unexpectedly has syntax error"
  fail=$((fail+1))
fi

echo ""
echo "=== Results: $pass passed, $fail failed ==="
exit $fail
