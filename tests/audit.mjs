import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const required = [
  "LICENSE",
  "README.md",
  "CHANGELOG.md",
  "PRIVACY.md",
  "AGENTS.md",
  "app/index.html",
  "app/main.js",
  "app/memento-core.js",
  "release-readiness.json",
  "docs/feature-status.csv",
  "docs/support-matrix.md",
  "scripts/serve.mjs",
  "scripts/package-release.mjs",
  "scripts/check-installers.mjs",
  "scripts/check-release-readiness.mjs",
  "scripts/check-version.mjs",
  "scripts/check-web.mjs",
  "scripts/release-notes.mjs",
  "scripts/test-waybar.mjs",
  "scripts/verify-release.mjs",
  "installers/macos/install.sh",
  "installers/macos/uninstall.sh",
  "installers/windows/install.ps1",
  "installers/windows/uninstall.ps1",
  "waybar/memento.py",
  "waybar/config.example.jsonc",
  "waybar/style.example.css",
  "config/profile.example.json",
  "CONTRIBUTING.md",
  "SUPPORT.md",
  "SECURITY.md",
  "docs/model.md",
  "docs/install.md",
  "docs/philosophy.md",
  "docs/commercial-model.md",
  "docs/apple-platform-plan.md",
  "docs/stack-decisions.md",
  "docs/release.md",
  ".github/workflows/ci.yml",
  ".github/workflows/release.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/pull_request_template.md",
  "install.sh"
];

for (const file of required) {
  assert.equal(existsSync(join(root, file)), true, `${file} is missing`);
}

const profile = JSON.parse(readFileSync(join(root, "config/profile.example.json"), "utf8"));
assert.equal(profile.schema, "memento-mori.profile.v1");
assert.equal(profile.skin, "system-light");
assert.equal("display" in profile, false);
assert.equal("mode" in profile, false);
assert.equal(profile.birth_country, "WLD");
assert.equal(profile.current_country, "WLD");
assert.match(profile.disclaimer, /Not medical, legal, actuarial, insurance, or mental-health advice/);
assert.match(profile.disclaimer, /mental-health advice/);

const waybarConfig = readFileSync(join(root, "waybar/config.example.jsonc"), "utf8");
assert.match(waybarConfig, /"return-type": "json"/);
assert.match(waybarConfig, /"format": "MM \{\}"/);

const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
assert.match(agents, /npm run verify/);
assert.match(agents, /npm run check:installers/);
assert.match(agents, /npm run check:version/);
assert.match(agents, /npm run release:notes/);
assert.match(agents, /Linux, macOS, and Windows/);
assert.match(agents, /python3 waybar\/memento\.py --config config\/profile\.example\.json/);
assert.match(agents, /Do not install system packages on the host/);
assert.match(agents, /source installers as signed installers/);

const readme = readFileSync(join(root, "README.md"), "utf8");
assert.match(readme, /Apache-2\.0/);
assert.match(readme, /not medical, legal, actuarial, insurance/i);
assert.match(readme, /What It Does/);
assert.match(readme, /Platform Surfaces/);
assert.match(readme, /Quality Gates/);
assert.match(readme, /CI runs it on Linux, macOS, and Windows/);
assert.match(readme, /installers\/macos\/install\.sh/);
assert.match(readme, /installers\\windows\\install\.ps1/);
assert.match(readme, /docs\/support-matrix\.md/);
assert.match(readme, /release-readiness\.json/);
assert.match(readme, /philosophy/i);
assert.match(readme, /docs\/install\.md/);
assert.match(readme, /docs\/philosophy\.md/);
assert.match(readme, /docs\/model\.md/);
assert.match(readme, /PRIVACY\.md/);
assert.match(readme, /CHANGELOG\.md/);
assert.doesNotMatch(readme, /MVP|mockup|prototype|Production Beta/i);

const privacy = readFileSync(join(root, "PRIVACY.md"), "utf8");
assert.match(privacy, /local-first widget/);
assert.match(privacy, /birth date/);
assert.match(privacy, /browser local storage/);
assert.match(privacy, /127\.0\.0\.1/);
assert.match(privacy, /should not transmit profile values/);
assert.match(privacy, /Stripe/);
assert.match(privacy, /not medical, legal, actuarial, insurance, or mental-health advice/i);
assert.doesNotMatch(privacy, /MVP|mockup|prototype|prototipo|Codex|Javier|co-development|preview harness|Production Beta/i);

