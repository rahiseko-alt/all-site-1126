# Session 196 作業報告書 — research-inbox-sop 見落とし

**日付:** 2026-04-22
**担当:** vibe-base 司令塔エージェント（Opus 4.7）
**関連:** Session 195 未解決事項の「毎回変わる大切なこと」への対応として Session 196 で着手

---

## §0. 背景

マスター指摘:「vibe-base では物理的に忘れない仕組みが既に稼働している」という司令塔の断定は誤り。マスターにとって大切なこと（毎回変わる）は既存仕組みで拾えていない。

マスターから 3 パターンの事例定義:
1. 調査してまとめたこと（VEST にはならなくても開発経過の判断材料になるもの。ゴミは除く）
2. マスターが指導的発言をした行動
3. 議論してたどり着いた方向性（結論ではなく方向性）

既存レイヤーとの照合で漏れを特定:

| パターン | 既存の場所 | 現状 |
|---|---|---|
| ① 調査まとめ | `docs/ops/research-inbox/` | 空・運用死 |
| ② 指導発言 | `memory/feedback_*.md`（普遍ルール限定） | 「毎回変わる」は対象外で入る場所なし |
| ③ 議論の方向性 | `docs/ops/sparring/` | 空・運用ゼロ |

マスター承認: 案 A から「指導発言の新設」を外し、①と③のみを対象とする。既存空レイヤー（research-inbox / sparring）の稼働 + Check-out/Check-in の義務化で進めることを 1 で承認。

---

## §1. 実施内容（原文）

### §1.1 `.claude/rules/session-lifecycle.md` — 2 箇所変更

#### 変更 ① Check-in セクション

**変更前（原文）:**
```
- `docs/ops/sparring/` に未配布の壁打ち結論があるか確認せよ。あればマスターに報告
- `docs/ops/research-inbox/` に期限切れファイルがあるか確認せよ。期限切れはマスターに報告（「破棄 or research-bank移動」の2択）
```

**変更後（原文）:**
```
- `docs/ops/research-inbox/` と `docs/ops/sparring/` の**直近1セッション分を必ず読め**。未配布・期限切れがあればマスターに報告（「破棄 or research-bank移動」の2択）
```

#### 変更 ② Check-out セクション

**変更前（原文）:**
```
## セッション終了（Check-out）
- MISSION_LOG に Check-out を書け（実施内容・未解決事項・変更ファイル・PC表バージョン・エラー回数）
- SESSION_JOURNAL.md にエントリを追記せよ（経緯・保留判断・温度感）
- `docs/ops/research-inbox/` の期限切れファイル有無を再確認。未処理があれば報告
- コミットしてから EXIT せよ
```

**変更後（原文）:**
```
## セッション終了（Check-out）
- MISSION_LOG に Check-out を書け（実施内容・未解決事項・変更ファイル・PC表バージョン・エラー回数)
- SESSION_JOURNAL.md にエントリを追記せよ（経緯・保留判断・温度感）
- **自己診断2項目（EXIT前義務）:**
  1. 今セッションで**まとめた調査**（VEST未満でも開発経過の判断材料になるもの）はあるか
     → 該当あれば `docs/ops/research-inbox/{topic-kebab}-{YYYY-MM-DD}.md or .html` に保存
     → ゴミは含めない。「次の意思決定で参照したいか」Yes のものだけ
  2. 今セッションで**議論してたどり着いた方向性**（結論ではなく方向性）はあるか
     → 該当あれば `docs/ops/sparring/{topic-kebab}.md` に保存（sparring-sop.md §3 の「方向性」見出しを使用）
  - **該当なしなら MISSION_LOG に「自己診断: 調査まとめなし / 方向性なし」と明示**せよ
- `docs/ops/research-inbox/` の期限切れファイル有無を再確認。未処理があれば報告
- コミットしてから EXIT せよ
```

---

### §1.2 `docs/ops/sparring-sop.md` — 4 箇所変更

#### 変更 ① §1 権限マトリクス

