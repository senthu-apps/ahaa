"use client";

import { useRef, type ReactNode } from "react";
import type { JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Frame } from "@/components/brand/Frame";
import { Cross, Rule } from "@/components/site/Rails";
import { CareDemo, Check, DemoCard, FlowDemo, FlowFooter, InboxDemo, JobsDemo, SampleData } from "@/components/services/demos";
import { DEMO_TIMELINES } from "@/components/services/timelines";
import { SERVICES, SERVICES_HEAD } from "@/components/v2/content";
import { SectionHead, useReveal } from "@/components/v2/parts";

/* The live site's four animated demos, one per card; every card keeps "Sample data". */
const DEMOS: { demo: ReactNode; footer: ReactNode }[] = [
  {
    demo: <FlowDemo />,
    footer: (
      <>
        <FlowFooter />
        <SampleData />
      </>
    ),
  },
  { demo: <InboxDemo />, footer: <SampleData /> },
  { demo: <JobsDemo />, footer: <SampleData /> },
  { demo: <CareDemo />, footer: <SampleData /> },
];

/**
 * 3 · What we build — four cards on the grid (2 × 2 from lg). Each card: title,
 * line, the doc's three examples, then its live demo on the dotted stage. The
 * demo is rewound on load and plays when the card scrolls in; Replay replays.
 */
export function Services() {
  const root = useRef<HTMLElement>(null);
  const replay = useRef<(i: number) => void>(() => {});
  useReveal(root);

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return; // static end states
      const cards = gsap.utils.toArray<HTMLElement>("[data-svc]", root.current!);
      const running: { tl: gsap.core.Timeline | null; own: JSAnimation[] }[] = cards.map(() => ({ tl: null, own: [] }));

      const build = contextSafe!((i: number) => {
        const r = running[i];
        r.tl?.kill();
        r.own.forEach((a) => a.revert());
        r.own = [];
        r.tl = DEMO_TIMELINES[i](cards[i], (a) => void r.own.push(a));
        return r.tl;
      });

      cards.forEach((card, i) => {
        build(i); // rewind to the start state now; play on arrival
        ScrollTrigger.create({ trigger: card.querySelector("[data-svc-stage]"), start: "top 78%", once: true, onEnter: () => running[i].tl?.play(0) });
      });
      replay.current = contextSafe!((i: number) => void build(i).play(0));

      return () => running.forEach((r) => r.own.forEach((a) => a.revert()));
    },
    { scope: root },
  );

  return (
    <section ref={root} id="services" aria-labelledby="services-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="services-title" {...SERVICES_HEAD} />

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 grid md:mx-0 md:border-x md:border-rail lg:grid-cols-2">
          {SERVICES.map((s, i) => (
            <article
              key={s.key}
              data-svc
              aria-labelledby={`svc-${s.key}`}
              className={`relative flex flex-col bg-white/40 lg:row-span-2 lg:grid lg:grid-rows-subgrid ${i > 0 ? "border-t border-rail" : ""} ${i === 1 ? "lg:border-l lg:border-t-0" : ""} ${i === 3 ? "lg:border-l" : ""}`}
            >
              {i % 2 === 1 && (
                <>
                  <Cross className="absolute left-0 top-0 z-[1] hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
                  <Cross className="absolute bottom-0 left-0 z-[1] hidden -translate-x-1/2 translate-y-1/2 lg:block" />
                </>
              )}
              <div className="px-5 pb-8 pt-9 md:px-8 lg:px-10 lg:pb-9 lg:pt-11">
                <div className="flex items-baseline gap-3">
                  <span data-rise aria-hidden className="font-mono text-[0.75rem] tabular-nums text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 data-rise id={`svc-${s.key}`} className="text-[1.375rem] font-semibold leading-tight tracking-[-0.03em] text-ink">
                    {s.title}
                  </h3>
                </div>
                <p data-rise className="mt-2 max-w-[44ch] text-pretty text-[1rem] leading-[1.55] text-graphite">
                  {s.body}
                </p>
                <ul className="mt-6 grid gap-2.5">
                  {s.examples.map((ex) => (
                    <li key={ex} data-rise className="flex gap-2.5 text-pretty text-[0.9375rem] leading-[1.5] text-ink">
                      <span className="mt-[0.3em] grid size-[15px] shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
                        <Check className="size-2" color="var(--ink)" />
                      </span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>

              {/* cards of different heights share a top line: the stage fills its shared row track (mt-auto is
                  for the stacked layout only; in the grid it would sink a shorter stage to the track's end) and
                  aligns the card to its top, not its centre */}
              <div data-svc-stage className="relative mt-auto grid items-start justify-items-center border-t border-rail px-5 py-10 md:px-10 lg:mt-0 lg:min-h-[470px] lg:py-12">
                <div aria-hidden className="fp-dots absolute inset-0" />
                <div data-wb-card className="relative w-full max-w-[520px]">
                  <Frame>
                    <DemoCard title={s.demoTitle} onReplay={() => replay.current(i)} footer={DEMOS[i].footer}>
                      {DEMOS[i].demo}
                    </DemoCard>
                  </Frame>
                </div>
              </div>
            </article>
          ))}
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
