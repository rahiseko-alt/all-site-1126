# 全製品横断調査レポート — 2026-06-11

> 実走: 横断調査エージェント 5 体並列（sonnet・read-only）/ 対象: products/ 配下 19 製品
> 対応 plan: `~/.claude/plans/nested-toasting-quilt.md`（資産化 plan）
> 専門用語を避けた日本語で記載。根拠 path は各グループ調査の原文に基づく。

## 1. 結論サマリ

| 問い | 答え |
|---|---|
| 毎回共通している部分 | ガバナンス書類一式・デプロイ設定・シークレット検査スクリプト・技術構成 5 型 |
| 毎回ゼロから試行錯誤している部分 | UI の見本探しと作り直し・データ保存先の途中変更・LP / Worker の同型コード |
| 定型化できる部分 | 新規プロダクト雛形（product-scaffold）+ 新規開発スキル（new-product）として今回作成 |
| 定型化できない部分 | §5 に理由付きで一覧化 |

## 2. 毎回共通している構成・技術・作業

### 2-1. ガバナンス書類一式（全 19 製品共通）

全製品が同じ「管理書類セット」を持っています。これは既に統一されており、新規製品でもそのまま流用すべき型です。

| ファイル | 役割 | 実態 |
|---|---|---|
| CLAUDE.md | その製品のルールブック（自治憲法） | 全製品に存在。共通ルール 6 本を参照する書き出しが全製品で同一 |
| memory.md | 引き継ぎメモ（P1〜P4 の 4 段構造） | 全製品に存在。ただし P1 が空の製品が多数 |
| failures.md | 失敗の記録 | 全製品に存在。**ほぼ全製品で空**（後述の課題） |
| hypotheses.md / runbook.md / cost-config.md / backup-config.md / risk-diagnosis.md | 仮説・運用手順・費用・バックアップ・リスクの台帳 | 概ね全製品に存在。雛形のまま未記入の製品もある |
| .claude/hooks/ | 自動ガード（誤操作防止の仕組み） | 中央から全製品へ自動配布済み（propagate-hooks） |

### 2-2. 重複コピーされているコード・設定（共通化の最有力候補）

| 重複物 | 重複箇所 | 状況 |
|---|---|---|
| `scripts/check-secret-patterns.mjs`（秘密情報の検査スクリプト） | **10 箇所以上**（ai-concierge / aiueo×2 / coach / code-review-skills / foodee / homepage / kobaraku / learning-suite-kanji×2 / omotenashi-trainer / review-analysis / ymm-shorts ほか） | coach と code-review-skills は diff ゼロの完全同一を確認。1 箇所変更すると他が古くなる構造 |
| `vercel.json` のセキュリティヘッダー 5 種 | ai-concierge / aiueo / foodee / homepage | ほぼ同一ブロックの個別コピー |
| `worker/src/index.js`（Cloudflare の保存サーバー） | shiota-karte / trimmer-system | 同型の読み書きロジックを別々に保守 |
| `site/` LP 4 ファイル構成（index/script/styles/robots+sitemap） | shiota-karte / trimmer-system | 全く同一構造 |
| `svelte.config.js` / `app.html` / TraceCanvas 等のコンポーネント | learning-suite-kanji ⇔ kanji-foreign | 1 行差分レベルのコピー。漢字データも二重管理 |
| Sentry（エラー監視）初期化 | ai-concierge / aiueo | 独立導入でパターン未共有 |

### 2-3. 技術構成は 5 型に収斂

19 製品の作り方は実質 5 パターンしかありません。新規開発はこの 5 型から選ぶだけで大半が決まります。

| 型 | 中身 | 採用製品例 |
|---|---|---|
| (a) 単一 HTML 型 | 1 つの HTML に全部入り。サーバー不要 | omotenashi-trainer / renai-game / coach / shift-ai / homepage |
| (b) React+Vite 型 | 画面部品を分割する近代的構成 + Vercel | ai-concierge / aiueo / kobaraku |
| (c) SvelteKit 型 | 同上の Svelte 版（GitHub Pages / Cloudflare） | learning-suite-kanji / kanji-foreign / new-trimmer-system |
| (d) Cloudflare Workers+KV 型 | 保存機能つき軽量アプリ | shiota-karte / trimmer-system / new-trimmer-system |
| (e) GAS 連携型 | Google スプレッドシート等をバックエンドに使う | renai-game / google-system-dev（review-analysis に痕跡） |

