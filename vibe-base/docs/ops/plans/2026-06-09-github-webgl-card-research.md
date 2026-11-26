# GitHub WebGL Card Distortion Research

## 上位 plan からの constraint 変更
N/A

## 影響範囲
- 新規作成: [2026-06-09-github-webgl-card-research.md](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/docs/ops/plans/2026-06-09-github-webgl-card-research.md)
- その他プロダクトコード変更はなし (調査・フェッチのみ)

## サブエージェント割り振り方針
- `research` サブエージェントを使用し、GitHub上の「CPU環境で実装可能（軽量）なWebGL/シェーダーによるカードの歪み・変形効果」のコード、および「トップ技術者によるCPU環境でのWebGL最適化ノウハウ（ベストプラクティス）」を検索・完全フェッチします。

## 実装ステップ
| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | sonnet | — | `test -f` で plan ファイル確認 |
| 1 | `research` サブエージェントの起動とGitHubリサーチ（コード＋ノウハウ） | research | sonnet | @docs/ops/plans/2026-06-09-github-webgl-card-research.md | 検索結果ログ確認（要約禁止） |
| 2 | CPU対応コードおよびトップ技術者の最適化ノウハウのフェッチ | research | sonnet | @docs/ops/plans/2026-06-09-github-webgl-card-research.md | 取得内容の完全性確認（要約禁止） |
| 3 | 取得したコードおよびドキュメント（ノウハウ）をそのままファイルとして保存 | research | sonnet | @docs/ops/plans/2026-06-09-github-webgl-card-research.md | `agent-ag/webgl-card-distortion-research/` 配下での保存確認（要約禁止） |
| 4 | 結果の報告（コードとノウハウの全文出力） | orchestrator | sonnet | — | 出力および報告に要約が含まれていないことの確認 |

## リスク・トラブル想定とリカバリープラン
| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| GitHub検索APIの制限または結果不足 | 検索結果が0件またはエラー | 別のキーワード（"cpu friendly webgl distortion", "webgl low end device optimization" など）で再検索 |
| コードやノウハウが途中で切れる | 取得されたファイルの不完全さ | `read_url_content` を用い、該当ファイルを直接末尾まで読み込み直す |

## テスト方針
1. 取得したコードおよびノウハウのテキストが要約・省略されておらず、完全な状態で保存されていることを手動で確認する。

## 受け入れ基準
- GitHubで「CPU環境でも軽量・高速に動作するカードのWebGL歪み表現」のコード（正解）が特定され、フェッチされていること。
- トップ技術者が低スペック/CPU環境でWebGLを滑らかに動かすための「最適化ノウハウ・知見」が特定され、フェッチされていること。
- 該当のコードおよびノウハウの全文が一切要約・省略されずに `agent-ag/` 配下に保存され、出力されること。
- 処理時および出力時に要約が行われていないこと。

## 承認後モード
acceptEdits（理由: 調査のみであり、プロダクトコードへの副作用がないため）
