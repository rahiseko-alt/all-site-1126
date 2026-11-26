# ADR-0004: Web/SaaS型productのデフォルト技術スタックを固定する

- Status: Accepted
- Date: 2026-07-16
- Deciders: マスター（小齊平 恒平）+ vibe-base 司令塔

## Context

vibe-baseは既に`docs/standards/templates/product-scaffold/tech-presets.md`で技術5型プリセット（単一HTML/React+Vite/SvelteKit/CF Workers+KV/GAS連携）を持つが、これは「フロントエンドの型」の選定であり、DB/Auth/決済等の周辺構成については「定型化しない」（要件依存）としていた。

マスターの開発対象は基本的にWeb/SaaS型productであり、後戻りしにくい基盤決定（言語・DB・Auth・ホスティング）を最初に固定したいという要望があった。外部リサーチ（2026年時点の複数の業界情報源）により、Web/SaaS MVP向けに強い業界標準（"boring stack"）が実在することを確認した: Next.js + TypeScript + Postgres(Supabase) + Vercel + Stripe/Resend + Prisma/Drizzle。複数の情報源が「これが定番であり、具体的な理由がない限り逸脱するな」と明言している。

## Decision

### 1. Web/SaaS型product（デフォルト）

管理画面・業務アプリ・課金あり/なしのSaaS等、tech-presets.mdの(b)React+Vite型が該当するような用途。具体的な逸脱理由がない限りこの構成・ライブラリ選定から動かさない。

| 区分 | デフォルト |
|---|---|
| フロントエンド | Next.js + TypeScript |
| スタイリング/UI | Tailwind + shadcn/ui |
| バックエンド | Next.js API Routes / Server Actions |
| DB | Postgres（Supabase経由） |
| Auth | Supabase Auth（要件に応じてClerk/NextAuthも可） |
| 決済 | Stripe（必要な場合のみ） |
| ORM | Prisma |
| メール送信 | Resend |
| テスト | Vitest |
| ホスティング | Vercel |

### 2. AI/ML比重が高いproduct

RAG・埋め込み・画像/動画生成・データパイプライン等でtorch/transformers/langchain/pandas等のPythonライブラリが要る場合（medguide-rag/ig-card/ai-concierge等が該当しうる）。フロント・バックを言語の異なる分離構成にする。

| 区分 | デフォルト |
|---|---|
| フロントエンド | Next.js + TypeScript（1と同じ、変更なし） |
| バックエンド | Python + FastAPI |
| バック側スキーマ検証 | Pydantic |
| バック側DB接続 | SQLAlchemy |
| 通信方式 | フロント/バック間はREST/JSON疎通（互いの言語を意識しない設計） |
| 認証・cookie | 認証ロジックはFastAPI側、cookie設定はNext.js側に寄せる（フロント/バックでドメインが分かれる前提） |
| ホスティング（フロント） | Vercel |
| ホスティング（バック） | 大型Python依存（torch/langchain等）があればVercel外（Render/Fly.io等のDocker対応ホスト） |

### 3. 対象外product

ゲーム・動画生成・GUI自動化等、1・2いずれにも当てはまらないproduct（例: spire-lite=Godot、ymm-shorts=Windows GUI自動化）は、このデフォルトの対象外。技術選定はそのproduct着手時に都度推奨する（事前の一律テンプレ化はしない）。

### 4. 既存フローとの関係

既存のtech-presets.md 5型選定フローとは矛盾しない。5型は「フロントエンドの型」を選ぶフローであり、本ADRは(b)型を選んだ場合の周辺構成（DB/Auth/決済/バックエンド言語/ライブラリ）のデフォルト値を追加で定める。

## Consequences

- 新規Web/SaaS型product立ち上げ時、DB/Auth/ホスティングを都度検討する工数が減る。
- 非Web型product（ゲーム/動画/GUI自動化）は引き続きケースバイケースで判断し、無理にこのスタックへ寄せない。
- 既存productで異なる構成のものを本ADRにあわせて移行する義務はない（新規のみ適用）。
