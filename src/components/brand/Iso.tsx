/**
 * Isometric line-art pictograms — the house style for small illustrations:
 * a heavy outer contour, hairline inner edges, white tops and two grey side
 * tones, and signal orange only on things that are live or approved.
 *
 * Every icon is built from real 3D solids and projected once at module load,
 * so they share one light direction, one line weight and one scale.
 * Contour trick: each solid is first painted with a thick stroke in the line
 * colour, then its faces are painted over it with a hairline stroke — only
 * the outer half of the thick stroke survives, as the silhouette.
 */

type V2 = readonly [number, number];
type V3 = readonly [number, number, number];
type Fill = "top" | "left" | "right" | "deep" | "signal" | "soft" | "out";
type Face = { d: string; fill: Fill };
type Line = { d: string; w?: number; tone?: "out" | "muted" | "signal"; fill?: Fill; dash?: boolean };
type Solid = { faces: Face[]; lines?: Line[] };
type Icon = { solids: Solid[]; dx: number; dy: number };

const FILL: Record<Fill, string> = {
  top: "#ffffff",
  left: "#f1f1f4",
  right: "#e1e1e7",
  deep: "#cdcdd5",
  signal: "var(--signal)",
  soft: "#ffd9c8",
  out: "#4d4d57",
};
const TONE = { out: "#4d4d57", muted: "#a6a6b0", signal: "var(--signal)" } as const;

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;
/** A circle of radius r in a horizontal plane projects to an axis-aligned ellipse. */
const EA = Math.SQRT2 * COS;
const EB = Math.SQRT2 * SIN;
const r2 = (n: number) => Math.round(n * 100) / 100;
const deg = (a: number) => (a * Math.PI) / 180;

/** Counter-clockwise in its own plane (x right, second axis up), so outward normals are (dy, −dx). */
function ccw(pts: readonly V2[]): V2[] {
  let area = 0;
  pts.forEach(([x, y], i) => {
    const [nx, ny] = pts[(i + 1) % pts.length];
    area += x * ny - nx * y;
  });
  return area < 0 ? [...pts].reverse() : [...pts];
}

/** Float ties (a wall facing exactly between two light directions) must resolve the same on server and client. */
const TIE = 1e-6;
const SMOOTH = Math.cos((40 * Math.PI) / 180);

/**
 * The walls of an extruded polygon that face the viewer, as runs: consecutive
 * edges that turn by less than 40° (a sampled curve) merge into one wall, so a
 * rounded corner reads as one surface and only real corners draw an edge.
 * Normals (u, v) are in the polygon's plane; the viewer sits toward +u +v.
 */
function wallRuns(P: readonly V2[]) {
  const edges = P.map((a, i) => {
    const c = P[(i + 1) % P.length];
    const u = c[1] - a[1];
    const v = -(c[0] - a[0]);
    const len = Math.hypot(u, v) || 1;
    return { a, c, u: u / len, v: v / len, vis: (u + v) / len > TIE };
  });
  const n = edges.length;
  // Smooth = a gentle turn that keeps the same light (a wall flips tone where u and v cross).
  const smooth = (e: (typeof edges)[number], f: (typeof edges)[number]) =>
    e.u * f.u + e.v * f.v > SMOOTH && e.u > e.v + TIE === f.u > f.v + TIE;
  // Start on a run's first edge so no run is split across the polygon's index 0.
  let start = edges.findIndex((e, i) => {
    const prev = edges[(i - 1 + n) % n];
    return e.vis && !(prev.vis && smooth(prev, e));
  });
  if (start < 0) start = 0;
  const runs: { pts: V2[]; u: number; v: number; k: number; last: (typeof edges)[number] }[] = [];
  let cur: (typeof runs)[number] | null = null;
  for (let j = 0; j < n; j++) {
    const e = edges[(start + j) % n];
    if (!e.vis) {
      cur = null;
      continue;
    }
    if (cur && smooth(cur.last, e)) {
      cur.pts.push(e.c);
      cur.u += e.u;
      cur.v += e.v;
      cur.last = e;
    } else {
      cur = { pts: [e.a, e.c], u: e.u, v: e.v, k: 0, last: e };
      runs.push(cur);
    }
  }
  // Painter's depth: further from the viewer = smaller u + v.
  runs.forEach((r) => {
    r.k = Math.round((r.pts.reduce((s, [a, b]) => s + a + b, 0) / r.pts.length) * 1e4) / 1e4;
  });
  return runs;
}

