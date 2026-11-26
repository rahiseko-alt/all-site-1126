# plan — 虎の巻×ポートフォリオ統合（registry単一正本・2ビュー生成）

> 起草: 2026-06-10 / 担当: vibe-base 司令塔 / 進捗正本: 本ファイル（`~/.claude/plans/` は git 管理外・消失リスクのため docs/ops/plans に正本化）

## Context

なぜやるか:
- HTML虎の巻（`docs/html-toranomaki/`・内部知識ベース）と Creative Portfolio Portal（`agent-ag/`・公開ダッシュボード）が**別資産として二重管理**されている。実態として同じ流体デモが `docs/html-toranomaki/webgl-fluid-autoplay/impl-webgl-2.0/`（js/app.js）と `agent-ag/webgl-fluid-demo/`（script.js）に**構造違いの重複コピー**で存在する。
- マスター要望: 1つの原本から「開発サイド（コード・readme 全部見える＝虎の巻）」と「クライアント向けポートフォリオ（コードの知識層は見せない）」の2ビューを出す。どのフォルダのエージェントからも登録できるようにしたい。

確定済みの方針（マスター決定）:
1. **1正本・2ビルド**（1画面モード切替でなく、データ層＋2ビュー）
2. **2-A**: 原本は社内 `docs/`、公開 `agent-ag` はビルド出力だけ受け取る
3. **運用形式**: 「虎の巻に加えよう」＝虎の巻のみ / 「ポートフォリオにも出しとけ」＝両方 / 後日「ポートフォリオに出して」＝昇格。3状態（虎のみ / 両方 / 後で昇格）を `portfolio` フラグで表現
4. **1-b**: intake は SessionStart hook で半自動（中央書込は司令塔セッションに集約・コミットはマスター承認）
5. **Q3-a**: 既存 `html-toranomaki-add/use` を拡張（新スキル乱立しない）
6. **コード保護 = 知識層のみ秘匿**: 公開ビルドは concept.md / research-log.md / 技術解説を**コピーしない**。実行 JS はデモ動作に必須なのでそのまま（ブラウザ上どうせ可視＝完全秘匿は物理的に不可、という現実解）
7. **今回スコープ**: 仕組み構築 ＋ `webgl-dye-flow`（染料の流れ）1件をエンドツーエンドで通す。既存ポータル他4デモ（Constellations / Solar System / Anime.js×2）の正本化は**後続**

到達点: 染料の流れが「虎の巻に impl・concept・research があり、かつポータルに portfolio:true で1枚生成表示され、ポータル側には知識層が出ない」状態を、registry・skill・intake・build の仕組み込みで達成し、司令塔がコミットする。

## 上位 plan からの constraint 変更

- 新規 hook（SessionStart）配備を含む。**PreToolUse:Bash matcher の HARD BLOCK 対象ではない**が、`settings.json` 編集は Self-Modification 扱い → orchestrator 直接編集 ＋ `hook-integrity-manifest.json` 追記 ＋ CLI 単体テスト ＋ `propagate-hooks.mjs` 伝播の正規手順を踏む（failures.md 2026-05-23/24）。
- registry を `docs/html-toranomaki/registry.json` に置く（`docs/ops/` 外なので **area-gate.mjs の未登録ブロック対象外**・追加登録不要）。
- スキル正本は `~/.claude/skills/`（独立 repo `rahiseko-alt/claude-skills-base`）。skill 改修は vibe-base コミットと**別管理**。outside-vibe-base-gate は `~/.claude/` を許可済み。

## 影響範囲

