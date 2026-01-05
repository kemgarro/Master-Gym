$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend"
$uiDir = Join-Path $rootDir "ui"

function Show-Info($message) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show($message, "MasterGym", "OK", "Information") | Out-Null
}

if (-not (Get-Command "java" -ErrorAction SilentlyContinue)) {
  Show-Info("No se encontro 'java'. Instala Java 21 antes de continuar.")
  exit 1
}
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
  Show-Info("No se encontro 'node'. Instala Node 20 antes de continuar.")
  exit 1
}

Push-Location $uiDir
npm install
npm run build
Pop-Location

Push-Location $backendDir
.\gradlew bootJar
Pop-Location

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "MasterGym.lnk"
$target = Join-Path $scriptDir "MasterGym.vbs"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.WorkingDirectory = $scriptDir
$shortcut.WindowStyle = 7
$shortcut.Save()

Show-Info("Instalacion completada. Ya puedes usar el icono en el escritorio.")
