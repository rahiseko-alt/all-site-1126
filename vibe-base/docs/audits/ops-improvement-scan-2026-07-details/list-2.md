# リスト2: 毎日繰り返されている ask（permission prompt）のうち危険が小さく allow リストに加えてよい事（起草）

- 対象期間: 2026-06-07〜2026-07-06（agg/ask-events.json 実測247件のrejections・main bucket）
- 一次データ: agg/ask-events.json（rejections=実測247件／rejections_summary／replay_estimate=推定／gap_estimate=推定）、agg/bash-freq.json（main.head_freq=全期間コーパス頻度・裏付け専用）、agg/webfetch-domains.json（main.freq）
- 二次データ: aux/settings-inventory.json（154KB・node集計のみでRead未実施。project allow32/ask15/deny21・global allow0(null)/ask0(null)/deny4・local_allow_classified 493件を6分類=汎用Bash198/その他12/WebFetchドメイン187/汎用パターン20/一回性Bash43/MCP33）
- **encoding注記**: settings-inventory.json の日本語分類ラベルは cp932 バイト列がそのまま埋め込まれ utf8 decode で文字化けした（memory/reference_windows-cp932-json-utf8.md と同系統の罠）。latin1バイナリ保持 → JSON.parse → 各文字列を shift_jis 再デコード、の順で機械復元して数値を確定した（6分類の内訳数値198/12/187/20/43/33はこの復元後の実測）。
- 記法注記: 保存規約により本文中の allow ルール案の環境変数展開・コマンド置換記号は全角＄で代替表記した。実際に設定ファイルへ反映する際は＄を半角記号に戻すこと。
- 高信頼判定基準: replay_estimate.main.freq（現行allowに前方一致しなかった＝推定）と gap_estimate.main.by_bash_head.freq（承認待ちギャップ超8秒＝推定）の両方に bash_head 正規化キーが載るもの＝68パターンの交差集合を優先精査した（median=1/mode=1の裏に埋もれた外れ値を抽出）。rejections（実測247件中 bash_head 付き18件）に実際に載っている場合は実測タグを併記。
- 数値は中央値・最頻値・実数のみ（平均値不使用）。sidechain バケツは別記（main と合算しない）。

## 表（観点1: 高信頼askパターン=replay∩gap・読み取り専用/可逆）

