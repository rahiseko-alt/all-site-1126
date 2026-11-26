# RULES.md — HTML虎の巻 書き方・運用ルール

本ファイルが権威ソース。各テーマの concept.md・research-log.md・impl-*/ はすべて本ルールに従う。

| 層 | ファイル | 更新方針 | 陳腐化速度 |
|----|---------|---------|-----------|
| 概念層 | concept.md | 上書き可（技術が変われば書き換える） | 低 |
| 手法層 | research-log.md | 追記のみ（調査履歴を蓄積） | 中 |
| 実装層 | impl-{lib}-{ver}/ | バージョンごとにフォルダを分ける | 高 |

---

## 1. concept.md

### 必須 H2 セクション

| # | セクション名 | 内容 |
|---|------------|------|
| 1 | N つのコア技術 | 技術名・解説・出典（`（出典: ファイル名 L行番号）`） |
| 2 | アーキテクチャ概要 | CDN・エントリポイント・主要クラス |
| 3 | シーン設計 | 各シーンの視覚要素・色・アニメーション設定値をすべて列挙 |
| 4 | 初期失敗パターン | 省略可 |
| 5 | 既知の改善点 | 課題を箇条書き |

> [!WARNING]
> * 出典なしのコードブロック禁止（`（出典: ファイル名 L行番号）` が必須）
> * 調査日の記載禁止（concept.md に日付は書かない）
> * 300行超禁止

### 完成条件（補完ゼロ実装テスト）

concept.md は以下を満たすまで**未完成**とする。

> サブエージェントが concept.md **のみ**を参照して実装し、
> 「書かれていない」補完ゼロでブラウザ動作確認できること。

手順:
1. concept.md を書いたら impl を作成し下記コマンドを実行する
   `node scripts/toranomaki-blindtest.mjs {テーマ} {impl}`
2. EXIT 1 → FAIL の場合: concept.md の不足箇所を特定して追記 → 再実行
3. EXIT 0 → PASS → 完成

【落とし穴・必読】
- curtainsjs v8 は `type="module" + src/index.mjs` のみ有効
  (`build/curtains.min.js` は存在しない URL)
- playwright は `headless:false + --enable-gpu + --use-gl=angle` 必須
  (headless は WebGL 非描画)
- `type="module"` は `file://` 不可。ローカルサーバー経由必須

### テンプレート

    # concept.md — {テーマ名} 概念層

    ## N つのコア技術

    （出典: {ファイル名}「{節名}」節）

    ### 1. {技術名}
    **技術名**: {ライブラリ・クラス名}
    **素人向け解説**: {2〜3文で平易に説明}

    ---

    ## アーキテクチャ概要

    {アーキテクチャ名}: {ライブラリ + バージョン}
    CDN: {CDN URL}
    Entry: {エントリポイントファイル} | Style: {CSSファイル}
    Main class: {メインクラス名}
    （出典: {ファイル名} L行番号〜L行番号）

    ---

    ## シーン設計

    | シーン | 要素 | 設定値 |
    |--------|------|--------|
    | Scene1 | 背景色 | {カラーコード} |
    | Scene1 | {要素名} | {設定値} |
    | Scene2 | 背景色 | {カラーコード} |
    | Scene2 | {要素名} | {設定値} |

    アニメーション: {各シーンのrender loop内の動き}
    （出典: {ファイル名} L行番号〜L行番号）

    ---

    ## 初期失敗パターン（省略可）

    （出典: {ファイル名} L行番号〜L行番号）

    {失敗内容と教訓}

    ---

    ## 既知の改善点

    * **{改善項目}**: {内容}

---

## 2. research-log.md

### 固定ヘッダー（変更禁止）

    # research-log.md — 調査手法の蓄積ログ
    # 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

### エントリテンプレート

    ---
    ## [{YYYY-MM-DD}] {テーマ} 調査（{実施者}）

    ### {サブセクション名}
    {内容}

    ### {サブセクション名}
    {内容}

> [!WARNING]
> * 既存エントリの修正・削除禁止（追記のみ）
> * H2（`##`）はエントリのタイトル専用。サブセクションは H3（`###`）を使う
> * エントリの区切りは `---`（水平線）で統一

---

