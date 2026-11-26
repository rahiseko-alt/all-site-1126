# リスト5 改善すべき仕組み（ガバナンス機構の機能不全・未達・裁量依存）

## 調査諸元
対象期間: 2026-04-23〜2026-07-07（failures-classified.json 全113件 / reports-a+b 86セッション / agg 30日スキャン窓 2026-06-07〜2026-07-07）
定義: 「仕組み」= hook / 検証パネル / plan規律 / memory運用 / checkout工程 / サブエージェント運用のうち、存在するが機能不全・未達・裁量依存のもの

## schema 表

| ID | 項目名 | 頻度or再発数 | 現状コスト | 改善後見込み | メリット | デメリット | 既起票候補フラグ | 出典 |
|---|---|---|---|---|---|---|---|---|
| M-1 | commit前 verify-agent 必須化hook | git巻き込み16件中、pre-git-staging-gate稼働(2026-06-21確認)後も4件再発（2026-07-04×1、2026-07-05×3同日連鎖）[実測: aux/failures-classified.json category=git巻き込み の date] | [推定:根拠=07-05は3件が同日連鎖発覚] 事後（code-reviewer/master指摘）発覚のたび手戻り+再検証セッション発生 | [推定:根拠=BK-1既存文言] commit前にgit diff --stat/ls-files差分を機械照合すれば実行前検出に転換できる見込み（未実測） | 1.事後発覚→事前検出への転換 2.「タグ≠中身」パターンの機械遮断 3.orchestrator裁定コスト削減（既存規律=検証者間矛盾はorchestratorが実機裁定、を代替） | 1.commit速度低下（毎回verify-agent起動のレイテンシ） 2.受入基準の事前定義コスト（plan単位で「何を検証するか」を都度設計する手間） | 既起票（BK-1、status=△一部✅・commit前hook強制は未達） | aux/backlog-catalog.json(BK-1), aux/failures-classified.json |
| M-2 | plan受入条件 Y/N禁止の機械ゲート | ExitPlanMode 拒否62件/受理含む全277件=22.4% [実測: agg/ask-events.json rejections_summary.by_tool.freq.ExitPlanMode=62, agg/tool-freq.json main.totals.freq.ExitPlanMode=277] | [推定:根拠=failures 2026-06-24エントリ]ゴール取り違えでマスター差し戻し3回・Plan Mode再入の実例あり | [推定]受入条件をY/N可否で書けない構造にすれば差し戻し率低下が期待されるが未実測 | 1.差し戻しの機械的先回り検知 2.plan-finalize工程との一体化が可能 3.検証コマンド必須化で机上の空論を排除 | 1.plan作成の初動コスト増（受入条件を検証可能な形に翻訳する負荷） 2.機械可読な受入条件に翻訳できないタスク種別（探索・調査系）で形骸化リスク | 既起票（BK-2、status=△未実装） | aux/backlog-catalog.json(BK-2), agg/ask-events.json, agg/tool-freq.json |
| M-3 | subagent成果物の実在検証ゲート | 本セッション実証1件（保存しましたをorchestratorがls検証して発覚）+ 類似の未検証断定4件 + カテゴリ跨ぎの誤結論/偽PASS 2件（2026-07-04トークン監査ツール誤結論、2026-07-05 git rm --cached偽PASSをcode-reviewerが検出）で計のべ7件 [実測: aux/failures-classified.json category=未検証断定 の件数=4、raw文字列 偽PASS / 誤結論 該当2件] | [推定]マスターへの誤報告からの訂正の再作業（07-04は総額9956ドルから11154ドルへの訂正実績あり） | [推定]成果物パスの実在をls/wc -l/sha256で機械照合してから完了宣言を許可するゲートで、orchestratorの目視ls依存を機構化できる見込み | 1.タグと中身が食い違う代表的な穴（subagent報告）を塞げる 2.verify-agentの管轄をsubagent成果物にも拡張できる 3.マスター誤報告事故（07-04実績）の再発を機械的に抑止 | 1.subagent種別ごとに成果物の定義が異なり汎用ゲート化が難しい 2.ゲート追加でsubagent完了応答のレイテンシ増 | 新規（backlog-catalog.json 16件中にsubagent成果物を対象とする既起票なし。BK-1は対象がgit commitでありsubagentの成果物一般ではないため別ペア） | 本セッション観察（orchestratorのls検証）, aux/failures-classified.json |
| M-4 | output-style.md 新設（回答粒度・省略禁止の恒常注入） | AskUserQuestion 拒否117件/全拒否247件中最多（47.4%）、拒否全体に対する構成比が最大 [実測: agg/ask-events.json rejections_summary.by_tool.freq.AskUserQuestion=117, rejections.length=247] | [推定]口頭規律のみで機械注入なし、遵守が毎ターンの自己規律任せ | [推定]output-style.mdとして恒常注入すれば回答粒度違反由来の拒否比率が下がる可能性（因果は未実測、相関のみ） | 1.毎セッション自己規律に頼らず恒常適用 2.番号付き回答・一言回答の既定化で確認往復を削減 3.要約禁止/省略禁止を明文チェック化できる | 1.output-styleが硬すぎると柔軟な説明が必要な局面で不自然になる 2.既存の口頭規律との二重管理・不整合リスク | 既起票（BK-4=status未着手、BK-5=status未実装） | aux/backlog-catalog.json(BK-4,BK-5), agg/ask-events.json |
| M-5 | 持ち越し滞留の機械検知（同一タスクの複数セッション跨ぎ未解消） | hp-customizer編集エンジン層=24ファイルで言及（2026-06-21〜2026-07-07=window末まで未解消）/ kosespark P0=26ファイル（06-17〜07-03、以降言及消失=要判定）/ spire-lite P0=18ファイル（06-23〜07-03、以降消失=要判定）/ ai-company-ops=13ファイル（07-04〜07-07、window末まで継続） [実測: aux/reports-a.json + aux/reports-b.json 該当文字列出現ファイル数] | [推定]対照としてモノレポ分離は8ファイル（07-01〜07-05）で解消確認（session_themeに根治と記載）。持ち越し自体でなく解消したか黙って消えたかを区別する機構が無いことが問題 | [推定]checkout時に前回remaining_tasksとの差分を機械照合すれば、kosespark/spire-lite型の言及消失=放置を検知できる見込み | 1.持ち越し常連タスクの放置を可視化 2.解消と無言で消えたを区別できる 3.H優先度タスクの滞留日数を機械集計できる | 1.remaining_tasks記法の統一（自由記述から構造化）が必要でcheckout工程の記述コスト増 2.タスク粒度が毎回変わる場合は自動突合が誤マッチする | 新規（HP-1はhp-customizer個別実装着手そのものの起票であり、本項目は持ち越し検知という機構レイヤーで対象と手段のペアが異なる。要判定） | aux/reports-a.json, aux/reports-b.json, aux/backlog-catalog.json(HP-1関連) |
| M-6 | Serena発火規律（CLAUDE.md §5.5）の遵守率低下 | mcp__serena系ツール計136件（initial_instructions30+activate_project23+get_symbols_overview10+find_symbol30+insert_before_symbol1+replace_symbol_body11+replace_content30+get_current_config1）に対し同期間Edit3459件/Read3307件 [実測: agg/tool-freq.json main.totals.freq] | [推定]マスター発話Serena後もコード探索がRead全文読みに戻っている可能性（規律文言は明文化済だが機械強制なし） | [推定]Serena発話検知後のRead/Edit呼出しをhookでSerenaツールへ誘導すれば遵守率が上がる見込み（未実測） | 1.大規模ファイルの全文Read削減でcontext節約 2.規律の口頭依存を機械強制に転換 3.get_symbols_overview起点の探索フローを既定化できる | 1.hook強制がSerena未対応言語やMarkdown等に誤爆するリスク 2.対象判定ロジックの実装コスト | 新規（backlog-catalog.json 16件中に該当なし。SA-7はsubagent改善が対象で本項目とはペアが異なる） | agg/tool-freq.json, CLAUDE.md §5.5 |
| M-7 | verification-before-completion skillの不発火 | 30日スキャン窓（2026-06-07〜07-07）のSkill入力頻度表に記録された22種のskill名の中に本skillが不在=0件 [実測: agg/skill-usage.json main.skill_input_freq.freq に該当キー不在] | [推定]完了主張前の検証コマンド実行を明文したskillが存在するが実際には呼ばれておらず、未検証断定4件・偽PASS 2件（M-3参照）の再発と符合する可能性（相関、因果は未実測） | [推定]checkout/plan-finalizeの固定フローにverification-before-completion呼出しを組み込めば形骸化を解消できる見込み | 1.既存skillの死蔵資産を活用（新規開発コスト不要） 2.M-3（subagent成果物検証）と統合できる 3.完了主張という共通トリガーに明示的に紐付けられる | 1.skill発火は依然AI裁量に依存（呼び出しの機械強制ではない限り再発しうる） 2.他の完了系skillとの重複呼出しでトークン消費増 | 新規（BK-1はcommitゲートのhook化が対象でskill発火実効性という論点とは別ペア。要判定） | agg/skill-usage.json |
| M-8 | hook実行時故障は検知はできても予防できない構造 | secret-write-gate（kosespark, 2026-06-16, ERR_MODULE_NOT_FOUNDで常時無効）・checkin-hook（instagram-auto-ops, 2026-06-17, 毎SessionStart exit1）の2件がcheck-in A-22（事後検知機構）で発覚。A-22由来のWARN（secret-write-gate切り分け）は2026-07-02の2セッションのremaining_tasksに記載後、07-03以降の報告に0件=追跡途絶 [実測: aux/failures-classified.json 該当2件のraw, aux/reports-b.json A-22 grep該当=2件（07-02のみ）] | [推定]検知機構はあるがその後の修正完了を追跡する機構がなく、WARNが記録から消えた後の解消有無が不明 | [推定]A-22 WARNをmemory.md P1等の永続台帳に紐付け、解消確認まで表示し続ける機構にすれば追跡途絶を防げる見込み | 1.検知後の対応済みを実測で確定できる 2.hook故障の再発を早期検知できる 3.WARN一覧が台帳化されmemory.md圧縮時の消失を防げる | 1.台帳運用の追加保守コスト 2.解消確認の自動化が難しいhook（環境依存の一時故障等）で誤警告が残り続けるリスク | 要判定（check-in A-22自体は既存機構として稼働中。backlog-catalog.json 16件にhook故障の解消追跡に該当する項目なし） | aux/failures-classified.json, aux/reports-b.json, .claude/rules/self-verification.md |

