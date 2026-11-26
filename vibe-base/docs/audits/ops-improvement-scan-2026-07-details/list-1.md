# リスト1: 毎日繰り返されている作業で skill にすべき事（起草）

- 対象期間: 2026-06-07〜2026-07-07（306セッション・agg/summary.json）
- 一次データ: agg/summary.json, agg/tool-freq.json, agg/bash-freq.json, agg/signatures.json, agg/skill-usage.json
- 二次データ: aux/reports-a.json（40件）+ aux/reports-b.json（46件）計86件の repetitive_work 逐語（合計217行、node集計・平均値不使用）
- 既存 skill 32件との突合: skill-usage.json main.skill_input_freq / attribution_skill_freq を突合し「明文化済SOPだが未skill化」を検出
- 数値は agg JSON の実数のみ・中央値/最頻値表記（平均禁止）。sidechain バケツは別記（main と合算しない）

## 表

| ID | 項目名 | 頻度[実測 or 推定] | 現状コスト[タグ] | 改善後見込み[タグ] | メリット | デメリット | 既起票候補フラグ | 出典 |
|---|---|---|---|---|---|---|---|---|
| S-1 | マスキング/シークレット grep（顧客名・業種連想・本人情報・APIキー 全数ゼロ確認） | [実測: agg/bash-freq.json main.head_freq.freq「ghp_[a-zA-Z0-9]{36}」=170、「sk-[a-zA-Z0-9]{20,}」=167、「xoxb-)'」=129]（＋質的裏取り: 出典欄） | [手動／都度全文grep／目視ゼロ件確認／高リスク（見落とし=顧客実名流出）] | [script固定化／実行1コマンド／機械PASS判定] | 1.見落とし事故を構造的に防止 2.都度パターン再入力の手間消滅 3.ポートフォリオ系（月内で3件級の大規模マスキング実績あり）で毎回発生する定型作業を共通化 | 1.マスキング対象語彙（顧客名・業種）は製品ごとに異なり辞書メンテが要る 2.スクリプト側の見落とし＝人間grepより過信されるリスク | 無（新規提案・master-instruction-patterns.md 未掲載） | agg/bash-freq.json; docs/session-reports/2026-07-07-checkout.md; docs/session-reports/2026-07-05-checkout-8.md |
| S-2 | スクショ実機目視（desktop full-page + mobile375 + scroll後の3構図） | [実測: agg/signatures.json main.screenshot_to_read_chains=64（main.sessions_counted=247中）][実測: agg/tool-freq.json main.totals.freq — mcp__chrome-devtools__take_screenshot=49／mcp__playwright__browser_take_screenshot=54／mcp__Claude_Preview__preview_screenshot=21（個別記載・合算しない）] | [手動／毎回3構図撮影+Read確認／ファーストビューのみ確認する偽PASSが既知feedback化済み] | [チェックリスト固定（3構図必須）／保存先パス自動明示／偽PASS検知] | 1.「ファーストビューだけ見て良好判定」という既知の再発不良を構造的に根治 2.desktop/mobile375/scroll後の3点が漏れなく強制される 3.保存パス提示の徹底で確認可能性が担保される | 1.スクリーンショットツール自体（chrome-devtools/playwright/Claude_Preview の3系統併存）の呼び分け統一が前提条件 2.静的画面のみのUIでは3構図が過剰工程になりうる | 済（docs/ops/master-instruction-patterns.md Part1 #9「ブラウザで見せろ・実機目視・スクショ【高頻度・全3】」＝ web-design/html系skillの完了判定に必須ステップ化する提案が既出） | agg/signatures.json; agg/tool-freq.json; docs/ops/master-instruction-patterns.md#9; ~/.claude/CLAUDE.md 表示規律 |
| S-3 | フォーメーション起動（サブ並列配置・フェーズ別動的再配分テンプレ） | [実測: agg/signatures.json main.top_ngrams.gram2「Agent -> Agent」=672、gram3「Agent -> Agent -> Agent」=408、gram4「Agent -> Agent -> Agent -> Agent」=251][実測: agg/tool-freq.json main.by_session 集計 — Agent呼出数の中央値=2／最頻値=0（n=247セッション）／Agent>0のセッション=174/247] | [口頭設計／司令塔がフェーズごとの人数・役割・モデル割当を都度暗算／コンテキストを司令塔自身が消費] | [フェーズ→人数/役割/モデル割当テンプレ化／動的再配分手順の明文化] | 1.Agent連鎖4連続(251件)が示す通り既に高頻度の定型作業であり型化効果が大きい 2.司令塔本体のコンテキスト消費削減（orchestration-discipline規律1が目指す方向と一致） 3.モデル多層化（agentic-loop-principles）の徹底が仕組みで担保される | 1.フェーズごとの動的再配分は案件依存が強く固定テンプレが逆に硬直化を招く恐れ 2.フォーメーション判断ミス時の被害（誤った並列数・役割分担）がskill化で拡大しうる | 済（master-instruction-patterns.md Part1 #6「サブ最大並列・フェーズごと配置再最適化…【最高頻度・全3】」＝「フォーメーション起動」skill化の提案が既出） | agg/signatures.json; agg/tool-freq.json; docs/ops/master-instruction-patterns.md#6; memory/feedback_full-formation-deployment.md; docs/rules/orchestration-discipline-canonical.md |
| S-4 | 統廃合プラン（影響/断線調査先行→安全部分先行削除→危険部分を最後に1個ずつ→検証） | [実測: aux/reports-a.json+aux/reports-b.json の repetitive_work 217行中「撤去/廃番/decommission/重複マトリクス/統廃合」一致=3行（node正規表現集計・1クラスタ=2026-06-06 pc-template-decommission）]（頻度低・裏取り可） | [都度フル手動調査／断線マップをゼロから再作成／調査範囲の抜け漏れリスク] | [3段階固定テンプレ（①断線マップ→②安全部分先行削除→③危険部分個別削除→④検証）] | 1.純増を嫌うメタルール1（Refactor-on-Write）と直結し毎回の判断コストを下げる 2.断線マップの型化で影響範囲の見落としを防止 3.危険部分を最後に1個ずつ扱う手順が既に暗黙知として存在し明文化のみで済む | 1.発生頻度が低く（実測3行）skill投資対効果が他項目より劣る 2.製品ごとに断線パターンが異なりテンプレの汎用性が低い恐れ | 済（master-instruction-patterns.md Part1 #7「統廃合・廃止は影響/断線調査を先にプランモード…【高頻度・全3】」＝「統廃合プラン」skill化の提案が既出） | aux/reports-a.json; aux/reports-b.json; docs/ops/master-instruction-patterns.md#7; docs/ops/plans/2026-06-06-pc-template-decommission.md; docs/ops/dead-products-registry.md |
| S-5 | A-1 unstaged差分の目視判定（checkout内サブステップ） | [実測: agg/skill-usage.json main.skill_input_freq.freq.checkout=88／main.attribution_skill_freq.freq.checkout=3038（毎回内包するサブステップ）][実測: aux/reports 217行中「unstaged」一致=2行] | [checkout実行毎回、git diffの全文を目視でxlsx/settings混入・意図しない差分を判定] | [既知リスクパターン（xlsx／settings.json／巨大バイナリ／PC表）を機械grep化し目視は補助判定に格下げ] | 1.checkout自体は既にskill化済（88回発火）だがA-1サブステップ内部の目視依存が未機械化という具体的ギャップ 2.self-verification.md区切り5（コミット前チェック）の機械化率を底上げ 3.xlsx/settings混入という具体的な過去の失敗パターンを機械検知に固定できる | 1.checkout skill本体の改修が必要でありS-5単独の新規skillにはなりにくい（既存skillの内部強化案） 2.機械grep対象パターンの網羅性が不完全だと「機械PASS＝安全」という誤信を生む | 無（上位規律は済＝master-instruction-patterns.md#1「通電テスト」最高(全3)に包含されるが、A-1固有の機械化提案自体は未掲載） | agg/skill-usage.json; aux/reports-a.json; aux/reports-b.json; docs/ops/snapshots/2026-07-02-checkout-skill-pre-panel.md（A-1定義）; .claude/rules/self-verification.md 区切り5 |
| S-6 | 検証パネル呼出定型化（5レンズ選定→機械検証→PASS表、commit前hook化） | [実測: aux/reports-a.json+aux/reports-b.json の repetitive_work 217行中「検証パネル」一致=4行、「機械検証」一致=6行（node正規表現集計）] | [commit前のレンズ選定・起動が口頭判断／FAIL見逃しでもcommitが物理的に可能な状態] | [pre-commit hookでverify-agent必須化しFAILでcommit拒否（機械強制）] | 1.orchestration-discipline規律3（検証パネル必須呼出・blocking FAIL1件でcommit禁止）の宣言を物理的に担保できる 2.「書いた=効いた」という最頻反復パターン（master-instruction-patterns.md#1・最高(全3)）を直接解消 3.5レンズ（正当性/セキュリティ/仕様適合/UX/verify）の選定基準が毎回口頭再判断されている非効率を解消 | 1.pre-commit hookのFAIL時に強制ブロックすると小規模commitでも毎回フルパネル起動のコストが乗る恐れ（レンズ選定マトリクスの精度が前提） 2.hook化の実装自体がpermission-defense-canonical.mdの防御3段モデルとの整合検証を要し導入コストが高い | 済（master-instruction-patterns.md Part1 #1「commit前 verify-agent必須をhook化」提案が既出） | aux/reports-a.json; aux/reports-b.json; docs/ops/master-instruction-patterns.md#1; docs/standards/verification-panel.md; docs/rules/orchestration-discipline-canonical.md |
| S-7 | hook propagate 実行（.claude/hooks 変更の全product伝播） | [実測: agg/bash-freq.json main.head_freq.freq「node propagate-hooks.mjs」=25][実測: aux/reports 217行中「propagate／伝播」一致=6行] | [hook変更の都度、propagate-hooks.mjs実行を人手で思い出して叩く／忘れると製品間でhook不整合が発生（過去に複数回実際に発生・報告あり）] | [.claude/hooks配下の変更をpost-editまたはpre-commit hookで検知し自動propagate] | 1.propagate忘れによるhook不整合という実際に複数回発生した障害パターンを構造的に根治 2.25回という実行頻度自体が「毎回人手で気づいて叩く」非効率の証拠 3.propagate-hooks.mjs自体は既存（冪等性も確認済＝rw_lines「propagate 2回実行で冪等」）のため自動化の障壁が低い | 1.自動propagateのトリガー条件（どのファイル変更で発火させるか）の設計を誤ると意図しない全product書き換えが走るリスク 2.現状は人間が「今どのhookを変えたか」を把握した上で意図的に実行しており、自動化で「気づかず伝播」による事故トレーサビリティ低下の恐れ | 無（新規提案・master-instruction-patterns.md 未掲載） | agg/bash-freq.json; aux/reports-a.json; aux/reports-b.json; .claude/rules/skill-deployment.md |
| S-8 | コミット前 path-scoped 判定（並行セッション巻き込み防止） | [実測: agg/signatures.json main.top_ngrams.gram2「Bash:git -> Bash:git」=519、gram3=243、gram4=131][実測: agg/bash-freq.json main.head_freq.freq「git」=4125] | [並行セッション時、git add対象を都度目視で他agentのstaged分と区別／過去に巻き込み事故が発生しfeedback化済み] | [セッション開始時刻またはPIDでgit statusの差分をフィルタするscript化] | 1.git連鎖（4連続131件）が示す通りgit操作自体が最頻出の反復シーケンスでありpath-scoped判定は必ず併走する 2.過去の巻き込み事故（feedback_path-scoped-commit-in-parallel-sessions.md）の再発防止を仕組みで担保 3.「git commit -m msg -- paths」の順序ミスという既知の落とし穴も同時にテンプレ化で防止できる | 1.セッション間の「どのファイルが自分のものか」判定はcwd以外の文脈情報（作業対象製品名等）が必要でscript単体では不完全 2.git操作全体（4125回）のごく一部が対象でありskill化の範囲線引きが難しい | 無（新規提案・関連feedbackは既存: memory/feedback_path-scoped-commit-in-parallel-sessions.md） | agg/signatures.json; agg/bash-freq.json; memory/feedback_path-scoped-commit-in-parallel-sessions.md |


