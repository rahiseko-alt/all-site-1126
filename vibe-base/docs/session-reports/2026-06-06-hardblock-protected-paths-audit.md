# Phase 2-2 — 独自 HARD BLOCK × 公式 Protected Paths 重複監査

- 日付: 2026-06-06
- 担当: Agent G（opus・ガバナンス設計）
- 範囲: `.claude/hooks/pre-edit.sh` の独自 block/ask と公式 Protected Paths の重複監査・撤去/維持判定・撤去手順書
- 制約: **本 Phase では pre-edit.sh / settings.json を改変しない**（判定と手順書のみ）
- 関連: `docs/session-reports/2026-06-04-operation-modernization-handover.md`（Phase 2-2）/ `.claude/rules/permission-defense.md` / memory P4[2026-05-28]「真逆事案」/ failures.md 2026-05-31

---

## 1. 報告サマリ（結論先出し）

【実行済み】公式 Protected Paths を一次確認（code.claude.com/docs/en/permission-modes・2026-06-06 WebFetch）し、`pre-edit.sh` 全行 Read で独自 block/ask 対象を全列挙した。

**結論: pre-edit.sh の現存ロジックに「公式 Protected Paths と重複する独自 HARD BLOCK」は存在しない（撤去対象ゼロ）。**

- 旧 `.claude/skills|agents|commands` HARD BLOCK は a-b-c-3-jazzy-squid plan 段階 A-1a で**既に撤去済**（pre-edit.sh line 17-20 のコメントが撤去事実を記録）。
- 現存の独自ロジックは **`/products/{X}/.vercel/` 配下の本番ファイル編集に対する `ask`（チャット内承認）1 件のみ**。これは公式 Protected Paths に**含まれない独自固有の防御価値**があり、**維持判定**。
- したがって本 Phase で実施すべき pre-edit.sh の撤去はなし。撤去手順書は「将来 vercel ask を撤去する場合のテンプレ」として TS5 リカバリ準拠で記載する（今回は発動しない）。

---

## 2. pre-edit.sh の独自 block/ask 全列挙（line 番号付き）

【実行済み】`.claude/hooks/pre-edit.sh` 全 62 行 Read。

| # | 行 | 挙動 | 対象 | 種別 |
|---|---|---|---|---|
| A | 10-12 | `exit 0`（無視） | file_path 空 | 早期 return |
| B | 22-25 | `exit 0`（無視） | `/products/` を含まないパス全て | スコープ限定（独自 block の対象を products 配下に絞る） |
| C | 30-33 | `exit 0`（対象外） | basename が `CLAUDE.md` / `memory.md` / `failures.md` / `pc-progress.html` | 統治ファイル除外 |
| D | 34-36 | `exit 0`（対象外） | パスに `/docs/` を含む | docs 除外 |
| E | 37-39 | `exit 0`（対象外） | パスに `/tmp/` を含む | tmp 除外 |
| F | 41-59 | `permissionDecision:"ask"` | `/products/{X}/` サブツリー内に `.vercel/` を持つファイル | **独自固有の ask（唯一の能動的防御）** |

**注:** line 17-20 はコメントのみ。`.claude/skills|agents|commands` への旧 HARD BLOCK は撤去済で、現コードに `exit 2`（deny 相当）は **1 件も存在しない**。pre-edit.sh が出す唯一の能動判定は **F の `ask`**。

【実行済み】memory P4[2026-05-29]「reachability 自己再導出義務」に従い制御フローを再トレース: B（line 23）の `/products/` フィルタが先に効くため、C/D/E/F はすべて products 配下にのみ到達する。F の `.vercel/` 探索ループ（line 44）も `/products/` サブツリー内のみで打ち切る（ルート `.vercel` は無視）。到達性に矛盾なし。

---

## 3. 公式 Protected Paths（一次確認・verbatim 抜粋）

【実行済み】出典: code.claude.com/docs/en/permission-modes §Protected paths（2026-06-06）。`bypassPermissions` 以外の全モードで Protected Paths への書込は自動承認されない（default/acceptEdits/plan=Prompted・auto=classifier・dontAsk=Denied）。

