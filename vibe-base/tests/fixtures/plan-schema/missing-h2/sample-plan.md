# Sample Plan (missing "## 受け入れ基準" H2)

## Context
本 fixture は「## 受け入れ基準」H2 が欠落しているケースを再現します。

## 影響範囲
- 修正: なし (fixture 単体)

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | 何もしない | orchestrator | N/A |

## リスク
N/A

## テスト方針
1. plan-schema-gate.mjs に流すと block されること

## 承認後モード
default
