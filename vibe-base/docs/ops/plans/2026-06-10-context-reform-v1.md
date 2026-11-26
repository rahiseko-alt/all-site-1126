# コンテキスト改革計画 v1.0

> 作成: 2026-06-10 / 担当: 司令塔エージェント

---

## Context

### なぜやるか

毎セッション冒頭に自動ロードされるファイル群が累積し、実質 **~51,000 トークン** をベースライン消費している。
コーディング作業着手前にコンテキストウィンドウの約 25〜30% を消費する状態であり、長時間セッションで context 圧縮・情報欠落が常態化している。

### 現状の数値

| ファイル群 | 行数 | 推定トークン |
|---|---|---|
| `~/.claude/CLAUDE.md` | 45 | 1,350 |
| `vibe-base/CLAUDE.md` | 53 | 1,590 |
| `.claude/rules/*.md` 全27本 | 847 | 25,410 |
| `~/.claude/projects/.../MEMORY.md` | 56 | 1,680 |
| ベースライン合計 | 1,001 | **~30,000** |
| product CLAUDE.md（代表値） | +200 | +6,000 |
| @import 展開（agent-rules.md 等） | +200 | +6,000 |
| pc-checkin による追加 Read | +300〜500 | +9,000〜15,000 |
| **product セッション実質合計** | **~1,700** | **~51,000** |

### 根本原因サマリー

| 優先順位 | RC | 問題名 | 改善余地トークン |
|---|---|---|---|
| 1 | RC-01 | rules 全27本の一括注入 | ~18,000/セッション |
| 2 | RC-04 | auto-memory topic ファイル肥大化 | ~9,000/参照時 |
| 3 | RC-02+RC-03 | pc-checkin 全文 Read × P3 膨張 | ~5,000〜8,000/セッション |
| 4 | RC-05 | 大型 product CLAUDE.md | ~6,000/product セッション |
| 5 | RC-06 | trimmer-system memory.md 上限超過 | ~1,500/セッション |

### 目標

| 指標 | 現状 | 目標 |
|---|---|---|
| ベースライントークン | ~30,000 | **~12,000（60% 削減）** |
| product セッション合計 | ~51,000 | **~25,000（51% 削減）** |
| rules 常時注入ファイル数 | 27 本 | **7 本** |
| product memory.md 行数上限 | 未定義 | **15 行** |
| vibe-base memory.md 行数上限 | 未定義 | **80 行** |
| pc-checkin STEP 数 | 9 STEP | **4 STEP** |

---

## 上位 plan からの constraint 変更

N/A（本計画は新規 plan。上位 plan なし）

---

## 影響範囲

### 新規作成

| ファイル | 種別 |
|---|---|
| `.claude/rules/optional/README.md` | on-demand rules 使用条件一覧 |
| `docs/ops/dead-products-registry.md` | 廃番台帳（memory/ から移動） |
| `docs/ops/trigger-map.md` | トリガーマップ（memory/ から移動） |
| `archive/trimmer-system-memory-202606.md` | P3・P4 退避 |
| `archive/shiota-karte-memory-202606.md` | P3・P4 退避 |
| `archive/n8n-memory-202606.md` | P4 退避 |
| `archive/learning-suite-kanji-foreign-memory-202606.md` | P4 退避 |
| `archive/code-review-skills-memory-202606.md` | P4 退避 |
| `archive/coach-memory-202606.md` | P4 退避 |

### 移動（削除 → 新パス）

| 移動元 | 移動先 |
|---|---|
| `memory/project_dead-products.md` | `docs/ops/dead-products-registry.md` |
| `memory/trigger-map.md` | `docs/ops/trigger-map.md` |
| `.claude/rules/*.md`（20 本） | `.claude/rules/optional/*.md` |

### 修正

