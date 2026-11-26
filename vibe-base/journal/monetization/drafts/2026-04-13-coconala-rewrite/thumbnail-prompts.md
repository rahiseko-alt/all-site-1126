---
title: ココナラ3出品 Nano Banana サムネプロンプト集
target_model: Gemini 2.5 Flash Image (Nano Banana)
source_guide: docs/standards/nanobanana-prompt-guide.md
research_basis: journal/monetization/drafts/2026-04-13-coconala-rewrite/thumbnail-research.html
created: 2026-04-13
---

# 設計方針（3出品共通）

## 統一テンプレ要素（占有率狙い）
同一作者の3枠が並んだときに**一瞥で同系列と判別**できるよう、以下を全出品で共通化:

1. **アスペクト比**: 1:1（Nano Banana 側で `aspect_ratio="1:1"`、後処理で 600×600 にリサイズ）
2. **スタイル**: flat vector illustration、bold clean outlines、no 3D、no photorealism
3. **左側 60%: ビジュアル領域** / **右側 40%: 見出し用の空白**（230×190 判読性確保のため要素3点以下）
4. **構図**: スマホ端末 + チャット吹き出し + 技術アイコン（後処理合成）の3要素構成
5. **共通カラー**: ベース = off-white / charcoal、アクセントで出品ごとに差別化

