# ツリー図

> Mission-tree-status: `complete`
>
> 状態: MissionからTaskまでの記載仕様、根拠、親子関係、Acceptance Criteria、Verification Method、Evidenceを追跡できる完成版の正本。
>
> この資料は、GitHub Issue、GitHub Project、Azureリソース、AIモデル配備、有料API呼び出しを作成しない。

## 1. この資料の目的

このツリーは、利用者がAIエージェント開発案件へ根拠を持って応募するために、何を実現し、どの能力を獲得し、何を証拠として提示するかを定義する。

作業手順、時系列、フォルダ構成ではなく、最上位目的から具体作業までの追跡構造を表す。

```text
AIエージェントを作り、改善運用できる
＋
AIエージェントを動かす基盤を作り、基盤運用できる
＋
その成果を証拠付きで説明できる
＝
AIエージェント開発案件に、根拠を持って応募できる
```

## 2. 全体構造

```text
Mission
└─ Goal
   └─ Capability
      └─ Initiative
         └─ Issue
            └─ Task
```

親子関係は次の意味を持つ。

```text
Missionは、複数のGoalによって成立する
Goalは、複数のCapabilityによって達成される
Capabilityは、Initiativeによって獲得・改善される
Initiativeは、Issueによって進められる
Issueは、Taskの完了に加えて、Acceptance Criteriaを検証し、Evidenceを確認することで閉じられる
```

## 3. 用語の根拠とこのリポジトリでの採用

### 3.1 採用原則

この6階層を一括して定義する単一の標準はない。以下の定義は、IIBA、PMI、Microsoft、GitHub、OpenAIの一次資料を根拠にしつつ、このリポジトリで必要な追跡構造をローカル設計として組み合わせたものである。

1. 一次資料に正式定義がある内容は、資料名、版、参照箇所を示す。
2. 製品固有の用語は、その製品の意味として扱い、一般標準へ拡張しない。
3. 標準に存在しない階層、必須欄、粒度、完了規則は`ローカル設計`と明記する。
4. 公式資料間で意味が競合する用語は、採用する意味と採用しない意味を明示する。
5. 未確認または競合未解決の記述には`[曖昧]`を付ける。

### 3.2 正式名称と定義

| 名称 | 日本語での正式名称 | このリポジトリでの定義 | 主な根拠 | 区分 |
|---|---|---|---|---|
| Mission | 存在目的と最終到達状態 | このリポジトリが存在する中核目的、受益者、対象領域、最終到達状態を表す最上位宣言。1つだけ置く。 | BABOK Guide v3 `mission statement` | ローカル拡張 |
| Goal | 成果目標 | Mission成立に必要な、確立・維持すべき状態と、その達成を示す測定可能な結果。 | BABOK Guide v3 `business goal`、`business objective` | ローカル統合 |
| Capability | 実証対象能力 | 利用者が、定めた条件と性能基準の下で、反復・再利用・維持できる能力。 | BABOK Guide v3 `capability`、PMI Lexicon v5.0 `capability` | 個人能力へのローカル拡張 |
| Initiative | 能力差解消施策 | Capabilityの現在状態と必要状態の差を解消する、開始と終了がある具体的なproject、program、action。 | BABOK Guide v3 `initiative` | 公式定義の核＋ローカル拡張 |
| Issue | 独立成果単位 | Initiativeの一部として、GitHubで独立して計画・議論・追跡し、受入判定できる成果単位。 | GitHub Docs `About issues` | ローカル設計 |
| Task | 単一実行単位 | Issueを完了するための具体的な一操作または一確認で、独立した管理を必要としない文書内チェック項目。 | BABOK Guide v3、PMI Lexicon v5.0 `task`、GitHub Docs `tasklists`と`sub-issues` | ローカル粒度規則 |

### 3.3 採用しない意味と用語衝突

| 用語 | 採用しない意味 | 理由 |
|---|---|---|
| Mission | 最終到達状態だけの短文 | BABOKのmission statementは中核目的と価値・Goalを含むため、到達状態だけでは不足する。 |
| Goal | 測定不能な願望だけ、または作業項目 | Goalの状態と、その達成を示すObjective相当の測定項目を分離して持たせる。 |
| Capability | 一回だけ完成させる成果物または一時的な施策 | Capabilityは反復して価値または目標達成へ使える能力である。 |
| Initiative | Capability名に`確立する`を付けただけの言い換え | 現在状態、必要状態、具体的変化、成果物、終了条件を持たなければInitiativeにならない。 |
| Requirement | PMIの「成果物等に存在する必要がある条件・能力」を、出所不明の条件一覧として直接使うこと | BABOKの「ニーズの利用可能な表現」を正とし、種別、発生元、関連先を追跡する。成果物ごとの合否条件はAcceptance Criteriaへ置く。 |
| Issue | PMIの「目標へ影響する現在の状態・状況」、Azure Boards Agileのblocker、Azure Boards Basicのproduct backlog item | 本資料のIssueはGitHubで追跡する独立成果単位であり、問題・リスクまたはAzure Boards固有のbacklog itemの意味では使わない。 |
| Task | Azure Boardsの独立Work Item、GitHubのissue type `Task`、GitHub tasklist blocks | 本資料のTaskは文書内チェック項目。独立管理が必要ならGitHub sub-issueへ昇格する。 |

## 4. 階層に入れない関連要素

Requirement、Deliverable、Acceptance Criteria、Verification Method、Evidence、Definition of Doneは、上下階層ではなく各要素へ関連付ける。

| 名称 | 日本語での正式名称 | 定義 | 区分 |
|---|---|---|---|
| Requirement | 達成要件 | ニーズを利用可能な形で表したもの。business、stakeholder、solution、transitionの種別、発生元、関連先を記録する。成果物の受入条件はAcceptance Criteriaへ分離する。 | BABOKを採用。PMIの関連定義は参考 |
| Deliverable | 合意成果物 | 当事者が提供に合意した、固有かつ検証可能なproduct、result、work product、service。単なる作成ファイルとは区別する。 | BABOK / PMI |
| Acceptance Criteria | 受入条件 | Deliverableまたは成果を受け入れる前に満たす、個別かつ判定可能な条件。 | BABOK / PMI |
| Verification Method | 検証方法 | Requirement、仕様、品質基準への適合を、誰が何でどう判定するか。 | BABOK / PMIに基づくローカル記載欄 |
| Evidence | 検証証拠 | Verificationを実施した事実、条件、入力、結果を後から確認できる記録。 | ローカル定義 |
| Definition of Done | 共通完了基準 | 成果物を利用可能とみなすために満たす条件のチェックリスト。本リポジトリでは、個別Acceptance Criteriaと分離し、同種の成果物へ共通適用する。 | PMIの定義＋ローカル適用規則 |

成果物、条件、方法、証拠を次の順で分離する。

```text
Deliverable: 何を作るか
Acceptance Criteria: 何を満たせば受け入れるか
Verification Method: どう判定するか
Evidence: いつ、どの版・条件で判定し、結果がどうだったか
Definition of Done: 同種の成果物に共通する完了条件
```

## 5. 階層記載仕様

### 5.1 各階層に必ず書く内容

| 階層 | 必須記載欄 | 禁止事項 | 基本的な命名文型 |
|---|---|---|---|
| Mission | 中核目的、受益者、対象領域、最終到達状態、対象外、成立判定 | 実装方法、期限付き作業、成果物一覧だけを書く | `<受益者>が<価値・目的>を実現できる状態になる` |
| Goal | ID、目標状態、Missionへの寄与、対象範囲、指標、目標値、期限または見直し条件、達成証拠 | 手順、技術選定、単発成果物を書く | `<対象領域>で<成果状態>を実現している` |
| Capability | ID、親Goal、能力主体、できること、利用条件、対象、性能基準、反復可能性、維持条件、証明方法 | 一回限りの取り組み、納品物名だけを書く | `<主体>が<条件下で><行為>できる` |
| Initiative | ID、主要Capability、能力差、開始状態、終了状態、対象／対象外、Deliverable、Acceptance Criteria、制約、依存関係、証拠計画 | Capabilityの言い換え、恒久能力、複数条件を1項目へ詰め込むこと | `<具体的変化または成果>を<一つの動詞>する` |
| Issue | ID、親Initiative、解決対象、期待成果、対象／対象外、Requirement、Deliverable、Acceptance Criteria、Verification Method、依存関係、Evidence | 抽象方針、複数の独立成果、操作だけを書く | `<独立成果>を<受入可能な状態>にする` |
| Task | 親Issue、実行動詞、操作対象、入力・前提、完了確認、生成物または作業記録 | 独自の成果目標、複数操作、独立管理が必要な作業を書く | `<対象>を<一つの動詞>する` |

`N/A`を使用する場合は、空欄にせず適用外の理由を書く。Initiativeは1項目につき1文、1条件で書く。複数条件がある場合は、Initiativeを分ける。

### 5.2 時間的性質と完了判定

| 階層 | 時間的性質 | 完了・成立の判定 |
|---|---|---|
| Mission | 長期に維持する存在目的 | 全Goalの達成証拠を確認し、受益者に対する最終到達状態が成立した時。 |
| Goal | 一定期間で達成し、その後維持する成果状態 | 指標が目標値に達し、指定Evidenceで確認できた時。 |
| Capability | 獲得後も反復・再利用・維持する能力 | 異なる条件または複数回の実行で性能基準を満たし、再現可能と確認できた時。 |
| Initiative | 開始・終了がある変化施策 | 全DeliverableがAcceptance Criteriaを満たし、対象Capabilityの能力差が解消した時。 |
| Issue | 一回の独立した成果 | 個別Acceptance CriteriaをVerification Methodで判定し、Evidenceが保存された時。 |
| Task | 一回の操作または確認 | 指定操作が実行され、完了確認または作業記録が残った時。 |

子要素がすべて完了しても、親自身の成立条件、Acceptance Criteria、Evidenceを確認するまで親を完了扱いにしない。

### 5.3 隣接階層の境界判定

| 境界 | 上位に書くもの | 下位に書くもの | 言い換え防止の判定質問 |
|---|---|---|---|
| Mission / Goal | なぜ存在し、誰へ最終的に何をもたらすか | Mission成立に必要な成果状態 | GoalはMission全体の繰り返しではなく、独立した成果領域と測定項目を持つか。 |
| Goal / Capability | 達成・維持すべき結果 | その結果を反復して生む能力 | Capabilityは単発成果ではなく、条件を変えても再利用できるか。 |
| Capability / Initiative | 継続して使える能力 | 能力差を解消する終了可能な変化施策 | Initiativeに開始状態、終了状態、成果物、終了条件があり、Capability名の言い換えでないか。 |
| Initiative / Issue | 複数の成果を束ねる施策 | 一回で独立して受入判定できる成果 | Issueを単独で閉じられ、どのInitiative受入条件へ寄与するか示せるか。 |
| Issue / Task | 受入条件を持つ成果 | 成果を作る一操作または一確認 | Taskは独自の受入条件、担当、議論、依存関係、Evidence管理を必要としないか。 |

