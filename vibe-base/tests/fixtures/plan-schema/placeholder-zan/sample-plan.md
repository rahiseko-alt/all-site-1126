# Sample Plan (placeholder zanson)

## Context
本 fixture はプレースホルダ `[コマンド]` `TODO` 残存ケースを再現します。

## 影響範囲
- 修正: TBD

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | TODO で記入 | orchestrator | [コマンド] |

## リスク
TODO 後で記入

## テスト方針
1. plan-schema-gate に流して block されること

## 受け入れ基準

WHEN plan が plan-schema-gate に渡される THE SYSTEM SHALL block する

1. プレースホルダ検出: `grep -c TODO` で >= 1 → block 期待
2. `[コマンド]` 残存: 1 件以上 → block 期待
3. EXIT 0 で抜けないこと: `test -f` で本 fixture が `block` decision を出すこと

## 機械検証可能条件
- ac-keyword-gate を経由しても TBD のまま (Stage 1 で先に止まる)

## 承認後モード
default (理由: 後で記入)
