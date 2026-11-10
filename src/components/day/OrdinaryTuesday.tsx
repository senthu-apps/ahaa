"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Stitch } from "@/components/brand/Stitch";
import { Cross, Rule } from "@/components/site/Rails";
import { DAY_LENGTH, INDUSTRIES, clock } from "./day";

/** Hour ticks on the day track (8 AM … 5 PM) as minutes after 7:00; noon gets a taller tick. */
const HOUR_TICKS = [60, 120, 180, 240, 300, 360, 420, 480, 540, 600];
const NOON = 300;
const pct = (m: number) => `${(m / DAY_LENGTH) * 100}%`;

/** Log row grid: time · thread node · task · system chip (the chip wraps under the task below xl). */
const ROW_GRID =
  "grid grid-cols-[3rem_14px_minmax(0,1fr)] gap-x-4 px-5 md:px-8 xl:grid-cols-[3rem_14px_minmax(0,1fr)_auto]";

/** The board pins (and scroll only moves the clock) when it fits the viewport with room to spare. */
const PIN_QUERY = "(min-width: 80rem) and (min-height: 42rem)";

function NodeCheck() {
  return (
    <svg width="8" height="8" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7.4 5.8 10 11 4.2" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The thread column of a log row. The node sits on the task's first line;
 * the segment runs from it to the next row's node (the row's full height),
 * so the orange fill reaches each node exactly when the clock does.
 */
function Thread({ last = false }: { last?: boolean }) {
  return (
    <span aria-hidden className={`relative -my-[13px] self-stretch ${last ? "" : "row-span-2 xl:row-span-1"}`}>
      {!last && (
        <span className="day-seg">
          <span data-day-seg className="day-seg-fill" />
        </span>
      )}
      <span className="day-node">
        <NodeCheck />
      </span>
    </span>
  );
}

/** 7:00 AM → 5:30 PM ruler: hour ticks, a marker per task (active industry) and the playhead. */
function DayTrack({ active }: { active: number }) {
  return (
    <div data-day-reveal aria-hidden className="mt-9">
      <div className="relative h-[26px]">
        {HOUR_TICKS.map((m) => (
          <span
            key={m}
            className={`absolute top-0 w-px -translate-x-1/2 bg-line-strong ${m === NOON ? "h-[9px]" : "h-[5px]"}`}
            style={{ left: pct(m) }}
          />
        ))}
        <div className="absolute inset-x-0 top-[17px] h-[2px] rounded-full bg-line-strong">
          <div className="day-fill absolute inset-0 rounded-full bg-signal" />
        </div>
        {INDUSTRIES.map((ind, i) => (
          <div key={ind.key} data-day-markers data-active={i === active} className="day-markers absolute inset-0">
            {ind.events.map((e) => (
              <span
                key={e.m}
                data-day-marker
                className="day-marker absolute top-[18px] size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: pct(e.m) }}
              />
            ))}
          </div>
        ))}
        <span className="day-knob absolute top-[18px] size-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface shadow-[0_0_0_1.5px_var(--signal),0_2px_8px_-1px_rgb(22_22_27/0.28)]" />
      </div>
      <div className="mt-2 flex justify-between text-[0.8125rem] font-medium text-graphite">
        <span>7:00 AM</span>
        <span>5:30 PM</span>
      </div>
    </div>
  );
}

export function OrdinaryTuesday() {
  const root = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const show = useRef<(i: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const q = <T extends Element = HTMLElement>(sel: string, scope: Element = el) => gsap.utils.toArray<T>(sel, scope);

      const board = q("[data-day-board]")[0];
      const stage = q("[data-day-stage]")[0];
      const list = q("[data-day-list]")[0];
      const hms = q("[data-day-hm]");
      const mers = q("[data-day-mer]");
      const counts = q("[data-day-count]");
      const panels = q("[data-day-panel]");
      const rows = panels.map((p) => q("[data-day-row]", p));
      const segs = panels.map((p) => q("[data-day-seg]", p));
      const marks = q("[data-day-markers]").map((s) => q("[data-day-marker]", s));
      // Each industry's stops: its ten tasks, then the 5:30 close.
      const stops = INDUSTRIES.map((ind) => [...ind.events.map((e) => e.m), DAY_LENGTH]);
      const segShown = segs.map((s) => s.map(() => -1));

      const flag = (node: Element, name: string, on: boolean) => {
        const v = on ? "true" : "false";
        if (node.getAttribute(name) !== v) node.setAttribute(name, v);
      };

      // The console's handled count rolls up whenever it changes (the inline mini-bar copy just swaps).
      // A fill-less Web Animation: rapid scrubbing restarts it freely and it never leaves a stale offset.
      const rollers = q("[data-day-count][data-roll]");
      const roll = () =>
        rollers.forEach((n) => {
          n.getAnimations().forEach((a) => a.cancel());
          n.animate(
            [
              { transform: "translateY(55%)", opacity: 0 },
              { transform: "none", opacity: 1 },
            ],
            { duration: 450, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
          );
        });

      let minute = 0;
      let shownMinute = -1;
      let handled = -1;
      let activeIdx = 0;

      /** Draw the whole board at `m` minutes after 7:00. Writes only what changed. */
      const render = (m: number, quiet = false) => {
        minute = m;
        board.style.setProperty("--day-p", (m / DAY_LENGTH).toFixed(4));
        flag(board, "data-running", m > 0.5 && m < DAY_LENGTH - 0.5);

        const whole = Math.min(DAY_LENGTH, Math.floor(m + 1e-3));
        if (whole !== shownMinute) {
          shownMinute = whole;
          const t = clock(whole);
          hms.forEach((n) => {
            n.textContent = t.hm;
          });
          mers.forEach((n) => {
            n.textContent = t.mer;
          });
        }

        stops.forEach((st, p) => {
          let done = 0;
          while (done < st.length && m >= st[done] - 1e-3) done++;
          rows[p].forEach((row, i) => {
            flag(row, "data-done", i < done);
            flag(row, "data-current", i === done - 1);
          });
          marks[p].forEach((mk, i) => flag(mk, "data-done", i < done));
          segs[p].forEach((seg, i) => {
            const f = Math.round(gsap.utils.clamp(0, 1, (m - st[i]) / (st[i + 1] - st[i])) * 1000) / 1000;
            if (f !== segShown[p][i]) {
              segShown[p][i] = f;
              seg.style.transform = `scaleY(${f})`;
            }
          });
          if (p === activeIdx) {
            const n = Math.min(done, st.length - 1);
            if (n !== handled) {
              const first = handled < 0;
              handled = n;
              counts.forEach((c) => {
                c.textContent = String(n);
              });
              if (!first && !quiet && !prefersReducedMotion()) roll();
            }
          }
        });
      };

      render(0, true);

      // ---- entrance: header rises and the eyebrow stitch is sewn (house beat), then the board's content
      const owned: JSAnimation[] = [];
      if (!prefersReducedMotion()) {
        const eyebrowThread = createDrawable(q<SVGPathElement>(".day-eyebrow .stitch-thread"), 0, 0);
        gsap.from(q("[data-day-head]"), {
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
        gsap.from([...q("[data-day-reveal]"), ...q("[data-day-anim]", panels[0])], {
          autoAlpha: 0,
          y: 12,
          duration: 0.9,
          ease: "weave",
          stagger: 0.022,
          scrollTrigger: { trigger: stage, start: "top 76%", once: true },
        });
      }

      // ---- the clock: scroll drives a proxy minute (scrubbed, so it glides) and render() follows it
      // (matchMedia only calls back while some condition matches — `motion`/`reduce` guarantee one does.)
      const mm = gsap.matchMedia();
      const conditions = {
        wide: PIN_QUERY,
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      };
      mm.add(conditions, (ctx) => {
        const { wide, reduce } = ctx.conditions as { wide: boolean; reduce: boolean };
        if (reduce) {
          // No scrubbing: show the finished day.
          board.dataset.mode = "static";
          render(DAY_LENGTH, true);
          return () => {
            delete board.dataset.mode;
          };
        }

        const pin = wide && stage.offsetHeight <= window.innerHeight - 48;
        board.dataset.mode = pin ? "pin" : "scroll";
        const hand = { m: 0 };
        render(0, true);
        gsap.to(hand, {
          m: DAY_LENGTH,
          ease: "none",
          onUpdate: () => render(hand.m),
          scrollTrigger: pin
            ? {
                // Desktop: the board holds centre screen while the day plays out.
                trigger: stage,
                start: "center center",
                end: () => `+=${Math.round(window.innerHeight * 1.6)}`,
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              }
            : // Tablet / phone / short screens: tasks tick off as the log scrolls past.
              { trigger: list, start: "top 70%", end: "bottom 70%", scrub: 0.5 },
        });
        return () => {
          delete board.dataset.mode;
        };
      });

      // ---- industry switch: the board keeps its time; the incoming log settles in
      show.current = contextSafe!((i: number) => {
        if (i === activeIdx) return;
        activeIdx = i;
        render(minute);
        if (prefersReducedMotion()) return;
        gsap.fromTo(
          q("[data-day-anim]", panels[i]),
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: "weave", stagger: 0.018, delay: 0.06, overwrite: true },
        );
      });

      return () => {
        mm.revert();
        owned.forEach((a) => a.revert());
        show.current = () => {};
      };
    },
    { scope: root },
  );

  useEffect(() => {
    show.current(active);
  }, [active]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = INDUSTRIES.length;
    const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (e.key in step) next = (active + step[e.key] + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    // last:pb — the pin needs half a screen below the board to finish the day; while this
    // is the page's last section it supplies that itself (the next section will instead).
    <section
      ref={root}
      id="an-ordinary-tuesday"
      aria-labelledby="day-title"
      className="relative overflow-x-clip pt-24 last:pb-[max(4rem,calc(50svh-14rem))] md:pt-32"
    >
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-day-head className="day-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            An ordinary Tuesday
          </p>
          <div>
            <h2
              data-day-head
              id="day-title"
              className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              <span className="text-[#72727d]">A day that</span> <span className="text-ink">runs itself.</span>
            </h2>
            <p data-day-head className="mt-5 max-w-[52ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              This is one business day with AI Weavers on retainer. Pick your industry, then scroll to move the clock.
            </p>
          </div>
        </header>
      </div>

      <div className="mt-12 md:mt-16">
        {/* Pinned on large screens: the rules travel with the board so its frame stays whole. */}
        <div data-day-stage>
          <div className="mx-auto max-w-[1240px] px-5 md:px-6">
            <Rule className="relative" />
            <div
              data-day-board
              className="day-board grid md:border-x md:border-rail lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:grid-cols-[28rem_minmax(0,1fr)]"
            >
              {/* ---- Console: clock, day track, tallies, industry picker */}
              <div className="day-console flex flex-col bg-white/40">
                <div className="px-5 pb-8 pt-8 md:px-8 lg:px-10 lg:pb-9 lg:pt-11">
                  <p data-day-reveal className="flex items-baseline gap-2 text-ink">
                    <span
                      data-day-hm
                      className="text-[clamp(4.25rem,6.2vw,6rem)] font-semibold leading-[0.82] tracking-[-0.055em] tabular-nums"
                    >
                      7:00
                    </span>
                    <span data-day-mer className="text-[1.375rem] font-semibold tracking-[-0.02em] text-signal">
                      AM
                    </span>
                  </p>
                  <DayTrack active={active} />
                </div>

                <div className="grid grid-cols-2 border-t border-rail">
                  <div className="px-5 py-6 md:px-8 lg:py-7 lg:pl-10 lg:pr-6">
                    <div data-day-reveal>
                      <p className="flex items-end gap-1 text-ink">
                        <span className="overflow-hidden">
                          <span
                            data-day-count
                            data-roll
                            className="block text-[2.75rem] font-semibold leading-none tracking-[-0.045em] tabular-nums"
                          >
                            0
                          </span>
                        </span>
                        <span className="pb-[3px] text-[1rem] font-medium tracking-[-0.01em] text-muted">/10</span>
                        {/* live indicator: pulses while the day is running */}
                        <span aria-hidden className="day-live relative ml-auto size-[7px] shrink-0 self-start">
                          <span className="absolute inset-0 rounded-full bg-signal" />
                          <span className="wb-ping absolute inset-0 rounded-full bg-signal" />
                        </span>
                      </p>
                      <p className="mt-2.5 text-balance text-[0.875rem] font-medium text-graphite">Handled by AI Weavers</p>
                    </div>
                  </div>
                  <div className="border-l border-rail px-5 py-6 md:px-8 lg:py-7">
                    <div data-day-reveal>
                      <p className="text-[2.75rem] font-semibold leading-none tracking-[-0.045em] text-ink tabular-nums">0</p>
                      <p className="mt-2.5 text-[0.875rem] font-medium text-graphite">Done by hand</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 border-t border-rail px-5 py-7 md:px-8 lg:px-10">
                  <p data-day-reveal id="day-pick-label" className="text-[0.875rem] font-medium text-graphite">
                    Pick your industry
                  </p>
                  <div
                    data-day-reveal
                    role="tablist"
                    aria-labelledby="day-pick-label"
                    onKeyDown={onKeyDown}
                    className="mt-3.5 flex flex-wrap gap-2"
                  >
                    {INDUSTRIES.map((ind, i) => {
                      const on = i === active;
                      return (
                        <button
                          key={ind.key}
                          ref={(node) => {
                            tabRefs.current[i] = node;
                          }}
                          id={`day-tab-${ind.key}`}
                          type="button"
                          role="tab"
                          aria-selected={on}
                          aria-controls={`day-panel-${ind.key}`}
                          tabIndex={on ? 0 : -1}
                          onClick={() => setActive(i)}
                          className={`h-9 rounded-full px-3.5 text-[0.875rem] font-medium tracking-[-0.01em] transition-[background-color,color,box-shadow] duration-300 focus-visible:rounded-full ${
                            on
                              ? "bg-ink text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_0_0_1px_#000]"
                              : "bg-surface text-graphite shadow-[0_0_0_1px_var(--line-strong)] hover:text-ink hover:shadow-[0_0_0_1px_var(--ink)]"
                          }`}
                        >
                          {ind.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ---- The day's log */}
              <div className="relative border-t border-rail lg:border-l lg:border-t-0">
                <Cross className="absolute left-0 top-0 z-[3] hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
                <Cross className="absolute bottom-0 left-0 z-[3] hidden -translate-x-1/2 translate-y-1/2 lg:block" />

                {/* Below lg the clock rides along at the top of the log while it scrolls. */}
                <div
                  aria-hidden
                  className="sticky top-0 z-[2] flex items-center justify-between border-b border-rail bg-canvas/85 px-5 py-3 backdrop-blur-md md:px-8 lg:hidden"
                >
                  <p className="flex items-baseline gap-1 font-semibold tracking-[-0.03em] text-ink">
                    <span data-day-hm className="text-[1.25rem] tabular-nums">
                      7:00
                    </span>
                    <span data-day-mer className="text-[0.8125rem] text-signal">
                      AM
                    </span>
                  </p>
                  <p className="text-[0.8125rem] font-medium text-graphite">
                    <span data-day-count className="tabular-nums text-ink">
                      0
                    </span>
                    /10 handled
                  </p>
                </div>

                <div
                  aria-hidden
                  className={`${ROW_GRID} border-b border-rail py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted`}
                >
                  <span>Time</span>
                  <span />
                  <span>Task</span>
                  <span className="hidden xl:block">System</span>
                </div>

                <div data-day-list className="grid">
                  {INDUSTRIES.map((ind, i) => {
                    const on = i === active;
                    return (
                      <div
                        key={ind.key}
                        id={`day-panel-${ind.key}`}
                        role="tabpanel"
                        aria-labelledby={`day-tab-${ind.key}`}
                        data-day-panel
                        data-active={on}
                        inert={!on}
                        className="day-panel col-start-1 row-start-1"
                      >
                        <ol aria-label={`${ind.label}, 7:00 AM to 5:30 PM`}>
                          {ind.events.map((e) => {
                            const t = clock(e.m);
                            return (
                              <li key={e.m} data-day-row className={`day-row relative items-start border-b border-rail py-[13px] ${ROW_GRID}`}>
                                <time data-day-anim dateTime={t.iso} className="day-time text-[0.875rem] font-medium leading-[22px] tabular-nums">
                                  {t.hm}
                                </time>
                                <Thread />
                                <p data-day-anim className="day-text text-pretty text-[0.9375rem] leading-[22px]">
                                  {e.text}
                                </p>
                                <span
                                  data-day-anim
                                  className="day-chip col-start-3 row-start-2 mt-1.5 justify-self-start xl:col-start-4 xl:row-start-1 xl:mt-0"
                                >
                                  {e.sys}
                                </span>
                              </li>
                            );
                          })}
                          <li data-day-row className={`day-row relative items-start py-[13px] ${ROW_GRID}`}>
                            <time data-day-anim dateTime="17:30" className="day-time text-[0.875rem] font-medium leading-[22px] tabular-nums">
                              5:30
                            </time>
                            <Thread last />
                            <p data-day-anim className="day-text text-pretty text-[0.9375rem] font-semibold leading-[22px] tracking-[-0.01em]">
                              Ten jobs handled. Nothing copied by hand.
                            </p>
                          </li>
                        </ol>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Rule className="relative" />
          </div>
        </div>
      </div>
    </section>
  );
}
