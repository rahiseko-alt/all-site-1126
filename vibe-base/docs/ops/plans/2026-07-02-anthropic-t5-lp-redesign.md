# Plan: anthropic-t5 LP 0ベース再設計（ゴール=CTA「まずは相談」）

## Context

マスターが現行 LP（`products/homepage/anthropic-t4/`）のデザイン品質に全面不満を表明。「0ベースで改善設計しろ。ゴールは目的を達成できる HP 作り。今回のゴールは CTA（まずは相談）」。

### マスターの 7 つの不満と根本原因（調査済み）

| # | 不満 | 調査で判明した根本原因 |
|---|------|----------------------|
| 1 | デザインの大枠が視聴者目線じゃない | 構成が提供者の自己紹介順（悩み→実績→事例→…のBtoBテンプレ順）。来訪者の意思決定動線から設計していない |
| 2 | 言葉がおかしい（違和感がある） | コピーをデザインに混ぜて提示→違和感が視覚に埋もれる。校正20項目は通過するが自然さは検査していない |
| 3 | AIぽいデザイン | 参考実物を見ずに記憶から生成→AIの統計平均に収束。Swipe File 蓄積ゼロ |
| 4 | テキストだらけの単調 | 図版ゼロの文章ブロック6連続・画像1枚のみ・JSは一律フェード16行。全11セクションが同一容器の縦積み＝金太郎飴 |
| 5 | 成功法則に沿っていない | lp-design.md 必須入力7項目（痛み/数値ベネフィット/証拠/緊急性等）の充足検査をしていない |
| 6 | リサーチが要約・平均化され薄っぺらい | 「共通点まとめ」を作る手法自体が平均化装置。成果が資産化されず毎回消える |
| 7 | 毎回同じダメ出し | 4役レビュー98点通過→マスター全面却下＝**レビュー rubric に骨格を見る役が居ない**。NGが規範に還流されない。全部作ってから見せる一発勝負構造 |

### 対策の骨子（「気をつける」禁止・全て構造化）

- **不満6**: 「共通点レポート」成果物を禁止。**1参考1個票**（Playwright 実物スクショ+骨格抽出+採用/不採用理由）→ `docs/swipe-file/` に恒久資産化 → 収束は「平均でなく**主参考1本選択**」→ マスターGO 2段。
- **不満7**: (a) 7不満を must-not v2 / lp-review-protocol v2（**第5役 taste-judge 追加**）に恒久追記 (b) t4 を design-yardstick の FAIL 実例に追加（golden set 更新） (c) **マスター中間チェックポイント5点**（CP①コンセプト+コピー → CP②感情定義GO+主参考GO → CP③WF → CP④ヒーロー3変種目視選定 → CP⑤最終）で一発勝負を廃止。ヒーローが成否の80%（lp-design.md）なので CP④ で先に確定し、rubric ズレが再発しても被害はヒーロー3変種分で止まる。
- **不満1**: `concept.md` に「来訪文脈シート」（経営者がどこから来るか・来訪時の感情・2秒で感じるべきこと）必須化＋受け入れ基準に「経営者ウォークスルー」追加。
- **不満2**: **コピー先行工程**＝デザイン着手前に `copy.md`（全文言・ヒーロー見出し3案比較）を単独でマスター承認（CP①）。
- **不満4**: WF を「セクション×表現形式マトリクス」で作成。テキストのみセクション3連続で差し戻し・非テキスト表現40%以上を CP③ 承認基準に明記。
- **不満5**: 必須入力7項目の充足表を concept.md に必須掲載＋高転換LP実物3〜5件の個票分析。

### 前提（仮置き・CP① でマスター承認）

1. ターゲット＝中小企業の経営者（既存採点 rubric B「中小企業経営者への刺さり35点」と整合）
2. 再設計範囲＝デザイン+コピー全て0ベース。事実データ（のべ50社超・8年・事例・FAQ・連絡先）のみ t4 から流用
3. 成果物置き場＝`products/homepage/anthropic-t5/`（t4 温存＝事実抽出元+FAIL実例）
4. CTA 文言は「まずは相談」を軸に候補3案からマスター選定（現行は「30分、話してみる」×7箇所）
5. 料金実値・顔写真実写の有無は Step1 で先出し確認（後半発覚は全面手戻りのため）

## 上位 plan からの constraint 変更

