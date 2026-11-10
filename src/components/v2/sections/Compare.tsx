"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { IsoIcon, type IsoName } from "@/components/brand/Iso";
import { LOGO_LETTERS, LOGO_THREAD } from "@/components/brand/logo-paths";
import { Rule } from "@/components/site/Rails";

/** The "AI" of the wordmark (the A crossed by its thread), cropped from the logo's own paths. */
function AiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 272 196" className={className} aria-hidden="true">
      <path d={LOGO_LETTERS} fill="currentColor" fillRule="evenodd" />
      <path d={LOGO_THREAD} fill="var(--signal)" />
    </svg>
  );
}
import { COMPARE, COMPARE_HEAD } from "@/components/v2/content";
import { SectionHead, useReveal } from "@/components/v2/parts";

const US = COMPARE.options.length - 1; // the AI Weavers column

/* One line-art icon per option (the doc names the options; the icons are illustration):
   no-code tools → keyboard · freelancer → talk · an operations hire → papers · AI Weavers → the "AI" of the wordmark */
const OPTION_ICON: IsoName[] = ["keyboard", "talk", "papers"];

/**
 * 8 · Your options compared — replaces the live "hourly vs fixed price"
 * timeline and table. One ledger on the grid: the four options as columns,
 * each headed by its icon; the rows numbered like the site's other ledgers;
 * AI Weavers lifted onto a white sheet with an ink top edge (the featured
 * treatment from Pricing), its ticks popping in one by one once the sheet
 * has lifted. Hovering a cell lights its row and its column, a crosshair on
 * the grid. Scrolls sideways on phones with the row labels pinned.
 */
export function Compare() {
  const root = useRef<HTMLElement>(null);
  useReveal(root, (q) => {
    // the AI Weavers column lifts in, cell by cell, as the table arrives; then its ticks land
    const cells = q("[data-us]");
    const rows = q("[data-cmp-row]");
    const ticks = q("[data-tick]");
    if (prefersReducedMotion()) return;
    gsap.set(cells, { "--lift": 0 });
    gsap.set(rows, { autoAlpha: 0, y: 10 });
    gsap.set(ticks, { scale: 0, transformOrigin: "center" });
    ScrollTrigger.create({
      trigger: q("[data-cmp]")[0],
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.to(rows, { autoAlpha: 1, y: 0, duration: 0.8, ease: "weave", stagger: 0.06, clearProps: "transform" });
        gsap.to(cells, { "--lift": 1, duration: 0.7, ease: "power2.out", stagger: 0.07, delay: 0.35 });
        gsap.to(ticks, { scale: 1, duration: 0.55, ease: "back.out(2.2)", stagger: 0.08, delay: 0.75 });
      },
    });
  });

  return (
    <section ref={root} id="compare" aria-labelledby="cmp-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="cmp-title" {...COMPARE_HEAD} />

        <Rule className="relative mt-12 md:mt-16" />
        <div data-cmp className="cmp-scroll -mx-5 overflow-x-auto overflow-y-hidden md:mx-0 md:border-x md:border-rail">
          <table className="cmp w-full min-w-[780px] table-fixed border-collapse text-left md:min-w-[860px]">
            <colgroup>
              <col className="w-[8.75rem] md:w-[13rem] lg:w-[15rem]" />
              {COMPARE.options.map((o) => (
                <col key={o} />
              ))}
            </colgroup>
            <thead>
              <tr data-cmp-row>
                <th scope="col" className="cmp-stub">
                  <span className="sr-only">What you compare</span>
                </th>
                {COMPARE.options.map((o, j) => (
                  <th key={o} scope="col" data-us={j === US || undefined} className="cmp-head">
                    <span className="cmp-col-icon" aria-hidden>
                      {j === US ? <AiMark className="h-[20px] w-auto text-ink" /> : <IsoIcon name={OPTION_ICON[j]} className="size-11" />}
                    </span>
                    <span className="cmp-col-name">{o}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.rows.map(([label, ...vals], r) => (
                <tr key={label} data-cmp-row>
                  <th scope="row" className="cmp-stub cmp-label">
                    <span className="cmp-idx" aria-hidden>
                      {String(r + 1).padStart(2, "0")}
                    </span>
                    {label}
                  </th>
                  {vals.map((v, j) => (
                    <td key={j} data-us={j === US || undefined} className="cmp-cell">
                      {j === US ? (
                        <span className="flex gap-2.5">
                          <span data-tick className="mt-[0.2em] grid size-[17px] shrink-0 place-items-center rounded-full bg-ink text-white">
                            <svg viewBox="0 0 14 14" className="size-2.5" fill="none" aria-hidden>
                              <path d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          {v}
                        </span>
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Rule className="relative" />

        <p
          data-rise
          className="max-w-[46rem] text-pretty py-10 text-[clamp(1.375rem,2.4vw,1.875rem)] font-semibold leading-[1.2] tracking-[-0.035em] md:px-8 md:py-14 lg:ml-[calc(12rem+3.5rem)] lg:px-10"
        >
          {/* the two sentences take a line each: the second never starts as a widow at the end of the first */}
          <span className="text-[#72727d]">{COMPARE.under.split(". ")[0]}.</span>{" "}
          <span className="block text-ink">{COMPARE.under.split(". ").slice(1).join(". ")}</span>
        </p>
      </div>
    </section>
  );
}
