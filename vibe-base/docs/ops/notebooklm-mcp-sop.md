# NotebookLM MCP 運用SOP v1.0

> 参照: CLAUDE.md §6 SOP運用

## 基本原則

NotebookLM = 外付けの脳。Claude Code = 司令塔。

- 重い処理（全文読解・横断検索・要約・リサーチ）は NotebookLM 側で完結させる
- Claude Code は「指示を出す」「答えを解釈する」「次の一手を考える」に徹する
- ソース本文は Claude Code の context に載せない

## ノートブック運用ルール

- ノートブックは少数に集約する（フラット方式）
- テーマ別に細かく分けない。1ノートブックに大量のノートを入れ、タイトルのタグで分類する
- ソース上限（50/ノートブック）に近づいたらアーカイブ用を分割する

## ノート記入ルール

### タイトル

```
YYYY-MM-DD_claudecode_フォルダ名_内容15字以内
```

例:
```
2026-04-16_claudecode_aiueo_coconala-category230-analysis
2026-04-16_claudecode_ai-concierge_faq-matching-bug-investigation
2026-04-16_claudecode_vibe-base_notebooklm-sop-design
```

- `claudecode` = 固定タグ。Claude Code が保存したノートを識別・検索するために必ず付ける
- フォルダ名 = vibe-base のプロダクトディレクトリ名（`ai-concierge`, `foodee`, `aiueo` 等）
- プロダクト横断は `vibe-base` をタグにする
- Claude Code から NotebookLM に指示を送るときは、毎回 `claudecode` + フォルダ名を含める

### 本文

```
## 問い
（何を調べたか / どんな query を投げたか）

## 回答
（NotebookLM の回答）
```

2項目のみ。判断欄は設けない。

## ツール使用ルール

### context 圧迫対策

ツールの返り値は全て Claude Code の context に載る。これが最大のコスト要因。

| 操作 | context コスト | 対策 |
|------|-------------|------|
| `notebook_list` | 件数 x 数百トークン | `max_results: 10` を既定とする |
| `notebook_query` | 数千トークン | 許容範囲。ただし質問は具体的に |
| `source_get_content` | 数千〜数万トークン | **原則禁止** |
| ソース追加 / studio_create | 指示文のみ | 低コスト |

### query 結果の保存

`notebook_query` の回答は NotebookLM 側に保存されない（その場で消える）。以下を必ず実行する:

1. query の回答を `note` ツールで NotebookLM 側にノートとして保存する
2. 保存完了をマスターに報告する
3. 保存先（どのノートブックのどのノート）を明示する

### 既定パラメータ

- `notebook_list`: `max_results: 10`（全件取得が必要な場合のみ上限を上げる）

## 禁止事項

- `source_get_content` でソース全文を Claude Code に取り込むこと（原則禁止。やむを得ない場合はマスターに事前確認）
- 複数ソースを Claude Code 側で順に読み比べること（NotebookLM の query で横断検索させる）
- `notebook_list` や `source_list` を毎ターン呼び出すこと

## 調査手段の3分岐

調査手段は対象で決まる。共存させない。

| 対象 | ツール | 出力先 |
|------|--------|--------|
| 今すぐ必要な事実1つ（エラー、API仕様、最新ニュース） | `web_search` | その場で使い切り |
| 市場・競合・価格・ユーザー（外部データ） | NotebookLM | NotebookLM のノートに保存 |
| 技術検証・コード読解・実装方針 | `/deep-research` | `docs/research-bank/`（直行） |

### 作業内容別ツール対応表

| 内容 | ツール |
|------|--------|
| 客がいるか・増えてるか・届くか（市場検証） | NotebookLM |
| ライバルを調べて比べる | NotebookLM |
| 競合が何を使ってるか | NotebookLM |
| 各カテゴリで候補を2つ以上出す | NotebookLM |
| LP競合分析テーブル | NotebookLM |
| 勝てる土俵を見つける | `/deep-research` |
| フィルタ評価・リスク診断 | `/deep-research` |
| 技術選定・実装・検証全般 | `/deep-research` |
| 外部サービスの最新情報確認 | `web_search` |

### research-bank との関係

- NotebookLM が担当する工程（市場・競合・価格・ユーザー）の成果物は NotebookLM 側のノートに蓄積する
- `/deep-research`（技術検証・コード読解・実装方針）の成果物は `docs/research-bank/` に直行保存する
- 二重記録はしない

---

v1.0 | 2026-04-16 Session 178
