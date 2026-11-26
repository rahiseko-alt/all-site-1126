# plan: instagram-auto-ops 構築（プロ／販売向け・20体ノンストップ Workflow）

- product: instagram-auto-ops / phase: P0 → P1（構築）/ 起草: 2026-06-16
- 正本docx: `C:\Users\user\Downloads\Instagram自動運用_構築運用保守レポート.docx`
- 本ファイルが product 進捗の単一正本（承認版 `~/.claude/plans/giggly-beaming-pudding.md` と同期）

## Context

docx（2026-06-15・Python + GitHub Actions 主軸）通りに instagram-auto-ops の実体を構築する。狙いは「自分で運用」＋「横展開して他者へ販売」。今回は最上位の**プロ／販売向けプラン**（リール＋カルーセル＋画像、複数アカウント、ダッシュボード、再販テンプレート化）を実装。

- **完走の定義（マスター確定）**: コード一式＋テスト＋運用マニュアル＋保守Runbook を**デプロイ可能状態**まで作り dry-run 検証。マスターは認証情報を差し込むだけで本番稼働できる状態が納品物。
- **実行形態（マスター指示）**: Workflow で20体、フェーズごと役割変更でノンストップ完走。Phase1 リサーチ必須（GitHub・Instagram公式の最新情報）。詰まり時は自動再リサーチで原因追及。

## ⚠ 危険項目（提示・進捗ごとに警告）

1. トークン60日“未使用”失効 → 死活監視＋期限アラート必須。
2. App Review 2〜4週間 + 実認証情報はマスター手作業 → 本番デプロイ範囲外（完走＝デプロイ可能状態まで）。
3. LINE Notify 終了済み（2025）疑い → リサーチで確認・代替へ切替。
4. AI完全自動生成＋即投稿はブランド毀損 → human-in-the-loop（承認列）必須。

## 上位 plan からの constraint 変更

| 上位 plan / 項目 | 本 plan での扱い |
|---|---|
| 自治憲法 §0「コンセプト: 待ち」 | 新規 scope: docx 準拠の Instagram 自動投稿システムに確定 |
| 自治憲法 §0「技術: 5型から選定」 | 範囲外変更: 5型外。Python + GitHub Actions + Google Sheets + R2 + Claude API を正本に確定 |
| 自治憲法 §0「現在フェーズ P0」 | 格上げ: P0→P1（構築）へ進む |
| memory.md P1 | N/A（空） |

## 影響範囲

新規作成のみ。`products/instagram-auto-ops/` 配下。既存改変なし。Glob 照合（2026-06-16・全 ABSENT）: `src/ .github/ tests/ dashboard/ requirements.txt .env.example README.md accounts.example.yml` 不在。`docs/adr/`（空）のみ存在し作成MD 3本は不在。

```
products/instagram-auto-ops/   ← 全て新規
  src/{config,graph_api,post,carousel,reels,refresh,sheets,storage,captions,notify}.py
  .github/workflows/{post,refresh,healthcheck}.yml
  dashboard/  accounts.example.yml  tests/
  docs/{verified-spec,operations-manual,maintenance-runbook}.md
  requirements.txt / .env.example / README.md
```

## サブエージェント割り振り方針

実装主体は Workflow（決定論オーケストレーション）。各フェーズで20体展開・役割切替・空きスロット即投入で全件完走。
- モデル: 大量定型（リサーチ・実装・検証）=sonnet / 判断重（統合・設計契約・根本原因）=opus。
- @注入: Workflow agent は親 context 非継承。各 prompt に docx要点 / verified-spec / 契約 / 対象絶対パスを注入。
- 同時実行 `min(16, コア-2)` 上限。完全同時20並列は不可。20件積み＋即投入で要件充足。

## 実装ステップ