## 3. impl-{lib}-{ver}/

### 命名規則

* 形式: `impl-{小文字ライブラリ名}-{メジャー+マイナー}/`
* 例: `impl-threejs-r128/`、`impl-babylonjs-6.0/`
* `latest` 禁止（バージョンを必ず明記する）

### 必須ファイル構成

    impl-{lib}-{ver}/
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js

> [!WARNING]
> 既存フォルダへの上書き修正禁止。バージョンが変わる場合は新フォルダを作成する。

---

## 4. verbatim copy

| 対象 | コピー元 | コピー先 |
|------|---------|---------|
| Gemini 生成 .md | `backups/{YYYYMMDD}/` 内 .md | concept.md・research-log.md の各セクションへ引用（出典付き） |
| ソースコード | `backups/{YYYYMMDD}/active-theory-clone/` | `impl-{lib}-{ver}/` に一対一コピー |

> [!IMPORTANT]
> * バックアップ先行必須（バックアップなしでのコピー禁止）
> * 改変時は `// Modified from verbatim: {変更内容}` コメントを必ず付ける

---

## 5. backups/

### バックアップトリガー（3条件）

1. Gemini エージェントが原本 .md を生成した直後
2. 実装ソースを最初に `docs/` に配置する前
3. テーマを新規追加する前

### フォルダ命名

    backups/html-toranomaki-{YYYYMMDD}/

> [!CAUTION]
> * `backups/` を作業場所にしない（作業は `docs/html-toranomaki/{テーマ}/` で行う）
> * `backups/` を直接編集しない（バックアップは読み取り専用として扱う）

---

## 7. 読み方ルール（実装フロー）

concept.md を読んで実装するフローは以下の順序を厳守する。

    Step 1: コア技術を読む
      使う技術・ライブラリ・クラス名を把握する

    Step 2: アーキテクチャ概要を読む
      CDN・エントリポイント・主要クラスを確認する

    Step 3: シーン設計を読む
      画面に何を表示するか・色・アニメーション設定値を把握する

    Step 4: 初期失敗パターンを読む
      同じ失敗を避ける

    Step 5: そのまま実装する
      concept.md に書いていないことは実装しない
      不足があれば concept.md に追記してから実装する

    Step 6: ブラウザで動作確認する
      concept.md に書かれた動作がすべて再現できているか確認する

> [!IMPORTANT]
> concept.md に書いていないことを自己判断で補完することを禁止する。
> 補完が必要な場合は先に concept.md を更新する。

---

## 6. テーマ新規追加フロー（Add → Commit。3段ゲートは §8.7）

> [!CAUTION]
> **司令塔も canonical（`docs/html-toranomaki/{slug}/`）へ直接 mkdir / Write / Edit してはならない。**
> PreToolUse hook `toranomaki-generated-guard` が Claude の直書きを Deny する。新規テーマは
> **Add 領域で組み立て**、`node scripts/toranomaki-intake.mjs`（Commit）で blindtest 判定 → PASS のみ
> canonical へ昇格させる。canonical に物を入れる唯一の入口は intake（§8.7 の 3 段ゲート参照）。

第2弾以降のテーマを追加する際は以下の順序を厳守する。

    Step 1: バックアップ作成
      mkdir backups/html-toranomaki-{YYYYMMDD}/
      原本ファイルをコピー
      README.md にバックアップ日・対象テーマを記載

    Step 2: Add 領域にテーマフォルダ作成（旧: docs/ 直接 mkdir は廃止）
      mkdir .toranomaki-outbox/{slug}/          # 司令塔の Add 領域（ルート直下）
      meta.json を作成（slug,title,titleEn?,blurb,tags[],impl,portfolio）
      （product/agent-ag は各 {dir}/.toranomaki-outbox/{slug}/ を使う）

    Step 3: concept.md 作成（Add 領域内）
      RULES.md §1 のテンプレートから .toranomaki-outbox/{slug}/concept.md を作成

    Step 4: research-log.md 作成（Add 領域内）
      RULES.md §2 の固定ヘッダー + 第1エントリ

    Step 5: impl-{lib}-{ver}/ 作成（Add 領域内）
      verbatim copy（§4）・命名規則（§3）・バックアップ先行（§5）に準拠

    Step 6: Commit（intake が blindtest 判定 → PASS のみ canonical へ）
      node scripts/toranomaki-intake.mjs
      - blindtest PASS → docs/html-toranomaki/{slug}/ へ配置 + registry upsert
      - blindtest FAIL → 配置を rollback（canonical に残さない）。Add 領域の提出元は無傷
        なので concept.md の不足を補完して再 intake する。

      【落とし穴・必読】
      - curtainsjs v8 は type="module" + src/index.mjs のみ有効
        build/curtains.min.js・build/curtains.js は存在しない URL
      - playwright は必ず headless:false + --enable-gpu + --use-gl=angle で起動
        headless モードは WebGL を描画しない（toranomaki-blindtest.mjs が intake 内で自動実行）
      - type="module" は file:// プロトコル不可。ローカルサーバー経由必須（intake が自動起動）

    Step 7: Commit 確認
      node scripts/toranomaki-verify.mjs   # 三者一致（registry ↔ docs ↔ portfolio）EXIT 0

