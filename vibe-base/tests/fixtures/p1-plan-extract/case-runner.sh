#!/bin/bash
# case-runner.sh — p1-plan-extract fixture テストランナー
# 使い方: bash tests/fixtures/p1-plan-extract/case-runner.sh
# 実行場所: vibe-base ルート
#
# 目的: code-reviewer 指摘2（B-6 / pc-checkin STEP3 共有の P1 抽出 awk が
#       「P1 が最終セクション」で plan path を取りこぼす false negative）の
#       有効性を fixture で機械再検証する。前セッションの口頭評価を回帰テスト化。
#
# 写経元: scripts/check-in-verify.sh L336-337（B-6）。本番ロジックの忠実な写し。
#         ステップ4（grep 自己照合）で awk 抽出行のバイト一致を保証する。

FIXTURE_DIR="$(cd "$(dirname "$0")" && pwd)"

pass=0
fail=0

# fixture の memory.md から P1 ブロックの plan path を抽出（B-6 L336-337 写経）
extract_refs() {
  local mp="$1"
  local P1_BLOCK
  P1_BLOCK=$(awk '/^## P1/{f=1;next} /^## P[0-9]/{f=0} f' "$mp")
  echo "$P1_BLOCK" | grep -oE '([~A-Za-z0-9_./-]*/)?plans?/[A-Za-z0-9_./-]+\.md|[A-Za-z0-9_./-]*plan-[A-Za-z0-9_./-]+\.md' 2>/dev/null | sort -u
}

run_test() {
  local name="$1"
  local expect_count="$2"   # 期待抽出件数

  local refs
  refs=$(extract_refs "$FIXTURE_DIR/$name/memory.md")
  local count
  if [ -z "$refs" ]; then
    count=0
  else
    count=$(echo "$refs" | grep -c .)
  fi

  if [ "$count" -eq "$expect_count" ]; then
    echo "[PASS] $name (count=$count)"
    pass=$((pass+1))
  else
    echo "[FAIL] $name"
    echo "  Expected count: $expect_count"
    echo "  Actual count:   $count"
    echo "  Refs: $refs"
    fail=$((fail+1))
  fi
}

echo "=== p1-plan-extract fixture tests ==="
echo ""

# 指摘2 の核心: P1 が最終セクション（後続見出し無し）でも awk は EOF まで印字 → 非空
run_test "p1-last-section"      1
# P1 最終 + 複数行 + 空行でも安全
run_test "p1-multiline-last"    1
# 正常系: P1 限定が機能し P2 の path は拾わない
run_test "normal-p1-then-p2"    1
# ## P1.5 は ^## P1 に先マッチし f=1 維持で安全
run_test "p1-subheading-p15"    1
# H3 偽見出しは ^## 不一致で f=0 にならず安全
run_test "p1-h3-subsection"     1
# 別軸 false-negative: P1 内の ## P2... 形偽 H2 で以降脱落（現挙動固定・expected=空）
run_test "p1-false-h2-midblock" 0

echo ""
echo "=== Results: $pass passed, $fail failed ==="
exit $fail
