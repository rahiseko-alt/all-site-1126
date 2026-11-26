# 直近1か月ログ全数調査 — 改善対象5リスト（2026-07）

> 作成: 2026-07-07 / 司令塔セッション（Fable 5 オーケストレータ）/ plan: `~/.claude/plans/velvety-spinning-squid.md`
> **本書はリスト（改善候補の棚卸し）であり、改善の実装計画は別途立てる**（マスター指示）。
> 数値規律: 全数値に「実測」（script 集計・キーパス付き）または「推定」（根拠付き）のタグ。中央値・最頻値・実数のみ（単独の丸め値禁止）。

## プラン化AIへの拘束事項（改変禁止・逸脱はマスター承認必須）

本リストから実装計画を立てる AI は以下を厳守せよ。変更したい場合は理由を添えてマスターに確認してから変更すること（勝手な方向転換の禁止）。

1. **三値マーク（新規・既起票・要判定）の改変禁止** — 「新規」を既存バックログへ勝手に統合するな。「要判定」7件（要マスター判定の節）はマスター回答が出るまで実装計画に含めるな。
2. **危険度判定の改変禁止** — A-9・A-10「要注意」、A-12・A-13「広範allow非推奨」の判定を頻度の高さを理由に覆すな。頻度が高い＝allowすべき、ではない（deny 回避の構造的抜け道になるのが理由。詳細は details の list-2 参照）。
3. **除外4件の復活禁止** — 「除外理由」の節の Remove-Item・APIキー名代入・Get-Content・Add-Type を allow 候補に戻すな。
4. **推定タグの格上げ禁止** — replay・gap は推定2系統であり実測ではない。合算・実測への読み替えを禁止する。数値の一次根拠は同フォルダの data.json。
5. **根拠の一次資料** — 各項目のメリデメ根拠・トリガー設計案・セキュリティ二次影響の詳述は `docs/audits/ops-improvement-scan-2026-07-details/`（起草ドラフト5本の退避保存）にある。表の1行から独自に再解釈せず、まず details を読め。

## 調査諸元

| 項目 | 値 |
|------|------|
| 集計期間 | 2026-06-07 〜 2026-07-07（JST・1か月） |
| 集計対象 | `~/.claude/projects/` 全25プロジェクトフォルダの transcript JSONL（マスター指示: 全プロジェクト横断） |
| 走査規模 | 308ファイル走査・期間内306セッション・142,662行・parse失敗31行=0.0217% [実測: summary.sessions_in_window] |
| 日次セッション数 | 中央値 9 ／ 最頻値 5（回/日） [実測: summary.daily_session_counts] |
| ツール総呼出（main） | Bash 7,184 ／ Edit 3,459 ／ Read 3,307 ／ Write 1,672 ／ Agent 1,250 ／ Skill 167 [実測: tool-freq.main.totals] |
| permission 拒否（実測） | 247件（AskUserQuestion 117 ／ ExitPlanMode 62 ／ Agent 25 ／ Bash 18 ／ Edit 8 他） [実測: ask-events.rejections_summary] |
| トークン総計（main） | 10,141,002,571 tok（うち cache_read 9,727,729,257 = 95.92%） [実測: tokens.main.by_project] |
| 補助データ | session-reports 86件逐語転記 ／ failures.md 113行分類 ／ local allow 493件棚卸し ／ 既起票カタログ16件 [aux実測: reports-a.json 40 + reports-b.json 46 ほか] |
| 集計 script | `transcript-audit.mjs`（8種集計・selftest PASS）＋ `verify-report-numbers.mjs`（本書の機械照合）— scratchpad 一時配置・数値の恒久コピーは `docs/audits/ops-improvement-scan-2026-07-data.json` |
| 測定限界 | **承認された ask は transcript に痕跡が残らない** → 2系統推定で代替: (a) replay=現行 allow に前方一致しない呼出 [実測: ask-events.replay_estimate] (b) gap=tool実行までの待ち>8秒 [実測: ask-events.gap_estimate]。両系統一致＝高信頼。拒否のみ実測。**2系統は合算しない** |
| ノイズ除去 | subagent 側（isSidechain）は別バケツ・hook 由来コマンドは hooks バケツに分離（本線頻度の水増し防止） |
| 三値マーク | 各項目に 新規 ／ 既起票（出典パス付き） ／ 要判定 を付与。要判定は「## 要マスター判定」に集約 |

---

## リスト① skill化候補（毎日繰り返されている作業・7件）

統合所見: checkout（発火88回=全skill中最多）・pc-checkin という2大定型は skill 化済み。残る手動反復は「grep 系の全数確認」「実機目視」「サブエージェント配置」の3領域に集中。旧 S-7（hook propagate 自動化）はイベント駆動が本質のためリスト③ C-7 へ移動。