| 種別 | パス | 変更 |
|---|---|---|
| 新規 | `docs/html-toranomaki/registry.json` | 単一正本メタ層（slug/title/blurb/tags/impl/portfolio/order/codeVisible） |
| 新規 | `scripts/build-portfolio.mjs` | registry→ポータルカード生成 ＋ impl 実行ファイルのみ agent-ag へコピー（知識層除外） |
| 新規 | `scripts/toranomaki-intake.mjs` | outbox 回収エンジン（検証→配置→registry更新→build 呼出）。手動実行も可 |
| 新規 | `.claude/hooks/session-start-toranomaki.mjs` | SessionStart 薄ラッパ。司令塔セッション ＋ pending 有り時のみ engine 起動、product セッションは通知のみ |
| 編集 | `.claude/settings.json` | `hooks.SessionStart` に上記登録（正規手順） |
| 編集 | `scripts/hook-integrity-manifest.json` | intake hook の expected entry 追記 |
| 編集 | `docs/html-toranomaki/RULES.md` | §8 registry / portfolio / intake 運用を追記 |
| 編集 | `~/.claude/skills/html-toranomaki-add/SKILL.md` | registry 書込 ＋ portfolio フラグ ＋ product 時は outbox 投函 ＋ 昇格モード |
| 編集 | `~/.claude/skills/html-toranomaki-use/SKILL.md` | 「ポートフォリオのN番」= registry order 解決を追加 |
| リネーム | `docs/html-toranomaki/webgl-fluid-autoplay/` → `webgl-dye-flow/` | 中断中の作業を再開。impl/concept/research の内部参照（出典 webgl-fluid-autoplay.html 等）と backup ファイル名を整合 |
| 編集/削除 | `agent-ag/creative-portfolio-portal.html` | AUTO マーカー区画を新設、旧 fluid カードを生成カードに置換。他4カードは温存 |
| 削除 | `agent-ag/webgl-fluid-demo/` | 重複コピー。生成 `agent-ag/webgl-dye-flow/` に置換 |
| 削除 | `scripts/_tmp-shot.mjs` | 司令塔が調査で作った一時スクショ用。コミット前に除去 |

## 実装ステップ

| # | 内容 | 受入#紐付け | 検証 |
|---|---|---|---|
| 0 | 本 plan を `docs/ops/plans/2026-06-10-toranomaki-portfolio-integration.md` へコピー・memory.md P1 に plan path 記載 | A1 | `test -f` |
| 1 | `registry.json` スキーマ確定＋初版（dye-flow 1件・portfolio:true・order:1・codeVisible:false） | A2 | `node -e JSON.parse` |
| 2 | リネーム `webgl-fluid-autoplay`→`webgl-dye-flow`（dir＋backupの*-autoplay.html）。内部参照を webgl-dye-flow.html へ更新、concept.md H1/index.html title を「染料の流れ」化。`docs/ops/webgl-fluid-knowhow.md` 出典パスは原典名のため不変 | A3 | grep 残存0・blindtest |
| 3 | `scripts/build-portfolio.mjs`: registry読込→portfolio:true抽出→agent-ag/{slug}/へ impl 実行ファイル（index/css/js）のみコピー→ポータル AUTO 区画にカード生成。concept/research は**コピーしない** | A4 | 実行後 `ls agent-ag/webgl-dye-flow` に md 無し |
| 4 | ポータル HTML に `<!-- AUTO:registry-cards -->…<!-- /AUTO -->` 区画新設。旧 webgl-fluid-demo カード除去・`agent-ag/webgl-fluid-demo/` 削除。他4カードは AUTO 区画外で温存 | A4 | 目視・playwright |
| 5 | `scripts/toranomaki-intake.mjs`: `products/*/.toranomaki-outbox/*/meta.json` 走査→blindtest→`docs/html-toranomaki/{slug}/`配置→registry更新（json-canary経由）→build呼出→**unstaged のまま終了**（auto-commit 禁止）。`--dry-run` 対応 | A5 | dry-run でfixture投函を検出 |
| 6 | `.claude/hooks/session-start-toranomaki.mjs`（薄ラッパ）＋ CLI 単体テスト＋ `hook-integrity-manifest.json` 追記＋ `settings.json` SessionStart 登録（orchestrator 直接）＋ `propagate-hooks.mjs` | A6 | `echo '{}'｜node hook` EXIT0・整合チェック |
| 7 | skill 拡張: add（portfolio フラグ／outbox 投函／昇格）・use（order 解決）。`~/.claude/skills/` 正本を編集 | A7 | SKILL.md 記述照合 |
| 8 | RULES.md §8 追記（registry・portfolio 3状態・intake 経路・知識層秘匿の明文化） | A8 | 参照整合 |
| 9 | エンドツーエンド検証→マスターへ diff 提示→**司令塔コミット**（虎の巻分＋仕組み分。混入 MISSION_LOG 等は明示パスで除外） | A9 | 下記テスト方針 |

## リスク

