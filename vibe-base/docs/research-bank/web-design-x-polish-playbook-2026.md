# Web Design X Polish Playbook 2026

調査日: 2026-07-29 JST  
用途: X / 海外デザイン界隈で流れている「AIっぽいWEBデザインを消す」「短時間で垢抜けさせる」実践知を、デザイン専用サブエージェントへ渡すための作業レポート。

## 要旨

2026年時点のX系WEBデザイン改善トレンドは、単なる流行色やエフェクトではない。中心は次の3つ。

1. AI生成UIの平均顔を避ける
2. 迷いを減らして、信頼と行動を早く作る
3. スクリーンショットと機械チェックで、見た目の甘さを潰す

KoseFoodTecのような飲食店向け業務改善LPでは、派手なAI感よりも「現場理解」「相談しやすさ」「明日の作業が軽くなる具体性」が優先。AIツール感を盛るより、店長・オーナーが初見で信用できる業務導線へ寄せる。

## 主要ソース

- X記事: yuwen lu「Signs of vibe coded UI」  
  https://x.com/yuwen_lu_/article/2041187936738447565  
  検索結果上では、AI生成Webデザインの悪いパターンと改善案を整理した記事として確認。X本文はログイン壁あり。
- Developers Digest「AI Design Slop: 16 Patterns That Out Your App as Vibe-Coded」  
  https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it  
  AI slopを16パターンで検出する考え方。PlaywrightでDOMとcomputed styleを読む決定論的チェックが有効。
- Frederik Røssell「My AI Design Toolkit: What Actually Works For Me in 2026」  
  https://www.linkedin.com/pulse/my-ai-design-toolkit-what-actually-works-me-2026-frederik-r%C3%B8ssell-jokje  
  AIで方向案を作り、人間がFigma/コードで最後の40%を磨く、Design → Code → Design → Code のループが重要。
- Frederik RøssellのLP改善投稿  
  https://www.linkedin.com/posts/froessell_built-this-in-claude-code-this-morning-using-activity-7450816988341497857-l6Dt  
  LP改善では、見出しを結果中心へ、信頼材料を上へ、フォームを短くすることが効く。
- NN/g Visual Design  
  https://www.nngroup.com/topic/visual-design/  
  scale / hierarchy / balance / contrast / Gestaltで視覚品質を客観評価する。
- web.dev Web Vitals  
  https://web.dev/articles/vitals  
  LCP 2.5s以下、INP 200ms以下、CLS 0.1以下がCore Web Vitalsの目標。
- W3C WCAG 2.2  
  https://www.w3.org/TR/WCAG22/  
  フォーカス、ターゲットサイズ、認証、入力負担などを含むアクセシビリティ基準。
- MDN Container Queries  
  https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries  
  viewportだけでなく親コンテナ幅に応じてコンポーネントを変化させる。
- W3C Design Tokens Community Group  
  https://www.w3.org/community/design-tokens/  
  2025年10月にDesign Tokens仕様の初安定版が発表され、色・余白・タイポグラフィの共有形式が標準化方向。

## X系でよく見る「AIっぽいUI」の徴候

以下は見つけ次第、基本的に削るか作り替える。

| 徴候 | なぜ弱いか | 修正方向 |
|---|---|---|
| 紫から青、紫からピンクのグラデーション | AI生成LPの平均顔に見える | 紙色、文字色、境界線、アクセント1色へ絞る |
| 3枚横並びの同じ特徴カード | テンプレ感が強い | 表形式、工程表、非対称グリッド、比較表へ変える |
| 全セクション中央揃え | 情報の優先順位が弱い | 左寄せ、余白の偏り、強い見出し幅で階層を作る |
| 角丸カードと薄い影の量産 | shadcn / AI生成の平均顔に見える | カード数を減らし、罫線・表・余白で構成する |
| 絵文字アイコン | OS依存でブランド感が消える | アイコンを使うなら1ライブラリ、または文字だけにする |
| 捏造された実績数値 | 信頼を落とす | 実数がないなら数値枠を置かない。確認予定として扱う |
| フォーム項目が多い | 初回相談の心理的負担が増える | メールまたはLINEだけ、詳細は返信時に聞く |
| hoverだけあるUI | スマホとキーボードで使えない | hover / focus / active / disabled / errorを揃える |
| フェイクブラウザ/フェイク端末 | AIが作った飾りに見える | 実スクショか、抽象的な業務ボードにする |
| すべて同じ余白 | 画面が平坦になる | セクションごとに密度を変える |

## すぐ効く改善スキル

### 1. 5秒テスト

初見で5秒だけ見て、以下が答えられるか確認する。

- 何のサービスか
- 誰向けか
- 何を頼めばいいか
- どこを押せばいいか

答えられない場合は、装飾ではなく見出しと導線を直す。

### 2. 見出しを「機能」から「結果」へ変える

弱い例:

- 飲食業向けAI業務改善サービス

強い例:

- 飲食店の雑務をAIで減らす。
- 店長の確認作業を、毎日少しずつ減らす。
- 予約、仕込み、日報を店で回る仕組みにする。

KoseFoodTecでは、抽象的な「AI導入」よりも、毎日の作業が軽くなる結果を前面に出す。

### 3. 信頼材料を上へ移動する

LPは下まで読まれない前提で作る。上部に入れるべきもの。

