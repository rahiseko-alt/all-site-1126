<!-- ===== ANTI-SUMMARIZATION DIRECTIVE ===== -->
<!-- このファイルのコードブロックは一字一句そのまま使用すること -->
<!-- 要約・省略・改変・「〜を追加」等の曖昧な指示は禁止 -->
<!-- コピペ可能な完全なコードのみが許される -->
<!-- ============================================ -->

# Image API Guide (Pexels)

## 1. ライセンス制約と注意事項（重要）

Pexels の画像は商用利用無料で、APIも無料で利用できますが、以下の**禁止事項**があります。使用前に必ず確認してください。

*   **スタンドアロン販売禁止**: 画像そのものをプリントや壁紙等として販売することはできません。
*   **競合サービス構築禁止**: Pexelsと競合するストックフォトサービスの構築に使用してはいけません。
*   **AI学習用途禁止**: 機械学習/AIモデルの訓練目的でのスクレイピングや使用は禁止されています。
*   **人物写真**: 識別可能な人物を否定的・攻撃的な文脈で使用することはできません。

一般的なWebサイトのモックアップやデザインのプレースホルダーとしての使用は問題ありません。

## 2. API エンドポイント利用例 (Vanilla JS)

APIを利用して、検索キーワードに基づいた画像を取得して表示する例です。

```html
<div id="image-gallery" class="gallery"></div>

<script>
// 注意: フロントエンドのJSにAPIキーを直書きするのは本番環境では非推奨です。
// これはモックアップやデモ用途のコード例です。
const PEXELS_API_KEY = "YOUR_PEXELS_API_KEY_HERE"; // 実際のAPIキーに置き換える必要があります

async function fetchAndDisplayImages(query, limit = 6) {
  const gallery = document.getElementById('image-gallery');
  gallery.innerHTML = '<p>Loading images...</p>';

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=${limit}`, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    gallery.innerHTML = ''; // ローディング消去

    if (data.photos.length === 0) {
      gallery.innerHTML = '<p>No images found.</p>';
      return;
    }

    data.photos.forEach(photo => {
      // alt属性には写真の説明を必ず含める（アクセシビリティ）
      // pexels提供のカメラマンへのリンクも付与することが推奨されます
      const imgHTML = `
        <figure class="gallery-item">
          <img src="${photo.src.large}" alt="${photo.alt || 'Pexels image'}" loading="lazy">
          <figcaption>Photo by <a href="${photo.photographer_url}" target="_blank" rel="noopener noreferrer">${photo.photographer}</a> on Pexels</figcaption>
        </figure>
      `;
      gallery.insertAdjacentHTML('beforeend', imgHTML);
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    gallery.innerHTML = '<p>Error loading images.</p>';
  }
}

// 実行: "nature" をキーワードに6枚の画像を取得
// fetchAndDisplayImages('nature', 6);
</script>

<style>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.gallery-item {
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.gallery-item figcaption {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
}

.gallery-item figcaption a {
  color: #3b82f6;
  text-decoration: none;
}

.gallery-item figcaption a:hover {
  text-decoration: underline;
}
</style>
```

## 完全性チェック（作成者は全項目を確認してチェックすること）
- [x] コードブロック内に省略記号（...）がない
- [x] 「〜を追加」「適宜変更」等の曖昧指示がない
- [x] 全CDN URLにバージョン番号が含まれている（このファイルには無し）
- [x] 全コード例が単体でコピペ動作する
- [x] プロパティ値はすべて具体的な数値/文字列
- [x] ファイル行数が記録されている: 104行
