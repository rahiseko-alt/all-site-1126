# check-in 機械検証 番号台帳（A-nn の単一正本）

> `scripts/check-in-verify.sh` の点検項目番号 `A-nn` の割当を一元管理する。
> **新しい plan で check-in 項目を追加するときは、実行時に「空き番号を探す」な。ここで先に予約せよ。**

## なぜこの台帳が要るか

2026-07-10 時点で、未実装の 3 本の plan が**それぞれ別用途で A-25 を使う**と書いていた（三重予約）。
実体の `check-in-verify.sh` に A-25 はまだ無く、先に走らせた 1 本が番号を取り、後の 2 本は上書きするか壊れる状態だった。

「実装時点で次の空き番号を採番する」という方式は、**並行して走る plan が同じ番号を取る**ため機能しない。
番号は plan の起票時に予約し、本ファイルに記録する。

## 実装済み（`check-in-verify.sh` に実在）

実測コマンド: `grep -oE 'A-[0-9]+' scripts/check-in-verify.sh | sort -u`

A-1 / A-4 / A-5 / A-6 / A-7 / A-9 / A-11 / A-12 / A-19 / A-20 / A-21 / A-22 / A-23 / A-24

> A-2・A-3・A-8・A-10・A-13〜A-18 は過去に欠番化した（履歴は git log 参照）。**再利用するな**（古いレポートとの照合が壊れる）。

## 予約済み（未実装・plan が確保している）

| 番号 | 用途 | 予約している plan |
|---|---|---|
| A-25 | SOP 索引が実体とズレていないかの検知（WARN） | `~/.claude/plans/vibe-base-s-group-remediation.md` |
| A-26 | 持ち越し滞留の検知（`[blocked:*]` は除外） | `~/.claude/plans/vibe-base-m-group-remediation.md`（M-5） |
| A-27 | 失敗自己学習ループの健全性チェック | `~/.claude/plans/valiant-shimmying-stearns.md` |
| A-28 | 自動実行ジョブの state 照合 | `~/.claude/plans/concurrent-wiggling-avalanche.md`（C-0） |

**次の空き番号: A-29**

## 新しい番号を取る手順

1. 本ファイルの「次の空き番号」を見る。
2. plan にその番号を**固定で**書く。「実装時点で採番」と書くな。
3. 本ファイルの予約表に 1 行足し、「次の空き番号」を更新する。
4. 実装したら予約表から「実装済み」へ移す。

## 着手時の衝突チェック

plan を実走する前に、自分の番号が先取りされていないか確認する。

```bash
grep -c "A-27" scripts/check-in-verify.sh   # 0 なら未実装＝予約どおり使える
```

1 以上を返したら**自分で採番し直さず、作業を停止してマスターに報告**する（別の plan が先に取った証拠）。