## 詳細節

### S-1. マスキング/シークレット grep

- メリット根拠: docs/session-reports/2026-07-07-checkout.md「顧客/業種連想/本人/誇大 全grep 0・パネルPASS」、docs/session-reports/2026-07-05-checkout-8.md「塩田様56箇所・aiueo実名56箇所+特商法+アプリUI焼き込み+業種73箇所・ドメイン個人名」という定量的裏取りが存在し、ポートフォリオPhase2（1セッションで少なくとも3製品分）で毎回同型の全数チェックが発生している。これは1回のミスが直接「顧客情報流出」という実害に直結する高リスク定型作業であり、型化の投資対効果が高い。
- デメリット根拠: マスキング対象語彙（顧客名・業種・ドメイン・本人名）は製品ごとに固有辞書が必要で、辞書メンテを怠るとscriptの「PASS」表示が過信され、新規顧客名など辞書未登録語の見落としを誘発する（現状の全文grep目視の方が未知語に強い場合がある）。
- 二次影響: 新設skillのdescriptionが常時注入list（本ターン冒頭のskills一覧）に1件純増する。「マスキング」「grep」という語は他skill（security-review）のdescriptionとも意味的に近く、security-reviewとの発火競合（誤爆）リスクがある。保守負担としては辞書ファイルの更新責任者（マスター or 都度AI）を明確化しないと陳腐化する。

