# orchestration-discipline — Session 2026-05-27 確立

複数エージェント並列展開時のフォーメーション規律と、plan 実走中の問題発見時の対応原則。本 rule は全 product CLAUDE.md から @import されるべきで、新規 product scaffold の標準 @import 群に組み込む。

## 規律 1: 複数エージェント展開命令時のフォーメーション

マスターから N 体並列の指示を受けた場合、**フェーズごとに役割配分を再最適化して常に N 体フル稼働させる**。

- 1 wave で N 体固定ではなく、各 wave で「並列可能な依存なし作業の単位」を抽出して N まで埋める
- 依存駆動の wave 分割: Track / file / 検証項目 単位で粒度を分解
- 検証フェーズでは特に並列化を徹底 (受入条件 N 個 → verify-agent N 体並列)
- 集約は orchestrator 直 (各 agent の個別 file 散乱を避ける)
- 並列可能数が N 未満の場合は無理に水増ししない (競合書込を防ぐ)

**Why:** 固定 agent 数だと「Wave B = 1 worker のせいで他 wave も律速」という構造的ボトルネック発生。動的再配分で総工数最小化。

**How to apply:** plan 起草時の「実装ステップ」に Wave 単位の agent 配分を表で明示する (例: Wave A=7 / Wave B=3 / Wave C=10)。

詳細: `memory/feedback_full-formation-deployment.md` (vibe-base 司令塔の MEMORY.md 経由で auto-load)

## 並列数上限と出力サイズの指針（E-5・2026-07-10 追記）

サブエージェント大量並列時、1 subagent が返す出力（transcript/jsonl）のサイズが肥大化するケースを観測した。
observed: learning-suite-kanji の 1 セッションで transcript 69MB 中 61MB（88%）が subagent 出力・agent jsonl 44 本のうち 7 本が 5〜7MB 級。

**観測は 1 件のみであり、監査は「観測 1 件でパターンと断定するには母数が少ない」と明記している。よって本節は指針であり、機械強制しない。**

- 大容量出力を返す subagent（PDF/画像処理系）は並列数を絞る
- 1 subagent の出力が 5MB を超えたら設計を疑う（1 回の呼出に責務を詰め込みすぎていないか見直す）

## 規律 2: plan 実走途中で問題発見時の 4 原則

plan の ExitPlanMode 承認後に当初想定外の問題が発見された場合、以下 4 原則を **順序固定で適用**。マスター相談は 4 原則すべて試してなお解決しない場合のみ。

### 原則 1: ゴールは変えない
plan の ## 受け入れ基準 / ## EARS 意図文 / 上位 plan の constraint は不変。「達成条件を下げる」「scope 縮小」は禁止。

### 原則 2: ゴールへのルートを変更する
ルート = 実装ステップ / 担当 agent 配分 / 検証コマンド / 入力 file。worker hallucination 時は別 prompt で再起動、tool NG 時は同等機能の別 tool / Bash one-liner に切替。

### 原則 3: ルート変更は最もシンプルかつ問題を先送りしない方法
「とりあえず動かす」「後でやる」「次セッション繰越」は禁止。当該 wave / 当該 turn 内で完結する解決法を選ぶ。複数解候補ある場合は (a) 最小 file 変更 (b) 最小 agent 再起動 (c) 既存資産流用率最大 を評価軸に序列化。

### 原則 4: 最適解の参考リサーチを行う
既存 plan / memory / docs / commit log / sibling product の同類事例を grep。公式 docs (Anthropic / Claude Code / 該当 lib) を必要に応じて WebFetch。リサーチ結果は memory P4 に教訓化。

### マスター相談の条件
上記 4 原則すべて試した後、以下のいずれかに該当する場合のみ:
- 原則 2 で他に有効なルートが存在しない
- 原則 3 でシンプルかつ先送りなしの解が見つからない (全候補が「先送り / scope 縮小 / ゴール改変」のいずれかに該当)
- 原則 4 のリサーチで前例 / 公式仕様が見つからない・矛盾する仕様が複数ある

相談時は「4 原則のどこで詰まったか + 試した候補一覧 + 推奨案 1 件」を必ず併記する。

