# new-trimmer-system memory archive (2026-06)
> 元 products/new-trimmer-system/memory.md から移行した P3・P4 コンテンツ
> 作成: 2026-06-10 / コンテキスト改革 Phase C

## P3: 失敗事例（元 memory.md より移行）

1. [2026-06-09][基準④ マスター差し戻し3件+] 個別ページの画像枠仕様（個数・統合可否）を曖昧なまま推測実装し、爪/歯で複数回差し戻し（「1枠統合」と誤解→実は「同サイズ2枠」、歯は「3枠」と誤解→実は「参考＋描画機能付き添付の2枠」）。マスター不快表明あり。
   - 根本原因: 「枠の個数・構造」という数えられる仕様を復唱・確認せず解釈で進めた。
   - 再発防止: 個数・構造が曖昧な指示は、実装前に「枠N個・各役割・同サイズ可否」を復唱して確認してから着手する。

## P4: 永続教訓（元 memory.md より移行）

（なし）

## 参考情報（元 P1 より）

- 現フェーズ: P4 音声入力を Whisper（Cloudflare Workers AI）に全面刷新済・本番デプロイ済
- 進行 plan（Whisper 実装）: `~/.claude/plans/lucky-squishing-key.md`
- 本番 URL: `https://new-trimmer-system.rahiseko.workers.dev`
- dev 起動: `npm run dev -- --port 5181`
- 旧システム: Worker `saltydog-report-worker`（HTML注入結合）。バックエンド/KV/データ移行未着手
- 型 warning 2 件（DrawCanvas 非リアクティブ宣言・API 改変禁止で不触）/ `ScaledFit.svelte` 未使用残置

## 補足（2026-06-12 退避・運用メモ）
- デプロイ: マスター明示指示時に実施可（本セッションで複数回 wrangler deploy 実施）。本番 URL: https://new-trimmer-system.rahiseko.workers.dev
- 依存追加（npm install）は auto mode classifier で拒否される。必要時はマスター明示許可を得るか自前実装（d&d は svelte-dnd-action 不可→自前 pointer 実装で対応）
- ルーティング: `/`=ログイン / `/search` / `/register` / `/list`=一覧(git mv済) / `/report/[page]`=詳細。詳細の戻りは `/list`
