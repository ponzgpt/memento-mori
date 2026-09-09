import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("app/index.html");
const main = read("app/main.js");
const i18n = read("app/i18n.js");
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
assert.match(html, /id="birth-country"/);
assert.match(html, /id="current-country"/);
assert.match(html, /id="move-age"/);
for (const key of ["sex", "sleep", "exercise", "drinking", "smoking", "health"]) {
  assert.match(html, new RegExp(`id="factor-${key}"`));
}
assert.match(main, /validateBirthDate/);
assert.match(main, /calculateEstimate/);

assert.match(html, /data-horizon-date/);
assert.match(html, /data-range-start/);
assert.match(html, /data-range-end/);
assert.match(html, /±7-year/);
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
assert.match(i18n, /Persistence unavailable/);
assert.match(main, /window\.confirm/);

assert.match(html, /No account, no ads, and nothing sent/);
assert.match(html, /not a predicted death date/);
assert.match(html, /not medical, actuarial, insurance, legal, or mental-health advice/);
assert.match(requirements, /Never claim to predict an individual death/);

assert.match(html, /class="skip-link"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /role="alert"/);
assert.match(styles, /prefers-reduced-motion/);
assert.match(styles, /@media \(max-width: 720px\)/);

assert.match(main, /navigator\.clipboard\.writeText/);
assert.match(i18n, /without your birth date/i);
const copiedSummary = main.match(/const summary = \[([\s\S]*?)\]\.join/);
assert.ok(copiedSummary, "copy summary block is missing");
assert.doesNotMatch(copiedSummary[1], /birthDate|birth-date/);

assert.match(requirements, /Add no backend, database, authentication, payment/);
assert.doesNotMatch(html, /<script[^>]+https?:\/\//);
// La versión anterior prohibía la palabra "analytics" a secas, lo que en
// español nunca chocaba con nada (la copia decía "analítica") pero rompe en
// cuanto la página en inglés dice honestamente "no analytics" -exactamente
// la frase que este chequeo debería aprobar, no bloquear-. Lo que de verdad
// hay que impedir es un fragmento de tracker real, no la palabra en prosa.
assert.doesNotMatch(html, /google-analytics|googletagmanager|gtag\(|fbq\(|plausible\.io|<img[^>]+pixel/i);

// La web es la demo, el widget es el producto: la página tiene que apuntar
// al repositorio para que quien pruebe la web pueda instalarlo.
assert.match(html, /id="descargar"/);
assert.match(html, /github\.com\/ponzgpt\/memento-mori/);

console.log("feature stories passed");
