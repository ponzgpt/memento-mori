import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const pkg = JSON.parse(read("package.json"));
const production = JSON.parse(read("production-readiness.json"));

assert.equal(production.version, pkg.version);
assert.equal(production.release_state, "source-installable production release");
assert.equal(production.native_installer_state, "not signed");
assert.equal(production.requirements.length, 11);

const allowedStatuses = new Set(["met", "truthfully-scoped"]);
const ids = new Set();
for (const requirement of production.requirements) {
  assert.match(requirement.id, /^PR-\d{3}$/);
  assert.ok(requirement.name.length > 6);
  assert.ok(allowedStatuses.has(requirement.status));
  assert.ok(requirement.evidence.length > 0);
  assert.equal(ids.has(requirement.id), false, `${requirement.id} is duplicated`);
  ids.add(requirement.id);
  for (const file of requirement.evidence) {
    assert.equal(existsSync(join(root, file)), true, `${requirement.id} evidence missing: ${file}`);
  }
}

const readme = read("README.md");
const deployment = read("docs/deployment.md");
const requirements = read("docs/product-requirements.md");
assert.match(readme, /web app/i);
assert.match(readme, /memento\.technoir\.cloud/);
assert.match(requirements, /real calendar date/);
assert.match(deployment, /docker service update/);
assert.match(deployment, /docker service rollback/);

console.log("production readiness checks passed");
