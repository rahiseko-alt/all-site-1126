# リスト④ 環境として改善すべき事

対象範囲: settings/permissions 構成・MCP・トークン消費構造・ディレクトリ/リポジトリ構成・OS資産の歪み。
採否判断はしない。数値は実数（丸めなし）。平均値は使わず中央値・実数・件数で提示。

## Schema 表

| ID | 項目名 | 頻度or規模 | 現状コスト | 改善後見込み | メリット | デメリット | 既起票候補フラグ | 出典 |
|---|---|---|---|---|---|---|---|---|
| E-1 | local allow 493件の意味的衝突（機械conflict判定0件だが再検査で複数該当） | [実測:aux/settings-inventory.json] local_allow_classified 493件、conflict非null=0件／再検査(正規表現)でrm系8・taskkill系4・cmd系9・pip install系9・Remove-Item系2・Stop-Process系1・curl系2 が該当 | [実測] canonicalのdeny方針（rm -rf・curl・破壊操作事前同意）と実体のlocal allowが字面上一致しないまま493件が線形展開・自動conflict検知はヒットゼロ | [推定] 意味的衝突該当ルールをlocal allowから削除しproject ask段へ格上げすればcanonical文書と実体の一致率が上がる | 1) 誤ってdenyしたいコマンドが自動通過するリスクの可視化 2) 次AIがcanonical文書を信じて安全と誤認する事故を防止 3) P2規律（破壊的操作は事前同意必須）と設定の整合 | 1) 493件の人力棚卸しコストが高い（自動判定が機能していないため） 2) 過去に正当理由で許可した一回性コマンドまで誤って締め出す過検知リスク | なし（本ドラフト新規） | aux/settings-inventory.json |
| E-2 | settings.local.json のスコープ優先度によるproject/global deny迂回構造 | [実測:aux/settings-inventory.json] project.deny=20件（Bash(rm -rf:*)・git push --force*・git reset --hard*等）、project.ask=15件、global.deny=4件（Bash(curl *)・Bash(npm install:*)等）に対し、local allowにBash(curl:*)・Bash(rm:*)・Bash(cmd:*)・Bash(cmd.exe *)・Bash(powershell:*)・Bash(powershell.exe:*)・PowerShell(Remove-Item *)・PowerShell(Stop-Process *) が実在 | [推定] Claude Code設定優先順位はlocal>project>userのため、上記local allowの広域ワイルドカードがproject/global denyより優先解釈されうる構造 | [推定] cmd.exe/powershell.exe等の「シェル丸ごと許可」パターンを廃止し、個別コマンド単位のask/denyへ置換すれば迂回経路が閉じる | 1) curl等のシークレット外部送出経路の恒久遮断 2) cmd/powershell経由のBash文字列deny回避（抜け道）を封鎖 3) 破壊系操作（Remove-Item, Stop-Process, taskkill）が無条件許可のまま残る現状を解消 | 1) cmd.exe/powershell.exe全面禁止は正当なWindows運用操作（ffmpeg確認・プロセス確認等）まで巻き込む可能性 2) スコープ優先度の実仕様（local/project/globalのマージ規則）の一次情報未確認のまま設計変更すると意図しない副作用 | permission-defense.md/canonicalに評価順序(Deny→Ask→Allow)の記載はあるがスコープ間優先度の明記は要再確認・関連はするが新規起票 | aux/settings-inventory.json, .claude/rules/permission-defense.md |
| E-3 | claude.ai MCP connector 65ツール固定費 | [実測:aux/backlog-catalog.json CR-A] 65ツール・40.6kトークン固定費 | [実測] 毎セッションのコンテキストに固定費として乗る（vibe-base本体だけで直近1ヶ月111セッション） | [推定] 未使用コネクタ(Canva/Gmail/Calendar/Drive/Notion等)をdisconnectすれば当該固定費が消える | 1) 全セッションのベースコンテキスト削減 2) 未使用ツール定義の維持コストゼロ化 3) トークン単価に対する固定費比率の低下 | 1) 将来利用する可能性のあるコネクタを切ると再設定コストが発生 2) マスター手動判断が必要（グローバル設定変更のため机上検証だけでは決められない） | あり（CR-A・マスター手動判断待ち・未決） | aux/backlog-catalog.json |
| E-4 | transcriptディスク肥大化・subagent転記が総量の過半数 | [実測] C:/Users/user/.claude/projects 総計779MB（du -sh、集計期間2026-06-07〜2026-07-07の1ヶ月・agg/summary.json periodと一致）。うちsubagentsディレクトリ177件の合計400MB（du -sm集計、総量の約51%） | [実測] token-audit集計ツール(scripts/token-audit)がsubagents配下1階層ネスト(セッションID配下のsubagents/agent-連番.jsonl)を非再帰走査で見落とし「サブエージェント消費は算出不能」と誤結論、事後訂正で総額9,956ドル→11,154ドルに変更（aux/failures-classified.json 2026-07-04記載） | [推定] token-auditを再帰走査に修正し、subagents配下を継続的に容量監視・古いtranscriptのアーカイブ/削除ポリシーを設ければ実額把握とディスク圧迫の両方に対処できる | 1) 実コスト集計の正確性回復（既に1度1,198ドルのズレが実証済） 2) ディスク使用量の継続的把握 3) 将来のクリーンアップ判断材料の確保 | 1) transcript削除は将来のセッション復元・監査証跡を失うリスク 2) 再帰走査化はtoken-auditツール自体の改修工数が必要 | 部分関連（VP-6「/tmp固定パス」言及はあるが本件のnon-recursive readdir問題自体は未起票）→新規 | aux/failures-classified.json(2026-07-04), C:/Users/user/.claude/projects実測 |
| E-5 | learning-suite-kanji 単一セッションが69MB中61MB(約88%)を占める外れ値 | [実測] du実測：learning-suite-kanjiプロジェクト total 69MB、セッションディレクトリ7781a924配下のsubagents/のみで61MB・agent連番.jsonl 44ファイル（うち7ファイルが5〜7MB級）。同プロジェクトの主session jsonl 4件合計は5,102,963バイト(中央値1,459,796バイト)のみ | [実測] 1セッションのサブエージェント大量並列展開が、他の同種プロジェクト（homepage: 36セッション145MB、vibe-base本体: 111セッション274MB）と比べ突出したディスク・トークン単価になっている | [推定] サブエージェント並列数の上限指針、または大容量出力（PDF/画像処理系）を返すサブエージェントの出力サイズ制御を設ければ再発を抑制できる | 1) 突出コストセッションの早期検知が可能になる 2) 並列展開の設計指針（orchestration-discipline）の実効性検証材料になる 3) 同種の大量並列タスク（PDF処理等）での事前見積り精度向上 | 1) 1件のみの観測でパターンと断定するには母数が少ない 2) 学習教材PDF処理という業務要件上、並列展開自体を減らすと処理時間が伸びる可能性 | なし（本ドラフト新規） | C:/Users/user/.claude/projects実測 |
| E-6 | outside-vibe-base-gate hookの例外リスト陳腐化によるscratchpad Writeブロック→Bash迂回→誤展開ディレクトリ生成 | [実測:本セッション観測] 正規scratchpadパスへのWriteがhookでブロックされ、サブエージェントがBash経由の迂回を強いられた。1体が環境変数リテラル誤展開によりvibe-base直下に「＄HOME/AppData/Local/Temp/claude/C--Users-user-Desktop-ClaudeCode-vibe-base/396557ec-d763-4e9f-b6f2-2263feb4926c」という迷子ディレクトリを作成（git statusで「? ＄HOME/」を確認済）。同種の痕跡が「tmp/fakehome-fix1/.claude/」にも既存（別セッション由来・再発2件目） | [実測] git statusにuntracked資産として残留し、コミット時の巻き込み事故・レビュー負荷を発生させる | [推定] hookの例外パス許可リストにscratchpadパターンを追加し、サブエージェントのBash迂回自体を不要にすれば誤展開の発生源が消える | 1) 正規Write経路の復活でBash迂回そのものが不要になる 2) 誤展開ディレクトリの再発防止（既に2件確認済のパターン） 3) git statusのuntracked雑音削減でコミット前チェックの負荷が下がる | 1) hookの例外リスト追加は他の意図しないパスも同時に緩めるリスク 2) 既存の誤展開ディレクトリの削除は破壊的操作のため事前同意が必要 | なし（本ドラフト新規）※propagate-hooks.mjsの類似構造欠陥（2026-06-27, hook除去が全製品に温存される事例）・secret-write-gate hookのERR_MODULE_NOT_FOUND放置事例(2026-06-16)が同系統の「hook例外/伝播リスト陳腐化」としてfailures-classified.jsonに記録あり | 本セッションgit status/find実測, aux/failures-classified.json(2026-06-16, 2026-06-27) |
| E-7 | Bashツールのヒアドキュメント/バックスラッシュ折り畳みによる出力破損 | [実測:本セッション観測] 本セッション中に2回heredoc破損が発生。過去ログでも同系統の再発: 2026-06-06「git commit -m の値をPowerShell here-string記法で渡しBashでは無効化されcommit subjectに文字化けが混入」(aux/failures-classified.json git巻き込み分類)、2026-06-19「Windows git-bashのsedによるパス区切り置換がASCIIバックスラッシュにマッチせず空振り」(同エンコーディング分類) | [実測] 保存・commit・sed置換のたびに手動リトライや事後修正(amend等)が発生し作業時間を消費 | [推定] Windowsパス/バックスラッシュを扱う操作は一律「キャプチャ再利用パターン」または「tmpへWrite後にcpでバイト正確コピー」の定型手順に統一すれば再発を防げる | 1) heredoc破損の事後修正コスト削減 2) commit subject文字化け等のgit履歴汚染防止 3) 定型手順化により次エージェントが同じ罠を踏まない | 1) 定型手順の徹底はドキュメント化・周知コストがかかる 2) Bashツール自体の内部実装（バックスラッシュ折り畳み挙動）は外部から制御不能なため回避策止まりで根治ではない | なし（本ドラフト新規） | 本セッション観測, aux/failures-classified.json(2026-06-06, 2026-06-19) |
| E-8 | モノレポ→製品別リポジトリ分離未完了による並行セッションgit衝突 | [実測:aux/failures-classified.json] category=git巻き込み 16件。うち複数が共有index/backups肥大（rebase --autostashが数分化）・submodule判定誤り・並行push競合(non-fast-forward)・未コミット作業ツリーの巻き戻し等、モノレポ共有構造に起因 | [実測] GS-46「モノレポ→製品別ローカルgit分離」はStep1-3完了・Step4-6未実施(aux/backlog-catalog.json) | [推定] Step4-6（全製品分離のdry-run→スモークテスト→本実行）を完了すれば製品間のgit衝突源が構造的に消える | 1) 並行セッション間のindex競合・push競合の根絶 2) submodule判定誤り等の3点照合運用の手間削減 3) 1製品の作業が他製品のuntracked/staged状態に波及するリスク解消 | 1) 分離実行自体が大規模破壊的操作でありdry-run→1製品先行→全体という段階実行が必須（一括実行は禁止） 2) 分離後は各製品が独立git運用になるため既存の一括checkout/checkin運用フローの改修が必要 | あり（GS-46・Step1-3完了/Step4-6未実施） | aux/failures-classified.json(git巻き込み16件), aux/backlog-catalog.json |
| E-9 | cache_read比率が全体平均から突出して低いプロジェクト群（コンテキスト再利用非効率） | [実測:agg/tokens.json main.by_project] 全体cache_read比率0.9592（cache_read 9,727,729,257 ／ 総計10,141,002,571）に対し、C--Users-user-AppData-Local-Temp比率0.5828(n=104件)、kosespark-video-shorts比率0.5852(n=75件)、n8n比率0.6621(n=11件)が突出して低い | [実測] 上記3プロジェクトは短時間・単発実行が多く会話継続によるキャッシュ再利用が働きにくい構造（n8n=11件, video-shorts=75件はいずれも他製品比で少数セッション） | [推定] 単発実行が主体のワークフロー（スクリプト実行・自動化ジョブ系）は元々キャッシュ再利用に向かないため、比率改善よりも「なぜこの3件だけ低いか」の個別要因調査が先 | 1) キャッシュ非効率プロジェクトの特定により追加コスト要因の切り分けが可能 2) 全体比率0.9592自体は良好であることの再確認（過剰対策の回避） 3) 単発実行系ワークフローの設計見直し材料になる | 1) 比率が低い＝即問題ではなく単発実行という性質上の限界の可能性が高く、対策コストに見合わない可能性 2) n=11件(n8n)は母数が少なく統計的な断定は困難 | なし（本ドラフト新規） | agg/tokens.json |