/** Points on a circle (or arc) in some plane, as 2D coordinates of that plane. */
export function ring(cx: number, cy: number, r: number, from = 0, to = 360, n = 40): V2[] {
  const out: V2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = deg(from + ((to - from) * i) / n);
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return to - from >= 360 ? out.slice(0, -1) : out;
}

/** Rounded rectangle (x0, y0 = lower-left) with an optional speech-bubble tail on the bottom edge. */
function rounded(x0: number, y0: number, w: number, h: number, r: number, tail?: "left" | "right"): V2[] {
  const corner = (cx: number, cy: number, a0: number) => ring(cx, cy, r, a0, a0 + 90, 4);
  const pts: V2[] = [];
  pts.push(...corner(x0 + w - r, y0 + r, -90));
  pts.push(...corner(x0 + w - r, y0 + h - r, 0));
  pts.push(...corner(x0 + r, y0 + h - r, 90));
  pts.push(...corner(x0 + r, y0 + r, 180));
  if (tail === "left") pts.push([x0 + r + 0.5, y0], [x0 + r - 1.5, y0 - 4.2], [x0 + r + 4.5, y0]);
  if (tail === "right") pts.push([x0 + w - r - 4.5, y0], [x0 + w - r + 1.5, y0 - 4.2], [x0 + w - r - 0.5, y0]);
  return pts;
}

