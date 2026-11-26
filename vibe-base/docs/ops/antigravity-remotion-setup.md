> ⚠️ 要点は `.claude/rules/video-production.md` で自動注入される。ここは詳細版。

# Remotion × Replicate セットアップ手順（Antigravity用）

> Antigravityが各プロダクトの `video/` 部署にRemotionプロジェクトを構築する際の手順書。
> 原本: `C:\Users\user\Downloads\AntiGravity_NanoBanana_Remotion_セットアップ手順.md`（2026-03-19。Nano Banana は Session 169 で廃止）
>
> **配置先:** `products/{product}/video/`（共有ディレクトリは作らない。プロダクトごとに構築）
>
> **画像生成:** Replicate に一本化（Nano Banana 廃止）。`create-image` スキル（`.claude/skills/create-image/SKILL.md`）を参照

---

## 前提

- Antigravityインストール済み・Gmailログイン済み
- Node.js 20 LTS インストール済み
- 対象プロダクトのCLAUDE.md §0にvideo/部署が追記済み（folder-lifecycle シナリオ2）
- `.claude/` はgitignore対象。Remotion Skillはセッション開始時に毎回インストールが必要

---

## STEP 1: Remotionプロジェクト作成

対象プロダクトの `video/` ディレクトリ内で実行:

```bash
cd products/{product}/video
npx create-video@latest
```

選択肢:
- Template → `Blank`
- プロジェクト名 → `.`（カレントディレクトリに展開。サブディレクトリを作らない）

```bash
npm install
```

> **注意:** `npm run dev` はフォアグラウンドでRemotion Studioを起動しターミナルをブロックする。バックグラウンドで起動する場合は `npm run dev &` を使用。

**確認:** http://localhost:3000 でRemotion Studioが表示される

---

## STEP 2: Remotion Agent Skillインストール

```bash
npx skills add remotion-dev/skills
```

プロジェクト内の `.claude/skills/` にルールファイルが追加される。
**承認済みスキル。プロジェクトローカル限定。** `.claude/` はgitignore対象のため、次回セッション開始時に再実行が必要。

---

## STEP 3: Antigravityでプロジェクトを開く

1. Antigravityで `File > Open Folder`
2. `products/{product}/video` フォルダを選択
3. Agent Managerビューに切り替え

---

## STEP 4: テスト動画を生成

エージェントに指示:

```
Remotion best-practicesスキルを読んで、以下の動画を作って。

仕様：
- 解像度: 1280x720、30fps、5秒
- 背景: 白
- 1秒目: 「テスト」というテキストがフェードイン
- 3秒目: テキストが赤に変化
- 5秒目: フェードアウト
- フォント: Noto Sans JP
```

**確認:** Remotion Studioでプレビューが表示される

---

## STEP 5: Replicate 画像を動画に組み込む

画像生成は Replicate CLI を使う（Session 169 厳格ルール: 1指示 = 1枚生成）。

```bash
# 下書き用（1枚だけ）
python scripts/replicate-generate/generate.py \
  --prompt "abstract gradient background, cinematic, 16:9" \
  --model flux-schnell \
  --num-outputs 1 \
  --out products/{product}/video/public/bg.png
```

生成後、Remotion の `<Img src="/bg.png" />` 等で背景に使う。

- モデル選択・枚数・保存先は `create-image` スキル（`.claude/skills/create-image/SKILL.md`）に従う
- スキルを経由せずに `generate.py` を直接呼ばない

**確認:** 画像が動画背景に組み込まれてプレビュー表示される

---

## STEP 6: MP4書き出し

```bash
npx remotion render src/index.ts MyVideo out/video.mp4
```

**確認:** `out/video.mp4` が生成され、再生できる

---

## セッション再開時

1. `npx skills add remotion-dev/skills`（`.claude/` がgitignore対象のため毎回必要）
2. `npm run dev &`（Remotion Studio起動）

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| Replicate が失敗 | `REPLICATE_API_TOKEN` が `.env` にあるか確認。ネットワーク・クォータ確認 |
| レート制限 | Replicate のアカウントクォータ上限。時間を置いて再実行 |
| Remotion Studioが真っ白 | `npm install` やり直し。Node.js 20 LTS確認 |
| レンダリング失敗 | Composition IDを確認（`src/Root.tsx` の名前と一致させる） |

---

## STEP 7: FFmpegで後処理（任意）

Remotionで書き出したMP4に対して、圧縮・字幕焼き込み・フォーマット変換等の後処理を行う。

**前提:** FFmpeg 8.1インストール済み（`winget install Gyan.FFmpeg`）

**共通スクリプト:** `scripts/ffmpeg-post.mjs`

```bash
# Web向け圧縮（50-70%サイズ削減）
node scripts/ffmpeg-post.mjs out/video.mp4 --compress

# 字幕焼き込み + 圧縮
node scripts/ffmpeg-post.mjs out/video.mp4 --subtitle subs.srt --compress

# WebM変換（ブラウザ埋込用）
node scripts/ffmpeg-post.mjs out/video.mp4 --format webm

# リサイズ + 圧縮（SNS向け720p）
node scripts/ffmpeg-post.mjs out/video.mp4 --compress --scale 720:-1

# 切り出し（0秒〜5秒）
node scripts/ffmpeg-post.mjs out/video.mp4 --trim 0:00-0:05

# サムネイル生成
node scripts/ffmpeg-post.mjs out/video.mp4 --thumbnail 0:02

# 複数動画の結合
node scripts/ffmpeg-post.mjs --concat a.mp4,b.mp4 --out merged.mp4
```

**典型的なワークフロー:**
1. `npx remotion render src/index.ts MyVideo out/video.mp4` — Remotionで書き出し
2. `node scripts/ffmpeg-post.mjs out/video.mp4 --compress` — Web配信用に圧縮
3. `node scripts/ffmpeg-post.mjs out/video.mp4 --thumbnail 0:02` — SNS投稿用サムネイル

---
v1.1 | 2026-03-20 | nano-banana-antigravityスキル削除（Antigravityネイティブ機能で代替）
v2.0 | 2026-03-20 | 配置先をproducts/{product}/video/に変更。サブディレクトリ問題修正。gitignore注記追加。セッション再開手順追加。dev serverバックグラウンド指示追加
v3.0 | 2026-03-27 | STEP 7追加: FFmpeg後処理（圧縮・字幕・変換・結合・サムネイル）。scripts/ffmpeg-post.mjs
v4.0 | 2026-04-14 | Nano Banana 廃止（Session 169）。画像生成を Replicate に一本化。STEP 5 を Replicate CLI ベースに書き換え