### 5.4 IssueとTaskのGitHub保存規則

`Issue -> Task`はGitHubの公式固定階層ではなく、このリポジトリのローカル運用である。

- IssueはGitHub Issueとして保存する候補である。
- Taskは文書内チェック項目として定義し、GitHubへ移す時はIssue本文のMarkdownチェック項目として保存する。
- Taskが独立した受入条件、担当者、期限、状態、議論、依存関係、成果物、Evidence、再実行管理のいずれかを必要とする場合はTaskに置かない。
- 独立管理が必要になったTaskは、親Issueとの関係を保ったGitHub sub-issueへ昇格する。
- GitHub tasklist blocksは廃止済みであり、本資料では採用しない。

この資料は具体的なIssueとTaskを定義するが、GitHub Issue、GitHub Project、Azureリソースは作成しない。

## 6. Mission

### 正式名称

```text
AIエージェント開発案件に、実証済みの開発・運用能力を提示して応募できる状態になる
```

| 必須欄 | 内容 |
|---|---|
| 中核目的 | 利用者がAIエージェントの設計、実装、評価、運用、基盤構築、説明を証拠付きで実演できる状態を作る。 |
| 受益者 | AIエージェント開発案件へ応募する利用者本人。 |
| 対象領域 | AIエージェント本体、実行基盤、開発・運用成果の証拠化と説明。 |
| 最終到達状態 | 利用者が案件要件に対して、実装物、検証結果、運用記録、説明資料を根拠として提示できる。 |
| 対象外 | 根拠のない応募文作成、未検証の経験誇張、有料リソースの無承認作成、GitHub IssueやProjectの自動作成。 |
| 成立判定 | Goal 1、Goal 2、Goal 3の達成証拠が揃い、主張とEvidenceの対応を利用者が説明できる。 |

## 7. Goal

| ID | 目標状態 | Missionへの寄与 | 対象範囲 | 指標 | 目標値 | 期限または見直し条件 | 達成証拠 |
|---|---|---|---|---|---|---|---|
| G1 | AIエージェントを作り、評価し、改善し続けられる。 | エージェント本体の実証済み開発能力を成立させる。 | instructions、tools、guardrails、状態管理、評価、失敗診断、改善履歴。 | 設計項目充足率、評価ケース合格率、改善サイクル完了数。 | 設計項目100%、承認済み評価ケース合格、改善サイクル1回以上。 | 主要ユースケース変更時、モデルまたはtool境界変更時に見直す。 | 設計書、コード、評価ログ、trace、失敗診断記録、改善比較。 |
| G2 | AIエージェントを安全に配置し、安定して動かし続けられる。 | 実行基盤の構築、配置、運用能力を成立させる。 | Local、Azure sandbox、将来のdev/prod分離、Identity、secret、監視、費用、復旧。 | IaC再現率、health check成功、運用点検項目充足率。 | sandbox相当の構成再現、health check成功、運用点検100%。 | Azure仕様、価格、契約、構成変更時に見直す。 | Bicep、設定、deployment結果、health check、監視、費用確認、権限点検記録。 |
| G3 | Goal 1とGoal 2の成果を、資料と実演で正確に説明できる。 | 応募時に主張と証拠の対応を提示できる状態を成立させる。 | Goal 1資料、Goal 2資料、統合説明、応募提示、未証明項目管理。 | 主張と証拠の対応率、未証明項目数、説明レビュー合格。 | 主要主張100%にEvidence対応、未証明項目を明示、説明レビュー合格。 | 応募先要件、成果物、証拠が増減した時に見直す。 | 主張一覧、証拠対応表、統合説明、応募説明文、レビュー記録。 |

## 8. Capability

| ID | 親Goal | 能力主体 | できること | 利用条件 | 対象 | 性能基準 | 反復可能性 | 維持条件 | 証明方法 |
|---|---|---|---|---|---|---|---|---|---|
| G1-C1 | G1 | 利用者 | エージェントの目的、入出力、instructions、tools、停止条件、guardrails、評価基準、trace項目を定義できる。 | ユースケースと制約が与えられている。 | エージェント設計。 | 設計テンプレートの全欄を満たし、レビュー指摘を解消できる。 | 別ユースケースへ同じ設計手順を適用できる。 | 仕様変更時に設計を更新する。 | 設計書、設計レビュー、差分記録。 |
| G1-C2 | G1 | 利用者 | 設計に従ってモデル境界、tool制御、状態管理、エラー処理を実装できる。 | ローカル実行環境と設計書がある。 | エージェント実装。 | 正常系と代表的異常系が実行でき、secretを混入しない。 | 同じ構造で別ユースケースを実装できる。 | 依存更新と評価失敗時に修正する。 | コード、実行ログ、テスト結果。 |
| G1-C3 | G1 | 利用者 | 評価基準と評価手順を作り、結果を測定し、失敗原因を診断できる。 | 評価対象の設計と実装がある。 | 評価ケース、評価実行、失敗診断。 | 正常系、異常系、品質、安全性の観点を含む。 | 変更ごとに同じ評価を再実行できる。 | 新しい失敗を評価ケースへ反映する。 | 評価データ、評価ログ、診断記録。 |
| G1-C4 | G1 | 利用者 | 実行、評価、診断、修正、再評価の循環を継続して回せる。 | 評価結果と変更管理方法がある。 | 改善運用。 | 変更理由、修正内容、再評価結果が追跡できる。 | 1回で終わらず変更ごとに回せる。 | 改善履歴を維持する。 | 改善ログ、修正前後比較、再評価記録。 |
| G2-C1 | G2 | 利用者 | 配置先、環境分離、Identity、secret、network、費用、安全性、復旧方針を設計できる。 | 配置候補と承認境界がある。 | 実行基盤設計。 | sandbox/dev/prodの分離と費用境界を説明できる。 | 新しい配置先にも設計判断を適用できる。 | 仕様・価格変更時に見直す。 | 環境設計書、構成図、費用前提。 |
| G2-C2 | G2 | 利用者 | IaCと設定管理で同じ条件の環境を再現できる。 | Azure利用承認と対象環境がある。 | Bicep、パラメータ、what-if、再構築手順。 | 手作業設定なしで再現可能な差分に収束する。 | 空環境または同等環境へ再実行できる。 | IaCを正とし、Portal手作業を残さない。 | Bicep、what-if、deployment記録。 |
| G2-C3 | G2 | 利用者 | エージェントを各環境へ配置し、動作確認、昇格判断、rollback判断を実行できる。 | 配置先環境と成果物がある。 | デプロイ、health check、昇格、rollback。 | health checkと判断基準に基づき進退を決められる。 | リリースごとに同じ手順で実行できる。 | 手順と判断記録を更新する。 | デプロイ記録、health check、rollback確認。 |
| G2-C4 | G2 | 利用者 | 稼働監視、ログ確認、障害対応、権限、secret、セキュリティ、費用、復旧を管理できる。 | 稼働環境と監視対象がある。 | 実行基盤運用。 | 点検項目を漏れなく確認し、異常時の一次診断ができる。 | 定期点検と変更後点検で再実行できる。 | 監視項目、権限、費用前提を更新する。 | 監視記録、ログ調査、権限点検、費用確認。 |
| G3-C1 | G3 | 利用者 | Goal 1の設計、実装、評価、改善運用を証拠付きで説明できる。 | Goal 1の成果物とEvidenceがある。 | エージェント開発成果説明。 | 主張ごとに証拠を示し、未証明を誇張しない。 | 応募先要件に合わせて再構成できる。 | 新しい成果と失敗記録を追加する。 | Goal 1主張一覧、証拠対応表、説明レビュー。 |
| G3-C2 | G3 | 利用者 | Goal 2の基盤設計、構築、配置、運用を証拠付きで説明できる。 | Goal 2の成果物とEvidenceがある。 | 実行基盤成果説明。 | 構成、権限、費用、安全性、運用判断を説明できる。 | 環境変更ごとに資料を更新できる。 | 最新の構成と証拠を維持する。 | Goal 2主張一覧、構成図、deployment記録。 |
| G3-C3 | G3 | 利用者 | エージェント本体と実行基盤の関係を正確に説明し、案件要件に対応する証拠を提示できる。 | Goal 1、Goal 2の説明資料がある。 | 統合説明、案件要件対応、応募提示。 | 主要要件に対し、該当証拠または未証明を明示できる。 | 応募先ごとに対応表を再作成できる。 | 応募実績とフィードバックを反映する。 | 統合資料、要件対応表、応募説明文。 |

## 9. Initiative

