import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const port = Number.parseInt(process.env.SMOKE_PORT || "4183", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const forbiddenTerms = [
  ["M", "V", "P"].join(""),
  ["mock", "up"].join(""),
  ["proto", "type"].join(""),
  ["proto", "tipo"].join(""),
  ["Co", "dex"].join(""),
  ["Ja", "vier"].join(""),
  ["co", "development"].join("-"),
  ["preview", "harness"].join(" "),
  ["Production", "Beta"].join(" ")
];
const forbiddenCopy = new RegExp(forbiddenTerms.join("|"), "i");

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithRetry(path, options = {}) {
  let lastError;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      return response;
    } catch (error) {
      lastError = error;
      await wait(100);
    }
  }

  throw lastError;
}

async function read(response) {
  return {
    cache: response.headers.get("cache-control") || "",
    contentType: response.headers.get("content-type") || "",
    text: await response.text()
  };
}

const server = spawn(process.execPath, ["scripts/serve.mjs", String(port)], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"]
});

const output = [];
server.stdout.on("data", (chunk) => output.push(chunk.toString()));
server.stderr.on("data", (chunk) => output.push(chunk.toString()));

try {
  const health = await fetchWithRetry("/__health");
  assert.equal(health.status, 200);
  assert.equal((await health.text()).trim(), "ok");

  const indexResponse = await fetchWithRetry("/?v=web-smoke");
  assert.equal(indexResponse.status, 200);
  const index = await read(indexResponse);
  assert.match(index.contentType, /text\/html/);
  assert.match(index.cache, /no-store/);
  assert.match(index.text, /Memento Mori widget/);
  assert.match(index.text, /main\.js\?v=1\.0\.0/);
  assert.match(index.text, /styles\.css\?v=1\.0\.0/);
  assert.doesNotMatch(index.text, forbiddenCopy);

  const cssResponse = await fetchWithRetry("/styles.css?v=1.0.0");
  assert.equal(cssResponse.status, 200);
  const css = await read(cssResponse);
  assert.match(css.contentType, /text\/css/);
  assert.match(css.text, /Fraunces/);
  assert.match(css.text, /Geist/);
  assert.doesNotMatch(css.text, forbiddenCopy);

  const jsResponse = await fetchWithRetry("/main.js?v=1.0.0");
  assert.equal(jsResponse.status, 200);
  const js = await read(jsResponse);
  assert.match(js.contentType, /text\/javascript/);
  assert.match(js.text, /memento-mori\.profile\.v1/);
  assert.doesNotMatch(js.text, forbiddenCopy);

  const missing = await fetchWithRetry("/missing.txt");
  assert.equal(missing.status, 404);

  const core = readFileSync(join(root, "app/memento-core.js"), "utf8");
  assert.match(core, /buildWaybarPayload/);

  console.log("web smoke checks passed");
} finally {
  server.kill();
  await new Promise((resolve) => {
    server.once("close", resolve);
    setTimeout(resolve, 1000);
  });

  if (process.exitCode) {
    console.error(output.join(""));
  }
}
