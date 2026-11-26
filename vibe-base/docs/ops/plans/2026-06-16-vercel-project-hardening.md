# 2026-06-16 Vercel プロジェクト構造修正 runbook

対象: `portfolio.kouheikosehira.com` を本番配信している Vercel プロジェクト（現プロジェクト名 `agent-ag`）。
実施者: マスター（Vercel ダッシュボード + 対話認証 CLI で実施）。

## 前提（確定した脅威モデル）

- カスタムドメインは「1 ドメイン = 1 プロジェクト・割当は明示操作必須・勝手に奪われない」（Vercel 公式仕様）。
- 実脅威は 2 つに限定される: ①本番プロジェクトに別フォルダから `vercel link` で第 2 デプロイ源を付ける ②本番プロジェクトを GitHub 連携して push 自動デプロイにする。
- GitHub / CI 自動デプロイ経路は現状存在しない（workflow に vercel/deploy 無し）。
- 唯一の火種は「フォルダ名 `agent-ag` とプロジェクト名 `agent-ag` が同一で紛らわしい」点。本 runbook はこれを解消する。

## 手順 1: プロジェクト名 `agent-ag` → `portfolio` リネーム

1. `https://vercel.com/<team>/agent-ag/settings` を開く。
   - なぜ: プロジェクト名はここでのみ変更でき、URL の `/agent-ag/` 部分が現プロジェクトを指す。
2. General → Project Name を `portfolio` に変更して Save。
   - なぜ: フォルダ名 `portfolio/` とプロジェクト名を一致させ、`agent-ag` 同名による取り違えを物理的に消す。
3. 変更後、Settings → Domains に `portfolio.kouheikosehira.com` が Production 割当のまま残っていることを確認する。
   - なぜ: ドメイン割当はプロジェクト ID に紐づくためリネームで剥がれない。zero-downtime であることをこの目視で確定する。
4. ブラウザで `https://portfolio.kouheikosehira.com` を開き 200 表示を確認する。
   - なぜ: alias と本番デプロイの紐付けがリネーム後も生きていることを実応答で確認する。
5. ローカルの `portfolio/.vercel/project.json` を開き、`projectId` が変わっていないことを確認する（リネームは projectId を変えない）。
   - なぜ: 既存ローカルリンクが新名でもそのまま有効であり、再 link 不要であることを確認する。

## 手順 2: Git 連携が無いことの確認・つながない運用

1. `cd portfolio && vercel project inspect` を実行する（対話認証済み端末で）。
   - なぜ: 当該プロジェクトに接続された Git リポジトリが Git 欄に出るかどうかを CLI で直接読む。
2. 出力に Git / Connected Git Repository 欄が表示されない（または None）ことを確認する。
   - なぜ: Git 欄が空 = push 自動デプロイ経路が存在しない、を意味する。
3. ダッシュボード Settings → Git でも `No Git Repository connected` を目視確認する。
   - なぜ: CLI とダッシュボードの 2 経路で「連携なし」を二重に確定する。
4. 今後このプロジェクトで Connect Git Repository を押さない運用を確定する。
   - なぜ: Git 連携した瞬間 push 自動デプロイ源が増え、ローカル `vercel --prod` 単一経路が崩れる。

## 手順 3: `lab.kouheikosehira.com` alias の出所確認・要否判定

1. Settings → Domains で当該プロジェクトに付与されている `lab.kouheikosehira.com` を開き、追加日と割当先デプロイを確認する。
   - なぜ: portfolio 本番と同一プロジェクトに同居している別 alias の出所を特定する。
2. この alias が現在何を配信しているかをブラウザで開いて確認する。
   - なぜ: 使用中か死蔵かを実応答で判定する。
3. 用途不明・未使用なら Remove する。本番ドメインと別用途で意図的に使うなら別プロジェクトへ移す。
   - なぜ: 本番プロジェクトに用途不明の alias を残すと「このプロジェクトは何を配信するものか」が曖昧になり取り違えの温床になる。

## 手順 4: 唯一の規律 — 本番プロジェクトに第 2 デプロイ源を付けない

1. 本番プロジェクト `portfolio`（旧 `agent-ag`）へのデプロイ源は `portfolio/` ディレクトリの `vercel --prod` ただ 1 つに固定する。
   - なぜ: デプロイ源が 1 つなら、何がいつ公開されたかが一意に追跡でき、誤公開経路が生まれない。
2. 他フォルダで `vercel link` してこのプロジェクトを選ばない。GitHub 連携もしない。
   - なぜ: 第 2 デプロイ源（別フォルダ link / Git 連携）の追加が、本脅威モデルで唯一の実リスクだから。

## 受け入れ基準

1. プロジェクト名一致 — Vercel プロジェクト名が `portfolio` になり、ダッシュボード Settings 上で確認できる。
2. ドメイン維持 — `portfolio.kouheikosehira.com` が当該プロジェクトに Production 割当のまま残り、ブラウザで 200 応答する。
3. Git 非連携 — `vercel project inspect` と Settings → Git の両方で Git リポジトリ連携が無いことを確認できる。
4. alias 判定済み — `lab.kouheikosehira.com` の出所が特定され、Remove または別プロジェクト移管のいずれかに判定済みである。
5. 単一デプロイ源 — 本番プロジェクトのデプロイ源が `portfolio/` の `vercel --prod` のみで、第 2 デプロイ源（別フォルダ link / Git 連携）が存在しない。
6. runbook 実体 — 本 runbook が存在し 4 手順を含む（`test -f docs/ops/plans/2026-06-16-vercel-project-hardening.md` が EXIT 0 かつ `grep -c '^## 手順'` が 4 を返す）。

## テスト方針

本 runbook はマスターがダッシュボード + 対話認証 CLI で手動実施する手順書であり、自動テストの対象ではない。各手順末尾の「確認」項目を検証ステップとする。

- 手順 1-4: ブラウザ 200 応答・`vercel project inspect` 出力・Settings 画面目視を各手順内の確認項目として用いる。
- ファイル存在検証: `test -f docs/ops/plans/2026-06-16-vercel-project-hardening.md`（EXIT 0）。
