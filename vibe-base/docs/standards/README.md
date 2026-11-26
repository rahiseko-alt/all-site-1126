# vest1 管理ルール

> vest1 = ある種類の成果物において「現時点で最良」と認定された唯一の正本

## 原則

1. **only1:** 同じ種類の正本はこのフォルダ内に1つだけ存在する
2. **ここだけが正:** vest1は `docs/standards/` の中にしか存在しない
3. **たたき台:** 新規作成時は該当するvest1をコピーして使え。ゼロから作るな
4. **常に暫定:** vest1は更新され続ける。完成版は存在しない
5. **最新≠最良:** プロダクト内の派生版が新しくても、vest1より良いとは限らない
6. **昇格はマスター判断:** 派生版がvest1を上回ると判断した場合、マスターに報告→比較→承認→入れ替え

## カテゴリ

| フォルダ | 内容 | 例 |
|----------|------|----|
| templates/ | 設計書・計画書の雛形 | 設計書、テスト計画、障害シナリオ |
| boilerplate/ | コード雛形 | LP、Remotion、メール |
| checklists/ | 確認リスト | デプロイ前、品質ゲート |

## vest1 の形式選択ルール（Session 169 改訂）

### 優先順位（絶対・並び替え禁止）
1. **AI の読み書き精度**（最優先）
2. **マスターの分かりやすさ**
3. **トークン効率**（参考程度）

> トークン効率を優先すると手戻り・散在が増えて結果的にコストが増える。精度＞わかりやすさ＞効率の順で判断せよ。

### 形式選択フロー

vest1 を新規作成 or 更新する際、「この vest1 を誰がどの頻度で読み書きするか？」をまず考える:

| 読み書きパターン | 推奨形式 | 理由 |
|---|---|---|
| AI が頻繁に読み書き（セッションごとに編集） | **md or html** | 部分編集精度・差分確認・整合性維持 |
| AI がワンタイム生成 → マスター閲覧/編集 → AI は読み戻さない | **xlsx OK** | マスターの編集性優位、AIの読み戻しリスクなし |
| マスター主導で継続更新 → AI は月1程度参照 | **xlsx OK** | マスターの日常運用ツール |
| 文書・設計書・手順書・ガイド | **md** | 文章中心、git diff でレビュー容易 |
| 固定レイアウト・画像テンプレ・デザイン確認用 | **html** | ブラウザレンダリング必須 |

### 形式別の特性

| 形式 | AI精度 | マスター分かりやすさ | git差分 | トークン効率 |
|---|---|---|---|---|
| md | ◎ 部分編集最適 | ○ 読みやすい | ◎ 完全 | ○ |
| html | ◎ 部分編集可 | ◎ レンダリングで見やすい | ○ 可 | △ 冗長 |
| xlsx | △ openpyxl経由・数式/書式破壊リスクあり | ◎ Excel でそのまま編集 | × バイナリで不可 | ◎ データのみ |

### xlsx 選択時の注意点

- **AIが頻繁に読み書きする vest1 を xlsx にしてはいけない**（精度リスク）
- 数式・条件付き書式は openpyxl の操作ミスで壊れる可能性 → 編集時は必ず `data_only=False` でロード + dry-run
- シート名の日本語は環境依存問題あり（Windows CP932 で化ける）→ ASCII or短めの日本語推奨
- git diff できないため、変更履歴は memory.md に明記せよ
- 旧 MD 版を削除する前に、マスターによる xlsx 動作確認を必ず経由する

### 運用ファイル（単一存在の SSoT）— VEST 例外ルール

ある領域の情報を完全に統合管理する単一ファイル（例: `monetization.xlsx`）は、
以下の条件を満たす場合 `docs/standards/` 外に配置してよい（vest1 原則の例外）:

1. **その領域の全情報が1ファイルに集約**されている（散在を解消する目的）
2. **同種の複数インスタンスが存在しない**（only1 を満たす）
3. **repo root や専用ディレクトリに配置し**、パスが固定されている
4. **vest1 対応表にエントリを追加**（カテゴリ列に「運用」と明記）
5. **scripts/{domain}/build.py と sync.py** で読み書きする（手動編集も可）
6. **MEMORY.md 索引に SSoT の事実を明記**（全エージェントが迷わないように）

例: `monetization.xlsx`（#29）— マネタイズ作戦の全情報を統合管理。repo root 配置。
scripts/monetization/ 配下のスクリプトで読み書き。

### 既存 vest1 の形式変更手順

1. 候補をマスターに提案（読み書きパターン分析付き）
2. マスター承認
3. 移行（旧版は一時バックアップ、gitに履歴を残す）
4. マスターが実際に xlsx を開いて動作確認
5. OK なら旧 MD 版を削除（または deprecated マーク付きで当面残す）
6. vest1-catalog.html 更新

## 昇格プロセス

派生版（プロダクト内で改良されたもの）をvest1に昇格させる手順:

1. エージェントが改良を検知 → memory.mdに「vest1昇格候補」として報告
2. マスターが vest1 と派生版を見比べて判断
3. 承認された場合 → vest1を入れ替え（旧vest1は上書き。gitに履歴が残る）
4. 却下された場合 → 派生版はプロダクト内にそのまま残る

## 禁止事項

- vest1を直接編集してプロダクト固有の内容を書き込むな（コピーしてから編集）
- マスター承認なくvest1を入れ替えるな
- vest1を別の場所にコピーして「もう1つの正本」を作るな

---

## vest1 対応表

