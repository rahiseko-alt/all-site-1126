# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-12] dennis-snellenberg-portfolio 調査（implement-agent）

### 概要
Dennis Snellenbergの再現デモ（dennis-snellenberg-portfolio）の構成要素、GSAPおよびLenisの統合インタラクションについて初期調査を実施。

### GSAPおよびLenisの連携動作
スムーズスクロールライブラリであるLenisのスクロールイベントをGSAPの `ScrollTrigger.update` に紐づけ、`gsap.ticker` に `lenis.raf` を追加することで、スクロール中のモーフィングやインタラクションが非常に同期度の高い形で動作することを確認した。

### マグネット効果の実装
マウスのホバーイベントを取得し、要素の境界矩形（getBoundingClientRect）から相対座標を算出して、GSAPの `to` アニメーションで吸着させるメカニズムが実装されている。特に、リリース時に `elastic.out(1.2, 0.4)` イージングを使用することで、心地よいゴム弾性的な動きが実現できている。
