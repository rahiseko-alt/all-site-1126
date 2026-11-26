# 2026-07-04 Check-out — トークン消費内部監査ツール構築 + サブエージェント欠落バグ発見・修正

> **次セッションは本ファイルを先頭から Read してから着手すること。**
> branch: master / 本セッションは vibe-base 司令塔（root）

---

## 🔴 最重要

1. **トークン消費監査ツール一式を新設した**: `scripts/token-audit/`（lib.mjs / audit.mjs / verify.mjs / category-model-crosstab.mjs / strategy-analysis.mjs / pricing.json / work-map.json）。マスターの「最近トークン消費が重い」という体感を実データで検証するツール。全22プロジェクト・5週間分のログを解析し、`outputs/token-usage-strategy.md`（gitignore・非コミット）に戦略資料を出力。
2. **Check-out の検証パネル(code-reviewer)が自作ツールの重大バグを発見した**: `~/.claude/projects/<proj>/<sessionId>/subagents/agent-*.jsonl`（1階層ネストされたサブエージェント transcript・全1,597ファイル）を、当初の非再帰走査ロジックが完全に見落としていた。この結果「サブエージェント消費は$算出不能」とマスターに誤報告していた。実機確認で178セッションに実データ入りの subagents/ ディレクトリが実在すると確定し、再集計で総額 $9,956→**$11,154**(+12.0%)に修正、サブエージェント消費$1,141.24(10.2%)を新規に可視化した。
3. **plan-finalize.md を軽量化した**（マスター承認済み・実装完了）: 手順1の plan 全文重複Read削除・手順0.5-2の pc-checklist.md 全文ReadをG-PNセクションのgrep抜粋に変更。順守度への影響なし(手順0で既読の内容を再読していただけ・pc-checklist.mdの各G-PNセクションは独立構造のため抜粋で情報欠落なし)。

---

## A. 本セッション TL;DR

1. マスターの「トークン消費が重い」相談 → Plan Mode で調査計画を作成・承認（推論不要・機械実行可能な閾値固定の計画）。モデルを Sonnet 5 に切替。
2. `scripts/token-audit/` 一式を実装（Step1-9）: サブエージェント名寄せ調査(当初「不能」と誤判定) → 料金表確定 → cwd→作業種別対応表 → コアパーサ → コスト計算 → 多軸集計 → 検証/試作ループ判定 → レポート生成 → 突合検証(±1%以内PASS)。
3. マスターの深掘り質問に順次対応: 「司令塔だから高いのか」→cwd別avg$/msgはほぼ横並びと実証（場所は無関係・単純にメッセージ数最多なだけ）。「目的に沿わない」指摘 → トークン種別別$内訳・プロセス儀式$内訳・セッション長相関の3軸を追加分析。
4. `/usage` 公式診断（92%サブ多用セッション・78%長文脈・61%長時間セッション・15%並列）をマスターが実行 → 平易な言葉で解説 + 4指標が独立指標(足して100%にならない)である旨を説明。「PCつけっぱなしで寝てる」仮説を実際にログの空白時間解析で検証 → 大半のケースで放置時間中は課金ゼロ、真因はセッションを閉じずに翌日へ引きずる cache_read 肥大化と判明。
5. `/checkout` 実行 → Wave A-3(code-reviewer)が上記🔴2のバグを検出 → 実機で反証を確認 → `lib.mjs` に共通ロジックを集約し4スクリプトの重複バグを根治 → 全スクリプト再実行・突合検証PASS・戦略資料訂正版に更新。

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| （本 checkout） | feat(token-audit) | scripts/token-audit/ 一式新設 + plan-finalize.md 軽量化 + memory.md/session-report更新 |

## C. 影響波及

- `outputs/token-audit-report.md` / `token-audit.csv` / `token-audit-raw.json` / `token-usage-strategy.md` は `outputs/` gitignore 対象のため非コミット。再生成は `node scripts/token-audit/audit.mjs` 等で可能（再現性あり・ログファイルは各PC環境依存のためコミット不要）。
- `.claude/commands/plan-finalize.md` の変更は次回 `/plan-finalize` 実行時から有効。順守度への影響はないと確認済み（本セッションでマスターへ説明済み）。
- 既存の他セッション由来と思われる大量の M/?? ファイル（x-auto-post, kosespark, spire-lite, shift-ai, .codex/agents 等）を確認したが、本セッションでは一切触れておらず、git add 対象から除外（並行セッション環境のパス限定commit規律・memory feedback_path-scoped-commit-in-parallel-sessions.md 準拠）。

## D. 残作業

| 優先度 | 内容 |
|-------|------|
| M | サブエージェント運用の格上げ検討——10.2%(1,141ドル)は無視できない規模。general-purpose($7.92/起動)・implement-agent($5.27/起動)等の高単価サブの呼出頻度精査、Explore/code-reviewerのような安価Haiku系サブへの置換余地を検討（`outputs/token-usage-strategy.md` §4推奨アクション#4参照） |
| L | セッションが200msgsを超えたら区切る運用の定着（`/cost`が$15〜20を超えたら境界の目安、と本セッションでマスターに説明済み。習慣化は今後の課題） |
| L | 他セッション由来の大量 untracked ファイル（shift-ai配下のポートフォリオ多数・spire-lite godotファイル群等）の整理はスコープ外・触らない |

## E. 配備済 subagent / skill / hook

- 新規スクリプト: `scripts/token-audit/{lib,audit,verify,category-model-crosstab,strategy-analysis}.mjs` + `pricing.json` + `work-map.json`
- subagent/skill/hookの新規追加なし（既存の code-reviewer / verify-agent を Check-out Wave A で呼出したのみ）

## F. 本セッション生成レポート

- `outputs/token-audit-report.md`・`token-audit.csv`・`token-audit-raw.json`・`token-usage-strategy.md`（いずれも gitignore・非コミット・再生成可能）
- plan: `~/.claude/plans/vast-juggling-wall.md`（トークン消費内部監査ツール計画・承認済み・完遂）

## G. 次セッション初手

1. 本ファイル Read。
2. 残作業Dの M 項目（サブエージェント運用格上げ検討）が次の実質的な着手対象。マスターと相談の上で優先度判断。
3. トークン監査ツールは再利用可能。マスターが再度「消費が重い」と感じたら `node scripts/token-audit/audit.mjs` から再実行するだけで最新データが得られる。

- 機械検証（Wave A-2）: node --check 全5ファイルPASS / secret-grep 0件 / npm test-typecheck-lint は root にスクリプト未定義でN/A
- 検証パネル（Wave A-3・code-reviewer）: 当初FAIL(advisory) 3件検出 → 全件実機確認の上で修正 → 再検証PASS（サブエージェント欠落バグ根治・verify.mjsパスバグ根治・丸め誤差による偽FAILバグ根治）
