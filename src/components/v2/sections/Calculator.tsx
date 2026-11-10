"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { IsoIcon, type IsoName } from "@/components/brand/Iso";
import { Cross, Rule } from "@/components/site/Rails";
import { CALC, CALC_HEAD, BOOK } from "@/components/v2/content";
import { SUBMIT } from "@/components/book/book";
import { Arrow, PrimaryButton, SectionHead, refreshSoon, useReveal } from "@/components/v2/parts";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const ratio = (n: number) => `$${n.toFixed(2)}`;
const fill = (v: number, min: number, max: number) => ({ "--fill": `${((v - min) / (max - min)) * 100}%` }) as CSSProperties;
const YEAR_ONE = CALC.setup + CALC.growthMonthly * 12; // $20,940

/** A figure that glides to its new value (GSAP writes the text; React renders only the first value). */
function Glide({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [first] = useState(value);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current!;
    if (prefersReducedMotion()) {
      el.textContent = format(value);
      shown.current = value;
      return;
    }
    const o = { v: shown.current };
    const t = gsap.to(o, {
      v: value,
      duration: 0.7,
      ease: "power3.out",
      onUpdate: () => {
        shown.current = o.v;
        el.textContent = format(o.v);
      },
    });
    return () => void t.kill();
  }, [value, format]);
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(first)}
    </span>
  );
}

function Slider({
  icon,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  valueText,
  note,
}: {
  icon: IsoName;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  valueText: string;
  note?: string;
}) {
  const id = useId();
  return (
    <li className="grid flex-1 grid-cols-[44px_minmax(0,1fr)] content-center gap-x-4 border-t border-line px-5 py-6 md:px-8 lg:px-10 lg:py-7">
      <span className="grid size-11 place-items-center rounded-[12px] bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
        <IsoIcon name={icon} className="size-[38px]" />
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={id} className="text-pretty text-[0.9375rem] leading-snug text-ink">
            {label}
          </label>
          <output htmlFor={id} className="shrink-0 text-[1.0625rem] font-semibold tabular-nums tracking-[-0.01em] text-ink">
            {display}
          </output>
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={valueText}
          className="calc-range mt-2"
          style={fill(value, min, max)}
        />
        <div aria-hidden className="mt-1 flex justify-between text-[0.6875rem] tabular-nums text-muted">
          <span>{valueText.startsWith("$") ? `$${min}` : valueText.endsWith("%") ? `${min}%` : min}</span>
          <span>{valueText.startsWith("$") ? `$${max}` : valueText.endsWith("%") ? `${max}%` : max}</span>
        </div>
        {note && <p className="mt-3 max-w-[54ch] text-pretty text-[0.8125rem] leading-[1.55] text-muted">{note}</p>}
      </div>
    </li>
  );
}

/**
 * 6 · Cost calculator — the live calculator's ledger + statement, with the
 * doc's three sliders and four results. Sliders left, results right (stacked
 * on phones, where a summary bar rides along). "Email me this estimate" opens
 * an inline form under the button.
 */
