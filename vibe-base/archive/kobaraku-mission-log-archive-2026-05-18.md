# MISSION_LOG — kobaraku

> このファイルは **kobaraku エージェント専用** です（Session 295 〜・MISSION_LOG 分散運用 v1.0）。
> - 司令塔エージェント・他 product エージェントの Check-out は書かないこと
> - 別エージェントから kobaraku 向けの依頼書は冒頭に追記してよい（Check-in で必ず読まれる）
> - 5 件超で `archive/mission-log-YYYY-MM-DD-sNNN-kobaraku.md` に退避

---

## Session 32 (2026-03-18) — 凍結解除+引き継ぎ準備

**担当:** vibe-base司令塔 (Opus)
**状態:** 引き継ぎ待ち

### 完了事項
- コバラク凍結解除（マスター承認済み）
- `CLAUDE.md` v1.0 作成（自治憲法）
- `pc-progress.md` 作成（PC表）
- MVP3本の内容把握完了

### 次のエージェントへの指示

**タスク: React(Vite)移行 + 3機能実装（P1#4 コア実装）**

#### 作業開始前に必ず読むファイル（順番厳守）
1. `products/kobaraku/CLAUDE.md` — 自治憲法（絶対原則・禁止事項）
2. `products/kobaraku/pc-progress.md` — PC表（現在地の把握）
3. `products/kobaraku/design-spec.md` — デザイン仕様
4. `C:/Users/user/Downloads/kobaraku-claude-code-instructions.md` — **React移行の最上位指示書**（プロジェクト構成・実装順序・共通コンポーネント定義）

#### MVP原本（UI/ロジック/Excel出力をそのまま再現せよ）
- `C:/Users/user/Downloads/kobaraku-mvp.html` — 相互チェック表MVP（500行）
- `C:/Users/user/Downloads/shokki-tanaoroshi-mvp-v3.html` — 食器棚卸記入表MVP（583行）
- `C:/Users/user/Downloads/tenant-uriage-mvp.html` — テナント売上MVP（744行）

#### 既存コード（統合先）
- `products/kobaraku/index.html` — 現行ダッシュボード（vanilla HTML, ~17KB）
- `products/kobaraku/kairan/` — 回覧機能（既存・稼働中）
- Vercel: `kobaraku.vercel.app` (project ID: `prj_kP5dOTB5xhdZUXwjLL2hlvy62equ`)

#### 実装順序（指示書準拠）
1. React+Viteプロジェクト初期化（`products/kobaraku/` 直下）
2. 既存ダッシュボード+スプラッシュ画面のReact移植
3. **②相互チェック** → **①食器棚卸** → **③テナント売上** の順で実装
4. 各機能のExcel出力ロジック移植（ExcelJS CDN→npm）
5. PWA設定
6. Vercel再デプロイ

#### 絶対禁止事項（CLAUDE.md準拠）
- MVPのUI/UXを勝手に変更するな
- バックエンドを作るな
- MVPに存在しない機能を追加するな
- ExcelJS以外のExcelライブラリを使うな
- CSSフレームワーク（Tailwind等）を導入するな
- 機能追加（食材棚卸等）はスコープ外

### 未解決事項
- なし。全情報は上記ファイル群に集約済み
