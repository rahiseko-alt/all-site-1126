---
name: antigravity-base-scaffold
description: >
  Antigravity 2.0 最適化フロントエンドプロジェクトを任意のディレクトリにスキャフォールドするスキル。
  Vite 8.x + Vanilla JS + CSS Custom Properties + GSAP CDN + Playwright Visual Regression Testing の
  CPU軽量・AI自律検証対応スタックを、指定パスに一括展開する。
  トリガー条件: 「新しいフロントエンドプロジェクトを作りたい」「Antigravity最適化テンプレートを展開したい」
  「ランディングページの雛形が欲しい」などのリクエスト時に自動発動。
---

# Antigravity Base Scaffold スキル

## 概要

このスキルは、Antigravity 2.0 のブラウザ連携・UI自律検証（Gemini UI Checkpoint）能力を
最大限に発揮するために設計されたフロントエンドテンプレートを、任意のディレクトリに展開する。

## 使用タイミング

以下のいずれかに該当するとき、このスキルを適用する：

- ユーザーが新しいフロントエンドプロジェクトの作成を要求した
- 「Antigravity最適化」「AI検証対応」のテンプレートが必要とされた
- ランディングページやショーケースページの雛形が求められた
- Vite + Vanilla JS の高速ビルド環境が必要とされた

## スタック構成

| レイヤー | 技術 | 理由 |
|---|---|---|
| ビルドツール | Vite 8.x | CPU軽量、HMR瞬速 |
| 言語 | Vanilla JS (ES Modules) | フレームワーク非依存、AIが破綻しにくい |
| スタイル | CSS Custom Properties | トークン1箇所変更で全体連動 |
| アニメーション | GSAP 3.x (CDN) | ScrollTrigger連動、60fps |
| フォント | Inter + Noto Sans JP (Google Fonts CDN) | 日英対応 |
| テスト | Playwright | Visual Regression + DOM検証 |

## 実行手順

### Step 1: ターゲットディレクトリの確認

ユーザーに展開先ディレクトリを確認する。指定がなければ現在のワーキングディレクトリに
`antigravity-app/` サブディレクトリを作成する。

以下、ターゲットディレクトリを `$TARGET` と呼ぶ。

### Step 2: テンプレートファイルの展開

`references/template-files.md` を読み込み、記載されている全ファイルを
`$TARGET` 配下に `write_to_file` で作成する。

**ルール:**
- コードの改変・省略は禁止
- ファイルの作成順序: package.json → vite.config.js → index.html → CSS群 → JS群 → テスト
- `tests/screenshots/` ディレクトリ（空）も作成すること

### Step 3: 依存関係インストール

```bash
cd $TARGET
npm install
```

### Step 4: 動作検証

```bash
# dev server 起動
npm run dev

# 別プロセスで Playwright テスト実行
npx playwright test tests/visual.spec.js

# production ビルド確認
npm run build
```

### Step 5: 結果報告

以下をユーザーに報告する：
- 作成したファイル数（14ファイル + 1ディレクトリ）
- dev server のURL（通常 http://localhost:5173/）
- Playwright テスト結果（全7テストのPASS/FAIL）
- ビルド所要時間と出力サイズ

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| `lightningcss` エラー | `vite.config.js` の `css: { transformer: 'lightningcss' }` ブロックを削除 |
| GSAP が undefined | CDN読み込み遅延。`animate.js` の retry機構が自動対処するので待つ |
| ポート5173が使用中 | `vite --host --port 5174` でポート変更 |
| Playwright ブラウザ未インストール | `npx playwright install chromium` を実行 |

## カスタマイズガイド

展開後、以下のファイルを編集することでデザインを変更できる：

- **色の変更**: `src/styles/tokens.css` の `--color-*` 変数を編集
- **フォントの変更**: `index.html` の Google Fonts リンクと `src/styles/typography.css`
- **コンポーネント追加**: `src/components/` に新ファイルを追加し、`src/main.js` でimport
- **アニメーション追加**: `src/styles/animations.css` に @keyframes 追加
