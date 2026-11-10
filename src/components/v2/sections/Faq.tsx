"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { Rule } from "@/components/site/Rails";
import { FAQ, FAQ_GROUPS, FAQ_HEAD } from "@/components/v2/content";
import { Ph, SectionHead, refreshSoon, useReveal } from "@/components/v2/parts";

/* Number · question · toggle. The lg columns repeat the header's (12rem + 3.5rem gap). */
const COLS =
  "grid grid-cols-[1.75rem_minmax(0,1fr)_2rem] gap-x-3 px-5 md:grid-cols-[2.75rem_minmax(0,1fr)_2rem] md:gap-x-5 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)_2rem] lg:gap-x-14 lg:px-10";

/**
 * 13 · FAQ — the live accordion ledger, now read in four themes (before you
 * book · plans and money · delivery and ownership · data and approvals) so
 * sixteen questions scan in seconds. Each theme is a labelled run of rows;
 * the questions keep the doc's wording and their order inside each theme.
 * Independent toggles, first open, arrow / Home / End keys.
 */
export function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));

  // the groups, numbered 01 … 16 in reading order
  const groups = useMemo(() => {
    let n = 0;
    return FAQ_GROUPS.map((g) => ({ title: g.title, items: g.items.map((i) => ({ i, n: ++n, ...FAQ[i] })) }));
  }, []);

  useReveal(root, (q) => {
    if (prefersReducedMotion()) return;
    const rows = q("[data-faq-row]");
    gsap.set(q("[data-faq-rise]"), { autoAlpha: 0, y: 14 });
    gsap.set(q("[data-faq-rule]"), { scaleX: 0, transformOrigin: "left center" });
    ScrollTrigger.batch(rows, {
      start: "top 92%",
      once: true,
      onEnter: (batch) => {
        const els = batch as HTMLElement[];
        gsap.to(els.flatMap((r) => gsap.utils.toArray<HTMLElement>("[data-faq-rise]", r)), { autoAlpha: 1, y: 0, duration: 0.9, ease: "weave", stagger: 0.06 });
        gsap.to(els.flatMap((r) => gsap.utils.toArray<HTMLElement>("[data-faq-rule]", r)), { scaleX: 1, duration: 1.1, ease: "weave", stagger: 0.06 });
      },
    });
  });

  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    window.setTimeout(refreshSoon, 600); // after the panel has opened
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, pos: number) => {
    const buttons = root.current!.querySelectorAll<HTMLButtonElement>("[data-faq-q]");
    const last = buttons.length - 1;
    const keys: Record<string, number> = { ArrowDown: pos === last ? 0 : pos + 1, ArrowUp: pos === 0 ? last : pos - 1, Home: 0, End: last };
    const to = keys[e.key];
    if (to === undefined) return;
    e.preventDefault();
    buttons[to].focus();
  };

  return (
    <section ref={root} id="faq" aria-labelledby="faq-h" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="faq-h" {...FAQ_HEAD} />

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 md:mx-0 md:border-x md:border-rail">
          {groups.map((g) => (
            <div key={g.title} className="faq-group" role="group" aria-label={g.title}>
              <div data-faq-row className={`faq-group-head ${COLS}`}>
                <p data-faq-rise className="faq-group-label col-span-3">
                  {g.title}
                  <span className="faq-group-count">{g.items.length}</span>
                </p>
              </div>
              {g.items.map(({ i, n, q, a }) => {
                const isOpen = open.has(i);
                const num = String(n).padStart(2, "0");
                return (
                  <div key={q} data-faq-row data-open={isOpen} className="faq-item relative">
                    <span data-faq-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
                    <h3>
                      <button
                        type="button"
                        id={`faq-q${n}`}
                        data-faq-q
                        aria-expanded={isOpen}
                        aria-controls={`faq-a${n}`}
                        onClick={() => toggle(i)}
                        onKeyDown={(e) => onKey(e, n - 1)}
                        className={`faq-q w-full items-start py-6 text-left md:py-7 ${COLS}`}
                      >
                        <span data-faq-rise aria-hidden className="faq-num pt-[0.3em] font-mono text-[0.75rem] tabular-nums">
                          {num}
                        </span>
                        <span data-faq-rise className="text-pretty text-[1.0625rem] font-medium leading-[1.4] tracking-[-0.015em] text-ink md:text-[1.1875rem]">
                          {q}
                        </span>
                        <span data-faq-rise aria-hidden className="faq-toggle -my-0.5" />
                      </button>
                    </h3>
                    <div id={`faq-a${n}`} role="region" aria-labelledby={`faq-q${n}`} className="faq-panel">
                      <div className="min-h-0 overflow-hidden">
                        <div className={`pb-7 md:pb-8 ${COLS}`}>
                          <p className="faq-answer col-span-2 col-start-2 max-w-[64ch] text-pretty text-[1rem] leading-[1.65] text-graphite">
                            <Ph text={a} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
