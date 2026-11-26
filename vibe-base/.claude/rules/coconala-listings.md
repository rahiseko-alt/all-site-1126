---
description: ココナラ出品資産の管理ルール
paths:
  - "**/listings/**"
  - "**/video/out/**"
---

## 保管場所（プロダクト別）
- AI Answer: `products/ai-concierge/listings/`
- 他プロダクトのlistings/に書くな。プロダクト境界を守れ

## ディレクトリ構成
```
listings/{plan}/
├── text.md          ← 出品テキスト（上書き式。ココナラ掲載中と常に一致）
├── thumbnail.html   ← サムネイル（HTML→PNG書き出し）
└── images/          ← 紹介画像（HTML→PNG書き出し）
    ├── 01-xxx.html
    └── ...

video/out/
├── live/            ← ココナラに掲載中の動画
└── archive/         ← 旧版・未使用の動画
```

## 更新手順

### 原稿を更新する時
1. `text.md` を直接編集（上書き）
2. コミット。メッセージに改訂理由を書く
3. マスターがココナラ管理画面に反映

### 動画を入れ替える時
1. Remotionで新版をレンダリング → `video/out/` に出力される
2. `live/` の旧版を `archive/` に移動（ファイル名に日付を付けてよい。例: `dify-dsl-20260407.mp4`）
3. 新版を `live/` に移動
4. コミット

### 画像を入れ替える時
1. `listings/{plan}/images/` 内のHTMLを編集 or 新規作成
2. 不要になった画像は削除（gitに履歴あり）
3. 番号（01-, 02-...）はココナラ掲載順と一致させる
4. コミット

### サムネイルを入れ替える時
1. `thumbnail.html` を直接上書き
2. コミット

## 禁止事項
- tmp/ にココナラ出品関連ファイルを置くな。listings/ に入れろ
- AI AnswerとDify-Serviceの資産を混在させるな
- 旧版ファイル（text-v1.md等）を作るな。差分はgit履歴で追え

## 作業開始時の必読資産
listings/ 配下で作業を開始したら、以下を最初に読め:
1. `monetization.xlsx` の catalog シート（価格・コードネームの正本。Readツール不可。`python -c "import sys; sys.stdout.reconfigure(encoding='utf-8'); import openpyxl; wb=openpyxl.load_workbook('monetization.xlsx'); ws=wb['catalog']; [print('\t'.join([str(c.value or '') for c in r])) for r in ws.iter_rows()]"` で読め）
2. `docs/standards/coconala-listing-handbook.html`（景品表示法・NG表現。文章作成前に必ず照合）
3. `journal/monetization/dashboard.html`（マネタイズ全体状況）
4. `journal/monetization/drafts/2026-04-14-abc-analysis-full80.html`（競合価格帯・カテゴリ分析）

## 出品計画サイクル（13段階 SOP）
- 新規出品・再出品・マーケ対策の反復は `docs/ops/listing-cycle.md` の13段階サイクルに従え
- ①市場調査→②ひな形記載→③AI分析→④マスター判断→⑤MVP→⑥仮想やり取り→⑦試用→⑧全体イメージ→⑨文章作成→⑩素材→⑪出品→⑫記録→⑬販売分析→②に戻る
- 散財防止: 順序スキップ禁止。ゲート1(④)・2(⑨)・最終(⑪)で必ずマスター承認
- 成果物3分類（VEST化／プロダクト資産／破棄）を出品完了時に必ず実施
- 詳細: `docs/ops/listing-cycle.md`