---

## 8. registry / ポートフォリオ統合 運用

虎の巻（社内・知識層あり）と Creative Portfolio Portal（公開・知識層なし）は**単一正本から 2 ビュー生成**する。
正本は `docs/html-toranomaki/registry.json`、公開ビューは `portfolio/creative-portfolio-portal.html` ＋ `portfolio/{slug}/`（旧 `agent-ag/` から移行済・別エージェント領域から切り離し）。

### 8.1 registry.json（単一正本メタ層）

| キー | 意味 |
|------|------|
| `slug` | テーマフォルダ名（kebab-case・`docs/html-toranomaki/{slug}/` と一致） |
| `title` / `titleEn` | ポータル表示名（日本語可）／英語ラベル（任意） |
| `blurb` | クライアント向け 1〜2 文紹介（**知識層を含めない**） |
| `tags` | 分類タグ配列 |
| `impl` | 公開対象 impl フォルダ名 |
| `portfolio` | `true`=ポータル公開 / `false`=虎の巻のみ |
| `order` | ポータル AUTO 区画の表示順（昇順） |
| `codeVisible` | 予約・常に `false`（下記 8.4） |

> [!WARNING]
> registry の書込は壊れ JSON での build/intake 連鎖崩壊を防ぐため `scripts/_lib/json-canary.mjs`
> 保護下で行う（正規ルートは `scripts/toranomaki-intake.mjs`）。`build-portfolio.mjs` は parse 失敗時に EXIT≠0 で停止する。

### 8.2 portfolio 3 状態（マスター発話で判定）

| 発話 | portfolio | 結果 |
|------|-----------|------|
| 「虎の巻に加えよう」 | `false` | 虎の巻のみ |
| 「ポートフォリオにも出しとけ」 | `true` | 虎の巻＋公開ポータル両方 |
| 後日「ポートフォリオに出して」 | `false`→`true` 昇格 | registry の該当 slug を true 化＋`order` 採番→`build-portfolio.mjs` 再実行 |

### 8.3 intake 経路（product / agent-ag → 司令塔）

product セッション・agent-ag（R&D 実験場）は中央 `docs/` に直接書けない。提出物を outbox に投函し、司令塔が回収する。
**intake ソースは2系統**: `products/{product}/.toranomaki-outbox/` と `agent-ag/.toranomaki-outbox/`（どちらも同一構造・同一エンジンが走査）。

    提出元（product / agent-ag）:
      {products/{product} | agent-ag}/.toranomaki-outbox/{slug}/
        ├── meta.json   { slug,title,titleEn?,blurb,tags[],impl,portfolio }
        ├── concept.md / research-log.md
        └── impl-{lib}-{ver}/
      → 報告は「提出済み・intake 待ち」。**追加完了を主張しない**（提出 ≠ 完了）。

    司令塔セッション:
      SessionStart hook (session-start-toranomaki.mjs) が pending を検出・通知（read-only・product/agent-ag 両系統）
      → node scripts/toranomaki-intake.mjs
         = 配置 → blindtest → registry 更新(json-canary) → build-portfolio
      → unstaged のまま終了