詳細: `memory/feedback_runtime-problem-4principles.md` (vibe-base 司令塔の MEMORY.md 経由で auto-load)

## 規律 3: Stage 4 検証パネル自動連鎖呼出 (Session 2026-05-27 追加・2026-07-02 パネル化)

plan の実装ステップが完了したら、**完遂宣言の commit を打つ前に必ず検証パネルを呼ぶ**。orchestrator の「呼び忘れ」を構造的に防ぐ規律。

**レンズ選定は `docs/standards/verification-panel.md` の選別マトリクスに従う**（orchestrator の裁量禁止）。plan 完遂宣言・ゲート判定は全レンズ（⑤は UI 変更時のみ）、それ以外は変更種別該当レンズのみ（既定 1〜2 体）。verify-agent（レンズ①）は全ケースで必須。

### 必須トリガー (いずれか 1 つ該当時)
- ExitPlanMode 承認後 + implement 系 agent の最終 step 完了直後
- plan ファイル (`*/plans/*.md` / `~/.claude/plans/*.md`) の受け入れ基準セクションが更新された commit を打つ前
- vectorized-sparking-pumpkin plan 等で「Step 11 最終照合」相当の集計コマンドを実行する前

### 呼出形式 (orchestrator から Agent tool 経由・必須)

```
Agent(
  subagent_type: "verify-agent",
  description: "plan 受入基準機械検証",
  prompt: "
    対象 plan: <plan 絶対 path>
    plan 内 ## 受け入れ基準 セクションのチェックリスト N 項目をすべて Bash 実行で機械検証。
    PASS/FAIL 表でテキスト返却。「対象外」「未実行」「skipped」「待機中」 keyword 使用禁止。
    Edit/Write 禁止 (Worker/Evaluator 分離)。
  "
)
```

### 完遂宣言 commit 前の自己点検
- verify-agent 返却テキストに `PASS N/M` 表現が含まれている (全件 PASS なら N=M)
- **FAIL 2階級判定**（`docs/standards/verification-panel.md` 正本）: **blocking FAIL**（①機械 FAIL / ③実証済み攻撃経路 / ④スコープ外 diff）が 1 件以上 → **commit 禁止**・4 原則 (規律 2) でルート修正してから再実行。**advisory FAIL** は記録（runs.jsonl + 引継ぎ/バックログ）して commit 可 — 反証モードは false-FAIL を構造的に増やすため、advisory で commit を止めると警報疲れ→パネル迂回で閉ループが死ぬ
- パネル実行後、orchestrator は `~/.claude/logs/verification-panel-runs.jsonl` に run 記録を 1 行追記する（記録漏れは check-in A-24 が機械検出）

### 自動化レイヤー (将来課題・本規律は現時点では運用規律)
- Stop hook で「plan 編集後に verify-report 不在」検出 → block (未配備)
- plan-finalize skill 内で verify-agent 自動連鎖 (未配備)

### 例外
- 単一 file 修正・実装ステップ ≤ 3 の小規模 plan は verify-agent 省略可 (検証コマンドを orchestrator 直接実行で代替)
- plan ファイル不在の即興 task は対象外

**Why:** Stage 4 verify-agent (Anthropic 公式 Worker/Evaluator 分離準拠) は配備済だが、orchestrator が呼ばなければ動かない設計。「呼び忘れ」を発見した時点で実装完了報告が誤っているケースが発生する (P4 [2026-05-27 Session 2] dogfooding 検証で発覚した自己認識欠如事案と同根)。本規律で必須化することで、自動化 hook 配備までの間も呼び忘れを構造的に防ぐ。

## 適用範囲

- 全 product CLAUDE.md から @import (`@../../.claude/rules/orchestration-discipline.md`)
- 新規 product scaffold の標準 @import 群として組み込む
- vibe-base 司令塔は MEMORY.md auto-load で同等情報を取得 (本 rule は念のための明示参照経路)

## 関連 rule
- `permission-defense.md`
- `session-lifecycle.md`
- `plan-mode.md`
- `self-verification.md`
- `skill-deployment.md`
- `subagent-ops.md`
- `structural-ops.md`