## 詳細節

### E-1 / E-2: local allow の意味的衝突とスコープ優先度リスク（保守コスト・二次影響）

- 保守コスト: settings-inventoryの自動conflict判定は文字列完全一致方式のためワイルドカード同士の包含関係（例: Bash(rm:*) が Bash(rm -rf:*) の実行文字列を包含する）を検知できない。今後も新規local allow追加のたびに同種の意味的衝突が無検知のまま蓄積する構造。
- 二次影響: 本ドラフト作成時点でcanonical文書（.claude/rules/permission-defense.md から docs/rules/permission-defense-canonical.md）はDeny→Ask→Allowの評価順序のみを規定しており、local/project/globalの3層間の優先度（Claude Code公式仕様ではlocal>project>userの可能性）が明文化されていない。次にAIが「denyしてあるから安全」と判断する誤信頼の再発源になりうる。

### E-4 / E-5: transcriptディスク・subagent転記（保守コスト・二次影響）

- 保守コスト: 現行のtoken-audit集計ツールがsubagents配下の1階層ネストを見落とす実装のまま放置されており、今後も新規セッションのサブエージェント消費が過小算出され続ける。E-5のような単一セッション外れ値（学習教材PDF処理での大量並列展開）はこのツールが直っていないと検知できない。
- 二次影響: 779MB/月ペースが継続すると年間で9GB超に達する規模。ディスク容量そのものよりも「どのプロジェクト・どのセッションが異常消費か」を継続監視する仕組みが無いことが二次リスク。