## 除外理由
特になし（種として提示された5候補と実測から見つかった3候補の計8件をすべて採用。既起票16件との照合はkeywordsの対象物と手段のペアで実施し、重複と判定したものはM-1/M-2/M-4のみ既起票フラグを付与。M-3/M-5/M-6/M-7/M-8は対象と手段が既起票と一致しないため新規または要判定とした）

---

## 詳細節

### 機構の保守コスト
- M-1（commit前verify-agent必須hook）: 既存verify-agentは orchestratorからの明示呼出のみ で動作する設計（.claude/agents/verify-agent.md記載）。commit前に必須化するとplan外の単発commit（雑務系）でも呼出しが発生し、受入基準を持たないタスクでは検証項目を都度即興定義するコストが発生する。
- M-2（plan受入条件Y/N禁止ゲート）: plan-finalizeスキルの改修が前提。既存のY/N可否記法をすべて洗い出し検証コマンド形式へ移行する一括作業が初期コストとして発生する（backlog BK-2のstatusが未実装のまま2026-07-07時点まで継続している事実がこの移行コストの高さを示唆）。
- M-3/M-7（成果物・完了主張の実在検証）: verify-agentの管轄をsubagent成果物にまで広げる場合、subagent種別（探索系/実装系/検証系）ごとに成果物の定義（ファイルパス、diff件数、ビルドexit code等）を個別設計する必要があり、既存のsubagent-definition-checklist.md（docs/standards/templates/）への追記保守が継続的に発生する。
- M-5（持ち越し滞留の機械検知）: checkoutのremaining_tasks記法を自由記述から構造化（タスクID・優先度・初出日）に変更する必要があり、86セッション分のchecklistフォーマット統一という一時的な移行コストに加え、以後すべてのcheckoutで構造化記述を維持する継続コストが発生する。
- M-6（Serena発火規律）: hook強制にする場合、対象言語判定（TS/JS等はSerena対象、Markdown/JSON/YAMLは対象外）のロジックをproduct横断で保守する必要があり、新規product追加のたびに対象判定を更新するコストが伴う（既存のROOT_ONLY_HOOK_NAMES/SKIP_HOOKS二重管理ドリフト事例＝aux/backlog-catalog.jsonの2026-06-20エントリと同型のリスク）。
- M-8（hook故障の予防）: WARN解消追跡台帳を新設すると、hook故障が実際には一時的な環境要因（Windows cwdロック等）で自然消滅するケースと恒久バグを区別する判定ロジックの保守が必要になる。

