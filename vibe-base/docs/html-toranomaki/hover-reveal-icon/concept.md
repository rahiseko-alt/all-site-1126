# concept.md — Hover Reveal Icon 概念層

## 2つのコア技術

（出典: css/style.css「隠密マーク本体」節）

### 1. 既定 opacity:0 による完全非表示

識別アイコンを既定で `opacity: 0` にして 100% 見えない状態にする。暗背景に暗いアイコンを置くと「薄く見える」ノイズが残るが、不透明度を 0 にすれば完全に消える。アイコンは `pointer-events: none` でホバー判定にも干渉しない。出現トリガーは親カードの `:hover` に持たせる。

```css
.reveal-icon {
  opacity: 0;
  transform: translateY(10px) scale(0.85);
  transition: opacity 0.35s ease, transform 0.35s ease, filter 0.3s ease;
  pointer-events: none;
}
```
（出典: css/style.css L57–L66 `.reveal-icon`）

### 2. hover で「下から浮き上がる」出現演出

親カードのホバーで `opacity: 0→1` と同時に `translateY(10px)→translateY(-10px)` ＋ `scale(0.85)→1.16` を補間し、隠れていた位置から上方へ飛び出すように見せる。`drop-shadow` を足して浮遊感を強調。ブランド色（`fill`）は最初から設定済みで、不透明度の遷移だけで色が「点灯」して見える。

```css
.reveal-card:hover .reveal-icon {
  opacity: 1;
  transform: translateY(-10px) scale(1.16);
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.55));
}
.icon-line svg path { fill: #06c755; }
.icon-mail svg path { fill: #2d7bff; }
```
（出典: css/style.css L69–L78 `.reveal-card:hover .reveal-icon` / `.icon-*`）

---

## アーキテクチャ概要

Hover Reveal Icon: 素CSS（外部依存ゼロ・JS不要）
CDN: なし（Google Fonts のみ）
Entry: index.html | Style: css/style.css | JS: js/app.js（placeholder・実処理なし）
Main class: `.reveal-card` / `.plate` / `.reveal-icon`
（出典: index.html L1–L52）

---

## シーン設計

| 要素 | 設定値 |
|------|--------|
| 背景色 | `#07080a` |
| プレート色（既定で見える黒箱） | `#0d0f14` |
| プレート枠 | `rgba(255,255,255,0.07)`（hover時 `0.16`） |
| カードサイズ | `96 × 96px` |
| アイコンサイズ | `46 × 46px` |
| アイコン既定 | `opacity:0` / `translateY(10px) scale(0.85)` |
| アイコン hover | `opacity:1` / `translateY(-10px) scale(1.16)` |
| 影（hover時） | `drop-shadow(0 8px 14px rgba(0,0,0,0.55))` |
| LINE 色 | `#06c755` |
| メール色 | `#2d7bff` |
| GitHub 色 | `#f1f5f9` |
| トランジション | `opacity 0.35s` / `transform 0.35s` / `filter 0.3s` |

アニメーション: ホバーで不透明度・Y移動・拡大・影が同時補間。アイドル時はプレートのみ表示。
（出典: css/style.css L48–L78）

---

## 初期失敗パターン

アイコンを「黒塗り（暗色 fill）」で隠そうとしたが、暗背景との差で silhouette が薄く見えてしまい「隠れている」状態が成立しなかった。`opacity: 0` による完全非表示に切り替えて解決。さらに白い stroke 輪郭を付けていたことも視認の原因だったため撤去した。

---

## 既知の改善点

- **タッチ端末**: `:hover` 依存のためタッチでは出現しない。タップで toggle する JS フォールバックが必要。
- **識別性**: アイドル時は黒プレートのみで中身が分からない。常時うっすらラベルを併記する案もあるが、本デモは「隠す」ことを優先した。
