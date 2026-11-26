## AG Task 6 + Check-out + 検証（2026-03-02）— アクセシビリティ仕上げ

- **結果:** 受入条件 7/7 Pass。逸脱なし。Flash Fast 実行。prefers-reduced-motion 追加 + aria-label×4 + loading="lazy" + role="alert"。チャンク 34.17kB（ベースライン比+0.16kB）。5タスク連続逸脱ゼロ。品質改善スプリント全6タスク完了。

---

## AG Task 5 + Check-out + 検証（2026-03-02）— mobile-layout.jsx パフォーマンス改善

- **結果:** 受入条件 7/7 Pass。逸脱なし。Flash Fast 実行。ALLERGEN_MAP 巻き上げ + warningsMap useMemo 化。チャンク 34.01kB（ベースライン比+0.10kB）。4タスク連続逸脱ゼロ。

---

## AG Task 4 + Check-out + 検証（2026-03-02）— desktop-layout.jsx パフォーマンス改善

- **結果:** 受入条件 8/8 Pass。逸脱なし。Pro Planning 実行。soundEnabled useRef化 + 冗長loadOrders削除 + Promise.all並列化。チャンク 46.39kB（ベースライン比+0.04kB）。3タスク連続逸脱ゼロ。

---

## AG Task 3 + Check-out + 検証（2026-03-02）— app.jsx コード分割（React.lazy + Suspense）

- **結果:** 受入条件 6/6 Pass。逸脱あり: `onAdminAccess` ハンドラを追加（スコープ外）。技術的に正しいため残存。Flash Fast 実行。

---

## Claude Check-out: 2026-03-02 — AG調教ルール策定 + スキル駆動フロントエンド監査

- **変更ファイル:** `CLAUDE.md`
- **実装概要:**
  - **CLAUDE.md v1.5:** §2-8「AG マイクロタスク方式」を新設。1タスク=1 Check-out、タスク指示テンプレート、証拠付き Check-out フォーマット、逸脱時ルールを追加。§2-5/§3/§4 に参照追加。
  - **スキル駆動フロントエンド監査:** `vercel-react-best-practices`（57ルール）と `web-design-guidelines` で Aiueo フロントエンド全15ファイルを監査。
- **エラー回数:** 0回

---

## Claude Check-out: 2026-03-02 — HTTPS化 + DB移行 + 実機UAT全Pass

- **変更ファイル:** サーバー側 `/etc/caddy/Caddyfile`, `/pb_data/data.db`
- **実装概要:** Caddy HTTPS化 + DB再アップロード + Vercel再デプロイ。実機UAT全Pass。
- **エラー回数:** 0回

---

## AG Task 1 + Check-out + 検証（2026-03-02）— index.html + グローバル CSS

- **結果:** 受入条件 8/8 Pass。逸脱あり: desktop-layout.jsx スコープ外変更 → ReferenceError → revert。mobile-layout.jsx 数量UI追加は残存。

---

## AG Task 2A + Check-out + 検証（2026-03-02）— セマンティック HTML + aria-label

- **結果:** 受入条件 5/5 Pass。逸脱なし。Flash Fast 実行。

---

## AG Task 2B + Check-out + 検証（2026-03-02）— window.prompt() → カスタムパスワード UI

- **結果:** 受入条件 6/6 Pass。逸脱なし。Pro Planning 実行。JSX 仕様を正確に再現。

---

## Claude Check-out: 2026-03-01 — バックエンドクラウド移行設計 + AG作業指示

- **現状:** マスター指示により、バックエンドを Oracle Cloud Free Tier に移行することが決定。AG が単独で実装を完了する。Claude は最終確認のみ参加。
- **エラー回数:** 0回

### AGへ：バックエンドを Oracle Cloud Free Tier に移行してください

**背景と経緯（必読 → `docs/backend-hosting-decision.md`）**

現在のバックエンドはマスターのPC上でPocketBase + Cloudflare Tunnelを起動する構成。ターミナルを閉じるとアプリが使えなくなる。マスターの要件は「いつでも誰でもどこからでもデモ版を触れる状態」。今後複数アプリを開発予定のため、全アプリのバックエンドを1台のVPSに集約して永久無料で常時稼働させる。

**決定事項:**
- ホスティング: **Oracle Cloud Free Tier**（AMD VM.Standard.E2.1.Micro / 1GB RAM / 永久無料）
- 理由: PocketHost は $5/月/アプリで複数アプリに不向き。Oracle なら全アプリを1台に集約し永久無料
- Daddy型（ローカルPocketBase）への移行も容易（同じPocketBase + SQLite）
- **変更:** Ampere (ARM) 在庫枯渇のため AMD Micro に変更（Claude Opus 承認済み）

**作業内容:**

#### Phase 1: Oracle Cloud セットアップ（マスターにナビゲーション）
1. Oracle Cloud アカウント作成をナビゲート
2. Always Free の **AMD VM.Standard.E2.1.Micro** インスタンス作成をナビゲート
3. セキュリティリスト（ポート開放: 80, 443）設定をナビゲート

#### Phase 2: サーバー構築（マスターにナビゲーション）
1. SSH接続をナビゲート
2. **2GB Swap を追加**（OOM 安全弁）
3. PocketBase をインストール（**AMD64版バイナリ**）
3. リバースプロキシ（Caddy 推奨）でHTTPS化
4. PocketBase を systemd サービスとして常時起動設定
5. ローカルの `pb_data/data.db` をサーバーにアップロード
6. マイグレーション（11ファイル）が正常に適用されていることを確認

#### Phase 3: フロントエンド接続変更
1. `.env.production` の `VITE_PB_URL` を Oracle Cloud の URL に変更
2. `vite.config.js` のランタイムキャッシュ設定を新URLに対応
3. `backend/seed.js` のエンドポイントを環境変数化
4. Vercel 再デプロイ

#### Phase 4: 全機能検証（マスターと実施）
以下の全機能を本番URLで確認:
- メニュー表示・カート・オーダー送信
- 言語切替（日英中）
- 管理画面（Daddy権限）アクセス
- QRコード認証（role_tokens）
- 消費税計算・CSV出力
- 通知音（WebAudio）
- Realtime（新規オーダーのリアルタイム反映）
- **マスターのPCターミナルが閉じた状態で全機能が動作すること**

#### Phase 5: ドキュメント更新
1. `docs/manifesto.md` §2 に「デモ版（クラウド）と本番版（Daddy）の二層構成」を追記
2. CLAUDE.md にバックエンド移行時の安全ルールを追加
3. MISSION_LOG に Check-out を記載

---

## AG Check-out: 2026-03-01 — Oracle Cloud移行及びUAT検証での不具合報告（Claudeへバトンタッチ）

- **現状:** バックエンド（PocketBase）の Oracle Cloud への移行、および Vercel フロントエンドからの接続切り替え作業（デプロイ）を完了。接続自体は正常に確立され、言語切替・注文・通知音・リアルタイム同期などが正常動作することを確認した。
  しかし、マスターによる最終的なUAT確認において、フロントエンド画面側に以下の **4つの未解決バグ** が発見されたため、ここで作業を中断し Claude Code に修正対応を引き継ぐ。
- **次のステップ:** Claude Code に手動で切り替え、以下のバグの根本原因の特定と改修を依頼する。
- **発見された不具合一覧:**
  1. オプション遷移の強制
  2. 連打注文の阻害
  3. アレルギーフィルターのクラッシュ
  4. ダッシュボードとセールスの集計不一致
