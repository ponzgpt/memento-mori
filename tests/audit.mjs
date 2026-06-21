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
  "docs/research.md",
  "docs/install.md",
  "docs/philosophy.md",
  "docs/commercial-model.md",
  "docs/apple-platform-plan.md",
  "docs/stack-decisions.md",
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
assert.match(readme, /Commercial Model/);
assert.match(readme, /Component Workbench/);
assert.match(readme, /Apple Platform/);
assert.match(readme, /Stack rationale/);
assert.match(readme, /Production Beta/);
assert.match(readme, /Philosophy/);
assert.match(readme, /docs\/install\.md/);
assert.match(readme, /docs\/philosophy\.md/);

const featureStatus = readFileSync(join(root, "docs/feature-status.csv"), "utf8");
assert.match(featureStatus, /MM-US-001/);
assert.match(featureStatus, /MM-US-014/);
assert.match(featureStatus, /user_story/);
assert.match(featureStatus, /expected_behavior/);
assert.match(featureStatus, /latest_result/);

const install = readFileSync(join(root, "docs/install.md"), "utf8");
assert.match(install, /Beta executable or installer/);
assert.match(install, /Source install/);
assert.match(install, /Linux status\/tray/);
assert.match(install, /macOS menu bar/);
assert.match(install, /Windows 11 system tray/);
assert.match(install, /iOS widgets/);
assert.match(install, /GitHub Releases/);
assert.match(install, /provided as-is/i);

const philosophy = readFileSync(join(root, "docs/philosophy.md"), "utf8");
assert.match(philosophy, /time is the one budget nobody gets to refinance/);
assert.match(philosophy, /dry, not cruel/);
assert.match(philosophy, /Fraunces/);
assert.match(philosophy, /Geist/);
assert.match(philosophy, /SIL Open Font License/);

const commercial = readFileSync(join(root, "docs/commercial-model.md"), "utf8");
assert.match(commercial, /Source code stays on GitHub under Apache-2\.0/);
assert.match(commercial, /one-command install/i);
assert.match(commercial, /cheap signed installer/i);
assert.match(commercial, /free GitHub Release installers/);
assert.match(commercial, /Stripe/);
assert.match(commercial, /beehiiv/);
assert.match(commercial, /No support entitlement/);
assert.match(commercial, /fork/i);

const apple = readFileSync(join(root, "docs/apple-platform-plan.md"), "utf8");
assert.match(apple, /WidgetKit/);
assert.match(apple, /SwiftUI/);
assert.match(apple, /Apple silicon Macs/);
assert.match(apple, /component workbench/i);
assert.match(apple, /system-light/);
assert.match(apple, /system-dark/);
assert.match(apple, /hourglasses/);
assert.match(apple, /https:\/\/developer\.apple\.com\/documentation\/widgetkit/);
assert.match(apple, /https:\/\/dailystoic\.com\/history-of-memento-mori-art\//);

const stack = readFileSync(join(root, "docs/stack-decisions.md"), "utf8");
assert.match(stack, /static HTML\/CSS\/JS/i);
assert.match(stack, /Python Waybar emitter/);
assert.match(stack, /SwiftUI/);
assert.match(stack, /Tauri/);

console.log("audit checks passed");
