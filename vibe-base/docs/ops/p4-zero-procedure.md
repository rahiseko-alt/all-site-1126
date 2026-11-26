# 運用準備チェック手順（運用Runbook整備）

> プロダクトエージェントが「運用 Runbook 整備」を完了するための手順書。
> 共通憲法 v5.9 + 自己検証 SOP v5.8 + risk-diagnosis-sop v3.0（D 観点）の統合運用。

## §1. 運用準備チェックの位置づけ

運用準備チェックは「運用準備が整っているか」を機械的に検証するレビュータスク（種別=レビュー）。

**実体ファイル**（runbook.md / cost-config.md / backup-config.md）が存在しなければ ✅ 化禁止。「ルールを書いたが効いていない」状態（構造改革 T16 で発見した D4 全プロダクト不在）を構造的に検知するバックストップ。

## §2. 必須実体ファイル

| ファイル | 条件 | 対応するテンプレ |
|---------|------|----------------|
| `products/{product}/runbook.md` | **全プロダクト必須** | `docs/standards/templates/runbook-template.md` |
| `products/{product}/cost-config.md` | 有料 SaaS 利用あり | `docs/standards/templates/cost-config-template.md` |
| `products/{product}/backup-config.md` | DB/データ永続化あり | `docs/standards/templates/backup-config-template.md` |

## §3. 着手手順（プロダクトエージェント向け）

1. **テンプレートをコピー**:
   ```bash
   cp docs/standards/templates/runbook-template.md products/{product}/runbook.md
   # 必要に応じて cost-config / backup-config も
   ```
2. **プロダクト固有情報を埋める**（`[記入]` 箇所を全件）
3. **D 観点 4 件をチェック**:
   - D1（バックアップ）: `backup-config.md` 存在 + リストア検証済
   - D2（冪等性）: `idempotency-checklist.md` クリア済
   - D3（ライブラリ実在性）: `library-verification-checklist.md` クリア済
   - D4（runbook）: `runbook.md` 存在 + プロダクト固有情報記入済
4. **マスター承認依頼**: 「運用準備チェック完了、確認をお願いします」
5. **承認後**: `runbook.md` 冒頭に「運用準備チェック完了: runbook.md / [対応ファイル] 存在 + 各項目埋め済 + マスター承認(日付)」と記入

## §4. 検証コマンド（自己検証 SOP §D-3 準拠）

```bash
test -f products/{product}/runbook.md && echo "RUNBOOK_OK"
# DB ありのプロダクトのみ
test -f products/{product}/backup-config.md && echo "BACKUP_OK"
# 有料 SaaS ありのプロダクトのみ
test -f products/{product}/cost-config.md && echo "COST_OK"
```

## §5. 失敗パターン（過去事例）

- **K2「書いてある≠効いている」**（自己検証 SOP §3）: 構造改革 T16 で全 8 プロダクト D4 runbook 不在が露呈。SOP（incident-response-sop.md）は書かれていたが実体が無く、「条文 OK・実体 NG」状態だった
- **再発防止**: 本手順 §4 の `test -f` で実体存在を機械検証してからマスター承認依頼

## §6. 関連 SOP

- `docs/ops/incident-response-sop.md`（表 A）— 障害対応詳細
- `docs/ops/backup-strategy-sop.md`（表 A）— バックアップ詳細
- `docs/ops/cost-budget-sop.md`（表 A）— コスト・予算詳細
- `docs/ops/risk-diagnosis-sop.md` v3.0 — D 観点定義
- `docs/ops/risk-registry.md` — 横断リスク台帳（#9-12 が D 観点関連）
- `docs/ops/self-verification-sop.md` — 自己検証 SOP（§D 完了判定前で実体存在確認）

---

v1.0 | 2026-04-28 | Session 225 G5 / Opus 4.7
