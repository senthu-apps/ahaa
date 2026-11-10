"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Stitch } from "@/components/brand/Stitch";
import { Rule } from "@/components/site/Rails";
import { HEAD, QUESTIONS } from "./questions";

/* Number · question · toggle. The lg columns repeat the header's (12rem + 3.5rem gap),
   so every question starts on the same line as the headline above it. */
const COLS =
  "grid grid-cols-[1.75rem_minmax(0,1fr)_2rem] gap-x-3 px-5 md:grid-cols-[2.75rem_minmax(0,1fr)_2rem] md:gap-x-5 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)_2rem] lg:gap-x-14 lg:px-10";

/**
 * FAQ — the live site's eleven questions as one numbered ledger on the page
 * grid. Each row opens in place (CSS grid-rows, so no measuring); any number
 * can be open, the first starts open. Arrow keys, Home and End move between
 * questions (WAI-ARIA accordion pattern). Copy is verbatim from the live site.
 */
export function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const buttons = root.current!.querySelectorAll<HTMLButtonElement>("[data-faq-q]");
    const last = buttons.length - 1;
    const keys: Record<string, number> = { ArrowDown: i === last ? 0 : i + 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    buttons[to].focus();
  };

  useGSAP(
    () => {
      const el = root.current!;
      if (prefersReducedMotion()) return;
      const q = <T extends Element = HTMLElement>(sel: string, scope: Element = el) => gsap.utils.toArray<T>(sel, scope);
      const owned: JSAnimation[] = [];

      // ---- header: rises in, the eyebrow stitch is sewn (house beat)
      const thread = createDrawable(q<SVGPathElement>(".faq-eyebrow .stitch-thread"), 0, 0);
      gsap.from(q("[data-faq-head]"), {
        autoAlpha: 0,
        y: 18,
        duration: 1,
        ease: "weave",
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          once: true,
          onEnter: () => void owned.push(animate(thread, { draw: ["0 0", "0 1"], duration: 900, delay: 250, ease: "inOutCubic" })),
        },
      });

      // ---- rows: content rises and each divider is drawn, a few rows at a time as they arrive
      const rows = q("[data-faq-row]");
      gsap.set(q("[data-faq-rise]"), { autoAlpha: 0, y: 14 });
      gsap.set(q("[data-faq-rule]"), { scaleX: 0, transformOrigin: "left center" });
      ScrollTrigger.batch(rows, {
        start: "top 92%",
        once: true,
        onEnter: (batch) => {
          const els = batch as HTMLElement[];
          gsap.to(els.flatMap((r) => q("[data-faq-rise]", r)), { autoAlpha: 1, y: 0, duration: 0.9, ease: "weave", stagger: 0.06 });
          gsap.to(els.flatMap((r) => q("[data-faq-rule]", r)), { scaleX: 1, duration: 1.1, ease: "weave", stagger: 0.06 });
        },
      });

      return () => owned.forEach((a) => a.revert());
    },
    { scope: root },
  );

  return (
    // pt-0: Pricing's closing padding is this section's top margin (as on the live site)
    <section ref={root} id="faq" aria-labelledby="faq-h" className="relative overflow-x-clip pb-24 md:pb-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-faq-head className="faq-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            {HEAD.eyebrow}
          </p>
          <div>
            <h2 data-faq-head id="faq-h" className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]">
              <span className="text-[#72727d]">{HEAD.soft}</span> <span className="text-ink">{HEAD.strong}</span>
            </h2>
            <p data-faq-head className="mt-5 max-w-[60ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              {HEAD.lede}
            </p>
          </div>
        </header>

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 md:mx-0 md:border-x md:border-rail">
          {QUESTIONS.map(({ q, a }, i) => {
            const isOpen = open.has(i);
            const n = String(i + 1).padStart(2, "0");
            return (
              <div key={q} data-faq-row data-open={isOpen} className="faq-item relative">
                {i > 0 && <span data-faq-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />}
                <h3>
                  <button
                    type="button"
                    id={`faq-q${i + 1}`}
                    data-faq-q
                    aria-expanded={isOpen}
                    aria-controls={`faq-a${i + 1}`}
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`faq-q w-full items-start py-6 text-left md:py-7 ${COLS}`}
                  >
                    <span data-faq-rise aria-hidden className="faq-num pt-[0.3em] font-mono text-[0.75rem] tabular-nums">
                      {n}
                    </span>
                    <span data-faq-rise className="text-pretty text-[1.0625rem] font-medium leading-[1.4] tracking-[-0.015em] text-ink md:text-[1.1875rem]">
                      {q}
                    </span>
                    <span data-faq-rise aria-hidden className="faq-toggle -my-0.5" />
                  </button>
                </h3>
                <div id={`faq-a${i + 1}`} role="region" aria-labelledby={`faq-q${i + 1}`} className="faq-panel">
                  <div className="min-h-0 overflow-hidden">
                    <div className={`pb-7 md:pb-8 ${COLS}`}>
                      <p className="faq-answer col-span-2 col-start-2 max-w-[64ch] text-pretty text-[1rem] leading-[1.65] text-graphite">{a}</p>
                    </div>
                  </div>
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
