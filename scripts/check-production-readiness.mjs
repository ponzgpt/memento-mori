import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const readiness = JSON.parse(readFileSync(join(root, "release-readiness.json"), "utf8"));
const production = JSON.parse(readFileSync(join(root, "production-readiness.json"), "utf8"));

assert.equal(production.version, pkg.version, "production-readiness.json version must match package.json");
assert.equal(production.release_state, "source-installable production release");
assert.equal(production.native_installer_state, "not signed");
assert.equal(Array.isArray(production.requirements), true);
assert.equal(production.requirements.length, 11);

const allowedStatuses = new Set(["met", "truthfully-scoped"]);
const ids = new Set();

for (const requirement of production.requirements) {
  assert.match(requirement.id, /^PR-\d{3}$/);
  assert.ok(requirement.name.length > 6, `${requirement.id} needs a meaningful name`);
  assert.ok(allowedStatuses.has(requirement.status), `${requirement.id} has invalid status`);
  assert.equal(Array.isArray(requirement.evidence), true, `${requirement.id} evidence must be an array`);
  assert.ok(requirement.evidence.length > 0, `${requirement.id} needs evidence`);
  assert.equal(ids.has(requirement.id), false, `${requirement.id} is duplicated`);
  ids.add(requirement.id);

  for (const file of requirement.evidence) {
    assert.equal(existsSync(join(root, file)), true, `${requirement.id} evidence missing: ${file}`);
  }
}

for (const expected of [
  "PR-001",
  "PR-002",
  "PR-003",
  "PR-004",
  "PR-005",
  "PR-006",
  "PR-007",
  "PR-008",
  "PR-009",
  "PR-010",
  "PR-011"
]) {
  assert.ok(ids.has(expected), `${expected} is missing from production-readiness.json`);
}

assert.equal(readiness.release_gate, "source-installable");
assert.equal(readiness.platforms.linux.status, "ready");
assert.equal(readiness.platforms.macos.signed_installer, false);
assert.equal(readiness.platforms.windows.signed_installer, false);
assert.equal(readiness.platforms.ios.status, "documented");

const readme = readFileSync(join(root, "README.md"), "utf8");
const install = readFileSync(join(root, "docs/install.md"), "utf8");
const productionDoc = readFileSync(join(root, "docs/production-readiness.md"), "utf8");
const philosophy = readFileSync(join(root, "docs/philosophy.md"), "utf8");
const featureStatus = readFileSync(join(root, "docs/feature-status.csv"), "utf8");
const nativePackaging = readFileSync(join(root, "docs/native-packaging.md"), "utf8");

assert.match(readme, /^# Memento Mori Widget\n\nMemento Mori is a local status-bar widget/);
assert.match(readme, /docs\/production-readiness\.md/);
assert.match(install, /Linux/);
assert.match(install, /macOS/);
assert.match(install, /Windows 11/);
assert.match(productionDoc, /source-installable release/);
assert.match(productionDoc, /Shipping Rule/);
assert.match(productionDoc, /Acknowledgments/);
assert.match(productionDoc, /Unix utility/);
assert.match(productionDoc, /Apple lesson/);
assert.match(philosophy, /Acknowledgments/);
assert.match(philosophy, /vanitas/);
assert.match(featureStatus, /errors_found/);
assert.match(featureStatus, /retest_result/);
assert.match(nativePackaging, /Developer ID/);
assert.match(nativePackaging, /Authenticode/);

const publicText = [
  readme,
  install,
  productionDoc,
  philosophy,
  JSON.stringify(production)
].join("\n");

const forbiddenTerms = [
  ["M", "V", "P"].join(""),
  "mock" + "up",
  "proto" + "type",
  "proto" + "tipo",
  "Co" + "dex",
  "Ja" + "vier",
  "co-" + "development",
  "preview " + "harness",
  "Production " + "Beta"
];

assert.equal(
  forbiddenTerms.filter((term) => publicText.toLowerCase().includes(term.toLowerCase())).length,
  0,
  "public release text contains forbidden development wording"
);

console.log("production readiness checks passed");
