---
description: セッション開始・終了・引き継ぎ時の必須手順。全作業に適用
---

## memory.md 分散運用 v2.0 β 統合型（Session 295〜）

本書中の「memory.md」は **自エージェント専用ファイル** を指す（MISSION + MEMORY 統合）:

| エージェント / ミッション領域 | 自 memory.md パス |
|------------|---------------------|
| 司令塔 — vibe-base モノレポ全領域 | `vibe-base/memory.md` |
| プロダクト（cwd = `products/{product}/`） | `vibe-base/products/{product}/memory.md` |

**ミッション記録先の分類ルール（2026-05-27 モノレポ統合で簡素化・履歴: Session 302 で governance / vibe-base 分類確立 → モノレポ統合により廃止）**:

司令塔は 1 つの memory.md（`vibe-base/memory.md`）に記録する。governance 系（SOP・`scripts/`・`.claude/rules/`・`docs/`）も製品系（`products/` 配下）も同一ファイルへ統合記録する。

**ファイル構造（目標 100 行 / 上限 200 行）**:
- P1 引継ぎミッション（3 件枠・Check-out で完了消去+新規追加）
- P2 ADR 索引（直近 5 件・本体は `docs/adr/NNNN-*.md`）
- P3 失敗事例（客観 7 基準のいずれか 1 件以上で登録）
- P4 その他永続教訓（importance タグ付き自由領域）

**厳守ルール**:
- 自エージェントは自 memory.md のみ書込み（他エージェントは Read のみ）
- 110 行超で archive 候補（importance L 優先・`archive/{agent}-memory-YYYYMM.md`）
- 別エージェントへの作業依頼はマスター発のみ（agent ↔ agent 直接通信は禁止・依頼書ファイル経路廃止）
- 構造変更（SOP / CLAUDE.md / `.claude/rules/`）は auto-inject で配布

**観察タスクの memory.md 書込禁止（Session 298 確立・Session 297 規定撤回）**:
- **P1 は「今セッション内で着手・完了するタスク」のみ**（タスク = 「今からやって今終わる」もの）
- **継続観察（数セッション継続・毎回小チェック型）は memory.md 書込禁止**（P1 / P4 / §継続観察 すべて不可）
- **格納先（2 経路のみ）**:
  - 機械検証可能 → `scripts/check-in-verify.sh` に検証項目として追加（自動化されればタスクではなくなる）
  - 質的観察必須 → ADR 化（`docs/adr/NNNN-*.md`）or P4 永続教訓化（タスクではなく「教訓」として確定文章で記述）
- **理由**: 観察 = タスクでない = ミッション候補に挙げない。memory.md は「今やる事」と「永続教訓・失敗事例」のみで構成し、状態不明な持ち越し項目を排除する

## セッション開始（Check-in）
- **⚠️ 過去セッションの過失教訓を必ず読め:** `docs/ops/session-191-lessons.md`（司令塔エージェントの6件の過失パターン。同じ失敗を繰り返さないため Check-in 時に毎回読み、「自分も同じパターンに陥っていないか」を自問せよ）
- **自エージェントの memory.md** を読み、P1 引継ぎミッション + P3 失敗事例を把握せよ（パスは冒頭表を参照）
- 直近 plan（`docs/ops/plans/` 配下）+ 対象プロダクトの `memory.md` P1（現フェーズ + 直近 plan path）を読め
- **hook伝播:** vibe-base ルートで `node scripts/propagate-hooks.mjs` を実行せよ（cwd 非依存化済・env `VIBE_PRODUCTS_ROOT` で override 可）。hookはsettings.local.json（gitignore）に登録されるため、新プロダクト追加や新環境では欠損する。毎セッション実行してもコスト0（差分なしならskip）
- **agents バックアップ:** vibe-base ルートで `node scripts/backup-agents.mjs` を実行せよ。正本 `~/.claude/agents/`（git 管理外）を vibe-base 配下にミラーする。冪等（差分なしなら何もしない）
- **⚠️ 機械検証スクリプト実行:** vibe-base ルートで `bash scripts/check-in-verify.sh` を実行せよ。`self-verification-sop.md` §1-A 系の区切り（D-3 runbook 実体存在 / E-2 恒常差分 / A-4 hook 同期 / A-5 settings 仕様準拠 / B-5 廃止 hook 再登録ガード 等）を一括検証。**NG 検知（EXIT 1）の場合は即時停止 → マスター報告 → SOP §2 NG 即時対応フロー実行**。WARN は進行可。K1〜K5 パターンの検出例は `docs/ops/agent-rules.md`「自己検証 NG パターン早見表」参照

## コミット前チェック（必須）
- unstaged ファイルがゼロであること
- 意図しない変更が含まれていないこと
- plan の受け入れ基準と実装が一致していること
- memory.md が git diff-stat と一致していること
- 次のAIが memory.md だけで作業開始できること
- チェックなしの EXIT は禁止

