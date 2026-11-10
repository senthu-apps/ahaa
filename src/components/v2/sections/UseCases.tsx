"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { IsoIcon } from "@/components/brand/Iso";
import { Rule } from "@/components/site/Rails";
import { DEPARTMENTS, DEPARTMENT_ICON, USE_CASES, USE_CASES_FOOT, USE_CASES_HEAD, BOOK, type Department } from "@/components/v2/content";
import { Arrow, PrimaryButton, SectionHead, refreshSoon, spotlight, useReveal } from "@/components/v2/parts";

type Filter = "All" | Department;
const DEFAULT_COUNT = 8;

/* "All" deals the departments out in turn, so the first eight show the range. */
const ROUND_ROBIN = (() => {
  const lanes = DEPARTMENTS.map((d) => USE_CASES.filter((u) => u.dept === d));
  const out: typeof USE_CASES = [];
  for (let i = 0; out.length < USE_CASES.length; i++) lanes.forEach((l) => l[i] && out.push(l[i]));
  return out;
})();

/**
 * 4 · Use-case library — department filter (pill tabs), a grid of small cards
 * on the page grid with the department as a tag, eight shown by default with
 * "Show all 20" (and "Show fewer" to fold it back). Every card is a link to
 * the booking section: the lede promises a fixed-price quote on each item, so
 * each card says so on hover and takes you to the audit. Cards re-deal with a
 * short rise when the filter changes.
 */
export function UseCases() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [all, setAll] = useState(false);
  const first = useRef(true);
  useReveal(root);

  const items = useMemo(() => {
    if (filter !== "All") return USE_CASES.filter((u) => u.dept === filter);
    return all ? ROUND_ROBIN : ROUND_ROBIN.slice(0, DEFAULT_COUNT);
  }, [filter, all]);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    refreshSoon();
    if (!grid.current) return;
    spotlight(gsap.utils.toArray<HTMLElement>("[data-spot]", grid.current));
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      grid.current.querySelectorAll("[data-uc]"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "weave", stagger: 0.035, overwrite: true },
    );
  }, [filter, all]);

  const count = (f: Filter) => (f === "All" ? USE_CASES.length : USE_CASES.filter((u) => u.dept === f).length);
  const canToggle = filter === "All";

  return (
    <section ref={root} id="use-cases" aria-labelledby="uc-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="uc-title" {...USE_CASES_HEAD}>
          <div data-head role="group" aria-label="Filter by department" className="mt-8 flex flex-wrap gap-2">
            {(["All", ...DEPARTMENTS] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => {
                  setFilter(f);
                  setAll(false);
                }}
                className="uc-tab"
              >
                {f}
                <span className="uc-count">{count(f)}</span>
              </button>
            ))}
          </div>
        </SectionHead>

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 md:mx-0 md:border-x md:border-rail">
          <ul ref={grid} aria-live="polite" className="grid gap-px bg-rail sm:grid-cols-2 lg:grid-cols-4">
            {items.map((u) => (
              <li key={u.title} data-uc data-rise className="bg-canvas">
                <a href={BOOK} data-spot className="uc-card flex h-full flex-col px-5 py-7 md:px-7 md:py-8">
                  <div className="flex items-start justify-between gap-3">
                    <IsoIcon name={DEPARTMENT_ICON[u.dept]} className="-ml-1 -mt-1 size-11" />
                    <span className="uc-tag">{u.dept}</span>
                  </div>
                  <h3 className="mt-5 text-pretty text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] text-ink">{u.title}</h3>
                  <p className="mt-2 text-pretty text-[0.9375rem] leading-[1.55] text-graphite">{u.body}</p>
                  <span className="uc-cta">
                    <span>{USE_CASES_FOOT.quote}</span>
                    <span className="uc-cta-icon">
                      <Arrow size={12} />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {canToggle && (
            <button type="button" aria-expanded={all} onClick={() => setAll((v) => !v)} className="uc-more group">
              <span className={`faq-toggle ${all ? "uc-more-open" : ""}`} aria-hidden />
              {all ? USE_CASES_FOOT.showFewer : USE_CASES_FOOT.showAll}
            </button>
          )}
        </div>
        <Rule className="relative" />

        <div
          data-rise
          className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between md:px-8 md:py-12 lg:px-10"
        >
          <p className="max-w-[52ch] text-pretty text-[1.0625rem] leading-[1.55] text-graphite">
            <b className="font-semibold text-ink">{USE_CASES_FOOT.line.split("?")[0]}?</b>
            {USE_CASES_FOOT.line.slice(USE_CASES_FOOT.line.indexOf("?") + 1)}
          </p>
          <PrimaryButton href={BOOK} className="shrink-0 self-start md:self-auto">
            {USE_CASES_FOOT.button}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
