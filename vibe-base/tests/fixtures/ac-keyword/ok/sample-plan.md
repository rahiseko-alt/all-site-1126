# Sample Plan (ac-keyword OK)

## Context
ac-keyword-gate の OK 系 fixture です。受け入れ基準内に機械検証 keyword が含まれます。

## 影響範囲
- 修正: なし

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | fixture 配置 | orchestrator | EXIT 0 |

## リスク
特になし

## テスト方針
1. ac-keyword-gate.mjs に流すと exit 0 で通過

## 受け入れ基準

WHEN ac-keyword-gate に本 fixture を流す THE SYSTEM SHALL exit 0 で通過すること

1. fixture 存在: `Glob: tests/fixtures/ac-keyword/ok/sample-plan.md` → 1 件
2. 単体起動: ac-keyword-gate stdin 注入で `EXIT 0`
3. keyword 含有: `grep -c "EXIT 0" ファイル` で >= 1

## 機械検証可能条件
- `npm run` 系 keyword なくとも `EXIT 0` / `Glob:` / `grep -c` で十分

## 承認後モード
acceptEdits
