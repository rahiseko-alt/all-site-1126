# 技術ポートフォリオ（営業資料）デプロイ手順

公開URL: https://works.kouheikosehira.com
Vercel プロジェクト: `works`（scope: rahisekos-projects）

## 構成

| 役割 | パス |
|---|---|
| 正本（編集するのはここだけ・**追跡対象**） | `docs/deliverables/portfolio.html` |
| 公開物（生成物・手編集禁止・**gitignore**） | `deploy/works/index.html` |
| ビルド | `scripts/build-works-portfolio.mjs` |
| 公開設定（追跡対象） | `deploy/works/vercel.json` |

`index.html` は追跡しない。コミットすると正本との二重管理になり、ビルド忘れで乖離するため。
リポジトリに存在しないので、**クローン直後は必ずビルドしてからデプロイする**。

## なぜ公開専用ディレクトリを分けるか

`docs/deliverables/` には開発経歴書・戦略資料・スクリーンショットが同居している。
このディレクトリをそのままデプロイすると **全部が世界に公開される**。
公開してよいのは `portfolio.html` の1枚だけなので、公開専用ディレクトリへ写す工程を機械化した。

## 更新手順

1. `docs/deliverables/portfolio.html` を編集する
2. ブラウザで `file:///.../docs/deliverables/portfolio.html` を開き、目視確認する
3. 以下を実行する

```bash
node scripts/build-works-portfolio.mjs && vercel --prod --yes --cwd deploy/works
```

4. https://works.kouheikosehira.com を実ブラウザで開き、変更が反映されているか確認する
5. `docs/deliverables/portfolio.html` をコミットする（`deploy/works/index.html` は生成物なのでコミットしない）

## ビルドスクリプトが落とす条件（fail-closed）

- 正本が存在しない
- 公開禁止パターンを検出（API キー / Bearer トークン / localhost 参照 / ローカル絶対パス）
- `deploy/works/` に想定外のファイルがある（誤公開の芽）

差分検査のみ:

```bash
node scripts/build-works-portfolio.mjs --check   # 乖離していれば EXIT 1
```

## 初回セットアップ（別PC・再クローン時）

`.vercel/` は gitignore 対象のためリポジトリに含まれない。1度だけ実行する。

```bash
vercel link --yes --project works --cwd deploy/works
```

## DNS

`kouheikosehira.com` のネームサーバは Cloudflare。サブドメインは Cloudflare 側に
CNAME を置き、Vercel に向ける（プロキシは DNS only）。

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | works | cname.vercel-dns.com | DNS only |

## 注意

- `portfolio.kouheikosehira.com` は **別サイト**（HTML虎の巻の WebGL 作品集・プロジェクト `portfolio`）。混同するな。
- `deploy/works/index.html` を直接編集しても、次のビルドで上書きされる。
- Vercel Hobby は非商用限定。営業資料の掲示は該当しないが、収益化機能を載せるなら Pro へ。
