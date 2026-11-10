"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { LOGO_ASPECT, LOGO_LETTERS, LOGO_THREAD, LOGO_VIEWBOX } from "./logo-paths";

/*
 * The logo set as a particle field: a grid of dots and squares, kept only
 * where they land inside the logo, lit by a slow squall of diagonal streaks.
 * The letters are white and grey; the thread that crosses the A is orange.
 * Ported from the particle-wordmark ("storm") effect to run in the page
 * itself: no iframe, the field sized to its box, paused while off screen,
 * and held still for reduced motion.
 */

type RGB = readonly [number, number, number];

/* The logo's own box (cropped to the ink), so it fills the field and stands on the bottom edge. */
const [, , VIEW_W, VIEW_H] = LOGO_VIEWBOX.split(" ").map(Number);

/*
 * The field. GAP and the particle sizes are tuned at FULL_WIDTH and shrink
 * with the box, down to MIN_GAP, so a phone still gets a few dots across
 * each stroke.
 */
const FULL_WIDTH = 1100;
const GAP = 6;
const MIN_GAP = 3;
const SIZE_SMALL = [1.4, 2.8] as const;
const SIZE_BIG = [3, 4.2] as const;
const BIG_CHANCE = 0.07;
const SQUARE_CHANCE = 1 / 3;
const GAMMA = 0.8; // eases the letters' anti-aliased edges in
const FLOOR = 0.3; // the letters' resting brightness; the squall lifts them from here
const PALETTE: readonly RGB[] = [
  [255, 255, 255],
  [228, 228, 234],
  [196, 196, 206],
];
/* The thread: signal orange, warm to deep, and lit a little higher so it reads as the logo's swoosh. */
const THREAD_PALETTE: readonly RGB[] = [
  [255, 122, 74],
  [242, 84, 27],
  [217, 64, 12],
];
const THREAD_FLOOR = 0.8; // orange reads darker than white at the same alpha
const SEED = 1337;

/* The squall: streaks falling down and across, under a slow travelling band of light. */
const FALL = { speed: 0.26, freq: 5, trail: 0.4, sway: 0.14, wind: 0.8 };
const SPEED = 2;
const STILL_AT = 3.2; // seconds into the squall, held for reduced motion
const TAU = Math.PI * 2;

type Particle = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  size: number;
  square: boolean;
  offset: number;
  mask: number;
  floor: number;
  rgb: string;
};

function squall(p: Particle, t: number) {
  const sway = FALL.sway * Math.sin(0.8 * t + p.offset * TAU + 4 * p.ny);
  const o = p.ny * FALL.freq - t * FALL.speed + p.offset * FALL.freq + sway + FALL.wind * p.nx;
  const s = o - Math.floor(o);
  const flake = s < FALL.trail ? 1 - s / FALL.trail : 0;
  const band = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(3 * p.nx - 0.5 * t), 2);
  return 0.14 + 0.86 * band * Math.pow(flake, 1.8);
}

function shade(palette: readonly RGB[], v: number): RGB {
  const e = Math.max(0, Math.min(1, v)) * (palette.length - 1);
  const i = Math.floor(e);
  const f = e - i;
  const a = palette[i];
  const b = palette[Math.min(palette.length - 1, i + 1)];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** A seeded generator, so the field is the same on every load. */
function lcg(seed: number) {
  let e = seed >>> 0;
  return () => {
    e = (Math.imul(1664525, e) + 0x3c6ef35f) >>> 0;
    return e / 0xffffffff;
  };
}

type ParticleWordmarkProps = HTMLAttributes<HTMLDivElement>;

export function ParticleWordmark({ className = "", style, ...rest }: ParticleWordmarkProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let t = STILL_AT;
    let raf = 0;
    let last = 0;
    let onScreen = false;

    const build = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // the logo as two coverage maps: the letters, then the thread that crosses the A
      const sheet = document.createElement("canvas");
      sheet.width = w;
      sheet.height = h;
      const g = sheet.getContext("2d", { willReadFrequently: true });
      if (!g) return;
      g.setTransform(w / VIEW_W, 0, 0, h / VIEW_H, 0, 0);
      g.fillStyle = "#fff";
      g.fill(new Path2D(LOGO_LETTERS), "evenodd");
      const letters = g.getImageData(0, 0, w, h).data;
      g.clearRect(0, 0, VIEW_W, VIEW_H);
      g.fill(new Path2D(LOGO_THREAD));
      const thread = g.getImageData(0, 0, w, h).data;

      const gap = Math.min(GAP, Math.max(MIN_GAP, (GAP * w) / FULL_WIDTH));
      const k = gap / GAP;
      const cols = Math.ceil(w / gap);
      const rows = Math.ceil(h / gap);
      const ox = (w - (cols - 1) * gap) / 2;
      const oy = (h - (rows - 1) * gap) / 2;
      const rand = lcg(SEED);
      particles = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // every cell rolls its dice, kept or not, so the field doesn't reshuffle when the logo does
          const square = rand() < SQUARE_CHANCE;
          const [lo, hi] = rand() < BIG_CHANCE ? SIZE_BIG : SIZE_SMALL;
          const size = (lo + rand() * (hi - lo)) * k;
          const offset = rand();
          const x = ox + col * gap;
          const y = oy + row * gap;
          const at = (Math.min(h - 1, Math.max(0, Math.round(y))) * w + Math.min(w - 1, Math.max(0, Math.round(x)))) * 4 + 3;
          const inLetters = letters[at] / 255;
          const inThread = thread[at] / 255;
          // the thread lies over the letters, as in the logo
          const onThread = inThread >= 0.5 || inThread > inLetters;
          const inside = onThread ? inThread : inLetters;
          if (inside < 0.02) continue;
          const [r, gr, b] = shade(onThread ? THREAD_PALETTE : PALETTE, 0.7 * offset);
          particles.push({
            x,
            y,
            nx: cols > 1 ? col / (cols - 1) : 0.5,
            ny: rows > 1 ? row / (rows - 1) : 0.5,
            size,
            square,
            offset,
            mask: Math.pow(inside, GAMMA),
            floor: onThread ? THREAD_FLOOR : FLOOR,
            rgb: `${Math.round(r)},${Math.round(gr)},${Math.round(b)}`,
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const s = t * SPEED;
      for (const p of particles) {
        const a = p.mask * (p.floor + (1 - p.floor) * squall(p, s));
        if (a < 0.005) continue;
        ctx.fillStyle = `rgba(${p.rgb},${a.toFixed(3)})`;
        const r = p.size / 2;
        if (p.square) ctx.fillRect(p.x - r, p.y - r, p.size, p.size);
        else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, TAU);
          ctx.fill();
        }
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (last) t += Math.min(0.1, (now - last) / 1000); // after a long gap (a hidden tab) it resumes, it doesn't jump
      last = now;
      draw();
      if (onScreen) raf = requestAnimationFrame(frame);
    };
    const play = () => {
      if (still || raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const refresh = () => {
      build();
      draw();
    };

    const resize = new ResizeObserver(refresh);
    resize.observe(host);
    const view = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) play();
        else pause();
      },
      { rootMargin: "120px" },
    );
    view.observe(host);

    return () => {
      resize.disconnect();
      view.disconnect();
      pause();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`relative w-full ${className}`}
      style={{ aspectRatio: LOGO_ASPECT, ...style }}
      {...rest}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