export function Calculator() {
  const root = useRef<HTMLElement>(null);
  const [hours, setHours] = useState(CALC.hours.initial);
  const [rate, setRate] = useState(CALC.rate.initial);
  const [share, setShare] = useState(CALC.share.initial);
  const [mailOpen, setMailOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useReveal(root);

  const cost = hours * rate * 52;
  const recover = cost * (share / 100);
  const perDollar = recover / YEAR_ONE;
  const max = Math.max(recover, YEAR_ONE);

  useEffect(() => refreshSoon(), [mailOpen, sent]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Enter a work email, like you@company.com.");
    if (!company) return setErr("Add your company name.");
    setErr(null);
    setBusy(true);
    try {
      const notes = `Estimate: ${hours} hrs/week × ${rate}/hr × 52 = ${usd(cost)} a year; ${share}% recoverable = ${usd(recover)}; year-one cost ${usd(YEAR_ONE)}; ${ratio(perDollar)} back per $1.`;
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "estimate", name: "", email, company, notes, website: "" }),
      });
      if (!res.ok) throw new Error(`book answered ${res.status}`);
      setSent(true);
    } catch {
      setErr(SUBMIT.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section ref={root} id="calculator" aria-labelledby="calc-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="calc-title" {...CALC_HEAD} />

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 grid md:mx-0 md:border-x md:border-rail lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* ---------------- sliders ---------------- */}
          <form onSubmit={(e) => e.preventDefault()} aria-label="Your numbers" className="relative flex flex-col bg-white/40">
            <div
              aria-hidden
              className="sticky top-[72px] z-[2] flex items-center justify-between gap-4 border-b border-rail bg-canvas/85 px-5 py-3 backdrop-blur-md md:px-8 lg:hidden"
            >
              <p className="text-[0.8125rem] font-medium text-graphite">
                <span className="text-[1.0625rem] font-semibold tabular-nums tracking-[-0.02em] text-ink">{usd(cost)}</span> a year
              </p>
              <p className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-graphite">
                <span className="size-[7px] rounded-full bg-signal" />
                <span className="font-semibold tabular-nums text-ink">{usd(recover)}</span> back
              </p>
            </div>
            <ul className="flex flex-1 flex-col [&>li:first-child]:border-t-0">
              <Slider
                icon="clock"
                label={CALC.hours.label}
                value={hours}
                min={CALC.hours.min}
                max={CALC.hours.max}
                step={CALC.hours.step}
                onChange={setHours}
                display={`${hours} hrs`}
                valueText={`${hours} hours a week`}
              />
              <Slider
                icon="coins"
                label={CALC.rate.label}
                value={rate}
                min={CALC.rate.min}
                max={CALC.rate.max}
                step={CALC.rate.step}
                onChange={setRate}
                display={`$${rate}`}
                valueText={`$${rate} an hour`}
              />
              <Slider
                icon="meter"
                label={CALC.share.label}
                value={share}
                min={CALC.share.min}
                max={CALC.share.max}
                step={CALC.share.step}
                onChange={setShare}
                display={`${share}%`}
                valueText={`${share}%`}
                note={CALC.share.note}
              />
            </ul>
          </form>

          {/* ---------------- results ---------------- */}
          <div className="relative border-t border-rail bg-surface px-5 py-8 md:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-9">
            <Cross className="absolute left-0 top-0 z-[3] hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
            <Cross className="absolute bottom-0 left-0 z-[3] hidden -translate-x-1/2 translate-y-1/2 lg:block" />

            <p className="text-[0.9375rem] font-medium text-graphite">{CALC.results.cost}</p>
            <p className="mt-2">
              <Glide
                value={cost}
                format={usd}
                className="block text-[clamp(2.75rem,5vw,4.25rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-ink"
              />
            </p>
            <p className="mt-2.5 text-[0.8125rem] tabular-nums text-muted">
              {hours} hrs × ${rate} × 52 weeks
            </p>

            <dl className="mt-7 grid grid-cols-2 border-y border-line">
              <div className="flex flex-col-reverse justify-end py-4 pr-4">
                <dt className="mt-1.5 text-pretty text-[0.8125rem] leading-snug text-graphite">{CALC.results.recover}</dt>
                <dd className="flex items-center gap-2 text-[1.625rem] font-semibold leading-none tracking-[-0.035em] text-ink">
                  <span aria-hidden className="size-[7px] rounded-full bg-signal" />
                  <Glide value={recover} format={usd} />
                </dd>
              </div>
              <div className="flex flex-col-reverse justify-end border-l border-line py-4 pl-5">
                <dt className="mt-1.5 text-pretty text-[0.8125rem] leading-snug text-graphite">{CALC.results.ratio}</dt>
                <dd className="text-[1.625rem] font-semibold leading-none tracking-[-0.035em] text-ink">
                  <Glide value={perDollar} format={ratio} />
                </dd>
              </div>
              <div className="col-span-2 flex flex-col-reverse justify-end border-t border-line py-4">
                <dt className="mt-1.5 text-pretty text-[0.8125rem] leading-snug text-graphite">{CALC.results.yearOne}</dt>
                <dd className="flex items-baseline justify-between gap-3">
                  <span className="text-[1.625rem] font-semibold leading-none tracking-[-0.035em] tabular-nums text-ink">{usd(YEAR_ONE)}</span>
                  <span className="text-[0.75rem] tabular-nums text-muted">
                    {usd(CALC.setup)} + 12 × {usd(CALC.growthMonthly)}
                  </span>
                </dd>
              </div>
            </dl>

            {/* what a year costs vs what comes back, on one scale, each bar carrying its figure */}
            <div aria-hidden className="mt-6 grid grid-cols-[5.75rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 text-[0.75rem] font-medium text-graphite">
              <span>Year-one cost</span>
              <span className="relative h-[10px]">
                <span className="calc-compare-bar absolute inset-y-0 left-0 bg-[#d5d5dd]" style={{ width: `${(YEAR_ONE / max) * 100}%` }} />
              </span>
              <span className="tabular-nums text-ink">{usd(YEAR_ONE)}</span>
              <span>You can recover</span>
              <span className="relative h-[10px]">
                <span className="calc-compare-bar absolute inset-y-0 left-0 bg-signal" style={{ width: `${(recover / max) * 100}%` }} />
              </span>
              <Glide value={recover} format={usd} className="text-ink" />
            </div>

            <PrimaryButton href={BOOK} className="mt-7 w-full justify-between whitespace-normal text-left">
              {CALC.primary}
            </PrimaryButton>
            <button
              type="button"
              aria-expanded={mailOpen}
              aria-controls="calc-mail"
              onClick={() => setMailOpen((v) => !v)}
              className="price-cta mt-3 w-full"
            >
              <span>{CALC.secondary}</span>
              <span className="price-cta-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={`transition-transform duration-300 ${mailOpen ? "rotate-180" : ""}`}>
                  <path d="M3.5 5.5 7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <div id="calc-mail" className="calc-mail" data-open={mailOpen}>
              <div className="min-h-0 overflow-hidden">
                {sent ? (
                  <p role="status" className="mt-4 flex items-start gap-2.5 rounded-[12px] bg-sunken px-4 py-3.5 text-[0.9375rem] leading-[1.5] text-ink shadow-[inset_0_0_0_1px_var(--line)]">
                    <span className="mt-[0.2em] grid size-[18px] shrink-0 place-items-center rounded-full bg-ink text-white">
                      <svg viewBox="0 0 14 14" className="size-2.5" fill="none" aria-hidden>
                        <path d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {CALC.sent}
                  </p>
                ) : (
                  <form noValidate onSubmit={submit} aria-label={CALC.secondary} className="grid gap-3 pt-4">
                    <div>
                      <label htmlFor="calc-email" className="book-label">
                        {CALC.form.email}
                      </label>
                      <div className="book-control">
                        <input id="calc-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" className="book-input" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="calc-company" className="book-label">
                        {CALC.form.company}
                      </label>
                      <div className="book-control">
                        <input id="calc-company" name="company" autoComplete="organization" placeholder="Business name" className="book-input" />
                      </div>
                    </div>
                    {err && <p className="book-err">{err}</p>}
                    <button type="submit" disabled={busy} className="btn btn-primary mt-1 w-full justify-between disabled:opacity-60">
                      {busy ? SUBMIT.sending : CALC.form.send}
                      <span className="btn-icon">
                        <Arrow white />
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
