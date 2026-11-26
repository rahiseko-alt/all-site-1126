# 運用近代化 Phase 2-3 一気通貫 — 3エージェント並走計画 + サブ指令（@注入元）

> 配置メモ: 本来 plan は `docs/ops/plans/` だが、rules-coverage-gate が SOP3点セットを要求しブロック（診断書が指摘した過剰ガバナンスの実例・memory P1#1）。診断書の前例に倣い session-reports に配置。@注入元として機能。

## Context（なぜこの変更をするか）

診断書 `docs/session-reports/2026-06-04-operation-modernization-handover.md` の Phase 1（rules path-scoped 化）は 2026-06-06 完遂（commit `98c54ac4`・verify 6/6）。本計画はその続きの **Phase 2-1〜3-3 を 3エージェント並走で一気通貫**する。マスター指示（2026-06-06）: 「3エージェント並走・サブモデル最適指定・受入条件/トラブルシナリオ/リカバリープラン準備・サブ指令はドキュメント@注入」。

ゴールは診断書を継承: 「**同じ規律を、より軽いロード方式で効かせる / 公式整合性を高める**」。規律内容の削除・弱体化は禁止。本 Phase は**調査・判定・検証・成果物作成**が中心で、guardrail の実改変（Phase 2-2 撤去の実行）はマスター手動編集に限定する。

## ゴール / EARS 意図文

- システムは、auto-memory（公式既定ON）と手管理 memory.md の役割分担を ADR として確定すること。
- システムは、独自 HARD BLOCK と公式 Protected Paths の重複を監査し、撤去/維持の判定と手動撤去手順を文書化すること。
- システムは、Stop/SubagentStop hook 自動verify構想を既知バグ #65169（PostToolUse が Agent 完了で非発火）の観点で fixture 検証し、可否を記録すること。
- システムは、skills/allow の使用実績と改名参照の陳腐化を棚卸しし、是正候補を一覧化すること。

## 影響範囲
- `docs/adr/0002-*.md`（新規 ADR・Agent G）
- `docs/session-reports/2026-06-06-*.md`（各 Agent の判定/検証/棚卸しレポート 4 本）
- `tests/fixtures/stop-hook-65169/`（Agent T の fixture・本番非破壊）
- **本 Phase では guardrail 実体（pre-edit.sh / settings.json）を改変しない**（判定と手順書のみ。実改変は別 plan + マスター手動）

## Wave 設計（3エージェント並走・モデル最適指定・orchestration-discipline 規律1）

| Agent | モデル | 担当 | 成果物 |
|---|---|---|---|
| **G** | opus | Phase 2-1 auto-memory寄せ替え判定 / Phase 2-2 HARD BLOCK×Protected Paths 重複監査 | `docs/adr/0002-auto-memory-vs-manual-memory.md` + `docs/session-reports/2026-06-06-hardblock-protected-paths-audit.md` |
| **T** | sonnet | Phase 2-3 Stop hook #65169 fixture検証 / Phase 3-3 MCP Tool Search・install 経路確認 | `docs/session-reports/2026-06-06-stop-hook-65169-verify.md` |
| **I** | sonnet | Phase 3-1 skills/allow 使用実績棚卸し / Phase 3-2 改名参照（ui-clone-sop 等）陳腐化grep | `docs/session-reports/2026-06-06-skills-allow-inventory.md` + `docs/session-reports/2026-06-06-rename-stale-refs.md` |

- 3 Agent は依存なし → 同時並走（1 Wave）。集約は orchestrator 直。
- 各 Agent は foreground（Write を伴うため・background は auto-deny）。
- 完遂後 orchestrator が verify-agent で受入基準を機械検証（規律3）。

## 受け入れ基準
1. ADR存在確認: `test -f docs/adr/0002-auto-memory-vs-manual-memory.md && echo OK` が OK を返す。
2. HARD BLOCK監査レポート存在: `test -f docs/session-reports/2026-06-06-hardblock-protected-paths-audit.md && echo OK` が OK を返す。
3. Stop hook検証レポート存在: `test -f docs/session-reports/2026-06-06-stop-hook-65169-verify.md && echo OK` が OK を返す。
4. skills/allow棚卸しレポート存在: `test -f docs/session-reports/2026-06-06-skills-allow-inventory.md && echo OK` が OK を返す。
5. 改名参照レポート存在: `test -f docs/session-reports/2026-06-06-rename-stale-refs.md && echo OK` が OK を返す。
6. 成果物の空約束排除（対象=成果物5本のみ・plan指令書自身は対象外）: `grep -lE "未実行|待機中|skipped|空欄放置" docs/adr/0002-auto-memory-vs-manual-memory.md docs/session-reports/2026-06-06-hardblock-protected-paths-audit.md docs/session-reports/2026-06-06-stop-hook-65169-verify.md docs/session-reports/2026-06-06-skills-allow-inventory.md docs/session-reports/2026-06-06-rename-stale-refs.md | wc -l` が 0 を返す。
7. 機械検証通過: `bash scripts/check-in-verify.sh` が EXIT 0 を返す。

