---
description: 自走バックストップ体制が機能不全に陥っていないかを 6 区切りで自己検証
paths:
  - "**"
---

## 自己検証 6 区切り（必ず通せ）

1. **Check-in**: 内部定数 grep で「タグ ≠ 中身」を検知。計画書スナップショット陳腐化を現状ファイル照合で検知
2. **着手前**: 受入条件を箇条書き化、既存ファイルと1対1照合、純増判定（Refactor-on-Write）
3. **実装中（Edit/Write 各回）**: 直前 Edit を受入条件 #X に紐付け、glob 影響範囲確認、スコープクリープ即停止
4. **完了判定前**: 検証コマンド全件 EXIT 0 + hook 発火 + **実体ファイル存在** + ブラウザ目視
5. **コミット前**: unstaged 漏れ・xlsx/settings 巻き込み・memory.md vs git diff-stat 照合
6. **Check-out**: 次 AI が memory.md だけで再開できるか初見シミュレーション

## NG 時の即時対応

NG 検知 → **作業即時停止** → マスター報告（NG パターン名 + 検出箇所） → 方針合意 → 修正 → 再検証 OK 後に再開 → 教訓を 2 周目調整事項 or 該当 SOP に記録

## 3 つの再発パターン（毎ターン疑え）

- **タグ ≠ 中身**（Session 220-221 で 2 連発）
- **書いてある ≠ 効いている**（Session 222 T16 D4 runbook 全件不在）
- **計画書 ≠ 現状**（Session 216 で v8.5 → v9.1 乖離 / Session 218 T4 で純増 revert）

詳細: docs/ops/self-verification-sop.md / docs/ops/master-instruction-patterns.md（マスター反復指示カタログ + 仕組み化バックログ）

## Check-in 番号（A-nn）の採番

check-in 機械検証に項目を足す時、**実行時に「空き番号を探す」な**（並行 plan が同じ番号を取る）。plan の起票時に台帳で予約せよ。

詳細: docs/ops/check-in-number-registry.md（実装済み A-1〜A-24 / 予約済み A-25〜A-28 / 次の空き A-29・欠番の再利用禁止）

## Check-in A-23: vault 反映滞留検知

Check-in（区切り1）の機械検証に A-23（vault 反映の滞留検知）を含む。内部改善(session-report)の vault 自動転記が止まっていないかを最終成功日で検知し、7日超滞留で WARN。詳細: docs/ops/vault-reflection-reliability.md（確実性2層設計・schtasks 再登録手順・二重の網）
