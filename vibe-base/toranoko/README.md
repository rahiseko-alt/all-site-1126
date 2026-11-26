# 虎の子 — 俺専用 技術アーカイブ

マスター（小齊平 恒平）の**開発時備忘録用ローカルポートフォリオ**。虎の巻（`docs/html-toranomaki/`）の技術デモを、ライブ iframe プレビュー＋技術タグ＋impl 版数つきカードで一覧する。「以前どの技術をどの版で作ったか」を視覚的に思い出すための俺専用ビュー。

## 位置づけ

- 顧客向け `portfolio/`（技術系＋顧客用の混在・Vercel デプロイ対象）とは**独立**。こちらは俺専用・ローカル・非公開。
- デモ実体は再発明せず `portfolio/{slug}/` を server 経由で再利用する（二重持ちしない）。
- データ源は虎の巻の単一正本 `docs/html-toranomaki/registry.json`。

## 使い方

```bash
# 1. 生成（registry の現状を読み直して index.html を焼き直す）
node toranoko/scripts/build-toranoko.mjs
# 2. 配信（vibe-base ルートを配信し iframe で portfolio/ のデモ実体を再利用）
node toranoko/server.mjs
# 3. ブラウザで開く
#    http://localhost:3100
```

## 構成

| ファイル | 役割 | git |
|---|---|---|
| `scripts/build-toranoko.mjs` | `registry.json` → 技術デモカードを `index.html` に生成 | 追跡 |
| `server.mjs` | vibe-base ルート配信・`/` で虎の子トップ・iframe で `/portfolio/` 再利用 | 追跡 |
| `README.md` | 本ファイル | 追跡 |
| `index.html` | 生成物（俺専用ポートフォリオ本体） | 非追跡（`.gitignore`） |

## 注記

- iframe（WebGL/Three.js 等）は `file://` だと動かないため **server 経由必須**。
- デモ実体が `portfolio/{slug}/index.html` に未配置のもの（intake 待ち）はプレビュー枠に「実体未配置」と表示する。