| 項目 | 上位（memory.md P1）の扱い | 本 plan での扱い |
|------|------------------|------------------|
| 料金 ¥— 3箇所差し替え（t4） | H・実値受領後 t4 に反映→deploy | t5 に統合（Step1 で実値を先出し確認・t4 単独反映は中止） |
| trimmer 混入コミット修正 | H・`reset --soft HEAD~1`（マスター承認要） | **scope 外**。混入コミットは HEAD から47コミット手前で reset 不能を検知済み。クローズ推奨を別途マスター判断 |
| dx-site 実機評価 | M・マスター評価待ち | scope 外・現状維持 |

## 影響範囲

- 新規作成:
  - `products/homepage/anthropic-t5/`（concept.md / copy.md / wireframe.md / facts.md / must-not.md / lp-review-protocol.md / hero-a.html / hero-b.html / hero-c.html / index.html / style.css / app.js）
  - `docs/swipe-file/entries/2026-07-*.md`（1参考1個票・6件以上）
  - `docs/swipe-file/shots/*.png`（実物スクショ）
- 修正:
  - `docs/swipe-file/index.html`（目次追記）
  - `docs/standards/design-yardstick/README.md`（t4 を FAIL 実例に追加）
  - `products/homepage/failures.md`（「4役98点通過→全面却下」の乖離事象を記録）
  - `products/homepage/memory.md`（P1 に本 plan path 記載）
- 削除: なし（t4 は温存）

Glob 照合結果:
- `products/homepage/anthropic-t5/**`: 0 件（新規衝突なし・確認済み）
- `docs/swipe-file/`: index.html のみ（entries/ shots/ は新規・確認済み）

## 実装ステップ

> 手順正本 `docs/standards/web-design-flow.md` の 10 ステップ（Double Diamond）を今回タスクに具体化。CP = マスター承認ポイント。

