> ⚠️ 要点は `.claude/rules/video-production.md` で自動注入される。ここは詳細版。

# 外部AI連携リファレンス（Antigravity用）

> Antigravityが動画・画像生成タスクで参照する技術リファレンス。
> 原本: `C:\Users\user\Downloads\プロジェクトプロンプト_Claude外部AI連携.md`（2026-03-20）
>
> **⚠️ 外部サービス情報は2026-03時点。利用前に公式サイトで料金・仕様を必ず確認せよ。**
> **⚠️ Remotion・Replicate 以外の外部サービス（ElevenLabs, Luma, Sora等）はP0 S4フィルタ未通過。利用前にマスター承認を取れ。**
> **⚠️ Nano Banana は廃止（Session 169）。画像生成は Replicate に一本化。**

---

## 基本方針

Antigravityの役割は3つだけ:
1. 最適なプロンプトを作る
2. API/CLIを叩くコードを書く
3. ワークフロー全体を実行する

生成エンジンは外部サービスに任せる。

---

## 配置ルール

動画制作環境は各プロダクトの `video/` 部署に構築する（folder-lifecycle シナリオ2: 部署増設）。
共有ディレクトリは作らない。手順書（本ファイル + `docs/ops/antigravity-remotion-setup.md`）は共通、実体は各プロダクトに分離。

```
products/{product}/
├── CLAUDE.md        ← §0にvideo/部署を追記
├── app/
├── lp/
└── video/           ← Remotionプロジェクトをここに構築
```

---

## 利用可能な外部サービス（2026-03 時点）

### 承認済み（Antigravity標準運用）

| サービス | 用途 | 利用方法 | 備考 |
|----------|------|----------|------|
| **Replicate**（flux 系） | 画像生成 | `create-image` スキル（`.claude/skills/create-image/SKILL.md`）に従う。生成エンジンは `scripts/replicate-generate/generate.py`、REPLICATE_API_TOKEN 必須 | モデル選択・枚数・保存先はスキルが定義 |
| **Remotion** | 動画生成（React） | プロジェクトローカルにSkill追加 | 個人・3人以下チーム無料 |

### 未承認（利用前にマスター承認必須）

| サービス | 用途 | 無料枠 | フィルタ状態 |
|----------|------|--------|-------------|
| Luma Dream Machine（Ray3） | 映像生成 | あり | **未通過** |
| ElevenLabs | 音声生成 | 月約10分 | **未通過** |
| Sora 2（OpenAI） | 映像生成 | なし（有料） | **未通過** |
| DALL-E 3（OpenAI） | 画像生成 | なし（有料） | **未通過** |
| OpenAI TTS | 音声生成 | なし（有料） | **未通過** |

> **Midjourney:** 公式APIなし。非公式APIは規約違反リスク。使用禁止。

---

## Antigravity向けレシピ

### レシピ1: Remotion × Replicate で動画生成（推奨・承認済み）

1. 対象プロダクトの `video/` 部署にRemotionプロジェクトを構築（folder-lifecycle シナリオ2準拠）
2. Remotion Agent Skillをインストール（`npx skills add remotion-dev/skills`。プロジェクトローカル限定。承認済み）
3. 画像は Replicate で生成（`scripts/replicate-generate/generate.py`）。複数生成禁止、指示ごとに 1 枚
4. 日本語プロンプト → Replicate で画像生成 → 動画コード生成 → MP4書き出し
5. セットアップ手順: `C:\Users\user\Desktop\ClaudeCode\vibe-base\docs\ops\antigravity-remotion-setup.md`

### レシピ2: Luma Dream Machine でシネマティック映像（⚠️ 未承認）

1. Antigravityで英語プロンプトを生成
2. Luma UIに貼り付けて映像生成
3. 生成映像をRemotionに組み込み
4. **マスター承認を先に取ること**

### レシピ3: ElevenLabs でナレーション付き動画（⚠️ 未承認）

1. Antigravityで原稿を生成
2. ElevenLabs APIで音声化
3. Remotionで映像+音声を結合
4. **マスター承認を先に取ること**

---

## プロンプトテンプレート

### Replicate 画像生成用

`create-image` スキル（`.claude/skills/create-image/SKILL.md`）に従う。
生成エンジンは `scripts/replicate-generate/generate.py`。
スキルを経由せずに直接呼ばないこと。

### Remotion用（Antigravityへの指示の型）

```
Remotion best-practicesスキルを読んで、以下の動画を作って。

仕様：
- 解像度: [1920x1080]、[30]fps、[秒数]秒
- [秒数]秒目: [要素]が[アニメーション]
- [秒数]秒目: [要素]が[アニメーション]
- フォント: Noto Sans JP
```

> 解像度・fps・秒数を先に宣言。秒数ベースで指示。数値で指定（「80px」「1秒かけてフェードイン」）。「大きく」「ゆっくり」等の曖昧表現禁止。

### Sora 2用（英語、80〜150語。⚠️ 未承認・有料）

```
[カメラワーク: Slow dolly-in / Aerial tracking / Static wide shot 等]
[被写体の動き: 具体的なアクション]
[環境・照明: 時間帯、光源、色温度]
[スタイル/ムード: Cinematic, documentary, SNS-ready 等]
[技術指定: 4K, shallow depth of field, warm color grading 等]
```

> 日本語→英語変換を必ず挟む。日本語のままSoraに投入しない。

---

## 禁止事項

- 未承認外部サービスをマスター許可なく使うこと
- Midjourneyの非公式APIを使うこと
- 他人の顔・声のAI無断生成
- APIキーをコードに直書き（.env管理を徹底）
- テスト段階で高解像度・長尺を使うこと（テストは720p × 3〜5秒）
- **未承認スキルのインストール**（承認済み: `remotion-dev/skills`（プロジェクトローカル限定）。それ以外はマスター承認必須）

---
v1.0 | 2026-03-20 | 原本をAntigravity向けに再構成
v2.0 | 2026-03-20 | 配置ルール追加。外部サービスを承認済み/未承認に分離。CLIパス削除。フィルタ警告追加
