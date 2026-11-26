# plan: E-1 memory 圧縮 + 巨大ファイル分割（ponchi 除外・3件）— 2026-06-12

> 起草・承認・実走: 2026-06-12 司令塔セッション（起草時の作業 path: `~/.claude/plans/tender-wandering-music.md`・本ファイルは git 管理用正本コピー）

## ⚠ 危険項目

1. `.claude/hooks/line-count-gate.mjs` 正本の編集は **propagate により全製品（23 配布先）へ波及**する。除外正規表現を誤ると全製品の Write/Edit が誤 block / 素通りになる → B3 の CLI 両面検証（除外 path 通過 + 非除外 path block）で担保
2. aiueo / foodee は**本番稼働中の承認済みコード**。分割は「移動 + import 参照化」のみ・ロジック書換厳禁・各 Part でマスター目視を commit 前ゲートとする

> ゲート照合（Stage 0.5）: 本 plan は製品サイクルのフェーズ前進を含まない司令塔横断保守タスクのため G-PN 転記対象外（checklist-version 1.0 照合済・2026-06-12）

## Context

pc-checkin の機械検証で E-1 NG（product memory.md 15 行上限超過 3 件）を検知し、マスター合意で「3 件とも今すぐ圧縮修正 → 次タスクは P1-1 巨大ファイル分割」と決定した。P1-1 は「テスト整備 → 計画報告 → 承認の別 plan」が着手条件であり、本 plan がその計画報告にあたる。起草中のマスター判断 2 件（AskUserQuestion 証跡・2026-06-12）:

1. **ponchi-v2.html（2135 行・納品正本・HTML マークアップ約 1600 行）は line-count-gate 除外登録とし分割対象外**（分割は 4 件 → 3 件に縮小）
2. **renai-game は「単一 HTML+vanilla 維持」制約下で CSS/JS 外出しを許可**（vanilla・ビルド工程なし・DB なしは維持）

## 上位 plan からの constraint 変更

| 上位（出典） | 該当項目 | 本 plan での扱い |
|---|---|---|
| vibe-base/memory.md P1-1 | 巨大ファイル「4 件」分割 | ponchi-v2.html を分割対象から除外し **3 件に縮小**。代替として gate 除外登録を新規 scope 化（マスター承認 2026-06-12） |
| renai-game 自治憲法 §1 | 単一 HTML+vanilla 維持 | CSS/JS/SVG の外部ファイル化を許可（フレームワーク/ビルド/DB 禁止は維持・マスター承認 2026-06-12） |
| aiueo 自治憲法 §1 | 承認済みコード変更禁止・UI 刷新は Opus 限定 | 本 plan 承認 = マスター明示指示。実装 agent のモデルは **opus** を保守適用 |
| foodee 自治憲法 §1 | 承認済みコード変更禁止 | 本 plan 承認 = 明示承認。分割は「移動 + import 参照化」のみ・ロジック書換禁止 |
| マスター口頭指示（本セッション） | E-1 3 件とも圧縮 | learning-suite-kanji は他セッション WIP のため **WIP 内容非破壊の最小修正（16→15 行）** に限定 |

## 影響範囲

### Part A — E-1 memory.md 圧縮（修正 3・新規 1・追記 1）

- 修正: `products/renai-game/memory.md`（37→15 行以内・司令塔依頼セクション L4-23 を archive へ退避）
- 新規: `archive/renai-game-memory-202606.md`（**Glob 照合済 2026-06-12: 不在を確認**。命名は既存慣行 `{product}-memory-YYYYMM.md` に一致）
- 修正: `products/new-trimmer-system/memory.md`（19→15 行以内・補足 4 行をポインタ 1 行化）+ 追記: `archive/new-trimmer-system-memory-202606.md`（既存確認済）
- 修正: `products/learning-suite-kanji/memory.md`（16→15 行・P2-P4 ポインタ行の統合等、ミッション本文 L6-10 に触れない）

### Part B — ponchi gate 除外（修正 1 + 全製品配布）

- 修正: `.claude/hooks/line-count-gate.mjs`（正本）の `EXCLUDE_PATH` に `design-samples` ディレクトリを追加（**HARD BLOCK 経路: orchestrator 直 Edit・subagent 不可**）
- 配布: `node scripts/propagate-hooks.mjs` で全製品 `.claude/hooks/` へ同期（実体確認済: スクリプト存在）

### Part C/D/E — 分割 3 件（製品ごとに独立・順序 = aiueo → renai-game → foodee）