**変更前（原文）:**
```
| 総司令 | 読取可 | 全権 | 可（唯一の配布者） |
```

**変更後（原文）:**
```
| 総司令 | 読書可（方向性記録用） | 全権 | 可（唯一の配布者） |
```

#### 変更 ② §3 結論フォーマット

**変更前（原文）:**
````
```markdown
# {テーマ}
日付: YYYY-MM-DD
参加: マスター + 壁打ちエージェント

## 決定事項
1. {決定内容} — 根拠: {なぜそう決めたか}
2. ...

## 未決事項
1. {未決内容} — 理由: {なぜ決まらなかったか}
2. ...

## 背景・議論経緯（3行以内）
{このテーマが持ち上がった経緯と主要な論点}
```

**必須項目:**
- 決定事項には必ず根拠を付記
- 未決事項には必ず理由を付記
- 背景は3行以内に圧縮（詳細はSESSION_JOURNALに残る）
````

**変更後（原文）:**
````
```markdown
# {テーマ}
日付: YYYY-MM-DD
参加: マスター + {壁打ちエージェント or 総司令}

## 決定事項
1. {決定内容} — 根拠: {なぜそう決めたか}
2. ...

## 未決事項
1. {未決内容} — 理由: {なぜ決まらなかったか}
2. ...

## 方向性（結論ではないが議論でたどり着いたもの）
1. {方向性内容} — 背景: {なぜこの方向に傾いたか}
2. ...

## 背景・議論経緯（3行以内）
{このテーマが持ち上がった経緯と主要な論点}
```

**必須項目:**
- 決定事項・未決事項・方向性のうち**少なくとも1つ**は記載必須
- 決定事項には必ず根拠を付記
- 未決事項には必ず理由を付記
- 方向性には必ず背景を付記（なぜその方向に傾いたか）
- 背景は3行以内に圧縮（詳細はSESSION_JOURNALに残る）
````

#### 変更 ③ §5 禁止事項

**変更前（原文）:**
```
- 結論なしの壁打ちメモを sparring/ に残すこと（§3のフォーマットに従え）
```

**変更後（原文）:**
```
- 決定事項・未決事項・方向性のいずれも無い壁打ちメモを sparring/ に残すこと（§3のフォーマットに従え）
```

#### 変更 ④ バージョン履歴

**変更前（原文）:**
```
v1.0 | 2026-04-07 | 初版作成
```

**変更後（原文）:**
```
v1.1 | 2026-04-22 | 「方向性」セクション追加（結論前の議論到達点を保存する枠）。総司令も記録可に変更
v1.0 | 2026-04-07 | 初版作成
```

---

### §1.3 `docs/md-inventory.md` — 1 箇所変更

**変更前（原文）:**
```
| 15z14 | `docs/ops/sparring-sop.md` | 壁打ち運用SOP v1.0（結論保管・権限マトリクス・フォーマット・配布フロー） | SOP | A |
```

**変更後（原文）:**
```
| 15z14 | `docs/ops/sparring-sop.md` | 壁打ち運用SOP v1.1（結論・方向性保管・権限マトリクス・フォーマット・配布フロー） | SOP | A |
```

---

### §1.4 過去資産ファイルの移動

Session 195 由来の 2 ファイル（git 管理外・Downloads 配下）を research-inbox に移動。

**移動元 → 移動先:**
- `C:\Users\user\Downloads\dx-industry-table.html` → `docs/ops/research-inbox/dx-industry-numbers-2026-04-21.html`
- `C:\Users\user\Downloads\dx-product-match.html` → `docs/ops/research-inbox/dx-product-match-2026-04-21.html`

**各ファイル内容概要:**
- `dx-industry-numbers-2026-04-21.html`: 業種別DX業界数値テーブル（飲食・美容・歯科・整体・小売・士業・建設・塾・宿泊・不動産の 10 業種 × 業界公表値）
- `dx-product-match-2026-04-21.html`: 業種×自社プロダクト適合マッピング（10 業種 × 自社 14 製品のフィットマトリクス）

---

