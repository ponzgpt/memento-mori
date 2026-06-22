import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const manifestPath = join(root, "release-readiness.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

assert.equal(manifest.version, pkg.version, "release-readiness.json version must match package.json");
assert.equal(manifest.release_gate, "source-installable");
assert.match(manifest.disclaimer, /mental-health advice/);

const requiredPlatforms = ["linux", "macos", "windows", "ios"];
for (const platform of requiredPlatforms) {
  assert.ok(manifest.platforms[platform], `${platform} readiness entry is missing`);
  assert.ok(manifest.platforms[platform].status, `${platform} status is missing`);
  assert.ok(Array.isArray(manifest.platforms[platform].verification), `${platform} verification is missing`);
}

assert.equal(manifest.platforms.linux.status, "ready");
assert.equal(manifest.platforms.linux.source_install, "./install.sh");
assert.equal(manifest.platforms.linux.release_artifact, `memento-mori-linux-waybar-${pkg.version}.tar.gz`);
assert.equal(existsSync(join(root, "install.sh")), true);

assert.equal(manifest.platforms.macos.status, "source-installable");
assert.equal(manifest.platforms.macos.source_install, "sh installers/macos/install.sh");
assert.equal(manifest.platforms.macos.release_artifact, `memento-mori-local-app-${pkg.version}.tar.gz`);
assert.equal(existsSync(join(root, "installers/macos/install.sh")), true);
assert.equal(existsSync(join(root, "installers/macos/uninstall.sh")), true);

assert.equal(manifest.platforms.windows.status, "source-installable");
assert.match(manifest.platforms.windows.source_install, /installers\\windows\\install\.ps1/);
assert.equal(manifest.platforms.windows.release_artifact, `memento-mori-local-app-${pkg.version}.tar.gz`);
assert.equal(existsSync(join(root, "installers/windows/install.ps1")), true);
assert.equal(existsSync(join(root, "installers/windows/uninstall.ps1")), true);

assert.equal(manifest.platforms.ios.status, "documented");
assert.equal(manifest.platforms.ios.source_install, null);
assert.equal(existsSync(join(root, "docs/apple-platform-plan.md")), true);

for (const command of [
  "npm run audit",
  "npm run lint",
  "npm test",
  "npm run check:web",
  "npm run package",
  "shasum -a 256 -c dist/SHA256SUMS"
]) {
  assert.ok(manifest.required_common_checks.includes(command), `missing common check: ${command}`);
}

console.log("release readiness checks passed");
