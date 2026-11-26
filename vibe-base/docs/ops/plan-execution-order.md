# 監査 2026-07 改善 plan 群 — 実行順の単一正本

> 確定: 2026-07-10（マスター承認）
> 対象: `docs/audits/ops-improvement-scan-2026-07.md` から起票された 7 本の plan
> **順序を変えるにはマスター承認が要る。** 実行者が独断で入れ替えるな。

## 実行順（1 本ずつ直列。並列実行は禁止）

| # | plan | 担当リスト | 触る共有ファイル |
|---|---|---|---|
| 1 | `~/.claude/plans/temporal-gliding-turing.md` | ② allow 追加（A-1〜A-21） | `settings.local.json` / `settings.json` |
| 2 | `~/.claude/plans/vibe-base-e-group-remediation.md` | ④ 環境改善（E-1〜E-9） | `settings.local.json` / `settings.json` / `hooks/` |
| 3 | `~/.claude/plans/vibe-base-s-group-remediation.md` | S群 ガバナンス | `check-in-verify.sh`(A-25) / `hooks/` |
| 4 | `~/.claude/plans/valiant-shimmying-stearns.md` | 自己学習ループ | `check-in-verify.sh`(A-27) / `checkout/SKILL.md` |
| 5 | `~/.claude/plans/vibe-base-m-group-remediation.md` | ⑤ 仕組み改善（M-1〜M-8） | `check-in-verify.sh`(A-26) / `checkout/SKILL.md` / `settings.json` |
| 6 | `~/.claude/plans/concurrent-wiggling-avalanche.md` | ③ 自動実行化（C-0〜C-7） | `check-in-verify.sh`(A-28) / `hooks/` / `settings.json` |
| 7 | `~/.claude/plans/soft-swimming-sunbeam.md` | ① skill 化（S-1〜S-8） | skill のみ（共有ファイルなし） |

## 順序の根拠

- **1 位が②**: 摩擦の削減が最大。`path-resolver` の許可だけで月 110 回の確認プロンプトが消える。効果が即日出る。
- **2 位が④**: ②の直後に settings を仕上げる。両者は `settings.local.json` を触るため**同時併走禁止**。
  なお **④の E-1（危険系 allow 38 件の削除）は 2026-07-10 に実行済**（commit `69c34aa`）。残りは E-2 以降。
- **4 位 → 5 位は依存**: 自己学習ループと⑤は同じ `checkout/SKILL.md` を改修する。**自己学習が先**でなければ⑤の差分が壊れる。
- **6 位が③**: `transcript-audit.mjs` の恒久昇格など、他 plan の成果物に乗る箇所がある。最後に置く。
- **7 位が①**: 共有ファイルを触らず依存もない。いつ走らせてもよいが、効果が薄いため最後。

## 絶対規律

1. **1 本ずつ直列に走らせる。** 2 本を並行セッションで同時に走らせるな。共有ファイルの変更が片方消える。
2. **各 plan の着手時に、触る共有ファイルの現物を Read してから diff を作る。** 前の plan が変更している。
3. **check-in の番号は台帳で確定済**（`docs/ops/check-in-number-registry.md`）。実行時に採番するな。
4. **1 本完了ごとに commit してから次へ進む。** 途中で止まっても次の AI が再開できる状態にする。

## 実行規律（2026-07-10 マスター指示・hook で機械強制）

1. **本ファイルは毎セッションの Check-in で自動注入される**（`.claude/hooks/session-start-handover-inject.mjs`）。読まずに着手するな。
2. **寄り道禁止。** 実行中に想定外の事態を検知しても、**まず現在の plan を完走する**。
3. 寄り道で発見した問題は、その場で直さず下の「実行中に発見した問題」節へ**併記追加**する。
4. **全 7 本が完了したら本ファイルを削除する**（役目終了。hook はファイル不在なら無通知で skip する）。

## 実行中に発見した問題（併記のみ・その場で直すな）

