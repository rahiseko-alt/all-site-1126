# concept.md — Flip QR Popout 概念層

## 3つのコア技術

（出典: js/app.js「Flip 処理」/ css/style.css「拡大ステージ」節）

### 1. data-flip-id 共有エレメント（サムネ↔フル）

サムネ `.qr-mini` と中央拡大用 `.qr-full` に**同じ `data-flip-id`** を付ける。GSAP Flip は同一 `data-flip-id` の2要素を「1つの要素が移動・拡大した」かのように補間する。クリックでサムネを `visibility:hidden`、フルを `display:block` に切り替え、`Flip.from(state, {fade:true, absolute:true})` で枠から中央へ飛ばす。サムネの枠は残るため「中身だけ飛び出す」。

```js
const state = Flip.getState([thumb, full]);
full.classList.add('active');     // .qr-full{display:none}->{display:block}
thumb.classList.add('hidden');    // .qr-mini.hidden{visibility:hidden}
Flip.from(state, { duration: 0.55, fade: true, absolute: true, ease: 'power2.inOut' });
```
（出典: js/app.js L31–L41 `open()`）

### 2. pointer-events:none ステージ（ジッター対策）

中央の `.qr-stage` を `position:fixed; inset:0; pointer-events:none` にする。拡大した QR がカーソルを一切拾わないため、ホバー状態の ON/OFF による transform 競合（カクつき）が発生しない。閉じる操作は別の `.qr-backdrop`（pointer-events:auto）が受け持つ。

```css
.qr-stage { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 10000; }
```
（出典: css/style.css L70–L76 `.qr-stage`）

### 3. 3経路クローズ（再クリック / 背景 / Esc）

開いている QR の id を `openId` で1つだけ保持し、ドック再クリック・backdrop クリック・`Escape` キーのいずれでも `close()` を呼ぶ。`close()` も `Flip.getState→クラス戻し→Flip.from` で逆再生し、中身が枠へ戻る。

```js
backdrop.addEventListener('click', close);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
```
（出典: js/app.js L62–L64 クローズ経路）

---

## アーキテクチャ概要

Flip QR Popout: GSAP 3.12.5 + Flip プラグイン
CDN: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js , https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js
Entry: index.html | Style: css/style.css | JS: js/app.js
Main class: `gsap` / `Flip`（`Flip.getState` / `Flip.from`）
アセット: qr.svg（qrcode CLI 生成・デモ用 URL をエンコード）
（出典: index.html `<head>`〜末尾 CDN 読み込み / index.html `<img src="qr.svg">`）

---

## シーン設計

| 要素 | 設定値 |
|------|--------|
| 背景色 | `#07080a` |
| アクセント | `#22d3ee` |
| サムネ枠 | 白 `#fff` / `96×96px` / padding 10px / radius 14px |
| サムネ hover | `translateY(-4px)` ＋ cyan 影 |
| フル QR | `min(78vw,360px)` 角丸 22px・白地 |
| ステージ | `position:fixed; inset:0; pointer-events:none` |
| backdrop | `rgba(7,8,10,0.82)` ＋ `blur(4px)`（show で opacity 0→1） |
| Flip open | `duration:0.55, fade:true, absolute:true, ease:power2.inOut` |
| Flip close | `duration:0.5, fade:true, absolute:true, ease:power2.inOut` |

アニメーション: open でサムネ→中央へ拡大移動、close で逆再生。`absolute:true` で flow から外して座標補間する。
（出典: js/app.js L34–L57、css/style.css L78–L92）

---

## 初期失敗パターン

枠ごと拡大する実装（`.thumb.enlarged{position:fixed; transform:translate(-50%,-50%)}`）では、ホバー時の `translateY` と拡大 transform が衝突し、カーソルが拡大物に乗るたびカクついた。**枠は残し中身(img)だけを data-flip-id で飛ばす**方式＋**ステージ pointer-events:none** に変更して解消した。

（出典: js/app.js L26–L60、css/style.css L70–L76）

---

## 既知の改善点

- **反転QR非対応**: 本デモは標準（黒モジュール/白地）。暗背景に合わせ白モジュール反転にするとスキャン互換性が落ちるリーダーがある。
- **複数同時オープン不可**: `openId` 単一保持のため設計上1つずつ。グリッドギャラリー化する場合は配列管理に拡張が必要。