| ファイル | 変更内容 |
|---|---|
| `~/.claude/projects/.../MEMORY.md` | P1.5 インライン状態削除・P2 密集行分離・参照先パス更新 |
| `products/trimmer-system/memory.md` | 114 行 → 15 行（P3・P4 を archive へ） |
| `products/shiota-karte/memory.md` | 101 行 → 15 行（P3・P4 を archive へ） |
| `products/n8n/memory.md` | 41 行 → 15 行 |
| `products/learning-suite-kanji-foreign/memory.md` | 50 行 → 15 行 |
| `products/new-trimmer-system/memory.md` | 37 行 → 15 行 |
| `products/code-review-skills/memory.md` | 35 行 → 15 行 |
| `products/coach/memory.md` | 45 行 → 15 行 |
| `products/google-system-dev/memory.md` | 44 行 → 15 行（確認先行） |
| `products/kobaraku/memory.md` | 24 行 → 15 行（確認先行） |
| `products/review-analysis/memory.md` | 25 行 → 15 行（確認先行） |
| スケルトン 7 製品の memory.md | 24 行 → 15 行 |
| `~/.claude/skills/pc-checkin.md` | 9 STEP → 4 STEP（約 150 行） |
| `~/.claude/skills/checkout.md` | P1 書き込みルール追記 |
| `scripts/check-in-verify.sh` | rules 本数・memory 行数チェック追加 |

### 対象外

- `~/.claude/CLAUDE.md` — ユーザーグローバル設定
- `vibe-base/CLAUDE.md` — 構造維持
- `products/*/CLAUDE.md` — 本計画対象外（Phase 2 候補）
- `archive/` 配下の既存ファイル — 読取専用
- `failures.md` 構造 — 移管先として使用するが構造変更なし

---

## サブエージェント割り振り方針

本計画は手順が明確なファイル操作中心のため、orchestrator（本セッション）が直接実行する。
サブエージェント分散は不要。Phase C の多製品対応は orchestrator が直列で処理し、Phase ごとに commit で区切る。

---

## 実装ステップ

### Phase A: rules 絞り込み・MEMORY.md 公式化

| Step | 作業内容 | 検証 |
|---|---|---|
| A-1 | `.claude/rules/optional/` ディレクトリ作成 | `ls .claude/rules/optional/` で存在確認 |
| A-2 | on-demand 20 本を `optional/` に移動。残存 7 本を確認 | `ls .claude/rules/*.md` が 7 本以下 |
| A-3 | `optional/README.md` に使用条件一覧を作成 | Glob でファイル存在確認 |
| A-4 | `memory/project_dead-products.md` を `docs/ops/dead-products-registry.md` に移動 | 移動先 grep で内容照合 |
| A-5 | `memory/trigger-map.md` をスキル frontmatter と照合し未移管分のみ `docs/ops/trigger-map.md` に移動 | 移動先 grep で内容照合 |
| A-6 | `memory/project_skill-inventory-2026-05-13.md` を削除（正本は `~/.claude/skills/` 実体） | `~/.claude/skills/` glob で代替確認 |
| A-7 | `memory/feedback_secret-pasting-prevention.md` を `docs/rules/` 内容と照合し重複分を削除 | grep で rules 側に内容が存在することを確認 |
| A-8 | MEMORY.md の P1.5 インライン状態削除・P2 密集行分離・参照先パスを更新 | Read で形式確認 |

**常時注入維持 7 本:**

| ファイル | 理由 |
|---|---|
| `self-verification.md` | 毎ターン参照必須 |
| `session-lifecycle.md` | Check-in/out の基盤 |
| `permission-defense.md` | 防御 3 段の入口 |
| `plan-mode.md` | Plan Mode 規律 |
| `orchestration-discipline.md` | マルチエージェント規律 |
| `notebooklm.md` | MCP 利用ルール |
| `skill-deployment.md` | スキル配置規律 |

### Phase B: vibe-base memory.md 縮小

**新テンプレート（上限 80 行）:**

```markdown
# vibe-base memory.md（上限 80 行）
> 司令塔専用・自エージェント以外の書込禁止

## 引継ぎレポート（次セッション必読）
@docs/session-reports/YYYY-MM-DD-checkout.html

## P1: 次タスク（3 件枠・Check-out で完了消去+新規追加）
- **次タスク:** {タスク名 30 字以内}
- **plan path:** `docs/ops/plans/xxxx.md`
- **現フェーズ:** P{N}
1. [importance:H][YYYY-MM-DD] {タスク名} — plan: {path}
2. [importance:M][YYYY-MM-DD] {タスク名} — plan: {path}
3. [importance:L][YYYY-MM-DD] {タスク名}（plan なし）

## P2: ADR 索引（直近 3 件枠）
- [YYYY-MM-DD] `docs/adr/NNNN-*.md` — {決定 1 行}

## P3: 失敗事例
→ `failures.md` 参照

## P4: 永続教訓
→ `archive/vibe-base-memory-YYYYMM.md` 参照
```

**変更点:**

