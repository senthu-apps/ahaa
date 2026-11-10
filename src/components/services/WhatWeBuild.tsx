"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Frame } from "@/components/brand/Frame";
import { Stitch } from "@/components/brand/Stitch";
import { Cross, Rule } from "@/components/site/Rails";
import { Check, CareDemo, DemoCard, FlowDemo, FlowFooter, InboxDemo, JobsDemo, SampleData } from "./demos";
import { DEMO_TIMELINES } from "./timelines";

type Service = {
  key: string;
  title: string;
  summary: string;
  lead: string;
  bullets: string[];
  demoTitle: string;
  demo: ReactNode;
  footer: ReactNode;
};

/* Copy verbatim from aiweavers.com → "What we build". */
const SERVICES: Service[] = [
  {
    key: "automations",
    title: "Automations",
    summary: "Your tools pass work to each other, so nobody copies and pastes.",
    lead: "Payments, invoices, reports and handoffs move between your systems on their own, day and night, with every step on record.",
    bullets: ["Payments matched to invoices", "Invoices synced to QuickBooks or Xero", "Morning numbers sent before the office opens"],
    demoTitle: "One payment, start to finish",
    demo: <FlowDemo />,
    footer: <FlowFooter />,
  },
  {
    key: "agents",
    title: "AI agents",
    summary: "AI that answers calls, sorts email, drafts replies and follows up. A person approves what matters.",
    lead: "Agents work inside the tools you already use. They read, look things up and prepare the work. Your people stay in charge of the decisions.",
    bullets: ["Replies drafted from client emails", "New inquiries answered and booked", "Staff questions answered from company data"],
    demoTitle: "Inbox agent",
    demo: <InboxDemo />,
    footer: null,
  },
  {
    key: "software",
    title: "Custom software",
    summary: "Portals, dashboards and internal apps shaped around how you actually work.",
    lead: "When off-the-shelf software forces you to work its way, we build yours. Engineers build it, product designers make it easy to use.",
    bullets: ["Client portals with e-signing", "Deal and file trackers", "Field apps with photo job cards"],
    demoTitle: "Job board",
    demo: <JobsDemo />,
    footer: <SampleData />,
  },
  {
    key: "care",
    title: "Care and upkeep",
    summary: "Hosting, monitoring and fixes for everything we build, inside the retainer.",
    lead: "Everything we build is hosted, watched and kept current by us. If something breaks, we usually know before you do.",
    bullets: ["Uptime and error monitoring", "Fixes and model updates", "Monthly hours-saved report"],
    demoTitle: "Your systems this month",
    demo: <CareDemo />,
    footer: <SampleData />,
  },
];

/** Seconds each tab holds while the section autoplays (desktop only). */
const DWELL = 8;

type Controls = { show: (i: number) => void; replay: (i: number) => void; interact: () => void };
const NOOP: Controls = { show: () => {}, replay: () => {}, interact: () => {} };

