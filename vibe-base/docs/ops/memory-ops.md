> ⚠️ 要点は `.claude/rules/session-lifecycle.md` で自動注入される。ここは詳細版。

# memory.md 運用手順（分散運用 v2.0 β 統合型・Session 295〜）

> 本ファイルはルート CLAUDE.md の SOP索引から参照される運用手順書である。
> 単独では規範力を持たない。CLAUDE.md 本体の原則が常に優先される。

---

## 分散運用の基本構造

| エージェント | 自 memory.md パス | archive 接尾辞 |
|------------|---------------------|----------------|
| vibe-base 司令塔 | `memory.md`（ルート） | `-shireitou` |
| ai-concierge | `products/ai-concierge/memory.md` | `-ai-concierge` |
| aiueo | `products/aiueo/memory.md` | `-aiueo` |
| coach | `products/coach/memory.md` | `-coach` |
| foodee | `products/foodee/memory.md` | `-foodee` |
| homepage | `products/homepage/memory.md` | `-homepage` |
| kobaraku | `products/kobaraku/memory.md` | `-kobaraku` |
| learning-suite-kanji | `products/learning-suite-kanji/memory.md` | `-lsk` |
| learning-suite-kanji-foreign | `products/learning-suite-kanji-foreign/memory.md` | `-lskf` |
| omotenashi-trainer | `products/omotenashi-trainer/memory.md` | `-omotenashi` |
| review-analysis | `products/review-analysis/memory.md` | `-review-analysis` |
| ymm-shorts | `products/ymm-shorts/memory.md` | `-ymm-shorts` |

### 厳守ルール

1. **書込権限の排他**: 自エージェントは自 memory.md にのみ書込み。他エージェントの memory.md は Read のみ
2. **agent ↔ agent 直接通信禁止**: 別エージェントへの作業依頼はマスター発のみ（chat 経由）。依頼書ファイル経路は廃止
3. **構造変更の経路**: SOP / CLAUDE.md / `.claude/rules/` 改訂 = auto-inject で全エージェント自動配布
4. **圧縮対象の排他**: 自分の memory.md だけを圧縮（archive 退避）する。他エージェントのエントリを退避するな（権限外）

### 移行履歴

- Session 295 で MISSION_LOG.md 分散運用 v1.0 → memory.md 分散運用 v2.0 β 統合型に移行
- 旧 MISSION_LOG.md 12 ファイルは `archive/{agent}-mission-log-archive-2026-05-18.md` に退避（5 件 substantive）または git rm（7 件 empty template）
- MISSION + MEMORY 1 ファイル統合化（公式原則「per-directory memory」+ 独自軽量実装）
- 既存司令塔 MEMORY 機構（`~/.claude/projects/<vibe-base>/memory/MEMORY.md` + feedback_*.md 等 30+）は温存（auto-inject 経路維持）

---

## memory.md 構造（目標 100 行 / 上限 200 行）

```markdown
# {agent} memory.md（目標 100 行 / 上限 200 行）

> 自エージェント専用・他エージェントは書込み禁止
> 分散運用 v2.0（β 統合型・Session 295 〜）

## P1: 引継ぎミッション（5 件枠・Check-out で完了消去+新規追加）
1. [importance:H][YYYY-MM-DD] 次セッション着手タスク 1
2. [importance:M][YYYY-MM-DD] ...

## P2: ADR 索引（直近 5 件・本体は docs/adr/NNNN-*.md）
- ADR-0001 タイトル (Session NNN 採用) → docs/adr/0001-xxx.md

## P3: 失敗事例（7 客観基準のいずれか 1 件以上で登録）
### [YYYY-MM-DD][severity:H] 事象タイトル
- 役割: 司令塔 / プロダクトエージェント
- 根本原因: ...
- 再発防止策: ...
- 関連 commit: xxxxx

## P4: その他永続教訓（importance タグ付き自由領域）
- [importance:H] ...

---
運用規律:
- 110 行超で archive 候補（importance L 優先・archive/{agent}-memory-YYYYMM.md）
- ADR は別ファイル化・本 memory には索引のみ
- 失敗事例は role/事象ベース・個人名禁止（blameless）
- 自エージェントのみ書込み（他エージェントは Read のみ）
```

