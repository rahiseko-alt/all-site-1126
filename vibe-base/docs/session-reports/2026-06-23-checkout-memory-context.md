# Check-out 2026-06-23 — memory context 圧迫 根治（全product共通）

> branch: master / 次セッションは本ファイルを先頭から Read してから着手すること。

## 🔴 最重要
- **context 圧迫の真因＝memory 機構が毎セッション静的テキストを全文ロード＋書込量上限が機械強制されていなかった**。前セッションの「全部 harness 固定費・削れない」は誤り。
- 新 hook **memory-size-gate.mjs**（PreToolUse Write|Edit|MultiEdit・全27product＋root登録）で memory 系のバイト上限を**書込時 deny** 強制。今後 `failures.md ≤28KB / memory.md ≤12KB / MEMORY.md ≤10KB / session-report ≤10KB`。超過 Write は block されるので、超える時は archive 退避してから書く。

## A. 本セッション TL;DR
1. 原因2系統を実測分離: 注入（agent-rules @import 34KB・MEMORY.md 死蔵）/ 書込（pc-checkin の failures.md 全文Read）。
2. agent-rules: @import パス据置きで本体を 34,001→1,294B に縮小、canonical を `docs/rules/agent-rules-canonical.md` へ退避（product毎 約-11kトークン）。
3. MEMORY.md 死蔵3件を archive へ掃除（9,439→7,740B・全セッション auto-load 軽量化）。
4. memory-size-gate.mjs 新設（書込時バイト上限・MultiEdit累積対応・fail-open）。全27product伝播・integrity PASSED。
5. scripts/memory-prune-check.mjs（MEMORY死蔵検出 advisory）・scripts/failures-recent.sh（failures抜粋・全文Read代替で24,262→9,666B・-60%）新設。
6. pc-checkin SKILL.md に「failures.md 全文Read禁止・failures-recent.sh で代替」明記。
7. verify-agent 独立検証 8/8 PASS。code-reviewer 指摘の有効2件（MultiEdit経路・read堅牢化）修正、誤検知2件は実機で反証。

## B. 完了 commit 一覧
（本 Check-out commit に下記すべてを含む。hash は commit 後に確定）

## C. 影響波及（必読）
- **memory 系ファイルはバイト上限 gate 配下**。failures.md/memory.md/MEMORY.md/session-report への Write/Edit/MultiEdit は上限超で block される。超える編集は先に archive 退避。閾値変更は `.claude/hooks/memory-size-gate.mjs` の BUDGETS。
- agent-rules の全文は `docs/rules/agent-rules-canonical.md`（on-demand Read）。`docs/ops/agent-rules.md` はポインタ。思考原則・UI哲学等の詳細が要る時は canonical を読む。
- repo外の変更2件（vibe-base git に未反映）: ① pc-checkin `~/.claude/skills/pc-checkin/SKILL.md`（**skills 別repo**・別途 commit/push 要否をマスター判断）② MEMORY.md auto-memory（git管理外・ディスク反映済）。

## D. 残作業
- [完了] AC9 実証済（2026-06-23）: x-auto-post 新セッション実測で agent-rules @import=**514 tok**（旧≈12k）・product の Memory files **約21.5k→10k（-11.5k/セッション）**。注入側・書込側とも live 稼働確認。
- [M] failures.md 本体の archival 縮小（現24KB・gate は28KBで stop-growth のみ。古い[S✓]の整理は別タスク）。
- [M] pc-checkin SKILL.md（skills別repo）の commit/push 反映。
- [L] size-gate 閾値の運用後再校正（誤blockが出たら BUDGETS 調整）。

## E. 配備済 hook / skill
- 新 hook: `.claude/hooks/memory-size-gate.mjs`（PreToolUse Write|Edit|MultiEdit・全27product＋root・manifest登録済）。
- 新 script: `scripts/memory-prune-check.mjs`・`scripts/failures-recent.sh`。
- 改修: `pc-checkin` SKILL.md（failures 全文Read禁止）。

## F. 本セッション生成レポート
- plan 正本: `docs/ops/plans/2026-06-23-memory-context-bloat-fix.md`（ルートC変更・受入9件・全PASS）。
- fixture: `tests/fixtures/memory-size-gate/`（gate 単体テスト・block/pass/MultiEdit累積）。

## G. 次セッション初手
1. 本ファイルを Read。
2. AC9（/context 実測）が未なら product 新セッションで確認しマスター報告。
3. 機械検証サマリ: verify-agent 8/8 PASS / check-hook-integrity PASSED / code-reviewer 有効2件修正済・誤検知2件反証済。
