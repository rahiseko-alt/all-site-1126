---
description: Vercelデプロイ前後のチェックリスト
paths:
  - "**/vercel.json"
  - "**/.vercel/**"
  - "**/next.config.*"
---

## デプロイ前
- npm run build が成功すること
- DB マイグレーションが適用済みであること
- OAuth のリダイレクト URI が本番用に設定されていること
- 全APIが有効化されていること
- 環境変数: DATABASE_URL / AUTH_SECRET / 各API_KEY / OAuth CLIENT_ID+SECRET

## デプロイ後
- トップページが表示されること
- 認証が動作すること
- 主要APIが応答すること
- DB の読み書きが正常なこと
- OGP が正しいこと

## ドメイン
- カスタムドメイン {product}.kouheikosehira.com を使え。*.vercel.app のまま放置禁止
- Vercel Hobby = 非商用限定。収益化する場合は Pro に移行が必要

デプロイチェックリストのvest1: docs/standards/checklists/ を参照

詳細: docs/ops/vercel-deploy-checklist.md

## HTML虎の巻ポートフォリオ（portfolio.kouheikosehira.com）

- 正規デプロイ経路・手順・防御 hook の正本は **`docs/html-toranomaki/RULES.md` §8.6** を参照（Reference-over-Redundancy：デプロイコマンドは正本1箇所のみ記載）。
- 要点: `portfolio/` からのみデプロイ（`portfolio/.vercel` が唯一の正リンク）。デプロイ前に `build-portfolio.mjs` + `toranomaki-verify.mjs` PASS 必須（PreToolUse hook が強制）。root / `agent-ag/` からのデプロイ禁止。

## 技術ポートフォリオ＝営業資料（works.kouheikosehira.com）

**上の HTML虎の巻ポートフォリオとは別サイト。混同するな。**

- 正本 `docs/deliverables/portfolio.html` を編集 → `deploy/works/index.html` へビルド → `deploy/works` からのみデプロイ。
- `docs/deliverables/` を直接デプロイするな（経歴書・戦略資料・スクリーンショットが同居しており全部公開される）。
- ビルドは `scripts/build-works-portfolio.mjs`（秘匿パターン検出と想定外ファイル検出で fail-closed）。

詳細: docs/ops/works-portfolio-deploy.md
