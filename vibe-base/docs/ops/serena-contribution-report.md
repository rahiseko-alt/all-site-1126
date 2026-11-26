# Serena MCP 導入貢献レポート（実測版）

> 作成日: 2026-06-27 / 対象期間: 2026-06-23T00:05 〜 2026-06-26T23:05（導入後 4 日・実測）
> データソース: `~/.claude/projects/C--Users-user-Desktop-ClaudeCode-vibe-base/` 配下の全 transcript（1228 ファイル）
> 解析スクリプト: `outputs/serena-usage-analyze.mjs`（JSON parse による実 tool_use 集計・生 grep で件数クロスチェック済）
> 正本 runbook: `docs/ops/serena-mcp-setup.md`

---

## TL;DR（結論先出し・実測）

**測定可能な貢献は現状ほぼゼロ。** 導入 4 日間で Serena の実呼び出しは **計 8 回**、うち実コード検索は **`find_symbol` 1 回のみ**。編集・リファクタ系ツール（`replace_symbol_body` / `find_referencing_symbols` / `rename_symbol` / `get_diagnostics_for_file` 等）は **全て 0 回**。同期間の `Read` は **4112 回**。

旧レポートの「品質 +3.7/5.0」「トークン削減 70〜87%」は、**1 度も発火していないツールに対する投影値**であり、実測の裏付けが無い。実態は **ほぼ未採用**。

---

## 1. 実測サマリ

| 指標 | 実測値 |
|------|--------|
| Serena 実呼び出し総数 | 8 回 |
| Serena を使ったセッション数 | 5 |
| `Read` 呼び出し総数（同コーパス） | 4112 回 |
| Serena 初回 / 最終 | 06-23 00:05 / 06-26 23:05 |
| 走査 transcript / parse 成功行 | 1228 ファイル / 79,764 行 |

## 2. ツール別 実呼び出し（全 8 回の内訳）

| ツール | 回数 | 種別 | 結果サイズ |
|--------|------|------|-----------|
| `initial_instructions` | 5 | 起動オーバーヘッド（マニュアル読込） | 平均 7603 字/回 |
| `activate_project` | 2 | 起動オーバーヘッド | 平均 398 字/回 |
| `find_symbol` | 1 | 実コード検索 | 161 字（≈40〜55 token） |
| 上記以外の全 19 ツール | 0 | — | — |

> 8 回のうち **7 回は起動・マニュアル読込のオーバーヘッド**。正味の実作業は `find_symbol` 1 回だけ。

## 3. 適用機会 vs 実使用（採用率）

Serena が効くのは TS/JS 系ファイル。その編集・読取の実機会を実測した。

| 対象 | 実測（下限値） |
|------|---------------|
| TS/JS 系（.ts/.tsx/.js/.jsx/.mjs/.cjs）の Read | 541 回 |
| 同 Edit | 171 回 |
| **Serena が適用しえた機会（Read+Edit）** | **≥ 712 回** |
| 実際の Serena 実コード操作 | 1 回 |
| **採用率** | **0.14%（上限。下記理由で実際はさらに低い）** |

参考: 作業の主軸は Markdown（Read 2045 / Edit 998）と HTML（Read 445 / Edit 214）で、Serena 非対象領域が多い。それでも TS/JS の実機会が 712 回以上あり、そこを `Read`/`Edit` で素通りしていた。

## 4. 「自動 activate」の実態

旧 runbook は「AI が自動 activate」と記載。実測は **4 日で `activate_project` 2 回のみ**。

原因は確認済み: **`.claude/settings.json` に serena の SessionStart hook が登録されていない**（grep 結果 0 件）。自動 activate は SessionStart の soft instruction（モデルへの依頼文）に依存しており、**機械強制が無い**。マスター規律「AI 自己規律は信用しない・強制は hook/機械検証で実装する」に照らせば、低採用は当然の帰結。

## 5. 測定手法と限界

| 項目 | 内容 |
|------|------|
| 集計法 | 各行を JSON parse し `type=tool_use` かつ `name` 先頭 `mcp__serena__` を実呼び出しとして計上（ツール定義リストと区別） |
| クロスチェック | 生 grep `"name":"mcp__serena__..."` 全件 = 8（init5/activate2/find_symbol1）で node 集計と一致 |
| parse 失敗 113,733 行の扱い | 非 jsonl ファイル・長大行等。**Serena 件数は生 grep で全ファイル横断検証済みのため影響なし**。一方 §3 の Read/Edit 機会（712）は parse 成功行のみの集計＝**下限値**。実機会はさらに多く、採用率は 0.14% より低い |

## 6. なぜ使われないか

- 【確認済】自動 activate の機械強制が無い（settings.json に hook 未登録・§4）。
- 【推測】既定ツール（Read/Edit）の習慣が強く、能動的に Serena を選ぶ動機が無い。
- 【推測】作業の過半が Markdown/HTML/JSON で Serena 非対象。TS/JS でも 1 ファイル局所編集が多く、`find_symbol` の優位が体感されにくい。

## 7. 推奨アクション（root 解決）

価値判断（撤去 or 継続）を今決める前に、**不採用の主因＝機械強制の不在を 1 週間で潰し、再測定する**。soft instruction のまま「使え」と書いても変わらない（実測が証明済み）。

| # | 施策 | 種別 |
|---|------|------|
| 1 | PreToolUse hook: TS/JS への `Edit`/`Write` 直前に `find_symbol`/`replace_symbol_body` 検討を促す通知（ask でなく log） | 機械強制 |
| 2 | SessionStart の soft instruction を、`products/<name>` 自動 activate の実 hook に置換（発火ログ付き） | 機械強制 |
| 3 | 2026-07-04 に本スクリプトで採用率を再算出 | 再測定 |

判定基準: 再測定で TS/JS 編集の Serena 経由率が閾値（暫定 30%）に届かなければ **撤去を具申**。届けば継続し、その時点で初めて品質・削減効果を実測する。

---

## 結論

導入は完了したが **実運用されていない**。現時点の貢献は測定上ほぼゼロで、便益（品質・トークン削減）は **発生していない**（便益を生むツールが 0 回）。
次の一手は宣伝文の更新ではなく、**機械強制 + 再測定**。それで採用が立ち上がらなければ撤去が誠実。

> 正本 runbook: `docs/ops/serena-mcp-setup.md` / 解析: `outputs/serena-usage-analyze.mjs`
