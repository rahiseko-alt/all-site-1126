# .toranomaki-outbox — agent-ag 提出口

agent-ag が「虎の巻／ポートフォリオに追加したい」成果物を投函する場所。
ここに置く＝**提出**であって、虎の巻・公開サイトへの**追加完了ではない**。司令塔の intake で初めて取り込まれる。

## 提出物の構造
```
agent-ag/.toranomaki-outbox/{slug}/
  ├── meta.json          { slug, title, titleEn?, blurb, tags[], impl, portfolio }
  ├── concept.md         RULES.md §1 準拠（出典付き・300行以内・日付禁止）
  ├── research-log.md    RULES.md §2 準拠（固定ヘッダー＋日付エントリ）
  └── impl-{lib}-{ver}/  index.html + css/ + js/（相対参照は自己完結）
```

- `slug`: kebab-case・フォルダ名と一致
- `portfolio`: `false`=虎の巻のみ / `true`=公開ポートフォリオにも
- `impl`: `impl-{小文字lib}-{メジャー.マイナー}`（`latest` 禁止）

## 取り込まれ方（司令塔側）
1. SessionStart 通知 or 司令塔が `node scripts/toranomaki-intake.mjs --dry-run` で検出
2. `node scripts/toranomaki-intake.mjs` 実行 = 配置 → blindtest → registry 登録 → 公開ビルド
3. blindtest FAIL は registry 未更新で差し戻し
4. コミット・デプロイは司令塔＋マスター承認のみ（auto-commit / auto-deploy なし）

正本仕様: `docs/html-toranomaki/RULES.md` §8.3
