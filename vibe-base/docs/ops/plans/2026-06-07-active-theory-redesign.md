# 2026-06-07-active-theory-redesign

小齊平 恒平さんのホームページに、Active Theory風の滑らかな 3D 演出と高品質なアニメーションを導入する実装計画書。

## 上位 plan からの constraint 変更
N/A

## 影響範囲
`products/homepage/index.html` [MODIFY]

## サブエージェント割り振り方針
- **調査**: `explore-agent` (haiku) を用いて、既存の `index.html` 内の `hero-canvas` やローカルの IntersectionObserver スクリプトの位置を確認。
- **実装**: `implement-agent` (sonnet) を用いて、Three.js / GSAP 導入と 3D 背景、およびアニメーション改修を実装。
- **検証**: `verify-agent` (haiku) を用いて、受入基準のコマンド実行とローカル検証（FPS/構文検査）を実施。

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前確認およびバックアップ | orchestrator | opus | — | `cp products/homepage/index.html products/homepage/index.html.bak2` でバックアップ取得 |
| 1 | Three.js および GSAP の CDN 導入 | implement-agent | sonnet | @products/homepage/index.html | `<head>` 内へのスクリプト読み込み設定 |
| 2 | WebGL 3D背景（流体パーティクル）の実装 | implement-agent | sonnet | @products/homepage/index.html | `#hero-canvas` を有効化し、インディゴ/パープルの光彩を放つ 3D 粒子グリッドを作成 |
| 3 | インタラクション・スクロール連動の実装 | implement-agent | sonnet | @products/homepage/index.html | マウス移動、およびページのスクロール量に連動して 3D パーティクルがなめらかに波打つロジックを実装 |
| 4 | GSAP / ScrollTrigger による慣性アニメーションの適用 | implement-agent | sonnet | @products/homepage/index.html | 既存の reveal トランジションを GSAP の慣性イージングに差し替え、スポットライト追従を quickTo で滑らかに最適化 |
| 5 | 構文検査とローカル表示テスト | verify-agent | haiku | @products/homepage/index.html | `node scripts/check-hooks-syntax.mjs` およびローカルブラウザ確認での崩れなし、カクつきなし確認 |
| 6 | 本番デプロイと動作確認 | orchestrator | opus | — | `vercel deploy --prod`（homepageディレクトリ内）で本番公開し、URLで確認 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| 3D レンダリングによるモバイル端末の負荷上昇・カクつき | DevTools で FPS が 30 以下に低下する | 原則 2: パーティクルの描画数を減らし（例: 20000→8000）、pixelRatio 上限を 2 に制限する |
| Three.js ロード失敗時の画面真っ暗化 | ブラウザのコンソールに `THREE is not defined` などのエラー | 原則 3: CDNのフォールバックタグを設置するか、エラー検知時に Canvas を非表示にして元のCSS背景で綺麗にフォールバックさせる |

## テスト方針
1. `node scripts/check-hooks-syntax.mjs` が成功すること
2. `bash scripts/check-in-verify.sh` が成功すること
3. `products/homepage/index.html` をブラウザで開き、スクロールおよびマウスホバーによって 3D 背景が 60FPS で滑らかに動き、テキストリビールが極めてスムーズにイージング動作すること

## 受け入れ基準
- **EARS**:
  - `WHEN the index.html is loaded in a browser THE SYSTEM SHALL initialize a Three.js particle canvas in the background and apply smooth GSAP animations on scrolling and mouse hover without dropping frames.`
- **機械検証**:
  - `Glob: products/homepage/index.html → 1 file`
  - `grep -q "cdnjs.cloudflare.com/ajax/libs/three.js" products/homepage/index.html || grep -q "three.webgpu.js" products/homepage/index.html → 1 match以上`
  - `grep -q "gsap" products/homepage/index.html → 1 match以上`
  - `node scripts/check-hooks-syntax.mjs → EXIT 0`

## 承認後モード
`acceptEdits`（理由: フロントエンドのビジュアル改修のみであり、DBやサーバーサイドへの影響がないため）
