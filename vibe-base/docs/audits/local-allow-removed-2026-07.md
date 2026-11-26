# local allow 危険系 38 件 — 削除台帳（復元用の正本）

> 実行: 2026-07-10 / 承認: マスター
> 削除前 allow **501** 件 → 削除後 **463** 件（差 38）
> バックアップ: `.claude/settings.local.json.bak-20260710`（git 管理外・repo 外にも二重コピー）
> リスクと手順: `docs/audits/local-allow-deletion-risk-2026-07.md`

## なぜこの台帳が要るか

`docs/audits/local-allow-triage-2026-07.md` は分類器が **現状から冪等に再生成**する。
削除が終わると候補 0 件になり、**何を消したかの記録が残らない**。部分復元（1 件だけ戻す）の原本は本ファイルである。

## 部分復元の手順

1. 下表から戻したい規則を 1 件選ぶ。**カテゴリごと一括で戻すな**（迂回構造が復活する）。
2. `.claude/settings.local.json` の `permissions.allow` に追記する。
3. `node scripts/audit-local-allow.mjs --check` が EXIT 1 を返す（危険系が復活したため）。意図的な復活であることをマスターに報告する。

## 全体復元（緊急時のみ）

```
cp .claude/settings.local.json.bak-20260710 .claude/settings.local.json
```

## 削除した 38 件

| # | allow 規則 | カテゴリ | 削除後の扱い |
|---|---|---|---|
| 1 | `Bash(powershell.exe:*)` | rm, curl, cmd, powershell | ask（都度確認） |
| 2 | `Bash(powershell:*)` | rm, curl, cmd, powershell | ask（都度確認） |
| 3 | `Bash(xargs -I{} taskkill //F //PID {})` | rm, curl, cmd, powershell, taskkill | ask（都度確認） |
| 4 | `Bash(sleep 30 && curl -sI https://app.review.kouheikosehira.com 2>&1 | head -10)` | rm, curl, cmd, powershell | **deny（完全ブロック）** — user 設定の `Bash(curl *)` が復活 |
| 5 | `Bash(xargs -r taskkill //F //PID)` | rm, curl, cmd, powershell, taskkill | ask（都度確認） |
| 6 | `Bash(curl:*)` | rm, curl, cmd, powershell | **deny（完全ブロック）** — user 設定の `Bash(curl *)` が復活 |
| 7 | `Bash(rm:*)` | rm, curl, cmd, powershell | ask（都度確認） |
| 8 | `Bash(taskkill:*)` | rm, curl, cmd, powershell, taskkill | ask（都度確認） |
| 9 | `Bash(cmd //c "taskkill /F /PID 11212")` | rm, curl, cmd, powershell, taskkill | ask（都度確認） |
| 10 | `Bash(python3 -c ":*)` | rm, curl, cmd, powershell, python-c | ask（都度確認） |
| 11 | `Bash(python -c ":*)` | rm, curl, cmd, powershell, python-c | ask（都度確認） |
| 12 | `Bash(cmd.exe /c "where ffmpeg" 2>/dev/null)` | rm, curl, cmd, powershell | ask（都度確認） |
| 13 | `Bash(cmd.exe /c "rmdir /s /q C:\\Users\\user\\Desktop\\vibe-base\\products\\ai-concierge" 2>&1)` | rm, rmdir, curl, cmd, powershell | ask（都度確認） |
| 14 | `Bash(cmd.exe /c tasklist)` | rm, curl, cmd, powershell | ask（都度確認） |
| 15 | `Bash(cmd.exe /c 'handle C:\\Users\\user\\Desktop\\vibe-base\\products\\ai-concierge\\app')` | rm, curl, cmd, powershell | ask（都度確認） |
| 16 | `Bash(powershell -Command "Remove-Item -Recurse -Force ''''C:\\Users\\user\\Desktop\\vibe-base\\products\\ai-concierge''''")` | rm, curl, cmd, powershell, Remove-Item | ask（都度確認） |
| 17 | `Bash(pip install:*)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 18 | `Bash(cmd.exe //c 'start "" "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir=C:\\tmp\\chrome-debug --no-first-run')` | rm, curl, cmd, powershell | ask（都度確認） |
| 19 | `Bash(cmd //c "start \\"\\" \\"C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe\\" --remote-debugging-port=9222 --user-data-dir=C:\\\\tmp\\\\chrome-debug --no-first-run")` | rm, curl, cmd, powershell | ask（都度確認） |
| 20 | `Bash(rm -f site-measurement.md site-measurement-raw.json site-measurement.html measurement-raw.json css-values.md)` | rm, curl, cmd, powershell | ask（都度確認） |
| 21 | `Bash(rm -f site-measurement.md site-measurement-raw.json site-measurement.html clone.html)` | rm, curl, cmd, powershell | ask（都度確認） |
| 22 | `Bash(rm -f "C:/Users/user/Desktop/vibe-base/.claude/rules/ui-clone.md")` | rm, curl, cmd, powershell | ask（都度確認） |
| 23 | `Bash(rm -f "C:/Users/user/Desktop/vibe-base/.claude/hooks/clone-quality-check.mjs")` | rm, curl, cmd, powershell | ask（都度確認） |
| 24 | `Bash(rm -f "C:/Users/user/Desktop/vibe-base/.claude/hooks/clone-prereq-check.mjs")` | rm, curl, cmd, powershell | ask（都度確認） |
| 25 | `Bash(pip3 install:*)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 26 | `Bash(cmd:*)` | rm, curl, cmd, powershell | ask（都度確認） |
| 27 | `Bash(./.venv/Scripts/python.exe -m pip install --upgrade pip setuptools wheel)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 28 | `Bash(./.venv/Scripts/python.exe -m pip install fiftyone)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 29 | `Bash(./.venv/Scripts/python.exe -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 30 | `Bash(cmd.exe *)` | rm, curl, cmd, powershell | ask（都度確認） |
| 31 | `Bash(./.venv/Scripts/python.exe -m pip install faster-whisper)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 32 | `Bash(pipeline/.venv/Scripts/python.exe -m pip install --upgrade pip)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 33 | `Bash(pipeline/.venv/Scripts/python.exe -m pip install -r pipeline/requirements.txt)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 34 | `Bash(./.venv/Scripts/python.exe -m pip install edge-tts)` | rm, curl, cmd, powershell, pip-install | ask（都度確認） |
| 35 | `Bash(rm -f icon-ai-answer-v1.png icon-ai-answer-v2-soft3d.png icon-ai-answer-v3-line.png icon-ai-answer-v5.png icon-aiueo-v1.png icon-foodee-v1.png icon-review-ai-v1.png thumb-ai-answer-v1.png thumb-ai-answer-v2.png thumb-aiueo-v1.png thumb-aiueo-v2.png thumb-foodee-v1.png thumb-foodee-v2.png thumb-review-ai-v1.png thumb-review-ai-v2.png logo-ai-answer-v1.png logo-aiueo-v1.png logo-foodee-v1.png logo-review-ai-v1.png)` | rm, curl, cmd, powershell | ask（都度確認） |
| 36 | `PowerShell(Remove-Item *)` | rm, curl, cmd, powershell, Remove-Item | ask（都度確認） |
| 37 | `PowerShell(Stop-Process *)` | rm, curl, cmd, powershell, Stop-Process | ask（都度確認） |
| 38 | `Bash(rm -f /tmp_root_coach_claude.md)` | rm, curl, cmd, powershell | ask（都度確認） |
