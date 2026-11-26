# local allow 危険系 38 件の削除 — リスク想定とリカバリー対策

> 作成: 2026-07-10 / 承認: マスター（「許可するがリスクの想定とリカバリー対策を用意してから実行しろ」）
> 対象: `.claude/settings.local.json` の `permissions.allow` のうち危険系 38 件
> 検出器: `scripts/audit-local-allow.mjs`（selftest 内蔵）
> 削除台帳（復元用の正本）: `docs/audits/local-allow-removed-2026-07.md`
>
> **実行済み（2026-07-10）**: allow **501 → 463 件**（38 件削除）。`--check` EXIT 0・JSON 健全・巻き込み 0 件。
> 母数は監査時点 493 → 本作業の直前 501（セッション中の承認で増えたため）。**件数はハードコードせず都度実測すること。**

## 0. 大前提（この作業の安全側の性質）

**allow の削除は権限を増やさない。** 削除は「自動通過」を「都度確認（ask）」または「拒否（deny）」に戻す方向にしか働かない。
したがって本作業に**セキュリティ後退のリスクは無い**。想定すべきリスクは次の 3 種に限られる。

1. 設定ファイルの破壊（JSON 構文エラー）
2. 正当な運用操作が止まる（摩擦の増加・完全ブロック）
3. 誤って危険系以外の行を消す

## 1. 削除後に各コマンドがどう扱われるか（実測）

削除すると local allow が無くなり、上位スコープ（project / user）の deny・ask が効くようになる。

| カテゴリ | 件数 | 削除後の挙動 | 根拠 |
|---|---|---|---|
| **curl** | 2 | **deny（完全ブロック）** | user `~/.claude/settings.json` に `Bash(curl *)` の deny が実在。local allow がこれを**上書きしていた**（E-2 が指摘した迂回構造そのもの） |
| rm | 8 | `rm -rf` は **deny**、それ以外の `rm` は **ask** | project `.claude/settings.json` に `Bash(rm -rf:*)` の deny |
| cmd / powershell | 12 | **ask** | deny・ask ともに未登録 → 既定の確認プロンプト |
| taskkill / Stop-Process | 5 | **ask** | 同上 |
| pip install | 9 | **ask** | 同上（`npm install` は deny なので非一貫。E-2 で揃える） |
| python -c | 2 | **ask** | 同上（`node -e` は ask なので整合する） |
| Remove-Item | 2 | **ask** | 同上 |
| rmdir | 1 | **ask** | 同上 |

> カテゴリ別は延べ数（1 規則が複数該当しうる）。規則の実数は 38。**両者を足すな。**

## 2. リスク想定と対策

| # | リスク | 起こると何が起きるか | 発生確率 | 対策（実行前に用意する） |
|---|---|---|---|---|
| R-1 | **JSON を壊す** | permission 評価が壊れ、全ツール呼出が停止しうる。`settings.local.json` は **`.gitignore` 対象で git から復元できない** | 中 | ①作業直前に `.bak-20260710` を取る ②**repo 外**（scratchpad）にも二重コピー ③書き込みは**アトミック**（tmp へ書く → `JSON.parse` 検証 → rename）④1 件削除ごと・10 件ごとに検証 |
| R-2 | **curl が完全に使えなくなる** | デプロイ後の疎通確認など、curl を使う手順が deny で止まる | 高（設計どおり） | `WebFetch` ツールで代替する（自社ドメインは allow 済）。どうしても curl が要る場合は**削除後に**「特定 URL 限定の allow」をマスター承認のうえ追加する。**deny を消して戻すのは禁止** |
| R-3 | **正当な Windows 運用が ask 地獄になる** | `cmd.exe /c "where ffmpeg"`・chrome デバッグ起動・`tasklist` などで毎回確認が出る | 高（設計どおり） | 1 セッション運用して**実際に困った 1 件だけ**を個別 allow で戻す（E-2 の手順）。先回りして広い allow を足さない |
| R-4 | **pip install が ask になり venv 構築が止まる** | kosespark-video-shorts / pipeline 系のセットアップが都度確認になる | 中 | セットアップは頻度が低く、ask で足りる。自動化ジョブは Claude Code の permission を通らないため影響しない |
| R-5 | **危険系以外の行を巻き込んで消す** | 461 件のうち無関係な allow が消える | 低 | 削除は**分類器が dangerous と判定した文字列との完全一致**でのみ行う。削除前後で「消えた集合 = 危険系 38 件」を機械照合する |
| R-6 | **古い `.bak-pre-p6`（7/2）で復元してしまう** | 7/2 以降に追加された 6 件が巻き戻り、別の不整合を生む | 低 | 復元先は**必ず `.bak-20260710`**。`.bak-pre-p6` は触らない。復元手順に明記する |
| R-7 | **hook・自動ジョブが止まる** | Check-in / propagate / schtasks が失敗する | 極低 | hook は permission 系を通らない（`hook-runner.mjs` が直接 spawn）。schtasks は Claude Code の外。**影響なし**と判断 |
| R-8 | **並行セッションが同時に settings を書く** | 片方の変更が消える | 低 | 作業中は他セッションで `temporal-gliding-turing`（allow 追加）を走らせない。着手直前に現物を読み直す |

