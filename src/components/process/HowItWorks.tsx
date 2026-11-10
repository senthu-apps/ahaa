"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Frame } from "@/components/brand/Frame";
import { Stitch } from "@/components/brand/Stitch";
import { DemoCard, SampleData } from "@/components/services/demos";
import { ArrowUpRight } from "@/components/site/Navbar";
import { Cross, Rule } from "@/components/site/Rails";
import { CARDS } from "./cards";
import { CARD_TIMELINES } from "./cardTimelines";
import { LIVE_AT, STEPS } from "./steps";

const COUNT = STEPS.length;
const LAST = COUNT - 1;
const DESKTOP = "(min-width: 64rem)";
const num = (i: number) => String(i + 1).padStart(2, "0");
const idx = (i: number) => ({ "--i": i }) as CSSProperties;

type Where = "stage" | "inline";
type Api = { show: (i: number) => void; replay: (i: number, where: Where) => void };
const NOOP: Api = { show: () => {}, replay: () => {} };

function ClockGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.8V8l2.2 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A step's card: framed, titled, replayable. The markup is its end state. */
function StepCard({ i, onReplay }: { i: number; onReplay: () => void }) {
  const Body = CARDS[i];
  return (
    <div data-hc-frame>
      <Frame>
        <DemoCard title={STEPS[i].card} onReplay={onReplay} footer={<SampleData />}>
          <Body />
        </DemoCard>
      </Frame>
    </div>
  );
}

