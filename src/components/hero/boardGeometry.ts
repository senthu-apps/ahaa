import {
  siGmail,
  siGooglecalendar,
  siGooglesheets,
  siHubspot,
  siQuickbooks,
  siXero,
  type SimpleIcon,
} from "simple-icons";

/**
 * Circuit board geometry, in SVG user units.
 * The board is drawn on the left and mirrored to the right so the
 * composition stays balanced around the central chip.
 */
export const BOARD = { w: 1200, h: 560 } as const;

export const CHIP = {
  socket: { x: 436, y: 106, w: 328, h: 328, r: 40 },
  body: { x: 450, y: 120, w: 300, h: 300, r: 30 },
  die: { x: 472, y: 142, w: 256, h: 256, r: 20 },
} as const;

/** Pin rows where traces land on the chip socket (left side; mirrored right). */
export const PIN_YS = [234, 258, 282, 306] as const;

export type Pt = readonly [number, number];

export const mirrorX = (x: number) => BOARD.w - x;
export const mirrorPts = (pts: readonly Pt[]): Pt[] => pts.map(([x, y]) => [mirrorX(x), y] as const);
export const toPath = (pts: readonly Pt[]) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");

export type Tile = {
  id: string;
  label: string;
  icon: SimpleIcon;
  x: number;
  y: number;
  size: number;
};

export type Trace = {
  id: string;
  /** Tile the trace starts from. */
  from: string;
  pts: Pt[];
};

const leftTiles: Tile[] = [
  { id: "gmail", label: "Gmail", icon: siGmail, x: 190, y: 40, size: 108 },
  { id: "sheets", label: "Google Sheets", icon: siGooglesheets, x: 92, y: 226, size: 64 },
  { id: "quickbooks", label: "QuickBooks", icon: siQuickbooks, x: 150, y: 360, size: 108 },
];

const rightIcons: Record<string, { id: string; label: string; icon: SimpleIcon }> = {
  gmail: { id: "hubspot", label: "HubSpot", icon: siHubspot },
  sheets: { id: "calendar", label: "Google Calendar", icon: siGooglecalendar },
  quickbooks: { id: "xero", label: "Xero", icon: siXero },
};

export const TILES: Tile[] = [
  ...leftTiles,
  ...leftTiles.map((t) => ({
    ...t,
    ...rightIcons[t.id],
    x: mirrorX(t.x + t.size),
  })),
];

const leftTraces: Trace[] = [
  { id: "t1", from: "gmail", pts: [[298, 94], [336, 94], [376, 134], [376, 204], [406, 234], [436, 234]] },
  { id: "t2", from: "sheets", pts: [[156, 258], [436, 258]] },
  { id: "t3", from: "quickbooks", pts: [[204, 360], [204, 330], [232, 302], [330, 302], [350, 282], [436, 282]] },
  { id: "t4", from: "quickbooks", pts: [[258, 414], [330, 414], [380, 364], [380, 336], [410, 306], [436, 306]] },
];

export const TRACES: Trace[] = [
  ...leftTraces,
  ...leftTraces.map((t) => ({
    id: `${t.id}r`,
    from: rightIcons[t.from].id,
    pts: mirrorPts(t.pts),
  })),
];

/** Decorative traces — structure only, never carry signal. */
const leftDecor: Pt[][] = [
  [[18, 150], [110, 150], [140, 180]],
  [[18, 330], [70, 330], [96, 356], [96, 470]],
  [[190, 94], [128, 94], [104, 70], [36, 70]],
  [[204, 468], [204, 500], [230, 526], [330, 526]],
  [[478, 106], [478, 72], [454, 48], [384, 48]],
  [[560, 106], [560, 36]],
  [[520, 434], [520, 478], [548, 506], [572, 506]],
  [[436, 382], [404, 382], [382, 404], [382, 470], [352, 500], [262, 500]],
  [[436, 160], [420, 160], [404, 144], [404, 96]],
];

export const DECOR_TRACES: Pt[][] = [
  ...leftDecor,
  ...leftDecor.map(mirrorPts),
  [[600, 434], [600, 536]],
];

/** Vias = open circles at the free ends of decorative traces. */
export const VIAS: Pt[] = DECOR_TRACES.map((pts) => pts[pts.length - 1]);

const leftParts = {
  ics: [{ x: 262, y: 186, w: 40, h: 26 }],
  smds: [
    { x: 292, y: 446, w: 18, h: 8 },
    { x: 318, y: 446, w: 18, h: 8 },
    { x: 404, y: 420, w: 8, h: 18 },
    { x: 30, y: 196, w: 18, h: 8 },
  ],
  dots: [
    { x: 30, y: 236, cols: 3, rows: 4 },
    { x: 392, y: 182, cols: 3, rows: 3 },
    { x: 246, y: 230, cols: 4, rows: 2 },
  ],
  leds: [
    { x: 322, y: 226 },
    { x: 56, y: 402 },
    { x: 452, y: 462 },
  ],
};

const mirrorRect = <T extends { x: number; w: number }>(r: T): T => ({ ...r, x: mirrorX(r.x + r.w) });

export const PARTS = {
  ics: [...leftParts.ics, ...leftParts.ics.map(mirrorRect)],
  smds: [...leftParts.smds, ...leftParts.smds.map(mirrorRect)],
  dots: [
    ...leftParts.dots,
    ...leftParts.dots.map((d) => ({ ...d, x: mirrorX(d.x + (d.cols - 1) * 8) })),
  ],
  leds: [...leftParts.leds, ...leftParts.leds.map((l) => ({ x: mirrorX(l.x + 7), y: l.y }))],
};

/** Raised plate behind each tile group (left; mirrored right). */
export const PANEL_LEFT: Pt[] = [
  [70, 18], [330, 18], [356, 44], [356, 196], [330, 222], [202, 222], [178, 246],
  [178, 330], [202, 354], [300, 354], [326, 380], [326, 500], [300, 526], [70, 526],
  [44, 500], [44, 44],
];
export const PANEL_RIGHT: Pt[] = mirrorPts(PANEL_LEFT);