---

## P1 引継ぎミッション運用

**5 件枠固定**:
- 上部 5 件のみ保持（6 件超は archive 退避 or マスター判断で削除）
- Check-out 時に完了タスクを消去し、新規タスクを追記
- 完了済みは git log で参照可能（消去しても情報損失なし）

**importance タグ付与**（Heuristic 80% + LLM 20% + マスター override）:

```
H (永続・archive 不可) — いずれか 1 件以上:
  - 本文に「確定」「正本」「禁止」「解任」「漏洩」を含む
  - マスター明示「これ重要・残せ」

L (30 日で archive 候補) — すべて満たす:
  - importance 判定後 30 日 git log でアクセス 0
  - 本文 500 字未満

M (90 日で archive 候補): 上記以外（デフォルト）
```

**書き方例**:
```
1. [importance:H][2026-05-18] Phase A ブラウザ実機検証 — npm run dev → 5 件抜き取り確認
2. [importance:M][2026-05-18] Phase B 着手（SQLite recordStudy 実装）
3. [importance:L][2026-05-18] Google Play Designed for Families 対象年齢層マスター確認
```

---

## P2 ADR 索引運用

ADR (Architecture Decision Record) は **1 決定 = 1 ファイル** で `docs/adr/NNNN-*.md` に保存。
memory.md には **直近 5 件の索引のみ** 記載（本体への参照リンク）。

**ADR ファイルフォーマット**（Nygard 標準）:
```markdown
# ADR-NNNN: タイトル
## Status: Accepted (YYYY-MM-DD)
## Context: 背景（なぜこの判断が必要だったか）
## Decision: 決定内容
## Consequences: 結果・影響
```

**memory.md P2 索引フォーマット**:
```
- ADR-0001 タイトル (Session NNN 採用) → docs/adr/0001-xxx.md
```

**配置（per-directory・scope 厳守）**:
- 司令塔 ADR → `vibe-base/docs/adr/NNNN-*.md`
- 各 product ADR → `products/{product}/docs/adr/NNNN-*.md`
- 他ディレクトリの ADR は読まない（自エージェント関連のみ）

---

## P3 失敗事例運用

**登録基準（客観 7 基準のいずれか 1 件以上）**:
1. vibe-base 全体悪影響（自爆漏洩 / データ破壊 / 全機械検証 NG）
2. git revert / force reset / git reset --hard 発生
3. 三打席ルール抵触
4. マスター差し戻し 3 件以上（同一セッション内）
5. プロセス kill / 共有状態破壊
6. Plan Mode 再入（方針大転換）
7. 機械検証 NG によるセッション停止

**記述ルール（SRE blameless 準拠）**:
- role/事象ベース（「司令塔が」「プロダクトエージェントが」）
- **個人名禁止**
- 根本原因 1 行 / 再発防止策 1 行 / 関連 commit

**フォーマット**:
```markdown
### [YYYY-MM-DD][severity:H] 事象タイトル
- 役割: 司令塔 / プロダクトエージェント
- 根本原因: ...
- 再発防止策: ...
- 関連 commit: xxxxx
```

---

## P4 永続教訓運用

importance タグ付き自由領域。長期保持価値のある教訓・参照情報・索引等。

**書き方例**:
```
- [importance:H] マスター氏名: 小齊平 恒平
- [importance:M] 既存司令塔 MEMORY (feedback_*.md/project_*.md) は ~/.claude/.../memory/ に温存
```

---

## 圧縮ルール（archive 移管）

**トリガー**: 自 memory.md が 110 行超

