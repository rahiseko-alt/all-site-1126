# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-14] Flip QR Popout 調査（homepage エージェント）

### 出典・参照
- GSAP Flip 公式: https://gsap.com/docs/v3/Plugins/Flip/
- マスター提示 CodePen「flip-flair」（thumbnail↔full-size に同一 data-flip-id・`.container{pointer-events:none}`）

### Flip.from の主要オプション（逐語）
- `absolute` — FLIP 中に対象を position:absolute 化（flex/grid 崩れ回避）。
- `fade` — 同一 data-flip-id の異なる要素を入れ替える時 true でクロスフェード。
- `scale` — 既定は width/height、true で scaleX/scaleY。

### 設計判断
- 「枠ごと拡大」はホバー transform と衝突しジッター。homepage で `.qr-card:hover .qr-frame{translateY}` と `.enlarged{translate(-50%,-50%)}` が奪い合う事象を確認。
- 解決＝枠は残し img だけ data-flip-id で飛ばす＋拡大ステージ pointer-events:none。後者がジッター消去の核（カーソル無反応）。

### 検証
- GSAP/Flip は CDN。type="module" ではないが CDN 読込のため http-server 経由で確認。qr.svg は qrcode CLI で生成。
