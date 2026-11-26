# failures.md アーカイブ（2026-07 退避分）

> 司令塔 `failures.md` の 28KB context 上限（memory-size-gate）維持のため、機械強制済み（[S✓]＝回帰テスト等で固定済み）で active 参照価値の低いエントリを退避した保全先。教訓の実効は各機構（テスト/hook）が担保しており、prose はここで参照可能。

## 2026-07-04 退避

- [S✓] 2026-06-07 code-reviewer 指摘2（B-6/pc-checkin STEP3 共有 awk `'/^## P1/{f=1;next} /^## P[0-9]/{f=0} f'` が P1 最終セクションで plan path を取りこぼす false negative）は**無効**と fixture で機械確認（`tests/fixtures/p1-plan-extract/`・6 ケース全 PASS）。awk は次見出しが無くても EOF まで f=1 で印字するため `p1-last-section`/`p1-multiline-last` で抽出非空＝指摘2 を反証。前セッションの口頭評価を git tracked な回帰テストへ昇格。副産物 edge＝**別軸 false-negative を発見**: P1 内に `## P2用メモ` 形の偽 H2 行があると `^## P[0-9]` に誤マッチし f=0 で以降が脱落（`p1-false-h2-midblock` で現挙動固定・expected=空）。awk 修正自体は本検証 scope 外の別タスク（修正時は expected も path へ反転し SKILL.md L87 と両所同時適用）。

## 2026-07-05 退避

- [S✓] 2026-06-14 build-portfolio.mjs 出力先が agent-ag/→portfolio/ 移行（commit 64bda376）に未追従で fail＝drift（パス定数 PORTFOLIO_DIR/PORTAL_PATH・RULES §8 を portfolio/ へ追従し解消）。原本は docs/html-toranomaki/（単一正本）・portfolio/ は再生成可能な派生物＝派生が消えても原本から復元。併発の別タスク残件: glassmorphism-tilt-card は registry impl=ai-officer-hp の原本が docs/ に欠落（portfolio/ai-officer-hp/ にコピーのみ・concept は style.css/app.js 想定だが実体は css/js 分割+index-b 等 B バリアント混在）→ 一旦 portfolio:false に戻し別タスク化。派生からの原本逆輸入は単純コピー不可（slug 改名 ai-officer-hp→glassmorphism-tilt-card・孤児ディレクトリ削除・impl-{lib}-{ver} 命名・concept 乖離是正を伴う）。
- [S✓] 2026-06-17 on-disk の hook 修正（本体差替・登録解除）は**既に起動済の生存セッションには伝播しない**＝そのセッションは boot 時設定で発火し続ける（shift-ai で削除済 pc-version-gate + 旧 area-gate が exit 1 を量産・全372件が単一 stale セッション cwd に集中）。静的検査では不可視・exit ログでのみ検知可。対処はファイル修正でなく**当該セッションを閉じて開き直す**。検知機構: scripts/check-hook-runtime-errors.mjs + check-in A-22

- [S✓] 2026-06-19 root-only hook（root の portfolio/・scripts 前提で動く虎の巻系）は propagate-hooks.mjs の `ROOT_ONLY_HOOK_NAMES` へ登録し**①settings.json 登録除外②hook ファイル実体コピー除外**の両方を効かせよ・generate-hook-manifest.mjs の SKIP_HOOKS とも定義を揃えよ（3点不整合で 75 ファイル横展開誤配備・常時 FAIL）。自動ガード assertRootOnlyHooksCovered は子コマンドの `/products/` 参照しか捕捉せず `$CLAUDE_PROJECT_DIR/scripts/...` 経由の root資源依存 hook を取りこぼす＝root-only は明示リストが single source（機構: propagate-hooks.mjs ROOT_ONLY_HOOK_NAMES）
- [S✓] 2026-06-20 `generate-hook-manifest.mjs` の expected 算出を「ディスク全 .mjs 駆動」→「root .claude/settings.json の .mjs 登録駆動」へ根治（旧: product 固有 hook=queue-guard-gate/session-start-tone まで expected 入り→checker(c) が root 未登録で FAIL／matcher borrow 不能で (unknown) 化）。新方式は product固有/orphan/root専用/.sh を自動除外し matcher/event を実登録から取得（unknown 消滅）。SKIP_HOOKS に checkin-hook を補い propagate ROOT_ONLY ∪ {hook-runner} と整合。regen は冪等で安全になった（機構: generate-hook-manifest.mjs parseRootRegisteredHooks + 3モード検証）
- [S✓] 2026-06-20 定数の二重管理（SKIP_HOOKS ⇔ propagate ROOT_ONLY_HOOK_NAMES）は片側更新漏れでドリフトする→純データモジュール `scripts/_lib/root-only-hooks.mjs` に single source 化し両者が import。ただし propagate-hooks.mjs は isMain ガード無しで top-level 実行（import するだけで伝播副作用が走る）ため、定数共有は「副作用ある module を import」でなく「副作用ゼロのデータ module を双方が import」で実装せよ。検証は propagate 実走（冪等 0/N updated）＋ generator 3モードで両 consumer の runtime 健全性を確認

- [S✓] 2026-05-26 hook-runner pass-through は機能停止隠蔽リスクあり・`~/.claude/logs/hook-errors.jsonl` を定期 grep して SyntaxError / ERR_MODULE_NOT_FOUND を検知（機構: scripts/check-hook-runtime-errors.mjs + check-in A-22。exit_code=1 隠れ故障を検知）
