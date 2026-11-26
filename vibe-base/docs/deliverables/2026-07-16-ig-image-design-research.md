# ig-image-design-research 完了報告

## 重要な制約事項

本レポートは既存の `.claude/skills/create-image/replicate-playbook.md`（§1モデル選択・§2サイズ表・§4プロンプト黄金律・§5モデル別プロンプト仕様）を踏まえて作成。

---

## エグゼクティブサマリ

1. 業務改善Tips系コンテンツは「フラットイラスト/インフォグラフィック調」が写真調より情報伝達効率で優位（教育系投稿はインフォグラフィックが highly shareable との複数ソース一致）。ただし playbook 既定は写真調中心のため、Tips投稿は **イラスト調に路線変更**するのが筋が良い。
2. カルーセルは単一画像より一貫して高エンゲージメント（Socialinsider実データ: 2025年通期 0.55% vs 0.37%、約1.5倍）。ただし日次自動投稿でのカルーセル運用は Buffer API 経由で技術的に可能（最大10枚）だが、**1投稿あたり生成コスト・複雑度が2〜4倍**に増える。
3. 完全テキストなし画像は「捨てるのはリスク」——教育系コンテンツでは infographic/data visualization が高評価という一致した知見があり、視覚のみでは訴求力が単一画像運用時より弱まる可能性。ただし FLUX 等の拡散モデルは **日本語文字のレンダリングが構造的に不安定**（英語圏の知見のみでCJK文字精度への直接言及はなし＝推測領域）なため、Satoriの代替としてFLUX内に日本語テキストを焼き込む方向は推奨しない。
4. カラーパレット固定＋スタイル固定（レイアウト・光源・カメラ句を日替わりでも不変にする）が「同じアカウントと分かる」仕組みの核。playbook §5-2のhexカラー指定機能と相性が良い。

---

## 詳細な発見（出典付き）

### 1. ビジュアルパターン（写真調 vs イラスト調 vs インフォグラフィック調）