**手順**:
1. importance L から優先削除候補抽出
2. archive 退避: 該当 entry を `archive/{agent}-memory-YYYYMM.md` に append（git mv ではなく内容コピー → memory.md からは削除）
3. memory.md から該当 entry を削除
4. コミット: `git commit -m "[agent]: memory.md を圧縮・archive 退避"`

**重要**:
- 他エージェントの memory.md は圧縮対象にするな（権限なし）
- importance H は archive 不可（永続）
- 完了済 P1 ミッションは Check-out 時に消去（圧縮トリガーとは別経路）

---

## Check-out 記録手順

作業終了（Check-out）時に **自エージェントの memory.md** を以下手順で更新せよ:

### Step 1: P1 引継ぎミッション更新
- 完了タスクを消去
- 新規タスクを追記（5 件枠）
- 各 entry に `[importance:H/M/L][YYYY-MM-DD]` タグ付与

### Step 2: P2 ADR 索引更新（該当する重大決定があれば）
- 新規 ADR ファイルを `docs/adr/NNNN-*.md` に作成
- memory.md P2 に 1 行索引追記
- 6 件超は古いものを索引から削除（ADR 本体ファイルは残す）

### Step 3: P3 失敗事例追記（7 基準該当時のみ）
- 客観基準 7 件のいずれか 1 件以上に該当する場合のみ追記
- role/事象ベース・個人名禁止・1 行根本原因 + 1 行再発防止策

### Step 4: P4 永続教訓追記（任意）
- importance タグ付き

### Step 5: 行数確認
- 200 行超は machine 検証で警告
- 110 行超は archive 推奨

### Step 6: コミット
- 自エージェント memory.md のみ含める
- 他エージェント memory.md は触らない

> **⚠️ 「P1 引継ぎミッション」を更新する前に必ず実施せよ:** 前回 Check-out の P1 全件を照合し、各項目を「今セッションで解決したか」で 1 件ずつ判定せよ。**残ったものだけ**を次回タスクとして書け。前回リストをコピペするな（Session 232 で陳腐項目 3 件が次セッションに持ち越され、Check-in でマスターに指摘された事案あり）。

---

## Check-in 手順

セッション開始時に以下を実施せよ（CLAUDE.md §4 Check-in義務と連動）：

1. **自エージェントの memory.md** を読み、前回 Check-out の P1 引継ぎミッション + P3 失敗事例を確認する
2. 詳細手順は `pc-checkin` skill（`~/.claude/skills/pc-checkin/SKILL.md`）に従う

---

## /clear 使用時の手順

> 要点は `.claude/rules/session-lifecycle.md`「/clear 使用時」セクションに自動注入される。ここは詳細版。

`/clear` はセッション開始と同等のコンテキスト喪失を発生させる。
memory.md 経由の引き継ぎ原則を維持するため、以下の手順を必ず守れ。

### /clear 前（ミニ Check-out）

```
1. [importance:H][YYYY-MM-DD] /clear 前メモ: [現状] / [再開ポイント]
```

- 自エージェント memory.md P1 に 1 行で追記
- 例: `1. [importance:H][2026-04-17] /clear 前メモ: コア機能実装中・auth.js 修正完了 / /clear 後は api.js のテスト実装から再開`
- 変更済みファイルを**必ずコミット**してから /clear を実行せよ（未コミットのまま /clear するとコンテキスト喪失で変更内容が追えなくなる）

### /clear 後（即時 Check-in）

通常の Check-in 手順のうち以下を実施せよ：

| 手順 | 同セッション内 /clear | セッション新規開始 |
|------|--------------------|--------------------|
| 自 memory.md 読み直し | **必須** | 必須 |
| hook伝播（propagate-hooks.mjs） | スキップ可 | 必須 |

### Plan Mode との連動

詳細は `.claude/rules/plan-mode.md` を参照。/clear 後に Explore フェーズで得た知識が
リセットされた場合は、新しいセッションで Plan Mode から再開する。
