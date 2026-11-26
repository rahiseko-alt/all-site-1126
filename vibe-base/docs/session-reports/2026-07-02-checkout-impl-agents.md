# 2026-07-02 Check-out — 実装/調査系7体を検証系と同水準へ改善（DoD + 最小権限 + 統一構造）

> **次セッションは本ファイルを先頭から Read してから着手すること。**
> branch: master / 本セッション commit: `c2172c522`（7体改善）+ `f92f67d83`（フェンス横断修正）
> 同 branch 上に並行セッション（kosespark video-shorts）の commit が交互に入っている。push なし（ローカルのみ・ahead 15）。
> 前提: 前回 report `2026-07-02-checkout-self-improvement.md`（検証系5体・計測層）。本ファイルはその続き（実装系7体）。

---

## 🔴 最重要

1. **前ミッション完了**: 「残り実装/調査系7体を検証系と同水準へ」（memory.md P1 #0）は**本セッションで完遂**。P1 から外した。検証系5体＋実装/調査系7体の**全12体が同一品質基準**（役割/思考の視点 or 思考の癖/完了の証拠定義 or 判断基準/起動前提/動作原則/返却フォーマット）に統一。
2. **機械強制が1つ増えた**: check-agents-spec に **A-7.6**（実装系7体は `## 完了の証拠定義`=DoD 見出し欠落で **NG**・`## 思考の視点` 欠落で WARN）。以後、実装系 agent 定義を触るときは DoD 見出しを消すと check-in が赤くなる。
3. **フェンス誤検知の横断穴を根治**: 見出し検査（A-7.5/A-7.6 共通）が ``` コードブロック内の疑似見出しを本物と誤検知する欠陥を、パネル②が dogfooding で実証検出→同日 `linesOutsideCodeFences()` で一括修正→再現テスト実証。閉ループ1周（Part1 #11 を起票→修正済に更新）。

---

## A. 本セッション TL;DR

1. 現状把握: 7体の定義 Read + `telemetry --report` で品質ギャップを表化（素Bash 2体・英語3体・DoD/視点 全欠）
2. 公式リサーチ照合（research-analyst）: DoD 推奨・最小権限推奨・persona 非推奨（役割記述のみ）・責務境界原則を確認
3. Plan Mode 設計 → マスター3判断（fullstack=cross-cutting専用に存続 / debugger=存続改修 / 癖=DoD中心・視点軽く1行）→ 承認（plan: `~/.claude/plans/jaunty-knitting-panda.md` を本タスク用に上書き）
4. 7体を統一構造化（`##` 見出し統一・当初 `#` で書いて A-7.6 不整合→全て `##` に是正）
5. debugger・fullstack の素Bash→スコープ化 / research・debugger・fullstack を日本語化 / fullstack description を cross-cutting 専用に排他化
6. check-agents-spec **A-7.6** 追加（implement-agent 委譲）+ subagent-definition-checklist 追記 + backup-agents ミラー同期（12体 SAME）
7. 検証パネル dogfooding ②③④（⑤=UIなし対象外）: ③PASS / ②④advisory（blocking 0）→ commit
8. ②検出の advisory（フェンス誤検知）を同日横断修正・再現テスト実証・Part1 #11 更新

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| `c2172c522` | feat(agents) | 実装/調査系7体の統一構造化 + DoD + 最小権限 + A-7.6 + checklist |
| `f92f67d83` | fix(check-agents-spec) | 見出し検査のフェンス除外（A-7.5/A-7.6 横断修正）+ Part1 #11 更新 |
| *(本 checkout)* | chore(memory) | 引継ぎ MD + memory.md 更新 |

## C. 影響波及（必読）

- **check-agents-spec に A-7.6 追加**: 実装系7体（explore/implement/backend-eng/frontend-eng/debugger/fullstack/research-analyst）は `## 完了の証拠定義` 必須。新規実装系 agent 追加時は `IMPLEMENTATION_PANEL` allowlist に追記。
- **見出し検査がフェンス除外に変わった**: `linesOutsideCodeFences()` 経由。返却フォーマット等の ``` 内に `## ...` を書いても必須見出しとしてカウントされない（実見出しはフェンス外に置くこと）。
- **fullstack-developer の description が排他化**: 「backend/frontend にまたがり分割不能な cross-cutting 専用・単体は各専門 agent へ」。自動委譲の発火挙動が変わる可能性（過剰縮小＝発火ゼロ化したら telemetry で検知し境界文言を調整）。
- **debugger/fullstack の tools がスコープ化**: 素Bash 廃止。実タスクで必要コマンドが不足したら最小追加（原則3）。

## D. 残作業

| 優先度 | 内容 |
|-------|------|
| M | パネル残 advisory（前回分）: telemetry の count=max マージ合流過小（delta merge 化）/ findLastNewlineEnd 例外 TOCTOU → master-instruction-patterns 経由で改修 |
| M | A-22 既存 WARN（hook 実行時故障の疑い・secret-write-gate）切り分け |
| M | 改善効果の実測: 次セッション以降 telemetry で7体の発火数推移を観察（description 改変で自動委譲精度が落ちていないか・fullstack 過剰縮小がないか） |
| L | checkout skill の skills-base repo 同期（前回からの継続 L） |

## E. 配備済 subagent / skill / hook

- **subagent 改修7**: explore-agent / implement-agent / backend-engineer-agent / frontend-engineer-agent / debugger / fullstack-developer / research-analyst（正本 `~/.claude/agents/`・ミラー同期済）
- **検証追加**: check-agents-spec **A-7.6**（DoD 見出し必須）+ `linesOutsideCodeFences()`
- **文書**: subagent-definition-checklist B/D 節追記 / master-instruction-patterns Part1 #11
- hook 新設なし・skill 新設なし

## F. 本セッション生成レポート

- 本ファイル + plan `~/.claude/plans/jaunty-knitting-panda.md`（本タスク用に上書き済）
- 計測: `~/.claude/logs/verification-panel-runs.jsonl`（run `impl7-uplift` 追記済・blocking 0）

## G. 次セッション初手

1. 本ファイル + memory.md P1 を Read
2. commit 前検証はマトリクス照合（verification-panel.md）を通す（従来どおり）
3. 新規に着手すべき自己改善対象があるか telemetry で確認（`node scripts/agent-telemetry.mjs --report`）。7体改善の効果測定（発火数推移）も並行して観察
4. D 残作業 M に着手する場合は master-instruction-patterns Part1 経由で起票から

- 機械検証（Wave A-2）: **PASS 2 / SKIP 1**（check-agents-spec EXIT 0・secret-grep 0 / npm 系 N-A）
- 検証パネル（Wave A-3）: 本セッション diff は実装中に ②③④ dogfooding 済（③PASS・②④advisory=修正/工程・blocking 0・runs.jsonl 記録済）。checkout 時点の git diff HEAD は別セッション分のみ＝A-3 skip
