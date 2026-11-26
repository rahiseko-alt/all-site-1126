> ⚠️ 要点は `.claude/rules/structural-ops.md` で自動注入される。ここは詳細版。

# フォルダライフサイクルSOP v1.2

> フォルダ構造の変更（開始・増設・移動・廃止）時に必ず本SOPに従うこと。

## 基本原則

- **1プロダクト = 1ディレクトリ。** 複数部署がある場合は `products/{product}/{dept}/` 構成
- **自治憲法（CLAUDE.md）はプロダクト直下に配置。** 全部署をカバーする
- **パス変更後は横断grep必須。** 旧パスへの参照が残っていないことを確認する
- **サブディレクトリ構成・指示書命名は任意。** プロダクト性質に応じて選択する（v1.2 撤廃事項）

## 標準構成（最小）

```
products/
├── {product}/
│   ├── CLAUDE.md        ← 自治憲法（プロダクト全体をカバー）
│   ├── runbook.md
│   ├── cost-config.md
│   ├── backup-config.md
│   ├── handoff.md       ← 指示書（必要に応じて作成）
│   ├── app/             ← 実装（任意）
│   ├── design/          ← UI 設計（任意）
│   ├── lp/              ← LP（任意）
│   └── video/           ← 動画等（任意）
```

サブディレクトリ（app/, design/, lp/, video/ 等）と指示書（handoff.md）は **プロダクト性質に応じて任意で作成** する。公開 Web SaaS なら app/ + design/ 分離が有効、個人ローカル CLI ツールなら scripts/ や本体ファイル直下配置が有効、というように性質適合を優先する。

---

## シナリオ1: 新規プロダクト開始

1. `products/{product}/` ディレクトリを作成
2. プロダクト性質に応じて必要なサブディレクトリ（app/, design/, lp/, video/, scripts/ 等）を作成
3. `CLAUDE.md`（自治憲法）をプロダクト直下に作成。§0 に構成を記載
4. 標準テンプレ転記（`runbook.md` / `cost-config.md` / `backup-config.md`）
5. 必要に応じて `handoff.md`（指示書）を作成
6. 共通憲法（ルート `CLAUDE.md`）に変更が必要なら更新
7. propagate-hooks で `.claude/settings.json` 配布
8. **`docs/md-inventory.md` にプロダクトスコープセクション + 全配置ファイルのエントリを登録**（全既存プロダクト遵守の構造的義務。漏れると新ファイルが索引に出ず存在感が失われる）
9. コミット

## シナリオ2: 部署増設

1. `products/{product}/{new-dept}/` ディレクトリを作成
2. 自治憲法 §0 の構成表に新部署を追加
3. 必要に応じて自治憲法 §2 にインフラ情報を追記
4. コミット

## シナリオ3: 移動・リネーム

1. **進行中の別エージェント作業がないことを確認**（パスが壊れるため）
2. `git mv` でディレクトリを移動（git履歴保持のため）
3. 横断grepで旧パスへの参照を全て検出・更新:
   - 自治憲法（CLAUDE.md）内のパス
   - 共通憲法・MEMORY.md内のパス
   - SOP・ドキュメント内のパス
   - `.claude/` 配下の設定ファイル
   - memory.md（過去記録のため更新不要）
4. Vercel設定を確認:
   - `.vercel/project.json` が移動先に存在するか
   - Vercel Dashboard の Root Directory 設定が新パスと一致するか
   - `vercel link` で再リンクが必要か確認
5. `node_modules/` が残っている場合は移動先で `npm install` を再実行
6. コミット

## シナリオ4: 廃止・撤退

1. `archive/{product}/` にディレクトリを移動（`git mv`）
2. 自治憲法を `archive/` 内に含めて移動
3. 共通憲法・MEMORY.md・SOP索引から参照を除去
4. Vercelプロジェクトを削除（Dashboard から）
5. memory.mdに撤退理由を記録
6. コミット

---

## チェックリスト（移動・廃止時）

- [ ] 別エージェントが対象ディレクトリで作業中でないか確認
- [ ] `git mv` を使用（手動コピー+削除はgit履歴が切れるため禁止）
- [ ] `grep -r "旧パス" --include="*.md" --include="*.json"` で残留参照ゼロ確認
- [ ] Vercel Root Directory 設定の更新
- [ ] `npm install` の再実行（node_modules未追跡のため）

---
v1.2.1 | 2026-05-12 | Session 276 同セッション内訂正: シナリオ 1 に「md-inventory.md 登録」ステップ 8 を追加（既存全プロダクト遵守の暗黙ルールが v1.2 改訂時に明文化漏れ・ymm-shorts 登録漏れで発覚）
v1.2 | 2026-05-12 | Session 276 マスター指示で 3 名体制デフォルト撤廃。サブディレクトリ（app/, design/）と指示書命名（handoff-a/d.md）を必須要件から外し、プロダクト性質に応じた任意配置に変更。既存プロダクトの app/ design/ 構造はそのまま維持（一括移行禁止）
v1.1 | 2026-03-28 | 3名体制デフォルト化: シナリオ1にdesign/+handoff作成手順追加（v1.2 で撤廃）
v1.0 | 2026-03-16 | LP虚偽根本原因分析に基づくフォルダ構造改革に伴い新設