| 項目 | 変更前 | 変更後 |
|---|---|---|
| P1 枠数 | 5 件 | 3 件 |
| P1 エントリ形式 | narrative 可 | タスク名 30 字以内 + plan path の 1 行形式のみ |
| P2 ADR 枠 | 6 件 | 3 件 |
| P3 | インライン可 | `failures.md` pointer のみ |
| P4 | インライン可 | `archive/` pointer のみ |
| 行数上限 | 未定義 | 80 行 |

**archive 強制条件:**

| 条件 | 強制度 | 対象 |
|---|---|---|
| 80 行超 | 必須 | P4 → `archive/vibe-base-memory-YYYYMM.md` に退避 |
| importance:L かつ 90 日経過 | 必須 | P1 エントリ削除 |
| P3 件数 3 件超 | 必須 | 最古の P3 → `failures.md` に移動 |
| importance:M かつ 180 日経過 | 推奨 | マスター確認後に削除 |

### Phase C: products/*/memory.md 縮小

**共通移行テンプレート（上限 15 行）:**

```markdown
# {product} memory.md（上限 15 行）
> 自エージェント専用・他エージェントは書込み禁止

## 引継ぎレポート（次セッション必読）
@docs/session-reports/{YYYY-MM-DD}-checkout.html

## P1: 引継ぎミッション（3 件枠）
> 直近 plan: products/{product}/docs/ops/plans/{plan-file}.md
> 本番 URL: {url}（デプロイ済みの場合のみ）
> dev 起動: {コマンド}
1. [importance:H][YYYY-MM-DD] **タスク名 30 字以内** — plan: {path}

## P2: ADR → docs/adr/ 参照
## P3: 失敗事例（3 件上限・超過時は failures.md へ移動）→ failures.md 参照
## P4: 永続教訓 → archive/{product}-memory-YYYYMM.md 参照
```

**共通移行手順（各 product で実行）:**

```
1. 対象 memory.md を Read し P1 有効ミッション・P3・P4 を抽出
2. archive/{product}-memory-202606.md を作成し P3・P4 全文を移動
3. failures.md 残行数を確認（上限 200 行）し P3 を移管
4. P1 を 3 件以内・各 1 行（タスク名 + plan path）に凝縮
5. 新テンプレートに置換し 15 行以下であることを確認
6. archive pointer パスを grep 照合してから元の P3・P4 行を削除
```

**product 別注意事項:**

| product | 行数 | 優先度 | 特記 |
|---|---|---|---|
| trimmer-system | 114 | 即対応 | P3 5 件・P4 14 エントリ。SALTY DOG ロゴ受領待ちは archive 候補 |
| shiota-karte | 101 | 即対応 | P1 空き。trimmer-system と P4 重複多→重複除去先行 |
| n8n | 41 | 早期 | P1 #3 説明的記述を除去。`failures.md` 行数確認後 P3 移管 |
| learning-suite-kanji-foreign | 50 | 早期 | P4 3 エントリ（各 5〜7 行）を archive へ |
| new-trimmer-system | 37 | 中期 | P3 インライン 8 行を `failures.md` に転記 |
| code-review-skills | 35 | 中期 | P4 5 エントリ（hook 規律含む重要教訓）を archive へ |
| coach | 45 | 中期 | P1 冒頭 `直近 plan:` 記述を保持 |
| google-system-dev | 44 | 確認先行 | 末尾 18 行の会話テキスト削除前にマスター承認必須 |
| kobaraku | 24 | 確認先行 | 凍結状態継続確認後に P1 書き換え |
| review-analysis | 25 | 確認先行 | P1 2 件の有効性をマスターに確認 |
| スケルトン 7 製品 | 24 | 低優先 | テンプレート形式統一（24 行 → 15 行）のみ |
| renai-game | 13 | スキップ | 全 P1〜P4 なし。現状凍結維持 |

### Phase D: checkout / pc-checkin スキル更新

**pc-checkin: 4 STEP 構成（削減後）**

| STEP | 内容 | 変更内容 |
|---|---|---|
| 1 | memory.md 読む | P1+P3 のみ Read。P4 は `archive/` pointer を skip |
| 2 | 自治憲法読む | product CLAUDE.md は `## 0. プロダクト定義` セクション head -30 のみ |
| 3 | plan path 特定 + head -50 | HTML レポートは Read 禁止を明示追加 |
| 4 | 現在地特定 → マスター報告 | 報告は 3 行のみ（次タスク / フェーズ / P1 引継ぎ） |

