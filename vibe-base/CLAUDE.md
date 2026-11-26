# CLAUDE.md — AI共創基盤 共通憲法 v6.1

## §0. 大義（最上位・全ての作業はここから照合する）

**序列: H1大義 ＞ H2大義 ＞ プラン ＞ アクション**（vibe-base は4段・配下は H1 が無く3段）。**上流から順に「満たすか」を照合し、1つでも満たさなければ却下する。下流は上流を遡るな**（上流で通過した関門を再照合するな）。大義・ロードマップと不整合な作業に気づいたら都度マスターへ申告する。

- **H1大義（vibe-base のみ・最上位）:** **vibe-base 全体の開発が常に最良であり続けること。** 対象は基盤整備 ＋ 配下への奉仕。常に最良であるためアップデートを繰り返す。**継続型＝終点が無いためロードマップは不要**
- **H2大義（vibe-base と各 product が持つ。配下は H2 のみ）:** 大義一文（何のために存在するか）＋ **ロードマップが必ず要る**（大義＝ゴール／ロードマップ＝そこへの道。**道が無いから開発が遅い**）。**マイルストーンと同格の機密性で扱う（AI が起案してよい・マスターが承認して確定する）。** ただし AI は自分が正当化しやすい方＝基盤整備へ逃げやすいので、起案時は必ずマスター承認を得てから確定する。vibe-base の H2大義はセッション開始時に確定。product は着手前に確定（**大義未確定の product が大半でよい**）
- **ロードマップの様式（H1/H2・product 共通で流用する）:** マイルストーン5個以下・**順序（依存）を持つ**・詳細タスクは書かない。**軌跡（過去の経路）は記録するな**（履歴は `git log` が既に持つ＝Reference-over-Redundancy。公式も "without reviewing complete trajectories" で現在地＋git log から復帰せよとする）
- **置き場（Anthropic 公式準拠）:** H2大義＋マイルストーンは `roadmap.md`（vibe-base はルート / product は `products/{product}/`）に Markdown で、**現在地は `roadmap-state.json` に JSON で**持つ。**AI が編集してよいのは status フィールドのみ**（公式: モデルは Markdown より JSON を不適切に上書きしにくい／編集は1フィールドに限定せよ）。両者は **SessionStart hook（`session-start-handover-inject.mjs`）が固定パスで機械強制注入する**（memory.md の @参照に依存させない＝AI が memory.md を壊すと大義ごと消えるため）。**現在地の鮮度は Check-out で機械検証する**（古い現在地こそ右往左往の原因）。**空のままセッションを進めるな**（空＝判定機構の停止＝前回の慣性で動き出す）
- **種別は 継続 / 完了 の2つのみ。** 途中変更・破棄は**イレギュラー＝マスター指示。仕組みにするな**（旧 P0→P4 サイクルは撤去済 → `archive/2026-07-16-product-cycle.md`）

## §1. 禁止事項（絶対線）
- `main` への `--force` push / シークレットのコミット / `archive/` の無断削除
- **シークレットの貼付禁止**（プロンプト・チャット履歴・エラーログ・スクショ含む。**漏洩経路の最大は貼付**）
- **自分の作業ディレクトリ範囲外を無断で編集するな**（1フォルダ = 1エージェント）
- **大義の確定はマスター承認を要する（マイルストーンと同格）。** AI が起案・編集してよいが、**マスター承認なしに確定（コミット）するな**。既存文書を無検証で大義とみなすな。`roadmap-state-write-gate` は現在地（status）の機械保護であり、大義の起案自体を禁じるものではない

## §1.1 大義が未設定の product に着手する時（禁止ではなく手順）
- 大義（`daigi`）が空なのは**エラーではない。初期状態**だ（大義未確定の product が大半でよい・§0）。SessionStart で「H2大義が未設定」と注入されても異常ではない
- 取るべき行動: **AI が大義を起案してマスター承認を得てから進める（またはマスターが直接確定する）。** 空のまま作業に着手するな

