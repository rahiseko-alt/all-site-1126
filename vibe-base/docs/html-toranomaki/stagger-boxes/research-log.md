# research-log.md — Stagger Boxes（ウェーブリボン）

## 出典

- CodePen wvMgXxN "Content Transition using GSAP3 and ScrollTrigger"（Elegant Seagulls）
- 元ソース取得物: `agent-ag/tmp_codepen/`（source.html / source.css / source.js）

## 再現方針

agent-ag 提出物（`agent-ag/stagger-boxes-demo/`）をコピーせず、効果を解析して司令塔が自書きで再現した。

| 項目 | 元実装 | 本再現 |
|------|--------|--------|
| 棒の生成 | 静的 `<div class="box">` ×100 手書き | JS で `BAR_COUNT=100` ループ生成（FOUC 回避・本数を1定数で可変化） |
| GSAP | 3.12.2 | 3.12.5（虎の巻 GSAP 系の統一版） |
| 効果ロジック | xPercent100 ＋ rotation 45→0 の stagger 3トラック | 同一（忠実再現） |
| コメント | なし | 各トラックの役割を日本語注釈 |

## 検証ログ

- puppeteer 自己検証: GSAP / ScrollTrigger ロード成功・棒100本生成・JS エラーなし（404 は favicon のみ）
- 静止時スクショ: 左半分に dark 棒積層・「SCROLL DOWN」出現
- スクロール中盤スクショ: 棒が時間差スライド＋45°回転でカーブしたリボン状のうねりを形成・「SCROLL UP」露出
- 元 CodePen の挙動と一致を確認

## 学び

- `stagger: { amount: N }` は「総時間 N 秒に均等配分」。要素数非依存で総尺が一定になるため、本数を増やしてもタイムライン設計を変えずに密度だけ上げられる。
- 同一ターゲットへの複数トラック（スライド／傾け／戻し）の position 引数（`0` / `1`）ずらしが、うねりの波形を生む鍵。
