---
description: 防御3段モデル（Deny → Ask → Allow）に基づく権限管理ルール
---
# permission-defense — ポインタ

⚠️ **権限設定変更・新規 hook 配備前に canonical 本体を必ず Read せよ。**

詳細仕様（全文）→ `docs/rules/permission-defense-canonical.md`

## 要点（3 行）
- 評価順序: Deny（unrecoverable）→ Ask（任意コード実行ゲート）→ Allow（自動）
- Deny 正規対象: .env / .git / git push --force / rm -rf / curl / npm publish 等
- destructive command は hook（pre-bash-destructive.mjs）で検知
