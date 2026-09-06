import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const textFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if ([".git", "node_modules", "dist", "__pycache__", ".pytest_cache", ".DS_Store"].includes(entry)) {
      continue;
    }
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (!/\.(png|jpg|jpeg|gif|webp|woff2?)$/i.test(entry)) {
      textFiles.push(path);
    }
  }
}

walk(root);
for (const path of textFiles) {
  const content = readFileSync(path, "utf8");
  const invalid = Array.from(content).find((character) => {
    const code = character.codePointAt(0);
    return code < 32 && ![9, 10, 13].includes(code);
  });
  assert.equal(invalid, undefined, `${path} contains an unexpected control character`);
}

const html = readFileSync(join(root, "app/index.html"), "utf8");
const main = readFileSync(join(root, "app/main.js"), "utf8");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

assert.match(html, /<html lang="es">/);
assert.match(html, /<title>Memento Mori · Tu tiempo en perspectiva<\/title>/);
assert.match(html, new RegExp(`styles\\.css\\?v=${pkg.version.replaceAll(".", "\\.")}`));
assert.match(html, new RegExp(`main\\.js\\?v=${pkg.version.replaceAll(".", "\\.")}`));
assert.equal((html.match(/<h1/g) || []).length, 1, "the page needs one h1");
assert.doesNotMatch(html, /<svg\b/i, "the final web app should not contain inline SVG artwork");
assert.doesNotMatch(`${html}\n${main}`, /component workbench|preview harness|teleprompter/i);
assert.doesNotMatch(`${html}\n${main}`, /lifestyle offset|smoking|drinking|health condition/i);
assert.match(html, /og\.png/);
assert.match(main, /PROFILE_STORAGE_KEY/);
assert.match(main, /INTENTION_STORAGE_KEY/);

console.log("lint checks passed");
