$ErrorActionPreference = "Stop"

$InstallRoot = Join-Path $env:LOCALAPPDATA "MementoMori"
$StartMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
$ShortcutPath = Join-Path $StartMenu "Memento Mori Widget.lnk"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptRoot "..\..")

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is required for the source install."
}

New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
$ReplacePaths = @(
  (Join-Path $InstallRoot "app"),
  (Join-Path $InstallRoot "scripts"),
  (Join-Path $InstallRoot "docs")
)

foreach ($Path in $ReplacePaths) {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $Path
}

Copy-Item -Recurse -Force (Join-Path $RepoRoot "app") (Join-Path $InstallRoot "app")
Copy-Item -Recurse -Force (Join-Path $RepoRoot "scripts") (Join-Path $InstallRoot "scripts")
Copy-Item -Recurse -Force (Join-Path $RepoRoot "docs") (Join-Path $InstallRoot "docs")
Copy-Item -Force (Join-Path $RepoRoot "README.md") (Join-Path $InstallRoot "README.md")
Copy-Item -Force (Join-Path $RepoRoot "LICENSE") (Join-Path $InstallRoot "LICENSE")
Copy-Item -Force (Join-Path $RepoRoot "package.json") (Join-Path $InstallRoot "package.json")

$Launcher = Join-Path $InstallRoot "MementoMori.ps1"
@'
$ErrorActionPreference = "Stop"
$InstallRoot = Join-Path $env:LOCALAPPDATA "MementoMori"
$Port = if ($env:PORT) { $env:PORT } else { "4173" }

Set-Location $InstallRoot
$Server = Start-Process -FilePath "node" -ArgumentList @("scripts\serve.mjs", $Port) -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 1
Start-Process "http://127.0.0.1:$Port/"
$Server.WaitForExit()
'@ | Set-Content -Encoding UTF8 $Launcher

New-Item -ItemType Directory -Force -Path $StartMenu | Out-Null
$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$Launcher`""
$Shortcut.WorkingDirectory = $InstallRoot
$Shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,44"
$Shortcut.Save()

Write-Host "Memento Mori installed for Windows."
Write-Host "Install path: $InstallRoot"
Write-Host "Start Menu shortcut: $ShortcutPath"
