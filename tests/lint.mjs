import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const textFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", "dist", ".DS_Store"].includes(entry)) {
      continue;
    }
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
    } else if (!entry.endsWith(".png")) {
      textFiles.push(path);
    }
  }
}

walk(root);

for (const path of textFiles) {
  const content = readFileSync(path, "utf8");
  const allowed = new Set([]);
  const invalid = Array.from(content).find((char) => {
    const code = char.codePointAt(0);
    return !allowed.has(char) && code !== 9 && code !== 10 && code !== 13 && (code < 32 || code > 126);
  });
  assert.equal(invalid, undefined, `${path} contains unexpected non-ASCII text: ${invalid}`);
}

const html = readFileSync(join(root, "app/index.html"), "utf8");
const main = readFileSync(join(root, "app/main.js"), "utf8");

assert.equal(html.includes("visible in seconds mode"), false, "remove v1 seconds-mode helper copy");
assert.equal(main.includes("visible in seconds mode"), false, "remove v1 seconds-mode helper logic");
assert.equal(/<select name="(sex|smoking|movement|recovery|health)"/.test(html), false, "custom settings must not use dropdowns");
assert.equal((html.match(/data-factor=/g) || []).length, 14, "custom settings should expose 14 checkbox options");
assert.match(html, /data-widget-progress/, "widget progress must be integrated into the Waybar preview");
assert.equal(html.includes("Approx remaining"), false, "remove approximate remaining label");
assert.equal(html.includes("Custom inference"), false, "remove internal mode copy");
assert.equal(html.includes("Waybar module first"), false, "remove process copy");
assert.equal(html.includes("Generated config"), false, "frontend must not expose backend config");
assert.equal(html.includes("Unchecked rows are ignored"), false, "frontend must not expose backend wording");
assert.equal(html.includes("Manual adjustment"), false, "manual adjustment must not be visible");
assert.equal(html.includes("Display"), false, "display setting must not be visible");
assert.equal(html.includes("Setup view"), false, "setup view explainer panel must not be visible");
assert.equal(html.includes("Quick start"), false, "quickstart concept must not be visible");
assert.equal(html.includes("Use custom settings"), false, "custom-start concept must not be visible");
assert.equal(html.includes("Restart clock"), false, "restart action removed because settings update live");
assert.equal(html.includes('data-action="quick"'), false, "quickstart action removed");
assert.equal(html.includes('data-action="custom"'), false, "custom-start action removed");
assert.equal(html.includes('data-action="recalculate"'), false, "restart action removed");
assert.equal(html.includes("data-menu-action"), false, "menu restart action removed");
assert.equal(html.includes("Recovered time"), false, "old delta label removed");
assert.match(html, /Live model/);
assert.equal(html.includes("data-menu-display"), false, "right-click menu must not expose display mode");
assert.equal(html.includes("<details"), false, "setup should remain one visible panel");
assert.equal(html.includes("<summary"), false, "setup should not have collapsible subsections");
assert.equal(html.includes("webpage"), false, "component workbench should not present itself as a webpage");
assert.equal(html.includes("preview harness"), false, "UI must not expose development harness wording");
assert.match(html, /<title>Memento Mori widget<\/title>/);
assert.match(html, /A quiet little deadline/);
assert.match(html, /minimized to tray\/bar/);
assert.match(html, /Linux system tray/);
assert.match(html, /macOS status menu bar/);
assert.match(html, /W11 system tray/);
assert.match(html, /Contextual right-click menus/);
assert.equal(html.includes("Status Bars"), false, "status bars section renamed");
assert.equal(html.includes("OS bars"), false, "OS bars label replaced by minimized tray/bar copy");
assert.equal(html.includes("Linux status bar"), false, "linux label renamed");
assert.equal(html.includes("macOS menu bar"), false, "macOS label renamed");
assert.equal(html.includes("Windows 11 taskbar"), false, "Windows label renamed");
assert.equal(html.includes("Activities"), false, "tray previews should not include adjacent Linux shell items");
assert.equal(html.includes("Terminal"), false, "tray previews should not include adjacent Linux app items");
assert.equal(html.includes("Finder"), false, "tray previews should not include adjacent macOS menu items");
assert.equal(html.includes("File"), false, "tray previews should not include adjacent macOS menu items");
assert.equal(html.includes("Start"), false, "tray previews should not include adjacent Windows taskbar items");
assert.equal(html.includes("Search"), false, "tray previews should not include adjacent Windows taskbar items");
assert.equal(html.includes("Right-Click Menu"), false, "right-click menu preview renamed");
assert.equal(html.includes("Setup Configuration Panel"), false, "settings should live inside the maximized app pane");
assert.match(html, /Widget Panel/);
assert.match(html, /Apps and widgets/);
assert.match(html, /Linux desktop app/);
assert.match(html, /W11 desktop app/);
assert.match(html, /macOS app/);
assert.match(html, /iOS app icon and widgets/);
assert.match(html, /Reflection Popup/);
assert.match(html, /Death date/);
assert.match(html, /Birth country/);
assert.match(html, /Living in country/);
assert.match(html, /Since age/);
assert.equal(html.includes("data-menu-skin"), false, "visible menu should use one palette toggle, not skin name buttons");
assert.equal((html.match(/data-action="toggle-skin"/g) || []).length, 4, "three preview menus plus live context menu should have a palette toggle");
assert.match(html, /bone and ash/);
assert.match(html, /onyx/);
assert.equal(html.includes("System light"), false, "visible menu should not expose internal skin name");
assert.equal(html.includes("System dark"), false, "visible menu should not expose internal skin name");
assert.equal(html.includes("Gilded"), false, "gilded skin removed");
assert.equal(html.includes("Marble"), false, "marble skin removed");
assert.equal(html.includes(String.fromCodePoint(0x2620)), false, "logo should not use skull-and-crossbones");
assert.match(html, /clock-art/);
assert.match(html, /art-bones/);
assert.match(html, /art-candle/);
assert.equal(html.includes("data-reflection-title"), false, "reflection popup should not have a title");
assert.equal(html.includes("data-toast-title"), false, "toast should not have a title");
assert.match(main, /postponing your life/);
assert.match(main, /teeth remain a bold option/);

const styles = readFileSync(join(root, "app/styles.css"), "utf8");
assert.match(styles, /Fraunces/);
assert.match(styles, /Geist/);
assert.match(styles, /font-variation-settings/);

const serve = readFileSync(join(root, "scripts/serve.mjs"), "utf8");
assert.match(serve, /__health/);
assert.match(serve, /no-store/);
assert.match(serve, /127\.0\.0\.1/);

const packageJson = readFileSync(join(root, "package.json"), "utf8");
assert.doesNotMatch(packageJson, /MVP|mockup|prototype/i);
assert.match(packageJson, /"package": "node scripts\/package-release\.mjs"/);

console.log("lint checks passed");