| ID | 項目名 | 頻度 | 現状コスト | 改善後見込み | メリット | デメリット | 三値 | 出典 |
|----|--------|------|-----------|-------------|----------|-----------|------|------|
| S-1 | マスキング/シークレット grep skill（顧客名・業種連想・本人情報・APIキーの全数ゼロ確認を1コマンド化＋辞書管理） | [実測: bash-freq.main.head_freq] シークレット系grepパターン実行 ghp_系=170・sk-系=167・xoxb系=129回/月。ポートフォリオ系で1セッション56〜73箇所級のマスキング実績3件 [aux実測: reports-b.json 07-05/07-07] | [推定: 手動・都度パターン再入力＋目視ゼロ確認。1回10〜20分・見落とし=顧客実名流出の高リスク] | [推定: script固定化で1コマンド・機械PASS判定・数十秒] | ①見落とし事故の構造的防止 ②パターン再入力の手間消滅 ③検証パネルへの機械証跡提出が可能に | ①製品ごとの顧客名辞書メンテが必要（怠ると偽PASS化） ②script過信で未知語検出力が目視より低下 ③security-review skill と発火競合の恐れ | 新規 | bash-freq.json・セッションレポート転記 |
| S-2 | スクショ実機目視 skill（desktop full-page＋mobile375＋scroll後の3構図を強制するチェックリスト型） | [実測: signatures.main.screenshot_to_read_chains] スクショ→Read確認連鎖=64回（247セッション中）。撮影ツール3系統併存: chrome-devtools 49・playwright 54・Preview 21 [実測: tool-freq.main.totals] | [推定: 手動・毎回3構図・ファーストビューのみ確認する偽PASSが既知再発] | [推定: 3構図必須の機械チェックリスト化・保存パス自動明示] | ①偽PASS（ファーストビュー判定）の根治 ②3構図の抜け漏れ強制 ③証跡パスの提示徹底 | ①撮影ツール3系統の呼び分け統一が前提 ②業務UIでは3構図が過剰品質 ③web-design 系skillとの発火境界が曖昧化 | 既起票（docs/ops/master-instruction-patterns.md Part1 #9）— 独立skillでなく web-design 等への必須ステップ組込が既提案 | signatures.json・tool-freq.json |
| S-3 | フォーメーション起動 skill（フェーズ→並列数・役割・モデル割当のテンプレ） | [実測: signatures.main.top_ngrams] Agent連鎖: 2連続672・3連続408・4連続251回。Agent呼出あるセッション=174／247・セッション毎Agent数 中央値2・最頻値0 [実測: tool-freq.main.by_session] | [推定: 口頭設計・司令塔が毎回暗算・本体context消費] | [推定: テンプレ参照で設計時間短縮＋モデル多層化の徹底] | ①高頻度定型（4連鎖251回）の型化効果大 ②司令塔本体のcontext節約 ③Haiku・Sonnet・Opus多層化の機械的担保 | ①固定テンプレが案件依存の最適配置を硬直化 ②誤テンプレ適用時の被害が並列数分拡大 | 既起票（docs/ops/master-instruction-patterns.md Part1 #6） | signatures.json・tool-freq.json |
| S-4 | 統廃合プラン skill（断線マップ→安全部分先行→危険部分逐次→検証の4段固定） | [aux実測: reports 86件の反復作業記述217行中「統廃合・撤去・廃番」一致=3行（1クラスタ）] 頻度低 | [推定: 都度フル手動調査・断線マップをゼロから作成] | [推定: 4段テンプレで調査抜け漏れ防止] | ①Refactor-on-Write 規律と直結 ②断線マップ型化で影響見落とし防止 ③暗黙知の明文化のみで低コスト | ①発生頻度が低く投資対効果は相対的に低い ②技術5型ごとに断線パターンが異なりテンプレ汎用性に限界 | 既起票（docs/ops/master-instruction-patterns.md Part1 #7） | セッションレポート転記 |
| S-5 | A-1 unstaged 差分判定の機械化（checkout skill 内部強化・独立skillにはしない） | [実測: skill-usage.main.skill_input_freq] checkout=88回/月（全skill中最多）で毎回A-1目視が発生 | [推定: 毎checkoutでgit diff全文を目視判定・xlsx/settings混入の見逃しリスク] | [推定: 既知リスクパターン（xlsx・settings・巨大バイナリ）を機械grep化し目視は補助に格下げ] | ①最頻実行工程（88回/月）の機械化で効果最大級 ②コミット前チェック（自己検証区切り5）の底上げ ③過去の混入事故パターンを恒久検知 | ①独立skill化は checkout と責務重複（内部改修が正） ②機械grepの網羅不足が「機械PASS=安全」の誤信を生む | 新規（A-1機械化の提案自体は未起票・上位規律のみ既存） | skill-usage.json |
| S-6 | 検証パネル呼出テンプレ skill（レンズ選定マトリクス照合→起動→PASS表回収の定型化。hook 強制は M-1 に分離） | [aux実測: reports 86件中「検証パネル」4行・「機械検証」6行] ほぼ毎commit前に発生 | [推定: レンズ選定・起動が毎回口頭判断] | [推定: 選定→起動→PASS表回収が1テンプレで完結] | ①レンズ選定の口頭再判断を排除 ②呼出忘れの減少 ③M-1（hook強制）導入前の助走として低リスク | ①軽微commitにもフルパネル起動を誘発する恐れ ②skillとhook（M-1）の二重管理リスク | 既起票（docs/ops/master-instruction-patterns.md Part1 #1 の skill 側half） | セッションレポート転記 |
| S-8 | コミット前 path-scoped 判定補助（並行セッション巻き込み防止・checkout 内部強化） | [実測: signatures.main.top_ngrams] git連鎖4連続=131回・git呼出計4,125回/月 [実測: bash-freq.main.head_freq] | [推定: 並行セッション時に自分のstaged分を都度目視区別・巻き込み事故の既往あり] | [推定: 差分フィルタscriptで判定を半自動化] | ①最頻出のgit操作に毎回併走する確認の型化 ②巻き込み事故の再発防止 ③`-m msg -- paths` 順序ミスの防止テンプレ | ①「どれが自分の成果物か」はcwdだけで機械確定できず半自動止まり ②根治はE-8（リポ分離）でありS-8は対症療法 | 新規（事故feedback は既存・機構化は未起票） | signatures.json・bash-freq.json |

---

## リスト② allow追加候補（危険が小さい ask の解消・21件）

統合所見: 拒否実測247件のうち Bash 起因は18件に留まり、体感摩擦の主因は **allow 非一致（replay推定）×承認待ち（gap推定）の交差68パターン**。最大の単一項目は A-20（path-resolver 呼出・replay 110回/月）。なお A-9/A-10（awk・sed）は「要注意」、A-12/A-13（for・timeout）は「高リスク・広範allow非推奨」として候補に残すが採否判断はマスターに委ねる。既存 allow の危険残骸（除外理由の節参照）は逆方向（削除）の対応が必要。

