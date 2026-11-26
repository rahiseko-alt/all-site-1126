---
description: Plan Mode（Claude Code 公式の権限モード）の運用規律。立案・実装の分離・plan 文書の構造・進化・実体照合を定義
---

## 設計思想（このドキュメントの前提）

本文書は以下 5 項目の設計思想に基づき、Plan Mode の運用規律を定義する。各セクションの規律はこの思想を実装するための手段である。

1. **プランモード突入トリガーは設計されており、ユーザー判断は補助的であるべきだ**
2. **プランモード中の進行も設計されており、役割分担は常に自動で行われるべきだ**
3. **プランモードの思考回路は設計されており、常に同じ軸で議論されるべきだ**
4. **プランモードでの決定項目は設計されており、承認基準は明確であるべきだ**
5. **プランモードでの決定事項は設計されており、承認後の実装もサブエージェント主体で進められる計画が立てられるべきだ**

---

## Plan Mode とは

Claude Code の権限モード。**Edit / Write 等の編集系ツールを封じ、Read / Grep / Glob と読み取り目的の Bash のみ許可する状態でセッションを進行させる仕組み。**【公】

- 起動: ユーザーが `Shift+Tab` でモードトグル（`default → acceptEdits → plan` の順）、または `/plan` コマンド、起動時 `--permission-mode plan` フラグ【公】
- plan 編集: `Ctrl+G` で proposed plan をデフォルトのテキストエディタで開き直接編集可能【公】（会話での修正指示より速い・運用で積極活用せよ）
- 終了: AI が `ExitPlanMode` を呼び出してユーザー承認を求め、承認時に選んだモード（default / acceptEdits / **auto** / Ultraplan 継続）に切替【公】
- 目的: 「最善の計画を作り、その後の実走を安全快適に行える前提条件を固める」

### 2026 公式新機能（運用に取り込む）【公】

| 機能 | 内容 | vibe-base 運用方針 |
|------|------|-------------------|
| **Ultraplan**（`/ultraplan`） | Plan Mode を claude.ai/code（web）で起動し browser-based レビュー | 大規模 repo は "too large to teleport" で起動不可（要 GitHub 連携設定）。小規模 product や単一テーマの深い計画レビュー時に使用 |
| **auto mode 承認後**（v2.1.83+） | plan 承認時に「auto」を選ぶと classifier が安全判定しながらプロンプトなしで実行 | 承認後モード判定表（後述）で「全 implement-agent 完結 + 副作用小」の plan に限り選択肢化。classifier が外部通信/本番 deploy/force push を自動 block |
| **`showClearContextOnPlanAccept`** | plan 承認時に「計画用の調査文脈を消すか」を確認 → 綺麗な文脈で実装に入れる | `settings.json` トップレベルで `true` に設定済（2026-06-06）。立案→実装のセッション分離規律（後述）を設定レベルで補強 |
| **`Ctrl+G`** | proposed plan を外部エディタで直接編集 | 会話往復を減らす。長い plan の手直しは Ctrl+G を第一選択 |

**重要**: Plan Mode はハーネスが自動発火する仕組みではなく、**ユーザー操作または設定でのみ起動する権限モード**である。AI が「Plan Mode に入るべきだ」と判定して入場を強制する経路は公式仕様上存在しない（→ ADR 0001）。

### 思想 1 を実装する手段：Plan-first by default【応】

設計思想 1「突入トリガーは設計されており、ユーザー判断は補助的」を実装する最適解は、**`defaultMode: "plan"` で恒常化**することである。`.claude/settings.json` に以下を記述：