**削除する STEP:**

| 削除 STEP | 理由 |
|---|---|
| STEP 4（照合リスト版照合） | 版ズレは稀。NG 時のみ対応で十分 |
| STEP 6（推奨モデル行） | モデル選択はマスターが文脈で判断 |
| STEP 7〜9（スキル発火・作業・Check-out） | 重複記載のため削除 |

**checkout: P1 書き込みルール**

- エントリ形式: `[importance:H][YYYY-MM-DD] {タスク名 30 字以内} — plan: {path}`
- 1 行形式固定。narrative（経緯・背景）を P1 に書くことは禁止
- 枠数: 3 件
- archive 強制チェックを checkout フロー末尾に追加

**削減する Read 対象:**

| 対象 | 現状 | 削減案 |
|---|---|---|
| memory.md | 全文 Read | P1+P3 セクションのみ（offset/limit 指定） |
| product memory.md | 全文 Read | P1 セクションのみ |
| HTML レポート | 一部セッションで Read | 明示禁止を追加 |

### Phase E: 検証

`scripts/check-in-verify.sh` に追加するチェック項目:

```bash
# rules/ 常時注入ファイル数（7 本以下）
RULES_COUNT=$(ls .claude/rules/*.md 2>/dev/null | grep -v optional | wc -l)
[ "$RULES_COUNT" -le 7 ] && echo "PASS: rules count=$RULES_COUNT" || echo "FAIL: rules count=$RULES_COUNT (max 7)"

# product memory.md 行数チェック（全製品 15 行以下）
for f in products/*/memory.md; do
  LINES=$(wc -l < "$f")
  [ "$LINES" -le 15 ] && echo "PASS: $f ($LINES lines)" || echo "FAIL: $f ($LINES lines, max 15)"
done
```

確認コマンド（PowerShell）:

```powershell
# Phase A 後: rules ファイル数確認
(Get-ChildItem ".claude\rules\*.md" | Where-Object { $_.FullName -notlike "*optional*" }).Count

# Phase C 後: 全 product memory.md 行数一覧
Get-ChildItem "products\*\memory.md" | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    [PSCustomObject]@{ File = $_.FullName; Lines = $lines; Status = if ($lines -le 15) { "OK" } else { "OVER" } }
} | Format-Table -AutoSize

# Phase D 後: pc-checkin SKILL.md 行数確認
(Get-Content "$env:USERPROFILE\.claude\skills\pc-checkin.md" | Measure-Object -Line).Lines

# failures.md 行数確認（上限 200 行）
(Get-Content "failures.md" | Measure-Object -Line).Lines
```

---

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知方法 | リカバリー |
|---|---|---|
| archive pointer 切れ（次エージェントが参照できない） | archive 作成直後に `grep {product}-memory-202606 products/{product}/memory.md` | pointer パス不一致なら Edit で修正してから元 P3・P4 行を削除 |
| trimmer-system・shiota-karte の重複削除ミス | 移行前に両 P4 を並べて diff 確認 | shiota-karte 先行・trimmer-system 後の順で作業。重複確認前に削除しない |
| `failures.md` 200 行超（P3 移管でオーバー） | 移管前に `wc -l failures.md` で確認 | `archive/failures-202606.md` に古い行を退避してから移管 |
| rules optional 化でスキルが必要ファイルを見失う | optional 化後 1 セッション監視。参照エラーの有無を確認 | エラーが出たファイルは `rules/` に差し戻す |
| pc-checkin 4 STEP 化で Check-in 品質が低下 | 削減後 3 セッション連続で Check-in 品質を評価 | 問題があった STEP を選択的に復元する |
| P1 3 件枠でミッション漏れ | checkout 時に 3 件超の場合 importance:L が plan に逃げているか確認 | 4 件以上ある場合は importance:L を plan ファイルに移して pointer 化 |
| google-system-dev 末尾 18 行の誤削除 | 確認先行グループとして Phase C の最後に配置 | マスター確認取得前は当該 product に手をつけない |

---

## テスト方針

