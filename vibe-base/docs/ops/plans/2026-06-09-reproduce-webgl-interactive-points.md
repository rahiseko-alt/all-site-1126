# Three.js webgl_interactive_points サンプルの再現デモ作成

Three.js の公式サンプル `webgl_interactive_points.html` に基づく、インタラクティブな 3D パーティクル（Points）演出を `agent-ag/` 配下に新規デモとして作成・再現します。

## User Review Required

> [!NOTE]
> - 本デモは外部の npm 依存を必要とせず、ES Modules（importmap + unpkg CDN）経由で Three.js をロードします。
> - パーティクルのテクスチャ画像（spark1.png等）のロード失敗や CORS 問題を防ぐため、HTML5 Canvas を用いてメモリ上で動的に「円形グラデーションスプライトテクスチャ」を生成・適用します。これにより、完全にオフラインまたはスタンドアロンで動作するロバストなデモを構築します。

## Open Questions

特になし。

## Proposed Changes

### agent-ag

#### [NEW] [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-interactive-points-demo/index.html)
- 3D パーティクルを描画する Three.js デモファイル。
- 頂点シェーダーとフラグメントシェーダーを定義する `ShaderMaterial` を使用。
- Raycaster によるマウスカーソルとの交差判定を実装し、交差したパーティクルのサイズと色を動的に変更。

#### [NEW] [server.mjs](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-interactive-points-demo/server.mjs)
- デモをローカルで動かすための軽量 HTTP サーバ。

---

## 実装ステップ

| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | `agent-ag/webgl-interactive-points-demo` が未作成であることを確認済 |
| 1 | `server.mjs` の新規作成 | implement-agent | sonnet | — | ファイル実在確認 |
| 2 | `index.html` の新規作成と Three.js パーティクル実装 | implement-agent | sonnet | — | ファイル実在および `node --check` 相当 of 構文検査 |
| 3 | 受入基準の機械検証 | verify-agent | haiku | @docs/ops/plans/2026-06-09-reproduce-webgl-interactive-points.md | サーバー起動、ファイル存在、基本構文確認 |
| 4 | 最終 Glob 照合 | orchestrator | opus | — | 全新規作成ファイルが指定場所に正しく配置されていること |

---

## リスク・トラブル想定とリカバリープラン

| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| Three.js CDN のロード失敗 | ブラウザコンソールエラー / 表示されない | 原則 2: バックアップ CDN (cdnjs または jsDelivr) にフォールバックするか、ローカルモジュールインポートに切り替え |
| Raycaster が Points を検知しない | ホバーしてもサイズや色が変わらない | 原則 2: `raycaster.params.Points.threshold`（交差判定の許容範囲しきい値）を調整し、判定感度を最適化 |

---

## 検証計画

### Automated Tests
- 作成したファイルの存在検証。
- 作成した JS/MJS ファイルの構文チェック (`node --check` 等)。

### Manual Verification
- コウヘイさんによるブラウザでの実機動作確認 (`http://localhost:3000` または自動ポートハンティング先)。
- マウスカーソルをパーティクル群に合わせた際、ポイントの拡大およびカラーシフトが発生すること。

---

## 受け入れ基準

- **EARS 1**: WHEN the local server is started and the client navigates to the page, THE SYSTEM SHALL display a 3D points cloud generated using Three.js.
- **EARS 2**: WHEN the mouse pointer hovers over a specific particle, THE SYSTEM SHALL scale up its size and modify its color dynamically matching the target demo interaction.
- **Checklist**:
  - [ ] `agent-ag/webgl-interactive-points-demo/index.html` が存在すること。
  - [ ] `agent-ag/webgl-interactive-points-demo/server.mjs` が存在すること。
  - [ ] `node --check` などの静的構文チェックが通ること。

---

## 承認後モード

acceptEdits（理由: 新規ファイル作成、および `implement-agent` と `verify-agent` で完結するため）
