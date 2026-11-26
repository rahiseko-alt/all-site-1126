---
title: Project Memory — Claude Code 日記から書籍へ
updated: 2026-04-13
---

# このワークスペースの目的

vibe-base オーナー（kouhei kosehira）が Claude Code を使って AI 共創基盤 `vibe-base` を構築してきた約2か月間の記録を、note 連載 → Kindle 自費出版を見据えた書籍原稿にまとめる作業環境。

## 想定読者
- Claude Code を使い始めた、または使ってみたい個人開発者
- 「AI に何を任せ、自分は何をやるのか」を整理したい人
- 1人で複数プロダクトを並行運用する仕組みに興味がある人

## 章立て方針
- **時系列**を基本骨格にする（Session 1 → 165 の流れ）
- 各章は1つのテーマ（例: 自治憲法、PC表、失敗集、ガバナンス改革）に絞る
- 失敗・撤退・方針転換も等価に扱う（成功談だけにしない）

## 執筆規約（全エージェント共通・厳守）

### 0. 前提: 必ず前回までの完成章を読め（最重要）

新章の執筆・改稿に着手する前に、`wiki/pages/chapter-*.md` の **すでに存在する全章を冒頭から末尾まで読むこと**。要約で済ませるな。読む目的は以下を「例として学習」するため:

- 文体（一人称・語尾・温度感・エッセイ化の上限）
- 章構造の並び順（導入→本文→ログ概要→次章予告→草稿メモ）
- ログ概要の粒度感（1日2〜5項目、派生作業は親に統合）
- 見出しレベルの使い分け（## と ### の粒度）
- 引用・コードブロック・表の使い方

このステップをスキップして書いた章は、文体が揺れた時点で差し戻される。**例から学べ、自己流に戻るな**。

### 1. 文体

- 一人称は「私」。地の文（〜だ／〜である）で書く
- エッセイ調だが、**感想・余韻・情景描写に走らない**。事実→判断根拠→その後の影響、の順で淡々と書く
- 読者への語りかけはOK（例: 「本章のエピソードはどれも地味だ」）。ただし多用しない

### 2. 章構造テンプレート（上から順に配置）

1. フロントマター（後述）
2. `# 第N章 タイトル`
3. `## この章で書くこと`（導入・本章のスコープ説明）
4. `## 日付 or テーマ見出し`（本文。複数セクション）
5. `## ログ概要（対象期間: YYYY-MM-DD 〜 YYYY-MM-DD）` ― 末尾ログ
6. `## 次章予告`
7. `## 草稿メモ（公開時に削除）` ― TODO / note公開時の差替候補

各大セクション間は `---`（水平線）で区切る。

### 3. ログ概要の粒度ルール

- 1日あたり **2〜5項目**に収める
- 派生作業（import パス修正・package.json 修正・ファイルリネーム数の内訳など）は親項目の括弧内に統合
- OK例: `mobile-order-system Sprint 1 完走（PLAN → 実装 → デプロイ → レビューで3件バグ修正 → E2E → コミット）`
- NG例: `PLAN.md 作成` / `colSpan="6"→"7" 修正` / `Time列とAction列の順番修正` ... のように派生作業を個別項目化する

### 4. フロントマター形式

```yaml
---
title: 第N章 タイトル
chapter: N
status: draft            # draft → review → published
source: wiki/sources/chapter-NN-raw.md
drafted: YYYY-MM-DD
---
```

### 5. ファイル命名

- `wiki/pages/chapter-NN-英語-kebab-case.md`（CLAUDE.md §4 準拠、日本語ファイル名禁止）
- 生ソースは `wiki/sources/chapter-NN-raw.md`
- NN は2桁ゼロパディング（`chapter-01-...`、`chapter-10-...`）

### 6. 想定字数

- 本文（ログ概要・草稿メモを除く）で **3,000〜4,000字**
- 4,000字を超えそうなら章を分割する判断を先に行う（マスター確認必須）

### 7. 推測の扱い

- 一次ソース（MISSION_LOG / CLAUDE.md / archive / revision-history）に書いていないことを「こうだったはず」と創作するな
- 根拠がない箇所は省くか、生ソースの引用にとどめる
- 推定で書いた箇所は草稿メモに「要確認: ...」として明記する

---

## 一次ソース（vibe-base 本体）
- `C:/Users/user/Desktop/ClaudeCode/vibe-base/MISSION_LOG.md` — 全セッションの実施内容・判断
- `C:/Users/user/Desktop/ClaudeCode/vibe-base/SESSION_JOURNAL.md` — 経緯・温度感・保留判断
- `C:/Users/user/Desktop/ClaudeCode/vibe-base/CLAUDE.md` — 自治憲法 v5.1
- `C:/Users/user/Desktop/ClaudeCode/vibe-base/docs/ops/` — 運用 SOP 群

## 作業フロー
1. **取り込み**: 一次ソースから章のテーマに合うエピソードを抽出 → `wiki/sources/<slug>.md` に生引用で保存
2. **整理**: `wiki/pages/chapter-NN-<title>.md` に章ドラフトを書く（読者目線で再構成）
3. **校正**: General role で1章ずつ通読して粗さを潰す
4. **公開**: note に章単位で投稿 → 反響を見て Kindle 統合
5. **2次展開**: 各章のあらすじを Storyteller Plus で動画化（明日入る mulmocast-cli で自動化）

## 出版形式
- Phase 1: note 連載（無料・反応収集）
- Phase 2: Kindle Direct Publishing（個人出版・¥0コスト）
- Phase 3: 物理本は需要が確認できてから検討
