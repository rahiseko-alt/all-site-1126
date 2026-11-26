> ⚠️ 要点は `.claude/rules/research-bank.md` で自動注入される。ここは詳細版。

# Research Bank 運用ルール v2.0

> セッション中に収集・生成した全リサーチ資産を共有データバンクに一元蓄積するためのSOP。
> ディープリサーチ結果・CSS計測値・競合スクショ・比較表・再利用スクリプト等、種別を問わず全てここに入る。
> スキル: `.claude/skills/deep-research/SKILL.md` から参照される。
> 旧ルール: `memory/feedback_save-session-artifacts.md`, `memory/feedback_preserve-reusable-scripts.md` の内容を統合。正本は本SOP。

---

## §0. 設計思想

セッション成果物は使い捨てではなく資産である。1回のP0調査で得た市場データも、LP制作時のCSS計測値も、検証スクリプトも、同じデータバンクに入れる。次のプロダクトで「飲食系LPの参考ある？」と聞いたらタグ検索1発で出る状態が正解。

### 4原則

1. **全部入れろ:** リサーチデータ・CSS計測・スクショ・比較表・スクリプト — 種別を問わず全てResearch Bankに登録
2. **1テーマ1ファイル:** 同一テーマの再調査は新規作成ではなく既存エントリの更新
3. **ソース必須:** 数値データにはソース（出典・年）を紐付け。計測値は計測手法・対象URLを明記
4. **再利用前提:** `reusableFor` フィールドで他プロダクトへの流用用途を明示

### なぜ分けない?

分けると「市場データはresearch-bank、CSSはtmp、スクリプトはscripts、比較表はdocs」→ 散在して横断検索できない → 活用されない資産が出る。LP作るとき「根拠→デザイン参考→分析」と3箇所回る羽目になる。1箇所に全部入れればタグで切れる。

---

## §1. ファイル構成

```
docs/research-bank/
├── index.html                       ← カタログ（検索・タグフィルタ付きUI）
├── {topic}-{YYYY}.html              ← リサーチレポート
├── {topic}-{YYYY}.md                ← 調査結果・比較表
├── {topic}-{YYYY}.json              ← CSS計測値・APIレスポンス等の構造化データ
├── {topic}-{YYYY}.mjs               ← 再利用スクリプト
├── img/                             ← スクリーンショット・参考画像
│   └── {topic}-{YYYY}-{desc}.png
└── ...
```

### 命名規則
- `{テーマのkebab-case}-{調査年}.{ext}`
- 例: `chatbot-market-2026.html`, `studio-css-measure-2026.json`, `aesop-css-measure-2026.json`, `puppeteer-link-checker-2026.mjs`
- スクリーンショット: `img/{サイト名}-{viewport}-{YYYY}.png`（例: `img/studio-1440-2026.png`）

---

## §2. 保存対象（何をデータバンクに入れるか）

| 種別 | 例 | 推奨形式 |
|------|-----|---------|
| 市場調査 | 市場規模・成長率・導入率・障壁データ | HTML |
| 競合調査 | 機能比較表・価格比較・差別化分析 | HTML / MD |
| デザイン参考 | 参考サイトのスクショ・CSS計測値・レイアウト分析 | JSON + PNG |
| 価格調査 | 相場・課金モデル・WTP・プラットフォーム出品データ | HTML |
| 技術調査 | フレームワーク比較・API仕様・アーキテクチャ検討 | MD |
| 法務調査 | 判例・利用規約分析・コンプライアンス要件 | MD |
| 比較表 | 機能棚卸し・競合比較・Before/After | HTML |
| 再利用スクリプト | Puppeteer計測・リンク検証・スクショ撮影・データ抽出 | MJS |
| UX調査 | 画面フロー分析・ユーザビリティ評価・操作パターン | MD / HTML |

**判断基準:** 「次回以降のセッションで再利用する可能性があるか？」→ Yesなら保存対象。

---

## §3. データモデル

`index.html` 内の `BANK.entries` 配列が正本。各エントリ:

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Y | ファイル名から拡張子を除いたもの |
| title | string | Y | 日本語タイトル |
| description | string | Y | 1-2行の説明 |
| date | string | Y | 作成/更新日 YYYY-MM-DD |
| tags | string[] | Y | §4タグ体系から選択 |
| products | string[] | Y | 関連プロダクト名。横断なら ["all"] |
| reusableFor | string[] | Y | 他で流用できる用途を具体的に |
| sources | number | Y | ソース数（スクリプトは0可） |
| file | string | Y | research-bank内のファイル名 |
| originalPath | string\|null | N | 元ファイルのパス（移行元がある場合） |

