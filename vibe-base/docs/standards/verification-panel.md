# 検証パネル — 5レンズ独立検証 + 選別マトリクス + 多様性計測 + 閉ループ（canonical）

> 制定: 2026-07-02（plan: `~/.claude/plans/jaunty-knitting-panda.md`・マスター指示「効果検証なき形式チェックの根本解決」）
> 本ファイルが**判断基準の単一正本**。agent 定義（`~/.claude/agents/`）・skill・rules は本ファイルを参照し、基準を複製しない（Reference-over-Redundancy）。

## 設計原則

1. **自己採点禁止**: 実装した worker 自身に検証させない。検証は fresh context の独立サブエージェントが行う（Anthropic 公式 best-practices 準拠・Worker/Evaluator 分離）
2. **判断基準と思考の癖を明示定義**: 各レンズは「何を証拠に PASS/FAIL するか（判断基準）」と「どういう偏りで見るか（思考の癖）」を定義に持つ。無指定だと全員が同じ優等生に収束し同じ見落としをする
3. **多様性は計測対象**: レンズ間の視点差は祈るものでなく、指標（後述）で機械監視する
4. **反証モード**: 検証プロンプトは「チェックして」でなく「反証を試みろ・反証根拠を具体化できたら FAIL」
5. **AI 自己規律不信**: 発火・記録・評価はマトリクス/ログ/check-in で機械強制する

## レンズ定義（5体・全員 read-only・明示呼出のみ）

| レンズ | agent / model | 思考の癖 | 判断基準（PASS/FAIL の証拠） |
|--------|--------------|---------|--------------------------|
| ①機械 | `verify-agent` / haiku | 癖なし＝機械条件以外は一切判定しない | EXIT code / sha256 / Glob 件数 / 実体存在 / diff --stat。**機械条件のみ**（意味照合は④の縄張り・重複禁止） |
| ②正当性 | `code-reviewer` / sonnet | 悲観主義者。「壊れている前提」で反証を探す | 壊れる入力・状態の再現手順を1本具体化できたら FAIL。再現手順なき懸念は指摘のみ（advisory） |
| ③セキュリティ | `security-reviewer` / sonnet | 攻撃者。「これをどう悪用するか」 | 攻撃経路（入口→到達→影響）の具体化1本で FAIL。secrets 露出・injection・権限昇格・外部送信 |
| ④仕様適合 | `spec-audit-agent` / sonnet | 会計士。書面と寸分違わぬ照合のみ | plan 受入基準との**意味的** 1対1対照表 + スコープ外 diff（plan 影響範囲外の変更）検知。機械条件は①に委ね重複禁止 |
| ⑤UX品質 | `ux-quality-reviewer` / sonnet | 初見ユーザー。「初めて見て迷うか」 | `docs/standards/design-yardstick/` golden set 照合・金太郎飴判定。**LP/マーケ系 UI のみ**（業務 UI 非適用） |

- **縄張り排他**: ①と④は同じ受入基準を見るが、①=機械実行可能条件のみ / ④=意味照合+スコープ監査のみ。⑤の design-yardstick 照合は②から移管済（②はロジック反証に専念）
- **明示呼出のみ**: 検証系5体は自動委譲の対象外。description に明記し、orchestrator がマトリクス照合で呼ぶ
- **skill との役割分担**: `/security-review`・`/code-review` 系 skill = orchestrator 自身が回す手順書。検証パネル agent = fresh context の独立検証者。判断基準はどちらも本ファイルが正本（二重ドリフト禁止）

## 出力書式（統一・重複判定の機械化のため厳守）

各レンズの指摘は 1 件 1 行:

```
file:line — [カテゴリタグ] — 指摘1行
```

- カテゴリタグ: `LOGIC` / `SEC` / `SPEC` / `SCOPE` / `UX` / `MECH`
- 重複の機械定義: **file:line とカテゴリタグの両一致** = 同一指摘
- 末尾に総合判定 1 行: `VERDICT: PASS` / `VERDICT: FAIL(blocking)` / `VERDICT: FAIL(advisory)`
- 指摘 0 件は `no issues` + `VERDICT: PASS`

## FAIL 2階級（orchestration-discipline 規律3 と連動）

| 階級 | 定義 | commit への効果 |
|------|------|----------------|
| **blocking** | ①の機械 FAIL（EXIT≠0・実体不在・sha256 不一致）/ ③の実証済み攻撃経路 / ④のスコープ外 diff 検知 | **commit 禁止**（規律3） |
| **advisory** | 上記以外の全指摘（②の再現手順なき懸念・⑤の品質指摘・改善提案） | commit 可。指摘は引継ぎ/バックログへ記録 |

