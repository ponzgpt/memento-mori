import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
const heading = `## ${pkg.version} - `;
const start = changelog.indexOf(heading);

assert.notEqual(start, -1, `CHANGELOG.md is missing a ${pkg.version} section`);

const next = changelog.indexOf("\n## ", start + heading.length);
const section = changelog.slice(start, next === -1 ? changelog.length : next).trim();
const notes = section.replace(/^## /, "# ");
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

assert.match(notes, new RegExp(`# ${pkg.version} - \\d{4}-\\d{2}-\\d{2}`));
assert.match(notes, /Platform Readiness/);
assert.match(notes, /not medical, legal, actuarial, insurance, or mental-health advice/i);
assert.doesNotMatch(notes, forbiddenCopy);

process.stdout.write(`${notes}\n`);
