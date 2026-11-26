# 技術構成プリセット 5 型 — 選定ガイド

> 出典: 2026-06-11 横断調査で 19 製品の構成が以下 5 型に収斂していることを確認（`docs/ops/cross-product-survey-2026-06-11.md` §2-3）。新規開発はまずこの 5 型から選ぶ。

| 型 | 構成 | 向いている用途 | デプロイ先 | 実績製品（参考実装） |
|---|---|---|---|---|
| (a) 単一 HTML 型 | 1 HTML + vanilla JS（+ localStorage / IndexedDB） | プロトタイプ・個人用ツール・LP・教材 | Vercel / Cloudflare Pages | omotenashi-trainer / renai-game / coach / homepage |
| (b) React+Vite 型 | React 19 + Vite + Tailwind（+ Vercel Functions / Supabase / PocketBase） | 管理画面・業務アプリ・SaaS | Vercel | ai-concierge / aiueo / kobaraku |
| (c) SvelteKit 型 | SvelteKit 2 + Svelte 5 Runes + Vite + TypeScript | 学習アプリ・PWA・静的寄り SPA | GitHub Pages / Cloudflare | learning-suite-kanji / learning-suite-kanji-foreign / new-trimmer-system |
| (d) CF Workers+KV 型 | 静的フロント + Cloudflare Workers + KV | 保存機能つき軽量アプリ（カルテ・帳票） | Cloudflare Pages + Workers | shiota-karte / trimmer-system |
| (e) GAS 連携型 | フロント任意 + Google Apps Script + スプレッドシート | Google サービス連携・二人/小規模共有 | GAS Web App（+ Vercel フロント） | renai-game / google-system-dev |

## 選定の問い（上から順に）

1. データを保存・共有するか？ → しない: (a) / Google 内で完結: (e)
2. 保存は軽量（KV で足りる）か本格 DB か？ → 軽量: (d) / 本格: (b) or (c)
3. 画面の複雑さは？ → 管理画面級: (b) / 学習・PWA 系: (c)

## 共通の注意（健康診断 2026-06-11 の教訓）

- DB / Auth の選定は**定型化しない**（要件・費用・規約依存。foodee は 2 回変更）。最初の plan で「変更しうる」前提の層分離をする
- テスト手段を P1 で確保（良好例: kanji-foreign の vitest / renai-game の検証スクリプト群）
- localStorage 操作の空 catch（無音握りつぶし）を書かない
- **1ファイル 500 行上限（line-count-gate hook で強制）。** 超える前に機能単位で分割（code-splitting スキル）。単一HTML型でも CSS/JS を別ファイルに分離
- vercel デプロイ時は `vercel-security-headers.json` を取り込む