## §2. 読み忘れていた SOP（原文抜粋）

`docs/ops/research-inbox-sop.md` v1.0 を読まずに §1.4 の移動を実施。以下の 4 点に抵触。

### §2.1 §1 権限マトリクス（原文）

```
## §1. 権限マトリクス

| 役割 | research-inbox/ | research-bank/ | 他ディレクトリ |
|------|----------------|---------------|--------------|
| 調査エージェント | 読書可 | 読取のみ | 読取のみ |
| 総司令 | 読取可 | 全権 | 全権 |
| プロダクトエージェント | 読取不可 | 読取可 | 自フォルダ |

**プロダクトエージェントが調査データを使いたい場合:** マスター承認 → 総司令がresearch-bankに移動 → プロダクトエージェントに参照パスを伝達
```

**抵触点:** 総司令は「読取可」のみ（書込不可）。§1.4 の移動は総司令による書込であり、規約違反。

### §2.2 §2 ファイル命名（原文）

```
### 命名
- `{YYYY-MM-DD}-{テーマのkebab-case}.md`
- 例: `2026-04-07-chatbot-pricing.md`
```

**抵触点:** 規約は「日付が先」。私の `dx-industry-numbers-2026-04-21.html`・`dx-product-match-2026-04-21.html` は順序逆。正しくは `2026-04-21-dx-industry-numbers.html`・`2026-04-21-dx-product-match.html`。

### §2.3 §2 フォーマット・frontmatter（原文）

````
### フォーマット（frontmatter必須）

```markdown
---
theme: {テーマ名}
requested-by: {master / vibe-base / agent-name}
date: YYYY-MM-DD
expires: YYYY-MM-DD
status: pending
---

# {テーマ名}

## 調査目的
{1文で記載}

## 調査結果
{本文 — agent-rules.md「調査品質ルール」セクションに従う}

## ソース一覧
1. {ソース} — {URL}（{年}）
```

### status値
| 値 | 意味 |
|---|---|
| `pending` | 未処理（デフォルト） |
| `adopted` | 採用（research-bankへ移動済み） |
| `discarded` | 破棄（削除済み） |
````

**抵触点:** frontmatter 必須。私は HTML そのままで frontmatter なし。

### §2.4 §3 ライフサイクル・期限切れ（原文）

```
## §3. ライフサイクル

​```
調査エージェント → research-inbox/ にファイル作成（status: pending）
  ↓
総司令 check-in → 期限切れファイルを検出
  ↓
総司令 → マスターに報告（「破棄 or research-bank移動」の2択）
  ↓
マスター判断:
  A) 採用 → 総司令が research-bank に移動 + index.html更新 + inbox側を削除
  B) 破棄 → 総司令が inbox のファイルを削除
​```

### 期限切れの判定
- `expires` フィールドの日付が現在日付より過去 → 期限切れ
- 期限切れファイルが存在する場合、総司令はcheck-inの報告でマスターに一覧を提示
```

**抵触点:** expires 欄なしのファイルは期限判定不能。

### §2.5 §5 禁止事項（原文）

```
## §5. 禁止事項

- 調査エージェントが research-inbox/ 以外に書き込むこと
- 調査エージェントが research-bank に直接書き込むこと（昇格は総司令の仕事）
- プロダクトエージェントが research-inbox/ を直接読み取ること（マスター承認経由）
- frontmatter なしのファイルを inbox に置くこと
- 期限切れファイルを放置すること（総司令 check-in で必ず報告）
```

**抵触点:** 「frontmatter なしのファイルを inbox に置くこと」に直接抵触。

---

## §3. 現状のファイル状態

### 未コミット（git status）

**変更（M）:**
- `.claude/rules/session-lifecycle.md`（§1.1 の 2 箇所変更を反映済み）
- `docs/ops/sparring-sop.md`（§1.2 の 4 箇所変更を反映済み）
- `docs/md-inventory.md`（§1.3 の 1 箇所変更を反映済み）

