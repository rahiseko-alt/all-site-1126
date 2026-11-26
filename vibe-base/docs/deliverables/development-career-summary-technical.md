# 開発経歴書（技術者向け）

## 希望ポジション

AI活用型フルスタック / 業務自動化プロトタイプエンジニア

想定ロール:

- AI開発基盤・業務自動化エンジニア
- 生成AI PoC / 社内DX プロトタイピング担当
- Webサービス試作 / LP・資料生成・自動化パイプライン担当

現時点では、テックリードや大規模SaaSの中核バックエンド専任というより、0→1の検証、AI活用、業務自動化、開発基盤整備に強いポジションが合います。

## 職務要約

Vibe*base ワークスペースで、AI agent governance、複数プロダクト、Web/LPデモ、slide/deck生成、自動化パイプライン、RAG/data分析、browser/test/deploy infra を横断的に開発・運用しています。

主な開発対象は `.claude` / `.codex` / `products` / `scripts` / `portfolio` / `agent-ag` です。単体アプリではなく、AI共創型の開発基盤、検証基盤、制作基盤、運用基盤をまとめて構築しています。

## A/B inventory から見た開発物

- A: ディレクトリ単位の開発物リスト。トップレベルディレクトリと `products` 配下31件を確認済み。
- B: 開発物単位の集約リスト。重複する開発物はカテゴリごとに規模、重複数、該当ディレクトリを整理済み。

## 代表プロジェクト

### 1. AI agent governance / verification 基盤

AIエージェントを単なる補助ツールとして使うのではなく、開発フローの一部として管理する基盤を整備しています。

実装者、機械検証、ロジックレビュー、セキュリティレビュー、仕様監査、UX品質レビューを分離し、Worker / Evaluator 分離の形で運用しています。

主なディレクトリ:

- `.claude/agents`
- `.claude/hooks`
- `.claude/rules`
- `.codex/agents`
- `.codex/hooks`
- `docs/standards/verification-panel.md`
- `scripts/check-agents-spec.mjs`
- `scripts/sync-codex-agents-from-claude.mjs`

規模:

- `.claude/agents`: 12 agents
- `.claude/hooks`: 約24 hooks
- `.claude/rules`: 約27 rules
- `CLAUDE.md`: products配下31件
- `memory.md`: products配下31件

技術・設計:

- Plan Mode
- hook gate
- verification panel
- Worker / Evaluator separation
- Codex / Claude Code agent mirror
- destructive command / secret / rules coverage gate

### 2. Product applications 群

`products` 配下に31件の開発領域があります。用途は、AI相談、Webアプリ、学習、RAG、投稿自動化、動画制作補助、レビュー分析、ゲーム、資料生成などです。

代表ディレクトリ:

- `products/ai-concierge`
- `products/x-auto-post`
- `products/learning-suite-kanji-foreign`
- `products/new-trimmer-system`
- `products/medguide-rag`
- `products/shift-ai`
- `products/ymm-shorts`

技術:

- React
- Svelte/Vite
- SvelteKit
- Cloudflare Workers
- Vercel
- PocketBase
- Supabase
- Python
- Chroma
- Godot / GDScript

現時点の証拠:

- 31 product directories
- productごとの `CLAUDE.md` / `memory.md`
- 複数 product に `package.json`, `requirements.txt`, `wrangler.toml`, `src`, `tests`, `docs`

### 3. Automation / scripting pipelines

日次運用、投稿、動画制作、画像差し替え、検証、同期、ビルド、secret check を支えるスクリプト群を整備しています。

主なディレクトリ:

- `scripts`
- `scripts/_lib`
- `scripts/git-hooks`
- `scripts/monetization`
- `scripts/replicate-generate`
- `scripts/style-extractor`
- `products/x-auto-post`
- `products/instagram-auto-ops`
- `products/ymm-shorts`

規模:

- `scripts`: 約60 files
- `.mjs`: 約41
- `.sh`: 約6
- `.ps1`: 1
- `.py`: 1
- product automation pipelines: 複数

技術:

- Node.js
- Python
- PowerShell
- shell scripts
- GitHub Actions

### 4. Web / LP / interaction demos

Web表現、LP、clone、GSAP/WebGL/Three.js デモを多数制作しています。営業デモ、UI検証、表現技術の試作として利用できます。

主なディレクトリ:

- `portfolio`
- `agent-ag`
- `products/homepage`
- `products/coach`
- `products/review-analysis/lp`