### 2-4. 共通する作業パターン

- デプロイ先は Vercel（多数）/ Cloudflare（coach・トリマー系・kanji-foreign）/ GAS の 3 系統に集約
- カスタムドメインは `{product}.kouheikosehira.com` 方式で統一運用
- UI 着手時は競合・参考サイトのクローンから始める（手順は web-design スキルが正本）

## 3. 毎回ゼロから試行錯誤している部分

| パターン | 実例 | 損失 |
|---|---|---|
| UI の作り直し反復 | foodee: app-v0〜v9 の 9 回 / homepage: preview 3 バリアント / new-trimmer: mock 8 本 / shift-ai: v2 併存 | 試行版ファイルが tmp/ 等に残骸化 |
| データ保存先の途中変更 | foodee: localStorage→Supabase→Firebase の 2 回変更 / kanji-foreign: SQLite/WASM 撤退 | スクリプト・設定の書き直し |
| ホスティングの揺れ | coach: Cloudflare→GitHub Pages→Cloudflare の 3 回変更 | デプロイ手順の再構築 |
| 製品の起こし直し | trimmer-system v3 中止→new-trimmer-system 別フォルダ再構築 / shiota-karte は trimmer の物理コピーから分岐 | 同型コードの二重保守化 |
| 運用書類の形骸化 | failures.md がほぼ全製品で空・失敗は CLAUDE.md 運用メモに流れている / memory.md P1 空が多数 | 設計（専用ファイル）と実態（運用メモ）のズレ |

## 4. 定型化した成果物（今回作成）

| 成果物 | 場所 | 中身 |
|---|---|---|
| product-scaffold 雛形一式 | `docs/standards/templates/product-scaffold/` | CLAUDE.md 雛形・memory.md・failures.md・runbook.md ほか + vercel セキュリティヘッダー雛形 |
| new-product スキル | `~/.claude/skills/new-product/` | 「新製品作って」で発火。雛形コピー + 5 型プリセット選択 + hooks 配布まで一括 |
| 共通 CLAUDE.md | （新規作成せず） | 既に共通憲法 + 自治憲法の 2 層が存在するため再作成不要 |

## 5. 定型化できない部分（理由付き一覧）

| # | 定型化できない部分 | 理由 |
|---|---|---|
| 1 | UI デザインの参照対象選定（どのサイトを見本にするか） | 製品ごとに競合・客層が異なり、見本の正解が毎回変わる。**手順自体**は web-design スキル（10 ステップ）で既に定型化済みなので、残るのは選定判断のみ |
| 2 | データ保存先（DB / 認証）の選定 | 要件・費用・利用規約に依存（例: foodee は規約と費用で 2 回変更）。事前に 1 つに固定すると逆に手戻りが増える。5 型プリセットで「選択肢の幅」までは定型化した |
| 3 | GAS / YMM4 GUI 等の特殊環境の作業 | 実行環境が一点物（Google 内部・Windows GUI 自動化）で、他製品に転用できる共通部品が抽出できない |
| 4 | 顧客固有要件の解釈 | 当事者要望書 = ペイン一次資料の原則どおり、要望の解釈は毎回その顧客の文脈でしか決められない（定型化すると素人案の鵜呑みになる） |
| 5 | アイデア検証（P0 の Go/No-Go 判断） | 市場・競合の根拠は製品ごとに調査が必要。手段（deep-research スキル・G-P0 ゲート）は定型化済みで、判断そのものは定型化対象外 |

## 6. 次の打ち手候補（本 plan 範囲外・参考）

1. `check-secret-patterns.mjs` の単一正本化（vibe-base/scripts/ 正本 + propagate 配布）— 重複 10 箇所の解消
2. failures.md 運用の機械強制（Check-out 時に空のままなら警告する hook）— 形骸化の根本対策
3. shiota-karte / trimmer-system の共通 Worker 部品抽出 — 二重保守の解消