### 過剰ゲート化による作業速度低下の二次影響
- M-1からM-3のゲートをすべて併設すると、1回のcommitに対して事前verify-agent（M-1）からplan受入条件の機械照合（M-2、plan起点タスクのみ）からsubagent成果物実在確認（M-3）の3段階チェックが直列で走る構成になり得る。aux/reports-b.json 2026-07-05のセッション群（同日8件のcheckoutファイル）が示すように、1セッション内で複数の小規模commitを重ねる運用スタイルでは、ゲートの直列化が体感速度を大きく落とすリスクがある。
- M-4（output-style.md）は 一言で答える規律と 省略禁止規律（BK-4）が同一ファイル内で相反する要求になり得る（要約禁止は詳細化、一言回答は圧縮）。二つを機械的に両立させるには質問への回答は一言、棚卸し成果物は全文という文脈判定が必要で、判定を誤ると逆効果（冗長化または過剰省略）になる。
- M-5（持ち越し検知）を機械強制にした場合、H優先度タスクが3セッション以上未解消だと毎回警告を出す設計にすると、kosespark P0のようにマスター情報待ちで着手不可という正当な停滞（AI起因ではない）まで警告対象になり、警告の慣れ（オオカミ少年化）を招くリスクがある。実際、reports-b.jsonのremaining_tasksには マスター情報待ち の注記が繰り返し付されており、単純な経過日数だけのゲートは誤検知源になり得る。

## 要マスター判定
- M-5/M-7/M-8の既起票候補フラグ=要判定の3件について、既存バックログ（HP-1・SA-7・BK-1等）との統合か独立起票かの判断
- ゲート直列化（M-1からM-3併設）による速度低下を許容するか、優先順位をつけて段階導入するか

## 機械検証フッター
SELF-CHECK: 数値はaux/failures-classified.json, aux/reports-a.json, aux/reports-b.json, aux/backlog-catalog.json, agg/ask-events.json, agg/tool-freq.json, agg/skill-usage.jsonの実測値または明示の推定タグを付記。平均値は不使用（中央値・実数のみ引用）。既起票16件とはkeywordsの対象物と手段のペアで照合しM-1/M-2/M-4を既起票、M-3/M-6/M-7を新規、M-5/M-8を要判定と判定。