## /clear 使用時（ミニ Check-out + 即時 Check-in）

/clear はコンテキストをリセットするため、**使用前後に以下を実施せよ。**

**使用前（ミニ Check-out）:**
1. 自エージェントの memory.md P1 に 2〜3 行で現状を記録する
   ```
   1. [importance:H][YYYY-MM-DD] /clear 前メモ: [現状] / [/clear 後に再開すべきこと]
   ```
2. 変更済みファイルをコミットする（半完成でも可。コミット前チェックリストは適用外）

**使用後（即時 Check-in）:**
1. 自エージェントの memory.md を読み直す
2. /clear 前メモから作業を再開する

**/clear を推奨するタイミング:**
- 調査・Explore フェーズが終わり、実装フェーズに切り替えるとき
- 無関係なタスクに切り替えるとき
- 同一バグを2回訂正してもなお失敗したとき

**/clear が不要なとき:** 1文で説明できる小変更の連続（同一タスク内）

## /compact 使用時（文脈保持型リセット）

`/compact` は会話履歴を要約に圧縮し、文脈を保持したままトークンを削減する。Opus 4.7 の xhigh デフォルトと新トークナイザー（最大1.35倍）対策として活用せよ。

**使用すべきタイミング:**
- Plan Mode 終了 → 実装フェーズ移行時（探索文脈を保持したまま実装へ）
- 同一タスクを継続しつつ、context が 70% 以上埋まったとき
- 長時間セッションで応答品質低下を感じたとき

**/clear との使い分け:**

| 状況 | 使うコマンド |
|------|-------------|
| 別タスクに移行 | `/clear` |
| 同タスク継続（探索→実装等） | `/compact` |
| 判断に迷う | `/compact`（文脈喪失リスクが小さい） |
| モデル切替直前（長い会話） | `/compact` または `/clear` 後に `/model` |

**/compact 使用時も memory.md 記録は不要**（コンテキスト内圧縮のため）。ただし Plan Mode 終了時は plan file → memory.md P1 指示書への変換を忘れるな。

## セッション終了（Check-out）

### 書き込み内容
- **自エージェントの memory.md** を更新せよ。他エージェント memory.md に書くな
  - P1 引継ぎミッション: 完了タスク消去 + 新規タスク追加（3 件枠）
  - P3 失敗事例: 客観 7 基準のいずれか 1 件以上に該当する場合のみ追記
  - P4 永続教訓: importance タグ付きで追記
- コミットしてから EXIT せよ

> SESSION_JOURNAL.md は Session 295 廃止（書込まない）。過去履歴は `archive/session-journal-archive-2026-05-18.md` に温存（マスター言及時のみ Grep 参照可）

### 書き込み排他基準（混入禁止）
- **マスター個人の行動ログ・備忘録・人生計画は書くな。** AI 処理対象タスクのみ記載せよ。マスターが「行動ログ反映済」「日記に書いた」と明示した内容は memory.md に書くな（Check-in でタスク候補化される構造的事故防止・Session 274 事案）
- **マスター戦略決定セクション禁止。** マスター個人の経営判断・並行アクション計画は行動ログ vault（`C:\Users\user\Desktop\事業戦略\事業棚卸\行動ログ\`）の専有領域

### 失敗事例 P3 登録基準（客観 7 基準のいずれか 1 件以上）
1. vibe-base 全体悪影響（自爆漏洩 / データ破壊 / 全機械検証 NG）
2. git revert / force reset / git reset --hard 発生
3. 三打席ルール抵触
4. マスター差し戻し 3 件以上（同一セッション内）
5. プロセス kill / 共有状態破壊
6. Plan Mode 再入（方針大転換）
7. 機械検証 NG によるセッション停止

記述ルール（SRE blameless 準拠）: role/事象ベース（「司令塔が」「プロダクトエージェントが」）・**個人名禁止**・根本原因 1 行 / 再発防止策 1 行 / 関連 commit

**タイムスタンプ形式**: `### [YYYY-MM-DD HH:MM Session NNN][severity:H/M/L]`（P3 記録の一貫性のため統一）

### importance タグ付与ロジック（Heuristic 80% + LLM 20% + マスター override）

P1/P4 entry に `[importance:H/M/L]` タグ付与:

```
H (永続・archive 不可) — いずれか 1 件以上:
  - 本文に「確定」「正本」「禁止」「解任」「漏洩」を含む
  - マスター明示「これ重要・残せ」

L (30 日で archive 候補) — すべて満たす:
  - importance 判定後 30 日 git log でアクセス 0
  - 本文 500 字未満

M (90 日で archive 候補): 上記以外（デフォルト）
```

