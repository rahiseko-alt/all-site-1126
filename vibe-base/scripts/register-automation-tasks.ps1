<#
.SYNOPSIS
  自動実行 job（feed-fetch / hook-errors / token-audit / gsap-watch / settings-inventory）の
  schtasks を堅牢設定で登録/再登録する。C-R の「確実に実行する」層の正本。

.DESCRIPTION
  register-vault-sync-tasks.ps1 の XML 生成パターンを一般化し、日次/週次/月次トリガーに対応。
  PC 初期化等でタスクが消えた場合、本スクリプトを叩けば再登録が完了する
  （schtasks は OS 資産で repo 外に消えるため、登録手順を repo 化して喪失の穴を塞ぐ）。

  実装方式: schtasks.exe /Create /XML /F。
   - Register-ScheduledTask(cmdlet) は非対話セッション(Claude Code の ! / Bash 経由 pwsh)から
     root タスクパスへの新規作成を「アクセス拒否」するため、schtasks.exe に統一（failures.md 2026-06-28）。
   - 堅牢化は XML で表現: StartWhenAvailable（取り逃し回収）/ RestartOnFailure PT10M x2 /
     LogonTrigger 併設 / MultipleInstancesPolicy IgnoreNew / LeastPrivilege。
   - /F で冪等上書き。各 job は「検知・レポートのみ（自動修復なし）」で複数回発火しても害なし。

.PARAMETER Only
  指定した TaskName のみ登録する（段階展開用。例: -Only claude-hook-errors-daily）。
  空（既定）なら全 5 件を登録。

.PARAMETER WhatIf
  schtasks を実際に叩かず、生成する XML の要約だけ表示する（登録前の確認用）。

.NOTES
  実行: pwsh -File scripts/register-automation-tasks.ps1 [-Only <name>] [-WhatIf]
  権限: 標準ユーザー(Limited/Interactive)で可。
  登録はシステム状態変更のためマスター承認下で実行する（plan Step7・段階展開）。
#>
param(
  [string]$Only = '',
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

# repo ルート = このスクリプトの1階層上（scripts/ の親）。
$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Node = (Get-Command node -ErrorAction Stop).Source
$User = $env:USERNAME

# 登録対象 job テーブル（時刻割当は x-vault-sync 08:00 / verify 08:15 と衝突回避）。
$Tasks = @(
  @{ Name = 'claude-feed-fetch-daily';          Script = 'scripts/automation/feed-fetch.mjs';              Freq = 'Daily';   Hour = 7; Minute = 50; Limit = 'PT15M' }
  @{ Name = 'claude-hook-errors-daily';         Script = 'scripts/automation/hook-errors-daily.mjs';       Freq = 'Daily';   Hour = 8; Minute = 5;  Limit = 'PT15M' }
  @{ Name = 'claude-token-audit-weekly';        Script = 'scripts/automation/token-audit-weekly.mjs';      Freq = 'Weekly';  Hour = 8; Minute = 10; Limit = 'PT30M' }
  @{ Name = 'claude-gsap-watch-weekly';         Script = 'scripts/automation/gsap-upstream-watch.mjs';     Freq = 'Weekly';  Hour = 8; Minute = 20; Limit = 'PT15M' }
  @{ Name = 'claude-settings-inventory-monthly';Script = 'scripts/automation/settings-allow-inventory.mjs';Freq = 'Monthly'; Hour = 8; Minute = 25; Limit = 'PT15M' }
)

function Get-ScheduleXml {
  param([string]$Freq)
  switch ($Freq) {
    'Daily'   { return '<ScheduleByDay><DaysInterval>1</DaysInterval></ScheduleByDay>' }
    'Weekly'  { return '<ScheduleByWeek><DaysOfWeek><Monday /></DaysOfWeek><WeeksInterval>1</WeeksInterval></ScheduleByWeek>' }
    'Monthly' { return '<ScheduleByMonth><DaysOfMonth><Day>1</Day></DaysOfMonth><Months><January /><February /><March /><April /><May /><June /><July /><August /><September /><October /><November /><December /></Months></ScheduleByMonth>' }
    default   { throw "未知の Freq: $Freq" }
  }
}

function Register-AutomationTask {
  param([hashtable]$Task)

  $scriptPath = Join-Path $RepoRoot $Task.Script
  if (-not (Test-Path $scriptPath)) { throw "スクリプト不在: $scriptPath（先に wrapper を実装してから登録せよ）" }

  $startBoundary = "{0:yyyy-MM-dd}T{1:00}:{2:00}:00" -f [DateTime]::Today, $Task.Hour, $Task.Minute
  $scheduleXml = Get-ScheduleXml -Freq $Task.Freq

  # XML へ埋め込む値はエスケープ（パス/ユーザー名の & < > で XML を壊さない）。
  $eUser = [System.Security.SecurityElement]::Escape($User)
  $eNode = [System.Security.SecurityElement]::Escape($Node)
  $eScript = [System.Security.SecurityElement]::Escape($scriptPath)
  $eRepo = [System.Security.SecurityElement]::Escape($RepoRoot)
  $eDesc = [System.Security.SecurityElement]::Escape("automation job: $($Task.Script)（$($Task.Freq)・検知/レポートのみ・StartWhenAvailable + Retry x2）")

  $xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>$eDesc</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>$startBoundary</StartBoundary>
      <Enabled>true</Enabled>
      $scheduleXml
    </CalendarTrigger>
    <LogonTrigger>
      <Enabled>true</Enabled>
      <UserId>$eUser</UserId>
    </LogonTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>$eUser</UserId>
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RestartOnFailure>
      <Interval>PT10M</Interval>
      <Count>2</Count>
    </RestartOnFailure>
    <ExecutionTimeLimit>$($Task.Limit)</ExecutionTimeLimit>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <Enabled>true</Enabled>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>$eNode</Command>
      <Arguments>"$eScript"</Arguments>
      <WorkingDirectory>$eRepo</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
"@

  if ($WhatIf) {
    Write-Host "[whatif] $($Task.Name)（$($Task.Freq) $("{0:00}:{1:00}" -f $Task.Hour, $Task.Minute) / limit $($Task.Limit)） -> $($Task.Script)"
    return
  }

  # schtasks /Create /XML は UTF-16LE を期待する。
  $tmp = Join-Path $env:TEMP "$($Task.Name).xml"
  $xml | Out-File -FilePath $tmp -Encoding Unicode

  & schtasks.exe /Create /TN $Task.Name /XML $tmp /F | Out-Null
  $code = $LASTEXITCODE
  Remove-Item $tmp -ErrorAction SilentlyContinue
  if ($code -ne 0) { throw "$($Task.Name) の schtasks 登録に失敗（exit $code）" }

  Write-Host "[register] $($Task.Name) 登録完了（$($Task.Freq) $("{0:00}:{1:00}" -f $Task.Hour, $Task.Minute) + ログオン時 / StartWhenAvailable / Retry x2 / limit $($Task.Limit)）"
}

$targets = if ($Only) { $Tasks | Where-Object { $_.Name -eq $Only } } else { $Tasks }
if (-not $targets) { throw "対象タスクが見つからない: -Only '$Only'（有効値: $($Tasks.Name -join ', ')）" }

foreach ($t in $targets) { Register-AutomationTask -Task $t }

Write-Host ''
Write-Host "完了。確認: schtasks /Query /TN <name> /FO LIST"