export function WhatWeBuild() {
  const root = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ctl = useRef<Controls>(NOOP);
  const [active, setActive] = useState(0);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, el);
      if (prefersReducedMotion()) return; // static end states, tabs still switch

      const owned: JSAnimation[] = [];

      // ---- header: content rises in, the eyebrow stitch is sewn (same beat as Why a fixed price)
      const eyebrowThread = createDrawable(q<SVGPathElement>(".wb-eyebrow .stitch-thread"), 0, 0);
      gsap.from(q("[data-wb-head]"), {
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

      const grid = q("[data-wb-grid]")[0];
      const tablist = q("[role=tablist]")[0];
      const panels = q("[data-wb-panel]");
      const bars = q("[data-wb-progress]");
      const tabContent = q("[data-wb-tab-content]");

      let current = 0;
      let started = false;
      let autoOn = window.matchMedia("(min-width: 64rem)").matches; // tabs sit beside the panel only on desktop
      let inView = false;
      let hovering = false;
      let demo: gsap.core.Timeline | null = null;
      let demoAnims: JSAnimation[] = [];
      let prog: gsap.core.Tween | null = null;

      // Rewind panel i to its start state (and drop whatever the last demo left running).
      const prepare = contextSafe!((i: number) => {
        demo?.kill();
        demoAnims.forEach((a) => a.revert());
        demoAnims = [];
        demo = DEMO_TIMELINES[i](panels[i], (a) => void demoAnims.push(a));
      });

      const syncProgress = () => void prog?.paused(!inView || hovering);
      const runProgress = contextSafe!(() => {
        prog?.kill();
        prog = null;
        gsap.set(bars, { scaleX: 0 });
        if (!autoOn) return;
        prog = gsap.fromTo(
          bars[current],
          { scaleX: 0 },
          { scaleX: 1, duration: DWELL, ease: "none", onComplete: () => setActive((current + 1) % panels.length) },
        );
        syncProgress();
      });
      const stopAuto = contextSafe!(() => {
        if (!autoOn) return;
        autoOn = false;
        prog?.kill();
        prog = null;
        gsap.to(bars, { scaleX: 0, duration: 0.3, ease: "power2.out", overwrite: true });
      });
      const begin = contextSafe!((revealTabs: boolean) => {
        if (started) return;
        started = true;
        if (revealTabs) gsap.to(tabContent, { autoAlpha: 1, y: 0, duration: 0.9, ease: "weave", stagger: 0.06 });
        else gsap.set(tabContent, { autoAlpha: 1, y: 0 });
        demo?.play();
        runProgress();
      });

      // Panel 0 waits, rewound, for the section to arrive; tab text waits to rise.
      prepare(0);
      gsap.set(tabContent, { autoAlpha: 0, y: 12 });

      ScrollTrigger.create({ trigger: grid, start: "top 72%", once: true, onEnter: () => begin(true) });
      // Autoplay only counts down while the grid is on screen.
      ScrollTrigger.create({
        trigger: grid,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          inView = self.isActive;
          syncProgress();
        },
      });

      // Pointer over the grid holds the countdown.
      const onOver = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        hovering = true;
        syncProgress();
      };
      const onOut = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        hovering = false;
        syncProgress();
      };
      // Any focus inside the tabs means the visitor is driving: autoplay ends for good.
      const onFocusIn = () => {
        stopAuto();
        begin(false);
      };
      grid.addEventListener("pointerenter", onOver);
      grid.addEventListener("pointerleave", onOut);
      tablist.addEventListener("focusin", onFocusIn);

      ctl.current = {
        show: contextSafe!((i: number) => {
          current = i;
          if (!started) return;
          prepare(i);
          demo?.play();
          runProgress();
        }),
        replay: contextSafe!((i: number) => {
          stopAuto();
          begin(false);
          current = i;
          prepare(i);
          demo?.play();
          gsap.fromTo(
            panels[i].querySelector("[data-wb-replay-icon]"),
            { rotate: 0 },
            { rotate: -360, duration: 0.7, ease: "power2.out", transformOrigin: "50% 50%" },
          );
        }),
        interact: contextSafe!(() => {
          stopAuto();
          begin(false);
        }),
      };

      return () => {
        grid.removeEventListener("pointerenter", onOver);
        grid.removeEventListener("pointerleave", onOut);
        tablist.removeEventListener("focusin", onFocusIn);
        demo?.kill();
        prog?.kill();
        [...owned, ...demoAnims].forEach((a) => a.revert());
        ctl.current = NOOP;
      };
    },
    { scope: root },
  );

  // Selection drives the demo (and, while autoplaying, the countdown).
  useEffect(() => {
    ctl.current.show(active);
  }, [active]);

  const select = (i: number) => {
    ctl.current.interact();
    if (i === active) ctl.current.replay(i);
    else setActive(i);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = SERVICES.length;
    const step: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next: number | null = null;
    if (e.key in step) next = (active + step[e.key] + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section ref={root} id="services" aria-labelledby="services-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-wb-head className="wb-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            What we build
          </p>
          <div>
            <h2
              data-wb-head
              id="services-title"
              className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              <span className="text-[#72727d]">One team.</span> <span className="text-ink">Everything your operations run on.</span>
            </h2>
            <p data-wb-head className="mt-5 max-w-[52ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              Tell us what slows your team down. If it saves them time, it gets quoted, built, launched and looked after.
            </p>
          </div>
        </header>

        <Rule className="relative mt-12 md:mt-16" />
        <div data-wb-grid className="grid md:border-x md:border-rail lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)]">
          {/* Tabs: a 2×2 cell grid on small screens, a vertical list beside the demo on desktop */}
          <div role="tablist" aria-label="Services" aria-orientation="vertical" onKeyDown={onKeyDown} className="grid grid-cols-2 lg:flex lg:flex-col">
            {SERVICES.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.key}
                  ref={(node) => {
                    tabRefs.current[i] = node;
                  }}
                  id={`wb-tab-${s.key}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`wb-panel-${s.key}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  className={`group relative flex flex-1 items-center gap-6 border-b border-rail px-5 py-4 text-left transition-colors duration-500 focus-visible:rounded-none focus-visible:outline-offset-[-2px] md:px-8 lg:px-10 lg:py-7 lg:last:border-b-0 max-lg:odd:border-r ${
                    on ? "bg-white/85" : "bg-white/40 hover:bg-white/70"
                  }`}
                >
                  <span data-wb-tab-content className="min-w-0 flex-1">
                    <span
                      className={`block text-[1.0625rem] font-semibold tracking-[-0.025em] transition-colors duration-300 lg:text-[1.375rem] lg:tracking-[-0.03em] ${
                        on ? "text-ink" : "text-[#72727d] group-hover:text-ink"
                      }`}
                    >
                      {s.title}
                    </span>
                    <span
                      className={`mt-1.5 hidden max-w-[34ch] text-pretty text-[0.9375rem] leading-[1.55] transition-colors duration-300 lg:block ${
                        on ? "text-graphite" : "text-muted"
                      }`}
                    >
                      {s.summary}
                    </span>
                  </span>
                  <span
                    data-wb-tab-content
                    aria-hidden
                    className={`hidden size-9 shrink-0 place-items-center rounded-full transition-[background-color,box-shadow] duration-300 lg:grid ${
                      on
                        ? "bg-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_0_0_1px_#000]"
                        : "bg-surface shadow-[0_0_0_1px_var(--line-strong)] group-hover:shadow-[0_0_0_1px_var(--ink)]"
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className={`transition-transform duration-500 ease-[var(--ease-out-expo)] ${on ? "" : "-rotate-45"}`}
                    >
                      <path
                        d="M2.5 7h9M7.5 3l4 4-4 4"
                        stroke={on ? "#fff" : "var(--ink)"}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {/* autoplay countdown: a signal thread runs along the active tab */}
                  <span aria-hidden data-wb-progress className="absolute inset-x-0 -bottom-px h-[2px] origin-left scale-x-0 bg-signal" />
                </button>
              );
            })}
          </div>

          <div className="relative grid lg:border-l lg:border-rail">
            <Cross className="absolute left-0 top-0 z-[1] hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
            <Cross className="absolute bottom-0 left-0 z-[1] hidden -translate-x-1/2 translate-y-1/2 lg:block" />
            {/* Desktop stage furniture stays put while panels cross-fade over it, so its
                rule never blinks. Height matches the panels' stage slot (lg:h-[460px]). */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[460px] border-t border-rail lg:block">
              <div className="fp-dots absolute inset-0" />
              <Cross className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
            </div>

            {SERVICES.map((s, i) => {
              const on = i === active;
              return (
                <div
                  key={s.key}
                  id={`wb-panel-${s.key}`}
                  role="tabpanel"
                  aria-labelledby={`wb-tab-${s.key}`}
                  data-wb-panel
                  data-state={on ? "active" : "inactive"}
                  inert={!on}
                  className={`wb-panel col-start-1 row-start-1 flex-col ${on ? "flex" : "hidden lg:flex"}`}
                >
                  <div className="flex-1 px-5 py-8 md:px-10 md:py-10 lg:px-12 lg:py-11">
                    <p data-wb-copy className="max-w-[46ch] text-pretty text-[1.0625rem] leading-[1.6] text-ink">
                      {s.lead}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {s.bullets.map((b) => (
                        <li
                          key={b}
                          data-wb-copy
                          className="flex items-center gap-1.5 rounded-full bg-surface py-1.5 pl-2.5 pr-3 text-[0.8125rem] text-graphite shadow-[0_0_0_1px_var(--line-strong)]"
                        >
                          <Check color="var(--ink)" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative grid place-items-center border-t border-rail px-5 py-10 md:px-10 lg:h-[460px] lg:border-t-0 lg:py-0">
                    <div aria-hidden className="fp-dots absolute inset-0 lg:hidden" />
                    <div data-wb-card className="relative w-full max-w-[560px]">
                      <Frame>
                        <DemoCard title={s.demoTitle} onReplay={() => ctl.current.replay(i)} footer={s.footer}>
                          {s.demo}
                        </DemoCard>
                      </Frame>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