| ID | 項目名（allowルール案） | 頻度 | 現状コスト | 改善後見込み | メリット | デメリット | 三値 | 出典 |
|----|------------------------|------|-----------|-------------|----------|-----------|------|------|
| A-1 | Bash(sleep:*) | [実測: ask-events.replay_estimate] replay=84・gap=46/月（全期間コーパス122回 [実測: bash-freq.main.head_freq]） | [推定: 待機のみで副作用ゼロなのに毎回ask] | [推定: ask 84回/月消滅] | ①純粋待機で可逆性最大 ②交差集合上位の実摩擦 ③ポーリング中断の解消 | ①長時間sleepのハング温床 ②複合コマンド内の時間差実行部として悪用余地 | 新規 | ask-events.json |
| A-2 | Bash(head:*) | [実測: ask-events.replay_estimate] replay=51・gap=25/月（コーパス2,056回） | [推定: 読取専用なのに毎回ask] | [推定: ask 51回/月消滅] | ①読取専用 ②cat:* 許可済との非一貫解消 ③高頻度の実摩擦 | ①バイナリ・機密の画面表示経路 ②パイプ下流まで承認した錯覚 | 新規 | ask-events.json |
| A-3 | Bash(tail:*) | [実測: ask-events.rejections] 拒否実測1件＋replay=35・gap=16/月（コーパス919回） | [推定: ログ監視の定型なのに毎回ask] | [推定: ask 35回/月消滅] | ①読取専用 ②拒否実測ありの体感摩擦 ③ログ確認の定型用途 | ①tail -f のプロセス残留 ②パイプ下流委任リスク | 新規 | ask-events.json |
| A-4 | Bash(test:*)（既存 test -f:* の一般化） | [実測: ask-events.replay_estimate] replay=15・gap=7/月（コーパス275回） | [推定: 条件判定のみで副作用皆無なのにask] | [推定: ask 15回/月消滅] | ①I/O副作用なし ②test -f:* 許可済で安全性は既承認 ③-d/-e/-z 拡張のリスク増ほぼ無し | ①複合コマンド先頭時に残り部分まで承認の誤認 ②条件範囲拡大の判断がAI任せに | 新規 | ask-events.json |
| A-5 | Bash(date:*) | [実測: ask-events.replay_estimate] replay=8・gap=2/月 | [推定: 時刻取得のみ] | [推定: ask 8回/月消滅] | ①副作用ゼロ ②タイムスタンプ生成の定型 ③類似読取系と一括整理可 | ①頻度低く効果小 ②ワンライナー先頭で誤解を招きやすい | 新規 | ask-events.json |
| A-6 | Bash(pwd:*) | [実測: ask-events.replay_estimate] replay=6・gap=1/月 | [推定: 表示のみ] | [推定: ask 6回/月消滅] | ①最単純な読取専用 ②絶対パス規律の確認用途 ③導入リスク最小 | ①頻度最下位クラス ②単独起票の費用対効果小 | 新規 | ask-events.json |
| A-7 | Bash(printf:*) | [実測: ask-events.replay_estimate] replay=7・gap=2/月（コーパス109回） | [推定: 整形出力のみ] | [推定: ask 7回/月消滅] | ①標準出力のみ ②echo許可済との非一貫解消 ③文書整形の定型 | ①リダイレクト併用で任意ファイル書込に転用可 ②難読化の先頭トークンになり得る | 新規 | ask-events.json |
| A-8 | Bash(which:*) | [実測: ask-events.replay_estimate] replay=1・gap=1/月 | [推定: パス探索のみ] | [推定: ask 1回/月消滅] | ①副作用ゼロ ②環境調査の定型初動 ③導入コスト最小 | ①n=1でノイズの可能性 ②意図確認機会の喪失 | 新規 | ask-events.json |
| A-9 | Bash(awk:*)【要注意】 | [実測: ask-events.replay_estimate] replay=7・gap=2/月（コーパス84回） | [推定: 大半はテキスト集計] | [推定: 部分的ask消滅・監視継続前提] | ①文書処理の定型 ②集計用途は可逆 ③一回性allowの一般化に相当 | ①awk system関数=任意コード実行ゲート相当を無askで開放 ②リダイレクト併用で読取専用と言い切れない | 新規 | ask-events.json |
| A-10 | Bash(sed:*)【要注意・in-place除外を検討】 | [実測: ask-events.replay_estimate] replay=18・gap=7/月（コーパス139回） | [推定: 大半は sed -n 抽出表示] | [推定: 部分的ask消滅] | ①docs運用で頻出 ②sed -n は読取専用 ③実摩擦の裏付けあり | ①sed -i は不可逆のdiffレビュー無し書換 ②正規表現ミスの全置換事故はEditより高リスク | 新規 | ask-events.json |
| A-11 | Bash(export:*) | [実測: ask-events.replay_estimate] replay=6・gap=7/月 | [推定: 影響は単一呼出内限定] | [推定: ask 6回/月消滅] | ①シェル状態非保持環境で影響局所 ②PATH拡張は個別承認済の前例 ③ファイル・NW副作用なし | ①APIキー名代入パターンが同集合に実在（除外理由の節）し将来の無ask通過リスク ②後続コマンドの危険性を覆い隠す | 新規 | ask-events.json |
| A-12 | Bash(for:*)【高リスク・広範allow非推奨】 | [実測: ask-events.rejections] 拒否実測1件＋replay=14・gap=28/月（gapは交差集合中最大級） | [推定: 大半は無害な集計ループ] | [要検討: 単純allowは非推奨] | ①体感摩擦の実測裏付けが最強クラス ②大半は集計用途 ③改善余地の大きさを示す | ①ループ本体に任意コマンドを置け deny 回避の構造的抜け道 ②破壊検知hookは複合コマンド非解析でラップを検知不能 | 新規 | ask-events.json・docs/rules/permission-defense-canonical.md |
| A-13 | Bash(timeout:*)【高リスク・広範allow非推奨】 | [実測: ask-events.replay_estimate] replay=3・gap=3/月 | [推定: 実行時間制限の安全弁用途] | [要検討: 単純allowは非推奨] | ①安全弁機能 ②ハング対策の正当用途 ③影響範囲小 | ①任意コマンドのラッパーで A-12 と同型の deny 回避経路 ②hook検知網の外側 | 新規 | ask-events.json |
| A-14 | 無害env代入の値固定許可（PYTHONUTF8=1 等） | [実測: ask-events.replay_estimate] replay=2・gap=7/月 | [推定: 文字コード設定のみ] | [推定: ask 2回/月消滅] | ①副作用なし ②cp932罠回避の正当用途 ③値固定で安全判定が容易 | ①一般化するとシークレット代入まで拾う恐れ（値固定必須） ②効果は限定的 | 新規 | ask-events.json |
| A-15 | Bash(notepad.exe:*) | [実測: ask-events.replay_estimate] replay=2・gap=1/月 | [推定: GUI起動のみ・既存一回性allowで大半カバー] | [推定: ask 2回/月消滅] | ①Windows標準アプリ起動のみ ②「見せて」対応の正当用途 ③リスク最小 | ①n=2で投資対効果小 ②任意ファイルを開く可能性はゼロでない | 新規 | ask-events.json |
| A-16 | Godot 4.7 exe のパス限定 allow（spire-lite 限定） | [実測: ask-events.replay_estimate] replay=15・gap=14/月（本体+console合算内訳あり） | [推定: ゲームエンジン起動のみ] | [推定: ask 15回/月消滅（製品スコープ限定）] | ①正規インストール済エンジンの起動のみ ②実機目視検証に必須 ③固定パスでリスク局所化 | ①任意exe起動一般化の前例になる恐れ（厳密パス限定が前提） ②パス変更で陳腐化 | 新規 | ask-events.json |
| A-17 | WebFetch 自社ドメイン群のワイルドカード集約（kouheikosehira.com 系） | [実測: webfetch-domains.main.freq] 自社系5サブドメイン計10回/月・個別allow済7件 [aux実測: settings-inventory.json] | [推定: サブドメイン新設の都度初回ask] | [推定: 新設時ask消滅] | ①自社保有で信頼度最高 ②新設の反復摩擦を根絶 ③本番確認の定型に直結 | ①DNS乗っ取り時に影響がサブドメイン全体へ拡大 ②譲渡後の意図せぬ継続リスク | 新規 | webfetch-domains.json |
| A-18 | WebFetch github.io ワイルドカード（github.com 本体は個別維持） | [実測: webfetch-domains.main.freq] github.com=36回/月・github.io系2件が個別許可済 | [推定: 公式ツール文書系の初回ask] | [推定: 新規github.ioのask消滅] | ①最高頻度ドメイン近傍の整理 ②公式ツール文書の集約 ③基幹ドメインへのワイルドカード回避設計 | ①github.io は第三者取得可能な名前空間で信頼度が一段低い ②現状2件のみで効果小 | 新規 | webfetch-domains.json |
| A-19 | feed-check 固定11ドメインの bulk 事前登録（個別列挙） | [実測: webfetch-domains.main.freq] 該当11ドメインが各4〜9回/月（分布の中央値1・最頻値1に対する外れ値群） | [推定: 運用ドメインが1件ずつ初回ask] | [推定: feed-check定型実行のask消滅] | ①読取専用GETのみ ②有限11件で見積り容易 ③C-1（自動化）の前提整備を兼ねる | ①ソースリストとの二重メンテ ②選定基準の線引きがマスター判断依存 | 新規 | webfetch-domains.json |
| A-20 | path-resolver 呼出プレフィックス許可（VIBE_BASE_ROOT=＄(node resolve-paths.mjs …) 形・＄は半角に読み替え） | [実測: ask-events.replay_estimate] replay=110・gap=45（月あたり・**交差集合中最大の実摩擦**。素の node 呼出は allow 済で問題は代入+コマンド置換記法のみ） | [推定: 全skillの Path Resolution 手順が毎回ask] | [推定: ask 月110回消滅=単一項目で最大] | ①canonical 承認済の正規CLIラッパーへの到達経路適正化（任意コード実行の再開放ではない） ②既存許可の適用漏れ是正が本質 ③スクリプト実体はリポジトリ管理下 | ①代入+コマンド置換記法の前方一致仕様が未検証 ②同型代入プレフィックスの他コマンド流用でdeny回避経路化の恐れ（狭い文字列限定が必須） | 既起票（docs/rules/permission-defense-canonical.md にラッパー方針記載済・allowルール実装は本書が初提起） | ask-events.json |
| A-21 | 一回性Bash 43件の棚卸し（非再発分の削除=ノイズ削減） | [aux実測: settings-inventory.json local allow 493件中 一回性Bash=43件（8.7%）] | [推定: 単発具体コマンドの残骸が恒久残留] | [推定: 棚卸しで削減＋危険残骸の発見機会] | ①デッドウェイト削減 ②棚卸し自体がセキュリティ点検を兼ねる ③C-3（定期化）の初回実行に相当 | ①再発可否は目視で機械確定できず個別確認要 ②一括削除は再利用予定分の誤削除リスク | 新規 | settings-inventory.json |