> [!CAUTION]
> intake は **auto-commit しない**。取込結果は unstaged で終了し、コミットは司令塔＋マスター承認のみ。
> SessionStart hook 自身は read-only（docs/registry/portfolio を一切書込まない）。

### 8.4 知識層秘匿（公開ビルドの原則）

公開ビルド（`build-portfolio.mjs`）は `portfolio/{slug}/` へ **impl の実行ファイル（index/css/js・静的アセット）のみ**コピーし、
**知識層（`*.md` ＝ concept.md / research-log.md / 技術解説）は一切コピーしない**。

> [!IMPORTANT]
> 秘匿対象は「知識層」であって「実行コード」ではない。実行 JS はデモ動作に必須でブラウザ上どうせ可視のため
> そのまま公開する。**コードの完全秘匿は物理的に不可**、という現実解。`codeVisible` は将来用予約で常に `false`。

### 8.5 ポータル完全 AUTO 生成（手動カード廃止・テンプレ＋registry）

`creative-portfolio-portal.html` は **生成物**であり、原本は 2 つに分離する。

| 原本（tracked・編集可） | 生成物（.gitignore・編集禁止） |
|------------------------|------------------------------|
| `portfolio/_portal-shell.html`（枠：head/CSS/header/footer/modal。手動カードゼロ・AUTO マーカーのみ） | `portfolio/creative-portfolio-portal.html`（shell＋registry から毎回完全生成） |
| `docs/html-toranomaki/registry.json`（カードの内容＝単一正本） | `portfolio/{slug}/`（impl の実行ファイルを複製） |

`build-portfolio.mjs` が `_portal-shell.html` の

    <!-- AUTO:registry-cards --> … <!-- /AUTO -->

区画へ registry 由来のカードを注入して portal を生成する。**手動カードは構造的に存在し得ない**（in-place 編集を廃止＝leak 封鎖）。

> [!WARNING]
> `portfolio/{slug}/` と `creative-portfolio-portal.html` への直接 Write/Edit は PreToolUse hook（`portfolio-generated-guard`）が Deny する。
> 修正は **必ず原本**（registry.json / 各テーマの `docs/html-toranomaki/{slug}/{impl}/` / `_portal-shell.html`）に対して行い、`node scripts/build-portfolio.mjs` で再生成する。
> 三者一致は `node scripts/toranomaki-verify.mjs`（EXIT 0）で機械検証する。

### 8.6 デプロイ（portfolio.kouheikosehira.com 単一経路）

公開先 `portfolio.kouheikosehira.com`（正本）へのデプロイは **`portfolio/` ディレクトリからのみ**行う。`.vercel` リンクは `portfolio/.vercel` のみが正（旧 `agent-ag/.vercel` の二重リンクは除去済）。

正規手順（この 1 行が唯一の正規デプロイコマンド）:

    cd portfolio && vercel --prod

> [!IMPORTANT]
> * デプロイ前に `node scripts/build-portfolio.mjs`（テンプレ＋registry→完全生成）→ `node scripts/toranomaki-verify.mjs`（三者一致）が PASS していること。
>   PreToolUse hook（`portfolio-deploy-build-gate`）が portfolio 対象の `vercel --prod` 検知時に両者を強制実行し、verify FAIL なら Deploy を Deny する。
> * root / `agent-ag/` からのデプロイ禁止（誤公開の温床）。
> * デプロイはマスター承認後のみ（auto-deploy 禁止）。
> * Vercel ダッシュボードのプロジェクト名・alias 整理は別タスク（要マスター/対話認証）。

> [!NOTE]
> ドメイン保護は Vercel 構造側（1 ドメイン = 1 プロジェクト・割当は明示操作必須）が担保する。
> ローカル hook が担保するのはビルド整合（build→verify の三者一致）のみで、ドメイン奪取は構造的に起きない。
> 実リスクは「本番プロジェクトへの第 2 デプロイ源追加（別フォルダ link / Git 連携）」に限られる → 整理手順は `docs/ops/plans/2026-06-16-vercel-project-hardening.md`。

### 8.7 3 段ゲート（Add → Commit → Push）— canonical 直書き封鎖