/** Drawing kit bound to one icon: projection at scale s, plus bounds tracking for centring. */
function kit(s = 1) {
  const b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
  const see = (x: number, y: number) => {
    b.x0 = Math.min(b.x0, x);
    b.x1 = Math.max(b.x1, x);
    b.y0 = Math.min(b.y0, y);
    b.y1 = Math.max(b.y1, y);
  };
  const p = (x: number, y: number, z: number): V2 => [(x - y) * COS * s, ((x + y) * SIN - z) * s];
  const poly = (pts: readonly V3[], close = true) =>
    pts
      .map(([x, y, z], i) => {
        const [sx, sy] = p(x, y, z);
        see(sx, sy);
        return `${i ? "L" : "M"}${r2(sx)} ${r2(sy)}`;
      })
      .join("") + (close ? "Z" : "");

  /** Lines / shapes lying on the plane y = const (coordinates x, z) or z = const (x, y). */
  const onY = (y: number, pts: readonly V2[], close = false) => poly(pts.map(([x, z]) => [x, y, z] as V3), close);
  const onZ = (z: number, pts: readonly V2[], close = false) => poly(pts.map(([x, y]) => [x, y, z] as V3), close);

  const ellipse = (x: number, y: number, z: number, r: number) => {
    const [cx, cy] = p(x, y, z);
    const a = r * EA * s;
    const e = r * EB * s;
    see(cx - a, cy - e);
    see(cx + a, cy + e);
    return `M${r2(cx - a)} ${r2(cy)}A${r2(a)} ${r2(e)} 0 1 0 ${r2(cx + a)} ${r2(cy)}A${r2(a)} ${r2(e)} 0 1 0 ${r2(cx - a)} ${r2(cy)}Z`;
  };

  type BoxFills = Partial<Record<"top" | "left" | "right", Fill>>;
  const box = (x: number, y: number, z: number, w: number, d: number, h: number, f: BoxFills = {}): Face[] => {
    const X = x + w;
    const Y = y + d;
    const Z = z + h;
    return [
      { d: poly([[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]]), fill: f.right ?? "right" },
      { d: poly([[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]]), fill: f.left ?? "left" },
      { d: poly([[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]]), fill: f.top ?? "top" },
    ];
  };

  /** Upright cylinder: the front of its wall, then its lid. */
  const cyl = (x: number, y: number, z: number, r: number, h: number, f: { side?: Fill; top?: Fill } = {}): Face[] => {
    const [cx, cy0] = p(x, y, z);
    const cy1 = cy0 - h * s;
    const a = r * EA * s;
    const e = r * EB * s;
    see(cx - a, cy1 - e);
    see(cx + a, cy0 + e);
    const A = (x2: number, y2: number, sweep: 0 | 1) => `A${r2(a)} ${r2(e)} 0 0 ${sweep} ${r2(x2)} ${r2(y2)}`;
    const side =
      `M${r2(cx - a)} ${r2(cy1)}L${r2(cx - a)} ${r2(cy0)}${A(cx + a, cy0, 0)}` +
      `L${r2(cx + a)} ${r2(cy1)}${A(cx - a, cy1, 1)}Z`;
    return [
      { d: side, fill: f.side ?? "right" },
      { d: ellipse(x, y, z + h, r), fill: f.top ?? "top" },
    ];
  };

  /** A round through-hole seen from above: the far wall, with the ground showing through. */
  const hole = (x: number, y: number, z: number, r: number, depth: number): Face[] => {
    const [cx, cy] = p(x, y, z);
    const a = r * EA * s;
    const e = r * EB * s;
    const t = depth * s;
    const faces: Face[] = [{ d: ellipse(x, y, z, r), fill: "deep" }];
    if (t < 2 * e) {
      const yi = cy + t / 2;
      const xi = a * Math.sqrt(1 - (t / (2 * e)) ** 2);
      const A = `A${r2(a)} ${r2(e)} 0 0 1`;
      faces.push({ d: `M${r2(cx - xi)} ${r2(yi)}${A} ${r2(cx + xi)} ${r2(yi)}${A} ${r2(cx - xi)} ${r2(yi)}Z`, fill: "top" });
    }
    return faces;
  };

  /** Polygon (x, y) extruded upward from z by h. Visible walls back-to-front, then the lid. */
  const prismZ = (pts: readonly V2[], z: number, h: number, f: BoxFills = {}): Face[] => {
    const P = ccw(pts);
    const walls = wallRuns(P).map((run) => ({
      d: poly([...run.pts.map(([x, y]) => [x, y, z] as V3), ...[...run.pts].reverse().map(([x, y]) => [x, y, z + h] as V3)]),
      fill: run.u > run.v + TIE ? (f.right ?? "right") : (f.left ?? "left"),
      k: run.k,
    }));
    walls.sort((a, c) => a.k - c.k);
    return [...walls.map(({ d, fill }) => ({ d, fill })), { d: onZ(z + h, P, true), fill: f.top ?? "top" }];
  };

  /** Polygon (x, z) extruded along y from y to y + d. Visible walls back-to-front, then the front cap. */
  const prismY = (pts: readonly V2[], y: number, d: number, f: { cap?: Fill; side?: Fill; up?: Fill } = {}): Face[] => {
    const P = ccw(pts);
    const Y = y + d;
    const walls = wallRuns(P).map((run) => ({
      d: poly([...run.pts.map(([x, zz]) => [x, y, zz] as V3), ...[...run.pts].reverse().map(([x, zz]) => [x, Y, zz] as V3)]),
      fill: run.v + TIE >= run.u ? (f.up ?? "top") : (f.side ?? "right"),
      k: run.k,
    }));
    walls.sort((a, c) => a.k - c.k);
    return [...walls.map(({ d, fill }) => ({ d, fill })), { d: onY(Y, P, true), fill: f.cap ?? "left" }];
  };

  /** Centre the drawing in the 48 × 48 box. */
  const done = (solids: Solid[]): Icon => ({
    solids,
    dx: r2(24 - (b.x0 + b.x1) / 2),
    dy: r2(24 - (b.y0 + b.y1) / 2),
  });

  return { p, poly, onY, onZ, ellipse, box, cyl, hole, prismZ, prismY, done };
}

/* ------------------------------------------------------------------ */
/* The icons                                                           */
/* ------------------------------------------------------------------ */

