"use client";

import { useEffect, useRef } from "react";
import { animate, createDrawable, stagger, utils, type JSAnimation } from "animejs";
import {
  BOARD,
  CHIP,
  DECOR_TRACES,
  PANEL_LEFT,
  PANEL_RIGHT,
  PARTS,
  PIN_YS,
  TILES,
  TRACES,
  VIAS,
  toPath,
  type Tile,
} from "./boardGeometry";
import { PACKET_EVENT, WeaveCore } from "./WeaveCore";

const SIGNAL = "#f2541b";
const LED_IDLE = "#d3d3da";

type CircuitBoardProps = {
  /** Flips to true when the intro timeline reveals the board. */
  active: boolean;
};

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

export function CircuitBoard({ active }: CircuitBoardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fireFromTile = useRef<(tileId: string) => void>(() => {});

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !active) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const q = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
    let disposed = false;
    let visible = true;
    let live = false;
    const tokens: Record<string, number> = {};
    const idle: Record<string, boolean> = {};
    const lastHover: Record<string, number> = {};
    const owned: JSAnimation[] = [];

    // 1 — the traces draw in from each tool to the core.
    const drawables = createDrawable(q<SVGPathElement>(".trace-base, .trace-decor"), 0, 0);
    owned.push(
      animate(drawables, {
        draw: ["0 0", "0 1"],
        duration: 1500,
        delay: stagger(28),
        ease: "inOutCubic",
        onComplete: () => {
          live = true;
          TRACES.forEach((t, i) => fire(t.id, 250 + i * 180));
        },
      }),
    );
    owned.push(
      animate(q(".board-fade"), {
        opacity: [0, 1],
        duration: 900,
        delay: stagger(18, { start: 300 }),
        ease: "outQuad",
      }),
    );

    // 2 — idle LEDs breathe.
    owned.push(
      animate(q(".led"), {
        opacity: [0.3, 1],
        duration: 1300,
        delay: stagger(240),
        loop: true,
        alternate: true,
        ease: "inOutSine",
      }),
    );

    // 3 — a packet travels a trace: tool LED → streak → pad flash → repeat.
    function fire(traceId: string, delay = utils.random(600, 4200)) {
      if (disposed) return;
      if (!visible) {
        idle[traceId] = true;
        return;
      }
      const trace = TRACES.find((t) => t.id === traceId);
      const streak = root!.querySelector<SVGPathElement>(`[data-streak="${traceId}"]`);
      const pad = root!.querySelector<SVGRectElement>(`[data-pad="${traceId}"]`);
      const tileLed = root!.querySelector<SVGCircleElement>(`[data-tile="${trace?.from}"] .tile-led`);
      if (!trace || !streak || !pad || !tileLed) return;

      const token = (tokens[traceId] = (tokens[traceId] ?? 0) + 1);
      idle[traceId] = false;

      animate(streak, {
        strokeDashoffset: [18, -104],
        duration: utils.random(1250, 1800),
        delay,
        ease: "inOutSine",
        // flash the tool's LED only when the packet actually leaves
        onBegin: () => {
          if (!disposed) animate(tileLed, { fill: [SIGNAL, LED_IDLE], duration: 1100, ease: "outQuad" });
        },
        onComplete: () => {
          if (disposed || token !== tokens[traceId]) return;
          animate(pad, { fill: [SIGNAL, "#ffffff"], duration: 900, ease: "outQuad" });
          window.dispatchEvent(new CustomEvent(PACKET_EVENT));
          fire(traceId);
        },
      });
    }

    fireFromTile.current = (tileId: string) => {
      if (!live || disposed) return;
      const now = performance.now();
      if (now - (lastHover[tileId] ?? 0) < 1400) return;
      lastHover[tileId] = now;
      TRACES.filter((t) => t.from === tileId).forEach((t, i) => fire(t.id, i * 140));
    };

    // Pause the packet loop while the board is off screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && live) {
        Object.keys(idle).forEach((id) => idle[id] && fire(id, utils.random(100, 1200)));
      }
    });
    io.observe(root);

    return () => {
      disposed = true;
      io.disconnect();
      owned.forEach((a) => a.revert());
      utils.remove(q(".streak, .pad, .tile-led, .led"));
      fireFromTile.current = () => {};
    };
  }, [active]);

  const { socket, body, die } = CHIP;

  return (
    <div ref={rootRef} className="relative w-full" style={{ aspectRatio: `${BOARD.w} / ${BOARD.h}` }}>
      <svg
        viewBox={`0 0 ${BOARD.w} ${BOARD.h}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
        fill="none"
      >
        <defs>
          <pattern id="pcb-dots" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.9" fill="#d6d6dc" />
          </pattern>
          <pattern id="die-dots" width="10" height="10" patternUnits="userSpaceOnUse" x="2" y="2">
            <circle cx="1" cy="1" r="0.75" fill="#dcdce2" />
          </pattern>
          <linearGradient id="panel-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4f4f6" />
            <stop offset="1" stopColor="#efeff2" />
          </linearGradient>
          <linearGradient id="die-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fdfdfd" />
            <stop offset="1" stopColor="#f3f3f5" />
          </linearGradient>
          <linearGradient id="socket-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3f3f5" />
            <stop offset="1" stopColor="#ebebee" />
          </linearGradient>
          <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#16161b" floodOpacity="0.06" />
            <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#16161b" floodOpacity="0.07" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Raised plates */}
        {[PANEL_LEFT, PANEL_RIGHT].map((pts, i) => (
          <g key={i}>
            <path d={`${toPath(pts)} Z`} fill="url(#panel-fill)" stroke="#e5e5ea" strokeWidth="1" />
            <path d={`${toPath(pts)} Z`} fill="url(#pcb-dots)" opacity="0.8" />
          </g>
        ))}

        {/* Decorative traces + vias */}
        <g stroke="#d7d7dd" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          {DECOR_TRACES.map((pts, i) => (
            <path key={i} className="trace-decor" d={toPath(pts)} />
          ))}
        </g>
        {VIAS.map(([x, y], i) => (
          <circle key={i} className="board-fade" cx={x} cy={y} r="3.5" fill="#fff" stroke="#cfcfd6" strokeWidth="1.25" />
        ))}

        {/* Components */}
        {PARTS.ics.map((c, i) => (
          <g key={`ic${i}`} className="board-fade">
            {Array.from({ length: 4 }).map((_, k) => (
              <g key={k} fill="#e1e1e6">
                <rect x={c.x + 6 + k * 9} y={c.y - 4} width="4" height="5" rx="1" />
                <rect x={c.x + 6 + k * 9} y={c.y + c.h - 1} width="4" height="5" rx="1" />
              </g>
            ))}
            <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="4" fill="#fff" stroke="#d3d3da" />
            <circle cx={c.x + 6} cy={c.y + 6} r="1.6" fill="#d3d3da" />
          </g>
        ))}
        {PARTS.smds.map((s, i) => (
          <g key={`smd${i}`} className="board-fade">
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="2" fill="#fff" stroke="#d3d3da" />
            {s.w > s.h ? (
              <>
                <rect x={s.x} y={s.y} width="4" height={s.h} rx="1.5" fill="#e3e3e8" />
                <rect x={s.x + s.w - 4} y={s.y} width="4" height={s.h} rx="1.5" fill="#e3e3e8" />
              </>
            ) : (
              <>
                <rect x={s.x} y={s.y} width={s.w} height="4" rx="1.5" fill="#e3e3e8" />
                <rect x={s.x} y={s.y + s.h - 4} width={s.w} height="4" rx="1.5" fill="#e3e3e8" />
              </>
            )}
          </g>
        ))}
        {PARTS.dots.map((d, i) => (
          <g key={`dots${i}`} className="board-fade" fill="#cdcdd4">
            {Array.from({ length: d.cols * d.rows }).map((_, k) => (
              <circle key={k} cx={d.x + (k % d.cols) * 8} cy={d.y + Math.floor(k / d.cols) * 8} r="1.6" />
            ))}
          </g>
        ))}

        {/* Signal traces: base hairline + orange streak that carries packets */}
        <g strokeLinecap="round" strokeLinejoin="round">
          {TRACES.map((t) => (
            <path key={t.id} className="trace-base" d={toPath(t.pts)} stroke="#c9c9d1" strokeWidth="1.6" />
          ))}
        </g>
        <g strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)">
          {TRACES.map((t) => (
            <path
              key={t.id}
              className="streak"
              data-streak={t.id}
              d={toPath(t.pts)}
              pathLength={100}
              stroke={SIGNAL}
              strokeWidth="2.4"
              strokeDasharray="16 200"
              strokeDashoffset="18"
            />
          ))}
        </g>

        {/* Stubs where traces leave a tile */}
        {TRACES.map((t) => {
          const [[x, y], [nx]] = t.pts;
          const vertical = nx === x;
          return vertical ? (
            <rect key={t.id} x={x - 6} y={y - 4} width="12" height="7" rx="2" fill="#fff" stroke="#c9c9d1" />
          ) : (
            <rect key={t.id} x={x - 4} y={y - 6} width="7" height="12" rx="2" fill="#fff" stroke="#c9c9d1" />
          );
        })}

        {/* ---------------- Chip ---------------- */}
        <rect x={socket.x} y={socket.y} width={socket.w} height={socket.h} rx={socket.r} fill="url(#socket-fill)" stroke="#e0e0e5" />
        {/* pin teeth */}
        <g fill="#dadae0">
          {Array.from({ length: 20 }).map((_, k) => {
            const x = 486 + k * 12;
            return (
              <g key={k}>
                <rect x={x} y={socket.y + 4} width="4" height="8" rx="1.2" />
                <rect x={x} y={socket.y + socket.h - 12} width="4" height="8" rx="1.2" />
              </g>
            );
          })}
          {Array.from({ length: 20 }).map((_, k) => {
            const y = 152 + k * 12;
            if (PIN_YS.some((p) => Math.abs(p - y - 2) < 9)) return null;
            return (
              <g key={k}>
                <rect x={socket.x + 4} y={y} width="8" height="4" rx="1.2" />
                <rect x={socket.x + socket.w - 12} y={y} width="8" height="4" rx="1.2" />
              </g>
            );
          })}
        </g>
        {/* landing pads */}
        {TRACES.map((t) => {
          const [x, y] = t.pts[t.pts.length - 1];
          const left = x < BOARD.w / 2;
          return (
            <rect
              key={t.id}
              className="pad"
              data-pad={t.id}
              x={left ? x - 1 : x - 13}
              y={y - 4}
              width="14"
              height="8"
              rx="2.5"
              fill="#fff"
              stroke="#b9b9c2"
            />
          );
        })}

        <rect x={body.x} y={body.y} width={body.w} height={body.h} rx={body.r} fill="#fff" stroke="#d3d3da" filter="url(#soft-shadow)" />
        <rect x={body.x + 7} y={body.y + 7} width={body.w - 14} height={body.h - 14} rx={body.r - 6} stroke="#efeff2" />
        <rect x={die.x} y={die.y} width={die.w} height={die.h} rx={die.r} fill="url(#die-fill)" stroke="#e2e2e7" />
        <rect x={die.x} y={die.y} width={die.w} height={die.h} rx={die.r} fill="url(#die-dots)" />

        {/* die modules */}
        {[
          [die.x + 12, die.y + 12],
          [die.x + die.w - 46, die.y + 12],
          [die.x + 12, die.y + die.h - 34],
          [die.x + die.w - 46, die.y + die.h - 34],
        ].map(([x, y], i) => (
          <g key={i} className="board-fade">
            <rect x={x} y={y} width="34" height="22" rx="5" fill="#fff" stroke="#dfdfe4" />
            {Array.from({ length: 6 }).map((_, k) => {
              const lit = (i === 0 && k === 4) || (i === 3 && k === 1);
              return (
                <rect
                  key={k}
                  className={lit ? "led" : undefined}
                  x={x + 7 + (k % 3) * 8}
                  y={y + 6 + Math.floor(k / 3) * 7}
                  width="4"
                  height="4"
                  rx="1"
                  fill={lit ? SIGNAL : "#dcdce2"}
                  filter={lit ? "url(#glow)" : undefined}
                />
              );
            })}
          </g>
        ))}

        {/* silkscreen */}
        <g fontFamily="var(--font-mono)" fontSize="6.5" fill="#a3a3ad" letterSpacing="0.04em">
          <text x={600} y={body.y + 15} textAnchor="middle">weave-core</text>
          <text x={600} y={die.y + 26} textAnchor="middle">log --every-action</text>
          <text x={600} y={die.y + die.h - 18} textAnchor="middle">approve --before-send</text>
        </g>

        {/* ---------------- Tiles ---------------- */}
        {TILES.map((tile) => (
          <BoardTile key={tile.id} tile={tile} onEnter={() => fireFromTile.current(tile.id)} />
        ))}

        {/* Board LEDs */}
        {PARTS.leds.map((l, i) => (
          <rect key={i} className="led" x={l.x} y={l.y} width="7" height="7" rx="1.8" fill={SIGNAL} filter="url(#glow)" />
        ))}
      </svg>

      {/* The woven core renders in WebGL over the die */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: pct(die.x - 24, BOARD.w),
          top: pct(die.y - 24, BOARD.h),
          width: pct(die.w + 48, BOARD.w),
          height: pct(die.h + 48, BOARD.h),
        }}
      >
        <WeaveCore active={active} />
      </div>
    </div>
  );
}

function BoardTile({ tile, onEnter }: { tile: Tile; onEnter: () => void }) {
  const { x, y, size, icon } = tile;
  const big = size > 80;
  const iconSize = big ? 38 : 24;
  const cx = x + size / 2;
  const cy = y + size / 2;
  return (
    <g className="board-tile" data-tile={tile.id} onPointerEnter={onEnter}>
      <title>{tile.label}</title>
      <rect x={x - 9} y={y - 9} width={size + 18} height={size + 18} rx={big ? 28 : 20} fill="#ececef" stroke="#e0e0e5" />
      <g className="tile-card">
        <rect x={x} y={y} width={size} height={size} rx={big ? 21 : 15} fill="#fff" stroke="#d3d3da" filter="url(#soft-shadow)" />
        <rect x={x + 6} y={y + 6} width={size - 12} height={size - 12} rx={big ? 16 : 10} stroke="#f0f0f3" />
        <path
          d={icon.path}
          fill="#1d1d23"
          transform={`translate(${cx - iconSize / 2} ${cy - iconSize / 2}) scale(${iconSize / 24})`}
        />
        <circle className="tile-led" cx={x + size - (big ? 15 : 11)} cy={y + (big ? 15 : 11)} r={big ? 3 : 2.4} fill={LED_IDLE} />
      </g>
    </g>
  );
}