| リスク | 対策 |
|---|---|
| SessionStart hook が product セッションで docs/・agent-ag を汚し git 混線 | hook は司令塔セッション（CLAUDE_PROJECT_DIR==vibe-base root）でのみ書込。product では通知のみ・無書込 |
| intake が auto-commit してマスター承認を飛ばす | engine は unstaged 終了で固定。コミットは司令塔＋マスター承認のみ（no-auto-checkout 規律） |
| registry の壊れ JSON で build/intake が連鎖崩壊 | 書込は `scripts/_lib/json-canary.mjs` 経由（fixture canary＋sha256）。build は parse 失敗時 EXIT≠0 で停止 |
| 「コードを隠せている」という誤解 | plan/RULES に「実行 JS は可視・秘匿対象は知識層」を明記。最初から誤認させない |
| settings.json 編集の Self-Modification 事故 | 正規手順（manifest＋CLI test＋propagate）を step6 に内包。Bash matcher は触らない |
| ポータル他4カードを生成が破壊 | 生成は AUTO マーカー区画限定・区画外は不可侵 |

## テスト方針

- blindtest: `node scripts/toranomaki-blindtest.mjs webgl-dye-flow impl-webgl-2.0` → EXIT 0
- build: `node scripts/build-portfolio.mjs` → ポータルに「染料の流れ」カード生成・`agent-ag/webgl-dye-flow/` に index/css/js のみ（`*.md` 不在を `ls` で確認＝知識層秘匿の機械検証）
- ポータル目視: playwright で `agent-ag/creative-portfolio-portal.html` 撮影→染料の流れカード表示・iframe 動作・他4カード健在・JS エラー0
- intake: fixture の `products/<dummy>/.toranomaki-outbox/` を作り `node scripts/toranomaki-intake.mjs --dry-run` → 検出・配置予定・registry diff を表示（本番未変更）
- hook: `echo '{"hook_event_name":"SessionStart"}' | node .claude/hooks/session-start-toranomaki.mjs` → EXIT0、司令塔/ product 判定の分岐動作
- registry: `node -e "JSON.parse(require('fs').readFileSync('docs/html-toranomaki/registry.json'))"` 成功
- hook 整合: `node scripts/check-hook-integrity.mjs`（manifest 一致）・`bash scripts/check-in-verify.sh` で退行なし

## 受け入れ基準

1. A1 plan 正本化 — 本 plan が `docs/ops/plans/2026-06-10-toranomaki-portfolio-integration.md` に存在し memory.md P1 に plan path 常駐（`test -f` ＋ grep）
2. A2 registry 妥当 — `registry.json` が `node -e JSON.parse` 成功・dye-flow が portfolio:true/order:1 で登録（grep）
3. A3 リネーム完了 — `docs/html-toranomaki/webgl-dye-flow/` 実在・旧スラッグ `webgl-fluid-autoplay` 参照0（`grep -r`）・blindtest EXIT0・表示名「染料の流れ」が concept.md H1/index.html title に反映
4. A4 ビルド生成 — `node scripts/build-portfolio.mjs` 後にポータルへ染料の流れカードが registry 由来で生成・他4カード健在・`ls agent-ag/webgl-dye-flow/` に `*.md`（知識層）が存在しない
5. A5 intake 安全 — `node scripts/toranomaki-intake.mjs --dry-run` が fixture outbox を検出し registry 更新を json-canary 保護で提示・本番ファイル未変更（sha256/diff）
6. A6 hook 健全 — `echo '{...}' | node .claude/hooks/session-start-toranomaki.mjs` EXIT0・`check-hook-integrity.mjs` 整合・product セッションで無書込（通知のみ）を機械確認
7. A7 skill 拡張 — `html-toranomaki-add` に portfolio フラグ/outbox 投函/昇格、`html-toranomaki-use` に order 解決が SKILL.md へ記述（grep 照合）
8. A8 RULES 明文化 — `RULES.md` §8 に registry・portfolio 3状態・intake 経路・知識層秘匿が記載（grep 照合）
9. A9 統合検証 — テスト方針の全コマンド EXIT0 ＋ ポータル playwright 目視 OK ＋ マスター diff 承認後に司令塔コミット（混入 MISSION_LOG 等を明示パスで除外）

## 承認後モード

- 既定: 司令塔セッションで orchestrator が直接実装（settings.json・hook・registry・agent-ag 横断のため product エージェント委譲不可）。
- step2 リネーム・step3-5 スクリプト・step8 RULES は implement 相当を orchestrator が逐次。
- step6 の settings.json/hook は破壊的設定変更ゲートに該当 → orchestrator 直接・マスター可視で実施。
- step9 コミット前に verify 観点（blindtest/build/hook 整合/混入0）を全通ししてから diff 提示。