/** Two speech bubbles — meetings and calls. */
function talk(): Icon {
  const k = kit(1.06);
  const back = rounded(-2, 12.5, 14, 10.5, 3.2, "right");
  const front = rounded(-12, 4.5, 16.5, 12.5, 3.6, "left");
  return k.done([
    {
      faces: k.prismY(back, -10, 3, { cap: "left" }),
      lines: [2, 5, 8].map((x) => ({ d: k.onY(-7, ring(x, 17.8, 0.75, 0, 360, 12), true), fill: "out" as Fill, w: 0.6 })),
    },
    {
      faces: k.prismY(front, -1.5, 3, { cap: "top" }),
      lines: [
        { d: k.onY(1.5, [[-8.5, 12.6], [0.8, 12.6]]), w: 0.9 },
        { d: k.onY(1.5, [[-8.5, 9], [-2.8, 9]]), w: 0.9 },
      ],
    },
  ]);
}

/** A stack of sheets: the quote on top, approved with an orange seal. */
function papers(): Icon {
  const k = kit(1.12);
  const sheet = (x: number, y: number, z: number) => k.box(x, y, z, 15, 19, 1.2);
  const z = 3.6;
  const wave: V2[] = Array.from({ length: 13 }, (_, i) => [-4 + i * 0.62, 5.2 + Math.sin(i * 1.3) * 0.9]);
  return k.done([
    { faces: sheet(-9.4, -8.2, 0) },
    { faces: sheet(-8.2, -10.2, 1.2) },
    {
      faces: sheet(-7.2, -9.2, 2.4),
      lines: [
        { d: k.onZ(z, [[-4, -6], [5, -6]]), w: 0.85 },
        { d: k.onZ(z, [[-4, -3.3], [5, -3.3]]), w: 0.85 },
        { d: k.onZ(z, [[-4, -0.6], [1.5, -0.6]]), w: 0.85 },
        { d: k.onZ(z, wave), w: 0.85 },
        { d: k.ellipse(4.6, 5.6, z, 2.1), fill: "signal", tone: "out", w: 0.9 },
      ],
    },
  ]);
}

/** A gear — the build. */
function gear(): Icon {
  const k = kit(1.02);
  const polar = (r: number, a: number): V2 => [r * Math.cos(deg(a)), r * Math.sin(deg(a))];
  const pts: V2[] = [];
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    pts.push(polar(11, a - 15), polar(14.6, a - 8.5), polar(14.6, a + 8.5), polar(11, a + 15), polar(11, a + 22.5));
  }
  return k.done([
    {
      faces: [...k.prismZ(pts, 0, 5), ...k.hole(0, 0, 5, 4.4, 5)],
      lines: [{ d: k.ellipse(0, 0, 5, 7.6), w: 0.7, tone: "muted" }],
    },
  ]);
}

/** Three layers, the top one pushed out of line — priorities shifting. */
function layers(): Icon {
  const k = kit(1.04);
  const plate = (x: number, y: number, z: number, top?: Fill) => k.box(x, y, z, 17, 17, 1.6, top ? { top } : {});
  const ghost: V2[] = [[-8.5, -8.5], [8.5, -8.5], [8.5, 8.5], [-8.5, 8.5]];
  return k.done([
    { faces: plate(-8.5, -8.5, 0) },
    { faces: plate(-8.5, -8.5, 6.6) },
    { faces: [], lines: [{ d: k.onZ(14.8, ghost, true), w: 0.8, tone: "muted", dash: true }] },
    { faces: plate(-8.5, -13.5, 13.2, "soft") },
  ]);
}

/** A bolt standing on a plate — the switch-on. */
function bolt(): Icon {
  const k = kit(1.04);
  const top = 2.4;
  const grid: Line[] = [];
  for (let i = 1; i < 4; i++) {
    const c = -11 + 5.5 * i;
    grid.push({ d: k.onZ(top, [[c, -11], [c, 11]]), w: 0.6, tone: "muted" });
    grid.push({ d: k.onZ(top, [[-11, c], [11, c]]), w: 0.6, tone: "muted" });
  }
  const shape: V2[] = [
    [0.6, 23],
    [6.2, 23],
    [2.4, 14.2],
    [7, 14.2],
    [-2.8, 0.4],
    [-0.6, 10.2],
    [-5.2, 10.2],
  ];
  return k.done([
    { faces: k.box(-11, -11, 0, 22, 22, top), lines: grid },
    { faces: k.prismY(shape.map(([x, z]) => [x, z + top] as V2), -1.6, 3.2, { cap: "top" }) },
  ]);
}

