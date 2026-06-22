import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { gzipSync } from "node:zlib";

const root = new URL("..", import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const readiness = JSON.parse(readFileSync(join(root, "release-readiness.json"), "utf8"));
const dist = join(root, "dist");

const artifacts = [
  {
    name: `memento-mori-linux-waybar-${pkg.version}`,
    files: [
      "LICENSE",
      "README.md",
      "CHANGELOG.md",
      "release-readiness.json",
      "CONTRIBUTING.md",
      "PRIVACY.md",
      "SUPPORT.md",
      "SECURITY.md",
      "install.sh",
      "config/profile.example.json",
      "waybar/memento.py",
      "waybar/config.example.jsonc",
      "waybar/style.example.css",
      "docs/install.md",
      "docs/model.md",
      "docs/model-data.md",
      "docs/philosophy.md",
      "docs/support-matrix.md",
      "docs/release.md"
    ]
  },
  {
    name: `memento-mori-local-app-${pkg.version}`,
    files: [
      "LICENSE",
      "README.md",
      "CHANGELOG.md",
      "release-readiness.json",
      "CONTRIBUTING.md",
      "PRIVACY.md",
      "SUPPORT.md",
      "SECURITY.md",
      "package.json",
      "app/index.html",
      "app/main.js",
      "app/memento-core.js",
      "app/styles.css",
      "installers/macos/install.sh",
      "installers/macos/uninstall.sh",
      "installers/windows/install.ps1",
      "installers/windows/uninstall.ps1",
      "scripts/serve.mjs",
      "scripts/check-installers.mjs",
      "scripts/check-release-readiness.mjs",
      "scripts/check-version.mjs",
      "scripts/check-web.mjs",
      "scripts/release-notes.mjs",
      "scripts/test-waybar.mjs",
      "scripts/verify-release.mjs",
      "docs/install.md",
      "docs/model.md",
      "docs/model-data.md",
      "docs/philosophy.md",
      "docs/apple-platform-plan.md",
      "docs/commercial-model.md",
      "docs/stack-decisions.md",
      "docs/support-matrix.md",
      "docs/release.md"
    ]
  }
];

function writeOctal(buffer, value, offset, length) {
  const text = value.toString(8).padStart(length - 1, "0").slice(-(length - 1));
  buffer.write(`${text}\0`, offset, length, "ascii");
}

function tarHeader(name, size, mode) {
  const header = Buffer.alloc(512, 0);

  header.write(name, 0, 100, "utf8");
  writeOctal(header, mode, 100, 8);
  writeOctal(header, 0, 108, 8);
  writeOctal(header, 0, 116, 8);
  writeOctal(header, size, 124, 12);
  writeOctal(header, 0, 136, 12);
  header.fill(0x20, 148, 156);
  header.write("0", 156, 1, "ascii");
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  header.write("memento", 265, 32, "ascii");
  header.write("memento", 297, 32, "ascii");

  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  const checksumText = checksum.toString(8).padStart(6, "0");
  header.write(`${checksumText}\0 `, 148, 8, "ascii");

  return header;
}

function pad(buffer) {
  const remainder = buffer.length % 512;
  return remainder === 0 ? Buffer.alloc(0) : Buffer.alloc(512 - remainder, 0);
}

function modeFor(path) {
  return path.endsWith(".sh") || path.endsWith(".py") ? 0o755 : 0o644;
}

function createTarGz(artifact) {
  const chunks = [];

  for (const file of artifact.files) {
    const body = readFileSync(join(root, file));
    const archivePath = `${artifact.name}/${file}`;
    chunks.push(tarHeader(archivePath, body.length, modeFor(file)));
    chunks.push(body);
    chunks.push(pad(body));
  }

  chunks.push(Buffer.alloc(1024, 0));
  const archive = gzipSync(Buffer.concat(chunks), { mtime: 0 });
  const outputPath = join(dist, `${artifact.name}.tar.gz`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, archive);
  return outputPath;
}

rmSync(dist, { force: true, recursive: true });
mkdirSync(dist, { recursive: true });

const sums = artifacts.map((artifact) => {
  const outputPath = createTarGz(artifact);
  const bytes = readFileSync(outputPath);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const fileName = outputPath.slice(dist.length + 1);
  return {
    digest,
    fileName,
    size: bytes.length
  };
});

writeFileSync(
  join(dist, "SHA256SUMS"),
  `${sums.map((item) => `${item.digest}  ${item.fileName}`).join("\n")}\n`
);

writeFileSync(
  join(dist, "release-manifest.json"),
  `${JSON.stringify({
    name: pkg.name,
    version: pkg.version,
    release_gate: readiness.release_gate,
    build_epoch: "1970-01-01T00:00:00.000Z",
    artifacts: sums.map((item) => ({
      file: item.fileName,
      sha256: item.digest,
      size: item.size
    })),
    platforms: readiness.platforms,
    disclaimer: readiness.disclaimer
  }, null, 2)}\n`
);

for (const item of sums) {
  console.log(`${item.digest}  ${item.fileName}`);
}
