"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IsoIcon } from "@/components/brand/Iso";
import { Stitch } from "@/components/brand/Stitch";
import { ArrowUpRight } from "@/components/site/Navbar";
import { Cross, Rule } from "@/components/site/Rails";
import {
  AUTOMATABLE,
  FIRST_YEAR,
  GROWTH_MONTHLY,
  HOURS_MAX,
  INITIAL,
  RATE,
  SETUP_FEE,
  TASKS,
  estimate,
  usd,
} from "./roi";

const DEFAULT_HOURS = TASKS.map((t) => t.hours);
const hrs = (n: number) => `${n} ${n === 1 ? "hr" : "hrs"}`;
const fill = (v: number, min: number, max: number) => ({ "--fill": `${((v - min) / (max - min)) * 100}%` }) as CSSProperties;

/** Hours axis for the chart: room past the longest bar for its label, round tick steps. */
function axisFor(total: number, breakEven: number) {
  const top = Math.max(10, total, breakEven) * 1.2;
  const step = top <= 60 ? 10 : top <= 120 ? 20 : top <= 240 ? 50 : 100;
  const max = Math.ceil(top / step) * step;
  return { max, ticks: Array.from({ length: max / step + 1 }, (_, i) => i * step) };
}

type Api = { money: (cost: number, back: number) => void };