> **決着（2026-07-13・master 裁定）— 本表の課題は全件クローズ済:**
> - **#3（git deny 前方一致バイパス・下表 git clean 関連行）→ 修正済**: `pre-bash-destructive.mjs` に dry-run 基準の git clean 検知を追加（commit `64efbf4`）。検証パネル①②③ 2ラウンドで反証・強化し、realistic な単一 git clean（逆順 `-df`・大文字 `Git`・グローバルオプション前置 `git -C X clean`・requireForce 回避 `git clean -d`・pathspec 偽装）を全封鎖。残存（フルパス起動＝ask-default で承認プロンプト／alias 間接＝2手の意図的難読化）は全 destructive matcher 共通の単独 prefix 原理限界として canonical に明記。
> - **他の「起票のみ」（`^` アンカー未検知・`node -e` 検知拡充・git deny 前方一致の hook 化・`audit-local-allow` 検知漏れ 等）→ 認定しない**: master「他は問題認定しない」（2026-07-13）。全 destructive matcher 共通の単独 prefix マッチ原理限界の族であり、#1 で de-scope 済。
> - **「放置／仕様受容」（`secret-write-gate`/`post-bash` 453件故障・`feed-fetch` dedup すり抜け・⑤ M 群中止 等）→ 放置指定で確定**（master「見つけた問題は放置しろ」2026-07-12）。
>
> ＝ 監査2026-07 の 7 プランに紐づく残存課題は **修正・認定しない・放置のいずれかで全件決着**。未対応ゼロ。

