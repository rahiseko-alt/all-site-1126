# Transcript 保持方針（E-4・2026-07-10 策定）

## 実測事実（2026-07-10・plan `vibe-base-e-group-remediation.md` E-4）

- `~/.claude/projects/` 配下の `subagents` ディレクトリは **175 件**（起票時 172 件から増加・セッション進行による自然増）。
- **すべて深さ 3**（`<sessionId>/subagents/agent-*.jsonl` の 1 階層構造）。
- `subagents/` の中に `subagents/` がネストする構造は **0 件**（`find` による全数走査で確認）。
- 結論: `scripts/token-audit/lib.mjs` の `listAllUsageFiles()`（1 階層のみの非再帰走査）は現状の実ディレクトリ構造と一致しており、**無改修**とする。任意深さの再帰対応は不要な複雑化であり実装しない。

## 保持方針

- **保持期間**: 当面は無期限保持とする。transcript は監査証跡（`検証パネル` の反証根拠・`failures.md` の再発防止調査の一次情報）として使われており、自動削除の仕組みは設けない。ディスク容量の逼迫が実際に観測された時点で、改めて具体的な保持期間を検討する。
- **アーカイブ先**: 現状 `~/.claude/projects/` 配下がそのままアーカイブ先を兼ねる。外部ストレージへの退避が必要になった場合は別途 plan を起票する。
- **削除実行者**: **本 plan（E-4）では 1 件も削除しない。** 将来 transcript の削除を実行する場合は、必ずマスター承認を得た別 plan で行う（監査証跡の喪失を避けるため、AI 側の自律判断での削除は禁止）。

## 関連

- ネスト構造の実測ロジック: `find ~/.claude/projects -type d -name subagents -exec sh -c 'find "$1" -mindepth 1 -type d -name subagents' _ {} \;`
- 万一ネストが 1 件でも観測された場合、実行者は改修に踏み込まず作業を停止しマスターへ報告すること（前提が変わったことを意味するため）。
