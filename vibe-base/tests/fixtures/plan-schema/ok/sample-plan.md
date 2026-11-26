# Sample Plan (OK fixture)

## Context
これは plan-schema-gate / ac-keyword-gate の OK 系 fixture です。

## 上位 plan からの constraint 変更
N/A (新規 plan)

## 影響範囲
- 修正: `tests/fixtures/plan-schema/ok/sample-plan.md`

## 実装ステップ

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 1 | fixture 配置 | orchestrator | Step 2 で検証 |
| 2 | 単体起動で OK | verify-agent | EXIT 0 |

## リスク

| リスク | 検知 | 対応 |
|--------|------|------|
| fixture 表記揺れ | grep -c で件数照合 | テンプレ修正 |

## テスト方針
1. plan-schema-gate.mjs に本 fixture を流し EXIT 0 を確認
2. ac-keyword-gate.mjs に本 fixture を流し EXIT 0 を確認

## 受け入れ基準

WHEN plan-schema-gate に本 fixture を流す THE SYSTEM SHALL exit 0 で通過すること

1. plan-schema-gate.mjs: 単体起動で `EXIT 0`
2. ac-keyword-gate.mjs: 単体起動で `EXIT 0`
3. Glob: `tests/fixtures/plan-schema/ok/sample-plan.md` → 1 件存在
4. プレースホルダ残存: `grep -c` で 0 件
5. H2 構造: 全 7 セクション存在 (`test -f` で本 fixture 自体を確認)

## 機械検証可能条件
- `Glob: tests/fixtures/plan-schema/ok/sample-plan.md` → 1 件
- ac-keyword-gate.mjs stdin に本 fixture path を渡し `EXIT 0`

## 承認後モード
acceptEdits (理由: fixture のみ修正、protected paths 編集なし)