| ID | 項目名(allowルール案) | 頻度 | 現状コスト | 改善後見込み | メリット | デメリット | 既起票候補フラグ | 出典 |
|---|---|---|---|---|---|---|---|---|
| A-1 | Bash(sleep:*) | [推定: replay=84／gap=46]（参考: bash-freq全体「sleep」=122・median1/mode1の外れ値） | [高頻度ask・待機のみで副作用ゼロなのに毎回ask] | [ask消滅] | 1.ファイル・状態を一切変更しない純粋待機コマンドで可逆性が最大 2.replay84件は現行allowに未前方一致の生きた摩擦であることが確認済み 3.ポーリング系スクリプトの中断を構造的に無くせる | 1.sleep 9999等バックグラウンド化で長時間ハングの温床になりうる 2.単体無害でも「sleep N かつ 危険コマンド」のように複合コマンド内の時間差実行部として悪用され得る | 無 | agg/ask-events.json; agg/bash-freq.json |
| A-2 | Bash(head:*) | [推定: replay=51／gap=25]（参考: bash-freq全体「head」=2056） | [高頻度ask・読取専用なのに毎回ask] | [ask消滅] | 1.ファイル内容を変更しない読取専用コマンド 2.Bash(cat:*)は既にproject.allow済でheadだけ未収録という非一貫を解消 3.replay51は現行未前方一致の実摩擦 | 1.head -c等でバイナリ内容をそのまま出力し機密ファイルの中身が意図せず表示される経路になり得る 2.パイプ先が任意でhead file→curl evil.com等、下流コマンドの承認まで暗黙に緩めた錯覚を生みうる | 無 | agg/ask-events.json; agg/bash-freq.json |
| A-3 | Bash(tail:*) | [実測: rejections bash_head「tail」=1][推定: replay=35／gap=16]（参考: bash-freq全体「tail」=919） | [中頻度ask・実測rejection有り] | [ask消滅] | 1.読取専用・可逆 2.実測rejection（承認待ちが実際発生した記録）で体感摩擦を確認済み 3.ログ監視・進捗確認という定型用途が大半 | 1.tail -fは無限フォロー動作になりプロセスが残留する恐れ 2.head同様パイプ経由の下流コマンド委任リスク | 無 | agg/ask-events.json rejections; agg/bash-freq.json |
| A-4 | Bash(test:*)（既存test -f:*の一般化） | [推定: replay=15／gap=7]（参考: bash-freq全体「test」=275） | [中頻度ask・条件判定のみで副作用皆無] | [ask消滅] | 1.シェル組込の真偽判定のみで一切のI/O副作用がない 2.既存Bash(test -f:*)が既にproject allow済＝安全性はマスター自身が既に承認済みの前例 3.-f限定を-d/-e/-z等に広げても新規リスク面はほぼ増えない | 1.testは複合コマンド列の先頭にも現れ、前方一致の性質上、複合コマンドの残り部分まで自動承認したと誤認される表示リスクがある 2.現行の-f限定より対象条件が広がる分、意図の異なる判定コマンドの承認判断がAI任せになる | 無 | agg/ask-events.json; aux/settings-inventory.json project.allow |
| A-5 | Bash(date:*) | [推定: replay=8／gap=2]（参考: bash-freq全体「date」=20） | [低頻度ask・時刻取得のみ] | [ask消滅] | 1.システム時刻の読取表示のみで副作用ゼロ 2.ログファイル名生成やタイムスタンプ付与など定型用途 3.他の類似読取系（pwd/which）と一括整理できる | 1.単独無害だがdateは多くのワンライナー先頭に現れやすく、前方一致の一般化が他の危険な複合コマンドを覆い隠す表示上の誤解を招きやすい 2.頻度自体は低く（実質8件）投資対効果は他候補より小さい | 無 | agg/ask-events.json; agg/bash-freq.json |
| A-6 | Bash(pwd:*) | [推定: replay=6／gap=1]（参考: bash-freq全体「pwd」=13） | [低頻度ask・現在ディレクトリ表示のみ] | [ask消滅] | 1.完全な読取専用・副作用ゼロの最も単純なコマンド 2.CLAUDE.md操作規律「絶対パス指定」実践の確認用途として頻出 3.低頻度ゆえ導入リスクも最小 | 1.頻度が低く（実質6件）優先度は最下位クラス 2.単体候補として起票する費用対効果が小さい | 無 | agg/ask-events.json; agg/bash-freq.json |
| A-7 | Bash(printf:*) | [推定: replay=7／gap=2]（参考: bash-freq全体「printf」=109） | [低頻度ask・フォーマット出力のみ] | [ask消滅] | 1.標準出力への整形出力のみでファイル・プロセスへの副作用がない 2.MISSION_LOG等ドキュメント整形の定型作業で頻出 3.echoは既にproject.allow済でprintfだけ未収録という非一貫を解消 | 1.リダイレクトを伴えば任意ファイル書込に転用可能で前方一致だけではリダイレクト先の安全性を判定できない 2.複合コマンドの一部として偽装表示に使われる難読化手口の先頭トークンになり得る | 無 | agg/ask-events.json; agg/bash-freq.json |
| A-8 | Bash(which:*) | [推定: replay=1／gap=1]（参考: bash-freq全体「which」=7、Windows等価のwhereも同型） | [極低頻度ask・パス探索のみ] | [ask消滅] | 1.実行ファイルの所在確認のみで副作用ゼロ 2.環境差異調査という定型初動作業 3.低頻度・低リスクで導入コストが最小 | 1.頻度n=1と極めて小さくノイズの可能性を否定できない 2.調査対象コマンド名が任意文字列であるため何を探しているかの意図確認機会（ask）を失う | 無 | agg/ask-events.json |
| A-9 | Bash(awk:*)（要注意） | [推定: replay=7／gap=2]（参考: bash-freq全体「awk」=84） | [低頻度ask・大半はテキスト集計抽出] | [部分ask消滅・監視継続推奨] | 1.MISSION_LOG分割等ドキュメント処理の定型用途 2.標準出力のみの集計用途が大半で可逆 3.sed同様、既存の一回性局所allowの一般化にあたる | 1.awkはsystem関数を持ち任意シェルコマンドを実行できる（node -eと同格の任意コード実行ゲートに相当しうる）。前方一致のBash(awk:*)は本体スクリプト内容を検査しないためこの経路をask無しで開放する 2.リダイレクト・外部コマンド実行と組み合わせ可能で読取専用と言い切れない | 無 | agg/ask-events.json; agg/bash-freq.json |
| A-10 | Bash(sed:*)（要注意） | [推定: replay=18／gap=7]（参考: bash-freq全体「sed」=139） | [中頻度ask・大半はsed -n等の抽出表示] | [部分ask消滅・in-place除外を推奨検討] | 1.MISSION_LOG分割・archive退避などdocs運用の定型作業で頻出 2.sed -n（stdout抽出のみ）は完全な読取専用 3.replay18/gap7は現行未前方一致の実摩擦として確認済み | 1.sed -iは対象ファイルを直接書き換える不可逆操作でありBash(sed:*)の前方一致はin-place編集を区別なく無ask化してしまう 2.正規表現の誤りによる意図しない全置換事故のリスクはEdit toolより高い（Edit toolはdiffレビューを伴うがsed -iは伴わない） | 無 | agg/ask-events.json; agg/bash-freq.json |
| A-11 | Bash(export:*) | [推定: replay=6／gap=7]（参考: bash-freq全体「export」=17、うちexport PATH=...2件は既に個別許可済み） | [低頻度ask・単発Bash呼出内のみ有効] | [ask消滅] | 1.本環境のBashツールは呼出間でシェル状態を保持しないため影響は当該1コマンド実行内に限定される 2.PATH拡張という既に個別承認済みの用途が主要ケース 3.環境変数代入自体はファイル・ネットワークへの副作用がない | 1.後述の除外理由にあるAPIキー名を冠した代入パターンが同一交差集合内に実在し、export全般許可がシークレット値代入の将来的な無ask通過リスクを生む 2.exportは複合コマンドの先頭に現れやすく後続コマンドの危険性を覆い隠す表示上の錯覚を生む | 無 | agg/ask-events.json; agg/bash-freq.json; aux/settings-inventory.json 一回性Bash |
| A-12 | Bash(for:*)（高リスク・広範allow非推奨） | [実測: rejections bash_head「for」=1][推定: replay=14／gap=28]（参考: bash-freq全体「for」=251） | [高頻度ask・gapが交差集合中最大級(28)] | [要検討: 単純allowは攻撃面拡大につながるため非推奨] | 1.実測rejectionあり・gap28は交差集合中でも最大級の承認待ち不満 2.多くはfor f in *.html; do wc -l のような無害な集計ループ 3.頻度自体は改善余地の大きさを示す | 1.forはシェルの制御構文でありループ本体には任意コマンドを置ける。Bash(for:*)の前方一致を許可するとdeny対象コマンドをforでラップして先頭トークンを偽装するだけで通過してしまう構造的な抜け道になる 2.pre-bash-destructive.mjs hookは複合コマンド解析を実装しない設計（canonical記載）のため、forラップは検知網の外側になる | 無 | agg/ask-events.json rejections; docs/rules/permission-defense-canonical.md |
| A-13 | Bash(timeout:*)（高リスク・広範allow非推奨） | [推定: replay=3／gap=3]（参考: bash-freq全体「timeout」=10） | [低頻度ask] | [要検討: 単純allowは攻撃面拡大につながるため非推奨] | 1.タイムアウト制御自体は実行時間を制限する安全弁機能 2.ハング対策として無害な用途（ビルド/テストの時間制限）が主 3.頻度は低く導入しても影響範囲は小さい | 1.timeoutは任意コマンドをラップする実行制御構文で、deny対象コマンドの先頭トークンをtimeoutに置き換えるだけの回避経路になり得る（A-12のforと同型の抜け道） 2.A-12と同様、pre-bash-destructive.mjs hookの単独prefix match限定の設計ではtimeout配下の危険コマンドを検知できない | 無 | agg/ask-events.json; docs/rules/permission-defense-canonical.md |
| A-14 | 無害env代入プレフィックス許可（例: PYTHONUTF8=1固定） | [推定: replay=2／gap=7] | [低頻度ask・エンコーディング設定のみ] | [ask消滅] | 1.文字コード設定という副作用のない環境変数代入 2.Windows cp932/UTF-8 JSON罠（本タスクでも実際に遭遇）の回避策として正当な用途 3.値が固定文字列で可変部分がなく安全性の判定が容易 | 1.env代入プレフィックス全般を緩めると変数名や値を変えた別の代入パターン（シークレット等）まで同一ルールで拾ってしまう恐れがあるため値まで固定した狭いパターンに限定すべきで一般化は非推奨 2.実質的な効果は限定的（replay2件と頻度が低い） | 無 | agg/ask-events.json |
| A-15 | Bash(notepad.exe:*) | [推定: replay=2／gap=1]（参考: bash-freq全体「notepad.exe」=2。既に局所一回性allowでBash(notepad *)が1件存在＝実質ほぼ解決済） | [極低頻度ask・GUIアプリ起動のみ] | [ask消滅（既存一回性allowで大半カバー済）] | 1.Windows標準搭載のテキストエディタを開くだけで外部コード実行を伴わない 2.マスター向け完成物の目視提示用途（表示規律「見せて」対応）として妥当 3.頻度・リスクともに最小 | 1.頻度が極めて低く（n=2）新規allow追加の投資対効果が小さい 2.任意ファイルパスを引数に取れるため理論上は意図しないファイルを開いてしまう可能性はゼロではない | 無 | agg/ask-events.json; aux/settings-inventory.json 汎用Bash |
| A-16 | Bash(Godot_v4.7系exeパス限定:*)（spire-lite製品限定） | [推定: replay=10+5(console版含む)／gap=9+5]（参考: bash-freq全体「Godot_v4.7-stable_win64.exe」=10、「_console.exe」=18、GODOT変数参照=12） | [中頻度ask・ローカルゲームエンジン起動のみ] | [ask消滅（spire-lite製品スコープに限定）] | 1.Godotは正規インストール済みのゲームエンジン本体であり破壊的操作を一切含まない起動コマンド 2.spire-lite製品のUI/挙動を実機確認する目視検証に必須の定型操作 3.実行ファイルパスが固定でありプロダクト外に汎用化しない限りリスクは局所化できる | 1.任意exeの起動を一般化する前例になりやすく、拡張解釈を招くとnode -eと同格の任意コード実行ゲートを実質無効化するリスクがある（このexeパス固有への厳密限定が前提） 2.固定パス依存のためマシン移行・パス変更時にルールが陳腐化し都度メンテが必要 | 無 | agg/ask-events.json; agg/bash-freq.json |

