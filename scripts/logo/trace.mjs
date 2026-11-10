/*
 * Traces the AI Weavers logo (a flat PNG: light letters and a coral thread on
 * navy) into two SVG paths, so the site can colour each part itself.
 *
 *   node scripts/logo/trace.mjs scripts/logo/source.png src/components/brand/logo-paths.ts
 *
 * Every pixel is unmixed into ground, letter and thread (least squares on the
 * three sampled colours), so anti-aliased edges keep their sub-pixel position.
 * Each layer is then contoured at 50% with marching squares and simplified
 * with Ramer–Douglas–Peucker. The letters run on under the thread a little,
 * so the two never leave a seam where they meet.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const [src, out] = process.argv.slice(2);
if (!src || !out) throw new Error("usage: node trace.mjs <source.png> <out.ts>");

/* ---------------- PNG decode (8-bit RGB / RGBA, non-interlaced) ---------------- */
function decodePng(buf) {
  let p = 8;
  let w = 0, h = 0, type = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const kind = buf.toString("ascii", p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (kind === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0) throw new Error("need 8-bit, non-interlaced PNG");
      type = data[9];
    } else if (kind === "IDAT") idat.push(data);
    else if (kind === "IEND") break;
    p += 12 + len;
  }
  const bpp = type === 6 ? 4 : type === 2 ? 3 : 0;
  if (!bpp) throw new Error("need an RGB or RGBA PNG");
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? px[y * stride + i - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + i] : 0;
      const c = i >= bpp && y > 0 ? px[(y - 1) * stride + i - bpp] : 0;
      let v = row[i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const q = a + b - c;
        const pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[y * stride + i] = v & 255;
    }
  }
  return { w, h, bpp, px };
}

const { w: W, h: H, bpp, px } = decodePng(readFileSync(src));
const rgb = (i) => [px[i * bpp], px[i * bpp + 1], px[i * bpp + 2]];

/* ---------------- sample the three colours ---------------- */
function dominant(test) {
  const bins = new Map();
  for (let i = 0; i < W * H; i++) {
    const c = rgb(i);
    if (!test(c)) continue;
    const k = (c[0] >> 3) * 1024 + (c[1] >> 3) * 32 + (c[2] >> 3);
    const b = bins.get(k) ?? { n: 0, s: [0, 0, 0] };
    b.n++;
    b.s[0] += c[0]; b.s[1] += c[1]; b.s[2] += c[2];
    bins.set(k, b);
  }
  const best = [...bins.values()].sort((a, b) => b.n - a.n)[0];
  return best.s.map((v) => v / best.n);
}
const GROUND = dominant(() => true);
const LETTER = dominant(([r, g, b]) => r + g + b > 600);
const THREAD = dominant(([r, g, b]) => r - b > 90 && r - g > 70);
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
console.log("ground", hex(GROUND), "letter", hex(LETTER), "thread", hex(THREAD));

/* ---------------- unmix every pixel ---------------- */
const u = LETTER.map((v, k) => v - GROUND[k]);
const v = THREAD.map((x, k) => x - GROUND[k]);
const uu = u[0] * u[0] + u[1] * u[1] + u[2] * u[2];
const vv = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
const uv = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const det = uu * vv - uv * uv;
const letters = new Float32Array(W * H);
const thread = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const c = rgb(i);
  const d = [c[0] - GROUND[0], c[1] - GROUND[1], c[2] - GROUND[2]];
  const du = d[0] * u[0] + d[1] * u[1] + d[2] * u[2];
  const dv = d[0] * v[0] + d[1] * v[1] + d[2] * v[2];
  let b = (du * vv - dv * uv) / det;
  let t = (dv * uu - du * uv) / det;
  b = Math.min(1, Math.max(0, b));
  t = Math.min(1, Math.max(0, t));
  if (b + t > 1) {
    const s = b + t;
    b /= s;
    t /= s;
  }
  thread[i] = t;
  // the letter as it would be without the thread over it
  letters[i] = 1 - t > 0.2 ? Math.min(1, b / (1 - t)) : 0;
}

/*
 * Two anti-aliased edges that merely meet let the ground show through as a
 * hairline. So the letters run on a few pixels under the thread (only inside
 * it, and only from solid letter), where the thread covers them anyway.
 */
for (let pass = 0; pass < 3; pass++) {
  const prev = letters.slice();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (thread[i] <= 0.5) continue;
      let m = prev[i];
      if (x > 0) m = Math.max(m, prev[i - 1]);
      if (x < W - 1) m = Math.max(m, prev[i + 1]);
      if (y > 0) m = Math.max(m, prev[i - W]);
      if (y < H - 1) m = Math.max(m, prev[i + W]);
      letters[i] = m;
    }
  }
}

