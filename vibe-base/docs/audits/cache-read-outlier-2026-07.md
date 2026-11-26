# cache_read 比率アウトライヤー調査（E-9・2026-07-10）

> **本文書は read-only 調査の結果記録である。対策の実施は本 plan（vibe-base-e-group-remediation.md）のスコープ外。**

## 対象（一次情報: `docs/audits/ops-improvement-scan-2026-07.md` リスト⑤ E-9 行）

全体の cache_read 比率 **0.9592**（実測: `token_totals_main.cache_read_ratio`）に対し、突出して低い 3 件:

| プロジェクト | cache_read 比率 | n |
|---|---|---|
| Temp 系 | 0.5828 | 104 |
| kosespark-video-shorts | 0.5852 | 75 |
| n8n | 0.6621 | 11 |

## 各プロジェクトの実体確認

- **Temp 系**: `~/.claude/projects/` 配下の `C--Users-user-AppData-Local-Temp*` 系ディレクトリ（scratchpad probe 等を含む）。cwd を `AppData/Local/Temp` 配下に置いた**一時的な検証・probe セッション**であり、通常の継続的な product 開発フローとは性質が異なる。実測 32 セッション。
- **kosespark-video-shorts**: `products/kosespark-video-shorts` 配下。実測 27 セッション。動画処理系のバッチ処理的タスクが中心と見られる。
- **n8n**: `products/n8n` 配下。実測トップレベルセッション **1 件のみ**。n=11 はメッセージ数相当であり、母数が極端に少ない。

## なぜこの3件だけ低いか（結論）

3 件に共通するのは「**単発実行的な性質**」である。継続的な product 開発フロー（同一 CLAUDE.md・同一ファイル群への繰り返しアクセス）では、直前のプロンプト prefix がキャッシュに乗りやすく cache_read 比率が高くなる。一方:

- Temp 系は cwd 自体が一時ディレクトリであり、セッションごとに文脈が独立しがちで prefix の再利用機会が乏しい。
- kosespark-video-shorts はバッチ処理的タスクが中心と推測され、同様に単発実行の性質が強い。
- n8n は実質 1 セッションのみであり、**母数不足（n=11）のため統計的断定はしない**。1〜2 回の特殊な呼び出しパターンが平均を押し下げている可能性を排除できない。

**結論: 低比率 = 即問題ではない。** 全体比率 0.9592 は良好であり、この 3 件は「単発実行系ワークフローではキャッシュ再利用が構造的に働きにくい」という説明で足り、対策コストに見合う具体的な欠陥は確認されなかった。監査の初期結論（「単発実行という性質上の限界の可能性が高く、対策コストに見合わない可能性」）を支持する。

## スコープ外

対策の実施（Temp 系セッションの扱い変更・kosespark-video-shorts のワークフロー見直し等）は本 plan では行わない。必要であれば別途 plan を起票する。