### S-2. スクショ実機目視

- メリット根拠: agg/signatures.json のscreenshot_to_read_chains=64（sessions_counted=247、全体の約4分の1のセッションでスクショ→確認が発生）に加え、~/.claude/CLAUDE.mdの表示規律に「ファーストビューだけ見て『良好』と報告するな（偽PASS禁止）」と明記されている＝実際に偽PASSが発生した既往歴があることの証左。
- デメリット根拠: chrome-devtools/playwright/Claude_Preview の3系統のスクリーンショットツールが併存しており（tool-freq.jsonで個別カウント）、skill化する際にどのツール系統を正とするか統一しないと「skillに従うと逆に工程が増える」逆効果になる恐れ。また業務系UI（管理画面等）では3構図必須が過剰品質になりうる。
- 二次影響: web-design skillまたはhallmark skillの既存descriptionへの追記が有力（新規skill乱立より既存拡張が妥当）。新規独立skillにした場合、web-design/hallmarkとのどちらが発火すべきかの判定が曖昧になり誤爆率が上がる。

### S-3. フォーメーション起動

- メリット根拠: Agent->Agent->Agent->Agent（4連続）が251件と、Edit/Read/Write系の定型操作に次ぐ規模で発生しており（gram4全体の中でBash:git->x4=131より多い）、既に「毎日」規模で反復されている実務そのものである。tool-freq.jsonのby_session集計でもAgent呼出のあるセッションが174/247（約7割）と高比率。
- デメリット根拠: フォーメーション（人数・役割・モデル割当）はタスクの性質（実装/調査/検証/創作）で最適形が大きく変わるため、固定テンプレを作ると「型に嵌める」思考停止を誘発しうる（CLAUDE.md §5「AI自己規律は信用しない」の精神とは逆に、テンプレ依存が新たな思考停止パターンになるリスク）。誤ったフォーメーション判断（過剰並列・役割誤配置）はコスト増に直結する。
- 二次影響: subagent-ops.mdとorchestration-discipline-canonical.mdという既存canonicalドキュメントが実質のSOPとして機能しており、skill化する場合は「ドキュメント参照」と「skill発火」の二重管理を避けるため、既存canonicalへのpointer型skill（内容を重複させない）が望ましい。保守負担は、サブエージェント定義（.claude/agents/配下）が変更されるたびにテンプレの同期が必要になる点。