規模:

- `portfolio`: 32 dirs
- `agent-ag`: 40+ dirs
- HTML demo / clone / WebGL / GSAP / Three.js 系多数

技術:

- HTML / CSS / JavaScript
- GSAP
- WebGL
- Three.js
- Anime.js
- responsive UI

### 5. Slide / deck / document generation

AI講座、営業資料、HTMLスライド、PPTX、Google Slides 生成の制作環境を整備しています。

主なディレクトリ:

- `products/google-slides-gen`
- `products/shift-ai`
- `slides`
- `assets/slides`
- `docs/html-toranomaki`
- `outputs/edge-slide-*`
- `outputs/edge-apple-slide-*`

規模:

- slide/debug dirs: 50+
- HTML/PPTX/Google Slides 系成果物多数

技術:

- Python
- Google Slides API
- HTML slides
- PPTX
- browser screenshot verification

## 開発物カテゴリ別一覧

| 開発物カテゴリ | 重複数・規模 | 該当ディレクトリ |
|---|---:|---|
| agent governance / skills / hooks | `.claude/agents` 12体、`.claude/hooks` 約24、`.claude/rules` 約27、`CLAUDE.md` x31、`memory.md` x31 | `.claude`, `.codex`, `.agents`, `.codebuddy`, `docs/standards`, `docs/rules`, `docs/ops` |
| product applications | products: 31 | `products/*` |
| LP / Web / interaction demos | `portfolio` 32 dirs、`agent-ag` 40+ dirs | `portfolio`, `agent-ag`, `products/homepage`, `products/coach`, `products/review-analysis/lp` |
| slide / deck systems | slide/debug dirs 50+、HTML/PPTX/Google Slides系多数 | `products/google-slides-gen`, `products/shift-ai`, `slides`, `assets/slides`, `docs/html-toranomaki`, `outputs/edge-slide-*`, `outputs/edge-apple-slide-*` |
| automation / scripting pipelines | `scripts` 約60 files、product automation 複数 | `scripts`, `products/x-auto-post`, `products/instagram-auto-ops`, `products/ymm-shorts`, `tools`, `.github/workflows` |
| RAG / data / research / analysis | 6+ major areas | `products/medguide-rag`, `products/databank`, `products/review-analysis`, `products/code-review-skills`, `analysis`, `docs/research-bank`, `journal` |
| browser / test / deploy infra | browser/debug output 多数、fixture多数 | `.playwright-mcp`, `.chrome-for-testing`, `tests`, `test-results`, `.vercel`, `.wrangler`, `.serena`, `.github/workflows`, `outputs/edge-*` |
| generated outputs / assets | `outputs` 83 dirs、`tmp` 40 dirs | `outputs`, `tmp`, `assets/generated-images`, `assets/octa`, `test-results`, `portfolio/.vercel`, `.vercel`, `.wrangler` |
| backups / archive / scratch | `backups` 9 dirs、`archive` 5 dirs | `backups`, `archive`, `scratch`, `tmp` |
| game / 3D / visual systems | 5+ areas | `products/spire-lite`, `outputs/blender-*`, `outputs/dancing-3d-avatar`, `portfolio/threejs-*`, `portfolio/webgl-*`, `tools/blender` |

## 技術スタック

### Frontend

- React
- Svelte/Vite
- Svelte / SvelteKit
- Vite
- Tailwind CSS
- HTML / CSS / JavaScript
- GSAP / WebGL / Three.js

### Backend / Edge / App Infra

- Cloudflare Workers
- Vercel Functions / Vercel hosting
- PocketBase
- Supabase
- n8n
- Python service scripts

### Automation / Tooling

- Node.js
- Python
- PowerShell
- shell scripts
- GitHub Actions
- Wrangler
- Playwright MCP

### AI / Agent Ops

- Claude Code agents
- Codex agents
- custom skills
- hook gates
- verification panel
- plan / memory / runbook based governance

### Testing / QA

- Playwright
- Vitest
- fixture-based hook tests
- browser screenshot verification
- secret / destructive-command / rules coverage gates

### Data / RAG / Research

- Chroma
- JSON / CSV datasets
- research-bank
- analysis reports
- review-analysis pipelines

## 強み

