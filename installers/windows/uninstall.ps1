$ErrorActionPreference = "Stop"

$InstallRoot = Join-Path $env:LOCALAPPDATA "MementoMori"
$ShortcutPath = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Memento Mori Widget.lnk"

Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $InstallRoot
Remove-Item -Force -ErrorAction SilentlyContinue $ShortcutPath

Write-Host "Memento Mori removed from Windows user paths."
