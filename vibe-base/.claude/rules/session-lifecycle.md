---
description: セッション開始・終了・引き継ぎ時の必須手順。全作業に適用
---
# session-lifecycle — ポインタ

⚠️ **Check-in 着手前に canonical 本体を必ず Read せよ。**

詳細仕様（全文）→ `docs/rules/session-lifecycle-canonical.md`

## 要点（3 行）
- Check-in: 自 memory.md → 自治憲法 → 直近 plan → 現在地 → 報告
- Check-out: memory.md P1 更新 → コミット前チェック → コミット → EXIT
- /clear 前後: ミニ Check-out（P1 メモ+コミット）→ 即時 Check-in
- 引き継ぎ詳細手順 → `docs/ops/handoff-protocol.md`
- memory.md 運用手順（分散運用・Check-in/Check-out詳細）→ `docs/ops/memory-ops.md`
