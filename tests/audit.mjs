import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const requiredFiles = [
  "app/index.html",
  "app/main.js",
  "app/memento-core.js",
  "app/styles.css",
  "app/og.png",
  "docs/product-requirements.md",
  "docs/model.md",
  "docs/deployment.md",
  "docs/feature-status.csv",
  "README.md",
  "PRIVACY.md",
  "Dockerfile"
];

for (const file of requiredFiles) {
  assert.equal(existsSync(join(root, file)), true, `required project file missing: ${file}`);
}

const html = read("app/index.html");
const main = read("app/main.js");
const readme = read("README.md");
const privacy = read("PRIVACY.md");
const requirements = read("docs/product-requirements.md");
const deployment = read("docs/deployment.md");
const model = read("docs/model.md");
const stack = read("docs/stack-decisions.md");
const dockerfile = read("Dockerfile");
const pkg = JSON.parse(read("package.json"));

assert.equal(pkg.version, "2.0.0");
assert.match(html, /main\.js\?v=2\.0\.0-r2/, "HTML must invalidate the prior runtime cache");
assert.match(main, /memento-core\.js\?v=2\.0\.0-r2/, "runtime import must invalidate the prior core cache");
assert.match(readme, /^# Memento Mori\n/);
assert.match(readme, /https:\/\/memento\.technoir\.cloud\//);
assert.match(readme, /The concrete problem/);
assert.match(readme, /Primary flow/);
assert.match(readme, /Why the stack is intentionally small/);
assert.match(readme, /retained experimental native companions/i);

assert.match(requirements, /## User problem/);
assert.match(requirements, /## Acceptance criteria/);
assert.match(requirements, /Add no backend, database, authentication, payment/);
assert.match(model, /SP\.DYN\.LE00\.IN/);
assert.match(model, /seven-year margin/i);
assert.match(model, /lifestyle offsets/);
assert.match(privacy, /memento-mori\.web-profile\.v2/);
assert.match(privacy, /memento-mori\.daily-intention\.v1/);
assert.match(privacy, /does not receive the entered values/i);

for (const section of [
  "Why this deployment was chosen",
  "Step 1 — Verify the source",
  "Step 2 — Build an immutable image",
  "Step 6 — Update the Swarm service",
  "Rollback",
  "Alternative considered"
]) {
  assert.ok(deployment.includes(section), `deployment runbook missing: ${section}`);
}
assert.match(deployment, /Cost/);
assert.match(deployment, /Course alignment/);
assert.match(deployment, /Traefik/);
assert.match(deployment, /TLS/);
assert.match(deployment, /docker service rollback/);

assert.match(stack, /User value/);
assert.match(stack, /Cost/);
assert.match(stack, /Course fit/);
assert.match(stack, /Backend\/API/);
assert.match(dockerfile, /nginx:1\.27-alpine/);
assert.match(dockerfile, /COPY app\//);

assert.match(html, /Recuerda que vas a morir/);
assert.match(html, /Calcular mi perspectiva/);
assert.match(html, /data-intention-section/);
assert.match(main, /validateForm/);
assert.match(main, /renderLifeGrid/);
assert.match(main, /calculateAndRender/);

const primaryPublicText = [html, main, readme, privacy, requirements, deployment, model, stack].join("\n");
assert.doesNotMatch(primaryPublicText, /teleprompter/i);
assert.doesNotMatch(primaryPublicText, /component workbench|preview harness/i);
assert.doesNotMatch(primaryPublicText, /Production Beta/i);

console.log("project audit passed");