反証モードは false-FAIL を構造的に増やすため、advisory で commit を止めない（警報疲れ→パネル迂回＝閉ループ死を防ぐ）。

## 選別マトリクス（orchestrator はここを照合してレンズを選ぶ・裁量禁止）

| 変更種別 | 必須レンズ |
|---------|-----------|
| docs/md のみ | ① |
| コード変更（scripts/app ロジック） | ①② |
| secrets / auth / hook / permission / 外部通信 を含む | ①②③ |
| UI/LP 変更 | ①②⑤ |
| plan 完遂宣言・マイルストーン完了判定 | 全員（⑤は UI 変更を含む時のみ） |

- 既定は 1〜2 体（コスト規律）。**checkout での5体全員発火は禁止**（全員はゲート判定・plan 完遂時のみ）
- 複数種別に該当する場合はレンズの和集合

## 実行ログ（runs.jsonl・多様性指標の算出元）

パネル呼出のたびに orchestrator が `~/.claude/logs/verification-panel-runs.jsonl` へ **1 行アトミック追記**（1 write）:

```json
{"ts":"2026-07-02T12:00:00Z","run_id":"<plan名 or commit短hash>","trigger":"checkout|gate|plan-complete","lenses":["mech","logic"],"findings":{"logic":3},"dup_pairs":1,"adopted":2,"verdicts":{"mech":"PASS","logic":"FAIL(advisory)"}}
```

- `findings`=レンズ別指摘数 / `dup_pairs`=file:line+タグ一致の重複組数 / `adopted`=orchestrator/マスターが採用（修正に反映）した指摘数
- 記録漏れは check-in A-24 のクロスチェック（telemetry がパネル系 agent の発火を検知したのに対応 run 記録なし → WARN）で機械検出

## 多様性指標（check-in A-24 が runs.jsonl から機械算出）

| 指標 | 算出 | 劣化シグナル（WARN 閾値の初期値） |
|------|------|---------------------------------|
| 指摘重複率 | dup_pairs ÷ 総指摘数（直近30日） | > 30% = 癖が収束・レンズ定義を離す |
| 採用率 | adopted ÷ 総指摘数（直近30日） | < 20% = 過剰検出・癖を抑制調整 |
| 全員一致率 | （算出保留・データ蓄積のみ） | ゲート実行がサンプル月数件のため当面ノイズ。runs.jsonl に貯めて後日算出 |

## 閉ループ（計測 → 評価 → 改善 → 検証）

| ループ入力（検知経路） | 更新対象 |
|----------------------|---------|
| 見逃し流出（PASS 後に不具合発覚 = failures.md / P3 記録） | 該当レンズの判断基準に反例を追記 |
| 採用率低下（A-24 WARN） | 該当レンズの思考の癖を抑制調整 |
| 指摘重複率上昇（A-24 WARN） | レンズ定義の縄張り再設計 |
| dead agent（A-24 WARN・30日ゼロ発火） | 定義の description/選別マトリクス見直し or 廃止提案 |
| worker 側の再発パターン（failures.md） | worker プロンプト・選別マトリクス改訂 |

改善候補は `docs/ops/master-instruction-patterns.md` Part1 バックログへ追記し、**マスターゲート承認後**に agent 定義を改修（before/after を runs.jsonl で比較）。AI が無承認で自分の検証基準を緩める経路を禁止する。

### failure-loop 接続（2026-07-07 新設）

失敗の自己学習ループ（`scripts/failure-loop.mjs`・checkout A-5/B-2.6・check-in A-21+/A-27）は本パネルと同じゲート原則に従う:
- **AI が無承認で検知・hook・辞書語彙・閾値を追加/削除/緩和する経路を禁止**。全て Part 1b 起票→マスターゲート
- 新検知は advisory/WARN 固定で導入。blocking 化は観測窓（14日 or 10 check-in）の候補却下率 < 30% を必要条件として実測データ添付で起票
- 閾値の正本は `scripts/_lib/negative-feedback-dict.mjs` の THRESHOLDS（変更はマスターゲート）

## 関連

- 発火計測: `scripts/agent-telemetry.mjs`（増分スキャン・dead-agent 検知）/ check-in 検証: `scripts/check-in-verify.sh` A-24
- 規律: `docs/rules/orchestration-discipline-canonical.md` 規律3（blocking FAIL のみ commit 禁止）
- agent 定義規律: `.claude/rules/subagent-ops.md` + `docs/standards/templates/subagent-definition-checklist.md`
- 発火マップ: `docs/ops/trigger-map.md`