---

## リスト③ 自動実行化候補（定期・イベント駆動にすべき事・7件）

統合所見: 既存基盤（schtasks 2本・Check-in 機械検証・GitHub Actions）と重複しない7件。共通原則: **無人実行は「検知・レポートのみ」に限定し自動修復はしない**（agentic-loop 原則の読み取り専用アクセス）。通知は「差分ありの時のみ」に絞り形骸化を防ぐ。

| ID | 項目名 | 頻度 | 現状コスト | 改善後見込み | メリット | デメリット | 三値 | 出典 |
|----|--------|------|-----------|-------------|----------|-----------|------|------|
| C-1 | feed-check の時刻駆動化（取得→vault保存まで無人・分析はセッション内AIの二段構成） | [実測: skill-usage.main.skill_input_freq] 手動発火=2回/306セッション（実行率0.65%） | [推定: 思い出した時だけ実行・取りこぼし常態] | [推定: 毎朝定刻実行=実行率100%固定] | ①実行率 2/306→毎日1回 ②鮮度が起動タイミング非依存に ③x-vault-sync と同じ朝バッチ枠に相乗り可 | ①RSS障害の無人検知が遅れる ②判断を伴う分析工程まで自動化すると質が落ちる（二段構成が必須） | 新規 | skill-usage.json |
| C-2 | hook-errors.jsonl の日次スキャン（時刻駆動） | [aux実測: hook-errors.jsonl 実測14,133行・3.3MB。現行検知はセッション起動時のみ] | [推定: セッションが空く日は故障が最大14日放置] | [推定: 検知空白が最大1日に短縮] | ①既存script流用で実装コスト低 ②Check-in A-22 と二重の網 ③hook無言故障（既往2件）の早期発見 | ①通知先未設計だと形骸化 ②肥大ログの毎日全走査コスト | 既起票（docs/session-reports/2026-06-17-vibe-base-maturity-audit.md で cron化未達と指摘済） | セッションレポート転記 |
| C-3 | settings.local.json allow 棚卸しの月次定期化（件数推移・kind別内訳・閾値WARN） | [aux実測: settings-inventory.json allow=493件（WebFetchドメイン187・汎用Bash198・一回性43・MCP33 他）] | [推定: 肥大を検知する仕組みが無く気づき任せ] | [推定: 月次レポートで増加傾向を可視化・削除は提案止まり] | ①肥大の加速/横ばいを継続計測 ②失効ドメインの回収 ③3段防御モデルの実効性検査が定期化 | ①自動削除まで踏み込むと誤剥がしリスク（提案止まり必須） ②レポートが見られなければ形骸化 | 新規（BK-10 は自動注入行数が対象・本件は allow 件数で対象が異なる・出典 docs/ops/master-instruction-patterns.md） | settings-inventory.json |
| C-4 | GSAP upstream の週次差分検知（最終commit/タグ監視・適用は人間レビュー） | [推定: 3週間超持ち越し中の未解消タスク＋gsap.com 手動WebFetch 6回/月 [実測: webfetch-domains.main.freq]] | [推定: 陳腐化の監視が都度WebFetch依存] | [推定: 週次で差分WARN・差分なしは無通知] | ①陳腐化リスクの先回り検知 ②持ち越しタスクの自然消滅防止 ③gsap skill（発火88回帰属）の鮮度保証 | ①差分検知≠互換性検証（適用は別工程） ②監視先の構成変更で静かに壊れる | 新規 | webfetch-domains.json・セッションレポート転記 |
| C-5 | 顧客PII マスキング grep の hook 化（portfolio 系パスへの Write 時に自動検知） | [aux実測: 既存 secret-write-gate.mjs はAPIキー系のみでPII非対象と実装確認済。ポートフォリオPhase2で1セッション56〜73箇所級のマスキング3件] | [推定: API鍵は自動防御・顧客PIIは手動チェックのみの片肺] | [推定: Write時点で機械ブロック=事後grep不要化] | ①既存 hook-runner 機構に相乗りで新規インフラ不要 ②外部共有前提物のPII混入=情報漏洩と同格リスクの機械遮断 ③S-1（skill）と両輪の防御 | ①顧客名ホワイトリストの運用が前提（未整備なら誤ブロック多発でhook無効化の危険） ②文字列一致では表記ゆれを拾えない | 新規 | セッションレポート転記・実装確認 |
| C-6 | token-audit の週次定期実行＋走査ファイル数の異常減少WARN | [実測: bash-freq.main.head_freq] audit.mjs 手動実行=3回/月。非再帰走査バグで1,597ファイル見落とし・総額$9,956→$11,154訂正の既往 [aux実測: failures-classified.json 07-04] | [推定: 計測空白が長くバグ混入にも気づきにくい] | [推定: 週次実行＋メタ異常（対象数急減）の機械検知] | ①計測空白の短縮 ②07-04型バグ再発の早期発見 ③context削減施策の実測データが定常蓄積 | ①BK-10 と役割分担の明文化が必要（出典 docs/ops/master-instruction-patterns.md） ②監査対象肥大で実行コスト増 | 新規 | bash-freq.json・failures-classified.json |
| C-7 | hook propagate の自動化（.claude/hooks 変更検知→propagate-hooks.mjs 自動実行）※リスト①旧S-7から移動 | [実測: bash-freq.main.head_freq] propagate-hooks.mjs 手動実行=25回/月＋propagate関連の運用ブレ記録6行 [aux実測: reports] | [推定: 変更の都度、人が思い出して手動実行・忘れると製品間hook不整合] | [推定: 変更検知で自動伝播=忘れゼロ] | ①propagate忘れ由来の不整合（既往複数回）を根治 ②25回/月の手動作業消滅 ③既存scriptが冪等でトリガー追加のみ | ①誤トリガーで全25製品への一括書込が走るリスク ②「気づかず伝播」による事故トレーサビリティ低下 | 新規 | bash-freq.json |

