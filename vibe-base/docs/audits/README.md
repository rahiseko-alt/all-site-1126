# docs/audits/ — 監査履歴ディレクトリ

## 目的

このディレクトリは vibe-base 環境に対する各種監査レポートの蓄積場所です。
監査は **独立 subagent**（または独立 worktree）で実行され、結果のみここに格納します。

## 命名規約

```
{audit-type}-YYYY-MM-DD.{html,pdf,md}
```

- `audit-type`: 監査種別（kebab-case）
- `YYYY-MM-DD`: 監査実施日
- 拡張子: 主成果物（HTML 推奨・PDF 併置可）

### 監査種別の例

| audit-type | 内容 | 想定発火経路 |
|---|---|---|
| `ai-maturity` | AI 開発成熟度（環境全体） | 手動 subagent dispatch（将来 skill 化） |
| `security` | セキュリティ診断 | `/security-review` skill |
| `code-review` | コード品質レビュー | `/code-review` skill |
| `dependency` | 依存関係マップ | `scripts/check-rules-coverage.sh` 派生 |

## 蓄積物 (2026-05-19 時点)

| ファイル | 内容 | スコア |
|---|---|---|
| `ai-maturity-2026-05-19.html` | 初回 AI 成熟度監査（Session 297） | 72/100 (L4) |
| `ai-maturity-2026-05-19.pdf` | 同 PDF 版 | — |

## 運用ルール

1. **独立性**: 監査は司令塔エージェント自身ではなく独立 subagent / 独立 worktree で実行。自己監査禁止（自己の盲点を自己で発見できない）
2. **証拠主義**: 全項目に実ファイル・実コマンド出力・行番号の証拠を添付。推測禁止
3. **経時比較**: 同 audit-type の過去レポートと比較可能なフォーマット維持
4. **書き換え禁止**: 過去レポートは原則 immutable（誤記訂正は新版発行で対応）
5. **格納のみ**: このディレクトリは結果格納専用。監査 skill 本体は `~/.claude/skills/` 配下

## 関連

- 監査の業界標準論拠 → `docs/structure-dependency-map-2026-05-19.html` (Session 297)
- 構造構想 → `docs/structure-vision-2026-05-19.html` (Session 297)
