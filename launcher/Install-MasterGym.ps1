$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$backendDir = Join-Path $rootDir "backend"
$uiDir = Join-Path $rootDir "ui"
$logsDir = Join-Path $rootDir "logs"
$installLog = Join-Path $logsDir "install.log"

function Show-Info($message) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show($message, "MasterGym", "OK", "Information") | Out-Null
}

function Fail($message) {
  Show-Info($message)
  exit 1
}

function Require-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Fail("No se encontro '$name'. $hint")
  }
}

function Resolve-JavaHome() {
  if ($env:JAVA_HOME) {
    $javaExe = Join-Path $env:JAVA_HOME "bin\java.exe"
    if (Test-Path $javaExe) {
      return $env:JAVA_HOME
    }
  }

  $javaCmd = Get-Command "java" -ErrorAction SilentlyContinue
  if ($javaCmd) {
    $candidate = Split-Path (Split-Path $javaCmd.Source -Parent) -Parent
    $javaExe = Join-Path $candidate "bin\java.exe"
    if (Test-Path $javaExe) {
      return $candidate
    }
  }

  return $null
}

function Ensure-Java() {
  Require-Command "java" "Instala Java 21 antes de continuar."

  $resolvedJavaHome = Resolve-JavaHome
  if (-not $resolvedJavaHome) {
    Fail("JAVA_HOME no es valido. Instala Java 21 y configura JAVA_HOME al JDK correcto.")
  }

  $env:JAVA_HOME = $resolvedJavaHome
  $env:Path = "$env:JAVA_HOME\bin;$env:Path"

  $versionLine = Get-JavaVersionLine
  if ($versionLine -notmatch '"(\d+)\.') {
    Fail("No se pudo leer la version de Java. Instala Java 21.")
  }
  $major = [int]$Matches[1]
  if ($major -ne 21) {
    Fail("Version de Java no soportada: $versionLine`nInstala Java 21.")
  }
}

function Get-JavaVersionLine() {
  $output = & cmd /c "java -version 2>&1"
  return ($output | Select-Object -First 1)
}

function Persist-JavaHome() {
  try {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $env:JAVA_HOME, "User")

    $javaBin = Join-Path $env:JAVA_HOME "bin"
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if (-not $userPath) {
      $userPath = ""
    }
    if ($userPath -notmatch [regex]::Escape($javaBin)) {
      $newUserPath = if ($userPath) { "$javaBin;$userPath" } else { $javaBin }
      [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    }
  } catch {
    Fail("No se pudo guardar JAVA_HOME de forma permanente. Ejecuta el instalador como usuario normal e intenta de nuevo.")
  }
}

function Ensure-Node() {
  Require-Command "node" "Instala Node 20 o 22 antes de continuar."
  Require-Command "npm" "Instala Node 20 o 22 (incluye npm) antes de continuar."

  $nodeVersion = (& node -v).Trim()
  if ($nodeVersion -notmatch '^v(\d+)\.') {
    Fail("No se pudo leer la version de Node. Instala Node 20.")
  }
  $nodeMajor = [int]$Matches[1]
  if ($nodeMajor -ne 20 -and $nodeMajor -ne 22) {
    Fail("Version de Node no soportada: $nodeVersion`nInstala Node 20.x o 22.x.")
  }
}

function Run-Logged($workingDir, $label, $command, $args) {
  Push-Location $workingDir
  try {
    & $command @args *>> $installLog
    if ($LASTEXITCODE -ne 0) {
      Fail("$label fallo. Revisa $installLog.")
    }
  } catch {
    Fail("$label fallo. Revisa $installLog.")
  } finally {
    Pop-Location
  }
}

New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
Remove-Item -Path $installLog -ErrorAction SilentlyContinue

Ensure-Node
Ensure-Java
Persist-JavaHome

"Install started: $(Get-Date -Format s)" | Out-File -FilePath $installLog
"Node: $((& node -v).Trim())" | Add-Content -Path $installLog
("Java: " + (Get-JavaVersionLine)) | Add-Content -Path $installLog
"JAVA_HOME: $env:JAVA_HOME" | Add-Content -Path $installLog

Run-Logged $uiDir "npm install" "npm" @("install")
Run-Logged $uiDir "npm run build" "npm" @("run", "build")

$gradleWrapper = Join-Path $backendDir "gradlew.bat"
if (-not (Test-Path $gradleWrapper)) {
  $gradleWrapper = Join-Path $backendDir "gradlew"
}
Run-Logged $backendDir "gradle bootJar" $gradleWrapper @("bootJar")

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