- 仕様が曖昧な段階から、動くPoCや業務ツールに落とし込める
- AIエージェントを開発フローに組み込み、検証分離まで設計できる
- Web、資料生成、投稿自動化、RAG、ブラウザ検証を横断して扱える
- 生成物、検証出力、バックアップ、archive を分離して運用できる
- Playwright / Cloudflare / Vercel / Wrangler を含む軽量な検証・deploy環境を構築できる

## 現時点で追加提示が必要な証拠

以下は、シニアエンジニア、テックリード、大規模SaaS中核担当として評価されるには追加で提示が必要です。

- 商用プロダクトの本番運用実績
- ユーザー数、売上、CV改善、工数削減などの成果指標
- 障害対応、監視、セキュリティ運用の記録
- チーム開発での役割、レビュー、設計責任
- GitHub、デモURL、代表作3件の実物
- コード品質と保守性を確認できる代表リポジトリ

## 能力カード（案件当てはめ用）

複数案件に串刺しで使う、能力単位の独立カード。応募時はこの中から該当するカードを選び、「本案件への当てはめ」を3〜5行で追記する運用。

> **図＋説明・動くデモリンク付きのケース集は [portfolio.html](portfolio.html) を参照**（Case 01〜10・導入/伴走の進め方・サンプル成果物）。

| 能力名 | 一言（非エンジニア向け） | 実装技術 | 案件タグ | 実物 |
|---|---|---|---|---|
| 出典追跡RAG | AIの回答がどの文書のどの箇所に基づくか追跡できる仕組み | LangChain/LangGraph, Chroma(cosine), e5多言語埋め込み, pypdf+RecursiveCharacterTextSplitter | RAG, ベクトル検索, 出典管理, ハルシネーション対策 | `products/medguide-rag/src/rag`, `notebooks/03-rag-walkthrough.ipynb` |
| LLM独立評価 | AIの回答を別のAIでダブルチェックする仕組み | LLM-as-judge（根拠忠実性／質問直接性／誤情報なしの複数視点採点） | LLM評価, ハルシネーション検知, QA品質保証 | `products/medguide-rag/src/eval` |
| データ健全性チェック | データ分析結果が医学的定説と矛盾していないか自動照合 | pandas, scikit-learn(Logistic Regression), 出典付きサブエージェント定説照合 | データ分析, 統計, 機械学習分類, 可視化 | `notebooks/01-foundations.ipynb`, `notebooks/02-baseline-model.ipynb` |
| プロンプト制御 | AIに必ず出典付きで答えさせ、答えられない時は「わからない」と言わせる制御 | ChatAnthropic(Claude), LangGraphステートマシン, 引用形式強制プロンプト設計 | プロンプトエンジニアリング, LLM API統合, 日本語対応 | `products/medguide-rag/src/rag` |
| 音声認識（二系統ASR） | 音声を文字に起こす仕組み。ネット無しでも鍵ありでも動く | faster-whisper(ローカル), Groq whisper-large-v3-turbo(クラウド), 鍵有無で自動フォールバック | 音声認識, ASR, Whisper, ローカルAI | `products/kosespark`（video-shorts） |
| 用語補正 | 文字起こし後の専門用語・固有名詞を客ごとに正しく直す仕組み | term-corrections.json（客別辞書）, reverse-match（時刻確定） | NLP後処理, 用語正規化, カスタム辞書 | `products/kosespark` |
| 動画音声パイプライン | 動画から音声を取り出し、文字にして、補正して使える形にする一連の流れ | 音声抽出→ASR→補正→出力の連結処理 | 動画処理, メディアパイプライン | `products/kosespark` |
| ローカルAI統合 | クラウドの鍵が無くてもローカルだけで動く設計 | faster-whisperローカル実行＋クラウドAPIとのハイブリッドフォールバック | ローカルAI, オンプレ対応, コスト最適化 | `products/kosespark` |

*kosespark 由来の4枚は medguide-rag 側セッションでの過去調査（memory.md記載）に基づく。kosespark 側での実物再検証は未実施。*

## 採用上の見せ方

この経歴は、技術を広く触った人としてではなく、次の職能に絞って見せるのが適切です。

- AI開発基盤・業務自動化エンジニア
- AI活用型フルスタックプロトタイプエンジニア
- 社内DX / PoC / 営業デモ開発担当
- Web制作と自動化をつなぐ実装担当

大規模SaaSの中核バックエンド担当として出すより、AI活用、業務自動化、プロトタイピング、検証基盤整備の文脈で出した方が強みが伝わります。