| 発見日 | 発見時の plan | 問題 | 対応 |
|---|---|---|---|
| 2026-07-10 | ④ E-1 再達成 | `.claude/hooks/pre-bash-destructive.mjs` の matcher が全て `^` アンカーで、`bash -c "rm -rf /"` / `sh -c "rm -rf ~"` / `env rm -rf /` を取りこぼす（実測）。S 群 S-5 が本 hook を「変更禁止・読むだけ」と明記 | **起票のみ**。8 本目 plan 化か③合流かマスター判断待ち |
| 2026-07-10 | ④ E-1 再達成 | `settings.json` の ask から `Bash(find:*)` を撤去しようとすると auto mode classifier が「権限緩和の自己改変」として block する | ask 据え置きで決着（撤去しても安全性は不変） |
| 2026-07-10 | S群 S-4 | `line-count-gate` hook が静的ドキュメント HTML（641 行 / 900 行）にも発火する。バナー 1 行の追記でも block 相当の警告が出る。歴史資料の分割は S-4 の「ファイル移動・改名はしない（最小侵襲）」方針に反するため実施せず | **起票のみ**。hook の除外パターンに `docs/**/*.html` 等の静的資料を加えるか要判断 |
| 2026-07-10 | S群 S-4 | plan 指定のバナー HTML は `<code>` に inline style が無く、対象ページの既存 CSS（暗色 code 背景）と衝突して**黒地に黒文字で判読不能**だった | S-4 内で修正。文言は plan どおり据え置き、`<code>` に inline style を付与して自己完結させた |
| 2026-07-10 | S群 S-5 | `allow-marker-guard` を登録した直後、検証コマンド自体が block された（コマンド文字列にマーカー名が含まれるため）。過剰拒否側に倒す設計どおりだが、**今後この hook 配下ではマーカー名を Bash コマンド行に書けない** | 仕様として受容。検証はマーカー名を含まないハーネス経由で実施 |
| 2026-07-10 | S群 S-1 | auto mode classifier の判定が非決定的。同型の `cp`+`rm` 操作のうち、秘密鍵は通り**公開鍵だけ「Unauthorized Persistence」で block** された。マスターの明示指示で解除 | 仕様として受容。repo 外への移設はマスター名指しが要る |
| 2026-07-10 | S群 S-1 | 検証5の期待は「`archive/` のヒットのみ」だったが `docs/tree-snapshot-2026-05-19.{html,json}` もヒット。実体は**ファイル一覧のダンプ**で現役参照ではない（実行時参照は `ga4-report.mjs` の 1 件のみで修復済） | 実質 PASS と判定。plan の期待値が snapshot を勘定に入れていなかっただけ |
| 2026-07-10 | S群 S-1 | `secrets/README.md` は `.gitignore` の `secrets/` 除外により **untracked のまま**（plan が許容）。新規 clone では案内板が見えない | plan 既定に従い commit 対象外。tracked 化には `git add -f` が要る |
| 2026-07-10 | S群 S-3 | plan は「現役参照の更新は **1箇所のみ**（trigger-map.md 行13）」としていたが、**実際は 2 箇所**（行43 にも MISSION_LOG 参照）。1 箇所だけ直すと plan 自身の検証3（現役文書 grep 0 件）が FAIL する | S-3 内で 2 箇所とも修正し検証3 PASS |
| 2026-07-10 | S群 S-3 | `docs/standards/plan-mode.md:351`「記録は MISSION_LOG / commit message で十分」が、退避後も MISSION_LOG を現役として案内している。plan の検証3 対象外・「触るな」リストにも無い | **起票のみ**（plan 未認可の範囲）。`memory.md` へ書き換えるか要判断 |
| 2026-07-10 | S群 S-3 | repo 外 2 ファイル（`~/.claude/CLAUDE.md` の MISSION_LOG 行 / 司令塔 `MEMORY.md` P2 行）の更新が、マスターの S-3 全体承認だけでは auto mode classifier に block される（**ファイル名の名指しを要求**） | マスターがパスを名指しして承認 → 2 ファイルとも更新完了 |
| 2026-07-10 | S群 S-3 | `~/.claude/projects/…/memory/feedback_mission-log-handover-blindspot.md` は MISSION_LOG に 9 箇所依存。過去事案の記録であり承認範囲外 | **起票のみ**。事案記録として据え置くか、参照先を archive パスへ更新するか要判断 |
| 2026-07-10 | S群 検証パネル | `allow-marker-guard` の `MARKER_RE` に `i` フラグが無く、大文字混じりのマーカー名で guard を素通りできた。消費側は `fs.existsSync`（Windows は大小無視）のためバイパスが成立し、**S-5 の目的が完全に無効化**されていた | **blocking → 修正済**（`2fc3483`）。回帰ケースを 5→10 に拡張 |
| 2026-07-10 | S群 検証パネル | `allow-marker-guard` はシェル変数展開（`M=.allow-` の分割）で regex を分断され回避できる | **起票のみ**。文字列マッチ方式の原理的限界。plan S-5 が指定した仕様そのもの |
| 2026-07-10 | S群 検証パネル | `allow-marker-guard` が root 専用のため `products/` 配下に非伝播。守る対象の `pre-bash-destructive.mjs` は全 product へ伝播済で、product セッションでマーカー自己発行→destructive gate 無効化が成立（foodee で実証） | **blocking → 修正済**（`8ab964e`）。当初 AI は「plan 準拠」で advisory 判定したが security-reviewer が「plan の目的と実装の矛盾＝規則を盾にした穴の放置」と再指摘。マスター裁定でguard を 26 product へ伝播 |
| 2026-07-10 | S群 検証パネル | 新規 git deny（`git clean -fd*` 等）は前方一致固定順のため `git clean -df` 等で不一致となり `Bash(git:*)` allow に落ちる | **起票のみ**（advisory）。正確には「原理的に閉じられない」ではなく **hook で対応可能だが未実装**（`pre-bash-destructive.mjs` の `-[rf]+` 文字クラスと同型のフラグ非依存マッチを足せば低コストで閉じられる）。canonical には新規 git deny のバイパス注記が無い＝要追記 |
| 2026-07-10 | S群 検証パネル | `audit-local-allow.mjs` の検知漏れ: `python3.11:*` 等のバージョン付き名／多段パイプの `curl … \| tee … \| bash`／`git push --force`・`git branch -D`／`terraform apply -destroy` | **起票のみ**（advisory）。現状 `settings.local.json` に該当規則は 0 件で実害なし |
| 2026-07-11 | ④自己学習ループ 完遂時 | `check-in-verify.sh` 全体が既存 NG3件（A-9 memory.md 構造違反 / B-5 廃止hook再登録 / B-6 memory.md P1 デッドリンク）で EXIT=1。`git stash` で自己学習の変更前も同一と実証済＝本 plan 無関係 | **起票のみ**。本 plan スコープ外・別途要修正 |
| 2026-07-11 | ④自己学習ループ 検証パネル | code-reviewer advisory: `matched` 配列の WEAK 追加が `hasWeakHit` の近接/短文/共起条件を再適用せず表示不整合（`RECUR_TAG_RE` は正確な `strongHits` に依存するため実害の誤爆経路なし・表示のみ） | **起票のみ**（軽微） |
| 2026-07-11 | ④自己学習ループ Step2/3 | recall: 既知5事案のうち 06-28「3回目だぞ」は transcript に文字列不在・06-17「おい連発」は間に11実発話で `BURST_WINDOW`(10) を構造的に超過し検出不可。Jaccard 同族照合は長文日本語の2-gram token 膨張で希釈（指定ペア 0.1875<0.35） | **仕様受容**（THRESHOLDS 据え置き・マスター判断「実害なし・稼働後の却下率で観測」）。段階昇格思想に沿う |
| 2026-07-11 | ②allow 効果検証（マスター問い「体感で減らない」） | `pre-bash-destructive.mjs` の `node -e` 中身検知が `fs.rmSync/fs.rm` のみ＝`child_process.execSync`（任意コマンド）・`fetch`（秘密送信）・`writeFileSync`（改竄）を取りこぼす。`^node` アンカーのため `bash -c`/`env`/`VAR=x` 前置も未検知（46行と同根）。任意 JS を文字列マッチで完全捕捉するのは原理的に不可＝`node -e` の ask は外せない安全弁で allow 緩和は不可 | **起票のみ**。検知拡充（execSync/fetch/writeFileSync 追加・`^` アンカー撤去）は低コストだが、完全防御は不能なので allow 緩和の根拠にはならない。摩擦削減は「`node -e` をファイル化（`node scripts/x.mjs`＝allow 済）」運用が確実 |
| 2026-07-11 | ⑤仕組み改善 M-2/M-7 | M-2（plan-finalize の Y/N 記法検査）は NG 語彙 5 つの**文字列マッチのみ**で、別表現の主観判定（「担当が見て判断」等）をすり抜け**質を保証しない**＝既存 Stage 0-3 の dry-run 検証（Run: 実行→Expected: 出力で白黒つける）と役割が重複。M-7（完了前検証の文言追加）も機械強制でなく AI 裁量頼みで「自己規律は信用しない」思想に反する。加えて plan-finalize.md を product へ配る**伝播ルートが scripts に不在**（propagate-hooks.mjs は commands 非対象・product 版 18 個は May 27 凍結で乖離済） | **マスター判断で M-2/M-7 を中止・revert 済**（2026-07-11・マスター明示指示）。理由＝質を保証せず既存 dry-run と重複。**伝播ルート不在は M 群と無関係の既存構造問題**として残置（本当に問題かは後日検証）。⑤は **M-3 のみ実行**に縮小（下行参照） |
| 2026-07-11 | ⑤仕組み改善 M-1/M-4/M-5/M-6 | 質点検の結果、いずれも「質を機械保証する」に至らない or plan #5 趣旨（機械強制の穴埋め）から外れる: **M-1**（commit 前 hook）＝warn 止まりで機械強制なし（block 格上げはスコープ外）／**M-4**（output-style）＝出力誘導のみでルール改修でない／**M-5**（滞留検知）＝WARN 止まり・`[blocked]` タグで除外可／**M-6**（Serena 計測）＝1 回きりの計測でルール不変 | **マスター判断で M-1/M-4/M-5/M-6 も中止**（2026-07-11 明示指示）。⑤仕組み改善は **M-3（subagent 成果物の実在照合＝唯一の機械検証）のみ実行**に縮小 |
| 2026-07-12 | ③自動実行化 C-2 実走 | `secret-write-gate`/`post-bash` が**直近1日で計453件 exit_code=1 故障**中（secret-write-gate 241 / post-bash 212）＝C-2 wrapper が実データで検知。既存 Check-in A-22 領域の運用故障で本 plan スコープ外 | **放置（マスター指示 2026-07-12「見つけた問題は放置しろ」）・記録のみ**。原因調査は別タスク。automation state（hook-errors）に warn 常駐＝A-28/Tier1 が今後も surface する |
| 2026-07-12 | ③自動実行化 C-1 実走 | `feed-fetch.mjs` の `TRACKING_PARAM` は固定 allowlist で、未知のトラッキング/キャッシュバスタ系クエリ（`t=<ts>` 等）が同一記事の再掲に付くと正規化後 URL が食い違い dedup をすり抜けて重複保存され得る。文字列マッチで網羅は原理的に不可 | **仕様受容（放置）・記録のみ**。cap 先→dedup 順で影響は「稀な重複保存」に限定（上書きはしない）。代表パラメータのみ拡充済 |
| 2026-07-12 | ③自動実行化 各所 | plan 前提の不正確3点を実走で発見: ①transcript-audit の `.mjs` は line-count-gate 対象外＝C-0 の分割は不要 ②token-audit-raw.json に走査ファイル数フィールドが無い＝C-6 は `listAllUsageFiles()` 直接実測に変更 ③xml-feed に openai-blog=1040件等のアーカイブ全件があり実 vault フラッドの危険 | **ゴール不変・route 調整で対応済（放置せず修正）**。①分割せず配置 ②直接実測（回帰検知はより堅牢化）③最新25件/feed 窓を追加。記録のみ |

