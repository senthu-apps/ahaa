"use client";

import { Fragment, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IsoIcon } from "@/components/brand/Iso";
import { LogoMark } from "@/components/brand/LogoMark";
import { Stitch } from "@/components/brand/Stitch";
import { Cross, Rule } from "@/components/site/Rails";
import { COMPARE, LANES, PHASES, WEEKS, segmentsOf, weeksLive } from "./race";

const SEGMENTS = LANES.map(segmentsOf);
const WEEK_LIST = Array.from({ length: WEEKS }, (_, i) => i + 1);
const PLAY_SECONDS = 7;
/** Lane names | the twelve weeks. The table below shares the first column so the two line up. */
const BOARD_COLS = "lg:grid-cols-[17rem_minmax(0,1fr)]";
const TABLE_COLS = "lg:grid-cols-[17rem_minmax(0,1fr)_minmax(0,1fr)]";
const pct = (weeks: number) => `${(weeks / WEEKS) * 100}%`;
const clampWeek = (n: number) => Math.min(WEEKS, Math.max(1, n));

type Api = { goTo: (week: number) => void; scrub: (fraction: number) => void; toggle: () => void };

function PlayGlyph({ state }: { state: "play" | "pause" | "replay" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {state === "play" && <path d="M4.5 3.2v9.6L12.6 8 4.5 3.2Z" fill="currentColor" />}
      {state === "pause" && <path d="M5 3.5v9M11 3.5v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />}
      {state === "replay" && (
        <path
          d="M2.8 8a5.2 5.2 0 1 0 1.6-3.8M2.6 2.2v3h3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function Mark({ yes }: { yes: boolean }) {
  return yes ? (
    <span aria-hidden className="mt-px grid size-[20px] shrink-0 place-items-center rounded-full bg-ink">
      <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
        <path d="M3 7.4 5.8 10 11 4.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ) : (
    <span aria-hidden className="mt-px grid size-[20px] shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line-strong)]">
      <span className="h-[1.5px] w-[8px] rounded-full bg-muted" />
    </span>
  );
}

export function HourlyVsFixed() {
  const root = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const api = useRef<Api>({ goTo: () => {}, scrub: () => {}, toggle: () => {} });
  const shown = useRef(WEEKS);
  const dragging = useRef(false);
  const rolled = useRef(false);
  const [week, setWeek] = useState(WEEKS);
  const [playing, setPlaying] = useState(false);
  const [still, setStill] = useState(false);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const board = el.querySelector<HTMLElement>("[data-race-board]")!;
      const reduced = prefersReducedMotion();
      const st = { p: 1 };
      let play: gsap.core.Tween | null = null;
      let touched = false;

      /** Bars, knob and cursors follow --race-p; captions and counts follow the week. */
      const paint = () => board.style.setProperty("--race-p", st.p.toFixed(4));
      const show = (w: number) => {
        if (w === shown.current) return;
        shown.current = w;
        setWeek(w);
      };
      const follow = () => {
        paint();
        show(clampWeek(Math.ceil(st.p * WEEKS - 1e-4)));
      };
      const stop = () => {
        play?.kill();
        play = null;
      };
      const run = (from: number) => {
        stop();
        st.p = from;
        follow();
        setPlaying(true);
        play = gsap.to(st, {
          p: 1,
          duration: PLAY_SECONDS * (1 - from),
          ease: "none",
          onUpdate: follow,
          onComplete: () => {
            play = null;
            setPlaying(false);
          },
        });
      };

      api.current.goTo = contextSafe!((target: number) => {
        touched = true;
        const w = clampWeek(target);
        if (play) {
          stop();
          setPlaying(false);
        }
        show(w);
        gsap.to(st, { p: w / WEEKS, duration: reduced ? 0 : 0.45, ease: "weave", overwrite: true, onUpdate: paint });
      });
      api.current.scrub = (f: number) => {
        const w = clampWeek(Math.ceil(f * WEEKS));
        if (w !== shown.current || play) api.current.goTo(w);
      };
      api.current.toggle = contextSafe!(() => {
        touched = true;
        if (play) {
          stop();
          setPlaying(false);
          return;
        }
        run(st.p >= 1 - 1e-3 ? 0 : st.p);
      });

      if (reduced) {
        // No playback: the board shows the whole quarter and the slider jumps.
        setStill(true);
        return () => {
          api.current = { goTo: () => {}, scrub: () => {}, toggle: () => {} };
        };
      }

      // Empty board until it scrolls into view, then the quarter plays once.
      st.p = 0;
      follow();
      ScrollTrigger.create({
        trigger: board,
        start: "top 72%",
        once: true,
        onEnter: () => void gsap.delayedCall(0.35, () => void (!touched && run(0))),
      });

      // ---- header: rises in, the eyebrow stitch is sewn (house beat)
      const owned: JSAnimation[] = [];
      const eyebrowThread = createDrawable(el.querySelectorAll<SVGPathElement>(".cmp-eyebrow .stitch-thread"), 0, 0);
      gsap.from(gsap.utils.toArray("[data-cmp-head]", el), {
        autoAlpha: 0,
        y: 18,
        duration: 1,
        ease: "weave",
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          once: true,
          onEnter: () =>
            void owned.push(animate(eyebrowThread, { draw: ["0 0", "0 1"], duration: 900, delay: 250, ease: "inOutCubic" })),
        },
      });

      return () => {
        owned.forEach((a) => a.revert());
        api.current = { goTo: () => {}, scrub: () => {}, toggle: () => {} };
      };
    },
    { scope: root },
  );

  // The week number rolls up as it changes.
  useEffect(() => {
    const n = numRef.current;
    if (!rolled.current) {
      rolled.current = true;
      return;
    }
    if (!n || prefersReducedMotion()) return;
    n.getAnimations().forEach((a) => a.cancel());
    n.animate(
      [
        { transform: "translateY(55%)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 380, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }, [week]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 4, PageDown: -4 };
    let next: number | null = null;
    if (e.key in step) next = week + step[e.key];
    else if (e.key === "Home") next = 1;
    else if (e.key === "End") next = WEEKS;
    if (next === null) return;
    e.preventDefault();
    api.current.goTo(next);
  };

  // Drag (or tap) anywhere along the ruler or either lane to move through the weeks.
  const fraction = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  };
  const scrub = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      api.current.scrub(fraction(e));
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (dragging.current) api.current.scrub(fraction(e));
    },
    onPointerUp: () => void (dragging.current = false),
    onPointerCancel: () => void (dragging.current = false),
  };

  const atEnd = week === WEEKS && !playing;
  const control = playing ? "pause" : atEnd ? "replay" : "play";
  const valueText = `Week ${week} of ${WEEKS}. ${LANES.map((l) => `${l.name}: ${l.weeks[week - 1].text}.`).join(" ")}`;

  return (
    <section
      ref={root}
      id="compare"
      aria-labelledby="compare-title"
      className="relative overflow-x-clip pt-24 last:pb-24 md:pt-32 md:last:pb-32"
    >
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-cmp-head className="cmp-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            Hourly or fixed price
          </p>
          <div>
            <h2
              data-cmp-head
              id="compare-title"
              className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              <span className="text-[#72727d]">Same project.</span> <span className="text-ink">Two ways to pay for it.</span>
            </h2>
            <p data-cmp-head className="mt-5 max-w-[58ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              An hourly dev shop bills for every week of deciding. With AI Weavers you know the price before work starts, and a
              retainer keeps it running after launch. Drag through an example first quarter.
            </p>
          </div>
        </header>

        {/* ---------------- The race board ---------------- */}
        <Rule className="relative mt-12 md:mt-16" />
        <div data-race-board className={`race-board relative grid bg-white/40 md:border-x md:border-rail ${BOARD_COLS}`}>
          {/* Week counter + playback */}
          <div className="col-span-full flex items-center justify-between gap-4 px-5 py-5 md:px-8 lg:px-10 lg:py-6">
            <p
              aria-hidden
              className="flex items-baseline gap-[0.3em] text-[clamp(1.625rem,2.8vw,2.25rem)] font-semibold leading-none tracking-[-0.045em] text-ink"
            >
              <span>Week</span>
              <span className="-my-[0.1em] overflow-hidden py-[0.1em]">
                <span ref={numRef} className="block tabular-nums">
                  {week}
                </span>
              </span>
              <span className="text-[#72727d]">of {WEEKS}</span>
            </p>
            {!still && (
              <button
                type="button"
                onClick={() => api.current.toggle()}
                className="btn btn-ghost h-10 shrink-0 gap-2 pl-3.5 pr-4 text-[0.875rem]"
              >
                <PlayGlyph state={control} />
                {control === "pause" ? "Pause" : control === "replay" ? "Replay" : "Play"}
              </button>
            )}
          </div>

          {/* Ruler: months, weeks and the slider knob */}
          <div className="hidden border-t border-rail px-10 pb-5 lg:flex lg:flex-col lg:justify-end">
            <p className="text-[0.875rem] font-medium text-ink">Example first quarter</p>
            <p className="mt-1 text-[0.8125rem] leading-snug text-muted">Drag the timeline or use the arrow keys</p>
          </div>
          <div className="relative border-t border-rail px-5 pt-4 md:px-8 lg:border-l lg:px-10">
            <Cross className="absolute left-0 top-0 z-[3] hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
            <div
              role="slider"
              tabIndex={0}
              aria-label="Week of the example quarter"
              aria-valuemin={1}
              aria-valuemax={WEEKS}
              aria-valuenow={week}
              aria-valuetext={valueText}
              onKeyDown={onKeyDown}
              {...scrub}
              className="relative h-[78px] cursor-ew-resize touch-pan-y select-none rounded-[10px]"
            >
              <div className="grid grid-cols-3 text-[0.75rem] font-medium leading-none text-muted">
                {[1, 2, 3].map((m) => (
                  <span key={m} className="border-l border-line-strong pl-2">
                    Month {m}
                  </span>
                ))}
              </div>
              <div className="mt-3.5 grid grid-cols-12 text-center text-[0.8125rem] leading-none tabular-nums">
                {WEEK_LIST.map((i) => (
                  <span key={i} data-s={i < week ? "past" : i === week ? "now" : "next"} className="race-wk">
                    {i}
                  </span>
                ))}
              </div>
              <div aria-hidden className="absolute inset-x-0 bottom-[20px] h-[2px] translate-y-1/2 rounded-full bg-line-strong">
                <div className="race-fill absolute inset-0 rounded-full bg-ink" />
              </div>
              {Array.from({ length: WEEKS + 1 }, (_, k) => (
                <span
                  key={k}
                  aria-hidden
                  className={`absolute bottom-[20px] w-px -translate-x-1/2 translate-y-1/2 bg-line-strong ${k % 4 === 0 ? "h-[11px]" : "h-[6px]"}`}
                  style={{ left: pct(k) }}
                />
              ))}
              <span
                aria-hidden
                className="race-knob absolute bottom-[20px] size-[16px] -translate-x-1/2 translate-y-1/2 rounded-full bg-surface shadow-[0_0_0_1.5px_var(--ink),0_2px_8px_-1px_rgb(22_22_27/0.28)]"
              />
            </div>
          </div>

          {/* The two lanes */}
          {LANES.map((lane, li) => {
            const now = lane.weeks[week - 1];
            const last = li === LANES.length - 1;
            return (
              <Fragment key={lane.key}>
                <div className="border-t border-rail px-5 pb-4 pt-6 md:px-8 lg:px-10 lg:py-7">
                  <div className="flex items-center gap-4">
                    <span className="relative grid size-[60px] shrink-0 place-items-center rounded-[16px] bg-surface shadow-[0_0_0_1px_var(--line-strong),0_10px_20px_-16px_rgb(22_22_27/0.4)]">
                      {PHASES.map((ph) => (
                        <IsoIcon key={ph.key} name={ph.icon} on={ph.key === now.phase} className="race-icon absolute size-[50px]" />
                      ))}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[1.0625rem] font-semibold leading-tight tracking-[-0.02em] text-ink">{lane.name}</h3>
                      <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[0.8125rem] text-graphite">
                        <div className="flex gap-1.5">
                          <dt>Shipped</dt>
                          <dd className="font-semibold tabular-nums text-ink">{week >= lane.shipsAt ? 1 : 0}</dd>
                        </div>
                        <div className="flex gap-1.5">
                          <dt>Weeks live</dt>
                          <dd className="font-semibold tabular-nums text-ink">{weeksLive(lane, week)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="relative flex flex-col justify-center px-5 pb-6 md:px-8 lg:border-l lg:border-t lg:border-rail lg:px-10 lg:py-7">
                  {last && <Cross className="absolute bottom-0 left-0 z-[3] hidden -translate-x-1/2 translate-y-1/2 lg:block" />}
                  <div {...scrub} className="relative h-[34px] cursor-ew-resize touch-pan-y select-none md:h-[46px]">
                    <div aria-hidden className="absolute inset-0 grid grid-cols-12">
                      {WEEK_LIST.map((i) => (
                        <span key={i} className="race-slot" />
                      ))}
                    </div>
                    <div aria-hidden className="race-reveal absolute inset-0 grid grid-cols-12">
                      {SEGMENTS[li].map((s) => (
                        <span key={s.start} className={`race-seg ph-${s.phase}`} style={{ gridColumn: `${s.start} / span ${s.span}` }}>
                          {s.label && <span className="race-seg-label hidden truncate lg:block">{s.label}</span>}
                        </span>
                      ))}
                      {lane.pins.map((p) => (
                        <span key={p} className="race-pin" style={{ left: pct(p - 0.5) }} />
                      ))}
                    </div>
                    <span aria-hidden className="race-cursor" />
                  </div>
                  <p className="mt-3.5 min-h-[3em] text-pretty text-[0.9375rem] leading-[1.5] text-graphite lg:min-h-0">
                    <b className="font-semibold text-ink">Week {week}:</b> {now.text}.
                  </p>
                </div>
              </Fragment>
            );
          })}

          {/* Legend */}
          <div className="col-span-full border-t border-rail px-5 py-6 md:px-8 lg:px-10">
            <ul aria-label="Legend" className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 xl:grid-cols-6">
              {PHASES.map((ph) => (
                <li key={ph.key} className="flex items-center gap-3">
                  <IsoIcon name={ph.icon} className="size-11 shrink-0" />
                  <span className="min-w-0">
                    <span aria-hidden className={`ph-${ph.key} block h-[9px] w-7 rounded-[4px]`} />
                    <span className="mt-1.5 block text-[0.8125rem] font-medium leading-tight text-graphite">{ph.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Rule className="relative" />

        {/* ---------------- Side by side ---------------- */}
        <Rule className="relative mt-12 md:mt-16" />
        <div role="table" aria-label="Hourly billing compared with AI Weavers fixed pricing" className="md:border-x md:border-rail">
          <div role="row" className={`hidden lg:grid ${TABLE_COLS}`}>
            <span role="columnheader" className="bg-white/40 px-10 py-5">
              <span className="sr-only">Topic</span>
            </span>
            <span
              role="columnheader"
              className="relative flex items-center border-l border-rail bg-white/40 px-8 py-5 text-[0.9375rem] font-semibold tracking-[-0.01em] text-graphite"
            >
              <Cross className="absolute left-0 top-0 z-[3] -translate-x-1/2 -translate-y-1/2" />
              Billed by the hour
            </span>
            <span
              role="columnheader"
              className="relative flex items-center gap-2.5 border-l border-rail bg-surface px-8 py-5 text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink"
            >
              <Cross className="absolute left-0 top-0 z-[3] -translate-x-1/2 -translate-y-1/2" />
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-ink" />
              <LogoMark size={18} ground="#ffffff" />
              With AI Weavers
            </span>
          </div>
          {COMPARE.map((r, i) => {
            const last = i === COMPARE.length - 1;
            return (
              <div key={r.topic} role="row" className={`grid border-rail lg:border-t ${i > 0 ? "border-t" : ""} ${TABLE_COLS}`}>
                <div role="rowheader" className="flex items-center gap-3.5 bg-white/40 px-5 pb-3 pt-5 md:px-8 lg:px-10 lg:py-5">
                  <span className="grid size-[52px] shrink-0 place-items-center rounded-[14px] bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
                    <IsoIcon name={r.icon} className="size-[44px]" />
                  </span>
                  <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">{r.topic}</span>
                </div>
                <div role="cell" className="relative flex gap-3 bg-white/40 px-5 pb-4 pt-2 md:px-8 lg:items-center lg:border-l lg:border-rail lg:py-5">
                  {last && <Cross className="absolute bottom-0 left-0 z-[3] hidden -translate-x-1/2 translate-y-1/2 lg:block" />}
                  <Mark yes={false} />
                  <p className="text-[0.9375rem] leading-[1.5] text-graphite">
                    <span className="block text-[0.75rem] font-medium text-muted lg:hidden">Billed by the hour</span>
                    {r.hourly}
                  </p>
                </div>
                <div role="cell" className="relative flex gap-3 bg-surface px-5 py-4 md:px-8 lg:items-center lg:border-l lg:border-rail lg:py-5">
                  {last && <Cross className="absolute bottom-0 left-0 z-[3] hidden -translate-x-1/2 translate-y-1/2 lg:block" />}
                  <Mark yes />
                  <p className="text-[0.9375rem] font-medium leading-[1.5] tracking-[-0.005em] text-ink">
                    <span className="block text-[0.75rem] font-medium text-muted lg:hidden">With AI Weavers</span>
                    {r.weavers}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