---

## リスト④ 環境改善（settings・MCP・トークン・リポ構成の歪み・9件）

統合所見: 最重要は E-1/E-2（local allow 493件の意味的衝突と deny 迂回構造）— 機械 conflict 判定は0件だが、正規表現再検査で rm系8・taskkill系4・cmd系9・pip install系9 等が local allow に実在し、canonical の防御方針が実体で迂回され得る。E-6/E-7 は本調査の実走中に実証された環境バグ。

| ID | 項目名 | 頻度or規模 | 現状コスト | 改善後見込み | メリット | デメリット | 三値 | 出典 |
|----|--------|-----------|-----------|-------------|----------|-----------|------|------|
| E-1 | local allow 493件の意味的衝突の解消（機械判定0件・再検査で rm系8/taskkill系4/cmd系9/pip系9/Remove-Item系2/Stop-Process系1/curl系2 該当） | [aux実測: settings-inventory.json 493件・conflict機械判定=0件・正規表現再検査で計35件該当] | [推定: canonical の deny 方針と実体が不一致のまま線形蓄積] | [推定: 該当ルール削除+ask格上げで文書と実体の一致率回復] | ①deny したいコマンドの自動通過リスク可視化 ②次AIの「canonical=安全」誤信事故防止 ③破壊的操作の事前同意規律と設定の整合 | ①493件の人力棚卸しコスト高 ②正当理由の一回性許可まで締め出す過検知リスク | 新規 | settings-inventory.json |
| E-2 | シェル丸ごと許可による deny 迂回構造の封鎖（cmd.exe・powershell.exe・PowerShell(Remove-Item *)・PowerShell(Stop-Process *) 等の広域 allow） | [aux実測: settings-inventory.json に Bash(cmd:*)・Bash(powershell:*)・PowerShell(Remove-Item *)・PowerShell(Stop-Process *) が allow 実在] | [推定: local>project>user の優先順位で deny より優先解釈され得る構造] | [推定: シェル丸ごと許可を個別コマンド単位へ置換すれば迂回経路が閉じる] | ①シークレット外部送出経路の恒久遮断 ②Bash文字列denyの抜け道封鎖 ③破壊系無条件許可の解消 | ①正当なWindows運用操作まで巻き込む可能性 ②スコープ間マージ規則の一次情報確認が先（未確認のまま変更は副作用リスク） | 新規 | settings-inventory.json |
| E-3 | claude.ai MCP connector 65ツールの固定費削減 | [aux実測: backlog-catalog.json 65ツール≈40.6kトークン毎セッション。司令塔だけで月111セッション] | [推定: 40.6k×毎セッションの固定context費] | [推定: 未使用connector切断で当該固定費消滅] | ①全セッションのベースcontext削減 ②未使用定義の維持コストゼロ化 ③固定費比率の低下 | ①将来利用時の再設定コスト ②グローバル設定のためマスター手動判断が必須 | 既起票（~/.claude/projects/C--Users-user-Desktop-ClaudeCode-vibe-base/memory/project_context-reduction-backlog.md 提案A・未決） | backlog-catalog.json |
| E-4 | transcript ディスク肥大＋token-audit 非再帰バグの是正（subagents 配下が総量の51%） | [aux実測: projects 総計779MB/月・うち subagents 177ディレクトリ400MB。総額$9,956→$11,154 訂正の既往] | [推定: サブエージェント消費が過小算出され続ける構造] | [推定: 再帰走査修正＋容量監視で実額把握とディスク対処の両立] | ①コスト集計の正確性回復（ズレ$1,198の実証済） ②779MB/月→年9GB超ペースの把握 ③E-5型の外れ値検知が可能に | ①transcript削除は監査証跡喪失リスク ②ツール改修工数 | 新規 | failures-classified.json・実測du |
| E-5 | サブエージェント大量並列セッションの出力サイズ制御（learning-suite-kanji の1セッションが61MB=同プロジェクト88%の外れ値） | [aux実測: du 実測 69MB中61MB・agent jsonl 44本うち7本が5〜7MB級] | [推定: 大容量出力subagentの突出ディスク・トークン単価] | [推定: 並列数上限指針＋出力サイズ制御で再発抑制] | ①突出コストセッションの早期検知 ②並列設計指針の実効性検証材料 ③大量並列タスクの事前見積り精度向上 | ①観測1件でパターン断定は時期尚早 ②並列削減は処理時間とのトレード | 新規 | 実測du |
| E-6 | outside-vibe-base-gate hook の例外リスト陳腐化（正規 scratchpad への Write をブロック→Bash迂回を強制→誤展開ディレクトリ生成の連鎖） | [aux実測: 本調査実走中に実証。subagent 2体が Write ブロック→1体が HOME リテラル誤展開で vibe-base 直下に迷子ディレクトリ生成（残存・要削除承認）。過去同型痕跡1件=再発2件目] | [推定: untracked 残留によるコミット巻き込み・レビュー負荷] | [推定: 例外リストに scratchpad パターン追加で迂回自体が不要化] | ①正規Write経路の復活 ②誤展開の発生源根絶（2件実証済） ③git status 雑音の削減 | ①例外追加は他パスも同時に緩めるリスク ②既存迷子ディレクトリ削除は破壊的操作で事前同意必須 | 新規 | 本調査実走観測・failures-classified.json |
| E-7 | Bash ツールの Windows パス/ヒアドキュメント破損対策の定型手順化 | [aux実測: 本調査実走中に heredoc 破損3回（script開発2回+ドラフト保存1回）。過去同型: commit文字化け・sed バックスラッシュ空振り] | [推定: 保存・commit・置換の都度リトライと事後修正が発生] | [推定: 「tmpへWrite→cpコピー」等の定型手順統一で再発防止] | ①事後修正コスト削減 ②git履歴汚染防止 ③次エージェントの同罠回避 | ①手順周知の運用コスト ②ツール内部実装は制御不能で回避策止まり（根治不能） | 新規 | 本調査実走観測・failures-classified.json |
| E-8 | モノレポ→製品別リポジトリ分離の完遂（git 衝突の根治） | [aux実測: failures-classified.json git巻き込み=16件（全113件中）。分離 Step1-3 完了・Step4-6 未実施] | [推定: 並行セッションの index・push 競合が構造的に継続] | [推定: 分離完遂で製品間 git 衝突源が消滅] | ①index・push競合の根絶 ②submodule 3点照合等の運用手間削減 ③他製品への staged 波及リスク解消 | ①分離実行自体が大規模操作で段階実行必須 ②分離後は一括checkout運用の改修が必要 | 既起票（~/.claude/plans/starry-wiggling-eagle.md Step4-6） | failures-classified.json |
| E-9 | cache_read 比率が突出して低いプロジェクトの個別要因調査 | [実測: tokens.main.by_project] 全体比率0.9592 に対し Temp系0.5828・kosespark-video-shorts 0.5852・n8n 0.6621 | [推定: 単発実行系でキャッシュ再利用が働かない構造の可能性] | [推定: 要因特定で追加コストの切り分け（全体は良好=過剰対策の回避）] | ①非効率プロジェクトの特定 ②全体0.9592が良好であることの確認 ③単発実行系ワークフローの設計見直し材料 | ①低比率=即問題ではなく対策が見合わない可能性 ②n=11（n8n）は母数不足 | 新規 | tokens.json |