| ID | 主要Capability | 能力差 | 開始状態 | 終了状態 | 対象／対象外 | Deliverable | Acceptance Criteria | 制約 | 依存関係 | 証拠計画 |
|---|---|---|---|---|---|---|---|---|---|---|
| G1-C1-I1 | G1-C1 | 目的が会話的な願望に留まり、実行境界に落ちていない。 | ユースケース候補のみ。 | 目的、受益者、成功状態、停止条件が定義済み。 | 対象: ユースケース目的。対象外: prompt本文。 | ユースケース目的定義。 | 成功状態と対象外が判定可能。 | モデル呼び出しなし。 | Mission、G1-C1。 | 目的定義レビュー記録。 |
| G1-C1-I2 | G1-C1 | 入力と出力の契約が曖昧。 | 入出力の自然文説明のみ。 | 入力源、入力object、出力先、出力schemaが定義済み。 | 対象: 入出力契約。対象外: UI実装。 | 入出力契約書。 | 正常系と異常系の入出力例がある。 | secretを含めない。 | G1-C1-I1。 | 契約レビュー記録。 |
| G1-C1-I3 | G1-C1 | toolsと権限境界が未分離。 | tool候補のみ。 | tool一覧、許可操作、禁止操作、承認境界が定義済み。 | 対象: tool境界。対象外: tool実装。 | tools権限境界表。 | 各toolに入力、出力、失敗時扱いがある。 | 有料操作なし。 | G1-C1-I2。 | 境界レビュー記録。 |
| G1-C1-I4 | G1-C1 | 評価基準とtrace項目が後付け。 | 評価観点が未整理。 | 評価基準、trace項目、合否条件が定義済み。 | 対象: 評価設計。対象外: 評価実行コード。 | 評価基準とtrace設計。 | 主要挙動に評価観点が対応する。 | モデル呼び出しなし。 | G1-C1-I1。 | 評価設計レビュー記録。 |
| G1-C2-I1 | G1-C2 | モデル呼び出し境界がアプリロジックと混在する。 | 境界未定義。 | model adapterの責務と入出力が実装済み。 | 対象: モデル境界。対象外: 有料API実行。 | model adapter実装。 | mockで正常系と失敗系を確認できる。 | 実API呼び出しなし。 | G1-C1-I2。 | テスト結果。 |
| G1-C2-I2 | G1-C2 | tool実行の許可判定が曖昧。 | tool呼び出し案のみ。 | tool dispatcherと承認判定が実装済み。 | 対象: tool制御。対象外: 外部有料tool。 | tool実行制御。 | 禁止操作が実行されない。 | 破壊的操作なし。 | G1-C1-I3。 | 制御テスト結果。 |
| G1-C2-I3 | G1-C2 | 状態管理が会話履歴任せ。 | 状態項目未整理。 | session stateと遷移規則が実装済み。 | 対象: 状態管理。対象外: 永続DB選定。 | 状態管理実装。 | 再実行時に必要状態を復元できる。 | secret保存なし。 | G1-C1-I2。 | 状態遷移テスト結果。 |
| G1-C2-I4 | G1-C2 | エラー時の停止、再試行、報告が未統一。 | 失敗処理が個別対応。 | error policyと例外処理が実装済み。 | 対象: エラー処理。対象外: 監視基盤。 | エラー処理実装。 | 代表的失敗が分類され、利用者へ説明される。 | 外部送信なし。 | G1-C2-I1、G1-C2-I2。 | 異常系テスト結果。 |
| G1-C3-I1 | G1-C3 | 正常系の成功条件が主観的。 | 手動確認のみ。 | 正常系評価ケースが定義済み。 | 対象: 正常系評価。対象外: 異常系。 | 正常系評価データ。 | 主要happy pathを網羅する。 | 実API費用なし。 | G1-C1-I4。 | 評価ケースレビュー記録。 |
| G1-C3-I2 | G1-C3 | 異常系と安全性の評価が不足。 | 失敗例が散在。 | 異常系評価ケースが定義済み。 | 対象: 異常系、安全性。対象外: 本番障害対応。 | 異常系評価データ。 | 権限逸脱、入力不備、tool失敗を含む。 | 危険操作なし。 | G1-C1-I3、G1-C1-I4。 | 異常系ケースレビュー記録。 |
| G1-C3-I3 | G1-C3 | 評価を再実行する手順がない。 | 評価ケースのみ。 | 評価実行手順が実装済み。 | 対象: 評価runner。対象外: 外部評価SaaS。 | 評価実行手順。 | 同じ入力で再実行でき、結果が保存される。 | ローカル実行優先。 | G1-C3-I1、G1-C3-I2。 | 評価実行ログ。 |
| G1-C3-I4 | G1-C3 | 失敗原因が再利用できる形で残らない。 | 失敗メモのみ。 | 失敗原因の記録形式が定義済み。 | 対象: 診断記録。対象外: 自動修正。 | 失敗原因記録テンプレート。 | 入力、期待、実際、原因仮説、対策がある。 | 個人情報を残さない。 | G1-C3-I3。 | 診断記録サンプル。 |
| G1-C4-I1 | G1-C4 | 実行結果が散在する。 | 実行ログが未整理。 | 実行結果記録が作成済み。 | 対象: 実行記録。対象外: 監視ログ集約。 | 実行結果ログ。 | commit、入力、出力、評価対象が追跡できる。 | secret記録禁止。 | G1-C2。 | 実行ログサンプル。 |
| G1-C4-I2 | G1-C4 | 評価結果から修正候補へつながらない。 | 評価結果のみ。 | 修正候補が分類済み。 | 対象: 改善候補。対象外: 実装変更。 | 修正候補一覧。 | 原因、影響、優先度、対応案がある。 | 推測は明示する。 | G1-C3-I4。 | 改善候補レビュー記録。 |
| G1-C4-I3 | G1-C4 | 修正理由と変更内容の対応が弱い。 | 変更差分のみ。 | 修正内容が変更履歴に記録済み。 | 対象: 変更履歴。対象外: リリース管理。 | 変更履歴。 | 修正候補とcommitまたは差分が対応する。 | 無関係変更を混ぜない。 | G1-C4-I2。 | 変更履歴レビュー記録。 |
| G1-C4-I4 | G1-C4 | 再評価前後の比較が残らない。 | 再評価が手動。 | 再評価結果比較が作成済み。 | 対象: 改善前後比較。対象外: 長期監視。 | 再評価比較表。 | 改善、悪化、未解決を判定できる。 | 評価条件を固定する。 | G1-C4-I3、G1-C3-I3。 | 再評価結果。 |
| G2-C1-I1 | G2-C1 | 配置先の違いが混同される。 | Local/Azureなどが未分類。 | 配置先分類が定義済み。 | 対象: 配置先。対象外: 個別IaC。 | 配置先分類表。 | Local、Azure、Vercel等の役割差がある。 | 有料操作なし。 | G2。 | 分類レビュー記録。 |
| G2-C1-I2 | G2-C1 | sandbox/dev/prodの境界が曖昧。 | 環境名のみ。 | 環境分離方針が定義済み。 | 対象: 運用段階。対象外: dev/prod作成。 | 環境分離方針。 | 設定、データ、Identity、secret分離を示す。 | dev/prod未作成。 | G2-C1-I1。 | 方針レビュー記録。 |
| G2-C1-I3 | G2-C1 | Identityとsecret管理が後付け。 | key管理方針なし。 | Identityとsecret管理方針が定義済み。 | 対象: 認証、secret。対象外: secret発行。 | Identity/secret方針。 | Managed Identity/RBAC優先を明記する。 | secretを保存しない。 | G2-C1-I2。 | 方針レビュー記録。 |
| G2-C1-I4 | G2-C1 | 費用と復旧の判断基準が未整理。 | Cost gateのみ。 | 費用と復旧方針が定義済み。 | 対象: 費用、復旧。対象外: 支払契約。 | 費用・復旧方針。 | A/B/C費用判断と復旧目標がある。 | 価格は作業時再調査。 | G2-C1-I2。 | 費用前提レビュー記録。 |
| G2-C2-I1 | G2-C2 | sandbox構成のIaC単位が未整理。 | 手作業とIaCが混在。 | Bicepモジュールが作成済み。 | 対象: Bicep。対象外: Portal手作業。 | Bicepモジュール。 | lintまたはwhat-if確認へ進める。 | Azure作成は承認後。 | G2-C1。 | コードレビュー記録。 |
| G2-C2-I2 | G2-C2 | 環境差がコードに埋め込まれる。 | 固定値あり。 | 環境パラメータが分離済み。 | 対象: パラメータ。対象外: secret値。 | 環境パラメータ。 | sandbox/dev/prod差分を設定で切り替えられる。 | secret記載禁止。 | G2-C2-I1。 | 差分レビュー記録。 |
| G2-C2-I3 | G2-C2 | 作成前の差分確認が属人的。 | what-if手順なし。 | what-if確認手順が作成済み。 | 対象: 事前確認。対象外: 実デプロイ。 | what-if手順。 | 変更対象、費用影響、削除有無を確認できる。 | Azure実行は承認後。 | G2-C2-I1、G2-C2-I2。 | what-if記録様式。 |
| G2-C2-I4 | G2-C2 | 再構築の手順と証拠が不足。 | deployment記録のみ。 | 再構築手順が作成済み。 | 対象: 再現手順。対象外: 本番復旧。 | 再構築手順。 | 空または同等環境で再現条件を説明できる。 | 削除操作は直前承認。 | G2-C2-I3。 | 再構築試験記録様式。 |
| G2-C3-I1 | G2-C3 | デプロイ手順が個人作業に依存する。 | 手順メモのみ。 | デプロイ手順が作成済み。 | 対象: 配置手順。対象外: CI/CD本格化。 | デプロイ手順。 | 入力、コマンド、確認点、失敗時扱いがある。 | 有料操作はCost gate。 | G2-C2。 | デプロイ記録様式。 |
| G2-C3-I2 | G2-C3 | 稼働確認がURL手動確認だけ。 | health API確認のみ。 | health check手順が作成済み。 | 対象: 稼働確認。対象外: SLO運用。 | health check手順。 | 成功条件、失敗時診断、記録形式がある。 | 本番監視なし。 | G2-C3-I1。 | health check記録様式。 |
| G2-C3-I3 | G2-C3 | 昇格判断が気分で決まる。 | 判断基準なし。 | 昇格判断基準が定義済み。 | 対象: sandbox->dev、dev->prod判断。対象外: 実昇格。 | 昇格判断基準。 | テスト、費用、権限、監視、証拠条件がある。 | dev/prod作成なし。 | G2-C3-I2、G2-C4。 | 昇格レビュー記録様式。 |
| G2-C3-I4 | G2-C3 | rollback判断が未定義。 | 失敗時対応のみ。 | rollback判断基準が定義済み。 | 対象: rollback判断。対象外: 自動rollback実装。 | rollback判断基準。 | 戻す条件、戻さない条件、証拠がある。 | 破壊的操作は承認制。 | G2-C3-I1。 | rollbackレビュー記録様式。 |
| G2-C4-I1 | G2-C4 | 監視確認が単発。 | Portal確認のみ。 | 監視確認手順が作成済み。 | 対象: 監視。対象外: 24時間運用。 | 監視確認手順。 | 正常、警告、異常の確認点がある。 | 課金変更なし。 | G2-C3-I2。 | 監視確認記録様式。 |
| G2-C4-I2 | G2-C4 | ログ調査の入口が未整理。 | ログ閲覧メモのみ。 | ログ調査手順が作成済み。 | 対象: ログ調査。対象外: SIEM導入。 | ログ調査手順。 | correlation、時刻、失敗種別を追える。 | 個人情報に注意。 | G2-C4-I1。 | ログ調査記録様式。 |
| G2-C4-I3 | G2-C4 | 権限点検が初回設定任せ。 | 権限一覧なし。 | 権限点検手順が作成済み。 | 対象: RBAC、Identity。対象外: 組織監査。 | 権限点検手順。 | 付与主体、範囲、理由、不要権限を確認できる。 | secret出力禁止。 | G2-C1-I3。 | 権限点検記録様式。 |
| G2-C4-I4 | G2-C4 | 費用確認が作業後任せ。 | Cost gateのみ。 | 費用確認手順が作成済み。 | 対象: 費用確認。対象外: 課金停止保証。 | 費用確認手順。 | 現在費用、予測、承認範囲との差を確認できる。 | 最新価格を再調査。 | G2-C1-I4。 | 費用確認記録様式。 |
| G3-C1-I1 | G3-C1 | Goal 1の主張が散在する。 | 成果物一覧のみ。 | Goal 1主張一覧が作成済み。 | 対象: 開発能力主張。対象外: 応募文。 | Goal 1主張一覧。 | 主張がCapabilityとEvidence候補へ対応する。 | 誇張禁止。 | G1。 | 主張レビュー記録。 |
| G3-C1-I2 | G3-C1 | Goal 1の証拠対応が弱い。 | 証拠リンクなし。 | Goal 1証拠対応表が作成済み。 | 対象: 証拠対応。対象外: 証拠捏造。 | Goal 1証拠対応表。 | 各主張にEvidenceまたは未証明がある。 | 未証明は明示。 | G3-C1-I1、G1 Evidence。 | 対応表レビュー記録。 |
| G3-C1-I3 | G3-C1 | 設計説明がprompt説明へ寄る。 | 設計メモのみ。 | エージェント設計説明が作成済み。 | 対象: 設計説明。対象外: マーケ文。 | 設計説明資料。 | 目的、入出力、tools、guardrailsを説明できる。 | 根拠なし表現禁止。 | G1-C1。 | 説明レビュー記録。 |
| G3-C1-I4 | G3-C1 | 評価改善の説明が結果だけになる。 | 評価ログのみ。 | 評価改善説明が作成済み。 | 対象: 評価、診断、改善。対象外: 成果誇張。 | 評価改善説明。 | 失敗、原因、修正、再評価を説明できる。 | 未解決を隠さない。 | G1-C3、G1-C4。 | 説明レビュー記録。 |
| G3-C2-I1 | G3-C2 | Goal 2の主張が散在する。 | 構成メモのみ。 | Goal 2主張一覧が作成済み。 | 対象: 基盤能力主張。対象外: Azure資格主張。 | Goal 2主張一覧。 | 主張がCapabilityとEvidence候補へ対応する。 | 誇張禁止。 | G2。 | 主張レビュー記録。 |
| G3-C2-I2 | G3-C2 | Goal 2の証拠対応が弱い。 | deployment記録のみ。 | Goal 2証拠対応表が作成済み。 | 対象: 証拠対応。対象外: 証拠捏造。 | Goal 2証拠対応表。 | 各主張にEvidenceまたは未証明がある。 | 未証明は明示。 | G3-C2-I1、G2 Evidence。 | 対応表レビュー記録。 |
| G3-C2-I3 | G3-C2 | 基盤構成の説明が断片的。 | リソース一覧のみ。 | 基盤構成説明が作成済み。 | 対象: 構成、分離、Identity、secret、監視。対象外: 未作成prodの実績化。 | 基盤構成説明。 | 図または表で構成と判断理由を説明できる。 | 最新仕様確認。 | G2-C1、G2-C2。 | 説明レビュー記録。 |
| G3-C2-I4 | G3-C2 | 運用判断の説明が残らない。 | 作業ログのみ。 | 運用判断説明が作成済み。 | 対象: 監視、ログ、権限、費用、復旧判断。対象外: SLA保証。 | 運用判断説明。 | 判断条件、結果、次対応を説明できる。 | 予算アラートを停止機能と扱わない。 | G2-C3、G2-C4。 | 説明レビュー記録。 |
| G3-C3-I1 | G3-C3 | 本体と基盤の関係が説明しづらい。 | 個別資料のみ。 | 統合構成説明が作成済み。 | 対象: 本体と基盤の関係。対象外: 新規実装。 | 統合構成説明。 | データ、制御、権限、証拠の流れを説明できる。 | 図は証拠と対応。 | G3-C1、G3-C2。 | 統合説明レビュー記録。 |
| G3-C3-I2 | G3-C3 | 案件要件との対応が都度作業。 | 応募先メモのみ。 | 案件要件との対応表が作成済み。 | 対象: 要件対応。対象外: 応募送信。 | 案件要件対応表。 | 要件ごとに該当証拠または未証明がある。 | 未証明を隠さない。 | G3-C3-I1。 | 対応表レビュー記録。 |
| G3-C3-I3 | G3-C3 | 未証明項目が曖昧。 | 課題メモのみ。 | 未証明項目一覧が作成済み。 | 対象: 未証明。対象外: 言い訳化。 | 未証明項目一覧。 | 不足証拠、影響、次アクションがある。 | 不足を経験済みと書かない。 | G3-C3-I2。 | 未証明レビュー記録。 |
| G3-C3-I4 | G3-C3 | 応募説明が証拠とずれる。 | 汎用文章のみ。 | 応募用説明文が作成済み。 | 対象: 応募説明。対象外: 応募送信。 | 応募用説明文。 | 主張が証拠対応表と矛盾しない。 | 誇張禁止。 | G3-C3-I2、G3-C3-I3。 | 応募説明レビュー記録。 |

