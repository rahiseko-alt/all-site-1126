# 2026-06-21 petcaredlx.com Clone Implementation Plan

## 上位 plan からの constraint 変更
N/A (新規計画)

## 影響範囲
Glob結果: `agent-ag/petcare-clone-demo/*` は0件存在（完全新規作成）。
- [NEW] `agent-ag/petcare-clone-demo/index.html`
- [NEW] `agent-ag/petcare-clone-demo/style.css`
- [NEW] `agent-ag/petcare-clone-demo/main.js`
- [NEW] `agent-ag/petcare-clone-demo/server.mjs`

## サブエージェント割り振り方針
- 本計画は `orchestrator` である私が主導し、コーディングの実務（HTML構造の再構築、CSS Gridの適用、GSAPの実装）は全て `implement-agent` に委譲する。
- 最終的なファイルの存在やエラーのないサーバー起動などの受け入れ基準の機械検証は `verify-agent` に委譲する。
- `implement-agent` には、各ステップで必要なファイルを都度 `@` 指定で注入し、不要なコンテキストによるミスを防ぐ。

## 実装ステップ
| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -d agent-ag/petcare-clone-demo` で不在確認 |
| 1 | プロジェクト基盤の作成（ディレクトリと server.mjs） | implement-agent | sonnet | — | `test -f` でファイル生成確認 |
| 2 | SEO/メタデータ完全移植・HTMLセマンティックツリーの構築 | implement-agent | sonnet | @agent-ag/petcare-clone-demo/index.html | 該当ファイル更新確認 |
| 3 | Fluid Engine互換の24カラムCSS Gridとテーマシステムの完全複製 | implement-agent | sonnet | @agent-ag/petcare-clone-demo/index.html, @agent-ag/petcare-clone-demo/style.css | 該当ファイル更新確認 |
| 4 | GSAP ScrollTriggerアニメーションとJSハンバーガーメニューの実装 | implement-agent | sonnet | @agent-ag/petcare-clone-demo/index.html, @agent-ag/petcare-clone-demo/main.js | 該当ファイル更新確認 |
| 5 | テスト実行・受け入れ基準照合 | verify-agent | haiku | @docs/ops/plans/2026-06-21-petcaredlx-clone.md | Glob 結果 / EXIT 0 |
| 6 | 最終 Glob 照合 | orchestrator | opus | — | 全 path 存在確認 |

## リスク・トラブル想定とリカバリープラン
| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| SquarespaceのDOMネストが深く、HTML再構築時にレイアウトが崩れる | ブラウザでの目視確認・DevToolsの検証 | 原則2: ゴールを変えずルート変更（不要なdivネストを削減し、最小限のDOMツリーで視覚的完全複製を達成するようクリーンアップする） |
| GSAPのScrollTriggerが想定通りに動かない（発火しない等） | プレビュー時のアニメーション不発 | 原則4: GSAPの公式ドキュメントやCodePenをリサーチし最適解を参照する |
| スマホ表示（ブレイクポイント767px以下）でのメニュー開閉が動作しない | プレビュー時のクリック無反応 | 原則3: ルート変更は最もシンプルに（複雑な状態管理を避け、純粋なクラスのtoggleとCSSトランジションで解決する） |

## テスト方針
1. ファイル生成確認 (`test -f` による存在確認)
2. ローカルサーバー起動による動作確認 (ポート3000での200 OK の返却確認)
3. 構文の整合性確認（デバッグログにエラーが出ないか）

## 受け入れ基準
- WHEN The site is built THE SYSTEM SHALL have `agent-ag/petcare-clone-demo/index.html`, `style.css`, `main.js`, `server.mjs`.
  - `test -f agent-ag/petcare-clone-demo/index.html` → EXIT 0
  - `test -f agent-ag/petcare-clone-demo/style.css` → EXIT 0
  - `test -f agent-ag/petcare-clone-demo/main.js` → EXIT 0
  - `test -f agent-ag/petcare-clone-demo/server.mjs` → EXIT 0
- WHEN Start server.mjs THE SYSTEM SHALL start a local preview without fatal errors.
  - `node agent-ag/petcare-clone-demo/server.mjs &` and check curl localhost:3000 -> HTTP 200 (EXIT 0)

## 承認後モード
acceptEdits（理由: 全ステップ implement-agent および verify-agent 完結、protected paths 編集なし、純粋な新規デモディレクトリ内のファイル作成のみのため）
