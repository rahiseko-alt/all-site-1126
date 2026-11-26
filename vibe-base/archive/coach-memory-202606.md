# coach memory archive (2026-06)
> 元 products/coach/memory.md から移行した P3・P4 コンテンツ
> 作成: 2026-06-10 / コンテキスト改革 Phase C

## P3: 失敗事例（元 memory.md より）

→ `failures.md` 参照

## P4: 永続教訓（元 memory.md より）

1. [importance:H][2026-05-19] **コード用語でマスターに質問するな・消える文字や見える結果で問え**
   - 事案: lesson-slides 見出し削除作業中、AskUserQuestion で「`.merged-eyebrow`（slide #1/#7/#8/#9/#10 の小ラベル）も同じ見出し扱いで削除しますか？」と CSS class 名 + slide # 形式で質問 → マスター訂正「この質問は非エンジニアには伝わらない。コードレベルで聞くな。消える文字や記号を提示しろ」
   - **Why**: マスターは非エンジニア。CSS class 名・selector・属性名・タグ名・slide # 等の実装語彙は伝わらない
   - **How to apply**: AskUserQuestion / 完了報告 / 進捗説明を送信する前に「コード語句が含まれていないか」を必ず self-check。「●WORK が消える」「数字 01/02 が消える」のように **マスター画面で見える文字** に翻訳して提示

2. [importance:H][2026-05-20] **短指示語「Q」「A」「タイトル」「マーク」等は視覚単位（ロゴ / テキスト本文 / 背景 / コンテナ）を区別して解釈**
   - 事案: master 指示「カードクリック前の Q を変更/左 1、中 2、右 3」を「Q テキスト本文を `1` `2` `3` に置換」と解釈 → 正解は「Q ロゴ（左上のマーク・`<span class="qa-mark">`）の文字を `1` `2` `3` に置換」。本文 Q テキスト（質問文）は不変
   - **Why**: 短指示語は文字通り読むと曖昧。同じ「Q」でも `qa-mark` ロゴ要素を指す場合と `qa-q` 本文要素を指す場合がある。master 視点では「画面で見えるロゴ要素」と「画面で見えるテキスト本文」を別単位として認識
   - **How to apply**: 短指示語に当たったら作業前 1 質問:「画面で見える XX のうち、変更するのは [候補 A・見える文字で表現] / [候補 B] のどれですか?」。または初手で最も狭い解釈（ロゴだけ）→ 報告で「ロゴだけ変えました。本文も含めますか?」と範囲確認
   - 関連: [[P4 #1 コード用語禁止]] の系統

3. [importance:M][2026-05-20] **デプロイ用 commit message は ASCII で明示指定（日本語文字混入で Cloudflare API 拒否）**
   - 事案: `wrangler pages deploy --commit-dirty=true` で commit-message を省略すると、git の最新 commit message（日本語含む）が使われ Cloudflare API が `Invalid commit message, it must be a valid UTF-8 string. [code: 8000111]` を返す
   - **How to apply**: 必ず `--commit-message="..."` を ASCII 文字列で明示指定。例: `--commit-message="lesson-slides: slide 8/9 step number marks"`

## 旧 P1 エントリ（解決済み・参考記録）

1. [importance:H][2026-05-21] lesson-slides 統一改修セット完了・debug バッジ削除済・本番反映済
   - `.dbg-card-num` debug CSS + 末尾 `<script>` 削除 → commit `9d08c28` → deployment `3eb05c5b` / Production / Branch=master / 本番 playwright バッジ 0 確認済
   - 残作業: lesson-slides 全体の完成宣言を master から取得
2. [importance:M][2026-05-18] B-2-2 全 slide コピー本格磨き（`/copywriting` スキル使用）
3. [importance:M][2026-05-18] B-2-4 Phase 3 旧 `.slide.invert` 選択削除
4. [importance:L][2026-05-18] LP 本体 P0 多数（仮説リスト承認 / 市場検証 / 競合調査）
5. [importance:L][2026-05-18] P4#0 運用 Runbook 整備