## 10. Issue

Issueは各Initiativeにつき1件定義する。すべてGitHub Issue候補だが、この資料では作成しない。

| ID | 親Initiative | 解決対象 | 期待成果 | 対象／対象外 | Requirement | Deliverable | Acceptance Criteria | Verification Method | 依存関係 | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| G1-C1-I1-ISS1 | G1-C1-I1 | ユースケース目的の曖昧さ | 目的定義が受入可能になる | 対象: 目的、受益者、成功状態。対象外: prompt | 目的が行動、停止条件、対象外を持つ | 目的定義 | 成功と失敗を第三者が判定できる | レビュー表で全欄確認 | Mission | 目的レビュー記録 |
| G1-C1-I2-ISS1 | G1-C1-I2 | 入出力契約の欠落 | 契約書が受入可能になる | 対象: 入力源、object、出力先、schema。対象外: UI | 正常系と異常系を表せる | 入出力契約 | 代表例が契約に適合する | サンプル入出力照合 | G1-C1-I1 | 契約レビュー記録 |
| G1-C1-I3-ISS1 | G1-C1-I3 | tool権限境界の未定義 | tool境界表が受入可能になる | 対象: 許可、禁止、承認。対象外: 実装 | 各toolに権限と失敗時扱いがある | tool境界表 | 禁止操作と承認操作が分離される | 境界表レビュー | G1-C1-I2 | 境界レビュー記録 |
| G1-C1-I4-ISS1 | G1-C1-I4 | 評価とtraceの後付け | 評価設計が受入可能になる | 対象: 評価基準、trace。対象外: runner | 主要挙動に評価基準がある | 評価設計 | 基準、trace、合否が対応する | 観点対応表レビュー | G1-C1-I1 | 評価設計レビュー |
| G1-C2-I1-ISS1 | G1-C2-I1 | モデル境界の混在 | adapter実装が受入可能になる | 対象: adapter。対象外: 実API | mockで振る舞いを検証できる | model adapter | 正常、失敗、timeoutを扱う | ローカルテスト | G1-C1-I2 | テスト結果 |
| G1-C2-I2-ISS1 | G1-C2-I2 | tool実行制御の曖昧さ | dispatcherが受入可能になる | 対象: dispatcher、承認。対象外: 有料tool | 許可判定を経由する | tool dispatcher | 禁止操作が実行されない | 制御テスト | G1-C1-I3 | 制御テスト結果 |
| G1-C2-I3-ISS1 | G1-C2-I3 | 状態管理の属人化 | state管理が受入可能になる | 対象: session state。対象外: 永続DB | 必要状態を復元できる | state実装 | 状態遷移が再現できる | 状態遷移テスト | G1-C1-I2 | 状態テスト結果 |
| G1-C2-I4-ISS1 | G1-C2-I4 | エラー処理のばらつき | error policyが受入可能になる | 対象: 例外分類、報告。対象外: 監視 | 代表失敗を分類する | error policy実装 | 利用者へ原因と次手が示される | 異常系テスト | G1-C2-I1 | 異常系テスト結果 |
| G1-C3-I1-ISS1 | G1-C3-I1 | 正常系成功条件の主観性 | 正常系評価が受入可能になる | 対象: happy path。対象外: 異常系 | 主要成功経路を網羅する | 正常系評価データ | 各ケースに期待結果がある | ケースレビュー | G1-C1-I4 | ケースレビュー記録 |
| G1-C3-I2-ISS1 | G1-C3-I2 | 異常系評価の不足 | 異常系評価が受入可能になる | 対象: 入力不備、権限、tool失敗。対象外: 本番障害 | 安全性と失敗を測れる | 異常系評価データ | 代表リスクを含む | ケースレビュー | G1-C1-I3 | 異常系レビュー記録 |
| G1-C3-I3-ISS1 | G1-C3-I3 | 評価再実行性の不足 | 評価手順が受入可能になる | 対象: runner手順。対象外: 外部SaaS | 同じ条件で再実行できる | 評価runner手順 | 結果が保存される | ローカル評価実行 | G1-C3-I1、G1-C3-I2 | 評価実行ログ |
| G1-C3-I4-ISS1 | G1-C3-I4 | 失敗診断記録の不足 | 診断形式が受入可能になる | 対象: 失敗記録。対象外: 自動修正 | 原因仮説と対策を残す | 診断テンプレート | 入力、期待、実際、原因、対策がある | サンプル記録レビュー | G1-C3-I3 | 診断サンプル |
| G1-C4-I1-ISS1 | G1-C4-I1 | 実行結果の散在 | 実行ログが受入可能になる | 対象: 実行記録。対象外: 監視集約 | commitと条件を記録する | 実行ログ | 入力、出力、評価対象が追跡できる | ログサンプルレビュー | G1-C2 | 実行ログサンプル |
| G1-C4-I2-ISS1 | G1-C4-I2 | 改善候補化の不足 | 修正候補が受入可能になる | 対象: 改善候補。対象外: 実装修正 | 原因から候補へつなげる | 修正候補一覧 | 優先度と影響がある | 候補レビュー | G1-C3-I4 | 改善候補レビュー |
| G1-C4-I3-ISS1 | G1-C4-I3 | 変更履歴の不足 | 変更履歴が受入可能になる | 対象: 修正理由、差分。対象外: release | 候補と変更が対応する | 変更履歴 | 修正理由と結果が追跡できる | 差分照合 | G1-C4-I2 | 変更履歴レビュー |
| G1-C4-I4-ISS1 | G1-C4-I4 | 再評価比較の不足 | 比較表が受入可能になる | 対象: 改善前後。対象外: 長期監視 | 同じ条件で比較する | 再評価比較表 | 改善、悪化、未解決が判定される | 結果比較レビュー | G1-C4-I3 | 再評価結果 |
| G2-C1-I1-ISS1 | G2-C1-I1 | 配置先混同 | 配置先分類が受入可能になる | 対象: Local/Azure等。対象外: IaC | 配置先ごとの役割を定義 | 配置先分類表 | 配置先差が説明できる | 分類レビュー | G2 | 分類レビュー記録 |
| G2-C1-I2-ISS1 | G2-C1-I2 | 環境分離の曖昧さ | 環境方針が受入可能になる | 対象: sandbox/dev/prod。対象外: 作成 | 環境ごとに設定等を分離 | 環境分離方針 | データ、Identity、secret分離がある | 方針レビュー | G2-C1-I1 | 方針レビュー記録 |
| G2-C1-I3-ISS1 | G2-C1-I3 | Identity/secret後付け | 管理方針が受入可能になる | 対象: RBAC、secret。対象外: 発行 | Managed Identity優先 | Identity/secret方針 | 長期secretをGitへ置かない | 方針レビュー | G2-C1-I2 | 方針レビュー記録 |
| G2-C1-I4-ISS1 | G2-C1-I4 | 費用/復旧未整理 | 費用復旧方針が受入可能になる | 対象: Cost gate、復旧。対象外: 契約 | A/B/Cと復旧判断を持つ | 費用・復旧方針 | 承認境界が明確 | 方針レビュー | G2-C1-I2 | 費用前提記録 |
| G2-C2-I1-ISS1 | G2-C2-I1 | IaC単位の不足 | Bicep単位が受入可能になる | 対象: Bicep。対象外: Portal | IaCを正にする | Bicepモジュール | レビュー可能な構成単位 | コードレビュー | G2-C1 | レビュー記録 |
| G2-C2-I2-ISS1 | G2-C2-I2 | 固定値混入 | パラメータ分離が受入可能になる | 対象: env params。対象外: secret値 | 環境差を設定化する | 環境パラメータ | secretを含まない | 差分レビュー | G2-C2-I1 | 差分レビュー記録 |
| G2-C2-I3-ISS1 | G2-C2-I3 | what-if手順欠落 | what-if手順が受入可能になる | 対象: 事前確認。対象外: deploy | 作成前に差分を見る | what-if手順 | 削除、費用、変更範囲を確認できる | 手順レビュー | G2-C2-I2 | what-if記録様式 |
| G2-C2-I4-ISS1 | G2-C2-I4 | 再構築手順不足 | 再構築手順が受入可能になる | 対象: 再現。対象外: 本番復旧 | 再現条件を定義 | 再構築手順 | 空または同等環境で説明できる | 手順レビュー | G2-C2-I3 | 再構築記録様式 |
| G2-C3-I1-ISS1 | G2-C3-I1 | デプロイ手順属人化 | デプロイ手順が受入可能になる | 対象: 配置。対象外: CI/CD本格化 | 入力、確認、失敗時扱いがある | デプロイ手順 | 第三者が追える | 手順レビュー | G2-C2 | デプロイ記録様式 |
| G2-C3-I2-ISS1 | G2-C3-I2 | health確認不足 | health手順が受入可能になる | 対象: 稼働確認。対象外: SLO | 成功条件を持つ | health check手順 | 成功/失敗の判断がある | 手順レビュー | G2-C3-I1 | health記録様式 |
| G2-C3-I3-ISS1 | G2-C3-I3 | 昇格基準欠落 | 昇格基準が受入可能になる | 対象: 昇格判断。対象外: 実昇格 | 昇格条件を定義 | 昇格判断基準 | テスト、費用、監視条件がある | 基準レビュー | G2-C3-I2 | 昇格レビュー様式 |
| G2-C3-I4-ISS1 | G2-C3-I4 | rollback基準欠落 | rollback基準が受入可能になる | 対象: rollback判断。対象外: 自動化 | 戻す条件を定義 | rollback判断基準 | 戻す/戻さない条件がある | 基準レビュー | G2-C3-I1 | rollbackレビュー様式 |
| G2-C4-I1-ISS1 | G2-C4-I1 | 監視確認の単発化 | 監視手順が受入可能になる | 対象: 監視確認。対象外: 24h運用 | 確認項目を持つ | 監視確認手順 | 正常/警告/異常を区別する | 手順レビュー | G2-C3-I2 | 監視記録様式 |
| G2-C4-I2-ISS1 | G2-C4-I2 | ログ調査入口不足 | ログ手順が受入可能になる | 対象: ログ調査。対象外: SIEM | correlationを追える | ログ調査手順 | 時刻、種別、原因仮説がある | 手順レビュー | G2-C4-I1 | ログ記録様式 |
| G2-C4-I3-ISS1 | G2-C4-I3 | 権限点検不足 | 権限手順が受入可能になる | 対象: RBAC。対象外: 組織監査 | 権限と理由を点検 | 権限点検手順 | 不要権限を検出できる | 手順レビュー | G2-C1-I3 | 権限記録様式 |
| G2-C4-I4-ISS1 | G2-C4-I4 | 費用確認不足 | 費用手順が受入可能になる | 対象: 費用確認。対象外: 課金停止保証 | 承認範囲と実績を比較 | 費用確認手順 | 現在、予測、差分がある | 手順レビュー | G2-C1-I4 | 費用記録様式 |
| G3-C1-I1-ISS1 | G3-C1-I1 | Goal 1主張の散在 | 主張一覧が受入可能になる | 対象: Goal 1主張。対象外: 応募文 | Capabilityに対応する主張を作る | Goal 1主張一覧 | 証拠候補または未証明がある | 主張レビュー | G1 | 主張レビュー記録 |
| G3-C1-I2-ISS1 | G3-C1-I2 | Goal 1証拠対応不足 | 対応表が受入可能になる | 対象: Goal 1証拠。対象外: 捏造 | 各主張にEvidenceを対応 | Goal 1証拠対応表 | 未証明が明示される | 対応レビュー | G3-C1-I1 | 対応レビュー記録 |
| G3-C1-I3-ISS1 | G3-C1-I3 | 設計説明不足 | 設計説明が受入可能になる | 対象: 設計説明。対象外: 広告文 | 設計要素を説明する | 設計説明資料 | 目的、入出力、tools等を説明できる | 説明レビュー | G1-C1 | 説明レビュー記録 |
| G3-C1-I4-ISS1 | G3-C1-I4 | 評価改善説明不足 | 評価改善説明が受入可能になる | 対象: 評価、改善。対象外: 誇張 | 失敗から再評価まで説明 | 評価改善説明 | 原因、修正、比較がある | 説明レビュー | G1-C3、G1-C4 | 説明レビュー記録 |
| G3-C2-I1-ISS1 | G3-C2-I1 | Goal 2主張の散在 | 主張一覧が受入可能になる | 対象: Goal 2主張。対象外: 資格主張 | Capabilityに対応する主張を作る | Goal 2主張一覧 | 証拠候補または未証明がある | 主張レビュー | G2 | 主張レビュー記録 |
| G3-C2-I2-ISS1 | G3-C2-I2 | Goal 2証拠対応不足 | 対応表が受入可能になる | 対象: Goal 2証拠。対象外: 捏造 | 各主張にEvidenceを対応 | Goal 2証拠対応表 | 未証明が明示される | 対応レビュー | G3-C2-I1 | 対応レビュー記録 |
| G3-C2-I3-ISS1 | G3-C2-I3 | 基盤構成説明不足 | 構成説明が受入可能になる | 対象: 構成、分離、監視。対象外: 未作成prod実績 | 構成と判断理由を説明 | 基盤構成説明 | 図表とEvidenceが対応する | 説明レビュー | G2-C1、G2-C2 | 説明レビュー記録 |
| G3-C2-I4-ISS1 | G3-C2-I4 | 運用判断説明不足 | 運用説明が受入可能になる | 対象: 運用判断。対象外: SLA保証 | 判断条件と結果を説明 | 運用判断説明 | 監視、権限、費用が含まれる | 説明レビュー | G2-C3、G2-C4 | 説明レビュー記録 |
| G3-C3-I1-ISS1 | G3-C3-I1 | 統合関係説明不足 | 統合説明が受入可能になる | 対象: 本体と基盤。対象外: 新規実装 | 制御、データ、権限の流れを説明 | 統合構成説明 | 関係と証拠を追跡できる | 統合レビュー | G3-C1、G3-C2 | 統合レビュー記録 |
| G3-C3-I2-ISS1 | G3-C3-I2 | 要件対応不足 | 要件対応表が受入可能になる | 対象: 案件要件。対象外: 応募送信 | 要件に証拠を対応 | 案件要件対応表 | 該当証拠または未証明がある | 対応レビュー | G3-C3-I1 | 対応レビュー記録 |
| G3-C3-I3-ISS1 | G3-C3-I3 | 未証明項目の曖昧さ | 未証明一覧が受入可能になる | 対象: 未証明。対象外: 言い訳 | 不足証拠と次手を示す | 未証明項目一覧 | 不足、影響、次アクションがある | 一覧レビュー | G3-C3-I2 | 未証明レビュー記録 |
| G3-C3-I4-ISS1 | G3-C3-I4 | 応募説明と証拠のずれ | 応募説明が受入可能になる | 対象: 応募説明文。対象外: 応募送信 | 主張が証拠と矛盾しない | 応募用説明文 | 証拠対応表と整合する | 説明レビュー | G3-C3-I2、G3-C3-I3 | 応募説明レビュー |

