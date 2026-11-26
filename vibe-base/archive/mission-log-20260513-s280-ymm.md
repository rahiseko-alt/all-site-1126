## vibe-base 司令塔 Check-out: 2026-05-13 (Session 280) — ymm-shorts パイプライン実験成功確認

### 実施内容
1. **`ymm-pipeline-single.py`（汎用版）実装・スキル化完了**
   - 任意 ymmp のテンプレ構造（VoiceItem 件数・キャラ名）を自動読取
   - 「ラベル：セリフ」形式台本テキストをそのまま入力可
   - `.claude/skills/ymm-pipeline-single/` としてスキル化

2. **実験成功確認（マスター宣言）**
   - `ymm-pipeline-single.py` + 呪術+乙骨真希孫ばか.ymmp（8件）: セリフ書換 PASS・YMM4 起動 PASS
   - `auto-ymm4.py` + `step9b-csv-generator.py` + tenshoku_2.ymmp（24件）: 前セッション PASS
   - 動画出力（STEP 3）はマスター手動で対応可能な状態
   - **「これはこれで成立している」（マスター確認済み）**

3. **完成フロー（確定）**
   - STEP 1: Claude → セリフ書換 + YMM4 起動
   - STEP 2: マスター → Ctrl+A → 変ボタン → 一括再合成（VoiceItem Length は YMM4 自動修正）
   - STEP 3: マスター → Ctrl+Shift+E → 動画出力

4. **試行錯誤で判明した仕様**
   - 再合成後の VoiceItem Length は YMM4 が自動修正する（Python 側で調整不要）
   - ImageItem の Length/Frame 調整は未対応（将来タスク）
   - Ctrl+A で全選択すると ImageItem も影響を受けるため pyautogui 全選択は禁止

### 未解決事項
- ImageItem の位置・長さ調整（再合成後のセリフ長変化に伴う）→ 将来対応
- 動画出力フル完走の end-to-end テスト → 未実施

### 変更ファイル
- `products/ymm-shorts/src/ymm-pipeline-single.py` 新規（旧 ymm-pipeline.py リネーム＋機能追加後に --post-resynth 削除整理）
- `.claude/skills/ymm-pipeline-single/prompt.md` 新規
- `.claude/skills/ymm-tenshoku-pipeline/prompt.md` 新規

- **PC表バージョン:** 未照合（ymm-shorts は PC表運用対象外）
- **エラー回数:** 3回（--post-resynth 試行錯誤）
