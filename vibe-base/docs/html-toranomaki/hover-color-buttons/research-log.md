# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-13] Hover Color Buttons 調査（homepage エージェント）

### 抽出元
homepage 本体（AI_OFFICER トップ）のナビ pill 多色化。`css/base.css` の `.nav-links li:nth-child(n) .nav-link:hover` で cyan/violet/pink を割り当てた実装を、単体デモ用に汎用化した。

### 設計判断
- 色の Single Source を「nth-child（並び順固定色）」と「インライン `--c`（任意色ボタン）」の2方式で提示。前者は固定ナビ向け、後者は動的リスト向け。
- CTA だけ既定塗りにして主従を作る手法は homepage の `.btn-connect`（既定白→hoverアクセント）を踏襲。

### 検証
- 外部依存ゼロ（Google Fonts のみ）。JS 不要のため `file://` でも描画可能だが、虎の巻規約に合わせ http-server 経由で確認。