**Protected directories:**
- `.git` / `.config/git` / `.vscode` / `.idea` / `.husky` / `.cargo` / `.devcontainer` / `.yarn` / `.mvn`
- `.claude`（**`.claude/worktrees` を除く** — Claude 自身の worktree 保管場所のため）

**Protected files（抜粋）:**
- `.gitconfig` / `.gitmodules`
- シェル設定: `.bashrc` / `.bash_profile` / `.zshrc` / `.profile` / `.envrc` 等
- パッケージ設定: `.npmrc` / `.yarnrc` / `.pnp.cjs` / `bunfig.toml` 等
- `.mcp.json` / `.claude.json`
- pre-commit / lefthook / gradle-wrapper / bazel 系設定ファイル

**重要な事実（公式仕様の最新確定）:**
- 公式は `.claude` ディレクトリ全体を Protected Paths に含める（`.claude/worktrees` のみ除外）。**`.claude/agents` / `.claude/skills` / `.claude/commands` を明示除外する記述は現行 docs にない**（過去 memory P4[2026-05-28] の「Claude routinely creates content として明示除外」は当時の記述・現行版では `.claude` 一括保護 + `.claude/worktrees` 除外のみ）。
- `.mcp.json` は**公式 Protected File**（独自 deny 不要）。
- `.env` は Protected Paths に**含まれない**（独自 deny `Edit(.env)` 等に固有価値あり・後述）。

---

## 4. 重複マトリクス（独自 / 公式 / 両方）

監査対象は pre-edit.sh の独自ロジックに加え、permission-defense.md が定義する `.claude` 系・guardrail 系の独自防御も併せて突合する（pre-edit.sh 単体では F の 1 件のみのため、文脈補完として settings.json deny も参照）。

| 防御対象 | 独自実装（vibe-base） | 公式 Protected Paths | 重複判定 | 撤去/維持 |
|---|---|---|---|---|
| `/products/{X}/.vercel/` 配下の本番ファイル | pre-edit.sh F（`ask`） | ❌ 非対象（`.vercel` はルートのみ `.devcontainer` 等と別物・products 配下の本番判定は独自概念） | **独自のみ** | **維持**（独自固有価値） |
| `.claude/skills\|agents\|commands` 書込 | （撤去済・現存せず） | `.claude` 一括保護（worktrees 除外） | 公式が後発でカバー | **撤去済**（再追加不要） |
| `.claude/settings.json` / `hooks` 書込 | settings.json に独自 deny なし（auto-mode 分類器 + pre-write-glob-check が別途防御） | `.claude` 一括保護 | 公式でカバー | 公式に委譲済（独自 deny 不要） |
| `.mcp.json` | 独自 deny なし | ✅ Protected File | — | 公式でカバー（独自追加不要） |
| `.git/**` 書込 | settings.json `Edit(.git/**)` / `Write(.git/**)` deny | ✅ `.git` Protected | **両方** | **維持**（deny はモード非依存・公式 Prompt より強い fail-safe） |
| `.env` / `**/.env*` | settings.json `Edit(.env)` 等 deny | ❌ 非対象 | **独自のみ** | **維持**（シークレット保護の核・公式非カバー） |
| `**/secrets/**` Write | settings.json `Write(**/secrets/**)` deny | ❌ 非対象 | **独自のみ** | **維持**（独自固有価値） |
| 破壊的コマンド（rm -rf / rimraf / dd 等） | pre-bash-destructive.mjs hook + deny | ❌ 非対象（Protected Paths は書込のみ） | **独自のみ** | **維持**（独自固有価値） |

### マトリクスから導く判定

- **「公式でカバーされ撤去可」な現存独自 HARD BLOCK = ゼロ。** `.claude` 系の重複は既に撤去済。
- **両方（`.git`）= 維持。** 公式は Prompt（モード依存・auto では classifier 経由）だが、独自 deny は**モード非依存の unrecoverable fail-safe**（permission-defense.md 評価順序 Deny 最優先）。公式 Protected が弱体化する acceptEdits/auto モードでも独自 deny が効くため、重複でも撤去しない。
- **独自のみ（vercel ask / .env / secrets / 破壊的コマンド）= 全件維持。** 公式 Protected Paths に存在しない固有防御価値あり。

