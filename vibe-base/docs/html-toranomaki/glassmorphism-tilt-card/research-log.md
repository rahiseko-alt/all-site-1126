# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

## [2026-06-12] Glassmorphism Tilt Card コア技術調査（agent-ag）

### 調査対象
AI Officer HP Aバージョン（ダークテーマ）の「ガラスカード」UI。
Capabilities セクションに配置された4枚のカードに実装された視覚効果群を調査。

### ソースファイル
| ファイル | パス | 総行数 |
|---------|------|--------|
| HTML | `agent-ag/impl-gsap-3.12/index.html` | — |
| CSS | `agent-ag/impl-gsap-3.12/css/style.css` | 1016行 |
| JS | `agent-ag/impl-gsap-3.12/js/app.js` | 765行 |

### 調査手法
1. `style.css` L497–L650 の Capabilities Section ブロックを通読し、CSS技術を抽出
2. `app.js` L562–L685 の「3D Card Tilt」「Scroll-driven Animation」ブロックを通読しJS技術を抽出
3. `app.js` L51–L79 のカスタムカーソルセクション検知ロジックを確認
4. `style.css` L74–L85 のカーソル状態CSSと照合

### 抽出した7つのコア技術

| # | 技術名 | CSS出典 | JS出典 |
|---|--------|---------|--------|
| 1 | Glassmorphism基盤 | style.css L529–L530 | — |
| 2 | マウス追従スポットライト | style.css L571–L582 | app.js L579–L586 |
| 3 | ボーダーグロー（mask xor） | style.css L629–L646 | — |
| 4 | 背面画像パララックス透過 | style.css L541–L568 | app.js L602–L615 |
| 5 | 3D Tilt | style.css L527–L528 | app.js L588–L600 |
| 6 | スクロール連動フェード | style.css L508–L513 | app.js L652–L683 |
| 7 | セクション常駐カスタムカーソル | style.css L75–L85 | app.js L51–L79 |

### 発見した設計判断
- **ラッパー分離パターン**: ScrollTrigger の `scrub` によるトランスフォームとホバー時の3D Tilt トランスフォームが同一要素上で競合するため、`.capability-card-wrapper`（スクロール用）と `.capability-card`（ホバー用）に分離して解決している。この構造的判断は初期失敗パターンとして concept.md に記録。
- **glowColors配列**: JS側で4色をハードコードし `index % length` でループ。CSS変数 `--glow-color` 経由で `.card-bg-glow` と `.card-border-glow` の両方に反映される設計。
- **画像パララックス係数 -0.06**: マウス移動と逆方向に微量移動させることで、ガラス越しに奥の物体が動くような錯覚を演出。

### 未調査事項
- `data-cursor-shape` による形状バリエーション（circle/square/leaf/blob）の具体的CSS実装
- タッチデバイスでのフォールバック挙動
- Lenis スムーススクロールとScrollTriggerの連携設定
