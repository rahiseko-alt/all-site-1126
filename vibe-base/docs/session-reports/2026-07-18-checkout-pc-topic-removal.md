# Check-out — PC表/P0-P4「話題」除去（壁のみ・小石は対象外）

> branch: master / HEAD: 3ddc35c（本コミット前）
> 次セッションで本ファイル先頭から Read 必須

## 🔴 最重要

1. **Goalの再定義（マスター指摘）**: 「PCチェック関連の話題にセッション中触れない仕組みの確立」は**問題ゼロを意味しない**。通常セッションが実際に踏む導線（壁）だけを塞げばよく、historical/citation/product個別データ（小石）は追いかけない。今回はこの区別に基づき実施した。
2. **`.claude/worktrees/busy-raman-e0cab5` を削除済み**。2026-07-06時点のdetached HEAD（未コミット差分なし・master完全祖先外）。`git worktree remove`で正規削除。再発しても同様に安全に削除可（要:`git status --short`で差分なし確認 → `git merge-base --is-ancestor`でmaster祖先か確認）。
3. **backlog id:18 は状態未変更（open のまま）**。壁は解消したが、historical/citation項目（changelog・出典列・棚卸しレポート・製品固有データ）を意図的に残しているため、AIの独断でdoneにしなかった。次回、マスターがこの残存を「解決済とみなす」か判断してほしい。
4. **roadmap-state.json は全5マイルストーンdone（今回のセッション以前から）**。`roadmap-freshness-check.mjs`がINFOで完走判定を促した。backlog全項目を照合し、H2大義（daigiシステムの全product配備）をブロックする open 項目はないと判断（詳細はG節）。**マスターにH2大義の完了可否を確認してほしい。AIは宣言しない。**

## A. 本セッション TL;DR

1. vibe-base直下の生きた導線（`.claude/rules/self-verification.md`・`agent-rules.md`・`agent-rules-canonical.md`）からPC表/P0-P4/ゲート通過語彙を除去
2. グローバルskills 5本（`~/.claude/skills/{checkout,code-review,security-review,vercel-deploy,skill-creator}/SKILL.md`）の発火トリガー・記録先文言を除去（**別repo・別途commit要**）
3. `docs/ops/risk-diagnosis-sop.md` の P0-P4ゲート進行モデルをマイルストーンモデルへ全面再設計（§1・§7〜§14）
4. `docs/ops/{quality-templates,delivery-onboarding}.md` 等テンプレート系のP0-P4/CL-Nラベルを除去（中身のテンプレ仕様は維持）
5. `docs/ops/p4-zero-procedure.md` をタイトルごと「運用準備チェック手順」へリネーム。関連ファイル（backup/cost/incident-response-sop等）の参照も追随
6. `docs/ops/trigger-map.md` から、既にarchive行き確認済みの`agent-task-protocol.md`に依存する死んだ行・「pc-checkin連鎖テーブル」節を丸ごと削除
7. `docs/ops/structural-diagnosis.md` の診断項目を`pc-progress.md`存在チェックから`roadmap-state.json`存在チェックへ更新（現行の大義システムに整合）
8. 孤立git worktree `busy-raman-e0cab5` を削除
9. backlog id:18の対象ファイルのうち「生きた導線」全件を修正。日付付き履歴・出典引用・製品個別データは意図的に対象外（小石と判断）

## B. 完了 commit 一覧

本Check-outで作成する1件のみ（下記EXIT参照）。

## C. 影響波及

- **`~/.claude/skills/`配下5ファイルは別repo（`rahiseko-alt/claude-skills-base`）。vibe-base側のcommitには含まれない。** 次セッション開始時に別途commit状態を確認すること
- `docs/ops/risk-diagnosis-sop.md`はマイルストーンモデルへ再設計したため、既存product個別の`risk-diagnosis.md`が旧ゲート語彙（P0/ゲート等）で書かれている場合、今後の更新時は新語彙（マイルストーン）に揃える程度でよい（強制移行は不要=小石）

## D. 残作業

**H（高）**
- H2大義（daigiシステム全product配備）の完了可否をマスターに確認（roadmap-state.json全5マイルストーンdone・backlog全項目非ブロッキング確認済み）
- `~/.claude/skills/`側（別repo）の今回編集5ファイルをcommit

**M（中）**
- backlog id:18の残存（historical/citation/製品データ）を「解決済とみなす」か「残す」かマスター判断
- `docs/ops/{failure-scenario-template,test-template-guide}.md` は vest1化済み（`docs/standards/templates/`に正本あり）の旧重複ファイル。削除候補だが今回スコープ外

**L（低）**
- backlog id:6（product側16product・18行のP0-P4語彙）は小石として対象外確定（マスター指示）

## E. 配備済 subagent / skill / hook

なし（本セッションは既存ファイルの語彙修正のみ）

## F. 本セッション生成レポート

なし（tmp/への出力なし）

## G. 次セッション初手

1. cwd = vibe-base root で起動
2. 本レポートを読む
3. `~/.claude/skills/`側の別repo commit状態を確認（未commitならcommit）
4. H2大義（daigiシステム配備）の完了可否をマスターに確認 — backlog.json全17件open中、H2大義をブロックする項目はなし（id:18は今回対応・小石除く／id:6は明示的に対象外／id:1-5,7-11,13-17はいずれも配備メカニズム自体とは無関係な周辺改善提案）
5. 機械検証: A-2（secret pattern scan）が`check-secret-patterns.mjs`欠損で実行不能（backlog id:16と同型の既知問題・今回セッション起因ではない）