- 何を改善するか
- どんな店向けか
- 相談後の流れ
- 既存ツールを捨てなくてよいこと
- 実績が未確定なら、実績ではなく「進め方」と「対象業務」で信頼を作る

### 4. フォームは短くする

初回接触では、名前・会社名・役職・電話番号・課題詳細を全部聞かない。  
メール、LINE、または1問だけにする。

推奨:

- メールアドレス
- 任意のひとこと: 「一番減らしたい作業」

### 5. デザイントークンで崩れを防ぐ

色、文字、余白、角丸、速度をトークン化する。

- `--color-paper`
- `--color-ink`
- `--color-muted`
- `--color-accent`
- `--space-*`
- `--text-*`
- `--radius-*`
- `--dur-*`
- `--ease-*`

CSS内で一度決めた値を途中で直書きしない。

### 6. スマホ幅を先に見る

最低確認幅:

- 320px
- 375px
- 414px
- 768px
- 1280px
- 1440px

チェック:

- 横スクロールなし
- ボタン文言が2行にならない
- 見出しが1文字だけ落ちない
- ナビが詰まらない
- CTAがファーストビュー内で見える

### 7. 状態設計を入れる

最低限、以下の状態をCSSに持たせる。

- default
- hover
- focus-visible
- active
- disabled
- input focus
- input disabled
- error用の余白

これだけで「作っただけ」から「触れるUI」に近づく。

## KoseFoodTec向け改善方針

現ページは方向性として悪くない。次に上げるべき品質は、装飾より「信用できる具体性」。

### 使用する生成画像

生成済みアセット:

- `outputs/kosefoodtec-homepage/images/restaurant-ops-ai-hero.png`

用途:

- ヒーローまたはファーストビュー直下の主要ビジュアルとして使う。
- 実在顧客の導入写真には見せない。
- キャプションを付ける場合は「業務整理イメージ」など、生成・概念ビジュアルとして誤解がない表現にする。

使い方:

- 左側にコピー、右側に画像の構図が合いやすい。
- 画像は丸角カードに閉じ込めすぎず、1枚の編集写真として扱う。
- 画像の中に読める文字や実績数値を重ねない。
- 画像上にAI発光、ホログラム、未来的UIを追加しない。

### 追加・強化したいセクション

1. ファーストビュー直下に「よくある悩み」
   - 予約変更の返信が遅れる
   - 仕込み量が人の勘に寄る
   - 日報が残らない
   - 口コミ返信が後回しになる

2. 「無料相談の流れ」
   - 15分ヒアリング
   - 1作業を選ぶ
   - 小さな試作
   - 店舗運用へ調整

3. 「既存ツールを活かす」
   - LINE
   - Googleフォーム
   - スプレッドシート
   - 予約台帳
   - POSデータ

4. 「導入前後の1日」
   - Before: 店長が閉店後に全部確認
   - After: 確認リストと返信案がまとまる

5. CTAの心理的負担を下げる
   - 「相談を送る」より「一番減らしたい作業を相談する」
   - 入力はメール + 任意メモ程度

### 避けること

- 実績数値の捏造
- 導入社数の捏造
- 「DX」「革命」「次世代」など抽象語の連発
- 飲食店の実写真がない状態で、架空の繁盛店写真を入れる
- AIっぽい発光演出
- 過剰なアニメーション

## デザイン専用サブエージェントへの指示

### 役割

あなたはWebデザイン改善専用のフロントエンドエージェント。  
目的は、KoseFoodTecの静的LPを「AI生成っぽくない」「飲食店オーナーが信用しやすい」「スマホで読みやすい」デザインへ磨くこと。

### 対象ファイル

- `outputs/kosefoodtec-homepage/index.html`
- `outputs/kosefoodtec-homepage/styles.css`
- `outputs/kosefoodtec-homepage/tokens.css`
- `outputs/kosefoodtec-homepage/images/restaurant-ops-ai-hero.png`

### 参照必須

- このレポート: `docs/research-bank/web-design-x-polish-playbook-2026.md`

### 実装要件

1. KoseFoodTecのブランド名と目的は維持する。
2. 実績数値、導入社数、顧客名、口コミは捏造しない。
3. ファーストビュー直下に、飲食店の具体的な悩みが伝わる要素を追加または強化する。
4. 相談導線を軽くする。フォームはメール + 任意メモ程度まで。
5. AIっぽい装飾は足さない。色数は増やさない。
6. 生成画像 `images/restaurant-ops-ai-hero.png` をページ内に差し込む。
7. 画像は実績写真に見せず、業務整理の概念ビジュアルとして扱う。
8. 320 / 375 / 414 / 768 / 1280 / 1440pxで横スクロールなし。
9. すべてのボタン・ナビ文言は1行表示。
10. hover / focus-visible / active / disabled / input focus / input disabledをCSSで扱う。
11. CSSは既存トークンを使い、必要な値は`tokens.css`へ追加する。
12. 最後にPlaywrightでスクリーンショットを更新する。

### 受け入れ基準

- Playwright確認で全幅 `overflow: false`
- クリック要素のテキスト行数が1行
- 1280x800でヒーローの主要CTAが見える
- `rg`で `transition: all`、紫グラデ、捏造系コピーが検出されない
- デスクトップと320pxスクリーンショットを生成し、視認上の崩れがない
