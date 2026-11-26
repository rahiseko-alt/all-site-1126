> ⚠️ 要点は `.claude/rules/api-validation.md` で自動注入される。ここは詳細版。

# zod 入力検証 SOP — 全 API ルート構造化バリデーション

> **対象:** 全プロダクト（API ルートを持つ場合は必須。セキュリティ診断・セキュリティレビューで参照）
> **起源:** セキュリティ診断 Step 5 F-1「入力バリデーション・サニタイズ △」の解消策
> **関連 SOP:** `rate-limit-sop.md`（API 濫用防止）/ `security-runtime.md`（エラー隠蔽 + IDOR 対策）

---

## §0. 自動注入

このSOPの要点は `.claude/rules/api-validation.md` で `**/api/**`, `**/middleware.ts/js` 編集時に自動注入される。API 実装担当エージェントは作業着手前に rule 要点を確認し、本 SOP で詳細パターンを参照すること。

---

## §1. 全 API ルートで zod 検証必須化

### 必須対象（例外なし）

| エンドポイント類型 | 検証対象 | 例 |
|---|---|---|
| 公開 API | `req.body` / `req.query` | `/api/contact`, `/api/signup` |
| 認証必須 API | `req.body` + `req.params` | `/api/posts/[id]`, `/api/users/me` |
| Webhook | `req.headers` + `req.body` | `/api/cron/sync`, `/api/stripe-webhook` |
| ヘッダー認証 API | `req.headers['x-api-key']` 等 | ai-concierge `/api/chat` |

### スキーマ未定義での本番リリース禁止

- 手動 `if` 文だけの API を本番に出すことは原則禁止
- 例外時は `risk-diagnosis.md` に「未対処の入力検証」として記録 + Step 5 評価表に追加

---

## §2. zod 導入手順

### 2.1 依存追加（プロダクトごと 1 回）

```bash
cd products/<product>/<app>
npm install zod
```

`package.json` の dependencies に追加されたことを確認:

```json
"dependencies": {
  "zod": "^3.x"
}
```

### 2.2 共通スキーマの整備（任意・推奨）

`src/lib/validation/common.ts` 等に共有スキーマを配置:

```typescript
import { z } from "zod";

export const EmailSchema = z.string().email();
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const IdSchema = z.string().min(1).max(100);
```

### 2.3 各 API ルートでスキーマ定義 + safeParse

```typescript
import { z } from "zod";
import { NextResponse } from "next/server";

const ContactBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  message: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ContactBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力に不備があります" },
      { status: 400 },
    );
  }
  const { name, email, message } = parsed.data;
  // 以降は parsed.data を使う（型は自動推論される）
}
```

---

## §3. zod スキーマ パターン集

### 3.1 文字列

```typescript
z.string()                          // 任意の文字列
  .trim()                           // 前後の空白除去
  .min(1)                           // 空文字拒否
  .max(2000)                        // 長すぎる入力拒否
  .email()                          // メール形式
  .url()                            // URL 形式
  .regex(/^[a-z0-9-]+$/)            // 任意の正規表現
```

### 3.2 数値

```typescript
z.number()
  .int()                            // 整数のみ
  .min(0).max(100)                  // 範囲指定
  .positive()                       // 正数のみ
  .nonnegative()                    // 0 以上
z.coerce.number()                   // 文字列 "10" → 10 に強制変換
```

### 3.3 列挙

```typescript
z.enum(["public", "private", "draft"])
z.union([z.literal("a"), z.literal("b"), z.literal("c")])
```

### 3.4 配列・オブジェクト

```typescript
z.array(z.string()).min(1).max(10)
z.object({ id: z.string(), name: z.string() })
```

### 3.5 オプショナル / デフォルト

```typescript
z.string().optional()               // undefined OK
z.string().nullable()               // null OK
z.string().default("hello")         // 値なし時 "hello"
```

### 3.6 ネストオブジェクト + 部分検証

```typescript
const UserSchema = z.object({
  id: z.string(),
  profile: z.object({
    name: z.string(),
    age: z.number().int().nonnegative().optional(),
  }),
});
```

---

## §4. 既存手動チェックからの段階的移行

### Step 1: 既存バリデーションを抽出

