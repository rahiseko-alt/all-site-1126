# Buffer キュー補充 routine — 確定プロンプト & セットアップ手順

> plan: `~/.claude/plans/zippy-snuggling-pnueli.md`（Buffer キュー補充型 routine・無人パイプライン最小実証 MVP）
> 目的: PC の電源・起動に一切依存せず、週次クラウド routine が「記事生成 → Buffer API に addToQueue」を無人で回す。配信（Buffer → SNS）は Buffer が自動処理（配信経路は 2026-07-15 に手動 Share Now で実証済）。
> 対象チャンネル（MVP）: **X `kosehirax` 1本のみ**（channelId `6a5705b280cc80cdcab7f6b4`）。Threads/Instagram は後続（スコープ外）。
>
> **本ファイルは初期MVP版・参考資料扱い**（現行の最新プロンプトは routine 本体 `trig_01WuxHeHMYZDxqV2iMtmVPGZ` に格納済）。2026-07-16時点で X 2本/Threads 2本/Instagram 1本（channelId `6a57413d80cc80cdcab9f216`・画像は静的`https://ig-card-eta.vercel.app/card.jpg`固定・動的レンダリングは本番timeoutで凍結中）を毎日補充する構成に拡張済み。詳細→ `docs/session-reports/2026-07-16-checkout-3.md`（予定）／plan: `~/.claude/plans/lucky-hatching-clover.md`。

---

## セットアップ手順（マスター実行・claude.ai/code の UI 操作）

| # | 手順 | 完了条件 |
|---|---|---|
| 1 | cloud environment を新設。環境変数に `BUFFER_API_TOKEN=<token>` を登録（.env 形式・クォート無し・値はローカル `C:\Users\user\buffer-api-token.txt` からコピペ） | environment に `BUFFER_API_TOKEN` 登録済 |
| 2 | 同 environment の Network access を **Custom** にし、Allowed domains へ `api.buffer.com` を追加（"Also include default list" をチェック） | `api.buffer.com` 許可済 |
| 3 | routine 新規作成: リポジトリ=`rahiseko-alt/vibe-base`（クローン用・改変しない）／environment=#1／プロンプト=下記／トリガー=**まず作らず "Run now" で手動実行** | routine 作成済 |
| 4 | **Stage 1（draft 実証）**: 下の「Stage 1 プロンプト」で "Run now"。transcript に `PostActionSuccess` + post.id が出て、Buffer 管理画面に draft が実在することを確認 | draft 出現・応答 PASS |
| 5 | **Stage 2（live 実証）**: 下の「Stage 2 プロンプト」で "Run now"。Buffer キューに積まれることを確認（配信は Buffer 任せ） | キュー登録成功 |
| 6 | **Stage 3（無人化）**: routine に週次スケジュール trigger（週1・最小間隔1時間以上）を付与 | 週次 trigger 登録済 |

トークン非露出の鉄則: 値はこのファイルにも chat にも貼らない。cloud environment の環境変数にのみ存在させる。

---

## Stage 1 プロンプト（draft・X に出さない）

```
あなたは中小企業経営者向けの「AI活用・業務効率化 顧問」です。
以下のルールで X 向けの投稿を1本だけ日本語で生成し、Buffer のキューに追加してください。

【生成ルール】
- 40〜140字。ですます調。二人称は「御社」。
- URL・絵文字・ハッシュタグ・@メンションは使わない。
- 「絶対・100%・必ず・最強」等の誇大表現は禁止。
- 題材: 中小企業の業務改善・生産性・AI活用の実務Tips。末尾は「御社の◯◯は？」型の問いかけで締める。

【Buffer への追加（環境変数 $BUFFER_API_TOKEN を使用）】
生成した本文を text に入れ、node で次の GraphQL mutation を https://api.buffer.com に POST する:
- headers: Content-Type: application/json / Authorization: Bearer $BUFFER_API_TOKEN
- mutation createPost(input:{
    text: <生成本文>,
    channelId: "6a5705b280cc80cdcab7f6b4",
    schedulingType: automatic,
    mode: addToQueue,
    assets: [],
    saveToDraft: true
  }) { __typename ... on PostActionSuccess { post { id status text } } ... on InvalidInputError { message } ... on UnauthorizedError { message } ... on LimitReachedError { message } }

【報告】
返ってきた __typename・post.id・status・生成した本文を、そのまま出力せよ。$BUFFER_API_TOKEN の値は絶対に出力するな。
```

---

## Stage 2 プロンプト（live・自動配信）

Stage 1 との差分は **`saveToDraft: true` の行を削除するだけ**。他は完全に不変。

```
（Stage 1 プロンプトの createPost input から `saveToDraft: true` の1行を削除したもの）
```

---

## 判定基準（AI がクラウド transcript で確認）

- Stage 1: transcript に `PostActionSuccess` と `post.id` が出る／`InvalidInputError`・`UnauthorizedError`・`LimitReachedError` でない。
- Stage 1: Buffer 管理画面に当該 draft が実在（マスター目視）。
- Stage 2: `saveToDraft` 無しで Buffer キューに積まれる（`PostActionSuccess`・status が scheduled 系）。
- 全 Stage: transcript に token 実値が出ていない。

## トラブル時の切り分け

| 応答 | 意味 | 対処 |
|---|---|---|
| `UnauthorizedError` | token 不正/未設定 | environment の `BUFFER_API_TOKEN` を再確認 |
| `LimitReachedError` | 無料プラン キュー10件上限 | 既存キューを消化 or 一時的に上限内へ |
| ネットワークエラー | `api.buffer.com` 未許可 | Network access Custom の Allowed domains を再確認 |
| `InvalidInputError` | channelId/enum 誤り | channelId `6a5705b280cc80cdcab7f6b4`・enum を確認 |
