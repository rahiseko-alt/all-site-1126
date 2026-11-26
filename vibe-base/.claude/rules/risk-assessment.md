---
description: リスク診断・リスク台帳・ドン詰まり台帳に関するルール
paths:
  - "**/risk-diagnosis.md"
  - "**/risk-registry.md"
  - "**/dead-end-registry.md"
---

## リスクタグ
- 4種: Aout（規約違反）/ Gray（曖昧）/ Judge-Able（データ不足）/ Clear（安全）
- 出力先（誰が被害を受けるか）で分類せよ: A1-A4（事業者）、B1-B4（顧客）、C1-C4（第三者）
- 入力（どの技術を使うか）ではなく出力で判定

## 運用（v4.0 中央台帳照合判定・Session 293）
- 新規product立ち上げ時に中央台帳照合判定: 共有リスク台帳（risk-registry.md・55 件以上）を全件読み、採用サービスごとに「合う / 合わない / 一部合う / 該当なし」を判定
- 「一部合う」「該当なし」検知時は vibe-base にエスカレーション → マスター承認後に台帳逆登録（3 段階目資産形成ループ）
- 各マイルストーン完了時に判定を再評価し、新規採用サービスを台帳と照合追加して risk-diagnosis.md を更新
- Gray タグが減らないまま次マイルストーンに進む場合は vibe-base に報告
- 共有リスク台帳（risk-registry.md）への記入は vibe-base のみ。担当AIは閲覧のみ

## ドン詰まり台帳
- 外部サービスの既知制約を事前確認せよ（立ち上げ時に必ず照合）
- Google API承認=数日〜数週間、Google OAuth=最大6週間、Stripe Live=7日、Vercel Hobby=非商用限定

詳細: docs/ops/risk-diagnosis-sop.md / docs/ops/risk-registry.md / docs/ops/dead-end-registry.md