## 11. Task

Taskは全Issueへ2件ずつ展開する。合計Task数は`44 Issue * 2 = 88`である。

### 11.1 Task共通テンプレート

| Task種別 | 親Issue | 実行動詞 | 操作対象 | 入力・前提 | 完了確認 | 生成物または作業記録 |
|---|---|---|---|---|---|---|
| `<IssueID>-T1` | 対象Issue | 作成する | 11.2のT1対象 | 親IssueのRequirement、Deliverable、Acceptance Criteria | Deliverableの初版が正本または指定成果物に存在する | 作成差分、成果物パス、作業メモ |
| `<IssueID>-T2` | 対象Issue | 検証記録する | 11.2のT2対象 | `<IssueID>-T1`の成果物、親IssueのVerification Method | Acceptance Criteriaの合否とEvidence保存先が記録される | 検証結果、Evidence参照、未解決事項 |

### 11.2 Issue別Task対象表

| Issue ID | T1対象 | T2対象 |
|---|---|---|
| G1-C1-I1-ISS1 | ユースケース目的定義 | 目的レビュー結果 |
| G1-C1-I2-ISS1 | 入出力契約 | サンプル入出力照合結果 |
| G1-C1-I3-ISS1 | tool権限境界表 | 境界レビュー結果 |
| G1-C1-I4-ISS1 | 評価基準とtrace設計 | 観点対応レビュー結果 |
| G1-C2-I1-ISS1 | model adapter実装 | mockテスト結果 |
| G1-C2-I2-ISS1 | tool dispatcher実装 | 制御テスト結果 |
| G1-C2-I3-ISS1 | session state実装 | 状態遷移テスト結果 |
| G1-C2-I4-ISS1 | error policy実装 | 異常系テスト結果 |
| G1-C3-I1-ISS1 | 正常系評価データ | 正常系ケースレビュー結果 |
| G1-C3-I2-ISS1 | 異常系評価データ | 異常系ケースレビュー結果 |
| G1-C3-I3-ISS1 | 評価runner手順 | 評価実行ログ |
| G1-C3-I4-ISS1 | 失敗原因記録テンプレート | 診断サンプルレビュー結果 |
| G1-C4-I1-ISS1 | 実行結果ログ | ログサンプルレビュー結果 |
| G1-C4-I2-ISS1 | 修正候補一覧 | 改善候補レビュー結果 |
| G1-C4-I3-ISS1 | 変更履歴 | 変更履歴照合結果 |
| G1-C4-I4-ISS1 | 再評価比較表 | 再評価比較レビュー結果 |
| G2-C1-I1-ISS1 | 配置先分類表 | 分類レビュー結果 |
| G2-C1-I2-ISS1 | 環境分離方針 | 方針レビュー結果 |
| G2-C1-I3-ISS1 | Identity/secret方針 | 方針レビュー結果 |
| G2-C1-I4-ISS1 | 費用・復旧方針 | 費用前提レビュー結果 |
| G2-C2-I1-ISS1 | Bicepモジュール | コードレビュー結果 |
| G2-C2-I2-ISS1 | 環境パラメータ | 差分レビュー結果 |
| G2-C2-I3-ISS1 | what-if手順 | what-if記録様式レビュー結果 |
| G2-C2-I4-ISS1 | 再構築手順 | 再構築記録様式レビュー結果 |
| G2-C3-I1-ISS1 | デプロイ手順 | デプロイ記録様式レビュー結果 |
| G2-C3-I2-ISS1 | health check手順 | health記録様式レビュー結果 |
| G2-C3-I3-ISS1 | 昇格判断基準 | 昇格レビュー様式確認結果 |
| G2-C3-I4-ISS1 | rollback判断基準 | rollbackレビュー様式確認結果 |
| G2-C4-I1-ISS1 | 監視確認手順 | 監視記録様式レビュー結果 |
| G2-C4-I2-ISS1 | ログ調査手順 | ログ記録様式レビュー結果 |
| G2-C4-I3-ISS1 | 権限点検手順 | 権限記録様式レビュー結果 |
| G2-C4-I4-ISS1 | 費用確認手順 | 費用記録様式レビュー結果 |
| G3-C1-I1-ISS1 | Goal 1主張一覧 | 主張レビュー結果 |
| G3-C1-I2-ISS1 | Goal 1証拠対応表 | 対応レビュー結果 |
| G3-C1-I3-ISS1 | エージェント設計説明 | 説明レビュー結果 |
| G3-C1-I4-ISS1 | 評価改善説明 | 説明レビュー結果 |
| G3-C2-I1-ISS1 | Goal 2主張一覧 | 主張レビュー結果 |
| G3-C2-I2-ISS1 | Goal 2証拠対応表 | 対応レビュー結果 |
| G3-C2-I3-ISS1 | 基盤構成説明 | 説明レビュー結果 |
| G3-C2-I4-ISS1 | 運用判断説明 | 説明レビュー結果 |
| G3-C3-I1-ISS1 | 統合構成説明 | 統合レビュー結果 |
| G3-C3-I2-ISS1 | 案件要件対応表 | 対応レビュー結果 |
| G3-C3-I3-ISS1 | 未証明項目一覧 | 未証明レビュー結果 |
| G3-C3-I4-ISS1 | 応募用説明文 | 応募説明レビュー結果 |