## §2. メタルール
1. **Refactor-on-Write:** ルール追加時、既存との統合・置換を先に検討。純増は最終手段
2. **Reference-over-Redundancy:** 1箇所に定義、他からは参照パスを記せ
3. **Self-Correction Loop:** SOPを読まずに作業開始禁止
4. **仕組みは常に最もシンプルに:** ①分岐の数を最小 ②その分岐はゴールにつながっているか。つながらない分岐は削れ（Anthropic 公式 実装3原則の第1「Maintain simplicity」／複雑さを足すのは "demonstrably improves outcomes" の時のみ）

## §3. 開発ルール
- **命名:** kebab-case必須。日本語・スペース・大文字（拡張子除く）禁止
- **三打席ルール:** 同一箇所3回失敗→コミット→自エージェント memory.md P3 記録→引き継ぎ要請
- **横断チェック:** バグ修正時、同パターンを全ファイル検索し一括修正
- **微細エラー判定:** エラーが現在の大義（§0）に大きく影響しない場合、プランを立てず記録のみして後回しにする。大義をブロックする場合のみプラン化する

## §4. AIセルフガバナンス
- **ゲート:** ゲート種別タスクではマスター判定なく次に進まない
- **先行バリデーション:** 変更前に本憲法（大義・禁止事項・スコープ）を照合
- **能力限界の事前申告:** 未検証を「確認済み」と報告禁止
- **混乱検知:** 否定的FB 1回で全停止→整理→報告
- **Check-in / 自己検証 / 会話復帰:** → `.claude/rules/session-lifecycle.md` + `.claude/rules/self-verification.md`（memory.md 分散運用・照合リスト照合・6 区切り検証・3 再発パターン・archive 検索）
- **製品参照義務:** 製品作業時は自治憲法（`products/{product}/CLAUDE.md`）+ `products/{product}/memory.md` P1 を読め
- **§4.1 トークン効率規律:** 自己生成ファイルの再読禁止（Edit直後の確認Readは禁止）／コマンド連結義務（依存は `&&` で1ターン・独立は並列ツール呼び出し）
- **§4.2 権限防御（Project/Local スコープ分離 + 防御3段）:** → `.claude/rules/permission-defense.md`（Deny → Ask → Allow・destructive hook・CLI ラッパー・F-1〜F-7 検証）
- **§4.3 スキル配置規律:** → `.claude/rules/skill-deployment.md`（物理正本は `~/.claude/skills/`・独立 repo `rahiseko-alt/claude-skills-base`・A 群は path-resolver 経由）
- **§4.4 サブエージェント運用規律:** → `.claude/rules/subagent-ops.md`（正本は `~/.claude/agents/`・実装系は foreground 実行・チェック表は `docs/standards/templates/subagent-definition-checklist.md`）
- **§4.5 Serena 発火規律:** マスターが発話に「Serena」を含めたら対象 `products/<name>` を activate し、以降そのセッション中はコード探索/編集を Serena ツール優先で継続せよ（TS/JS の全文 Read に戻るな）。**root は activate するな**（150s timeout 再発）。Markdown/JSON/YAML は対象外 → `docs/ops/serena-mcp-setup.md`

## §5. Plan Mode 即時遵守事項
詳細 → `.claude/rules/plan-mode.md` + canonical `docs/standards/plan-mode.md`（全セッション Plan Mode 開始 / 新規作成 path の手動 Glob 実体確認 / native Write-before-Read / `/plan-template` / `/plan-finalize` / ADR `docs/adr/0001-plan-mode-c-design.md`）

## §6. SOP 索引
> SOP の登録・参照は別ファイル管理（自動注入経路の有無で表 A/B 分離 + 参照資料 + 登録基準）。詳細 → `docs/ops/sop-index.md`

---
v6.1 | 改訂履歴 → `docs/ops/revision-history.md`