| # | vest1パス | 元ファイルパス | カテゴリ | 配置日 |
|---|----------|--------------|----------|--------|
| 1 | docs/standards/templates/design-doc.md | docs/ops/design-doc-templates.md | T | 2026-04-02 |
| 2 | docs/standards/templates/external-service-check.md | docs/ops/external-service-check-template.md | T | 2026-04-02 |
| 3 | docs/standards/templates/failure-scenario.md | docs/ops/failure-scenario-template.md | T | 2026-04-02 |
| 4 | docs/standards/templates/onboarding.md | docs/ops/onboarding-ops-templates.md | T | 2026-04-02 |
| 5 | docs/standards/templates/test-plan.md | docs/ops/test-template-guide.md | T | 2026-04-02 |
| 6 | docs/standards/templates/email-template.md | docs/ops/email-template-guide.md | T | 2026-04-02 |
| 7 | docs/standards/templates/feature-comparison.html | docs/ops/feature-comparison-template.html | T | 2026-04-02 |
| 8 | docs/standards/templates/client-credentials.md | docs/templates/client-credentials.md | T | 2026-04-02 |
| 9 | docs/standards/templates/qr-guide.md | docs/templates/client-qr-guide.md（汎用化） | T | 2026-04-02 |
| 10 | docs/standards/checklists/deploy-checklist.md | docs/ops/vercel-deploy-checklist.md | C | 2026-04-02 |
| 11 | docs/standards/templates/hearing-template.md | products/ai-concierge/docs/delivery/02-hearing-template.md | T | 2026-04-02 |
| 12 | docs/standards/boilerplate/og-image-template.html | products/microscope/lp/public/og-template.html | B | 2026-04-02 |
| 13 | docs/standards/templates/revenue-model.md | （旧プロダクト由来。共有資産として独立） | T | 2026-04-02 |
| 14 | ~~docs/standards/templates/site-measurement.md~~ | **廃止（v16）** measure-site.mjs v4 が自動生成に置換 | T | 2026-04-10 |
| 15 | docs/standards/templates/hypothesis-verification.md | 新規作成（PC表P1#9a対応） | T | 2026-04-02 |
| 16 | docs/standards/templates/monitoring-design.md | 新規作成（PC表P1#9b対応） | T | 2026-04-02 |
| 17 | docs/standards/templates/performance-baseline.md | 新規作成（PC表P1#9c対応） | T | 2026-04-02 |
| 18 | docs/standards/checklists/seo-checklist.md | 新規作成（PC表P2#5-8対応） | C | 2026-04-02 |
| 19 | docs/standards/boilerplate/legal-template.html | products/ai-concierge/app/public/terms.html | B | 2026-04-02 |
| 20 | docs/standards/templates/marketing-tracker.xlsx | v1.1 xlsx移行（Session 169）/ 旧: marketing-tracker.md は deprecated | T | 2026-04-14 |
| 21 | docs/standards/templates/p4-measurement.xlsx | v1.1 xlsx移行（Session 169）/ 旧: p4-measurement.md は deprecated | T | 2026-04-14 |
| 22 | docs/standards/checklists/area-setup-checklist.md | 新規作成（運用エリア新設時の4点セット） | C | 2026-04-08 |
| 23 | ~~docs/standards/templates/components.md~~ | **廃止（v16）** measure-site.mjs v4 が components.json を自動生成に置換 | T | 2026-04-10 |
| 24 | docs/standards/checklists/thumbnail-golden-rules.html | サムネイル黄金律チェックリスト（3秒ルール/ココナラ/Fiverr/バナーCTR/視線誘導/出品物特性） | C | 2026-04-09 |
| 25 | docs/standards/boilerplate/thumbnail-master.html | サムネイル お手本 v2.0（全プロダクト共通の最初の1枚。中央集約型/1220x1240縦長/パープル×バイオレット×ゴールド/70:25:5/ジャンプ率211:119:43） | B | 2026-04-09 |
| 26 | docs/standards/templates/thumbnail-master-guide.md | サムネイル お手本 黄金律ガイド v2.0（#25の運用解説。5原則: 構図/配置/文字数/配色/階層。アクセント色分散禁止） | T | 2026-04-09 |
| 27 | ~~docs/standards/templates/abc-analysis-template.xlsx~~ | **廃止（Session 169）** monetization.xlsx の abc-analysis シートに統合。SSoT 一元化のため単独VESTは削除 | T | 2026-04-14 |
| 28 | monetization.xlsx（repo root） | **マネタイズ作戦 SSoT**（Session 169 新設、repo root 例外）。出品マスタ / 日次売上 / 履歴 / ABC分析 / カテゴリ / 戦略 / パイプライン / メモ の9シート統合。scripts/monetization/build.py で生成、sync.py で更新 | 運用 | 2026-04-14 |
| 29 | docs/standards/templates/coconala-listing-writer.md | **ココナラ出品文ライター ロールプロンプト v1.0**（ディープリサーチ結果＋会話文脈の製品情報から出品文フルセットを成形するロール。`create-text` スキル STEP 2「Claude Code 内ベスプラ参照」の対象） | T | 2026-04-19 |
| 30 | docs/standards/checklists/lp-golden-rules-checklist.md | **LPコピー黄金律チェックリスト**（VWO/Landingi/Unbounce 3ソース横断・8ブロックA〜H・39項目。LP実装前後のコピー自己点検。products/homepage/anthropic-t5 由来を汎用化昇格） | C | 2026-07-06 |
| 31 | docs/standards/templates/lp-golden-rules-guide.md | **LPコピー黄金律 統合ガイド**（#30の根拠。3出典URL・Rule of One/見出し/本文/社会的証明/CTA・実証データ・日本語言い換え例。旧 lp-design-sop.md §4 の違反例→修正例を吸収） | T | 2026-07-06 |