## 12. Goal別のRequirement・成果物・Evidence

| Goal | 主なRequirement | 主な成果物 | 主なEvidence |
|---|---|---|---|
| G1 | 設計、実装、評価、診断、継続改善を実演できる。 | 設計書、コード、評価の仕組み、改善履歴。 | テスト結果、trace、失敗事例、修正前後の比較。 |
| G2 | 配置先の差分とSandbox / Dev / Prodを安全に管理できる。 | 環境設計書、構築コード、配置設定、運用手順。 | deployment結果、health check、監視記録、rollback確認。 |
| G3 | 説明上の主張がGoal 1・Goal 2の証拠と一致する。 | Goal 1詳細資料、Goal 2詳細資料、統合全体資料。 | 主張と証拠の対応表、説明記録、未証明項目一覧。 |

## 13. 現在の確定範囲と次の段階

### 確定範囲

- Mission 1件、Goal 3件、Capability 11件、Initiative 44件、Issue 44件、Task 88件。
- Mission、Goal、Capability、Initiative、Issue、Taskの用語根拠、採用する意味、採用しない意味。
- 各階層の必須記載欄、禁止事項、命名文型、時間的性質、完了判定。
- Requirement、Deliverable、Acceptance Criteria、Verification Method、Evidence、Definition of Doneを階層外の関連要素として扱うこと。
- IssueをGitHub Issue候補、Taskを文書内チェック項目として扱い、独立管理が必要なTaskをsub-issueへ昇格すること。
- Goal 1とGoal 2で扱う運用の違い。
- 全Initiativeに主要Capability、能力差、開始状態、終了状態、対象／対象外、Deliverable、Acceptance Criteria、制約、依存関係、証拠計画を定義したこと。
- 全IssueにRequirement、Deliverable、Acceptance Criteria、Verification Method、Evidenceを定義したこと。

### 次の段階

次の段階は、進捗記録に従って次の未完了Issueを選び、ローカル実装、検証、Evidence保存を進めることである。GitHub Issue作成、GitHub Project作成、Azure操作、モデル呼び出し、有料API呼び出しは、別途承認後に行う。

### 13.1 進捗記録

この表は、セッション開始時に現在地を短時間で把握するための最小帳票である。

- `完了ID`: 完了したIssue ID。
- `進捗量`: Missionツリー上の完了量。IssueはTask 2件を含む。
- `計画工数対象`: Section 17.2のCapability別工数のうち、この完了IDが属する範囲。
- `実作業時間`: コミット時刻から復元した概算。人間の待ち時間、確認会話、将来のレビュー往復は含めない。
- `Evidence`: 受入判定またはテスト結果を確認できる記録。

