"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { Cross, Rule } from "@/components/site/Rails";
import { CASES, CASES_HEAD, type CaseLogo } from "@/components/v2/content";
import { Ph, SectionHead, useReveal } from "@/components/v2/parts";

function Logo({ logo, company }: { logo: CaseLogo; company: string }) {
  if (logo.kind === "img") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo.src} alt={logo.alt} style={{ height: logo.h }} className="w-auto" />;
  }
  // logo not supplied yet: a dashed slot the logo will drop into
  return (
    <span className="cs-logo-slot min-w-0" title="Logo to come">
      <span className="truncate text-[0.9375rem] font-semibold tracking-[-0.02em] text-ink">
        <Ph text={company} />
      </span>
      <span className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.06em] text-muted">Logo</span>
    </span>
  );
}

/** Splits "100+ hours saved every month" into the figure and the rest, so the figure leads. */
function splitResult(r: string): [string, string] {
  const m = r.match(/^(\S+\s\S+)\s(.+)$/);
  return m && !r.startsWith("[") ? [m[1], m[2]] : [r, ""];
}

/**
 * 5 · Case studies — three cards on the grid: logo on top, the Client / Our own
 * company tag always showing, the result as the largest text (a signal
 * underline is drawn beneath it as the card arrives), then problem, what was
 * built, time to live, and the quote with room for a headshot. From lg the
 * cards share row tracks (subgrid), so results and ledgers line up however
 * long the placeholders run.
 */
export function CaseStudies() {
  const root = useRef<HTMLElement>(null);
  useReveal(root, (q) => {
    if (prefersReducedMotion()) return;
    const lines = q("[data-cs-line]");
    gsap.set(lines, { scaleX: 0 });
    ScrollTrigger.batch(lines, {
      start: "top 88%",
      once: true,
      onEnter: (batch) => void gsap.to(batch, { scaleX: 1, duration: 1.1, ease: "weave", stagger: 0.12, delay: 0.35 }),
    });
  });

  return (
    <section ref={root} id="case-studies" aria-labelledby="cs-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="cs-title" {...CASES_HEAD} />

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 grid md:mx-0 md:border-x md:border-rail lg:grid-cols-3">
          {CASES.map((c, i) => {
            const [figure, rest] = splitResult(c.result);
            return (
              <article
                key={i}
                data-rise
                data-spot
                aria-label={c.company}
                className={`cs-card relative flex flex-col px-5 pb-8 pt-8 md:px-8 lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:px-9 lg:pt-9 ${
                  i > 0 ? "border-t border-rail lg:border-l lg:border-t-0" : ""
                }`}
              >
                {i > 0 && (
                  <>
                    <Cross className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
                    <Cross className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 lg:block" />
                  </>
                )}

                <div className="flex min-h-12 items-center justify-between gap-3">
                  <Logo logo={c.logo} company={c.company} />
                  <span className={`cs-tag ${c.tag === "Client" ? "cs-tag-client" : ""}`}>{c.tag}</span>
                </div>

                <p className="mt-6 text-pretty text-[0.875rem] leading-[1.5] text-muted">
                  <span className="font-medium text-graphite">
                    <Ph text={c.company} />
                  </span>{" "}
                  · <Ph text={c.sector} />
                </p>

                <p className="mt-3">
                  <span className="block text-[clamp(2.125rem,3.4vw,2.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
                    <Ph text={figure} />
                  </span>
                  {rest && <span className="mt-2 block text-[1rem] font-medium text-graphite">{rest}</span>}
                  <span data-cs-line aria-hidden className="cs-line" />
                </p>

                <dl className="mt-7 grid self-start border-t border-line text-[0.9375rem]">
                  {(
                    [
                      ["Problem", c.problem],
                      ["What we built", c.built],
                      ["Time to live", c.live],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-line py-3">
                      <dt className="text-graphite">{k}</dt>
                      <dd className={`text-ink ${k === "Time to live" ? "font-semibold" : ""}`}>
                        <Ph text={v} />
                      </dd>
                    </div>
                  ))}
                </dl>

                <figure className="mt-auto pt-8 lg:mt-0 lg:self-end">
                  <div className="flex items-start gap-3.5">
                    <span className="cs-headshot" aria-hidden title="Headshot to come" />
                    <div className="min-w-0">
                      <blockquote className="text-pretty text-[1rem] font-medium leading-[1.5] text-ink">
                        “<Ph text={c.quote} />”
                      </blockquote>
                      <figcaption className="mt-1.5 text-[0.8125rem] text-muted">
                        <Ph text={c.who} />
                      </figcaption>
                    </div>
                  </div>
                </figure>
              </article>
            );
          })}
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