```javascript
// Before（手動 if 文の羅列）
if (!email) return res.status(400).json({ error: "..." });
if (typeof email !== "string") return res.status(400).json({ error: "..." });
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "..." });
if (!message || message.length > 2000) return res.status(400).json({ error: "..." });
```

### Step 2: zod スキーマで等価表現

```typescript
const Schema = z.object({
  email: z.string().email(),
  message: z.string().min(1).max(2000),
});
```

### Step 3: 動作確認

- 正常系: 想定する入力で 200 が返ること
- 不正系: 各バリデーションを 1 個ずつ違反させて 400 が返ること
  - email 不在 / email 形式不正 / message 空 / message 長すぎ

### Step 4: 手動 if 文を削除

- zod が網羅していると確認後、既存 `if` 文を削除
- PR 単位で 1 ルートずつ（リスク分散）

---

## §5. エラーレスポンスの統一

### 推奨レスポンス（本番）

```typescript
return NextResponse.json(
  { error: "入力に不備があります" },
  { status: 400 },
);
```

- フィールド名を露出しない（攻撃者への情報提供を避ける）
- スキーマ詳細はサーバーログ + Sentry に送る

### 開発時のデバッグ用ログ

```typescript
if (!parsed.success) {
  console.error("[validation] failed:", parsed.error.issues);
  return NextResponse.json({ error: "入力に不備があります" }, { status: 400 });
}
```

---

## §6. SQL Injection / XSS への影響範囲

| 攻撃 | zod の責任 | 対処手段 |
|------|---------|---------|
| SQL Injection | 範囲外 | Prisma / Supabase Client / PocketBase SDK の構造的防御に依存 |
| XSS（HTML タグ混入） | 範囲外 | 表示時に textContent or dompurify を使う |
| プロンプトインジェクション | 範囲外 | LLM 呼び出し前に escape / フィルタ |
| 入力形式の異常 | **責任範囲** | zod スキーマで網羅 |
| 範囲外の数値・列挙 | **責任範囲** | min/max/enum で網羅 |

zod は「形式・型・範囲」の検証ライブラリ。XSS / SQL Injection は別途対処。

---

## §7. プロダクト別導入順（推奨）

| 順 | プロダクト | 開始ルート | 理由 |
|---|----------|----------|------|
| 1 | review-app | `/api/contact` | rate-limit 直近対処、最小公開フォーム |
| 2 | ai-concierge | `/api/chat` | テナント widget の最重要ルート |
| 3 | foodee | `/api/cron/index.js` | CRON 認証 + RSS フィード |
| 4 | aiueo | フロント form | PocketBase 経由（SDK 側で集約済み）|

---

## §8. テスト方針

### 単体テスト（推奨）

```typescript
import { describe, expect, it } from "vitest";
import { ContactBodySchema } from "./route";

describe("ContactBodySchema", () => {
  it("正常系: 有効な入力", () => {
    expect(ContactBodySchema.safeParse({
      name: "山田太郎",
      email: "yamada@example.com",
      message: "お問い合わせ内容",
    }).success).toBe(true);
  });

  it("不正系: email 形式不正", () => {
    expect(ContactBodySchema.safeParse({
      name: "山田太郎",
      email: "invalid",
      message: "お問い合わせ内容",
    }).success).toBe(false);
  });

  it("不正系: message 空", () => {
    expect(ContactBodySchema.safeParse({
      name: "山田太郎",
      email: "yamada@example.com",
      message: "",
    }).success).toBe(false);
  });
});
```

### E2E テスト

- curl / Postman で 400 が返ることを確認
- フロント側の form でも動作確認

---

## §9. 移行進捗管理

各プロダクトの API ルートで zod 化進捗を記録:

```
products/<product>/risk-diagnosis.md に追記:

## API ルート zod 化進捗

| ルート | 状態 | コミット |
|--------|------|---------|
| /api/contact | ✅ 完了 | abc123 |
| /api/chat | ⏳ 未対処 | — |
```

全ルート完了したら Step 5 評価表 F-1 を ○ に昇格。

---

## §10. 参考

- zod 公式: https://zod.dev/
- セキュリティ診断 F-1: `memory/project_security-diagnosis-step5-comprehensive.md`
- Step 4 報告書: `memory/project_security-diagnosis-step4-report.md`
- 関連 SOP: `rate-limit-sop.md` / `security-runtime.md`
