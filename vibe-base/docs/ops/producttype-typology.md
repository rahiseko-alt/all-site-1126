# 5 種別 productType 分類定義

> 起源: マスター 4 原則（1 本道 + 全マスト + 漏れゼロ + SKIP 可）に基づくプロダクト種別分類
> マスター承認: 2026-05-16 Session 287
> Session 295 改訂: 22 項目チェック表撤去に伴い skip 早見表セクション削除。種別定義のみ残置。
>
> 用途: vibe-base 内 product を 5 種別に分類し、各種別の典型的な特性・記述方針を整理する。各 product の `productType` フィールドは CLAUDE.md §0 メタで宣言する。

## 5 種別の定義

| 種別 | 説明 | 該当プロダクト例 |
|------|------|----------------|
| **app** | Web App（収益化前提・外部利用者あり）| ai-concierge / aiueo / foodee / kobaraku / review-analysis |
| **content-ops** | 教材コンテンツ運用（外部利用者あり）| learning-suite-kanji |
| **classroom-tool** | 教室授業ツール（マスター + 教室生徒）| coach |
| **automation-script** | 自動化スクリプト（マスター本人のみ）| ymm-shorts |
| **static-site** | 静的サイト（外部公開・低運用負荷）| homepage |

各 product の `productType` フィールドは CLAUDE.md §0 メタで宣言する。

---

## 種別別の典型的な特性

### app
- 外部利用者・収益化前提
- 個人情報・課金・認証・第三者 API 連携あり
- 監視・ログ・アラート整備必須
- 競合・差別化分析必須

### content-ops（learning-suite-kanji 等）
- 教材コンテンツ運用（外部利用者あり）
- 受講数・継続率等の数値目標必須
- 教材構造図の視覚化必須

### classroom-tool（coach 等）
- マスター + 教室生徒利用
- スライド構造・授業フロー視覚化必須
- 生徒データ扱う場合は個人情報配慮、マスター本人デモ用なら最小限

### automation-script（ymm-shorts 等）
- マスター本人のみ利用（個人ツール）
- 収益化しない・第三者公開しない場合は記述簡略化可
- 競合分析・個人情報配慮は最小限で可

### static-site（homepage 等）
- 外部公開・低運用負荷
- PV / 直帰率程度の最低限の数値目標
- Cloudflare 無料枠等で監視最小限可

---

## 関連資料

- `products/{product}/CLAUDE.md` §0 — productType フィールドの宣言先
- `.claude/rules/product-development.md` — rationale 記述と思考の視点 6 軸（Session 294）