/**
 * How it works — five steps, each with an animated card that follows one
 * sample project from the first call to the retainer.
 *
 * Desktop: the cards share a sticky stage and cross-fade as the reading line
 * moves through the steps; the active card plays its story. Phones: each
 * step carries its card inline and plays it as it scrolls in. `--hw-p`
 * (0 → 5, where the reading line is) sews the running stitch between the
 * step numbers and fills the stage's stepper.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const jump = useRef<(i: number) => void>(() => {});
  const api = useRef<Api>(NOOP);
  const [at, setAt] = useState({ active: 0, finished: false });

  useGSAP(
    () => {
      const el = root.current!;
      const reduced = prefersReducedMotion();
      let shown = "";
      const apply = (p: number) => {
        el.style.setProperty("--hw-p", p.toFixed(4));
        const active = Math.min(LAST, Math.floor(p + 1e-4));
        const finished = p >= COUNT - 1e-3;
        const key = `${active}:${finished}`;
        if (key !== shown) {
          shown = key;
          setAt({ active, finished });
        }
      };

      // The reading line: mid-screen beside the stage on desktop, a little lower on phones.
      const lineY = () => window.innerHeight * (window.matchMedia(DESKTOP).matches ? 0.5 : 0.62);
      const measure = () => {
        const y = lineY();
        let p = 0;
        for (let i = 0; i < COUNT; i++) {
          const node = stepRefs.current[i];
          if (!node) break; // unmounting
          const r = node.getBoundingClientRect();
          if (y >= r.bottom) {
            p = i + 1;
            continue;
          }
          if (y >= r.top) p = i + (y - r.top) / r.height;
          break;
        }
        return Math.min(COUNT, p);
      };

      jump.current = (i: number) => {
        const item = stepRefs.current[i];
        if (!item) return;
        const r = item.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + r.top + r.height * 0.35 - lineY(), behavior: reduced ? "auto" : "smooth" });
      };

      if (reduced) {
        // Every card shows its finished state; the stitch is sewn all the way.
        apply(COUNT);
        return () => void (jump.current = () => {});
      }

      const proxy = { p: 0 };
      const follow = gsap.quickTo(proxy, "p", { duration: 0.6, ease: "power3.out", onUpdate: () => apply(proxy.p) });
      ScrollTrigger.create({
        trigger: el.querySelector("[data-hw-steps]"),
        start: "top bottom",
        end: "bottom top",
        onUpdate: () => follow(measure()),
        onRefresh: () => follow(measure()),
      });

      // ---- card playback: each run rebuilds its card's timeline from the start state.
      // Deliberately NOT contextSafe: it is called from ScrollTrigger callbacks inside
      // gsap.matchMedia, and a contextSafe call there would nest this component's context
      // inside the matchMedia context it already contains (a cycle — revert recurses forever).
      // Runs are tracked here and killed by each matchMedia cleanup instead.
      const runs = new Map<HTMLElement, gsap.core.Timeline>();
      const cardsIn = (where: Where) => gsap.utils.toArray<HTMLElement>(`[data-hw-${where}] [data-hw-card]`, el);
      const play = (card: HTMLElement, i: number) => {
        runs.get(card)?.kill();
        const tl = CARD_TIMELINES[i](card);
        runs.set(card, tl);
        tl.play(0);
      };

      const mm = gsap.matchMedia();
      mm.add(DESKTOP, () => {
        const cards = cardsIn("stage");
        let current = -1;
        let ready = false;
        const show = (i: number) => {
          if (i === current) return;
          current = i;
          if (ready) play(cards[i], i);
        };
        // The first card waits for the stage to come into view.
        ScrollTrigger.create({
          trigger: el.querySelector("[data-hw-stage]"),
          start: "top 70%",
          once: true,
          onEnter: () => {
            ready = true;
            const i = Math.max(0, current);
            current = i;
            play(cards[i], i);
          },
        });
        api.current = {
          show,
          replay: (i, where) => where === "stage" && play(cards[i], i),
        };
        show(Math.min(LAST, Math.floor(measure())));
        return () => {
          api.current = NOOP;
          runs.forEach((tl) => tl.kill());
        };
      });
      mm.add(`not all and ${DESKTOP}`, () => {
        const cards = cardsIn("inline");
        cards.forEach((card, i) =>
          ScrollTrigger.create({ trigger: card, start: "top 82%", once: true, onEnter: () => play(card, i) }),
        );
        api.current = { show: () => {}, replay: (i, where) => where === "inline" && play(cards[i], i) };
        return () => {
          api.current = NOOP;
          runs.forEach((tl) => tl.kill());
        };
      });

      // ---- header: rises in, the eyebrow stitch is sewn (house beat)
      const owned: JSAnimation[] = [];
      const eyebrowThread = createDrawable(el.querySelectorAll<SVGPathElement>(".hw-eyebrow .stitch-thread"), 0, 0);
      gsap.from(gsap.utils.toArray("[data-hw-head]", el), {
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
        mm.revert();
        owned.forEach((a) => a.revert());
        jump.current = () => {};
      };
    },
    { scope: root },
  );

  // The active step's card takes the stage.
  useEffect(() => {
    api.current.show(at.active);
  }, [at.active]);

  const stateOf = (i: number) => (i < at.active || (at.finished && i === LAST) ? "done" : i === at.active ? "now" : "next");
  const live = at.active >= LIVE_AT - 1;

  return (
    <section ref={root} id="how-it-works" aria-labelledby="how-title" className="relative overflow-x-clip pt-24 last:pb-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-hw-head className="hw-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            How it works
          </p>
          <div>
            <h2
              data-hw-head
              id="how-title"
              className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              <span className="text-[#72727d]">From first call to a fixed price,</span> <span className="text-ink">then live.</span>
            </h2>
            <p data-hw-head className="mt-5 max-w-[56ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              No discovery phase you pay for. No hourly billing. You talk to us, you get a price, then things start getting done.
            </p>
          </div>
        </header>

        <Rule className="relative mt-12 md:mt-16" />
        <div className="grid md:border-x md:border-rail lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* ---------------- The stage (desktop) ---------------- */}
          <div data-hw-stage className="relative hidden lg:order-last lg:block lg:border-l lg:border-rail">
            <Cross className="absolute left-0 top-0 z-[4] -translate-x-1/2 -translate-y-1/2" />
            <Cross className="absolute bottom-0 left-0 z-[4] -translate-x-1/2 translate-y-1/2" />
            <div className="sticky top-[max(2rem,calc(50vh-20.5rem))] flex h-[min(41rem,calc(100vh-4rem))] flex-col">
              <div className="flex items-center justify-between gap-4 px-10 pt-7">
                <p className="text-[0.8125rem] font-medium tabular-nums text-graphite">
                  Step {at.active + 1} of {COUNT}
                </p>
                <p
                  data-on={live}
                  className="hw-live flex items-center gap-2 rounded-full bg-surface py-1 pl-2.5 pr-3 text-[0.75rem] font-semibold text-ink shadow-[0_0_0_1px_var(--line-strong)]"
                >
                  <span className="relative size-[7px]">
                    <span className="absolute inset-0 rounded-full bg-signal" />
                    <span className="wb-ping absolute inset-0 rounded-full bg-signal" />
                  </span>
                  Live
                </p>
              </div>

              <div className="relative grid min-h-0 flex-1 place-items-center px-10">
                <div aria-hidden className="fp-dots absolute inset-0" />
                <div className="relative grid w-full max-w-[27rem]">
                  {STEPS.map((s, i) => (
                    <div
                      key={s.card}
                      data-hw-card
                      data-state={i === at.active ? "active" : "inactive"}
                      inert={i !== at.active}
                      className="hw-card col-start-1 row-start-1 self-center"
                    >
                      <StepCard i={i} onReplay={() => api.current.replay(i, "stage")} />
                    </div>
                  ))}
                </div>
              </div>

              <nav aria-label="Steps" className="flex gap-3 px-10 pb-7">
                {STEPS.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => jump.current(i)}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    aria-current={i === at.active ? "step" : undefined}
                    data-state={stateOf(i)}
                    style={idx(i)}
                    className="hw-seg flex flex-1 flex-col gap-1.5 rounded-[6px] py-1 text-left"
                  >
                    <span className="text-[0.6875rem] font-semibold tabular-nums transition-colors">{num(i)}</span>
                    <span className="relative h-[3px] overflow-hidden rounded-full bg-line-strong/70">
                      <span className="hw-seg-fill absolute inset-0 origin-left rounded-full" />
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ---------------- The steps ---------------- */}
          <div data-hw-inline className="bg-white/40">
            <ol data-hw-steps aria-label="How it works, step by step">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  ref={(node) => {
                    stepRefs.current[i] = node;
                  }}
                  data-state={stateOf(i)}
                  aria-current={i === at.active && !at.finished ? "step" : undefined}
                  style={idx(i)}
                  className="hw-step relative grid grid-cols-[2.5rem_minmax(0,1fr)] content-start gap-x-5 px-[var(--pad)] pb-14 pt-[var(--top)] [--pad:1.25rem] [--top:2.5rem] md:[--pad:2rem] lg:min-h-[56vh] lg:[--pad:2.5rem] lg:[--top:3.5rem]"
                >
                  {/* the running stitch to the next step: a marked line, sewn over in orange as you read on */}
                  {i < LAST && (
                    <span aria-hidden className="absolute left-[calc(var(--pad)+1.25rem)] top-[calc(var(--top)+2.75rem)] h-[calc(100%-3rem)]">
                      <span className="hw-under absolute inset-y-0 -left-px w-[2px]" />
                      <span className="hw-thread absolute inset-y-0 -left-[1.5px] w-[3px]" />
                    </span>
                  )}
                  <span className="hw-hole relative z-[1] grid size-10 place-items-center rounded-full text-[0.875rem] font-semibold tabular-nums">
                    {num(i)}
                  </span>
                  <div className="min-w-0 pt-1.5">
                    <h3 className="hw-title text-pretty text-[clamp(1.375rem,2.1vw,1.75rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                      {s.title}
                    </h3>
                    <p className="mt-3 max-w-[44ch] text-pretty text-[1rem] leading-[1.6] text-graphite">{s.body}</p>
                    <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[0.8125rem] font-medium text-ink shadow-[0_0_0_1px_var(--line-strong)]">
                      <span className="text-muted">
                        <ClockGlyph />
                      </span>
                      {s.foot}
                    </p>
                    {/* phones: the step's card sits right under it */}
                    <div data-hw-card className="mt-8 max-w-[27rem] px-[9px] lg:hidden">
                      <StepCard i={i} onReplay={() => api.current.replay(i, "inline")} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="border-t border-line px-5 py-10 md:px-8 lg:flex lg:min-h-[18rem] lg:flex-col lg:justify-center lg:px-10">
              <p className="max-w-[34ch] text-pretty text-[1.0625rem] leading-[1.55] text-graphite">
                A 30-minute call. You leave with a written plan, whether you hire us or not.
              </p>
              <a href="#book" className="btn btn-primary mt-6 self-start">
                Book your free Weave Session
                <span className="btn-icon">
                  <ArrowUpRight />
                </span>
              </a>
            </div>
          </div>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
