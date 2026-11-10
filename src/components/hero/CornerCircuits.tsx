"use client";

import { useEffect, useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";

/**
 * Header ornaments from the reference, given a job:
 * left — an approval switch that flips on as work is approved;
 * right — an audit log whose lines tick as actions are recorded.
 */
export function CornerCircuits({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const knob = el.querySelector(".switch-knob");
    const track = el.querySelector(".switch-track");
    const logBars = el.querySelectorAll(".log-bar");

    const toggle = createTimeline({ loop: true, loopDelay: 2600, delay: 1800 })
      .add(knob!, { translateX: 30, duration: 520, ease: "inOutQuart" })
      .add(track!, { fill: ["#ffffff", "#ffe9df"], stroke: ["#d3d3da", "#f2541b"], duration: 400, ease: "outQuad" }, "<<")
      .add(knob!, { translateX: 0, duration: 520, ease: "inOutQuart", delay: 1800 })
      .add(track!, { fill: "#ffffff", stroke: "#d3d3da", duration: 400, ease: "outQuad" }, "<<");

    const log = animate(logBars, {
      fill: ["#d3d3da", "#f2541b", "#d3d3da"],
      duration: 700,
      delay: stagger(260, { start: 1200 }),
      loop: true,
      loopDelay: 3000,
      ease: "inOutSine",
    });

    return () => {
      toggle.revert();
      log.revert();
    };
  }, [active]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-intro="corners"
      // Spans the content column exactly (rail to rail). Each side's drawing has its
      // origin ON the rail, so nothing in it can drift onto a page line. The flat
      // wire runs (y = 86) land on the centre of the headline end lines.
      className="pointer-events-none absolute left-1/2 -z-[1] hidden h-[180px] w-[1192px] -translate-x-1/2 xl:block"
      style={{ top: "calc(var(--hl-size) * 0.52 - 86px)" }}
    >
      {/* left: rail → title end line */}
      <div className="title-margin absolute inset-y-0 left-0">
        <svg className="h-full w-full overflow-visible" fill="none">
          <Wires lowerStart={0} />
          {/* approval switch, inline on the lower wire */}
          <g transform="translate(30 116)">
            <rect className="switch-track" x="0" y="0" width="58" height="24" rx="12" fill="#fff" stroke="#d3d3da" strokeWidth="1.25" />
            <circle className="switch-knob" cx="14" cy="12" r="7.5" fill="#fff" stroke="#1d1d23" strokeWidth="1.25" />
          </g>
        </svg>
      </div>

      {/* right: the same wiring, mirrored */}
      <div className="title-margin absolute inset-y-0 right-0" style={{ transform: "scaleX(-1)" }}>
        <svg className="h-full w-full overflow-visible" fill="none">
          <Wires lowerStart={72} />
          {/* audit log, clear of the lower wire (which starts at x = 72) */}
          <g transform="translate(26 110)">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} className="log-bar" x="0" y={i * 9} width="28" height="4" rx="2" fill="#d3d3da" />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * Drawing origin (x = 0) is the page rail; x2="100%" is the headline end line.
 * The two upper wires come in from the page edge (negative x), cross the rail at
 * a junction node, bend once and run flat into the end line. The lower wire
 * starts at a node — on the rail when lowerStart is 0.
 */
function Wires({ lowerStart }: { lowerStart: number }) {
  return (
    <>
      <g stroke="#d6d6dc" strokeWidth="1.25" strokeLinejoin="round">
        <path d="M-1600 30H80L124 74" />
        <line x1="124" y1="74" x2="100%" y2="74" />
        <path d="M-1600 42H75L119 86" />
        <line x1="119" y1="86" x2="100%" y2="86" />
        <path d="M34 30V12" strokeLinecap="round" />
        <path d={`M${lowerStart} 128H140L170 98`} />
        <line x1="170" y1="98" x2="100%" y2="98" />
      </g>
      <g fill="#fff" stroke="#c9c9d1" strokeWidth="1.25">
        <circle cx="0" cy="30" r="3.5" /> {/* junction on the rail */}
        <circle cx="34" cy="10" r="4" />
        <circle cx="52" cy="42" r="3" />
        <circle cx={lowerStart} cy="128" r="4" />
      </g>
    </>
  );
}
