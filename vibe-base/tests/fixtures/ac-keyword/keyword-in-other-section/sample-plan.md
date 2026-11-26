# Sample Plan (keyword outside acceptance section)

## Context
本 fixture は機械検証 keyword が他セクションには存在するが
「## 受け入れ基準」内には存在しないケースを再現します。
Stage 1 (plan-schema-gate) は通過しますが Stage 2 で block されます。

## 影響範囲
- 修正: なし

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | fixture 配置 | orchestrator | `EXIT 0` (このセクションには keyword あり) |
| 2 | npm run lint (見せかけ) | implement-agent | git diff 確認 |

## リスク

| リスク | 検知 | 対応 |
|--------|------|------|
| `Glob:` 誤検知 | `grep -c` | テンプレ修正 |

## テスト方針
1. ac-keyword-gate で block されること

## 受け入れ基準

WHEN 本 fixture を ac-keyword-gate に流す THE SYSTEM SHALL block する

1. 動くこと: 期待通り
2. 完成すること: 期待通り
3. 検証手段: 目視確認のみ
4. テンプレ準拠: 目視
5. 整合性: 目視

## 機械検証可能条件
このセクションには `EXIT 0` keyword あり (Stage 2 は受け入れ基準内のみ検査)

## 承認後モード
default
