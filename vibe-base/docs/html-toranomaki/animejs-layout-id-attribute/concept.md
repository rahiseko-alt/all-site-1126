# Anime.js Layout ID Attribute 虎の巻

## 概要

Anime.js (v4) の `createLayout` と `data-layout-id` 属性を活用することで、DOMツリー上の異なるコンテナ間に存在する要素が、まるで1つの要素が移動しているかのようにシームレスなアニメーション（FLIPアニメーション）を実現できます。

## マジックの仕組み

1. **同一IDの割り当て**: 異なる親コンテナに配置された2つの要素（例えばコンテナAのアイテムとコンテナBのアイテム）に、同じ `data-layout-id` を付与します。
   ```javascript
   $itemA1.dataset.layoutId = "item-A";
   $itemA2.dataset.layoutId = "item-A";
   ```

2. **表示状態のトグル**: 常に一方が表示され、もう一方が非表示（`is-hidden` で `display: none;`）になるように状態を管理します。

3. **`createLayout` による監視と更新**:
   親要素である `.layout` に対して `createLayout` を適用し、`layout.update()` のコールバック内で表示状態を切り替えます。
   ```javascript
   const layout = createLayout('.layout');

   function animateLayout() {
     layout.update(({ root }) => {
       $itemA1.classList.toggle('is-hidden');
       $itemA2.classList.toggle('is-hidden');
     });
   }
   ```

## 何が起きているのか？ (FLIPアニメーション)

`layout.update()` が実行されると、Anime.js は内部で **FLIP** (First, Last, Invert, Play) テクニックを使用してアニメーションを自動計算します。

1. **First**: 変更前の要素の位置・サイズを記録する
2. **Last**: 表示・非表示を切り替えた後の「最終状態」の位置・サイズを計算する
3. **Invert**: 最終状態から初期状態へ要素を瞬時に戻す（Transformを適用）
4. **Play**: Transformを解除して、最終状態へ向けてアニメーションさせる

同じ `layout-id` を持つ要素同士は、内部的に「同じ要素」として扱われます。そのため、DOMツリー上は別々の要素であっても、非表示になった要素から表示された要素への橋渡し（Transformによる補間）が行われ、要素がコンテナ間で「移動」しているように見えるのです。