## 3. リカバリー手順（実行前に必ずリハーサルする）

### 3-1. 復元コマンド（唯一の正）

```bash
cp .claude/settings.local.json.bak-20260710 .claude/settings.local.json
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.local.json','utf8'));console.log('ok')"
```

`.bak-pre-p6` は**使わない**（7/2 時点の古い状態）。

### 3-2. repo 外の二重バックアップ

`.gitignore` 対象のため git では戻せない。scratchpad にも 1 部置く。

```
<scratchpad>/settings.local.json.bak-20260710
```

### 3-3. 部分復元（特定の 1 件だけ戻したい時）

削除した 38 件の原文は **`docs/audits/local-allow-removed-2026-07.md`（削除台帳）** に残る。

> ⚠️ `local-allow-triage-2026-07.md` は分類器が**現状から冪等に再生成**するため、削除完了後は候補 0 件になり
> 「何を消したか」の記録が残らない。**部分復元の原本は triage 表ではなく削除台帳である。**
> （実行時にこの落とし穴を踏んで台帳を後付けした。）

必要な 1 件だけを `permissions.allow` に手で戻す。**カテゴリごと一括で戻すな**（迂回構造が復活する）。

### 3-4. 撤退基準

次のいずれかが起きたら**即座に 3-1 で復元し、作業を中止してマスターに報告**する。

- `JSON.parse` が 1 度でも失敗した
- 削除後の allow 件数が `499 - 38 = 461` と一致しない
- 消えた集合に危険系 38 件以外が 1 件でも含まれる

## 4. 実行手順（段階展開・一括削除禁止）

| 段 | 操作 | 検証 | 実行結果（2026-07-10） |
|---|---|---|---|
| 0 | 現状の allow 件数と危険系件数を記録 | 実測値を控える | 501 / 38 |
| 1 | `.bak-20260710` を作成（`cp`。`mv` 禁止）+ scratchpad へ二重コピー | 原本・repo内・repo外の sha256 が三者一致 | ✅ 一致 |
| 2 | **復元リハーサル**: `.bak` を一時ファイルへ復元し sha256 と JSON を確認 | 一致・JSON 健全 | ✅ |
| 2b | **バックアップ検知ガードの負のテスト**: bak を隠して `--prune` が中止するか | EXIT 2・原本無傷 | ✅ EXIT 2 |
| 3 | **1 件だけ削除** → `JSON.parse` 検証 | allow が 1 減・消えたのは対象 1 件のみ | ✅ 501→500 |
| 4 | 残り 37 件を **10 件ずつ** 削除 → 各回 `JSON.parse` 検証 | 各回 EXIT 0 | ✅ 4 波（10/10/10/7） |
| 5 | 最終検証 | `--check` EXIT 0 / 消えた集合 = 危険系 38 件 / 増加 0 件 | ✅ 501→463 |
| 6 | **削除台帳を生成** | 38 行 | ✅ `local-allow-removed-2026-07.md` |
| 7 | triage 表を再生成 | 削除候補 0 件 | ✅ 0 件 |

## 5. この作業で**やらないこと**

- **deny の削除・緩和**（curl の deny を消して allow に戻す等）。R-2 の対策を参照。
- **個別 allow の先回り追加**。E-2 の手順（1 セッション運用 → 困った 1 件だけ復活）に従う。
- **`settings.json`（project / user）への変更**。本作業は `settings.local.json` の allow 削除のみ。
- **`.bak-pre-p6` への操作**。
