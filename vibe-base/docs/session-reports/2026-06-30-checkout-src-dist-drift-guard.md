# 2026-06-30 Check-out — src→dist ドリフト自動検知 配備

> **次セッションは本ファイルを先頭から Read してから着手すること。**
> branch: master / HEAD: 後述コミット一覧参照

---

## 🔴 最重要

1. **code-reviewer が指摘した既存バグ（未修正）が3件ある** — 今セッション起因ではないが引継ぎ要
   - `build-dist.mjs:93` — `distSearch.includes("'ponchi-v2.html'")` がシングルクォート前提（二重引用符で偽陰性）
   - `settings.json:29,52` — `Bash(npm publish:*)` が deny と ask に重複登録（ask 側が永続 dead）
   - `build-dist.mjs:133,142` — `assetCount` が `assetFiles.length` と常に等価（dead code）
2. **pre-commit hook の `$CLAUDE_PROJECT_DIR` 実動作が未確認** — hook が実際に `git commit` 時に発火するか次セッションで検証推奨（AC-1 は fs 直接実行のみ確認済み）

---

## A. 本セッション TL;DR

1. チェックイン実施（vibe-base 司令塔・照合リスト version 1.0 確認）
2. trimmer-system 依頼書（commit 82e9b0229）を受理・詳細調査（2 Explore エージェント）
3. `build-dist.mjs` 構造を完全解読 — JS 決め打ちリスト / assets は意図的除外あり / HTML は既に section 1b で処理済
4. Plan Mode で設計（elegant-bubbling-wren.md）— assets 決め打ち維持・HTML completeness guard + JS auto-enumerate 方針で承認
5. 共通スクリプト `scripts/src-dist-drift-guard.mjs` 新規作成（外部依存ゼロ）
6. `products/trimmer-system/src-dist-guard.config.json` 新規作成（3チェックルール）
7. `build-dist.mjs` 改修: JS auto-enumerate + HTML completeness guard 追加
8. `products/trimmer-system/.claude/settings.json` に pre-commit hook 登録
9. `products/trimmer-system/package.json` に `npm run check` 追加
10. AC-1〜AC-4 を実機検証（drift 検出 / build 失敗 / 整合 EXIT 0 すべて確認）
11. code-reviewer 7件指摘 → 今セッション起因バグ3件 + dead code 1件を修正

---

## B. 完了 commit 一覧

| hash | 種別 | 内容 |
|------|------|------|
| `160142b8a` | feat | src→dist ドリフト自動検知 — 共通ガード配備（5ファイル） |
| *(本 checkout commit)* | fix+chore | code-review 指摘バグ修正 + session report + memory.md 更新 |

---

## C. 影響波及

- `vibe-base/scripts/src-dist-drift-guard.mjs` は **vibe-base 全体の共通スクリプト**
  - 他 product が `src-dist-guard.config.json` を追加するだけで横展開可能
  - 横展開手順: config 作成 → settings.json hook 追記 → package.json check 追加（3ファイルのみ）
- trimmer-system の `npm run build` が **未処理 HTML で自動 fail** するようになった
  - 次に `src/*.html` を追加するときは build-dist.mjs にも変換ルールを追記すること

---

## D. 残作業

| 優先度 | 内容 |
|-------|------|
| H | hp-customizer 編集エンジン層（即死仮説#1: 素人がレイアウト壊さず編集/保存/再現） |
| H | spire-lite P0（Godot 4.7 デッキビルダー）— マスター情報待ち |
| H | kosespark P0（Claude Code 拡張型）— マスター情報待ち |
| M | trimmer-system pre-commit hook 実発火確認（`git commit` 時に hook が non-zero で止まるか） |
| L | build-dist.mjs 既存バグ修正（assetCount dead code / search.html self-check 単一引用符前提） |
| L | settings.json の `Bash(npm publish:*)` 重複エントリ除去（ask 側を削除） |

---

## E. 配備済 subagent / skill / hook

**本セッション追加:**
- `vibe-base/scripts/src-dist-drift-guard.mjs` — 共通 src→dist パリティチェッカー
- `products/trimmer-system/src-dist-guard.config.json` — trimmer-system 専用マッピング設定
- `products/trimmer-system/.claude/settings.json` — PreToolUse `Bash(git commit*)` に src-dist-drift-guard hook 追加

---

## F. 本セッション生成レポート

- plan: `~/.claude/plans/elegant-bubbling-wren.md`（完遂）

---

## G. 次セッション初手

1. 本ファイルを Read
2. `vibe-base/memory.md` P1 引継ぎ確認
3. trimmer-system pre-commit hook 実動作テスト: `src/test.html` 追加 → `git commit` → hook 発火確認
4. 発火しない場合は `$CLAUDE_PROJECT_DIR` の解決値を `echo $CLAUDE_PROJECT_DIR` で確認し hook コマンドを修正

**機械検証（Wave A-2）:** secrets grep マッチ 0件 ✅ / npm test・lint・typecheck は trimmer-system に未設定のため skip
**コードレビュー指摘:** 7件（今セッション起因3件修正済 / 既存バグ4件は D 残作業参照）
**次セッション残作業:** H 3件 / M 1件 / L 2件
