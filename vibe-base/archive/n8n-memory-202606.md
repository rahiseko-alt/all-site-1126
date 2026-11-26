# n8n memory archive (2026-06)
> 元 products/n8n/memory.md から移行した P3・P4 コンテンツ
> 作成: 2026-06-10 / コンテキスト改革 Phase C

## P3: 失敗事例

### [2026-05-28 Plan Mode 再入][severity:M]
- 事象: 司令塔エージェントが「ローカル Docker + vault mount + Manual Trigger」Plan を承認・実装着手前にマスターから「PC 起動してなくても発動可能か」確認要請を受け、Plan Mode 再入で「Oracle Cloud Always Free + rclone bisync OneDrive + Schedule Trigger 06:00 JST」全面方向転換 Plan に書き換え。客観 7 基準 ⑥ Plan Mode 再入に該当。
- 根本原因: 初回 Plan 起草時に「PC 電源 OFF 時の自動発動要件」「複数 workflow 同基盤集約予定」「顧客個人情報を扱う場合の越境移転法規対応」の 3 要件を Phase 1 Initial Understanding で聞き漏らした。
- 再発防止策: Plan Mode の Phase 1 で「自動発動の前提条件 (PC 電源状態・スケジュール時刻・複数 workflow 想定・データ越境法規)」を Initial Understanding の必須設問に組み込む。インフラ系 Plan 起草時のチェックリストとして P4 教訓化。
- 関連 commit: 2026-05-28 Check-out コミットで紐付け

## P4: 永続教訓

- [importance:H][2026-05-28] **クラウド母艦は日本リージョン必須 (Tokyo / Osaka)** — 日本の個人情報保護法 第 28 条「外国にある第三者への提供」+「外的環境の把握」義務を構造的に回避するため。Singapore / Seoul は将来顧客個人情報を扱う際に法的負担 (本人同意 or クラウド例外要件の解釈ブレ・プライバシーポリシー記載追加・BtoB 顧客の調達要件で「国内データ保管」要件抵触) が発生する。リージョン枠埋まり時は同リージョン内の代替インスタンス (AMD E2.1.Micro x 2 等) を選択。**How to apply:** Oracle Cloud / AWS / GCP / Azure 等の母艦配備時は最優先で日本リージョン (Tokyo / Osaka) を試行・他国リージョン提案を選択肢に出さない。

- [importance:M][2026-05-28] **PPC「クラウド例外」要件 (法 27 条 第三者提供非該当)** — 契約条項で「クラウド事業者がサーバ上の個人データを取扱わない」明記 + 適切なアクセス制御の 2 要件を満たせば、海外クラウドでも「第三者提供」に該当しない (出典: PPC Q&A 1-q7-53)。ただし「外的環境の把握」義務 (法 23 条) は別軸で発生・プライバシーポリシー記載が必要。**How to apply:** 海外 IaaS / SaaS 検討時はサービス契約条項の「データ非取扱」明記有無を必ず確認・該当する場合のみクラウド例外で 28 条回避可能と整理。

- [importance:H][2026-05-28] **インフラ系 Plan 起草時の必須設問チェックリスト** — Phase 1 Initial Understanding で以下を必ず聞く: (1) 自動発動の電源前提 (PC OFF 時にも動作するか) / (2) スケジュール時刻 (cron 必要か) / (3) 同基盤に集約する workflow の予定本数・性質 / (4) 顧客個人情報や法的規制データを扱う可能性 / (5) 既存資産との互換性 (vault / 既存 docker-compose / 既存 workflow)。**How to apply:** n8n / Vercel / Cloud Run / VPS 等のインフラ判断を伴う Plan 起草時に Phase 1 終盤でこの 5 項目を AskUserQuestion で確認・確認漏れによる Plan Mode 再入を防止。

- [importance:H][2026-05-28] **本フォルダ (`products/n8n/`) への指示はすべて n8n ワークフロー構築として実装する** — マスター 2026-05-28 明示。司令塔の WebFetch + Write による直接実行は本 product では禁止。情報収集・データ処理・スケジュール実行は n8n の実ノード（RSS Feed Read / HTTP Request / Code / Read Write File / Schedule Trigger / Manual Trigger / IF / Merge / Set / NoOp）で再構築する。**How to apply:** `/feed-check` 相当のスキル発火時も、Claude Code 内処理ではなく n8n workflow JSON 生成 → docker import → 実行の経路を取る。

- [importance:H][2026-05-28] **Plan Mode 自動発動は AI 自己規律で代替不能・settings の `defaultMode:"plan"` 機械強制が必要** — 本セッション開始時に Plan Mode 未発動でいきなり `/pc-checkin` → `/feed-check` 実行に進み、マスター指摘で発覚。原因: `~/.claude/settings.json:14` の `defaultMode: "auto"` が user-level で設定されていて全プロジェクトに継承。memory P1.5「AI 自己規律は信用しない・機械強制必須」と整合。vibe-base 司令塔セッションで user-level settings を `"plan"` に変更する持ち越し（n8n agent は settings 編集権限なし）。**How to apply (n8n agent):** Plan Mode 自動発動を期待せず、複数 STEP・ファイル生成・破壊的影響ある作業に着手する前は明示的に Plan Mode へ入る or マスターに確認する。

- [importance:H][2026-05-27] **API は n8n 構築の前提ではない** — n8n 起動・ワークフロー作成・Manual Trigger・ローカル整形/テンプレ生成・ダミーデータ空運転は API なしで可能。API が必要なのは外部サービスへ実際に送信/保存/生成/投稿する段階のみ。説明時にここを混同しない。

- [importance:M][2026-05-27] **AGENTS.md は AI 共通ルールとして扱う** — Codex 専用ではなく、Claude Code / Codex / その他 AI が読む共通規律。AI 固有ファイルがあっても `AGENTS.md` の共通ルールに反しない。

- [importance:M][2026-05-28] **旧 P1 継続: 外部接続境界の再確認** — Anthropic / Google Drive / Sheets / Blotato / Veo3 / Runway / fal.ai 等の認証情報登録・課金 API 実行はマスター明示承認まで保留。

- [importance:M][2026-05-28] **旧 P1 継続: Codex 側 `/pc-checkin` / `/checkout` 発火確認** — 別 Codex チャットで動作確認、弱ければ `AGENTS.md` または skill description を補強。
