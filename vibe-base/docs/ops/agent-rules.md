# agent-rules — ポインタ

⚠️ **report 形式・plan 実走・調査・UI 設計・git 操作・ゲート判定に着手する前に canonical 本体を必ず Read せよ。**

詳細仕様（全文）→ `docs/rules/agent-rules-canonical.md`

## 要点（5 行）
- 思考原則 5 項＋報告ラベル制度（【実行済み】/【推測】/【未実行】を厳格に区別）
- 過失教訓の参照義務・自己検証 NG 早見表 K1〜K5（NG 検知＝即停止→マスター報告）
- plan 乖離時は停止義務／マイルストーン完了時は報告義務／危険項目は警告義務
- リスクタグ運用・GCP プロジェクト分離義務・法令表記ルール
- UI 設計基礎哲学＝カードベース独立設計（Component Encapsulation）

## 関連（canonical 内の節）
- 進捗管理 → 「進捗管理ルール」節
- プロダクト固有情報の記録場所 → 「記録場所」節
- git worktree 運用（正本 ADR-0003）→ 「git worktree 運用」節
- 調査データ優先チェーン・調査品質ルール → 同名節

> 本ファイルは product CLAUDE.md が `@import` する軽量ポインタ。全文を毎セッション context に載せないため、詳細は canonical を on-demand で読む。
