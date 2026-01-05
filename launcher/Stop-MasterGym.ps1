$ErrorActionPreference = "SilentlyContinue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$logsDir = Join-Path $rootDir "logs"
$pidsFile = Join-Path $logsDir "mastergym.pids.json"

function Stop-ByPid($pid) {
  if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {
    Stop-Process -Id $pid -Force
  }
}

if (Test-Path $pidsFile) {
  try {
    $pids = Get-Content -Path $pidsFile | ConvertFrom-Json
    Stop-ByPid $pids.backend
    Stop-ByPid $pids.ui
  } catch {}
}

$ports = 8080, 3000
foreach ($port in $ports) {
  try {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
      Stop-ByPid $conn.OwningProcess
    }
  } catch {}
}
