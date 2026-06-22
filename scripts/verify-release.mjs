import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

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

  throw new Error("Python 3 is required for release verification");
}

const python = findPython();

const commands = [
  [npm, ["run", "audit"]],
  [npm, ["run", "check:installers"]],
  [npm, ["run", "check:release"]],
  [npm, ["run", "check:version"]],
  [npm, ["run", "check:web"]],
  [npm, ["run", "lint"]],
  [npm, ["test"]],
  [npm, ["run", "release:notes"]],
  [npm, ["run", "package"]],
  [python.command, [...python.args, "-m", "py_compile", "waybar/memento.py"]],
  [python.command, [...python.args, "waybar/memento.py", "--config", "config/profile.example.json"]],
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
const manifestPath = join(dist, "release-manifest.json");
assert.equal(existsSync(sumsPath), true, "dist/SHA256SUMS is missing");
assert.equal(existsSync(manifestPath), true, "dist/release-manifest.json is missing");

const sums = readFileSync(sumsPath, "utf8")
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [digest, file] = line.split(/\s+/);
    return { digest, file };
  });

assert.ok(sums.length >= 2, "expected at least two release artifacts");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.version, JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version);
assert.equal(manifest.release_gate, "source-installable");
assert.match(manifest.disclaimer, /mental-health advice/);
assert.equal(Array.isArray(manifest.artifacts), true);
assert.equal(manifest.artifacts.length, sums.length);

for (const item of sums) {
  const artifact = join(dist, item.file);
  assert.equal(existsSync(artifact), true, `${item.file} is missing`);
  assert.equal(sha256(artifact), item.digest, `${item.file} checksum mismatch`);
  const manifestArtifact = manifest.artifacts.find((entry) => entry.file === item.file);
  assert.ok(manifestArtifact, `${item.file} is missing from release-manifest.json`);
  assert.equal(manifestArtifact.sha256, item.digest, `${item.file} manifest checksum mismatch`);
  assert.equal(manifestArtifact.size, readFileSync(artifact).length, `${item.file} manifest size mismatch`);
}

console.log("\nrelease verification passed");