**新規（??）:**
- `docs/ops/research-inbox/dx-industry-numbers-2026-04-21.html`（SOP 違反: 命名順・frontmatter なし）
- `docs/ops/research-inbox/dx-product-match-2026-04-21.html`（SOP 違反: 命名順・frontmatter なし）
- `docs/ops/session-196-report-research-inbox-miss.md`（本報告書）

**削除（移動元）:**
- `C:\Users\user\Downloads\dx-industry-table.html`（git 管理外のため差分なし）
- `C:\Users\user\Downloads\dx-product-match.html`（git 管理外のため差分なし）

### Hook バイパスの事実

`mv` コマンドでの移動は hook 監視対象外と判明。Write/Edit 経由の書込なら hook が検出したはずだが、shell move は素通り。結果、frontmatter なしの HTML が inbox に入った状態で停止している。

---

## §4. 残作業（マスター判断待ち）

**A. ファイルリネーム（SOP §2 命名規則順守）**
- `dx-industry-numbers-2026-04-21.html` → `2026-04-21-dx-industry-numbers.html`
- `dx-product-match-2026-04-21.html` → `2026-04-21-dx-product-match.html`

**B. frontmatter 付与（SOP §2 + §5 順守）**

各 HTML に同名コンパニオン `.md` を作成し、frontmatter + 概要 + HTML リンクを記載:
- `2026-04-21-dx-industry-numbers.md`
- `2026-04-21-dx-product-match.md`

または HTML 冒頭にコメント形式で frontmatter 埋込（要 SOP 改訂）。

**C. `research-inbox-sop.md` v1.1 改訂（総司令書込を公式化）**
- §1 権限マトリクス: 総司令「読取可」→「読書可（手動調査まとめ記録用）」
- §2 フォーマット: HTML 等は同名コンパニオン .md で frontmatter 管理、または HTML コメントで frontmatter 埋込を許可
- §3 expires: 調査エージェント産=1日（既存）/ 総司令産=30日まで延長可
- バージョン履歴: v1.1 | 2026-04-22 | 総司令書込可・HTML コンパニオン運用追加
- `.claude/rules/research-inbox.md` を追随更新

**D. `session-lifecycle.md` 自己診断 1 の命名表記修正**
- `{topic-kebab}-{YYYY-MM-DD}.md or .html` → `{YYYY-MM-DD}-{topic-kebab}.md (+ 同名 HTML 可)`

**E. `md-inventory.md` research-inbox-sop 行 更新**
- 89 行目: v1.0 → v1.1

---

## §5. 根本原因

1. **設計提示時に関連 SOP を全数確認しなかった:** `session-lifecycle.md`、`sparring-sop.md` は読んだが、research-inbox の SOP 本体（`research-inbox-sop.md`）と hook rule（`.claude/rules/research-inbox.md`）を読まなかった
2. **通電テスト義務を省略した:** 全エージェント共有記録の変更時に義務化されている「整合性検証 + 運用シミュレーション」のうち、クロスリファレンス確認が不十分
3. **Session 191 教訓 #1 の自己診断を怠った:** 「自分はバカだから見落としがあるはず」の視点で SOP 棚卸しをすべきだったが、最初の設計提示で「2 ファイル変更で済む」と断定した

---

## §6. エラー回数

今セッション: 1 件（SOP 見落としによる手戻り・マスター時間泥棒）

---

## 付録: research-inbox 関連ファイル一覧（次回以降の参照用）

research-inbox の運用は 3 ファイルに跨っており、1 つでも読み漏れると設計ミス。

| # | ファイル | 役割 |
|---|---------|------|
| 1 | `docs/ops/research-inbox-sop.md` | SOP 本体。権限・命名・フォーマット・ライフサイクル |
| 2 | `.claude/rules/research-inbox.md` | hook 自動注入ルール（SOP の要約版） |
| 3 | `.claude/rules/session-lifecycle.md` | Check-in/Check-out における inbox の扱い |

今後 research-inbox に関わる変更を行う場合は、上記 3 ファイル全てを先に Read する。

---

**報告書 終**