## 表（観点2: WebFetchドメイン汎用化）

| ID | 項目名(allowルール案) | 頻度 | 現状コスト | 改善後見込み | メリット | デメリット | 既起票候補フラグ | 出典 |
|---|---|---|---|---|---|---|---|---|
| A-17 | WebFetch(domain: kouheikosehira.com系ワイルドカード)（自社ドメイン群の集約） | [推定: agg/webfetch-domains.json main.freq — kouheikosehira.com=5, portfolio.=2, foodee.=1, business.=1, trimmer-system.=1（計10・5サブドメイン）][settings側実測: WebFetchドメイン187件中に該当7件が個別allow済＝各初回に個別askが発生済んだ証跡] | [中頻度・自社サブドメイン新設の都度、初回askが発生] | [サブドメイン単位のask消滅・新規サブドメイン追加時も無ask] | 1.全て自社保有ドメイン（review/portfolio/foodee/business/ai-answer/aiueo/trimmer-system等）で第三者ドメインではなく信頼度が最も高い部類 2.現状は個別ドメインごとに初回1回askが必要でありサブドメイン新設の都度この摩擦が繰り返される（既に7件個別許可済という実績が推移を裏付ける） 3.本番デプロイ確認・稼働監視という定型作業に直結し頻度は今後も増える見込み | 1.自社ドメインであっても万一DNS乗っ取りやサブドメインテイクオーバーが発生した場合、ワイルドカードは影響範囲をサブドメイン全体に拡大する 2.将来的に第三者へ譲渡したサブドメイン名を誤って踏襲した場合、無ask到達が意図せず継続するリスク | 無 | agg/webfetch-domains.json; aux/settings-inventory.json WebFetchドメイン |
| A-18 | WebFetch(domain: github.ioワイルドカード追加、github.com/raw.githubusercontent.comは個別維持） | [推定: agg/webfetch-domains.json main.freq — github.com=36, raw.githubusercontent.com=8, gist.github.com=1, api.github.com=1][settings側実測: 既存個別allow4件（github.com/raw.githubusercontent.com/chromedevtools.github.io/googlechromelabs.github.io）] | [低頻度・github.io系は2件が個別askを経て個別許可済] | [github.ioサブドメイン新設時のask消滅] | 1.github.comは最高頻度ドメイン（36件）でOSS調査・ライブラリ確認という定型作業の主軸 2.chromedevtools.github.io/googlechromelabs.github.ioのように公式ツール文書は同一パターンに集約可能 3.github.com本体・raw.githubusercontent.comは個別ドメインのまま維持し基幹ドメインへのワイルドカード適用は避ける設計 | 1.github.ioはGitHub Pagesの任意ユーザーが取得できる名前空間であり公式ツール以外の個人発行物も無差別に無ask到達可能になる（信頼度がgithub.com本体より一段低い） 2.ワイルドカード化しても対象は現状2ドメインのみで頻度的な改善効果は小さい | 無 | agg/webfetch-domains.json |
| A-19 | feed-check固定ドメイン一括事前登録（ワイルドカードでなく個別ドメインのbulk allow） | [推定: agg/webfetch-domains.json main.freq — hnrss.org=6, openai.com=6, zenn.dev=6, rss.itmedia.co.jp=6, goworkship.com=6, www.nippon.com=6, www.technologyreview.jp=6, gsap.com=6, prtimes.jp=5, note.com=4, www.anthropic.com=9（計11ドメイン・median1/mode1に対する外れ値）] | [中頻度・feed-check運用ドメインが1件ずつ初回askを経由] | [feed-check定型実行時のask消滅（新ドメイン追加時のみask残存）] | 1.いずれも同一頻度帯（4-9件）で反復出現しておりfeed-check skillの固定ソースリストに列挙済みの既知ドメインである可能性が高い 2.ニュース/公式ブログ/リサーチ系の読取専用GETのみでWrite/Edit系の副作用を一切伴わない 3.ドメイン数が有限（11件）で一括登録の見積りコストが小さい | 1.ワイルドカード化ではなく個別ドメイン列挙のため、ソースリスト側で将来ドメインが追加されるたびに本リストとの二重メンテが発生する 2.リストの中身との線引きが恣意的になりやすく6件基準の妥当性はマスター判断が必要 | 無 | agg/webfetch-domains.json |

## 表（観点3: node -e系ask の path-resolver CLIラッパー化）

| ID | 項目名(allowルール案) | 頻度 | 現状コスト | 改善後見込み | メリット | デメリット | 既起票候補フラグ | 出典 |
|---|---|---|---|---|---|---|---|---|
| A-20 | 環境変数代入+コマンド置換によるnode呼出プレフィックス許可（VIBE_BASE_ROOT=＄(node resolve-paths.mjs...)相当） | [推定: replay_estimate.main.freq「VIBE_BASE_ROOT=＄(node」=110／gap_estimate.main.by_bash_head.freq 同キー=45（交差集合中で最大の実摩擦）]（参考: bash-freq全体 同キー=111、素のnode resolve-paths.mjsはgapのみ38件・bash-freq全体213件でreplayには不在＝既にproject allow Bash(node:*)で解消済と判明） | [最高頻度ask・resolve-paths.mjsは既にcanonical記載済みの正規CLIラッパーだが呼出構文が原因で毎回ask] | [ask大幅減（交差集合中最大の110件分）] | 1.resolve-paths.mjsはdocs/rules/permission-defense-canonical.mdで既に「node -e ask化と整合する正規CLIラッパー」と明記済みの承認済み設計であり任意コード実行ゲートの再開放ではない（node -e自体は引き続きAsk/除外のまま） 2.根本原因はBash(node:*)が既に許可済であるにもかかわらず環境変数代入+コマンド置換の記法だと前方一致対象がコマンド先頭nodeでなく変数代入部になるため一致しないという既知のマッチング限界（新規リスク発生ではなく既存許可の適用漏れの是正） 3.スクリプト内容自体はリポジトリ管理下のコミット済みファイルでプロンプト由来の任意コードではない | 1.Bashパーミッションの前方一致構文がこの代入+コマンド置換形式のワイルドカードを想定通り扱うか未検証（実際のマッチング仕様は実装依存であり本ドラフト段階では動作保証できない） 2.同一の環境変数代入パターンを他のnode以外のコマンド呼出（例: deny対象を装ったコマンド置換）にまで拡大解釈されると前方一致が代入部分までしか見ないため実質的にコマンド置換全体を無ask化する抜け道になり得る（A-12/A-13と同型のラッパーによるdeny回避リスク） | 有（canonical記載済み: docs/rules/permission-defense-canonical.md「path-resolverはCLIラッパー経由」で方向性は既に確立済み。allowルールとしての実装は本ドラフトが初提起） | agg/ask-events.json replay_estimate.main/gap_estimate.main; agg/bash-freq.json; docs/rules/permission-defense-canonical.md |

## 表（観点4: 一回性Bash 43件の棚卸し＝allowリスト整理）

| ID | 項目名(allowルール案) | 頻度 | 現状コスト | 改善後見込み | メリット | デメリット | 既起票候補フラグ | 出典 |
|---|---|---|---|---|---|---|---|---|
| A-21 | 一回性Bash 43件の非再発分削除候補（ノイズ削減・allowリスト整理） | [実測: aux/settings-inventory.json local_allow_classified 内「一回性Bash」分類=43件（cp932復元後の実測値）] | [ノイズ高・settings.local.json肥大化（局所493件中43件=約8.7%が単発具体コマンドの残骸）] | [ノイズ削減（棚卸し後、再発なしと確認できた分を削除）] | 1.43件はpushd等の具体パス埋め込み一回性コマンドが大半で今後同一文字列で再実行される可能性が低く事実上のデッドウェイト 2.settings.local.jsonの肥大化は危険wildcard残骸の棚卸し推奨という既存規律の趣旨と同じ対象であり定期整理の対象として妥当 3.43件を精査する過程で下記の高リスク残存項目を早期発見できる=棚卸し自体がセキュリティ点検を兼ねる | 1.43件中に既に危険操作が個別allow済のまま残っている（rm -f複数ファイル削除、powershell Remove-Item -Recurse -Force によるディレクトリ再帰削除）＝これらは新規追加候補ではなく既存許可の削除・再点検が必要な項目であり本リストの趣旨と逆方向の対応が必要になる点に注意 2.どれが再発しないかの判定はコマンド文字列の目視のみでは機械的に確定できず削除前に個別確認が要る | 無 | aux/settings-inventory.json local_allow_classified |

## 詳細節

### A-1〜A-8（読取専用・低リスク群の共通所見）

- メリット根拠: いずれもファイルシステム・ネットワーク・プロセス状態に対する書込/削除/送信を一切伴わない「読む・待つ・表示する」だけの操作であり、可逆性の観点で最上位に位置する。交差集合内でも上位頻度（sleep84/head51/tail35/test15）を占め、日常反復の実摩擦であることが二重の推定根拠（replay×gap）で裏付けられている。
- デメリット根拠: 個別コマンド自体は無害でも、前方一致という許可方式の性質上「このコマンドで始まる行は全て無ask」という粒度になるため、パイプ・リダイレクトで下流に接続された別の操作まで暗黙に承認された体感を生みやすい。ask一段の心理的チェックポイントが消えることの累積効果も軽視できない。
- セキュリティ二次影響: 攻撃面拡大の観点では、これら単体コマンドはprompt injection経由で悪用されても実害が小さい（読取・待機のみ）。ただし「読取専用コマンドは安全」という前提そのものが、injectionされた指示が機密ファイル相当の内容を別経路から迂回読取させる呼び水になり得る点は要監視（Read(**/.env)のdeny設計はファイルパスベースで防御済みだが、head/catはコマンドベースの許可であり両者の防御層が異なることを認識しておく必要がある）。

### A-9. Bash(awk:*) / A-10. Bash(sed:*)（要注意群）

- メリット根拠: MISSION_LOG分割・archive退避等のドキュメント運用で高頻度に使われる定型ツールであり、一回性Bash43件の中にも同種の具体的な事例が複数実在し、汎用化のニーズは実証されている。
- デメリット根拠: sedの-i（in-place編集）は対象ファイルを直接書き換える不可逆操作であり、Edit toolのようなdiffプレビューを経由しない。awkはsystem関数経由で任意シェルコマンドを実行できるため実質的にnode -eと同格の任意コード実行ゲートたり得る。
- セキュリティ二次影響: prompt injectionが混入したデータ（外部WebFetch結果や読み込んだファイル内容）が後続のsed/awkスクリプト文字列の組み立てに使われるパターンでは、Bash(sed:*)/Bash(awk:*)の無ask化がinjection由来のコマンド注入をask無しで通してしまう。攻撃面拡大を避けるなら「-nのみ許可し-iは除外」「system呼出を含むawkスクリプトは対象外」といった細分化が必要（本ドラフトでは全候補を残す規律のため広い形のまま提示するが、採用時はこの細分化の要否をマスター判断とすること）。

### A-11. Bash(export:*)

- メリット根拠: 本環境はコマンド間でシェル状態を保持しない仕様のため、export自体の影響範囲は単一コマンド呼出内に限定され、既存のPATH拡張2件も個別承認済で前例がある。
- デメリット根拠: 同一交差集合内にAPIキー名を冠した代入パターンが実在し（除外理由節参照）、exportの一般化がこの種のシークレット関連代入まで無ask化する経路になり得る。
- セキュリティ二次影響: 環境変数経由のシークレット露出は、値そのものは今回空文字列だったが、変数名パターンを機械的に除外するフィルタなしにexport:*を全面許可すると、将来的に実値を含む代入がログ・履歴に残るリスクを構造的に開放する。

### A-12. Bash(for:*) / A-13. Bash(timeout:*)（高リスク群）

- メリット根拠: forは実測rejection・gap28（交差集合中最大級）という強い体感摩擦の裏付けがあり、timeoutも実行時間制御という安全弁的用途が主である。
- デメリット根拠: 両者とも「任意コマンドをラップする制御構文」であり、前方一致の性質上、ラップされた内側のコマンド（rm -rf、curl等のdeny対象）を検知できない。pre-bash-destructive.mjs hookは「複合コマンド解析を実装しない」設計（canonical記載）のため、forやtimeoutで包んだ危険コマンドはhook層でも捕捉されない。
- セキュリティ二次影響: 攻撃面拡大が最も明確な2件。prompt injectionが「forループでdeny対象コマンドを包む」ような形で指示を組み立てた場合、Bash(for:*)が許可されていれば、deny/ask両方の防御層をコマンド先頭トークンの言い換えだけで回避できてしまう。この2件は他候補と異なり「頻度が高い＝即allowすべき」には直結しない典型例であり、採用するとしてもループ本体・ラップ対象コマンドの静的検査を伴うhook強化とセットが前提になることを明記する。

### A-14〜A-16（env代入・GUIアプリ・製品限定exe）

- メリット根拠: PYTHONUTF8=1は値固定の無害なエンコーディング設定、notepad.exeはWindows標準GUIアプリの起動のみ、Godot系はspire-lite製品の実機目視検証（表示規律の実践）に必須の定型操作である。
- デメリット根拠: いずれも頻度が低く（2〜18件）投資対効果は観点1の主要候補（A-1〜A-3等）より小さい。Godotのexeパスは固定パス依存でありマシン移行時に陳腐化する。
- セキュリティ二次影響: A-16（任意exe起動）は「このexeパス固有」に厳密限定しない限り、任意exe起動一般への拡張解釈への呼び水になり得る点が最大の懸念（node -eのAsk化と同格の防御思想が必要）。A-14/A-15は攻撃面拡大の実害はほぼない。

### A-17〜A-19（WebFetchドメイン）

- メリット根拠: 自社ドメイン（A-17）は最も信頼度が高く、github.io（A-18）・feed-check固定ドメイン（A-19）はいずれも読取専用GETで副作用がない。頻度面でも自社ドメイン計10件・feed-check計11ドメインの外れ値（median1/mode1に対して4〜9件）が確認できる。
- デメリット根拠: ワイルドカード化（A-17/A-18）はサブドメインテイクオーバー等の乗っ取りシナリオで影響範囲が拡大する。A-19は個別列挙のためソースリスト側との二重メンテが発生する。
- セキュリティ二次影響: WebFetchはoutbound通信そのものであり、prompt injectionが「信頼済みドメインの別サブドメイン（第三者が同一ワイルドカード配下に取得したサブドメイン）へのリクエスト」を指示した場合、A-17/A-18のワイルドカード許可はこの経路を無ask化する。自社ドメイン（A-17）はDNS管理者がマスター自身であるため乗っ取りリスクは相対的に低いが、github.io（A-18）は第三者が自由に取得できる名前空間であるため同種のリスクがより高い。

### A-20. path-resolver CLIラッパー呼出プレフィックス許可

- メリット根拠: docs/rules/permission-defense-canonical.md で「path-resolverはCLIラッパー経由（node -e ask化と整合）」と既に方向性が確立しており、resolve-paths.mjs自体は任意コードでなくリポジトリ管理下のコミット済みスクリプトである。交差集合中最大の実摩擦（replay110/gap45）を解消できる高レバレッジ項目。
- デメリット根拠: 環境変数代入+コマンド置換という記法を前方一致でどこまで安全にワイルドカード化できるかは実装依存で未検証。同種の代入プレフィックスパターンを他のコマンド（curl等）に流用されるリスクもA-12/A-13と同型で存在する。
- セキュリティ二次影響: 本項目は「node -eという任意コード実行ゲートの再開放」ではなく「既に安全と判断されたCLIラッパー(resolve-paths.mjs)への到達経路の適正化」である点が他候補と質的に異なる。ただし許可パターンをresolve-paths.mjsの具体的なファイル名・引数まで含めた狭い文字列に限定しないと、同じ代入プレフィックス部分の一致だけで別の任意スクリプト（プロンプト由来で新規生成されたスクリプトを含む）の実行までが無ask化される抜け道になり得る。

### A-21. 一回性Bash 43件の棚卸し

- メリット根拠: 43件は具体パス埋め込みの単発コマンドが大半で再利用可能性が低く、定期的なallowリスト棚卸し（危険wildcard残骸の棚卸し推奨という既存規律の趣旨）の対象として妥当。棚卸し作業そのものが下記の高リスク残存項目の発見機会になる。
- デメリット根拠: 「再発しない」の判定はコマンド文字列の目視だけでは機械的に確定できず、削除前にマスターへの個別確認が必要。43件全てを一括削除すると、実際にはまだ再利用予定のあるコマンドを誤って失う恐れがある。
- セキュリティ二次影響: 43件の棚卸し中に発見した重要事項として、rm -fによる複数ファイル削除コマンドと、powershell経由のRemove-Item -Recurse -Forceによるディレクトリ再帰削除コマンドが、いずれも一回性Bashとして既に個別allow済みの状態で現在も設定に残存している。前者はrm -f、後者はrm -rf相当のunrecoverableコマンドであり、局所設定内で既に承認状態のまま放置されている。新規allow候補としてではなく、既存許可の削除・失効を優先検討すべき項目として棚卸し対象に含める。

## 除外理由

危険度評価の必須条件（docs/rules/permission-defense-canonical.md のDeny正規対象＝unrecoverable: rm/taskkill/curl/wget/git push/git reset/npm install/pip install/シークレット系/.env）に照らし、観点1の交差集合（replay∩gap 68パターン）から以下を候補から除外した。

| 除外パターン | 頻度 | 除外根拠 |
|---|---|---|
| Remove-Item（PowerShell） | [推定: replay=1／gap=3] | rm/rm -rf相当のファイル・ディレクトリ削除コマンド。unrecoverable（削除後の復元不能）に直接該当し、Deny正規対象「rm」カテゴリの機能的同義語のため除外。canonicalのBash(rm -rf:*) deny・pre-bash-destructive.mjs hookの防御思想と矛盾しない除外判断。 |
| GEMINI_API_KEY=""（env代入パターン） | [推定: replay=2／gap=2] | 変数名にAPI_KEYを含む代入パターン。今回の実測値は空文字列だが、シークレット系（Deny正規対象カテゴリ）に該当する変数名パターンをallow化すると将来の非空値代入や別APIキー変数名への拡大解釈を招くリスクがあるため除外。 |
| Get-Content（PowerShell、参考: 必須基準外だが記録） | [推定: replay=2／gap=1] | unrecoverable（削除・破壊）には該当しないためDeny正規対象の必須リストには文字通りは含まれないが、aux/settings-inventory.jsonのproject.deny・global.denyの両方にPowerShell(Get-Content *)が既に明示的に登録済み（任意ファイル読出をReadtoolに集約するvibe-base独自のアーキテクチャ方針）。既存の明示的governance方針と矛盾するため必須基準を超えて参考除外とした。 |
| Add-Type（PowerShell、参考: 必須基準外だが記録） | [推定: replay=1／gap=1] | unrecoverableのDeny正規対象には文字通りは該当しないが、.NETアセンブリの動的ロード＝任意コード実行に相当し、node -e（canonical記載の任意コード実行ゲート）と同格のリスク種別。頻度n=1と極小でありノイズの可能性も高いため、node -e系と同一の「Ask維持」方針を踏襲する参考除外とした。 |

補足観察（範囲外だが記録・除外リストではなく棚卸し対象への申し送り）:
- aux/settings-inventory.json の「その他」分類12件中に PowerShell(Remove-Item *) と PowerShell(Stop-Process *) がワイルドカード付きで既に局所allow済みとして存在することを確認した。これは本ドラフトの対象（新規allow候補の起票）そのものではないが、Remove-Item/Stop-Processは本除外理由表の1行目と同じrm/taskkill相当のunrecoverableコマンドであり、既存許可としてワイルドカード付きで生きている点は別途の棚卸し・見直し対象として記録する（A-21一回性Bash棚卸しと合わせて、既存allowの安全性再点検という別軸の作業が必要であることを示す事実）。
- 同様に「汎用Bash」198件分類内に python -c / python3 -c が既に広範ワイルドカードで許可済みであることを確認した。これはnode -eが明示的にAsk gate化されている（canonical記載）のと対照的に、同格の任意コード実行手段であるpython -cが既に無ask状態にあるという非一貫であり、本ドラフトの新規候補ではないが、node -eのAsk方針を貫徹するなら合わせて見直すべき既存項目として申し送る。

## 集計サマリー

- 観点1（読取専用・低リスク群+要注意群+高リスク群）: A-1〜A-16 = 16件
- 観点2（WebFetchドメイン汎用化）: A-17〜A-19 = 3件
- 観点3（node -e系ask path-resolver wrapper）: A-20 = 1件
- 観点4（一回性Bash棚卸し）: A-21 = 1件
- 候補合計: 21件
- 除外件数: 4件（Remove-Item・GEMINI_API_KEY=必須基準該当2件／Get-Content・Add-Type=参考除外2件）
