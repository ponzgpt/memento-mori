import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

const pkg = readJson("package.json");
const manifest = readJson("release-readiness.json");
const production = readJson("production-readiness.json");
const version = pkg.version;
const localArtifact = `memento-mori-local-app-${version}.tar.gz`;
const linuxArtifact = `memento-mori-linux-waybar-${version}.tar.gz`;

assert.match(version, /^\d+\.\d+\.\d+$/, "package.json version must be SemVer");
assert.equal(manifest.version, version, "release-readiness.json version must match package.json");
assert.equal(production.version, version, "production-readiness.json version must match package.json");
assert.equal(manifest.platforms.linux.release_artifact, linuxArtifact);
assert.equal(manifest.platforms.macos.release_artifact, localArtifact);
assert.equal(manifest.platforms.windows.release_artifact, localArtifact);

const html = read("app/index.html");
assert.match(html, new RegExp(`styles\\.css\\?v=${version.replaceAll(".", "\\.")}`));
assert.match(html, new RegExp(`main\\.js\\?v=${version.replaceAll(".", "\\.")}`));

const supportMatrix = read("docs/support-matrix.md");
assert.match(supportMatrix, new RegExp(linuxArtifact.replaceAll(".", "\\.")));
assert.match(supportMatrix, new RegExp(localArtifact.replaceAll(".", "\\.")));

const releaseDocs = read("docs/release.md");
assert.match(releaseDocs, new RegExp(`v${version.replaceAll(".", "\\.")}`));
assert.match(releaseDocs, /npm run check:version/);

const packageScript = read("scripts/package-release.mjs");
assert.match(packageScript, /pkg\.version/);
assert.doesNotMatch(packageScript, /memento-mori-(linux-waybar|local-app)-\d+\.\d+\.\d+/);

const webScript = read("scripts/check-web.mjs");
assert.match(webScript, /pkg\.version/);

const macInstaller = read("installers/macos/install.sh");
assert.match(macInstaller, /APP_VERSION=\$\(awk -F/);
assert.match(macInstaller, /<string>\$\{APP_VERSION\}<\/string>/);
assert.doesNotMatch(macInstaller, new RegExp(`<string>${version.replaceAll(".", "\\.")}<\\/string>`));

for (const command of ["npm run check:version", "npm run verify"]) {
  assert.ok(manifest.required_common_checks.includes(command), `missing common check: ${command}`);
}

console.log("version checks passed");
