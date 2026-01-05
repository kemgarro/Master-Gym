$ErrorActionPreference = "SilentlyContinue"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend"
$uiDir = Join-Path $rootDir "ui"
$logsDir = Join-Path $rootDir "logs"

New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

$backendLog = Join-Path $logsDir "backend.log"
$uiLog = Join-Path $logsDir "ui.log"
$pidsFile = Join-Path $logsDir "mastergym.pids.json"

function Show-Info($message) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show($message, "MasterGym", "OK", "Information") | Out-Null
}

function Require-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Show-Info("No se encontro '$name'. $hint")
    exit 1
  }
}

function Is-PortListening($port) {
  try {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $conn
  } catch {
    return $false
  }
}

function Stop-ByPid($pid) {
  if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {
    Stop-Process -Id $pid -Force
  }
}

$jar = Get-ChildItem -Path (Join-Path $backendDir "build\libs") -Filter "*.jar" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $jar) {
  Show-Info("No se encontro el build del backend. Ejecuta Instalar-MasterGym.vbs una vez.")
  exit 1
}

$nextCli = Join-Path $uiDir "node_modules\next\dist\bin\next"
$nextBuildDir = Join-Path $uiDir ".next"
if (-not (Test-Path $nextCli) -or -not (Test-Path $nextBuildDir)) {
  Show-Info("No se encontro el build del frontend. Ejecuta Instalar-MasterGym.vbs una vez.")
  exit 1
}

$backendRunning = Is-PortListening 8080
$uiRunning = Is-PortListening 3000

if ($backendRunning -or $uiRunning) {
  if (Test-Path $pidsFile) {
    try {
      $pids = Get-Content -Path $pidsFile | ConvertFrom-Json
      Stop-ByPid $pids.backend
      Stop-ByPid $pids.ui
    } catch {}
  }
  foreach ($port in 8080, 3000) {
    try {
      $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
      foreach ($conn in $connections) {
        Stop-ByPid $conn.OwningProcess
      }
    } catch {}
  }
  Show-Info("MasterGym se ha cerrado.")
  exit 0
}

Require-Command "java" "Instala Java 21 y vuelve a intentar."
Require-Command "node" "Instala Node 20 y vuelve a intentar."

$pids = @{}

$backendProc = Start-Process -FilePath "java" -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru \
  -ArgumentList @("-jar", $jar.FullName) -RedirectStandardOutput $backendLog -RedirectStandardError $backendLog
$pids.backend = $backendProc.Id

$uiProc = Start-Process -FilePath "node" -WorkingDirectory $uiDir -WindowStyle Hidden -PassThru \
  -ArgumentList @($nextCli, "start", "-p", "3000") -RedirectStandardOutput $uiLog -RedirectStandardError $uiLog
$pids.ui = $uiProc.Id

$pids | ConvertTo-Json | Set-Content -Path $pidsFile

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/dashboard"
Show-Info("MasterGym esta listo. Se abrio en el navegador.")
