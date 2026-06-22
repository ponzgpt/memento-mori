import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const required = [
  "LICENSE",
  "README.md",
  "AGENTS.md",
  "app/index.html",
  "app/main.js",
  "app/memento-core.js",
  "docs/feature-status.csv",
  "scripts/serve.mjs",
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

const readme = readFileSync(join(root, "README.md"), "utf8");
assert.match(readme, /Apache-2\.0/);
assert.match(readme, /not medical, legal, actuarial, insurance/i);
assert.match(readme, /What It Does/);
assert.match(readme, /Platform Surfaces/);
assert.match(readme, /Quality Gates/);
assert.match(readme, /philosophy/i);
assert.match(readme, /docs\/install\.md/);
assert.match(readme, /docs\/philosophy\.md/);
assert.match(readme, /docs\/model\.md/);
assert.doesNotMatch(readme, /MVP|mockup|prototype|Production Beta/i);

const featureStatus = readFileSync(join(root, "docs/feature-status.csv"), "utf8");
assert.match(featureStatus, /MM-US-001/);
assert.match(featureStatus, /MM-US-014/);
assert.match(featureStatus, /user_story/);
assert.match(featureStatus, /expected_behavior/);
assert.match(featureStatus, /latest_result/);

const install = readFileSync(join(root, "docs/install.md"), "utf8");
assert.match(install, /Source Install/);
assert.match(install, /Release Artifact/);
assert.match(install, /Linux/);
assert.match(install, /macOS/);
assert.match(install, /Windows 11/);
assert.match(install, /iOS/);
assert.match(install, /GitHub Releases/);
assert.match(install, /provided as-is/i);
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
assert.match(contributing, /Keep profile data local/);

const support = readFileSync(join(root, "SUPPORT.md"), "utf8");
assert.match(support, /provided as-is/);
assert.match(support, /no support entitlement/i);

const security = readFileSync(join(root, "SECURITY.md"), "utf8");
assert.match(security, /local widget/);
assert.match(security, /runtime network service/);

const release = readFileSync(join(root, "docs/release.md"), "utf8");
assert.match(release, /Release Checklist/);
assert.match(release, /SemVer/);
assert.match(release, /Apache-2\.0/);

const publicDocs = [
  readme,
  install,
  model,
  philosophy,
  commercial,
  apple,
  stack,
  contributing,
  support,
  security,
  release
].join("\n");
assert.doesNotMatch(publicDocs, /MVP|mockup|prototype|prototipo|Codex|Javier|co-development|preview harness|Production Beta/i);

console.log("audit checks passed");
