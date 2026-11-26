# Check-out 2026-06-24（夜）— atelier 新設（Antigravity 用 Web デザイン作業場）

- branch: master / HEAD: `c4b318ff9`
- **次セッションは本ファイルを先頭から Read 必須**
- 同日前半の Google Slides 構築の詳細は `2026-06-24-checkout-google-slides.md` 参照

## 🔴 最重要

1. **`atelier/` を新設**（vibe-base ルート直下）。**Google Antigravity（Gemini 駆動の別 IDE）専用の Web デザイン作業場**。Antigravity は Claude Code より視覚/フロント生成が得意というマスター方針（コミュニティ評価多数・厳密ベンチは未確認）。
2. **Antigravity は CLAUDE.md を読まない**。ルール読込仕様が違う＝`AGENTS.md`（ワークスペース標準）＋ `.agents/rules/` を読む。よって `atelier/AGENTS.md` に手紙形式で規律をベタ書きした（@import 非対応・セッション間記憶なし前提）。
3. **役割分担＝「作る:Antigravity / 保存:司令塔」**。Antigravity は git 全面禁止（vibe-base の git ガード hook は Claude Code 専用で Antigravity に効かない＝無防備で commit すると事故）。マスターが「atelier セーブ」と言ったら**ルートの Claude Code 司令塔**が path-scoped commit する。

## A. 本セッション TL;DR（atelier 分）

1. マスター指示「Antigravity 用 Web デザインフォルダを作れ・CLAUDE.md 読ませろ・ルール読込仕様が違う点に注意」
2. ファクトチェック（WebSearch）: Antigravity 実在・`AGENTS.md`/`.agents/rules/` 読込・セッション間記憶なし・Web デザイン優位は体感ベース
3. naming 規律で `アトリエ`→`atelier`（kebab・日本語禁止 §4）に確定
4. 置き場所はマスター選択でルート直下 `/atelier`
5. `atelier/AGENTS.md` を手紙形式で作成（境界＝atelier 配下のみ・親に触るな／Claude Code 同一ルール／git 禁止）
6. マスター指摘で矛盾2点を根治: ①「同じルール」だと Antigravity が勝手に commit する → git は例外で全面禁止と明記 ②「いい感じで保存したい」運用 → 自分で保存するな・人間に「atelier セーブ」と言え（§0-5）
7. commit `c4b318ff9` → push

## B. 完了 commit 一覧（本セッション全体）

| hash | 種別 | 内容 |
|------|------|------|
| `34cf5ef8f` | feat(google-slides-gen) | Markdown→Google スライド自動生成システム新規構築 |
| `242c8e0bd` | merge | origin/master 統合 |
| `6c923dae8` | chore(google-slides-gen) | プロダクト統治整備 |
| `00c61caa8` | chore(memory) | Google Slides 完成の引継ぎ MD + memory @参照 |
| `c4b318ff9` | feat(atelier) | Antigravity 用 Web デザイン作業場 + AGENTS.md 境界憲法 |

## C. 影響波及

- 新規ディレクトリ `atelier/`（ルート直下・純増）。Antigravity が編集する前提で、vibe-base 共有 git ガードは効かない領域。**保存は必ずルートの Claude Code 司令塔から path-scoped で**。
- `atelier/AGENTS.md` が唯一の Antigravity 憲法。境界違反（atelier 外編集）を防ぐ最重要ルールを §0-1 に置いた。

## D. 残作業

**優先度 L**
- atelier 運用の実走（Antigravity で実際にデザイン → 「atelier セーブ」→ 司令塔 commit → 良作は虎の巻 `docs/html-toranomaki/` へ移送）。移送フローは未整備（必要になった時に SOP 化を検討）
- atelier 制作物の追跡方針: マスター選択は「①完成物だけ選別コミット・作業中散乱物は .gitignore 除外」。**現状 .gitignore 未配置**（散乱物が出たら atelier/.gitignore を置く）
- google-slides-gen: `.claude/hooks` onboarding ＋ 機能追加バックログ7件 → `products/google-slides-gen/memory.md` P1

**優先度 H（本セッション無関係・既存引継ぎ）**
- spire-lite / kosespark P0（§1 等マスター情報待ち＝着手不可・状態維持）

## E. 配備済 subagent / skill / hook（本セッション追加分）

- なし

## F. 本セッション生成レポート

- `docs/session-reports/2026-06-24-checkout-google-slides.md`（同日前半 Google Slides 詳細）
- 本ファイル（atelier 分）

## G. 次セッション初手

1. 本ファイルを Read
2. memory.md P1 確認
3. 機械検証サマリ（Wave A-2）: atelier シークレット0件 / atelier 全コミット済 = PASS
4. atelier 運用時の鉄則: Antigravity は作るだけ・保存は「atelier セーブ」で司令塔が実行・移送も司令塔