export function CostCalculator() {
  const root = useRef<HTMLElement>(null);
  const api = useRef<Api>({ money: () => {} });
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [rate, setRate] = useState(RATE.initial);
  const e = estimate(hours, rate);
  const axis = axisFor(e.total, e.breakEven);
  const at = (h: number) => `${(h / axis.max) * 100}%`;
  const dirty = rate !== RATE.initial || hours.some((h, i) => h !== DEFAULT_HOURS[i]);
  const paysOff = e.ratio >= 1;
  const lineInLeftHalf = e.breakEven / axis.max < 0.5;

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const reduced = prefersReducedMotion();
      const nodes = {
        cost: gsap.utils.toArray<HTMLElement>('[data-money="cost"]', el),
        back: gsap.utils.toArray<HTMLElement>('[data-money="back"]', el),
      };
      const chart = el.querySelector<HTMLElement>("[data-calc-chart]")!;
      // Money figures are written here (React renders only their first value), so they can glide.
      const shown = { cost: INITIAL.cost, back: INITIAL.back };
      const target = { cost: INITIAL.cost, back: INITIAL.back };
      let live = reduced;
      let tween: gsap.core.Tween | null = null;
      const write = () => {
        nodes.cost.forEach((n) => void (n.textContent = usd(shown.cost)));
        nodes.back.forEach((n) => void (n.textContent = usd(shown.back)));
      };

      api.current.money = contextSafe!((cost: number, back: number) => {
        target.cost = cost;
        target.back = back;
        if (!live) return;
        tween?.kill();
        if (reduced) {
          Object.assign(shown, target);
          write();
          return;
        }
        tween = gsap.to(shown, { cost, back, duration: 0.6, ease: "power3.out", onUpdate: write });
      });

      if (reduced) return () => void (api.current.money = () => {});

      // ---- the moment: when the calculator arrives, the bars grow and the money counts up
      shown.cost = 0;
      shown.back = 0;
      write();
      chart.dataset.pending = "";
      ScrollTrigger.create({
        trigger: el.querySelector("[data-calc-board]"),
        start: "top 72%",
        once: true,
        onEnter: () => {
          live = true;
          delete chart.dataset.pending;
          tween = gsap.to(shown, { ...target, duration: 1.3, ease: "power2.out", delay: 0.15, onUpdate: write });
        },
      });

      // ---- header: rises in, the eyebrow stitch is sewn (house beat)
      const owned: JSAnimation[] = [];
      const eyebrowThread = createDrawable(el.querySelectorAll<SVGPathElement>(".calc-eyebrow .stitch-thread"), 0, 0);
      gsap.from(gsap.utils.toArray("[data-calc-head]", el), {
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

      return () => {
        owned.forEach((a) => a.revert());
        api.current.money = () => {};
      };
    },
    { scope: root },
  );

  useEffect(() => {
    api.current.money(e.cost, e.back);
  }, [e.cost, e.back]);

  const setTask = (i: number, v: number) => setHours((h) => h.map((x, j) => (j === i ? v : x)));
  const reset = () => {
    setHours(DEFAULT_HOURS);
    setRate(RATE.initial);
  };

  const verdict =
    e.total === 0 ? (
      "Move a slider to see what your busywork costs."
    ) : paysOff ? (
      <>
        Our lowest setup fee plus a year of the Growth retainer comes to {usd(FIRST_YEAR)} USD. Every $1 returns about{" "}
        <b className="font-semibold text-ink">${e.ratio.toFixed(2)}</b>. It pays for itself once AI Weavers wins back {e.breakEven}{" "}
        hours a week.
      </>
    ) : (
      <>
        At these numbers our lowest setup fee plus a year of the Growth retainer would not pay for itself yet. It needs about{" "}
        <b className="font-semibold text-ink">{e.breakEven} hours a week</b> won back. We will tell you that plainly on the call.
      </>
    );

  return (
    <section ref={root} id="roi" aria-labelledby="roi-title" className="relative overflow-x-clip pt-24 last:pb-24 md:pt-32 md:last:pb-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-calc-head className="calc-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            Cost calculator
          </p>
          <div>
            <h2
              data-calc-head
              id="roi-title"
              className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              <span className="text-[#72727d]">What is busywork</span> <span className="text-ink">costing you?</span>
            </h2>
            <p data-calc-head className="mt-5 max-w-[52ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              Set the hours your whole team spends each week. The math updates as you go.
            </p>
          </div>
        </header>

        <Rule className="relative mt-12 md:mt-16" />
        <div data-calc-board className="grid md:border-x md:border-rail lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* ---------------- Inputs ---------------- */}
          <form onSubmit={(ev) => ev.preventDefault()} aria-labelledby="calc-hours-label" className="relative flex flex-col bg-white/40">
            {/* Phones: the result sits below the sliders, so a summary rides along while you drag. */}
            <div
              aria-hidden
              className="sticky top-0 z-[2] flex items-center justify-between gap-4 border-b border-rail bg-canvas/85 px-5 py-3 backdrop-blur-md md:px-8 lg:hidden"
            >
              <p className="text-[0.8125rem] font-medium text-graphite">
                <span data-money="cost" className="text-[1.0625rem] font-semibold tabular-nums tracking-[-0.02em] text-ink">
                  {usd(INITIAL.cost)}
                </span>{" "}
                a year
              </p>
              <p className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-graphite">
                <span className="size-[7px] rounded-full bg-signal" />
                <span data-money="back" className="font-semibold tabular-nums text-ink">
                  {usd(INITIAL.back)}
                </span>{" "}
                back
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 px-5 pb-4 pt-7 md:px-8 lg:px-10 lg:pt-9">
              <p id="calc-hours-label" className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
                Hours a week, whole team
              </p>
              <div className="flex items-center gap-3">
                {dirty && (
                  <button
                    type="button"
                    onClick={reset}
                    className="text-[0.8125rem] font-medium text-graphite underline-offset-4 transition-colors hover:text-ink hover:underline"
                  >
                    Reset
                  </button>
                )}
                <span className="rounded-full bg-ink px-2.5 py-1 text-[0.8125rem] font-semibold tabular-nums text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.16)]">
                  {hrs(e.total)}
                </span>
              </div>
            </div>

            {/* On wide screens the rows share whatever height the statement beside them needs. */}
            <ul className="flex flex-1 flex-col">
              {TASKS.map((t, i) => (
                <li
                  key={t.id}
                  className="grid flex-1 grid-cols-[44px_minmax(0,1fr)] content-center gap-x-4 border-t border-line px-5 py-4 md:px-8 lg:px-10"
                >
                  <span className="grid size-11 place-items-center rounded-[12px] bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
                    <IsoIcon name={t.icon} className="size-[38px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <label htmlFor={`calc-${t.id}`} className="text-pretty text-[0.9375rem] leading-snug text-ink">
                        {t.label}
                      </label>
                      <output htmlFor={`calc-${t.id}`} className="shrink-0 text-[0.9375rem] font-semibold tabular-nums text-ink">
                        {hrs(hours[i])}
                      </output>
                    </div>
                    <input
                      id={`calc-${t.id}`}
                      type="range"
                      min={0}
                      max={HOURS_MAX}
                      step={1}
                      value={hours[i]}
                      onChange={(ev) => setTask(i, Number(ev.target.value))}
                      aria-valuetext={`${hours[i]} hours a week`}
                      className="calc-range mt-1.5"
                      style={fill(hours[i], 0, HOURS_MAX)}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-x-4 border-t border-rail bg-sunken/60 px-5 py-5 md:px-8 lg:px-10">
              <span className="grid size-11 place-items-center rounded-[12px] bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
                <IsoIcon name="clock" className="size-[38px]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="calc-rate" className="text-pretty text-[0.9375rem] leading-snug text-ink">
                    Cost of one staff hour, wages plus overhead (USD)
                  </label>
                  <output htmlFor="calc-rate" className="shrink-0 text-[0.9375rem] font-semibold tabular-nums text-ink">
                    ${rate}
                  </output>
                </div>
                <input
                  id="calc-rate"
                  type="range"
                  min={RATE.min}
                  max={RATE.max}
                  step={RATE.step}
                  value={rate}
                  onChange={(ev) => setRate(Number(ev.target.value))}
                  aria-valuetext={`$${rate} an hour`}
                  className="calc-range mt-1.5"
                  style={fill(rate, RATE.min, RATE.max)}
                />
              </div>
            </div>
          </form>

          {/* ---------------- The statement ---------------- */}
          <div className="relative border-t border-rail bg-surface px-5 py-8 md:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-9">
            <Cross className="absolute left-0 top-0 z-[3] hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
            <Cross className="absolute bottom-0 left-0 z-[3] hidden -translate-x-1/2 translate-y-1/2 lg:block" />

            <p className="text-pretty text-[1rem] leading-[1.55] text-graphite">
              Your team spends{" "}
              <b className="font-semibold text-ink">
                {e.total} {e.total === 1 ? "hour" : "hours"}
              </b>{" "}
              a week on work software could do.
            </p>

            <p className="mt-6">
              <span
                data-money="cost"
                className="block text-[clamp(2.75rem,5vw,4.25rem)] font-semibold leading-[0.9] tracking-[-0.05em] tabular-nums text-ink"
              >
                {usd(INITIAL.cost)}
              </span>
              <span className="mt-2.5 block text-[0.9375rem] font-medium text-graphite">a year spent on busywork</span>
            </p>
            <p className="mt-1.5 text-[0.8125rem] tabular-nums text-muted">
              {hrs(e.total)} × ${rate} × 52 weeks
            </p>

            <dl className="mt-7 grid grid-cols-2 border-y border-line">
              <div className="flex flex-col-reverse justify-end py-4 pr-4">
                <dt className="mt-1 text-pretty text-[0.8125rem] leading-snug text-graphite">AI Weavers could win back each year</dt>
                <dd data-money="back" className="text-[1.625rem] font-semibold leading-none tracking-[-0.035em] tabular-nums text-ink">
                  {usd(INITIAL.back)}
                </dd>
              </div>
              <div className="flex flex-col-reverse justify-end border-l border-line py-4 pl-5">
                <dt className="mt-1 text-[0.8125rem] leading-snug text-graphite">back every week</dt>
                <dd className="text-[1.625rem] font-semibold leading-none tracking-[-0.035em] tabular-nums text-ink">{hrs(e.backHours)}</dd>
              </div>
            </dl>

            {/* Hours a week: what goes to busywork, what comes back, and the line it has to clear. */}
            <figure data-calc-chart data-pays={paysOff} className="calc-chart mt-7">
              <figcaption className="sr-only">
                {e.total} hours of busywork a week, {e.backHours} won back. It pays for itself at {e.breakEven} hours a week.
              </figcaption>
              <div aria-hidden className="relative grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
                <span className="text-[0.75rem] font-medium text-muted">Hours a week</span>
                <span className="h-5" />

                <span className="text-[0.8125rem] font-medium text-graphite">Busywork</span>
                <span className="relative h-[14px]">
                  <span className="calc-bar absolute inset-y-0 left-0 rounded-[4px] bg-[#d5d5dd]" style={{ width: at(e.total) }} />
                  <span className="calc-val absolute top-1/2 -translate-y-1/2 pl-2 text-[0.75rem] font-semibold tabular-nums text-ink" style={{ left: at(e.total) }}>
                    {e.total}
                  </span>
                </span>

                <span className="text-[0.8125rem] font-medium text-graphite">Won back</span>
                <span className="relative h-[14px]">
                  <span className="calc-bar absolute inset-y-0 left-0 rounded-[4px] bg-signal" style={{ width: at(AUTOMATABLE * e.total) }} />
                  <span
                    className="calc-val absolute top-1/2 -translate-y-1/2 pl-2 text-[0.75rem] font-semibold tabular-nums text-ink"
                    style={{ left: at(AUTOMATABLE * e.total) }}
                  >
                    {e.backHours}
                  </span>
                </span>

                <span />
                <span className="relative mt-1 h-4 border-t border-line">
                  {axis.ticks.map((t) => (
                    <span
                      key={t}
                      className="calc-tick absolute top-0 -translate-x-1/2 pt-1.5 text-[0.6875rem] tabular-nums text-muted"
                      style={{ left: at(t) }}
                    >
                      {t}
                    </span>
                  ))}
                </span>

                {/* break-even line over both bars */}
                <span className="pointer-events-none absolute inset-0 col-start-2 row-start-1 row-end-4">
                  <span className="calc-line absolute bottom-0 top-[1.375rem] w-0 border-l-[1.5px] border-dashed" style={{ left: at(e.breakEven) }} />
                  <span
                    className={`calc-line-label absolute top-0 whitespace-nowrap text-[0.75rem] font-semibold ${
                      lineInLeftHalf ? "pl-1.5" : "-translate-x-full pr-1.5"
                    }`}
                    style={{ left: at(e.breakEven) }}
                  >
                    Pays for itself at {hrs(e.breakEven)}
                  </span>
                </span>
              </div>
            </figure>

            <p aria-live="polite" className="mt-7 text-pretty text-[0.9375rem] leading-[1.6] text-graphite">
              {verdict}
            </p>
            {e.total > 0 && (
              <p className="mt-2 text-[0.8125rem] tabular-nums text-muted">
                {usd(SETUP_FEE)} setup fee + 12 × {usd(GROWTH_MONTHLY)} Growth retainer = {usd(FIRST_YEAR)}
              </p>
            )}

            <a href="#book" className="btn btn-primary mt-7 w-full justify-between">
              Check these numbers on a free call
              <span className="btn-icon">
                <ArrowUpRight />
              </span>
            </a>
            <p className="mt-4 text-pretty text-[0.8125rem] leading-[1.55] text-muted">
              Assumes 60% of these hours can be automated. Cost uses our lowest setup fee, and your quote may be higher. We measure your
              real numbers in the Weave Session.
            </p>
          </div>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
