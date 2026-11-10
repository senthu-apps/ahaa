"use client";

import { useRef } from "react";
import { IsoIcon } from "@/components/brand/Iso";
import { Cross, Rule } from "@/components/site/Rails";
import { PLANS, PLAN_ROWS, PRICING, PRICING_HEAD, BOOK } from "@/components/v2/content";
import { Arrow, SectionHead, useReveal } from "@/components/v2/parts";

/** Dollar figures in a line of small print set in ink and semibold, so the numbers read first. */
function Money({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\$[\d,]+)/g).map((part, i) =>
        part.startsWith("$") ? (
          <b key={i} className="font-semibold text-ink">
            {part}
          </b>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * 9 · Pricing — three plan cells on the grid, in the live tier language
 * (iso icon, name, price, quiet button; the featured plan on a white sheet
 * with an ink top edge and an ink tag). Pro carries "Recommended". Prices
 * are plain text — no reels, no currency label (doc design note). Below,
 * the setup fee and terms as one ledger row.
 */
export function Plans() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="pricing" aria-labelledby="price-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="price-title" {...PRICING_HEAD} />

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 grid md:mx-0 md:border-x md:border-rail lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <article
              key={p.name}
              data-featured={p.featured || undefined}
              data-spot
              aria-labelledby={`plan-${p.name.toLowerCase()}`}
              className={`price-tier relative flex flex-col ${i > 0 ? "border-t border-rail lg:border-l lg:border-t-0" : ""}`}
            >
              {i > 0 && (
                <>
                  <Cross className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
                  <Cross className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 lg:block" />
                </>
              )}
              {p.featured && <span aria-hidden className="price-tier-accent" />}

              <div data-rise className="flex flex-1 flex-col px-5 py-8 md:px-8 md:py-10 lg:px-8 lg:pb-10 lg:pt-8 xl:px-9">
                <div className="flex min-h-[3.25rem] items-start justify-between gap-4">
                  <IsoIcon name={p.icon} className="-ml-1 size-[3.25rem]" />
                  {p.featured && <span className="price-tag">{PRICING.badge}</span>}
                </div>
                <h3 id={`plan-${p.name.toLowerCase()}`} className="mt-5 text-[1.375rem] font-semibold leading-tight tracking-[-0.03em] text-ink">
                  {p.name}
                </h3>
                <p className="mt-1.5 text-[0.8125rem] font-medium text-muted">{PRICING.bestFor}</p>
                <p className="mt-0.5 text-pretty text-[0.9375rem] leading-[1.5] text-graphite">{p.bestFor}</p>

                <p className="mt-7 text-[0.8125rem] font-medium text-muted">{PRICING.monthlyFee}</p>
                <p className="mt-1.5 flex items-end gap-2">
                  <span className="text-[clamp(2.5rem,3.6vw,3rem)] font-semibold leading-none tracking-[-0.045em] tabular-nums text-ink">{p.price}</span>
                  <span className="pb-[0.3rem] text-[0.9375rem] leading-none text-muted">{PRICING.unit}</span>
                </p>

                <dl className="mt-7 border-t border-line">
                  {PLAN_ROWS.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-[0.9375rem]">
                      <dt className="text-graphite">{k}</dt>
                      <dd className="flex shrink-0 items-center gap-2 text-right font-medium text-ink">
                        {v === "Included" && (
                          <span className="price-check price-check-strong">
                            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                              <path d="M3 7.4 5.8 10 11 4.2" />
                            </svg>
                          </span>
                        )}
                        <span className={v.length > 14 ? "max-w-[11rem] text-pretty" : ""}>{v}</span>
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-auto pt-8">
                  <a href={BOOK} className={`price-cta ${p.featured ? "price-cta-primary" : ""}`}>
                    <span>{PRICING.button}</span>
                    <span className="price-cta-icon">
                      <Arrow />
                    </span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <Rule className="relative" />

        {/* the small print, as one ledger */}
        <div className="-mx-5 md:mx-0 md:border-x md:border-rail">
          <p data-rise className="max-w-[62ch] text-pretty px-5 pb-2 pt-8 text-[1rem] leading-[1.6] text-ink md:px-8 md:pt-10 lg:px-10">
            {PRICING.under}
          </p>
          <dl className="grid md:grid-cols-2">
            {(
              [
                ["Setup fee", PRICING.setup],
                ["Terms", PRICING.terms],
              ] as const
            ).map(([k, v], i) => (
              <div
                key={k}
                data-rise
                className={`px-5 py-6 md:px-8 md:pb-10 md:pt-7 lg:px-10 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""}`}
              >
                <dt className="text-[0.8125rem] font-medium text-muted">{k}</dt>
                <dd className="mt-2 text-pretty text-[0.9375rem] leading-[1.6] text-graphite">
                  <Money text={v} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