---

## リスト⑤ 仕組み改善（ガバナンス機構の機能不全・未達・裁量依存・8件）

統合所見: 拒否実測247件の内訳（AskUserQuestion 117=47.4%・ExitPlanMode 62=22.4%）は「AI の質問・計画がマスター意図とズレる」瞬間の実測であり、M-2（plan ゲート）と M-4（output-style）の数値根拠。M-3（subagent 成果物の実在検証）は本調査実走中に偽報告1件を実際に検出しており緊急度が上がった。ゲートを全部直列にすると速度が落ちる（詳細は要マスター判定）。

| ID | 項目名 | 頻度or再発数 | 現状コスト | 改善後見込み | メリット | デメリット | 三値 | 出典 |
|----|--------|-------------|-----------|-------------|----------|-----------|------|------|
| M-1 | commit 前 verify-agent 必須化 hook（FAIL で commit 拒否） | [aux実測: git巻き込み16件中、staging-gate 稼働後も4件再発（07-04×1・07-05×3同日連鎖）] | [推定: 事後発覚のたび手戻り+再検証セッション] | [推定: 実行前検出への転換で手戻り消滅] | ①事後→事前の転換 ②タグ≠中身の機械遮断 ③orchestrator裁定コストの削減 | ①毎commitのレイテンシ増 ②受入基準の事前定義コスト | 既起票（docs/ops/master-instruction-patterns.md Part1 #1） | failures-classified.json |
| M-2 | plan 受入条件 Y・N 可否記法禁止の機械ゲート（plan-finalize 組込） | [実測: ask-events.rejections_summary] ExitPlanMode 拒否62件（呼出277件中=22.4%） [実測: tool-freq.main.totals] | [推定: ゴール取り違えでマスター差し戻し・Plan Mode 再入の既往] | [推定: 検証コマンド必須化で差し戻し率低下（因果は未実測）] | ①差し戻しの機械的先回り ②plan-finalize と一体化可能 ③机上の空論の排除 | ①plan初動コスト増 ②探索・調査系タスクで形骸化リスク | 既起票（docs/ops/master-instruction-patterns.md Part1 #2） | ask-events.json・tool-freq.json |
| M-3 | subagent 成果物の実在検証ゲート（完了宣言前に ls・wc・sha256 機械照合） | [aux実測: 本調査実走中に「保存しました」偽報告1件を ls 検証で検出＋未検証断定4件＋偽PASS系2件=のべ7件] | [推定: 誤報告→訂正の再作業（$1,198訂正の実績あり）] | [推定: 成果物パス実在の機械照合で偽報告を構造遮断] | ①タグ≠中身の代表穴（subagent報告）を封鎖 ②verify-agent 管轄の拡張 ③マスター誤報告の再発抑止 | ①subagent種別ごとに成果物定義が異なり汎用化困難 ②完了応答のレイテンシ増 | 新規 | failures-classified.json・本調査実走観測 |
| M-4 | output-style 新設（回答粒度・要約・省略禁止の恒常注入） | [実測: ask-events.rejections_summary] AskUserQuestion 拒否117件=全拒否247件中最多47.4% | [推定: 口頭規律のみで毎ターン自己規律任せ] | [推定: 恒常注入で粒度違反由来の拒否比率低下（相関のみ・因果未実測）] | ①自己規律に頼らない恒常適用 ②番号付き・一言回答の既定化で往復削減 ③要約禁止の明文チェック化 | ①硬直化で柔軟な説明が不自然になる恐れ ②口頭規律との二重管理リスク（一言回答と省略禁止の相反調停が必要） | 既起票（docs/ops/master-instruction-patterns.md Part1 #4 #5） | ask-events.json |
| M-5 | 持ち越し滞留の機械検知（checkout 時に前回残作業と差分照合・「解消」と「無言消失」を区別） | [aux実測: hp-customizer 24ファイル言及で未解消・kosespark P0 26ファイル・spire-lite P0 18ファイル（後2者は言及消失=放置か解消か不明）] | [推定: 放置の可視化機構が無く黙って消える] | [推定: 差分照合で消失=放置を検知・滞留日数を機械集計] | ①持ち越し常連の放置可視化 ②解消/無言消失の区別 ③H優先度タスクの滞留計測 | ①残作業記法の構造化が必要でcheckout記述コスト増 ②「マスター情報待ち」の正当停滞まで警告するとオオカミ少年化 | 要判定 | reports転記 |
| M-6 | Serena 発火規律（§5.5）の遵守率向上（hook 誘導） | [実測: tool-freq.main.totals] Serena系ツール計136回に対し Edit 3,459・Read 3,307回/月 | [推定: 規律明文化済だが機械強制なしで全文Read回帰の可能性] | [推定: hook誘導で遵守率向上（未実測）] | ①大規模ファイル全文Read削減=context節約 ②口頭依存を機械強制へ ③symbols起点探索の既定化 | ①Markdown等の対象外への誤爆リスク ②対象判定ロジックの実装・保守コスト | 新規 | tool-freq.json |
| M-7 | verification-before-completion skill の死蔵解消（発火0件・固定フローへの組込） | [実測: skill-usage.main.skill_input_freq] 30日間の発火記録22種の skill 名中に不在=0件 | [推定: 完了前検証を明文した skill が呼ばれず未検証断定4件と符合（相関のみ）] | [推定: checkout・plan-finalize への組込で形骸化解消] | ①既存資産の活用（新規開発不要） ②M-3 と統合可能 ③完了主張トリガーへの明示紐付け | ①skill発火は依然AI裁量（機械強制でない限り再発余地） ②完了系skillとの重複呼出でトークン増 | 要判定 | skill-usage.json |
| M-8 | hook 故障 WARN の解消追跡台帳（検知後の対応完了を確認するまで表示継続） | [aux実測: hook故障2件がA-22事後検知で発覚。A-22 WARN は07-02の2セッション記載後、07-03以降の報告から消失=追跡途絶] | [推定: 検知後の修正完了を追跡する機構がなく解消有無が不明] | [推定: 台帳紐付けで追跡途絶を防止] | ①「対応済み」の実測確定 ②故障再発の早期検知 ③WARN一覧の台帳化で消失防止 | ①台帳運用の保守コスト ②一時的な環境要因故障で誤警告が残留するリスク | 要判定 | failures-classified.json・reports転記 |

