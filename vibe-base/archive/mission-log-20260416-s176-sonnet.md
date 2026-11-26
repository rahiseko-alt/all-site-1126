## Sonnet Check-out: 2026-04-16 (Session 176) — ai-concierge FAQマッチング完全失敗バグ修正

### 実施内容
1. **真因特定（Opus調査済み）の引き継ぎ実装**:
   - `products/ai-concierge/app/api/_lib/openai.js` の `const prompt` テンプレートを全面簡略化
   - 削除: `<language_lock>`（6 STEP）・`<few_shot_examples>`（14例・4言語）・`<rules>`（10項目）・`# FINAL REMINDER`
   - 新プロンプト: 6ルール + Persona + Knowledge Base + 多言語拒否フレーズのみ（約25行）
   - 関数シグネチャ・chat.js・detectLang・try/catch・フォールバック処理はすべて無変更

2. **検証結果（全5問 PASS）**:
   - TEST 1 こんにちは → 日本語の挨拶（PASS）
   - TEST 2 営業時間について → 「平日7:00〜20:00、土日祝日8:00〜21:00」含む日本語応答（PASS）
   - TEST 3 予約できますか → FAQ「予約はできますか？」ベースの回答（PASS）
   - TEST 4 政治についてどう思いますか → 日本語の拒否フレーズ（PASS）
   - TEST 5 Hello → 英語の挨拶（PASS）
   - ※ --data-raw は Windows CP932 で化けて 400 が出る。実テストは Unicode escape + --data-binary で実施

3. **コミット**: `8d71189` — 1ファイル変更、21行追加、113行削除
4. **デプロイ**: `https://ai-answer.kouheikosehira.com` (Production, Vercel)

### 未解決事項
- **chat.js L143 で `tenantApiKey`（5番目引数）を `generateResponse` に渡していない**: 顧客管理プランで顧客が自分の OpenAI キーを設定しても使われない設計バグ。今回のスコープ外。次セッションでマスターに相談すること
- **PC表更新**: P2「AI応答品質バグ修正」タスクの追加・完了記録をマスター相談後に行う（計画ファイルの指示で今回は触らず）

### 変更ファイル
- `products/ai-concierge/app/api/_lib/openai.js`（prompt 簡略化）

### 次エージェントへ
1. ai-concierge のデモサイトは修正済みで正常稼働中
2. `chat.js` L143 の `tenantApiKey` 未渡しバグをマスターに報告して修正可否を確認せよ
3. PC表の P2 セクション更新はマスターと相談してから実施

### PC表バージョン: v2.3（未更新）
### エラー回数: 1回（--data-raw の Windows エンコード問題で TEST 2/3 が誤 FAIL → Unicode escape で解消）
