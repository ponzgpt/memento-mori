import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../app", import.meta.url)));
const port = Number.parseInt(process.env.PORT || process.argv[2] || "4173", 10);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
    "content-type": type
  });
  res.end(body);
}

function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const relative = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const target = resolve(root, normalize(relative));

  if (!target.startsWith(root)) {
    return null;
  }

  return target;
}

const server = createServer((req, res) => {
  if (!req.url || !["GET", "HEAD"].includes(req.method || "")) {
    send(res, 405, "Method not allowed\n");
    return;
  }

  if (req.url.startsWith("/__health")) {
    send(res, 200, "ok\n");
    return;
  }

  const target = resolvePath(req.url);

  if (!target || !existsSync(target) || !statSync(target).isFile()) {
    send(res, 404, "Not found\n");
    return;
  }

  const type = types[extname(target)] || "application/octet-stream";
  const size = statSync(target).size;
  res.writeHead(200, {
    "cache-control": "no-store",
    "content-length": size,
    "content-type": type
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(target)
    .on("error", () => send(res, 500, "Read error\n"))
    .pipe(res);
});

server.on("error", (error) => {
  console.error(`preview server failed: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Memento Mori preview: http://127.0.0.1:${port}/`);
});
