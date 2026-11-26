# vibe-base memory.md 引継ぎテーブル退避（2026-07・前半）

> memory.md の byte 上限（12000B）維持のため、解決済み/完遂済みの引継ぎテーブル行をここへ退避する。詳細は各セッションレポート（`docs/session-reports/`）参照。

| 日付 | product | 要点（詳細はレポート必読） | 詳細レポート（docs/session-reports/） |
|---|---|---|---|
| 07-19(2) | vibe-base | 新H2大義(Remote Control)確定(M1〜3todo)。Mission Tree reference取込・nippo-ops裁定発行（現行H2大義は memory.md 冒頭バナーに常設） | `2026-07-19-checkout-2.md` |
| 07-19 | vibe-base / CC-v2 | 旧H2大義(daigi全product配備)を「完了」判定。CC-v2(クリーンルーム・別org)構想策定＝`~/.claude/CC-v2-plan.md`。LP黄金律stale branch救出push(`c73d15a`) | `2026-07-19-checkout.md` |
| 07-16(4) | vibe-base(司令塔) | **重複投稿チェック完了・重複なし確認**（Buffer GraphQL直接照会でX2/Threads2/IG1の1セットのみと判明。詰まったrunは実質何も生成せず終了）。ig-card Replicate実装は`products/ig-card/scripts/`に既に高品質実装あり（実機テスト未確認）。**🔴ツール承認プロンプト不具合**（Agent/Bash拒否連発・原因未特定）発生 | `2026-07-16-checkout-4.md` |
| 07-16(3) | vibe-base(司令塔) | **Instagram投稿がBufferキューにライブ登録完了**（`status:scheduled`・20:00 JST配信）。routine`trig_01WuxHeHMYZDxqV2iMtmVPGZ`にIGブロック恒久組込済（X2/Threads2/IG1を毎日補充） | `2026-07-16-checkout-3.md` |
| 07-16(2) | vibe-base(司令塔) | **ig-card動的IG画像生成は本番Vercelで`FUNCTION_INVOCATION_TIMEOUT`が解消せず保留**（フォントグリフ削減・maxDuration設定を試すも未解決）。マスター指摘で対症療法打ち切り、静的画像`card.jpg`固定運用に切替 | `2026-07-16-checkout-2.md` |
| 07-15 | vibe-base(司令塔) | **Buffer 経路A実稼働**（X `kosehirax` に10件・07-16〜23 自動配信・PC非依存）。**経路B(予定タスク×Bufferコネクタ)は不能確定**（カスタムMCPは Routines不可・#63233 not-planned）。代替=Buffer API を curl直叩き | `2026-07-15-checkout-2.md` |
| 07-13 | databank | **認証穴を根治**（サーバーサイドcookie認証全面移行・scrypt+HMAC署名cookie・レートリミット実装）。本番デプロイ・実機検証済（401/429/cookie無し401/正式PW成功）。並列バースト耐性はBlob限界でマスターが現状維持裁定 | `2026-07-13-checkout-5.md` |
| 07-13 | vibe-base(司令塔) | **応募文サブ job-application-writer 文体・構成 再設計**（骨子必須→facts-ledger 自力読取／実証リサーチで冒頭エグゼクティブサマリー+PREP・クライアントファースト・PASONA煽り禁止・オウム返し/AI臭対策・70%トーン・works1本）。実投稿はマスター微調整。正本 ~/.claude/agents（変更後 backup-agents+sync-codex 必須） | `2026-07-13-checkout-3.md` |
| 07-13 | vibe-base(司令塔) | **7プラン系オールクリア確定**（監査#3 git clean bypass 修正 `64efbf4`・検証パネル①②③2R／新規4skill発火スモーク4/4PASS／「実行中に発見した問題」全件決着=修正/認定しない/放置・未対応ゼロ）。残は別トラックH（databank/x-auto-post）| `2026-07-13-checkout-2.md` |
| 07-13 | vibe-base(司令塔) | **監査#7①skill化 完遂=監査7本全完了**（新規4skill+checkout機械ゲート化+web-design 3構図組込・両push済・skill発火スモークは次session） | `2026-07-13-checkout.md` |
| 07-12 | kosespark | **配布フローをAI運転型に刷新**（kosespark独立リポ `c778d8a`/`2debe4b`/`586c002`）。顧客送付は `products/kosespark/video-shorts/install/video-shorts.zip` 1本。中の `start-here.md` をClaude Codeに渡し「実行して」で⓪同意〜④ガイドを会話ナビ。UI/Vercel不要。**#7①skill化は未着手・kosespark未コミット別改変は不干渉** | `2026-07-13-checkout.md` |
| 07-12 | vibe-base(司令塔) | **plan#6逸脱D2是正**（`1e85a15`）。transcript-audit 987→119行+lib6本(全≤500)・挙動不変sha256実証・再分割不要。**残は#7①skill化のみ**。D4(cap25)保留 | `2026-07-12-checkout-2.md` |
| 07-12 | vibe-base(司令塔) | **plan #6③自動実行化 完了**（C-0〜C-7・schtasks5件登録済・commit `8d186f0`）。定期5job+root専用2hook・検知/レポート専用・check-in A-28+runbook。検証パネル blocking 0(advisory9件修正)。C-5 PII辞書は空(実名投入待ち)・453件/日hook故障は放置記録済 | `2026-07-12-checkout.md` |
| 07-20(3) | buffer-refill | 自己拒否**根治確認**。原因=Stop hookの権限主張文言がinjectionと誤認され逆効果だった。文言中立化push(`213ac06`)→5件成功・3経路確認 | `2026-07-20-checkout-3.md`（＝上の@参照） |
| 07-20(2) | vibe-base | 前々session異常挙動検証: .gitignore注入=捏造(被害なし)。style-discipline.md不在の宙吊りimport削除 | `2026-07-20-checkout-2.md` |
| 07-20 | buffer-refill | routine間欠的自己拒否を実測確定。Stop hook実装push済(`0d9a67f`) | `2026-07-20-checkout.md` |
| 07-21 | buffer-refill / ig-images | IG投稿が3日ぶりに復活（5件全成功）。画像生成をGH Actions+公開リポ`ig-images`へ分離。旧設計はprivate raw URL 404で原理的に不成立と判明 | `2026-07-21-checkout.md` |
| 07-23 | ig-images / buffer-refill | 07-22無人稼働は「前日画像」使用と実測確定（GH Actions約3h遅延でroutine追越）。画像生成を前日17:30 UTCへ前倒し根治（routine無変更） | `2026-07-23-checkout.md` |
