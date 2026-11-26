# WebGL Fluid Simulation クローン＆自動巡回実装ノウハウ

WebGL 流体シミュレーションのクローン構築、不要なプロモーション要素の排除、および「自然で美しい自動巡回（Idle Autoplay）」の実装において得られた技術的ノウハウとコードの解説を詳細に記録します。

---

## 1. 概要と目的
本プロジェクトは、`PavelDoGreat/WebGL-Fluid-Simulation` をベースに、Web サイトの背景や演出パーツとして即座に流用（丸パクリ）可能なクリーンなデモを構築することを目的としました。

特に、**「機械的でチープなループ（単調な円運動や同じ位置へのドロップ）を排除し、永続する有機的で美しい流体のうねりを自動生成する」** という要求を満たすため、多重サイン波合成と HSV 色相回転によるオートパイロット（自動巡回）アルゴリズムを設計・実装しました。

---

## 2. クローンとクリーンアップのノウハウ
本家のコードはモバイルアプリのプロモーションポップアップや Google Analytics トラッキング、Twitter/Discord 等へのソーシャルボタンが組み込まれています。これらを排除して純粋な流体シミュレーションに特化させました。

### ① dat.GUI の CDN 化による依存ファイルの削減
本家はローカルに `dat.gui.min.js` を配置していましたが、これを CDN 経由に書き換え、リポジトリ内の不要な依存ファイルを削減しました。
```html
<!-- index.html -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.9/dat.gui.min.js"></script>
```

### ② プロモーション・トラッキングコードの排除
`script.js` 内の以下の不要コードをクリーンアップしました。
- アプリストア誘導ポップアップ制御ロジック (`promoPopup`, `appleLink`, `googleLink`)
- Google Analytics イベント送信 (`ga(...)` の全呼び出し)
- dat.GUI 下部の Discord, Twitter, Mobile App リンク追加コード (`startGUI` 内)

---

## 3. 自然な自動巡回（Autoplay）アルゴリズム
自動で流体を掻き回し続けるための「見えない自動ポインタ（AutoPointer）」の設計ノウハウです。

### ① 多重サイン・コサイン波合成による「カオス的軌跡」
単一のサイン波による円運動や往復は「機械的」でチープに見えてしまいます。そのため、**周波数の異なる 3 つのサイン・コサイン波を掛け合わせる（多重合成）** ことで、二度と同じ軌跡を通らないカオス的で滑らかなノイズ風軌跡を生成しました。

#### 軌跡計算ロジック（`script.js` 内の実装）
```javascript
class AutoPointer {
    constructor(id, seedX, seedY, speedX, speedY) {
        this.id = id;
        this.seedX = seedX;
        this.seedY = seedY;
        this.speedX = speedX;
        this.speedY = speedY;
        this.x = 0;
        this.y = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.hue = Math.random() * 360;
    }

    update(t, width, height) {
        this.prevX = this.x;
        this.prevY = this.y;

        // 3つの異なる周波数のサイン波を合成し、周期性を崩す（自然なうねり）
        let xOffset = Math.sin(t * this.speedX + this.seedX) * 0.35;
        xOffset += Math.sin(t * this.speedX * 2.3 + this.seedX * 1.5) * 0.1;
        xOffset += Math.cos(t * this.speedX * 0.7 - this.seedX * 0.5) * 0.05;

        let yOffset = Math.cos(t * this.speedY + this.seedY) * 0.35;
        yOffset += Math.cos(t * this.speedY * 1.9 + this.seedY * 1.2) * 0.1;
        yOffset += Math.sin(t * this.speedY * 0.6 - this.seedY * 0.8) * 0.05;

        // 画面中央を中心とした範囲（セーフエリア）にマッピング
        this.x = (xOffset + 0.5) * width;
        this.y = (yOffset + 0.5) * height;

        // 色相を毎フレーム回転させ、色彩をオーロラのように変化させる
        this.hue = (this.hue + 0.15) % 360;
    }

    getColor() {
        return HSVtoRGB(this.hue / 360, 1.0, 1.0);
    }
}
```

### ② 速度に比例した自然な流体力（Splat）の供給
流体に対して「速度」を与えないと、綺麗なうねり（渦）が発生しません。
自動ポインタの「前フレームの座標（`prevX, prevY`）」と「現在の座標（`x, y`）」の差分を算出し、移動ベクトル `dx`, `dy`（速度）を動的に計算して `splat` 関数に渡します。
```javascript
const dx = (autoPointer.x - autoPointer.prevX) * 8.0; // 慣性を強調するため係数を乗算
const dy = (autoPointer.y - autoPointer.prevY) * 8.0;
const color = autoPointer.getColor();

// 流体シミュレーションに力を供給
splat(autoPointer.x, autoPointer.y, dx, dy, color);
```
これにより、ポインタの移動速度が上がると大きな渦が生まれ、速度が落ちると細かなうねりになるという、物理的に極めて自然な力加減が再現されます。

### ③ HSV 色相回転による緩やかな色彩変化
インクの色が固定されていると見飽きてしまいます。ポインタごとに個別の `hue`（色相）を保持し、毎フレームゆっくりと回転させることで、吐き出される流体が時間とともに赤→黄→緑→青→紫とグラデーション変化し続けるため、永続的に見ていられる美しいビジュアルアートが完成します。

#### HSV から RGB への変換関数
```javascript
function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return { r, g, b };
}
```

---

## 4. シームレスな移行と入力検知（アイドル判定）
自動巡回とユーザーインタラクション（マウス/タッチ操作）が干渉しないよう、以下のロジックで制御します。

1. **`lastInputTime = Date.now()`** を保持。
2. マウスの移動やタッチなどのすべてのイベントが発生した際、`lastInputTime` を現在時刻に更新。
3. `update` ループ内で経過時間 `Date.now() - lastInputTime` を判定。
   - **3秒未満（操作中）:** 通常通り、ユーザーの手元のポインタ位置のみを描画。
   - **3秒以上（アイドル状態）:** 自動ポインタ（5個）を駆動し、自動 splat を適用。
4. ユーザーが再び画面を操作した瞬間、アイドル状態が即座に解除され、自動巡回はピタッと停止してマウス追随に戻ります。

---

## 5. テスト用静的サーバー（`server.mjs`）のネイティブ実装
CORSエラー（WebGL のアセット読み込み等で発生しやすいセキュリティ制約）を防止しつつ、余分な外部パッケージ（Express等）に依存しないよう、Node.js 標準の `http`, `fs`, `path` モジュールのみで静的サーバーを実装しました。

### ① セキュリティと CORS 対応ヘッダーの付与
ディレクトリトラバーサル脆弱性を防ぐためのセーフティパス解決と、開発時に便利な CORS ヘッダーを付与しています。
```javascript
res.writeHead(200, { 
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private'
});
```

### ② ポートの自動ハント機能
ポートが他プロセス（Vite開発サーバーや別デモなど）で使用中の場合にクラッシュするのを防ぐため、自動でポートを繰り上げるエラーハンドラを実装しました。
```javascript
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is occupied. Trying port ${port + 1}...`);
        startServer(port + 1); // 繰り上げて再試行
    }
});
```
これにより、開発環境でポート競合が発生してもエラーにならず、シームレスに別ポートで立ち上がります。