虎の巻は Git の Add → Commit → Push と同型の 3 段で運用する。**Commit(合否判断) と Push(deploy) を物理分離**し、canonical（`docs/html-toranomaki/`）には intake を通った judged-PASS だけが入る構造とする。これにより未判定物が deploy を止める事故（commit と push の混同）を構造的に排除する。

| 段 | 場所 | 誰が | 強制手段 |
|----|------|------|---------|
| **Add（下書き）** | `*/.toranomaki-outbox/`（product / agent-ag）＋ ルート直下 `.toranomaki-outbox/`（司令塔） | 全エージェント可（canonical 外を自由に書ける） | — |
| **Commit（合否判断）** | `node scripts/toranomaki-intake.mjs` = blindtest 判定 → **PASS のみ** canonical(docs/＋registry) へ配置・FAIL は rollback | 司令塔のみ | PreToolUse hook `toranomaki-generated-guard` が Claude の canonical 直書きを Deny。intake は node fs で書くため唯一の正規入口になる |
| **Push＝Deploy** | `build-portfolio` → `toranomaki-verify`(三者一致) → `cd portfolio && vercel --prod` | 司令塔＋承認 | `portfolio-deploy-build-gate`（§8.6）。canonical が判定済前提なので未判定物で詰まらない |

> [!WARNING]
> `docs/html-toranomaki/{slug}/` 配下への直接 Write/Edit は PreToolUse hook `toranomaki-generated-guard` が Deny する（`registry.json` / `RULES.md` / `.`始まり作業域は許可）。
> 例外的な直編集は `.allow-prod-edit`（10分 TTL・`portfolio-generated-guard` と共用）でバイパスできるが、原則は Add → Commit を通すこと。

**reject（不合格）置場**: Commit で blindtest FAIL / 構造不適合（concept.md・research-log.md・impl-{lib}-{ver}/ 欠落）となった提出物・canonical に紛れ込んだ非適合物は **`outputs/toranomaki-rejected/{slug}/`** へ隔離する（内容保全・可逆）。再整形後に Add → Commit で再申請する。

---

## 9. 解析フロー（外部サイトの手法解析）

外部サイトを解析して虎の巻テーマを追加する際は、以下の段階フローに従う。
各 Step で「完了条件」を満たしたらそこで終了し、次の Step には進まない。

### Step 1〜5（定型）

| Step | 内容 | ツール | 完了条件 |
|---|---|---|---|
| **1** | HTML `<head>` を確認し、CDN URL・ライブラリ名・バージョンを特定する | Read のみ | 使用技術の一覧が判明した |
| **2** | JS / CSS ソースを直読し、コア技術の構造を把握する | grep / Read | アニメーション・インタラクションの骨格が把握できた |
| **3** | ライブラリの公式ドキュメント・API を確認し、実装値・パラメータを特定する。**CDN で使うバージョンが実在するか npm registry / CDN で確認し、ESM ビルドが fully bundled か否かも調べる（外部 import があれば importmap に追加するか esm.sh を使う）** | WebSearch / Read | 値・パラメータ・CDN URL の実在が判明した |
| **4** | Playwright + ローカルサーバーで動作確認し、`console.error` / `pageerror` を収集する | Playwright | 動的挙動・エラーが確認できた |
| **5** | GLSL / Shader / Three.js コードを直読し、GPU デバッグで仕様を把握する | Read + Playwright（`--enable-gpu --use-gl=angle`） | シェーダー仕様が把握できた |

### Step 6（自由）

Step 1〜5 で拾えなかった場合に使う。手法・ツールは問わない。

**義務:** Step 6 を使ったら research-log.md に以下を必ず記録する。

```
## [{YYYY-MM-DD}] Step 6 使用記録
- 対象: {テーマ名}
- Step 5 までで拾えなかった理由:
- 使った手法:
- 解決したか:
```

同じパターンが 3 回記録されたら Step 1〜5 への昇格を検討する（RULES.md 更新）。

### 難易度の目安

| 技術スタック | 終了 Step の目安 |
|---|---|
| CSS アニメーション（宣言的） | 2 |
| GSAP / Lenis / ScrollTrigger | 3 |
| 外部依存混在・複数バージョン | 4 |
| WebGL / Three.js / GLSL | 5 |
| 上記に当てはまらない | 6 |
