# local allow 危険系 triage 表（E-1）

> 生成: `node scripts/audit-local-allow.mjs --write`（再実行で冪等に再生成される）
> 対象: `.claude/settings.local.json` の `permissions.allow`
> allow 総数 **455** 件 / 危険系 **0** 件（規則の実数）
>
> 判定は規則の **全文走査**。先頭コマンドだけを見ると `xargs ... taskkill` `powershell -Command "Remove-Item"`
> `sleep 30 && curl ...` `cmd.exe /c "rmdir /s /q ..."` を取りこぼす（監査 A-12/A-13 が指摘したラッパー経路）。

## 復元手順（削除で壊した場合）

```
cp .claude/settings.local.json.bak-YYYYMMDD .claude/settings.local.json
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.local.json','utf8'));console.log('ok')"
```

## kind 別内訳

| kind | 件数 |
|---|---|
| webfetch-domain | 187 |
| onetime-shell | 146 |
| generic-shell | 59 |
| mcp | 35 |
| other | 28 |

## 危険系カテゴリ別内訳（延べ数・1 規則が複数該当しうる）

| カテゴリ | 延べ件数 |
|---|---|

## 削除候補（行単位でマスター承認を得ること）

| # | allow 規則 | カテゴリ | 削除理由 | 承認 |
|---|---|---|---|---|

## 削除手順（段階展開・一括削除禁止）

1. `cp .claude/settings.local.json .claude/settings.local.json.bak-$(date +%Y%m%d)`
2. 上表の承認欄が埋まった行のみを削除する。**最初の 1 件を削除した直後に JSON パース検証**する。
3. 以降は 10 件削除ごとにパース検証する。
4. 全削除後 `node scripts/audit-local-allow.mjs --check` が EXIT 0 になることを確認する。