| 日時 | commit | 完了ID | 進捗量 | 計画工数対象 | 実作業時間 | 成果物 | Evidence | 検証 |
|---|---|---|---|---:|---:|---|---|---|
| 2026-07-18 18:12 | `154160d` | `G1-C1-I1-ISS1` | 1 Issue / 2 Task相当 | G1-C1 16h内 | 約4分 | `docs/learning/agent-purpose/use-case-purpose.md` | `docs/learning/agent-purpose/use-case-purpose-review.md` | 目的、受益者、行動、停止条件、対象外、成功/失敗判定レビュー |
| 2026-07-18 18:18 | `e453b32` | `G1-C1-I2-ISS1` | 1 Issue / 2 Task相当 | G1-C1 16h内 | 約6分 | `docs/learning/agent-purpose/input-output-contract.md` | `docs/learning/agent-purpose/input-output-contract-review.md` | 入力源、入力object、出力先、出力schema、正常系/異常系サンプルレビュー |
| 2026-07-18 18:20 | `a282ae7` | `G1-C1-I3-ISS1` | 1 Issue / 2 Task相当 | G1-C1 16h内 | 約2分 | `docs/learning/agent-purpose/tool-boundary.md` | `docs/learning/agent-purpose/tool-boundary-review.md` | tool一覧、許可操作、禁止操作、承認境界、入力、出力、失敗時扱いレビュー |
| 2026-07-18 18:23 | `f372319` | `G1-C1-I4-ISS1` | 1 Issue / 2 Task相当 | G1-C1 16h内 | 約2分 | `docs/learning/agent-purpose/evaluation-trace-design.md` | `docs/learning/agent-purpose/evaluation-trace-design-review.md` | 主要挙動、評価基準、trace項目、合否条件の対応レビュー |
| 2026-07-18 18:26 | `94c838f` | `G1-C2-I1-ISS1` | 1 Issue / 2 Task相当 | G1-C2 32h内 | 約3分 | `src/agent_core/model_adapter.py`, `tests/test_model_adapter.py` | `docs/learning/agent-purpose/model-adapter-review.md` | mock正常系、provider失敗、timeout、空prompt拒否、全体unittest 6件成功 |
| 2026-07-18 18:28 | `6548af6` | `G1-C2-I2-ISS1` | 1 Issue / 2 Task相当 | G1-C2 32h内 | 約3分 | `src/agent_core/tool_dispatcher.py`, `tests/test_tool_dispatcher.py` | `docs/learning/agent-purpose/tool-dispatcher-review.md` | 許可操作、禁止操作、承認待ち操作、未知tool、全体unittest 10件成功 |
| 2026-07-18 18:31 | `3735837` | `G1-C2-I3-ISS1` | 1 Issue / 2 Task相当 | G1-C2 32h内 | 約2分 | `src/agent_core/session_state.py`, `tests/test_session_state.py` | `docs/learning/agent-purpose/session-state-review.md` | 有効遷移、無効遷移、blocked状態、保存/復元、未保存state、全体unittest 15件成功 |
| 2026-07-18 18:33 | `3df62b1` | `G1-C2-I4-ISS1` | 1 Issue / 2 Task相当 | G1-C2 32h内 | 約2分 | `src/agent_core/error_policy.py`, `tests/test_error_policy.py` | `docs/learning/agent-purpose/error-policy-review.md` | model timeout、provider失敗、承認待ち、禁止操作、状態エラー、未知エラー、全体unittest 22件成功 |
| 2026-07-18 19:06 | `7ae0c31` | `OPS-PROGRESS-LEDGER-ENFORCEMENT` | governance 1 item | N/A | 約18分 | `AGENTS.md`, `docs/strategy/operating-model.md`, `docs/strategy/session-handoff-template.md`, `skills/codex-checkin/SKILL.md`, `skills/codex-checkout/SKILL.md`, `scripts/validate-session-lifecycle.ps1` | `scripts/validate-session-lifecycle.ps1` | 進捗記録の恒久ルール化、checkin/checkout導線化、検証スクリプト化、validation成功 |
| 2026-07-18 21:02 | `f842e41` | `G1-C3-I1-ISS1` | 1 Issue / 2 Task相当 | G1-C3 24h内 | 約20分 | `docs/learning/agent-purpose/normal-evaluation-cases.md` | `docs/learning/agent-purpose/normal-evaluation-cases-review.md` | 主要happy path、期待結果、Evidence参照、fit label、承認境界のケースレビュー |
| 2026-07-18 21:16 | `19fea35` | `G1-C3-I2-ISS1` | 1 Issue / 2 Task相当 | G1-C3 24h内 | 約14分 | `docs/learning/agent-purpose/abnormal-evaluation-cases.md` | `docs/learning/agent-purpose/abnormal-evaluation-cases-review.md` | 入力不備、権限逸脱、tool失敗、未読証拠、未証明claim、承認境界のケースレビュー |
| 2026-07-18 22:06 | `47bcafa` | `G1-C3-I3-ISS1` | 1 Issue / 2 Task相当 | G1-C3 24h内 | 約20分 | `src/agent_core/evaluation_runner.py`, `tests/test_evaluation_runner.py`, `docs/learning/agent-purpose/evaluation-runner-procedure.md` | `docs/learning/agent-purpose/evaluation-runner-execution-log.md` | 評価runner再実行性、結果保存、専用unittest 3件、Functions venv全体unittest 25件、compileall成功 |
| 2026-07-18 22:06 | `47bcafa` | `G1-C3-I4-ISS1` | 1 Issue / 2 Task相当 | G1-C3 24h内 | 約8分 | `docs/learning/agent-purpose/failure-diagnosis-template.md` | `docs/learning/agent-purpose/failure-diagnosis-sample-review.md` | 入力、期待、実際、原因仮説、対策、承認境界、secret/PII非混入のサンプルレビュー |
| 2026-07-18 22:06 | `47bcafa` | `G1-C4-I1-ISS1` | 1 Issue / 2 Task相当 | G1-C4 16h内 | 約5分 | `docs/learning/agent-purpose/execution-result-log.md` | `docs/learning/agent-purpose/execution-result-log-review.md` | commit、入力、出力、評価対象、Evidence、次Issue、secret/PII非混入のログサンプルレビュー |
| 2026-07-18 22:17 | `abe9c35` | `G1-C4-I2-ISS1` | 1 Issue / 2 Task相当 | G1-C4 16h内 | 約5分 | `docs/learning/agent-purpose/improvement-candidates.md` | `docs/learning/agent-purpose/improvement-candidates-review.md` | 原因、影響、優先度、対応案、承認境界、実装対象外の候補レビュー |
| 2026-07-18 22:17 | `abe9c35` | `G1-C4-I3-ISS1` | 1 Issue / 2 Task相当 | G1-C4 16h内 | 約4分 | `docs/learning/agent-purpose/change-history.md` | `docs/learning/agent-purpose/change-history-review.md` | 修正候補、理由、commit、結果、Evidence、無関係変更除外の変更履歴レビュー |
| 2026-07-18 22:17 | `abe9c35` | `G1-C4-I4-ISS1` | 1 Issue / 2 Task相当 | G1-C4 16h内 | 約4分 | `docs/learning/agent-purpose/reevaluation-comparison.md` | `docs/learning/agent-purpose/reevaluation-comparison-review.md` | 固定条件、改善/未解決判定、Evidence、外部実行なしの再評価比較レビュー |
| 2026-07-18 22:17 | `abe9c35` | `G2-C1-I1-ISS1` | 1 Issue / 2 Task相当 | G2-C1 12h内 | 約5分 | `docs/learning/infrastructure/deployment-target-classification.md` | `docs/learning/infrastructure/deployment-target-classification-review.md` | Local、Azure sandbox、dev、prod、外部platformの役割、未証明範囲、承認境界レビュー |
| 2026-07-18 22:17 | `abe9c35` | `G2-C1-I2-ISS1` | 1 Issue / 2 Task相当 | G2-C1 12h内 | 約5分 | `docs/learning/infrastructure/environment-separation-policy.md` | `docs/learning/infrastructure/environment-separation-policy-review.md` | sandbox/dev/prodの設定、データ、Identity、secret、監視、昇格境界レビュー |
| 2026-07-18 22:17 | `abe9c35` | `G2-C1-I3-ISS1` | 1 Issue / 2 Task相当 | G2-C1 12h内 | 約5分 | `docs/learning/infrastructure/identity-secret-policy.md` | `docs/learning/infrastructure/identity-secret-policy-review.md` | Managed Identity/RBAC優先、Key Vault境界、Git secret禁止、secret発行なしの方針レビュー |
| 2026-07-18 23:03 | `d9b0558` | `G2-C1-I4-ISS1` | 1 Issue / 2 Task相当 | G2-C1 12h内 | 約15分 | `docs/learning/infrastructure/cost-recovery-policy.md` | `docs/learning/infrastructure/cost-recovery-policy-review.md` | A/B/C費用判断、JPY換算前提、復旧目標、承認境界、予算アラート非停止扱い、公式価格根拠レビュー |
| 2026-07-19 09:47 | `7a3c8a2` | `G2-C2-I1-ISS1` | 1 Issue / 2 Task相当 | G2-C2 16h内 | 約15分 | `infra/main.bicep`, `infra/modules/sandbox.bicep` | `docs/learning/infrastructure/bicep-module-review.md` | subscription入口、sandboxモジュール、RBAC、secret非混入、dev/prod未作成、`az bicep build --file infra/main.bicep --stdout`成功 |
| 2026-07-19 10:00 | `103052c` | `G2-C2-I2-ISS1` | 1 Issue / 2 Task相当 | G2-C2 16h内 | 約13分 | `infra/main.bicep`, `infra/environments/*.bicepparam` | `docs/learning/infrastructure/environment-params-review.md` | `costProfile`の環境パラメータ分離、secret非混入、dev/prod未作成、main buildとsandbox/dev/prod build-params成功 |
| 2026-07-19 10:07 | `e773daa` | `G2-C2-I3-ISS1` | 1 Issue / 2 Task相当 | G2-C2 16h内 | 約7分 | `infra/README.md` | `docs/learning/infrastructure/what-if-procedure-review.md` | what-if手順、削除・費用・変更範囲確認、承認境界、記録様式、main buildとsandbox/dev/prod build-params成功 |
| 2026-07-19 10:41 | `0eafa19` | `G2-C2-I4-ISS1` | 1 Issue / 2 Task相当 | G2-C2 16h内 | 約34分 | `docs/learning/infrastructure/rebuild-procedure.md` | `docs/learning/infrastructure/rebuild-procedure-review.md` | 空/同等sandbox再構築条件、削除直前承認、Key Vault復旧リスク、記録様式、main buildとsandbox/dev/prod build-params成功 |
| 2026-07-19 11:02 | `ac1bff4` | `G2-C3-I1-ISS1` | 1 Issue / 2 Task相当 | G2-C3 12h内 | 約20分 | `docs/learning/infrastructure/deployment-procedure.md` | `docs/learning/infrastructure/deployment-procedure-review.md` | 配置手順、入力、未実行コマンド例、確認点、失敗時扱い、デプロイ記録様式、Functions venv unit test 2件成功、Azure実行なし |
| 2026-07-19 11:16 | `f123fc0` | `G2-C3-I2-ISS1` | 1 Issue / 2 Task相当 | G2-C3 12h内 | 約14分 | `docs/learning/infrastructure/health-check-procedure.md` | `docs/learning/infrastructure/health-check-procedure-review.md` | health成功条件、失敗時診断、記録様式、Application Insights確認観点、未承認時Not run扱い、Azure/health URLアクセスなし |
| 2026-07-19 11:29 | `a82c608` | `G2-C3-I3-ISS1` | 1 Issue / 2 Task相当 | G2-C3 12h内 | 約13分 | `docs/learning/infrastructure/promotion-decision-criteria.md` | `docs/learning/infrastructure/promotion-decision-criteria-review.md` | sandbox->dev/dev->prod昇格ゲート、テスト・費用・権限・監視・Evidence条件、slot制約、昇格レビュー記録様式、Azure実行なし |
| 2026-07-19 11:42 | `7d6e0af` | `G2-C3-I4-ISS1` | 1 Issue / 2 Task相当 | G2-C3 12h内 | 約13分 | `docs/learning/infrastructure/rollback-decision-criteria.md` | `docs/learning/infrastructure/rollback-decision-criteria-review.md` | 戻す条件、戻さない条件、必要証拠、slot/Flex Consumption制約、破壊的操作承認境界、rollbackレビュー記録様式、Azure実行なし |

### 13.2 進捗集計

| 範囲 | 総数 | 完了 | 残り | 状態 |
|---|---:|---:|---:|---|
| 全Issue | 44 | 28 | 16 | 進行中 |
| 全Task相当 | 88 | 56 | 32 | 進行中 |
| G1-C1 設計Issue | 4 | 4 | 0 | 完了 |
| G1-C2 実装Issue | 4 | 4 | 0 | 完了 |
| G1-C3 評価Issue | 4 | 4 | 0 | 完了 |
| G1-C4 改善運用Issue | 4 | 4 | 0 | 完了 |
| G2-C1 基盤設計Issue | 4 | 4 | 0 | 完了 |
| G2-C2 IaC・設定管理Issue | 4 | 4 | 0 | 完了 |
| G2-C3 配置・health check・昇格・rollback判断Issue | 4 | 4 | 0 | 完了 |
| 今回セッション実作業 | 1 Issue / 2 Task相当 | 1 | 0 | 約13分 |
| 今回セッション定着作業 | N/A | 0 | 0 | 実施なし |
| 今回セッション計画工数対象 | G2-C3 12h | 12h相当 | N/A | G2-C3-I1、G2-C3-I2、G2-C3-I3、G2-C3-I4完了、Evidence作成済み |

次に進めるIssueは `G2-C4-I1-ISS1`「監視確認が単発」である。G2-C3完了を前提に、正常、警告、異常の監視確認手順と監視確認記録様式を作成する。Azure Portal/CLI/API、Log Analytics query、health URLアクセス、課金変更、有料操作、モデル呼び出しは別途承認が必要である。

## 14. 調査根拠

参照日はすべて2026-07-18。用語の登場と、正式な定義項目としての掲載を区別して確認した。

