import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));

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

function available(command, args = ["--version"]) {
  return spawnSync(command, args, { encoding: "utf8" }).status === 0;
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

if (available("sh", ["-c", "exit 0"])) {
  run("sh", ["-n", "installers/macos/install.sh"]);
  run("sh", ["-n", "installers/macos/uninstall.sh"]);
}

const pkg = JSON.parse(read("package.json"));
const macInstall = read("installers/macos/install.sh");
const macUninstall = read("installers/macos/uninstall.sh");
const winInstall = read("installers/windows/install.ps1");
const winUninstall = read("installers/windows/uninstall.ps1");

assert.match(macInstall, /^#!\/usr\/bin\/env sh/);
assert.match(macInstall, /set -eu/);
assert.match(macInstall, /command -v swiftc/);
assert.match(macInstall, /APP_VERSION=\$\(awk -F/);
assert.match(macInstall, /CFBundleShortVersionString/);
assert.match(macInstall, /<string>\$\{APP_VERSION\}<\/string>/);
assert.match(macInstall, /LSUIElement/);
assert.match(macInstall, /memento-mori-menubar/);
assert.doesNotMatch(macInstall, new RegExp(`<string>${pkg.version.replaceAll(".", "\\.")}<\\/string>`));
assert.match(macInstall, /Library\/Application Support\/Memento Mori/);
assert.match(macInstall, /APP_NAME="Memento Mori Widget"/);
assert.match(macInstall, /APP_BUNDLE="\$\{HOME\}\/Applications\/\$\{APP_NAME\}\.app"/);
assert.match(macInstall, /cp -R "\$\{ROOT_DIR\}\/native"/);
assert.match(macInstall, /cp -R "\$\{ROOT_DIR\}\/docs"/);
assert.match(macInstall, /swiftc "\$\{ROOT_DIR\}\/native\/macos\/MementoMoriMenuBar\.swift"/);
// Los .strings tienen que llegar a Contents/Resources/<lang>.lproj dentro del
// bundle -no basta con que vivan en el repo- o NSLocalizedString no los
// encuentra en tiempo de ejecución.
assert.match(macInstall, /cp -R "\$\{ROOT_DIR\}\/native\/macos\/Localization\/en\.lproj" "\$\{CONTENTS\}\/Resources\/en\.lproj"/);
assert.match(macInstall, /cp -R "\$\{ROOT_DIR\}\/native\/macos\/Localization\/es\.lproj" "\$\{CONTENTS\}\/Resources\/es\.lproj"/);
assert.match(macInstall, /CFBundleLocalizations/);
for (const lang of ["en", "es"]) {
  assert.equal(
    existsSync(join(root, `native/macos/Localization/${lang}.lproj/Localizable.strings`)),
    true,
    `native/macos/Localization/${lang}.lproj/Localizable.strings is missing`
  );
}
assert.doesNotMatch(macInstall, /node scripts\/serve\.mjs/);
assert.doesNotMatch(macInstall, /open "http:\/\/127\.0\.0\.1/);
assert.doesNotMatch(macInstall, /curl|wget|Invoke-WebRequest|analytics|telemetry/i);

const macSource = read("native/macos/MementoMoriMenuBar.swift");
assert.match(macSource, /NSStatusBar\.system\.statusItem/);
assert.match(macSource, /NSMenu/);
// Los ajustes viven dentro del propio menú desplegable (sliders y segmented
// controls embebidos vía NSMenuItem.view), no en una ventana aparte: ya no
// hay una palabra "Settings" que buscar, así que se comprueba la sustancia.
assert.match(macSource, /NSSlider/);
assert.match(macSource, /NSStepper/);
assert.match(macSource, /UserDefaults/);
// The menu bar app imports AppKit, so it only compiles on macOS. Linux CI has
// swiftc but no AppKit, and would fail here on a file it cannot build anyway.
if (process.platform === "darwin" && available("swiftc", ["--version"])) {
  run("swiftc", ["native/macos/MementoMoriMenuBar.swift", "-o", "/tmp/memento-mori-menubar-check"]);
}

// Toda clave que L(...) pueda pedir en tiempo de ejecución debe existir en
// los dos idiomas, con las mismas claves en ambos ficheros. Si un traductor
// futuro añade una clave a uno y se olvida del otro, NSLocalizedString
// devuelve la propia clave en pantalla en vez de fallar de forma ruidosa —
// por eso esto se comprueba aquí y no se confía en verlo a simple vista.
function stringsKeys(text) {
  return new Set([...text.matchAll(/^"((?:[^"\\]|\\.)*)"\s*=/gm)].map(([, k]) => k));
}
const enStrings = read("native/macos/Localization/en.lproj/Localizable.strings");
const esStrings = read("native/macos/Localization/es.lproj/Localizable.strings");
const enKeys = stringsKeys(enStrings);
const esKeys = stringsKeys(esStrings);
assert.ok(enKeys.size > 0, "en.lproj/Localizable.strings has no keys");
for (const key of enKeys) {
  assert.ok(esKeys.has(key), `es.lproj/Localizable.strings is missing "${key}"`);
}
for (const key of esKeys) {
  assert.ok(enKeys.has(key), `en.lproj/Localizable.strings is missing "${key}"`);
}

// Reconstruye todas las claves que el código puede llegar a pedir y las
// compara con el .strings en los dos sentidos. En los dos, porque los dos
// fallos han ocurrido de verdad al reescribir esta pantalla: renombrar una
// fila y olvidar la clave nueva (sale la clave cruda en pantalla), y quitar
// una fila dejando la clave vieja muerta en el fichero.
const runtimeKeys = new Set();

// L("literal")
for (const [, k] of macSource.matchAll(/\bL\("([^"$\\]+)"\)/g)) runtimeKeys.add(k);
// labelKey que se pasan como variable: tuplas ("sex", "Sex") y countryRow(labelKey: "Born in", ...)
for (const [, k] of macSource.matchAll(/\("\w+", "([^"]+)"\)/g)) runtimeKeys.add(k);
for (const [, k] of macSource.matchAll(/labelKey: "([^"]+)"/g)) runtimeKeys.add(k);
// nombres de país: el label inglés del Baseline es a la vez la clave
for (const [, k] of macSource.matchAll(/Baseline\(label: "([^"]+)"/g)) runtimeKeys.add(k);
// opciones de cada factor: clave "<factor>.<valor>"
for (const [, factor, body] of macSource.matchAll(/"(\w+)": \[\n((?:\s*FactorOption[^\]]*?\n)+)\s*\]/g)) {
  for (const [, value] of body.matchAll(/FactorOption\(value: "(\w+)"/g)) {
    runtimeKeys.add(`${factor}.${value}`);
  }
}
// frases: los dos grupos y su número de variantes salen del propio código
const quoteCounts = macSource.match(/let regularCount = (\d+)[\s\S]*?let lateCount = (\d+)/);
assert.ok(quoteCounts, "could not read the reflection quote counts from the source");
for (const [pool, count] of [["regular", +quoteCounts[1]], ["late", +quoteCounts[2]]]) {
  for (let i = 0; i < count; i += 1) runtimeKeys.add(`quote.${pool}.${i}`);
}

assert.ok(runtimeKeys.size > 20, `only found ${runtimeKeys.size} localization keys in the source`);
for (const key of runtimeKeys) {
  assert.ok(enKeys.has(key), `the app can ask for "${key}" but en.lproj does not define it`);
}
for (const key of enKeys) {
  assert.ok(runtimeKeys.has(key), `en.lproj defines "${key}" but nothing in the app asks for it`);
}

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
    // -Command does not bind a trailing argument to $args, so the path goes
    // into the script text. Single quotes are doubled to escape them for PS.
    const target = join(root, file).replace(/'/g, "''");
    run(shell, [
      "-NoProfile",
      "-Command",
      `$errors = $null; [System.Management.Automation.Language.Parser]::ParseFile('${target}', [ref]$null, [ref]$errors) > $null; if ($errors.Count) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }`
    ]);
  }
}

console.log("installer checks passed");
