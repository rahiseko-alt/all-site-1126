<#
.SYNOPSIS
  vault 連携タスク(x-vault-sync / x-vault-sync-verify)を堅牢設定で登録/再登録する。

.DESCRIPTION
  「確実に実行する」層の正本。PC 初期化等でタスクが消えた場合、本スクリプトを1回叩けば再登録が完了する
  （schtasks は OS 資産で repo 外に消えるため、登録手順を repo 化して喪失の穴を塞ぐ）。

  実装方式: schtasks.exe /Create /XML /F。
   - Register-ScheduledTask(cmdlet) は非対話セッション(Claude Code の ! / Bash 経由 pwsh)から
     root タスクパスへの新規作成を「アクセス拒否」するため、前回登録実績のある schtasks.exe に統一。
   - 堅牢化は XML で表現する:
       StartWhenAvailable      : スケジュール時刻に PC がオフでも起動後できるだけ早く実行（取り逃し回収）。
       RestartOnFailure 2/10分 : 一時的な失敗(ネットワーク等)を自動リトライ。
       CalendarTrigger+LogonTrigger : 毎日 + ログオン時の複数トリガーで発火機会を増やす。
   - /F で冪等上書き。sync は origin/master 全件を冪等全同期するため複数回発火しても害なし。

.NOTES
  実行: pwsh -File scripts/register-vault-sync-tasks.ps1
  権限: 標準ユーザー(Limited/Interactive)で可。
#>

$ErrorActionPreference = 'Stop'

# repo ルート = このスクリプトの2階層上（scripts/ の親）。
$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Node = (Get-Command node -ErrorAction Stop).Source
$User = $env:USERNAME

function Register-VaultTask {
  param(
    [string]$TaskName,
    [string]$Script,
    [int]$Hour,
    [int]$Minute
  )

  $scriptPath = Join-Path $RepoRoot $Script
  if (-not (Test-Path $scriptPath)) { throw "スクリプト不在: $scriptPath" }

  $startBoundary = "{0:yyyy-MM-dd}T{1:00}:{2:00}:00" -f [DateTime]::Today, $Hour, $Minute

  # XML へ埋め込む値はエスケープする（パス/ユーザー名に & < > 等が含まれても XML を壊さない）。
  $eUser = [System.Security.SecurityElement]::Escape($User)
  $eNode = [System.Security.SecurityElement]::Escape($Node)
  $eScript = [System.Security.SecurityElement]::Escape($scriptPath)
  $eRepo = [System.Security.SecurityElement]::Escape($RepoRoot)
  $eDesc = [System.Security.SecurityElement]::Escape("vault 反映: $Script（StartWhenAvailable + Retry x2）")

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
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
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
    <ExecutionTimeLimit>PT15M</ExecutionTimeLimit>
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

  # schtasks /Create /XML は UTF-16LE を期待する。
  $tmp = Join-Path $env:TEMP "$TaskName.xml"
  $xml | Out-File -FilePath $tmp -Encoding Unicode

  & schtasks.exe /Create /TN $TaskName /XML $tmp /F | Out-Null
  $code = $LASTEXITCODE
  Remove-Item $tmp -ErrorAction SilentlyContinue
  if ($code -ne 0) { throw "$TaskName の schtasks 登録に失敗（exit $code）" }

  Write-Host "[register] $TaskName 登録完了（毎日 $($Hour.ToString('00')):$($Minute.ToString('00')) + ログオン時 / StartWhenAvailable / Retry x2）"
}

Register-VaultTask -TaskName 'x-vault-sync'        -Script 'scripts/x-vault-sync.mjs'        -Hour 8 -Minute 0
Register-VaultTask -TaskName 'x-vault-sync-verify' -Script 'scripts/x-vault-sync-verify.mjs' -Hour 8 -Minute 15

Write-Host ''
Write-Host '完了。確認: schtasks /Query /TN x-vault-sync /FO LIST'
