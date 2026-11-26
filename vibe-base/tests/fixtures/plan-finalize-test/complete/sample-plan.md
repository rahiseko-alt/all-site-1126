# Sample Plan (Stage 3 complete fixture)

## Context
本 fixture は受け入れ基準 5 項目全件に Run:/Expected: が記入済のケースを再現します。
`/plan-finalize` は Stage 0 完全性確認を PASS し、Step 1-6 の判定に進みます。

## 影響範囲
- 修正: なし

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | fixture 配置 | orchestrator | Step 2 |
| 2 | /plan-finalize 動作確認 | verify-agent | EXIT 0 |

## リスク

| リスク | 検知 | 対応 |
|--------|------|------|
| Stage 0 false negative | dry-run で `bash -n` | Run: 行修正 |

## テスト方針
1. /plan-finalize が Step 0 を PASS して Step 1-6 に進むこと

## 受け入れ基準

WHEN /plan-finalize に本 fixture を渡す THE SYSTEM SHALL Stage 0 PASS で承認後モード判定へ進むこと

1. fixture 存在確認

   Run: `test -f tests/fixtures/plan-finalize-test/complete/sample-plan.md`
   Expected: EXIT 0

2. 受け入れ基準セクション抽出成功

   Run: `grep -c "^## 受け入れ基準" tests/fixtures/plan-finalize-test/complete/sample-plan.md`
   Expected: 1

3. 受入条件項目 5 件以上

   Run: `grep -cE "^[0-9]+\\." tests/fixtures/plan-finalize-test/complete/sample-plan.md`
   Expected: >= 5

4. 各項目に Run: 行存在

   Run: `grep -c "Run:" tests/fixtures/plan-finalize-test/complete/sample-plan.md`
   Expected: >= 5

5. 各項目に Expected: 行存在

   Run: `grep -c "Expected:" tests/fixtures/plan-finalize-test/complete/sample-plan.md`
   Expected: >= 5

## 機械検証可能条件
- `Glob: tests/fixtures/plan-finalize-test/complete/sample-plan.md` → 1 件
- `grep -c "Run:" 本 fixture` → >= 5
- `grep -c "Expected:" 本 fixture` → >= 5

## 承認後モード
acceptEdits (理由: fixture のみ、protected paths 編集なし)
