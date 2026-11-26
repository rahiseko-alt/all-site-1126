# design-yardstick — judge の ものさし実例（golden set）

WEBデザイン手順化フロー（`docs/standards/web-design-flow.md`）の judge（LLM-as-a-Judge）が照合する **正本基準**。出自＝障害者雇用LP（`tmp/lp-shogaisha-koyo/` から恒久化）。

| ファイル | 期待ラベル | 理由 |
|---------|----------|------|
| `index.html` | **FAIL（金太郎飴）** | 平凡な縦スクロール骨格・素CSS・統計平均・最新技術ゼロ。マスター「クソ最悪」却下の第1版 |
| `pro-2.html` | **FAIL（金太郎飴）** | 機構は載っているが骨格が定型（全幅ブロックを縦に通過）。**機構の有無では判定しない**ことの実証例 |
| `pro-3.html` | **FAIL（金太郎飴）** | 同上 |
| `pro-1.html` | **PASS（良）** | スクロール・操作・次元のいずれかを再発明（骨格パラダイム合格）＋コンセプト目的に整合 |

## 使い方
- judge は提出物を本 golden set と照合し PASS/FAIL を返す（rubric＝web-design-flow.md 設定2）。
- judge のラベルがマスターのラベルと 75-90% 一致したら運用化。**最終判定は常にマスター**。
- 新たな良/ダメ実例が出たら本ディレクトリに追加学習させる（judge 誤判定時のリカバリ＝plan C-5）。
