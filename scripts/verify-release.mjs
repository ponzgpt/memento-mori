import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const commands = [
  [npm, ["run", "audit"]],
  [npm, ["run", "check:installers"]],
  [npm, ["run", "check:release"]],
  [npm, ["run", "check:web"]],
  [npm, ["run", "lint"]],
  [npm, ["test"]],
  [npm, ["run", "package"]],
  ["python3", ["-m", "py_compile", "waybar/memento.py"]],
  ["python3", ["waybar/memento.py", "--config", "config/profile.example.json"]],
  ["git", ["diff", "--check"]]
];

function run(command, args) {
  const label = [command, ...args].join(" ");
  console.log(`\n$ ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit"
  });

  assert.equal(result.status, 0, `${label} failed`);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

for (const [command, args] of commands) {
  run(command, args);
}

const sumsPath = join(dist, "SHA256SUMS");
assert.equal(existsSync(sumsPath), true, "dist/SHA256SUMS is missing");

const sums = readFileSync(sumsPath, "utf8")
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [digest, file] = line.split(/\s+/);
    return { digest, file };
  });

assert.ok(sums.length >= 2, "expected at least two release artifacts");

for (const item of sums) {
  const artifact = join(dist, item.file);
  assert.equal(existsSync(artifact), true, `${item.file} is missing`);
  assert.equal(sha256(artifact), item.digest, `${item.file} checksum mismatch`);
}

console.log("\nrelease verification passed");
