# 2026-06-21 Petcare Deluxe Japanese Localization & Full Site Reproduction Plan

## Goal Description
「Petcare Deluxe」の全ページ（約16ページ）をローカル環境に完全再現し、さらに日本市場向け（日本市場版）として全てのテキスト・メタデータを自然な日本語にローカライズする。

## User Review Required / Open Questions
> [!IMPORTANT]  
> **日本市場向けのローカライズ方針について、以下の3点をご確認・ご指示ください**
> 
> 1. **地名・エリアの置換**  
>    元のサイトはオハイオ州（Cleveland, Strongsville等）を対象としていますが、日本市場版として日本のエリア（例：東京都内、世田谷区、港区など）に架空の地名として置き換えますか？ それとも「オハイオ州北東部」のように直訳のままにしておきますか？
> 
> 2. **価格と通貨の変換**  
>    ドル表記（$）を日本円（¥）に相場に合わせて変換しますか？（例: $25 → ¥3,500 など）
> 
> 3. **サービス名やトーン＆マナー**  
>    "Recurring Dog Walking" などのサービス名を「定期ドッグウォーカー（犬の散歩代行）」など自然な日本語に意訳します。サイト全体のトーン（高級感のある丁寧な敬語、親しみやすい言葉遣いなど）にご指定はありますか？

## Proposed Changes

### 1. 全ページのアセットミラーリングとローカルリンク網の構築
- 抽出済みの内部リンク全ページ（`/Services`, `/visit-lengths-and-rates`, `/service-areas`, `/how-it-works`, `/blog`, `/get-started` など全16ページ）のHTMLをダウンロード。
- 全ページの内部リンク `<a href="/xxx">` がローカルサーバー（`npx serve`）で正しく遷移できるように構築。
- 全ページの外部CDN（CSS/JS）参照を、先ほど構築したローカルの `assets/` フォルダへ向くように一括置換。

### 2. HTML構造を維持したAIローカライズ（翻訳・書き換え）
- `implement-agent` を並列稼働させ、各ページの生のHTMLタグやCSSクラス（`.sqs-block`等）を1ビットも破壊することなく、テキストノード（表示される文字）のみを抽出して日本語化。
- `<head>` 内のSEOタグ（`<title>`, `<meta description>`, JSON-LDのSchema構造）も全て日本の検索エンジン向けにローカライズ。

## Verification Plan

### Automated Tests
- `grep` およびリンクチェッカーのスクリプトを実行し、全HTMLファイル内で英語のまま残っている主要ブロックがないか、リンク切れ（404）がないかを検証。

### Manual Verification
- ローカルプレビュー環境（`localhost:3000`）にて、トップページから全下層ページへの遷移が正しく行えるか、日本語化によってレイアウト崩れ（文字数による折り返し異常など）が起きていないかを確認。