/* ---------------- marching squares ---------------- */
function contours(f, t = 0.5) {
  const val = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : f[y * W + x]);
  const at = new Map(); // edge key -> point
  const links = new Map(); // edge key -> [edge key, edge key]
  const point = (key, x0, y0, x1, y1) => {
    if (!at.has(key)) {
      const a = val(x0, y0), b = val(x1, y1);
      const s = a === b ? 0.5 : (t - a) / (b - a);
      at.set(key, [x0 + 0.5 + (x1 - x0) * s, y0 + 0.5 + (y1 - y0) * s]);
    }
    return key;
  };
  const link = (a, b) => {
    (links.get(a) ?? links.set(a, []).get(a)).push(b);
    (links.get(b) ?? links.set(b, []).get(b)).push(a);
  };
  for (let y = -1; y < H; y++) {
    for (let x = -1; x < W; x++) {
      const tl = val(x, y) > t, tr = val(x + 1, y) > t, br = val(x + 1, y + 1) > t, bl = val(x, y + 1) > t;
      const idx = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const T = () => point(`h${x},${y}`, x, y, x + 1, y);
      const R = () => point(`v${x + 1},${y}`, x + 1, y, x + 1, y + 1);
      const B = () => point(`h${x},${y + 1}`, x, y + 1, x + 1, y + 1);
      const L = () => point(`v${x},${y}`, x, y, x, y + 1);
      const centre = (val(x, y) + val(x + 1, y) + val(x + 1, y + 1) + val(x, y + 1)) / 4 > t;
      switch (idx) {
        case 1: case 14: link(L(), B()); break;
        case 2: case 13: link(B(), R()); break;
        case 3: case 12: link(L(), R()); break;
        case 4: case 11: link(T(), R()); break;
        case 6: case 9: link(T(), B()); break;
        case 7: case 8: link(L(), T()); break;
        case 5:
          if (centre) { link(L(), T()); link(B(), R()); } else { link(T(), R()); link(L(), B()); }
          break;
        case 10:
          if (centre) { link(T(), R()); link(L(), B()); } else { link(L(), T()); link(B(), R()); }
          break;
      }
    }
  }
  const loops = [];
  const seen = new Set();
  for (const start of links.keys()) {
    if (seen.has(start)) continue;
    const loop = [];
    let prev = null, cur = start;
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      loop.push(at.get(cur));
      const next = links.get(cur).find((k) => k !== prev && !seen.has(k));
      prev = cur;
      cur = next;
    }
    if (loop.length > 2) loops.push(loop);
  }
  return loops;
}

/* ---------------- Ramer–Douglas–Peucker ---------------- */
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  let max = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
    if (d > max) { max = d; at = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return [...rdp(pts.slice(0, at + 1), eps).slice(0, -1), ...rdp(pts.slice(at), eps)];
}
function simplifyLoop(loop, eps) {
  // split the ring at its two most distant points, simplify both halves
  let far = 0, best = 0;
  for (let i = 1; i < loop.length; i++) {
    const d = Math.hypot(loop[i][0] - loop[0][0], loop[i][1] - loop[0][1]);
    if (d > best) { best = d; far = i; }
  }
  const a = rdp(loop.slice(0, far + 1), eps);
  const b = rdp([...loop.slice(far), loop[0]], eps);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

/* ---------------- bounds, paths, output ---------------- */
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (letters[i] > 0.5 || thread[i] > 0.5) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1);
    }
  }
}
const n = (v) => +v.toFixed(1);
const path = (f, minArea) =>
  contours(f)
    .map((l) => simplifyLoop(l, 0.3))
    .filter((l) => {
      // drop specks: stray anti-aliasing islands
      let a = 0;
      for (let i = 0; i < l.length; i++) {
        const [px1, py1] = l[i], [px2, py2] = l[(i + 1) % l.length];
        a += px1 * py2 - px2 * py1;
      }
      return Math.abs(a / 2) > minArea;
    })
    .map((l) => "M" + l.map(([x, y]) => `${n(x - x0)} ${n(y - y0)}`).join("L") + "Z")
    .join("");

const lettersPath = path(letters, 12);
const threadPath = path(thread, 12);
const vw = x1 - x0, vh = y1 - y0;
writeFileSync(
  out,
  `/* Generated by scripts/logo/trace.mjs from scripts/logo/source.png — do not edit by hand. */

/** The logo's box, in source pixels (cropped to the ink). */
export const LOGO_VIEWBOX = "0 0 ${vw} ${vh}";
export const LOGO_ASPECT = ${vw} / ${vh};

/** "AI Weavers", the A's crossbar left out: the thread takes its place. Fill with evenodd. */
export const LOGO_LETTERS = "${lettersPath}";

/** The thread: the swoosh that crosses the A. */
export const LOGO_THREAD = "${threadPath}";

/** The source's own colours, for reference: ground ${hex(GROUND)}, letters ${hex(LETTER)}, thread ${hex(THREAD)}. */
`,
);
console.log(`viewBox 0 0 ${vw} ${vh}; letters ${lettersPath.length} chars, thread ${threadPath.length} chars`);