- C: `products/aiueo/app/frontend/src/components/desktop-layout.jsx`（1744 行）→ `src/components/tabs/`（DashboardTab / OrdersTab / SalesTab / CouponsTab / SettingsTab）+ `src/utils/`（音声通知・翻訳）
- D: `products/renai-game/index.html`（1713 行）→ `styles.css` + `js/`（game-engine / ui-renderer / storage-sync / event-handlers / constants / ending-art）
- E: `products/foodee/app/public/index.html`（1697 行）→ CSS 外出し + `js/`（firebase-client / feed-manager / article-renderer / onboarding / event-handlers）+ **playwright smoke テスト新設**（foodee はテスト完全不在のため整備が分割の前提）

## サブエージェント割り振り方針

- 調査は explore-agent で完了済（本セッション・構造調査 2 体）。実装は implement-agent、検証は verify-agent（Worker/Evaluator 分離）
- モデル既定: implement=sonnet / verify=haiku。**上書き 1 件**: Part C（aiueo）の implement は **opus**（根拠: 自治憲法 §1「UI 改修 Opus 限定（Sonnet 禁止）」の保守適用）
- `.claude/` 配下（Part B の hook 編集）は orchestrator 直 Edit（Self-Modification HARD BLOCK・subagent 不可）
- 各 implement step の prompt に対象実体ファイルと本 plan path を `@` 注入する（コンテキスト継承断絶防止）。各 step 完了時に plan を re-read してから次へ
- 検証スクリプト実行（`bash scripts/check-in-verify.sh` / `node scripts/*.mjs`）は verify-agent の Bash allowlist 外のため orchestrator が実行する
- 規模配分: Part A+B は本セッション内で完遂。Part C/D/E は 1 Part = 1 まとまりで順次実行し、各 Part 完了ごとに目視確認 → `git diff --stat` 提示 → マスター承認 → commit（セッションを跨ぐ場合は checkout で引継ぎ）

## 実装ステップ

### Part A — E-1 圧縮（即時）

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|---|---|---|---|---|---|
| A0 | 着手前照合: 対象 3 memory.md + archive 既存ファイルを `test -f` で確認 | orchestrator | fable | — | 全 path 存在 |
| A1 | `archive/renai-game-memory-202606.md` 新規作成（司令塔依頼 L4-23 を全文退避）+ renai-game/memory.md を 15 行以内へ圧縮 | implement-agent | sonnet | @products/renai-game/memory.md, @archive/new-trimmer-system-memory-202606.md（書式参考）, @\<plan path\> | `wc -l` ≤15 |
| A2 | new-trimmer-system/memory.md の補足 4 行を archive 既存ファイル末尾へ追記し、本体は参照ポインタ 1 行化 | implement-agent | sonnet | @products/new-trimmer-system/memory.md, @archive/new-trimmer-system-memory-202606.md, @\<plan path\> | `wc -l` ≤15 |
| A3 | learning-suite-kanji/memory.md を 1 行のみ削減（P2-P4 ポインタ統合等・P1 ミッション本文に触れない） | implement-agent | sonnet | @products/learning-suite-kanji/memory.md, @\<plan path\> | `wc -l` ≤15 + `git diff` で WIP 行不変 |
| A4 | `bash scripts/check-in-verify.sh` 再実行 | orchestrator | fable | — | E-1 区切り FAIL 0 件 |

### Part B — ponchi gate 除外（即時）

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|---|---|---|---|---|---|
| B1 | line-count-gate.mjs 正本の `EXCLUDE_PATH` に `design-samples` を追加（コメントに除外理由 1 行） | orchestrator（HARD BLOCK） | fable | — | `node --check` EXIT 0 |
| B2 | `node scripts/propagate-hooks.mjs` で全製品配布 → `node scripts/check-hook-integrity.mjs` | orchestrator | fable | — | PASSED |
| B3 | gate CLI 検証: ponchi-v2.html path の JSON を stdin 投入し block 出力が出ないこと + 非除外の 500 行超 path は引き続き block | orchestrator | fable | — | stdout 照合 |

### Part C — aiueo desktop-layout.jsx 分割

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|---|---|---|---|---|---|
| C1 | 分割前 GREEN 記録: `npm test` + `npm run build` | verify-agent | haiku | — | EXIT 0 を記録 |
| C2 | タブ 5 件を 1 件ずつ `tabs/*.jsx` へ切り出し（移動 + props/import のみ・1 件ごとに build） | implement-agent | opus（§1 UI 改修 Opus 限定） | @products/aiueo/app/frontend/src/components/desktop-layout.jsx, @\<plan path\> | 各回 `npm run build` EXIT 0 |
| C3 | 音声通知 / 翻訳ユーティリティを `src/utils/` へ抽出 | implement-agent | opus | 同上 | `npm run build` EXIT 0 |
| C4 | 分割後検証: `npm test` + `npm run build` + 全ファイル `wc -l` ≤500 | verify-agent | haiku | @\<plan path\> | C1 と同一 GREEN |
| C5 | マスター目視（ローカル起動 or Vercel preview）→ `git diff --stat` 提示 → 承認後 commit | orchestrator + マスター | fable | — | 目視承認 |

