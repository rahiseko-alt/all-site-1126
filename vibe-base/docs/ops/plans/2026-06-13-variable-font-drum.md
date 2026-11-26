# 完全再現: Pete Barr MWKgmYW (Variable Font Drum)

## 上位 plan からの constraint 変更

| 上位 plan | 本 plan での扱い | 承認証跡 |
| --- | --- | --- |
| N/A | 新規 scope: CodePen MWKgmYW の完全再現 | ExitPlanMode 時に明示 |

## 影響範囲

- `docs/ops/plans/2026-06-13-variable-font-drum.md` (新規)
- `agent-ag/variable-font-drum-demo/` (新規ディレクトリ)
- `agent-ag/variable-font-drum-demo/index.html` (新規)
- `agent-ag/variable-font-drum-demo/css/style.css` (新規)
- `agent-ag/variable-font-drum-demo/js/app.js` (新規)
- `agent-ag/variable-font-drum-demo/server.mjs` (新規)

Glob結果: 0件存在確認済み。

## サブエージェント割り振り方針

- 全て `implement-agent` (sonnet) に委譲。
- 注入ファイル: 本 plan (`@docs/ops/plans/2026-06-13-variable-font-drum.md`) と抽出した CodePen ソースコード（必要に応じて）。

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -f` で全 path 不在確認 |
| 1 | server.mjs の作成 | implement-agent | sonnet | @docs/ops/plans/2026-06-13-variable-font-drum.md | Step 5 で検証 |
| 2 | HTML/CSS の完全移植 (GSAP CDN含む) | implement-agent | sonnet | @docs/ops/plans/2026-06-13-variable-font-drum.md | Step 5 で検証 |
| 3 | JS の完全移植 (ScrollTrigger 対応) | implement-agent | sonnet | @docs/ops/plans/2026-06-13-variable-font-drum.md | Step 5 で検証 |
| 4 | ローカル実行とデバッグ (100点達成確認) | implement-agent | sonnet | @docs/ops/plans/2026-06-13-variable-font-drum.md | Step 5 で検証 |
| 5 | テスト実行・受け入れ基準照合 | verify-agent | haiku | @docs/ops/plans/2026-06-13-variable-font-drum.md | Glob 結果 / EXIT 0 |
| 6 | 最終 Glob 照合 | orchestrator | opus | — | 全 path 存在確認 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| フォント CORS エラー | ブラウザコンソールエラー | 原則 2: ローカルにフォントをダウンロードして配信する方式に変更 |
| GSAP 読み込みエラー | `gsap is not defined` | 原則 2: CDNのURLを確認し、必要であればローカルに配置 |

## テスト方針

1. `server.mjs` を起動し、ローカルでデモ画面にアクセスできること。
2. スクロールに連動してテキストが回転し、Variable Font の `font-stretch` や `font-weight` が動的に変化すること。
3. デベロッパーツールでエラー（CORSなど）が一切出ていないこと。

## 受け入れ基準

WHEN /plan command is invoked THE SYSTEM SHALL output a template file matching docs/standards/templates/plan.md

- [ ] `Glob: agent-ag/variable-font-drum-demo/index.html → 1 件存在`
- [ ] `Glob: agent-ag/variable-font-drum-demo/css/style.css → 1 件存在`
- [ ] `Glob: agent-ag/variable-font-drum-demo/js/app.js → 1 件存在`
- [ ] `Glob: agent-ag/variable-font-drum-demo/server.mjs → 1 件存在`
- [ ] ブラウザ検証: エラーなし、スクロールアニメーションが CodePen と 100% 同一の挙動を示すこと。

## 承認後モード

acceptEdits（理由: 全ステップ implement-agent / verify-agent 完結、protected paths 編集なし、新規ファイルのみ）