```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

これにより全セッションが Plan Mode から始まり、AI 判定によるトリガー強制（ADR 0001 で抹消した B 設計）を再導入せずに思想 1 を達成できる。Boris Cherny（Claude Code 創設者）のセッションもほぼ全てが Plan Mode から始まる運用であり、公式 docs も "Set plan mode as the default" として明示的に推奨している。

---

## いつ使うか

| 状況 | Plan Mode 適用 |
|------|----------------|
| 新セッション直後・複数ファイル横断の着手前 | 適 |
| 影響範囲不明・複数の実装方針候補がある | 適 |
| アーキテクチャ判断・新規 hook / SOP 設計 | 適 |
| 3 ファイル以上の変更 / schema 変更 / 認証・決済系を触る | 必須【応】 |
| 1 ファイル内の小修正・型エラー解消・typo 訂正 | 不要 |
| 長時間作業の中盤（既に走り出している） | 不要 |

### 思想 3 を実装する手段：判断難易度軸での Extended Thinking 併用【応】

設計思想 3「思考回路は設計されており、常に同じ軸で議論」を実装するため、Plan Mode 中はタスク規模に加え**判断難易度軸**で Extended Thinking を併用する。Plan Mode の prompt に以下キーワードを含めることで Claude Code 限定の Extended Thinking が発動する：

| キーワード | 思考予算 | 適用場面 |
|-----------|---------|---------|
| `think` | 約 4,000 tokens | ルーチン的判断 |
| `think hard` / `megathink` | 約 10,000 tokens | 複数アプローチ評価 |
| `think harder` / `ultrathink` | 最大予算 | アーキテクチャ判断・新規設計 |

**注意**: これらは Claude Code CLI 限定の挙動で、Web 版・API では効かない。`.claude/commands/plan-template.md` の各セクション冒頭にデフォルト thinking レベルを埋め込むことで自動化できる。

---

## plan の固定見出し構造

plan ファイル（`docs/ops/plans/YYYY-MM-DD-*.md` または `~/.claude/plans/*.md`）は以下のセクションを必ず H2 (` ` + ` ` + 見出し) で並べる。順序固定・追加自由・削除禁止。

- 大義との整合
- 上位 plan からの constraint 変更
- 影響範囲
- サブエージェント割り振り方針
- 実装ステップ
- リスク・トラブル想定とリカバリープラン
- テスト方針
- 受け入れ基準
- 承認後モード

任意で先頭に Context を置いてよい。各セクションの中身は以下を満たす:

- **大義との整合**: 本 plan がどの大義を満たすかを 2 行で書く。`照合先:` に `roadmap-state.json` に実在するマイルストーン id（整数）を記す（ロードマップを持たない H1 継続型の作業は `N/A`）。`整合:` にその大義をどう満たすかを一文。**機械（`plan-daigi-gate` hook）が検査するのは `照合先:` の id 実在のみ**で、`整合:` は機械検査せずマスターレビューで担保する。CLAUDE.md §0 の序列（H1大義 ＞ H2大義 ＞ プラン ＞ アクション）を plan 内の照合順序へ写像したものであり、本セクションが必須リストの先頭に来るのはそのため

```markdown
## 大義との整合
- 照合先: 3
- 整合: <その大義をどう満たすかを一文>
```

### 上位 plan からの constraint 変更

上位 plan（参照元 plan ファイル / 関連 plan セクション / memory.md P1 持ち越し項目等）から本 plan で scope / constraint / 完遂基準を変更した場合、その差分を **必ず本セクションに表形式で明示**する。新規 plan で上位なしの場合は `N/A` と記載してもよい。

**Why**: vibe-base 司令塔のスコープクリープ防止と承認証跡の可視化が目的。本セクション不在で暗黙拡大した plan が承認された場合、後続の検証や引継ぎでスコープ判定不能になる。本規律は memory.md P3 #2「wrap-product-hooks.mjs 90 entries 破壊事案」と同型の「暗黙拡大→事故」連鎖を断つ予防策である。

**How to apply**: ①上位 plan の名前と該当項目を行で挙げる ②本 plan での扱い（格上げ / 削除 / 範囲外 / 新規 scope）を併記 ③承認証跡として ExitPlanMode 時に変更点をマスターに明示する。誤診断防止（観察事実先行）は本セクションの scope 外であり別 plan で扱う。

**HARD BLOCK 経路の注意**: `.claude/commands/plan-template.md` 等の `.claude/` 配下編集は **orchestrator 直接 Edit / subagent 不可** (memory.md P4 [2026-05-23]・Self-Modification HARD BLOCK)。本セクションを template に追加する際は orchestrator 自身が Edit する。

- **影響範囲**: 編集する全ファイル・ディレクトリを列挙。新規 / 削除 / 修正を区別。複数 repo に跨る場合は repo 単位で見出しを切る
- **サブエージェント割り振り方針**: 各 Step をどの agent にどのモデル（haiku / sonnet / opus）で割り当てるかの基準と、subagent へ実体ファイルを `@パス` で注入する原則を明示（→ 思想 2・5 の実装、後述）
- **実装ステップ**: Step 0（着手前確認）から番号順。**表形式で担当 agent・モデル・@注入ファイル・検証を明示**（→ 思想 5 の実装、後述）
- **リスク・トラブル想定とリカバリープラン**: 表形式（想定トラブル / 検知 / リカバリー）を推奨。検知方法を明示しないトラブルは記述するな。リカバリーは `.claude/rules/orchestration-discipline.md` 規律 2「4 原則」を起草時に先回りで紐付ける（→ 後述）
- **テスト方針**: 番号付きで検証手段を列挙。受け入れ基準と 1 対 1 対応させる
- **受け入れ基準**: 完了判定の客観条件。EARS 形式の意図文 + 機械検証可能条件のチェックリスト（→ 思想 4 の実装、後述）
- **承認後モード**: ExitPlanMode 承認時に選ぶモード（default / acceptEdits / auto）と理由を 1 行明記（→ 思想 5 の実装、後述）

### plansDirectory 設定でプロジェクト相対化【応】

`settings.json` で `plansDirectory: "./docs/ops/plans"` を指定すると、`~/.claude/plans/` ではなく**プロジェクト相対パス**に plan が保存され、Git でバージョン管理・PR レビュー・チーム共有が可能になる。本文書の plan 配置はこの公式機能を踏まえて自然に運用できる。

### 思想 4 を実装する手段：EARS + 機械検証条件の併用【応】

設計思想 4「承認基準は明確であるべき」を実装するため、「受け入れ基準」セクションは**EARS 形式の意図文**と**機械検証可能条件のチェックリスト**を併用する。

**EARS（意図の曖昧性排除）**:
- 形式: `WHEN <trigger> THE SYSTEM SHALL <response>`
- 例: `WHEN /plan command is invoked THE SYSTEM SHALL output a template file matching docs/standards/templates/plan.md`

**機械検証可能条件（完了判定の客観化）**:
- `Glob: docs/standards/templates/*.md → 3 件存在`
- `npm run lint → EXIT 0`
- `git diff --stat → +N 行、影響範囲セクション記載と一致`

EARS だけだと「store the user data」のような主観評価が混入し Claude が誤判定する余地が残る。機械検証条件だけだと意図が後任に伝わらない。両者は直交関係で**併用が必須**。

---

## セッション分離ワークフロー（ローカル運用規律）

立案と実装を別セッションに分ける。これは本文書のローカル規律であり、公式 best-practices は同一セッション内のモード切替も認めている【公】。

1. **立案セッション**: 新セッションを開く → `Shift+Tab` で Plan Mode 起動 → 必要なファイル / 過去 commit / 既存設計を Read で把握 → plan ファイルを書く → ExitPlanMode で plan ファイルのみコミット
2. **実装セッション**: 別の新セッションを開く（コンテキスト切替） → plan ファイルを Read → 順次実装

**理由**: 立案セッションは「広く浅く把握」モード、実装セッションは「狭く深く改修」モード。同一セッションで両方を行うと、立案中の調査ノイズが実装判断を歪める。

**例外**: 影響範囲が単一ファイル・実装ステップが 3 つ以下の小規模変更は同一セッション可。

### 思想 2 を実装する手段：Subagent 委譲と Orchestrator パターン【応】

設計思想 2「役割分担は常に自動で行われるべき」を実装するため、立案/実装/検証を **Subagent に固定委譲**する。主セッション（orchestrator）は**コーディング禁止の純粋な調整役**に徹し、実作業は subagent に分担する。orchestrator が実作業に手を出すと全体プラン品質が必ず劣化することが経験則として報告されている。

**Plan Mode 中の調査委譲**: Plan Mode 中に「use subagents to investigate ...」と明示し、Explore subagent（Haiku ベース）に委譲。主セッションのコンテキストを温存する。

**承認後の実装委譲**: 承認後の実装は implement-agent に委譲。orchestrator は最終 Glob 照合のみ行う（後述）。

**注意**: Subagent frontmatter の `permissionMode` は **auto mode 下では無視**される公式仕様がある。Plan Mode 中の subagent は親の Plan Mode 権限を継承するため、`implement-agent` は **Plan Mode 中には起動しても編集できない**。承認後（acceptEdits / auto に切替後）に呼び出す前提を Plan に明記すること。

---

## 受け入れ基準精度担保 — 深層防御アーキテクチャ【応】

設計思想 4「承認基準は明確であるべき」を構造的に強制する責務分離ゲート。各 stage は単機能で false positive を分散し、同種チェック重複を回避する。

> **Stage 1 (`plan-schema-gate`) は 2026-06-30 に撤去**。`pre-write-glob-check` 撤去 (2026-06-27・commit `5629fd2ac`) と同じ判断：PreToolUse Write/Edit で plan が完成形でないと block する設計が、Plan Mode の「plan を逐次 Write で組み立てる」公式ワークフローと衝突し、`（目視確認）` 等の正当な検証手段まで弾く誤検知が支配的だった。加えて現行 Claude Code は plan ファイルへの block を無視するため block 機能自体が無効化していた。plan 品質は Stage 2 (PostToolUse 警告) + Stage 3 (`/plan-finalize` 完全性確認) + マスターレビューで担保する。
>
> **[2026-07-17 公式仕様で追補]**【公】**Stage 2 の PostToolUse は仕様上 block できない**。公式は "`PostToolUse` hooks **can't undo actions** since the tool has already executed" / exit code 2 の効果は "Shows stderr to Claude; **the tool already ran**" と明記する（[hooks-guide](https://code.claude.com/docs/en/hooks-guide)）。Stage 2 が返す `{decision:"block"}` は**実行の阻止ではなく事後フィードバック**であり、「block を出した ≠ block が効いた」。**plan ファイルの Write を捕まえる経路は、上記 2 つの撤去理由と合わせて放棄する**。
>
> **plan を機械強制する正しいゲートポイントは `ExitPlanMode`**（→ 下記「大義照合ゲート」）。ExitPlanMode は tool 呼び出しであり **plan 本文が `tool_input.plan` に入る**ため、①承認提出の瞬間に 1 回だけ発火して途中経過を見ない＝ Stage 1 撤去の主因（逐次 Write との衝突による誤検知支配）が構造的に発生しない ②plan ファイルを読まないため「plan ファイルへの block が無視される」を迂回する ③plan の保存先（`plansDirectory` の効否・`~/.claude/plans/`）に依存しない。公式も matcher 指定を明示する（"The matcher scopes the hook to **ExitPlanMode only**"）ほか、"PreToolUse hooks fire **before any permission-mode check**" と定める。

| Stage | ゲートポイント | 配置 | 責務 |
|-------|---------------|------|------|
| Stage 2 | PostToolUse (Write/Edit) | `.claude/hooks/ac-keyword-gate.mjs` | 「受け入れ基準」セクション内に機械検証 keyword (EXIT 0 / Glob / git diff / npm run / sha256 / wc -l 等) が 1 件以上存在することを強制 |
| Stage 3 | `/plan-finalize` 起動時 | `.claude/commands/plan-finalize.md` Stage 0 prepend | plan 完全性確認 (構文 dry-run のみ・実行はしない)。承認後モード判定の前段 |
| Stage 4 | 実装完了後 (Worker → Evaluator) | `.claude/agents/verify-agent.md` + (option) `.claude/skills/goal-verify/SKILL.md` | 受入基準を実行 + transcript 評価。PASS/FAIL 表を返却。Worker/Evaluator 完全分離 |

### 大義照合ゲート (`plan-daigi-gate`)【応】

**上記 Stage 群（受け入れ基準の精度担保）とは別系統**。plan が **上流の大義を満たすか**を機械強制する唯一のゲート。CLAUDE.md §0 の序列「H1大義 ＞ H2大義 ＞ プラン ＞ アクション／上流から順に照合し 1 つでも満たさなければ却下」の、プラン段における実装。

| 項目 | 内容 |
|---|---|
| ゲートポイント | **PreToolUse × matcher `ExitPlanMode`**（plan ファイルの Write は捕まえない。理由は前掲の追補） |
| 配置 | `.claude/hooks/plan-daigi-gate.mjs`（**root 専用** — `scripts/_lib/root-only-hooks.mjs` の `ROOT_ONLY_HOOK_NAMES` に登録済。現在地の正本 `roadmap-state.json` は vibe-base root にのみ在るため、product へ配ると常時 deny になる） |
| 検査条件 | **1 個だけ**。`## 大義との整合` の `照合先:` が `roadmap-state.json` の `milestones[].id` に実在する整数、または `N/A`。満たさなければ `permissionDecision: "deny"` |
| 検査しないもの | `整合:` の一文（意味的整合は機械に判定不能。マスターレビューで担保） |

**なぜ条件を 1 個に絞るか**: 構造ゲートは過去 2 回（`plan-schema-gate` / `pre-write-glob-check`）とも**誤検知が支配的**で撤去された。生き残っている Stage 2 (`ac-keyword-gate`) は「keyword が 1 個以上あるか」という極めて緩い単一条件で運用できている。**条件を増やすほど誤検知で撤去される確率が上がる**（CLAUDE.md §2-4「①分岐の数を最小 ②その分岐はゴールにつながっているか」）。

**照合キーに名前でなく id を使う理由**: マイルストーン名は変わりうるが id は安定（`roadmap.md` の表と `roadmap-state.json` が id を共有）。自由文字列マッチは文言 drift で全 plan が落ち、誤検知支配 → 撤去の再演になる。

**LLM 判定を本体にしない理由**【公】: 公式は `type:"prompt"` hook（Haiku に自問させ `{"ok": true/false}` の JSON で判定させる仕組み）を提供するが、同時に "the evaluator is **still an LLM that is inclined to be generous** towards LLM-generated outputs" と釘を刺す（[harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps)）。よって**決定論チェックが本体、LLM 判定は足すとしても補助**とする。

#### 判定材料を守る側: `roadmap-state-write-gate`

大義照合ゲートの唯一の判定材料は `roadmap-state.json` の `milestones[].id`。**それが AI に書き換えられるなら、ゲートは自己申告と等価**になる（2026-07-17 検証パネル レンズ③ blocking・既存 backlog id:10 の格上げ）。そこで `.claude/hooks/roadmap-state-write-gate.mjs`（PreToolUse × `Write|Edit|MultiEdit`・root 専用）が **`status` と `updated_at` 以外の変更を deny** する。「AI が編集してよいのは status のみ」を**規約から機械強制へ格上げ**したもの【公】（公式: 状態は JSON に持ち "less likely to inappropriately change or overwrite JSON"・編集は 1 フィールドに限定せよ）。

> ⚠ **限界を明記する（「閉じた」と誤解するな）**: 本 gate が捕まえるのは **Write/Edit/MultiEdit ツール経由の書込のみ**。Bash から `node -e "fs.writeFileSync(...)"` で直接書けば通らないし、hook ファイル自体の削除も止められない。これは本 gate 固有の穴ではなく、**AI が Bash を持つ限り全 hook に共通する性質**。防げるのは「うっかり・横着で照合を飛ばす」経路までで、Bash を使う「意図的な改竄」は防げない。**この 2 つを混同して「機械強制したから安全」と報告するな。**
>
> 🔴 **「Write 経由は塞いだ」も断言するな。** 2026-07-17 の検証パネル 2 巡目で、レンズ②③が**独立に同一の穴**を実行再現した: `milestones` に `null` や非配列を混ぜて **deny メッセージ組立を例外で落とすと、外側 catch の fail-open で Write がそのまま通る**（Bash 不要）。初版の限界記述はこれを見落として「Bash だけが穴」と読める書き方をしており、**過大申告だった**。対処として ①対象ファイル確定後は全例外を deny に落とす（fail-closed）②deny メッセージ組立より前に構造を検査、へ改めた。**検査 hook で「例外＝黙って通す」は穴そのもの。新しい検査 hook を書く時は必ず fail-closed から始めよ。**

### Stage 4 動作シナリオ (Worker/Evaluator 分離・Anthropic 公式 best-practices 準拠)

1. ExitPlanMode 承認後、orchestrator が implement-agent を起動 → 実装実行 (Worker = Opus/Sonnet)
2. 実装完了時、orchestrator が verify-agent を起動 (Evaluator = Haiku・`disable-model-invocation: true` で自動起動抑制)
3. verify-agent が plan の受け入れ基準を 1 項目ずつコマンド実行 → 結果を表形式返却
4. 全 PASS → 完遂確定・commit へ進む
5. 部分 PASS or 全 FAIL → orchestrator に再実装指示 (Worker 再起動 loop)

### Stage 3 と Stage 4 の責務分離

- **Stage 3** = 構文 dry-run (実行しない・syntax check のみ・PreCommit 相当)
- **Stage 4** = 実行 + transcript 評価 (PostImplement 相当)

両者は時系列分離 + 責務分離。Stage 3 で構文 OK だが Stage 4 で実行 FAIL のケースを正しく捕捉する。

---

## agent 定義（`.claude/agents/` 配下）

思想 2・5 を実装するための subagent 群を `.claude/agents/` 配下に配置する。

### explore-agent.md（Plan Mode 中の調査担当）

```yaml
---
name: explore-agent
description: Plan Mode 中の codebase 調査を担当。Read/Grep/Glob のみ。
tools: Read, Grep, Glob
model: haiku
---
```

Haiku で十分（コスト最適化、公式 Explore subagent の挙動を踏襲）。

### implement-agent.md（承認後の実装担当）

```yaml
---
name: implement-agent
description: 承認済み plan の単一ステップを実装する。Plan に書かれた範囲外には踏み込まない。
tools: Read, Edit, Write, Glob, Grep, Bash(npm test:*), Bash(npm run lint), Bash(git add:*), Bash(git diff:*)
model: sonnet
---
```

Sonnet が標準（Opus はコスト過大、Haiku は実装精度不足）。Bash は allow リスト方式で絞る。

### verify-agent.md（Stage 4 Evaluator・受け入れ基準の機械検証担当）

```yaml
---
name: verify-agent
description: plan の受け入れ基準を機械検証する Evaluator 専用エージェント。Worker (implement-agent) と完全分離・実装は一切行わず実行と判定のみ。受入基準内の検証 keyword を全実行して PASS/FAIL 表を返す + transcript ベース意味判定。
tools: Read, Grep, Glob, Bash(npm test:*), Bash(npm run lint), Bash(npm run build), Bash(npm run typecheck), Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(test -f:*), Bash(test -d:*), Bash(ls:*), Bash(wc:*), Bash(sha256sum:*), Bash(node --check:*), Bash(cat:*), Bash(head:*), Bash(tail:*)
model: haiku
---
```

`disable-model-invocation: true` で**自動起動を抑制し、orchestrator から明示呼出**のみに制限。検証の独立性を担保する。Edit / Write を tools から完全排除することで Worker/Evaluator 分離を強制 (実装能力なし)。

詳細仕様 → 上記「受け入れ基準精度担保 — 4 段深層防御アーキテクチャ」セクション Stage 4 参照。

### 禁止コマンド（settings.json の `permissions.deny` で別途明示）

protected paths（`.git` / `.claude` / `.vscode` 等）は公式仕様で auto-approve されないが、以下は protected paths に含まれないため明示的 deny が必須：

- `Bash(*migrate*)` / `Bash(*migration*)` — DB スキーマ変更
- `Bash(rm -rf:*)` / `Bash(git push:*)` / `Bash(git reset:*)` — 破壊的操作
- `Bash(curl:*)` / `Bash(wget:*)` — 外部取得（サプライチェーン経路）
- `Bash(npm publish:*)` / `Bash(npm install:*)` — 依存変更・公開
- `Bash(docker:*)` / `Bash(kubectl:*)` — インフラ操作

migration が必要な場合は plan に「Step N: migration 実行 [担当: マスター手動]」と書き、agent には委ねない。

---

## 実装ステップの表形式記法（思想 5 の実装）【応】

「実装ステップ」セクションは**表形式**で担当 agent・モデル・@注入ファイル・検証を明示する。本文書既存の「リスクは表形式」と構造を揃え、視認性を担保する。モデル列・@注入ファイル列の埋め方は後述「サブエージェント割り振り方針」を参照する。

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -f` で全 path 確認 |
| 1 | src/auth/oauth.ts 新規作成 | implement-agent | sonnet | @src/auth/session.ts | Step 4 で検証 |
| 2 | src/auth/session.ts 修正 | implement-agent | sonnet | @src/auth/session.ts | Step 4 で検証 |
| 3 | tests/auth/oauth.test.ts 追加 | implement-agent | sonnet | @src/auth/oauth.ts | Step 4 で検証 |
| 4 | テスト実行・受け入れ基準照合 | verify-agent | haiku | @\<plan path\> | Glob 結果 / EXIT 0 |
| 5 | 最終 Glob 照合 | orchestrator | opus | — | 全 path 存在確認 |

**利点**: (1) 担当が一覧で把握できる、(2) 各ステップの検証主体が明示される、(3) orchestrator が直接担当するステップ（Step 0 と 5）が視覚的に分離される、(4) 本文書の「マスターレビュー」規律と整合する、(5) モデル列で過剰/過少モデル割当を起草時に検知し、@注入ファイル列で subagent のコンテキスト継承断絶（必要ファイルの渡し漏れ）を構造的に防ぐ。

---

## サブエージェント割り振り方針（思想 2・5 の実装）【応】

固定見出しの「サブエージェント割り振り方針」と「実装ステップ」表の **モデル / @注入ファイル** 列をどう埋めるかの基準を示す。これは思想 2（役割分担の自動化）・思想 5（subagent 主体の実装）を起草時点で具体化する手段である。

### モデル使い分け基準

agent 定義（`.claude/agents/`）の `model` 既定（explore=haiku / implement=sonnet / verify=haiku）を出発点とし、Step ごとに上書きが必要な場合のみ「実装ステップ」表の「モデル」列に根拠付きで明示する。

| モデル | 適用する作業の性質 | 典型 Step |
|--------|-------------------|-----------|
| haiku | 探索・grep・存在確認・機械検証など判断の浅い定型作業 | Glob 照合 / verify-agent の受入検証 |
| sonnet | 通常の実装（既存パターン踏襲のコード追加・修正・テスト作成） | implement-agent の大半の Step |
| opus | 設計判断・思想/規律横断の整合判断・`.claude/` HARD BLOCK 等で orchestrator 直編集が要る Step | アーキテクチャ変更 / 文書整合 / orchestrator 直 Step |

**上書きの根拠を書く**: 既定から外す場合（例: implement Step を opus に上げる）は「なぜ既定で不足か」を Step 内容欄に 1 行で書く。根拠なき上書きは禁止（コスト過大・精度不足の両方向の事故を防ぐ）。

### @注入の原則（subagent への実体ファイル明示注入）

subagent は **主セッションのコンテキストを継承しない**。orchestrator が Read 済みの実体ファイルでも subagent には見えない。必要な実体ファイルは subagent の prompt 内に `@パス` で明示注入する。

- **何を注入するか**: その Step の実装/検証に必要な「実体ファイル」（対象ソース・参照する既存実装・テンプレート・plan ファイル自身）
- **表への書き方**: 「実装ステップ」表の「@注入ファイル」列に注入対象 path を列挙する。注入不要な Step（orchestrator 直 / 探索のみ）は `—` と書く
- **plan の re-read 強制と整合**: drift 対策（後述「plan の進化」）の「各 Step で plan を re-read」と同じく、長い Step では plan ファイル自身（`@<plan path>`）も注入対象に含める
- **HARD BLOCK Step は @注入 不要**: `.claude/` 配下は subagent 不可で orchestrator 直編集（既述）。この種の Step は subagent を使わないため @注入 列は `—`

---

## リスク・トラブル想定とリカバリープランの書き方（規律 2 の起草時先回り）【応】

固定見出しの「リスク・トラブル想定とリカバリープラン」は、表形式（**想定トラブル / 検知 / リカバリー**）で実走前に先回り記述する。リカバリー欄は `.claude/rules/orchestration-discipline.md` 規律 2「4 原則」を起草時点で紐付ける。

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| worker の hallucination | 出力が受入基準と不一致 | 原則 2: 別 prompt で agent 再起動 |
| tool が NG を返す | EXIT≠0 / block 出力 | 原則 2: 同等機能の別 tool / Bash one-liner に切替 |
| 想定外の依存・前例不明 | grep で前例 0 件 | 原則 4: 公式 docs / sibling product を WebFetch・grep |

**規律 2 との役割分離（重複ではなく相補）**:
- 規律 2（orchestration-discipline）= **実走中に問題が発生した後**に順序固定で適用する事後原則
- 本欄 = **起草時**に「起きそうなトラブル」と「そのとき適用する原則」を先回りで宣言する事前設計

両者は時系列が異なる。起草時に本欄で先回りしておくことで、実走中の規律 2 適用が「どの原則を引くか」で迷わなくなる。

**4 原則（参照・正本は orchestration-discipline.md）**: ①ゴールは変えない ②ゴールへのルートを変更する ③ルート変更は最もシンプルかつ問題を先送りしない ④最適解の参考リサーチを行う。

---

## 上位 plan からの constraint 変更

上位 plan（参照元 plan ファイル / memory.md P1 持ち越し項目 / 関連 plan セクション等）から本 plan で scope / constraint / 完遂基準を変更した場合、その差分を **必ず本セクションに表形式で明示** する。新規 plan で上位なしの場合は `N/A` と記載してもよい。

vibe-base 司令塔のスコープクリープ防止と承認証跡の可視化が目的。本セクション不在で暗黙拡大した plan が承認された場合、後続の検証や引継ぎでスコープ判定不能になる。本規律は memory.md P3 #2「wrap-product-hooks.mjs 90 entries 破壊事案」と同型の「暗黙拡大→事故」連鎖を断つ予防策である。

**運用要点**: ①上位 plan の名前と該当項目を行で挙げる ②本 plan での扱い（格上げ / 削除 / 範囲外 / 新規 scope）を併記 ③承認証跡として ExitPlanMode 時に変更点をマスターに明示する。誤診断防止（観察事実先行）は本セクションの scope 外であり別 plan で扱う。

**HARD BLOCK 経路の注意**: `.claude/commands/plan-template.md` 等の `.claude/` 配下編集は **orchestrator 直接 Edit / subagent 不可** (memory.md P4 [2026-05-23]・Self-Modification HARD BLOCK)。本セクションを template に追加する際は orchestrator 自身が Edit する。

---

## 承認後モード判定（思想 5 の実装）【応】

plan 末尾の「承認後モード」セクションに、ExitPlanMode 承認時に選ぶモードと理由を 1 行で明記する。orchestrator はこの判定に従って承認オプションを選ぶ。

**判定軸**:

| 条件 | 承認後モード | 理由 |
|------|------------|------|
| 全ステップが implement-agent / verify-agent のみで完結 | `acceptEdits` | 自動進行が思想 5 と整合 |
| 全 implement-agent 完結 + 副作用小 + 長時間自走させたい | `auto`【公・v2.1.83+】 | classifier が外部通信/本番deploy/force push/main直push を自動 block しつつプロンプト省略。境界は会話で宣言可（「push するな」等は classifier が block 信号として扱う）。ただし context compaction で境界が消える既知挙動あり → 確実な禁止は `permissions.deny` で固定 |
| 1 ステップでも protected paths（.git/.claude 等）への書込含む | `default` | protected paths は acceptEdits/auto でも prompt/classifier 経由（auto は classifier ルーティング）→ 自動化の意味薄 |
| migrations / 外部 API 呼出 / インフラ操作含む | `default` | 副作用大、承認ゲート必要 |
| ファイル数 ≤ 3 かつ既存ファイル修正のみ | `acceptEdits` | 影響範囲限定で安全 |
| 新規ファイル ≥ 1 含む | `default` | hook ブロック発火リスクの早期検知 |

**auto mode 利用条件**【公】: アカウントが auto mode 要件を満たす場合のみ選択肢に出る（Opus 4.6+/Sonnet 4.6+・本環境 Opus 4.8 は対応）。`defaultMode: "auto"` は project/local settings では無視され user settings のみ有効（repo が自分に auto を付与できない公式安全策）。vibe-base は `defaultMode: "plan"` を維持し、auto は**承認後の選択肢**としてのみ使う。

**記法例**:
```
## 承認後モード
acceptEdits（理由: 全ステップ implement-agent 完結、protected paths 編集なし、新規ファイルなし）
```

---

## plan の進化（実装段階の合理的方針変更）

plan は固定文書ではなく**「実装判断の起点」**。実装段階で構造的判断（hook ブロック発火 / レンダ崩れ / 想定外の依存）が確定した場合、方針変更を許容する。

**手順**:
1. 実装段階で plan からの逸脱が必要と判断したら、まずマスターに「Plan 逸脱が必要、理由は X」と報告
2. 方針合意後、plan 本体は最小限の訂正（受け入れ基準・検証コマンド等）に留める
3. 「逸脱を plan に全面再反映」運用は冗長 → 行わない。記録は MISSION_LOG / commit message で十分

**スコープクリープと合理的進化の区別**:
- 受け入れ基準外の作業に踏み込む = スコープクリープ（NG・マスター承認なしに着手するな）
- 受け入れ基準内での方法論変更 = 合理的進化（OK・マスター報告のみ）

### Drift 対策：plan の re-read 明示要求【応】

実装中の Claude は context compaction で plan ファイルへの参照を失う既知挙動がある。**各実装ステップ完了時に「re-read the plan file」を明示要求する**規律を plan に埋め込む。具体的には、表形式の各 Step の検証列に「plan を re-read 後に次ステップへ」を含めるか、orchestrator が implement-agent 呼出時に毎回 plan path を渡す運用にする。

---

## plan の実体照合（新規作成 path の Glob 義務）

plan ファイルに「新規作成」と書く全 path は、書く前に必ず `Glob` で実体不在を確認する。

**Why**: Session 226 で「テンプレ 3 本不在」と Explore agent が報告 → 司令塔が照合せず plan に「新規 3 本」と記載 → ExitPlanMode 承認 → Write 実行で hook ブロック発火 → 既存だったと判明。

**手順**:
1. **「新規作成」と書く全ファイル**を Glob で実体照合
   ```
   Glob: docs/standards/templates/*.md
   Glob: products/{name}/runbook.md
   ```
2. **Explore agent の「不在」「NOT FOUND」報告は二重照合**: エージェントが Glob した範囲を司令塔が再 Glob。エージェント報告内の紛らわしい記述（`-template` 付き/無しの混在等）に注意
3. **plan ファイル冒頭の「影響範囲」セクションに照合結果を明記**: 「Glob 結果: 3 本中 0 本存在」のように証跡化
4. **ExitPlanMode 直前に最終照合**: plan に書いた全 path を `test -f` または `Glob` で一括確認

エージェント報告を信用するのは「内容の評価」のみで、「存在の事実」は司令塔自身が確認する。

### 盲目上書きの機械担保＝native Write-before-Read【応】

「新規作成のつもりが既存ファイルだった」ことによる**盲目上書き（中身破壊）は、Claude Code 標準の Write-before-Read 制約が機械的に防ぐ**。Write は「当該セッションで一度も Read していない既存ファイル」の上書きを失敗させる（"File has not been read yet. Read it first"）。新規宣言 path が実在すれば、Read していない以上 Write は通らず、そこで既存だったと気づける。

> かつて専用 PreToolUse hook（`pre-write-glob-check`・既存なら一律 block）を併設していたが、native 制約と機能が重複する一方、**Read 済みの正当な上書き（plan 反復編集・生成物再生成）まで一律に弾く誤検知が支配的**（実測で発火の大半が正常な上書き）で、検知力もないため 2026-06-27 に撤去した。安全担保は native に委譲する。

本セクション冒頭の**「新規作成 path の Glob 義務」（立案時の手動照合）は規律として存置**する。native は実装時の最後の防波堤、Glob 義務は立案時の予防であり、役割が異なる。

---

## /plan コマンド（雛形補助・強制なし）

`/plan` を実行すると上記の固定見出し構造の雛形が出力される（ローカル定義 `~/.claude/commands/plan-template.md`）。

- 雛形は補助。手書きで H2 を並べてもよい
- **plan 品質の判定に強制機構は存在しない**（hook / 判定スクリプトは無い）。plan 品質はマスターレビューで担保
- **例外は `## 大義との整合` の 1 点のみ**。これだけは `plan-daigi-gate` hook が ExitPlanMode で機械強制する（`照合先:` の id 実在チェック）→ 上掲「大義照合ゲート」。品質は判定していない（大義を**照合したか**だけを見る）
- 雛形を編集せず提出するのは禁止（中身を埋めること）

**命名衝突回避**: 公式 `/plan` は Claude Code v2.1.0 以降 **Plan Mode を起動する組み込みコマンド**として実装されている【公】。本文書のローカル雛形コマンドは `/plan-template` または `/plan-init` にリネームし、公式 `/plan` と衝突しないよう運用する。

---

## 関連 ADR

- `docs/adr/0001-plan-mode-c-design.md` — A・B 抹消と C 採用の決定経緯

---

## タグ説明

- **【公】**: Anthropic 公式ドキュメント（docs.claude.com）または公式 best-practices に明示された仕様・推奨。
- **【応】**: 公式仕様の上にコミュニティの技術者が築いた応用知見・運用パターン。個人ブログ・GitHub プラグイン・教育サイト等の信頼できる開発者が公開する実践知に基づく。公式違反ではないが、公式が必須としていない流派。

---

## 参考直リンク

**公式ドキュメント**
- 権限モード仕様: https://code.claude.com/docs/en/permission-modes
- Ultraplan（web 版 plan・browser review）: https://code.claude.com/docs/en/ultraplan
- auto mode 設定: https://code.claude.com/docs/en/auto-mode-config
- ベストプラクティス: https://code.claude.com/docs/en/best-practices
- 共通ワークフロー: https://code.claude.com/docs/en/common-workflows
- 設定ファイル: https://code.claude.com/docs/en/settings
- Subagent: https://code.claude.com/docs/en/sub-agents
- Hook: https://code.claude.com/docs/en/hooks

**技術者知見**
- Boris Cherny の Plan-first 運用: https://codewithmukesh.com/blog/plan-mode-claude-code/
- Plan + Auto-Accept コンボ: https://www.morphllm.com/claude-code-plan-mode
- 3 ファイル閾値・テーパリング: https://www.anyonebuilds.com/guides/claude-code-plan-mode
- ultrathink 詳細: https://self.md/guides/ultrathink/
- Extended Thinking レベル比較: https://stevekinney.com/courses/ai-development/claude-code-thinking
- Spec-Driven Development（EARS / BMAD / Spec Kit）: https://www.datacamp.com/tutorial/spec-driven-development-with-claude-code
- plansDirectory 設定活用: https://www.datacamp.com/tutorial/claude-code-plan-mode
- Orchestrator パターン: https://typhren.substack.com/p/sub-agents-in-claude-code-the-subagent
- Subagent 委譲パターン: https://codewithmukesh.com/blog/plan-mode-claude-code/
- ハンドオフ用途: https://agenticcoding.substack.com/p/5-new-claude-code-tips
- plan を file 同期するユーザー要望: https://github.com/anthropics/claude-code/issues/5552
- planning-with-files プラグイン: https://github.com/OthmanAdi/planning-with-files
- cc-plan-mode プラグイン: https://github.com/quochuydev/cc-plan-mode
- ExitPlanMode tool 仕様（非公式抽出）: https://github.com/Piebald-AI/claude-code-system-prompts