## 出品ごとのアクセントカラー（差別化）
| 出品 | コース位置 | アクセント |
|------|----------|----------|
| dsl5 | 入門 | soft mint green (#8FD4B2) |
| dify25 | 中間 | LINE green (#06C755) |
| app50 | 最上位 | deep navy + gold (#1B2A4E + #E6B45A) |

## 文字とロゴの扱い（最重要）
調査結果（docs/standards/nanobanana-prompt-guide.md §3, §8）に基づく判断:

- **画像内の日本語長文**: Nano Banana 2.5 では漢字・長文が崩れる → **全て後処理で載せる**
- **画像内の短尺英語・数字**: 試験的に生成させる（保険）。崩れたら後処理
- **LINE / Dify のブランドロゴ**: セーフティフィルタ＆ブランド正確性の問題 → **Nano Banana には描かせず、公式ブランド素材を後処理で合成**
- **価格表示**: なし（カード側で自動表示・競合 0/20）
- **星評価 / PRO バッジ**: なし（同上）

プロンプトでは `Leave empty space on the right 40% for headline text overlay` と `No text, no logos, no watermarks` を必ず指定する。

## 言語の判断
本ガイド§2に基づき **プロンプト本体は英語**。画像内に生成させる文字は無し（後処理運用）。

## 後処理の想定フロー
1. Nano Banana で背景ビジュアル生成（1:1, 1024px級）
2. 600×600 にリサイズ
3. 後処理で載せる要素:
   - 右上: 日本語キャッチ（16-20pt、2行以内）
   - 中央下: LINE/Dify 公式ロゴ（PNG 合成）
   - 左下 or 右下: 作者シグネチャ（任意）

---

# dsl5 — LINE対応Dify DSLボットを納品します

## プロンプト A（スマホ+チャット吹き出し型）

```
A flat vector illustration, square 1:1 composition, modern editorial startup style.
Subject: a clean minimalist smartphone mockup tilted 15 degrees, positioned on the left 40% of the canvas. On its screen, a simplified chat interface with two stylized message bubbles (no readable text, just abstract rounded rectangles suggesting a conversation). Above the phone, a small floating document icon representing a blueprint or schematic, connected to the phone with a thin dotted line.
Background: solid off-white (#F7F7F2) with a very subtle soft mint green (#8FD4B2) accent shape in the bottom-left corner, like a quarter-circle gradient wash.
Style: flat design, bold clean 2px outlines in charcoal (#2B2B2B), flat cel-shading, no gradients on the subject, no 3D, no photorealism.
Composition: main subject occupies left 55% of the frame. Right 45% is intentionally empty negative space for text overlay.
Mood: calm, entry-level, approachable, budget-friendly starter kit.
Avoid: text, letters, numbers, watermarks, logos, brand marks, cluttered details, photorealism, 3D render, shadows behind subject, extra icons, human figures.
```

- 想定出力: 1024×1024 square → 600×600 リサイズ
- スタイル: flat illustration
- 後処理: 日本語キャッチ「Dify設計図を4千円で納品」を右側に、LINE公式ロゴを中央下に合成
- 統一要素: flat + 左ビジュアル/右空白 + 3要素以下

## プロンプト B（設計図アイコン前面型）

```
A flat vector illustration, square 1:1 composition, clean startup editorial style.
Subject: a large stylized blueprint document icon in the center-left, shown at a slight isometric angle. On the blueprint, three simple geometric shapes (circle, square, rounded rectangle) connected by thin lines, representing a chatbot flow diagram. A small abstract chat bubble hovers in the upper right of the document.
Background: off-white (#F7F7F2) with a single thin soft mint green (#8FD4B2) horizontal band across the lower third.
Style: flat design, bold 2.5px charcoal outlines, flat cel-shading, 2-color palette plus outline color, no gradients, no 3D, no photorealism.
Composition: subject occupies left 55%, right 45% is clean empty space for headline overlay.
Mood: minimal, introductory, DIY-friendly.
Avoid: text, letters, numbers, watermarks, logos, brand marks, cluttered details, 3D, shadows, photorealism, multiple documents, human figures, keyboards.
```

- 後処理: キャッチ「設計図を納品」+ Dify公式ロゴ合成

---

# dify25 — DifyでLINE連携AIボットを構築します

## プロンプト A（スマホ+LINEチャット型）

```
A flat vector illustration, square 1:1 composition, modern startup editorial style.
Subject: a clean minimalist smartphone mockup tilted 15 degrees, positioned on the left 40% of the canvas. On its screen, a simplified messaging interface with three stylized chat bubbles stacked vertically (no readable text, abstract rounded rectangles). Above the phone, a small gear or cog icon, suggesting automation, connected to the phone by a thin dotted curve.
Background: solid off-white (#F7F7F2) with a bold LINE-green (#06C755) accent shape filling the bottom-right quadrant as a large quarter-circle wash.
Style: flat design, bold clean 2px outlines in charcoal (#2B2B2B), flat cel-shading, no gradients on the subject, no 3D, no photorealism, editorial magazine aesthetic.
Composition: main subject in left 55%, right 45% intentionally empty for headline text overlay.
Mood: reliable, mid-tier, practical automation.
Avoid: text, letters, numbers, watermarks, logos, brand marks, cluttered details, photorealism, 3D, shadows, extra icons, human figures, keyboards.
```

- 後処理: 「LINE問合せ対応を自動化」+ LINE + Dify ロゴ2点を中央下に横並び合成

## プロンプト B（24時間・時計モチーフ型）

```
A flat vector illustration, square 1:1 composition, modern startup editorial style.
Subject: a clean minimalist smartphone mockup on the left, with a simplified clock icon overlaid on the top-right of the phone indicating 24-hour operation. On the phone screen, two abstract chat bubbles stacked vertically (no readable text).
Background: off-white (#F7F7F2) with a bold LINE-green (#06C755) diagonal band sweeping from bottom-left to center-right.
Style: flat design, bold 2px charcoal outlines, flat cel-shading, no gradients, no 3D, no photorealism.
Composition: subject left 55%, right 45% empty for headline text.
Mood: always-on, automated, dependable.
Avoid: text, letters, numbers, watermarks, logos, brand marks, cluttered details, photorealism, 3D, shadows, human figures, multiple phones.
```

- 後処理: 「月額費用ゼロで運用」+ LINE ロゴ合成

## プロンプト C（無料プラン訴求・コストダウン矢印型）

```
A flat vector illustration, square 1:1 composition, modern startup editorial style.
Subject: a clean minimalist smartphone mockup on the left, with a simple downward arrow icon floating above it, rendered as a bold thick arrow in LINE-green (#06C755). On the phone screen, two abstract chat bubbles (no readable text).
Background: off-white (#F7F7F2) with a subtle light green (#E6F7EC) horizontal band across the upper third.
Style: flat design, bold 2px charcoal outlines, flat cel-shading, no gradients, no 3D, no photorealism.
Composition: subject left 55%, right 45% empty.
Mood: cost-saving, efficient, practical.
Avoid: text, letters, numbers, watermarks, logos, brand marks, currency symbols, cluttered details, photorealism, 3D, shadows, human figures.
```

- 後処理: 「月額費用ゼロ」+ LINE ロゴ合成

---

# app50 — 管理画面付LINE AIボットを開発・設置します

## プロンプト A（スマホ+管理画面ダッシュボード型）

```
A flat vector illustration, square 1:1 composition, premium editorial startup style.
Subject: two stacked elements — in the foreground, a clean minimalist smartphone mockup tilted 15 degrees showing a simplified chat interface (two abstract chat bubbles, no readable text). Behind and above it, a larger laptop or dashboard screen mockup showing a simplified admin panel layout (three horizontal bar-chart rectangles and one small pie-chart circle, no readable text, no numbers).
Background: deep navy (#1B2A4E) solid fill, with a single thin gold (#E6B45A) horizontal accent line across the lower third.
Style: flat design, bold 2px outlines in off-white (#F7F7F2), flat cel-shading, 3-color palette (navy, off-white, gold), no gradients, no 3D, no photorealism, premium editorial aesthetic.
Composition: main subject occupies left 55% of the canvas, right 45% is clean empty negative space for headline text overlay.
Mood: premium, enterprise-grade, top-tier, professional.
Avoid: text, letters, numbers, watermarks, logos, brand marks, cluttered details, photorealism, 3D, drop shadows, extra icons, human figures, keyboards, mice.
```

- 想定出力: 1024×1024 → 600×600 リサイズ
- スタイル: flat illustration（他2出品より濃色背景で差別化）
- 後処理: 「24時間AIに丸投げ」+ LINE公式ロゴ合成
- 統一要素: 3要素以下（スマホ+ダッシュボード+アクセントライン）

## プロンプト B（シールド+チャット型、セキュリティ訴求）

```
A flat vector illustration, square 1:1 composition, premium editorial startup style.
Subject: a clean minimalist smartphone mockup on the left, with a stylized shield icon floating in the upper right area of the phone. Inside the shield, a simple checkmark. On the phone screen, two abstract chat bubbles (no readable text).
Background: deep navy (#1B2A4E) solid fill, with a subtle gold (#E6B45A) quarter-circle accent in the bottom-left corner.
Style: flat design, bold 2px off-white outlines, flat cel-shading, no gradients, no 3D, no photorealism.
Composition: subject left 55%, right 45% empty for headline text.
Mood: secure, enterprise, top-tier, premium.
Avoid: text, letters, numbers, watermarks, logos, brand marks, cluttered details, photorealism, 3D, shadows, extra icons, human figures.
```

- 後処理: 「管理画面で会話も把握」+ LINE ロゴ合成
- 訴求: 個人情報ガード（shield = visual cue）

## プロンプト C（受信トレイ・メール転送型）

```
A flat vector illustration, square 1:1 composition, premium editorial startup style.
Subject: a clean minimalist smartphone mockup on the left, with a stylized envelope icon floating above it connected by a thin dotted arc. On the phone screen, two abstract chat bubbles (no readable text).
Background: deep navy (#1B2A4E) solid fill, with a gold (#E6B45A) horizontal accent band across the upper third.
Style: flat design, bold 2px off-white outlines, flat cel-shading, 3-color palette, no gradients, no 3D, no photorealism.
Composition: subject left 55%, right 45% empty.
Mood: premium, business-grade, attentive, enterprise.
Avoid: text, letters, numbers, watermarks, logos, brand marks, cluttered details, photorealism, 3D, shadows, extra icons, human figures.
```

- 後specific: 「面倒な返信を24時間AIに丸投げ」+ LINE ロゴ合成
- 訴求: メール転送機能

---

# 共通の後処理チェックリスト

生成後、以下を全3出品×全バリエーションに適用:

- [ ] 600×600 にリサイズ（1:1 前提）
- [ ] 右側 40% の空白に日本語キャッチを1〜2行で配置（16-20pt 想定）
- [ ] 中央下に LINE 公式ロゴ（PNG合成、透過背景）
- [ ] dify25 / dsl5 は Dify 公式ロゴも併置検討
- [ ] 230×190 相当に縮小表示して判読性確認（要素3点以下の検証）
- [ ] 3出品並べ表示で同系列感チェック（占有率狙いの統一感）
- [ ] 価格・星評価・PROバッジが**入っていないこと**を確認（競合 0/20 ルール）

# バリエーション合計

| 出品 | プロンプト数 |
|------|------------|
| dsl5 | 2 |
| dify25 | 3 |
| app50 | 3 |
| **合計** | **8** |

# 運用メモ

- プロンプトは全て英語で記述（docs/standards/nanobanana-prompt-guide.md §2 の判定に従う）
- 文字は全て後処理前提（日本語長文の崩れ問題回避）
- ブランドロゴは全て後処理合成（セーフティフィルタ回避 + ブランド正確性担保）
- 生成時は Google AI Studio または API (`gemini-2.5-flash-image`, `aspect_ratio="1:1"`) で実行
- 統一テンプレ要素を崩さない限り、色調整・小物追加のイテレーションは会話型編集モードで可能
