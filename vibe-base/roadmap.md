# vibe-base roadmap（H2大義 ＋ マイルストーン）

> **現在地は `roadmap-state.json`**（AI が編集してよいのは status フィールドのみ）。
> **軌跡・履歴はここに書くな** — `git log` が既に持つ。
> H1大義（vibe-base 全体の開発が常に最良であり続けること）は継続型でロードマップを持たない。正本は `CLAUDE.md` §0。

## H2大義

**PC が起動していれば、スマホから web-platform を開発できる。**

- **種別:** 完了
- **完了条件:** スマホ実機（Claude アプリ / claude.ai）から Remote Control で起動中 PC の web-platform セッションに接続し、コードを編集・確認できること。器を置いても・一度動いても完了しない（実機で確認・撮れるまで完了としない）
- **手段:** Claude Code の **Remote Control**（公式・研究プレビュー）。ローカルで `claude remote-control` を起動し、スマホの Claude アプリ or claude.ai/code から同一セッションへ接続する。ローカルの全設定・MCP・hook（＝vibe-base 統治）が効いたまま使える。クラウド経路（claude.ai/code の VM clone）は統治が消えるため採らない

## マイルストーン（順序固定）

| id | マイルストーン | 依存 |
|---|---|---|
| 1 | **Remote Control 疎通** — ローカル PC で `claude remote-control` を起動し、スマホ実機（Claude アプリ）から同一セッションへ接続できることを確認 | — |
| 2 | **スマホから web-platform を編集** — 接続セッションで実際にコードを編集し、build/typecheck の反映を確認 | 1 |
| 3 | **スマホからプレビュー確認** — web-platform の画面（Next.js dev server）をスマホから見れる経路を確立（localhost が見えるか実機検証・不可なら別経路） | 2 |

## 完走判定（マイルストーンを `done` にする前に必ず実施）

1. **`backlog.json` を読む**（後回しリストを読むのは**この時だけ**。それ以外では読まない＝毎回 context に乗せない）
2. 各 open 項目が**現 H2大義をブロックするか**を再判定する。ブロックするなら次マイルストーンより優先し、しないなら open のまま残す
3. `roadmap-state.json` の当該 status を `done` に更新する（**編集してよいのは status のみ**）
