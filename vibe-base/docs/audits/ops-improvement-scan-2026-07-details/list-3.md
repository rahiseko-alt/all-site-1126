# リスト3 定期的に行われており自動実行の仕組みにした方が良い事

起草担当分。母集団: agg配下json（306セッション・過去30日）+ aux/reports-a.json(40件)+aux/reports-b.json(46件、計86セッション分Check-outレポート）+ aux/failures-classified.json(113件)。
既存自動実行基盤（重複起票禁止）: schtasks x-vault-sync(08:00)/x-vault-sync-verify(08:15)、check-in-verify.sh(A-4からB-7)、GitHub Actions audit.yml(週次水曜cron)・hook-integrity.yml(paths発火)・x-auto-post系(cron日3回+日次2本)、SessionStart hooks(handover-inject/toranomaki/vault-reflection-check)。

## Schema表

| ID | 項目名 | 頻度 | 現状コスト | 改善後見込み | メリット | デメリット | 既起票候補フラグ | 出典 |
|---|---|---|---|---|---|---|---|---|
| C-1 | feed-check の時刻駆動化 | [実測:agg/skill-usage.json main.skill_input_freq.feed-check=2、306セッション中2回のみ手動発火。attribution_skill_freq.feed-check=354（発火時付随ツール呼数）] | [タグ:手動起動依存・低実行率] マスターまたはAIがセッション起動時に思い出さない限り丸ごとスキップされる。remaining_tasksに feed-checkのbusiness-concept参照パスがstale、feed-check×x-auto-post×google-slides-gen連携設計、等の未解消滞留が複数回出現。 | [タグ:時刻駆動で実行率を上げる] 毎朝定刻にRSS取得からvault保存まで無人完走させる。実行有無に思い出したかが介在しなくなる。 | 1.実行率が2/306から毎日1回に固定化され取りこぼしが消える。2.新着ネタの鮮度が手動起動タイミング依存でなくなる。3.x-vault-sync08:00台と同じ朝バッチ枠に相乗り可能で新規インフラが最小。 | 1.RSS側の障害やレート制限を無人検知できず気づきが遅れる恐れがある。2.複数ソース横断の判断を伴うためAI起動なしの単純schtasksでは質が落ちる可能性があり、判断フローの分岐があるため自動化が思考を代替しない設計が必要。 | なし。現状はセッション起動時に手動で叩く運用と明記されており、既存自動実行基盤に同名の登録なし。 | agg/skill-usage.json、aux/reports-a.json 2026-06-02と2026-06-03、aux/reports-b.json 2026-06-24と2026-06-25と2026-06-28、agg/webfetch-domains.json hnrss.org6件ほか |
| C-2 | hook-errors.jsonl定期grep（時刻駆動化） | [実測:ログ実体 C:/Users/user/.claude/logs/hook-errors.jsonl が14133行・3.3MB（走査時点）。check-hook-runtime-errors.mjsはcheck-in-verify.sh 435行目でセッション起動時のみ実行（--days 14）。bash-freq head_freq上の手動単独実行は1回のみ] | [タグ:セッション駆動止まりで無人検知の穴あり] hook-runner pass-throughはhook本体クラッシュ時もtoolを素通りさせるため機能停止が無言で起きると2026-05-26のfailures-classifiedに明記。現行の検知経路はCheck-in、セッション開始時、依存のため、セッションが空く日は故障が最大14日ウィンドウの外まで放置され得る。 | [タグ:cronで毎日WARN検知] 06-17監査でcron化未達と指摘済の穴を埋める。セッション有無に関係なく毎日1回、非ブロッキングエラーを集計し閾値超で通知する。 | 1.セッションが数日空いても故障検知の空白期間が最大1日に短縮される。2.既存scriptをそのまま呼ぶだけで新規実装コストが低い。3.Check-in側のA-22と二重の網になり検知の取りこぼしをさらに減らせる。 | 1.通知先未設計だと無人実行しても誰も見ないで形骸化するリスクがある。2.14133行という肥大ログを毎日全走査すると実行時間とIOコストが増加し続ける。 | 06-17監査でcron化未達と既に指摘済。本項目はその指摘の自動化提案としての起票であり新規発見ではない。 | scripts/check-hook-runtime-errors.mjs、scripts/check-in-verify.sh 435行目、aux/failures-classified.json 2026-05-26、hook-errors.jsonl実測14133行 |
| C-3 | settings.local.json allow棚卸の定期化 | [実測:aux/settings-inventory.json local_allow_classified.length=493。内訳は汎用Bash198・WebFetchドメイン187・汎用パターン20・個別Bash43・MCP33・その他12] | [タグ:肥大化を検知する仕組みが無い] 493件のうちWebFetchドメイン許可だけで187件を占め、リサーチの都度その場限りの許可が積み上がっている。重複や失効ドメインの棚卸しは現状マスターとAIの気づき任せ。 | [タグ:定期棚卸で肥大の進行を可視化] 月次等で件数推移とkind別内訳をログ化し、閾値超過や重複ルールをWARN表示する。 | 1.493件という現状規模を継続計測することで肥大が加速しているか横ばいかを判断できる。2.WebFetchドメイン許可の期限切れを定期棚卸で拾える。3.permission-defense.mdのDenyAskAllow3段モデルの実効性検査が定期化される。 | 1.自動削除まで踏み込むとまだ使うルールを誤って剥がすリスクがある。削除は提案止まりにすべき。2.棚卸レポート自体が新たな確認作業を生み、見られなければ形骸化する。 | project_context-reduction-backlog.md記載のBK-10、自動注入総量と行数ゲート拡張、と隣接領域だが対象が異なる。BK-10はSessionStart自動注入の行数、本件はsettings.local.json allowルール件数の定期棚卸。拡張提案として区別して起票。 | aux/settings-inventory.json、memory/project_context-reduction-backlog.md、aux/backlog-catalog.json BK-10 |
| C-4 | GSAP upstream定期差分取込 | [推定:根拠=aux/reports-b.json 2026-06-16-checkout-gsap.mdにremaining_tasksとしてGSAP知識の定期更新、upstream greensock/gsap-skillsの差分取込、と明記後、2026-07-07時点で同フォルダ内に解消記録なし、3週間超の持ち越し。加えてagg/webfetch-domains.jsonでgsap.com手動WebFetchが6回] | [タグ:陳腐化リスクの手動監視] スキルとしてgsapが2026-06-07から07-07で発火、skill_input_freq.gsap=2、attribution_skill_freq.gsap=88、しているのに対し、upstream本体の追随は都度WebFetchでの個別確認に依存し仕組み化されていない。 | [タグ:週次または月次差分チェックで陳腐化を先回り検知] greensock/gsap-skillsリポジトリの最終更新日やタグをcronで取得し差分があればWARNする。 | 1.今は問題ないが将来陳腐化する系の1年後リスクを仕組みで先回りできる。2.3週間持ち越し中の未解消タスクが自然消滅するのを防げる。3.gsapスキル利用に対して鮮度保証が付く。 | 1.差分検知だけでは中身の互換性検証まではできず、結局は人間のレビューが必要。検知と適用は別物。2.監視対象リポジトリ側の構成変更で検知が静かに壊れるリスクがある。 | なし。既存自動実行基盤に同名の登録なし。backlog-catalogにも該当項目なし。 | aux/reports-b.json 2026-06-16-checkout-gsap.md、agg/skill-usage.json gsap、agg/webfetch-domains.json gsap.com6件 |
| C-5 | 顧客情報マスキンググレップのhook化、ポートフォリオWrite時自動発火 | [実測:aux/reports-b.jsonのremaining_tasksに1件、ポートフォリオPhase2でaiueoとtrimmerとomotenashiの顧客情報マスキング。既存.claude/hooks/secret-write-gate.mjsの対象パターンを実ファイルで確認した結果、sk-やAIzaやGOCSPXやnpg_等のAPIキー系のみでありPII顧客名等は非対象と確認済] | [タグ:API鍵は自動防御だが顧客PIIは手動チェックのみ] git status時点でdocs/deliverables/portfolio-strategy-understanding.htmlが未追跡で存在し、ポートフォリオ系ドキュメント作業が継続中。現行secret-write-gateはAPIキー漏洩は防ぐが顧客名や屋号等のPII混入は防がない。 | [タグ:Write時にPIIパターンをhook検知] 既存check-secret-patterns.mjsと同じhook-runner経由の仕組みに、顧客名や屋号等の許可リスト外文字列を検知するルールを追加する。 | 1.既存secret-write-gateと同一機構、hook-runner.mjs経由、に相乗りでき新規インフラがほぼ不要。2.ポートフォリオは外部共有前提のためPII混入は情報漏洩と同格のリスクであり検知価値が高い。3.マスター確認済みの許可リストと突合すればFalse Positiveを抑えつつ自動チェックできる。 | 1.顧客名の許可リスト管理が別途必要で、リスト更新を怠ると誤検知または見逃しが起きる。2.hook判定ロジックの単純な文字列一致では表記ゆれ、漢字カナローマ字、を拾いきれない可能性がある。 | なし。既存secret-write-gate.mjsはAPIキー系専用と実装確認済で対象PIIは非カバー。重複ではなく別軸の拡張。 | .claude/hooks/secret-write-gate.mjs、scripts/check-secret-patterns.mjs、aux/reports-b.json、git status docs/deliverables/portfolio-strategy-understanding.html |
| C-6 | token-audit定期実行によるコンテキスト膨張の継続監視 | [実測:bash-freq head_freqのaudit.mjs実行=3回、手動実行のみ。aux/failures-classified.json 2026-07-04にtoken-audit(scripts/token-audit)のfs.readdirSync非再帰走査バグでagent-*.jsonl1597ファイルを見落としの記録あり] | [タグ:低頻度な手動実行かつバグ混入に気づきにくい] 月30日で3回しか回されておらず、走査ロジックのバグ、1階層のみでネストしたsubagentログを見落とす、も長期間気づかれなかった前例がある。 | [タグ:定期実行と出力差分監視で異常を早期検知] 週次程度でaudit.mjsを実行し、走査対象ファイル数の異常な減少をWARN表示する。 | 1.手動3回月から定期実行に切替ることで計測の空白期間が縮む。2.サンプル数が急減した等のメタ異常を機械検知でき2026-07-04と同種のバグ再発を早期発見できる。3.project_context-reduction-backlog.mdのコンテキスト圧迫恒久対策の実測データが定常的に溜まる。 | 1.BK-10、自動注入総量と行数ゲート拡張、と目的が近く、役割分担を明文化しないと二重管理になる。2.監査対象ログが肥大しており毎回全走査だと実行コストが増す。 | project_context-reduction-backlog.mdとaux/backlog-catalog.json BK-10と隣接領域。重複ではないが役割整理が前提。 | scripts/token-audit/audit.mjs、aux/failures-classified.json 2026-07-04、memory/project_context-reduction-backlog.md |

## 詳細節

### C-1 feed-check
- トリガー設計案: 時刻駆動、schtasks、毎朝07:50付近、x-vault-sync08:00の直前枠。x-vault-syncと時間帯を分けてログ衝突を避ける。
- 暴走リスク: RSS取得先が応答しない場合の無限リトライを避けるため、タイムアウトと1回リトライで打ち切る設計にする。判断フロー、単発事実確認とweb_search、複数ソース横断とNotebookLM、の分岐はAIの都度判断を要するため、無人実行は取得からvault保存までに限定し、事業文脈との横展開分析は従来通りセッション内AIが担う二段構成にする。全自動化するとNotebookLM側のcontext圧迫防止ルールに抵触しかねない。
- 通知過多リスク: 毎日実行だと新着なし日にも通知が飛びまたかで無視されやすい。新着0件時は無通知、新着ありの日のみ通知、に絞る。

### C-2 hook-errors.jsonl定期grep
- トリガー設計案: 時刻駆動、GitHub Actionsまたはschtasksで毎日1回、check-hook-runtime-errors.mjs --days 1 --listを実行する。既存のCheck-in駆動、--days 14、は残し両輪にする。
- 暴走リスク: 検知後の自動修復は行わない、検知のみ。誤ってhookファイルを自動書き換えたり自動再起動する設計にはしない。無人実行での自己修復は本人の意図しない変更を生む。
- 通知過多リスク: exit_code非0の中には意図的blockも混在するため、集計フィルタを非ブロッキングエラーに厳密限定しないと誤検知の通知が濫発する。

### C-3 settings.local.json allow棚卸
- トリガー設計案: 時刻駆動、月次、schtasksまたはActions。件数とkind別内訳をJSON差分でファイル保存し前回との差分をレポートする。
- 暴走リスク: 自動削除は行わず棚卸レポート生成までに限定する。ルール削除はマスター承認必須。permission-defense.mdのDenyAskAllow3段モデルに反する自動変更を避ける。
- 通知過多リスク: 月次なら過多になりにくいが、閾値、例えば前回比プラス50件等、を設けて増加が大きい時だけ通知にする。

### C-4 GSAP upstream定期差分取込
- トリガー設計案: 時刻駆動、週次、GitHub Actions。greensock/gsap-skillsの最終commit日時やタグをAPI取得し前回記録との差分を検知する。
- 暴走リスク: 差分検知のみで自動的にコード側のGSAP利用箇所を書き換えることはしない。バージョン互換性検証なしの自動追随は破壊的変更のリスクが高い。
- 通知過多リスク: 週次で差分なしなら無通知。差分検知時のみ要レビューを起票する。

### C-5 顧客情報マスキンググレップのhook化
- トリガー設計案: イベント駆動、Write/Edit/MultiEditフック、既存hook-runner.mjs経由でsecret-write-gate.mjsと同枠に新規ルールを追加し、対象パスをportfolio関連ディレクトリとdocs/deliverables配下に限定する。
- 暴走リスク: 誤検知でブロックした場合に正当な作業が止まる、deny型hookの宿命。許可リスト、顧客名や屋号のホワイトリスト、の運用が前提で、リスト未整備のまま本番投入すると誤ブロック多発でhook自体が無効化される危険がある。
- 通知過多リスク: イベント駆動なのでWrite毎の判定のためログではなく即時ブロック型。通知過多よりも誤ブロック過多の方が実害が大きい点に注意。

### C-6 token-audit定期実行
- トリガー設計案: 時刻駆動、週次、schtasksまたはActions。scripts/token-audit/audit.mjs実行結果のファイル数と行数をログ化する。
- 暴走リスク: 監査結果の自動反映、例えば自動でSessionStart注入を削る等、はしない。検知とレポートのみに限定する。
- 通知過多リスク: 走査対象ファイル数が前回比で急減、バグ再発の兆候、した場合のみWARNする。通常の微増減では通知しない。

## 出典まとめ
- agg/summary.json、306セッション30日間、sessions_by_project内訳
- agg/skill-usage.json、skill_input_freqとattribution_skill_freq
- agg/bash-freq.json、main.head_freq、実行コマンド頻度
- agg/webfetch-domains.json、手動WebFetch先ドメイン頻度
- aux/reports-a.json 40件 と aux/reports-b.json 46件、計86セッション分Check-outレポート逐語
- aux/failures-classified.json 113件、内訳はその他69、破壊操作14、git巻き込み16、秘密漏洩7、未検証断定4、エンコーディング3
- aux/settings-inventory.json、local_allow_classified493件の内訳
- aux/backlog-catalog.json、BK-10等の既起票バックログとの重複確認用
- 実ファイル確認: .claude/hooks/secret-write-gate.mjs、scripts/check-secret-patterns.mjs、scripts/check-hook-runtime-errors.mjs、scripts/check-in-verify.sh435行目、scripts/token-audit/audit.mjs、hook-errors.jsonl実測14133行3.3MB
- 既存自動実行基盤の非重複確認: .github/workflows/audit.yml週次cronでnpm audit専用、.github/workflows/hook-integrity.yml paths発火で静的整合性検査のみ、docs/ops/vault-reflection-reliability.md schtasks二重網で既に完成済のため対象外

## 規律順守メモ
- 全項目の頻度は上表の実測キーまたは推定根拠で明記。agg配下とaux配下に未記載の数値は使用していない。
- 平均値は不使用。件数と行数はすべて実数、中央値表記が必要な箇所はagg側のcounts_medianとcounts_modeをそのまま引用。
- sidechain区分は全項目0またはnullのため合算対象から除外。
- 採否判断はここでは行わず、種として拾った6項目C-1からC-6を全て残した。
