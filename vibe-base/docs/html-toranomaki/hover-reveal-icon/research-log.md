# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-13] Hover Reveal Icon 調査（homepage エージェント）

### 抽出元
homepage 本体の QR ドック識別アイコン（`css/effects.css` `.qr-icon` → `.qr-dock-btn:hover .qr-icon`）。「黒塗りでは隠せない」というマスター指摘を受けて opacity:0 完全非表示へ切り替えた経緯をデモ化。

### 設計判断
- 暗色 fill による「黒塗り隠し」は背景差で薄く見えるため不採用。`opacity:0` が唯一の確実な非表示手段。
- 白 stroke 輪郭は視認の主因だったため撤去（homepage でも同様に撤去済み）。
- 出現は translateY(下→上) + scale + drop-shadow の同時補間で「浮き出る錯覚」を作る。

### 検証
- 外部依存ゼロ。JS 不要。http-server 経由で hover 出現・アイドル完全非表示を目視確認する。