---

## §4. タグ体系

| タグ | 用途 | 例 |
|------|------|-----|
| market | 市場規模・成長率・トレンド | TAM/SAM/SOM、CAGR |
| competitor | 競合サービス・差別化 | 機能比較、価格比較 |
| pricing | 価格設定・課金モデル | 相場調査、WTP分析 |
| tech | 技術選定・アーキテクチャ | フレームワーク比較、API選定 |
| ux | UI/UX・ユーザー行動 | 画面設計、ユーザビリティ |
| platform | 販路・プラットフォーム | ココナラ/CW/ランサーズ分析 |
| legal | 法務・規制・コンプライアンス | 利用規約、個人情報保護 |
| design | デザイン参考・CSS計測・レイアウト分析 | 参考サイトCSS実測値、スクショ |
| script | 再利用スクリプト・計測ツール | Puppeteer計測、リンク検証 |

---

## §5. 運用フロー

### 5-1. 新規リサーチ（`/deep-research` 経由）
1. スキル実行 → レポート生成
2. `docs/research-bank/` に保存
3. `index.html` の `BANK.entries` に追加

> **area-gate bypass マーカー**: research-bank への書込は `area-gate.mjs` hook が `index.html` / `.gitkeep` 以外すべてブロックする（手動書込防止）。`/deep-research` がレポート本体 `{name}.html` を Write する際は、Write 直前に bypass マーカー `docs/research-bank/.allow-research-write` を `touch` で生成する（600 秒 TTL・mtime 判定・既存 `.allow-destructive` と同形）。マーカーは gitignored・transient token でコミット対象外。手動書込はマーカー未生成のため依然ブロックされる（AI 自己規律に依存しない機械強制）。

### 5-2. セッション成果物の保存（EXIT前義務）
1. **EXIT前チェック:** 「このセッションで作った成果物のうち、次回以降に再利用する可能性があるものは全てBankに入れたか？」を自問
2. 対象: 設計表・比較表・CSS計測値・スクリプト・スクショ・調査結果など
3. `docs/research-bank/` にファイル保存 + `index.html` エントリ追加
4. memory.mdにはファイルパスへの参照を記載（原本はBank、要約はmemory.md。二重書き込み禁止）

### 5-3. 既存エントリの更新
1. 同一テーマのエントリが存在するか `BANK.entries` で確認
2. 存在する → 既存ファイルを更新、`date` を更新
3. `index.html` の該当エントリも更新

### 5-4. 参照（他プロダクトから）
1. `docs/research-bank/index.html` の `BANK.entries` を検索（タグ or キーワード）
2. 該当エントリの `file` パスからデータを読む
3. 引用時はソース情報も含める

---

## §6. 品質基準

### リサーチレポート（market/competitor/pricing/tech/legal/ux/platform）
- 全数値にソース（調査名・発行元・年）が紐付いていること
- 平均値のみ禁止。中央値・最頻値・分布も併記
- 「一般的に〜」「〜と言われている」は根拠不足として却下
- 1次ソース（政府統計・業界団体・調査会社）を優先
- レポート単体で第三者が意思決定できる完結性

### デザイン参考（design）
- CSS計測値は対象URL・計測日・ビューポートを明記
- スクリーンショットは3VP（1440/768/375）で撮影
- 計測手法（Puppeteer/DevTools/目視）を記載

### スクリプト（script）
- ファイル冒頭に用途・使用方法・依存関係をコメントで記載
- 汎用化（ハードコードされたURL・パスを引数化）

---

## §7. 禁止事項

- 同一テーマの重複作成（既存を更新せよ）
- **Research Bankに登録せずにリサーチ成果物を散在させること**（tmp/・products/{product}/docs/ 等に置きっぱなしにするな）
- ソースなし数値の記載
- `index.html` の `BANK.entries` とファイル実体の不整合
- memory.mdに原本を書いてファイル保存しないこと（原本=Bank、要約=memory.md）
- セッション終了時にBank登録を忘れること

---

v2.0 | 2026-03-28 | v1.0からの変更: セッション成果物全般を統合（design/scriptタグ追加、EXIT前保存義務、保存対象表、品質基準を種別ごとに分離）。旧メモリ2件(feedback_save-session-artifacts, feedback_preserve-reusable-scripts)の内容を吸収
v1.0 | 2026-03-28 | 初版作成（ディープリサーチ結果のみ対象）
