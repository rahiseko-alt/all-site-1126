# 2026-06-21 petcaredlx Visual Fix Plan (Fundamental Countermeasure)

## 上位 plan からの constraint 変更
- 【旧方針】SquarespaceのDOMを解体し、スクラッチでCSS GridとVanilla HTMLに「翻訳・再構築」する。
- 【新方針】**Asset Mirroring (完全なミラーリング) 戦略**へ変更。オリジナルサイトのDOM構造を1ビットも改変せず保持し、Squarespaceのコンパイル済みCSS/JSをローカルにダウンロードして参照する手法へ切り替える。

## 影響範囲
- [MODIFY] `agent-ag/petcare-clone-demo/index.html` (オリジナルの `petcare.html` に復元)
- [DELETE] 破綻していた `style.css`, `main.js` の破棄
- [NEW] ローカルへのアセットダウンロード（静的CSS/JSファイル）

## サブエージェント割り振り方針
- 本計画は `orchestrator` が主導する。
- `search_web` やツールの不確実性を排除するため、サブエージェントへの抽象的な「再構築」の委譲を禁止し、確実なアセットのローカル保存を `orchestrator` 自身が行う。

## 実装ステップ
| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `index.html` 存在確認 |
| 1 | `index.html` をオリジナルの完全な状態にロールバック | orchestrator | opus | — | ファイルサイズによる確認 |
| 2 | Squarespaceの外部CSS/JSの特定とローカルダウンロード | orchestrator | opus | — | `curl` 等でのアセット取得確認 |
| 3 | `index.html` のリンク先をローカルアセットへ置換 | orchestrator | opus | — | `grep` 等でのパス置換確認 |

## リスク・トラブル想定とリカバリープラン
| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| LLMの「再構築」によるデザイン崩れ（前回発生事象） | 目視による「0点」のUI破綻 | 原則2: ゴールを変えずルート変更（再構築を諦め、完全なバイナリ・アセットコピー戦略をとる） |

## テスト方針
1. `localhost:3000` にアクセスした際、Squarespace オリジナルと寸分違わぬ「100点満点」のピクセルパーフェクトなUIが表示されること。
2. ネットワークタブで外部のSquarespace CDN (`static1.squarespace.com`) に依存せず、ローカルのCSS/JSが読み込まれていること。

## 受け入れ基準
- WHEN The fix is applied THE SYSTEM SHALL have restored original HTML
  - `test -s agent-ag/petcare-clone-demo/index.html` -> EXIT 0
- WHEN The browser accesses localhost THE SYSTEM SHALL load styles correctly.

## 承認後モード
acceptEdits
