import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("app/index.html");
const main = read("app/main.js");
const styles = read("app/styles.css");
const requirements = read("docs/product-requirements.md");
const featureStatus = read("docs/feature-status.csv");

const storyIds = [...featureStatus.matchAll(/MM-WEB-\d{3}/g)].map((match) => match[0]);
assert.equal(new Set(storyIds).size, 12, "feature-status.csv must contain 12 unique web stories");

for (const id of new Set(storyIds)) {
  const line = featureStatus.split("\n").find((row) => row.startsWith(`${id},`));
  assert.ok(line, `${id} row is missing`);
  assert.match(line, /,passed,tests\/feature-stories\.mjs,/);
  assert.match(line, /,passed$/);
}

assert.match(html, /id="profile-form"/);
assert.match(html, /id="birth-date"[^>]+type="date"/);
assert.match(html, /id="country"/);
assert.match(main, /validateBirthDate/);
assert.match(main, /calculateEstimate/);

assert.match(html, /data-horizon-date/);
assert.match(html, /data-range-start/);
assert.match(html, /data-range-end/);
assert.match(html, /±7 años/);
assert.match(main, /getPerspectiveRange/);

assert.match(html, /data-life-grid/);
assert.match(main, /year <= 100/);
assert.match(styles, /\.life-year\.lived/);
assert.match(styles, /\.life-year\.remaining/);
assert.match(styles, /\.life-year\.range/);

assert.match(html, /id="intention-form"/);
assert.match(html, /maxlength="160"/);
assert.match(main, /memento-mori\.daily-intention\.v1/);
assert.match(main, /aria-pressed/);
assert.match(main, /data-clear-intention/);

assert.match(main, /memento-mori\.web-profile\.v2/);
assert.match(main, /window\.localStorage/);
assert.match(main, /Persistencia no disponible/);
assert.match(main, /window\.confirm/);

assert.match(html, /Sin cuenta, sin anuncios y sin enviar tus datos/);
assert.match(html, /No es una fecha de muerte predicha/);
assert.match(html, /No es una predicción individual ni consejo médico/);
assert.match(requirements, /Never claim to predict an individual death/);

assert.match(html, /class="skip-link"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /role="alert"/);
assert.match(styles, /prefers-reduced-motion/);
assert.match(styles, /@media \(max-width: 720px\)/);

assert.match(main, /navigator\.clipboard\.writeText/);
assert.match(main, /sin incluir tu fecha de nacimiento/i);
const copiedSummary = main.match(/const summary = \[([\s\S]*?)\]\.join/);
assert.ok(copiedSummary, "copy summary block is missing");
assert.doesNotMatch(copiedSummary[1], /birthDate|birth-date/);

assert.match(requirements, /Add no backend, database, authentication, payment/);
assert.doesNotMatch(html, /<script[^>]+https?:\/\//);
assert.doesNotMatch(html, /analytics|tracking|pixel/i);

console.log("feature stories passed");
