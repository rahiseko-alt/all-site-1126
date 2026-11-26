# Animejs Layout ID Attribute アニメーション再現

## 上位 plan からの constraint 変更

| 上位 plan | 本 plan での扱い | 承認証跡 |
| --- | --- | --- |
| N/A | 新規 scope: Anime.js v4 を用いた Layout ID トグルアニメーションの構築 | ExitPlanMode 時に明示 |

## 影響範囲

- `docs/ops/plans/2026-06-14-animejs-layout-id.md` (新規)
- `portfolio/animejs-layout-id-attribute/` (新規ディレクトリ)
- `docs/html-toranomaki/animejs-layout-id-attribute/` (新規ディレクトリ)

Glob結果: 対象ディレクトリは全て新規（0件確認済み）。

## サブエージェント割り振り方針

- `implement-agent` (sonnet): 実装全般。ES Modules での Anime.js v4 import と、ID属性付与・Vibe風プレミアムUIへのスタイリングを担当。
- `verify-agent` (haiku): 構文チェックおよび E2E テスト。

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -f` で全 path 不在確認 |
| 1 | server.mjs の作成 (Port 3003) | implement-agent | sonnet | @docs/ops/plans/2026-06-14-animejs-layout-id.md | Step 6 で検証 |
| 2 | HTMLの移植 (ID付与) | implement-agent | sonnet | `source_placeholder.txt` | Step 6 で検証 |
| 3 | CSSの構築 (プレミアム化) | implement-agent | sonnet | `source_placeholder.txt` | Step 6 で検証 |
| 4 | JSの移植 (ES Modules) | implement-agent | sonnet | `source_placeholder.txt` | Step 6 で検証 |
| 5 | concept.md (虎の巻) の作成 | implement-agent | sonnet | — | Step 6 で検証 |
| 6 | テスト実行・受け入れ基準照合 | verify-agent | haiku | @docs/ops/plans/2026-06-14-animejs-layout-id.md | Glob 結果 / EXIT 0 |
| 7 | 最終 Glob 照合 | orchestrator | opus | — | 全 path 存在確認 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| ES Module での CORS/CORS エラー | ブラウザコンソールエラー | 原則1: `<script type="module" src="js/app.js">` と設定し、`server.mjs` で正しく配信する |
| CSS ID が紐づかない | アニメーションしない / 要素が2つとも表示される | 原則1: `#layout-layout-id-attribute` を HTML のラッパーに必ず付与する |

## テスト方針

1. `server.mjs` を起動（Port: 3003）。
2. ブラウザでアクセスし、Item A が初期状態ではコンテナAにのみ存在すること。
3. ボタンをクリックすると、Item A がコンテナAからコンテナBへ「移動」するアニメーションが発生すること（Anime.js FLIP アニメーション）。

## 受け入れ基準

- [ ] `Glob: portfolio/animejs-layout-id-attribute/index.html → 1 件存在`
- [ ] `Glob: docs/html-toranomaki/animejs-layout-id-attribute/concept.md → 1 件存在`
- [ ] ブラウザ検証: エラーなし、Toggleアニメーションがシームレスに発生すること。

## 承認後モード

acceptEdits
