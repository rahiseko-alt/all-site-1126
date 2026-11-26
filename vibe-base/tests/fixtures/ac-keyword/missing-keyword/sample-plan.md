# Sample Plan (keyword absent)

## Context
本 fixture は受け入れ基準に機械検証 keyword が一切ないケースを再現します。
Stage 1 (plan-schema-gate) は通過しますが Stage 2 (ac-keyword-gate) で block されます。

## 影響範囲
- 修正: なし

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | fixture 配置 | orchestrator | 目視確認 |

## リスク
特になし

## テスト方針
1. ac-keyword-gate で block されること (目視照合)

## 受け入れ基準

WHEN 本 fixture を ac-keyword-gate に流す THE SYSTEM SHALL block する

1. 動くこと: 期待通り
2. 完成すること: 期待通り
3. 正しいこと: マスター承認
4. 安全であること: マスター承認
5. 整合性: マスター承認

## 機械検証可能条件
意図的にすべて目視判定。

## 承認後モード
default