const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
assert.match(changelog, /# Changelog/);
assert.match(changelog, /1\.0\.0 - 2026-06-22/);
assert.match(changelog, /Initial source-installable release/);
assert.match(changelog, /Privacy policy/);
assert.match(changelog, /Linux: ready/);
assert.match(changelog, /macOS: source-installable/);
assert.match(changelog, /Windows 11: source-installable/);
assert.match(changelog, /iOS: documented direction only/);
assert.match(changelog, /release manifest/);
assert.match(changelog, /npm run verify/);
assert.match(changelog, /not medical, legal, actuarial, insurance, or mental-health advice/i);
assert.doesNotMatch(changelog, /MVP|mockup|prototype|prototipo|Codex|Javier|co-development|preview harness|Production Beta/i);

const featureStatus = readFileSync(join(root, "docs/feature-status.csv"), "utf8");
assert.match(featureStatus, /MM-US-001/);
assert.match(featureStatus, /MM-US-014/);
assert.match(featureStatus, /user_story/);
assert.match(featureStatus, /expected_behavior/);
assert.match(featureStatus, /latest_result/);

const install = readFileSync(join(root, "docs/install.md"), "utf8");
assert.match(install, /Source Install/);
assert.match(install, /Release Artifact/);
assert.match(install, /memento-mori-linux-waybar-\*/);
assert.match(install, /memento-mori-local-app-\*/);
assert.match(install, /Linux/);
assert.match(install, /macOS/);
assert.match(install, /Windows 11/);
assert.match(install, /iOS/);
assert.match(install, /GitHub Releases/);
assert.match(install, /installers\/macos\/install\.sh/);
assert.match(install, /installers\\windows\\install\.ps1/);
assert.match(install, /provided as-is/i);
assert.match(install, /PRIVACY\.md/);
assert.doesNotMatch(install, /MVP|mockup|prototype|not shipped yet/i);

const model = readFileSync(join(root, "docs/model.md"), "utf8");
assert.match(model, /World Bank WDI/);
assert.match(model, /SP\.DYN\.LE00\.IN/);
assert.match(model, /birth country/);
assert.match(model, /current country/);
assert.match(model, /not clinical calculations/i);

const philosophy = readFileSync(join(root, "docs/philosophy.md"), "utf8");
assert.match(philosophy, /time is the one budget nobody gets to refinance/);
assert.match(philosophy, /dry, not cruel/);
assert.match(philosophy, /Fraunces/);
assert.match(philosophy, /Geist/);
assert.match(philosophy, /SIL Open Font License/);

const commercial = readFileSync(join(root, "docs/commercial-model.md"), "utf8");
assert.match(commercial, /Source code stays on GitHub under Apache-2\.0/);
assert.match(commercial, /source install/i);
assert.match(commercial, /Cheap downloadable installer/i);
assert.match(commercial, /GitHub Releases/);
assert.match(commercial, /Stripe/);
assert.match(commercial, /beehiiv/);
assert.match(commercial, /No support entitlement/);
assert.match(commercial, /fork/i);
assert.doesNotMatch(commercial, /MVP|mockup|prototype/i);

const apple = readFileSync(join(root, "docs/apple-platform-plan.md"), "utf8");
assert.match(apple, /WidgetKit/);
assert.match(apple, /SwiftUI/);
assert.match(apple, /Apple silicon Macs/);
assert.match(apple, /macOS menu-bar app/);
assert.match(apple, /system-light/);
assert.match(apple, /system-dark/);
assert.match(apple, /hourglasses/);
assert.match(apple, /https:\/\/developer\.apple\.com\/documentation\/widgetkit/);
assert.match(apple, /https:\/\/dailystoic\.com\/history-of-memento-mori-art\//);

const stack = readFileSync(join(root, "docs/stack-decisions.md"), "utf8");
assert.match(stack, /Static HTML, CSS, and JavaScript/i);
assert.match(stack, /Python emitter/);
assert.match(stack, /SwiftUI/);
assert.match(stack, /Tauri/);

const contributing = readFileSync(join(root, "CONTRIBUTING.md"), "utf8");
assert.match(contributing, /npm run audit/);
assert.match(contributing, /npm run check:version/);
assert.match(contributing, /npm run release:notes/);
assert.match(contributing, /Keep profile data local/);

const support = readFileSync(join(root, "SUPPORT.md"), "utf8");
assert.match(support, /provided as-is/);
assert.match(support, /no support entitlement/i);
assert.match(support, /PRIVACY\.md/);

const security = readFileSync(join(root, "SECURITY.md"), "utf8");
assert.match(security, /local widget/);
assert.match(security, /runtime network service/);
assert.match(security, /PRIVACY\.md/);

const release = readFileSync(join(root, "docs/release.md"), "utf8");
assert.match(release, /Release Checklist/);
assert.match(release, /SemVer/);
assert.match(release, /Apache-2\.0/);
assert.match(release, /SHA256SUMS/);
assert.match(release, /release-manifest\.json/);
assert.match(release, /source-installable/);
assert.match(release, /npm run check:version/);
assert.match(release, /CHANGELOG\.md/);
assert.match(release, /npm run release:notes/);

const supportMatrix = readFileSync(join(root, "docs/support-matrix.md"), "utf8");
assert.match(supportMatrix, /Linux/);
assert.match(supportMatrix, /macOS/);
assert.match(supportMatrix, /Windows 11/);
assert.match(supportMatrix, /iOS/);
assert.match(supportMatrix, /source-installable/);
assert.match(supportMatrix, /Continuous integration runs that gate on Linux, macOS, and Windows/);

const readiness = JSON.parse(readFileSync(join(root, "release-readiness.json"), "utf8"));
assert.equal(readiness.release_gate, "source-installable");
assert.equal(readiness.platforms.linux.status, "ready");
assert.equal(readiness.platforms.macos.status, "source-installable");
assert.equal(readiness.platforms.windows.status, "source-installable");
assert.equal(readiness.platforms.ios.status, "documented");

const packageScript = readFileSync(join(root, "scripts/package-release.mjs"), "utf8");
assert.match(packageScript, /memento-mori-linux-waybar/);
assert.match(packageScript, /memento-mori-local-app/);
assert.match(packageScript, /CHANGELOG\.md/);
assert.match(packageScript, /PRIVACY\.md/);
assert.match(packageScript, /release-manifest\.json/);
assert.match(packageScript, /build_epoch/);
assert.match(packageScript, /pkg\.version/);
assert.match(packageScript, /installers\/macos\/install\.sh/);
assert.match(packageScript, /installers\/windows\/install\.ps1/);
assert.match(packageScript, /release-readiness\.json/);
assert.match(packageScript, /docs\/support-matrix\.md/);
assert.match(packageScript, /scripts\/release-notes\.mjs/);
assert.match(packageScript, /scripts\/test-waybar\.mjs/);
assert.match(packageScript, /SHA256SUMS/);

const installerScript = readFileSync(join(root, "scripts/check-installers.mjs"), "utf8");
assert.match(installerScript, /installer checks passed/);
assert.match(installerScript, /available\("sh"/);
assert.match(installerScript, /installers\/macos\/install\.sh/);
assert.match(installerScript, /installers\/windows\/install\.ps1/);
assert.match(installerScript, /PowerShell/);
assert.match(installerScript, /CFBundleShortVersionString/);

const readinessScript = readFileSync(join(root, "scripts/check-release-readiness.mjs"), "utf8");
assert.match(readinessScript, /release-readiness\.json/);
assert.match(readinessScript, /source-installable/);
assert.match(readinessScript, /npm run check:version/);
assert.match(readinessScript, /npm run release:notes/);

const versionScript = readFileSync(join(root, "scripts/check-version.mjs"), "utf8");
assert.match(versionScript, /version checks passed/);
assert.match(versionScript, /app\/index\.html/);
assert.match(versionScript, /docs\/support-matrix\.md/);
assert.match(versionScript, /installers\/macos\/install\.sh/);
assert.match(versionScript, /release-readiness\.json/);

const webScript = readFileSync(join(root, "scripts/check-web.mjs"), "utf8");
assert.match(webScript, /web smoke checks passed/);
assert.match(webScript, /__health/);
assert.match(webScript, /no-store/);
assert.match(webScript, /pkg\.version/);

const notesScript = readFileSync(join(root, "scripts/release-notes.mjs"), "utf8");
assert.match(notesScript, /CHANGELOG\.md/);
assert.match(notesScript, /Platform Readiness/);
assert.match(notesScript, /process\.stdout\.write/);

const testWaybarScript = readFileSync(join(root, "scripts/test-waybar.mjs"), "utf8");
assert.match(testWaybarScript, /findPython/);
assert.match(testWaybarScript, /tests\.test_waybar/);
assert.match(testWaybarScript, /Python 3 is required for Waybar tests/);

const verifyScript = readFileSync(join(root, "scripts/verify-release.mjs"), "utf8");
assert.match(verifyScript, /release verification passed/);
assert.match(verifyScript, /findPython/);
assert.match(verifyScript, /Python 3 is required/);
assert.match(verifyScript, /release-manifest\.json/);
assert.match(verifyScript, /manifest checksum mismatch/);
assert.match(verifyScript, /check:version/);
assert.match(verifyScript, /release:notes/);
assert.match(verifyScript, /git.*diff.*--check/s);
assert.match(verifyScript, /SHA256SUMS/);

const ci = readFileSync(join(root, ".github/workflows/ci.yml"), "utf8");
assert.match(ci, /npm run verify/);
assert.match(ci, /ubuntu-latest/);
assert.match(ci, /macos-latest/);
assert.match(ci, /windows-latest/);
assert.match(ci, /actions\/setup-python@v5/);
assert.match(ci, /actions\/upload-artifact@v4/);

const releaseWorkflow = readFileSync(join(root, ".github/workflows/release.yml"), "utf8");
assert.match(releaseWorkflow, /npm run verify/);
assert.match(releaseWorkflow, /actions\/setup-python@v5/);
assert.match(releaseWorkflow, /scripts\/release-notes\.mjs > dist\/RELEASE_NOTES\.md/);
assert.match(releaseWorkflow, /gh release create/);
assert.match(releaseWorkflow, /--notes-file dist\/RELEASE_NOTES\.md/);
assert.doesNotMatch(releaseWorkflow, /--generate-notes/);
assert.match(releaseWorkflow, /contents: write/);

const pullRequestTemplate = readFileSync(join(root, ".github/pull_request_template.md"), "utf8");
assert.match(pullRequestTemplate, /npm run verify/);
assert.match(pullRequestTemplate, /UI inspected when visual behavior changed/);
assert.match(pullRequestTemplate, /support matrix updated when platform readiness changed/);
assert.match(pullRequestTemplate, /Does not describe source-installable artifacts as signed native installers/);

const macInstaller = readFileSync(join(root, "installers/macos/install.sh"), "utf8");
assert.match(macInstaller, /APP_BUNDLE=.*\.app/);
assert.match(macInstaller, /CFBundleName/);
assert.match(macInstaller, /APP_VERSION=\$\(node -e/);
assert.match(macInstaller, /node scripts\/serve\.mjs/);

const winInstaller = readFileSync(join(root, "installers/windows/install.ps1"), "utf8");
assert.match(winInstaller, /MementoMori/);
assert.match(winInstaller, /WScript\.Shell/);
assert.match(winInstaller, /scripts\\serve\.mjs/);

const publicDocs = [
  readme,
  privacy,
  changelog,
  install,
  model,
  philosophy,
  commercial,
  apple,
  stack,
  contributing,
  support,
  security,
  release,
  supportMatrix,
  agents,
  JSON.stringify(readiness),
  packageScript,
  readinessScript,
  webScript,
  notesScript,
  verifyScript,
  ci,
  releaseWorkflow,
  pullRequestTemplate,
  macInstaller,
  winInstaller
].join("\n");
assert.doesNotMatch(publicDocs, /MVP|mockup|prototype|prototipo|Codex|Javier|co-development|preview harness|Production Beta/i);

console.log("audit checks passed");
