# ymm-shorts memory archive (2026-06)
> 元 products/ymm-shorts/memory.md から移行した P3・P4 コンテンツ
> 作成: 2026-06-10 / コンテキスト改革 Phase C

## P4: 永続教訓（移行元 memory.md から）

- [importance:H][2026-05-23] **soccer パイプライン完成確定（Session 308）**
  - Stage 1〜4 の通し動作確認済み。`Claude用サンプル.ymmp`（9 VoiceItem）が正本テンプレート。
  - auto-ymm4.py の `EXPECTED_VOICEITEM_COUNT=24` は転職テンプレ向けのハードコード → soccer テンプレでは FAIL 表示が出るが**誤検知**（セリフ書込・VoiceCache クリアは PASS）。マスター「ここまでで完成で良い」確認済み。
  - マスター手動工程（フェーズ A 音声再合成・フェーズ B 動画出力）は今後も変わらない上限。

- [importance:H][2026-05-23] Stage 1〜4 動作確認済みコミット完了。synthesis-input.csv は `src/output/`（gitignore）に生成されマスター手動合成用。

## 詳細経緯メモ（CLAUDE.md §4 から移行）

- **2026-05-11 Session 274**: マスター指示「専用フォルダを作り引継ぎをしろ・ルール通りやれ」で本プロダクトフォルダ昇格。
- **2026-05-12 Session 276**: マスター指摘「設立時のルールに沿った設立がされていない」→ 司令塔が folder-lifecycle.md シナリオ 1 ステップ 2/4/5 違反を検出。`HANDOVER.md` → `handoff.md` リネーム実施。
- **2026-05-12 Session 277**: マスター指摘「既にツールじゃないだろ。開発として扱え」→ `tools/ymm-template/*` 26 ファイル → `products/ymm-shorts/src/` 集約。
- **2026-05-12 Session 278**: マスター判断「再開」確定。残タスク #4 完遂。段階試運転 2/3 無駄作業として閉鎖（マスター指摘）。
- **2026-05-12〜13 Session 279**: Plan A（フル自動化）破綻 → v3 方針転換（動画出力マスター手動委譲）。CSV インポート方式の根本破綻判明（Layer/Frame/Length が全消失）。§3.1 §3.2 大原則記録（完全手動運用提案禁止・精密調整破壊禁止）。
- **2026-05-23 Session 308**: soccer パイプライン（Stage 1〜4）動作確認済み完成。

## 司令塔過失教訓（覚醒済 4 件）

1. 段階試運転 2/3 を無駄案内（マスター実機経験者に不要）
2. マスター手動工程に pyautogui 自動化可能なものを含めた
3. pyautogui 動作中にマスター画面確認・コマンド貼付を強要（PowerShell `&&` 非対応）
4. 「完全手動運用」を選択肢に挙げた → 激怒（本プロダクトの存在意義否定）