### E-6 / E-7: hook例外リスト陳腐化とBashツールのWindows特有バグ（保守コスト・二次影響）

- 保守コスト: 本セッションで実際に発生した「scratchpad Writeブロック→Bash迂回→誤展開」は、tmp/fakehome-fix1/.claude/という過去の同型痕跡と合わせて2件目の再発。propagate-hooks.mjsのROOT_ONLY_HOOK_NAME不整合（2026-06-27）やsecret-write-gate hookのERR_MODULE_NOT_FOUND放置（2026-06-16）も同じ「hookの例外/伝播リストが実体と食い違う」という構造的パターンであり、個別修正のたびに次の陳腐化が起きている。
- 二次影響: Bashツールのヒアドキュメント/バックスラッシュ折り畳みはツール内部実装に起因するため、回避策（tmpへWrite後にcpコピー、キャプチャ再利用sed等）を都度周知する運用コストがかかり続ける。根治にはBashツール自体の改修が必要だが、それはこの環境（vibe-base側）からは制御できない領域。

### E-8: モノレポ分離未完了（保守コスト・二次影響）

- 保守コスト: GS-46のStep4-6（全製品分離の本実行）が未実施のまま複数セッションが並行稼働し続けており、放置期間が長引くほどbackups/肥大や新規製品追加によって分離作業そのものの難度が上がる。
- 二次影響: 並行セッション環境での「完了イコールコミット済まで信用しない」という運用ルールが事後対応として定着しているが、これはモノレポ構造という根本原因を回避する対症療法であり、根治（GS-46完遂）が先送りされ続けるほど対症療法の運用コストが積み上がる。

---
項目数: 9件（E-1〜E-9）