### S-4. 統廃合プラン

- メリット根拠: メタルール1（Refactor-on-Write：純増は最終手段）と直結し、既にmaster-instruction-patterns.mdで「高（全3バケツ）」の頻度評価がされている確立済みパターン。実測の repetitive_work 一致3行はいずれも2026-06-06のpc-template-decommission関連1クラスタからのもので、この1回の作業だけでも「重複マトリクス監査」「撤去判定の総括」等の複数工程が発生しており、統廃合案件が起きるたびに同型の重工程が発生することを示唆する。
- デメリット根拠: 実測頻度が他項目（S-1〜S-3、S-8等）と比べて低く（3行・1クラスタ）、skill投資の優先順位は相対的に低い。断線マップの取り方は製品のアーキテクチャ（単一HTML/React/CFワーカー等の技術5型）ごとに大きく異なり、テンプレの粒度を誤ると「使えるが当てはまらない」skillになる。
- 二次影響: 既にdead-products-registry.mdという実体台帳が存在するため、skill化する場合はこの台帳の更新をskill内手順に組み込む必要があり、独立して作ると台帳との二重管理になる。

### S-5. A-1 unstaged差分の目視判定

- メリット根拠: checkout skillは全skillの中で発火回数が最多（skill_input_freq.freq.checkout=88／attribution_skill_freq.freq.checkout=3038、ともに全skill中トップ）であり、その内部で必ず実行されるA-1（コミット漏れ・意図しない差分確認）は事実上「毎回」実行される最頻サブステップである。docs/ops/snapshots/2026-07-02-checkout-skill-pre-panel.mdで定義済みの既存ステップであり、機械化の対象が明確。
- デメリット根拠: これは独立skillではなくcheckout skill内部の改修提案であるため、S-5単体を新規skillとして起票すると既存checkoutとの責務重複・二重管理になる（Reference-over-Redundancy違反）。機械grep対象パターン（xlsx/settings/巨大バイナリ）の網羅性が不完全な場合、「機械PASSしたから安全」という誤信により本来の目視の効能（想定外パターンの発見）を失う。
- 二次影響: 新規skill化ではなくcheckout skill本体（既存正本）の内部強化として扱うべきで、独立skill化するとdescription一覧が実質同じ発火条件（「チェックアウト」）で2件並ぶことになり誤爆率が上がる。

