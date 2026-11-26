# ADR 0004 — auto-memory（公式既定ON）と手管理 memory.md の役割分担

> 旧番号 0002 は `0002-memory-role-separation.md` と衝突していたため 0004 に採番し直した（2026-07-02・番号衝突解消）。

- Status: Proposed
- Date: 2026-06-06
- Author: Agent G（opus・ガバナンス設計）
- 関連: `docs/session-reports/2026-06-04-operation-modernization-handover.md`（Phase 2-1）/ `.claude/rules/session-lifecycle.md`（memory.md 分散運用 v2.0β）/ ADR 0001（plan-mode-c-design）

---

## Context

### なぜこの判断が要るか

運用近代化診断（2026-06-04）の Phase 2-1。マスター体感「現運用がイマイチ」の主因は **コンテキスト恒常圧迫（重さ）**。診断スナップショットで auto-memory 行は `⚠️` 判定（`MEMORY.md 121行 + memory/ 153ファイル`・既定ON）。本 ADR は **公式 auto-memory 機能と vibe-base 独自の手管理 memory.md 運用の役割分担を確定**し、寄せ替えの可否を「全面移行 / 部分移行 / 現状維持」のいずれかで結論する。

### 公式 auto-memory の仕様（一次確認: code.claude.com/docs/en/memory・2026-06-06 WebFetch）

| 項目 | 公式仕様（auto memory） |
|---|---|
| 既定 | **ON**（v2.1.59+）。`autoMemoryEnabled:false` / `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` で無効化 |
| 書き手 | **Claude 自身**（マスターの訂正・好みから自動蓄積） |
| 格納場所 | `~/.claude/projects/<project>/memory/`（git repo 由来・worktree 横断共有） |
| ロード量 | `MEMORY.md` の**先頭 200 行 or 25KB のいずれか早い方**を毎セッション注入。超過分は非ロード |
| トピックファイル | `debugging.md` 等は**起動時非ロード**・必要時に Claude が自力 Read |
| 共有範囲 | **マシンローカル**（マシン間・クラウド間で非共有・git 管理外） |
| 用途（公式） | build コマンド・デバッグ知見・Claude が発見した好み |

### vibe-base 現状（手管理 memory.md・実測）

| ファイル | 実体 | 性質 |
|---|---|---|
| `memory.md`（リポジトリ root） | 司令塔 memory.md（MISSION+MEMORY 統合・P1〜P4） | **git tracked・チーム共有**・`@import` で引継ぎレポート注入 |
| `failures.md` | 1 失敗 1 行・200 行上限・90 件規模 | **git tracked**・check-in で読む |
| `products/{product}/memory.md` | product エージェント専用（分散運用 v2.0β） | **git tracked**・自エージェントのみ書込 |
| `~/.claude/projects/.../memory/MEMORY.md` | auto-memory entrypoint・121 行 | **git 管理外・マシンローカル**・既に手で P1〜P3 構造化運用中 |
| `~/.claude/projects/.../memory/*.md`（153 件） | `feedback_*` / `project_*` / `user_*` トピック群 | git 管理外・`[[wikilink]]` 参照・MEMORY.md から指名参照 |

**現状の特異点:** vibe-base は公式 auto-memory ディレクトリ（`~/.claude/projects/.../memory/`）を **Claude 自動蓄積ではなく「手管理 MEMORY.md（司令塔行動規範）+ トピック分割」として人為運用**している。つまり「公式の格納場所」を「独自の手管理運用」で使う混成状態。これが診断 `⚠️` の本質。

---

## Decision

**部分移行**を採用する。全面移行も現状維持も採らない。

役割分担を以下の表で確定し、**「点在ファイル参照・git 共有・規律性」が必須な領域は手管理 memory.md（git tracked）に維持**、**「Claude が発見した一過性の好み・build/debug 知見」のみ公式 auto-memory（マシンローカル自動蓄積）に寄せる**。寄せ替え対象は新規発生分のみで、既存の手管理資産の機械的な auto-memory 流し込みは行わない。

### 役割分担表（判断軸: ①自動trim耐性 ②点在参照構造との両立 ③分散運用 v2.0β 整合）