---

## 5. 撤去判定の総括

| 項目 | 判定 | 撤去時の代替防御層 |
|---|---|---|
| pre-edit.sh F（vercel ask） | **維持** | （撤去しない。撤去仮定時の代替は §6 参照） |
| `.claude` 系 HARD BLOCK | **撤去済**（再追加不要） | 公式 Protected Paths（`.claude` 一括・worktrees 除外）+ auto-mode 分類器 + `defaultMode:"plan"` |
| settings.json `.git` deny | **維持**（公式と重複だが残す） | （撤去しない。モード非依存防御を捨てない） |
| settings.json `.env` / secrets deny | **維持** | （撤去しない。公式非カバー） |

**本 Phase での pre-edit.sh 改変対象: なし。** 撤去すべき重複が存在しないため、guardrail 実体は無変更が正しい結論。

---

## 6. マスター手動撤去手順書（テンプレ・今回は発動しない）

【非該当・本 Phase 対象外】本 Phase では撤去対象ゼロのため**本手順は発動しない**（撤去すべき重複が存在しないため）。将来 pre-edit.sh の特定ロジック（例: vercel ask）を撤去する判断が別 plan で確定した場合に備え、failures.md 2026-05-31 + memory P4[2026-05-31] 準拠の byte 正確コピー手順をテンプレ化して残す。

> guardrail hook（pre-edit.sh 等）の論理改変は auto-mode 分類器が plan 承認でも hard-block する（failures.md 2026-05-31）。AI は自分の guardrail を編集できない。**必ずマスター手動 + tmp 正本 → `cp -f` の byte 正確コピー**で行う。チャット貼付は端末で長い行が物理改行破壊されるため不可。

### 手順（撤去が確定した場合のみ・マスター実行）

1. **代替防御層を先に確定・明示する。** 撤去対象が守っていた価値を、撤去後にどの層が代替するかを本レポートに追記してからでないと撤去しない（例: vercel ask 撤去なら「本番デプロイ済 product 編集の誤爆防止」を `defaultMode:"plan"` + 公式 Protected Paths のいずれが代替するか）。代替不在なら撤去しない。
2. **司令塔が tmp に撤去後の pre-edit.sh 全文を Write する**（`tmp/pre-edit.sh`）。Edit による部分改変は禁止（AI の guardrail 自己改変は分類器が block するため、撤去後全文を新規 Write して人手コピーに渡す）。
3. **マスターが byte 正確コピーで本番へ反映**（bash・PowerShell `Copy-Item` 不可・`cp` 使用）:
   ```
   cp -f tmp/pre-edit.sh .claude/hooks/pre-edit.sh
   ```
4. **司令塔が単体起動で健全性確認**（failures.md 2026-05-26）:
   ```
   echo '{"tool_input":{"file_path":"products/x/app/page.tsx"}}' | bash .claude/hooks/pre-edit.sh; echo "EXIT=$?"
   ```
   期待: 撤去後の挙動（ask が出ない / exit 0）を実マッチで実証。
5. **propagate-hooks.mjs で全 product へ配布**（pre-edit.sh は全 product propagate 対象のため）。
6. **commit 前に `git diff` をマスターに提示**（failures.md 2026-04-23）してから commit。撤去で消える防御を merge 報告で列挙。

---

## 7. 検証（本レポートの空約束排除）

- 【実行済み】公式 Protected Paths を WebFetch で一次確認（`.claude` 一括保護・worktrees 除外・`.mcp.json` Protected File を verbatim 取得）。
- 【実行済み】pre-edit.sh 全 62 行 Read・独自 block/ask を §2 で全列挙（現存 `exit 2` ゼロ・`ask` 1 件を確認）。
- 【実行済み】重複マトリクスを §4 で作成・各項目に撤去/維持判定 + 代替防御層を明記。
- 【実行済み】撤去対象ゼロを結論。撤去手順書はテンプレとして §6 に記載（今回非発動・TS5 リカバリ準拠）。
- 【実行済み】pre-edit.sh / settings.json は無改変（判定と手順書のみ・本 Phase 制約遵守）。