---

## 除外理由（②の危険系・Deny 正規対象該当）

リスト②の候補選定で、replay∩gap 交差68パターンから以下を**候補から除外**した（permission-defense-canonical.md の Deny 正規対象=unrecoverable 該当）。

| 除外パターン | 頻度 | 除外根拠 |
|--------------|------|----------|
| PowerShell Remove-Item | [実測: ask-events.replay_estimate] replay=1・gap=3/月 | rm -rf 相当の不可逆削除。Deny 正規対象「rm」カテゴリの機能的同義語 |
| GEMINI_API_KEY= 空文字代入 | [実測: ask-events.replay_estimate] replay=2・gap=2/月 | 変数名がシークレット系パターン。allow 化は将来の非空値代入・別キー名への拡大解釈を招く |
| PowerShell Get-Content（参考除外） | [実測: ask-events.replay_estimate] replay=2・gap=1/月 | unrecoverable 非該当だが project・global 両 deny に登録済（Read ツール集約方針）。既存統治方針と矛盾するため除外 |
| PowerShell Add-Type（参考除外） | [実測: ask-events.replay_estimate] replay=1・gap=1/月 | .NET 動的ロード=任意コード実行相当。node -e と同格の Ask 維持方針を踏襲 |

**申し送り（新規 allow 候補ではなく既存 allow の再点検が必要な逆方向案件）**: ①一回性Bash 43件の中に rm -f 複数削除・Remove-Item -Recurse -Force が**許可済みのまま残存** ②「その他」分類に PowerShell(Remove-Item *)・PowerShell(Stop-Process *) がワイルドカード付き allow で実在 ③汎用Bash 198件内に python -c 系が広範許可済（node -e が Ask ゲートなのと非一貫）。いずれも E-1/E-2 の改善実装時に扱うこと。