### Part D — renai-game index.html 分割

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|---|---|---|---|---|---|
| D1 | 分割前 GREEN 記録: `scripts/e2e-smoke.mjs` ほか既存検証スクリプト 4 本 | orchestrator | fable | — | EXIT 0 を記録 |
| D2 | CSS（約 180 行）を `styles.css` へ外出し → smoke 再実行 | implement-agent | sonnet | @products/renai-game/index.html, @\<plan path\> | smoke EXIT 0 |
| D3 | SVG エンディングアート（約 600 行）を `js/ending-art.js` へ外出し | implement-agent | sonnet | 同上 | smoke EXIT 0 |
| D4 | JS を 1 モジュールずつ分割（constants → storage-sync → game-engine → ui-renderer → event-handlers の順・`<script>` 順序は元のインライン順を維持） | implement-agent | sonnet | 同上 | 各回 smoke EXIT 0 |
| D5 | 検証スクリプト 4 本再実行 + 全ファイル `wc -l` ≤500 | orchestrator + verify-agent | fable/haiku | @\<plan path\> | D1 と同一 GREEN |
| D6 | マスター目視 → `git diff --stat` 提示 → 承認後 commit | orchestrator + マスター | fable | — | 目視承認 |

### Part E — foodee index.html 分割（テスト整備が前提）

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|---|---|---|---|---|---|
| E1 | playwright smoke 新設（ページロード・認証画面描画・console error 0 まで。Firebase 外部通信に依存しない範囲と宣言） | implement-agent | sonnet | @products/foodee/app/public/index.html, @\<plan path\> | smoke EXIT 0 |
| E2 | 分割前 GREEN 記録: smoke + `npm run build` | orchestrator | fable | — | EXIT 0 を記録 |
| E3 | CSS（約 450 行）外出し → smoke 再実行 | implement-agent | sonnet | 同上 | smoke EXIT 0 |
| E4 | JS を 1 モジュールずつ分割（firebase-client → feed-manager → article-renderer → onboarding → event-handlers） | implement-agent | sonnet | 同上 | 各回 smoke EXIT 0 |
| E5 | 分割後検証: smoke + `npm run build` + 全ファイル `wc -l` ≤500 | verify-agent | haiku | @\<plan path\> | E2 と同一 GREEN |
| E6 | マスター目視 → `git diff --stat` 提示 → 承認後 commit | orchestrator + マスター | fable | — | 目視承認 |

### 最終

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|---|---|---|---|---|---|
| F1 | 受け入れ基準全件の機械検証（PASS/FAIL 表） | verify-agent | haiku | @\<plan path\> | 全 PASS |
| F2 | 最終 Glob 照合（plan 記載の全新規 path 存在確認）+ memory.md P1 更新 | orchestrator | fable | — | 全 path 存在 |

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則） |
|---|---|---|
| hook 編集が permission/分類器に block される | Edit 時 block 出力 | P3 先例（2026-05-31）どおりマスター手動編集へ即移行・sed 等の迂回禁止 |
| aiueo タブ切り出しで state/props 受け渡し漏れ | `npm run build`/`npm test` FAIL・目視 NG | 原則 2: 当該タブのみ revert し再切り出し（1 機能ずつの原則に戻る） |
| renai-game の script 外出しで定義順序が崩れ実行時エラー | e2e-smoke EXIT≠0 | 原則 3: `<script>` タグを元のインライン定義順と同順に列挙・module 化は最小限 |
| foodee smoke が Firebase 通信不能で不安定 | smoke が再現不能・flaky | 原則 3: smoke 範囲を「認証画面描画 + console error 0」に固定し外部依存を遮断 |
| learning-suite-kanji の WIP 差分と競合 | `git diff` に意図外の行 | 原則 1: 即 revert し「16 行のまま保留」をマスター報告（ゴール = E-1 解消は次善手段で再検討） |
| 切り出し先ファイルが 500 行超過で gate 発火 | gate block 出力 | code-splitting スキル原則 4: さらに分割 |
| propagate 後の integrity 不一致 | check-hook-integrity FAIL | 原則 2: 正本から再配布・手動コピー（`cp -f`）で byte 一致させる |

## テスト方針

