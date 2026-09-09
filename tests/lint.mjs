import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const allFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if ([".git", "node_modules", "dist", "__pycache__", ".pytest_cache", ".DS_Store"].includes(entry)) {
      continue;
    }
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else {
      allFiles.push(path);
    }
  }
}

// Binario si aparece un byte NUL en los primeros 8000 bytes: el mismo
// heurístico que usa git. Una lista de extensiones se queda corta en cuanto
// aparece un formato nuevo (.ico rompió esto una vez); comprobar el
// contenido en vez de la extensión no depende de mantener esa lista.
function isBinary(path) {
  const buffer = readFileSync(path);
  return buffer.subarray(0, 8000).includes(0);
}

walk(root);
for (const path of allFiles) {
  if (isBinary(path)) {
    continue;
  }
  const content = readFileSync(path, "utf8");
  const invalid = Array.from(content).find((character) => {
    const code = character.codePointAt(0);
    return code < 32 && ![9, 10, 13].includes(code);
  });
  assert.equal(invalid, undefined, `${path} contains an unexpected control character`);
}

const html = readFileSync(join(root, "app/index.html"), "utf8");
const main = readFileSync(join(root, "app/main.js"), "utf8");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

assert.match(html, /<html lang="en">/);
assert.match(html, /<title>Memento Mori · Your time in perspective<\/title>/);
assert.match(html, new RegExp(`styles\\.css\\?v=${pkg.version.replaceAll(".", "\\.")}`));
assert.match(html, new RegExp(`main\\.js\\?v=${pkg.version.replaceAll(".", "\\.")}`));
assert.equal((html.match(/<h1/g) || []).length, 1, "the page needs one h1");
// La web ya no es "texto sin arte": ahora enseña el mismo emblema que la
// barra de menús, para que se reconozca como el mismo producto. Lo que
// guardamos aquí no es "cero SVG" sino "solo ese glifo canónico" -la misma
// geometría que assets/skull.svg y skullImage() en Swift-, no una librería de
// iconos que se cuele con el tiempo.
const svgCount = (html.match(/<svg\b/gi) || []).length;
// Tres chips de vista previa (macOS/Windows/Waybar) + la marca del header +
// el emblema grande del orb + la marca pequeña del footer.
assert.equal(svgCount, 6, "expected exactly the six canonical skull glyphs, no other inline SVG");
const skullMarkers = (html.match(/cx="20\.8" cy="38" r="12"/g) || []).length;
assert.equal(skullMarkers, svgCount, "every inline <svg> must be the canonical skull glyph, not other artwork");
assert.doesNotMatch(`${html}\n${main}`, /component workbench|preview harness|teleprompter/i);
// El widget es el producto principal; la web es su demo online y usa
// deliberadamente el mismo modelo, factores de estilo de vida incluidos
// (ver docs/product-requirements.md). Ya no se prohíben aquí.
assert.match(html, /og\.png/);
assert.match(main, /PROFILE_STORAGE_KEY/);
assert.match(main, /INTENTION_STORAGE_KEY/);

console.log("lint checks passed");
