> ⚠️ 要点は `.claude/rules/rate-limit.md` で自動注入される。ここは詳細版。

# レートリミットSOP — API濫用防止プロトコル

> **対象:** 全プロダクト（公開APIを持つ場合は必須。セキュリティレビューで参照）
> **起源:** catnose#2「APIレートリミット導入」を自プロダクト送信制御ガイド化
> **関連SOP:** `incident-response-sop.md`（攻撃検知時のP1対応）/ `cost-budget-sop.md`（API濫用によるコスト爆発防止）

---

## §0. 自動注入

このSOPの要点は `.claude/rules/rate-limit.md` で `**/api/**`, `**/middleware.ts/js` 編集時に自動注入される。API実装担当エージェントは作業着手前にrule要点を確認し、本SOPで詳細パターンを参照すること。

---

## §1. 認証不要エンドポイントへのレートリミット必須化

### 必須対象（例外なし）
| エンドポイント類型 | 例 | 推奨制限 |
|---|---|---|
| 認証前API | `/api/auth/login`, `/api/signup`, `/api/forgot-password` | IP別 5req/min |
| 公開フォーム | `/api/contact`, `/api/feedback`, `/api/subscribe` | IP別 3req/min |
| 公開検索・取得 | `/api/search`, `/api/products`, `/api/posts` | IP別 60req/min |
| OGP・OEmbed取得 | `/api/og`, `/api/oembed` | IP別 30req/min |

### 認証ありでもレートリミット推奨
- ログイン後でも外部入力を受ける（フォーム送信・検索等）API
- AI呼出・画像生成・大量DB読込等の高コスト処理
- ファイル添付・メール送信等の濫用リスクが高い処理

### 設定なしでの本番リリース禁止
- レートリミット未設定のAPIを本番に出すことは原則禁止
- 例外時は cost-budget-sop.md §2 のハードリミット併用で「上限突破時に自動停止」を担保

---

## §2. IP別 / ユーザー別 / API別の制限設計

### 3軸独立に設定
| 軸 | 目的 | 例 |
|---|---|---|
| **IP別** | 単一クライアントの連続攻撃を即座にブロック | `/api/login`: IP別 5req/min |
| **ユーザー別** | ログイン後の濫用検知（複数IPからのbotnet対策） | `/api/post`: user別 30req/hour |
| **API別** | 重い処理を個別に厳しめに制限 | `/api/ai-generate`: 全体 100req/hour |

### 階層型制限の例（Next.js + Upstash）
```typescript
// /api/contact 用の3軸制限
const ipLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "1 m") });
const userLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 h") });
const globalLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(1000, "1 h") });

const [ip, user, global] = await Promise.all([
  ipLimit.limit(`ip:${clientIp}`),
  userLimit.limit(`user:${userId ?? "anon"}`),
  globalLimit.limit("api:contact"),
]);
if (!ip.success || !user.success || !global.success) {
  return Response.json({ error: "rate_limited" }, { status: 429 });
}
```

### 制限値の決定基準
- 想定ユーザー数 × 平均アクション数 × 余裕係数（2〜3倍）= 妥当上限
- 「正規ユーザーが一切詰まらない」が下限、「攻撃を即ブロック」が上限
- 初期は厳しめに設定し、429発生ログをもとに緩める運用

---

## §3. 実装パターン

### Next.js + Vercel + Upstash Ratelimit（推奨）
```typescript
// app/api/contact/route.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  analytics: true,
});

export async function POST(req: Request) {
  const ip = headers().get("x-forwarded-for") ?? "127.0.0.1";
  const { success, reset, remaining } = await ratelimit.limit(`contact:${ip}`);
  if (!success) {
    return Response.json(
      { error: "Too Many Requests", retryAfter: Math.ceil((reset - Date.now()) / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) } }
    );
  }
  // 通常処理
}
```

### Express + express-rate-limit + Redis
```javascript
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");

const loginLimiter = rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too Many Requests", retryAfter: 60 },
});

app.post("/api/auth/login", loginLimiter, loginHandler);
```

### Vercel Edge Middleware（全API一括）
```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "60 s"),
});

export async function middleware(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(`global:${ip}`);
  if (!success) {
    return new NextResponse(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { "content-type": "application/json", "Retry-After": "60" },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
```

---

## §4. 制限超過時のレスポンス設計

### HTTP 429 + 必須ヘッダー
```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735000000
Content-Type: application/json

{
  "error": "rate_limited",
  "message": "リクエストが多すぎます。30秒後に再試行してください",
  "retry_after_seconds": 30
}
```

### 必須要件
- `Retry-After` ヘッダー必須（秒数 or RFC1123日付）
- レスポンスボディに**日本語の再試行案内**を入れる（一般ユーザー向け）
- `X-RateLimit-*` ヘッダーで残量を露出（API利用者向け）

### UI側の対応
- 429受信時は「混雑しています。{N}秒後に再試行できます」とトースト表示
- カウントダウン表示で再試行可能時刻を可視化
- 自動リトライは指数バックオフで最大3回まで

---

## §5. 監視と調整

### 監視ダッシュボード（必須）
- **429発生数の日次グラフ:** Upstash Analytics / Vercel Analytics で可視化
- **上位IPランキング:** 1日あたり最も多く429を受けているIPを上位10件
- **エンドポイント別ヒートマップ:** どのAPIで429が頻発しているか

### 攻撃検知の閾値
- 同一IPから1分間に100req超 → 即座にIPブロック（Cloud Armor / Cloudflare WAF）
- 同一エンドポイントで1時間に1000件以上の429発生 → P1扱いで `incident-response-sop.md` §2発動
- 想定の10倍超の429発生 → cost-budget-sop.md §4 緊急停止プロトコルとの併用検討

### 制限値の見直しタイミング
- 初期リリース後1週間: 正規ユーザーが詰まっていないか確認、必要なら緩める
- 攻撃検知後: 該当エンドポイントの上限を厳しめに再設定
- 月次レビュー: 429発生ログをもとに上位エンドポイントの上限を調整

---

## §6. プロダクト導入手順

### 新規プロダクトでの導入
1. インフラ決定時に Upstash Redis / express-rate-limit 等の選定を確定
2. コア機能実装時に `/api/auth/*` `/api/contact` 等の必須対象に実装
3. セキュリティレビューで実装確認
4. 公開前に Vercel Edge Middleware で全API一括ガードを追加（推奨）

### 既存プロダクトへの導入
1. 公開API一覧を作成（`grep -r "export async function POST" app/api/`）
2. §1の必須対象から実装開始
3. セキュリティレビュー再実施で全件カバレッジを確認
4. 1週間モニタリングし、429発生ログから制限値を調整

---

v1.0 | 2026-04-27 | 初版（構造改革プロジェクト T4）
