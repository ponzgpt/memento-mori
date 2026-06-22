import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

function findPython() {
  const candidates = [
    { command: "python3", args: [] },
    { command: "python", args: [] },
    { command: "py", args: ["-3"] }
  ];

  for (const candidate of candidates) {
    const result = spawnSync(candidate.command, [...candidate.args, "--version"], {
      encoding: "utf8"
    });
    if (result.status === 0) {
      return candidate;
    }
  }

  throw new Error("Python 3 is required for Waybar tests");
}

const python = findPython();
const result = spawnSync(python.command, [...python.args, "-m", "unittest", "tests.test_waybar"], {
  encoding: "utf8",
  stdio: "inherit"
});

assert.equal(result.status, 0, "Waybar Python tests failed");
