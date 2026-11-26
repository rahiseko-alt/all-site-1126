# concept.md — Hover Color Buttons 概念層

## 3つのコア技術

（出典: css/style.css「nav pill」「反転ボタン」節）

### 1. nth-child による項目別ホバー色

ナビ pill は既定では半透明テキスト＋細ボーダーの無彩色。`:nth-child(n):hover` で項目ごとに別ブランド色（cyan/violet/pink）を背景・ボーダー・文字に同時適用する。色を項目に固定で割り当てるため、並び順とブランド配色が 1:1 で対応する。

```css
.pill-nav .pill:nth-child(1):hover { background: var(--nav-1); border-color: var(--nav-1); color: #07080a; }
.pill-nav .pill:nth-child(2):hover { background: var(--nav-2); border-color: var(--nav-2); color: #fff; }
.pill-nav .pill:nth-child(3):hover { background: var(--nav-3); border-color: var(--nav-3); color: #fff; }
```
（出典: css/style.css L70–L72 `.pill-nav .pill:nth-child`）

### 2. CTA 反転（白塗り → アクセント色）

CTA だけは既定で白塗り＋濃色文字にして優先度を上げ、ホバーでアクセント色へ反転する。他の pill が「無彩→点灯」なのに対し CTA は「白→アクセント」で、視線誘導の主従を作る。

```css
.pill-cta { color: #07080a; background: #fff; border-color: #fff; }
.pill-nav .pill-cta:hover { background: var(--cta); border-color: var(--cta); color: #07080a; }
```
（出典: css/style.css L80–L87 `.pill-cta`）

### 3. インライン変数 --c による塗りつぶしボタン

ボタンは `style="--c:#22d3ee"` のようにインラインで色を持ち、CSS 側は `--c` を参照するだけ。既定はアウトライン（文字＋ボーダーが `--c`）、ホバーで背景が `--c` に反転し、同色の影＋持ち上げで浮き上がる。色追加は HTML の `--c` を増やすだけで CSS 改変不要（Single Source = `--c`）。

```css
.btn { color: var(--c); border: 1.5px solid var(--c); background: transparent; }
.btn:hover { color: #07080a; background: var(--c); box-shadow: 0 10px 30px -8px var(--c); transform: translateY(-3px); }
```
（出典: css/style.css L96–L115 `.btn` / `.btn:hover`、index.html L24–L27 インライン `--c`）

---

## アーキテクチャ概要

Hover Color Buttons: 素CSS（外部依存ゼロ・JS不要）
CDN: なし（Google Fonts のみ）
Entry: index.html | Style: css/style.css | JS: js/app.js（placeholder・実処理なし）
Main class: `.pill` / `.pill-cta` / `.btn`
（出典: index.html L1–L40）

---

## シーン設計

| 要素 | 設定値 |
|------|--------|
| 背景色 | `#07080a` |
| 文字色 | `#f1f5f9` / 補助 `#94a3b8` |
| pill 既定ボーダー | `rgba(255,255,255,0.12)` |
| nav-1（cyan） | `#22d3ee` |
| nav-2（violet） | `#8b5cf6` |
| nav-3（pink） | `#ec4899` |
| CTA ホバー | `#22d3ee`（文字 `#07080a`） |
| btn 影 | `0 10px 30px -8px var(--c)` |
| btn 持ち上げ | `translateY(-3px)` |
| トランジション | `0.3s`（color / background / border / box-shadow / transform） |

アニメーション: 状態遷移は CSS transition のみ。hover で色・影・Y移動が同時補間される。
（出典: css/style.css L60–L115）

---

## 初期失敗パターン（省略可）

ホバー色を全 pill 共通の単一アクセントにすると「どれを指しているか」の識別性が出なかった。`nth-child` で項目ごとに色を割り当てることで、ホバー前から色とラベルの対応を学習させ識別性を確保した。

---

## 既知の改善点

- **色覚多様性**: 色のみで項目を区別しているため、形状・アイコン併用が望ましい。
- **キーボード操作**: `:hover` のみで `:focus-visible` 未対応。Tab 移動時の点灯を別途付与すると良い。
