import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const port = Number.parseInt(process.env.SMOKE_PORT || "4183", 10);
const baseUrl = `http://127.0.0.1:${port}`;

async function fetchWithRetry(path) {
  let lastError;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      return await fetch(`${baseUrl}${path}`);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw lastError;
}

const server = spawn(process.execPath, ["scripts/serve.mjs", String(port)], {
  cwd: root,
  stdio: "ignore"
});

try {
  const health = await fetchWithRetry("/__health");
  assert.equal(health.status, 200);
  assert.equal((await health.text()).trim(), "ok");

  const index = await fetchWithRetry("/");
  const html = await index.text();
  assert.equal(index.status, 200);
  assert.match(index.headers.get("content-type") || "", /text\/html/);
  assert.match(index.headers.get("cache-control") || "", /no-store/);
  assert.match(html, /Memento Mori · Tu tiempo en perspectiva/);
  assert.match(html, new RegExp(`main\\.js\\?v=${pkg.version.replaceAll(".", "\\.")}`));
  assert.match(html, new RegExp(`styles\\.css\\?v=${pkg.version.replaceAll(".", "\\.")}`));
  assert.match(html, /Calcular mi perspectiva/);

  for (const asset of ["/styles.css", "/main.js", "/memento-core.js"]) {
    const response = await fetchWithRetry(asset);
    assert.equal(response.status, 200, `${asset} must be served`);
    assert.ok((await response.text()).length > 500, `${asset} is unexpectedly small`);
  }

  assert.equal(existsSync(join(root, "app/og.png")), true, "app/og.png is missing");
  const og = await fetchWithRetry("/og.png");
  assert.equal(og.status, 200);
  assert.match(og.headers.get("content-type") || "", /image\/png/);

  const missing = await fetchWithRetry("/missing.txt");
  assert.equal(missing.status, 404);

  console.log("web smoke checks passed");
} finally {
  server.kill();
}
