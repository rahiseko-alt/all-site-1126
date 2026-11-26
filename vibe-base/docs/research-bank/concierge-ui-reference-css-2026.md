# CSS計測比較表 — AI Concierge 参考3サイト

> 計測日: 2026-03-28 | 計測方法: Puppeteer getComputedStyle

## 3サイト比較

| # | 項目 | L Message (lme.jp) | Tayori (tayori.com) | Tidio (tidio.com) |
|---|------|-------------------|--------------------|--------------------|
| 1 | html base font-size | 16px | 16px | 18px |
| 2 | font-family | 游ゴシック体, Yu Gothic | Noto Sans JP, -apple-system | euclidcircularb, -apple-system |
| 3 | font-size h1/h2/h3/p/nav | 38/40/40/30/16px | 16/38/14/8/— | —/32/—/16/18px |
| 4 | font-weight h2/p/nav | 700/700/700 | 700/400/— | 600/500/400 |
| 5 | line-height h2/p | 1.0(normal)/1.3 | 1.6/1.5 | 1.28/1.5 |
| 6 | letter-spacing h2/p/nav | normal/2.4px/1.6px | 1.9px/normal/— | -0.32px/-0.16px/normal |
| 7 | text color (primary) | rgb(53,53,53) #353535 | rgba(8,22,26,0.9) ≈#08161A | rgb(8,15,26) #080F1A |
| 7b | accent color | rgb(8,191,90) #08BF5A 緑 | rgb(26,173,144) #1AAD90 ティール | — (ダークネイビー基調) |
| 8 | bg (body/header) | 白/白 | 白/— | —/— |
| 8b | bg (footer) | rgb(8,191,90) 緑 | rgb(57,69,72) ダークグレー | ダークネイビー |
| 9 | CTA border color | 透明(1px) | rgb(238,140,71) オレンジ2px | 透明(1px) |
| 10 | section padding (vertical) | 50-90px | 48-64px | 24-32px |
| 10b | container padding (horizontal) | — | 0 32px | 16px |
| 11 | margin (section間) | — | 0 0 15-64px | 0 0 8-12px |
| 12 | gap (主要) | 10-46px (幅広い) | 16-24px | 8-40px |
| 13 | max-width (container) | — | 1176px | 1216px |
| 14 | header height | 96px | — | 72px |
| 14b | footer height | 392px | 473px | 1392px(mega footer) |
| 15 | border-radius (button) | **160px (pill)** | 8px | 8px |
| 15b | border-radius (card) | 20px | 8px | 8px, 16px |
| 16 | box-shadow (card) | rgba(0,0,0,0.15) 0 2px 8px | rgba(12,52,49,0.13) 4px 6px 16px | **なし (shadow-free)** |
| 17 | opacity | — | LazyShow 0→1 | LazyShow 0→1 |

## AI Concierge デザインシステムへの反映判断

### 採用する値（実測根拠付き）

| 項目 | 採用値 | 根拠 |
|------|--------|------|
| font-family | Noto Sans JP | Tayori採用。日本語SMB向けで最も読みやすい。游ゴシックはWindows表示が不安定 |
| base font-size | 16px | L Message/Tayori共通。18pxは日本語では大きすぎる |
| h1 size | 24px | 管理画面用。LPではないので38-40pxは不要。コンパクトに |
| h2 size | 18px | 管理画面セクション見出し |
| body size | 14px | 管理画面本文。Tidioの16pxより一段小さく情報密度確保 |
| font-weight 見出し | 600-700 | 3サイト共通で見出しは太い |
| text color | #1E293B | Tayori/Tidio方向。純黒より柔らかい |
| accent | #2563EB (Blue) | 3サイトは緑/ティール系だがテーマ可変なので中立的な青をデフォルトに |
| border-radius button | 8px | Tayori/Tidio共通。L Messageの160px(pill)は管理画面には派手すぎ |
| border-radius card | 12px | Tayori 8px ← Tidio 16px の中間 |
| box-shadow card | 0 1px 3px rgba(0,0,0,0.06) | Tayoriの控えめシャドウ方向。Tidioは影なし=フラットすぎ |
| header height | 72-96px間 → 約80px相当 | L Message 96px ← Tidio 72px |
| section padding | 24px | 管理画面なのでLPの50-90pxは不要。コンパクト |
| container max-width | — | 管理画面はサイドバー+コンテンツ。fixed widthは不使用 |
| gap | 8-16px | Tayori/Tidio方向。L Messageの46pxは広すぎ |

### 既存デザインシステムとの差異

| 項目 | 現在のdesign-system.md | 実測根拠から |変更要否 |
|------|----------------------|------------|---------|
| font-family | Noto Sans JP | Noto Sans JP (Tayori一致) | **一致。変更不要** |
| base font | 16px → body 14px | 16px base, 14px body | **一致。変更不要** |
| text color | #1E293B | Tayori ≈ #08161A, Tidio ≈ #080F1A | やや暗いが許容範囲。**変更不要** |
| border-radius btn | 8px | Tayori/Tidio = 8px | **一致。変更不要** |
| border-radius card | 12px | Tayori=8, Tidio=8-16 | 12pxは中間値で妥当。**変更不要** |
| box-shadow card | 0 1px 3px rgba(0,0,0,0.06) | Tayori = 4px 6px 16px (やや強い) | 管理画面は控えめでOK。**変更不要** |
| letter-spacing | — (未定義) | Tayori: 1.9px(h2), Tidio: -0.32px(h2) | **追加推奨: 見出し 0〜-0.5px** |

### 結論
既存のdesign-system.mdは実測データと概ね一致しており、大幅な修正は不要です。letter-spacingのみ追加を推奨します。
