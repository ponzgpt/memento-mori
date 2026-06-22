import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8"
  });

  assert.equal(
    result.status,
    0,
    `${[command, ...args].join(" ")} failed\n${result.stdout}${result.stderr}`
  );
}

function maybePowerShell() {
  for (const command of ["pwsh", "powershell"]) {
    const result = spawnSync(command, ["-NoProfile", "-Command", "$PSVersionTable.PSVersion"], {
      encoding: "utf8"
    });
    if (result.status === 0) {
      return command;
    }
  }

  return null;
}

for (const file of [
  "installers/macos/install.sh",
  "installers/macos/uninstall.sh",
  "installers/windows/install.ps1",
  "installers/windows/uninstall.ps1"
]) {
  assert.equal(existsSync(join(root, file)), true, `${file} is missing`);
}

run("sh", ["-n", "installers/macos/install.sh"]);
run("sh", ["-n", "installers/macos/uninstall.sh"]);

const pkg = JSON.parse(read("package.json"));
const macInstall = read("installers/macos/install.sh");
const macUninstall = read("installers/macos/uninstall.sh");
const winInstall = read("installers/windows/install.ps1");
const winUninstall = read("installers/windows/uninstall.ps1");

assert.match(macInstall, /^#!\/usr\/bin\/env sh/);
assert.match(macInstall, /set -eu/);
assert.match(macInstall, /command -v node/);
assert.match(macInstall, /APP_VERSION=\$\(node -e/);
assert.match(macInstall, /CFBundleShortVersionString/);
assert.match(macInstall, /<string>\$\{APP_VERSION\}<\/string>/);
assert.doesNotMatch(macInstall, new RegExp(`<string>${pkg.version.replaceAll(".", "\\.")}<\\/string>`));
assert.match(macInstall, /Library\/Application Support\/Memento Mori/);
assert.match(macInstall, /APP_NAME="Memento Mori Widget"/);
assert.match(macInstall, /APP_BUNDLE="\$\{HOME\}\/Applications\/\$\{APP_NAME\}\.app"/);
assert.match(macInstall, /cp -R "\$\{ROOT_DIR\}\/app"/);
assert.match(macInstall, /cp -R "\$\{ROOT_DIR\}\/scripts"/);
assert.match(macInstall, /cp -R "\$\{ROOT_DIR\}\/docs"/);
assert.match(macInstall, /node scripts\/serve\.mjs/);
assert.match(macInstall, /open "http:\/\/127\.0\.0\.1:\$\{PORT\}\/"/);
assert.match(macInstall, /trap cleanup EXIT INT TERM/);
assert.doesNotMatch(macInstall, /curl|wget|Invoke-WebRequest|analytics|telemetry/i);

assert.match(macUninstall, /rm -rf "\$\{APP_BUNDLE\}" "\$\{APP_SUPPORT\}"/);
assert.match(macUninstall, /Memento Mori removed from macOS user paths/);

assert.match(winInstall, /^\$ErrorActionPreference = "Stop"/);
assert.match(winInstall, /\$InstallRoot = Join-Path \$env:LOCALAPPDATA "MementoMori"/);
assert.match(winInstall, /Get-Command node/);
assert.match(winInstall, /Copy-Item -Recurse -Force \(Join-Path \$RepoRoot "app"\)/);
assert.match(winInstall, /Copy-Item -Recurse -Force \(Join-Path \$RepoRoot "scripts"\)/);
assert.match(winInstall, /Copy-Item -Recurse -Force \(Join-Path \$RepoRoot "docs"\)/);
assert.match(winInstall, /Start-Process -FilePath "node" -ArgumentList @\("scripts\\serve\.mjs", \$Port\)/);
assert.match(winInstall, /Start-Process "http:\/\/127\.0\.0\.1:\$Port\/"/);
assert.match(winInstall, /WScript\.Shell/);
assert.match(winInstall, /ExecutionPolicy Bypass/);
assert.doesNotMatch(winInstall, /curl|wget|Invoke-WebRequest|analytics|telemetry/i);

assert.match(winUninstall, /^\$ErrorActionPreference = "Stop"/);
assert.match(winUninstall, /Remove-Item -Recurse -Force -ErrorAction SilentlyContinue \$InstallRoot/);
assert.match(winUninstall, /Remove-Item -Force -ErrorAction SilentlyContinue \$ShortcutPath/);

const shell = maybePowerShell();
if (shell) {
  for (const file of ["installers/windows/install.ps1", "installers/windows/uninstall.ps1"]) {
    run(shell, [
      "-NoProfile",
      "-Command",
      "$errors = $null; [System.Management.Automation.Language.Parser]::ParseFile($args[0], [ref]$null, [ref]$errors) > $null; if ($errors.Count) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }",
      join(root, file)
    ]);
  }
}

console.log("installer checks passed");
