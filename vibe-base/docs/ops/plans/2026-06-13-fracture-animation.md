## 上位 plan からの constraint 変更
N/A

## 影響範囲
- 新規: `agent-ag/joseph-san-reproduction/js/fracture.js`
- 新規: `agent-ag/joseph-san-reproduction/css/fracture.css`
(Glob 結果: 2本中0本存在)

## サブエージェント割り振り方針
- implement-agent: `js/fracture.js` および `css/fracture.css` の作成を担当。
- verify-agent: 作成されたファイルの存在および文法チェックを担当。

## 実装ステップ
| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `test -f` で全 path 確認 |
| 1 | `css/fracture.css` 新規作成 | implement-agent | sonnet | — | Step 3 で検証 |
| 2 | `js/fracture.js` 新規作成 | implement-agent | sonnet | — | Step 3 で検証 |
| 3 | テスト実行・受け入れ基準照合 | verify-agent | haiku | @`docs/ops/plans/2026-06-13-fracture-animation.md` | `test -f` / EXIT 0 |
| 4 | 最終 Glob 照合 | orchestrator | opus | — | 全 path 存在確認 |

## リスク・トラブル想定とリカバリープラン
| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| worker の hallucination | 出力が受入基準と不一致 | 原則 2: 別 prompt で agent 再起動 |

## テスト方針
1. ファイル存在の確認
2. JS の文法チェック (`node --check`)

## 受け入れ基準
WHEN implementation is done THE SYSTEM SHALL have `fracture.js` and `fracture.css` in place.
- [ ] `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\agent-ag\joseph-san-reproduction\js\fracture.js` -> True
- [ ] `Test-Path C:\Users\user\Desktop\ClaudeCode\vibe-base\agent-ag\joseph-san-reproduction\css\fracture.css` -> True
- [ ] `node --check C:\Users\user\Desktop\ClaudeCode\vibe-base\agent-ag\joseph-san-reproduction\js\fracture.js` -> EXIT 0

## 承認後モード
acceptEdits（理由: 全ステップ implement-agent 完結、protected paths 編集なし、新規ファイルのみで既存への影響なし）