## テスト方針
- 各 Agent の成果物は read-only 調査 + 文書 Write のみ。guardrail 実体は非改変。
- Phase 2-3 fixture は `tests/fixtures/stop-hook-65169/` で本番非破壊（hook を rename/削除しない）。
- 完遂後 `bash scripts/check-in-verify.sh` EXIT 0。verify-agent で受入1-7 機械検証。

## トラブルシナリオ → リカバリープラン

| # | トラブル | 検知 | リカバリー（規律2 原則: ゴール不変・ルート変更・先送りなし） |
|---|---|---|---|
| TS1 | サブエージェントが Write 不可（background 誤用） | 成果物ファイル不在 | foreground で再起動（background:false）。orchestration-discipline 背景実行制約。 |
| TS2 | サブエージェント幻覚（虚偽の完了報告） | `test -f` で実体不在 | orchestrator が実体検証 → 別 prompt で再起動。完了報告を鵜呑みにしない（P4教訓）。 |
| TS3 | docs/ops/plans への Write が rules-coverage-gate block | PostToolUse block（本計画で実発生） | session-reports へ配置変更（実績あり）。本現象自体が Phase 2 の過剰ガバナンス所見。 |
| TS4 | Phase 2-3 で #65169 により Stop/PostToolUse が Agent 完了非発火 | fixture 単体テストで非発火確認 | ゴール=「検証結果取得」は不変。「自動verify は #65169 解消まで保留」と結論を記録（実装せず判定のみ）。実機破壊検証は禁止・fixture stub PASS で完了。 |
| TS5 | Phase 2-2 で撤去判定が「撤去すべき」と出る | 監査レポート結論 | **本 Phase では実改変しない**。撤去手順書（マスター手動・tmp→cp 方式）を作るに留める。代替防御層を必ず明示。 |
| TS6 | 3 Agent の成果物パスが衝突 | 同一ファイルへの並行 Write | パスは Wave 表で排他指定済（衝突なし）。集約は orchestrator 直で散乱回避。 |

## 承認後モード
- 本ドキュメントを各 Agent prompt で `@docs/session-reports/2026-06-06-opmod-phase2-3-plan.md` 注入 → 担当指令セクションに従わせる。
- 3 Agent 並走（foreground・モデル指定）→ orchestrator 集約 → verify-agent → マスター報告。
- guardrail 実改変（Phase 2-2 結論が撤去の場合）は別 plan + マスター手動編集。

---

## Agent G 指令（opus・ガバナンス設計）

あなたは Agent G。vibe-base 運用近代化のガバナンス設計担当。cwd = vibe-base ルート。read-only 調査 + 文書 Write のみ。guardrail 実体（pre-edit.sh / settings.json）は**改変するな**（判定と手順書のみ）。自分の commit/PR を自分でマージするな。報告ラベル（【実行済み】【推測】【未実行】）を付けよ。

### タスク G-1: Phase 2-1 auto-memory 寄せ替え可否検証 → ADR 起草

1. 公式 auto-memory 機能を把握（既定ON・200行/25KB 自動trim）。現状の手管理 memory.md（`memory.md` + `failures.md` + `~/.claude/projects/.../memory/MEMORY.md` + `memory/*.md`）の運用を Read で把握。
2. 「auto-memory に寄せるべき領域」「手管理を維持すべき領域」を役割分担表で整理。判断軸: ①自動trimで失われては困る恒久規律か ②点在ファイル参照（@import/[[]]）構造との両立 ③司令塔とproductエージェントの分散運用 v2.0 β との整合。
3. ADR を `docs/adr/0002-auto-memory-vs-manual-memory.md` に Nygard 標準（Title/Status/Context/Decision/Consequences）で Write。Status は Proposed。結論は「全面移行/部分移行/現状維持」のいずれかを根拠付きで明記（曖昧表現禁止）。

### タスク G-2: Phase 2-2 HARD BLOCK × 公式 Protected Paths 重複監査

