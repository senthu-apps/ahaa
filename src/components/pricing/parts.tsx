import { IsoIcon } from "@/components/brand/Iso";
import { Cross } from "@/components/site/Rails";
import { PAY_STEPS, UNIT, type Tier } from "./plans";

/*
 * Pricing parts: static markup only. The rendered HTML is the END state
 * (what no-JS and reduced-motion visitors see); Pricing.tsx rewinds and
 * plays it.
 */

/* ------------------------------------------------------------------ */
/* Small parts                                                         */
/* ------------------------------------------------------------------ */

function Tick({ className = "size-3" }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The house up-right arrow, in currentColor (ink on the quiet buttons, white on the featured one). */
function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DIGITS = Array.from({ length: 20 }, (_, i) => i % 10);

/**
 * A price whose digits sit on reels (0–9 twice). Rendered on the second
 * copy of each digit, so the script can spin every reel one full turn and
 * land where it started.
 */
export function Price({ value }: { value: number }) {
  const text = `$${value.toLocaleString("en-US")}`;
  return (
    <span className="price-figure">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="flex">
        {[...text].map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="price-digit">
              <span data-reel={ch} className="price-reel" style={{ transform: `translateY(${-(10 + Number(ch)) * 5}%)` }}>
                {DIGITS.map((d, j) => (
                  <span key={j}>{d}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i} className="price-char">
              {ch}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 01 · How the setup fee is paid                                      */
/* ------------------------------------------------------------------ */

function NodeMark({ live }: { live?: boolean }) {
  return live ? <span className="size-[7px] rounded-full bg-white" /> : <Tick className="size-[11px]" />;
}

/**
 * Three steps on one thread: Weave Session → quote approved (half up front)
 * → launch (half at launch). The last line runs on, live, into the retainer.
 * Horizontal from md; a vertical list on phones.
 */
export function PayStepper() {
  return (
    <ol data-pay className="grid md:grid-cols-3">
      {PAY_STEPS.map((s) => (
        <li key={s.event} data-pay-step className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4 pb-9 last:pb-0 md:block md:pb-0">
          <IsoIcon name={s.icon} className="pay-icon hidden size-14 md:mb-5 md:block" />

          {/* node + the line on to the next step */}
          <div className="relative md:flex md:h-6 md:items-center">
            <span data-pay-node data-on="true" data-live={s.live || undefined} className="pay-node">
              <NodeMark live={s.live} />
            </span>
            <span data-pay-line className={`pay-line pay-line-${s.line}`}>
              <span className="pay-fill" />
              {s.line === "live" && <span className="pay-head" />}
              <span data-pay-chip data-live={s.live || undefined} className="pay-chip hidden md:inline-flex">
                {s.chip}
              </span>
            </span>
          </div>

          <div className="pt-0.5 md:mt-4 md:pr-8 md:pt-0">
            <p data-pay-text className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
              {s.event}
            </p>
            <p data-pay-text className="mt-0.5 text-[0.9375rem] text-graphite">
              {s.pay}
            </p>
            <span data-pay-chip data-live={s.live || undefined} className="pay-chip mt-3 md:hidden">
              {s.chip}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* 02 · Retainer tiers                                                 */
/* ------------------------------------------------------------------ */

export function TierCell({ tier, index }: { tier: Tier; index: number }) {
  const divided = index > 0;
  return (
    <article
      data-tier
      data-featured={tier.featured || undefined}
      aria-labelledby={`tier-${tier.name.toLowerCase()}`}
      className={`price-tier relative flex flex-col ${divided ? "border-t border-rail lg:border-l lg:border-t-0" : ""}`}
    >
      {divided && (
        <>
          <Cross className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
          <Cross className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 lg:block" />
        </>
      )}
      {tier.featured && <span aria-hidden className="price-tier-accent" />}

      <div className="flex flex-1 flex-col px-5 py-8 md:grid md:grid-cols-2 md:gap-x-12 md:px-8 md:py-10 lg:flex lg:px-8 lg:pb-10 lg:pt-8 xl:px-9">
        <div data-pr-rise className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <IsoIcon name={tier.icon} className="-ml-1 size-[3.25rem]" />
            <span data-tier-tag className="price-tag">
              {tier.tag}
            </span>
          </div>
          <h3 id={`tier-${tier.name.toLowerCase()}`} className="mt-5 text-[1.375rem] font-semibold leading-tight tracking-[-0.03em] text-ink">
            {tier.name}
          </h3>
          {/* two lines held at lg, so the three price rows line up */}
          <p className="mt-1.5 max-w-[34ch] text-pretty text-[0.9375rem] leading-[1.5] text-graphite lg:min-h-[3em]">{tier.audience}</p>

          <p className="mt-7 flex items-end gap-2.5">
            <Price value={tier.price} />
            <span className="pb-[0.3rem] text-[0.875rem] leading-none text-muted">{UNIT}</span>
          </p>

          <a href="#book" className={`price-cta mt-7 ${tier.featured ? "price-cta-primary" : ""}`}>
            <span>Start with {tier.name}</span>
            <span className="price-cta-icon">
              <Arrow />
            </span>
          </a>
        </div>

        <ul
          data-pr-rise
          className="mt-8 space-y-3.5 border-t border-line pt-7 text-[0.9375rem] leading-[1.45] md:mt-1 md:border-t-0 md:pt-0 lg:mt-8 lg:border-t lg:pt-7"
        >
          <li className="flex gap-3 font-semibold text-ink">
            <span className="price-check price-check-strong">
              <svg data-tier-check viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7.4 5.8 10 11 4.2" />
              </svg>
            </span>
            {tier.builds}
          </li>
          {tier.inherits && (
            <li className="flex gap-3 text-ink">
              <span className="price-check price-check-plus" aria-hidden="true">
                <svg viewBox="0 0 14 14" fill="none">
                  <path d="M7 3.2v7.6M3.2 7h7.6" />
                </svg>
              </span>
              {tier.inherits}
            </li>
          )}
          {tier.features.map((f) => (
            <li key={f} className="flex gap-3 text-graphite">
              <span className="price-check">
                <svg data-tier-check viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7.4 5.8 10 11 4.2" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