---

## 要マスター判定

以下は本調査で断定せず、マスター判断に委ねる（改善計画の起票時に決定）。

1. **既起票との統合か独立起票か（3件）**: M-5（持ち越し滞留検知）／M-7（verification-before-completion 死蔵）／M-8（hook 故障追跡台帳）。近接既起票と対象・手段のペアが一致しないため三値=要判定。
2. **ゲート直列化の許容**: M-1＋M-2＋M-3 を併設すると1 commit あたり最大3段の機械チェックが直列に走る。1日8セッション（最多日）の小刻み commit 運用では体感速度低下が顕著になる見込み。全部入れるか段階導入か。
3. **リスト②の要注意群の扱い**: A-9/A-10（awk・sed）は細分化（sed -n のみ許可等）の要否、A-12/A-13（for・timeout）は本書としては広範 allow 非推奨。
4. **A-20 の実装形**: 交差集合中最大の摩擦（replay 110回/月）だが、代入+コマンド置換記法の前方一致仕様が未検証。実装検証を先行するか。
5. **C-3 と C-6 の役割分担**: いずれも計測系の定期化で BK-10（自動注入監視）と隣接。統合するか個別か。
6. **E-6 の残骸削除**: 本調査中に発生した vibe-base 直下の迷子ディレクトリ（HOME リテラル誤展開・untracked）の削除承認（破壊的操作のため本書では未実施）。
7. **集計 script の恒久昇格**: transcript-audit.mjs を scripts/ へ昇格すれば C-3/C-6 の再利用基盤になるが、リスト化がゴールの本書では scratchpad 残置。

---

## 機械検証フッター

- 検証コマンド: `node <scratchpad>/logscan/scripts/verify-report-numbers.mjs <本書> <scratchpad>/logscan/agg`
  - CHECK1: 実測タグ全件のキーが集計JSONに実在するか
  - CHECK2: 「平均」の単独出現（中央値・最頻値の併記なし）が無いか
  - CHECK3: 既起票マーク行の出典パスが実在するか
  - CHECK4: 必須H2見出し9本の存在
- 受け入れ基準照合: 項目数 52件（S:7・A:21・C:7・E:9・M:8）≥15 ／ 三値マーク全行付与 ／ sessions_in_window=306 ≥100 ／ parse_error 率 0.0217% <0.1%
- データ恒久保存: `docs/audits/ops-improvement-scan-2026-07-data.json`（集計サマリ＋項目索引）