| 領域 | 寄せ先 | 根拠（①自動trim ②点在参照 ③分散運用） |
|---|---|---|
| P1 絶対規律（口調・氏名・vibe-base 外編集禁止 等の恒久規律） | **手管理 memory.md 維持** | ①200 行 trim で末尾欠落が致命 ②MEMORY.md P1 は全エージェント安全弁 ③司令塔正本 |
| P1 引継ぎミッション（5 件枠・Check-out 更新） | **手管理 memory.md 維持** | ①次セッション再開の単一正本・欠落不可 ②`@import` で引継ぎレポート注入 ③Check-out 規律の対象 |
| P3 失敗事例 / `failures.md`（客観 7 基準） | **手管理 memory.md（failures.md）維持** | ①check-in で全件読む・trim 不可 ②`[[wikilink]]` 多数 ③git tracked でチーム共有必須 |
| P4 永続教訓（importance:H） | **手管理 memory.md 維持** | ①H タグ = archive 不可 = trim で失われては困る ②feedback_*.md へ wikilink ③SRE blameless 正本 |
| product エージェント memory.md（分散運用 v2.0β） | **手管理 memory.md 維持** | ②自エージェント排他書込・他は Read ③分散運用 v2.0β の核・auto-memory の repo 単位共有と不整合 |
| Claude が発見した build / test / debug コマンド | **公式 auto-memory へ寄せ替え可** | ①再発見可能で trim 許容 ②点在参照不要 ③司令塔規範と無関係な技術メモ |
| Claude が発見した一過性の好み・ツール癖 | **公式 auto-memory へ寄せ替え可** | ①失われても再学習可 ②単独完結 ③規律でない学習 |
| マスター個人の行動ログ・経営判断 | **どちらにも書かない**（行動ログ vault 専有） | session-lifecycle 書込排他基準（混入禁止）を踏襲 |

### 寄せ替えの実施方針（部分移行の具体）

1. **既存手管理資産は触らない。** `memory.md` / `failures.md` / `products/*/memory.md` は git tracked 単一正本として維持。機械的 auto-memory 流し込みは混成状態を悪化させるため禁止。
2. **新規発生分のみ振り分け。** 今後 Claude が発見する build/debug/好みは auto-memory の自然蓄積に任せる（既定ON のまま）。規律・引継ぎ・失敗事例は従来どおり手で memory.md へ。
3. **`~/.claude/projects/.../memory/MEMORY.md` の二重性を明示。** 当面は「司令塔行動規範（手管理）」+「Claude 自動蓄積」の混成を許容するが、200 行 / 25KB 上限を前提に **手管理部分を先頭・恒久規律優先で配置**（現状の P1 最上部設計は正しい）。25KB / 200 行に接近したら importance:L を archive へ退避（既存圧縮ルール継続）。
4. **公式 auto-memory は無効化しない。** 既定ON を維持（マシンローカルの build/debug 蓄積はコスト 0 で有益）。disable は採らない。

---

## Consequences

### 良い結果

- **コンテキスト圧迫の構造的悪化を防ぐ。** 手管理 memory.md（git・規律性）と auto-memory（マシンローカル・一過性学習）の境界が明確になり、どちらに何を書くかの判断コストが消える。
- **規律性・チーム共有・点在参照が保全される。** P1/P3/P4・引継ぎ・分散運用 v2.0β は git tracked 単一正本のまま。auto-memory の repo 単位共有による分散運用破壊リスクを回避。
- **公式機能を否定せず併用。** auto-memory 既定ON のまま build/debug 知見を自動蓄積でき、手管理負荷が増えない。

### 悪い結果 / トレードオフ

- **`~/.claude/projects/.../memory/MEMORY.md` の混成状態が当面残る。** 手管理規範と Claude 自動蓄積が同一ファイルに同居し、200 行 / 25KB 上限の圧迫管理が継続的に必要。
- **auto-memory はマシン間非共有。** 別マシン / 新環境では auto-memory 由来の build/debug 知見が消える。ただし規律・引継ぎは git tracked 側にあるため再開可能性は損なわれない。
- **全面移行の効率化は得られない。** auto-memory 一本化すれば手管理負荷は減るが、自動 trim・マシンローカル・Claude 任せの書込では vibe-base の規律性（客観 7 基準・importance タグ・分散排他）が崩壊するため不採用。

### 不採用案と理由

- **全面移行（auto-memory 一本化）:** 自動 trim で P1 恒久規律・引継ぎ 5 件枠が欠落リスク。マシンローカルで git チーム共有不可。分散運用 v2.0β（product 別排他）と repo 単位共有が不整合。→ 規律弱体化に直結するため不採用。
- **現状維持（auto-memory 無効化 / 完全手管理）:** 既定ON の build/debug 自動蓄積（コスト 0・有益）を捨てる理由がない。診断の `⚠️`（混成の判断コスト）が解消されない。→ 公式機能の正味メリットを放棄するため不採用。

### フォローアップ（本 ADR では実施しない）

- 本 ADR は Status:Proposed。マスター承認後に Accepted へ。
- 寄せ替えの機械検証項目（auto-memory 既定ON 確認・MEMORY.md 行数 ≤200 / ≤25KB）は別途 `check-in-verify.sh` への追加を検討（本 Phase では guardrail/script 非改変のため判定のみ）。
