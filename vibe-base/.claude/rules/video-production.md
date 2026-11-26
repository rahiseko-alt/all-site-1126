---
description: 動画制作・Remotionセットアップ・AI画像ツールのルール
paths:
  - "products/*/video/**"
---

## 動画戦略
- 戦略テーブルを先に作れ（エントリ動画/エグジット動画/分岐動画。ファネル: 認知→興味→行動）
- 最低限: エントリ1本（7〜30秒、Reels用）+ エグジット1本（30〜90秒、LP埋め込み用）

## テロップの情報源
- 現在のLP + 検証済み仮説テーブル（✅のもの）のみ使用可
- 旧設定・過去動画・CLAUDE.mdのデータからテロップを作るな
- LPの文言が変わったら動画も更新が必要

## ツール
- 承認済み: Remotion（無料、React動画）+ Replicate（画像生成。`create-image` スキル＝`.claude/skills/create-image/SKILL.md` に従う）
- 未承認（マスターGO必要）: Luma / ElevenLabs / Sora / DALL-E 3 / OpenAI TTS
- 禁止: Midjourney（公式APIなし。非公式API=規約違反）

## Remotionセットアップ
- 各プロダクトに独立した video/ ディレクトリを作れ（共有禁止）
- npm run dev はターミナルを占有するので & でバックグラウンド実行

Remotion雛形のvest1: docs/standards/boilerplate/ を参照

詳細: docs/ops/video-production-sop.md / docs/ops/antigravity-remotion-setup.md / docs/ops/antigravity-tools-reference.md