### S-6. 検証パネル呼出定型化

- メリット根拠: master-instruction-patterns.md #1（「やった」でなく「状態として正常か」）は全3バケツで最高頻度と評価されている最重要パターンであり、実測でも「検証パネル」4件・「機械検証」6件が個別セッションのrepetitive_workに明記されるほど定常化している。orchestration-discipline-canonical.mdの規律3（blocking FAILでcommit禁止）は既に文書化されているが、hookによる機械強制はまだ未実装（達成手段は口頭運用）。
- デメリット根拠: pre-commit hookで全commitにフルパネル起動を強制すると、typo修正のような軽微commitにも過剰コストが乗る。レンズ選定マトリクス（docs/standards/verification-panel.md）の精度が不十分な状態でhook化すると、誤ったレンズ選定のまま機械強制されるリスクがある。
- 二次影響: 5レンズ（code-reviewer/security-reviewer/spec-audit-agent/ux-quality-reviewer/verify-agent）は既にsubagent定義として存在するため、skill化は「呼び出し手順のテンプレ」に留め、新規Agentは作らない設計が望ましい。保守負担は、hook化した場合にpermission-defense-canonical.mdのDeny/Ask/Allow3段モデルとの整合を都度検証する必要がある点。

### S-7. hook propagate 実行

- メリット根拠: node propagate-hooks.mjsは既に25回（agg/bash-freq.json実測）実行されており、その都度「人間が変更に気づいて手動で叩く」フローになっている。repetitive_work内でも「propagate-hooks.mjs 実行」「propagate 2回実行で冪等」「propagate-hooksに再発guardを追加」等、propagate忘れ・二重実行という運用ブレが複数回報告されている。
- デメリット根拠: 自動化のトリガー設計（.claude/hooks配下の変更を検知して即propagate）を誤ると、意図しないタイミングで全product（25製品規模）に一括書き込みが走るリスクがあり、CLAUDE.md P1「vibe-base外フォルダの編集禁止」等の越権チェックと矛盾しないよう慎重な範囲設計が必要。
- 二次影響: 既存のhook-runner.mjs／check-hook-integrity.mjsという機械検証基盤に統合する形が望ましく、独立skillとして新設すると「hookの一部を人が起動し、一部をskillが起動する」という二重経路になり保守が複雑化する。

### S-8. コミット前 path-scoped 判定

- メリット根拠: git系操作連鎖（Bash:git->Bash:git->Bash:git->Bash:git＝131件）が全体反復パターンの上位に位置し、並行セッション運用（複数productフォルダで同時にAIが動く体制）が常態化している証拠。memory/feedback_path-scoped-commit-in-parallel-sessions.mdに実際の巻き込み事故と「-m msg -- paths の順序を誤ると壊れる」という具体的な落とし穴が記録済み。
- デメリット根拠: 「どのファイルが自分のセッションの成果物か」の判定はcwdやgit statusだけでは機械的に確定できず（同一ファイルを複数セッションが触ることもある）、script化しても最終判断は人間/AIの文脈理解に依存する部分が残る。
- 二次影響: git操作全体（4125回）のごく一部が対象でありskillの適用範囲線引きが難しい。既存のcheckout skillのコミット手順に「path-scoped判定」チェックを追記する形が、独立skillより責務重複を避けられる。

## メタ観察（skill増加の二次影響・共通）

- 現状32件のuser-level skillのdescriptionは毎セッション自動注入されるlist（本タスク冒頭のsystem-reminderと同型）に載る。本リストの候補を全採用すると+8件（うちS-5/S-8は既存skill内部強化が妥当なため実質の新規純増は最大6件）となり、常時注入テキスト量が増える＝トークンコスト増（memory/project_context-reduction-backlog.mdの懸案と直結）。
- 発火誤爆率: S-1(マスキング)とsecurity-review、S-2(スクショ)とweb-design/hallmark、S-6(検証パネル)とcode-review系5skill、のように語彙的に近接するskillが既に多く、新設時は既存skillのdescriptionとの意味的差別化（トリガー語の排他設計）を先に検討しないと「どちらが発火するか曖昧」という状態を増やす。
- 保守負担: skill本体は`~/.claude/skills/{name}/SKILL.md`が正本（独立repo `rahiseko-alt/claude-skills-base`）であり、vibe-base側は配置しない規律（.claude/rules/skill-deployment.md）。新設skillが「A群」（vibe-base固有・path-resolver経由）に該当する場合、node resolve-paths.mjs経由のCLI形式に統一する追加実装コストが伴う。
