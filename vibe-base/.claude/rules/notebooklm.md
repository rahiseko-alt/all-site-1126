---
description: NotebookLM MCP使用時のルール
globs:
  - "docs/ops/notebooklm-mcp-sop.md"
---

## ノート記入ルール
- タイトル: `YYYY-MM-DD_claudecode_フォルダ名_内容15字以内`
- 本文: 「問い」+「回答」の2項目のみ

## context圧迫防止
- `notebook_list` は `max_results: 10` を既定とする
- `source_get_content` は原則禁止（マスター事前確認必須）
- query結果は `note` ツールでNotebookLM側に保存→保存完了報告→保存先明示

## 判断フロー
- 単発の事実確認 → web_search
- 複数ソース横断・蓄積必要 → NotebookLM
- 既存資産あり → 流用先行（NotebookLM 起動前に Read で既存資料確認）

詳細: docs/ops/notebooklm-mcp-sop.md
