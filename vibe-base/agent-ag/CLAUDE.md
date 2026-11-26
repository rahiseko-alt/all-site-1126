# agent-ag — R&D 実験場 自治憲法

## 役割
ここは **R&D 実験場（スクラッチ）**。clone 検証・試作・調査を自由に行ってよい。
ただし agent-ag は **公開の玄関ではない**。中央 `docs/`・`registry.json`・`portfolio/` への直接書込みと、デプロイ・公開は**できない／してはならない**。

> **サブ領域 `agent-ag/atelier/`**：Antigravity 専用の Web デザイン作業場（追跡資産・自治憲法 `agent-ag/atelier/AGENTS.md`）。agent-ag 本体の outbox 経路とは別で、**昇格は司令塔が直接移送・git 操作と保存は司令塔のみ**（Antigravity は作るだけ）。2026-06-26 にルート直下 `atelier/` から移設（二重ホーム矛盾の根治）。

## 「虎の巻に追加」「ポートフォリオに出して」と言われたら（最重要）

直接 docs/ に書くな・公開するな。**提出（submit）だけ**を行い、検問（司令塔の intake）に渡す。

### 手順
1. `agent-ag/.toranomaki-outbox/{slug}/` に提出物一式を用意する:
   - `meta.json` … `{ "slug","title","titleEn?","blurb","tags":[...],"impl":"impl-{lib}-{ver}","portfolio":true|false }`
     - `portfolio:false` = 虎の巻のみ（非公開） / `portfolio:true` = 公開ポートフォリオにも載せる
   - `concept.md`（RULES.md §1 準拠・出典付き）
   - `research-log.md`（RULES.md §2 準拠）
   - `impl-{lib}-{ver}/`（index.html + css/ + js/。相対参照は自己完結させる）
2. 用意できたら、こう報告する（**この通りに**）:
   > 「`agent-ag/.toranomaki-outbox/{slug}/` に提出しました。司令塔の intake 待ちです。
   > **まだ虎の巻にも公開サイトにも入っていません**（提出＝完了ではありません）。」

### 禁止（取り違え防止）
- **「追加した」「公開した」「完了」と言うな**。あなたができるのは「提出」まで。
- 中央 `docs/html-toranomaki/`・`registry.json`・`portfolio/` を直接編集するな。
- `vercel` でデプロイするな（届かないし、やってはいけない）。

## この先（司令塔が行う・あなたは関与しない）
司令塔セッションが `node scripts/toranomaki-intake.mjs` を実行し、
配置 → blindtest（描画検証）→ registry 登録 → 公開ビルド →（公開指定なら承認後デプロイ）を行う。
blindtest FAIL なら司令塔から差し戻される。

## 参照（正本）
- 提出仕様・intake 経路 → `docs/html-toranomaki/RULES.md` §8.3
- テーマ原本の書き方 → `docs/html-toranomaki/RULES.md` §1〜§6
- 全体憲法 → リポジトリ root の `CLAUDE.md`（§0 1フォルダ=1エージェント）