- [IIBA: BABOK Guide Version 3, Appendix A: Glossary](https://www.iiba.org/career-resources/a-business-analysis-professionals-foundation-for-success/babok/glossary/) - `acceptance criteria`、`business goal`、`business objective`、`capability`、`deliverable`、`initiative`、`mission statement`、`requirement`、`task`、`verification`。
- [IIBA: BABOK Guide Version 3 Glossary 日本語版](https://www.iiba.org/globalassets/standards-and-resources/glossary/files/babok-v3-glossary_japanese.pdf) - pp.409-426。英語Glossaryとの用語対応。
- [IIBA: The Business Analysis Standard, Version 2.0, 2025](https://www.iiba.org/globalassets/business-analysis-resources/the-business-analysis-standard/files/the-business-analysis-standard.pdf) - §4.4.1、§§5.1-5.2、§7.2。Requirement、Task、Verification、Validation。
- [PMI: PMI Lexicon of Project Management Terms, Version 5.0, January 2026](https://www.pmi.org/-/media/pmi/documents/registered/pdf/pmbok-standards/pmi-lexicon-pm-terms.pdf?rev=447328d841c249af985d14177ddd5f95) - `acceptance criteria`、`business objective`、`capability`、`definition of done`、`deliverable`、`issue`、`requirement`、`task`、`traceability`、`validation`、`verification`。
- [GitHub Docs: About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues) - Issueの用途とsub-issues。
- [GitHub Docs: Adding sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues) - sub-issueによる作業分解と親子関係。
- [GitHub Docs: About tasklists](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/about-tasklists) - Markdownチェック項目、TaskからIssueへの変換、tasklist blocks廃止とsub-issuesへの移行。
- [GitHub Docs: Managing issue types in an organization](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-types-in-an-organization) - 既定issue typeの`task`、`bug`、`feature`。
- [Microsoft Learn: Use backlogs to manage projects](https://learn.microsoft.com/en-us/azure/devops/boards/backlogs/backlogs-overview?view=azure-devops) - Azure Boards backlog階層と親子リンク。
- [Microsoft Learn: Default processes and process templates](https://learn.microsoft.com/en-us/azure/devops/boards/work-items/guidance/choose-process?view=azure-devops) - Basic、Agile、Scrum、CMMIで異なるIssueとTaskの意味。
- [Microsoft Learn: Define features and epics](https://learn.microsoft.com/en-us/azure/devops/boards/backlogs/define-features-epics?tabs=agile-process&view=azure-devops) - Epic、Feature、backlog item、Taskの階層と粒度。
- [OpenAI Agents SDK: Agents](https://openai.github.io/openai-agents-python/agents/) - instructions、tools、guardrails、handoffsを持つagentの構成。
- [OpenAI Agents SDK: Tools](https://openai.github.io/openai-agents-python/tools/) - tool利用、Hosted tools、Function tools、Agents as tools。
- [OpenAI Agents SDK: Guardrails](https://openai.github.io/openai-agents-python/guardrails/) - input guardrailsとoutput guardrails。
- [OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/) - agent実行のtrace、span、workflow可視化。
- [OpenAI Agents SDK: Sessions](https://openai.github.io/openai-agents-python/sessions/) - conversation historyを複数turnで保持するsession。

## 15. 検証チェックリスト

- Missionが1つだけ定義されている。
- 全規範文に一次資料または`ローカル設計`の区分がある。
- 公式資料間の用語衝突について、採用する意味と採用しない意味がある。
- 6階層すべてに必須欄、禁止事項、命名文型、時間的性質、完了判定がある。
- Requirement、Deliverable、Acceptance Criteria、Verification Method、Evidence、Definition of Doneが混同されていない。
- Mission以外の全項目に有効な主要親が1つある。
- 子の集合が、親の全Deliverableと全Acceptance Criteriaをカバーする。
- 各Acceptance CriteriaにVerification MethodとEvidenceがある。
- `N/A`には適用外の理由がある。
- Goal 1にエージェントの継続改善運用が含まれている。
- Goal 1の改善運用とGoal 2の基盤運用が区別されている。
- Goal 3で資料の存在だけでなく、本人が証拠付きで説明できることを求めている。
- 各Initiativeに主要Capabilityが1つだけ割り当てられている。
- 全11 Capabilityに少なくとも1つのInitiativeが対応している。
- 全44 InitiativeにIssueが1件以上ある。
- 全44 IssueにTaskが2件ずつある。
- 有料操作、外部リソース作成、GitHub Issue作成、GitHub Project作成を実行していない。

## 16. 記載仕様適合監査

### 16.1 判定方法

Section 5.1の必須欄を分母とし、各要素に明記されている欄だけを充足として数える。周辺文脈から推測できる内容は充足扱いにしない。

- `適合`: 適用する必須欄がすべて明記され、境界判定に合格する。
- `不足`: 階層の種類は妥当だが、必須欄が不足している。
- `不適合`: 隣接階層の役割を誤っている、または親の言い換えで独立した意味を持たない。

### 16.2 監査結果

| 区分 | 対象数 | 適合 | 不足 | 不適合 |
|---|---:|---:|---:|---:|
| Mission | 1 | 1 | 0 | 0 |
| Goal | 3 | 3 | 0 | 0 |
| Capability | 11 | 11 | 0 | 0 |
| Initiative | 44 | 44 | 0 | 0 |
| Issue | 44 | 44 | 0 | 0 |
| Task | 88 | 88 | 0 | 0 |
| 合計 | 191 | 191 | 0 | 0 |

### 16.3 監査判定

- ID重複なし、親参照整合、必須欄充足、Issue・Task定義、Evidence追跡可能性を満たしたため、Mission-tree-statusを`complete`とする。
- この`complete`は文書上のMissionツリー完成を表す。Missionそのもの、Goalそのもの、Capabilityそのものが達成済みであることは意味しない。
- 次の作業は、優先Issueを選び、別途承認を得て実装計画またはGitHub Issue化へ進むことである。

## 17. 案件向け工数・価格概算

> 見積基準日: 2026-07-18
>
> このセクションは、完成したMissionツリーを案件規模へ換算する計画基準である。実績工数、契約見積書、費用発生の承認を表すものではない。

### 17.1 見積前提

- 現在のリポジトリにあるBicep、Azure sandbox、health API、方針資料、検証記録を流用する。
- AI支援を利用する実装者1名の実稼働時間として見積もる。
- 全44 IssueのT1成果物作成とT2検証記録を含む。
- ローカル実装、テスト、sandbox向けIaC・配置手順、評価、Evidence整理、説明資料を含む。
- 標準工数には、仕様確認、横断整合、レビュー、軽微修正1回を含む。
- 待ち時間、有料モデル利用料、Azure利用料、dev/prodの実作成、応募送信、長期運用、追加要件、顧客固有システム連携、UI開発は含まない。

### 17.2 Goal・Capability別工数

| Goal | Capability | 作業領域 | 工数 |
|---|---|---|---:|
| G1 | G1-C1 | エージェント目的、入出力、tool境界、評価・trace設計 | 16時間 |
| G1 | G1-C2 | model adapter、tool制御、状態管理、エラー処理の実装 | 32時間 |
| G1 | G1-C3 | 正常系・異常系評価、評価runner、失敗診断 | 24時間 |
| G1 | G1-C4 | 実行記録、改善候補、変更履歴、再評価比較 | 16時間 |
|  |  | **G1小計** | **88時間** |
| G2 | G2-C1 | 配置先、環境分離、Identity、secret、費用・復旧設計 | 12時間 |
| G2 | G2-C2 | Bicep、環境パラメータ、what-if、再構築手順 | 16時間 |
| G2 | G2-C3 | デプロイ、health check、昇格、rollback判断 | 12時間 |
| G2 | G2-C4 | 監視、ログ、権限、費用の運用手順 | 16時間 |
|  |  | **G2小計** | **56時間** |
| G3 | G3-C1 | Goal 1の主張、証拠対応、設計・改善説明 | 16時間 |
| G3 | G3-C2 | Goal 2の主張、証拠対応、基盤・運用説明 | 16時間 |
| G3 | G3-C3 | 統合説明、案件要件対応、未証明管理、応募説明 | 16時間 |
|  |  | **G3小計** | **48時間** |
|  |  | Issue実行小計 | 192時間 |
|  |  | 横断調整、レビュー、軽微修正1回 | 19時間 |
|  |  | **標準実作業見積** | **211時間（運用上210時間）** |

### 17.3 案件提示基準

| 項目 | 基準 | 意味 |
|---|---:|---|
| 標準実作業見積 | 210時間 | 現在の成果物を流用し、定義済みIssueを完了する実作業基準。 |
| 案件提示工数 | 250時間 | 標準実作業に、追加の仕様確認、レビュー往復、納品整理、引継ぎ余力を加えた提示基準。 |
| 提示レンジ | 210〜270時間 | 既存成果物の流用率とレビュー量による変動範囲。 |
| 期間 | 7〜9週間 | 1名、実働6時間/日、週5日で35〜45実働日。外部待ち時間を除く。 |

- 構造的な大規模やり直しは2回までを見積範囲とし、3回目以降は追加要件としてスコープを再定義し、再見積する。
- 誤字、ID、親参照、Markdown、テスト不備の修正は品質是正であり、構造的な大規模やり直しへ数えない。

### 17.4 市場価格の計画基準

- [曖昧] 契約形態、責任範囲、実績、仲介有無により変動するが、このスコープの案件価格帯は税別180万〜270万円、中心価格は税別220万円を計画基準とする。
- [曖昧] 案件提示工数250時間に対する中心価格220万円は、時間単価換算で8,800円である。
- [曖昧] 固定価格では、要件確認、レビュー往復、納品責任のリスクを含め、税別220万円を基本提示、税別270万円を上限目安とする。
- Azure利用料、モデル利用料、有料外部サービス、税、追加要件は案件価格へ含めず、Cost gateまたは別見積で扱う。

市場価格の参照日は2026-07-18とする。

- [エン株式会社: 2025年12月度 フリーランススタート定点調査](https://corp.en-japan.com/newsrelease/2026/44299.html) - 全体平均月額78.3万円、SRE平均月額93.5万円。
- [Findy Freelance: 2026年フリーランスエンジニア市場調査](https://prtimes.jp/main/html/rd/p/000000213.000045379.html) - 平均月額約80万円、平均時間単価5,319円。
- [ZOOA: AIエンジニア案件の単価例](https://freelance.zooa.co.jp/) - AI案件デビュー月60万円から、AI経験者月80万円から、トップエンジニア月140万円からの目安。
- [Heyday: AIエージェント開発エンジニアの案件単価例](https://lp.hydy.jp/blog/ai-agent-engineer-ses-tanka) - Azure連携を含むAIエージェント案件と本番運用案件の公開例。