- 教育系Instagram投稿はインフォグラフィック/データビジュアライゼーションが「速さと粘着性(stickiness)の両方で勝つ」と評されている（出典: [Design Shifu — Instagram-Optimized Graphics 2026](https://www.designshifu.com/blog/instagram-optimized-graphics-what-works-in-2025)、[DesignRush — Instagram Infographic Examples 2026](https://www.designrush.com/best-designs/infographics/trends/instagram-infographics)）。
- B2B/教育コンテンツはカルーセル形式のチュートリアル寄りが好まれるとの複数マーケティングブログの一致（出典: [Sprout Social — Instagram Marketing 2026](https://sproutsocial.com/insights/instagram-marketing-strategy/)、[Incremys — Instagram Content Strategy 2026](https://www.incremys.com/en/resources/blog/instagram-content-strategy)）。
- 日本語ソースでは、色・フォント・写真トーンの統一で「このブランドの投稿だ」と一目で認識させることが中小企業アカウント成功の共通要素とされる（出典: [SINIS — 中小企業のインスタ運用事例10選](https://sinis-i.tetemarche.co.jp/content/blog/s_company_case)、[C-Vivid — 中小企業のインスタアカウント成功事例10選](https://enterprise.cuepid.net/tips/instagram-002/)）。
- **判定**: 業務改善Tips（抽象概念の解説）は写真調より「フラットイラスト or アイソメトリック風インフォグラフィック」の方が概念伝達に向く。playbook §4は元々写真リアル路線からフラットイラスト路線に転換した実績（Session 199）があり、方向性は整合する。

### 2. カルーセル vs 単一画像投稿

- Socialinsider実データ（35百万投稿・44.7万アカウント分析、2025年通期）: **カルーセル 0.55% > Reels 0.52% > 静止画 0.37%**（エンゲージメント率）。直近Q2 2026でも カルーセル0.50% > Reels 0.48% > 画像0.33%の順位は不変（出典: [Socialinsider — 2026 Instagram Benchmarks](https://www.socialinsider.io/social-media-benchmarks/instagram)）。
- 自動化実現性: Buffer はカルーセル投稿のスケジューリングに対応（最大10枚、Instagram公式APIの制約に準拠）。要件はプロフェッショナルアカウント＋Facebookページ連携（出典: [Buffer公式ヘルプ](https://support.buffer.com/article/657-scheduling-instagram-posts-and-reels)）。
- **判定**: カルーセルは技術的に自動化可能。ただし1投稿=画像1枚生成の現行スクリプト設計（playbook §3「1指示=1枚生成」原則）を前提にすると、カルーセル化は生成コスト・生成失敗時のリトライ複雑度が枚数分に増える。**まず単一画像の高品質化・ブランド一貫性確立を優先し、カルーセルは次フェーズに限定投入するのが現実的**。

### 3. オンイメージテキストの是非

- カルーセルデザインのベストプラクティスとして「1スライド30語以内・大きいフォント・余白を残す」「同じ配色・同じ書体・繰り返しグラフィック要素の使用」が挙げられている（出典: [Postnitro — Perfect Instagram Carousel 2026](https://postnitro.ai/blog/post/instagram-carousel-post)）。
- **CJK文字レンダリングの構造的リスク（推測含む）**: 検索結果は英語圏の知見が中心で「拡散モデルによる日本語文字レンダリングの精度」に直接言及するソースは見つからなかった。ただし一般に知られる事実として、FLUX含む拡散モデルはラテン文字は比較的読める一方、漢字・かな等CJK文字は崩れやすいという業界共通認識がある（一次ソースでの直接検証はできていない＝推測）。
- **判定**: 推奨は「テキストは画像に焼き込まず、視覚メタファーで概念を表現する」現行方針を維持しつつ、キャプション側で数字・キーワードを担保すること。

### 4. カラーパレット・ブランディングの一貫性

- Instagramカラーパレットは通常4〜6色に絞り、投稿・ストーリー・ハイライト全体で使い回すことでフィード全体の一貫性と即時認識性を作るとされる（出典: [Manypixels — Instagram Colors 2026](https://www.manypixels.co/blog/social-media-design/instagram-color)）。
- **判定**: playbook §5-2で既に「hexカラー指定」機能がサポートされているため、**アカウント専用の固定パレット（3色程度、hexで固定）＋固定スタイル句をテンプレート化し、プロンプトの「Subject」スロットだけを日替わりで差し替える**設計が、既存資産の延長として最も実装コストが低く効果が高い。

---

## Replicateプロンプトテンプレート案（playbook §4/§5 準拠）

### 前提: モデル選定
- 日次量産: `flux-1.1-pro`（¥6.3/枚、40-90語想定）を既定候補とする。schnellはコスト最安だが試作専用（playbook §1既定）、ultraは特別回・ピン留め投稿用に温存。
- ブランド固定パレット例（仮・マスター確定要）: ネイビー `#1B3A5C` / コーラル `#E8734A` / クリーム `#F5EFE6`

### 変換ロジック（日本語見出し → 英語プロンプト）

1. **テーマ抽出**: 見出し（例:「在庫管理を自動化する3つのコツ」）から業務領域キーワードを抽出（在庫管理／自動化）。
2. **視覚メタファー辞書への変換**: 抽象概念を具体オブジェクトへ変換する対応表を用意（例: 「自動化」→ロボットアーム/歯車、「コスト削減」→下降する棒グラフ+硬貨、「時間短縮」→時計+チェックマーク、「採用」→面接テーブル+履歴書）。日本語の単語や文字そのものをプロンプトに残さない（playbook §5-0）。
3. **固定テンプレートへの当てはめ**: Style/Palette/Lighting/Camera句は全投稿で固定文字列として使い回し、Subject/Action句のみ差し替える。
4. **黄金律チェック**: 否定文なし・分布中心ワード排除・光源とカメラ具体化・レイアウト明示。

### テンプレート例A（フラットイラスト・「自動化」系Tips用）

```
A flat vector illustration of a small business owner reviewing a stack of labeled cardboard boxes in a compact warehouse, one hand holding a tablet showing a simple upward bar chart, warm afternoon light through a single window, minimalist Japanese business illustration style with rounded geometric shapes and thin black outline strokes, flat color fills in navy blue #1B3A5C, warm coral #E8734A, and cream #F5EFE6, no gradient shading.
```

### テンプレート例B（アイソメトリック・インフォグラフィック調、「効率化/DX」系Tips用）

```
An isometric flat illustration of a tidy office desk with a laptop displaying a simple line graph trending upward, a stack of neatly labeled folders beside a small potted plant, soft even studio lighting from directly above, minimalist SaaS-style infographic illustration, flat color fills in navy blue #1B3A5C, warm coral #E8734A, and cream #F5EFE6, thin black outline strokes, no gradients or drop shadows.
```

### テンプレート例C（特別回・ピン留め投稿用、flux-1.1-pro-ultra + --raw）

```
A tidy modern Japanese office desk with a laptop open to a simple line-graph dashboard, a labeled inventory clipboard resting beside it, a single ceramic mug, soft morning window light from the left casting long shadows, shot on Sony A7IV 35mm f/1.4, ultra-shallow depth of field blurring the background to a warm cream tone, candid documentary-style office photography, muted navy blue and coral palette.
```

---

## actionable な示唆・推奨

1. **Tips投稿はイラスト調（フラット or アイソメトリック）に統一**し、playbook §4黄金律のフラットイラスト転換実績（Session 199）を踏襲する。
2. **カルーセルは即時導入せず段階導入**。まず単一画像×ブランド一貫性の確立を優先。
3. **画像内への日本語テキスト焼き込みは引き続き回避**。数字・キーワードはキャプションで担保し、画像は視覚メタファーに徹する。
4. **アカウント専用のhexカラー3色＋固定スタイル句テンプレートを確定**し、プロンプト生成ロジックに「Subjectのみ可変・他固定」の構造を実装する。

---

## 確信度と既知のギャップ

- 確信度: 中（カルーセル vs 単一画像のエンゲージメント差は一次データで高確度。イラスト vs 写真の優劣、CJK文字レンダリング精度は一次データ不足で推論に依存）
- 検証できなかった点:
  - 業務改善Tips特化アカウントでの写真調/イラスト調/インフォグラフィック調の直接比較データ
  - FLUX(Replicate)における日本語文字レンダリングの実際の精度（実機で数枚試作して確認することを推奨）
  - 「一貫したブランド提示が売上を33%押し上げる」等の定量的主張は一次調査への遡及ができていない

## 参照した既存資産

- `.claude/skills/create-image/replicate-playbook.md`（§1モデル選択・§2サイズ表・§4プロンプト黄金律・§5モデル別プロンプト仕様）
