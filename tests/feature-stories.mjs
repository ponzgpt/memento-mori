import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BASELINES,
  DEFAULT_PROFILE,
  buildResidenceBaseline,
  buildWaybarPayload,
  calculateCustomOffset,
  calculateEstimate,
  formatDuration,
  serializeProfileConfig
} from "../app/memento-core.js";

const root = new URL("..", import.meta.url).pathname;
const html = readFileSync(join(root, "app/index.html"), "utf8");
const main = readFileSync(join(root, "app/main.js"), "utf8");
const core = readFileSync(join(root, "app/memento-core.js"), "utf8");
const styles = readFileSync(join(root, "app/styles.css"), "utf8");
const featureStatus = readFileSync(join(root, "docs/feature-status.csv"), "utf8");
const installDocs = readFileSync(join(root, "docs/install.md"), "utf8");
const commercialDocs = readFileSync(join(root, "docs/commercial-model.md"), "utf8");
const philosophyDocs = readFileSync(join(root, "docs/philosophy.md"), "utf8");
const modelDocs = readFileSync(join(root, "docs/model.md"), "utf8");
const releaseDocs = readFileSync(join(root, "docs/release.md"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const serve = readFileSync(join(root, "scripts/serve.mjs"), "utf8");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" && !quoted) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records
    .filter((record) => record.some(Boolean))
    .map((record) =>
      Object.fromEntries(headers.map((header, index) => [header, record[index] || ""]))
    );
}

const stories = parseCsv(featureStatus);
const byId = new Map(stories.map((story) => [story.id, story]));

function story(id) {
  const item = byId.get(id);
  assert.ok(item, `${id} missing from feature-status.csv`);
  assert.equal(item.status, "passed", `${id} status must be current`);
  assert.equal(item.latest_result, "passed", `${id} latest_result must be current`);
  assert.match(item.user_story, /^As a /, `${id} must be a user story`);
  assert.ok(item.expected_behavior.length > 30, `${id} expected behavior is too thin`);
  assert.match(item.test_refs, /tests\/feature-stories\.mjs/, `${id} must cite story tests`);
  return item;
}

assert.equal(stories.length, 14, "feature-status.csv should track every current story");
assert.equal(new Set(stories.map((item) => item.id)).size, stories.length, "story IDs must be unique");

{
  story("MM-US-001");
  const estimate = calculateEstimate(
    { ...DEFAULT_PROFILE, birthDate: "1992-06-19" },
    new Date("2026-06-19T12:00:00Z")
  );
  assert.equal(estimate.valid, true);
  assert.ok(estimate.remainingMs > 0);
  assert.ok(estimate.progress > 0 && estimate.progress < 1);
  assert.ok(["calm", "finite", "near", "borrowed"].includes(estimate.stateClass));
  assert.equal(calculateEstimate({ ...DEFAULT_PROFILE, birthDate: "bad-date" }).valid, false);
}

{
  story("MM-US-002");
  const profile = {
    ...DEFAULT_PROFILE,
    birthDate: "1980-01-01",
    birthCountry: "ESP",
    currentCountry: "GBR",
    moveAge: 34
  };
  const ageYears = 46;
  const baseline = buildResidenceBaseline(profile, ageYears);
  assert.equal(baseline.label, "Spain -> United Kingdom");
  assert.ok(baseline.migrationWeight > 0);
  assert.notEqual(baseline.years, BASELINES.ESP.years);
  assert.equal(buildResidenceBaseline({ ...profile, moveAge: 80 }, ageYears).migrationWeight, 0);
}

{
  story("MM-US-003");
  const offset = calculateCustomOffset({
    sex: "female",
    sleep: "stable",
    exercise: "regular",
    drinking: "low",
    smoking: "none",
    health: "none"
  });
  assert.ok(offset.years > 0);
  assert.equal(offset.details.length, 6);
  assert.equal((html.match(/data-factor=/g) || []).length, 14);
  assert.equal(/<select name="(sex|smoking|movement|recovery|health)"/.test(html), false);
  assert.match(main, /setFactor/);
}

{
  story("MM-US-004");
  assert.match(formatDuration(1_000, "full"), /\d+y \d+d \d+h \d+m \d+s/);
  assert.match(formatDuration(-1_000, "full"), /^\+/);
  assert.match(html, /data-countdown/);
}

{
  story("MM-US-005");
  const waybarOutput = execFileSync("python3", [
    join(root, "waybar/memento.py"),
    "--config",
    join(root, "config/profile.example.json")
  ], { encoding: "utf8" });
  const payload = JSON.parse(waybarOutput);
  assert.match(payload.text, /\d+y \d+d \d+h \d+m \d+s/);
  assert.ok(Array.isArray(payload.class));
  assert.equal(typeof payload.percentage, "number");
  assert.match(payload.tooltip, /mental-health advice/);
  const webPayload = buildWaybarPayload(calculateEstimate(DEFAULT_PROFILE), { skin: "system-light" });
  assert.match(webPayload.tooltip, /mental-health advice/);
}

{
  story("MM-US-006");
  assert.match(html, /Linux system tray/);
  assert.match(html, /macOS status menu bar/);
  assert.match(html, /W11 system tray/);
  assert.equal(html.includes("Finder"), false);
  assert.equal(html.includes("Start"), false);
  assert.equal(html.includes("Activities"), false);
  assert.match(html, /data-widget-progress/);
}

{
  story("MM-US-007");
  assert.equal((html.match(/data-action="toggle-skin"/g) || []).length, 4);
  assert.match(html, /bone and ash/);
  assert.match(html, /onyx/);
  assert.match(main, /toggleSkin/);
  assert.match(main, /dataset\.activeSkin/);
}

{
  story("MM-US-008");
  assert.match(html, /data-panel-dock-widget/);
  assert.match(html, /data-app-panel/);
  assert.match(main, /function setPanelOpen/);
  assert.match(main, /addEventListener\("dblclick"/);
  assert.match(main, /closest\("button, input, select, label"\)/);
}

{
  story("MM-US-009");
  for (const field of ["birthDate", "birthCountry", "currentCountry", "moveAge"]) {
    assert.match(html, new RegExp(field));
  }
  assert.equal(html.includes("<details"), false);
  assert.equal(html.includes("Restart clock"), false);
  assert.match(main, /collectFields/);
}

{
  story("MM-US-010");
  assert.equal(html.includes("data-reflection-title"), false);
  assert.equal(html.includes("data-toast-title"), false);
  assert.match(main, /postponing your life/);
  assert.match(main, /teeth remain a bold option/);
  assert.match(styles, /width: min\(var\(--tray-widget-width\)/);
}

{
  story("MM-US-011");
  assert.match(styles, /Fraunces/);
  assert.match(styles, /Geist/);
  assert.match(styles, /--ornament/);
  assert.match(html, /data-mark="hourglass"/);
  assert.match(html, /art-candle/);
  assert.match(html, /art-bones/);
}

{
  story("MM-US-012");
  assert.equal(packageJson.scripts.serve, "node scripts/serve.mjs");
  assert.match(serve, /__health/);
  assert.match(serve, /no-store/);
  assert.match(serve, /127\.0\.0\.1/);
}

{
  story("MM-US-013");
  assert.match(installDocs, /Linux/);
  assert.match(installDocs, /Windows 11/);
  assert.match(installDocs, /iOS/);
  assert.match(installDocs, /Release Artifact/);
  assert.match(installDocs, /installers\/macos\/install\.sh/);
  assert.match(installDocs, /installers\\windows\\install\.ps1/);
  assert.match(commercialDocs, /GitHub Releases/);
  assert.match(commercialDocs, /Stripe/);
  assert.equal(packageJson.scripts.package, "node scripts/package-release.mjs");
  assert.match(releaseDocs, /SHA256SUMS/);
}

{
  story("MM-US-014");
  assert.match(readme, /docs\/philosophy\.md/);
  assert.match(philosophyDocs, /dry, not cruel/);
  assert.match(philosophyDocs, /not an oracle/);
  assert.match(philosophyDocs, /not a hostage situation/);
  assert.match(modelDocs, /World Bank WDI/);
  const serialized = serializeProfileConfig(DEFAULT_PROFILE);
  assert.match(serialized.disclaimer, /mental-health advice/);
}

console.log("feature stories passed");