1. Part A: `bash scripts/check-in-verify.sh` → E-1 区切り FAIL 0 件（受け入れ基準 1-3 と対応）
2. Part B: `node --check` + `node scripts/check-hook-integrity.mjs` PASSED + gate CLI stdin 投入テスト（受け入れ基準 4-5 と対応）
3. Part C: `npm test` / `npm run build` の分割前後 GREEN 一致（受け入れ基準 6-7 と対応）
4. Part D: 既存検証スクリプト 4 本（e2e-smoke / bugcheck2 / bugcheck3-sync-loss / verify-memory-quest）の分割前後 GREEN 一致（受け入れ基準 8 と対応）
5. Part E: 新設 playwright smoke + `npm run build` の分割前後 GREEN 一致（受け入れ基準 9 と対応）
6. 全分割対象・切り出し先の `wc -l` ≤500（受け入れ基準 6/8/9 と対応）
7. 各 Part 完了時にマスター目視（受け入れ基準 10 と対応）

## 受け入れ基準

EARS: WHEN check-in-verify.sh を実行した THE SYSTEM SHALL E-1 行数ゲートを FAIL 0 件で通過する。WHEN 分割対象 3 ファイルを編集する THE SYSTEM SHALL line-count-gate に block されない行数で保守できる。WHEN ponchi-v2.html を編集する THE SYSTEM SHALL design-samples 除外により gate を通過する。

1. E-1 解消 — Run: `bash scripts/check-in-verify.sh` / Expected: E-1 区切り FAIL 0 件（集計 NG 0）
2. memory.md 3 件の行数 — Run: `wc -l products/renai-game/memory.md products/new-trimmer-system/memory.md products/learning-suite-kanji/memory.md` / Expected: 各ファイル ≤ 15 行
3. archive 退避実体 — Run: `test -f archive/renai-game-memory-202606.md` / Expected: EXIT 0
4. hook 配布整合 — Run: `node scripts/check-hook-integrity.mjs` / Expected: "hook integrity check PASSED"
5. gate 除外動作（両面） — Run: `echo '{"tool_input":{"file_path":"products/trimmer-system/src/design-samples/ponchi-v2.html"}}' | node .claude/hooks/line-count-gate.mjs` / Expected: stdout 空・EXIT 0（block なし）。対照: 非除外の 500 行超 path では `decision:"block"` 出力
6. aiueo 分割行数 — Run: `wc -l products/aiueo/app/frontend/src/components/desktop-layout.jsx products/aiueo/app/frontend/src/components/tabs/*.jsx` / Expected: 全ファイル ≤ 500 行（utils 切り出し先含む）
7. aiueo 回帰 — Run: `npm test && npm run build`（cwd: products/aiueo/app/frontend） / Expected: 両方 EXIT 0（C1 記録の分割前 GREEN と一致）
8. renai-game 分割・回帰 — Run: `wc -l products/renai-game/index.html products/renai-game/styles.css products/renai-game/js/*.js` + 検証スクリプト 4 本（e2e-smoke / bugcheck2 / bugcheck3-sync-loss / verify-memory-quest・cwd: products/renai-game） / Expected: 全ファイル ≤ 500 行・4 本とも EXIT 0（D1 記録の分割前 GREEN と一致）
9. foodee 分割・回帰 — Run: `wc -l products/foodee/app/public/index.html products/foodee/app/public/js/*.js` + 新設 playwright smoke + `npm run build`（cwd: products/foodee/app） / Expected: 全ファイル ≤ 500 行・smoke / build とも EXIT 0（E2 記録の分割前 GREEN と一致）
10. マスター目視 + commit 承認証跡 — Run: `git log --format=%s -n 5` / Expected: 各 Part の commit が存在（commit は「マスター目視 + `git diff --stat` 提示 → 承認後」のみ実行する運用のため、commit 存在 = 目視承認の証跡）

## 承認後モード

default（理由: 判定軸 1 — 影響範囲に protected path `.claude/hooks/line-count-gate.mjs` を含む。加えて判定軸 2（マスター目視 = 手動 Step C5/D6/E6）・判定軸 4（新規ファイル ≥ 1）にも該当）

## 実走記録（2026-06-12 完遂）

- マスター判断の実績: ponchi gate 除外 / renai-game CSS/JS 外出し許可 / E-1 3 件圧縮 / 目視 OK（3 製品）
- 実走中の合理的進化（受け入れ基準内・4 原則適用）: ①C3 utils 抽出は C2 完了時点で 493 行に到達したため不要としてスキップ ②hook 編集は HARD BLOCK 発火 → P3 先例どおり tmp 配置 + マスター `cp -f` 手動コピーに切替 ③renai-game 検証スクリプト 2 本（verify-memory-quest / e2e-smoke）の読込部のみ分割追従修正（検証パターン・判定基準は不変・分割前後の内容一致は git 旧版と機械照合で破損ゼロ確認） ④foodee css は 758 行のため base.css / screens.css の 2 分割
- 既知の残課題: aiueo 画像ピッカー `assignImage()` 未定義参照は**分割前からの既存バグ**をそのまま移送（修正は本 plan 範囲外）/ learning-suite-kanji/memory.md の E-1 修正は他セッション WIP 同居のため未コミット
