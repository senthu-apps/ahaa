// Writes the site's wordmark (logo-paths.ts: letters + signal thread) as an SVG file, the source for
// public/brand/logo-email*.png. Letters are ink by default; pass "white" for the version on dark.
// Run: node --experimental-strip-types scripts/logo/wordmark-svg.mjs [white]
import { writeFileSync } from "node:fs";
import { LOGO_LETTERS, LOGO_THREAD, LOGO_VIEWBOX } from "../../src/components/brand/logo-paths.ts";
const white = process.argv[2] === "white";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}"><path d="${LOGO_LETTERS}" fill="${white ? "#ffffff" : "#16161b"}" fill-rule="evenodd"/><path d="${LOGO_THREAD}" fill="#f2541b"/></svg>`;
const out = white ? "scripts/logo/wordmark-white.svg" : "scripts/logo/wordmark.svg";
writeFileSync(out, svg);
console.log(out, LOGO_VIEWBOX, svg.length, "bytes");
