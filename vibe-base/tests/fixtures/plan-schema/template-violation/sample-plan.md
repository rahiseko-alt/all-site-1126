# Sample Plan (template violation)

## Context
本 fixture は受入条件のテンプレ違反 (検証手段欠落・素の文章のみ) を再現します。

## 影響範囲
- 修正: なし

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | fixture 配置 | orchestrator | Step 2 |
| 2 | テンプレ違反確認 | verify-agent | EXIT 0 |

## リスク
特になし

## テスト方針
1. plan-schema-gate に流して block されること

## 受け入れ基準

WHEN plan-schema-gate に本 fixture を流す THE SYSTEM SHALL block する

1. 動くことを目指す
2. 何かを完成させる
3. きちんと整えること
4. 最終的に良くなる
5. 概ね問題ない状態にする

## 機械検証可能条件
N/A (検証手段欄を意図的に欠落させたサンプル)

## 承認後モード
default
