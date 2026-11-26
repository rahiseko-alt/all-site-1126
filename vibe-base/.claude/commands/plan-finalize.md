---
description: plan ファイルを読み込み、(0) 完全性確認 → (1-6) 承認後モード判定を順次実行する。ExitPlanMode 直前に実行する。
---

引数で指定された plan ファイル（$ARGUMENTS）を Read し、以下の判定を順次実行してください。

## 判定手順

### 0. 完全性確認（Stage 3 / 新規・必須）

承認後モード判定に進む前に、plan の受け入れ基準が「Run: / Expected:」テンプレ準拠かを確認します。
未入力があればここで止めてマスター報告し、入力促進してください。

**0-1. 受け入れ基準セクションの抽出**

plan を Read し、`## 受け入れ基準` H2 以下から次の H2 までを抽出してください。
セクションが存在しない場合は「Stage 1 (plan-schema-gate) で先に block されるはずです。plan を再構成してください」と報告し終了。

**0-2. 各受入条件項目の writing-plans 形式チェック**

抽出セクション内の番号付き項目 (`1.` `2.` ...) ごとに、以下 2 行が記載されているか確認:

- `Run:` 行 (実行コマンドの記述)
- `Expected:` 行 (期待結果の記述)

例 (writing-plans skill 準拠):
```
1. fixture 配置完了

Run: `test -f tests/fixtures/plan-schema/ok/sample-plan.md`
Expected: EXIT 0
```

**注意**: 既存運用では「機械検証可能条件」H2 セクションに `Glob: ...` 形式でまとめて書く流派もあります。
その場合は「機械検証可能条件」セクションを抽出し、各 bullet が `Run: + Expected:` または
「コマンド → 期待結果」の対応で書かれていれば PASS とみなしてよい。

**0-3. dry-run 委譲（verify-agent / Haiku）**

`Run:` 行から bash コマンドを抽出し、verify-agent に dry-run を委譲してください。
verify-agent には以下の制約を明示:

- **実行はしない**
- `bash -n <command>` 相当の syntax check のみ
- コマンドが複数行・パイプ・リダイレクトを含む場合も bash -n で評価
- 結果は `{passed: <件数>, failed: <件数>, errors: [...]}` 形式で返却

**注意**: verify-agent (Haiku) が未配備の場合は、orchestrator 自身が `bash -n` 相当の syntax check を実施してよい。Stage 4 (Track L-4) で verify-agent 配備予定。

**0-4. 結果分岐**

- **全 PASS** → Step 1 へ進む
- **未入力検出** (Run/Expected 欠落) → 該当項目番号を列挙してマスター報告し終了:

  ```
  ⛔ /plan-finalize 完全性確認 NG

  以下の受入条件項目に Run: / Expected: が記載されていません:
    - 項目 #N: <要約>
    - 項目 #M: <要約>

  writing-plans skill 形式に従い、各項目に以下 2 行を追記してください:
    Run: `<実行コマンド>`
    Expected: <期待結果>
  ```

- **dry-run 失敗** → 該当 syntax error をマスター報告し終了

### 0.5. 危険項目確認

plan 冒頭の `## ⚠ 危険項目` が `なし` でない場合、承認後モード提示時にマスターへ警告する。

### 1. plan の読み込み
plan は手順0で既に全文 Read 済みのため再 Read しない（同一ファイルの二重読込禁止・§4.1トークン効率規律）。手順0で読み込んだ内容をそのまま使い、以降の抽出に進む。

### 2. 「影響範囲」セクションの抽出
新規作成・修正・削除の path をリストアップしてください。

### 3. 「実装ステップ」セクションの抽出
担当 agent 列を確認し、orchestrator / マスター手動 が含まれる Step を抽出してください。
実装ステップ表は「担当 agent・モデル・@注入ファイル・検証」の列構成です（docs/standards/plan-mode.md §実装ステップの表形式記法）。
判定軸 1（protected paths）の参考に @注入ファイル列の path も参照してよい。

### 4. 判定軸の適用

以下の判定軸を上から順に適用し、最初にマッチした条件で承認後モードを決定してください。

| 優先順位 | 条件 | 承認後モード | 理由 |
|---------|------|------------|------|
| 1 | 影響範囲に protected paths（.git / .claude / .vscode / .idea / .husky / .gitconfig / .bashrc 等）が含まれる | `default` | acceptEdits でも prompt するため自動化の意味なし |
| 2 | 担当に「マスター手動」が含まれる | `default` | 人手介入が必須 |
| 3 | 実装ステップに migrations / 外部 API / インフラ操作の文言が含まれる | `default` | 副作用大、承認ゲート必要 |
| 4 | 新規ファイル数 ≥ 1 | `default` | hook ブロック発火リスクの早期検知 |
| 5 | 影響範囲のファイル数 ≤ 3 かつ 既存ファイル修正のみ | `acceptEdits` | 影響範囲限定で安全 |
| 6 | 全ステップが implement-agent / verify-agent のみで完結 | `acceptEdits` | 自動進行が思想 5 と整合 |
| 7 | 上記いずれにも該当しない | `default` | 保守的デフォルト |

### 5. 判定結果の plan への書込
plan ファイルの「## 承認後モード」セクションを以下のフォーマットで上書きしてください。

```
## 承認後モード
[acceptEdits / default]（理由: [判定軸 N に基づく根拠を 1 行で]）
```

### 6. 最終確認の提示
ユーザーに以下を提示してください:

```
判定結果: [モード名]
根拠: [判定軸 N に基づく説明]

このまま ExitPlanMode を呼んでよろしいですか？
- yes: ExitPlanMode を呼び、承認時に上記モードを選択
- no: 判定軸の手動上書きを受け付ける
```
