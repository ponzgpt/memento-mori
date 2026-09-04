import assert from "node:assert/strict";
import {
  DEFAULT_PROFILE,
  buildWaybarPayload,
  calculateEstimate,
  formatDuration,
  getPerspectiveRange,
  serializeProfileConfig,
  validateBirthDate
} from "../app/memento-core.js";

const now = new Date("2026-08-01T12:00:00Z");
const webProfile = {
  ...DEFAULT_PROFILE,
  birthDate: "1990-01-01",
  country: "ESP",
  birthCountry: "ESP",
  currentCountry: "ESP"
};

const estimate = calculateEstimate(webProfile, now);
assert.equal(estimate.valid, true);
assert.equal(estimate.baseline.label, "Spain");
assert.equal(Number(estimate.lifeExpectancyYears.toFixed(4)), 83.8878);
assert.ok(estimate.remainingMs > 0);
assert.ok(estimate.progress > 0 && estimate.progress < 1);

const range = getPerspectiveRange(estimate);
assert.equal(range.marginYears, 7);
assert.ok(range.start < estimate.deathDate);
assert.ok(range.end > estimate.deathDate);

assert.equal(validateBirthDate("", now).valid, false);
assert.equal(validateBirthDate("2026-02-30", now).valid, false);
assert.equal(validateBirthDate("2027-01-01", now).valid, false);
assert.equal(validateBirthDate("1890-01-01", now).valid, false);
assert.equal(validateBirthDate("2000-02-29", now).valid, true);
assert.equal(calculateEstimate({ ...webProfile, birthDate: "bad" }, now).valid, false);

assert.equal(formatDuration(1000, "seconds"), "1s");
assert.match(formatDuration(366 * 24 * 60 * 60 * 1000, "compact"), /^1y \d+d \d+h$/);

const payload = buildWaybarPayload(estimate, { skin: "system-dark" });
assert.ok(payload.class.includes("memento-mori"));
assert.ok(payload.class.includes("skin-system-dark"));
assert.equal(typeof payload.percentage, "number");

const config = serializeProfileConfig(webProfile, estimate);
assert.equal(config.schema, "memento-mori.profile.v1");
assert.equal(config.birth_date, "1990-01-01");
assert.equal(config.birth_country, "ESP");
assert.equal("manual_adjustment_years" in config, false);

console.log("memento-core tests passed");
