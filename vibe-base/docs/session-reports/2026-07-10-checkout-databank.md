# 2026-07-10 Check-out（databank）— 削除の反映遅延根治 + 顧客ごと完全削除機能

> databank（独立repo）: main / HEAD `c2674f4`
> vibe-base: master / HEAD `4061976`（今セッション変更なし）
> **次セッションで本ファイル先頭から Read 必須**
> ※同日 `2026-07-10-checkout.md` は別セッション（x-auto-post）の成果物。混同しない。

## 🔴 最重要

1. **P1 #0「databank 実削除テスト」は完了・PASS。** マスターがブラウザ操作・AI が API でキー集合照合する分担で実施。同時削除で他書類が消えるレースは再発せず（baseline 消失 0）。前回引継ぎの残 H は解消。
2. **削除の反映遅延（10〜15分）を根治した。** 原因は公開 Blob URL への fetch が CDN の stale を返すこと（max-age 超でも `x-vercel-cache: HIT`・`useCache:false` は public では無効）。削除を「墓標ファイルの存在」で表し `list()`（CDN 非経由）で判定する方式に変更。**即時反映を実機確認。**
3. **本番実データは 14 件で不変・無傷。** テストは専用のテスト顧客のみで実施し、実データには一切触れていない。

## A. 本セッション TL;DR

1. P1 #0 実削除テストを実施し PASS（同時削除レース再発なし・baseline 14→14）
2. 削除反映遅延 10〜15分 を根治（墓標を別ディレクトリ `overrides/tombstone/` に置き、存在を list() で判定）
3. DELETE→POST（削除直後の再アップロード）で書類が消えたままになる再発バグを解消
4. パストラバーサル封鎖（cid/did を英数字ハイフンのみ許可・`cid=manifest/xxx` で他書類の目録を上書きできた穴）
5. 顧客ごと完全削除機能を新設（マスター指示・以前計画から欠落していた分を再実装）
6. 顧客削除の孤児防止（削除前に目録 strict 再取得・取得失敗/一部失敗で中断）
7. 検証パネル（code-reviewer / security-reviewer）を各2ラウンド通過し blocking を全解消

## B. 完了 commit 一覧（databank 独立repo・main）

| hash | 種別 | 内容 |
|---|---|---|
| 7d7d5a3 | fix | 書類削除の反映遅延を根治（墓標存在方式）+ DELETE→POST 消え残り解消 + パストラバーサル封鎖 |
| c2674f4 | feat | 顧客ごと完全削除機能（孤児防止：strict 再取得 + 一部失敗中断） |

## C. 影響波及

- **本番デプロイ**: business.kouheikosehira.com。削除が即時反映されるようになった。既存の墓標形式（旧：目録ファイルの中身が `{deleted:true}`）は後方互換で除外し続ける。新形式は `overrides/tombstone/{cid}__{did}.json`。
- **旧共有 `overrides/manifest.json`（12キー・生存）は読み取り専用のまま**。書き込みゼロを継続。
- **管理画面 UI 変更**: 既存「削除 →」を「書類を削除 →」にリネームし、各顧客行に「顧客を削除」を追加。原本顧客は管理画面に出ないため対象外。

## D. 残作業

### 優先度 M
- **databank 認証穴（P1 #1・既存課題）**: GET /api/documents は認証不要で顧客ID・書類名・Blob直リンクを全件返す。PASSWORD_HASH は無salt定数・非定数時間比較・レートリミット無し。今回の diff の regression ではない。
- **x-auto-post スレッド投稿本番化（P1 #2）**: 補充 ~7/12 期限。

### 優先度 L
- 墓標（`overrides/tombstone/` および旧形式）は削除のたび蓄積する。実害なし。掃除経路はいずれ。
- `delQuiet` は del 失敗を console.error に記録するが呼び出し側には成功に見える（内容 Blob のリーク可能性）。多層防御の欠如として記録。

## E. 配備済 subagent / skill / hook

なし（既存の code-reviewer / security-reviewer を利用）。

## F. 本セッション生成レポート

`tmp/` への恒久生成なし（検証用 `tmp/databank-check*.mjs` は使用後に削除）。baseline JSON は scratchpad（vibe-base 外・git 対象外）。

## G. 次セッション初手

1. 本ファイルを読む
2. P1 #0 は完了済み。次は P1 #1（認証穴）か #2（x-auto-post・7/12 期限）をマスターに確認
3. 機械検証（Wave A-2）: secret grep **0 件**・構文全 OK。npm test/lint/typecheck は **未定義（N/A）**
4. 検証パネル（Wave A-3）: セッション中に code-reviewer / security-reviewer を各2ラウンド通過。blocking（パストラバーサル・DELETE→POST 消え残り・顧客削除の取りこぼし孤児化）はすべて修正済み・実機で PASS 確認

## H. 本セッションで踏んだ失敗（再発防止）

1. **UTC 表記の `updatedAt` をローカル時刻と誤読**し、今日のデータを「昨日の残骸」と 2 度断定した。時刻を語る前にタイムゾーンを確定する。→ failures.md
2. **baseline を「不変の正」と思い込み**、削除済みが遅れて消えた 1 件を「喪失」と誤認した。マスターの「0ベースで思い込みを消せ」で是正。→ failures.md
3. **1回目のキャッシュ修正が中途半端**（`documents.js` だけ list() 化し `replace.js` を public で無効な `useCache:false` のまま残した）。検証パネルに突かれて再修正。修正は全経路を揃えてから検証する。
4. **顧客削除機能をマスター既指示なのに計画から落としていた**。「お前の都合で消えたなら再実行しろ」で再実装。指示された機能を勝手に落とすな。