| Step | 内容 | 担当 | モデル | @注入 | 検証 |
|---|---|---|---|---|---|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -e` 全path（済） |
| 0.5 | 構築前チェックポイント（パス限定コミット） | orchestrator | opus | — | `git log -1 -- products/instagram-auto-ops` |
| 1 | リサーチ20件（公式+GitHub・出典URL/確信度/差分必須） | research | sonnet | docx要点 | 構造化スキーマ返却 |
| 1.5 | 統合→`docs/verified-spec.md`（矛盾を再リサーチ起点フラグ） | synthesis(barrier) | opus | Phase1全結果 | Step6 Glob |
| 2 | 設計20件→単一インターフェース契約（サイレントフェイル禁止・500行分割前提） | architect | opus | verified-spec | 契約doc生成 |
| 3 | 実装（1体1ファイル・契約準拠・衝突なし） | implement | sonnet | 契約+spec+対象パス | Step4 |
| 4 | 検証20件（dry-run/lint/レビュー/秘匿情報/サイレントフェイル/レート/500行/差分） | verify | sonnet | 対象+受入基準 | PASS/FAIL表 |
| 5 | 修正ループ（FAIL毎 再リサーチ→修正→再検証・loop-until-dry） | reresearch+fix | opus/sonnet | FAIL詳細+公式URL | 再検証EXIT0 |
| 6 | 最終 Glob 照合（全実在+各<500行） | orchestrator | opus | — | `test -f`+`wc -l` |

**詰まり時の自動再リサーチ**: agent が blocked/uncertain/fail を返したら root-cause リサーチ→修正 agent を自動起動。

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4原則） |
|---|---|---|
| リサーチがレポートと矛盾 | Phase1 discrepancy フラグ | 原則4: 公式/GitHub再リサーチ→spec正本化 |
| I/F 不整合 | Phase4 import エラー | 原則3: 契約doc単一正本化・最小修正 |
| hallucination | verify で公式URL不一致 | 原則2: 別prompt+URL注入で再起動 |
| dry-run/lint NG | EXIT≠0/hook block | 原則2: 同等手段に切替・Step5投入 |
| 500行超過 | hook block | 原則3: code-splitting分割 |
| 認証/App Review不在 | 範囲外 | 原則1: デプロイ可能状態で停止・README明記 |

## バックアップ・保全・ロールバック体制

並行セッション環境のためコミットは全てパス限定（`-- products/instagram-auto-ops docs/ops/plans/2026-06-16-*.md`）。他agent unstaged を巻き込まない。

| 局面 | 体制 | 手段 |
|---|---|---|
| 作業前 | 起動直前パス限定コミットで復帰点 | `git add products/instagram-auto-ops docs/ops/plans/2026-06-16-*.md && git commit -m "chore(insta): 構築前チェックポイント"` |
| フェーズ単位 | Phase1完了/実装完了/検証完了で最低3点 | `git add products/instagram-auto-ops && git commit -m "chore(insta): phaseN checkpoint"` |
| 中断復旧 | Workflow runId resume | `Workflow({scriptPath, resumeFromRunId})` |
| ロールバック | パス限定 checkout（reset --hard不可） | `git checkout <commit> -- products/instagram-auto-ops` |
| 衝突回避 | 1体1ファイル設計 | worktree不要 |
| 破壊禁止 | rm -rf / reset --hard全体 / force push 不使用 | permission-defense deny準拠 |

## テスト方針

1. dry-run: モックで 2ステップ投稿/カルーセル/リール/refresh/通知（#3）。
2. lint/import健全性/500行ゲート 全EXIT0（#2,#4）。
3. `.env.example` キーで実認証なしに全モジュール import・初期化（#4）。
4. verified-spec.md と実装の差分照合（#1）。
5. マニュアル/Runbook が docx 3章・4章網羅（#5）。
6. バックアップ起点・チェックポイントが git 履歴に存在（#7）。

## 受け入れ基準

EARS: ①Phase1完了で20調査を出典URL/確信度/差分付き verified-spec.md 出力 ②dry-run で実認証なしに投稿/refresh/通知 EXIT0 ③レビュー/セキュリティで秘匿情報0・サイレントフェイル0。

機械検証（基準: `products/instagram-auto-ops/`）:
1. `test -f docs/verified-spec.md && [ $(grep -c "https://" ...) -ge 20 ] && grep -q "レポート差分" ...` → EXIT0
2. `find src dashboard -type f -exec wc -l {} + | awk '$1>=500{n++} END{exit (n>0)}'` → EXIT0（500行以上0件）
3. `python -m tests.dry_run` → EXIT0（画像/カルーセル/リール/refresh/通知）
4. `ruff check . && ! grep -rEn "(token|secret|api_key)[[:space:]]*=[[:space:]]*[\"'][A-Za-z0-9]" src/ && ! grep -rEn "except[^:]*:[[:space:]]*pass[[:space:]]*$" src/` → EXIT0
5. `grep -q スプレッドシート docs/operations-manual.md && grep -q トークン docs/maintenance-runbook.md && grep -q 監視 docs/maintenance-runbook.md` → EXIT0
6. 修正ループ後 `ruff check . && python -m tests.dry_run` → EXIT0
7. `git log --oneline -- products/instagram-auto-ops | grep -E "checkpoint|phase[0-9]"` → EXIT0

**G-P1 照合**: コア機能/API/障害/セキュリティ/監視=受入#3,#4,#5+healthcheck に反映。**未反映**: 即死仮説の実機検証（P0 hypotheses.md 未整備）。本 plan は構築でゲート通過確定せず。仮説整備はマスター判断事項として⚠申告済。

## 承認後モード

default（判定軸3 外部API呼出＝Phase1 WebSearch/WebFetch、判定軸4 新規ファイル≥1）。承認後 Workflow をバックグラウンド起動し完了通知で集約報告。**マスター承認済（2026-06-16）**。
