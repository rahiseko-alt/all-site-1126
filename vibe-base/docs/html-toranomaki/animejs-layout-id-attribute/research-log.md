# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-16] animejs-layout-id-attribute 調査（遡及記録）

> 本エントリは research-log.md 欠落の補完として、既存実装 `impl-animejs-v4/` から逆算して記述した遡及記録である。当時の調査日・参照タイムスタンプは確認できないため記載しない。確認できた事実（実装ファイルの内容と Anime.js v4 公式 API）のみを記す。

### 技術選定理由（逆算）
- 要件は「DOM ツリー上の別コンテナにある要素同士を、1 つの要素が移動しているかのようにシームレスにアニメーションさせる」こと（concept.md 概要）。
- これは FLIP（First / Last / Invert / Play）テクニックそのものであり、Anime.js v4 が公式に提供する `createLayout` がレイアウト変化の前後差分を自動計測して FLIP を実行するため、手書きの座標計算が不要になる。
- 同一要素扱いの橋渡しは `data-layout-id` 属性で実現する。別コンテナの要素に同じ ID を割り当てると、Anime.js が「同一の論理要素」として補間する設計（concept.md「マジックの仕組み」）。
- GSAP MorphSVGPlugin は SVG パスのモーフィング用であり、本テーマの DOM 要素のコンテナ間移動という要件には用途が合致しないため不採用（本テーマでは参照していない）。

### 参照した公式 API
- Anime.js v4 `createLayout(target)`: レイアウトのルート要素を監視対象に登録する。impl では `createLayout('.layout')`（出典: impl-animejs-v4/js/app.mjs L7）。
- `layout.update(callback)`: コールバック内で DOM を変更すると、変更前後の位置・サイズ差分から FLIP アニメーションを自動生成する。impl では callback 内で `.item` を container 間に `appendChild` で移し替える（出典: impl-animejs-v4/js/app.mjs L11-L20）。
- `utils.$(selector)`: Anime.js v4 のセレクタユーティリティ。impl では Swap ボタン取得に使用（出典: impl-animejs-v4/js/app.mjs L1, L3）。
- CDN 解決は `https://esm.sh/animejs`（ESM）。`type="module"` 前提のため `file://` 不可・ローカルサーバー経由必須（出典: impl-animejs-v4/index.html L26、RULES.md §1 落とし穴）。

### 再現の要点
- HTML: `.layout` ルート配下に `.container-a` / `.container-b` の 2 コンテナを置き、各コンテナ内の `.item` に `data-layout-id="item-A"` / `"item-B"` を付与する（出典: impl-animejs-v4/index.html L12-L19）。
- JS: `createLayout('.layout')` 後、ボタンクリックで `layout.update()` を呼び、callback 内で両コンテナの `.item` を相互に `appendChild` して入れ替える（出典: impl-animejs-v4/js/app.mjs L7-L22）。
- CSS の落とし穴: `backdrop-filter` をコンテナ本体に直接かけると、子要素が GPU レイヤー昇格／解除を経た際に Windows ClearType でテキスト再ラスタライズが崩れる。`backdrop-filter`（ガラス効果）は `.layout-container::before` 疑似要素に分離して子要素の描画に干渉させない（出典: impl-animejs-v4/css/style.css L38-L64）。
- 動作確認は ESM のためローカルサーバー必須（impl 同梱の server.mjs、または scripts/toranomaki-blindtest.mjs が自動起動）。
