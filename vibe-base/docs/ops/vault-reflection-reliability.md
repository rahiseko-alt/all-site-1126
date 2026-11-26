# vault 反映の確実性設計（内部改善 → vault 常時反映）

> 目的: 司令塔の内部改善ログ（push 済 `docs/session-reports/*.md`）を Obsidian vault `セッション改善/` へ
> **確実に**反映し、過去情報（分析/トレンド/公式情報/知見）と混ざって新発想（opportunity-scan）の糧にする。
> 本書は「確実に実行する層」と「検証して確度を上げる層」の正本。

## 全体像

```
[内部改善] checkout が docs/session-reports/*.md を生成・push（origin/master）
      │
      │  層1: 確実に実行（無人・機械強制）
      ▼
  scripts/x-vault-sync.mjs  ── schtasks x-vault-sync(08:00 + ログオン時)
      │   ・git fetch → git ls-tree origin/master で session-report 全件を列挙
      │   ・basename 保存で冪等全同期（取りこぼし自己回復・累積爆発なし）
      │   ・成功で vault-sync-state.json に last-success を記録
      ▼
[vault] セッション改善/  ←堆積→  分析/・トレンド/・公式情報/・知見/（既存）
      │
      │  層2: 検証して確度を上げる（自己検証ループ＋二重の網）
      ├─ scripts/x-vault-sync-verify.mjs ── schtasks(08:15)
      │     当日 sync 成功を state で判定。3連続失敗で Desktop マーカー。
      ├─ Tier1: .claude/hooks/session-start-vault-reflection-check.mjs
      │     7日滞留で次セッション開始時に AI へ警告注入（root専用・exit0非ブロック）。
      └─ Tier2: scripts/check-in-verify.sh A-23 → check-vault-reflection-drift.mjs
            /pc-checkin 実行時にマスターが WARN を視認。
      ▼
[新発想] feed-check ワンセットで opportunity-scan（過去×新能力）→ その場でマスター承認（別タスク）
```

## 構成ファイル

| 役割 | ファイル |
|------|---------|
| 反映本体（全同期・冪等・state記録） | `scripts/x-vault-sync.mjs` |
| 検証（当日成功判定・連続失敗カウント） | `scripts/x-vault-sync-verify.mjs` |
| 状態正本（最終成功日・連続失敗） | `~/.claude/logs/vault-sync-state.json`（git外・PCローカル） |
| 状態 lib（副作用ゼロ・双方が import） | `scripts/_lib/vault-sync-state.mjs` |
| schtasks 堅牢化登録（再登録の正本） | `scripts/register-vault-sync-tasks.ps1` |
| 滞留検知 hook（Tier1・root専用） | `.claude/hooks/session-start-vault-reflection-check.mjs` |
| 滞留判定（Tier2・check-in用） | `scripts/check-vault-reflection-drift.mjs` |

## 確実性の根拠

- **冪等＋自己回復**: 毎回 `origin/master` 全件を見て basename 保存。ある日 PC オフでも翌日に全 session-report を回収（取りこぼしゼロ）。同名上書きで累積しない。
- **schtasks 堅牢化**: `StartWhenAvailable`（時刻にオフでも起動後すぐ実行）＋ 再試行2回/10分 ＋ 毎日＋ログオン時の複数トリガー。
- **二重の網**: 無人実行が静かに死んでも、(Tier1) 次セッションで AI が気づく ＋ (Tier2) /pc-checkin でマスターが視認。
- **single source of truth**: 最終成功日は `vault-sync-state.json` の1箇所。sync が書き、verify と hook と check-in が読む。

## schtasks 再登録手順（PC初期化・タスク消失時）

schtasks は OS 資産で repo 外に消える。消えても次のコマンド1回で復旧する:

```powershell
pwsh -File scripts/register-vault-sync-tasks.ps1
```

確認:

```powershell
Get-ScheduledTask -TaskName x-vault-sync* | Format-Table TaskName,State
```

> 再登録を忘れても、層2 の滞留検知（7日）が「最終成功が古い」として炙り出す。

## 手動復旧（滞留を検知したとき）

```bash
node scripts/x-vault-sync.mjs          # 手動で全同期 → 成功すれば state リセット・警告解消
node scripts/x-vault-sync-verify.mjs   # 検証（当日成功を確認）
```

## 設計上の制約

- **push 済のみ反映**: ローカル未 push の session-report は対象外（`git show origin/master` ベース）。checkout が push して翌日反映。
- **滞留閾値 7日は暫定**: hook / drift の `STALE_DAYS` / `--days` で調整可。
- **二重の網は通知のみ**: 検知後の再実行はマスター承認下で手動（自動再実行はしない＝暴走防止）。
- **SessionStart hook の settings 登録は設定変更**: `.claude/settings.json` への登録はマスター承認後に行う（hook 実体・root-only 登録は配置済）。
