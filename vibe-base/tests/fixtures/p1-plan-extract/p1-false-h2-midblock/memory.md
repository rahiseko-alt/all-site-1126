# memory.md — fixture: p1-false-h2-midblock
# 構造: P1 → ## P2用メモ(偽 H2) → path
# 主張: 別軸 false-negative — P1 内の ## P2... 形の偽 H2 行が f=0 を誘発し以降が脱落
# 現挙動を回帰アンカーとして固定。expected=空。awk 修正は本 plan scope 外（別タスク）。

## P1: 現在地
本文。

## P2用メモ
この行は ^## P[0-9] にマッチしてしまい f=0 になる（偽 H2）。

- 直近 plan: docs/ops/plans/2026-06-07-p1-false-h2.md