1. **Phase A 後:** `ls .claude/rules/*.md | grep -v optional` で 7 本以下を確認
2. **Phase A 後:** MEMORY.md を Read し、インライン状態情報（「マスター手動未決」等）が消えていることを確認
3. **Phase B 後:** `wc -l` で vibe-base memory.md が 80 行以下を確認
4. **Phase C 後:** 全 product memory.md の行数が 15 行以下であることを PowerShell コマンドで一括確認
5. **Phase C 後:** 各 archive ファイルが存在し、元 memory.md の pointer パスと一致することを grep 確認
6. **Phase C 後:** `wc -l failures.md` で 200 行以下であることを確認
7. **Phase D 後:** `wc -l ~/.claude/skills/pc-checkin.md` で 150 行以下であることを確認
8. **Phase E:** `bash scripts/check-in-verify.sh` を実行し、新規追加チェック項目を含めて全 PASS

---

## 受け入れ基準

WHEN 本計画の全 Phase が完了したとき THE SYSTEM SHALL 以下の条件を全て満たすこと:

1. `.claude/rules/` 常時注入ファイル数: `ls .claude/rules/*.md | grep -v optional | wc -l` が 7 以下
2. `optional/README.md` 存在: Glob `.claude/rules/optional/README.md` でヒット
3. MEMORY.md インライン状態削除: Read で「マスター手動未決」等の文字列が存在しないことを確認
4. 廃番台帳移動: Glob `docs/ops/dead-products-registry.md` でヒット・`memory/project_dead-products.md` が Glob 不存在
5. skill-inventory 削除: Glob `memory/project_skill-inventory-2026-05-13.md` が不存在
6. trimmer-system memory.md 縮小: `wc -l products/trimmer-system/memory.md` が 15 以下
7. shiota-karte memory.md 縮小: `wc -l products/shiota-karte/memory.md` が 15 以下
8. trimmer-system archive 保全: Glob `archive/trimmer-system-memory-202606.md` でヒット・Read で P3・P4 内容が存在
9. shiota-karte archive 保全: Glob `archive/shiota-karte-memory-202606.md` でヒット・重複除去実施済み
10. failures.md 上限維持: `wc -l failures.md` が 200 以下
11. 早期・中期 5 製品の縮小: `wc -l products/n8n/memory.md` `wc -l products/new-trimmer-system/memory.md` 等が各 15 以下
12. pc-checkin 縮小: `wc -l ~/.claude/skills/pc-checkin.md` が 150 以下
13. checkout ルール追加: Read `~/.claude/skills/checkout.md` で「3 件枠・1 行形式・30 字上限」の記述が存在
14. check-in-verify.sh 更新: Read `scripts/check-in-verify.sh` で rules 本数・memory 行数チェック行が存在
15. 検証スクリプト全 PASS: `bash scripts/check-in-verify.sh` の EXIT が 0

---

## 承認後モード

**推奨モード: acceptEdits**

理由: ファイル移動・削除・Edit が中心で、全て人手で確認可能な粒度の変更。auto では削除操作の誤爆リスクがある。Phase 単位でマスターに進捗報告しながら進める。

**実施順序・依存関係:**

```
Phase A（rules 削減・MEMORY.md 修正）→ commit
↓
Phase B（vibe-base memory.md 縮小）→ commit（A 完了後推奨）
↓
Phase C（products memory.md 縮小）→ 即対応 → 早期 → 中期 → 確認先行 → 低優先 の順で commit
↓
Phase D（スキル更新）→ commit（B・C 完了後）
↓
Phase E（検証・スクリプト更新）→ 最終 commit
```

---

## 実装時決定（2026-06-10 検証後・計画書 vs 実装の意図的乖離を明記）

検証フェーズ（懐疑的検証者 3 体 + 司令塔中立フィルタ）で計画書と実装の差分 3 件を検出したが、いずれも**実装側が正しい意図的決定**である。計画書を実装に合わせて追記する（K3 計画書陳腐化の解消）。

| # | 計画書の記述 | 実装の実態 | 決定根拠 |
|---|---|---|---|
| 1 | P1 引継ぎミッション「30 字以内」 | 「60 字以内」を採用 | riskReview C-02。30 字では引継ぎに必要な状態・決定事項が欠落し実効性を損なうため 60 字に緩和 |
| 2 | RC-01「optional フィールド導入」 | 不採用 | フィールド純増は Refactor-on-Write に反し、固定様式の硬直化を招くため見送り |
| 3 | pc-checkin SKILL.md の圧縮方針 | STEP 見出しは維持し中身のみ圧縮（304 → 177 行） | 見出し構造は工程の可読性・順序保証の正本であり削ると工程飛ばしを誘発するため、構造保持・本文圧縮の方針を採用 |
