# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-16] WebGL カード歪み（ホバー特化版）調査（司令塔・原本整備）

### 目的
`webgl-card-distortion` から派生した「ホバー時の歪み」のみに焦点を絞った最小構成版を curtains.js v8.1 で整備し、虎の巻原本として登録可能な状態にする。

### 調査結果と課題解決
- **curtains.js v8 のロード形態**: v8 は `type="module" + src/index.mjs` のみ有効。`build/curtains.min.js` は存在しない URL のため使用不可（RULES §1 落とし穴参照）。
- **ホバー歪みの実装方針**: 頂点シェーダーでマウス座標との距離に応じて `gl_Position` を押し出し、HTML 要素の overflow を許可することでカード外枠が波打つ。クリック波紋ロジック（`webgl-card-distortion-ripple`）を持たず、ホバー追従の歪みだけを残すことで挙動を単純化した。
- **blindtest**: `node scripts/toranomaki-blindtest.mjs webgl-card-distortion-hover impl-curtainsjs-8.1` で黒ピクセル率 1.0%・EXIT 0（WebGL 描画確認）。

### impl 命名是正
原本整備時に `impl-curtainsjs-8.1-blindtest`（RULES §3 違反の接尾辞）を `impl-curtainsjs-8.1` へ改名した。