| Step | 内容 | 担当 agent | 検証 |
|------|------|-----------|------|
| 0 | 着手前 Glob 照合＋**規範更新**（t4 の must-not/protocol を複製し v2 作成: 7不満由来の禁止項目 H 章＋第5役 taste-judge 追加・yardstick README に t4 FAIL 追加・failures.md 記録）＋ t4 から事実データ抽出→facts.md | orchestrator | test -f で v2 系 4 ファイル確認 |
| 1 | コンセプト確定: 来訪文脈シート・必須入力7項目充足表・**料金実値/顔写真の先出し確認** | orchestrator | concept.md 実在+7項目表 |
| 2 | 2秒メッセージ＋コピー先行: ヒーロー見出し3案比較・全文言ドラフト・CTA文言3案 | orchestrator | **CP①** マスター承認 |
| 3 | 参考リサーチ: 感情定義（DO/NOT DO）→GO → 候補8件以上（research-analyst）→ Playwright 実物スクショ（`browser_take_screenshot` fullPage）→ 1参考1個票 → 主参考1本推薦。**共通点まとめの作成禁止**。ビジュアル未確認サイトは選定対象外 | orchestrator + research-analyst | **CP②**（2段GO）・個票6件以上 |
| 4 | 収束＋WF: 主参考の骨格を基点に「セクション×表現形式マトリクス」・パレット/フォント計画（anthropic-ban / must-not v2 照合済みで提示） | orchestrator | **CP③** マスター承認 |
| 5 | 技術選定: Technology Radar Adopt から GSAP+ScrollTrigger＋可変フォント（素CSS禁止充足）。`/gsap` スキル参照。reduced-motion/モバイルフォールバック設計併記 | orchestrator | wireframe.md に採用理由記載 |
| 6 | 保守天秤: GSAP ローカル同梱・バージョン固定・Vercel Hobby 静的制約の評価記録 | orchestrator | 同上 |
| 7 | 開発計画: 体数（ヒーロー3体+全体1体+検証1体）・時間見積を着手前提示 | orchestrator | マスター提示 |
| 8 | **ヒーロー先行プロトタイプ3変種**: frontend-engineer-agent 3体フォアグラウンド並列・別ファイル（hero-a/b/c.html）・共通入力（concept/copy/WF/主参考個票/must-not v2/anthropic-ban）・各体に骨格発明点3行報告義務 | frontend-engineer-agent ×3 | **CP④** ローカルサーバ配信でマスター目視1本選定 |
| 9 | 全体実装: 選定ヒーローを全ページ化（index.html/style.css/app.js 各500行以内） | frontend-engineer-agent ×1 | Step 10 で検証 |
| 10 | 5役レビュー（ban照合/採点95点/校正0件/代弁者0件/**taste-judge 骨格判定**）＋ Playwright 実測（375px・reduced-motion・実スクロール量基準・実ホイール `page.mouse.wheel()`） | verify-agent | 全役 PASS+実測スクショ |
| 11 | マスター最終判定（**CP⑤**）→ NG 時は該当 Step へ戻し+NG内容を must-not v2 へ即日追記（/fix-loop 発火） | orchestrator | マスター合格 |
| 12 | 最終 Glob 照合＋memory.md P1 更新＋パス限定コミット（`git commit -- products/homepage docs/swipe-file docs/standards/design-yardstick`） | orchestrator | 全 path 存在確認・`git diff --cached --name-only` 目視 |

> 本番反映（`vercel deploy --prod`）は CP⑤ 合格後の**別タスク**としてマスター指示待ち（勝手にデプロイしない）。

## リスク

| リスク | 検知方法 | 対応 |
|--------|---------|------|
| 参考サイト取得不能（bot拒否等） | Playwright ナビゲーション失敗 | 候補8件以上→取得成功分から選定。WebFetch は構造補助のみ（「見た」と報告禁止） |
| 骨格再発明が CTA 導線を阻害（凝りすぎで相談ボタンが埋まる） | CP③ WF 承認基準・採点 rubric A（CTA 35点）維持 | CTA保護領域: ファーストビュー内 CTA 必達・モバイル固定バーは発明対象外・どの位置からも1操作で CTA 到達。骨格の冒険はヒーロー+中盤1箇所に限定 |
| judge がまた通してマスターが落とす（rubric ズレ再発） | CP④ でヒーロー段階のマスター目視 | t4 を yardstick FAIL 実例化で judge 基準をマスター判定に接近。乖離してもヒーロー3変種分で被害停止 |
| ban×must-not で表現域が狭すぎて再び無難化 | CP③ でパレット/フォント3案比較 | 机上で考えず主参考1本の実物から逆算（参考主導） |
| スクロール連動の偽PASS（failures.md 3件の再発） | 実ホイール検証必須 | HTTPサーバ配信+`page.mouse.wheel()`+複数 vh で computed style 実測（vh依存の進行度計算禁止） |
| 並行セッションの staged 巻き込み | `git diff --cached --name-only` | パス限定コミット一発原子化（pre-git-staging-gate hook 稼働中） |

## テスト方針

1. verify-agent 5役レビュー（ban照合/採点/校正/代弁者/taste-judge）→ 受け入れ基準 1〜5 と対応
2. Playwright 実測（375px スクショ・reduced-motion・実ホイールスクロール連動）→ 受け入れ基準 7 と対応
3. 経営者ウォークスルー（来訪文脈シートになり切り初見1周: 2秒で何屋か/自分の悩みがあるか/CTA に迷わず到達か、各 Yes/No）→ 受け入れ基準 6 と対応
4. ローカル HTTP サーバ配信でマスター目視（CP④・CP⑤）→ 受け入れ基準 10 と対応

## 受け入れ基準

### 意図（EARS 形式）
- WHEN 中小企業経営者が LP を開いた時 THE SYSTEM SHALL 2秒以内に「誰向けの何屋か」を伝え、迷いなく CTA「まずは相談」へ到達させる
- WHEN マスターが NG を出した時 THE SYSTEM SHALL NG 内容を must-not v2 / protocol v2 に即日追記し同型再発を遮断する

### 機械検証可能条件
- [ ] anthropic-ban.md 全件パス（違反 0 件）
- [ ] 採点エージェント 95 点以上（lp-review-protocol v2）
- [ ] 文章校正役 指摘 0 件
- [ ] マスター代弁者 即刻削除 0 件（料金/写真 TODO の公開禁止含む）
- [ ] taste-judge 骨格パラダイム PASS（yardstick 照合: index/pro-2/pro-3/**t4** に非類似・pro-1 水準）
- [ ] 経営者ウォークスルー 3 問全 Yes
- [ ] Playwright 実測 3 点（375px/reduced-motion/実ホイール連動）スクショ付き PASS
- [ ] Glob: `products/homepage/anthropic-t5/{index.html,style.css,app.js}` 存在・各 500 行以内
- [ ] Glob: `docs/swipe-file/entries/*.md` → 6 件以上（リサーチ資産化の完了証明）
- [ ] test -f: must-not v2 / lp-review-protocol v2 / yardstick README 追記 / failures.md 追記（不満7対策の完了証明）
- [ ] git diff --stat → 影響範囲セクション記載と一致
- [ ] **マスター目視合格（最終判定・上記は全て助言）**

## 承認後モード
default（理由: 判定軸 4＝新規ファイル数 ≥ 1（anthropic-t5/ 一式+swipe-file 個票を新規作成）。加えて CP①〜⑤ のマスター承認が工程の背骨の対話型フローであり自動編集連続実行に適さない）
