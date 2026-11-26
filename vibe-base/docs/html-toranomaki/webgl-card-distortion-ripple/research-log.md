# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-16] WebGL カード歪み（クリック波紋特化版）調査（司令塔・原本整備）

### 目的
`webgl-card-distortion` から派生した「クリック波紋」に焦点を絞った版を curtains.js v8.1 で整備し、虎の巻原本として登録可能な状態にする。

### 調査結果と課題解決
- **curtains.js v8 のロード形態**: v8 は `type="module" + src/index.mjs` のみ有効。`build/curtains.min.js` は存在しない URL（RULES §1 落とし穴参照）。
- **アスペクト比補正された正円波紋**: 縦長・横長プレーンで距離計算をそのまま使うと波紋が楕円化する。X 軸座標と押し出し量を `uAspect` で除算・乗算し、任意のカード比率でも正円の波紋を維持する。
- **波紋寿命の個別最適化**: 自動寿命（距離/速度）では小サイズ・低速カードで寿命が伸び「もっさり」する。`data-ripple-speed` / `data-ripple-max-time` / `data-ripple-frequency` をカード個別に手動指定できるよう制御設計した。
- **blindtest**: `node scripts/toranomaki-blindtest.mjs webgl-card-distortion-ripple impl-curtainsjs-8.1` で黒ピクセル率 1.0%・EXIT 0（WebGL 描画確認）。

### impl 命名是正
原本整備時に `impl-curtainsjs-8.1-blindtest`（RULES §3 違反の接尾辞）を `impl-curtainsjs-8.1` へ改名した。
