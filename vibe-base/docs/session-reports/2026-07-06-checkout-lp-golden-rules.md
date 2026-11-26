# Check-out — LP黄金律チェックリスト vest1 昇格

> branch: `claude/busy-raman-e0cab5` (worktree) / HEAD: 直近2コミット参照
> 次セッションで本ファイル先頭から Read すること。

## 🔴 最重要

1. **本セッションのタスクは完了・残作業なし**。LP黄金律チェックリストの vest1 昇格を実施し、AC1〜AC8 全て機械検証 PASS。
2. **`.claude/hooks/line-count-gate.mjs` に EXCLUDE_INDEX を追加**（`docs/standards/vest1-catalog.html` を500行規律から除外）。マスター承認済み（依頼内で「1」を選択）。
3. **advisory 1件は意図的に不採用**: code-reviewer が EXCLUDE_INDEX の正規表現（先頭アンカーなし）を指摘したが、将来 `products/*/docs/standards/vest1-catalog.html` という同名ファイルが作られない限り実害ゼロ・本来ゴール（LP黄金律登録）に寄与しないため対応見送り。詳細は下記 F 節。

## A. 本セッション TL;DR

1. マスター依頼: homepage/anthropic-t5 で作成したLP黄金律チェックリスト（3ソース横断・汎用化済）を `docs/standards/` へ共有標準として登録
2. 調査: homepage原本2ファイルは `products/` gitignore 対象の**未追跡ローカルファイル**と判明（どのブランチにも無い）。他エージェント領域のため触らず内容のみ取得
3. 重複調査: 真の重複は `docs/ops/lp-design-sop.md` §4「コピーライティング5原則」のみ。サムネ黄金律・ココナラ系は直交
4. Plan Mode で計画策定・承認（マスター指示「質の高いほうを残せ」を計画に反映）
5. `docs/standards/checklists/lp-golden-rules-checklist.md` 新規作成（8ブロックA〜H・39項目）
6. `docs/standards/templates/lp-golden-rules-guide.md` 新規作成（3出典URL・実証データ・t5固有部分除去・sop§4のJP言い換え例5件を吸収）
7. `docs/ops/lp-design-sop.md` §4 を圧縮し正本へポインタ化
8. `.claude/rules/lp-design.md` / `docs/standards/web-design-flow.md` に参照追加
9. `docs/standards/README.md` vest1対応表 + `docs/standards/vest1-catalog.html` カード索引に登録（README #30/#31、catalog #31/#32 ※既存の1ズレ命名ドリフトに準拠）
10. `vest1-catalog.html`（730行）が line-count-gate に差し戻され → 索引データとして除外パターン追加（マスター承認）
11. Check-out Wave A-3 で code-reviewer 呼出 → advisory1件（EXCLUDE_INDEXの正規表現広すぎ）。修正を試みる過程で自ら回帰バグ（`^docs`アンカーが絶対パスに一致せず除外が機能しなくなる）を作り、マスターの「自問しろ」指摘で本来ゴールに寄与しないと判断し**コミット済みの動作する版に revert**

## B. 完了 commit 一覧

| commit | 種別 | 内容 |
|--------|------|------|
| 6154502 | feat(standards) | LP黄金律チェックリスト新規2ファイル + README/catalog登録 + sop圧縮 + line-count-gate除外追加 |
| e8e9cf8 | docs(standards) | web-design-flow.md への参照追加漏れの追いコミット |

## C. 影響波及

- `.claude/hooks/line-count-gate.mjs` を編集した（全プロダクト共通hook）。追加した `EXCLUDE_INDEX` は `docs/standards/vest1-catalog.html` 専用の除外で、他ファイルの500行判定には影響しない
- `docs/ops/lp-design-sop.md` を使う既存LP制作フローは、詳細な違反例→修正例が `lp-golden-rules-guide.md` §8 へ移動している点に注意（内容は消えていない・移設のみ）

## D. 残作業

**なし（本タスクは完結）。** 強いて挙げれば任意の低優先事項:

- （任意・低優先）`.claude/hooks/line-count-gate.mjs` の `EXCLUDE_INDEX` は末尾一致のみで先頭境界が緩い（`(^|[/\\])docs...` 相当）。将来 `products/*/docs/standards/vest1-catalog.html` という同名ファイルが実在すれば誤除外の可能性。真の修正は `PROJECT_DIR` ベースの絶対パス完全一致に置き換えること。現状は該当ファイルが存在せず実害ゼロのため未着手。
- homepage 原本（`products/homepage/anthropic-t5/lp-golden-rules-{checklist,report}.md`）は未追跡のまま。homepage エージェントが後日ポインタ化するかは homepage 側の判断（司令塔は不干渉）

## E. 配備済 subagent / skill / hook

- `.claude/hooks/line-count-gate.mjs` に `EXCLUDE_INDEX` パターン追加（既存hook・名前/matcher/event 変更なし・manifest整合維持）

## F. 本セッションで判断した重要な分岐（次セッションが同じ轍を踏まないように）

1. **未追跡ファイルの昇格タスク**: `products/` は gitignore 対象。原本を「移動」ではなく「新規正本を内容から起こす」形で対応した。他エージェント領域は触らない原則を厳守。
2. **line-count-gate の除外は最終手段**: vest1-catalog.html はカード型索引データであり分割すると一覧性が壊れるため除外が適切と判断（マスター承認済み）。ただし除外パターンは今後増やしすぎないこと。
3. **advisory指摘への対応要否は「本来ゴールへの寄与」で判断せよ**: code-reviewerのadvisory（正規表現の理論的な広さ）を追いかけて修正しようとした結果、実際に動いているものを壊す回帰を作った。マスターの介入（「それは本来のゴールに寄与または影響する問題なのか自問しろ」）で気づき、コミット済みの動作版に `git checkout --` で復元した。**advisoryは自動修正せず、ゴール寄与度を先に自問する**。
4. **memory.md の書き込み先はブランチ内に限定**: このセッションはworktree `claude/busy-raman-e0cab5` で作業しており、`resolve-paths.mjs` はメインworktree(master)側のmemory.mdパスを返すが、masterは別セッションが稼働中(未コミット差分あり)だったため、マスター確認の上で**自分のブランチ内memory.mdのみ**を更新する方針にした。ADR-0003（worktree統合はmerge→push）に従い、統合時に通常のgit mergeで解決される想定。

## G. 次セッション初手

1. 特別な初手は不要（本タスク完結）。P1の他エントリ（hp-customizer / ai-company-ops / portfolio Phase2）から着手
2. 機械検証: AC1〜AC8 全PASS済み（本ファイルB節のcommit参照）
3. code-reviewer advisory: 1件（EXCLUDE_INDEX正規表現の理論的広さ）→ 対応不要と判断済み・D節に記録のみ