/** A meter cabinet with a live needle — running, monitored. */
function meter(): Icon {
  const k = kit(1.02);
  const y = 3;
  const cz = 11.2;
  const needle = ring(0, cz, 5.6, 64, 64, 1)[0];
  const ticks: Line[] = [];
  for (let i = 0; i <= 6; i++) {
    const a = 20 + (i * 140) / 6;
    const [o] = ring(0, cz, 6.6, a, a, 1);
    const [n] = ring(0, cz, 5.3, a, a, 1);
    ticks.push({ d: k.onY(y, [n, o]), w: 0.6 });
  }
  return k.done([
    {
      faces: k.box(-11, -3, 0, 22, 6, 23, { left: "top", top: "left" }),
      lines: [
        { d: k.onY(y, rounded(-8.4, 7.6, 16.8, 12.6, 2.2), true), w: 0.8 },
        { d: k.onY(y, ring(0, cz, 6.6, 20, 160, 24)), w: 0.8 },
        ...ticks,
        { d: k.onY(y, [[0, cz], needle]), w: 1.5, tone: "signal" },
        { d: k.onY(y, ring(0, cz, 0.9, 0, 360, 12), true), fill: "out", w: 0.5 },
        { d: k.onY(y, ring(-1.2, 3.8, 2.3, 0, 360, 24), true), fill: "left", w: 0.85 },
        { d: k.onY(y, [[-1.2, 3.8], [0.4, 5.4]]), w: 0.8 },
        { d: k.onY(y, ring(6.4, 3.8, 0.95, 0, 360, 12), true), fill: "signal", tone: "signal", w: 0.5 },
      ],
    },
  ]);
}

/** A stack of coins — what you pay. */
function coins(): Icon {
  const k = kit(1.04);
  const r = 10.5;
  const h = 2.8;
  return k.done([
    { faces: k.cyl(0.8, 0.4, 0, r, h) },
    { faces: k.cyl(-0.5, -0.7, h, r, h) },
    {
      faces: k.cyl(0.3, 0.1, h * 2, r, h),
      lines: [{ d: k.ellipse(0.3, 0.1, h * 3, 7.4), w: 0.8, tone: "muted" }],
    },
  ]);
}

/** A key — you keep it. */
function key(): Icon {
  const k = kit(1.12);
  const h = 2.8;
  return k.done([
    { faces: [...k.cyl(-8, 0, 0, 6.4, h), ...k.hole(-8, 0, h, 2.5, h)] },
    {
      // shaft and bit as one notched outline
      faces: k.prismZ(
        [
          [-1.9, -1.6],
          [13, -1.6],
          [13, 3.6],
          [10.6, 3.6],
          [10.6, 1.6],
          [9.4, 1.6],
          [9.4, 4.6],
          [6.8, 4.6],
          [6.8, 1.6],
          [-1.9, 1.6],
        ],
        0,
        h,
      ),
    },
  ]);
}

/** Key caps drawn with hairlines only, so a dozen small keys don't each carry the heavy contour. */
function caps(k: ReturnType<typeof kit>, keys: [number, number, number][], y0: number, z: number, d: number): Line[] {
  return keys.flatMap(([x, y, w]) =>
    k.box(x, y0 + y, z, w, d, 1.1).map((f) => ({ d: f.d, fill: f.fill, w: 0.65 })),
  );
}

/** A keyboard — typing it all in again by hand. */
function keyboard(): Icon {
  const k = kit(1.0);
  const top = 2.6;
  const keys: [number, number, number][] = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 5; col++) keys.push([-11.6 + col * 4.75, row * 4.3, 3.5]);
  keys.push([-6.85, 3 * 4.3, 13]);
  return k.done([
    { faces: k.box(-13, -9.6, 0, 26, 19.2, top), lines: caps(k, keys, -8.4, top, 3.1) },
  ]);
}