1. `.claude/hooks/pre-edit.sh` を Read し、独自に block(exit 2)/ask している対象を全列挙。
2. 公式 Protected Paths（`.claude` / `.mcp.json` / シェル設定 / `.git` を標準保護・出典 code.claude.com/docs/en/permission-modes）と突き合わせ、**重複マトリクス**（独自 / 公式 / 両方）を作成。WebFetch で公式仕様を1次確認（docs.claude.com は301なので code.claude.com 起点）。
3. 各重複項目に「撤去可（公式でカバー）/ 維持（独自固有の防御価値あり）」を判定。撤去可の項目は**撤去後の代替防御層を必ず明示**。
4. 撤去すると判定した項目には**マスター手動撤去手順**（tmp に正本 Write → `cp -f tmp/x .claude/hooks/x` の byte 正確コピー・failures.md 2026-05-31 準拠）を手順書化。
5. 結果を `docs/session-reports/2026-06-06-hardblock-protected-paths-audit.md` に Write（重複マトリクス + 判定 + 手順書）。**本 Phase では pre-edit.sh を改変しない**。

---

## Agent T 指令（sonnet・技術検証）

あなたは Agent T。技術検証担当。cwd = vibe-base ルート。fixture は本番非破壊（hook を rename/削除/上書きするな）。実機破壊検証を提案するな（単体テスト stub の PASS で完了判定・feedback_hook-realworld-test-safety 厳守）。報告ラベルを付けよ。

### タスク T-1: Phase 2-3 Stop hook 自動verify × #65169 fixture検証

1. 既知バグ #65169 を WebFetch で確認（GitHub anthropics/claude-code issues・「PostToolUse が Agent 完了で非発火」）。要点を整理。
2. 現状 `.claude/settings.json` の hook イベント登録を Read（Stop / SubagentStop は未登録・PostToolUse/PreToolUse のみ）。
3. **fixture 方式**で「Stop/SubagentStop hook を仮配備した場合に Agent 完了で発火するか」を検証する設計を作る。`tests/fixtures/stop-hook-65169/` に最小 fixture（ダミー hook スクリプト + 期待値）を Write。本番 settings.json は触らない。
4. 「orchestration-discipline 規律3（完遂前 verify-agent 自動連鎖）を Stop hook で自動化する構想」が #65169 の影響を受けるか判定。発火しないなら「自動化は #65169 解消まで保留・手動運用継続」と結論。
5. 結果を `docs/session-reports/2026-06-06-stop-hook-65169-verify.md` に Write（#65169要点 + fixture設計 + 発火可否 + 結論）。

### タスク T-2: Phase 3-3 MCP Tool Search・install 経路確認

1. `claude --version` で版・install 経路（native installer 推奨 / npm 非推奨）を確認。
2. MCP Tool Search の有効状態を確認（`claude mcp list` 等・既定有効か）。
3. 上記2点の結果を同レポート `docs/session-reports/2026-06-06-stop-hook-65169-verify.md` の末尾セクション「## Phase 3-3 環境確認」に追記。

---

## Agent I 指令（sonnet・棚卸し）

あなたは Agent I。棚卸し担当。cwd = vibe-base ルート。read-only 調査 + 文書 Write のみ。**二次情報の数値（Skills20件キャップ等）を削減根拠に使うな**（公式に数値基準なし・実測ベース）。報告ラベルを付けよ。

### タスク I-1: Phase 3-1 skills/allow 使用実績棚卸し

1. `~/.claude/skills/` の skills 一覧（29件想定）と `.claude/settings.local.json` の `permissions.allow`（401件規模）を把握。
2. 使用実績の手がかりを収集（`/usage` カテゴリ別内訳が使えれば活用・なければ allow ルールの重複/明らかな一時利用/廃止 product 由来を分類）。**削るのではなく「棚卸し候補の一覧化」が成果**（実改変はしない）。
3. allow リストの明らかな棚卸し候補（廃止 product 由来・重複・一時デバッグ用）を分類して一覧化。
4. 結果を `docs/session-reports/2026-06-06-skills-allow-inventory.md` に Write（skills 棚卸し + allow 棚卸し候補・各々「維持/棚卸し候補」タグ付き）。

### タスク I-2: Phase 3-2 改名参照の陳腐化 grep

1. 旧コマンド名/旧スキル名の参照を grep: `/simplify`→`/code-review` 改名、`ui-clone` / `perfect-web-clone` / `reference-site-measure` / `hero-scroll-grid` / `lp-design`（旧 design 系8skill）等。対象: `.claude/rules/` `docs/` `.claude/skills/`（user-level 含む）。
2. `docs/ops/ui-clone-sop.md` が実在し `web-design.md` line36 から参照されている。これが廃止済 skill の残骸（「書いてある≠効いている」）か、付録として有効かを判定。
3. ヒットした陳腐化参照を「是正必要 / 有効（残す）」に分類して一覧化（実改変はしない・是正候補リストが成果）。
4. 結果を `docs/session-reports/2026-06-06-rename-stale-refs.md` に Write（旧名ヒット一覧 + 各々の判定）。
