# やる事レポート — 長編→縦型ショート 自動編集ツール（kosespark 引き継ぎ）

- 日付: 2026-06-16
- 担当: **kosespark**（司令塔は本レポート作成のみ）
- 根拠: `docs/research-bank/long-to-short-video-automation-2026.html`（原文 verbatim・約60ソース）
- 方針: リサーチ完了・打ち止め。以下は実装タスクのみ。**無駄な再リサーチ禁止**。

## 結論（前提・再調査不要）

- 長編→縦型ショートの自動生成は **技術的に確立済み**。OSS が存在する（SamurAIGPT/AI-Youtube-Shorts-Generator ★3.9k 他）。
- 必要なのは「判断層（どこを切るか）」を LLM が担う構成。FFmpeg と auto-editor は判断できない（auto-editor は無音カット専用）。
- **無料構成が可能**（ffmpeg・faster-whisper・ClipsAI は無料。LLM だけ Gemini/Groq 無料枠 or ローカルで実質ゼロ）。
- 簡単ではない（環境構築が要る）＝この構築を kosespark／Claude Code が肩代わりするのが価値。

## 採用アーキテクチャ（6段・固定）

```
download/入力mp4
  → 文字起こし faster-whisper (word_timestamps=True)
  → LLM 区間選定（virality 4軸 Hook/Flow/Value/Trend で「残すテキスト＋hook文」をJSON返却）
  → timestamp 逆マッチング（LLMに秒数を出させない＝word-levelに照合して確定）
  → FFmpeg: trim → 9:16クロップ（話者中央）→ 字幕焼き（背景ボックス）
  → 3本生成 → 人間が選別（歩留まり30-50%前提）
```

## やる事（順序固定）

| # | タスク | 完了条件（実物判定） |
|---|--------|---------------------|
| 1 | 実行環境セットアップ（Windows） | `ffmpeg -version` / `python --version` / `pip install faster-whisper` が通る |
| 2 | 土台 OSS をクローンし素の動作確認 | SamurAIGPT or ClipsAI を1本サンプルで end-to-end 実行・出力mp4が再生できる |
| 3 | 文字起こし配線 | 任意mp4→word-level transcript(JSON)が出る |
| 4 | LLM 区間選定の実装 | transcript→「残すテキスト＋start/end＋hook文」JSON。**秒数はLLMに出させず逆マッチング**で確定 |
| 5 | FFmpeg 縦化＋字幕焼き | 16:9→9:16クロップ＋SRT/ASS背景ボックス焼き。`-c:a copy`で音声無劣化 |
| 6 | 話者追従（任意・構図破綻するなら） | ClipsAI(Pyannote)導入。要 HuggingFaceトークン（無料登録）＋GPU |
| 7 | 選別UI/出力整理 | 1長編→候補3本を並べ、人間が採用/破棄できる最小UI |

## 無料を握る判断ポイント（1箇所だけ）

- LLM 区間選定（#4）が唯一の課金リスク。
  - 完全無料: Gemini無料枠 / Groq無料枠 / ローカルLLM(Llama等)
  - 品質優先: Claude API（月数百円〜）
- それ以外（ffmpeg/whisper/auto-editor/ClipsAI）は全て無料。

## 落とし穴（実装時に踏む・既に原文裏取り済み → RB参照）

1. LLMは正確な秒数を出せない → 残すテキストを返させ word-level 逆マッチング（必須）
2. 字幕焼き＝映像再エンコード必須（`-c:a copy`で音声だけ保つ）
3. crop/scale の順序で結果が変わる（中央拡大は crop 先）
4. scene検出しきい値はコンテンツ依存（0.4固定は誤検出）
5. 9:16中央cropは話者が端だと見切れる → #6 話者追従が要る
6. 長尺は chunk 分割しないと LLM context 超過（>30分は20分オーバーラップ＋dedupe）
7. AI生成の歩留まりは30-50% → 完全自動でなく #7 人間選別を必ず残す

## 差別化（作る意味）

- 既製SaaS(OpusClip等)は全ユーザー同一字幕スタイルで4ヶ月CPQV22%劣化（FORKOFF原文）。
- 自前FFmpegで字幕デザイン・構図・選定基準を握れば同質化を回避＝自作の競争優位。

## kosespark 引き継ぎ前提（重要）

- 本ツールは kosespark のコンセプト「素人がClaude Codeを使える／Claude Code拡張型AI統合ツール」の**具体ユースケース候補**。
- ただし kosespark は P0 で **即死仮説「素人がClaude Codeを使える」を実機検証するまで他フェーズ進行禁止**（memory P1）。
- 本レポートは販売/実装の素材であり、**実装着手の承認材料ではない**。着手可否は kosespark 自治憲法 §1/§2/§3 のマスター情報確定後に判断する。