/** A bar chart on a sheet — reports and spreadsheets. */
function chart(): Icon {
  const k = kit(1.04);
  const bar = (x: number, h: number) => k.box(x, -3, 2, 4.6, 4.6, h);
  return k.done([
    {
      faces: k.box(-12, -9, 0, 24, 18, 2),
      lines: [
        { d: k.onZ(2, [[-10, 5], [10, 5]]), w: 0.6, tone: "muted" },
        { d: k.onZ(2, [[-10, 7.2], [3, 7.2]]), w: 0.6, tone: "muted" },
      ],
    },
    { faces: bar(-9.4, 6) },
    { faces: bar(-2.3, 11) },
    { faces: bar(4.8, 16) },
  ]);
}

/** Two envelopes — the inbox. */
function mail(): Icon {
  const k = kit(1.1);
  const env = (x: number, y: number, z: number) => k.box(x, y, z, 20, 13, 1.4);
  const z = 2.8;
  return k.done([
    { faces: env(-8.6, -5, 0) },
    {
      faces: env(-11, -7.6, 1.4),
      lines: [
        { d: k.onZ(z, [[-11, -7.6], [-1, -0.4], [9, -7.6]]), w: 0.9 },
      ],
    },
  ]);
}

/** A desk clock — the cost of an hour. */
function clock(): Icon {
  const k = kit(1.0);
  const R = 10.4;
  const cz = 12.4;
  const Y = 2;
  const ticks: Line[] = [];
  for (let i = 0; i < 12; i++) {
    const a = i * 30;
    const major = i % 3 === 0;
    const [o] = ring(0, cz, R - 1.7, a, a, 1);
    const [n] = ring(0, cz, R - (major ? 3.7 : 2.8), a, a, 1);
    ticks.push({ d: k.onY(Y, [n, o]), w: major ? 0.9 : 0.6 });
  }
  const [hour] = ring(0, cz, 4.4, 145, 145, 1);
  const [minute] = ring(0, cz, 6.6, 32, 32, 1);
  return k.done([
    { faces: k.box(-7, -4.5, 0, 14, 9, 2) },
    {
      faces: k.prismY(ring(0, cz, R, 0, 360, 48), -2, 4, { cap: "top" }),
      lines: [
        ...ticks,
        { d: k.onY(Y, [[0, cz], hour]), w: 1.3 },
        { d: k.onY(Y, [[0, cz], minute]), w: 1.1 },
        { d: k.onY(Y, ring(0, cz, 0.9, 0, 360, 12), true), fill: "out", w: 0.5 },
      ],
    },
  ]);
}

const ICONS = {
  keyboard: keyboard(),
  chart: chart(),
  mail: mail(),
  clock: clock(),
  talk: talk(),
  papers: papers(),
  gear: gear(),
  layers: layers(),
  bolt: bolt(),
  meter: meter(),
  coins: coins(),
  key: key(),
} satisfies Record<string, Icon>;

export type IsoName = keyof typeof ICONS;

export function IsoIcon({
  name,
  className,
  on,
}: {
  name: IsoName;
  className?: string;
  /** Exposed as data-on, for stacks of icons that cross-fade. */
  on?: boolean;
}) {
  const { solids, dx, dy } = ICONS[name];
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
      data-on={on === undefined ? undefined : on}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <g transform={`translate(${dx} ${dy})`}>
        {solids.map((s, i) => (
          <g key={i}>
            <g fill={FILL.out} stroke={FILL.out} strokeWidth={3}>
              {s.faces.map((f, j) => (
                <path key={j} d={f.d} />
              ))}
            </g>
            <g stroke={FILL.out} strokeWidth={0.9}>
              {s.faces.map((f, j) => (
                <path key={j} d={f.d} fill={FILL[f.fill]} />
              ))}
            </g>
            {s.lines?.map((l, j) => (
              <path
                key={j}
                d={l.d}
                fill={l.fill ? FILL[l.fill] : "none"}
                stroke={TONE[l.tone ?? "out"]}
                strokeWidth={l.w ?? 0.8}
                strokeDasharray={l.dash ? "1.6 1.8" : undefined}
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
