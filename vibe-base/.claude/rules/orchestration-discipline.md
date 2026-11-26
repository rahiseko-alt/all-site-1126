---
description: 複数エージェント並列展開時のフォーメーション規律と問題発見時の対応原則
---
# orchestration-discipline — ポインタ

⚠️ **マルチエージェント展開・plan 実走前に canonical 本体を必ず Read せよ。**

詳細仕様（全文）→ `docs/rules/orchestration-discipline-canonical.md`

## 要点（3 行）
- 規律 1: N 体並列指示時はフェーズごとに動的再配分・固定数禁止
- 規律 2: plan 実走中の問題発見時 4 原則（ゴール不変→ルート変更→シンプル→リサーチ）
- 規律 3: 完遂宣言 commit 前に検証パネル必須呼出（レンズ選定 = `docs/standards/verification-panel.md` 選別マトリクス・**blocking FAIL 1 件以上で commit 禁止**・advisory は記録して commit 可）

## plan 群の実行順

監査 2026-07 から起票した 7 本の plan は **1 本ずつ直列**に走らせる。順序と依存はマスター承認済で固定。実行者が入れ替えるな。

詳細: docs/ops/plan-execution-order.md（②→④→S群→自己学習→⑤→③→① / 共有ファイルの同時併走禁止 / 進捗表）

## 関連ナレッジ
- エージェンティック・ループ設計原則（トリガー / 読み取り専用アクセス / データ永続化 / goal 自律駆動 / コスト・モデル多層化の4原則）→ 詳細: `docs/ops/agentic-loop-principles.md`
- 自動実行 job（feed-fetch / hook-errors / token-audit / gsap-watch / settings-inventory の schtasks 定期実行 + PII gate / root-config-propagate のイベント駆動 hook・検知/レポート専用・state 規約・二重の網・PC 初期化時の再登録）→ 詳細: `docs/ops/automation-jobs.md`
