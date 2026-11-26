---
description: API入力検証のzodスキーマ必須化（API実装編集時）
paths:
  - "**/api/**"
  - "**/middleware.ts"
  - "**/middleware.js"
---

## 全 API ルートで zod スキーマ検証必須

- 公開 API / 認証あり API 問わず、`req.body` / `req.query` / `req.params` / `req.headers` の値を **zod スキーマで検証**
- 手動 if 文（`if (!email)` `if (typeof x !== 'string')` 等）の積み重ね禁止 → スキーマ 1 箇所に集約
- 既存ルートで手動チェックがあるものは段階的に zod 化

## スキーマ定義の原則

- API ルートごとにスキーマファイル（または同ファイル内 const）で定義
- 共通スキーマ（email / id / pagination 等）は `lib/validation/` で共有
- 文字列は必ず `min/max` を指定（無制限拒否）

## 実装パターン（safeParse 採用）

```typescript
import { z } from "zod";

const ContactBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  message: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ContactBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "入力に不備があります" }, { status: 400 });
  }
  const { name, email, message } = parsed.data;
  // 以降は parsed.data を使う（型安全）
}
```

## 検証エラー時のレスポンス

- HTTP 400 Bad Request
- ユーザー向けメッセージは抽象化（「入力に不備があります」等、フィールド名を露出しない）
- 詳細は `console.error` か Sentry に送る（本番ユーザーへ返さない）
- `security-runtime.md` の「エラー隠蔽」原則に従う

## 既存手動チェックからの移行

1. 既存のバリデーション if 文を抽出
2. zod スキーマで等価表現を作成（min/max/regex/email/url/enum）
3. テスト（正常系 + 不正系）→ 動作確認後に手動 if 文を削除
4. PR 単位で 1 ルートずつ移行（リスク分散）

## SQL インジェクション・XSS への影響

- zod は型・形式のバリデーションのみ。SQL Injection は ORM（Prisma / Supabase Client）が防御
- HTML タグ混入時の XSS は別途 textContent / dompurify で対応（zod の責任範囲外）

詳細: docs/ops/zod-validation-sop.md
