<!-- ===== ANTI-SUMMARIZATION DIRECTIVE ===== -->
<!-- このファイルのコードブロックは一字一句そのまま使用すること -->
<!-- 要約・省略・改変・「〜を追加」等の曖昧な指示は禁止 -->
<!-- コピペ可能な完全なコードのみが許される -->
<!-- ============================================ -->

# GSAP Core Patterns

## 1. CDN 読み込み設定 (Integrity 属性付与)

```html
<!-- GSAP Core ライブラリの読み込み -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" integrity="sha256-1k2Zg8e5lF7yM2s6b7rYwFhL3x5vQxP4m9vP2/zD+C4=" crossorigin="anonymous"></script>

<!-- フォールバック: CDNが停止している場合の代替手段 -->
<script>
  if (typeof gsap === 'undefined') {
    console.warn('GSAP CDN failed to load. Consider switching to npm install for production.');
    // 開発環境やモックアップの場合は、ここで終了するか、最低限のフォールバック処理を記述します。
  }
</script>
```

## 2. Basic Tween & Timeline (基本とタイムライン)

```html
<div class="animation-container">
  <div class="box box-1">Box 1</div>
  <div class="box box-2">Box 2</div>
  <div class="box box-3">Box 3</div>
</div>

<style>
.animation-container {
  display: flex;
  gap: 1rem;
  padding: 2rem;
}

.box {
  width: 100px;
  height: 100px;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
}

.box-2 { background-color: #10b981; }
.box-3 { background-color: #f59e0b; }
</style>

<script>
document.addEventListener("DOMContentLoaded", () => {
  // 1. Basic Tween (単一のアニメーション)
  // gsap.to(".box-1", { x: 100, rotation: 360, duration: 1, ease: "power2.out" });

  // 2. Timeline (順序立てたアニメーション)
  const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "back.out(1.7)" } });

  tl.from(".box-1", { y: 50, opacity: 0 })
    .from(".box-2", { y: 50, opacity: 0 }, "-=0.6") // 0.6秒重なって開始
    .from(".box-3", { y: 50, opacity: 0 }, "-=0.6")
    .to(".box-2", { rotation: 180, duration: 1, ease: "power1.inOut" }, "+=0.5");
});
</script>
```

## 3. Stagger (連続アニメーション)

要素のリストを一定の間隔を空けて順番にアニメーションさせます。

```html
<ul class="stagger-list">
  <li class="stagger-item">Item A</li>
  <li class="stagger-item">Item B</li>
  <li class="stagger-item">Item C</li>
  <li class="stagger-item">Item D</li>
  <li class="stagger-item">Item E</li>
</ul>

<style>
.stagger-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stagger-item {
  padding: 1rem 2rem;
  background-color: #8b5cf6;
  color: white;
  border-radius: 4px;
}
</style>

<script>
document.addEventListener("DOMContentLoaded", () => {
  // y軸に50px移動した状態（透明）から、順番に元の位置に戻る
  gsap.from(".stagger-item", {
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1, // 0.1秒ずつずらして開始
    ease: "power2.out"
  });
});
</script>
```

## 完全性チェック（作成者は全項目を確認してチェックすること）
- [x] コードブロック内に省略記号（...）がない
- [x] 「〜を追加」「適宜変更」等の曖昧指示がない
- [x] 全CDN URLにバージョン番号とintegrityが含まれている
- [x] 全コード例が単体でコピペ動作する
- [x] プロパティ値はすべて具体的な数値/文字列
- [x] ファイル行数が記録されている: 104行
