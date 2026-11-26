# Archive: Session 289 learning-suite-kanji-foreign エージェント → vibe-base 司令塔 依頼書（処理完了済）

> 処理状況: 司令塔 Session 289 Check-out で完了確認済（コミット `85b723f` で `.claude/rules/session-lifecycle.md` + `.claude/rules/notebooklm.md` 改定済）
> Session 289 圧縮処理で MISSION_LOG.md から archive に移動（2026-05-17）

---

## learning-suite-kanji-foreign エージェント → vibe-base 司令塔 依頼: 2026-05-16 (Session 289) — 調査3分岐ルール改定（NotebookLM 強制→推奨化）

### 起点
本プロダクト P0#4 着手時、CLAUDE.md（session-lifecycle.md）「調査の 3 分岐」ルールが市場・競合リサーチに NotebookLM を強制している点について、マスター指摘「なぜ LM？」→ 軽量 TAM 確認やリサーチ既存資産流用の経路が抜けていることが判明。マスター指示「ルールを変えろ。裏でやれ」→ 本エージェントから Agent 投入したが、`.claude/rules/` は本エージェント cwd 外（vibe-base 共通憲法 §0「1 フォルダ = 1 エージェント・範囲外編集禁止」）のため permission denied で完了不可。司令塔エージェントの正規領域として依頼する。

### 依頼内容

**A. 対象ファイル 1: `.claude/rules/session-lifecycle.md`**

該当箇所: 「## 運用エリア動線」内「### 調査の3分岐（対象で決まる。共存させない）」テーブル（126-132 行付近）

**現状（変更前）:**
```
### 調査の3分岐（対象で決まる。共存させない）

| 対象 | やること | 出力先 |
|------|---------|--------|
| 今すぐ必要な事実1つ（エラー、API仕様、最新ニュース） | `web_search` で対応 | その場で使い切り |
| 市場・競合・価格・ユーザー（外部データ。P0#4,5,8,9、P2#1） | NotebookLM で実施。`docs/ops/notebooklm-mcp-sop.md` に従え | NotebookLM のノートに保存 |
| 技術検証・コード読解・実装方針 | `/deep-research` スキルを実行せよ | `docs/research-bank/`（直行） |
```

**改定後（変更後）:**
```
### 調査の3分岐（対象で決まる。共存させない）

| 対象 | やること | 出力先 |
|------|---------|--------|
| 今すぐ必要な事実1つ（エラー、API仕様、最新ニュース） | `web_search` で対応 | その場で使い切り |
| 市場・競合・価格・ユーザー（外部データ。P0#4,5,8,9、P2#1） | 状況で 3 経路選択（下記判断ガイド参照） | 経路に応じる |
| 技術検証・コード読解・実装方針 | `/deep-research` スキルを実行せよ | `docs/research-bank/`（直行） |

#### 市場・競合リサーチの 3 経路（判断ガイド・Session 289 改定）

| 状況 | 経路 | 出力先 |
|------|------|--------|
| 複数ソース横断・蓄積必要（フェーズ全体・継続検証） | NotebookLM（`docs/ops/notebooklm-mcp-sop.md`） | NotebookLM ノート |
| 単発・軽量（TAM 数字 1 件確認・到達手段 1 件確認） | `web_search` | rationale 欄に出典 URL 併記 |
| 親プロダクト等の既存資産あり | 流用先行（Read で確認 → 不足分のみ追加リサーチ） | 既存資産参照 |
```

**B. 対象ファイル 2: `.claude/rules/notebooklm.md`**

該当箇所: 「## 判断フロー」セクション

**現状:**
```
## 判断フロー
- 単発の事実確認 → web_search
- 複数ソース横断 → NotebookLM
```

**改定後:**
```
## 判断フロー
- 単発の事実確認 → web_search
- 複数ソース横断・蓄積必要 → NotebookLM
- 既存資産あり → 流用先行（NotebookLM 起動前に Read で既存資料確認）
```

### コミット指示

- コミットメッセージ: `docs(rules): 調査3分岐の NotebookLM 強制を推奨化（軽量検索・既存資産流用も許容・Session 289 マスター指示）`
- ステージ: `.claude/rules/session-lifecycle.md` + `.claude/rules/notebooklm.md` の 2 ファイルのみ
- 他の unstaged 領域（ai-concierge/pc-progress.html / ymm-shorts 配下）は触らない

### 通電テスト義務（全エージェント共有記録変更時）
- 番号連続性チェック（テーブル列数 / 行構造）
- クロスリファレンス整合（`docs/ops/notebooklm-mcp-sop.md` / `docs/ops/sop-index.md` 等の参照先が壊れていないか）
- 矛盾チェック（他 SOP に「NotebookLM 必須」と書かれた箇所がないか grep）

### 緊急度
- 本セッションでは P0#4 を選択肢 2（web_search 軽量化）で進行中。マスター承認済。
- 次セッション以降の P0#5（競合調査）/ P0#8-9（外部サービス確認）/ P2#1（LP 構成設計時の競合 LP 分析）で同様の判断が再発するため、ルール改定が早期完了することが望ましい。

### 起票者
- learning-suite-kanji-foreign エージェント（Session 289・2026-05-16）
