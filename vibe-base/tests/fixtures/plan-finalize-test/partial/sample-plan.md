# Sample Plan (Stage 3 partial fixture)

## Context
本 fixture は受け入れ基準 5 項目中 1 項目だけプレースホルダ (Run:/Expected: 欠落) のケースを再現します。
`/plan-finalize` は Stage 0 完全性確認で NG を検出し、該当項目を報告して終了します。

## 影響範囲
- 修正: なし

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | fixture 配置 | orchestrator | Step 2 |
| 2 | /plan-finalize で NG 検出 | verify-agent | Stage 0 で停止 |

## リスク

| リスク | 検知 | 対応 |
|--------|------|------|
| Stage 0 false positive | dry-run で `bash -n` | Run: 行修正 |

## テスト方針
1. /plan-finalize が項目 #3 の Run/Expected 欠落を報告して停止

## 受け入れ基準

WHEN /plan-finalize に本 fixture を渡す THE SYSTEM SHALL 項目 #3 の Run/Expected 欠落を検出して停止すること

1. fixture 存在確認

   Run: `test -f tests/fixtures/plan-finalize-test/partial/sample-plan.md`
   Expected: EXIT 0

2. 受け入れ基準セクション抽出成功

   Run: `grep -c "^## 受け入れ基準" tests/fixtures/plan-finalize-test/partial/sample-plan.md`
   Expected: 1

3. 項目 #3 はプレースホルダ (意図的に Run:/Expected: 欠落)

4. 各項目の存在確認

   Run: `grep -cE "^[0-9]+\\." tests/fixtures/plan-finalize-test/partial/sample-plan.md`
   Expected: >= 5

5. Run: 行件数照合

   Run: `grep -c "Run:" tests/fixtures/plan-finalize-test/partial/sample-plan.md`
   Expected: 4 (5 項目中 1 項目欠落のため)

## 機械検証可能条件
- `Glob: tests/fixtures/plan-finalize-test/partial/sample-plan.md` → 1 件
- `grep -c "Run:" 本 fixture` → 4 (== 5 - 1)
- 項目 #3 は `bash -n` 通せない (コマンド記載自体無し)

## 承認後モード
default
