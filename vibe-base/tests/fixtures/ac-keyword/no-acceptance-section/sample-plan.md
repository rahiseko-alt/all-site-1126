# Sample Plan (no acceptance section)

## Context
本 fixture は「## 受け入れ基準」自体が存在しないケースを再現します。
Stage 1 (plan-schema-gate) で先に block されますが、Stage 2 単体起動時は
acceptance section が無いため exit 0 で抜けます (sil ent skip)。

## 影響範囲
- 修正: なし

## テスト方針
1. Stage 2 単体起動で `exit 0` (silent skip)
2. Stage 1 では block (`EXIT 0` 以外)

## 承認後モード
default