### memory.md 圧縮ルール
- 自エージェント memory.md は 110 行超で archive 候補。importance L から優先削除
- archive 退避先: `archive/{agent}-memory-YYYYMM.md`
- 他エージェントの memory.md は圧縮対象にするな（権限なし）
- 詳細手順 → `docs/ops/memory-ops.md`

### 前回未解決事項の陳腐化チェック（Check-out 時必須）
- 「P1 引継ぎミッション」を更新する前に前回 Check-out の P1 全件を照合せよ
- 各項目を「今セッションで解決したか」で 1 件ずつ判定し、**残ったものだけ**を次回タスクとして書け
- 前回リストをコピペするな（Session 232 陳腐項目持ち越し事案）

### 行動ログヒアリング義務（2026-04-30 追加・vibe-base 司令塔限定）

> **適用範囲:** vibe-base 司令塔エージェント（マスター直接対話）のみ。プロダクトエージェントは対象外。

セッション終了前に必ず実施せよ:

1. 当日 行動ログ（`C:\Users\user\Desktop\事業戦略\事業棚卸\行動ログ\YYYY-MM-DD.md`）の存在を確認
2. **未作成 or 数値未記入の場合**、Claude がヒアリング形式で以下6項目を質問せよ:
   - **時間配分**（軸1 人と交流 / 軸2 腕磨き / 軸3 周知）の概算
   - **接触件数**（交流会・名刺渡し・既存人脈・商談）
   - **実装件数**（プロダクト・出品・LP・教室）
   - **売上・実績**（受注・納品・継続）
   - **学習・蓄積**（記事・調査・ハブ追加）
   - **日記**（マスターの言葉、主語=私、設計思想 `memory/project_blog-diary-design.md` 準拠）
3. 回答を行動ログに反映してから Check-out
4. マスターが「今日は記録不要」と明示した場合のみスキップ可

**理由:** マスターの動的要素（時間・行動・実績・思考）を vault に蓄積し、戦略可視化の動的層を形成するため必須。「事業における最大の重要点・もっとも活動的な動的要素」（マスター発言 2026-04-30）。

## 運用エリア動線（該当作業の着手前に従え）

### 調査の3分岐（対象で決まる。共存させない）

| 対象 | やること | 出力先 |
|------|---------|--------|
| 今すぐ必要な事実1つ（エラー、API仕様、最新ニュース） | `web_search` で対応 | その場で使い切り |
| 市場・競合・価格・ユーザー（外部データ） | 状況で 3 経路選択（下記判断ガイド参照） | 経路に応じる |
| 技術検証・コード読解・実装方針 | `/deep-research` スキルを実行せよ | `docs/research-bank/`（直行） |

#### 市場・競合リサーチの 3 経路（判断ガイド・Session 289 改定）

| 状況 | 経路 | 出力先 |
|------|------|--------|
| 複数ソース横断・蓄積必要（フェーズ全体・継続検証） | NotebookLM（`docs/ops/notebooklm-mcp-sop.md`） | NotebookLM ノート |
| 単発・軽量（TAM 数字 1 件確認・到達手段 1 件確認） | `web_search` | rationale 欄に出典 URL 併記 |
| 親プロダクト等の既存資産あり | 流用先行（Read で確認 → 不足分のみ追加リサーチ） | 既存資産参照 |

### その他の運用エリア

| 作業 | やること | 独自手順禁止 |
|------|---------|-------------|
| 調査資産の登録 | `docs/ops/research-bank-sop.md` を読め。`/deep-research` が `docs/research-bank/` に直接保存する | research-bankへの直接書込（スキル外）はhookがブロックする |
| WEB/LPデザイン | `/web-design` スキルを実行せよ（手順正本 `docs/standards/web-design-flow.md`） | 骨格パラダイム＋judge＋マスター目で品質担保（旧 `/ui-clone` 系の機械ゲートは廃止） |
## AI間引き継ぎ
- 引き継ぎは memory.md P1 経由のみ。チャットコピー・マスター経由の口頭伝達は禁止
- **マスター仲介禁止。** マスターに「このテキストを○○にコピペしてください」「○○に検証を依頼してください」等の仲介作業を求めるな。マスターはトリガーのみ。次のAIは自分で **自エージェントの memory.md** を読んで開始せよ
- **agent ↔ agent 直接通信は禁止**。別エージェントへの作業依頼はマスター発のみ（chat 経由）。構造変更（SOP / CLAUDE.md / `.claude/rules/`）は auto-inject で配布
- 判断根拠（なぜそう決めたか）を必ず3行以内で書け。省略するとデザイン意図が消失する
- 外部製品の引き継ぎ受領（vibe-base 外プロダクトの取り込み）は 5 ステップ手順あり → 詳細 `docs/ops/handoff-protocol.md`

詳細:
- `docs/ops/memory-ops.md`（/clear・/compact 詳細手順 + アーカイブ実装 + ADR フォーマット）
- `docs/ops/handoff-protocol.md`（外部製品取込 5 ステップ）