## 進捗

| # | plan | 状態 |
|---|---|---|
| 1 | ② allow 追加 | **完了**（vibe-base `f82e3b8`／skills repo `655f497`・2026-07-10） |
| 2 | ④ 環境改善 | **完了**（E-1〜E-9・E-8はplan記載通り対象外でスキップ／commit `69c34aa`,`62e2828`,`f00630a`,`7e9e830`,`2387819`,`898008f`,`263b95b`・2026-07-10）<br>2026-07-10 追記: E-1 の受入 `--check` が危険定義の過剰拡張で EXIT 1 に退行していたため、判定基準を公式定義に確定し直して EXIT 0 を再達成（`71db6fa`） |
| 3 | S群 ガバナンス | **完了**（S-1〜S-5 全完遂／S-2 `cf11527`・S-4 `307eccd`・S-5 `98d8a46`+`2fc3483`+`8ab964e`・S-1 `760ece9`・S-3 `46bea9c`+repo外2ファイル／検証パネル3レンズ PASS: verify 全6基準・security blocking 0件・code advisory は起票済） |
| 4 | 自己学習ループ | **完了**（Step1-8／新規 `failure-loop.mjs`+`negative-feedback-dict.mjs`+`failure-loop-core.mjs`・check-in `A-21+`/`A-27`・checkout `A-5`/`B-2.6`・Part 1b 新設／検証パネル: verify 7/7 PASS・code-reviewer blocking 0・advisory 2件修正(画像発話取込/stale-lock)+1件起票・2026-07-11） |
| 5 | ⑤ 仕組み改善 | **完了（M-3 のみ実行）**（subagent 成果物の実在照合を verify-agent 管轄に追加＝申告パスを ls/wc/sha256 で機械検証し偽完了報告を FAIL 化・負のテスト PASS／M-1/M-2/M-4/M-5/M-6/M-7 は質点検の結果マスター判断で中止＝上記「実行中に発見した問題」節2行／spec-audit PASS・blocking 0・advisory 2（記帳スコープ注記＋path-scoped commit 確認）・2026-07-11） |
| 6 | ③ 自動実行化 | **完了**（C-0〜C-7 全実装・commit `8d186f0`／定期5job(schtasks登録済)+イベント駆動2hook・全て検知/レポート専用／新規13ファイル+state lib+check-in A-28+runbook `docs/ops/automation-jobs.md`／検証パネル3レンズ blocking 0・security/code advisory 9件を修正/改善(pii-gateパス正規化・gsap exitCode化クラッシュ回避・token-audit例外盲点・root-config大小文字・feed冪等cap先dedup 等)／schtasks 5件登録済(明日07:50〜稼働)・C-5 PII辞書は空スキーマ配置(実名投入マスター立会い待ち)・2026-07-12） |
| 7 | ① skill 化 | **完了**（S-1〜S-6/S-8 全実装・vibe-base `c57fcba`／skills repo `plan-mode-redesign` `44adca8`・2026-07-13／新規4skill（masking-grep・formation・verification-panel-call・decommission-plan）+ checkout A-1/A-2/EXIT 機械ゲート化+path-scoped化 + web-design 3構図組込／検証パネル①②blocking0（-uall検知漏れ・MIP空白 是正済）／辞書は実名なし空スキーマ=マスター立会い投入待ち／skill発火スモークは次セッションpc-checkin時） |
