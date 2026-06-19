import assert from "node:assert/strict";
import {
  buildWaybarPayload,
  calculateEstimate,
  formatDuration,
  serializeProfileConfig
} from "../app/memento-core.js";

const now = new Date("2026-06-19T09:00:00Z");

const profile = {
  birthDate: "1990-01-01",
  birthCountry: "USA",
  currentCountry: "USA",
  moveAge: 0,
  skin: "system-light"
};

const baseline = calculateEstimate(profile, now);
assert.equal(baseline.valid, true);
assert.equal(baseline.baseline.label, "United States");
assert.equal(Number(baseline.lifeExpectancyYears.toFixed(4)), 78.8902);
assert.ok(baseline.remainingMs > 0);

const adjustedProfile = {
  ...profile,
  sex: "female",
  sleep: "stable",
  exercise: "regular",
  drinking: "low",
  smoking: "none",
  health: "none",
};

const adjusted = calculateEstimate(adjustedProfile, now);
assert.ok(adjusted.lifeExpectancyYears > baseline.lifeExpectancyYears);

const payload = buildWaybarPayload(adjusted, { skin: "system-dark" });
assert.equal(payload.class.includes("memento-mori"), true);
assert.equal(payload.class.includes("skin-system-dark"), true);
assert.match(payload.text, /^\d+y \d+d \d+h \d+m \d+s$/);
assert.equal(typeof payload.percentage, "number");

const config = serializeProfileConfig(adjustedProfile, adjusted);
assert.equal(config.schema, "memento-mori.profile.v1");
assert.equal(config.birth_date, "1990-01-01");
assert.equal(config.birth_country, "USA");
assert.equal(config.current_country, "USA");
assert.equal(config.skin, "system-light");
assert.equal("manual_adjustment_years" in config, false);
assert.equal("mode" in config, false);
assert.equal("display" in config, false);

const movedProfile = {
  ...profile,
  birthCountry: "JPN",
  currentCountry: "USA",
  moveAge: 19
};
const moved = calculateEstimate(movedProfile, now);
assert.equal(moved.baseline.label, "Japan -> United States");
assert.ok(moved.baseline.years < 84.0364);
assert.ok(moved.baseline.years > 78.8902);

assert.equal(formatDuration(1000, "seconds"), "1s");
assert.match(formatDuration(366 * 24 * 60 * 60 * 1000, "compact"), /^1y \d+d \d+h$/);
assert.match(buildWaybarPayload(adjusted).text, /^\d+y \d+d \d+h \d+m \d+s$/);

console.log("memento-core tests passed");
